# war politics — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

The French defeat dispatch requires actual German control of metropolitan France. The Vichy announcement also requires that outcome; its historical date follows the European campaign offset. If France holds, those dispatches and the dependent Indochina concession chain wait. Northern entry is political news; southern entry transfers the Saigon station through the existing base-control rules. Vichy is a political split within the single playable French ministry, not an eighth playable nation, and these announcements never fabricate ship losses. German occupation of the Vichy zone is conditional on continued mainland control.

Historical sequence: [Japan Center for Asian Historical Records](https://www.jacar.go.jp/english/exhibition/showa100/01_02.html), [US naval records on Indochina](https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/m/magic-backgraound-pearl-harbor-vol-2.html), [Ordre de la Libération chronology](https://www.ordredelaliberation.fr/fr/chronologie-indicative-seconde-guerre-mondiale).

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
      "date": "1936-10-25T12:00:00.000Z",
      "importance": "major"
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
      "date": "1936-11-25T12:00:00.000Z",
      "importance": "major"
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
      "date": "1937-11-06T12:00:00.000Z",
      "importance": "routine"
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
      "date": "1939-05-22T12:00:00.000Z",
      "importance": "major"
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
      "date": "1940-09-27T12:00:00.000Z",
      "importance": "major"
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
      "date": "1942-01-01T12:00:00.000Z",
      "importance": "major"
    }
  ],
  "WORLD_NEWS": [
    {
      "id": "rhineland",
      "title": "German troops enter the Rhineland",
      "body": "German troops have entered the demilitarized Rhineland. European governments are reviewing their security commitments.",
      "date": "1936-03-07T12:00:00.000Z",
      "importance": "major"
    },
    {
      "id": "war-in-china",
      "title": "War in China",
      "body": "Fighting at the Marco Polo Bridge has opened a wider conflict between Japan and China. Japanese forces are expanding their operations on the mainland, and foreign governments are reviewing their position in East Asia.",
      "date": "1937-07-07T12:00:00.000Z",
      "importance": "major",
      "alertKind": "war"
    },
    {
      "id": "anschluss",
      "title": "German troops enter Austria",
      "body": "German forces have entered Austria. The European balance of power is changing.",
      "date": "1938-03-12T12:00:00.000Z",
      "importance": "major"
    },
    {
      "id": "munich",
      "title": "The Munich Agreement",
      "body": "The Munich settlement permits German annexation of the Sudetenland. Governments publicly welcome the agreement while continuing their armament programs.",
      "date": "1938-09-30T12:00:00.000Z",
      "importance": "major"
    },
    {
      "id": "molotov-ribbentrop",
      "title": "German–Soviet non-aggression pact",
      "body": "Germany and the Soviet Union have signed a non-aggression pact. This political agreement does not grant either navy access to the other’s bases.",
      "date": "1939-08-23T12:00:00.000Z",
      "importance": "major"
    },
    {
      "id": "fall-france",
      "date": "1940-05-10T12:00:00Z",
      "followEuropeanOffset": true,
      "title": "The fall of France",
      "importance": "major",
      "affectedNations": [
        "FRA",
        "GBR",
        "DEU"
      ],
      "requiresTerritory": {
        "id": "c220",
        "owner": "DEU"
      },
      "body": "The French mainland campaign has ended in German occupation. An armistice is being negotiated; the fleet and overseas commands face an uncertain political future. Occupied home production is unavailable, while overseas naval forces continue to operate."
    },
    {
      "id": "vichy-france",
      "date": "1940-07-10T12:00:00Z",
      "followEuropeanOffset": true,
      "title": "Vichy France is established",
      "importance": "major",
      "requiresNews": "fall-france",
      "requiresTerritory": {
        "id": "c220",
        "owner": "DEU"
      },
      "body": "Following the mainland defeat, an armistice government at Vichy claims authority over France and its empire. Free French leaders call for continued resistance. French naval administration remains represented by one ministry; this political division does not automatically transfer or scuttle its ships."
    },
    {
      "id": "northern-indochina",
      "date": "1940-09-22T12:00:00Z",
      "title": "Japan enters northern Indochina",
      "importance": "major",
      "requiresNews": "vichy-france",
      "body": "Japanese forces have entered northern French Indochina following pressure on the colonial administration. The deployment threatens the supply corridor to China and increases concern in London and Washington. Southern naval stations remain under French control."
    },
    {
      "id": "southern-indochina",
      "date": "1941-07-24T12:00:00Z",
      "title": "Japan moves into southern Indochina",
      "importance": "major",
      "requiresNews": "northern-indochina",
      "stationAccess": {
        "port": "saigon",
        "previous": "FRA",
        "owner": "JPN"
      },
      "body": "The colonial administration has yielded access to southern Indochina. Japanese forces now control the Saigon staging station and its airfields, extending their operational reach toward Malaya and Singapore. Allied governments are considering economic restrictions."
    },
    {
      "id": "japan-assets-frozen",
      "title": "Japanese assets frozen abroad",
      "body": "The United States has frozen Japanese assets following the occupation of southern Indochina. Restrictions on fuel and overseas trade deepen the Pacific crisis.",
      "date": "1941-07-26T12:00:00.000Z",
      "importance": "major",
      "requiresNews": "southern-indochina"
    },
    {
      "id": "occupation-vichy-zone",
      "date": "1942-11-11T12:00:00Z",
      "title": "German forces enter the Vichy zone",
      "importance": "major",
      "requiresNews": "vichy-france",
      "requiresTerritory": {
        "id": "c220",
        "owner": "DEU"
      },
      "body": "German forces have moved into the formerly unoccupied French zone. The armistice administration loses its remaining freedom of action, and French naval commanders face pressure over control of their ships. No fleet is automatically destroyed by this dispatch."
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

The outbreak announcement uses the Marco Polo Bridge incident of 7 July 1937 as the campaign marker: [Japan Center for Asian Historical Records](https://www.jacar.go.jp/english/exhibition/shuhou-english/timeline/nenpyo19370707.html). Major events interrupt all ministries; routine pact accessions interrupt participating governments and otherwise appear once in the news ticker.
