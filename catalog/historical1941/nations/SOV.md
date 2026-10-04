# Soviet Navy — 1941 historical opening

Authored opening data. Read directly by the game; no export step is required.

```json game-data
{
  "name": "Soviet Union",
  "navy": "Workers and Peasants Red Fleet",
  "color": "#8b1739",
  "home": "atlantic",
  "rival": "DEU",
  "title": "Soviet Navy",
  "description": "Historical 1941 opening. Named capital ships and carriers with date-specific availability; escort groups, resources and shore aircraft are explicitly representative game estimates.",
  "nation": "SOV",
  "hulls": [
    {
      "id": "hist-oktyabrskaya-revolyutsiya",
      "name": "Oktyabrskaya Revolyutsiya",
      "class_id": "sevastopol_1914",
      "status": "active",
      "port": "leningrad",
      "legacy": true
    },
    {
      "id": "hist-marat",
      "name": "Marat",
      "class_id": "sevastopol_1914",
      "status": "repair",
      "port": "leningrad",
      "legacy": true,
      "health": 0.25,
      "notes": "September 1941 bombing damage; surviving artillery role is approximated by a severely damaged repair hull."
    },
    {
      "id": "hist-parizhskaya-kommuna",
      "name": "Parizhskaya Kommuna",
      "class_id": "sevastopol_1914",
      "status": "active",
      "port": "sevastopol",
      "legacy": true
    },
    {
      "id": "hist-kirov",
      "name": "Kirov",
      "class_id": "hist-kirov",
      "status": "active",
      "port": "leningrad",
      "legacy": true
    },
    {
      "id": "hist-maxim-gorky",
      "name": "Maxim Gorky",
      "class_id": "hist-kirov",
      "status": "active",
      "port": "leningrad",
      "legacy": true
    },
    {
      "id": "hist-voroshilov",
      "name": "Voroshilov",
      "class_id": "hist-kirov",
      "status": "active",
      "port": "sevastopol",
      "legacy": true
    },
    {
      "id": "hist-molotov",
      "name": "Molotov",
      "class_id": "hist-kirov",
      "status": "active",
      "port": "sevastopol",
      "legacy": true
    }
  ],
  "aggregates": [
    {
      "id": "hist-group-svetlana_1913",
      "class_id": "svetlana_1913",
      "count": 3,
      "status": "active",
      "port": "leningrad",
      "name": "Svetlana class groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-hist-gnevny",
      "class_id": "hist-gnevny",
      "count": 25,
      "status": "active",
      "port": "leningrad",
      "name": "Gnevny / Project 7 destroyer fit groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-novik_series",
      "class_id": "novik_series",
      "count": 12,
      "status": "active",
      "port": "leningrad",
      "name": "Novik type destroyer groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-hist-shchuka",
      "class_id": "hist-shchuka",
      "count": 65,
      "status": "active",
      "port": "leningrad",
      "name": "Shchuka submarine fit groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    }
  ],
  "designs": [
    "sevastopol_1914",
    "hist-kirov",
    "svetlana_1913",
    "hist-gnevny",
    "novik_series",
    "hist-shchuka",
    "su_support_1932",
    "su_support_1922",
    "su_support_1942"
  ],
  "support": [
    {
      "id": "hist-support-SOV",
      "class_id": "su_support_1932",
      "count": 8,
      "status": "active",
      "port": "leningrad",
      "representative": true,
      "notes": "Abstract fleet auxiliaries, not a named historical auxiliary roster."
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
    "productUnit": "kg fine-gold equivalent per year",
    "balanceNote": "Provisional ministry production baseline, with authored wartime adjustments; not a reconstruction of national GDP or historical naval appropriations."
  },
  "starting": {
    "gold": 39000,
    "influence": 70,
    "industry": 50000,
    "training": 70,
    "morale": 70,
    "level": 4,
    "funding": 0.5,
    "bases": [
      "atlantic"
    ],
    "strategic": 3144
  },
  "procurement": {
    "industryFactor": 1,
    "customIndustryFactor": 1
  },
  "names": {},
  "openingAccuracy": "Named major combatants are date-specific. Escort counts, stores, crew pool, budgets and initial station assignments are gameplay estimates; no claim of a complete order of battle or exact daily disposition. Procurement doctrine weights are provisional game preferences, not reconstructed historical appropriations.",
  "ai": {
    "roles": {
      "DD": 32,
      "CL": 16,
      "CA": 0,
      "BB": 14,
      "CV": 0,
      "SS": 38
    },
    "cruiserSiege": false
  }
}
```
