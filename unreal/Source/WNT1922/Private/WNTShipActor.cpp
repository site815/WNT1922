#include "WNTShipActor.h"
#include "Components/BoxComponent.h"
#include "Components/SceneComponent.h"
#include "Components/StaticMeshComponent.h"
#include "CoreGlobals.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "glTFRuntimeAsset.h"
#include "glTFRuntimeFunctionLibrary.h"
#include "HAL/FileManager.h"
#include "HAL/PlatformTime.h"
#include "Materials/Material.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Materials/MaterialInterface.h"
#include "Misc/Paths.h"
#include "ProceduralMeshComponent.h"
#include "UObject/UObjectGlobals.h"

namespace
{
    struct FDetailedMeshRevision
    {
        TWeakObjectPtr<UStaticMesh> Mesh;
        FDateTime Timestamp;
        int64 Size = -1;
    };
    TMap<FString, FDetailedMeshRevision> DetailedCache;
    TMap<FString, FDetailedMeshRevision> FailedDetailedRevisions;
    struct FFileRevision
    {
        FDateTime Timestamp;
        int64 Size = -1;
        double CheckedAt = 0;
    };
    TMap<FString, FFileRevision> FileRevisionCache;
    uint64 PrefetchFrame = MAX_uint64;
    int32 PrefetchParses = 0;

    FFileRevision ReadRevision(const FString& Filename)
    {
        const FFileRevision Revision{IFileManager::Get().GetTimeStamp(*Filename),
            IFileManager::Get().FileSize(*Filename),FPlatformTime::Seconds()};
        FileRevisionCache.Add(Filename,Revision);
        return Revision;
    }
}

AWNTShipActor::AWNTShipActor()
{
    PrimaryActorTick.bCanEverTick = false;
    SetRootComponent(CreateDefaultSubobject<USceneComponent>(TEXT("ShipPosition")));
    RootComponent->SetMobility(EComponentMobility::Movable);
    SymbolRoot = CreateDefaultSubobject<USceneComponent>(TEXT("ArtworkStatusSymbol"));
    SymbolRoot->SetupAttachment(RootComponent);
    SymbolRoot->SetMobility(EComponentMobility::Movable);
    SymbolRoot->SetRelativeLocation(FVector(0, 0, 1500));
    SymbolMesh = CreateDefaultSubobject<UProceduralMeshComponent>(TEXT("PendingArtworkSymbol"));
    SymbolMesh->SetupAttachment(SymbolRoot);
    SymbolMesh->SetMobility(EComponentMobility::Movable);
    SymbolMesh->SetCastShadow(false);
    SymbolMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    SymbolMesh->SetVisibility(false);
    SymbolHitBox = CreateDefaultSubobject<UBoxComponent>(TEXT("SymbolSelection"));
    SymbolHitBox->SetupAttachment(SymbolRoot);
    SymbolHitBox->SetMobility(EComponentMobility::Movable);
    SymbolHitBox->SetBoxExtent(FVector(40, 1200, 1200));
    SymbolHitBox->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    SymbolHitBox->SetCollisionObjectType(ECC_WorldDynamic);
    SymbolHitBox->SetCollisionResponseToAllChannels(ECR_Ignore);
    SymbolHitBox->SetCollisionResponseToChannel(ECC_Visibility, ECR_Block);
    SymbolHitBox->SetGenerateOverlapEvents(false);
    SymbolHitBox->SetHiddenInGame(true);
    DetailedMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("DetailedShipMesh"));
    DetailedMesh->SetupAttachment(RootComponent);
    DetailedMesh->SetMobility(EComponentMobility::Movable);
    DetailedMesh->SetCastShadow(true);
    DetailedMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    DetailedMesh->SetCollisionObjectType(ECC_WorldDynamic);
    DetailedMesh->SetCollisionResponseToAllChannels(ECR_Ignore);
    DetailedMesh->SetCollisionResponseToChannel(ECC_Visibility, ECR_Block);
    DetailedMesh->SetGenerateOverlapEvents(false);
    DetailedMesh->SetSimulatePhysics(false);
    DetailedMesh->SetVisibility(false);
}

