# Ship Classification System — Design Document

**Project:** WNT1922 — Realtime Historical Naval Grand Strategy & Build Simulator (1922–1950)
**Version:** 0.2 (seed)
**Status:** Draft for review

---

## 1. Design goals

The classification system must serve three masters at once:

1. **The historical record.** Every ship afloat in February 1922 (and every ship buildable through 1950) must fit the taxonomy without distortion. The system must express what the Washington Naval Treaty actually regulated — because treaty limits are a core game mechanic, not flavor.
2. **The simulation.** Stats must be granular enough to drive a realtime combat and logistics model, but authored at the *class* level so five sisters don't need five hand-written stat blocks.
3. **The player's future knowledge.** The 1922 player knows carriers will eclipse battleships, that the 8"-gun "treaty cruiser" is a compromise, that radar and naval aviation are coming. The taxonomy must leave room for tech and doctrine to reshape what a hull *is* (battlecruiser → carrier conversions are Day One gameplay).

## 2. Core model: Class → Hull

The database has two record kinds:

- **ShipClass** — the design. All performance stats live here: displacement, speed, armament, protection, range. One record per class (e.g. `queen_elizabeth`), or per major sub-variant if sisters diverged meaningfully at build time.
- **Hull** — the individual ship. Carries identity (name, pennant), career dates (laid down / launched / completed), current **status**, assignment, treaty fate, and a modifier list (refits, damage, crew quality). A Hull references exactly one ShipClass via `class_id`. Refits are expressed as **stat deltas** on the hull, not new classes — HMS Warspite 1937 is still `queen_elizabeth` class plus a rebuild package.

### Aggregated hulls (flotilla craft)

Capital ships, carriers, and cruisers get individually named Hull records — they are the game's characters. Destroyers, submarines, and smaller craft exist in large numbers (the USN has ~270 flush-deckers in 1922); modeling each by name would bloat the data without gameplay payoff at grand-strategy scale. For these, a class record may carry a `hulls_aggregate` block (count + status) instead of, or alongside, named hulls. Named records can be promoted out of an aggregate later when a specific ship matters (e.g. a famous flotilla leader). Battle-scenario granularity still works: skirmish OOBs instantiate anonymous hulls from the aggregate at load time.

## 3. Type codes (what the ship *is*)

USN-style hull codes, used game-wide for compactness. This is the *simulation* type — what the ship does in combat.

| Code | Type | Notes |
|------|------|-------|
| BB | Battleship | Dreadnought or later; pre-dreadnoughts use BB with `generation: pre_dreadnought` |
| BC | Battlecruiser | Distinct handling: capital guns, cruiser armor doctrine |
| CV | Aircraft carrier, fleet | |
| CVL | Aircraft carrier, light | |
| CVE | Escort carrier | Appears mid-game era |
| CA | Heavy cruiser | Guns > 6.1" (post-1930 London definition, applied retroactively as a sim type) |
| CL | Light cruiser | Guns ≤ 6.1" |
| CLAA | Anti-aircraft cruiser | Late-game conversions/designs |
| DD | Destroyer | |
| DL | Destroyer leader / large destroyer | Contre-torpilleurs, Japanese "special type" leaders |
| DE | Destroyer escort / frigate | Mid-game era |
| SS | Submarine | |
| SM | Submarine, minelaying | |
| CM | Minelayer (surface) | |
| AM | Minesweeper | |
| PG | Gunboat / sloop | Colonial and escort duty |
| AV | Seaplane tender | |
| AO | Fleet oiler | Logistics sim |
| AK/AP | Cargo / transport | Logistics sim |

`type` may change over a hull's life via **conversion** (a special refit): `BC → CV` (Lexington, Akagi), `BB → CV` (Kaga), `CL → CLAA`, capital ship → target/training ship.

## 4. Treaty categories (what the ship *counts as*)

Orthogonal to type. The Washington Treaty doesn't care what you call a ship; it cares about displacement and gun caliber. Each class carries a `treaty_category` computed from its stats, and the treaty engine sums standard tonnage per nation per category against caps:

- **capital_ship** — > 10,000 tons standard *or* guns > 8". Cap: GBR/USA 525,000 t, JPN 315,000 t, FRA/ITA 175,000 t. Per-ship max 35,000 t / 16" guns. Building holiday to 1931 (with named exceptions).
- **aircraft_carrier** — > 10,000 t designed for aircraft ops. Cap: GBR/USA 135,000 t, JPN 81,000 t, FRA/ITA 60,000 t. Per-ship max 27,000 t; two conversions per nation allowed up to 33,000 t (the Lexington/Akagi clause).
- **auxiliary_combatant** — everything ≤ 10,000 t and ≤ 8" guns. **Unlimited in 1922.** (This is the loophole that spawns the treaty-cruiser race; the 1930 London Treaty closes it — a scripted mid-game rules change.)
- **exempt** — ships under 10,000 t not designed for fighting (tenders, oilers, transports), plus demilitarized/target hulls.

