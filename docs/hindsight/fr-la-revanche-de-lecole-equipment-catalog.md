# France — In Good Faith — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1936-01-01.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.19.0. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/fr.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1936-01-01. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is Toulon.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| Brest | 60 | 15 La Revanche de l'École 1936 fighter (fighter); 7 La Revanche de l'École 1936 scout (scout); 14 La Revanche de l'École 1936 strike (strike) | 36 | 720 |
| Toulon | 60 | 15 La Revanche de l'École 1936 fighter (fighter); 7 La Revanche de l'École 1936 scout (scout); 14 La Revanche de l'École 1936 strike (strike) | 36 | 720 |
| Dakar | 30 | 8 La Revanche de l'École 1936 fighter (fighter); 4 La Revanche de l'École 1936 scout (scout); 6 La Revanche de l'École 1936 strike (strike) | 18 | 360 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

Other-service shore establishments fill up to 25% of base slots. They own separate aircraft and aircrews, replace losses at home monthly, and use physical ferry/merchant reinforcements. Naval base allocation is limited to the other 75%. [Operational air rules](../operational-air-warfare.md).

- Brest: 6 FRA long-range maritime patrol · 1936; 9 FRA twin-engine maritime bomber · 1936
- Toulon: 6 FRA long-range maritime patrol · 1936; 9 FRA twin-engine maritime bomber · 1936
- Dakar: 2 FRA long-range maritime patrol · 1936; 4 FRA twin-engine maritime bomber · 1936

### FRA naval fighter · 1921 — `fr_naval_fighter_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | fighter | 1 | 30 | 220 |

Complete playable model:

```json
{
  "id": "fr_naval_fighter_1921",
  "nation": "FRA",
  "name": "FRA naval fighter · 1921",
  "type_year": 1921,
  "role": "fighter",
  "catalogKind": "naval",
  "generation": 1921,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 1
  },
  "cost_gold": 30,
  "weights": {
    "empty_kg": 1000
  },
  "performance": {
    "speed_kmh": {
      "cruise": 165
    }
  },
  "fuel": {
    "combat_radius_km": 220
  },
  "notes": "Representative 1921 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### FRA carrier strike aircraft · 1921 — `fr_naval_strike_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | strike | 2 | 44 | 280 |

Complete playable model:

```json
{
  "id": "fr_naval_strike_1921",
  "nation": "FRA",
  "name": "FRA carrier strike aircraft · 1921",
  "type_year": 1921,
  "role": "strike",
  "catalogKind": "naval",
  "generation": 1921,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 2
  },
  "cost_gold": 44,
  "weights": {
    "empty_kg": 1900
  },
  "performance": {
    "speed_kmh": {
      "cruise": 145
    }
  },
  "fuel": {
    "combat_radius_km": 280
  },
  "notes": "Representative 1921 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### FRA observation floatplane · 1921 — `fr_naval_scout_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | scout | 2 | 36 | 300 |

Complete playable model:

```json
{
  "id": "fr_naval_scout_1921",
  "nation": "FRA",
  "name": "FRA observation floatplane · 1921",
  "type_year": 1921,
  "role": "scout",
  "catalogKind": "naval",
  "generation": 1921,
  "basing": {
    "carrier": false,
    "floatplane": true,
    "land": true
  },
  "crew": {
    "normal": 2
  },
  "cost_gold": 36,
  "weights": {
    "empty_kg": 1700
  },
  "performance": {
    "speed_kmh": {
      "cruise": 145
    }
  },
  "fuel": {
    "combat_radius_km": 300
  },
  "notes": "Representative 1921 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### FRA naval fighter · 1924 — `fr_naval_fighter_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | fighter | 1 | 34 | 250 |

Complete playable model:

```json
{
  "id": "fr_naval_fighter_1924",
  "nation": "FRA",
  "name": "FRA naval fighter · 1924",
  "type_year": 1924,
  "role": "fighter",
  "catalogKind": "naval",
  "generation": 1924,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 1
  },
  "cost_gold": 34,
  "weights": {
    "empty_kg": 1255
  },
  "performance": {
    "speed_kmh": {
      "cruise": 189
    }
  },
  "fuel": {
    "combat_radius_km": 250
  },
  "notes": "Representative 1924 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### FRA carrier strike aircraft · 1924 — `fr_naval_strike_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | strike | 2 | 49 | 319 |

Complete playable model:

