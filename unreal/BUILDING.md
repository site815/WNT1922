# Native Unreal build

This is the actual Unreal Engine project, currently `0.40.0-dev`. Ships, terrain, water, lighting, camera and picking use native geometry and rendering; the campaign interface and simulation worker retain the existing game logic. The root Build/Play launchers use this project. The world is a north-up cylindrical terrain surface with fixed shapes, continuous horizontal wrapping and longitude/latitude lines. The strategic camera stays overhead; close inspection gradually permits tilt above 2,048× zoom. The removed voxel and browser globe renderers are not runtime fallbacks.

## Prerequisites

- Unreal Engine **5.8 or newer in the 5.x family**, with the Windows editor and build tools.
- Visual Studio **2022 17.14+ or 2026**, with Desktop/Game Development with C++ and an x64 MSVC toolchain **14.38+**. Epic recommends VS 2026 and MSVC 14.50 for UE 5.8.
- Windows SDK **10.0.22621.0+**, including headers, x64 libraries and the resource compiler. UE 5.8 defaults to 10.0.26100.0.
- Windows x64 **Node.js 24+** for the existing campaign worker and project checks. The native distribution bundles the chosen runtime and its license; players do not install Node separately.

The engine/toolchain minimums follow [Epic's UE 5.8 release notes](https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-8-release-notes). UnrealBuildTool remains the final authority on a particular installed combination.

Run from the main WNT1922 repository:

```powershell
.\tools\Check-Unreal.ps1
.\tools\Build-Unreal.ps1 -Package
.\Test-Unreal.cmd
```

For a custom engine or Node location, these commands accept `-EngineRoot 'D:\Epic\UE_5.8'` and `-NodePath 'C:\Program Files\nodejs\node.exe'`. `WNT_UNREAL_ROOT` is an optional engine override. `Test-Unreal.cmd -BuildFirst` builds and packages Shipping before launching it. Nothing installs or upgrades the tools automatically. `Open-Unreal.ps1` remains available for editor work; `-Game` delegates to `Test-Unreal.ps1` to launch Shipping. Regular play testing uses the Shipping launcher, which omits Unreal's development trace listener.

`Check-Unreal.ps1` is read-only. It checks actual editor/build executables, Visual Studio's C++ component, compiler, SDK files and a working Node executable. An incomplete installation is reported as missing. A passing prerequisite check is not a native compile or visual test.

## Compile, assets and tests

### Repeatable local play testing

Double-click `Test-Unreal.cmd` in the main repository to open the latest successfully packaged Shipping game for the current version. The launcher verifies its executable against the package manifest and uses the main repository's live UI, catalog and artwork. It uses persistent test saves in `.build/native-test/saves`; production saves are never selected. Each launch records its result and isolated user profile under `.build/native-test-<timestamp>-<id>/`; Shipping omits the Unreal development log. Normal play has no CEF debug port. Current verification evidence is listed separately below. If Explorer has no Node on its PATH, the launcher can reuse the installed Codex Node runtime; it does not change PATH or install anything.

Player builds are offline single-player. The campaign Node service binds only `127.0.0.1`; it serves local files and saves without Internet access. UDP/TCP messaging, remote-session/control, online-service and telemetry plugins are disabled. The private browser disables Cast/mDNS discovery, background requests, QUIC and DNS prefetch; its resolver rejects non-loopback names. A fixed local proxy with no direct fallback rejects foreign requests, and the browser allows only the campaign origin and required in-memory resources. Source and credit links remain visible without opening external pages. These are application settings; launchers do not add firewall exceptions or change Windows security settings.

The default and minimum client size is **1800×1000**, in a decorated, resizable window. Maximize is supported; fullscreen and borderless fullscreen requests are rejected. Resizing preserves any larger requested dimensions, including ultrawide sizes. A smaller monitor work area cannot display the minimum client area plus its window frame. Native settings use VSync and a 60 fps render limit; campaign scheduling remains separate from rendering.

```powershell
.\Test-Unreal.cmd -BuildFirst
.\tools\Test-Unreal.ps1 -CheckOnly
.\tools\Test-Unreal.ps1 -SaveDirectory '.build\my-test-campaign'
.\Test-Unreal.cmd -Automation
```

`-BuildFirst` runs compilation, asset preparation, native tests and Shipping packaging before opening the game. `-CheckOnly` checks the selected Shipping package, save isolation, prerequisites and available Windows trust evidence without building or launching Unreal. Custom save directories must stay under this repository's `.build`, with no junctions or symbolic links. `-Automation` creates fresh isolated saves, explicitly enables loopback CEF debugging on port 9333, waits for the native page and runs `verify-unreal-runtime.mjs`. Diagnostic, capture and resize hooks are available in Shipping only when both `-WNTAutomation` and an explicit absolute `-WNTSaveDir` are supplied; the browser debug port has the same gate. Automation renders offscreen to avoid desktop-pointer interference. By default its isolated process stops after the saved campaign is verified; failed disposable runs are also cleaned up. Use `-KeepRunning` for deliberate native art inspection through the opted-in debug port. Normal interactive games stay open. An occupied debug port is rejected; `-DebugPort` can select another port only with `-Automation`. Engine/Node overrides are accepted as in the other scripts.

If Smart App Control blocks this unsigned development build, the manual development choice is **Windows Security → App & browser control → Smart App Control settings → Off**. This is a whole-PC setting, not an exception for WNT1922; it does not switch off Microsoft Defender Antivirus. Only change it when that development tradeoff is intended. After testing, restore **On** if Windows offers it; availability depends on the installed Windows version and policy, so the actual settings UI is authoritative. Developer Mode alone does not establish signing trust, and other Code Integrity policies can still apply. Trusted code signing is the alternative described in [Microsoft's guidance](https://learn.microsoft.com/en-us/windows/apps/develop/smart-app-control/code-signing-for-smart-app-control). The launcher only reads status/events and never changes security settings.

`Build-Unreal.ps1` runs the stored mesh audit and campaign checks, compiles `WNT1922Editor`, prepares missing bootstrap assets through Unreal Python with a real offscreen graphics device, then runs the native `WNT.*` automation tests. Missing tests, failed tests and GPU material compilation failures block packaging. Logs and a machine-readable result are written under `.build/unreal-<timestamp>/`.

Before compilation, `tools/Prepare-OfflineBrowser.ps1` generates the private `unreal/Source/WNTWebBrowser/` module from the developer's licensed Unreal installation and applies the offline browser policy. The generated engine-derived source is ignored by Git and must never be published or copied into GameData or a source release. Only the project's preparation script is tracked. The installed engine folder is unchanged. If an upstream source anchor changes, preparation stops for review rather than silently omitting the offline patch.

`Tools/PrepareAssets.py` creates missing `/Game/Maps/WNTWorld` and materials. The map is empty: the controller spawns the world and camera, and the world actor owns lighting/ocean. Materials are:

| Path under `/Game/Materials/` | Contract |
| --- | --- |
| `M_Ship` | Lit vertex color; `Roughness` .85, `Metallic` .12 |
| `M_Terrain` | Lit vertex color; roughness 1 |
| `M_TerrainSurface` | NASA geographic color, local CC0 photographs and normal/roughness maps, physical detail scale and distance-dependent national tint |
| `M_OceanFar` / `M_OceanDetail` | Dielectric water, matched near/far coverage, animated wave displacement and filtered normals |
| `M_PhotographicSky` | Camera-centered HDR background using the same external sky as ambient lighting |
| `M_Line` | Unlit vertex color |
| `M_Marker` | Unlit `Tint` vector parameter |
| `M_Port` | Lit `Tint` vector parameter; roughness .9 |

Existing assets at these paths are preserved. `Build-Unreal.ps1 -ForceAssets` replaces their material graphs; an existing map is always preserved. `PrepareOceanDetail.py` is called by the main preparation script. Close inspection activates one bounded 37,249-vertex water patch with actual vertical wave displacement; the strategic ocean remains tiled geometry. Wave animation is visual and does not change campaign state or ship navigation. It is not a hydrodynamic sea-state simulation.

Detailed ship models are external, self-contained GLB files under `assets/models/ships`, with embedded PBR textures, UVs and full scene geometry. The pinned MIT glTFRuntime plugin loads them into native static meshes. The current registry contains **198 detailed models**, covering **all 281 campaign/class mappings**, named opening-battle fits and **14 custom/merchant categories (13 original type models plus the Hog Island merchant)**. Earlier JSON recognition files remain reference data and are not loaded as live 3D ship assets. Missing named artwork uses individually selectable amber ? symbols; a failed detailed-model load uses a red ! symbol. Category models are reserved for supported player designs rather than substituted for a missing historical class. Ports use navigation symbols until their scenery is authored. See [the model format and coverage](../assets/models/README.md). Revision checks every two seconds allow stored GLB edits to appear while paused, without a game rebuild; invalid edits retain the last valid same-path detailed mesh when one exists. Sister ships share geometry. Native visibility and distance management limit detailed mesh loading; all campaign models are not loaded simultaneously. External terrain textures and HDR files load at startup. Unreal master-material edits require a new cook for a packaged game.

Historical model records cite drawings and photographs and distinguish measured major dimensions from inferred hull sections, small fittings and dated-fit uncertainty. Full registry coverage does not establish exact shipyard reconstruction or commercial naval-simulator visual quality. Top, broadside and quarter views use the same stored geometry. Terrain and ocean use reusable translated tiles for wrapping; large world surfaces do not cast dynamic shadows, while detailed ships retain local shadows.

Terrain color uses the unchanged 5400×2700 NASA Blue Marble September 2004 image with continuous geographic UVs across longitude wrapping, blended with close-up Poly Haven detail. It represents modern land cover only, not interwar land use, live seasonal conditions or authored harbor scenery. Its source and usage record is `assets/materials/nasa/source.json`; the elevation grid and campaign coast boundaries remain separate inputs.

For native art inspection, launch `Test-Unreal.cmd -Automation -KeepRunning`, then run:

```powershell
node tools/preview-unreal-model.mjs --debug-port=9333 --model=farragut_dd34
node tools/preview-unreal-model.mjs --debug-port=9333 --model=liberty-ec2-sc1
```

This uses the real renderer to capture top, broadside and quarter views and test hull picking, then restores the campaign UI. It requires an explicitly opted-in debug port and never writes campaign state. The Liberty model is a separate art-review candidate, not a substitute for prewar merchants. Captures are evidence for manual art review; successful loading alone never marks visual quality approved.

`tools/verify-unreal-resolutions.mjs` requests actual native viewport resizes and checks native screenshot dimensions, scene/UI alignment, title-battle and campaign hull picking, camera interaction, wrap continuity and stable component counts. Its default matrix is 1800×1000, 1920×1080, 2560×1440, 3840×2160, 2560×1080, 3440×1440 and 5120×2160. It requires a disposable, explicitly opted-in native automation session; use `--allow-existing-test-save` only for a known disposable profile already exercised by the runtime driver. Offscreen Unreal reports a synthetic fullscreen window, so that test verifies the configured windowed policy; physical frame and maximize behavior need a real window check. Temporal capture differences are review evidence, not an automatic proof that flicker is absent. The final matrix rerun remains pending for this checkpoint.

## Native package

```powershell
.\tools\Build-Unreal.ps1 -Package -Configuration Shipping
```

After the required compile, preparation and tests pass, this invokes Unreal's Windows build/cook/stage/archive process. It verifies the CEF browser runtime, stages the campaign files and bundles Node in this layout:

```text
Windows/
  WNT1922.exe
  WNT1922/
    Binaries/Win64/<native game executable>
    GameData/
      ui/ mechanics/ catalog/ worker/ assets/
      Runtime/node.exe
      Runtime/LICENSE.txt
      Runtime/VERSION.txt
      Licenses/UnrealThirdParty/
      Licenses/glTFRuntime-LICENSE.txt
```

The native defaults use `ProjectDir()/GameData` and `GameData/Runtime/node.exe`. Local test launches use the current Shipping binary with `-WNTDataRoot=<main repository>` and `-WNTNode=<local node.exe>`, so UI and artwork changes remain direct. Catalog common/campaign files live inside `catalog/`, which is copied whole. The editable model/terrain/recognition assets are copied whole into the external data directory; they are not synchronized back to the repository by a packaged game.

Packaging first looks for the full `LICENSE` beside the selected Node distribution. If absent, it downloads that exact version's license from the official `nodejs/node` repository. For an offline build, provide `-NodeLicensePath` pointing to the full license from the matching official Node distribution. The packaged application itself makes no such download. Unreal's materials, engine basic shapes and fallback engine materials are explicitly included in cooking because native actors load them by asset path.

The package includes a per-file SHA-256 manifest, the engine's complete third-party notice collection, a versioned `WNT1922-v<version>-Unreal-Windows.zip` and its `.sha256` checksum. Native artifact/report versions come from `Config/DefaultGame.ini`; the UI reads `package.json`, and a mismatch stops the build. Both identify this migration as `0.40.0-dev`; the save format remains version 23. The build records a fingerprint of campaign, asset, C++, plugin and native configuration inputs and rejects source changes during packaging. Building never pushes or publishes and never marks `visualVerified` true automatically. Shipping is the default configuration and is required for player releases; it omits the development trace-control listener while retaining explicitly gated local verification hooks.

Run `tools/Test-UnrealPackage.ps1 -BuildReport <result.json>` to extract and verify a Shipping archive, launch its actual executable with packaged data/Node defaults, and collect native GPU/interaction evidence. It records the executable path, hash, PID, process start and command line, verifies a paused save, and stops its owned offscreen process. Its `package-test.json` initially has `visualVerified: false`; review the native captures before changing that field. `-KeepRunning` preserves the explicit debug session for further inspection. Shipping verification relies on native diagnostics and captures rather than the omitted development log.

Publication is a separate explicit operation through `tools/Publish-Release.ps1 -BuildReport <result.json> -PackageTestReport <package-test.json> -ReleaseNotes <notes.md>`. It requires committed and pushed source, a matching native source fingerprint and archive checksum, plus successful testing of a fresh Shipping extraction. The package-test report identifies `kind: "extracted-native-package"`, `version`, `archiveSha256`, `extractedDirectory`, the successful `nativeRuntimeReport`, `passed: true`, `visualVerified: true`, and `checksPassed` containing `launch`, `campaignStart`, `shipSelection`, `battleWatch`, `saveReload`, `offlineAssets` and `loopbackOnly`. It must also reference a passing `networkReport` for the tested game/process family and a fresh passing `normalNetworkReport` for the same extracted executable, observed for at least 15 seconds with automation and browser debugging disabled. `tools/verify-unreal-network.ps1` checks exact process identities and descendants; normal play permits only the campaign sidecar's loopback listener and no UDP. Its report states the limits of sampled endpoint observation. Record these claims only after observing the checks and reviewing native GPU captures. An editor-game report alone is insufficient. Every extracted payload file is checked against the archive's embedded manifest before network publication. `-DraftOnly` keeps the verified upload unpublished.

The publisher rejects a ZIP of **2 GiB or larger** before creating a draft or uploading, using its actual file size. This follows [GitHub's per-asset limit](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases). A replacement archive must be built and tested again; a size estimate does not satisfy this check.

This migration is published as a Shipping prerelease and does not replace the stable release. Preview notes must distinguish current model coverage from historical-fit and visual-quality limitations, and identify unfinished port scenery. A passing model audit alone cannot authorize publication. The historical Development evidence below describes the earlier implementation and its former diagnostic policy.

## Current verification checkpoint — 0.40.0-dev

The final stored fleet registry contains 198 detailed models, 281/281 detailed campaign/class mappings and 14 custom/merchant categories: 13 original type models plus the historical representative Hog Island merchant (`test-output/detailed-fleet-registry.log`). The focused model suite passed **12/12 checks**, with no failures or skips (`test-output/detailed-fleet-tests.log`). It verifies coverage, metre-scale hull geometry, recorded weapon muzzles and counts, UV/material data, source hashes, winding, the École torpedo-boat fit and corrupt-buffer rejection.

The selected JavaScript regression passed **424/424 checks**, with no failures or skips (`test-output/release40-final-js-tests.log`); the established long-campaign patterns remain excluded. Catalog validation and the complete asset/attribution audit also pass (`test-output/release40-check.log` and `test-output/release40-assets-audit.log`). No new long-campaign endurance result is claimed.

Physical window verification passed **58/58 checks** in `.build/physical-package-20260930-162118/verification/window-policy.json`. The staged Shipping game opens at an actual 1800×1000 client on the current 3840×1600 monitor at 200% DPI. Minimum enforcement, larger resize, maximize and restore pass. F11 and Alt+Enter leave the decorated window windowed. This is actual Win32 evidence, distinct from the offscreen viewport matrix, and is limited to the tested monitor/DPI and targeted window key-message path.

Final native compilation and Shipping packaging pass, with **25/25 native tests** (23 successes and two successes with warnings), in `.build/unreal-20260930-161651-412/result.json`. The seven-size native GPU rerun, manual native visual approval and fresh extracted-package interaction/network verification are **pending at this checkpoint**. [SYSTEMS-CHECK.md](../SYSTEMS-CHECK.md) keeps current evidence separate from earlier releases.

## Historical verification — 0.39.0-dev

The following reports and archive hash belong to the earlier five-model preview. They do not certify the current cylindrical terrain, window policy, complete model registry or `0.40.0-dev` package.

On 30 September 2026 the native Editor module compiled with Unreal 5.8.3, VS 2026/MSVC 14.51 and the Windows SDK. `.build/unreal-20260930-122126-351/result.json` records compilation, asset preparation and successful **Development** packaging. Its `automation/index.json` records **15/15 native tests passed**: 13 successes and two successes with warnings, with no failures. Tests cover the Equal Earth projection, geographic boundaries/elevation and surface UVs, camera behavior, observed routes, real campaign bootstrap, detailed model import/scale and surface collision, pending-art selection identity, upright navigation symbols, and bounded ocean geometry with continuous wave/noise coordinates.

The JavaScript regression suite passed **417/417 checks**, with no failures or skipped checks (`test-output/native-final-js-tests.log`). The HUD protocol/layout run also passed (`test-output/native-final-hud.log`), including opening-screen scroll/viewport alignment, transparent scene apertures, input and selection callbacks, save-on-close, narrow layout and native launch guidance. That HUD run uses a mocked native bridge and does not exercise the GPU renderer. These checks do not establish a new long-campaign endurance result.

The 30 September asset audit passed (`test-output/asset-audit.json`). The registry contains **five detailed GLB assets and 179 retained JSON reference files**, with **one detailed campaign class mapping and 280 pending mappings**. JSON recognition geometry is not used by the live renderer. Farragut supplies the detailed class mapping and Hog Island Type A the explicit representative merchant model; Liberty, Bismarck and Samidare have art-review roles, with Bismarck also used by its matching opening demonstration. Unfinished ship classes and port scenery use navigation symbols. **Full realistic asset replacement remains unfinished**, and a preview release must disclose this coverage.

Fresh extraction of the Development archive passed **8/8 live native runtime checks**. `.build/native-package-test-20260930-122413-669-7ff6c8/package-test.json` records `passed: true` and `visualVerified: true`, using the packaged data and Node defaults. Its `runtime/result.json` covers the opening battles, all five gallery models, campaign start, camera input, exact warship/merchant surface selection, paused save/reload/Continue and native-renderer isolation. A real decisive campaign engagement verifies the optional alert, native battle selection, exactly 15 minutes per live Next tick, read-only recorded replay and close-paused behavior. No JavaScript/native bridge errors or external requests were observed; the native log contains zero native errors and zero texture errors.

Manual review of actual native GPU captures confirms the five detailed models, strategic terrain, merchant formation, upright pending-art symbols and campaign battle display their geometry and materials without default checkerboards. The scoped glTFRuntime patch keeps non-streamed generated mip chains resident instead of marking them as nonexistent external bulk-file payloads; its provenance and hash are recorded in `Plugins/glTFRuntime/WNT-UPSTREAM.json`. Visual approval is recorded by the separate package-test report, not automatically by the build script. It approves this explicitly incomplete Development preview, not all historical fits, fleet coverage or Shipping performance.

The verified archive is `WNT1922-v0.39.0-dev-Unreal-Windows.zip`, 1,148,335,233 bytes, SHA-256 `b4fe2f1b3614b5806b016c2e3c4fbf3070b319c6b054c92eb497be85802708d3`. Its native source fingerprint is `cc5c611294ccbda3cc30172aba2f72d4076ef00017f582cd911fdf7e92f5c311`. This is a **Development prerelease candidate**. Publication remains a separate step and is not claimed by this verification checkpoint.

Windows previously blocked the unsigned `UnrealEditor-WNT1922.dll` with error 4551 and Code Integrity events 3033/3077. The user switched Smart App Control off for local development; its state was verified as off, and the native tests then ran successfully. This local choice does not sign the game or establish trust on another PC. See [Microsoft's signing guidance](https://learn.microsoft.com/en-us/windows/apps/develop/smart-app-control/code-signing-for-smart-app-control). Build tools preserve Windows security settings. Unused Fab/Bridge marketplace and Android file-server plugins are disabled for this offline Windows project.

For a local runtime test, launch the development editor-game with `-WNTAutomation -cefdebug=9333 -WNTSaveDir=<isolated test folder>`, in addition to the normal data/Node arguments. Then run `node tools/verify-unreal-runtime.mjs --debug-port=9333`. It requests real Unreal screenshots and records actual native ray picks; its separate CEF screenshots show only HTML. The diagnostic and screenshot hooks are opt-in and excluded from Shipping. `tools/verify-unreal-hud.mjs` uses a mocked native bridge and does not establish GPU correctness.