bool AWNTShipActor::LoadDetailedModel(const FString& Filename,FDateTime Timestamp,int64 Size)
{
    // A broken external edit is shared by every sister ship. Parse that file
    // revision once; a changed timestamp or length immediately allows repair.
    if (const auto* Failed = FailedDetailedRevisions.Find(Filename))
        if (Failed->Timestamp == Timestamp && Failed->Size == Size) return false;
    auto FailRevision = [&]() { FailedDetailedRevisions.Add(Filename, {nullptr, Timestamp, Size}); return false; };
    if (Size < 20 || Size > 268435456) return FailRevision();
    if (LoadedPath == Filename && LoadedTimestamp == Timestamp && LoadedSize == Size
        && DetailedMesh->GetStaticMesh()) { FailedDetailedRevisions.Remove(Filename); return true; }

    UStaticMesh* Mesh = nullptr;
    if (const auto* Cached = DetailedCache.Find(Filename))
        if (Cached->Timestamp == Timestamp && Cached->Size == Size) Mesh = Cached->Mesh.Get();
    if (!Mesh)
    {
        FglTFRuntimeConfig Loader;
        // WNT's authored convention is metres, X bow, Y up, Z beam.
        Loader.TransformBaseType = EglTFRuntimeTransformBaseType::YForward;
        Loader.SceneScale = 100.0f;
        Loader.bAllowExternalFiles = false; // Self-contained GLB; no remote or sibling dependencies.
        Loader.bNoArchive = true;
        UglTFRuntimeAsset* Asset = UglTFRuntimeFunctionLibrary::glTFLoadAssetFromFilename(Filename, false, Loader);
        if (!Asset) return FailRevision();
        FglTFRuntimeStaticMeshConfig Config;
        // Runtime Chaos cooking needs a game-world outer. Owning shared geometry
        // by the world also avoids tying sister ships to the first ship actor.
        Config.Outer = GetWorld();
        Config.bBuildComplexCollision = true;
        Config.CollisionComplexity = CTF_UseComplexAsSimple;
        Config.bAllowCPUAccess = true;
        Config.bUseHighPrecisionUVs = true;
        Config.bUseHighPrecisionTangentBasis = true;
        Config.bBuildLumenCards = true;
        Config.MaterialsConfig.bGeneratesMipMaps = true;
        // GLB pixels are generated in memory, without cooked bulk-file backing.
        // Keep their complete mip chains resident, shared with sister ships.
        Config.MaterialsConfig.ImagesConfig.bStreaming = false;
        Mesh = Asset->LoadStaticMeshRecursive(TEXT(""), {}, Config);
        if (!Mesh || Mesh->GetBounds().BoxExtent.ContainsNaN() || Mesh->GetBounds().BoxExtent.GetMax() <= 0)
            return FailRevision();
        DetailedCache.Add(Filename, {Mesh, Timestamp, Size});
    }
    // Change the visible model only after its complete scene and materials load.
    DetailedMesh->SetStaticMesh(Mesh);
    DetailedMesh->SetCullDistance(SymbolMesh->LDMaxDrawDistance);
    DetailedMesh->SetVisibility(true);
    DetailedMesh->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
    SymbolMesh->SetVisibility(false);
    SymbolHitBox->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    LoadedPath = Filename; LoadedTimestamp = Timestamp; LoadedSize = Size;
    ModelId = FPaths::GetBaseFilename(Filename);
    FailedDetailedRevisions.Remove(Filename);
    return true;
}

bool AWNTShipActor::HasRenderableModel() const
{
    return DetailedMesh && DetailedMesh->GetStaticMesh();
}

bool AWNTShipActor::IsDetailedModelVisible() const
{
    return HasRenderableModel() && !IsHidden() && DetailedMesh->IsVisible();
}

FString AWNTShipActor::GetVisualStatus() const
{
    return bModelLoadError ? TEXT("model-error") : bModelPending ? TEXT("pending-art")
        : IsModelDeferred() ? TEXT("model-not-loaded") : TEXT("detailed-model");
}

void AWNTShipActor::ClearDetailedModel()
{
    DetailedMesh->SetVisibility(false);
    DetailedMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    DetailedMesh->SetStaticMesh(nullptr);
    LoadedPath.Reset(); LoadedTimestamp = FDateTime(); LoadedSize = -1; ModelId.Reset();
}

void AWNTShipActor::ReleaseResidentModel()
{
    if (!ensure(IsInGameThread()) || !HasRenderableModel()) return;
    // Components are the strong owners; the shared cache deliberately remains
    // weak. Keep the declaration so normal camera loading can reacquire it.
    ClearDetailedModel();
    if (!SourcePath.IsEmpty()) ModelId = FPaths::GetBaseFilename(SourcePath);
}