```json
{
  "id": "fr_naval_strike_1924",
  "nation": "FRA",
  "name": "FRA carrier strike aircraft · 1924",
  "type_year": 1924,
  "role": "strike",
  "catalogKind": "naval",
  "generation": 1924,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 2
  },
  "cost_gold": 49,
  "weights": {
    "empty_kg": 2230
  },
  "performance": {
    "speed_kmh": {
      "cruise": 163
    }
  },
  "fuel": {
    "combat_radius_km": 319
  },
  "notes": "Representative 1924 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### FRA observation floatplane · 1924 — `fr_naval_scout_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | scout | 2 | 41 | 345 |

Complete playable model:

```json
{
  "id": "fr_naval_scout_1924",
  "nation": "FRA",
  "name": "FRA observation floatplane · 1924",
  "type_year": 1924,
  "role": "scout",
  "catalogKind": "naval",
  "generation": 1924,
  "basing": {
    "carrier": false,
    "floatplane": true,
    "land": true
  },
  "crew": {
    "normal": 2
  },
  "cost_gold": 41,
  "weights": {
    "empty_kg": 2030
  },
  "performance": {
    "speed_kmh": {
      "cruise": 163
    }
  },
  "fuel": {
    "combat_radius_km": 345
  },
  "notes": "Representative 1924 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### FRA naval fighter · 1927 — `fr_naval_fighter_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | fighter | 1 | 37 | 280 |

Complete playable model:

```json
{
  "id": "fr_naval_fighter_1927",
  "nation": "FRA",
  "name": "FRA naval fighter · 1927",
  "type_year": 1927,
  "role": "fighter",
  "catalogKind": "naval",
  "generation": 1927,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 1
  },
  "cost_gold": 37,
  "weights": {
    "empty_kg": 1510
  },
  "performance": {
    "speed_kmh": {
      "cruise": 213
    }
  },
  "fuel": {
    "combat_radius_km": 280
  },
  "notes": "Representative 1927 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### FRA carrier strike aircraft · 1927 — `fr_naval_strike_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | strike | 2 | 54 | 358 |

Complete playable model:

```json
{
  "id": "fr_naval_strike_1927",
  "nation": "FRA",
  "name": "FRA carrier strike aircraft · 1927",
  "type_year": 1927,
  "role": "strike",
  "catalogKind": "naval",
  "generation": 1927,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 2
  },
  "cost_gold": 54,
  "weights": {
    "empty_kg": 2560
  },
  "performance": {
    "speed_kmh": {
      "cruise": 181
    }
  },
  "fuel": {
    "combat_radius_km": 358
  },
  "notes": "Representative 1927 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### FRA observation floatplane · 1927 — `fr_naval_scout_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | scout | 2 | 46 | 390 |

Complete playable model:

```json
{
  "id": "fr_naval_scout_1927",
  "nation": "FRA",
  "name": "FRA observation floatplane · 1927",
  "type_year": 1927,
  "role": "scout",
  "catalogKind": "naval",
  "generation": 1927,
  "basing": {
    "carrier": false,
    "floatplane": true,
    "land": true
  },
  "crew": {
    "normal": 2
  },
  "cost_gold": 46,
  "weights": {
    "empty_kg": 2360
  },
  "performance": {
    "speed_kmh": {
      "cruise": 181
    }
  },
  "fuel": {
    "combat_radius_km": 390
  },
  "notes": "Representative 1927 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### La Revanche de l'École 1930 fighter — `fr_naval_fighter_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | fighter | 1 | 41 | 310 |

Complete playable model:

```json
{
  "id": "fr_naval_fighter_1930",
  "nation": "FRA",
  "name": "La Revanche de l'École 1930 fighter",
  "type_year": 1930,
  "role": "fighter",
  "catalogKind": "naval",
  "generation": 1930,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 1
  },
  "cost_gold": 41,
  "weights": {
    "empty_kg": 1765
  },
  "performance": {
    "speed_kmh": {
      "cruise": 237
    }
  },
  "fuel": {
    "combat_radius_km": 310
  },
  "notes": "Representative 1930 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### La Revanche de l'École 1930 strike — `fr_naval_strike_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | strike | 2 | 58 | 397 |

Complete playable model:

