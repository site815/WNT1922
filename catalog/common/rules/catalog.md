# Ship classifications and strategic priorities

Edit the JSON block directly. This document is read by the game; no export is required.

```json game-data
{
  "REGIONS": {
    "atlantic": {
      "name": "North Atlantic",
      "short": "Atlantic",
      "x": 34,
      "y": 29,
      "distance": 6500
    },
    "mediterranean": {
      "name": "Mediterranean",
      "short": "Mediterranean",
      "x": 50,
      "y": 46,
      "distance": 3500
    },
    "indian": {
      "name": "Indian Ocean",
      "short": "Indian Ocean",
      "x": 66,
      "y": 70,
      "distance": 9500
    },
    "pacific": {
      "name": "Western Pacific",
      "short": "Pacific",
      "x": 85,
      "y": 42,
      "distance": 9000
    }
  },
  "NATION_ORDER": [
    "GBR",
    "USA",
    "JPN",
    "FRA",
    "ITA",
    "DEU",
    "SOV"
  ],
  "PRIORITIES": {
    "anchorage": {
      "name": "Raid anchorage",
      "description": "Strike enemy ships at anchor with aircraft or surface weapons, then withdraw to replenish. Admirals select a reachable enemy harbor.",
      "search": 1.2,
      "engagement": 0.03,
      "supply": 0.85
    },
    "siege": {
      "name": "Siege port",
      "description": "Sustain bombardment of an enemy supply base, suppress its defenses and disrupt repairs. Admirals withdraw when damage, escorts or endurance require it.",
      "search": 0.8,
      "engagement": 0.1,
      "supply": 0.8
    },
    "guard": {
      "name": "Protect trade",
      "description": "Admirals escort supply routes and avoid unequal battles.",
      "engagement": 0.22,
      "supply": 1.12
    },
    "presence": {
      "name": "Forward presence",
      "description": "Admirals contest sea lanes and intercept comparable forces.",
      "engagement": 0.5,
      "supply": 0.98
    },
    "raid": {
      "name": "Disrupt enemy trade",
      "description": "Submarines and cruisers hunt shipping; heavy ships cover their withdrawal.",
      "engagement": 0.38,
      "supply": 0.88
    },
    "decisive": {
      "name": "Seek fleet superiority",
      "description": "Admirals concentrate fighting ships and accept greater operational risk.",
      "engagement": 0.78,
      "supply": 0.82
    }
  },
  "TYPES": {
    "BB": "Battleship",
    "BC": "Battlecruiser",
    "CV": "Carrier",
    "CVL": "Light carrier",
    "CA": "Heavy cruiser",
    "CL": "Light cruiser",
    "DD": "Destroyer",
    "DL": "Flotilla leader",
    "DE": "Escort",
    "SS": "Submarine",
    "SM": "Submarine",
    "TB": "Torpedo boat",
    "AM": "Merchant ship",
    "AK": "Merchant ship",
    "AO": "Fleet support ship"
  },
  "SERVICES": {
    "warship": "Warships",
    "support": "Naval support",
    "merchant": "Merchant shipping"
  }
}
```
