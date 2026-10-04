# Historical opening world state

These values are snapshots, applied once before new-game fleet/base initialization. They are never reapplied to a saved campaign. Front fractions are strategic approximations on the existing map geometry; they are not surveyed boundaries. Complete regional victories and the supported port/station changes have gameplay effects. Subsequent operations can change them.

```json game-data
{
  "eve_european_war_1939": {
    "control": {"c305":"DEU","c315":"DEU","c339":"ITA"},
    "portControl": {},
    "stationControl": {},
    "fronts": {"china":0.22},
    "wars": [],
    "rivals": {"GBR":"DEU","FRA":"DEU","DEU":"GBR","ITA":"GBR","JPN":"USA","USA":"JPN","SOV":"DEU"}
  },
  "eve_pacific_war_1941": {
    "control": {"c305":"DEU","c315":"DEU","c339":"ITA","c290":"DEU","c291":"DEU","c385":"DEU","c390":"DEU","c210":"DEU","c211":"DEU","c212":"DEU","c345":"DEU","c350":"DEU"},
    "portControl": {"brest":"DEU","saigon":"JPN"},
    "stationControl": {"saigon":"JPN"},
    "fronts": {"poland":1,"norway":1,"france":0.65,"balkans":1,"africa":0.42,"east":0.62,"china":0.28},
    "wars": [
      {"pair":["GBR","DEU"],"since":"1939-09-03T00:00:00Z"},
      {"pair":["GBR","ITA"],"since":"1940-06-10T00:00:00Z"},
      {"pair":["DEU","SOV"],"since":"1941-06-22T00:00:00Z"},
      {"pair":["ITA","SOV"],"since":"1941-06-22T00:00:00Z"}
    ],
    "rivals": {"GBR":"DEU","FRA":"DEU","DEU":"GBR","ITA":"GBR","JPN":"USA","USA":"JPN","SOV":"DEU"}
  }
}
```
