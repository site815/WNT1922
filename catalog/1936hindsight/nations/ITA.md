# Italy — opening navy and economy

Edit the JSON block directly. This document is read by the game; no export is required.

```json game-data
{
  "title": "Mare Nostrum",
  "description": "Fast surface forces, concentrated torpedo aviation and strong logistics for Mediterranean sea control.",
  "nation": "ITA",
  "hulls": [
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
    }
  ],
  "aggregates": [
    {
      "id": "program-mare_bb29",
      "class_id": "mare_bb29",
      "count": 2,
      "status": "active",
      "shipNames": [
        "Vittorio Veneto",
        "Littorio"
      ]
    },
    {
      "id": "program-mare_ca30",
      "class_id": "mare_ca30",
      "count": 4,
      "status": "active",
      "shipNames": [
        "Zara",
        "Fiume",
        "Gorizia",
        "Pola"
      ]
    },
    {
      "id": "program-mare_dd31",
      "class_id": "mare_dd31",
      "count": 28,
      "status": "active",
      "shipNames": [
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
      ]
    },
    {
      "id": "program-mare_cv32",
      "class_id": "mare_cv32",
      "count": 1,
      "status": "active",
      "shipNames": [
        "Aquila"
      ],
      "name": "Aquila"
    },
    {
      "id": "program-mare_ss28",
      "class_id": "mare_ss28",
      "count": 24,
      "status": "active",
      "shipNames": [
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
      ]
    },
    {
      "id": "legacy-ita-leone",
      "class_id": "leone",
      "count": 3,
      "status": "active",
      "legacy": true,
      "shipNames": [
        "Leone",
        "Pantera",
        "Tigre"
      ]
    },
    {
      "id": "legacy-ita-palestro",
      "class_id": "palestro",
      "count": 4,
      "status": "active",
      "legacy": true,
      "shipNames": [
        "Palestro",
        "Confienza",
        "San Martino",
        "Solferino"
      ]
    },
    {
      "id": "legacy-ita-curtatone",
      "class_id": "curtatone",
      "count": 4,
      "status": "active",
      "legacy": true,
      "shipNames": [
        "Curtatone",
        "Calatafimi",
        "Castelfidardo",
        "Monzambano"
      ]
    }
  ],
  "designs": [
    "mare_bb29",
    "mare_ca30",
    "mare_dd31",
    "mare_cv32",
    "mare_ss28",
    "mare_bb38",
    "ita_program_oiler",
    "it_depot_1922",
    "it_oiler_1922",
    "it_depot_1932",
    "it_oiler_1932",
    "it_depot_1942",
    "it_oiler_1942"
  ],
  "support": [
    {
      "id": "support-ITA",
      "class_id": "ita_program_oiler",
      "count": 4,
      "status": "active"
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
    "crew": 28000,
    "crewYear": 1400,
    "aircraftYear": 600,
    "aviatorsYear": 280,
    "gdp": 55200,
    "gtp": 36800,
    "strategicModifier": 0.1,
    "productUnit": "kg fine-gold equivalent per year"
  },
  "starting": {
    "gold": 24000,
    "influence": 70,
    "industry": 22000,
    "training": 65,
    "morale": 75,
    "level": 5,
    "funding": 0.5,
    "bases": [
      "mediterranean"
    ],
    "strategic": 751
  },
  "procurement": {
    "industryFactor": 1,
    "customIndustryFactor": 1
  }
}
```
