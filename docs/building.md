# Building and distributing WNT1922

## Windows download

Distribute the complete `dist/WNT1922-0.18.2-win-x64.zip` and its `.sha256` file. Extract the entire folder before opening `WNT1922.exe`. Do not distribute the executable alone: DLLs, resources, licenses and source notices are required. Builds are unsigned until the owner supplies a signing certificate; Windows may show an unknown-publisher prompt.

The application uses its bundled Electron runtime and opens in a maximized normal window. It binds a random loopback port and makes no telemetry requests. Internet access is unnecessary for play. Renderer Node access is disabled, context isolation and sandboxing are enabled, and the simulation worker remains separate from the UI. External credit links open in the system browser.

Saves are stored in `%APPDATA%\WNT1922\saves`, with a previous-save backup. A normal close waits for the latest worker snapshot to save. Closing after a save error requires an explicit choice. Browser-development saves remain in `game/saves`. New releases may require new campaigns; the portable ZIP never contains a player's save.

## Rebuild from source

Use Windows x64, Node.js 24 or newer and PowerShell. No npm install is needed for the game or packaging.

```powershell
node tools/build-game.mjs game/staging
node tools/audit-assets.mjs
$env:WNT_TEST_PUBLIC='game/staging'
node --test --test-isolation=none --test-skip-pattern='old campaign migration|untouched old opening|all selectable countries|multi-year campaign' game/test/*.test.mjs
powershell -NoProfile -ExecutionPolicy Bypass -File tools/Package-Windows.ps1
```

The packaging script downloads a pinned official runtime, verifies its SHA-256, builds from source, audits asset hashes and assembles an explicit allowlist. Output contains a per-file manifest and archive checksum. It recreates only the versioned folder inside `dist`; player saves are never touched. `node tools/verify-package.mjs dist/WNT1922-0.18.2-win-x64` checks an extracted package against its manifest and current source build.

The release suite excludes obsolete save-migration fixtures and multi-decade soak runs, following the established release checks. Endurance runs are separate (`tools/check-long-campaigns.mjs`). For executable UI checks, install the test-only driver with `npm install --no-save --ignore-scripts --package-lock=false playwright@1.62.1` and run `node tools/check-desktop.mjs`; neither Playwright nor npm is included in the game.

Normal builds use committed map JSON. Regenerating maps is optional and needs Python plus `tools/map-requirements.txt`; see [map provenance](../game/data/MAP-SOURCES.md). After a deliberate, reviewed asset change, update the asset manifest and notices. Do not bypass the audit for unexplained hash changes.

## Git and build artifacts

Source, canonical data, reviewed assets and provenance belong in Git. Generated public/staging folders, executable ZIPs, saves, credentials, caches and research scans are ignored. The initial repository is private; no open-source license has been assigned to original game code or scenarios. Third-party material retains its own license.

The Windows GitHub Actions workflow runs tests and assembles an artifact on version tags or manual dispatch. It does not publish a store page or make the repository public. Download the resulting artifact from the Actions run and share the game ZIP with authorized testers. Retain all notices and source material accompanying the package. Update source, desktop and game package versions together before tagging another release.
