# France — naval aircraft

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
[
  {
    "id": "fr_naval_fighter_1936",
    "nation": "FRA",
    "name": "La Revanche de l'École 1936 fighter",
    "type_year": 1936,
    "role": "fighter",
    "catalogKind": "naval",
    "generation": 1936,
    "basing": {
      "carrier": true,
      "floatplane": false,
      "land": true
    },
    "crew": {
      "normal": 1
    },
    "cost_gold": 48,
    "weights": {
      "empty_kg": 2275
    },
    "performance": {
      "speed_kmh": {
        "cruise": 285
      }
    },
    "fuel": {
      "combat_radius_km": 370
    },
    "notes": "Opening naval procurement design for this alternate-history program. Performance and costs are rounded game values. Later naval aircraft must be commissioned through the aircraft designer.",
    "designated": true
  },
  {
    "id": "fr_naval_strike_1936",
    "nation": "FRA",
    "name": "La Revanche de l'École 1936 strike",
    "type_year": 1936,
    "role": "strike",
    "catalogKind": "naval",
    "generation": 1936,
    "basing": {
      "carrier": true,
      "floatplane": false,
      "land": true
    },
    "crew": {
      "normal": 3
    },
    "cost_gold": 68,
    "weights": {
      "empty_kg": 3550
    },
    "performance": {
      "speed_kmh": {
        "cruise": 235
      }
    },
    "fuel": {
      "combat_radius_km": 475
    },
    "notes": "Opening naval procurement design for this alternate-history program. Performance and costs are rounded game values. Later naval aircraft must be commissioned through the aircraft designer.",
    "designated": true
  },
  {
    "id": "fr_naval_scout_1936",
    "nation": "FRA",
    "name": "La Revanche de l'École 1936 scout",
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
      "combat_radius_km": 525
    },
    "notes": "Opening naval procurement design for this alternate-history program. Performance and costs are rounded game values. Later naval aircraft must be commissioned through the aircraft designer.",
    "designated": true
  }
]
```
