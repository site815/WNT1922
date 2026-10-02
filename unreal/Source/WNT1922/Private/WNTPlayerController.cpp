#include "WNTPlayerController.h"
#include "WNTBrowserBridge.h"
#include "WNTBrowserPolicy.h"
#include "WNTCameraActor.h"
#include "WNTWorldActor.h"
#include "WNTTerrainActor.h"
#include "WNTShipActor.h"
#include "ProceduralMeshComponent.h"
#include "EngineUtils.h"
#include "UnrealClient.h"
#include "WNTProjection.h"
#include "WNTWindowPolicy.h"
#include "Components/PrimitiveComponent.h"
#include "Components/MeshComponent.h"
#include "WNTSelectionGeometry.h"
#include "Camera/PlayerCameraManager.h"
#include "Engine/GameViewportClient.h"
#include "Engine/World.h"
#include "Framework/Application/SlateApplication.h"
#include "Engine/Engine.h"
#include "SWNTWebBrowser.h"
#include "WNTWebBrowserModule.h"
#include "Widgets/SWindow.h"
#include "Widgets/Text/STextBlock.h"
#include "Widgets/Layout/SBorder.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "Dom/JsonObject.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "Misc/Paths.h"
#include "HAL/PlatformFileManager.h"
#include "Math/RotationMatrix.h"

namespace WNTCameraMath
{
void ConfigureProjection(FMinimalViewInfo& View, const FIntPoint& Pixels, const FVector4& Rect)
{
    const double Width=FMath::Max(1,Pixels.X),Height=FMath::Max(1,Pixels.Y);
    // Unreal's FOV is horizontal. Expand the full-window perspective so the
    // clear HUD rectangle retains a 45-degree vertical view of the world.
    const double TanHalfVertical=FMath::Tan(FMath::DegreesToRadians(22.5))/FMath::Clamp(Rect.W,.02,1.0);
    View.FOV=FMath::RadiansToDegrees(2*FMath::Atan(TanHalfVertical*Width/Height));
    View.AspectRatio=Width/Height;
    View.AspectRatioAxisConstraint=EAspectRatioAxisConstraint::AspectRatio_MaintainXFOV;
    View.bConstrainAspectRatio=false;
    View.OffCenterProjectionOffset=FVector2D(1-2*(Rect.X+Rect.Z*.5),2*(Rect.Y+Rect.W*.5)-1);
}
namespace
{
FVector CameraPoint(const FMinimalViewInfo& View,const FVector4& NDC)
{
    const FVector4 P=View.CalculateProjectionMatrix().Inverse().TransformFVector4(NDC);
    const FRotationMatrix Basis(View.Rotation);
    if(FMath::Abs(P.W)<1e-15)return View.Location;
    return View.Location+Basis.GetUnitAxis(EAxis::Y)*(P.X/P.W)+Basis.GetUnitAxis(EAxis::Z)*(P.Y/P.W)+Basis.GetUnitAxis(EAxis::X)*(P.Z/P.W);
}
}
bool Ray(const FMinimalViewInfo& View,const FVector2D& Pointer,FVector& Origin,FVector& Direction)
{
    Origin=View.Location;
    Direction=(CameraPoint(View,FVector4(2*Pointer.X-1,1-2*Pointer.Y,1,1))-Origin).GetSafeNormal();
    return !Direction.IsNearlyZero()&&!Direction.ContainsNaN();
}
TOptional<FVector2D> Project(const FMinimalViewInfo& View,const FVector& Point)
{
    const FRotationMatrix Basis(View.Rotation);const FVector Delta=Point-View.Location;
    const FVector4 CameraSpace(FVector::DotProduct(Delta,Basis.GetUnitAxis(EAxis::Y)),FVector::DotProduct(Delta,Basis.GetUnitAxis(EAxis::Z)),FVector::DotProduct(Delta,Basis.GetUnitAxis(EAxis::X)),1);
    const FVector4 Clip=View.CalculateProjectionMatrix().TransformFVector4(CameraSpace);
    if(Clip.W<=1e-10||!FMath::IsFinite(Clip.W))return {};
    return FVector2D(.5+.5*Clip.X/Clip.W,.5-.5*Clip.Y/Clip.W);
}
TOptional<FVector> PlaneHit(const FMinimalViewInfo& View,const FVector2D& Pointer,double Height)
{
    FVector Origin,Direction;if(!Ray(View,Pointer,Origin,Direction)||FMath::Abs(Direction.Z)<1e-10)return {};
    const double T=(Height-Origin.Z)/Direction.Z;
    if(T<0||!FMath::IsFinite(T))return {};
    return Origin+Direction*T;
}
void Orbit(FMinimalViewInfo& View,const FVector& Target,double Distance,double Tilt,double Yaw)
{
    View.Rotation=FRotator(-90+Tilt,Yaw,0);
    View.Location=Target-View.Rotation.Vector()*Distance;
    View.PerspectiveNearClipPlane=FMath::Clamp(Distance*.00001,1.0,100000.0);
}
void EnsureClearance(FMinimalViewInfo& View,const FVector& Target,TFunctionRef<double(const FVector&)> SurfaceHeight)
{
    const double Distance=FVector::Distance(View.Location,Target),RequestedTilt=View.Rotation.Pitch+90,Yaw=View.Rotation.Yaw;
    const double Margin=FMath::Max(10.0,static_cast<double>(View.PerspectiveNearClipPlane)*.05);
    auto Clearance=[&](const FMinimalViewInfo& Candidate)
    {
        double Minimum=Candidate.Location.Z-SurfaceHeight(Candidate.Location);
        // Check the actual off-axis near plane, including the clear area's
        // displaced corners. Eye-only checks still let the frustum cut land.
        for(double X:{-1.0,0.0,1.0})for(double Y:{-1.0,0.0,1.0})
        {
            const FVector Corner=CameraPoint(Candidate,FVector4(X,Y,1,1));
            Minimum=FMath::Min(Minimum,Corner.Z-SurfaceHeight(Corner));
        }
        return Minimum;
    };
    if(Clearance(View)>=Margin)return;
    FMinimalViewInfo Upright=View;Orbit(Upright,Target,Distance,0,Yaw);
    if(Clearance(Upright)>=Margin)
    {
        double Safe=0,Unsafe=RequestedTilt;
        for(int32 I=0;I<18;++I)
        {
            const double Mid=(Safe+Unsafe)*.5;FMinimalViewInfo Candidate=View;Orbit(Candidate,Target,Distance,Mid,Yaw);
            if(Clearance(Candidate)>=Margin)Safe=Mid;else Unsafe=Mid;
        }
        Orbit(View,Target,Distance,Safe,Yaw);return;
    }
    // A near-plane corner may sit over a sharp coastline/steep ridge even
    // directly overhead. Raise the camera only when pitch alone cannot clear it.
    View=Upright;
    for(int32 I=0;I<8;++I)
    {
        const double Deficit=Margin-Clearance(View);if(Deficit<=0)break;
        View.Location.Z+=Deficit+Margin;View.Rotation=(Target-View.Location).Rotation();
    }
}
FVector2D WrappedFocus(const FVector& Point,double Meridian)
{
    const double Limit=FMath::Abs(WNTProjection::ForwardUnwrapped(FVector2D(0,89.9)).X);
    const auto Latitude=WNTProjection::Inverse(FVector(FMath::Clamp(Point.X,-Limit,Limit),0,0),Meridian);
    const double Lat=Latitude.IsSet()?Latitude->Y:0;
    const double Edge=WNTProjection::ForwardUnwrapped(FVector2D(180,Lat)).Y;
    return FVector2D(WNTProjection::WrapLongitude(Meridian+180*Point.Y/Edge),Lat);
}
double MaxWorldTilt(double Zoom)
{
    return CanOrbitWorld(Zoom)?52.0:0.0;
}
double WorldViewDistance()
{
    // ConfigureProjection already gives the unobscured rectangle a 45-degree
    // vertical field of view. Do not multiply its height into the fit again.
    return WNTProjection::PoleNorthing()/(FMath::Tan(FMath::DegreesToRadians(22.5))*(1-2*WorldEdgeMargin));
}
double BattleFocusDistance(double Aspect)
{
    // The gallery applies its dimensional zoom relative to a3x focus. Keep
    // that shared input contract while making the actual focus range1050m.
    return 105000.*BattleFocusZoom/FMath::Clamp(Aspect,.35,1.);
}
double BattleFitDistance(const FBox& Bounds,const FIntPoint& Pixels,const FVector4& Rect)
{
    if(!Bounds.IsValid)return 60000.;
    const double Aspect=FMath::Max(.02,Pixels.X*Rect.Z/FMath::Max(1.,Pixels.Y*Rect.W));
    const double Vertical=FMath::Tan(FMath::DegreesToRadians(22.5))*.84,Horizontal=Vertical*Aspect;
    const FRotationMatrix Basis(FRotator(-90+BattleOverviewTilt,BattleOverviewYaw,0));
    double Distance=35000.;
    // Fit the actual clear HUD rectangle, including perspective depth. Fitting
    // a sphere unnecessarily shrinks two fleets separated by tens of km.
    for(int32 I=0;I<8;++I)
    {
        const FVector Delta=FVector((I&1)?Bounds.Max.X:Bounds.Min.X,(I&2)?Bounds.Max.Y:Bounds.Min.Y,(I&4)?Bounds.Max.Z:Bounds.Min.Z)-Bounds.GetCenter();
        const double Depth=FVector::DotProduct(Delta,Basis.GetUnitAxis(EAxis::X));
        Distance=FMath::Max(Distance,FMath::Abs(FVector::DotProduct(Delta,Basis.GetUnitAxis(EAxis::Y)))/Horizontal-Depth);
        Distance=FMath::Max(Distance,FMath::Abs(FVector::DotProduct(Delta,Basis.GetUnitAxis(EAxis::Z)))/Vertical-Depth);
    }
    return Distance;
}
double BattleMarkerPixels(double HullLength,double CameraDepth,double HorizontalFOV,const FIntPoint& Pixels)
{
    if(CameraDepth<=0||Pixels.X<=0||Pixels.Y<=0)return 0.;
    const double Scale=FMath::Clamp(Pixels.Y/1000.,1.,2.);
    const double Span=FMath::Max(1.,HullLength)*Pixels.X/(2*CameraDepth*FMath::Tan(FMath::DegreesToRadians(FMath::Clamp(HorizontalFOV,1.,179.))*.5));
    return Span<12*Scale?28*Scale:0.;
}
double ConstrainWorldNorthing(const FMinimalViewInfo& View,const FVector4& Rect,double Northing)
{
    const double X=Rect.X+Rect.Z*.5;
    const auto North=PlaneHit(View,FVector2D(X,Rect.Y+Rect.W*WorldEdgeMargin),0);
    const auto South=PlaneHit(View,FVector2D(X,Rect.Y+Rect.W*(1-WorldEdgeMargin)),0);
    if(!North.IsSet()||!South.IsSet())return Northing;
    const double Pole=WNTProjection::PoleNorthing();
    const double Lower=-Pole-(South->X-Northing),Upper=Pole-(North->X-Northing);
    return Lower<=Upper?FMath::Clamp(Northing,Lower,Upper):(Lower+Upper)*.5;
}
bool CanOrbitWorld(double Zoom) { return FMath::IsFinite(Zoom)&&Zoom>=WorldOrbitZoom; }
double WheelZoom(double CurrentTarget,double Delta,bool bBattle)
{
    const double Minimum=bBattle?.1:1.,Maximum=bBattle?1000.:MaxWorldZoom;
    if(!FMath::IsFinite(CurrentTarget))CurrentTarget=Minimum;
    CurrentTarget=FMath::Clamp(CurrentTarget,Minimum,Maximum);
    if(!FMath::IsFinite(Delta))return CurrentTarget;
    // Clamp in log space before Exp, so high-resolution touchpads and very
    // large accumulated gestures cannot overflow or become frame dependent.
    return FMath::Exp(FMath::Clamp(FMath::Loge(CurrentTarget)-Delta*(bBattle?BattleZoomPerPixel:WorldZoomPerPixel),FMath::Loge(Minimum),FMath::Loge(Maximum)));
}
double SmoothZoom(double Current,double Target,double DeltaSeconds)
{
    if(!FMath::IsFinite(Current)||Current<=0)return Target;
    if(!FMath::IsFinite(Target)||Target<=0||!FMath::IsFinite(DeltaSeconds)||DeltaSeconds<=0)return Current;
    const double Difference=FMath::Loge(Target/Current);
    const double Next=Current*FMath::Exp(Difference*(1-FMath::Exp(-24.0*FMath::Min(DeltaSeconds,.1))));
    return FMath::Abs(FMath::Loge(Target/Next))<.0005?Target:Next;
}
void FWorldOrbit::Reset() { Tilt=0.0;Yaw=0.0; }
bool FWorldOrbit::Drag(double Zoom,double DeltaX,double DeltaY)
{
    if(!CanOrbitWorld(Zoom)||!FMath::IsFinite(DeltaX)||!FMath::IsFinite(DeltaY))return false;
    Tilt=FMath::Clamp(Tilt+DeltaY*.25,0.0,52.0);
    Yaw=FRotator::NormalizeAxis(Yaw-DeltaX*.3);
    return true;
}
FVector2D FWorldOrbit::Angles(double Zoom)
{
    if(!CanOrbitWorld(Zoom))Reset();
    return FVector2D(Tilt,Yaw);
}
void FWorldOrbit::ZoomInput(double Delta)
{
    if(FMath::IsFinite(Delta)&&Delta>0)Reset();
}
TOptional<double> FFrameRateSampler::Observe(double Now)
{
    if(!FMath::IsFinite(Now))return {};
    if(WindowStart<0||Now<WindowStart){WindowStart=Now;Frames=0;return {};}
    ++Frames;const double Elapsed=Now-WindowStart;
    if(Elapsed<.5)return {};
    const double FPS=Frames/Elapsed;WindowStart=Now;Frames=0;return FPS;
}
bool FAnchorProgress::Stalled(double PixelError,const FVector& ConstrainedFocus)
{
    const bool Result=bObserved&&PixelError>=PreviousError-.01&&ConstrainedFocus.Equals(PreviousFocus,1e-9);
    PreviousError=PixelError;PreviousFocus=ConstrainedFocus;bObserved=true;
    return Result;
}
bool NeedsOriginRebase(double Longitude,double Meridian)
{
    return FMath::Abs(WNTProjection::WrapLongitude(Longitude-Meridian))>1e-9;
}
}

