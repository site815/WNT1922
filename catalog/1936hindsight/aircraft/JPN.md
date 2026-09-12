# Japan — naval aircraft

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
[
  {
    "id": "hibari_t33",
    "name": "Hibari",
    "nation": "JPN",
    "designation": "Type 33",
    "type_year": 1933,
    "role": "light_multirole",
    "cost_gold": 10,
    "durability": 25,
    "powerplant": {
      "component": "jp33aeg",
      "count": 1,
      "takeoff_hp": 790
    },
    "dimensions": {
      "span_m": 13.2,
      "span_folded_m": 5.9,
      "length_m": 8.8,
      "wing_area_m2": 27.5,
      "hangar_footprint_m2": 52
    },
    "weights": {
      "empty_kg": 1420,
      "normal_kg": 1995,
      "max_kg": 2645,
      "max_alt_gear_kg": 2925
    },
    "crew": {
      "seats": 2,
      "normal": 1,
      "notes": "Flown solo on the short trades; the patrol, search and antisubmarine sorties are flown crewed, and the ferry-tank sortie may not be flown solo at all."
    },
    "performance": {
      "speed_kmh": {
        "at_2000m": 387,
        "with_store": 377,
        "sea_level": 372
      },
      "climb_ms": 12.2,
      "ceiling_m": 8955,
      "approach_kmh": 113
    },
    "fuel": {
      "internal_l": 375,
      "endurance_h": 8.6,
      "ferry_km": 1595,
      "combat_radius_km": 530,
      "with_tank": {
        "tank": "jp39tnk",
        "form": "650_form",
        "liters": 875,
        "ferry_km": 3230,
        "combat_radius_km": 1075,
        "endurance_h": 17
      }
    },
    "armament": [
      {
        "component": "jp29can",
        "mount": "aircraft twin, nose",
        "count": 1,
        "rounds": 320
      }
    ],
    "stations": [
      {
        "id": "centerline",
        "form": "650_bomb",
        "rating_kg": 675,
        "conformal": false,
        "alternatives": [
          {
            "component": "jp32bmb",
            "count": 1
          },
          {
            "component": "jp32dpc",
            "count": 4,
            "kit": "air kit"
          },
          {
            "component": "jp32min",
            "count": 1,
            "kit": "air kit"
          }
        ]
      }
    ],
    "equipment": [],
    "features": [
      "enclosed tandem canopy",
      "fleet-standard cockpit, controls and instruments",
      "centerline crutch",
      "fleet-beacon homing receiver and transponder"
    ],
    "protection": [],
    "kits": [
      "jp33flt"
    ],
    "possible_upgrades": [
      "jp43can",
      "jp42dpc",
      "jp44min"
    ],
    "notes": "Light multirole, one airframe and two undercarriages.",
    "basing": {
      "carrier": true,
      "floatplane": true,
      "land": true
    },
    "catalogKind": "naval"
  },
  {
    "id": "raiden_t39",
    "name": "Raiden",
    "nation": "JPN",
    "designation": "Type 39",
    "type_year": 1939,
    "role": "universal_multirole",
    "cost_gold": 26,
    "durability": 55,
    "powerplant": {
      "component": "jp39aeg",
      "count": 2,
      "takeoff_hp": 1020
    },
    "dimensions": {
      "span_m": 13.6,
      "span_folded_m": 5.7,
      "length_m": 9.6,
      "wing_area_m2": 27.8,
      "hangar_footprint_m2": 55
    },
    "weights": {
      "empty_kg": 3320,
      "normal_kg": 4670,
      "max_kg": 5970,
      "max_alt_gear_kg": 6590
    },
    "crew": {
      "seats": 1,
      "normal": 1
    },
    "performance": {
      "speed_kmh": {
        "clean_at_5800m": 601,
        "with_torpedo": 583,
        "sea_level": 523
      },
      "climb_ms": 16.4,
      "ceiling_m": 11230,
      "approach_kmh": 139
    },
    "fuel": {
      "internal_l": 1290,
      "endurance_h": 9.4,
      "ferry_km": 2590,
      "combat_radius_km": 860,
      "with_tank": {
        "tank": "jp39tnk",
        "form": "2 x 650-form recess ferry tanks",
        "liters": 2290,
        "ferry_km": 4115,
        "combat_radius_km": 1370,
        "endurance_h": 14.3
      }
    },
    "armament": [
      {
        "component": "jp29can",
        "mount": "aircraft twin, nose",
        "count": 1,
        "rounds": 320
      },
      {
        "component": "jp39rkt",
        "mount": "wing-root rails, semi-flush",
        "count": 6
      }
    ],
    "stations": [
      {
        "id": "centerline_bay",
        "form": "torpedo",
        "rating_kg": 1350,
        "conformal": true,
        "alternatives": [
          {
            "component": "jp33tor",
            "count": 1
          },
          {
            "component": "jp32bmb",
            "count": 2
          },
          {
            "component": "jp32dpc",
            "count": 8,
            "kit": "air kit"
          },
          {
            "component": "jp32min",
            "count": 2,
            "kit": "air kit"
          },
          {
            "component": "jp39tnk",
            "count": 2
          }
        ]
      }
    ],
    "equipment": [
      "jp39rad"
    ],
    "features": [
      "slats",
      "Fowler flaps",
      "open conformal bay",
      "bubble canopy",
      "cartridge-rail ejection seat",
      "fleet-beacon homing receiver and transponder",
      "handed reduction-and-propeller sets and feathering hubs, airframe-issued",
      "flush-riveted and aeroformed throughout, every gap sealed"
    ],
    "protection": [
      "armor glass",
      "8 mm seat plate",
      "8 mm head plate",
      "self-sealing tanks",
      "nacelle extinguishers"
    ],
    "kits": [
      "jp39flt"
    ],
    "possible_upgrades": [
      "jp43can",
      "jp44rkt",
      "jp45tor",
      "jp42dpc",
      "jp44min",
      "jp44rad",
      "jp48rad"
    ],
    "notes": "Universal multirole, one seat, two engines: fighter, strike, outer search and night intercept are loadout states of one airframe.",
    "basing": {
      "carrier": true,
      "floatplane": true,
      "land": true
    },
    "catalogKind": "naval"
  },
  {
    "id": "shinden_t44",
    "name": "Shinden",
    "nation": "JPN",
    "designation": "Type 44",
    "type_year": 1944,
    "role": "universal_multirole",
    "cost_gold": 38,
    "durability": 50,
    "powerplant": {
      "component": "jp44jet",
      "count": 1,
      "takeoff_kgf": 2450
    },
    "dimensions": {
      "span_m": 9.4,
      "span_folded_m": 6.6,
      "length_m": 10.6,
      "wing_area_m2": 18,
      "sweep_deg": 40,
      "hangar_footprint_m2": 70
    },
    "weights": {
      "empty_kg": 3730,
      "normal_kg": 5470,
      "max_kg": 6770
    },
    "crew": {
      "seats": 1,
      "normal": 1
    },
    "performance": {
      "speed_kmh": {
        "at_5000m": 1035,
        "with_torpedo": 1000,
        "at_10000m": 970,
        "sea_level": 1040
      },
      "mach_limit": 0.9,
      "climb_ms": 43,
      "ceiling_m": 14155,
      "approach_kmh": 210
    },
    "fuel": {
      "internal_l": 2000,
      "wet_wing": true,
      "endurance_h": 2.2,
      "ferry_km": 1950,
      "combat_radius_km": 650,
      "with_tank": {
        "tank": "jp39tnk",
        "form": "650_form",
        "liters": 3000,
        "ferry_km": 2760,
        "combat_radius_km": 920,
        "endurance_h": 3.1
      }
    },
    "armament": [
      {
        "component": "jp29can",
        "mount": "aircraft twin",
        "count": 1,
        "rounds": 320
      },
      {
        "component": "jp44rkt",
        "mount": "wing-root rails",
        "count": 12
      }
    ],
    "stations": [
      {
        "id": "centerline_recess",
        "form": "torpedo",
        "rating_kg": 1350,
        "conformal": true,
        "alternatives": [
          {
            "component": "jp33tor",
            "count": 1
          },
          {
            "component": "jp32bmb",
            "count": 2
          },
          {
            "component": "jp32dpc",
            "count": 8,
            "kit": "air kit"
          },
          {
            "component": "jp32min",
            "count": 2,
            "kit": "air kit"
          },
          {
            "component": "jp39tnk",
            "count": 2
          }
        ]
      }
    ],
    "equipment": [
      "jp44rad"
    ],
    "features": [
      "slats",
      "Fowler flaps",
      "flush speed brakes",
      "pressurized cockpit",
      "jet-rated cartridge ejection seat",
      "wet wing (the torsion box is the tank)",
      "fleet-beacon homing receiver and transponder"
    ],
    "protection": [
      "armor glass",
      "8 mm seat plate",
      "self-sealing tanks"
    ],
    "kits": [],
    "possible_upgrades": [
      "jp45tor",
      "jp42dpc",
      "jp44min",
      "jp48rad"
    ],
    "notes": "Same recess, same ordnance forms, same catapult rating, same cannon, same beacon net.",
    "basing": {
      "carrier": true,
      "floatplane": false,
      "land": true
    },
    "catalogKind": "naval"
  }
]
```
