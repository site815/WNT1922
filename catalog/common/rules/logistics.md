# Tactical fleet supply

Supply is the distance-band factor times the endurance factor (return voyage / shortest-range hull). Oilers meeting a force ease both factors for a limited period. Each logistics research upgrade reduces the distance penalty by 5%; it also improves ship repair by 10%. National logistics is independently the average of port access and convoy performance (success rate times delivery coverage). The supply resource bar shows the arithmetic mean of all task forces. Distance tables use nautical miles internally (UI converts to km).

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
  "REPLENISHMENT_BONUS_PER_LEVEL": 0.05
}
```
