# Catalog index

Edit the JSON block directly. This document is read by the game; no export is required.

```json game-data
{
  "format": 1,
  "defaultCampaign": "in_good_faith_1936",
  "common": {
    "ships": "common/ships.md",
    "equipment": "common/equipment.md",
    "governmentAircraft": "common/government-aircraft.md",
    "profiles": "common/nations.md"
  },
  "campaigns": {
    "in_good_faith_1936": {
      "scenario": "1936hindsight/campaign.md",
      "ships": "1936hindsight/ships.md",
      "nations": {
        "JPN": "1936hindsight/nations/JPN.md",
        "USA": "1936hindsight/nations/USA.md",
        "GBR": "1936hindsight/nations/GBR.md",
        "DEU": "1936hindsight/nations/DEU.md",
        "FRA": "1936hindsight/nations/FRA.md",
        "ITA": "1936hindsight/nations/ITA.md",
        "SOV": "1936hindsight/nations/SOV.md"
      },
      "aircraft": {
        "JPN": "1936hindsight/aircraft/JPN.md",
        "USA": "1936hindsight/aircraft/USA.md",
        "GBR": "1936hindsight/aircraft/GBR.md",
        "DEU": "1936hindsight/aircraft/DEU.md",
        "FRA": "1936hindsight/aircraft/FRA.md",
        "ITA": "1936hindsight/aircraft/ITA.md",
        "SOV": "1936hindsight/aircraft/SOV.md"
      }
    },
    "campaign_1922": {
      "scenario": "1922/campaign.md",
      "ships": "1922/ships.md",
      "nations": {
        "GBR": "1922/nations/GBR.md",
        "USA": "1922/nations/USA.md",
        "JPN": "1922/nations/JPN.md",
        "DEU": "1922/nations/DEU.md",
        "FRA": "1922/nations/FRA.md",
        "ITA": "1922/nations/ITA.md",
        "SOV": "1922/nations/SOV.md"
      },
      "aircraft": {
        "GBR": "1922/aircraft/GBR.md",
        "USA": "1922/aircraft/USA.md",
        "JPN": "1922/aircraft/JPN.md",
        "DEU": "1922/aircraft/DEU.md",
        "FRA": "1922/aircraft/FRA.md",
        "ITA": "1922/aircraft/ITA.md",
        "SOV": "1922/aircraft/SOV.md"
      }
    }
  }
}
```
