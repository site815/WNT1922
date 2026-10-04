# Imperial Japanese Navy — 1939 historical opening

Authored opening data. Read directly by the game; no export step is required.

```json game-data
{
  "name": "Japan",
  "navy": "Imperial Japanese Navy",
  "color": "#f27b73",
  "home": "pacific",
  "rival": "USA",
  "title": "Imperial Japanese Navy",
  "description": "Historical 1939 opening. Named capital ships and carriers with date-specific availability; escort groups, resources and shore aircraft are explicitly representative game estimates.",
  "nation": "JPN",
  "hulls": [
    {
      "id": "hist-kongo",
      "name": "Kongo",
      "class_id": "kongo",
      "status": "active",
      "port": "kure",
      "legacy": true
    },
    {
      "id": "hist-hiei",
      "name": "Hiei",
      "class_id": "kongo",
      "status": "repair",
      "port": "kure",
      "legacy": true,
      "health": 0.7,
      "notes": "Historical reconstruction/refit in progress at1August1939; repair readiness and completion are simulated."
    },
    {
      "id": "hist-haruna",
      "name": "Haruna",
      "class_id": "kongo",
      "status": "active",
      "port": "kure",
      "legacy": true
    },
    {
      "id": "hist-kirishima",
      "name": "Kirishima",
      "class_id": "kongo",
      "status": "active",
      "port": "kure",
      "legacy": true
    },
    {
      "id": "hist-fuso",
      "name": "Fuso",
      "class_id": "fuso",
      "status": "active",
      "port": "kure",
      "legacy": true
    },
    {
      "id": "hist-yamashiro",
      "name": "Yamashiro",
      "class_id": "fuso",
      "status": "active",
      "port": "kure",
      "legacy": true
    },
    {
      "id": "hist-ise",
      "name": "Ise",
      "class_id": "ise",
      "status": "active",
      "port": "kure",
      "legacy": true
    },
    {
      "id": "hist-hyuga",
      "name": "Hyuga",
      "class_id": "ise",
      "status": "active",
      "port": "kure",
      "legacy": true
    },
    {
      "id": "hist-nagato",
      "name": "Nagato",
      "class_id": "nagato",
      "status": "active",
      "port": "kure",
      "legacy": true
    },
    {
      "id": "hist-mutsu",
      "name": "Mutsu",
      "class_id": "nagato",
      "status": "active",
      "port": "kure",
      "legacy": true
    },
    {
      "id": "hist-akagi",
      "name": "Akagi",
      "class_id": "akagi_cv",
      "status": "active",
      "port": "yokosuka",
      "legacy": true
    },
    {
      "id": "hist-kaga",
      "name": "Kaga",
      "class_id": "kaga_cv",
      "status": "active",
      "port": "sasebo",
      "legacy": true
    },
    {
      "id": "hist-soryu",
      "name": "Soryu",
      "class_id": "hist-soryu",
      "status": "active",
      "port": "yokosuka",
      "legacy": true
    },
    {
      "id": "hist-hiryu",
      "name": "Hiryu",
      "class_id": "hist-hiryu",
      "status": "active",
      "port": "yokosuka",
      "legacy": true
    },
    {
      "id": "hist-ryujo",
      "name": "Ryujo",
      "class_id": "hist-ryujo",
      "status": "active",
      "port": "sasebo",
      "legacy": true
    },
    {
      "id": "hist-hosho",
      "name": "Hosho",
      "class_id": "hosho",
      "status": "reserve",
      "port": "kure",
      "legacy": true
    },
    {
      "id": "hist-shokaku",
      "name": "Shokaku",
      "class_id": "hist-shokaku",
      "status": "building",
      "port": "yokosuka",
      "legacy": true,
      "pct_complete": 35
    },
    {
      "id": "hist-zuikaku",
      "name": "Zuikaku",
      "class_id": "hist-shokaku",
      "status": "building",
      "port": "yokosuka",
      "legacy": true,
      "pct_complete": 35
    },
    {
      "id": "hist-yamato",
      "name": "Yamato",
      "class_id": "hist-yamato",
      "status": "building",
      "port": "kure",
      "legacy": true,
      "pct_complete": 35
    },
    {
      "id": "hist-musashi",
      "name": "Musashi",
      "class_id": "hist-yamato",
      "status": "building",
      "port": "kure",
      "legacy": true,
      "pct_complete": 35
    }
  ],
  "aggregates": [
    {
      "id": "hist-group-hist-myoko",
      "class_id": "hist-myoko",
      "count": 8,
      "status": "active",
      "port": "sasebo",
      "name": "Myoko / Takao cruiser fit groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-furutaka",
      "class_id": "furutaka",
      "count": 4,
      "status": "active",
      "port": "sasebo",
      "name": "Furutaka class groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-kuma",
      "class_id": "kuma",
      "count": 5,
      "status": "active",
      "port": "sasebo",
      "name": "Kuma class groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-nagara",
      "class_id": "nagara",
      "count": 6,
      "status": "active",
      "port": "sasebo",
      "name": "Nagara class groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-yubari",
      "class_id": "yubari",
      "count": 1,
      "status": "active",
      "port": "sasebo",
      "name": "Yubari (experimental) groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-hist-fubuki",
      "class_id": "hist-fubuki",
      "count": 40,
      "status": "active",
      "port": "sasebo",
      "name": "Fubuki / special-type destroyer fit groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-minekaze",
      "class_id": "minekaze",
      "count": 15,
      "status": "active",
      "port": "sasebo",
      "name": "Minekaze class groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-momi",
      "class_id": "momi",
      "count": 12,
      "status": "active",
      "port": "sasebo",
      "name": "Momi class (2nd class) groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-hist-kaidai",
      "class_id": "hist-kaidai",
      "count": 30,
      "status": "active",
      "port": "sasebo",
      "name": "Kaidai fleet submarine fit groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-kaichu",
      "class_id": "kaichu",
      "count": 20,
      "status": "active",
      "port": "sasebo",
      "name": "Kaichu type groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    }
  ],
  "designs": [
    "kongo",
    "fuso",
    "ise",
    "nagato",
    "akagi_cv",
    "kaga_cv",
    "hist-soryu",
    "hist-hiryu",
    "hist-ryujo",
    "hosho",
    "hist-shokaku",
    "hist-yamato",
    "hist-myoko",
    "furutaka",
    "kuma",
    "nagara",
    "yubari",
    "hist-fubuki",
    "minekaze",
    "momi",
    "hist-kaidai",
    "kaichu",
    "jp_support_1932",
    "jp_support_1922",
    "jp_support_1942"
  ],
  "support": [
    {
      "id": "hist-support-JPN",
      "class_id": "jp_support_1932",
      "count": 15,
      "status": "active",
      "port": "sasebo",
      "representative": true,
      "notes": "Abstract fleet auxiliaries, not a named historical auxiliary roster."
    }
  ],
  "merchants": {
    "hulls": 2146,
    "grossRegisterTons": 4085650,
    "note": "Civilian merchant register; abstract hull count and average registered volume."
  },
  "shipNamePools": {
    "minekaze": [
      "Minekaze",
      "Sawakaze",
      "Okikaze",
      "Shimakaze",
      "Nadakaze",
      "Yakaze",
      "Hakaze",
      "Shiokaze",
      "Akikaze",
      "Yukaze",
      "Tachikaze",
      "Hokaze",
      "Nokaze",
      "Namikaze",
      "Numakaze",
      "Kamikaze",
      "Asakaze",
      "Harukaze",
      "Matsukaze",
      "Hatakaze",
      "Oite",
      "Hayate",
      "Asanagi",
      "Yunagi",
      "Mutsuki",
      "Kisaragi",
      "Yayoi",
      "Uzuki",
      "Satsuki",
      "Minazuki",
      "Fumizuki",
      "Nagatsuki",
      "Kikuzuki",
      "Mikazuki",
      "Mochizuki",
      "Yuzuki",
      "Momi",
      "Kaya",
      "Nashi",
      "Take"
    ]
  },
  "economy": {
    "yardYear": 148000,
    "crew": 67352,
    "crewYear": 1800,
    "aircraftYear": 1000,
    "aviatorsYear": 400,
    "gdp": 65560,
    "gtp": 53640,
    "strategicModifier": 0.12,
    "productUnit": "kg fine-gold equivalent per year",
    "balanceNote": "Provisional ministry production baseline, with authored wartime adjustments; not a reconstruction of national GDP or historical naval appropriations."
  },
  "starting": {
    "gold": 30000,
    "influence": 70,
    "industry": 29600,
    "training": 65,
    "morale": 70,
    "level": 3,
    "funding": 0.5,
    "bases": [
      "pacific"
    ],
    "strategic": 1294
  },
  "procurement": {
    "industryFactor": 1,
    "customIndustryFactor": 1
  },
  "names": {},
  "openingAccuracy": "Named major combatants are date-specific. Escort counts, stores, crew pool, budgets and initial station assignments are gameplay estimates; no claim of a complete order of battle or exact daily disposition. Procurement doctrine weights are provisional game preferences, not reconstructed historical appropriations.",
  "ai": {
    "roles": {
      "DD": 34,
      "CL": 8,
      "CA": 13,
      "BB": 19,
      "CV": 18,
      "SS": 8
    },
    "cruiserSiege": false
  }
}
```
