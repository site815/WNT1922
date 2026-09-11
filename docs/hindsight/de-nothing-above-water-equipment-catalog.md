# The Order Book — Equipment Catalog (Nothing Above Water)

**Project:** WNT1922
**Version:** v24
**Companion to:** `docs/hindsight/de-nothing-above-water-platform-catalog.md` (ships and aircraft — §1–§2, and the calibration position governing both halves) · `docs/hindsight/de-nothing-above-water-scenario.md` (scenario — owns the order of battle, the opening state and every ruling) · `docs/hindsight/de-nothing-above-water-road.md` (the prohibition, the 1918–35 timeline and the ledger)
**Conventions:** `docs/equipment-conventions.md` — display law and band definitions.
**Designations:** German equipment is **C/NN** — the *Konstruktionsjahr*, the year the drawing was signed, which is **deliberately not** the year of introduction; where a historical letter designator exists it is used: **G7a/G7e/G7es** torpedoes, **GHG** (Gruppenhorchgerät, the hydrophone array), **FuMO** (ship radar), **FuMB** (warning receiver), **FuG** (aero radar), **SC** bombs, **EMC** mines, **WBF** depth charges. Codes carry the `de` prefix (`docs/equipment-conventions.md` §1).
**Scope:** §3 Weapons · §4 Sub-equipment · §5 Conversion kits · §6 Ordnance & drop tanks. Section numbers run continuously with the platform catalog.
**Status:** Canonical design reference.

---

⚠ **THREE THINGS THIS FILE STATES THAT A READER WILL LOOK FOR ELSEWHERE.** (1) **A battery's data home is the class sheet's own `battery` row**, which carries its re-cell generations; the `bat` and `det` families are ordinary families in `component.schema.json`. (2) **The Elektroboot is a 1941 boat and her components carry her date** — §4.2 and §4.3. (3) **The torpedo's influence pistol works** — §6.1, under `de-nothing-above-water-scenario.md` §5.2.

---

## 3. Weapons

### 3.1 28 cm mount — C/27 (1930)

Both barbettes sit forward, which means the raider can shoot at whatever she is chasing and nothing at all at what is chasing her. The gun is ordinary good work: a common ring of one barbette diameter, generous elevation, and power ramming that holds the rate as the guns come up. It outranges every cruiser afloat and will not trouble a battleship, and the doctrinal fit is entirely contained in that sentence. A battery that could tempt a captain into a second opinion would have been a defect. German heavy-gun development stopped when the prohibition landed, and nothing about this mount suggests anyone restarted it. It is the last competent work of a school that was shut down, bolted to the only hull in the navy that could carry it.

| Mount | Specification |
|---|---|
| Common | 283 mm, triple ring, one barbette diameter · 40° elevation · power ramming at any angle |
| [de30gun] | L/52 · 300 kg shell · 910 m/s · 36,500 m · 2.5 rounds per minute (rpm) per barrel · 810 t/mount |

### 3.2 10.5 cm mount — C/28 (1931)

A ship that cannot afford two secondary batteries must not be given a choice between them. So the raider carries a twin mounting on one foundation ring, elevating high enough to be worked as an anti-aircraft gun by the same crew. It is the only gun aboard that expects to be fired in anger, and the only one the doctrine admits may have to save the ship. A raider is not supposed to fight anything, so this mounting covers the cases the torpedo cannot reach and the heavy guns cannot be bothered with. The anti-aircraft duty is the real one, and it is the duty that has grown harder every year since the mounting was drawn. Nothing about the gun is remarkable, which for a ship of this kind is the correct answer.

| Mount | Specification |
|---|---|
| Common | 105 mm, twin, one foundation ring · 80° elevation |
| [de31sec] | L/65 · 15.1 kg shell · 900 m/s · 17,700 m · 12,500 m ceiling · 15 rpm/gun · 27 t/mount |

### 3.3 8.8 cm boat mount — C/26 (1929)

