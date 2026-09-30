#include "WNTWindowPolicy.h"

#include "Engine/Engine.h"
#include "Engine/World.h"
#include "Framework/Application/SlateApplication.h"
#include "GenericPlatform/GenericWindow.h"
#include "InputCoreTypes.h"
#include "Misc/App.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "Slate/SceneViewport.h"
#include "Widgets/SWindow.h"

#if PLATFORM_WINDOWS
#include "Windows/WindowsHWrapper.h"
#include "Windows/AllowWindowsPlatformTypes.h"
#include <CommCtrl.h>
#include "Windows/HideWindowsPlatformTypes.h"
#endif

DEFINE_LOG_CATEGORY_STATIC(LogWNTWindow, Log, All);

FIntPoint WNTWindowPolicy::MinimumClientSize() { return FIntPoint(1800,1000); }

FIntPoint WNTWindowPolicy::ClampClientSize(FIntPoint Requested)
{
    const FIntPoint Minimum=MinimumClientSize();
    return FIntPoint(FMath::Max(Minimum.X,Requested.X),FMath::Max(Minimum.Y,Requested.Y));
}

FIntPoint WNTWindowPolicy::MinimumTrackSize(FIntPoint FramePixels)
{
    return MinimumClientSize()+FIntPoint(FMath::Max(0,FramePixels.X),FMath::Max(0,FramePixels.Y));
}

FIntPoint WNTWindowPolicy::StartupClientSize(FIntPoint SavedSize,const TCHAR* CommandLine)
{
    FParse::Value(CommandLine,TEXT("ResX="),SavedSize.X);
    FParse::Value(CommandLine,TEXT("ResY="),SavedSize.Y);
    return ClampClientSize(SavedSize);
}

FIntRect WNTWindowPolicy::StartupWindowRect(FIntPoint ClientSize,FIntPoint FramePixels,const FIntRect& WorkArea)
{
    const FIntPoint Outer=ClampClientSize(ClientSize)+FIntPoint(FMath::Max(0,FramePixels.X),FMath::Max(0,FramePixels.Y));
    const FIntPoint Space=WorkArea.Size()-Outer;
    // On a smaller display preserve the required client size and put the title
    // bar at the work area's top; never shrink or center it above the screen.
    const FIntPoint Origin=WorkArea.Min+FIntPoint(FMath::Max(0,Space.X/2),FMath::Max(0,Space.Y/2));
    return FIntRect(Origin,Origin+Outer);
}

bool WNTWindowPolicy::RequestWindowSize(UGameViewportClient* Client,FIntPoint Requested)
{
    FSceneViewport* Viewport=Client?Client->GetGameViewport():nullptr;
    if(!Viewport)return false;
    const FIntPoint Size=ClampClientSize(Requested);
    if(GEngine)if(UGameUserSettings* Settings=GEngine->GetGameUserSettings())
    {
        Settings->SetScreenResolution(Size);
        Settings->SetFullscreenMode(EWindowMode::Windowed);
    }
    Viewport->ResizeFrame(Size.X,Size.Y,EWindowMode::Windowed);
    return true;
}

void WNTWindowPolicy::ConfigureStartup()
{
    if(!FApp::IsGame()||IsRunningCommandlet())return;
    // Windowed wins over -fullscreen in GameEngine. ForceRes prevents UE from
    // silently substituting a smaller convenient size on a small monitor.
    FCommandLine::Append(TEXT(" -windowed -ForceRes"));
}

void UWNTGameUserSettings::EnforceWindowPolicy()
{
    SetScreenResolution(WNTWindowPolicy::ClampClientSize(GetScreenResolution()));
    SetFullscreenMode(EWindowMode::Windowed);
    // Limit rendered frames; the campaign clock keeps its existing scheduling.
    SetFrameRateLimit(60.0f);
    SetVSyncEnabled(true);
    ConfirmVideoMode();
}
void UWNTGameUserSettings::SetToDefaults()
{
    Super::SetToDefaults();
    SetScreenResolution(WNTWindowPolicy::MinimumClientSize());
    UpdateVersion();
    EnforceWindowPolicy();
}
void UWNTGameUserSettings::LoadSettings(bool bForceReload)
{
    Super::LoadSettings(bForceReload);EnforceWindowPolicy();
}
void UWNTGameUserSettings::ValidateSettings()
{
    Super::ValidateSettings();EnforceWindowPolicy();
}

struct FWNTNativeWindowState
{
    TWeakPtr<SWindow> Window;
    bool bStartupSizeApplied=false;
#if PLATFORM_WINDOWS
    HWND Handle=nullptr;
    static constexpr UINT_PTR SubclassId=0x574e5431;

