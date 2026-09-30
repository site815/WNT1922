#pragma once

#include "CoreMinimal.h"
#include "Engine/GameViewportClient.h"
#include "GameFramework/GameUserSettings.h"
#include "WNTWindowPolicy.generated.h"

namespace WNTWindowPolicy
{
    /** Physical client pixels; Windows frame and DPI scaling are additional. */
    WNT1922_API FIntPoint MinimumClientSize();
    WNT1922_API FIntPoint ClampClientSize(FIntPoint Requested);
    WNT1922_API FIntPoint MinimumTrackSize(FIntPoint FramePixels);
    WNT1922_API FIntPoint StartupClientSize(FIntPoint SavedSize, const TCHAR* CommandLine);
    /** Uses physical client/frame/work-area pixels; DPI must not be applied again. */
    WNT1922_API FIntRect StartupWindowRect(FIntPoint ClientSize, FIntPoint FramePixels, const FIntRect& WorkArea);
    WNT1922_API bool RequestWindowSize(UGameViewportClient* Client, FIntPoint Requested);
    WNT1922_API void ConfigureStartup();
}

/** Old fullscreen/small saved settings cannot override the window-only policy. */
UCLASS(Config=GameUserSettings)
class WNT1922_API UWNTGameUserSettings : public UGameUserSettings
{
    GENERATED_BODY()
public:
    virtual void SetToDefaults() override;
    virtual void LoadSettings(bool bForceReload=false) override;
    virtual void ValidateSettings() override;
private:
    void EnforceWindowPolicy();
};

struct FWNTNativeWindowState;
struct FWNTNativeWindowStateDeleter { void operator()(FWNTNativeWindowState* State) const; };

/** Keeps native resize/maximize behavior while forbidding fullscreen. */
UCLASS()
class WNT1922_API UWNTGameViewportClient : public UGameViewportClient
{
    GENERATED_BODY()
public:
    UWNTGameViewportClient();
    virtual ~UWNTGameViewportClient() override;
    virtual void Tick(float DeltaTime) override;
    virtual bool InputKey(const FInputKeyEventArgs& EventArgs) override;
protected:
    virtual bool Exec_Runtime(UWorld* InWorld, const TCHAR* Cmd, FOutputDevice& Ar) override;
private:
    TUniquePtr<FWNTNativeWindowState,FWNTNativeWindowStateDeleter> WindowState;
};
