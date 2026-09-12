# Operational and strategic air warfare

These are shared, provisional game rules for every nation. Actual aircraft radius, speed, crew and bomb payload come from the aircraft catalogs. Search and launch weather/daylight are in air-conditions.md. Airframe inventories move physically between hangars, sorties and recovery; a launched aircraft cannot simultaneously defend its base.

Strike assembly takes the base minutes plus minutes per attacking aircraft and per missing training point. Fighters retain a defensive reserve: at most 35% accompany a strike; CAP uses 60% of the fighters still present. Flights must be able to return before unsuitable launch conditions. Admirals assemble at least the force specified in engagements.md.

Army commands evaluate bombing opportunities hourly and can launch one strategic operation per nation per seven days. Payload and surviving attack power determine disruption. Each attack can disrupt at most 2.5% of remaining production, scaled to the target economy; shipyard disruption is capped at 60%. Facilities begin repairing a day after the latest attack, at 0.06 percentage points per day, constrained by gold and industry. These are abstract coastal industrial targets rather than a detailed inland bombing map. The economic growth response to disruption is defined in economy.md.

```json game-data
{
  "sorties": {
    "minimumCruiseKmh": 110,
    "fallbackSpeedKmh": 240,
    "cruiseFraction": 0.7,
    "fighterEscortFraction": 0.35,
    "attackFraction": 0.75,
    "aggressiveAttackFraction": 0.9,
    "capFraction": 0.6,
    "minimumCarrierFuelFraction": 0.15,
    "baseCycleMinutes": 360,
    "assemblyMinutes": 35,
    "assemblyPerAircraft": 0.3,
    "assemblyPerMissingTraining": 0.4,
    "recoveryAllowanceMinutes": 30,
    "contactMaxAgeMinutes": 360,
    "capAviatorRescue": 0.5,
    "capAirframeRescue": 0.08,
    "launchEnduranceNm": 5
  },
  "strategic": {
    "planningMinutes": 60,
    "planningOffsetMinutes": 23,
    "minimumBombersToConsider": 2,
    "dockPriority": 3,
    "tradePriorityScale": 100,
    "distancePriorityKm": 800,
    "cycleDays": 7,
    "fallbackPayloadKg": 500,
    "attackPowerPerBomber": 12,
    "minimumEconomyScale": 0.4,
    "yardScale": 100000,
    "industryScale": 60000,
    "payloadScaleKg": 2500000,
    "maximumDamagePerStrike": 0.025,
    "yardDamageLimit": 0.6,
    "repairQuietMinutes": 1440,
    "repairGoldAnnualShare": 0.22,
    "repairIndustryAnnualShare": 0.14,
    "repairDailyFraction": 0.0006
  }
}
```
