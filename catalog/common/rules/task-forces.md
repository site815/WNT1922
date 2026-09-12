# task forces — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

Opening theater assignments divide each ship role between the named regions, placing every `alternateEvery`th hull in the alternate theater. The longitude boundaries keep initial base balancing within that theater. Named port overrides apply only when forming opening commands; operational moves always use routes.

```json game-data
{
  "STRATEGY_REVISION": 2,
  "INTELLIGENCE": {
    "freshHours": 2,
    "recentHours": 12,
    "uncertainHours": 48,
    "expireHours": 168
  },
  "roles": {
    "carrier": "Carrier task force",
    "battle": "Battle squadron",
    "cruiser": "Cruiser group",
    "escort": "Escort group",
    "submarine": "Submarine flotilla",
    "repair": "Repair detachment",
    "reinforcement": "Reinforcement group"
  },
  "OPENING_THEATERS": {
    "USA": {
      "mainRegion": "pacific",
      "alternateRegion": "atlantic",
      "alternateEvery": 3,
      "alternatePort": "norfolk",
      "dividingLongitude": -100,
      "easternLongitude": 100
    }
  },
  "OPENING_PORT_OVERRIDES": {
    "GBR": {
      "h-hms_barham": "singapore",
      "h-hms_malaya": "singapore"
    }
  }
}
```
