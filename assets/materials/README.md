# Realistic surface and lighting assets

`polyhaven/sources.json` records the creator, original URL, CC0 license, size and SHA-256 of each downloaded photograph-based asset. These files may be redistributed in the repository and game. See [Poly Haven's license](https://polyhaven.com/license).

- **Aerial Rocks 02**, Rob Tuytel: retained 50-metre rock/vegetation scan from the earlier photographic terrain material; not sampled by the current map surface.
- **Kloppenheim 06 Pure Sky**: HDR sky lighting and water/metal reflection source. Creator is recorded in the manifest.
- **Rusty Metal 02**, Rob Tuytel: optional weathering reference/material for individually authored fittings. It is not applied indiscriminately to maintained hulls.

**NASA Blue Marble: Next Generation, September 2004** remains an archived geographic reference in `nasa/`; the current map does not sample it. [The source manifest](nasa/source.json) records the NASA credit, original bytes/hash and imagery-use guidance. It depicts modern land cover, not interwar land use or harbor scenery.

The current `M_TerrainSurface`, created by `unreal/Tools/PrepareAssets.py`, uses geometric relief, vertex colors and normals, with political tint and separate country/coast boundaries. The earlier `terrain.gltf` material is retained as reference. Unreal loads the external HDR environment through the MIT-licensed, pinned glTFRuntime plugin. No online request is made while playing.

The textures are photographic surface details, not measured local geology. Strategic relief still comes from the separate elevation dataset. Detailed ship models carry their own UVs and PBR materials in self-contained GLB files.
