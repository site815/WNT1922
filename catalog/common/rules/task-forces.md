# task forces — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

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
  }
}
```
