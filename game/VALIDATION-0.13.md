# Build 0.13.0 validation — 9 September 2026

## Simulation and AI

**138 regression tests passed, zero failures.** Coverage includes all opening fleet compositions, complete escort-screen departure checks, position-preserving orders, real route distances and fuel rejection, invalid submarine port missions, reinforcements, daily personnel output, national/scenario AI preferences, ordinary procurement gates and observed-information hovers. Existing worker, combat, support, recovery, save and economic tests also passed. [Final regression log](test-output/release13-unit-final.txt).

Two endurance campaigns each processed **730 days / 1,051,200 minute ticks**: In Good Faith and The Treaty System. Every 30-day checkpoint verified saves, resource limits, aircraft/aviator allocation, merchant/convoy conservation and exact minute accounting. This is **2,102,400 individual operational minutes** across four game years. Both passed; maximum save sizes were approximately 828 KB and 499 KB. Peak total commands were 25 and 22, including separate support, repair and reinforcement groups. [Endurance results](test-output/release13-endurance.json).

A separate **90-day / 129,600-minute** seven-navy wartime test completed with 80 recent reports retained and 19,059 personnel/airframe recoveries processed. It exercised destruction, repair returns, replenishment, continued AI appropriations and save validation. [Wartime result](test-output/release13-wartime.json).

## Browser playtests

All seven navies in both campaigns completed isolated Edge playthroughs: **322 observations, zero browser errors**. These exercised construction, drafts, funding, fleet orders, individual inspections, reserve/scrap returns, map movement, saving/reloading and repeated pause/resume. [All fourteen results](browser-test-output/release13-all14-result.json).

Focused tests at **1366×768, 1920×1080 and 2560×1080** checked a large map with a **218–245 px right control panel**, single-row 27-pixel legend, no page-width overflow, all menus, pointer/keyboard map selections, fleet orders, ship manifests and 64× zoom. Detailed reports stayed expanded and preserved their scroll position during maximum-speed worker updates. The final pass followed the compact heading adjustment. [Layout and interaction result](browser-test-output/release13-result.json).

The control suite verified that four additional orders make the queue four rows taller, with no queue pagination. It checked disabled research-date tooltips, expanded ship hovers, equal aircraft selectors, future development cards, diplomacy controls, port/capital clicks, audio transitions and stable 42-pixel button/progress rectangles. Movement sampled **60 fps**, 23 distinct transforms in 30 samples and approximately 0.2 ms for a sampled paint. These measurements describe this computer, not a guaranteed refresh rate on all hardware. [Controls result](browser-test-output/release13-controls-result.json).

Browser testing found and fixed tooltip overlap with fleet click targets and tooltips being cancelled by late automatic scroll events. Simulation regression testing found and fixed a patrol-target filter that had excluded active island campaigns. Test fixtures were corrected to mark deliberately relocated blockade ships as deployed and to expect role-based AI missions after war begins.

## Catalogs and documentation

Renderer checks passed for **282 screens and 368 class panels**. All **28 national Markdown catalogs**, 150 supplemental classes, 120 aircraft entries and 341 opening roster entries match their data. All 44 ports in both periods and seven campaign briefings match generated documentation. All 14 technology branches / 126 level descriptions match the game.

The historical source validator passed with **119 classes, 158 named hulls, 12 aircraft, 144 component SKUs and zero warnings**. The platform crosscheck covered **691 fields in 42 sections with zero mismatches**. No fiction was used.

## Publication

Save format remains 6. Publication backs up the current campaign, verifies its hash and checks the served modules, styles and music. [Release verification](release-0.13.0.json). [Changes and tuning notes](AUDIT-0.13.md).
