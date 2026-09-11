# SIM RULES — mandatory for every simulation, gauge and campaign analysis in this project

**Status:** binding. **Read before writing a single number.** Every sim must conform, and every sim must carry the conformance line in §5.

⚠ **NO SIMULATION, GAUGE OR CAMPAIGN ANALYSIS EXISTS IN THIS PROJECT, AND `audits/` IS EMPTY.** This file is the methodology and nothing depends on an output of it — every sim is an *output* under RULE 4, and an output is never an input.

**What that means for whoever reads this next:**

- **No standing verdict, tipover point, force ratio or deck count is quotable from anywhere.** A number wanted now is re-derived from the canon files, now, under these rules.
- **A new sim starts from zero.** It does not resume a series, inherit a scenario shape, or carry a previous run's conclusions forward.

---

## 1. The master rule

> ### Every historical fact is the output of preconditions. Change the preconditions and the fact is void.
>
> **There are no national characteristics — only conditions and their consequences.** Production, losses, technology dates, campaign schedules, morale, political will and industrial output are *all* outputs. None of them is a property a country carries into a different war.

Everything below is this rule applied to a specific way of breaking it.

---

## 2. The seven rules

### R1 — Do not inherit the historical war's *shape*
A campaign structure is not a given. **Before including any historical operation, name its preconditions and verify each one against this timeline.** The Central Pacific drive requires Pearl Harbor. MacArthur's New Guinea route requires Solomons sea control won at Guadalcanal first. Amphibious assault requires local sea *and* air control. **If a precondition failed, the campaign does not happen — and neither does anything downstream of it.**

### R2 — Derive forward, step by step
**Simulate each period from the previous period's actual end-state, not from the historical calendar.** Do not open the analysis in mid-1942 and work outward. Start at the divergence and walk forward. Every year's force, base and production picture is *computed* from the year before, never looked up.

### R3 — Programs are conditional, not national
**Manhattan, the B-29, the B-36, radar, VT, jet development — none of these is a national characteristic.** Each depends on funding, siting, priority, security, schedule and political survival, and every one of those is a war output. *"America has the bomb in August 1945"* is a fact about a war America was winning cheaply while unbombed.

### R4 — Never use an output as an input
**8.6M tons of Japanese shipping sunk is not a property of the US Navy.** It is the output of a campaign flown from Pearl, Midway, Guam, Saipan and Tinian, with Ultra, against an enemy with no convoy system. **Any figure expressed as "x% of historical" is importing the answer.** Derive the output from this scenario's conditions or do not use it.

### R5 — Any historical trend requires preconditions
Trends are not momentum. **A rising production curve, a declining loss rate, an improving technology schedule, a hardening political will — each rests on conditions.** If the conditions changed, the trend changes, and it may change *sign*, not just slope.

### R6 — An accurate assessment is not a balanced one
**We are measuring HOW unbalanced a situation is.** If the situation is lopsided, the output must be lopsided. **Do not add constraints to one side to make the ledger look even and call the result impartiality.** Symmetry is a bias, not a neutrality. **When the two columns come out looking comparable, treat that as a warning, not a result.**

### R7 — Re-audit for crept-in assumptions before publishing
**Assumptions with no basis in the current scenario will get in.** They arrive as familiar-sounding sentences. Run the post-flight checklist in §4 every time — especially against historical trends whose preconditions have changed.

### And the four that were already standing — they are cases of the same rule
- **R8** — Losses are outputs of engagement, and engagement is a choice. Model the decision, not the attrition.
- **R9** — Do not invent battles a competent commander would decline. *(A battle compelled by an objective is not invented. Say which.)*
- **R10** — A campaign's output is a property of its **bases**. Before quoting any achievement, ask *from where*, and check the place still exists on this timeline.
- **R11** — Every loss needs a **named mechanism**. If a hull, aircraft or division is gone, something has to have removed it.

---

## 3. Pre-flight checklist — run before writing

1. **Base ledger.** List every base each side holds, on this timeline, at this date. **Cross out every one this timeline's events removed.** Everything downstream re-derives from what's left.
2. **Precondition audit.** For every campaign, operation or program about to appear: write its preconditions and tick each. Untickable = it does not happen.
3. **Provenance pass.** For every number: name the war it came from. If that war isn't this one, derive it again.
4. **Constraint interrogation.** For every *"X cannot do Y"*: name what it depends on. If the dependency is a war output, the constraint is void.
5. **Mechanism pass.** For every loss you intend to book: name what caused it.
6. **Implication pass.** For every catalog feature the scenario touts, ask: **what does this let the force *do* that a conventional force cannot — and has anyone ever written that down?** **A specified feature with no stated operational consequence will be modeled conventionally by default.** *The tell: a sim uses a conventional value for something the catalog was explicitly designed to change — escort fraction 25% for a one-type air group; dawn-to-dusk operations for a fleet with a beacon net since 1931; zero mines for a navy where every stern rail lays them. **The error is invisible because the number looks normal, and looking normal is exactly the problem.***

