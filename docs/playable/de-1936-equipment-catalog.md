# Germany — In Good Faith — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1936-01-01.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.0. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/de.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1936-01-01. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is Wilhelmshaven.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| Kiel | 60 | 36 Seeschwalbe (scout) | 36 | 720 |
| Wilhelmshaven | 60 | 36 Seeschwalbe (scout) | 36 | 720 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

### Seeschwalbe — `seeschwalbe`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | scout | 2 | 16 | 505 |

Complete playable model:

```json
{
  "id": "seeschwalbe",
  "name": "Seeschwalbe",
  "nation": "DEU",
  "designation": "C/31",
  "type_year": 1933,
  "role": "scout",
  "cost_gold": 16,
  "durability": 30,
  "powerplant": {
    "component": "de33aeg",
    "count": 1,
    "takeoff_hp": 850,
    "refit_groups": [
      "de40aeg"
    ]
  },
  "dimensions": {
    "span_m": 12.8,
    "span_folded_m": 7,
    "length_m": 11.4,
    "wing_area_m2": 30,
    "hangar_footprint_m2": 72
  },
  "weights": {
    "empty_kg": 3035,
    "normal_kg": 3955,
    "max_kg": 4455,
    "derivation": {
      "comparator": "Arado Ar 196A-3",
      "comparator_kg": 2990,
      "added_kg": 135,
      "not_carried_kg": 90,
      "honest_kg": 3035,
      "credit": 0,
      "dropped_kg": 0
    }
  },
  "crew": {
    "seats": 2,
    "normal": 2,
    "notes": "Pilot, and an observer who works the wireless."
  },
  "performance": {
    "speed_kmh": {
      "at_2000m": 260,
      "sea_level": 263
    },
    "climb_ms": 6.6,
    "ceiling_m": 4570,
    "approach_kmh": 136
  },
  "fuel": {
    "internal_l": 750,
    "endurance_h": 6.2,
    "ferry_km": 1515,
    "combat_radius_km": 505
  },
  "armament": [
    {
      "mount": "fixed forward",
      "count": 1,
      "rounds": 750,
      "spec": {
        "name": "C/30 7.92 mm machine gun",
        "caliber_mm": 7.92,
        "round_belted_g": 27,
        "gun_kg": 8
      }
    },
    {
      "mount": "flexible aft",
      "count": 1,
      "rounds": 750,
      "spec": {
        "name": "C/30 7.92 mm machine gun",
        "caliber_mm": 7.92,
        "round_belted_g": 27,
        "gun_kg": 8
      }
    }
  ],
  "stations": [
    {
      "id": "underwing",
      "form": "underwing_rack",
      "rating_kg": 150,
      "racks": 2,
      "alternatives": [
        {
          "count": 2,
          "spec": {
            "name": "SC 50 bomb",
            "mass_kg": 50
          }
        },
        {
          "component": "de29dpc",
          "count": 2
        }
      ]
    }
  ],
  "equipment": [],
  "features": [
    "long-range wireless",
    "direction-finding loop",
    "homing-beacon receiver",
    "slats and slotted flaps",
    "sliding canopy",
    "fixed seats",
    "1 x fixed forward 7.92 mm + 1 x flexible aft 7.92 mm machine gun, 1,500 rounds",
    "needs no aerodrome: catapult, fjord, estuary or lee shore"
  ],
  "protection": [],
  "kits": [],
  "possible_upgrades": [
    "de36rad",
    "de40det"
  ],
  "notes": "At as_of this is the navy's ONLY search type: 613 km reach, NO RADAR, and one raider in commission to fly it from. The reconnaissance gap is real at the start date and is not closed until 1940. Frame section 6.3 rounds the reach to 615 km; the catalog's own figure is ferry 1,840 / 3 = 613, and the catalog owns specifications.",
  "fittings": [
    {
      "name": "Wireless, direction-finding loop and homing-beacon receiver",
      "installed_kg": 75
    }
  ]
}
```

### Albatros — `albatros`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1940 | patrol | 4 | 30 | 905 |

Complete playable model:

