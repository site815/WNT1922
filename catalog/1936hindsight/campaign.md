# In Good Faith

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
{
  "version": 1,
  "specificationRevision": 2,
  "rosterRevision": 2,
  "merchantSource": {
    "title": "Lloyd's Register, 1935 casualty returns, annual Table 1 (1935–1936 register)",
    "url": "https://upload.wikimedia.org/wikipedia/commons/b/b4/Casualty_Returns_1935.pdf#page=50",
    "credit": "Lloyd's Register Foundation, Heritage Centre",
    "basis": "Steamers and motorships of at least 100 gross register tons; sailing vessels excluded. US figures exclude the Great Lakes. United Kingdom uses the source's Great Britain and Ireland row; the separate Dominion fleet is excluded.",
    "edition": "1935–1936"
  },
  "scenario": {
    "title": "In Good Faith",
    "start": "1936-01-01",
    "id": "in_good_faith_1936",
    "description": "1 January 1936. Seven divergent naval programs compete after the London conference collapses.",
    "europeVariationDays": 60,
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
        "id": "franco-soviet-1935",
        "name": "Franco-Soviet mutual-assistance treaty",
        "members": [
          "FRA",
          "SOV"
        ],
        "kind": "consultation"
      }
    ]
  }
}
```