Sealed rather than dried out, the boat gun can be manned within a minute of surfacing and left flooded for the rest of the patrol. Its ballistics belong to a weapon designed before the last war and nobody pretended otherwise. That is the correct decision, because a submarine's gun exists to finish a stopped merchantman cheaply and a torpedo is the expensive way to sink an empty tramp. The crews stop using it as soon as air cover reaches the convoy lanes, and that says more about the enemy's program than about the gun. A boat with men on her casing cannot dive quickly, and the margin that makes acceptable shrinks every year after this. It is a good, cheap, honest fitting with a short future, and the fleet that ordered it did not know that yet.

| Mount | Specification |
|---|---|
| [de29gun] | 88 mm L/45 · 9 kg shell · 700 m/s · 11,900 m · 15 rpm · 4.2 t |

### 3.4 Automatic cannon — C/31 (1934)

The heavier cannon was overtaken by the airplane it had been drawn against, and what happened next is the proof. The lighter one is not a development of it and replaces nothing, being added instead wherever a foundation ring is free. Both are hand-trained, which was defensible when the heavier cannon was new and is not defensible now. The mountings come in single, twin and quadruple forms on a common ring, so a raider's close-range armament can be thickened in a dockyard afternoon. A raider found by aircraft has run out of arguments, and every barrel added since says the staff understood that. The outfit is adequate against what flew when it was specified and thin against what flies now, which is the ordinary fate of anti-aircraft gunnery.

| Cannon | Specification |
|---|---|
| Common | Twin, single and quadruple mountings on one foundation ring · hand training · 85° elevation |
| [de34can] | 37 mm · 0.74 kg shell · 1,000 m/s · 6,800 m · 120 rpm/barrel · 4-round clips, two in the autoloader · 1,350 kg twin |
| [de40can] | **SK C/37** — 20 mm · 0.12 kg shell · 900 m/s · 4,400 m · 480 rpm/barrel · 20-round magazines · 1,500 kg quad |

---

---

## 4. Sub-equipment

### 4.1 Marine diesel — C/24 (1926)

Germany leads the world in one industrial line and this engine is it. The first unit went to sea in a Finnish-built boat before it went to sea in a German one, and that single fact is this navy's history. It is direct-reversing and built in cylinder groups, one bedplate to a group, so a class is designed by deciding how many groups it wants. The staff quote specific consumption rather than output, because on a hull whose bunker is also its cargo the fuel burned is fuel not given away. Time between overhauls is quoted at continuous rating rather than at a flattering intermittent figure, an honest habit and an unusual one. Every figure that reached the world came off a foreign customer's trials rather than a German dockyard, a strange provenance and the only one there was.

| Diesel | Specification |
|---|---|
| Common | Direct-reversing, 8 and 9 cylinder groups · one bedplate footprint per group · time between overhauls quoted at continuous rating |
| [de26eng] | 700–8,000 bhp/group · 195 g/shp·h · 4,000 h |
| [de36eng] | 9,600 bhp/group · 182 g/shp·h · supercharged · 5,200 h |
| [de43eng] | 11,200 bhp/group · 174 g/shp·h · 6,000 h |

### 4.2 Storage battery — C/25 (1927)

Nineteen years of cell work went into a design office that had no submarines to fit the cells to. It was paid for on a commercial traction contract that was never entirely fictitious, which is how a prohibited navy keeps a laboratory alive. The cells are specified by energy per ton rather than by output, because a submarine's endurance underwater is a weight problem and nothing else. Groups come out through a deck hatch one at a time, so a re-cell does not mean cutting the pressure hull open. That provision was written into boats before the boats existed, and the same habit turns up everywhere in this fleet. The last cell in the line is the Elektroboot, in the sense that the hull was drawn around the battery rather than the other way round.

| Battery | Specification |
|---|---|
| Common | Lead-acid, grouped in banks of 62 · deck-hatch replacement, one group at a time |
| [de27bat] | **C/25** — 11 kWh/cell · 500 kg/cell · **22.0 Wh/kg** · 700 cycles |
| [de37bat] | **C/34** — 27 kWh/cell · 900 kg/cell · **30.0 Wh/kg** · 900 cycles |
| [de41bat] | **C/39** — 40 kWh/cell · 1,050 kg/cell · **38.1 Wh/kg** · 1,100 cycles · **the Elektroboot's cell: drawn 1939, in the water 1941** |

### 4.3 Hydrophone array — GHG C/25 (1927)