```json
{
  "id": "albatros",
  "name": "Albatros",
  "nation": "DEU",
  "designation": "C/38",
  "type_year": 1940,
  "role": "patrol",
  "cost_gold": 30,
  "durability": 45,
  "powerplant": {
    "component": "de40aeg",
    "count": 2,
    "takeoff_hp": 1100
  },
  "dimensions": {
    "span_m": 19.6,
    "span_folded_m": 8.4,
    "length_m": 15.2,
    "wing_area_m2": 52,
    "hangar_footprint_m2": 95
  },
  "weights": {
    "empty_kg": 6080,
    "normal_kg": 8545,
    "max_kg": 9945,
    "derivation": {
      "comparator": "Lockheed Hudson Mk I",
      "comparator_kg": 5275,
      "added_kg": 1175,
      "not_carried_kg": 370,
      "honest_kg": 6080,
      "credit": 0,
      "dropped_kg": 0
    }
  },
  "crew": {
    "seats": 4,
    "normal": 4,
    "notes": "Pilot, observer, wireless operator, radar operator."
  },
  "performance": {
    "speed_kmh": {
      "at_2400m": 301,
      "sea_level": 281
    },
    "climb_ms": 5.8,
    "ceiling_m": 4400,
    "approach_kmh": 152
  },
  "fuel": {
    "internal_l": 2600,
    "endurance_h": 10.5,
    "ferry_km": 2720,
    "combat_radius_km": 905,
    "with_tank": {
      "form": "2 x C/38 drop tanks, outboard racks",
      "liters": 3600,
      "endurance_h": 14.7,
      "ferry_km": 3795,
      "combat_radius_km": 1265
    }
  },
  "armament": [
    {
      "mount": "flexible dorsal",
      "count": 1,
      "rounds": 1000,
      "spec": {
        "name": "C/38 13 mm machine gun",
        "caliber_mm": 13,
        "round_belted_g": 80,
        "gun_kg": 20
      }
    },
    {
      "mount": "flexible aft",
      "count": 1,
      "rounds": 1000,
      "spec": {
        "name": "C/30 7.92 mm machine gun",
        "caliber_mm": 7.92,
        "round_belted_g": 27,
        "gun_kg": 8
      }
    }
  ],
  "stations": [
    {
      "id": "underwing",
      "form": "underwing_rack",
      "rating_kg": 400,
      "racks": 4,
      "alternatives": [
        {
          "count": 4,
          "spec": {
            "name": "SC 50 bomb",
            "mass_kg": 50
          }
        },
        {
          "component": "de29dpc",
          "count": 4
        }
      ]
    }
  ],
  "equipment": [
    "de36rad"
  ],
  "features": [
    "long-range wireless",
    "direction-finding loop",
    "homing-beacon receiver",
    "slats and slotted flaps",
    "enclosed cabin",
    "fixed seats",
    "1 x flexible dorsal 13 mm + 1 x flexible aft 7.92 mm machine gun, 2,000 rounds",
    "needs no aerodrome"
  ],
  "protection": [
    "self-sealing tanks"
  ],
  "kits": [],
  "possible_upgrades": [
    "de43rad",
    "de40det"
  ],
  "notes": "A single aircraft searches more ocean in a day than the whole boat fleet does in a week. NOT IN EXISTENCE at as_of — a 1940 design, and the thing that closes the reconnaissance gap.",
  "fittings": [
    {
      "name": "Wireless, direction-finding loop and homing-beacon receiver",
      "installed_kg": 75
    }
  ]
}
```

## Referenced equipment

Original equipment generations retain their original national catalog as owner. New sonar sets are conservative, provisional 1930 active-sonar fits; no radar capability is implied.

### `de26eng` — Marine diesel

```json
{
  "layout": "double-acting two-stroke, direct-reversing",
  "groups": "8 and 9 cylinder",
  "footprint": "one bedplate per group",
  "tbo_basis": "continuous rating",
  "note": "The one industrial line in this navy that leads the world rather than following it. The 1926 unit went to sea in a Finnish-built boat before it went to sea in a German one, which is the whole history of this navy in a sentence. Specific consumption is the figure the staff quote rather than output: on a hull whose bunker is also its cargo, fuel burned is fuel not given away.",
  "bhp_per_group": [
    700,
    8000
  ],
  "sfc_g_shp_h": 195,
  "tbo_h": 4000,
  "year": 1926,
  "name": "Marine diesel",
  "family": "eng",
  "interface": "engine_bay"
}
```

