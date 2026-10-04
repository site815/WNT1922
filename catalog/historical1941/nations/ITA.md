# Regia Marina — 1941 historical opening

Authored opening data. Read directly by the game; no export step is required.

```json game-data
{
  "name": "Italy",
  "navy": "Regia Marina",
  "color": "#73bb86",
  "home": "mediterranean",
  "rival": "FRA",
  "title": "Regia Marina",
  "description": "Historical 1941 opening. Named capital ships and carriers with date-specific availability; escort groups, resources and shore aircraft are explicitly representative game estimates.",
  "nation": "ITA",
  "hulls": [
    {
      "id": "hist-giulio-cesare",
      "name": "Giulio Cesare",
      "class_id": "conte_di_cavour",
      "status": "active",
      "port": "taranto",
      "legacy": true
    },
    {
      "id": "hist-conte-di-cavour",
      "name": "Conte di Cavour",
      "class_id": "conte_di_cavour",
      "status": "repair",
      "port": "taranto",
      "legacy": true,
      "health": 0.35,
      "notes": "Taranto damage; repair status, not counted as a ready battleship."
    },
    {
      "id": "hist-andrea-doria",
      "name": "Andrea Doria",
      "class_id": "andrea_doria",
      "status": "active",
      "port": "la_spezia",
      "legacy": true,
      "health": 1
    },
    {
      "id": "hist-caio-duilio",
      "name": "Caio Duilio",
      "class_id": "andrea_doria",
      "status": "active",
      "port": "la_spezia",
      "legacy": true,
      "health": 1
    },
    {
      "id": "hist-littorio",
      "name": "Littorio",
      "class_id": "hist-littorio",
      "status": "active",
      "port": "taranto",
      "legacy": true,
      "pct_complete": 70
    },
    {
      "id": "hist-vittorio-veneto",
      "name": "Vittorio Veneto",
      "class_id": "hist-littorio",
      "status": "active",
      "port": "taranto",
      "legacy": true,
      "pct_complete": 70
    },
    {
      "id": "hist-roma",
      "name": "Roma",
      "class_id": "hist-littorio",
      "status": "building",
      "port": "la_spezia",
      "legacy": true,
      "pct_complete": 65
    },
    {
      "id": "hist-impero",
      "name": "Impero",
      "class_id": "hist-littorio",
      "status": "building",
      "port": "la_spezia",
      "legacy": true,
      "pct_complete": 65
    }
  ],
  "aggregates": [
    {
      "id": "hist-group-hist-zara",
      "class_id": "hist-zara",
      "count": 4,
      "status": "active",
      "port": "taranto",
      "name": "Zara / Trento cruiser fit groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-hist-condottieri",
      "class_id": "hist-condottieri",
      "count": 10,
      "status": "active",
      "port": "taranto",
      "name": "Condottieri cruiser fit groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-hist-soldati",
      "class_id": "hist-soldati",
      "count": 30,
      "status": "active",
      "port": "taranto",
      "name": "Soldati / fleet destroyer fit groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-palestro",
      "class_id": "palestro",
      "count": 9,
      "status": "active",
      "port": "taranto",
      "name": "Palestro class groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-hist-marcello",
      "class_id": "hist-marcello",
      "count": 50,
      "status": "active",
      "port": "taranto",
      "name": "Marcello / ocean submarine fit groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    },
    {
      "id": "hist-group-provana",
      "class_id": "provana",
      "count": 12,
      "status": "active",
      "port": "taranto",
      "name": "Provana class groups",
      "representative": true,
      "notes": "Selected representative escort/submarine inventory and common fit, not an exact commissioned-hull census. Ships within each aggregate share one fit."
    }
  ],
  "designs": [
    "conte_di_cavour",
    "andrea_doria",
    "hist-littorio",
    "hist-zara",
    "hist-condottieri",
    "hist-soldati",
    "palestro",
    "hist-marcello",
    "provana",
    "it_support_1932",
    "it_support_1922",
    "it_support_1942"
  ],
  "support": [
    {
      "id": "hist-support-ITA",
      "class_id": "it_support_1932",
      "count": 8,
      "status": "active",
      "port": "taranto",
      "representative": true,
      "notes": "Abstract fleet auxiliaries, not a named historical auxiliary roster."
    }
  ],
  "merchants": {
    "hulls": 1041,
    "grossRegisterTons": 2838354,
    "referenceYear": 1935,
    "scope": "Powered merchant ships of at least 100 GRT; USA excludes Great Lakes; United Kingdom excludes Dominions.",
    "note": ""
  },
  "shipNamePools": {
    "mare_bb29": [
      "Vittorio Veneto",
      "Littorio"
    ],
    "mare_ca30": [
      "Zara",
      "Fiume",
      "Gorizia",
      "Pola"
    ],
    "mare_dd31": [
      "Alfredo Oriani",
      "Giosuè Carducci",
      "Vincenzo Gioberti",
      "Vittorio Alfieri",
      "Freccia",
      "Dardo",
      "Saetta",
      "Strale",
      "Folgore",
      "Fulmine",
      "Lampo",
      "Baleno",
      "Maestrale",
      "Grecale",
      "Libeccio",
      "Scirocco",
      "Artigliere",
      "Aviere",
      "Bersagliere",
      "Camicia Nera",
      "Carabiniere",
      "Corazziere",
      "Fuciliere",
      "Geniere",
      "Granatiere",
      "Lanciere",
      "Ascari",
      "Alpino"
    ],
    "mare_cv32": [
      "Aquila"
    ],
    "mare_ss28": [
      "Balilla",
      "Domenico Millelire",
      "Enrico Toti",
      "Antonio Sciesa",
      "Ettore Fieramosca",
      "Pietro Micca",
      "Calvi",
      "Finzi",
      "Tazzoli",
      "Argo",
      "Velella",
      "Glauco",
      "Otaria",
      "Archimede",
      "Torricelli",
      "Ferraris",
      "Galilei",
      "Brin",
      "Galvani",
      "Guglielmotti",
      "Marconi",
      "Da Vinci",
      "Bianchi",
      "Torelli"
    ],
    "leone": [
      "Leone",
      "Pantera",
      "Tigre"
    ],
    "palestro": [
      "Palestro",
      "Confienza",
      "San Martino",
      "Solferino"
    ],
    "curtatone": [
      "Curtatone",
      "Calatafimi",
      "Castelfidardo",
      "Monzambano"
    ]
  },
  "economy": {
    "yardYear": 65000,
    "crew": 32214,
    "crewYear": 1400,
    "aircraftYear": 600,
    "aviatorsYear": 280,
    "gdp": 55200,
    "gtp": 36800,
    "strategicModifier": 0.1,
    "productUnit": "kg fine-gold equivalent per year",
    "balanceNote": "Provisional ministry production baseline, with authored wartime adjustments; not a reconstruction of national GDP or historical naval appropriations."
  },
  "starting": {
    "gold": 24000,
    "influence": 70,
    "industry": 22000,
    "training": 70,
    "morale": 70,
    "level": 4,
    "funding": 0.5,
    "bases": [
      "mediterranean"
    ],
    "strategic": 751
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
      "CL": 15,
      "CA": 12,
      "BB": 24,
      "CV": 0,
      "SS": 17
    },
    "cruiserSiege": false
  }
}
```
