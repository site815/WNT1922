#pragma once
#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "HAL/PlatformProcess.h"
#include "Camera/CameraTypes.h"
#include "WNTBattleCameraDirector.h"
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
    WNT1922_API double WorldViewDistance();
    constexpr double BattleOverviewTilt = 25.0;
    constexpr double BattleOverviewYaw = 0.0;
    constexpr double BattleFocusZoom = 3.0;
    WNT1922_API double BattleFocusDistance(double Aspect);
    WNT1922_API double BattleFitDistance(const FBox& Bounds, const FIntPoint& Pixels, const FVector4& ClearRect);
    WNT1922_API double BattleMarkerPixels(double HullLength, double CameraDepth, double HorizontalFOV, const FIntPoint& Pixels);
    WNT1922_API double ConstrainWorldNorthing(const FMinimalViewInfo& View, const FVector4& ClearRect, double Northing);
    constexpr double MaxWorldZoom = 65536.0;
    constexpr double WorldOrbitZoom = 32768.0;
    constexpr double WorldEdgeMargin = .03;
    // A physical wheel notch is normally 120 CSS pixels in CEF. Sixteen
    // notches traverse the complete 2^16 strategic-to-hull range.
    constexpr double WorldZoomPerPixel = 0.005776226504666211;
    constexpr double BattleZoomPerPixel = .0015;
    WNT1922_API double WheelZoom(double CurrentTarget, double Delta, bool bBattle);
    WNT1922_API double SmoothZoom(double Current, double Target, double DeltaSeconds);
    WNT1922_API bool CanOrbitWorld(double Zoom);
    struct WNT1922_API FWorldOrbit
    {
        double Tilt = 0.0, Yaw = 0.0;
        void Reset();
        bool Drag(double Zoom, double DeltaX, double DeltaY);
        void ZoomInput(double Delta);
        FVector2D Angles(double Zoom);
    };
    struct WNT1922_API FFrameRateSampler
    {
        double WindowStart = -1;
        int32 Frames = 0;
        TOptional<double> Observe(double Now);
    };
    struct WNT1922_API FAnchorProgress
    {
        double PreviousError = TNumericLimits<double>::Max();
        FVector PreviousFocus = FVector::ZeroVector;
        bool bObserved = false;
        bool Stalled(double PixelError, const FVector& ConstrainedFocus);
    };
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
#if WITH_DEV_AUTOMATION_TESTS
    friend class FWNTCameraNotificationTest;
    TFunction<void(const TSharedPtr<FJsonObject>&)> AutomationEventObserver;
#endif
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
    WNTCameraMath::FWorldOrbit WorldOrbit;
    WNTCameraMath::FFrameRateSampler FrameRate;
    FWNTBattleCameraDirector BattleDirector;
    double LastDirectorNotification = 0;
    int32 CinematicCutCount = 0;
    TArray<double> FrameSamples;
    int32 FrameSampleCursor = 0;
    int32 LastAnchorIterations = 0;
    int32 LastAnchorRebases = 0;
    bool bLastAnchorConstrained = false;
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
    FBox2D PickBounds(AActor* Actor) const;
    void SelectBox(const TSharedPtr<FJsonObject>& Packet);
    void FitBattle();
    void AutomationRequest(const TSharedPtr<FJsonObject>& Packet);
    void RequestClose(const TSharedRef<SWindow>& RequestedWindow);
};
