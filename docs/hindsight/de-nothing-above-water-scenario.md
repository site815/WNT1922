# Nothing Above Water — Germany (Hindsight Scenario)

**Project:** WNT1922
**Version:** 0.53
**Companion to:** `docs/hindsight/de-nothing-above-water-platform-catalog.md` (ships and aircraft) · `docs/hindsight/de-nothing-above-water-equipment-catalog.md` (weapons, sub-equipment, kits, ordnance) · `docs/hindsight/de-nothing-above-water-road.md` (the prohibition, the 1918–35 timeline and **the ledger**)
**Conventions:** `docs/equipment-conventions.md` — display law and band definitions · shared treaty frame `../hindsight-scenarios.md` §1.4
**Owns:** the order of battle, the opening state, **and every ruling** (§5).
**Status:** Canonical design reference. **The scenario skeleton, shared by all four nations:** 1 Thesis · 2 Strategy · 3 The fleet · 4 National state · 5 Rulings · 6 Opening decisions · 7 Standing pressures · 8 Rivals · 9 Data & schema.

⚠ **`hindsight-scenarios.md` §6 remains the founding section and every figure in it is preserved unchanged.** This file derives §6.4's fleet — which §6.4 itself marks *to be derived* — and rules the three questions the catalogs left open. Where a figure is derived rather than stated, the derivation is named.

---

## 1. Thesis

**Germany lost the first tonnage war to the convoy, not to the enemy's technology, and one of the men who worked that out was in a British prison camp while he did it.**

A navy that adopts that conclusion in 1920 as an official finding rather than as one officer's memorandum, and never revises it, spends the next fifteen years building for **numbers and coordination** instead of quality — and builds nothing that floats on the surface if it can help it. There is no battle line, because a battle line is an argument with the Royal Navy that Germany has already lost twice. **There is only the trade.**

The player inherits the only navy on the board whose problem is not what to build. That was settled in 1922 and has not been reopened since. ⚠ **The problem is that she has 33 submarines, one airplane type that can search 615 kilometers, and one deck to fly it from** — and a wolfpack's binding constraint is *finding* a convoy and not sinking one. She is the freshest crisis in the world and she is blind.

---

## 2. Strategy

### 2.1 Build sequencing — the flat decade, and it is the divergence

⚠ **The remarkable part of the German construction curve is the part that looks like nothing.** `build_model_de.py` runs 1922–31 at **5,600 t-equivalent a year** — Germany's real historical construction rate, under a tenth of Japan's envelope and under a tenth of Britain's — and lays down **one hull** with it: *Emden*, ordered on 8 December 1921 before the argument was won, and the last cruiser Germany ever lays down. Everything else in those eleven years goes on a fleet she is not permitted to own, and **buys no tonnage whatever.**

The gain is **lead time**, and that is the only claim in this file that can be checked by arithmetic rather than argument. With thirteen years of drawings, jigs, foreign-built prototypes and foreign-trained crews behind it, a coastal boat is **one year** from order to commissioning and an ocean boat **two**. Without them they are three and five, and `python build_model_de.py --leads` runs the identical envelope on the identical shares and returns, at the end of 1935, **not one submarine in commission and the first raider a year late.**

⚠ **The 1933 money is therefore the least interesting thing that happens to this navy.** A large industrial country that decides to build submarines can build submarines; the envelope goes 9,000 → 22,000 → 48,000 → 84,000 t-equivalent in three years and there is nothing clever about it. **The June 1935 announcement is the eleven flat years being spent in public.**

### 2.2 The doctrine — numbers, coordination, and the thing that is never on the surface

**Everything in this navy is downstream of one sentence: the convoy is the target and the convoy must first be found.**

