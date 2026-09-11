# As Long As It's Black — Japan (Hindsight Scenario)

**Project:** WNT1922
**Version:** 0.69
**Companion to:** `docs/hindsight/jp-as-long-as-its-black-platform-catalog.md` (ships and aircraft) · `docs/hindsight/jp-as-long-as-its-black-equipment-catalog.md` (weapons, sub-equipment, kits, ordnance) · `docs/hindsight/jp-as-long-as-its-black-road.md` (the three treaties, the 1922–35 timeline and the Second London collapse)
**Conventions:** `docs/equipment-conventions.md` — display law and band definitions · shared treaty frame `../hindsight-scenarios.md` §1.4
**Owns:** the order of battle, the build model and the opening state.
**Status:** Canonical design reference. **The scenario skeleton, shared by all four nations:** 1 Thesis · 2 Strategy · 3 The fleet · 4 National state · 5 Rulings · 6 Opening decisions · 7 Standing pressures · 8 Rivals · 9 Data & schema.

---

## 1. Thesis

Japan signed the ratio on 6 February 1922, answered it with a production line, and then could not find the brake. Thirteen years of frozen, interchangeable, deliberately *boring* designs — one gun, one torpedo, one engine, one hull per role — have bought something stranger than a big fleet. ⚠ **For the first seven years Japan laid no flight deck at all**, and spent the carrier vote on the yards that would build them — so the fleet in the water is barely larger than the historical one, and the five Unryū she carries were laid between 1929 and 1932, against a treaty allowance of three and a half (§3.2). Twenty-six identical cruisers stand where the treaty allows thirteen, bought not by building cheaply but by **refusing to build anything at all for seven years** — and thirteen of them spent four years wearing another ship's number, because a fleet of one drawing is a fleet in which a number is the only difference between two hulls. ⚠ **The saving has started and it is the whole position: the dividend those years paid for is collecting on every line at once, a hull now costs half what it cost in 1930, it reaches its floor next year, and the yards are laying one pattern faster than the fleet can find crews for it — 34 keels in 1935 against 28 commissionings.** ⚠ **That is the question the scenario opens on, and it is not a build question but a timing one: spend the flood now, while one drawing is still worth building, or watch twenty years of identical hulls come off the slips into a war that has moved on.** The machine is also the economy. Stopping is a crisis; not stopping is a crisis. And the aircraft the whole fleet was built to carry deliberately do not exist yet.

Nothing is scarce today. Every curve in §3 crosses inside six years.

What the two signed treaties actually bought is set out in `jp-as-long-as-its-black-road.md` §4. Both expire on 31 December 1936, on the last day of the scenario's first year.

---

## 2. Strategy

### 2.1 Build sequencing — "build the shelf before the books"

The Kanpon Standardization Bureau's founding memo (1922) sets the order; every date in the scenario follows from it. The principle: **commit early only to what future knowledge says is safe to freeze early; delay everything whose technology curve is still steep.**

| When | What starts | Why then |
|---|---|---|
| **1922** | **Carriers** (the Unryū class, Type 32 when she commissions) | Hull form, hangar volume, deck geometry are *shape*, and shape ages slowest. A carrier is a box that turns into whatever its era needs. Laid down with provisions for everything 1945 knows — and laid down to be declared at their true weight and, from the fourth hull, not declared at all, because carriers are the one category Washington caps at a number Japan intends to pass threefold. |
| 1922–24 | Torpedo, diesel cartridge, catalog infrastructure | The two universal components everything else plugs into. |
| **1925** | **Cruisers** (the Maya class, Type 29 when she commissions), and the 14 cm turret | Second-safest shape; starts after the carrier line proves block construction. |
| 1927–30 | Merchant line at scale, trainers, directors | Cheap, safe, and they carry the deception (`jp-as-long-as-its-black-road.md`). |
| **1931–32** | The Hibari multirole monoplane; then **destroyers and escorts** (Kaze, Shima classes) | Delayed on purpose: DD technology matures late. Waited for the Type 32 cartridge — and arrived after the 1929 treaty had capped the category, which is why these are the two lines the fleet builds *to* the cap rather than past it. |
| **1933** | **Submarines** (I-series) | Latest hull commitment: sub tech had the steepest curve of all. |
| **1938–39** | **Combat aircraft** (Raiden fighter · Tenzan strike) | The most extreme call in the plan: airframes age fastest of anything the navy buys. Every carrier operates the light multirole only until the airframe generation worth freezing arrives. The fleet spends 1926–1939 as a perfect, empty gun. |
| 1935→ | Advanced-panel keels, second-generation systems | The re-iteration cadence begins. |

