# Eve of European War

Authored opening data. Read directly by the game; no export step is required.

```json game-data
{
  "version": 1,
  "specificationRevision": 2,
  "rosterRevision": 1,
  "merchantSource": {
    "title": "Lloyd's Register, 1935 casualty returns, annual Table 1 (1935–1936 register)",
    "url": "https://upload.wikimedia.org/wikipedia/commons/b/b4/Casualty_Returns_1935.pdf#page=50",
    "credit": "Lloyd's Register Foundation, Heritage Centre",
    "basis": "Steamers and motorships of at least 100 gross register tons; sailing vessels excluded. US figures exclude the Great Lakes. United Kingdom uses the source's Great Britain and Ireland row; the separate Dominion fleet is excluded.",
    "edition": "1935–1936"
  },
  "scenario": {
    "id": "eve_european_war_1939",
    "title": "Eve of European War",
    "start": "1939-08-01",
    "category": "historical",
    "baseMap": "1936hindsight",
    "assetCampaign": "in_good_faith_1936",
    "historicalOpening": true,
    "description": "1 August 1939. Poland is still independent and the European great powers are not yet at war. Command historical fleets one month before the invasion.",
    "europeVariationDays": 0,
    "openingPacts": [
      {
        "id": "comintern",
        "name": "Communist International",
        "members": [
          "SOV"
        ],
        "kind": "political"
      },
      {
        "id": "anglo-french",
        "name": "Anglo-French security cooperation",
        "members": [
          "GBR",
          "FRA"
        ],
        "kind": "defensive"
      },
      {
        "id": "steel",
        "name": "Pact of Steel",
        "members": [
          "DEU",
          "ITA"
        ],
        "kind": "defensive"
      },
      {
        "id": "anti-comintern-italy",
        "name": "Anti-Comintern alignment",
        "members": [
          "DEU",
          "ITA",
          "JPN"
        ],
        "kind": "political"
      }
    ],
    "scope": "Historical opening conditions with selected named major ships. Escort strengths, weapon/refit values, shore air forces, economic stocks and supported base positions are game abstractions. France remains one playable ministry; Vichy/Free French and occupied zones are approximated. Subsequent player/AI actions can diverge; historical opening does not force battle outcomes."
  },
  "classOverrides": {
    "hist-yorktown": {
      "radar": false
    },
    "hist-illustrious": {
      "radar": false
    },
    "hist-kgv": {
      "radar": false
    },
    "hist-north-carolina": {
      "radar": false
    }
  }
}
```
