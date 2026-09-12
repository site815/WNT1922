# campaign clock — data and balance

The worker advances operational mechanics every 15 simulated minutes, 96 ticks per day. Calendar events remain scheduled; movement is interpolated for display. A slow computer runs fewer simulated minutes per real second rather than dropping ticks. Battle stage durations are rounded to whole ticks, with at least one tick per stage.

```json game-data
{
  "MINUTES_PER_DAY": 1440,
  "TICK_MINUTES": 15,
  "CAPITALS": {
    "FRA": {
      "name": "Paris",
      "zone": "Europe/Paris"
    },
    "ITA": {
      "name": "Rome",
      "zone": "Europe/Rome"
    },
    "SOV": {
      "name": "Moscow",
      "zone": "Europe/Moscow"
    },
    "JPN": {
      "name": "Tokyo",
      "zone": "Asia/Tokyo"
    },
    "USA": {
      "name": "Washington",
      "zone": "America/New_York"
    },
    "GBR": {
      "name": "London",
      "zone": "Europe/London"
    },
    "DEU": {
      "name": "Berlin",
      "zone": "Europe/Berlin"
    }
  },
  "HISTORICAL_POLAND": "1939-09-01T03:45:00.000Z",
  "HISTORICAL_BRITAIN": "1939-09-03T10:00:00.000Z"
}
```
