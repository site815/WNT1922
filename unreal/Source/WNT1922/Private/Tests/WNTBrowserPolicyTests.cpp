#if WITH_DEV_AUTOMATION_TESTS
#include "WNTBrowserPolicy.h"
#include "Misc/AutomationTest.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FWNTBrowserPolicyTest,"WNT.Browser.OfflineOriginPolicy",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FWNTBrowserPolicyTest::RunTest(const FString& Parameters)
{
    const FString Origin(TEXT("http://127.0.0.1:43127"));
    TestTrue(TEXT("Owned loopback origin"), WNTBrowserPolicy::IsLocalOrigin(Origin));
    for (const FString URL : {Origin + TEXT("/?unreal=1"), Origin + TEXT("/api/save"), Origin + TEXT("/assets/models/ships/a.glb")})
        TestTrue(*FString::Printf(TEXT("Local resource %s"), *URL), WNTBrowserPolicy::AllowsResource(URL, Origin));
    for (const FString URL : {TEXT("https://example.com/a"), TEXT("http://192.168.1.3/a"), TEXT("http://127.0.0.1:43128/a"),
        TEXT("http://127.0.0.1:43127.example.com/a"), TEXT("http://127.0.0.1:43127@evil.test/a"), TEXT("http://localhost:43127/a"),
        TEXT("file:///C:/secret"), TEXT("javascript:alert(1)"), TEXT("http://127.0.0.1:43127/\\evil.test/a")})
        TestFalse(*FString::Printf(TEXT("Reject remote, alternate port or spoofed URL %s"), *URL), WNTBrowserPolicy::AllowsResource(URL, Origin));
    TestFalse(TEXT("Unvalidated service origin denied"), WNTBrowserPolicy::AllowsResource(TEXT("http://127.0.0.1:0/a"), TEXT("http://127.0.0.1:0")));
    TestTrue(TEXT("Local object URL allowed"), WNTBrowserPolicy::AllowsResource(TEXT("blob:") + Origin + TEXT("/save-id"), Origin));
    TestFalse(TEXT("Remote object URL denied"), WNTBrowserPolicy::AllowsResource(TEXT("blob:https://example.com/id"), Origin));
    TestFalse(TEXT("Data HTML cannot replace privileged HUD"), WNTBrowserPolicy::AllowsNavigation(TEXT("data:text/html,hello"), Origin));
    TestFalse(TEXT("Normal startup has no automation"), WNTBrowserPolicy::AllowsAutomation(TEXT("-windowed")));
    TestFalse(TEXT("Flag alone cannot expose diagnostics"), WNTBrowserPolicy::AllowsAutomation(TEXT("-WNTAutomation")));
    TestFalse(TEXT("Relative save override rejected"), WNTBrowserPolicy::AllowsAutomation(TEXT("-WNTAutomation -WNTSaveDir=saves")));
    TestTrue(TEXT("Explicit isolated automation profile"), WNTBrowserPolicy::AllowsAutomation(TEXT("-WNTAutomation -WNTSaveDir=C:/WNT-test/saves")));
    return true;
}
#endif
