# Release 0.15 — consolidated ministry and resource balance

The UI requests are implemented. This audit covers internal consistency, the fourteen opening states, recurring cash flow, staffing, supply and existing combat/resource checks. Values without authored specifications remain provisional game balance. It is not a historical calibration of every combat outcome.

## Interface

Ten direct main menus replace the nested navigation: Command Map, Land campaigns, Ship catalog, Aircraft catalog, Fleet register, Facilities & research, Diplomacy, Battle reports, Naval record, Economy & trade. Aircraft production selectors remain above the aircraft catalog. The designer opens through one button in Ship catalog. The combined fleet register retains distinct warship, support and merchant totals, places legacy/reserve warships below the main warships, and searches all three services. Facilities and research share one scrollable page; losses/recovery are included in Naval record.

Both schools show elapsed calendar progress, the next graduation date and funded trainees. The first intake starts at campaign opening, including the partial February 1922 sailor intake. Monthly and quarterly graduation dates, leap years and year rollover are covered. These bars describe time to graduation, not a promise that an unfunded intake is complete.

Task-force selection opens assigned ships and operational details immediately. Individual ship inspections no longer require opening that section again afterward. The four facility expansion controls and diplomacy cooldowns retain their button rectangles.

## Corrections and balance changes

- Unspecified US and UK opening formations previously crowded into San Diego and Scapa Flow. The US supply statistic was about 7%, the UK about 14%, despite unused national facilities. Unspecified stations now spread across suitable owned bases according to capacity and navigable distance. Authored placements, such as the British Eastern Squadron, are retained. Existing voyages are never moved by this opening allocation. Default opening fleet supply is now about 59–76%, depending on navy and mission.
- The USA, UK and Germany previously lacked enough sailors for their complete authored starting fleets. Provisional 1936 sailor pools are now 104,000, 72,000 and 10,000 respectively; the 1922 economy applies its ordinary starting factor. All fourteen player openings can staff their commissioned warships. Subsequent construction and battle losses still require funded schools and calendar graduation.
- Factories formerly started at 100% funding, producing annual aircrew demand several times school intake. Some opening economies ran recurring deficits before ordering anything. Factories now start at 20%, schools at 100%. Funding remains adjustable from 10–100%; AI ministries use their normal monthly funding decisions.
- Base annual aviation-school output is Japan 400, USA 700, UK 500, Germany 180, France 300, Italy 280 and USSR 320. These represent all flying crew, including navigators/observers in multi-seat aircraft. Opening aviator reserves cover the first quarterly batch. Expansions still add 100 annual places. Higher factory funding or larger factories can deliberately outgrow the training pipeline.
- Explicit prepaid aircraft batches and continuous production previously each used the full factory capacity. They now share one throughput pool. Model qualification consumes its stated resources and time, without using production slots.
- The gold and industry hovers now include planned school and factory running costs. Economy & trade lists the four facilities' monthly-equivalent costs and the resulting planned balance. New procurement, projects, diplomacy and variable damage repairs are additional, clearly excluded costs.
- Training and logistics program effects now state their 100% caps. Later levels still improve decay, repair or convoy recovery according to their existing formulas.
- With the player's approval, ships automatically substitute newer, qualified aircraft of the same role when in port. Replaced aircraft return to reserve. Transfers neither create nor destroy aircraft or aviators, do not bypass development dates, and never change a deployed wing. Reserve aircraft still count toward total aviator demand.

## Opening operating plans

Monthly equivalents, rounded to whole game units, after upkeep, industry operation, both schools and aircraft production. These exclude new investments, diplomacy and damage repairs. All fourteen plans remain positive with default funding, although the 1922 Soviet economy has little discretionary cash before growth or funding adjustments.

| Campaign | Navy | Gold/month | Industry/month | Sailor surplus | New aircrew demand/year | Aviator graduates/year |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| The Treaty System | United Kingdom | 1,473 | 2,462 | 2,586 | 300 | 500 |
| The Treaty System | USA | 1,836 | 5,161 | 34,662 | 500 | 700 |
| The Treaty System | Japan | 614 | 2,721 | 13,430 | 333 | 400 |
| The Treaty System | France | 1,024 | 1,837 | 13,212 | 217 | 300 |
| The Treaty System | Italy | 846 | 2,061 | 14,738 | 200 | 280 |
| The Treaty System | Germany | 1,569 | 3,993 | 1,350 | 0 | 180 |
| The Treaty System | USSR | 105 | 2,117 | 11,485 | 183 | 320 |
| In Good Faith | United Kingdom | 4,317 | 3,909 | 14,959 | 360 | 500 |
| In Good Faith | USA | 4,619 | 8,495 | 9,310 | 500 | 700 |
| In Good Faith | Japan | 2,221 | 4,548 | 6,042 | 200 | 400 |
| In Good Faith | France | 2,029 | 2,913 | 8,503 | 217 | 300 |
| In Good Faith | Italy | 1,698 | 3,278 | 11,895 | 200 | 280 |
| In Good Faith | Germany | 2,733 | 6,272 | 1,183 | 120 | 180 |
| In Good Faith | USSR | 3,538 | 7,952 | 28,969 | 183 | 320 |

