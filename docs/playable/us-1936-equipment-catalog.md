# United States — In Good Faith — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1936-01-01.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.2. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/us.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1936-01-01. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is San Diego.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| Midway | 0 | None | 0 | 0 |
| Wake Island | 0 | None | 0 | 0 |
| Manila / Cavite | 16 | 4 F1 carrier fighter (fighter); 2 O1 observation floatplane (scout); 3 SB1 scout-bomber (strike) | 9 | 192 |
| Mare Island / San Francisco | 60 | 15 F1 carrier fighter (fighter); 7 O1 observation floatplane (scout); 14 SB1 scout-bomber (strike) | 36 | 720 |
| Puget Sound | 60 | 15 F1 carrier fighter (fighter); 7 O1 observation floatplane (scout); 14 SB1 scout-bomber (strike) | 36 | 720 |
| San Diego | 30 | 8 F1 carrier fighter (fighter); 4 O1 observation floatplane (scout); 6 SB1 scout-bomber (strike) | 18 | 360 |
| Norfolk | 60 | 15 F1 carrier fighter (fighter); 7 O1 observation floatplane (scout); 14 SB1 scout-bomber (strike) | 36 | 720 |
| Pearl Harbor | 60 | 15 F1 carrier fighter (fighter); 7 O1 observation floatplane (scout); 14 SB1 scout-bomber (strike) | 36 | 720 |
| Guam / Apra Harbor | 0 | None | 0 | 0 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

### F1 carrier fighter — `f1_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | fighter | 1 | 7 | 430 |

Complete playable model:

```json
{
  "id": "f1_fighter",
  "name": "F1 carrier fighter",
  "nation": "USA",
  "designation": "F1",
  "type_year": 1933,
  "role": "fighter",
  "cost_gold": 7,
  "durability": 20,
  "powerplant": {
    "component": "us33aeg",
    "count": 1,
    "takeoff_hp": 700,
    "refit_groups": [
      "us38aeg"
    ]
  },
  "dimensions": {
    "span_m": 9.6,
    "length_m": 7,
    "wing_area_m2": 21.5,
    "hangar_footprint_m2": 67
  },
  "weights": {
    "empty_kg": 1250,
    "normal_kg": 1700,
    "max_kg": 1850,
    "derivation": {
      "comparator": "Boeing F4B-4",
      "comparator_kg": 1068,
      "added_kg": 182,
      "not_carried_kg": 0,
      "honest_kg": 1250,
      "credit": 0,
      "dropped_kg": 0
    }
  },
  "crew": {
    "seats": 1,
    "normal": 1
  },
  "performance": {
    "speed_kmh": {
      "at_2900m": 335,
      "at_1500m": 322,
      "sea_level": 310
    },
    "climb_ms": 9.5,
    "ceiling_m": 8200,
    "approach_kmh": 118
  },
  "fuel": {
    "internal_l": 420,
    "endurance_h": 5,
    "ferry_km": 1300,
    "combat_radius_km": 430
  },
  "armament": [
    {
      "mount": "cowl, synchronized",
      "count": 2,
      "rounds": 1000,
      "spec": {
        "name": "Mark 1 7.62 mm machine gun",
        "caliber_mm": 7.62,
        "round_belted_g": 28,
        "gun_kg": 10
      }
    }
  ],
  "stations": [
    {
      "id": "wing_racks",
      "form": "rack",
      "rating_kg": 45,
      "racks": 2,
      "alternatives": [
        {
          "spec": {
            "name": "Mark 1 45 kg bomb",
            "mass_kg": 45
          },
          "count": 2
        }
      ]
    }
  ],
  "equipment": [],
  "features": [
    "biplane on an all-metal airframe with fabric-covered flying surfaces",
    "WINGS DO NOT FOLD",
    "open cockpit",
    "2 x cowl 7.62 mm machine guns, 1,000 rounds",
    "2 x 45 kg bombs on wing racks"
  ],
  "protection": [],
  "kits": [],
  "possible_upgrades": [],
  "notes": "The carrier arm's air-defense doctrine entire: intercept on sight from a deck alert, with no radar, no direction organization and no vector but the eye. Its guns are of rifle caliber. Endurance rather than speed or climb is what the specification bought, because the fleet states its aviation problem as a scouting problem. It is what a carrier strike would be met with. No successor specification has been issued."
}
```

