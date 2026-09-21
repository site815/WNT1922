# UI and desktop check — 0.35.0

Review dates: 21–22 September 2026. This update checks presentation, recognition coverage, desktop error handling and save transport. The earlier connected-systems and long-campaign evidence is retained below; those long campaigns were not rerun for this presentation update.

- Standard regression: **361/361 checks passed**. Catalog validation covers 86 live documents and all 14 starting states.
- Asset validation passes for 310 recognition records, 301 source files, 166 ship types, 186 aircraft types and all 33 music tracks. Historical source bytes and hashes are unchanged. Presentation uses muted paper and multiply blending; original views, aspect ratios and documented source crops remain intact.
- Opening-fleet coverage includes 349 groups / 2,091 hulls across both campaigns. All 244 legacy groups / 1,262 legacy hulls resolve to drawings, covering 85 distinct legacy classes. Checks include reserve, unfinished and retired hulls, carrier conversions, and campaign-specific Courageous configurations. Mixed legacy groups retain their documented representative-class drawings.
- All 281 campaign ship definitions and 334 campaign aircraft definitions render populated recognition hovers without invalid placeholders. Custom designs receive no unrelated drawing. The initial fleet hover works before visiting a catalog. Art info defaults closed, supports keyboard operation and remains open across simulation refreshes; full source/license/configuration text remains accessible.
- All 11 ministry menus were exercised at 1920, 1600, 1366, 1100, 900 and 768 pixels. An additional 84 peace and 84 six-opponent wartime combinations cover both campaigns, all seven nations and those six widths; actual resource text bounds show no cell clipping or overlap. Top controls fit one row at 1100 and wider. Resource tiles add rows where needed, with complete reserve counts; balanced wartime columns keep the same row count as peace. All resource hovers remain populated, finite, scrollable and within a 1366×768 viewport.
- Catalog and inspection statistics retain existing gameplay fields and add clearer range, armor, AA, aircraft speed and production information. Shared speed formatting distinguishes cruise-only definitions from genuine maximum-speed figures and excludes torpedo attack profiles from maximum speed.
- Desktop reference routing rejects malformed/privileged URLs and catches a failed Windows browser launch. Local-only hosting, renderer sandboxing, context isolation, permission denial and restrictive content policies remain enabled.
- A reproduced save-transport bug corrupted UTF-8 names when a character crossed HTTP chunks. Requests now decode once; real HTTP tests cover accented, Japanese and emoji characters, exact save/backup round trips, and an 8 MB byte limit that leaves the previous save unchanged on rejection.
- The final native portable passed USA 1936 and Britain 1922, artwork/Art info/initial hover checks, controls, diplomacy, all music, save/close/reopen, temporary cleanup and a five-round battle with retirement and live report updates. No JavaScript errors were recorded. All 579 packaged source files and 652 payload files match their expected hashes. The final executable SHA-256 is `ba2cd0d62a70387150bba4af8b607c274d269326d9c3c8ce1f1218f32b2101df`; the source fingerprint is `93565b8f8d030df035d05eca67be80c37998ff12dcb021426644c4d360a46041`.

Windows Code Integrity logged signing-policy blocks for the unsigned 0.34.0 portable (events 3033/3077). This is separate from a JavaScript exception. Version 0.35.0 is also unsigned; no code-signing certificate is configured. Runtime fixes cannot guarantee Smart App Control acceptance. Smart App Control was not disabled, and no exclusions were added. See [Microsoft's Smart App Control signing guidance](https://learn.microsoft.com/en-us/windows/apps/develop/smart-app-control/code-signing-for-smart-app-control).

Detailed local evidence is in ignored `test-output/release35-*`, `test-output/recognition-presentation/` and `test-output/portable/`. Repeatable regressions are under `tests/`; the packaged executable check is `tools/check-portable.mjs`.

---

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
