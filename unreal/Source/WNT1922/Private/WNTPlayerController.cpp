#include "WNTPlayerController.h"
#include "WNTBrowserBridge.h"
#include "WNTCameraActor.h"
#include "WNTWorldActor.h"
#include "WNTTerrainActor.h"
#include "WNTShipActor.h"
#include "ProceduralMeshComponent.h"
#include "EngineUtils.h"
#include "UnrealClient.h"
#include "WNTProjection.h"
#include "Camera/PlayerCameraManager.h"
#include "Engine/GameViewportClient.h"
#include "Engine/World.h"
#include "Framework/Application/SlateApplication.h"
#include "SWebBrowser.h"
#include "WebBrowserModule.h"
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
                if (Candidate.StartsWith(TEXT("http://127.0.0.1:")))
                {
                    const FString Port = Candidate.Mid(17);
                    if (Port.IsNumeric() && FCString::Atoi(*Port) > 0 && FCString::Atoi(*Port) <= 65535)
                    { Origin = Candidate; UE_LOG(LogTemp, Display, TEXT("WNT campaign service ready at %s"), *Origin); OpenHUD(); break; }
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
    if (SceneCamera && bCameraDirty) UpdateCamera();
}

void AWNTPlayerController::OpenHUD()
{
    if (!GetWorld()->GetGameViewport()) { Fail(TEXT("The game viewport is not available for the campaign interface.")); return; }
    UE_LOG(LogTemp, Display, TEXT("WNT opening the native browser interface."));
    // UE 5.8's Slate browser assumes the UMG browser plugin has loaded this
    // module. Our direct Slate integration must initialize it explicitly.
    if (!IWebBrowserModule::Get().IsWebModuleAvailable())
    {
        Fail(TEXT("Unreal's Chromium runtime is unavailable. Verify the engine installation and native package browser files."));
        return;
    }
    Window = GetWorld()->GetGameViewport()->GetWindow();
    SAssignNew(Browser, SWebBrowser)
        .InitialURL(TEXT("about:blank"))
        .SupportsTransparency(true)
        .BackgroundColor(FColor::Transparent)
        .ShowControls(false).ShowAddressBar(false).ShowInitialThrobber(false)
        .BrowserFrameRate(60)
        .OnLoadError_Lambda([this]() { Fail(TEXT("The local campaign interface could not load. Close the test game and inspect its launch log.")); })
        .OnBeforeNavigation_Lambda([this](const FString& URL, const FWebNavigationRequest&)
        {
            // A permanent UObject binding must never reach a remote page.
            if (URL == TEXT("about:blank") || URL.StartsWith(Origin + TEXT("/"))) return false;
            if (URL.StartsWith(TEXT("https://"))) FPlatformProcess::LaunchURL(*URL, nullptr, nullptr);
            return true;
        })
        .OnBeforePopup_Lambda([this](FString URL, FString)
        {
            if (URL.StartsWith(TEXT("https://")) || URL.StartsWith(Origin + TEXT("/"))) FPlatformProcess::LaunchURL(*URL, nullptr, nullptr);
            return true;
        });
    Browser->BindUObject(TEXT("wnt"), Bridge, true);
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
    WorldScene->SetSceneMode(Mode); bCameraDirty = true;
}

