#include "WNTGameMode.h"
#include "WNTPlayerController.h"
AWNTGameMode::AWNTGameMode()
{
    DefaultPawnClass = nullptr;
    PlayerControllerClass = AWNTPlayerController::StaticClass();
}