### `de27min` — Mine

```json
{
  "rails": "removable, shipped or landed in a forenoon",
  "note": "Opportunistic rather than programmatic: a raider that has been chased off a shipping route can leave something behind on it, and a hundred and twenty mines in a focal area is a cheaper way of closing it for a fortnight than staying there would be.",
  "mass_kg": 730,
  "type": "moored contact",
  "mooring_m": 500,
  "year": 1927,
  "name": "Mine",
  "family": "min",
  "interface": "mine_rail"
}
```

### `de27snr` — Hydrophone array

```json
{
  "array": "bow group, 24 receivers",
  "compensation": "own-ship noise",
  "note": "Passive, and the only sensor line in this navy that was ahead of everybody else's from the beginning rather than behind. The training establishment predates the first set by three years and was the more expensive of the two. It hears a convoy long before anything sees one, which is what a fleet with almost no airplanes over the middle of the ocean needs it to do.",
  "mode": "passive",
  "merchant_m": 6000,
  "merchant_note": "good water",
  "convoy_m": 15000,
  "bearing_deg": 4,
  "year": 1927,
  "name": "Hydrophone array",
  "family": "snr",
  "interface": "hydrophone_well"
}
```

### `de28tor` — Torpedo

```json
{
  "diameter_mm": 533,
  "length_m": 7.16,
  "mass_kg": 1530,
  "warhead_kg": 280,
  "settings": "made at the tube",
  "note": "The one round the whole navy fires: a raider's fixed tubes, an ocean boat's six, an Elektroboot's outfit and the sixty in a tender's after hold are the same weapon from the same crate. One weapon, one magazine, one drill book and one stockpile — the only economy this navy has been able to afford, and the reason a boat can be stored from a merchant hull in an anchorage.",
  "drive": "wet-heater",
  "fast_kt": 40,
  "fast_m": 7500,
  "slow_kt": 30,
  "slow_m": 12500,
  "pistol": "contact",
  "year": 1928,
  "name": "Torpedo",
  "family": "tor",
  "interface": "torpedo_tube_or_recess"
}
```

### `de29dpc` — Depth charge

```json
{
  "note": "Carried by the raiders and by both search aircraft, and by nothing else, because nothing else in this navy hunts submarines. Its effect depends entirely on how well the dropper knows where the target is, which on both platforms is not very well.",
  "mass_kg": 139,
  "burster_kg": 60,
  "fuze": "hydrostatic",
  "setting_m": [
    30,
    75
  ],
  "year": 1929,
  "name": "Depth charge",
  "family": "dpc",
  "interface": "depth_charge_rail"
}
```

### `de29gun` — 8.8 cm boat mount

```json
{
  "note": "Sealed rather than dried out, so it can be manned within a minute of surfacing and left flooded for the rest of the patrol. The first thing the crews stop using once air cover reaches the convoy lanes — which is a statement about the enemy's program rather than about the gun.",
  "caliber_mm": 88,
  "length_cal": 45,
  "mounting": "single wet",
  "shell_kg": 9,
  "muzzle_ms": 700,
  "range_m": 11900,
  "rpm": 15,
  "mass_t": 4.2,
  "year": 1929,
  "name": "8.8 cm boat mount",
  "family": "gun",
  "interface": "boat_gun_mount"
}
```

### `de30gun` — 28 cm mount

```json
{
  "caliber_mm": 283,
  "mount": "triple ring, one barbette diameter",
  "elevation_deg": 40,
  "ramming": "power at any angle",
  "note": "It outranges every cruiser afloat and will not trouble a battleship, which is the whole of its doctrinal fit. A battery that could tempt a captain into a second opinion would be a defect.",
  "length_cal": 52,
  "shell_kg": 300,
  "muzzle_ms": 910,
  "range_m": 36500,
  "rpm_per_barrel": 2.5,
  "mount_t": 810,
  "year": 1930,
  "name": "28 cm mount",
  "family": "gun",
  "interface": "barbette_ring"
}
```

