# Build 0.10.0 validation — 8 September 2026

## Automated regression

**110 tests passed, zero failures.** Coverage includes clocks, worker commands and recovery, saves, procurement, staffing, aircraft, naval combat, ports, Pacific campaigns, alerts and resource calculations. New regressions cover contact expiration while open, preserving last-observed coordinates, persistent dismissal, reacquisition, per-fleet mission authority and suggested designs without a hidden national directive. [Regression log](test-output/release10-unit-final.txt).

## Actual browser interaction

The isolated Edge playthrough covered **all seven nations in both campaigns**, recording **322 layout observations with no browser errors**. It exercised ship construction, design drafts, funding, class and individual-ship inspections, fleet orders, reserve/scrap returns, map panning, save/reload and repeated pause/resume. A two-campaign smoke run followed the navigation-identity cleanup. [All fourteen cases](browser-test-output/release10-all14-result.json), [smoke results](browser-test-output/release10-smoke-result.json).

The final focused test ran at **1366×768, 1920×1080 and 2560×1080**, with screenshots inspected for layout and text:

- The map filled its available workspace height, with the information panel to its right. Map header text, buttons, drag overlays and old command submenu controls were absent.
- The legend stayed exactly **27 pixels high**, on a single row including national colors and credits, with no horizontal overflow. The main menu used **15-pixel** text; the outer window and sidebar did not overflow.
- Map ports, capitals, contacts and fronts opened in the right panel without a modal. Fleet selection, composition hover, inline ship manifests, mission orders, 64× keyboard zoom and credits worked.
- An open contact alert disappeared after its report became stale, while the last-known marker remained on the chart. Contact state was derived from observations, not hidden enemy positions.
- Research and the full register used normal scrolling; legacy/reserve entries followed the main fleet. Equal aircraft selector widths were retained.
- Battle calculations stayed expanded and the report remained at its **400-pixel scroll position** while the worker ran at the 100,000× setting. Time controls remained clickable above the report.
- A focused ship-search field retained its text and focus while the live clock advanced. Ceasefire progress no longer displayed an incorrect 1970 deadline.

[Final interaction results](browser-test-output/release10-result.json).

## Source and documentation checks

A final seven-navy war integration advanced **90 game days / 129,600 individual minute ticks**, validating the save after each 30-day block. It retained 80 recent battle reports and processed **17,792 recovered personnel/airframes** without a validation failure. [War integration result](wartime-result.json).

The renderer harness validated **268 screens and 284 class panels** without missing/invalid output. The national catalog check validated **28 Markdown catalogs, 66 supplemental classes, 120 aircraft models and 341 opening-roster entries**. All **44 ports across both starting periods** and seven scenario briefings matched their generated documentation. Historical catalog crosschecks covered **691 fields across 42 sections, with zero mismatches**. Generated catalogs were refreshed to the current release label; ship and equipment specifications did not change.

## Local publication

Save format remains **6**; v0.9 campaigns can continue. Publication makes a timestamped copy of the current save, checks its hash, restarts only this project's server and verifies every served module, stylesheet, HTML file and music track. [Publication evidence](release-0.10.0.json).

The previous release's mechanics validation remains available in [v0.9 validation](VALIDATION-0.9.md). Maximum simulation speed remains an adaptive ceiling, not a guaranteed rate. [Changes, limits and proposed improvements](AUDIT-0.10.md).
