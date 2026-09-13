# Tactical fleet supply

Supply = distance-band factor × endurance factor (return voyage / shortest-range hull) × national logistics factor × strategic factor. Crewed support ships meeting a force ease distance and endurance penalties for a limited period. The national factor = 1 − 0.20 × (1 − logistics / 100): no penalty at 100%, −10% at 50%, −20% at zero. Strategic reserves above zero give ×1; empty reserves give ×0.5. This replaces the direct naval-combat strategic shortage multiplier; movement, aviation and production retain their separate constraints. Each logistics research upgrade reduces the distance penalty by 5%; it also improves ship repair by 10%. National logistics is independently the average of port access and convoy performance (success rate times delivery coverage). The supply resource bar shows the arithmetic mean of all task forces. Distance tables use nautical miles internally (UI converts to km).

```json game-data
{
  "ENDURANCE_BANDS": [
    {
      "fraction": 0.25,
      "factor": 1
    },
    {
      "fraction": 0.5,
      "factor": 0.9
    },
    {
      "fraction": 0.75,
      "factor": 0.75
    },
    {
      "fraction": 1,
      "factor": 0.5
    },
    {
      "fraction": 1000000,
      "factor": 0.2
    }
  ],
  "SUPPLY_BANDS": [
    {
      "nm": 500,
      "factor": 1
    },
    {
      "nm": 1500,
      "factor": 0.9
    },
    {
      "nm": 3000,
      "factor": 0.75
    },
    {
      "nm": 5000,
      "factor": 0.55
    },
    {
      "nm": 8000,
      "factor": 0.35
    },
    {
      "nm": 1000000,
      "factor": 0.2
    }
  ],
  "REPLENISHMENT_BONUS_PER_LEVEL": 0.05,
  "NATIONAL_LOGISTICS_MAX_PENALTY": 0.2,
  "EMPTY_STRATEGIC_SUPPLY_FACTOR": 0.5
}
```