### 2.2 The SKU doctrine

The whole navy is a Lego set: **minimal SKUs, maximal interchangeability, maintainability to the point of fanaticism.** One carrier, one cruiser, one destroyer, one submarine, one escort, one merchant hull; one gun, one torpedo, one automatic cannon, one marine engine, one combat aero engine under a fighter and a strike twin, one rocket, one radar per domain. Full item specifications live in the platform and equipment catalogs; the designation scheme, provision/refit-cost rule, and hangar-space capacity model live in `docs/equipment-conventions.md`. What matters at scenario level:

- **Type-year naming and hull-plus-component-code designations** per `docs/equipment-conventions.md` §1.
- **Design-for-upgrade**: hulls carry weight/stability margin, wiring, and mounting provisions for equipment that doesn't exist yet (radar-ready masts fleet-wide, catapult-ready bows). Upgrades still compete for budget, slip space, and yard hours — and Japanese refits are cheap because the interfaces were designed in from 1922, not because of any rule.
- **Air groups are inventory, not fixtures**: the Tenzan's float kit bases the strike arm on sheltered water — any cruiser's or tender's 7.7 t aviation crane works it — and the Hibari's serves the cruiser catapults.
- **The fleet beacon net**: rotating homing beacons on every carrier and cruiser, a receiver in every aircraft — overwater navigation is a fleet property, and radar search flies in pairs.
- **Every type, many makers**: with so few types, every SKU is built at four sites or more — **second, third and fourth sources are the rule, not the exception** — so no design flaw, fire, or raid can paralyze a line. And the plants are audited by each other rather than by an inspectorate: **the law requires every assembly to be built from parts drawn from at least two of them**, so a component that will not mate with a rival plant's is found on a shop floor within the week rather than in a fleet anchorage a year later. Interchangeability is not certified, it is *practiced*, every day, by men whose own output is measured against it — and the same rule makes each plant's costs and tolerances legible to everyone who has to work with what it ships.
- **The fighter carries nothing it cannot fight with.** Fuel, guns and rockets — no station, no tank, no bomb: every Raiden airborne is combat-available from the moment it leaves the deck, and the strike's whole ordnance rides in the Tenzan's recess. The escort question reduces to fuel and position, and the price is honest and single: a fighter that cannot surge as a bomber, accepted because a pilot with one trade clears the pipeline in half the time (§2.3, §6.1).

### 2.3 Personnel — lean by design, and about to be tested

Lean establishments are designed-in (diesels need no stokers; one gun means one gunnery school; one engine means one artificer trade) — small crews are *possible*, which is the only reason a fleet this shape floats at all. Today the establishments fill. The structure underneath them does not scale:

- **Training commands are double-hatted sea billets**; instructors deploy with their schools, so the pipeline stops on mobilization day.
- **One rating class per system**: a single artificer trade maintains every engine afloat — efficient, and a single point of failure in human form.
- **No depot pool and no relief margin** were ever built, because a fleet this size never needed one. Losses would cascade instantly: a sunk cruiser's survivors *are* the next cruiser's commissioning draft.
- **The battle line's trained men are a quarter of every billet afloat** (§3.1) — asleep in ships nobody intends to fight.

The standing choice (standard budget/politics): **build a real training establishment now**, at the moment nothing is visibly wrong and the construction lines are still cheap — **or wait until 1938**, when the delivery curve has doubled and the schools that would fix it are at sea.

### 2.4 Fleet speed and range policy

Bay counts are set so **carriers and cruisers stay within ~1 knot at every cartridge generation** (the battle line moves as one body) and **destroyers run ~15% faster** to screen and reposition. The same doctrine governs the **cruising bank** — the bays lit on passage, a per-class datum printed in every machinery row header. The destroyer's smaller bank cancels her higher top speed, so carrier, cruiser and destroyer share one cruising speed at every cartridge generation. **The fleet does not merely fight as one body; it burns fuel as one body**, which is what makes a single cruising order and a single oiler schedule possible across the three hull types of the battle body. Fleet speed rises a cartridge generation at a time; the current figures live in the catalog's machinery rows. Cruising doctrine is the current cartridge generation's fleet-cruise range (the catalog's machinery blocks), rising a generation at a time; one hose coupling fleet-wide means anyone refuels anyone. Strategic mobility is a fleet property, not a ship property.

