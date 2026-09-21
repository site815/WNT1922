# Italy — naval aircraft

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
[
  {
    "id": "it_naval_fighter_1921",
    "nation": "ITA",
    "name": "Macchi M.7",
    "type_year": 1921,
    "role": "fighter",
    "catalogKind": "naval",
    "generation": 1921,
    "basing": {
      "carrier": false,
      "floatplane": true,
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
    "notes": "Representative 1921 procurement fit; performance and costs are provisional. Single-seat Macchi M.7 pusher flying boat, documented by NACA TM712 and Flygvapenmuseum. Waterborne aircraft handled through the game seaplane station or shore base; cannot operate from a wheeled carrier deck."
  },
  {
    "id": "it_naval_strike_1921",
    "nation": "ITA",
    "name": "Savoia S.16",
    "type_year": 1921,
    "role": "strike",
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
    "notes": "Representative 1921 procurement fit; performance and costs are provisional. Savoia S.16 pusher flying boat, documented by the historical three-view in Queensland Museum's Thomas Macleod collection. Two-person naval mission crew in the multi-place airframe. Waterborne aircraft handled through the game seaplane station or shore base; cannot operate from a wheeled carrier deck."
  },
  {
    "id": "it_naval_scout_1921",
    "nation": "ITA",
    "name": "Macchi M.5",
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
      "normal": 1
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
    "notes": "Representative 1921 procurement fit; performance and costs are provisional. Historical single-seat pusher flying-boat fighter used in the game scout role; the US Navy's 1917-1919 chronology identifies the M.5 as single-seat. Waterborne aircraft handled through the game seaplane station or shore base; cannot land on a wheeled carrier deck."
  }
]
```
