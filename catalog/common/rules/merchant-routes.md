# Automatic merchant circuits

Monthly demand is (GDP + GTP) / 2 GRT. Merchant dispatchers maintain a target of 2% of registered hulls moving at sea, rounded to the nearest whole hull, in both peace and war. Route weights divide this moving pool, independently of demand. The rest remain available for port calls and relief sailings. Ships travel at 10 knots and spend at least 12 hours at their destination. Return departures get priority; hulls can split only in port. Opening voyages are staggered, and replacements depart from their origin. Closed ports, blocked routes, transport diversions or battles can temporarily prevent the target from being met.

Count surviving manifest GRT once, when the physical round trip returns to the origin. Partial voyages and diversions earn no deliveries. Delivered GRT / required GRT is displayed without a cap, so surplus shipping is visible. For effective logistics, delivery coverage is capped at 100% before multiplying by convoy success. Approximately ten convoys share the moving pool when enough ships and routes are available. Small fleets can field fewer; rounding and unloading can produce slightly more. The moving pool uses adaptive packet sizes to limit map and simulation overhead, without creating extra hulls.

Routes are representative commercial circuits through the shared navigable sea-lane graph. Naval ports represent their surrounding commercial harbors. The additional terminals are merchant-only coastal approaches, not fleet supply bases. Enemy destinations close as soon as hostilities begin. Outbound or unloading convoys divert from their actual position to home, or an accessible alternative if home has been lost. A diverted or abandoned voyage earns no delivered GRT. Voyages already returning from a completed peacetime port call may finish normally. If no port is accessible, the convoy waits at its current position until a refuge becomes available. New departures redistribute the moving pool among remaining legal circuits. Route weights are provisional, not historical cargo statistics. Sea routing remains abstract: there is no canal or individual cargo manifest simulation.

Historical context: [Royal Canadian Navy account of Atlantic convoys](https://www.canada.ca/en/navy/corporate/history-heritage/battle-atlantic/1939-1945.html) and [Royal Navy January 1940 war diary](https://cd.royalnavy.mod.uk/-/media/rnweb/locations-and-operations/navy-historical-branch/pdfs/1940/war_diary_naval_1940_01.pdf?rev=84693c4df4814bc1b0576adfd4daf4dd). The route selection below is a game abstraction informed by these shipping patterns.

```json game-data
{
  "SPEED_KNOTS": 10,
  "PORT_HOURS": 12,
  "NODES": {
    "trade_lisbon": [
      -9.6,
      38.65
    ],
    "trade_narvik": [
      15,
      68
    ],
    "trade_stockholm": [
      19.2,
      59
    ]
  },
  "EDGES": [
    [
      "portugal",
      "trade_lisbon"
    ],
    [
      "norway",
      "trade_narvik"
    ],
    [
      "baltic_north",
      "trade_stockholm"
    ]
  ],
  "TERMINALS": {
    "trade_lisbon": "Lisbon",
    "trade_narvik": "Narvik",
    "trade_stockholm": "Stockholm"
  },
  "ROUTES": {
    "GBR": [
      [
        "portsmouth",
        "norfolk",
        45
      ],
      [
        "portsmouth",
        "freetown",
        10
      ],
      [
        "portsmouth",
        "cape",
        15
      ],
      [
        "portsmouth",
        "ceylon",
        15
      ],
      [
        "portsmouth",
        "singapore",
        15
      ]
    ],
    "USA": [
      [
        "norfolk",
        "portsmouth",
        45
      ],
      [
        "san_diego",
        "hawaii",
        25
      ],
      [
        "san_diego",
        "manila",
        20
      ],
      [
        "norfolk",
        "trade_lisbon",
        10
      ]
    ],
    "JPN": [
      [
        "yokosuka",
        "mare_island",
        25
      ],
      [
        "sasebo",
        "takao",
        25
      ],
      [
        "kure",
        "saigon",
        20
      ],
      [
        "yokosuka",
        "singapore",
        15
      ],
      [
        "yokosuka",
        "vladivostok",
        15
      ]
    ],
    "FRA": [
      [
        "brest",
        "norfolk",
        25
      ],
      [
        "brest",
        "dakar",
        30
      ],
      [
        "toulon",
        "alexandria",
        20
      ],
      [
        "toulon",
        "saigon",
        15
      ],
      [
        "brest",
        "trade_lisbon",
        10
      ]
    ],
    "ITA": [
      [
        "taranto",
        "tobruk",
        40
      ],
      [
        "la_spezia",
        "trade_lisbon",
        30
      ],
      [
        "taranto",
        "sevastopol",
        20
      ],
      [
        "la_spezia",
        "toulon",
        10
      ]
    ],
    "DEU": [
      [
        "kiel",
        "trade_stockholm",
        50
      ],
      [
        "heligoland",
        "trade_narvik",
        35
      ],
      [
        "heligoland",
        "trade_lisbon",
        15
      ]
    ],
    "SOV": [
      [
        "leningrad",
        "trade_stockholm",
        30
      ],
      [
        "sevastopol",
        "toulon",
        20
      ],
      [
        "vladivostok",
        "puget",
        40
      ],
      [
        "sevastopol",
        "taranto",
        10
      ]
    ]
  },
  "AT_SEA_SHARE": 0.02,
  "TARGET_ACTIVE_CONVOYS": 10
}
```
