#if WITH_DEV_AUTOMATION_TESTS
#include "Misc/AutomationTest.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "Misc/Paths.h"
#include "Engine/World.h"
#include "Dom/JsonObject.h"
#include "ProceduralMeshComponent.h"
#include "WNTWorldActor.h"
#include "WNTProjection.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTChartOceanRouteTest, "WNT.World.EqualEarthOceanAndRoute",
    EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)
bool FWNTChartOceanRouteTest::RunTest(const FString& Parameters)
{
    FString Root;if(!FParse::Value(FCommandLine::Get(),TEXT("WNTDataRoot="),Root))Root=FPaths::ConvertRelativePathToFull(FPaths::Combine(FPaths::ProjectDir(),TEXT("..")));
    const UWorld::InitializationValues Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false).CreatePhysicsScene(false).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,NAME_None,nullptr,true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Chart test world"),World))return false;
    auto* Scene=World->SpawnActor<AWNTWorldActor>();
    if(!Scene||!Scene->Initialize(Root)){AddError(Scene?Scene->GetLoadError():TEXT("Cannot spawn chart"));World->DestroyWorld(false);return false;}
    auto Packet=MakeShared<FJsonObject>();Packet->SetNumberField(TEXT("format"),1);Packet->SetStringField(TEXT("campaign"),TEXT("in_good_faith_1936"));Packet->SetStringField(TEXT("player"),TEXT("USA"));Packet->SetBoolField(TEXT("paused"),true);
    auto Route=MakeShared<FJsonObject>();Route->SetStringField(TEXT("forceId"),TEXT("projection-test"));
    TArray<TSharedPtr<FJsonValue>> Points;
    for(const FVector2D Geo:{FVector2D(170,-58),FVector2D(-170,-65),FVector2D(-68,-63),FVector2D(-50,-30)})
        Points.Add(MakeShared<FJsonValueArray>(TArray<TSharedPtr<FJsonValue>>{MakeShared<FJsonValueNumber>(Geo.X),MakeShared<FJsonValueNumber>(Geo.Y)}));
    Route->SetArrayField(TEXT("points"),Points);Packet->SetObjectField(TEXT("route"),Route);Scene->ApplyWorldPacket(Packet);
    struct FSample{UProceduralMeshComponent* Tile;const FProcMeshVertex* Buffer;int32 Count;TArray<FVector2D> Geography;};
    TArray<FSample> Samples;TArray<UProceduralMeshComponent*> Components;Scene->GetComponents(Components);
    auto Rendered=[](UProceduralMeshComponent* Tile,const FProcMeshVertex& V)
    {
        FVector Position=Tile->GetComponentTransform().TransformPosition(V.Position);
        const auto& Data=Tile->GetCustomPrimitiveData().Data;
        Position.Y+=WNTProjection::DecodeChartShear(V.UV1,V.UV2)*(Data.IsValidIndex(0)?Data[0]:0);return Position;
    };
    int32 OceanCount=0,RouteCount=0;
    for(auto* Tile:Components)
    {
        const bool Ocean=Tile->GetName().StartsWith(TEXT("OceanTile_")),RouteTile=Tile->GetName().StartsWith(TEXT("RouteTile_"));
        const auto* Section=Tile->GetProcMeshSection(0);if((!Ocean&&!RouteTile)||!Section||Section->ProcVertexBuffer.IsEmpty())continue;
        if(Ocean)++OceanCount;else ++RouteCount;
        TestEqual(TEXT("Projected chart meshes cannot retain stale physics collision"),Tile->GetCollisionEnabled(),ECollisionEnabled::NoCollision);
        FSample Sample{Tile,Section->ProcVertexBuffer.GetData(),Section->ProcVertexBuffer.Num(),{}};
        for(int32 I=0;I<Sample.Count;I+=FMath::Max(1,Sample.Count/7))
        {
            const auto Geo=WNTProjection::Inverse(Rendered(Tile,Section->ProcVertexBuffer[I]));
            if(!Geo.IsSet()){AddError(TEXT("Projected chart vertex outside poles"));continue;}Sample.Geography.Add(Geo.GetValue());
        }
        Samples.Add(MoveTemp(Sample));
    }
    TestEqual(TEXT("Three ocean copies retain complete coverage in coalesced tiles"),OceanCount,216);TestTrue(TEXT("Dateline route has populated strips"),RouteCount>=6);
    for(double Meridian:{72.5,179.99,-179.99,-65.0,0.0})
    {
        Scene->SetCentralMeridian(Meridian);
        for(const FSample& Sample:Samples)
        {
            const auto* Section=Sample.Tile->GetProcMeshSection(0);if(!Section){AddError(TEXT("Lost chart section"));continue;}
            TestTrue(TEXT("Panning reuses vertex storage"),Section->ProcVertexBuffer.GetData()==Sample.Buffer&&Section->ProcVertexBuffer.Num()==Sample.Count);
            int32 GeoIndex=0;
            for(int32 I=0;I<Sample.Count;I+=FMath::Max(1,Sample.Count/7),++GeoIndex)
            {
                const FVector Position=Rendered(Sample.Tile,Section->ProcVertexBuffer[I]);const auto Geo=WNTProjection::Inverse(Position,Meridian);
                if(!Geo.IsSet()||!Sample.Geography.IsValidIndex(GeoIndex)){AddError(TEXT("Invalid sheared chart vertex"));continue;}
                const auto Before=Sample.Geography[GeoIndex];
                TestTrue(TEXT("Ocean/routes retain geographic alignment after pan"),FMath::Abs(Geo->Y-Before.Y)<1e-5&&FMath::Abs(WNTProjection::WrapLongitude(Geo->X-Before.X))<1e-5);
                TestTrue(TEXT("Culling bounds contain sheared geometry"),Sample.Tile->Bounds.GetBox().ExpandBy(100).IsInsideOrOn(Position));
            }
        }
    }
    World->DestroyWorld(false);return true;
}
#endif
