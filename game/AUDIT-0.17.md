# Release 0.17 — diplomacy and preparation audit

## Implemented behavior

All four facilities start at **50%** in all fourteen campaign starts. Each retains its independent 10–100% funding control. There is no wartime auto-raise checkbox or automatic funding increase for the player. AI governments continue to make their own budget decisions. The upgrade explanation is at the bottom of its facility card, alongside the level and upgrade action. Current costs, output and graduation progress remain visible above.

Fleet details use a continuous list of assigned ships. Fleet-register summary cards jump to warships, support or merchants and clear any search/filter that would hide the destination. An empty category explains that it has no hulls. Source-register references have moved out of the register UI; the canonical platform and equipment documents remain available. All seven Treaty System introductions are shorter, and the start screen omits the repeated 1950 and ministry-tagline copy.

The two historical opening relationship matrices replace generic universal friendliness. Diplomacy displays the historical monthly component, treaty mistrust, net change and strategic pressure. Negative relations alone cannot cause ordinary war: pressure must reach 50. Eligible negative scores retain the original probability scale, but now produce an irrevocable **1–12 calendar month warning** before hostilities. A nearby provocation clash also starts this preparation phase instead of declaring formal war immediately.

Historical European outbreak windows remain ±60 days in In Good Faith and ±365 days in The Treaty System. Warnings are scheduled in advance. Once a 1922 European warning is announced, its date stops moving. War warnings and declarations always pause and open compact popups. Acknowledgement resumes previously running play after all mandatory choices are handled, while preserving manual and loaded pauses. Warning entries give way to the declaration at outbreak. Existing fleet orders remain in force.

Naval alliances support several partners, including a mutually allied triangle. Defensive calls offer join/refuse choices; refusal ends that commitment and costs relations and influence. Political pacts do not grant naval access or automatically spread wars. Historical Axis, Anti-Comintern, Pact of Steel and Tripartite events can be signed or declined by a participating player. The original Anglo-Japanese alliance expires when the Four-Power Treaty enters into force; negotiating another one produces a renewal event. Named multi-power pacts display once, and partial withdrawal retains unrelated bilateral commitments. [All rules, numerical starting scores and historical sources](../docs/diplomacy.md).

## Integration corrections found during verification

- Diplomacy cooldowns can begin at any minute. Save validation now accepts their finite fractional-day completion times instead of rejecting a valid order made after midnight.
- A pending mandatory popup blocks time stepping and resuming. Keyboard focus remains inside it, and background alerts no longer duplicate its choice buttons.
- Register jumps use immediate section positioning: animated scrolling could be interrupted by live list updates before reaching long merchant lists.
- Signed historical pact bonuses require that the pact formed; declining an agreement no longer leaves an alignment bonus with a contradictory explanation.
- Pact entries are consolidated. A three-power treaty does not appear as three copies of the same treaty plus another alliance card.
- A daily diplomatic sweep found that background pressure could bypass the 1922 European window. Scheduled pairs now require an actual crisis excess above their historical pressure baseline before an ordinary warning can override that schedule. Direct provocation clashes retain their earlier-war route.
- Package metadata, source version, generated national catalogs and the current validation index agree on release 0.17.0. New save format: 8.

## Funding and personnel balance

Every new ministry has a positive planned gold and industry operating balance at 50%. A separate 365-day recurring-economy check, without procurement, combat or AI intervention, kept all fourteen ministries' gold and industry reserves positive. This is an operating-budget test, not a guarantee of wartime solvency.

Aircraft are physical stores and all owned aircraft count toward staffing demand. Higher production with lower school funding can accumulate uncrewed aircraft. The table reports the lowest aviator balance observed during that same isolated year; a negative value is grounded aircraft staffing demand, not a negative number of living personnel.

| Nation | 1936 lowest aviator balance | 1922 lowest aviator balance |
|---|---:|---:|
| United Kingdom | −530 | −395 |
| United States | −774 | −760 |
| Japan | −181 | −550 |
| France | −323 | −330 |
| Italy | −310 | −299 |
| Germany | −185 | +45 |
| Soviet Union | −229 | −231 |

All opening fleets are staffed; these later shortfalls reflect the production/training rates and multi-seat aircraft, not missing starting sailors. The release keeps the requested 50% defaults and shows the consequence rather than supplying free personnel. Sailor graduation remains monthly on the first; aviation-school graduation remains quarterly on the first of January, April, July and October. Schools accumulate funded training before graduation. [Resource-year measurements](test-output/release17-resource-year.json).

## Remaining abstractions and proposed next work

The strategic war-pressure threshold is an approved safeguard against implausible wars driven only by poor relations. Its values, relationship scores and monthly historical effects are authored balance judgments. They are not historical measurements. War warning dates are exact and irreversible by the requested rule; actual intelligence would have greater uncertainty. Alliances use naval-access and defensive-call rules rather than reproducing every historical treaty clause. Land forces, trade packets and port facilities retain the abstractions documented in [the base-aviation audit](AUDIT-0.16.md).

Three useful next changes require a gameplay decision before implementation:

1. **Air-group establishments and replacement targets.** Set desired reserve aircraft and aircrew strengths by role; stop or redirect production above the target. This would let a ministry keep its chosen funding while avoiding unlimited surplus airframes. It would change the present continuous-production rule.
2. **Alliance readiness and shared plans.** Show each ally's expected response and conflicting commitments before war, and offer a common convoy-defense or theater plan. A displayed AI acceptance estimate would make diplomatic commitments easier to judge.
3. **Domestic war support.** Separate public willingness to sustain casualties from strategic war pressure. Trade losses and long wars could affect ceasefire willingness and influence income through that support, making wartime diplomacy less dependent on a single relationship score.

For distribution, a restricted Windows beta is the next technical step after portable packaging and asset-license review. The current CShapes map license has a noncommercial restriction; the development launcher also relies on a runtime installed on this computer. [Concrete beta distribution plan](../docs/beta-release.md). No external publication has occurred.

[Validation evidence](VALIDATION-0.17.md).
