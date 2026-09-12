# In Good Faith events

Event triggers, text and choices are read directly by mechanics/events.mjs. Costs and rewards apply equally to human and AI governments.

```json game-data
[
  {
    "key": "us-election",
    "nations": [
      "USA"
    ],
    "date": "1936-11-03",
    "title": "The fifth term ends, or it does not",
    "body": "The next estimate has become an argument about yard employment and the price of the battle line.",
    "options": [
      {
        "id": "jobs",
        "label": "Defend the yard appropriations",
        "detail": "Spend 10 influence. Gain 4,000 industry.",
        "influence": 10,
        "industryGain": 4000
      },
      {
        "id": "support",
        "label": "Broaden the political coalition",
        "detail": "Spend 3,000 gold. Gain 16 influence.",
        "gold": 3000,
        "influenceGain": 16
      },
      {
        "id": "defer",
        "label": "Keep the existing estimate",
        "detail": "No immediate change."
      }
    ]
  }
]
```
