# Release 0.7 audit and next decisions

This release reconciles the playable game, its interface, both campaign snapshots and the generated national platform/equipment catalogs. The original detailed naval studies remain reference material; deferred modes and physical models are identified as concepts in the scenario documents. Fiction and manga are excluded.

## Corrections made

| Area | Fault found | Result in 0.7 |
|---|---|---|
| Interface stability | A design-input change could trigger another render while the browser was replacing that input. | Reentrant renders wait until the current replacement finishes; typed draft values are captured before an order. Real browser regression covers this failure. |
| Worker timing | Rapid resume/pause could repeatedly retain the paused timer and never advance. | Resuming reschedules the worker immediately. Bounded time debt and whole-minute accounting remain. |
| Carrier power | Aggregate wings were multiplied by the number of hulls twice. | Grouped and individually split carriers produce the same power. |
| Aircraft allocation | Rounding each model toward the first hull could overfill its hangar. Strike planes could occupy the intended scout space. | Mixed wings are distributed with a shared cursor; carrier scout space is filled before remaining strike capacity. Aircraft and aircrews are conserved. |
| Convoy combat | Escort upgrades, preparation and sailor casualties did not affect the simplified raid formula. Every submarine had the same attack value. | ASW upgrades, training, morale, supply, health and crew now affect raids. Submarine attack uses the same torpedo/submerged-speed specification formula as fleet combat, scaled by 0.2 for convoy resolution. |
| Port supply | Demand was assigned to the ordered destination rather than the nearest accessible port to the fleet's current position. | Supply and port demand use the same navigable-distance lookup, including allied demand. An enemy port cannot also qualify through an alliance flag. |
| Yard funding | Construction could use yesterday's paid operating level before today's operating cost was settled. | Daily operating payment precedes daily construction. Zero paid capacity suspends work. Header, facility panel and queue graph use the same capacity function. |
| Reserve orders | A deployed ship could enter reserve immediately and free its crew at sea. | A reserve transfer sails home from its actual position and remains interceptible, retaining its crew and aircraft until arrival. Immediate scrapping retains the separately approved behavior. |
| Spending | A tiny affordability tolerance could leave a negative balance and fail save validation. | Successful payments clamp rounding residue to zero. Continuous funding and port repairs also keep nonnegative balances. |
| AI development | A preferred capped or date-locked project could block alternative investment; an old catalog entry could repeatedly block design development. | AI checks other affordable current programs and only considers available, non-obsolete designs. |
| Scenario data | Some 1922 aggregate construction statuses existed only in loader exceptions. Review dates differed between data and runtime. | Opening construction status is explicit in the scenario, loader exceptions are removed, and both scenarios specify 1940/1945/1950 reviews. Obsolete overseas-base funding event removed. |
| Display consistency | Old scenario/version names, duplicate controls, separate yard estimates and missing floatplane capacity remained. | The Treaty System is named consistently. Aircraft details include floatplanes. Audio stays in the top bar; Save and Help have one main location each. Treaty controls disappear when inactive. |

## Resource and mechanic dependencies

Completed upgrades are `level − 1`; all facilities, skills and technologies start at 1 and cap at 9. Dated ship, aircraft and research designs cannot begin development before their year. Future and obsolete entries remain in the documentation for reference while build menus apply the production gates.

