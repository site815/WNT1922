# Simulation clock units

Event triggers, text and choices are read directly by mechanics/events.mjs. Costs and rewards apply equally to human and AI governments.

```json game-data
{
  "DAY": 86400000,
  "BASE_SPEED": 10000,
  "REVIEW_YEARS": [
    1940,
    1945,
    1950
  ],
  "FINAL_REVIEW": {
    "body": "Your campaign has been scored. There is no forced ending: your fleets, projects, wars and economy continue.",
    "options": [
      {
        "id": "continue",
        "label": "Continue the sandbox",
        "detail": "Return to the ministry with the current world intact."
      }
    ]
  }
}
```
