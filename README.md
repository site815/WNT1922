# WNT1922

A naval strategy sandbox with The Treaty System (1922) and In Good Faith (1936), each with seven playable nations.

## Native Unreal development

The current working tree uses **Unreal Engine 5.8** for the world, water, ships, lighting, camera, picking and battles. The map is a north-up cylindrical terrain surface with continuous horizontal wrapping, real elevation geometry, and longitude/latitude lines. Its shapes stay fixed while scrolling. The transparent CEF interface retains the existing campaign menus and simulation. There is no browser graphics fallback: opening the web page directs you to the native game.

The voxel renderer, cuboid ship renderer and Three.js globe have been retired. Ships use detailed stored GLBs with curved full hulls, equipment, deck fittings, physical materials and embedded textures. Historical exteriors use referenced recognition drawings and photographs; undocumented hull sections and small fittings remain inferred artwork, as disclosed in each source file. Fictional classes and player-designed ship types use original designs. The earlier JSON recognition meshes remain reference data and are **not used as live 3D ship assets**. Missing or damaged external files remain visible as explicit status symbols. Ports use navigation symbols while their scenery is unfinished.

The stable release remains [v0.38.0](https://github.com/site815/WNT1922/releases/tag/v0.38.0). The native development version is `0.40.0-dev`; build and verification evidence is recorded in [SYSTEMS-CHECK.md](SYSTEMS-CHECK.md). Native previews are labeled prereleases and do not replace the stable download.

## Play and test locally

Use the single working folder on the Desktop, `WNT1922`.

1. Double-click **Test-Unreal.cmd** (or **Play-WNT1922.cmd**) to run the current native game.
   Choose **3D ship gallery** on the opening screen to inspect the detailed models, orbit them, and read their art credits.
2. After editing C++, run **Test-Unreal.cmd -BuildFirst** to compile, test and package the offline Shipping game before launching. UI and artwork edits are read directly from this workspace.
3. **Build.cmd** runs the native build and tests. `tools/Build-Unreal.ps1 -Package` additionally cooks and stages a Windows distribution.

Test campaigns are stored in `.build/native-test/saves`, separate from existing released-game saves. Each launch has a dated report/profile folder. The launcher requires a completed Shipping package for the current version; it does not fall back to Unreal Editor or an older release. `Test-Unreal.cmd -Automation` creates a fresh disposable profile and runs the native interaction driver; normal testing does not enable its browser debug port. See [native build instructions](unreal/BUILDING.md).

Single-player runs offline. Chromium device discovery and external requests, Unreal online transports, and the development profiling listener are disabled in the player build. The interface and campaign service communicate only on this PC's loopback address. No firewall exception is needed. Reference links remain offline; licenses and credits are included with the assets.

The game opens in a decorated **1800×1000 window**. Resize or maximize it; the minimum client area is 1800×1000 and fullscreen is disabled. A display smaller than that client area plus its Windows frame cannot show the whole window.

Scroll to zoom smoothly from the world to individual hulls and drag to pan. The strategic view stays overhead; right-drag or Shift-drag opens tilt gradually above 2048× zoom for ship inspection. Battles and the gallery allow orbiting. Home returns to the strategic view; Page Up / Page Down zoom. Fleets stay at authoritative campaign route positions with stable metre-based formation stations. The campaign does not record individual tactical tracks or exact harbor berths, so formation stations are representative. Own naval hulls and active merchant convoys are selectable; unseen enemy ships are not exposed.

Decisive actions raise an optional **Watch battle** alert. Watching pauses the campaign. **Next tick** advances the entire simulation by 15 minutes and pauses again; earlier recorded frames replay without changing state. Minor encounters retain their effects in background attrition. The opening battle demonstrations are labelled scripted illustrations. [Battle rules](catalog/common/rules/battle-stages.md) define the thresholds.

## Assets and authoring

- [Ship models](assets/models/README.md) live in `assets/models/ships`. Detailed GLB files retain scene geometry, UVs and physically based materials and are loaded directly at runtime. Replacing a model does not require compiling the game.
- [Terrain data](assets/terrain/README.md) supplies geographical relief.
- [Photographic materials](assets/materials/README.md) combine NASA Blue Marble September 2004 geographic color with local CC0 surface detail and HDR sky lighting. The modern land-cover image is background geography, not interwar or harbor reconstruction; sources, licenses and hashes are recorded beside the files.
- [Recognition artwork](assets/recognition/README.md) remains available for the historical catalog, panels and hovers. These reference drawings are distinct from the full 3D game models.

The native runtime makes no online asset requests. Models, textures, catalog data and the simulation ship with the game. The MIT-licensed glTFRuntime dependency is pinned under `unreal/Plugins/glTFRuntime`; it loads editable external model files. Attribution is available in the game and [asset notices](assets/licenses/third-party-notices.html).

## Verification and distribution

```powershell
node tools/check.mjs
node tools/check-models.mjs
node tools/audit-assets.mjs
node --test --test-isolation=none --test-skip-pattern="all selectable countries|multi-year campaign" tests/*.test.mjs
.\tools\Build-Unreal.ps1
```

Native GPU and interaction checks use `tools/verify-unreal-runtime.mjs` against an explicitly launched Unreal automation instance. The HUD-only smoke test does not verify Unreal rendering. Long campaign checks are available through `tools/playthrough.mjs` for both campaigns.

Native portable archive filenames retain their version, for example `WNT1922-v0.40.0-dev-Unreal-Windows.zip`. A release requires cooking, package testing and visual verification. Building never pushes source or publishes a release. `.build/`, `test-output/`, Unreal binaries and caches are disposable local output excluded from Git.

## Source layout

| Folder | Responsibility |
| --- | --- |
| [unreal](unreal/BUILDING.md) | Native world, ships, water, camera, rendering and input bridge |
| [ui](ui/README.md) | Campaign menus, panels, hovers, native scene input and audio |
| [catalog](catalog/README.md) | Editable runtime campaign definitions and rules |
| [mechanics](mechanics/README.md) | Simulation, calculations, actions and AI |
| [worker](worker/README.md) | Local catalog loading, simulation scheduling and saves |
| assets | 3D models, terrain, textures, historical drawings, music and provenance |
| tests / tools | Regression checks, asset validation and native build tools |

Catalog documents are the runtime data, not a separate generated database. Saved campaigns remain local and are not uploaded to the repository. Install Unreal Engine 5.8, Visual Studio C++ tools, a Windows SDK and Node 24 to continue development on another computer, then follow the native build instructions.
