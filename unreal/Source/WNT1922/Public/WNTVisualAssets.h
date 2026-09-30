#pragma once
#include "CoreMinimal.h"

class UTextureCube;
class UMaterialInterface;

/** External photographic assets stay editable alongside the game data. */
namespace WNTVisualAssets
{
    WNT1922_API UTextureCube* LoadSkyCube(const FString& DataRoot);
    WNT1922_API UMaterialInterface* LoadTerrainMaterial(const FString& DataRoot);
}
