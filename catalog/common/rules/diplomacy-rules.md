# diplomacy rules — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
{
  "DIPLOMACY": {
    "visit": {
      "name": "Diplomatic visit",
      "price": {
        "gold": 2000,
        "influence": 0,
        "industry": 0
      },
      "gain": {
        "influence": 8
      },
      "days": 90
    },
    "sell": {
      "name": "Sell naval equipment",
      "price": {
        "gold": 0,
        "influence": 0,
        "industry": 1000
      },
      "gain": {
        "gold": 2500
      },
      "days": 90
    },
    "cooperate": {
      "name": "Industrial cooperation",
      "price": {
        "gold": 4000,
        "influence": 12,
        "industry": 0
      },
      "gain": {
        "industry": 1200
      },
      "days": 90
    },
    "strategic": {
      "name": "Buy strategic materials",
      "price": {
        "gold": 4000,
        "influence": 0,
        "industry": 0
      },
      "gain": { "strategic": 2000 },
      "days": 90
    },
    "provoke": {
      "name": "Naval provocation",
      "price": {
        "gold": 6000,
        "influence": 16,
        "industry": 800
      },
      "gain": {},
      "days": 90
    }
  }
}
```
