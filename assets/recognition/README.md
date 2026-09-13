# Platform recognition standard

These illustrations support recognition and class inspection. The editable game specifications remain authoritative. Recognition sheets are not engineering plans, and artwork never changes combat values.

## Current work, preserved for the next computer

As of v0.32.1, the gameplay/UI update is completed and tested. The artwork pass was interrupted for the computer transfer. Only three original studies exist: [Raiden](studies/raiden-type39.png), [Tillman](studies/tillman-class.png), and [Maya](studies/maya-class.png). They are preserved in Git and the portable payload but are **not yet connected to the game UI**. None is approved as a final production recognition asset. The generation brief and review notes are in [studies/README.md](studies/README.md).

The inventory contains 165 distinct ship-class IDs and 186 aircraft IDs across the two campaigns. Identical physical models and common support hull generations can share drawings. The remaining work is to source and license historical drawings, generate missing scenario drawings, review all images, create the live recognition registry, integrate lazy-loaded drawings into class/aircraft inspection, validate complete coverage, then build, test and manually push. `catalog/common/recognition.md` is a planned registry and does not exist yet; no historical drawings were downloaded or added before the interruption.

The standard below is the agreed implementation direction for that unfinished pass. Its future mapping and artwork checks are not claimed to be implemented yet.

## Appearance

- White field, black silhouettes and restrained line detail. No scenery, shadows, weathering, national insignia or decorative borders.
- Ships: port-side profile with the bow to the left, plus a deck plan where available. New drawings align both hulls at the same length and stations. Small bow views are optional. Preserve the number and placement of main turrets, funnels, masts and aircraft facilities. Avoid dense rigging that disappears at thumbnail size.
- Aircraft: plan, side and front views where the source supplies them. Preserve engine count, wing arrangement, tail shape, undercarriage and floats. Never reuse a single-engine silhouette for a twin-engine type.
- A consistent white card, title, source caption and scale information are drawn by the UI. Historical source sheets can retain their original annotations. New illustrations contain no text, so catalog edits do not leave obsolete statistics painted into an image.
- Images preserve aspect ratio and use their whole verified drawing area. A profile-only historical drawing is labeled as such; missing views are not invented and presented as archival evidence.

## Identity and reuse

Every authored ship class and aircraft entry resolves through `catalog/common/recognition.md`. An identical physical model in another service may share its drawing. Different models may share only when the entry explicitly identifies the reference configuration. The common national support designs share their decade's physical design. Fictional programs receive original drawings based on their catalog fit, with unspecified cosmetic details treated as illustration choices.

Historical and scenario subjects must remain distinguishable. The ALB Raiden is the catalog's twin-engine aircraft, not the historical Mitsubishi J2M. ALB Maya is the six-turret light cruiser, not the Takao-class heavy cruiser. Tillman, Columbia and Republic are three separate game classes. Later radar, guns and aircraft must not appear merely because a familiar historical namesake carried them.

## Source rights and storage

Historical material uses file-specific public-domain or commercially reusable Creative Commons sources. Store its author, original file page, license URL, modifications, byte count and SHA-256 in the live recognition document. Credit and source links are available in the in-game asset notices. Attribution and share-alike requirements apply to those specific artwork files; no asset is silently relicensed as game code.

Original illustrations use the built-in image-generation tool. Preserve the accepted file in this directory and its final prompt in the recognition document. Review the result against the catalog's distinctive features before marking it accepted. Original outputs can contain artistic interpretation; they are not claimed to be historical ONI publications or endorsed by ONI.

The game loads files locally and lazily. Artwork stays on the rendering side and does not travel in authoritative simulation snapshots. No runtime image network requests or external image service are required. Unused research candidates belong in `.build/recognition`, not in the distributed assets.

## Updating

1. Edit the platform's specification document.
2. Update or replace its recognition entry and inspect the drawing at thumbnail and full inspection sizes.
3. Run catalog and asset checks. Missing mappings, broken file references and unreviewed file hashes must fail validation.
4. Build and inspect the portable EXE before a manual source push or requested Release publication.

Style reference: the US Navy's [ONI-201 recognition manual](https://www.ibiblio.org/hyperwar/USN/ref/ONI/ONI-201/index.html) emphasizes simplified overall form, a ship's beam silhouette and multiple aircraft views. Our sheets are game illustrations and sourced historical references, not facsimiles of a complete wartime manual.
