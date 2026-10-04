# Eve of Pacific War

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
    "id": "eve_pacific_war_1941",
    "title": "Eve of Pacific War",
    "start": "1941-11-01",
    "category": "historical",
    "baseMap": "1936hindsight",
    "assetCampaign": "in_good_faith_1936",
    "historicalOpening": true,
    "historyStart": "1939-09-03",
    "description": "1 November 1941. Europe is at war; the United States and Japan remain formally at peace. Command date-specific surviving fleets before the Pacific war.",
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
        "id": "steel",
        "name": "Pact of Steel",
        "members": [
          "DEU",
          "ITA"
        ],
        "kind": "defensive"
      },
      {
        "id": "tripartite",
        "name": "Tripartite Pact",
        "members": [
          "DEU",
          "ITA",
          "JPN"
        ],
        "kind": "defensive"
      },
      {
        "id": "anglo-soviet",
        "name": "Anglo-Soviet wartime agreement",
        "members": [
          "GBR",
          "SOV"
        ],
        "kind": "defensive"
      },
      {
        "id": "soviet-japanese-neutrality",
        "name": "Soviet-Japanese Neutrality Pact",
        "members": [
          "SOV",
          "JPN"
        ],
        "kind": "political"
      }
    ],
    "scope": "Historical opening conditions with selected named major ships. Escort strengths, weapon/refit values, shore air forces, economic stocks and supported base positions are game abstractions. France remains one playable ministry; Vichy/Free French and occupied zones are approximated. Subsequent player/AI actions can diverge; historical opening does not force battle outcomes."
  }
}
```
