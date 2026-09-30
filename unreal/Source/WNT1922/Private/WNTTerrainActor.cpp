#include "WNTTerrainActor.h"
#include "WNTProjection.h"
#include "WNTVisualAssets.h"
#include "ProceduralMeshComponent.h"
#include "Components/SceneComponent.h"
#include "Materials/Material.h"
#include "Dom/JsonObject.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "ConstrainedDelaunay2.h"
#include "Polygon2.h"
#include <cmath>

namespace
{
    constexpr double TileDegrees = 15.0;
    constexpr int32 TileColumns = 24, TileRows = 12;
    using FRing = TArray<FVector2D>;
    double Cross2(const FVector2D& A, const FVector2D& B) { return A.X * B.Y - A.Y * B.X; }
    FVector BarycentricXY(const FVector& P,const FVector& A,const FVector& B,const FVector& C);
    double RingCentre(const FRing& Ring)
    {
        double Sum = 0; for (const FVector2D& P : Ring) Sum += P.X;
        return Ring.IsEmpty() ? 0.0 : Sum / Ring.Num();
    }
    bool InRing(const FVector2D& Point, const FRing& Ring)
    {
        bool Inside = false;
        for (int32 I = 0, J = Ring.Num() - 1; I < Ring.Num(); J = I++)
        {
            const FVector2D& A = Ring[J]; const FVector2D& B = Ring[I];
            const double Cross = Cross2(Point - A, B - A);
            if (FMath::Abs(Cross) < 1e-10 && Point.X >= FMath::Min(A.X,B.X)-1e-10 && Point.X <= FMath::Max(A.X,B.X)+1e-10 &&
                Point.Y >= FMath::Min(A.Y,B.Y)-1e-10 && Point.Y <= FMath::Max(A.Y,B.Y)+1e-10) return true;
            if ((A.Y > Point.Y) != (B.Y > Point.Y) && Point.X < (B.X-A.X)*(Point.Y-A.Y)/(B.Y-A.Y)+A.X) Inside = !Inside;
        }
        return Inside;
    }
    FRing Clip(const FRing& Ring, int32 Axis, double Edge, bool Greater)
    {
        FRing Out; if (Ring.IsEmpty()) return Out;
        FVector2D A = Ring.Last(); bool AInside = Greater ? A[Axis] >= Edge : A[Axis] <= Edge;
        for (const FVector2D& B : Ring)
        {
            const bool BInside = Greater ? B[Axis] >= Edge : B[Axis] <= Edge;
            if (AInside != BInside)
            {
                FVector2D P = FMath::Lerp(A, B, (Edge-A[Axis])/(B[Axis]-A[Axis])); P[Axis] = Edge;
                Out.Add(P);
            }
            if (BInside) Out.Add(B);
            A = B; AInside = BInside;
        }
        return Out;
    }
    void AddFan(const FRing& Points, TArray<FWNTGeographicTriangle>& Out)
    {
        for (int32 I=1; I+1<Points.Num(); ++I)
            if (FMath::Abs(Cross2(Points[I]-Points[0],Points[I+1]-Points[0])) > 1e-13)
                Out.Add({Points[0],Points[I],Points[I+1]});
    }
    TArray<FRing> AlignRings(const TArray<FRing>& Input)
    {
        TArray<FRing> Rings;
        for (const FRing& Source : Input)
        {
            FRing Ring = WNTTerrainGeometry::UnwrapRing(Source);
            if (Ring.Num()<3) continue;
            if (!Rings.IsEmpty())
            {
                const double Shift = std::round((RingCentre(Rings[0])-RingCentre(Ring))/360.0)*360.0;
                for (FVector2D& P : Ring) P.X += Shift;
            }
            Rings.Add(MoveTemp(Ring));
        }
        return Rings;
    }
    void Tessellate(const FWNTGeographicTriangle& T, double Step, TArray<FWNTGeographicTriangle>& Out)
    {
        const FRing Triangle{T.A,T.B,T.C};
        const int32 FirstY=FMath::FloorToInt(FMath::Min3(T.A.Y,T.B.Y,T.C.Y)/Step), LastY=FMath::FloorToInt(FMath::Max3(T.A.Y,T.B.Y,T.C.Y)/Step);
        for(int32 Y=FirstY;Y<=LastY;++Y)
        {
            const FRing Strip=Clip(Clip(Triangle,1,Y*Step,true),1,(Y+1)*Step,false);
            if(Strip.Num()<3)continue;
            double MinX=Strip[0].X,MaxX=MinX;for(const FVector2D& P:Strip){MinX=FMath::Min(MinX,P.X);MaxX=FMath::Max(MaxX,P.X);}
            for(int32 X=FMath::FloorToInt(MinX/Step);X<=FMath::FloorToInt(MaxX/Step);++X)
                AddFan(Clip(Clip(Strip,0,X*Step,true),0,(X+1)*Step,false),Out);
        }
    }
    bool ReadJson(const FString& Path,TSharedPtr<FJsonObject>& Out,bool Markdown=false)
    {
        FString Text;if(!FFileHelper::LoadFileToString(Text,*Path))return false;
        if(Markdown)
        {
            const FString Fence=TEXT("```json game-data");const int32 Start=Text.Find(Fence);
            if(Start==INDEX_NONE)return false;
            const int32 Content=Start+Fence.Len(),End=Text.Find(TEXT("```"),ESearchCase::CaseSensitive,ESearchDir::FromStart,Content);
            if(End==INDEX_NONE)return false;Text=Text.Mid(Content,End-Content);
        }
        return FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text),Out)&&Out.IsValid();
    }
    FLinearColor OwnerColour(const FString& Owner)
    {
        static const FLinearColor Palette[]={FLinearColor(.37f,.52f,.41f),FLinearColor(.48f,.49f,.32f),FLinearColor(.35f,.46f,.49f),FLinearColor(.53f,.42f,.36f),FLinearColor(.46f,.44f,.53f),FLinearColor(.41f,.53f,.49f)};
        return Palette[GetTypeHash(Owner)%UE_ARRAY_COUNT(Palette)];
    }
}

