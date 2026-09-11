# Gameplay and realism audit — 0.16.0

## Scope and standard

Reviewed the current economy, personnel, research, ship/aircraft procurement, shipyards, fleet organization, orders, movement, intelligence, supply, support groups, merchant shipping, naval/port combat, diplomacy, land campaigns, retirement, recovery, UI and persistence. The two campaigns intentionally differ from each other; In Good Faith remains alternate history. Previously approved domestic/trade shares, graduation dates, one-minute operations, naval influence on land war and historical European-war variation are retained.

This is a review of the implemented rules and their connections, not a claim that the prototype is a complete naval simulator. Exact starting shore squadrons, most coastal batteries, damage formulas, prices, output rates and land campaign weights still contain provisional values.

## Corrections implemented

- Actual base wings replace fractional allocation of a national reserve pool. Aircraft totals partition into embarked, shore, transit and reserve holdings, and full aircrews remain indivisible.
- Shore combat uses individual model reach, physical stocks, condition, crews, training and morale. Short-range models cannot use another model's range. A zero-aircraft or empty-supply base cannot generate air-strike power.
- Bases have finite aviation fuel/ammunition stores. Overseas aircraft and supplies move through real, vulnerable merchant transport when ferries cannot reach; domestic crated-aircraft transfers use a rail abstraction. Carrier rendezvous and diversion preserve physical aircraft and elapsed travel time.
- Merchant transport losses remove airframes and aircrews, apply escort-sensitive rescue and enter the campaign casualty ledger. Cargo losses are included in the merchant attack notice. No shipping hull is duplicated to create a transport.
- Captured bases no longer retain their former navy's active aviation power. A captured aircraft warehouse loses its stored aircraft. Reinforcement transports turn away from occupied destinations. Incoming aircraft cannot fight before delivery.
- Stationed scout aircraft search within their own model range, requiring aircrews and aviation stores. Their observations use the normal fading-contact and wartime-alert rules.
- Coastal gun reach is a battery-profile property rather than a universal 33 km radius. Unarmed stations have zero artillery range. Doctrine cannot extend an unchanged gun's physical reach.
- AI production demand now includes shore establishments. Escort-sensitive transfer routing uses the actual Escort shipping mission key. Both AI and player use the same aircraft inventories, routes, costs, dates and losses.
- Bulk fleet orders validate qualifying hulls and aggregate recommissioning costs before execution. Reserve and scrap orders preserve vulnerable return journeys. Disbanded wings enter local storage.
- Four facility panels display funding-dependent gold/industry use. Resource hovers show income components, upkeep, facility spending, shipping/port multipliers, staffing demand, graduation and recovery, and active repair demand. Planned operating balances are distinguished from variable orders, repairs and supply purchases.
- Escort coverage stays on; the navigation column is narrower. Music grows from seven to fifteen credited recordings. These additions preserve worker/UI separation and interpolated map movement.

## System findings

