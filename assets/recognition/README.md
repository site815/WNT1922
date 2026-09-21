# Recognition artwork

The game reads `index.json`, its registries and the referenced artwork directly. Ship and aircraft inspection cards provide a thumbnail, expanded view, configuration notes and source credits. Artwork does not affect simulation statistics.

## Folders

- `ships/`: historical ship references and their registry.
- `aircraft/`: historical aircraft references, grouped by nation, and supplemental registries.
- `originals/`: directly editable SVG illustrations for game designs and source-based original diagrams. Each registry distinguishes these from archival artwork.
- `studies/`: three preserved, unaccepted bitmap studies. They are development history and are not live platform mappings.

Identical physical models can share an entry with explicit configuration notes. Different campaign configurations use campaign-qualified mappings, including the gun-armed and carrier versions of Courageous. Historical references may depict a later refit; their captions identify that limitation. Source-based original diagrams identify their references and inferred details and are not presented as historical publications.

## Edit an illustration

1. Find its platform ID in the registries listed by `index.json`.
2. Edit the SVG or replace the referenced image beneath this folder. Shared-geometry SVGs retain their airframe projections or equipment stations in embedded metadata.
3. Inspect the rendering against the catalog and [consistency rules](RULESET.md). Update the byte count, SHA-256 and dated acceptance note after review.
4. Reopen the inspection card. Registry and image requests bypass the cache, so no conversion, atlas generation or artwork build is required.

`Play-WNT1922.cmd` passes this repository's recognition folder to the portable host. This live override is confined to recognition assets. A standalone downloaded EXE uses its embedded copy; rebuild that EXE when distributing changed embedded artwork.

## Validation and rights

Run `node tools/check-recognition.mjs` for complete platform coverage, campaign mappings, safe local files, accepted reviews, source/license fields, hashes and crop bounds. Run the recognition geometry tests for original ship equipment alignment and aircraft projections. `node tools/audit-assets.mjs` includes recognition verification in the release gate.

Each historical file retains its creator, provenance, redistribution terms and modifications. Original illustrations follow the [project licensing notice](../../LICENSE.md). Source diagrams and archival photographs consulted for factual geometry remain separate from newly authored illustrations. Never infer redistribution rights from public visibility or replace an exact type with an unrelated silhouette.

The visual approach follows the US Navy's [ONI-201 manual](https://www.ibiblio.org/hyperwar/USN/ref/ONI/ONI-201/index.html). WNT1922's original artwork is not an ONI publication or endorsement.
