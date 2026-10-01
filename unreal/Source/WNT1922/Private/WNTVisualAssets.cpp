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
    // Terrain uses the cooked geometric material and existing elevation mesh.
    // No runtime NASA image, photographic glTF or normal-map import is needed.
    return LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/Materials/M_TerrainSurface.M_TerrainSurface"));
}
