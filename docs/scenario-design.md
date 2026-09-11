# Scenario System — Design Document

> Release 0.8 scope: two playable starts (6 February 1922 and 1 January 1936), seven playable nations, scored in 1950 with no forced end. In Good Faith uses seven approved programs. Its European war varies ±60 days; 1922 retains tension-driven ±365 days. The four original divergence studies below remain their original-program design references. Unimplemented modes, toggles and physical models are future concepts. Current inventories and generated specifications are indexed in [playable/README.md](playable/README.md); runtime mechanics are in [the game guide](../game/README.md).

**Project:** WNT1922 — Realtime Historical Naval Grand Strategy & Build Simulator (1922–1950)
**Version:** 0.8 campaign design
**Status:** Current campaign scope with explicitly deferred mode concepts

---

## 1. Scenario modes

The playable build contains the two single-player campaigns described below. The four-mode table records the broader design; battle and multiplayer modes remain proposals.

| Mode | Players | Clock | Scope |
|------|---------|-------|-------|
| `sp_campaign` | 1 vs AI | Strategic realtime, 1922→1950, pausable, variable compression | Full grand strategy: treaties, budgets, shipbuilding, doctrine, war |
| `sp_battle` | 1 vs AI | Tactical realtime, hours–days | Self-contained engagement with fixed OOBs |
| `mp_skirmish` | 2+ PvP | Tactical realtime, single session | Fleet-on-fleet under a points budget; feeds a ranking ladder |
| `mp_persistent` | Many, per-server | Strategic realtime, slow-tick, always-on | The 1922–1950 world replayed; each server may use a different start date |

### 1.1 The Treaty System and In Good Faith

**The Treaty System** starts on **6 February 1922**. **In Good Faith** starts on **1 January 1936** with seven alternate national programs. Both let the player choose the United Kingdom, United States, Japan, France, Italy, Germany or the Soviet Union.

- **Comply, exploit, or cheat.** The treaty is a live rules engine (see §3): comply and out-design rivals within the caps; exploit loopholes (the unlimited sub-10,000-ton category, conversion clauses, "standard tons" accounting tricks); or covertly cheat (misdeclared tonnage à la Deutschland/Mogami) and risk detection, diplomatic crisis, or a collapsed treaty and an early arms race.
- **Immediate 1922 decisions** are the tutorial-by-doing: which retained hulls to keep in commission vs reserve; which treaty-doomed hulls to convert (Lexington/Akagi/Kaga clause) — the data ships with every such hull present and flagged; whether to spend scarce budget on aviation, oil conversion, or gunnery modernization.
- **Timeline pressure.** Runtime events cover treaty dispositions and conversions, conference choices, treaty expiry, crises and historically anchored European war. Additional entries in the seed event catalog are design references, not a generic executed event system; a complete earthquake damage model and Manchurian crisis chain remain deferred. Naval supply can change land-campaign progress and occupation.
- **Reviews:** naval growth, economy, preparation and war results are recorded on 31 December 1940, 1945 and 1950. Play continues after the 1950 score.

### 1.2 SP Battle scenarios

Short, authored engagements with fixed OOBs drawn from the same ship database — historical (River Plate, Denmark Strait as later era-packs), plausible-hypothetical for the 1920s (a 1920s Anglo-Japanese cruiser action, a Mediterranean Franco-Italian convoy fight), and *exported moments* from a player's own campaign (any campaign battle can be saved out as a standalone scenario file). Doubles as the combat-model test harness.

### 1.3 MP Skirmish (ranked)

Symmetric-budget fleet duels. Each player buys an OOB from the ship database under a **points budget priced off treaty-style tonnage** (standard tons × type multipliers), with an era gate (e.g. "1922 tech only", "1936"). Server validates the OOB against the same schema used everywhere else. Ladder: seasonal Elo-style rating; era gates define divisions so a 1922 division stays historically flavorful. Design intent: the pricing formula and era gates live in the scenario file, not in code, so balance patches are data patches.

### 1.4 MP Persistent world

One server = one running 1922–1950 world at slow strategic tick (real-time hours per game month, configurable per server), with tactical battles resolved in realtime sessions when fleets meet. Nations are player-held (one ministry per player, possibly with cabinet co-op roles later) with AI caretakers for absent players. **Different servers, different start dates:** a server can boot from any authored start snapshot (1922 seed now; 1930 / 1936 / 1941 snapshots later) — the scenario format is exactly a *world snapshot*, which is why campaign starts, saves, and server seeds are all the same schema. When a world reaches 1950 (or a terminal victory), the server archives the history and reboots — worlds are meant to be replayed.

## 2. Scenario file anatomy

A scenario is a **world snapshot + rules + goals**:

- `meta` — id, title, mode, description, version
- `clock` — start date, end date (null = open), tick model
- `world` — treaty state (which treaties in force, per-nation tonnage ledgers), diplomatic stances, economy settings per nation
- `nations[]` — playable flag, AI profile, starting budget, objectives
- `order_of_battle` — per nation: hull id lists (named ships) and aggregate draws (e.g. `{"class_id": "clemson", "count": 40}`), plus fleet/station assignments
- `events[]` — scripted timeline entries with dates, preconditions, and effects (campaign/persistent modes)
- `victory` — checkpoint scoring (campaign), objective list (battle), points/rating hooks (skirmish)

OOBs *reference* the ship database; they never duplicate stats. One database, many scenarios.

## 3. Treaty engine (shared by campaign & persistent modes)

The playable treaty engine tracks national tonnage, disclosure, concealment, inspections, withdrawals and expiry. Demands have deadlines and explicit defaults. Inspection requests lapse when treaty limits expire or their participants go to war. Full replacement-age accounting and negotiated London category amendments remain broader design concepts; there is no overseas-base funding mechanic.

## 4. Seed content (this delivery)

`data/scenarios/campaign_1922.json` supplies The Treaty System; `data/scenarios/in_good_faith_1936.json` supplies In Good Faith. Both have seven playable nations. The build combines these snapshots with historical hulls and `data/playable/` supplements. Aggregate construction status and named opening hulls are checked against compiled rosters. Platform/equipment summaries are generated from these same records.

Deferred: multiplayer, set-piece battle packs, additional start years and a unified executor for all authored historical-event effects.

## 5. Open questions

1. Persistent-world battle resolution when players are offline — auto-resolve vs scheduled battle windows. Needs a multiplayer design pass.
2. Event divergence thresholds — how far can the world drift before "London 1930" refuses to fire? Proposal: each event lists explicit preconditions on world-state variables rather than a fuzzy divergence score.
3. Fog of war / intelligence model granularity for the cheating-detection loop.
