# WNT1922 third-party notices

Asset review: 2026-09-12. These terms apply to the named third-party material independently of the game's own license. No endorsement by the contributors is implied.

## Map

Made with Natural Earth: [public-domain map data](https://www.naturalearthdata.com/about/terms-of-use/). This permits commercial use, adaptation and redistribution. The game uses 1:50m map units 5.1.1 and 1:110m land. Political ownership, approximate interwar partitions, simplified geometry and occupation overlays are authored for the game; they are not a historical survey. No United Nations map artwork is included. See the asset manifest for source URLs and SHA-256 hashes.

Equal Earth projection: locally implemented from published equations, described by Bojan Šavrič, Tom Patterson and Bernhard Jenny (2019), [The Equal Earth map projection](https://doi.org/10.1080/13658816.2018.1504949). No PROJ software is bundled.

## Music

All recordings are by **Kevin MacLeod (incompetech.com)**, licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). The Entertainer was composed by Scott Joplin; the recording is by Kevin MacLeod. MP3s are unmodified; playback volume and sequencing vary in-game.

| Track | Composer / recording credit | Original track and ISRC |
| --- | --- | --- |
| Long Road Ahead | Kevin MacLeod | [USUAN1100588](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100588) |
| Opportunity Walks | Kevin MacLeod | [USUAN1100123](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100123) |
| The Entertainer | Scott Joplin · recording by Kevin MacLeod | [USUAN1900059](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1900059) |
| Dark Times | Kevin MacLeod | [USUAN1100747](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100747) |
| Prelude and Action | Kevin MacLeod | [USUAN1100887](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100887) |
| On the Ground | Kevin MacLeod | [USUAN1400030](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1400030) |
| Jazz Brunch | Kevin MacLeod | [USUAN1700074](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700074) |
| Lobby Time | Kevin MacLeod | [USUAN1600054](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600054) |
| Anguish | Kevin MacLeod | [USUAN1400047](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1400047) |
| Lost Frontier | Kevin MacLeod | [USUAN1300039](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1300039) |
| The Descent | Kevin MacLeod | [USUAN1200094](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1200094) |
| Unpromised | Kevin MacLeod | [USUAN1100603](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100603) |
| Dances and Dames | Kevin MacLeod | [USUAN1100595](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100595) |
| Walking Along | Kevin MacLeod | [USUAN1100020](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100020) |
| With the Sea | Kevin MacLeod | [USUAN1100008](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100008) |

The music may be shared and adapted commercially under CC BY 4.0. Retain attribution, a license link and any modification notice. The game's license does not restrict rights granted for these recordings. [Composer's licensing page](https://incompetech.com/music/royalty-free/licenses/). Individual file hashes and original MP3 links are in the asset manifest and music credits.

## Windows runtime

The Windows download includes unmodified **Electron 44.3.0**, except for renaming the executable and adding the game. Electron is MIT-licensed; its bundled Chromium, Node.js and other components have separate notices. Preserve **LICENSE** and **LICENSES.chromium.html** in the executable folder, along with all required runtime files. [Exact runtime release and source](https://github.com/electron/electron/releases/tag/v44.3.0) · [Electron source license](https://github.com/electron/electron/blob/v44.3.0/LICENSE). The runtime archive is pinned by publisher SHA-256 in worker/desktop/runtime-lock.json. Exact FFmpeg and Electron source archives, build instructions and component revisions are included in the application’s assets/licenses/runtime-sources; preserve that directory with the binary. The LGPL library remains replaceable; the game license does not restrict modification or reverse engineering required to exercise its license rights.

## Other material

Sound effects are synthesized locally. Game icons are authored SVG/CSS. Fonts come from the operating system; no font package is included. Historical names and numerical specifications are factual references, with source citations in the repository; research scans and page images are excluded from repository and executable distribution. Original game code and scenario content have no open-source license grant; see LICENSE.md.

## Historical economic data

Bolt, Jutta and Jan Luiten van Zanden (2024), Maddison style estimates of the evolution of the world economy: A new 2023 update, Journal of Economic Surveys, DOI https://doi.org/10.1111/joes.12618. Maddison Project Database 2023, https://doi.org/10.34894/INZBF2. Total GDP processing by Our World in Data, https://ourworldindata.org/grapher/gdp-maddison-project-database. Licensed CC BY 4.0, https://creativecommons.org/licenses/by/4.0/. WNT1922 extracts seven countries for 1921–1951, interpolates monthly and normalizes to campaign opening. Missing Soviet 1941–1945 observations are interpolated. No endorsement is implied. Data rights remain independent of the game license.

# Historical GDP source bibliography

Maddison Project Database 2023, source sheets. Citations are retained for each of the seven countries used by the game. The tables reproduce bibliographic entries, not the papers themselves. Source: https://doi.org/10.34894/INZBF2. Workbook retrieved from Our World in Data’s published snapshot (MD5 fbea25205803639ae955fd2160848f32), 12 September 2026.

## Sources

| Country | Period | Citation |
|---|---|---|
| DEU | 1500-1850 | Pfister, U. (2022). Economic Growth in Germany, 1500–1850. The Journal of Economic History, 82(4), 1071–1107 |
| FRA | 1 | Scheidel, W. and Friesen, S. J., ‘The size of the economy and the distribution of income in the Roman Empire’, Journal of Roman Studies, 99 (2009), pp. 61–91 |
| FRA | 1276–1800 | Ridolfi, L., & Nuvolari, A. (2021). L’histoire immobile? A reappraisal of French economic growth using the demand-side approach, 1280–1850. European Review of Economic History, 25(3), 405–428 |
| GBR | 1 | Scheidel, W. and Friesen, S. J., ‘The size of the economy and the distribution of income in the Roman Empire’, Journal of Roman Studies, 99 (2009), pp. 61–91 |
| GBR | 1252–1700 (England) | Broadberry, S.N., B. Campbell, A. Klein, M. Overton and B. van Leeuwen (2015), British Economic Growth 1270-1870 Cambridge: Cambridge University Press. |
| GBR | 1700–1870 | Broadberry, S.N., B. Campbell, A. Klein, M. Overton and B. van Leeuwen (2015), British Economic Growth 1270-1870 Cambridge: Cambridge University Press. |
| ITA | 1451-1861 | Chilosi, D., & Ciccarelli, C. (2023). Italy in the Great Divergence: What Can We Learn from Engel’s Law (SSRN Scholarly Paper 4514091). |
| ITA | 1861-1871 (North Italy) | Malanima, P. (2010), “The long decline of a leading economy: GDP in central and northern Italy, 1300–1913” European Review of Economic History 15 (2): 169–219. |
| ITA | 1871-1990 | Baffigi, A. (2011).”Italian National Accounts, 1861-2011”, Banca d’Italia Economic History Working Papers 18.  |
| JPN | 724-1874 | Bassino, Jean-Pascal & Broadberry, Stephen & Fukao, Kyoji & Gupta, Bishnupriya & Takashima, Masanori, (2018). "Japan and the Great Divergence, 730-1874," CEI Working Paper Series 2018-13, Center for Economic Institutions, Institute of Economic Research, Hitotsubashi University |
| JPN | 1874-1940 | Fukao, K., Bassino, J.-P., Makino, T., Paprzycki, R., Settsu, T., Takashima, M., and Tokui, J. (2015) Regional Inequality and Industrial Structure in Japan: 1874-2008, Tokyo: Maruzen Publishing. |
| SUN | 1860-1885 | Kuboniwa, M. (2019). Estimating GDP and Foreign Rents of the Oil and Gas Sector in the Soviet Union and Present-Day Russia. In M. Kuboniwa, Y. Nakamura, K. Kumo, & Y. Shida (Eds.), Russian Economic Development over Three Centuries: New Data and Inferences (pp. 421–438). Springer. |
| SUN | 1885-1913  | Gregory, P. R. (1982). Russian National Income, 1885–1913, Cambridge: Cambridge University Press |
| SUN | 1913-1928  | Markevich, A. and M. Harrison (2011). “Great War, Civil War, and Recovery: Russia's National Income, 1913 to 1928”, The Journal of Economic History, Volume 71 (3): 672 – 703, table 6. |
| SUN | 1991 - | Based on GDP and population data for their successor states |
| USA | 1650 - 1790  | McCusker, John J., ‘Colonial Statistics’, Historical Statistics of the United States: Earliest Time to the Present, in S. B. Carter, S. S. Gartner, M. R. Haineset al. New York, Cambridge University Press. V-671. |
| USA | 1790 - 1870  | Sutch, R. (2006). National Income and Product. Historical Statistics of the United States: Earliest Time to the Present, in S. B. Carter, S. S. Gartner, M. R. Haineset al. New York, Cambridge University Press III-23-25. |
| USA | 1800-1830 | Prados de la Escosura, L. (2009). “Lost Decades? Economic Performance in Post-Independence Latin America,” Journal of Latin America Studies 41: 279–307. (updated data) |

## Maddison original sources

| Country | Period | Citation |
|---|---|---|
| DEU | 1850-1950 | Hoffmann, Grumbach and Hesse, op. cit., pp. 454-5. |
| FRA | 1850-1913 | Toutain, Le Produit interieur de la France de 1789 a 1982, Presses Universitaires de Grenoble, 1987 |
| FRA | 1920-1950 | Toutain, Le Produit interieur de la France de 1789 a 1982, Presses Universitaires de Grenoble, 1987 |
| GBR | 1870-1950 | C.H. Feinstein, National Income Expenditure and Output of the United Kingdom 1855-1965, Cambridge, 1972 |
| SUN | 1928-40 | R. Moorsteen and R.P. Powell, The Soviet Capital Stock 1928-1962, Irwin, Illinois, 1966, p. 361 |
| SUN | 1945-50 | R. Moorsteen and R.P. Powell, The Soviet Capital Stock 1928-1962, Irwin, Illinois, 1966, p. 362 |
| SUN | 1950-90 | CIA |
| USA | 1820-1950 | GDP movement from Maddison (1995a), amended for 1820–70 to include income of the indigenous population (taken to be $400 per capita in 1820 and 1870). |
