#pragma once
#include "CoreMinimal.h"
#include "GameFramework/HUD.h"
#include "WNTChartHUD.generated.h"

class AWNTWorldActor;

/** Pixel-space chart ink, composited after scene antialiasing and before the browser UI. */
UCLASS()
class WNT1922_API AWNTChartHUD : public AHUD
{
    GENERATED_BODY()
public:
    virtual void DrawHUD() override;
private:
    TWeakObjectPtr<AWNTWorldActor> Scene;
};