namespace
{
double Number(const TSharedPtr<FJsonObject>& Object, const TCHAR* Key, double Default = 0)
{
    double Value;
    return Object.IsValid() && Object->TryGetNumberField(Key, Value) && FMath::IsFinite(Value) ? Value : Default;
}
FString String(const TSharedPtr<FJsonObject>& Object, const TCHAR* Key)
{
    FString Value;
    if (Object.IsValid()) Object->TryGetStringField(Key, Value);
    return Value;
}
FString Encode(const TSharedPtr<FJsonObject>& Object)
{
    FString Json;
    FJsonSerializer::Serialize(Object.ToSharedRef(), TJsonWriterFactory<>::Create(&Json));
    return Json;
}
TSharedPtr<FJsonObject> Decode(const FString& Json)
{
    TSharedPtr<FJsonObject> Result;
    FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Json), Result);
    return Result;
}
}

AWNTPlayerController::AWNTPlayerController()
{
    PrimaryActorTick.bCanEverTick = true;
    bShowMouseCursor = true;
    bAutoManageActiveCameraTarget = false;
}

void AWNTPlayerController::BeginPlay()
{
    Super::BeginPlay();
    if (!IsLocalController()) return;
    SceneCamera = GetWorld()->SpawnActor<AWNTCameraActor>();
    SetViewTarget(SceneCamera);
    Bridge = NewObject<UWNTBrowserBridge>(this);
    Bridge->Owner = this;
    FParse::Value(FCommandLine::Get(), TEXT("WNTDataRoot="), DataRoot);
    if (DataRoot.IsEmpty())
    {
        DataRoot = FPaths::Combine(FPaths::ProjectDir(), TEXT("GameData"));
        if (!FPaths::DirectoryExists(DataRoot)) DataRoot = FPaths::Combine(FPaths::ProjectDir(), TEXT(".."));
    }
    DataRoot = FPaths::ConvertRelativePathToFull(DataRoot);
    FPaths::NormalizeDirectoryName(DataRoot);
    if (!FPaths::FileExists(FPaths::Combine(DataRoot, TEXT("worker/unreal-server.mjs"))))
    {
        Fail(TEXT("The campaign data folder is missing. Launch with tools/Open-Unreal.ps1 or supply -WNTDataRoot."));
        return;
    }
    WorldScene = GetWorld()->SpawnActor<AWNTWorldActor>();
    if (!WorldScene->Initialize(DataRoot))
    {
        Fail(TEXT("The native world could not load its terrain or ship assets: ") + WorldScene->GetLoadError());
        return;
    }
    WorldScene->SetSceneMode(TEXT("hidden"));
    StartHost();
}

void AWNTPlayerController::StartHost()
{
    FString Node;
    FParse::Value(FCommandLine::Get(), TEXT("WNTNode="), Node);
    if (Node.IsEmpty()) Node = FPlatformMisc::GetEnvironmentVariable(TEXT("WNT_NODE_EXE"));
    if (Node.IsEmpty()) Node = FPaths::Combine(DataRoot, TEXT("Runtime/node.exe"));
    if (!FPaths::FileExists(Node))
    {
        Fail(TEXT("Node.js is required by the campaign service. Use tools/Open-Unreal.ps1 or -WNTNode=<node.exe>."));
        return;
    }
    if (!FPlatformProcess::CreatePipe(HostRead, HostWrite) ||
        !FPlatformProcess::CreatePipe(HostInputRead, HostInputWrite, true))
    {
        Fail(TEXT("Could not create the private campaign service pipes.")); return;
    }
    const FString Script = FPaths::Combine(DataRoot, TEXT("worker/unreal-server.mjs"));
    FString Arguments = FString::Printf(TEXT("\"%s\""), *Script);
    FString SaveDirectory;
    if (FParse::Value(FCommandLine::Get(), TEXT("WNTSaveDir="), SaveDirectory))
    {
        if (SaveDirectory.Contains(TEXT("\""))) { Fail(TEXT("The save directory contains an invalid quote.")); return; }
        Arguments += FString::Printf(TEXT(" --save-dir \"%s\""), *FPaths::ConvertRelativePathToFull(SaveDirectory));
    }
    HostProcess = FPlatformProcess::CreateProc(*Node, *Arguments, false, true, true, nullptr, 0,
        *DataRoot, HostWrite, HostInputRead, HostWrite);
    // Only the child owns these ends. Closing our duplicates lets EOF signal shutdown.
    FPlatformProcess::ClosePipe(nullptr, HostWrite); HostWrite = nullptr;
    FPlatformProcess::ClosePipe(HostInputRead, nullptr); HostInputRead = nullptr;
    HostStarted = FPlatformTime::Seconds();
    if (!HostProcess.IsValid()) Fail(TEXT("The campaign service could not start. See the Unreal log."));
    else UE_LOG(LogTemp, Display, TEXT("WNT campaign service launched; waiting for its local address."));
}