void AWNTPlayerController::UpdateCamera(bool bNotify)
{
    int32 Width, Height; GetViewportSize(Width, Height);
    if (!SceneCamera || !WorldScene || Width <= 0 || Height <= 0) return;
    bCameraDirty = false;LastViewport=FIntPoint(Width,Height);
    const bool Battle = Mode == TEXT("battle");
    const double Distance = (Battle ? BattleDistance : 3.2e9) / Zoom;
    const double Angle = Battle ? BattleTilt : Tilt;
    FVector Target = BattleTarget;
    if (!Battle)
    {
        const double HeightMetres = WorldScene->GetTerrain() ? WorldScene->GetTerrain()->RenderHeightAt(FocusGeo) : 0;
        Target = WNTProjection::Forward(FocusGeo, Meridian, FMath::Max(0., HeightMetres));
    }
    WNTCameraMath::ConfigureProjection(SceneCamera->View,LastViewport,ViewRect);
    WNTCameraMath::Orbit(SceneCamera->View,Target,Distance,Angle,Battle?BattleYaw:0);
    WNTCameraMath::EnsureClearance(SceneCamera->View,Target,[&](const FVector& Point)
    {
        if(Battle||!WorldScene->GetTerrain())return 0.0;
        const auto Geo=WNTProjection::Inverse(Point,Meridian);
        return Geo.IsSet()?WorldScene->GetTerrain()->RenderHeightAt(Geo.GetValue())*100.0:0.0;
    });
    if(!bNotify)return;
    auto Event = MakeShared<FJsonObject>(); Event->SetStringField(TEXT("type"), TEXT("camera"));
    Event->SetNumberField(TEXT("zoom"), Zoom); Event->SetNumberField(TEXT("longitude"), FocusGeo.X);
    Event->SetNumberField(TEXT("latitude"), FocusGeo.Y); Event->SetNumberField(TEXT("tilt"), SceneCamera->View.Rotation.Pitch+90);
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
    // Reprojection is deliberately infrequent: ordinary drag translates the
    // camera over unchanged local mesh buffers; only the edge moves the seam.
    if(FMath::Abs(WNTProjection::WrapLongitude(FocusGeo.X-Meridian))>135)
    {Meridian=FocusGeo.X;WorldScene->SetCentralMeridian(Meridian);}
}

void AWNTPlayerController::AnchorPoint(const FVector& Original,const FVector2D& Pointer)
{
    const bool Battle=Mode==TEXT("battle");
    const FVector2D Geo=Battle?FVector2D::ZeroVector:WNTCameraMath::WrappedFocus(Original,Meridian);
    for(int32 I=0;I<12;++I)
    {
        UpdateCamera(false);
        const FVector Anchor=Battle?Original:WNTProjection::Forward(Geo,Meridian,Original.Z/100.0);
        const auto Current=WNTCameraMath::PlaneHit(SceneCamera->View,Pointer,Anchor.Z);
        if(!Current.IsSet())break;
        const auto Screen=WNTCameraMath::Project(SceneCamera->View,Anchor);
        if(Screen.IsSet()&&FMath::Abs(Screen->X-Pointer.X)*LastViewport.X<.15&&FMath::Abs(Screen->Y-Pointer.Y)*LastViewport.Y<.15)break;
        MoveCameraTarget(Anchor-Current.GetValue());
    }
    bCameraDirty=true;
}

void AWNTPlayerController::FitBattle()
{
    const FBox Bounds = WorldScene->GetSceneBounds();
    if (Bounds.IsValid)
    {
        BattleTarget = Bounds.GetCenter();
        // Bounding sphere fit accounts for portrait and wide battle windows.
        int32 Width, Height; GetViewportSize(Width, Height);
        const double Aspect = FMath::Max(.15, Width * ViewRect.Z / FMath::Max(1., Height * ViewRect.W));
        const double HalfAngle = FMath::Atan(FMath::Tan(FMath::DegreesToRadians(22.5)) * FMath::Min(1., Aspect));
        BattleDistance = FMath::Max(35000., Bounds.GetExtent().Size() / FMath::Sin(HalfAngle) * 1.2);
    }
    BattleZoom = 1; if (Mode == TEXT("battle")) Zoom = 1;
    bCameraDirty = true;
}

