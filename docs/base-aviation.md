# Base aviation, ferry flights and coastal defense

Release 0.16.0. Implementation: `game/src/base-aviation.mjs`, `aviation-transfer.mjs`, `ports.mjs` and `port-catalog.mjs`.

## Aircraft are physical inventories

Every owned airframe is either embarked, stationed at a base, in transit, or in reserve. These locations partition the national aircraft total. Production and recovery add aircraft; combat and transport losses remove them. Assignments, modernization, reserve orders and scrapping do not produce additional aircraft or people. Every owned aircraft still contributes its normal aircrew requirement to the national surplus/deficit.

The opening shore establishment is **provisional**, not a historical squadron census: each base starts with aircraft equal to 60% of its aircraft capacity, rounded down, using only national models already available on the campaign date. Qualified crews and twelve sortie-equivalents of stores per capacity slot are included in the opening establishment. A nation without a period model starts with no shore aircraft. The national equipment catalogs list the resulting per-base aircraft, slots, crews and stocks for both campaigns. Original opening warship and merchant rosters are unchanged.

Factories deliver to the national aircraft warehouse, normally the home arsenal. If that port is occupied, its remaining stored airframes are lost; a surviving national port becomes the warehouse for subsequent deliveries. Admirals prioritize ship complements, then shore establishments; AI production demand includes both. A full aircrew accompanies each dispatched aircraft. Aircraft waiting for aviators remain in reserve. Existing deployed aircrews retain their assignments; training graduates are not instant replacement pilots for airborne aircraft.

Newer qualified models replace older models of the same role while in port. Replaced aircraft enter local storage. A deployed carrier may receive aircraft into empty slots by ferry flight; it does not discard its whole wing automatically at sea. Bases also modernize through physical deliveries.

## Reinforcement routes

- **Ferry flights:** routes connect friendly air bases and operational carriers within model reach. The planner uses 85% of the catalog's base `ferry_km`, retaining an operational reserve. If a model lacks an explicit ferry figure, twice its combat radius is the documented fallback before this reserve. Optional future tanks are not fitted implicitly. A flight takes time, and relay stops add two hours for servicing. Each base departure consumes half a sortie-equivalent of fuel per aircraft. A carrier that moves beyond reach can cause diversion to a friendly airfield within the flight's remaining range; otherwise aircraft ditch and casualties are recorded.
- **Domestic transport:** mainland national bases outside ferry reach can receive crated aircraft by rail. This is a country-level transport abstraction; individual railway lines are not simulated.
- **Merchant transport:** longer overseas crossings use merchant hulls withdrawn from unallocated registered shipping. A transport sails the sea-lane graph at 10 knots and includes twelve hours for unloading. It remains a convoy on the map, receives escort coverage, and can be intercepted. Ships already carrying another convoy are not allocated twice. Losses remove a proportional integer number of aircraft and their aircrews, with rescued people returning through the existing recovery queue. Nearby operational escorts improve survival. Completed cargo convoys release their hull assignments back to commercial service.
- **Unsafe routes:** recent wartime intelligence and observed blockade pressure can hold departures. Reports older than 48 hours cease to block a route. The planner does not read undiscovered enemy fleet positions. A changed destination owner causes merchant traffic to turn back, rather than delivering aircraft to the occupier. A newly captured airfield begins with no aircraft belonging to its new controller.

The transport route is reassessed on departure and destination loss, not continuously rerouted around every later contact. Weather, night-flying qualifications, runway dimensions, aircraft disassembly, tender-specific floatplane handling and flying accidents are not yet separate systems.

## Aviation stores and combat

The base stock combines fuel and ammunition into **sortie-equivalents**, a game unit rather than liters or ammunition tonnage. Capacity is twelve units per aircraft slot. Peacetime patrol/training use is 0.02 units per stationed aircraft per day, rising to 0.12 in war. A combat sortie uses one unit; a ferry departure uses half a unit. The common stock does not distinguish bombs, torpedoes or fuel grades.

