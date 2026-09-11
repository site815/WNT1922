# Single-Player Scenario Catalog

**Project:** WNT1922
**Version:** 0.8 playable campaign design
**Status:** Two playable campaigns: **The Treaty System** and **In Good Faith**, each with seven playable nations. Set-piece battles below remain proposals.

---

## 1. The three SP modes

Nation/side is player-selectable in every mode.

1. **The Treaty System** — the historical 6 February 1922 start. Campaign reviews in 1940, 1945 and 1950, with continued sandbox play.
2. **Hindsight Scenarios** — alternate-history sandbox worlds, specified in full in `docs/hindsight-scenarios.md`. Each takes a *thesis* about how a navy could have answered 1922 and expresses it entirely through core systems: **shared core rules and no forced end date**. What replaces objectives is opening decisions and standing pressures. **The mode holds exactly one scenario — *In Good Faith*, opening 1 January 1936** — with seven active national programs. See §2.
3. **Set-Piece Battles (deferred)** — proposed short tactical scenarios, historical and hypothetical, played on the battle engine with fixed OOBs. Double as the combat-model test harness.

Design intent: mode 2 is where the game's fantasy ("I know what's coming") is expressed as a *world*, not as a rules exception — the anachronism is the player's knowledge, and nothing else in the simulation changes. Mode 3 is where players go for a 30–90 minute session and where we tune combat.

## 2. Mode 2 — Hindsight Scenarios

**Owned in full by `docs/hindsight-scenarios.md` (1.14)** — the frame, the treaty structure, the playable set and every scenario design. Nothing in this file may add to it. What follows is the contents page and the decisions.

**The mode holds one scenario.**

### *In Good Faith* — 1 January 1936, scored in 1950 and continuing afterward

Four navies that each signed at Washington in 1922 and each defected the same day, in different directions, none of them knowing about the others. The last conference breaks on **23 December 1935**; **play opens 1 January 1936** with exactly twelve months of treaty left, both expiring 31 December 1936.

**Current playable configuration:** all seven national programs are active. The original four are joined by France’s *La Revanche de l’École*, Italy’s *Mare Nostrum* and the Soviet *Krasny Okean*. Single-program or zero-divergence 1936 variants remain future concepts.

**There are no reactive programs anywhere in this scenario.** Every reaction to every divergence begins **on the first day of play, as an opening decision.**

| | Strategy | The bet |
|---|---|---|
| **JPN** | ***As Long As It's Black*** | One design per role, thirteen years, no brake |
| **USA** | ***Five-Term Tillman*** | A bigger generation every two years, forever |
| **GBR** | ***Fisher's Ghost*** | Speed is armor, and it is the only argument left |
| **GER** | ***Nothing Above Water*** | Convoys beat us last time; build for the trade and nothing else |

**Why they compose:** each deception holds until 1934–35 and the four are independent, so through 1922–34 no navy's estimates respond to another's program — every divergent fleet is a function of its own budget alone, and a leak in one lie says nothing about the other three. The fleets add. **The strategic assessments do not** — see `hindsight-scenarios.md` §1.3.

### Decisions

- **The mode is named "Hindsight Scenarios"** (over Timewarp / Cassandra / Foreknowledge Campaigns / Second Chance / The Long Game). UI tagline: *"Hindsight is 20/20."*
- **The scenario is named *In Good Faith*** — the treaty language all four signed under and none kept.
- **Germany's strategy is named *Nothing Above Water***, ruled over *The Prisoner's Report*.
- **A single-nation variant** — one divergence against a near-historical world — is a possible future scenario in this mode and is **not one today**.
- **France, Italy and the USSR now have their own approved alternate programs.** Their four-part canon sets live in `docs/hindsight/`; the complete two-campaign catalogs are indexed in [playable/README.md](playable/README.md).

## 3. Mode 3 — Set-Piece Battles

### 3.1 Design goals

Each battle is a 30–90 minute session with fixed OOBs, an authored situation, and asymmetric objectives; both sides playable; every entry lists what it *tests* in the combat model, because this catalog is also our tuning harness. Entries ship in packs matching the data packs (many require post-1922 ships).

### 3.2 Launch set — detailed

#### 3A. Battle of the River Plate — *13 December 1939*

