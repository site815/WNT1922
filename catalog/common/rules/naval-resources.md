# naval resources — data and balance

Superseded naval models expose Retire reserves and Retire all once a newer available model covers their role and every required basing installation. Switch active production lines first. Retire reserves removes unassigned and accessible shore reserves; Retire all removes every owned airframe from ships, bases, active flights and transfers. Complete outstanding paid aircraft orders before Retire all. Both retain aviators and award no salvage. Empty merchant transports sail home; flight records finish their normal recovery and report lifecycle. Other-service aircraft retain automatic replacement and retirement.

Aircraft accounting: total owned = embarked + stationed + transit/airborne + reserve. Every owned aircraft, including reserves, requires its full documented crew for the aviator balance.

Catalog availability is determined directly by each ship's year or aircraft's type_year: the item becomes available on 1 January of that year for every controller. Future plans show a countdown. No additional unlock payment or development project is required; normal construction/production costs and time still apply. Superseded and obsolete ship lines remain closed. Player-created ship and aircraft drafts retain their registration fee.

The resource bar shows yards, sailors, aviators and aircraft as total(+reserve). Yard figures are usable and spare tons/year. Personnel reserves are total trained minus required complements; a negative value means a staffing deficit. Aircraft reserve excludes embarked, stationed and in-transit aircraft. Personnel recoveries remain separate until their return date.

Each naval production line starts on automatic modernization. Automatic lines select the newest available model for their role (including eligible multirole designs), breaking equal-year ties by role suitability. Choosing a model manually locks that line; Auto restores modernization. Production consumes ordinary resources and never creates airframes merely by switching model. In 1936 only opening naval models and explicitly designated scenario progressions remain; later additions require commissioned designs.

```json game-data
{
  "AUTOMATIC_PRODUCTION_DEFAULT": true,
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
    ],
    [
      100,
      "Maximum · 1,000,000×"
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
    "seeadler_raider": "atlantis_raider",
    "columbia_bb32": "republic_bb41"
  }
}
```
