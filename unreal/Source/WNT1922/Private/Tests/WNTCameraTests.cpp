#if WITH_DEV_AUTOMATION_TESTS
#include "Misc/AutomationTest.h"
#include "WNTPlayerController.h"
#include "WNTProjection.h"
#include "WNTTerrainActor.h"
#include "WNTWorldActor.h"
#include "WNTCameraActor.h"
#include "Camera/PlayerCameraManager.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "Engine/GameViewportClient.h"
#include "Engine/LocalPlayer.h"
#include "Engine/Engine.h"
#include "Engine/World.h"
#include "Misc/ScopeExit.h"
#include "Slate/SceneViewport.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTTerrainPickReliefTest,"WNT.Camera.TerrainRayIncludesStrategicRelief",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTTerrainPickReliefTest::RunTest(const FString& Parameters)
{
    for(double Distance:{100000.,50000000.,100000000.})
    {
        const double Relief=WNTTerrainGeometry::ReliefScaleForDistance(Distance);
        const FVector Origin(0,0,20000000.);
        for(FVector Direction:{FVector(0,0,-1),FVector(.2,.3,-1)})
        {
            Direction.Normalize();const double End=-Origin.Z/Direction.Z;
            const double Height=7712.*100.*Relief;
            const FVector Hit=WNTCameraMath::TerrainRayHit(Origin,Direction,End,(AWNTTerrainActor::LandBaseMetres+10000.)*100.*Relief,
                [&](const FVector&){return Height;});
            TestTrue(TEXT("Ray starts above and selects even the highest visually emphasized terrain"),FMath::Abs(Hit.Z-Height)<.01);
            const FVector Sea=WNTCameraMath::TerrainRayHit(Origin,Direction,End,(AWNTTerrainActor::LandBaseMetres+10000.)*100.*Relief,
                [](const FVector&){return 0.;});
            TestTrue(TEXT("Expanded search ceiling preserves sea-level anchors"),FMath::Abs(Sea.Z)<.01);
        }
    }
    return true;
}

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
    Check(179,false,TEXT("Equal Earth longitude shear preserves continuous camera history"));
    Check(179,false,TEXT("Repeated same origin does not continually reset TSR"));
    Check(539,false,TEXT("Equivalent wrapped longitude is not a new rebase"));
    Check(-179,false,TEXT("Crossing the seam is continuous camera motion"));
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
    for(double Latitude:{-80.,-25.,0.,25.,80.})for(double Meridian:{-179.,0.,179.})for(double Copy:{-1.,0.,1.})for(double Delta:{-30.,30.})
    {
        const double Next=WNTProjection::WrapLongitude(Meridian+Delta);
        const FVector Original=WNTProjection::ForwardUnwrapped(FVector2D(170+Copy*360,Latitude),123);
        const FVector Rebased=WNTProjection::ReprojectBetweenMeridians(Original,Meridian,Next);
        const auto Before=WNTProjection::Inverse(Original,Meridian),After=WNTProjection::Inverse(Rebased,Next);
        TestTrue(TEXT("Rebased anchor preserves the actual geographic point"),Before.IsSet()&&After.IsSet()
            &&FMath::Abs(WNTProjection::WrapLongitude(Before->X-After->X))<1e-8&&FMath::Abs(Before->Y-After->Y)<1e-8);
        const FVector Expected=WNTProjection::ForwardUnwrapped(FVector2D(170+Copy*360-Delta,Latitude),123);
        TestTrue(TEXT("Anchor follows the exact latitude-dependent projection without changing its repeated copy or height"),Rebased.Equals(Expected,.001));
        TestTrue(TEXT("Forward and inverse meridian shifts do not accumulate drift"),WNTProjection::ReprojectBetweenMeridians(Rebased,Next,Meridian).Equals(Original,.001));
    }
    return true;
}
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTWorldTiltGateTest,"WNT.Camera.ShipInspectionTiltGate",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTWorldTiltGateTest::RunTest(const FString& Parameters)
{
    WNTCameraMath::FWorldOrbit Orientation;
    for(double Zoom:{1.0,12000.0,16384.0,24000.0,32768.0,65536.0})
        TestTrue(TEXT("Every zoom starts overhead north-up without automatic tilt"),Orientation.Angles(Zoom).IsNearlyZero());
    for(double Zoom:{1.0,16384.0,24000.0,32767.0})
    {
        TestFalse(TEXT("Middle orbit is unavailable before close ship inspection"),Orientation.Drag(Zoom,100,100));
        TestTrue(TEXT("Rejected orbit leaves both axes overhead"),Orientation.Angles(Zoom).IsNearlyZero());
    }
    TestEqual(TEXT("Maximum zoom stays at ship scale"),WNTCameraMath::MaxWorldZoom,65536.0);
    TestTrue(TEXT("Middle drag orbits at the ship threshold"),Orientation.Drag(WNTCameraMath::WorldOrbitZoom,100,80));
    TestTrue(TEXT("Close ship yaw and tilt follow only the drag"),Orientation.Angles(32768).Equals(FVector2D(20,-30),1e-8));
    FMinimalViewInfo OrbitView;const FVector Pivot(12000,24000,0);
    WNTCameraMath::ConfigureProjection(OrbitView,FIntPoint(3440,1440),FVector4(.1,.12,.8,.82));
    const FVector2D Angles=Orientation.Angles(32768);
    WNTCameraMath::Orbit(OrbitView,Pivot,90000,Angles.X,Angles.Y);
    const auto PivotScreen=WNTCameraMath::Project(OrbitView,Pivot);
    TestTrue(TEXT("World orbit keeps the inspected focus in the viewport centre"),PivotScreen.IsSet()&&PivotScreen->Equals(FVector2D(.5,.53),1e-8));
    Orientation.ZoomInput(-1);
    TestTrue(TEXT("Zooming in retains the user's orbit"),Orientation.Angles(65536).Equals(Angles,1e-8));
    Orientation.ZoomInput(.001);
    TestTrue(TEXT("Even the smallest outward input immediately resets orbit while still at close zoom"),Orientation.Angles(65536).IsNearlyZero());
    TestTrue(TEXT("Zooming back in cannot revive the previous orbit"),Orientation.Angles(65536).IsNearlyZero());
    Orientation.Drag(65536,20000,-20000);
    TestEqual(TEXT("World tilt cannot fall below overhead"),Orientation.Tilt,0.0);
    TestTrue(TEXT("Arbitrary orbit headings stay bounded"),FMath::Abs(Orientation.Yaw)<=180);
    Orientation.Drag(65536,0,20000);
    TestEqual(TEXT("Manual world tilt stays inside its terrain-safe limit"),Orientation.Tilt,52.0);
    TestTrue(TEXT("Directly leaving inspection range also clears orbit"),Orientation.Angles(32767).IsNearlyZero());
    Orientation.Drag(65536,100,100);Orientation.Reset();
    TestTrue(TEXT("Home resets both orientation axes"),Orientation.Angles(65536).IsNearlyZero());
    TestTrue(TEXT("Small pans continuously recenter the Equal Earth meridian"),WNTCameraMath::NeedsOriginRebase(.01,0));
    TestFalse(TEXT("Equivalent wrapped meridians do not redo geography"),WNTCameraMath::NeedsOriginRebase(181,-179));
    TestTrue(TEXT("Date-line crossing updates the geographic centre"),WNTCameraMath::NeedsOriginRebase(-179,179));
    return true;
}
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTWorldExtentFitTest,"WNT.Camera.WorldExtentFit",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTWorldExtentFitTest::RunTest(const FString& Parameters)
{
    for(const FIntPoint Pixels:{FIntPoint(1800,1000),FIntPoint(1920,1080),FIntPoint(3840,2160),FIntPoint(3440,1440),FIntPoint(5120,2160)})
    for(const FVector4 Rect:{FVector4(.114,.12,.771,.832),FVector4(.2,.3,.55,.65),FVector4(0,0,1,1)})
    {
        FMinimalViewInfo View;WNTCameraMath::ConfigureProjection(View,Pixels,Rect);
        const double Pole=WNTProjection::PoleNorthing();
        WNTCameraMath::Orbit(View,FVector::ZeroVector,WNTCameraMath::WorldViewDistance(),0,0);
        const auto North=WNTCameraMath::Project(View,FVector(Pole,0,0)),South=WNTCameraMath::Project(View,FVector(-Pole,0,0));
        const double Margin=Rect.W*WNTCameraMath::WorldEdgeMargin;
        TestTrue(TEXT("Maximum zoom-out places the north end below the unobscured top with a margin"),North.IsSet()&&FMath::Abs(North->Y-(Rect.Y+Margin))*Pixels.Y<.02);
        TestTrue(TEXT("Maximum zoom-out places the south end above the unobscured bottom with a margin"),South.IsSet()&&FMath::Abs(South->Y-(Rect.Y+Rect.W-Margin))*Pixels.Y<.02);
        for(double Target:{-Pole*.8,0.0,Pole*.8})
        {
            WNTCameraMath::Orbit(View,FVector(Target,0,0),WNTCameraMath::WorldViewDistance(),0,0);
            TestTrue(TEXT("Full-world framing recentres latitude without clipping a pole"),FMath::Abs(WNTCameraMath::ConstrainWorldNorthing(View,Rect,Target))<Pole*1e-6);
        }
        WNTCameraMath::Orbit(View,FVector(Pole*.3,0,0),WNTCameraMath::WorldViewDistance()/4,0,0);
        TestTrue(TEXT("Zoomed chart still permits smooth north-south panning"),FMath::Abs(WNTCameraMath::ConstrainWorldNorthing(View,Rect,Pole*.3)-Pole*.3)<.001);
    }
    return true;
}
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTFrameRateSamplingTest,"WNT.Camera.FrameRateSampling",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTFrameRateSamplingTest::RunTest(const FString& Parameters)
{
    WNTCameraMath::FFrameRateSampler Sample;TestFalse(TEXT("The first frame establishes the real-time interval"),Sample.Observe(100).IsSet());
    int32 Updates=0;double Previous=100;
    for(int32 I=1;I<=120;++I)
    {
        const double Now=100+I/60.0;const auto FPS=Sample.Observe(Now);
        if(FPS.IsSet())
        {
            ++Updates;TestTrue(TEXT("Native FPS pushes never exceed two updates per second"),Now-Previous>=.5);
            TestTrue(TEXT("Frame rate measures elapsed wall time rather than simulation speed"),FMath::Abs(FPS.GetValue()-60)<1e-8);Previous=Now;
        }
    }
    TestEqual(TEXT("Two seconds at 60 FPS produces four telemetry packets"),Updates,4);
    TestFalse(TEXT("A backwards clock starts a fresh sample"),Sample.Observe(50).IsSet());
    const auto Slow=Sample.Observe(52);TestTrue(TEXT("A long frame is included honestly without catch-up traffic"),Slow.IsSet()&&FMath::Abs(Slow.GetValue()-.5)<1e-8);
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTAnchorConstraintTest,"WNT.Camera.ConstrainedAnchorProgress",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTAnchorConstraintTest::RunTest(const FString& Parameters)
{
    FMinimalViewInfo View;const FVector4 Rect(.114,.12,.771,.832);
    WNTCameraMath::ConfigureProjection(View,FIntPoint(1800,1000),Rect);
    for(double Zoom:{1.0,4.0})
    {
        const double Pole=WNTProjection::PoleNorthing();
        const double Requested=Zoom==1?Pole*.3:Pole;
        WNTCameraMath::Orbit(View,FVector(Requested,0,0),WNTCameraMath::WorldViewDistance()/Zoom,0,0);
        const double Clamped=WNTCameraMath::ConstrainWorldNorthing(View,Rect,Requested);
        TestTrue(TEXT("A drag beyond the available north-south extent is constrained"),Clamped<Requested);
        const auto Geo=WNTProjection::Inverse(FVector(Clamped,0,0));
        TestTrue(TEXT("The constrained focus can be represented geographically"),Geo.IsSet());if(!Geo.IsSet())continue;
        const FVector Focus(0,Geo->Y,0);
        WNTCameraMath::FAnchorProgress Progress;
        TestFalse(TEXT("The first anchor correction is always allowed"),Progress.Stalled(85,Focus));
        TestTrue(TEXT("A second unchanged constrained focus stops the futile vertical iterations"),Progress.Stalled(85,Focus));
        TestFalse(TEXT("Horizontal longitude/meridian movement remains valid even with unresolved vertical error"),Progress.Stalled(85,FVector(1,Geo->Y,1)));
        TestFalse(TEXT("A decreasing screen error is allowed to converge"),Progress.Stalled(84,FVector(1,Geo->Y,1)));
        TestTrue(TEXT("The converged horizontal movement stops if only the constrained error remains"),Progress.Stalled(84,FVector(1,Geo->Y,1)));
    }
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTWheelResponseTest,"WNT.Camera.ResponsiveWheelTraversal",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTWheelResponseTest::RunTest(const FString& Parameters)
{
    double Target=1;
    for(int32 I=0;I<16;++I)Target=WNTCameraMath::WheelZoom(Target,-120,false);
    TestTrue(TEXT("Sixteen ordinary wheel notches traverse the full strategic-to-hull range"),FMath::IsNearlyEqual(Target,WNTCameraMath::MaxWorldZoom,1e-6));
    TestTrue(TEXT("A single strategic wheel notch doubles the zoom"),FMath::IsNearlyEqual(WNTCameraMath::WheelZoom(1,-120,false),2.,1e-12));
    TestTrue(TEXT("Coalescing a wheel burst preserves its exact total movement"),FMath::IsNearlyEqual(WNTCameraMath::WheelZoom(1,-120*8,false),256.,1e-8));
    TestTrue(TEXT("Battle inspection retains its finer wheel sensitivity"),FMath::IsNearlyEqual(WNTCameraMath::WheelZoom(1,-120,true),FMath::Exp(.18),1e-12));
    TestTrue(TEXT("Continuous touchpad motion is proportional rather than rounded to notches"),FMath::IsNearlyEqual(WNTCameraMath::WheelZoom(1,-30,false),FMath::Pow(2.,.25),1e-12));
    TestTrue(TEXT("Huge wheel inputs cannot overflow the world limit"),FMath::IsNearlyEqual(WNTCameraMath::WheelZoom(1,-1e300,false),WNTCameraMath::MaxWorldZoom,1e-6));
    TestEqual(TEXT("Huge outward inputs remain at the full-world floor"),WNTCameraMath::WheelZoom(400,1e300,false),1.);
    for(double FPS:{30.,60.,120.})
    {
        double Current=1;
        for(int32 I=0;I<FMath::CeilToInt(FPS*.35);++I)Current=WNTCameraMath::SmoothZoom(Current,2.,1/FPS);
        TestEqual(TEXT("An ordinary wheel step settles inside350ms independently of frame rate"),Current,2.);
    }
    TestEqual(TEXT("A zero-time sample cannot jump the camera"),WNTCameraMath::SmoothZoom(1,2,0),1.);
    return true;
}

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTBattleOverviewFitTest,"WNT.Camera.TacticalOverviewFit",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTBattleOverviewFitTest::RunTest(const FString& Parameters)
{
    for(const FIntPoint Pixels:{FIntPoint(1800,1000),FIntPoint(1920,1080),FIntPoint(3440,1440),FIntPoint(5120,2160)})
    for(const FVector4 Rect:{FVector4(.04,.19,.72,.74),FVector4(.1,.2,.38,.65),FVector4(0,0,1,1)})
    for(double SeparationMetres:{23000.,220000.})for(double Bearing:{0.,45.,90.})
    {
        const FVector Axis=FRotator(0,Bearing,0).Vector()*SeparationMetres*50.;
        FBox Bounds(ForceInit);for(double Side:{-1.,1.}){Bounds+=Axis*Side+FVector(40000);Bounds+=Axis*Side-FVector(40000);}
        FMinimalViewInfo View;WNTCameraMath::ConfigureProjection(View,Pixels,Rect);
        const double Distance=WNTCameraMath::BattleFitDistance(Bounds,Pixels,Rect);
        WNTCameraMath::Orbit(View,Bounds.GetCenter(),Distance,WNTCameraMath::BattleOverviewTilt,WNTCameraMath::BattleOverviewYaw);
        for(int32 I=0;I<8;++I)
        {
            const FVector Corner((I&1)?Bounds.Max.X:Bounds.Min.X,(I&2)?Bounds.Max.Y:Bounds.Min.Y,(I&4)?Bounds.Max.Z:Bounds.Min.Z);
            const auto Screen=WNTCameraMath::Project(View,Corner);
            TestTrue(TEXT("Denmark Strait and Midway extents fit the actual HUD opening at16:9and21:9 with8%margin"),Screen.IsSet()&&Screen->X>=Rect.X+Rect.Z*.0799&&Screen->X<=Rect.X+Rect.Z*.9201&&Screen->Y>=Rect.Y+Rect.W*.0799&&Screen->Y<=Rect.Y+Rect.W*.9201);
        }
        for(double Side:{-1.,1.})
        {
            const double Depth=FVector::DotProduct(Axis*Side-View.Location,View.Rotation.Vector());
            const double Marker=WNTCameraMath::BattleMarkerPixels(25000.,Depth,View.FOV,Pixels);
            const double HullSpan=25000.*Pixels.X/(2*Depth*FMath::Tan(FMath::DegreesToRadians(View.FOV)*.5));
            TestTrue(TEXT("Both sides remain readable as a hull or screen glyph at realistic battle separation"),Marker>=28.||HullSpan>=12*FMath::Clamp(Pixels.Y/1000.,1.,2.));
            if(SeparationMetres==220000.)TestTrue(TEXT("Midway-scale carrier groups cannot disappear into subpixel models"),Marker>=28.);
        }
    }
    TestEqual(TEXT("At800m ship inspection the actual hull is visible without an overview glyph"),WNTCameraMath::BattleMarkerPixels(20000.,80000.,90.,FIntPoint(1800,1000)),0.);
    TestEqual(TEXT("A hull behind the camera has no marker or pick rectangle"),WNTCameraMath::BattleMarkerPixels(20000.,-1.,90.,FIntPoint(1800,1000)),0.);
    return true;
}
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTBattleFocusContractTest,"WNT.Camera.TacticalAndGalleryFocusContract",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTBattleFocusContractTest::RunTest(const FString& Parameters)
{
    for(double Aspect:{.4,1.,2.4})
    {
        const double Distance=WNTCameraMath::BattleFocusDistance(Aspect);
        TestEqual(TEXT("Focus preserves the gallery's documented3x zoom baseline"),WNTCameraMath::BattleFocusZoom,3.);
        TestTrue(TEXT("Tactical focus is1050m/aspect regardless of a previous220km fit"),FMath::IsNearlyEqual(Distance/WNTCameraMath::BattleFocusZoom,105000./FMath::Min(1.,Aspect),.001));
        for(double LengthMetres:{25.,160.,251.,330.})
        {
            const double GalleryZoom=1550./LengthMetres;
            const double Target=WNTCameraMath::WheelZoom(WNTCameraMath::BattleFocusZoom,-FMath::Loge(GalleryZoom/3.)/WNTCameraMath::BattleZoomPerPixel,true);
            TestTrue(TEXT("The gallery's relative dimensional input reaches its announced zoom for every hull scale"),FMath::IsNearlyEqual(Target,GalleryZoom,1e-8));
            const double RangeMetres=Distance/Target/100.;
            TestTrue(TEXT("Gallery framing remains dimensionally proportional and outside the hull"),RangeMetres>LengthMetres*2.&&RangeMetres<LengthMetres*5.1);
        }
    }
    return true;
}
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTCameraNotificationTest,"WNT.Camera.SilentPickRefreshPreservesNotification",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTCameraNotificationTest::RunTest(const FString& Parameters)
{
    // A sized headless viewport exercises the actual focus/matrix/Tick path;
    // no browser, game window or campaign service is started in this fixture.
    class FTestViewport final:public FSceneViewport
    {
    public:
        FTestViewport():FSceneViewport(TSharedPtr<SViewport>()){}
        FIntPoint GetSizeXY() const override{return FIntPoint(1800,1000);}
    } Viewport;
    const auto Init=UWorld::InitializationValues().AllowAudioPlayback(false).RequiresHitProxies(false)
        .CreatePhysicsScene(false).CreateNavigation(false).CreateAISystem(false).ShouldSimulatePhysics(false).SetTransactional(false);
    UWorld* World=UWorld::CreateWorld(EWorldType::Game,false,MakeUniqueObjectName(GetTransientPackage(),UWorld::StaticClass(),TEXT("WNTCameraNotificationTest")),GetTransientPackage(),true,ERHIFeatureLevel::Num,&Init);
    if(!TestNotNull(TEXT("Headless camera notification world"),World))return false;
    auto* Controller=World->SpawnActor<AWNTPlayerController>();
    auto* LocalPlayer=NewObject<ULocalPlayer>(GEngine);auto* Client=NewObject<UGameViewportClient>(GEngine);
    ON_SCOPE_EXIT{Client->Viewport=nullptr;LocalPlayer->ViewportClient=nullptr;LocalPlayer->PlayerController=nullptr;if(Controller)Controller->Player=nullptr;World->DestroyWorld(false);};
    if(!TestNotNull(TEXT("Real native controller"),Controller))return false;
    Client->Viewport=&Viewport;LocalPlayer->ViewportClient=Client;LocalPlayer->PlayerController=Controller;Controller->Player=LocalPlayer;
    Controller->WorldScene=World->SpawnActor<AWNTWorldActor>();Controller->SceneCamera=World->SpawnActor<AWNTCameraActor>();
    Controller->Mode=TEXT("world");Controller->InstanceId=TEXT("notification-fixture");
    TArray<double> CameraZooms;
    Controller->AutomationEventObserver=[&](const TSharedPtr<FJsonObject>& Event)
    {if(Event->GetStringField(TEXT("type"))==TEXT("camera"))CameraZooms.Add(Event->GetNumberField(TEXT("zoom")));};
    Controller->UpdateCamera();CameraZooms.Reset();
    auto Focus=MakeShared<FJsonObject>();Focus->SetStringField(TEXT("action"),TEXT("focus"));Focus->SetStringField(TEXT("instanceId"),Controller->InstanceId);
    Focus->SetNumberField(TEXT("longitude"),18.4);Focus->SetNumberField(TEXT("latitude"),-34.18);Focus->SetNumberField(TEXT("zoom"),16);
    Controller->Input(Focus);
    TestTrue(TEXT("Programmatic port focus schedules a HUD camera notification"),Controller->bCameraDirty);
    Controller->UpdateCamera(false);Controller->UpdateCamera(false);
    TestEqual(TEXT("Silent picking refreshes do not emit intermediate notifications"),CameraZooms.Num(),0);
    TestTrue(TEXT("Fresh picking matrices preserve the existing pending HUD notification"),Controller->bCameraDirty);
    TestEqual(TEXT("The physical camera has already reached the port focus"),Controller->Zoom,16.);
    Controller->Tick(1.f/60);
    TestEqual(TEXT("The next controller tick emits the focused zoom exactly once"),CameraZooms.Num(),1);
    if(CameraZooms.Num())TestEqual(TEXT("The legend receives16x rather than retaining1x"),CameraZooms[0],16.);
    TestFalse(TEXT("A notified view clears the pending state"),Controller->bCameraDirty);
    Controller->UpdateCamera(false);Controller->Tick(1.f/60);
    TestFalse(TEXT("A no-op silent hover never creates a new pending update"),Controller->bCameraDirty);
    TestEqual(TEXT("Settled hover traffic cannot produce redundant camera events"),CameraZooms.Num(),1);
    TSharedPtr<FJsonObject> WorldPacket;
    const FString MerchantJson=TEXT(R"({"format":1,"campaign":"test","player":"USA","paused":true,"forces":[{"id":"cargo","merchant":true,"position":[20,10],"hulls":[{"key":"a","hullIndex":0,"offsetMeters":[-1200,0]},{"key":"b","hullIndex":1,"offsetMeters":[1200,0]}]}]})");
    if(TestTrue(TEXT("Merchant focus fixture parses"),FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(MerchantJson),WorldPacket)))
    {
        Controller->WorldScene->ApplyWorldPacket(WorldPacket);
        Focus->SetStringField(TEXT("action"),TEXT("fit-force"));Focus->SetStringField(TEXT("kind"),TEXT("convoy"));Focus->SetStringField(TEXT("id"),TEXT("cargo"));
        Focus->SetNumberField(TEXT("longitude"),20);Focus->SetNumberField(TEXT("latitude"),10);Focus->SetNumberField(TEXT("zoom"),4);
        Controller->Input(Focus);Controller->UpdateCamera();
        const FBox Bounds=Controller->WorldScene->GetForceBounds(TEXT("cargo"));
        TestTrue(TEXT("Convoy double-click computes a real formation fit instead of remaining at4x"),Bounds.IsValid&&Controller->Zoom>1000);
        for(int32 HullIndex=0;HullIndex<2;++HullIndex)
        {
            const auto Hull=Controller->WorldScene->GetSelectedPosition(TEXT("merchant"),TEXT("cargo"),HullIndex);
            const auto Screen=Hull.IsSet()?WNTCameraMath::Project(Controller->SceneCamera->View,Hull.GetValue()):TOptional<FVector2D>();
            TestTrue(TEXT("Both convoy hulls fit inside the actual viewport"),Screen.IsSet()&&Screen->X>.05&&Screen->X<.95&&Screen->Y>.05&&Screen->Y<.95);
        }
        Focus->SetStringField(TEXT("action"),TEXT("focus"));Focus->SetStringField(TEXT("kind"),TEXT("merchant"));Focus->SetNumberField(TEXT("hullIndex"),1);
        Focus->SetNumberField(TEXT("zoom"),WNTCameraMath::MaxWorldZoom);
        Controller->Input(Focus);Controller->UpdateCamera();
        const auto SelectedHull=Controller->WorldScene->GetSelectedPosition(TEXT("merchant"),TEXT("cargo"),1);
        const auto SelectedScreen=SelectedHull.IsSet()?WNTCameraMath::Project(Controller->SceneCamera->View,SelectedHull.GetValue()):TOptional<FVector2D>();
        TestTrue(TEXT("Hull focus centers the chosen station, not the convoy anchor"),SelectedScreen.IsSet()&&SelectedScreen->Equals(FVector2D(.5,.5),.001));
    }
    Controller->AutomationEventObserver=nullptr;
    return true;
}
#endif
