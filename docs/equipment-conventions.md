# Equipment & Data Conventions (all scenarios, all nations)

**Project:** WNT1922
**Scope:** shared rules for every equipment catalog, ship sheet, and data file — Grand Campaign, Hindsight scenarios, and multiplayer alike.
**Status:** Draft for review.

---

## 1. Scope and ownership

This file carries the **display law** — how a catalog, a ship sheet, an aircraft sheet and a data file are written — and the **derivation law** — how every number that is not a datum is got from the ones that are. §2–§7 and §13 are display; §8–§12 are derivation.

### 1.1 File naming, the canon set, and the record

Hindsight canon files live in `docs/hindsight/` and are named **`{xx}-{scenario-slug}-{part}.md`**, where `{xx}` is the nation prefix (§2.1) and `{part}` is one of **`scenario`** (order of battle, opening state, decisions, pressures) · **`road`** (timeline, treaties, the treaty ledger) · **`platform-catalog`** (the catalog's own §1–§2) · **`equipment-catalog`** (its §3–§6). **A nation's four files are its canon set and nothing else is.**

⚠ **No audit corpus exists; the canon files are the record.**

### Playable supplements, release 0.5

`data/playable/{jp,us,uk,de,fr,it,su}.json` owns the provisional literal fits, aircraft and the three newly approved programs. Generated Markdown summaries name that source; original component catalogs retain ownership of their detailed specifications. The new three programs each have scenario, road, platform and equipment documents. Literal estimates are identified as provisional and are not certified as calibrated component catalogs. Every reference, type year and generated value is checked by `tools/check-playable-catalogs.mjs`.

### 1.2 Where a fact lives

**No fact is stated twice in the document set**, outside the per-sheet template rows (§6) and declared summary tables, which state their own facts for themselves — and **a summary table declares itself by naming its sources.**

- **The scenario files own the order of battle and the road files own the timeline.** A register therefore carries no fleet counts and no line rates, and may date its own item's development, never fleet-level events.
- Where a register and a scenario file's timeline both bear on one development, **the timeline file owns the date and the register owns the reason.**
- **A register may echo doctrine but never a value**, where a value is any figure, rating or performance statement its own entry's spec rows carry — naming the item, its components and its interfaces is not a value, and neither is a date the timeline does not state.
- **Equipment entries never roster which classes carry them** — naming hull types in doctrinal prose is not a roster.
- ⚠ **A spec row carries what the article is and what it plugs into**; who else has one is lore and belongs in the prose. A launcher, a mounting or a fitting that belongs to **another service** is not a naval specification, and listing it beside the naval ones states as a fitted interface something that is really a fact about two organizations. **Strike it from the row**; the register may carry it.
- **An inherited-hull catalog owns the specifications of those classes and nothing else.** How many are manned, which are in reserve and what any of them is doing on the opening day belongs to each navy's scenario file; where the two disagree, **the scenario stands on employment and the catalog stands on the ship.** Which hulls such a catalog admits at all is §4.4.

---

## 2. Naming and codes

**The code is the data. The name is the display.** They are separate systems and they do not have to agree: the code is one universal, machine-readable key, and the name is whatever that navy actually called the thing.

### 2.1 Component codes — universal, and nation-prefixed

Every component SKU carries a code of the form **`[xxYYfff]`** — a **two-letter nation prefix**, the **two-digit year of introduction**, and a **three-letter family**. `[jp32eng]` is the Japanese marine engine introduced in 1932; `[us25gun]` the American gun mount of 1925; `[de33rad]` the German radar set of 1933; `[uk31gun]` a British mounting of 1931.

**The prefix is mandatory everywhere a code appears** — spec rows, Possible-upgrades rows, Kits rows, Powerplant and Machinery refit groups, provisions, ship designations and data files. It is not decoration: several navies field a `27gun`, and the codes are the keys the data is stored under.

**Nation prefixes: `jp` · `us` · `uk` · `de`** (France, Italy and the USSR take `fr`, `it`, `su` if they are ever built).

**Families are three letters and descriptive:** **eng** marine engines · **aeg** aero engines · **jet** turbojets · **gun** gun mounts · **sec** secondary-battery mounts · **shl** shells · **can** automatic cannon · **mgn** aircraft machine guns · **tor** torpedoes · **lau** launchers · **dir** directors · **cic** direction centers · **rad** radar · **det** warning receivers · **wir** aircraft wireless and radio sets · **cat** aircraft catapults and recovery cranes · **bcn** homing beacons · **snr** sonar · **bat** storage batteries · **dpc** depth charges · **min** mines · **rkt** rockets · **bmb** bombs · **tnk** drop tanks · **ang** angled-deck kit · **flt** float kit · **kit** conversion kits.

**Unlisted components are as-built for the hull year.**

### 2.2 Item designation — one system per navy, and they are deliberately different

Each navy names its equipment the way that navy did. A catalog prints the **name** in prose, in headings and in ship rows, and the **code** in bracketed spec rows and code rows; **the two never appear inside one phrase.** ⚠ **A refit or re-engine group is a bracketed spec entry, not prose:** a Machinery or Powerplant row states the founding fit by **name** and every later generation available to it by **bare code**, because those generations are rows on an equipment ladder and most of them have no name of their own.

| Navy | Equipment designation | Ships | The point of it |
|---|---|---|---|
| **Japan** `jp` | **Type NN** — the year of introduction, so name and code year agree | class name; an improved build of the same hull takes **-kai** | The only navy whose designation is a date, which is what makes a fleet of identical hulls legible at a glance |
| **United States** `us` | **Mark N** — Arabic, one sequence per family in order of introduction; a revision is **Mod N**. Aircraft take a bureau designation: mission letters + sequence (**F1**, **SB1**, **O1**) | class name after the lead ship, hull type spelled out | A Mark number is a serial, not a date — you cannot read the ladder's tempo off the ordnance |
| **Britain** `uk` | **Mark I–VI** — Roman, one sequence per family | class name | The Arabic/Roman split is the real historical difference between the two English-speaking navies and it is kept |
| **Germany** `de` | **C/NN** — the *Konstruktionsjahr*, the year the drawing was signed, **which is deliberately not the year of introduction**; submarines take **Typ** + Roman numeral; where a historical letter designator exists it is used (**G7a/G7e** torpedoes, **GHG** hydrophones, **FuMO/FuMB/FuG** radio-sensing, **SC** bombs, **EMC** mines) | class name after the lead ship | The gap between C/NN and the code's year is a fact about a navy that designed abroad and built late, and it is the only place that gap is visible |

**Type years and Mark sequences are per navy and never shared.**

### 2.3 Ship designation

**Ship designation** = the class name (Japan: the hull type year) + component codes for the current fit: `Unryū (Type 22) [jp42eng/jp41rad]` · `Missouri [us40dir/us39rad]` · `Wolf (Typ VII) [de37bat/de40rad]`. **Aircraft are inventory, never part of a ship's designation.** Designations are derived from per-hull component data, never stored.

**A larger or differently-shaped hull is a separate class with its own name.**

---

## 3. Units and abbreviations

- **Cost: gold** — 1 gold = 1 kg fine gold; first-of-line prices before learning-curve discounts; no fractional prices.
- **Toughness: durability** — structural damage capacity, orthogonal to the armor model.
- **Speed: kt** · shaft power: shp · engine power: bhp (marine) / hp (aero) · thrust: kgf · ranges: km · aircraft speeds: km/h · weights: metric (fuel in tons) · areas: m².
- Abbreviations are spelled out at first use in each document (time between overhauls, quick-engine-change unit, sea level, anti-submarine warfare, depth charge) and may be used bare thereafter; **an initialism never appears in a spec row before its first expansion.**

---

## 4. What gets an entry

### 4.1 The floor

⚠ There is a floor under the SKU test: **a minor item gets no entry, whatever else is true of it.** No entry for a bomb under 300 kg, a weapon under 20 mm, a radio set, or a minor item generally. The three clauses of §4.2 decide only among items that clear the floor, so multi-platform no longer rescues a machine gun and single-nature ordnance no longer rescues a light bomb.

### 4.2 The SKU test

**The SKU test has three clauses and an item passes on any one of them.**

1. **A minor item fitted to one platform and having no upgrade path is not an entry** — it is stated in the row that carries it, with its rating and without a type year, because a type year is a claim of SKU-hood.
2. **An engine is a major item and always keeps its entry**, even with one generation and one platform — so do conversion kits and single-nature ordnance, on the same ground.
3. **A minor item fitted to more than one platform keeps its entry whatever its size** — an anti-aircraft gun on two hulls is a fleet article and is written once, not twice.

**Multi-platform beats minor; major beats single-platform; only minor AND single-platform AND single-generation together disqualify** — and all three sit under the floor of §4.1.

### 4.3 An item that loses its entry

**An item that loses its entry is not lost: it becomes a literal with its mass**, stated where it is fitted — an aircraft's `armament` and a station's `alternatives` each take **exactly one** of `component` (a SKU) or `spec` (a literal), the shape `powerplant` already used, and a fitted item too minor for an entry goes in `fittings` with its installed mass. **The specification survives the removal and so does every arithmetic check that reads it.**

### 4.4 Inherited hulls — what an inherited-hull catalog admits

An **inherited hull** is one afloat before the divergence and still in the navy's hands at the scenario's opening. Such a catalog holds the ones that still matter, on **two tests taken together**:

| Test | Reading |
|---|---|
| **Size** | A major capital ship or a large cruiser, generally 10,000 tons standard and up. Anything smaller is fleet furniture, counted in the scenario files and not sheeted. |
| **Use** | In commission, with a crew, doing something. A hull demilitarized, mothballed, kept as a target or kept for the flag is a museum piece and is excluded whatever it displaces. |

⚠ **The use test decides the hard cases** and excludes more tonnage than the size test — and **a hull may be admitted below the tonnage line**, on the reverse of the same reading, where what it does makes its displacement the least interesting thing about it.

**Every nation's section carries a line naming what was excluded and why**, because a catalog that silently omits is a catalog nobody can check.

Such a catalog owns the specifications of those classes and nothing else (§1.2).

---

## 5. Catalog structure and order

### 5.1 Order, and splitting a catalog across files

**Order: ships → aircraft → weapons → sub-equipment → conversion kits → ordnance & drop tanks.** A catalog may be split across files on any section boundary — the **platform half** (ships, aircraft) and the **equipment half** (everything below) are the standard split; **section numbers are continuous across the split and are never renumbered**, and each file names the other in its header.

### 5.2 The shape of an entry

Within each section, entries order by **type importance, then year of introduction**. Per entry: **a register** (§7) — then **the spec sheet** (§6) — then **one `*Changes vs …` line** below the table for any class drawn as the successor to another class in the same catalog — a Japanese **-kai** rebuild, a Mark or Type in sequence, a follow-on hull under its own name — naming the parent and stating only what moved.

**The rule is successorship, not the `-kai` suffix:** only Japan names a rebuild `-kai`, and the three navies that do not use the suffix are the ones that use the line most.

**Detail level:** ships and aircraft fullest, weapons medium, sub-equipment, conversion kits and ordnance simplest.

### 5.3 As-launched discipline and the Possible-upgrades row

Ship and aircraft sheets show **as-launched specifications only**: **no SKU may appear on an as-launched sheet before its own type year.** The exceptions are these:

- **Capacity-by-type rows** (§8.5), with from-year tags on types not yet in production at the class type year.
- **Machinery and Powerplant refit groups**, excepted by the engine code's own year (§8.2).
- **A Kits row**, which states the hull's provisions — the fittings predate the kit. Escort-carrier fitout rows and their deltas are excepted on the same ground (§6.2).

**Only ships and aircraft close with a Possible upgrades row**, in code form, no specs. It lists the later generations of every family the sheet's own rows name, **ordnance carried as stores included**; on aircraft sheets those ordnance codes name generations available from the magazine, not airframe upgrades.

⚠ **Engine codes never appear in a Possible-upgrades row** — the machinery or powerplant row already carries them, or there is nothing there to upgrade into (§8.3). **Kits are fittings, not upgrades:** kit codes appear in Kits rows and provisions, never in Possible-upgrades rows.

### 5.4 Equipment entries and the generation ladder

**Equipment entries own the generation ladders.** Every generation is a `[YYxxx]` spec row — its year is the code's own, and **its specs live nowhere else**; a later generation's row states only what changes from the founding generation, and every spec it does not restate carries forward from the founding row and the `Common` row. **Equipment entries carry no Possible-upgrades row** — nothing is written when a line ends.

### 5.5 Data files — batteries, armament and literals

**On a component-style class a main battery always lives in `batteries[]`, never in `armament`.** A battery entry names **exactly one of** a SKU (`component`) or, where the fitting lies outside the navy's own Mark/Type sequence and therefore has no SKU, a literal `spec` — ⚠ so "it has no SKU" is never a reason to move a main battery out of the array anything would read it from. **Every BB, BC, CA, CL and DD carries exactly one entry with `role: "main"`**, and `tools/validate.py` enforces both rules. **Carriers, merchants and submarines are exempt:** a carrier has no main battery by nature and a boat may or may not carry a deck gun.

**`armament` remains LITERAL style** for the historical 1922 seed files, and is not used by a pack-defined class. The one-of-`component`-or-`spec` shape it takes on an aircraft is §4.3.

---

## 6. Spec-sheet templates

### 6.1 The omission rule

**Ships omit rows for systems the class does not carry; aircraft print "None".** **A row may be omitted only when the class has no such system.** A ship prints **"None as launched (N positions wired)"**, or names the provision itself, in place of omitting a row where the class carries the provision but not the system. **Within each rule, a field on one sibling only is a defect.**

Merchants use the **Capacity (fitout)** and **Provisions** rows.

### 6.2 Ship template

Rows in this order:

| Row | Content rule |
|---|---|
| Cost / durability | gold · durability |
| Displacement | empty / standard / full load (subs add · submerged) — definitions at §8.1 |
| Capacity (fitout) | merchants: cargo / liquid / troop lift by fitout |
| Dimensions | length · beam · draft (full load; submarines surfaced) |
| Flight deck / Elevators / Hangar & deck park / Capacity by type | carriers and kit-convertible merchants only, in that order — this block replaces the Aviation row; recovery gear is stated in the Flight deck row; kit-convertible merchants compress the block to an Escort-carrier fitout row + Capacity by type, and the fitout's cost, durability, crew, fuel and protection deltas ride in their own rows, exempt from as-launched discipline — displacement is the hull's and is not restated per fitout |
| Main battery | mounts (guns, positions) · rpg → total rounds (shell type) · firing time (§10.4) |
| Secondary battery | mounts (guns, positions) · rpg → total rounds · firing time (same derivation, same cross-check) |
| Light AA | mounts · rpg → trigger time (same derivation, same cross-check). a row here with no battery behind it in the data is **a defect and not a style** |
| Torpedoes | N × launcher type (tubes) · total × torpedo type onboard |
| Fire control | directors, rangefinders, and director provisions |
| Sensors | radar, hydrophone and **sonar** fits and provisions — the sonar is a sensor and is named here only; the ASW row states what is dropped, never what listens |
| Aviation | catapult rating + recovery · aircraft scheme |
| Mines | rails (capacity) · total × type carried |
| ASW | DC total · throwers · options |
| Machinery (N bays · cruise on B) | [YYeng] shp · speed · range @ cruise, inline refit groups per §8.2–§8.3 (non-modular navies: plant · shp · speed · range @ cruise; submarines: shp generating · electric drive) |
| Speed (surfaced) · Speed (submerged) · Battery | submarines only, in that order: surfaced and periscope-depth figures · submerged sprint / sustained / creep with endurances · cells and recharge |
| Fuel | bunker tons (· avgas tons if aircraft carried) |
| Protection | armor/subdivision facts |
| Cargo gear | merchants: derrick rating · at-sea cartridge-swap capability |
| Depth | subs: test depth |
| Provisions | hull provisions (rings, rails, rigs) |
| Crew | count |
| Kits | conversion-kit fittings carried |
| Possible upgrades | codes only (§5.3) |

### 6.3 Aircraft template

Same omission rule; **"None" for empty fields.**

| Row | Content rule |
|---|---|
| Cost / durability | gold · durability |
| Powerplant | N × engine **by name** · takeoff power or thrust (permitted derivation of the engine entry), then — inline in the same row — one **[YYaeg]** or **[YYjet]** group per available re-engine, carrying that generation's takeoff figure, exactly as §8.2 does for a ship's machinery row. **The founding fit's own code is not printed here** (§2.2: name and code never share a phrase); the re-engine groups are bracketed spec entries and carry codes |
| Dimensions | span (fold) · length · wing area · hangar footprint |
| Weights | empty / normal / max, kg stated once — a type with a float or wheel exchange kit adds a **fourth** figure, the max in the undercarriage state the Kits row names (afloat for a wheeled type, on wheels for a floatplane). Normal weight is defined at §9.2 |
| Crew | count and arrangement |
| Speed | best-altitude · mid-altitude *or* with-store band · sea level (bands as the engine rating and mission dictate; minimum two) |
| Climb / ceiling | m/s · m |
| Fuel / endurance / range | liters, internal/external stated · endurance · ferry / combat radius — and, for every aircraft able to lift a recess tank, the tank-extended ferry / combat figures, naming the tank and its liters (tagged from-YYYY when the tank postdates the sheet's type year) |
| Armament | gun mounts · total rounds · **trigger time** · rockets carried. **Trigger time is required on every aircraft sheet in the corpus** (§10.4) |
| Ordnance | bays, rails, loads (as-launched SKUs only) |
| Equipment | radar · beacon receiver · high-lift devices (§9.4) |
| Crew systems | canopy, seats, approach speed (§9.4) |
| Protection | armor, tanks ("None" if none) |
| Kits | attachable kits by code |
| Possible upgrades | codes only (§5.3) |

### 6.4 Weapon / sub-equipment / ordnance template

Summary in two paragraphs on the register's own band (§7.3) — development history, then the item and its doctrinal fit → optional `Common` row → one `[YYxxx]` row per generation. **Generation years ride in the [YYxxx] codes** (no production tags); **retired generations tagged (line ended YYYY)**; entry headings carry the founding type (bare code for untyped kits) and close with the introduction year in parentheses — the year display for nations without type-year naming. **Conversion kits and drop tanks use the same shape.**

---

## 7. The register

### 7.1 What a register is

A register is **a review by an informed military enthusiast, written plainly and bluntly**. **Short declarative sentences — one point per sentence, stated and left alone.** He has an opinion and gives it: no hedging, no throat-clearing, and no clause-stack built to arrive at a judgment. The specimen to write against is *"Whether a deck crew can cycle her at the rate this navy cycles everything else is the question nobody outside has the evidence to answer, and the whole of her value turns on it"* — thirty-three words and four clauses to say she may not keep up. **Say it in nine.**

**The writer is a foreign analyst with good sources and no papers.** He has seen the article or the ship, has talked to people who have handled it, has read what was published, and **says plainly where his information stops.** ⚠ He never speaks as the navy — no *our*, no *the fleet's own*, no argument inside the building, no minutes of the design meeting and no internal report to quote. **No first person and no addressing the reader:** the enthusiasm is in the judgment, not in the pronouns. What he does have is judgment, and exercising it is the point of the entry.

### 7.2 Permitted, and not permitted

**Permitted and expected: assessment** (*the arrangement is unusual and appears to reflect…*, *the type is generally regarded as…*) · **epistemic limits** (*no trials figures have been released*, *the published weight is believed conservative*, *it is understood that…*) · **what an outsider can observe** — what is on the deck, what the yards are doing, what has been seen at sea.

**Not permitted: any insider access** — a meeting, a minute, a memorandum, a staff paper, a report read rather than published, a named officer's private opinion, or anything the navy has not made visible — **nor a warning marker** (§13.1), bold, the document naming itself, a `§N.M` citation, a calibration-band word, or a value the spec table already carries (§1.2).

**Historical voice throughout:** no rationale-debate, no alternatives-considered, no comparisons — a successor class's register may name its parent, the delta itself belonging to the `*Changes` line (§5.2). No fleet counts or line rates (§1.2).

### 7.3 Shape and length

**One paragraph of exactly six sentences, 90–170 words.** **No required ordering** — the writer chooses what to open on and what to close on, and getting development, lore, use and doctrine across the six is the writer's problem and not a template's.

⚠ Six in one block, and no other shape is legal — a two-paragraph register is a defect, not a variant. **`audit.py` check D fails anything else, and it also fails a sentence over 30 words** — see §7.1 for why.

### 7.4 Rewriting a register

A rewrite is derived from the spec table, the calibration position, the scenario, the road and the data `notes` — never from the text it replaces. ⚠ A writer who can see the old paragraph will paraphrase it, so the separation must be physical rather than instructed: strip every register to a placeholder (the heading and the spec table stand), move the only surviving copy of the old prose out of the repository, extract the tables and the lore into self-contained bundles elsewhere, write there, and move the text back only after measuring. The stale snapshot mount counts as a copy and is cleared too.

Measure three ways before merging. **New against old** — 5-gram overlap and difflib ratio per entry. **The corpus against itself** — repeated openings, and 5-grams shared between different registers, which are voice tics: *is known to have been*, *there is no sign*, *at the far end of*, *so far as can be*, *foreign services differ on whether*, *the curiosity is*, *the weak point is*. They are banned by name in `audit.py` check D and **matched case-insensitively**, or a tic capitalised at the head of a sentence slips the check meant to catch it. **The unexplained share** — the overlap remaining after subtracting every 5-gram that also appears in the nation's own sources, since two drafts derived from the same canon note converge without either copying the other. ⚠ The unexplained share is the one that decides; fresh prose lands near **1 percent**.

---

## 8. Derivation law — ships

### 8.1 Displacement, and the speed basis

The Displacement row reads **empty / standard / full load**:

- **Empty** is the ship as completed — hull, machinery, armament and fixed equipment, no crew, ammunition, stores or liquids.
- **Standard** is the Washington standard — complete, manned and ready for sea with ammunition, provisions, fresh water and war stores aboard, without fuel or reserve feed water.
- **Full load** is standard plus every liquid the hull carries, propulsion bunkers and aviation fuel alike, **so that full load minus standard is the Fuel row and nothing else.**

**Embarked aircraft are inventory and enter no displacement figure.** Submarines print a submerged figure after full load. Merchants read **one empty / standard / full load for the hull**, whatever it is fitted out as, where full load is standard plus the deepest fitout's deadweight (cargo, liquids, stores) — **a conversion redistributes weight, it does not create a second ship** — and they quote their speeds and draft at that full load, which the Machinery row names.

**Warship speeds throughout are quoted at service displacement** — standard plus two-thirds of the **propulsion** bunkers, the hull-form law's calibration basis (aviation fuel is aviation stores and enters full load but never the speed basis) — **which is derived from the Displacement row and never printed.**

### 8.2 Range, the machinery row and the cruising bank

**Range is a ship statement, not an engine statement** — a cartridge has no range without a hull's bunkers — so **the engine entry carries hardware only, never range**, and range appears once, in the ship's machinery row: **shp · speed · range @ cruising speed** for the as-launched fit, then — inline in the same row — one **[YYeng]** group per available engine upgrade carrying the same figures (the code's own year is its availability date; e.g. `[jp32eng] shp · kt · km @ cruise`).

**The printed cruising speed is the speed the class cruises at**, and it is a property of its cruising bank — the number of bays lit on passage, a per-class datum stated in the Machinery row header (`Machinery (N bays · cruise on B)`) **and not derived from the bay count.** **On a diesel-electric hull the cruise is set by the motors' demand** at the doctrine speed and the lit bank throttles to it, so the cruising bank names the bays turning, not the output they could make.

**Bunkerage is then sized so the doctrine range is made good at that speed** on the class's heaviest cartridge generation: the bunker is cut for the last engine the hull will ever carry, not the first.

Navies without engine-cartridge SKUs do the same with no engine entry to manage, and **state the cruising speed directly in the Machinery row's range clause** (`plant · shp · speed · range @ N kt`) — that clause is the whole of the cruising datum for such a navy, and **no bank is implied by the boiler or shaft count.**

### 8.3 Banks and cartridges — which navy has which

**A cruising bank and an engine cartridge are two different things, and only one navy has both.** A **bank** is a per-class datum naming how many propulsion groups are lit on passage; any navy whose plant is built in groups has one, and it is printed in the row header. A **cartridge** is a unit designed to be exchanged in service; **it is a Japanese article and no other navy in this project builds one.** The two are independent, and the Machinery row follows from which a navy has:

- **Bank and cartridges (Japan).** Header `Machinery (N bays · cruise on B)`, and the row carries **one inline `[YYeng]` group per available upgrade.** Engine codes therefore never appear in that class's Possible-upgrades row — the machinery row already carries them.
- **Bank, no cartridges (Germany).** Header `Machinery (N bays · cruise on B)`, and the row states **the plant in prose with one set of figures.** It carries **no inline refit groups, because nothing is exchanged in service** — a diesel group sits on a common bedplate and a combined diesel–turbine plant cannot be swapped at all.
- **Neither (America, Britain).** Bare `Machinery` label, plant and figures in the row. The row **may name the generation the class was built with** — `[uk22eng] · shp · kt · km @ kt` — because that is a fact about the ship and not a refit group.

**The exemption is the whole rule for every navy but Japan, and it cuts both ways.** A navy whose machinery is not exchanged in service carries **no inline `[YYeng]` groups AND no engine code in Possible-upgrades**: its later generations go to **new construction**, and where an existing hull is re-engined at all the work is hull surgery and is priced as a **conversion kit**, never as an engine upgrade. So the §5.3 rule holds for everyone — for Japan because the machinery row already carries the codes, and for everyone else because there is nothing there to upgrade into.

⚠ **Do not read a bank as a claim of modularity**, and do not supply refit groups to a navy that cannot use them: a sheet with a bank and no `[YYeng]` groups is correct by rule, not deficient by omission.

### 8.4 Hull speed

**Hull speeds verify against per-class honest admiralty coefficients** — best real same-class comparator × ~1.10 future-form credit, at service displacement (§8.1), at each fit's Froude number, ~2% tolerance. **Below Fn 0.25 wave-making has largely fallen away**, so honest C at those Froude numbers sits *at or above* the comparator's own value, and **a figure near the raw comparator is an under-credit rather than a match.**

### 8.5 Air capacity

Aircraft carry a **hangar footprint** (m², folded and packed); carriers carry **hangar** and **deck-park** areas (m²). **Embarked capacity = hangar area ÷ the type's hangar footprint, rounded down** — no movement reserve — all aviation ships, all navies. **The deck park is a handling and ranging area:** it stows the knocked-down spares and adds no embarked capacity.

**Spares = 20% of embarked aircraft (rounded up), stored knocked-down at 40% footprint, always shown by full type name.**

Ships with a flight deck show a **Capacity by type** row (embarked + knocked-down spares per aircraft type) as that rule's permitted derivation; **catapult ships state their aircraft scheme in the Aviation row instead.** The Capacity-by-type row is exempt from as-launched discipline and tags types not yet in production at the class type year (§5.3).

---

## 9. Derivation law — aircraft

### 9.1 One drag polar per airplane

⚠ **The aircraft derivation is one drag polar per airplane and it is not re-derived per figure.** Equivalent flat-plate area **f**, span efficiency **e 0.82**, propeller efficiency **η 0.80 at maximum speed / 0.62 in climb** (0.50 for a fixed or two-pitch airscrew); lapse `(ρ/ρ_crit)^1.3`; **L/D max = 0.5·√(π·AR·e/Cd0)**; range is Breguet at L/D max. Cruise **bsfc 0.29 kg/hp·h**, and **0.26 only where a navy states a DOCTRINE credit for it** — never an engine one. Avgas 0.72 kg/L; crew mass as §9.2 states it.

**Reference f, for solving a new airplane against a known one:** P-51D 0.352 · Bf 109E-3 0.398 · Spitfire I 0.404 · A6M2 0.415 · Fw 190A-3 0.433 · F4F-4 0.602 · Bf 110C 0.745 · Skua 0.864 · Swordfish 2.749.

### 9.2 Normal weight

**Normal weight is a take-off weight**, and this is what it contains: empty weight · full internal fuel · the ammunition for the fixed guns · oil · and the crew the airplane normally carries, at **80 kg a man** including parachute and flying kit. Oil runs about 7 percent of fuel volume on a piston type and a flat 20 kg on a jet. **No external store**, and no crew at a station the sheet says is manned by mission — those belong to MAX.

**Every performance figure on every sheet is quoted at this weight**, so a sheet whose normal weight cannot hold these things is not describing an airplane that can take off. `validate.py` computes the ammunition from the armament array and warns when what is left will not cover the crew; an aircraft whose guns are prose only and whose armament array is empty cannot be checked this way.

### 9.3 Wing area, f, and wing weight

⚠ **f scales with wetted area**, and growing a wing while holding f is a free gift — one this project has given itself before. `swet = f/0.0045`; `f₁ = f₀·(swet + 2.05·ΔS)/swet`. **A bigger wing always costs top speed, and no finish credit buys it back.**

⚠ **Wing weight is `k · S^0.649 · AR^0.5`, not a flat kg/m².** The spar length is set by the **span** and the spar deepens as the chord grows, so at a fixed span the aspect-ratio term cancels most of the area term and extra area is very nearly free. Priced flat, a wing growth costs about six times what it should. `k = 12.7` for a Japanese airplane.

### 9.4 High-lift devices, CLmax and approach speed

**CLmax follows the high-lift device the Equipment row names, and nothing else:** 2.4 straight wing with slats **and** Fowler flaps together · **2.25 Fowler flaps alone** · **1.95 leading-edge slats alone** · ≈1.85 slotted flap · ≈1.55 plain flap or none · 1.9 swept.

**The two devices are not interchangeable.** A Fowler adds camber *and* reference area on extension and stows flush, so it buys roughly twice a slat's CLmax; a slat delays separation to a higher angle of attack, and its real product is departure resistance in a turning fight rather than a lower approach. Choose by what the airplane is for, and take the number that goes with the choice. **The device is therefore a spec input** and is named on the row even when it is ordinary practice — an airplane whose row names none is quoted at 1.55.

**Printed approach speed is 1.15 × the bare stall at NORMAL weight** on that CLmax, and nothing else. The bare stall is `√(2·W·g / (ρ·S·CLmax))`; **1.15 is the carrier margin** — real deck aircraft crossed the ramp between 1.10 and 1.20 × the stall, and the 1.3 factor of land practice is a certification rule and does not apply here. **The same margin is used for every navy.** It is a display convention, not a claim that four navies flew the same circuit; a nation whose approach doctrine is itself a divergence states that in its calibration position, not by moving the factor.

### 9.5 Range, endurance and combat radius

**Combat radius = ⅓ × ferry range, for all aircraft.** Ferry range is flown in **ferry trim** — ammunition landed, tanks full; **combat radius is at full combat load.**

**Endurance governs.** Where a Breguet range exceeds endurance × cruising speed, the aircraft is endurance-limited and **the endurance product is the printed range.** Low-powered types therefore print well under Breguet, and that is correct.

### 9.6 Jets

**A jet is Mach-limited, not thrust-limited, and takes a different model.** `tools/perf.py` is a propeller model and cannot touch one. Thrust is `T(V,h) = T₀ · (ρ/ρ₀)^0.885 · (1 − 0.30 M + 0.20 M²)` — the ram-drag term of an early centrifugal turbojet — against the same polar form, and range is the jet Breguet at the best-range speed (1.316 × the minimum-drag speed, L/D 0.866 × L/D max) on a stated TSFC.

⚠ A printed speed at altitude is usually the Mach limit rather than a speed the engine produces, so **f is solved from the SEA-LEVEL figure**; solved from an altitude figure the drag reads low and the ceiling comes out over a kilometer high.

### 9.7 Climb

**Climb anchors by airframe type:** clean monoplane A6M2, 15.7 m/s at 2.56 kg/hp (constant 40.2) · fixed-gear biplane F4B-4, 11.0 m/s at 2.98 kg/hp (constant 32.8) · jet MiG-15bis, 46 m/s at thrust-to-weight 0.534.

### 9.8 Where the model does not reach

**The range half of this model is valid for clean fast monoplanes only.** It reproduces an A6M2 to +0.2 % and a Spitfire I to +3.9 %, and it returns 0.48× a Swordfish's published range and 0.41× an Arado Ar 196's, because solving f from a low maximum speed at η 0.80 over-reads the drag of a slow fixed-pitch airplane. **Do not adjudicate the range of a biplane, floatplane or fixed-gear type with it** — climb and ceiling are still sound. `tools/audit.py` carries the limit as a standing advisory.

---

## 10. Loads, stations and magazines

### 10.1 Station ratings and racks

**A station's rating is a load limit and it is stated per rack.** A store must fit **one** rack, and the whole alternative must fit **rack count × rating**; where the station is a single point — a crutch, a conformal recess — the two readings coincide and the sheet prints the one figure. **A store's mass comes from its own equipment line and from nowhere else**, so a rating and a loadout printed in adjacent rows are arithmetic and are checked as arithmetic (`tools/validate.py`).

### 10.2 Depth charges

⚠ **The consequence for depth charges: a bomb-form station takes FOUR**, because four charges with their air kits weigh what the bomb they replace weighs, **and a torpedo-form recess is two bomb-form stations and therefore takes EIGHT** — the same recess that takes one torpedo or two bombs.

### 10.3 How a magazine is printed

**Ammunition rides inline with its weapon row**; torpedoes as `N × launcher (tubes) · total onboard`; **mines and depth charges as totals.**

### 10.4 Firing time and trigger time

**A firing time is a derivation and not a datum:** it is `rounds per gun ÷ the gun's rate`, the rate being the weapon entry's own (`rpm_per_gun`, `rpm_per_barrel` or `rpm`). **An aircraft's trigger time is the same rule applied to an airframe:** `(total rounds ÷ number of guns) ÷ cyclic rate` — one figure where the guns are alike, one per caliber where they are not.

`validate.py` runs the division on every battery whose gun states a rate. The mounts, the per-gun allowance and the firing time printed on a ship sheet **are the data's** — `crosscheck.py` compares all three on main, secondary, light AA and torpedoes, and **skips a row it cannot parse rather than guessing at it.**

---

## 11. Provisions and refit cost

Every hull declares its **interfaces** (engine bays, barbette rings, launcher foundations, director trunnions, radar masts/wiring, catapult foundations, degaussing coil channels, kit hardpoints). The builder/refit mode mixes any component generation onto any hull; **cost follows provision match**: provisioned = trivial cost, days; non-provisioned = structural-work pricing — possible, but many times the cost and yard time. **The rule is universal; provisions are data.**

A hull's interface list is not its Provisions row. ⚠ The list carries every interface, occupied and empty alike, and `fitted < count` — or any state other than `fitted` — is the empty one; **the row prints only those.** An interface filled by equipment the sheet already carries is not a provision, and printing one advertises a barbette ring three rows above the turret standing in it. The omission is the same defect in reverse: an empty foundation left off the row is a provision the reader cannot see. `crosscheck.py` compares the row against the data and fails on either.

---

## 12. Calibration — the hindsight standard

### 12.1 The distribution

A hindsight navy is not uniformly ahead of history. It is ahead **where it spent its money**, and the shape of that spending is the scenario. **Calibration is therefore a distribution across a navy's lines, not a flat mandate on every item:**

- **Interest lines — up to +5 years.** The lines the divergence exists to buy: its thesis, its weapon, its hull, its production method. This is the band the scenario is *about* and the deepest credit any performance figure may take.
- **Supporting lines — +2 to +3 years.** What the interest lines drag forward with them because they cannot work without it.
- **Untouched lines — par.** Historical dates, historical performance. Most of a navy is this.
- **Starved lines — behind history, deliberately.** Where the thesis took the money from. **A cold line is a design statement, never a defect**, is usually the scenario's price, and a deliberately under-credited line is a legitimate design choice.

**Architecture, process and interface choices may run deeper than +5** anywhere in the distribution; they are the premise, not a performance claim — a provision, a production method, a standardization decision, a plant scaled past any historical one. **Performance may not exceed +5 anywhere, interest lines included.**

**Every catalog states its own calibration position once**, naming which of its lines are interest, supporting, par and cold. **It is stated in the platform half and governs both halves.** A line audited against the wrong band is the commonest false finding in this project.

### 12.2 The comparator, and the absolute ceiling

⚠ **The comparator is the world's best article, not the nation's own.** A German 37 mm at the Bofors' rate is *par* even though the real German gun was a single-shot at about 30 rounds a minute; Japan's turbojet is *par* against the Rolls-Royce Nene even though no Japanese engine came near it.

And the ceiling is absolute in the other direction: **a figure that exceeds the best real article at ANY date in the window is not a +5 credit.** It is a figure with no analogue, and no band licenses it. **A calibration audit is a judgment pass and not a grep** — mechanical passes have run over such figures without flagging them — and it needs the analogue named, its service date established, and performance separated from architecture, once per generation.

### 12.3 The band is data

**The band is data, not prose.** Every line in every equipment JSON carries a required `band` of `interest` · `supporting` · `par` · `cold`, and **every equipment file must declare all four bands non-empty.** `component.schema.json` requires the field, `equipment-file.schema.json` requires the four arrays, and `tools/validate.py` checks both.

The reason is not tidiness: a calibration block holding nothing but a `notes` string cannot be audited, because it has made no claim to audit. **A position that lives only in a prose table is a position no tool can hold you to.**

### 12.4 A band may hold no line

⚠ **A band may be declared and hold no line**, and the strongest form of a cold band is exactly that. Japan declares heavy-caliber gunnery cold and carries no heavy-gun line, because the plan stopped developing heavy guns in 1922. Britain declares trade defense cold and carries no escort, no sloop and no corvette in any year. **An absence is a design statement and is not a gap to be filled.** No tool may require a declared band to hold a line.

### 12.5 Physics is not calibrated

**Physics is not calibrated and is not negotiable.** Hull speeds verify as §8.4 sets out. Aircraft verify by Breguet ranges, wing-loading × CLmax approach speeds, and power-to-weight climb scaling against period anchors — subject to the riders of §9, which the project's worked examples already obey.

---

## 13. House style and orthography

### 13.1 The warning marker

**The ⚠ marker is house style and is required.** It prefixes a sentence that a later reader must not skim past: a rule that reverses an expectation, a figure that has been got wrong before, a constraint the file exists to preserve, or an instruction not to "fix" something. One marker per sentence, at the head of it, never decorative and never on a merely interesting fact — **a file in which everything is marked has marked nothing.**

It is legal in a table cell, in a header, in a calibration block and in a Status line. **It is not legal in a register** (§7.2). **A catalog with none at all is under-marked, not clean:** every catalog in this project contains at least a few statements a future session would otherwise reverse by accident.

### 13.2 Orthography

**The project is written in American English throughout — every document, every data file, every identifier.** It is a display rule, not a style preference, and a British spelling anywhere is a defect that `audit.py` check H fails. ⚠ The dialect used to be per nation, and files, section headings and field names still exist that were named under it; a spelling that looks deliberate is not.

**National vocabulary is a separate matter and stays:** *asdic* is British and *cartridge* is Japanese, because they are what those services call the article. Neither is spelling. **A proper noun keeps its own spelling** — the Ministry of Defence and the Royal Air Force are named that whatever the surrounding prose does.

⚠ **This file is the one exemption and is not to be normalized:** it quotes both spellings in the worked example above, so it carries British and American forms side by side on purpose.

### 13.3 Banned constructions

- **Empty qualifiers ("exactly") are banned.**
- ***optional* is sanctioned load vocabulary** — a fit the class may embark or land.
- **Relative cross-references between sibling sheets ("same as X") are banned — state values absolutely.**
