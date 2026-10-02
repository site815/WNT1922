#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "WNTWorldActor.generated.h"

class AWNTTerrainActor;
class AWNTOceanDetailActor;
class UStaticMeshComponent;
class USceneComponent;
class UDirectionalLightComponent;
class USkyLightComponent;
class UProceduralMeshComponent;
class FJsonObject;
class UCanvas;
struct FWNTWorldRuntime;
struct FWNTWorldRuntimeDeleter { void operator()(FWNTWorldRuntime* Pointer) const; };

/** Native presentation only. Campaign simulation and visibility remain in the worker. */
UCLASS()
class WNT1922_API AWNTWorldActor : public AActor
{
    GENERATED_BODY()
public:
    AWNTWorldActor();
    virtual ~AWNTWorldActor() override;
    virtual void Tick(float DeltaSeconds) override;
    virtual void EndPlay(const EEndPlayReason::Type EndPlayReason) override;

    bool Initialize(const FString& DataRoot);
    void ApplyWorldPacket(const TSharedPtr<FJsonObject>& Packet);
    void ApplyWorldSelection(const TSharedPtr<FJsonObject>& Packet);
    void SetCentralMeridian(double Degrees);
    void SetSceneMode(const FString& Mode);
    void ApplyBattlePacket(const TSharedPtr<FJsonObject>& Packet);
    TSharedPtr<FJsonObject> GetSelection(AActor* Actor) const;
    TSharedPtr<FJsonObject> GetSelection(const FHitResult& Hit) const;
    TOptional<FVector> GetSelectedPosition(const FString& Kind, const FString& Id, int32 HullIndex = -1, const FString& Side = TEXT("")) const;
    TSharedPtr<FJsonObject> GetChartDiagnostics() const;
    void DrawChart(UCanvas* Canvas);
    double GetChartPixelSize(const AActor* Actor, double ViewportHeight) const;
    AActor* HitChart(const FVector2D& NormalizedPointer, const FVector2D& NormalizedPadding) const;
    FBox GetSceneBounds() const;
    FBox GetForceBounds(const FString& ForceId) const;
    AWNTTerrainActor* GetTerrain() const { return Terrain; }
    double GroundHeight(const FVector2D& LongitudeLatitude) const;
    const FString& GetLoadError() const { return LoadError; }

private:
#if WITH_DEV_AUTOMATION_TESTS
    friend class FWNTWorldSelectionUpdateTest;
#endif
    void UpdateWorld(double Fraction);
    void UpdateBattle(double Fraction);
    void UpdateVisibility();
    void UpdateChartMarkers();
    void RepositionPorts();
    void RebuildRoute(double WidthCentimetres);
    void RepositionWorldTiles();
    bool BuildOcean();
    FString ModelPath(const FString& ClassId, const FString& Campaign, const FString& Type = TEXT("")) const;

    UPROPERTY(Transient) TObjectPtr<AWNTTerrainActor> Terrain;
    UPROPERTY(Transient) TObjectPtr<AWNTOceanDetailActor> OceanDetail;
    UPROPERTY(VisibleAnywhere) TObjectPtr<USceneComponent> Ocean;
    UPROPERTY(Transient) TArray<TObjectPtr<UProceduralMeshComponent>> OceanTiles;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UDirectionalLightComponent> Sun;
    UPROPERTY(VisibleAnywhere) TObjectPtr<USkyLightComponent> Sky;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStaticMeshComponent> SkyBackground;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UProceduralMeshComponent> RouteMesh;
    UPROPERTY(Transient) TArray<TObjectPtr<UProceduralMeshComponent>> RouteTiles;
    TArray<FVector> OceanTileOrigins, RouteTileOrigins;
    TArray<FVector> OceanTileHalfExtents, RouteTileHalfExtents;
    TArray<double> OceanTileShearExtents, RouteTileShearExtents;
    TUniquePtr<FWNTWorldRuntime, FWNTWorldRuntimeDeleter> Runtime;
    FString DataDirectory, LoadError, Campaign;
    double CentralMeridian = 0.0;
    bool bBattleMode = false;
    bool bSceneHidden = false;
};
