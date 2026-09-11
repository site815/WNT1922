# Desktop runtime sources

This build uses the official Electron **44.3.0** Windows x64 binary without changes to its libraries. `electron.exe` is renamed `WNT1922.exe`. Its dynamically loaded `ffmpeg.dll` remains separate and replaceable; no restriction is imposed on modification or reverse engineering needed to exercise the library's license rights.

Preserve `LICENSE`, `LICENSES.chromium.html` and the `runtime-sources` directory with every distributed build. These component licenses are independent of the WNT1922 game license.

The `runtime-sources` directory includes the exact FFmpeg source tree and the Electron source tree, including Electron's FFmpeg patch and build configuration. The archives are pinned by SHA-256 in `desktop/source-lock.json` (also copied into this directory). The Chromium Windows FFmpeg configuration has `CONFIG_GPL=0` and `CONFIG_NONFREE=0`; LGPL 2.1 or later applies to FFmpeg. Its full license text is included inside the FFmpeg archive and the runtime's combined notices. The only Electron FFmpeg patch in this revision adjusts the macOS loader path; it is included in the Electron archive, even though this package targets Windows.

| Component | Exact version / source |
| --- | --- |
| Electron | [44.3.0](https://github.com/electron/electron/tree/v44.3.0) |
| Chromium | [152.0.7977.78](https://chromium.googlesource.com/chromium/src/+/152.0.7977.78) |
| Node.js | [v24.20.0](https://github.com/nodejs/node/tree/v24.20.0) |
| Chromium FFmpeg | [2b68d2babae73714846961fb0ee47e3b3d2e39a9](https://chromium.googlesource.com/chromium/third_party/ffmpeg/+/2b68d2babae73714846961fb0ee47e3b3d2e39a9) |

For a full runtime rebuild, follow the [Electron Windows build instructions at this release](https://github.com/electron/electron/blob/v44.3.0/docs/development/build-instructions-windows.md). Check out the Electron tag `v44.3.0`; its `DEPS` file pins Chromium and Node, and Chromium's `DEPS` pins the other component sources. Run the documented dependency sync and patch steps before building. For an individual FFmpeg rebuild, use the archived `BUILD.gn`, `chromium/config/Chromium/win/x64` configuration and its documented build tooling within that matching Chromium checkout. The Electron archive includes its GN configuration and patch set. No WNT1922 modifications need to be applied to these libraries.

The runtime's combined notices cover several platforms and optional components; their presence in that document does not mean every listed component is used by this Windows build. Their source locations and license text are preserved in that document. Do not remove third-party notices or accompanying source archives when repackaging the game.
