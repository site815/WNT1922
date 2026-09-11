# Build 0.9.0 validation — 8 September 2026

## Automated regression suite

**106 tests passed, zero failures.** The suite covers simulation clocks, worker commands, saves, resources, crew and aircraft, combat, alerts, construction, ship staffing, ports and the new Pacific rules. New cases exercise real-war activation in both campaigns, no historical catch-up, local landing cover, shipping shortages, persistent occupation during counterattack, ceasefires, island routing, battle-audio priority and overloaded yard graphics. [Final regression log](test-output/release09-unit-final.txt).

## Browser playtests

- **All 14 nation/campaign combinations passed** in headless Microsoft Edge with disposable saves: starting, resuming, fleet inspection, ship drafts, facility funding, navigation, save/reload and viewport checks. There were **322 layout observations and zero browser errors**. [All-nation results](browser-test-output/release09-all14-result.json).
- The focused interaction test covered **1366×768, 1920×1080 and 2560×1080**. Equal aircraft selectors and facility heights, equal resource grid columns, vertically centered auto-pause, 36-pixel controls bar and compact resource bar were measured. Command, shipyard catalog, diplomacy and ship-register screens had no vertical overflow in this fixture. Longer expandable material keeps its scroll containers. [Interaction results](browser-test-output/release09-result.json).
- A battle report stayed open at the same **450-pixel scroll position**, with calculations expanded, while the real worker ran at the 100,000× setting and the source report was evicted from the 80-entry recent history. The test confirmed synthesized battle audio was scheduled, a visible overload segment existed, suggested design preview cost no gold, and fleet selection centered the chart.
- Maximum zoom reached **64×**, retained all 44 port markers, and used non-scaling text outlines. Front animation was checked while running. [Maximum-zoom screenshot](browser-test-output/release09-zoom64.png), [report screenshot](browser-test-output/release09-report.png), [facilities screenshot](browser-test-output/release09-facilities-1920.png).

The 100,000× value is a requested rate. The worker retains its bounded workload and slows safely under load; these checks do not claim every computer sustains the target speed.

## Extended simulation

| Run | Game days | One-minute ticks | Result |
|---|---:|---:|---|
| Seven-navies-at-war integration | 90 | 129,600 | Periodic save validation; 19,653 personnel/aircraft recoveries exercised |
| In Good Faith Pacific war | 180 | 259,200 | Captures and counterattacks from actual opening ports |
| The Treaty System Pacific war | 180 | 259,200 | Early-war island captures; major objectives took longer |
| Total | **450** | **648,000** | No simulation or save-validation failures |

The Pacific runs use ordinary starting resources and formations, with Japan and the USA at war and their surface forces assigned reconnaissance patrols. Fleets navigate, replenish and fight through the normal minute simulation; they are not placed beside targets. In the 1936 run Guam and Wake changed control early; the USA later took Kwajalein and Saipan. In 1922 Japan took Guam and Wake before progressing to Midway. This is a deterministic playtest sample, not a guarantee of identical campaign outcomes. [Pacific results](test-output/pacific-result.json), [wartime results](wartime-result.json).

## Data consistency

- Source rendering: **268 screens and 284 class overlays**, with no undefined or non-finite output.
- All **28 national Markdown catalogs** regenerated and checked: 66 class checks, 120 aircraft checks and 341 roster checks.
- **44 ports, two opening periods and seven national briefings** generated from canonical source data; stale-document check passed.
- Scenario/platform/equipment schema validation: **119 classes, 158 named hulls, 12 aircraft and 144 component SKUs; zero warnings**. [Schema log](test-output/release09-schema.txt).
- **691 field comparisons across 42 source sections; zero mismatches.** [Crosscheck](test-output/release09-crosscheck.txt).
- Content audit: **zero hard issues**. Nine pre-existing advisories remain: eight deliberately preserved equipment-number gaps and the documented performance model limit for slow fixed-pitch aircraft. [Audit log](test-output/release09-audit.txt).

## Local release

Save format **6** requires a new campaign. Publication makes a timestamped copy of the previous campaign, verifies the copy, restarts only this project's local server and checks the published bytes of each module, stylesheet, HTML file and music track. [Publication evidence](release-0.9.0.json).

Port capacities, resistance and capture durations remain provisional balance values. Land forces and invasion transports are abstracted; later historical fortification works are not automatically added. [Changes and limitations](AUDIT-0.9.md). Previous-version testing is retained in [v0.8 validation](VALIDATION-0.8.md).
