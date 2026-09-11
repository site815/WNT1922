# Italy — In Good Faith — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1936-01-01.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.0. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/it.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1936-01-01. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is Taranto.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| La Spezia | 60 | 15 Mare Nostrum 1936 fighter (fighter); 7 Mare Nostrum 1936 scout (scout); 14 Mare Nostrum 1936 strike (strike) | 36 | 720 |
| Taranto | 60 | 15 Mare Nostrum 1936 fighter (fighter); 7 Mare Nostrum 1936 scout (scout); 14 Mare Nostrum 1936 strike (strike) | 36 | 720 |
| Tobruk | 4 | 2 Mare Nostrum 1936 fighter (fighter) | 2 | 48 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

### Mare Nostrum 1930 fighter — `ita_program_1930_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "ita_program_1930_fighter",
  "nation": "ITA",
  "name": "Mare Nostrum 1930 fighter",
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

### Mare Nostrum 1930 strike — `ita_program_1930_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "ita_program_1930_strike",
  "nation": "ITA",
  "name": "Mare Nostrum 1930 strike",
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

### Mare Nostrum 1930 scout — `ita_program_1930_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "ita_program_1930_scout",
  "nation": "ITA",
  "name": "Mare Nostrum 1930 scout",
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

### Mare Nostrum 1936 fighter — `ita_program_1936_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "ita_program_1936_fighter",
  "nation": "ITA",
  "name": "Mare Nostrum 1936 fighter",
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

### Mare Nostrum 1936 strike — `ita_program_1936_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "ita_program_1936_strike",
  "nation": "ITA",
  "name": "Mare Nostrum 1936 strike",
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

### Mare Nostrum 1936 scout — `ita_program_1936_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "ita_program_1936_scout",
  "nation": "ITA",
  "name": "Mare Nostrum 1936 scout",
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

### Mare Nostrum 1942 fighter — `ita_program_1942_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "ita_program_1942_fighter",
  "nation": "ITA",
  "name": "Mare Nostrum 1942 fighter",
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

### Mare Nostrum 1942 strike — `ita_program_1942_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "ita_program_1942_strike",
  "nation": "ITA",
  "name": "Mare Nostrum 1942 strike",
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

### Mare Nostrum 1942 scout — `ita_program_1942_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "ita_program_1942_scout",
  "nation": "ITA",
  "name": "Mare Nostrum 1942 scout",
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

### `it30snr` — Mare Nostrum active sonar

```json
{
  "name": "Mare Nostrum active sonar",
  "nation": "ITA",
  "year": 1930,
  "family": "snr",
  "interface": "hull_sonar",
  "range_km": 1.8,
  "notes": "Provisional contemporary active sonar fit; no radar or advanced depth solution."
}
```

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

### Italia fast battleship — `mare_bb29`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 381,
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
    "speed_kn": 29,
    "range_nm": 5500
  },
  "protection": {
    "belt_mm": 320,
    "deck_mm": 80
  },
  "sensors": []
}
```

### Mediterraneo cruiser — `mare_ca30`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 203,
      "count": 8
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
    "speed_kn": 34,
    "range_nm": 5000
  },
  "protection": {
    "belt_mm": 140,
    "deck_mm": 35
  },
  "sensors": []
}
```

### Lampo torpedo destroyer — `mare_dd31`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 120,
      "count": 6
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
    "speed_kn": 37,
    "range_nm": 3500
  },
  "protection": {
    "belt_mm": 15,
    "deck_mm": 4
  },
  "sensors": [
    "it30snr"
  ]
}
```

### Sparviero fleet carrier — `mare_cv32`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 120,
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
    "speed_kn": 30,
    "range_nm": 5000
  },
  "protection": {
    "belt_mm": 60,
    "deck_mm": 15
  },
  "sensors": []
}
```

### Tirreno submarine — `mare_ss28`

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
    "speed_kn": 18,
    "range_nm": 6500
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  },
  "sensors": []
}
```

### Impero improved battleship — `mare_bb38`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 381,
      "count": 9
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
    "range_nm": 6000
  },
  "protection": {
    "belt_mm": 350,
    "deck_mm": 88
  },
  "sensors": []
}
```

### Mare Nostrum fleet oiler — `ita_program_oiler`

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

### Fleet depot · 1936 — `it_depot_1936`

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

### Fleet oiler · 1936 — `it_oiler_1936`

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

### Fleet depot · 1950 — `it_depot_1950`

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

### Fleet oiler · 1950 — `it_oiler_1950`

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
