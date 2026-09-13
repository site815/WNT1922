# Shared simulation rules

These modules have no DOM, browser storage or screen controls. The same world state and rule functions serve every nation.

`game-actions.mjs` is the command boundary. `applyCommand(state, catalog, command, actor)` validates nation ownership and invokes the same action functions for humans and AI. The desktop worker supplies the local actor; callers cannot select a different actor inside a command payload. A future multiplayer host must authenticate the actor before calling this boundary. Networking is not implemented.

| Area | Modules |
| --- | --- |
| Campaign lifecycle and shared action effects | engine, game-actions, campaign-content, state-io |
| Economy, trade and yards | balance, domestic-economy, economy-rules, economic-growth, historical-gdp, merchant-economy, merchant-convoys, convoy-traffic, port-trade, strategic-materials |
| Timed naval engagements, morale and scoring | engagements, campaign-impact; damage exchanges in engine |
| Fleet organization, movement and supply | task-forces, operations, logistics, support-operations, support-effects |
| Air operations and physical inventories | naval-resources, aircraft-inventory, air-operations, base-aviation, aviation-transfer, government-aviation, strategic-air |
| Personnel and losses | personnel-training, ship-staffing, recovery, ship-retirement |
| Designs and research | designer, aircraft-designer, research-tree, levels |
| Wars, diplomacy and events | war-politics, diplomacy-rules, treaty-policy, provocation, events, vanilla |
| Land campaigns and ports | land-war, ports, port-operations, port-catalog |
| Automated decisions | ai-planning; AI procurement calls the shared command boundary |
| Read-only display summaries | queries, composition |

Static catalog/rule tables are loaded from Markdown. Keep calculations here and authored specifications, costs, dates and explanatory text in the catalog. Derived values should be calculated from those inputs instead of copied into another data file. Campaign saves contain runtime results, including player-designed ship and aircraft recipes.

The simulation uses seeded randomness. Keep randomness on the simulation side, preserve inventory conservation, and check affordability and ownership before mutations. The worker rolls back rejected commands and pauses safely on simulation errors. Do not grant hidden resources or special prices to AI controllers.
