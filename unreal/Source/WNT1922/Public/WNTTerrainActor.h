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
    double GetCentralMeridian() const { return CentralMeridian; }
    const FString& GetLoadError() const { return LoadError; }

    UPROPERTY(EditAnywhere, Category="WNT|Terrain") FString CampaignId = TEXT("1936hindsight");
    UPROPERTY(EditAnywhere, Category="WNT|Terrain", meta=(ClampMin="0.25",ClampMax="2.0")) double SurfaceSampleDegrees = 1.0;
    // Source elevation is rendered in real metres. Only a 5 cm numerical
    // separation avoids coincident flat land/water, never a raised map plateau.
    static constexpr double LandBaseMetres = .05;
    UPROPERTY(EditAnywhere, Category="WNT|Terrain") double GridSpacingDegrees = 30.0;
    UPROPERTY(EditAnywhere, Category="WNT|Terrain") double GridWidthMetres = 4000.0;
    UPROPERTY(EditAnywhere, Category="WNT|Terrain") TObjectPtr<UMaterialInterface> TerrainMaterial;
    UPROPERTY(EditAnywhere, Category="WNT|Terrain") TObjectPtr<UMaterialInterface> LineMaterial;

private:
    void RebuildProjectedMeshes();
    TUniquePtr<FWNTTerrainData, FWNTTerrainDataDeleter> Data;
    UPROPERTY(Transient) TArray<TObjectPtr<UProceduralMeshComponent>> TerrainTiles;
    double CentralMeridian = 0.0;
    FString LoadError;
    bool bGraticuleVisible = true;
};
