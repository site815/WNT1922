# Release 0.17 validation

Validated on 10 September 2026. Source release 0.17.0, save format 8. Tests use isolated saves and servers; the player's current campaign is not a test fixture.

## Results

| Check | Result |
|---|---|
| Final automated regression suite | 185 passed, 0 failed |
| New diplomacy/funding tests within that suite | 14 passed |
| Browser playthroughs | All 14 nation/campaign combinations passed |
| Browser layout checks | 406 measurements; no page overflow or recorded browser errors |
| Final release-specific browser controls | 7 groups passed; no recorded errors |
| Generated UI | 226 pages and 368 class specification panels, without NaN/undefined/Infinity |
| Recurring operating economy | All 14 starts completed 365 days with positive gold and industry reserves |
| Diplomatic calendar sweep | All 14 starts reached 1942; historical-window and early-warning checks passed |
| Full operational endurance | Both campaigns completed 365 days, processing every one-minute operation |
| Seven-navy wartime integration | 90 days / 129,600 minute updates; casualty and recovery checks passed |
| Data and Markdown consistency | 28 national catalogs, 150 supplemented classes, 120 aircraft entries, 341 opening formations |
| Ports, introductions and diplomacy documents | 44 ports / 2 periods, 7 introductions, both 21-pair opening relationship tables verified |
| Changed-module syntax | 12 modules parsed successfully |

The final regression suite ran after the historical-window correction. It covers warning timing and irreversibility, optional versus mandatory pause behavior, save round trips, historical score matrices, pressure gating, ally calls and refusals, multiple allies, named pact consolidation, declined pact modifiers, diplomacy cooldown timestamps, and the connected existing gameplay systems.

The 14 browser playthroughs exercise procurement, manual design drafts, funding, fleet missions, repeated pause/resume, reserve/scrap orders, map panning and selection, menus, resource views and current-version save/reload. Resolutions include 1366×768, 1920×1080 and 2560×1080. Final control tests additionally exercise warning/declaration and defensive-call popups, signing a political pact, register section jumps, continuous fleet details and all four 50% defaults with no auto-raise checkbox. Relevant screenshots were inspected.

## Operational endurance

| Campaign | Days | Minute updates | Elapsed seconds | Largest serialized state |
|---|---:|---:|---:|---:|
| In Good Faith | 365 | 525,600 | 655.29 | 796,269 bytes |
| The Treaty System | 365 | 525,600 | 330.08 | 509,681 bytes |

The runs check ship and aircraft counts, aircrew allocation, convoy capacity, finite force calculations and serialized state each month. They include conservative ministry investments. Elapsed times reflect concurrent test load and are not isolated maximum-speed benchmarks. Both runs completed without skipped operational minutes.

The 90-day wartime integration retained 80 detailed reports and exercised 28,522 personnel/aircraft recoveries across the seven navies. It deliberately starts all seven at war and includes a forced encounter, so it tests operational conservation and recovery rather than the probability of that diplomatic situation.

## Scope and limits

The recurring-economy test excludes procurement, combat and AI intervention. It demonstrates that the initial operating plans are affordable; it does not predict wartime solvency. Aircraft production can still exceed aviator graduation at the requested 50% defaults, with shortages represented as grounded aircraft and a visible staffing deficit. [Measured personnel implications](AUDIT-0.17.md#funding-and-personnel-balance).

The diplomatic sweep advances the calendar daily without fleet or resource operations. It checks all fourteen starts through 1942, acknowledges news and declines player alliance proposals/calls. Its first-observed event dates may be one day after an intraday event; exact minute boundaries are covered by the targeted engine and browser checks. It is not a twenty-year full-world endurance run.

Historical-save migration is not a release requirement. Selected older long scenario tests are replaced here by the dedicated operational, economic and browser runs. The final Node command was:

```powershell
$env:WNT_TEST_PUBLIC='game/staging'
node --test --test-isolation=none --test-skip-pattern='old campaign migration|untouched old opening|all selectable countries|multi-year campaign' game/test/*.test.mjs
```

The map still targets display refresh independently of simulation. Requested 100,000× remains a ceiling: the worker advances more slowly if the computer cannot sustain it. Passing these checks establishes the exercised behavior, not immunity to every possible campaign state.

## Evidence

- [Final regression output](test-output/release17-unit-final.txt)
- [Focused diplomacy checks](test-output/release17-focused-final.txt)
- [All fourteen browser starts](browser-test-output/release17-all14-result.json)
- [Final browser controls](browser-test-output/release17-controls-result.json)
- [Diplomatic calendar sweep](test-output/release17-diplomacy-sweep.json)
- [Resource year](test-output/release17-resource-year.json)
- [Operational endurance](test-output/release17-endurance.json) and [minute-run log](test-output/release17-endurance.txt)
- [Wartime integration](test-output/release17-wartime.json)
- [Catalog/document checks](test-output/release17-data.txt)
- [Local publication verification](release-0.17.0.json)
- [Gameplay audit and proposed additions](AUDIT-0.17.md)
