#include "WNTOceanDetailActor.h"

#include "Materials/MaterialInstanceDynamic.h"
#include "Materials/MaterialInterface.h"
#include "ProceduralMeshComponent.h"

namespace
{
    struct FWave { double Wavelength, Amplitude, DirectionX, DirectionY; };
    // Metres; three resolved gravity swells, followed by five normal-only wind-noise scales.
    // Dispersion/advection uses omega^2=g*k. This is cosmetic water, not a sea-state simulation.
    constexpr FWave Waves[] = {
        {180.0,.35,1.0,.37}, {89.0,.17,.76,-.65}, {47.0,.08,-.18,.98},
        // Short wind packets share a prevailing direction with a modest spread.
        {7.3,.014,.92,.39}, {3.1,.009,.80,.60}, {1.37,.0052,1.0,.17},
        {.61,.0024,.85,.525}, {.27,.0009,.96,.28}
    };
    double Smooth(double Minimum,double Maximum,double Value)
    {
        const double T=FMath::Clamp((Value-Minimum)/(Maximum-Minimum),0.0,1.0);
        return T*T*(3.0-2.0*T);
    }
}

AWNTOceanDetailActor::AWNTOceanDetailActor()
{
    PrimaryActorTick.bCanEverTick=false;
    Surface=CreateDefaultSubobject<UProceduralMeshComponent>(TEXT("NearWaterSurface"));
    SetRootComponent(Surface);
    Surface->SetMobility(EComponentMobility::Movable);
    Surface->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Surface->SetCastShadow(false);
    Surface->SetAffectDistanceFieldLighting(false);
    // Vertex displacement is at most 60 cm; expand the flat mesh's culling bounds.
    Surface->SetBoundsScale(1.01f);
    SetActorHiddenInGame(true);
}

bool AWNTOceanDetailActor::Initialize(FString& OutError)
{
    auto* Far=LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Materials/M_OceanFar.M_OceanFar"));
    auto* Detail=LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Materials/M_OceanDetail.M_OceanDetail"));
    if(!Far||!Detail)
    {
        OutError=TEXT("Missing detailed water materials. Run Unreal asset preparation, including PrepareOceanDetail.py.");
        return false;
    }
    FarMaterial=UMaterialInstanceDynamic::Create(Far,this);
    DetailMaterial=UMaterialInstanceDynamic::Create(Detail,this);
    Surface->SetMaterial(0,DetailMaterial);
    if(!Surface->GetProcMeshSection(0))
    {
        const int32 Side=GridIntervals+1;
        TArray<FVector> Vertices,Normals;TArray<FVector2D> UVs;
        TArray<int32> Indices;TArray<FLinearColor> Colours;TArray<FProcMeshTangent> Tangents;
        Vertices.Reserve(Side*Side);Indices.Reserve(GridIntervals*GridIntervals*6);
        for(int32 Y=0;Y<Side;++Y)for(int32 X=0;X<Side;++X)
        {
            const FVector Point((X-GridIntervals*.5)*GridSpacingCentimetres,(Y-GridIntervals*.5)*GridSpacingCentimetres,0);
            Vertices.Add(Point);Normals.Add(FVector::UpVector);UVs.Emplace(double(X)/GridIntervals,double(Y)/GridIntervals);
            Colours.Add(FLinearColor::White);Tangents.Emplace(FVector::ForwardVector,false);
        }
        for(int32 Y=0;Y<GridIntervals;++Y)for(int32 X=0;X<GridIntervals;++X)
        {
            const int32 A=Y*Side+X,B=A+1,C=A+Side,D=C+1;
            // Unreal's upward-facing front winding is clockwise.
            Indices.Append({A,C,B,B,C,D});
        }
        Surface->CreateMeshSection_LinearColor(0,Vertices,Indices,Normals,UVs,Colours,Tangents,false,false);
        // A planar section otherwise has zero height in its local render bounds.
        FProcMeshSection Section=*Surface->GetProcMeshSection(0);
        Section.SectionLocalBox=Section.SectionLocalBox.ExpandBy(FVector(0,0,100));
        Surface->SetProcMeshSection(0,Section);
    }
    for(int32 Index=0;Index<UE_ARRAY_COUNT(Waves);++Index)
    {
        const auto& Wave=Waves[Index];const FVector2D Direction=FVector2D(Wave.DirectionX,Wave.DirectionY).GetSafeNormal();
        const double K=2.0*UE_DOUBLE_PI/Wave.Wavelength;
        const FLinearColor Spectrum(Direction.X*K,Direction.Y*K,Wave.Amplitude,0);
        const FName Parameter(*FString::Printf(TEXT("Wave%d"),Index));
        FarMaterial->SetVectorParameterValue(Parameter,Spectrum);DetailMaterial->SetVectorParameterValue(Parameter,Spectrum);
    }
    UpdateParameters(FVector2D::ZeroVector,0);
    SetActive(false);
    return true;
}

