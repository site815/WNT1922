# Realistic surface and lighting assets

`polyhaven/sources.json` records the creator, original URL, CC0 license, size and SHA-256 of each downloaded photograph-based asset. These files may be redistributed in the repository and game. See [Poly Haven's license](https://polyhaven.com/license).

- **Aerial Rocks 02**, Rob Tuytel: 50-metre rock/vegetation scan, used by the native terrain material with world-space coordinates and distance-dependent political tint.
- **Kloppenheim 06 Pure Sky**: HDR sky lighting and water/metal reflection source. Creator is recorded in the manifest.
- **Rusty Metal 02**, Rob Tuytel: optional weathering reference/material for individually authored fittings. It is not applied indiscriminately to maintained hulls.

**NASA Blue Marble: Next Generation, September 2004** supplies geographic surface color from the unmodified 5400×2700 JPEG in `nasa/`. Native geographic UVs drape it continuously over the wrapping Equal Earth terrain; local Poly Haven detail and political tint are blended separately. [The source manifest](nasa/source.json) records the NASA credit, original bytes/hash and imagery-use guidance. This is modern September 2004 land-cover background, not a reconstruction of interwar land use, changing seasons or harbor scenery. Elevation and campaign boundaries come from separate datasets.

Unreal loads the texture files and HDR directly at startup through the MIT-licensed, pinned glTFRuntime plugin. Terrain textures receive mipmaps when loaded. The checked-in `terrain.gltf` is a material document consumed by `M_TerrainSurface`, whose graph is created by `unreal/Tools/PrepareAssets.py`. No online request is made while playing.

The textures are photographic surface details, not measured local geology. Strategic relief still comes from the separate elevation dataset. Detailed ship models carry their own UVs and PBR materials in self-contained GLB files.
