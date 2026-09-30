# Native 3D ship assets

`ships/index.json` maps stored model records to 281 campaign/class entries and identifies additional asset-review models. Run the audit below for current counts. Unreal loads registered detailed GLBs directly from this directory; changing a stored GLB does not require rebuilding or cooking the game. Self-contained GLB 2.0 files are the format for detailed artwork. The native loader checks each model's file revision periodically and shares the loaded mesh between instances.

Every campaign class has a stored detailed GLB, including capital ships, carriers, cruisers, destroyers, submarines, the École 600-ton torpedo boat and fleet oilers. The opening battles have named ship models, with dated fits where documented; the licensed Bismarck artist model has no verified precise fit or camouflage date. Original category models cover player-designed ships, and the Hog Island merchant represents civilian cargo vessels. Earlier stylized JSON recognition files remain as reference records, **not active 3D ship assets**. The new exporter creates independent continuous hulls and detailed equipment from explicit dimensional specifications; it never converts or imports the former voxel meshes. `node tools/check-models.mjs` reports the exact current registry counts.

A missing named historical model is never silently replaced by an unrelated category ship. An amber ? navigation symbol indicates unavailable artwork; a red ! indicates a failed detailed-model load. Original category artwork is used only for supported player-designed hulls. Port scenery still uses navigation symbols where artwork is absent.

Historical source drawings establish major dimensions and arrangements where available. Each companion `.source.json` identifies the fit, references, inferred body sections and small fittings, and any intelligence-source or date uncertainty. These are original exterior reconstructions, not surveyed shipyard models or a claim of commercial naval-simulator art quality. Neutral paint does not reproduce every temporary camouflage or refit. Fictional campaign classes and player-design category models are explicitly original concepts.

## Detailed original models

The first replacement is `ships/usa/farragut_dd34.glb`, the Farragut class in its original five-gun fit. Its independent authoring source is `authoring/farragut-1934.json`; `authoring/build-farragut.mjs` builds its hull and fittings without reading the earlier model geometry. It includes a full underwater hull, deck sheer/camber, raised decks, shielded forward and open aft gun mountings, two unequal funnels, eight torpedo tubes, bridge glazing, masts and stays, deck rails, ladders, boats, davits, anchors, ventilation fittings, shafts, screws and rudder. One shared 3D model supplies all views.

The overall dimensions and major equipment layout follow NHHC's DANFS entry and the public-domain historical recognition drawing listed in the companion `.source.json`. Body sections and many small fittings are inferred reconstruction, explicitly identified there; the asset is not an exact shipyard reconstruction. The file currently contains 93,280 triangles, eight PBR material sections and three embedded textures. Triangle count alone does not establish visual quality: native GPU inspection is also required.

The gray painted surfaces use physically scaled UVs, original neutral paint color, and Rob Tuytel's CC0 **Blue Metal Plate** OpenGL normal and packed occlusion/roughness/metalness maps from Poly Haven. The blue diffuse map is not used. Painted areas have zero metallic reflectance; exposed steel and brass have separate materials. Source URLs, licenses and file hashes are under `textures/blue_metal_plate/source.json`. Original paint texture authoring is under `authoring/build-naval-surfaces.mjs`.

## Editing and authoring

Edit the stored GLB in a 3D editor and export it back to its registered path. Keep all textures embedded, include normals and UVs, use metre units, and retain the companion source/fit attribution. Unreal does not need a new game build for this edit. The optional original-authoring commands are:

```powershell
node assets/models/authoring/build-farragut.mjs --write
node assets/models/authoring/build-clemson.mjs --write
node assets/models/authoring/build-detailed-fleet.mjs --write
node assets/models/authoring/register-detailed-fleet.mjs
node tools/check-models.mjs
node --test tests/ship-models.test.mjs tests/detailed-fleet.test.mjs
```

Running an authoring exporter replaces that model's stored mesh and would overwrite later hand edits. The game never invokes these commands. `authoring/authored-mesh.mjs` provides shared original-geometry and GLB writing utilities, independent of the removed browser renderer. Use separate class specifications and source-backed geometry rather than scaling a generic vessel and presenting it as another historical class.