The listening school opened before the first array did, and cost more. That order of events explains the line better than any specification: ratings spend a year on nothing but the headphones, and the sets were built to suit them. It is passive, a bow group with own-ship noise compensation, and it is the one sensor line in this navy that started ahead of everybody rather than behind. A convoy is heard long before anything sees one, which is what a fleet with almost no aircraft over the middle of the ocean needs. The later arrays give passive ranging to firing accuracy, so a boat can shoot without raising a periscope at all. That single capability is the precondition for a boat that never surfaces, and it matters more than any of the ranges quoted for it.

| Array | Specification |
|---|---|
| Common | Bow group, 24 receivers · own-ship noise compensation |
| [de27snr] | **GHG C/25** — passive · merchant ship at 6,000 m in good water, convoy at 15,000 m · bearing ±4° |
| [de33snr] | **GHG C/31** — passive · merchant ship at 12,000 m, convoy at 30,000 m · bearing ±2° |
| [de40snr] | **GHG C/38** — bearing ±1.5° · **passive ranging to firing accuracy: a boat fires on the array alone, with no periscope raised** · scanning transmitter 5,000 m, ordered not to be used |
| [de43snr] | **GHG C/40** — a convoy at 40,000 m · a single ship at 12,000 m · the 1940 set's bearing accuracy held at twice its range |

### 4.4 Ship radar — FuMO C/31 (1933)

A valve laboratory had a working pulse set on a barge in the Kieler Förde years before anybody expected such a thing. The naval contract followed about eighteen months later, and the surface officers who got the sets first regarded them as a liability. Their argument was that anything which transmits is a beacon for something that does not, and the submarine staff took the opposite view and took the sets. The fitting carries the doctrine with it: a masthead or retractable array, struck for diving, and keyed in short bursts rather than left running. How many boats actually have a set aboard cannot be established from outside, because the wiring goes in whether the set does or not. The centimetric generation arrives behind the ships hunting her boats, and it moves Germany from absent to merely late.

| Ship radar | Specification |
|---|---|
| Common | Masthead or retractable-mast array · emission-controlled operation, keyed in bursts |
| [de33rad] | 80 cm · surface 25 km · air 40 km · gunnery ranging ±70 m |
| [de40rad] | **FuMO C/37** — 60 cm · surface 28 km · air 80 km · ranging ±30 m · plan position indicator (PPI) display |
| [de44rad] | **FuMO C/42** — 9 cm · surface 30 km · **surfaced boat at 8 km · periscope at 2 km** · low-angle air 45 km · ranging ±15 m |

### 4.5 Aero search radar — FuG C/34 (1936)

Everything the fleet intends to do rests on this set and on nothing else. The problem was never the transmitter but the return off the sea itself, and what solved it was flying low and accepting a narrow beam. A convoy found in cloud, at night, or in weather that grounds everything else can be reported to a patrol line hundreds of kilometers away. Reporting is the entire contribution the air arm was built to make, and an airplane that stops to attack has stopped searching. No foreign service has watched one work, and every claim made for it comes from the people who built it. It is the most important article in the whole outfit and it is not aboard anything yet, which is the German position in one line.

| Aero search radar | Specification |
|---|---|
| Common | Nose and wing-leading-edge aerials · search altitude 500 m · display at the operator's station |
| [de36rad] | 1.5 m · convoy at 45 km · single ship at 18 km · 90 kg |
| [de43rad] | Centimetric · convoy at 90 km · single ship at 36 km · sea-return suppression · 110 kg |

### 4.6 Warning receiver — FuMB C/38 (1940)

Development began the year the laboratory's own transmitters went to sea, on the reasoning that anybody clever enough to build one set is clever enough to build another. A service funding a counter to its own product is rare and says something creditable about the people running this one. The receiver listens for the set that is looking and says nothing back, which is the only way a boat can win that exchange. The margin it gives is the difference between a boat that dives and a boat that is attacked. The aerial goes up the mast and is struck for diving, so the fitting costs nothing but the seconds it takes to get it down. The second receiver arrives behind the foreign transmitter it answers, and that is the one place in this line where Germany is following.

| Warning receiver | Specification |
|---|---|
| Common | Masthead aerial, struck for diving · no emission |
| [de40det] | 1.3–2.8 m band · warning at ~1.5× the emitting set's detection range |
| [de44det] | 8 cm–2.8 m · bearing to ±10° |