The treaty engine reads `standard_tons` (Washington definition: no fuel, no reserve feed water — the game stores both standard and full-load so treaty accounting and the fuel/seakeeping sim can disagree, exactly as they did historically).

## 5. Generation tags

A coarse tech-era tag on each class, used for quick UI filtering and AI valuation:

`pre_dreadnought` · `dreadnought` · `super_dreadnought` · `fast_battleship` · `treaty_cruiser` · `scout_cruiser` · `flush_deck` · `interwar` · `wartime` — extensible.

## 6. Stat model (ShipClass)

Grouped stat blocks; all units metric-or-naval as noted. Null/omitted = not applicable.

- **displacement**: `standard_tons`, `full_load_tons`
- **dimensions**: `length_m`, `beam_m`, `draft_m` (drives drydock & canal constraints — Panamax matters to the USN)
- **propulsion**: `speed_kn` (design max), `shp`, `range_km` @ `range_at_kn` (the 1922 seed files still carry `range_nm`; conventions §3 governs), `fuel` (`oil` | `coal` | `mixed` — coal-firing is a real logistics penalty in 1922)
- **armament**:
  - `main_battery`: `count`, `caliber_in`, `mounts` (e.g. `"4x2"`), optional `notes`
  - `secondary_battery[]`: same shape
  - `aa_battery[]`: same shape (grows via refit deltas)
  - `torpedo_tubes`: `count`, `caliber_in`, `submerged` (bool)
- **protection**: `belt_mm`, `deck_mm`, `turret_mm`, `barbette_mm`, `ct_mm`, `torpedo_defense` (0–3 qualitative)
- **aviation**: `aircraft_capacity`, `catapults`, `flight_deck` (bool)
- **complement**: crew count (drives manpower economy)
- **design_year**, **notes**

Derived combat values (broadside weight, effective range bands, AA density) are computed by the sim engine, not stored — keeps data honest and re-tunable.

## 7. Hull record

- `id`, `class_id`, `name`, `pennant`
- `laid_down`, `launched`, `completed` (ISO dates; incomplete ships have null `completed` and a `pct_complete`)
- `status` (status at the file's `as_of` date): `active` | `reserve` | `building` | `converting` | `trials` | `disarmed` | `target`
- `treaty_fate` (historical outcome, used by the historical AI and as the default script): `retained` | `scrap` | `scrap_on_replacement` | `convert_carrier` | `demilitarize` | `target`
- `assignment` (fleet/station), `notes`
- `refits[]` (empty at seed; populated by gameplay or historical scripts)

## 8. ID conventions

- All ids lowercase `snake_case`, ASCII.
- Class ids: class name, disambiguated by year when navies reuse names — `king_george_v_1911` vs (later) `king_george_v_1936`.
- Hull ids: navy-prefix + name: `hms_hood`, `uss_maryland`, `ijn_nagato`, `mn_bretagne`, `rm_giulio_cesare`.
- Nation codes: ISO-3166 alpha-3 (`GBR`, `USA`, `JPN`, `FRA`, `ITA`; later `DEU`, `SUN`, `NLD`…).

## 9. Seed-data coverage policy (v0.1)

- **Full named hulls:** all capital ships (incl. ships building or slated for scrap/conversion — those choices are gameplay) and all carriers/conversions.
- **Named-class, aggregated hulls:** cruisers, destroyers, submarines — one class record per significant class with `hulls_aggregate` counts as of early 1922.
- **Deliberately included:** canceled/paper designs central to the 1922 decision space (G3, South Dakota 1920, Tosa, Amagi, Caracciolo…) flagged `status: building` or with `treaty_fate: scrap` — these are the "what if the treaty fails / you cheat" content.
- Out of scope for v0.1: exempt auxiliaries, minor navies, post-1922 designs (added per era-pack).

## 10. Open questions

1. Should refit packages be first-class shared records (a "1930s rebuild" template applied to multiple hulls) rather than per-hull deltas? Leaning yes for v0.2.
2. Gun performance tables (shell weight, penetration curves) — separate `weapons.json` referenced by caliber+model, so a 15"/42 on Hood and on QE is one entry. Deferred to combat-model milestone.
3. Aircraft as first-class units (air groups assigned to CV hulls) — deferred to aviation milestone, but `aviation.aircraft_capacity` reserves the seam.
