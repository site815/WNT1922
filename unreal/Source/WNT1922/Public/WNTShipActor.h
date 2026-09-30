#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "WNTShipActor.generated.h"

class UMaterialInterface;
class UProceduralMeshComponent;
class UStaticMeshComponent;
class UBoxComponent;
class USceneComponent;

/** Detailed external GLBs only. Missing artwork is an explicit navigation symbol. */
UCLASS()
class WNT1922_API AWNTShipActor : public AActor
{
    GENERATED_BODY()

public:
    AWNTShipActor();

    /** A failed edit retains geometry only when editing the same GLB path. */
    UFUNCTION(BlueprintCallable, Category="WNT|Ships")
    bool LoadModel(const FString& FullModelPath, UMaterialInterface* OptionalMaterial = nullptr);

    /** Declare available artwork without allocating distant fleet geometry. */
    void SetModelReference(const FString& FullModelPath);
    /** Load within 30 km, release beyond 60 km; shared file checks every 2 seconds. */
    void RefreshModelForCamera(const FVector& CameraLocation, bool bRefresh);
    /** Drop inactive scene geometry while retaining its model reference and hull identity. */
    void ReleaseResidentModel();
    void SetPendingModel();
    void UpdateSymbolForCamera(const FVector& CameraLocation, const FRotator& CameraRotation);
    void SetModelCullDistance(float Centimetres);

    /** World-space centimetres; +X is the bow and Unreal yaw rotates about +Z. */
    UFUNCTION(BlueprintCallable, Category="WNT|Ships")
    void SetShipTransform(const FVector& ProjectedCentimetres, double BearingYawDegrees);

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="WNT|Ships")
    FString SelectionKey;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="WNT|Ships")
    FString ModelId;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="WNT|Ships")
    TObjectPtr<UProceduralMeshComponent> SymbolMesh;

    /** Invisible query shape for the flat pending/error symbol, never a hull. */
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="WNT|Ships")
    TObjectPtr<UBoxComponent> SymbolHitBox;

    /** Artist-authored GLB geometry, including its UVs and PBR materials. */
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="WNT|Ships")
    TObjectPtr<UStaticMeshComponent> DetailedMesh;

    /** Loaded geometry; RefreshModelForCamera can release distant references. */
    bool HasRenderableModel() const;
    bool IsDetailedModelVisible() const;
    bool IsModelPending() const { return bModelPending; }
    bool IsModelDeferred() const { return !SourcePath.IsEmpty() && !bModelPending && !bModelLoadError && !HasRenderableModel(); }
    bool HasModelLoadError() const { return bModelLoadError; }
    FString GetVisualStatus() const;

    /** Clears the parsed CPU cache; existing actors keep their loaded mesh sections. */
    static void ClearModelCache();

private:
    bool LoadDetailedModel(const FString& Filename, FDateTime Timestamp, int64 Size);
    bool LoadModelRevision(const FString& Filename, FDateTime Timestamp, int64 Size);
    void ClearDetailedModel();
    void SetSymbolState(bool bError);
    UPROPERTY(VisibleAnywhere) TObjectPtr<USceneComponent> SymbolRoot;
    FString SourcePath;
    FString LoadedPath;
    FDateTime LoadedTimestamp;
    int64 LoadedSize = -1;
    bool bModelPending = true;
    bool bModelLoadError = false;
};