A separate 365-day recurring-economy test ran every daily payment and calendar graduation for all fourteen openings, without procurement, combat or AI intervention. No default plan exhausted its gold/industry reserves or developed an aircrew shortage. Full operational campaigns, including AI purchases and decisions, were also tested separately.

## Connected-stat review

| System | Reviewed behavior and limits |
| --- | --- |
| Gold | Monthly appropriation, domestic/trade scaling, hull upkeep and treaty policy; daily funded operations and repair debits. Planned budget does not subtract facility costs twice from monthly payment. |
| Influence | Monthly government support shares the domestic/trade income factor. Purchases and diplomatic costs remain explicit; expired secrecy no longer incurs treaty cost. |
| Industry | Output requires paid naval-industry operation. School/factory costs consume stock. Funding, expansion, merchant capacity and port trade have distinct effects. |
| Yard throughput | One national capacity; funding and dock availability constrain it. Overloaded orders take longer, no free work occurs at zero usable capacity, and cancellation refunds only the defined unfinished portion. |
| Merchant capacity | Merchant registered volume, naval displacement and support displacement remain separate. Industry levels raise shipping demand by 15% of opening capacity each; lost merchants and blockaded/lost ports reduce the trade share while preserving domestic income. |
| Supply | Nearest navigable friendly/allied port, stepped distance, local port demand/capacity, trade and mission. Depot/oiler benefits require their actual presence or delivered stores. Incomplete crews cannot sail. |
| Sailors | Monthly paid intakes; whole-hull staffing; crews remain aboard damaged deployed ships, reducing effectiveness until port recovery. Rescue and school intake are independent. |
| Aviators | Quarterly paid intakes; every owned aircraft contributes model-specific aircrew demand. Flying effectiveness requires whole crews; reserve aircraft still contribute to the displayed deficit. |
| Aircraft | Paid production and date-gated qualification; shared factory throughput; hangar and model-role constraints; new in-port modernization conserves inventory. |
| Training and morale | National preparation multipliers, capped gains, training decay, morale recovery toward baseline and combat/event changes. School quantity and fleet training quality remain separate. |
| Research | Four simultaneous projects, levels 1–9, escalating gold/industry cost, hard availability dates and all 126 level explanations. Standardization reaches a 40% price reduction at level 9. |
| Combat | Surface, air, submarine, ASW, AA and reconnaissance channels; submarines do not add surface gunnery. Staffing, health, preparation, supply and technology apply; normal variation stays small and exceptional swings rare. No forced parity between historically or alternatively unequal navies. |
| Damage and recovery | Typed hull losses and damage, personnel/aircraft conservation, physical return detachments, interception eligibility, paid safe-port repairs and one-time recovery credit. |
| War and campaign record | Naval loss/damage and merchant-loss ledgers remain separate from fleet inventory and land supply. Estimated war balance is not a hard victory condition. |

## Remaining abstractions and useful next choices

- The navies are deliberately asymmetric. Budget, supply and combat coefficients are provisional; passing these checks does not establish equal difficulty or historically exact battle outcomes.
- There is no peacetime personnel retirement, aircraft storage cost or player aircraft-retirement control. Long peaceful campaigns can accumulate reserves. A useful next gameplay decision is allowing retirement of surplus reserve aircraft, especially after modernization, so the ministry can reduce idle aircrew demand deliberately.
- Port demand uses displacement as a supply proxy. A large, distant fleet can still overwhelm a nearby small port. Route-level delivered-supply and escort-coverage history would make shortages easier to diagnose.
- Later training/logistics levels have diminishing immediate benefit near 100%; their secondary effects remain. Reworking these into an ongoing training-expenditure policy would be a separate gameplay change.

See [validation evidence](VALIDATION-0.15.md). Start a new campaign for the revised opening balance and station assignments; compatibility work for previous saves was not part of this release.