void AWNTPlayerController::Input(const TSharedPtr<FJsonObject>& Packet)
{
    if (FParse::Param(FCommandLine::Get(), TEXT("WNTAutomation")) &&
        (String(Packet, TEXT("action")) == TEXT("diagnostics") || String(Packet, TEXT("action")) == TEXT("capture")))
    { AutomationRequest(Packet); return; }
    if (String(Packet, TEXT("instanceId")) != InstanceId || Mode==TEXT("hidden") || !SceneCamera) return;
    const FString Action = String(Packet, TEXT("action"));
    const bool Battle = Mode == TEXT("battle");
    if (Action == TEXT("pick") || Action == TEXT("hover")) { Pick(Packet, Action == TEXT("hover")); return; }
    if(bCameraDirty)UpdateCamera(false);
    const FVector2D Pointer(FMath::Clamp(Number(Packet,TEXT("x"),ViewRect.X+ViewRect.Z*.5),0.0,1.0),FMath::Clamp(Number(Packet,TEXT("y"),ViewRect.Y+ViewRect.W*.5),0.0,1.0));
    const FVector2D Previous(Number(Packet,TEXT("previousX"),Pointer.X-Number(Packet,TEXT("dx"))/FMath::Max(1,LastViewport.X)),Number(Packet,TEXT("previousY"),Pointer.Y-Number(Packet,TEXT("dy"))/FMath::Max(1,LastViewport.Y)));
    TOptional<FVector> Anchor;
    if(Action==TEXT("zoom")||Action==TEXT("pan")||Action==TEXT("tilt"))Anchor=SurfacePoint(Action==TEXT("zoom")?Pointer:Previous,true);
    if (Action == TEXT("zoom")) Zoom = FMath::Clamp(Zoom * FMath::Exp(-Number(Packet, TEXT("delta")) * .0015), Battle ? .1 : 1., Battle ? 1000. : 1000000.);
    else if (Action == TEXT("tilt"))
    {
        if (Battle) { BattleTilt = FMath::Clamp(BattleTilt + Number(Packet, TEXT("dy")) * .25, 10., 85.); BattleYaw -= Number(Packet, TEXT("dx")) * .3; }
        else Tilt = FMath::Clamp(Tilt + Number(Packet, TEXT("dy")) * .25, 0., 70.);
    }
    else if (Action == TEXT("pan"))
    {
        // The captured surface point is moved to the current pointer below.
        // Ray/plane intersection naturally includes perspective foreshortening.
    }
    else if (Action == TEXT("home"))
    {
        if (Battle) FitBattle();
        else { Zoom = 1; Tilt = 0; FocusGeo = FVector2D::ZeroVector; Meridian = 0; WorldScene->SetCentralMeridian(0); }
    }
    else if (Action == TEXT("focus"))
    {
        if (Battle)
        {
            const auto Position = WorldScene->GetSelectedPosition(TEXT("battle-ship"), String(Packet, TEXT("id")), int32(Number(Packet, TEXT("hullIndex"))),String(Packet,TEXT("side")));
            if (Position.IsSet()) { BattleTarget = Position.GetValue(); Zoom = FMath::Max(Zoom, 3.); }
        }
        else
        {
            FocusGeo = FVector2D(WNTProjection::WrapLongitude(Number(Packet, TEXT("longitude"))), FMath::Clamp(Number(Packet, TEXT("latitude")), -89.9, 89.9));
            Meridian = FocusGeo.X; WorldScene->SetCentralMeridian(Meridian);
            Zoom = FMath::Clamp(Number(Packet, TEXT("zoom"), 6000), 1., 1000000.);
        }
    }
    if(Anchor.IsSet())AnchorPoint(Anchor.GetValue(),Pointer);
    bCameraDirty = true;
}

