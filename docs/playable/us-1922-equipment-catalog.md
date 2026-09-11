# United States — The Treaty System — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1922-02-06.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.1. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/us.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1922-02-06. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is San Diego.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| Midway | 0 | None | 0 | 0 |
| Wake Island | 0 | None | 0 | 0 |
| Manila / Cavite | 16 | 4 Vought VE-7 (fighter); 2 Curtiss F (scout); 3 Douglas DT (strike) | 9 | 192 |
| Mare Island / San Francisco | 60 | 15 Vought VE-7 (fighter); 7 Curtiss F (scout); 14 Douglas DT (strike) | 36 | 720 |
| Puget Sound | 60 | 15 Vought VE-7 (fighter); 7 Curtiss F (scout); 14 Douglas DT (strike) | 36 | 720 |
| San Diego | 8 | 2 Vought VE-7 (fighter); 1 Curtiss F (scout); 1 Douglas DT (strike) | 4 | 96 |
| Norfolk | 60 | 15 Vought VE-7 (fighter); 7 Curtiss F (scout); 14 Douglas DT (strike) | 36 | 720 |
| Pearl Harbor | 12 | 4 Vought VE-7 (fighter); 1 Curtiss F (scout); 2 Douglas DT (strike) | 7 | 144 |
| Guam / Apra Harbor | 0 | None | 0 | 0 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

### Vought VE-7 — `usa_early_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | fighter | 1 | 30 | 220 |

Complete playable model:

```json
{
  "id": "usa_early_fighter",
  "nation": "USA",
  "name": "Vought VE-7",
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

### Douglas DT — `usa_early_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | strike | 2 | 35 | 220 |

Complete playable model:

```json
{
  "id": "usa_early_strike",
  "nation": "USA",
  "name": "Douglas DT",
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

### Curtiss F — `usa_early_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | scout | 2 | 35 | 220 |

Complete playable model:

```json
{
  "id": "usa_early_scout",
  "nation": "USA",
  "name": "Curtiss F",
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

### USA 1930 fighter — `usa_standard_1930_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "usa_standard_1930_fighter",
  "nation": "USA",
  "name": "USA 1930 fighter",
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

### USA 1930 strike — `usa_standard_1930_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "usa_standard_1930_strike",
  "nation": "USA",
  "name": "USA 1930 strike",
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

### USA 1930 scout — `usa_standard_1930_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "usa_standard_1930_scout",
  "nation": "USA",
  "name": "USA 1930 scout",
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

### USA 1936 fighter — `usa_standard_1936_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "usa_standard_1936_fighter",
  "nation": "USA",
  "name": "USA 1936 fighter",
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

### USA 1936 strike — `usa_standard_1936_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "usa_standard_1936_strike",
  "nation": "USA",
  "name": "USA 1936 strike",
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

### USA 1936 scout — `usa_standard_1936_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "usa_standard_1936_scout",
  "nation": "USA",
  "name": "USA 1936 scout",
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

### USA 1942 fighter — `usa_standard_1942_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "usa_standard_1942_fighter",
  "nation": "USA",
  "name": "USA 1942 fighter",
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

### USA 1942 strike — `usa_standard_1942_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "usa_standard_1942_strike",
  "nation": "USA",
  "name": "USA 1942 strike",
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

### USA 1942 scout — `usa_standard_1942_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "usa_standard_1942_scout",
  "nation": "USA",
  "name": "USA 1942 scout",
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

### Delaware class — `delaware`

```json
{
  "armament": {
    "main_battery": {
      "count": 10,
      "caliber_in": 12,
      "mounts": "5x2"
    },
    "secondary_battery": [
      {
        "count": 14,
        "caliber_in": 5,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 21,
    "shp": 25000,
    "range_nm": 6000,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 280,
    "deck_mm": 51,
    "turret_mm": 305,
    "torpedo_defense": 0
  }
}
```

### Florida class — `florida`

```json
{
  "armament": {
    "main_battery": {
      "count": 10,
      "caliber_in": 12,
      "mounts": "5x2"
    },
    "secondary_battery": [
      {
        "count": 16,
        "caliber_in": 5,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 20.75,
    "shp": 28000,
    "range_nm": 5776,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 280,
    "deck_mm": 51,
    "turret_mm": 305,
    "torpedo_defense": 0
  }
}
```

