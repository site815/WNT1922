#if WITH_DEV_AUTOMATION_TESTS
#include "Misc/AutomationTest.h"
#include "WNTPlayerController.h"
#include "WNTProjection.h"

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
        FVector2D Focus(170,Latitude);double Meridian=170;int32 Recentres=0;
        const double Step=WNTProjection::ForwardUnwrapped(FVector2D(5,Latitude)).Y*Direction;
        for(int32 I=0;I<144;++I)
        {
            Focus=WNTCameraMath::WrappedFocus(WNTProjection::Forward(Focus,Meridian)+FVector(0,Step,0),Meridian);
            if(FMath::Abs(WNTProjection::WrapLongitude(Focus.X-Meridian))>135){Meridian=Focus.X;++Recentres;}
            TestTrue(TEXT("Panning retains latitude"),FMath::Abs(Focus.Y-Latitude)<1e-7);
            TestTrue(TEXT("Repeated wraps preserve geographic longitude"),FMath::Abs(WNTProjection::WrapLongitude(Focus.X-(170+Direction*5*(I+1))))<1e-7);
        }
        TestTrue(TEXT("Two complete revolutions need only occasional mesh reprojection"),Recentres>=4&&Recentres<=6);
    }
    return true;
}
#endif
