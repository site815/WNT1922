#include "WNTProjection.h"
#include "Dom/JsonObject.h"
#include "Misc/FileHelper.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include <cmath>

namespace
{
    constexpr double Radians = UE_DOUBLE_PI / 180.0;
    constexpr double M = 0.86602540378443864676;
    constexpr double A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
    constexpr double EqualEarthUnitScale = WNTProjection::EarthRadiusMetres * WNTProjection::WorldUnitsPerMetre;
    double Theta(double Latitude) { return std::asin(M * std::sin(FMath::Clamp(Latitude,-90.0,90.0)*Radians)); }
    double North(double T)
    {const double T2=T*T,T6=T2*T2*T2;return T*(A1+A2*T2+T6*(A3+A4*T2));}
    double Derivative(double T)
    {const double T2=T*T,T6=T2*T2*T2;return A1+3*A2*T2+T6*(7*A3+9*A4*T2);}
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
    // Equal Earth (Savric, Patterson and Jenny, 2018), spherical form.
    // Longitude is intentionally unbounded for a continuous repeated chart.
    return FVector(North(Theta(Point.Y))*EqualEarthUnitScale,Point.X*EastUnitsPerDegree(Point.Y),HeightMetres*WorldUnitsPerMetre);
}
double WNTProjection::EastUnitsPerDegree(double Latitude)
{const double T=Theta(Latitude);return EqualEarthUnitScale*Radians*std::cos(T)/(M*Derivative(T));}
double WNTProjection::EastScaleDerivative(double Latitude)
{
    const double T=Theta(Latitude),T2=T*T,T5=T2*T2*T,D=Derivative(T);
    const double DPrime=6*A2*T+42*A3*T5+72*A4*T5*T2;
    return Radians/M*(-std::sin(T)*D-std::cos(T)*DPrime)/(D*D*D);
}
double WNTProjection::WrapWidthAtLatitude(double Latitude) { return EastUnitsPerDegree(Latitude)*360.0; }
double WNTProjection::PoleNorthing() { return North(UE_DOUBLE_PI/3.0)*EqualEarthUnitScale; }
FVector WNTProjection::Forward(const FVector2D& Point, double CentralMeridian, double HeightMetres)
{
    return ForwardUnwrapped(FVector2D(WrapLongitude(Point.X - CentralMeridian), Point.Y), HeightMetres);
}
TOptional<FVector2D> WNTProjection::Inverse(const FVector& World, double CentralMeridian)
{
    if (!FMath::IsFinite(World.X) || !FMath::IsFinite(World.Y) || !FMath::IsFinite(CentralMeridian)) return {};
    const double Y=World.X/EqualEarthUnitScale,Limit=North(UE_DOUBLE_PI/3.0);
    if(FMath::Abs(Y)>Limit+1e-12)return {};
    const double Target=FMath::Clamp(Y,-Limit,Limit);double T=Target/A1;
    for(int32 I=0;I<12;++I)
    {const double Delta=(North(T)-Target)/Derivative(T);T-=Delta;if(FMath::Abs(Delta)<1e-13)break;}
    const double Latitude=std::asin(FMath::Clamp(std::sin(T)/M,-1.0,1.0))/Radians;
    return FVector2D(WrapLongitude(World.Y/EastUnitsPerDegree(Latitude)+CentralMeridian),Latitude);
}
FVector WNTProjection::ReprojectBetweenMeridians(const FVector& World,double FromMeridian,double ToMeridian)
{
    const auto Geo=Inverse(World,FromMeridian);if(!Geo.IsSet())return World;
    return World-FVector(0,WrapLongitude(ToMeridian-FromMeridian)*EastUnitsPerDegree(Geo->Y),0);
}
FVector2D WNTProjection::ChartVertexMetadata(const FVector& WorldVertex,const FVector& TileOrigin)
{
    const auto Vertex=Inverse(FVector(FMath::Clamp(WorldVertex.X,-PoleNorthing(),PoleNorthing()),0,0));
    const auto Origin=Inverse(FVector(FMath::Clamp(TileOrigin.X,-PoleNorthing(),PoleNorthing()),0,0));
    if(!Vertex.IsSet()||!Origin.IsSet())return FVector2D::ZeroVector;
    return FVector2D(EastUnitsPerDegree(Vertex->Y)-EastUnitsPerDegree(Origin->Y),EastScaleDerivative(Vertex->Y));
}
FWNTChartShaderData WNTProjection::PackChartShear(double Coefficient,double DerivativeValue)
{
    const double High=std::floor(Coefficient/4096.0),Remaining=Coefficient-High*4096.0;
    const double Middle=std::floor(Remaining/4.0),Low=(Remaining-Middle*4.0)/4.0;
    return {FVector2D(High,Middle),FVector2D(Low,DerivativeValue*1024.0)};
}
double WNTProjection::DecodeChartShear(const FVector2D& UV1,const FVector2D& UV2)
{return UV1.X*4096.0+UV1.Y*4.0+UV2.X*4.0;}
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