### SB1 scout-bomber — `sb1_scout_bomber`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1931 | dive_bomber | 2 | 10 | 525 |

Complete playable model:

```json
{
  "id": "sb1_scout_bomber",
  "name": "SB1 scout-bomber",
  "nation": "USA",
  "designation": "SB1",
  "type_year": 1931,
  "role": "dive_bomber",
  "cost_gold": 10,
  "durability": 30,
  "powerplant": {
    "component": "us29aeg",
    "count": 1,
    "takeoff_hp": 575,
    "refit_groups": [
      "us33aeg",
      "us38aeg"
    ]
  },
  "dimensions": {
    "span_m": 13.4,
    "length_m": 9.4,
    "wing_area_m2": 39,
    "hangar_footprint_m2": 126
  },
  "weights": {
    "empty_kg": 1951,
    "normal_kg": 3150,
    "max_kg": 3450,
    "derivation": {
      "comparator": "Vought SU-4 Corsair",
      "comparator_kg": 1502,
      "added_kg": 449,
      "not_carried_kg": 0,
      "honest_kg": 1951,
      "credit": 0,
      "dropped_kg": 0
    }
  },
  "crew": {
    "seats": 2,
    "normal": 2,
    "notes": "Tandem. The second crewman is the point of the design: he navigates the search leg, works the radio and fights the tail."
  },
  "performance": {
    "speed_kmh": {
      "at_2400m": 222,
      "at_1500m": 223,
      "sea_level": 225
    },
    "climb_ms": 5.3,
    "ceiling_m": 6495,
    "approach_kmh": 120
  },
  "fuel": {
    "internal_l": 600,
    "endurance_h": 7.9,
    "ferry_km": 1575,
    "combat_radius_km": 525,
    "with_tank": {
      "form": "Mark 1 drop tank, centerline, displacing the bomb (from 1937)",
      "liters": 880,
      "endurance_h": 11.5,
      "ferry_km": 2305,
      "combat_radius_km": 770
    }
  },
  "armament": [
    {
      "mount": "cowl, synchronized",
      "count": 1,
      "rounds": 800,
      "spec": {
        "name": "Mark 1 7.62 mm machine gun",
        "caliber_mm": 7.62,
        "round_belted_g": 28,
        "gun_kg": 10
      }
    },
    {
      "mount": "flexible rear ring",
      "count": 1,
      "rounds": 800,
      "spec": {
        "name": "Mark 1 7.62 mm machine gun",
        "caliber_mm": 7.62,
        "round_belted_g": 28,
        "gun_kg": 10
      }
    }
  ],
  "stations": [
    {
      "id": "centerline_crutch",
      "form": "bomb",
      "rating_kg": 227,
      "alternatives": [
        {
          "spec": {
            "name": "Mark 1 227 kg bomb",
            "mass_kg": 227
          },
          "count": 1
        }
      ]
    },
    {
      "id": "wing_racks",
      "form": "rack",
      "rating_kg": 45,
      "racks": 2,
      "alternatives": [
        {
          "spec": {
            "name": "Mark 1 45 kg bomb",
            "mass_kg": 45
          },
          "count": 2
        }
      ]
    }
  ],
  "equipment": [],
  "features": [
    "two-seat biplane",
    "WINGS DO NOT FOLD",
    "open tandem cockpits",
    "dive brakes",
    "centerline displacement crutch (dive release)",
    "1 x cowl 7.62 mm + 1 x flexible rear 7.62 mm machine gun, 1,600 rounds",
    "1 x 227 kg bomb on the centerline crutch OR 2 x 45 kg bombs on wing racks"
  ],
  "protection": [],
  "kits": [],
  "possible_upgrades": [],
  "notes": "The carrier arm's strike and its scouting line at once, and the whole of the service's practical experience of delivering a weapon from a deck. The doctrine it wrote is the only aviation doctrine the gunnery fleet has consented to fund. No successor specification.",
  "fittings": [
    {
      "name": "Radio-plot station",
      "installed_kg": 45
    }
  ]
}
```

### O1 observation floatplane — `o1_observation`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | scout | 2 | 8 | 475 |

Complete playable model:

```json
{
  "id": "o1_observation",
  "name": "O1 observation floatplane",
  "nation": "USA",
  "designation": "O1",
  "type_year": 1936,
  "role": "scout",
  "cost_gold": 8,
  "durability": 25,
  "powerplant": {
    "component": "us29aeg",
    "count": 1,
    "takeoff_hp": 575
  },
  "dimensions": {
    "span_m": 11,
    "span_folded_m": 3.8,
    "length_m": 9.6,
    "wing_area_m2": 31.5,
    "hangar_footprint_m2": 37
  },
  "weights": {
    "empty_kg": 1814,
    "normal_kg": 2510,
    "max_kg": 2710,
    "max_alt_gear_kg": 2355,
    "derivation": {
      "comparator": "Curtiss SOC Seagull",
      "comparator_kg": 1718,
      "added_kg": 96,
      "not_carried_kg": 0,
      "honest_kg": 1814,
      "credit": 0,
      "dropped_kg": 0
    }
  },
  "crew": {
    "seats": 2,
    "normal": 2,
    "notes": "Tandem. The radio-plot station in the rear cockpit was the requirement's first line, and the airframe followed it."
  },
  "performance": {
    "speed_kmh": {
      "at_1500m": 248,
      "sea_level": 250
    },
    "climb_ms": 4.6,
    "ceiling_m": 4250,
    "approach_kmh": 109
  },
  "fuel": {
    "internal_l": 640,
    "endurance_h": 6.1,
    "ferry_km": 1425,
    "combat_radius_km": 475
  },
  "armament": [
    {
      "mount": "cowl, synchronized",
      "count": 1,
      "rounds": 550,
      "spec": {
        "name": "Mark 1 7.62 mm machine gun",
        "caliber_mm": 7.62,
        "round_belted_g": 28,
        "gun_kg": 10
      }
    },
    {
      "mount": "flexible rear ring",
      "count": 1,
      "rounds": 550,
      "spec": {
        "name": "Mark 1 7.62 mm machine gun",
        "caliber_mm": 7.62,
        "round_belted_g": 28,
        "gun_kg": 10
      }
    }
  ],
  "stations": [
    {
      "id": "wing_racks",
      "form": "rack",
      "rating_kg": 45,
      "racks": 2,
      "alternatives": [
        {
          "spec": {
            "name": "Mark 1 45 kg bomb",
            "mass_kg": 45
          },
          "count": 2
        }
      ]
    }
  ],
  "equipment": [],
  "features": [
    "wings fold for the catapult ships' handling arrangements",
    "spotting radio-plot station (rear seat)",
    "slotted flaps",
    "enclosed sliding canopy",
    "1 x cowl 7.62 mm + 1 x flexible rear 7.62 mm machine gun, 1,100 rounds",
    "2 x 50 kg bombs on wing racks"
  ],
  "protection": [],
  "kits": [
    "us36flt"
  ],
  "possible_upgrades": [],
  "notes": "The eyes of the gunnery doctrine: launched over the horizon, holding station above the fall of shot, passing corrections to the plot by radio — which is what makes fire at extreme range a solved problem rather than a hope. Printed figures are the float fit; the wheel fit gives the penalty back. In a service where the floatplane path is the elite path, this is the airframe that path is flown in. Deliveries begin spring 1936. FOURTH WEIGHT,: the printed max is the FLOAT state, because she is a floatplane; [us36flt] exchanges to wheels, and that kit's own row carries the saving.",
  "fittings": [
    {
      "name": "Radio-plot station",
      "installed_kg": 45
    }
  ]
}
```

## Referenced equipment

Original equipment generations retain their original national catalog as owner. New sonar sets are conservative, provisional 1930 active-sonar fits; no radar capability is implied.

### `us24dpc` — Depth charge

```json
{
  "note": "Rolled from stern racks in a pattern set by the ship's speed and the fuze settings, with no thrower and no ahead-thrown alternative in service. Its effect depends on how well the ship knows where the submarine is, which is the harder half of the problem.",
  "drum_kg": 140,
  "burster_kg": 80,
  "fuze": "hydrostatic",
  "setting_m": [
    30,
    90
  ],
  "throwers": 0,
  "year": 1924,
  "name": "Depth charge",
  "family": "dpc",
  "interface": "depth_charge_rail"
}
```

### `us25gun` — Super-heavy gun line

