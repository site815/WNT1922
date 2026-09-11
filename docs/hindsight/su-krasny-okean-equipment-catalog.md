# Soviet Union — In Good Faith — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1936-01-01.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.1. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/su.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1936-01-01. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is Kronstadt / Leningrad.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| Kronstadt / Leningrad | 60 | 15 Krasny Okean 1936 fighter (fighter); 7 Krasny Okean 1936 scout (scout); 14 Krasny Okean 1936 strike (strike) | 36 | 720 |
| Sevastopol | 60 | 15 Krasny Okean 1936 fighter (fighter); 7 Krasny Okean 1936 scout (scout); 14 Krasny Okean 1936 strike (strike) | 36 | 720 |
| Vladivostok | 30 | 8 Krasny Okean 1936 fighter (fighter); 4 Krasny Okean 1936 scout (scout); 6 Krasny Okean 1936 strike (strike) | 18 | 360 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

### Krasny Okean 1930 fighter — `sov_program_1930_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "sov_program_1930_fighter",
  "nation": "SOV",
  "name": "Krasny Okean 1930 fighter",
  "type_year": 1930,
  "role": "fighter",
  "crew": {
    "normal": 1
  },
  "cost_gold": 50,
  "weights": {
    "empty_kg": 2200
  },
  "fuel": {
    "combat_radius_km": 400
  },
  "notes": "Period role and crew; production cost and combat-radius fit are provisional game estimates."
}
```

### Krasny Okean 1930 strike — `sov_program_1930_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "sov_program_1930_strike",
  "nation": "SOV",
  "name": "Krasny Okean 1930 strike",
  "type_year": 1930,
  "role": "strike",
  "crew": {
    "normal": 2
  },
  "cost_gold": 60,
  "weights": {
    "empty_kg": 2800
  },
  "fuel": {
    "combat_radius_km": 400
  },
  "notes": "Period role and crew; production cost and combat-radius fit are provisional game estimates."
}
```

### Krasny Okean 1930 scout — `sov_program_1930_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "sov_program_1930_scout",
  "nation": "SOV",
  "name": "Krasny Okean 1930 scout",
  "type_year": 1930,
  "role": "scout",
  "crew": {
    "normal": 2
  },
  "cost_gold": 60,
  "weights": {
    "empty_kg": 2800
  },
  "fuel": {
    "combat_radius_km": 400
  },
  "notes": "Period role and crew; production cost and combat-radius fit are provisional game estimates."
}
```

### Krasny Okean 1936 fighter — `sov_program_1936_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "sov_program_1936_fighter",
  "nation": "SOV",
  "name": "Krasny Okean 1936 fighter",
  "type_year": 1936,
  "role": "fighter",
  "crew": {
    "normal": 1
  },
  "cost_gold": 50,
  "weights": {
    "empty_kg": 2200
  },
  "fuel": {
    "combat_radius_km": 400
  },
  "notes": "Period role and crew; production cost and combat-radius fit are provisional game estimates."
}
```

### Krasny Okean 1936 strike — `sov_program_1936_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "sov_program_1936_strike",
  "nation": "SOV",
  "name": "Krasny Okean 1936 strike",
  "type_year": 1936,
  "role": "strike",
  "crew": {
    "normal": 2
  },
  "cost_gold": 60,
  "weights": {
    "empty_kg": 2800
  },
  "fuel": {
    "combat_radius_km": 400
  },
  "notes": "Period role and crew; production cost and combat-radius fit are provisional game estimates."
}
```

### Krasny Okean 1936 scout — `sov_program_1936_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "sov_program_1936_scout",
  "nation": "SOV",
  "name": "Krasny Okean 1936 scout",
  "type_year": 1936,
  "role": "scout",
  "crew": {
    "normal": 2
  },
  "cost_gold": 60,
  "weights": {
    "empty_kg": 2800
  },
  "fuel": {
    "combat_radius_km": 400
  },
  "notes": "Period role and crew; production cost and combat-radius fit are provisional game estimates."
}
```

### Krasny Okean 1942 fighter — `sov_program_1942_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "sov_program_1942_fighter",
  "nation": "SOV",
  "name": "Krasny Okean 1942 fighter",
  "type_year": 1942,
  "role": "fighter",
  "crew": {
    "normal": 1
  },
  "cost_gold": 50,
  "weights": {
    "empty_kg": 2200
  },
  "fuel": {
    "combat_radius_km": 400
  },
  "notes": "Period role and crew; production cost and combat-radius fit are provisional game estimates."
}
```

### Krasny Okean 1942 strike — `sov_program_1942_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "sov_program_1942_strike",
  "nation": "SOV",
  "name": "Krasny Okean 1942 strike",
  "type_year": 1942,
  "role": "strike",
  "crew": {
    "normal": 2
  },
  "cost_gold": 60,
  "weights": {
    "empty_kg": 2800
  },
  "fuel": {
    "combat_radius_km": 400
  },
  "notes": "Period role and crew; production cost and combat-radius fit are provisional game estimates."
}
```

### Krasny Okean 1942 scout — `sov_program_1942_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "sov_program_1942_scout",
  "nation": "SOV",
  "name": "Krasny Okean 1942 scout",
  "type_year": 1942,
  "role": "scout",
  "crew": {
    "normal": 2
  },
  "cost_gold": 60,
  "weights": {
    "empty_kg": 2800
  },
  "fuel": {
    "combat_radius_km": 400
  },
  "notes": "Period role and crew; production cost and combat-radius fit are provisional game estimates."
}
```

## Referenced equipment

Original equipment generations retain their original national catalog as owner. New sonar sets are conservative, provisional 1930 active-sonar fits; no radar capability is implied.

### `su30snr` — Krasny Okean active sonar

```json
{
  "name": "Krasny Okean active sonar",
  "nation": "SOV",
  "year": 1930,
  "family": "snr",
  "interface": "hull_sonar",
  "range_km": 1.8,
  "notes": "Provisional contemporary active sonar fit; no radar or advanced depth solution."
}
```

## Literal weapons and machinery

Classes using literal fits carry their complete weapon, protection and machinery input here. They are not unresolvable equipment SKUs.

### Sevastopol class — `sevastopol_1914`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 305,
      "count": 12
    },
    "torpedo_tubes": {
      "count": 4
    },
    "aa_battery": [
      {
        "caliber_mm": 40,
        "count": 2
      }
    ]
  },
  "propulsion": {
    "speed_kn": 23,
    "range_nm": 6000
  },
  "protection": {
    "belt_mm": 225,
    "deck_mm": 56
  },
  "sensors": []
}
```