---

## 3. The fleet, 1 January 1936

*Strength as the Japanese delegation leaves the conference room.*

### 3.1 Order of battle

| Force | Strength | State |
|---|---|---|
| **Carriers** | **6 decks**: 5 × Unryū + Hōshō (prototype ancestor) · **8 more Unryū on the ways**, delivering 1936–38 | ⚠ **The line is four years old and every hull is identical** — [jp32eng] from new, no stragglers, no refit wave. All flying only the Hibari (§2.1); deck crews drilled to a world standard on cycle times, on a training establishment's decks before there were any others. More flight decks than any navy on earth, against a treaty allowance the ledger prices at 3.4 hulls (`jp-as-long-as-its-black-road.md` §4). |
| **Cruisers** | **26** × Maya (typical fit [jp22eng/jp29gun]; refit wave delivering [jp32eng] and [jp42gun]) · **12 more on the ways** | Three standing flotillas of 8, and two spare hulls. Identical silhouettes; spares pooled fleet-wide. ⚠ **Every hull carries twelve twin Type 29 mounts from new, a full fitout** — the class and the cannon share a type year. |
| **Destroyers** | **17** × Kaze · 14 building · ~40 legacy WWI-era boats in training/second line | **The fleet has a screen at last, and only just.** Seventeen modern boats for seven decks and twenty-six cruisers; the line is four years old and there are almost as many on the slips as afloat. |
| **Escorts** | **18** × Shima · 7 building | The fisheries-protection cover story, and the sonar school's own hulls. Also four years old, and the cheapest hull in the catalog to repeat. |
| **Submarines** | **28** × I-series (16 worked up, 12 working up) · **27 building** · all 20 prototype boats retired before this opening | Newest line, opened 1933 and by far the fastest-growing: ⚠ **more boats are on the slips than in the water.** The prototypes were withdrawn and scrapped before 1936; no prototype submarines remain in the playable opening. |
| **Fleet train** | **10** × tender/depot conversions (Maru midbody, heavy derricks) · fast oiler rotation from the tanker pool | The cartridge economy's spine — the swap doctrine lives or dies with these hulls. |
| **Battle line** | Nagato, Mutsu; Kongō ×4; Fusō ×2; Ise ×2 | The museum: 1921 fits, caretaker crews (~60% complement), several still mixed coal/oil firing. **They hold 7,800 trained men — one in every four billets afloat.** |
| **Merchant** | ~**500** × Standard Maru | Largest homogeneous merchant fleet on Earth and roughly half the national tonnage; every hull carries the conversion provisions and the standard engine bays. Treaty status in `jp-as-long-as-its-black-road.md` §4. |
| **Harbor defense** | Hashirajima booms and nets partial; night-fighter cover none; anchorages undispersed | Anchorage dispersal has never been funded. |
| **Aircraft** | ~**600** × Hibari (line ~175/yr, opened 1933) · Raiden at prototype stage (10 airframes flying) · Tenzan at mock-up | Combat-aircraft tooling begins 1938 by plan, squadrons in 1939. Air inventory is stock, tracked separately from ships. **The only part of the fleet still successfully concealed.** |

**433,200 tons of warships against the 401,700 tons Japan historically launched in the same eleven years** — a thirteenth more fleet, and all of it commissioned since 1929. ⚠ **For nine of those eleven years the plan was behind. It went ahead in 1935 and does not stop.** And that is only what floats: **another 64 hulls are on the slips at 1 January 1936, against 91 in commission.**

### 3.2 The build, 1925–1950

The construction budget has been flat since 1925 and sits near Japan's historical envelope, recast by share (37% capital line → carriers, 29% cruisers, 19% destroyers and escorts, 15% submarines), with the money for a hull line that has not opened yet spent on nothing at all. ⚠ **That is the whole plan: 1922–28 the envelope buys no warship but the twenty prototype boats, and is not lent to another line — it is spent on slipways, jigs, block halls, the panel line and one frozen drawing per role. What comes back for it is ONE dividend, on ONE straight line, collected by EVERY class at once: a hull costs its full tonnage through 1930, then a tenth less every year — 0.9, 0.8, 0.7, 0.6, 0.5 — until it reaches a floor of 0.4 in 1936 and stays there for good.**

