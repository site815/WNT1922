# Release 0.8 — command, ports and simulation audit

## Resulting behavior

The command screen has one fleet/order column beside a large Equal Earth chart. Submenus expand in the left navigation. Ship manifests open on demand; hovering shows compact class specifications and clicking shows the individual ship. Port icons open facility, defense, trade and blockade information. Map zoom reaches 20×, and window resizing recalculates list pagination. The top bar identifies opposing governments and the estimated direction of each war. National order is GBR, USA, JPN, FRA, ITA, DEU, SOV; Soviet crimson is distinct from Japan’s coral.

The speed choices are 2,500×, 5,000×, 10,000×, 50,000× and 100,000×. These are ceilings. Every crossed minute is simulated; slower computers advance less game time. All simulation changes, including purchases and manual time steps, execute through serialized worker commands. Invalid commands restore the preceding state. Worker-produced display summaries, incremental DOM updates and cached map geometry reduce UI work. Controls retain focus, reports retain their scroll position, and expanded details stay open across snapshots.

Funded expansions replace their action button with progress and a projected completion date. Timed diplomatic actions show when they become available again. Decisions show their result directly. **Clear all optional** retains mandatory demands; dismissing an individual mandatory demand still requires confirmation of its default. Manually pausing does not open a treaty alert; optional auto-pause reacts to a newly raised unavoidable demand.

## Connected mechanics

| System | Input and resulting effect | Conservation or boundary |
|---|---|---|
| Merchant shipping | Available GRT / industry-dependent required GRT controls shipping coverage | Coverage caps at 100%; delivered replacement merchants restore actual capacity |
| Port trade | Controlled trade value × condition × unblocked fraction, relative to the opening network | Separate from shipping coverage; lost ports cannot be replaced by surplus merchants |
| Income | Domestic share + trade share × shipping coverage × convoy flow × port coverage | Gold, industry and influence share this factor; the domestic share survives disruption |
| Logistics | Base quality × (domestic share + trade share × shipping coverage × port coverage) | Feeds distance-, capacity- and mission-adjusted fleet supply |
| Shipyards | One national pool weighted by surviving major-dock capacity | Losing a small station does not shut down national construction |
| Scrapping | Ships at sea return physically; salvage is paid once after arrival | Crew and aircraft remain aboard in transit; sunk ships yield no salvage; docked ships retire immediately |
| Repair returns | Damaged ships detach with an escort unless the whole formation returns | Return journeys remain exposed to interception; an intact returning formation keeps its identity |
| Aggressive battle | Greater willingness to engage, outgoing damage ×1.4 and own exposure ×1.2 | Stronger attacks carry greater losses; normal caution remains the default |
| Combat reports | Engaged, sunk and damaged type compositions; condition; losses and rescues on both sides | Typed totals reconcile to involved hulls; cumulative merchant GRT totals persist in the naval record |

The port catalog distinguishes major dockyards, naval bases and minor waystations across 36 map ports. Cavite is the American Asiatic base; Guam is a small station. The 1922 and 1936 profiles differ where the opening facilities warrant it, including Singapore, Pearl Harbor and Soviet bases. Numeric port capacities, defenses and trade weights remain provisional. [Port definitions, equations and historical references](../docs/strategic-ports.md).

## Bugs resolved during validation

- Carrier inspection used a nonexistent aircraft lookup. It now resolves models from the selected campaign and country.
- A scrapping arrival referenced an out-of-scope nation variable. Arrival and one-time salvage now have a conservation regression test.
- Manual pause could open an unrelated mandatory alert while auto-pause was disabled. The worker now supplies an explicit pause reason.
- Replacing UI markup reset report scrolling and interactive controls. Incremental updates preserve their DOM state.
- Old formation paths remained visible after route changes. The chart renders only the current untraveled route.
- Port loss previously applied home-base condition to the entire national yard pool. Major dockyards now contribute independent weights.
- The data auditor parsed Windows paths as POSIX strings, allowing the wrong national model to replace another in its lookup. Platform-independent filenames fix the comparison.
- Country briefings were added to the runtime without a schema field. The scenario schema and generated briefing document now include the same text.

## Content and documentation

All 28 national platform/equipment Markdown catalogs are regenerated from the compiled campaign inputs. The Treaty System has seven country-specific briefings. Port documentation is generated from its runtime catalog and checked for staleness. Original program engineering values and compatible retirement plans remain canonical.

Stray emphasis, repeated warning glyphs, rewritten-heading annotations and contradictory draft/canon labels have been cleaned. Singapore’s treaty exemption and dock chronology are corrected. The old handover now links current engineering references and retains the numbered rules used by existing audits. Remaining manga proofs and their helper were deleted. Promotional fiction is excluded from game sources.

Seven unmodified music tracks are bundled with attribution, license and file hashes. All operational ranges shown in the interface use kilometers; internal routing retains nautical miles with explicit conversions. Save format 5 requires a new campaign; publication preserves a timestamped copy of the existing save.

## Validation and limits

[VALIDATION.md](VALIDATION.md) records the actual regression, browser, endurance, port-combat and data checks. A 100,000× setting does not guarantee that speed in a crowded war. The worker and measured speed indicator handle lower throughput; the system does not skip minutes to catch up.

Land warfare still uses strategic corridors. Port trade is an abstract capacity index, and most naval balance values are provisional. Port profiles represent the campaign’s opening infrastructure; historical dock expansions are not automatically commissioned later. Ordinary operational formations target 2–20 commands, with temporary repair and reinforcement detachments allowed above that range.

Useful next gameplay additions, proposed rather than enabled:

1. An admiral’s explanation of a chosen target or withdrawal, including scouting, supply and estimated enemy strength.
2. Refit packages for older hulls and a policy for replacing obsolete embarked aircraft.
3. A monthly spending forecast with reserve targets for gold, industry and personnel.
4. Port development projects and a convoy-priority screen for protecting critical trade routes.
