# France — In Good Faith — equipment and aircraft catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** equipment and aircraft catalog summary for 1936-01-01.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.2. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/fr.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1936-01-01. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## Opening shore establishment

Provisional allocation: 60% of port aircraft slots, rounded down; only models available at the campaign date. These are game opening strengths, not a verified historical squadron register. [Rules and sources](../base-aviation.md). The warehouse is Toulon.

| Base | Aircraft slots | Stationed models and roles | Fully crewed aircraft | Aviation stores (sortie units) |
|---|---:|---|---:|---:|
| Brest | 60 | 15 La Revanche de l'École 1936 fighter (fighter); 7 La Revanche de l'École 1936 scout (scout); 14 La Revanche de l'École 1936 strike (strike) | 36 | 720 |
| Toulon | 60 | 15 La Revanche de l'École 1936 fighter (fighter); 7 La Revanche de l'École 1936 scout (scout); 14 La Revanche de l'École 1936 strike (strike) | 36 | 720 |
| Dakar | 30 | 8 La Revanche de l'École 1936 fighter (fighter); 4 La Revanche de l'École 1936 scout (scout); 6 La Revanche de l'École 1936 strike (strike) | 18 | 360 |

## Aircraft models

Aircraft are national stores; every owned aircraft needs its full aircrew. Figures below are the exact game inputs. Generic role aircraft and procurement figures are provisional estimates, not claims of historical aircraft variants.

### La Revanche de l'École 1930 fighter — `fra_program_1930_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "fra_program_1930_fighter",
  "nation": "FRA",
  "name": "La Revanche de l'École 1930 fighter",
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

### La Revanche de l'École 1930 strike — `fra_program_1930_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "fra_program_1930_strike",
  "nation": "FRA",
  "name": "La Revanche de l'École 1930 strike",
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

### La Revanche de l'École 1930 scout — `fra_program_1930_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1930 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "fra_program_1930_scout",
  "nation": "FRA",
  "name": "La Revanche de l'École 1930 scout",
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

### La Revanche de l'École 1936 fighter — `fra_program_1936_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "fra_program_1936_fighter",
  "nation": "FRA",
  "name": "La Revanche de l'École 1936 fighter",
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

### La Revanche de l'École 1936 strike — `fra_program_1936_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "fra_program_1936_strike",
  "nation": "FRA",
  "name": "La Revanche de l'École 1936 strike",
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

### La Revanche de l'École 1936 scout — `fra_program_1936_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1936 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "fra_program_1936_scout",
  "nation": "FRA",
  "name": "La Revanche de l'École 1936 scout",
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

### La Revanche de l'École 1942 fighter — `fra_program_1942_fighter`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | fighter | 1 | 50 | 400 |

Complete playable model:

