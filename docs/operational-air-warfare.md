# Operational air warfare — 0.19.0

Admirals control sorties. The player chooses fleet missions, aircraft production and funding; there is no required sortie scheduling.

## Search and conditions

Local solar elevation determines daylight, twilight and night. Regional weather changes in six-hour blocks: fair, cloud, rain/rough seas or severe weather. These are reproducible game weather states, not historical weather forecasts. Daylight permits launches; cloud and rough weather reduce the usable wing. Severe weather and darkness hold strikes. Night carrier operations, radar-directed night fighters and individual cloud layers are outside this first abstraction, including for late-war aircraft.

Admirals direct broad search sectors toward a recent hostile report or the fleet objective, otherwise rotating the search. A sector covers 140 degrees at full efficiency, with much weaker search to its sides and rear. Ships still have visual/radar search at short range. Shore patrol aircraft use their own model range and paid aviation supplies. Fleet and shore reconnaissance can photograph anchorages. Reports store the observation time and composition; the UI does not reveal a live enemy harbor inventory.

## Strike cycle

1. A recent contact and an operational aircraft source are required. A fleet can prepare one strike at a time. Anchorage strikes need an aerial report less than 48 hours old.
2. Assembly takes `35 + 0.3 × strike aircraft + 0.4 × (100 − training)` minutes. A normal strike uses up to 75% of available, fully crewed strike aircraft; aggressive admirals can commit 90%. Up to 35% of available fighters escort it, leaving fighters for defense.
3. Launch is checked again after assembly: weather, daylight, contact age, aircraft, supplies, compatibility and round-trip range. Preparation can be abandoned when conditions change. Model range and the slowest participating aircraft determine flight time; an escort lacking range stays behind.
4. The wing is physically removed from its hangars while airborne. Target movement can cause a missed search. At the target, CAP, escorts and ship AA affect losses and the fraction of the strike that gets through. Guns on distant ships cannot hit the attacking carrier. A surprised anchorage receives a modest damage modifier.
5. Survivors fly back. A destroyed or badly damaged home carrier can force them to a reachable friendly base or another compatible ship with space. Without a reachable landing site they ditch; aircraft and aircrew losses/rescues are recorded. Recovery is followed by 90 minutes of rearming.

CAP assigns up to 60% of fighters currently at the source to defense, subject to daylight, weather and base supplies. These are overlapping defensive patrols, abstracted rather than separate flights. The uncommitted portion covers rotation and servicing. CAP and escort aircraft are never counted as the same airborne wing. Shore sources have a six-hour interval between strike launches and consume combined fuel/ammunition stocks.

Naval aircrew survivors enter the existing recovery queue. Other-service personnel have a separate casualty ledger; rescued crews are evacuated to their own service rather than credited to the naval ministry. Combat reports include both sides' aircraft and personnel losses, with other-service losses identified. Airframe assignments are conserved through production, launch, ferry, merchant loss, return and destruction.

## Catalog and other-service aviation

Naval procurement has fighter, carrier strike and observation-floatplane fits every three years, from 1921 through 1948. Germany begins with the 1936 generation. These are representative procurement generations, with provisional performance and prices; a generation label is not a claim that a specific historical aircraft entered service on that date. Japan's 1936 Hibari / Raiden / Tenzan / Shinden specifications remain authored exceptions. The Japanese 1922 catalog follows three-year generations.

Carrier decks require deck-qualified aircraft. Battleship/cruiser catapults require floatplane compatibility. The Japanese authored float kits are honored. Non-deck-qualified landplanes and flying boats cannot use carriers as ferry stops. Future aircraft cannot be ordered before their development year.

The read-only other-service catalog has representative maritime patrol and anti-shipping generations on the same three-year schedule. Early types are coastal flying boats and torpedo biplanes, followed by longer-range patrol and twin-engine strike types. Labels cover national army, air-force or shore-naval ownership without falsely calling every land-based aircraft an army aircraft.

Other-service establishments use up to 25% of a port's aircraft slots, approximately 40% patrol / 60% strike. Naval aircraft use the other 75%; opening naval units fill 60% of the original total. Government aircraft and their crews have separate inventories and no player procurement controls. Monthly government replacement production arrives at the home warehouse; obsolete stored government aircraft retire. Actual reinforcements use the existing ferry/merchant transport system, including interception, destination capture, safe-route checks and full crews. There is no instant replenishment on an isolated island. All base operations consume the shared aviation-supply stock.

## Performance and tuning

Flights are scheduled state transitions evaluated on the existing one-minute worker clock. There is no per-aircraft flight-path simulation. Search and weather use broad sectors and cached regional conditions. Fleet movement remains continuous. The UI runs separately and interpolates the map at the display refresh rate, up to 60 fps. The requested 100,000× setting is a ceiling: the simulation slows safely when a computer cannot process that rate; it does not skip game minutes.

Main tuning owners: `game/src/air-operations.mjs`, `air-conditions.mjs`, `government-aviation.mjs`, `shore-recon.mjs`, and the air resolution in `engine.mjs`. Catalog authoring is `tools/revise-aircraft-catalogs.mjs`; canonical playable values are in `data/playable/*.json` and exported national Markdown catalogs.

## Historical basis and deliberate limits

The [USS Hornet Midway action report](https://www.history.navy.mil/research/archives/digital-exhibits-highlights/action-reports/wwii-battle-of-midway/uss-hornet-action-report.html) describes the operational separation of search, launch, interception and recovery. The [naval aerology account of Midway](https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/b/battl-of-midway-aerology-and-naval-warfare.html) informs the significance of visibility and weather. Exact timings and coefficients above are playtest estimates, not historical measurements.

The [Naval Aviation Museum's PBY account](https://www.history.navy.mil/content/history/museums/nnam/education/articles/aircraft-in-the-spotlight/catalina-in-detail.html) and the [RAF Museum's Beaufort entry](https://www.rafmuseum.org.uk/research/collections/bristol-beaufort-viii/) illustrate the distinction between long-range patrol and maritime strike. They inform role families; the generic generation statistics are not presented as exact Catalina or Beaufort specifications.

Strategic bombing remains a recommendation for a later, separate, government-run weekly land-campaign system. It should create temporary industrial disruption and repair demand, with limits, escort/defense strength and weather, and should not double-count losses already caused by shipping disruption. It is not part of this release.
