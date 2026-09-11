# Hindsight Scenarios — Detailed Design

> Release 0.5 scope: two playable starts (6 February 1922 and 1 January 1936), seven playable nations, scored in 1950 with no forced end. In Good Faith uses seven approved programs. Its European war varies ±60 days; 1922 retains tension-driven ±365 days. The four original divergence studies below remain their original-program design references. Unimplemented modes, toggles and physical models are future concepts. Current inventories and generated specifications are indexed in [playable/README.md](playable/README.md); runtime mechanics are in [the game guide](../game/README.md).

**Project:** WNT1922
**Version:** 1.19 (supersedes `sp-scenario-catalog.md` §2 where they conflict)
**Status:** Canonical frame for the original four In Good Faith programs. Play begins on **1 January 1936**. The playable campaign activates all seven programs, including France’s La Revanche de l’École, Italy’s Mare Nostrum and the Soviet Krasny Okean. The individual-toggle cases below describe the four original studies; they are not selectable campaign configurations. National catalogs own specifications, scenario documents own opening fleets and road documents own program chronology. Current mechanics and all seven opening registers are in [the game guide](../game/README.md) and [playable catalogs](playable/README.md).

---

## 1. Design principles

### 1.1 No special rules

A Hindsight scenario is exactly: **a world snapshot** (fleets, yards, tech, doctrine, budgets, politics, diplomacy at the start date) + **standard events** + nothing else. All divergence is the accumulated result of different decisions 1922–1935, expressed entirely through core systems (learning curves & design freezes, government priorities & succession, infrastructure projects, prototype/teething risk, fuel logistics, manpower & training pipelines, intelligence). Nothing here may be a rule the Grand Campaign or multiplayer doesn't also have.

### 1.2 Sandbox, not missions

**No objectives. No end dates.** These are sandbox worlds: the simulation runs from the start date until the player stops. The ambient scorekeeping (mastery indices, exchange ratios, tonnage ledgers) exists as *readouts*, never as goals. What replaces objectives is **opening decisions** — the pile of live dilemmas sitting on the player's desk on day one — and **standing pressures**, the emergent forces that will punish or reward however the player resolves them.

### 1.3 One scenario, four toggleable divergences

**Scope, and it is narrow.** This document owns **single-player mode 2 only** (`sp-scenario-catalog.md` §1). Mode 1 (Grand Campaign) and mode 3 (Set-Piece Battles) are separate modes with separate owners, and nothing below is about them.

**The Hindsight mode contains exactly one scenario: *In Good Faith*** (§7) — **1 January 1936 to 1950**. There is no launch *set*; there is one world, and a setup screen.

**Any combination of the four national divergences may be toggled on. A nation not toggled on is historical** — historical fleet, historical estimates, historical programs:

| | Strategy | The bet |
|---|---|---|
| **JPN** | ***As Long As It's Black*** (§4) | One design per role, thirteen years, no brake |
| **USA** | ***Five-Term Tillman*** (§3) | A bigger generation every two years, forever |
| **GBR** | ***Fisher's Ghost*** (§2) | Speed is armor, and it is the only argument left |
| **GER** | ***Nothing Above Water*** (§6) | Convoys beat us last time; build for the trade and nothing else |

Sixteen configurations, all legal. **Zero divergences is a straight historical 1936 start**; all four is the scenario at full strength. The player may take any nation in the world, divergent or not — **as the monster or against it.**

**France, Italy and the USSR have approved divergent programs in the playable build:** La Revanche de l’École, Mare Nostrum and Krasny Okean. Their national canon sets and playable data now own those additions.

### Why the toggles compose — the deception-independence law

The composition is legitimate, and the reason is the same fact the whole frame rests on: **each deception holds until 1934–35, and the four are independent of one another.**

1. **No nation's building responds to another's program before the reveal, because no nation knows.** Through 1922–34 every navy sets its estimates against a world it believes to be treaty-compliant. **A divergent nation's hull totals are therefore a function of its own budget and its own allocation, and of nothing else** — which is exactly why they can be added together. Japan's 59,200 t-equiv/yr envelope does not contain a term for what Britain built.
2. **A leak in one deception does not compromise another.** They lie along different axes and are undone by different evidence (§1.4). Britain being caught at 36 knots on 35,000 declared tons tells the world that *Britain* has fast capital ships; it says nothing whatever about Japanese carriers, American displacements or a Dutch design office. Four lies, four tells, four clocks, no shared failure mode.
3. **There are no reactive programs anywhere in this scenario.** A nation not toggled on is its **plain historical self on 1 January 1936** — historical fleet, historical estimates, historical building program, and *nothing pre-baked in response to anybody*. Every reaction to every divergence begins **on the first day of play, as an opening decision the player watches happen.** This replaces the old per-overlay "rival reactions" blocks outright: they were a single-nation-overlay device, and this scenario does not use one.

### What does NOT compose, and this part of the 0.6 objection stands

**0.6 withdrew the toggle rule outright. That was over-broad** — it conflated two different things, and only one of them fails:

- **Hull counts, fleets, catalogs and build models compose.** They are outputs of each nation's own budget under a deception that held. Add them freely.
- **Strategic assessments do not compose, and must never be inherited.** "What the head start is worth", "who can be forced to fight", "how long the trade war lasts" are all functions of *who else is in the world*, and every such sentence in the per-nation sections was written against a near-historical background. **Under SIM-RULE 4 they are outputs and may not be used as inputs.** They must be read live against the active configuration — which is what §7.4 is for.

The clearest casualty is Japan's framing: *As Long As It's Black* rests on fourteen years in which nobody else built. **Toggle Britain and America on and that sentence is false while every number under it stays true.**

### One coupling that is real: the 1929 treaty text

First London is **written around whoever is defecting** (§1.4). Its clauses are therefore **per-nation and additive**: Britain active adds the capital-ship speed and shaft-horsepower cap; Japan active adds the closure of the cruiser–destroyer–submarine category; and so on. **With no divergence active it is the historical First London. With all four it is the surface agreement of §1.4.** This is the only part of the world whose *text* depends on the toggles, and it composes by addition rather than by merge.

**Multiplayer gets none of this pre-baked:** in `mp_persistent` and `mp_skirmish` the player is expected to *bring their own* alternate build — that's the point of those modes. Hindsight overlays are SP content only.

### 1.4 The shared 1935 frame — three treaties, and four lies that never met

**The Washington Conference of 1922 produced the historical treaty signed by the United Kingdom, United States, Japan, France and Italy. Germany remained constrained by Versailles, and Soviet Russia was outside Washington.** That is the frame's load-bearing fact. The divergence is not a world without treaties. It is **a nation inside the treaties, defecting on a plan, from the day of signature.**

The original Japanese, American and British divergences share the following alternate treaty chronology. Germany’s concealment operates against Versailles. France’s verification demand below belongs to the original four-program frame; in the seven-program campaign it also conceals La Revanche de l’École.

