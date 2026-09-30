#if WITH_DEV_AUTOMATION_TESTS
#include "WNTWindowPolicy.h"
#include "Misc/AutomationTest.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTWindowPolicyTest,"WNT.Window.ClientSizeAndSavedMode",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTWindowPolicyTest::RunTest(const FString& Parameters)
{
    const FIntPoint Minimum(1800,1000);
    TestEqual(TEXT("Default client is 1800x1000 physical pixels"),WNTWindowPolicy::MinimumClientSize(),Minimum);
    for(const FIntPoint Invalid : {FIntPoint::ZeroValue,FIntPoint(1366,768),FIntPoint(-1,-1),FIntPoint(1800,900)})
        TestEqual(TEXT("Small or invalid requests retain the required minimum"),WNTWindowPolicy::ClampClientSize(Invalid),Minimum);
    TestEqual(TEXT("Resizing wider does not force a fixed aspect ratio"),WNTWindowPolicy::ClampClientSize(FIntPoint(2400,900)),FIntPoint(2400,1000));
    TestEqual(TEXT("Large or maximized client dimensions are preserved"),WNTWindowPolicy::ClampClientSize(FIntPoint(3840,2160)),FIntPoint(3840,2160));
    for(const FIntPoint PhysicalFrame : {FIntPoint(16,39),FIntPoint(24,59),FIntPoint(32,78)})
        TestEqual(TEXT("DPI-scaled frame is added once outside the client minimum"),WNTWindowPolicy::MinimumTrackSize(PhysicalFrame)-PhysicalFrame,Minimum);
    TestEqual(TEXT("Default startup ignores an enlarged native HWND and uses settings"),WNTWindowPolicy::StartupClientSize(Minimum,TEXT("")),Minimum);
    TestEqual(TEXT("Explicit large physical test size is retained"),WNTWindowPolicy::StartupClientSize(Minimum,TEXT("-ResX=2560 -ResY=1440")),FIntPoint(2560,1440));
    TestEqual(TEXT("Partial startup override retains the other saved dimension"),WNTWindowPolicy::StartupClientSize(FIntPoint(2000,1200),TEXT("-ResX=2400")),FIntPoint(2400,1200));
    TestEqual(TEXT("Undersized startup overrides cannot defeat the minimum"),WNTWindowPolicy::StartupClientSize(Minimum,TEXT("-ResX=1280 -ResY=720")),Minimum);
    // Regression: the reported 200%-DPI work area is 3840x1504, with a 26x71
    // physical frame. The old initial Slate limit created a 3600x2000 outer
    // window and the minimum-only tick never corrected it.
    const FIntPoint Frame200(26,71);
    const FIntRect Startup200=WNTWindowPolicy::StartupWindowRect(Minimum,Frame200,FIntRect(0,0,3840,1504));
    TestEqual(TEXT("200% DPI startup outer size adds one physical frame"),Startup200.Size(),FIntPoint(1826,1071));
    TestEqual(TEXT("200% DPI startup centers the entire frame inside the work area"),Startup200.Min,FIntPoint(1007,216));
    TestEqual(TEXT("200% DPI startup keeps the exact physical client"),Startup200.Size()-Frame200,Minimum);
    const FIntRect SmallDisplay=WNTWindowPolicy::StartupWindowRect(Minimum,Frame200,FIntRect(0,0,1920,800));
    TestEqual(TEXT("An undersized display keeps the title bar on-screen"),SmallDisplay.Min,FIntPoint(47,0));
    TestEqual(TEXT("An undersized display preserves the required client"),SmallDisplay.Size()-Frame200,Minimum);
    const FIntRect LeftMonitor=WNTWindowPolicy::StartupWindowRect(Minimum,FIntPoint(16,39),FIntRect(-2560,-100,0,1340));
    TestEqual(TEXT("Negative monitor coordinates preserve physical placement"),LeftMonitor.Min,FIntPoint(-2188,100));
    UWNTGameUserSettings* Settings=NewObject<UWNTGameUserSettings>();
    Settings->SetToDefaults();
    TestEqual(TEXT("New settings use required default size"),Settings->GetScreenResolution(),Minimum);
    TestEqual(TEXT("New settings are decorated windowed mode"),Settings->GetFullscreenMode(),EWindowMode::Windowed);
    TestEqual(TEXT("Rendering defaults to a 60 FPS limit"),Settings->GetFrameRateLimit(),60.0f);
    TestTrue(TEXT("VSync is enabled by default"),Settings->IsVSyncEnabled());
    // ConfirmVideoMode plus ValidateSettings exercises a valid saved fullscreen
    // state without deleting/resetting the user's existing settings file.
    Settings->SetScreenResolution(FIntPoint(1280,720));Settings->SetFullscreenMode(EWindowMode::Fullscreen);
    Settings->SetFrameRateLimit(0.0f);Settings->SetVSyncEnabled(false);
    Settings->ConfirmVideoMode();Settings->ValidateSettings();
    TestEqual(TEXT("Old small saved resolution is clamped"),Settings->GetScreenResolution(),Minimum);
    TestEqual(TEXT("Saved exclusive fullscreen is rejected"),Settings->GetFullscreenMode(),EWindowMode::Windowed);
    TestEqual(TEXT("Old uncapped rendering settings use a 60 FPS limit"),Settings->GetFrameRateLimit(),60.0f);
    TestTrue(TEXT("Old settings retain VSync"),Settings->IsVSyncEnabled());
    Settings->SetScreenResolution(FIntPoint(2560,1440));Settings->SetFullscreenMode(EWindowMode::WindowedFullscreen);Settings->ValidateSettings();
    TestEqual(TEXT("A user's larger resolution is retained"),Settings->GetScreenResolution(),FIntPoint(2560,1440));
    TestEqual(TEXT("Saved borderless fullscreen is rejected"),Settings->GetFullscreenMode(),EWindowMode::Windowed);
    return true;
}
#endif