void AWNTPlayerController::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);
    const auto FPS=FrameRate.Observe(FPlatformTime::Seconds());
    if(FPS.IsSet()&&Browser.IsValid()&&!bHostFailed)
    {
        // Normal Shipping telemetry: one small push at most twice a second,
        // independent of automation diagnostics and campaign render updates.
        auto Event=MakeShared<FJsonObject>();Event->SetStringField(TEXT("type"),TEXT("performance"));
        Event->SetNumberField(TEXT("fps"),FPS.GetValue());Send(Event);
    }
    if(FrameSamples.Num()<240)FrameSamples.Add(DeltaSeconds*1000.0);
    else {FrameSamples[FrameSampleCursor]=DeltaSeconds*1000.0;FrameSampleCursor=(FrameSampleCursor+1)%240;}
    if (HostProcess.IsValid() && !bHostFailed)
    {
        const FString Output = FPlatformProcess::ReadPipe(HostRead);
        if (Origin.IsEmpty())
        {
            HostOutput += Output;
            int32 Newline;
            while (HostOutput.FindChar(TEXT('\n'), Newline))
            {
                const FString Line = HostOutput.Left(Newline);
                HostOutput.RightChopInline(Newline + 1);
                const TSharedPtr<FJsonObject> Packet = Decode(Line);
                const FString Candidate = String(Packet, TEXT("origin"));
                if (WNTBrowserPolicy::IsLocalOrigin(Candidate))
                {
                    Origin = Candidate; UE_LOG(LogTemp, Display, TEXT("WNT campaign service ready at %s"), *Origin); OpenHUD(); break;
                }
                if (!Line.IsEmpty()) UE_LOG(LogTemp, Warning, TEXT("Campaign service: %s"), *Line.Left(2000));
            }
            if (Origin.IsEmpty() && FPlatformTime::Seconds() - HostStarted > 30)
                Fail(TEXT("The campaign service did not become ready. See the Unreal log."));
        }
        else if (!Output.IsEmpty()) UE_LOG(LogTemp, Warning, TEXT("Campaign service: %s"), *Output.Left(2000));
        if (!FPlatformProcess::IsProcRunning(HostProcess) && !bClosing)
            Fail(TEXT("The campaign service stopped. Close the game and inspect the Unreal log before continuing."));
    }
    if (bClosing && FPlatformTime::Seconds() - CloseStarted > 20)
    {
        bClosing = false;
        auto Event = MakeShared<FJsonObject>(); Event->SetStringField(TEXT("type"), TEXT("error"));
        Event->SetStringField(TEXT("message"), TEXT("Saving before close timed out. The window has stayed open; try Save again.")); Send(Event);
    }
    int32 ViewWidth,ViewHeight;GetViewportSize(ViewWidth,ViewHeight);
    if(LastViewport!=FIntPoint(ViewWidth,ViewHeight))bCameraDirty=true;
    if(SceneCamera&&WorldScene&&!FMath::IsNearlyEqual(Zoom,TargetZoom,1e-10))
    {
        Zoom=WNTCameraMath::SmoothZoom(Zoom,TargetZoom,DeltaSeconds);
        if(bHasZoomAnchor)
        {
            if(Mode!=TEXT("battle"))ZoomAnchor=WNTProjection::ReprojectBetweenMeridians(ZoomAnchor,ZoomAnchorMeridian,Meridian);
            ZoomAnchorMeridian=Meridian;
            AnchorPoint(ZoomAnchor,ZoomPointer);
            if(Mode!=TEXT("battle"))ZoomAnchor=WNTProjection::ReprojectBetweenMeridians(ZoomAnchor,ZoomAnchorMeridian,Meridian);
            ZoomAnchorMeridian=Meridian;
        }
        bCameraDirty=true;
    }
    bool DirectorMoved=false;
    if(SceneCamera&&Mode==TEXT("battle")&&BattleDirector.IsEnabled()&&!BattleDirector.IsPaused())
    {
        const double Aspect=FMath::Max(.15,ViewWidth*ViewRect.Z/FMath::Max(1.,ViewHeight*ViewRect.W));
        if(const auto Desired=BattleDirector.Evaluate(FPlatformTime::Seconds(),Aspect);Desired.IsSet())
        {
            FWNTBattleCameraDirector::FView Current;
            Current.Target=BattleTarget;Current.Distance=BattleDistance/Zoom;Current.Tilt=BattleTilt;Current.Yaw=BattleYaw;
            const bool bCut=FWNTBattleCameraDirector::NeedsCut(Current,Desired.GetValue());
            const auto View=bCut?Desired.GetValue():FWNTBattleCameraDirector::Ease(Current,Desired.GetValue(),DeltaSeconds);
            if(bCut){++CinematicCutCount;if(PlayerCameraManager)PlayerCameraManager->SetGameCameraCutThisFrame();}
            BattleTarget=View.Target;BattleDistance=View.Distance;BattleTilt=View.Tilt;BattleYaw=View.Yaw;
            Zoom=TargetZoom=1;bHasZoomAnchor=false;bCameraDirty=true;DirectorMoved=true;
        }
    }
    if (SceneCamera && bCameraDirty)
    {
        const double Now=FPlatformTime::Seconds();
        const bool Notify=!DirectorMoved||Now-LastDirectorNotification>=.2;
        UpdateCamera(Notify);if(Notify)LastDirectorNotification=Now;
    }
}

void AWNTPlayerController::OpenHUD()
{
    if (!GetWorld()->GetGameViewport()) { Fail(TEXT("The game viewport is not available for the campaign interface.")); return; }
    UE_LOG(LogTemp, Display, TEXT("WNT opening the native browser interface."));
    // UE 5.8's Slate browser assumes the UMG browser plugin has loaded this
    // module. Our direct Slate integration must initialize it explicitly.
    if (!IWNTWebBrowserModule::Get().IsWebModuleAvailable())
    {
        Fail(TEXT("Unreal's Chromium runtime is unavailable. Verify the engine installation and native package browser files."));
        return;
    }
    FWNTWebBrowserInitSettings BrowserSettings;
    BrowserSettings.OfflineProxy = Origin;
    IWNTWebBrowserModule::Get().CustomInitialize(BrowserSettings);
    Window = GetWorld()->GetGameViewport()->GetWindow();
    const auto ExplainOffline = [this]()
    {
        auto Event = MakeShared<FJsonObject>(); Event->SetStringField(TEXT("type"), TEXT("error"));
        Event->SetStringField(TEXT("message"), TEXT("Single-player stays offline. Reference links do not open a web browser; complete credits are included in the game's assets/licenses folder."));
        Send(Event);
    };
    SAssignNew(Browser, SWNTWebBrowser)
        .InitialURL(TEXT("about:blank"))
        .SupportsTransparency(true)
        .BackgroundColor(FColor::Transparent)
        .ShowControls(false).ShowAddressBar(false).ShowInitialThrobber(false)
        .BrowserFrameRate(60)
        .OnLoadError_Lambda([this]() { Fail(TEXT("The local campaign interface could not load. Close the test game and inspect its launch log.")); })
        .OnLoadUrl_Lambda([this](const FString&, const FString& URL, FString& Response)
        {
            if (WNTBrowserPolicy::AllowsResource(URL, Origin)) return false;
            Response.Empty(); // CEF serves this local empty response, never the remote resource.
            return true;
        })
        .OnBeforeNavigation_Lambda([this, ExplainOffline](const FString& URL, const FWNTWebNavigationRequest&)
        {
            // A permanent UObject binding must never reach a remote page.
            if (WNTBrowserPolicy::AllowsNavigation(URL, Origin)) return false;
            ExplainOffline();
            return true;
        })
        .OnBeforePopup_Lambda([ExplainOffline](FString, FString)
        {
            ExplainOffline();
            return true;
        });
    Browser->BindUObject(TEXT("wnt"), Bridge, true);
    // Offscreen CEF tests inject real DOM input through their explicit debug
    // connection. Slate can still synthesize desktop cursor moves (including
    // buttonless moves) into FNullWindow, racing those gestures at high DPI.
    // Exclude only this invisible automation widget from native hit testing;
    // normal physical windows retain their complete mouse/keyboard input.
    // Available in the tested Shipping binary only with an explicit save override.
    if(WNTBrowserPolicy::AllowsAutomation(FCommandLine::Get())
        &&FSlateApplication::Get().IsRenderingOffScreen())
        Browser->SetVisibility(EVisibility::HitTestInvisible);
    Overlay = Browser;
    GetWorld()->GetGameViewport()->AddViewportWidgetContent(Overlay.ToSharedRef(), 10);
    // Embedded PIE can expose the editor's main SWindow. Its close lifecycle
    // belongs to the editor, never to this game's autosave hook.
    if (Window.IsValid() && GetWorld()->WorldType==EWorldType::Game)
    {
        Window.Pin()->SetRequestDestroyWindowOverride(FRequestDestroyWindowOverride::CreateUObject(this, &AWNTPlayerController::RequestClose));
        bOwnsCloseOverride=true;
    }
    Browser->LoadURL(Origin + TEXT("/?unreal=1"));
    FInputModeUIOnly InputMode; InputMode.SetWidgetToFocus(Browser); SetInputMode(InputMode);
}

