#include "WNTBattleAircraft.h"
#include "Components/InstancedStaticMeshComponent.h"
#include "Dom/JsonObject.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "GameFramework/Actor.h"
#include "GameFramework/PlayerController.h"
#include "Camera/PlayerCameraManager.h"
#include "Misc/Paths.h"
#include "glTFRuntimeAsset.h"
#include "glTFRuntimeFunctionLibrary.h"

namespace
{
FString AirText(const TSharedPtr<FJsonObject>& O,const TCHAR* K){FString V;if(O)O->TryGetStringField(K,V);return V;}
double AirNumber(const TSharedPtr<FJsonObject>& O,const TCHAR* K,double D=0){double V;return O&&O->TryGetNumberField(K,V)&&FMath::IsFinite(V)?V:D;}
}
void FWNTBattleAircraft::SetPacket(const TSharedPtr<FJsonObject>& Packet,const FString& DataRoot)
{
    DataDirectory=DataRoot;Wings.Reset();Runs.Reset();if(!Packet)return;
    const TArray<TSharedPtr<FJsonValue>>* Values=nullptr;if(!Packet->TryGetArrayField(TEXT("airstrikes"),Values))return;
    for(const auto& Value:*Values)
    {
        if(Wings.Num()>=256)break;const auto O=Value->AsObject();if(!O)continue;
        FWing W;W.Key=AirText(O,TEXT("key"));W.Side=AirText(O,TEXT("side"));W.Role=AirText(O,TEXT("aircraftType"));
        W.Planes=FMath::Clamp(int32(AirNumber(O,TEXT("planes"))),0,10000);W.Fighters=FMath::Clamp(int32(AirNumber(O,TEXT("fighters"))),0,10000);
        W.Track.Read(O,AirNumber(Packet,TEXT("durationSeconds"),15));if(W.Key.IsEmpty()||W.Track.Points.IsEmpty())continue;
        const TArray<TSharedPtr<FJsonValue>>* Points=nullptr;if(O->TryGetArrayField(TEXT("trajectory"),Points))for(const auto& V:*Points)
        {
            if(W.Counts.Num()>=128)break;const auto P=V->AsObject();if(!P)continue;
            const double At=AirNumber(P,TEXT("time"),-1);if(At<0||(!W.Counts.IsEmpty()&&At<=W.Counts.Last().At))continue;
            W.Counts.Add({At,FMath::Clamp(int32(AirNumber(P,TEXT("planes"))),0,10000),FMath::Clamp(int32(AirNumber(P,TEXT("fighters"))),0,10000)});
        }
        Wings.Add(MoveTemp(W));
    }
    if(Packet->TryGetArrayField(TEXT("events"),Values))for(const auto& Value:*Values)
    {
        if(Runs.Num()>=128)break;const auto E=Value->AsObject();if(!E||AirText(E,TEXT("weapon"))!=TEXT("air")||AirText(E,TEXT("type"))!=TEXT("salvo"))continue;
        const FString Key=AirText(E,TEXT("strikeId"));const auto* Wing=Wings.FindByPredicate([&](const FWing& W){return W.Key==Key;});if(!Wing)continue;
        const TArray<TSharedPtr<FJsonValue>>* P=nullptr;if(!E->TryGetArrayField(TEXT("targetPositionMetres"),P)||P->Num()!=3)continue;
        FRun R;R.Wing=Key;R.Side=Wing->Side;R.Role=Wing->Role;R.At=AirNumber(E,TEXT("time"));
        for(int32 I=0;I<3;++I)R.Target[I]=(*P)[I]->AsNumber()*100.;if(R.Target.ContainsNaN())continue;
        R.Yaw=Wing->Track.Sample(FMath::Max(0.,R.At-.15)).Rotator().Yaw;
        R.Planes=FMath::Clamp(int32(AirNumber(E,TEXT("planes"))),0,10000);R.Lost=FMath::Clamp(int32(AirNumber(E,TEXT("planesLost"))),0,10000);
        if(R.Planes+R.Lost>0)Runs.Add(MoveTemp(R));
    }
}
int32 FWNTBattleAircraft::LoadedPoolCount() const {int32 N=0;for(const auto& P:Pools)N+=P.IsValid()?1:0;return N;}
FVector FWNTBattleAircraft::FormationOffset(int32 Index,bool bEscort)
{
    // Three-plane V elements. Real count is retained separately; these are exemplars.
    const int32 Row=Index/3,Slot=Index%3;const double Side=Slot==1?-1.:Slot==2?1.:0.;
    return FVector(-Row*5200.-FMath::Abs(Side)*2100.,Side*3500.+(Row%2?1800.:-1800.),bEscort?18000.:Row*250.);
}
void FWNTBattleAircraft::WarmOnePool(AActor* Owner)
{
    if(!Owner||!Owner->GetRootComponent()||DataDirectory.IsEmpty()||NextPool>=6)return;
    const int32 Index=NextPool++;const TCHAR* Roles[]={TEXT("fighter"),TEXT("dive-bomber"),TEXT("torpedo-bomber")};
    const FString Filename=FPaths::Combine(DataDirectory,TEXT("assets/models/aircraft"),FString::Printf(TEXT("%s-%s.glb"),Index<3?TEXT("a"):TEXT("b"),Roles[Index%3]));
    FglTFRuntimeConfig Loader;Loader.TransformBaseType=EglTFRuntimeTransformBaseType::YForward;Loader.SceneScale=100.f;Loader.bAllowExternalFiles=false;Loader.bNoArchive=true;
    auto* Asset=UglTFRuntimeFunctionLibrary::glTFLoadAssetFromFilename(Filename,false,Loader);if(!Asset)return;
    FglTFRuntimeStaticMeshConfig Config;Config.Outer=Owner->GetWorld();Config.bBuildComplexCollision=false;Config.bBuildLumenCards=false;
    Config.MaterialsConfig.ImagesConfig.bStreaming=false;
    auto* Mesh=Asset->LoadStaticMeshRecursive(TEXT(""),{},Config);if(!Mesh)return;
    auto* Pool=NewObject<UInstancedStaticMeshComponent>(Owner,*FString::Printf(TEXT("BattleAircraft%d"),Index));
    Owner->AddInstanceComponent(Pool);Pool->SetupAttachment(Owner->GetRootComponent());Pool->SetMobility(EComponentMobility::Movable);
    Pool->SetStaticMesh(Mesh);Pool->SetCastShadow(false);Pool->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Pool->SetGenerateOverlapEvents(false);Pool->SetCanEverAffectNavigation(false);Pool->SetAffectDistanceFieldLighting(false);Pool->RegisterComponent();
    for(int32 I=0;I<SlotsPerPool;++I)Pool->AddInstance(FTransform(FQuat::Identity,FVector::ZeroVector,FVector::ZeroVector));
    Pool->SetVisibility(false);Pools[Index]=Pool;
}
void FWNTBattleAircraft::SetVisible(bool bVisible)
{if(!bVisible){Drawn=0;for(auto& P:Pools)if(auto* C=P.Get())C->SetVisibility(false);}}
void FWNTBattleAircraft::Update(AActor* Owner,double Elapsed,bool bVisible)
{
    if(!bVisible){SetVisible(false);return;}WarmOnePool(Owner);
    const auto* PC=Owner&&Owner->GetWorld()?Owner->GetWorld()->GetFirstPlayerController():nullptr;
    const auto* Camera=PC?PC->PlayerCameraManager.Get():nullptr;
    const FVector Eye=Camera?Camera->GetCameraLocation():FVector::ZeroVector;
    TArray<const FWing*> Visible;
    for(const auto& W:Wings)if(W.Track.HasAppeared(Elapsed)&&!W.Track.HasDeparted(Elapsed))Visible.Add(&W);
    Visible.Sort([&](const FWing& A,const FWing& B){return FVector::DistSquared(A.Track.Sample(Elapsed).GetLocation(),Eye)<FVector::DistSquared(B.Track.Sample(Elapsed).GetLocation(),Eye);});
    Drawn=0;for(auto& T:Transforms)T.Reset();
    TSet<FString> Attacking;
    // These are representative visual attack runs, not extra simulated planes.
    // Damage and the aggregate survivor count remain the recorded event's result.
    for(const auto& R:Runs)
    {
        const double Age=Elapsed-R.At;if(Age<-.8||Age>2.4||Drawn>=MaxAircraft)continue;
        if(Camera&&FVector::DistSquared(R.Target,Eye)>FMath::Square(3000000.))continue;
        Attacking.Add(R.Wing);const int32 Pool=(R.Side==TEXT("B")?3:0)+(R.Role==TEXT("torpedo-bomber")?2:1);
        if(!Pools[Pool].IsValid())continue;
        const int32 Count=FMath::Min(8,R.Planes+R.Lost),LostCount=FMath::Min(Count,FMath::RoundToInt(double(Count)*R.Lost/FMath::Max(1,R.Planes+R.Lost)));
        const FRotator Course(0,R.Yaw,0);
        for(int32 I=0;I<Count&&Drawn<MaxAircraft&&Transforms[Pool].Num()<SlotsPerPool;++I)
        {
            const double Phase=Age-I*.035;const bool Lost=I<LostCount&&Phase>0;
            const double Height=R.Role==TEXT("torpedo-bomber")?7000.:FMath::Max(14000.,14000.+FMath::Abs(Phase)*36000.);
            FVector Offset(Phase*48000.,(I-(Count-1)*.5)*2600.,Height);
            if(Lost){Offset.Z=FMath::Max(-1500.,Height-Phase*Phase*45000.);if(Offset.Z<0)continue;}
            FRotator Rotation(Lost?-Phase*35.:(Phase<0?-35.:18.),R.Yaw,Lost?Phase*170.:FMath::Clamp(Phase*16.,-18.,28.));
            Transforms[Pool].Add(FTransform(Rotation,R.Target+Course.RotateVector(Offset)));++Drawn;
        }
    }
    for(const auto* W:Visible)
    {
        if(Drawn>=MaxAircraft)break;
        if(Attacking.Contains(W->Key))continue;
        FIntPoint Count(W->Planes,W->Fighters);for(const auto& C:W->Counts){if(C.At>Elapsed)break;Count=FIntPoint(C.Planes,C.Fighters);}
        const FTransform Pose=W->Track.Sample(Elapsed);if(Camera&&FVector::DistSquared(Pose.GetLocation(),Eye)>FMath::Square(3000000.))continue;
        const FTransform Ahead=W->Track.Sample(Elapsed+.06),Behind=W->Track.Sample(FMath::Max(0.,Elapsed-.06));
        const FVector Travel=Ahead.GetLocation()-Behind.GetLocation();FRotator Rotation=Pose.Rotator();
        if(Travel.SizeSquared()>1.)Rotation.Pitch=FMath::Clamp(Travel.Rotation().Pitch,-40.,30.);
        Rotation.Roll=FMath::Clamp(-FMath::FindDeltaAngleDegrees(Behind.Rotator().Yaw,Ahead.Rotator().Yaw)*3.,-28.,28.);
        for(int32 Escort=0;Escort<2;++Escort)
        {
            const int32 Index=(W->Side==TEXT("B")?3:0)+(Escort?0:W->Role==TEXT("torpedo-bomber")?2:W->Role==TEXT("fighter")?0:1);
            if(!Pools[Index].IsValid())continue;
            const int32 Number=RepresentativeCount(Escort?Count.Y:Count.X,Escort!=0);
            for(int32 I=0;I<Number&&Drawn<MaxAircraft&&Transforms[Index].Num()<SlotsPerPool;++I)
            {Transforms[Index].Add(FTransform(Rotation,Pose.TransformPosition(FormationOffset(I,Escort!=0))));++Drawn;}
        }
    }
    for(int32 I=0;I<6;++I)if(auto* P=Pools[I].Get())
    {
        const int32 Count=Transforms[I].Num();while(Transforms[I].Num()<PreviousCount[I])Transforms[I].Add(FTransform(FQuat::Identity,FVector::ZeroVector,FVector::ZeroVector));
        if(!Transforms[I].IsEmpty())P->BatchUpdateInstancesTransforms(0,Transforms[I],true,true,true);
        P->SetVisibility(Count>0);PreviousCount[I]=Count;
    }
}

