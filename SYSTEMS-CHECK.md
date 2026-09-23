# Atlas angle and close-up zoom — 0.36.2

Review date: 24 September 2026. The atlas has no sideways roll, retains its raised depth, and supports map zoom through 256× instead of 64×. Projected model bounds replace the fixed hull-culling margin so partially visible enlarged ships remain drawn and selectable. The map sprite cache retains at most 32 MiB of RGBA backing pixels and avoids a second retained raster copy; this is not a limit on total browser memory.

- Standard regression: **391/391 checks passed**. Projection tests verify level east–west lines, north-up orientation, inverse picking and cursor anchoring through 256× at four viewport widths. Enlarged-hull checks compare drawing and pick bounds, preserve an onscreen bow whose centre is offscreen, and verify fourfold size relative to the old zoom limit.
- The real browser passes all 11 menus at five widths and close-up interaction at 1920 and 768 pixels, plus a fresh 1920-pixel context at 200% display scaling. Buttons and wheel input reach 256×, the same hull visibly enlarges, pointer anchoring and drag distances remain aligned, hover artwork loads, actual canvas clicks inspect the ship, and World returns to 1×. Backing buffers match device scaling. Strategic and close-up screenshots were visually reviewed; no page errors were recorded. Existing battle stepping, replay and save checks also pass.
- A real-canvas cache stress check creates 24 large near-maximum-zoom sprites at 200% scaling: 119,148,936 cumulative bytes generated, at most 33,455,052 bytes retained, within the 33,554,432-byte budget. The newest sprite is reused. This measures retained map sprite buffers, not transient raster buffers or GPU allocations.
- The final native portable passed USA 1936 and Britain 1922, including actual wheel zoom to 256×, enlarged-hull clicks, ship inspection, return to World, packaged artwork, all 33 music tracks, diplomacy and save/close/reopen. The existing five-round battle-watch checks also pass. Native close-up screenshots were visually reviewed; no JavaScript errors were recorded.
- Packaging verified **770 source files / 843 payload files**. Executable: `WNT1922-0.36.2-portable-win-x64.exe`, 476,468,252 bytes. SHA-256: `cab923035d258ab61d1113a867a7dab65aa1cb171a5687a78bc7683a9bd55b79`. Source fingerprint: `70cb340e7bd412860215219efbe2cfbf9ae47328d1cf33fd899436e28c9e1502`.

Local evidence is under ignored `test-output/release362-*`, `test-output/scene-ui/` and `test-output/portable/`. Campaign calculations and model files are unchanged; earlier endurance results below cover those same mechanics.

---

# Canvas remount verification — 0.36.1

Review date: 24 September 2026. Final visual review of 0.36.0 found an enlarged, blurry map after returning to navy selection and continuing at the same window size. Its automated interaction checks had passed without checking the replacement canvas resolution. This patch checks both canvas backing buffers and resets stale hull-hover state when the tooltip closes.

- Standard regression: **390/390 checks passed**, including same-size canvas replacement at device pixel ratios 1, 1.25 and 2. Both drawing buffers regain the correct dimensions; obsolete buffers are not reused.
- Browser checks now exercise title-screen/continue before World/Fleet interaction, verify actual canvas resolution, and cover all 11 menus at 1920, 1366, 1100, 900 and 768 pixels. Real pointer hover/click, battle pause and exact global stepping, read-only replay, close-paused behavior and saved replay all pass without browser errors.
- The corrected native portable passed USA 1936 and Britain 1922, including the same-size campaign remount, actual canvas buffer dimensions, packaged models and recognition files, fleet clicks, all 33 music tracks, diplomacy, save/close/reopen and five-round battle playback. No JavaScript errors were recorded. The final fleet and battle screenshots were also visually reviewed: the map and ships retain full resolution after the title-screen cycle.
- Packaging verified **770 source files / 843 payload files**. Executable: `WNT1922-0.36.1-portable-win-x64.exe`, 476,467,553 bytes. SHA-256: `1d3d5b84c7b5259da61a1301a5de96026768003b3a09d93726e3cb907fabd96f`. Source fingerprint: `bc4e5581666816103b8709328aed157aff3fd9b9423bf4ecba15df15647bd12a`.

The battle mechanics and model assets are unchanged from the checks below; the six-year endurance evidence applies to those same mechanics. Local patch evidence is under ignored `test-output/release361-*`, `test-output/scene-ui/` and `test-output/portable/`. This release remains unsigned.