TArray<FVector2D> WNTTerrainGeometry::UnwrapRing(const TArray<FVector2D>& Source)
{
    FRing Finite; int32 PoleCount=0; double PoleMin=180,PoleMax=-180;
    for(const FVector2D& P:Source)if(FMath::IsFinite(P.X)&&FMath::IsFinite(P.Y))
    {
        Finite.Add(FVector2D(P.X,FMath::Clamp(P.Y,-90.0,90.0)));
        if(FMath::Abs(P.Y)>89.9){++PoleCount;PoleMin=FMath::Min(PoleMin,P.X);PoleMax=FMath::Max(PoleMax,P.X);}
    }
    const bool ArtificialPole=PoleCount>1&&PoleMax-PoleMin>359.0;
    FRing Out;
    for(const FVector2D& P:Finite)
    {
        if(ArtificialPole&&FMath::Abs(P.Y)>89.9)continue;
        FVector2D Q(WNTProjection::WrapLongitude(P.X),P.Y);
        if(!Out.IsEmpty())
        {
            while(Q.X-Out.Last().X>180)Q.X-=360;while(Q.X-Out.Last().X< -180)Q.X+=360;
            if(Q.Equals(Out.Last(),1e-10))continue;
        }
        Out.Add(Q);
    }
    if(Out.Num()>1&&Out[0].Equals(Out.Last(),1e-10))Out.Pop();
    if(Out.Num()<3)return {};
    if(FMath::Abs(Out.Last().X-Out[0].X)>180)
    {
        const double EndLongitude=Out[0].X+(Out.Last().X>Out[0].X?360.0:-360.0);
        if(FMath::Abs(Out.Last().X-EndLongitude)>1e-9)Out.Add(FVector2D(EndLongitude,Out[0].Y));
        double LatitudeSum=0;for(const FVector2D& P:Out)LatitudeSum+=P.Y;
        const double Pole=LatitudeSum>=0?90.0:-90.0;
        Out.Add(FVector2D(EndLongitude,Pole));Out.Add(FVector2D(Out[0].X,Pole));
    }
    return Out;
}