```json
{
  "id": "fr_naval_strike_1930",
  "nation": "FRA",
  "name": "La Revanche de l'École 1930 strike",
  "type_year": 1930,
  "role": "strike",
  "catalogKind": "naval",
  "generation": 1930,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 2
  },
  "cost_gold": 58,
  "weights": {
    "empty_kg": 2890
  },
  "performance": {
    "speed_kmh": {
      "cruise": 199
    }
  },
  "fuel": {
    "combat_radius_km": 397
  },
  "notes": "Representative 1930 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### La Revanche de l'École 1930 scout — `fr_naval_scout_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | scout | 2 | 50 | 435 |

Complete playable model:

```json
{
  "id": "fr_naval_scout_1930",
  "nation": "FRA",
  "name": "La Revanche de l'École 1930 scout",
  "type_year": 1930,
  "role": "scout",
  "catalogKind": "naval",
  "generation": 1930,
  "basing": {
    "carrier": false,
    "floatplane": true,
    "land": true
  },
  "crew": {
    "normal": 2
  },
  "cost_gold": 50,
  "weights": {
    "empty_kg": 2690
  },
  "performance": {
    "speed_kmh": {
      "cruise": 199
    }
  },
  "fuel": {
    "combat_radius_km": 435
  },
  "notes": "Representative 1930 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### FRA naval fighter · 1933 — `fr_naval_fighter_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | fighter | 1 | 44 | 340 |

Complete playable model:

```json
{
  "id": "fr_naval_fighter_1933",
  "nation": "FRA",
  "name": "FRA naval fighter · 1933",
  "type_year": 1933,
  "role": "fighter",
  "catalogKind": "naval",
  "generation": 1933,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 1
  },
  "cost_gold": 44,
  "weights": {
    "empty_kg": 2020
  },
  "performance": {
    "speed_kmh": {
      "cruise": 261
    }
  },
  "fuel": {
    "combat_radius_km": 340
  },
  "notes": "Representative 1933 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### FRA carrier strike aircraft · 1933 — `fr_naval_strike_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | strike | 3 | 63 | 436 |

Complete playable model:

```json
{
  "id": "fr_naval_strike_1933",
  "nation": "FRA",
  "name": "FRA carrier strike aircraft · 1933",
  "type_year": 1933,
  "role": "strike",
  "catalogKind": "naval",
  "generation": 1933,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 3
  },
  "cost_gold": 63,
  "weights": {
    "empty_kg": 3220
  },
  "performance": {
    "speed_kmh": {
      "cruise": 217
    }
  },
  "fuel": {
    "combat_radius_km": 436
  },
  "notes": "Representative 1933 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### FRA observation floatplane · 1933 — `fr_naval_scout_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | scout | 2 | 55 | 480 |

Complete playable model:

```json
{
  "id": "fr_naval_scout_1933",
  "nation": "FRA",
  "name": "FRA observation floatplane · 1933",
  "type_year": 1933,
  "role": "scout",
  "catalogKind": "naval",
  "generation": 1933,
  "basing": {
    "carrier": false,
    "floatplane": true,
    "land": true
  },
  "crew": {
    "normal": 2
  },
  "cost_gold": 55,
  "weights": {
    "empty_kg": 3020
  },
  "performance": {
    "speed_kmh": {
      "cruise": 217
    }
  },
  "fuel": {
    "combat_radius_km": 480
  },
  "notes": "Representative 1933 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### La Revanche de l'École 1936 fighter — `fr_naval_fighter_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | fighter | 1 | 48 | 370 |

Complete playable model:

```json
{
  "id": "fr_naval_fighter_1936",
  "nation": "FRA",
  "name": "La Revanche de l'École 1936 fighter",
  "type_year": 1936,
  "role": "fighter",
  "catalogKind": "naval",
  "generation": 1936,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 1
  },
  "cost_gold": 48,
  "weights": {
    "empty_kg": 2275
  },
  "performance": {
    "speed_kmh": {
      "cruise": 285
    }
  },
  "fuel": {
    "combat_radius_km": 370
  },
  "notes": "Representative 1936 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### La Revanche de l'École 1936 strike — `fr_naval_strike_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | strike | 3 | 68 | 475 |

Complete playable model:

```json
{
  "id": "fr_naval_strike_1936",
  "nation": "FRA",
  "name": "La Revanche de l'École 1936 strike",
  "type_year": 1936,
  "role": "strike",
  "catalogKind": "naval",
  "generation": 1936,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 3
  },
  "cost_gold": 68,
  "weights": {
    "empty_kg": 3550
  },
  "performance": {
    "speed_kmh": {
      "cruise": 235
    }
  },
  "fuel": {
    "combat_radius_km": 475
  },
  "notes": "Representative 1936 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### La Revanche de l'École 1936 scout — `fr_naval_scout_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | scout | 2 | 60 | 525 |

Complete playable model:

```json
{
  "id": "fr_naval_scout_1936",
  "nation": "FRA",
  "name": "La Revanche de l'École 1936 scout",
  "type_year": 1936,
  "role": "scout",
  "catalogKind": "naval",
  "generation": 1936,
  "basing": {
    "carrier": false,
    "floatplane": true,
    "land": true
  },
  "crew": {
    "normal": 2
  },
  "cost_gold": 60,
  "weights": {
    "empty_kg": 3350
  },
  "performance": {
    "speed_kmh": {
      "cruise": 235
    }
  },
  "fuel": {
    "combat_radius_km": 525
  },
  "notes": "Representative 1936 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### FRA naval fighter · 1939 — `fr_naval_fighter_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | fighter | 1 | 52 | 400 |

Complete playable model:

```json
{
  "id": "fr_naval_fighter_1939",
  "nation": "FRA",
  "name": "FRA naval fighter · 1939",
  "type_year": 1939,
  "role": "fighter",
  "catalogKind": "naval",
  "generation": 1939,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 1
  },
  "cost_gold": 52,
  "weights": {
    "empty_kg": 2530
  },
  "performance": {
    "speed_kmh": {
      "cruise": 309
    }
  },
  "fuel": {
    "combat_radius_km": 400
  },
  "notes": "Representative 1939 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### FRA carrier strike aircraft · 1939 — `fr_naval_strike_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | strike | 3 | 73 | 514 |

Complete playable model:

```json
{
  "id": "fr_naval_strike_1939",
  "nation": "FRA",
  "name": "FRA carrier strike aircraft · 1939",
  "type_year": 1939,
  "role": "strike",
  "catalogKind": "naval",
  "generation": 1939,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 3
  },
  "cost_gold": 73,
  "weights": {
    "empty_kg": 3880
  },
  "performance": {
    "speed_kmh": {
      "cruise": 253
    }
  },
  "fuel": {
    "combat_radius_km": 514
  },
  "notes": "Representative 1939 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### FRA observation floatplane · 1939 — `fr_naval_scout_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | scout | 2 | 65 | 570 |

Complete playable model:

```json
{
  "id": "fr_naval_scout_1939",
  "nation": "FRA",
  "name": "FRA observation floatplane · 1939",
  "type_year": 1939,
  "role": "scout",
  "catalogKind": "naval",
  "generation": 1939,
  "basing": {
    "carrier": false,
    "floatplane": true,
    "land": true
  },
  "crew": {
    "normal": 2
  },
  "cost_gold": 65,
  "weights": {
    "empty_kg": 3680
  },
  "performance": {
    "speed_kmh": {
      "cruise": 253
    }
  },
  "fuel": {
    "combat_radius_km": 570
  },
  "notes": "Representative 1939 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### La Revanche de l'École 1942 fighter — `fr_naval_fighter_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | fighter | 1 | 55 | 430 |

Complete playable model:

```json
{
  "id": "fr_naval_fighter_1942",
  "nation": "FRA",
  "name": "La Revanche de l'École 1942 fighter",
  "type_year": 1942,
  "role": "fighter",
  "catalogKind": "naval",
  "generation": 1942,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 1
  },
  "cost_gold": 55,
  "weights": {
    "empty_kg": 2785
  },
  "performance": {
    "speed_kmh": {
      "cruise": 333
    }
  },
  "fuel": {
    "combat_radius_km": 430
  },
  "notes": "Representative 1942 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### La Revanche de l'École 1942 strike — `fr_naval_strike_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | strike | 3 | 78 | 553 |

Complete playable model:

```json
{
  "id": "fr_naval_strike_1942",
  "nation": "FRA",
  "name": "La Revanche de l'École 1942 strike",
  "type_year": 1942,
  "role": "strike",
  "catalogKind": "naval",
  "generation": 1942,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 3
  },
  "cost_gold": 78,
  "weights": {
    "empty_kg": 4210
  },
  "performance": {
    "speed_kmh": {
      "cruise": 271
    }
  },
  "fuel": {
    "combat_radius_km": 553
  },
  "notes": "Representative 1942 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### La Revanche de l'École 1942 scout — `fr_naval_scout_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | scout | 2 | 70 | 615 |

