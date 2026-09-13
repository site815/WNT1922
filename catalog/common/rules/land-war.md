# land war — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

Campaigns name the actual navy supplying each side with optional `attackerNavy` or `defenderNavy` fields. `restoredOwner` controls occupation after a successful counteroffensive; otherwise original territorial ownership applies. Dated territorial changes and port-to-territory links below drive the map directly.

Completed occupation or liberation changes morale under [campaign-impact.md](campaign-impact.md), once per actual ownership change. Home economic shares in [economy.md](economy.md) lose productive access when occupied; overseas islands and colonies have no direct GDP effect. Port blockade denies usable trade without changing ownership, whereas occupation transfers the port.

```json game-data
{
  "POWERS": {
    "USA": {
      "name": "United States"
    },
    "GBR": {
      "name": "United Kingdom & Commonwealth"
    },
    "JPN": {
      "name": "Japan"
    },
    "DEU": {
      "name": "Germany"
    },
    "FRA": {
      "name": "France"
    },
    "SOV": {
      "name": "Soviet Union"
    },
    "ITA": {
      "name": "Italy"
    },
    "CHN": {
      "name": "China"
    },
    "NLD": {
      "name": "Netherlands"
    },
    "BEL": {
      "name": "Belgium"
    },
    "PRT": {
      "name": "Portugal"
    },
    "ESP": {
      "name": "Spain"
    },
    "DNK": {
      "name": "Denmark"
    }
  },
  "CAMPAIGNS": [
    {
      "id": "poland",
      "name": "Poland",
      "start": -11080,
      "attacker": "DEU",
      "defender": "GBR",
      "territories": [
        "c290",
        "c291"
      ],
      "from": [
        15,
        52
      ],
      "to": [
        25,
        52
      ],
      "days": 40,
      "seaWeight": 0.09,
      "baseline": 1,
      "trigger": "poland"
    },
    {
      "id": "norway",
      "name": "Norway",
      "start": -10859,
      "attacker": "DEU",
      "defender": "GBR",
      "territories": [
        "c385",
        "c390"
      ],
      "from": [
        7,
        57
      ],
      "to": [
        20,
        70
      ],
      "days": 75,
      "seaWeight": 0.75,
      "baseline": 0.75
    },
    {
      "id": "france",
      "name": "France & the Low Countries",
      "start": -10828,
      "attacker": "DEU",
      "defender": "GBR",
      "territories": [
        "c220",
        "c210",
        "c211",
        "c212"
      ],
      "from": [
        8,
        50
      ],
      "to": [
        -4,
        47
      ],
      "days": 65,
      "seaWeight": 0.15,
      "baseline": 0.9,
      "counter": -9340,
      "counterBaseline": -0.72,
      "defenderNavy": "FRA"
    },
    {
      "id": "balkans",
      "name": "Balkan campaign",
      "start": -10497,
      "attacker": "DEU",
      "defender": "GBR",
      "territories": [
        "c345",
        "c350"
      ],
      "from": [
        17,
        47
      ],
      "to": [
        25,
        36
      ],
      "days": 80,
      "seaWeight": 0.26,
      "baseline": 0.8,
      "counter": -9223,
      "counterBaseline": -0.65
    },
    {
      "id": "africa",
      "name": "North African supply war",
      "start": -10702,
      "attacker": "ITA",
      "defender": "GBR",
      "territories": [
        "c620",
        "c651",
        "c616"
      ],
      "from": [
        10,
        31
      ],
      "to": [
        33,
        31
      ],
      "days": 250,
      "seaWeight": 0.85,
      "baseline": 0.12,
      "initial": 0.48,
      "counter": -9916,
      "counterBaseline": -0.65,
      "restoredOwner": "GBR"
    },
    {
      "id": "east",
      "name": "Eastern Front",
      "start": -10420,
      "attacker": "DEU",
      "defender": "SOV",
      "territories": [
        "c365w",
        "c290",
        "c255e"
      ],
      "from": [
        12.5,
        53
      ],
      "to": [
        42,
        53
      ],
      "days": 540,
      "seaWeight": 0.065,
      "baseline": 0.7,
      "initial": 0.3,
      "counter": -9830,
      "counterBaseline": -0.6,
      "restoredOwner": "SOV"
    },
    {
      "id": "italy",
      "name": "Italian campaign",
      "start": -9673,
      "attacker": "GBR",
      "defender": "ITA",
      "territories": [
        "c325"
      ],
      "from": [
        15,
        37
      ],
      "to": [
        11,
        47
      ],
      "days": 700,
      "seaWeight": 0.5,
      "baseline": 0.7
    },
    {
      "id": "germany",
      "name": "Western advance into Germany",
      "start": -9100,
      "attacker": "GBR",
      "defender": "DEU",
      "territories": [
        "c255w"
      ],
      "from": [
        5,
        51
      ],
      "to": [
        12.5,
        51
      ],
      "days": 170,
      "seaWeight": 0.13,
      "baseline": 0.7,
      "requires": "france"
    },
    {
      "id": "china",
      "name": "War in China",
      "start": -11866,
      "attacker": "JPN",
      "defender": "CHN",
      "territories": [
        "c710"
      ],
      "from": [
        123,
        35
      ],
      "to": [
        105,
        35
      ],
      "days": 1500,
      "seaWeight": 0.16,
      "baseline": 0.3,
      "independent": true,
      "counter": -9862,
      "counterBaseline": -0.1
    },
    {
      "id": "malaya",
      "name": "Malaya & Singapore",
      "start": -10251,
      "attacker": "JPN",
      "defender": "GBR",
      "territories": [
        "c821",
        "c827"
      ],
      "from": [
        101,
        7
      ],
      "to": [
        104,
        1
      ],
      "days": 110,
      "seaWeight": 0.55,
      "baseline": 0.65,
      "pacific": true,
      "port": "singapore",
      "counter": -9284,
      "counterBaseline": -0.25
    },
    {
      "id": "philippines",
      "name": "Philippine islands",
      "start": -10251,
      "attacker": "JPN",
      "defender": "USA",
      "territories": [
        "c840"
      ],
      "from": [
        122,
        20
      ],
      "to": [
        125,
        6
      ],
      "days": 180,
      "seaWeight": 0.5,
      "baseline": 0.55,
      "pacific": true,
      "port": "manila",
      "counter": -9204,
      "counterBaseline": -0.7
    },
    {
      "id": "east-indies",
      "name": "East Indies",
      "start": -10217,
      "attacker": "JPN",
      "defender": "GBR",
      "territories": [
        "c850",
        "c823",
        "c824",
        "c835"
      ],
      "from": [
        120,
        7
      ],
      "to": [
        115,
        -10
      ],
      "days": 160,
      "seaWeight": 0.5,
      "baseline": 0.6,
      "pacific": true,
      "coalition": true,
      "counter": -9253,
      "counterBaseline": -0.3
    },
    {
      "id": "solomons",
      "name": "Solomons & New Guinea",
      "start": -10161,
      "attacker": "JPN",
      "defender": "GBR",
      "territories": [
        "c911",
        "c912",
        "c940"
      ],
      "from": [
        153,
        -3
      ],
      "to": [
        160,
        -12
      ],
      "days": 240,
      "seaWeight": 1.1,
      "baseline": 0.3,
      "pacific": true,
      "counter": -10009,
      "counterBaseline": -0.45
    },
    {
      "id": "island-guam",
      "name": "Guam",
      "start": -17532,
      "attacker": "JPN",
      "defender": "USA",
      "territories": [
        "island-guam"
      ],
      "from": [
        144.9,
        13
      ],
      "to": [
        145,
        13
      ],
      "days": 8,
      "seaWeight": 1.2,
      "baseline": 0,
      "island": true,
      "pacific": true,
      "port": "guam",
      "resistance": 35,
      "initial": 0
    },
    {
      "id": "island-wake",
      "name": "Wake Island",
      "start": -17532,
      "attacker": "JPN",
      "defender": "USA",
      "territories": [
        "island-wake"
      ],
      "from": [
        166.52,
        19.28
      ],
      "to": [
        166.62,
        19.28
      ],
      "days": 14,
      "seaWeight": 1.2,
      "baseline": 0,
      "island": true,
      "pacific": true,
      "port": "wake",
      "resistance": 45,
      "initial": 0
    },
    {
      "id": "island-midway",
      "name": "Midway",
      "start": -17532,
      "attacker": "JPN",
      "defender": "USA",
      "territories": [
        "island-midway"
      ],
      "from": [
        -177.47,
        28.21
      ],
      "to": [
        -177.37,
        28.21
      ],
      "days": 55,
      "seaWeight": 1.2,
      "baseline": 0,
      "island": true,
      "pacific": true,
      "port": "midway",
      "resistance": 160,
      "initial": 0
    },
    {
      "id": "island-saipan",
      "name": "Saipan & Tinian",
      "start": -17532,
      "attacker": "USA",
      "defender": "JPN",
      "territories": [
        "island-saipan"
      ],
      "from": [
        145.58,
        15.16
      ],
      "to": [
        145.68,
        15.16
      ],
      "days": 60,
      "seaWeight": 1.2,
      "baseline": 0,
      "island": true,
      "pacific": true,
      "port": "saipan",
      "resistance": 150,
      "initial": 0
    },
    {
      "id": "island-truk",
      "name": "Truk Lagoon",
      "start": -17532,
      "attacker": "USA",
      "defender": "JPN",
      "territories": [
        "island-truk"
      ],
      "from": [
        151.73000000000002,
        7.4
      ],
      "to": [
        151.83,
        7.4
      ],
      "days": 90,
      "seaWeight": 1.2,
      "baseline": 0,
      "island": true,
      "pacific": true,
      "port": "truk",
      "resistance": 230,
      "initial": 0
    },
    {
      "id": "island-palau",
      "name": "Palau",
      "start": -17532,
      "attacker": "USA",
      "defender": "JPN",
      "territories": [
        "island-palau"
      ],
      "from": [
        134.32,
        7.27
      ],
      "to": [
        134.42,
        7.27
      ],
      "days": 40,
      "seaWeight": 1.2,
      "baseline": 0,
      "island": true,
      "pacific": true,
      "port": "palau",
      "resistance": 110,
      "initial": 0
    },
    {
      "id": "island-kwajalein",
      "name": "Kwajalein",
      "start": -17532,
      "attacker": "USA",
      "defender": "JPN",
      "territories": [
        "island-kwajalein"
      ],
      "from": [
        167.59,
        8.73
      ],
      "to": [
        167.69,
        8.73
      ],
      "days": 30,
      "seaWeight": 1.2,
      "baseline": 0,
      "island": true,
      "pacific": true,
      "port": "kwajalein",
      "resistance": 85,
      "initial": 0
    },
    {
      "id": "island-majuro",
      "name": "Majuro",
      "start": -17532,
      "attacker": "USA",
      "defender": "JPN",
      "territories": [
        "island-majuro"
      ],
      "from": [
        171.26000000000002,
        7.1
      ],
      "to": [
        171.36,
        7.1
      ],
      "days": 10,
      "seaWeight": 1.2,
      "baseline": 0,
      "island": true,
      "pacific": true,
      "port": "majuro",
      "resistance": 25,
      "initial": 0
    },
    {
      "id": "island-tarawa",
      "name": "Tarawa",
      "start": -17532,
      "attacker": "JPN",
      "defender": "GBR",
      "territories": [
        "island-tarawa"
      ],
      "from": [
        172.83,
        1.35
      ],
      "to": [
        172.93,
        1.35
      ],
      "days": 14,
      "seaWeight": 1.2,
      "baseline": 0,
      "island": true,
      "pacific": true,
      "port": "tarawa",
      "resistance": 45,
      "initial": 0
    }
  ],
  "NEUTRAL_COLOR": "#343b43",
  "TERRITORY_EVENTS": [
    {
      "date": "1938-03-12",
      "territory": "c305",
      "owner": "DEU"
    },
    {
      "date": "1939-03-15",
      "territory": "c315",
      "owner": "DEU"
    }
  ],
  "ORIGINAL_CONTROL": {
    "c620": "ITA",
    "c616": "FRA",
    "c651": "GBR",
    "c290": "c290",
    "c291": "c290",
    "c385": "c385",
    "c390": "DNK",
    "c220": "FRA",
    "c210": "NLD",
    "c211": "BEL",
    "c212": "c212",
    "c345": "c345",
    "c350": "c350",
    "c325": "ITA",
    "c365w": "SOV",
    "c255w": "DEU",
    "c255e": "DEU",
    "c710": "CHN",
    "c840": "USA",
    "c821": "GBR",
    "c827": "GBR",
    "c850": "NLD",
    "c823": "GBR",
    "c824": "GBR",
    "c835": "GBR",
    "c911": "GBR",
    "c912": "GBR",
    "c940": "GBR"
  },
  "PORT_TERRITORIES": {
    "manila": "c840",
    "singapore": "c827",
    "alexandria": "c651",
    "heligoland": "c255w",
    "kiel": "c255w",
    "brest": "c220",
    "toulon": "c220",
    "taranto": "c325",
    "la_spezia": "c325",
    "tobruk": "c620",
    "leningrad": "c365w",
    "sevastopol": "c365w"
  },
  "COALITION_WAR": [
    "JPN",
    "USA"
  ]
}
```