**Through 1930 a hull costs its own tonnage — the same efficiency any other navy would have managed.** Eight years of one hull per role, one gun, one torpedo and one yard method produced no saving at all, because everything they saved was consumed by what it cost to build the machine that saves it: block halls, panel presses, tooling, gauges, schools, the registry apparatus, and the price of freezing a design a decade before anyone needs it. ⚠ **Then in 1931 the machine started paying, a tenth a year, and the turn is neither gradual nor a forecast: the marginal hull is at half its tonnage now, hits the floor of forty percent next year, and never rises again. 1934 was the first year the fleet grew faster than the budget and every year after it is faster still.**

⚠ **THE FLEET WAS SMALLER THAN JAPAN'S HISTORICAL ONE UNTIL LAST YEAR, AND IT IS A THIRTEENTH LARGER NOW — 433,200 tons against 401,700, after being 185,000 tons BEHIND in 1928.** Nothing at all was commissioned before 1929 but twenty prototype submarines: the whole envelope went into the yards, while the historical program was delivering Akagi, Kaga and the first Myōkōs. **Japan closed a 185,000-ton deficit and went 52,000 tons past it in six years, on a budget that did not move.** ⚠ **A foreign naval attaché adding up Japanese launchings any time before 1932 concludes Japan has quietly given up; the same man in 1937 has to explain what he thought he was counting.**

| Year | Keels laid | CV | CL | DD | DE | SS | Fleet in commission | Cumulative tons | vs historical |
|---|---|---|---|---|---|---|---|---|---|
| 1927 | 3 | — | — | — | — | — | — *(prototype boats only)* | 0 | −118,574 |
| 1928 | 4 | — | — | — | — | — | — *(prototype boats only)* | 0 | −185,070 |
| 1929 | 5 | — | 3 | — | — | — | CL 3 | 22,620 | −205,546 |
| 1930 | 7 | — | 4 | — | — | — | CL 7 | 52,780 | −196,524 |
| 1931 | 20 | — | 4 | — | — | — | CL 11 | 82,940 | −185,750 |
| 1932 | 21 | 1 | 3 | 3 | 3 | — | CV 1 · CL 14 · DD 3 · DE 3 | 142,120 | −185,216 |
| 1933 | 31 | 1 | 4 | 4 | 4 | 7 | CV 2 · CL 18 · DD 7 · DE 7 · SS 7 | 224,230 | −128,083 |
| 1934 | 34 | 2 | 3 | 4 | 5 | 9 | CV 4 · CL 21 · DD 11 · DE 12 · SS 16 | 327,210 | −44,099 |
| **1935** | 37 | 1 | 5 | 6 | 6 | 12 | **CV 5 · CL 26 · DD 17 · DE 18 · SS 28** | 433,240 | **+31,494** |
| *1936* | *33* | *3* | *6* | *7* | *7* | *13* | *CV 8 · CL 32 · DD 24 · DE 25 · SS 41* |  |  |
| *1937* | *36* | *2* | *6* | *7* | *7* | *14* | *CV 10 · CL 38 · DD 31 · DE 32 · SS 55* |  |  |
| *1938* | *36* | *3* | *5* | *6* | *7* | *13* | *CV 13 · CL 43 · DD 37 · DE 39 · SS 68* |  |  |
| *1940* | *35* | *2* | *6* | *7* | *7* | *14* | *CV 17 · CL 55 · DD 51 · DE 53 · SS 96* |  |  |
| *1942* | *36* | *3* | *6* | *6* | *7* | *14* | *CV 22 · CL 66 · DD 64 · DE 67 · SS 123* |  |  |
| *1945* | *35* | *3* | *6* | *7* | *7* | *13* | *CV 29 · CL 83 · DD 85 · DE 88 · SS 163* |  |  |
| *1950* | *0* | *2* | *5* | *6* | *7* | *13* | *CV 40 · CL 111 · DD 118 · DE 123 · SS 231* |  |  |

*Italic years are projection at the current flat budget, with no losses, no policy change and no player decision. They are what the machine does if nobody touches it.*