- **No capital ship, no aircraft carrier, no cruiser.** Every mark spent on one is a mark not spent on the argument. ⚠ **The absent roles carry as much of the strategy as the present ones** (frame §1.3).
- **No boat is designed around the tender.** Every submarine is drawn for **independent operation** — its own bunker, its own outfit, its own passage out and home. The raider–tender is a **multiplier and never a dependency**: where one is in the same ocean a patrol is extended, and where none is, the patrol still happens.
- **One weapon, one magazine, one drill book, one stockpile.** A raider's fixed tubes, an ocean boat's six and an Elektroboot's outfit are the same torpedo from the same crate, which is the only economy this navy has been able to afford.
- **The training pipeline is a warship class.** The coastal boat is small, slow, short-legged and the most important hull in the navy, because the ocean boats are crewed by men who learned in her: one design, one set of drills, one instrument layout, one torpedo, and **an officer moving up finds nothing he has to unlearn.**
- **Report first, attack never.** The operational rule written into the search aircraft's handbook and into the boats' orders alike. An airplane that stops to attack has stopped searching.
- **Anything which transmits is a beacon for something that does not.** The fleet's surface officers said so about radar in 1931 and were overruled; the same sentence is why the warning receiver was funded in 1938 against the laboratory's own product, and why the scanning transmitter on the 1940 array comes with an order not to use it.

### 2.3 Personnel — the constraint the model does not carry

The hydrophone school predates the first set by three years and was the more expensive of the two: ratings are trained for a year on nothing else. The coastal-boat flotillas are the officer pipeline. And the crews that came home from Finland, Spain and Turkey through the twenties are the reason a yard could commission a boat in twelve months in 1935.

⚠ **AND THIS IS THE HOLE IN THE ARITHMETIC, STATED PLAINLY BECAUSE IT IS NOT MODELED.** `build_model_de.py` is a purse and it prices steel, not people. Forty-three boats in commission at the start date is about 1,700 submarine ratings and officers with sea qualification, which the twenties can just about account for. **The model's END 1939 figure of 359 boats is roughly 17,000, and its END 1945 figure of 812 is nearly 40,000** — and every one of them is a man who has to be trained by somebody who has been to sea. The tonnage is affordable. **The pipeline is the thing that will actually bind, and a future ruling that wants this fleet smaller should reach for the school and not for the envelope.**

### 2.4 Search — the arm that exists so the fleet can see

**The wolfpack's binding constraint is finding convoys and not sinking them**, so reconnaissance is held as an aircraft line, and the divergence there is cheap: the historical loss of naval aviation to the Air Ministry is a **1933–35 political output**, and an arm founded in the twenties predates the man who took it.

⚠ **Neither airplane needs an aerodrome** — catapult, fjord, estuary or lee shore — which is the reason a navy that owns none chose them. And **the reconnaissance gap at the start date is real and is not closed until 1940**: one search type, 615 km, no radar, and **one raider in commission to fly it from.** The only search that reaches the middle of the ocean flies off a raider, there is one raider, and the airplane that fixes it is four years away. Every hull laid down since is another eye, which is why the raider line was never allowed to close.

---

## 3. The fleet, 1 January 1936

*Strength six months after the announcement. Hull counts are `build_model_de.py`'s and its rows are END OF YEAR.*

### 3.1 Order of battle

| Force | Strength | State |
|---|---|---|
| **Ocean boats** — Wolf, Typ VII | **6** in commission · **55 building** | 1,120 t · 30,000 km on her own bunker · 6 tubes · **a search set on her mast, the first in any navy.** She reaches the Cape, the Caribbean or the Indian Ocean and returns without meeting anybody |
| **Coastal boats** — Hecht, Typ II | **27** in commission · **59 building** | 320 t · 5,500 km · 3 tubes · twelve months keel to commissioning. ⚠ **The most important hull in the navy, because it is the school** |
| **Raider–tenders** — Seeadler class | **1** active: *Seeadler* · **3** building: *Kormoran*, *Widder*, *Möwe* | 19,000 t · 33 kt · 6 × 28 cm forward · 64,000 km · 4 aircraft · 60 spare torpedoes and 3,000 t of transferable oil. **One keel a year since 1932 and the line has never been closed** |
| **Aircraft** | **Seeschwalbe**, 4 embarked + 1 spare | 615 km combat radius, no radar, 7.5 h. ⚠ **This is the entire naval air arm and it flies off one ship** |
| *(inherited)* Capital ships | **8**, none modernized | Six *Deutschland* and *Braunschweig* pre-dreadnoughts in commission and two in reserve, the newest designed in 1903. Not one mark spent on any of them since 1922 |
| *(inherited)* Cruisers | **7** | *Emden* (1925) and six Gazelle/Bremen survivors. The Königsbergs, *Leipzig*, *Nürnberg* and all three Panzerschiffe were never ordered |
| *(inherited)* Flotilla | **12 + 12**, all prewar | The V-class destroyers and A-class torpedo boats Versailles allows. They exist so that officers can go to sea |

