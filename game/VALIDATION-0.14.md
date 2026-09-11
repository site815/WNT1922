# Release 0.14 validation

Validated 10 September 2026 (Asia/Seoul). This covers the changes listed in [the release audit](AUDIT-0.14.md).

## Simulation and resource checks

- **148 automated tests passed**, including eleven new calendar, decision, alert and convoy-coverage tests. The previous daily-output tests now check paid training plus graduated personnel against funding, with real calendar advancement. [Full regression log](test-output/release14-unit-final.txt).
- **25 focused tests passed again** after the final coverage hover, marker and save checks. [Final focused log](test-output/release14-final-targeted.txt).
- Graduation tests cover leap-year totals, January/April quarter boundaries, December rollover, partial opening months, 10% funding, resource exhaustion, fractional carry, same-day duplicate prevention, save round-trip validation and rescue returning independently of schools. A real minute advance across midnight pays and releases a monthly batch once.
- Mandatory choices resume only an interrupted running game, wait for other mandatory demands and preserve manual pause. Invalid choices and reloaded campaigns stay paused.
- Battle notices expire at exactly 2,880 game minutes, including a selected reading snapshot. Assault notices survive ordinary-notice overflow, resolve on occupation/repulse/ceasefire and correctly restart for counteroffensives.
- Escort qualification and range are shared with combat. Tests exclude other nations, unsuitable missions and unavailable forces; use actual fleet positions; and check geodesic coverage across the map seam.

Each campaign completed **365 days / 525,600 individual minute ticks**, totaling **1,051,200 minutes**. Every 30-day checkpoint checked saves, aircraft/aviator allocation, merchant/convoy conservation, finite resources and exact minute accounting. The Treaty System crossed its January quarterly graduation; standalone calendar tests cover the full leap-year boundary. Both passed. Maximum saved state sizes were approximately 751 KB and 462 KB. [Endurance results](test-output/release14-endurance.json).

A separate seven-navy wartime run completed **90 days / 129,600 minute ticks**, retaining 80 recent battle reports and processing **20,337** sailor/aviator/airframe recoveries. It crossed the April graduation boundary while exercising combat, repairs, replenishment, AI funding and save validation. [Wartime results](test-output/release14-wartime.json).

## Browser and layout checks

All seven navies in both campaigns completed isolated Edge playthroughs: **322 observations and zero browser errors**. The checks included construction, paid drafts, funding, missions, ship inspection, reserve/scrap returns, saving/reloading and repeated pause/resume. [All fourteen playthroughs](browser-test-output/release14-all14-result.json).

The final focused Edge suite passed at **1366×768, 1920×1080 and 2560×1080**. The alert rail stayed **48 px** tall when empty or overflowing, the map legend stayed **27 px** tall on one row, and there was no page-width overflow. The map continued animating through pointer dragging, a held pointer, wheel zoom and side-panel scrolling. A half-second held-pointer interval produced 31 animation frames. This is a measurement on this machine, not a hardware guarantee.

Both land-line and island-ring animations were sampled at 0, 2.4 and 4.8 seconds: dash offsets went **−5 → +5 → −5 px**. The tests also verified coverage rings and convoy selection, menu order, school schedule text, retained Campaign-record reports, and a real treaty-expiry decision whose response resumed the simulation worker. [Final browser result and screenshots](browser-test-output/release14-result.json).

Testing found overlapping fleet/convoy click targets. Friendly markers now share collision spacing; separate noninteractive leader lines identify their actual positions. Enemy contacts retain compact reported-position clustering. The final browser suite verifies convoy selection and continued animation with this layout.

## Catalog and rendering checks

Generated HTML checks covered **282 screens and 368 class-information panels** without missing or nonfinite values. These supplement the browser checks; they are not visual tests.

All **28 national Markdown catalogs** were regenerated for 0.14. The catalog consistency check passed **150 supplemental class checks, 120 aircraft checks and 341 roster checks**, across both scenarios and seven nations. No historical specifications, equipment values or technology levels were changed in this update.

The local publication script creates and verifies a pre-release campaign backup. Its publication result is recorded in [release-0.14.0.json](release-0.14.0.json); the browser tests use disposable save directories rather than the user's campaign.