bool WNTTerrainGeometry::TriangulatePolygon(const TArray<TArray<FVector2D>>& Input,TArray<FWNTGeographicTriangle>& Out,FString& Error)
{
    const TArray<FRing> Rings=AlignRings(Input);if(Rings.IsEmpty()){Error=TEXT("Empty geographic polygon");return false;}
    UE::Geometry::TConstrainedDelaunay2<double> Triangulator;
    Triangulator.bOutputCCW=true;Triangulator.bSplitBowties=false;Triangulator.bOrientedEdges=false;
    for(int32 I=0;I<Rings.Num();++I)
    {
        UE::Geometry::TPolygon2<double> Polygon;
        for(const FVector2D& P:Rings[I])Polygon.AppendVertex(P);
        Triangulator.Add(Polygon,I>0);
    }
    auto KeepTriangle=[&](const TArray<FVector2d>& Vertices,const UE::Geometry::FIndex3i& T)
    {
        const FVector2D P=(Vertices[T.A]+Vertices[T.B]+Vertices[T.C])/3.0;
        if(!InRing(P,Rings[0]))return false;
        for(int32 I=1;I<Rings.Num();++I)if(InRing(P,Rings[I]))return false;
        return true;
    };
    bool Success=Triangulator.Triangulate(KeepTriangle);
    if(!Success)
    {
        // Historical overlays can cross themselves where an authored border meets
        // the base coastline. Split intersections before imposing the constraints;
        // never accept a partial triangulation or silently drop that territory.
        UE::Geometry::TGeneralPolygon2<double> Polygon;
        for(int32 I=0;I<Rings.Num();++I)
        {
            UE::Geometry::TPolygon2<double> Ring;
            for(const FVector2D& P:Rings[I])Ring.AppendVertex(P);
            if(I==0)Polygon.SetOuter(Ring);
            else
            {
                if(Ring.IsClockwise()==Polygon.GetOuter().IsClockwise())Ring.Reverse();
                Polygon.AddHole(Ring,false,false);
            }
        }
        Triangulator=UE::Geometry::TConstrainedDelaunay2<double>();
        Triangulator.bOutputCCW=true;Triangulator.bOrientedEdges=false;
        Success=Triangulator.AddWithIntersectionResolution(Polygon)&&Triangulator.Triangulate(KeepTriangle);
    }
    if(!Success){Error=TEXT("Constrained geographic polygon triangulation failed");return false;}
    for(const UE::Geometry::FIndex3i& T:Triangulator.Triangles)Out.Add({Triangulator.Vertices[T.A],Triangulator.Vertices[T.B],Triangulator.Vertices[T.C]});
    Error.Reset();return true;
}

TArray<FWNTGeographicTriangle> WNTTerrainGeometry::ClipAtMeridian(const FWNTGeographicTriangle& T,double Meridian)
{
    TArray<FWNTGeographicTriangle> Out;
    const double Centre=(T.A.X+T.B.X+T.C.X)/3.0-Meridian;
    const double Shift=-360.0*std::floor((Centre+180.0)/360.0);
    const double Offset=-Meridian+Shift;
    const double Min=FMath::Min3(T.A.X,T.B.X,T.C.X)+Offset,Max=FMath::Max3(T.A.X,T.B.X,T.C.X)+Offset;
    if(Min>=-180&&Max<=180)
    {
        Out.Add({FVector2D(T.A.X+Offset,T.A.Y),FVector2D(T.B.X+Offset,T.B.Y),FVector2D(T.C.X+Offset,T.C.Y)});
        return Out;
    }
    for(int32 Copy=-1;Copy<=1;++Copy)
    {
        const double CopyOffset=Offset+Copy*360.0;
        FRing Points{FVector2D(T.A.X+CopyOffset,T.A.Y),FVector2D(T.B.X+CopyOffset,T.B.Y),FVector2D(T.C.X+CopyOffset,T.C.Y)};
        if(FMath::Max3(Points[0].X,Points[1].X,Points[2].X)<-180||FMath::Min3(Points[0].X,Points[1].X,Points[2].X)>180)continue;
        AddFan(Clip(Clip(Points,0,-180,true),0,180,false),Out);
    }
    return Out;
}

struct FWNTTerrainData
{
    struct FPolygon{FString Id;FLinearColor Colour;TArray<FRing> Rings;FBox2D Bounds{ForceInit};};
    struct FTriangle{FWNTGeographicTriangle Geo;int32 Polygon=0;};
    struct FEdge{FVector2D A,B;int32 Polygon=0;};
    FWNTElevationGrid Elevation;
    TArray<FPolygon> Polygons;
    TArray<FTriangle> Triangles;
    TArray<FEdge> Edges;
    TArray<TArray<int32>> Bins;
    TArray<TArray<int32>> TriangleBins;
    TMap<FString,FLinearColor> Control;
    const TArray<int32>& TrianglesAt(FVector2D P)const
    {
        static const TArray<int32> Empty;
        if(TriangleBins.Num()!=64800)return Empty;
        const int32 X=FMath::Clamp(FMath::FloorToInt(WNTProjection::WrapLongitude(P.X)+180),0,359);
        const int32 Y=FMath::Clamp(FMath::FloorToInt(P.Y+90),0,179);
        return TriangleBins[Y*360+X];
    }
    int32 PolygonAt(FVector2D P)const
    {
        if(!FMath::IsFinite(P.X)||!FMath::IsFinite(P.Y)||P.Y< -90||P.Y>90||Bins.Num()!=648)return INDEX_NONE;
        P.X=WNTProjection::WrapLongitude(P.X);
        const int32 X=FMath::Clamp(FMath::FloorToInt((P.X+180)/10),0,35),Y=FMath::Clamp(FMath::FloorToInt((P.Y+90)/10),0,17);
        for(const int32 I:Bins[Y*36+X])
        {
            const FPolygon& Poly=Polygons[I];FVector2D Q=P;
            Q.X+=std::round((Poly.Bounds.GetCenter().X-Q.X)/360.0)*360.0;
            if(!Poly.Bounds.IsInsideOrOn(Q)||!InRing(Q,Poly.Rings[0]))continue;
            bool Hole=false;for(int32 H=1;H<Poly.Rings.Num();++H)if(InRing(Q,Poly.Rings[H])){Hole=true;break;}
            if(!Hole)return I;
        }
        return INDEX_NONE;
    }
};

