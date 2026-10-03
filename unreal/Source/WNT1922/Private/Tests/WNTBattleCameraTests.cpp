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
    Event->SetStringField(TEXT("key"),TEXT("live-loss"));Event->SetStringField(TEXT("type"),TEXT("sink"));Packet->SetStringField(TEXT("eventKey"),TEXT("slice-4"));Director.SetPacket(Packet,102.8);
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
    const auto CriticalPacket=CameraPacket();CriticalPacket->SetStringField(TEXT("tacticalSessionId"),TEXT("critical-test"));
    CriticalPacket->SetNumberField(TEXT("durationSeconds"),20);CriticalPacket->SetNumberField(TEXT("elapsedSeconds"),0);
    Event->SetStringField(TEXT("key"),TEXT("routine-fire"));Event->SetStringField(TEXT("type"),TEXT("salvo"));Event->SetNumberField(TEXT("time"),2.6);
    CriticalPacket->SetArrayField(TEXT("events"),{MakeShared<FJsonValueObject>(Event)});
    FWNTBattleCameraDirector Critical;Critical.SetPacket(CriticalPacket,100);
    CriticalPacket->SetStringField(TEXT("eventKey"),TEXT("critical-2"));CriticalPacket->SetNumberField(TEXT("elapsedSeconds"),2.6);Critical.SetPacket(CriticalPacket,102.6);
    TestEqual(TEXT("The critical sequence begins with routine firing"),Critical.ActiveShot(102.6),FString(TEXT("firing")));
    Event->SetStringField(TEXT("key"),TEXT("confirmed-loss"));Event->SetStringField(TEXT("type"),TEXT("sink"));Event->SetNumberField(TEXT("time"),2.8);Event->SetNumberField(TEXT("duration"),5);
    CriticalPacket->SetStringField(TEXT("eventKey"),TEXT("critical-3"));CriticalPacket->SetNumberField(TEXT("elapsedSeconds"),2.8);Critical.SetPacket(CriticalPacket,102.8);
    TestEqual(TEXT("An immediate loss cannot cause a0.2-second camera cut"),Critical.ActiveShot(102.8),FString(TEXT("firing")));
    CriticalPacket->SetStringField(TEXT("eventKey"),TEXT("critical-4"));CriticalPacket->SetNumberField(TEXT("elapsedSeconds"),5.2);Critical.SetPacket(CriticalPacket,105.2);
    TestEqual(TEXT("A still-visible loss preempts a routine7.5-second hold after2.5s, even when its event is no longer new"),Critical.ActiveShot(105.2),FString(TEXT("sink")));
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
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTRollingClockTest,"WNT.Camera.RollingTacticalClock",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTRollingClockTest::RunTest(const FString&)
{
    FWNTRollingBattleClock Clock;const auto P=MakeShared<FJsonObject>();
    P->SetStringField(TEXT("tacticalSessionId"),TEXT("live"));P->SetNumberField(TEXT("timelineOriginSeconds"),0);
    P->SetNumberField(TEXT("secondsPerRealSecond"),60);P->SetNumberField(TEXT("at"),10);P->SetBoolField(TEXT("playbackPaused"),false);
    TestEqual(TEXT("First frame uses its requested clock"),Clock.Rebase(P,0,0,20),0.);
    TestEqual(TEXT("A delayed packet holds at its last actual ten-second observation"),Clock.ObservedSeconds(.4),10.);
    P->SetNumberField(TEXT("at"),20);
    const double Recovered=Clock.Rebase(P,.4,1./6.,20);
    TestEqual(TEXT("Overload recovery does not carry an unobserved 24 seconds into a 20-second packet"),Recovered,1./6.);
    TestEqual(TEXT("The known simulation instant stays monotonic across delayed delivery"),Clock.ObservedSeconds(Recovered),10.);
    TestTrue(TEXT("New observations interpolate after recovery instead of immediately jumping to the endpoint"),FMath::IsNearlyEqual(Clock.ObservedSeconds(Recovered+.05),13.));
    TestEqual(TEXT("A repeated stall still stops at the newly known endpoint"),Clock.ObservedSeconds(.8),20.);
    P->SetNumberField(TEXT("timelineOriginSeconds"),10);P->SetNumberField(TEXT("at"),30);
    const double Shifted=Clock.Rebase(P,.8,1./6.,20);
    TestTrue(TEXT("Changing rolling origin preserves the same last observed instant"),FMath::IsNearlyEqual(Shifted,1./6.)&&FMath::IsNearlyEqual(Clock.ObservedSeconds(Shifted),20.));
    P->SetNumberField(TEXT("at"),10);P->SetNumberField(TEXT("timelineOriginSeconds"),0);
    TestEqual(TEXT("An explicit backwards replay seek resets precisely"),Clock.Rebase(P,4,0,20),0.);
    P->SetNumberField(TEXT("at"),20);P->SetBoolField(TEXT("playbackPaused"),true);
    TestEqual(TEXT("A paused step uses its precise requested observation"),Clock.Rebase(P,4,.3,20),.3);
    FWNTRollingBattleClock WithinBounds;
    P->SetBoolField(TEXT("playbackPaused"),false);WithinBounds.Rebase(P,0,0,20);
    P->SetNumberField(TEXT("at"),30);
    TestEqual(TEXT("Already observed progress is preserved when a rolling window overlaps"),WithinBounds.Rebase(P,.2,1./6.,20),.2);
    return true;
}
#endif
