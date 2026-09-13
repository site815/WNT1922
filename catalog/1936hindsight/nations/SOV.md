# Soviet Union — opening navy and economy

Edit the JSON block directly. This document is read by the game; no export is required.

```json game-data
{
  "title": "Krasny Okean",
  "description": "Heavy industrial investment funds a Soviet battle fleet, carriers and the escorts needed to operate them across separated seas.",
  "nation": "SOV",
  "hulls": [
    {
      "id": "sov_marat",
      "name": "Marat",
      "class_id": "sevastopol_1914",
      "status": "active",
      "legacy": true
    },
    {
      "id": "sov_parizhskaya",
      "name": "Parizhskaya Kommuna",
      "class_id": "sevastopol_1914",
      "status": "active",
      "legacy": true,
      "port": "sevastopol"
    },
    {
      "id": "sov_gangut",
      "name": "Oktyabrskaya Revolyutsiya",
      "class_id": "sevastopol_1914",
      "status": "active",
      "legacy": true
    },
    {
      "id": "sov_svetlana",
      "name": "Krasny Krym",
      "class_id": "svetlana_1913",
      "status": "active",
      "pct_complete": 60,
      "legacy": true
    }
  ],
  "aggregates": [
    {
      "id": "program-ocean_bb28",
      "class_id": "ocean_bb28",
      "count": 1,
      "status": "active",
      "shipNames": [
        "Sovetskaya Rossiya"
      ],
      "name": "Sovetskaya Rossiya"
    },
    {
      "id": "program-ocean_bb28-detached",
      "class_id": "ocean_bb28",
      "count": 1,
      "status": "active",
      "port": "vladivostok",
      "shipNames": [
        "Sovetskaya Ukraina"
      ],
      "name": "Sovetskaya Ukraina"
    },
    {
      "id": "program-ocean_cv30",
      "class_id": "ocean_cv30",
      "count": 1,
      "status": "active",
      "shipNames": [
        "Krasny Okean"
      ],
      "name": "Krasny Okean"
    },
    {
      "id": "program-ocean_cv30-detached",
      "class_id": "ocean_cv30",
      "count": 1,
      "status": "active",
      "port": "vladivostok",
      "shipNames": [
        "Krasnaya Zvezda"
      ],
      "name": "Krasnaya Zvezda"
    },
    {
      "id": "program-ocean_cl29",
      "class_id": "ocean_cl29",
      "count": 3,
      "status": "active",
      "shipNames": [
        "Kirov",
        "Voroshilov",
        "Molotov"
      ]
    },
    {
      "id": "program-ocean_cl29-detached",
      "class_id": "ocean_cl29",
      "count": 3,
      "status": "active",
      "port": "vladivostok",
      "shipNames": [
        "Maksim Gorky",
        "Kalinin",
        "Kaganovich"
      ]
    },
    {
      "id": "program-ocean_dd30",
      "class_id": "ocean_dd30",
      "count": 18,
      "status": "active",
      "shipNames": [
        "Gnevny",
        "Gordy",
        "Gromky",
        "Gremyashchy",
        "Grozyashchy",
        "Grozny",
        "Grozovoy",
        "Gremyachy",
        "Steregushchy",
        "Smetlivy",
        "Sokol",
        "Stremitelny",
        "Razumny",
        "Rezky",
        "Reshitelny",
        "Rastoropny",
        "Retivy",
        "Razyaryonny"
      ]
    },
    {
      "id": "program-ocean_dd30-detached",
      "class_id": "ocean_dd30",
      "count": 18,
      "status": "active",
      "port": "vladivostok",
      "shipNames": [
        "Rekordny",
        "Razyashchy",
        "Bodry",
        "Boiky",
        "Bystry",
        "Besposhchadny",
        "Bezuprechny",
        "Bditelny",
        "Soobrazitelny",
        "Sposobny",
        "Svobodny",
        "Silny",
        "Stoiky",
        "Storozhevoy",
        "Serdity",
        "Smely",
        "Skory",
        "Surovy"
      ]
    },
    {
      "id": "program-ocean_ss29",
      "class_id": "ocean_ss29",
      "count": 12,
      "status": "active",
      "shipNames": [
        "Shch-101",
        "Shch-102",
        "Shch-103",
        "Shch-104",
        "Shch-105",
        "Shch-106",
        "Shch-107",
        "Shch-108",
        "Shch-109",
        "Shch-110",
        "Shch-111",
        "Shch-112"
      ]
    },
    {
      "id": "program-ocean_ss29-detached",
      "class_id": "ocean_ss29",
      "count": 12,
      "status": "active",
      "port": "vladivostok",
      "shipNames": [
        "Shch-201",
        "Shch-202",
        "Shch-203",
        "Shch-204",
        "Shch-205",
        "Shch-206",
        "Shch-207",
        "Shch-208",
        "Shch-209",
        "Shch-210",
        "Shch-211",
        "Shch-212"
      ]
    },
    {
      "id": "program-ocean_bb34-building",
      "class_id": "ocean_bb34",
      "count": 2,
      "status": "building",
      "progress": 0.45,
      "shipNames": [
        "Sovetsky Soyuz",
        "Sovetskaya Belorussiya"
      ]
    },
    {
      "id": "legacy-sov-novik",
      "class_id": "novik_series",
      "count": 17,
      "status": "active",
      "legacy": true,
      "shipNames": [
        "Novik",
        "Kapitan Izylmetev",
        "Kapitan 1-go ranga Miklukho-Maklai",
        "Kapitan Kern",
        "Engels",
        "Karl Marx",
        "Volodarsky",
        "Lenin",
        "Stalin",
        "Dzerzhinsky",
        "Frunze",
        "Nezamozhnik",
        "Shaumyan",
        "Petrovsky",
        "Artyom",
        "Izyaslav",
        "Voykov"
      ]
    },
    {
      "id": "legacy-sov-bars",
      "class_id": "bars_1915",
      "count": 6,
      "status": "reserve",
      "legacy": true,
      "shipNames": [
        "Pantera",
        "Volk",
        "Vepr",
        "Yaguar",
        "Rys",
        "Tur"
      ]
    }
  ],
  "designs": [
    "ocean_bb28",
    "ocean_cv30",
    "ocean_cl29",
    "ocean_dd30",
    "ocean_ss29",
    "ocean_bb34",
    "ocean_cv38",
    "su_support_1932",
    "su_support_1922",
    "su_support_1942"
  ],
  "support": [
    {
      "id": "support-SOV",
      "class_id": "su_support_1932",
      "count": 6,
      "status": "active"
    }
  ],
  "merchants": {
    "hulls": 575,
    "grossRegisterTons": 1110811,
    "referenceYear": 1935,
    "scope": "Powered merchant ships of at least 100 GRT; USA excludes Great Lakes; United Kingdom excludes Dominions.",
    "note": ""
  },
  "shipNamePools": {
    "ocean_bb28": [
      "Sovetskaya Rossiya",
      "Sovetskaya Ukraina"
    ],
    "ocean_cv30": [
      "Krasny Okean",
      "Krasnaya Zvezda"
    ],
    "ocean_cl29": [
      "Kirov",
      "Voroshilov",
      "Molotov",
      "Maksim Gorky",
      "Kalinin",
      "Kaganovich"
    ],
    "ocean_dd30": [
      "Gnevny",
      "Gordy",
      "Gromky",
      "Gremyashchy",
      "Grozyashchy",
      "Grozny",
      "Grozovoy",
      "Gremyachy",
      "Steregushchy",
      "Smetlivy",
      "Sokol",
      "Stremitelny",
      "Razumny",
      "Rezky",
      "Reshitelny",
      "Rastoropny",
      "Retivy",
      "Razyaryonny",
      "Rekordny",
      "Razyashchy",
      "Bodry",
      "Boiky",
      "Bystry",
      "Besposhchadny",
      "Bezuprechny",
      "Bditelny",
      "Soobrazitelny",
      "Sposobny",
      "Svobodny",
      "Silny",
      "Stoiky",
      "Storozhevoy",
      "Serdity",
      "Smely",
      "Skory",
      "Surovy"
    ],
    "ocean_ss29": [
      "Shch-101",
      "Shch-102",
      "Shch-103",
      "Shch-104",
      "Shch-105",
      "Shch-106",
      "Shch-107",
      "Shch-108",
      "Shch-109",
      "Shch-110",
      "Shch-111",
      "Shch-112",
      "Shch-201",
      "Shch-202",
      "Shch-203",
      "Shch-204",
      "Shch-205",
      "Shch-206",
      "Shch-207",
      "Shch-208",
      "Shch-209",
      "Shch-210",
      "Shch-211",
      "Shch-212"
    ],
    "ocean_bb34": [
      "Sovetsky Soyuz",
      "Sovetskaya Belorussiya"
    ],
    "novik_series": [
      "Novik",
      "Kapitan Izylmetev",
      "Kapitan 1-go ranga Miklukho-Maklai",
      "Kapitan Kern",
      "Engels",
      "Karl Marx",
      "Volodarsky",
      "Lenin",
      "Stalin",
      "Dzerzhinsky",
      "Frunze",
      "Nezamozhnik",
      "Shaumyan",
      "Petrovsky",
      "Artyom",
      "Izyaslav",
      "Voykov"
    ],
    "bars_1915": [
      "Pantera",
      "Volk",
      "Vepr",
      "Yaguar",
      "Rys",
      "Tur",
      "Zmeya"
    ]
  },
  "economy": {
    "yardYear": 140000,
    "crew": 48000,
    "crewYear": 2400,
    "aircraftYear": 550,
    "aviatorsYear": 320,
    "gdp": 151300,
    "gtp": 26700,
    "strategicModifier": 0.8,
    "productUnit": "kg fine-gold equivalent per year"
  },
  "starting": {
    "gold": 39000,
    "influence": 70,
    "industry": 50000,
    "training": 65,
    "morale": 75,
    "level": 5,
    "funding": 0.5,
    "bases": [
      "atlantic"
    ],
    "strategic": 3144
  },
  "procurement": {
    "industryFactor": 1,
    "customIndustryFactor": 1
  }
}
```