```json
{
  "mount": "triple",
  "elevation_deg": 45,
  "max_range_km": 40,
  "handling": "shellroom-to-gun power",
  "charges": "six-bag",
  "note": "One gun plant, retooled upward TWICE in nine years rather than rebuilt for each step. The 16 in that arms the founding rung is the 1918 pattern, sits OUTSIDE this Mark sequence and appears on the sheets that mount it as a literal spec. Every generation elevates to the same angle and is drawn to a common maximum range, so a turret crew and a plotting room move up the ladder without relearning the drill. Rate of fire falls as the bore climbs and nobody in the Bureau of Ordnance regards that as a defect. THE MOUNTING NEVER CHANGES SHAPE ON THE WAY UP: three guns to a group at every bore, because a plant that scales one architecture does not pay twice for a second.",
  "bore_in": 18,
  "bore_mm": 457,
  "length_cal": 48,
  "shell_kg": 1315,
  "shell": "armor-piercing",
  "muzzle_ms": 823,
  "rpm_per_gun": 1.5,
  "turret_t": 2500,
  "year": 1925,
  "name": "Super-heavy gun line",
  "family": "gun",
  "interface": "barbette_ring"
}
```

### `us25sec` — Secondary battery line

```json
{
  "caliber_mm": 127,
  "ammunition": "semi-fixed",
  "commonality": "shellrooms, hoists and fuze well common across all mounts",
  "note": "Rearming up the line is the one cheap refit an American hull has — everything else it might want was never provisioned for.",
  "length_cal": 25,
  "mounting": "high-angle single, open",
  "shell_kg": 24.4,
  "muzzle_ms": 657,
  "range_km": 13.3,
  "ceiling_m": 8400,
  "rpm_per_gun": 14,
  "mass_t": 20,
  "year": 1925,
  "name": "Secondary battery line",
  "family": "sec",
  "interface": "secondary_base_ring"
}
```

### `us27dir` — Main-battery director

```json
{
  "note": "The director is the escalation fleet's actual weapon; the guns are its output. Fire beyond the horizon is the doctrine's declared working condition. Its glass is a naval monopoly — two naval optical shops that supply nothing else, so an instrument is repaired from a crate rather than returned to its maker.",
  "computer": "rangekeeper (plotting room)",
  "stable_element": "vertical",
  "director_top_rangefinder_m": 4.6,
  "turret_rangefinder_max_m": 12.5,
  "head_t": 9,
  "aircraft_spot_correction": "input at the plot",
  "year": 1927,
  "name": "Main-battery director",
  "family": "dir",
  "interface": "director_tower"
}
```

### `us29gun` — Super-heavy gun line

```json
{
  "mount": "triple",
  "elevation_deg": 45,
  "max_range_km": 40,
  "handling": "shellroom-to-gun power",
  "charges": "six-bag",
  "note": "One gun plant, retooled upward TWICE in nine years rather than rebuilt for each step. The 16 in that arms the founding rung is the 1918 pattern, sits OUTSIDE this Mark sequence and appears on the sheets that mount it as a literal spec. Every generation elevates to the same angle and is drawn to a common maximum range, so a turret crew and a plotting room move up the ladder without relearning the drill. Rate of fire falls as the bore climbs and nobody in the Bureau of Ordnance regards that as a defect. THE MOUNTING NEVER CHANGES SHAPE ON THE WAY UP: three guns to a group at every bore, because a plant that scales one architecture does not pay twice for a second.",
  "bore_in": 21.5,
  "bore_mm": 546,
  "length_cal": 45,
  "shell_kg": 2300,
  "shell": "armor-piercing",
  "muzzle_ms": 800,
  "rpm_per_gun": 1.2,
  "turret_t": 4400,
  "year": 1929,
  "name": "Super-heavy gun line",
  "family": "gun",
  "interface": "barbette_ring"
}
```

### `us31tor` — Steam torpedo

```json
{
  "diameter_cm": 53,
  "length_m": 6.3,
  "mass_kg": 1570,
  "warhead_kg": 300,
  "drive": "steam wet-heater",
  "exploder": "dual mode: magnetic influence + contact",
  "depth": "set at the tube",
  "proof_firings": "none conducted at full charge",
  "note": "The influence exploder is the weapon's whole claim: fired under a keel, it is meant to do what no contact hit can. The fleet's torpedo doctrine is written on the assumption that it works.",
  "fast_kt": 46,
  "fast_m": 4100,
  "slow_kt": 31.5,
  "slow_m": 8200,
  "year": 1931,
  "name": "Steam torpedo",
  "family": "tor",
  "interface": "torpedo_tube_or_recess"
}
```

