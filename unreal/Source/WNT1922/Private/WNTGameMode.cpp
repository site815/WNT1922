#include "WNTGameMode.h"
#include "WNTPlayerController.h"
#include "WNTChartHUD.h"
AWNTGameMode::AWNTGameMode()
{
    DefaultPawnClass = nullptr;
    PlayerControllerClass = AWNTPlayerController::StaticClass();
    HUDClass = AWNTChartHUD::StaticClass();
}
