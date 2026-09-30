#pragma once
#include "CoreMinimal.h"

// The embedded HUD talks only to the campaign process started by this game.
namespace WNTBrowserPolicy
{
    WNT1922_API bool IsLocalOrigin(const FString& Origin);
    WNT1922_API bool AllowsNavigation(const FString& URL, const FString& Origin);
    WNT1922_API bool AllowsResource(const FString& URL, const FString& Origin);
    WNT1922_API bool AllowsAutomation(const TCHAR* CommandLine);
}
