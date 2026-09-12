# task forces — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

Opening theater assignments divide each ship role between the named regions, placing every `alternateEvery`th hull in the alternate theater. The longitude boundaries keep initial base balancing within that theater. Named port overrides apply only when forming opening commands; operational moves always use routes.

Reinforcements travel to reachable friendly rendezvous ports. At a friendly port they may join a compatible local command; if their destination becomes unreachable or their parent command disappears, they resume local duties. Hulls in passage or battle cannot merge across positions. Refuelling is possible only at a physically reached friendly port. `COMMAND_CORE_LIMITS` guide splitting and consolidation of automatic commands by their principal ship role.

```json game-data
{
  "STRATEGY_REVISION": 2,
  "COMMAND_CORE_LIMITS": { "carrier": 2, "battle": 4, "cruiser": 6, "escort": 18, "submarine": 14 },
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
