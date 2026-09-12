# Shared ministry events

Event triggers, text and choices are read directly by mechanics/events.mjs. Costs and rewards apply equally to human and AI governments.

```json game-data
[
  {
    "key": "opening",
    "opening": true,
    "title": "The first naval estimate",
    "body": "Your ministry needs a direction for the new estimates. Commitments use the same resources and construction system as later orders.",
    "options": [
      {
        "id": "school",
        "label": "Build the schools",
        "detail": "Commission a naval-school expansion at its current price and duration.",
        "program": "school"
      },
      {
        "id": "standardization",
        "label": "Invest in standardization",
        "detail": "Commission a production program at its current price and duration.",
        "program": "standardization"
      },
      {
        "id": "defer",
        "label": "Keep the funds available",
        "detail": "Make individual ship and project decisions from the ministry."
      }
    ]
  },
  {
    "key": "expiry",
    "expiredTreaty": true,
    "title": "The treaty system expires",
    "body": "The remaining construction limits have reached their expiry. The ministry may propose renewed verification.",
    "options": [
      {
        "id": "lapse",
        "label": "Let the limits expire",
        "detail": "Build openly without treaty restrictions."
      },
      {
        "id": "renew",
        "label": "Offer a verification agreement",
        "detail": "Spend 30 influence and renew construction limits for 3 years.",
        "influence": 30,
        "renewDays": 1095
      }
    ],
    "critical": true,
    "kind": "treaty",
    "defaultOption": "lapse",
    "defaultText": "The treaty limits lapse. Open construction is permitted."
  },
  {
    "key": "relief",
    "months": [
      3,
      9
    ],
    "positive": true,
    "peaceWithRival": true,
    "title": "A chance to cooperate",
    "body": "{rival} has requested help with a civilian maritime emergency. Your response will be read as a signal of your government’s intentions.",
    "options": [
      {
        "id": "aid",
        "label": "Send relief and repair teams",
        "detail": "2,500 gold · 300 industry. +8 influence and +3 morale.",
        "influenceGain": 8,
        "gold": 2500,
        "industry": 300,
        "morale": 3
      },
      {
        "id": "decline",
        "label": "Keep the fleet committed at home",
        "detail": "No cost; no additional effect."
      }
    ]
  },
  {
    "key": "inspection",
    "months": [
      3,
      9
    ],
    "positive": false,
    "peaceWithRival": true,
    "requiresTreaty": true,
    "excludeSovietTreaty": true,
    "title": "Disputed naval intelligence",
    "body": "Reports of undeclared work have reached {rival}. The cabinet wants an answer before the next round of estimates.",
    "options": [
      {
        "id": "access",
        "label": "Offer a limited inspection",
        "detail": "12 influence; reveal concealed hulls and settle the inspection.",
        "influence": 12,
        "reveal": true
      },
      {
        "id": "deny",
        "label": "Deny access",
        "detail": "2,000 gold and 5 influence to deny access.",
        "gold": 2000,
        "influence": 5
      },
      {
        "id": "counter",
        "label": "Publish counter-accusations",
        "detail": "Spend 3,000 gold on a public rebuttal; gain 4 influence.",
        "gold": 3000,
        "influenceGain": 4
      }
    ],
    "critical": true,
    "kind": "inspection",
    "defaultOption": "deny",
    "defaultText": "Deny inspection access; pay 2,000 gold and lose 5 influence (or the remaining balances if lower)."
  },
  {
    "key": "jp-aircraft",
    "nations": [
      "JPN"
    ],
    "date": "1938-01-01",
    "title": "The 1938 aircraft bet",
    "body": "The navy must decide how much to spend converting deck experience into combat aviation.",
    "options": [
      {
        "id": "aviation",
        "label": "Fund the aviation program",
        "detail": "Queue the next carrier aviation doctrine development at its current price.",
        "program": "aviation"
      },
      {
        "id": "training",
        "label": "Concentrate on fleet training",
        "detail": "Queue a training cycle at its current price.",
        "program": "training"
      },
      {
        "id": "defer",
        "label": "Retain the current air groups",
        "detail": "Keep the resources available."
      }
    ]
  }
]
```
