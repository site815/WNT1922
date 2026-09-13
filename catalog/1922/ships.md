# The Treaty System — ship classes

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
{
  "renown": {
    "id": "renown",
    "nation": "GBR",
    "name": "Renown class",
    "type": "BC",
    "category": "capital_ship",
    "tons": 27650,
    "cost": 13272,
    "year": 1914,
    "durability": 2304,
    "speed": 31.5,
    "range": 8704.4,
    "shp": 112000,
    "caliber": 381,
    "barrels": 6,
    "tubes": 2,
    "torpedoRange": 8,
    "belt": 152,
    "deck": 51,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 967,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "renown",
      "name": "Renown class",
      "nation": "GBR",
      "type": "BC",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "displacement": {
        "standard_tons": 27650,
        "full_load_tons": 32000
      },
      "propulsion": {
        "speed_kn": 31.5,
        "shp": 112000,
        "range_nm": 4700,
        "range_at_kn": 12,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 6,
          "caliber_in": 15,
          "mounts": "3x2"
        },
        "secondary_battery": [
          {
            "count": 17,
            "caliber_in": 4,
            "mounts": "triple/single"
          }
        ],
        "torpedo_tubes": {
          "count": 2,
          "caliber_in": 21,
          "submerged": true
        }
      },
      "protection": {
        "belt_mm": 152,
        "deck_mm": 51,
        "turret_mm": 279,
        "ct_mm": 254,
        "torpedo_defense": 1
      },
      "complement": 967,
      "design_year": 1914,
      "notes": "Thin belt as designed; Repulse received 9-inch belt in 1918-21 refit."
    }
  },
  "admiral": {
    "id": "admiral",
    "nation": "GBR",
    "name": "Admiral class",
    "type": "BC",
    "category": "capital_ship",
    "tons": 41200,
    "cost": 19776,
    "year": 1916,
    "durability": 3433,
    "speed": 31,
    "range": 13890,
    "shp": 144000,
    "caliber": 381,
    "barrels": 8,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 305,
    "deck": 51,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1433,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "admiral",
      "name": "Admiral class",
      "nation": "GBR",
      "type": "BC",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "displacement": {
        "standard_tons": 41200,
        "full_load_tons": 45200
      },
      "dimensions": {
        "length_m": 262.1,
        "beam_m": 31.8,
        "draft_m": 9.9
      },
      "propulsion": {
        "speed_kn": 31,
        "shp": 144000,
        "range_nm": 7500,
        "range_at_kn": 14,
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
            "caliber_in": 5.5,
            "mounts": "single"
          }
        ],
        "torpedo_tubes": {
          "count": 6,
          "caliber_in": 21,
          "submerged": false
        }
      },
      "protection": {
        "belt_mm": 305,
        "deck_mm": 51,
        "turret_mm": 381,
        "ct_mm": 280,
        "torpedo_defense": 2
      },
      "complement": 1433,
      "design_year": 1916,
      "notes": "HMS Hood — largest warship afloat in 1922; deck protection is the known weakness."
    }
  },
  "furious": {
    "id": "furious",
    "nation": "GBR",
    "name": "Furious (as reconstructed)",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 22450,
    "cost": 10776,
    "year": 1921,
    "durability": 1871,
    "speed": 30,
    "range": 7963.6,
    "shp": 90000,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 36,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 795,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "furious",
      "name": "Furious (as reconstructed)",
      "nation": "GBR",
      "type": "CV",
      "treaty_category": "aircraft_carrier",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 22450,
        "full_load_tons": 26500
      },
      "propulsion": {
        "speed_kn": 30,
        "shp": 90000,
        "range_nm": 4300,
        "range_at_kn": 16,
        "fuel": "oil"
      },
      "aviation": {
        "aircraft_capacity": 36,
        "flight_deck": true
      },
      "complement": 795,
      "design_year": 1921,
      "notes": "Stats are the post-1925 full flush-deck reconstruction; hull is mid-conversion at scenario start."
    }
  },
  "courageous_llc": {
    "id": "courageous_llc",
    "nation": "GBR",
    "name": "Courageous class (large light cruiser)",
    "type": "BC",
    "category": "capital_ship",
    "tons": 18600,
    "cost": 8928,
    "year": 1915,
    "durability": 1550,
    "speed": 32,
    "range": 11112,
    "shp": 90000,
    "caliber": 381,
    "barrels": 4,
    "tubes": 14,
    "torpedoRange": 8,
    "belt": 76,
    "deck": 45,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 828,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "courageous_llc",
      "name": "Courageous class (large light cruiser)",
      "nation": "GBR",
      "type": "BC",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "displacement": {
        "standard_tons": 18600,
        "full_load_tons": 22560
      },
      "propulsion": {
        "speed_kn": 32,
        "shp": 90000,
        "range_nm": 6000,
        "range_at_kn": 16,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 4,
          "caliber_in": 15,
          "mounts": "2x2"
        },
        "secondary_battery": [
          {
            "count": 18,
            "caliber_in": 4,
            "mounts": "6x3"
          }
        ],
        "torpedo_tubes": {
          "count": 14,
          "caliber_in": 21,
          "submerged": false
        }
      },
      "protection": {
        "belt_mm": 76,
        "deck_mm": 45,
        "turret_mm": 229,
        "torpedo_defense": 1
      },
      "complement": 828,
      "design_year": 1915,
      "notes": "Fisher's freaks — fast, huge, unarmored. Ideal carrier-conversion hulls under the 33,000-ton clause."
    }
  },
  "courageous_1922_cv": {
    "id": "courageous_1922_cv",
    "nation": "GBR",
    "name": "Courageous carrier conversion",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 22500,
    "cost": 10800,
    "year": 1922,
    "durability": 1875,
    "speed": 30,
    "range": 11112,
    "shp": 0,
    "caliber": 120,
    "barrels": 16,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 76,
    "deck": 19,
    "air": 48,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 884,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "courageous_1922_cv",
      "nation": "GBR",
      "name": "Courageous carrier conversion",
      "type": "CV",
      "design_year": 1922,
      "displacement": {
        "standard_tons": 22500
      },
      "propulsion": {
        "speed_kn": 30,
        "range_nm": 6000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 120,
          "count": 16
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 76,
        "deck_mm": 19
      },
      "aviation": {
        "aircraft_capacity": 48
      },
      "complement": 884,
      "cost_gold": 10800,
      "treaty_category": "aircraft_carrier",
      "sensors": []
    },
    "notes": "Historical conversion option; provisional fit and timing."
  },
  "new_mexico": {
    "id": "new_mexico",
    "nation": "USA",
    "name": "New Mexico class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 32000,
    "cost": 15360,
    "year": 1914,
    "durability": 2667,
    "speed": 21,
    "range": 14816,
    "shp": 32000,
    "caliber": 355.59999999999997,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 343,
    "deck": 89,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1084,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "new_mexico",
      "name": "New Mexico class",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 32000,
        "full_load_tons": 33000
      },
      "propulsion": {
        "speed_kn": 21,
        "shp": 32000,
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
        "deck_mm": 89,
        "turret_mm": 457,
        "torpedo_defense": 2
      },
      "complement": 1084,
      "design_year": 1914,
      "notes": "New Mexico: turbo-electric drive."
    }
  },
  "tennessee": {
    "id": "tennessee",
    "nation": "USA",
    "name": "Tennessee class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 32300,
    "cost": 15504,
    "year": 1915,
    "durability": 2692,
    "speed": 21,
    "range": 14816,
    "shp": 26800,
    "caliber": 355.59999999999997,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 343,
    "deck": 89,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1083,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "tennessee",
      "name": "Tennessee class",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 32300,
        "full_load_tons": 33190
      },
      "propulsion": {
        "speed_kn": 21,
        "shp": 26800,
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
        "deck_mm": 89,
        "turret_mm": 457,
        "torpedo_defense": 3
      },
      "complement": 1083,
      "design_year": 1915,
      "notes": "Turbo-electric; deep torpedo protection."
    }
  },
  "colorado": {
    "id": "colorado",
    "nation": "USA",
    "name": "Colorado class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 32600,
    "cost": 15648,
    "year": 1916,
    "durability": 2717,
    "speed": 21,
    "range": 14816,
    "shp": 28900,
    "caliber": 406.4,
    "barrels": 8,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 343,
    "deck": 89,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1080,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "colorado",
      "name": "Colorado class",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "super_dreadnought",
      "displacement": {
        "standard_tons": 32600,
        "full_load_tons": 33590
      },
      "propulsion": {
        "speed_kn": 21,
        "shp": 28900,
        "range_nm": 8000,
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
            "count": 12,
            "caliber_in": 5,
            "mounts": "casemate"
          }
        ]
      },
      "protection": {
        "belt_mm": 343,
        "deck_mm": 89,
        "turret_mm": 457,
        "torpedo_defense": 3
      },
      "complement": 1080,
      "design_year": 1916,
      "notes": "The US 'Big Five' 16-inch standard; treaty allows completing Colorado and West Virginia."
    }
  },
  "south_dakota_1920": {
    "id": "south_dakota_1920",
    "nation": "USA",
    "name": "South Dakota class (1920, canceled)",
    "type": "BB",
    "category": "capital_ship",
    "tons": 43200,
    "cost": 20736,
    "year": 1918,
    "durability": 3600,
    "speed": 23,
    "range": 14816,
    "shp": 60000,
    "caliber": 406.4,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 343,
    "deck": 89,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1191,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "south_dakota_1920",
      "name": "South Dakota class (1920, canceled)",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "displacement": {
        "standard_tons": 43200,
        "full_load_tons": 47000
      },
      "propulsion": {
        "speed_kn": 23,
        "shp": 60000,
        "range_nm": 8000,
        "range_at_kn": 10,
        "fuel": "oil"
      },
      "armament": {
        "main_battery": {
          "count": 12,
          "caliber_in": 16,
          "mounts": "4x3"
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
        "belt_mm": 343,
        "deck_mm": 89,
        "turret_mm": 457,
        "torpedo_defense": 3
      },
      "complement": 1191,
      "design_year": 1918,
      "notes": "All six on the slips at treaty signing; scrapped incomplete. The alt-history build if Washington collapses."
    }
  },
  "langley": {
    "id": "langley",
    "nation": "USA",
    "name": "Langley",
    "type": "CVL",
    "category": "aircraft_carrier",
    "tons": 11500,
    "cost": 5520,
    "year": 1920,
    "durability": 958,
    "speed": 15,
    "range": 6482,
    "shp": 7200,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 34,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 468,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "langley",
      "name": "Langley",
      "nation": "USA",
      "type": "CVL",
      "treaty_category": "aircraft_carrier",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 11500,
        "full_load_tons": 14100
      },
      "propulsion": {
        "speed_kn": 15,
        "shp": 7200,
        "range_nm": 3500,
        "range_at_kn": 10,
        "fuel": "oil"
      },
      "aviation": {
        "aircraft_capacity": 34,
        "catapults": 1,
        "flight_deck": true
      },
      "complement": 468,
      "design_year": 1920,
      "notes": "Converted collier Jupiter; the USN's floating aviation laboratory."
    }
  },
  "hosho": {
    "id": "hosho",
    "nation": "JPN",
    "name": "Hosho",
    "type": "CVL",
    "category": "aircraft_carrier",
    "tons": 7470,
    "cost": 3586,
    "year": 1919,
    "durability": 623,
    "speed": 25,
    "range": 16075.36,
    "shp": 30000,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 15,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 512,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "hosho",
      "name": "Hosho",
      "nation": "JPN",
      "type": "CVL",
      "treaty_category": "aircraft_carrier",
      "generation": "interwar",
      "displacement": {
        "standard_tons": 7470,
        "full_load_tons": 9494
      },
      "propulsion": {
        "speed_kn": 25,
        "shp": 30000,
        "range_nm": 8680,
        "range_at_kn": 12,
        "fuel": "mixed"
      },
      "aviation": {
        "aircraft_capacity": 15,
        "flight_deck": true
      },
      "complement": 512,
      "design_year": 1919,
      "notes": "First carrier in the world designed and completed as such (Dec 1922)."
    }
  }
}
```
