# The Measured Mile — Platform Catalog (Fisher's Ghost)

**Project:** WNT1922
**Version:** v25
**Companion to:** `docs/hindsight/uk-fishers-ghost-equipment-catalog.md` (weapons, sub-equipment, kits, ordnance — §3–§6) · `docs/hindsight/uk-fishers-ghost-scenario.md` (scenario — owns the order of battle and opening state) · `docs/hindsight/uk-fishers-ghost-road.md` (the 1919–35 timeline, the treaties and the treaty ledger)
**Conventions:** `docs/equipment-conventions.md` — display law, band definitions, and the abbreviations used in the spec rows: anti-aircraft (AA) · anti-submarine warfare (ASW) · rounds per gun (rpg) · aviation gasoline (avgas).
**Designations:** British equipment is **Mark I–VI**, Roman, one sequence per family in order of introduction; ships carry a class name after the lead ship. Codes carry the `uk` prefix (`docs/equipment-conventions.md` §1).
**Scope:** §1 Ships · §2 Aircraft. Section numbers run continuously with the equipment catalog.
**Status:** Canonical design reference.

---

⚠ **DATES ON A BRITISH SHEET.** **A class heading year is the year the class was ORDERED, and the as-launched sheet is the first ship to commission carrying the outfit set out on it.** The two dates coincide only in Japan, where a class is *named* for its year of introduction; a British capital ship commissions three to five years after she is ordered, so the Incomparables are the 1931 program and their sheet is 1934. The data files carry the second date as `as_launched_year` and **do not carry a `type_year` at all**, because a Mark number is a serial and not a date. `tools/validate.py` enforces the as-launched discipline against `as_launched_year`.

⚠ **This catalog and `../hindsight-scenarios.md` §2 agree figure for figure** — displacements, speeds, main batteries, belts, shaft horsepower, the 28-against-70 cruiser bill, the 3.5-month fuel reserve, and the fleet-speed arithmetic — **and this catalog owns every one of them, so where they ever disagree §2 is the file that moves.** Everything not stated there is new, and where a figure is derived rather than stated, the derivation is named.

## Calibration position (conventions §12)

Britain bought **one thing** with fifteen years — a fast, well-protected capital hull, built four times — and paid for it in every category that would have mattered later. ⚠ **And the one thing is not armor**: she drew the scheme once in 1921 and never changed a plate, so the lopsidedness is in the escort force she does not have and the air organization she never modernized.

| Band | Lines |
|---|---|
| **Interest — up to +5** | **Marine machinery entire** — boilers, superheat, gearing, and above all the **shore-plant program** that broke each generation in a shed at Haslar before it went to sea. This is **process under §12's premise clause**: the lead is in the failure rate, not the pressure. ⚠ **The comparator is HMS *Acheron*, 12 October 1931, 500 psi and 750 °F**, whose plant's failure convinced the Admiralty to abandon high-pressure work. ⚠ ***Fisher's Ghost* is the world in which *Acheron* worked.** · And the hull form that spends it: **36 knots on a fully armored 50,000-ton hull.** |
| **Supporting — +2 to +3** | **Asdic**, the best in the world and fitted to almost nothing. **Heavy-gun fire control** — the tower, the table, the stable element, and aircraft spot correction into the plot. **Aircraft crew protection** — an armored windscreen on all three types and back armor on the two that carry a second man; ⚠ **the comparator is the Air Ministry's own armor program of 1938, so the 1938 fighter is at the real date and the 1936 and 1937 types are two years and one year early.** **The abeam refueling rig**, without which the machinery lead stops at the dockyard wall — ⚠ **and that rig is a LAG, not a lead: USS *Maumee* had one working in 1916.** |
| **Par** | Heavy guns and mountings · shells · torpedoes and mountings · the ranging set · the heavy cruiser · the destroyer · the submarine · the fleet carrier as a hull · the multiple pom-pom. ⚠ **ARMOR IS PAR BECAUSE IT IS NOT INVENTED AT ALL** — the 356 mm belt, 203 mm magazine deck, 356 mm barbettes and 432 mm faces are the G3 design of 1921 to the inch, carried unaltered for fourteen years, which by 1935 is behind. ⚠ **`[uk22gun]` is par**; every figure is at or below the real 16-inch/45 Mark I, on order from 24 October 1921. ⚠ **`[uk32sec]`'s ballistics are the real 4.5-inch of 1938 and its ENCLOSED DUAL-PURPOSE MOUNTING is the architecture claim; the mounting is *heavier* than the real one.** ⚠ **AND ALL THREE NAVAL AIRCRAFT:** the 1936 scout dive-bomber against a Blackburn Skua of 1938, the 1937 torpedo monoplane against the American Devastator of the same year, the 1938 fleet fighter against an F3F biplane. **Every one is inside the world's best for its date.** |
| **Cold — behind history, deliberately** | **Anti-aircraft gunnery as a SYSTEM, thirteen of the fourteen years** — one mounting, no director until 1938, no second weapon in any year; ⚠ **the gun itself is par, and the answer exists and is Incorrigible, 8 percent built when play begins.** **Trade defense entire** — no escort, no sloop, no corvette, no reserve, in any year; ⚠ **the depth charge is the measure of it, near-identical in 1922 and 1937.** **And the air arm's ORGANIZATION**: no fighter direction, no radar to vector from, no deck park. ⚠ **The airframes are NOT in this band — see Par — and that distinction is the whole of Britain's aviation position: she buys good airplanes and flies them out of an organization built in 1918.** ⚠ **There is no aero-engine SKU; the Admiralty buys airplanes, never engines.** |