void AWNTPlayerController::Fail(const FString& Message)
{
    bHostFailed = true;
    UE_LOG(LogTemp, Error, TEXT("WNT Unreal: %s"), *Message);
    if (Browser && Browser->IsLoaded())
    {
        auto Event = MakeShared<FJsonObject>(); Event->SetStringField(TEXT("type"), TEXT("error"));
        Event->SetStringField(TEXT("message"), Message); Send(Event); return;
    }
    if (GetWorld() && GetWorld()->GetGameViewport())
    {
        if (Overlay) GetWorld()->GetGameViewport()->RemoveViewportWidgetContent(Overlay.ToSharedRef());
        Overlay = SNew(SBorder).Padding(40)[SNew(STextBlock).Text(FText::FromString(Message)).AutoWrapText(true)];
        GetWorld()->GetGameViewport()->AddViewportWidgetContent(Overlay.ToSharedRef(), 20);
    }
}

void AWNTPlayerController::Send(const TSharedPtr<FJsonObject>& Event)
{
#if WITH_DEV_AUTOMATION_TESTS
    if(AutomationEventObserver)AutomationEventObserver(Event);
#endif
    if (!Browser) return;
    Event->SetStringField(TEXT("instanceId"), InstanceId);
    Browser->ExecuteJavascript(TEXT("globalThis.WNTUnreal?.receive(") + Encode(Event) + TEXT(");"));
}

void AWNTPlayerController::Receive(const FString& Kind, const FString& Json)
{
    if (!WorldScene || Json.Len() > 32 * 1024 * 1024) return;
    const auto Packet = Decode(Json);
    if (!Packet.IsValid()) return;
    if (Kind == TEXT("world")) WorldScene->ApplyWorldPacket(Packet);
    else if (Kind == TEXT("battle"))
    {
        const FString Id = String(Packet, TEXT("id"));
        WorldScene->ApplyBattlePacket(Packet);
        if (Id != LastBattleId) { LastBattleId = Id; FitBattle(); }
        BattleDirector.SetPacket(Packet,FPlatformTime::Seconds());
        bCameraDirty=true;
    }
    else if (Kind == TEXT("viewport"))
    {
        SetMode(String(Packet, TEXT("mode")), String(Packet, TEXT("instanceId")));
        ViewRect = FVector4(FMath::Clamp(Number(Packet, TEXT("x")), 0., 1.),
            FMath::Clamp(Number(Packet, TEXT("y")), 0., 1.),
            FMath::Clamp(Number(Packet, TEXT("width"), 1), .02, 1.),
            FMath::Clamp(Number(Packet, TEXT("height"), 1), .02, 1.));
        ViewRect.X=FMath::Min(ViewRect.X,.98);ViewRect.Y=FMath::Min(ViewRect.Y,.98);
        ViewRect.Z=FMath::Min(ViewRect.Z,1-ViewRect.X);ViewRect.W=FMath::Min(ViewRect.W,1-ViewRect.Y);
        bCameraDirty = true;
    }
    else if (Kind == TEXT("input")) Input(Packet);
}

void AWNTPlayerController::SetMode(const FString& NewMode, const FString& NewInstance)
{
    if (NewMode != TEXT("world") && NewMode != TEXT("battle") && NewMode != TEXT("hidden")) return;
    InstanceId = NewInstance;
    if (Mode == NewMode) return;
    if (Mode == TEXT("world")) WorldZoom = Zoom;
    else if (Mode == TEXT("battle")) BattleZoom = Zoom;
    Mode = NewMode; Zoom = Mode == TEXT("battle") ? BattleZoom : WorldZoom;
    TargetZoom=Zoom;bHasZoomAnchor=false;
    WorldScene->SetSceneMode(Mode); bCameraDirty = true;
}

void AWNTPlayerController::UpdateCamera(bool bNotify)
{
    int32 Width, Height; GetViewportSize(Width, Height);
    if (!SceneCamera || !WorldScene || Width <= 0 || Height <= 0) return;
    // A queued pick/hover can need fresh matrices before the regular Tick.
    // Its silent refresh must not consume the camera update owed to the HUD.
    if(bNotify)bCameraDirty=false;
    LastViewport=FIntPoint(Width,Height);
    const bool Battle = Mode == TEXT("battle");
    const double WorldDistance=WNTCameraMath::WorldViewDistance();
    const double Distance = (Battle ? BattleDistance : WorldDistance) / Zoom;
    const FVector2D WorldAngles=Battle?FVector2D::ZeroVector:WorldOrbit.Angles(Zoom);
    const double Angle = Battle ? BattleTilt : WorldAngles.X;
    const double Yaw = Battle ? BattleYaw : WorldAngles.Y;
    FVector Target = BattleTarget;
    if (!Battle)
    {
        const double HeightMetres = WorldScene->GetTerrain() ? WorldScene->GetTerrain()->RenderHeightAt(FocusGeo) : 0;
        Target = WNTProjection::Forward(FocusGeo, Meridian, FMath::Max(0., HeightMetres));
    }
    WNTCameraMath::ConfigureProjection(SceneCamera->View,LastViewport,ViewRect);
    WNTCameraMath::Orbit(SceneCamera->View,Target,Distance,Angle,Yaw);
    if(!Battle&&Angle<=0&&FMath::IsNearlyZero(Yaw))
    {
        const double Northing=WNTCameraMath::ConstrainWorldNorthing(SceneCamera->View,ViewRect,Target.X);
        if(!FMath::IsNearlyEqual(Northing,Target.X,1e-6))
        {
            Target.X=Northing;
            const auto Latitude=WNTProjection::Inverse(FVector(Target.X,0,0),Meridian);
            if(Latitude.IsSet())FocusGeo.Y=Latitude->Y;
            // Equal Earth's east-west scale changes with latitude. Reproject
            // the complete focus after clamping northing; retaining the old Y
            // coordinate would shift longitude on the following frame.
            Target=WNTProjection::Forward(FocusGeo,Meridian,Target.Z/WNTProjection::WorldUnitsPerMetre);
            WNTCameraMath::Orbit(SceneCamera->View,Target,Distance,0,0);
        }
    }
    if(Battle||Angle>0||Distance<2000000.0)WNTCameraMath::EnsureClearance(SceneCamera->View,Target,[&](const FVector& Point)
    {
        if(Battle||!WorldScene->GetTerrain())return 0.0;
        const auto Geo=WNTProjection::Inverse(Point,Meridian);
        return Geo.IsSet()?WorldScene->GetTerrain()->RenderHeightAt(Geo.GetValue())*100.0:0.0;
    });
    if(!bNotify)return;
    auto Event = MakeShared<FJsonObject>(); Event->SetStringField(TEXT("type"), TEXT("camera"));
    Event->SetNumberField(TEXT("zoom"), Zoom); Event->SetNumberField(TEXT("longitude"), FocusGeo.X);
    Event->SetNumberField(TEXT("latitude"), FocusGeo.Y); Event->SetNumberField(TEXT("tilt"), SceneCamera->View.Rotation.Pitch+90);
    Event->SetNumberField(TEXT("yaw"), SceneCamera->View.Rotation.Yaw);
    Event->SetBoolField(TEXT("orbitEnabled"), Battle||WNTCameraMath::CanOrbitWorld(Zoom));
    Event->SetBoolField(TEXT("cinematicAvailable"),Battle&&BattleDirector.IsAvailable());
    Event->SetBoolField(TEXT("cinematicEnabled"),Battle&&BattleDirector.IsEnabled());
    Event->SetStringField(TEXT("cameraShot"),Battle&&BattleDirector.IsEnabled()?BattleDirector.ActiveShot(FPlatformTime::Seconds()):TEXT("manual"));
    Event->SetNumberField(TEXT("requestedTilt"), Angle);Send(Event);
}

TOptional<FVector> AWNTPlayerController::SurfacePoint(const FVector2D& Pointer,bool bIncludeActors)const
{
    if(!SceneCamera||!WorldScene)return {};
    FVector OriginPoint,Direction;
    if(!WNTCameraMath::Ray(SceneCamera->View,Pointer,OriginPoint,Direction))return {};
    auto Surface=WNTCameraMath::PlaneHit(SceneCamera->View,Pointer,0);
    if(Surface.IsSet()&&Mode!=TEXT("battle")&&WorldScene->GetTerrain()&&Direction.Z< -1e-9)
    {
        const AWNTTerrainActor* Terrain=WorldScene->GetTerrain();
        const double End=FVector::DotProduct(Surface.GetValue()-OriginPoint,Direction);
        const double Ceiling=(Terrain->LandBaseMetres+10000)*100;
        const double Begin=FMath::Clamp((Ceiling-OriginPoint.Z)/Direction.Z,0.0,End);
        auto Above=[&](double Distance)
        {
            const FVector Point=OriginPoint+Direction*Distance;const auto Geo=WNTProjection::Inverse(Point,Meridian);
            return Point.Z-(Geo.IsSet()?Terrain->RenderHeightAt(Geo.GetValue())*100.0:0.0);
        };
        double Last=Begin;
        for(int32 Step=1;Step<=64;++Step)
        {
            const double Next=FMath::Lerp(Begin,End,double(Step)/64);
            if(Above(Next)<=0)
            {
                double Low=Last,High=Next;
                for(int32 I=0;I<24;++I){const double Mid=(Low+High)*.5;if(Above(Mid)>0)Low=Mid;else High=Mid;}
                Surface=OriginPoint+Direction*((Low+High)*.5);break;
            }
            Last=Next;
        }
    }
    if(bIncludeActors)
    {
        FHitResult Hit;FCollisionQueryParams Params(SCENE_QUERY_STAT(WNTAnchorPicking),true);
        Params.AddIgnoredActor(WorldScene);Params.AddIgnoredActor(WorldScene->GetTerrain());
        const double Limit=Surface.IsSet()?FVector::Distance(Surface.GetValue(),OriginPoint)+10.0:1e11;
        if(GetWorld()->LineTraceSingleByChannel(Hit,OriginPoint,OriginPoint+Direction*Limit,ECC_Visibility,Params)&&WorldScene->GetSelection(Hit.GetActor()).IsValid())
            Surface=Hit.ImpactPoint;
    }
    return Surface;
}

