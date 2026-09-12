# Japan — In Good Faith — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1936-01-01.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.19.0. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/jp.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1936-01-01. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is Yokosuka.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| Saipan / Tanapag | 2 | 1 Hibari (fighter) | 1 | 24 |
| Truk Lagoon | 2 | 1 Hibari (fighter) | 1 | 24 |
| Palau / Koror | 0 | None | 0 | 0 |
| Kwajalein | 0 | None | 0 | 0 |
| Majuro | 0 | None | 0 | 0 |
| Kure | 60 | 15 Hibari (fighter); 7 Hibari (scout); 14 Hibari (strike) | 36 | 720 |
| Sasebo | 60 | 15 Hibari (fighter); 7 Hibari (scout); 14 Hibari (strike) | 36 | 720 |
| Yokosuka | 60 | 15 Hibari (fighter); 7 Hibari (scout); 14 Hibari (strike) | 36 | 720 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

Other-service shore establishments fill up to 25% of base slots. They own separate aircraft and aircrews, replace losses at home monthly, and use physical ferry/merchant reinforcements. Naval base allocation is limited to the other 75%. [Operational air rules](../operational-air-warfare.md).

- Saipan / Tanapag: No other-service maritime aircraft
- Truk Lagoon: No other-service maritime aircraft
- Palau / Koror: No other-service maritime aircraft
- Kwajalein: No other-service maritime aircraft
- Majuro: No other-service maritime aircraft
- Kure: 6 JPN long-range maritime patrol · 1936; 9 JPN twin-engine maritime bomber · 1936
- Sasebo: 6 JPN long-range maritime patrol · 1936; 9 JPN twin-engine maritime bomber · 1936
- Yokosuka: 6 JPN long-range maritime patrol · 1936; 9 JPN twin-engine maritime bomber · 1936

### Hibari — `hibari_t33`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | light_multirole | 1 | 10 | 530 |

Complete playable model:

```json
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
    "max_alt_gear_kg": 2925,
    "derivation": {
      "comparator": "Mitsubishi A5M4",
      "comparator_kg": 1216,
      "added_kg": 281,
      "not_carried_kg": 0,
      "honest_kg": 1497,
      "dropped_kg": 45,
      "credit": 0.05
    }
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
  "notes": "Light multirole, one airframe and two undercarriages. Float wing loading afloat is 107 kg/m2, into the E13A (111) and OS2U (112) band and out of the Ar 196's (131). THE SPAN IS FIXED BY THE FOOTPRINT, NOT BY AERODYNAMICS: 5.9 m folded x 8.8 m long is 52 m2, the same as the Raiden, so the carriers' air groups are unchanged. The fold ratio is 2.24 -- an SB2C's -- and it is available because THE WING IS EMPTY: all 375 L is in the fuselage. DERIVED, NOT ASSERTED: one drag polar (f 0.6732, e 0.82) at eta 0.80 max / 0.50 CLIMB -- the fixed-pitch propeller, and the only airplane in this navy that does not use 0.62 -- and bsfc 0.26 kg/hp-h. Combat radius is ferry / 3; approach is the bare stall at normal weight on CLmax 1.55, no high-lift device.",
  "basing": {
    "carrier": true,
    "floatplane": true,
    "land": true
  },
  "catalogKind": "naval"
}
```

### Raiden — `raiden_t39`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | fighter | 1 | 15 | 965 |

Complete playable model:

