#if WITH_DEV_AUTOMATION_TESTS
#include "WNTShipActor.h"
#include "WNTWorldActor.h"
#include "Components/StaticMeshComponent.h"
#include "Dom/JsonObject.h"
#include "Engine/World.h"
#include "EngineUtils.h"
#include "Misc/AutomationTest.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "Misc/Paths.h"
#include "Misc/ScopeExit.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTShipStreamingTest,"WNT.Ships.CameraDrivenResidency",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTShipStreamingTest::RunTest(const FString& Parameters)
{
    FString Root;
    if(!FParse::Value(FCommandLine::Get(),TEXT("WNTDataRoot="),Root))
        Root=FPaths::ConvertRelativePathToFull(FPaths::Combine(FPaths::ProjectDir(),TEXT("..")));
    const FString Model=FPaths::Combine(Root,TEXT("assets/models/ships/generic/liberty-ec2-sc1.glb"));
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
        .CreatePhysicsScene(true).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,MakeUniqueObjectName(GetTransientPackage(),UWorld::StaticClass(),TEXT("WNTShipStreamingTest")),GetTransientPackage(),true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Streaming test world"),World))return false;
    AWNTShipActor::ClearModelCache();
    ON_SCOPE_EXIT{World->DestroyWorld(false);AWNTShipActor::ClearModelCache();};
    auto* Ship=World->SpawnActor<AWNTShipActor>();auto* Sister=World->SpawnActor<AWNTShipActor>();
    if(!TestTrue(TEXT("Streaming test ships"),Ship&&Sister))return false;
    Ship->SetModelReference(Model);Ship->SetModelCullDistance(2000000.0f);
    TestTrue(TEXT("Declared artwork is deferred, not missing or failed"),Ship->IsModelDeferred()&&!Ship->IsModelPending()&&!Ship->HasModelLoadError()&&!Ship->HasRenderableModel());
    TestEqual(TEXT("Deferred selection is explicit"),Ship->GetVisualStatus(),FString(TEXT("model-not-loaded")));
    Ship->RefreshModelForCamera(FVector(7000000,0,0),true);
    TestTrue(TEXT("Distant fleet reference does not allocate geometry"),Ship->IsModelDeferred()&&Ship->DetailedMesh->GetStaticMesh()==nullptr);
    Ship->RefreshModelForCamera(FVector(100000,0,0),false);
    if(!TestTrue(TEXT("Camera approach loads immediately without waiting for refresh interval"),Ship->HasRenderableModel()&&!Ship->IsModelDeferred()))return false;
    UStaticMesh* Shared=Ship->DetailedMesh->GetStaticMesh();
    Sister->SetModelReference(Model);Sister->RefreshModelForCamera(FVector(100000,0,0),false);
    TestTrue(TEXT("Sister ships share the same resident geometry"),Sister->DetailedMesh->GetStaticMesh()==Shared);
    Ship->SetModelReference(Model);
    TestTrue(TEXT("Repeated campaign references retain loaded geometry"),Ship->DetailedMesh->GetStaticMesh()==Shared);
    Ship->RefreshModelForCamera(FVector(3500000,0,0),false);Ship->UpdateSymbolForCamera(FVector(3500000,0,0),FRotator::ZeroRotator);
    TestTrue(TEXT("Hysteresis retains hidden geometry outside load range"),Ship->HasRenderableModel()&&!Ship->IsDetailedModelVisible());
    Ship->RefreshModelForCamera(FVector(6500000,0,0),false);
    TestTrue(TEXT("Leaving release range drops mesh and collision references"),Ship->IsModelDeferred()&&Ship->DetailedMesh->GetStaticMesh()==nullptr&&Ship->DetailedMesh->GetCollisionEnabled()==ECollisionEnabled::NoCollision);
    TestTrue(TEXT("Releasing one hull does not unload a nearby sister"),Sister->DetailedMesh->GetStaticMesh()==Shared);
    Ship->RefreshModelForCamera(FVector(2500000,0,0),false);
    TestTrue(TEXT("Approach reacquires preserved model reference and shared geometry"),Ship->DetailedMesh->GetStaticMesh()==Shared&&!Ship->IsModelPending());
    Ship->SetModelReference(Model+TEXT("-missing.glb"));
    TestTrue(TEXT("Changed reference cannot retain unrelated hull geometry"),Ship->IsModelDeferred()&&!Ship->HasRenderableModel());
    Ship->RefreshModelForCamera(FVector(100000,0,0),false);
    TestTrue(TEXT("A nearby missing file becomes an explicit load error"),Ship->HasModelLoadError()&&!Ship->IsModelDeferred()&&!Ship->IsModelPending());
    Ship->SetPendingModel();
    TestTrue(TEXT("Pending art removes the declared model reference"),Ship->IsModelPending()&&!Ship->IsModelDeferred()&&!Ship->HasModelLoadError());
    return true;
}
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTShipSceneResidencyTest,"WNT.Ships.SceneTransitionResidency",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTShipSceneResidencyTest::RunTest(const FString& Parameters)
{
    FString Root;
    if(!FParse::Value(FCommandLine::Get(),TEXT("WNTDataRoot="),Root))
        Root=FPaths::ConvertRelativePathToFull(FPaths::Combine(FPaths::ProjectDir(),TEXT("..")));
    const FString Model=FPaths::Combine(Root,TEXT("assets/models/ships/generic/liberty-ec2-sc1.glb"));
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
        .CreatePhysicsScene(true).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,MakeUniqueObjectName(GetTransientPackage(),UWorld::StaticClass(),TEXT("WNTShipSceneResidencyTest")),GetTransientPackage(),true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Scene residency test world"),World))return false;
    AWNTShipActor::ClearModelCache();
    ON_SCOPE_EXIT{World->DestroyWorld(false);AWNTShipActor::ClearModelCache();};
    auto* Scene=World->SpawnActor<AWNTWorldActor>();
    if(!TestNotNull(TEXT("Scene residency owner"),Scene))return false;
    auto Packet=[](const FString& Text)
    {
        TSharedPtr<FJsonObject> Result;
        FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text),Result);
        return Result;
    };
    const auto WorldPacket=Packet(TEXT(R"({"format":1,"campaign":"in_good_faith_1936","paused":true,"forces":[{"id":"residency-force","name":"Residency fleet","position":[0,0],"heading":0,"hulls":[{"key":"world-hull","groupId":"world-group","classId":"test-reference","type":"CL","hullIndex":0,"label":"World hull","stationMeters":[0,0]}]}]})"));
    const auto BattlePacket=Packet(TEXT(R"({"id":"residency-battle","units":[{"key":"battle-hull","id":"battle-group","side":"A","hullIndex":0,"classId":"test-reference","type":"CL","label":"Battle hull","positionMetres":[250,100,0],"headingDegrees":45}]})"));
    if(!TestTrue(TEXT("Residency scene fixtures parse"),WorldPacket.IsValid()&&BattlePacket.IsValid()))return false;
    // Register real scene actors through the production packet path. This
    // isolated test then assigns a known GLB without loading global terrain.
    Scene->ApplyWorldPacket(WorldPacket);Scene->ApplyBattlePacket(BattlePacket);
    AWNTShipActor* WorldShip=nullptr;AWNTShipActor* BattleShip=nullptr;
    for(TActorIterator<AWNTShipActor> It(World);It;++It)
        if(It->SelectionKey==TEXT("world-hull"))WorldShip=*It;
        else if(It->SelectionKey==TEXT("battle-hull"))BattleShip=*It;
    if(!TestTrue(TEXT("Both scene collections retain selectable actors"),WorldShip&&BattleShip))return false;
    WorldShip->SetModelReference(Model);BattleShip->SetModelReference(Model);
    const FTransform WorldPose=WorldShip->GetActorTransform(),BattlePose=BattleShip->GetActorTransform();
    const FString ModelId=WorldShip->ModelId;
    WorldShip->RefreshModelForCamera(WorldShip->GetActorLocation(),false);
    if(!TestTrue(TEXT("Initial world hull has real resident GLB geometry"),WorldShip->HasRenderableModel()))return false;
    UStaticMesh* WorldMesh=WorldShip->DetailedMesh->GetStaticMesh();
    Scene->SetSceneMode(TEXT("world"));Scene->SetSceneMode(TEXT("world"));
    TestTrue(TEXT("Recurring world activation does not release the active mesh"),WorldShip->DetailedMesh->GetStaticMesh()==WorldMesh);
    Scene->SetSceneMode(TEXT("battle"));
    TestTrue(TEXT("World-to-battle drops inactive strong mesh and collision references"),WorldShip->IsModelDeferred()&&!WorldShip->HasRenderableModel()&&WorldShip->DetailedMesh->GetCollisionEnabled()==ECollisionEnabled::NoCollision&&WorldShip->IsHidden());
    TestEqual(TEXT("Released world hull keeps model identity"),WorldShip->ModelId,ModelId);
    BattleShip->RefreshModelForCamera(BattleShip->GetActorLocation(),false);
    if(!TestTrue(TEXT("Battle activates the declared detailed model"),BattleShip->HasRenderableModel()&&!BattleShip->IsHidden()))return false;
    UStaticMesh* BattleMesh=BattleShip->DetailedMesh->GetStaticMesh();
    Scene->SetSceneMode(TEXT("battle"));Scene->SetSceneMode(TEXT("battle"));
    TestTrue(TEXT("Recurring battle activation leaves active geometry resident"),BattleShip->DetailedMesh->GetStaticMesh()==BattleMesh);
    Scene->SetSceneMode(TEXT("hidden"));Scene->SetSceneMode(TEXT("hidden"));
    TestTrue(TEXT("Hidden mode leaves neither collection holding detailed geometry"),WorldShip->IsModelDeferred()&&BattleShip->IsModelDeferred()&&!WorldShip->HasRenderableModel()&&!BattleShip->HasRenderableModel()&&WorldShip->IsHidden()&&BattleShip->IsHidden());
    TestTrue(TEXT("Inactive actors retain their formation and battle poses"),WorldShip->GetActorTransform().Equals(WorldPose)&&BattleShip->GetActorTransform().Equals(BattlePose));
    Scene->SetSceneMode(TEXT("world"));
    WorldShip->RefreshModelForCamera(WorldShip->GetActorLocation(),false);
    TestTrue(TEXT("World reactivation reloads from the retained source without a new packet"),WorldShip->HasRenderableModel()&&!WorldShip->IsHidden()&&BattleShip->IsHidden()&&!BattleShip->HasRenderableModel());
    Scene->SetSceneMode(TEXT("battle"));
    BattleShip->RefreshModelForCamera(BattleShip->GetActorLocation(),false);
    TestTrue(TEXT("Battle reactivation reloads from the retained source without a new packet"),BattleShip->HasRenderableModel()&&!BattleShip->IsHidden()&&WorldShip->IsModelDeferred());
    Scene->SetSceneMode(TEXT("world"));
    TestTrue(TEXT("Closing battle releases its mesh immediately"),!BattleShip->HasRenderableModel()&&BattleShip->IsModelDeferred());
    const auto WorldPick=Scene->GetSelection(WorldShip),BattlePick=Scene->GetSelection(BattleShip);
    if(TestTrue(TEXT("Selection records survive every transition"),WorldPick.IsValid()&&BattlePick.IsValid()))
    {
        TestEqual(TEXT("World group identity survives release/reload"),WorldPick->GetStringField(TEXT("id")),FString(TEXT("world-group")));
        TestEqual(TEXT("Battle group identity survives release/reload"),BattlePick->GetStringField(TEXT("id")),FString(TEXT("battle-group")));
        TestEqual(TEXT("Battle side identity survives release/reload"),BattlePick->GetStringField(TEXT("side")),FString(TEXT("A")));
    }
    return true;
}
#endif
