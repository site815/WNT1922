# Systems check — 0.34.0

Review date: 21 September 2026. This check covers the connected economy, diplomacy, fleet and air operations, state persistence, and displayed information. It combines regression tests, deterministic campaigns and real browser/portable interaction. It does not prove every possible seed, order sequence or campaign state.

## Diplomacy and economic consequences

The previous implementation treated the selected partner as access to an abstract foreign market: only the acting ministry changed. The four resource exchanges now transfer existing stocks between both governments.

| Action | Acting ministry | Other government |
| --- | --- | --- |
| Sell naval equipment | Pays industry; receives gold | Pays gold; receives industry |
| Industrial cooperation | Pays gold and administrative influence; receives industry | Pays industry; receives gold |
| Buy strategic materials | Pays gold; receives strategic stock | Pays strategic stock; receives gold |
| Sell strategic materials | Pays strategic stock; receives gold | Pays gold; receives strategic stock |

Treaty-adjusted quotes apply to both sides of the same exchange. Influence is consumed domestically. Equipment sales represent stored industrial resources, not commissioned ships. These transactions change the resources available for ordinary funding, production and strategic supply, but do not change GDP/GTP directly or invent merchant delivery credit. Settlement is immediate; diplomatic shipments are not simulated as separate convoys.

AI governments retain operating reserves and decline unnecessary purchases. An AI request affecting the player's resources becomes a saved offer. Nothing is reserved or transferred before explicit acceptance. Fixed quoted terms survive treaty changes; acceptance rechecks ownership, peace, payment balances, reserve limits and cooldowns. Refusal, fourteen simulated days without a reply, and war move no resources. Three simultaneous offers and a ninety-day retry limit per proposing partner bound the queue. Offers neither pause nor open a popup, even with Autopause enabled.

Both ministries record signed gold, industry and strategic transfers. Current and previous-month values are displayed without adding them again to the resource balance. Visits and provocations remain domestic expenses and have a separate gold ledger category.

## Systems and display coverage

| Connection | Checked behavior |
| --- | --- |
| GDP, industry, war and ports | Occupation denies home output; bombing reduces output; repairs require eligible facilities and actual payment. Budget projections remain distinct from actual cash flows. |
| Merchant traffic, logistics and trade | Outward/unloading/return legs remain physical. Credit is awarded once to surviving completed voyages; holds and diversions do not fabricate deliveries. Hull allocation cannot exceed owned merchants. |
| Strategic stock and operations | Shortages affect production and operations through the shared calculations; diplomatic transfers alter the same national stock. |
| Fleet support and supply | Crewed physical AO hulls provide local depot capacity and rendezvous transfers. Cargo, fuel, delivered relief and its decay are visible; depot capacity is not misrepresented as a fleet-supply multiplier. |
| Combat, repairs and personnel | Existing combat/casualty/recovery checks exercise resource use, damage, training, morale, sailor staffing, repair eligibility and saved records. |
| Aircraft | Per-model inventories reconcile reserves, ships, bases, ferries, merchant transfers and sorties. Crews and retirement remain conserved; unavailable airframes cannot operate. |
| Land campaigns | Territory hovers use the real front territory list and distinguish fighting, ceasefire and occupation. |
| Worker, commands and saves | Shared actor-owned commands, failed-command rollback, save validation and read-only worker summaries remain covered. Pending and settled trade offers survive saving. |
| Interface | A single full-window map remains behind all menus; bars and side panels are overlay tiles. Covered map controls are inert. Panels scroll independently; long resource hovers can be entered and scrolled. |

Corrected display gaps include absent/truncated supply rows, misleading depot capacity, hidden replenishment/convoy state, missing wartime repair and diplomatic cash flow, incorrect training floor/ceiling, falsely inactive land fronts, ineligible repair estimates, and enormous phantom relief durations caused by treating absent historical timestamps as Unix time zero.

## Validation evidence

- All 86 live catalog documents, all 14 starting nation/campaign combinations, research levels, maps and module boundaries validate.
- Final standard regression: **353/353 checks passed**, including the added pre-1970 timestamp case.
- Focused systems audit: 109 checks passed; the final systems/offer-view recheck passed 13 checks, including absent timestamps before 1970.
- Live-browser offer test: explicit No leaves both balances unchanged; Yes settles both sides exactly through the real worker; pending alerts and history survive saving and reloading. No offer popup appears.
- All 16 resource hovers render finite values and remain within 1366×768 and 1920×1080. Every ministry menu opens over one persistent map. Additional map tests cover 24 page/resolution combinations from 1024 to 2560 pixels, pointer drag/zoom, modal bounds, isolated scrolling and scrolling inside SUPPLY.
- 1922 all-AI campaign: seed `3400341922`, 365 days, all 35,040 fifteen-minute ticks, 14 checkpoints × 7 governments. Save/resource/fleet-reference/merchant/staffing/air-inventory/supply and displayed-value checks passed. All-AI trades settle directly; this run does not exercise human offer expiry, which has separate focused tests.
- Six-year 1936 campaign: 2,190 simulated days passed in 820.9 seconds. All nations retain finite nonnegative resources; derived logistics/supply stay within bounds; war, ship deliveries, monthly history and strict save validation pass.
- Portable build: 577 source files and all 650 packaged files verified; 310 recognition entries/301 artwork files, 166 ship types, 186 aircraft types and 33 music tracks validate. Native executable checks passed both USA 1936 and Britain 1922, including exact embedded bytes, artwork/credits, menus, resource hovers, corrected dialog geometry, tile layouts, music, simulation workers, save/close/reopen, cleanup and a five-round live battle with retirement and saved-state validation. No browser errors remained.

Local detailed logs are in ignored `test-output/release34-*`; repeatable regression sources are in `tests/`, and the executable check is `tools/check-portable.mjs`.
