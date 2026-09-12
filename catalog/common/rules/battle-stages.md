# Battles over time

All naval encounters use five stages: contact, approach, opening attack, main engagement and disengagement. Damage is applied at the end of opening attack and each main engagement round, using the current surviving forces. Reports update while the simulation runs. A pause freezes fighting too; higher game speed accelerates battle time normally.

Surface actions usually last two to four game hours. Main engagement can repeat up to five times; these longer actions increase losses. Aircraft and merchant encounters use shorter stages. Air transit and deck preparation still happen before the local engagement; surviving aircraft then fly home. Fleets in a surface battle cannot simultaneously accept another surface engagement, merge, or execute new orders. Aircraft attacks on a force already fighting remain possible. Ships detach for repair after disengagement.

The first exchange uses 25% of the former single-action damage budget; the first main round uses 75%. Extra main rounds each use 35%. Current condition, preparation, opposing power and aggressive orders still affect every exchange. These are provisional gameplay durations and coefficients, shared by all nations.

```json game-data
{
  "STAGES": ["Contact", "Approach", "Opening attack", "Main engagement", "Disengagement"],
  "DURATIONS_MINUTES": {
    "surface": [[10,20], [25,45], [20,35], [40,65], [15,30]],
    "port": [[10,15], [15,25], [10,20], [20,30], [10,20]],
    "air": [[5,10], [5,10], [5,10], [10,15], [5,10]],
    "convoy": [[5,10], [10,15], [5,10], [10,20], [5,15]]
  },
  "SURFACE_ROUND_WEIGHTS": [55,25,12,6,2],
  "OPENING_WEIGHT": 0.25,
  "MAIN_WEIGHT": 0.75,
  "EXTRA_ROUND_WEIGHT": 0.35
}
```
