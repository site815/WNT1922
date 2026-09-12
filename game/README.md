# Current air-warfare rules

Release 0.19 adds [automatic operational air warfare](../docs/operational-air-warfare.md). Air engagements now resolve through scheduled sorties; older descriptions of combined instantaneous carrier/surface power below refer to strategic estimates. Aircraft use separate naval and government ledgers, explicit basing and physical reinforcement. The main test build is the Windows portable executable.

# WNT1922 — playable Windows build 0.18.1

Double-click **Play-WNT1922.cmd** in the project root, or open [the running game](http://127.0.0.1:19222/). The launcher opens a maximized app window with normal Alt-Tab switching. Menu also offers fullscreen. Play and saves remain on this computer. For distribution, extract the entire Windows ZIP and run WNT1922.exe. The runtime is bundled. See [build instructions](../docs/building.md).

## Start and controls

Choose **The Treaty System — 6 February 1922** or **In Good Faith — 1 January 1936**. Both support the United Kingdom, the United States, Japan, France, Italy, Germany and the Soviet Union. In Good Faith adds France's **La Revanche de l'École**, Italy's Mediterranean **Mare Nostrum** and the Soviet battleship/carrier **Krasny Okean** program to the existing four divergences. Campaigns start and reload paused.

- **Command Map:** the large world map sits beside a narrow right-hand information and control panel. Click a fleet, convoy, port, capital, territory or front to inspect it there. Fleet rows show composition, such as 2 CV · 2 CA · 4 DD; hovering a friendly marker shows composition and individual ship damage, status and staffing. Fleet-card hover shows training, morale, supply, condition, endurance, speed and individual ships. Select a force for its orders, assigned ships and operational details, all open immediately. **All commands** returns to the list. Each player fleet retains its own mission; admirals select destinations, routes and encounters. **Seek aggressive battle** is a separate checkbox, off by default: admirals accept greater risk and press attacks longer.
- **Land campaigns:** main menu 02 shows current land and island campaigns, with supply and progress; select a front to inspect it on the map.
- **Ship catalog:** order a current catalog class or use **New design draft** in the catalog to commission a class. Obsolete and superseded production lines are hidden; existing hulls and funded construction remain. Future ships and aircraft show an Under development countdown and their catalog date, with no purchase controls until then. The countdown does not fund qualification automatically. Hover a ship or class name for a compact class specification overlay. Click a ship for its individual condition, sailors, air wing and assignment; click a class name for its full specifications. The integrated queue above the catalog graphs total national throughput, committed and overloaded capacity, and spare capacity. Hull quantity uses a horizontal slider. The construction queue grows to show every order, with page scrolling when needed. Long design catalogs retain pages.
- **Aircraft catalog:** immediately after Ship catalog, with fighter, strike and scout model selectors above the available and future aircraft. Qualified newer aircraft replace older aircraft of the same role when ships are in port; replaced airframes return to reserve and still require aircrews.
- **Fleet register:** warships, support hulls and merchants share one searchable page, with separate totals and units. Search by name or ship type, then reserve, recommission or permanently scrap hulls. A reserve order at sea creates an interceptible return journey; crew and aircraft remain aboard until arrival. Scrapping requires a physical return to port if the ship is at sea. Arrival returns 5% of remaining-condition displacement as industry, once; an intercepted and sunk ship yields no salvage. Ships already in port are scrapped immediately. Surviving personnel and aircraft remain in their pools.
- **Facilities & research:** naval industry, aircraft factories, naval schools and naval aviation schools each have **10–100% funding and their expansion button in the same panel**. Research and doctrine cards follow the four facilities on the same page. School cards show calendar progress, next graduation date and funded trainees. All four facilities start at 50% funding. Your funding changes only when ordered; there is no wartime auto-raise control. AI governments continue to plan their own budgets. Upgrade explanations sit beside their upgrade controls at the bottom of each panel.
- **Top alerts:** all ministry dispatches, decisions, contacts and results appear here. Only contacts belonging to current wartime opponents create alerts; peacetime reports remain visible on the chart. Contact alerts show the observed strength, source, coordinates, confidence and search radius; **Locate on chart** selects the report in the right command panel. Contact alerts expire after 48 game hours without an update, including an alert currently being read. Dismissed reports stay dismissed during continuous tracking; reacquisition after a stale gap alerts again. Unavoidable demands show deadlines and explicit default outcomes. **Auto-pause** controls these demands. War warnings, declarations and pact/call-to-arms dispatches always pause and open a compact popup; acknowledging them resumes a previously running game after all mandatory choices are resolved. Multiple mandatory demands keep play paused until all are resolved; manual pause and loading a save keep play paused. Battle and convoy-combat notices expire after 48 game hours; ongoing land/island assault notices stay visible and expire 48 hours after resolution or ceasefire. Full battle reports remain in Battle reports. The alert rail keeps a fixed 48 px height whether empty or scrolled. **Clear all optional** dismisses routine alerts and keeps mandatory decisions. Choosing an option shows its result directly without adding another alert. Inspection requests lapse when limits expire, either participant withdraws or the requester enters war.
- **Time:** Space pauses; **1–5** select 2,500×, 5,000×, 10,000×, 50,000× and 100,000×. Paused **+1m** and **+1h** controls step time. The date includes the selected capital's local time. Hiding the tab pauses play.

Sound includes clicks, order acknowledgments, battles, alerts and a distinct war-start cue. Pausing fades music to one-third volume and makes the paused indicator pulse; resuming restores the chosen music volume. Fifteen bundled tracks provide about 45 minutes of orchestral music, ambient pieces, piano jazz and ragtime. Music starts after the first interaction; all sound and music toggles, volumes and track skip are in the top bar. See [music credits](assets/music/CREDITS.md). Saved mute and volume preferences are retained.

**Escort coverage is always visible** on the map: green rings around covered convoys, red dashed rings around exposed convoys, and the actual geographic reach of active escort forces. An operational surface force on an Escort mission within **148 km** (80 nautical miles internally) can defend a same-nation convoy. Its defense includes ASW, surface strength, training, morale and supply. Returning, repairing, refueling, docked, submarine and support forces do not count. Coverage is not guaranteed safety: strong raiders can overwhelm escorts. Select or hover a convoy for its coverage; the panel lists protecting forces and the nearest eligible escort. No hidden enemy position is used. Crowded friendly symbols are separated for clicking with leader lines to their actual positions.

## Time and performance

| Setting | Multiplier | Real minutes per game year |
|---|---:|---:|
| Very slow | 2,500× | 210.4 |
| Slow | 5,000× | 105.2 |
| Normal | 10,000× | 52.6 |
| Fast | 50,000× | 10.5 |
| Very fast | 100,000× | 5.3 |

Every crossed **game minute** processes movement, scouting, encounter opportunities and demand deadlines. Battles can happen at any minute. Construction, factory production and training accrual operate daily; sailor graduation, appropriations and diplomacy operate monthly. Aviator graduation is quarterly on 1 January, April, July and October. Fractional display frames neither duplicate nor skip minute ticks.

**Simulation runs in a dedicated Web Worker**, separately from rendering. The worker processes one-minute operations with a bounded time budget and queue. Requested speed is a ceiling: under load game time advances more slowly, and no operational minutes are skipped. The top bar measures achieved speed over 2.5 seconds, yellow below 90% of the target and red below 65%. Orders, purchases and decisions are serialized inside the worker and apply atomically to its current state; invalid orders roll back. The UI receives prepared summaries and reconciles changed elements without replacing active controls, report scrolling or unchanged map geography. Saves request a fresh worker snapshot. This uses a second CPU thread; it does not distribute individual fleets across every core.

Friendly fleet and convoy movement targets 60 fps through lightweight interpolation of received worker snapshots. Enemy markers remain at observed positions. Whole-interface updates remain about once per second; map geography is not rebuilt on every animation frame. Motion continues during dragging, held pointers, wheel zoom and side-panel scrolling. Land lines and island rings sweep back and forth. Paused and hidden maps stop animating, and delayed snapshots freeze movement at the latest known state.

The crowded seven-navy benchmark measures every supported speed. Results vary with combat and machine load; 100,000× is an adaptive ceiling, not a guaranteed rate. See [current validation](VALIDATION.md) and [benchmark-result.json](benchmark-result.json).

## How the statistics work

The compact bar shows gold, influence, industry and trade, followed by shipping demand, port trade, training, morale, logistics, active-fleet supply, funded yards, signed sailor and aviator balances, and aircraft. Losses and rescues belong in battle reports and the combined Naval record. Hover values for details.

**Submarines contribute zero surface-gunnery power.** Their separate base strength is `torpedo tubes × 16 × (1 + submerged speed / 25)`. Engagement strength includes `1.2 × submarine strength / (1 + enemy ASW / max(100, submarine strength))`. Preparation and supply modify force components; enemy ASW also affects submarine detection and damage. These are provisional auto-resolution equations, not ballistic trajectories.

**Training and morale are national preparation values applied to each fleet.** Training starts at 65, loses `0.0025 / (1 + 0.2 × training upgrades)` points daily and gains 9 when a funded training cycle completes; that cycle also adds 3 morale. Morale starts at 75, slowly returns toward 75, gains 3 for a battle win and loses 5 for a defeat. Events can change it. An empty treasury at the monthly budget check costs 3 morale and 2 logistics. Combat multipliers are `0.5 + training × 0.0065` and `0.65 + morale × 0.005`. Naval-school expansion increases sailor throughput, separately from fleet training quality.

**Base logistics starts at 70.** Effective logistics equals base quality × (domestic share + trade share × merchant-capacity coverage × port-trade coverage). Supply-and-maintenance projects add 8 and improve repair rate. Fleet supply combines this quality with trade, mission demand and navigable distance to the nearest friendly/allied port. Port demand follows the fleets’ physical positions, including allied fleets, rather than their future ordered destinations:

| Distance to accessible port | Distance factor |
|---|---:|
| Up to 926 km | 100% |
| Over 926–2,778 km | 90% |
| Over 2,778–5,556 km | 75% |
| Over 5,556–9,260 km | 55% |
| Over 9,260–14,816 km | 35% |
| Beyond 14,816 km | 20% |

The formula is `logistics / 100 × distance factor × port capacity coverage × (0.55 + trade / 220) × mission modifier`, clamped to 5–100%. Occupation or alliance access can change the closest port. Fuel and endurance separately constrain routes and refueling. There is no overseas-base funding mechanic.

**Economy & trade includes a complete operating budget.** Its planned monthly balances include hull upkeep, treaty secrecy, naval industry operations, aircraft production and both schools. Procurement, research, diplomacy and damage repairs remain additional. Top-bar gold and industry hovers use the same forecast.

**Gold arrives automatically as monthly naval appropriations.** There is no player tax-rate system. Gross monthly appropriation is `base annual budget / 12 × (domestic share + trade share × shipping coverage × convoy flow × port-trade coverage)`. Hull upkeep and concealment are deducted monthly; schools, aircraft, industry operations and repairs charge gold as they run. Trade disruption lowers the budget. Influence accrues monthly through government support, multiplied by the same domestic/trade income factor. Naval industry output uses that factor too.

| Nation | Domestic / trade income |
|---|---:|
| United States | 80 / 20% |
| Soviet Union | 85 / 15% |
| Germany | 70 / 30% |
| France | 65 / 35% |
| Italy | 60 / 40% |
| Japan | 55 / 45% |
| United Kingdom | 40 / 60% |

Required shipping capacity is opening merchant GRT × (1 + 15% × (naval-industry level − 1)). Coverage is available / required GRT, capped at 100%. Each merchant loss removes its capacity; new freighters restore it on delivery. The header and Economy & trade show available and required capacity, shares, coverage and effective logistics. These are approved provisional balance values. The Soviet 1922 baseline uses a clearly marked 100,000-GRT proxy alongside its provisional 100 hulls.

**Industry stock and yard throughput are different quantities.** Orders pay stock immediately. Base national yards, industrial expansion, funding and paid operating costs determine construction throughput. Each industry expansion adds 15% of base output and yard capacity. At 10% funding, funded capacity is one tenth of the equivalent 100% capacity. Simultaneous orders share throughput, delaying commissioning. Today’s operating costs must be paid before today’s yard work. The yards are one abstract national pool. Major dockyard capacity provides relative weights: damage or occupation removes the affected dock’s fraction of that pool. Losing an anchorage or waystation affects supply and trade, but does not by itself remove shipbuilding throughput. Daily industry output also depends on trade. The header's industry estimate uses the last observed operating-cost coverage.

Port-trade coverage is accessible trade value / opening national trade value, capped at 100%. Available trade value sums each controlled port’s nominal trade weight × condition × (1 − blockade). Nearby hostile deployed forces contest access within approximately 120 km; siege forces exert more sustained pressure, friendly forces and coast defenses resist it, and the blockade is reassessed each game hour. Loss of merchant tonnage and loss of port access are separate bottlenecks. The domestic share is preserved. [All 44 ports and their 1922/1936 profiles](../docs/strategic-ports.md) are generated from the runtime catalog.

## Personnel, aircraft and casualties

Sailors, naval aviators and aircraft are separate pools. **Every owned aircraft demands its model's full crew**, including aircraft in storage. The bar displays available aviators minus all required aviators; shortages are negative. An aircraft lacking a complete crew provides no flying combat or scouting power. Deployed wings retain their aircrews; aircraft are assigned at friendly ports or arrive through physical reinforcement flights and transports. Sailors also have a signed surplus/deficit. Ships must have their complete complement before leaving port. Unstaffed ships wait ashore; escorts and submarine forces receive crews before large battle lines. Casualties at sea reduce weapon handling and damage-control effectiveness without teleporting replacements. A ship’s actual sailors aboard remain visible in its command manifest.

Battle reports show permanent sailor, aviator and aircraft losses plus rescued personnel and repairable airframes for **both sides**. Nearby friendly/allied destroyer escorts within 222 km and estimated control of the battle area improve rescue. Sailors return after **14 days**, aviators after **21 days**, aircraft after **30 days**. Sunken carriers' aircraft still in the hangar cannot be salvaged. Aircraft already airborne may divert to a reachable base or compatible ship. Each return is credited once. The losses and recovery section in Naval record tracks cumulative losses, rescues, recovered survivors and pending returns.

Schools graduate **sailors every month on the 1st** and **aviators on 1 January, April, July and October**, using the simulation calendar. Funded annual capacity accrues daily in separate training pools, divided by the number of days in that year; whole personnel join the available resource only on graduation. Fractions carry into the next batch. Funding and costs remain daily, resource shortages reduce accrual, and changing funding does not erase paid training. The first batch covers only training since campaign start. Rescued personnel still return on their recovery dates. School expansions add 500 sailors/year; aviation schools add 100 aviators/year; aircraft-factory expansions add 35% of base production. Training costs 3 gold and 0.15 industry/sailor, or 25 gold and 2 industry/aviator. Aircraft cost their model's gold price and empty mass / 80 as industry. Output scales with funding and resources. Factory capacity is split equally among active role lines. Explicit prepaid production batches and continuous lines share that capacity, preventing double production. Model changes affect future production. Qualified newer aircraft replace older like-role wings at port; old airframes return to reserve. Wings at sea are never changed by this process. Aircraft and aviators are conserved during transfers. Aircraft model development costs 800 gold, 8 influence and 300 industry and takes 180 days after funding, beginning no earlier than the model year. The displayed duration is model qualification, not the production time for every aircraft. All ships, aircraft and dated technology have hard development-year gates.

All four facilities start at 50% funding. Base aviator output per year is JPN 400, USA 700, GBR 500, DEU 180, FRA 300, ITA 280 and SOV 320, before expansion and funding. These are provisional trained-aircrew game capacities, including multi-seat aircraft crews. All owned aircraft count toward demand. At 50% factory funding, production can outpace aviator graduation: uncrewed aircraft remain grounded and the deficit stays visible. Expand aviation schools or reduce factory funding to change that balance. Opening sailor pools have been raised for the USA, UK and Germany to staff their authored starting rosters. See the [previous opening-budget audit](AUDIT-0.15.md), [current realism review](AUDIT-0.17.md), and [base-aviation establishment and costs](../docs/base-aviation.md).

## Ship designs and operations

Generated and manual drafts share role, displacement, guns/caliber, torpedoes, armor, speed, endurance and aircraft controls. Period limits and displacement allocation constrain the fit. Automatic drafts begin with a contemporary class from the national scenario and respond to strategic priority. Pay the **gold drafting fee** to register the class, then order hulls using gold, influence, industry and time. Saved recipes are revalidated into class statistics. AI ministries can develop contemporary drafts and aircraft.

Weight estimates allocate hull, machinery, weapons, protection, fuel and aircraft space. They do not simulate stability, turret geometry or machinery design. Existing alternate super-heavy classes retain their authored specifications; new drafts use the shown period bounds.

Unspecified opening stations are distributed among national bases, using capacity and navigable distance while preserving explicit roster deployments. This prevents the entire US or UK navy starting at one overloaded anchorage. Later movements retain normal travel, range and interception rules.

Warships form approximately **2–20 operational task forces** by role, speed, endurance and location. Carriers receive screens; submarines have flotillas. Repair and reinforcement detachments may temporarily exceed the limit. Reassignment at sea creates a physical rendezvous journey. Missions separately protect shipping, patrol/reconnoiter, raid commerce or intercept fleets. Escaping unequal battles depends on strength, speed and scouting.

The top resource bar’s war assessment identifies every opponent and estimates who is leading. It combines sunk tonnage, 35% of damage-equivalent tonnage, 15% of merchant GRT sunk and relevant land-front progress. It is an assessment, not a surrender or victory condition; the ledger persists after old individual reports expire.

Battle variation is usually ±8%, with a 0.2% exceptional-upset check. Victory grading compares sunk tonnage plus 65% of damage-equivalent tonnage. Serious damage below 65% condition is red and forces a physical repair detachment; moderate damage is yellow and may remain in the field. Returning ships can be intercepted and repair only after reaching port. If the whole flotilla returns, it keeps its identity; otherwise the damaged ships and a suitable escort form a separate command. Aggressive fleets multiply outgoing damage by 1.4 and their own exposure by 1.2; both sides’ choices can make an engagement much more destructive.

## Registers and world map

Warships, naval support and merchants remain separate. Japan's 1936 merchant total is **2,146: 500 Standard Maru plus 1,646 other merchants**; its ten depot conversions are support. All seven merchant baselines use period Lloyd's tables except the **100 provisional Soviet 1922 hulls**, visibly marked and approved pending verification. GRT is registered volume, not naval displacement. Eight moving convoy packets per navy expose part of the merchant register to attack; these are not individually simulated civilian voyages.

The original four alternate retirement plans remain. The Treaty System uses historical catalogs, authorized construction, conversions, treaty-disposal decisions and useful reserves. Partial Soviet legacy coverage and hypothetical versus historical assets are documented in [CAMPAIGN-SOURCES.md](data/CAMPAIGN-SOURCES.md).

The **Equal Earth** chart shows national colors, dark-gray other countries, major ports and capitals, occupation, thirteen strategic land campaigns and nine island objectives. Drag to pan around the globe and scroll to zoom up to 64×. Click a port for its facilities, trade and blockade state. Own fleet and convoy markers show actual positions; enemies show reported positions only. Confidence fades through fresh, recent, uncertain and stale stages, expiring after seven days.

Natural Earth public-domain geometry supplies independently authored, approximate 1922 and 1936 game borders, with the latter shown from 1936 onward. Intermediate annual border changes and small disputed areas are incomplete. Equal Earth is implemented locally; no UN map artwork is included. [Map sources and license](data/MAP-SOURCES.md).

Land warfare uses strategic corridors and island objectives rather than individual divisions. Pacific campaigns start when war actually begins. Weak islands can fall within days or weeks if nearby surface fleets and merchant supply support the landings; major bases take longer. Captures transfer port access and trade, counter-invasions can restore control, and ceasefires freeze progress. [Island rules and provisional balance](AUDIT-0.9.md). Sustained naval-supply advantages can reverse progress and occupation, much more readily on islands than continental interiors. In Good Faith, Poland's invasion and British/French entry vary at most 60 days around September 1939, independently of naval relations. The Treaty System tension can move that onset by up to one year; aggression can cause earlier naval wars. Italian entry and the German–Soviet war follow later historical anchors. Reviews occur in 1940, 1945 and **1950**, with continued sandbox play.

## Saves and development

The Windows executable saves to `%APPDATA%\WNT1922\saves\campaign.json`; source/browser play uses `game/saves/campaign.json`. Both retain the previous valid file as `campaign.backup.json`. Normal desktop closing saves a paused snapshot before exiting. Autosaves follow actions and run at least monthly, with a browser recovery journal. **Menu → Export save file** makes a portable copy. Imports validate before replacement. Tests use isolated directories or read-only copies of the player's save.

**Start a new campaign to use the revised opening balance and station assignments.** Compatibility with previous-release saves is not a release requirement. Local disk saves and export remain available.

All unauthored balance remains provisional. `src/balance.mjs` owns economies/projects; `naval-resources.mjs` production/staffing; `logistics.mjs` distance bands; `recovery.mjs` survivor accounting; `designer.mjs` draft estimates; `task-forces.mjs` operations; `land-war.mjs` fronts. `data/playable/` owns the new national catalog supplements; the loader and [28 Markdown catalog summaries](../docs/playable/README.md) use those same data. `merchant-economy.mjs` owns national trade shares and capacity demand; `port-trade.mjs` owns blockades, trade access and dockyard availability. Operational range is shown in kilometers; routing retains nautical miles internally and converts at UI boundaries. No multiplayer or promotional-fiction content is included.

```powershell
node tools/build-game.mjs
node tools/play.mjs
node --test --test-isolation=none --test-skip-pattern 'all selectable|multi-year|old campaign migration|untouched old opening' game/test/*.test.mjs
node tools/check-game-renderers.mjs
node tools/check-playable-catalogs.mjs
node tools/benchmark-game.mjs
node tools/check-browser-play.mjs
node tools/check-long-campaigns.mjs
```

See [VALIDATION.md](VALIDATION.md) for actual checks and limits. Suggested next additions are scheduled exercises, ship refits/air-wing replacement policies, and a monthly budget forecast with reserve targets; these are not enabled mechanics.

## Facilities, ports and interface

All skills, technologies and expansions start at **level 1**, upgrade through **level 9**, and retain their opening capability at level 1. Bonuses count completed upgrades (`level − 1`). The four equal-sized facility cards are naval industry, aircraft factories, naval schools and naval aviation schools; model selectors are at the top of Aircraft catalog. **Carrier air operations doctrine** replaces the ambiguous aviation-program name. **Damage-control organization** adds 6% damage resistance per upgrade (incoming damage divided by `1 + 0.06 × upgrades`), improves repair by 6%, and adds 1.5 percentage points to sailor rescue chance per upgrade. **Naval intelligence coordination** improves search coverage by 8% per upgrade and signals-report frequency.

The sidebar has ten main entries: Command Map, Land campaigns, Ship catalog, Aircraft catalog, Fleet register, Facilities & research, Diplomacy, Battle reports, Naval record, and Economy & trade. There are no nested menus. The construction queue is integrated into Ship catalog; losses and recovery are in Naval record. Command Map has no national standing directive. The chart has no header, with a single bottom row for symbols, national colors and map credits. Scroll or press + / − while the map has focus to zoom; Home resets the view. Fleet manifests and operational details open immediately inside the right command panel, while individual ship inspections open from the manifest or register. Fleet details show every assigned ship in one scrolling list, with no page selector. The register summary cards jump to warships, support or merchants and clear active filters. The combined ship register places legacy and reserve warships below the main warship fleet, followed by support and merchant hulls, preserving every ship's actual service status. Registers, research and battle reports use normal scrolling. Funded expansions and diplomacy cooldowns retain the exact button footprint, including progress and completion or next-use date. Research is sorted by availability and displays current and next-level instructions from the shared [126-level technology tree](../docs/tech-tree.md). Time and audio controls remain usable while a battle report is open; live updates continue while an input has focus.

The first persistent bar contains capital date/time/timezone, speed/pause and all sound/music controls. The second is the resource bar; the third contains dismissible alerts. Mandatory demands require confirmation before dismissal applies their stated default. Economy & trade has its own main menu; the personnel loss/recovery ledger is included in Naval record. Individual reports include losses and rescues for both sides. Treaty policy is the first panel in Diplomacy and shows the actual policy and current treaty status. Diplomatic costs are available on hover. Map convoys and fleets use their nation’s color; icons and port names have black outlines and remain present at every zoom.

Ports expose supply capacity in supported warship tons, assigned demand, condition, artillery power and actual stationed aircraft. Shore wings need complete aircrews and finite aviation supplies; reinforcements arrive by ferry, domestic transport or vulnerable merchant shipping. Each aircraft model uses its own combat radius. Coastal gun range comes from the battery profile, with representative profiles clearly marked. **Raid anchorage** strikes ships in harbor and withdraws to replenish. **Siege port** sustains facility bombardment until the force needs to withdraw. Admirals select reachable enemy targets and respect war status. Port health reduces supply, defense, trade and the major dockyard’s share of national yard throughput. Port strikes do not capture territory; land campaigns determine occupation. See [base aviation and coastal defense](../docs/base-aviation.md) for range profiles, stores, transport and casualty rules.

Safe damaged ports automatically restore up to **0.8 percentage points/day**, spending **128 gold and 96 industry/day** at that full rate, scaled down when the remaining damage or budget is smaller. No repair occurs during the first 24 hours after an attack. These capacities, defenses and trade weights are provisional playtest values in `port-catalog.mjs`; repair costs are in `ports.mjs`; strike scheduling is in `port-operations.mjs`.

The simulation worker now spends accumulated wall time in whole one-minute steps. Fractional time targets are canonicalized consistently, preventing a tiny target from rounding backward and trapping the time loop. Worker checkpoints, failed-render handling and an eight-second watchdog preserve the last received campaign state on failure. Resume creates a replacement worker. Engine throughput is still a ceiling; overloaded machines advance more slowly.

Convoy combat uses crew and hull condition, training, morale and supply. Escort ASW improvements apply to convoy defense as well as fleet battles. Submarines contribute submarine attack, not surface guns or escort ASW. Carrier power is invariant when an aggregate group is split into individual hulls; airframes and aircrews are conserved. Carrier loading reserves scout space before filling strike squadrons. Depot ships and oilers are available through the ship catalog. Admirals create vulnerable support groups, relocate depots to busy friendly bases, and route oilers to physically meet fleets before transferring endurance and temporary supply relief. There is no global support-hull bonus. [Support rules and provisional capacities](AUDIT-0.11.md#vulnerable-automatic-support-groups).

Insults replace ministry ultimatums; naval provocations require a ready fleet and can cause a local clash. Ceasefire offers are possible immediately, with a displayed 5–90% acceptance chance, a negotiation fee, settlement paid only on acceptance, and a 30-day retry cooldown. [Diplomacy costs and exact acceptance formula](AUDIT-0.11.md#diplomacy-rules).

See [the UI release audit](AUDIT-0.17.md) for current changes and proposals, and [the previous mechanics audit](AUDIT-0.9.md) for Pacific campaign rules.

## Release 0.16: base aviation and ministry accounts

Ports now show actual stationed aircraft, full aircrews, model combat/ferry ranges and finite aviation stores. Aircraft ferry between reachable bases and carriers, with merchant transport for longer sea crossings and domestic rail delivery where applicable. Cargo can be sunk, and captured bases lose their former air groups. The warehouse does not teleport its stock when overrun. Opening shore strengths and most coastal batteries are explicitly provisional; see [base-aviation rules and sources](../docs/base-aviation.md).

Fleet-register rows end with selection checkboxes. Reserve, recommission or scrap qualifying selected hulls together; selected ships at sea still need to return. Escort coverage is always shown. Hover any resource for the account breakdown; each facility displays gold and industry use at its funding level. Fifteen local, attributed music recordings are included.

[Full gameplay/realism review and proposed larger changes](AUDIT-0.17.md) · [Validation evidence](VALIDATION-0.17.md). Start a new campaign; save compatibility is intentionally not preserved.

## Release 0.17: warning periods and diplomacy

Historical starting relationships now cover all fourteen starts. Monthly historical trends, treaty mistrust, strategic war pressure and warning risk are visible in Diplomacy. Ordinary wars have an irrevocable 1–12 month preparation interval; historical European warnings count backward from the retained outbreak windows. Warnings and declarations pause for acknowledgement. Multiple allies and three-power alliances support join/refuse defensive calls. Political agreements, including the Axis and Anti-Comintern Pact, are distinct from military alliances. [Exact rules, starting scores and historical sources](../docs/diplomacy.md).

Treaty System introductions are shorter. The start screen omits the repeated campaign-end explanation. Fleet details scroll continuously; register totals jump to their categories, with source references retained in documentation. Facilities all start at 50% with no automatic wartime increase. [Beta distribution recommendation and packaging work](../docs/beta-release.md).

## Release 0.18: distribution

Political map geometry now comes from Natural Earth (public domain), with approximate authored historical overlays. All fifteen music recordings were reverified against the composer’s originals and CC BY 4.0 credits. The Windows portable build includes Electron, runtime notices and source archives, asset/file manifests, and saves outside the install folder. Source and build automation are versioned in Git. [Asset audit](../docs/asset-audit.md) · [Building and sharing](../docs/building.md).
