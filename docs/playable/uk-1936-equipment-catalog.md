# United Kingdom — In Good Faith — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1936-01-01.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.19.0. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/uk.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1936-01-01. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is Scapa Flow.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| Tarawa | 0 | None | 0 | 0 |
| Portsmouth | 60 | 15 GBR naval fighter · 1936 (fighter); 7 GBR observation floatplane · 1936 (scout); 14 Skua (strike) | 36 | 720 |
| Rosyth | 60 | 15 GBR naval fighter · 1936 (fighter); 7 GBR observation floatplane · 1936 (scout); 14 Skua (strike) | 36 | 720 |
| Scapa Flow | 30 | 8 GBR naval fighter · 1936 (fighter); 4 GBR observation floatplane · 1936 (scout); 6 Skua (strike) | 18 | 360 |
| Gibraltar | 60 | 15 GBR naval fighter · 1936 (fighter); 7 GBR observation floatplane · 1936 (scout); 14 Skua (strike) | 36 | 720 |
| Alexandria | 30 | 8 GBR naval fighter · 1936 (fighter); 4 GBR observation floatplane · 1936 (scout); 6 Skua (strike) | 18 | 360 |
| Singapore | 30 | 8 GBR naval fighter · 1936 (fighter); 4 GBR observation floatplane · 1936 (scout); 6 Skua (strike) | 18 | 360 |
| Freetown station | 4 | 2 GBR naval fighter · 1936 (fighter) | 2 | 48 |
| Ascension anchorage | 0 | None | 0 | 0 |
| Simon’s Town | 60 | 15 GBR naval fighter · 1936 (fighter); 7 GBR observation floatplane · 1936 (scout); 14 Skua (strike) | 36 | 720 |
| Durban station | 30 | 8 GBR naval fighter · 1936 (fighter); 4 GBR observation floatplane · 1936 (scout); 6 Skua (strike) | 18 | 360 |
| Mauritius station | 4 | 2 GBR naval fighter · 1936 (fighter) | 2 | 48 |
| Chagos anchorage | 0 | None | 0 | 0 |
| Trincomalee | 30 | 8 GBR naval fighter · 1936 (fighter); 4 GBR observation floatplane · 1936 (scout); 6 Skua (strike) | 18 | 360 |
| Fremantle | 30 | 8 GBR naval fighter · 1936 (fighter); 4 GBR observation floatplane · 1936 (scout); 6 Skua (strike) | 18 | 360 |
| Malta / Valletta | 60 | 15 GBR naval fighter · 1936 (fighter); 7 GBR observation floatplane · 1936 (scout); 14 Skua (strike) | 36 | 720 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

Other-service shore establishments fill up to 25% of base slots. They own separate aircraft and aircrews, replace losses at home monthly, and use physical ferry/merchant reinforcements. Naval base allocation is limited to the other 75%. [Operational air rules](../operational-air-warfare.md).

- Tarawa: No other-service maritime aircraft
- Portsmouth: 6 GBR long-range maritime patrol · 1936; 9 GBR twin-engine maritime bomber · 1936
- Rosyth: 6 GBR long-range maritime patrol · 1936; 9 GBR twin-engine maritime bomber · 1936
- Scapa Flow: 2 GBR long-range maritime patrol · 1936; 4 GBR twin-engine maritime bomber · 1936
- Gibraltar: 6 GBR long-range maritime patrol · 1936; 9 GBR twin-engine maritime bomber · 1936
- Alexandria: 2 GBR long-range maritime patrol · 1936; 4 GBR twin-engine maritime bomber · 1936
- Singapore: 2 GBR long-range maritime patrol · 1936; 4 GBR twin-engine maritime bomber · 1936
- Freetown station: No other-service maritime aircraft
- Ascension anchorage: No other-service maritime aircraft
- Simon’s Town: 6 GBR long-range maritime patrol · 1936; 9 GBR twin-engine maritime bomber · 1936
- Durban station: 2 GBR long-range maritime patrol · 1936; 4 GBR twin-engine maritime bomber · 1936
- Mauritius station: No other-service maritime aircraft
- Chagos anchorage: No other-service maritime aircraft
- Trincomalee: 2 GBR long-range maritime patrol · 1936; 4 GBR twin-engine maritime bomber · 1936
- Fremantle: 2 GBR long-range maritime patrol · 1936; 4 GBR twin-engine maritime bomber · 1936
- Malta / Valletta: 6 GBR long-range maritime patrol · 1936; 9 GBR twin-engine maritime bomber · 1936

