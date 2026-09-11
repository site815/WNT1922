# United Kingdom — In Good Faith — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1936-01-01.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.0. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/uk.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1936-01-01. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is Scapa Flow.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| Tarawa | 0 | None | 0 | 0 |
| Portsmouth | 60 | 36 Skua (strike) | 36 | 720 |
| Rosyth | 60 | 36 Skua (strike) | 36 | 720 |
| Scapa Flow | 30 | 18 Skua (strike) | 18 | 360 |
| Gibraltar | 60 | 36 Skua (strike) | 36 | 720 |
| Alexandria | 30 | 18 Skua (strike) | 18 | 360 |
| Singapore | 30 | 18 Skua (strike) | 18 | 360 |
| Freetown station | 4 | 2 Skua (strike) | 2 | 48 |
| Ascension anchorage | 0 | None | 0 | 0 |
| Simon’s Town | 60 | 36 Skua (strike) | 36 | 720 |
| Durban station | 30 | 18 Skua (strike) | 18 | 360 |
| Mauritius station | 4 | 2 Skua (strike) | 2 | 48 |
| Chagos anchorage | 0 | None | 0 | 0 |
| Trincomalee | 30 | 18 Skua (strike) | 18 | 360 |
| Fremantle | 30 | 18 Skua (strike) | 18 | 360 |
| Malta / Valletta | 60 | 36 Skua (strike) | 36 | 720 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

### Skua — `skua`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | dive_bomber | 2 | 12 | 590 |

Complete playable model:

```json
{
  "id": "skua",
  "name": "Skua",
  "nation": "GBR",
  "designation": "Skua",
  "type_year": 1936,
  "role": "dive_bomber",
  "cost_gold": 12,
  "durability": 30,
  "powerplant": {
    "count": 1,
    "takeoff_hp": 830,
    "spec": {
      "layout": "9-cylinder sleeve-valve radial",
      "displacement_l": 24.9,
      "mass_kg": 470,
      "hp_takeoff": 830,
      "hp_at_3000m": 780,
      "supercharger": "single-speed",
      "tbo_h": 380,
      "note": "United Kingdom has no aero-engine SKU. The Air Ministry owns aircraft procurement and sells the Admiralty a finished airplane; there is no line in the equipment catalog to point at."
    }
  },
  "dimensions": {
    "span_m": 14,
    "span_folded_m": 5.6,
    "length_m": 10.4,
    "wing_area_m2": 30,
    "hangar_footprint_m2": 58
  },
  "weights": {
    "empty_kg": 2597,
    "normal_kg": 3690,
    "max_kg": 4390,
    "derivation": {
      "comparator": "Blackburn Skua Mk II",
      "comparator_kg": 2493,
      "added_kg": 104,
      "not_carried_kg": 0,
      "honest_kg": 2597,
      "credit": 0,
      "dropped_kg": 0
    }
  },
  "crew": {
    "seats": 2,
    "normal": 2,
    "notes": "Pilot and observer/telegraphist-air-gunner; the observer's station is a wireless set and a plotting board."
  },
  "performance": {
    "speed_kmh": {
      "at_3000m": 368,
      "with_bomb": 353,
      "sea_level": 343
    },
    "climb_ms": 6.7,
    "ceiling_m": 6660,
    "approach_kmh": 122
  },
  "fuel": {
    "internal_l": 900,
    "endurance_h": 8.2,
    "ferry_km": 1770,
    "combat_radius_km": 590,
    "with_tank": {
      "form": "2 x Mark I drop tanks, underwing",
      "liters": 1180,
      "endurance_h": 9.7,
      "ferry_km": 2185,
      "combat_radius_km": 730
    }
  },
  "armament": [
    {
      "mount": "cowl, synchronised",
      "count": 2,
      "rounds": 1600,
      "spec": {
        "name": "Mark II 7.7 mm machine gun",
        "caliber_mm": 7.7,
        "round_belted_g": 28,
        "gun_kg": 10
      }
    },
    {
      "mount": "flexible rear ring",
      "count": 1,
      "rounds": 800,
      "spec": {
        "name": "Mark II 7.7 mm machine gun",
        "caliber_mm": 7.7,
        "round_belted_g": 28,
        "gun_kg": 10
      }
    }
  ],
  "stations": [
    {
      "id": "centerline_crutch",
      "form": "bomb",
      "rating_kg": 500,
      "alternatives": [
        {
          "spec": {
            "name": "Mark I 227 kg bomb",
            "mass_kg": 227
          },
          "count": 1
        }
      ]
    },
    {
      "id": "underwing",
      "form": "rack",
      "rating_kg": 113,
      "racks": 4,
      "alternatives": [
        {
          "component": "uk34tnk",
          "count": 2
        }
      ]
    }
  ],
  "equipment": [],
  "features": [
    "Fowler flaps",
    "centerline crutch (500 kg-rated, swinging): 1 x Mark I bomb",
    "swinging centerline crutch",
    "dive brakes",
    "folding wings",
    "retracting undercarriage",
    "arrester hook",
    "flotation gear",
    "long-range wireless-telegraphy set and plotting board",
    "enclosed sliding canopy",
    "2 x cowl 7.7 mm + 1 x flexible rear 7.7 mm machine gun, 2,400 rounds",
    "4 underwing racks rated 113 kg each, 2 drop tanks"
  ],
  "protection": [
    "armored windscreen"
  ],
  "kits": [],
  "possible_upgrades": [],
  "notes": "THE OLDEST OF THE THREE AND THE REASON THE OTHER TWO EXIST: the first British airplane specified by the Admiralty, in 1934, for a job the Admiralty had defined - search to the horizon of the fleet's own gunnery and then attack what it finds. Two seats, a wireless set and a plotting board, dive brakes, and a bomb heavy enough to matter against a deck. WHAT SHE CANNOT DO IS FIGHT: two rifle-caliber guns forward and one aft is a scout's armament and the handbook says so. ⚠ DERIVED, NOT ASSERTED: speed, climb, ceiling, range and endurance all fall out of one drag polar (f, e 0.82) at eta 0.80 max / 0.62 climb and 0.29 kg/hp-h cruise, on the model calibrated against the A6M2, Bf 109E-3, Spitfire I, F4F-4, Fw 190A-3, Bf 110C, Gladiator, Swordfish, Skua, Fulmar and Albacore. Combat radius is ferry / 3 (conventions 4).",
  "fittings": [
    {
      "name": "Wireless and plotting board",
      "installed_kg": 55
    }
  ]
}
```