    static FIntPoint FramePixels(HWND NativeWindow)
    {
        RECT Frame{0,0,0,0};
        const DWORD Style=static_cast<DWORD>(GetWindowLongPtr(NativeWindow,GWL_STYLE));
        const DWORD ExtendedStyle=static_cast<DWORD>(GetWindowLongPtr(NativeWindow,GWL_EXSTYLE));
        const UINT Dpi=GetDpiForWindow(NativeWindow);
        AdjustWindowRectExForDpi(&Frame,Style,false,ExtendedStyle,Dpi?Dpi:96);
        return FIntPoint(Frame.right-Frame.left,Frame.bottom-Frame.top);
    }

    static LRESULT CALLBACK WindowProcedure(HWND NativeWindow,UINT Message,WPARAM WParam,LPARAM LParam,UINT_PTR Id,DWORD_PTR Data)
    {
        // Capture these even when the transparent browser owns keyboard focus.
        if((Message==WM_KEYDOWN||Message==WM_SYSKEYDOWN)
            &&(WParam==VK_F11||(WParam==VK_RETURN&&(GetKeyState(VK_MENU)&0x8000))))return 0;
        const LRESULT Result=DefSubclassProc(NativeWindow,Message,WParam,LParam);
        if(Message==WM_GETMINMAXINFO)
        {
            // Run after UE's handler: its Slate limits are DPI-scaled and do
            // not add the native frame to minimum tracking sizes. This limit
            // is exactly 1800x1000 client pixels on every DPI/monitor.
            const FIntPoint Minimum=WNTWindowPolicy::MinimumTrackSize(FramePixels(NativeWindow));
            auto* Limits=reinterpret_cast<MINMAXINFO*>(LParam);
            Limits->ptMinTrackSize.x=Minimum.X;Limits->ptMinTrackSize.y=Minimum.Y;
            Limits->ptMaxTrackSize.x=FMath::Max<LONG>(Limits->ptMaxTrackSize.x,Minimum.X);
            Limits->ptMaxTrackSize.y=FMath::Max<LONG>(Limits->ptMaxTrackSize.y,Minimum.Y);
            Limits->ptMaxSize.x=FMath::Max<LONG>(Limits->ptMaxSize.x,Minimum.X);
            Limits->ptMaxSize.y=FMath::Max<LONG>(Limits->ptMaxSize.y,Minimum.Y);
        }
        return Result;
    }

    ~FWNTNativeWindowState()
    {
        if(Handle&&IsWindow(Handle))RemoveWindowSubclass(Handle,WindowProcedure,SubclassId);
    }

    bool ApplyPhysicalStartupSize(FIntPoint ClientSize)
    {
        if(!Handle||!IsWindow(Handle))return false;
        MONITORINFO Monitor{sizeof(MONITORINFO)};
        if(!GetMonitorInfo(MonitorFromWindow(Handle,MONITOR_DEFAULTTONEAREST),&Monitor))return false;
        const FIntRect WorkArea(Monitor.rcWork.left,Monitor.rcWork.top,Monitor.rcWork.right,Monitor.rcWork.bottom);
        const FIntRect Rect=WNTWindowPolicy::StartupWindowRect(ClientSize,FramePixels(Handle),WorkArea);
        if(!SetWindowPos(Handle,nullptr,Rect.Min.X,Rect.Min.Y,Rect.Width(),Rect.Height(),SWP_NOZORDER|SWP_NOACTIVATE))return false;
        RECT Actual{};
        return GetClientRect(Handle,&Actual)&&Actual.right-Actual.left==ClientSize.X&&Actual.bottom-Actual.top==ClientSize.Y;
    }
#endif

