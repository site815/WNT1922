# Release 0.14 — graduation batches, alerts and escort coverage

This update completes the calendar-graduation and map/alert requests on top of the completed 0.13 release. Balance remains provisional. No fictional story material is used.

## Personnel

Sailors graduate on the first of every month. Aviators graduate on 1 January, April, July and October. Paid training accrues daily in separate pools, scaled by funding and available gold/industry. Whole graduates enter the usable resource at the calendar boundary; fractional training carries forward. Annual capacity and per-person costs remain unchanged, with leap years divided across 366 days. First batches contain only training completed since campaign start. Recoveries keep their existing dates and do not wait for school graduation.

The facility cards and resource hovers show the schedule, next graduation date and paid training accumulated. Saved pools cannot graduate twice on the same day. Existing format-6 campaigns initialize empty training pools when first opened with this update.

## Decisions and notices

A mandatory decision remembers whether it interrupted running time. Choosing its outcome resumes the simulation once no mandatory decisions remain. Manual pause, manual stepping and loading a campaign retain pause. Failed choices cannot resume time. Default dismissal resolves the same decision through the same command path.

Battle and convoy-combat notices disappear after 2,880 game minutes. Ongoing land and island offensives keep their notices, including when ordinary recent notices exceed the twelve-item display window. Resolution or ceasefire starts the 48-hour countdown. A counteroffensive creates a fresh notice; a failed counteroffensive also resolves its notice even when the territory owner does not change. Full battle reports remain in Campaign record. An expired reading snapshot cannot keep a dismissed notice open.

The alert rail is fixed at 48 px with space for its horizontal scrollbar, so receiving or clearing notices does not resize the map. Fleet register now precedes Investment & research.

## Map and convoy cover

The map's animation loop stays active during dragging, a held pointer, wheel zoom and side-panel scrolling. Land-front lines and island-front rings reverse their dash motion instead of moving continually in one direction. Reduced-motion preferences still disable decorative animation.

**Escort cover** in the one-row map legend toggles green convoy rings for covered traffic and red dashed rings for exposed traffic. Coverage areas are geodesic circles clipped at the Equal Earth seam. The selected convoy lists protecting commands, their combined defense and the nearest eligible escort. The hover also reports coverage.

Coverage uses the same 80-nautical-mile (148 km displayed) neighborhood as convoy combat. Same-nation operational surface forces assigned to Escort contribute their actual defense, including supply, training and morale. Forces in port, refueling, repairing, returning, reinforcing, submarine flotillas and support groups do not provide an escort screen. Raider strength can still overcome coverage. The overlay reads only friendly movement and cannot reveal hidden adversaries. Animated markers and their coverage follow received simulation snapshots.

Testing found that a convoy and its escort could obstruct each other's click targets. Friendly markers now use shared spacing and leader lines to actual positions. These lines do not intercept clicks. Enemy contacts stay at their reported positions, with existing uncertainty handling.

## Validation and next option

See [current validation](VALIDATION-0.14.md) for tests, browser checks and endurance runs. The school rules, alert lifecycle and coverage radius have focused shared modules; future tuning does not require changing unrelated UI code.

A useful future addition would be a route-level shipping ledger showing tonnage delivered/lost and time spent without escort cover. That would explain persistent exposure over a voyage; the current overlay describes the present position.