### Shearwater — `shearwater`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1937 | torpedo_bomber | 3 | 16 | 765 |

Complete playable model:

```json
{
  "id": "shearwater",
  "name": "Shearwater",
  "nation": "GBR",
  "designation": "Shearwater",
  "type_year": 1937,
  "role": "torpedo_bomber",
  "cost_gold": 16,
  "durability": 36,
  "powerplant": {
    "count": 1,
    "takeoff_hp": 1000,
    "spec": {
      "layout": "9-cylinder radial",
      "displacement_l": 28.7,
      "mass_kg": 500,
      "hp_takeoff": 1000,
      "hp_at_3000m": 930,
      "supercharger": "two-speed",
      "tbo_h": 400,
      "note": "United Kingdom has no aero-engine SKU. The Air Ministry owns aircraft procurement and sells the Admiralty a finished airplane; there is no line in the equipment catalog to point at."
    }
  },
  "dimensions": {
    "span_m": 15.6,
    "span_folded_m": 6.4,
    "length_m": 11.8,
    "wing_area_m2": 39,
    "hangar_footprint_m2": 76
  },
  "weights": {
    "empty_kg": 2505,
    "normal_kg": 3930,
    "max_kg": 4830,
    "derivation": {
      "comparator": "Nakajima B5N2",
      "comparator_kg": 2279,
      "added_kg": 226,
      "not_carried_kg": 0,
      "honest_kg": 2505,
      "credit": 0,
      "dropped_kg": 0
    }
  },
  "crew": {
    "seats": 3,
    "normal": 3,
    "notes": "Pilot, observer, telegraphist-air-gunner. The third crewman is the point of the design and the reason it is a biplane."
  },
  "performance": {
    "speed_kmh": {
      "at_3000m": 354,
      "with_torpedo": 324,
      "sea_level": 334
    },
    "climb_ms": 8.4,
    "ceiling_m": 7500,
    "approach_kmh": 111
  },
  "fuel": {
    "internal_l": 1250,
    "endurance_h": 10.7,
    "ferry_km": 2290,
    "combat_radius_km": 765,
    "with_tank": {
      "form": "2 x Mark I drop tanks, underwing",
      "liters": 1530,
      "endurance_h": 11.9,
      "ferry_km": 2665,
      "combat_radius_km": 890
    }
  },
  "armament": [
    {
      "mount": "cowl, synchronised",
      "count": 1,
      "rounds": 1000,
      "spec": {
        "name": "Mark II 7.7 mm machine gun",
        "caliber_mm": 7.7,
        "round_belted_g": 28,
        "gun_kg": 10
      }
    },
    {
      "mount": "flexible rear ring",
      "count": 1,
      "rounds": 1000,
      "spec": {
        "name": "Mark II 7.7 mm machine gun",
        "caliber_mm": 7.7,
        "round_belted_g": 28,
        "gun_kg": 10
      }
    }
  ],
  "stations": [
    {
      "id": "centerline_crutch",
      "form": "torpedo",
      "rating_kg": 900,
      "alternatives": [
        {
          "component": "uk32tor",
          "count": 1
        },
        {
          "spec": {
            "name": "Mark I 227 kg bomb",
            "mass_kg": 227
          },
          "count": 1
        }
      ]
    },
    {
      "id": "underwing",
      "form": "rack",
      "rating_kg": 113,
      "racks": 4,
      "alternatives": [
        {
          "component": "uk34tnk",
          "count": 2
        }
      ]
    }
  ],
  "equipment": [],
  "features": [
    "Fowler flaps",
    "folding wings",
    "retracting undercarriage",
    "arrester hook",
    "flotation gear",
    "long-range wireless-telegraphy set and plotting table (observer's station)",
    "enclosed canopy, three stations",
    "1 x cowl 7.7 mm + 1 x flexible rear 7.7 mm machine gun, 2,000 rounds",
    "4 underwing racks rated 113 kg each, 2 drop tanks"
  ],
  "protection": [
    "armored windscreen",
    "4 mm observer's back plate"
  ],
  "kits": [],
  "possible_upgrades": [],
  "notes": "A MONOPLANE, because the Board that refused the Air Ministry over the Skua had learned it could, and because a torpedo at 350 km/h cannot be met with a wire between the wings. The torpedo is five years older than the airplane and the airframe was sized to the weapon. She still spots - the fall-of-shot corrections she passes into the fire-control table are the argument the Fisher school accepted first and has never withdrawn - but the 1937 exercises were the first in which the umpires scored a capital ship sunk by aircraft. Nine hours on internal tanks makes her the longest-legged airplane in the fleet and the search plan is built around her. ⚠ DERIVED, NOT ASSERTED: speed, climb, ceiling, range and endurance all fall out of one drag polar (f, e 0.82) at eta 0.80 max / 0.62 climb and 0.29 kg/hp-h cruise, on the model calibrated against the A6M2, Bf 109E-3, Spitfire I, F4F-4, Fw 190A-3, Bf 110C, Gladiator, Swordfish, Skua, Fulmar and Albacore. Combat radius is ferry / 3 (conventions 4).",
  "fittings": [
    {
      "name": "Wireless and plotting board",
      "installed_kg": 55
    }
  ]
}
```

