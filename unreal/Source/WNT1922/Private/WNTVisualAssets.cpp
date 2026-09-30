#include "WNTVisualAssets.h"
#include "Engine/TextureCube.h"
#include "Engine/Texture2D.h"
#include "Materials/MaterialInterface.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Misc/Paths.h"
#include "glTFRuntimeAsset.h"
#include "glTFRuntimeFunctionLibrary.h"

UTextureCube* WNTVisualAssets::LoadSkyCube(const FString& DataRoot)
{
    FglTFRuntimeConfig Loader;
    Loader.bAsBlob = true;
    Loader.bAllowExternalFiles = false;
    Loader.bNoArchive = true;
    auto* Asset = UglTFRuntimeFunctionLibrary::glTFLoadAssetFromFilename(
        FPaths::Combine(DataRoot, TEXT("assets/materials/polyhaven/kloppenheim_06_puresky/kloppenheim_06_puresky_2k.exr")), false, Loader);
    if (!Asset) return nullptr;
    FglTFRuntimeImagesConfig Images;
    Images.bSRGB = false;
    Images.bForceHDR = true;
    Images.bStreaming = false;
    Images.Compression = TC_HDR;
    Images.Group = TEXTUREGROUP_Skybox;
    return Asset->LoadCubeMapFromBlob(true, true, Images);
}

UMaterialInterface* WNTVisualAssets::LoadTerrainMaterial(const FString& DataRoot)
{
    auto* Master = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/Materials/M_TerrainSurface.M_TerrainSurface"));
    if (!Master) return nullptr;
    FglTFRuntimeConfig Loader;
    Loader.bNoArchive = true;
    // This document references only local, attributed photographic sources.
    Loader.OverrideBaseDirectory = FPaths::Combine(DataRoot, TEXT("assets/materials"));
    auto* Asset = UglTFRuntimeFunctionLibrary::glTFLoadAssetFromFilename(
        FPaths::Combine(DataRoot, TEXT("assets/materials/terrain.gltf")), false, Loader);
    if (!Asset) return nullptr;
    FglTFRuntimeMaterialsConfig Materials;
    Materials.bGeneratesMipMaps = true;
    // External image mip chains are resident runtime data, not cooked bulk files.
    Materials.ImagesConfig.bStreaming = false;
    Materials.ForceMaterial = Master;
    auto* Material = Cast<UMaterialInstanceDynamic>(Asset->LoadMaterial(0, Materials, false));
    if (!Material) return nullptr;
    Materials.ImagesConfig.bSRGB = true;
    UTexture2D* GlobalColour = Asset->LoadTexture(3, Materials);
    if (!GlobalColour) return nullptr;
    Material->SetTextureParameterValue(TEXT("globalColorTexture"), GlobalColour);
    return Material;
}