void FWNTTerrainDataDeleter::operator()(FWNTTerrainData* Pointer) const { delete Pointer; }

AWNTTerrainActor::AWNTTerrainActor()
{
    PrimaryActorTick.bCanEverTick=false;
    RootComponent=CreateDefaultSubobject<USceneComponent>(TEXT("TerrainRoot"));
    Data.Reset(new FWNTTerrainData());
}
AWNTTerrainActor::~AWNTTerrainActor()=default;

bool AWNTTerrainActor::Initialize(const FString& DataRoot)
{
    for(UProceduralMeshComponent* Tile:TerrainTiles)if(Tile)Tile->ClearAllMeshSections();
    Data.Reset(new FWNTTerrainData());LoadError.Reset();
    if(CampaignId!=TEXT("1922")&&CampaignId!=TEXT("1936hindsight")){LoadError=TEXT("Unknown terrain campaign");return false;}
    if(!Data->Elevation.Load(FPaths::Combine(DataRoot,TEXT("assets/terrain/elevation.bin")),FPaths::Combine(DataRoot,TEXT("assets/terrain/elevation.json")),LoadError))return false;
    TSharedPtr<FJsonObject> Geography,Campaign;
    if(!ReadJson(FPaths::Combine(DataRoot,TEXT("assets/maps/geometry.json")),Geography)||
       !ReadJson(FPaths::Combine(DataRoot,TEXT("catalog"),CampaignId,TEXT("map.md")),Campaign,true))
    {LoadError=TEXT("Cannot read geographic geometry or campaign map");return false;}
    const TSharedPtr<FJsonObject>* Geometries=nullptr;const TArray<TSharedPtr<FJsonValue>>* Features=nullptr;
    if(!Geography->TryGetObjectField(TEXT("geometry"),Geometries)||!Campaign->TryGetArrayField(TEXT("features"),Features))
    {LoadError=TEXT("Invalid geographic catalog schema");return false;}
    const double Step=FMath::Clamp(SurfaceSampleDegrees,0.25,2.0);
    for(const TSharedPtr<FJsonValue>& FeatureValue:*Features)
    {
        const TSharedPtr<FJsonObject> Feature=FeatureValue->AsObject();if(!Feature.IsValid())continue;
        FString Id,GeometryId,TerritoryOwner;
        if(!Feature->TryGetStringField(TEXT("id"),Id)||!Feature->TryGetStringField(TEXT("geometry"),GeometryId))continue;
        Feature->TryGetStringField(TEXT("owner"),TerritoryOwner);
        const TSharedPtr<FJsonObject>* Geometry=nullptr;
        if(!(*Geometries)->TryGetObjectField(GeometryId,Geometry)){LoadError=TEXT("Missing geographic feature: ")+GeometryId;return false;}
        FString Type;const TArray<TSharedPtr<FJsonValue>>* Coordinates=nullptr;
        if(!(*Geometry)->TryGetStringField(TEXT("type"),Type)||!(*Geometry)->TryGetArrayField(TEXT("coordinates"),Coordinates))continue;
        TArray<TArray<TSharedPtr<FJsonValue>>> SourcePolygons;
        if(Type==TEXT("Polygon"))SourcePolygons.Add(*Coordinates);
        else if(Type==TEXT("MultiPolygon"))for(const auto& P:*Coordinates)SourcePolygons.Add(P->AsArray());
        for(const auto& SourceRings:SourcePolygons)
        {
            TArray<FRing> Rings;
            for(const auto& RingValue:SourceRings)
            {
                FRing Ring;for(const auto& PointValue:RingValue->AsArray())
                {const auto& Pair=PointValue->AsArray();if(Pair.Num()>=2)Ring.Add(FVector2D(Pair[0]->AsNumber(),Pair[1]->AsNumber()));}
                Rings.Add(MoveTemp(Ring));
            }
            TArray<FWNTGeographicTriangle> Coarse;
            if(!WNTTerrainGeometry::TriangulatePolygon(Rings,Coarse,LoadError)){LoadError+=TEXT(" in ")+Id;return false;}
            FWNTTerrainData::FPolygon Polygon;Polygon.Id=Id;Polygon.Colour=OwnerColour(TerritoryOwner);Polygon.Rings=AlignRings(Rings);
            if(Polygon.Rings.IsEmpty())continue;for(const FVector2D& P:Polygon.Rings[0])Polygon.Bounds+=P;
            const int32 PolygonIndex=Data->Polygons.Add(MoveTemp(Polygon));
            TArray<FWNTGeographicTriangle> Fine;for(const auto& T:Coarse)Tessellate(T,Step,Fine);
            for(const auto& T:Fine)Data->Triangles.Add({T,PolygonIndex});
            for(const FRing& Ring:Data->Polygons[PolygonIndex].Rings)for(int32 I=0;I<Ring.Num();++I)
            {
                const FVector2D A=Ring[I],B=Ring[(I+1)%Ring.Num()];
                const int32 Steps=FMath::Max(1,FMath::CeilToInt(FMath::Max(FMath::Abs(B.X-A.X),FMath::Abs(B.Y-A.Y))/.25));
                for(int32 J=0;J<Steps;++J)Data->Edges.Add({FMath::Lerp(A,B,double(J)/Steps),FMath::Lerp(A,B,double(J+1)/Steps),PolygonIndex});
            }
        }
    }
    Data->Bins.SetNum(648);
    for(int32 I=0;I<Data->Polygons.Num();++I)
    {
        const FBox2D& B=Data->Polygons[I].Bounds;
        for(int32 Y=0;Y<18;++Y)if(-90+(Y+1)*10>=B.Min.Y&&-90+Y*10<=B.Max.Y)
            for(int32 X=0;X<36;++X)
            {
                const double Mid=-175.0+X*10.0,Aligned=Mid+360.0*std::round((B.GetCenter().X-Mid)/360.0);
                if(Aligned+5>=B.Min.X&&Aligned-5<=B.Max.X)Data->Bins[Y*36+X].Add(I);
            }
    }
    Data->TriangleBins.SetNum(64800);
    for(int32 I=0;I<Data->Triangles.Num();++I)
    {
        const auto& T=Data->Triangles[I].Geo;
        const int32 X0=FMath::FloorToInt(FMath::Min3(T.A.X,T.B.X,T.C.X)+180),X1=FMath::FloorToInt(FMath::Max3(T.A.X,T.B.X,T.C.X)+180);
        const int32 Y0=FMath::Clamp(FMath::FloorToInt(FMath::Min3(T.A.Y,T.B.Y,T.C.Y)+90),0,179),Y1=FMath::Clamp(FMath::FloorToInt(FMath::Max3(T.A.Y,T.B.Y,T.C.Y)+90),0,179);
        for(int32 Y=Y0;Y<=Y1;++Y)for(int32 X=X0;X<=X1;++X)Data->TriangleBins[Y*360+((X%360+360)%360)].Add(I);
    }
    if(Data->Triangles.IsEmpty()){LoadError=TEXT("No terrain triangles were generated");return false;}
    if(!TerrainMaterial)TerrainMaterial=WNTVisualAssets::LoadTerrainMaterial(DataRoot);
    if(!TerrainMaterial){LoadError=TEXT("Cannot load the native photographic terrain material and local texture set.");return false;}
    if(!LineMaterial)LineMaterial=LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Materials/M_Line.M_Line"));
    RebuildProjectedMeshes();return true;
}