### Peregrine — `peregrine`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1938 | fighter | 1 | 15 | 470 |

Complete playable model:

```json
{
  "id": "peregrine",
  "name": "Peregrine",
  "nation": "GBR",
  "designation": "Peregrine",
  "type_year": 1938,
  "role": "fighter",
  "cost_gold": 15,
  "durability": 32,
  "powerplant": {
    "count": 1,
    "takeoff_hp": 1030,
    "spec": {
      "layout": "12-cylinder liquid-cooled Vee",
      "displacement_l": 27,
      "mass_kg": 610,
      "hp_takeoff": 1030,
      "hp_at_4900m": 950,
      "supercharger": "two-speed",
      "tbo_h": 420,
      "note": "United Kingdom has no aero-engine SKU. The Air Ministry owns aircraft procurement and sells the Admiralty a finished airplane; there is no line in the equipment catalog to point at."
    }
  },
  "dimensions": {
    "span_m": 11.4,
    "span_folded_m": 5.4,
    "length_m": 9.6,
    "wing_area_m2": 23,
    "hangar_footprint_m2": 52
  },
  "weights": {
    "empty_kg": 2288,
    "normal_kg": 3000,
    "max_kg": 3200,
    "derivation": {
      "comparator": "Supermarine Spitfire I",
      "comparator_kg": 2049,
      "added_kg": 239,
      "not_carried_kg": 0,
      "honest_kg": 2288,
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
      "at_4900m": 470,
      "at_2500m": 445,
      "sea_level": 415
    },
    "climb_ms": 11.8,
    "ceiling_m": 9350,
    "approach_kmh": 139
  },
  "fuel": {
    "internal_l": 620,
    "endurance_h": 5.8,
    "ferry_km": 1415,
    "combat_radius_km": 470
  },
  "armament": [
    {
      "mount": "wing, unsynchronised",
      "count": 8,
      "rounds": 2800,
      "spec": {
        "name": "Mark II 7.7 mm machine gun",
        "caliber_mm": 7.7,
        "round_belted_g": 28,
        "gun_kg": 10
      }
    }
  ],
  "stations": [],
  "equipment": [],
  "features": [
    "folding wings",
    "retracting undercarriage",
    "slotted flaps",
    "arrester hook",
    "enclosed sliding canopy",
    "8 x wing 7.7 mm machine guns, 2,800 rounds",
    "no external tanks - no rack, no crutch and no plumbing"
  ],
  "protection": [
    "armored windscreen",
    "6 mm pilot's back armor"
  ],
  "kits": [],
  "possible_upgrades": [],
  "notes": "THE FIRST BRITISH NAVAL FIGHTER THAT DOES NOT NEED AN EXCUSE, and two years late by the Admiralty's own doing. 470 km/h in 1938 beats every carrier fighter afloat - the best real one that year is an F3F biplane at 425 - and is 100 short of what the Air Ministry is putting on its own aerodromes the same spring, because a folding wing, a hook and catapult spools cost drag a land fighter does not pay. HER REAL LIMITATION IS NOT THE AIRFRAME: no fighter direction, no radar to vector from, no organization to tell her where to be, so a fleet with the best carrier fighter in the world intercepts on sight from a deck alert exactly as it did in 1918. ⚠ DERIVED, NOT ASSERTED: speed, climb, ceiling, range and endurance all fall out of one drag polar (f, e 0.82) at eta 0.80 max / 0.62 climb and 0.29 kg/hp-h cruise, on the model calibrated against the A6M2, Bf 109E-3, Spitfire I, F4F-4, Fw 190A-3, Bf 110C, Gladiator, Swordfish, Skua, Fulmar and Albacore. Combat radius is ferry / 3 (conventions 4)."
}
```

