# Release 0.16 validation

Verified on 10 September 2026 (Asia/Seoul), using isolated saves and the staged release. The current save format is 7; previous-save compatibility is intentionally not retained.

| Check | Result |
| --- | --- |
| Automated mechanics and regression checks | 171 passed, 0 failed; about 238 seconds |
| Real browser playthroughs | All 7 navies in both campaigns; 406 layout observations; 0 browser errors |
| Final browser controls | 11 check groups passed; 0 browser errors |
| Screen sizes | 1366×768, 1920×1080 and 2560×1080 |
| Final map movement sample | 57.1 fps; 25 distinct marker transforms; 0.7 ms sampled animation-frame CPU |
| Facility geometry | All four expansion controls retain the same 42 px height and vertical position during progress |
| Music | All 15 bundled recordings decode in the browser; 45.36 minutes total; pause fades to one-third volume |
| Generated renderer checks | 226 screens and 368 class panels; no invalid numeric/string output |
| Isolated recurring economy | All 14 openings passed 365 daily resource updates and calendar graduations without exhausting reserves or creating default aircrew shortages |
| Operational endurance | Both campaigns passed 365 days and 525,600 operational minute ticks each; all seven ministries validated monthly |
| Wartime integration | 90 days; 129,600 operational minute ticks; 80 reports retained; losses, rescue, recovery, shipping and staffing validated |
| National catalogs | 28 generated Markdown catalogs; 150 class, 120 aircraft and 341 roster checks passed |
| Strategic port documentation | 44 ports, both campaign periods and seven national briefings agree with game data |
| Original scenario/platform/equipment validators | 119 classes, 158 named hulls, 12 original aircraft, 144 component SKUs; all valid, 0 warnings |

The original-source counts and the playable catalog counts cover different datasets: the generated game includes historical, support and alternate-history additions. Their validators are separate.

## What was exercised

The mechanics tests cover all fourteen opening aviation inventories; ownership and crew conservation; development-year and model qualification gates; model-specific combat and ferry reach; base stores and sortie limits; coastal scouts; carrier rendezvous and diversion; merchant allocation, transport losses and recovery; captured bases and warehouses; bulk fleet eligibility, affordability and return journeys; and funding-dependent accounts. Existing regression checks cover the connected economy, diplomacy, land campaigns, procurement, support groups, combat, personnel, orders and save validation.

The browser playthroughs exercise purchasing, design drafts, facility funding, missions, repeated pause/resume at maximum requested speed, reserve/scrap orders, map selection, register search, navigation and current-release save/reload. The final control run additionally verifies permanent escort coverage, resource hovers, changing facility costs, bulk reserve/recommission/scrap, port aviation details, the narrower sidebar and all music files. Screenshots were inspected for the facility layout, resource account and fleet register.

The recurring-economy test isolates resource accrual from the full operational simulation; it is not a prediction of wartime solvency. The wartime test deliberately places the seven navies at war and checks the casualty/recovery and transport systems every 30 days. The operational endurance tests run every minute, checking all seven ministries and serialized state each month. Longer historical multi-year sweeps are not part of this release's measured coverage.

## Operational endurance measurements

| Campaign | Simulated days | Minute ticks | Elapsed seconds | Largest serialized state |
| --- | ---: | ---: | ---: | ---: |
| In Good Faith | 365 | 525,600 | 557.16 | 792,174 bytes |
| The Treaty System | 365 | 525,600 | 286.69 | 502,515 bytes |

These are elapsed times under concurrent test load, not an isolated maximum-speed benchmark. No operational minutes were skipped.

## Evidence

- [Automated regression output](test-output/release16-unit-final.txt)
- [Fourteen browser playthroughs](browser-test-output/release16-all14-result.json) and [final control measurements](browser-test-output/release16-controls-result.json)
- [Recurring resource year](test-output/release16-resource-year.json)
- [Operational endurance log](test-output/release16-endurance-final.txt) and [final endurance results](test-output/release16-endurance.json)
- [Wartime integration](test-output/release16-wartime.json)
- [Scenario and original catalog validation](test-output/release16-data.txt)
- [Published local build verification](release-0.16.0.json)

Measured frame rate and simulation throughput depend on hardware and concurrent load. The map targets display refresh independently of the simulation worker; requested 100,000× speed may run slower. These checks establish tested behavior, not immunity to every possible campaign state. The [realism audit](AUDIT-0.16.md) identifies remaining abstractions and proposed changes; [base-aviation documentation](../docs/base-aviation.md) distinguishes historical references from provisional establishments and battery profiles.
