# Germany — The Treaty System — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1922-02-06.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.19.0. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/de.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1922-02-06. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is Wilhelmshaven.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| Kiel | 60 | None | 0 | 720 |
| Wilhelmshaven | 60 | None | 0 | 720 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

Other-service shore establishments fill up to 25% of base slots. They own separate aircraft and aircrews, replace losses at home monthly, and use physical ferry/merchant reinforcements. Naval base allocation is limited to the other 75%. [Operational air rules](../operational-air-warfare.md).

- Kiel: No other-service maritime aircraft
- Wilhelmshaven: No other-service maritime aircraft

### DEU 1936 fighter — `de_naval_fighter_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | fighter | 1 | 48 | 393 |

Complete playable model:

```json
{
  "id": "de_naval_fighter_1936",
  "nation": "DEU",
  "name": "DEU 1936 fighter",
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
    "combat_radius_km": 393
  },
  "notes": "Representative 1936 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### DEU 1936 strike — `de_naval_strike_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | strike | 3 | 68 | 504 |

Complete playable model:

```json
{
  "id": "de_naval_strike_1936",
  "nation": "DEU",
  "name": "DEU 1936 strike",
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
    "combat_radius_km": 504
  },
  "notes": "Representative 1936 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### DEU 1936 scout — `de_naval_scout_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | scout | 2 | 60 | 559 |

Complete playable model:

```json
{
  "id": "de_naval_scout_1936",
  "nation": "DEU",
  "name": "DEU 1936 scout",
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
    "combat_radius_km": 559
  },
  "notes": "Representative 1936 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### DEU naval fighter · 1939 — `de_naval_fighter_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | fighter | 1 | 52 | 427 |

Complete playable model:

```json
{
  "id": "de_naval_fighter_1939",
  "nation": "DEU",
  "name": "DEU naval fighter · 1939",
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
    "combat_radius_km": 427
  },
  "notes": "Representative 1939 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### DEU carrier strike aircraft · 1939 — `de_naval_strike_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | strike | 3 | 73 | 549 |

Complete playable model:

```json
{
  "id": "de_naval_strike_1939",
  "nation": "DEU",
  "name": "DEU carrier strike aircraft · 1939",
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
    "combat_radius_km": 549
  },
  "notes": "Representative 1939 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### DEU observation floatplane · 1939 — `de_naval_scout_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | scout | 2 | 65 | 611 |

Complete playable model:

```json
{
  "id": "de_naval_scout_1939",
  "nation": "DEU",
  "name": "DEU observation floatplane · 1939",
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
    "combat_radius_km": 611
  },
  "notes": "Representative 1939 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### DEU 1942 fighter — `de_naval_fighter_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | fighter | 1 | 55 | 462 |

Complete playable model:

```json
{
  "id": "de_naval_fighter_1942",
  "nation": "DEU",
  "name": "DEU 1942 fighter",
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
    "combat_radius_km": 462
  },
  "notes": "Representative 1942 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### DEU 1942 strike — `de_naval_strike_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | strike | 3 | 78 | 594 |

Complete playable model:

```json
{
  "id": "de_naval_strike_1942",
  "nation": "DEU",
  "name": "DEU 1942 strike",
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
    "combat_radius_km": 594
  },
  "notes": "Representative 1942 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### DEU 1942 scout — `de_naval_scout_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | scout | 2 | 70 | 662 |

Complete playable model:

```json
{
  "id": "de_naval_scout_1942",
  "nation": "DEU",
  "name": "DEU 1942 scout",
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
    "combat_radius_km": 662
  },
  "notes": "Representative 1942 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### DEU naval fighter · 1945 — `de_naval_fighter_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | fighter | 1 | 59 | 496 |

Complete playable model:

```json
{
  "id": "de_naval_fighter_1945",
  "nation": "DEU",
  "name": "DEU naval fighter · 1945",
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
    "combat_radius_km": 496
  },
  "notes": "Representative 1945 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### DEU carrier strike aircraft · 1945 — `de_naval_strike_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | strike | 3 | 82 | 639 |

Complete playable model:

```json
{
  "id": "de_naval_strike_1945",
  "nation": "DEU",
  "name": "DEU carrier strike aircraft · 1945",
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
    "combat_radius_km": 639
  },
  "notes": "Representative 1945 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### DEU observation floatplane · 1945 — `de_naval_scout_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | scout | 2 | 74 | 714 |

Complete playable model:

```json
{
  "id": "de_naval_scout_1945",
  "nation": "DEU",
  "name": "DEU observation floatplane · 1945",
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
    "combat_radius_km": 714
  },
  "notes": "Representative 1945 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### DEU naval fighter · 1948 — `de_naval_fighter_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | fighter | 1 | 62 | 531 |

Complete playable model:

```json
{
  "id": "de_naval_fighter_1948",
  "nation": "DEU",
  "name": "DEU naval fighter · 1948",
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
    "combat_radius_km": 531
  },
  "notes": "Representative 1948 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### DEU carrier strike aircraft · 1948 — `de_naval_strike_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | strike | 3 | 87 | 684 |

Complete playable model:

```json
{
  "id": "de_naval_strike_1948",
  "nation": "DEU",
  "name": "DEU carrier strike aircraft · 1948",
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
    "combat_radius_km": 684
  },
  "notes": "Representative 1948 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station."
}
```

### DEU observation floatplane · 1948 — `de_naval_scout_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | scout | 2 | 79 | 766 |

Complete playable model:

```json
{
  "id": "de_naval_scout_1948",
  "nation": "DEU",
  "name": "DEU observation floatplane · 1948",
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
    "combat_radius_km": 766
  },
  "notes": "Representative 1948 treaty-era procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. Catapult/recovered floatplane; cannot land on a carrier deck."
}
```

### DEU long-range maritime patrol · 1936 — `de_shore_patrol_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | maritime_patrol | 7 | Government managed | 1121 |

Complete playable model:

```json
{
  "id": "de_shore_patrol_1936",
  "nation": "DEU",
  "name": "DEU long-range maritime patrol · 1936",
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
    "combat_radius_km": 1121
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### DEU twin-engine maritime bomber · 1936 — `de_shore_torpedo_1936`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | maritime_strike | 5 | Government managed | 765 |

Complete playable model:

```json
{
  "id": "de_shore_torpedo_1936",
  "nation": "DEU",
  "name": "DEU twin-engine maritime bomber · 1936",
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
    "combat_radius_km": 765
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### DEU long-range maritime patrol · 1939 — `de_shore_patrol_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | maritime_patrol | 7 | Government managed | 1242 |

Complete playable model:

```json
{
  "id": "de_shore_patrol_1939",
  "nation": "DEU",
  "name": "DEU long-range maritime patrol · 1939",
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
    "combat_radius_km": 1242
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### DEU twin-engine maritime bomber · 1939 — `de_shore_torpedo_1939`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1939 | maritime_strike | 5 | Government managed | 844 |

Complete playable model:

```json
{
  "id": "de_shore_torpedo_1939",
  "nation": "DEU",
  "name": "DEU twin-engine maritime bomber · 1939",
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
    "combat_radius_km": 844
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### DEU long-range maritime patrol · 1942 — `de_shore_patrol_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | maritime_patrol | 7 | Government managed | 1363 |

Complete playable model:

```json
{
  "id": "de_shore_patrol_1942",
  "nation": "DEU",
  "name": "DEU long-range maritime patrol · 1942",
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
    "combat_radius_km": 1363
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### DEU long-range maritime strike · 1942 — `de_shore_torpedo_1942`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | maritime_strike | 5 | Government managed | 923 |

Complete playable model:

```json
{
  "id": "de_shore_torpedo_1942",
  "nation": "DEU",
  "name": "DEU long-range maritime strike · 1942",
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
    "combat_radius_km": 923
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### DEU long-range maritime patrol · 1945 — `de_shore_patrol_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | maritime_patrol | 7 | Government managed | 1483 |

Complete playable model:

```json
{
  "id": "de_shore_patrol_1945",
  "nation": "DEU",
  "name": "DEU long-range maritime patrol · 1945",
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
    "combat_radius_km": 1483
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### DEU long-range maritime strike · 1945 — `de_shore_torpedo_1945`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1945 | maritime_strike | 5 | Government managed | 1003 |

Complete playable model:

```json
{
  "id": "de_shore_torpedo_1945",
  "nation": "DEU",
  "name": "DEU long-range maritime strike · 1945",
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
    "combat_radius_km": 1003
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### DEU long-range maritime patrol · 1948 — `de_shore_patrol_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | maritime_patrol | 7 | Government managed | 1604 |

Complete playable model:

```json
{
  "id": "de_shore_patrol_1948",
  "nation": "DEU",
  "name": "DEU long-range maritime patrol · 1948",
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
    "combat_radius_km": 1604
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

### DEU long-range maritime strike · 1948 — `de_shore_torpedo_1948`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1948 | maritime_strike | 5 | Government managed | 1082 |

Complete playable model:

```json
{
  "id": "de_shore_torpedo_1948",
  "nation": "DEU",
  "name": "DEU long-range maritime strike · 1948",
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
    "combat_radius_km": 1082
  },
  "notes": "Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type."
}
```

## Referenced equipment

Original equipment generations retain their original national catalog as owner. New sonar sets are conservative, provisional 1930 active-sonar fits; no radar capability is implied.

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

### Fleet depot · 1932 — `de_depot_1932`

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

### Fleet oiler · 1932 — `de_oiler_1932`

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

### Fleet depot · 1942 — `de_depot_1942`

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

### Fleet oiler · 1942 — `de_oiler_1942`

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
