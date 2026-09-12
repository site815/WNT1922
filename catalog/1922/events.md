# Treaty System events

Event triggers, text and choices are read directly by mechanics/events.mjs. Costs and rewards apply equally to human and AI governments.

```json game-data
[
  {
    "key": "washington-disposal",
    "exclude": [
      "DEU",
      "SOV"
    ],
    "title": "Washington treaty dispositions",
    "body": "The signed treaty requires disposal of canceled capital ships and permits designated carrier conversions. These opening hulls are listed in your fleet register.",
    "options": [
      {
        "id": "comply",
        "label": "Carry out the treaty dispositions",
        "detail": "Scrap prohibited construction, convert designated hulls to carriers and keep the treaty in force.",
        "vanilla": "comply"
      },
      {
        "id": "reject",
        "label": "Reject the dispositions",
        "detail": "Retain the hulls under a false count: 1,200 gold switching fee, then proportional monthly concealment costs.",
        "gold": 1200,
        "vanilla": "reject"
      }
    ],
    "critical": true,
    "kind": "treaty",
    "deadlineDate": "1922-08-06",
    "defaultOption": "comply",
    "defaultText": "Carry out the treaty dispositions; designated construction is scrapped or converted."
  },
  {
    "key": "geneva-1927",
    "date": "1927-06-20",
    "title": "The Geneva naval conference",
    "body": "Cruiser limits and parity return to the negotiating table.",
    "options": [
      {
        "id": "support",
        "label": "Support verified limits",
        "detail": "Spend 1,500 gold; gain 5 influence for diplomatic work.",
        "gold": 1500,
        "influenceGain": 5
      },
      {
        "id": "wait",
        "label": "Retain the existing estimate",
        "detail": "No immediate resource or diplomatic change."
      }
    ]
  },
  {
    "key": "london-1930",
    "date": "1930-04-22",
    "title": "The London naval conference",
    "body": "The next decade will depend on escorts, submarines and carrier experience.",
    "options": [
      {
        "id": "training",
        "label": "Invest in fleet training",
        "detail": "Fund a training cycle at its current price.",
        "program": "training"
      },
      {
        "id": "wait",
        "label": "Keep funds available",
        "detail": "Continue existing construction and policy."
      }
    ]
  },
  {
    "key": "kanto-1923",
    "date": "1923-09-01",
    "nations": [
      "JPN"
    ],
    "title": "The Great Kantō earthquake",
    "body": "The earthquake has damaged port infrastructure and disrupted naval industry. If still on the slipway, Amagi is lost and Kaga takes her place as a carrier conversion.",
    "options": [
      {
        "id": "repair",
        "label": "Fund emergency repair teams",
        "detail": "1,500 gold and 500 industry; gain 2 morale.",
        "gold": 1500,
        "industry": 500,
        "morale": 2
      },
      {
        "id": "routine",
        "label": "Use routine repair appropriations",
        "detail": "No extra allocation."
      }
    ]
  }
]
```