void AWNTPlayerController::MoveCameraTarget(const FVector& Offset)
{
    if(Mode==TEXT("battle")){BattleTarget+=FVector(Offset.X,Offset.Y,0);return;}
    const FVector Position=WNTProjection::Forward(FocusGeo,Meridian)+FVector(Offset.X,Offset.Y,0);
    FocusGeo=WNTCameraMath::WrappedFocus(Position,Meridian);
    // Equal Earth recenters its longitude-dependent shape continuously. The
    // terrain material shears immutable vertices; this is ordinary movement,
    // not a camera cut or mesh rebuild.
    if(WNTCameraMath::NeedsOriginRebase(FocusGeo.X,Meridian))Meridian=FocusGeo.X;
}

void AWNTPlayerController::AnchorPoint(const FVector& Original,const FVector2D& Pointer)
{
    const bool Battle=Mode==TEXT("battle");
    FVector Anchor=Original;
    const double OriginalMeridian=Meridian;
    WNTCameraMath::FAnchorProgress Progress;
    LastAnchorIterations=0;LastAnchorRebases=0;bLastAnchorConstrained=false;
    for(int32 I=0;I<12;++I)
    {
        UpdateCamera(false);
        ++LastAnchorIterations;
        const auto Current=WNTCameraMath::PlaneHit(SceneCamera->View,Pointer,Anchor.Z);
        if(!Current.IsSet())break;
        const auto Screen=WNTCameraMath::Project(SceneCamera->View,Anchor);
        if(!Screen.IsSet())break;
        const double PixelError=FMath::Max(FMath::Abs(Screen->X-Pointer.X)*LastViewport.X,FMath::Abs(Screen->Y-Pointer.Y)*LastViewport.Y);
        if(PixelError<.15)break;
        // Observe the actual post-clamp focus. At a pole/full-world limit a
        // vertical request cannot converge; repeating it only updates terrain
        // and camera again. Longitude changes still count as progress even
        // though continuous recentering keeps the camera's projected Y at zero.
        const FVector ConstrainedFocus=Battle?BattleTarget:FVector(FocusGeo.X,FocusGeo.Y,Meridian);
        if(Progress.Stalled(PixelError,ConstrainedFocus)){bLastAnchorConstrained=true;break;}
        const double PreviousMeridian=Meridian;
        MoveCameraTarget(Anchor-Current.GetValue());
        // Preserve the exact repeated copy under the cursor, even when it is
        // outside ±180 degrees. Folding its longitude would jump a full world.
        if(!Battle)Anchor=WNTProjection::ReprojectBetweenMeridians(Anchor,PreviousMeridian,Meridian);
    }
    // The solver only needs camera matrices and geographic focus. Repositioning
    // every terrain tile, harbor, convoy and hull inside each correction made
    // a wheel frame perform up to twelve complete map updates. Commit the
    // converged longitude exactly once, then refresh against its final surface.
    if(!Battle&&WNTCameraMath::NeedsOriginRebase(Meridian,OriginalMeridian))
    {WorldScene->SetCentralMeridian(Meridian);LastAnchorRebases=1;}
    bCameraDirty=true;
}

void AWNTPlayerController::FitBattle()
{
    if (PlayerCameraManager) PlayerCameraManager->SetGameCameraCutThisFrame();
    const FBox Bounds = WorldScene->GetBattleBounds();
    if (Bounds.IsValid)
    {
        BattleTarget = Bounds.GetCenter();
        int32 Width, Height; GetViewportSize(Width, Height);
        BattleDistance=WNTCameraMath::BattleFitDistance(Bounds,FIntPoint(Width,Height),ViewRect);
    }
    BattleTilt=WNTCameraMath::BattleOverviewTilt;BattleYaw=WNTCameraMath::BattleOverviewYaw;
    BattleZoom = 1; if (Mode == TEXT("battle")) Zoom = 1;
    TargetZoom=Zoom;bHasZoomAnchor=false;
    bCameraDirty = true;
}

void AWNTPlayerController::Input(const TSharedPtr<FJsonObject>& Packet)
{
    if (FParse::Param(FCommandLine::Get(), TEXT("WNTAutomation")) &&
        (String(Packet, TEXT("action")) == TEXT("diagnostics") || String(Packet, TEXT("action")) == TEXT("capture") || String(Packet,TEXT("action"))==TEXT("resize") || String(Packet,TEXT("action"))==TEXT("maximize") || String(Packet,TEXT("action"))==TEXT("restore")))
    { AutomationRequest(Packet); return; }
    if (String(Packet, TEXT("instanceId")) != InstanceId || Mode==TEXT("hidden") || !SceneCamera) return;
    const FString Action = String(Packet, TEXT("action"));
    const bool Battle = Mode == TEXT("battle");
    if (Action == TEXT("pick") || Action == TEXT("hover")) { Pick(Packet, Action == TEXT("hover")); return; }
    if (Action == TEXT("selectBox")) { if (!Battle) SelectBox(Packet); return; }
    if(Battle&&Action==TEXT("cinematic"))
    {
        bool Enabled=false;Packet->TryGetBoolField(TEXT("enabled"),Enabled);BattleDirector.SetEnabled(Enabled);
        bHasZoomAnchor=false;TargetZoom=Zoom;bCameraDirty=true;UpdateCamera();return;
    }
    if(Battle&&(Action==TEXT("zoom")||Action==TEXT("pan")||Action==TEXT("tilt")||Action==TEXT("focus")))BattleDirector.SetEnabled(false);
    if (Action == TEXT("tilt") && !Battle && !WNTCameraMath::CanOrbitWorld(Zoom)) return;
    if(bCameraDirty)UpdateCamera(false);
    const FVector2D Pointer(FMath::Clamp(Number(Packet,TEXT("x"),ViewRect.X+ViewRect.Z*.5),0.0,1.0),FMath::Clamp(Number(Packet,TEXT("y"),ViewRect.Y+ViewRect.W*.5),0.0,1.0));
    const FVector2D Previous(Number(Packet,TEXT("previousX"),Pointer.X-Number(Packet,TEXT("dx"))/FMath::Max(1,LastViewport.X)),Number(Packet,TEXT("previousY"),Pointer.Y-Number(Packet,TEXT("dy"))/FMath::Max(1,LastViewport.Y)));
    TOptional<FVector> Anchor;
    if(Action==TEXT("zoom")||Action==TEXT("pan")||(Battle&&Action==TEXT("tilt")))Anchor=SurfacePoint(Action==TEXT("zoom")?Pointer:Previous,true);
    if (Action == TEXT("zoom"))
    {
        if(!Battle)
        {
            WorldOrbit.ZoomInput(Number(Packet,TEXT("delta")));
            // Reset immediately on any outward input, before the smoothed zoom
            // reaches its destination or crosses an inspection threshold.
            if(Number(Packet,TEXT("delta"))>0){bCameraDirty=true;UpdateCamera();}
        }
        // Gallery fitting scales to each hull's authored dimensions, including
        // small torpedo boats. The ship-distance cap applies to the world map.
        TargetZoom=WNTCameraMath::WheelZoom(TargetZoom,Number(Packet,TEXT("delta")),Battle);
        bHasZoomAnchor=Anchor.IsSet();ZoomPointer=Pointer;
        if(bHasZoomAnchor){ZoomAnchor=Anchor.GetValue();ZoomAnchorMeridian=Meridian;}
        return;
    }
    else if (Action == TEXT("tilt"))
    {
        if (Battle) { BattleTilt = FMath::Clamp(BattleTilt + Number(Packet, TEXT("dy")) * .25, 10., 85.); BattleYaw -= Number(Packet, TEXT("dx")) * .3; }
        else WorldOrbit.Drag(Zoom,Number(Packet,TEXT("dx")),Number(Packet,TEXT("dy")));
    }
    else if (Action == TEXT("pan"))
    {
        // The captured surface point is moved to the current pointer below.
        // Ray/plane intersection naturally includes perspective foreshortening.
    }
    else if (Action == TEXT("home"))
    {
        if (PlayerCameraManager) PlayerCameraManager->SetGameCameraCutThisFrame();
        if (Battle) {FitBattle();BattleDirector.SetEnabled(true);}
        else { Zoom = 1; WorldOrbit.Reset(); FocusGeo = FVector2D::ZeroVector; Meridian = 0; WorldScene->SetCentralMeridian(0); }
    }
    else if (Action == TEXT("focus") || Action == TEXT("fit-force"))
    {
        if (PlayerCameraManager) PlayerCameraManager->SetGameCameraCutThisFrame();
        if (Battle)
        {
            const auto Position = WorldScene->GetSelectedPosition(TEXT("battle-ship"), String(Packet, TEXT("id")), int32(Number(Packet, TEXT("hullIndex"))),String(Packet,TEXT("side")));
            if (Position.IsSet())
            {
                BattleTarget = Position.GetValue();
                const double Aspect=FMath::Max(.35,double(LastViewport.X)*ViewRect.Z/FMath::Max(1.,LastViewport.Y*ViewRect.W));
                // A relative3x zoom is still tens of km away after Midway Fit.
                // Focus always brings the real chosen hull to inspection range.
                BattleDistance=WNTCameraMath::BattleFocusDistance(Aspect);Zoom=WNTCameraMath::BattleFocusZoom;
            }
        }
        else
        {
            WorldOrbit.Reset();
            FocusGeo = FVector2D(WNTProjection::WrapLongitude(Number(Packet, TEXT("longitude"))), FMath::Clamp(Number(Packet, TEXT("latitude")), -89.9, 89.9));
            Meridian = FocusGeo.X; WorldScene->SetCentralMeridian(Meridian);
            Zoom = FMath::Clamp(Number(Packet, TEXT("zoom"), 6000), 1., WNTCameraMath::MaxWorldZoom);
            if(Action==TEXT("fit-force"))
            {
                const FBox Bounds=WorldScene->GetForceBounds(String(Packet,TEXT("id")));
                if(Bounds.IsValid)
                {
                    FocusGeo=WNTCameraMath::WrappedFocus(Bounds.GetCenter(),Meridian);
                    const double Aspect=FMath::Max(.1,double(LastViewport.X)*ViewRect.Z/(FMath::Max(1,LastViewport.Y)*ViewRect.W));
                    const FVector Extent=Bounds.GetExtent();
                    // North-up: X is north/south, Y east/west. Include actual
                    // formation extents and a margin for small ship silhouettes.
                    const double HalfHeight=FMath::Max(Extent.X,Extent.Y/Aspect);
                    const double Distance=FMath::Max(90000.0,HalfHeight*1.35/FMath::Tan(FMath::DegreesToRadians(22.5)));
                    const double Base=WNTCameraMath::WorldViewDistance();
                    Zoom=FMath::Clamp(Base/Distance,1.,WNTCameraMath::MaxWorldZoom);
                }
            }
        }
    }
    if(Anchor.IsSet())AnchorPoint(Anchor.GetValue(),Pointer);
    TargetZoom=Zoom;bHasZoomAnchor=false;
    bCameraDirty = true;
}