## 4. Post-flight checklist — run before publishing

1. **Proper-noun sweep.** Search your own draft for historical names — *Midway, Guadalcanal, Coral Sea, the Marianas, B-29, Manhattan, Essex, Ultra, Hanford*. **Justify each occurrence from this timeline's conditions or delete it.**
2. **The evenness tell.** Do the two columns look comparable? Ask why. If it is because constraints were added to the stronger side, remove them.
3. **Self-contradiction sweep.** Does any claim contradict something earlier in the same document, or a standing verdict elsewhere in the series? *(Both have happened: the "cannot attack submerged" claim was refuted three pages earlier in its own file.)*
4. **Source-document check.** Does the catalog or scenario already answer this? *(Torpedo fast/slow settings were proposed as a design suggestion when they had been in the catalog since 1933.)*
5. **Propagation.** Every figure this changes upstream or downstream gets a **⟲** banner in its own file, naming the error and the rule it broke. **Withdraw the result; never quietly revise it.**

---

## 5. Conformance line

Every sim carries, in its footer:

> *Conforms to `SIM-RULES.md`. Pre-flight and post-flight checklists run.*

---

## 6. Error catalogue — every mistake this series has made, with its tell

Kept because **the tells are more useful than the rules.** Each of these felt reasonable while being written.

| Class | Instances | **The tell** |
|---|---|---|
| **A — Historical output used as input** | Japanese decline curve · Japanese passivity 1942–43 · suppressed Japanese production against historical American · historical US technology dates under siege · US submarine campaign as "% of historical" | A number arrives **already known**, without a derivation. If you did not compute it this session, it is suspect |
| **B — Campaign shape inherited without preconditions** | The Central Pacific drive and the Marianas at 0.5× · **MacArthur's Australia axis, one turn later** | A famous operation appears **by name** and its preconditions were never listed |
| **C — Immunity or sanctuary assumed** | Manhattan immunity · "US submarines invert the geometry off North America" (assumed West Coast sanctuary) | One side's infrastructure is **quietly exempt** from the war the other side is fighting |
| **D — Artificial symmetry / balance reflex** | The four Japanese constraints (China, Hawaii garrison, machine tools, political rigidity) · colonial nationalism · "Japan's advantage is at maximum now" · "America only needs it not to get worse" | **The ledger looks even.** That is the tell, every time |
| **E — Own sources unread** | Avgas bound defeated by the catalog's own Maru refueling rigs · torpedo fast/slow settings proposed as new · IJN pipeline quoted at 100/month vs the real 100/year · the 1935 training decision called "outside the model" when it is the model's **start date** | A constraint or feature is asserted **without opening the file that defines it** |
| **F — Unstated mechanism** | 1942 US −4 decks with "no Midway, no Guadalcanal" · 1943 JP −3 decks in a year with no fleet action | A loss column has **numbers but no causes** |
| **G — Stale figure not propagated** | Hawaii "returned at 1×" contradicting the corrected 1× gauge · the 1× V3 verdict table left standing after two later corrections · the ~10–12 deck threshold derived from a December 1941 deck count carried through 1943 | A correction was made **and its consequences were not chased** |
| **H — Overstatement beyond the evidence** | "A Gato cannot attack submerged at all" · "Panama halved" · Battle of Britain framed as vast numerical inferiority when the RAF out-produced Germany · a bare "14:1" not derivable from its own table | An **absolute** where a mechanism would do. Absolutes are almost always the overstatement of something true |

---

## 7. The two findings these rules were paid for

**Every constraint proposed against Japan across eleven versions dissolved on contact with rule R5 — except one.** *Japan cannot invade the United States.* Everything else was a war output, a cost, or an import from a Japan that lost.

**And the corrections have not converged on the middle.** Some moved the verdict toward America, some toward Japan; the largest single one — the shipping war — moved it toward Japan precisely because that was where an *American* figure had stopped being derived. **They converged on wherever a number had stopped being derived. That is the only convergence worth having, and it is what R6 protects.**

*Binding on every sim in this project. Amend by adding, not by softening.*