## Referenced equipment

Original equipment generations retain their original national catalog as owner. New sonar sets are conservative, provisional 1930 active-sonar fits; no radar capability is implied.

### `uk22dpc` — Depth charge

```json
{
  "delivery": "stern rails and two throwers",
  "note": "Carried by the destroyer flotillas and by nothing else in the fleet, because there is nothing else in the fleet. The Anti-Submarine Division asked for a heavier charge in 1928, in 1931 and in 1934, and got one in 1937 when the Board could no longer find a way to say no in writing.",
  "mass_kg": 190,
  "charge_kg": 130,
  "settings_m": [
    15,
    75
  ],
  "pistol": "hydrostatic",
  "year": 1922,
  "name": "Depth charge",
  "family": "dpc",
  "interface": "depth_charge_rail"
}
```

### `uk22gun` — Heavy gun mounting

```json
{
  "elevation_deg": 30,
  "training": "hydraulic",
  "charges": "bag",
  "note": "A Mark number is a serial and not a date, and it does not tell you the caliber. Triple mountings throughout. The heavy gun is NOT where this navy's money went, and the register should be read with that in mind.",
  "bore_in": 16,
  "bore_mm": 406,
  "length_cal": 45,
  "mount": "triple",
  "shell_kg": 929,
  "shell": "armor-piercing",
  "muzzle_ms": 788,
  "range_m": 34300,
  "rpm_per_gun": 2,
  "mount_t": 1510,
  "year": 1922,
  "name": "Heavy gun mounting",
  "family": "gun",
  "interface": "barbette_ring"
}
```

### `uk23min` — Mine

