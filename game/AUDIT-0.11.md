# v0.11 — ministry controls, diplomacy and automatic support

The first interface update is implemented. All left submenus remain visible. Command Map and Diplomacy use their requested names, Land campaigns is main menu 02, Battle reports is the first Campaign record submenu, and the compact construction queue sits above the ship catalog. Hull quantity uses a horizontal slider. Sailors and aviators use plural labels.

## Stable controls and clearer information

Facility expansion and diplomatic cooldown progress occupy the same 42-pixel action slot as their buttons, including the projected completion or next-use date. Research is ordered by its next availability date; future research buttons show that date. All fourteen branches have nine shared in-universe level descriptions, exported to [the technology tree](../docs/tech-tree.md). Dated projects remain unavailable before their development year. Aircraft development takes 180 days after funding; this is model qualification, not the time to manufacture every aircraft.

Treaty policy shows its actual selected policy and whether the ministry is bound, withdrawn or outside the treaty. Diplomatic costs and explanations are available on hover. Port and capital icons and labels respond to pointer and keyboard selection in the command panel. Land fronts pulse rather than resembling a traveling fleet route. Reports name the battle or port action, identify shore defenses when no enemy ships participated, and explicitly distinguish no losses from missing headings.

War starts play a separate sound cue. Pausing fades music to one-third of the user's volume over 0.9 seconds; resuming restores it. The paused indicator pulses, respecting reduced-motion preferences.

## Diplomacy rules

All figures are provisional playtest balance. Ministry ultimatums have been replaced by insults and naval provocations. Unavoidable government and treaty demands retain their deadlines and default outcomes.

| Action | Gold / influence / industry | Relations | Reuse |
| --- | --- | --- | --- |
| Diplomatic visit | 2,000 / 14 / 100 | +6 | 365 days |
| Industrial cooperation | 12,000 / 24 / 1,600 | +32 | Once per government |
| Diplomatic insult | 500 / 4 / 0 | −6 | 90 days |
| Naval provocation | 6,000 / 16 / 800 | −24 | 180 days |

A provocation requires a properly screened fleet with full crews, at least 75% average hull condition and 40% supply. Repair, reinforcement and support forces are excluded. If an opposing force is actually at sea within 185 km, a 30% incident check can start war and trigger a local encounter; ordinary interception and evasion still govern whether that encounter becomes a battle. Orders do not teleport either navy or expose hidden enemy locations. Active ceasefires prohibit provocations.

Ceasefires can be offered from the first day of war. An attempt costs 1,000 gold, 4 influence and 100 industry. Only an accepted offer additionally costs 10,000 gold, 40 influence and 1,000 industry. The treasury must cover both before submitting. Rejected offers can be retried after 30 days; accepted peace lasts one year.

Acceptance chance is rounded and clamped to **5–90%**:

`15 + enemy naval-loss pressure + disrupted trade + war duration + war balance`

- Naval-loss pressure: `(enemy tons sunk + 0.35 × enemy damage-equivalent tons) / max(10,000, enemy opening tons) × 40`, capped at 35 points.
- Disrupted trade: `(1 − enemy effective trade flow) × 25`, capped at 25 points.
- War duration: 10 points per year, capped at 20.
- War balance: `our current advantage / max(2,000, 0.2 × enemy opening tons) × 25`, clamped to −25 through +25.

The offer's hover explains the current components. “Leading” and “Trailing” compare our advantage with a neutral band: naval value is sunk tons + 35% of damaged tons + 15% of merchant GRT sunk, with relevant land-front progress added. The band is the larger of 2,000 or 10% of both sides' combined naval value. This is an assessment, not a victory condition.

## Vulnerable automatic support groups

Every navy can order depot ships (AD) and fleet oilers (AO) in Shipyards → Ship catalog. Generic 1922, 1936 and 1950 generations have period gates and supersession dates. Their estimates are marked provisional in each national platform and equipment catalog. No new hulls are added to opening fleets, and support remains separate from warships and merchant GRT.

Fully staffed support ships form admiral-managed groups of up to four auxiliaries. Spare local destroyer escorts accompany them when available; combat screens retain priority. Admirals move depots to overloaded friendly bases and send oilers to operational surface forces needing endurance. They follow navigable routes and refuel at accessible ports.

- A docked depot adds three times its remaining-condition standard displacement to local supply capacity. The total depot bonus cannot exceed that base's undamaged capacity; facility damage scales it down. No bonus applies while sailing, unstaffed or at an inaccessible base.
- Oilers load supply cargo equal to twice their remaining-condition standard displacement. They must meet the target within a 74 km strategic rendezvous area before transferring stores. One delivery can restore at most 35% of fleet endurance, consuming cargo proportional to supplied tonnage. Delivered stores can add up to 15 percentage points to the distance supply factor, decaying to zero over three days. Each oiler group replenishes at most once per day and returns to reload.
- Groups can be scouted and intercepted at sea or attacked at anchor. Damage destroys cargo along with carrying capacity. Auxiliaries below 75% condition return for the existing paid repair process. Survivors and losses enter normal battle and campaign records.

These are operational abstractions, not cargo-ton fuel accounting or modeled underway-transfer equipment. Legacy support entries whose crew and specifications remain uncataloged do not gain invented capabilities. AI ministries use their existing support hulls automatically; this release does not add a dedicated AI support-procurement target.

## Suggested next additions

Naval medicine and survivor recovery could shorten recovery delays without duplicating damage control. Operational communications would become useful once command delays matter. Separate convoy-logistics or pilot-training doctrine panels would currently duplicate existing supply, ASW, aviation and school branches.

Save format remains 6. Existing valid campaigns can continue; the release process preserves a timestamped copy before replacing served files. [Validation](VALIDATION-0.11.md).
