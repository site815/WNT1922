# v0.13 — command usability and admiral/AI rules

The interrupted [v0.12 update](AUDIT-0.12.md) was completed, checked in Edge and published before this update. Its save-preserving [release check](release-0.12.0.json) passed. This release incorporates the subsequent requests.

## Interface

- Construction shows every active order. The queue grows vertically inside the Ship catalog page; it has no previous/next controls. The shared yard chart still shows used, spare and overloaded capacity.
- Diplomatic relationship numbers and their meter markers use one continuous scale: gray at zero, increasingly bright green toward +100, and increasingly strong red toward −100. National colors remain independent.
- The latest requested Command Map layout uses a **218–245 px right panel**, alongside the large map. The left menu is unchanged. The chart retains its single bottom legend and no header controls. Long selected manifests and port details scroll inside the side panel.
- Friendly map hovers show the type/count summary followed by individual ships, damage, status and sailor complements. Fleet-card hovers retain readiness, morale, supply, speed and fuel endurance and add individual ship rows. Fuel endurance is explicitly the shared fleet limit; individual hull fuel tanks are not separately simulated. Enemy tooltips continue to use only observed information.
- Tooltips sit beside the inspected fleet instead of blocking its click target. Long manifests can scroll, and tooltip display recovers after automatic scrolling. Disabled controls show the actual blocking reason, including future dates, resources, treaty restrictions, missing model qualifications, invalid fits and unavailable fleet missions. Navigation boundaries explain why their arrows are disabled.
- Schools and the resource-bar hovers explain daily graduations. Existing progress/cooldown footprints, aircraft production placement, alert filtering, pause/audio behavior and 60 fps map interpolation remain.

## Personnel timing

Each simulation day adds `annual training capacity × funding / 365`, limited by the day's available gold and industry. Fractional personnel accumulate internally; only whole people can be assigned. There is no monthly or annual graduating batch. Each sailor consumes 3 gold and 0.15 industry; each aviator consumes 25 gold and 2 industry. Expansions increase annual capacity, while the 10–100% controls set funded output. Aircraft are manufactured daily with fractional production carried until a whole airframe completes.

## Admirals and procurement

The detailed [AI and admiral rules](../docs/ai-and-admiralty.md) describe the new provisional preferences and restrictions. The audit found and corrected these problems:

1. Leftover submarine groups and newly commissioned submarines could fall back to unrelated surface commands. They now require their own role-compatible formation.
2. A shortage of escorts could still permit a capital force to leave its home port. Departure now rechecks complete crews and the actual screen. Local replacement escorts favor useful speed, and existing carrier/battle screens retain priority.
3. Supply-route calculations could omit the current partial sailing leg, and a fallback could order a voyage beyond remaining fuel. Route planning accounts for that leg and actual route length; an impossible voyage holds with an explanation. Changing orders keeps the current position and replaces the plotted route.
4. Repair destinations were chosen by straight-line distance. They now use sailing distance and can refuel at intermediate friendly ports on a return voyage. Repair/reinforcement groups remain valid interception targets and do not initiate engagements.
5. Routine patrols could wander directly into hostile major harbors. They now favor nearby reachable sea-lane objectives; port missions and support for active island campaigns are deliberate exceptions. Submarines cannot receive bombardment/anchorage missions.
6. AI construction and research were largely random. Monthly planning now considers commissioned and incoming hulls, crew needs, aircraft staffing, shipping demand, operating reserves and yard throughput. Each purchase/development action still uses ordinary resource, year, treaty and concurrency checks. An AI command cannot spend the player's resources or change a player's fleet mission.

National programs guide relative preferences, rather than giving countries free ships or resources. The Treaty System uses historical-start preferences for France, Germany and the USSR; In Good Faith uses the authored alternate naval programs. AI fleets use peacetime patrols and role-appropriate wartime missions. Manually assigned orders are preserved.

## Land campaigns

The Philippines and East Indies now have **medium naval influence** (0.50); Malaya/Singapore uses 0.55. Minor island campaigns remain high (1.20), while continental interiors remain low, such as Poland at 0.09 and the Eastern Front at 0.065. The same supply/momentum formula applies to all three tiers. Medium influence changes a sustained campaign more than an interior war but does not make a defended archipelago behave like a small waystation. Existing requirements for actual landing cover, supply and a longer campaign remain. Current fronts receive the updated coefficient on their next daily update.

## Suggested next additions

A convoy escort-coverage overlay would expose gaps without requiring manual convoy orders. A compact AI spending/decision ledger would make campaign balancing easier to inspect. Naval medicine and survivor recovery remains a useful distinct research branch; no additional branch has been added without a gameplay decision.

[Validation](VALIDATION-0.13.md) · [Technology tree](../docs/tech-tree.md)