**Not yet in existence, and dated:** Atlantis-class raider (1940) · Hai, Typ IX mass-production ocean boat (1937) · Schwertwal, Typ XXI Elektroboot (1941) · Albatros long-range search aircraft (1940). ⚠ **None of them may be quoted as present at the start date, and the boat the campaign is eventually made of has not been drawn.**

### 3.2 The build, 1922–1935

| Period | Envelope, t-equiv/yr | Laid down | What the money actually did |
|---|---|---|---|
| 1922–31 | **5,600** | *Emden*, and nothing else | The Hague office, prototypes in Finland, Spain and Turkey, jigs, drawings, the battery line, and **crews.** ⚠ **No tonnage at all** |
| 1932 | 9,000 | first raider keel | A 19,000-ton hull is more than two years of the whole construction vote, which is why 1932 and not 1928 |
| 1933 | 22,000 | ocean boats ordered | The money arrives at a program eleven years old |
| 1934 | 48,000 | coastal boats ordered, **nothing commissioned** | Sections, jigs and machinery at yards that already had the drawings |
| 1935 | 84,000 | everything, in public | **June: announced. Autumn: in the water** |
| 1936–39 | 78,000 | — | |
| 1940– | 104,000 | — | |

### 3.3 Inputs — the side of the trade war nobody models

⚠ **Germany's whole thesis is attacking somebody else's imports, and her own position is worse than the target's.** She has no oil of her own, no rubber, no ore route that is not a sea route or a land route through somebody's territory, and the fleet she has built is the one instrument that cannot protect any of it. The submarine is the cheapest warship per ton of enemy shipping sunk and **the least useful warship ever built for keeping a lane open.** There is no German answer to a blockade in this scenario and the file does not pretend to one.

**Six block-capable yards**, none of them naval, sections drawn to travel by rail so that the shed and the slip need not be the same place. That is the only industrial advantage in the file and it is worth more than any of the ships.

---

## 4. National state

- **Industry:** the marine diesel leads the world; the battery line is nineteen years deep; the valve laboratory had a pulse set on a barge in 1931. **Armor and heavy gun development stopped in 1922 and there is nothing to restart.**
- **Doctrine:** trade attack, perfected on paper for thirteen years and never once tested against a defended convoy. ⚠ **Every anti-submarine method built between 1917 and 1941 assumes a submarine spends most of its life on the surface, and so, quietly, does every German attack drill written before 1940.**
- **Politics:** the finding of 1920 was adopted by a navy and not imposed by a state, which is why 1933 changed the budget and not the plan. **The Great General Staff was dissolved in 1919 and not reconstituted**, and that absence is the reason the submarine faction could win an argument in 1922 and hold it for a decade.
- **Intelligence:** she is the only nation in the scenario whose deception is already over. **Her exposure is six months old when play begins**, which makes her the most watched navy in the world and the one with least left to hide.
- **Fuel:** wholly imported, and §3.3.

---

## 5. Rulings

⚠ **A ruling states what is true, and the file it lands in is the one that owns the fact.** The road file owns Germany's prohibition, dates and ledger; this file owns the order of battle, the rulings and the opening decisions.

### 5.1 The Elektroboot is a 1941 boat, and her cell and array are dated to meet her

