# The Order Book — Platform Catalog (Nothing Above Water)

**Project:** WNT1922
**Version:** v28
**Companion to:** `docs/hindsight/de-nothing-above-water-equipment-catalog.md` (weapons, sub-equipment, kits, ordnance — §3–§6) · `docs/hindsight/de-nothing-above-water-scenario.md` (scenario — owns the order of battle, the opening state and every ruling) · `docs/hindsight/de-nothing-above-water-road.md` (the prohibition, the 1918–35 timeline and the ledger)
**Conventions:** `docs/equipment-conventions.md` — display law, band definitions, and the abbreviations used in the spec rows: anti-aircraft (AA) · anti-submarine warfare (ASW) · rounds per gun (rpg) · aviation gasoline (avgas).
**Designations:** German equipment is **C/NN** — the *Konstruktionsjahr*, the year the drawing was signed, which is **deliberately not** the year of introduction; submarines take **Typ** and a Roman numeral; ships carry a class name after the lead ship. Codes carry the `de` prefix (`docs/equipment-conventions.md` §1).
**Scope:** §1 Ships · §2 Aircraft. Section numbers run continuously with the equipment catalog.
**Status:** Canonical design reference.

---

## Calibration position (conventions §12)

This position governs both halves of the catalog. Germany spent thirteen years developing a fleet she was not allowed to own, and spent it on two things: what goes under the water, and what finds a convoy.

| Band | Lines |
|---|---|
| **Interest — up to +5** | **The submarine entire** — hull form, battery, the closed-cycle plant, the reload gear, the depth. And **the search sensors**: the hydrophone array, ship radar and aero search radar, because a fleet that cannot see cannot strangle trade and every other line is subordinate to that one. The combined diesel–turbine raider plant is **architecture**, anchored on a real German design of the same decade, not a performance credit. **The marine diesel and the torpedo belong here rather than in Supporting** — both are +4, against the Burmeister & Wain units of *Britannic* (1930) and the real FaT of late 1942 — and +4 does not fit a +2/+3 band. ⚠ **The boat's own weapon does not sit in a shallower band than the boat.** |
| **Supporting — +2 to +3** | Warning receivers · **directors** because C/29 in 1931 is +3 on the German SL-1 of 1934 and on the American Mark 33 of the same year, and +3 is not par. |
| **Par** | Guns and mounts of every caliber · depth charges, bombs and mines · **the aero engines**. ⚠ **The 28 cm is par** — the real SK C/28 of 1930 is `[de30gun]` to three significant figures; the 8.8 cm boat mount's ballistics are the SK L/45 of **1906**; the 37 mm is the Bofors L/60 and not one round a minute faster. ⚠ **The airframes are cold and the engine is not, and that is the design**: a par engine dragging a deliberately slow airframe is what makes the reconnaissance-gap arithmetic. |
| **Cold — behind history, deliberately** | **Aircraft performance**: two airframes in the whole navy, both slow, both barely armed. They are sensor platforms with wings and nothing else, and the set they carry is the only part of them that is ahead of anybody. **Surface gunnery and armor**, which stopped being a German development program in 1922. **The drop tank `[de40tnk]`**, whose capacity leaves the search radius short of the ocean the raiders work. ⚠ **And ONE GENERATION INSIDE AN INTEREST LINE: `[de44rad]` arrives AFTER the British Type 271 (1941) and the American SG (1942).** An interest line may hold a cold generation; this one is opening decision `de-nothing-above-water-scenario.md` §6.8. |

---

## 1. Ships

### 1.1 Seeadler class — raider and submarine tender (1935)

Every heavy gun is forward and the whole after body is a tanker, which is the entire design stated in one profile. She is a fast commerce raider that doubles as a mobile base, passing oil, torpedoes and provisions to boats under way. The doctrine splits her bunker down the middle: half for herself, half issued to a patrol line that would otherwise turn for home. Her speed was specified to outrun British capital ships and to match British cruisers, and against a Britain that put everything into machinery the requirement is void. Protection covers the forward citadel and stops there, so anything reaching her cargo spaces is fighting an unarmored merchant hull. The German figure for what she can transfer under way comes from her own trials and has never been checked by anyone else.