The fleet exporter reads `authoring/fleet-specifications.json` and merges reviewed class records from `fleet-fit-overrides.json` (carriers and submarines), `capital-fit-overrides.json`, `surface-fit-overrides.json` and `additional-fleet-specifications.json` (original category and additional demonstration fits). Each record specifies its hull sections, superstructure and equipment stations. Optional `--only=class-id,another-id` limits an export. The dimensional migration script is an authoring aid, not a runtime step; historical review overrides remain separate and authoritative. `create-additional-fleet-specifications.mjs` reproduces the original category and three additional cruiser specifications.

Hull lofts, turret bodies, each barrel and tube mouth, open gun shields, catapults, boat decks, boats/davits, masts, rails, fittings and underwater machinery are stored as actual geometry. The oiler family uses access domes, manifolds, pipelines, hose reels and raised walkways over below-deck liquid tanks. Carriers distinguish islands, open or enclosed hangars, elevators and dated exhaust arrangements. Original surface maps are embedded from `textures/naval-paint/`; existing independently licensed artist and surface assets retain their separate credits. Exact vertex indexing removes duplicate position/normal/UV records without removing triangles or merging hard edges.

Two licensed artist assets are also stored for native review: Bismarck and Samidare by everlasting17th, CC-BY-4.0. Their geometry, original UVs and embedded surface images are retained; the scene hierarchy is baked, centered and uniformly scaled to the reference hull length. No matching campaign class exists, so these are specific historical assets rather than replacements for unrelated ships. `authoring/licensed-ships.json` pins source URLs and hashes; `node assets/models/authoring/import-licensed-ships.mjs --fetch --write` reproduces them from the public source mirror. It is optional and never run by the game. Each `.source.json` records texture hashes, changes, measured dimensions and fit limitations. See `authoring/EXTERNAL_SOURCES.md` for research and `assets/licenses/third-party-notices.html` for redistribution credits.

All ship files use right-handed coordinates with counterclockwise fronts: X is longitudinal and positive toward the bow, Y is up, Z is transverse, and the waterline is Y=0. Detailed assets include negative-Y underwater surfaces. Native loading maps positions to Unreal `(X,Z,Y) * 100` centimetres; the handedness change produces Unreal's clockwise front faces. Do not reverse the indices again.

## Validation and release status

`node tools/check-models.mjs` checks registry paths, class/campaign coverage, source metadata, geometry buffers and detailed GLB attributes/materials. `tests/ship-models.test.mjs` also checks metre scale, original versus native winding, the full hull, gun/torpedo arrangement, embedded textures and corrupt-data rejection. `tests/detailed-fleet.test.mjs` verifies every campaign and opening-battle mapping, measures the actual hull body independently of protruding guns/sponsons, and finds every recorded weapon muzzle in the real GLB buffers. It checks fitted weapon counts against source metadata, underwater draft, outward hull normals, textures, hashes and bounded file size. The École boat has six geometric torpedo mouths, no reloads and the catalog's 12-man complement.

Native `WNT.Ships.DetailedGLB` tests the actual glTFRuntime import, axes, UVs, materials, winding and shared mesh cache. `tools/review-fleet-geometry.mjs` provides optional top/broadside/quarter contact sheets of the stored files for geometry comparison. That authoring view does not replace Unreal GPU/material, selection or packaged-game testing.

Windows Smart App Control no longer blocks this local development setup. Per-build native GPU and extracted-package verification is recorded in `SYSTEMS-CHECK.md`; model-buffer tests alone do not establish visual quality, exhaustive historical approval or package correctness. Inferred hull sections and minor wartime fit details remain documented limitations even when registry coverage and geometry validation pass.

Original geometry remains governed by the project owner's `LICENSE.md`. Public-domain historical references and independently licensed texture files retain their own terms. No commercial-game meshes are extracted or redistributed.
