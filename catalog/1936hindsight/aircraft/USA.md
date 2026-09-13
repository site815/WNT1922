# United States — naval aircraft

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
[
  {
    "id": "us_naval_fighter_1933",
    "nation": "USA",
    "name": "F1 carrier fighter",
    "type_year": 1933,
    "role": "fighter",
    "catalogKind": "naval",
    "generation": 1933,
    "basing": {
      "carrier": true,
      "floatplane": false,
      "land": true
    },
    "crew": {
      "normal": 1
    },
    "cost_gold": 44,
    "weights": {
      "empty_kg": 2020
    },
    "performance": {
      "speed_kmh": {
        "cruise": 261
      }
    },
    "fuel": {
      "combat_radius_km": 352
    },
    "notes": "Opening naval procurement design for this alternate-history program. Performance and costs are rounded game values. Later naval aircraft must be commissioned through the aircraft designer.",
    "designated": true
  },
  {
    "id": "us_naval_scout_1936",
    "nation": "USA",
    "name": "O1 observation floatplane",
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
      "combat_radius_km": 548
    },
    "notes": "Opening naval procurement design for this alternate-history program. Performance and costs are rounded game values. Later naval aircraft must be commissioned through the aircraft designer.",
    "designated": true
  }
]
```