```json
{
  "note": "The doctrine is defensive and unimaginative: a declared area, a published warning and a field somebody else's merchant ships have to go round. NO BRITISH CAPITAL SHIP CARRIES MINE RAILS, because a ship of 61,000 tons doing 36 knots is not going to be asked to lay a minefield and there is nowhere on her to put them.",
  "mass_kg": 750,
  "type": "moored contact",
  "charge_kg": 140,
  "mooring_m": 550,
  "year": 1923,
  "name": "Mine",
  "family": "min",
  "interface": "mine_rail"
}
```

### `uk24sec` — Secondary and cruiser mounting

```json
{
  "ammunition": "fixed",
  "commonality": "common shellrooms and hoists within caliber",
  "bore_in": 4.7,
  "bore_mm": 120,
  "length_cal": 45,
  "mounting": "single, open, hand-worked",
  "shell_kg": 22.7,
  "muzzle_ms": 807,
  "range_m": 15500,
  "elevation_deg": 40,
  "rpm_per_gun": 10,
  "mass_t": 15,
  "year": 1924,
  "name": "Secondary and cruiser mounting",
  "family": "sec",
  "interface": "secondary_base_ring"
}
```

### `uk25lau` — Torpedo mounting

```json
{
  "mounting": "deck, centerline",
  "train": "powered, 360 deg",
  "firing": "on gyro angle from the ship's torpedo director",
  "reloads": 0,
  "note": "NO BRITISH CAPITAL SHIP CARRIES A TORPEDO, WITH ONE EXCEPTION AT THE HEAD OF THE LINE: the G3s were drawn in 1921 with two submerged 24.5-inch tubes and were built with them, and the Fisher school struck the tubes from every design after theirs on the grounds that a ship which is never going to be within 10,000 m of anything does not need them. The two Invincibles are the only British capital ships that carry a torpedo, and nothing laid down since 1927 does. The mounting carries the flotilla's whole attack in one throw and there is no reload stowage in any British destroyer.",
  "tubes": 4,
  "bore_in": 21,
  "bore_mm": 533,
  "mass_t": 26,
  "year": 1925,
  "name": "Torpedo mounting",
  "family": "lau",
  "interface": "torpedo_mount_seat"
}
```

### `uk25tor` — Torpedo

```json
{
  "diameter_mm": 533,
  "length_m": 7.3,
  "mass_kg": 1570,
  "warhead_kg": 340,
  "drive": "wet-heater",
  "pistol": "contact",
  "settings": "made at the tube",
  "note": "THERE HAS NEVER BEEN A BRITISH OXYGEN PROGRAM. The Torpedo Establishment costed one in 1926 and the Board spent the money on the Haslar boiler house instead. The corollary nobody has written down is that the fastest fish in the world belongs to somebody else, and the arithmetic of a stern shot is not a British calculation.",
  "fast_kt": 40,
  "fast_m": 6400,
  "slow_kt": 30,
  "slow_m": 11000,
  "year": 1925,
  "name": "Torpedo",
  "family": "tor",
  "interface": "torpedo_tube_or_recess"
}
```

### `uk26snr` — Asdic

```json
{
  "dome": "retracting",
  "school": "Portland",
  "note": "THE BEST EQUIPMENT OF ITS KIND IN THE WORLD BY A DISTANCE THIS FLEET HAS NEVER HAD ANY USE FOR. Fitted to the destroyer flotillas and to nothing else, because there is nothing else. The Portland school produces operators the fleet cannot billet and tables the fleet does not exercise, and the Anti-Submarine Division's annual report has said so in the same three paragraphs since 1929.",
  "active_khz": 14,
  "reliable_m": 1800,
  "good_conditions_m": 3200,
  "bearing_deg": 3,
  "year": 1926,
  "name": "Asdic",
  "family": "snr",
  "interface": "sonar_dome"
}
```

### `uk27can` — Multiple pom-pom

```json
{
  "cooling": "water-jacketed",
  "feed": "belt",
  "train": "hydraulic",
  "elevation_deg": 80,
  "note": "A staff requirement that asked for a curtain rather than a hit. Against a 1935 airplane it is adequate; nobody in the fleet has asked what it is against a 1943 one.",
  "bore_mm": 40,
  "barrels": 8,
  "shell_kg": 0.82,
  "muzzle_ms": 732,
  "effective_m": 3500,
  "rpm_per_barrel": 96,
  "belt": 140,
  "mass_t": 16,
  "year": 1927,
  "name": "Multiple pom-pom",
  "family": "can",
  "interface": "cannon_position"
}
```