| Act | Date | The treaty | The divergent nation's answer |
|---|---|---|---|
| **I — the signature** | **6 February 1922** | Washington. Binding to 31 Dec 1936. Caps capital ships and carriers by total tonnage, sets qualitative limits per hull, freezes Pacific fortification. **Leaves cruisers, destroyers and submarines uncapped by number.** | **Signs**, and diverges the same day. Refusing in 1922 means an open race twenty years too early; signature buys the only thing the plan needs, which is *years in which nobody else builds.* Defection is concealed, and concealment is the first priority. **It works, mostly — the leaks come at the end of the decade, and they are dimensional rather than documentary.** |
| **II — the surface agreement** | **1929** (in force 1 Jan 1930) | First London. Binding to 31 Dec 1936. Closes the categories Washington left open, caps capital-ship speed and shaft horsepower, and adds an annual exchange of building programs. **It is agreed unanimously and fast, and it verifies nothing** — see the mechanism below. | **Signs, and goes to full rate.** Concealment continues but is no longer the priority — the plan is now larger than any lie can cover. **Leaks compound year on year to 1934.** Japan publishes the truth herself and gives notice of withdrawal, effective 31 December 1936. |
| **III — the fortnight** | **9–23 December 1935** | Second London, convened on **the rumors** — thirteen years of leaks caught, plugged and re-sprung, which by 1935 no chancellery any longer pretends not to have filed. The only proposal left on the table is **verified limits, with inspectors.** | **Attends with no intention of signing.** **France — the one delegation in the room with nothing to hide — tables verification as a precondition on 20 December**; the United States seconds it on the 22nd; **full breakdown on 23 December 1935.** |

**The breakdown is 23 December 1935. Play begins on 1 January 1936** — the nine days between are the last of the backstory: the collapse reaching capitals over Christmas, and every naval estimate in the world being redrafted in the week before the new year.

**That start date gives the player exactly twelve months.** On **31 December 1936** both treaties expire, the fortification freeze lifts from Guam, the Philippines, Hong Kong and the covered Pacific islands, and every rival's building program stops being a number somebody else agreed to. Every divergent fleet is holding the same hand: an enormous head start, purchased with two signatures, on a lease with one year left — and the year is a calendar year, which is also how every navy in the world budgets.

The Japanese program’s `build_model.py` result at `END 1935` — CV 5 · CL 26 · DD 17 · DE 18 · SS 28 — supplies its 1 January 1936 program fleet. Compatible legacy ships and the separate merchant/support registers are specified in the playable catalog.

Singapore lies west of Article XIX’s 110° east boundary and is outside the base freeze. The treaty exception and the dates of Singapore’s actual facilities are documented in [Strategic ports](strategic-ports.md).

#### Why simultaneous defections do not cascade

The obvious objection to several simultaneous defections is that the reveals should have compounded into an earlier collapse. They do not, and it takes no special mechanism to explain — **two ordinary facts do it.**

**1. Each deception is independent and each stands or falls alone.** They lie along different axes and are undone by different evidence (the table below). Britain caught at 36 knots on 35,000 declared tons tells the world that *Britain* has fast capital ships; it says nothing whatever about Japanese carriers, American displacements or a Dutch design office. **There is no shared failure mode, so there is nothing to cascade.** This is the same deception-independence law that lets the toggles compose (§1.3), and it is the whole of the answer to "why didn't they all unravel at once."

**2. Nobody could have afforded to answer even the leaks that did land.** The one deception with a genuinely short half-life is Britain's, dead from about 1930 — and 1930 is the worst year in the century to ask a parliament for capital ships. **The years in which the leaks arrive are the trough of the Depression**, when every naval estimate on earth is being cut rather than raised. A revealed British speed advantage in 1930 gets filed, not funded. **What the signatures bought was never really concealment; it was fourteen years in which nobody had the money to react**, and the concealment only had to survive long enough to reach them.

**Two consequences, and they are the frame's:**

- **The 1929 treaty is a surface agreement.** Verification never reaches the table, because nobody has evidence that would justify demanding it — only suspicion, and suspicion buys clauses, not inspectors. So the treaty closes categories and caps speed and shaft horsepower on *suspicion*, adds an annual exchange of building programs to stand in for proof, and is signed quickly by everyone. The exchange of programs becomes the joke of the decade.
- **The 1935 conference collapses for as many independent reasons as there are defectors.** Verification is the one proposal each of them separately cannot accept, and none of them has to coordinate with the others to refuse it. One delegation stalling would have been a crisis; several doing it independently, each for its own reasons, is simply a conference that ends.

**And one standing limit that survives the rewrite: what a nation can hide is bounded by what is *physically unobservable*.** Anyone can count slipways, read a lock chamber, time a ship over a measured mile, block a ship in a graving dock and weigh her by calculation. A lie that requires an observable fact to stay unobserved has a short life — which is what produces the table below, and what breaks America's first lie in §3.3.

#### The four lies

Each nation lies about a different axis of the same declaration, and each is undone by a different kind of evidence. **This table is the frame's organizing structure and the overlays inherit from it.**

| Nation | The lie | The tell | Half-life |
|---|---|---|---|
| **Japan** — *As Long As It's Black* | **Count.** Every figure declared is true and every figure can be checked; what the returns leave out is hulls. 13 cruisers of 26, 2 carriers of 5, 7 destroyers of 17, 9 boats of 28 — each concealed hull wearing the pennant number of a declared sister, and no pair ever in the same water. The multiplier is honest; the count is not. | **A photograph — 2 of them**, one number in 2 anchorages, sworn by separate witnesses to the same day. October 1933, and it is not believed: the evidence is an affidavit about a date, and Singapore has just measured a Japanese cruiser and found her exactly as filed. | Longest of the three that ended. Never broken; **surrendered voluntarily in 1934**, when Japan publishes the whole list beside her withdrawal notice. |
| **United States** — *Five-Term Tillman* | **Size, then schedule** — the only two-phase lie of the four (§3.3). *To 1929:* the count declared honestly and the displacement halved. *From 1930:* the size is undeniable, so America stops denying it and lies about **when the ships arrive** instead, behind a legal claim it never has to prove. | **The lock chamber's usable beam, 44.0 m**, breaks phase one. Phase two is broken by **armor-plate output** — you can count a slipway; you must *work out* a mill. | Medium, twice. Phase one dies with the locks around 1929–30; phase two replaces it and holds to 1935. |
| **Great Britain** — *Fisher's Ghost* | **Performance.** Tonnage declared and argued about; the machinery vote quadrupled behind it. | **A measured speed**, taken from a destroyer's bridge with a stopwatch. | Shortest. Dead by 1930 (§2.2). From then the deception is a formality nobody troubles to believe. |
| **Germany** — *Nothing Above Water* | **Existence.** Nothing declared, because nothing is permitted: designs, prototypes and crews held in neutral countries. | **A neutral yard's order book** — documentary, and the only documentary tell of the four. | Longest, then instantaneous. Holds thirteen years and ends in a week in **June 1935**. |

