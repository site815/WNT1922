# Campaign catalogs and source limits

The playable catalog is built by `tools/build-game.mjs` and `tools/campaign-catalogs.mjs`. Promotional fiction and manga are outside the playable sources. New data lives in `data/playable/`; [the national Markdown catalogs](../../docs/playable/README.md) are generated and checked against the same inputs.

## In Good Faith, 1 January 1936

The four original alternate programs retain their authored hull and equipment files. Compatible legacy ships come from `roster-1936.json`; explicit British retirement and disposal plans still take precedence. HMAS Australia and Anzac are the alternate ex-Barham/ex-Malaya hulls, not additional historical ships.

The three additional national programs are alternate-history designs. Their class specifications, prices, counts, aircraft fits and fleet oilers are **hypothetical playtest content**, not historical procurement claims:

- **France — La Revanche de l'École:** modern Jeune École submarines, torpedo destroyers, fast cruisers and naval aviation. Useful Courbet/Bretagne capital ships, Béarn and representative light forces supplement the program. Atlantic and Mediterranean forces start separately.
- **Italy — Mare Nostrum:** fast battleships and cruisers, torpedo forces and a Mediterranean carrier, supported by inherited Cavour/Doria capital ships and light forces.
- **Soviet Union — Krasny Okean:** industrial expansion supports battleships, carriers and ocean escorts, including further capital construction. The three serviceable Sevastopol hulls and inherited light forces supplement the program. Baltic, Black Sea and Pacific starting forces remain geographically separate.

France and Italy's inherited classes use `data/ships/fr.json` and `data/ships/it.json`. The Soviet historical class supplement uses marked representative fits. [Sevastopol class service history, Navypedia](https://www.navypedia.org/ships/russia/ru_bb_sevastopol.htm) supports the three restored hulls and the 1929 transfer of Parizhskaya Kommuna to the Black Sea. Damaged Poltava is excluded from the useful fleet.

## The Treaty System, 6 February 1922

The six existing national catalogs and the opening order of battle in `data/scenarios/campaign_1922.json` are used directly, without importing the 1936 alternate fits. Design-year availability, treaty-disposition tags and named opening construction are retained. Aggregate light-ship construction progress is a provisional 40% where precise hull progress is absent.

The additional Soviet fleet is a **partial register of useful hulls**, not a claim to enumerate every surviving Civil War vessel. Marat starts active; Parizhskaya Kommuna and Gangut are in reserve; unfinished Svetlana and reserve Aurora remain available. Seven active destroyers use a representative Novik fit. Ten useful reserve destroyers are a provisional game inventory. Seven Baltic submarines start in reserve; the player can fund recommissioning. Wrecks, unserviceable hulks and minor inland forces are excluded.

- Primary context: [US Office of Naval Intelligence, USSR Navy, 30 November 1943](https://www.ibiblio.org/hyperwar/NHC/NewPDFs/USSR/ONI%20USSR%20Navy%201943-11-30.pdf) describes the postwar fleet as four dreadnought hulls (one never restored), unfinished cruisers and about twenty destroyers and twenty submarines. Those surviving totals are not active-service counts.
- Readiness cross-check: [Naval-History.Net, active Soviet naval forces in 1922](https://www.naval-history.net/xGW-RussianNavy1914-1918.htm), section 12, lists Marat and seven Baltic destroyers, with submarine recommissioning late in 1922. Its bibliography identifies published fleet histories.

Washington dispositions have an alert, an August 1922 deadline and an explicit compliance default. AI signatories comply at the opening. Canceled hulls are scrapped; designated carriers convert. Kaga is held until the Amagi earthquake substitution. Replacement-linked US/British retirements occur once the retained new battleships have commissioned. The building holiday and per-hull size limits are simplified. Germany has separate Versailles restrictions; the Soviet Union is not a Washington signatory. This is not a complete legal implementation of every treaty clause.

## Merchant registers

Powered merchant vessels of at least **100 gross register tons** are counted separately from naval warships and support ships. US figures exclude the Great Lakes register; British figures exclude separately listed Dominions. **GRT is registered volume, not displacement tonnage.**

| Navy | 1921–22 hulls | 1921–22 GRT | 1935–36 hulls | 1935–36 GRT |
|---|---:|---:|---:|---:|
| United Kingdom | 8,579 | 19,320,053 | 6,998 | 17,298,432 |
| United States | 3,779 | 13,511,142 | 2,553 | 9,664,665 |
| Japan | 2,033 | 3,354,806 | 2,146 | 4,085,650 |
| Germany | 1,090 | 654,407 | 2,070 | 3,693,298 |
| France | 1,662 | 3,298,759 | 1,382 | 2,989,386 |
| Italy | 893 | 2,467,537 | 1,041 | 2,838,354 |
| Soviet Union | **100 provisional** | **100,000 provisional capacity proxy** | 575 | 1,110,811 |

Sources: Lloyd's Register [1922 casualty returns, Table 1, PDF page 2](https://upload.wikimedia.org/wikipedia/commons/c/c0/Casualty_Returns_1922.pdf#page=2); [1935 casualty returns, annual Table 1, PDF page 50](https://upload.wikimedia.org/wikipedia/commons/b/b4/Casualty_Returns_1935.pdf#page=50); [1935–36 world fleet statistics, Table 1](https://lloyds-production.s3.amazonaws.com/_file/general/world-fleet-stats-1935-1936-resized.pdf). The first two tables were checked as rendered page images because OCR corrupts several digits. The full 1935–36 table supplies the Soviet powered fleet (575), excluding its two sailing vessels.

The 1922 summary does not enumerate Soviet-controlled shipping separately. The player explicitly approved the marked **100-hull provisional** starting inventory pending verification. For release 0.5 logistics only, these provisional hulls use a marked 100,000-GRT capacity proxy; it is not a historical register claim. Japan's 1936 total includes **500 Standard Maru plus 1,646 other merchants**, as selected by the player. Its ten Maru depot conversions belong to naval support. Historical merchant totals are baselines, not assertions that every historical vessel survives unchanged through the alternate timeline.

## Aircraft and engineering

1922 catalogs provide period fighter, strike and scout types; later national role models provide progression into the 1930s and 1940s. Generic later models and aircraft for the new alternate programs are labeled game designs. Prices, production rates, opening inventories, combat-radius fits and some crew variants are provisional. [US Naval Aviation Museum, Vought VE-7](https://www.history.navy.mil/content/history/museums/nnam/explore/collections/aircraft/v/ve-7-bluebird.html) is a primary reference for the early US carrier fighter. Aircraft cannot be developed or produced before their catalog availability year.

Player ship drafts are recomputed from saved design recipes. Role, year, displacement, guns, torpedoes, protection, machinery, endurance and aircraft impose shared constraints. Weight allocation and price equations are deliberately simple estimates. They are not ship stability, propulsion or ballistic simulations. Automatic drafts begin with a contemporary national scenario class and respond to the player's strategic priority.

Map data, historical campaign anchors and licenses are documented in [MAP-SOURCES.md](MAP-SOURCES.md). All provisional resource, combat, recovery and timing coefficients are documented in [the game guide](../README.md).

### Opening revision 0.6

Japan’s 20 prototype submarine reserve hulls are retired before the 1936 opening. Pre-1936 development costs remain in the scenario ledger. The 40 remaining older destroyers use the explicitly labeled WWI-era / Minekaze representative fit and its cataloged 39-knot maximum (passage speed is lower). No additional historical hull identities are asserted.
