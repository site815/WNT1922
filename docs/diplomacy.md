# Diplomacy, war warnings and alliances

Release 0.17.0. The numerical relations, trends and pressure values are provisional design interpretations of historical circumstances, not measured historical statistics. Both campaigns use the historical diplomatic starting position, including In Good Faith's alternate shipbuilding programs. All seven playable perspectives share the same 21 bilateral relationships in each campaign.

Implementation: `game/src/diplomacy-history.mjs`, `war-politics.mjs`, `diplomacy-rules.mjs` and `engine.mjs`. Regenerate this document with `node tools/export-diplomacy-docs.mjs`; pass `--check` to verify it.

## Opening relationships

Scores range from −100 to +100. The historical monthly column excludes the separate treaty-mistrust deduction. Diplomacy shows both components, their total, the historical context on hover, current war pressure and the actual warning risk or scheduled historical window.

| Pair | 1922 relations | 1922 historical change / month | 1936 relations | 1936 historical change / month |
|---|---:|---:|---:|---:|
| GBR / USA | +55 | +0.55 | +65 | +0.75 |
| GBR / JPN | +65 | +0.25 | +5 | -0.4 |
| GBR / FRA | +40 | +0.35 | +55 | +0.7 |
| GBR / ITA | +35 | +0.25 | -25 | -0.4 |
| GBR / DEU | +5 | +0.1 | +5 | -0.35 |
| GBR / SOV | -25 | -0.1 | -10 | +0.1 |
| USA / JPN | -15 | -0.25 | -25 | -0.7 |
| USA / FRA | +35 | +0.35 | +40 | +0.5 |
| USA / ITA | +30 | +0.25 | +5 | -0.2 |
| USA / DEU | +15 | +0.25 | -15 | -0.4 |
| USA / SOV | -35 | -0.2 | -5 | -0.15 |
| JPN / FRA | +25 | +0.2 | +10 | -0.2 |
| JPN / ITA | +20 | +0.15 | +10 | +0.2 |
| JPN / DEU | +5 | +0.1 | +15 | +0.35 |
| JPN / SOV | -65 | -0.35 | -55 | -0.7 |
| FRA / ITA | +10 | -0.1 | -10 | -0.25 |
| FRA / DEU | -55 | -0.45 | -55 | -0.9 |
| FRA / SOV | -45 | -0.25 | +30 | +0.55 |
| ITA / DEU | +10 | +0.15 | +5 | +0.2 |
| ITA / SOV | -15 | +0.05 | -5 | -0.2 |
| DEU / SOV | +0 | +0.15 | -55 | -0.85 |

GBR is United Kingdom; SOV includes the Soviet predecessor governments in the February 1922 start. The Treaty System begins with the Anglo-Japanese alliance still in force. Washington's Four-Power Treaty ends that alliance on 17 August 1923. Its consultation arrangement does not grant automatic naval access or compel war entry. [Washington conference context](https://history.state.gov/milestones/1921-1936/naval-conference), [Four-Power Treaty deposit record](https://2021-2025.state.gov/four-power-treaty-pacific-ocean/).

## Monthly change and strategic pressure

Once per calendar month, each pair receives its historical trend and a treaty-mistrust deduction. The deduction is:

`era × (0.9 + min(3, years since 1936 × 0.12)) × treaty factor`.

Era is 0.07 in The Treaty System before 1935, otherwise 1. Treaty factor is 1 before the limits expire and 0.2 afterward. During war, a positive historical trend is suppressed; a negative trend still applies. Scores are clamped to −100…+100. Events, diplomatic actions and discovered deception add separate changes. Historical trend changes never overwrite the relationship earned by the player.

