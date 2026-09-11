# AI ministries and admiral behavior

These are provisional game rules, not a claim to reproduce a historical naval staff. Specifications, opening rosters and availability remain in the national platform/equipment catalogs. AI ministries use the same economic, treaty, staffing and development rules as the player.

## Ministry planning

The planner runs monthly after ordinary appropriations. It counts current hulls, reserve hulls at half weight and construction already funded. Civilian merchant construction is outside naval orders; all countries receive the same monthly civilian-growth rules. Research is ranked by actual shortages and national preferences; a dated or maximum-level program cannot be funded.

| Ministry | In Good Faith preferences |
| --- | --- |
| United Kingdom | Worldwide escort coverage, logistics, fast capital forces and carriers; convoy/ASW work and training |
| United States | Heavy battle line, supporting cruisers and escorts, a growing carrier arm; industry, standardization and fire control |
| Japan | Carrier forces with screens, naval aviators, training, standardization and distant supply |
| France | La Revanche de l'École: submarines, torpedo forces, fast cruisers and naval aviation; intelligence and training |
| Italy | Fast Mediterranean surface forces, local logistics, gunnery and aviation |
| Germany | Predominantly submarines and raiding support; no new battleship/carrier preference under Nothing Above Water |
| USSR | Heavy industrial development supporting battleships and carriers, with escorts and trained personnel |

The Treaty System restores conventional historical-start preferences for France, Germany and the USSR. Early carrier preference is lower in the other navies. Historical-start AI governments keep declared construction restrictions rather than automatically adopting an alternate-history program. Existing treaty policy and year gates still govern what is legal.

Normal appropriations leave a reserve of 12% of base annual gold income, 5% of annual industry output and 12 influence. The AI defers new orders when existing yard work is already overloaded; ordinary orders may bring planned load to at most 125% of available daily throughput. Existing construction continues at the ordinary congestion-adjusted rate. Incoming crews are considered over a two-year horizon. These limits are AI budget preferences: the player retains ordinary order controls and can deliberately overload yards.

Schools receive higher funding while staffing is short. Aircraft funding falls to 10% when stock is sufficient or surplus planes lack aviators; the aviation schools then take priority. Industry remains funded unless gold is critically short. New aircraft qualifications favor recent eligible models, and model selection never bypasses the development year. A design draft is commissioned for a needed role with no current line, rather than repeatedly paying for duplicate drafts.

## Formations and movement

At a new campaign opening, unspecified fleet stations are spread across suitable national bases using capacity and sea-route distance. Explicit catalog deployments remain in place. No active voyage is moved by this initial assignment. The revised USA, UK and German sailor pools cover their opening rosters. All four facilities start at 50% funding; the monthly AI then adjusts its own funding normally.

Newer qualified aircraft replace older same-role aircraft when ships are in port, returning old airframes to reserve. Deployed wings stay aboard until the force docks. Reallocation does not create aircraft or aviators.

Submarine formations stay separate from surface forces. Carriers, battleships, cruisers and escorts retain their corresponding cores. A carrier task force needs at least four fully staffed escort hulls to leave port; a battle squadron needs at least two. Local replacement screens prefer ships fast enough to remain useful with the core. Crews are checked again immediately before departure. Replacements sail to their destination as a separate, vulnerable force.

Orders express a mission, not a direct sailing route. Admirals choose reachable objectives from convoy routes, observed contacts and active island/port campaigns. They prioritize nearby sea lanes, use only friendly or allied refueling ports and reserve fuel for a return from an offshore objective. The path includes the ship's current partial sailing leg. If the actual route is beyond remaining fuel, the force holds and reports why; issuing another order cannot teleport it or provide fuel.

Peacetime AI surface forces reconnoiter while escort groups guard shipping. At war, submarines raid commerce; escorts guard shipping; cruisers divide between screening, interception and selected port sieges; carrier/battle groups use interception and selected anchorage/siege missions. In Good Faith's German forces emphasize commerce warfare. Player and manually assigned missions are not overwritten.

Relative strength, scouting and speed still determine engagement avoidance. The separate aggressive-battle setting permits greater risk and longer attacks. Repair, reinforcement and support groups do not initiate fleet battles but remain vulnerable to hostile forces. Support depots and oilers retain their physical deployment and replenishment rules.

## Escort coverage and personnel batches

The convoy overlay and combat share the same 148 km escort radius. Only an operational same-nation surface force on an Escort mission contributes defense; docked, returning, refueling, repair, reinforcement, support and submarine forces do not. Supply, training and morale affect the defending strength. The overlay describes current coverage, not guaranteed protection for an entire voyage.

AI navies use the same paid training pools as the player: monthly sailor graduation on the 1st and quarterly aviator graduation on 1 January, April, July and October. Personnel in training cannot staff ships or aircraft early. Recovery returns remain independent of school calendars.

## Limits and tuning

Routing follows a connected sea-lane graph. Supply, island invasions and land campaigns remain strategic abstractions; there are no individual army divisions or manually routed transport ships. Fuel is a shared fleet endurance budget. The AI is a transparent monthly heuristic rather than a tactical search or learning model. Preferences and thresholds are centralized in `game/src/ai-planning.mjs`; movement rules are in `game/src/task-forces.mjs`.