**The dividend starts in 1936 and it has never been collected before.**

| Marginal hull, as a share of its own tonnage — ⚠ **one line, no per-class rate** | 1930 | 1932 | 1935 | 1936 | 1945 |
|---|---|---|---|---|---|
| **Any hull, any class** | **100%** | 80% | **50%** | **40%** | **40%** |

Between 1936 and 1945 the same flat budget delivers **twenty-four carriers and fifty-seven cruisers** — four times the carriers of the whole first eleven years, and twice the cruisers — without one extra yen, one new yard, or one decision by the player. ⚠ **Twenty-eight hulls commissioned in 1935 and thirty-four keels went down in the same twelve months. The rate does not fall again, because next year the cost stops falling and the whole budget turns into steel.** That is the asset the plan actually built, and on 23 December 1935 not one installment of it has been paid.

The plan is not a fleet that has already won. It is a **bet, thirteen years in, one year from its first return** — and the conference that just collapsed was the last chance anyone had to stop it before it starts.

---

## 4. National state

### 4.1 Personnel — the governor that has not bitten yet

**~108,000 uniformed personnel**, level with the historical 1935 IJN, and an unusually large share of them ashore in schools, yards and the registry. **24,400 sea billets in the modern fleet**, 7,800 more asleep in the battle line. Lean establishments are designed in (diesels need no stokers; one gun means one gunnery school; one engine means one artificer trade), and today they fill.

That is the trap. The projection in §3.2 takes sea billets from 24,400 to **45,300 by 1941 and past 100,000 by 1950** — they double, then double again — and the training command that must supply them is staffed by double-hatted sea billets who sail on mobilization day and take the pipeline with them. Pilots are the sharp end: **~1,100 carrier-qualified on trainers**, deck-cycle skill superb, combat conversion untested, and a syllabus for it that does not yet exist. The Army, fighting in China, contests every draft class.

### 4.2 Inputs (the governor that will)

**Oil:** stockpile 3.0 million tons. Diesel-electric cuts consumption ~30–35% at cruise, so at rationed peacetime tempo the stockpile reads **~32 months** at today's fleet and **~17 months** at the fleet of 1941; war-tempo projections burn at three to four times that rate — **~9 months today, five by 1941.**
**Steel:** high-grade stock ~14 months at current line rate, and the line rate doubles by 1941; ~60% of special steels and alloying inputs imported, American scrap the largest single share.
**Machine tools:** replacement stock ~14 months; ~70% American- and German-sourced. **This is the one that matters**, because the machine tools *are* the asset §3.2 describes — an embargo does not slow the fleet, it forecloses the dividend.
Every input of the machine is imported, and yard output degrades on the standard economy system when the flows stop. This arithmetic, not any fleet, is what the ABCD embargo ladder (§9.3) is aimed at. Read every figure twice: each is comfortable now and none survives the build program.

---

## 5. Rulings

⚠ **A ruling states what is true, and the file it lands in is the one that owns the fact.** The road file owns Japan's treaties, dates, the Second London collapse and the ledger; the catalogs own every specification; this file owns the fleet, the rulings and the opening decisions.

### 5.1 The four aircraft names, and the convention behind them

**Hibari (Type 33) · Raiden (Type 39) · Tenzan (Type 39) · Shinden (Type 44).** The light multirole carries a bird name, the fighter a lightning name, the strike twin a mountain name and the jet a lightning name of its own — which is, by accident of history, the real convention. All four belong to real IJN aircraft that do not exist in this world, and the precedent is the one that licenses *Tone*, *Kiso* and *Chikuma*.

### 5.2 One weapon line per role, and no alternates anywhere

⚠ **There is no shelf of alternate Japanese weapons and there is not meant to be.** A navy whose whole advantage is that every hull takes the same gun, the same torpedo, the same cartridge and the same director cannot hold a second line for any of them without paying for the second line — and the establishment that would run it is the one that was spent on slipways in 1922. **Every weapon in the equipment catalog is the only weapon of its kind in this navy**, and a generation ladder inside a family is not an alternate.

### 5.3 The build model is the arbiter of every hull count

