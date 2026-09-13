# missions — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
{
  "MISSIONS": {
    "replenish": {
      "name": "Fleet replenishment",
      "description": "Carry fuel and supplies between friendly ports and operating fleets. Avoid combat and withdraw from known threats; support ships remain vulnerable in transit.",
      "search": 0.25,
      "engagement": 0
    },
    "guard": {
      "name": "Escort shipping",
      "description": "Accompany friendly convoys, screen against submarines and intercept threats to shipping.",
      "search": 1,
      "engagement": 0.1
    },
    "presence": {
      "name": "Recon patrol",
      "description": "Search sea lanes, update intelligence and shadow contacts while preserving the force.",
      "search": 1.5,
      "engagement": 0.04
    },
    "raid": {
      "name": "Commerce raiding",
      "description": "Seek enemy merchant traffic, attack vulnerable convoys and disengage from strong escorts.",
      "search": 0.9,
      "engagement": 0.08
    },
    "anchorage": {
      "name": "Raid anchorage",
      "description": "Strike enemy ships at anchor with aircraft or surface weapons, then withdraw to replenish. Admirals select a reachable enemy harbor.",
      "search": 1.2,
      "engagement": 0.03
    },
    "siege": {
      "name": "Siege port",
      "description": "Sustain bombardment of an enemy supply base, suppress its defenses and disrupt repairs. Admirals withdraw when damage, escorts or endurance require it.",
      "search": 0.8,
      "engagement": 0.1
    },
    "decisive": {
      "name": "Fleet interception",
      "description": "Use intelligence to intercept enemy warships. Relative strength, scouting and speed govern whether to engage.",
      "search": 1.2,
      "engagement": 0.2
    }
  }
}
```
