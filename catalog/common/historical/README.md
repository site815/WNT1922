# Historical campaign openings

The selectable historical starts are **6 February 1922**, **1 August 1939** and **1 November 1941**. **In Good Faith — 1 January 1936** remains an alternate-history campaign. The existing 1922 and 1936 IDs, roster revisions, default selection and saved-state interpretation are unchanged.

The two new starts are opening snapshots, not scripted campaign replays. Their named hulls, readiness, construction, political relations, occupied territory and supported naval stations differ. Subsequent movement, combat, construction, repair and player/AI decisions use the normal simulation. Historical tactical replays are a separate mode and are never imposed on these campaigns.

## Runtime files

| Data | Source |
| --- | --- |
| Dates, categories, opening pacts, geography/model aliases and scope | `../../historical1939/campaign.md`, `../../historical1941/campaign.md` |
| Seven navies' hulls, aggregates, budgets, reserves and construction | Each historical directory's `nations/COUNTRY.md` |
| Shared modern historical class fits | `ships.md`, combined with `../../1922/ships.md` and `../ships.md` |
| Naval aircraft | `aircraft/COUNTRY.md` |
| Occupations, fronts, war relations and station access | `starts.md` |
| Initialization and original neutral-yard repair permission | `../../../mechanics/historical-starts.mjs`, `../../../mechanics/engine.mjs` |
| Save/date/availability regressions | `../../../tests/historical-starts.test.mjs` |

Ship-catalog composition rejects duplicate IDs. The 1939 metadata applies explicit sensor overrides to shared class fits; for example Yorktown does not begin August 1939 with its later CXAM radar. These are static opening fits, not an automatic per-hull historical refit schedule.

National historical procurement weights are authored separately from the alternate programs; they are provisional gameplay preferences, not archival spending percentages. Initial personnel-training progress begins on the selected campaign date, including the first partial quarter.

Shared 1922, 1932 and 1942 support-ship designs remain available in each procurement catalog, with the normal service-year gate preventing early 1942 construction. Opening support hulls use the authored 1932 aggregate; adding procurement choices does not add ships to the opening fleet.

Opening world values are installed before bases, fleets and resources are initialized. `world.openingControl`, `openingPortControl` and `openingDay` preserve the snapshot across daily world updates; later live front outcomes can replace it. Old news and declarations are marked as history so that a 1941 start does not replay the 1939–1941 dispatch queue. Future historical date events retain the campaign's normal behavior with zero date variation for the new historical starts.

The new initializer runs only in `newGame`. Loading a save does not restore ships, reverse player diplomacy or reset fronts. A 1941 campaign permits existing war records beginning on 3 September 1939; the minimum date of the campaign itself remains 1 November 1941. The three British hulls undergoing American-yard work have an individually validated `openingRepairPort`, usable only while damaged and under repair at that original, intact, neutral yard. Completion, departure, war with the owner or a change of owner removes effective access. This grants no alliance, fleet supply or general basing rights.

## Scope and approximations

The openings contain **105 named major hulls in 1939 and 104 in 1941**, including construction, reserve and repair entries. Prior losses such as Hood, Bismarck, Royal Oak, Courageous, Glorious and Admiral Graf Spee are absent in November 1941. Ships lost after the start, including Ark Royal, Barham, Prince of Wales, Repulse, Arizona and Oklahoma, remain present. Hornet is absent before its September 1939 keel laying and is a newly commissioned reserve/working-up hull in November 1941. Duke of York and Yamato are still incomplete on 1 November.

This is a selected order of battle, not a complete daily ship census. Escort and submarine aggregates, auxiliaries, shore air forces, aircraft stocks, health fractions, completion fractions, crew pools, national budgets, starting resources and station assignments are authored gameplay estimates. Shared older classes retain their existing rounded specifications; the 44 added class fits are approximate period fits. AA, machinery, range, armor simplification and crew values are not exact dated returns. The engine uses these values consistently but does not model every refit or individual sister-ship difference. Aircraft introduction dates use service years, not exact squadron delivery dates.

The 21 named naval aircraft use existing **representative role recognition art**. New ship classes explicitly name their existing model using `modelId`/`modelCampaign`; most are representative related hulls or role silhouettes. For example the current Yamato and Richelieu entries do **not** have exact Yamato/Richelieu artwork. The linked art and class specification must not be described as a newly authored exact historical model.

Recognition drawings are independently identified by `recognitionModelId`/`recognitionCampaign` where the 3D-model alias has no drawing. County uses the accepted historical ONI Kent-group drawing, with sister-ship and date differences disclosed. No exact accepted drawing was found for the added King George V, Town, Yorktown, Soryu, Hiryu, Shokaku, Scharnhorst, Bismarck or Admiral Hipper fits. They explicitly use `representativeDrawing: true`: original Insuperable, Swift, Ranger or Unryu role drawings, historical Hood for Bismarck's fast-capital role, and historical County for Hipper's heavy-cruiser role. Every affected class has a specific `recognitionNote` explaining the mismatch; these are not new historical reconstructions. Courageous reuses its existing, explicitly qualified 1922 conversion model.