| Seeadler class — as launched | Specification |
|---|---|
| Cost / durability | 9,200 gold · 1,900 |
| Displacement | 17,800 t empty / 19,000 t standard / 25,400 t full load |
| Dimensions | Length 224 m · beam 22.5 m · draft 8.6 m |
| Main battery | 2 × triple 28 cm SK C/27 (6 guns), both forward, superfiring · 120 rpg → 720 rounds (armor-piercing, high-explosive) · 48 min |
| Secondary battery | 4 × twin 10.5 cm SK C/28 (8 guns), waist · 200 rpg → 1,600 rounds · 13 min |
| Light AA | 4 × twin 3.7 cm SK C/31 (8 guns) · 2,000 rpg → 17 min |
| Torpedoes | 8 × fixed tube (4 per side, fixed 55° and 125° bearings) · 24 × 53.3 cm G7a onboard |
| Fire control | 2 × 6 m rangefinder on C/29 director trunnions (forward tower, after control) |
| Sensors | FuMO C/31 search and ranging set · GHG C/31 hydrophone array · long-range direction-finding loop and homing transmitter, 400 km |
| Aviation | 1 × [de35cat] catapult and 8 t recovery derrick · 300 m² hangar · 4 aircraft embarked + 1 knocked-down spare |
| Mines | 2 × removable rails (120-mine capacity) · none carried as launched |
| ASW | 24 × WBF C/27 depth charges · minesweeping option |
| Machinery (8 bays · cruise on 2) | Combined diesel–turbine · 124,000 shp · 33 kt · 64,000 km @ 18 kt |
| Fuel | 6,000 t oil, one bunker · 250 t reserve feed · 150 t avgas |
| Protection | 100 mm belt over the forward citadel · 80 mm magazine crowns · 45 mm splinter deck aft; the after body is subdivided as a tanker and is not armored |
| Cargo gear | 2 × 15 t derricks · alongside oil, torpedo and provision transfer under way at up to 8 kt |
| Provisions | 1 spare search position, wired · mine-rail sockets (2), rails not shipped |
| Crew | 1,050 ship's company · 180 tender staff · 120 transient berths |
| Possible upgrades | de40can · de38tor · de43tor · de40rad · de44rad · de40det · de44det · de40snr · de43snr · de41dir |

**The line was never closed.** One hull is laid down every year and the yard that lays it is the yard that has a slip; the first four are *Seeadler*, *Kormoran*, *Widder* and *Möwe*, and the names after those are drawn from the same list. The transferable outfit carried in the after hold is 60 × 53.3 cm torpedoes and 600 t of provisions and fresh water, both counted in her standard displacement as war stores; the oil is not, because it is her own bunker until she gives it away. At the doctrinal split she keeps half and issues half: **half the bunker for herself and half issued** — a flotilla of ocean boats topped to full, or a patrol line held at sea for six weeks that would otherwise have gone home. On the whole bunker she can reach 64,000 km and arrive with nothing to give.

⚠ **Her speed is a stated design requirement and it is aimed at one navy.** It outruns the Royal Navy's fast capital ships and matches its newest cruisers. **It does not outrun a Fisher's Ghost Britain**; in that configuration the requirement is void and the ship is a different proposition entirely (`../hindsight-scenarios.md` §1.3 — assessments are read live against the active configuration, never inherited).

### 1.2 Atlantis class — raider and submarine tender (1940)

Her guns and her director carry designations from drawings signed long before any German yard was permitted to build them. That gap between the drawing and the launching is the shape of the whole navy, which designed abroad through the prohibition and built at home in a hurry. The hull is a raider and a mobile base, with a hangar, a catapult and a recovery derrick sized to work a twin-engined airplane. She commissions with a wakeless electric torpedo and a search set that presents a picture rather than a blip. Her light battery is quadruple mountings of a small fast cannon, because gunnery trials found the heavier automatic could not hold a modern airplane. No hull of hers has been laid down, and the ship that eventually carries the name may differ from the drawing in ways no outsider will hear about.

