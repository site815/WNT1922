#pragma once
#include "CoreMinimal.h"
#include "ProceduralMeshComponent.h"
#include "WNTMapTileComponent.generated.h"

/** Fixed geographic tile bounds keep thin chart lines conservative for culling. */
UCLASS()
class WNT1922_API UWNTMapTileComponent : public UProceduralMeshComponent
{
    GENERATED_BODY()
public:
    void SetGeographicHalfExtent(const FVector& HalfExtent);
    virtual FBoxSphereBounds CalcBounds(const FTransform& LocalToWorld) const override;
private:
    FBox GeographicLocalBounds=FBox(ForceInit);
};