Both new starts use the existing 1936 geography with opening ownership overrides. Front fractions are coarse strategic corridors, not surveyed 1939/1941 border shapes. Northern France/Atlantic occupation uses a partial France front and German Brest, while the single playable French ministry abstracts Vichy, Free French and interned forces. France begins November 1941 outside the formal German/Italian naval wars. Manchurian and Chinese operations remain an abstract Japan–China land front; China is not an eighth playable navy. The existing map cannot divide Poland into exact German/Soviet zones or depict every occupied enclave. Saigon is under Japanese station control. The US and Japan, and the USSR and Japan, remain formally at peace on 1 November.

The 1941 French opening deliberately places its warships in reserve, repair or construction. Its initial aggregate operational combat power and fleet-supply average are therefore zero. Lost access to Brest and Saigon gives 48% route coverage and 24% initial logistics at 50% funding; this is a strategic game abstraction of the constrained ministry, not a claim that every historical French formation was inactive. Reserve reactivation and repair use the ordinary player controls and simulation.

Unsupported historical stations use disclosed nearby supported stations (for example Dakar for the French Caribbean/Casablanca cases). Construction and damage fractions produce ordinary game completion/repair dates; they do not force historical commissioning dates. Merchant figures retain the existing **1935–1936 Lloyd's Register baseline**, not a falsely precise 1939/1941 merchant census. Japan's reduced starting strategic stock reflects game pressure only: this change does not add a full historical oil-embargo trade model. The new starts are playable historical baselines with these stated limits, not an exhaustive archival reconstruction.

## Source basis

Sources establish the chronology and selected important availability checks below. They do not substantiate every estimated strength or statistic above. No lengthy passages or third-party asset files were copied.

| Evidence | Application |
| --- | --- |
| [US Holocaust Memorial Museum — World War II in Europe](https://encyclopedia.ushmm.org/content/en/article/world-war-ii-in-europe?parent=en%2F28), [German wartime expansion](https://encyclopedia.ushmm.org/content/en/article/german-wartime-expansion) | European war/occupation sequence, French armistice and 1941 invasions. |
| [US Department of State — Japan, China, the United States and the Road to Pearl Harbor](https://history.state.gov/milestones/1937-1945/pearl-harbor) | Pre-Pacific-war diplomacy, Tripartite/neutrality pacts and Indochina crisis. |
| [Royal Navy Naval Historical Branch — Admiralty War Diaries](https://www.royalnavy.mod.uk/locations-and-operations/bases-and-stations/naval-historic-branch) | Primary operational chronology; November 1941 diary identifies Malaya with Force H. Precise daily positions are otherwise outside the opening's scope. |
| [Contemporary report, 31 July 1939 — Renown reconstruction/trials](https://paperspast.natlib.govt.nz/newspapers/WC19390731.2.44) | Renown is not a fully ready active hull on 1 August. |
| [UK Parliament, 20 March 1957 — Battleships](https://hansard.parliament.uk/commons/1957-03-20/debates/4a351630-420c-489d-8edf-e71894c29ebf/Battleships) | Duke of York completion/commissioning chronology. |
| [NHHC — Hornet](https://www.history.navy.mil/content/history/nhhc/browse-by-topic/ships/aircraft-carriers/uss-hornet.html), [Washington](https://www.history.navy.mil/content/history/nhhc/browse-by-topic/ships/modern-ships/uss-washington.html), [North Carolina](https://www.history.navy.mil/our-collections/photography/us-navy-ships/battleships/north-carolina-bb-55.html) | US carrier/battleship availability and 1941 commissioning. |
| [NHHC — Pearl Harbor](https://www.history.navy.mil/browse-by-topic/wars-conflicts-and-operations/world-war-ii/1941/pearl-harbor.html), [Royal Navy — loss of Hood](https://www.royalnavy.mod.uk/news/2021/may/24/20210524-loss-hood) | Major losses before/after the opening date must not be applied on the wrong side of the start. |
| [NHHC archived CXAM radar history, preserved by HyperWar](https://www.ibiblio.org/hyperwar/OnlineLibrary/photos/weap-sen/radar/us/cxam.htm) | Yorktown's radar follows 1940 deliveries, not the August 1939 opening. |
| [NHHC — Enterprise DANFS history](https://www.history.navy.mil/research/histories/ship-histories/danfs/e/enterprise-cv-6-vii.html) | Late-1941 Wildcat, Dauntless and Devastator service; exact November 30 squadron counts are not backdated to November 1. |
| [Royal Navy — naval aviators in the Battle of Britain](https://www.royalnavy.mod.uk/news/2020/august/20/20200820-battle-of-britain-anniversary), [Shuttleworth — Sea Hurricane IB](https://www.shuttleworth.org/discover/collection/aircraft/hawker-sea-hurricane-ib) | Fulmar in 1940 and deck-capable Sea Hurricane IB in 1941. |
| [US Congressional Pearl Harbor exhibits — translated prewar reports](https://www.ibiblio.org/pha/pha/magic/x12-0025.html) | Contemporary Warspite reports place its repair work at Bremerton/Puget Sound. |
| [ONI-201 United Kingdom Naval Vessels, HyperWar transcription](https://www.ibiblio.org/hyperwar/USN/ref/ONI/ONI-201/index.html) | Primary recognition/class reference; later manual images are not claimed as exact opening-date fits. |

Run `node tools/check.mjs` and `node --test --test-isolation=none tests/historical-starts.test.mjs` after changing these openings. The regressions exercise every campaign/nation, a real 15-minute tick, JSON reload, exact declaration boundaries, existing occupations, aircraft assignments, neutral repairs and preservation of player-modified saves.
