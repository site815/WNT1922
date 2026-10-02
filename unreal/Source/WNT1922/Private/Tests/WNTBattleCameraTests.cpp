#if WITH_DEV_AUTOMATION_TESTS
#include "Misc/AutomationTest.h"
#include "WNTBattleCameraDirector.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"

namespace
{
TSharedPtr<FJsonObject> CameraPacket()
{
    TSharedPtr<FJsonObject> Packet;
    FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(TEXT(R"({
      "id":"combat-1","eventKey":"movie-1","cameraDirector":true,"animate":true,
      "movie":true,"durationSeconds":30,"elapsedSeconds":0,"playbackPaused":false,
      "units":[
        {"key":"A:ship:0","side":"A","positionMetres":[0,0,0],"trajectory":[
          {"time":0,"positionMetres":[0,0,0],"headingDegrees":0},
          {"time":30,"positionMetres":[300,0,0],"headingDegrees":0}]},
        {"key":"B:ship:0","side":"B","positionMetres":[2000,0,0],"lostAtSeconds":16,"trajectory":[
          {"time":0,"positionMetres":[2000,0,0],"headingDegrees":180},
          {"time":30,"positionMetres":[1700,0,0],"headingDegrees":180}]}],
      "events":[
        {"key":"shot","type":"salvo","time":4,"sourceKey":"A:ship:0","targetKey":"B:ship:0"},
        {"key":"impact","type":"hit","time":10,"sourceKey":"A:ship:0","targetKey":"B:ship:0"},
        {"key":"loss","type":"sink","time":16,"sourceKey":"A:ship:0","targetKey":"B:ship:0"}]
    })")),Packet);
    return Packet;
}
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTBattleCameraTracksTest,"WNT.Camera.RecordedBattleDirector",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTBattleCameraTracksTest::RunTest(const FString& Parameters)
{
    const auto Packet=CameraPacket();FWNTBattleCameraDirector Director;Director.SetPacket(Packet,100);
    TestTrue(TEXT("Only an explicitly enabled battle packet starts cinematography"),Director.IsAvailable()&&Director.IsEnabled());
    TestEqual(TEXT("A readable establishing shot and three actual event shots are planned"),Director.ShotCount(),4);
    const auto Initial=Director.Evaluate(100,1.7),Firing=Director.Evaluate(104,1.7),Hit=Director.Evaluate(110,1.7),Sink=Director.Evaluate(117,1.7);
    if(!TestTrue(TEXT("Each actual phase supplies a camera pose"),Initial.IsSet()&&Firing.IsSet()&&Hit.IsSet()&&Sink.IsSet()))return false;
    TestEqual(TEXT("Camera first establishes the participating formations"),Initial->Shot,FString(TEXT("establish")));
    TestTrue(TEXT("Establishing view frames both actual positions"),FMath::Abs(Initial->Target.X-100000)<.01);
    TestEqual(TEXT("A firing shot follows the recorded attacker"),Firing->Shot,FString(TEXT("firing")));
    TestTrue(TEXT("The firing camera targets the interpolated moving hull, in centimeters"),FMath::Abs(Firing->Target.X-4000)<.01);
    TestEqual(TEXT("Impact framing changes to the recorded victim"),Hit->Shot,FString(TEXT("hit")));
    TestTrue(TEXT("The impact camera targets the victim's real interpolated position"),FMath::Abs(Hit->Target.X-190000)<.01);
    TestEqual(TEXT("The loss receives a dedicated sinking shot"),Sink->Shot,FString(TEXT("sink")));
    TestTrue(TEXT("A sinking camera follows the loss position rather than a later course point"),FMath::Abs(Sink->Target.X-184000)<.01);
    Director.SetPacket(Packet,108);
    TestEqual(TEXT("Repeated selection packets cannot restart the timeline"),Director.Elapsed(110),10.);
    Packet->SetBoolField(TEXT("playbackPaused"),true);Packet->SetNumberField(TEXT("elapsedSeconds"),10);Director.SetPacket(Packet,110);
    TestEqual(TEXT("Pausing freezes both ship-relative camera time and effects time"),Director.Elapsed(125),10.);
    Director.SetEnabled(false);Director.SetPacket(Packet,126);
    TestFalse(TEXT("Manual control survives selection refreshes"),Director.IsEnabled());
    Director.SetEnabled(true);TestTrue(TEXT("Fit/Auto can restore the director"),Director.IsEnabled());
    Packet->SetBoolField(TEXT("cameraDirector"),false);Director.SetPacket(Packet,127);
    TestFalse(TEXT("Gallery/manual packets never run an automatic camera"),Director.IsAvailable());
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTBattleCameraLiveTest,"WNT.Camera.LiveBattleHoldsAndSmoothing",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTBattleCameraLiveTest::RunTest(const FString& Parameters)
{
    const auto Packet=CameraPacket();Packet->SetStringField(TEXT("tacticalSessionId"),TEXT("standalone-42"));
    Packet->SetNumberField(TEXT("durationSeconds"),.167);
    auto Event=MakeShared<FJsonObject>();Event->SetStringField(TEXT("key"),TEXT("live-shot"));Event->SetStringField(TEXT("type"),TEXT("salvo"));
    Event->SetNumberField(TEXT("time"),.05);Event->SetStringField(TEXT("sourceKey"),TEXT("A:ship:0"));Event->SetStringField(TEXT("targetKey"),TEXT("B:ship:0"));
    Packet->SetArrayField(TEXT("events"),{MakeShared<FJsonValueObject>(Event)});
    FWNTBattleCameraDirector Director;Director.SetPacket(Packet,100);
    TestEqual(TEXT("Live packets begin with one establishing shot"),Director.ActiveShot(100),FString(TEXT("establish")));
    Packet->SetStringField(TEXT("eventKey"),TEXT("slice-2"));Director.SetPacket(Packet,101);
    TestEqual(TEXT("New10-second simulation slices do not restart or prematurely replace the establishing shot"),Director.ActiveShot(101),FString(TEXT("establish")));
    Packet->SetStringField(TEXT("eventKey"),TEXT("slice-3"));Director.SetPacket(Packet,102.6);
    TestEqual(TEXT("A real live salvo chooses a firing shot after the minimum establishing hold"),Director.ActiveShot(102.6),FString(TEXT("firing")));
    Event->SetStringField(TEXT("type"),TEXT("sink"));Packet->SetStringField(TEXT("eventKey"),TEXT("slice-4"));Director.SetPacket(Packet,102.8);
    TestEqual(TEXT("Rapid new event keys cannot cause camera whiplash"),Director.ActiveShot(102.8),FString(TEXT("firing")));
    Packet->SetStringField(TEXT("eventKey"),TEXT("slice-5"));Director.SetPacket(Packet,107.2);
    TestEqual(TEXT("A later actual sinking receives focus after the hold expires"),Director.ActiveShot(107.2),FString(TEXT("sink")));
    Director.SetEnabled(false);Packet->SetStringField(TEXT("eventKey"),TEXT("slice-6"));Director.SetPacket(Packet,107.4);
    TestFalse(TEXT("Manual camera override survives new live simulation frames"),Director.IsEnabled());
    FWNTBattleCameraDirector::FView Before,After;Before.Yaw=179;After.Yaw=-179;After.Target=FVector(100000,0,0);After.Distance=100000;
    const auto Smooth=FWNTBattleCameraDirector::Ease(Before,After,1./60);
    TestTrue(TEXT("A shot transition moves gradually rather than teleporting"),Smooth.Target.X>0&&Smooth.Target.X<10000);
    TestTrue(TEXT("Yaw interpolation takes the short path through the180-degree boundary"),FMath::Abs(FMath::FindDeltaAngleDegrees(179.,Smooth.Yaw))<1.);
    TestTrue(TEXT("Camera range eases in log space without crossing through the hull"),Smooth.Distance>After.Distance&&Smooth.Distance<Before.Distance);
    return true;
}
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTBattleCameraCutsTest,"WNT.Camera.RemoteActionCutsAndLocalTracking",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTBattleCameraCutsTest::RunTest(const FString& Parameters)
{
    FWNTBattleCameraDirector::FView Current,Impact;Current.Distance=33000000.;Impact.Distance=105000.;Impact.Shot=TEXT("hit");
    for(double Metres:{120000.,220000.})
    {
        Impact.Target=FVector(Metres*100.,0,1200);
        TestTrue(TEXT("A distant carrier-strike victim receives a direct shot, not empty ocean during descent"),FWNTBattleCameraDirector::NeedsCut(Current,Impact));
        Current.Distance=105000.;
        TestTrue(TEXT("Changing between remote fleet close-ups also cuts"),FWNTBattleCameraDirector::NeedsCut(Current,Impact));
    }
    Current.Target=Impact.Target;Impact.Target+=FVector(15000,8000,0);
    TestFalse(TEXT("Ordinary ship movement retains smooth following"),FWNTBattleCameraDirector::NeedsCut(Current,Impact));
    const auto Follow=FWNTBattleCameraDirector::Ease(Current,Impact,1./60);
    TestTrue(TEXT("A close tracking sample approaches its target gradually"),FVector::Dist(Follow.Target,Impact.Target)<FVector::Dist(Current.Target,Impact.Target)&&!Follow.Target.Equals(Impact.Target));
    Impact.Target=FVector::ZeroVector;Impact.Distance=33000000.;Impact.Shot=TEXT("establish");
    TestFalse(TEXT("A wide reveal can still ease outward while framing the fleets"),FWNTBattleCameraDirector::NeedsCut(Current,Impact));
    const auto Packet=CameraPacket();const auto Remote=Packet->GetArrayField(TEXT("units"))[1]->AsObject();
    Remote->SetArrayField(TEXT("positionMetres"),{MakeShared<FJsonValueNumber>(220000),MakeShared<FJsonValueNumber>(0),MakeShared<FJsonValueNumber>(0)});
    Remote->SetArrayField(TEXT("trajectory"),{});
    FWNTBattleCameraDirector Director;Director.SetPacket(Packet,100);
    const auto Wide=Director.Evaluate(100,1.7),Attack=Director.Evaluate(110,1.7);
    TestTrue(TEXT("Above20km the establishing pose stays near overhead and north-up"),Wide.IsSet()&&Wide->Distance>2000000.&&Wide->Tilt==25.&&Wide->Yaw==0.);
    TestTrue(TEXT("A remote impact still uses the close oblique cinematic pose at the real victim"),Attack.IsSet()&&Attack->Tilt==58.&&Attack->Distance==105000.&&Attack->Target.X==22000000.);
    return true;
}
#endif
