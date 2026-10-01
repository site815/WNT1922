#pragma once
#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "HAL/PlatformProcess.h"
#include "Camera/CameraTypes.h"
#include "WNTPlayerController.generated.h"
class AWNTCameraActor;
class AWNTWorldActor;
class UWNTBrowserBridge;
class SWNTWebBrowser;
class SWindow;
class SWidget;
class FJsonObject;

namespace WNTCameraMath
{
    WNT1922_API void ConfigureProjection(FMinimalViewInfo& View, const FIntPoint& Pixels, const FVector4& ClearRect);
    WNT1922_API bool Ray(const FMinimalViewInfo& View, const FVector2D& Pointer, FVector& Origin, FVector& Direction);
    WNT1922_API TOptional<FVector2D> Project(const FMinimalViewInfo& View, const FVector& Point);
    WNT1922_API TOptional<FVector> PlaneHit(const FMinimalViewInfo& View, const FVector2D& Pointer, double Height);
    WNT1922_API void Orbit(FMinimalViewInfo& View, const FVector& Target, double Distance, double Tilt, double Yaw);
    WNT1922_API void EnsureClearance(FMinimalViewInfo& View, const FVector& Target, TFunctionRef<double(const FVector&)> SurfaceHeight);
    WNT1922_API FVector2D WrappedFocus(const FVector& MapPoint, double Meridian);
    WNT1922_API double MaxWorldTilt(double Zoom);
    constexpr double MaxWorldZoom = 65536.0;
    WNT1922_API bool NeedsOriginRebase(double Longitude, double Meridian);
}

UCLASS()
class WNT1922_API AWNTPlayerController : public APlayerController
{
    GENERATED_BODY()
public:
    AWNTPlayerController();
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaSeconds) override;
    virtual void EndPlay(const EEndPlayReason::Type Reason) override;
    void Receive(const FString& Kind, const FString& Json);
    void CompleteClose(bool Saved);
private:
    UPROPERTY() TObjectPtr<AWNTCameraActor> SceneCamera;
    UPROPERTY() TObjectPtr<AWNTWorldActor> WorldScene;
    UPROPERTY() TObjectPtr<UWNTBrowserBridge> Bridge;
    TSharedPtr<SWNTWebBrowser> Browser;
    TSharedPtr<SWidget> Overlay;
    TWeakPtr<SWindow> Window;
    FProcHandle HostProcess;
    void* HostRead = nullptr;
    void* HostWrite = nullptr;
    void* HostInputRead = nullptr;
    void* HostInputWrite = nullptr;
    FString HostOutput, Origin, DataRoot, Mode = TEXT("hidden"), InstanceId;
    FString LastBattleId;
    FVector2D FocusGeo = FVector2D::ZeroVector;
    FVector BattleTarget = FVector::ZeroVector;
    FVector4 ViewRect = FVector4(0, 0, 1, 1);
    double Zoom = 1, WorldZoom = 1, BattleZoom = 1;
    double TargetZoom = 1;
    FVector ZoomAnchor = FVector::ZeroVector;
    FVector2D ZoomPointer = FVector2D(.5,.5);
    double ZoomAnchorMeridian = 0;
    bool bHasZoomAnchor = false;
    double BattleYaw = -25, BattleTilt = 48, BattleDistance = 600000;
    TArray<double> FrameSamples;
    int32 FrameSampleCursor = 0;
    double Meridian = 0, HostStarted = 0, CloseStarted = 0;
    bool bClosing = false, bHostFailed = false, bCameraDirty = true;
    bool bOwnsCloseOverride = false;
    void StartHost();
    void OpenHUD();
    void Fail(const FString& Message);
    void Send(const TSharedPtr<FJsonObject>& Event);
    void SetMode(const FString& NewMode, const FString& NewInstance);
    FIntPoint LastViewport = FIntPoint::ZeroValue;
    void UpdateCamera(bool bNotify = true);
    TOptional<FVector> SurfacePoint(const FVector2D& Pointer, bool bIncludeActors) const;
    void MoveCameraTarget(const FVector& Offset);
    void AnchorPoint(const FVector& Point, const FVector2D& Pointer);
    void Input(const TSharedPtr<FJsonObject>& Packet);
    void Pick(const TSharedPtr<FJsonObject>& Packet, bool bHover);
    void FitBattle();
    void AutomationRequest(const TSharedPtr<FJsonObject>& Packet);
    void RequestClose(const TSharedRef<SWindow>& RequestedWindow);
};
