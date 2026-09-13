# Automatic fleet support

All naval auxiliaries use the AO fleet-support type. Each combines an oiler's fuel tanks with repair workshops and fleet stores. The 1922, 1932 and 1942 designs replace each other for new orders; Japan's 1936 Standard Maru hybrid keeps its own program. The same rules apply to every navy and to player-designed support ships.

Admirals form fully crewed support groups, add spare escorts, and seek forces needing replenishment. Without a suitable rendezvous they strengthen an accessible supply port. Ships sail normal routes, use their own endurance, and can be intercepted, damaged or sunk. Damaged auxiliaries return for repairs. A meeting within 74 km transfers finite cargo and eases distance/endurance penalties for three days, fading with time. Cargo lost with damaged or sunk support hulls cannot be delivered. Port capacity rises only while healthy, crewed support ships are physically in harbor.

These are provisional balance values, read directly by the game.

```json game-data
{
  "GROUP_HULLS": 4,
  "PORT_CAPACITY_PER_TON": 3,
  "CARGO_PER_TON": 2,
  "REFUEL_BELOW": 0.3,
  "REPAIR_BELOW": 0.75,
  "TARGET_FUEL_BELOW": 0.9,
  "MEETING_RANGE_NM": 40,
  "TRANSFER_MAX_FRACTION": 0.35,
  "RELIEF_MAX": 0.15,
  "RELIEF_PER_FUEL_FRACTION": 0.6,
  "RELIEF_MINUTES": 4320,
  "TRANSFER_INTERVAL_MINUTES": 1440
}
```
