# The Treaty System

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
{
  "version": 2,
  "specificationRevision": 2,
  "rosterRevision": 2,
  "merchantSource": {
    "title": "Lloyd’s Register 1921–22; Soviet opening estimate explicitly provisional",
    "url": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Casualty_Returns_1922.pdf"
  },
  "scenario": {
    "id": "campaign_1922",
    "title": "The Treaty System",
    "start": "1922-02-06",
    "description": "6 February 1922: the Washington Naval Treaty is signed. Guide one of seven navies through the interwar years.",
    "europeVariationDays": 365,
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
        "id": "anglo-japanese-original",
        "name": "Anglo-Japanese alliance",
        "members": [
          "GBR",
          "JPN"
        ],
        "kind": "defensive"
      }
    ]
  }
}
```