---

# Isometric fleets and battle systems check — 0.36.0

Review date: 24 September 2026. The desktop workspace remains the main repository. This update adds the isometric presentation and decisive-battle recording while retaining the existing strategic combat calculations.

- Final standard regression: **389/389 checks passed**. Catalog validation covers 86 live documents and all 14 starting states. New checks cover decisive thresholds, unavailable reinforcements, regional encounters, identical minor-action consequences, real aircraft recovery after report removal, protected worker stepping, engagement identity, saved replay/attrition validation and bounded retention.
- The asset audit validates 180 voxel files: 167 authored variants for 166 classes and 281 campaign mappings, plus 13 custom-design fallbacks. All 244 starting legacy groups resolve to models. Parts have finite in-bounds geometry and safe colors; original main-gun counts and PT torpedo tubes match their recognition geometry. Historical carrier silhouettes distinguish early Akagi/Kaga, Lexington, Eagle, Hosho and the two Courageous configurations. These are stylized reference-based models, not engineering plans. Existing recognition and soundtrack audits also pass.
- Shared voxel projection and depth tests cover four headings and overlapping carrier decks. Fleet-instance tests preserve 614 hulls without arbitrary caps, exclude hidden enemy fleets, and keep complete harbour formations clear of land, islands, raised coasts and neighboring formations. Cached model sprites and a cached coastline mask avoid repeated geometry work.
- The actual UI passes all 11 ministry menus at 1920, 1366, 1100, 900 and 768 pixels, with no document overflow or invalid numeric placeholders. World/Fleet controls, real canvas pointer picking, ship artwork hovers and inspection panels work at every size. A narrow-window tooltip issue was corrected so the tooltip does not cover the pointed hull. Local screenshots are in `test-output/scene-ui/`.
- Battle UI tests verify opt-in watching, pause on open, exclusive Next-tick controls, exactly 15 minutes of global advancement, read-only recorded navigation, ship inspection, responsive bounds, close-paused behavior and replay after save/reload. Formations and damage impacts are illustrative; displayed group conditions, aircraft composition and losses come from observed simulation frames. The viewer does not invent shooters or projectile outcomes. Monthly infrastructure totals are labeled cumulative damage points rather than current facility percentages.
- Six-year campaign endurance: seed `1969`, Japan 1936, **2,190 days / 210,240 ticks / 73 validated save checkpoints**. Peak exported save: **4,720,584 bytes**, below the 8,000,000-byte limit. At the busiest checkpoint, 9,914 minor actions were consolidated in the rolling ledger. Final retention was 80 aggregate reports, 12 retained replays, 68 explicitly archived replays and 151 monthly attrition rows. Elapsed time: 811.99 seconds. Human reserve/scrap attempts during air attacks and aggregate splitting have separate focused regressions; those operations are not established by the unattended endurance run alone.
- The repository launcher reads voxel JSON directly from `assets/voxels/`, alongside the existing recognition override. Real HTTP checks verify edits without a model build, packaged fallback when no override is supplied, no-store responses, rejection of executable asset files and confinement through resolved filesystem paths.
- The final native portable passed USA 1936 and Britain 1922, all 33 music tracks, recognition and voxel loading, real canvas fleet/ship/port interaction, resource and diplomacy panels, window close/save/reopen, and a five-round surface battle. Its Battle watch controls advanced one global tick, replayed the saved tick without advancing again, and restored normal controls on close. No JavaScript errors were recorded. The harbour test zooms until overlapping markers separate, then performs a real pointer hover; it does not click the hidden SVG.
- Packaging verified **770 source files / 843 payload files**. Executable: `WNT1922-0.36.0-portable-win-x64.exe`, 476,467,339 bytes. SHA-256: `b23d0be5eb02f23f1be39eebb7e4e4bcc6e318f3e278d894761ba5a45f740a48`. Source fingerprint: `ae0e3820dc4140aef856e51ea311fefaede66c351d7f6a20e083ccd91f4cfcfb`. The executable remains unsigned; this successful native run does not establish Windows signing-policy trust on other installations.

Repeatable checks: `tools/check-scene-ui.mjs`, `tools/check-portable.mjs`, `tools/check-voxels.mjs` and the regression tests. Detailed local evidence is under ignored `test-output/scene-ui/`, `test-output/isometric/`, `test-output/voxels/` and `test-output/release36-*`. These checks cover the documented seeds and scenarios; they do not establish every possible campaign or order sequence.

---

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
