#pragma once
#include "CoreMinimal.h"

namespace WNTSelectionGeometry
{
    // Distance to the projected visible bounds, measured in pointer-padding
    // units. The caller supplies CSS pixels normalized to the full window.
    inline double Distance(const FBox2D& Bounds, const FVector2D& Point, const FVector2D& Padding)
    {
        if (!Bounds.bIsValid) return TNumericLimits<double>::Max();
        const FVector2D Nearest(FMath::Clamp(Point.X,Bounds.Min.X,Bounds.Max.X),FMath::Clamp(Point.Y,Bounds.Min.Y,Bounds.Max.Y));
        const FVector2D Delta=Point-Nearest;
        return FVector2D(Delta.X/FMath::Max(1e-9,Padding.X),Delta.Y/FMath::Max(1e-9,Padding.Y)).SizeSquared();
    }
    inline bool Overlaps(const FBox2D& A,const FBox2D& B)
    {
        return A.bIsValid && B.bIsValid && A.Min.X<=B.Max.X && A.Max.X>=B.Min.X && A.Min.Y<=B.Max.Y && A.Max.Y>=B.Min.Y;
    }
}
