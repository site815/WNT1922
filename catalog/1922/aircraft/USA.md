# United States — naval aircraft

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
[
  {
    "id": "us_naval_fighter_1921",
    "nation": "USA",
    "name": "Vought VE-7",
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
  },
  {
    "id": "us_naval_strike_1921",
    "nation": "USA",
    "name": "Douglas DT",
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
  },
  {
    "id": "us_naval_scout_1921",
    "nation": "USA",
    "name": "Curtiss F",
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
]
```