### `de31dir` — Director

```json
{
  "rangefinder_m": 6,
  "rangefinder": "stereoscopic on a common trunnion",
  "computer": "mechanical, in the head",
  "note": "Drawn for the raider and fitted nowhere else, because nothing else in the navy has a battery worth directing. The whole installation lifts out as one article and a second trunnion aft takes it if the forward tower is lost. Surface and air on the same gears, which is less an achievement than an admission: a raider is not expected to have two fire-control problems at once.",
  "solutions": "surface and air",
  "head_t": 14,
  "year": 1931,
  "name": "Director",
  "family": "dir",
  "interface": "director_trunnion"
}
```

### `de31sec` — 10.5 cm mount

```json
{
  "caliber_mm": 105,
  "mount": "twin, one foundation ring",
  "elevation_deg": 80,
  "note": "A ship which cannot afford two secondary batteries must not be given a choice between them. The only gun on a raider that expects to be fired in anger, and the only one aboard that the doctrine admits may have to save the ship.",
  "length_cal": 65,
  "shell_kg": 15.1,
  "muzzle_ms": 900,
  "range_m": 17700,
  "ceiling_m": 12500,
  "rpm_per_gun": 15,
  "mount_t": 27,
  "year": 1931,
  "name": "10.5 cm mount",
  "family": "sec",
  "interface": "secondary_base_ring"
}
```

### `de33rad` — Ship radar

```json
{
  "array": "masthead or retractable-mast",
  "operation": "emission-controlled, keyed in bursts",
  "note": "The earliest line in the catalog and the one nobody expected. The fleet's surface officers regarded it as a liability on the grounds that anything which transmits is a beacon for something that does not; the submarine staff took the opposite view and took the sets.",
  "wavelength_cm": 80,
  "surface_km": 25,
  "air_km": 40,
  "gunnery_ranging_m": 70,
  "year": 1933,
  "name": "Ship radar",
  "family": "rad",
  "interface": "radar_search_position"
}
```

### `de33snr` — Hydrophone array

```json
{
  "array": "bow group, 24 receivers",
  "compensation": "own-ship noise",
  "note": "Passive, and the only sensor line in this navy that was ahead of everybody else's from the beginning rather than behind. The training establishment predates the first set by three years and was the more expensive of the two. It hears a convoy long before anything sees one, which is what a fleet with almost no airplanes over the middle of the ocean needs it to do.",
  "mode": "passive",
  "merchant_m": 12000,
  "merchant_note": "good water",
  "convoy_m": 30000,
  "bearing_deg": 2,
  "year": 1933,
  "name": "Hydrophone array",
  "family": "snr",
  "interface": "hydrophone_well"
}
```

### `de34can` — Automatic cannon

```json
{
  "mountings": "twin, single and quadruple on one foundation ring",
  "training": "hand",
  "elevation_deg": 85,
  "note": "The 1937 gunnery trials found the thirty-seven could not engage anything flying faster than the airplane it had been specified against. The replacement is NOT a development of it, and it replaces nothing — it is simply added wherever there is a ring, because a raider that is found by aircraft is a raider that has run out of arguments.",
  "caliber_mm": 37,
  "shell_kg": 0.74,
  "muzzle_ms": 1000,
  "range_m": 6800,
  "rpm_per_barrel": 120,
  "clip": 8,
  "twin_kg": 1350,
  "year": 1934,
  "name": "Automatic cannon",
  "family": "can",
  "interface": "cannon_position"
}
```

### `de36eng` — Marine diesel

```json
{
  "layout": "double-acting two-stroke, direct-reversing",
  "groups": "8 and 9 cylinder",
  "footprint": "one bedplate per group",
  "tbo_basis": "continuous rating",
  "note": "The one industrial line in this navy that leads the world rather than following it. The 1926 unit went to sea in a Finnish-built boat before it went to sea in a German one, which is the whole history of this navy in a sentence. Specific consumption is the figure the staff quote rather than output: on a hull whose bunker is also its cargo, fuel burned is fuel not given away.",
  "bhp_per_group": 9600,
  "sfc_g_shp_h": 182,
  "tbo_h": 5200,
  "supercharged": true,
  "year": 1936,
  "name": "Marine diesel",
  "family": "eng",
  "interface": "engine_bay"
}
```

