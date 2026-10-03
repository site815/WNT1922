# WNT1922

A naval strategy sandbox with The Treaty System (1922) and In Good Faith (1936), each with seven playable nations.

## Native Unreal development

The current working tree uses **Unreal Engine 5.8** for the world, water, ships, lighting, camera, picking and battles. The north-up Equal Earth map wraps by reprojecting geography around the current central meridian, with real elevation geometry and longitude/latitude lines. The transparent CEF interface retains the existing campaign menus and simulation. There is no browser graphics fallback: opening the web page directs you to the native game.

The voxel renderer, cuboid ship renderer and Three.js globe have been retired. Ships use detailed stored GLBs with curved full hulls, equipment, deck fittings, physical materials and embedded textures. Historical exteriors use referenced recognition drawings and photographs; undocumented hull sections and small fittings remain inferred artwork, as disclosed in each source file. Fictional classes and player-designed ship types use original designs. The earlier JSON recognition meshes remain reference data and are **not used as live 3D ship assets**. Missing or damaged external files remain visible as explicit status symbols. Ports use navigation symbols while their scenery is unfinished.

The stable release remains [v0.38.0](https://github.com/site815/WNT1922/releases/tag/v0.38.0). The native development version is `0.45.0-dev`; verified native previews are available under [Releases](https://github.com/site815/WNT1922/releases). Build and verification evidence is recorded in [SYSTEMS-CHECK.md](SYSTEMS-CHECK.md). Native previews are labeled prereleases and do not replace the stable download.

## Play and test locally

Use the single working folder on the Desktop, `WNT1922`.

1. Double-click **Test-Unreal.cmd** (or **Play-WNT1922.cmd**) to run the current native game.
   Choose **3D ship gallery** on the opening screen to inspect the detailed models, orbit them, and read their art credits.
2. After editing C++, run **Test-Unreal.cmd -BuildFirst** to compile, test and package the offline Shipping game before launching. UI and artwork edits are read directly from this workspace.
3. **Build.cmd** runs the native build and tests. `tools/Build-Unreal.ps1 -Package` additionally cooks and stages a Windows distribution.

Test campaigns are stored in `.build/native-test/saves`, separate from existing released-game saves. Each launch has a dated report/profile folder. The launcher requires a completed Shipping package for the current version; it does not fall back to Unreal Editor or an older release. `Test-Unreal.cmd -Automation` creates a fresh disposable profile and runs the native interaction driver; normal testing does not enable its browser debug port. See [native build instructions](unreal/BUILDING.md).

Single-player runs offline. Chromium device discovery and external requests, Unreal online transports, and the development profiling listener are disabled in the player build. The interface and campaign service communicate only on this PC's loopback address. No firewall exception is needed. Reference links remain offline; licenses and credits are included with the assets.

The game opens in a decorated **1800×1000 window**. Resize or maximize it; the minimum client area is 1800×1000 and fullscreen is disabled. A display smaller than that client area plus its Windows frame cannot show the whole window.

Scroll to zoom from the wrapping Equal Earth world to individual hulls. Right drag pans; left click selects and left drag selects owned fleets in a box. The world stays overhead until you use middle-button drag at close ship zoom (32,768× and above). Any zoom out immediately restores north-up. Map zoom stops at 65,536×; Home fits both polar ends inside the visible map, and Page Up / Page Down zoom. Native FPS appears beside the speed selector. Country borders and land-front progress lines follow campaign geography. Fleets stay at campaign route positions with stable metre-based formation stations. Outside engagements, fleet formations and land-front lines show strategic information rather than exact harbor berths. Tactical encounters retain their own individual hull tracks. Own naval hulls and active merchant convoys are selectable; unseen enemy ships are not exposed.

Decisive actions raise an optional **Watch battle** alert. Ongoing battles involving your navy also have animated, clickable map markers. Watching pauses the campaign. New naval encounters record individual hull positions, attacks, damage and losses through the shared tactical engine. **Play recorded movie** follows those observations with a cinematic camera without advancing the campaign. Older aggregate reports retain explicitly illustrative courses; missing observations remain gaps. **Next tick** advances the entire simulation by 15 minutes and pauses again. Minor encounters retain their effects in background attrition. [Battle rules](combatmechanics/campaign-rules.mjs) define the thresholds.

The opening screen has separate **Campaign** and **Tactical Battles** sections; the old automatic demo is removed. Tactical Battles also opens from campaign menu 12 and runs independently of campaign saves. Denmark Strait, Midway and North Cape default to **Historical playback**, with sourced key events and outcomes scripted through the shared combat engine. Historical timestamps identify the milestones; quiet intervals are compressed, and intermediate salvos, ship courses and numerical damage remain approximations. Choose **Free simulation** to vary doctrine, formation, conditions and seed without enforcing history, or create custom fleets of up to 120 catalog hulls per side. Campaign encounters always use free simulation.

Run/pause, single-step 10 seconds, quick resolve, replay and restart use the same combat state. Carrier strikes move as aggregate air groups. Tactical watching and recorded campaign movies play event-timed firing, impact, splash and sinking sounds. **SFX** and volume control the shared sound output; pausing, closing or quick resolution cancels battle sounds. Audio is generated locally and requires no downloads.

Combat advances in fixed **10-second steps** inside the campaign's existing 15-minute ticks. Quick resolution executes the same steps without rendering. Ship AI, weapons, air operations, damage coefficients and campaign adapters live in [combatmechanics](combatmechanics/README.md). Replays retain bounded observations and explicitly identify archive gaps. A port single-click opens its facilities and intelligence panel; double-click centers and zooms. Map wheel events are combined per rendered frame and a standard wheel notch doubles or halves world magnification.

The optional **Tactical 60×** speed gives more time to watch fleet movement. Simulation ticks remain 15 minutes at every speed; no hourly-tick conversion or tick skipping is used. Paused and slow campaigns avoid repeated full-state copies and menu/scene refreshes when no simulation state changed. Small liveness messages keep the worker watchdog active, while adaptive scheduling avoids busy polling between slow ticks.

## Assets and authoring

- [Ship models](assets/models/README.md) live in `assets/models/ships`. Detailed GLB files retain scene geometry, UVs and physically based materials and are loaded directly at runtime. Replacing a model does not require compiling the game.
- [Terrain data](assets/terrain/README.md) supplies geographical relief.
- [Surface materials and lighting](assets/materials/README.md) include the live CC0 HDR environment and archived photographic terrain references. The current map uses geometric relief, vertex colors and normals rather than a photographic land texture; sources, licenses and hashes remain beside the files.
- [Recognition artwork](assets/recognition/README.md) remains available for the historical catalog, panels and hovers. These reference drawings are distinct from the full 3D game models.

The native runtime makes no online asset requests. Models, textures, catalog data and the simulation ship with the game. The MIT-licensed glTFRuntime dependency is pinned under `unreal/Plugins/glTFRuntime`; it loads editable external model files. Attribution is available in the game and [asset notices](assets/licenses/third-party-notices.html).

The 198-model surface pass gives original ships distinct weathered paint, timber or nonslip decks, and canvas textures at a shared physical scale. Bismarck and Samidare retain their artist geometry and UVs with 512-pixel texture derivatives, reducing their decoded texture pixels by 75%. Across the stored fleet, file size fell from 1,457,264,232 to 1,302,339,736 bytes (10.6%) and triangle count from 23,884,969 to 22,319,137 (6.6%), retaining recorded weapon muzzles, full hulls and equipment fits. These asset budgets do not establish runtime frame rate or exact historical reconstruction.

## Verification and distribution

```powershell
node tools/check.mjs
node tools/check-models.mjs
node tools/audit-assets.mjs
node --test --test-isolation=none --test-skip-pattern="all selectable countries|multi-year campaign" tests/*.test.mjs
.\tools\Build-Unreal.ps1
```

Native GPU and interaction checks use `tools/verify-unreal-runtime.mjs` against an explicitly launched Unreal automation instance. The HUD-only smoke test does not verify Unreal rendering. Long campaign checks are available through `tools/playthrough.mjs` for both campaigns.

Native portable archive filenames retain their version, for example `WNT1922-v0.45.0-dev-Unreal-Windows.zip`. A release requires cooking, package testing and visual verification. Building never pushes source or publishes a release. `.build/`, `test-output/`, Unreal binaries and caches are disposable local output excluded from Git.

**0.45.0-dev checkpoint:** final native build, extracted-package, on-screen interaction and visual verification are recorded in SYSTEMS-CHECK.md. Earlier release results do not certify a later working tree.

## Source layout

| Folder | Responsibility |
| --- | --- |
| [unreal](unreal/BUILDING.md) | Native world, ships, water, camera, rendering and input bridge |
| [ui](ui/README.md) | Campaign menus, panels, hovers, native scene input and audio |
| [catalog](catalog/README.md) | Editable runtime campaign definitions and rules |
| [mechanics](mechanics/README.md) | Simulation, calculations, actions and AI |
| [combatmechanics](combatmechanics/README.md) | Shared tactical combat, ship AI, weapons, air groups, presets and campaign adapters |
| [worker](worker/README.md) | Local catalog loading, simulation scheduling and saves |
| assets | 3D models, terrain, textures, historical drawings, music and provenance |
| tests / tools | Regression checks, asset validation and native build tools |

Catalog documents are the runtime data, not a separate generated database. Saved campaigns remain local and are not uploaded to the repository. Install Unreal Engine 5.8, Visual Studio C++ tools, a Windows SDK and Node 24 to continue development on another computer, then follow the native build instructions.
