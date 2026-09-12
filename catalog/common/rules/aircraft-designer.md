# aircraft designer — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
{
  "AIR_ROLES": {
    "fighter": "Fighter",
    "strike": "Naval strike",
    "scout": "Reconnaissance",
    "multirole": "Multirole"
  },
  "AIR_FEATURES": {
    "carrier": {
      "label": "Carrier landing gear and arrestor hook",
      "year": 1922
    },
    "folding": {
      "label": "Folding wings",
      "year": 1922
    },
    "floats": {
      "label": "Floatplane undercarriage",
      "year": 1922
    },
    "self_sealing": {
      "label": "Self-sealing fuel tanks",
      "year": 1936
    },
    "radar": {
      "label": "Airborne search radar",
      "year": 1941
    },
    "laminar": {
      "label": "Low-drag wing",
      "year": 1940
    },
    "jet": {
      "label": "Jet propulsion (equivalent power)",
      "year": 1944
    }
  }
}
```