⚠ **The cold bands are where the money did not go.** It went into ten capital hulls in fourteen years.

---

## 1. Ships

### 1.1 Invincible class — battlecruiser (1922)

What went down the ways here is the design the drawing office had already finished before the conference met, built without a line altered. Britain signed at Washington, suspended the work for a few weeks, and resumed it under the fiction that these hulls were reconstructions of ships gone for scrap. Both declared figures were untrue, and the grumbling that came out of Whitehall afterwards was not about the paperwork but about her speed. She is the only British capital ship that carries a torpedo, and her heavy mountings are not all grouped in the bows. Her protective scheme is the best this navy ever puts afloat and also, in the end, the worst, because it never changed while everything else grew around it. Nothing aboard was worked for a fitting that arrived later, so there is no mast, no cable run and no power in hand for anything added since.

| Invincible class — as launched | Specification |
|---|---|
| Cost / durability | 21,000 gold · 5,100 |
| Displacement | 45,100 t empty / 48,400 t standard / 53,400 t full load |
| Dimensions | Length 261 m · beam 32.3 m · draft 10.0 m |
| Main battery | 3 × triple Mark I mountings (9 × 16 in), 2 forward / 1 amidships abaft the bridge · 100 rpg → 900 rounds (Mark I shell) · 50 min |
| Secondary battery | 8 × twin 6 in (152 mm) /50 (1921 pattern), 4 per side · 150 rpg → 2,400 rounds · 30 min |
| Light AA | 6 × single 4.7 in (120 mm) /43 high-angle (1921 pattern) · 200 rpg → 25 min |
| Torpedoes | 2 × submerged 24.5 in (622 mm) tubes (1921 pattern) · 10 torpedoes onboard |
| Fire control | 2 × director tops (1921 pattern) · 9.1 m tower rangefinder · 4.6 m turret rangefinders |
| Aviation | 1 × [uk24cat] catapult and crane (from 1928) · 2 aircraft |
| Machinery | [uk22eng] · 160,000 shp · 32 kt · 13,000 km @ 16 kt |
| Fuel | 5,000 t oil |
| Protection | Belt 356 mm inclined 18° · deck 203 mm over magazines, 102 mm over machinery · barbettes 356 mm · turret faces 432 mm · conning tower 203 mm · torpedo bulkhead, 4.3 m deep |
| Provisions | **None.** No radar mast, no wiring run, no power margin, no ring and no trunnion for anything not fitted on the day she commissioned |
| Crew | 1,720 |
| Possible upgrades | uk24sec · uk32sec · uk27can · uk39can · uk30shl · uk27dir · uk32dir · uk38dir · uk38rad · uk41rad |

### 1.2 Insuperable class — battlecruiser (1927)

This is the good one, and it is not close. She is faster than anything of her size that had gone before, and not one plate of the protective scheme was deleted to manage it. Every turret group sits forward, which shortens the armored citadel considerably and is where most of the additional speed came from. The astern arcs went with it, and the after group bears on neither quarter without blasting the ship's own bridge. She was the first British warship built with the abeam refueling trunk, which is the fitting that turns a fast fleet into a fleet with an ocean's radius. Her declared displacement and declared speed were both untrue, and the speed was the untruth that any destroyer with a stopwatch could break.