`build_model.py` and its output `data/derived/jp_build_model.json` fix every hull figure in this file, and ⚠ **its rows are END OF YEAR**, which is the commonest arithmetic error in the project. `tools/validate.py` holds this pack against the model mechanically, and they agree at END 1935: **CV 5 · CL 26 · DD 17 · DE 18 · SS 28.**

⚠ **The model's 1944 cruiser figure is 77.**

### 5.4 §8 names no nation that can itself be toggled on

A rival forecast that names a nation the player may be playing is not a forecast, so §8 names none, and per the frame's toggle gate an assessment must be re-derived live against the active configuration, because fleets compose and assessments do not. ⚠ **§12's shortness is the ruling.**

### 5.5 The air group: four types, one engine family, one trade apiece

**The combat generation is a pair, and the split is the 1936 tunnel verdict that no piston airframe could carry the fish and win the air over it.** The **Raiden** is the pure fighter — no recess, no station, no external tank, internal fuel only, the twin Type 29 and 12 rockets, armor glass and an 8 mm seat plate — and ⚠ **her wing is drawn for the turn: the span is fixed at the fleet's fold and the area taken as far as that span allows, on leading-edge slats.** Interceptor, escort, sweep and patrol are one trade flown one way. The **Tenzan** is the strike twin — 2 crew side by side and offset, a third station manned by mission, radar standard, dive brakes, a torpedo-form recess — and ⚠ **she is escorted with the weapon aboard and escorts without it**, the change being the release rather than a conversion. Both stand up in squadrons in 1939 on one Type 39 combat aero engine, one under the fighter and two under the twin.

The **Hibari** is the Type 33 light multirole on the Type 33 utility engine, on a plain centerline crutch, and ⚠ **she is a monoplane and has never been anything else** — the wing is large and long-spanned because every trade she flies but the last is an endurance trade, and it folds at the root because it carries no fuel, no gun and no store. The **Shinden** is the Type 44 jet and the only universal multirole left. ⚠ **The fleet catapult and crane standard is 7.7 t** — cruisers carry both from launch and carrier catapults are fitted from 1942 — and the escort deck flies the Hibari and the Raiden only.

⚠ **Both aero engines sit at PAR, and the mechanism that is not par is the panel line.** The combat pair is flush-riveted and aeroformed throughout with every gap sealed — the 1933–34 hydroformed line applied to airplanes — and **that process bands in INTEREST while the speeds it produces band where the platform catalog puts them.** The catalogs own every figure.

### 5.6 The bomb, the mine and the depth charge are Type 32

**All three dropped-and-laid stores carry the ship generation's year, not the airplane's:** the 650 kg bomb, the moored mine and the depth charge are **Type 32 (1932)**, standardized with the hulls that stow them — `[jp32bmb]`, `[jp32min]`, `[jp32dpc]` — and their air kits carry no separate date, because a kit is a fitting on the airplane and the store is the fleet's. The escort-conversion kit and the sonar keep their 1931 designations: those were standardized against the escort program and not against the airplane.

---

## 6. Opening decisions

