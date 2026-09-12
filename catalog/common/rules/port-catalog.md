# port catalog — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
{
  "PORT_TIERS": {
    "dock": "Major dock & naval base",
    "base": "Naval base",
    "station": "Minor waystation"
  },
  "PORT_CATALOG": {
    "saigon": {
      "capacity": 100000,
      "artillery": 300,
      "aircraft": 100,
      "dock": 0,
      "tier": "base",
      "trade": 40,
      "note": "Saigon naval support and southern Indochina airfields. Japanese basing begins in July 1941."
    },
    "takao": {
      "capacity": 100000,
      "artillery": 400,
      "aircraft": 80,
      "dock": 0,
      "tier": "base",
      "trade": 35,
      "note": "Southern Formosa harbor and naval air stations."
    },
    "midway": {
      "capacity": 8000,
      "artillery": 0,
      "aircraft": 0,
      "dock": 0,
      "tier": "station",
      "trade": 1,
      "note": "Cable and communications outpost; the wartime naval air station had not yet been built."
    },
    "wake": {
      "capacity": 5000,
      "artillery": 0,
      "aircraft": 0,
      "dock": 0,
      "tier": "station",
      "trade": 1,
      "note": "Remote American atoll. Pan American flying boats began using it in 1935; its Marine defenses were established in 1941."
    },
    "saipan": {
      "capacity": 25000,
      "artillery": 30,
      "aircraft": 2,
      "dock": 0,
      "tier": "station",
      "trade": 12,
      "note": "Japanese South Seas Mandate administrative and commercial harbor, before its major wartime defenses."
    },
    "truk": {
      "capacity": 45000,
      "artillery": 40,
      "aircraft": 2,
      "dock": 0,
      "tier": "station",
      "trade": 8,
      "note": "Large natural lagoon in the Japanese mandate; limited interwar facilities, not yet the wartime fleet base."
    },
    "palau": {
      "capacity": 20000,
      "artillery": 20,
      "aircraft": 0,
      "dock": 0,
      "tier": "station",
      "trade": 10,
      "note": "Koror administrative and commercial anchorage in the Japanese mandate."
    },
    "kwajalein": {
      "capacity": 15000,
      "artillery": 10,
      "aircraft": 0,
      "dock": 0,
      "tier": "station",
      "trade": 3,
      "note": "Marshall Islands lagoon in the Japanese mandate; extensive military facilities came later."
    },
    "majuro": {
      "capacity": 8000,
      "artillery": 0,
      "aircraft": 0,
      "dock": 0,
      "tier": "station",
      "trade": 2,
      "note": "Lightly developed Marshall Islands anchorage; it was not a major prewar fleet base."
    },
    "tarawa": {
      "capacity": 8000,
      "artillery": 0,
      "aircraft": 0,
      "dock": 0,
      "tier": "station",
      "trade": 3,
      "note": "British Gilbert Islands anchorage; the later Japanese defenses are not part of the opening position."
    },
    "brest": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 90,
      "note": "Atlantic naval arsenal and repair base."
    },
    "toulon": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 75,
      "note": "Principal French Mediterranean arsenal."
    },
    "dakar": {
      "capacity": 180000,
      "artillery": 650,
      "aircraft": 30,
      "dock": 0,
      "tier": "base",
      "trade": 45,
      "note": "West African fleet and commercial support port."
    },
    "la_spezia": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 55,
      "note": "Italian naval arsenal."
    },
    "taranto": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 55,
      "note": "Major southern fleet base and arsenal."
    },
    "tobruk": {
      "capacity": 35000,
      "artillery": 120,
      "aircraft": 4,
      "dock": 0,
      "tier": "station",
      "trade": 10,
      "note": "Forward Libyan anchorage with limited repair support."
    },
    "leningrad": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 85,
      "note": "Kronstadt fleet base and the Leningrad naval shipbuilding complex."
    },
    "sevastopol": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 55,
      "note": "Principal Black Sea fleet base and repair facilities."
    },
    "vladivostok": {
      "capacity": 180000,
      "artillery": 650,
      "aircraft": 30,
      "dock": 0,
      "tier": "base",
      "trade": 40,
      "note": "Far Eastern fleet and commercial port."
    },
    "scapa": {
      "capacity": 180000,
      "artillery": 900,
      "aircraft": 30,
      "dock": 0,
      "tier": "base",
      "trade": 8,
      "note": "Large sheltered fleet anchorage; major dockyard work requires a mainland arsenal."
    },
    "portsmouth": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 100,
      "note": "Royal dockyard and Channel fleet base."
    },
    "rosyth": {
      "capacity": 280000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 45,
      "note": "Forth dockyard, opened during the First World War; reduced interwar activity."
    },
    "heligoland": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 75,
      "note": "Wilhelmshaven naval dockyard; the icon marks the coastal base, not Heligoland island."
    },
    "kiel": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 65,
      "note": "Baltic arsenal and fleet base. Routes go around Denmark; the Kiel Canal is not simulated."
    },
    "yokosuka": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 85,
      "note": "Tokyo Bay naval arsenal and fleet base."
    },
    "kure": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 65,
      "note": "Inland Sea naval arsenal and battleship repair base."
    },
    "sasebo": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 50,
      "note": "Western Japanese fleet arsenal and repair base."
    },
    "san_diego": {
      "capacity": 180000,
      "artillery": 650,
      "aircraft": 30,
      "dock": 0,
      "tier": "base",
      "trade": 65,
      "note": "Fleet operating base and destroyer support; major construction is represented at the Pacific arsenals."
    },
    "mare_island": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 95,
      "note": "San Francisco Bay naval shipyard and repair complex."
    },
    "puget": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 60,
      "note": "Puget Sound naval shipyard and capital-ship repair base."
    },
    "norfolk": {
      "capacity": 420000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 100,
      "note": "Hampton Roads fleet base and Norfolk Navy Yard."
    },
    "hawaii": {
      "capacity": 300000,
      "artillery": 1500,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 55,
      "note": "Pearl Harbor naval station, dry dock and Pacific fleet support."
    },
    "manila": {
      "capacity": 120000,
      "artillery": 1400,
      "aircraft": 16,
      "dock": 0,
      "tier": "base",
      "trade": 70,
      "note": "Manila/Cavite: principal Asiatic Fleet repair and refueling base. Limited yard capacity; harbor defenses include Corregidor."
    },
    "guam": {
      "capacity": 12000,
      "artillery": 30,
      "aircraft": 0,
      "dock": 0,
      "tier": "station",
      "trade": 3,
      "note": "Apra Harbor and the small Piti naval yard. Limited facilities, without the major base developed during the Second World War.",
      "gunRange": 5
    },
    "gibraltar": {
      "capacity": 220000,
      "artillery": 1800,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 50,
      "note": "Fortified strait, dry docks and Mediterranean fleet support."
    },
    "alexandria": {
      "capacity": 180000,
      "artillery": 650,
      "aircraft": 30,
      "dock": 0,
      "tier": "base",
      "trade": 70,
      "note": "Commercial harbor and eastern Mediterranean fleet anchorage."
    },
    "singapore": {
      "capacity": 160000,
      "artillery": 850,
      "aircraft": 30,
      "dock": 0,
      "tier": "base",
      "trade": 100,
      "note": "Naval base under construction in 1936. The King George VI graving dock did not open until February 1938."
    },
    "freetown": {
      "capacity": 35000,
      "artillery": 120,
      "aircraft": 4,
      "dock": 0,
      "tier": "station",
      "trade": 35,
      "note": "Sierra Leone coaling and convoy station."
    },
    "ascension": {
      "capacity": 12000,
      "artillery": 25,
      "aircraft": 0,
      "dock": 0,
      "tier": "station",
      "trade": 3,
      "note": "Isolated anchorage; minimal local infrastructure."
    },
    "cape": {
      "capacity": 230000,
      "artillery": 1000,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 65,
      "note": "Simon’s Town dockyard and Cape sea-route support."
    },
    "durban": {
      "capacity": 180000,
      "artillery": 650,
      "aircraft": 30,
      "dock": 0,
      "tier": "base",
      "trade": 55,
      "note": "Commercial harbor and repair support on the Indian Ocean route."
    },
    "mauritius": {
      "capacity": 35000,
      "artillery": 120,
      "aircraft": 4,
      "dock": 0,
      "tier": "station",
      "trade": 25,
      "note": "Port Louis commercial harbor and refueling station."
    },
    "diego_garcia": {
      "capacity": 8000,
      "artillery": 0,
      "aircraft": 0,
      "dock": 0,
      "tier": "station",
      "trade": 2,
      "note": "Small Chagos anchorage; no modern naval base in this period."
    },
    "ceylon": {
      "capacity": 180000,
      "artillery": 650,
      "aircraft": 30,
      "dock": 0,
      "tier": "base",
      "trade": 65,
      "note": "Trincomalee anchorage and Ceylon sea-route support."
    },
    "australia_west": {
      "capacity": 180000,
      "artillery": 650,
      "aircraft": 30,
      "dock": 0,
      "tier": "base",
      "trade": 45,
      "note": "Fremantle commercial harbor and fleet support."
    },
    "malta": {
      "capacity": 260000,
      "artillery": 1800,
      "aircraft": 60,
      "dock": 1,
      "tier": "dock",
      "trade": 55,
      "note": "Valletta dockyard and fortified Mediterranean fleet base."
    }
  },
  "opening1922": {
    "wake": {
      "capacity": 2000,
      "artillery": 0,
      "aircraft": 0,
      "dock": 0,
      "tier": "station",
      "trade": 1,
      "note": "Unfortified American atoll; no commercial flying-boat station yet."
    },
    "singapore": {
      "capacity": 50000,
      "artillery": 250,
      "aircraft": 4,
      "dock": 0,
      "tier": "station",
      "trade": 100,
      "note": "Commercial harbor and refueling station in 1922. The new naval base was approved in 1923."
    },
    "hawaii": {
      "capacity": 220000,
      "artillery": 1000,
      "aircraft": 12,
      "dock": 1,
      "tier": "dock",
      "trade": 45,
      "note": "Pearl Harbor’s first permanent dry dock opened in 1919; facilities were still expanding."
    },
    "san_diego": {
      "capacity": 110000,
      "artillery": 650,
      "aircraft": 8,
      "dock": 0,
      "tier": "base",
      "trade": 50,
      "note": "Destroyer base established in 1922, with limited early repair facilities."
    },
    "vladivostok": {
      "capacity": 45000,
      "artillery": 200,
      "aircraft": 0,
      "dock": 0,
      "tier": "station",
      "trade": 20,
      "note": "Civil-war disruption and foreign intervention constrain Far Eastern naval support at the 1922 opening."
    },
    "leningrad": {
      "capacity": 230000,
      "artillery": 1000,
      "aircraft": 8,
      "dock": 1,
      "tier": "dock",
      "trade": 65,
      "note": "Petrograd and Kronstadt retain arsenals, with reduced activity following revolution and civil war."
    },
    "sevastopol": {
      "capacity": 100000,
      "artillery": 400,
      "aircraft": 4,
      "dock": 0,
      "tier": "base",
      "trade": 35,
      "note": "Black Sea naval infrastructure recovering from the civil war."
    }
  },
  "expansions": {
    "singapore": {
      "year": 1938,
      "tier": "dock",
      "dock": 1,
      "capacity": 300000,
      "aircraft": 80,
      "artillery": 2300
    },
    "saipan": {
      "year": 1940,
      "aircraft": 48,
      "capacity": 90000
    },
    "truk": {
      "year": 1940,
      "aircraft": 64,
      "capacity": 150000
    },
    "kwajalein": {
      "year": 1940,
      "aircraft": 48,
      "capacity": 60000
    },
    "wake": {
      "year": 1941,
      "aircraft": 12,
      "artillery": 200
    },
    "midway": {
      "year": 1941,
      "aircraft": 24,
      "artillery": 300
    }
  },
  "batteries": {
    "none": [
      "No coastal battery",
      0
    ],
    "manila": [
      "Long-range 305 mm harbor batteries",
      27.4
    ],
    "heavy": [
      "Heavy coastal battery · representative",
      28
    ],
    "dock": [
      "Heavy harbor battery · representative",
      24
    ],
    "base": [
      "152 mm coast defense · representative",
      16
    ],
    "station": [
      "Light coastal battery · representative",
      8
    ]
  },
  "batteryThreshold": 1500,
  "batterySources": {
    "manila": "Moore report: long-range 12-inch guns reached about 30,000 yards. Other batteries had shorter reach.",
    "representative": "Provisional representative battery and mounting; not a verified inventory of every historical gun."
  }
}
```
