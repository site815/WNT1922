# Recognition drawing consistency rules

This is the production and review standard for WNT1922 recognition artwork. Catalog specifications and campaign state determine gameplay. A drawing is a visual reference, not a source of combat statistics or an engineering certification.

The US Navy's [ONI-201 recognition manual](https://www.ibiblio.org/hyperwar/USN/ref/ONI/ONI-201/index.html) emphasizes the overall mass of hull and superstructure, the beam silhouette for ships, and multiple views for aircraft. WNT1922 uses that recognition approach. Original game illustrations are not historical ONI publications or endorsements.

## Identity before appearance

1. Record the exact platform ID, campaign where necessary, nation, reference date and configuration before sourcing or drawing.
2. Check the live catalog's fitted equipment. Reserved positions and possible upgrades are not fitted equipment. Do not paint later radar, weaponry or aircraft onto an opening fit without an explicitly identified historical reference configuration.
3. An identical physical model may share one asset across services and campaigns. Different variants may share a reference drawing only when every mapping explains the depicted variant and the difference. A radically different hull, engine arrangement, wing, float installation or main battery needs another drawing.
4. Campaign-specific mappings override generic mappings. In particular, the 1922 gun-armed `courageous_llc` and its 1936 carrier representation must not display the same silhouette.
5. ALB Raiden is the twin-engine Type 39, not Mitsubishi J2M; ALB Shinden is a single-engine swept-wing jet, not the historical J7W canard; ALB Maya is the six-turret light cruiser, not the Takao-class heavy cruiser. Tillman, Columbia and Republic are separate game classes.
6. Fictional geometry that the catalog does not define is an illustration choice. Record this distinction; do not present invented dimensions, service dates or engineering results as sourced facts.

## Shared visual treatment

- White inspection cards, dark drawing marks, no scenery, water, dramatic lighting, shadows, weathering, flags, logos or decorative frames in new illustrations.
- New SVG and raster sheets have opaque white backgrounds and crisp black silhouette masses with limited white knockout detail. Light antialiasing is permitted. Keep meaningful detail legible at thumbnail size.
- No titles, statistics, labels or scale numbers painted into new images. The UI supplies the live title, configuration, view list, provenance and applicable dimensions outside the image.
- Preserve aspect ratio and the full verified drawing area; never stretch, crop off a hull or cut off a propeller to fill a card. Prefer a small, even margin.
- Historical source sheets may retain their original annotations, paper tone and orientation. Do not mirror their lettering or invent missing views. An accurately sourced colored line drawing may be displayed with CSS grayscale; preserve its original file and disclose that display treatment.
- Ship-only images must not contain decorative aircraft sheets or unrelated classes. A small aircraft on a ship drawing represents a handling facility, not a second recognition asset.

## Ships

- A true beam profile is required for new ship drawings. Prefer port side with bow left. A deck plan is optional; bow/stern in both views must face the same direction and represent the same hull.
- For new two-view sheets, align hull endpoints within 1% of the drawing width and principal turret, funnel, bridge and aircraft-handling stations within 3%. Reject a contradictory plan; correct it before accepting the two-view sheet.
- For shared-geometry SVG sheets, use one longitudinal transform per equipment station for both views. Test the actual rendered element attributes against that geometry, not only metadata assertions. Hull endpoints must coincide exactly at the common scale.
- Bridges, funnels, masts, turret pedestals, deckhouses and carrier galleries must connect to their supporting structure. Keep equipment footprints within the hull or an explicitly drawn platform. Check longitudinal and lateral spacing; a clear profile alone can hide overlapping deck equipment.
- Check the hull type, bow/stern form, number and placement of main turrets, barrels per turret in the plan, funnels, masts, flight deck, island and catapults. Do not confuse torpedo tubes with guns or double mirrored centerline mounts.
- Keep broadside-overlapping barrels physically plausible; a profile may hide parallel barrels, but the accompanying plan must make the main battery count unambiguous.
- Where specified, respect superfiring order, centerline versus wing arrangements and clear gun arcs. Minor railings, rigging and small AA detail may be simplified; do not claim a recognition silhouette is a mount-by-mount ordnance plan.
- A submarine remains a submarine; an oiler/workshop support hull remains a support hull. Sharing a decade's common support design is permitted when the catalog defines the shared physical generation.
- Historical reference drawings show the source's actual date and configuration. A source's later refit is not an assertion that the game platform already carries those changes.

