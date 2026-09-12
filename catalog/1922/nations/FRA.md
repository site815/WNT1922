# France — opening navy and economy

Edit the JSON block directly. This document is read by the game; no export is required.

```json game-data
{
  "title": "The Treaty System",
  "description": "A historical navy rebuilding after the Great War. Treaty parity with Italy leaves Atlantic commitments competing with Mediterranean security.",
  "nation": "FRA",
  "hulls": [
    {
      "id": "mn_courbet",
      "class_id": "courbet",
      "name": "Courbet",
      "laid_down": "1910-09-01",
      "launched": "1911-09-23",
      "completed": "1913-11-19",
      "status": "active",
      "treaty_fate": "retained",
      "assignment": "Mediterranean Squadron",
      "legacy": true
    },
    {
      "id": "mn_jean_bart_1911",
      "class_id": "courbet",
      "name": "Jean Bart",
      "laid_down": "1910-11-15",
      "launched": "1911-09-22",
      "completed": "1913-06-05",
      "status": "active",
      "treaty_fate": "retained",
      "assignment": "Mediterranean Squadron",
      "legacy": true
    },
    {
      "id": "mn_paris",
      "class_id": "courbet",
      "name": "Paris",
      "laid_down": "1911-11-10",
      "launched": "1912-09-28",
      "completed": "1914-08-01",
      "status": "active",
      "treaty_fate": "retained",
      "assignment": "Mediterranean Squadron",
      "legacy": true
    },
    {
      "id": "mn_france",
      "class_id": "courbet",
      "name": "France",
      "laid_down": "1911-11-30",
      "launched": "1912-11-07",
      "completed": "1914-07-15",
      "status": "active",
      "treaty_fate": "retained",
      "notes": "Historically wrecked in Quiberon Bay, Aug 1922 — scripted event candidate",
      "legacy": true
    },
    {
      "id": "mn_bretagne",
      "class_id": "bretagne",
      "name": "Bretagne",
      "laid_down": "1912-07-22",
      "launched": "1913-04-21",
      "completed": "1916-02-10",
      "status": "active",
      "treaty_fate": "retained",
      "assignment": "Mediterranean Squadron (flagship)",
      "legacy": true
    },
    {
      "id": "mn_provence",
      "class_id": "bretagne",
      "name": "Provence",
      "laid_down": "1912-05-01",
      "launched": "1913-04-20",
      "completed": "1916-03-01",
      "status": "active",
      "treaty_fate": "retained",
      "legacy": true
    },
    {
      "id": "mn_lorraine",
      "class_id": "bretagne",
      "name": "Lorraine",
      "laid_down": "1912-08-01",
      "launched": "1913-09-30",
      "completed": "1916-03-10",
      "status": "active",
      "treaty_fate": "retained",
      "legacy": true
    },
    {
      "id": "mn_bearn",
      "class_id": "normandie",
      "name": "Bearn",
      "laid_down": "1914-01-10",
      "launched": "1920-04-15",
      "completed": null,
      "pct_complete": 25,
      "status": "converting",
      "treaty_fate": "convert_carrier",
      "notes": "Conversion to carrier decided 1922; references bearn_cv design when complete",
      "legacy": true
    }
  ],
  "aggregates": [
    {
      "class_id": "edgar_quinet",
      "count": 2,
      "status": "active",
      "id": "v-FRA-0",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "Edgar Quinet",
        "Waldeck-Rousseau"
      ]
    },
    {
      "class_id": "arabe",
      "count": 12,
      "status": "active",
      "id": "v-FRA-1",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "Algérien",
        "Annamite",
        "Arabe",
        "Bambara",
        "Hova",
        "Kabyle",
        "Marocain",
        "Sakalave",
        "Sénégalais",
        "Somali",
        "Tonkinois",
        "Touareg"
      ]
    },
    {
      "class_id": "lagrange",
      "count": 4,
      "status": "active",
      "id": "v-FRA-2",
      "progress": 0.4,
      "legacy": true,
      "shipNames": [
        "Lagrange",
        "Laplace",
        "Regnault",
        "Romazotti"
      ]
    }
  ],
  "support": [],
  "designs": [
    "courbet",
    "bretagne",
    "normandie",
    "edgar_quinet",
    "duguay_trouin",
    "arabe",
    "chacal",
    "lagrange",
    "requin",
    "fr_depot_1922",
    "fr_oiler_1922"
  ],
  "merchants": {
    "hulls": 1662,
    "grossRegisterTons": 3298759,
    "referenceYear": 1921,
    "scope": "Powered merchant ships of at least 100 GRT; USA excludes Great Lakes; United Kingdom excludes Dominions.",
    "note": ""
  },
  "shipNamePools": {
    "edgar_quinet": [
      "Edgar Quinet",
      "Waldeck-Rousseau"
    ],
    "arabe": [
      "Algérien",
      "Annamite",
      "Arabe",
      "Bambara",
      "Hova",
      "Kabyle",
      "Marocain",
      "Sakalave",
      "Sénégalais",
      "Somali",
      "Tonkinois",
      "Touareg"
    ],
    "lagrange": [
      "Lagrange",
      "Laplace",
      "Regnault",
      "Romazotti"
    ]
  },
  "economy": {
    "yardYear": 52262.499757435726,
    "crew": 24000,
    "crewYear": 1200,
    "aircraftYear": 650,
    "aviatorsYear": 195,
    "gdp": 49649,
    "gtp": 26734,
    "strategicModifier": 0.35,
    "productUnit": "kg fine-gold equivalent per year"
  },
  "starting": {
    "gold": 22111.057589684344,
    "influence": 70,
    "industry": 16080.769156134069,
    "training": 65,
    "morale": 75,
    "level": 1,
    "funding": 0.5,
    "bases": [
      "mediterranean"
    ],
    "strategic": 794
  },
  "procurement": {
    "industryFactor": 1,
    "customIndustryFactor": 1
  },
  "ai": {
    "roles": {
      "DD": 35,
      "CL": 15,
      "CA": 12,
      "BB": 14,
      "CV": 6,
      "SS": 18
    }
  }
}
```
