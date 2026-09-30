#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "WNTOceanDetailActor.generated.h"

class UMaterialInstanceDynamic;
class UProceduralMeshComponent;

/** Camera-local cosmetic water. Never changes navigation, hull poses, or campaign time. */
UCLASS()
class WNT1922_API AWNTOceanDetailActor : public AActor
{
    GENERATED_BODY()
public:
    AWNTOceanDetailActor();
    bool Initialize(FString& OutError);
    void UpdateView(const FVector& CameraPosition, const FVector& CameraDirection, double DeltaSeconds, bool bSceneVisible);
    void SetSceneVisible(bool bVisible);
    UMaterialInstanceDynamic* GetFarMaterial() const { return FarMaterial; }
    UProceduralMeshComponent* GetSurface() const { return Surface; }
    bool IsDetailActive() const { return bActive; }

    // 193 x 193 vertices / 73,728 triangles. No collision cooking or CPU mesh updates.
    static constexpr int32 GridIntervals = 192;
    static constexpr double GridSpacingCentimetres = 800.0;
    static constexpr double PatchRadiusCentimetres = 74000.0;
private:
    void SetActive(bool bEnabled);
    void UpdateParameters(const FVector2D& Centre, double Strength);

    UPROPERTY(VisibleAnywhere) TObjectPtr<UProceduralMeshComponent> Surface;
    UPROPERTY(Transient) TObjectPtr<UMaterialInstanceDynamic> FarMaterial;
    UPROPERTY(Transient) TObjectPtr<UMaterialInstanceDynamic> DetailMaterial;
    double ElapsedSeconds = 0.0;
    bool bActive = false;
};
