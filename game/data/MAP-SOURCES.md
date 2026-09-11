# Map sources and adaptations

## Current source: Natural Earth (release 0.18 onward)

`world-political.json` and `world-political-1922.json` are generated from **Natural Earth 1:50m Admin 0 map units, version 5.1.1**. Natural Earth dedicates its map data to the public domain and explicitly permits commercial use, adaptation and redistribution. Original input archive: `natural-earth-map-units.zip`; its SHA-256 and the generated files are recorded in `game/assets/third-party-manifest.json`.

- [Dataset and version](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-details/).
- [Publisher's source archive](https://naturalearth.s3.amazonaws.com/50m_cultural/ne_50m_admin_0_map_units.zip).
- [Public-domain terms, including commercial use](https://www.naturalearthdata.com/about/terms-of-use/).

The generator reads only this Natural Earth archive. It does not read, trace or reuse the previous restricted map geometry. Numeric territory keys are game identifiers retained for campaign and port logic; they do not determine the polygons. Retired source archives and research scans are excluded from Git and all executable builds. Dated pre-0.18 audits describe earlier development versions, not the current asset licenses.

## Historical accuracy and modifications

Natural Earth supplies modern geographic units, not surveyed 1922/1936 borders. The game groups colonial possessions and authors coarse interwar corrections for Germany, Poland, Danzig, Soviet territories and Manchuria. These corrections and the Sarawak/Papua partitions are deliberately approximate. Borders in disputed areas and smaller colonial enclaves are incomplete. Commonwealth and protectorate coloring is a gameplay grouping, not a statement that their constitutional status was identical. Intermediate annual border changes are not separately authored; occupation remains simulation-driven. The Soviet label includes its predecessor territories in the February 1922 start.

Small islands below polygon resolution remain explicit chart nodes. Capitals and major port labels use city coordinates; offshore approaches remain separate for navigation. Political ownership continues to drive campaign fronts and port access.

To regenerate both dates, install `tools/map-requirements.txt` in a Python environment, then run `python tools/prepare-natural-earth-map.py` from the repository root. Review the geometry, run `node tools/update-asset-notices.mjs` to record the reviewed output hashes, then `node tools/build-game.mjs`. Python and these preparation dependencies are not redistributed or required to play.

## Projection and coast checks

The map uses the **Equal Earth** projection, implemented from the published projection equations. Reference: [PROJ Equal Earth documentation](https://proj.org/en/stable/operations/projections/eqearth.html). This is not a copy of the modern United Nations political map. Historical borders and the game's occupation overlays use that projection.

`world-land.geojson` is bundled [Natural Earth 1:110m land geometry](https://www.naturalearthdata.com/downloads/110m-physical-vectors/), in the [public domain](https://www.naturalearthdata.com/about/). It is used for route/coastline regression checks. The sea navigation graph is an authored, simplified set of offshore waypoints and refueling approaches. It does not claim navigational accuracy or model canal dimensions and tides.

## Land-campaign historical anchors

- [US Holocaust Memorial Museum: German conquests in Europe, 1939–1942](https://encyclopedia.ushmm.org/content/en/map/german-conquests-in-europe-1939-1942).
- [National Army Museum: The struggle for North Africa, 1940–43](https://www.nam.ac.uk/explore/struggle-north-africa-1940-43).
- [US Army Center of Military History: World War II Asiatic-Pacific campaigns](https://history.army.mil/Research/Reference-Topics/Army-Campaigns/Brief-Summaries/World-War-II/World-War-II-Asiatic-Pacific-Theater/).

These sources anchor dates and broad geographical campaigns. The game's progress rates, supply coefficients, naval proxies, territorial corridor partitions and possible reversals are authored playtest values. They are not empirical military outcome models. No promotional fiction is used.
