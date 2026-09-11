# Portable 0.18.2 validation

Validated 12 September 2026 (Asia/Seoul). Save format 10; new campaigns only.

- 193 applicable regression checks passed across the release run and the targeted rerun for updated civilian/support expectations. Old-save migration and unbounded multi-decade tests remain excluded by the documented release command.
- All 28 generated national catalogs match the two campaigns: 144 supplemental class checks, 120 aircraft checks and 341 opening-formation checks.
- Fleet/convoy continuity: all seven navies over seven peacetime days, plus three-day regression traces across both campaigns. No minute-to-minute motion exceeded sailing speed. Map icon offsets also remain stable when drawing order changes.
- Asset audit passed: 19 inputs, including 15 music tracks, public-domain political maps, and the pinned runtime/source archives.
- Windows package verification passed: 279 files, correct source/module allowlist, notices and runtime source hashes.
- Actual portable executable passed USA/In Good Faith and United Kingdom/The Treaty System checks: launch without Node on PATH, renderer sandbox, map, fleet order, construction order, funding, one-minute simulation, music, credits, save on close and reopen. No captured page/console errors.

Artifact: `dist/WNT1922-0.18.2-win-x64.zip`.

SHA-256: `857e0da1f4410242f1df68fc5745fa60e6a36ef33a8e709e352c5a882bab853d`.

Operational air warfare and the revised aircraft roster remain unfinished and are excluded. [Session record](../docs/reviews/SESSION-2026-09-12.md) · [Full catalog review](../docs/reviews/catalog-14-starts.html).