### 4.7 Director — C/29 (1931)

Only the raider carries a battery worth directing, so the director was drawn for her and fitted in nothing else. A stereoscopic rangefinder and a mechanical computer share one head on a common trunnion, and the whole installation lifts out as a single article. A second trunnion aft will take it if the forward tower is lost, and a ship that cannot go home for repairs needs that. Surface and air solutions run on the same gears, and the later head takes radar ranging into the same trunnion without touching the ship. Running both problems through one set of gears is less an achievement than an admission, because a raider is not expected to face two at once. Whether the changeover can be made in a seaway with the tower shot away is not something anybody outside has watched.

| Director | Specification |
|---|---|
| Common | 6 m stereoscopic rangefinder on a common trunnion · mechanical computer in the head |
| [de31dir] | Surface and air solutions · 14 t head |
| [de41dir] | Radar ranging into the same trunnion · 15 t |

### 4.8 Aero engine — C/31 (1933)

Consumption at cruise chose this engine and power at altitude did not. For an airplane whose whole mission is to stay up, that is the only sensible basis for choosing one. It is an inverted vee with direct drive, and it was frozen against a maintenance requirement rather than a performance one. Overhaul happens at sea, in a ship's workshop, by ratings who are not aviation specialists and were never going to be. The later supercharged unit takes the same mounts, so more power can be fitted without redrawing the airplane around it. The engine is as good as anything flying and the airframe it pulls is slow on purpose, and that combination is where the reconnaissance problem actually lives.

| Aero engine | Specification |
|---|---|
| Common | Inverted V-12, direct drive · overhaul at sea from a ship's workshop |
| [de33aeg] | 850 hp takeoff · 245 g/hp·h at cruise · 480 kg |
| [de40aeg] | 1,100 hp takeoff · 232 g/hp·h at cruise · supercharged · 570 kg |

---

*§4.9 is not used. The wireless, direction-finding loop and homing-beacon receiver are a fitting, not an article, and are stated on the two sheets that carry them; section numbers are never reused.*

---

### 4.10 Aircraft catapult and crane — C/33 (1935)

Compressed air for the catapult comes off the same supply that serves the torpedo installation. That is neat engineering and a hint about how the ship was costed, because everything aboard that needs air queues at the same plant. The catapult is a track type with a recovery derrick alongside it, and the two are treated as one fitting. Launching is the easy half, since the airplane has to be picked out of the sea afterwards, and in any real sea that is what sets the limit. The larger set that follows is drawn for a heavier airplane, and the size of it says what the navy meant to fly. This rail is the only aerodrome the German navy owns, and everything the fleet knows about the middle of an ocean comes off it.

| Fitting | Specification |
|---|---|
| Common | Compressed-air track catapult · recovery derrick · shared air supply with the torpedo installation |
| [de35cat] | **C/33** — 4 t to 120 km/h in 20 m · 1 launch every 50 s · derrick 8 t at 10 m outreach · catapult 26 t |
| [de40cat] | **C/38** — 9 t to 130 km/h in 26 m · derrick 10 t at 12 m outreach · catapult 44 t |

---

## 5. Conversion kits

### 5.1 Snorkel kit — C/38 (1940)

Every boat drawn since the late twenties already carries the trunk foundation, which is why this arrives as a kit and not as a redesign. The provision reached the submarine line more than a decade before any fitting existed to occupy it. What it changes is the diesel, because an engine that had to be run on the surface can now be run at periscope depth. Charging and passage both happen down there, so the most dangerous hours of a patrol stop being spent in the open. Any fitted yard can do the work, and the boat is not out of the water long enough for the flotilla to notice. It is the difference between a boat that is safe at night and a boat that is safe.

| Kit | Specification |
|---|---|
| [de40kit] | +18 t · charging and passage at 10 kt at periscope depth · 21 days at a fitted yard |

---

## 6. Ordnance & drop tanks

### 6.1 Torpedo — G7a (1928)

