# Strategic ports

The playable map contains 44 selected ports. Each represents a naval facility and its surrounding commercial access. These are a strategic network, not a complete census of every harbor. The three tiers are **major dock & naval base**, **naval base**, and **minor waystation**. Naval-base and waystation classifications do not mean an absence of small repair facilities: major docks alone supply the weights used to distribute national shipyard throughput.

**Capacity, defensive power and trade values are provisional game weights.** Supply capacity measures supported warship displacement, not historical dock lifting capacity. Artillery is abstract combat power. Aircraft slots are physical capacity; actual stationed models, counts, crews and stores determine aviation power. See docs/base-aviation.md for the operational rules. Trade value is an index, not money or recorded cargo tonnage. Numeric adjustments belong in game/src/port-catalog.mjs; regenerate this document with node tools/export-port-docs.mjs. Opening profiles remain those of the selected campaign; later historical construction is not automatically added.

## Opening facilities

Capacity is in thousands of supported warship tons. A pair reads **1922 / 1936**. The national affiliation is the opening ministry responsible for supply; British imperial and Dominion facilities are grouped under the United Kingdom. Occupation may change their controller during play.

| Nation | Port | 1922 tier | 1936 tier | Capacity (kt) | Artillery power | Aircraft slots | Trade value | Gun reach (km) |
|---|---|---|---|---:|---:|---:|---:|---:|
| GBR | Alexandria | Naval base | Naval base | 180 / 180 | 650 / 650 | 30 / 30 | 70 / 70 | 16 / 16 |
| GBR | Ascension anchorage | Minor waystation | Minor waystation | 12 / 12 | 25 / 25 | 0 / 0 | 3 / 3 | 8 / 8 |
| GBR | Chagos anchorage | Minor waystation | Minor waystation | 8 / 8 | 0 / 0 | 0 / 0 | 2 / 2 | 0 / 0 |
| GBR | Durban station | Naval base | Naval base | 180 / 180 | 650 / 650 | 30 / 30 | 55 / 55 | 16 / 16 |
| GBR | Freetown station | Minor waystation | Minor waystation | 35 / 35 | 120 / 120 | 4 / 4 | 35 / 35 | 8 / 8 |
| GBR | Fremantle | Naval base | Naval base | 180 / 180 | 650 / 650 | 30 / 30 | 45 / 45 | 16 / 16 |
| GBR | Gibraltar | Major dock & naval base | Major dock & naval base | 220 / 220 | 1,800 / 1,800 | 60 / 60 | 50 / 50 | 28 / 28 |
| GBR | Malta / Valletta | Major dock & naval base | Major dock & naval base | 260 / 260 | 1,800 / 1,800 | 60 / 60 | 55 / 55 | 28 / 28 |
| GBR | Mauritius station | Minor waystation | Minor waystation | 35 / 35 | 120 / 120 | 4 / 4 | 25 / 25 | 8 / 8 |
| GBR | Portsmouth | Major dock & naval base | Major dock & naval base | 420 / 420 | 1,000 / 1,000 | 60 / 60 | 100 / 100 | 24 / 24 |
| GBR | Rosyth | Major dock & naval base | Major dock & naval base | 280 / 280 | 1,000 / 1,000 | 60 / 60 | 45 / 45 | 24 / 24 |
| GBR | Scapa Flow | Naval base | Naval base | 180 / 180 | 900 / 900 | 30 / 30 | 8 / 8 | 16 / 16 |
| GBR | Simon’s Town | Major dock & naval base | Major dock & naval base | 230 / 230 | 1,000 / 1,000 | 60 / 60 | 65 / 65 | 24 / 24 |
| GBR | Singapore | Minor waystation | Naval base | 50 / 160 | 250 / 850 | 4 / 30 | 100 / 100 | 8 / 16 |
| GBR | Tarawa | Minor waystation | Minor waystation | 8 / 8 | 0 / 0 | 0 / 0 | 3 / 3 | 0 / 0 |
| GBR | Trincomalee | Naval base | Naval base | 180 / 180 | 650 / 650 | 30 / 30 | 65 / 65 | 16 / 16 |
| USA | Guam / Apra Harbor | Minor waystation | Minor waystation | 12 / 12 | 30 / 30 | 0 / 0 | 3 / 3 | 8 / 8 |
| USA | Manila / Cavite | Naval base | Naval base | 120 / 120 | 1,400 / 1,400 | 16 / 16 | 70 / 70 | 27.4 / 27.4 |
| USA | Mare Island / San Francisco | Major dock & naval base | Major dock & naval base | 420 / 420 | 1,000 / 1,000 | 60 / 60 | 95 / 95 | 24 / 24 |
| USA | Midway | Minor waystation | Minor waystation | 8 / 8 | 0 / 0 | 0 / 0 | 1 / 1 | 0 / 0 |
| USA | Norfolk | Major dock & naval base | Major dock & naval base | 420 / 420 | 1,000 / 1,000 | 60 / 60 | 100 / 100 | 24 / 24 |
| USA | Pearl Harbor | Major dock & naval base | Major dock & naval base | 220 / 300 | 1,000 / 1,500 | 12 / 60 | 45 / 55 | 24 / 28 |
| USA | Puget Sound | Major dock & naval base | Major dock & naval base | 420 / 420 | 1,000 / 1,000 | 60 / 60 | 60 / 60 | 24 / 24 |
| USA | San Diego | Naval base | Naval base | 110 / 180 | 650 / 650 | 8 / 30 | 50 / 65 | 16 / 16 |
| USA | Wake Island | Minor waystation | Minor waystation | 2 / 5 | 0 / 0 | 0 / 0 | 1 / 1 | 0 / 0 |
| JPN | Kure | Major dock & naval base | Major dock & naval base | 420 / 420 | 1,000 / 1,000 | 60 / 60 | 65 / 65 | 24 / 24 |
| JPN | Kwajalein | Minor waystation | Minor waystation | 15 / 15 | 10 / 10 | 0 / 0 | 3 / 3 | 8 / 8 |
| JPN | Majuro | Minor waystation | Minor waystation | 8 / 8 | 0 / 0 | 0 / 0 | 2 / 2 | 0 / 0 |
| JPN | Palau / Koror | Minor waystation | Minor waystation | 20 / 20 | 20 / 20 | 0 / 0 | 10 / 10 | 8 / 8 |
| JPN | Saipan / Tanapag | Minor waystation | Minor waystation | 25 / 25 | 30 / 30 | 2 / 2 | 12 / 12 | 8 / 8 |
| JPN | Sasebo | Major dock & naval base | Major dock & naval base | 420 / 420 | 1,000 / 1,000 | 60 / 60 | 50 / 50 | 24 / 24 |
| JPN | Truk Lagoon | Minor waystation | Minor waystation | 45 / 45 | 40 / 40 | 2 / 2 | 8 / 8 | 8 / 8 |
| JPN | Yokosuka | Major dock & naval base | Major dock & naval base | 420 / 420 | 1,000 / 1,000 | 60 / 60 | 85 / 85 | 24 / 24 |
| FRA | Brest | Major dock & naval base | Major dock & naval base | 420 / 420 | 1,000 / 1,000 | 60 / 60 | 90 / 90 | 24 / 24 |
| FRA | Dakar | Naval base | Naval base | 180 / 180 | 650 / 650 | 30 / 30 | 45 / 45 | 16 / 16 |
| FRA | Toulon | Major dock & naval base | Major dock & naval base | 420 / 420 | 1,000 / 1,000 | 60 / 60 | 75 / 75 | 24 / 24 |
| ITA | La Spezia | Major dock & naval base | Major dock & naval base | 420 / 420 | 1,000 / 1,000 | 60 / 60 | 55 / 55 | 24 / 24 |
| ITA | Taranto | Major dock & naval base | Major dock & naval base | 420 / 420 | 1,000 / 1,000 | 60 / 60 | 55 / 55 | 24 / 24 |
| ITA | Tobruk | Minor waystation | Minor waystation | 35 / 35 | 120 / 120 | 4 / 4 | 10 / 10 | 8 / 8 |
| DEU | Kiel | Major dock & naval base | Major dock & naval base | 420 / 420 | 1,000 / 1,000 | 60 / 60 | 65 / 65 | 24 / 24 |
| DEU | Wilhelmshaven | Major dock & naval base | Major dock & naval base | 420 / 420 | 1,000 / 1,000 | 60 / 60 | 75 / 75 | 24 / 24 |
| SOV | Kronstadt / Leningrad | Major dock & naval base | Major dock & naval base | 230 / 420 | 1,000 / 1,000 | 8 / 60 | 65 / 85 | 24 / 24 |
| SOV | Sevastopol | Naval base | Major dock & naval base | 100 / 420 | 400 / 1,000 | 4 / 60 | 35 / 55 | 16 / 24 |
| SOV | Vladivostok | Minor waystation | Naval base | 45 / 180 | 200 / 650 | 0 / 30 | 20 / 40 | 8 / 16 |

