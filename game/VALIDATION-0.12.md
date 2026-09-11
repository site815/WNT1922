# Build 0.12.0 validation — 9 September 2026

The complete v0.11 update is included; [its validation](VALIDATION-0.11.md) covers support operations, ceasefires and the extended war benchmark.

## Regression and rendering

**128 tests passed, zero failures.** Added checks cover wartime-only contact alerts, clearing only visible optional notices, calendar-gated procurement, readiness tooltips and visual interpolation that never extrapolates simulation state or enemy contacts. [Regression log](test-output/release12-unit-final.txt).

The renderer checked **282 screens and 368 class panels**. Catalog checks passed for 28 Markdown catalogs, 150 supplemental classes, 120 aircraft entries and 341 roster entries. The generated technology tree and port documentation match their source data.

## Isolated browser playthroughs

All **14 campaign/navy combinations** completed with **322 observations and zero browser errors**. Construction, design drafts, funding, fleet orders, inspections, reserve/scrap returns, panning, saving and repeated pause/resume were exercised. [All-campaign result](browser-test-output/release12-all14-result.json).

Focused checks at **1366×768, 1920×1080 and 2560×1080** verified the map above its command desk, a single 27-pixel legend, navigation, map selection, fleet orders, manifests and 64× zoom. Detailed reports retained their expanded calculations and scroll position while the simulation ran. The last check, including the compact pointer-transparent order receipt, passed on 9 September after the interrupted session. [Focused result](browser-test-output/release12-result.json).

Control tests verified equal 42-pixel action/cooldown footprints, production selectors above aircraft models, equal selector widths, date-locked development cards, treaty state, diplomatic hints, the yard-load chart, hull slider, compact naval record and actual mouse clicks on ports/capitals. Paused music softened from 0.6 to 0.2 and restored on resume. [Control result](browser-test-output/release12-controls-result.json).

The movement test observed **59 fps**, 24 distinct marker positions in 30 samples and a sampled animation paint of approximately **0.4 ms**. This is a measured browser result on this computer, not a guarantee for every machine. The visual loop targets 60 fps independently of the one-minute simulation worker.

## Publication

Save format remains 6. The local publication script backs up and hashes the existing campaign, rebuilds the public files and verifies served modules, styles and music. [Release verification](release-0.12.0.json). [Changes](AUDIT-0.12.md).
