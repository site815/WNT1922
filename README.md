# WNT1922

A naval strategy sandbox with The Treaty System (1922) and In Good Faith (1936), each with seven playable nations.

## Current version

This repository contains the game source and required assets. Portable executable builds are distributed through GitHub Releases.

Open the [latest release](https://github.com/site815/WNT1922/releases/latest) or [release index](https://github.com/site815/WNT1922/releases). See [release notes](RELEASES.md) for the current version.

Version 0.27.0 adds national peace/war music, separate simulation and display workers, faster navigation calculations and a data/logic cleanup. Start a new campaign for beta testing.

## Edit and build

1. Edit the relevant source files below.
2. Double-click **Build.cmd**. It validates the catalogs and assets, then creates the portable EXE and its SHA-256 checksum in `.build/releases/`.
3. Run **Play-WNT1922.cmd** to test it.

The portable build includes its browser engine, simulation, catalogs, maps, music and required notices. Playing requires no installation, separate browser, Node.js or internet connection. Saves are written to `%APPDATA%\WNT1922\saves`. New releases may require a new campaign. The executable is currently unsigned.

Building requires Windows and Node.js 24 or later. The first build downloads pinned, checksum-verified Electron and NSIS tools. Subsequent builds reuse `.build/cache/`. There is no npm install step, transpiler, generated game database, browser copy, installer target or documentation exporter.

For a mechanics change, run the regression suite before distributing:

```powershell
node --test --test-isolation=none --test-skip-pattern="all selectable countries|multi-year campaign" tests/*.test.mjs
```

The two additional long-campaign tests can be run by omitting the skip pattern. `node tools/playthrough.mjs campaign_1922` and `node tools/playthrough.mjs in_good_faith_1936` exercise all seven AI navies through 1950, checking saves and fleet/inventory references every month; append `--resume` to continue a checkpoint. `node tools/check.mjs` checks every live catalog and all 14 opening states. `node tools/check-portable.mjs` tests the packaged executable when the optional Playwright test driver is available; that driver is not shipped.

## Source layout

| Folder | Owns |
| --- | --- |
| [ui](ui/README.md) | Screens, controls, hover details, map animation, audio playback, one stylesheet |
| [catalog](catalog/README.md) | Editable Markdown data: common rules/catalogs, 1922, 1936 hindsight |
| [mechanics](mechanics/README.md) | Shared calculations, simulation systems, legal actions and AI policy |
| [worker](worker/README.md) | Catalog/asset loading, simulation scheduling, snapshots, portable desktop host |
| assets | Maps, soundtrack, provenance, licenses and required runtime sources |
| tests | Regression and architecture checks |
| tools | Validation and the single portable build pipeline |

`.build/` and `test-output/` are disposable local output, excluded from Git. Executables and checksums are distributed only as Release assets. There is no maintained `dist` folder. Git synchronization and release publication are manual. Building never publishes or pushes anything.

To publish when requested, after testing: commit and manually push the source, then run `tools/Publish-Release.ps1`. It uses the existing GitHub sign-in, uploads the EXE and checksum to a draft Release, verifies their hashes, then publishes it. Builds and their metadata remain local until that explicit publication step.

Catalog documents are **the runtime data**, not a description of a separate database. Displayed names and blurbs belong in their data fields. Dynamic orders, damage, resources and player-created designs belong to campaign saves. See [catalog editing](catalog/README.md).

Third-party attribution is available in the game and in [the asset notices](assets/licenses/third-party-notices.html).
