# Portable 0.19.0 validation

Validated 12 September 2026 (Asia/Seoul). Save format 11; start a new campaign.

- **201 applicable regression checks passed across the release run and focused reruns.** The initial 199-test run passed 196; three old fixtures needed updates for separate government inventories, the revised aircraft role IDs and charted foreign-port labels. All three passed on rerun. Aircraft diversion and offshore carrier behavior also passed. The documented exclusions remain old-save migration fixtures and unbounded multi-decade tests.
- The final aviation run passed all 23 then-current aviation tests, including a two-week continuous minute simulation with strict aircraft/save validation. The subsequently added offshore-carrier regression also passed. No game minutes are skipped.
- Eight new operational-air checks cover all 14 starting inventories, exact three-year generations with the Japanese exception, deterministic conditions, sectors, assembly, escort/CAP separation, flight/recovery/rearm, date and compatibility gates, missed contacts, remote-strike damage, carrier-loss diversion, separate government losses, actual transport and dated anchorage intelligence.
- All **28 generated national Markdown catalogs** match the current game: **144** supplemental class checks, **624** aircraft entries across both campaigns and **341** opening formations. The [full review](../docs/reviews/catalog-14-starts.html) is regenerated from those data.
- Renderer checks passed **226** page variants and **362** class panels. Actual packaged UI additionally verified read-only government aircraft cards, future-model purchase gates and CAP information.
- Asset audit passed: **19** inputs, **15** music tracks, public-domain political maps and the pinned Electron 44.3.0 runtime/source archives.
- Package verification passed: **287** files, explicit module allowlist, license notices and runtime-source hashes.
- Actual **WNT1922.exe** passed USA / In Good Faith and United Kingdom / The Treaty System checks: no Node on PATH, sandbox isolation, map, selected-fleet CAP, aircraft catalog, fleet orders, ship orders, facility funding, high-speed minute simulation, music, credits, close/save and reopen. The successful final driver recorded **errors: []**. Two earlier driver assertions were corrected for uppercase badge styling and the retained selected-fleet panel; neither was a runtime exception.

The **single-file portable launcher** also passed the full `tools/check-portable.mjs` check on 12 September: USA / In Good Faith and United Kingdom / The Treaty System, embedded runtime with Node removed from PATH, exact hashes of all 287 payload files, fleet orders, funding, minute simulation, music, credits, close/save, temporary-file cleanup and reopening. Four launches across the two campaigns passed with **errors: []**. An initial cleanup issue was fixed by releasing the launcher's working directory before shutdown. No game mechanics changed for this packaging update.

Artifact: `dist/WNT1922-0.19.0-portable-win-x64.exe` (286,775,933 bytes).

SHA-256: `5fad36d8b169862f58408ba1f059a8736bff502bc023aeeea89cbd0af43b2b99`.

Limits: this is a provisional playtest balance, not a claim of complete historical accuracy or an exhaustive multi-decade soak test. Regional weather, representative air generations and other-service establishments are documented abstractions. Requested speed is a ceiling; slower hardware advances more slowly. Night strike operations and strategic bombing are outside this release. [Air rules](../docs/operational-air-warfare.md) · [Release notes](../docs/releases/0.19.0.md).