Complete playable model:

```json
{
  "id": "fr_naval_scout_1942",
  "nation": "FRA",
  "name": "La Revanche de l'École 1942 scout",
  "type_year": 1942,
  "role": "scout",
  "catalogKind": "naval",
  "generation": 1942,
  "basing": {
    "carrier": false,
    "floatplane": true,
    "land": true
  },
  "crew": {
    "normal": 2
  },
  "cost_gold": 70,
  "weights": {
    "empty_kg": 4010
  },
  "performance": {
    "speed_kmh": {
      "cruise": 271
    }
  },
  "fuel": {
    "combat_radius_km": 615
  },
  "notes": "Representative 1942 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### FRA naval fighter · 1945 — `fr_naval_fighter_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | fighter | 1 | 59 | 460 |

Complete playable model:

```json
{
  "id": "fr_naval_fighter_1945",
  "nation": "FRA",
  "name": "FRA naval fighter · 1945",
  "type_year": 1945,
  "role": "fighter",
  "catalogKind": "naval",
  "generation": 1945,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 1
  },
  "cost_gold": 59,
  "weights": {
    "empty_kg": 3040
  },
  "performance": {
    "speed_kmh": {
      "cruise": 357
    }
  },
  "fuel": {
    "combat_radius_km": 460
  },
  "notes": "Representative 1945 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### FRA carrier strike aircraft · 1945 — `fr_naval_strike_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | strike | 3 | 82 | 592 |

Complete playable model:

```json
{
  "id": "fr_naval_strike_1945",
  "nation": "FRA",
  "name": "FRA carrier strike aircraft · 1945",
  "type_year": 1945,
  "role": "strike",
  "catalogKind": "naval",
  "generation": 1945,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 3
  },
  "cost_gold": 82,
  "weights": {
    "empty_kg": 4540
  },
  "performance": {
    "speed_kmh": {
      "cruise": 289
    }
  },
  "fuel": {
    "combat_radius_km": 592
  },
  "notes": "Representative 1945 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### FRA observation floatplane · 1945 — `fr_naval_scout_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | scout | 2 | 74 | 660 |

Complete playable model:

```json
{
  "id": "fr_naval_scout_1945",
  "nation": "FRA",
  "name": "FRA observation floatplane · 1945",
  "type_year": 1945,
  "role": "scout",
  "catalogKind": "naval",
  "generation": 1945,
  "basing": {
    "carrier": false,
    "floatplane": true,
    "land": true
  },
  "crew": {
    "normal": 2
  },
  "cost_gold": 74,
  "weights": {
    "empty_kg": 4340
  },
  "performance": {
    "speed_kmh": {
      "cruise": 289
    }
  },
  "fuel": {
    "combat_radius_km": 660
  },
  "notes": "Representative 1945 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### FRA naval fighter · 1948 — `fr_naval_fighter_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | fighter | 1 | 62 | 490 |

Complete playable model:

```json
{
  "id": "fr_naval_fighter_1948",
  "nation": "FRA",
  "name": "FRA naval fighter · 1948",
  "type_year": 1948,
  "role": "fighter",
  "catalogKind": "naval",
  "generation": 1948,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 1
  },
  "cost_gold": 62,
  "weights": {
    "empty_kg": 3295
  },
  "performance": {
    "speed_kmh": {
      "cruise": 381
    }
  },
  "fuel": {
    "combat_radius_km": 490
  },
  "notes": "Representative 1948 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### FRA carrier strike aircraft · 1948 — `fr_naval_strike_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | strike | 3 | 87 | 631 |

Complete playable model:

```json
{
  "id": "fr_naval_strike_1948",
  "nation": "FRA",
  "name": "FRA carrier strike aircraft · 1948",
  "type_year": 1948,
  "role": "strike",
  "catalogKind": "naval",
  "generation": 1948,
  "basing": {
    "carrier": true,
    "floatplane": false,
    "land": true
  },
  "crew": {
    "normal": 3
  },
  "cost_gold": 87,
  "weights": {
    "empty_kg": 4870
  },
  "performance": {
    "speed_kmh": {
      "cruise": 307
    }
  },
  "fuel": {
    "combat_radius_km": 631
  },
  "notes": "Representative 1948 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### FRA observation floatplane · 1948 — `fr_naval_scout_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | scout | 2 | 79 | 705 |

