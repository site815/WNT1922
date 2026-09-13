# Germany — opening navy and economy

Edit the JSON block directly. This document is read by the game; no export is required.

```json game-data
{
  "title": "The restricted Reichsmarine",
  "description": "The historical Reichsmarine begins under Versailles, outside Washington. Old battleships, a small personnel ceiling and a submarine ban constrain every ambition.",
  "nation": "DEU",
  "hulls": [
    {
      "id": "km_hannover",
      "class_id": "deutschland_bb",
      "name": "Hannover",
      "laid_down": "1904-11-07",
      "launched": "1905-09-29",
      "completed": "1907-10-01",
      "status": "active",
      "assignment": "Line squadron, Baltic",
      "legacy": true
    },
    {
      "id": "km_schlesien",
      "class_id": "deutschland_bb",
      "name": "Schlesien",
      "laid_down": "1904-11-19",
      "launched": "1906-05-28",
      "completed": "1908-05-05",
      "status": "active",
      "assignment": "Line squadron, North Sea",
      "legacy": true
    },
    {
      "id": "km_schleswig_holstein",
      "class_id": "deutschland_bb",
      "name": "Schleswig-Holstein",
      "laid_down": "1905-08-18",
      "launched": "1906-12-17",
      "completed": "1908-07-06",
      "status": "active",
      "assignment": "Line squadron, North Sea",
      "legacy": true
    },
    {
      "id": "km_braunschweig",
      "class_id": "braunschweig_bb",
      "name": "Braunschweig",
      "laid_down": "1901-10-01",
      "launched": "1902-12-20",
      "completed": "1904-10-15",
      "status": "active",
      "assignment": "Gunnery training",
      "legacy": true
    },
    {
      "id": "km_elsass",
      "class_id": "braunschweig_bb",
      "name": "Elsass",
      "laid_down": "1901-05-26",
      "launched": "1903-05-26",
      "completed": "1904-11-29",
      "status": "active",
      "assignment": "Line squadron, Baltic",
      "legacy": true
    },
    {
      "id": "km_hessen",
      "class_id": "braunschweig_bb",
      "name": "Hessen",
      "laid_down": "1902-04-15",
      "launched": "1903-09-18",
      "completed": "1905-09-19",
      "status": "active",
      "assignment": "Line squadron, Baltic",
      "legacy": true
    },
    {
      "id": "km_preussen",
      "class_id": "braunschweig_bb",
      "name": "Preussen",
      "laid_down": "1902-04-01",
      "launched": "1903-10-30",
      "completed": "1905-07-12",
      "status": "reserve",
      "notes": "Reserve under Article 181's two-ship allowance. Hulked as a depot ship before the decade is out.",
      "legacy": true
    },
    {
      "id": "km_lothringen",
      "class_id": "braunschweig_bb",
      "name": "Lothringen",
      "laid_down": "1902-12-01",
      "launched": "1904-05-27",
      "completed": "1906-05-18",
      "status": "reserve",
      "notes": "Reserve under Article 181's two-ship allowance. The Treaty names her type in its own text and she is the oldest thing in it.",
      "legacy": true
    },
    {
      "id": "km_emden",
      "class_id": "emden_cl",
      "name": "Emden",
      "laid_down": "1921-12-08",
      "launched": null,
      "completed": null,
      "pct_complete": 4,
      "status": "building",
      "legacy": true
    }
  ],
  "aggregates": [
    {
      "class_id": "gazelle_cl",
      "count": 4,
      "status": "reserve",
      "id": "v-DEU-0",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "Niobe",
        "Nymphe",
        "Thetis",
        "Amazone"
      ]
    },
    {
      "class_id": "bremen_cl",
      "count": 2,
      "status": "active",
      "id": "v-DEU-1",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "Hamburg",
        "Berlin"
      ]
    },
    {
      "class_id": "v1_dd",
      "count": 12,
      "status": "active",
      "id": "v-DEU-2",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "V1",
        "V2",
        "V3",
        "V5",
        "V6",
        "G7",
        "G8",
        "G10",
        "G11",
        "S18",
        "S19",
        "S23"
      ]
    },
    {
      "class_id": "a_boat_tb",
      "count": 12,
      "status": "active",
      "id": "v-DEU-3",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "A20",
        "A21",
        "A22",
        "A23",
        "A24",
        "A25",
        "A26",
        "A27",
        "A28",
        "A29",
        "A30",
        "A31"
      ]
    }
  ],
  "support": [],
  "designs": [
    "deutschland_bb",
    "braunschweig_bb",
    "mackensen_bc",
    "emden_cl",
    "bremen_cl",
    "gazelle_cl",
    "v1_dd",
    "a_boat_tb",
    "de_support_1922",
    "de_support_1932",
    "de_support_1942"
  ],
  "merchants": {
    "hulls": 1090,
    "grossRegisterTons": 654407,
    "referenceYear": 1921,
    "scope": "Powered merchant ships of at least 100 GRT; USA excludes Great Lakes; United Kingdom excludes Dominions.",
    "note": ""
  },
  "shipNamePools": {
    "gazelle_cl": [
      "Niobe",
      "Nymphe",
      "Thetis",
      "Amazone"
    ],
    "bremen_cl": [
      "Hamburg",
      "Berlin"
    ],
    "v1_dd": [
      "V1",
      "V2",
      "V3",
      "V5",
      "V6",
      "G7",
      "G8",
      "G10",
      "G11",
      "S18",
      "S19",
      "S23"
    ],
    "a_boat_tb": [
      "A20",
      "A21",
      "A22",
      "A23",
      "A24",
      "A25",
      "A26",
      "A27",
      "A28",
      "A29",
      "A30",
      "A31"
    ]
  },
  "economy": {
    "yardYear": 67540.4850193768,
    "crew": 8000,
    "crewYear": 560,
    "aircraftYear": 300,
    "aviatorsYear": 117,
    "gdp": 59571,
    "gtp": 25530,
    "strategicModifier": 0.2,
    "productUnit": "kg fine-gold equivalent per year"
  },
  "starting": {
    "gold": 16209.716404650433,
    "influence": 70,
    "industry": 26340.789157556956,
    "training": 65,
    "morale": 75,
    "level": 1,
    "funding": 0.5,
    "bases": [
      "atlantic"
    ],
    "strategic": 571
  },
  "procurement": {
    "industryFactor": 1,
    "customIndustryFactor": 1
  },
  "ai": {
    "roles": {
      "DD": 38,
      "CL": 18,
      "CA": 15,
      "BB": 10,
      "CV": 0,
      "SS": 19
    }
  }
}
```