### `uk27dir` — Director and rangekeeper

```json
{
  "computer": "Admiralty Fire Control Table in a protected space",
  "spotting": "aircraft spot correction into the table",
  "note": "Engagement on the fleet's own terms means firing at the range the fleet chooses, and the range the fleet chooses is beyond the horizon of anything shorter than the mast.",
  "tower_rangefinder_m": 9.1,
  "turret_rangefinder_m": 4.6,
  "head_t": 11,
  "year": 1927,
  "name": "Director and rangekeeper",
  "family": "dir",
  "interface": "director_tower"
}
```

### `uk27gun` — Heavy gun mounting

```json
{
  "elevation_deg": 30,
  "training": "hydraulic",
  "charges": "bag",
  "note": "A Mark number is a serial and not a date, and it does not tell you the caliber. Triple mountings throughout. The heavy gun is NOT where this navy's money went, and the register should be read with that in mind.",
  "bore_in": 16,
  "bore_mm": 406,
  "length_cal": 50,
  "mount": "triple",
  "shell_kg": 1020,
  "shell": "armor-piercing",
  "muzzle_ms": 815,
  "range_m": 37800,
  "rpm_per_gun": 2,
  "mount_t": 1620,
  "year": 1927,
  "name": "Heavy gun mounting",
  "family": "gun",
  "interface": "barbette_ring"
}
```

### `uk29sec` — Secondary and cruiser mounting

```json
{
  "ammunition": "fixed",
  "commonality": "common shellrooms and hoists within caliber",
  "bore_in": 6,
  "bore_mm": 152,
  "length_cal": 50,
  "mounting": "triple, power-worked",
  "shell_kg": 50.8,
  "muzzle_ms": 841,
  "range_m": 23300,
  "elevation_deg": 45,
  "rpm_per_gun": 8,
  "mass_t": 150,
  "note": "The only mounting in the fleet designed around a hull rather than the reverse.",
  "year": 1929,
  "name": "Secondary and cruiser mounting",
  "family": "sec",
  "interface": "secondary_base_ring"
}
```

### `uk31gun` — Heavy gun mounting

```json
{
  "elevation_deg": 30,
  "training": "hydraulic",
  "charges": "bag",
  "note": "The 1917 bore relined and lengthened to 45 calibers and put in a triple mounting for the first time. Britain is the only navy that already owned 18-inch jigs, which is the entire reason the ladder could go up a caliber without a development program.",
  "bore_in": 18,
  "bore_mm": 457,
  "length_cal": 45,
  "mount": "triple",
  "shell_kg": 1510,
  "shell": "armor-piercing",
  "muzzle_ms": 780,
  "range_m": 36600,
  "rpm_per_gun": 1.75,
  "mount_t": 2100,
  "sourcing": "ONE WORKS, ONE SET OF JIGS, NO SECOND SOURCE",
  "year": 1931,
  "name": "Heavy gun mounting",
  "family": "gun",
  "interface": "barbette_ring"
}
```

### `uk32dir` — Director and rangekeeper

```json
{
  "computer": "Admiralty Fire Control Table in a protected space",
  "spotting": "aircraft spot correction into the table",
  "note": "Full solution through the ship's own maneuver, which a ship that fights at 36 knots on her own terms does continuously by definition. THE LAST GENERATION FITTED TO ANY SHIP NOT BUILT AFTER 1932.",
  "tower_rangefinder_m": 12.5,
  "turret_rangefinder_m": 4.6,
  "head_t": 14,
  "stable_element": "vertical",
  "year": 1932,
  "name": "Director and rangekeeper",
  "family": "dir",
  "interface": "director_tower"
}
```

### `uk32sec` — Secondary and cruiser mounting

```json
{
  "ammunition": "fixed",
  "commonality": "common shellrooms and hoists within caliber",
  "bore_in": 4.5,
  "bore_mm": 114,
  "length_cal": 45,
  "mounting": "twin, enclosed base ring, dual-purpose",
  "shell_kg": 25,
  "muzzle_ms": 746,
  "range_m": 18900,
  "elevation_deg": 80,
  "rpm_per_gun": 12,
  "mass_t": 43,
  "note": "The only mounting in the fleet designed around a hull rather than the reverse.",
  "ceiling_m": 12500,
  "year": 1932,
  "name": "Secondary and cruiser mounting",
  "family": "sec",
  "interface": "secondary_base_ring"
}
```