## Historical roles and limits

Manila/Cavite was the Asiatic Fleet’s principal local repair and refueling center; its limited facilities are represented as a naval base. Guam retains a small, weak station at Apra/Piti rather than the much larger base developed during the Pacific war. [US Navy: Philippine bases](https://www.history.navy.mil/browse-by-topic/organization-and-administration/historic-bases/philippine-bases.html), [US Navy: wartime base construction and Guam’s earlier facilities](https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/b/building-the-navys-bases/buidling-navys-bases-vol-2-chapter-26.html).

Singapore’s naval-base scheme was announced in 1923. Its large floating dock was commissioned in 1928; the permanent King George VI graving dock opened in 1938. Therefore the 1922 opening uses commercial/refueling support, and the 1936 opening represents an incomplete naval-base complex. [National Library Board: the two shipyards](https://biblioasia.nlb.gov.sg/vol-15/issue-2/jul-sep-2019/shipyards-keppel-sembawang/), [National Heritage Board: King George VI Dock](https://www.roots.gov.sg/places/places-landing/Places/surveyed-sites/Sembawang-Naval-Base-King-George-VI-Dock).

Article XIX covered the Philippines, Guam, Hong Kong and specified Pacific possessions. Singapore lay west of the British restriction’s 110° east boundary; Hawaii was expressly exempt. The base freeze therefore does not explain Singapore’s construction schedule. [Signed Washington treaty, Article XIX](https://history.state.gov/historicaldocuments/frus1922v01/d77).

San Diego’s early destroyer-base role differs from the major Pacific arsenals at Mare Island and Puget Sound. Pearl Harbor had a permanent dry dock from 1919, although its facilities continued to expand. [US Navy: Naval Base San Diego](https://www.history.navy.mil/browse-by-topic/organization-and-administration/installations/naval-base-san-diego.html), [US Navy archaeological resource study](https://www.history.navy.mil/content/dam/nhhc/research/underwater-archaeology/PDF/UA_ResourcesMgt.pdf).

Scapa Flow is a fleet anchorage; the United Kingdom’s dockyard pool is distributed across mainland and imperial dockyards. Soviet opening capacity is reduced in 1922 to represent revolution and civil-war disruption. The limited map treats the Soviet ministry as responsible for its future Far Eastern network, even though control around Vladivostok was contested at the opening date. Map approaches are offshore routing points and port icons use geographic harbor locations. Canals and detailed commercial cargo destinations are not modeled.

## Per-port notes

- **Alexandria (GBR):** Commercial harbor and eastern Mediterranean fleet anchorage.
- **Ascension anchorage (GBR):** Isolated anchorage; minimal local infrastructure.
- **Chagos anchorage (GBR):** Small Chagos anchorage; no modern naval base in this period.
- **Durban station (GBR):** Commercial harbor and repair support on the Indian Ocean route.
- **Freetown station (GBR):** Sierra Leone coaling and convoy station.
- **Fremantle (GBR):** Fremantle commercial harbor and fleet support.
- **Gibraltar (GBR):** Fortified strait, dry docks and Mediterranean fleet support.
- **Malta / Valletta (GBR):** Valletta dockyard and fortified Mediterranean fleet base.
- **Mauritius station (GBR):** Port Louis commercial harbor and refueling station.
- **Portsmouth (GBR):** Royal dockyard and Channel fleet base.
- **Rosyth (GBR):** Forth dockyard, opened during the First World War; reduced interwar activity.
- **Scapa Flow (GBR):** Large sheltered fleet anchorage; major dockyard work requires a mainland arsenal.
- **Simon’s Town (GBR):** Simon’s Town dockyard and Cape sea-route support.
- **Singapore (GBR):** 1922: Commercial harbor and refueling station in 1922. The new naval base was approved in 1923. 1936: Naval base under construction in 1936. The King George VI graving dock did not open until February 1938.
- **Tarawa (GBR):** British Gilbert Islands anchorage; the later Japanese defenses are not part of the opening position.
- **Trincomalee (GBR):** Trincomalee anchorage and Ceylon sea-route support.
- **Guam / Apra Harbor (USA):** Apra Harbor and the small Piti naval yard. Limited facilities, without the major base developed during the Second World War.
- **Manila / Cavite (USA):** Manila/Cavite: principal Asiatic Fleet repair and refueling base. Limited yard capacity; harbor defenses include Corregidor.
- **Mare Island / San Francisco (USA):** San Francisco Bay naval shipyard and repair complex.
- **Midway (USA):** Cable and communications outpost; the wartime naval air station had not yet been built.
- **Norfolk (USA):** Hampton Roads fleet base and Norfolk Navy Yard.
- **Pearl Harbor (USA):** 1922: Pearl Harbor’s first permanent dry dock opened in 1919; facilities were still expanding. 1936: Pearl Harbor naval station, dry dock and Pacific fleet support.
- **Puget Sound (USA):** Puget Sound naval shipyard and capital-ship repair base.
- **San Diego (USA):** 1922: Destroyer base established in 1922, with limited early repair facilities. 1936: Fleet operating base and destroyer support; major construction is represented at the Pacific arsenals.
- **Wake Island (USA):** 1922: Unfortified American atoll; no commercial flying-boat station yet. 1936: Remote American atoll. Pan American flying boats began using it in 1935; its Marine defenses were established in 1941.
- **Kure (JPN):** Inland Sea naval arsenal and battleship repair base.
- **Kwajalein (JPN):** Marshall Islands lagoon in the Japanese mandate; extensive military facilities came later.
- **Majuro (JPN):** Lightly developed Marshall Islands anchorage; it was not a major prewar fleet base.
- **Palau / Koror (JPN):** Koror administrative and commercial anchorage in the Japanese mandate.
- **Saipan / Tanapag (JPN):** Japanese South Seas Mandate administrative and commercial harbor, before its major wartime defenses.
- **Sasebo (JPN):** Western Japanese fleet arsenal and repair base.
- **Truk Lagoon (JPN):** Large natural lagoon in the Japanese mandate; limited interwar facilities, not yet the wartime fleet base.
- **Yokosuka (JPN):** Tokyo Bay naval arsenal and fleet base.
- **Brest (FRA):** Atlantic naval arsenal and repair base.
- **Dakar (FRA):** West African fleet and commercial support port.
- **Toulon (FRA):** Principal French Mediterranean arsenal.
- **La Spezia (ITA):** Italian naval arsenal.
- **Taranto (ITA):** Major southern fleet base and arsenal.
- **Tobruk (ITA):** Forward Libyan anchorage with limited repair support.
- **Kiel (DEU):** Baltic arsenal and fleet base. Routes go around Denmark; the Kiel Canal is not simulated.
- **Wilhelmshaven (DEU):** Wilhelmshaven naval dockyard; the icon marks the coastal base, not Heligoland island.
- **Kronstadt / Leningrad (SOV):** 1922: Petrograd and Kronstadt retain arsenals, with reduced activity following revolution and civil war. 1936: Kronstadt fleet base and the Leningrad naval shipbuilding complex.
- **Sevastopol (SOV):** 1922: Black Sea naval infrastructure recovering from the civil war. 1936: Principal Black Sea fleet base and repair facilities.
- **Vladivostok (SOV):** 1922: Civil-war disruption and foreign intervention constrain Far Eastern naval support at the 1922 opening. 1936: Far Eastern fleet and commercial port.

## Connected systems

- **Trade:** sum the nominal trade value of controlled ports × condition × (1 − blockade), then divide by the nation’s opening trade value and cap at 100%. Capture adds usable access; occupation removes it. Enemy forces within approximately 120 km contest access, with stronger siege pressure and resistance from friendly fleets and shore artillery. The assessment is refreshed each game hour.
- **Economy:** domestic share + trade share × shipping coverage × convoy flow × port-trade coverage scales gold, industry and influence income. Effective logistics uses domestic share + trade share × shipping coverage × port-trade coverage. Extra merchant capacity cannot replace closed ports, and extra port access cannot replace lost merchant tonnage.
- **Supply:** accessible port capacity is shared by fleets physically near the port. Distance penalties, occupation, damage and diplomatic access affect availability.
- **Construction:** the national yard pool is multiplied by the condition-weighted surviving capacity of major docks divided by opening major-dock capacity. The player sees one total throughput and one committed/spare/overload graph.
- **Combat:** raid anchorage strikes ships in harbor; siege port sustains facility damage and supply disruption. Shore defenses use actual stationed aircraft, model-specific combat radius, complete crews and finite aviation stocks. Coastal guns use a battery profile, with zero range at unarmed ports. Aircraft ferries and vulnerable merchant transports replenish bases; see [base aviation](base-aviation.md). Naval attacks do not directly capture territory. Separate island campaigns require nearby surface cover and merchant supply; occupation transfers port and trade access.
- **Repair:** safe damaged ports repair automatically after 24 hours without an attack, spending up to 128 gold and 96 industry per day to restore 0.8 percentage points of condition. Smaller damage or budgets scale both work and cost.
