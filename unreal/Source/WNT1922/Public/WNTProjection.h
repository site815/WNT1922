#pragma once
#include "CoreMinimal.h"

struct FWNTChartShaderData { FVector2D UV1, UV2; };

/** North-up Equal Earth in Unreal centimetres: X north, Y east, Z up. */
namespace WNTProjection
{
    constexpr double EarthRadiusMetres = 6371000.0;
    constexpr double WorldUnitsPerMetre = 100.0;
    /** Equatorial width for camera sizing only; repeats narrow toward the poles. */
    constexpr double WorldWidth = 2.0 * UE_DOUBLE_PI * EarthRadiusMetres * WorldUnitsPerMetre / (0.86602540378443864676 * 1.340264);
    WNT1922_API double WrapLongitude(double Degrees);
    WNT1922_API double EastUnitsPerDegree(double Latitude);
    /** Derivative of east-units-per-degree with respect to projected northing. */
    WNT1922_API double EastScaleDerivative(double Latitude);
    WNT1922_API double WrapWidthAtLatitude(double Latitude);
    WNT1922_API double PoleNorthing();
    WNT1922_API FVector Forward(const FVector2D& LongitudeLatitude, double CentralMeridian = 0.0, double HeightMetres = 0.0);
    /** Relative longitude may equal +180 on a clipped map seam. */
    WNT1922_API FVector ForwardUnwrapped(const FVector2D& RelativeLongitudeLatitude, double HeightMetres = 0.0);
    /** Longitude repeats indefinitely; unset beyond the poles or for non-finite inputs. */
    WNT1922_API TOptional<FVector2D> Inverse(const FVector& World, double CentralMeridian = 0.0);
    /** Preserve the current repeated copy when the chart's meridian changes. */
    WNT1922_API FVector ReprojectBetweenMeridians(const FVector& World, double FromMeridian, double ToMeridian);
    /** UV1 for fixed chart geometry: east shear coefficient and its north derivative. */
    WNT1922_API FVector2D ChartVertexMetadata(const FVector& WorldVertex, const FVector& TileOrigin);
    /** Three-part encoding survives ProceduralMeshComponent's half-float UV buffers. */
    WNT1922_API FWNTChartShaderData PackChartShear(double Coefficient, double Derivative = 0.0);
    WNT1922_API double DecodeChartShear(const FVector2D& UV1, const FVector2D& UV2);
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