### Svetlana class — `svetlana_1913`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 130,
      "count": 15
    },
    "torpedo_tubes": {
      "count": 4
    },
    "aa_battery": [
      {
        "caliber_mm": 40,
        "count": 2
      }
    ]
  },
  "propulsion": {
    "speed_kn": 29,
    "range_nm": 6000
  },
  "protection": {
    "belt_mm": 75,
    "deck_mm": 19
  },
  "sensors": []
}
```

### Novik type destroyer — `novik_series`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 102,
      "count": 4
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
    "speed_kn": 32,
    "range_nm": 2200
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  },
  "sensors": []
}
```

### Bars class submarine — `bars_1915`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 75,
      "count": 1
    },
    "torpedo_tubes": {
      "count": 4
    },
    "aa_battery": [
      {
        "caliber_mm": 40,
        "count": 2
      }
    ]
  },
  "propulsion": {
    "speed_kn": 18,
    "range_nm": 3500
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  },
  "sensors": []
}
```

### Pallada class (Aurora) — `aurora_1903`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 152,
      "count": 8
    },
    "torpedo_tubes": {
      "count": 3
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
    "range_nm": 6000
  },
  "protection": {
    "belt_mm": 38,
    "deck_mm": 10
  },
  "sensors": []
}
```

### Sovetskaya Respublika battleship — `ocean_bb28`

```json
{
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
  "propulsion": {
    "speed_kn": 27,
    "range_nm": 6500
  },
  "protection": {
    "belt_mm": 320,
    "deck_mm": 80
  },
  "sensors": []
}
```

### Krasny Okean carrier — `ocean_cv30`

```json
{
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
  "propulsion": {
    "speed_kn": 30,
    "range_nm": 6500
  },
  "protection": {
    "belt_mm": 75,
    "deck_mm": 19
  },
  "sensors": []
}
```

### Kirov ocean cruiser — `ocean_cl29`

```json
{
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
  "propulsion": {
    "speed_kn": 33,
    "range_nm": 7000
  },
  "protection": {
    "belt_mm": 100,
    "deck_mm": 25
  },
  "sensors": []
}
```

### Shtorm escort destroyer — `ocean_dd30`

```json
{
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
  "propulsion": {
    "speed_kn": 35,
    "range_nm": 6000
  },
  "protection": {
    "belt_mm": 15,
    "deck_mm": 4
  },
  "sensors": [
    "su30snr"
  ]
}
```

### Okean patrol submarine — `ocean_ss29`

```json
{
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
  "propulsion": {
    "speed_kn": 19,
    "range_nm": 8500
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  },
  "sensors": []
}
```

### Sovetsky Soyuz battleship — `ocean_bb34`

```json
{
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
  "propulsion": {
    "speed_kn": 29,
    "range_nm": 8000
  },
  "protection": {
    "belt_mm": 375,
    "deck_mm": 94
  },
  "sensors": []
}
```

### Sovetskaya Aviatsiya carrier — `ocean_cv38`

```json
{
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
  "propulsion": {
    "speed_kn": 32,
    "range_nm": 8500
  },
  "protection": {
    "belt_mm": 100,
    "deck_mm": 25
  },
  "sensors": []
}
```

### Krasny Okean fleet oiler — `sov_program_oiler`

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

### Soviet Union standard freighter 1922 — `su_merchant_1922`

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

### Soviet Union standard freighter 1936 — `su_merchant_1936`

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

### Soviet Union standard freighter 1948 — `su_merchant_1948`

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

### Fleet depot · 1922 — `su_depot_1922`

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

### Fleet oiler · 1922 — `su_oiler_1922`

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

### Fleet depot · 1936 — `su_depot_1936`

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

### Fleet oiler · 1936 — `su_oiler_1936`

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

### Fleet depot · 1950 — `su_depot_1950`

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

### Fleet oiler · 1950 — `su_oiler_1950`

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