Mainland bases buy replacement stores through domestic distribution. Overseas bases receive actual merchant shipments when below 65% capacity. Purchased units cost 0.3 gold and 0.06 industry each; resource shortages reduce purchases. Initial stocks are part of the starting establishment. These rates are provisional playtest values.

For a target at distance *d*, only fully crewed aircraft whose model combat radius reaches *d* contribute. Strike aircraft provide offensive power, fighters defend against incoming aircraft, and scout aircraft are distinguished from strike aircraft. Aircraft quality follows the existing model-year factor. Air-group effectiveness is multiplied by base condition, available stores, national training and morale. A base with intact aircraft but no supplies cannot generate combat sorties. The same air group must wait six hours between combat sorties, rather than launching repeatedly against each passing fleet in one minute.

Stationed scout aircraft conduct hourly coastal searches within their own model radius, provided crews and stores are available. Observations become ordinary fading contacts and create alerts only for wartime opponents. Passing enemy warships can be attacked, and the defending base's aircraft can be lost in the action. Anchorage raids also damage aircraft and ships in harbor. Coastal aircraft do not yet have a separate player-selected patrol or merchant-attack mission; merchant interdiction by dedicated land-based aviation is a proposed extension. Losses affect the local base's actual wing, not a fractional share of every national reserve aircraft. Base occupation removes the former owner's remaining airframes and records personnel casualties/escape through the existing loss/recovery ledger; captured equipment is not instantly operational for the occupier.

The command panel shows stationed models, counts, complete aircrews, model combat/ferry ranges, readiness, current/max stocks and incoming transports. The aircraft resource hover separates embarked, stationed, in-transit and reserve airframes.

## Coastal gun range

The former universal range of 18 nautical miles (33.3 km) has been removed. Range comes from the port's battery profile, separately from its abstract artillery power. The representative profiles currently use 8 km for light batteries, 16 km for medium coast defense, 24 km for major harbor batteries, and 28 km for heavy fortifications. A port without artillery has zero gun range. Doctrine improves effectiveness, not the ballistic reach of an unchanged mounting. Damage reduces combat strength, not maximum shell range.

Manila uses 27.4 km for its long-range 305 mm batteries, based on the commanding general's report of approximately 30,000 yards for the longest-ranged Corregidor guns. Other batteries had shorter reach. This is not a claim that every Manila gun could fire that far. [Moore report, Wainwright papers](https://corregidor.org/chs_moorerpt/moore1.htm).

Other battery profiles remain explicitly representative pending gun-by-gun and mounting-by-mounting authoring. Caliber alone is insufficient: mounting elevation, ammunition and observation matter. Singapore's completed Johore 381 mm battery reached about 21 miles, but construction was not finished until 1938, so that completed wartime battery must not be silently granted at the 1936 opening. [Singapore National Heritage Board, WWII trail](https://www.roots.gov.sg/-/media/Roots/Files/world-war-2/world-war-2-trail-booklet.pdf).

## Historical basis and boundaries

Carrier-to-base ferrying is grounded in operations such as USS *Long Island* flying off the first fighter and dive-bomber groups for Henderson Field. Carriers also carried aircraft as transport cargo. The game generalizes these operations; the existence of an aircraft slot does not yet encode every historical takeoff or recovery restriction. [US Naval History and Heritage Command: Long Island](https://www.history.navy.mil/research/histories/ship-histories/danfs/l/long-island-ii.html), [USS Wasp](https://www.history.navy.mil/research/histories/ship-histories/danfs/w/wasp-viii.html).

The Guadalcanal campaign shows why local aircraft, resupply and time of day matter together. Those relationships motivate the new finite stores and physical transfers. The current game still simplifies day/night operations and sortie scheduling; those are recommendations for the next combat rework. [NHHC: Operation Shoestring](https://www.history.navy.mil/about-us/leadership/director/directors-corner/h-grams/h-gram-010/h-010-1.html).
