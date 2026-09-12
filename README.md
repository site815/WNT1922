# WNT1922

A naval strategy sandbox with The Treaty System (1922) and In Good Faith (1936), each with seven playable nations.

## Current version

This repository contains the game source and required assets. Portable executable builds are distributed through GitHub Releases.

Version 0.26 adds 15-minute simulation ticks, independent GDP/GTP growth, delivery-based logistics, additive industry expansions, reserve-aircraft retirement and expanded resource explanations. Start a new campaign for these rules.

## Edit and build

1. Edit the relevant source files below.
2. Double-click **Build.cmd**. It validates the catalogs and assets, then creates the portable EXE and its SHA-256 checksum in `dist/`.
3. Run **Play-WNT1922.cmd** to test it.

The portable build includes its browser engine, simulation, catalogs, maps, music and required notices. Playing requires no installation, separate browser, Node.js or internet connection. Saves are written to `%APPDATA%\WNT1922\saves`. New releases may require a new campaign. The executable is currently unsigned.

Building requires Windows and Node.js 24 or later. The first build downloads pinned, checksum-verified Electron and NSIS tools. Subsequent builds reuse `.build/cache/`. There is no npm install step, transpiler, generated game database, browser copy, installer target or documentation exporter.

For a mechanics change, run the regression suite before distributing:

```powershell
node --test --test-isolation=none --test-skip-pattern="all selectable countries|multi-year campaign" tests/*.test.mjs
```

The two additional long-campaign tests can be run by omitting the skip pattern. `node tools/check.mjs` checks every live catalog and all 14 opening states. `node tools/check-portable.mjs` tests the packaged executable when the optional Playwright test driver is available; that driver is not shipped.

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

`.build/`, `dist/` and `test-output/` are disposable local output. They are excluded from Git. Git synchronization remains manual; this workflow does not publish or push anything.

Catalog documents are **the runtime data**, not a description of a separate database. Displayed names and blurbs belong in their data fields. Dynamic orders, damage, resources and player-created designs belong to campaign saves. See [catalog editing](catalog/README.md).

Third-party attribution is available in the game and in [the asset notices](assets/licenses/third-party-notices.html).
