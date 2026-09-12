# Treaty dispositions and early naval planning

Edit this data directly. Earthquake timing comes from the referenced event in events.md; hull names and specifications come from the ship and national catalogs.

```json game-data
{
  "carrierConversions": {
    "lexington_cc": "lexington_cv",
    "normandie": "bearn_cv",
    "amagi": "akagi_cv",
    "tosa": "kaga_cv",
    "courageous_llc": "courageous_1922_cv"
  },
  "conversionDays": 1095,
  "salvageFactor": 0.025,
  "heldHull": {
    "id": "h-ijn_kaga",
    "health": 0.5,
    "notes": "Unfinished treaty hull held for the Amagi carrier substitution."
  },
  "earthquake": {
    "event": "kanto-1923",
    "completedKey": "kanto-fleet-1923",
    "nation": "JPN",
    "damagedHull": "h-ijn_amagi",
    "replacementClass": "kaga_cv",
    "progress": 0.2
  },
  "replacementHulls": {
    "USA": [
      "h-uss_colorado",
      "h-uss_west_virginia"
    ],
    "GBR": [
      "h-hms_nelson",
      "h-hms_rodney"
    ]
  },
  "earlyCarrierPreference": {
    "beforeYear": 1930,
    "cap": 6
  },
  "allianceExpiry": {
    "date": "1923-08-17T00:00:00Z",
    "completedKey": "anglo-japanese-expiry",
    "pair": [
      "GBR",
      "JPN"
    ],
    "popupKey": "washington-four-power",
    "title": "The Anglo-Japanese alliance ends",
    "body": "The Four-Power Treaty enters into force, replacing the bilateral alliance with consultation. Access to each other’s naval ports ends."
  }
}
```
