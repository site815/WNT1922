# Portable releases

[Latest release](https://github.com/site815/WNT1922/releases/latest) · [Release index](https://github.com/site815/WNT1922/releases)

The last published stable download is **WNT1922-0.38.0-portable-win-x64.exe**. Its one-file Electron distribution and historical release notes are preserved below. Native Unreal previews use a versioned **WNT1922-v<version>-Unreal-Windows.zip** instead: extract the entire archive, then open `Windows/WNT1922.exe`. Keep its `WNT1922/GameData` folder, engine files and licenses together. A native preview does not replace the stable download automatically.

## Native preview — 0.45.0-dev

- **Tactical Engagements** opens from the title screen or menu 12. Choose Denmark Strait, Midway or North Cape, or create opposing fleets from both campaign catalogs. Set formations, doctrine, weather and a reproducible seed, then watch the AI, advance one step, or resolve quickly. Custom fleets support up to 120 hulls per side. The campaign stays paused and unchanged while this separate mode is open.
- Campaign battles and the standalone simulator now share the rules in **combatmechanics/**. Combat uses fixed **10-second steps** inside each complete **15-minute campaign tick**. Watched and quick outcomes use the same positions, reloads, weapon travel, damage, sinking and withdrawal rules. Carrier strikes move as aggregate air groups; aircraft are physically reserved and returned rather than counted twice.
- Native ships follow observed individual courses. The cinematic camera follows actual attacks and losses; manual camera input takes control. Recorded campaign movies compress retained tactical observations into 30–90 seconds without changing campaign time or outcomes. Old aggregate recordings retain their labelled illustrations; missing detailed history is disclosed.
- Fit fleets frames the current participants, with clickable symbols at their true positions when hulls are too distant to see. Focus approaches the selected ship at a consistent distance. Replay and restart reset the camera and preserve the cinematic preference.
- Distant cinematic subjects use direct camera cuts instead of flying across empty ocean. Fleet-wide views stay near overhead; close attack and sinking shots retain cinematic angles.
- World-map wheel input is coalesced per rendered frame, zoom responds more strongly, and one cursor-anchor solve performs at most one geographic rebase. Sixteen standard wheel notches span world-to-ship zoom. Close orbit remains manual; zooming out restores north-up immediately.
- Single-click a port to open its inspector beside the command map without moving the camera. Double-click centers and zooms. Foreign stores and forces remain subject to intelligence visibility.
- Compact battle cards and map hovers show actual combat time against the scenario limit; the bar is a time budget, not a prediction of when the battle will end.

Validation passed: **519 selected JavaScript tests**, **48 native tests**, all **198 gallery loads/picks**, **seven native window sizes and 70 ministry layouts**, and a **90-day / 8,640-tick campaign run**. The final extracted archive also passed tactical interactions, scoped native-image review, normal on-screen input and offline network observation.

Presets model selected principal ships and disclose omitted forces and scenario assumptions. Combat coefficients are editable game approximations, not calibrated historical probabilities; outcomes are never forced to match history. The game remains offline, windowed, resizable and maximizable, with a default/minimum 1800×1000 client area. Ship assets remain external and directly editable. See [verification evidence and limits](SYSTEMS-CHECK.md).

## Native preview — 0.44.0-dev

- The map stays overhead at every zoom until you deliberately orbit at close ship range with a middle-button drag. Any zoom-out input immediately restores overhead and north-up viewing. Right drag pans; left click selects and left drag boxes your fleets. Strategic framing includes margins around the polar limits.
- The top control bar shows native FPS immediately before game speed, averaged over the latest half second. This measures rendered game frames separately from campaign speed.
- Chart icons and selection brackets are drawn in a stable screen-space batch after the 3D scene, using the same editable symbols and colors as the legend. Country colors are clearer, country borders follow the real terrain boundaries, and active campaign fronts show their recorded strategic progress. These front lines are illustrative campaign boundaries, not individual troop positions.
- **Play recorded movie** turns retained battle observations into a short **20–90-second** visual account with moving formations, salvos, impacts and sinking. Pause/Resume controls its own presentation clock; the campaign stays paused. Hulls, damage and losses come from the recording, while courses and salvo paths illustrate aggregate exchanges. Missing intervals are cut without invented attacks. Movies of ongoing battles stop at the latest retained observation.
- Live **Play battle · 60×** and **Next tick · 15 min** remain separate controls. They advance the actual campaign, with every fifteen-minute tick retained. Starting a decisive player battle still pauses and raises an optional Watch alert.
- Selection-only changes preserve fleet interpolation and the camera instead of rebuilding a full scene packet. Ocean and terrain rendering use fewer components; indexed chart drawing reuses vertices and one view projection per call. Battle effects keep four fixed instance pools across the complete movie.

The final Shipping archive passes **489 selected JavaScript tests**, **39 native tests**, all **198 gallery loads/picks**, and **seven actual native resolutions** through 5120×2160. Normal on-screen interaction, map/front/movie GPU review and offline network observation also pass. In two local global-map samples at 1800×1000, indexed icon drawing fell from **7.49–8.34 ms to 2.41–2.76 ms**. Both versions reached the 60 FPS cap at that size; this is a bounded CPU comparison, not a hardware-independent frame-rate claim. The game remains windowed, resizable and maximizable, with a default/minimum **1800×1000** client area. Geographic detail remains strategic-scale and dense colocated symbols can overlap. See [verification evidence and limits](SYSTEMS-CHECK.md).

## Native preview — 0.43.0-dev

- The 3D terrain chart now uses true Equal Earth geometry with continuous horizontal wrapping. Land, coastlines, longitude/latitude lines, routes and map symbols share the projection; country shapes change naturally as the chart's central longitude moves.
- Right drag pans. Left click selects a unit; left drag selects owned fleets in a box. Double-click a fleet to fit its formation. Middle drag rotates and tilts the camera at close ship zoom, from **32,768×**. Zooming out restores north-up and overhead viewing at **16,384×** and below. Maximum zoom remains **65,536×**; **Home** returns to the strategic view.
- Ministry panels open against the left side of the workspace, leaving more map visible beside them. The map and naval outliner stay loaded; **X** or **Escape** closes the panel. Panel widths remain consistent between standard and ultrawide windows of equal height.
- Ports use clear anchor symbols and capitals use stars. Fleets use cyan naval badges; intelligence contacts use outlined amber badges with a question mark. Convoys have smaller, quieter cargo symbols. Native icons and the legend read the same editable geometry and color specification.
- Selecting one or several fleets adds gold corner brackets on the chart as well as the outliner highlight. Docked fleets retain brackets without covering their port with another filled badge. At ship range, brackets do not intercept clicks on individual hulls. Icons retain stable screen sizes and use a depth-safe material.

The window remains resizable and maximizable with a default/minimum 1800×1000 client area. The Shipping archive passed 479 selected JavaScript checks, 33 native checks, all 198 gallery loads/picks, seven actual native resolutions, and bounded on-screen/Equal Earth GPU review. Normal play remained loopback-only during the network observation. See [verification status](SYSTEMS-CHECK.md).

## Native preview — 0.42.0-dev

- The command map and naval outliner remain loaded under menus 02–11. Ministry menus use centered panels with a consistent width at equal-height standard and ultrawide resolutions; X or Escape returns to the map.
- Left click selects or inspects a unit. Left drag draws an owned-fleet selection box without issuing movement orders. Right drag pans; a double-click in the fleet outliner fits that formation. Nearby clicks have a small screen-space tolerance around visible units.
- Terrain uses actual elevation, lit geometric relief and a restrained climate palette. Geographic lines use a filtered overlay and a stable zoom cutoff to avoid depth fighting and threshold chatter.
- A new decisive battle involving the player pauses the campaign and selects Tactical 60×. Watch remains optional. Resume/Play battle runs complete 15-minute ticks; Next tick advances one. The map/outliner shows elapsed time and current-stage progress.
- Battle presentation includes bounded salvo, splash, smoke and sinking effects derived from recorded exchanges and losses. Effects retain readable sizes at fleet zoom; sinking ships visibly list before descending. Trajectories illustrate aggregate exchanges; they do not claim a shell-by-shell combat simulation.

The window remains resizable and maximizable, with a default/minimum 1800×1000 client area. The offline policy and external editable ship models remain in place. See [current verification evidence](SYSTEMS-CHECK.md).

## Native migration — 0.39.0-dev

This development version replaces the voxel/WebGL renderer with Unreal terrain, water, lighting, camera and ship rendering. **The realistic asset conversion is unfinished:** only five detailed GLB models are registered. Most campaign classes and all port scenery still await detailed artwork and appear as explicitly labeled navigation symbols. The 179 old JSON recognition meshes remain reference files and are not used as live ship graphics. This version must not be presented as a completed realistic fleet or a World of Warships-quality conversion.

Native previews include external editable art, the campaign worker and its Node runtime. The archive name and SHA-256 checksum retain the version. Publication requires a successful native build plus visual and interaction checks of a fresh extraction of that exact archive. Development configuration previews are labeled as such. Current verification evidence and remaining work are recorded in [SYSTEMS-CHECK.md](SYSTEMS-CHECK.md).

## Version 0.38.0 — 3D globe and ship inspection

- The Command Map is now a true 3D globe with spherical terrain, coastlines and geographic grid lines. It wraps naturally across the date line. A continuous perspective camera zooms from the strategic world to individual ship geometry, up to **65,536×**.
- Scroll to zoom, drag to turn the globe, and right-drag or Shift-drag to rotate and tilt the camera. Double-click a fleet or convoy to inspect its ships. **Home** restores the strategic globe; **Page Up / Page Down** zoom. The lower legend shows the current zoom; the atlas control bar is removed.
- Individual warships and merchant freighters appear from **2,048×** and remain clickable at close range. Every surviving hull in your active convoys is represented. Editable files in `assets/voxels/ships/` supply actual 3D meshes directly, including the new merchant freighter. Close-up harbour formations are illustrative seaward arrangements; campaign positions, routes and supply calculations remain unchanged. Unknown enemy fleets remain intelligence contacts.
- Campaign battle watching and the opening WWII demonstrations use the same 3D model geometry, with perspective, orbit, zoom and hull selection. Recorded battle navigation remains read-only; **Next tick** advances the whole campaign by exactly 15 minutes.
- Three.js r180 is bundled locally with its MIT license and verified source hashes. The renderer uses WebGL 2 and requires graphics acceleration; it makes no external asset requests. Existing saves remain compatible. All 417 standard regression checks pass, along with browser checks at five widths and 200% scaling, and final native checks for both campaigns with no JavaScript errors. See [verification details](SYSTEMS-CHECK.md).

## Version 0.37.0 — compact command bars and opening battle demonstrations

- Alerts and naval news sit directly beside the current date in the first bar. Reduced padding and compact controls leave more room for the map; the second bar retains national resources, reserve totals and their full hovers.
- Every ministry panel has a persistent top-right **×** that returns to the Command Map while preserving the campaign clock and selected fleet.
- Compact country choices make room on the opening screen for cycling WWII naval battle demonstrations. They use the same voxel models and battle renderer as campaign battles, with pause, scene selection and ship inspection. The scenes are clearly labeled illustrative, use representative models where exact classes are unavailable, and do not change campaign state or saved games. Historical references are available with the demonstration information.
- Browser checks pass at five widths in peace and war, covering all resource hovers, all panel close controls, pending alerts, startup scrolling and demo isolation. All 397 standard regression checks and the final native portable checks for both campaigns pass with no JavaScript errors. See [verification details](SYSTEMS-CHECK.md).

## Version 0.36.2 — level atlas and closer ship inspection

The atlas is now north-up with level east–west lines, removing its sideways roll while retaining raised terrain and voxel ship depth. Map zoom extends from 64× to 256×: ships can appear four times larger than at the previous limit. Wheel zoom stays anchored under the pointer; camera buttons and Page Up/Down use the same range, and World restores the strategic view. At close range, partially visible ships remain drawn and clickable until their entire projected hull leaves the screen. Ship geometry, formation spacing and campaign calculations are unchanged.

The map image cache has a 32 MiB pixel budget to bound retained close-up sprites. Validation includes 391 regression checks, real 256× pointer interactions at wide and narrow window sizes, 200% display scaling and a real-canvas cache stress check. The final native portable passes both campaigns, close-up ship selection, battle playback and save/close/reopen without JavaScript errors.

## Version 0.36.1 — canvas resolution correction

Returning to navy selection and then starting or continuing a campaign at the same window size now allocates full-resolution map canvases. Previously a replacement canvas could retain its default 300×150 backing buffer, enlarging and blurring the map and separating drawn ships from their hit areas. This patch checks the actual foreground and background buffers as well as window size. Same-size remount and native-resolution checks cover the reported path. It includes all of the 0.36.0 features below and accepts the same saves.

Validation: 390 regression checks passed, browser checks cover five window widths and the title-screen/continue path, and the final portable passes both campaigns, battle playback and save/close/reopen without JavaScript errors. Native fleet and battle screenshots were visually reviewed after the buffer correction.

## Version 0.36.0 — isometric fleets and battle watch

- A raised isometric world atlas zooms down to individual, clickable voxel ships. Drag to pan, scroll to zoom, use **Fleet** to inspect a force and **World** to return to the strategic map. Hovers and ship panels retain the recognition drawings and gameplay details. Enemy positions remain intelligence reports. Enlarged hulls and formation spacing are illustrative.
- The new `assets/voxels/ships/` folder contains 180 editable models: 167 authored variants covering 166 classes and 281 campaign mappings, plus 13 type fallbacks for custom designs. Historical models reference the existing recognition drawings; fictional equipment follows shared geometry. Campaign carrier conversions retain distinct silhouettes. The repository launcher reads the files directly; model changes need no asset build.
- Decisive battles raise an alert without opening a popup. **Watch battle** pauses the campaign. **Next tick** advances the entire world by exactly 15 minutes, records the resulting state and remains paused. Recorded frames can be replayed without altering time or outcomes. The scene shows actual ship-group conditions, losses and aircraft composition; impact animation does not invent individual shot results.
- Capital engagements qualify against at least 5,000 opposing warship tons. Air attacks qualify when at least 24 crewed strike aircraft attack a capital ship. Large surface battles also qualify at 20,000 tons per side and 60,000 combined. Editable rules and each report explain the decision. Unavailable reinforcements and remote launching carriers do not inflate contact strength.
- Minor actions retain staged combat, ammunition use, damage, casualties, aircraft recovery and war accounting, while their outcomes collect in a bilateral monthly attrition ledger. Replay storage and the 24-month attrition history are bounded. Older compatible saves continue; missing historical battle chronology is never reconstructed.

Validation: 389 regression checks passed, all 14 starts and 180 voxel models validate, and a six-year campaign completed all 210,240 ticks with 73 valid save checkpoints. The portable passed both campaigns, fleet clicks, battle playback, save/close/reopen and packaged-file verification without JavaScript errors. See [the systems check](SYSTEMS-CHECK.md) for scope and evidence.

## Version 0.35.0 — portable beta

- Recognition drawings use muted ONI-style notepaper. The presentation tones down white backgrounds while retaining the original asset bytes, proportions and complete views. Source, configuration and copyright details remain available under a small **Art info** toggle.
- Ship and aircraft catalogs put the type name and short description ahead of larger gameplay specifications. Smaller complete drawings also appear in their hovers, including the first fleet hover after starting. Aircraft speed labels distinguish cruising from maximum speed.
- Top controls use available horizontal space before wrapping. Resource tiles use extra rows where needed to show full totals and reserves, and war-opponent lists wrap inside their cells. Panels share more consistent spacing and type sizes.
- Legacy recognition coverage is checked against actual opening hulls, including reserve and unfinished ships, retired classes and carrier conversions. All 85 legacy classes are covered; campaign-specific drawings retain their configuration notes. Mixed legacy groups use their documented representative class.
- Malformed reference links and failures to open the Windows browser are handled without an uncaught desktop JavaScript error. Renderer isolation, local-only game hosting and permission restrictions remain enabled.
- Saving preserves non-English ship and design names even when a UTF-8 character spans network chunks. The save-size limit counts actual bytes, and failed oversized saves leave the previous campaign intact.

Validation: 361 regression checks passed, all 14 opening states and recognition assets validate, and 168 peace/wartime layout cases show no clipped resource text. The final portable passed both campaigns, artwork controls, save/close/reopen and a five-round battle with no JavaScript errors. See [the systems check](SYSTEMS-CHECK.md) for scope and evidence.

Compatible saves continue. The portable remains unsigned: Windows Smart App Control may block it under signing policy. A signing-policy block is distinct from a JavaScript runtime error and requires trusted code signing for reliable acceptance; this release does not disable Windows protections.

## Version 0.34.0 — portable beta

- Diplomatic equipment sales, industrial cooperation and strategic-material purchases/sales exchange real gold and stocks between both governments. Equipment sales transfer stored industry rather than commissioned ships. Cooperation's influence cost remains a domestic expense. AI governments protect operating reserves and decline purchases they do not need.
- AI exchanges with the player require consent. A persistent alert opens the offer in Diplomacy, showing both countries' exact payments and receipts, treaty terms and deadline. **Yes · Accept** settles the quote only if both countries can still pay and remain at peace. **No · Decline**, fourteen simulated days without a reply, or war moves no resources. Offers never open a popup or pause on arrival. Fixed quotes, a three-offer limit and a ninety-day per-partner retry limit prevent surprise charges and repeated offers.
- Both governments record trade in their actual gold and resource ledgers. These are immediate treasury/stock exchanges; they do not create GDP/GTP income or simulated merchant delivery credit. This month and last month's net transfers are visible in Economy and the relevant resource hovers.
- One world map fills the game viewport behind the sidebar, right-hand command tile, time/resource bars, news and menu panels. Map controls remain in the uncovered area; menu panels scroll independently. Marker sizes remain readable across window sizes.
- Supply hovers show every force and the actual distance, endurance, logistics and strategic factors. Fleet hovers expose physical AO cargo, delivered relief, remaining duration and transfer availability. Port depot capacity is distinguished from the fleet supply calculation.
- Convoy hovers explain outward, unloading, returning, held and diverted states, aircraft cargo and completed-voyage credit. Territory hovers identify active fighting and ceasefires correctly. Training displays respect the skill floor and research ceiling; repair estimates exclude ineligible ships. Economy panels include actual wartime repairs and trade cash flow.

Compatible existing saves continue and initialize the offer ledger automatically. The earlier 0.33 opening fleet changes still require a new campaign if upgrading from an older opening state.

## Version 0.33.0 — portable beta

- Ship and aircraft inspections display local recognition drawings, source credits and reference configurations. Historical references retain their provenance; original designs use editable SVG geometry with aligned views. All live files and registries are organized beneath `assets/recognition/`. Repository artwork changes load directly without an asset build step.
- Historical fit checks correct the A-II torpedo boat and K-class submarine armament, Arabe and Palestro mount descriptions, and the 1936 Courageous carrier configuration. Reference captions distinguish period drawings, later refits and original reconstructions.
- École France starts with 96 Mediterranean PT boats: 600 tons, 12 crew and six torpedoes per hull. These boats have no reloads at sea; fired torpedoes remain spent until the boats return to port. Maya remains available through the end of the ALB campaign.
- Gold hover separates budget estimates from actual cash flow, including ship, port and industrial repairs. The cash-flow total reconciles with the change in gold reserves.
- Active pacts and public naval-treaty compliance affect diplomatic costs and results. Strategic materials can be sold through diplomacy. Country cards retain their layout when war disables bilateral actions.
- Superseded aircraft have separate **Retire reserves** and **Retire all** controls. Retire all removes deployed airframes too, preserves aviators, and prevents pending orders from recreating a retired model.
- Keys **1–0** select menus 1–10; **+ / −** change simulation speed. Autopause sits beside SFX and Music. Command, land and strategic-air side panels match the left sidebar width, leaving more space for the map.
- Merchant dispatch targets **3%** of hulls at sea and approximately **12 convoys**. The 500,000× speed setting is removed. Requested speeds still use bounded worker slices and process every simulation tick; actual speed depends on workload.

Start a new campaign to receive changed opening fleets and platform definitions. Existing save migration preserves legal speeds and accounts for cash activity recorded before the new detailed ledger.

## Version 0.32.1 — portable beta

This release packages the completed v0.32 gameplay/UI update and preserves the unfinished recognition-art work for development on another computer. It includes all source catalogs and required offline assets; no browser, Node.js, installation or internet connection is needed to play.

Three original recognition studies (Raiden, Tillman and Maya), the drawing standard, generation briefs and remaining work are committed to the repository. The studies are not yet displayed by the game, and the broader artwork pass remains unfinished. Build caches and generated test profiles are disposable; normal player saves remain local to their computer.

## Version 0.32.0 — portable test build

- 2% merchant sailing target, approximately ten physical convoys; real round-trip delivery accounting is preserved.
- 500,000× and 1,000,000× requested speeds use bounded worker slices and report actual speed. No simulation ticks are skipped.
- Autopause defaults on. Unchecked simulation mode continues through events and loss of focus; pending choices retain deadline defaults. Manual pauses are preserved.
- AO groups use Fleet replenishment. AI recognizes multirole aircraft when evaluating replacement needs; shared design and procurement commands are exercised for all seven nations.
- Stable per-unit map leaders ease apart and retract as traffic changes. Economy cards align on equal grid tracks; time controls keep fixed slots and report actual elapsed steps.

Validation: 286 regression cases covered, all 14 catalog starts validated, and the self-contained EXE passed native interaction/save checks at 1920×1080 and 2560×1080. An eight-second visible map sample at the 1,000,000× setting produced 59.5 map FPS and about 251,513× actual simulation speed on the test computer; the 500,000× sample produced 59.2 map FPS. These are local measurements, not hardware guarantees.

Source synchronization is manual. This executable is local until Release publication is requested.

## Version 0.31.1 — local portable test build

- Merchant dispatchers target 5% of registered hulls at sea, with smaller numbers of convoy groups. Waiting port calls are hidden from the chart. Deliveries still require actual completed round trips; reducing traffic therefore reduces shipping throughput rather than granting artificial delivery credit.
- Enemy destinations close immediately on declaration. Outbound and unloading convoys divert physically to home or an accessible alternative, without delivery credit. Return voyages from already completed port calls can finish. If no refuge is accessible, merchants hold their current position until one opens.
- Only war announcements and choices interrupt play. Return to ministry acknowledges war news or leaves a choice pending until its original deadline: 14 days by default, with event-specific deadlines preserved. Pending choices remain accessible beside the news ticker; reopening pauses again. Deferring or answering resumes only a game that the dispatch interrupted. Defaults apply once, even after saving and reopening.
- All other information uses the one-pass, clickable ticker. Battle news opens its exact report; commissioning news opens and highlights the ship in Fleet register; research, contacts, land fronts and other news link to the appropriate screen. Unrelated notices on the same tick are retained.
- Popup envelopes are centered in the workspace, below the resource/news bars and clear of the menu, with no blur. Mission and status share one fleet-card line; redundant Admiral control text is removed and Reconnaissance patrol is shortened to Recon patrol.
- Resource and ship tooltips stay open when a control elsewhere loses focus during a refresh.
- The portable launcher retries removal of its own temporary payload briefly after exit, allowing Windows to release the executable's last handles.

Verification: 280 regression checks pass, 86 live catalog documents and all 14 starting states validate, and all 250 packaged source files match the workspace. The final executable passed both campaign menu exercises, deferred-choice deadlines and reopening, fixed popup placement, resource hovers, clickable commissioning and battle news, production, all 33 music tracks, saving and reopening. A five-round surface battle verified live updates, preserved report scrolling and expanded calculations, reserve-aircraft retirement, completion and a valid final save. Every normal exit removed the temporary game payload. Automated windows run offscreen to avoid interfering with the player's active session.

Requires a new campaign. Portable output remains local; source pushes and GitHub Release publication are manual.

## Version 0.30.0 — local portable test build

- GDP and GTP are explicitly labeled **GDP naval budget** and **GTP naval budget**, annual ministry allocations in fine-gold equivalents. Strategic-resource hovers and the rebuilt economic ledger show the full formula, actual contributions, expenses and monthly changes. Naval Record consolidates fleet readiness, deliveries, combat and merchant losses, recovery schedules, national scores and archived reviews.
- Pause/resume, actual-speed and time-step controls retain fixed dimensions. +15m and +6h remain visible but disabled during play; stepping always requires pause and respects mandatory dispatches. Resource cells use equal widths and a shorter fixed height. Fleet filters, searches, selections and pagination reset on new, continued and imported campaigns. Strategic air has a shorter menu label.
- Naval aircraft production defaults to Auto per role. New available models replace the selected production model unless the line was changed manually; Auto can be restored. Switching never grants free aircraft. Generic old/future 1936 naval catalogs are removed: Tillman USA retains F1/O1, other navies retain their opening designs, and ALB Japan keeps its designated progression. Players and AI commission later aircraft normally.
- All support hulls use the single AO classification, combining replenishment and local workshop support. There is no separate AD category.
- Government catalogs contain distinct models, without cloned three-year reissues. Superseded grounded aircraft retire; flights and shipments retire after arrival. Replacements still consume resources and travel normally. The 1948 fighter review uses jets, with Japan's Kikka interceptor and Italy's accelerated Vampire procurement explicitly marked as alternate history.
- Added conditional French defeat, Vichy, northern/southern Indochina and Vichy-zone occupation dispatches. They follow actual mainland control and their prerequisite events. Southern Indochina grants the Saigon station at the event, replacing the former late Pacific-opening transfer. France remains one playable naval ministry; no historical announcement fabricates ship losses.

Verification: 273 regression checks pass, all 14 opening states validate, and the portable's 249 packaged source files match the workspace. The executable passed both campaign menu exercises, automatic/manual aircraft production, session-filter resets, the rebuilt ledgers, fixed resource and time-control sizing, diplomacy, all 33 music files, saving and reopening. A five-round surface battle verified live report updates, reserve-aircraft retirement, persistent expanded calculations and scrolling, and a valid final save. A focused 24-check recheck also passed after the final display-label corrections.

Requires a new campaign. Portable output remains local; GitHub Release publication is separate from source pushes.

## Version 0.29.0 — local test build

- Routine notices pass once through a slow news ticker; hover holds the message. Decisions and major world events, including the war in China, pause play and open mandatory dispatches. Acknowledgement resumes only an interrupted game. Popups use fixed envelopes and consistent footer positions. The alert counter and obsolete auto-pause toggle are removed.
- Merchant traffic is visible in peace and war. Dispatchers keep 20% of registered hulls sailing, subject to available routes and operational interruptions; ships call at ports and return physically. Deliveries count surviving manifest GRT once on completing the round trip. Displayed delivery coverage may exceed 100%; the logistics contribution stays capped. Hovers show hulls at sea, convoy count and average hulls per convoy.
- One AUX support type combines local depot work and physical replenishment at sea. Every navy receives 1922/1932/1942 catalog generations except ALB Japan, which retains its Standard Maru hybrid. Existing opening support counts are preserved; the United Kingdom's incomplete oilers now have operational specifications.
- Fleet supply multiplies distance, hull endurance, national logistics and strategic availability. Logistics gives no penalty at 100%, 10% at 50%, and 20% at zero. Empty strategic reserves halve supply and replace the old direct naval combat penalty; movement, aviation and production retain their own constraints.
- The 1941 Republic class adds a 200,000-ton Tillman successor with six triple 546 mm turrets and Columbia armor. A Columbia-calibrated displacement/speed estimate gives 521,742 shp, rounded to 522,000 shp, for 32 knots. This is an alternate-history design estimate with provisional cost and machinery assumptions.
- Task-force order and aggressive-battle controls are removed. Admirals choose missions, routes and engagements. Clicking a fleet circles it on the chart and highlights its list entry; hover retains readiness and ship details.

Requires a new campaign. The only distribution is the self-contained portable Windows executable. This version remains local until publication is requested.

## Version 0.28.0

- Civilian hull production uses each nation's opening GTP/GRT benchmark. Base output ranges from one hull/month with sufficient capacity to ten after a complete loss. Logistics multiplies output by 0.5 at 0%, 1 at 50% and 2 at 100%; industry upgrades add 15% each. Fractional hulls carry forward. This replaces percentage hull growth and retirement; GTP growth and 0.1% monthly average ship-size growth remain separate.
- Minor naval actions no longer change national morale. Significant completed actions use shared loss thresholds; territorial occupation and liberation affect the actual governments involved. Training, funding, event and recovery effects remain.
- The campaign war score counts enemy naval tonnage sunk, without victory-count points or the former score cap. Reports show their morale result.
- Occupied home economic regions deny their share of productive GDP. Liberation restores access; bombing remains a separate damage multiplier. Overseas islands have no direct GDP effect. Blockade denies port access; occupation transfers ports and their trade contribution.
- Shipping, GDP, morale and resource hovers explain the calculations. All coefficients and home-region shares are read from the live Markdown catalogs; 85 data documents and all 14 starts validate.

Requires a new campaign. Local portable output stays in `.build/releases/`; this version is not uploaded until publication is requested.

## Version 0.27.0

- 33 licensed music tracks, with distinct national selections and separate peace/war playlists. Changes fade smoothly; paused music remains at one-third volume.
- Separate workers for authoritative simulation and read-only display summaries, alongside the UI thread. Geographic lookup optimization reduces repeated navigation work without skipping ticks.
- Warships apply blockade pressure according to crew, damage and strategic readiness. Support hulls no longer supply combat power through their tonnage alone.
- Aircraft modernization at anchorages without shore storage retains the existing air wing and safely handles the arriving replacement flight.
- Reinforcements clear unreachable or obsolete rendezvous orders and consolidate only at physically shared friendly ports. Refuelling commands can merge, and a consolidation pass cannot assign ships to a command it already removed. This fixes stranded command accumulation in long wars.
- Soundtrack records, air-war tuning, opening theater allocation, national mission preferences and historical territorial changes are read directly from editable catalog documents. Duplicate music metadata, credits lists and unused port specifications have been removed. Validation checks that all 84 data documents are actually loaded.
- Portable output and build metadata stay in ignored `.build/releases/`. No `dist` folder is tracked or maintained. Source pushes and Release publication remain manual.

Use a new campaign for beta testing. Report the version, campaign, nation and a save with any issue. Large gameplay changes remain proposals until approved.

### Version 0.27.0 verification

- 249 regression checks pass; all 14 opening states validate. Moving the remaining opening deployment rules into catalogs preserved all 14 states exactly.
- Both all-seven-AI campaigns completed through 1950: 1,013,376 fifteen-minute ticks from 1922 and 525,984 from 1936, with saved-state, resource and fleet-reference validation at 527 monthly boundaries. An additional 35,040 ticks carried the 1936 sandbox through 1951 after the final fleet-order fixes.
- The final portable passed both campaign menu exercises, designs, diplomacy, funding, all music files, save/reopen and a five-round surface battle with a live, scrollable report.
- The portable includes 33 playable audio files, approximately 117 minutes in total, with track-by-track attribution.
- A visible portable-window check on the development computer sustained 60 FPS map movement while scrolling at the 100,000× simulation setting. The largest observed UI frame gap was about 33 ms. This is a measured opening-campaign result, not a minimum hardware guarantee.
- A larger 1945 wartime save measured approximately 51 FPS map movement while scrolling, with a largest UI frame gap of 133 ms.
- A 30-day headless opening-campaign benchmark improved from 19.6 to 8.8 seconds. A separate seven-day wartime route-cache comparison improved from 6.64 to 5.94 seconds and produced an identical final saved state. Fifteen-minute ticks are preserved; overloaded machines run more slowly.