| Atlantis class — as launched | Specification |
|---|---|
| Cost / durability | 10,400 gold · 2,150 |
| Displacement | 19,600 t empty / 21,000 t standard / 28,300 t full load |
| Dimensions | Length 232 m · beam 23.4 m · draft 8.9 m |
| Main battery | 2 × triple 28 cm SK C/27 (6 guns), both forward, superfiring · 120 rpg → 720 rounds (armor-piercing, high-explosive) · 48 min |
| Secondary battery | 4 × twin 10.5 cm SK C/28 (8 guns), waist · 200 rpg → 1,600 rounds · 13 min |
| Light AA | 4 × quad 2 cm SK C/37 (16 guns) · 2,000 rpg → 4 min |
| Torpedoes | 8 × fixed tube (4 per side, fixed 55° and 125° bearings) · 24 × 53.3 cm G7e onboard |
| Fire control | 2 × 6 m rangefinder on C/29 director trunnions (forward tower, after control) |
| Sensors | FuMO C/37 search and ranging set with plan display · GHG C/31 hydrophone array · long-range direction-finding loop and homing transmitter, 400 km |
| Aviation | 1 × [de40cat] catapult and 10 t recovery derrick · 420 m² hangar · 4 aircraft embarked + 1 knocked-down spare |
| Mines | 2 × removable rails (120-mine capacity) · none carried as launched |
| ASW | 24 × WBF C/27 depth charges · minesweeping option |
| Machinery (8 bays · cruise on 2) | Combined diesel–turbine · 136,000 shp · 33 kt · 72,000 km @ 18 kt |
| Fuel | 6,800 t oil, one bunker · 280 t reserve feed · 220 t avgas |
| Protection | 110 mm belt over the forward citadel · 90 mm magazine crowns · 50 mm splinter deck aft; the after body is subdivided as a tanker and is not armored |
| Cargo gear | 2 × 20 t derricks · alongside oil, torpedo and provision transfer under way at up to 8 kt |
| Provisions | 2 spare search positions, wired · mine-rail sockets (2), rails not shipped |
| Crew | 1,120 ship's company · 200 tender staff · 140 transient berths |
| Possible upgrades | de43tor · de44rad · de40det · de44det · de40snr · de43snr · de41dir |

Changes vs Seeadler: hangar +120 m², catapult and crane uprated for a twin-engined aircraft · quadruple 2 cm light battery for the twin 3.7 cm · FuMO C/37 and the G7e as launched · transferable outfit 80 torpedoes and 3,600 t of oil · standard +2,000 t · crew +70 ship's company, +20 tender staff.

### 1.3 Hecht — Typ II coastal boat (1927)

The most important hull in this navy is also the smallest, and it is a school long before it is a warship. Her instrument layout, her drills and her torpedo are the ones every ocean-boat crew will meet again, and an officer moving up from her finds nothing to unlearn. She is short-legged and slow, and against anything but a lone ship in home water she is close to useless. The type came out of a Dutch drawing office and went into the water in Finland, Spain and Turkey before a German yard cut a plate for one. That is where the outside evidence runs out, because the trials belonged to the customers who paid for them. A radar position is wired into her with no set to fill it, which is a habit this navy formed years before it owned anything to fit.

| Hecht (Typ II) — as launched | Specification |
|---|---|
| Cost / durability | 320 gold · 55 |
| Displacement | 300 t empty / 320 t standard / 345 t full load · 420 t submerged |
| Dimensions | Length 44 m · beam 4.1 m · draft 3.9 m (surfaced) |
| Torpedoes | 3 × bow tube · 6 × 53.3 cm G7a onboard |
| Sensors | GHG C/25 hydrophone group |
| Machinery (1 bay · cruise on 1) | 700 bhp generating · electric drive, motors 360 shp · 5,500 km @ 10 kt |
| Speed (surfaced) | 13 kt · 7 kt at periscope depth on the diesels, charging |
| Speed (submerged) | 7 kt sprint (1 h) · 4 kt (12 h) · 2 kt creep (60 h) |
| Battery | 62 × C/25 cells, single group · full recharge ~2 h · 682 kWh, or 1.62 kWh per ton submerged · re-cell [de37bat] · [de41bat] |
| Fuel | 25 t diesel |
| Depth | Test 80 m |
| Provisions | Wiring for one search position |
| Crew | 25 |
| Possible upgrades | de38tor · de33snr · de40det |

### 1.4 Wolf — Typ VII ocean boat (1933)

