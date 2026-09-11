# Build 0.8.0 validation — 8 September 2026

## Regression and browser checks

**99 tests passed, zero failures.** The final suite covers opening rosters, levels and year gates, crews and aircraft, submarines and ASW, casualties and recovery, merchant capacity and port trade, national yard availability, scrapping on arrival, repair formations, aggressive combat, typed reports, mandatory alerts, worker command rollback, timing, saves and rendering. Old-save migration is intentionally unsupported. [Regression log](test-output/tests-0.8-release.txt).

**All seven nations in both campaigns** passed isolated Edge/Chromium playthroughs: selection, fleet and ship inspection, mission orders, procurement, paid drafts, funding, reserve/scrap orders, map panning, repeated pause/resume and save/reload. This pass produced **322 layout measurements**, with no browser errors. A final Japan 1936 / United Kingdom 1922 pass added **46 layout measurements** after making pagination respond to window resizing. Resolutions covered are 1920×1080, 2560×1080 and 1366×768. Outer-page overflow was absent; detailed manifests, reports and long records retain scrolling where needed. [All-fourteen report](browser-test-output/all14-result.json), [final layout report](browser-test-output/result.json).

A separate France 1942 fixture with six opposing governments checked port selection, 20× zoom, non-scrolling class hover, individual carrier inspection, expansion/cooldown progress, optional-alert clearing, mandatory decisions and persistent after-action report scrolling. It also verified mission controls fit inside the command panel at 1366×768.

Eight resume/pause cycles at the **100,000× setting** processed **9,129 operational minutes** in that final fixture. The longest measured pause response was **156 ms**, the 95th-percentile animation-frame interval was **8.6 ms**, and the longest browser long task was **51 ms**. These measurements demonstrate responsive controls in the tested workload; they do not guarantee an achieved 100,000× simulation rate. [Detailed check and performance report](browser-test-output/release08-result.json).

Source-level HTML checks additionally passed **268 generated screens and 284 class panels**. All runtime modules pass JavaScript syntax checks. Browser tests use isolated servers and saves, and do not overwrite the player’s campaign.

## Endurance and combat

Both final campaign endurance runs passed **730 days / 1,051,200 operational minutes each**:

| Campaign | Peak formations per nation | Peak contacts | Largest checked save |
|---|---:|---:|---:|
| In Good Faith, 1936 | 25 | 61 | 822,433 bytes |
| The Treaty System, 1922 | 22 | 36 | 495,545 bytes |

Every 30 days, the harness validated saved state, exact minute accounting, aircrew/hangar conservation, merchant-register bounds, economic factors and finite fleet power. Temporary repair and reinforcement formations can exceed the normal twenty-command target. The UI-only resize adjustment does not alter the engine used by these runs. [Both endurance results](long-result-campaign_1922.json).

The seven-navy wartime test passed **90 days / 129,600 minutes**, including **19,728 delayed personnel and aircraft returns**. A separate port campaign passed **30 days / 43,200 minutes**, with **347 port actions** and **4,681.77 gold** spent on safe automatic repairs. [Wartime result](wartime-result.json), [port integration result](port-integration-result.json).

These final endurance and combat runs cover **1,580 simulated days / 2,275,200 minute ticks**, excluding unit tests, short profiling runs and browser sessions. Earlier release tests are not counted as v0.8 results.

## Performance

The final crowded-war benchmark places 140 commands from the opening inventories together, with seven nations at war and 56 convoy packets. It processes ten real seconds of requested demand at each setting, preserving every crossed minute.

| Requested speed | Engine time for ten seconds of demand | Result |
|---|---:|---|
| 2,500× | 0.964 s | Headroom in this fixture |
| 5,000× | 1.381 s | Headroom in this fixture |
| 10,000× | 4.603 s | Headroom in this fixture |
| 50,000× | 19.258 s | Advances below the requested ceiling |
| 100,000× | 27.605 s | Advances below the requested ceiling |

The simulation worker bounds pending work and slows game time under load. Its UI thread continues receiving input and painting; the top bar reports achieved speed. Engine performance varies with campaigns, combat density and computer load. [Benchmark and CPU details](benchmark-result.json).

## Data, documentation and publication

- **28 national Markdown catalogs**, 66 supplemental classes, 120 aircraft records and 341 opening roster rows match compiled campaign data.
- Original schemas validate **119 classes, 158 named hulls, 12 aircraft and 144 equipment SKUs**, with zero errors or warnings. The scenario schema includes country briefings.
- Physical cross-check: **691 fields across 42 sections, zero mismatches**. The prose/aggregate South Dakota section has no field-level coverage.
- Continuity audit: **zero hard issues**. Nine documented advisories remain: eight intentionally unassigned section numbers retained for reference stability, and one known aircraft range-model limitation.
- The **36-port, two-period reference** and seven Treaty System briefings are generated from the runtime/source data and checked for staleness.
- Seven music recordings match their manifest hashes and recorded redistribution licenses.
- **Save format 5 requires a new campaign.** Publication copies the current save to a timestamped pre-0.8 file, rebuilds the local assets and verifies the running release, every static module/style/HTML file, all seven music responses and preservation of the earlier save. [Local publication check](release-0.8.json).

Port capacities, trade weights, combat formulas and production values remain provisional. Land warfare uses strategic corridors, and ports retain the campaign’s opening infrastructure profile. [The release audit](AUDIT-0.8.md) describes fixes, connected systems and proposed gameplay additions.