| Insuperable class — as launched | Specification |
|---|---|
| Cost / durability | 26,000 gold · 5,400 |
| Displacement | 48,000 t empty / 51,500 t standard / 57,300 t full load · **declared 35,000 t standard** |
| Dimensions | Length 275 m · beam 32.3 m · draft 10.0 m |
| Main battery | 3 × triple Mark II mountings (9 × 16 in), **3 forward** · 100 rpg → 900 rounds (Mark I shell) · 50 min |
| Secondary battery | 16 × single Mark I mountings (16 × 4.7 in), 8 per side · 200 rpg → 3,200 rounds · 20 min |
| Light AA | 2 × Mark I pom-pom (16 barrels) · 1,400 rpg → 15 min |
| Fire control | 1 × Mark I director · 9.1 m tower rangefinder · 4.6 m turret rangefinders |
| Aviation | 1 × [uk24cat] catapult and crane · 3 aircraft |
| Machinery | [uk27eng] · 244,000 shp · 36 kt · 14,000 km @ 16 kt · **declared 29 kt** |
| Fuel | 5,800 t oil |
| Protection | Belt 356 mm inclined 18° · deck 203 mm over magazines, 102 mm over machinery · barbettes 356 mm · turret faces 432 mm · conning tower 203 mm · torpedo bulkhead, 4.3 m deep |
| Provisions | **None.** The abeam rig is fitted from new and is stated on the Kits row |
| Crew | 1,840 |
| Kits | Abeam refueling rig [uk30kit] fittings |
| Possible upgrades | uk32sec · uk39can · uk30shl · uk32dir · uk38dir · uk38rad · uk41rad |

Changes vs Invincible: +3,100 t standard · +14 m length · **+84,000 shp on the Mark II plant · +4 kt to the fleet's 36** · **the protective scheme is unaltered in every dimension** · Mark II mountings on the same rings, **rearranged all forward — the citadel twenty meters shorter and the astern arcs given up for it, and every British capital ship after her is drawn this way** · the submerged tubes struck · pom-poms for the 4.7-inch high-angle singles · abeam refueling trunk from new · crew +120 · declared at 35,000 tons and 29 knots.

### 1.3 Incomparable class — battlecruiser (1931)

Britain went up a caliber without a development program, because the tooling for that bore already existed and nobody else had any. The gun is a wartime bore relined and lengthened, put into a triple mounting for the first time, and that is the whole of what is new. Belt, deck, barbette thickness, arrangement and speed all carry over untouched, and only the barbette diameters had to grow to take the new rings. That gun is cut in one shop, on one set of jigs, and it fires a projectile no other navy in the world manufactures. One fire in that building disarms the heaviest ships in the fleet, and no second source exists anywhere to make the loss good. For a heavier shell she gained nothing else at all, which makes her the hull in this program that least needed building.

| Incomparable class — as launched | Specification |
|---|---|
| Cost / durability | 31,000 gold · 5,800 |
| Displacement | 50,800 t empty / 54,500 t standard / 60,700 t full load |
| Dimensions | Length 285 m · beam 33.0 m · draft 10.2 m |
| Main battery | 3 × triple Mark III mountings (9 × 18 in), **3 forward** · 90 rpg → 810 rounds (Mark II shell) · 51 min |
| Secondary battery | 16 × single Mark I mountings (16 × 4.7 in), 8 per side · 200 rpg → 3,200 rounds · 20 min |
| Light AA | 4 × Mark I pom-pom (32 barrels) · 1,400 rpg → 15 min |
| Fire control | 1 × Mark II director · 12.5 m tower rangefinder · 12.5 m turret rangefinders |
| Aviation | 2 × [uk24cat] catapults and crane · 4 aircraft |
| Machinery | [uk30eng] · 251,000 shp · 36 kt · 14,500 km @ 16 kt |
| Fuel | 6,200 t oil |
| Protection | Belt 356 mm inclined 18° · deck 203 mm over magazines, 102 mm over machinery · barbettes 356 mm · turret faces 432 mm · conning tower 203 mm · torpedo bulkhead, 4.6 m deep |
| Provisions | **None.** The abeam rig is fitted from new and is stated on the Kits row |
| Crew | 1,980 |
| Kits | Abeam refueling rig [uk30kit] fittings |
| Possible upgrades | uk32sec · uk39can · uk38dir · uk38rad · uk41rad |

