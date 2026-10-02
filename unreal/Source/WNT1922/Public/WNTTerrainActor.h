#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "WNTTerrainActor.generated.h"

class UMaterialInterface;
class UProceduralMeshComponent;
struct FWNTTerrainData;
struct FWNTTerrainDataDeleter { void operator()(FWNTTerrainData* Pointer) const; };

struct FWNTGeographicTriangle
{
    FVector2D A, B, C;
};
namespace WNTTerrainGeometry
{
    WNT1922_API TArray<FVector2D> UnwrapRing(const TArray<FVector2D>& Ring);
    WNT1922_API bool TriangulatePolygon(const TArray<TArray<FVector2D>>& Rings, TArray<FWNTGeographicTriangle>& OutTriangles, FString& OutError);
    /** Output longitudes are relative and clipped to [-180,+180], never joined across the seam. */
    WNT1922_API TArray<FWNTGeographicTriangle> ClipAtMeridian(const FWNTGeographicTriangle& Triangle, double CentralMeridian);
    /** Anchor a fixed tile to its nearest repeat; UV1/CPD0 supplies latitude shear. */
    WNT1922_API FVector WrappedTileOrigin(const FVector& GeographicOrigin, double CentralMeridian, int32 Copy);
    WNT1922_API double TileLongitudeShift(const FVector& GeographicOrigin, double CentralMeridian, int32 Copy);
    /** Conservative local bounds for shader displacement, including float transport margin. */
    WNT1922_API FBox ShearedLocalBounds(const FBox& LocalBounds, const FVector2D& ShearLimits, double LongitudeShift);
    /** Stable illustrative elevation/climate colors; no satellite or image sampling. */
    WNT1922_API FLinearColor TerrainColour(const FVector2D& LongitudeLatitude, double HeightMetres, const FLinearColor& PoliticalTint);
    /** Split a boundary on the same global grid used to tessellate land faces. */
    WNT1922_API TArray<FVector2D> SplitSurfaceEdge(const FVector2D& A, const FVector2D& B, double Step);
    WNT1922_API TArray<FWNTGeographicTriangle> SubdivideSurface(const FWNTGeographicTriangle& Triangle, double Step);
    /** Padded support ribbon for the material's antialiased, constant-pixel chart line. */
    WNT1922_API double GraticuleWidthForPixelSize(double CentimetresPerPixel);
}

/** Runtime geographic terrain; local tile vertices retain precision under UE large-world coordinates. */
UCLASS()
class WNT1922_API AWNTTerrainActor : public AActor
{
    GENERATED_BODY()
public:
    AWNTTerrainActor();
    virtual ~AWNTTerrainActor() override;
    bool Initialize(const FString& DataRoot);
    void SetCentralMeridian(double Degrees);
    double HeightAt(const FVector2D& LongitudeLatitude) const;
    double RenderHeightAt(const FVector2D& LongitudeLatitude) const;
    bool IsLandAt(const FVector2D& LongitudeLatitude) const;
    FString TerritoryAt(const FVector2D& LongitudeLatitude) const;
    void SetControl(const TMap<FString, FLinearColor>& TerritoryColours);
    void SetGraticuleVisible(bool Visible);
    void SetGraticulePixelSize(double CentimetresPerPixel);
    double GetCentralMeridian() const { return CentralMeridian; }
    const FString& GetLoadError() const { return LoadError; }

    UPROPERTY(EditAnywhere, Category="WNT|Terrain") FString CampaignId = TEXT("1936hindsight");
    UPROPERTY(EditAnywhere, Category="WNT|Terrain", meta=(ClampMin="0.25",ClampMax="2.0")) double SurfaceSampleDegrees = 0.5;
    // Source elevation is rendered in real metres. Only a 5 cm numerical
    // separation avoids coincident flat land/water, never a raised map plateau.
    static constexpr double LandBaseMetres = .05;
    UPROPERTY(EditAnywhere, Category="WNT|Terrain") double GridSpacingDegrees = 30.0;
    // A readable strategic default; runtime adjusts only the grid ribbons as
    // zoom changes. Land, coast, indices and geographic centerlines stay fixed.
    UPROPERTY(EditAnywhere, Category="WNT|Terrain") double GridWidthMetres = 96000.0;
    UPROPERTY(EditAnywhere, Category="WNT|Terrain") TObjectPtr<UMaterialInterface> TerrainMaterial;
    UPROPERTY(EditAnywhere, Category="WNT|Terrain") TObjectPtr<UMaterialInterface> LineMaterial;

private:
    void RebuildProjectedMeshes();
    void UpdateTilePlacement(int32 Index, int32 Copy);
    TUniquePtr<FWNTTerrainData, FWNTTerrainDataDeleter> Data;
    UPROPERTY(Transient) TArray<TObjectPtr<UProceduralMeshComponent>> TerrainTiles;
    TArray<FVector> TileOrigins;
    TArray<FBox> TileLocalBounds;
    TArray<FVector2D> TileShearLimits;
    double CentralMeridian = 0.0;
    FString LoadError;
    bool bGraticuleVisible = true;
};
