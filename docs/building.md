# Building and distributing WNT1922

## Portable Windows download

Distribute **[WNT1922-0.19.0-portable-win-x64.exe](https://github.com/site815/WNT1922/releases/download/v0.19.0/WNT1922-0.19.0-portable-win-x64.exe)**. This is the only tester distribution format. The public release also provides its SHA-256 checksum. Download and double-click the executable; the complete game and runtime are embedded. No installation, administrator rights, Node.js or separate browser is required. Windows 10/11 x64 is supported. The beta is unsigned, so Windows may show an unknown-publisher prompt.

The launcher expands the game into a fresh temporary directory, starts it, waits for normal shutdown, then removes those temporary files. It does not register an installation, create shortcuts or write to Program Files. Allow about 1 GB of free temporary storage. Saves stay in `%APPDATA%\WNT1922\saves`, including a previous-save backup. Replacing or sharing the executable never includes or removes a player's campaign. New beta versions may require a new campaign.

The game uses its bundled Electron runtime and opens in a maximized normal window. It binds a random loopback port and makes no telemetry requests. Play works offline. Renderer Node access is disabled; context isolation, sandboxing and the separate simulation worker remain enabled. External credit links open in the system browser. A normal close waits for the latest campaign snapshot to save; a save error presents an explicit choice before closing.

## Rebuild from source

Use Windows x64, Node.js 24 or newer and PowerShell. No npm install is needed for the game or packaging.

```powershell
node tools/build-game.mjs game/staging
node tools/audit-assets.mjs
$env:WNT_TEST_PUBLIC='game/staging'
node --test --test-isolation=none --test-skip-pattern='old campaign migration|untouched old opening|all selectable countries|multi-year campaign' game/test/*.test.mjs
powershell -NoProfile -ExecutionPolicy Bypass -File tools/Package-Windows.ps1
```

The script verifies the pinned official Electron archive, builds an allowlisted game folder, audits assets and wraps the folder in a single executable with NSIS 3.12. Both tools are pinned by SHA-256. NSIS's launcher and the selected zlib compression module use the [zlib/libpng license](https://nsis.sourceforge.io/Docs/AppendixI.html); the compiler's unmodified license text is in `licenses/NSIS-LICENSE.txt` and embedded in the portable. The compiler itself is not shipped. Electron's component notices and corresponding source archives remain embedded with the game. No license rights are changed by the wrapper.

The intermediate `dist/WNT1922-<version>-win-x64` folder is for assembly and verification. Distribute the resulting **`dist/WNT1922-<version>-portable-win-x64.exe`**; the adjacent `.exe.sha256` records its checksum. `node tools/verify-package.mjs dist/WNT1922-0.19.0-win-x64` verifies the intermediate payload. `tools/Package-Portable.ps1` can rewrap an already verified folder without rebuilding the game.

Install the test-only driver with `npm install --no-save --ignore-scripts --package-lock=false playwright@1.62.1`, then run **`node tools/check-portable.mjs`**. This starts the distributed executable with Node removed from PATH, verifies every extracted payload file, plays both starts, checks saves/reopening and confirms temporary cleanup. Profiles are isolated from real saves. Playwright and the test driver are not shipped. The release suite excludes obsolete save-migration fixtures and separate multi-decade soak runs; see [validation](../game/VALIDATION-0.19.0.md).

Normal builds use committed map JSON. Optional map regeneration needs Python and `tools/map-requirements.txt`; see [map provenance](../game/data/MAP-SOURCES.md). The source checkout can run `Play-WNT1922.cmd` for development. That launcher is not a tester distribution.

## Manual local / GitHub sync

The source repository is public at [site815/WNT1922](https://github.com/site815/WNT1922). Public visibility does not grant an open-source license to original game code or scenarios; third-party materials retain their own terms. Credentials, saves, generated builds, test output, caches and research scans remain ignored.

At each completed major change, review the diff, run the relevant checks, commit the reviewed files and **manually push** them. There are no automatic push hooks, schedules or background sync jobs.

```powershell
git fetch origin
git status -sb
git diff
# Stage only the files belonging to the completed change.
git add README.md
git commit -m "Describe the completed change"
git push origin main
```

If another computer updated `main`, merge or rebase those changes before pushing, preserving local work. Do not force-push to synchronize. Verify `git rev-parse HEAD` matches `git rev-parse origin/main` after a successful push.

For a new tested version, update the game and desktop version files, manually push its tag, then upload the portable executable and checksum to that GitHub release and update the README's direct download link. The Windows Actions workflow tests and builds on a pushed version tag or manual dispatch; it does not push commits or publish release downloads automatically. Its retained build artifact contains only the executable and checksum. GitHub's generated source archives are source checkouts, not playable downloads.
