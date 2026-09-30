#pragma once
#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "WNTBrowserBridge.generated.h"
class AWNTPlayerController;

/** Only scene data and pointer operations cross this bridge. Simulation stays in its worker. */
UCLASS()
class WNT1922_API UWNTBrowserBridge : public UObject
{
    GENERATED_BODY()
public:
    TWeakObjectPtr<AWNTPlayerController> Owner;
    UFUNCTION() void World(const FString& Json);
    UFUNCTION() void Battle(const FString& Json);
    UFUNCTION() void SceneInput(const FString& Json);
    UFUNCTION() void Viewport(const FString& Json);
    UFUNCTION() void CloseApproved(bool Saved);
};
