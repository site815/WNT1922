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

Commercial diplomacy exchanges real ministry reserves. Sell naval equipment transfers 1,000 industry to the buyer for 2,500 gold; the industry represents stored equipment/industrial capacity, not commissioned hulls. Industrial cooperation purchases 1,200 partner industry for 4,000 gold and consumes the requesting ministry's 12 influence as an administrative cost. Buy strategic materials transfers 2,000 partner materials for 4,000 gold; sell strategic materials transfers 1,000 materials for 1,400 gold. Treaty adjustments apply to the quoted quantities on both sides. Gold, industry and strategic materials are conserved across the two governments; influence is not paid to the partner. Sales do not count as production consumption, create national GDP, or create convoy deliveries. Settlement is an immediate budget transfer rather than a simulated cargo voyage.

Both governments must have the full quoted reserves before settlement. AI governments retain 12% of yearly gold output, 5% of yearly industry and 30 days of operational strategic demand when exporting or paying. They decline additional industry purchases once stocks reach half a year's output (minimum 5,000), or strategic purchases once stocks reach the largest of 4,000, half a year's output and 180 days of operational demand. There are no physical stockpile capacity limits; the save's finite resource bound remains enforced. The strategic buy/sell spread stays loss-making even with the strongest treaty bonuses.

An AI exchange affecting a human government creates a fixed quote, never an immediate withdrawal or deposit. The offer appears as a diplomacy alert without a popup or automatic pause. The recipient must choose Yes within 14 simulated days; No, timeout and war all exchange nothing. Offers reserve no funds; current balances, peace and the proposing government's cooldown/reserves are checked again when accepted. Treaty changes do not rewrite an outstanding quote. There is at most one pending offer per government pair and three for a recipient; the proposing government waits 90 days before offering that recipient another exchange, including after refusal or timeout. Completed exchanges retain their existing independent 90-day action/country cooldowns. Active offers and recent results survive saving, and monthly gold/industry/strategic transfer totals are recorded for both governments.

Diplomatic visits and naval demonstrations remain domestic spending; neither creates a counterpart payment. Their gold costs appear separately from resource exchanges in the cash ledger.
