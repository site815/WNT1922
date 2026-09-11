# Beta distribution

Updated for release 0.18.1, 11 September 2026.

The first distribution is a portable Windows x64 ZIP with its own runtime. Extract everything and open WNT1922.exe; retain DLLs, resources, notices and runtime source archives. Saves live in the user's application-data folder. See [building and distribution](building.md).

The source repository is private. GitHub Actions can build a downloadable Windows artifact from version tags or manual runs. This does not publish a storefront or make the source public. Keep the repository private unless the owner chooses otherwise; no open-source license has been assigned to the original game.

For an initial external test group, a [Restricted itch.io page](https://itch.io/docs/creators/access-control) remains an option: it supports private downloads and individual download keys. No itch.io page has been created. Begin with a small invited cohort and ask for game version, campaign, nation, reproduction steps, resolution/scaling, expected and actual behavior, and an optional exported save. The game collects no telemetry.

The earlier political-map license restriction was removed by replacing the geometry with public-domain Natural Earth data and independent approximate overlays. Music permits commercial redistribution with CC BY 4.0 attribution; the runtime retains its component terms. [Asset audit](asset-audit.md) · [Notices](../THIRD_PARTY_NOTICES.md). Keep these materials intact when distributing builds.

The beta is unsigned. Code signing and an installer can follow if broader distribution warrants them. A browser release would still need browser-based save persistence and relative asset paths for hosting; the Windows package preserves the existing save server locally.