```json
{
  "id": "raiden_t39",
  "name": "Raiden",
  "nation": "JPN",
  "designation": "Type 39",
  "type_year": 1939,
  "role": "fighter",
  "cost_gold": 15,
  "durability": 50,
  "powerplant": {
    "component": "jp39aeg",
    "count": 1,
    "takeoff_hp": 1090
  },
  "dimensions": {
    "span_m": 11.8,
    "span_folded_m": 5.9,
    "length_m": 8.8,
    "wing_area_m2": 20.5,
    "hangar_footprint_m2": 52
  },
  "weights": {
    "empty_kg": 1765,
    "normal_kg": 2635,
    "max_kg": 2755,
    "derivation": {
      "comparator": "A6M2 Model 21",
      "comparator_kg": 1680,
      "added_kg": 298,
      "not_carried_kg": 122,
      "honest_kg": 1856,
      "dropped_kg": 43,
      "credit": 0.05
    }
  },
  "crew": {
    "seats": 1,
    "normal": 1
  },
  "performance": {
    "speed_kmh": {
      "clean_at_6000m": 565,
      "sea_level": 491
    },
    "climb_ms": 16.1,
    "ceiling_m": 11645,
    "approach_kmh": 134
  },
  "fuel": {
    "internal_l": 750,
    "endurance_h": 11.9,
    "ferry_km": 2900,
    "combat_radius_km": 965
  },
  "armament": [
    {
      "component": "jp29can",
      "mount": "aircraft twin",
      "count": 1,
      "rounds": 320
    },
    {
      "component": "jp39rkt",
      "mount": "wing-root rails, semi-flush",
      "count": 12
    }
  ],
  "stations": [],
  "equipment": [],
  "features": [
    "bubble canopy",
    "cartridge-rail ejection seat",
    "fleet-beacon homing receiver and transponder",
    "leading-edge slats",
    "flush-riveted and aeroformed throughout, every gap sealed"
  ],
  "protection": [
    "armor glass",
    "8 mm seat plate",
    "self-sealing tanks"
  ],
  "kits": [],
  "possible_upgrades": [
    "jp43can",
    "jp44rkt"
  ],
  "notes": "Pure fighter: no recess, no station, no tank, no dive brakes and no radar. WING 20.5 m2 AT 11.8 m OF SPAN, AR 6.79, leading-edge slats and no Fowlers, so conventions 8 quotes her at CLmax 1.95 (slats alone) and the approach is the bare stall at normal weight. THE SPAN IS FIXED BY THE FOLD, NOT BY AERODYNAMICS: 5.9 m folded x 8.8 m long is the 52 m2 hangar footprint every Japanese air-group derivation is computed from, so span may not move without moving the carriers' capacity. AREA IS THE ONLY MANEUVER LEVER AVAILABLE AT A FIXED SPAN -- 18.0 -> 20.5 m2 takes wing loading from 146 to 128 kg/m2 and the sustained turn at 3,000 m from 23.0 to 23.9 deg/s at a 158 m radius, against an A6M2's 24.5 at 164 m, for 9 km/h and 55 km of ferry. A SMALLER WING DOES NOT FUND A FUEL CUT: at a fixed span L/Dmax goes as 1/sqrt(f) and the wing is about 40 percent of wetted area. She is below a Spitfire I of 1938 on speed and level with an A6M2 on turn while carrying armor and self-sealing that neither comparator has. DERIVED, NOT ASSERTED: one drag polar (f 0.4052, e 0.82) at eta 0.80 max / 0.62 climb and bsfc 0.26 kg/hp-h -- the Japanese figure, credited to the fleet's lean-cruise doctrine and NOT to the engine, which stays par. Combat radius is ferry / 3. WING STRUCTURE SCALES AS S^0.649 x AR^0.5, NOT AS A FLAT kg/m2: at a fixed span the aspect ratio falls as area grows and the two terms very nearly cancel, so 18.0 -> 20.5 m2 costs about 5 kg of airframe and not 32.",
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "catalogKind": "naval"
}
```

### Tenzan — `tenzan_t39`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | torpedo_bomber | 2 | 29 | 865 |

Complete playable model:

```json
{
  "id": "tenzan_t39",
  "name": "Tenzan",
  "nation": "JPN",
  "designation": "Type 39",
  "type_year": 1939,
  "role": "torpedo_bomber",
  "cost_gold": 29,
  "durability": 58,
  "powerplant": {
    "component": "jp39aeg",
    "count": 2,
    "takeoff_hp": 1090
  },
  "dimensions": {
    "span_m": 15,
    "span_folded_m": 8,
    "length_m": 10.8,
    "wing_area_m2": 29,
    "hangar_footprint_m2": 86
  },
  "weights": {
    "empty_kg": 3955,
    "normal_kg": 5490,
    "max_kg": 6910,
    "max_alt_gear_kg": 7630,
    "derivation": {
      "comparator": "Mitsubishi Ki-46-II",
      "comparator_kg": 3263,
      "added_kg": 1134,
      "not_carried_kg": 234,
      "honest_kg": 4163,
      "dropped_kg": 30,
      "credit": 0.05
    }
  },
  "crew": {
    "seats": 3,
    "normal": 2,
    "notes": "Pilot and observer side by side and offset; the third station is manned by mission. Single-rail ejection: all three seats fire together on one linked triple parachute. The third station's optional rear 7.7 mm and its 600 rounds, and the crewman who works them, are in max_kg and not in normal_kg; normal weight is two crew, full internal fuel and no store, which is where every performance figure is quoted."
  },
  "performance": {
    "speed_kmh": {
      "clean_at_5600m": 577,
      "with_torpedo": 551,
      "sea_level": 504
    },
    "climb_ms": 14.6,
    "ceiling_m": 10970,
    "approach_kmh": 147
  },
  "fuel": {
    "internal_l": 1500,
    "endurance_h": 9.5,
    "ferry_km": 2595,
    "combat_radius_km": 865,
    "with_tank": {
      "tank": "jp39tnk",
      "form": "2 x 650-form recess ferry tanks",
      "liters": 2500,
      "ferry_km": 4050,
      "combat_radius_km": 1350,
      "endurance_h": 13.3
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
      "id": "centerline_recess",
      "form": "torpedo",
      "rating_kg": 1300,
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
          "count": 1,
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
    "flush speed brakes",
    "side-by-side offset canopy",
    "cartridge-rail ejection seats",
    "fleet-beacon homing receiver and transponder",
    "flush-riveted and aeroformed throughout, every gap sealed"
  ],
  "protection": [
    "armor glass",
    "8 mm seat plates",
    "self-sealing tanks"
  ],
  "kits": [
    "jp39flt"
  ],
  "possible_upgrades": [
    "jp43can",
    "jp45tor",
    "jp42dpc",
    "jp44min",
    "jp44rad",
    "jp48rad"
  ],
  "notes": " The catapult and crane rating is kept in step with her maximum launch weight afloat, with margin; the two move together and neither constrains the other. Radar standard, dive brakes carried, no rockets; the crew fly armored. ⚠ NO ESCORT TRADE: the nose twin is a strafing battery and the airplane has no maneuver margin against a fighter — it is the thing escorted. ⚠ IT IS THE FLEET'S OUTER SEARCH: on a tandem pair of 650-form tanks, flown off carrier decks and cruiser catapults alike, which is why the float kit was drawn for a torpedo carrier. ⚠ DERIVED, NOT ASSERTED: one drag polar (f, e 0.82) at eta 0.80 max / 0.62 climb and bsfc 0.26 kg/hp-h — the Japanese figure, credited to the fleet's lean-cruise doctrine (cruising bank + engine cartridges, architecture) and NOT to the engine, which stays par. Everyone else uses 0.29. Combat radius is ferry / 3; approach is the bare stall. ⚠ FLUSH-RIVETED AND AEROFORMED THROUGHOUT, EVERY GAP SEALED — the 1933-34 hydroformed panel line applied to airplanes. This is PROCESS (Interest band), not performance. SECOND TRADE: with the recess empty she is a heavy fighter and, on her own radar, a night fighter -- decisive against bombers, shadowers and flying boats and outclassed by single-seat fighters in daylight, which is why she still has NO ESCORT TRADE and is herself the airplane escorted. It still costs her the band: at 579 km/h she is a shade over a Bf 110C and behind a Whirlwind, so the twin's speed has LEFT the Supporting band and is par. FOLD: 15.0 m folding to 8.0 m: the hinge sits 4.0 m from the centerline, about 1.2 m outboard of the structural minimum set by the nacelle and the gear bay it houses. The only real twin-engine carrier airplane with a folding wing, the Grumman F7F, folded 15.7 m to 8.15 m -- the same answer on a slightly larger machine. Folding tighter is geometric but puts a 4.6 m panel and its root bending moment on the hinge.  The third station's optional rear 7.7 mm is the legacy small-caliber pattern and has no equipment code, so it appears on the Armament row and not in the armament array. It, its 600 rounds and the crewman who works them are in max_kg and not in normal_kg. POST-RELEASE SHE IS A FIGHTER AND THE FIGURE THAT SAYS SO IS THE SUSTAINED TURN AT HER OWN CLmax 2.4 (slats AND Fowlers, which is what the printed 128 km/h approach implies): at 3,000 m and 65 percent fuel she holds 21.8 deg/s at a 173 m radius, against a Bf 109E-3's 20.7 at 188, a Spitfire I's 22.0 at 177 and an A6M2's 24.5 at 164 -- and against an F4F-4's 16.4 and a Bf 110C's 17.1. Her limits are ROLL (15 m of span, a twin, no boosted ailerons) and 40 s of trigger time on one twin, not the opponent.",
  "basing": {
    "carrier": true,
    "floatplane": true,
    "land": true
  },
  "catalogKind": "naval"
}
```

