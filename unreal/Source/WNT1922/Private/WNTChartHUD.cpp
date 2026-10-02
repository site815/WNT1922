#include "WNTChartHUD.h"
#include "WNTWorldActor.h"
#include "EngineUtils.h"

void AWNTChartHUD::DrawHUD()
{
    Super::DrawHUD();
    if (!Canvas) return;
    if (!Scene.IsValid())
        for (TActorIterator<AWNTWorldActor> It(GetWorld()); It; ++It) { Scene = *It; break; }
    if (Scene.IsValid()) Scene->DrawChart(Canvas);
}