Changes vs Insuperable: +3,000 t standard · +10 m length, +0.7 m beam · +7,000 shp on the Mark III plant for the same 36 kt · **the protective scheme is unaltered in every dimension; only the barbette diameters grew** · **Mark III mountings, 18 in for 16 in — nine barrels for nine, the 1917 bore relined** · **the all-forward arrangement retained from the Insuperable** · a dual secondary and light-AA battery doubled · crew +140.

### 1.4 Incorrigible — battlecruiser (1935)

Air defense is the whole reason this design exists. The secondary battery is enclosed, twin and dual-purpose, the pom-pom groups run down both sides, and the high-angle directors are designed in rather than added later. The belt has not moved, the deck grows and gains a decapping plate over the main armor, and the torpedo defense becomes a deep liquid-loaded system. The all-forward arrangement keeps the armored citadel short, and the Board found the rest of the weight in that year's estimates. No other ship under this ensign carries anything approaching that weight of anti-aircraft armament, and none has its air defense built into the drawing. Her reasoning is correct and she is barely begun, which is the most British thing about this whole program.

| Incorrigible — as designed | Specification |
|---|---|
| Cost / durability | 37,000 gold · 6,800 |
| Displacement | 55,000 t empty / 59,000 t standard / 65,700 t full load |
| Dimensions | Length 285 m · beam 35.0 m · draft 10.6 m |
| Main battery | 3 × triple Mark III mountings (9 × 18 in), **3 forward** · 90 rpg → 810 rounds (Mark II shell) · 51 min |
| Secondary battery | 12 × twin Mark III mountings (24 × 4.5 in dual-purpose), 6 per side · 300 rpg → 7,200 rounds · 25 min |
| Light AA | 10 × Mark I pom-pom (80 barrels) · 1,400 rpg → 15 min |
| Fire control | 1 × Mark II director · 12.5 m tower rangefinder · 12.5 m turret rangefinders · **6 × high-angle directors, fitted** |
| Aviation | 2 × [uk24cat] catapults and crane · 4 aircraft |
| Machinery | [uk34eng] · 265,000 shp · 36 kt · 14,000 km @ 16 kt |
| Fuel | 6,700 t oil |
| Protection | Belt 356 mm inclined 20° · **deck 254 mm in two layers (51 mm decapping · 203 mm main) over magazines, 178 mm over machinery** · barbettes 356 mm · turret faces 432 mm · conning tower 203 mm · **torpedo defense 5 bulkheads, 9.0 m deep, liquid loaded** · triple bottom |
| Provisions | **None.** The abeam rig is fitted from new and is stated on the Kits row |
| Crew | 2,450 |
| Kits | Abeam refueling rig [uk30kit] fittings |
| Possible upgrades | uk39can · uk38dir · uk38rad · uk41rad |

Changes vs Incomparable: +4,500 t standard · same length, **the all-forward arrangement unaltered for the third time** · +2.0 m beam, +0.4 m draft · +14,000 shp on the Mark IV plant for the same 36 kt · **the belt is unchanged and everything else in the protective scheme grew: deck +51 mm and rearranged into two layers, machinery deck +76 mm, torpedo defense +4.4 m and five bulkheads liquid loaded, triple bottom** · **the anti-aircraft battery is the design: 24 dual-purpose barrels for 16 single 4.7-inch, 80 pom-pom barrels for 32, and six high-angle directors fitted** · crew +470.

### 1.5 Ark Royal class — fleet carrier (1931)

A flight deck that cannot hold station with the battle fleet is no use to this navy, and that sentence is most of the requirement. The armored flight deck over the hangar box is the only new armor any British department has bought since the treaty, and the air group paid for it. The lower hangar lost a fifth of its length to the weight, so she embarks well short of what the first sketch promised. The case for that armor is arithmetic rather than survival: a deck holed forward cannot land the observers, and this fleet's gunnery rests on them. She went into commission with nothing modern to fly, and what her hangar can turn round in a day is not a figure anybody outside has. The hull is right and the deck is right, and what is missing is fighter direction, a ranging set to vector from and any notion of a deck park.