### Shinden — `shinden_t44`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1944 | universal_multirole | 1 | 38 | 650 |

Complete playable model:

```json
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
    "max_kg": 6770,
    "derivation": {
      "comparator": "MiG-15bis",
      "comparator_kg": 3681,
      "added_kg": 478,
      "not_carried_kg": 233,
      "honest_kg": 3926,
      "dropped_kg": 18,
      "credit": 0.05
    }
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
      "rating_kg": 1300,
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
          "count": 1,
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
  "notes": "Same recess, same ordnance forms, same catapult rating, same cannon, same beacon net. The catapult is how it goes — and the hole in its belly is the shape of a weight frozen in 1923. Not in production at as_of; scheduled 1944. DERIVED, NOT ASSERTED, AND ON A JET MODEL: thrust T(V,h) = 2,450 kgf x (rho/rho0)^0.885 x (1 - 0.30 M + 0.20 M^2), the ram-drag term of an early centrifugal turbojet, against the same polar form (f 0.4134, e 0.82). SPEED IS MACH-LIMITED ABOVE ABOUT 4,000 m AND THRUST-LIMITED BELOW: the printed 1,035 at 5,000 m and 970 at 10,000 m are Mach 0.90 to the kilometer, and the sea-level 1,040 is where thrust runs out. Ceiling 14,155 m fixes the lapse exponent. Range is the jet Breguet at the best-range speed (1.316 x the minimum-drag speed, L/D 0.866 x L/Dmax) on TSFC 1.30 kg/kgf-h, which reproduces the printed 1,950 km ferry.",
  "basing": {
    "carrier": true,
    "floatplane": true,
    "land": true
  },
  "catalogKind": "naval"
}
```

### JPN coastal patrol flying boat · 1921 — `jp_shore_patrol_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | maritime_patrol | 4 | Government managed | 522 |

Complete playable model:

```json
{
  "id": "jp_shore_patrol_1921",
  "nation": "JPN",
  "name": "JPN coastal patrol flying boat · 1921",
  "type_year": 1921,
  "role": "maritime_patrol",
  "catalogKind": "government",
  "generation": 1921,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": true
  },
  "crew": {
    "normal": 4
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 3500
  },
  "performance": {
    "speed_kmh": {
      "cruise": 145
    }
  },
  "fuel": {
    "combat_radius_km": 522
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN shore torpedo biplane · 1921 — `jp_shore_torpedo_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | maritime_strike | 3 | Government managed | 371 |

Complete playable model:

```json
{
  "id": "jp_shore_torpedo_1921",
  "nation": "JPN",
  "name": "JPN shore torpedo biplane · 1921",
  "type_year": 1921,
  "role": "maritime_strike",
  "catalogKind": "government",
  "generation": 1921,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": false
  },
  "crew": {
    "normal": 3
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 2400
  },
  "performance": {
    "speed_kmh": {
      "cruise": 170
    }
  },
  "fuel": {
    "combat_radius_km": 371
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN coastal patrol flying boat · 1924 — `jp_shore_patrol_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | maritime_patrol | 4 | Government managed | 644 |

Complete playable model:

```json
{
  "id": "jp_shore_patrol_1924",
  "nation": "JPN",
  "name": "JPN coastal patrol flying boat · 1924",
  "type_year": 1924,
  "role": "maritime_patrol",
  "catalogKind": "government",
  "generation": 1924,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": true
  },
  "crew": {
    "normal": 4
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 4130
  },
  "performance": {
    "speed_kmh": {
      "cruise": 163
    }
  },
  "fuel": {
    "combat_radius_km": 644
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN shore torpedo biplane · 1924 — `jp_shore_torpedo_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | maritime_strike | 3 | Government managed | 451 |

Complete playable model:

```json
{
  "id": "jp_shore_torpedo_1924",
  "nation": "JPN",
  "name": "JPN shore torpedo biplane · 1924",
  "type_year": 1924,
  "role": "maritime_strike",
  "catalogKind": "government",
  "generation": 1924,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": false
  },
  "crew": {
    "normal": 3
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 3030
  },
  "performance": {
    "speed_kmh": {
      "cruise": 188
    }
  },
  "fuel": {
    "combat_radius_km": 451
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN coastal patrol flying boat · 1927 — `jp_shore_patrol_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | maritime_patrol | 4 | Government managed | 766 |

Complete playable model:

```json
{
  "id": "jp_shore_patrol_1927",
  "nation": "JPN",
  "name": "JPN coastal patrol flying boat · 1927",
  "type_year": 1927,
  "role": "maritime_patrol",
  "catalogKind": "government",
  "generation": 1927,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": true
  },
  "crew": {
    "normal": 4
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 4760
  },
  "performance": {
    "speed_kmh": {
      "cruise": 181
    }
  },
  "fuel": {
    "combat_radius_km": 766
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN shore torpedo biplane · 1927 — `jp_shore_torpedo_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | maritime_strike | 3 | Government managed | 531 |

Complete playable model:

```json
{
  "id": "jp_shore_torpedo_1927",
  "nation": "JPN",
  "name": "JPN shore torpedo biplane · 1927",
  "type_year": 1927,
  "role": "maritime_strike",
  "catalogKind": "government",
  "generation": 1927,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": false
  },
  "crew": {
    "normal": 3
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 3660
  },
  "performance": {
    "speed_kmh": {
      "cruise": 206
    }
  },
  "fuel": {
    "combat_radius_km": 531
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN coastal patrol flying boat · 1930 — `jp_shore_patrol_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | maritime_patrol | 4 | Government managed | 887 |

Complete playable model:

```json
{
  "id": "jp_shore_patrol_1930",
  "nation": "JPN",
  "name": "JPN coastal patrol flying boat · 1930",
  "type_year": 1930,
  "role": "maritime_patrol",
  "catalogKind": "government",
  "generation": 1930,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": true
  },
  "crew": {
    "normal": 4
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 5390
  },
  "performance": {
    "speed_kmh": {
      "cruise": 199
    }
  },
  "fuel": {
    "combat_radius_km": 887
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN shore torpedo biplane · 1930 — `jp_shore_torpedo_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | maritime_strike | 3 | Government managed | 611 |

Complete playable model:

```json
{
  "id": "jp_shore_torpedo_1930",
  "nation": "JPN",
  "name": "JPN shore torpedo biplane · 1930",
  "type_year": 1930,
  "role": "maritime_strike",
  "catalogKind": "government",
  "generation": 1930,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": false
  },
  "crew": {
    "normal": 3
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 4290
  },
  "performance": {
    "speed_kmh": {
      "cruise": 224
    }
  },
  "fuel": {
    "combat_radius_km": 611
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN coastal patrol flying boat · 1933 — `jp_shore_patrol_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | maritime_patrol | 7 | Government managed | 1009 |

Complete playable model:

```json
{
  "id": "jp_shore_patrol_1933",
  "nation": "JPN",
  "name": "JPN coastal patrol flying boat · 1933",
  "type_year": 1933,
  "role": "maritime_patrol",
  "catalogKind": "government",
  "generation": 1933,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": true
  },
  "crew": {
    "normal": 7
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 6020
  },
  "performance": {
    "speed_kmh": {
      "cruise": 217
    }
  },
  "fuel": {
    "combat_radius_km": 1009
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN twin-engine maritime bomber · 1933 — `jp_shore_torpedo_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | maritime_strike | 5 | Government managed | 691 |

Complete playable model:

```json
{
  "id": "jp_shore_torpedo_1933",
  "nation": "JPN",
  "name": "JPN twin-engine maritime bomber · 1933",
  "type_year": 1933,
  "role": "maritime_strike",
  "catalogKind": "government",
  "generation": 1933,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": false
  },
  "crew": {
    "normal": 5
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 4920
  },
  "performance": {
    "speed_kmh": {
      "cruise": 242
    }
  },
  "fuel": {
    "combat_radius_km": 691
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN long-range maritime patrol · 1936 — `jp_shore_patrol_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | maritime_patrol | 7 | Government managed | 1131 |