The Schwertwal contradicted herself: dated 1941, fitting a C/41 cell and a C/40 array that the equipment catalog coded 1944 and 1943. ⚠ **RULED: the boat's date stands and the components move.** The cell is **[de41bat]**, drawn C/39 and in the water in 1941 — which is what `de-nothing-above-water-equipment-catalog.md` §4.2's own register always said (*"the 1941 cell is the Elektroboot"*) — and the array is a new generation, **[de40snr]**, GHG C/38, whose distinguishing feature is **passive ranging to firing accuracy: a boat fires on the array alone, with no periscope raised.**

**That is not a detail; it is the precondition for the whole class.** A hull that must show a periscope to shoot is not a boat that never comes up, so without a 1940 ranging array the Elektroboot cannot be drawn as canon describes her. The 1943 array survives, redated GHG C/40, with roughly double the passive range. ⚠ **It gives bearing and range and gives no depth**, as the real Balkon-Gerät of 1943 did not.

⚠ **And a claim was wrong and is corrected:** the cell is **73 percent** better than the first ocean boat's, not four times better — 22.0 Wh/kg to 38.1. The four-fold figure belongs to the boat: 1.71 kWh per ton submerged to **5.71, which is 3.3 times.** 73 percent came from the chemists and the rest from a naval architect who gave the battery the hull instead of the other way round.

**Why the date matters strategically:** frame §6.5 is a race — *does the boat that never surfaces arrive before the countermeasure does?* At 1941 the race is live and the German game is worth playing. At 1944 it is a race already lost, and the scenario becomes an exercise in surviving a verdict rather than contesting one.

### 5.2 The torpedo works

⚠ **[de38tor] carries a working influence pistol alongside its contact pistol, and there is no failure period, no withdrawal and no reliability penalty on any German weapon in this scenario.** The Inspectorate that proofed the pistol was funded through the flat decade on one of the few lines the prohibition left open, and it fired against moving hulls before issue. The historical collapse of 1939–40 is the output of preconditions this navy does not have.

⚠ **Do not re-derive a failure from the historical Torpedo Inspectorate collapse of 1939–40.** A historical fact is the output of preconditions (`sims/SIM-RULES.md`) and these preconditions are not read that way: the thirteen clandestine years bought a better body, a wakeless drive and a pattern gyro, and nothing is charged against the pistol for them.

**Every constraint on this navy is therefore external** — the reconnaissance gap (§3.1), the crew pipeline (§2.3) and the countermeasure race (§5.3). **She has no internal failure of her own and is not to be given one.**

### 5.3 The centimetric ship line reopens at 1944, and it arrives after the crisis

⚠ **The ship radar line does not close at [de40rad].** The laboratory that had a working pulse set on a barge in the Kieler Förde in 1931 marinises its own airborne centimetric set: **[de44rad], FuMO C/42, 9 cm, in the water 1944** — the drawing signed two years before the set goes to sea, which is this navy's habit and not a slip.

**The gain is resolution, not range.** [de40rad] at 60 cm cannot separate a conning tower from the return off the sea around it; at 9 cm the beam is narrow enough that it can — **a surfaced boat at 8 kilometers, a periscope at 2, low-angle air search at 45, ranging to ±15 meters and a plan display worth reading in weather.** The raiders get a search set that finds a convoy without transmitting for three minutes; the Elektroboot gets the first German set small enough to be worth a mast on a hull that does not want one.

⚠ **WHAT IT DOES NOT DO IS CLOSE THE COUNTERMEASURE GAP, AND THE DATES ARE THE REASON.** The British Type 271 was at sea in August 1941 and the American SG in 1942. **A German set in 1944 is two to three years behind the ships hunting her boats, and it arrives after 1941–43, which is when this campaign is decided.** Reopening the line moves Germany from *permanently absent* to *late*. ⚠ **`docs/equipment-conventions.md` §8 will not carry more than that**: search sensors are her interest band, but even at +5 the line cannot be dragged in front of the airborne set it is derived from, and the warning receiver [de44det] remains what a boat actually has when an aircraft is looking for her.

**And the timing is a decision, not a gift** (§6.8). The laboratory has one centimetric effort and it can go to sea or into the air, not both at once.

---

## 6. Opening decisions