### `us34dir` — Dual-purpose director

```json
{
  "note": "The fleet's only tachymetric air solution, and the reason the dual-purpose battery is more than a gun that elevates.",
  "computer": "tachymetric dual-purpose, in the director head (topside)",
  "rangefinder_m": 3.5,
  "mass_t": 5,
  "year": 1934,
  "name": "Dual-purpose director",
  "family": "dir",
  "interface": "dp_director_seat"
}
```

### `us34lau` — Quad torpedo mount

```json
{
  "note": "No reload stowage was drawn into the mount, and none has been fitted to any ship that carries it: what is in the tubes is what the attack is worth. It is a fitting on ships that carry no provisions, so it serves where it was built in and nowhere else.",
  "mount": "quad",
  "mass_t": 18,
  "train": "powered, 360 deg on centerline mountings",
  "firing": "on gyro angle from the director",
  "reloads": 0,
  "year": 1934,
  "name": "Quad torpedo mount",
  "family": "lau",
  "interface": "torpedo_mount_seat"
}
```

### `us34sec` — Secondary battery line

```json
{
  "caliber_mm": 127,
  "ammunition": "semi-fixed",
  "commonality": "shellrooms, hoists and fuze well common across all mounts",
  "note": "Rearming up the line is the one cheap refit an American hull has — everything else it might want was never provisioned for.",
  "length_cal": 38,
  "mounting": "dual-purpose, single or twin base-ring",
  "shell_kg": 25,
  "muzzle_ms": 790,
  "range_km": 15.9,
  "ceiling_m": 11400,
  "rpm_per_gun": 18,
  "mass_t": 20,
  "mass_t_single": 29,
  "mass_t_twin": 43,
  "year": 1934,
  "name": "Secondary battery line",
  "family": "sec",
  "interface": "secondary_base_ring"
}
```

## Literal weapons and machinery

Classes using literal fits carry their complete weapon, protection and machinery input here. They are not unresolvable equipment SKUs.

### Delaware class — `delaware`

```json
{
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
  "propulsion": {
    "speed_kn": 21,
    "shp": 25000,
    "range_nm": 6000,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 280,
    "deck_mm": 51,
    "turret_mm": 305,
    "torpedo_defense": 0
  }
}
```

### Florida class — `florida`

```json
{
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
  "propulsion": {
    "speed_kn": 20.75,
    "shp": 28000,
    "range_nm": 5776,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 280,
    "deck_mm": 51,
    "turret_mm": 305,
    "torpedo_defense": 0
  }
}
```

### Wyoming class — `wyoming`

```json
{
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
  "propulsion": {
    "speed_kn": 20.5,
    "shp": 28000,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 280,
    "deck_mm": 51,
    "turret_mm": 305,
    "torpedo_defense": 1
  }
}
```

### New York class — `new_york`

```json
{
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
  "propulsion": {
    "speed_kn": 21,
    "shp": 28100,
    "range_nm": 7060,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 305,
    "deck_mm": 51,
    "turret_mm": 356,
    "torpedo_defense": 1
  }
}
```

### Nevada class — `nevada`

```json
{
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
  "propulsion": {
    "speed_kn": 20.5,
    "shp": 26500,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 343,
    "deck_mm": 76,
    "turret_mm": 406,
    "torpedo_defense": 2
  }
}
```

### Pennsylvania class — `pennsylvania`

```json
{
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
  "propulsion": {
    "speed_kn": 21,
    "shp": 31500,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 343,
    "deck_mm": 76,
    "turret_mm": 457,
    "torpedo_defense": 2
  }
}
```

### New Mexico class — `new_mexico`

```json
{
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
  "propulsion": {
    "speed_kn": 21,
    "shp": 32000,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 343,
    "deck_mm": 89,
    "turret_mm": 457,
    "torpedo_defense": 2
  }
}
```

### Tennessee class — `tennessee`

```json
{
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
  "propulsion": {
    "speed_kn": 21,
    "shp": 26800,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 343,
    "deck_mm": 89,
    "turret_mm": 457,
    "torpedo_defense": 3
  }
}
```

### Colorado class — `colorado`

