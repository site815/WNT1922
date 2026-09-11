# Release 0.18 validation

Validated 11 September 2026. Version 0.18.0; save format 9. Player saves are excluded from tests and packages.

| Check | Result |
| --- | --- |
| Documented release regression suite | 187 passed, 0 failed; 191.4 seconds |
| Replacement-map campaign references | Both dates have every non-island campaign territory and all seven powers |
| Asset audit | 19 map/music inputs verified; all 15 MP3s match fresh originals by SHA-256 |
| Source catalog consistency | 28 national Markdown catalogs; 150 supplemented classes, 120 aircraft, 341 opening formations |
| Generated UI | 226 pages and 368 class-information panels; no invalid-number placeholders |
| Actual Windows executable | Both campaign dates tested, USA 1936 and United Kingdom 1922 |
| Executable behavior | Sandboxed renderer, map rendering, fleet orders, ship purchases, facility funding, minute simulation, music playback, license window, close/save and reopening passed |
| Independent runtime | Executable tests remove Node and development tools from the child PATH |

Desktop screenshots were inspected. Testing uses isolated user-data folders; funding and construction survive closing and reopening. The initial executable test exposed an ESM startup ordering deadlock. The wrapper now finishes loading its entry module before waiting for Electron's ready event, and both desktop playthroughs pass with that correction.

The regression command follows the established release selection: obsolete migration fixtures and multi-decade soak tests are excluded. No claim is made that every nation was replayed for a year during this packaging update; release 0.17's broader endurance evidence remains historical evidence. No gameplay formulas were changed in this release.

Packaging checks inspect an explicit application allowlist, map provenance, music hashes, version agreement, runtime source archives and required license files, then create a per-file manifest and ZIP SHA-256. The Windows build remains unsigned. This host test is not a clean Windows virtual-machine certification; lower-end hardware and wider tester coverage remain useful.