    void Bind(const TSharedPtr<SWindow>& NewWindow)
    {
        if(Window.Pin()==NewWindow||!NewWindow.IsValid())return;
#if PLATFORM_WINDOWS
        if(Handle&&IsWindow(Handle))RemoveWindowSubclass(Handle,WindowProcedure,SubclassId);
        Handle=NewWindow->GetNativeWindow().IsValid()?static_cast<HWND>(NewWindow->GetNativeWindow()->GetOSWindowHandle()):nullptr;
        if(!Handle)return;
        if(!SetWindowSubclass(Handle,WindowProcedure,SubclassId,0))
        {
            UE_LOG(LogWNTWindow,Error,TEXT("Could not install the native 1800x1000 window minimum."));return;
        }
        // The Win32 subclass owns physical limits, avoiding double DPI scaling.
        NewWindow->SetSizeLimits(FWindowSizeLimits());
        MONITORINFO Monitor{sizeof(MONITORINFO)};
        if(GetMonitorInfo(MonitorFromWindow(Handle,MONITOR_DEFAULTTONEAREST),&Monitor))
        {
            const FIntPoint Minimum=WNTWindowPolicy::MinimumTrackSize(FramePixels(Handle));
            if(Monitor.rcWork.right-Monitor.rcWork.left<Minimum.X||Monitor.rcWork.bottom-Monitor.rcWork.top<Minimum.Y)
                UE_LOG(LogWNTWindow,Warning,TEXT("This monitor's work area cannot fit the required 1800x1000 client area plus window frame. The minimum is preserved; use a larger display or desktop resolution."));
        }
#else
        NewWindow->SetSizeLimits(FWindowSizeLimits().SetMinWidth(1800).SetMinHeight(1000));
#endif
        NewWindow->SetSizingRule(ESizingRule::UserSized);
        bStartupSizeApplied=false;
        Window=NewWindow;
    }
};

void FWNTNativeWindowStateDeleter::operator()(FWNTNativeWindowState* State) const { delete State; }
UWNTGameViewportClient::UWNTGameViewportClient() : WindowState(new FWNTNativeWindowState()) {}
UWNTGameViewportClient::~UWNTGameViewportClient()=default;

void UWNTGameViewportClient::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
    // Do not resize the Unreal Editor's embedded Play-in-Editor window.
    if(GetWorld()&&GetWorld()->WorldType==EWorldType::PIE)return;
    const TSharedPtr<SWindow> NativeWindow=GetWindow();
    if(!NativeWindow.IsValid()||!NativeWindow->GetNativeWindow().IsValid())return;
    // UE's offscreen FNullWindow always reports Fullscreen and ignores mode
    // changes. Do not resize that virtual window every frame trying to fix it.
    const bool Offscreen=FSlateApplication::Get().IsRenderingOffScreen();
    if(!Offscreen)WindowState->Bind(NativeWindow);
    if(NativeWindow->IsWindowMinimized())return;
    if(!Offscreen&&WindowState->Window.Pin()==NativeWindow&&!WindowState->bStartupSizeApplied)
    {
        FIntPoint SavedSize=WNTWindowPolicy::MinimumClientSize();
        if(GEngine)if(const UGameUserSettings* Settings=GEngine->GetGameUserSettings())SavedSize=Settings->GetScreenResolution();
        const FIntPoint StartupSize=WNTWindowPolicy::StartupClientSize(SavedSize,FCommandLine::Get());
        // Engine window creation can apply DPI-scaled Slate minima before our
        // native subclass exists. Reconcile the first real HWND once, even if
        // its incorrectly enlarged client already exceeds the minimum.
        WNTWindowPolicy::RequestWindowSize(this,StartupSize);
#if PLATFORM_WINDOWS
        WindowState->bStartupSizeApplied=WindowState->ApplyPhysicalStartupSize(StartupSize);
#else
        WindowState->bStartupSizeApplied=true;
#endif
        return;
    }
    const FIntPoint Size=Viewport?Viewport->GetSizeXY():FIntPoint::ZeroValue;
    if(Size.X>0&&Size.Y>0&&(Size!=WNTWindowPolicy::ClampClientSize(Size)
        ||(!Offscreen&&(NativeWindow->GetWindowMode()!=EWindowMode::Windowed||Viewport->GetWindowMode()!=EWindowMode::Windowed))))
        WNTWindowPolicy::RequestWindowSize(this,Size);
}

bool UWNTGameViewportClient::InputKey(const FInputKeyEventArgs& EventArgs)
{
    if(EventArgs.Key==EKeys::F11||(EventArgs.Key==EKeys::Enter&&FSlateApplication::IsInitialized()
        &&FSlateApplication::Get().GetModifierKeys().IsAltDown()))return true;
    return Super::InputKey(EventArgs);
}

bool UWNTGameViewportClient::Exec_Runtime(UWorld* InWorld,const TCHAR* Cmd,FOutputDevice& Ar)
{
    if(FParse::Command(&Cmd,TEXT("FULLSCREEN"))||FParse::Command(&Cmd,TEXT("TOGGLEFULLSCREEN"))
        ||FParse::Command(&Cmd,TEXT("FORCEFULLSCREEN"))||FParse::Command(&Cmd,TEXT("SETRES")))
    {
        Ar.Log(TEXT("WNT1922 is windowed only. Resize or maximize its window; minimum client area is 1800x1000."));return true;
    }
    return Super::Exec_Runtime(InWorld,Cmd,Ar);
}