| Quantity | Inputs and downstream uses | Runtime source |
|---|---|---|
| Merchant capacity | Surviving powered merchant hulls contribute GRT; required capacity is opening GRT × (1 + 0.15 × industry upgrades). Available/required coverage caps at 1. Naval support is separate. | `merchant-economy.mjs` |
| Trade-supported economy | Domestic share + trade share × shipping coverage × convoy flow. Gold, influence and industrial output use this factor; effective logistics uses domestic share + trade share × coverage. | `merchant-economy.mjs`, `engine.mjs`, `naval-resources.mjs` |
| Gold and industry stock | Monthly government appropriations, upkeep and concealment; daily factory/school/industry operating charges and repair spending; upfront orders and projects. Industry stock is distinct from construction throughput. | `engine.mjs`, `naval-resources.mjs`, `ports.mjs` |
| Yard throughput | Base national yards × industry expansion × funding × paid operating coverage × home-yard condition; occupation blocks output. Concurrent work shares this pool. Used + spare equals available capacity; excess requested work causes congestion. | `engine.mjs: yardLoad` |
| Fleet supply | Effective logistics × distance band × nearest port's capacity coverage × trade-flow term × mission demand, clamped to 5–100%. Port damage, occupation and access affect supply. | `logistics.mjs`, `ports.mjs` |
| Sailors | School capacity and 10–100% funding produce trained sailors. Only fully staffed ships depart; casualties at sea reduce weapon and damage-control effectiveness. Reserved hulls retain 15% maintenance crew demand. | `ship-staffing.mjs`, `naval-resources.mjs` |
| Aircraft and aviators | Factory model choice and funding produce aircraft; aviation schools produce aviators. Every owned aircraft demands a full model-specific crew. Embarked wings take staffing priority; uncrewed planes cannot fly. | `naval-resources.mjs` |
| Training and morale | Training projects and daily decay; morale recovery toward baseline, events, battle outcomes and treasury shortfalls. Both modify combat preparation. School throughput does not directly raise fleet training quality. | `engine.mjs`, `balance.mjs` |
| Combat and recovery | Ship specifications, actual air wings, sailor effectiveness, hull condition, preparation and supply feed auto-resolution. Rescue depends on escorts and battle control. Recovery credits each survivor/airframe once after its delay. | `engine.mjs`, `task-forces.mjs`, `recovery.mjs` |
| Port attacks | Admirals select reachable hostile ports for raids or sieges. Attacks damage facilities/ships and consume crews/aircraft; safe funded repairs restore facilities. Ports do not change owner from naval bombardment alone. | `port-operations.mjs`, `ports.mjs` |
| War and land fronts | Persisted war ledgers retain sunk/damaged tonnage and merchant losses after individual reports expire. Sustained supply can change land progress and occupation, especially on islands. | `war-balance.mjs`, `land-war.mjs` |

The approved domestic/trade shares remain: United Kingdom 40/60, United States 80/20, Japan 55/45, France 65/35, Italy 60/40, Germany 70/30, Soviet Union 85/15. Soviet shipping in 1922 remains explicitly provisional at 100 hulls / 100,000 GRT.

## Interface organization

- Fleet lists show type composition. Clicking a fleet opens a paged manifest; individual ship clicks open class specifications. Fleet registers support name/type search and pages.
- Catalogs, construction, research, governments and battle lists use short pages. Shipyards graph the combined national capacity, committed throughput and spare throughput.
- The first three bars remain time/audio, resources, then alerts. Treaty administration stays first in Governments; detailed war ledgers expand on demand. Battle reports show casualties and damage first, followed by expandable calculations.
- Main layouts were checked at 1920×1080, 2560×1080 and 1366×768. Detailed expanded records can still scroll when their contents exceed the viewport.

## Proposed gameplay additions

1. **Budget forecast and reserve targets.** Show the next 12 months of appropriations, upkeep, facility spending and planned commissioning, with an optional cash-reserve target. This would make underfunded expansion easier to anticipate.
2. **Refit and air-wing replacement policies.** Let ministries choose when older aircraft and hull equipment are replaced, balancing readiness against time in port and replacement costs.
3. **Scheduled fleet exercises.** Trade operating cost, fuel and temporary availability for training gains; keep school output separate from experience at sea.
4. **Distributed shipbuilding and emergency supply.** Keep one national capacity total in the interface, but author which ports supply that capacity and how tanker support handles a fleet whose safe return route disappears. Today shipbuilding is an abstract national pool tied to home-yard condition.
5. **One historical-event executor.** Reconcile all seed event entries with runtime effects and explicit prerequisites. Additional earthquake damage, Manchurian crises and negotiated London category amendments remain design references rather than fully executed chains.

These proposals are not enabled mechanics. Current port capacities, production costs, combat coefficients and land-front sensitivity remain provisional balance values. Tests provide evidence of stability and conservation in the exercised cases, not a guarantee that every future campaign is free of defects. See [validation evidence](VALIDATION.md).
