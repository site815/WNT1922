# port operations — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

Hourly blockade pressure counts only combatant ships, weighted by damage, remaining crew and strategic-material readiness. Depot ships and oilers cannot blockade or defend a harbor through their tonnage alone. Siege forces apply more pressure than passing patrols. Shore defenses resist blockades.

```json game-data
{
  "PORT_MISSIONS": [
    "anchorage",
    "siege"
  ],
  "BLOCKADE": {
    "radiusNm": 65,
    "distanceFalloffNm": 85,
    "minimumDistanceWeight": 0.15,
    "submarineTonnageWeight": 0.35,
    "artilleryWeight": 8,
    "siegeWeight": 1.5,
    "patrolWeight": 0.65,
    "backgroundResistance": 15000,
    "maximumDisruption": 0.95
  },
  "actionIntervalMinutes": 1440,
  "actionJitterMinutes": 720
}
```
