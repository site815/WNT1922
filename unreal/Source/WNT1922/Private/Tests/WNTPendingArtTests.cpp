#if WITH_DEV_AUTOMATION_TESTS
#include "WNTShipActor.h"
#include "WNTWorldActor.h"
#include "WNTProjection.h"
#include "Components/BoxComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Dom/JsonObject.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "HAL/FileManager.h"
#include "Misc/AutomationTest.h"
#include "Misc/CommandLine.h"
#include "Misc/FileHelper.h"
#include "Misc/Parse.h"
#include "Misc/Paths.h"
#include "Misc/ScopeExit.h"
#include "ProceduralMeshComponent.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

namespace
{
    UWorld* ArtTestWorld()
    {
        const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
            .CreatePhysicsScene(true).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
        return UWorld::CreateWorld(EWorldType::Game,false,MakeUniqueObjectName(GetTransientPackage(),UWorld::StaticClass(),TEXT("WNTPendingArtTest")),GetTransientPackage(),true,ERHIFeatureLevel::Num,&Init);
    }
    FString ArtRoot()
    {
        FString Root;if(!FParse::Value(FCommandLine::Get(),TEXT("WNTDataRoot="),Root))Root=FPaths::ConvertRelativePathToFull(FPaths::Combine(FPaths::ProjectDir(),TEXT("..")));return Root;
    }
    TSharedPtr<FJsonObject> Packet(const FString& Text)
    {
        TSharedPtr<FJsonObject> Result;FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text),Result);return Result;
    }
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTShipCollectionTest,"WNT.Ships.ModelCollection",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTShipCollectionTest::RunTest(const FString& Parameters)
{
    const FString Directory=FPaths::Combine(ArtRoot(),TEXT("assets/models/ships"));FString Text;
    if(!TestTrue(TEXT("Stored ship registry loads"),FFileHelper::LoadFileToString(Text,*FPaths::Combine(Directory,TEXT("index.json")))))return false;
    const auto Index=Packet(Text);const TArray<TSharedPtr<FJsonValue>>* Models=nullptr;
    if(!TestTrue(TEXT("Registry contains models"),Index&&Index->TryGetArrayField(TEXT("models"),Models)&&Models&&!Models->IsEmpty()))return false;
    UWorld* World=ArtTestWorld();if(!TestNotNull(TEXT("Registry policy test world"),World))return false;
    ON_SCOPE_EXIT{World->DestroyWorld(false);AWNTShipActor::ClearModelCache();};
    auto* Ship=World->SpawnActor<AWNTShipActor>();if(!TestNotNull(TEXT("Registry policy actor"),Ship))return false;
    int32 Detailed=0,References=0;
    for(const auto& Value:*Models)
    {
        const auto Entry=Value->AsObject();FString File;
        if(!TestTrue(TEXT("Registry has an asset filename"),Entry&&Entry->TryGetStringField(TEXT("file"),File)))continue;
        if(File.EndsWith(TEXT(".glb")))
        {
            ++Detailed;TestTrue(TEXT("Registered GLB file is present"),IFileManager::Get().FileSize(*FPaths::Combine(Directory,File))>20);
        }
        else
        {
            ++References;TestFalse(TEXT("Legacy JSON is never loaded as a native ship"),Ship->LoadModel(FPaths::Combine(Directory,File)));
            TestTrue(TEXT("Reference-only class is pending art, not a model failure"),Ship->IsModelPending()&&!Ship->HasModelLoadError()&&!Ship->HasRenderableModel());
        }
    }
    TestTrue(TEXT("Detailed registry coverage is nonempty"),Detailed>0);
    TestTrue(TEXT("Reference entries remain separate from detailed models"),Detailed+References==Models->Num());
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTPendingArtTest,"WNT.Ships.PendingArt",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTPendingArtTest::RunTest(const FString& Parameters)
{
    UWorld* World=ArtTestWorld();if(!TestNotNull(TEXT("Pending art test world"),World))return false;
    ON_SCOPE_EXIT{World->DestroyWorld(false);AWNTShipActor::ClearModelCache();};
    auto* Ship=World->SpawnActor<AWNTShipActor>();if(!TestNotNull(TEXT("Pending art actor"),Ship))return false;
    Ship->SetPendingModel();Ship->SelectionKey=TEXT("original-group:7");Ship->SetShipTransform(FVector(1000,2000,0),65);
    TestTrue(TEXT("Pending is distinct from failed and detailed"),Ship->IsModelPending()&&!Ship->HasModelLoadError()&&!Ship->HasRenderableModel());
    TestEqual(TEXT("Pending selection status"),Ship->GetVisualStatus(),FString(TEXT("pending-art")));
    TestTrue(TEXT("Pending never identifies an unrelated model"),Ship->ModelId.IsEmpty()&&Ship->DetailedMesh->GetStaticMesh()==nullptr);
    TestTrue(TEXT("Pending retains the real hull station and heading"),Ship->GetActorLocation().Equals(FVector(1000,2000,0))&&FMath::IsNearlyEqual(Ship->GetActorRotation().Yaw,65.));
    const FVector Camera(11000,2000,1500);const FRotator CameraRotation(-3,180,0);Ship->UpdateSymbolForCamera(Camera,CameraRotation);
    TestTrue(TEXT("Pending symbol is visible and query-selectable"),Ship->SymbolMesh->IsVisible()&&Ship->SymbolHitBox->GetCollisionEnabled()==ECollisionEnabled::QueryOnly);
    FHitResult Hit;const FVector Center=Ship->SymbolHitBox->GetComponentLocation();
    TestTrue(TEXT("Pending symbol answers a pick ray at close zoom"),Ship->SymbolHitBox->LineTraceComponent(Hit,Camera,Center-(Camera-Center),FCollisionQueryParams(SCENE_QUERY_STAT(WNTPendingArtPick),false)));
    bool Planar=true;const auto* Section=Ship->SymbolMesh->GetProcMeshSection(0);
    if(Section)for(const auto& Vertex:Section->ProcVertexBuffer)if(!FMath::IsNearlyZero(Vertex.Position.X))Planar=false;
    TestTrue(TEXT("Symbol is flat chart artwork, never a toy hull"),Section&&Planar);
    // SceneComponent converts rotations through FRotator, whose quaternion
    // singularity branch snaps near-vertical pitch to 90 degrees. A 0.1 degree
    // cone covers that engine conversion without permitting radial glyph roll.
    const double AlignmentCosine=FMath::Cos(FMath::DegreesToRadians(.1));
    for(const FRotator View : {FRotator(-90,0,0),FRotator(-89.999,132,0),FRotator(-32,57,11)})
        for(const double Side : {-1.,1.})
        {
            Ship->UpdateSymbolForCamera(FVector(Side*20000,5000,30000),View);
            TestTrue(FString::Printf(TEXT("Pending glyph keeps screen-up at %s, side %.0f"),*View.ToString(),Side),
                FVector::DotProduct(Ship->SymbolMesh->GetUpVector(),View.RotateVector(FVector::UpVector))>AlignmentCosine
                &&FVector::DotProduct(Ship->SymbolMesh->GetForwardVector(),-View.Vector())>AlignmentCosine);
        }
    Ship->SetModelCullDistance(50000);Ship->UpdateSymbolForCamera(FVector(1000000,0,0),CameraRotation);
    TestTrue(TEXT("An invisible distant symbol cannot steal picks"),!Ship->SymbolMesh->IsVisible()&&Ship->SymbolHitBox->GetCollisionEnabled()==ECollisionEnabled::NoCollision);
    const auto* HiddenGeometry=Ship->SymbolMesh->GetProcMeshSection(0)->ProcVertexBuffer.GetData();
    const auto* HiddenMaterial=Ship->SymbolMesh->GetMaterial(0);
    Ship->SetPendingModel();
    TestTrue(TEXT("Repeated pending packets reuse culled symbol geometry and material"),
        HiddenGeometry==Ship->SymbolMesh->GetProcMeshSection(0)->ProcVertexBuffer.GetData()
        &&HiddenMaterial==Ship->SymbolMesh->GetMaterial(0)&&!Ship->SymbolMesh->IsVisible());
    Ship->UpdateSymbolForCamera(Camera,CameraRotation);TestTrue(TEXT("Symbol returns on approach"),Ship->SymbolMesh->IsVisible()&&Ship->SymbolHitBox->GetCollisionEnabled()==ECollisionEnabled::QueryOnly);
    TestFalse(TEXT("Missing detailed GLB is an error"),Ship->LoadModel(FPaths::Combine(ArtRoot(),TEXT(".build/nonexistent-detailed-model.glb"))));
    TestTrue(TEXT("GLB failure is not silently counted as pending art"),Ship->HasModelLoadError()&&!Ship->IsModelPending()&&!Ship->HasRenderableModel());
    TestEqual(TEXT("Failure selection status"),Ship->GetVisualStatus(),FString(TEXT("model-error")));
    Ship->SetPendingModel();TestTrue(TEXT("An intentional pending transition clears the old failure"),Ship->IsModelPending()&&!Ship->HasModelLoadError());
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTPendingSceneIdentityTest,"WNT.World.PendingArtIdentity",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTPendingSceneIdentityTest::RunTest(const FString& Parameters)
{
    UWorld* World=ArtTestWorld();if(!TestNotNull(TEXT("Pending scene world"),World))return false;
    ON_SCOPE_EXIT{World->DestroyWorld(false);AWNTShipActor::ClearModelCache();};
    auto* Scene=World->SpawnActor<AWNTWorldActor>();if(!TestNotNull(TEXT("Pending scene"),Scene))return false;
    // No asset registry is installed in this isolated scene: every requested
    // class must remain a symbol instead of selecting a type fallback hull.
    const auto WorldPacket=Packet(TEXT(R"({"format":1,"campaign":"in_good_faith_1936","player":"USA","paused":true,"forces":[{"id":"force-1","name":"Original fleet","position":[-35,25],"heading":90,"hulls":[{"key":"h0","groupId":"g1","classId":"unmodeled-capital","type":"BB","hullIndex":0,"label":"Hull one","stationMeters":[0,0]},{"key":"h1","groupId":"g1","classId":"unmodeled-capital","type":"BB","hullIndex":1,"label":"Hull two","stationMeters":[200,0]}]}],"ports":[{"id":"test-port","name":"Test harbor","position":[-34,25],"owner":"USA"}]})"));
    // Match the real packet's chart geometry while deliberately leaving the
    // ship registry unavailable: no model fallback is permitted in this test.
    FString SymbolText;
    if(!TestTrue(TEXT("Shared chart symbols load independently of ship models"),
        FFileHelper::LoadFileToString(SymbolText,*FPaths::Combine(ArtRoot(),TEXT("assets/ui/map-symbols.json")))))return false;
    const auto Symbols=Packet(SymbolText);
    if(!TestNotNull(TEXT("Shared chart specification parses"),Symbols.Get()))return false;
    WorldPacket->SetObjectField(TEXT("chartSymbols"),Symbols);
    Scene->ApplyWorldPacket(WorldPacket);
    int32 Hulls=0,Ports=0;FVector First=FVector::ZeroVector,Second=FVector::ZeroVector;
    for(TActorIterator<AActor> It(World);It;++It)if(const auto Pick=Scene->GetSelection(*It))
    {
        if(auto* Ship=Cast<AWNTShipActor>(*It))
        {
            ++Hulls;TestEqual(TEXT("Hull group identity survives"),Pick->GetStringField(TEXT("id")),FString(TEXT("g1")));
            TestTrue(TEXT("Selection distinguishes pending model status"),Pick->GetBoolField(TEXT("modelPending"))&&!Pick->GetBoolField(TEXT("modelLoadError"))&&!Pick->GetBoolField(TEXT("detailedModel")));
            if(Pick->GetNumberField(TEXT("hullIndex"))==0)First=Ship->GetActorLocation();else Second=Ship->GetActorLocation();
        }
        else if(Pick->GetStringField(TEXT("kind"))==TEXT("port"))
        {
            ++Ports;TestEqual(TEXT("Port is explicitly a navigation symbol"),Pick->GetStringField(TEXT("visualStatus")),FString(TEXT("navigation-symbol")));
            TestTrue(TEXT("Port scenery is still pending"),Pick->GetBoolField(TEXT("pendingScenery")));
            TArray<UStaticMeshComponent*> Meshes;It->GetComponents(Meshes);TestEqual(TEXT("No cuboid port scenery is created"),Meshes.Num(),0);
        }
    }
    TestEqual(TEXT("One selectable symbol per real hull"),Hulls,2);TestEqual(TEXT("Three wrapped port symbols retain one port identity"),Ports,3);
    TestTrue(TEXT("First hull remains at the reported geographic station"),First.Equals(WNTProjection::Forward(FVector2D(-35,25)),.01));
    TestTrue(TEXT("Formation stations remain distinct"),FVector::Distance(First,Second)>10000);
    Scene->SetSceneMode(TEXT("battle"));
    Scene->ApplyBattlePacket(Packet(TEXT(R"({"id":"pending-battle","campaign":"in_good_faith_1936","units":[{"key":"battle-A-g1-0","id":"g1","side":"A","hullIndex":0,"classId":"unmodeled-capital","type":"BB","label":"Hull one","positionMetres":[123,456,0],"headingDegrees":32}]})")));
    int32 BattleHulls=0;
    for(TActorIterator<AWNTShipActor> It(World);It;++It)if(const auto Pick=Scene->GetSelection(*It))if(Pick->GetStringField(TEXT("kind"))==TEXT("battle-ship"))
    {
        ++BattleHulls;TestTrue(TEXT("Battle pending hull keeps exact position and remains selectable"),It->GetActorLocation().Equals(FVector(12300,45600,0))&&!It->IsHidden()&&It->GetActorEnableCollision());
        TestEqual(TEXT("Battle pending status"),Pick->GetStringField(TEXT("visualStatus")),FString(TEXT("pending-art")));
        TestEqual(TEXT("Battle side identity"),Pick->GetStringField(TEXT("side")),FString(TEXT("A")));
    }
    TestEqual(TEXT("One pending battle symbol"),BattleHulls,1);return true;
}
#endif
