#include "WNTBrowserPolicy.h"
#include "Misc/Parse.h"
#include "Misc/Paths.h"

bool WNTBrowserPolicy::IsLocalOrigin(const FString& Origin)
{
    const FString Prefix(TEXT("http://127.0.0.1:"));
    if (!Origin.StartsWith(Prefix, ESearchCase::CaseSensitive)) return false;
    const FString Port = Origin.Mid(Prefix.Len());
    if (Port.IsEmpty() || Port.Len() > 5) return false;
    for (const TCHAR Ch : Port) if (Ch < '0' || Ch > '9') return false;
    const int32 Number = FCString::Atoi(*Port);
    return Number > 0 && Number <= 65535;
}

bool WNTBrowserPolicy::AllowsNavigation(const FString& URL, const FString& Origin)
{
    if (URL == TEXT("about:blank")) return true;
    if (!IsLocalOrigin(Origin) || !URL.StartsWith(Origin + TEXT("/"), ESearchCase::CaseSensitive)) return false;
    for (const TCHAR Ch : URL) if (Ch < 32 || Ch == '\\') return false;
    return true;
}

bool WNTBrowserPolicy::AllowsResource(const FString& URL, const FString& Origin)
{
    if (AllowsNavigation(URL, Origin)) return true;
    // Object URLs are local in-memory exports; image data URLs make no request.
    if (URL.StartsWith(TEXT("blob:"), ESearchCase::CaseSensitive)) return AllowsNavigation(URL.Mid(5), Origin);
    return URL.StartsWith(TEXT("data:image/png;"), ESearchCase::CaseSensitive)
        || URL.StartsWith(TEXT("data:image/jpeg;"), ESearchCase::CaseSensitive)
        || URL.StartsWith(TEXT("data:image/webp;"), ESearchCase::CaseSensitive);
}

bool WNTBrowserPolicy::AllowsAutomation(const TCHAR* CommandLine)
{
    FString Saves;
    if (!FParse::Param(CommandLine, TEXT("WNTAutomation"))
        || !FParse::Value(CommandLine, TEXT("WNTSaveDir="), Saves)
        || Saves.IsEmpty() || FPaths::IsRelative(Saves)) return false;
    // A deliberate absolute save override is required even in Shipping builds.
    // Harnesses use a new disposable directory; normal launches expose no hook.
    return !Saves.Contains(TEXT("\""));
}