void AWNTPlayerController::AutomationRequest(const TSharedPtr<FJsonObject>& Packet)
{
    // Opt-in local test instrumentation; no console execution or arbitrary paths.
    if (!WNTBrowserPolicy::AllowsAutomation(FCommandLine::Get()) || !WorldScene || !SceneCamera) return;
    if(String(Packet,TEXT("action"))==TEXT("resize"))
    {
        const double Width=Number(Packet,TEXT("width")),Height=Number(Packet,TEXT("height"));
        if(Width>0&&Width<=7680&&Height>0&&Height<=4320&&Width==FMath::FloorToDouble(Width)&&Height==FMath::FloorToDouble(Height))
            WNTWindowPolicy::RequestWindowSize(GetWorld()->GetGameViewport(),FIntPoint(int32(Width),int32(Height)));
        return;
    }
    if(String(Packet,TEXT("action"))==TEXT("maximize")||String(Packet,TEXT("action"))==TEXT("restore"))
    {
        if(Window.IsValid()&&GetWorld()->WorldType==EWorldType::Game)
        {
            if(String(Packet,TEXT("action"))==TEXT("maximize"))Window.Pin()->Maximize();
            else Window.Pin()->Restore();
        }
        return;
    }
    if (String(Packet, TEXT("action")) == TEXT("capture"))
    {
        const FString Name = String(Packet, TEXT("name"));
        if (Name.IsEmpty() || Name.Len() > 80) return;
        for (TCHAR CodePoint : Name) if (!FChar::IsAlnum(CodePoint) && CodePoint != TEXT('-') && CodePoint != TEXT('_')) return;
        const FString Path = FPaths::Combine(FPaths::ProjectSavedDir(), TEXT("Screenshots"), Name + TEXT(".png"));
        bool bIncludeUI = false; Packet->TryGetBoolField(TEXT("includeUI"), bIncludeUI);
        FScreenshotRequest::RequestScreenshot(Path, bIncludeUI, false);
        // Match UE's Shot command: a previous UI capture otherwise leaves a
        // stale crop size when the next no-UI capture follows a window resize.
        if(auto* Client=GetWorld()->GetGameViewport())if(Client->Viewport)
        {
            const FIntPoint Size=Client->Viewport->GetRenderTargetTextureSizeXY();
            GScreenshotResolutionX=Size.X;GScreenshotResolutionY=Size.Y;
        }
        return;
    }
    if (bCameraDirty) UpdateCamera(false);
    auto Event = MakeShared<FJsonObject>();
    Event->SetStringField(TEXT("type"), TEXT("diagnostics"));
    Event->SetStringField(TEXT("mode"), Mode);
    Event->SetBoolField(TEXT("nativeWorldInitialized"), WorldScene->GetLoadError().IsEmpty());
    Event->SetStringField(TEXT("renderer"), TEXT("Unreal Engine native UWorld"));
    Event->SetNumberField(TEXT("zoom"), Zoom);
    int32 NativeWidth,NativeHeight;GetViewportSize(NativeWidth,NativeHeight);
    Event->SetNumberField(TEXT("viewportWidth"),NativeWidth);Event->SetNumberField(TEXT("viewportHeight"),NativeHeight);
    auto CameraRect=MakeShared<FJsonObject>();
    CameraRect->SetNumberField(TEXT("x"),ViewRect.X);CameraRect->SetNumberField(TEXT("y"),ViewRect.Y);
    CameraRect->SetNumberField(TEXT("width"),ViewRect.Z);CameraRect->SetNumberField(TEXT("height"),ViewRect.W);
    Event->SetObjectField(TEXT("viewRect"),CameraRect);
    if(Mode==TEXT("world"))
    {
        const auto North=WNTCameraMath::Project(SceneCamera->View,FVector(WNTProjection::PoleNorthing(),0,0));
        const auto South=WNTCameraMath::Project(SceneCamera->View,FVector(-WNTProjection::PoleNorthing(),0,0));
        if(North.IsSet())Event->SetNumberField(TEXT("northPoleScreenY"),North->Y);
        if(South.IsSet())Event->SetNumberField(TEXT("southPoleScreenY"),South->Y);
    }
    Event->SetNumberField(TEXT("windowMode"),Window.IsValid()?int32(Window.Pin()->GetWindowMode()):-1);
    Event->SetBoolField(TEXT("renderingOffscreen"),FSlateApplication::Get().IsRenderingOffScreen());
    Event->SetNumberField(TEXT("configuredWindowMode"),GEngine&&GEngine->GetGameUserSettings()?int32(GEngine->GetGameUserSettings()->GetFullscreenMode()):-1);
    Event->SetBoolField(TEXT("windowMaximized"),Window.IsValid()&&Window.Pin()->IsWindowMaximized());
    Event->SetNumberField(TEXT("targetZoom"),TargetZoom);
    if(Mode==TEXT("battle"))
    {
        Event->SetNumberField(TEXT("battleDistanceMetres"),BattleDistance/Zoom/100.);
        const FBox Bounds=WorldScene->GetBattleBounds();
        if(Bounds.IsValid){Event->SetNumberField(TEXT("battleSpanXMetres"),Bounds.GetSize().X/100.);Event->SetNumberField(TEXT("battleSpanYMetres"),Bounds.GetSize().Y/100.);}
    }
    Event->SetNumberField(TEXT("maxWorldTilt"),WNTCameraMath::MaxWorldTilt(Zoom));
    const FVector2D RequestedAngles=Mode==TEXT("battle")?FVector2D(BattleTilt,BattleYaw):WorldOrbit.Angles(Zoom);
    Event->SetNumberField(TEXT("requestedTilt"),RequestedAngles.X);
    Event->SetNumberField(TEXT("requestedYaw"),RequestedAngles.Y);
    if(WorldScene)Event->SetObjectField(TEXT("chart"),WorldScene->GetChartDiagnostics());
    Event->SetBoolField(TEXT("orbitEnabled"),Mode==TEXT("battle")||WNTCameraMath::CanOrbitWorld(Zoom));
    Event->SetNumberField(TEXT("worldOrbitZoom"),WNTCameraMath::WorldOrbitZoom);
    Event->SetNumberField(TEXT("lastAnchorIterations"),LastAnchorIterations);
    Event->SetNumberField(TEXT("lastAnchorRebases"),LastAnchorRebases);
    Event->SetNumberField(TEXT("wheelZoomPerPixel"),Mode==TEXT("battle")?WNTCameraMath::BattleZoomPerPixel:WNTCameraMath::WorldZoomPerPixel);
    Event->SetBoolField(TEXT("lastAnchorConstrained"),bLastAnchorConstrained);
    Event->SetBoolField(TEXT("zoomOutResetsOrbit"),true);
    Event->SetBoolField(TEXT("cinematicAvailable"),Mode==TEXT("battle")&&BattleDirector.IsAvailable());
    Event->SetBoolField(TEXT("cinematicEnabled"),Mode==TEXT("battle")&&BattleDirector.IsEnabled());
    Event->SetStringField(TEXT("cameraShot"),Mode==TEXT("battle")&&BattleDirector.IsEnabled()?BattleDirector.ActiveShot(FPlatformTime::Seconds()):TEXT("manual"));
    Event->SetNumberField(TEXT("cameraShotCount"),BattleDirector.ShotCount());
    Event->SetNumberField(TEXT("cinematicCutCount"),CinematicCutCount);
    Event->SetNumberField(TEXT("maxWorldZoom"),WNTCameraMath::MaxWorldZoom);
    Event->SetNumberField(TEXT("centralMeridian"),Meridian);
    if(!FrameSamples.IsEmpty())
    {
        auto Sorted=FrameSamples;Sorted.Sort();double Total=0;for(double Sample:Sorted)Total+=Sample;
        Event->SetNumberField(TEXT("frameMeanMs"),Total/Sorted.Num());
        Event->SetNumberField(TEXT("frameP95Ms"),Sorted[FMath::Min(Sorted.Num()-1,FMath::FloorToInt(Sorted.Num()*.95))]);
        Event->SetNumberField(TEXT("frameSampleCount"),Sorted.Num());
    }
    int32 PrimitiveCount=0,VisiblePrimitives=0,ShadowPrimitives=0;
    for(TActorIterator<AActor> It(GetWorld());It;++It)
    {
        TArray<UPrimitiveComponent*> Components;It->GetComponents(Components);
        for(const auto* Component:Components){++PrimitiveCount;if(!It->IsHidden()&&Component->IsVisible()){++VisiblePrimitives;if(Component->CastShadow)++ShadowPrimitives;}}
    }
    Event->SetNumberField(TEXT("primitiveComponentCount"),PrimitiveCount);
    Event->SetNumberField(TEXT("visiblePrimitiveCount"),VisiblePrimitives);
    Event->SetNumberField(TEXT("shadowCastingPrimitiveCount"),ShadowPrimitives);
    Event->SetNumberField(TEXT("tilt"), SceneCamera->View.Rotation.Pitch + 90);
    Event->SetNumberField(TEXT("yaw"), SceneCamera->View.Rotation.Yaw);
    Event->SetNumberField(TEXT("longitude"), FocusGeo.X); Event->SetNumberField(TEXT("latitude"), FocusGeo.Y);
    int32 Ships = 0, VisibleShips = 0, DetailedModels = 0, VisibleDetailedModels = 0, DeferredModels = 0, PendingModels = 0, ModelErrors = 0;
    for (TActorIterator<AWNTShipActor> It(GetWorld()); It; ++It)
    {
        ++Ships;
        if (!It->IsHidden()) ++VisibleShips;
        if (It->HasRenderableModel()) ++DetailedModels;
        if (It->IsModelDeferred()) ++DeferredModels;
        if (It->IsDetailedModelVisible()) ++VisibleDetailedModels;
        if (It->IsModelPending()) ++PendingModels;
        if (It->HasModelLoadError()) ++ModelErrors;
    }
    Event->SetNumberField(TEXT("shipActorCount"), Ships);
    Event->SetNumberField(TEXT("visibleShipCount"), VisibleShips);
    Event->SetNumberField(TEXT("detailedModelCount"), DetailedModels);
    Event->SetNumberField(TEXT("deferredModelCount"), DeferredModels);
    Event->SetNumberField(TEXT("visibleDetailedShipCount"), VisibleDetailedModels);
    Event->SetNumberField(TEXT("pendingModelCount"), PendingModels);
    Event->SetNumberField(TEXT("modelLoadErrors"), ModelErrors);
    TArray<UProceduralMeshComponent*> Tiles;
    if (WorldScene->GetTerrain()) WorldScene->GetTerrain()->GetComponents(Tiles);
    Event->SetNumberField(TEXT("terrainTileCount"), Tiles.Num());
    TArray<TSharedPtr<FJsonValue>> Targets;
    for (TActorIterator<AActor> It(GetWorld()); It && Targets.Num() < 24; ++It)
    {
        auto Selection = WorldScene->GetSelection(*It);
        if (!Selection || It->IsHidden() || !It->GetActorEnableCollision()) continue;
        const FBox Bounds = It->GetComponentsBoundingBox();
        const FVector Position = It->GetActorLocation();
        const TArray<FVector> Candidates{WorldScene->GetChartPixelSize(*It,LastViewport.Y)>0?Position:Bounds.GetCenter(), Position + FVector(0, 0, 500), Position + FVector(0, 0, 1200)};
        for (const FVector& Candidate : Candidates)
        {
            const auto Screen = WNTCameraMath::Project(SceneCamera->View, Candidate);
            if (!Screen.IsSet() || Screen->X < ViewRect.X || Screen->Y < ViewRect.Y || Screen->X > ViewRect.X + ViewRect.Z || Screen->Y > ViewRect.Y + ViewRect.W) continue;
            AActor* ChartHit=WorldScene->HitChart(Screen.GetValue(),FVector2D(10.0/FMath::Max(1,LastViewport.X),10.0/FMath::Max(1,LastViewport.Y)));
            if(ChartHit&&ChartHit!=*It)continue;
            if(!ChartHit)
            {
                FVector Start, Direction; WNTCameraMath::Ray(SceneCamera->View, Screen.GetValue(), Start, Direction);
                FHitResult Hit; FCollisionQueryParams Params(SCENE_QUERY_STAT(WNTAutomationPicking), true);
                Params.AddIgnoredActor(WorldScene);Params.AddIgnoredActor(WorldScene->GetTerrain());
                if (!GetWorld()->LineTraceSingleByChannel(Hit, Start, Start + Direction * 1e11, ECC_Visibility, Params) || Hit.GetActor() != *It) continue;
            }
            auto Target = MakeShared<FJsonObject>(); Target->Values = Selection->Values;
            if (const AWNTShipActor* Ship = Cast<AWNTShipActor>(*It)) Target->SetStringField(TEXT("modelId"), Ship->ModelId);
            Target->SetNumberField(TEXT("screenX"), Screen->X); Target->SetNumberField(TEXT("screenY"), Screen->Y);
            Target->SetBoolField(TEXT("visible"), true);
            const auto Geo = WNTProjection::Inverse(Position, Meridian);
            if (Geo.IsSet()) {Target->SetNumberField(TEXT("longitude"), Geo->X); Target->SetNumberField(TEXT("latitude"), Geo->Y);}
            Targets.Add(MakeShared<FJsonValueObject>(Target)); break;
        }
    }
    Event->SetArrayField(TEXT("targets"), Targets);
    Send(Event);
}

