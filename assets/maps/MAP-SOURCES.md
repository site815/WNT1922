# Map sources

`geometry.json` contains shared geometry derived from **Natural Earth 1:50m Admin 0 map units 5.1.1**. The original archive is `natural-earth-map-units.zip`. Provenance and checked asset hashes are recorded in `assets/manifest.json`.

- [Dataset](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-details/)
- [Publisher archive](https://naturalearth.s3.amazonaws.com/50m_cultural/ne_50m_admin_0_map_units.zip)
- [Public-domain terms, including commercial use](https://www.naturalearthdata.com/about/terms-of-use/)

The game reads names, ownership and historical map metadata directly from `catalog/1922/map.md` and `catalog/1936hindsight/map.md`. `worker/map-assets.mjs` joins these records with the geometry at startup. There is no map-document export step.

Natural Earth supplies modern geographic units. The authored interwar borders and colonial groupings are approximate, including Germany, Poland, Danzig, Soviet territories, Manchuria, Sarawak and Papua. Small enclaves and intermediate annual border changes are incomplete. Occupation changes during play come from the simulation. Small islands below polygon resolution remain chart nodes. Port/capital markers use city positions; offshore navigation approaches are separate.

The display uses locally implemented [Equal Earth equations](https://proj.org/en/stable/operations/projections/eqearth.html). No United Nations map artwork or restricted map geometry is included.

`navigation-mask.geojson` is the unmodified, public-domain [Natural Earth 1:110m land dataset](https://www.naturalearthdata.com/downloads/110m-physical-vectors/). Regression tests use it to check the simplified offshore route graph. It has a different resolution and purpose from the political display. Narrow channels and harbor approaches are abstract; the graph is not a navigational chart and does not model tides or canal dimensions.

Historical campaign anchors include the [US Holocaust Memorial Museum](https://encyclopedia.ushmm.org/content/en/map/german-conquests-in-europe-1939-1942), [National Army Museum](https://www.nam.ac.uk/explore/struggle-north-africa-1940-43), and [US Army campaign summaries](https://history.army.mil/Research/Reference-Topics/Army-Campaigns/Brief-Summaries/World-War-II/World-War-II-Asiatic-Pacific-Theater/). Progress rates, supply coefficients and possible reversals are authored game rules, not empirical military outcome models.
