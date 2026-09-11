# v0.9 — compact command interface and Pacific campaigns

The time/control bar is 36 pixels high on desktop; resources use equal grid columns with a double-width war assessment. Checkbox alignment, label margins and aircraft selector widths are explicit. The four facility cards remain equal in size. Fleet lists show four commands at 1366×768 and eight at 1080-pixel height, with composition on hover and map centering on click. The ship register uses its compact table styling, more rows per page, and the design catalog no longer duplicates the sidebar's designer entry.

The tested shipyard, diplomacy, register and command screens fit at 1366×768, 1920×1080 and 2560×1080. Long reports, aircraft catalogs, historical notes and lists with more entries retain scrolling where needed. Map zoom now reaches 64×. Front dashes animate while running; island assault rings pulse. Both stop when paused and honor reduced-motion preferences.

## Report and audio fixes

Reports are retained in an 80-entry recent history. Previously, opening a report looked it up in that live list on every render; heavy fighting could remove the selected entry and close its dialog. An open report now owns an immutable copy until closed, and its body keeps the same DOM nodes. Expanded calculations and scroll position therefore survive new worker snapshots and history eviction. Open optional battle alerts similarly retain the report being read. Mandatory choices remain live, with their deadlines and defaults.

Sound notification selection now examines all new reports involving the player, instead of only the newest alert. A newer industrial completion cannot conceal a battle sound. Battle SFX use a short synthesized cannon and low-frequency rumble, with their own rate limit so ordinary alert chimes cannot suppress them. This audio is generated locally and needs no third-party asset license. Existing SFX mute and volume controls still apply; bursts of battles are combined to avoid overlapping sounds.

## Yard and design clarity

The yard graph scales available capacity and requested workload together. Yellow is committed capacity, green is spare capacity, and red is work beyond capacity. A white capacity marker separates actual throughput from overload. When yards have no available capacity, outstanding work is still visible in red. Overload lengthens completion; no work is invented or discarded.

Resource costs now say **gold**, **influence** and **industry**. Industry stock is not ship tonnage. Physical displacement and yard throughput remain tons; merchant capacity remains GRT. The shipping tooltip gives exact available and required capacity.

**Apply suggested fit**, previously “Generate automatic fit,” replaces the draft's name and values using the selected role, the latest eligible national catalog class, current campaign year and strategic priority. Previewing costs nothing. Engineering limits apply to suggested and manual fits alike; gold is charged only when registering the draft, and hull procurement remains a separate order.

## Pacific land campaigns

Pacific fronts now activate from the actual bilateral war, including an early war in The Treaty System. They no longer wait for December 1941, and a late declaration does not retroactively accumulate years of invasion progress. British possessions require war with the United Kingdom; the abstract East Indies coalition campaign requires both Japanese–British and Japanese–American wars.

Nine island objectives are authored: Guam, Wake, Midway, Saipan/Tinian, Truk, Palau, Kwajalein, Majuro and Tarawa. Eight additional waystations bring the map to **44 ports**. Guam's existing station is reused. These are explicit map nodes because the underlying political polygons omit many small islands.

| Objective | Opening owner | Base assault duration | Resistance index |
|---|---|---:|---:|
| Guam | USA | 8 days | 35 |
| Wake | USA | 14 days | 45 |
| Midway | USA | 55 days | 160 |
| Saipan/Tinian | JPN | 60 days | 150 |
| Truk | JPN | 90 days | 230 |
| Palau | JPN | 40 days | 110 |
| Kwajalein | JPN | 30 days | 85 |
| Majuro | JPN | 10 days | 25 |
| Tarawa | GBR | 14 days | 45 |

These durations and resistance values are **provisional gameplay weights**, not historical garrison counts or promises of capture time. The Philippines and Singapore retain longer campaign models. Openings use modest interwar facilities; the game does not automatically add later historical fortification projects.

Landing forces and transports are abstracted into land campaigns. At least two nearby surface hulls must provide cover within about 407 km, and effective invasion supply must reach 40%. Coverage falls with distance. Merchant coverage multiplies campaign supply, so zero merchant capacity prevents an invasion. Submarines, docked fleets, returning forces and repair detachments cannot provide landing cover. Enemy fleets and the resistance index can halt an assault. Weak unsupported footholds contract. Strong naval cover cannot shorten an island assault below its base duration.

Reconnaissance patrol and fleet-interception admirals consider active island objectives; port missions continue to use reachable targets and naval risk assessment. Covering forces hold near the objective until refueling, repair or other operational needs require withdrawal. Sea routes connect the new waystations, so forces travel and replenish through the normal simulation.

Occupation persists during a counterattack and changes only when a campaign completes. Capture transfers supply and trade access, damages facilities by 15 percentage points and starts the normal repair delay. Ceasefires freeze Pacific progress. Small islands have less weight in the war assessment than large continental campaigns. Combat at a port still cannot itself capture territory; the separate supported land campaign must finish.

Historical context: Guam was captured quickly in December 1941, while Wake repelled an initial landing before its later capture. Japanese mandated islands included the Marshalls and Carolines, with major military development later in the 1930s. These sources establish ownership and broad roles; the game's numeric capacities and resistance are estimates. [US Navy: Guam and Wake attacks](https://www.history.navy.mil/browse-by-topic/wars-conflicts-and-operations/world-war-ii/1941/philippines.html), [US Navy: Wake Island](https://www.history.navy.mil/about-us/leadership/director/directors-corner/h-grams/h-gram-002/h-002-2a.html), [US Navy: Kwajalein and Majuro](https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/a/the-assault-on-kwajalein-and-majuro-part-one.html), [US Navy: Central Pacific mandates](https://www.history.navy.mil/about-us/leadership/director/directors-corner/h-grams/h-gram-025/h-025-1.html).

## Data and release

Canonical island definitions and routing are in `world.mjs`, campaign rules in `land-war.mjs`, and facility values in `port-catalog.mjs`. The generated [port reference](../docs/strategic-ports.md) lists both opening periods. All 28 national platform/equipment Markdown catalogs are regenerated for this release. No fictional material was used.

Save format 6 requires a new campaign. Publication preserves the previous campaign file and a timestamped backup. [Validation evidence](VALIDATION.md) records the tests performed for this version.

Potential next gameplay additions, subject to player decisions: funded island fortification projects, amphibious transport allocation, and a dedicated campaign objective selector. They are not part of v0.9.