```json
{
  "id": "fra_program_1942_fighter",
  "nation": "FRA",
  "name": "La Revanche de l'École 1942 fighter",
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

### La Revanche de l'École 1942 strike — `fra_program_1942_strike`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | strike | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "fra_program_1942_strike",
  "nation": "FRA",
  "name": "La Revanche de l'École 1942 strike",
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

### La Revanche de l'École 1942 scout — `fra_program_1942_scout`

| Year | Role | Crew | Price (gold) | Combat radius (km) |
|---:|---|---:|---:|---:|
| 1942 | scout | 2 | 60 | 400 |

Complete playable model:

```json
{
  "id": "fra_program_1942_scout",
  "nation": "FRA",
  "name": "La Revanche de l'École 1942 scout",
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

### `fr30snr` — La Revanche de l'École active sonar

```json
{
  "name": "La Revanche de l'École active sonar",
  "nation": "FRA",
  "year": 1930,
  "family": "snr",
  "interface": "hull_sonar",
  "range_km": 1.8,
  "notes": "Provisional contemporary active sonar fit; no radar or advanced depth solution."
}
```

## Literal weapons and machinery

Classes using literal fits carry their complete weapon, protection and machinery input here. They are not unresolvable equipment SKUs.

### Courbet class — `courbet`

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
        "count": 22,
        "caliber_in": 5.5,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 21,
    "shp": 28000,
    "range_nm": 4200,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 270,
    "deck_mm": 70,
    "turret_mm": 290,
    "torpedo_defense": 0
  }
}
```

### Bretagne class — `bretagne`

```json
{
  "armament": {
    "main_battery": {
      "count": 10,
      "caliber_in": 13.4,
      "mounts": "5x2"
    },
    "secondary_battery": [
      {
        "count": 22,
        "caliber_in": 5.5,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 20,
    "shp": 29000,
    "range_nm": 4700,
    "range_at_kn": 10,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 270,
    "deck_mm": 70,
    "turret_mm": 340,
    "torpedo_defense": 0
  }
}
```

### Normandie class (suspended) — `normandie`

```json
{
  "armament": {
    "main_battery": {
      "count": 12,
      "caliber_in": 13.4,
      "mounts": "3x4",
      "notes": "First quadruple turrets"
    },
    "secondary_battery": [
      {
        "count": 24,
        "caliber_in": 5.5,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 21,
    "shp": 32000,
    "range_nm": 6500,
    "range_at_kn": 12,
    "fuel": "mixed"
  },
  "protection": {
    "belt_mm": 300,
    "deck_mm": 70,
    "turret_mm": 340,
    "torpedo_defense": 1
  }
}
```

### Bearn (carrier conversion) — `bearn_cv`

```json
{
  "armament": {
    "secondary_battery": [
      {
        "count": 8,
        "caliber_in": 6.1,
        "mounts": "casemate"
      }
    ]
  },
  "propulsion": {
    "speed_kn": 21.5,
    "shp": 37500,
    "range_nm": 7000,
    "range_at_kn": 10,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 83,
    "deck_mm": 25
  }
}
```

### Edgar Quinet class — `edgar_quinet`

```json
{
  "armament": {
    "main_battery": {
      "count": 14,
      "caliber_in": 7.6,
      "mounts": "twin/casemate"
    }
  },
  "propulsion": {
    "speed_kn": 23,
    "shp": 36000,
    "range_nm": 5100,
    "range_at_kn": 10,
    "fuel": "coal"
  },
  "protection": {
    "belt_mm": 150,
    "deck_mm": 65
  }
}
```

### Duguay-Trouin class — `duguay_trouin`

```json
{
  "armament": {
    "main_battery": {
      "count": 8,
      "caliber_in": 6.1,
      "mounts": "4x2"
    },
    "torpedo_tubes": {
      "count": 12,
      "caliber_in": 21.7,
      "submerged": false
    }
  },
  "propulsion": {
    "speed_kn": 33,
    "shp": 100000,
    "range_nm": 4500,
    "range_at_kn": 15,
    "fuel": "oil"
  },
  "protection": {
    "belt_mm": 20,
    "deck_mm": 20
  }
}
```

### Arabe class — `arabe`

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
      "caliber_in": 17.7,
      "submerged": false
    }
  },
  "propulsion": {
    "speed_kn": 33,
    "shp": 17500,
    "range_nm": 2000,
    "range_at_kn": 14,
    "fuel": "oil"
  }
}
```

### Chacal class (contre-torpilleur) — `chacal`

```json
{
  "armament": {
    "main_battery": {
      "count": 5,
      "caliber_in": 5.1,
      "mounts": "single"
    },
    "torpedo_tubes": {
      "count": 6,
      "caliber_in": 21.7,
      "submerged": false
    }
  },
  "propulsion": {
    "speed_kn": 35.5,
    "shp": 50000,
    "range_nm": 3000,
    "range_at_kn": 15,
    "fuel": "oil"
  }
}
```

### Lagrange class — `lagrange`

```json
{
  "armament": {
    "main_battery": {
      "count": 2,
      "caliber_in": 3,
      "mounts": "deck"
    },
    "torpedo_tubes": {
      "count": 8,
      "caliber_in": 17.7,
      "submerged": true
    }
  },
  "propulsion": {
    "speed_kn": 16.5,
    "range_nm": 4300,
    "range_at_kn": 10,
    "fuel": "diesel"
  }
}
```

### Requin class — `requin`

```json
{
  "armament": {
    "main_battery": {
      "count": 1,
      "caliber_in": 3.9,
      "mounts": "deck"
    },
    "torpedo_tubes": {
      "count": 10,
      "caliber_in": 21.7,
      "submerged": true
    }
  },
  "propulsion": {
    "speed_kn": 15,
    "range_nm": 7700,
    "range_at_kn": 9,
    "fuel": "diesel"
  }
}
```

### École ocean submarine — `ecole_ss28`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 100,
      "count": 1
    },
    "torpedo_tubes": {
      "count": 8
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
    "range_nm": 9000
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  },
  "sensors": []
}
```

### Vengeur torpedo destroyer — `ecole_dd30`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 138,
      "count": 5
    },
    "torpedo_tubes": {
      "count": 12
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
    "range_nm": 5000
  },
  "protection": {
    "belt_mm": 12,
    "deck_mm": 3
  },
  "sensors": [
    "fr30snr"
  ]
}
```

### Éclaireur fast cruiser — `ecole_cl29`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 152,
      "count": 9
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
    "speed_kn": 35,
    "range_nm": 7500
  },
  "protection": {
    "belt_mm": 80,
    "deck_mm": 20
  },
  "sensors": []
}
```

### Liberté carrier — `ecole_cv31`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 130,
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
    "speed_kn": 31,
    "range_nm": 7000
  },
  "protection": {
    "belt_mm": 65,
    "deck_mm": 16
  },
  "sensors": []
}
```

### École submarine, 1937 — `ecole_ss37`

```json
{
  "armament": {
    "main_battery": {
      "caliber_mm": 100,
      "count": 1
    },
    "torpedo_tubes": {
      "count": 10
    },
    "aa_battery": [
      {
        "caliber_mm": 40,
        "count": 8
      }
    ]
  },
  "propulsion": {
    "speed_kn": 20,
    "range_nm": 11000
  },
  "protection": {
    "belt_mm": 0,
    "deck_mm": 0
  },
  "sensors": []
}
```

### La Revanche de l'École fleet oiler — `fra_program_oiler`

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

### France standard freighter 1922 — `fr_merchant_1922`

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

### France standard freighter 1936 — `fr_merchant_1936`

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

### France standard freighter 1948 — `fr_merchant_1948`

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

### Fleet depot · 1922 — `fr_depot_1922`

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

### Fleet oiler · 1922 — `fr_oiler_1922`

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

### Fleet depot · 1932 — `fr_depot_1932`

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

### Fleet oiler · 1932 — `fr_oiler_1932`

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

### Fleet depot · 1942 — `fr_depot_1942`

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

### Fleet oiler · 1942 — `fr_oiler_1942`

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