### `de38tor` — Torpedo

```json
{
  "diameter_mm": 533,
  "length_m": 7.16,
  "mass_kg": 1530,
  "warhead_kg": 280,
  "settings": "made at the tube",
  "note": "The one round the whole navy fires: a raider's fixed tubes, an ocean boat's six, an Elektroboot's outfit and the sixty in a tender's after hold are the same weapon from the same crate. One weapon, one magazine, one drill book and one stockpile — the only economy this navy has been able to afford, and the reason a boat can be stored from a merchant hull in an anchorage.",
  "drive": "wet-heater",
  "fast_kt": 30,
  "fast_m": 7500,
  "slow_kt": 24,
  "slow_m": 11500,
  "pistol": "influence and contact, both effective",
  "body": "G7e wakeless electric",
  "gyro": "pattern",
  "year": 1938,
  "name": "Torpedo",
  "family": "tor",
  "interface": "torpedo_tube_or_recess"
}
```

### `de40can` — Automatic cannon

```json
{
  "mountings": "twin, single and quadruple on one foundation ring",
  "training": "hand",
  "elevation_deg": 85,
  "note": "The 1937 gunnery trials found the thirty-seven could not engage anything flying faster than the airplane it had been specified against. The replacement is NOT a development of it, and it replaces nothing — it is simply added wherever there is a ring, because a raider that is found by aircraft is a raider that has run out of arguments.",
  "caliber_mm": 20,
  "shell_kg": 0.12,
  "muzzle_ms": 900,
  "range_m": 4400,
  "rpm_per_barrel": 480,
  "clip": 8,
  "twin_kg": 1350,
  "magazine": 20,
  "quad_kg": 1500,
  "year": 1940,
  "name": "Automatic cannon",
  "family": "can",
  "interface": "cannon_position"
}
```

### `de40det` — Warning receiver

```json
{
  "aerial": "masthead, struck for diving",
  "emission": "none",
  "note": "Development began the year the laboratory's own sets went to sea, on the reasoning that anybody clever enough to build one would be clever enough to build another — which is a rare thing for a service to fund against itself. It listens for the set that is looking, and says nothing. Warning at half again the emitting set's own detection range is the margin between a boat that dives and a boat that is attacked.",
  "band_m": [
    1.3,
    2.8
  ],
  "warning_ratio": 1.5,
  "year": 1940,
  "name": "Warning receiver",
  "family": "det",
  "interface": "radar_search_position"
}
```

### `de40rad` — Ship radar

```json
{
  "array": "masthead or retractable-mast",
  "operation": "emission-controlled, keyed in bursts",
  "note": "The earliest line in the catalog and the one nobody expected. The fleet's surface officers regarded it as a liability on the grounds that anything which transmits is a beacon for something that does not; the submarine staff took the opposite view and took the sets.",
  "wavelength_cm": 60,
  "surface_km": 28,
  "air_km": 80,
  "gunnery_ranging_m": 70,
  "ranging_m": 30,
  "display": "plan position indicator",
  "year": 1940,
  "name": "Ship radar",
  "family": "rad",
  "interface": "radar_search_position"
}
```

### `de40snr` — Hydrophone array

```json
{
  "array": "bow group, 24 receivers",
  "compensation": "own-ship noise",
  "note": "Passive, and the only sensor line in this navy that was ahead of everybody else's from the beginning rather than behind. The training establishment predates the first set by three years and was the more expensive of the two. It hears a convoy long before anything sees one, which is what a fleet with almost no airplanes over the middle of the ocean needs it to do.",
  "mode": "passive",
  "merchant_m": 12000,
  "merchant_note": "good water",
  "convoy_m": 30000,
  "bearing_deg": 1.5,
  "passive_ranging": "to firing accuracy",
  "scanning_transmitter_m": 5000,
  "year": 1940,
  "name": "Hydrophone array",
  "family": "snr",
  "interface": "hydrophone_well"
}
```

### `de43eng` — Marine diesel