FBox2D AWNTPlayerController::PickBounds(AActor* Actor) const
{
    FBox2D Result(ForceInit);
    if(!Actor||Actor->IsHidden()||!Actor->GetActorEnableCollision())return Result;
    if(WorldScene)
    {
        const double Pixels=WorldScene->GetChartPixelSize(Actor,LastViewport.Y);
        if(Pixels>0)
        {
            const auto Centre=WNTCameraMath::Project(SceneCamera->View,Actor->GetActorLocation());
            if(Centre.IsSet())
            {
                const FVector2D Half(Pixels*.6/FMath::Max(1,LastViewport.X),Pixels*.6/FMath::Max(1,LastViewport.Y));
                Result+=Centre.GetValue()-Half;Result+=Centre.GetValue()+Half;
            }
            return Result;
        }
    }
    TArray<UMeshComponent*> Meshes;Actor->GetComponents(Meshes);
    for(auto* Mesh:Meshes)
    {
        if(!Mesh->IsVisible()||Mesh->bHiddenInGame)continue;
        const FBox Bounds=Mesh->Bounds.GetBox();
        for(int32 I=0;I<8;++I)
        {
            const FVector P((I&1)?Bounds.Max.X:Bounds.Min.X,(I&2)?Bounds.Max.Y:Bounds.Min.Y,(I&4)?Bounds.Max.Z:Bounds.Min.Z);
            const auto Screen=WNTCameraMath::Project(SceneCamera->View,P);
            if(Screen.IsSet())Result+=Screen.GetValue();
        }
    }
    return Result;
}