## Literal weapons and machinery

Classes using literal fits carry their complete weapon, protection and machinery input here. They are not unresolvable equipment SKUs.

### Queen Elizabeth class — `queen_elizabeth`

```json
{
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
  "propulsion": {
    "speed_kn": 24,
    "shp": 75000,
    "range_nm": 5000,
    "range_at_kn": 12,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 330,
    "deck_mm": 76,
    "turret_mm": 330,
    "ct_mm": 280,
    "torpedo_defense": 1
  }
}
```

### Revenge class — `revenge`

```json
{
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
  "propulsion": {
    "speed_kn": 23,
    "shp": 40000,
    "range_nm": 5000,
    "range_at_kn": 12,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 330,
    "deck_mm": 51,
    "turret_mm": 330,
    "ct_mm": 280,
    "torpedo_defense": 1
  }
}
```

### Iron Duke class — `iron_duke`

```json
{
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
  "propulsion": {
    "speed_kn": 21.25,
    "shp": 29000,
    "range_nm": 7800,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 305,
    "deck_mm": 64,
    "turret_mm": 279,
    "ct_mm": 279,
    "torpedo_defense": 1
  }
}
```

### King George V class (1911) — `king_george_v_1911`

```json
{
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
  "propulsion": {
    "speed_kn": 21,
    "shp": 31000,
    "range_nm": 6730,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 305,
    "deck_mm": 51,
    "turret_mm": 279,
    "ct_mm": 279,
    "torpedo_defense": 0
  }
}
```

### Orion class — `orion`

```json
{
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
  "propulsion": {
    "speed_kn": 21,
    "shp": 27000,
    "range_nm": 6730,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 305,
    "deck_mm": 45,
    "turret_mm": 279,
    "ct_mm": 279,
    "torpedo_defense": 0
  }
}
```

### Tiger — `tiger`

```json
{
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
  "propulsion": {
    "speed_kn": 29,
    "shp": 108000,
    "range_nm": 4650,
    "range_at_kn": 12,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 229,
    "deck_mm": 76,
    "turret_mm": 229,
    "ct_mm": 254,
    "torpedo_defense": 1
  }
}
```

### Renown class — `renown`

```json
{
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
  "propulsion": {
    "speed_kn": 31.5,
    "shp": 112000,
    "range_nm": 4700,
    "range_at_kn": 12,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 152,
    "deck_mm": 51,
    "turret_mm": 279,
    "ct_mm": 254,
    "torpedo_defense": 1
  }
}
```

### Admiral class — `admiral`

```json
{
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
  "propulsion": {
    "speed_kn": 31,
    "shp": 144000,
    "range_nm": 7500,
    "range_at_kn": 14,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 305,
    "deck_mm": 51,
    "turret_mm": 381,
    "ct_mm": 280,
    "torpedo_defense": 2
  }
}
```

### Nelson class — `nelson`

```json
{
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
  "propulsion": {
    "speed_kn": 23,
    "shp": 45000,
    "range_nm": 7000,
    "range_at_kn": 16,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 356,
    "deck_mm": 159,
    "turret_mm": 406,
    "ct_mm": 356,
    "torpedo_defense": 3
  }
}
```

### G3 battlecruiser (canceled) — `g3`

```json
{
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
  "propulsion": {
    "speed_kn": 32,
    "shp": 160000,
    "range_nm": 7000,
    "range_at_kn": 16,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 356,
    "deck_mm": 203,
    "turret_mm": 432,
    "ct_mm": 356,
    "torpedo_defense": 3
  }
}
```

### Argus — `argus`

```json
{
  "propulsion": {
    "speed_kn": 20,
    "shp": 20000,
    "range_nm": 3600,
    "range_at_kn": 10,
    "fuel": "oil"
  }
}
```

### Eagle — `eagle`

```json
{
  "armament": {
    "secondary_battery": [
      {
        "count": 9,
        "caliber_in": 6,
        "mounts": "single"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 24,
    "shp": 50000,
    "range_nm": 4800,
    "range_at_kn": 16,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 114
  }
}
```

### Hermes — `hermes`