1. **The blindness, and it is the first thing on the desk.** One search type, 615 km, no radar, one deck. The Albatros is a 1937 requirement that has not been written. **Write it now and it arrives in 1940; write it in 1938 and it arrives in 1941; and every month of delay is a month of patrol lines searching with binoculars.** The money comes out of boats.
2. **Coastal or ocean.** The coastal boat is the school and the ocean boat is the campaign, and the 1936 envelope buys about 40 of the first or about 11 of the second. ⚠ **Buy the school and the fleet of 1940 has crews; buy the campaign and the fleet of 1937 has boats and nobody to put in them** (§2.3).
3. **The raider line, every single year.** One keel a year since 1932, and each one is 19,000 t — two hundred coastal boats' worth over the program's life. **She is a multiplier and never a dependency, so the honest question is whether a multiplier is worth its price**, and the answer changes the moment a rival's cruisers can catch her (§8).
4. **Six yards, none of them naval.** The block-build capability is the only industrial advantage in the file. **Expand it and the 1937 mass boat arrives in quantity; leave it and she arrives on schedule and in ones.** Nobody will notice either decision until 1940.
5. **The proof range nobody has asked for.** A German firing range, a German target hull and a hundred live rounds cost about four boats and eighteen months, and no officer in the building believes anything in the magazine needs it — the weapons work (§5.2). ⚠ **What a range actually buys is not reliability but PERMISSION TO CHANGE THE WEAPON**: a navy with nowhere to fire cannot adopt a homing head, a pattern gyro or a new pistol on anything but a foreign customer's certificate, and every future generation in `de-nothing-above-water-equipment-catalog.md` §6.1 arrives on trust until this is built.
6. **The pre-dreadnoughts.** Eight capital hulls, the newest designed in 1903, consuming upkeep, dockyard time and about 4,500 trained men. **Scrap them and Versailles no longer has a German battle line to count, which is a diplomatic event as well as a budget one** — and those men are the only qualified sea-going ratings not already in a boat.
7. **Emission control.** The 1940 array carries a scanning transmitter and the boats are ordered not to use it; the radar rides a retractable mast and is struck for diving. **The order is doctrine and doctrine is a decision the player owns.** Transmit and find convoys faster; transmit and be found.
8. **Where the centimetric effort goes** (§5.3). The valve laboratory can marinise the set or fly it, not both. **Sea first: the shipborne set lands in 1942 and the airborne set slips to 1944.** Air first: the airborne set holds 1943 and the ship set is 1944. ⚠ **The first option trades the arm that finds convoys for the arm that sees the hunter, and the whole thesis of this navy is the first one** — which is why the default is air, and why choosing otherwise should feel like a real bet rather than an upgrade.

---

## 7. Standing pressures (emergent, always on)

- ⚠ **A navy that is three-quarters submarines has one point of failure**, and §5.2 is not the only one — the single torpedo, the single aero engine, the single asdic-proof drill, the single doctrine. Every economy in this file is also a fault line.
- **The countermeasure clock.** Frame §6.5 names a historical date: roughly eight weeks of May 1943 in which air cover, centimetric radar, HF/DF and escort carriers broke the surfaced night attack. ⚠ **Per SIM-RULE 1 and SIM-RULE 4 that date is an OUTPUT and does not carry over. It must be re-derived from this timeline's preconditions**, and inside frame §7 those preconditions are radically different — see frame §7.4.
- **The crew pipeline** (§2.3), which the model does not price and which will bind before the steel does.
- **Every raider lost is a permanent reduction in the navy's ability to find anything**, and a replacement costs a year. The line was never closed for precisely this reason.
- **The boats get older in the water.** A coastal boat commissioned in 1935 is a training hull by 1940 and a liability by 1942, and the re-cell that would keep her useful competes with a new hull for the same battery line.
- **She cannot protect a single thing she imports** (§3.3), and the longer the campaign runs the more that asymmetry matters.

---

## 8. What the rivals will plan from 1 January 1936

⚠ **Nothing below has happened when play begins** (frame §1.3). There are no baked reactive programs in this scenario, and every rival navy is its plain historical self on 1 January 1936. **What follows is what the German operations staff expect the answer to be — a pressure to play against, not a fleet already building.**

