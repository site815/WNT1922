#pragma once
#include "CoreMinimal.h"
#include "Camera/CameraTypes.h"
#include "GameFramework/Actor.h"
#include "WNTCameraActor.generated.h"

UCLASS()
class WNT1922_API AWNTCameraActor : public AActor
{
    GENERATED_BODY()
public:
    FMinimalViewInfo View;
    virtual void CalcCamera(float DeltaTime, FMinimalViewInfo& OutResult) override { OutResult = View; }
};
