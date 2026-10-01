#if WITH_DEV_AUTOMATION_TESTS
#include "Misc/AutomationTest.h"
#include "WNTPlayerController.h"
#include "WNTProjection.h"
#include "WNTWorldActor.h"
#include "Camera/PlayerCameraManager.h"
#include "Engine/World.h"
#include "Misc/ScopeExit.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTRebaseHistoryTest,"WNT.Camera.RebaseResetsTemporalHistory",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTRebaseHistoryTest::RunTest(const FString& Parameters)
{
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
        .CreatePhysicsScene(true).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,MakeUniqueObjectName(GetTransientPackage(),UWorld::StaticClass(),TEXT("WNTRebaseHistoryTest")),GetTransientPackage(),true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Rebase test world"),World))return false;
    ON_SCOPE_EXIT{World->DestroyWorld(false);};
    auto* Controller=World->SpawnActor<APlayerController>();
    auto* Scene=World->SpawnActor<AWNTWorldActor>();
    if(!TestTrue(TEXT("Real scene and player controller exist"),Controller&&Scene))return false;
    // This isolated world intentionally never begins play. SpawnActor therefore
    // does not run the controller's PostInitializeComponents registration;
    // mirror that lifecycle step before testing the real player-camera lookup.
    World->AddController(Controller);
    if(!TestTrue(TEXT("Fixture controller is registered in its world's player list"),World->GetFirstPlayerController()==Controller))return false;
    if(!Controller->PlayerCameraManager)Controller->PlayerCameraManager=World->SpawnActor<APlayerCameraManager>();
    auto* Camera=Controller->PlayerCameraManager.Get();
    if(!TestNotNull(TEXT("Real camera manager exists"),Camera))return false;
    auto Check=[&](double Meridian,bool Expected,const TCHAR* Label)
    {
        Camera->bGameCameraCutThisFrame=false;
        Scene->SetCentralMeridian(Meridian);
        TestEqual(Label,bool(Camera->bGameCameraCutThisFrame),Expected);
    };
    Check(0,false,TEXT("Initial stationary chart keeps its temporal history"));
    Check(179,true,TEXT("Moving chart origin invalidates old route and marker history"));
    Check(179,false,TEXT("Repeated same origin does not continually reset TSR"));
    Check(539,false,TEXT("Equivalent wrapped longitude is not a new rebase"));
    Check(-179,true,TEXT("Crossing the seam invalidates copied primitive history"));
    Check(-179,false,TEXT("Settled seam view can accumulate history again"));
    Camera->bGameCameraCutThisFrame=false;Scene->SetSceneMode(TEXT("battle"));
    TestTrue(TEXT("World to battle cannot reuse unrelated map history"),bool(Camera->bGameCameraCutThisFrame));
    Camera->bGameCameraCutThisFrame=false;Scene->SetSceneMode(TEXT("battle"));
    TestFalse(TEXT("Recurring battle packets preserve stationary history"),bool(Camera->bGameCameraCutThisFrame));
    Camera->bGameCameraCutThisFrame=false;Scene->SetSceneMode(TEXT("world"));
    TestTrue(TEXT("Returning to the chart starts fresh history"),bool(Camera->bGameCameraCutThisFrame));
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTCameraProjectionTest,"WNT.Camera.NativeProjectionAndNorthUp",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTCameraProjectionTest::RunTest(const FString& Parameters)
{
    const FVector Target(1.1e9,-1.3e9,0);
    for(const FIntPoint Pixels:{FIntPoint(1920,1080),FIntPoint(1366,768),FIntPoint(1100,720),FIntPoint(900,1200),FIntPoint(3840,2160)})
    for(const FVector4 Rect:{FVector4(0,0,1,1),FVector4(.19,.12,.61,.81),FVector4(.3,.2,.4,.65)})
    for(double Tilt:{0.0,42.0,70.0})
    {
        FMinimalViewInfo View;WNTCameraMath::ConfigureProjection(View,Pixels,Rect);WNTCameraMath::Orbit(View,Target,120000,Tilt,0);
        const FVector2D Expected(Rect.X+Rect.Z*.5,Rect.Y+Rect.W*.5);
        const auto Centre=WNTCameraMath::Project(View,Target);
        TestTrue(TEXT("Target has a native matrix projection"),Centre.IsSet());if(!Centre.IsSet())continue;
        TestTrue(TEXT("Optical centre remains inside the clear HUD rectangle (horizontal)"),FMath::Abs(Centre->X-Expected.X)*Pixels.X<.001);
        TestTrue(TEXT("Off-center vertical sign matches UE native matrix"),FMath::Abs(Centre->Y-Expected.Y)*Pixels.Y<.001);
        const auto North=WNTCameraMath::Project(View,Target+FVector(1000,0,0)),East=WNTCameraMath::Project(View,Target+FVector(0,1000,0));
        TestTrue(TEXT("North stays above the focus"),North.IsSet()&&North->Y<Centre->Y);
        TestTrue(TEXT("East stays right of the focus"),East.IsSet()&&East->X>Centre->X);
        TestEqual(TEXT("World yaw is zero"),View.Rotation.Yaw,0.0);TestEqual(TEXT("World roll is zero"),View.Rotation.Roll,0.0);
        const auto Hit=WNTCameraMath::PlaneHit(View,Expected,0);
        TestTrue(TEXT("Native inverse projection hits its focus within a millimetre"),Hit.IsSet()&&FVector::Distance(Hit.GetValue(),Target)<.1);
    }
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTCameraAnchorTest,"WNT.Camera.TiltedDragAndZoomAnchors",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTCameraAnchorTest::RunTest(const FString& Parameters)
{
    const FIntPoint Pixels(1920,1080);const FVector4 Rect(.2,.1,.59,.85);
    for(double Distance:{3200.0,600000.0,3200000000.0})for(double Tilt:{0.0,42.0,70.0})for(double Yaw:{0.0,-25.0,110.0})
    {
        FVector Target(1.1e9,-1.3e9,10000);FMinimalViewInfo View;
        WNTCameraMath::ConfigureProjection(View,Pixels,Rect);WNTCameraMath::Orbit(View,Target,Distance,Tilt,Yaw);
        const FVector2D Before(.51,.6),After(.51+24.0/Pixels.X,.6+31.0/Pixels.Y);
        const auto Anchor=WNTCameraMath::PlaneHit(View,Before,Target.Z);
        TestTrue(TEXT("Surface anchor exists"),Anchor.IsSet());if(!Anchor.IsSet())continue;
        const auto Current=WNTCameraMath::PlaneHit(View,After,Target.Z);
        TestTrue(TEXT("Dragged pointer intersects tilted surface"),Current.IsSet());if(!Current.IsSet())continue;
        Target+=Anchor.GetValue()-Current.GetValue();WNTCameraMath::Orbit(View,Target,Distance,Tilt,Yaw);
        auto Screen=WNTCameraMath::Project(View,Anchor.GetValue());
        TestTrue(TEXT("31 px vertical drag preserves exact anchor under tilt"),Screen.IsSet()&&FMath::Abs(Screen->X-After.X)*Pixels.X<.15&&FMath::Abs(Screen->Y-After.Y)*Pixels.Y<.15);
        WNTCameraMath::Orbit(View,Target,Distance*.67,Tilt,Yaw);
        const auto ZoomHit=WNTCameraMath::PlaneHit(View,After,Target.Z);
        TestTrue(TEXT("Zoom surface intersection exists"),ZoomHit.IsSet());if(!ZoomHit.IsSet())continue;
        Target+=Anchor.GetValue()-ZoomHit.GetValue();WNTCameraMath::Orbit(View,Target,Distance*.67,Tilt,Yaw);
        Screen=WNTCameraMath::Project(View,Anchor.GetValue());
        TestTrue(TEXT("Wheel zoom preserves anchor within a fraction of a pixel"),Screen.IsSet()&&FMath::Abs(Screen->X-After.X)*Pixels.X<.15&&FMath::Abs(Screen->Y-After.Y)*Pixels.Y<.15);
    }
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTCameraTerrainClearanceTest,"WNT.Camera.EyeAndNearPlaneClearance",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTCameraTerrainClearanceTest::RunTest(const FString& Parameters)
{
    const FVector Target(1.1e9,-1.3e9,10000);
    for(double Distance:{3200.0,120000.0,3200000000.0})for(double Slope:{0.0,1.0,3.0})for(double Tilt:{0.0,42.0,70.0,85.0})
    {
        FMinimalViewInfo View;WNTCameraMath::ConfigureProjection(View,FIntPoint(1366,768),FVector4(.28,.18,.5,.75));
        WNTCameraMath::Orbit(View,Target,Distance,Tilt,0);
        const auto Height=[&](const FVector& P){return FMath::Max(0.0,Target.Z-(P.X-Target.X)*Slope);};
        WNTCameraMath::EnsureClearance(View,Target,Height);
        TestTrue(TEXT("Eye clears steep terrain"),View.Location.Z-Height(View.Location)>=9.99);
        for(double X:{0.0,.5,1.0})for(double Y:{0.0,.5,1.0})
        {
            FVector Origin,Direction;TestTrue(TEXT("Near-plane ray exists"),WNTCameraMath::Ray(View,FVector2D(X,Y),Origin,Direction));
            const double Along=View.PerspectiveNearClipPlane/FVector::DotProduct(Direction,View.Rotation.Vector());
            const FVector Corner=Origin+Direction*Along;
            TestTrue(TEXT("Near-plane corners also clear terrain"),Corner.Z-Height(Corner)>=9.98);
        }
        TestTrue(TEXT("Clearance never increases pitch"),View.Rotation.Pitch+90<=Tilt+1e-6);
    }
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTCameraWrappingTest,"WNT.Camera.EndlessLongitudePan",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTCameraWrappingTest::RunTest(const FString& Parameters)
{
    for(double Latitude:{-75.0,0.0,75.0})for(double Direction:{-1.0,1.0})
    {
        FVector2D Focus(170,Latitude);double Meridian=170;
        const double Step=WNTProjection::ForwardUnwrapped(FVector2D(5,Latitude)).Y*Direction;
        for(int32 I=0;I<144;++I)
        {
            Focus=WNTCameraMath::WrappedFocus(WNTProjection::Forward(Focus,Meridian)+FVector(0,Step,0),Meridian);
            Meridian=Focus.X;
            TestTrue(TEXT("Rendered camera remains centered between repeated map copies"),FMath::Abs(WNTProjection::Forward(Focus,Meridian).Y)<.001);
            TestTrue(TEXT("Panning retains latitude"),FMath::Abs(Focus.Y-Latitude)<1e-7);
            TestTrue(TEXT("Repeated wraps preserve geographic longitude"),FMath::Abs(WNTProjection::WrapLongitude(Focus.X-(170+Direction*5*(I+1))))<1e-7);
        }
    }
    return true;
}
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTRepeatedCopyAnchorTest,"WNT.Camera.RepeatedCopyAnchor",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTRepeatedCopyAnchorTest::RunTest(const FString& Parameters)
{
    for(double Meridian:{-179.,0.,179.})for(double Copy:{-1.,0.,1.})for(double Delta:{-30.,30.})
    {
        const double Next=WNTProjection::WrapLongitude(Meridian+Delta);
        const FVector Original=WNTProjection::ForwardUnwrapped(FVector2D(170+Copy*360,25));
        const FVector Rebased=Original-FVector(0,WNTProjection::WrapLongitude(Next-Meridian)/360*WNTProjection::WorldWidth,0);
        const auto Before=WNTProjection::Inverse(Original,Meridian),After=WNTProjection::Inverse(Rebased,Next);
        TestTrue(TEXT("Rebased anchor preserves the actual geographic point"),Before.IsSet()&&After.IsSet()
            &&FMath::Abs(WNTProjection::WrapLongitude(Before->X-After->X))<1e-8&&FMath::Abs(Before->Y-After->Y)<1e-8);
        TestTrue(TEXT("Anchor moves only by camera translation, never by an extra world-width jump"),
            FMath::Abs((Rebased.Y-Original.Y)+Delta/360*WNTProjection::WorldWidth)<.001);
    }
    return true;
}
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTWorldTiltGateTest,"WNT.Camera.ShipInspectionTiltGate",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTWorldTiltGateTest::RunTest(const FString& Parameters)
{
    for(double Zoom:{1.0,10.0,128.0,1024.0,2048.0,12000.0,16384.0})
        TestEqual(TEXT("Strategic map rejects angle changes"),WNTCameraMath::MaxWorldTilt(Zoom),0.0);
    double Previous=0;
    for(int32 I=0;I<=64;++I)
    {
        const double Angle=WNTCameraMath::MaxWorldTilt(16384.0*FMath::Pow(2.0,I/64.0));
        TestTrue(TEXT("Ship inspection tilt opens continuously"),Angle>=Previous&&Angle-Previous<2.0);Previous=Angle;
    }
    TestEqual(TEXT("Close ship view has automatic inspection pitch"),WNTCameraMath::MaxWorldTilt(32768.0),52.0);
    TestEqual(TEXT("Maximum zoom stays at ship scale"),WNTCameraMath::MaxWorldZoom,65536.0);
    TestEqual(TEXT("Pitch stays bounded at the zoom limit"),WNTCameraMath::MaxWorldTilt(WNTCameraMath::MaxWorldZoom),52.0);
    TestFalse(TEXT("Small pans retain stable terrain and temporal history"),WNTCameraMath::NeedsOriginRebase(20,0));
    TestFalse(TEXT("Date-line crossing near current origin needs no rebase"),WNTCameraMath::NeedsOriginRebase(-179,179));
    TestTrue(TEXT("Long journeys rebase before leaving the repeated world"),WNTCameraMath::NeedsOriginRebase(46,0));
    TestEqual(TEXT("Returning to strategic scale restores overhead lock"),WNTCameraMath::MaxWorldTilt(1.0),0.0);
    return true;
}
#endif
