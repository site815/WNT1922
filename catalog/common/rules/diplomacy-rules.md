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
      "gain": {
        "strategic": 2000
      },
      "days": 90
    },
    "sellStrategic": {
      "name": "Sell strategic materials",
      "price": {
        "gold": 0,
        "influence": 0,
        "industry": 0,
        "strategic": 1000
      },
      "gain": {
        "gold": 1400
      },
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
  },
  "PACT_MODIFIERS": {
    "consultation": {
      "visit": {
        "gain": {
          "influence": 0.25
        }
      },
      "cooperate": {
        "price": {
          "gold": -0.05
        }
      },
      "provoke": {
        "price": {
          "influence": 0.25
        }
      }
    },
    "political": {
      "visit": {
        "gain": {
          "influence": 0.25
        }
      },
      "sell": {
        "gain": {
          "gold": 0.05
        }
      },
      "cooperate": {
        "price": {
          "gold": -0.1
        }
      },
      "strategic": {
        "price": {
          "gold": -0.05
        }
      },
      "sellStrategic": {
        "gain": {
          "gold": 0.05
        }
      },
      "provoke": {
        "price": {
          "influence": 0.5
        }
      }
    },
    "defensive": {
      "visit": {
        "gain": {
          "influence": 0.5
        }
      },
      "sell": {
        "gain": {
          "gold": 0.1
        }
      },
      "cooperate": {
        "price": {
          "gold": -0.15,
          "influence": -0.25
        },
        "gain": {
          "industry": 0.1
        }
      },
      "strategic": {
        "price": {
          "gold": -0.1
        }
      },
      "sellStrategic": {
        "gain": {
          "gold": 0.1
        }
      },
      "provoke": {
        "price": {
          "gold": 0.25,
          "influence": 1
        }
      }
    }
  },
  "NAVAL_TREATY_MODIFIERS": {
    "compliance": {
      "visit": {
        "gain": {
          "influence": 0.25
        }
      },
      "sell": {
        "gain": {
          "gold": 0.05
        }
      },
      "cooperate": {
        "price": {
          "gold": -0.05
        }
      },
      "strategic": {
        "price": {
          "gold": -0.05
        }
      },
      "sellStrategic": {
        "gain": {
          "gold": 0.05
        }
      },
      "provoke": {
        "price": {
          "influence": 0.25
        }
      }
    },
    "sanctions": {
      "visit": {
        "price": {
          "gold": 0.2
        }
      },
      "sell": {
        "gain": {
          "gold": -0.15
        }
      },
      "cooperate": {
        "price": {
          "gold": 0.2,
          "influence": 0.25
        }
      },
      "strategic": {
        "price": {
          "gold": 0.15
        }
      },
      "sellStrategic": {
        "gain": {
          "gold": -0.15
        }
      },
      "provoke": {
        "price": {
          "influence": 0.25
        }
      }
    }
  }
}
```

Diplomatic terms use the strongest shared active pact: defensive, political, then consultation. Overlapping pacts do not stack. Pact effects stop during bilateral war or when a pact becomes inactive. Defensive and political partners receive better commercial terms; threatening a partner costs extra influence (and gold for allies). Consultation improves visits and cooperation. These are game balance modifiers, not claims about historical treaty clauses.

While naval limits remain active for both governments, open compliance by both gives a modest commercial and visit bonus. Publicly disclosed excess beyond the existing 10% pricing tolerance in either government instead adds the sanctions terms. Concealment receives no compliance bonus; hidden excess does not fabricate public sanctions. The naval modifier may combine with one pact modifier, adding percentages against the base amounts. Prices round up and gains round down, with influence still capped at 500. No changes to cooldowns.

Strategic-material exports consume 1,000 of the acting ministry’s stored materials for a base 1,400 gold. They are sales, not production consumption. Like existing diplomatic exchanges, the counterparty represents access to foreign markets: only the acting ministry’s budget changes. AI and player ministries use the same quote, affordability rules and cooldown; no foreign-player balance can be drained by an AI sale. The buy/sell spread remains loss-making even with the strongest treaty bonuses.