Four axes, four species of evidence — photographic, infrastructural, performance, documentary — and four different half-lives, one of which never ended and was simply put down. That is four structurally distinct scenarios before a single hull is compared.

### 1.5 *In Good Faith* — the mode's one scenario

Divergences running from 1922, each blind to the others and each concealed on its own terms, until the room breaks on 23 December 1935 — and play opening nine days later on **1 January 1936**. **It is the whole of single-player mode 2**, is specified in **§7**, composes by the deception-independence law of §1.3, and takes its name from the treaty language they all signed under and none kept.

The four national strategies keep their own names inside it: *Fisher's Ghost*, *Five-Term Tillman*, *As Long As It's Black*, *Nothing Above Water*.

**And each carries a second name — the title of its catalog.** The brief was *a name that works as a novel as well as a register*, which is what *Catalog Zero* does.

| Nation | Scenario | Catalog and story set | What the title names |
|---|---|---|---|
| **JPN** | *As Long As It's Black* | ***Catalog Zero*** | The register itself — one entry per role, and a zeroth entry that is the system |
| **USA** | *Five-Term Tillman* | ***The Fifth Term*** | The moment. Four terms bought the ladder; the fifth is when somebody was going to ask what it was for |
| **GBR** | *Fisher's Ghost* | ***The Measured Mile*** | ⚠ **The tell §1.4 already names** — *a measured speed, taken from a destroyer's bridge with a stopwatch.* Britain's lie was never about tonnage, and the mile is the one place it could not be told |
| **GER** | *Nothing Above Water* | ***The Order Book*** | ⚠ **The tell §1.4 already names** — *a neutral yard's order book, the only documentary tell of the four* |

⚠ **Two of the four titles are the tells this table already listed, and that is not a coincidence — it is the test the set was chosen against.** The American alternative that follows the same rule is ***Forty-Four Meters***, after the lock chamber's usable beam; *The Fifth Term* was preferred because the American lie is the only two-phase one and a *moment* covers both phases where a *document* covers only the first.

---

## 2. Fisher's Ghost — *Great Britain: 36 knots, and not enough ships*

### 2.1 Thesis

Speed is armor, and the Royal Navy has followed that gospel off a cliff and into legend. Fifteen years of compounding speed-worship have produced the fastest capital ships that will ever burn oil — hulls no enemy can force to fight and no Treasury can afford in numbers. The fleet is magnificent. There is not enough of it. There was never going to be. **This scenario is fully developed in its own files, which are the single source of truth:** `docs/hindsight/uk-fishers-ghost-scenario.md` (scenario — fleet, decisions, pressures, forecast), `docs/hindsight/uk-fishers-ghost-road.md` (the 1919–35 timeline, the treaties and the treaty ledger), `docs/hindsight/uk-fishers-ghost-platform-catalog.md` (ships and aircraft) and `docs/hindsight/uk-fishers-ghost-equipment-catalog.md` (weapons, sub-equipment, kits, ordnance). ⚠ **Where this section and one of them disagree, the owning file stands and this section moves.** The construction program is audited by `build_model_uk.py` against **two votes** — a hull vote in tons and a machinery vote in shaft horsepower that no treaty limits — and its output is `data/derived/uk_build_model.json`.

### 2.2 The road to 1935 — the escalation of knots

**The ghost, and why the doctrine outlives the man.** Fisher does not survive to 1935 and does not need to. He survives to **1927** — seven years past his historical death, lucid enough to win the argument and long enough to staff it — and what he spends those years on is not ships but **appointments**. The Controller's department, the Engineer-in-Chief's, the Naval Construction directorate and two successive First Sea Lords come out of the same school, and by the time he dies the proposition *speed is armor* has stopped being a man's obsession and become **a career path**. That is the divergence: an idea that can be promoted into, and therefore cannot be argued out of. The obsession also narrows as it institutionalises — the late Fisher, and the school after him, will trade literally anything for the next knot, which is how §2.4's last entry gets ordered.

