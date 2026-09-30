#pragma once
#include "CoreMinimal.h"

/** North-up wrapping cylindrical terrain in Unreal centimetres: X north, Y east, Z up. */
namespace WNTProjection
{
    constexpr double EarthRadiusMetres = 6371000.0;
    constexpr double WorldUnitsPerMetre = 100.0;
    constexpr double WorldWidth = 2.0 * UE_DOUBLE_PI * EarthRadiusMetres * WorldUnitsPerMetre;
    WNT1922_API double WrapLongitude(double Degrees);
    WNT1922_API FVector Forward(const FVector2D& LongitudeLatitude, double CentralMeridian = 0.0, double HeightMetres = 0.0);
    /** Relative longitude may equal +180 on a clipped map seam. */
    WNT1922_API FVector ForwardUnwrapped(const FVector2D& RelativeLongitudeLatitude, double HeightMetres = 0.0);
    /** Longitude repeats indefinitely; unset beyond the poles or for non-finite inputs. */
    WNT1922_API TOptional<FVector2D> Inverse(const FVector& World, double CentralMeridian = 0.0);
    inline FVector WorldToMetres(const FVector& World) { return World / WorldUnitsPerMetre; }
    inline FVector MetresToWorld(const FVector& Metres) { return Metres * WorldUnitsPerMetre; }
}

/** Signed elevation raster. Values retain source metres without display exaggeration. */
class WNT1922_API FWNTElevationGrid
{
public:
    bool Load(const FString& BinaryPath, const FString& MetadataPath, FString& OutError);
    double SampleMetres(const FVector2D& LongitudeLatitude) const;
    bool IsLoaded() const { return Width > 1 && Height > 1 && Values.Num() == Width * Height; }
    int32 GetWidth() const { return Width; }
    int32 GetHeight() const { return Height; }
private:
    int32 Width = 0, Height = 0;
    double WestCentre = -179.875, NorthCentre = 89.875, LongitudeStep = 0.25, LatitudeStep = -0.25;
    TArray<int16> Values;
};
