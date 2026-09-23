# Battles over time

Naval encounters use five stages: contact, approach, opening attack, main engagement and disengagement. Damage is applied at the end of opening attack and each main engagement round, using the current surviving forces. A pause freezes fighting too; higher game speed accelerates battle time normally.

Only decisive actions create individual battle reports and optional watchable records. Qualification is fixed at contact from the forces actually participating: a battleship (BB), battlecruiser (BC), fleet carrier (CV) or light carrier (CVL), opposed by at least 5,000 tons of warships; or an air strike of at least 24 crewed strike/bomber aircraft attacking one of these capital ships. A surface action without capitals also qualifies when each side has at least 20,000 tons of surface warships and the combined force is at least 60,000 tons; submarines do not count toward this large surface-action exception. Auxiliary and merchant tonnage does not count. A carrier launching from beyond the engagement does not itself count as an attacked capital. Routine convoy raids, strategic bombing and coastal shelling remain background attrition; an anchorage strike can qualify when capital ships are actually among its targets. The report states the applicable rule and contact strengths. These thresholds are shared by the player and AI.

Minor actions still execute all the same exchanges over real simulation ticks, including aircraft recovery, casualties, rescues, repairs, consumed stores, morale, naval-war ledgers and limited-incident cleanup. They do not emit battle alerts, pause the game or leave individual reports. Their losses are collected by calendar month, both participating countries and region in a saved background-attrition ledger retaining 24 months. Entries show losses suffered by each country, including merchant losses, infrastructure damage and aircraft lost during recovery.

Decisive contact sends an alert without interrupting play. Opening Watch pauses the campaign; Next tick advances the entire world by exactly one 15-minute tick and pauses again. Each recorded frame is an observed group condition and actual accumulated loss delta; no tactical paths, gunfire or shot-level results are invented. Every tick from contact through disengagement is recorded, bounded to 128 frames with an explicit truncation marker if exceeded. At most 12 completed replays are retained, with an additional shared save-size budget; older replays are explicitly marked archived while their aggregate battle reports remain available. If ongoing recordings exceed the budget, intermediate frames are removed with a truncation marker. A loaded older report without frames remains an aggregate report; its missing chronology is never reconstructed. The user can replay recorded frames without changing simulation state. Blocking cabinet decisions still need acknowledgment before a new tick.

Surface actions usually last two to four game hours. Main engagement can repeat up to five times; these longer actions increase losses. Aircraft and merchant encounters use shorter stages. Air transit and deck preparation still happen before the local engagement; surviving aircraft then fly home. Fleets in a surface battle cannot simultaneously accept another surface engagement, merge, or execute new orders. Aircraft attacks on a force already fighting remain possible. Ships detach for repair after disengagement.

The first exchange uses 25% of the former single-action damage budget; the first main round uses 75%. Extra main rounds each use 35%. Current condition, preparation, opposing power and aggressive orders still affect every exchange. These are provisional gameplay durations and coefficients, shared by all nations.

```json game-data
{
  "STAGES": ["Contact", "Approach", "Opening attack", "Main engagement", "Disengagement"],
  "DURATIONS_MINUTES": {
    "surface": [[10,20], [25,45], [20,35], [40,65], [15,30]],
    "port": [[10,15], [15,25], [10,20], [20,30], [10,20]],
    "air": [[5,10], [5,10], [5,10], [10,15], [5,10]],
    "convoy": [[5,10], [10,15], [5,10], [10,20], [5,15]]
  },
  "SURFACE_ROUND_WEIGHTS": [55,25,12,6,2],
  "DECISIVE": {
    "CAPITAL_TYPES": ["BB", "BC", "CV", "CVL"],
    "MIN_OPPOSING_WARSHIP_TONS": 5000,
    "MIN_STRIKE_AIRCRAFT": 24,
    "LARGE_ACTION_SIDE_TONS": 20000,
    "LARGE_ACTION_TOTAL_TONS": 60000
  },
  "OPENING_WEIGHT": 0.25,
  "MAIN_WEIGHT": 0.75,
  "EXTRA_ROUND_WEIGHT": 0.35
}
```
