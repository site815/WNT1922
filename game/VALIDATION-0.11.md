# Build 0.11.0 validation — 8 September 2026

## Regression and operational integration

**123 tests passed, zero failures.** New coverage includes immediate ceasefires, accepted versus rejected payments, cooldowns, invalid-order rollback, ready-fleet provocation and actual encounter distance, insults, all 126 doctrine descriptions, hard aircraft year gates, all fourteen national/campaign support catalogs, war sound selection and paused music gain. [Final regression log](test-output/release11-unit-final.txt).

Support tests exercise a complete automatic oiler voyage to a remote fleet, physical replenishment and cargo consumption, damaged auxiliaries returning to port for paid repairs, and a depot sailing to an overloaded base. Supply capacity is absent during transit and after sinking. Anchored auxiliaries can suffer losses with ordinary personnel accounting, and resulting saves validate.

A seven-navy war integration processed **90 game days / 129,600 individual minute ticks**, validating at each 30-day checkpoint. It retained 80 recent reports and processed 19,639 recovered personnel/airframes. [War integration result](wartime-result.json).

## Browser checks

All **seven navies in both campaigns** completed isolated Edge playthroughs: **322 layout observations, zero browser errors**. These exercise construction, drafts, funding, orders, ship inspections, reserve and scrap returns, panning, save/reload, and eight repeated pause/resume cycles per campaign. [All fourteen results](browser-test-output/release11-all14-result.json).

Focused tests at **1366×768, 1920×1080 and 2560×1080** verified the full map with its right-hand selection panel, single-row 27-pixel legend, left navigation, contacts expiring while open, keyboard map selection, inline manifests and report stability. Battle calculations stayed expanded and the report retained its 400-pixel scroll position while the simulation ran at maximum requested speed. [Focused results](browser-test-output/release11-result.json).

Additional pointer and control tests verified:

- All twelve submenus fit and remain visible at 1366×768.
- Each of the four facility action rectangles remains identical before and after funding; button/progress height is 42 pixels. A diplomatic visit's cooldown occupies its exact prior button rectangle.
- Research follows availability year and future aircraft explain their 180-day development period.
- Treaty state, diplomatic hover costs, integrated queue, 1–20 hull slider and overloaded-yard chart work.
- Port and capital icons and labels respond to actual mouse selection, with contextual port hover.
- Paused music fades to 0.2 from a user volume of 0.6, resumes to 0.6, and returns to 0.2; the paused indicator animates.

[Control results](browser-test-output/release11-controls-result.json). Screenshots were inspected for layout, readability and clipping; queue and sidebar spacing were tightened afterward and rechecked.

## Data, documentation and performance

The renderer harness checked **282 screens and 368 class panels**. Catalog checks validated **28 Markdown catalogs, 150 supplemental class entries, 120 aircraft entries and 341 opening-roster entries** across both campaigns. All 44 ports in both periods and seven scenario briefings match their documentation. Historical catalog crosschecks covered **691 fields across 42 sections with zero mismatches**; schemas reported no warnings. The generated technology tree matches all fourteen branches and 126 level descriptions.

The crowded benchmark deliberately places approximately 140 commands in one combat area, with seven navies at war and 56 convoy packets. Every supported speed processed the exact crossed minute count. Normal 10,000× stayed within the measured CPU budget; the 50,000× and 100,000× demands exceeded it, giving engine ceilings of approximately **21,000× and 32,000×** for those runs. These are this machine's measured results, not guaranteed real-world speeds. The worker slows simulation under load, preserves minute accounting and remains separate from UI rendering. [Benchmark](benchmark-result.json).

## Publication

Save format remains **6**. Publication backs up the current save, verifies its hash, restarts only the project's local server, and verifies served modules, styles, HTML and music. [Release verification](release-0.11.0.json). [Changes and limitations](AUDIT-0.11.md).