void AWNTTerrainActor::SetCentralMeridian(double Degrees)
{
    const double Next=WNTProjection::WrapLongitude(Degrees);
    if(FMath::Abs(WNTProjection::WrapLongitude(Next-CentralMeridian))<1e-9)return;
    CentralMeridian=Next;if(Data&&!Data->Triangles.IsEmpty())RebuildProjectedMeshes();
}
double AWNTTerrainActor::HeightAt(const FVector2D& P)const{return Data?Data->Elevation.SampleMetres(P):0.0;}
bool AWNTTerrainActor::IsLandAt(const FVector2D& P)const{return Data&&Data->PolygonAt(P)!=INDEX_NONE;}
FString AWNTTerrainActor::TerritoryAt(const FVector2D& P)const
{const int32 I=Data?Data->PolygonAt(P):INDEX_NONE;return I==INDEX_NONE?FString():Data->Polygons[I].Id;}
double AWNTTerrainActor::RenderHeightAt(const FVector2D& P)const
{
    if(!IsLandAt(P))return 0.0;
    const FVector Query=WNTProjection::Forward(P,CentralMeridian);
    double Surface=-1;
    for(int32 Index:Data->TrianglesAt(P))for(const auto& T:WNTTerrainGeometry::ClipAtMeridian(Data->Triangles[Index].Geo,CentralMeridian))
    {
        auto Vertex=[&](const FVector2D& Relative)
        {return WNTProjection::ForwardUnwrapped(Relative,LandBaseMetres+FMath::Max(0.0,HeightAt(FVector2D(Relative.X+CentralMeridian,Relative.Y))));};
        const FVector A=Vertex(T.A),B=Vertex(T.B),C=Vertex(T.C),W=BarycentricXY(Query,A,B,C);
        if(W.X>=-1e-8&&W.Y>=-1e-8&&W.Z>=-1e-8)Surface=FMath::Max(Surface,(A.Z*W.X+B.Z*W.Y+C.Z*W.Z)/100.0);
    }
    return Surface>=0?Surface:LandBaseMetres+FMath::Max(0.0,HeightAt(P));
}
void AWNTTerrainActor::SetControl(const TMap<FString,FLinearColor>& Colours)
{
    if(!Data)return;
    bool Changed=Data->Control.Num()!=Colours.Num();
    if(!Changed)for(const auto& Pair:Colours)
    {const FLinearColor* Existing=Data->Control.Find(Pair.Key);if(!Existing||*Existing!=Pair.Value){Changed=true;break;}}
    if(!Changed)return;
    Data->Control=Colours;RebuildProjectedMeshes();
}
void AWNTTerrainActor::SetGraticuleVisible(bool Visible)
{
    if(bGraticuleVisible==Visible)return;bGraticuleVisible=Visible;
    for(UProceduralMeshComponent* Tile:TerrainTiles)if(Tile)Tile->SetMeshSectionVisible(2,Visible);
}

