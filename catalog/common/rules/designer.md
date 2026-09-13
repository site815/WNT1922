# designer — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
{
  "DESIGN_ROLES": {
    "BB": "Battleship",
    "BC": "Battlecruiser",
    "CV": "Carrier",
    "CA": "Heavy cruiser",
    "CL": "Light cruiser",
    "DD": "Destroyer",
    "SS": "Submarine",
    "AO": "Fleet support ship"
  },
  "SHIP_FEATURES": {
    "sonar": {
      "label": "Hydrophones / sonar",
      "year": 1922
    },
    "radar": {
      "label": "Search radar",
      "year": 1939
    },
    "director": {
      "label": "Director fire control",
      "year": 1922
    },
    "bulges": {
      "label": "Torpedo protection",
      "year": 1922
    },
    "catapult": {
      "label": "Floatplane catapult",
      "year": 1922
    },
    "damage_control": {
      "label": "Redundant pumps and fire mains",
      "year": 1922
    }
  }
}
```
