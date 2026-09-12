# naval resources — data and balance

Superseded naval models expose a reserve-retirement action once a newer developed model covers their role and every required basing installation. Switch any active production lines first. Retirement removes unassigned and accessible shore-reserve airframes, retaining all aviators and awarding no salvage. Aircraft embarked, stationed, airborne or in transit remain in service. Other-service aircraft continue their automatic replacement/retirement program.

Aircraft accounting: total owned = embarked + stationed + transit/airborne + reserve. Every owned aircraft, including reserves, requires its full documented crew for the aviator balance.

```json game-data
{
  "SYSTEMS_REVISION": 2,
  "SPEEDS": [
    [
      0.25,
      "Very slow · 2,500×"
    ],
    [
      0.5,
      "Slow · 5,000×"
    ],
    [
      1,
      "Normal · 10,000×"
    ],
    [
      5,
      "Fast · 50,000×"
    ],
    [
      10,
      "Very fast · 100,000×"
    ]
  ],
  "CLOSED_LINES": {
    "missouri_bb23": "constitution_bb25",
    "constitution_bb25": "united_states_bb27",
    "united_states_bb27": "tillman_bb29",
    "tillman_bb29": "columbia_bb32",
    "invincible_bc22": "insuperable_bc27",
    "insuperable_bc27": "incomparable_bc31",
    "incomparable_bc31": "incorrigible_bc35",
    "hecht_typ2": "wolf_typ7",
    "wolf_typ7": "hai_typ9",
    "hai_typ9": "schwertwal_typ21",
    "seeadler_raider": "atlantis_raider"
  }
}
```