### GBR naval fighter · 1921 — `uk_naval_fighter_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | fighter | 1 | 30 | 220 |

Complete playable model:

```json
{
  "id": "uk_naval_fighter_1921",
  "nation": "GBR",
  "name": "GBR naval fighter · 1921",
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

### GBR carrier strike aircraft · 1921 — `uk_naval_strike_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | strike | 2 | 44 | 280 |

Complete playable model:

```json
{
  "id": "uk_naval_strike_1921",
  "nation": "GBR",
  "name": "GBR carrier strike aircraft · 1921",
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

### GBR observation floatplane · 1921 — `uk_naval_scout_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | scout | 2 | 36 | 300 |

Complete playable model:

```json
{
  "id": "uk_naval_scout_1921",
  "nation": "GBR",
  "name": "GBR observation floatplane · 1921",
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

### GBR naval fighter · 1924 — `uk_naval_fighter_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | fighter | 1 | 34 | 252 |

Complete playable model:

```json
{
  "id": "uk_naval_fighter_1924",
  "nation": "GBR",
  "name": "GBR naval fighter · 1924",
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
    "combat_radius_km": 252
  },
  "notes": "Representative 1924 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR carrier strike aircraft · 1924 — `uk_naval_strike_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | strike | 2 | 49 | 322 |

Complete playable model:

```json
{
  "id": "uk_naval_strike_1924",
  "nation": "GBR",
  "name": "GBR carrier strike aircraft · 1924",
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
    "combat_radius_km": 322
  },
  "notes": "Representative 1924 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR observation floatplane · 1924 — `uk_naval_scout_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | scout | 2 | 41 | 349 |

Complete playable model:

```json
{
  "id": "uk_naval_scout_1924",
  "nation": "GBR",
  "name": "GBR observation floatplane · 1924",
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
    "combat_radius_km": 349
  },
  "notes": "Representative 1924 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### GBR naval fighter · 1927 — `uk_naval_fighter_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | fighter | 1 | 37 | 285 |

Complete playable model:

```json
{
  "id": "uk_naval_fighter_1927",
  "nation": "GBR",
  "name": "GBR naval fighter · 1927",
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
    "combat_radius_km": 285
  },
  "notes": "Representative 1927 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR carrier strike aircraft · 1927 — `uk_naval_strike_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | strike | 2 | 54 | 364 |

Complete playable model:

```json
{
  "id": "uk_naval_strike_1927",
  "nation": "GBR",
  "name": "GBR carrier strike aircraft · 1927",
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
    "combat_radius_km": 364
  },
  "notes": "Representative 1927 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR observation floatplane · 1927 — `uk_naval_scout_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | scout | 2 | 46 | 397 |

Complete playable model:

```json
{
  "id": "uk_naval_scout_1927",
  "nation": "GBR",
  "name": "GBR observation floatplane · 1927",
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
    "combat_radius_km": 397
  },
  "notes": "Representative 1927 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### GBR naval fighter · 1930 — `uk_naval_fighter_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | fighter | 1 | 41 | 317 |

Complete playable model:

```json
{
  "id": "uk_naval_fighter_1930",
  "nation": "GBR",
  "name": "GBR naval fighter · 1930",
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
    "combat_radius_km": 317
  },
  "notes": "Representative 1930 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR carrier strike aircraft · 1930 — `uk_naval_strike_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | strike | 2 | 58 | 406 |

Complete playable model:

```json
{
  "id": "uk_naval_strike_1930",
  "nation": "GBR",
  "name": "GBR carrier strike aircraft · 1930",
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
    "combat_radius_km": 406
  },
  "notes": "Representative 1930 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR observation floatplane · 1930 — `uk_naval_scout_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | scout | 2 | 50 | 446 |

Complete playable model:

```json
{
  "id": "uk_naval_scout_1930",
  "nation": "GBR",
  "name": "GBR observation floatplane · 1930",
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
    "combat_radius_km": 446
  },
  "notes": "Representative 1930 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### GBR naval fighter · 1933 — `uk_naval_fighter_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | fighter | 1 | 44 | 350 |

Complete playable model:

```json
{
  "id": "uk_naval_fighter_1933",
  "nation": "GBR",
  "name": "GBR naval fighter · 1933",
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
    "combat_radius_km": 350
  },
  "notes": "Representative 1933 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR carrier strike aircraft · 1933 — `uk_naval_strike_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | strike | 3 | 63 | 448 |

Complete playable model:

```json
{
  "id": "uk_naval_strike_1933",
  "nation": "GBR",
  "name": "GBR carrier strike aircraft · 1933",
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
    "combat_radius_km": 448
  },
  "notes": "Representative 1933 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR observation floatplane · 1933 — `uk_naval_scout_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | scout | 2 | 55 | 494 |

Complete playable model:

```json
{
  "id": "uk_naval_scout_1933",
  "nation": "GBR",
  "name": "GBR observation floatplane · 1933",
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
    "combat_radius_km": 494
  },
  "notes": "Representative 1933 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### GBR naval fighter · 1936 — `uk_naval_fighter_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | fighter | 1 | 48 | 382 |

Complete playable model:

```json
{
  "id": "uk_naval_fighter_1936",
  "nation": "GBR",
  "name": "GBR naval fighter · 1936",
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
    "combat_radius_km": 382
  },
  "notes": "Representative 1936 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### Skua — `uk_naval_strike_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | strike | 3 | 68 | 491 |

Complete playable model:

```json
{
  "id": "uk_naval_strike_1936",
  "nation": "GBR",
  "name": "Skua",
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
    "combat_radius_km": 491
  },
  "notes": "Representative 1936 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR observation floatplane · 1936 — `uk_naval_scout_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | scout | 2 | 60 | 543 |

Complete playable model:

```json
{
  "id": "uk_naval_scout_1936",
  "nation": "GBR",
  "name": "GBR observation floatplane · 1936",
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
    "combat_radius_km": 543
  },
  "notes": "Representative 1936 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### GBR naval fighter · 1939 — `uk_naval_fighter_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | fighter | 1 | 52 | 414 |

Complete playable model:

```json
{
  "id": "uk_naval_fighter_1939",
  "nation": "GBR",
  "name": "GBR naval fighter · 1939",
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
    "combat_radius_km": 414
  },
  "notes": "Representative 1939 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR carrier strike aircraft · 1939 — `uk_naval_strike_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | strike | 3 | 73 | 533 |

Complete playable model:

```json
{
  "id": "uk_naval_strike_1939",
  "nation": "GBR",
  "name": "GBR carrier strike aircraft · 1939",
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
    "combat_radius_km": 533
  },
  "notes": "Representative 1939 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR observation floatplane · 1939 — `uk_naval_scout_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | scout | 2 | 65 | 592 |

Complete playable model:

```json
{
  "id": "uk_naval_scout_1939",
  "nation": "GBR",
  "name": "GBR observation floatplane · 1939",
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
    "combat_radius_km": 592
  },
  "notes": "Representative 1939 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### GBR naval fighter · 1942 — `uk_naval_fighter_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | fighter | 1 | 55 | 447 |

Complete playable model:

```json
{
  "id": "uk_naval_fighter_1942",
  "nation": "GBR",
  "name": "GBR naval fighter · 1942",
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
    "combat_radius_km": 447
  },
  "notes": "Representative 1942 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR carrier strike aircraft · 1942 — `uk_naval_strike_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | strike | 3 | 78 | 575 |

Complete playable model:

```json
{
  "id": "uk_naval_strike_1942",
  "nation": "GBR",
  "name": "GBR carrier strike aircraft · 1942",
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
    "combat_radius_km": 575
  },
  "notes": "Representative 1942 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR observation floatplane · 1942 — `uk_naval_scout_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | scout | 2 | 70 | 640 |

Complete playable model:

```json
{
  "id": "uk_naval_scout_1942",
  "nation": "GBR",
  "name": "GBR observation floatplane · 1942",
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
    "combat_radius_km": 640
  },
  "notes": "Representative 1942 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### GBR naval fighter · 1945 — `uk_naval_fighter_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | fighter | 1 | 59 | 479 |

Complete playable model:

```json
{
  "id": "uk_naval_fighter_1945",
  "nation": "GBR",
  "name": "GBR naval fighter · 1945",
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
    "combat_radius_km": 479
  },
  "notes": "Representative 1945 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR carrier strike aircraft · 1945 — `uk_naval_strike_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | strike | 3 | 82 | 617 |

Complete playable model:

```json
{
  "id": "uk_naval_strike_1945",
  "nation": "GBR",
  "name": "GBR carrier strike aircraft · 1945",
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
    "combat_radius_km": 617
  },
  "notes": "Representative 1945 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR observation floatplane · 1945 — `uk_naval_scout_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | scout | 2 | 74 | 689 |

Complete playable model:

```json
{
  "id": "uk_naval_scout_1945",
  "nation": "GBR",
  "name": "GBR observation floatplane · 1945",
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
    "combat_radius_km": 689
  },
  "notes": "Representative 1945 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### GBR naval fighter · 1948 — `uk_naval_fighter_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | fighter | 1 | 62 | 512 |

Complete playable model:

```json
{
  "id": "uk_naval_fighter_1948",
  "nation": "GBR",
  "name": "GBR naval fighter · 1948",
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
    "combat_radius_km": 512
  },
  "notes": "Representative 1948 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR carrier strike aircraft · 1948 — `uk_naval_strike_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | strike | 3 | 87 | 659 |

Complete playable model:

```json
{
  "id": "uk_naval_strike_1948",
  "nation": "GBR",
  "name": "GBR carrier strike aircraft · 1948",
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
    "combat_radius_km": 659
  },
  "notes": "Representative 1948 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### GBR observation floatplane · 1948 — `uk_naval_scout_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | scout | 2 | 79 | 737 |

Complete playable model:

```json
{
  "id": "uk_naval_scout_1948",
  "nation": "GBR",
  "name": "GBR observation floatplane · 1948",
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
    "combat_radius_km": 737
  },
  "notes": "Representative 1948 national-program procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### GBR coastal patrol flying boat · 1921 — `uk_shore_patrol_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | maritime_patrol | 4 | Government managed | 486 |

Complete playable model:

```json
{
  "id": "uk_shore_patrol_1921",
  "nation": "GBR",
  "name": "GBR coastal patrol flying boat · 1921",
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
    "combat_radius_km": 486
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR shore torpedo biplane · 1921 — `uk_shore_torpedo_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | maritime_strike | 3 | Government managed | 346 |

Complete playable model:

```json
{
  "id": "uk_shore_torpedo_1921",
  "nation": "GBR",
  "name": "GBR shore torpedo biplane · 1921",
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
    "combat_radius_km": 346
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR coastal patrol flying boat · 1924 — `uk_shore_patrol_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | maritime_patrol | 4 | Government managed | 599 |

Complete playable model:

```json
{
  "id": "uk_shore_patrol_1924",
  "nation": "GBR",
  "name": "GBR coastal patrol flying boat · 1924",
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
    "combat_radius_km": 599
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR shore torpedo biplane · 1924 — `uk_shore_torpedo_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | maritime_strike | 3 | Government managed | 420 |

Complete playable model:

```json
{
  "id": "uk_shore_torpedo_1924",
  "nation": "GBR",
  "name": "GBR shore torpedo biplane · 1924",
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
    "combat_radius_km": 420
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR coastal patrol flying boat · 1927 — `uk_shore_patrol_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | maritime_patrol | 4 | Government managed | 713 |

Complete playable model:

```json
{
  "id": "uk_shore_patrol_1927",
  "nation": "GBR",
  "name": "GBR coastal patrol flying boat · 1927",
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
    "combat_radius_km": 713
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR shore torpedo biplane · 1927 — `uk_shore_torpedo_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | maritime_strike | 3 | Government managed | 495 |

Complete playable model:

```json
{
  "id": "uk_shore_torpedo_1927",
  "nation": "GBR",
  "name": "GBR shore torpedo biplane · 1927",
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
    "combat_radius_km": 495
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR coastal patrol flying boat · 1930 — `uk_shore_patrol_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | maritime_patrol | 4 | Government managed | 826 |

Complete playable model:

```json
{
  "id": "uk_shore_patrol_1930",
  "nation": "GBR",
  "name": "GBR coastal patrol flying boat · 1930",
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
    "combat_radius_km": 826
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR shore torpedo biplane · 1930 — `uk_shore_torpedo_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | maritime_strike | 3 | Government managed | 569 |

Complete playable model:

```json
{
  "id": "uk_shore_torpedo_1930",
  "nation": "GBR",
  "name": "GBR shore torpedo biplane · 1930",
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
    "combat_radius_km": 569
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR coastal patrol flying boat · 1933 — `uk_shore_patrol_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | maritime_patrol | 7 | Government managed | 940 |

