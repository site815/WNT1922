# WNT1922 third-party notices

Asset review: 2026-09-21. These terms apply to the named third-party material independently of the game's own license. No endorsement by the contributors is implied.

## Map

Made with Natural Earth: [public-domain map data](https://www.naturalearthdata.com/about/terms-of-use/). This permits commercial use, adaptation and redistribution. The game uses 1:50m map units 5.1.1 and 1:110m land. Political ownership, approximate interwar partitions, simplified geometry and occupation overlays are authored for the game; they are not a historical survey. No United Nations map artwork is included. See the asset manifest for source URLs and SHA-256 hashes.

Equal Earth projection: locally implemented from published equations, described by Bojan Šavrič, Tom Patterson and Bernhard Jenny (2019), [The Equal Earth map projection](https://doi.org/10.1080/13658816.2018.1504949). No PROJ software is bundled.

## Music

All recordings are by **Kevin MacLeod (incompetech.com)**, licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). Individual compositions, recording credits, original URLs, ISRCs and file hashes are recorded in the [live soundtrack catalog](../../catalog/common/music.md). The in-game credits read that same catalog and include every bundled track. MP3 files are unmodified; playback volume and sequencing vary in-game.

The music may be shared and adapted commercially under CC BY 4.0. Retain attribution, the license link and any modification notice. The game license does not restrict rights granted for these recordings. [Composer's licensing page](https://incompetech.com/music/royalty-free/licenses/).

## Windows runtime

The Windows download includes unmodified **Electron 44.3.0**, except for renaming the executable and adding the game. Electron is MIT-licensed; its bundled Chromium, Node.js and other components have separate notices. Preserve **LICENSE** and **LICENSES.chromium.html** in the executable folder, along with all required runtime files. [Exact runtime release and source](https://github.com/electron/electron/releases/tag/v44.3.0) · [Electron source license](https://github.com/electron/electron/blob/v44.3.0/LICENSE). The runtime archive is pinned by publisher SHA-256 in worker/desktop/runtime-lock.json. Exact FFmpeg and Electron source archives, build instructions and component revisions are included in the application’s assets/licenses/runtime-sources; preserve that directory with the binary. The LGPL library remains replaceable; the game license does not restrict modification or reverse engineering required to exercise its license rights.

## Other material

Sound effects are synthesized locally. Game icons are authored SVG/CSS. Fonts come from the operating system; no font package is included. Historical names and numerical specifications are factual references, with source citations in the repository. Research-only downloads in `.build/` are excluded from repository and executable distribution. Original game code and scenario content have no open-source license grant; see LICENSE.md.

## Recognition artwork

The files in [assets/recognition](../recognition/README.md) include public-domain historical plates, separately licensed modern historical drawings, and original project illustrations. Each live registry listed by [the recognition index](../recognition/index.json) records the creator, source page, license, license URL, configuration, modifications and file hash for every image. Preserve those records with the files. The game displays the same attribution and license links in inspection captions and its recognition credits.

Creative Commons files retain their individual attribution and share-alike terms, where specified; the project license does not restrict rights granted by those licenses. Full source images retain signatures and annotations. Display-only grayscale and crop windows do not modify the stored originals. Any SVG normalization or conversion is documented in the corresponding entry. Source-based original SVGs identify inferred details and are not represented as archival documents. Historical artwork does not imply endorsement by its creator or holding institution.

## Historical economic data

Bolt, Jutta and Jan Luiten van Zanden (2024), Maddison style estimates of the evolution of the world economy: A new 2023 update, Journal of Economic Surveys, DOI https://doi.org/10.1111/joes.12618. Maddison Project Database 2023, https://doi.org/10.34894/INZBF2. Total GDP processing by Our World in Data, https://ourworldindata.org/grapher/gdp-maddison-project-database. Licensed CC BY 4.0, https://creativecommons.org/licenses/by/4.0/. WNT1922 extracts seven countries for 1921–1951, interpolates monthly and normalizes to campaign opening. Missing Soviet 1941–1945 observations are interpolated. No endorsement is implied. Data rights remain independent of the game license.

See the complete [historical GDP source bibliography](GDP-SOURCES.md).