Complete playable model:

```json
{
  "id": "jp_shore_patrol_1936",
  "nation": "JPN",
  "name": "JPN long-range maritime patrol · 1936",
  "type_year": 1936,
  "role": "maritime_patrol",
  "catalogKind": "government",
  "generation": 1936,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": true
  },
  "crew": {
    "normal": 7
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 6650
  },
  "performance": {
    "speed_kmh": {
      "cruise": 235
    }
  },
  "fuel": {
    "combat_radius_km": 1131
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN twin-engine maritime bomber · 1936 — `jp_shore_torpedo_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | maritime_strike | 5 | Government managed | 771 |

Complete playable model:

```json
{
  "id": "jp_shore_torpedo_1936",
  "nation": "JPN",
  "name": "JPN twin-engine maritime bomber · 1936",
  "type_year": 1936,
  "role": "maritime_strike",
  "catalogKind": "government",
  "generation": 1936,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": false
  },
  "crew": {
    "normal": 5
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 5550
  },
  "performance": {
    "speed_kmh": {
      "cruise": 260
    }
  },
  "fuel": {
    "combat_radius_km": 771
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN long-range maritime patrol · 1939 — `jp_shore_patrol_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | maritime_patrol | 7 | Government managed | 1253 |

Complete playable model:

```json
{
  "id": "jp_shore_patrol_1939",
  "nation": "JPN",
  "name": "JPN long-range maritime patrol · 1939",
  "type_year": 1939,
  "role": "maritime_patrol",
  "catalogKind": "government",
  "generation": 1939,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": true
  },
  "crew": {
    "normal": 7
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 7280
  },
  "performance": {
    "speed_kmh": {
      "cruise": 253
    }
  },
  "fuel": {
    "combat_radius_km": 1253
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN twin-engine maritime bomber · 1939 — `jp_shore_torpedo_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | maritime_strike | 5 | Government managed | 851 |

Complete playable model:

```json
{
  "id": "jp_shore_torpedo_1939",
  "nation": "JPN",
  "name": "JPN twin-engine maritime bomber · 1939",
  "type_year": 1939,
  "role": "maritime_strike",
  "catalogKind": "government",
  "generation": 1939,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": false
  },
  "crew": {
    "normal": 5
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 6180
  },
  "performance": {
    "speed_kmh": {
      "cruise": 278
    }
  },
  "fuel": {
    "combat_radius_km": 851
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN long-range maritime patrol · 1942 — `jp_shore_patrol_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | maritime_patrol | 7 | Government managed | 1375 |

Complete playable model:

```json
{
  "id": "jp_shore_patrol_1942",
  "nation": "JPN",
  "name": "JPN long-range maritime patrol · 1942",
  "type_year": 1942,
  "role": "maritime_patrol",
  "catalogKind": "government",
  "generation": 1942,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": false
  },
  "crew": {
    "normal": 7
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 7910
  },
  "performance": {
    "speed_kmh": {
      "cruise": 271
    }
  },
  "fuel": {
    "combat_radius_km": 1375
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN long-range maritime strike · 1942 — `jp_shore_torpedo_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | maritime_strike | 5 | Government managed | 931 |

Complete playable model:

```json
{
  "id": "jp_shore_torpedo_1942",
  "nation": "JPN",
  "name": "JPN long-range maritime strike · 1942",
  "type_year": 1942,
  "role": "maritime_strike",
  "catalogKind": "government",
  "generation": 1942,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": false
  },
  "crew": {
    "normal": 5
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 6810
  },
  "performance": {
    "speed_kmh": {
      "cruise": 296
    }
  },
  "fuel": {
    "combat_radius_km": 931
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN long-range maritime patrol · 1945 — `jp_shore_patrol_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | maritime_patrol | 7 | Government managed | 1496 |

Complete playable model:

```json
{
  "id": "jp_shore_patrol_1945",
  "nation": "JPN",
  "name": "JPN long-range maritime patrol · 1945",
  "type_year": 1945,
  "role": "maritime_patrol",
  "catalogKind": "government",
  "generation": 1945,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": false
  },
  "crew": {
    "normal": 7
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 8540
  },
  "performance": {
    "speed_kmh": {
      "cruise": 289
    }
  },
  "fuel": {
    "combat_radius_km": 1496
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN long-range maritime strike · 1945 — `jp_shore_torpedo_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | maritime_strike | 5 | Government managed | 1012 |

Complete playable model:

```json
{
  "id": "jp_shore_torpedo_1945",
  "nation": "JPN",
  "name": "JPN long-range maritime strike · 1945",
  "type_year": 1945,
  "role": "maritime_strike",
  "catalogKind": "government",
  "generation": 1945,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": false
  },
  "crew": {
    "normal": 5
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 7440
  },
  "performance": {
    "speed_kmh": {
      "cruise": 314
    }
  },
  "fuel": {
    "combat_radius_km": 1012
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN long-range maritime patrol · 1948 — `jp_shore_patrol_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | maritime_patrol | 7 | Government managed | 1618 |

Complete playable model:

```json
{
  "id": "jp_shore_patrol_1948",
  "nation": "JPN",
  "name": "JPN long-range maritime patrol · 1948",
  "type_year": 1948,
  "role": "maritime_patrol",
  "catalogKind": "government",
  "generation": 1948,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": false
  },
  "crew": {
    "normal": 7
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 9170
  },
  "performance": {
    "speed_kmh": {
      "cruise": 307
    }
  },
  "fuel": {
    "combat_radius_km": 1618
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### JPN long-range maritime strike · 1948 — `jp_shore_torpedo_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | maritime_strike | 5 | Government managed | 1092 |

Complete playable model:

```json
{
  "id": "jp_shore_torpedo_1948",
  "nation": "JPN",
  "name": "JPN long-range maritime strike · 1948",
  "type_year": 1948,
  "role": "maritime_strike",
  "catalogKind": "government",
  "generation": 1948,
  "readOnly": true,
  "basing": {
    "carrier": false,
    "floatplane": false,
    "land": true,
    "flyingBoat": false
  },
  "crew": {
    "normal": 5
  },
  "cost_gold": 0,
  "weights": {
    "empty_kg": 8070
  },
  "performance": {
    "speed_kmh": {
      "cruise": 332
    }
  },
  "fuel": {
    "combat_radius_km": 1092
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

## Referenced equipment

Original equipment generations retain their original national catalog as owner. New sonar sets are conservative, provisional 1930 active-sonar fits; no radar capability is implied.

### `jp22eng` — Diesel engine cartridge

```json
{
  "envelope_m": [
    3.8,
    2.4,
    3
  ],
  "mass_t": 50,
  "handling": "one heavy-derrick lift",
  "drive": "diesel-electric, fixed motor rooms",
  "swap_h": 30,
  "swap_conditions": "alongside a tender in sheltered water",
  "submarine_swap": "soft patch, yard evolution ~10 days",
  "note": "The bay is the commitment and the engine improves inside it. Every hull laid down from 1922 carried the same bay whether its engines existed yet or not. The same block is the state railways' locomotive prime mover and the ports' shore generator.",
  "bhp": 1000,
  "tbo_h": 900,
  "year": 1922,
  "name": "Diesel engine cartridge",
  "family": "eng",
  "interface": "engine_bay"
}
```

### `jp25lau` — Quad torpedo launcher

```json
{
  "mount": "quad",
  "mass_t": 16,
  "train": "powered, 360 deg on centerline mounts",
  "charging": "manifold from the ship's high-pressure cascade bank",
  "note": "The defining component is the charging manifold, not the tubes: every torpedo is stowed inert and brought to life at loading.",
  "reload_min": 6,
  "year": 1925,
  "name": "Quad torpedo launcher",
  "family": "lau",
  "interface": "launcher_foundation"
}
```

### `jp29can` — Twin 25 mm cannon

```json
{
  "note": "One works produces the barrels, the springs and the belts for every mount in the fleet, afloat and airborne alike, off one drawing.",
  "round": "25 x 163 mm",
  "natures": 1,
  "projectile": "240 g semi-armor-piercing high-explosive tracer",
  "muzzle_ms": 920,
  "rpm_per_barrel": 240,
  "feed": "belt; magazine capacity is a property of the mount",
  "round_complete_g": 595,
  "round_belted_g": 620,
  "barrel_life_rounds": 9600,
  "mounts": {
    "aircraft_twin_kg": 182,
    "naval_twin_kg": 770,
    "note": "Mount masses are the MOUNT, less ammunition. A belted round weighs 620 g, so an aircraft twin's 320 rounds add 198 kg to the 182 kg mounting."
  },
  "year": 1929,
  "name": "Twin 25 mm cannon",
  "family": "can",
  "interface": "cannon_position"
}
```

### `jp29gun` — 14 cm triple dual-purpose turret

```json
{
  "caliber_cm": 14,
  "barrels": 3,
  "elevation_deg": 75,
  "ramming": "any-angle power",
  "ammunition": "semi-fixed",
  "note": "One barbette ring, all hulls. A turret change is a crane evolution at any fleet anchorage.",
  "length_cal": 50,
  "muzzle_ms": 850,
  "range_km": 21,
  "ceiling_m": 11500,
  "drive": "electro-hydraulic",
  "rpm_per_gun": 8,
  "mass_t": 112,
  "year": 1929,
  "name": "14 cm triple dual-purpose turret",
  "family": "gun",
  "interface": "barbette_ring"
}
```

### `jp30dir` — Director

```json
{
  "note": "One head, one computer, one school, every gunned hull. The 1941 and 1945 steps change what feeds the computer, never where it sits or who runs it.",
  "rangefinder_m": 4.5,
  "rangefinder": "stereo",
  "computer": "mechanical dual-purpose",
  "head_mass_t": 9,
  "year": 1930,
  "name": "Director",
  "family": "dir",
  "interface": "director_trunnion"
}
```

### `jp31bcn` — Fleet homing beacon

```json
{
  "net": "one fleet wavelength",
  "halves": "ship transmitter; aircraft receiver and transponder",
  "identification": "keyed",
  "ship_beacon_km": 300,
  "interrogation_km": 130,
  "ship_set_kg": 340,
  "aircraft_set_kg": 26,
  "year": 1931,
  "name": "Fleet homing beacon",
  "family": "bcn",
  "interface": "beacon_net"
}
```

### `jp31snr` — Sonar

```json
{
  "note": "The set, the depth-charge battery it aims and its school were designed as one artifact — the ship is the sonar's delivery system, not the reverse. Its tables, not its transducers, are the set's real secret.",
  "active_khz": 17,
  "reliable_m": 2000,
  "good_conditions_m": 3500,
  "passive": "hydrophone array",
  "year": 1931,
  "name": "Sonar",
  "family": "snr",
  "interface": "sonar_dome"
}
```

### `jp32dpc` — Depth charge

```json
{
  "air_kit": "to the bomb form: nose fairing + tail cone, +8 kg per charge -- 162 kg as dropped",
  "note": "ONE DRUM SERVES BOTH GENERATIONS: the torpedo warhead was already broken into modular charges for handling, so the drum was sized around one of them and nothing new is filled. A later generation is a fuze setting and a thrower pattern, not a new store. Explosive production is one stream feeding two shapes.",
  "drum_kg": 154,
  "burster_kg": 100,
  "burster_source": "one of the torpedo warhead's three modular 100 kg charges",
  "air_carriage": "4 per bomb-form centerline station",
  "as_dropped_kg": 162,
  "fuze": "hydrostatic",
  "setting_m": [
    30,
    90
  ],
  "year": 1932,
  "name": "Depth charge",
  "family": "dpc",
  "interface": "depth_charge_rail"
}
```

### `jp32eng` — Diesel engine cartridge

```json
{
  "envelope_m": [
    3.8,
    2.4,
    3
  ],
  "mass_t": 50,
  "handling": "one heavy-derrick lift",
  "drive": "diesel-electric, fixed motor rooms",
  "swap_h": 30,
  "swap_conditions": "alongside a tender in sheltered water",
  "submarine_swap": "soft patch, yard evolution ~10 days",
  "note": "The bay is the commitment and the engine improves inside it. Every hull laid down from 1922 carried the same bay whether its engines existed yet or not. The same block is the state railways' locomotive prime mover and the ports' shore generator.",
  "bhp": 3000,
  "tbo_h": 4200,
  "year": 1932,
  "name": "Diesel engine cartridge",
  "family": "eng",
  "interface": "engine_bay"
}
```

### `jp32min` — Mine

```json
{
  "air_kit": "drogue-retarded cylinder case in the bomb form",
  "note": "Stocks are held unassembled: the mine reserve and the torpedo reserve are one inventory until the day they are assembled, invisible to any registry inspection. Case production is sheet-metal work placed with civilian fabricators, invisible in any naval budget.",
  "type": "moored contact",
  "laid_kg": 660,
  "composition": "300 kg warhead section + case kit",
  "year": 1932,
  "name": "Mine",
  "family": "min",
  "interface": "mine_rail"
}
```

### `jp33tor` — Torpedo

```json
{
  "diameter_cm": 50,
  "length_m": 5.9,
  "mass_kg": 1300,
  "warhead_kg": 300,
  "stowage": "inert, cascade-charged at loading",
  "air_drop": "as built (reinforced vessel + wooden aero shroud)",
  "drop_gate_kmh": 450,
  "drop_gate_m": 100,
  "note": "The weight was fixed at what a single-engine aircraft lifts from a deck run, and half the navy was sized around it. The torpedo is the fleet's true main battery; everything else in the catalog exists to deliver it. The warhead is built as three modular 100 kg charges for handling, and the depth charge's burster is one of them.",
  "warhead_charges": "3 x 100 kg modular charges",
  "propellant": "oxygen",
  "fast_kt": 49,
  "fast_m": 14000,
  "slow_kt": 32,
  "slow_m": 32500,
  "wakeless": true,
  "year": 1933,
  "name": "Torpedo",
  "family": "tor",
  "interface": "torpedo_tube_or_recess"
}
```

### `jp42eng` — Diesel engine cartridge

```json
{
  "envelope_m": [
    3.8,
    2.4,
    3
  ],
  "mass_t": 50,
  "handling": "one heavy-derrick lift",
  "drive": "diesel-electric, fixed motor rooms",
  "swap_h": 30,
  "swap_conditions": "alongside a tender in sheltered water",
  "submarine_swap": "soft patch, yard evolution ~10 days",
  "note": "The bay is the commitment and the engine improves inside it. Every hull laid down from 1922 carried the same bay whether its engines existed yet or not. The same block is the state railways' locomotive prime mover and the ports' shore generator.",
  "bhp": 4000,
  "tbo_h": 6200,
  "footprint": "unchanged",
  "couplings": "unchanged",
  "year": 1942,
  "name": "Diesel engine cartridge",
  "family": "eng",
  "interface": "engine_bay"
}
```

## Literal weapons and machinery

Classes using literal fits carry their complete weapon, protection and machinery input here. They are not unresolvable equipment SKUs.

### Kawachi class — `kawachi`

```json
{
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
  "propulsion": {
    "speed_kn": 20,
    "shp": 25000,
    "range_nm": 2700,
    "range_at_kn": 18,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 305,
    "deck_mm": 51,
    "turret_mm": 279,
    "torpedo_defense": 0
  }
}
```

### Kongo class — `kongo`

```json
{
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
  "propulsion": {
    "speed_kn": 27.5,
    "shp": 64000,
    "range_nm": 8000,
    "range_at_kn": 14,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 203,
    "deck_mm": 57,
    "turret_mm": 229,
    "torpedo_defense": 1
  }
}
```

### Fuso class — `fuso`

```json
{
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
  "propulsion": {
    "speed_kn": 22.5,
    "shp": 40000,
    "range_nm": 8000,
    "range_at_kn": 14,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 305,
    "deck_mm": 64,
    "turret_mm": 305,
    "torpedo_defense": 1
  }
}
```

### Ise class — `ise`

```json
{
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
  "propulsion": {
    "speed_kn": 23,
    "shp": 45000,
    "range_nm": 9680,
    "range_at_kn": 14,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 305,
    "deck_mm": 64,
    "turret_mm": 305,
    "torpedo_defense": 1
  }
}
```

### Nagato class — `nagato`

```json
{
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
  "propulsion": {
    "speed_kn": 26.5,
    "shp": 80000,
    "range_nm": 5500,
    "range_at_kn": 16,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 305,
    "deck_mm": 76,
    "turret_mm": 356,
    "torpedo_defense": 2
  }
}
```

### Tosa class — `tosa`

```json
{
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
  "propulsion": {
    "speed_kn": 26.5,
    "shp": 91000,
    "range_nm": 6500,
    "range_at_kn": 16,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 280,
    "deck_mm": 102,
    "turret_mm": 356,
    "torpedo_defense": 2
  }
}
```

### Amagi class — `amagi`

```json
{
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
  "propulsion": {
    "speed_kn": 30,
    "shp": 131200,
    "range_nm": 8000,
    "range_at_kn": 14,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 254,
    "deck_mm": 95,
    "turret_mm": 280,
    "torpedo_defense": 2
  }
}
```

### Kii class (canceled) — `kii`

```json
{
  "armament": {
    "main_battery": {
      "count": 10,
      "caliber_in": 16.1,
      "mounts": "5x2"
    }
  },
  "propulsion": {
    "speed_kn": 29.75,
    "shp": 131200,
    "range_nm": 8000,
    "range_at_kn": 14,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 292,
    "deck_mm": 120,
    "turret_mm": 280,
    "torpedo_defense": 2
  }
}
```

### Number 13 class (design study) — `number_13`

```json
{
  "armament": {
    "main_battery": {
      "count": 8,
      "caliber_in": 18,
      "mounts": "4x2"
    }
  },
  "propulsion": {
    "speed_kn": 30,
    "shp": 150000,
    "range_nm": 8000,
    "range_at_kn": 14,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 330,
    "deck_mm": 127,
    "turret_mm": 356,
    "torpedo_defense": 3
  }
}
```

### Hosho — `hosho`

```json
{
  "propulsion": {
    "speed_kn": 25,
    "shp": 30000,
    "range_nm": 8680,
    "range_at_kn": 12,
    "fuel": "mixed"
  }
}
```

### Akagi (carrier conversion) — `akagi_cv`

```json
{
  "armament": {
    "secondary_battery": [
      {
        "count": 10,
        "caliber_in": 7.9,
        "mounts": "2x2+6 casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 31,
    "shp": 131200,
    "range_nm": 8000,
    "range_at_kn": 14,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 152,
    "deck_mm": 57
  }
}
```

### Kaga (carrier conversion) — `kaga_cv`

```json
{
  "armament": {
    "secondary_battery": [
      {
        "count": 10,
        "caliber_in": 7.9,
        "mounts": "2x2+6 casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 27.5,
    "shp": 91000,
    "range_nm": 8000,
    "range_at_kn": 14,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 152,
    "deck_mm": 57
  }
}
```

### Kuma class — `kuma`

```json
{
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
  "propulsion": {
    "speed_kn": 36,
    "shp": 90000,
    "range_nm": 9000,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 64,
    "deck_mm": 29
  }
}
```

### Nagara class — `nagara`

```json
{
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
  "propulsion": {
    "speed_kn": 36,
    "shp": 90000,
    "range_nm": 9000,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 64,
    "deck_mm": 29
  }
}
```

### Furutaka class — `furutaka`

```json
{
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
  "propulsion": {
    "speed_kn": 34.5,
    "shp": 102000,
    "range_nm": 6000,
    "range_at_kn": 14,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 76,
    "deck_mm": 35
  }
}
```

### Yubari (experimental) — `yubari`

```json
{
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
  "propulsion": {
    "speed_kn": 35.5,
    "shp": 57900,
    "range_nm": 5000,
    "range_at_kn": 14,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 38,
    "deck_mm": 25
  }
}
```

### Minekaze class — `minekaze`

```json
{
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
  "propulsion": {
    "speed_kn": 39,
    "shp": 38500,
    "range_nm": 3600,
    "range_at_kn": 14,
    "fuel": "oil"
  }
}
```

### Momi class (2nd class) — `momi`

```json
{
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
  "propulsion": {
    "speed_kn": 36,
    "shp": 21500,
    "range_nm": 3000,
    "range_at_kn": 15,
    "fuel": "oil"
  }
}
```

### Kaichu type — `kaichu`

```json
{
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
  "propulsion": {
    "speed_kn": 16,
    "range_nm": 4000,
    "range_at_kn": 10,
    "fuel": "diesel"
  }
}
```

### Japan standard freighter 1922 — `jp_merchant_1922`

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

### Japan standard freighter 1936 — `jp_merchant_1936`

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

### Japan standard freighter 1948 — `jp_merchant_1948`

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