1. **Build the school, or build the ships (the governing one).** Manning is comfortable and the delivery curve doubles sea billets by 1941 (§3.2, §4.1). A real training establishment — instructors who do not sail, a depot pool, a combat-conversion syllabus for 1938 — costs construction, and construction is the cheapest it has ever been. Fund it now against a crisis nothing on a muster board shows yet, fund it in 1938 when the crisis is visible and the schools are at sea, or don't and cap the fleet by bodies at the moment the curve was going to pay.
2. **The 1938 bet, re-examined.** The Raiden and the Tenzan are the fleet's teeth, and they are still a prototype and a mock-up (§3.1). Tooling now means five cold curves at once — two airframes, an engine plant sized for ~3,600 Type 39 aero engines, ordnance lines, and a conversion syllabus — against the planned sequential freeze. Rush and own the skies of 1939 with an immature pair; hold and seven flight decks stay armed with the Hibari through 1939, a vulnerability window every rival staff college has circled in red.
3. **Radar-ready, radar-less.** Every mast in the fleet has waited thirteen years for the Type 41 ship radar. Crash-program it now (new SKU, cold curve, scarce electronics trades — first sets ~1939) or wait for the magnetron generation and accept dark masts into the 1940s?
4. **Export the catalog?** The 1934 inquiries (`jp-as-long-as-its-black-road.md` §2.3) have firmed into a book: 4 + 8 + 12 + 6 + 6 = thirty-six hulls, roughly fourteen years of the cruiser line's whole output. Exports buy oil, currency and friends — and from 1936 at a widening margin over rivals' shipbuilding costs (§3.2) — and hand your one silhouette, one shell, and one torpedo to the world's intelligence services, forever. Any sale to a Chinese faction is a cabinet crisis with the Army. The displacements are public anyway; is the catalog a product now?
5. **The museum, and it is now a quarter of the Navy.** Ten unmodernized capital ships hold a quarter of every billet afloat (§3.1) — the manning of eight carriers or eighteen cruisers — and roughly 260,000 tons of high-grade steel and armor plate, against the whole modern fleet's tonnage (§3.2). Scrap the battle line for its people and its metal (a navy first; the Army will feast on the symbolism), modernize it off-curve, or keep steaming the decoy?
6. **Spend the curve, or bank it.** The construction budget has been flat for eleven years and buys what it did in 1926 — and what anyone else's money would have bought (§3.2). From next year that stops being true, and by 1945 it is worth two and a half hulls for the price of one (§3.2) — but it has not paid a yen yet. That surplus is real, it compounds, and it can be taken in four different currencies: **more hulls** (the default, and it breaks §4.1 by 1939), **the training establishment** (decision 1), **the 1938 aircraft tooling** (decision 2), or **oil, tankers and merchant hulls** (decision 8). It cannot be taken twice. Whichever is chosen, choose before 31 December 1936 — after that the rivals are building too, and a curve advantage spent on the wrong thing does not come back.
7. **1940, and what the fleet is for.** ⚠ **The plan has a completion date, and every role in *Catalog Zero* is filled by 1940** (`jp-as-long-as-its-black-road.md` §5): 17 carriers, 55 cruisers, 51 destroyers, 53 escorts and 85 boats in commission, 1.19 million tons, 62 more on the ways. The yards do not stop and cannot be redirected — the dividend is a property of building one drawing in one method — so **every hull laid after 1940 comes off a drawing frozen between 1922 and 1932**, and the fleet ages exactly as fast as it grows. The 60th Maya is the 1925 drawing built in 1941 at 40 percent of her tonnage: cheaper than the first, identical to the first, and 16 years older than the sea she goes to. **Use the fleet while the drawing is still worth something, or hold it and pay the schools, the yards and the standing squadrons to watch it rust in commission.** ⚠ **This is a timing question and not a building one, and it is the only decision on this list whose deadline is set by the plan's own success rather than by a rival.**
8. **Oil is policy, on a fuse.** Rationed months in the tanks today, and barely half that against the fleet of 1941 — read the ladder at §4.2. The southern option is the war the player remembers; the northern/synthetic option is a decade and mediocre, and runs through Sakhalin concessions Moscow controls; the diplomatic option — *output caps traded for guaranteed crude* — just died in London, but a back channel stays open until 31 December 1936, when the treaties lapse and there is no longer a document to trade against. The only trust currency Japan has left is **verification by deed**: attaché-witnessed scrapping or line-throttling, paid in advance.

---

## 7. Standing pressures (emergent, always on)

The two governors — bodies and inputs — are both slack today and both close on a schedule the player can compute (§3.2 and §4). The vulnerability window has a shape: **air and radar jointly dark until the player closes one of them**, and a screen too small for the decks and cruisers it has to cover (§3.1) — a fleet that concentrates at a partially-netted anchorage under Hibari cover, behind almost nothing, is a fleet inviting somebody's Taranto. Sixty-five days after the scenario opens, the Army's February is loaded: famine prefectures over-conscripted, budgets humiliated, garrison divisions wintering in the capital, and an admiral in the Premier's chair. The deception's hangover is permanent (`jp-as-long-as-its-black-road.md` §3), which forecloses every diplomatic exit that needs trust. And the type-year cadence never stops asking its question: cut the next generation now, or ride the curve one more year? Over all of it runs a date nobody in Tokyo chose: **31 December 1936**, when both treaties and Article XIX's fortification freeze expire together (`jp-as-long-as-its-black-road.md` §1), and every rival's building program stops being a number somebody else agreed to.

---

## 8. What the rivals will plan from 1 January 1936