**Forces.** Admiral Graf Spee vs HMS Exeter, Ajax, HMNZS Achilles.
**Situation.** A pocket battleship with a raiding cruise behind her meets three cruisers she outguns but cannot ignore. Ammunition and damage are strategic: Graf Spee wins by remaining a viable raider, not by sinking cruisers.
**Objectives.** GBR: cripple or corner her. DEU: mission-kill nothing vital, break contact seaworthy with ammunition in the wells.
**Tests.** Cruiser gunnery, fire distribution across multiple targets, damage aggregation, mission-kill logic, breakoff AI.
**Variants.** *Montevideo Rematch* — no scuttle: Graf Spee sorties against Cumberland and the patched-up hunting group.

#### 3B. Battle of the Denmark Strait — *24 May 1941*

**Forces.** Bismarck, Prinz Eugen vs HMS Hood, Prince of Wales.
**Situation.** The Royal Navy's beloved veteran and its newest, teething battleship intercept at dawn in Arctic waters. Eleven minutes of history's most famous gunnery.
**Objectives.** DEU: break into the Atlantic un-crippled (fuel hit = strategic loss, exactly as historically). GBR: stop the breakout; losing Hood but crippling Bismarck is still a strategic win — the scoring says so.
**Tests.** Capital-ship gunnery, plunging fire and magazine-risk modeling, green crew and mechanical-teething modifiers (PoW's quad turrets), pursuit/breakoff decisions, fuel as a victory currency.
**Variants.** *The 1942 Refit* — the deck-armor rebuild Hood never got; *Exercise Rhine* — the full operation from Norway to Brest on the operational layer.

#### 3E. Yamato vs Iowa — *hypothetical, 1944*

**Forces.** Yamato vs Iowa; escort variants add destroyer screens.
**Situation.** The argument every naval enthusiast has had since 1945, playable. Day, night, and weather variants change the answer — that's the point.
**Objectives.** Sink or mission-kill the opponent; night variant adds radar-advantage objectives (Iowa must exploit it before dawn; Yamato must close the range or disengage).
**Tests.** Immunity-zone modeling, fire control vs weight of broadside, radar night advantage, speed kiting, torpedo-screen interaction in the escort variant.
**Variants.** *Yamato vs Missouri* (if the player's Grand Campaign built her — cross-mode export); 2v2 with Musashi and New Jersey.

### 3.3 Historical set-piece catalog (proposed, one-liners)

**Buildable with the 1922 seed data — candidates for first implementation:**

- **The Treaty Never Was — 1927, hypothetical.** Washington collapses in 1922: G3 and Nelson lead the Grand Fleet against Amagi, Kaga and the 8-8 line, with the South Dakotas and Lexingtons steaming as a third fleet. Uses the canceled designs already in `data/ships/` — recommended first set-piece build. *Tests: multi-division fleet actions, paper-design balance.*
- **Incident in the East China Sea — 1922.** Hood and Repulse vs four Kongōs at dusk. *Tests: fast-capital asymmetry, screening.*

**Surface-gunnery pack (1940s data):**

- **Calabria, 1940** — Warspite's 24 km hit; big fleets, brief contact. *Tests: extreme-range gunnery dispersion.*
- **Cape Matapan, 1941** — radar-less Italians ambushed at night at point-blank. *Tests: night surprise, searchlight mechanics.*
- **First & Second Narvik, 1940** — destroyer knife-fights in a fjord, then Warspite arrives. *Tests: confined-water combat, terrain.*
- **Java Sea, 1942** — a doomed multinational squadron vs the IJN cruiser force. *Tests: mixed-navy command friction, long-lance torpedoes.*
- **Savo Island, 1942** — the USN's worst night; Mikawa's clean sweep. *Tests: night combat without doctrine, crossing sleeping screens.*
- **Cape Esperance & Empress Augusta Bay, 1942–43** — radar picket duels in the Slot. *Tests: radar fire control maturation.*
- **Second Guadalcanal, Nov 1942** — Washington and South Dakota vs Kirishima; the only fast-BB night gun duel that ever happened. *Tests: BB night action, electrical-failure chaos events.*
- **Komandorski Islands, 1943** — a pure daylight cruiser duel, hours long, no air, no subs. *Tests: the gunnery model in laboratory conditions.*
- **Barents Sea, 1942** — timid German heavies vs an aggressive destroyer screen defending a convoy. *Tests: escort screening AI, rules-of-engagement modifiers.*
- **North Cape, 1943** — Scharnhorst alone in Arctic darkness vs Duke of York's radar. *Tests: radar-directed capital gunnery, weather.*
- **Surigao Strait, 1944** — the last battle line crosses the last T; Pearl Harbor's salvaged ships get their revenge. *Tests: massed battle-line fire, torpedo-run gauntlets.*
- **Samar, 1944** — Taffy 3: escort carriers and destroyers vs Kurita's battleships. The great David-and-Goliath scenario. *Tests: smoke, desperation torpedo attacks, morale/breakoff, CVE aviation (partial air model).*

**Operations & convoy pack:**

- **Mers-el-Kébir, 1940** — the grimmest what-if: play the French squadron with warning, or the British with a conscience timer. *Tests: shore/harbor combat, political objectives.*
- **Channel Dash, 1942** — Scharnhorst, Gneisenau and Prinz Eugen sprint home through the Channel. *Tests: operational interception, staged piecemeal attacks.*
- **Operation Pedestal, 1942** — fight a tanker to Malta through everything the Axis has. *Tests: convoy defense layers, attrition scoring on cargo, not warships.*
- **The Bismarck Pursuit, 1941** — the full week as an operational scenario: Denmark Strait, the shadowing, the Swordfish strike, the final action. *Tests: operational layer + tactical battle hand-off.*

**Air-sea pack (blocked on the air-group model):**

- **Taranto, 1940** — 21 Swordfish vs a fleet in harbor; the raid Yamamoto studied. *Tests: harbor strikes, torpedo nets.*
- **Pearl Harbor, 1941** — playable as the defender with variable warning time. *Tests: surprise mechanics, in-port damage model.*
- **Coral Sea / Midway / Philippine Sea, 1942–44** — the carrier-duel trilogy: first contact, the miracle, the massacre. *Tests: the entire carrier combat loop, scouting fog, deck-cycle timing.*
- **Ceylon Raid, 1942** — Nagumo vs the Eastern Fleet; Somerville's night-strike gamble, playable. *Tests: carrier evasion, night carrier ops.*
- **Ten-Go, 1945** — Yamato's death ride, playable as the IJN trying to reach Okinawa or the USN managing the air queue. *Tests: massed air attack vs AA density, damage saturation.*

**Hypothetical dream-match pack:**

- **Hood ’42 vs Bismarck** — the rematch with the rebuild she was always promised.
- **Plan Z, 1944** — the H-39s and Graf Zeppelin sortie Germany never built vs the Home Fleet. *(The road not taken in* Nothing Above Water *— the surface fleet that scenario's Germany explicitly refuses to build.)*
- **Kantai Kessen, 1935** — the decisive battle both navies spent 20 years training for, fought exactly as doctrine imagined — so the player can discover why it never happened.
- **Sea Lion Escort, 1940** — the Kriegsmarine tries to hold the Channel for the barges against everything the RN throws in.
- **Campaign Export** — any battle from a player's Grand Campaign saved out as a set-piece and shared (the schema already supports it: a scenario is a snapshot).

### 3.4 Selection principles for future additions

A set-piece earns a slot if it (a) tests a combat-model system no existing entry covers, (b) is playable from both sides with real decisions, and (c) fits in ≤90 minutes. Fame is a tiebreaker, not a criterion — Komandorski beats better-known battles because it isolates the gunnery model.

## 4. Implementation notes (schema deltas for v0.2)

1. The `divergences` block on the scenario file identifies a Hindsight world (implemented in `scenario.schema.json`). **There is no `modifiers[]` rule-twist opcode block**, because `hindsight-scenarios.md` §1.1 forbids special rules. A Hindsight scenario is a world snapshot and nothing else; everything the old opcodes named (learning curves, hull caps, political capital, estimates, obsolescence, prototype risk, monoculture risk) is a **core system present in every mode**, carried in `national_state`. See `hindsight-scenarios.md` §5.
2. `environment` block for sp_battle: time-of-day, weather, sea state, visibility, moon — half the catalog above is *about* these.
3. Era data packs: the SUN nation and 1930s/1940s historical ship classes gate most of §3.3. DEU is delivered — `data/ships/de.json` and `data/ships/hindsight/de_nothing_above_water_pack.json` — and `pack.schema.json` is the manifest format.
4. Air-group model gates the air-sea pack (already an open question in `ship-classification-system.md` §10).
5. Campaign→set-piece export: serialize any battle's OOB + environment into a scenario file (mostly free, given the shared schema).