```json
{
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
  "propulsion": {
    "speed_kn": 21,
    "shp": 28900,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 343,
    "deck_mm": 89,
    "turret_mm": 457,
    "torpedo_defense": 3
  }
}
```

### South Dakota class (1920, completed) — `south_dakota_1920`

```json
{
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
  "propulsion": {
    "speed_kn": 23,
    "shp": 60000,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 343,
    "deck_mm": 89,
    "turret_mm": 457,
    "torpedo_defense": 3
  }
}
```

### Lexington class (battlecruiser) — `lexington_cc`

```json
{
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
  "propulsion": {
    "speed_kn": 33.25,
    "shp": 180000,
    "range_nm": 10000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 178,
    "deck_mm": 57,
    "turret_mm": 279,
    "torpedo_defense": 2
  }
}
```

### Lexington class (carrier conversion) — `lexington_cv`

```json
{
  "armament": {
    "secondary_battery": [
      {
        "count": 8,
        "caliber_in": 8,
        "mounts": "4x2"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 33.25,
    "shp": 180000,
    "range_nm": 10000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 178,
    "deck_mm": 51
  }
}
```

### Langley — `langley`

```json
{
  "propulsion": {
    "speed_kn": 15,
    "shp": 7200,
    "range_nm": 3500,
    "range_at_kn": 10,
    "fuel": "oil"
  }
}
```

### Omaha class — `omaha`

```json
{
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
  "propulsion": {
    "speed_kn": 34,
    "shp": 90000,
    "range_nm": 9000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 76,
    "deck_mm": 38
  }
}
```

### Clemson class — `clemson`

```json
{
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
  "propulsion": {
    "speed_kn": 35,
    "shp": 27600,
    "range_nm": 4900,
    "range_at_kn": 15,
    "fuel": "oil"
  }
}
```

### Wickes class — `wickes`

```json
{
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
  "propulsion": {
    "speed_kn": 35,
    "shp": 24610,
    "range_nm": 3800,
    "range_at_kn": 15,
    "fuel": "oil"
  }
}
```

### S-boat class — `s_class_ss_usn`

```json
{
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
  "propulsion": {
    "speed_kn": 14.5,
    "range_nm": 5000,
    "range_at_kn": 10,
    "fuel": "diesel"
  }
}
```

### United States standard freighter 1922 — `us_merchant_1922`

```json
{
  "armament": {
    "main_battery": {
      "count": 0,
      "caliber_mm": 0
    }
  },
  "propulsion": {
    "speed_kn": 11,
    "range_nm": 6500
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  }
}
```

### United States standard freighter 1936 — `us_merchant_1936`

```json
{
  "armament": {
    "main_battery": {
      "count": 0,
      "caliber_mm": 0
    }
  },
  "propulsion": {
    "speed_kn": 13,
    "range_nm": 9000
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  }
}
```

### United States standard freighter 1948 — `us_merchant_1948`

```json
{
  "armament": {
    "main_battery": {
      "count": 0,
      "caliber_mm": 0
    }
  },
  "propulsion": {
    "speed_kn": 15,
    "range_nm": 11000
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  }
}
```

### Fleet depot · 1922 — `us_depot_1922`

```json
{
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
  "propulsion": {
    "speed_kn": 14,
    "range_nm": 9000
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  },
  "sensors": []
}
```

### Fleet oiler · 1922 — `us_oiler_1922`

```json
{
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
  "propulsion": {
    "speed_kn": 14,
    "range_nm": 9000
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  },
  "sensors": []
}
```

### Fleet depot · 1932 — `us_depot_1932`

```json
{
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
  "propulsion": {
    "speed_kn": 16,
    "range_nm": 10000
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  },
  "sensors": []
}
```

### Fleet oiler · 1932 — `us_oiler_1932`

```json
{
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
  "propulsion": {
    "speed_kn": 16,
    "range_nm": 10000
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  },
  "sensors": []
}
```

### Fleet depot · 1942 — `us_depot_1942`

```json
{
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
  "propulsion": {
    "speed_kn": 18,
    "range_nm": 11000
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  },
  "sensors": []
}
```

### Fleet oiler · 1942 — `us_oiler_1942`

```json
{
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
  "propulsion": {
    "speed_kn": 18,
    "range_nm": 11000
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  },
  "sensors": []
}
```