⚠ **THE TOGGLE GATE.** Where a rival is itself toggled on in the configuration being played, **none of this describes that rival**, and the assessment must be re-derived live: fleets compose, assessments do not (SIM-RULE 4). This section is therefore short by design, and its shortness is the ruling.

**The general answer, and the German staff wrote it down in 1928 because it is the answer they would give themselves: convoy, and then aircraft over the convoy.** Escorts, escort carriers, shore-based patrol aircraft and a sea area no boat can surface in. Every one of those is cheap relative to a battle line, and **the country that adopts them first is the country that reads its own 1917 shipping returns rather than its 1916 fleet returns.**

**France** answers with convoy and with colonial escort, because her trade is Mediterranean and short-legged and she has the hulls for it already. **Italy** is not a factor in the Atlantic and knows it, and her interest in this navy is entirely as a customer for design services.

**The Soviet Union** is not a naval problem in 1936 and the German assessment says so in one paragraph — and then, in a second paragraph nobody circulates, observes that she is a **land** problem and that a navy of this shape has nothing to say about one.

---

## 9. Data & schema implications

1. **Base fleet: `data/ships/de.json`** — ⚠ **It closes the last structural gap in the data layer.** Germany was the only pack in the project referencing no base at all. The file carries the Versailles-permitted Reichsmarine of 6 February 1922: eight pre-dreadnoughts, seven light cruisers and *Emden* on the slip, twelve destroyers and twelve torpedo boats, and the four Mackensens broken up incomplete. ⚠ **Every `treaty_fate` is omitted on purpose** — that field is the Washington engine's default script and this navy is outside it. `fleet-file.schema.json` gained a `notes` field so the file could state the **prohibition**, which is the most important thing in it.
2. **Build model: `build_model_de.py`**, emitting `data/derived/de_build_model.json`. ⚠ **ONE RAMPED PURSE** — deliberately the Japanese instrument and not the British one, with the ramp frame §6.4 asks for. The raider line is a **quota** taken off the top because canon states it hull by hull; the boat shares divide what is left; the design office is a charge that never becomes tonnage. **`--leads` emits the counterfactual**, and `counterfactual_no_bank` is in the JSON, because the June 1935 announcement has to be arithmetic and not assertion.
3. **A battery is a component and now has a home.** `ship-class.schema.json` gained a **`battery`** row — `component`, `cells`, `groups`, `recharge_h`, `refit_groups` — the exact analogue of the machinery row, and `tools/validate.py` refuses a `bat` code in `sensors`, in a `batteries[]` weapon entry, or in `possible_upgrades`. ⚠ **This closes the `bat` and `det` conventions extensions the equipment catalog flagged: both families are in the schema enum and neither is an extension any longer.**
4. **German sheets carry no `type_year` and no `as_launched_year`.** A *Konstruktionsjahr* is the year the drawing was signed and is deliberately not the year of introduction, so there is no reference date to enforce an as-launched discipline against. ⚠ **The gap between `C/NN` and the code's own year is a FACT ABOUT THIS NAVY** — she designed abroad and built late — and it should not be closed by inventing a date. A German class may be given an `as_launched_year` whenever someone wants the check to run on it.
5. **The crew pipeline is the constraint that binds and nothing prices it.** `national_state.manpower.pools` carries the schools; nothing consumes them. ⚠ **The model's END 1945 figure implies nearly 40,000 trained submarine crew** (§2.3) and the tonnage that implies is trivially affordable. **This is the German equivalent of Britain's 400 artificers and it is a larger hole.**
6. **Fuel is the other side of the same coin.** `national_state.fuel` now says what §3.3 says: wholly imported, no domestic source, and **the fleet she has built is the one instrument that cannot protect a lane.** Nothing reads it. The project-wide fuel law still needs a hotel-load term.
7. **No `victory` block** for this scenario: readouts come from the standard indices. Per frame §1.2 there are no objectives and no end dates.

---

*The road file owns the prohibition, the timeline and the ledger. The catalogs own every specification.*