Complete playable model:

```json
{
  "id": "fr_naval_scout_1948",
  "nation": "FRA",
  "name": "FRA observation floatplane · 1948",
  "type_year": 1948,
  "role": "scout",
  "catalogKind": "naval",
  "generation": 1948,
  "basing": {
    "carrier": false,
    "floatplane": true,
    "land": true
  },
  "crew": {
    "normal": 2
  },
  "cost_gold": 79,
  "weights": {
    "empty_kg": 4670
  },
  "performance": {
    "speed_kmh": {
      "cruise": 307
    }
  },
  "fuel": {
    "combat_radius_km": 705
  },
  "notes": "Representative 1948 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### FRA coastal patrol flying boat · 1921 — `fr_shore_patrol_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | maritime_patrol | 4 | Government managed | 450 |

Complete playable model:

```json
{
  "id": "fr_shore_patrol_1921",
  "nation": "FRA",
  "name": "FRA coastal patrol flying boat · 1921",
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
    "combat_radius_km": 450
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA shore torpedo biplane · 1921 — `fr_shore_torpedo_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | maritime_strike | 3 | Government managed | 320 |

Complete playable model:

```json
{
  "id": "fr_shore_torpedo_1921",
  "nation": "FRA",
  "name": "FRA shore torpedo biplane · 1921",
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
    "combat_radius_km": 320
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA coastal patrol flying boat · 1924 — `fr_shore_patrol_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | maritime_patrol | 4 | Government managed | 555 |

Complete playable model:

```json
{
  "id": "fr_shore_patrol_1924",
  "nation": "FRA",
  "name": "FRA coastal patrol flying boat · 1924",
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
    "combat_radius_km": 555
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA shore torpedo biplane · 1924 — `fr_shore_torpedo_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | maritime_strike | 3 | Government managed | 389 |

Complete playable model:

```json
{
  "id": "fr_shore_torpedo_1924",
  "nation": "FRA",
  "name": "FRA shore torpedo biplane · 1924",
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
    "combat_radius_km": 389
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA coastal patrol flying boat · 1927 — `fr_shore_patrol_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | maritime_patrol | 4 | Government managed | 660 |

Complete playable model:

```json
{
  "id": "fr_shore_patrol_1927",
  "nation": "FRA",
  "name": "FRA coastal patrol flying boat · 1927",
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
    "combat_radius_km": 660
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA shore torpedo biplane · 1927 — `fr_shore_torpedo_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | maritime_strike | 3 | Government managed | 458 |

Complete playable model:

```json
{
  "id": "fr_shore_torpedo_1927",
  "nation": "FRA",
  "name": "FRA shore torpedo biplane · 1927",
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
    "combat_radius_km": 458
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA coastal patrol flying boat · 1930 — `fr_shore_patrol_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | maritime_patrol | 4 | Government managed | 765 |

Complete playable model:

```json
{
  "id": "fr_shore_patrol_1930",
  "nation": "FRA",
  "name": "FRA coastal patrol flying boat · 1930",
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
    "combat_radius_km": 765
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA shore torpedo biplane · 1930 — `fr_shore_torpedo_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | maritime_strike | 3 | Government managed | 527 |

Complete playable model:

```json
{
  "id": "fr_shore_torpedo_1930",
  "nation": "FRA",
  "name": "FRA shore torpedo biplane · 1930",
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
    "combat_radius_km": 527
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA coastal patrol flying boat · 1933 — `fr_shore_patrol_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | maritime_patrol | 7 | Government managed | 870 |

Complete playable model:

```json
{
  "id": "fr_shore_patrol_1933",
  "nation": "FRA",
  "name": "FRA coastal patrol flying boat · 1933",
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
    "combat_radius_km": 870
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA twin-engine maritime bomber · 1933 — `fr_shore_torpedo_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | maritime_strike | 5 | Government managed | 596 |

Complete playable model:

```json
{
  "id": "fr_shore_torpedo_1933",
  "nation": "FRA",
  "name": "FRA twin-engine maritime bomber · 1933",
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
    "combat_radius_km": 596
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA long-range maritime patrol · 1936 — `fr_shore_patrol_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | maritime_patrol | 7 | Government managed | 975 |

Complete playable model:

```json
{
  "id": "fr_shore_patrol_1936",
  "nation": "FRA",
  "name": "FRA long-range maritime patrol · 1936",
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
    "combat_radius_km": 975
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA twin-engine maritime bomber · 1936 — `fr_shore_torpedo_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | maritime_strike | 5 | Government managed | 665 |

Complete playable model:

```json
{
  "id": "fr_shore_torpedo_1936",
  "nation": "FRA",
  "name": "FRA twin-engine maritime bomber · 1936",
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
    "combat_radius_km": 665
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA long-range maritime patrol · 1939 — `fr_shore_patrol_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | maritime_patrol | 7 | Government managed | 1080 |

Complete playable model:

```json
{
  "id": "fr_shore_patrol_1939",
  "nation": "FRA",
  "name": "FRA long-range maritime patrol · 1939",
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
    "combat_radius_km": 1080
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA twin-engine maritime bomber · 1939 — `fr_shore_torpedo_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | maritime_strike | 5 | Government managed | 734 |

Complete playable model:

```json
{
  "id": "fr_shore_torpedo_1939",
  "nation": "FRA",
  "name": "FRA twin-engine maritime bomber · 1939",
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
    "combat_radius_km": 734
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA long-range maritime patrol · 1942 — `fr_shore_patrol_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | maritime_patrol | 7 | Government managed | 1185 |

Complete playable model:

```json
{
  "id": "fr_shore_patrol_1942",
  "nation": "FRA",
  "name": "FRA long-range maritime patrol · 1942",
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
    "combat_radius_km": 1185
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA long-range maritime strike · 1942 — `fr_shore_torpedo_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | maritime_strike | 5 | Government managed | 803 |

Complete playable model:

```json
{
  "id": "fr_shore_torpedo_1942",
  "nation": "FRA",
  "name": "FRA long-range maritime strike · 1942",
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
    "combat_radius_km": 803
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA long-range maritime patrol · 1945 — `fr_shore_patrol_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | maritime_patrol | 7 | Government managed | 1290 |

Complete playable model:

```json
{
  "id": "fr_shore_patrol_1945",
  "nation": "FRA",
  "name": "FRA long-range maritime patrol · 1945",
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
    "combat_radius_km": 1290
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA long-range maritime strike · 1945 — `fr_shore_torpedo_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | maritime_strike | 5 | Government managed | 872 |

Complete playable model:

```json
{
  "id": "fr_shore_torpedo_1945",
  "nation": "FRA",
  "name": "FRA long-range maritime strike · 1945",
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
    "combat_radius_km": 872
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA long-range maritime patrol · 1948 — `fr_shore_patrol_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | maritime_patrol | 7 | Government managed | 1395 |

Complete playable model:

```json
{
  "id": "fr_shore_patrol_1948",
  "nation": "FRA",
  "name": "FRA long-range maritime patrol · 1948",
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
    "combat_radius_km": 1395
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### FRA long-range maritime strike · 1948 — `fr_shore_torpedo_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | maritime_strike | 5 | Government managed | 941 |

Complete playable model:

```json
{
  "id": "fr_shore_torpedo_1948",
  "nation": "FRA",
  "name": "FRA long-range maritime strike · 1948",
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
    "combat_radius_km": 941
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

## Referenced equipment

Original equipment generations retain their original national catalog as owner. New sonar sets are conservative, provisional 1930 active-sonar fits; no radar capability is implied.

### `fr30snr` — La Revanche de l'École active sonar

```json
{
  "name": "La Revanche de l'École active sonar",
  "nation": "FRA",
  "year": 1930,
  "family": "snr",
  "interface": "hull_sonar",
  "range_km": 1.8,
  "notes": "Provisional contemporary active sonar fit; no radar or advanced depth solution."
}
```

## Literal weapons and machinery

Classes using literal fits carry their complete weapon, protection and machinery input here. They are not unresolvable equipment SKUs.

### Courbet class — `courbet`

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
        "count": 22,
        "caliber_in": 5.5,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 21,
    "shp": 28000,
    "range_nm": 4200,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 270,
    "deck_mm": 70,
    "turret_mm": 290,
    "torpedo_defense": 0
  }
}
```

### Bretagne class — `bretagne`

```json
{
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
  "propulsion": {
    "speed_kn": 20,
    "shp": 29000,
    "range_nm": 4700,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 270,
    "deck_mm": 70,
    "turret_mm": 340,
    "torpedo_defense": 0
  }
}
```