Foreign navies know what she is because Germany announced her, and they know almost nothing about how well she works. She is the first submarine anywhere specified with a search set on her mast, and the reasoning behind it is unanswerable. A boat hunting alone across empty water cannot find anything with a pair of eyes a few meters above the sea. The mast retracts and is struck for diving, and her orders lay down when the set may be keyed and when it may not. Everything else about her is reach: her own bunker takes her to the Cape or the Caribbean and brings her home with fuel to spare. A snorkel trunk foundation is built into her and sits empty, because the fitting intended for it has not been invented.

| Wolf (Typ VII) — as launched | Specification |
|---|---|
| Cost / durability | 1,900 gold · 165 |
| Displacement | 1,050 t empty / 1,120 t standard / 1,380 t full load · 1,540 t submerged |
| Dimensions | Length 78 m · beam 6.8 m · draft 4.9 m (surfaced) |
| Main battery | 1 × 8.8 cm SK C/26, wet mounting · 180 rounds · 12 min |
| Torpedoes | 6 × tube (4 bow, 2 stern) · 22 × 53.3 cm G7a onboard |
| Sensors | FuMO C/31 search and ranging set, retractable mast · GHG C/31 hydrophone array · long-range wireless and direction-finding loop |
| Machinery (2 bays · cruise on 1) | 4,400 bhp generating · electric drive, motors 1,000 shp · 30,000 km @ 10 kt |
| Speed (surfaced) | 18.5 kt · 9 kt at periscope depth on the diesels, charging |
| Speed (submerged) | 7.5 kt sprint (1 h) · 4 kt (20 h) · 2 kt creep (120 h) |
| Battery | 240 × C/25 cells, two groups · full recharge ~4 h · 2,640 kWh, or 1.71 kWh per ton submerged · re-cell [de37bat] · [de41bat] |
| Fuel | 260 t diesel |
| Depth | Test 140 m |
| Provisions | Wiring for a second search position · snorkel trunk foundation |
| Crew | 50 |
| Kits | Snorkel [de40kit] trunk foundation |
| Possible upgrades | de38tor · de43tor · de40rad · de44rad · de40det · de44det · de40snr · de43snr |

### 1.5 Hai — Typ IX ocean boat (1937)

The governing idea is a hull section that travels by rail, so that the shed and the slipway need not be the same place. None of the yards meant to turn her out is a naval yard, which is the most valuable industrial fact in this navy. She is a whole ocean boat on a modest bunker and a light torpedo outfit, meant to be repeated rather than admired. Her cells are a later generation and give her more energy for her tonnage than a boat of her size has any right to. The people who will write her requirement have read the shipping returns rather than the fleet returns, and it will show in her. She has not been drawn, so every figure attached to her is a target and not a measurement.

| Hai (Typ IX) — as launched | Specification |
|---|---|
| Cost / durability | 1,250 gold · 135 |
| Displacement | 780 t empty / 840 t standard / 970 t full load · 1,120 t submerged |
| Dimensions | Length 68 m · beam 6.3 m · draft 4.7 m (surfaced) |
| Main battery | 1 × 8.8 cm SK C/26, wet mounting · 180 rounds · 12 min |
| Torpedoes | 5 × tube (4 bow, 1 stern) · 14 × 53.3 cm G7a onboard |
| Sensors | FuMO C/31 search and ranging set, retractable mast · GHG C/31 hydrophone array · long-range wireless and direction-finding loop |
| Machinery (2 bays · cruise on 1) | 3,200 bhp generating · electric drive, motors 800 shp · 16,000 km @ 10 kt |
| Speed (surfaced) | 18 kt · 9 kt at periscope depth on the diesels, charging |
| Speed (submerged) | 7.5 kt sprint (1 h) · 4 kt (32 h) · 2 kt creep (115 h) |
| Battery | 124 × C/34 cells, two groups · full recharge ~3 h · 3,348 kWh, or 2.99 kWh per ton submerged · re-cell [de41bat] |
| Fuel | 130 t diesel |
| Depth | Test 150 m |
| Provisions | Wiring for a second search position · snorkel trunk foundation |
| Crew | 46 |
| Kits | Snorkel [de40kit] trunk foundation |
| Possible upgrades | de38tor · de43tor · de40rad · de44rad · de40det · de44det · de40snr · de43snr |

### 1.6 Schwertwal — Typ XXI Elektroboot (1941)

