# Native 3D ship assets

`ships/index.json` maps stored model records to 281 campaign/class entries and identifies additional asset-review models. Run the audit below for current counts. Unreal loads registered detailed GLBs directly from this directory; changing a stored GLB does not require rebuilding or cooking the game. Self-contained GLB 2.0 files are the format for detailed artwork. The native loader checks each model's file revision periodically and shares the loaded mesh between instances.

The migration is incomplete. Five detailed GLBs are registered; 179 earlier stylized JSON recognition files are retained as migration/reference data, **not active 3D ship assets**. The native renderer does not load those JSON meshes or substitute a simplified hull for an unfinished class. Instead it shows an amber outlined diamond with ? at each individual hull's position, preserving selection and recorded information. A red ! symbol identifies a failed detailed-model load. Unfinished port scenery likewise uses navigation symbols, without cuboid harbor stand-ins. These symbols do not claim to represent historical hull shape or equipment. The retired authoring importer and voxel source dependency have been removed.

## Detailed original models

The first replacement is `ships/usa/farragut_dd34.glb`, the Farragut class in its original five-gun fit. Its independent authoring source is `authoring/farragut-1934.json`; `authoring/build-farragut.mjs` builds its hull and fittings without reading the earlier model geometry. It includes a full underwater hull, deck sheer/camber, raised decks, shielded forward and open aft gun mountings, two unequal funnels, eight torpedo tubes, bridge glazing, masts and stays, deck rails, ladders, boats, davits, anchors, ventilation fittings, shafts, screws and rudder. One shared 3D model supplies all views.

The overall dimensions and major equipment layout follow NHHC's DANFS entry and the public-domain historical recognition drawing listed in the companion `.source.json`. Body sections and many small fittings are inferred reconstruction, explicitly identified there; the asset is not an exact shipyard reconstruction. The file currently contains 93,280 triangles, eight PBR material sections and three embedded textures. Triangle count alone does not establish visual quality: native GPU inspection is also required.

The gray painted surfaces use physically scaled UVs, original neutral paint color, and Rob Tuytel's CC0 **Blue Metal Plate** OpenGL normal and packed occlusion/roughness/metalness maps from Poly Haven. The blue diffuse map is not used. Painted areas have zero metallic reflectance; exposed steel and brass have separate materials. Source URLs, licenses and file hashes are under `textures/blue_metal_plate/source.json`. Original paint texture authoring is under `authoring/build-naval-surfaces.mjs`.

## Editing and authoring

Edit the stored GLB in a 3D editor and export it back to its registered path. Keep all textures embedded, include normals and UVs, use metre units, and retain the companion source/fit attribution. Unreal does not need a new game build for this edit. The optional original-authoring commands are:

```powershell
node assets/models/authoring/build-farragut.mjs --write
node tools/check-models.mjs
```

Running an authoring exporter replaces that model's stored mesh and would overwrite later hand edits. The game never invokes these commands. `authoring/authored-mesh.mjs` provides shared original-geometry and GLB writing utilities, independent of the removed browser renderer. Use separate class specifications and source-backed geometry rather than scaling a generic vessel and presenting it as another historical class.

Two licensed artist assets are also stored for native review: Bismarck and Samidare by everlasting17th, CC-BY-4.0. Their geometry, original UVs and embedded surface images are retained; the scene hierarchy is baked, centered and uniformly scaled to the reference hull length. No matching campaign class exists, so these are specific historical assets rather than replacements for unrelated ships. `authoring/licensed-ships.json` pins source URLs and hashes; `node assets/models/authoring/import-licensed-ships.mjs --fetch --write` reproduces them from the public source mirror. It is optional and never run by the game. Each `.source.json` records texture hashes, changes, measured dimensions and fit limitations. See `authoring/EXTERNAL_SOURCES.md` for research and `assets/licenses/third-party-notices.html` for redistribution credits.

All ship files use right-handed coordinates with counterclockwise fronts: X is longitudinal and positive toward the bow, Y is up, Z is transverse, and the waterline is Y=0. Detailed assets include negative-Y underwater surfaces. Native loading maps positions to Unreal `(X,Z,Y) * 100` centimetres; the handedness change produces Unreal's clockwise front faces. Do not reverse the indices again.

## Validation and release status

`node tools/check-models.mjs` checks registry paths, class/campaign coverage, source metadata, geometry buffers and detailed GLB attributes/materials. `tests/ship-models.test.mjs` also checks metre scale, original versus native winding, the full hull, gun/torpedo arrangement, embedded textures and corrupt-data rejection. Stored-GLB regression checks cover the five detailed ships' bow direction and the actual Float32-centimetre/int16-normal precision used by Unreal. Native `WNT.Ships.DetailedGLB` tests the actual glTFRuntime import, axes, UVs, materials, winding and shared mesh cache; native GPU review and picking checks remain separate evidence from these buffer tests.

Windows Smart App Control no longer blocks this local development setup. Complete realistic fleet replacement and historical approval of every class remain open work. Per-build native GPU and extracted-package verification is recorded in `SYSTEMS-CHECK.md`; model-buffer tests alone do not establish visual quality or package correctness.

Original geometry remains governed by the project owner's `LICENSE.md`. Public-domain historical references and independently licensed texture files retain their own terms. No commercial-game meshes are extracted or redistributed.
