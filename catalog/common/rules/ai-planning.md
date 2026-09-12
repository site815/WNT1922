# ai planning — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
{
  "DOCTRINES": {
    "GBR": {
      "roles": {
        "DD": 40,
        "CL": 14,
        "CA": 10,
        "BB": 12,
        "CV": 14,
        "SS": 10
      },
      "programs": [
        "logistics",
        "asw",
        "training",
        "standardization",
        "intelligence"
      ]
    },
    "USA": {
      "roles": {
        "DD": 36,
        "CL": 12,
        "CA": 12,
        "BB": 18,
        "CV": 14,
        "SS": 8
      },
      "programs": [
        "industry",
        "standardization",
        "gunnery",
        "aviation",
        "damage_control"
      ]
    },
    "JPN": {
      "roles": {
        "DD": 35,
        "CL": 10,
        "CA": 12,
        "BB": 8,
        "CV": 23,
        "SS": 12
      },
      "programs": [
        "training",
        "pilots",
        "aviation",
        "standardization",
        "logistics"
      ]
    },
    "FRA": {
      "roles": {
        "DD": 32,
        "CL": 18,
        "CA": 10,
        "BB": 3,
        "CV": 12,
        "SS": 25
      },
      "programs": [
        "intelligence",
        "aviation",
        "asw",
        "training",
        "logistics"
      ]
    },
    "ITA": {
      "roles": {
        "DD": 34,
        "CL": 18,
        "CA": 16,
        "BB": 16,
        "CV": 6,
        "SS": 10
      },
      "programs": [
        "logistics",
        "gunnery",
        "training",
        "aviation",
        "damage_control"
      ]
    },
    "DEU": {
      "roles": {
        "DD": 12,
        "CL": 6,
        "CA": 8,
        "BB": 0,
        "CV": 0,
        "SS": 74
      },
      "programs": [
        "intelligence",
        "logistics",
        "standardization",
        "training",
        "damage_control"
      ]
    },
    "SOV": {
      "roles": {
        "DD": 33,
        "CL": 13,
        "CA": 7,
        "BB": 20,
        "CV": 17,
        "SS": 10
      },
      "programs": [
        "industry",
        "school",
        "gunnery",
        "aviation",
        "standardization"
      ]
    }
  }
}
```