```json
{
  "armament": {
    "secondary_battery": [
      {
        "count": 6,
        "caliber_in": 5.5,
        "mounts": "single"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 25,
    "shp": 40000,
    "range_nm": 4480,
    "range_at_kn": 10,
    "fuel": "oil"
  }
}
```

### Furious (as reconstructed) — `furious`

```json
{
  "propulsion": {
    "speed_kn": 30,
    "shp": 90000,
    "range_nm": 4300,
    "range_at_kn": 16,
    "fuel": "oil"
  }
}
```

### Courageous class (large light cruiser) — `courageous_llc`

```json
{
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
  "propulsion": {
    "speed_kn": 32,
    "shp": 90000,
    "range_nm": 6000,
    "range_at_kn": 16,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 76,
    "deck_mm": 45,
    "turret_mm": 229,
    "torpedo_defense": 1
  }
}
```

### Hawkins class — `hawkins`

```json
{
  "armament": {
    "main_battery": {
      "count": 7,
      "caliber_in": 7.5,
      "mounts": "single"
    }
  },
  "propulsion": {
    "speed_kn": 30,
    "shp": 60000,
    "range_nm": 5400,
    "range_at_kn": 14,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 76,
    "deck_mm": 38
  }
}
```

### C class (Caledon/Ceres/Carlisle groups) — `c_class_cl`

```json
{
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
  "propulsion": {
    "speed_kn": 29,
    "shp": 40000,
    "range_nm": 5900,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 76,
    "deck_mm": 25
  }
}
```

### Danae (D) class — `danae`

```json
{
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
  "propulsion": {
    "speed_kn": 29,
    "shp": 40000,
    "range_nm": 6700,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 76,
    "deck_mm": 25
  }
}
```

### Emerald (E) class — `emerald`

```json
{
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
  "propulsion": {
    "speed_kn": 33,
    "shp": 80000,
    "range_nm": 8000,
    "range_at_kn": 15,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 76,
    "deck_mm": 25
  }
}
```

### V & W class — `v_w`

```json
{
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
  "propulsion": {
    "speed_kn": 34,
    "shp": 27000,
    "range_nm": 3500,
    "range_at_kn": 15,
    "fuel": "oil"
  }
}
```

### S class — `s_class_dd_rn`

```json
{
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
  "propulsion": {
    "speed_kn": 36,
    "shp": 27000,
    "range_nm": 2750,
    "range_at_kn": 15,
    "fuel": "oil"
  }
}
```

### Scott / Shakespeare flotilla leaders — `scott_shakespeare`

```json
{
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
  "propulsion": {
    "speed_kn": 36,
    "shp": 40000,
    "range_nm": 5000,
    "range_at_kn": 15,
    "fuel": "oil"
  }
}
```

### L class — `l_class_ss_rn`

```json
{
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
  "propulsion": {
    "speed_kn": 17,
    "range_nm": 3800,
    "range_at_kn": 10,
    "fuel": "diesel"
  }
}
```

### M class (submarine monitor) — `m_class_ss_rn`

```json
{
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
  "propulsion": {
    "speed_kn": 15,
    "range_nm": 3840,
    "range_at_kn": 10,
    "fuel": "diesel"
  }
}
```

### K class (steam submarine) — `k_class_ss_rn`

```json
{
  "armament": {
    "torpedo_tubes": {
      "count": 8,
      "caliber_in": 18,
      "submerged": true
    }
  },
  "propulsion": {
    "speed_kn": 24,
    "shp": 10500,
    "range_nm": 3000,
    "range_at_kn": 13,
    "fuel": "oil"
  }
}
```

### Fast fleet oiler — `rn_fleet_oiler`

```json
{}
```

### United Kingdom standard freighter 1922 — `uk_merchant_1922`

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

### United Kingdom standard freighter 1936 — `uk_merchant_1936`

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

### United Kingdom standard freighter 1948 — `uk_merchant_1948`

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

### Fleet depot · 1922 — `uk_depot_1922`

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

### Fleet oiler · 1922 — `uk_oiler_1922`

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

### Fleet depot · 1936 — `uk_depot_1936`

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

### Fleet oiler · 1936 — `uk_oiler_1936`

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

### Fleet depot · 1950 — `uk_depot_1950`

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

### Fleet oiler · 1950 — `uk_oiler_1950`

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
