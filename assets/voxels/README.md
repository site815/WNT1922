# Editable voxel ships

The game loads the prebuilt files in `ships/` directly. Change a JSON file and reopen the game through **Play-WNT1922.cmd**; no model export, atlas, package compilation or asset-generation command is required. The repository launcher supplies this folder to the local host as a data-only override; it accepts JSON and Markdown, confines resolved paths to this folder, and serves no executable code from it. A standalone portable release bundles the same files in its game assets. Shipping changed assets to other computers requires a new portable distribution.

For version 0.38, the collection contains **181 model files: 167 authored class variants and 14 generic type fallbacks**. `ships/index.json` maps each campaign's class ID to a model. It covers the opening legacy fleets as well as procurement designs. The Courageous battlecruiser in 1922 and its later carrier conversion have separate model files. Mapped catalog classes use their authored files; `generic/` supplies fallbacks for custom or otherwise unmodeled designs.

The `AK` fallback, `generic/merchant-freighter.json`, is also the representative model for individual merchant hulls displayed in convoy formations. Its cargo-steamer dimensions and fittings are illustrative, independent of a convoy's aggregate GRT; it does not claim to reproduce a named historical merchant ship.

Each model is an original, stylized interpretation. Historical classes link to the existing historical recognition reference and its configuration. Original surface warships reuse the equipment stations from their shared-geometry recognition drawings where available. Cuboid hull contours, heights and omitted fine fittings are illustrative; these files are not engineering plans. The model's `dimensionBasis` identifies catalog measurements, recognition-drawing dimensions or estimates. Existing licensed drawings are not altered or embedded in the new models.

The 3D globe and battle viewer turn these cuboids into real Three.js mesh geometry at runtime. Zooming, rotating and tilting the camera show the same physical model from different angles; no sprite export or additional model build is required. The existing recognition artwork and its shared-geometry top and side drawings remain separate, unchanged assets with their existing reference information.

All 3D views of a ship come from its one geometry. A part is a colored cuboid:

```json
{"x": 10, "y": 0, "z": 5, "w": 8, "d": 6, "h": 3, "color": "#9ca7a5", "role": "bridge"}
```

- Coordinates and dimensions are in metres. The bow points toward positive `x`; `y` is transverse; `z` is height above the displayed waterline.
- `x` and `y` locate the horizontal center; `z` locates the bottom. `w` is longitudinal length, `d` is beam and `h` is height.
- `dimensions` bounds the complete model. Keep every part within it. Hull slices create a stepped bow and stern without a separate mesh or texture export.
- `role` names the part for validation and editing. Main turrets also store `barrels`; each visible barrel is its own `main-barrel` part. Carrier decks, torpedo tubes, funnels, bridges and submarine towers have distinct roles.
- Colors are six-digit hex values. All files are local JSON data; scripts, external assets and material URLs are not supported.
- There are at most 512 parts per model. Loading uses eight concurrent requests, then cached model lookups; refreshing rereads the files with `cache: no-store`.

Run `node tools/check-voxels.mjs` after editing. It checks every catalog mapping, legacy fleet coverage, dimensions, finite cuboids, provenance, main gun counts and the campaign carrier conversion. `node tools/audit-assets.mjs` includes the same check. The renderer and battle viewer share the same model collection.

These new models are original project artwork under the project's root `LICENSE.md`. References retain their independently documented licenses in the recognition registries.