namespace
{
    FVector BarycentricXY(const FVector& P,const FVector& A,const FVector& B,const FVector& C)
    {
        const FVector2D U(B.X-A.X,B.Y-A.Y),V(C.X-A.X,C.Y-A.Y),W(P.X-A.X,P.Y-A.Y);
        const double D=Cross2(U,V);
        if(FMath::Abs(D)<1e-10)return FVector(-1,-1,-1);
        const double Y=Cross2(W,V)/D,Z=Cross2(U,W)/D;
        return FVector(1-Y-Z,Y,Z);
    }
    struct FTileSection
    {
        TArray<FVector> Vertices,Normals;
        TArray<int32> Indices;
        TArray<FVector2D> UV;
        TArray<FLinearColor> Colours;
        void Triangle(FVector A,FVector B,FVector C,const FLinearColor& Colour,const FVector& Origin,bool Up=true,
            FVector2D UVA=FVector2D(0,0),FVector2D UVB=FVector2D(1,0),FVector2D UVC=FVector2D(0,1))
        {
            FVector N=FVector::CrossProduct(B-A,C-A).GetSafeNormal();
            if(N.IsNearlyZero())return;if(Up&&N.Z<0){Swap(B,C);Swap(UVB,UVC);N=-N;}
            const int32 Base=Vertices.Num();
            Vertices.Append({A-Origin,B-Origin,C-Origin});Normals.Append({N,N,N});
            // Unreal front faces are clockwise; shading normals stay outward.
            Indices.Append({Base,Base+2,Base+1});UV.Append({UVA,UVB,UVC});Colours.Append({Colour,Colour,Colour});
        }
    };
    struct FTileBuild{FVector Origin;FTileSection Land,Coast,Grid;};
    int32 TileAt(double RelativeLon,double Latitude)
    {
        return FMath::Clamp(FMath::FloorToInt((Latitude+90)/TileDegrees),0,TileRows-1)*TileColumns+
            FMath::Clamp(FMath::FloorToInt((RelativeLon+180)/TileDegrees),0,TileColumns-1);
    }
}

