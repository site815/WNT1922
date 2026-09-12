# France — opening navy and economy

Edit the JSON block directly. This document is read by the game; no export is required.

```json game-data
{
  "title": "La Revanche de l'École",
  "description": "A modern Jeune École: submarine flotillas, torpedo destroyers, fast cruisers and a practiced naval air arm.",
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
      "status": "reserve",
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
      "class_id": "bearn_cv",
      "name": "Bearn",
      "laid_down": "1914-01-10",
      "launched": "1920-04-15",
      "completed": null,
      "pct_complete": 25,
      "status": "active",
      "treaty_fate": "convert_carrier",
      "notes": "Conversion to carrier decided 1922; references bearn_cv design when complete",
      "legacy": true
    }
  ],
  "aggregates": [
    {
      "id": "program-ecole_ss28",
      "class_id": "ecole_ss28",
      "count": 18,
      "status": "active",
      "shipNames": [
        "Surcouf",
        "Redoutable",
        "Vengeur",
        "Pascal",
        "Pasteur",
        "Henri Poincaré",
        "Poncelet",
        "Archimède",
        "Fresnel",
        "Monge",
        "Ampère",
        "Achille",
        "Ajax",
        "Actéon",
        "Achéron",
        "Argo",
        "Protée",
        "Persée"
      ]
    },
    {
      "id": "program-ecole_ss28-detached",
      "class_id": "ecole_ss28",
      "count": 18,
      "status": "active",
      "port": "brest",
      "shipNames": [
        "Pégase",
        "Prométhée",
        "L Espoir",
        "Le Glorieux",
        "Le Héros",
        "Le Centaure",
        "Le Conquérant",
        "Le Tonnant",
        "Agosta",
        "Bévéziers",
        "Ouessant",
        "Sidi-Ferruch",
        "Sfax",
        "Casabianca",
        "Rubis",
        "Saphir",
        "Nautilus",
        "Perle"
      ]
    },
    {
      "id": "program-ecole_dd30",
      "class_id": "ecole_dd30",
      "count": 16,
      "status": "active",
      "shipNames": [
        "Bourrasque",
        "Cyclone",
        "Mistral",
        "Orage",
        "Ouragan",
        "Simoun",
        "Siroco",
        "Tempête",
        "Tornade",
        "Tramontane",
        "Trombe",
        "Typhon",
        "L Adroit",
        "L Alcyon",
        "Le Basque",
        "Le Boulonnais"
      ]
    },
    {
      "id": "program-ecole_dd30-detached",
      "class_id": "ecole_dd30",
      "count": 16,
      "status": "active",
      "port": "brest",
      "shipNames": [
        "Le Brestois",
        "Le Bordelais",
        "Le Forbin",
        "Le Fougueux",
        "Le Frondeur",
        "Le Mars",
        "La Palme",
        "Le Railleur",
        "Le Fortuné",
        "Le Foudroyant",
        "Le Hardi",
        "L Épée",
        "Le Fleuret",
        "Le Corsaire",
        "Le Flibustier",
        "Le Téméraire"
      ]
    },
    {
      "id": "program-ecole_cl29",
      "class_id": "ecole_cl29",
      "count": 3,
      "status": "active",
      "shipNames": [
        "Émile Bertin",
        "La Galissonnière",
        "Jean de Vienne"
      ]
    },
    {
      "id": "program-ecole_cl29-detached",
      "class_id": "ecole_cl29",
      "count": 3,
      "status": "active",
      "port": "brest",
      "shipNames": [
        "Marseillaise",
        "Gloire",
        "Montcalm"
      ]
    },
    {
      "id": "program-ecole_cv31",
      "class_id": "ecole_cv31",
      "count": 1,
      "status": "active",
      "shipNames": [
        "Joffre"
      ],
      "name": "Joffre"
    },
    {
      "id": "program-ecole_cv31-detached",
      "class_id": "ecole_cv31",
      "count": 1,
      "status": "active",
      "port": "brest",
      "shipNames": [
        "Painlevé"
      ],
      "name": "Painlevé"
    },
    {
      "id": "legacy-fra-duguay",
      "class_id": "duguay_trouin",
      "count": 3,
      "status": "active",
      "legacy": true,
      "shipNames": [
        "Duguay-Trouin",
        "Lamotte-Picquet",
        "Primauguet"
      ]
    },
    {
      "id": "legacy-fra-chacal",
      "class_id": "chacal",
      "count": 6,
      "status": "active",
      "legacy": true,
      "shipNames": [
        "Chacal",
        "Jaguar",
        "Léopard",
        "Lynx",
        "Panthère",
        "Tigre"
      ]
    },
    {
      "id": "legacy-fra-requin",
      "class_id": "requin",
      "count": 9,
      "status": "active",
      "legacy": true,
      "shipNames": [
        "Requin",
        "Souffleur",
        "Morse",
        "Narval",
        "Marsouin",
        "Dauphin",
        "Caïman",
        "Phoque",
        "Espadon"
      ]
    }
  ],
  "designs": [
    "ecole_ss28",
    "ecole_dd30",
    "ecole_cl29",
    "ecole_cv31",
    "ecole_ss37",
    "fra_program_oiler",
    "fr_depot_1922",
    "fr_oiler_1922",
    "fr_depot_1932",
    "fr_oiler_1932",
    "fr_depot_1942",
    "fr_oiler_1942"
  ],
  "support": [
    {
      "id": "support-FRA",
      "class_id": "fra_program_oiler",
      "count": 4,
      "status": "active"
    }
  ],
  "merchants": {
    "hulls": 1382,
    "grossRegisterTons": 2989386,
    "referenceYear": 1935,
    "scope": "Powered merchant ships of at least 100 GRT; USA excludes Great Lakes; United Kingdom excludes Dominions.",
    "note": ""
  },
  "shipNamePools": {
    "ecole_ss28": [
      "Surcouf",
      "Redoutable",
      "Vengeur",
      "Pascal",
      "Pasteur",
      "Henri Poincaré",
      "Poncelet",
      "Archimède",
      "Fresnel",
      "Monge",
      "Ampère",
      "Achille",
      "Ajax",
      "Actéon",
      "Achéron",
      "Argo",
      "Protée",
      "Persée",
      "Pégase",
      "Prométhée",
      "L Espoir",
      "Le Glorieux",
      "Le Héros",
      "Le Centaure",
      "Le Conquérant",
      "Le Tonnant",
      "Agosta",
      "Bévéziers",
      "Ouessant",
      "Sidi-Ferruch",
      "Sfax",
      "Casabianca",
      "Rubis",
      "Saphir",
      "Nautilus",
      "Perle"
    ],
    "ecole_dd30": [
      "Bourrasque",
      "Cyclone",
      "Mistral",
      "Orage",
      "Ouragan",
      "Simoun",
      "Siroco",
      "Tempête",
      "Tornade",
      "Tramontane",
      "Trombe",
      "Typhon",
      "L Adroit",
      "L Alcyon",
      "Le Basque",
      "Le Boulonnais",
      "Le Brestois",
      "Le Bordelais",
      "Le Forbin",
      "Le Fougueux",
      "Le Frondeur",
      "Le Mars",
      "La Palme",
      "Le Railleur",
      "Le Fortuné",
      "Le Foudroyant",
      "Le Hardi",
      "L Épée",
      "Le Fleuret",
      "Le Corsaire",
      "Le Flibustier",
      "Le Téméraire"
    ],
    "ecole_cl29": [
      "Émile Bertin",
      "La Galissonnière",
      "Jean de Vienne",
      "Marseillaise",
      "Gloire",
      "Montcalm"
    ],
    "ecole_cv31": [
      "Joffre",
      "Painlevé"
    ],
    "duguay_trouin": [
      "Duguay-Trouin",
      "Lamotte-Picquet",
      "Primauguet"
    ],
    "chacal": [
      "Chacal",
      "Jaguar",
      "Léopard",
      "Lynx",
      "Panthère",
      "Tigre"
    ],
    "requin": [
      "Requin",
      "Souffleur",
      "Morse",
      "Narval",
      "Marsouin",
      "Dauphin",
      "Caïman",
      "Phoque",
      "Espadon"
    ]
  },
  "economy": {
    "yardYear": 65000,
    "crew": 30000,
    "crewYear": 1500,
    "aircraftYear": 650,
    "aviatorsYear": 300,
    "gdp": 61750,
    "gtp": 33250,
    "strategicModifier": 0.35,
    "productUnit": "kg fine-gold equivalent per year"
  },
  "starting": {
    "gold": 27500,
    "influence": 70,
    "industry": 20000,
    "training": 65,
    "morale": 75,
    "level": 5,
    "funding": 0.5,
    "bases": [
      "mediterranean"
    ],
    "strategic": 988
  },
  "procurement": {
    "industryFactor": 1,
    "customIndustryFactor": 1
  }
}
```
