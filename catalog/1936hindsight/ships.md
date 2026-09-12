# In Good Faith — ship classes

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
{
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
    "range": 16075,
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
  },
  "unryu_t32": {
    "id": "unryu_t32",
    "nation": "JPN",
    "name": "Unryū class",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 23990,
    "cost": 9900,
    "year": 1932,
    "durability": 2300,
    "speed": 30.5,
    "range": 25000,
    "shp": 90000,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 90,
    "aa": 24,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 960,
    "submergedSpeed": 0,
    "provisioned": 3,
    "raw": {
      "id": "unryu_t32",
      "name": "Unryū class",
      "nation": "JPN",
      "type": "CV",
      "treaty_category": "aircraft_carrier",
      "generation": "standardized",
      "design_year": 1932,
      "type_year": 1932,
      "cost_gold": 9900,
      "durability": 2300,
      "displacement": {
        "empty_tons": 22640,
        "standard_tons": 23990,
        "full_load_tons": 29390
      },
      "dimensions": {
        "length_m": 236,
        "beam_m": 28.5,
        "draft_m": 8.2
      },
      "machinery": {
        "bays": 30,
        "cruise_bank": 8,
        "drive": "diesel_electric",
        "swap": "~30 h alongside a tender in sheltered water",
        "fits": [
          {
            "component": "jp32eng",
            "shp": 90000,
            "speed_kn": 30.5,
            "range_km": 25000,
            "cruise_kn": 19.5
          },
          {
            "component": "jp42eng",
            "shp": 120000,
            "speed_kn": 33,
            "range_km": 28000,
            "cruise_kn": 21
          }
        ]
      },
      "fuel": {
        "diesel_tons": 3900,
        "avgas_tons": 1500
      },
      "aviation": {
        "flight_deck": true,
        "flight_deck_m": 242,
        "arresting_gear": true,
        "elevators": 3,
        "elevator_type": "deck_edge",
        "hangar_m2": 4700,
        "hangar_clear_m": 5,
        "deck_park_m2": 1200,
        "hangar_upper_cycle_deck_m2": 3800,
        "hangar_lower_workshop_deck_m2": 900
      },
      "batteries": [
        {
          "role": "light_aa",
          "component": "jp29can",
          "mounts": 12,
          "barrels_per_mount": 2,
          "rounds_per_gun": 9600,
          "firing_time_min": 40
        }
      ],
      "protection": {
        "features": [
          "avgas double-cofferdammed",
          "CO2 inerting",
          "split switchboards + casualty power",
          "subdivided spaces",
          "deck-edge elevators (a bomb cannot wedge them shut)"
        ]
      },
      "provisions": [
        {
          "interface": "cannon_position",
          "count": 12,
          "fitted": 12,
          "for": "jp29can",
          "state": "fitted",
          "notes": "FULL FITOUT: every gallery the hull was drawn with carries a mount. THE GALLERIES WERE WIRED FROM THE DRAWING, so the weight was reserved and filling them moved no displacement and no speed figure -- do not recompute either. She carried none as first drawn; that was the one place this navy's own standardization was not applied to its own capital ship, and it was corrected."
        },
        {
          "interface": "radar_search_position",
          "count": 2,
          "fitted": 0,
          "for": "jp41rad",
          "state": "wired",
          "notes": "Nineteen years of masts waiting for a set that did not exist."
        },
        {
          "interface": "armored_plot_compartment",
          "count": 1,
          "fitted": 0,
          "for": "jp41cic",
          "state": "wired",
          "notes": "A room built for a machine nobody could describe when the bulkheads went up."
        },
        {
          "interface": "catapult_foundation_bow",
          "count": 2,
          "fitted": 0,
          "state": "wired",
          "notes": "7.7 t foundations at the first frame; catapults are 1942 fittings, fleet-wide, at anchorage."
        },
        {
          "interface": "engine_bay",
          "count": 30,
          "fitted": 30,
          "state": "fitted"
        }
      ],
      "sensors": [
        "jp31bcn"
      ],
      "kits": [],
      "complement": 960,
      "possible_upgrades": [
        "jp43can",
        "jp41rad",
        "jp45rad",
        "jp41cic",
        "jp45cic"
      ],
      "notes": "A monoplane navy's capital ship. One class for the line's whole life."
    }
  },
  "maya_t29": {
    "id": "maya_t29",
    "nation": "JPN",
    "name": "Maya class",
    "type": "CL",
    "category": "auxiliary_combatant",
    "tons": 7540,
    "cost": 3300,
    "year": 1925,
    "durability": 780,
    "speed": 21.5,
    "range": 12000,
    "shp": 18000,
    "caliber": 140,
    "barrels": 18,
    "tubes": 12,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 25,
    "air": 0,
    "aa": 42,
    "scoutAircraft": 5,
    "sonar": false,
    "radar": false,
    "crew": 440,
    "submergedSpeed": 0,
    "provisioned": 4,
    "raw": {
      "id": "maya_t29",
      "name": "Maya class",
      "nation": "JPN",
      "type": "CL",
      "treaty_category": "auxiliary_combatant",
      "generation": "standardized",
      "design_year": 1925,
      "type_year": 1929,
      "cost_gold": 3300,
      "durability": 780,
      "displacement": {
        "empty_tons": 6770,
        "standard_tons": 7540,
        "full_load_tons": 10090
      },
      "dimensions": {
        "length_m": 172,
        "beam_m": 16.4,
        "draft_m": 5.8
      },
      "machinery": {
        "bays": 18,
        "cruise_bank": 5,
        "drive": "diesel_electric",
        "fits": [
          {
            "component": "jp22eng",
            "shp": 18000,
            "speed_kn": 21.5,
            "range_km": 12000,
            "cruise_kn": 14
          },
          {
            "component": "jp32eng",
            "shp": 54000,
            "speed_kn": 30.5,
            "range_km": 25000,
            "cruise_kn": 20
          },
          {
            "component": "jp42eng",
            "shp": 72000,
            "speed_kn": 32.5,
            "range_km": 28000,
            "cruise_kn": 21
          }
        ]
      },
      "fuel": {
        "diesel_tons": 2450,
        "avgas_tons": 100
      },
      "batteries": [
        {
          "role": "main",
          "component": "jp29gun",
          "mounts": 6,
          "barrels_per_mount": 3,
          "arrangement": "3 forward / 3 aft",
          "ammunition": "jp29shl",
          "rounds_per_gun": 400,
          "rounds_total": 7200,
          "firing_time_min": 50
        },
        {
          "role": "torpedo",
          "component": "jp25lau",
          "mounts": 3,
          "tubes": 12,
          "arrangement": "centerline",
          "ammunition": "jp24tor",
          "stowage": 36
        },
        {
          "role": "light_aa",
          "component": "jp29can",
          "mounts": 12,
          "barrels_per_mount": 2,
          "rounds_per_gun": 9600,
          "firing_time_min": 40
        }
      ],
      "aviation": {
        "catapults": 1,
        "catapult_rating_t": 7.7,
        "aircraft_capacity": 5,
        "catapult": "jp29cat"
      },
      "protection": {
        "box_mm": 60,
        "deck_mm": 25,
        "features": [
          "60 mm machinery/magazine box",
          "split switchboards + casualty power"
        ]
      },
      "provisions": [
        {
          "interface": "cannon_position",
          "count": 12,
          "fitted": 12,
          "for": "jp29can",
          "state": "fitted",
          "notes": "FULL FITOUT: every position the hull was drawn with carries a mount. THE WEIGHT WAS RESERVED IN THE 1923-26 DRAWING, so filling it moved no displacement and no speed figure -- do not recompute either."
        },
        {
          "interface": "radar_search_position",
          "count": 2,
          "fitted": 0,
          "for": "jp41rad",
          "state": "wired"
        },
        {
          "interface": "armored_plot_compartment",
          "count": 1,
          "fitted": 0,
          "for": "jp41cic",
          "state": "wired"
        },
        {
          "interface": "director_trunnion",
          "count": 1,
          "fitted": 0,
          "for": "jp30dir",
          "state": "wired"
        },
        {
          "interface": "barbette_ring",
          "count": 6,
          "fitted": 6,
          "state": "fitted",
          "notes": "Six rings, all filled at commissioning; the turret line had been in stock since 1925."
        },
        {
          "interface": "engine_bay",
          "count": 18,
          "fitted": 18,
          "state": "fitted"
        },
        {
          "interface": "mine_rail",
          "count": 1,
          "fitted": 1,
          "state": "fitted",
          "notes": "Stern rails, 80-mine capacity. Rails as launched; the Type 32 mine is three years away."
        },
        {
          "interface": "launcher_foundation",
          "count": 3,
          "fitted": 3,
          "state": "fitted"
        },
        {
          "interface": "magazine_14cm",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "beacon_net",
          "count": 1,
          "fitted": 0,
          "for": "jp31bcn",
          "state": "wired"
        }
      ],
      "complement": 440,
      "possible_upgrades": [
        "jp42gun",
        "jp42shl",
        "jp43can",
        "jp33tor",
        "jp45tor",
        "jp44lau",
        "jp32min",
        "jp44min",
        "jp30dir",
        "jp41dir",
        "jp45dir",
        "jp41rad",
        "jp45rad",
        "jp41cic",
        "jp45cic"
      ],
      "notes": "Fire control as launched is optical rangefinders. Deliberately unexceptional and deliberately everywhere; the fleet's arithmetic is written in her hull numbers. One class for the line's whole life: keels from 1935 rise on advanced panels as yard method, not as a new class. The catapult and the aviation crane share one 7.7 t rating -- sized in 1925 for a load nobody could then name; they work the Raiden's float kit. First keels 1927, first three hulls commissioning 1929 -- two years keel to commissioning, and she commissions with the automatic cannon fitted rather than wired -- the first ship in any navy to carry her light battery as designed. The line's four deferred years went into the yards with the carrier vote.",
      "sensors": []
    }
  },
  "kaze_t32": {
    "id": "kaze_t32",
    "nation": "JPN",
    "name": "Kaze class",
    "type": "DD",
    "category": "auxiliary_combatant",
    "tons": 2970,
    "cost": 1350,
    "year": 1932,
    "durability": 325,
    "speed": 35,
    "range": 25000,
    "shp": 54000,
    "caliber": 140,
    "barrels": 6,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 14,
    "scoutAircraft": 0,
    "sonar": true,
    "radar": false,
    "crew": 160,
    "submergedSpeed": 0,
    "provisioned": 3,
    "raw": {
      "id": "kaze_t32",
      "name": "Kaze class",
      "nation": "JPN",
      "type": "DD",
      "treaty_category": "auxiliary_combatant",
      "generation": "standardized",
      "design_year": 1932,
      "type_year": 1932,
      "cost_gold": 1350,
      "durability": 325,
      "displacement": {
        "empty_tons": 2660,
        "standard_tons": 2970,
        "full_load_tons": 4450
      },
      "dimensions": {
        "length_m": 122,
        "beam_m": 11.6,
        "draft_m": 3.9
      },
      "machinery": {
        "bays": 18,
        "cruise_bank": 3,
        "drive": "diesel_electric",
        "fits": [
          {
            "component": "jp32eng",
            "shp": 54000,
            "speed_kn": 35,
            "range_km": 25000,
            "cruise_kn": 19
          },
          {
            "component": "jp42eng",
            "shp": 72000,
            "speed_kn": 38,
            "range_km": 28000,
            "cruise_kn": 21
          }
        ]
      },
      "fuel": {
        "diesel_tons": 1480
      },
      "batteries": [
        {
          "role": "main",
          "component": "jp29gun",
          "mounts": 2,
          "barrels_per_mount": 3,
          "arrangement": "1 forward / 1 aft",
          "ammunition": "jp29shl",
          "rounds_per_gun": 400,
          "rounds_total": 2400,
          "firing_time_min": 50
        },
        {
          "role": "light_aa",
          "component": "jp29can",
          "mounts": 4,
          "barrels_per_mount": 2,
          "rounds_per_gun": 9600,
          "firing_time_min": 40
        },
        {
          "role": "torpedo",
          "component": "jp25lau",
          "mounts": 2,
          "tubes": 8,
          "arrangement": "centerline",
          "ammunition": "jp24tor",
          "stowage": 24
        },
        {
          "role": "mine",
          "component": "jp32min",
          "mounts": 1,
          "arrangement": "rails",
          "stowage": 40,
          "optional": true
        },
        {
          "role": "asw",
          "component": "jp32dpc",
          "mounts": 1,
          "stowage": 36
        }
      ],
      "protection": {
        "features": [
          "split switchboards + casualty power"
        ]
      },
      "provisions": [
        {
          "interface": "radar_search_position",
          "count": 1,
          "fitted": 0,
          "for": "jp41rad",
          "state": "wired"
        },
        {
          "interface": "rocket_rail",
          "count": 1,
          "fitted": 0,
          "for": "jp39rkt",
          "state": "wired"
        },
        {
          "interface": "engine_bay",
          "count": 18,
          "fitted": 18,
          "state": "fitted"
        },
        {
          "interface": "barbette_ring",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "cannon_position",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "launcher_foundation",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "mine_rail",
          "count": 1,
          "fitted": 0,
          "state": "foundation_only",
          "notes": "Rails, 40-mine capacity. Mines are an optional embarkation, not a fit."
        },
        {
          "interface": "depth_charge_rail",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "sonar_dome",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "director_trunnion",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "magazine_14cm",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        }
      ],
      "sensors": [
        "jp30dir",
        "jp31snr"
      ],
      "complement": 160,
      "possible_upgrades": [
        "jp42gun",
        "jp42shl",
        "jp43can",
        "jp33tor",
        "jp45tor",
        "jp44lau",
        "jp44min",
        "jp41dir",
        "jp45dir",
        "jp41rad",
        "jp45rad",
        "jp43snr",
        "jp42dpc",
        "jp39rkt",
        "jp44rkt"
      ],
      "notes": "Design opened 1929 and then deliberately waited: no keel until the second-generation cartridge and dual-purpose fire control were production facts. There has never been a Kaze teething file to close."
    }
  },
  "i_series_t33": {
    "id": "i_series_t33",
    "nation": "JPN",
    "name": "I-series",
    "type": "SS",
    "category": "auxiliary_combatant",
    "tons": 1600,
    "cost": 1400,
    "year": 1933,
    "durability": 170,
    "speed": 16,
    "range": 30000,
    "shp": 12000,
    "caliber": 0,
    "barrels": 0,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": true,
    "radar": false,
    "crew": 50,
    "submergedSpeed": 17,
    "provisioned": 1,
    "raw": {
      "id": "i_series_t33",
      "name": "I-series",
      "nation": "JPN",
      "type": "SS",
      "treaty_category": "auxiliary_combatant",
      "generation": "standardized",
      "design_year": 1933,
      "type_year": 1933,
      "cost_gold": 1400,
      "durability": 170,
      "displacement": {
        "empty_tons": 1510,
        "standard_tons": 1600,
        "full_load_tons": 2425,
        "submerged_tons": 2710
      },
      "dimensions": {
        "length_m": 89,
        "beam_m": 7.7,
        "draft_m": 4.4
      },
      "machinery": {
        "bays": 4,
        "cruise_bank": 1,
        "drive": "electric",
        "swap": "soft patch, yard evolution ~10 days",
        "fits": [
          {
            "component": "jp32eng",
            "shp": 12000,
            "motor_shp": 7500,
            "speed_kn": 16,
            "range_km": 30000,
            "cruise_kn": 11.5
          },
          {
            "component": "jp42eng",
            "shp": 16000,
            "motor_shp": 7500,
            "speed_kn": 16,
            "range_km": 33500,
            "cruise_kn": 11.5
          }
        ]
      },
      "speed_submerged": {
        "surfaced_kn": 16,
        "snort_kn": 10,
        "sprint_kn": 17,
        "sprint_h": 1.42,
        "patrol_kn": 8,
        "patrol_h": 12.5,
        "creep_kn": 3,
        "creep_h": 107,
        "battery": "tripled cells",
        "recharge_h": 2.5,
        "test_depth_m": 110
      },
      "fuel": {
        "diesel_tons": 820
      },
      "batteries": [
        {
          "role": "torpedo",
          "component": "jp33tor",
          "mounts": 8,
          "tubes": 8,
          "arrangement": "6 bow + 2 stern",
          "stowage": 32
        }
      ],
      "protection": {
        "features": [
          "split switchboards + casualty power",
          "flush casing, every fitting retracting or faired"
        ]
      },
      "provisions": [
        {
          "interface": "radar_search_position",
          "count": 1,
          "fitted": 0,
          "for": "jp41rad",
          "state": "wired",
          "notes": "A capped junction box for a set that exists in no navy on earth."
        },
        {
          "interface": "engine_bay",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "torpedo_tube_or_recess",
          "count": 8,
          "fitted": 8,
          "state": "fitted",
          "notes": "6 bow + 2 stern. No gun anywhere."
        },
        {
          "interface": "sonar_dome",
          "count": 1,
          "fitted": 1,
          "state": "fitted",
          "notes": "Hydrophone array."
        }
      ],
      "sensors": [
        "jp31snr"
      ],
      "complement": 50,
      "possible_upgrades": [
        "jp45tor",
        "jp41rad",
        "jp45rad",
        "jp43snr"
      ],
      "notes": "No gun anywhere: armament that assumes surfacing was struck from the requirement. Shaped for the water she fights in, not the surface she transits. SEVENTEEN KNOTS SUBMERGED IS A KNOT BETTER THAN SHE DOES ON THE SURFACE, and she holds it for an hour and a half: the cells came down with the hull and the sprint came down further, so the product went up."
    }
  },
  "shima_t32": {
    "id": "shima_t32",
    "nation": "JPN",
    "name": "Shima class",
    "type": "DE",
    "category": "auxiliary_combatant",
    "tons": 1220,
    "cost": 480,
    "year": 1932,
    "durability": 135,
    "speed": 25.5,
    "range": 25000,
    "shp": 12000,
    "caliber": 140,
    "barrels": 3,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 11,
    "scoutAircraft": 0,
    "sonar": true,
    "radar": false,
    "crew": 65,
    "submergedSpeed": 0,
    "provisioned": 3,
    "raw": {
      "id": "shima_t32",
      "name": "Shima class",
      "nation": "JPN",
      "type": "DE",
      "treaty_category": "auxiliary_combatant",
      "generation": "standardized",
      "design_year": 1932,
      "type_year": 1932,
      "cost_gold": 480,
      "durability": 135,
      "displacement": {
        "empty_tons": 1090,
        "standard_tons": 1220,
        "full_load_tons": 1810
      },
      "dimensions": {
        "length_m": 84,
        "beam_m": 9.6,
        "draft_m": 3
      },
      "machinery": {
        "bays": 4,
        "cruise_bank": 1,
        "drive": "diesel_electric",
        "fits": [
          {
            "component": "jp32eng",
            "shp": 12000,
            "speed_kn": 25.5,
            "range_km": 25000,
            "cruise_kn": 16
          },
          {
            "component": "jp42eng",
            "shp": 16000,
            "speed_kn": 28,
            "range_km": 28000,
            "cruise_kn": 17.5
          }
        ]
      },
      "fuel": {
        "diesel_tons": 590
      },
      "batteries": [
        {
          "role": "main",
          "component": "jp29gun",
          "mounts": 1,
          "barrels_per_mount": 3,
          "arrangement": "forward",
          "ammunition": "jp29shl",
          "rounds_per_gun": 400,
          "rounds_total": 1200,
          "firing_time_min": 50
        },
        {
          "role": "light_aa",
          "component": "jp29can",
          "mounts": 4,
          "barrels_per_mount": 2,
          "rounds_per_gun": 9600,
          "firing_time_min": 40
        },
        {
          "role": "asw",
          "component": "jp32dpc",
          "mounts": 1,
          "stowage": 60
        }
      ],
      "protection": {
        "features": [
          "split switchboards + casualty power"
        ]
      },
      "provisions": [
        {
          "interface": "radar_search_position",
          "count": 1,
          "fitted": 0,
          "for": "jp41rad",
          "state": "wired"
        },
        {
          "interface": "launcher_foundation",
          "count": 1,
          "fitted": 0,
          "for": "jp25lau",
          "state": "foundation_only",
          "notes": "Centerline quad-launcher foundation. It waits on the day doctrine calls the cover story's bluff."
        },
        {
          "interface": "rocket_rail",
          "count": 1,
          "fitted": 0,
          "for": "jp39rkt",
          "state": "wired"
        },
        {
          "interface": "engine_bay",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "barbette_ring",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "cannon_position",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "depth_charge_rail",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "sonar_dome",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "magazine_14cm",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        }
      ],
      "sensors": [
        "jp31snr"
      ],
      "complement": 65,
      "possible_upgrades": [
        "jp42gun",
        "jp42shl",
        "jp43can",
        "jp33tor",
        "jp45tor",
        "jp25lau",
        "jp44lau",
        "jp30dir",
        "jp41dir",
        "jp45dir",
        "jp41rad",
        "jp45rad",
        "jp43snr",
        "jp42dpc",
        "jp39rkt",
        "jp44rkt"
      ],
      "notes": "Laid down under the fisheries-protection line of the budget, a cover story chosen so the sonar school could put to sea in peacetime without a single question asked. Fire control as launched is optical sights. Minesweeping option."
    }
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
    "range": 14815,
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
    "range": 14815,
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
    "range": 14815,
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
    "name": "South Dakota class (1920, completed)",
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
    "range": 6480,
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
  "missouri_bb23": {
    "id": "missouri_bb23",
    "nation": "USA",
    "name": "Missouri class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 58000,
    "cost": 29000,
    "year": 1923,
    "durability": 6400,
    "speed": 25,
    "range": 16000,
    "shp": 109000,
    "caliber": 406,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 406,
    "deck": 152,
    "air": 0,
    "aa": 12,
    "scoutAircraft": 3,
    "sonar": false,
    "radar": false,
    "crew": 2650,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "missouri_bb23",
      "name": "Missouri class",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "design_year": 1923,
      "as_launched_year": 1928,
      "cost_gold": 29000,
      "durability": 6400,
      "displacement": {
        "empty_tons": 54300,
        "standard_tons": 58000,
        "full_load_tons": 66025
      },
      "dimensions": {
        "length_m": 262,
        "beam_m": 33.2,
        "draft_m": 11.3
      },
      "propulsion": {
        "plant": "turbo-electric (12 boilers, 4 shafts)",
        "shp": 109000,
        "speed_kn": 25,
        "range_km": 16000,
        "range_at_kn": 12,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 8000,
        "avgas_tons": 25
      },
      "batteries": [
        {
          "role": "main",
          "mounts": 4,
          "barrels_per_mount": 3,
          "arrangement": "2 forward / 2 aft",
          "rounds_per_gun": 100,
          "rounds_total": 1200,
          "firing_time_min": 80,
          "spec": {
            "name": "16 in/50, 1918 pattern",
            "caliber_in": 16,
            "caliber_mm": 406,
            "length_cal": 50,
            "count": 12,
            "notes": "Outside the escalation Mark sequence: the gun the ladder inherited, not a gun the ladder made."
          }
        },
        {
          "role": "secondary",
          "mounts": 16,
          "barrels_per_mount": 1,
          "arrangement": "8 per side",
          "rounds_per_gun": 230,
          "rounds_total": 3680,
          "firing_time_min": 26,
          "spec": {
            "name": "5 in/51 casemate, 1911 pattern",
            "caliber_in": 5,
            "caliber_mm": 127,
            "length_cal": 51,
            "count": 16,
            "notes": "The casemate outfit of the last war, frozen where the last appropriation left it."
          }
        }
      ],
      "armament": {
        "aa_battery": [
          {
            "count": 12,
            "caliber_mm": 76,
            "mounts": "single anti-aircraft, 1915 pattern",
            "rounds_per_gun": 300,
            "firing_time_min": 20
          }
        ]
      },
      "aviation": {
        "catapults": 2,
        "catapult_rating_t": 2.8,
        "aircraft_capacity": 3,
        "catapult": "us23cat"
      },
      "protection": {
        "belt_mm": 406,
        "deck_mm": 152,
        "barbette_mm": 432,
        "turret_mm": 457,
        "torpedo_defense": 5,
        "features": [
          "belt inclined 10 deg",
          "torpedo defense 6.5 m deep",
          "triple bottom"
        ]
      },
      "provisions": [
        {
          "interface": "barbette_ring",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "secondary_base_ring",
          "count": 16,
          "fitted": 16,
          "state": "fitted"
        },
        {
          "interface": "director_tower",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "magazine_5in",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None. The hull is worked for no equipment that does not yet exist — every later fit is structural work at structural prices."
        },
        {
          "interface": "dp_director_seat",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None."
        },
        {
          "interface": "cannon_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None. Anti-aircraft and light armament are whatever the last appropriation funded."
        }
      ],
      "sensors": [
        "us27dir"
      ],
      "complement": 2650,
      "possible_upgrades": [
        "us25sec",
        "us34sec",
        "us45sec",
        "us36can",
        "us41can",
        "us43shl",
        "us36dir",
        "us40dir",
        "us44dir",
        "us39rad",
        "us43rad"
      ],
      "notes": "The founding rung and the only one that buys no gun at all: the 1918 battery behind twice the armor, drawn eighteen months after the bombing trials. The last generation drawn to the canal as built."
    }
  },
  "constitution_bb25": {
    "id": "constitution_bb25",
    "nation": "USA",
    "name": "Constitution class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 72000,
    "cost": 37000,
    "year": 1925,
    "durability": 8100,
    "speed": 25,
    "range": 15500,
    "shp": 127000,
    "caliber": 457,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 432,
    "deck": 178,
    "air": 0,
    "aa": 24,
    "scoutAircraft": 4,
    "sonar": false,
    "radar": false,
    "crew": 3250,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "constitution_bb25",
      "name": "Constitution class",
      "parent_class": "missouri_bb23",
      "changes": "+14,000 t standard; +33 m length, beam unchanged, +0.5 m draft; Mark 1 turrets, 18 in for 16 in — the ladder's first caliber step, same four groups, same 100 rpg, firing time 80 → 67 min on a faster gun; secondary unchanged; +4 high-angle guns and machine guns added, the first close-in battery on the ladder; +18,000 shp on the same twelve boilers, still turbo-electric, still four shafts, speed unchanged at 25 kt; belt +26 mm, deck +26 mm, barbettes +51 mm, turret faces +51 mm; torpedo defense 0.5 m deeper; +1,000 t oil; crew +600; cost +8,000 gold, durability +1,700. And the one that is not on the sheet: at 8.89 lengths to the beam she is the finest capital hull ever drawn, because the canal will not let her be wider.",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "design_year": 1925,
      "as_launched_year": 1930,
      "cost_gold": 37000,
      "durability": 8100,
      "displacement": {
        "empty_tons": 67400,
        "standard_tons": 72000,
        "full_load_tons": 81030
      },
      "dimensions": {
        "length_m": 295,
        "beam_m": 33.2,
        "draft_m": 11.8
      },
      "propulsion": {
        "plant": "turbo-electric (12 boilers, 4 shafts)",
        "shp": 127000,
        "speed_kn": 25,
        "range_km": 15500,
        "range_at_kn": 12,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 9000,
        "avgas_tons": 30
      },
      "batteries": [
        {
          "role": "main",
          "mounts": 4,
          "barrels_per_mount": 3,
          "arrangement": "2 forward / 2 aft",
          "rounds_per_gun": 100,
          "rounds_total": 1200,
          "firing_time_min": 67,
          "component": "us25gun"
        },
        {
          "role": "secondary",
          "mounts": 16,
          "barrels_per_mount": 1,
          "arrangement": "8 per side",
          "rounds_per_gun": 230,
          "rounds_total": 3680,
          "firing_time_min": 26,
          "spec": {
            "name": "5 in/51 casemate, 1911 pattern",
            "caliber_in": 5,
            "caliber_mm": 127,
            "length_cal": 51,
            "count": 16,
            "notes": "The casemate outfit of the last war, frozen where the last appropriation left it."
          }
        }
      ],
      "armament": {
        "aa_battery": [
          {
            "count": 8,
            "caliber_mm": 12.7,
            "mounts": "single machine gun",
            "rounds_per_gun": 2000,
            "firing_time_min": 3.5
          },
          {
            "count": 16,
            "caliber_mm": 76,
            "mounts": "single anti-aircraft, 1915 pattern",
            "rounds_per_gun": 300,
            "firing_time_min": 20
          }
        ]
      },
      "aviation": {
        "catapults": 2,
        "catapult_rating_t": 2.8,
        "aircraft_capacity": 4,
        "catapult": "us23cat"
      },
      "protection": {
        "belt_mm": 432,
        "deck_mm": 178,
        "barbette_mm": 483,
        "turret_mm": 508,
        "torpedo_defense": 5,
        "features": [
          "belt inclined 11 deg",
          "torpedo defense 7.0 m deep",
          "triple bottom"
        ]
      },
      "provisions": [
        {
          "interface": "barbette_ring",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "secondary_base_ring",
          "count": 16,
          "fitted": 16,
          "state": "fitted"
        },
        {
          "interface": "director_tower",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "magazine_5in",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None. The hull is worked for no equipment that does not yet exist — every later fit is structural work at structural prices."
        },
        {
          "interface": "dp_director_seat",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None."
        },
        {
          "interface": "cannon_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None. Anti-aircraft and light armament are whatever the last appropriation funded."
        }
      ],
      "sensors": [
        "us27dir"
      ],
      "complement": 3250,
      "possible_upgrades": [
        "us25sec",
        "us34sec",
        "us45sec",
        "us36can",
        "us41can",
        "us43shl",
        "us36dir",
        "us40dir",
        "us44dir",
        "us39rad",
        "us43rad"
      ],
      "notes": "The last American capital ship that will ever pass the canal as it was dug. At 8.89 lengths to the beam she is the finest capital hull ever drawn, because the canal will not let her be wider."
    }
  },
  "united_states_bb27": {
    "id": "united_states_bb27",
    "nation": "USA",
    "name": "United States class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 92000,
    "cost": 49000,
    "year": 1927,
    "durability": 10500,
    "speed": 25,
    "range": 15000,
    "shp": 149000,
    "caliber": 457,
    "barrels": 15,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 457,
    "deck": 203,
    "air": 0,
    "aa": 16,
    "scoutAircraft": 4,
    "sonar": false,
    "radar": false,
    "crew": 4150,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "united_states_bb27",
      "name": "United States class",
      "parent_class": "constitution_bb25",
      "changes": "+20,000 t standard; +15 m length, +5.3 m beam — the first hull too wide for the canal as dug; +0.6 m draft; a fifth triple turret forward, 15 × 18 in for 12, same gun, same 100 rpg; the casemate battery is deleted entire and replaced by 16 high-angle 5 in/25 — the fleet's first secondary that elevates; the 76 mm guns land and are not replaced, +8 machine guns; geared turbines for turbo-electric and SIX SHAFTS for four, +22,000 shp on the same twelve boilers, speed unchanged at 25 kt; belt +25 mm, deck +25 mm, barbettes +25 mm, turret faces +52 mm; torpedo defense a sixth bulkhead, 1.0 m deeper; +1,500 t oil; crew +900; cost +12,000 gold, durability +2,400.",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "design_year": 1927,
      "as_launched_year": 1933,
      "cost_gold": 49000,
      "durability": 10500,
      "displacement": {
        "empty_tons": 86300,
        "standard_tons": 92000,
        "full_load_tons": 102535
      },
      "dimensions": {
        "length_m": 310,
        "beam_m": 38.5,
        "draft_m": 12.4
      },
      "propulsion": {
        "plant": "geared turbines (12 boilers, 6 shafts)",
        "shp": 149000,
        "speed_kn": 25,
        "range_km": 15000,
        "range_at_kn": 12,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 10500,
        "avgas_tons": 35
      },
      "batteries": [
        {
          "role": "main",
          "mounts": 5,
          "barrels_per_mount": 3,
          "arrangement": "3 forward / 2 aft",
          "rounds_per_gun": 100,
          "rounds_total": 1500,
          "firing_time_min": 67,
          "component": "us25gun"
        },
        {
          "role": "secondary",
          "mounts": 16,
          "barrels_per_mount": 1,
          "arrangement": "8 per side",
          "rounds_per_gun": 200,
          "rounds_total": 3200,
          "firing_time_min": 14,
          "component": "us25sec",
          "ammunition": "us25shl"
        }
      ],
      "armament": {
        "aa_battery": [
          {
            "count": 16,
            "caliber_mm": 12.7,
            "mounts": "single machine gun",
            "rounds_per_gun": 2000,
            "firing_time_min": 3.5
          }
        ]
      },
      "aviation": {
        "catapults": 2,
        "catapult_rating_t": 2.8,
        "aircraft_capacity": 4,
        "catapult": "us23cat"
      },
      "protection": {
        "belt_mm": 457,
        "deck_mm": 203,
        "barbette_mm": 508,
        "turret_mm": 560,
        "torpedo_defense": 6,
        "features": [
          "belt inclined 12 deg",
          "torpedo defense 8.0 m deep",
          "triple bottom"
        ]
      },
      "provisions": [
        {
          "interface": "barbette_ring",
          "count": 5,
          "fitted": 5,
          "state": "fitted"
        },
        {
          "interface": "secondary_base_ring",
          "count": 16,
          "fitted": 16,
          "state": "fitted"
        },
        {
          "interface": "director_tower",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "magazine_5in",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None. The hull is worked for no equipment that does not yet exist — every later fit is structural work at structural prices."
        },
        {
          "interface": "dp_director_seat",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None."
        },
        {
          "interface": "cannon_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None. Anti-aircraft and light armament are whatever the last appropriation funded."
        }
      ],
      "sensors": [
        "us27dir"
      ],
      "complement": 4150,
      "possible_upgrades": [
        "us34sec",
        "us45sec",
        "us36can",
        "us41can",
        "us43shl",
        "us36dir",
        "us40dir",
        "us44dir",
        "us39rad",
        "us43rad"
      ],
      "notes": "The 1917 maximum-battleship study taken out of its cabinet and drawn to lock chambers still being poured. Six shafts appear here, and not for speed. The first ship in the fleet whose secondary armament can elevate."
    }
  },
  "tillman_bb29": {
    "id": "tillman_bb29",
    "nation": "USA",
    "name": "Tillman class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 112000,
    "cost": 63000,
    "year": 1929,
    "durability": 14000,
    "speed": 25,
    "range": 15000,
    "shp": 170000,
    "caliber": 546,
    "barrels": 9,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 483,
    "deck": 320,
    "air": 0,
    "aa": 32,
    "scoutAircraft": 4,
    "sonar": false,
    "radar": false,
    "crew": 5200,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "tillman_bb29",
      "name": "Tillman class",
      "parent_class": "united_states_bb27",
      "changes": "+20,000 t standard; +5 m length, +6.0 m beam — set by the ten-meter torpedo system, not the battery; +1.5 m draft; Mark 2 turrets, 21.5 in for 18 in — 9 barrels in three triples for 15 in five, and the magazine deepens to 120 rpg for 100, the largest weight of shell the ladder has yet stowed; +8 secondary guns; +16 machine guns and 2 more high-angle control positions; +21,000 shp on two more boilers in unit arrangement, six shafts unchanged, speed unchanged at 25 kt; belt +26 mm; deck +117 mm and rearranged into three layers; barbettes +52 mm, turret faces +90 mm; torpedo defense a seventh bulkhead, 2.0 m deeper and liquid loaded; quadruple bottom for triple; +2,000 t oil; crew +1,050; cost +14,000 gold, durability +3,500. And the one that is not on the sheet: at 44.5 m she misses the new lock chambers by half a meter of concrete that will not be given back (`us-five-term-tillman-scenario.md` §4.3).",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "design_year": 1929,
      "as_launched_year": 1935,
      "cost_gold": 63000,
      "durability": 14000,
      "displacement": {
        "empty_tons": 105300,
        "standard_tons": 112000,
        "full_load_tons": 124500
      },
      "dimensions": {
        "length_m": 315,
        "beam_m": 44.5,
        "draft_m": 13.9
      },
      "propulsion": {
        "plant": "geared turbines (14 boilers, 6 shafts, unit machinery)",
        "shp": 170000,
        "speed_kn": 25,
        "range_km": 15000,
        "range_at_kn": 12,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 12500,
        "avgas_tons": 45
      },
      "batteries": [
        {
          "role": "main",
          "mounts": 3,
          "barrels_per_mount": 3,
          "arrangement": "2 forward / 1 aft",
          "rounds_per_gun": 120,
          "rounds_total": 1080,
          "firing_time_min": 100,
          "component": "us29gun"
        },
        {
          "role": "secondary",
          "mounts": 24,
          "barrels_per_mount": 1,
          "arrangement": "12 per side",
          "rounds_per_gun": 200,
          "rounds_total": 4800,
          "firing_time_min": 14,
          "component": "us25sec",
          "ammunition": "us25shl"
        }
      ],
      "armament": {
        "aa_battery": [
          {
            "count": 32,
            "caliber_mm": 12.7,
            "mounts": "single machine gun",
            "rounds_per_gun": 2000,
            "firing_time_min": 3.5
          }
        ]
      },
      "aviation": {
        "catapults": 2,
        "catapult_rating_t": 2.8,
        "aircraft_capacity": 4,
        "catapult": "us23cat"
      },
      "protection": {
        "belt_mm": 483,
        "deck_mm": 320,
        "barbette_mm": 560,
        "turret_mm": 650,
        "torpedo_defense": 7,
        "features": [
          "belt inclined 15 deg",
          "torpedo defense 10.0 m deep",
          "quadruple bottom",
          "deck in three layers: 70 mm decapping, 210 mm main, 40 mm splinter, full thickness over the machinery and magazine width and tapered outboard",
          "torpedo defense liquid loaded"
        ]
      },
      "provisions": [
        {
          "interface": "barbette_ring",
          "count": 3,
          "fitted": 3,
          "state": "fitted"
        },
        {
          "interface": "secondary_base_ring",
          "count": 24,
          "fitted": 24,
          "state": "fitted"
        },
        {
          "interface": "director_tower",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "magazine_5in",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None. The hull is worked for no equipment that does not yet exist — every later fit is structural work at structural prices."
        },
        {
          "interface": "dp_director_seat",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None."
        },
        {
          "interface": "cannon_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None. Anti-aircraft and light armament are whatever the last appropriation funded."
        }
      ],
      "sensors": [
        "us27dir"
      ],
      "complement": 5200,
      "possible_upgrades": [
        "us34sec",
        "us45sec",
        "us36can",
        "us41can",
        "us43shl",
        "us36dir",
        "us40dir",
        "us44dir",
        "us39rad",
        "us43rad"
      ],
      "notes": "The only specification on the ladder that names a mission instead of a weapon: steam to Pearl Harbor and relieve it, under air attack, and arrive able to fight. Twins are a survivability choice and not a size limit. Misses the new lock chambers by half a meter."
    }
  },
  "columbia_bb32": {
    "id": "columbia_bb32",
    "nation": "USA",
    "name": "Columbia class",
    "type": "BB",
    "category": "capital_ship",
    "tons": 142000,
    "cost": 81000,
    "year": 1932,
    "durability": 17500,
    "speed": 25,
    "range": 15000,
    "shp": 198000,
    "caliber": 546,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 483,
    "deck": 320,
    "air": 0,
    "aa": 48,
    "scoutAircraft": 4,
    "sonar": false,
    "radar": false,
    "crew": 6600,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "columbia_bb32",
      "name": "Columbia class",
      "parent_class": "tillman_bb29",
      "changes": "+30,000 t standard; +35 m length, +2.0 m beam, +0.5 m draft; a fourth triple Mark 2 turret — 12 barrels for 9, at 100 rpg for 120, the magazine growing in total weight while shrinking per gun; the secondary battery is rebuilt — 20 twin 5 in/38 Mark 2 for 24 single 5 in/25, the first dual-purpose battery in the fleet, with 6 × Mark 3 directors fitted to work it; +16 machine guns, the high-angle control positions superseded; +28,000 shp on the same fourteen boilers, six shafts unchanged, speed unchanged at 25 kt; the protective scheme is unaltered in every dimension — belt, deck, barbettes, faces and torpedo defense are the fourth generation's exactly; +2,000 t oil; crew +1,400; cost +18,000 gold, durability +3,500.",
      "nation": "USA",
      "type": "BB",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "design_year": 1932,
      "as_launched_year": 1935,
      "cost_gold": 81000,
      "durability": 17500,
      "displacement": {
        "empty_tons": 133800,
        "standard_tons": 142000,
        "full_load_tons": 156300
      },
      "dimensions": {
        "length_m": 350,
        "beam_m": 46.5,
        "draft_m": 14.4
      },
      "propulsion": {
        "plant": "geared turbines (14 boilers, 6 shafts, unit machinery)",
        "shp": 198000,
        "speed_kn": 25,
        "range_km": 15000,
        "range_at_kn": 12,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 14500,
        "avgas_tons": 50
      },
      "batteries": [
        {
          "role": "main",
          "mounts": 4,
          "barrels_per_mount": 3,
          "arrangement": "2 forward / 2 aft",
          "rounds_per_gun": 100,
          "rounds_total": 1200,
          "firing_time_min": 83,
          "component": "us29gun"
        },
        {
          "role": "secondary",
          "mounts": 20,
          "barrels_per_mount": 2,
          "arrangement": "10 per side",
          "rounds_per_gun": 350,
          "rounds_total": 14000,
          "firing_time_min": 19,
          "component": "us34sec",
          "ammunition": "us25shl"
        }
      ],
      "armament": {
        "aa_battery": [
          {
            "count": 48,
            "caliber_mm": 12.7,
            "mounts": "single machine gun",
            "rounds_per_gun": 2000,
            "firing_time_min": 3.5
          }
        ]
      },
      "aviation": {
        "catapults": 2,
        "catapult_rating_t": 2.8,
        "aircraft_capacity": 4,
        "catapult": "us23cat"
      },
      "protection": {
        "belt_mm": 483,
        "deck_mm": 320,
        "barbette_mm": 560,
        "turret_mm": 650,
        "torpedo_defense": 7,
        "features": [
          "belt inclined 15 deg",
          "torpedo defense 10.0 m deep",
          "quadruple bottom",
          "deck in three layers: 70 mm decapping, 210 mm main, 40 mm splinter, full thickness over the machinery and magazine width and tapered outboard",
          "torpedo defense liquid loaded"
        ]
      },
      "provisions": [
        {
          "interface": "barbette_ring",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "secondary_base_ring",
          "count": 20,
          "fitted": 20,
          "state": "fitted"
        },
        {
          "interface": "director_tower",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "magazine_5in",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None. The hull is worked for no equipment that does not yet exist — every later fit is structural work at structural prices."
        },
        {
          "interface": "dp_director_seat",
          "count": 6,
          "fitted": 6,
          "state": "fitted",
          "notes": "Fitted, not provisioned: the fleet does not provision."
        },
        {
          "interface": "cannon_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None. Anti-aircraft and light armament are whatever the last appropriation funded."
        }
      ],
      "sensors": [
        "us27dir",
        "us34dir"
      ],
      "complement": 6600,
      "possible_upgrades": [
        "us45sec",
        "us36can",
        "us41can",
        "us43shl",
        "us36dir",
        "us40dir",
        "us44dir",
        "us39rad",
        "us43rad"
      ],
      "notes": "Drawn to fill a 350 m graving dock with nothing to spare. Six twin turrets cost more than four triples for the same twelve barrels, and the Board accepted it. The heaviest anti-aircraft ship afloat, and beneath the heavy battery the close-in layer is forty-eight machine guns and nothing else."
    }
  },
  "ranger_cv29": {
    "id": "ranger_cv29",
    "nation": "USA",
    "name": "Ranger",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 14500,
    "cost": 7000,
    "year": 1929,
    "durability": 1300,
    "speed": 29,
    "range": 20000,
    "shp": 53500,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 25,
    "air": 43,
    "aa": 12,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1750,
    "submergedSpeed": 0,
    "provisioned": 1,
    "raw": {
      "id": "ranger_cv29",
      "name": "Ranger",
      "nation": "USA",
      "type": "CV",
      "treaty_category": "aircraft_carrier",
      "generation": "interwar",
      "design_year": 1929,
      "as_launched_year": 1934,
      "cost_gold": 7000,
      "durability": 1300,
      "displacement": {
        "empty_tons": 13260,
        "standard_tons": 14500,
        "full_load_tons": 17230
      },
      "dimensions": {
        "length_m": 234,
        "beam_m": 24.4,
        "draft_m": 6.8
      },
      "propulsion": {
        "plant": "geared turbines (6 boilers, 2 shafts)",
        "shp": 53500,
        "speed_kn": 29,
        "range_km": 20000,
        "range_at_kn": 12,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 2350,
        "avgas_tons": 380
      },
      "aviation": {
        "flight_deck": true,
        "flight_deck_m": 216,
        "arresting_gear": true,
        "elevators": 3,
        "elevator_type": "centerline",
        "hangar_m2": 2600,
        "hangar_clear_m": 5.8,
        "deck_park_m2": 2400
      },
      "batteries": [
        {
          "role": "secondary",
          "component": "us25sec",
          "mounts": 8,
          "barrels_per_mount": 1,
          "arrangement": "4 per side",
          "ammunition": "us25shl",
          "rounds_per_gun": 200,
          "rounds_total": 1600,
          "firing_time_min": 14
        }
      ],
      "armament": {
        "aa_battery": [
          {
            "count": 12,
            "caliber_mm": 12.7,
            "mounts": "single machine gun",
            "rounds_per_gun": 2000,
            "firing_time_min": 3.5
          }
        ]
      },
      "protection": {
        "deck_mm": 25,
        "features": [
          "25 mm protective deck over machinery",
          "avgas cofferdammed"
        ]
      },
      "provisions": [
        {
          "interface": "secondary_base_ring",
          "count": 8,
          "fitted": 8,
          "state": "fitted"
        },
        {
          "interface": "catapult_track",
          "count": 2,
          "fitted": 0,
          "state": "foundation_only",
          "notes": "Two flush-deck catapult track foundations — the one provision in the whole fleet, and it is for a catapult."
        },
        {
          "interface": "magazine_5in",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        }
      ],
      "complement": 1750,
      "possible_upgrades": [
        "us34sec",
        "us45sec",
        "us36can",
        "us41can",
        "us43shl",
        "us36dir",
        "us44dir",
        "us39rad",
        "us43rad"
      ],
      "notes": "The fleet's carrier doctrine entire: one deck, one air group, and the whole of the service's flight-deck practice. The deck park handles and ranges rather than stows, and it is generous BECAUSE NOTHING ABOARD FOLDS. She was built once, and the drawings were put away. Fire control as launched is optical sights."
    }
  },
  "astoria_ca26": {
    "id": "astoria_ca26",
    "nation": "USA",
    "name": "Astoria class",
    "type": "CA",
    "category": "auxiliary_combatant",
    "tons": 9950,
    "cost": 4400,
    "year": 1926,
    "durability": 1000,
    "speed": 32.5,
    "range": 18500,
    "shp": 107000,
    "caliber": 203,
    "barrels": 9,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 127,
    "deck": 57,
    "air": 0,
    "aa": 8,
    "scoutAircraft": 4,
    "sonar": false,
    "radar": false,
    "crew": 750,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "astoria_ca26",
      "name": "Astoria class",
      "nation": "USA",
      "type": "CA",
      "treaty_category": "auxiliary_combatant",
      "generation": "treaty_cruiser",
      "design_year": 1926,
      "as_launched_year": 1926,
      "cost_gold": 4400,
      "durability": 1000,
      "displacement": {
        "empty_tons": 9280,
        "standard_tons": 9950,
        "full_load_tons": 11625
      },
      "dimensions": {
        "length_m": 179,
        "beam_m": 18.8,
        "draft_m": 7.2
      },
      "propulsion": {
        "plant": "geared turbines (8 boilers, 4 shafts)",
        "shp": 107000,
        "speed_kn": 32.5,
        "range_km": 18500,
        "range_at_kn": 12,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 1650,
        "avgas_tons": 25
      },
      "armament": {
        "aa_battery": [
          {
            "count": 8,
            "caliber_mm": 12.7,
            "mounts": "single machine gun",
            "rounds_per_gun": 2000,
            "firing_time_min": 3.5
          }
        ]
      },
      "batteries": [
        {
          "role": "main",
          "mounts": 3,
          "barrels_per_mount": 3,
          "arrangement": "2 forward / 1 aft",
          "rounds_per_gun": 150,
          "rounds_total": 1350,
          "firing_time_min": 38,
          "spec": {
            "name": "8 in/55 pattern 1926",
            "caliber_in": 8,
            "caliber_mm": 203,
            "length_cal": 55,
            "count": 9,
            "notes": "Outside the Mark sequence: the escalation ladder retooled one gun plant upward and the cruiser battery was never part of it."
          }
        },
        {
          "role": "secondary",
          "component": "us25sec",
          "mounts": 8,
          "barrels_per_mount": 1,
          "arrangement": "4 per side",
          "ammunition": "us25shl",
          "rounds_per_gun": 200,
          "rounds_total": 1600,
          "firing_time_min": 14
        }
      ],
      "aviation": {
        "catapults": 2,
        "catapult_rating_t": 2.8,
        "aircraft_capacity": 4,
        "catapult": "us23cat"
      },
      "protection": {
        "belt_mm": 127,
        "deck_mm": 57,
        "turret_mm": 203,
        "features": [
          "belt over the machinery box only",
          "light hull outside the box"
        ]
      },
      "provisions": [
        {
          "interface": "secondary_base_ring",
          "count": 8,
          "fitted": 8,
          "state": "fitted"
        },
        {
          "interface": "magazine_5in",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        },
        {
          "interface": "dp_director_seat",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        }
      ],
      "complement": 750,
      "possible_upgrades": [
        "us34sec",
        "us45sec",
        "us36can",
        "us41can",
        "us43shl",
        "us36dir",
        "us44dir",
        "us39rad",
        "us43rad"
      ],
      "notes": "The scouting line: the eyes the battle line's gunnery doctrine requires, and the escort the spotting aircraft work behind. Fire control as launched is 2 x 8 in director tops with 5 m rangefinders. Her protection assumes she will not have to take an action for long."
    }
  },
  "farragut_dd34": {
    "id": "farragut_dd34",
    "nation": "USA",
    "name": "Farragut class",
    "type": "DD",
    "category": "auxiliary_combatant",
    "tons": 1500,
    "cost": 700,
    "year": 1934,
    "durability": 160,
    "speed": 36.5,
    "range": 11000,
    "shp": 42800,
    "caliber": 127,
    "barrels": 5,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 200,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "farragut_dd34",
      "name": "Farragut class",
      "nation": "USA",
      "type": "DD",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "design_year": 1934,
      "as_launched_year": 1934,
      "cost_gold": 700,
      "durability": 160,
      "displacement": {
        "empty_tons": 1340,
        "standard_tons": 1500,
        "full_load_tons": 2140
      },
      "dimensions": {
        "length_m": 107,
        "beam_m": 10.7,
        "draft_m": 3.7
      },
      "propulsion": {
        "plant": "geared turbines (4 boilers, 2 shafts)",
        "shp": 42800,
        "speed_kn": 36.5,
        "range_km": 11000,
        "range_at_kn": 12,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 640
      },
      "batteries": [
        {
          "role": "main",
          "component": "us34sec",
          "mounts": 5,
          "barrels_per_mount": 1,
          "arrangement": "2 forward / 3 aft",
          "ammunition": "us25shl",
          "rounds_per_gun": 350,
          "rounds_total": 1750,
          "firing_time_min": 19
        },
        {
          "role": "torpedo",
          "component": "us34lau",
          "mounts": 2,
          "tubes": 8,
          "arrangement": "centerline",
          "ammunition": "us31tor",
          "stowage": 8
        },
        {
          "role": "asw",
          "component": "us24dpc",
          "mounts": 1,
          "arrangement": "stern racks",
          "stowage": 14
        }
      ],
      "armament": {
        "aa_battery": [
          {
            "count": 4,
            "caliber_mm": 12.7,
            "mounts": "single machine gun",
            "rounds_per_gun": 2000,
            "firing_time_min": 3.5
          }
        ]
      },
      "protection": {
        "features": []
      },
      "provisions": [
        {
          "interface": "secondary_base_ring",
          "count": 5,
          "fitted": 5,
          "state": "fitted"
        },
        {
          "interface": "torpedo_mount_seat",
          "count": 2,
          "fitted": 2,
          "state": "fitted",
          "notes": "No reload stowage. The flotilla's attack is a single throw."
        },
        {
          "interface": "dp_director_seat",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "depth_charge_rail",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "magazine_5in",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "sonar_dome",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None of the listening gear the doctrine assumes, because the listening gear was not in the appropriation."
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        }
      ],
      "sensors": [
        "us34dir"
      ],
      "complement": 200,
      "possible_upgrades": [
        "us45sec",
        "us36can",
        "us41can",
        "us43shl",
        "us36dir",
        "us44dir",
        "us39rad",
        "us43rad",
        "us34snr",
        "us42snr",
        "us39dpc",
        "us42tor",
        "us44tor"
      ],
      "notes": "The first ship in the fleet whose battery fights aircraft and surface targets with the same barrels under one director. She screens the battle line, and the doctrine has never asked what happens when she is not there."
    }
  },
  "dolphin_ss31": {
    "id": "dolphin_ss31",
    "nation": "USA",
    "name": "Dolphin class",
    "type": "SS",
    "category": "auxiliary_combatant",
    "tons": 1550,
    "cost": 1000,
    "year": 1931,
    "durability": 170,
    "speed": 17.5,
    "range": 18500,
    "shp": 4000,
    "caliber": 0,
    "barrels": 0,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 1,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 52,
    "submergedSpeed": 8,
    "provisioned": 0,
    "raw": {
      "id": "dolphin_ss31",
      "name": "Dolphin class",
      "nation": "USA",
      "type": "SS",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "design_year": 1931,
      "as_launched_year": 1931,
      "cost_gold": 1000,
      "durability": 170,
      "displacement": {
        "empty_tons": 1485,
        "standard_tons": 1550,
        "full_load_tons": 1840,
        "submerged_tons": 2080
      },
      "dimensions": {
        "length_m": 88,
        "beam_m": 7.6,
        "draft_m": 4.3
      },
      "propulsion": {
        "plant": "diesel-electric composite (2 shafts)",
        "shp": 4000,
        "speed_kn": 17.5,
        "range_km": 18500,
        "range_at_kn": 10,
        "fuel": "diesel_electric"
      },
      "speed_submerged": {
        "surfaced_kn": 17.5,
        "snort_kn": 8,
        "sprint_kn": 8,
        "sprint_h": 0.75,
        "patrol_kn": 5,
        "patrol_h": 10,
        "creep_kn": 2,
        "creep_h": 48,
        "battery": "2 x 120-cell lead-acid",
        "recharge_h": 7,
        "test_depth_m": 75
      },
      "fuel": {
        "diesel_tons": 290
      },
      "batteries": [
        {
          "role": "torpedo",
          "component": "us31tor",
          "mounts": 6,
          "tubes": 6,
          "arrangement": "4 bow + 2 stern",
          "stowage": 16
        }
      ],
      "armament": {
        "aa_battery": [
          {
            "count": 1,
            "caliber_mm": 12.7,
            "mounts": "single machine gun",
            "rounds_per_gun": 2000,
            "firing_time_min": 3.5
          }
        ]
      },
      "protection": {
        "features": [
          "riveted-and-welded composite, welding carried as far as the yards' certified practice allowed and no further"
        ]
      },
      "provisions": [
        {
          "interface": "torpedo_tube_or_recess",
          "count": 6,
          "fitted": 6,
          "state": "fitted"
        },
        {
          "interface": "sonar_dome",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "Passive hydrophones of 1926 pattern; no echo-ranging set."
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        }
      ],
      "complement": 52,
      "possible_upgrades": [
        "us42tor",
        "us44tor",
        "us34snr",
        "us42snr",
        "us39rad",
        "us43rad"
      ],
      "notes": "The requirement was written from the war plan backwards: the patrol radius came first and the rest of the boat was sized to it. Drawn to run surfaced and dive to attack, so the diesel plant and the bunkerage are the design's dominant weights and the battery is sized for an approach rather than for an evasion. Motors 3,600 shp. Fire control is a mechanical torpedo angle solver in the conning tower. Fuel figure includes fuel-ballast tanks."
    }
  },
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
    "speed": 33,
    "range": 8700,
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
    "speed": 33,
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
    "range": 7965,
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
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 18600,
    "cost": 8928,
    "year": 1915,
    "durability": 1550,
    "speed": 32,
    "range": 11110,
    "shp": 90000,
    "caliber": 0,
    "barrels": 0,
    "tubes": 14,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 45,
    "air": 36,
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
    },
    "estimated": [
      "air"
    ]
  },
  "invincible_bc22": {
    "id": "invincible_bc22",
    "nation": "GBR",
    "name": "Invincible class",
    "type": "BC",
    "category": "capital_ship",
    "tons": 48400,
    "cost": 21000,
    "year": 1921,
    "durability": 5100,
    "speed": 32,
    "range": 13000,
    "shp": 160000,
    "caliber": 406,
    "barrels": 9,
    "tubes": 2,
    "torpedoRange": 8,
    "belt": 356,
    "deck": 203,
    "air": 0,
    "aa": 6,
    "scoutAircraft": 2,
    "sonar": false,
    "radar": false,
    "crew": 1720,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "invincible_bc22",
      "name": "Invincible class",
      "nation": "GBR",
      "type": "BC",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "design_year": 1921,
      "as_launched_year": 1925,
      "cost_gold": 21000,
      "durability": 5100,
      "displacement": {
        "empty_tons": 45100,
        "standard_tons": 48400,
        "full_load_tons": 53400
      },
      "dimensions": {
        "length_m": 261,
        "beam_m": 32.3,
        "draft_m": 10
      },
      "propulsion": {
        "plant": "[uk22eng] Mark I, 250 psi saturated, single-reduction geared turbines, 4 shafts",
        "shp": 160000,
        "speed_kn": 32,
        "range_km": 13000,
        "range_at_kn": 16,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 5000
      },
      "batteries": [
        {
          "role": "main",
          "component": "uk22gun",
          "mounts": 3,
          "barrels_per_mount": 3,
          "arrangement": "2 forward / 1 amidships abaft the bridge",
          "ammunition": "uk22shl",
          "rounds_per_gun": 100,
          "rounds_total": 900,
          "firing_time_min": 50
        },
        {
          "role": "torpedo",
          "mounts": 2,
          "tubes": 2,
          "arrangement": "submerged, beam",
          "spec": {
            "name": "24.5 in submerged tube",
            "caliber_in": 24.5,
            "caliber_mm": 622,
            "pattern": "1921",
            "notes": "The only torpedo in a British capital ship. Struck from every design after hers."
          },
          "stowage": 10
        }
      ],
      "armament": {
        "secondary_battery": [
          {
            "count": 16,
            "caliber_in": 6,
            "caliber_mm": 152,
            "length_cal": 50,
            "mounts": "eight twin turrets",
            "pattern": "1921",
            "arrangement": "4 per side",
            "rounds_per_gun": 150,
            "rounds_total": 2400,
            "firing_time_min": 30
          }
        ],
        "aa_battery": [
          {
            "count": 6,
            "caliber_mm": 120,
            "caliber_in": 4.7,
            "mounts": "single high-angle",
            "pattern": "1921",
            "rounds_per_gun": 200,
            "firing_time_min": 25
          }
        ]
      },
      "aviation": {
        "catapults": 1,
        "catapult_rating_t": 3.2,
        "aircraft_capacity": 2,
        "catapult": "uk24cat"
      },
      "protection": {
        "belt_mm": 356,
        "deck_mm": 203,
        "barbette_mm": 356,
        "turret_mm": 432,
        "ct_mm": 203,
        "torpedo_defense": 1,
        "features": [
          "belt inclined 18 deg",
          "deck 203 mm over magazines, 102 mm over machinery",
          "torpedo bulkhead 4.3 m deep",
          "the G3 scheme of 1921, unaltered in every dimension through four classes"
        ]
      },
      "provisions": [
        {
          "interface": "barbette_ring",
          "count": 3,
          "fitted": 3,
          "state": "fitted"
        },
        {
          "interface": "magazine_heavy",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "torpedo_tube_or_recess",
          "count": 2,
          "fitted": 2,
          "state": "fitted",
          "notes": "Two submerged 24.5-inch tubes, drawn in 1921. THE ONLY BRITISH CAPITAL SHIP THAT CARRIES A TORPEDO — the Fisher school struck them from every design after hers."
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None. No mast, no wiring run, no power margin. Britain does not provision and never has."
        },
        {
          "interface": "director_tower",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "1921-pattern director tops only; no trunnion for the Mark I director of 1927."
        },
        {
          "interface": "cannon_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        },
        {
          "interface": "refueling_trunk",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "Laid down before 1927. Fitting the abeam rig would be structural work, and it has not been done."
        }
      ],
      "complement": 1720,
      "possible_upgrades": [
        "uk24sec",
        "uk32sec",
        "uk27can",
        "uk39can",
        "uk30shl",
        "uk27dir",
        "uk32dir",
        "uk38dir",
        "uk38rad",
        "uk41rad"
      ],
      "notes": "THE G3s AS THE ADMIRALTY ACTUALLY DREW THEM IN 1921, BUILT WITHOUT A LINE ALTERED. Suspended 6 February 1922 as the treaty required, resumed 24 April as reconstructions of hulls surrendered for scrapping, declared at 35,000 t. The Nelson class is never ordered: the treaty exception that historically bought two cut-down 16-inch ships is spent on the resumption. The Admiralty's only complaint was the Controller's minute of 3 May: THIRTY-TWO KNOTS IS NOT ENOUGH — three words carved over the drawing office door at Bath in 1931. The best-protected capital ship this navy will ever have and also the worst, because every ship after her has exactly her armor and more of everything else."
    }
  },
  "insuperable_bc27": {
    "id": "insuperable_bc27",
    "nation": "GBR",
    "name": "Insuperable class",
    "type": "BC",
    "category": "capital_ship",
    "tons": 51500,
    "cost": 26000,
    "year": 1926,
    "durability": 5400,
    "speed": 36,
    "range": 14000,
    "shp": 244000,
    "caliber": 406,
    "barrels": 9,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 356,
    "deck": 203,
    "air": 0,
    "aa": 16,
    "scoutAircraft": 3,
    "sonar": false,
    "radar": false,
    "crew": 1840,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "insuperable_bc27",
      "name": "Insuperable class",
      "parent_class": "invincible_bc22",
      "changes": "+3,100 t standard; +14 m length; +84,000 shp on the Mark II plant; +4 kt to the fleet's 36; the protective scheme is unaltered in every dimension; Mark II mountings on the same rings, rearranged all forward — the citadel twenty meters shorter and the astern arcs given up for it, and every British capital ship after her is drawn this way; the submerged tubes struck; pom-poms for the 4.7-inch high-angle singles; abeam refueling trunk from new; crew +120; declared at 35,000 tons and 29 knots.",
      "nation": "GBR",
      "type": "BC",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "design_year": 1926,
      "as_launched_year": 1929,
      "cost_gold": 26000,
      "durability": 5400,
      "displacement": {
        "empty_tons": 48000,
        "standard_tons": 51500,
        "full_load_tons": 57300
      },
      "dimensions": {
        "length_m": 275,
        "beam_m": 32.3,
        "draft_m": 10
      },
      "propulsion": {
        "plant": "[uk27eng] Mark II, 400 psi / 370 C superheat, 4 shafts",
        "shp": 244000,
        "speed_kn": 36,
        "range_km": 14000,
        "range_at_kn": 16,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 5800
      },
      "batteries": [
        {
          "role": "main",
          "component": "uk27gun",
          "mounts": 3,
          "barrels_per_mount": 3,
          "arrangement": "3 forward",
          "ammunition": "uk22shl",
          "rounds_per_gun": 100,
          "rounds_total": 900,
          "firing_time_min": 50
        },
        {
          "role": "secondary",
          "component": "uk24sec",
          "mounts": 16,
          "barrels_per_mount": 1,
          "arrangement": "8 per side",
          "rounds_per_gun": 200,
          "rounds_total": 3200,
          "firing_time_min": 20
        },
        {
          "role": "light_aa",
          "component": "uk27can",
          "mounts": 2,
          "barrels_per_mount": 8,
          "rounds_per_gun": 1400,
          "firing_time_min": 15
        }
      ],
      "aviation": {
        "catapults": 1,
        "catapult_rating_t": 3.2,
        "aircraft_capacity": 3,
        "catapult": "uk24cat"
      },
      "protection": {
        "belt_mm": 356,
        "deck_mm": 203,
        "barbette_mm": 356,
        "turret_mm": 432,
        "ct_mm": 203,
        "torpedo_defense": 1,
        "features": [
          "belt inclined 18 deg",
          "deck 203 mm over magazines, 102 mm over machinery",
          "torpedo bulkhead 4.3 m deep",
          "the G3 scheme of 1921, unaltered in every dimension through four classes"
        ]
      },
      "provisions": [
        {
          "interface": "barbette_ring",
          "count": 3,
          "fitted": 3,
          "state": "fitted"
        },
        {
          "interface": "secondary_base_ring",
          "count": 16,
          "fitted": 16,
          "state": "fitted"
        },
        {
          "interface": "cannon_position",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "director_tower",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "magazine_heavy",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "refueling_trunk",
          "count": 1,
          "fitted": 1,
          "state": "fitted",
          "notes": "The first British ships built with it from new."
        },
        {
          "interface": "torpedo_tube_or_recess",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        }
      ],
      "sensors": [
        "uk27dir"
      ],
      "kits": [
        "uk30kit"
      ],
      "complement": 1840,
      "possible_upgrades": [
        "uk32sec",
        "uk39can",
        "uk30shl",
        "uk32dir",
        "uk38dir",
        "uk38rad",
        "uk41rad"
      ],
      "notes": "Not a better ship, not a bigger gun, not a different arrangement. Declared at 35,000 t and 29 kt: the tonnage is the treaty's own arithmetic applied hard, the speed is a straightforward untruth."
    }
  },
  "incomparable_bc31": {
    "id": "incomparable_bc31",
    "nation": "GBR",
    "name": "Incomparable class",
    "type": "BC",
    "category": "capital_ship",
    "tons": 54500,
    "cost": 31000,
    "year": 1931,
    "durability": 5800,
    "speed": 36,
    "range": 14500,
    "shp": 251000,
    "caliber": 457,
    "barrels": 9,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 356,
    "deck": 203,
    "air": 0,
    "aa": 32,
    "scoutAircraft": 4,
    "sonar": false,
    "radar": false,
    "crew": 1980,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "incomparable_bc31",
      "name": "Incomparable class",
      "parent_class": "insuperable_bc27",
      "changes": "+3,000 t standard; +10 m length, +0.7 m beam; +7,000 shp on the Mark III plant for the same 36 kt; the protective scheme is unaltered in every dimension; only the barbette diameters grew; Mark III mountings, 18 in for 16 in — nine barrels for nine, the 1917 bore relined; the all-forward arrangement retained from the Insuperable; a dual secondary and light-AA battery doubled; crew +140.",
      "nation": "GBR",
      "type": "BC",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "design_year": 1931,
      "as_launched_year": 1934,
      "cost_gold": 31000,
      "durability": 5800,
      "displacement": {
        "empty_tons": 50800,
        "standard_tons": 54500,
        "full_load_tons": 60700
      },
      "dimensions": {
        "length_m": 285,
        "beam_m": 33,
        "draft_m": 10.2
      },
      "propulsion": {
        "plant": "[uk30eng] Mark III, 500 psi / 400 C, double-reduction gearing, 4 shafts",
        "shp": 251000,
        "speed_kn": 36,
        "range_km": 14500,
        "range_at_kn": 16,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 6200
      },
      "batteries": [
        {
          "role": "main",
          "component": "uk31gun",
          "mounts": 3,
          "barrels_per_mount": 3,
          "arrangement": "3 forward",
          "ammunition": "uk30shl",
          "rounds_per_gun": 90,
          "rounds_total": 810,
          "firing_time_min": 51
        },
        {
          "role": "secondary",
          "component": "uk24sec",
          "mounts": 16,
          "barrels_per_mount": 1,
          "arrangement": "8 per side",
          "rounds_per_gun": 200,
          "rounds_total": 3200,
          "firing_time_min": 20
        },
        {
          "role": "light_aa",
          "component": "uk27can",
          "mounts": 4,
          "barrels_per_mount": 8,
          "rounds_per_gun": 1400,
          "firing_time_min": 15
        }
      ],
      "aviation": {
        "catapults": 2,
        "catapult_rating_t": 3.2,
        "aircraft_capacity": 4,
        "catapult": "uk24cat"
      },
      "protection": {
        "belt_mm": 356,
        "deck_mm": 203,
        "barbette_mm": 356,
        "turret_mm": 432,
        "ct_mm": 203,
        "torpedo_defense": 1,
        "features": [
          "belt inclined 18 deg",
          "deck 203 mm over magazines, 102 mm over machinery",
          "torpedo bulkhead 4.6 m deep",
          "the G3 scheme of 1921, unaltered in every dimension through four classes"
        ]
      },
      "provisions": [
        {
          "interface": "barbette_ring",
          "count": 3,
          "fitted": 3,
          "state": "fitted"
        },
        {
          "interface": "secondary_base_ring",
          "count": 16,
          "fitted": 16,
          "state": "fitted"
        },
        {
          "interface": "cannon_position",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "director_tower",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "magazine_heavy",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "refueling_trunk",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "torpedo_tube_or_recess",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        }
      ],
      "sensors": [
        "uk32dir"
      ],
      "kits": [
        "uk30kit"
      ],
      "complement": 1980,
      "possible_upgrades": [
        "uk32sec",
        "uk39can",
        "uk38dir",
        "uk38rad",
        "uk41rad"
      ],
      "notes": "The Insuperable with a bigger hole in the barrel. The Mark III is the 1917 bore relined — Fisher's own gun, built for Furious — and Britain is the only navy that already owned 18-inch jigs."
    }
  },
  "incorrigible_bc35": {
    "id": "incorrigible_bc35",
    "nation": "GBR",
    "name": "Incorrigible",
    "type": "BC",
    "category": "capital_ship",
    "tons": 59000,
    "cost": 37000,
    "year": 1935,
    "durability": 6800,
    "speed": 36,
    "range": 14000,
    "shp": 265000,
    "caliber": 457,
    "barrels": 9,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 356,
    "deck": 254,
    "air": 0,
    "aa": 104,
    "scoutAircraft": 4,
    "sonar": false,
    "radar": false,
    "crew": 2450,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "incorrigible_bc35",
      "name": "Incorrigible",
      "parent_class": "incomparable_bc31",
      "changes": "+4,500 t standard; same length, the all-forward arrangement unaltered for the third time; +2.0 m beam, +0.4 m draft; +14,000 shp on the Mark IV plant for the same 36 kt; the belt is unchanged and everything else in the protective scheme grew: deck +51 mm and rearranged into two layers, machinery deck +76 mm, torpedo defense +4.4 m and five bulkheads liquid loaded, triple bottom; the anti-aircraft battery is the design: 24 dual-purpose barrels for 16 single 4.7-inch, 80 pom-pom barrels for 32, and six high-angle directors fitted; crew +470.",
      "nation": "GBR",
      "type": "BC",
      "treaty_category": "capital_ship",
      "generation": "fast_battleship",
      "design_year": 1935,
      "as_launched_year": 1935,
      "cost_gold": 37000,
      "durability": 6800,
      "displacement": {
        "empty_tons": 55000,
        "standard_tons": 59000,
        "full_load_tons": 65700
      },
      "dimensions": {
        "length_m": 285,
        "beam_m": 35,
        "draft_m": 10.6
      },
      "propulsion": {
        "plant": "[uk34eng] Mark IV, 600 psi / 450 C, 4 shafts",
        "shp": 265000,
        "speed_kn": 36,
        "range_km": 14000,
        "range_at_kn": 16,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 6700
      },
      "batteries": [
        {
          "role": "main",
          "component": "uk31gun",
          "mounts": 3,
          "barrels_per_mount": 3,
          "arrangement": "3 forward",
          "ammunition": "uk30shl",
          "rounds_per_gun": 90,
          "rounds_total": 810,
          "firing_time_min": 51
        },
        {
          "role": "secondary",
          "component": "uk32sec",
          "mounts": 12,
          "barrels_per_mount": 2,
          "arrangement": "6 per side",
          "rounds_per_gun": 300,
          "rounds_total": 7200,
          "firing_time_min": 25
        },
        {
          "role": "light_aa",
          "component": "uk27can",
          "mounts": 10,
          "barrels_per_mount": 8,
          "rounds_per_gun": 1400,
          "firing_time_min": 15
        }
      ],
      "aviation": {
        "catapults": 2,
        "catapult_rating_t": 3.2,
        "aircraft_capacity": 4,
        "catapult": "uk24cat"
      },
      "protection": {
        "belt_mm": 356,
        "deck_mm": 254,
        "barbette_mm": 356,
        "turret_mm": 432,
        "ct_mm": 203,
        "torpedo_defense": 5,
        "features": [
          "belt inclined 20 deg",
          "deck 254 mm in two layers (51 mm decapping over 203 mm main) over magazines, 178 mm over machinery",
          "torpedo defense 5 bulkheads, 9.0 m deep, liquid loaded",
          "triple bottom",
          "THE BELT IS THE G3's AND EVERYTHING ELSE GREW: this is the one ship in the ladder drawn against the airplane"
        ]
      },
      "provisions": [
        {
          "interface": "barbette_ring",
          "count": 3,
          "fitted": 3,
          "state": "fitted"
        },
        {
          "interface": "secondary_base_ring",
          "count": 12,
          "fitted": 12,
          "state": "fitted"
        },
        {
          "interface": "cannon_position",
          "count": 10,
          "fitted": 10,
          "state": "fitted"
        },
        {
          "interface": "director_tower",
          "count": 7,
          "fitted": 7,
          "state": "fitted",
          "notes": "One Mark II director and six high-angle directors, FITTED — the only ship in this navy whose air-defense control is designed in rather than refitted."
        },
        {
          "interface": "magazine_heavy",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "refueling_trunk",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "torpedo_tube_or_recess",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        }
      ],
      "sensors": [
        "uk32dir"
      ],
      "kits": [
        "uk30kit"
      ],
      "complement": 2450,
      "possible_upgrades": [
        "uk39can",
        "uk38dir",
        "uk38rad",
        "uk41rad"
      ],
      "notes": "The fourth statement of the same ship and the first that answers a different question. The requirement was written by two officers who spent 1933 and 1934 watching Fleet Air Arm exercises and concluded, in writing, that the thing which would sink a British capital ship was not going to be a British-sized gun."
    }
  },
  "ark_royal_cv31": {
    "id": "ark_royal_cv31",
    "nation": "GBR",
    "name": "Ark Royal class",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 25400,
    "cost": 10200,
    "year": 1930,
    "durability": 1700,
    "speed": 36,
    "range": 19000,
    "shp": 169000,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 114,
    "deck": 89,
    "air": 55,
    "aa": 48,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1680,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "ark_royal_cv31",
      "name": "Ark Royal class",
      "nation": "GBR",
      "type": "CV",
      "treaty_category": "aircraft_carrier",
      "generation": "interwar",
      "design_year": 1930,
      "as_launched_year": 1934,
      "cost_gold": 10200,
      "durability": 1700,
      "displacement": {
        "empty_tons": 23600,
        "standard_tons": 25400,
        "full_load_tons": 30700
      },
      "dimensions": {
        "length_m": 244,
        "beam_m": 29.4,
        "draft_m": 8.8
      },
      "propulsion": {
        "plant": "[uk30eng] Mark III, 500 psi / 400 C, 4 shafts",
        "shp": 169000,
        "speed_kn": 36,
        "range_km": 19000,
        "range_at_kn": 14,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 4700,
        "avgas_tons": 400
      },
      "aviation": {
        "flight_deck": true,
        "flight_deck_m": 244,
        "arresting_gear": true,
        "catapults": 2,
        "catapult_rating_t": 5.4,
        "elevators": 3,
        "elevator_type": "centerline",
        "hangar_m2": 3300,
        "hangar_clear_m": 4.9,
        "deck_park_m2": 900,
        "catapult": "uk30cat"
      },
      "batteries": [
        {
          "role": "secondary",
          "component": "uk32sec",
          "mounts": 8,
          "barrels_per_mount": 2,
          "arrangement": "4 per side",
          "rounds_per_gun": 250,
          "rounds_total": 4000,
          "firing_time_min": 21
        },
        {
          "role": "light_aa",
          "component": "uk27can",
          "mounts": 4,
          "barrels_per_mount": 8,
          "rounds_per_gun": 1400,
          "firing_time_min": 15
        }
      ],
      "protection": {
        "belt_mm": 114,
        "deck_mm": 89,
        "flight_deck_mm": 64,
        "features": [
          "belt over machinery and magazines",
          "89 mm hangar deck",
          "FLIGHT DECK ARMORED 64 mm over the hangar box, between the elevators — paid for out of the lower hangar",
          "avgas in cofferdammed cylindrical tanks"
        ]
      },
      "provisions": [
        {
          "interface": "secondary_base_ring",
          "count": 8,
          "fitted": 8,
          "state": "fitted"
        },
        {
          "interface": "cannon_position",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "director_tower",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "refueling_trunk",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        }
      ],
      "sensors": [
        "uk32dir"
      ],
      "kits": [
        "uk30kit"
      ],
      "complement": 1680,
      "possible_upgrades": [
        "uk39can",
        "uk38dir",
        "uk38rad",
        "uk41rad"
      ],
      "notes": "Approved in 1930 on a single argument, and it was not an aviation argument: A DECK THAT CANNOT KEEP UP WITH THE BATTLE LINE IS A DECK THIS FLEET HAS NO USE FOR."
    }
  },
  "swift_cl29": {
    "id": "swift_cl29",
    "nation": "GBR",
    "name": "Swift class",
    "type": "CL",
    "category": "auxiliary_combatant",
    "tons": 7200,
    "cost": 3900,
    "year": 1929,
    "durability": 620,
    "speed": 36,
    "range": 6700,
    "shp": 87000,
    "caliber": 152,
    "barrels": 6,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 51,
    "deck": 25,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 620,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "swift_cl29",
      "name": "Swift class",
      "nation": "GBR",
      "type": "CL",
      "treaty_category": "auxiliary_combatant",
      "generation": "scout_cruiser",
      "design_year": 1929,
      "as_launched_year": 1931,
      "cost_gold": 3900,
      "durability": 620,
      "displacement": {
        "empty_tons": 6700,
        "standard_tons": 7200,
        "full_load_tons": 8700
      },
      "dimensions": {
        "length_m": 195,
        "beam_m": 17.4,
        "draft_m": 5.4
      },
      "propulsion": {
        "plant": "[uk30eng] Mark III, 500 psi / 400 C, 4 shafts",
        "shp": 87000,
        "speed_kn": 36,
        "range_km": 6700,
        "range_at_kn": 14,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 1500
      },
      "batteries": [
        {
          "role": "main",
          "component": "uk29sec",
          "mounts": 2,
          "barrels_per_mount": 3,
          "arrangement": "1 forward / 1 aft",
          "rounds_per_gun": 150,
          "rounds_total": 900,
          "firing_time_min": 19
        },
        {
          "role": "torpedo",
          "component": "uk25lau",
          "mounts": 2,
          "tubes": 8,
          "arrangement": "centerline",
          "ammunition": "uk25tor",
          "stowage": 8
        }
      ],
      "armament": {
        "aa_battery": [
          {
            "count": 2,
            "caliber_mm": 102,
            "mounts": "single high-angle",
            "pattern": "1918",
            "rounds_per_gun": 200,
            "firing_time_min": 25
          }
        ]
      },
      "protection": {
        "belt_mm": 51,
        "deck_mm": 25,
        "torpedo_defense": 0,
        "features": [
          "belt over machinery and magazines only",
          "NO TORPEDO BULKHEAD",
          "35 percent of standard displacement is machinery, a fraction no warship in any navy has ever carried"
        ]
      },
      "provisions": [
        {
          "interface": "secondary_base_ring",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "torpedo_mount_seat",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "director_tower",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "cannon_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None. Nobody drawing a 36-knot cruiser with a quarter of her displacement in machinery was going to spend 16 tons on anti-aircraft."
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        },
        {
          "interface": "refueling_trunk",
          "count": 0,
          "fitted": 0,
          "state": "reserved",
          "notes": "None. She refuels from a hose over the bow like a destroyer."
        },
        {
          "interface": "sonar_dome",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        }
      ],
      "sensors": [
        "uk27dir"
      ],
      "complement": 620,
      "possible_upgrades": [
        "uk32sec",
        "uk27can",
        "uk39can",
        "uk30tor",
        "uk38tor",
        "uk33lau",
        "uk32dir",
        "uk38rad"
      ],
      "notes": "The fastest cruiser ever built and the only one that holds the fleet's 36 knots, and eight of the twenty-six Britain has against a stated trade-defense requirement of seventy. Her fit for the job the Empire's sea lanes actually require — sitting at 9 knots beside a convoy for three weeks — is nil, and the design does not pretend otherwise: her endurance at cruising speed is the shortest of any British cruiser since 1900, because a hull with that much plant in it has nowhere left to put oil."
    }
  },
  "county_ca24": {
    "id": "county_ca24",
    "nation": "GBR",
    "name": "County class",
    "type": "CA",
    "category": "auxiliary_combatant",
    "tons": 10000,
    "cost": 4100,
    "year": 1923,
    "durability": 780,
    "speed": 32,
    "range": 24000,
    "shp": 80000,
    "caliber": 203,
    "barrels": 8,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 25,
    "deck": 35,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 2,
    "sonar": false,
    "radar": false,
    "crew": 690,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "county_ca24",
      "name": "County class",
      "nation": "GBR",
      "type": "CA",
      "treaty_category": "auxiliary_combatant",
      "generation": "treaty_cruiser",
      "design_year": 1923,
      "as_launched_year": 1928,
      "cost_gold": 4100,
      "durability": 780,
      "displacement": {
        "empty_tons": 9300,
        "standard_tons": 10000,
        "full_load_tons": 13400
      },
      "dimensions": {
        "length_m": 192,
        "beam_m": 20.8,
        "draft_m": 6.4
      },
      "propulsion": {
        "plant": "[uk22eng] Mark I, 250 psi saturated, 4 shafts",
        "shp": 80000,
        "speed_kn": 32,
        "range_km": 24000,
        "range_at_kn": 12,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 3400
      },
      "armament": {
        "aa_battery": [
          {
            "count": 4,
            "caliber_mm": 102,
            "mounts": "single high-angle",
            "pattern": "1918",
            "rounds_per_gun": 200,
            "firing_time_min": 25
          }
        ]
      },
      "batteries": [
        {
          "role": "main",
          "mounts": 4,
          "barrels_per_mount": 2,
          "arrangement": "2 forward / 2 aft",
          "rounds_per_gun": 150,
          "rounds_total": 1200,
          "firing_time_min": 30,
          "spec": {
            "name": "8 in/50 pattern 1924",
            "caliber_in": 8,
            "caliber_mm": 203,
            "length_cal": 50,
            "count": 8,
            "notes": "Outside the Mark sequence: drawn to the treaty cruiser rules by an office that regarded them as an imposition, and never given a Mark number."
          }
        },
        {
          "role": "torpedo",
          "component": "uk25lau",
          "mounts": 2,
          "tubes": 8,
          "ammunition": "uk25tor",
          "stowage": 8
        }
      ],
      "aviation": {
        "catapults": 1,
        "catapult_rating_t": 3.2,
        "aircraft_capacity": 2,
        "catapult": "uk24cat"
      },
      "protection": {
        "belt_mm": 25,
        "deck_mm": 35,
        "turret_mm": 25,
        "torpedo_defense": 0,
        "features": [
          "bulges",
          "the treaty's compromise, not a British one"
        ]
      },
      "provisions": [
        {
          "interface": "torpedo_mount_seat",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        },
        {
          "interface": "sonar_dome",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        },
        {
          "interface": "refueling_trunk",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        },
        {
          "interface": "cannon_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        }
      ],
      "complement": 690,
      "possible_upgrades": [
        "uk32sec",
        "uk27can",
        "uk39can",
        "uk30tor",
        "uk38tor",
        "uk33lau",
        "uk27dir",
        "uk32dir",
        "uk26snr",
        "uk34snr",
        "uk22dpc",
        "uk37dpc",
        "uk38rad"
      ],
      "notes": "The last cruisers Britain builds to anybody else's requirement, and no British heavy cruiser has been laid down since 1927. Ten thousand tons and 8-inch guns are not a British specification; they are the specification the treaty wrote. At 32 knots she is not in the fast divisions at all: she works the China and America stations alone, unsupported, and the war plan does not say what she is supposed to do when found."
    }
  },
  "sabre_dd22": {
    "id": "sabre_dd22",
    "nation": "GBR",
    "name": "Sabre class",
    "type": "DD",
    "category": "auxiliary_combatant",
    "tons": 1400,
    "cost": 620,
    "year": 1922,
    "durability": 140,
    "speed": 34,
    "range": 8300,
    "shp": 38000,
    "caliber": 120,
    "barrels": 4,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": true,
    "radar": false,
    "crew": 175,
    "submergedSpeed": 0,
    "provisioned": 1,
    "raw": {
      "id": "sabre_dd22",
      "name": "Sabre class",
      "nation": "GBR",
      "type": "DD",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "design_year": 1922,
      "as_launched_year": 1926,
      "cost_gold": 620,
      "durability": 140,
      "displacement": {
        "empty_tons": 1270,
        "standard_tons": 1400,
        "full_load_tons": 1890
      },
      "dimensions": {
        "length_m": 104,
        "beam_m": 10.2,
        "draft_m": 3.5
      },
      "propulsion": {
        "plant": "[uk22eng] Mark I as launched; later flotillas take the generation current when their keels are laid",
        "shp": 38000,
        "speed_kn": 34,
        "range_km": 8300,
        "range_at_kn": 15,
        "fuel": "oil"
      },
      "fuel": {
        "oil_tons": 490
      },
      "batteries": [
        {
          "role": "main",
          "component": "uk24sec",
          "mounts": 4,
          "barrels_per_mount": 1,
          "arrangement": "2 forward / 2 aft",
          "rounds_per_gun": 200,
          "rounds_total": 800,
          "firing_time_min": 20
        },
        {
          "role": "torpedo",
          "component": "uk25lau",
          "mounts": 2,
          "tubes": 8,
          "arrangement": "centerline",
          "ammunition": "uk25tor",
          "stowage": 8
        },
        {
          "role": "mine",
          "component": "uk23min",
          "mounts": 1,
          "arrangement": "rails",
          "stowage": 40,
          "optional": true
        },
        {
          "role": "asw",
          "component": "uk22dpc",
          "mounts": 1,
          "arrangement": "stern rails and 2 throwers",
          "stowage": 30
        }
      ],
      "armament": {
        "aa_battery": [
          {
            "count": 2,
            "caliber_mm": 40,
            "mounts": "single 2 pdr",
            "pattern": "1921",
            "rounds_per_gun": 1000,
            "firing_time_min": 12
          }
        ]
      },
      "protection": {
        "features": []
      },
      "provisions": [
        {
          "interface": "secondary_base_ring",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "torpedo_mount_seat",
          "count": 2,
          "fitted": 2,
          "state": "fitted",
          "notes": "NO RELOAD STOWAGE. The flotilla's attack is a single throw, and the Torpedo Establishment has never been asked to change that."
        },
        {
          "interface": "sonar_dome",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "depth_charge_rail",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "mine_rail",
          "count": 1,
          "fitted": 0,
          "state": "foundation_only"
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        },
        {
          "interface": "refueling_trunk",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        }
      ],
      "sensors": [
        "uk26snr"
      ],
      "complement": 175,
      "possible_upgrades": [
        "uk32sec",
        "uk27can",
        "uk39can",
        "uk30tor",
        "uk38tor",
        "uk33lau",
        "uk27dir",
        "uk32dir",
        "uk34snr",
        "uk41snr",
        "uk37dpc",
        "uk39min",
        "uk38rad"
      ],
      "notes": "One destroyer design repeated in eight annual flotillas for fourteen years — THE ONLY PIECE OF STANDARDIZATION IN BRITISH NAVAL PROCUREMENT, and it happened because nobody senior was interested enough to reopen it. Each flotilla takes the machinery generation current when its keels are laid, so a 1934 Sabre is 4 knots faster than a 1924 Sabre and is otherwise the same ship: [uk27eng] 38,000 shp / 35.5 kt from 1928, [uk30eng] 40,000 shp / 36.5 kt from 1931, [uk34eng] 42,000 shp / 38 kt from 1934. She is the whole of Britain's escort force, her whole anti-submarine force and her whole torpedo striking power."
    }
  },
  "sturgeon_ss23": {
    "id": "sturgeon_ss23",
    "nation": "GBR",
    "name": "Sturgeon class",
    "type": "SS",
    "category": "auxiliary_combatant",
    "tons": 1400,
    "cost": 780,
    "year": 1923,
    "durability": 120,
    "speed": 15,
    "range": 19000,
    "shp": 3000,
    "caliber": 102,
    "barrels": 1,
    "tubes": 7,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": true,
    "radar": false,
    "crew": 46,
    "submergedSpeed": 9,
    "provisioned": 0,
    "raw": {
      "id": "sturgeon_ss23",
      "name": "Sturgeon class",
      "nation": "GBR",
      "type": "SS",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "design_year": 1923,
      "as_launched_year": 1926,
      "cost_gold": 780,
      "durability": 120,
      "displacement": {
        "empty_tons": 1290,
        "standard_tons": 1400,
        "full_load_tons": 1565,
        "submerged_tons": 1880
      },
      "dimensions": {
        "length_m": 84,
        "beam_m": 7.3,
        "draft_m": 4.1
      },
      "propulsion": {
        "plant": "diesel-electric, 2 shafts",
        "shp": 3000,
        "speed_kn": 15,
        "range_km": 19000,
        "range_at_kn": 10,
        "fuel": "diesel_electric"
      },
      "speed_submerged": {
        "surfaced_kn": 15,
        "snort_kn": 8,
        "sprint_kn": 9,
        "sprint_h": 0.92,
        "patrol_kn": 5,
        "patrol_h": 11,
        "creep_kn": 2,
        "creep_h": 56,
        "battery": "2 x 112-cell lead-acid",
        "recharge_h": 6,
        "test_depth_m": 90
      },
      "fuel": {
        "diesel_tons": 165
      },
      "batteries": [
        {
          "role": "main",
          "mounts": 1,
          "barrels_per_mount": 1,
          "arrangement": "single wet",
          "rounds_total": 120,
          "firing_time_min": 15,
          "spec": {
            "name": "4 in pattern 1921",
            "caliber_mm": 102,
            "count": 1,
            "notes": "A wet deck gun of 1921 pattern, outside the Mark sequence."
          }
        },
        {
          "role": "torpedo",
          "component": "uk25tor",
          "mounts": 7,
          "tubes": 7,
          "arrangement": "6 bow + 1 stern",
          "stowage": 13
        }
      ],
      "protection": {
        "features": []
      },
      "provisions": [
        {
          "interface": "torpedo_tube_or_recess",
          "count": 7,
          "fitted": 7,
          "state": "fitted"
        },
        {
          "interface": "sonar_dome",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 0,
          "fitted": 0,
          "state": "reserved"
        }
      ],
      "sensors": [
        "uk26snr"
      ],
      "complement": 46,
      "possible_upgrades": [
        "uk30tor",
        "uk38tor",
        "uk34snr",
        "uk41snr",
        "uk38rad",
        "uk41rad"
      ],
      "notes": "One design in 1923 and nothing since. The Fisher school worked out early and published internally that A SUBMERGED SUBMARINE AT 8 OR 9 KNOTS CAN ENGAGE A 40-KNOT SHIP ONLY IF THE SHIP DRIVES OVER IT, and having proved the boat harmless against itself, concluded without further examination that it was harmless generally. The submarine committee has met twice since 1929. Motors 1,350 shp. A good boat the doctrine has no theory for, and the men who command her know it."
    }
  },
  "seeadler_raider": {
    "id": "seeadler_raider",
    "nation": "DEU",
    "name": "Seeadler class",
    "type": "CA",
    "category": "auxiliary_combatant",
    "tons": 19000,
    "cost": 9200,
    "year": 1935,
    "durability": 1900,
    "speed": 33,
    "range": 64000,
    "shp": 124000,
    "caliber": 283,
    "barrels": 6,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 100,
    "deck": 45,
    "air": 0,
    "aa": 16,
    "scoutAircraft": 4,
    "sonar": true,
    "radar": true,
    "crew": 1050,
    "submergedSpeed": 0,
    "provisioned": 2,
    "raw": {
      "id": "seeadler_raider",
      "name": "Seeadler class",
      "nation": "DEU",
      "type": "CA",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "design_year": 1935,
      "cost_gold": 9200,
      "durability": 1900,
      "displacement": {
        "empty_tons": 17800,
        "standard_tons": 19000,
        "full_load_tons": 25400
      },
      "dimensions": {
        "length_m": 224,
        "beam_m": 22.5,
        "draft_m": 8.6
      },
      "machinery": {
        "bays": 8,
        "cruise_bank": 2,
        "drive": "geared",
        "swap": "one bedplate footprint per cylinder group",
        "fits": [
          {
            "component": "de26eng",
            "shp": 124000,
            "speed_kn": 33,
            "range_km": 64000,
            "cruise_kn": 18,
            "condition": "combined diesel-turbine; the diesel groups are the cruise plant and the turbines the dash"
          },
          {
            "component": "de36eng",
            "shp": 124000,
            "speed_kn": 33,
            "range_km": 64000,
            "cruise_kn": 18
          },
          {
            "component": "de43eng",
            "shp": 124000,
            "speed_kn": 33,
            "range_km": 64000,
            "cruise_kn": 18
          }
        ]
      },
      "fuel": {
        "oil_tons": 6000,
        "avgas_tons": 150
      },
      "batteries": [
        {
          "role": "main",
          "component": "de30gun",
          "mounts": 2,
          "barrels_per_mount": 3,
          "arrangement": "both forward, superfiring",
          "rounds_per_gun": 120,
          "rounds_total": 720,
          "firing_time_min": 48
        },
        {
          "role": "secondary",
          "component": "de31sec",
          "mounts": 4,
          "barrels_per_mount": 2,
          "arrangement": "waist",
          "rounds_per_gun": 200,
          "rounds_total": 1600,
          "firing_time_min": 13
        },
        {
          "role": "light_aa",
          "component": "de34can",
          "mounts": 4,
          "barrels_per_mount": 2,
          "rounds_per_gun": 2000,
          "firing_time_min": 17
        },
        {
          "role": "torpedo",
          "component": "de28tor",
          "mounts": 8,
          "tubes": 8,
          "arrangement": "fixed, 4 per side at 55 and 125 degrees",
          "stowage": 24
        },
        {
          "role": "mine",
          "component": "de27min",
          "mounts": 2,
          "arrangement": "removable rails",
          "stowage": 120,
          "optional": true
        },
        {
          "role": "asw",
          "component": "de29dpc",
          "mounts": 1,
          "stowage": 24
        }
      ],
      "aviation": {
        "catapults": 1,
        "catapult_rating_t": 4,
        "aircraft_capacity": 4,
        "hangar_m2": 300,
        "catapult": "de35cat"
      },
      "protection": {
        "belt_mm": 100,
        "deck_mm": 45,
        "features": [
          "100 mm belt over the FORWARD citadel only",
          "80 mm magazine crowns",
          "45 mm splinter deck aft",
          "the after body is subdivided as a tanker and is NOT armored"
        ]
      },
      "provisions": [
        {
          "interface": "barbette_ring",
          "count": 2,
          "fitted": 2,
          "state": "fitted",
          "notes": "Forward."
        },
        {
          "interface": "secondary_base_ring",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "cannon_position",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "director_trunnion",
          "count": 2,
          "fitted": 2,
          "state": "fitted",
          "notes": "Forward tower and after control. The whole installation lifts out as one article; the after trunnion takes it if the forward tower is lost."
        },
        {
          "interface": "radar_search_position",
          "count": 2,
          "fitted": 1,
          "state": "wired"
        },
        {
          "interface": "hydrophone_well",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "mine_rail",
          "count": 2,
          "fitted": 0,
          "state": "foundation_only",
          "notes": "Rail sockets; none carried as launched."
        },
        {
          "interface": "depth_charge_rail",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "engine_bay",
          "count": 8,
          "fitted": 8,
          "state": "fitted"
        },
        {
          "interface": "degaussing_channels",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "transfer_boom_hardpoints",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "catapult_foundation",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "torpedo_tube_or_recess",
          "count": 8,
          "fitted": 8,
          "state": "fitted",
          "notes": "Fixed tubes, 4 per side at 55 and 125 degrees. A raider does not train them; she turns."
        }
      ],
      "sensors": [
        "de33rad",
        "de33snr",
        "de31dir"
      ],
      "cargo_gear": [
        "2 x 15 t derricks",
        "alongside oil, torpedo and provision transfer under way at up to 8 kt"
      ],
      "complement": 1050,
      "possible_upgrades": [
        "de40can",
        "de38tor",
        "de43tor",
        "de40rad",
        "de44rad",
        "de40det",
        "de44det",
        "de40snr",
        "de43snr",
        "de41dir"
      ],
      "notes": "The only thing Germany builds that floats on the surface by choice: a fast commerce raider that is also a mobile base. She is built for REACH AND SEARCH, not viability. Crew is 1,050 ship's company plus 180 tender staff and 120 transient berths. Sensors include a long-range direction-finding loop and homing transmitter, 400 km. Minesweeping option."
    }
  },
  "atlantis_raider": {
    "id": "atlantis_raider",
    "nation": "DEU",
    "name": "Atlantis class",
    "type": "CA",
    "category": "auxiliary_combatant",
    "tons": 21000,
    "cost": 10400,
    "year": 1940,
    "durability": 2150,
    "speed": 33,
    "range": 72000,
    "shp": 136000,
    "caliber": 283,
    "barrels": 6,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 110,
    "deck": 50,
    "air": 0,
    "aa": 24,
    "scoutAircraft": 4,
    "sonar": true,
    "radar": true,
    "crew": 1120,
    "submergedSpeed": 0,
    "provisioned": 2,
    "raw": {
      "id": "atlantis_raider",
      "name": "Atlantis class",
      "parent_class": "seeadler_raider",
      "changes": "hangar +120 m², catapult and crane uprated for a twin-engined aircraft; quadruple 2 cm light battery for the twin 3.7 cm; FuMO C/37 and the G7e as launched; transferable outfit 80 torpedoes and 3,600 t of oil; standard +2,000 t; crew +70 ship's company, +20 tender staff.",
      "nation": "DEU",
      "type": "CA",
      "treaty_category": "auxiliary_combatant",
      "generation": "wartime",
      "design_year": 1940,
      "cost_gold": 10400,
      "durability": 2150,
      "displacement": {
        "empty_tons": 19600,
        "standard_tons": 21000,
        "full_load_tons": 28300
      },
      "dimensions": {
        "length_m": 232,
        "beam_m": 23.4,
        "draft_m": 8.9
      },
      "machinery": {
        "bays": 8,
        "cruise_bank": 2,
        "drive": "geared",
        "fits": [
          {
            "component": "de36eng",
            "shp": 136000,
            "speed_kn": 33,
            "range_km": 72000,
            "cruise_kn": 18,
            "condition": "combined diesel-turbine"
          },
          {
            "component": "de43eng",
            "shp": 136000,
            "speed_kn": 33,
            "range_km": 72000,
            "cruise_kn": 18
          }
        ]
      },
      "fuel": {
        "oil_tons": 6800,
        "avgas_tons": 220
      },
      "batteries": [
        {
          "role": "main",
          "component": "de30gun",
          "mounts": 2,
          "barrels_per_mount": 3,
          "arrangement": "both forward, superfiring",
          "rounds_per_gun": 120,
          "rounds_total": 720,
          "firing_time_min": 48
        },
        {
          "role": "secondary",
          "component": "de31sec",
          "mounts": 4,
          "barrels_per_mount": 2,
          "arrangement": "waist",
          "rounds_per_gun": 200,
          "rounds_total": 1600,
          "firing_time_min": 13
        },
        {
          "role": "light_aa",
          "component": "de40can",
          "mounts": 4,
          "barrels_per_mount": 4,
          "rounds_per_gun": 2000,
          "firing_time_min": 4
        },
        {
          "role": "torpedo",
          "component": "de38tor",
          "mounts": 8,
          "tubes": 8,
          "arrangement": "fixed, 4 per side at 55 and 125 degrees",
          "stowage": 24
        },
        {
          "role": "mine",
          "component": "de27min",
          "mounts": 2,
          "arrangement": "removable rails",
          "stowage": 120,
          "optional": true
        },
        {
          "role": "asw",
          "component": "de29dpc",
          "mounts": 1,
          "stowage": 24
        }
      ],
      "aviation": {
        "catapults": 1,
        "catapult_rating_t": 9,
        "aircraft_capacity": 4,
        "hangar_m2": 420,
        "catapult": "de40cat"
      },
      "protection": {
        "belt_mm": 110,
        "deck_mm": 50,
        "features": [
          "110 mm belt over the forward citadel",
          "90 mm magazine crowns",
          "50 mm splinter deck aft",
          "the after body is subdivided as a tanker and is not armored"
        ]
      },
      "provisions": [
        {
          "interface": "barbette_ring",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "secondary_base_ring",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "cannon_position",
          "count": 4,
          "fitted": 4,
          "state": "fitted"
        },
        {
          "interface": "director_trunnion",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 3,
          "fitted": 1,
          "state": "wired"
        },
        {
          "interface": "hydrophone_well",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "mine_rail",
          "count": 2,
          "fitted": 0,
          "state": "foundation_only"
        },
        {
          "interface": "depth_charge_rail",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "engine_bay",
          "count": 8,
          "fitted": 8,
          "state": "fitted"
        },
        {
          "interface": "degaussing_channels",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "transfer_boom_hardpoints",
          "count": 6,
          "fitted": 6,
          "state": "fitted"
        },
        {
          "interface": "catapult_foundation",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "torpedo_tube_or_recess",
          "count": 8,
          "fitted": 8,
          "state": "fitted",
          "notes": "Fixed tubes, 4 per side at 55 and 125 degrees. A raider does not train them; she turns."
        }
      ],
      "sensors": [
        "de40rad",
        "de33snr",
        "de31dir"
      ],
      "cargo_gear": [
        "2 x 20 t derricks",
        "alongside oil, torpedo and provision transfer under way at up to 8 kt"
      ],
      "complement": 1120,
      "possible_upgrades": [
        "de43tor",
        "de44rad",
        "de40det",
        "de44det",
        "de40snr",
        "de43snr",
        "de41dir"
      ],
      "notes": "Crew 1,120 ship's company plus 200 tender staff and 140 transient berths. NOT IN EXISTENCE at as_of — she is a 1940 design, four years away. Listed because the raider line was never allowed to close."
    }
  },
  "hecht_typ2": {
    "id": "hecht_typ2",
    "nation": "DEU",
    "name": "Hecht",
    "type": "SS",
    "category": "auxiliary_combatant",
    "tons": 320,
    "cost": 320,
    "year": 1927,
    "durability": 55,
    "speed": 13,
    "range": 5500,
    "shp": 700,
    "caliber": 0,
    "barrels": 0,
    "tubes": 3,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": true,
    "radar": false,
    "crew": 25,
    "submergedSpeed": 7,
    "provisioned": 1,
    "raw": {
      "id": "hecht_typ2",
      "name": "Hecht",
      "nation": "DEU",
      "type": "SS",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "design_year": 1927,
      "cost_gold": 320,
      "durability": 55,
      "displacement": {
        "empty_tons": 300,
        "standard_tons": 320,
        "full_load_tons": 345,
        "submerged_tons": 420
      },
      "dimensions": {
        "length_m": 44,
        "beam_m": 4.1,
        "draft_m": 3.9
      },
      "battery": {
        "component": "de27bat",
        "cells": 62,
        "groups": 1,
        "recharge_h": 2,
        "kwh_total": 682,
        "kwh_per_t_submerged": 1.62,
        "refit_groups": [
          "de37bat",
          "de41bat"
        ],
        "notes": "62 x C/25 cells, single group."
      },
      "machinery": {
        "bays": 1,
        "cruise_bank": 1,
        "drive": "electric",
        "fits": [
          {
            "component": "de26eng",
            "shp": 700,
            "motor_shp": 360,
            "speed_kn": 13,
            "range_km": 5500,
            "cruise_kn": 10
          },
          {
            "component": "de36eng",
            "shp": 700,
            "motor_shp": 360,
            "speed_kn": 13,
            "range_km": 5500,
            "cruise_kn": 10
          }
        ]
      },
      "speed_submerged": {
        "surfaced_kn": 13,
        "snort_kn": 7,
        "sprint_kn": 7,
        "sprint_h": 1,
        "patrol_kn": 4,
        "patrol_h": 12,
        "creep_kn": 2,
        "creep_h": 60,
        "battery": "62 x C/25 cells, single group",
        "recharge_h": 2,
        "test_depth_m": 80
      },
      "fuel": {
        "diesel_tons": 25
      },
      "batteries": [
        {
          "role": "torpedo",
          "component": "de28tor",
          "mounts": 3,
          "tubes": 3,
          "arrangement": "bow",
          "stowage": 6
        }
      ],
      "protection": {
        "features": []
      },
      "provisions": [
        {
          "interface": "torpedo_tube_or_recess",
          "count": 3,
          "fitted": 3,
          "state": "fitted"
        },
        {
          "interface": "hydrophone_well",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 1,
          "fitted": 0,
          "state": "wired"
        },
        {
          "interface": "battery_group_hatch",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "engine_bay",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        }
      ],
      "sensors": [
        "de27snr"
      ],
      "complement": 25,
      "possible_upgrades": [
        "de38tor",
        "de33snr",
        "de40det"
      ],
      "notes": "Small, cheap, many. The early mass item and the training pipeline both, and the reason every ocean-boat crew already knows its trade. Twelve months keel to commissioning."
    },
    "buildDays": 365
  },
  "wolf_typ7": {
    "id": "wolf_typ7",
    "nation": "DEU",
    "name": "Wolf",
    "type": "SS",
    "category": "auxiliary_combatant",
    "tons": 1120,
    "cost": 1900,
    "year": 1933,
    "durability": 165,
    "speed": 18.5,
    "range": 30000,
    "shp": 4400,
    "caliber": 88,
    "barrels": 1,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": true,
    "radar": true,
    "crew": 50,
    "submergedSpeed": 7.5,
    "provisioned": 2,
    "raw": {
      "id": "wolf_typ7",
      "name": "Wolf",
      "nation": "DEU",
      "type": "SS",
      "treaty_category": "auxiliary_combatant",
      "generation": "interwar",
      "design_year": 1933,
      "cost_gold": 1900,
      "durability": 165,
      "displacement": {
        "empty_tons": 1050,
        "standard_tons": 1120,
        "full_load_tons": 1380,
        "submerged_tons": 1540
      },
      "dimensions": {
        "length_m": 78,
        "beam_m": 6.8,
        "draft_m": 4.9
      },
      "battery": {
        "component": "de27bat",
        "cells": 240,
        "groups": 2,
        "recharge_h": 4,
        "kwh_total": 2640,
        "kwh_per_t_submerged": 1.71,
        "refit_groups": [
          "de37bat",
          "de41bat"
        ],
        "notes": "240 x C/25 cells, two groups."
      },
      "machinery": {
        "bays": 2,
        "cruise_bank": 1,
        "drive": "electric",
        "fits": [
          {
            "component": "de26eng",
            "shp": 4400,
            "motor_shp": 1000,
            "speed_kn": 18.5,
            "range_km": 30000,
            "cruise_kn": 10
          },
          {
            "component": "de36eng",
            "shp": 4400,
            "motor_shp": 1000,
            "speed_kn": 18.5,
            "range_km": 30000,
            "cruise_kn": 10
          },
          {
            "component": "de43eng",
            "shp": 4400,
            "motor_shp": 1000,
            "speed_kn": 18.5,
            "range_km": 30000,
            "cruise_kn": 10
          }
        ]
      },
      "speed_submerged": {
        "surfaced_kn": 18.5,
        "snort_kn": 9,
        "sprint_kn": 7.5,
        "sprint_h": 1,
        "patrol_kn": 4,
        "patrol_h": 20,
        "creep_kn": 2,
        "creep_h": 120,
        "battery": "240 x C/25 cells, two groups",
        "recharge_h": 4,
        "test_depth_m": 140
      },
      "fuel": {
        "diesel_tons": 260
      },
      "batteries": [
        {
          "role": "main",
          "component": "de29gun",
          "mounts": 1,
          "barrels_per_mount": 1,
          "arrangement": "wet mounting",
          "rounds_total": 180,
          "firing_time_min": 12
        },
        {
          "role": "torpedo",
          "component": "de28tor",
          "mounts": 6,
          "tubes": 6,
          "arrangement": "4 bow, 2 stern",
          "stowage": 22
        }
      ],
      "protection": {
        "features": []
      },
      "provisions": [
        {
          "interface": "torpedo_tube_or_recess",
          "count": 6,
          "fitted": 6,
          "state": "fitted"
        },
        {
          "interface": "boat_gun_mount",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "hydrophone_well",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 2,
          "fitted": 1,
          "state": "wired",
          "notes": "Retractable mast, struck for diving."
        },
        {
          "interface": "snorkel_trunk_foundation",
          "count": 1,
          "fitted": 0,
          "state": "foundation_only",
          "notes": "Every boat drawn since 1929 carries it. The fitting that fills it is eleven years away."
        },
        {
          "interface": "battery_group_hatch",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "engine_bay",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        }
      ],
      "sensors": [
        "de33rad",
        "de33snr"
      ],
      "complement": 50,
      "kits": [
        "de40kit"
      ],
      "possible_upgrades": [
        "de38tor",
        "de43tor",
        "de40rad",
        "de44rad",
        "de40det",
        "de44det",
        "de40snr",
        "de43snr"
      ],
      "notes": "Thirty thousand kilometers on her own bunker, six tubes, a heavy outfit and A SEARCH SET ON HER MAST, because a boat that must find its own targets across a thousand kilometers of empty water cannot do it with a pair of eyes eight meters above the sea. She reaches the Cape, the Caribbean or the Indian Ocean and returns without meeting anybody. Long-range wireless and direction-finding loop."
    },
    "buildDays": 730
  },
  "hai_typ9": {
    "id": "hai_typ9",
    "nation": "DEU",
    "name": "Hai",
    "type": "SS",
    "category": "auxiliary_combatant",
    "tons": 840,
    "cost": 1250,
    "year": 1937,
    "durability": 135,
    "speed": 18,
    "range": 16000,
    "shp": 3200,
    "caliber": 88,
    "barrels": 1,
    "tubes": 5,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": true,
    "radar": true,
    "crew": 46,
    "submergedSpeed": 7.5,
    "provisioned": 2,
    "raw": {
      "id": "hai_typ9",
      "name": "Hai",
      "nation": "DEU",
      "type": "SS",
      "treaty_category": "auxiliary_combatant",
      "generation": "wartime",
      "design_year": 1937,
      "cost_gold": 1250,
      "durability": 135,
      "displacement": {
        "empty_tons": 780,
        "standard_tons": 840,
        "full_load_tons": 970,
        "submerged_tons": 1120
      },
      "dimensions": {
        "length_m": 68,
        "beam_m": 6.3,
        "draft_m": 4.7
      },
      "battery": {
        "component": "de37bat",
        "cells": 124,
        "groups": 2,
        "recharge_h": 3,
        "kwh_total": 3348,
        "kwh_per_t_submerged": 2.99,
        "refit_groups": [
          "de41bat"
        ],
        "notes": "124 x C/34 cells, two groups."
      },
      "machinery": {
        "bays": 2,
        "cruise_bank": 1,
        "drive": "electric",
        "fits": [
          {
            "component": "de36eng",
            "shp": 3200,
            "motor_shp": 800,
            "speed_kn": 18,
            "range_km": 16000,
            "cruise_kn": 10
          },
          {
            "component": "de43eng",
            "shp": 3200,
            "motor_shp": 800,
            "speed_kn": 18,
            "range_km": 16000,
            "cruise_kn": 10
          }
        ]
      },
      "speed_submerged": {
        "surfaced_kn": 18,
        "snort_kn": 9,
        "sprint_kn": 7.5,
        "sprint_h": 1,
        "patrol_kn": 4,
        "patrol_h": 32,
        "creep_kn": 2,
        "creep_h": 115,
        "battery": "124 x C/34 cells, two groups",
        "recharge_h": 3,
        "test_depth_m": 150
      },
      "fuel": {
        "diesel_tons": 130
      },
      "batteries": [
        {
          "role": "main",
          "component": "de29gun",
          "mounts": 1,
          "barrels_per_mount": 1,
          "arrangement": "wet mounting",
          "rounds_total": 180,
          "firing_time_min": 12
        },
        {
          "role": "torpedo",
          "component": "de28tor",
          "mounts": 5,
          "tubes": 5,
          "arrangement": "4 bow, 1 stern",
          "stowage": 14
        }
      ],
      "protection": {
        "features": []
      },
      "provisions": [
        {
          "interface": "torpedo_tube_or_recess",
          "count": 5,
          "fitted": 5,
          "state": "fitted"
        },
        {
          "interface": "boat_gun_mount",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "hydrophone_well",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 2,
          "fitted": 1,
          "state": "wired"
        },
        {
          "interface": "snorkel_trunk_foundation",
          "count": 1,
          "fitted": 0,
          "state": "foundation_only"
        },
        {
          "interface": "battery_group_hatch",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "engine_bay",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        }
      ],
      "sensors": [
        "de33rad",
        "de33snr"
      ],
      "complement": 46,
      "kits": [
        "de40kit"
      ],
      "possible_upgrades": [
        "de38tor",
        "de43tor",
        "de40rad",
        "de44rad",
        "de40det",
        "de44det",
        "de40snr",
        "de43snr"
      ],
      "notes": "THE BOAT THE CAMPAIGN IS MADE OF. A whole ocean boat that gives up a third of the bunker, a pair of tubes and two meters of depth, and comes out of the shed in TEN MONTHS AT ANY OF SIX YARDS, NONE OF THEM NAVAL. Drawn by people who had read the 1917 shipping returns rather than the 1916 fleet returns. NOT IN EXISTENCE at as_of — a 1937 design."
    }
  },
  "schwertwal_typ21": {
    "id": "schwertwal_typ21",
    "nation": "DEU",
    "name": "Schwertwal",
    "type": "SS",
    "category": "auxiliary_combatant",
    "tons": 2000,
    "cost": 4200,
    "year": 1941,
    "durability": 260,
    "speed": 16,
    "range": 16000,
    "shp": 4000,
    "caliber": 0,
    "barrels": 0,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": true,
    "radar": true,
    "crew": 62,
    "submergedSpeed": 18,
    "provisioned": 1,
    "raw": {
      "id": "schwertwal_typ21",
      "name": "Schwertwal",
      "nation": "DEU",
      "type": "SS",
      "treaty_category": "auxiliary_combatant",
      "generation": "wartime",
      "design_year": 1941,
      "cost_gold": 4200,
      "durability": 260,
      "displacement": {
        "empty_tons": 1900,
        "standard_tons": 2000,
        "full_load_tons": 2270,
        "submerged_tons": 2450
      },
      "dimensions": {
        "length_m": 84,
        "beam_m": 7.4,
        "draft_m": 6.4
      },
      "battery": {
        "component": "de41bat",
        "cells": 350,
        "groups": 5,
        "recharge_h": 4,
        "kwh_total": 14000,
        "kwh_per_t_submerged": 5.71,
        "refit_groups": [],
        "notes": "350 x C/39 cells, five groups - 14,000 kWh, or 5.71 kWh per ton submerged, which is 3.3 times the ocean boat. The cell itself is 73 percent better; the rest is a hull designed around it."
      },
      "machinery": {
        "bays": 2,
        "cruise_bank": 1,
        "drive": "electric",
        "swap": "closed-cycle diesel bank 1,900 shp in addition to the main groups",
        "fits": [
          {
            "component": "de36eng",
            "shp": 4000,
            "motor_shp": 6400,
            "speed_kn": 16,
            "range_km": 16000,
            "cruise_kn": 10,
            "condition": "snorkelling"
          },
          {
            "component": "de43eng",
            "shp": 4000,
            "motor_shp": 6400,
            "speed_kn": 16,
            "range_km": 16000,
            "cruise_kn": 10,
            "condition": "snorkelling"
          }
        ]
      },
      "speed_submerged": {
        "surfaced_kn": 16,
        "snort_kn": 11,
        "sprint_kn": 18,
        "sprint_h": 2,
        "patrol_kn": 10,
        "patrol_h": 15,
        "creep_kn": 3,
        "creep_h": 240,
        "battery": "350 x C/41 cells, five groups",
        "recharge_h": 4,
        "test_depth_m": 200
      },
      "fuel": {
        "diesel_tons": 270
      },
      "batteries": [
        {
          "role": "torpedo",
          "component": "de38tor",
          "mounts": 6,
          "tubes": 6,
          "arrangement": "bow, hydraulic reload — whole outfit fired and reloaded in 12 min",
          "stowage": 24
        }
      ],
      "protection": {
        "features": [
          "acoustic cladding over the pressure hull",
          "rafted machinery",
          "non-magnetic casing and fittings",
          "escape trunks forward and aft"
        ]
      },
      "provisions": [
        {
          "interface": "torpedo_tube_or_recess",
          "count": 6,
          "fitted": 6,
          "state": "fitted"
        },
        {
          "interface": "hydrophone_well",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "radar_search_position",
          "count": 3,
          "fitted": 2,
          "state": "wired"
        },
        {
          "interface": "snorkel_trunk_foundation",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "battery_group_hatch",
          "count": 5,
          "fitted": 5,
          "state": "fitted"
        },
        {
          "interface": "engine_bay",
          "count": 2,
          "fitted": 2,
          "state": "fitted"
        },
        {
          "interface": "transfer_boom_hardpoints",
          "count": 1,
          "fitted": 1,
          "state": "fitted",
          "notes": "Alongside transfer: oil, torpedo, provision."
        }
      ],
      "sensors": [
        "de40snr",
        "de40rad",
        "de40det"
      ],
      "complement": 62,
      "possible_upgrades": [
        "de43tor",
        "de44rad",
        "de44det",
        "de43snr"
      ],
      "notes": "THE BOAT THAT DOES NOT COME UP. No gun. Its stated priority is not tonnage sunk but CREWS BROUGHT BACK, which is what a navy building nothing else can afford to optimize for. Ten knots submerged for 18 hours on the battery and 60 on the closed-cycle bank. Fuel includes 90 t liquid oxidant for that bank. NOT IN EXISTENCE at as_of — a 1941 design, and the designed answer to a countermeasure that has not happened yet."
    }
  },
  "maru_depot_t23": {
    "id": "maru_depot_t23",
    "nation": "JPN",
    "name": "Standard Maru fleet tender",
    "type": "AD",
    "category": "support",
    "tons": 4700,
    "cost": 530,
    "year": 1923,
    "durability": 290,
    "speed": 13,
    "range": 12000,
    "shp": 4000,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 34,
    "submergedSpeed": 0,
    "provisioned": 7,
    "raw": {
      "id": "maru_depot_t23",
      "name": "Standard Maru fleet tender",
      "nation": "JPN",
      "type": "AD",
      "treaty_category": "exempt",
      "generation": "standardized",
      "design_year": 1923,
      "type_year": 1923,
      "cost_gold": 530,
      "durability": 290,
      "displacement": {
        "empty_tons": 4640,
        "standard_tons": 4700,
        "full_load_tons": 16200
      },
      "dimensions": {
        "length_m": 135,
        "beam_m": 18.2,
        "draft_m": 9
      },
      "fitouts": [
        {
          "id": "dry_cargo",
          "cargo_tons": 10500,
          "cost_gold": 530,
          "durability": 290,
          "crew": 34
        },
        {
          "id": "tanker",
          "liquid_tons": 10500,
          "cost_gold": 530,
          "durability": 290,
          "crew": 34
        },
        {
          "id": "transport",
          "troops": 2000,
          "vehicles_stores_tons": 2000,
          "cost_gold": 530,
          "durability": 290,
          "crew": 34
        },
        {
          "id": "escort_carrier",
          "cost_gold": 1000,
          "durability": 315,
          "crew": 260,
          "kit": "jp31kit",
          "notes": "Or a fresh hull completed new to the same drawings — it is the same ship. Adds 300 t avgas, double cofferdams and CO2 inerting."
        }
      ],
      "machinery": {
        "bays": 4,
        "cruise_bank": 1,
        "drive": "diesel_electric",
        "swap": "cartridge swaps at sea for ships alongside, in sheltered water, on the 50 t heavy derrick",
        "fits": [
          {
            "component": "jp22eng",
            "shp": 4000,
            "speed_kn": 13,
            "range_km": 12000,
            "cruise_kn": 8,
            "condition": "at merchant full load"
          },
          {
            "component": "jp32eng",
            "shp": 12000,
            "speed_kn": 17.5,
            "range_km": 25000,
            "cruise_kn": 11,
            "condition": "at merchant full load"
          },
          {
            "component": "jp42eng",
            "shp": 16000,
            "speed_kn": 19,
            "range_km": 28000,
            "cruise_kn": 12,
            "condition": "at merchant full load"
          }
        ]
      },
      "fuel": {
        "diesel_tons": 860
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "batteries": [],
      "protection": {
        "features": [
          "split switchboards + casualty power"
        ]
      },
      "provisions": [
        {
          "interface": "barbette_ring",
          "count": 1,
          "fitted": 0,
          "for": "jp29gun",
          "state": "plated_over",
          "notes": "An empty barbette ring on the poop with nothing to issue against it."
        },
        {
          "interface": "cannon_position",
          "count": 4,
          "fitted": 0,
          "for": "jp29can",
          "state": "wired"
        },
        {
          "interface": "radar_search_position",
          "count": 1,
          "fitted": 0,
          "for": "jp41rad",
          "state": "wired"
        },
        {
          "interface": "depth_charge_rail",
          "count": 1,
          "fitted": 0,
          "for": "jp32dpc",
          "state": "foundation_only"
        },
        {
          "interface": "rocket_rail",
          "count": 1,
          "fitted": 0,
          "for": "jp39rkt",
          "state": "foundation_only"
        },
        {
          "interface": "escort_carrier_fittings",
          "count": 1,
          "fitted": 0,
          "for": "jp31kit",
          "state": "foundation_only",
          "notes": "Flight-deck foundations drawn with the hull in 1923 and priced in like corrosion allowance — eight years before the kit, and before the aircraft that would fly off it."
        },
        {
          "interface": "fleet_refueling_rig",
          "count": 1,
          "fitted": 1,
          "state": "fitted"
        },
        {
          "interface": "engine_bay",
          "count": 4,
          "fitted": 4,
          "state": "fitted",
          "notes": "Lendable. The swap economy's civilian branch: her bays and heavy derrick lend cartridges to warships at sea and take them back."
        },
        {
          "interface": "beacon_net",
          "count": 1,
          "fitted": 0,
          "for": "jp31bcn",
          "state": "wired"
        }
      ],
      "cargo_gear": [
        "1 x 50 t heavy derrick"
      ],
      "kits": [
        "jp31kit"
      ],
      "complement": 34,
      "possible_upgrades": [
        "jp29gun",
        "jp42gun",
        "jp42shl",
        "jp29can",
        "jp43can",
        "jp41rad",
        "jp45rad",
        "jp32dpc",
        "jp42dpc",
        "jp39rkt",
        "jp44rkt"
      ],
      "notes": "The registry counts freighters; the plan counts hulls. Mobilization stored as commerce. Escort-carrier fitout adds a fleet homing beacon, 300 km.",
      "sensors": [],
      "armament": {
        "main_battery": {
          "caliber_mm": 0,
          "count": 0
        }
      }
    },
    "service": "support",
    "notes": "Standard Maru oiler/depot hybrid. Admirals route fuel deliveries to fleets and use its workshops for local supply while stationed in a friendly port. Naval support, separate from merchant GRT.",
    "buildable": true,
    "supportHybrid": true,
    "buildUntil": 1951
  },
  "rn_fleet_oiler": {
    "id": "rn_fleet_oiler",
    "nation": "GBR",
    "name": "Fast fleet oiler",
    "type": "AO",
    "category": "support",
    "tons": 0,
    "cost": 0,
    "year": 1930,
    "durability": 0,
    "speed": 0,
    "range": 0,
    "shp": 0,
    "caliber": 0,
    "barrels": 0,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 0,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 0,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "rn_fleet_oiler",
      "nation": "GBR",
      "name": "Fast fleet oiler",
      "type": "AO",
      "design_year": 1930
    },
    "service": "support",
    "notes": "Count-only support entry: 16 oilers in Fisher’s Ghost §3.1. Tonnage, machinery, crew and maintenance costs are not yet cataloged.",
    "buildable": false,
    "unknownSpecs": true
  },
  "uk_depot_1932": {
    "id": "uk_depot_1932",
    "nation": "GBR",
    "name": "Fleet depot · 1932",
    "type": "AD",
    "category": "other",
    "tons": 6500,
    "cost": 4100,
    "year": 1932,
    "durability": 542,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 330,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "uk_depot_1932",
      "nation": "GBR",
      "name": "Fleet depot · 1932",
      "type": "AD",
      "design_year": 1932,
      "displacement": {
        "standard_tons": 6500,
        "full_load_tons": 9000
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 330,
      "cost_gold": 4100,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1941,
    "notes": "Provisional 1932 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "uk_oiler_1932": {
    "id": "uk_oiler_1932",
    "nation": "GBR",
    "name": "Fleet oiler · 1932",
    "type": "AO",
    "category": "other",
    "tons": 7500,
    "cost": 3500,
    "year": 1932,
    "durability": 625,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 190,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "uk_oiler_1932",
      "nation": "GBR",
      "name": "Fleet oiler · 1932",
      "type": "AO",
      "design_year": 1932,
      "displacement": {
        "standard_tons": 7500,
        "full_load_tons": 14500
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 190,
      "cost_gold": 3500,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1941,
    "notes": "Provisional 1932 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "uk_depot_1942": {
    "id": "uk_depot_1942",
    "nation": "GBR",
    "name": "Fleet depot · 1942",
    "type": "AD",
    "category": "other",
    "tons": 7500,
    "cost": 4800,
    "year": 1942,
    "durability": 625,
    "speed": 18,
    "range": 20372,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 360,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "uk_depot_1942",
      "nation": "GBR",
      "name": "Fleet depot · 1942",
      "type": "AD",
      "design_year": 1942,
      "displacement": {
        "standard_tons": 7500,
        "full_load_tons": 10000
      },
      "propulsion": {
        "speed_kn": 18,
        "range_nm": 11000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 360,
      "cost_gold": 4800,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1951,
    "notes": "Provisional 1942 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "uk_oiler_1942": {
    "id": "uk_oiler_1942",
    "nation": "GBR",
    "name": "Fleet oiler · 1942",
    "type": "AO",
    "category": "other",
    "tons": 8500,
    "cost": 4200,
    "year": 1942,
    "durability": 708,
    "speed": 18,
    "range": 20372,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 220,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "uk_oiler_1942",
      "nation": "GBR",
      "name": "Fleet oiler · 1942",
      "type": "AO",
      "design_year": 1942,
      "displacement": {
        "standard_tons": 8500,
        "full_load_tons": 15500
      },
      "propulsion": {
        "speed_kn": 18,
        "range_nm": 11000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 220,
      "cost_gold": 4200,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1951,
    "notes": "Provisional 1942 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "us_depot_1932": {
    "id": "us_depot_1932",
    "nation": "USA",
    "name": "Fleet depot · 1932",
    "type": "AD",
    "category": "other",
    "tons": 6500,
    "cost": 4100,
    "year": 1932,
    "durability": 542,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 330,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "us_depot_1932",
      "nation": "USA",
      "name": "Fleet depot · 1932",
      "type": "AD",
      "design_year": 1932,
      "displacement": {
        "standard_tons": 6500,
        "full_load_tons": 9000
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 330,
      "cost_gold": 4100,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1941,
    "notes": "Provisional 1932 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "us_oiler_1932": {
    "id": "us_oiler_1932",
    "nation": "USA",
    "name": "Fleet oiler · 1932",
    "type": "AO",
    "category": "other",
    "tons": 7500,
    "cost": 3500,
    "year": 1932,
    "durability": 625,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 190,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "us_oiler_1932",
      "nation": "USA",
      "name": "Fleet oiler · 1932",
      "type": "AO",
      "design_year": 1932,
      "displacement": {
        "standard_tons": 7500,
        "full_load_tons": 14500
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 190,
      "cost_gold": 3500,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1941,
    "notes": "Provisional 1932 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "us_depot_1942": {
    "id": "us_depot_1942",
    "nation": "USA",
    "name": "Fleet depot · 1942",
    "type": "AD",
    "category": "other",
    "tons": 7500,
    "cost": 4800,
    "year": 1942,
    "durability": 625,
    "speed": 18,
    "range": 20372,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 360,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "us_depot_1942",
      "nation": "USA",
      "name": "Fleet depot · 1942",
      "type": "AD",
      "design_year": 1942,
      "displacement": {
        "standard_tons": 7500,
        "full_load_tons": 10000
      },
      "propulsion": {
        "speed_kn": 18,
        "range_nm": 11000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 360,
      "cost_gold": 4800,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1951,
    "notes": "Provisional 1942 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "us_oiler_1942": {
    "id": "us_oiler_1942",
    "nation": "USA",
    "name": "Fleet oiler · 1942",
    "type": "AO",
    "category": "other",
    "tons": 8500,
    "cost": 4200,
    "year": 1942,
    "durability": 708,
    "speed": 18,
    "range": 20372,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 220,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "us_oiler_1942",
      "nation": "USA",
      "name": "Fleet oiler · 1942",
      "type": "AO",
      "design_year": 1942,
      "displacement": {
        "standard_tons": 8500,
        "full_load_tons": 15500
      },
      "propulsion": {
        "speed_kn": 18,
        "range_nm": 11000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 220,
      "cost_gold": 4200,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1951,
    "notes": "Provisional 1942 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "de_depot_1932": {
    "id": "de_depot_1932",
    "nation": "DEU",
    "name": "Fleet depot · 1932",
    "type": "AD",
    "category": "other",
    "tons": 6500,
    "cost": 4100,
    "year": 1932,
    "durability": 542,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 330,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "de_depot_1932",
      "nation": "DEU",
      "name": "Fleet depot · 1932",
      "type": "AD",
      "design_year": 1932,
      "displacement": {
        "standard_tons": 6500,
        "full_load_tons": 9000
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 330,
      "cost_gold": 4100,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1941,
    "notes": "Provisional 1932 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "de_oiler_1932": {
    "id": "de_oiler_1932",
    "nation": "DEU",
    "name": "Fleet oiler · 1932",
    "type": "AO",
    "category": "other",
    "tons": 7500,
    "cost": 3500,
    "year": 1932,
    "durability": 625,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 190,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "de_oiler_1932",
      "nation": "DEU",
      "name": "Fleet oiler · 1932",
      "type": "AO",
      "design_year": 1932,
      "displacement": {
        "standard_tons": 7500,
        "full_load_tons": 14500
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 190,
      "cost_gold": 3500,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1941,
    "notes": "Provisional 1932 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "de_depot_1942": {
    "id": "de_depot_1942",
    "nation": "DEU",
    "name": "Fleet depot · 1942",
    "type": "AD",
    "category": "other",
    "tons": 7500,
    "cost": 4800,
    "year": 1942,
    "durability": 625,
    "speed": 18,
    "range": 20372,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 360,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "de_depot_1942",
      "nation": "DEU",
      "name": "Fleet depot · 1942",
      "type": "AD",
      "design_year": 1942,
      "displacement": {
        "standard_tons": 7500,
        "full_load_tons": 10000
      },
      "propulsion": {
        "speed_kn": 18,
        "range_nm": 11000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 360,
      "cost_gold": 4800,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1951,
    "notes": "Provisional 1942 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "de_oiler_1942": {
    "id": "de_oiler_1942",
    "nation": "DEU",
    "name": "Fleet oiler · 1942",
    "type": "AO",
    "category": "other",
    "tons": 8500,
    "cost": 4200,
    "year": 1942,
    "durability": 708,
    "speed": 18,
    "range": 20372,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 220,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "de_oiler_1942",
      "nation": "DEU",
      "name": "Fleet oiler · 1942",
      "type": "AO",
      "design_year": 1942,
      "displacement": {
        "standard_tons": 8500,
        "full_load_tons": 15500
      },
      "propulsion": {
        "speed_kn": 18,
        "range_nm": 11000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 220,
      "cost_gold": 4200,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1951,
    "notes": "Provisional 1942 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "ecole_ss28": {
    "id": "ecole_ss28",
    "nation": "FRA",
    "name": "École ocean submarine",
    "type": "SS",
    "category": "other",
    "tons": 1450,
    "cost": 696,
    "year": 1928,
    "durability": 121,
    "speed": 19,
    "range": 16668,
    "shp": 0,
    "caliber": 100,
    "barrels": 1,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 73,
    "submergedSpeed": 8,
    "provisioned": 0,
    "raw": {
      "id": "ecole_ss28",
      "nation": "FRA",
      "name": "École ocean submarine",
      "type": "SS",
      "design_year": 1928,
      "displacement": {
        "standard_tons": 1450
      },
      "propulsion": {
        "speed_kn": 19,
        "range_nm": 9000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 1
        },
        "torpedo_tubes": {
          "count": 8
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
      "complement": 73,
      "cost_gold": 696,
      "treaty_category": "other",
      "speed_submerged": {
        "surfaced_kn": 19,
        "sprint_kn": 8
      },
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "ecole_dd30": {
    "id": "ecole_dd30",
    "nation": "FRA",
    "name": "Vengeur torpedo destroyer",
    "type": "DD",
    "category": "other",
    "tons": 2100,
    "cost": 1008,
    "year": 1930,
    "durability": 175,
    "speed": 37,
    "range": 9260,
    "shp": 0,
    "caliber": 138,
    "barrels": 5,
    "tubes": 12,
    "torpedoRange": 8,
    "belt": 12,
    "deck": 3,
    "air": 0,
    "aa": 8,
    "scoutAircraft": 0,
    "sonar": true,
    "radar": false,
    "crew": 158,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "ecole_dd30",
      "nation": "FRA",
      "name": "Vengeur torpedo destroyer",
      "type": "DD",
      "design_year": 1930,
      "displacement": {
        "standard_tons": 2100
      },
      "propulsion": {
        "speed_kn": 37,
        "range_nm": 5000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 138,
          "count": 5
        },
        "torpedo_tubes": {
          "count": 12
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 8
          }
        ]
      },
      "protection": {
        "belt_mm": 12,
        "deck_mm": 3
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 158,
      "cost_gold": 1008,
      "treaty_category": "other",
      "sensors": [
        "fr30snr"
      ]
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "ecole_cl29": {
    "id": "ecole_cl29",
    "nation": "FRA",
    "name": "Éclaireur fast cruiser",
    "type": "CL",
    "category": "other",
    "tons": 7200,
    "cost": 3456,
    "year": 1929,
    "durability": 600,
    "speed": 35,
    "range": 13890,
    "shp": 0,
    "caliber": 152,
    "barrels": 9,
    "tubes": 9,
    "torpedoRange": 8,
    "belt": 80,
    "deck": 20,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 253,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "ecole_cl29",
      "nation": "FRA",
      "name": "Éclaireur fast cruiser",
      "type": "CL",
      "design_year": 1929,
      "displacement": {
        "standard_tons": 7200
      },
      "propulsion": {
        "speed_kn": 35,
        "range_nm": 7500
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 152,
          "count": 9
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
        "belt_mm": 80,
        "deck_mm": 20
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 253,
      "cost_gold": 3456,
      "treaty_category": "other",
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "ecole_cv31": {
    "id": "ecole_cv31",
    "nation": "FRA",
    "name": "Liberté carrier",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 16500,
    "cost": 7920,
    "year": 1931,
    "durability": 1375,
    "speed": 31,
    "range": 12964,
    "shp": 0,
    "caliber": 130,
    "barrels": 8,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 65,
    "deck": 16,
    "air": 48,
    "aa": 8,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 674,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "ecole_cv31",
      "nation": "FRA",
      "name": "Liberté carrier",
      "type": "CV",
      "design_year": 1931,
      "displacement": {
        "standard_tons": 16500
      },
      "propulsion": {
        "speed_kn": 31,
        "range_nm": 7000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 130,
          "count": 8
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 8
          }
        ]
      },
      "protection": {
        "belt_mm": 65,
        "deck_mm": 16
      },
      "aviation": {
        "aircraft_capacity": 48
      },
      "complement": 674,
      "cost_gold": 7920,
      "treaty_category": "aircraft_carrier",
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "ecole_ss37": {
    "id": "ecole_ss37",
    "nation": "FRA",
    "name": "École submarine, 1937",
    "type": "SS",
    "category": "other",
    "tons": 1700,
    "cost": 816,
    "year": 1937,
    "durability": 142,
    "speed": 20,
    "range": 20372,
    "shp": 0,
    "caliber": 100,
    "barrels": 1,
    "tubes": 10,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 8,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 85,
    "submergedSpeed": 9,
    "provisioned": 0,
    "raw": {
      "id": "ecole_ss37",
      "nation": "FRA",
      "name": "École submarine, 1937",
      "type": "SS",
      "design_year": 1937,
      "displacement": {
        "standard_tons": 1700
      },
      "propulsion": {
        "speed_kn": 20,
        "range_nm": 11000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 1
        },
        "torpedo_tubes": {
          "count": 10
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 8
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
      "complement": 85,
      "cost_gold": 816,
      "treaty_category": "other",
      "speed_submerged": {
        "surfaced_kn": 20,
        "sprint_kn": 9
      },
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "fra_program_oiler": {
    "id": "fra_program_oiler",
    "nation": "FRA",
    "name": "La Revanche de l'École fleet oiler",
    "type": "AO",
    "category": "other",
    "tons": 6500,
    "cost": 3120,
    "year": 1930,
    "durability": 542,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 8,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 228,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "fra_program_oiler",
      "nation": "FRA",
      "name": "La Revanche de l'École fleet oiler",
      "type": "AO",
      "design_year": 1930,
      "displacement": {
        "standard_tons": 6500
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 8
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
      "complement": 228,
      "cost_gold": 3120,
      "treaty_category": "other",
      "sensors": []
    },
    "notes": "Hypothetical program fleet oiler. Excluded from warship and merchant totals.",
    "service": "support"
  },
  "fr_depot_1932": {
    "id": "fr_depot_1932",
    "nation": "FRA",
    "name": "Fleet depot · 1932",
    "type": "AD",
    "category": "other",
    "tons": 6500,
    "cost": 4100,
    "year": 1932,
    "durability": 542,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 330,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "fr_depot_1932",
      "nation": "FRA",
      "name": "Fleet depot · 1932",
      "type": "AD",
      "design_year": 1932,
      "displacement": {
        "standard_tons": 6500,
        "full_load_tons": 9000
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 330,
      "cost_gold": 4100,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1941,
    "notes": "Provisional 1932 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "fr_oiler_1932": {
    "id": "fr_oiler_1932",
    "nation": "FRA",
    "name": "Fleet oiler · 1932",
    "type": "AO",
    "category": "other",
    "tons": 7500,
    "cost": 3500,
    "year": 1932,
    "durability": 625,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 190,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "fr_oiler_1932",
      "nation": "FRA",
      "name": "Fleet oiler · 1932",
      "type": "AO",
      "design_year": 1932,
      "displacement": {
        "standard_tons": 7500,
        "full_load_tons": 14500
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 190,
      "cost_gold": 3500,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1941,
    "notes": "Provisional 1932 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "fr_depot_1942": {
    "id": "fr_depot_1942",
    "nation": "FRA",
    "name": "Fleet depot · 1942",
    "type": "AD",
    "category": "other",
    "tons": 7500,
    "cost": 4800,
    "year": 1942,
    "durability": 625,
    "speed": 18,
    "range": 20372,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 360,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "fr_depot_1942",
      "nation": "FRA",
      "name": "Fleet depot · 1942",
      "type": "AD",
      "design_year": 1942,
      "displacement": {
        "standard_tons": 7500,
        "full_load_tons": 10000
      },
      "propulsion": {
        "speed_kn": 18,
        "range_nm": 11000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 360,
      "cost_gold": 4800,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1951,
    "notes": "Provisional 1942 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "fr_oiler_1942": {
    "id": "fr_oiler_1942",
    "nation": "FRA",
    "name": "Fleet oiler · 1942",
    "type": "AO",
    "category": "other",
    "tons": 8500,
    "cost": 4200,
    "year": 1942,
    "durability": 708,
    "speed": 18,
    "range": 20372,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 220,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "fr_oiler_1942",
      "nation": "FRA",
      "name": "Fleet oiler · 1942",
      "type": "AO",
      "design_year": 1942,
      "displacement": {
        "standard_tons": 8500,
        "full_load_tons": 15500
      },
      "propulsion": {
        "speed_kn": 18,
        "range_nm": 11000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 220,
      "cost_gold": 4200,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1951,
    "notes": "Provisional 1942 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "mare_bb29": {
    "id": "mare_bb29",
    "nation": "ITA",
    "name": "Italia fast battleship",
    "type": "BB",
    "category": "capital_ship",
    "tons": 35000,
    "cost": 16800,
    "year": 1929,
    "durability": 2917,
    "speed": 29,
    "range": 10186,
    "shp": 0,
    "caliber": 381,
    "barrels": 9,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 320,
    "deck": 80,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1226,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "mare_bb29",
      "nation": "ITA",
      "name": "Italia fast battleship",
      "type": "BB",
      "design_year": 1929,
      "displacement": {
        "standard_tons": 35000
      },
      "propulsion": {
        "speed_kn": 29,
        "range_nm": 5500
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 381,
          "count": 9
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
        "belt_mm": 320,
        "deck_mm": 80
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 1226,
      "cost_gold": 16800,
      "treaty_category": "capital_ship",
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "mare_ca30": {
    "id": "mare_ca30",
    "nation": "ITA",
    "name": "Mediterraneo cruiser",
    "type": "CA",
    "category": "other",
    "tons": 10500,
    "cost": 5040,
    "year": 1930,
    "durability": 875,
    "speed": 34,
    "range": 9260,
    "shp": 0,
    "caliber": 203,
    "barrels": 8,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 140,
    "deck": 35,
    "air": 0,
    "aa": 8,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 368,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "mare_ca30",
      "nation": "ITA",
      "name": "Mediterraneo cruiser",
      "type": "CA",
      "design_year": 1930,
      "displacement": {
        "standard_tons": 10500
      },
      "propulsion": {
        "speed_kn": 34,
        "range_nm": 5000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 203,
          "count": 8
        },
        "torpedo_tubes": {
          "count": 8
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 8
          }
        ]
      },
      "protection": {
        "belt_mm": 140,
        "deck_mm": 35
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 368,
      "cost_gold": 5040,
      "treaty_category": "other",
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "mare_dd31": {
    "id": "mare_dd31",
    "nation": "ITA",
    "name": "Lampo torpedo destroyer",
    "type": "DD",
    "category": "other",
    "tons": 1850,
    "cost": 888,
    "year": 1931,
    "durability": 154,
    "speed": 37,
    "range": 6482,
    "shp": 0,
    "caliber": 120,
    "barrels": 6,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 15,
    "deck": 4,
    "air": 0,
    "aa": 8,
    "scoutAircraft": 0,
    "sonar": true,
    "radar": false,
    "crew": 139,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "mare_dd31",
      "nation": "ITA",
      "name": "Lampo torpedo destroyer",
      "type": "DD",
      "design_year": 1931,
      "displacement": {
        "standard_tons": 1850
      },
      "propulsion": {
        "speed_kn": 37,
        "range_nm": 3500
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 120,
          "count": 6
        },
        "torpedo_tubes": {
          "count": 8
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 8
          }
        ]
      },
      "protection": {
        "belt_mm": 15,
        "deck_mm": 4
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 139,
      "cost_gold": 888,
      "treaty_category": "other",
      "sensors": [
        "it30snr"
      ]
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "mare_cv32": {
    "id": "mare_cv32",
    "nation": "ITA",
    "name": "Sparviero fleet carrier",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 18000,
    "cost": 8640,
    "year": 1932,
    "durability": 1500,
    "speed": 30,
    "range": 9260,
    "shp": 0,
    "caliber": 120,
    "barrels": 8,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 60,
    "deck": 15,
    "air": 45,
    "aa": 8,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 721,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "mare_cv32",
      "nation": "ITA",
      "name": "Sparviero fleet carrier",
      "type": "CV",
      "design_year": 1932,
      "displacement": {
        "standard_tons": 18000
      },
      "propulsion": {
        "speed_kn": 30,
        "range_nm": 5000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 120,
          "count": 8
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 8
          }
        ]
      },
      "protection": {
        "belt_mm": 60,
        "deck_mm": 15
      },
      "aviation": {
        "aircraft_capacity": 45
      },
      "complement": 721,
      "cost_gold": 8640,
      "treaty_category": "aircraft_carrier",
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "mare_ss28": {
    "id": "mare_ss28",
    "nation": "ITA",
    "name": "Tirreno submarine",
    "type": "SS",
    "category": "other",
    "tons": 950,
    "cost": 456,
    "year": 1928,
    "durability": 79,
    "speed": 18,
    "range": 12038,
    "shp": 0,
    "caliber": 100,
    "barrels": 1,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 48,
    "submergedSpeed": 8,
    "provisioned": 0,
    "raw": {
      "id": "mare_ss28",
      "nation": "ITA",
      "name": "Tirreno submarine",
      "type": "SS",
      "design_year": 1928,
      "displacement": {
        "standard_tons": 950
      },
      "propulsion": {
        "speed_kn": 18,
        "range_nm": 6500
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 1
        },
        "torpedo_tubes": {
          "count": 6
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
      "complement": 48,
      "cost_gold": 456,
      "treaty_category": "other",
      "speed_submerged": {
        "surfaced_kn": 18,
        "sprint_kn": 8
      },
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "mare_bb38": {
    "id": "mare_bb38",
    "nation": "ITA",
    "name": "Impero improved battleship",
    "type": "BB",
    "category": "capital_ship",
    "tons": 41000,
    "cost": 19680,
    "year": 1938,
    "durability": 3417,
    "speed": 30,
    "range": 11112,
    "shp": 0,
    "caliber": 381,
    "barrels": 9,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 350,
    "deck": 88,
    "air": 0,
    "aa": 8,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1436,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "mare_bb38",
      "nation": "ITA",
      "name": "Impero improved battleship",
      "type": "BB",
      "design_year": 1938,
      "displacement": {
        "standard_tons": 41000
      },
      "propulsion": {
        "speed_kn": 30,
        "range_nm": 6000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 381,
          "count": 9
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 8
          }
        ]
      },
      "protection": {
        "belt_mm": 350,
        "deck_mm": 88
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 1436,
      "cost_gold": 19680,
      "treaty_category": "capital_ship",
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "ita_program_oiler": {
    "id": "ita_program_oiler",
    "nation": "ITA",
    "name": "Mare Nostrum fleet oiler",
    "type": "AO",
    "category": "other",
    "tons": 6500,
    "cost": 3120,
    "year": 1930,
    "durability": 542,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 8,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 228,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "ita_program_oiler",
      "nation": "ITA",
      "name": "Mare Nostrum fleet oiler",
      "type": "AO",
      "design_year": 1930,
      "displacement": {
        "standard_tons": 6500
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 8
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
      "complement": 228,
      "cost_gold": 3120,
      "treaty_category": "other",
      "sensors": []
    },
    "notes": "Hypothetical program fleet oiler. Excluded from warship and merchant totals.",
    "service": "support"
  },
  "it_depot_1932": {
    "id": "it_depot_1932",
    "nation": "ITA",
    "name": "Fleet depot · 1932",
    "type": "AD",
    "category": "other",
    "tons": 6500,
    "cost": 4100,
    "year": 1932,
    "durability": 542,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 330,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "it_depot_1932",
      "nation": "ITA",
      "name": "Fleet depot · 1932",
      "type": "AD",
      "design_year": 1932,
      "displacement": {
        "standard_tons": 6500,
        "full_load_tons": 9000
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 330,
      "cost_gold": 4100,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1941,
    "notes": "Provisional 1932 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "it_oiler_1932": {
    "id": "it_oiler_1932",
    "nation": "ITA",
    "name": "Fleet oiler · 1932",
    "type": "AO",
    "category": "other",
    "tons": 7500,
    "cost": 3500,
    "year": 1932,
    "durability": 625,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 190,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "it_oiler_1932",
      "nation": "ITA",
      "name": "Fleet oiler · 1932",
      "type": "AO",
      "design_year": 1932,
      "displacement": {
        "standard_tons": 7500,
        "full_load_tons": 14500
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 190,
      "cost_gold": 3500,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1941,
    "notes": "Provisional 1932 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "it_depot_1942": {
    "id": "it_depot_1942",
    "nation": "ITA",
    "name": "Fleet depot · 1942",
    "type": "AD",
    "category": "other",
    "tons": 7500,
    "cost": 4800,
    "year": 1942,
    "durability": 625,
    "speed": 18,
    "range": 20372,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 360,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "it_depot_1942",
      "nation": "ITA",
      "name": "Fleet depot · 1942",
      "type": "AD",
      "design_year": 1942,
      "displacement": {
        "standard_tons": 7500,
        "full_load_tons": 10000
      },
      "propulsion": {
        "speed_kn": 18,
        "range_nm": 11000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 360,
      "cost_gold": 4800,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1951,
    "notes": "Provisional 1942 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "it_oiler_1942": {
    "id": "it_oiler_1942",
    "nation": "ITA",
    "name": "Fleet oiler · 1942",
    "type": "AO",
    "category": "other",
    "tons": 8500,
    "cost": 4200,
    "year": 1942,
    "durability": 708,
    "speed": 18,
    "range": 20372,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 220,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "it_oiler_1942",
      "nation": "ITA",
      "name": "Fleet oiler · 1942",
      "type": "AO",
      "design_year": 1942,
      "displacement": {
        "standard_tons": 8500,
        "full_load_tons": 15500
      },
      "propulsion": {
        "speed_kn": 18,
        "range_nm": 11000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 220,
      "cost_gold": 4200,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1951,
    "notes": "Provisional 1942 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "ocean_bb28": {
    "id": "ocean_bb28",
    "nation": "SOV",
    "name": "Sovetskaya Respublika battleship",
    "type": "BB",
    "category": "capital_ship",
    "tons": 38000,
    "cost": 18240,
    "year": 1928,
    "durability": 3167,
    "speed": 27,
    "range": 12038,
    "shp": 0,
    "caliber": 406,
    "barrels": 9,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 320,
    "deck": 80,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1331,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "ocean_bb28",
      "nation": "SOV",
      "name": "Sovetskaya Respublika battleship",
      "type": "BB",
      "design_year": 1928,
      "displacement": {
        "standard_tons": 38000
      },
      "propulsion": {
        "speed_kn": 27,
        "range_nm": 6500
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 406,
          "count": 9
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
        "belt_mm": 320,
        "deck_mm": 80
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 1331,
      "cost_gold": 18240,
      "treaty_category": "capital_ship",
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "ocean_cv30": {
    "id": "ocean_cv30",
    "nation": "SOV",
    "name": "Krasny Okean carrier",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 23000,
    "cost": 11040,
    "year": 1930,
    "durability": 1917,
    "speed": 30,
    "range": 12038,
    "shp": 0,
    "caliber": 130,
    "barrels": 10,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 75,
    "deck": 19,
    "air": 60,
    "aa": 8,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 926,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "ocean_cv30",
      "nation": "SOV",
      "name": "Krasny Okean carrier",
      "type": "CV",
      "design_year": 1930,
      "displacement": {
        "standard_tons": 23000
      },
      "propulsion": {
        "speed_kn": 30,
        "range_nm": 6500
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 130,
          "count": 10
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 8
          }
        ]
      },
      "protection": {
        "belt_mm": 75,
        "deck_mm": 19
      },
      "aviation": {
        "aircraft_capacity": 60
      },
      "complement": 926,
      "cost_gold": 11040,
      "treaty_category": "aircraft_carrier",
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "ocean_cl29": {
    "id": "ocean_cl29",
    "nation": "SOV",
    "name": "Kirov ocean cruiser",
    "type": "CL",
    "category": "other",
    "tons": 8500,
    "cost": 4080,
    "year": 1929,
    "durability": 708,
    "speed": 33,
    "range": 12964,
    "shp": 0,
    "caliber": 152,
    "barrels": 9,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 100,
    "deck": 25,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 298,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "ocean_cl29",
      "nation": "SOV",
      "name": "Kirov ocean cruiser",
      "type": "CL",
      "design_year": 1929,
      "displacement": {
        "standard_tons": 8500
      },
      "propulsion": {
        "speed_kn": 33,
        "range_nm": 7000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 152,
          "count": 9
        },
        "torpedo_tubes": {
          "count": 6
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 2
          }
        ]
      },
      "protection": {
        "belt_mm": 100,
        "deck_mm": 25
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 298,
      "cost_gold": 4080,
      "treaty_category": "other",
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "ocean_dd30": {
    "id": "ocean_dd30",
    "nation": "SOV",
    "name": "Shtorm escort destroyer",
    "type": "DD",
    "category": "other",
    "tons": 2100,
    "cost": 1008,
    "year": 1930,
    "durability": 175,
    "speed": 35,
    "range": 11112,
    "shp": 0,
    "caliber": 130,
    "barrels": 4,
    "tubes": 8,
    "torpedoRange": 8,
    "belt": 15,
    "deck": 4,
    "air": 0,
    "aa": 8,
    "scoutAircraft": 0,
    "sonar": true,
    "radar": false,
    "crew": 158,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "ocean_dd30",
      "nation": "SOV",
      "name": "Shtorm escort destroyer",
      "type": "DD",
      "design_year": 1930,
      "displacement": {
        "standard_tons": 2100
      },
      "propulsion": {
        "speed_kn": 35,
        "range_nm": 6000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 130,
          "count": 4
        },
        "torpedo_tubes": {
          "count": 8
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 8
          }
        ]
      },
      "protection": {
        "belt_mm": 15,
        "deck_mm": 4
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 158,
      "cost_gold": 1008,
      "treaty_category": "other",
      "sensors": [
        "su30snr"
      ]
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "ocean_ss29": {
    "id": "ocean_ss29",
    "nation": "SOV",
    "name": "Okean patrol submarine",
    "type": "SS",
    "category": "other",
    "tons": 1100,
    "cost": 528,
    "year": 1929,
    "durability": 92,
    "speed": 19,
    "range": 15742,
    "shp": 0,
    "caliber": 100,
    "barrels": 1,
    "tubes": 6,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 2,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 55,
    "submergedSpeed": 8,
    "provisioned": 0,
    "raw": {
      "id": "ocean_ss29",
      "nation": "SOV",
      "name": "Okean patrol submarine",
      "type": "SS",
      "design_year": 1929,
      "displacement": {
        "standard_tons": 1100
      },
      "propulsion": {
        "speed_kn": 19,
        "range_nm": 8500
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 100,
          "count": 1
        },
        "torpedo_tubes": {
          "count": 6
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
      "complement": 55,
      "cost_gold": 528,
      "treaty_category": "other",
      "speed_submerged": {
        "surfaced_kn": 19,
        "sprint_kn": 8
      },
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "ocean_bb34": {
    "id": "ocean_bb34",
    "nation": "SOV",
    "name": "Sovetsky Soyuz battleship",
    "type": "BB",
    "category": "capital_ship",
    "tons": 52000,
    "cost": 24960,
    "year": 1934,
    "durability": 4333,
    "speed": 29,
    "range": 14816,
    "shp": 0,
    "caliber": 406,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 375,
    "deck": 94,
    "air": 0,
    "aa": 8,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1821,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "ocean_bb34",
      "nation": "SOV",
      "name": "Sovetsky Soyuz battleship",
      "type": "BB",
      "design_year": 1934,
      "displacement": {
        "standard_tons": 52000
      },
      "propulsion": {
        "speed_kn": 29,
        "range_nm": 8000
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 406,
          "count": 12
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 8
          }
        ]
      },
      "protection": {
        "belt_mm": 375,
        "deck_mm": 94
      },
      "aviation": {
        "aircraft_capacity": 0
      },
      "complement": 1821,
      "cost_gold": 24960,
      "treaty_category": "capital_ship",
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "ocean_cv38": {
    "id": "ocean_cv38",
    "nation": "SOV",
    "name": "Sovetskaya Aviatsiya carrier",
    "type": "CV",
    "category": "aircraft_carrier",
    "tons": 30000,
    "cost": 14400,
    "year": 1938,
    "durability": 2500,
    "speed": 32,
    "range": 15742,
    "shp": 0,
    "caliber": 130,
    "barrels": 12,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 100,
    "deck": 25,
    "air": 80,
    "aa": 8,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 1210,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "ocean_cv38",
      "nation": "SOV",
      "name": "Sovetskaya Aviatsiya carrier",
      "type": "CV",
      "design_year": 1938,
      "displacement": {
        "standard_tons": 30000
      },
      "propulsion": {
        "speed_kn": 32,
        "range_nm": 8500
      },
      "armament": {
        "main_battery": {
          "caliber_mm": 130,
          "count": 12
        },
        "torpedo_tubes": {
          "count": 0
        },
        "aa_battery": [
          {
            "caliber_mm": 40,
            "count": 8
          }
        ]
      },
      "protection": {
        "belt_mm": 100,
        "deck_mm": 25
      },
      "aviation": {
        "aircraft_capacity": 80
      },
      "complement": 1210,
      "cost_gold": 14400,
      "treaty_category": "aircraft_carrier",
      "sensors": []
    },
    "notes": "Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates."
  },
  "sov_program_oiler": {
    "id": "sov_program_oiler",
    "nation": "SOV",
    "name": "Krasny Okean fleet oiler",
    "type": "AO",
    "category": "other",
    "tons": 6500,
    "cost": 3120,
    "year": 1930,
    "durability": 542,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 8,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 228,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "sov_program_oiler",
      "nation": "SOV",
      "name": "Krasny Okean fleet oiler",
      "type": "AO",
      "design_year": 1930,
      "displacement": {
        "standard_tons": 6500
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 8
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
      "complement": 228,
      "cost_gold": 3120,
      "treaty_category": "other",
      "sensors": []
    },
    "notes": "Hypothetical program fleet oiler. Excluded from warship and merchant totals.",
    "service": "support"
  },
  "su_depot_1932": {
    "id": "su_depot_1932",
    "nation": "SOV",
    "name": "Fleet depot · 1932",
    "type": "AD",
    "category": "other",
    "tons": 6500,
    "cost": 4100,
    "year": 1932,
    "durability": 542,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 330,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "su_depot_1932",
      "nation": "SOV",
      "name": "Fleet depot · 1932",
      "type": "AD",
      "design_year": 1932,
      "displacement": {
        "standard_tons": 6500,
        "full_load_tons": 9000
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 330,
      "cost_gold": 4100,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1941,
    "notes": "Provisional 1932 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "su_oiler_1932": {
    "id": "su_oiler_1932",
    "nation": "SOV",
    "name": "Fleet oiler · 1932",
    "type": "AO",
    "category": "other",
    "tons": 7500,
    "cost": 3500,
    "year": 1932,
    "durability": 625,
    "speed": 16,
    "range": 18520,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 190,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "su_oiler_1932",
      "nation": "SOV",
      "name": "Fleet oiler · 1932",
      "type": "AO",
      "design_year": 1932,
      "displacement": {
        "standard_tons": 7500,
        "full_load_tons": 14500
      },
      "propulsion": {
        "speed_kn": 16,
        "range_nm": 10000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 190,
      "cost_gold": 3500,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1941,
    "notes": "Provisional 1932 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "su_depot_1942": {
    "id": "su_depot_1942",
    "nation": "SOV",
    "name": "Fleet depot · 1942",
    "type": "AD",
    "category": "other",
    "tons": 7500,
    "cost": 4800,
    "year": 1942,
    "durability": 625,
    "speed": 18,
    "range": 20372,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 360,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "su_depot_1942",
      "nation": "SOV",
      "name": "Fleet depot · 1942",
      "type": "AD",
      "design_year": 1942,
      "displacement": {
        "standard_tons": 7500,
        "full_load_tons": 10000
      },
      "propulsion": {
        "speed_kn": 18,
        "range_nm": 11000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 360,
      "cost_gold": 4800,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1951,
    "notes": "Provisional 1942 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  },
  "su_oiler_1942": {
    "id": "su_oiler_1942",
    "nation": "SOV",
    "name": "Fleet oiler · 1942",
    "type": "AO",
    "category": "other",
    "tons": 8500,
    "cost": 4200,
    "year": 1942,
    "durability": 708,
    "speed": 18,
    "range": 20372,
    "shp": 0,
    "caliber": 100,
    "barrels": 2,
    "tubes": 0,
    "torpedoRange": 8,
    "belt": 0,
    "deck": 0,
    "air": 0,
    "aa": 4,
    "scoutAircraft": 0,
    "sonar": false,
    "radar": false,
    "crew": 220,
    "submergedSpeed": 0,
    "provisioned": 0,
    "raw": {
      "id": "su_oiler_1942",
      "nation": "SOV",
      "name": "Fleet oiler · 1942",
      "type": "AO",
      "design_year": 1942,
      "displacement": {
        "standard_tons": 8500,
        "full_load_tons": 15500
      },
      "propulsion": {
        "speed_kn": 18,
        "range_nm": 11000
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
            "caliber_mm": 40,
            "count": 4
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
      "complement": 220,
      "cost_gold": 4200,
      "treaty_category": "other",
      "sensors": []
    },
    "service": "support",
    "buildUntil": 1951,
    "notes": "Provisional 1942 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added."
  }
}
```
