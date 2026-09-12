# Shared ship classes

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
{
  "queen_elizabeth": {
    "id": "queen_elizabeth",
    "nation": "GBR",
    "name": "Queen Elizabeth class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 27500,
    "cost": 13200,
    "year": 1912,
    "durability": 2292,
    "speed": 24,
    "range": 9260,
    "shp": 75000,
    "caliber": 381,
    "barrels": 8,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 330,
    "deck": 76,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 950,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "queen_elizabeth",
      "name": "Queen Elizabeth class",
      "nation": "GBR",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 27500,
        "full_load_tons": 33000
      },
      "dimensions": {
        "length_m": 196.8,
        "beam_m": 27.6,
        "draft_m": 9.2
      },
      "propulsion": {
        "speed_kn": 24,
        "shp": 75000,
        "range_nm": 5000,
        "range_at_kn": 12,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 8,
          "caliber_in": 15,
          "mounts": "4x2"
        },
        "secondary_battery": [
          {
            "count": 14,
            "caliber_in": 6,
            "mounts": "casemate"
          }
        ],
        "torpedo_tubes": {
          "count": 4,
          "caliber_in": 21,
          "submerged": true
        }
      },
      "protection": {
        "belt_mm": 330,
        "deck_mm": 76,
        "turret_mm": 330,
        "ct_mm": 280,
        "torpedo_defense": 1
      },
      "complement": 950,
      "design_year": 1912,
      "notes": "First oil-fired fast battleship squadron; prime 1930s rebuild candidates."
    }
  },
  "revenge": {
    "id": "revenge",
    "nation": "GBR",
    "name": "Revenge class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 28000,
    "cost": 13440,
    "year": 1913,
    "durability": 2333,
    "speed": 23,
    "range": 9260,
    "shp": 40000,
    "caliber": 381,
    "barrels": 8,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 330,
    "deck": 51,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 940,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "revenge",
      "name": "Revenge class",
      "nation": "GBR",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 28000,
        "full_load_tons": 31000
      },
      "dimensions": {
        "length_m": 190.3,
        "beam_m": 27,
        "draft_m": 8.7
      },
      "propulsion": {
        "speed_kn": 23,
        "shp": 40000,
        "range_nm": 5000,
        "range_at_kn": 12,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 8,
          "caliber_in": 15,
          "mounts": "4x2"
        },
        "secondary_battery": [
          {
            "count": 14,
            "caliber_in": 6,
            "mounts": "casemate"
          }
        ],
        "torpedo_tubes": {
          "count": 4,
          "caliber_in": 21,
          "submerged": true
        }
      },
      "protection": {
        "belt_mm": 330,
        "deck_mm": 51,
        "turret_mm": 330,
        "ct_mm": 280,
        "torpedo_defense": 1
      },
      "complement": 940,
      "design_year": 1913,
      "notes": "Slower, cheaper QE derivative; poor modernization margin."
    }
  },
  "iron_duke": {
    "id": "iron_duke",
    "nation": "GBR",
    "name": "Iron Duke class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 25000,
    "cost": 12000,
    "year": 1911,
    "durability": 2083,
    "speed": 21.25,
    "range": 14445.6,
    "shp": 29000,
    "caliber": 342.9,
    "barrels": 10,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 305,
    "deck": 64,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 995,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "iron_duke",
      "name": "Iron Duke class",
      "nation": "GBR",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 25000,
        "full_load_tons": 29560
      },
      "dimensions": {
        "length_m": 189.8,
        "beam_m": 27.4,
        "draft_m": 9
      },
      "propulsion": {
        "speed_kn": 21.25,
        "shp": 29000,
        "range_nm": 7800,
        "range_at_kn": 10,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 10,
          "caliber_in": 13.5,
          "mounts": "5x2"
        },
        "secondary_battery": [
          {
            "count": 12,
            "caliber_in": 6,
            "mounts": "casemate"
          }
        ],
        "torpedo_tubes": {
          "count": 4,
          "caliber_in": 21,
          "submerged": true
        }
      },
      "protection": {
        "belt_mm": 305,
        "deck_mm": 64,
        "turret_mm": 279,
        "ct_mm": 279,
        "torpedo_defense": 1
      },
      "complement": 995,
      "design_year": 1911,
      "notes": "Coal/oil mixed firing — logistics penalty."
    }
  },
  "king_george_v_1911": {
    "id": "king_george_v_1911",
    "nation": "GBR",
    "name": "King George V class (1911)",
    "type": "BB",
    "category": "capital_ship",
    "tons": 23000,
    "cost": 11040,
    "year": 1910,
    "durability": 1917,
    "speed": 21,
    "range": 12463.960000000001,
    "shp": 31000,
    "caliber": 342.9,
    "barrels": 10,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 305,
    "deck": 51,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 860,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "king_george_v_1911",
      "name": "King George V class (1911)",
      "nation": "GBR",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 23000,
        "full_load_tons": 25700
      },
      "propulsion": {
        "speed_kn": 21,
        "shp": 31000,
        "range_nm": 6730,
        "range_at_kn": 10,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 10,
          "caliber_in": 13.5,
          "mounts": "5x2"
        },
        "secondary_battery": [
          {
            "count": 16,
            "caliber_in": 4,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 305,
        "deck_mm": 51,
        "turret_mm": 279,
        "ct_mm": 279,
        "torpedo_defense": 0
      },
      "complement": 860,
      "design_year": 1910,
      "notes": "Treaty: scrapped when Nelson class completes."
    }
  },
  "orion": {
    "id": "orion",
    "nation": "GBR",
    "name": "Orion class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 22200,
    "cost": 10656,
    "year": 1908,
    "durability": 1850,
    "speed": 21,
    "range": 12463.960000000001,
    "shp": 27000,
    "caliber": 342.9,
    "barrels": 10,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 305,
    "deck": 45,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 750,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "orion",
      "name": "Orion class",
      "nation": "GBR",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 22200,
        "full_load_tons": 25870
      },
      "propulsion": {
        "speed_kn": 21,
        "shp": 27000,
        "range_nm": 6730,
        "range_at_kn": 10,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 10,
          "caliber_in": 13.5,
          "mounts": "5x2"
        },
        "secondary_battery": [
          {
            "count": 16,
            "caliber_in": 4,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 305,
        "deck_mm": 45,
        "turret_mm": 279,
        "ct_mm": 279,
        "torpedo_defense": 0
      },
      "complement": 750,
      "design_year": 1908,
      "notes": "Only Thunderer retained (training); sisters disposed 1922."
    }
  },
  "tiger": {
    "id": "tiger",
    "nation": "GBR",
    "name": "Tiger",
    "type": "BC",
    "category": "capital_ship",
    "tons": 28500,
    "cost": 13680,
    "year": 1911,
    "durability": 2375,
    "speed": 29,
    "range": 8611.800000000001,
    "shp": 108000,
    "caliber": 342.9,
    "barrels": 8,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 229,
    "deck": 76,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1121,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "tiger",
      "name": "Tiger",
      "nation": "GBR",
      "type": "BC",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 28500,
        "full_load_tons": 33260
      },
      "propulsion": {
        "speed_kn": 29,
        "shp": 108000,
        "range_nm": 4650,
        "range_at_kn": 12,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 8,
          "caliber_in": 13.5,
          "mounts": "4x2"
        },
        "secondary_battery": [
          {
            "count": 12,
            "caliber_in": 6,
            "mounts": "casemate"
          }
        ],
        "torpedo_tubes": {
          "count": 4,
          "caliber_in": 21,
          "submerged": true
        }
      },
      "protection": {
        "belt_mm": 229,
        "deck_mm": 76,
        "turret_mm": 229,
        "ct_mm": 254,
        "torpedo_defense": 1
      },
      "complement": 1121,
      "design_year": 1911,
      "notes": "Last coal-burning British battlecruiser."
    }
  },
  "nelson": {
    "id": "nelson",
    "nation": "GBR",
    "name": "Nelson class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 33950,
    "cost": 16296,
    "year": 1922,
    "durability": 2829,
    "speed": 23,
    "range": 12964,
    "shp": 45000,
    "caliber": 406.4,
    "barrels": 9,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 356,
    "deck": 159,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1361,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "nelson",
      "name": "Nelson class",
      "nation": "GBR",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 33950,
        "full_load_tons": 38000
      },
      "propulsion": {
        "speed_kn": 23,
        "shp": 45000,
        "range_nm": 7000,
        "range_at_kn": 16,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 9,
          "caliber_in": 16,
          "mounts": "3x3",
          "notes": "All forward"
        },
        "secondary_battery": [
          {
            "count": 12,
            "caliber_in": 6,
            "mounts": "6x2"
          }
        ]
      },
      "protection": {
        "belt_mm": 356,
        "deck_mm": 159,
        "turret_mm": 406,
        "ct_mm": 356,
        "torpedo_defense": 3
      },
      "complement": 1361,
      "design_year": 1922,
      "notes": "Treaty exception: UK allowed two new 16in ships. Laid down Dec 1922."
    }
  },
  "g3": {
    "id": "g3",
    "nation": "GBR",
    "name": "G3 battlecruiser (canceled)",
    "type": "BC",
    "category": "capital_ship",
    "tons": 48400,
    "cost": 23232,
    "year": 1921,
    "durability": 4033,
    "speed": 32,
    "range": 12964,
    "shp": 160000,
    "caliber": 406.4,
    "barrels": 9,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 356,
    "deck": 203,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1716,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "g3",
      "name": "G3 battlecruiser (canceled)",
      "nation": "GBR",
      "type": "BC",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "displacement": {
        "standard_tons": 48400,
        "full_load_tons": 53909
      },
      "propulsion": {
        "speed_kn": 32,
        "shp": 160000,
        "range_nm": 7000,
        "range_at_kn": 16,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 9,
          "caliber_in": 16,
          "mounts": "3x3"
        },
        "secondary_battery": [
          {
            "count": 16,
            "caliber_in": 6,
            "mounts": "8x2"
          }
        ]
      },
      "protection": {
        "belt_mm": 356,
        "deck_mm": 203,
        "turret_mm": 432,
        "ct_mm": 356,
        "torpedo_defense": 3
      },
      "complement": 1716,
      "design_year": 1921,
      "notes": "Ordered Oct 1921, suspended for the treaty, canceled Feb 1922. The alt-history build if Washington collapses."
    }
  },
  "argus": {
    "id": "argus",
    "nation": "GBR",
    "name": "Argus",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 14450,
    "cost": 6936,
    "year": 1917,
    "durability": 1204,
    "speed": 20,
    "range": 6667.200000000001,
    "shp": 20000,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 18,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 495,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "argus",
      "name": "Argus",
      "nation": "GBR",
      "type": "CV",
      "treaty_category": "aircraft_carrier",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 14450,
        "full_load_tons": 16500
      },
      "propulsion": {
        "speed_kn": 20,
        "shp": 20000,
        "range_nm": 3600,
        "range_at_kn": 10,
        "fuel": "oil"
      },
      "aviation": {
        "aircraft_capacity": 18,
        "flight_deck": true
      },
      "complement": 495,
      "design_year": 1917,
      "notes": "World's first flush-deck carrier (liner conversion)."
    }
  },
  "eagle": {
    "id": "eagle",
    "nation": "GBR",
    "name": "Eagle",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 22600,
    "cost": 10848,
    "year": 1918,
    "durability": 1883,
    "speed": 24,
    "range": 8889.6,
    "shp": 50000,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 114,
    "deck": 0,
    "air": 21,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 950,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "eagle",
      "name": "Eagle",
      "nation": "GBR",
      "type": "CV",
      "treaty_category": "aircraft_carrier",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 22600,
        "full_load_tons": 26800
      },
      "propulsion": {
        "speed_kn": 24,
        "shp": 50000,
        "range_nm": 4800,
        "range_at_kn": 16,
        "fuel": "oil"
      },
      "armament": {
        "secondary_battery": [
          {
            "count": 9,
            "caliber_in": 6,
            "mounts": "single"
          }
        ]
      },
      "protection": {
        "belt_mm": 114
      },
      "aviation": {
        "aircraft_capacity": 21,
        "flight_deck": true
      },
      "complement": 950,
      "design_year": 1918,
      "notes": "Converted from Chilean battleship Almirante Cochrane."
    }
  },
  "hermes": {
    "id": "hermes",
    "nation": "GBR",
    "name": "Hermes",
    "type": "CVL",
    "category": "aircraft_carrier",
    "tons": 10850,
    "cost": 5208,
    "year": 1918,
    "durability": 904,
    "speed": 25,
    "range": 8296.960000000001,
    "shp": 40000,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 20,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 660,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "hermes",
      "name": "Hermes",
      "nation": "GBR",
      "type": "CVL",
      "treaty_category": "aircraft_carrier",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 10850,
        "full_load_tons": 13200
      },
      "propulsion": {
        "speed_kn": 25,
        "shp": 40000,
        "range_nm": 4480,
        "range_at_kn": 10,
        "fuel": "oil"
      },
      "armament": {
        "secondary_battery": [
          {
            "count": 6,
            "caliber_in": 5.5,
            "mounts": "single"
          }
        ]
      },
      "aviation": {
        "aircraft_capacity": 20,
        "flight_deck": true
      },
      "complement": 660,
      "design_year": 1918,
      "notes": "First carrier designed as such from the keel."
    }
  },
  "hawkins": {
    "id": "hawkins",
    "nation": "GBR",
    "name": "Hawkins class",
    "type": "CA",
    "category": "auxiliary_combatant",
    "tons": 9750,
    "cost": 4680,
    "year": 1915,
    "durability": 813,
    "speed": 30,
    "range": 10000.800000000001,
    "shp": 60000,
    "caliber": 190.5,
    "barrels": 7,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 76,
    "deck": 38,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 712,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "hawkins",
      "name": "Hawkins class",
      "nation": "GBR",
      "type": "CA",
      "treaty_category": "auxiliary_combatant",
      "generation": "scout_cruiser",
      "displacement": {
        "standard_tons": 9750,
        "full_load_tons": 12190
      },
      "propulsion": {
        "speed_kn": 30,
        "shp": 60000,
        "range_nm": 5400,
        "range_at_kn": 14,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 7,
          "caliber_in": 7.5,
          "mounts": "single"
        }
      },
      "protection": {
        "belt_mm": 76,
        "deck_mm": 38
      },
      "complement": 712,
      "design_year": 1915,
      "hulls_aggregate": {
        "count": 5,
        "status": "mixed",
        "notes": "Hawkins, Raleigh active; Frobisher, Effingham completing; Vindictive as carrier-hybrid. Template for the treaty 10,000t/8in cruiser limit."
      },
      "notes": "The class the treaty cruiser rules were written around."
    }
  },
  "c_class_cl": {
    "id": "c_class_cl",
    "nation": "GBR",
    "name": "C class (Caledon/Ceres/Carlisle groups)",
    "type": "CL",
    "category": "auxiliary_combatant",
    "tons": 4290,
    "cost": 2059,
    "year": 1916,
    "durability": 358,
    "speed": 29,
    "range": 10926.800000000001,
    "shp": 40000,
    "caliber": 152.39999999999998,
    "barrels": 5,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 76,
    "deck": 25,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 430,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "c_class_cl",
      "name": "C class (Caledon/Ceres/Carlisle groups)",
      "nation": "GBR",
      "type": "CL",
      "treaty_category": "auxiliary_combatant",
      "generation": "scout_cruiser",
      "displacement": {
        "standard_tons": 4290,
        "full_load_tons": 5250
      },
      "propulsion": {
        "speed_kn": 29,
        "shp": 40000,
        "range_nm": 5900,
        "range_at_kn": 10,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 5,
          "caliber_in": 6,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 8,
          "caliber_in": 21,
          "submerged": false
        }
      },
      "protection": {
        "belt_mm": 76,
        "deck_mm": 25
      },
      "complement": 430,
      "design_year": 1916,
      "hulls_aggregate": {
        "count": 23,
        "status": "mixed",
        "notes": "Approximate count of post-1916 groups in service/reserve; future CLAA conversion stock."
      }
    }
  },
  "danae": {
    "id": "danae",
    "nation": "GBR",
    "name": "Danae (D) class",
    "type": "CL",
    "category": "auxiliary_combatant",
    "tons": 4850,
    "cost": 2328,
    "year": 1916,
    "durability": 404,
    "speed": 29,
    "range": 12408.400000000001,
    "shp": 40000,
    "caliber": 152.39999999999998,
    "barrels": 6,
    "tubes": 12,
    "torpedoRange": 8,
    "belt": 76,
    "deck": 25,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 469,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "danae",
      "name": "Danae (D) class",
      "nation": "GBR",
      "type": "CL",
      "treaty_category": "auxiliary_combatant",
      "generation": "scout_cruiser",
      "displacement": {
        "standard_tons": 4850,
        "full_load_tons": 5870
      },
      "propulsion": {
        "speed_kn": 29,
        "shp": 40000,
        "range_nm": 6700,
        "range_at_kn": 10,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 6,
          "caliber_in": 6,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 12,
          "caliber_in": 21,
          "submerged": false
        }
      },
      "protection": {
        "belt_mm": 76,
        "deck_mm": 25
      },
      "complement": 469,
      "design_year": 1916,
      "hulls_aggregate": {
        "count": 8,
        "status": "active"
      }
    }
  },
  "emerald": {
    "id": "emerald",
    "nation": "GBR",
    "name": "Emerald (E) class",
    "type": "CL",
    "category": "auxiliary_combatant",
    "tons": 7550,
    "cost": 3624,
    "year": 1918,
    "durability": 629,
    "speed": 33,
    "range": 14816,
    "shp": 80000,
    "caliber": 152.39999999999998,
    "barrels": 7,
    "tubes": 12,
    "torpedoRange": 8,
    "belt": 76,
    "deck": 25,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 572,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "emerald",
      "name": "Emerald (E) class",
      "nation": "GBR",
      "type": "CL",
      "treaty_category": "auxiliary_combatant",
      "generation": "scout_cruiser",
      "displacement": {
        "standard_tons": 7550,
        "full_load_tons": 9435
      },
      "propulsion": {
        "speed_kn": 33,
        "shp": 80000,
        "range_nm": 8000,
        "range_at_kn": 15,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 7,
          "caliber_in": 6,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 12,
          "caliber_in": 21,
          "submerged": false
        }
      },
      "protection": {
        "belt_mm": 76,
        "deck_mm": 25
      },
      "complement": 572,
      "design_year": 1918,
      "hulls_aggregate": {
        "count": 2,
        "status": "building",
        "notes": "Emerald, Enterprise — completed 1926."
      }
    }
  },
  "v_w": {
    "id": "v_w",
    "nation": "GBR",
    "name": "V & W class",
    "type": "DD",
    "category": "auxiliary_combatant",
    "tons": 1100,
    "cost": 528,
    "year": 1916,
    "durability": 92,
    "speed": 34,
    "range": 6482,
    "shp": 27000,
    "caliber": 101.6,
    "barrels": 4,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 110,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "v_w",
      "name": "V & W class",
      "nation": "GBR",
      "type": "DD",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 1100,
        "full_load_tons": 1490
      },
      "propulsion": {
        "speed_kn": 34,
        "shp": 27000,
        "range_nm": 3500,
        "range_at_kn": 15,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 4,
          "caliber_in": 4,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 6,
          "caliber_in": 21,
          "submerged": false
        }
      },
      "complement": 110,
      "design_year": 1916,
      "hulls_aggregate": {
        "count": 58,
        "status": "mixed",
        "notes": "The interwar destroyer benchmark."
      }
    }
  },
  "s_class_dd_rn": {
    "id": "s_class_dd_rn",
    "nation": "GBR",
    "name": "S class",
    "type": "DD",
    "category": "auxiliary_combatant",
    "tons": 1075,
    "cost": 516,
    "year": 1917,
    "durability": 90,
    "speed": 36,
    "range": 5093,
    "shp": 27000,
    "caliber": 101.6,
    "barrels": 3,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 90,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "s_class_dd_rn",
      "name": "S class",
      "nation": "GBR",
      "type": "DD",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 1075,
        "full_load_tons": 1220
      },
      "propulsion": {
        "speed_kn": 36,
        "shp": 27000,
        "range_nm": 2750,
        "range_at_kn": 15,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 3,
          "caliber_in": 4,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 4,
          "caliber_in": 21,
          "submerged": false
        }
      },
      "complement": 90,
      "design_year": 1917,
      "hulls_aggregate": {
        "count": 60,
        "status": "mixed",
        "notes": "Large fraction in reserve; approximate count."
      }
    }
  },
  "scott_shakespeare": {
    "id": "scott_shakespeare",
    "nation": "GBR",
    "name": "Scott / Shakespeare flotilla leaders",
    "type": "DL",
    "category": "auxiliary_combatant",
    "tons": 1580,
    "cost": 758,
    "year": 1916,
    "durability": 132,
    "speed": 36,
    "range": 9260,
    "shp": 40000,
    "caliber": 119.38,
    "barrels": 5,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 164,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "scott_shakespeare",
      "name": "Scott / Shakespeare flotilla leaders",
      "nation": "GBR",
      "type": "DL",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 1580,
        "full_load_tons": 2050
      },
      "propulsion": {
        "speed_kn": 36,
        "shp": 40000,
        "range_nm": 5000,
        "range_at_kn": 15,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 5,
          "caliber_in": 4.7,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 6,
          "caliber_in": 21,
          "submerged": false
        }
      },
      "complement": 164,
      "design_year": 1916,
      "hulls_aggregate": {
        "count": 13,
        "status": "mixed"
      }
    }
  },
  "l_class_ss_rn": {
    "id": "l_class_ss_rn",
    "nation": "GBR",
    "name": "L class",
    "type": "SS",
    "category": "auxiliary_combatant",
    "tons": 890,
    "cost": 427,
    "year": 1916,
    "durability": 74,
    "speed": 17,
    "range": 7037.6,
    "shp": 0,
    "caliber": 101.6,
    "barrels": 1,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 35,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "l_class_ss_rn",
      "name": "L class",
      "nation": "GBR",
      "type": "SS",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 890,
        "full_load_tons": 1080
      },
      "propulsion": {
        "speed_kn": 17,
        "range_nm": 3800,
        "range_at_kn": 10,
        "fuel": "diesel"
      },
      "armament": {
        "main_battery": {
          "count": 1,
          "caliber_in": 4,
          "mounts": "deck"
        },
        "torpedo_tubes": {
          "count": 6,
          "caliber_in": 18,
          "submerged": true
        }
      },
      "complement": 35,
      "design_year": 1916,
      "hulls_aggregate": {
        "count": 27,
        "status": "mixed",
        "notes": "Approximate; postwar drawdown ongoing."
      }
    }
  },
  "m_class_ss_rn": {
    "id": "m_class_ss_rn",
    "nation": "GBR",
    "name": "M class (submarine monitor)",
    "type": "SM",
    "category": "auxiliary_combatant",
    "tons": 1600,
    "cost": 768,
    "year": 1916,
    "durability": 133,
    "speed": 15,
    "range": 7111.68,
    "shp": 0,
    "caliber": 304.79999999999995,
    "barrels": 1,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 65,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "m_class_ss_rn",
      "name": "M class (submarine monitor)",
      "nation": "GBR",
      "type": "SM",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 1600,
        "full_load_tons": 1950
      },
      "propulsion": {
        "speed_kn": 15,
        "range_nm": 3840,
        "range_at_kn": 10,
        "fuel": "diesel"
      },
      "armament": {
        "main_battery": {
          "count": 1,
          "caliber_in": 12,
          "mounts": "deck",
          "notes": "Submarine-mounted battleship gun"
        },
        "torpedo_tubes": {
          "count": 4,
          "caliber_in": 18,
          "submerged": true
        }
      },
      "complement": 65,
      "design_year": 1916,
      "hulls_aggregate": {
        "count": 3,
        "status": "mixed",
        "notes": "M2 later converted seaplane carrier, M3 minelayer."
      }
    }
  },
  "k_class_ss_rn": {
    "id": "k_class_ss_rn",
    "nation": "GBR",
    "name": "K class (steam submarine)",
    "type": "SS",
    "category": "auxiliary_combatant",
    "tons": 1980,
    "cost": 950,
    "year": 1915,
    "durability": 165,
    "speed": 24,
    "range": 5556,
    "shp": 10500,
    "caliber": 0,
    "barrels": 0,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 59,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "k_class_ss_rn",
      "name": "K class (steam submarine)",
      "nation": "GBR",
      "type": "SS",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 1980,
        "full_load_tons": 2566
      },
      "propulsion": {
        "speed_kn": 24,
        "shp": 10500,
        "range_nm": 3000,
        "range_at_kn": 13,
        "fuel": "oil"
      },
      "armament": {
        "torpedo_tubes": {
          "count": 8,
          "caliber_in": 18,
          "submerged": true
        }
      },
      "complement": 59,
      "design_year": 1915,
      "hulls_aggregate": {
        "count": 13,
        "status": "reserve",
        "notes": "Steam-powered fleet subs, accident-prone; being paid off."
      }
    }
  },
  "uk_depot_1922": {
    "id": "uk_depot_1922",
    "nation": "GBR",
    "name": "Fleet depot · 1922",
    "type": "AD",
    "category": "other",
    "tons": 5500,
    "cost": 3400,
    "year": 1922,
    "durability": 458,
    "speed": 14,
    "range": 16668,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 300,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "uk_depot_1922",
      "nation": "GBR",
      "name": "Fleet depot · 1922",
      "type": "AD",
      "design_year": 1922,
      "displacement": {
        "standard_tons": 5500,
        "full_load_tons": 8000
      },
      "propulsion": {
        "speed_kn": 14,
        "range_nm": 9000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 2
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 7.7,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 300,
      "cost_gold": 3400,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1931,
    "notes": "Provisional 1922 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "uk_oiler_1922": {
    "id": "uk_oiler_1922",
    "nation": "GBR",
    "name": "Fleet oiler · 1922",
    "type": "AO",
    "category": "other",
    "tons": 6500,
    "cost": 2800,
    "year": 1922,
    "durability": 542,
    "speed": 14,
    "range": 16668,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 160,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "uk_oiler_1922",
      "nation": "GBR",
      "name": "Fleet oiler · 1922",
      "type": "AO",
      "design_year": 1922,
      "displacement": {
        "standard_tons": 6500,
        "full_load_tons": 13500
      },
      "propulsion": {
        "speed_kn": 14,
        "range_nm": 9000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 2
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 7.7,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 160,
      "cost_gold": 2800,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1931,
    "notes": "Provisional 1922 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "delaware": {
    "id": "delaware",
    "nation": "USA",
    "name": "Delaware class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 20380,
    "cost": 9782,
    "year": 1906,
    "durability": 1698,
    "speed": 21,
    "range": 11112,
    "shp": 25000,
    "caliber": 304.79999999999995,
    "barrels": 10,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 280,
    "deck": 51,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 933,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "delaware",
      "name": "Delaware class",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "dreadnought",
      "displacement": {
        "standard_tons": 20380,
        "full_load_tons": 22060
      },
      "propulsion": {
        "speed_kn": 21,
        "shp": 25000,
        "range_nm": 6000,
        "range_at_kn": 10,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 10,
          "caliber_in": 12,
          "mounts": "5x2"
        },
        "secondary_battery": [
          {
            "count": 14,
            "caliber_in": 5,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 280,
        "deck_mm": 51,
        "turret_mm": 305,
        "torpedo_defense": 0
      },
      "complement": 933,
      "design_year": 1906,
      "notes": "Treaty: scrapped when Colorado and West Virginia complete."
    }
  },
  "florida": {
    "id": "florida",
    "nation": "USA",
    "name": "Florida class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 21825,
    "cost": 10476,
    "year": 1908,
    "durability": 1819,
    "speed": 20.75,
    "range": 10697.152,
    "shp": 28000,
    "caliber": 304.79999999999995,
    "barrels": 10,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 280,
    "deck": 51,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1001,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "florida",
      "name": "Florida class",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "dreadnought",
      "displacement": {
        "standard_tons": 21825,
        "full_load_tons": 23400
      },
      "propulsion": {
        "speed_kn": 20.75,
        "shp": 28000,
        "range_nm": 5776,
        "range_at_kn": 10,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 10,
          "caliber_in": 12,
          "mounts": "5x2"
        },
        "secondary_battery": [
          {
            "count": 16,
            "caliber_in": 5,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 280,
        "deck_mm": 51,
        "turret_mm": 305,
        "torpedo_defense": 0
      },
      "complement": 1001,
      "design_year": 1908
    }
  },
  "wyoming": {
    "id": "wyoming",
    "nation": "USA",
    "name": "Wyoming class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 26000,
    "cost": 12480,
    "year": 1909,
    "durability": 2167,
    "speed": 20.5,
    "range": 14816,
    "shp": 28000,
    "caliber": 304.79999999999995,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 280,
    "deck": 51,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1063,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "wyoming",
      "name": "Wyoming class",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "dreadnought",
      "displacement": {
        "standard_tons": 26000,
        "full_load_tons": 27680
      },
      "propulsion": {
        "speed_kn": 20.5,
        "shp": 28000,
        "range_nm": 8000,
        "range_at_kn": 10,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 12,
          "caliber_in": 12,
          "mounts": "6x2"
        },
        "secondary_battery": [
          {
            "count": 16,
            "caliber_in": 5,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 280,
        "deck_mm": 51,
        "turret_mm": 305,
        "torpedo_defense": 1
      },
      "complement": 1063,
      "design_year": 1909
    }
  },
  "new_york": {
    "id": "new_york",
    "nation": "USA",
    "name": "New York class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 27000,
    "cost": 12960,
    "year": 1910,
    "durability": 2250,
    "speed": 21,
    "range": 13075.12,
    "shp": 28100,
    "caliber": 355.59999999999997,
    "barrels": 10,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 305,
    "deck": 51,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1042,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "new_york",
      "name": "New York class",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 27000,
        "full_load_tons": 28820
      },
      "propulsion": {
        "speed_kn": 21,
        "shp": 28100,
        "range_nm": 7060,
        "range_at_kn": 10,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 10,
          "caliber_in": 14,
          "mounts": "5x2"
        },
        "secondary_battery": [
          {
            "count": 16,
            "caliber_in": 5,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 305,
        "deck_mm": 51,
        "turret_mm": 356,
        "torpedo_defense": 1
      },
      "complement": 1042,
      "design_year": 1910
    }
  },
  "nevada": {
    "id": "nevada",
    "nation": "USA",
    "name": "Nevada class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 27500,
    "cost": 13200,
    "year": 1911,
    "durability": 2292,
    "speed": 20.5,
    "range": 14816,
    "shp": 26500,
    "caliber": 355.59999999999997,
    "barrels": 10,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 343,
    "deck": 76,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 864,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "nevada",
      "name": "Nevada class",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 27500,
        "full_load_tons": 28900
      },
      "propulsion": {
        "speed_kn": 20.5,
        "shp": 26500,
        "range_nm": 8000,
        "range_at_kn": 10,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 10,
          "caliber_in": 14,
          "mounts": "2x3+2x2"
        },
        "secondary_battery": [
          {
            "count": 12,
            "caliber_in": 5,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 343,
        "deck_mm": 76,
        "turret_mm": 406,
        "torpedo_defense": 2
      },
      "complement": 864,
      "design_year": 1911,
      "notes": "First all-or-nothing armor scheme — the template every later US battleship follows."
    }
  },
  "pennsylvania": {
    "id": "pennsylvania",
    "nation": "USA",
    "name": "Pennsylvania class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 31400,
    "cost": 15072,
    "year": 1913,
    "durability": 2617,
    "speed": 21,
    "range": 14816,
    "shp": 31500,
    "caliber": 355.59999999999997,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 343,
    "deck": 76,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 915,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "pennsylvania",
      "name": "Pennsylvania class",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 31400,
        "full_load_tons": 32567
      },
      "propulsion": {
        "speed_kn": 21,
        "shp": 31500,
        "range_nm": 8000,
        "range_at_kn": 10,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 12,
          "caliber_in": 14,
          "mounts": "4x3"
        },
        "secondary_battery": [
          {
            "count": 14,
            "caliber_in": 5,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 343,
        "deck_mm": 76,
        "turret_mm": 457,
        "torpedo_defense": 2
      },
      "complement": 915,
      "design_year": 1913
    }
  },
  "lexington_cc": {
    "id": "lexington_cc",
    "nation": "USA",
    "name": "Lexington class (battlecruiser)",
    "type": "BC",
    "category": "capital_ship",
    "tons": 43500,
    "cost": 20880,
    "year": 1916,
    "durability": 3625,
    "speed": 33.25,
    "range": 18520,
    "shp": 180000,
    "caliber": 406.4,
    "barrels": 8,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 178,
    "deck": 57,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1297,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "lexington_cc",
      "name": "Lexington class (battlecruiser)",
      "nation": "USA",
      "type": "BC",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "displacement": {
        "standard_tons": 43500,
        "full_load_tons": 51217
      },
      "propulsion": {
        "speed_kn": 33.25,
        "shp": 180000,
        "range_nm": 10000,
        "range_at_kn": 10,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 8,
          "caliber_in": 16,
          "mounts": "4x2"
        },
        "secondary_battery": [
          {
            "count": 16,
            "caliber_in": 6,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 178,
        "deck_mm": 57,
        "turret_mm": 279,
        "torpedo_defense": 2
      },
      "complement": 1297,
      "design_year": 1916,
      "notes": "As-designed battlecruiser; two hulls convertible to carriers under the 33,000t clause."
    }
  },
  "lexington_cv": {
    "id": "lexington_cv",
    "nation": "USA",
    "name": "Lexington class (carrier conversion)",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 36000,
    "cost": 17280,
    "year": 1922,
    "durability": 3000,
    "speed": 33.25,
    "range": 18520,
    "shp": 180000,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 178,
    "deck": 51,
    "air": 78,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 2122,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "lexington_cv",
      "name": "Lexington class (carrier conversion)",
      "nation": "USA",
      "type": "CV",
      "treaty_category": "aircraft_carrier",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 36000,
        "full_load_tons": 43055
      },
      "propulsion": {
        "speed_kn": 33.25,
        "shp": 180000,
        "range_nm": 10000,
        "range_at_kn": 10,
        "fuel": "oil"
      },
      "armament": {
        "secondary_battery": [
          {
            "count": 8,
            "caliber_in": 8,
            "mounts": "4x2"
          }
        ]
      },
      "protection": {
        "belt_mm": 178,
        "deck_mm": 51
      },
      "aviation": {
        "aircraft_capacity": 78,
        "catapults": 1,
        "flight_deck": true
      },
      "complement": 2122,
      "design_year": 1922,
      "notes": "Conversion target design for Lexington and Saratoga; declared 33,000t under the treaty conversion clause."
    }
  },
  "omaha": {
    "id": "omaha",
    "nation": "USA",
    "name": "Omaha class",
    "type": "CL",
    "category": "auxiliary_combatant",
    "tons": 7050,
    "cost": 3384,
    "year": 1917,
    "durability": 588,
    "speed": 34,
    "range": 16668,
    "shp": 90000,
    "caliber": 152.39999999999998,
    "barrels": 12,
    "tubes": 10,
    "torpedoRange": 8,
    "belt": 76,
    "deck": 38,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 458,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "omaha",
      "name": "Omaha class",
      "nation": "USA",
      "type": "CL",
      "treaty_category": "auxiliary_combatant",
      "generation": "scout_cruiser",
      "displacement": {
        "standard_tons": 7050,
        "full_load_tons": 9508
      },
      "propulsion": {
        "speed_kn": 34,
        "shp": 90000,
        "range_nm": 9000,
        "range_at_kn": 10,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 12,
          "caliber_in": 6,
          "mounts": "2x2+8 casemate"
        },
        "torpedo_tubes": {
          "count": 10,
          "caliber_in": 21,
          "submerged": false
        }
      },
      "protection": {
        "belt_mm": 76,
        "deck_mm": 38
      },
      "complement": 458,
      "design_year": 1917,
      "hulls_aggregate": {
        "count": 10,
        "status": "building",
        "notes": "Omaha on trials; class completes 1923-25."
      }
    }
  },
  "clemson": {
    "id": "clemson",
    "nation": "USA",
    "name": "Clemson class",
    "type": "DD",
    "category": "auxiliary_combatant",
    "tons": 1190,
    "cost": 571,
    "year": 1917,
    "durability": 99,
    "speed": 35,
    "range": 9074.800000000001,
    "shp": 27600,
    "caliber": 101.6,
    "barrels": 4,
    "tubes": 12,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 114,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "clemson",
      "name": "Clemson class",
      "nation": "USA",
      "type": "DD",
      "treaty_category": "auxiliary_combatant",
      "generation": "flush_deck",
      "displacement": {
        "standard_tons": 1190,
        "full_load_tons": 1308
      },
      "propulsion": {
        "speed_kn": 35,
        "shp": 27600,
        "range_nm": 4900,
        "range_at_kn": 15,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 4,
          "caliber_in": 4,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 12,
          "caliber_in": 21,
          "submerged": false
        }
      },
      "complement": 114,
      "design_year": 1917,
      "hulls_aggregate": {
        "count": 156,
        "status": "mixed",
        "notes": "Flush-deckers; large numbers rotating into red-lead reserve."
      }
    }
  },
  "wickes": {
    "id": "wickes",
    "nation": "USA",
    "name": "Wickes class",
    "type": "DD",
    "category": "auxiliary_combatant",
    "tons": 1090,
    "cost": 523,
    "year": 1916,
    "durability": 91,
    "speed": 35,
    "range": 7037.6,
    "shp": 24610,
    "caliber": 101.6,
    "barrels": 4,
    "tubes": 12,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 100,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "wickes",
      "name": "Wickes class",
      "nation": "USA",
      "type": "DD",
      "treaty_category": "auxiliary_combatant",
      "generation": "flush_deck",
      "displacement": {
        "standard_tons": 1090,
        "full_load_tons": 1247
      },
      "propulsion": {
        "speed_kn": 35,
        "shp": 24610,
        "range_nm": 3800,
        "range_at_kn": 15,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 4,
          "caliber_in": 4,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 12,
          "caliber_in": 21,
          "submerged": false
        }
      },
      "complement": 100,
      "design_year": 1916,
      "hulls_aggregate": {
        "count": 111,
        "status": "mixed",
        "notes": "Majority in reserve by 1922."
      }
    }
  },
  "s_class_ss_usn": {
    "id": "s_class_ss_usn",
    "nation": "USA",
    "name": "S-boat class",
    "type": "SS",
    "category": "auxiliary_combatant",
    "tons": 854,
    "cost": 410,
    "year": 1917,
    "durability": 71,
    "speed": 14.5,
    "range": 9260,
    "shp": 0,
    "caliber": 101.6,
    "barrels": 1,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 38,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "s_class_ss_usn",
      "name": "S-boat class",
      "nation": "USA",
      "type": "SS",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 854,
        "full_load_tons": 1062
      },
      "propulsion": {
        "speed_kn": 14.5,
        "range_nm": 5000,
        "range_at_kn": 10,
        "fuel": "diesel"
      },
      "armament": {
        "main_battery": {
          "count": 1,
          "caliber_in": 4,
          "mounts": "deck"
        },
        "torpedo_tubes": {
          "count": 4,
          "caliber_in": 21,
          "submerged": true
        }
      },
      "complement": 38,
      "design_year": 1917,
      "hulls_aggregate": {
        "count": 40,
        "status": "mixed",
        "notes": "Deliveries continue through 1925; approximate count in commission. Displayed as S-boat class, the USN's own term for these hulls, so the name does not collide with the Royal Navy S class destroyers (naming law: class names must not collide across navies)."
      }
    }
  },
  "us_depot_1922": {
    "id": "us_depot_1922",
    "nation": "USA",
    "name": "Fleet depot · 1922",
    "type": "AD",
    "category": "other",
    "tons": 5500,
    "cost": 3400,
    "year": 1922,
    "durability": 458,
    "speed": 14,
    "range": 16668,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 300,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "us_depot_1922",
      "nation": "USA",
      "name": "Fleet depot · 1922",
      "type": "AD",
      "design_year": 1922,
      "displacement": {
        "standard_tons": 5500,
        "full_load_tons": 8000
      },
      "propulsion": {
        "speed_kn": 14,
        "range_nm": 9000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 2
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 7.7,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 300,
      "cost_gold": 3400,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1931,
    "notes": "Provisional 1922 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "us_oiler_1922": {
    "id": "us_oiler_1922",
    "nation": "USA",
    "name": "Fleet oiler · 1922",
    "type": "AO",
    "category": "other",
    "tons": 6500,
    "cost": 2800,
    "year": 1922,
    "durability": 542,
    "speed": 14,
    "range": 16668,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 160,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "us_oiler_1922",
      "nation": "USA",
      "name": "Fleet oiler · 1922",
      "type": "AO",
      "design_year": 1922,
      "displacement": {
        "standard_tons": 6500,
        "full_load_tons": 13500
      },
      "propulsion": {
        "speed_kn": 14,
        "range_nm": 9000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 2
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 7.7,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 160,
      "cost_gold": 2800,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1931,
    "notes": "Provisional 1922 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "kawachi": {
    "id": "kawachi",
    "nation": "JPN",
    "name": "Kawachi class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 21440,
    "cost": 10291,
    "year": 1907,
    "durability": 1787,
    "speed": 20,
    "range": 5000.400000000001,
    "shp": 25000,
    "caliber": 304.79999999999995,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 305,
    "deck": 51,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 999,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "kawachi",
      "name": "Kawachi class",
      "nation": "JPN",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "dreadnought",
      "displacement": {
        "standard_tons": 21440,
        "full_load_tons": 23100
      },
      "propulsion": {
        "speed_kn": 20,
        "shp": 25000,
        "range_nm": 2700,
        "range_at_kn": 18,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 12,
          "caliber_in": 12,
          "mounts": "6x2",
          "notes": "Mixed 50-cal and 45-cal guns"
        },
        "secondary_battery": [
          {
            "count": 10,
            "caliber_in": 6,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 305,
        "deck_mm": 51,
        "turret_mm": 279,
        "torpedo_defense": 0
      },
      "complement": 999,
      "design_year": 1907,
      "notes": "Settsu only survivor (Kawachi lost 1918)."
    }
  },
  "kongo": {
    "id": "kongo",
    "nation": "JPN",
    "name": "Kongo class",
    "type": "BC",
    "category": "capital_ship",
    "tons": 27500,
    "cost": 13200,
    "year": 1911,
    "durability": 2292,
    "speed": 27.5,
    "range": 14816,
    "shp": 64000,
    "caliber": 355.59999999999997,
    "barrels": 8,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 203,
    "deck": 57,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1221,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "kongo",
      "name": "Kongo class",
      "nation": "JPN",
      "type": "BC",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 27500,
        "full_load_tons": 32200
      },
      "dimensions": {
        "length_m": 214.5,
        "beam_m": 28,
        "draft_m": 8.4
      },
      "propulsion": {
        "speed_kn": 27.5,
        "shp": 64000,
        "range_nm": 8000,
        "range_at_kn": 14,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 8,
          "caliber_in": 14,
          "mounts": "4x2"
        },
        "secondary_battery": [
          {
            "count": 16,
            "caliber_in": 6,
            "mounts": "casemate"
          }
        ],
        "torpedo_tubes": {
          "count": 8,
          "caliber_in": 21,
          "submerged": true
        }
      },
      "protection": {
        "belt_mm": 203,
        "deck_mm": 57,
        "turret_mm": 229,
        "torpedo_defense": 1
      },
      "complement": 1221,
      "design_year": 1911,
      "notes": "Kongo built at Vickers; future fast-battleship rebuild candidates."
    }
  },
  "fuso": {
    "id": "fuso",
    "nation": "JPN",
    "name": "Fuso class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 30600,
    "cost": 14688,
    "year": 1912,
    "durability": 2550,
    "speed": 22.5,
    "range": 14816,
    "shp": 40000,
    "caliber": 355.59999999999997,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 305,
    "deck": 64,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1193,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "fuso",
      "name": "Fuso class",
      "nation": "JPN",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 30600,
        "full_load_tons": 35900
      },
      "propulsion": {
        "speed_kn": 22.5,
        "shp": 40000,
        "range_nm": 8000,
        "range_at_kn": 14,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 12,
          "caliber_in": 14,
          "mounts": "6x2"
        },
        "secondary_battery": [
          {
            "count": 16,
            "caliber_in": 6,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 305,
        "deck_mm": 64,
        "turret_mm": 305,
        "torpedo_defense": 1
      },
      "complement": 1193,
      "design_year": 1912
    }
  },
  "ise": {
    "id": "ise",
    "nation": "JPN",
    "name": "Ise class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 31260,
    "cost": 15005,
    "year": 1915,
    "durability": 2605,
    "speed": 23,
    "range": 17927.36,
    "shp": 45000,
    "caliber": 355.59999999999997,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 305,
    "deck": 64,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1360,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "ise",
      "name": "Ise class",
      "nation": "JPN",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 31260,
        "full_load_tons": 36500
      },
      "propulsion": {
        "speed_kn": 23,
        "shp": 45000,
        "range_nm": 9680,
        "range_at_kn": 14,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 12,
          "caliber_in": 14,
          "mounts": "6x2"
        },
        "secondary_battery": [
          {
            "count": 20,
            "caliber_in": 5.5,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 305,
        "deck_mm": 64,
        "turret_mm": 305,
        "torpedo_defense": 1
      },
      "complement": 1360,
      "design_year": 1915
    }
  },
  "nagato": {
    "id": "nagato",
    "nation": "JPN",
    "name": "Nagato class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 33800,
    "cost": 16224,
    "year": 1916,
    "durability": 2817,
    "speed": 26.5,
    "range": 10186,
    "shp": 80000,
    "caliber": 408.94,
    "barrels": 8,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 305,
    "deck": 76,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1333,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "nagato",
      "name": "Nagato class",
      "nation": "JPN",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "displacement": {
        "standard_tons": 33800,
        "full_load_tons": 38500
      },
      "dimensions": {
        "length_m": 215.8,
        "beam_m": 29,
        "draft_m": 9.1
      },
      "propulsion": {
        "speed_kn": 26.5,
        "shp": 80000,
        "range_nm": 5500,
        "range_at_kn": 16,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 8,
          "caliber_in": 16.1,
          "mounts": "4x2"
        },
        "secondary_battery": [
          {
            "count": 20,
            "caliber_in": 5.5,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 305,
        "deck_mm": 76,
        "turret_mm": 356,
        "torpedo_defense": 2
      },
      "complement": 1333,
      "design_year": 1916,
      "notes": "True 26.5kn speed kept secret from the other powers — an intelligence-model showcase. Mutsu's retention nearly broke the treaty conference."
    }
  },
  "tosa": {
    "id": "tosa",
    "nation": "JPN",
    "name": "Tosa class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 39900,
    "cost": 19152,
    "year": 1918,
    "durability": 3325,
    "speed": 26.5,
    "range": 12038,
    "shp": 91000,
    "caliber": 408.94,
    "barrels": 10,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 280,
    "deck": 102,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1333,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "tosa",
      "name": "Tosa class",
      "nation": "JPN",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "displacement": {
        "standard_tons": 39900,
        "full_load_tons": 44200
      },
      "propulsion": {
        "speed_kn": 26.5,
        "shp": 91000,
        "range_nm": 6500,
        "range_at_kn": 16,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 10,
          "caliber_in": 16.1,
          "mounts": "5x2"
        },
        "secondary_battery": [
          {
            "count": 20,
            "caliber_in": 5.5,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 280,
        "deck_mm": 102,
        "turret_mm": 356,
        "torpedo_defense": 2
      },
      "complement": 1333,
      "design_year": 1918,
      "notes": "8-8 fleet program; both hulls treaty casualties. Kaga's hull historically saved by the 1923 earthquake wrecking Amagi."
    }
  },
  "amagi": {
    "id": "amagi",
    "nation": "JPN",
    "name": "Amagi class",
    "type": "BC",
    "category": "capital_ship",
    "tons": 41200,
    "cost": 19776,
    "year": 1919,
    "durability": 3433,
    "speed": 30,
    "range": 14816,
    "shp": 131200,
    "caliber": 408.94,
    "barrels": 10,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 254,
    "deck": 95,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1600,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "amagi",
      "name": "Amagi class",
      "nation": "JPN",
      "type": "BC",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "displacement": {
        "standard_tons": 41200,
        "full_load_tons": 47000
      },
      "propulsion": {
        "speed_kn": 30,
        "shp": 131200,
        "range_nm": 8000,
        "range_at_kn": 14,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 10,
          "caliber_in": 16.1,
          "mounts": "5x2"
        },
        "secondary_battery": [
          {
            "count": 16,
            "caliber_in": 5.5,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 254,
        "deck_mm": 95,
        "turret_mm": 280,
        "torpedo_defense": 2
      },
      "complement": 1600,
      "design_year": 1919,
      "notes": "Amagi and Akagi designated for carrier conversion under the treaty."
    }
  },
  "kii": {
    "id": "kii",
    "nation": "JPN",
    "name": "Kii class (canceled)",
    "type": "BB",
    "category": "capital_ship",
    "tons": 42600,
    "cost": 20448,
    "year": 1921,
    "durability": 3550,
    "speed": 29.75,
    "range": 14816,
    "shp": 131200,
    "caliber": 408.94,
    "barrels": 10,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 292,
    "deck": 120,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1600,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "kii",
      "name": "Kii class (canceled)",
      "nation": "JPN",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "displacement": {
        "standard_tons": 42600,
        "full_load_tons": 48500
      },
      "propulsion": {
        "speed_kn": 29.75,
        "shp": 131200,
        "range_nm": 8000,
        "range_at_kn": 14,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 10,
          "caliber_in": 16.1,
          "mounts": "5x2"
        }
      },
      "protection": {
        "belt_mm": 292,
        "deck_mm": 120,
        "turret_mm": 280,
        "torpedo_defense": 2
      },
      "complement": 1600,
      "design_year": 1921,
      "notes": "8-8 fleet fast battleship; never laid down. Alt-history build."
    }
  },
  "number_13": {
    "id": "number_13",
    "nation": "JPN",
    "name": "Number 13 class (design study)",
    "type": "BC",
    "category": "capital_ship",
    "tons": 47500,
    "cost": 22800,
    "year": 1921,
    "durability": 3958,
    "speed": 30,
    "range": 14816,
    "shp": 150000,
    "caliber": 457.2,
    "barrels": 8,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 330,
    "deck": 127,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1780,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "number_13",
      "name": "Number 13 class (design study)",
      "nation": "JPN",
      "type": "BC",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "displacement": {
        "standard_tons": 47500,
        "full_load_tons": 53000
      },
      "propulsion": {
        "speed_kn": 30,
        "shp": 150000,
        "range_nm": 8000,
        "range_at_kn": 14,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 8,
          "caliber_in": 18,
          "mounts": "4x2"
        }
      },
      "protection": {
        "belt_mm": 330,
        "deck_mm": 127,
        "turret_mm": 356,
        "torpedo_defense": 3
      },
      "complement": 1780,
      "design_year": 1921,
      "notes": "The 18-inch endpoint of the 8-8 program; paper only. Ultimate alt-history build."
    }
  },
  "akagi_cv": {
    "id": "akagi_cv",
    "nation": "JPN",
    "name": "Akagi (carrier conversion)",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 36500,
    "cost": 17520,
    "year": 1923,
    "durability": 3042,
    "speed": 31,
    "range": 14816,
    "shp": 131200,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 152,
    "deck": 57,
    "air": 60,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1630,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "akagi_cv",
      "name": "Akagi (carrier conversion)",
      "nation": "JPN",
      "type": "CV",
      "treaty_category": "aircraft_carrier",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 36500,
        "full_load_tons": 41300
      },
      "propulsion": {
        "speed_kn": 31,
        "shp": 131200,
        "range_nm": 8000,
        "range_at_kn": 14,
        "fuel": "mixed"
      },
      "armament": {
        "secondary_battery": [
          {
            "count": 10,
            "caliber_in": 7.9,
            "mounts": "2x2+6 casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 152,
        "deck_mm": 57
      },
      "aviation": {
        "aircraft_capacity": 60,
        "flight_deck": true
      },
      "complement": 1630,
      "design_year": 1923,
      "notes": "Conversion target design on the Amagi-class hull; declared 26,900t under the conversion clause."
    }
  },
  "kaga_cv": {
    "id": "kaga_cv",
    "nation": "JPN",
    "name": "Kaga (carrier conversion)",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 38200,
    "cost": 18336,
    "year": 1923,
    "durability": 3183,
    "speed": 27.5,
    "range": 14816,
    "shp": 91000,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 152,
    "deck": 57,
    "air": 60,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1708,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "kaga_cv",
      "name": "Kaga (carrier conversion)",
      "nation": "JPN",
      "type": "CV",
      "treaty_category": "aircraft_carrier",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 38200,
        "full_load_tons": 43650
      },
      "propulsion": {
        "speed_kn": 27.5,
        "shp": 91000,
        "range_nm": 8000,
        "range_at_kn": 14,
        "fuel": "mixed"
      },
      "armament": {
        "secondary_battery": [
          {
            "count": 10,
            "caliber_in": 7.9,
            "mounts": "2x2+6 casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 152,
        "deck_mm": 57
      },
      "aviation": {
        "aircraft_capacity": 60,
        "flight_deck": true
      },
      "complement": 1708,
      "design_year": 1923,
      "notes": "Conversion target design on the Tosa-class hull; activated historically after the 1923 earthquake wrecked Amagi."
    }
  },
  "kuma": {
    "id": "kuma",
    "nation": "JPN",
    "name": "Kuma class",
    "type": "CL",
    "category": "auxiliary_combatant",
    "tons": 5500,
    "cost": 2640,
    "year": 1917,
    "durability": 458,
    "speed": 36,
    "range": 16668,
    "shp": 90000,
    "caliber": 139.7,
    "barrels": 7,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 64,
    "deck": 29,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 450,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "kuma",
      "name": "Kuma class",
      "nation": "JPN",
      "type": "CL",
      "treaty_category": "auxiliary_combatant",
      "generation": "scout_cruiser",
      "displacement": {
        "standard_tons": 5500,
        "full_load_tons": 5832
      },
      "propulsion": {
        "speed_kn": 36,
        "shp": 90000,
        "range_nm": 9000,
        "range_at_kn": 10,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 7,
          "caliber_in": 5.5,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 8,
          "caliber_in": 21,
          "submerged": false
        }
      },
      "protection": {
        "belt_mm": 64,
        "deck_mm": 29
      },
      "complement": 450,
      "design_year": 1917,
      "hulls_aggregate": {
        "count": 5,
        "status": "active",
        "notes": "Kuma, Tama, Kitakami, Oi, Kiso. Torpedo-cruiser conversion potential."
      }
    }
  },
  "nagara": {
    "id": "nagara",
    "nation": "JPN",
    "name": "Nagara class",
    "type": "CL",
    "category": "auxiliary_combatant",
    "tons": 5570,
    "cost": 2674,
    "year": 1920,
    "durability": 464,
    "speed": 36,
    "range": 16668,
    "shp": 90000,
    "caliber": 139.7,
    "barrels": 7,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 64,
    "deck": 29,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 450,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "nagara",
      "name": "Nagara class",
      "nation": "JPN",
      "type": "CL",
      "treaty_category": "auxiliary_combatant",
      "generation": "scout_cruiser",
      "displacement": {
        "standard_tons": 5570,
        "full_load_tons": 5990
      },
      "propulsion": {
        "speed_kn": 36,
        "shp": 90000,
        "range_nm": 9000,
        "range_at_kn": 10,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 7,
          "caliber_in": 5.5,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 8,
          "caliber_in": 24,
          "submerged": false
        }
      },
      "protection": {
        "belt_mm": 64,
        "deck_mm": 29
      },
      "complement": 450,
      "design_year": 1920,
      "hulls_aggregate": {
        "count": 6,
        "status": "mixed",
        "notes": "Nagara complete; sisters completing 1922-25. First 24-inch torpedo fit."
      }
    }
  },
  "furutaka": {
    "id": "furutaka",
    "nation": "JPN",
    "name": "Furutaka class",
    "type": "CA",
    "category": "auxiliary_combatant",
    "tons": 8100,
    "cost": 3888,
    "year": 1921,
    "durability": 675,
    "speed": 34.5,
    "range": 11112,
    "shp": 102000,
    "caliber": 200.66,
    "barrels": 6,
    "tubes": 12,
    "torpedoRange": 8,
    "belt": 76,
    "deck": 35,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 625,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "furutaka",
      "name": "Furutaka class",
      "nation": "JPN",
      "type": "CA",
      "treaty_category": "auxiliary_combatant",
      "generation": "treaty_cruiser",
      "displacement": {
        "standard_tons": 8100,
        "full_load_tons": 9540
      },
      "propulsion": {
        "speed_kn": 34.5,
        "shp": 102000,
        "range_nm": 6000,
        "range_at_kn": 14,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 6,
          "caliber_in": 7.9,
          "mounts": "6x1"
        },
        "torpedo_tubes": {
          "count": 12,
          "caliber_in": 24,
          "submerged": false
        }
      },
      "protection": {
        "belt_mm": 76,
        "deck_mm": 35
      },
      "complement": 625,
      "design_year": 1921,
      "notes": "Designed pre-treaty as an 8in scout-killer; laid down Dec 1922. Japan's opening move in the treaty-cruiser race. No hulls at scenario start."
    }
  },
  "yubari": {
    "id": "yubari",
    "nation": "JPN",
    "name": "Yubari (experimental)",
    "type": "CL",
    "category": "auxiliary_combatant",
    "tons": 2890,
    "cost": 1387,
    "year": 1921,
    "durability": 241,
    "speed": 35.5,
    "range": 9260,
    "shp": 57900,
    "caliber": 139.7,
    "barrels": 6,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 38,
    "deck": 25,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 328,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "yubari",
      "name": "Yubari (experimental)",
      "nation": "JPN",
      "type": "CL",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 2890,
        "full_load_tons": 3560
      },
      "propulsion": {
        "speed_kn": 35.5,
        "shp": 57900,
        "range_nm": 5000,
        "range_at_kn": 14,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 6,
          "caliber_in": 5.5,
          "mounts": "2x2+2x1"
        },
        "torpedo_tubes": {
          "count": 4,
          "caliber_in": 24,
          "submerged": false
        }
      },
      "protection": {
        "belt_mm": 38,
        "deck_mm": 25
      },
      "complement": 328,
      "design_year": 1921,
      "notes": "Hiraga's weight-saving testbed; laid down Jun 1922. No hulls at scenario start."
    }
  },
  "minekaze": {
    "id": "minekaze",
    "nation": "JPN",
    "name": "Minekaze class",
    "type": "DD",
    "category": "auxiliary_combatant",
    "tons": 1215,
    "cost": 583,
    "year": 1917,
    "durability": 101,
    "speed": 39,
    "range": 6667.200000000001,
    "shp": 38500,
    "caliber": 119.38,
    "barrels": 4,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 148,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "minekaze",
      "name": "Minekaze class",
      "nation": "JPN",
      "type": "DD",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 1215,
        "full_load_tons": 1650
      },
      "propulsion": {
        "speed_kn": 39,
        "shp": 38500,
        "range_nm": 3600,
        "range_at_kn": 14,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 4,
          "caliber_in": 4.7,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 6,
          "caliber_in": 21,
          "submerged": false
        }
      },
      "complement": 148,
      "design_year": 1917,
      "hulls_aggregate": {
        "count": 13,
        "status": "mixed",
        "notes": "Plus follow-on Kamikaze class ordered; 39kn first-class destroyers."
      }
    }
  },
  "momi": {
    "id": "momi",
    "nation": "JPN",
    "name": "Momi class (2nd class)",
    "type": "DD",
    "category": "auxiliary_combatant",
    "tons": 770,
    "cost": 370,
    "year": 1918,
    "durability": 64,
    "speed": 36,
    "range": 5556,
    "shp": 21500,
    "caliber": 119.38,
    "barrels": 3,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 110,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "momi",
      "name": "Momi class (2nd class)",
      "nation": "JPN",
      "type": "DD",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 770,
        "full_load_tons": 1020
      },
      "propulsion": {
        "speed_kn": 36,
        "shp": 21500,
        "range_nm": 3000,
        "range_at_kn": 15,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 3,
          "caliber_in": 4.7,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 4,
          "caliber_in": 21,
          "submerged": false
        }
      },
      "complement": 110,
      "design_year": 1918,
      "hulls_aggregate": {
        "count": 21,
        "status": "mixed"
      }
    }
  },
  "kaichu": {
    "id": "kaichu",
    "nation": "JPN",
    "name": "Kaichu type",
    "type": "SS",
    "category": "auxiliary_combatant",
    "tons": 740,
    "cost": 355,
    "year": 1917,
    "durability": 62,
    "speed": 16,
    "range": 7408,
    "shp": 0,
    "caliber": 76.19999999999999,
    "barrels": 1,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 44,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "kaichu",
      "name": "Kaichu type",
      "nation": "JPN",
      "type": "SS",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 740,
        "full_load_tons": 1030
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 4000,
        "range_at_kn": 10,
        "fuel": "diesel"
      },
      "armament": {
        "main_battery": {
          "count": 1,
          "caliber_in": 3,
          "mounts": "deck"
        },
        "torpedo_tubes": {
          "count": 6,
          "caliber_in": 18,
          "submerged": true
        }
      },
      "complement": 44,
      "design_year": 1917,
      "hulls_aggregate": {
        "count": 20,
        "status": "mixed",
        "notes": "Approximate; medium types of several sub-variants. Ocean cruiser types (Kaidai, Junsen) arrive mid-1920s."
      }
    }
  },
  "deutschland_bb": {
    "id": "deutschland_bb",
    "nation": "DEU",
    "name": "Deutschland class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 13200,
    "cost": 6336,
    "year": 1903,
    "durability": 1100,
    "speed": 18,
    "range": 8889.6,
    "shp": 17000,
    "caliber": 283,
    "barrels": 4,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 240,
    "deck": 40,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 743,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "deutschland_bb",
      "name": "Deutschland class",
      "nation": "DEU",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "pre_dreadnought",
      "displacement": {
        "standard_tons": 13200,
        "full_load_tons": 14200
      },
      "propulsion": {
        "speed_kn": 18,
        "shp": 17000,
        "range_nm": 4800,
        "range_at_kn": 10,
        "fuel": "coal"
      },
      "armament": {
        "main_battery": {
          "count": 4,
          "caliber_in": 11,
          "caliber_mm": 283,
          "mounts": "2x2",
          "notes": "28 cm SK L/40"
        },
        "secondary_battery": [
          {
            "count": 14,
            "caliber_in": 6.7,
            "caliber_mm": 170,
            "mounts": "casemate"
          },
          {
            "count": 20,
            "caliber_in": 3.4,
            "caliber_mm": 88,
            "mounts": "single"
          }
        ]
      },
      "protection": {
        "belt_mm": 240,
        "deck_mm": 40,
        "turret_mm": 280,
        "torpedo_defense": 0
      },
      "complement": 743,
      "design_year": 1903,
      "notes": "The newest capital ships Germany is permitted to own, and they were obsolete when the Dreadnought commissioned. Article 190 bars replacement until twenty years after completion, so the earliest legal successor to Hannover is 1927 and to Schleswig-Holstein 1928 — at 10,000 t. THE WHOLE GERMAN CAPITAL-SHIP QUESTION IS THAT SENTENCE, and *Nothing Above Water* answers it by declining to ask."
    }
  },
  "braunschweig_bb": {
    "id": "braunschweig_bb",
    "nation": "DEU",
    "name": "Braunschweig class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 13200,
    "cost": 6336,
    "year": 1901,
    "durability": 1100,
    "speed": 18,
    "range": 8889.6,
    "shp": 16000,
    "caliber": 283,
    "barrels": 4,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 225,
    "deck": 40,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 743,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "braunschweig_bb",
      "name": "Braunschweig class",
      "nation": "DEU",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "pre_dreadnought",
      "displacement": {
        "standard_tons": 13200,
        "full_load_tons": 14400
      },
      "propulsion": {
        "speed_kn": 18,
        "shp": 16000,
        "range_nm": 4800,
        "range_at_kn": 10,
        "fuel": "coal"
      },
      "armament": {
        "main_battery": {
          "count": 4,
          "caliber_in": 11,
          "caliber_mm": 283,
          "mounts": "2x2",
          "notes": "28 cm SK L/40"
        },
        "secondary_battery": [
          {
            "count": 14,
            "caliber_in": 6.7,
            "caliber_mm": 170,
            "mounts": "casemate"
          },
          {
            "count": 18,
            "caliber_in": 3.4,
            "caliber_mm": 88,
            "mounts": "single"
          }
        ]
      },
      "protection": {
        "belt_mm": 225,
        "deck_mm": 40,
        "turret_mm": 250,
        "torpedo_defense": 0
      },
      "complement": 743,
      "design_year": 1901,
      "notes": "Older than the Deutschlands by two years and identically armed."
    }
  },
  "mackensen_bc": {
    "id": "mackensen_bc",
    "nation": "DEU",
    "name": "Mackensen class (broken up incomplete)",
    "type": "BC",
    "category": "capital_ship",
    "tons": 31000,
    "cost": 14880,
    "year": 1914,
    "durability": 2583,
    "speed": 28,
    "range": 14816,
    "shp": 90000,
    "caliber": 350,
    "barrels": 8,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 300,
    "deck": 80,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1186,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "mackensen_bc",
      "name": "Mackensen class (broken up incomplete)",
      "nation": "DEU",
      "type": "BC",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 31000,
        "full_load_tons": 35300
      },
      "propulsion": {
        "speed_kn": 28,
        "shp": 90000,
        "range_nm": 8000,
        "range_at_kn": 14,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 8,
          "caliber_in": 13.8,
          "caliber_mm": 350,
          "mounts": "4x2",
          "notes": "35 cm SK L/45 — never mounted in any ship"
        },
        "secondary_battery": [
          {
            "count": 12,
            "caliber_in": 5.9,
            "caliber_mm": 150,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 300,
        "deck_mm": 80,
        "turret_mm": 320,
        "torpedo_defense": 1
      },
      "complement": 1186,
      "design_year": 1914,
      "notes": "The two incomplete Bayern-class battleships, Sachsen and Württemberg, went the same way in the same yards in the same year. Nothing here can be resumed."
    }
  },
  "emden_cl": {
    "id": "emden_cl",
    "nation": "DEU",
    "name": "Emden",
    "type": "CL",
    "category": "auxiliary_combatant",
    "tons": 5600,
    "cost": 2688,
    "year": 1921,
    "durability": 467,
    "speed": 29,
    "range": 12408.400000000001,
    "shp": 46500,
    "caliber": 150,
    "barrels": 8,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 50,
    "deck": 20,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 630,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "emden_cl",
      "name": "Emden",
      "nation": "DEU",
      "type": "CL",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 5600,
        "full_load_tons": 6990
      },
      "propulsion": {
        "speed_kn": 29,
        "shp": 46500,
        "range_nm": 6700,
        "range_at_kn": 14,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 8,
          "caliber_in": 5.9,
          "caliber_mm": 150,
          "mounts": "8x1",
          "notes": "15 cm SK L/45 in single shields — a wartime pattern on a postwar hull, because the twin mounting would have cost a year"
        },
        "secondary_battery": [
          {
            "count": 3,
            "caliber_in": 3.4,
            "caliber_mm": 88,
            "mounts": "single high-angle"
          }
        ],
        "torpedo_tubes": {
          "count": 4,
          "caliber_in": 19.7,
          "submerged": false
        }
      },
      "protection": {
        "belt_mm": 50,
        "deck_mm": 20,
        "turret_mm": 20,
        "torpedo_defense": 0
      },
      "complement": 630,
      "design_year": 1921
    }
  },
  "bremen_cl": {
    "id": "bremen_cl",
    "nation": "DEU",
    "name": "Bremen class",
    "type": "CL",
    "category": "auxiliary_combatant",
    "tons": 3250,
    "cost": 1560,
    "year": 1901,
    "durability": 271,
    "speed": 22,
    "range": 7963.6,
    "shp": 10000,
    "caliber": 105,
    "barrels": 10,
    "tubes": 2,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 80,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 288,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "bremen_cl",
      "name": "Bremen class",
      "nation": "DEU",
      "type": "CL",
      "treaty_category": "auxiliary_combatant",
      "generation": "pre_dreadnought",
      "displacement": {
        "standard_tons": 3250,
        "full_load_tons": 3800
      },
      "propulsion": {
        "speed_kn": 22,
        "shp": 10000,
        "range_nm": 4300,
        "range_at_kn": 12,
        "fuel": "coal"
      },
      "armament": {
        "main_battery": {
          "count": 10,
          "caliber_in": 4.1,
          "caliber_mm": 105,
          "mounts": "10x1"
        },
        "torpedo_tubes": {
          "count": 2,
          "caliber_in": 17.7,
          "submerged": true
        }
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 80,
        "turret_mm": 0,
        "torpedo_defense": 0
      },
      "complement": 288,
      "design_year": 1901,
      "hulls_aggregate": {
        "count": 2,
        "status": "active",
        "notes": "Berlin, Hamburg."
      },
      "notes": "Twenty-one years old at the file's date and still counted against the six-cruiser allowance, which is the point of the allowance."
    }
  },
  "gazelle_cl": {
    "id": "gazelle_cl",
    "nation": "DEU",
    "name": "Gazelle class",
    "type": "CL",
    "category": "auxiliary_combatant",
    "tons": 2650,
    "cost": 1272,
    "year": 1897,
    "durability": 221,
    "speed": 21.5,
    "range": 6667.200000000001,
    "shp": 8000,
    "caliber": 105,
    "barrels": 10,
    "tubes": 2,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 25,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 257,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "gazelle_cl",
      "name": "Gazelle class",
      "nation": "DEU",
      "type": "CL",
      "treaty_category": "auxiliary_combatant",
      "generation": "pre_dreadnought",
      "displacement": {
        "standard_tons": 2650,
        "full_load_tons": 3000
      },
      "propulsion": {
        "speed_kn": 21.5,
        "shp": 8000,
        "range_nm": 3600,
        "range_at_kn": 12,
        "fuel": "coal"
      },
      "armament": {
        "main_battery": {
          "count": 10,
          "caliber_in": 4.1,
          "caliber_mm": 105,
          "mounts": "10x1"
        },
        "torpedo_tubes": {
          "count": 2,
          "caliber_in": 17.7,
          "submerged": true
        }
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 25,
        "turret_mm": 0,
        "torpedo_defense": 0
      },
      "complement": 257,
      "design_year": 1897,
      "hulls_aggregate": {
        "count": 6,
        "status": "mixed",
        "notes": "Amazone, Arcona, Medusa, Niobe, Nymphe, Thetis — four in commission, two in reserve, and Niobe is a hulk in all but name."
      },
      "notes": "The oldest cruisers in commission in any European navy. Article 190's twenty-year clock has already expired on every one of them, which is why Emden could be laid down at all."
    }
  },
  "v1_dd": {
    "id": "v1_dd",
    "nation": "DEU",
    "name": "V1 class",
    "type": "DD",
    "category": "auxiliary_combatant",
    "tons": 570,
    "cost": 274,
    "year": 1910,
    "durability": 48,
    "speed": 32,
    "range": 3333.6000000000004,
    "shp": 17000,
    "caliber": 88,
    "barrels": 2,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 74,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "v1_dd",
      "name": "V1 class",
      "nation": "DEU",
      "type": "DD",
      "treaty_category": "auxiliary_combatant",
      "generation": "flush_deck",
      "displacement": {
        "standard_tons": 570,
        "full_load_tons": 700
      },
      "propulsion": {
        "speed_kn": 32,
        "shp": 17000,
        "range_nm": 1800,
        "range_at_kn": 17,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 2,
          "caliber_in": 3.4,
          "caliber_mm": 88,
          "mounts": "2x1"
        },
        "torpedo_tubes": {
          "count": 4,
          "caliber_in": 19.7,
          "submerged": false
        }
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0,
        "turret_mm": 0,
        "torpedo_defense": 0
      },
      "complement": 74,
      "design_year": 1910,
      "hulls_aggregate": {
        "count": 12,
        "status": "active",
        "notes": "The twelve destroyers Article 181 allows, made up from the 1911–13 V, S and G types. Replacement is barred until fifteen years after completion and capped at 800 t."
      },
      "notes": "A prewar torpedo boat rated a destroyer because the Treaty uses the word. The flotillas that will train every submarine officer in the next fifteen years are these boats and nothing else."
    }
  },
  "a_boat_tb": {
    "id": "a_boat_tb",
    "nation": "DEU",
    "name": "A-boat class",
    "type": "DD",
    "category": "auxiliary_combatant",
    "tons": 227,
    "cost": 109,
    "year": 1915,
    "durability": 19,
    "speed": 25,
    "range": 1481.6000000000001,
    "shp": 3500,
    "caliber": 88,
    "barrels": 1,
    "tubes": 2,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 29,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "a_boat_tb",
      "name": "A-boat class",
      "nation": "DEU",
      "type": "DD",
      "treaty_category": "auxiliary_combatant",
      "generation": "flush_deck",
      "displacement": {
        "standard_tons": 227,
        "full_load_tons": 260
      },
      "propulsion": {
        "speed_kn": 25,
        "shp": 3500,
        "range_nm": 800,
        "range_at_kn": 14,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 1,
          "caliber_in": 3.4,
          "caliber_mm": 88,
          "mounts": "1x1"
        },
        "torpedo_tubes": {
          "count": 2,
          "caliber_in": 17.7,
          "submerged": false
        }
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0,
        "turret_mm": 0,
        "torpedo_defense": 0
      },
      "complement": 29,
      "design_year": 1915,
      "hulls_aggregate": {
        "count": 12,
        "status": "mixed",
        "notes": "The twelve torpedo boats Article 181 allows, from the wartime A-series coastal boats. Replacement capped at 200 t."
      },
      "notes": "Two hundred and twenty-seven tons, one gun and a coastal radius. They are on the establishment because the Treaty counts hulls and not capability, and they are the reason a German naval officer of 1922 could go to sea at all."
    }
  },
  "de_depot_1922": {
    "id": "de_depot_1922",
    "nation": "DEU",
    "name": "Fleet depot · 1922",
    "type": "AD",
    "category": "other",
    "tons": 5500,
    "cost": 3400,
    "year": 1922,
    "durability": 458,
    "speed": 14,
    "range": 16668,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 300,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "de_depot_1922",
      "nation": "DEU",
      "name": "Fleet depot · 1922",
      "type": "AD",
      "design_year": 1922,
      "displacement": {
        "standard_tons": 5500,
        "full_load_tons": 8000
      },
      "propulsion": {
        "speed_kn": 14,
        "range_nm": 9000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 2
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 7.7,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 300,
      "cost_gold": 3400,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1931,
    "notes": "Provisional 1922 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "de_oiler_1922": {
    "id": "de_oiler_1922",
    "nation": "DEU",
    "name": "Fleet oiler · 1922",
    "type": "AO",
    "category": "other",
    "tons": 6500,
    "cost": 2800,
    "year": 1922,
    "durability": 542,
    "speed": 14,
    "range": 16668,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 160,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "de_oiler_1922",
      "nation": "DEU",
      "name": "Fleet oiler · 1922",
      "type": "AO",
      "design_year": 1922,
      "displacement": {
        "standard_tons": 6500,
        "full_load_tons": 13500
      },
      "propulsion": {
        "speed_kn": 14,
        "range_nm": 9000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 2
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 7.7,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 160,
      "cost_gold": 2800,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1931,
    "notes": "Provisional 1922 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "courbet": {
    "id": "courbet",
    "nation": "FRA",
    "name": "Courbet class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 22200,
    "cost": 10656,
    "year": 1910,
    "durability": 1850,
    "speed": 21,
    "range": 7778.400000000001,
    "shp": 28000,
    "caliber": 304.79999999999995,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 270,
    "deck": 70,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1115,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "courbet",
      "name": "Courbet class",
      "nation": "FRA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "dreadnought",
      "displacement": {
        "standard_tons": 22200,
        "full_load_tons": 25850
      },
      "propulsion": {
        "speed_kn": 21,
        "shp": 28000,
        "range_nm": 4200,
        "range_at_kn": 10,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 12,
          "caliber_in": 12,
          "mounts": "6x2"
        },
        "secondary_battery": [
          {
            "count": 22,
            "caliber_in": 5.5,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 270,
        "deck_mm": 70,
        "turret_mm": 290,
        "torpedo_defense": 0
      },
      "complement": 1115,
      "design_year": 1910,
      "notes": "War-worn; France's capital fleet stagnated 1914-18 while rivals built."
    }
  },
  "bretagne": {
    "id": "bretagne",
    "nation": "FRA",
    "name": "Bretagne class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 23200,
    "cost": 11136,
    "year": 1912,
    "durability": 1933,
    "speed": 20,
    "range": 8704.4,
    "shp": 29000,
    "caliber": 340.36,
    "barrels": 10,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 270,
    "deck": 70,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1124,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "bretagne",
      "name": "Bretagne class",
      "nation": "FRA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 23200,
        "full_load_tons": 26000
      },
      "propulsion": {
        "speed_kn": 20,
        "shp": 29000,
        "range_nm": 4700,
        "range_at_kn": 10,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 10,
          "caliber_in": 13.4,
          "mounts": "5x2"
        },
        "secondary_battery": [
          {
            "count": 22,
            "caliber_in": 5.5,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 270,
        "deck_mm": 70,
        "turret_mm": 340,
        "torpedo_defense": 0
      },
      "complement": 1124,
      "design_year": 1912,
      "notes": "Backbone of the Mediterranean squadron; modernization candidates."
    }
  },
  "normandie": {
    "id": "normandie",
    "nation": "FRA",
    "name": "Normandie class (suspended)",
    "type": "BB",
    "category": "capital_ship",
    "tons": 25200,
    "cost": 12096,
    "year": 1913,
    "durability": 2100,
    "speed": 21,
    "range": 12038,
    "shp": 32000,
    "caliber": 340.36,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 300,
    "deck": 70,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1200,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "normandie",
      "name": "Normandie class (suspended)",
      "nation": "FRA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 25200,
        "full_load_tons": 28500
      },
      "propulsion": {
        "speed_kn": 21,
        "shp": 32000,
        "range_nm": 6500,
        "range_at_kn": 12,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 12,
          "caliber_in": 13.4,
          "mounts": "3x4",
          "notes": "First quadruple turrets"
        },
        "secondary_battery": [
          {
            "count": 24,
            "caliber_in": 5.5,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 300,
        "deck_mm": 70,
        "turret_mm": 340,
        "torpedo_defense": 1
      },
      "complement": 1200,
      "design_year": 1913,
      "notes": "Suspended 1914; four hulls scrapped, Bearn's hull taken for carrier conversion."
    }
  },
  "bearn_cv": {
    "id": "bearn_cv",
    "nation": "FRA",
    "name": "Bearn (carrier conversion)",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 22146,
    "cost": 10630,
    "year": 1923,
    "durability": 1846,
    "speed": 21.5,
    "range": 12964,
    "shp": 37500,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 83,
    "deck": 25,
    "air": 35,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 875,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "bearn_cv",
      "name": "Bearn (carrier conversion)",
      "nation": "FRA",
      "type": "CV",
      "treaty_category": "aircraft_carrier",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 22146,
        "full_load_tons": 28400
      },
      "propulsion": {
        "speed_kn": 21.5,
        "shp": 37500,
        "range_nm": 7000,
        "range_at_kn": 10,
        "fuel": "oil"
      },
      "armament": {
        "secondary_battery": [
          {
            "count": 8,
            "caliber_in": 6.1,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 83,
        "deck_mm": 25
      },
      "aviation": {
        "aircraft_capacity": 35,
        "flight_deck": true
      },
      "complement": 875,
      "design_year": 1923,
      "notes": "Conversion design on the Normandie-class hull; historically converted 1923-27. Slow for fleet work."
    }
  },
  "edgar_quinet": {
    "id": "edgar_quinet",
    "nation": "FRA",
    "name": "Edgar Quinet class",
    "type": "CA",
    "category": "auxiliary_combatant",
    "tons": 13850,
    "cost": 6648,
    "year": 1905,
    "durability": 1154,
    "speed": 23,
    "range": 9445.2,
    "shp": 36000,
    "caliber": 193.04,
    "barrels": 14,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 150,
    "deck": 65,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 892,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "edgar_quinet",
      "name": "Edgar Quinet class",
      "nation": "FRA",
      "type": "CA",
      "treaty_category": "auxiliary_combatant",
      "generation": "pre_dreadnought",
      "displacement": {
        "standard_tons": 13850,
        "full_load_tons": 14300
      },
      "propulsion": {
        "speed_kn": 23,
        "shp": 36000,
        "range_nm": 5100,
        "range_at_kn": 10,
        "fuel": "coal"
      },
      "armament": {
        "main_battery": {
          "count": 14,
          "caliber_in": 7.6,
          "mounts": "twin/casemate"
        }
      },
      "protection": {
        "belt_mm": 150,
        "deck_mm": 65
      },
      "complement": 892,
      "design_year": 1905,
      "hulls_aggregate": {
        "count": 2,
        "status": "active",
        "notes": "Last French armored cruisers; training and colonial service."
      }
    }
  },
  "duguay_trouin": {
    "id": "duguay_trouin",
    "nation": "FRA",
    "name": "Duguay-Trouin class",
    "type": "CL",
    "category": "auxiliary_combatant",
    "tons": 7250,
    "cost": 3480,
    "year": 1920,
    "durability": 604,
    "speed": 33,
    "range": 8334,
    "shp": 100000,
    "caliber": 154.93999999999997,
    "barrels": 8,
    "tubes": 12,
    "torpedoRange": 8,
    "belt": 20,
    "deck": 20,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 578,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "duguay_trouin",
      "name": "Duguay-Trouin class",
      "nation": "FRA",
      "type": "CL",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 7250,
        "full_load_tons": 9350
      },
      "propulsion": {
        "speed_kn": 33,
        "shp": 100000,
        "range_nm": 4500,
        "range_at_kn": 15,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 8,
          "caliber_in": 6.1,
          "mounts": "4x2"
        },
        "torpedo_tubes": {
          "count": 12,
          "caliber_in": 21.7,
          "submerged": false
        }
      },
      "protection": {
        "belt_mm": 20,
        "deck_mm": 20
      },
      "complement": 578,
      "design_year": 1920,
      "notes": "First postwar French cruisers; laid down mid-1922. No hulls at scenario start."
    }
  },
  "arabe": {
    "id": "arabe",
    "nation": "FRA",
    "name": "Arabe class",
    "type": "DD",
    "category": "auxiliary_combatant",
    "tons": 690,
    "cost": 331,
    "year": 1916,
    "durability": 58,
    "speed": 33,
    "range": 3704,
    "shp": 17500,
    "caliber": 119.38,
    "barrels": 3,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 82,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "arabe",
      "name": "Arabe class",
      "nation": "FRA",
      "type": "DD",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 690,
        "full_load_tons": 850
      },
      "propulsion": {
        "speed_kn": 33,
        "shp": 17500,
        "range_nm": 2000,
        "range_at_kn": 14,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 3,
          "caliber_in": 4.7,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 4,
          "caliber_in": 17.7,
          "submerged": false
        }
      },
      "complement": 82,
      "design_year": 1916,
      "hulls_aggregate": {
        "count": 12,
        "status": "active",
        "notes": "Japanese-built (Kaba derivative); plus assorted war-era 800t boats and ex-German prizes."
      }
    }
  },
  "chacal": {
    "id": "chacal",
    "nation": "FRA",
    "name": "Chacal class (contre-torpilleur)",
    "type": "DL",
    "category": "auxiliary_combatant",
    "tons": 2126,
    "cost": 1020,
    "year": 1922,
    "durability": 177,
    "speed": 35.5,
    "range": 5556,
    "shp": 50000,
    "caliber": 129.54,
    "barrels": 5,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 195,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "chacal",
      "name": "Chacal class (contre-torpilleur)",
      "nation": "FRA",
      "type": "DL",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 2126,
        "full_load_tons": 3000
      },
      "propulsion": {
        "speed_kn": 35.5,
        "shp": 50000,
        "range_nm": 3000,
        "range_at_kn": 15,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 5,
          "caliber_in": 5.1,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 6,
          "caliber_in": 21.7,
          "submerged": false
        }
      },
      "complement": 195,
      "design_year": 1922,
      "notes": "1922 program super-destroyer — France's answer to treaty limits on capital tonnage. No hulls at scenario start."
    }
  },
  "lagrange": {
    "id": "lagrange",
    "nation": "FRA",
    "name": "Lagrange class",
    "type": "SS",
    "category": "auxiliary_combatant",
    "tons": 920,
    "cost": 442,
    "year": 1913,
    "durability": 77,
    "speed": 16.5,
    "range": 7963.6,
    "shp": 0,
    "caliber": 76.19999999999999,
    "barrels": 2,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 47,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "lagrange",
      "name": "Lagrange class",
      "nation": "FRA",
      "type": "SS",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 920,
        "full_load_tons": 1318
      },
      "propulsion": {
        "speed_kn": 16.5,
        "range_nm": 4300,
        "range_at_kn": 10,
        "fuel": "diesel"
      },
      "armament": {
        "main_battery": {
          "count": 2,
          "caliber_in": 3,
          "mounts": "deck"
        },
        "torpedo_tubes": {
          "count": 8,
          "caliber_in": 17.7,
          "submerged": true
        }
      },
      "complement": 47,
      "design_year": 1913,
      "hulls_aggregate": {
        "count": 4,
        "status": "active",
        "notes": "Plus assorted war-era boats; France refused sub limits at Washington — sub fleet is a strategic lever."
      }
    }
  },
  "requin": {
    "id": "requin",
    "nation": "FRA",
    "name": "Requin class",
    "type": "SS",
    "category": "auxiliary_combatant",
    "tons": 1150,
    "cost": 552,
    "year": 1922,
    "durability": 96,
    "speed": 15,
    "range": 14260.400000000001,
    "shp": 0,
    "caliber": 99.05999999999999,
    "barrels": 1,
    "tubes": 10,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 54,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "requin",
      "name": "Requin class",
      "nation": "FRA",
      "type": "SS",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 1150,
        "full_load_tons": 1441
      },
      "propulsion": {
        "speed_kn": 15,
        "range_nm": 7700,
        "range_at_kn": 9,
        "fuel": "diesel"
      },
      "armament": {
        "main_battery": {
          "count": 1,
          "caliber_in": 3.9,
          "mounts": "deck"
        },
        "torpedo_tubes": {
          "count": 10,
          "caliber_in": 21.7,
          "submerged": true
        }
      },
      "complement": 54,
      "design_year": 1922,
      "notes": "1922 program ocean-going boats. No hulls at scenario start."
    }
  },
  "fr_depot_1922": {
    "id": "fr_depot_1922",
    "nation": "FRA",
    "name": "Fleet depot · 1922",
    "type": "AD",
    "category": "other",
    "tons": 5500,
    "cost": 3400,
    "year": 1922,
    "durability": 458,
    "speed": 14,
    "range": 16668,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 300,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "fr_depot_1922",
      "nation": "FRA",
      "name": "Fleet depot · 1922",
      "type": "AD",
      "design_year": 1922,
      "displacement": {
        "standard_tons": 5500,
        "full_load_tons": 8000
      },
      "propulsion": {
        "speed_kn": 14,
        "range_nm": 9000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 2
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 7.7,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 300,
      "cost_gold": 3400,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1931,
    "notes": "Provisional 1922 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "fr_oiler_1922": {
    "id": "fr_oiler_1922",
    "nation": "FRA",
    "name": "Fleet oiler · 1922",
    "type": "AO",
    "category": "other",
    "tons": 6500,
    "cost": 2800,
    "year": 1922,
    "durability": 542,
    "speed": 14,
    "range": 16668,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 160,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "fr_oiler_1922",
      "nation": "FRA",
      "name": "Fleet oiler · 1922",
      "type": "AO",
      "design_year": 1922,
      "displacement": {
        "standard_tons": 6500,
        "full_load_tons": 13500
      },
      "propulsion": {
        "speed_kn": 14,
        "range_nm": 9000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 2
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 7.7,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 160,
      "cost_gold": 2800,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1931,
    "notes": "Provisional 1922 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "dante_alighieri": {
    "id": "dante_alighieri",
    "nation": "ITA",
    "name": "Dante Alighieri",
    "type": "BB",
    "category": "capital_ship",
    "tons": 19500,
    "cost": 9360,
    "year": 1909,
    "durability": 1625,
    "speed": 22,
    "range": 8889.6,
    "shp": 32000,
    "caliber": 304.79999999999995,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 254,
    "deck": 38,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 981,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "dante_alighieri",
      "name": "Dante Alighieri",
      "nation": "ITA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "dreadnought",
      "displacement": {
        "standard_tons": 19500,
        "full_load_tons": 21600
      },
      "propulsion": {
        "speed_kn": 22,
        "shp": 32000,
        "range_nm": 4800,
        "range_at_kn": 10,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 12,
          "caliber_in": 12,
          "mounts": "4x3",
          "notes": "First triple turrets on any dreadnought"
        },
        "secondary_battery": [
          {
            "count": 20,
            "caliber_in": 4.7,
            "mounts": "casemate/turret"
          }
        ]
      },
      "protection": {
        "belt_mm": 254,
        "deck_mm": 38,
        "turret_mm": 254,
        "torpedo_defense": 0
      },
      "complement": 981,
      "design_year": 1909
    }
  },
  "conte_di_cavour": {
    "id": "conte_di_cavour",
    "nation": "ITA",
    "name": "Conte di Cavour class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 22990,
    "cost": 11035,
    "year": 1910,
    "durability": 1916,
    "speed": 21.5,
    "range": 8889.6,
    "shp": 31000,
    "caliber": 304.79999999999995,
    "barrels": 13,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 250,
    "deck": 40,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1000,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "conte_di_cavour",
      "name": "Conte di Cavour class",
      "nation": "ITA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "dreadnought",
      "displacement": {
        "standard_tons": 22990,
        "full_load_tons": 24250
      },
      "propulsion": {
        "speed_kn": 21.5,
        "shp": 31000,
        "range_nm": 4800,
        "range_at_kn": 10,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 13,
          "caliber_in": 12,
          "mounts": "3x3+2x2"
        },
        "secondary_battery": [
          {
            "count": 18,
            "caliber_in": 4.7,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 250,
        "deck_mm": 40,
        "turret_mm": 280,
        "torpedo_defense": 0
      },
      "complement": 1000,
      "design_year": 1910,
      "notes": "Leonardo da Vinci lost 1916 (magazine explosion), salvaged, sold 1923. Historic 1930s total-rebuild candidates."
    }
  },
  "andrea_doria": {
    "id": "andrea_doria",
    "nation": "ITA",
    "name": "Andrea Doria class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 22960,
    "cost": 11021,
    "year": 1912,
    "durability": 1913,
    "speed": 21,
    "range": 8889.6,
    "shp": 30000,
    "caliber": 304.79999999999995,
    "barrels": 13,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 250,
    "deck": 40,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1000,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "andrea_doria",
      "name": "Andrea Doria class",
      "nation": "ITA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "dreadnought",
      "displacement": {
        "standard_tons": 22960,
        "full_load_tons": 24730
      },
      "propulsion": {
        "speed_kn": 21,
        "shp": 30000,
        "range_nm": 4800,
        "range_at_kn": 10,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 13,
          "caliber_in": 12,
          "mounts": "3x3+2x2"
        },
        "secondary_battery": [
          {
            "count": 16,
            "caliber_in": 6,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 250,
        "deck_mm": 40,
        "turret_mm": 280,
        "torpedo_defense": 0
      },
      "complement": 1000,
      "design_year": 1912
    }
  },
  "caracciolo": {
    "id": "caracciolo",
    "nation": "ITA",
    "name": "Francesco Caracciolo class (suspended)",
    "type": "BB",
    "category": "capital_ship",
    "tons": 31400,
    "cost": 15072,
    "year": 1914,
    "durability": 2617,
    "speed": 28,
    "range": 14816,
    "shp": 105000,
    "caliber": 381,
    "barrels": 8,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 303,
    "deck": 50,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1250,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "caracciolo",
      "name": "Francesco Caracciolo class (suspended)",
      "nation": "ITA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "displacement": {
        "standard_tons": 31400,
        "full_load_tons": 34000
      },
      "propulsion": {
        "speed_kn": 28,
        "shp": 105000,
        "range_nm": 8000,
        "range_at_kn": 10,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 8,
          "caliber_in": 15,
          "mounts": "4x2"
        },
        "secondary_battery": [
          {
            "count": 12,
            "caliber_in": 6,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 303,
        "deck_mm": 50,
        "turret_mm": 400,
        "torpedo_defense": 1
      },
      "complement": 1250,
      "design_year": 1914,
      "notes": "Italy's canceled fast battleship; lead hull launched 1920 to clear the slip. Carrier-conversion proposals existed — an alt-history fork."
    }
  },
  "san_giorgio": {
    "id": "san_giorgio",
    "nation": "ITA",
    "name": "San Giorgio class",
    "type": "CA",
    "category": "auxiliary_combatant",
    "tons": 9470,
    "cost": 4546,
    "year": 1905,
    "durability": 789,
    "speed": 23,
    "range": 11612.04,
    "shp": 18000,
    "caliber": 254,
    "barrels": 4,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 200,
    "deck": 45,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 698,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "san_giorgio",
      "name": "San Giorgio class",
      "nation": "ITA",
      "type": "CA",
      "treaty_category": "auxiliary_combatant",
      "generation": "pre_dreadnought",
      "displacement": {
        "standard_tons": 9470,
        "full_load_tons": 11300
      },
      "propulsion": {
        "speed_kn": 23,
        "shp": 18000,
        "range_nm": 6270,
        "range_at_kn": 10,
        "fuel": "coal"
      },
      "armament": {
        "main_battery": {
          "count": 4,
          "caliber_in": 10,
          "mounts": "2x2"
        },
        "secondary_battery": [
          {
            "count": 8,
            "caliber_in": 7.5,
            "mounts": "4x2"
          }
        ]
      },
      "protection": {
        "belt_mm": 200,
        "deck_mm": 45
      },
      "complement": 698,
      "design_year": 1905,
      "hulls_aggregate": {
        "count": 2,
        "status": "active",
        "notes": "San Giorgio, San Marco — last Italian armored cruisers."
      }
    }
  },
  "quarto": {
    "id": "quarto",
    "nation": "ITA",
    "name": "Quarto / Bixio scouts",
    "type": "CL",
    "category": "auxiliary_combatant",
    "tons": 3271,
    "cost": 1570,
    "year": 1909,
    "durability": 273,
    "speed": 28,
    "range": 4259.6,
    "shp": 25000,
    "caliber": 119.38,
    "barrels": 6,
    "tubes": 2,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 38,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 247,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "quarto",
      "name": "Quarto / Bixio scouts",
      "nation": "ITA",
      "type": "CL",
      "treaty_category": "auxiliary_combatant",
      "generation": "scout_cruiser",
      "displacement": {
        "standard_tons": 3271,
        "full_load_tons": 3830
      },
      "propulsion": {
        "speed_kn": 28,
        "shp": 25000,
        "range_nm": 2300,
        "range_at_kn": 15,
        "fuel": "mixed"
      },
      "armament": {
        "main_battery": {
          "count": 6,
          "caliber_in": 4.7,
          "mounts": "single"
        },
        "torpedo_tubes": {
          "count": 2,
          "caliber_in": 17.7,
          "submerged": false
        }
      },
      "protection": {
        "deck_mm": 38
      },
      "complement": 247,
      "design_year": 1909,
      "hulls_aggregate": {
        "count": 3,
        "status": "mixed",
        "notes": "Quarto plus Bixio pair; plus ex-German/Austrian war-prize cruisers in evaluation."
      }
    }
  },
  "leone": {
    "id": "leone",
    "nation": "ITA",
    "name": "Leone class (esploratori)",
    "type": "DL",
    "category": "auxiliary_combatant",
    "tons": 1743,
    "cost": 837,
    "year": 1917,
    "durability": 145,
    "speed": 33,
    "range": 3833.6400000000003,
    "shp": 42000,
    "caliber": 119.38,
    "barrels": 8,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 204,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "leone",
      "name": "Leone class (esploratori)",
      "nation": "ITA",
      "type": "DL",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 1743,
        "full_load_tons": 2289
      },
      "propulsion": {
        "speed_kn": 33,
        "shp": 42000,
        "range_nm": 2070,
        "range_at_kn": 15,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 8,
          "caliber_in": 4.7,
          "mounts": "4x2"
        },
        "torpedo_tubes": {
          "count": 6,
          "caliber_in": 17.7,
          "submerged": false
        }
      },
      "complement": 204,
      "design_year": 1917,
      "hulls_aggregate": {
        "count": 3,
        "status": "building",
        "notes": "Leone, Pantera, Tigre — completing 1923-24."
      }
    }
  },
  "curtatone": {
    "id": "curtatone",
    "nation": "ITA",
    "name": "Curtatone class",
    "type": "DD",
    "category": "auxiliary_combatant",
    "tons": 953,
    "cost": 457,
    "year": 1917,
    "durability": 79,
    "speed": 32,
    "range": 3333.6000000000004,
    "shp": 22000,
    "caliber": 101.6,
    "barrels": 4,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 117,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "curtatone",
      "name": "Curtatone class",
      "nation": "ITA",
      "type": "DD",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 953,
        "full_load_tons": 1214
      },
      "propulsion": {
        "speed_kn": 32,
        "shp": 22000,
        "range_nm": 1800,
        "range_at_kn": 15,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 4,
          "caliber_in": 4,
          "mounts": "2x2"
        },
        "torpedo_tubes": {
          "count": 6,
          "caliber_in": 17.7,
          "submerged": false
        }
      },
      "complement": 117,
      "design_year": 1917,
      "hulls_aggregate": {
        "count": 4,
        "status": "mixed",
        "notes": "Completing 1922-23."
      }
    }
  },
  "palestro": {
    "id": "palestro",
    "nation": "ITA",
    "name": "Palestro class",
    "type": "DD",
    "category": "auxiliary_combatant",
    "tons": 875,
    "cost": 420,
    "year": 1917,
    "durability": 73,
    "speed": 32,
    "range": 3648.44,
    "shp": 22000,
    "caliber": 101.6,
    "barrels": 4,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 106,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "palestro",
      "name": "Palestro class",
      "nation": "ITA",
      "type": "DD",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 875,
        "full_load_tons": 1180
      },
      "propulsion": {
        "speed_kn": 32,
        "shp": 22000,
        "range_nm": 1970,
        "range_at_kn": 15,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 4,
          "caliber_in": 4,
          "mounts": "2x2"
        },
        "torpedo_tubes": {
          "count": 4,
          "caliber_in": 17.7,
          "submerged": false
        }
      },
      "complement": 106,
      "design_year": 1917,
      "hulls_aggregate": {
        "count": 4,
        "status": "active",
        "notes": "Plus numerous war-era 3-funnel boats reclassified torpedo boats."
      }
    }
  },
  "provana": {
    "id": "provana",
    "nation": "ITA",
    "name": "Provana class",
    "type": "SS",
    "category": "auxiliary_combatant",
    "tons": 762,
    "cost": 366,
    "year": 1915,
    "durability": 64,
    "speed": 16,
    "range": 3889.2000000000003,
    "shp": 0,
    "caliber": 76.19999999999999,
    "barrels": 2,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 40,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "provana",
      "name": "Provana class",
      "nation": "ITA",
      "type": "SS",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 762,
        "full_load_tons": 924
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 2100,
        "range_at_kn": 10,
        "fuel": "diesel"
      },
      "armament": {
        "main_battery": {
          "count": 2,
          "caliber_in": 3,
          "mounts": "deck"
        },
        "torpedo_tubes": {
          "count": 6,
          "caliber_in": 17.7,
          "submerged": true
        }
      },
      "complement": 40,
      "design_year": 1915,
      "hulls_aggregate": {
        "count": 3,
        "status": "mixed",
        "notes": "Approximate; plus small war-era coastal boats. Provana herself lost 1918."
      }
    }
  },
  "it_depot_1922": {
    "id": "it_depot_1922",
    "nation": "ITA",
    "name": "Fleet depot · 1922",
    "type": "AD",
    "category": "other",
    "tons": 5500,
    "cost": 3400,
    "year": 1922,
    "durability": 458,
    "speed": 14,
    "range": 16668,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 300,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "it_depot_1922",
      "nation": "ITA",
      "name": "Fleet depot · 1922",
      "type": "AD",
      "design_year": 1922,
      "displacement": {
        "standard_tons": 5500,
        "full_load_tons": 8000
      },
      "propulsion": {
        "speed_kn": 14,
        "range_nm": 9000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 2
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 7.7,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 300,
      "cost_gold": 3400,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1931,
    "notes": "Provisional 1922 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "it_oiler_1922": {
    "id": "it_oiler_1922",
    "nation": "ITA",
    "name": "Fleet oiler · 1922",
    "type": "AO",
    "category": "other",
    "tons": 6500,
    "cost": 2800,
    "year": 1922,
    "durability": 542,
    "speed": 14,
    "range": 16668,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 160,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "it_oiler_1922",
      "nation": "ITA",
      "name": "Fleet oiler · 1922",
      "type": "AO",
      "design_year": 1922,
      "displacement": {
        "standard_tons": 6500,
        "full_load_tons": 13500
      },
      "propulsion": {
        "speed_kn": 14,
        "range_nm": 9000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 2
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 7.7,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 160,
      "cost_gold": 2800,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1931,
    "notes": "Provisional 1922 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "sevastopol_1914": {
    "id": "sevastopol_1914",
    "nation": "SOV",
    "name": "Sevastopol class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 23000,
    "cost": 11040,
    "year": 1909,
    "durability": 1917,
    "speed": 23,
    "range": 11112,
    "shp": 0,
    "caliber": 305,
    "barrels": 12,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 225,
    "deck": 56,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 806,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "sevastopol_1914",
      "nation": "SOV",
      "name": "Sevastopol class",
      "type": "BB",
      "design_year": 1909,
      "displacement": {
        "standard_tons": 23000
      },
      "propulsion": {
        "speed_kn": 23,
        "range_nm": 6000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 305,
          "count": 12
        },
        "torpedo_tubes": {
          "count": 4
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 225,
        "deck_mm": 56
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 806,
      "cost_gold": 11040,
      "treaty_category": "capital_ship",
      "sensors": []
    }
  },
  "svetlana_1913": {
    "id": "svetlana_1913",
    "nation": "SOV",
    "name": "Svetlana class",
    "type": "CL",
    "category": "other",
    "tons": 6800,
    "cost": 3264,
    "year": 1913,
    "durability": 567,
    "speed": 29,
    "range": 11112,
    "shp": 0,
    "caliber": 130,
    "barrels": 15,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 75,
    "deck": 19,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 239,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "svetlana_1913",
      "nation": "SOV",
      "name": "Svetlana class",
      "type": "CL",
      "design_year": 1913,
      "displacement": {
        "standard_tons": 6800
      },
      "propulsion": {
        "speed_kn": 29,
        "range_nm": 6000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 130,
          "count": 15
        },
        "torpedo_tubes": {
          "count": 4
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 75,
        "deck_mm": 19
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 239,
      "cost_gold": 3264,
      "treaty_category": "other",
      "sensors": []
    }
  },
  "novik_series": {
    "id": "novik_series",
    "nation": "SOV",
    "name": "Novik type destroyer",
    "type": "DD",
    "category": "other",
    "tons": 1300,
    "cost": 624,
    "year": 1913,
    "durability": 108,
    "speed": 32,
    "range": 4074.4,
    "shp": 0,
    "caliber": 102,
    "barrels": 4,
    "tubes": 9,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 98,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "novik_series",
      "nation": "SOV",
      "name": "Novik type destroyer",
      "type": "DD",
      "design_year": 1913,
      "displacement": {
        "standard_tons": 1300
      },
      "propulsion": {
        "speed_kn": 32,
        "range_nm": 2200
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 102,
          "count": 4
        },
        "torpedo_tubes": {
          "count": 9
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 98,
      "cost_gold": 624,
      "treaty_category": "other",
      "sensors": []
    }
  },
  "bars_1915": {
    "id": "bars_1915",
    "nation": "SOV",
    "name": "Bars class submarine",
    "type": "SS",
    "category": "other",
    "tons": 650,
    "cost": 312,
    "year": 1912,
    "durability": 54,
    "speed": 18,
    "range": 6482,
    "shp": 0,
    "caliber": 75,
    "barrels": 1,
    "tubes": 4,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 33,
    "submergedSpeed": 8,
    "provisioned": 0,
    "raw": {
      "id": "bars_1915",
      "nation": "SOV",
      "name": "Bars class submarine",
      "type": "SS",
      "design_year": 1912,
      "displacement": {
        "standard_tons": 650
      },
      "propulsion": {
        "speed_kn": 18,
        "range_nm": 3500
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 75,
          "count": 1
        },
        "torpedo_tubes": {
          "count": 4
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 33,
      "cost_gold": 312,
      "treaty_category": "other",
      "speed_submerged": {
        "surfaced_kn": 18,
        "sprint_kn": 8
      },
      "sensors": []
    }
  },
  "aurora_1903": {
    "id": "aurora_1903",
    "nation": "SOV",
    "name": "Pallada class (Aurora)",
    "type": "CL",
    "category": "other",
    "tons": 6731,
    "cost": 3231,
    "year": 1897,
    "durability": 561,
    "speed": 19,
    "range": 11112,
    "shp": 0,
    "caliber": 152,
    "barrels": 8,
    "tubes": 3,
    "torpedoRange": 8,
    "belt": 38,
    "deck": 10,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 236,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "aurora_1903",
      "nation": "SOV",
      "name": "Pallada class (Aurora)",
      "type": "CL",
      "design_year": 1897,
      "displacement": {
        "standard_tons": 6731
      },
      "propulsion": {
        "speed_kn": 19,
        "range_nm": 6000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 152,
          "count": 8
        },
        "torpedo_tubes": {
          "count": 3
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 38,
        "deck_mm": 10
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 236,
      "cost_gold": 3231,
      "treaty_category": "other",
      "sensors": []
    }
  },
  "su_depot_1922": {
    "id": "su_depot_1922",
    "nation": "SOV",
    "name": "Fleet depot · 1922",
    "type": "AD",
    "category": "other",
    "tons": 5500,
    "cost": 3400,
    "year": 1922,
    "durability": 458,
    "speed": 14,
    "range": 16668,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 300,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "su_depot_1922",
      "nation": "SOV",
      "name": "Fleet depot · 1922",
      "type": "AD",
      "design_year": 1922,
      "displacement": {
        "standard_tons": 5500,
        "full_load_tons": 8000
      },
      "propulsion": {
        "speed_kn": 14,
        "range_nm": 9000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 2
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 7.7,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 300,
      "cost_gold": 3400,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1931,
    "notes": "Provisional 1922 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "su_oiler_1922": {
    "id": "su_oiler_1922",
    "nation": "SOV",
    "name": "Fleet oiler · 1922",
    "type": "AO",
    "category": "other",
    "tons": 6500,
    "cost": 2800,
    "year": 1922,
    "durability": 542,
    "speed": 14,
    "range": 16668,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 160,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "su_oiler_1922",
      "nation": "SOV",
      "name": "Fleet oiler · 1922",
      "type": "AO",
      "design_year": 1922,
      "displacement": {
        "standard_tons": 6500,
        "full_load_tons": 13500
      },
      "propulsion": {
        "speed_kn": 14,
        "range_nm": 9000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 2
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 7.7,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 0,
        "deck_mm": 0
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 160,
      "cost_gold": 2800,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1931,
    "notes": "Provisional 1922 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  }
}
```