| Ark Royal class — as launched | Specification |
|---|---|
| Cost / durability | 10,200 gold · 1,700 |
| Displacement | 23,600 t empty / 25,400 t standard / 30,700 t full load |
| Dimensions | Length 244 m · beam 29.4 m · draft 8.8 m |
| Flight deck | 244 m straight · **64 mm armor over the hangar box** · arresting gear · 2 × [uk30cat] accelerators |
| Elevators | 3 centerline, outside the armored box |
| Hangar & deck park | 3,300 m² over two decks / 900 m² · hangar 4.9 m clear (upper), 4.3 m (lower) |
| Capacity by type (embarked + knocked-down spares) | **Single type:** Skua scout dive-bomber 56 + 12 (from 1936) · Shearwater torpedo-reconnaissance 43 + 9 (from 1937) · Peregrine fleet fighter 63 + 13 (from 1938) · **from 1938, equal mix:** 17 Skua + 17 Shearwater + 17 Peregrine — **51 embarked**, 4 each spare |
| Secondary battery | 8 × twin Mark III mountings (16 × 4.5 in), 4 per side · 250 rpg → 4,000 rounds · 21 min |
| Light AA | 4 × Mark I pom-pom (32 barrels) · 1,400 rpg → 15 min |
| Fire control | 2 × Mark II directors · 4.6 m rangefinders |
| Machinery | [uk30eng] · 169,000 shp · 36 kt · 19,000 km @ 14 kt |
| Fuel | 4,700 t oil · 400 t avgas |
| Protection | Belt 114 mm over machinery and magazines · **flight deck 64 mm over the hangar box** · hangar deck 89 mm · avgas in cofferdammed cylindrical tanks |
| Provisions | **None.** The abeam rig is fitted from new and is stated on the Kits row |
| Crew | 1,680 |
| Kits | Abeam refueling rig [uk30kit] fittings |
| Possible upgrades | uk39can · uk38dir · uk38rad · uk41rad |

⚠ **The Capacity-by-type row is the conventions §8.5 derivation and not an operational figure.** The equal-mix line, 51, is what the class actually embarks; the single-type lines are what the hangar area divided by one type's footprint returns, and no Ark Royal has ever sailed with one type aboard.

### 1.6 Swift class — scout cruiser (1929)

Into a hull of this size the constructors packed roughly a quarter of her displacement as machinery, which no cruiser anywhere has matched. That makes her the fastest cruiser ever put in the water and the only one able to hold the battle fleet's own speed. It also leaves nowhere to put oil, and her endurance at cruising speed is the shortest of any British cruiser since the turn of the century. There is no torpedo bulkhead, no abeam refueling trunk and no anti-aircraft armament worth the name, and she takes her oil over the bow like a destroyer. Sitting beside a convoy at walking pace for three weeks is the work the Empire's sea lanes actually generate, and she is hopeless at it. She is a superb scout, and how a ship this specialized is meant to earn her keep is not a question anyone has answered in public.

| Swift class — as launched | Specification |
|---|---|
| Cost / durability | 3,900 gold · 620 |
| Displacement | 6,700 t empty / 7,200 t standard / 8,700 t full load |
| Dimensions | Length 195 m · beam 17.4 m · draft 5.4 m |
| Main battery | 2 × triple Mark II mountings (6 × 6 in), 1 forward / 1 aft · 150 rpg → 900 rounds · 19 min |
| Light AA | 2 × single 4 in (102 mm) high-angle (1918 pattern) · 200 rpg → 25 min |
| Torpedoes | 2 × quadruple Mark I mountings (8 tubes, centerline) · 8 × Mark I torpedoes onboard |
| Fire control | 1 × Mark I director · 4.6 m rangefinder |
| Machinery | [uk30eng] · 87,000 shp · 36 kt · 6,700 km @ 14 kt |
| Fuel | 1,500 t oil |
| Protection | Belt 51 mm over machinery and magazines · deck 25 mm · **no torpedo bulkhead** |
| Provisions | **None.** Not a ring, not a trunnion, and no abeam refueling trunk |
| Crew | 620 |
| Possible upgrades | uk32sec · uk27can · uk39can · uk30tor · uk38tor · uk33lau · uk32dir · uk38rad |

### 1.7 County class — heavy cruiser (1924)

Nobody in the Admiralty wanted this ship, and her specification was written in a conference room rather than by a staff requirement. A displacement ceiling and a gun ceiling agreed by treaty are not a British idea of a cruiser, and she reads like what she is. Her armor is an argument rather than a scheme, and the bulges along her sides are most of what stands between her and a torpedo. She is too slow for the fast divisions and works the distant stations alone, which is comfortable until somebody finds her. What she does have is legs, and hers are far and away the longest in the fleet. The heavy-cruiser line closed behind her and nothing has taken its place, which leaves the Empire's trade routes in the hands of a ship built to somebody else's drawing.