| System | Current rule and check | Remaining realism limit |
|---|---|---|
| Time and performance | Every operational minute is processed in the worker; UI movement interpolates independently. Actual speed may fall below the selected rate. | Real-time cost grows with forces and contacts; 100,000× is a requested maximum, not guaranteed throughput. |
| Gold | Monthly ministry appropriation is scaled by domestic/trade output; upkeep and treaty concealment are deducted. Schools/factories/industry spend daily. | Gold is an abstract naval budget, not a national tax or monetary simulation. |
| Industry and trade | Industrial level raises output, yard capacity and merchant demand. Trade needs shipping, convoy flow and usable ports. | Ships do not carry individual coal, ore, oil or food cargoes through an import network. |
| Yards and repairs | One shared throughput pool, overload delays, surviving dockyard capacity and funded operation. Returning ships remain vulnerable. | Repair labor does not yet compete fully with construction and refits; dock size is not matched to hull dimensions. |
| Sailors and aviators | Monthly/quarterly graduation on the approved dates; daily costs, whole complements, casualty recovery and signed staffing deficits. | Graduation cadence is not training duration. Extra funding can raise the next intake before a realistic full course has elapsed. |
| Aircraft | Owned inventories, dates, crews, local wings, reinforcement travel and local losses are connected. | Catalogs emphasize naval models; dedicated long-range coastal patrol types and all historical shore establishments remain incomplete. |
| Research | Levels 1–9, dated availability and documented tactical/technical effects; no future production. | Many benefits are continuous bonuses rather than discrete installed equipment, certification or refit work. |
| Admirals and composition | Carrier/battle groups need screens; forces keep their positions and orders, damaged detachments return physically, support groups are vulnerable. | Organization uses role heuristics, without command seniority, individual admiral traits or detailed doctrine organizations. |
| Routing and endurance | Navigable sea lanes, range limits, friendly refueling, homeward repair/scrap journeys, visible convoys. | Canal political access, detailed chokepoint control and fuel grades are simplified. |
| Logistics | Merchant capacity, port access/capacity, distance bands, mission factors and nearby oilers connect to effective supply. | Surface ship fuel, torpedo and shell magazines are not separate finite inventories. National personnel reserve geography is simplified. |
| Intelligence | Enemy fleet positions come from observations and fade; wartime alerts expire. Unsafe reinforcement routes use recent known contacts. | Detailed base reconnaissance, operational deception and radio silence need more than the present contact estimates. |
| Surface battle | Guns, torpedoes, armor, speed, crews, preparation and scouting matter; losses and damaged tonnage determine results. | Aggregate damage does not resolve range bands, individual hits, penetration, flooding and ammunition expenditure. Armor also contributes to the present power heuristic. |
| Submarine warfare | Separate torpedo attack and ASW values, submerged speed, scouting and escort protection. | Submarines still combine too neatly with fleet-level battles; tracking, attack approaches, battery endurance and torpedo reloads need separate encounters. |
| Air/port battle | Stationed/embarked aircraft, per-model coastal reach, preparation, finite shore stores, sortie delay and local losses. | No weather, daylight window, deck-cycle model, detailed CAP allocation or separate land-based convoy-strike mission. |
| Ports | Three tiers, damage, repair spending, trade, supply load, batteries and actual shore aircraft. | Most batteries remain representative; firing arcs/terrain and the growth of forward airfields after the campaign opening are not authored in detail. |
| Diplomacy and war | Diplomatic acts have costs/cooldowns; provocations need ready forces; ceasefires have displayed acceptance factors. European-war timing follows approved variation. | Governments still use an abstract relations-to-war probability rather than a full national cabinet or alliance strategy model. |
| Land/island campaigns | Minor islands, overseas theaters and continental interiors have different naval influence; sustained supply advantages can change occupation. | No full army order of battle, amphibious lift pool, garrison equipment or terrain campaign model. |
| Recovery and retirement | Losses, rescued personnel, recovery delays and salvage are counted once. No salvage from ships sunk on the return journey. | Captured/escaped personnel share the present loss/recovery abstraction; prisoners of war are not a separate pool. |

## Recommended larger changes — proposals, not implemented

1. **Operational air warfare first.** Add daylight/weather, search sectors, strike assembly and deck cycles; make CAP and escorts explicit. Add land-based maritime patrol/torpedo aircraft, aircraft carrier/floatplane compatibility and reconnaissance of enemy anchorages. This makes aircraft range, surprise, island possession and carrier risk much more meaningful. Preserve automatic admiral control rather than adding compulsory sortie micromanagement.
2. **Finite naval consumables and encounter stages.** Track fuel, shells and torpedoes aboard ships; have encounters progress through detection, approach, attack and disengagement. Replace the broad battle/cooldown heuristic with ammunition- and damage-limited operations. Resolve submarines as separate shadow/ambush/escape actions. Include repair/refit labor in the existing yard pool.
3. **Real training pipelines.** Retain monthly sailor and quarterly aviator delivery, but add cohorts with course duration, instructors and training aircraft. Expansion increases future graduation capacity; it should not immediately create fully trained personnel. Provide emergency abbreviated courses with an explicit proficiency cost.
4. **Port and invasion development within existing industry.** Author period batteries, airfields and harbor limits. Let industry build airstrip/repair improvements over time and provide amphibious lift, garrison strength and unloading throughput. This would improve Pacific warfare without restoring the removed abstract overseas-base funding bonus.
5. **National strategy and intelligence budgets.** Give AI governments war aims, convoy priorities, theater reserves and approximate enemy-strength estimates. Use those constraints to choose investments and operations, while preserving each nation's approved scenario character.

The first three would deliver the largest realism gain. They change the experience substantially and should be agreed before replacing the current combat and training rules.

## References and reproducibility

[Base-aviation rules, historical references and provisional constants](../docs/base-aviation.md), [strategic port profiles](../docs/strategic-ports.md), [per-nation platform/equipment catalogs](../docs/playable/README.md), [126 research levels](../docs/tech-tree.md), [music credits](assets/music/CREDITS.md). The implementation is tested by `game/test/release16.test.mjs`, the full game regression suite, isolated browser playtests and long campaign/war simulations. See `VALIDATION-0.16.md` for the final measured results.