void AWNTTerrainActor::RebuildProjectedMeshes()
{
    if(!Data||Data->Triangles.IsEmpty())return;
    TArray<FTileBuild> Tiles;Tiles.SetNum(TileRows*TileColumns);
    for(int32 I=0;I<Tiles.Num();++I)Tiles[I].Origin=WNTProjection::ForwardUnwrapped(FVector2D(-172.5+(I%TileColumns)*TileDegrees,-82.5+(I/TileColumns)*TileDegrees));
    auto Height=[&](const FVector2D& Relative){return LandBaseMetres+FMath::Max(0.0,HeightAt(FVector2D(Relative.X+CentralMeridian,Relative.Y)));};
    for(const FWNTTerrainData::FTriangle& Source:Data->Triangles)
    {
        const FWNTTerrainData::FPolygon& Polygon=Data->Polygons[Source.Polygon];
        const FLinearColor* Override=Data->Control.Find(Polygon.Id);const FLinearColor Colour=Override?*Override:Polygon.Colour;
        for(const FWNTGeographicTriangle& T:WNTTerrainGeometry::ClipAtMeridian(Source.Geo,CentralMeridian))
        {
            const FVector2D Centre=(T.A+T.B+T.C)/3.0;FTileBuild& Tile=Tiles[TileAt(Centre.X,Centre.Y)];
            const double HA=Height(T.A),HB=Height(T.B),HC=Height(T.C);
            // Vertex colours remain political; normals and geometry provide the geographic relief.
            // Keep longitudes unwrapped within each triangle. The texture's U
            // sampler repeats at 180 degrees without interpolating across the
            // entire image when the map's central meridian moves.
            auto GlobalUV=[&](const FVector2D& P){return FVector2D((P.X+CentralMeridian+180.0)/360.0,(90.0-P.Y)/180.0);};
            Tile.Land.Triangle(WNTProjection::ForwardUnwrapped(T.A,HA),WNTProjection::ForwardUnwrapped(T.B,HB),WNTProjection::ForwardUnwrapped(T.C,HC),Colour,Tile.Origin,true,GlobalUV(T.A),GlobalUV(T.B),GlobalUV(T.C));
        }
    }
    for(const FWNTTerrainData::FEdge& Edge:Data->Edges)
    {
        const double Centre=(Edge.A.X+Edge.B.X)*.5-CentralMeridian,Shift=-360.0*std::floor((Centre+180)/360.0);
        for(int32 Copy=-1;Copy<=1;++Copy)
        {
            FVector2D A(Edge.A.X-CentralMeridian+Shift+Copy*360.0,Edge.A.Y),B(Edge.B.X-CentralMeridian+Shift+Copy*360.0,Edge.B.Y);
            if(FMath::Max(A.X,B.X)<-180||FMath::Min(A.X,B.X)>180)continue;
            if(A.X< -180)A=FMath::Lerp(A,B,(-180-A.X)/(B.X-A.X));if(B.X< -180)B=FMath::Lerp(B,A,(-180-B.X)/(A.X-B.X));
            if(A.X>180)A=FMath::Lerp(A,B,(180-A.X)/(B.X-A.X));if(B.X>180)B=FMath::Lerp(B,A,(180-B.X)/(A.X-B.X));
            const FVector2D Mid=(A+B)*.5;FTileBuild& Tile=Tiles[TileAt(Mid.X,Mid.Y)];
            const FVector TA=WNTProjection::ForwardUnwrapped(A,Height(A)),TB=WNTProjection::ForwardUnwrapped(B,Height(B));
            const FVector BA=WNTProjection::ForwardUnwrapped(A,-2),BB=WNTProjection::ForwardUnwrapped(B,-2);
            const FLinearColor Coast(.19f,.24f,.20f);
            Tile.Coast.Triangle(TA,BA,TB,Coast,Tile.Origin,false);Tile.Coast.Triangle(TB,BA,BB,Coast,Tile.Origin,false);
        }
    }
    auto AddGridLine=[&](const FVector2D& A,const FVector2D& B,double AX,double BX)
    {
        const FVector2D Mid((AX+BX)*.5,(A.Y+B.Y)*.5);FTileBuild& Tile=Tiles[TileAt(Mid.X,Mid.Y)];
        const FVector PA=WNTProjection::ForwardUnwrapped(FVector2D(AX,A.Y)),PB=WNTProjection::ForwardUnwrapped(FVector2D(BX,B.Y));
        struct FInterval{double Start,End,HeightA,HeightB;};TArray<FInterval> Land;
        TSet<int32> Candidates;
        for(const FVector2D& P:{A,B,(A+B)*.5})for(int32 Index:Data->TrianglesAt(P))Candidates.Add(Index);
        for(int32 Index:Candidates)for(const auto& T:WNTTerrainGeometry::ClipAtMeridian(Data->Triangles[Index].Geo,CentralMeridian))
        {
            const FVector TA=WNTProjection::ForwardUnwrapped(T.A,Height(T.A)),TB=WNTProjection::ForwardUnwrapped(T.B,Height(T.B)),TC=WNTProjection::ForwardUnwrapped(T.C,Height(T.C));
            const FVector WA=BarycentricXY(PA,TA,TB,TC),WB=BarycentricXY(PB,TA,TB,TC);
            double Start=0,End=1;bool Valid=true;
            for(int32 Axis=0;Axis<3;++Axis)
            {
                const double Change=WB[Axis]-WA[Axis];
                if(FMath::Abs(Change)<1e-12){if(WA[Axis]<-1e-8)Valid=false;continue;}
                const double Crossing=-WA[Axis]/Change;
                if(Change>0)Start=FMath::Max(Start,Crossing);else End=FMath::Min(End,Crossing);
            }
            if(!Valid||End-Start<1e-9)continue;
            const FVector W0=FMath::Lerp(WA,WB,Start),W1=FMath::Lerp(WA,WB,End);
            Land.Add({Start,End,W0.X*TA.Z+W0.Y*TB.Z+W0.Z*TC.Z,W1.X*TA.Z+W1.Y*TB.Z+W1.Z*TC.Z});
        }
        Land.Sort([](const FInterval& L,const FInterval& R){return L.Start<R.Start;});
        const FLinearColor Grid(.34f,.56f,.59f);
        auto DrawInterval=[&](double Start,double End,double H0,double H1)
        {
            if(End-Start<1e-9)return;
            FVector P=FMath::Lerp(PA,PB,Start),Q=FMath::Lerp(PA,PB,End);P.Z=H0+10000;Q.Z=H1+10000;
            const FVector Side=FVector::CrossProduct((Q-P).GetSafeNormal(),FVector::UpVector).GetSafeNormal()*GridWidthMetres*50.0;
            Tile.Grid.Triangle(P-Side,P+Side,Q+Side,Grid,Tile.Origin);Tile.Grid.Triangle(P-Side,Q+Side,Q-Side,Grid,Tile.Origin);
        };
        double Cursor=0;
        for(const auto& Interval:Land)
        {
            if(Interval.End<=Cursor)continue;
            if(Interval.Start>Cursor)DrawInterval(Cursor,Interval.Start,0,0);
            const double Start=FMath::Max(Cursor,Interval.Start);
            const double H0=FMath::Lerp(Interval.HeightA,Interval.HeightB,(Start-Interval.Start)/(Interval.End-Interval.Start));
            DrawInterval(Start,Interval.End,H0,Interval.HeightB);Cursor=Interval.End;
        }
        if(Cursor<1)DrawInterval(Cursor,1,0,0);
    };
    auto GridSegment=[&](const FVector2D& A,const FVector2D& B)
    {
        const double AX=WNTProjection::WrapLongitude(A.X-CentralMeridian),BX=WNTProjection::WrapLongitude(B.X-CentralMeridian);
        if(FMath::Abs(AX-BX)<=180){AddGridLine(A,B,AX,BX);return;}
        const double UnwrappedB=BX+(AX>BX?360.0:-360.0),Boundary=AX>BX?180.0:-180.0;
        const FVector2D Seam=FMath::Lerp(A,B,(Boundary-AX)/(UnwrappedB-AX));
        AddGridLine(A,Seam,AX,Boundary);AddGridLine(Seam,B,-Boundary,BX);
    };
    const double GridStep=FMath::Clamp(GridSpacingDegrees,5.0,90.0);
    for(double Lon=-180;Lon<180-1e-8;Lon+=GridStep)for(double Lat=-90;Lat<90-1e-8;Lat+=.25)GridSegment(FVector2D(Lon,Lat),FVector2D(Lon,Lat+.25));
    for(double Lat=-90+GridStep;Lat<90-1e-8;Lat+=GridStep)for(double Lon=-180;Lon<180-1e-8;Lon+=.25)GridSegment(FVector2D(Lon,Lat),FVector2D(Lon+.25,Lat));
    if(TerrainTiles.Num()!=Tiles.Num())TerrainTiles.SetNum(Tiles.Num());
    for(int32 I=0;I<Tiles.Num();++I)
    {
        FTileBuild& Tile=Tiles[I];UProceduralMeshComponent* Mesh=TerrainTiles[I];
        if(!Mesh&&(Tile.Land.Vertices.Num()||Tile.Grid.Vertices.Num()))
        {
            Mesh=NewObject<UProceduralMeshComponent>(this,*FString::Printf(TEXT("TerrainTile_%d"),I));
            Mesh->SetupAttachment(RootComponent);Mesh->SetMobility(EComponentMobility::Movable);Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
            Mesh->bUseAsyncCooking=true;Mesh->RegisterComponent();TerrainTiles[I]=Mesh;AddInstanceComponent(Mesh);
        }
        if(!Mesh)continue;Mesh->SetRelativeLocation(Tile.Origin);
        auto Apply=[&](int32 Section,FTileSection& Build,UMaterialInterface* Material)
        {
            if(Build.Vertices.IsEmpty()){Mesh->ClearMeshSection(Section);return;}
            const FProcMeshSection* Existing=Mesh->GetProcMeshSection(Section);
            if(Existing&&Existing->ProcVertexBuffer.Num()==Build.Vertices.Num())
                Mesh->UpdateMeshSection_LinearColor(Section,Build.Vertices,Build.Normals,Build.UV,Build.Colours,TArray<FProcMeshTangent>(),false);
            else Mesh->CreateMeshSection_LinearColor(Section,Build.Vertices,Build.Indices,Build.Normals,Build.UV,Build.Colours,TArray<FProcMeshTangent>(),false,false);
            Mesh->SetMaterial(Section,Material?Material:UMaterial::GetDefaultMaterial(MD_Surface));
        };
        Apply(0,Tile.Land,TerrainMaterial);
        Apply(1,Tile.Coast,LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Materials/M_Terrain.M_Terrain")));
        Apply(2,Tile.Grid,LineMaterial);
        Mesh->SetMeshSectionVisible(2,bGraticuleVisible);
    }
}
