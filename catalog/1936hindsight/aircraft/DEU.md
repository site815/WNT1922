# Germany — naval aircraft

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
[
  {
    "id": "de_naval_fighter_1936",
    "nation": "DEU",
    "name": "DEU naval fighter · 1936",
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
      "combat_radius_km": 393
    },
    "notes": "Opening naval procurement design for this alternate-history program. Performance and costs are rounded game values. Later naval aircraft must be commissioned through the aircraft designer.",
    "designated": true
  },
  {
    "id": "de_naval_strike_1936",
    "nation": "DEU",
    "name": "DEU carrier strike aircraft · 1936",
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
      "combat_radius_km": 504
    },
    "notes": "Opening naval procurement design for this alternate-history program. Performance and costs are rounded game values. Later naval aircraft must be commissioned through the aircraft designer.",
    "designated": true
  },
  {
    "id": "de_naval_scout_1936",
    "nation": "DEU",
    "name": "DEU observation floatplane · 1936",
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
      "combat_radius_km": 559
    },
    "notes": "Opening naval procurement design for this alternate-history program. Performance and costs are rounded game values. Later naval aircraft must be commissioned through the aircraft designer.",
    "designated": true
  }
]
```