void AWNTPlayerController::AutomationRequest(const TSharedPtr<FJsonObject>& Packet)
{
#if !UE_BUILD_SHIPPING
    // Opt-in local test instrumentation; no console execution or arbitrary paths.
    if (!FParse::Param(FCommandLine::Get(), TEXT("WNTAutomation")) || !WorldScene || !SceneCamera) return;
    if (String(Packet, TEXT("action")) == TEXT("capture"))
    {
        const FString Name = String(Packet, TEXT("name"));
        if (Name.IsEmpty() || Name.Len() > 80) return;
        for (TCHAR CodePoint : Name) if (!FChar::IsAlnum(CodePoint) && CodePoint != TEXT('-') && CodePoint != TEXT('_')) return;
        const FString Path = FPaths::Combine(FPaths::ProjectSavedDir(), TEXT("Screenshots"), Name + TEXT(".png"));
        bool bIncludeUI = false; Packet->TryGetBoolField(TEXT("includeUI"), bIncludeUI);
        FScreenshotRequest::RequestScreenshot(Path, bIncludeUI, false);
        return;
    }
    if (bCameraDirty) UpdateCamera(false);
    auto Event = MakeShared<FJsonObject>();
    Event->SetStringField(TEXT("type"), TEXT("diagnostics"));
    Event->SetStringField(TEXT("mode"), Mode);
    Event->SetBoolField(TEXT("nativeWorldInitialized"), WorldScene->GetLoadError().IsEmpty());
    Event->SetStringField(TEXT("renderer"), TEXT("Unreal Engine native UWorld"));
    Event->SetNumberField(TEXT("zoom"), Zoom);
    Event->SetNumberField(TEXT("tilt"), SceneCamera->View.Rotation.Pitch + 90);
    Event->SetNumberField(TEXT("yaw"), SceneCamera->View.Rotation.Yaw);
    Event->SetNumberField(TEXT("longitude"), FocusGeo.X); Event->SetNumberField(TEXT("latitude"), FocusGeo.Y);
    int32 Ships = 0, VisibleShips = 0, DetailedModels = 0, VisibleDetailedModels = 0, PendingModels = 0, ModelErrors = 0;
    for (TActorIterator<AWNTShipActor> It(GetWorld()); It; ++It)
    {
        ++Ships;
        if (!It->IsHidden()) ++VisibleShips;
        if (It->HasRenderableModel()) ++DetailedModels;
        if (It->IsDetailedModelVisible()) ++VisibleDetailedModels;
        if (It->IsModelPending()) ++PendingModels;
        if (It->HasModelLoadError()) ++ModelErrors;
    }
    Event->SetNumberField(TEXT("shipActorCount"), Ships);
    Event->SetNumberField(TEXT("visibleShipCount"), VisibleShips);
    Event->SetNumberField(TEXT("detailedModelCount"), DetailedModels);
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
        const TArray<FVector> Candidates{Bounds.GetCenter(), Position + FVector(0, 0, 500), Position + FVector(0, 0, 1200)};
        for (const FVector& Candidate : Candidates)
        {
            const auto Screen = WNTCameraMath::Project(SceneCamera->View, Candidate);
            if (!Screen.IsSet() || Screen->X < ViewRect.X || Screen->Y < ViewRect.Y || Screen->X > ViewRect.X + ViewRect.Z || Screen->Y > ViewRect.Y + ViewRect.W) continue;
            FVector Start, Direction; WNTCameraMath::Ray(SceneCamera->View, Screen.GetValue(), Start, Direction);
            FHitResult Hit; FCollisionQueryParams Params(SCENE_QUERY_STAT(WNTAutomationPicking), true);
            if (!GetWorld()->LineTraceSingleByChannel(Hit, Start, Start + Direction * 1e11, ECC_Visibility, Params) || Hit.GetActor() != *It) continue;
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
#endif
}

void AWNTPlayerController::Pick(const TSharedPtr<FJsonObject>& Packet, bool bHover)
{
    if(!SceneCamera||Mode==TEXT("hidden"))return;if(bCameraDirty)UpdateCamera(false);
    const FVector2D Pointer(FMath::Clamp(Number(Packet,TEXT("x")),0.0,1.0),FMath::Clamp(Number(Packet,TEXT("y")),0.0,1.0));
    FVector OriginPoint, Direction;
    TSharedPtr<FJsonObject> Selection;
    const auto Surface=SurfacePoint(Pointer,false);
    if (WNTCameraMath::Ray(SceneCamera->View,Pointer,OriginPoint,Direction))
    {
        FHitResult Hit;
        FCollisionQueryParams Params(SCENE_QUERY_STAT(WNTScenePicking), true);
        const double Limit=Surface.IsSet()?FVector::Distance(Surface.GetValue(),OriginPoint)+10:1e11;
        if (GetWorld()->LineTraceSingleByChannel(Hit, OriginPoint, OriginPoint + Direction * Limit, ECC_Visibility, Params))
            Selection = WorldScene->GetSelection(Hit.GetActor());
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
    Event->SetNumberField(TEXT("x"), Number(Packet, TEXT("x"))); Event->SetNumberField(TEXT("y"), Number(Packet, TEXT("y")));
    bool bZoom=false;Packet->TryGetBoolField(TEXT("zoom"),bZoom);Event->SetBoolField(TEXT("zoom"),bZoom);
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
