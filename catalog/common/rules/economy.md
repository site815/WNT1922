# GDP, gross trade product and strategic materials

GDP and GTP are separately stored annual ministry resource-generating bases, both in **kilograms of fine-gold equivalent**. Each starting number is authored in its national catalog. They are provisional playable budgets, not measurements of total national GDP. There is no additional allocation percentage and no conversion between merchant GRT and GTP.

- **Resources:** productive GDP = GDP × (1 − industrial disruption). Annual gold = 20% productive GDP + 80% GTP. Annual industry = 80% productive GDP + 20% GTP, then multiplied by naval-industry facilities, funding, paid operation and strategic availability. Divide annual output by 12 for monthly equivalents; routine output arrives daily.
- **Shipping demand:** (GDP + GTP) ÷ 2 GRT per month. This is a documented game transport-demand coefficient, not a historical unit conversion. Actual commercial round trips operate in peace and war; only wartime convoys are drawn. Delivered GRT is counted once when surviving hulls return to their origin.
- **Port access:** min(1, usable trade points / opening trade points). Usable points sum each controlled port's trade × condition × (1 − blockade).
- **Convoy success:** delivered / (delivered + sunk), using the last 30 days. It starts at 100% without observations and is always 100% in peace. **Delivery coverage:** min(1, delivered / required). Coverage starts at zero until real voyages return.
- **Logistics:** (port access + convoy success × delivery coverage) ÷ 2. Both components are capped at 100%. Full performance gives 100% logistics. At opening, intact ports and no completed voyages give 50%.
- **GTP growth:** next GTP = current GTP × (1 + monthly rate). At 0% logistics: −2%; at 50%: zero; at 100%: +0.05% in peace or +2% in war, linearly interpolated. For L below 0.5, rate = −0.02 × (1 − 2L); otherwise rate = (2L − 1) × the peace/war maximum. Sinkings and port losses change logistics immediately; **GTP changes only at month-end**, with no direct loss deduction.
- **GDP growth:** normal monthly growth follows the historical national series in peace or +1% in war. For disruption D below 0.5, net rate = normal rate × (1 − 2D). At or above 0.5, net rate = −0.02 × (2D − 1). Therefore 50% gives zero, 75% gives −1%, and 100% gives −2%. This changes the underlying base; facility repairs restore disrupted production but do not undo past GDP contraction. Bombing industry can reach 100% disruption; yard disruption remains capped at 60%.
- **Merchant hulls:** use the same monthly logistics curve as GTP. Every naval-industry upgrade since opening adds 15% of the positive hull growth rate, without compounding. Negative growth is unchanged. Accumulate fractional hulls; retire only hulls that are not at sea, carrying deferred retirements forward. Average GRT per hull grows **0.1% monthly** independently. Total merchant GRT = hulls × average GRT. No naval catalog orders create civilian merchants.
- **Industry expansions:** each completed upgrade adds 15% of opening industrial output and yard capacity. Two upgrades give +30%; starting facilities retain calibrated opening output. See levels.md. GDP growth, funding, damage and operating resources still multiply the expanded capacity.
- Growth uses closing-month logistics and compounds on the first of each month. Partial opening months prorate each monthly factor by elapsed days / calendar days in that month.
- **Strategic output:** 5% × (productive GDP × national resource modifier + GTP × min(1, GTP/GDP)). Strategic units abstract fuel, rubber, tin and other critical materials, held nationally.
- Below seven days of strategic operating needs, fleet combat, movement, aviation and industrial production deteriorate toward 20% emergency effectiveness. Operations consume reserves daily; hull and aircraft production also require strategic materials. Player and AI follow the same rules.

Example: ALB Japan opens with 2,146 merchant hulls. At 100% peacetime logistics, 0.05% is 1.073 hulls per month before expansions. After one industry upgrade it is 1.23395 hulls. Fractional progress carries forward. The previous build's 53,640 / 4,085,650 = 0.013128878 gold-equivalent per GRT was a provisional calibration; it is no longer a live formula.

```json game-data
{
  "GDP_GOLD_SHARE": 0.2,
  "GTP_GOLD_SHARE": 0.8,
  "WARTIME_GDP_MONTHLY": 0.01,
  "STRATEGIC_OUTPUT_SHARE": 0.05,
  "CONVOY_PACKET": 40,
  "MAX_CONVOYS": 32,
  "CONVOY_RECORD_DAYS": 30,
  "GROWTH_NEUTRAL_LOGISTICS": 0.5,
  "GTP_PEACE_GROWTH": 0.0005,
  "GTP_WAR_GROWTH": 0.02,
  "GTP_MIN_GROWTH": -0.02,
  "STRATEGIC_RESERVE_DAYS": 7,
  "STRATEGIC_EMERGENCY_FACTOR": 0.2,
  "SHIP_OPERATIONS_PER_TON_MONTH": 0.0005,
  "AIR_OPERATIONS_PER_AIRCRAFT_MONTH": 0.03,
  "PEACE_OPERATIONS_FACTOR": 0.4,
  "SHIP_CONSTRUCTION_PER_TON": 0.003,
  "AIRCRAFT_CONSTRUCTION_PER_KG": 0.0002,
  "SHIPPING_DIVISOR": 2,
  "GDP_BOMBING_THRESHOLD": 0.5,
  "GDP_BOMBING_MIN_GROWTH": -0.02
}
```