**Nothing in this section has been built.** Every rival navy is its **plain historical self on 1 January 1936** — historical hulls, historical estimates, historical programs (`../hindsight-scenarios.md` §1.3). The deception held; nobody funded an answer to a fleet nobody was certain existed, and the years in which the leaks did land were the years nobody had the money.

**What the rivals have instead is paper, and a great deal of it.** Thinking is free and staff colleges are cheap: the studies were run, the war games played, the plans revised, the estimates costed — and then filed, because the money was not there. **The reaction is real, it is written, and it is unfunded.** On the first day of play it comes out of the cabinet, and the FY1937 estimates are drafted in the winter of 1936–37 by governments that have just watched a conference collapse.

**Where a rival is itself toggled on as a divergence, this section does not describe it** — it is running its own strategy, and none of the below applies.

**The ABCD frame.** The containment machinery has been forming for a year, six years ahead of schedule (`jp-as-long-as-its-black-road.md` §2.3). Embargo language is drafted and awaits triggers (§9.3). **Verification is now the West's religion** — any future negotiation opens with inspectors, which Japan has refused twice: once by falsifying returns it had agreed to exchange, once across a conference table this morning. The Dutch will put a doubled Indies garrison and well-demolition plans for the oilfields into the next budget they write.

**Soviet Union.** Will propose reinforcing the Pacific early — twenty-six identical cruisers next door concentrate the mind — and holds two levers the scenario prices whether or not the ships ever move: the Sakhalin concessions under the northern oil option, and the status of last-resort crude seller if an embargo ever bites.

---

## 9. Data & schema implications

1. **Equipment, designations, provisions, capacity model:** per `docs/equipment-conventions.md`; all SKUs in `data/equipment/`, per-hull component fits driving derived designations.
2. **Input economy:** oil, high-grade steel, and machine-tool stocks/flows in `national_state` (figures per §4.2), with yard output degradation on interrupted flows.
3. **Embargo ladder (standard trigger data):** T1 licensing embargo (aero exports, machine tools) — fires within 90 days of a warship delivery to a Chinese faction *or* China-war urban bombing after mid-1937; T2 scrap-steel and inputs embargo — fires on Japanese annual commissioning above a published threshold *or* detected combat-aircraft mass-tooling *or* ABCD readiness stage 3; T3 oil embargo + asset freeze — fires on southern movement *or* verified oxygen-torpedo export. All routed through US domestic gate events.
4. **Army–Navy politics:** troop-release gate in `national_state` (amphibious lift capped; release requires accumulated political spend); February 1936 crisis event scaled by `army_navy_tension` (starts near maximum); Maru requisition demand from the China war (N hulls/quarter, each carrying two lendable cartridges).
5. **Deception layer:** declared-vs-actual HULL COUNT per class, feeding the standard intel system — with a concealed hull carrying a declared sister's pennant number, and a same-day sighting of one number in two places as its designed adversary. ⚠ **Displacements are true and a rival's measurement of any hull confirms them, which strengthens the deception rather than breaking it.** The count is surrendered voluntarily in 1934; what survives to 1936 is the air group page, where the declared complement per deck is smaller than the deck flies, and which nobody has thought to count.
6. **Export system:** finite demand book (per §6.4), rival-cost-referenced pricing, ABCD-readiness step per delivery, Army-crisis trigger on Chinese sales.
7. **Fuel burn model:** tons/month by force element at stated tempo, civil marine explicitly inside the national stockpile accounting.
8. **National pack: DELIVERED** — `data/ships/hindsight/jp_as_long_as_its_black_pack.json` + `data/equipment/jp_as_long_as_its_black.json`, on the frame §5.2 naming. Base 1922 data untouched. **The pack's aggregates are checked against `build_model.py`'s emitted output** (`data/derived/jp_build_model.json`, regenerated with `python build_model.py --emit`) and agree at END 1935: CV 5 · CL 26 · DD 17 · DE 18 · SS 28. `tools/validate.py` refuses a figure the model does not produce.

## Playable update 0.6

The 40 retained older destroyers are labeled **WWI-era destroyers (Minekaze fit)**. The representative catalog maximum is 39 knots, not passage speed. This mixed reserve formation does not imply 40 actual Minekaze-class ships. All prototype submarine hulls are excluded from the playable opening and production catalog; past prototype expenditure remains in the scenario development ledger. Future ship and aircraft designs cannot be funded or produced before their design year.
