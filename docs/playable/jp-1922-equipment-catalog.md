# Japan — The Treaty System — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1922-02-06.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.19.0. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/jp.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1922-02-06. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is Yokosuka.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| Saipan / Tanapag | 2 | 1 Mitsubishi 1MF (fighter) | 1 | 24 |
| Truk Lagoon | 2 | 1 Mitsubishi 1MF (fighter) | 1 | 24 |
| Palau / Koror | 0 | None | 0 | 0 |
| Kwajalein | 0 | None | 0 | 0 |
| Majuro | 0 | None | 0 | 0 |
| Kure | 60 | 15 Mitsubishi 1MF (fighter); 7 Yokosuka Ro-go (scout); 14 Mitsubishi 1MT (strike) | 36 | 720 |
| Sasebo | 60 | 15 Mitsubishi 1MF (fighter); 7 Yokosuka Ro-go (scout); 14 Mitsubishi 1MT (strike) | 36 | 720 |
| Yokosuka | 60 | 15 Mitsubishi 1MF (fighter); 7 Yokosuka Ro-go (scout); 14 Mitsubishi 1MT (strike) | 36 | 720 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

Other-service shore establishments fill up to 25% of base slots. They own separate aircraft and aircrews, replace losses at home monthly, and use physical ferry/merchant reinforcements. Naval base allocation is limited to the other 75%. [Operational air rules](../operational-air-warfare.md).

- Saipan / Tanapag: No other-service maritime aircraft
- Truk Lagoon: No other-service maritime aircraft
- Palau / Koror: No other-service maritime aircraft
- Kwajalein: No other-service maritime aircraft
- Majuro: No other-service maritime aircraft
- Kure: 6 JPN coastal patrol flying boat · 1921; 9 JPN shore torpedo biplane · 1921
- Sasebo: 6 JPN coastal patrol flying boat · 1921; 9 JPN shore torpedo biplane · 1921
- Yokosuka: 6 JPN coastal patrol flying boat · 1921; 9 JPN shore torpedo biplane · 1921

### Mitsubishi 1MF — `jp_naval_fighter_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | fighter | 1 | 30 | 220 |

Complete playable model:

```json
{
  "id": "jp_naval_fighter_1921",
  "nation": "JPN",
  "name": "Mitsubishi 1MF",
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
  "notes": "Representative 1921 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### Mitsubishi 1MT — `jp_naval_strike_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | strike | 2 | 44 | 280 |

Complete playable model:

```json
{
  "id": "jp_naval_strike_1921",
  "nation": "JPN",
  "name": "Mitsubishi 1MT",
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
  "notes": "Representative 1921 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### Yokosuka Ro-go — `jp_naval_scout_1921`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | scout | 2 | 36 | 300 |

Complete playable model:

```json
{
  "id": "jp_naval_scout_1921",
  "nation": "JPN",
  "name": "Yokosuka Ro-go",
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
  "notes": "Representative 1921 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### JPN naval fighter · 1924 — `jp_naval_fighter_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | fighter | 1 | 34 | 255 |

Complete playable model:

```json
{
  "id": "jp_naval_fighter_1924",
  "nation": "JPN",
  "name": "JPN naval fighter · 1924",
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
    "combat_radius_km": 255
  },
  "notes": "Representative 1924 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN carrier strike aircraft · 1924 — `jp_naval_strike_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | strike | 2 | 49 | 325 |

Complete playable model:

```json
{
  "id": "jp_naval_strike_1924",
  "nation": "JPN",
  "name": "JPN carrier strike aircraft · 1924",
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
    "combat_radius_km": 325
  },
  "notes": "Representative 1924 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN observation floatplane · 1924 — `jp_naval_scout_1924`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1924 | scout | 2 | 41 | 352 |

Complete playable model:

```json
{
  "id": "jp_naval_scout_1924",
  "nation": "JPN",
  "name": "JPN observation floatplane · 1924",
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
    "combat_radius_km": 352
  },
  "notes": "Representative 1924 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### JPN naval fighter · 1927 — `jp_naval_fighter_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | fighter | 1 | 37 | 290 |

Complete playable model:

```json
{
  "id": "jp_naval_fighter_1927",
  "nation": "JPN",
  "name": "JPN naval fighter · 1927",
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
    "combat_radius_km": 290
  },
  "notes": "Representative 1927 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN carrier strike aircraft · 1927 — `jp_naval_strike_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | strike | 2 | 54 | 370 |

Complete playable model:

```json
{
  "id": "jp_naval_strike_1927",
  "nation": "JPN",
  "name": "JPN carrier strike aircraft · 1927",
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
    "combat_radius_km": 370
  },
  "notes": "Representative 1927 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN observation floatplane · 1927 — `jp_naval_scout_1927`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1927 | scout | 2 | 46 | 404 |

Complete playable model:

```json
{
  "id": "jp_naval_scout_1927",
  "nation": "JPN",
  "name": "JPN observation floatplane · 1927",
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
    "combat_radius_km": 404
  },
  "notes": "Representative 1927 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### JPN 1930 fighter — `jp_naval_fighter_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | fighter | 1 | 41 | 324 |

Complete playable model:

```json
{
  "id": "jp_naval_fighter_1930",
  "nation": "JPN",
  "name": "JPN 1930 fighter",
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
    "combat_radius_km": 324
  },
  "notes": "Representative 1930 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN 1930 strike — `jp_naval_strike_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | strike | 2 | 58 | 416 |

Complete playable model:

```json
{
  "id": "jp_naval_strike_1930",
  "nation": "JPN",
  "name": "JPN 1930 strike",
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
    "combat_radius_km": 416
  },
  "notes": "Representative 1930 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN 1930 scout — `jp_naval_scout_1930`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | scout | 2 | 50 | 457 |

Complete playable model:

```json
{
  "id": "jp_naval_scout_1930",
  "nation": "JPN",
  "name": "JPN 1930 scout",
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
    "combat_radius_km": 457
  },
  "notes": "Representative 1930 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### JPN naval fighter · 1933 — `jp_naval_fighter_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | fighter | 1 | 44 | 359 |

Complete playable model:

```json
{
  "id": "jp_naval_fighter_1933",
  "nation": "JPN",
  "name": "JPN naval fighter · 1933",
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
    "combat_radius_km": 359
  },
  "notes": "Representative 1933 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN carrier strike aircraft · 1933 — `jp_naval_strike_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | strike | 3 | 63 | 461 |

Complete playable model:

```json
{
  "id": "jp_naval_strike_1933",
  "nation": "JPN",
  "name": "JPN carrier strike aircraft · 1933",
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
    "combat_radius_km": 461
  },
  "notes": "Representative 1933 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN observation floatplane · 1933 — `jp_naval_scout_1933`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1933 | scout | 2 | 55 | 509 |

Complete playable model:

```json
{
  "id": "jp_naval_scout_1933",
  "nation": "JPN",
  "name": "JPN observation floatplane · 1933",
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
    "combat_radius_km": 509
  },
  "notes": "Representative 1933 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### JPN 1936 fighter — `jp_naval_fighter_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | fighter | 1 | 48 | 394 |

Complete playable model:

```json
{
  "id": "jp_naval_fighter_1936",
  "nation": "JPN",
  "name": "JPN 1936 fighter",
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
    "combat_radius_km": 394
  },
  "notes": "Representative 1936 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN 1936 strike — `jp_naval_strike_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | strike | 3 | 68 | 506 |

Complete playable model:

```json
{
  "id": "jp_naval_strike_1936",
  "nation": "JPN",
  "name": "JPN 1936 strike",
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
    "combat_radius_km": 506
  },
  "notes": "Representative 1936 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN 1936 scout — `jp_naval_scout_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | scout | 2 | 60 | 561 |

Complete playable model:

```json
{
  "id": "jp_naval_scout_1936",
  "nation": "JPN",
  "name": "JPN 1936 scout",
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
    "combat_radius_km": 561
  },
  "notes": "Representative 1936 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### JPN naval fighter · 1939 — `jp_naval_fighter_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | fighter | 1 | 52 | 429 |

Complete playable model:

```json
{
  "id": "jp_naval_fighter_1939",
  "nation": "JPN",
  "name": "JPN naval fighter · 1939",
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
    "combat_radius_km": 429
  },
  "notes": "Representative 1939 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN carrier strike aircraft · 1939 — `jp_naval_strike_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | strike | 3 | 73 | 551 |

Complete playable model:

```json
{
  "id": "jp_naval_strike_1939",
  "nation": "JPN",
  "name": "JPN carrier strike aircraft · 1939",
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
    "combat_radius_km": 551
  },
  "notes": "Representative 1939 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN observation floatplane · 1939 — `jp_naval_scout_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | scout | 2 | 65 | 613 |

Complete playable model:

```json
{
  "id": "jp_naval_scout_1939",
  "nation": "JPN",
  "name": "JPN observation floatplane · 1939",
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
    "combat_radius_km": 613
  },
  "notes": "Representative 1939 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### JPN 1942 fighter — `jp_naval_fighter_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | fighter | 1 | 55 | 464 |

Complete playable model:

```json
{
  "id": "jp_naval_fighter_1942",
  "nation": "JPN",
  "name": "JPN 1942 fighter",
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
    "combat_radius_km": 464
  },
  "notes": "Representative 1942 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN 1942 strike — `jp_naval_strike_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | strike | 3 | 78 | 597 |

Complete playable model:

```json
{
  "id": "jp_naval_strike_1942",
  "nation": "JPN",
  "name": "JPN 1942 strike",
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
    "combat_radius_km": 597
  },
  "notes": "Representative 1942 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN 1942 scout — `jp_naval_scout_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | scout | 2 | 70 | 665 |

Complete playable model:

```json
{
  "id": "jp_naval_scout_1942",
  "nation": "JPN",
  "name": "JPN 1942 scout",
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
    "combat_radius_km": 665
  },
  "notes": "Representative 1942 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### JPN naval fighter · 1945 — `jp_naval_fighter_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | fighter | 1 | 59 | 498 |

Complete playable model:

```json
{
  "id": "jp_naval_fighter_1945",
  "nation": "JPN",
  "name": "JPN naval fighter · 1945",
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
    "combat_radius_km": 498
  },
  "notes": "Representative 1945 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN carrier strike aircraft · 1945 — `jp_naval_strike_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | strike | 3 | 82 | 642 |

Complete playable model:

```json
{
  "id": "jp_naval_strike_1945",
  "nation": "JPN",
  "name": "JPN carrier strike aircraft · 1945",
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
    "combat_radius_km": 642
  },
  "notes": "Representative 1945 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN observation floatplane · 1945 — `jp_naval_scout_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | scout | 2 | 74 | 718 |

Complete playable model:

```json
{
  "id": "jp_naval_scout_1945",
  "nation": "JPN",
  "name": "JPN observation floatplane · 1945",
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
    "combat_radius_km": 718
  },
  "notes": "Representative 1945 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### JPN naval fighter · 1948 — `jp_naval_fighter_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | fighter | 1 | 62 | 533 |

Complete playable model:

```json
{
  "id": "jp_naval_fighter_1948",
  "nation": "JPN",
  "name": "JPN naval fighter · 1948",
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
    "combat_radius_km": 533
  },
  "notes": "Representative 1948 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN carrier strike aircraft · 1948 — `jp_naval_strike_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | strike | 3 | 87 | 687 |

Complete playable model:

```json
{
  "id": "jp_naval_strike_1948",
  "nation": "JPN",
  "name": "JPN carrier strike aircraft · 1948",
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
    "combat_radius_km": 687
  },
  "notes": "Representative 1948 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### JPN observation floatplane · 1948 — `jp_naval_scout_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | scout | 2 | 79 | 770 |

Complete playable model:

```json
{
  "id": "jp_naval_scout_1948",
  "nation": "JPN",
  "name": "JPN observation floatplane · 1948",
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
    "combat_radius_km": 770
  },
  "notes": "Representative 1948 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
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

### Fleet depot · 1922 — `jp_depot_1922`

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

### Fleet oiler · 1922 — `jp_oiler_1922`

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

### Fleet depot · 1932 — `jp_depot_1932`

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

### Fleet oiler · 1932 — `jp_oiler_1932`

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

### Fleet depot · 1942 — `jp_depot_1942`

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

### Fleet oiler · 1942 — `jp_oiler_1942`

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