```json
{
  "layout": "double-acting two-stroke, direct-reversing",
  "groups": "8 and 9 cylinder",
  "footprint": "one bedplate per group",
  "tbo_basis": "continuous rating",
  "note": "The one industrial line in this navy that leads the world rather than following it. The 1926 unit went to sea in a Finnish-built boat before it went to sea in a German one, which is the whole history of this navy in a sentence. Specific consumption is the figure the staff quote rather than output: on a hull whose bunker is also its cargo, fuel burned is fuel not given away.",
  "bhp_per_group": 11200,
  "sfc_g_shp_h": 174,
  "tbo_h": 6000,
  "supercharged": true,
  "year": 1943,
  "name": "Marine diesel",
  "family": "eng",
  "interface": "engine_bay"
}
```

## Literal weapons and machinery

Classes using literal fits carry their complete weapon, protection and machinery input here. They are not unresolvable equipment SKUs.

### Deutschland class — `deutschland_bb`

```json
{
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
  "propulsion": {
    "speed_kn": 18,
    "shp": 17000,
    "range_nm": 4800,
    "range_at_kn": 10,
    "fuel": "coal"
  },
  "protection": {
    "belt_mm": 240,
    "deck_mm": 40,
    "turret_mm": 280,
    "torpedo_defense": 0
  }
}
```

### Braunschweig class — `braunschweig_bb`

```json
{
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
  "propulsion": {
    "speed_kn": 18,
    "shp": 16000,
    "range_nm": 4800,
    "range_at_kn": 10,
    "fuel": "coal"
  },
  "protection": {
    "belt_mm": 225,
    "deck_mm": 40,
    "turret_mm": 250,
    "torpedo_defense": 0
  }
}
```

### Mackensen class (broken up incomplete) — `mackensen_bc`

```json
{
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
  "propulsion": {
    "speed_kn": 28,
    "shp": 90000,
    "range_nm": 8000,
    "range_at_kn": 14,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 300,
    "deck_mm": 80,
    "turret_mm": 320,
    "torpedo_defense": 1
  }
}
```

### Emden — `emden_cl`

```json
{
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
  "propulsion": {
    "speed_kn": 29,
    "shp": 46500,
    "range_nm": 6700,
    "range_at_kn": 14,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 50,
    "deck_mm": 20,
    "turret_mm": 20,
    "torpedo_defense": 0
  }
}
```

### Bremen class — `bremen_cl`

```json
{
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
  "propulsion": {
    "speed_kn": 22,
    "shp": 10000,
    "range_nm": 4300,
    "range_at_kn": 12,
    "fuel": "coal"
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 80,
    "turret_mm": 0,
    "torpedo_defense": 0
  }
}
```

### Gazelle class — `gazelle_cl`

```json
{
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
  "propulsion": {
    "speed_kn": 21.5,
    "shp": 8000,
    "range_nm": 3600,
    "range_at_kn": 12,
    "fuel": "coal"
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 25,
    "turret_mm": 0,
    "torpedo_defense": 0
  }
}
```

### V1 class — `v1_dd`

```json
{
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
  "propulsion": {
    "speed_kn": 32,
    "shp": 17000,
    "range_nm": 1800,
    "range_at_kn": 17,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0,
    "turret_mm": 0,
    "torpedo_defense": 0
  }
}
```

### A-boat class — `a_boat_tb`

```json
{
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
  "propulsion": {
    "speed_kn": 25,
    "shp": 3500,
    "range_nm": 800,
    "range_at_kn": 14,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0,
    "turret_mm": 0,
    "torpedo_defense": 0
  }
}
```

### Germany standard freighter 1922 — `de_merchant_1922`

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

### Germany standard freighter 1936 — `de_merchant_1936`

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

### Germany standard freighter 1948 — `de_merchant_1948`

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

### Fleet depot · 1922 — `de_depot_1922`

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

### Fleet oiler · 1922 — `de_oiler_1922`

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

### Fleet depot · 1936 — `de_depot_1936`

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

### Fleet oiler · 1936 — `de_oiler_1936`

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

### Fleet depot · 1950 — `de_depot_1950`

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

### Fleet oiler · 1950 — `de_oiler_1950`

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