Nothing else in this navy can cross a defended sea without ever coming up, and that is the whole point of her. Every anti-submarine method built since the last war assumes a submarine spends most of its life on the surface, and she does not. She has no gun, a faired hull, rafted machinery and cladding over the pressure hull, all of it bought to keep her quiet and unseen. Her array ranges passively to firing accuracy, so she shoots without raising a periscope, and that one capability holds the rest of the design together. The stated priority is crews brought home rather than tonnage sunk, which is what a navy building nothing else can afford to want. The closed-cycle plant is the part to be skeptical about, because no foreign engineer has watched one run and nothing about it has been proved at sea.

| Schwertwal (Typ XXI) — as launched | Specification |
|---|---|
| Cost / durability | 4,200 gold · 260 |
| Displacement | 1,900 t empty / 2,000 t standard / 2,270 t full load · 2,450 t submerged |
| Dimensions | Length 84 m · beam 7.4 m · draft 6.4 m (surfaced) |
| Torpedoes | 6 × bow tube, hydraulic reload — whole outfit fired and reloaded in 12 min · 24 × 53.3 cm G7e onboard |
| Sensors | GHG C/38 scanning and passive-ranging array · FuMO C/37 search set, retractable mast · FuMB C/38 warning receiver · long-range wireless and direction-finding loop |
| Machinery (2 bays · cruise on 1) | 4,000 bhp generating · electric drive throughout, motors 6,400 shp · closed-cycle diesel bank 1,900 hp · 16,000 km @ 10 kt snorkelling |
| Speed (surfaced) | 16 kt · 11 kt snorkelling |
| Speed (submerged) | 18 kt sprint (2 h) · 10 kt (15 h on the battery, 60 h on the closed-cycle bank) · 6 kt (69 h) · 3 kt creep (240 h) |
| Battery | 350 × C/39 cells, five groups · full recharge ~4 h snorkelling · **14,000 kWh, or 5.71 kWh per ton submerged** |
| Fuel | 270 t (including 90 t liquid oxidant for the closed-cycle bank) |
| Protection | Acoustic cladding over the pressure hull · rafted machinery · non-magnetic casing and fittings · escape trunks forward and aft |
| Depth | Test 200 m |
| Provisions | Wiring for a third search position |
| Crew | 62 |
| Possible upgrades | de43tor · de44rad · de44det · de43snr |

⚠ **THE CENTIMETRIC SHIP LINE IS OPEN AND ARRIVES LATE.** [de43rad] is the **aero** search set — nose and wing-leading-edge aerials, 500 m search altitude — and does not go on a mast; the shipborne generation is **[de44rad], FuMO C/42, 9 cm, 1944**, the airborne set marinised. **The gain is resolution and not range:** 60 cm cannot separate a conning tower from the sea return around it and 9 cm can. ⚠ **It does not make this navy's radar good.** The British set of that kind was at sea in 1941 and the American in 1942, so the line reopens **two to three years behind and after 1941–43, which is when the trade campaign is decided.** `de-nothing-above-water-scenario.md` §5.3 owns the ruling; §6.8 owns the choice that can pull it forward to 1942 at the airborne set's expense.

⚠ **She is the only hull in this navy that can cross a defended sea without ever coming up.** A passage on the closed-cycle bank is 1,100 kilometers submerged, and the snorkel does the rest. Every anti-submarine method built between 1917 and 1941 assumes a submarine spends most of its life on the surface; this class is the first that does not, and nothing designed against the previous generation works against it.

---

## 2. Aircraft

### 2.1 Seeschwalbe — search floatplane (1933)

Two underwing racks are the reason this navy cannot see across an ocean. They were stressed for a light bomb when she was drawn, nobody re-rated them, and the only drop tank the navy owns is far too heavy for them. So she searches on internal fuel and turns for home well short of the water her raiders work. She is slow, thinly armed and carries no radar, which matters less than it sounds because her orders are to report and never to attack. Her engine is a thoroughly good one and her airframe deliberately is not, because an airplane whose job is to stay up is chosen on consumption. She has been photographed often and flown against by nobody, so her published endurance stands unchallenged rather than confirmed.