void AWNTShipActor::SetSymbolState(bool bError)
{
    // A flat chart symbol: diamond and '?' for pending art, '!' for a failed
    // detailed asset. It deliberately contains no hull or equipment geometry.
    TArray<FVector> Vertices, Normals; TArray<int32> Indices;
    TArray<FVector2D> UVs; TArray<FLinearColor> Colors; TArray<FProcMeshTangent> Tangents;
    auto Stroke = [&](FVector2D A, FVector2D B, double Width)
    {
        const FVector2D Delta = (B - A).GetSafeNormal(), Side(-Delta.Y * Width * .5, Delta.X * Width * .5);
        const int32 Base = Vertices.Num();
        for (const FVector2D P : {A - Side, B - Side, B + Side, A + Side})
        {
            Vertices.Add(FVector(0, -P.X, P.Y)); Normals.Add(FVector::ForwardVector);
            UVs.Add(FVector2D::ZeroVector); Colors.Add(FLinearColor::White); Tangents.Add(FProcMeshTangent(FVector::RightVector, false));
        }
        Indices.Append({Base, Base + 1, Base + 2, Base, Base + 2, Base + 3});
    };
    const TArray<FVector2D> Diamond{{0,1200},{1200,0},{0,-1200},{-1200,0},{0,1200}};
    for (int32 I = 1; I < Diamond.Num(); ++I) Stroke(Diamond[I-1], Diamond[I], 95);
    if (bError) Stroke(FVector2D(0,520), FVector2D(0,-150), 140);
    else
    {
        const TArray<FVector2D> Question{{-290,350},{-220,530},{140,580},{330,400},{310,190},{0,-80},{0,-220}};
        for (int32 I = 1; I < Question.Num(); ++I) Stroke(Question[I-1], Question[I], 135);
    }
    Stroke(FVector2D(0,-480), FVector2D(0,-590), 145);
    SymbolMesh->CreateMeshSection_LinearColor(0, Vertices, Indices, Normals, UVs, Colors, Tangents, false, false);
    UMaterialInterface* Material = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/Materials/M_Marker.M_Marker"));
    if (!Material) Material = UMaterial::GetDefaultMaterial(MD_Surface);
    SymbolMesh->SetMaterial(0, Material);
    if (auto* Dynamic = SymbolMesh->CreateDynamicMaterialInstance(0))
        Dynamic->SetVectorParameterValue(TEXT("Tint"), bError ? FLinearColor(.94f,.15f,.12f) : FLinearColor(.95f,.64f,.18f));
    SymbolMesh->SetVisibility(true);
    SymbolHitBox->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
}

void AWNTShipActor::SetPendingModel()
{
    if (!ensure(IsInGameThread())) return;
    const bool WasPending = bModelPending && !bModelLoadError && SymbolMesh->GetNumSections() > 0;
    ClearDetailedModel(); SourcePath.Reset(); bModelPending = true; bModelLoadError = false;
    if (!WasPending) SetSymbolState(false);
}

bool AWNTShipActor::LoadModel(const FString& FullModelPath, UMaterialInterface* OptionalMaterial)
{
    if (!ensure(IsInGameThread())) return false;
    // Recognition JSON remains reference data only, never native ship geometry.
    if (FPaths::GetExtension(FullModelPath, true).ToLower() != TEXT(".glb")) { SetPendingModel(); return false; }
    FString Filename = FPaths::ConvertRelativePathToFull(FullModelPath); FPaths::NormalizeFilename(Filename);
    SourcePath=Filename;
    // Explicit loads/editor reload tests always see the current file revision.
    const FFileRevision Revision=ReadRevision(Filename);
    return LoadModelRevision(Filename,Revision.Timestamp,Revision.Size);
}

bool AWNTShipActor::LoadModelRevision(const FString& Filename,FDateTime Timestamp,int64 Size)
{
    const bool HadErrorSymbol = bModelLoadError && !bModelPending && !HasRenderableModel() && SymbolMesh->GetNumSections() > 0;
    if (LoadedPath != Filename) ClearDetailedModel();
    bModelPending = false;
    if (LoadDetailedModel(Filename,Timestamp,Size)) { bModelLoadError = false; return true; }
    bModelLoadError = true;
    if (!HasRenderableModel() && !HadErrorSymbol) SetSymbolState(true);
    return false;
}

void AWNTShipActor::SetModelReference(const FString& FullModelPath)
{
    if(!ensure(IsInGameThread()))return;
    if(FPaths::GetExtension(FullModelPath,true).ToLower()!=TEXT(".glb")){SetPendingModel();return;}
    FString Filename=FPaths::ConvertRelativePathToFull(FullModelPath);FPaths::NormalizeFilename(Filename);
    if(SourcePath==Filename&&!bModelPending)return;
    ClearDetailedModel();SourcePath=Filename;ModelId=FPaths::GetBaseFilename(Filename);
    bModelPending=false;bModelLoadError=false;
    SymbolMesh->SetVisibility(false);SymbolHitBox->SetCollisionEnabled(ECollisionEnabled::NoCollision);
}