void AWNTPlayerController::SelectBox(const TSharedPtr<FJsonObject>& Packet)
{
    if(!SceneCamera||!WorldScene||Mode!=TEXT("world"))return;
    if(bCameraDirty)UpdateCamera(false);
    const FVector2D A(Number(Packet,TEXT("x0")),Number(Packet,TEXT("y0"))),B(Number(Packet,TEXT("x")),Number(Packet,TEXT("y")));
    FBox2D Rectangle(ForceInit);Rectangle+=A;Rectangle+=B;
    Rectangle.Min.X=FMath::Max(Rectangle.Min.X,ViewRect.X);Rectangle.Min.Y=FMath::Max(Rectangle.Min.Y,ViewRect.Y);
    Rectangle.Max.X=FMath::Min(Rectangle.Max.X,ViewRect.X+ViewRect.Z);Rectangle.Max.Y=FMath::Min(Rectangle.Max.Y,ViewRect.Y+ViewRect.W);
    TSet<FString> Unique;
    if(Rectangle.Min.X<=Rectangle.Max.X&&Rectangle.Min.Y<=Rectangle.Max.Y)
        for(TActorIterator<AActor> It(GetWorld());It;++It)
        {
            const auto Pick=WorldScene->GetSelection(*It);if(!Pick.IsValid())continue;
            const FString Kind=String(Pick,TEXT("kind"));
            const FString Fleet=Kind==TEXT("fleet")?String(Pick,TEXT("id")):Kind==TEXT("ship")?String(Pick,TEXT("fleetId")):FString();
            // World packets expose hulls only for the player's own fleets;
            // contacts, merchants and country/port markers cannot leak into orders.
            if(!Fleet.IsEmpty()&&WNTSelectionGeometry::Overlaps(Rectangle,PickBounds(*It)))Unique.Add(Fleet);
        }
    TArray<FString> Ids=Unique.Array();Ids.Sort();TArray<TSharedPtr<FJsonValue>> Values;
    for(const FString& Id:Ids)Values.Add(MakeShared<FJsonValueString>(Id));
    auto Selection=MakeShared<FJsonObject>();Selection->SetStringField(TEXT("kind"),TEXT("fleet-group"));
    Selection->SetStringField(TEXT("id"),Ids.IsEmpty()?TEXT(""):Ids[0]);Selection->SetArrayField(TEXT("ids"),Values);
    auto Event=MakeShared<FJsonObject>();Event->SetStringField(TEXT("type"),TEXT("select"));Event->SetObjectField(TEXT("selection"),Selection);Send(Event);
}

void AWNTPlayerController::Pick(const TSharedPtr<FJsonObject>& Packet, bool bHover)
{
    if(!SceneCamera||Mode==TEXT("hidden"))return;if(bCameraDirty)UpdateCamera(false);
    const FVector2D Pointer(FMath::Clamp(Number(Packet,TEXT("x")),0.0,1.0),FMath::Clamp(Number(Packet,TEXT("y")),0.0,1.0));
    const FVector2D Padding(FMath::Clamp(Number(Packet,TEXT("radiusX"),10.0/FMath::Max(1,LastViewport.X)),.00001,.025),
        FMath::Clamp(Number(Packet,TEXT("radiusY"),10.0/FMath::Max(1,LastViewport.Y)),.00001,.05));
    FVector OriginPoint, Direction;
    TSharedPtr<FJsonObject> Selection;
    // Canvas symbols are drawn above scene geometry. Pick that same topmost
    // visible glyph before tracing hulls/underlying port collision volumes.
    if(AActor* Marker=WorldScene->HitChart(Pointer,Padding))Selection=WorldScene->GetSelection(Marker);
    const bool bChartHit=Selection.IsValid();
    const auto Surface=bChartHit?TOptional<FVector>():SurfacePoint(Pointer,false);
    if (!bChartHit&&WNTCameraMath::Ray(SceneCamera->View,Pointer,OriginPoint,Direction))
    {
        FHitResult Hit;
        FCollisionQueryParams Params(SCENE_QUERY_STAT(WNTScenePicking), true);
        // Land/water collision cannot follow material-based longitude shear.
        // Geographic picking above is analytic; ray traces inspect real hulls
        // and markers only, never a stale pre-shear terrain triangle.
        Params.AddIgnoredActor(WorldScene);Params.AddIgnoredActor(WorldScene->GetTerrain());
        const double Limit=Surface.IsSet()?FVector::Distance(Surface.GetValue(),OriginPoint)+10:1e11;
        if (GetWorld()->LineTraceSingleByChannel(Hit, OriginPoint, OriginPoint + Direction * Limit, ECC_Visibility, Params))
            Selection = WorldScene->GetSelection(Hit.GetActor());
    }
    if(!bChartHit&&(!Selection.IsValid()||String(Selection,TEXT("kind"))==TEXT("country")||String(Selection,TEXT("kind"))==TEXT("port")))
    {
        double Best=1.000001,BestCenter=TNumericLimits<double>::Max();FString BestKey;
        for(TActorIterator<AActor> It(GetWorld());It;++It)
        {
            const auto Candidate=WorldScene->GetSelection(*It);if(!Candidate.IsValid())continue;
            const FString Kind=String(Candidate,TEXT("kind"));
            if(Kind==TEXT("country")||Kind==TEXT("territory"))continue;
            const FBox2D Bounds=PickBounds(*It);if(!Bounds.bIsValid)continue;
            const double Distance=WNTSelectionGeometry::Distance(Bounds,Pointer,Padding);
            const double Center=(Bounds.GetCenter()-Pointer).SizeSquared();
            const FString Key=Kind+TEXT(":")+String(Candidate,TEXT("id"))+TEXT(":")+String(Candidate,TEXT("key"));
            if(Distance<=1 && (Distance<Best || (FMath::IsNearlyEqual(Distance,Best,1e-9) && (Center<BestCenter || (Center==BestCenter && Key<BestKey)))))
            {Selection=Candidate;Best=Distance;BestCenter=Center;BestKey=Key;}
        }
    }
    if(!Selection.IsValid()&&Surface.IsSet()&&Mode==TEXT("world")&&WorldScene->GetTerrain())
    {
        const auto Geo=WNTProjection::Inverse(Surface.GetValue(),Meridian);
        const FString Territory=Geo.IsSet()?WorldScene->GetTerrain()->TerritoryAt(Geo.GetValue()):FString();
        if(!Territory.IsEmpty())
        {
            Selection=MakeShared<FJsonObject>();Selection->SetStringField(TEXT("kind"),TEXT("territory"));
            Selection->SetStringField(TEXT("id"),Territory);Selection->SetStringField(TEXT("label"),Territory);
        }
    }
    auto Event = MakeShared<FJsonObject>(); Event->SetStringField(TEXT("type"), bHover ? TEXT("hover") : TEXT("select"));
    // The interface rejects hover replies superseded by camera or pointer input.
    // Echo on misses too, so a current empty pick can clear the previous tooltip.
    if (bHover) Event->SetNumberField(TEXT("requestId"), Number(Packet, TEXT("requestId")));
    Event->SetNumberField(TEXT("x"), Number(Packet, TEXT("x"))); Event->SetNumberField(TEXT("y"), Number(Packet, TEXT("y")));
    bool bZoom=false;Packet->TryGetBoolField(TEXT("zoom"),bZoom);Event->SetBoolField(TEXT("zoom"),bZoom);
    if(!Selection.IsValid()&&!bHover&&Mode==TEXT("world"))
    {
        Selection=MakeShared<FJsonObject>();Selection->SetStringField(TEXT("kind"),TEXT("fleet-group"));
        Selection->SetStringField(TEXT("id"),TEXT(""));Selection->SetArrayField(TEXT("ids"),TArray<TSharedPtr<FJsonValue>>());
    }
    if (Selection.IsValid()) Event->SetObjectField(TEXT("selection"), Selection);
    else Event->SetField(TEXT("selection"), MakeShared<FJsonValueNull>());
    Send(Event);
}

void AWNTPlayerController::RequestClose(const TSharedRef<SWindow>& RequestedWindow)
{
    if (bClosing) return;
    if (!Browser || bHostFailed) { RequestedWindow->SetRequestDestroyWindowOverride(FRequestDestroyWindowOverride()); bOwnsCloseOverride=false;RequestedWindow->RequestDestroyWindow(); return; }
    bClosing = true; CloseStarted = FPlatformTime::Seconds();
    Browser->ExecuteJavascript(TEXT("Promise.resolve().then(()=>{if(typeof globalThis.saveForDesktopClose!=='function')throw new Error('Save system is not ready');return globalThis.saveForDesktopClose();}).then(()=>ue.wnt.closeapproved(true)).catch(error=>{globalThis.WNTUnreal?.receive({type:'error',message:'Could not save before closing: '+error.message});ue.wnt.closeapproved(false);});"));
}

void AWNTPlayerController::CompleteClose(bool Saved)
{
    if (!bClosing) return;
    bClosing = false;
    if (Saved && Window.IsValid() && bOwnsCloseOverride)
    {
        Window.Pin()->SetRequestDestroyWindowOverride(FRequestDestroyWindowOverride());
        bOwnsCloseOverride=false;
        Window.Pin()->RequestDestroyWindow();
    }
}

void AWNTPlayerController::EndPlay(const EEndPlayReason::Type Reason)
{
    if (Window.IsValid() && bOwnsCloseOverride) Window.Pin()->SetRequestDestroyWindowOverride(FRequestDestroyWindowOverride());
    bOwnsCloseOverride=false;
    if (GetWorld() && GetWorld()->GetGameViewport() && Overlay) GetWorld()->GetGameViewport()->RemoveViewportWidgetContent(Overlay.ToSharedRef());
    if (Browser && Bridge) Browser->UnbindUObject(TEXT("wnt"), Bridge, true);
    Browser.Reset(); Overlay.Reset();
    FPlatformProcess::ClosePipe(HostInputRead, HostInputWrite); HostInputRead = HostInputWrite = nullptr;
    if (HostProcess.IsValid())
    {
        // EOF requests graceful HTTP shutdown; terminate only our own child if stuck.
        const double Deadline = FPlatformTime::Seconds() + 2;
        while (FPlatformProcess::IsProcRunning(HostProcess) && FPlatformTime::Seconds() < Deadline) FPlatformProcess::Sleep(.01f);
        if (FPlatformProcess::IsProcRunning(HostProcess)) FPlatformProcess::TerminateProc(HostProcess, true);
        FPlatformProcess::CloseProc(HostProcess);
    }
    FPlatformProcess::ClosePipe(HostRead, HostWrite); HostRead = HostWrite = nullptr;
    Super::EndPlay(Reason);
}