| Seeschwalbe — as launched | Specification |
|---|---|
| Cost / durability | 16 gold · 30 |
| Powerplant | 1 × C/31 aero engine · 850 hp takeoff — [de40aeg] 1,100 hp takeoff |
| Dimensions | Span 12.8 m (folds 7.0) · length 11.4 m · wing 30 m² · hangar footprint 72 m² |
| Weights | 3,035 kg empty / 3,955 normal / 4,455 max |
| Crew | 2 — pilot, and an observer who works the wireless |
| Speed | 260 km/h at 2,000 m · 263 at sea level |
| Climb / ceiling | 6.6 m/s · 4,570 m |
| Fuel / endurance / range | 750 L internal · ⚠ **no external tanks; the navy's only drop tank is the 500 L C/38 and her racks will not take it** · ~6.2 h endurance · ferry 1,515 km / combat 505 km |
| Armament | 1 × fixed forward + 1 × flexible aft C/30 7.92 mm machine gun · 1,500 rounds · **45 s trigger time** |
| Ordnance | 2 × underwing rack (150 kg each): 2 × SC 50 *or* 2 × WBF C/27 depth charges |
| Equipment | Wireless, direction-finding loop and homing-beacon receiver, 75 kg installed · slats and slotted flaps |
| Crew systems | Sliding canopy · fixed seats · approach 136 km/h |
| Protection | None |
| Kits | None |
| Possible upgrades | de36rad · de40det |

### 2.2 Albatros — long-range search floatplane (1940)

The radar is the airplane and the airframe exists to carry it, together with a man whose only job is to work it. A convoy picked up in cloud or at night can be passed to a patrol line hundreds of kilometers away. Reporting is the whole contribution this air arm was built to make, and she is the first airplane in it that can do the job properly. Drop tanks on her outboard racks extend her considerably, but loaded that way she is too heavy for a catapult and must leave from water. She is slow and armed only with flexible machine guns, which is what happens when every kilogram goes into fuel and aerials. The requirement behind her has not been written, and every month it waits is another month of patrol lines searching with binoculars.

| Albatros — as launched | Specification |
|---|---|
| Cost / durability | 30 gold · 45 |
| Powerplant | 2 × C/40 aero engine · 2 × 1,100 hp takeoff |
| Dimensions | Span 19.6 m (folds 8.4) · length 15.2 m · wing 52 m² · hangar footprint 95 m² |
| Weights | 6,080 kg empty / 8,545 normal / 9,945 max |
| Crew | 4 — pilot, observer, wireless operator, radar operator |
| Speed | 301 km/h at 2,400 m · 281 at sea level |
| Climb / ceiling | 5.8 m/s · 4,400 m |
| Fuel / endurance / range | 2,600 L internal · ~10.5 h endurance · ferry 2,720 km / combat 905 km · with 2 × C/38 drop tank (500 L each, outboard racks; a water take-off, above the catapult's 9 t): ~14.7 h · ferry 3,795 km / combat 1,265 km |
| Armament | 1 × flexible dorsal C/38 13 mm + 1 × flexible aft C/30 7.92 mm machine gun · 2,000 rounds (1,000 each) · **67 s dorsal / 60 s aft trigger time** |
| Ordnance | 4 × underwing rack (400 kg each): 4 × SC 50 *or* 4 × WBF C/27 depth charges |
| Equipment | [de36rad] search radar · wireless, direction-finding loop and homing-beacon receiver, 75 kg installed · slats and slotted flaps |
| Crew systems | Enclosed cabin · fixed seats · approach 152 km/h |
| Protection | Self-sealing tanks |
| Kits | None |
| Possible upgrades | de43rad · de40det |

⚠ **The reconnaissance gap is real at the start date and is not closed until 1940.** On 1 January 1936 the navy owns one search aircraft type with a 600-kilometer reach and no radar, one raider in commission to fly it from, and no land-based naval air at all: **the only search that reaches the middle of the ocean flies off a raider, and there is one raider.** Each hull lost is a permanent reduction in the navy's ability to find anything, and the airplane that fixes it is four years away.

⚠ **Speed, climb, ceiling, approach and range are quoted at NORMAL weight** — take-off weight with full internal fuel, ammunition, oil and the crew the airplane normally carries, and no external store. Every one of those figures comes from one drag polar per airplane (equivalent flat-plate area f, span efficiency 0.82) at propeller efficiency 0.80 at maximum speed and 0.62 in the climb, and combat radius is ferry ÷ 3 (conventions §9.5).

---

*Companion file: `de-nothing-above-water-equipment-catalog.md` (§3–§6). The scenario file owns the order of battle; the road file owns the timeline, the treaties and the ledger.*