## Aircraft

- Prefer plan, port profile and front views of the same configuration. The plan normally points upward and the profile left. Historical views retain their source orientation.
- Check engine count and position, propulsion type, wing arrangement/sweep, tail form, crew/canopy, landing gear or floats, and the recognition-critical weapons or external stores.
- One-, two- and four-engine aircraft must remain visually distinct. A propeller aircraft cannot stand for a jet. Biplanes, monoplanes, flying boats, floatplanes and landplanes cannot be interchanged without an explicitly applicable same-airframe configuration.
- Use one consistent gear state and loadout across a new sheet. A float kit is a separate configuration, not an unexplained extra set of wheels or floats in only one view.
- Plan and front views must agree on engines, nacelles, wingtip form and tail. A bubble canopy must not become a long multi-seat greenhouse. Do not add national insignia.
- Catalog dimensions guide proportions; independent historical source views may use different printed scales. Do not add a numerical scale when the scan's scale is unverified.

## Sources, rights and folders

The live index is `assets/recognition/index.json`. Its registries and image files remain below `assets/recognition/`, grouped into historical ships, historical aircraft and original game illustrations. Registries are read directly; there is no atlas, image converter, exporter or generated game database.

Historical entries retain the creator, title, file-specific description page, original media URL, license and license URL, source configuration, modifications, byte count and SHA-256. Preserve required credit and share-alike terms for each file. Public visibility alone is not permission to redistribute.

Original entries retain the final vector authoring brief or image-generation prompt, any input study/reference and review notes. Shared-geometry vectors retain their station or projection metadata inside the directly editable SVG. Original project artwork follows the owner's [project licensing notice](../../LICENSE.md); third-party sources keep their separate terms. A historical source used as an edit target must have rights compatible with the resulting derivative.

Unaccepted studies and unused research candidates are not production mappings. Preserve the three original transfer studies in `studies/`; keep new rejected candidates and research working files in `.build/recognition/`. Never mark an image accepted solely because its filename, prompt or model-generated description claims the right identity.

## Required review and checks

For each final asset:

1. Open the actual pixels or SVG rendering, not only its metadata or prompt.
2. Compare its identity, date and distinctive features against the catalog and its source. Review each shared mapping and campaign override.
3. Check the number/arrangement of the main recognition features, cross-view agreement, margins, orientation, legibility and absence of unwanted lettering in new art.
4. Record a factual acceptance note with reviewed date, limitations and reference configuration. Record the exact accepted file's hash and byte count.
5. Run `node tools/check-recognition.mjs`. Missing or conflicting coverage, unknown platforms, unaccepted entries, missing source/rights fields, unsafe paths, broken files and changed hashes must fail verification.
6. Run catalog/asset checks and relevant regression tests, inspect both ship and aircraft cards at normal and expanded sizes, and test the packaged executable before release.

## Editing without an artwork build step

The game fetches the registry and the referenced file directly from local URLs. Replacing an accepted file or editing its registry requires no conversion, asset compilation or atlas build. Update the recorded hash after review and reopen the inspection to load the current file.

The repository launcher passes its `assets/recognition` directory as an explicit local recognition override. This confines live artwork changes to that directory. The standalone portable uses its bundled artwork when no override is supplied. Rebuilding the portable is required to distribute updated embedded files, but not to inspect artwork changes from the working repository.