### Normandie class (suspended) — `normandie`

```json
{
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
  "propulsion": {
    "speed_kn": 21,
    "shp": 32000,
    "range_nm": 6500,
    "range_at_kn": 12,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 300,
    "deck_mm": 70,
    "turret_mm": 340,
    "torpedo_defense": 1
  }
}
```

### Bearn (carrier conversion) — `bearn_cv`

```json
{
  "armament": {
    "secondary_battery": [
      {
        "count": 8,
        "caliber_in": 6.1,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 21.5,
    "shp": 37500,
    "range_nm": 7000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 83,
    "deck_mm": 25
  }
}
```

### Edgar Quinet class — `edgar_quinet`

```json
{
  "armament": {
    "main_battery": {
      "count": 14,
      "caliber_in": 7.6,
      "mounts": "twin/casemate"
    }
  },
  "propulsion": {
    "speed_kn": 23,
    "shp": 36000,
    "range_nm": 5100,
    "range_at_kn": 10,
    "fuel": "coal"
  },
  "protection": {
    "belt_mm": 150,
    "deck_mm": 65
  }
}
```

### Duguay-Trouin class — `duguay_trouin`

```json
{
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
  "propulsion": {
    "speed_kn": 33,
    "shp": 100000,
    "range_nm": 4500,
    "range_at_kn": 15,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 20,
    "deck_mm": 20
  }
}
```

### Arabe class — `arabe`

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
      "caliber_in": 17.7,
      "submerged": false
    }
  },
  "propulsion": {
    "speed_kn": 33,
    "shp": 17500,
    "range_nm": 2000,
    "range_at_kn": 14,
    "fuel": "oil"
  }
}
```

### Chacal class (contre-torpilleur) — `chacal`

```json
{
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
  "propulsion": {
    "speed_kn": 35.5,
    "shp": 50000,
    "range_nm": 3000,
    "range_at_kn": 15,
    "fuel": "oil"
  }
}
```

### Lagrange class — `lagrange`

```json
{
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
  "propulsion": {
    "speed_kn": 16.5,
    "range_nm": 4300,
    "range_at_kn": 10,
    "fuel": "diesel"
  }
}
```

### Requin class — `requin`

```json
{
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
  "propulsion": {
    "speed_kn": 15,
    "range_nm": 7700,
    "range_at_kn": 9,
    "fuel": "diesel"
  }
}
```

### École ocean submarine — `ecole_ss28`

```json
{
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
  "propulsion": {
    "speed_kn": 19,
    "range_nm": 9000
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  },
  "sensors": []
}
```

### Vengeur torpedo destroyer — `ecole_dd30`

```json
{
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
  "propulsion": {
    "speed_kn": 37,
    "range_nm": 5000
  },
  "protection": {
    "belt_mm": 12,
    "deck_mm": 3
  },
  "sensors": [
    "fr30snr"
  ]
}
```

### Éclaireur fast cruiser — `ecole_cl29`

```json
{
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
  "propulsion": {
    "speed_kn": 35,
    "range_nm": 7500
  },
  "protection": {
    "belt_mm": 80,
    "deck_mm": 20
  },
  "sensors": []
}
```

### Liberté carrier — `ecole_cv31`

```json
{
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
  "propulsion": {
    "speed_kn": 31,
    "range_nm": 7000
  },
  "protection": {
    "belt_mm": 65,
    "deck_mm": 16
  },
  "sensors": []
}
```

### École submarine, 1937 — `ecole_ss37`

```json
{
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
  "propulsion": {
    "speed_kn": 20,
    "range_nm": 11000
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  },
  "sensors": []
}
```

### La Revanche de l'École fleet oiler — `fra_program_oiler`

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
        "count": 8
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

### France standard freighter 1922 — `fr_merchant_1922`

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

### France standard freighter 1936 — `fr_merchant_1936`

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

### France standard freighter 1948 — `fr_merchant_1948`

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

### Fleet depot · 1922 — `fr_depot_1922`

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

### Fleet oiler · 1922 — `fr_oiler_1922`

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

### Fleet depot · 1932 — `fr_depot_1932`

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

### Fleet oiler · 1932 — `fr_oiler_1932`

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

### Fleet depot · 1942 — `fr_depot_1942`

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

### Fleet oiler · 1942 — `fr_oiler_1942`

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
