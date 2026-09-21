# Portable releases

[Latest release](https://github.com/site815/WNT1922/releases/latest) · [Release index](https://github.com/site815/WNT1922/releases)

Open the latest release and download **WNT1922-0.33.0-portable-win-x64.exe** from Assets. Portable filenames retain their version number. This is the only game distribution: one self-contained executable for Windows 10/11 x64, with the browser engine, catalogs, maps, recognition artwork and music included. No installation or internet connection is required to play. Its SHA-256 checksum is provided alongside it. Saves remain in `%APPDATA%\WNT1922\saves`. The beta executable is unsigned.

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