Dated context includes Rapallo, recognition and normalization, Locarno, Manchuria, German rearmament, the Ethiopian crisis and wartime alignments. An Axis or Anti-Comintern relationship bonus requires that its pact actually formed. Other background trends are historical-era pressure, not hidden signed agreements. [Rapallo, German Federal Archives](https://weimar.bundesarchiv.de/WEIMAR/DE/Content/Dokumente-zur-Zeitgeschichte/1922-04-16_rapallo.html), [US recognition of the Soviet Union](https://history.state.gov/milestones/1921-1936/ussr), [1925 Soviet-Japanese convention](https://www.mofa.go.jp/region/europe/russia/territory/edition92/period3.html).

An ordinary war warning requires negative relations, pressure of at least 50, no alliance, no existing warning or war, and no current ceasefire. Once eligible, its monthly chance is the magnitude of negative relations: −30 means a 30% chance of a warning that month, not immediate war. This gate prevents early Soviet–Western hostility alone from creating routine 1920s wars.

Pressure is 0…100 and moves 20% toward its era baseline each month while there is no war or warning. All pairs begin at 5 before 1931. Thereafter German–Western, German–Soviet, Italian–Western and Japanese–Pacific pressures rise at different historical stages. Most unrelated pairs remain below 50 without repeated crises or provocations. Japan–Soviet pressure is higher in the late 1930s and falls after 1940. These thresholds are authored balance values, not probabilities derived from historical data.

Diplomatic visits reduce pressure by 4; industrial cooperation by 12. Insults add 5 and naval provocations add 25. A concealment scandal adds 5. Crisis choices that worsen relations raise pressure by the magnitude of that change. Ceasefires reset pressure to 15 and retain the existing one-year protection from ordinary renewed hostilities.

## Warning and declaration sequence

An ordinary warning chooses 1–12 calendar months uniformly. Calendar arithmetic preserves the day where possible and clamps month ends, including leap years. The warning displays its expected outbreak date. It is an irrevocable preparation interval: later friendship does not cancel it. Naval provocations retain a 30% chance of a limited clash when opposing ships are within 185.2 km; such a clash begins a warning instead of declaring a formal war immediately. Ships fight at their physical positions.

Eight warning introductions cover intelligence intercepts, opposing envoys, our cabinet, public pressure, embassy evacuation, merchant instructions, reservist summons and a border crisis. Warnings and declarations create compact mandatory popups and always pause, even if optional Auto-pause is unchecked. Acknowledgement resumes a previously running game after all mandatory decisions are resolved. A preexisting manual pause and a loaded game remain paused. Warning alerts give way to the declaration when hostilities begin.

Historical European wars retain their approved windows. In Good Faith keeps at most ±60 days around the September 1939 Polish invasion and British/French entry; The Treaty System keeps its tension-based ±365 days. Seeded 1–12 month warnings are scheduled backward from the actual outbreak. In The Treaty System, ordinary crisis pressure must exceed its historical baseline by more than 10 points to bypass a scheduled European warning; natural background tension alone cannot start that war outside its window. Direct provocation clashes can still trigger earlier warnings. Once the first European warning is announced, the internal 1922 date freezes. No outbreak date or countdown is shown to the player. Italian entry and the Eastern war also receive advance warnings. Joining an ally's existing defensive war is immediate and does not add another warning period.

## Alliances and political pacts

A negotiated naval alliance requires +100 relations and peace, with no committed warning. It grants friendly-port access and local support, and a defensive call when the partner is attacked. It does not require joining the partner's offensive war. Each government can have several allies. A mutual three-country alliance requires all three bilateral links; being allied to someone's ally is insufficient. Named pacts appear once in Diplomacy, and a partial withdrawal preserves unrelated bilateral commitments.

The player may join a defensive call immediately or refuse. Refusal ends the relevant alliance, reduces relations with that partner by 35, and costs up to 10 influence. The displayed default is refusal after 14 days. AI acceptance is clamped to 10–95%: 35% + 0.5 percentage points per relation point − 15 points for each existing war − 25 points if treasury is below 1,000 gold. An AI ally of the attacker refuses. Calls do not recursively propagate through allies of allies.

| Date | Event | Game effect |
|---|---|---|
| Opening | Communist International | Soviet political organization; no automatic naval alliance |
| 1922 opening–17 August 1923 | Anglo-Japanese alliance | Naval access and defensive calls until replaced by Washington consultation |
| 1936 opening | Franco-Soviet mutual-assistance treaty | Consultation in this naval simulation |
| 25 October 1936 | Rome-Berlin Axis | Political alignment |
| 25 November 1936 | Anti-Comintern Pact | German–Japanese political alignment |
| 6 November 1937 | Italian accession to Anti-Comintern alignment | Requires the earlier pact |
| 22 May 1939 | Pact of Steel | German–Italian naval alliance and defensive calls |
| 27 September 1940 | Tripartite Pact | Mutual German–Italian–Japanese naval alliance and defensive calls |
| Player-negotiated | Renewed Anglo-Japanese alliance | Named renewal event, with naval access and defensive calls |

The player may sign or decline when included in a proposed historical pact. Other signatories form it only if their current wars and committed warnings permit agreement. Signing adds 20 relations between signatories; Anti-Comintern agreements also lower each signatory's Soviet relations by 8 and raise Soviet war pressure by 8. Declining does not force a substitute alliance. The Anti-Comintern Pact and the Communist International are different organizations. [US Holocaust Memorial Museum: Axis agreements and chronology](https://encyclopedia.ushmm.org/content/en/article/axis-powers-in-world-war-ii).

The Franco-Soviet treaty historically provided mutual assistance subject to conditions; representing it as consultation for naval operations is a game abstraction, not a claim that its historical obligations were merely consultative. Likewise, the game's defensive-call rules simplify the Pact of Steel and Tripartite Pact and do not recreate every historical clause. [1935 diplomatic records](https://history.state.gov/historicaldocuments/frus1935v01/toc-papers).

## Limits and next balance questions

Relations remain bilateral scores and pressure is a separate scalar, without domestic factions, alliance conferences or secret clauses. The warning end date is precise for playability rather than an uncertain intelligence estimate. Its inevitability and duration are the user's chosen rule. Land campaigns remain strategic abstractions; this system governs relations among the seven simulated navies, plus the existing scripted European declarations.

Facilities now all open at 50%, retain independent 10–100% controls and do not increase automatically for the player during war. AI governments continue planning their own budgets. Aircraft production can outpace naval-aviation graduation, especially with multi-seat aircraft. Uncrewed aircraft remain grounded and the signed staffing deficit stays visible. Expanding schools or reducing factory funding is a real ministry decision; this release does not create free aircrews to erase a shortfall.