Complete playable model:

```json
{
  "id": "uk_shore_patrol_1933",
  "nation": "GBR",
  "name": "GBR coastal patrol flying boat · 1933",
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
    "combat_radius_km": 940
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR twin-engine maritime bomber · 1933 — `uk_shore_torpedo_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | maritime_strike | 5 | Government managed | 644 |

Complete playable model:

```json
{
  "id": "uk_shore_torpedo_1933",
  "nation": "GBR",
  "name": "GBR twin-engine maritime bomber · 1933",
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
    "combat_radius_km": 644
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR long-range maritime patrol · 1936 — `uk_shore_patrol_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | maritime_patrol | 7 | Government managed | 1053 |

Complete playable model:

```json
{
  "id": "uk_shore_patrol_1936",
  "nation": "GBR",
  "name": "GBR long-range maritime patrol · 1936",
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
    "combat_radius_km": 1053
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR twin-engine maritime bomber · 1936 — `uk_shore_torpedo_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | maritime_strike | 5 | Government managed | 718 |

Complete playable model:

```json
{
  "id": "uk_shore_torpedo_1936",
  "nation": "GBR",
  "name": "GBR twin-engine maritime bomber · 1936",
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
    "combat_radius_km": 718
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR long-range maritime patrol · 1939 — `uk_shore_patrol_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | maritime_patrol | 7 | Government managed | 1166 |

Complete playable model:

```json
{
  "id": "uk_shore_patrol_1939",
  "nation": "GBR",
  "name": "GBR long-range maritime patrol · 1939",
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
    "combat_radius_km": 1166
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR twin-engine maritime bomber · 1939 — `uk_shore_torpedo_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | maritime_strike | 5 | Government managed | 793 |

Complete playable model:

```json
{
  "id": "uk_shore_torpedo_1939",
  "nation": "GBR",
  "name": "GBR twin-engine maritime bomber · 1939",
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
    "combat_radius_km": 793
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR long-range maritime patrol · 1942 — `uk_shore_patrol_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | maritime_patrol | 7 | Government managed | 1280 |

Complete playable model:

```json
{
  "id": "uk_shore_patrol_1942",
  "nation": "GBR",
  "name": "GBR long-range maritime patrol · 1942",
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
    "combat_radius_km": 1280
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR long-range maritime strike · 1942 — `uk_shore_torpedo_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | maritime_strike | 5 | Government managed | 867 |

Complete playable model:

```json
{
  "id": "uk_shore_torpedo_1942",
  "nation": "GBR",
  "name": "GBR long-range maritime strike · 1942",
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
    "combat_radius_km": 867
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR long-range maritime patrol · 1945 — `uk_shore_patrol_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | maritime_patrol | 7 | Government managed | 1393 |

Complete playable model:

```json
{
  "id": "uk_shore_patrol_1945",
  "nation": "GBR",
  "name": "GBR long-range maritime patrol · 1945",
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
    "combat_radius_km": 1393
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR long-range maritime strike · 1945 — `uk_shore_torpedo_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | maritime_strike | 5 | Government managed | 942 |

Complete playable model:

```json
{
  "id": "uk_shore_torpedo_1945",
  "nation": "GBR",
  "name": "GBR long-range maritime strike · 1945",
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
    "combat_radius_km": 942
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR long-range maritime patrol · 1948 — `uk_shore_patrol_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | maritime_patrol | 7 | Government managed | 1507 |

Complete playable model:

```json
{
  "id": "uk_shore_patrol_1948",
  "nation": "GBR",
  "name": "GBR long-range maritime patrol · 1948",
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
    "combat_radius_km": 1507
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### GBR long-range maritime strike · 1948 — `uk_shore_torpedo_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | maritime_strike | 5 | Government managed | 1016 |

Complete playable model:

```json
{
  "id": "uk_shore_torpedo_1948",
  "nation": "GBR",
  "name": "GBR long-range maritime strike · 1948",
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
    "combat_radius_km": 1016
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
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

### Fast fleet oiler — `rn_fleet_oiler`

```json
{}
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

### Fleet depot · 1932 — `uk_depot_1932`

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

### Fleet oiler · 1932 — `uk_oiler_1932`

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

### Fleet depot · 1942 — `uk_depot_1942`

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

### Fleet oiler · 1942 — `uk_oiler_1942`

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
