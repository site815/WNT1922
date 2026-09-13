# GDP naval budget, GTP naval budget and strategic materials

GDP means **GDP naval budget** (domestic-funded naval allocation); GTP means **GTP naval budget** (trade-funded naval allocation). They are separately stored annual ministry resource-generating budgets, both in **kilograms of fine-gold equivalent**. Each starting number is authored in its national catalog. They are provisional playable budgets, not measurements of total national GDP. There is no additional allocation percentage and no conversion between merchant GRT and GTP.

- **Resources:** productive GDP = GDP × accessible home-economy share × (1 − industrial disruption). Annual gold = 20% productive GDP + 80% GTP. Annual industry = 80% productive GDP + 20% GTP, then multiplied by naval-industry facilities, funding, paid operation and strategic availability. Divide annual output by 12 for monthly equivalents; routine output arrives daily.
- **Shipping demand:** (GDP + GTP) ÷ 2 GRT per month. This is a documented game transport-demand coefficient, not a historical unit conversion. Actual commercial round trips operate in peace and war; convoys are visible in both peace and war. Delivered GRT is counted once when surviving hulls return to their origin.
- **Port access:** min(1, usable trade points / opening trade points). Usable points sum each controlled port's trade × condition × (1 − blockade).
- **Convoy success:** delivered / (delivered + sunk), using the last 30 days. It starts at 100% without observations and is always 100% in peace. **Displayed delivery coverage:** delivered / required, including surplus above 100%. The effective logistics contribution uses min(1, delivered / required). Coverage starts at zero until real voyages return.
- **Logistics:** (port access + convoy success × delivery coverage) ÷ 2. Both components are capped at 100%. Full performance gives 100% logistics. At opening, intact ports and no completed voyages give 50%.
- **GTP growth:** next GTP = current GTP × (1 + monthly rate). At 0% logistics: −2%; at 50%: zero; at 100%: +0.05% in peace or +2% in war, linearly interpolated. For L below 0.5, rate = −0.02 × (1 − 2L); otherwise rate = (2L − 1) × the peace/war maximum. Sinkings and port losses change logistics immediately; **GTP changes only at month-end**, with no direct loss deduction.
- **GDP growth:** normal monthly growth follows the historical national series in peace or +1% in war. For disruption D below 0.5, net rate = normal rate × (1 − 2D). At or above 0.5, net rate = −0.02 × (2D − 1). Therefore 50% gives zero, 75% gives −1%, and 100% gives −2%. This changes the underlying base; facility repairs restore disrupted production but do not undo past GDP contraction. Bombing industry can reach 100% disruption; yard disruption remains capped at 60%.
- **Occupation and blockade:** overseas islands and colonies have no direct GDP deduction or transfer. Losing a home economic region denies its share of GDP output; it does not shrink the stored GDP base or give that GDP to the occupier. Ownership follows completed territorial campaigns, not temporary battlefront movement. Friendly liberation restores access; independent foreign occupation denies it. Shares below are provisional ministry-output weights, not historical regional GDP estimates: Germany's west/east use 70/30; the USSR's west/east use 65/35; the other five home territories each represent their national domestic base. Britain and Japan are home economies despite being islands. Bombing and home access multiply once each. The normal GDP growth/bombing rule still applies to the underlying base. Blockade reduces a port's usable trade points without changing its owner; occupation transfers the port and its usable trade contribution. Losing dock facilities separately reduces available shipyard capacity. Facility upgrades, funding, strategic shortages, upkeep and repair spending affect capacity, output or resource balances rather than subtracting from stored GDP.
- **Merchant hulls:** fixed civilian production replaces percentage hull growth. Required fleet GRT = opening merchant GRT × (current GTP / opening GTP). Shortfall = max(0, 1 − actual GRT / required fleet GRT), capped at 1; no requirement means no shortage. Base production = 1 + 9 × shortfall hulls/month. Logistics multiplies this by 0.5 at 0%, 1 at 50%, or 2 at 100%, linearly interpolated. Every naval-industry upgrade since opening adds 15% to that production without compounding. This works even after all merchants are lost. Sufficient or excess capacity keeps the one-hull base; there are no automatic percentage retirements. Fractional new hulls carry forward. Average GRT per hull grows **0.1% monthly** independently. Total merchant GRT = hulls × average GRT. No naval catalog orders create civilian merchants. GTP still uses its separate percentage-growth curve.
- **Industry expansions:** each completed upgrade adds 15% of opening industrial output and yard capacity. Two upgrades give +30%; starting facilities retain calibrated opening output. See levels.md. GDP growth, funding, damage and operating resources still multiply the expanded capacity.
- Growth uses closing-month logistics and compounds on the first of each month. Partial opening months prorate each monthly factor by elapsed days / calendar days in that month.
- **Strategic output:** 5% × (productive GDP × national resource modifier + GTP × min(1, GTP/GDP)). Strategic units abstract fuel, rubber, tin and other critical materials, held nationally.
- Below seven days of strategic operating needs, movement, aviation and industrial production deteriorate toward 20% emergency effectiveness. Naval combat uses fleet supply instead: empty reserves halve supply, without a second direct combat penalty. Logistics multiplies supply by 0.8 + 0.2 × logistics fraction. Operations consume reserves daily; hull and aircraft production also require strategic materials. Player and AI follow the same rules.

Example: ALB Japan opens with 2,146 merchant hulls and 4,085,650 GRT. Its opening fleet exactly meets its GTP-scaled fleet requirement, giving one base hull/month: one hull at 50% logistics, two at 100%. If half the required GRT survives, the base becomes 5.5 hulls/month. A wiped-out fleet gives ten base hulls/month, before logistics and industry modifiers. Required fleet capacity is distinct from the GRT that must complete monthly voyages.

```json game-data
{
  "GDP_GOLD_SHARE": 0.2,
  "GTP_GOLD_SHARE": 0.8,
  "WARTIME_GDP_MONTHLY": 0.01,
  "STRATEGIC_OUTPUT_SHARE": 0.05,
  "CONVOY_PACKET": 40,
  "MAX_CONVOYS": 64,
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
  "GDP_BOMBING_MIN_GROWTH": -0.02,
  "GDP_HOME_REGIONS": {
    "GBR": [
      {
        "territory": "c200",
        "name": "United Kingdom home economy",
        "share": 1
      }
    ],
    "USA": [
      {
        "territory": "c2",
        "name": "United States home economy",
        "share": 1
      }
    ],
    "JPN": [
      {
        "territory": "c740",
        "name": "Japanese home islands",
        "share": 1
      }
    ],
    "FRA": [
      {
        "territory": "c220",
        "name": "Metropolitan France",
        "share": 1
      }
    ],
    "ITA": [
      {
        "territory": "c325",
        "name": "Italian home economy",
        "share": 1
      }
    ],
    "DEU": [
      {
        "territory": "c255w",
        "name": "Western Germany",
        "share": 0.7
      },
      {
        "territory": "c255e",
        "name": "Eastern Germany",
        "share": 0.3
      }
    ],
    "SOV": [
      {
        "territory": "c365w",
        "name": "Western Soviet regions",
        "share": 0.65
      },
      {
        "territory": "c365e",
        "name": "Eastern Soviet regions",
        "share": 0.35
      }
    ]
  }
}
```
