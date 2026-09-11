# Japan — The Treaty System — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1922-02-06.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.2. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/jp.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

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

### Mitsubishi 1MF — `jpn_early_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | fighter | 1 | 30 | 220 |

Complete playable model:

```json
{
  "id": "jpn_early_fighter",
  "nation": "JPN",
  "name": "Mitsubishi 1MF",
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

### Mitsubishi 1MT — `jpn_early_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | strike | 2 | 35 | 220 |

Complete playable model:

```json
{
  "id": "jpn_early_strike",
  "nation": "JPN",
  "name": "Mitsubishi 1MT",
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

### Yokosuka Ro-go — `jpn_early_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | scout | 2 | 35 | 220 |

Complete playable model:

```json
{
  "id": "jpn_early_scout",
  "nation": "JPN",
  "name": "Yokosuka Ro-go",
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

### JPN 1930 fighter — `jpn_standard_1930_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "jpn_standard_1930_fighter",
  "nation": "JPN",
  "name": "JPN 1930 fighter",
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

### JPN 1930 strike — `jpn_standard_1930_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "jpn_standard_1930_strike",
  "nation": "JPN",
  "name": "JPN 1930 strike",
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

### JPN 1930 scout — `jpn_standard_1930_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "jpn_standard_1930_scout",
  "nation": "JPN",
  "name": "JPN 1930 scout",
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

### JPN 1936 fighter — `jpn_standard_1936_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "jpn_standard_1936_fighter",
  "nation": "JPN",
  "name": "JPN 1936 fighter",
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

### JPN 1936 strike — `jpn_standard_1936_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "jpn_standard_1936_strike",
  "nation": "JPN",
  "name": "JPN 1936 strike",
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

### JPN 1936 scout — `jpn_standard_1936_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "jpn_standard_1936_scout",
  "nation": "JPN",
  "name": "JPN 1936 scout",
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

### JPN 1942 fighter — `jpn_standard_1942_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "jpn_standard_1942_fighter",
  "nation": "JPN",
  "name": "JPN 1942 fighter",
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

### JPN 1942 strike — `jpn_standard_1942_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "jpn_standard_1942_strike",
  "nation": "JPN",
  "name": "JPN 1942 strike",
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

### JPN 1942 scout — `jpn_standard_1942_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "jpn_standard_1942_scout",
  "nation": "JPN",
  "name": "JPN 1942 scout",
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
