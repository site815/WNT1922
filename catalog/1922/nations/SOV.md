# Soviet Union — opening navy and economy

Edit the JSON block directly. This document is read by the game; no export is required.

```json game-data
{
  "title": "Soviet Russia · rebuilding the Red Fleet",
  "description": "Civil war has left the historical fleet scattered and worn. Outside Washington, Soviet Russia must restore crews and industry before building anew.",
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
      "status": "reserve",
      "legacy": true
    },
    {
      "id": "sov_gangut",
      "name": "Gangut",
      "class_id": "sevastopol_1914",
      "status": "reserve",
      "legacy": true
    },
    {
      "id": "sov_svetlana",
      "name": "Svetlana",
      "class_id": "svetlana_1913",
      "status": "building",
      "pct_complete": 60,
      "legacy": true
    },
    {
      "id": "sov_aurora",
      "name": "Aurora",
      "class_id": "aurora_1903",
      "status": "reserve",
      "legacy": true
    }
  ],
  "aggregates": [
    {
      "class_id": "novik_series",
      "count": 7,
      "status": "active",
      "representative": true,
      "notes": "Seven active destroyers in the 1922 Baltic roster, represented by a common Novik fit.",
      "id": "v-SOV-0",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "Novik",
        "Kapitan Izylmetev",
        "Kapitan 1-go ranga Miklukho-Maklai",
        "Kapitan Kern",
        "Engels",
        "Karl Marx",
        "Volodarsky"
      ]
    },
    {
      "class_id": "novik_series",
      "count": 10,
      "status": "reserve",
      "representative": true,
      "notes": "Provisional useful inherited destroyer reserve; mixed exact fits are not yet cataloged.",
      "id": "v-SOV-1",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
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
      "class_id": "bars_1915",
      "count": 7,
      "status": "reserve",
      "representative": true,
      "notes": "Representative Baltic submarine flotilla. Listed boats returned to service late in 1922; the player may recommission them.",
      "id": "v-SOV-2",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "Pantera",
        "Volk",
        "Vepr",
        "Yaguar",
        "Rys",
        "Tur",
        "Zmeya"
      ]
    }
  ],
  "support": [],
  "designs": [
    "sevastopol_1914",
    "svetlana_1913",
    "novik_series",
    "bars_1915",
    "aurora_1903",
    "su_depot_1922",
    "su_oiler_1922"
  ],
  "merchants": {
    "hulls": 100,
    "grossRegisterTons": null,
    "referenceYear": 1922,
    "scope": "Powered merchant ships of at least 100 GRT; USA excludes Great Lakes; United Kingdom excludes Dominions.",
    "note": "PROVISIONAL: 100 game hulls. The 1921–22 Lloyd’s casualty summary does not enumerate Soviet-controlled vessels; no verified 1922 national total is claimed.",
    "estimated": true
  },
  "shipNamePools": {
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
    "yardYear": 36596.05452724422,
    "crew": 13440.000000000002,
    "crewYear": 1920,
    "aircraftYear": 550,
    "aviatorsYear": 208,
    "gdp": 39550,
    "gtp": 6979,
    "strategicModifier": 0.8,
    "productUnit": "kg fine-gold equivalent per year"
  },
  "starting": {
    "gold": 10194.615189732318,
    "influence": 70,
    "industry": 13070.019474015793,
    "training": 65,
    "morale": 75,
    "level": 1,
    "funding": 0.5,
    "bases": [
      "atlantic"
    ],
    "strategic": 822
  },
  "procurement": {
    "industryFactor": 1,
    "customIndustryFactor": 1
  },
  "ai": {
    "roles": {
      "DD": 40,
      "CL": 18,
      "CA": 5,
      "BB": 10,
      "CV": 2,
      "SS": 25
    }
  }
}
```
