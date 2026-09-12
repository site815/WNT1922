# Italy — opening navy and economy

Edit the JSON block directly. This document is read by the game; no export is required.

```json game-data
{
  "title": "The Treaty System",
  "description": "A historical fleet concentrated in the Mediterranean. Parity with France offers status, but aging battleships and limited funds demand careful modernization.",
  "nation": "ITA",
  "hulls": [
    {
      "id": "rm_dante_alighieri",
      "class_id": "dante_alighieri",
      "name": "Dante Alighieri",
      "laid_down": "1909-06-06",
      "launched": "1910-08-20",
      "completed": "1913-01-15",
      "status": "active",
      "treaty_fate": "retained",
      "notes": "Historically stricken 1928 to save funds",
      "legacy": true
    },
    {
      "id": "rm_conte_di_cavour",
      "class_id": "conte_di_cavour",
      "name": "Conte di Cavour",
      "laid_down": "1910-08-10",
      "launched": "1911-08-10",
      "completed": "1915-04-01",
      "status": "active",
      "treaty_fate": "retained",
      "legacy": true
    },
    {
      "id": "rm_giulio_cesare",
      "class_id": "conte_di_cavour",
      "name": "Giulio Cesare",
      "laid_down": "1910-06-24",
      "launched": "1911-10-15",
      "completed": "1914-05-14",
      "status": "active",
      "treaty_fate": "retained",
      "legacy": true
    },
    {
      "id": "rm_andrea_doria",
      "class_id": "andrea_doria",
      "name": "Andrea Doria",
      "laid_down": "1912-03-24",
      "launched": "1913-03-30",
      "completed": "1916-03-13",
      "status": "active",
      "treaty_fate": "retained",
      "legacy": true
    },
    {
      "id": "rm_caio_duilio",
      "class_id": "andrea_doria",
      "name": "Caio Duilio",
      "laid_down": "1912-02-24",
      "launched": "1913-04-24",
      "completed": "1915-05-10",
      "status": "active",
      "treaty_fate": "retained",
      "legacy": true
    },
    {
      "id": "rm_francesco_caracciolo",
      "class_id": "caracciolo",
      "name": "Francesco Caracciolo",
      "laid_down": "1914-10-12",
      "launched": "1920-05-12",
      "completed": null,
      "pct_complete": 30,
      "status": "building",
      "treaty_fate": "canceled",
      "notes": "Hull sold 1926 (historical); conversion proposals make this an alt-history fork",
      "legacy": true
    }
  ],
  "aggregates": [
    {
      "class_id": "san_giorgio",
      "count": 2,
      "status": "active",
      "id": "v-ITA-0",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "San Giorgio",
        "San Marco"
      ]
    },
    {
      "class_id": "quarto",
      "count": 3,
      "status": "active",
      "id": "v-ITA-1",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "Quarto",
        "Nino Bixio",
        "Marsala"
      ]
    },
    {
      "class_id": "leone",
      "count": 3,
      "status": "building",
      "id": "v-ITA-2",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "Leone",
        "Pantera",
        "Tigre"
      ]
    },
    {
      "class_id": "curtatone",
      "count": 4,
      "status": "building",
      "id": "v-ITA-3",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "Curtatone",
        "Calatafimi",
        "Castelfidardo",
        "Monzambano"
      ]
    },
    {
      "class_id": "palestro",
      "count": 4,
      "status": "active",
      "id": "v-ITA-4",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "Palestro",
        "Confienza",
        "San Martino",
        "Solferino"
      ]
    },
    {
      "class_id": "provana",
      "count": 3,
      "status": "active",
      "id": "v-ITA-5",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "Andrea Provana",
        "Giacomo Nani",
        "Lazzaro Mocenigo"
      ]
    }
  ],
  "support": [],
  "designs": [
    "dante_alighieri",
    "conte_di_cavour",
    "andrea_doria",
    "caracciolo",
    "san_giorgio",
    "quarto",
    "leone",
    "curtatone",
    "palestro",
    "provana",
    "it_depot_1922",
    "it_oiler_1922"
  ],
  "merchants": {
    "hulls": 893,
    "grossRegisterTons": 2467537,
    "referenceYear": 1921,
    "scope": "Powered merchant ships of at least 100 GRT; USA excludes Great Lakes; United Kingdom excludes Dominions.",
    "note": ""
  },
  "shipNamePools": {
    "san_giorgio": [
      "San Giorgio",
      "San Marco"
    ],
    "quarto": [
      "Quarto",
      "Nino Bixio",
      "Marsala"
    ],
    "leone": [
      "Leone",
      "Pantera",
      "Tigre"
    ],
    "curtatone": [
      "Curtatone",
      "Calatafimi",
      "Castelfidardo",
      "Monzambano"
    ],
    "palestro": [
      "Palestro",
      "Confienza",
      "San Martino",
      "Solferino"
    ],
    "provana": [
      "Andrea Provana",
      "Giacomo Nani",
      "Lazzaro Mocenigo"
    ]
  },
  "economy": {
    "yardYear": 51319.53323597458,
    "crew": 22400,
    "crewYear": 1120,
    "aircraftYear": 600,
    "aviatorsYear": 182,
    "gdp": 43582,
    "gtp": 29055,
    "strategicModifier": 0.1,
    "productUnit": "kg fine-gold equivalent per year"
  },
  "starting": {
    "gold": 18948.750733282923,
    "influence": 70,
    "industry": 17369.68817217601,
    "training": 65,
    "morale": 75,
    "level": 1,
    "funding": 0.5,
    "bases": [
      "mediterranean"
    ],
    "strategic": 593
  },
  "procurement": {
    "industryFactor": 1,
    "customIndustryFactor": 1
  }
}
```