void AWNTShipActor::RefreshModelForCamera(const FVector& CameraLocation,bool bRefresh)
{
    if(!ensure(IsInGameThread())||SourcePath.IsEmpty()||bModelPending||CameraLocation.ContainsNaN())return;
    constexpr double VisibleRange=2000000.0,LoadRange=3000000.0,ReleaseRange=6000000.0;
    const double DistanceSquared=FVector::DistSquared(CameraLocation,GetActorLocation());
    if(DistanceSquared>ReleaseRange*ReleaseRange)
    {
        if(HasRenderableModel()){ClearDetailedModel();ModelId=FPaths::GetBaseFilename(SourcePath);}
        return;
    }
    if(HasRenderableModel()) { if(!bRefresh)return; }
    else if(DistanceSquared>LoadRange*LoadRange||(!bRefresh&&bModelLoadError))return;

    const FFileRevision* Known=FileRevisionCache.Find(SourcePath);
    const FFileRevision Revision=(!Known||(bRefresh&&FPlatformTime::Seconds()-Known->CheckedAt>=2.0))
        ? ReadRevision(SourcePath) : *Known;
    const auto* Cached=DetailedCache.Find(SourcePath);
    const bool NeedsParse=!Cached||!Cached->Mesh.IsValid()||Cached->Timestamp!=Revision.Timestamp||Cached->Size!=Revision.Size;
    if(NeedsParse&&Revision.Size>=20&&Revision.Size<=268435456)
    {
        // A jump into a large fleet must not import every distinct class in one
        // frame. Share sister-ship geometry immediately and admit one new GLB
        // per frame, including visible hulls, until the entire fleet is ready.
        if(PrefetchFrame!=GFrameCounter){PrefetchFrame=GFrameCounter;PrefetchParses=0;}
        if(PrefetchParses>=1)return;
        ++PrefetchParses;
    }
    LoadModelRevision(SourcePath,Revision.Timestamp,Revision.Size);
}

void AWNTShipActor::UpdateSymbolForCamera(const FVector& CameraLocation, const FRotator& CameraRotation)
{
    const double Distance = FVector::Distance(CameraLocation, GetActorLocation());
    const bool Visible = SymbolMesh->LDMaxDrawDistance <= 0 || Distance < SymbolMesh->LDMaxDrawDistance;
    if (HasRenderableModel())
    {
        // Renderer draw-distance culling alone leaves collision active. Use the
        // same distance gate for rendering and picking, retaining loaded data.
        DetailedMesh->SetVisibility(Visible);
        DetailedMesh->SetCollisionEnabled(Visible ? ECollisionEnabled::QueryOnly : ECollisionEnabled::NoCollision);
        SymbolMesh->SetVisibility(false);
        SymbolHitBox->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        return;
    }
    if (!bModelPending && !bModelLoadError) return;
    SymbolMesh->SetVisibility(Visible);
    SymbolHitBox->SetCollisionEnabled(Visible ? ECollisionEnabled::QueryOnly : ECollisionEnabled::NoCollision);
    const double Scale = FMath::Clamp(Distance * .013 / 2400., .65, 16.);
    SymbolRoot->SetRelativeLocation(FVector(0, 0, 1500. * Scale));
    // A screen-aligned billboard retains the camera's up axis. Per-symbol
    // look-at rotations lose that axis near overhead and turn glyphs radially.
    SymbolRoot->SetWorldRotation(FRotationMatrix::MakeFromXZ(-CameraRotation.Vector(),
        CameraRotation.RotateVector(FVector::UpVector)).ToQuat());
    SymbolRoot->SetWorldScale3D(FVector(Scale));
}

void AWNTShipActor::SetModelCullDistance(float Centimetres)
{
    SymbolMesh->SetCullDistance(Centimetres); DetailedMesh->SetCullDistance(Centimetres);
}

void AWNTShipActor::SetShipTransform(const FVector& ProjectedCentimetres, double BearingYawDegrees)
{
    if (!ensure(IsInGameThread()) || ProjectedCentimetres.ContainsNaN() || !FMath::IsFinite(BearingYawDegrees)) return;
    SetActorLocationAndRotation(ProjectedCentimetres, FRotator(0.0, BearingYawDegrees, 0.0), false, nullptr, ETeleportType::TeleportPhysics);
}

void AWNTShipActor::ClearModelCache()
{
    if (ensure(IsInGameThread())) { DetailedCache.Empty(); FailedDetailedRevisions.Empty(); FileRevisionCache.Empty(); PrefetchFrame=MAX_uint64; PrefetchParses=0; }
}
