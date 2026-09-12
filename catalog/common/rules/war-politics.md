# war politics — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
{
  "PACT_EVENTS": [
    {
      "id": "axis-friendship",
      "name": "The Rome-Berlin Axis",
      "members": [
        "DEU",
        "ITA"
      ],
      "kind": "political",
      "body": "Berlin and Rome have aligned their foreign policies. Their navies continue to receive national orders.",
      "date": "1936-10-25T12:00:00.000Z"
    },
    {
      "id": "anti-comintern",
      "name": "The Anti-Comintern Pact",
      "members": [
        "DEU",
        "JPN"
      ],
      "kind": "political",
      "body": "Germany and Japan have signed an agreement directed against the Communist International.",
      "date": "1936-11-25T12:00:00.000Z"
    },
    {
      "id": "anti-comintern-italy",
      "name": "Italy joins the Anti-Comintern Pact",
      "members": [
        "DEU",
        "JPN",
        "ITA"
      ],
      "kind": "political",
      "body": "Italy has joined Germany and Japan in the anti-Comintern alignment.",
      "date": "1937-11-06T12:00:00.000Z"
    },
    {
      "id": "steel",
      "name": "The Pact of Steel",
      "members": [
        "DEU",
        "ITA"
      ],
      "kind": "defensive",
      "body": "Germany and Italy have signed a military alliance. Naval access is shared; entry into war follows the historical campaign timeline.",
      "date": "1939-05-22T12:00:00.000Z"
    },
    {
      "id": "tripartite",
      "name": "The Tripartite Pact",
      "members": [
        "DEU",
        "ITA",
        "JPN"
      ],
      "kind": "defensive",
      "body": "Germany, Italy and Japan have signed the Tripartite Pact. Naval access is shared; the agreement does not bring Japan into the European war immediately.",
      "date": "1940-09-27T12:00:00.000Z"
    },
    {
      "id": "united-nations-declaration",
      "name": "The Declaration by United Nations",
      "members": [
        "GBR",
        "USA",
        "SOV"
      ],
      "kind": "defensive",
      "body": "Twenty-six governments have pledged their resources against the Axis. Among the playable powers, the United Kingdom, United States and Soviet Union now share allied naval access. This does not bring the Soviet Union into the Pacific war.",
      "date": "1942-01-01T12:00:00.000Z"
    }
  ],
  "WORLD_NEWS": [
    {
      "id": "rhineland",
      "title": "German troops enter the Rhineland",
      "body": "German troops have entered the demilitarized Rhineland. European governments are reviewing their security commitments.",
      "date": "1936-03-07T12:00:00.000Z"
    },
    {
      "id": "anschluss",
      "title": "German troops enter Austria",
      "body": "German forces have entered Austria. The European balance of power is changing.",
      "date": "1938-03-12T12:00:00.000Z"
    },
    {
      "id": "munich",
      "title": "The Munich Agreement",
      "body": "The Munich settlement permits German annexation of the Sudetenland. Governments publicly welcome the agreement while continuing their armament programs.",
      "date": "1938-09-30T12:00:00.000Z"
    },
    {
      "id": "molotov-ribbentrop",
      "title": "German–Soviet non-aggression pact",
      "body": "Germany and the Soviet Union have signed a non-aggression pact. This political agreement does not grant either navy access to the other’s bases.",
      "date": "1939-08-23T12:00:00.000Z"
    },
    {
      "id": "japan-assets-frozen",
      "title": "Japanese assets frozen abroad",
      "body": "The United States has frozen Japanese assets following the occupation of southern Indochina. Restrictions on fuel and overseas trade deepen the Pacific crisis.",
      "date": "1941-07-26T12:00:00.000Z"
    }
  ],
  "HISTORICAL_WARS": [
    {
      "key": "italian-entry",
      "date": "1940-06-10T16:00:00Z",
      "pairs": [
        [
          "ITA",
          "GBR"
        ],
        [
          "ITA",
          "FRA"
        ]
      ],
      "title": "Italy enters the European war",
      "followEuropeanOffset": true
    },
    {
      "key": "barbarossa",
      "date": "1941-06-22T01:00:00Z",
      "pairs": [
        [
          "DEU",
          "SOV"
        ],
        [
          "ITA",
          "SOV"
        ]
      ],
      "title": "Germany invades the Soviet Union",
      "followEuropeanOffset": true
    },
    {
      "key": "pacific-war",
      "date": "1941-12-07T17:55:00Z",
      "pairs": [
        [
          "JPN",
          "USA"
        ],
        [
          "JPN",
          "GBR"
        ]
      ],
      "title": "Japan opens the Pacific war",
      "followEuropeanOffset": false
    },
    {
      "key": "axis-us-war",
      "date": "1941-12-11T14:00:00Z",
      "pairs": [
        [
          "DEU",
          "USA"
        ],
        [
          "ITA",
          "USA"
        ]
      ],
      "title": "Germany and Italy declare war on the United States",
      "followEuropeanOffset": false
    },
    {
      "key": "soviet-japan-war",
      "date": "1945-08-08T15:00:00Z",
      "pairs": [
        [
          "SOV",
          "JPN"
        ]
      ],
      "title": "The Soviet Union declares war on Japan",
      "followEuropeanOffset": false
    }
  ],
  "EUROPE_OPENING": {
    "invasion": {
      "key": "poland-declaration",
      "title": "Germany invades Poland",
      "log": "Germany has invaded Poland.",
      "body": "German forces have crossed the Polish border. United Kingdom and France are preparing their response."
    },
    "declarations": [
      {
        "attacker": "DEU",
        "defender": "GBR",
        "reason": "United Kingdom has declared war following the invasion of Poland."
      },
      {
        "attacker": "DEU",
        "defender": "FRA",
        "reason": "France has declared war following the invasion of Poland."
      }
    ],
    "navalFocus": {
      "GBR": "atlantic",
      "DEU": "atlantic"
    }
  }
}
```
