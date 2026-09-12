# Automatic merchant circuits

Monthly demand is (GDP + GTP) / 2 GRT. This is a transport requirement, separate from the annual economic bases. Allocate civilian hulls to meet each route's share, accounting for sailing time at 10 knots and 12 hours in the destination port. Count the surviving GRT once, on return to the origin; the outbound arrival is not another delivery. No fixed fraction of the fleet must be at sea. Opening voyages are staggered; replacement hulls only join at the origin. Insufficient hulls create an explicit capacity shortfall.

Routes are representative commercial circuits through the shared navigable sea-lane graph. Naval ports represent their surrounding commercial harbors. The additional terminals are merchant-only coastal approaches, not fleet supply bases. Enemy destinations close; a diverted or abandoned voyage earns no delivered GRT. Route weights are provisional, not historical cargo statistics. Sea routing remains abstract: there is no canal or individual cargo manifest simulation.

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
  }
}
```
