# Release 0.15 validation

Verified against the staged release on 10 September 2026 (Asia/Seoul).

| Check | Result |
| --- | --- |
| Automated mechanics and regression suite | 155 passed, 0 failed |
| Final targeted mechanics after air-wing modernization | 34 passed, 0 failed |
| Real browser playthroughs | All 7 navies in both campaigns, 406 layout observations, 0 browser errors |
| Final browser controls | 10 check groups, 0 errors; flat menus, stable button geometry, graduation bars, combined pages, manifest state and budget |
| Screen sizes | 1366×768, 1920×1080 and 2560×1080 |
| Map movement in the final control run | 57 fps; 0.3 ms sampled animation-frame CPU; display-refresh target remains 60 fps |
| Generated renderer checks | 226 screens and 368 class panels; no NaN, undefined or Infinity strings |
| Isolated recurring economy | 365 daily updates and calendar intakes for all 14 openings; positive reserves and no default aircrew shortages |
| Operational endurance | 365 days in each campaign; 525,600 operational minute ticks each; all 7 ministries validated each month |
| Wartime integration | 90 days, 129,600 operational ticks, 80 reports retained; loss, recovery, merchant and staffing checks passed |
| National catalogs | 28 Markdown catalogs synchronized; 150 class, 120 aircraft and 341 roster checks |
| Original scenario/platform/equipment validators | All valid; 119 classes, 158 named hulls, 12 original aircraft, 144 component SKUs, 0 warnings |
| Technology tree | All 14 branches / 126 descriptions agree with shared game data |

The all-navy browser playthroughs cover purchasing, drafts, facility funding, missions, repeated pause/resume at maximum requested speed, reserve/scrap orders, map interaction, register searches, navigation and current-release save/reload. Final controls cover the last UI changes. No previous-save migration was added.

Full-year operational tests completed before the final air-wing modernization addition. That addition was then covered by the complete 155-test suite, targeted tests, a fresh 14-opening resource-year run and the 90-day wartime integration. No operational ticks were skipped in these simulations.

Evidence:

- [Final unit output](test-output/release15-unit-final.txt) and [focused mechanics](test-output/release15-final-targeted.txt)
- [Fourteen browser playthroughs](browser-test-output/release15-all14-result.json) and [final controls](browser-test-output/release15-controls-result.json)
- [Opening balance](test-output/balance-15-opening.json) and [recurring economy year](test-output/release15-resource-year.json)
- [Operational endurance](test-output/release15-endurance.json) and [wartime integration](test-output/release15-wartime.json)
- [Catalog/scenario validation](test-output/release15-data.txt)

These checks establish tested behavior, not immunity to every campaign combination or identical performance on slower hardware. Balance remains provisional; the [audit](AUDIT-0.15.md) documents known abstractions and proposed next choices.
