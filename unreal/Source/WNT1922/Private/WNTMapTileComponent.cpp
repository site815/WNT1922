#include "WNTMapTileComponent.h"

void UWNTMapTileComponent::SetGeographicHalfExtent(const FVector& HalfExtent)
{
    const FVector Extent(FMath::Max(0.0,HalfExtent.X),FMath::Max(0.0,HalfExtent.Y),FMath::Max(0.0,HalfExtent.Z));
    GeographicLocalBounds=FBox(-Extent,Extent);
    UpdateBounds();MarkRenderTransformDirty();
}

FBoxSphereBounds UWNTMapTileComponent::CalcBounds(const FTransform& LocalToWorld) const
{
    FBox TileBounds=Super::CalcBounds(LocalToWorld).GetBox();
    if(GeographicLocalBounds.IsValid)TileBounds+=GeographicLocalBounds.TransformBy(LocalToWorld);
    return FBoxSphereBounds(TileBounds);
}