### Wyoming class — `wyoming`

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
        "count": 16,
        "caliber_in": 5,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 20.5,
    "shp": 28000,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 280,
    "deck_mm": 51,
    "turret_mm": 305,
    "torpedo_defense": 1
  }
}
```

### New York class — `new_york`

```json
{
  "armament": {
    "main_battery": {
      "count": 10,
      "caliber_in": 14,
      "mounts": "5x2"
    },
    "secondary_battery": [
      {
        "count": 16,
        "caliber_in": 5,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 21,
    "shp": 28100,
    "range_nm": 7060,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 305,
    "deck_mm": 51,
    "turret_mm": 356,
    "torpedo_defense": 1
  }
}
```

### Nevada class — `nevada`

```json
{
  "armament": {
    "main_battery": {
      "count": 10,
      "caliber_in": 14,
      "mounts": "2x3+2x2"
    },
    "secondary_battery": [
      {
        "count": 12,
        "caliber_in": 5,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 20.5,
    "shp": 26500,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 343,
    "deck_mm": 76,
    "turret_mm": 406,
    "torpedo_defense": 2
  }
}
```

### Pennsylvania class — `pennsylvania`

```json
{
  "armament": {
    "main_battery": {
      "count": 12,
      "caliber_in": 14,
      "mounts": "4x3"
    },
    "secondary_battery": [
      {
        "count": 14,
        "caliber_in": 5,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 21,
    "shp": 31500,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 343,
    "deck_mm": 76,
    "turret_mm": 457,
    "torpedo_defense": 2
  }
}
```

### New Mexico class — `new_mexico`

```json
{
  "armament": {
    "main_battery": {
      "count": 12,
      "caliber_in": 14,
      "mounts": "4x3"
    },
    "secondary_battery": [
      {
        "count": 14,
        "caliber_in": 5,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 21,
    "shp": 32000,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 343,
    "deck_mm": 89,
    "turret_mm": 457,
    "torpedo_defense": 2
  }
}
```

### Tennessee class — `tennessee`

```json
{
  "armament": {
    "main_battery": {
      "count": 12,
      "caliber_in": 14,
      "mounts": "4x3"
    },
    "secondary_battery": [
      {
        "count": 14,
        "caliber_in": 5,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 21,
    "shp": 26800,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 343,
    "deck_mm": 89,
    "turret_mm": 457,
    "torpedo_defense": 3
  }
}
```

### Colorado class — `colorado`

```json
{
  "armament": {
    "main_battery": {
      "count": 8,
      "caliber_in": 16,
      "mounts": "4x2"
    },
    "secondary_battery": [
      {
        "count": 12,
        "caliber_in": 5,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 21,
    "shp": 28900,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 343,
    "deck_mm": 89,
    "turret_mm": 457,
    "torpedo_defense": 3
  }
}
```

### South Dakota class (1920, canceled) — `south_dakota_1920`

```json
{
  "armament": {
    "main_battery": {
      "count": 12,
      "caliber_in": 16,
      "mounts": "4x3"
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
    "speed_kn": 23,
    "shp": 60000,
    "range_nm": 8000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 343,
    "deck_mm": 89,
    "turret_mm": 457,
    "torpedo_defense": 3
  }
}
```

### Lexington class (battlecruiser) — `lexington_cc`

```json
{
  "armament": {
    "main_battery": {
      "count": 8,
      "caliber_in": 16,
      "mounts": "4x2"
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
    "speed_kn": 33.25,
    "shp": 180000,
    "range_nm": 10000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 178,
    "deck_mm": 57,
    "turret_mm": 279,
    "torpedo_defense": 2
  }
}
```

### Lexington class (carrier conversion) — `lexington_cv`

```json
{
  "armament": {
    "secondary_battery": [
      {
        "count": 8,
        "caliber_in": 8,
        "mounts": "4x2"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 33.25,
    "shp": 180000,
    "range_nm": 10000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 178,
    "deck_mm": 51
  }
}
```

### Langley — `langley`

```json
{
  "propulsion": {
    "speed_kn": 15,
    "shp": 7200,
    "range_nm": 3500,
    "range_at_kn": 10,
    "fuel": "oil"
  }
}
```

### Omaha class — `omaha`

```json
{
  "armament": {
    "main_battery": {
      "count": 12,
      "caliber_in": 6,
      "mounts": "2x2+8 casemate"
    },
    "torpedo_tubes": {
      "count": 10,
      "caliber_in": 21,
      "submerged": false
    }
  },
  "propulsion": {
    "speed_kn": 34,
    "shp": 90000,
    "range_nm": 9000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 76,
    "deck_mm": 38
  }
}
```

### Clemson class — `clemson`

```json
{
  "armament": {
    "main_battery": {
      "count": 4,
      "caliber_in": 4,
      "mounts": "single"
    },
    "torpedo_tubes": {
      "count": 12,
      "caliber_in": 21,
      "submerged": false
    }
  },
  "propulsion": {
    "speed_kn": 35,
    "shp": 27600,
    "range_nm": 4900,
    "range_at_kn": 15,
    "fuel": "oil"
  }
}
```

### Wickes class — `wickes`

```json
{
  "armament": {
    "main_battery": {
      "count": 4,
      "caliber_in": 4,
      "mounts": "single"
    },
    "torpedo_tubes": {
      "count": 12,
      "caliber_in": 21,
      "submerged": false
    }
  },
  "propulsion": {
    "speed_kn": 35,
    "shp": 24610,
    "range_nm": 3800,
    "range_at_kn": 15,
    "fuel": "oil"
  }
}
```

### S-boat class — `s_class_ss_usn`

```json
{
  "armament": {
    "main_battery": {
      "count": 1,
      "caliber_in": 4,
      "mounts": "deck"
    },
    "torpedo_tubes": {
      "count": 4,
      "caliber_in": 21,
      "submerged": true
    }
  },
  "propulsion": {
    "speed_kn": 14.5,
    "range_nm": 5000,
    "range_at_kn": 10,
    "fuel": "diesel"
  }
}
```

### United States standard freighter 1922 — `us_merchant_1922`

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

### United States standard freighter 1936 — `us_merchant_1936`

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

### United States standard freighter 1948 — `us_merchant_1948`

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

### Fleet depot · 1922 — `us_depot_1922`

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

### Fleet oiler · 1922 — `us_oiler_1922`

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

### Fleet depot · 1936 — `us_depot_1936`

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

### Fleet oiler · 1936 — `us_oiler_1936`

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

### Fleet depot · 1950 — `us_depot_1950`

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

### Fleet oiler · 1950 — `us_oiler_1950`

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
