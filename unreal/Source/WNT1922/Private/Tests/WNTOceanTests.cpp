#if WITH_DEV_AUTOMATION_TESTS
#include "WNTOceanDetailActor.h"
#include "Engine/World.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Misc/AutomationTest.h"
#include "Misc/ScopeExit.h"
#include "ProceduralMeshComponent.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTOceanDetailTest,"WNT.Ocean.LocalGeometryAndPhaseContinuity",
    EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTOceanDetailTest::RunTest(const FString& Parameters)
{
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
        .CreatePhysicsScene(false).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    const FName TestWorldName=MakeUniqueObjectName(GetTransientPackage(),UWorld::StaticClass(),TEXT("WNTOceanTest"));
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,TestWorldName,GetTransientPackage(),true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Water test world"),World))return false;
    ON_SCOPE_EXIT {World->DestroyWorld(false);};
    auto* Water=World->SpawnActor<AWNTOceanDetailActor>();FString Error;
    if(!TestNotNull(TEXT("Water actor"),Water)||!TestTrue(TEXT("Real water materials initialize: ")+Error,Water->Initialize(Error)))return false;
    auto* Surface=Water->GetSurface();const auto* Mesh=Surface->GetProcMeshSection(0);
    if(!TestNotNull(TEXT("Camera-local water geometry"),Mesh))return false;
    TestEqual(TEXT("Bounded vertex count"),Mesh->ProcVertexBuffer.Num(),37249);
    TestEqual(TEXT("Bounded triangle count"),Mesh->ProcIndexBuffer.Num()/3,73728);
    TestTrue(TEXT("Visual water never intercepts selection or cooks collision"),Surface->GetCollisionEnabled()==ECollisionEnabled::NoCollision&&!Mesh->bEnableCollision);
    TestTrue(TEXT("Culling bounds include all possible positive and negative wave heights"),Mesh->SectionLocalBox.Min.Z<=-100&&Mesh->SectionLocalBox.Max.Z>=100);
    bool Facing=true;
    for(int32 I=0;I<Mesh->ProcIndexBuffer.Num();I+=3)
    {
        const auto A=Mesh->ProcVertexBuffer[Mesh->ProcIndexBuffer[I]].Position;
        const auto B=Mesh->ProcVertexBuffer[Mesh->ProcIndexBuffer[I+1]].Position;
        const auto C=Mesh->ProcVertexBuffer[Mesh->ProcIndexBuffer[I+2]].Position;
        Facing&=FVector::CrossProduct(B-A,C-A).Z<0;
    }
    TestTrue(TEXT("Every displaced water face starts upward with native winding"),Facing);
    const FVector Camera(1.113579024e9,-1.315790432e9,25000);
    Water->UpdateView(Camera,-FVector::UpVector,0,true);
    TestTrue(TEXT("Close inspection activates detail"),Water->IsDetailActive());
    auto* Far=Water->GetFarMaterial();auto* Near=Cast<UMaterialInstanceDynamic>(Surface->GetMaterial(0));
    if(!TestNotNull(TEXT("Matching detail instance"),Near))return false;
    TestEqual(TEXT("Far water opens only while detail is visible"),Far->K2_GetScalarParameterValue(TEXT("PatchActive")),1.f);
    const FLinearColor High=Far->K2_GetVectorParameterValue(TEXT("PatchCentreHigh"));
    const FLinearColor Low=Far->K2_GetVectorParameterValue(TEXT("PatchCentreLow"));
    TestTrue(TEXT("Split origin preserves centimetres at billion-centimetre map positions"),
        FMath::Abs(double(High.R)+Low.R-Water->GetActorLocation().X)<.01&&FMath::Abs(double(High.G)+Low.G-Water->GetActorLocation().Y)<.01);
    // Reconstruct one real shader phase before and after the patch follows a pan.
    // The geometry may move; the wave pattern at this fixed world point must not.
    auto PhaseAt=[&](UMaterialInstanceDynamic* Material,const FVector& Point)
    {
        const auto H=Material->K2_GetVectorParameterValue(TEXT("PatchCentreHigh"));
        const auto L=Material->K2_GetVectorParameterValue(TEXT("PatchCentreLow"));
        const auto W=Material->K2_GetVectorParameterValue(TEXT("Wave0"));
        const auto Phase=Material->K2_GetVectorParameterValue(TEXT("WavePhase0"));
        return ((Point.X-double(H.R)-L.R)*W.R+(Point.Y-double(H.G)-L.G)*W.G)*.01+Phase.R;
    };
    const double Before=PhaseAt(Far,Camera);
    auto WindCoordinateAt=[&](const FVector& Point)
    {
        const auto Origin=Far->K2_GetVectorParameterValue(TEXT("WindOrigin0"));
        const auto Wave=Far->K2_GetVectorParameterValue(TEXT("Wave3"));
        const FVector Local=(Point-Water->GetActorLocation())*.01;
        return Origin.R+(Local.X*Wave.R+Local.Y*Wave.G)/(2.0*UE_DOUBLE_PI);
    };
    const double WindBefore=WindCoordinateAt(Camera);
    const auto NoiseBefore=Far->K2_GetVectorParameterValue(TEXT("WaveNoiseOrigin"));
    const FVector CentreBefore=Water->GetActorLocation();
    Water->UpdateView(Camera+FVector(800,1600,0),-FVector::UpVector,0,true);
    const double After=PhaseAt(Far,Camera);
    TestTrue(TEXT("Camera pan does not drag the ocean wave pattern"),FMath::Abs(FMath::Sin(Before)-FMath::Sin(After))<.00001);
    TestTrue(TEXT("Rotated wind-noise cells also remain fixed when the local mesh moves"),FMath::Abs(WindCoordinateAt(Camera)-WindBefore)<.0001);
    TestEqual(TEXT("Near/far wind-noise domains agree"),Far->K2_GetVectorParameterValue(TEXT("WindOrigin0")),Near->K2_GetVectorParameterValue(TEXT("WindOrigin0")));
    const auto NoiseAfter=Far->K2_GetVectorParameterValue(TEXT("WaveNoiseOrigin"));
    const FVector CentreAfter=Water->GetActorLocation();
    TestTrue(TEXT("Wind-packet noise stays anchored through camera recentering"),
        FMath::Abs((CentreAfter.X-CentreBefore.X)*.01-(NoiseAfter.R-NoiseBefore.R))<.01&&
        FMath::Abs((CentreAfter.Y-CentreBefore.Y)*.01-(NoiseAfter.G-NoiseBefore.G))<.01);
    TestEqual(TEXT("Near/far shader phase agrees"),Far->K2_GetVectorParameterValue(TEXT("WavePhase0")),Near->K2_GetVectorParameterValue(TEXT("WavePhase0")));
    TestEqual(TEXT("Near/far cutout boundary agrees"),Far->K2_GetScalarParameterValue(TEXT("PatchRadius")),Near->K2_GetScalarParameterValue(TEXT("PatchRadius")));
    Water->UpdateView(Camera,-FVector::UpVector,.5,true);
    TestTrue(TEXT("Water is animated while the campaign may be paused"),FMath::Abs(FMath::Sin(Before)-FMath::Sin(PhaseAt(Far,Camera)))>.001);
    Water->UpdateView(FVector(Camera.X,Camera.Y,2e6),-FVector::UpVector,0,true);
    TestFalse(TEXT("Strategic zoom hides local geometry"),Water->IsDetailActive());
    TestEqual(TEXT("Strategic ocean has no patch hole"),Far->K2_GetScalarParameterValue(TEXT("PatchActive")),0.f);
    Water->UpdateView(Camera,-FVector::UpVector,0,true);Water->SetSceneVisible(false);
    TestFalse(TEXT("Hidden scene hides detail immediately"),Water->IsDetailActive());
    TestEqual(TEXT("Hidden scene closes the far-water hole"),Far->K2_GetScalarParameterValue(TEXT("PatchActive")),0.f);
    return true;
}
#endif
