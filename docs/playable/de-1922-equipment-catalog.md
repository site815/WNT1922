# Germany — The Treaty System — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1922-02-06.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.1. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/de.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1922-02-06. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is Wilhelmshaven.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| Kiel | 60 | None | 0 | 720 |
| Wilhelmshaven | 60 | None | 0 | 720 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

### Heinkel He 51 naval evaluation — `deu_early_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1935 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "deu_early_fighter",
  "nation": "DEU",
  "name": "Heinkel He 51 naval evaluation",
  "type_year": 1935,
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

### Heinkel He 59 — `deu_early_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1935 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "deu_early_strike",
  "nation": "DEU",
  "name": "Heinkel He 59",
  "type_year": 1935,
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

### Heinkel He 60 — `deu_early_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1935 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "deu_early_scout",
  "nation": "DEU",
  "name": "Heinkel He 60",
  "type_year": 1935,
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

### DEU 1936 fighter — `deu_standard_1936_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "deu_standard_1936_fighter",
  "nation": "DEU",
  "name": "DEU 1936 fighter",
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

### DEU 1936 strike — `deu_standard_1936_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "deu_standard_1936_strike",
  "nation": "DEU",
  "name": "DEU 1936 strike",
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

### DEU 1936 scout — `deu_standard_1936_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "deu_standard_1936_scout",
  "nation": "DEU",
  "name": "DEU 1936 scout",
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

### DEU 1942 fighter — `deu_standard_1942_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "deu_standard_1942_fighter",
  "nation": "DEU",
  "name": "DEU 1942 fighter",
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

### DEU 1942 strike — `deu_standard_1942_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "deu_standard_1942_strike",
  "nation": "DEU",
  "name": "DEU 1942 strike",
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

### DEU 1942 scout — `deu_standard_1942_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "deu_standard_1942_scout",
  "nation": "DEU",
  "name": "DEU 1942 scout",
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
