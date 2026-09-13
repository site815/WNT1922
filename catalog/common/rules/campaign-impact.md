# Battle significance, morale and campaign scoring

All navies use the same thresholds. These are provisional playtest values, not historical statistical estimates. A **completed** action is significant if either side's combined losses meet any one threshold below: naval tonnage sunk, new damage-equivalent tonnage on surviving ships, aircraft destroyed, or merchant GRT sunk. Registered merchant volume is assessed separately from warship displacement. Rescued people and repairable aircraft do not count as destroyed aircraft.

Only a significant action with a winner gives the victory/defeat morale change. Lesser actions remain in reports and win/loss statistics, without changing morale. The report's major/minor label cannot itself trigger morale. No effect is applied per combat round. Draws have no battle morale effect.

Recorded territorial occupation or liberation changes morale for the actual gaining and losing governments. Home economic regions have the larger effect; other territories and islands use the smaller one. Multiple territories secured in one campaign resolution apply only the largest gain/loss per government. Merely starting or repelling an offensive without changing ownership has no territorial morale effect. Dated peaceful transfers do not count as captures.

Existing training, unpaid-fleet, event and gradual recovery effects remain. The coefficients below drive the shared mechanics and morale hover. Morale stays within 10–100 for combat, occupation, upkeep and daily recovery; training and authored event effects retain their 0–100 bounds.

The campaign's **war score = enemy naval displacement sunk / 1,000**, rounded to the nearest point. It has no victory-count bonus, defeat-count penalty or upper cap. Merchant GRT and aircraft losses stay in their separate records and are not converted into naval displacement. Fleet growth, economy and readiness remain the other score components. The current-war balance estimate is a separate operational estimate, not this campaign score.

```json game-data
{
  "SIGNIFICANCE": {
    "navalSunkTons": 5000,
    "navalDamageTons": 20000,
    "aircraftLost": 100,
    "merchantGRT": 50000
  },
  "MORALE": {
    "victory": 3,
    "defeat": -5,
    "territoryGain": 1,
    "territoryLoss": -2,
    "homeGain": 3,
    "homeLoss": -5,
    "training": 3,
    "unpaidFleet": -3,
    "recoveryTarget": 75,
    "dailyRecovery": 0.0006,
    "floor": 10,
    "ceiling": 100
  },
  "SCORE_NAVAL_TONS_PER_POINT": 1000
}
```
