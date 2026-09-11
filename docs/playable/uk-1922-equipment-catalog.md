# United Kingdom — The Treaty System — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1922-02-06.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.0. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/uk.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1922-02-06. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is Scapa Flow.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| Tarawa | 0 | None | 0 | 0 |
| Portsmouth | 60 | 15 Sopwith Camel (fighter); 7 Fairey IIID (scout); 14 Blackburn Dart (strike) | 36 | 720 |
| Rosyth | 60 | 15 Sopwith Camel (fighter); 7 Fairey IIID (scout); 14 Blackburn Dart (strike) | 36 | 720 |
| Scapa Flow | 30 | 8 Sopwith Camel (fighter); 4 Fairey IIID (scout); 6 Blackburn Dart (strike) | 18 | 360 |
| Gibraltar | 60 | 15 Sopwith Camel (fighter); 7 Fairey IIID (scout); 14 Blackburn Dart (strike) | 36 | 720 |
| Alexandria | 30 | 8 Sopwith Camel (fighter); 4 Fairey IIID (scout); 6 Blackburn Dart (strike) | 18 | 360 |
| Singapore | 4 | 2 Sopwith Camel (fighter) | 2 | 48 |
| Freetown station | 4 | 2 Sopwith Camel (fighter) | 2 | 48 |
| Ascension anchorage | 0 | None | 0 | 0 |
| Simon’s Town | 60 | 15 Sopwith Camel (fighter); 7 Fairey IIID (scout); 14 Blackburn Dart (strike) | 36 | 720 |
| Durban station | 30 | 8 Sopwith Camel (fighter); 4 Fairey IIID (scout); 6 Blackburn Dart (strike) | 18 | 360 |
| Mauritius station | 4 | 2 Sopwith Camel (fighter) | 2 | 48 |
| Chagos anchorage | 0 | None | 0 | 0 |
| Trincomalee | 30 | 8 Sopwith Camel (fighter); 4 Fairey IIID (scout); 6 Blackburn Dart (strike) | 18 | 360 |
| Fremantle | 30 | 8 Sopwith Camel (fighter); 4 Fairey IIID (scout); 6 Blackburn Dart (strike) | 18 | 360 |
| Malta / Valletta | 60 | 15 Sopwith Camel (fighter); 7 Fairey IIID (scout); 14 Blackburn Dart (strike) | 36 | 720 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

### Sopwith Camel — `gbr_early_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | fighter | 1 | 30 | 220 |

Complete playable model:

```json
{
  "id": "gbr_early_fighter",
  "nation": "GBR",
  "name": "Sopwith Camel",
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

### Blackburn Dart — `gbr_early_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | strike | 2 | 35 | 220 |

Complete playable model:

```json
{
  "id": "gbr_early_strike",
  "nation": "GBR",
  "name": "Blackburn Dart",
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

### Fairey IIID — `gbr_early_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1921 | scout | 2 | 35 | 220 |

Complete playable model:

```json
{
  "id": "gbr_early_scout",
  "nation": "GBR",
  "name": "Fairey IIID",
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

### GBR 1930 fighter — `gbr_standard_1930_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "gbr_standard_1930_fighter",
  "nation": "GBR",
  "name": "GBR 1930 fighter",
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

### GBR 1930 strike — `gbr_standard_1930_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "gbr_standard_1930_strike",
  "nation": "GBR",
  "name": "GBR 1930 strike",
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

### GBR 1930 scout — `gbr_standard_1930_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "gbr_standard_1930_scout",
  "nation": "GBR",
  "name": "GBR 1930 scout",
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

### GBR 1936 fighter — `gbr_standard_1936_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "gbr_standard_1936_fighter",
  "nation": "GBR",
  "name": "GBR 1936 fighter",
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

### GBR 1936 strike — `gbr_standard_1936_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "gbr_standard_1936_strike",
  "nation": "GBR",
  "name": "GBR 1936 strike",
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

### GBR 1936 scout — `gbr_standard_1936_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "gbr_standard_1936_scout",
  "nation": "GBR",
  "name": "GBR 1936 scout",
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

### GBR 1942 fighter — `gbr_standard_1942_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "gbr_standard_1942_fighter",
  "nation": "GBR",
  "name": "GBR 1942 fighter",
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

### GBR 1942 strike — `gbr_standard_1942_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "gbr_standard_1942_strike",
  "nation": "GBR",
  "name": "GBR 1942 strike",
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

### GBR 1942 scout — `gbr_standard_1942_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "gbr_standard_1942_scout",
  "nation": "GBR",
  "name": "GBR 1942 scout",
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

### Courageous carrier conversion — `courageous_1922_cv`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 120,
      "count": 16
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
    "speed_kn": 30,
    "range_nm": 6000
  },
  "protection": {
    "belt_mm": 76,
    "deck_mm": 19
  },
  "sensors": []
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

### Fleet depot · 1936 — `uk_depot_1936`

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

### Fleet oiler · 1936 — `uk_oiler_1936`

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

### Fleet depot · 1950 — `uk_depot_1950`

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

### Fleet oiler · 1950 — `uk_oiler_1950`

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