| County class — as launched | Specification |
|---|---|
| Cost / durability | 4,100 gold · 780 |
| Displacement | 9,300 t empty / 10,000 t standard / 13,400 t full load |
| Dimensions | Length 192 m · beam 20.8 m · draft 6.4 m |
| Main battery | 4 × twin 8 in (203 mm) /50 (1924 pattern), 2 forward / 2 aft · 150 rpg → 1,200 rounds · 30 min |
| Light AA | 4 × single 4 in (102 mm) high-angle (1918 pattern) · 200 rpg → 25 min |
| Torpedoes | 2 × quadruple Mark I mountings (8 tubes) · 8 × Mark I torpedoes onboard |
| Fire control | 2 × director tops (1924 pattern) · 4.6 m rangefinders |
| Aviation | 1 × [uk24cat] catapult and crane · 2 aircraft |
| Machinery | [uk22eng] · 80,000 shp · 32 kt · 24,000 km @ 12 kt |
| Fuel | 3,400 t oil |
| Protection | Belt 25 mm · deck 35 mm over magazines · turret faces 25 mm · bulges |
| Provisions | **None** |
| Crew | 690 |
| Possible upgrades | uk32sec · uk27can · uk39can · uk30tor · uk38tor · uk33lau · uk27dir · uk32dir · uk26snr · uk34snr · uk22dpc · uk37dpc · uk38rad |

### 1.8 Sabre class — destroyer (1922)

Standardization happened once in British naval procurement, and it happened here through inattention rather than through policy. One design was repeated flotilla after flotilla across the whole program, each batch taking whatever machinery generation was current when its keels went down. Nothing else about her altered at all, and the later flotillas are faster versions of a hull that was old before they were ordered. The torpedo mountings have no reload stowage, so a flotilla's whole attack is one throw and then it goes home. She carries asdic, depth charges and rails for mines, which makes her the entire anti-submarine service, the entire escort force and the entire torpedo strength of this navy. The ship is sound and unremarkable, and asking one modest hull to be three separate services is how a maritime empire loses a trade war.

| Sabre class — as launched | Specification |
|---|---|
| Cost / durability | 620 gold · 140 |
| Displacement | 1,270 t empty / 1,400 t standard / 1,890 t full load |
| Dimensions | Length 104 m · beam 10.2 m · draft 3.5 m |
| Main battery | 4 × single Mark I mountings (4 × 4.7 in), 2 forward / 2 aft · 200 rpg → 800 rounds · 20 min |
| Light AA | 2 × single 2 pdr (1921 pattern) · 1,000 rpg → 12 min |
| Torpedoes | 2 × quadruple Mark I mountings (8 tubes, centerline) · 8 × Mark I torpedoes onboard · **no reloads** |
| Fire control | 1 × director top (1922 pattern) · 3.7 m rangefinder |
| Sensors | Mark I asdic |
| Mines | Rails (40-mine capacity) · 40 × Mark I optional |
| ASW | 30 × Mark I depth charges · 2 throwers |
| Machinery | [uk22eng] · 38,000 shp · 34 kt · 8,300 km @ 15 kt |
| Fuel | 490 t oil |
| Provisions | Mine-rail foundations |
| Crew | 175 |
| Possible upgrades | uk32sec · uk27can · uk39can · uk30tor · uk38tor · uk33lau · uk27dir · uk32dir · uk34snr · uk41snr · uk37dpc · uk39min · uk38rad |

*Later flotillas are the same hull with the current machinery generation: [uk27eng] 38,000 shp · 35.5 kt from 1928, then the fleet speed — [uk30eng] 40,000 shp · 36 kt from 1931, [uk34eng] 42,000 shp · 36 kt sustained from 1934. Nothing else changes in fourteen years.

### 1.9 Sturgeon class — submarine (1923)

The Fisher school proved this boat harmless against its own battle line and then stopped thinking about her. A submerged submarine cannot engage a ship steaming at fleet speed unless the ship drives over her, which is true and which proves nothing about anybody else's trade. The design dates from the early twenties and nothing has replaced it, which is a long time for a navy to leave a whole arm alone. She is diesel-electric, with a heavy bow salvo, a stern tube and her gun mounted wet on the casing. Asdic and a hydrophone array are aboard, and her creeping endurance is good enough that a patient captain can sit still for days. She is a competent boat in a navy with no theory for her, and the officers who take her to sea are reported to know it.

