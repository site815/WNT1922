# WNT1922

Playable naval grand strategy for Windows. For a distributable build, extract the whole **WNT1922 Windows ZIP** and open **WNT1922.exe**. No separate Node.js or browser installation is required. The source checkout also supports **Play-WNT1922.cmd** and [local browser play](http://127.0.0.1:19222/).

Release **0.19.0** has two campaign buttons: **The Treaty System — 6 February 1922** and **In Good Faith — 1 January 1936**. Choose the United Kingdom, the United States, Japan, France, Italy, Germany or the Soviet Union. The campaign is scored in 1950 and continues afterward.

Ten main menus cover fleet missions, ship and aircraft catalogs, a merged fleet register, facilities and research, diplomacy, battle reports, naval record, and economy. School panels show graduation progress. Manage resources, shipyards, fleet missions, diplomacy and naval preparation. Automatic battles use ship specifications, air wings, logistics, training, morale, scouting and escape speed. The Equal Earth map shows fleets, scouted contacts, convoys, ports, capitals and supply-sensitive land campaigns.

Simulation uses one-minute operations in a worker separate from the interface, with selectable speeds up to 100,000× and measured actual speed. The large map opens selections in a narrow right-hand command panel; friendly movement targets 60 fps. Wartime contact alerts expire when reports become stale. Saves remain local. Start a new campaign for the revised opening balance.

- [Controls, mechanics, balance and development commands](game/README.md)
- [Validation and performance evidence](game/VALIDATION.md)
- [Release audit and proposed improvements](game/AUDIT-0.17.md)
- [Technology tree: all fourteen branches and 126 levels](docs/tech-tree.md)
- [All seven national platform/equipment catalogs, both campaigns](docs/playable/README.md)
- [Complete 14-start catalog review](docs/reviews/catalog-14-starts.html)
- [Operational air warfare: automatic sorties, CAP, weather and shore aviation](docs/operational-air-warfare.md)
- [Monthly economic growth and civilian shipping](docs/economic-growth.md)
- [Campaign sources and provisional estimates](game/data/CAMPAIGN-SOURCES.md)
- [Strategic port tiers, trade weights and historical references](docs/strategic-ports.md)
- [Music credits and licenses](game/assets/music/CREDITS.md)
- [Map sources and license](game/data/MAP-SOURCES.md)
- [Windows builds, saves, Git and release workflow](docs/building.md)
- [Complete asset audit](docs/asset-audit.md) · [Redistribution notices](THIRD_PARTY_NOTICES.md)

The original four detailed hindsight canon sets remain in `docs/hindsight/`, alongside the three new programs. Historical bases are in `data/ships/`; new playable supplements are in `data/playable/`. Builds read these data, and generated Markdown catalogs are checked against them.

Promotional fiction, manga, multiplayer and set-piece battle modes are outside this build.

Release 0.16 adds physical base aviation, ferry and merchant reinforcement, finite aviation stores, explicit coastal battery reach, bulk fleet selection, detailed resource accounts, funding costs and fifteen music tracks. [Base aviation and its historical/provisional assumptions](docs/base-aviation.md).

Release 0.17 adds historical opening diplomacy, monthly relationship context, irrevocable 1–12 month war warnings, declaration popups and defensive alliance calls. All four facilities start at 50% and stay under manual funding control. [Diplomacy rules](docs/diplomacy.md) · [Beta distribution plan](docs/beta-release.md).

Release 0.19 completes the aircraft overhaul: three-year naval and other-service generations, explicit aircraft compatibility, daylight/weather, search sectors, assembly, CAP/escorts, flights and deck cycles. Aircraft remain accounted for while airborne and can divert after carrier loss. Government maritime reinforcements travel by ferry or merchant transport. Japan’s 1936 program is preserved.
