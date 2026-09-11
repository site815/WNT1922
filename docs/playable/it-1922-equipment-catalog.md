# Italy — The Treaty System — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1922-02-06.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.2. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/it.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1922-02-06. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is Taranto.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| La Spezia | 60 | 15 Macchi M.7 (fighter); 7 Macchi M.5 (scout); 14 Savoia S.16 (strike) | 36 | 720 |
| Taranto | 60 | 15 Macchi M.7 (fighter); 7 Macchi M.5 (scout); 14 Savoia S.16 (strike) | 36 | 720 |
| Tobruk | 4 | 2 Macchi M.7 (fighter) | 2 | 48 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

### Macchi M.7 — `ita_early_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | fighter | 1 | 30 | 220 |

Complete playable model:

```json
{
  "id": "ita_early_fighter",
  "nation": "ITA",
  "name": "Macchi M.7",
  "type_year": 1921,
  "role": "fighter",
  "crew": {
    "normal": 1
  },
  "cost_gold": 30,
  "weights": {
    "empty_kg": 1050
  },
  "fuel": {
    "combat_radius_km": 220
  },
  "notes": "Period role and crew; production cost and combat-radius fit are provisional game estimates."
}
```

### Savoia S.16 — `ita_early_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | strike | 2 | 35 | 220 |

Complete playable model:

```json
{
  "id": "ita_early_strike",
  "nation": "ITA",
  "name": "Savoia S.16",
  "type_year": 1921,
  "role": "strike",
  "crew": {
    "normal": 2
  },
  "cost_gold": 35,
  "weights": {
    "empty_kg": 1300
  },
  "fuel": {
    "combat_radius_km": 220
  },
  "notes": "Period role and crew; production cost and combat-radius fit are provisional game estimates."
}
```

### Macchi M.5 — `ita_early_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | scout | 2 | 35 | 220 |

Complete playable model:

```json
{
  "id": "ita_early_scout",
  "nation": "ITA",
  "name": "Macchi M.5",
  "type_year": 1921,
  "role": "scout",
  "crew": {
    "normal": 2
  },
  "cost_gold": 35,
  "weights": {
    "empty_kg": 1300
  },
  "fuel": {
    "combat_radius_km": 220
  },
  "notes": "Period role and crew; production cost and combat-radius fit are provisional game estimates."
}
```

### ITA 1930 fighter — `ita_standard_1930_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "ita_standard_1930_fighter",
  "nation": "ITA",
  "name": "ITA 1930 fighter",
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

### ITA 1930 strike — `ita_standard_1930_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "ita_standard_1930_strike",
  "nation": "ITA",
  "name": "ITA 1930 strike",
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

### ITA 1930 scout — `ita_standard_1930_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "ita_standard_1930_scout",
  "nation": "ITA",
  "name": "ITA 1930 scout",
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

### ITA 1936 fighter — `ita_standard_1936_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "ita_standard_1936_fighter",
  "nation": "ITA",
  "name": "ITA 1936 fighter",
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

### ITA 1936 strike — `ita_standard_1936_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "ita_standard_1936_strike",
  "nation": "ITA",
  "name": "ITA 1936 strike",
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

### ITA 1936 scout — `ita_standard_1936_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "ita_standard_1936_scout",
  "nation": "ITA",
  "name": "ITA 1936 scout",
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

### ITA 1942 fighter — `ita_standard_1942_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "ita_standard_1942_fighter",
  "nation": "ITA",
  "name": "ITA 1942 fighter",
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

### ITA 1942 strike — `ita_standard_1942_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "ita_standard_1942_strike",
  "nation": "ITA",
  "name": "ITA 1942 strike",
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

### ITA 1942 scout — `ita_standard_1942_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "ita_standard_1942_scout",
  "nation": "ITA",
  "name": "ITA 1942 scout",
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

### Dante Alighieri — `dante_alighieri`

```json
{
  "armament": {
    "main_battery": {
      "count": 12,
      "caliber_in": 12,
      "mounts": "4x3",
      "notes": "First triple turrets on any dreadnought"
    },
    "secondary_battery": [
      {
        "count": 20,
        "caliber_in": 4.7,
        "mounts": "casemate/turret"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 22,
    "shp": 32000,
    "range_nm": 4800,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 254,
    "deck_mm": 38,
    "turret_mm": 254,
    "torpedo_defense": 0
  }
}
```

### Conte di Cavour class — `conte_di_cavour`

