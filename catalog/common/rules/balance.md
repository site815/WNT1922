# balance — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

```json game-data
{
  "PROGRAMS": {
    "industry": {
      "name": "Expand naval industry",
      "kind": "Industry",
      "gold": 6500,
      "influence": 14,
      "industry": 2400,
      "days": 180,
      "max": 9,
      "effect": "Each upgrade adds 15% of opening industrial output and yard capacity, plus 15% of the positive monthly merchant-hull growth rate. Bonuses add; they do not compound.",
      "level": "industry"
    },
    "training": {
      "name": "Fleet training doctrine",
      "kind": "Training",
      "gold": 2800,
      "influence": 8,
      "industry": 500,
      "days": 180,
      "max": 9,
      "effect": "+9 training, +3 morale (each capped at 100%). Training slowly decays; each doctrine level slows that decay.",
      "level": "training"
    },
    "school": {
      "name": "Expand the naval schools",
      "kind": "Training",
      "gold": 5000,
      "influence": 16,
      "industry": 900,
      "days": 180,
      "max": 9,
      "effect": "Expands sailor intake; level 5 is the 1936 reference. Output follows school funding.",
      "level": "school"
    },
    "pilots": {
      "name": "Expand naval aviation schools",
      "kind": "Training",
      "gold": 5200,
      "influence": 16,
      "industry": 1200,
      "days": 180,
      "max": 9,
      "effect": "Expands naval aircrew intake; level 5 is the 1936 reference. Output follows school funding.",
      "level": "pilots"
    },
    "aircraft_factory": {
      "name": "Expand aircraft factories",
      "kind": "Industry",
      "gold": 6500,
      "influence": 18,
      "industry": 2800,
      "days": 180,
      "max": 9,
      "effect": "Expands annual aircraft capacity; level 5 is the 1936 reference. Output consumes gold and industry at the selected funding level.",
      "level": "aircraft_factory"
    },
    "logistics": {
      "name": "Supply and maintenance network",
      "kind": "Logistics",
      "gold": 4200,
      "influence": 12,
      "industry": 1600,
      "days": 180,
      "max": 9,
      "effect": "Each upgrade reduces the distance supply penalty by 5% and improves ship repair rate by 10%. National logistics is the average of port access and convoy success × delivery coverage.",
      "level": "logistics"
    },
    "standardization": {
      "name": "Standardize production",
      "kind": "Skills",
      "gold": 5200,
      "influence": 20,
      "industry": 1900,
      "days": 180,
      "max": 9,
      "effect": "Each upgrade lowers new ship gold and industry prices by 5%.",
      "level": "standardization"
    },
    "radar": {
      "name": "Detection and radar coordination",
      "kind": "Technology",
      "gold": 7000,
      "influence": 20,
      "industry": 2100,
      "days": 180,
      "max": 9,
      "year": 1938,
      "effect": "Operational radar from level 6: +8 reconnaissance per hull, +22.2 km search reach, +20% AA and +8% combat effectiveness per upgrade.",
      "level": "radar"
    },
    "asw": {
      "name": "Convoy and ASW development",
      "kind": "Technology",
      "gold": 4500,
      "influence": 14,
      "industry": 1400,
      "days": 180,
      "max": 9,
      "year": 1937,
      "effect": "+10% escort ASW power per upgrade in fleet battles and convoy defense.",
      "level": "asw"
    },
    "aviation": {
      "name": "Carrier air operations doctrine",
      "kind": "Technology",
      "gold": 6200,
      "influence": 18,
      "industry": 2200,
      "days": 180,
      "max": 9,
      "year": 1938,
      "effect": "+4% carrier striking power per upgrade, including air-group conversion.",
      "level": "aviation"
    },
    "gunnery": {
      "name": "Fire-control development",
      "kind": "Technology",
      "gold": 5000,
      "influence": 16,
      "industry": 1700,
      "days": 180,
      "max": 9,
      "year": 1937,
      "effect": "+3% naval gunnery and +6% shore artillery power per upgrade.",
      "level": "gunnery"
    },
    "damage_control": {
      "name": "Damage-control organization",
      "kind": "Training",
      "gold": 4600,
      "influence": 14,
      "industry": 1200,
      "days": 180,
      "max": 9,
      "effect": "+6% damage resistance and repair rate, plus 1.5 percentage points of sailor rescue chance per upgrade.",
      "level": "damage_control"
    },
    "intelligence": {
      "name": "Naval intelligence coordination",
      "kind": "Government",
      "gold": 4400,
      "influence": 18,
      "industry": 800,
      "days": 180,
      "max": 9,
      "effect": "Each upgrade improves search coverage by 8% and the chance of receiving signals reports.",
      "level": "intelligence"
    },
    "influence": {
      "name": "Government confidence",
      "kind": "Government",
      "gold": 3800,
      "influence": 6,
      "industry": 400,
      "days": 180,
      "max": 9,
      "effect": "+1 influence income per month per upgrade, before treaty costs.",
      "level": "influence"
    }
  },
  "RULES": {
    "battleVariation": 0.08,
    "upsetChance": 0.002,
    "upkeepPerMonth": 0.002,
    "influencePerMonth": 5,
    "buildDays": {
      "BB": 1460,
      "BC": 1280,
      "CV": 1095,
      "CVL": 730,
      "CA": 900,
      "CL": 730,
      "DD": 450,
      "DL": 480,
      "DE": 365,
      "SS": 600,
      "TB": 365,
      "default": 600
    }
  }
}
```
