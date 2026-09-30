#include "WNTProjection.h"
#include "Dom/JsonObject.h"
#include "Misc/FileHelper.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include <cmath>

namespace
{
    constexpr double A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
    constexpr double M = 0.86602540378443864676, Radians = UE_DOUBLE_PI / 180.0;
    double ProjectY(double Theta)
    {
        const double T2 = Theta * Theta, T6 = T2 * T2 * T2;
        return Theta * (A1 + A2 * T2 + T6 * (A3 + A4 * T2));
    }
    double Derivative(double Theta)
    {
        const double T2 = Theta * Theta, T6 = T2 * T2 * T2;
        return A1 + 3.0 * A2 * T2 + T6 * (7.0 * A3 + 9.0 * A4 * T2);
    }
}
double WNTProjection::WrapLongitude(double Degrees)
{
    if (!FMath::IsFinite(Degrees)) return 0.0;
    double Wrapped = FMath::Fmod(Degrees + 180.0, 360.0);
    if (Wrapped < 0) Wrapped += 360.0;
    return Wrapped - 180.0;
}
FVector WNTProjection::ForwardUnwrapped(const FVector2D& Point, double HeightMetres)
{
    const double Theta = FMath::Asin(M * FMath::Sin(FMath::Clamp(Point.Y, -90.0, 90.0) * Radians));
    const double East = Point.X * Radians * FMath::Cos(Theta) / (M * Derivative(Theta));
    const double Scale = EarthRadiusMetres * WorldUnitsPerMetre;
    return FVector(ProjectY(Theta) * Scale, East * Scale, HeightMetres * WorldUnitsPerMetre);
}
FVector WNTProjection::Forward(const FVector2D& Point, double CentralMeridian, double HeightMetres)
{
    return ForwardUnwrapped(FVector2D(WrapLongitude(Point.X - CentralMeridian), Point.Y), HeightMetres);
}
TOptional<FVector2D> WNTProjection::Inverse(const FVector& World, double CentralMeridian)
{
    if (!FMath::IsFinite(World.X) || !FMath::IsFinite(World.Y) || !FMath::IsFinite(CentralMeridian)) return {};
    const double Scale = EarthRadiusMetres * WorldUnitsPerMetre;
    const double North = World.X / Scale, East = World.Y / Scale;
    const double MaxTheta = UE_DOUBLE_PI / 3.0, MaxNorth = ProjectY(MaxTheta);
    if (FMath::Abs(North) > MaxNorth + 1e-12) return {};
    double Theta = FMath::Clamp(North / A1, -MaxTheta, MaxTheta);
    for (int32 Iteration = 0; Iteration < 12; ++Iteration)
    {
        const double Change = (ProjectY(Theta) - North) / Derivative(Theta);
        Theta = FMath::Clamp(Theta - Change, -MaxTheta, MaxTheta);
        if (FMath::Abs(Change) < 1e-14) break;
    }
    const double Longitude = East * M * Derivative(Theta) / FMath::Cos(Theta);
    if (FMath::Abs(Longitude) > UE_DOUBLE_PI + 1e-11) return {};
    const double Latitude = FMath::Asin(FMath::Clamp(FMath::Sin(Theta) / M, -1.0, 1.0));
    return FVector2D(WrapLongitude(Longitude / Radians + CentralMeridian), Latitude / Radians);
}
bool FWNTElevationGrid::Load(const FString& BinaryPath, const FString& MetadataPath, FString& OutError)
{
    Values.Reset(); Width = Height = 0;
    TArray<uint8> Bytes; FString Text; TSharedPtr<FJsonObject> Metadata;
    if (!FFileHelper::LoadFileToArray(Bytes, *BinaryPath) || !FFileHelper::LoadFileToString(Text, *MetadataPath) ||
        !FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), Metadata) || !Metadata.IsValid())
    { OutError = TEXT("Cannot read terrain elevation.bin/elevation.json"); return false; }
    double W = 0, H = 0, StepX = 0, StepY = 0, West = 0, North = 0; FString Encoding, ByteOrder;
    if (!Metadata->TryGetNumberField(TEXT("width"), W) || !Metadata->TryGetNumberField(TEXT("height"), H) ||
        !Metadata->TryGetNumberField(TEXT("longitudeWestCenter"), West) || !Metadata->TryGetNumberField(TEXT("latitudeNorthCenter"), North) ||
        !Metadata->TryGetNumberField(TEXT("longitudeStepDegrees"), StepX) || !Metadata->TryGetNumberField(TEXT("latitudeStepDegrees"), StepY) ||
        !Metadata->TryGetStringField(TEXT("encoding"), Encoding) || !Metadata->TryGetStringField(TEXT("byteOrder"), ByteOrder) ||
        Encoding != TEXT("signed-int16") || ByteOrder != TEXT("little-endian") ||
        !FMath::IsFinite(W) || !FMath::IsFinite(H) || !FMath::IsFinite(West) || !FMath::IsFinite(North) || !FMath::IsFinite(StepX) || !FMath::IsFinite(StepY) ||
        W < 2 || H < 2 || W > 10000 || H > 10000 || W != std::floor(W) || H != std::floor(H) ||
        StepX <= 0 || StepY >= 0 || !FMath::IsNearlyEqual(W * StepX, 360.0, 1e-8) ||
        Bytes.Num() != static_cast<int64>(W) * static_cast<int64>(H) * 2)
    { OutError = TEXT("Invalid signed elevation raster layout"); return false; }
    Width = static_cast<int32>(W); Height = static_cast<int32>(H);
    WestCentre = West; NorthCentre = North; LongitudeStep = StepX; LatitudeStep = StepY;
    Values.SetNumUninitialized(Width * Height);
    for (int32 Index = 0; Index < Values.Num(); ++Index)
    {
        const uint16 Bits = static_cast<uint16>(Bytes[2 * Index]) | (static_cast<uint16>(Bytes[2 * Index + 1]) << 8);
        const int32 Signed = Bits >= 32768 ? static_cast<int32>(Bits) - 65536 : Bits;
        if (Signed == -32768) { Values.Reset(); OutError = TEXT("Elevation contains an unsupported missing sample"); return false; }
        Values[Index] = static_cast<int16>(Signed);
    }
    OutError.Reset(); return true;
}
double FWNTElevationGrid::SampleMetres(const FVector2D& Point) const
{
    if (!IsLoaded() || !FMath::IsFinite(Point.X) || !FMath::IsFinite(Point.Y)) return 0.0;
    double X = FMath::Fmod((Point.X - WestCentre) / LongitudeStep, static_cast<double>(Width));
    if (X < 0) X += Width;
    const double Y = FMath::Clamp((Point.Y - NorthCentre) / LatitudeStep, 0.0, static_cast<double>(Height - 1));
    const int32 X0 = FMath::FloorToInt(X), X1 = (X0 + 1) % Width;
    const int32 Y0 = FMath::FloorToInt(Y), Y1 = FMath::Min(Y0 + 1, Height - 1);
    const double A = FMath::Lerp(static_cast<double>(Values[Y0 * Width + X0]), static_cast<double>(Values[Y0 * Width + X1]), X - X0);
    const double B = FMath::Lerp(static_cast<double>(Values[Y1 * Width + X0]), static_cast<double>(Values[Y1 * Width + X1]), X - X0);
    return FMath::Lerp(A, B, Y - Y0);
}