```json
{
  "armament": {
    "main_battery": {
      "count": 13,
      "caliber_in": 12,
      "mounts": "3x3+2x2"
    },
    "secondary_battery": [
      {
        "count": 18,
        "caliber_in": 4.7,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 21.5,
    "shp": 31000,
    "range_nm": 4800,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 250,
    "deck_mm": 40,
    "turret_mm": 280,
    "torpedo_defense": 0
  }
}
```

### Andrea Doria class — `andrea_doria`

```json
{
  "armament": {
    "main_battery": {
      "count": 13,
      "caliber_in": 12,
      "mounts": "3x3+2x2"
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
    "speed_kn": 21,
    "shp": 30000,
    "range_nm": 4800,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 250,
    "deck_mm": 40,
    "turret_mm": 280,
    "torpedo_defense": 0
  }
}
```

### Francesco Caracciolo class (suspended) — `caracciolo`

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
        "caliber_in": 6,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 28,
    "shp": 105000,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 303,
    "deck_mm": 50,
    "turret_mm": 400,
    "torpedo_defense": 1
  }
}
```

### San Giorgio class — `san_giorgio`

```json
{
  "armament": {
    "main_battery": {
      "count": 4,
      "caliber_in": 10,
      "mounts": "2x2"
    },
    "secondary_battery": [
      {
        "count": 8,
        "caliber_in": 7.5,
        "mounts": "4x2"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 23,
    "shp": 18000,
    "range_nm": 6270,
    "range_at_kn": 10,
    "fuel": "coal"
  },
  "protection": {
    "belt_mm": 200,
    "deck_mm": 45
  }
}
```

### Quarto / Bixio scouts — `quarto`

```json
{
  "armament": {
    "main_battery": {
      "count": 6,
      "caliber_in": 4.7,
      "mounts": "single"
    },
    "torpedo_tubes": {
      "count": 2,
      "caliber_in": 17.7,
      "submerged": false
    }
  },
  "propulsion": {
    "speed_kn": 28,
    "shp": 25000,
    "range_nm": 2300,
    "range_at_kn": 15,
    "fuel": "mixed"
  },
  "protection": {
    "deck_mm": 38
  }
}
```

### Leone class (esploratori) — `leone`

```json
{
  "armament": {
    "main_battery": {
      "count": 8,
      "caliber_in": 4.7,
      "mounts": "4x2"
    },
    "torpedo_tubes": {
      "count": 6,
      "caliber_in": 17.7,
      "submerged": false
    }
  },
  "propulsion": {
    "speed_kn": 33,
    "shp": 42000,
    "range_nm": 2070,
    "range_at_kn": 15,
    "fuel": "oil"
  }
}
```

### Curtatone class — `curtatone`

```json
{
  "armament": {
    "main_battery": {
      "count": 4,
      "caliber_in": 4,
      "mounts": "2x2"
    },
    "torpedo_tubes": {
      "count": 6,
      "caliber_in": 17.7,
      "submerged": false
    }
  },
  "propulsion": {
    "speed_kn": 32,
    "shp": 22000,
    "range_nm": 1800,
    "range_at_kn": 15,
    "fuel": "oil"
  }
}
```

### Palestro class — `palestro`

```json
{
  "armament": {
    "main_battery": {
      "count": 4,
      "caliber_in": 4,
      "mounts": "2x2"
    },
    "torpedo_tubes": {
      "count": 4,
      "caliber_in": 17.7,
      "submerged": false
    }
  },
  "propulsion": {
    "speed_kn": 32,
    "shp": 22000,
    "range_nm": 1970,
    "range_at_kn": 15,
    "fuel": "oil"
  }
}
```

### Provana class — `provana`

```json
{
  "armament": {
    "main_battery": {
      "count": 2,
      "caliber_in": 3,
      "mounts": "deck"
    },
    "torpedo_tubes": {
      "count": 6,
      "caliber_in": 17.7,
      "submerged": true
    }
  },
  "propulsion": {
    "speed_kn": 16,
    "range_nm": 2100,
    "range_at_kn": 10,
    "fuel": "diesel"
  }
}
```

### Italy standard freighter 1922 — `it_merchant_1922`

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

### Italy standard freighter 1936 — `it_merchant_1936`

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

### Italy standard freighter 1948 — `it_merchant_1948`

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

### Fleet depot · 1922 — `it_depot_1922`

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

### Fleet oiler · 1922 — `it_oiler_1922`

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

### Fleet depot · 1932 — `it_depot_1932`

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

### Fleet oiler · 1932 — `it_oiler_1932`

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

### Fleet depot · 1942 — `it_depot_1942`

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

### Fleet oiler · 1942 — `it_oiler_1942`

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
