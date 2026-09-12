# treaty policy — data and balance

Edit the JSON block directly. The game reads this document at startup; no export step is required.

Disclosure has no monthly charge within the limits or the 10% administrative tolerance. Legal obligations and actual excess remain visible separately: tolerance is a pricing concession, not a larger treaty allowance. Beyond it, disclosed excess attracts the full sanctions rate. Forbidden categories with a zero allowance have no tolerance. Concealment pays its administration fee plus the per-hull or per-ton rate. Authorized retained ships keep their existing treaty exceptions.

```json game-data
{
  "TREATY_POLICIES": {
    "disclose": "Disclose",
    "false_numbers": "Lie about numbers",
    "false_tonnage": "Lie about tonnage"
  },
  "TREATY_SWITCH_GOLD": 1200,
  "DISCLOSURE_TOLERANCE": 0.1,
  "CONCEALMENT_BASE_GOLD": 100,
  "CONCEALMENT_BASE_INFLUENCE": 0.1,
  "LIMITS": {
    "USA": {
      "capital": 525000,
      "carrier": 135000
    },
    "GBR": {
      "capital": 525000,
      "carrier": 135000
    },
    "JPN": {
      "capital": 315000,
      "carrier": 81000
    },
    "FRA": {
      "capital": 175000,
      "carrier": 60000
    },
    "ITA": {
      "capital": 175000,
      "carrier": 60000
    },
    "DEU": {
      "capital": 183750,
      "carrier": 47250
    }
  },
  "GERMAN_RESTRICTIONS": {
    "before": 1935,
    "capital": 60000,
    "carrier": 0,
    "perCapital": 10000,
    "perOther": 6000
  },
  "PER_HULL": {
    "capital": 35000,
    "carrier": 27000,
    "cruiser": 10000
  },
  "DISPOSAL_GRACE_END": "1922-08-06",
  "MONTHLY_RATES": {
    "disclose": {
      "basis": "tons",
      "gold": 0.06,
      "influence": 0.00005
    },
    "false_numbers": {
      "basis": "hulls",
      "gold": 70,
      "influence": 0.035
    },
    "false_tonnage": {
      "basis": "tons",
      "gold": 0.003,
      "influence": 0.000003
    }
  },
  "INITIAL_EXPIRY": "1936-12-31"
}
```