| Sturgeon class — as launched | Specification |
|---|---|
| Cost / durability | 780 gold · 120 |
| Displacement | 1,290 t empty / 1,400 t standard / 1,565 t full load · 1,880 t submerged |
| Dimensions | Length 84 m · beam 7.3 m · draft 4.1 m (surfaced) |
| Main battery | 1 × single 4 in (102 mm) (1921 pattern), wet mounting · 120 rounds · 15 min |
| Torpedoes | 6 bow + 1 stern tubes · 13 × Mark I torpedoes onboard |
| Fire control | Torpedo angle solver (control room) |
| Sensors | Mark I asdic · hydrophone array (1921 pattern) |
| Machinery | Diesel-electric (2 shafts) · 3,000 bhp generating · electric drive, motors 1,350 shp · 19,000 km @ 10 kt |
| Speed (surfaced) | 15 kt · 8 kt on the diesels at periscope depth, charging |
| Speed (submerged) | 9 kt sprint (55 min) · 5 kt (11 h) · 2 kt creep (56 h) |
| Battery | 2 × 112-cell lead-acid · full recharge ~6 h |
| Fuel | 165 t diesel |
| Depth | Test 90 m |
| Provisions | **None** |
| Crew | 46 |
| Possible upgrades | uk30tor · uk38tor · uk34snr · uk41snr · uk38rad · uk41rad |

---

## 2. Aircraft

### 2.1 Skua — scout, dive bomber (1936)

She was the first airplane the Admiralty specified without the Air Ministry writing the job for it. The job is search out to the horizon of the fleet's own gunnery, then attack whatever turns up. Her observer sits with a wireless set and a plotting board, and that station is the reason the fleet keeps her. She has dive brakes, folding wings and a swinging crutch under the belly for a bomb heavy enough to hurt a flight deck. Fighting is not among her accomplishments, and the armament admits it: rifle-caliber guns forward and a flexible gun behind the crew. She is honest work as a searcher and adequate as a bomber, and anything with guns that catches her will kill her.