void AWNTOceanDetailActor::SetActive(bool bEnabled)
{
    bActive=bEnabled;SetActorHiddenInGame(!bEnabled);
    if(FarMaterial)FarMaterial->SetScalarParameterValue(TEXT("PatchActive"),bEnabled?1.f:0.f);
    if(DetailMaterial)DetailMaterial->SetScalarParameterValue(TEXT("PatchActive"),bEnabled?1.f:0.f);
}

void AWNTOceanDetailActor::SetSceneVisible(bool bVisible)
{
    if(!bVisible)SetActive(false);
}

void AWNTOceanDetailActor::UpdateParameters(const FVector2D& Centre,double Strength)
{
    if(!FarMaterial||!DetailMaterial)return;
    // Split world coordinates before subtracting in the material's LWC expression graph.
    // Direct float world positions lose small ripples at strategic-map coordinates.
    const FLinearColor High(float(Centre.X),float(Centre.Y),0,0);
    const FLinearColor Low(float(Centre.X-double(High.R)),float(Centre.Y-double(High.G)),0,0);
    // Both shader noise grids wrap on integral 1024-cell periods. Reducing the
    // origin keeps centimetre precision without dragging the wind patches.
    const FLinearColor NoiseOrigin(float(FMath::Fmod(Centre.X*.01,65536.0)),float(FMath::Fmod(Centre.Y*.01,65536.0)),0,0);
    float Phase[8];
    FLinearColor WindOrigins[5];
    for(int32 Index=0;Index<UE_ARRAY_COUNT(Waves);++Index)
    {
        const auto& Wave=Waves[Index];const FVector2D Direction=FVector2D(Wave.DirectionX,Wave.DirectionY).GetSafeNormal();
        const double K=2.0*UE_DOUBLE_PI/Wave.Wavelength;
        // Keep both location and time in double until reducing phase; the field stays
        // anchored while the camera-local mesh moves by whole 8-metre cells.
        Phase[Index]=float(FMath::Fmod(FVector2D::DotProduct(Centre*.01,Direction)*K-FMath::Sqrt(9.81*K)*ElapsedSeconds,2.0*UE_DOUBLE_PI));
        if(Index>=3)
        {
            const FVector2D CrestDirection(-Direction.Y,Direction.X);
            const double Speed=FMath::Sqrt(9.81/K);
            // Rotated, anisotropic noise coordinates are reduced in their own
            // periodic lattice, so neither camera travel nor time wrapping pops.
            const double Along=(FVector2D::DotProduct(Centre*.01,Direction)-Speed*ElapsedSeconds)/Wave.Wavelength;
            const double Across=FVector2D::DotProduct(Centre*.01,CrestDirection)*.35/Wave.Wavelength;
            WindOrigins[Index-3]=FLinearColor(float(FMath::Fmod(Along,1024.0)),float(FMath::Fmod(Across,1024.0)),0,0);
        }
    }
    for(auto* Material:{FarMaterial.Get(),DetailMaterial.Get()})
    {
        Material->SetVectorParameterValue(TEXT("PatchCentreHigh"),High);
        Material->SetVectorParameterValue(TEXT("PatchCentreLow"),Low);
        Material->SetVectorParameterValue(TEXT("WaveNoiseOrigin"),NoiseOrigin);
        for(int32 Index=0;Index<5;++Index)
            Material->SetVectorParameterValue(FName(*FString::Printf(TEXT("WindOrigin%d"),Index)),WindOrigins[Index]);
        Material->SetVectorParameterValue(TEXT("WavePhase0"),FLinearColor(Phase[0],Phase[1],Phase[2],Phase[3]));
        Material->SetVectorParameterValue(TEXT("WavePhase1"),FLinearColor(Phase[4],Phase[5],Phase[6],Phase[7]));
        Material->SetScalarParameterValue(TEXT("WaveStrength"),float(Strength));
        Material->SetScalarParameterValue(TEXT("PatchRadius"),float(PatchRadiusCentimetres));
    }
}

void AWNTOceanDetailActor::UpdateView(const FVector& CameraPosition,const FVector& CameraDirection,double DeltaSeconds,bool bSceneVisible)
{
    ElapsedSeconds+=FMath::Max(0.0,DeltaSeconds);
    if(!FarMaterial||!DetailMaterial)return;
    const double RayDistance=CameraDirection.Z<-.02?-CameraPosition.Z/CameraDirection.Z:-1;
    const FVector Target=RayDistance>0?CameraPosition+CameraDirection*RayDistance:CameraPosition;
    const FVector2D Centre(FMath::GridSnap(Target.X,GridSpacingCentimetres),FMath::GridSnap(Target.Y,GridSpacingCentimetres));
    // Fully resolved at inspection range; invisible before strategic geometry matters.
    const double Strength=1.0-Smooth(35000.0,160000.0,RayDistance);
    const bool Visible=bSceneVisible&&RayDistance>0&&RayDistance<160000.0&&Strength>.0001;
    SetActorLocation(FVector(Centre.X,Centre.Y,0));
    UpdateParameters(Centre,Visible?Strength:0);
    SetActive(Visible);
}