#if WITH_DEV_AUTOMATION_TESTS
#include "Misc/AutomationTest.h"
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTAircraftFormationTest,"WNT.World.TacticalAircraftFormation",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTAircraftFormationTest::RunTest(const FString&)
{
    TestEqual(TEXT("A small wing keeps one mesh for each real aircraft"),FWNTBattleAircraft::RepresentativeCount(5,false),5);
    TestEqual(TEXT("Large strike wings are explicitly bounded representatives"),FWNTBattleAircraft::RepresentativeCount(90,false),18);
    TestEqual(TEXT("Escort count is bounded separately"),FWNTBattleAircraft::RepresentativeCount(40,true),6);
    TestEqual(TEXT("Lost aircraft never generate a negative count"),FWNTBattleAircraft::RepresentativeCount(-1,false),0);
    for(int32 I=0;I<18;++I)for(int32 J=I+1;J<18;++J)TestTrue(TEXT("Aircraft have distinct formation positions"),FVector::Distance(FWNTBattleAircraft::FormationOffset(I,false),FWNTBattleAircraft::FormationOffset(J,false))>1500.);
    TestTrue(TEXT("Escorts fly above attack elements"),FWNTBattleAircraft::FormationOffset(0,true).Z>FWNTBattleAircraft::FormationOffset(0,false).Z);
    return true;
}
#endif