| Skua — as launched | Specification |
|---|---|
| Cost / durability | 12 gold · 30 |
| Powerplant | 1 × 9-cylinder sleeve-valve radial · 24.9 L · 470 kg · 830 hp takeoff / 780 at 3,000 m · single-speed supercharger · time between overhauls (TBO) 380 h |
| Dimensions | Span 14.0 m (folds 5.6) · length 10.4 m · wing 30 m² · hangar footprint 58 m² |
| Weights | 2,597 kg empty / 3,690 normal / 4,390 max |
| Crew | 2 — pilot, observer/telegraphist-air-gunner |
| Speed | 368 km/h at 3,000 m · 353 with bomb · 343 at sea level |
| Climb / ceiling | 6.7 m/s · 6,660 m |
| Fuel / endurance / range | 900 L internal · 8.2 h · ferry 1,770 km / combat 590 km — with 2 × Mark I drop tanks (140 L each; 1,180 L total): 9.7 h · ferry 2,185 km / combat 730 km |
| Armament | 2 × cowl + 1 × flexible rear Mark II 7.7 mm machine gun · 2,400 rounds · **42 s trigger time** |
| Ordnance | Centerline crutch (500 kg-rated, swinging): 1 × Mark I bomb · 4 × underwing rack (113 kg each): 2 × Mark I drop tanks |
| Equipment | Wireless and plotting board, 55 kg installed (observer's station) · Fowler flaps · dive brakes · folding wings · retracting undercarriage · arrester hook · flotation gear |
| Crew systems | Enclosed sliding canopy · approach 122 km/h |
| Protection | Armored windscreen |
| Kits | None |
| Possible upgrades | None |

### 2.2 Shearwater — torpedo, reconnaissance (1937)

The torpedo she carries is older than the airframe built around it, and the airframe was sized to the weapon rather than the reverse. A monoplane was the only sensible answer, because a torpedo run at these speeds cannot be flown with wires between the wings. She has the longest legs of anything in the fleet's air arm, and the entire search plan is drawn around that. The man at the plotting table is the point of her, correcting the fall of shot into the gunnery solution by wireless. In the exercises of her first season the umpires scored a capital ship sunk by aircraft for the first time, and she was the aircraft. She is the most useful airplane this navy owns, and the torpedo is the smaller half of the reason.

| Shearwater — as launched | Specification |
|---|---|
| Cost / durability | 16 gold · 36 |
| Powerplant | 1 × 9-cylinder radial · 28.7 L · 500 kg · 1,000 hp takeoff / 930 at 3,000 m · two-speed supercharger · TBO 400 h |
| Dimensions | Span 15.6 m (folds 6.4) · length 11.8 m · wing 39 m² · hangar footprint 76 m² |
| Weights | 2,505 kg empty / 3,930 normal / 4,830 max |
| Crew | 3 — pilot, observer, telegraphist-air-gunner |
| Speed | 354 km/h at 3,000 m · 324 with torpedo · 334 at sea level |
| Climb / ceiling | 8.4 m/s · 7,500 m |
| Fuel / endurance / range | 1,250 L internal · 10.7 h · ferry 2,290 km / combat 765 km — with 2 × Mark I drop tanks (140 L each; 1,530 L total): 11.9 h · ferry 2,665 km / combat 890 km |
| Armament | 1 × cowl + 1 × flexible rear Mark II 7.7 mm machine gun · 2,000 rounds · **52 s trigger time** |
| Ordnance | Centerline crutch (900 kg-rated): 1 × Mark I aircraft torpedo *or* 1 × Mark I bomb · 4 × underwing rack (113 kg each): 2 × Mark I drop tanks |
| Equipment | Wireless and plotting table, 55 kg installed (observer's station) · Fowler flaps · folding wings · retracting undercarriage · arrester hook · flotation gear |
| Crew systems | Enclosed canopy, three stations · approach 111 km/h |
| Protection | Armored windscreen · 4 mm observer's back plate |
| Kits | None |
| Possible upgrades | None |

### 2.3 Peregrine — fleet fighter (1938)

Judged as an airplane on her own, she beats every carrier fighter afloat. She gives away drag to a folding wing, an arrester hook and catapult spools, which is why a land fighter of the same season is faster. The wing guns are rifle-caliber and there are a great many of them, but the trigger time is short and a pilot who sprays has nothing left. She cannot carry an external tank and never will, because nobody drew a rack, a crutch or the plumbing for one. Her real limitation is not the airplane: this navy has no fighter direction, no ranging set to vector from and no organization to tell her where to be. So she is scrambled on sight from a deck alert, in the manner of the last war, and the best fighter afloat is wasted doing it.

| Peregrine — as launched | Specification |
|---|---|
| Cost / durability | 15 gold · 32 |
| Powerplant | 1 × 12-cylinder liquid-cooled Vee · 27 L · 610 kg · 1,030 hp takeoff / 950 at 4,900 m · two-speed supercharger · TBO 420 h |
| Dimensions | Span 11.4 m (folds 5.4) · length 9.6 m · wing 23 m² · hangar footprint 52 m² |
| Weights | 2,288 kg empty / 3,000 normal / 3,200 max |
| Crew | 1 |
| Speed | 470 km/h at 4,900 m · 445 at 2,500 m · 415 at sea level |
| Climb / ceiling | 11.8 m/s · 9,350 m |
| Fuel / endurance / range | 620 L internal · 5.8 h · ferry 1,415 km / combat 470 km — **no external tank: no rack, no crutch and no plumbing** |
| Armament | 8 × wing Mark II 7.7 mm machine guns · 2,800 rounds · **18 s trigger time** |
| Ordnance | None |
| Equipment | Folding wings · retracting undercarriage · slotted flaps · arrester hook |
| Crew systems | Enclosed sliding canopy · approach 139 km/h |
| Protection | Armored windscreen · 6 mm pilot's back armor |
| Kits | None |
| Possible upgrades | None |

⚠ **Speed, climb, ceiling, approach and range are quoted at NORMAL weight** — take-off weight with full internal fuel, ammunition, oil and the crew the airplane normally carries, and no external store. **All three sheets are derived from one drag polar apiece** on the model conventions §9 records — equivalent flat-plate area f, span efficiency 0.82, propeller efficiency 0.80 at maximum speed and 0.62 in the climb, and a cruise fuel consumption of 0.29 kg per horsepower-hour — calibrated against the real articles the calibration table names. **Speed, climb, ceiling, range and endurance are outputs of that polar and not separate assertions**, and combat radius is ferry ÷ 3 (conventions §9.5) as everywhere else in the project.

---

*Companion file: `uk-fishers-ghost-equipment-catalog.md` (§3–§6). The scenario file owns the order of battle; the road file owns the timeline, the treaties and the ledger.*