- **1922:** Britain signs at Washington on 6 February and suspends the G3s that afternoon, as the treaty requires — for eleven weeks. They resume in April as *reconstructions* of scrapped hulls and are declared at 35,000 tons. **1922–25:** the **G3s** complete exactly as the Admiralty drew them in 1921 — Invincible and Indomitable, **two hulls**, 48,400 t, 9×16" in three triples (two forward, one amidships), a 356 mm belt, 32 knots, and the only British capital ships that ever carry a torpedo. The world gasps and files the declaration. The Admiralty's only complaint: *not fast enough.* The real defection of the decade is not in the hulls at all — it is the machinery vote, which no treaty limits and which Britain quadruples.
- **1924–29:** Everything slow is purged to pay for what comes next. The R class and Iron Dukes scrapped; ***Barham* and *Malaya* sold to Australia** (HMAS Australia and Anzac, with RAN crews — a Dominion battle squadron for the Far East on someone else's payroll); Queen Elizabeth, Warspite and Valiant scrapped by 1931. Hood, Renown, Repulse re-engined to 33 knots — and are thereby *the slow ships*.
- **1927–32:** The **Insuperable class** (Insuperable, Irresistible, Implacable, Incorruptible), **four hulls**: **51,500 t, 9×16" (3×3, ⚠ ALL THREE FORWARD — the Fisher arrangement adopted here and carried by every British capital ship afterwards, buying a citadel 20 m shorter and giving up the astern arcs to do it), 36 knots on 244,000 shp** — the Invincible four knots faster and ⚠ **not one plate of her protective scheme altered**, on experimental high-pressure plants that the Royal Navy, uniquely, has actually made reliable, because it has spent more on marine machinery R&D than the rest of the world combined. **This is where 36 knots arrives and it never leaves again**, and this is the scenario's real asset: Britain is a full generation ahead in propulsion. Four hulls. She is declared at 35,000 tons and **29 knots**.
- **1929:** The **First London Naval Treaty** is signed, and it carries — new, and aimed — **a cap on capital-ship speed and shaft horsepower**, because the Admiralty's ships cannot be brought to action by anyone. Britain signs, with the first 36-knot capital ship in the world already running her trials. A declared tonnage can be argued about for a decade; **a speed is measured from a destroyer's bridge with a stopwatch**, and 36 knots on 35,000 declared tons is not a lie anyone can maintain. From 1930 the deception is a formality nobody troubles to believe — and, per §1.4, nobody troubles to prosecute either.
- **1931–35:** Fisher's actual dream, built: the **Incomparable class** — 54,500 t, **9×18" (3×3, all forward), 36 knots**, 251,000 shp, 285 m long, and the G3's 356 mm belt unchanged for the third time. She is not faster than the Insuperables — nothing is, ever again — and what sixteen years of machinery research bought here it spent on the gun: **the 1917 18-inch bore relined**, from one works with one set of jigs. **The design staff's motto, carved over the drawing office door at Bath in 1931, is the Controller's minute of 3 May 1922: *not fast enough*.** Two hulls, both in commission: **Incomparable** (1934) and **Inimitable** (1935). A third and fourth were never ordered; the 1935 estimates went to the ship below instead.
- **1935 — the last ones:** the **Incorrigible class**, two hulls, ordered in March and September: **59,000 t, the fleet's 36 knots on 265,000 shp, 9×18" (3×3, all three groups forward for the first time), the G3's 356 mm belt, a 254 mm deck in two layers and a 9-meter liquid-loaded torpedo system.** ⚠ **They are the only ships in the ladder drawn against the airplane rather than against another ship** — twenty-four dual-purpose 4.5-inch barrels, eighty pom-pom barrels and six high-angle directors apiece, which is more anti-aircraft weight than the rest of the Royal Navy carries put together. **Britain's answer to naval aviation exists, it is correct, and it is ~8% complete when play begins.**
- **Carriers:** fast decks only — **Ark Royal** and **Pegasus** (25,400 t, 36 kt, **64 mm armored flight deck**, 51 aircraft, completed 1934–35), a third hull **Perseus** 22% on the slip, plus the Courageous/Glorious/Furious trio. ⚠ **Aviation is semi-serious and the split matters: the AIRPLANES are good and the ORGANIZATION is 1918.** The 1933–34 exercises that produced Incorrigible also produced a Board paper stating that an airplane which can find a fleet can sink one, so the strike role is funded and all three types — Skua scout dive-bomber (1936), Shearwater torpedo monoplane (1937), Peregrine single-seat fighter (1938) — are inside the world's best for their years. What was never funded is fighter direction, radar to vector from, or a deck-park doctrine, so a hangar that could work sixty-six embarks fifty-one and intercepts on sight from a deck alert.
- **Cruisers/flotilla — the bill:** 10 **Swift-class** 36-knot scouts in commission and 2 building (7,200 t, 6×6" — the fastest cruisers ever built), 4 Counties, ~14 older light cruisers. Total cruiser strength: **28 hulls against an Admiralty trade-defense requirement of 70.** ~90 destroyers, a third of them war-built. ⚠ **There is no escort reserve — no sloop, no corvette, in any year of the program.** There is no slow battle line for convoy cover. There is nothing spare at all.

### 2.3 Why Second London fails

Displacement and speed were capped in 1922 and again in 1929 and Britain has broken both, so what the conference actually convenes on is **verification** — a constructor in the Clydebank mold loft, because no British declaration has survived a stopwatch since 1930. The British delegation arrives with a government that cannot politically abandon two building Incorrigibles, a carrier on the slip and a battle line it cannot explain at all, and therefore cannot accept an inspector; it spends a fortnight proposing qualitative limits *everyone in the room knows are written around British ships*. It is not an offer; it is fourteen days of Unapproachable's frames. France tables verification as a precondition on 20 December and the United States seconds it on the 22nd; Japan refuses outright and Britain enters a reservation on access to building slips. Collapse, 23 December. Per §1.4, no delegation in the room wanted a different outcome.

### 2.4 The fleet, 1 January 1936

| Unit | Std tons | Speed | Main battery | Belt | State |
|---|---|---|---|---|---|
| **Incorrigible, Indefatigable** | **59,000** | **36 kt** | **9×18" (3×3, all forward)** | **356 mm · 254 mm deck** | **Building, 8% each (1939/40)** |
| Incomparable, Inimitable | 54,500 | **36 kt** | 9×18" (3×3) | 356 mm | Active (1934/35) |
| Insuperable, Irresistible, Implacable, Incorruptible | 51,500 | **36 kt** | 9×16" (3×3) | 356 mm | Active (1929–32) |
| Invincible, Indomitable (G3) | 48,400 | 32 kt | 9×16" (3×3) | 356 mm | Active (1925) |
| Hood | 42,100 | 33 kt | 8×15" | 305 mm | Active, re-engined |
| Renown, Repulse | 28,000 | 33 kt | 6×15" | 229 mm | Active, re-engined |
| *(RAN)* Australia, Anzac (ex-QE) | 28,400 | 25 kt | 8×15" | 330 mm | Dominion squadron, Singapore |
| Ark Royal, Pegasus | 25,400 | 36 kt | 54 a/c | 64 mm flight deck | Active CV |
| Perseus | 25,400 | 36 kt | 54 a/c | 64 mm flight deck | Building, 22% (1939) |
| Courageous, Glorious, Furious | 22,500 | 30 kt | 36–48 a/c | — | Active CV |

Support: 10 Swift CL (36 kt), 4 County CA, ~14 older CL, ~90 DD, ~45 SS, doubled fast fleet train (16 oilers — the fleet drinks like nothing afloat).

**The fleet that isn't there** (as important as the table above): no slow battleships, no convoy battle squadron, half the cruisers the Empire's sea lanes need, no escort reserve, an oil war-reserve of **3.5 months** at projected war consumption, and an artificer corps stretched so thin that every high-pressure plant casualty queues for the same few hundred specialists.

#### Why the ladder stops at Incomparable, and where the fleet's 36 knots came from

Forty knots on the Incomparable hull does not exist. At 54,500 t and a 285 m waterline, 40 kt is **Fn 0.389**, which sits at **C ≈ 250** on the hull-form law and demands **~368,000 shp** — against the 251,000 already installed, and roughly 1.8× the largest steam plant ever built. `equipment-conventions.md` §8 permits architecture and process to run deep and **explicitly does not permit performance to**; 36 kt at 251,000 shp is already 1.2× that record and survives only on the propulsion-generation credit. Forty on that hull does not survive at all.

It would close only if the belt went — and ⚠ **the belt has never gone, in any British capital ship, in fourteen years.** The G3's protective scheme of 1921 is carried unaltered by all four classes, which is the fact the whole ladder turns on: **the Board declined the knot rather than the armor, and then declined it again three times.** So the ladder stopped buying speed in 1929, at the fleet-standard 36 the Insuperables reached, and everything ordered since has bought guns and protection instead — nine 18-inch on Incomparable, and on Incorrigible a deck, a torpedo system and an anti-aircraft battery that no other ship in this navy comes near.

#### What the fleet's 36 knots actually buys

Not immunity to torpedoes. **Immunity to the stern-aspect shot**, which is not the same claim and is worth more than it sounds.

- Against a 45-knot fish (British Mk VIII and its generation), the overtake margin on a 36-knot ship is **9 knots — 4.6 m/s**. A weapon with roughly 200 seconds of run closes about **900 m** in its whole life; fired from astern at any useful range it dies in open water.
- Against the fastest fish in the world — Japan's `[jp33tor]` at 49 kt over 14,000 m — the margin is 13 knots and the run is 555 seconds, closing **~3,700 m**. A stern shot must therefore be fired from *inside* 3,700 m to arrive at all. **In the combined world (§7) the Japanese torpedo is the only stern-aspect threat these ships face, and only at knife-fighting range.**
- Every other attacker must get **ahead** of the target, and in 1935 nothing afloat except another Fisher ship can. The by-product is strategic: **a submerged submarine at 8–9 knots can engage a 36-knot ship only if the ship drives over it.** Against this fleet the boat is a minefield with an opinion, not a hunter.

The doctrine is therefore correct on its own terms and correct about the wrong decade. It buys immunity from the 1935 threat and pays for it in the hulls that would have answered the 1943 one.

### 2.5 National state (standard-system values)

- **Industry:** capital yards world-class and warm; **propulsion tech a full generation ahead of everyone** (the one lead rivals cannot quickly buy); armor production modest (nobody ordered thick belts in fifteen years).
- **Doctrine:** engagement-on-own-terms perfected — hunting groups, division actions, breakoff drills; trade protection doctrine has atrophied to lectures.
- **Politics/budget:** Parliament in open revolt over estimates; the fleet consumed the 1920s and everyone knows it; manning at 99% with a specialist (ERA/stoker-mechanic) famine.
- **Intelligence:** rivals' answer is airpower and numbers, and the Admiralty's own air staff keeps saying so in memos the Sea Lords decline to circulate.

### 2.6 Opening decisions

1. **Numbers or the next knot.** The 1936 Estimates fund *either* hulls five and six of the Incomparable line *or* twelve cruisers and twenty-four destroyers. The fleet's whole thesis says capital speed; the Empire's convoy maps say otherwise. This is the scenario in one budget line.
2. **The twenty-one-and-a-half problem.** One ship in commission and five building fire a shell no one else makes, from a single gun plant with a single set of jigs. Second-source it (expensive, slow), stockpile deep, or accept that one factory fire disarms the flagship class?
3. **Air-defense debt, which is where the armor argument went.** Nine capital ships carry the anti-aircraft outfit of 1927; the correct answer is Incorrigible and she is 8 percent built. Refitting one Incomparable to her battery is 14 months, ~900 t high up and ~half a knot. Refit the line, or finish the one ship that was designed right?
4. **Sell the slow.** Hood, Renown and Repulse (33 kt — "slow") would fetch enough from Dominion or allied treasuries to fund Incomparable hull seven. Hulls-in-being versus purity of doctrine.
5. **Three oceans, eleven ships.** Singapore wants three capitals, the Mediterranean four, home waters the rest — the arithmetic doesn't close. Which sea gets told the truth?
6. **Incorrigible.** Eight percent built, and the first Board in thirteen years that could kill her. Finish her as designed and own the fastest capital ship that will ever exist and the least survivable; re-order her with a real belt and lose four knots, two years and the doctrine's last argument; or scrap the frames and buy thirty escorts with the plate. **She is the scenario asking the player whether it was ever true.**

### 2.7 Standing pressures (emergent)

Every dock period removes ~9% of the battle line; a single torpedo hit does the same. The fuel ledger is a countdown. Cruiser scarcity means raiders — anyone's raiders — feast until a 36-knot answer arrives, and a 61,000-ton answer to a 12,000-ton raider is the most expensive pest control in history. And the propulsion lead decays: it's the one thing rivals are all copying at once.

### 2.8 What the answer to Britain looks like — *forecast, not program*

**Nothing below has happened when play begins** (§1.3): there are no baked reactive programs in this scenario, and every rival navy is its plain historical self on 1 January 1936. What follows is what the Admiralty's own staff expect the answer to *be*, once the money exists — a pressure to play against, not a fleet already building.

The cheapest answer to a ship nobody can catch is **not to try to catch it**: aircraft, numbers, and torpedo water. Expect a France that finishes Dunkerque and wants a faster successor. Italy sells design services to whoever is racing.

**The Admiralty's air staff has been writing this in memos the Sea Lords decline to circulate** (§2.5), which is the scenario's quiet joke: the answer was known in-house for a decade and the only thing missing was anyone with the standing to say it.

---

## 3. Five-Term Tillman — *USA: the escalation ladder*

President Tillman never met a battleship big enough: a new ship generation every two years since 1923, three hulls each and never fewer, each laid down before the last was evaluated — fifty-eight, seventy-two and ninety-two thousand tons worked up and at sea, a hundred and twelve thousand commissioning and fitting out, a hundred and forty-two thousand on the slips — carried by the greatest heavy-naval industrial base ever assembled, at the price of a fourteen-year naval aviation famine. **This scenario is fully developed in its own files, which are the single source of truth:** `docs/hindsight/us-five-term-tillman-scenario.md` (scenario — fleet, decisions, pressures, forecast), `docs/hindsight/us-five-term-tillman-road.md` (the 1916–35 timeline and the treaty ledger), `docs/hindsight/us-five-term-tillman-platform-catalog.md` (ships and aircraft) and `docs/hindsight/us-five-term-tillman-equipment-catalog.md` (weapons, sub-equipment, kits, ordnance). ⚠ **Where this section and one of them disagree, the owning file stands and this section moves.** ⚠ **America is the one divergence with no build model:** her ladder is five authored generations on a stated two-year cadence (`us-five-term-tillman-scenario.md` §2.1), so there is no envelope to spend and nothing for a model to arbitrate — and consequently nothing mechanically checks her hull counts, ⚠ **which means fifteen monsters and a crew bill nothing prices.**

**Two frame-level facts, because they bind the shared world and the other three strategies. The numbers implementing them belong to the Tillman files.**

*§3.1 is not used: a build cadence is a build, and the scenario file owns builds. The cadence law is `us-five-term-tillman-scenario.md` §2.1 — **a new and larger generation laid down every two years, of three hulls, without exception since 1923 — the interval constant, the class size constant, and the bore the only variable.** Section numbers are never reused, so §3.2 and §3.3 keep theirs.*

### 3.2 The ladder outgrows the canal

The third locks' **44.0 m usable beam** is the American tell (§1.4) — and it was poured for a fleet that outgrew it inside two generations. The per-class figures belong to `us-five-term-tillman-scenario.md` §4.3 and are not restated here; what the frame owns is the consequence, and it is a three-step break rather than a cliff:

- **The Missouri and Constitution classes (six hulls, all in commission)** transit the *original* locks, and are the only generations that ever will. **This is the one genuinely two-ocean force in the fleet, and it is the oldest and weakest half of the battle line.**
- **The United States class (three hulls, in commission)** is too wide for the original locks and passes the third locks fully. ⚠ **It is the only generation the third locks were ever any use to** — which is the whole indictment of the works in one line.
- **The Tillman class (one commissioned, two building)** is **beam-locked**: 44.5 m against 44.0 m usable. It will never transit, and neither will the Columbias above it, which miss by two and a half meters.

⚠ **And note what the break does to the fleet's shape rather than to its map: everything modern is on one side of the concrete and everything mobile is obsolete.** The ships that can change oceans are the ones nobody wants to fight with.

So the alternative is **Cape Horn** — roughly **24,000 km against the canal's ~9,300**: at a battle line's cruising speed that is **six and a half weeks against two and a half**, on a route with no American base anywhere on it, announced to every attaché in the world the day it sails.

**The public works bought concealment and then failed to buy mobility.** By half a meter, on a project whose entire purpose was to accommodate the ships it now excludes — and which served exactly one class of three, for one year before the class above it was launched. A fourth-locks program is the obvious answer, is a second deception with a second tell, and does not finish inside the decade. **Which ocean gets the heavy generations is a permanent decision, not a deployment** — and it is made in 1936, before the player has any idea who the enemy will be.

### 3.3 The lie has two phases, because the first one cannot cover a 21.5-inch gun

**Phase one, 1922–1929 — size.** The count is declared honestly; the world watches capital ships go down the ways on a public schedule and is told they are treaty hulls. The displacement is roughly halved in the declaration. ⚠ **This is survivable while the hulls are 58,000 tons and the guns are 16-inch, and it is survivable precisely because the CALIBER IN THE DECLARATION IS TRUE** — only the displacement is halved. A covered slipway hides a beam, an ordnance proving ground is remote, and the rest is argument. **The tell is the third locks' 44.0 m usable beam** (§3.2) — an infrastructure fact, published, and impossible to walk back.

**Phase one then fails completely, and it has to.** No declaration survives a 112,000-ton hull with a 21.5-inch main battery. A barbette that size cannot be described as anything else; the gun cannot be proofed quietly; the dock that takes her cannot be explained. **Any story in which America is still claiming compliance in 1932 is a story nobody in the room believes, and the frame should not ask them to.**

**Phase two, 1930–1935 — schedule, under legal cover.** So America stops lying about the ships and starts lying about the *timetable*, and moves its public position from denial to a legal claim it is not obliged to prove:

- **In public it concedes the hulls and disputes the law.** Washington caps capital ships *by aggregate tonnage*; America declares itself inside its aggregate on a replacement schedule, treats the per-hull qualitative limits as a separate and lapsing article, and — once the 1929 treaty is in force — invokes that treaty's own **escalator**, the machinery a signatory may use when another power's building affects its security. **This is not a lie and cannot be disproved, only disputed**, which is exactly why it is stronger than the lie it replaces.
- **In private the concealment moves to the rate.** Declared completion dates run years long; hulls are publicly "suspended" and quietly worked; the ladder's true cadence (`us-five-term-tillman-scenario.md` §2.1) is never stated. **You cannot audit a building program's real pace from outside a country.** The world therefore knows the ships exist, knows roughly how big they are, and is **consistently and badly wrong about when they arrive** — which is the strategically decisive error, because the whole American position is a race against a treaty clock.
- **The phase-two tell is the armor mills.** Slipways can be counted from a hillside; plate output has to be *worked out*, from ore contracts, rail movements and furnace capacity at Bethlehem, Midvale and Carnegie. And because **armor plate is the binding constraint on the whole ladder**, anyone who gets that number gets the cadence, and with it the real delivery dates.

**At 1 January 1936 the American position is therefore not "nobody knows".** It is: *everybody knows, nobody can stop it, and everybody's staff estimate of when the ladder lands is too late.*

---

## 4. As Long As It's Black — *Japan*

Japan answered the ratio with a production line and then could not find the brake: one gun, one torpedo, one engine, one hull per role, built for thirteen years behind a registry that understated nothing except how many there were, on roughly its historical construction money, and fed entirely on imported inputs. More flight decks than any navy on earth and an identical cruiser line to match, built at no better than anyone else's efficiency — the fleet is larger than the historical one purely by **refusing to build anything else**. What thirteen years of one hull per role actually bought is a **production system that has not yet saved a single yen** — and a dividend that starts the year after the scenario opens. **This scenario is fully developed in its own files, which are the single source of truth:** `docs/hindsight/jp-as-long-as-its-black-scenario.md` (scenario — fleet, decisions, pressures, rival reactions), `docs/hindsight/jp-as-long-as-its-black-road.md` (the 1922–35 timeline, the three treaties and the treaty ledger), `docs/hindsight/jp-as-long-as-its-black-platform-catalog.md` (ships and aircraft) and `docs/hindsight/jp-as-long-as-its-black-equipment-catalog.md` (weapons, sub-equipment, kits, ordnance). ⚠ **Where this section and one of them disagree, the owning file stands and this section moves.** The construction program is priced by `build_model.py` — **a purse**: a flat envelope, an 80 percent learning curve, and one hull per role for twenty-five years — and its output is `data/derived/jp_build_model.json`.

---

## 5. Data & schema implications

1. **`national_state` block** (scenario schema v0.2): curve positions per design line, manpower pools by rating class, stockpiles, pipeline throughputs, infrastructure registry (locks with usable-beam values, dock sizes), faction/politics state. The snapshot carries everything; it is also the save format.
2. **Four national packs, one snapshot:** `data/ships/hindsight/uk_fishers_ghost_pack.json`, `us_five_term_tillman_pack.json`, `jp_as_long_as_its_black_pack.json`, `de_nothing_above_water_pack.json` — alt classes and hulls, referencing (never modifying) the 1922 base data. **No pack carries a reactive program for anybody** (§1.3) — historical-only 1936 variants remain unimplemented; the shipped snapshot includes three additional national supplements. **They are not overlays and do not compose**: §7 is one authored snapshot the packs feed, and nothing merges at load time.
3. **New base-mechanic dependencies surfaced by the extremes** (all core, all modes): usable-beam/lock constraints on hull movement (and §3.2 makes these strategic, not cosmetic); crew pools as first-class resource with rating classes; per-line production throttling with curve-decay on idle; export/sale of ship classes to third parties; conversion-in-build (the Republic memo needs it; so did Kaga in 1923 — it was always core).
4. **No objectives fields** for these scenarios: `victory` block simply omitted (schema already allows it) — readouts come from the standard indices.
5. Set-piece synergy: any battle out of §7 is a set-piece goldmine (Incomparable vs Columbia is `mp_skirmish` bait and its own marketing campaign); the export pipeline from sandbox battles already exists by design.
6. **National fuel** is the system all four overlays lean on and none of them yet models. Britain runs a 3.5-month war reserve (§2.4); Japan is fed entirely on imported inputs (§4); Germany's whole thesis is attacking somebody else's imports (§6); only America is self-supplied. It is the natural shared constraint of §7 and the largest single gap in the schema.

---

## 6. Nothing Above Water — *Germany: the prisoner's conclusion*

**The title** names the fleet's shape — no capital ship, no carrier, no cruiser — and prefigures the boat that never surfaces.

**This scenario is fully developed in its own files, which are the single source of truth:** `docs/hindsight/de-nothing-above-water-scenario.md` (scenario — order of battle, opening decisions, standing pressures, **and every ruling**), `docs/hindsight/de-nothing-above-water-road.md` (the prohibition, the 1918–35 timeline and the ledger), `docs/hindsight/de-nothing-above-water-platform-catalog.md` (§1 Ships · §2 Aircraft) and `docs/hindsight/de-nothing-above-water-equipment-catalog.md` (§3–§6). ⚠ **As with §2, where this section and one of them disagree, the owning file stands and this section moves.** The construction program is priced by `build_model_de.py` — **one ramped purse**, the Japanese instrument with the ramp §6.4 asks for — and its output is `data/derived/de_build_model.json`. The base fleet is `data/ships/de.json`.

### 6.1 Thesis

Germany lost the first tonnage war to the **convoy**, not to the enemy's technology, and one of the men who worked that out was in a British prison camp while he did it. A navy that accepts that conclusion in 1920 and never revises it spends the next fifteen years building for **numbers and coordination** instead of quality — and builds nothing that floats on the surface if it can help it. There is no battle line, because a battle line is an argument with the Royal Navy that Germany has already lost twice. There is only the trade.

### 6.2 The divergence, and it needs no invention

Dönitz is a British prisoner from October 1918 and comes home in 1920 having reached the correct conclusion about why the campaign failed: **convoys, not depth charges.** The divergence is that the Reichsmarine adopts that as its official finding rather than one officer's memorandum, and organizes around it — the submarine faction wins the internal argument in 1922 and never loses it, and Dönitz rises with the school he wrote for.

**No personal patronage device is required and none is used.** The 1920–32 mechanism is entirely navy-internal, which is nearly what happened anyway; 1933 supplies money to a program that has already existed for eleven years, and that is the whole of its contribution. This matters technically: it is the eleven years of clandestine design and prototyping that make §6.3's fourth type defensible under `equipment-conventions.md` §8 rather than magical.

**The cover is real and the date is exact.** Germany is not inside the treaties — she is under Versailles prohibition, with no submarines permitted at all — so she cannot lie about tonnage, category or performance. She lies about **existence**, and the vehicle is the foreign design bureau: **IvS opens in The Hague in 1922**, with prototypes built and trialled in Finland, Spain and Turkey through the decade. Germany banks **designs, jigs, drawings and people** because she is not permitted to own plant.

**The reveal is June 1935 and it is total.** Germany announces submarines and has them in the water in numbers within months — which is impossible unless the work started thirteen years earlier, and every naval attaché in Europe can do that arithmetic. **Germany's exposure is six months old when the scenario opens**, making her the freshest crisis on the board on 23 December 1935 — and the fact that Britain legalised it unilaterally, without consulting the other signatories, is the first visible crack in the room.

### 6.3 The role list — two surface classes, four boats, two aircraft

Per §1.3's structural law, the role list *is* the strategy, and the absent roles carry as much of it as the present ones.

**⚠ The governing rule: NO BOAT IS DESIGNED AROUND THE TENDER.** Every submarine in this navy is drawn for **independent operation** — its own bunker, its own outfit, its own passage out and home. The raider–tender is a **multiplier and never a dependency**: where one is in the same ocean a patrol is extended, and where none is, the patrol still happens. Four tenders could never have carried the campaign, and no boat's radius assumes one.

1. **Surface raider and submarine tender — a line that never closes.** The only thing Germany builds that floats on the surface by choice: a fast commerce raider that is also a mobile base, carrying fuel, torpedoes, provisions and repair capacity. **One hull is laid down every year from 1932**, and a larger second design follows from 1940 with a bigger hangar and a later set. The gain is reach and search, not viability.
2. **Coastal boat (1927) — small, cheap, many.** The early mass item and the training pipeline both, and the reason every ocean-boat crew already knows its trade. Twelve months keel to commissioning.
3. **Ocean boat (1933) — the long boat.** Thirty thousand kilometers on her own bunker, six tubes, a heavy outfit and **a search set on her mast**, because a boat that must find its own targets across a thousand kilometers of empty water cannot do it with a pair of eyes eight meters above the sea. She reaches the Cape, the Caribbean or the Indian Ocean and returns without meeting anybody.
4. **Mass-production ocean boat (1937) — the boat the campaign is made of.** A whole ocean boat that gives up half the bunker and a tube, goes ten meters deeper for it, and comes out of the shed in **ten months at any of six yards**, none of them naval. Drawn by people who had read the 1917 shipping returns rather than the 1916 fleet returns.
5. **Elektroboot (1941) — the boat that does not come up.** Faired hull, no gun, hydraulic reload, a battery three and a third times the energy per ton of the first ocean boat's, a closed-cycle bank that gives sixty hours at ten knots submerged, 200 m of test depth and acoustic cladding over the pressure hull. **Its stated priority is not tonnage sunk but crews brought back**, which is what a navy building nothing else can afford to optimize for. **This is not gold-plating and does not contradict the numbers-first thesis** — it is the same doctrine surviving a countermeasure (§6.5).

**And two aircraft lines, because the wolfpack's binding constraint is *finding* convoys and not sinking them.** The **Seeschwalbe** (1933) is a catapult search floatplane with seven and a half hours and a 600-kilometer reach; the **Albatros** (1940) is twin-engined, carries **search radar**, and reaches eleven hundred. Holding reconnaissance as an aircraft line is the thesis's precondition rather than a broadening of it, and the divergence is cheap: the historical loss of naval aviation to the Air Ministry is a **1933–35 political output**, and an arm founded in the twenties predates the man who took it. **Neither airplane needs an aerodrome** — catapult, fjord, estuary or lee shore — which is the reason a navy that owns none chose them.

⚠ **The reconnaissance gap is real at the start date and is not closed until 1940.** On 1 January 1936 the navy owns one search type with a 615 km reach and no radar, and **one raider in commission to fly it from.** The only search that reaches the middle of the ocean flies off a raider, there is one raider, and the airplane that fixes it is four years away. Every hull laid down since is another eye, which is why the line was never allowed to close.

**Absent by doctrine: no capital ship, no aircraft carrier, no cruiser.** Every mark spent on one is a mark not spent on the argument.

### 6.4 The fleet, 1 January 1936

**The classes are settled** (catalogs above): **Seeadler class** raider–tender (1935) · **Atlantis class** raider–tender (1940) · **Hecht** Typ II coastal boat (1927) · **Wolf** Typ VII ocean boat (1933) · **Hai** Typ IX ocean boat (1937) · **Schwertwal** Typ XXI Elektroboot (1941) · **Seeschwalbe** search floatplane (1933) · **Albatros** long-range search floatplane (1940).

**The raider line was never closed** — one keel a year from 1932, so that at the start date *Seeadler* is in commission and *Kormoran*, *Widder* and *Möwe* are building. They are expensive and slow to replace, and a loss still costs a year, but the fleet is no longer one casualty away from blindness.

⚠ **CALIBRATED.** `build_model_de.py` is built the way `build_model.py` builds Japan's — a **stated** annual envelope, never searched, with per-line opening dates and stated shares — and it carries the ramp this paragraph asked for: **5,600 t-equivalent a year 1922–31, then 9,000 · 22,000 · 48,000 · 84,000.** The raider line is a **quota** taken off the top, because this section states it hull by hull, and the submarine share divides what is left. **END 1935, and `tools/validate.py` holds the pack to it: 6 ocean boats and 37 coastal boats in commission, 111 building, 1 raider in commission and 3 building.**

⚠ **And the model's finding is that the flat decade is the divergence, not the ramp.** 1922–31 is Germany's real historical construction rate, under a tenth of Japan's envelope and about a tenth of Britain's, and it lays down **one hull** — *Emden*, ordered on 8 December 1921 before the argument was won. Everything else buys **no tonnage at all**; it buys **lead time**. `python build_model_de.py --leads` runs the identical envelope on identical shares with ordinary lead times and returns, at the end of 1935, **not one submarine in commission and the first raider a year late.** The June 1935 announcement is the ten flat years being spent in public, and that is why every naval attaché in Europe could do the sum.

### 6.5 The standing pressure, and it is a clock

A navy that is three-quarters submarines has one point of failure, and the historical record names the date: in roughly eight weeks of **May 1943**, air cover, centimetric radar, HF/DF and escort carriers broke the surfaced night attack, and the campaign never recovered. The Elektroboot is the designed answer, so the German game is a race — **does the boat that never surfaces arrive before the countermeasure does?**

Per SIM-RULE 1 and SIM-RULE 4, that date is an *output* and does not carry over. **It has to be re-derived from this timeline's preconditions**, and inside §7 those preconditions are radically different — see §7.4.

---

## 7. In Good Faith — *1 January 1936 to 1950*

### 7.1 What it is

The original four divergences, now joined by the three approved national programs, develop from their own prewar assumptions, each nation believing itself the only defector and each concealed on its own independent terms, until the room breaks on **23 December 1935**. **Play opens 1 January 1936** with twelve months of treaty left. Start date, treaty expiry and opening state are the frame's; **the strategic assessment is not inherited from any overlay** (§1.3), and it changes with the configuration.

### 7.2 What carries across and what does not

**Carries unchanged:** every hull, class, catalog entry, equipment ladder, order of battle and build model — by the deception-independence law of §1.3. No nation's hull count contains a term for what its rivals built, because until 1934 no nation knew.

**Does not carry:** every strategic assessment and **every sentence about what a head start is worth.** Reactive programs do not carry either, because **there are none anywhere in this scenario** (§1.3) — §2.8 and its equivalents are forecasts of what rivals will do from the first day of play, not fleets already building. The clearest casualty is Japan's framing: *As Long As It's Black* rests on fourteen years in which nobody else built, and in this world everybody built. Japan's 302% carrier ratio is unchanged and means something entirely different — she is not uniquely ahead, she is one of four liars, each lying along a different axis. **The numbers survive; the thesis paragraph does not.** `jp-as-long-as-its-black-scenario.md` §3.2 needs a §7-specific framing note when this world is built out.

### 7.3 Why it is not four scenarios in a trenchcoat

The *fleets* add (§1.3). The *world* does not. The four lies are structurally different (§1.4) and therefore **interact**: Britain's deception is dead by 1930 and Germany's holds until June 1935; America's tell is infrastructural and Japan's photographic — and Japan's is the one nobody acts on. The result is a **staggered reveal order** — Britain, then America, then Japan, then Germany — in which each nation learns it is not alone at a different moment, and none can say so out loud. Four navies discovering the same thing in sequence, each privately, is a different world from four navies racing openly.

**And the toggles change that order.** Turn Britain off and the first reveal is American and arrives four years later, which is four more years of quiet for everyone still lying. **The configuration is not a difficulty slider; it selects which decade the world stopped being able to pretend.**

### 7.4 The interactions worth naming now

These are the reasons the combined world exists. **None of them is a balanced outcome, and per SIM-RULE 6 that is a result and not a defect.**

- **Germany against Fisher's Britain may be the most lopsided pairing on the board.** The countermeasure that broke the U-boat historically was built on escorts, escort carriers and convoy cover. Fisher's Britain has **28 cruisers against a requirement of 70, no escort reserve and no slow battle line for convoy cover** (§2.4), because every shilling went into the machinery vote. §6.5's clock may therefore never run out at all — which is stated as an expectation and not as a result, because ⚠ **nothing in this project has played it and the campaign gauge that would have was dropped.**
- **The Japanese torpedo is the only weapon in the world that threatens a Fisher ship from astern** (§2.4), and only from inside ~3,700 m. Every other navy must get ahead of them, and cannot.
- **A submerged boat cannot engage a 36-knot ship at all** unless the ship drives over it — so Germany's arm, which is decisive against everyone else's navy, is close to irrelevant against Britain's *warships* and remains decisive against her *trade*. The German player has a fleet that can starve Britain and cannot fight her.
- **America has two navies and one canal** (§3.2). In a world with three other defectors — one of them in the Pacific and one in the Atlantic — the permanent allocation of the heavy generations is the largest single decision in the scenario, and the ships that can actually be moved are the *oldest and weakest* ones.
- **Everyone except America is fuel-import-dependent** (§5.6). Britain holds 3.5 months; Japan imports everything; Germany's entire thesis is attacking imports. The fuel model is what makes this a world rather than four fleets.

### 7.5 What is needed before this ships

1. **A calibrated 1 January 1936 snapshot per configuration.** The fleets add; the assessments do not (§1.3). One `national_state` per nation, one world.
2. **Germany's build model** (§6.4) — ⚠ **DELIVERED** as `build_model_de.py`: one ramped purse, 5,600 t-equiv/yr flat through 1922–31 rising to 84,000 in 1935, reaching **CA 1 · SS 33** at END 1935 — 27 coastal and 6 ocean in commission, with 114 building: 3 raiders, 55 ocean and 59 coastal. **Its `--leads` counterfactual is the point of it: the same envelope with ordinary lead times puts NOT ONE SUBMARINE in commission at the start date.**
3. **The Tillman national pack** — **DELIVERED** as `data/ships/hindsight/us_five_term_tillman_pack.json` + `data/equipment/us_five_term_tillman.json`, on the §5.2 naming rather than the `tillman_usa` naming this item used, because §5.2 is the frame's own primary statement of the filenames. **All four packs now exist**, along with `data/scenarios/in_good_faith_1936.json`, five new schemas (component, equipment-file, aircraft-class, pack, national-state) and a rewritten `tools/validate.py` that checks a pack's hull counts against `build_model.py`'s own emitted output.
4. **The national fuel model** (§5.6). ⚠ **Scoped, with a first step, at `CONTINUATION-HANDOVER.md` §12.2.**
5. **No campaign gauge.** The interactions in §7.4 stand as stated expectations; nothing has tested them and nothing in this project currently can.