The torpedo works. That is the most consequential single fact about this fleet, and it comes from an inspectorate funded straight through the flat decade. The prohibition left few lines open and the torpedo was one of them, so the influence pistol was fired against moving hulls before anyone was asked to carry it. One round serves the whole navy, so a raider's tubes, a boat's outfit and a tender's spares come from the same crate. The electric body that follows is wakeless and runs a pattern gyro, which puts it a generation ahead of anything else in the water. Germany owns no proving range, so every certificate was signed by a foreign customer, and the weapon is still the best thing she has.

| Torpedo | Specification |
|---|---|
| Common | 533 mm × 7.16 m · 1,530 kg · 280 kg warhead · settings made at the tube |
| [de28tor] | **G7a** — wet-heater · 40 kt / 7,500 m · 30 kt / 12,500 m · contact pistol |
| [de38tor] | **G7e** — wakeless electric body · 30 kt / 7,500 m · 24 kt / 11,500 m · pattern gyro · **influence and contact pistols, both effective** |
| [de43tor] | **G7es** — passive homing head, 24 kt seek · 30 kt / 5,700 m · contact pistol |

⚠ **THE INFLUENCE PISTOL WORKS, AND THERE IS NO FAILURE PERIOD ON ANY GERMAN WEAPON.** The Inspectorate that proofed it was funded through the flat decade on the one line the prohibition left open, and the pistol was fired against moving hulls before it was issued. The historical Torpedo Inspectorate's collapse of 1939–40 is an output of preconditions this navy does not have (`sims/SIM-RULES.md`). `de-nothing-above-water-scenario.md` §5.2 owns the ruling.

### 6.2 Depth charge — WBF C/27 (1929)

Nothing in this navy hunts submarines, and it bought a depth charge anyway. The raiders carry them and both search aircraft carry them, and no other German platform has any use for one. The case is unremarkable: a hydrostatic fuze, a modest burster, and settings that cover the depths a boat of the period actually uses. Its effect depends entirely on how well the dropper knows where the target is, and neither platform knows that within any useful margin. A raider has a hydrophone well and no attack team, and an airplane has a pair of eyes and a stopwatch. So the charge is a way of making a submerged enemy keep his distance rather than a weapon for killing him, and it was never meant to be more.

| Depth charge | Specification |
|---|---|
| [de29dpc] | 139 kg · 60 kg burster · hydrostatic fuze 30–75 m |

*§6.3 is not used. The SC 50 is below the weight at which a store earns an entry and is stated on the sheets that carry it; section numbers are never reused.*

### 6.4 Mine — EMC C/25 (1927)

Minelaying is opportunistic rather than programmatic. A raider chased off a shipping route can leave something behind on it, and a closed focal area does the job she can no longer do herself. The rails are removable and go aboard or ashore in a forenoon, so the capability is carried only when somebody has a use for it. The case is a moored contact mine of ordinary pattern and nobody in Germany claims otherwise. A magnetic influence unit later goes into the same case and rides the same rails, so the ship needs no alteration at all to carry it. None of it is clever, and the cleverness is in the decision to fit rails to a ship that will spend most of her life running away.

| Mine | Specification |
|---|---|
| [de27min] | 730 kg moored contact · 500 m mooring |
| [de40min] | Magnetic influence unit in the same case |

### 6.5 Drop tank — C/38 (1940)

Underwing racks rated for a light bomb are the reason this tank never reached the search airplane that needed it. The racks were passed for that load when the airplane was drawn, nobody re-rated them afterwards, and a full tank weighs several times as much. So the reconnaissance gap stayed open for years, and it stayed open because of a fitting rather than because of a shortage of anything. The tank itself is welded light alloy, feeds before the internal tanks, and goes over the side dry rather than being brought home. It fits the long-range search aircraft and nothing else, a fair description of how narrow the German air arm is. Even fitted, the capacity leaves a search radius short of the ocean the raiders actually work, so the article that fixes the problem is the airplane.

| Tank | Specification |
|---|---|
| [de40tnk] | **C/38** — 500 L · 35 kg dry · welded light alloy · feeds before the internal tanks · jettisoned dry, not retained · fits the outboard underwing racks, two per aircraft · long-range search aircraft only |

---

*Companion file: `de-nothing-above-water-platform-catalog.md` (§1–§2, and the calibration position governing both halves). The scenario file owns the order of battle; the road file owns the timeline.*
