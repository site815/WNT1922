# Geographic elevation for the 3D terrain

The offline grid contains real elevation from **NOAA NCEI ETOPO 2022 v1, Ice Surface**. It supplies the terrain mesh's heights; it is not a rendered world-map picture.

The grid is **4320 × 2160**, spaced **5 arc-minutes (1/12°)** apart: approximately **9.3 km** at the equator. Its 9,331,200 samples are nine times the previous grid's sample count. All 1,036,800 original quarter-degree reference samples remain exactly unchanged at their corresponding locations. The native mesh uses a quarter-degree surface subdivision, compared with half-degree previously; source sampling and mesh spacing are distinct. This is regional terrain, not reconstructed harbor detail.

## Files and layout

- `elevation.bin`: 18,662,400 bytes, signed Int16 little-endian, whole metres above EGM2008, no header. Negative values are ocean depths.
- `elevation.json`: coordinates, full provenance, checksums, statistics and unchanged reference samples.
- `elevation.hdr`: equivalent signed BIL header for geospatial tools.
- `source-metadata.json`: NOAA dataset metadata.
- `LICENSE.txt`: source redistribution terms and citation.

Rows run north to south and columns west to east. Cell centers start at **(-179.9583333333°, 89.9583333333°)**. Longitude wraps with no repeated seam column; latitude clamps to the closest sampled polar row. There are no missing samples. This signed dataset must not be interpreted as an unsigned Unreal Landscape R16 file.

## Source and reproducibility

Source: [NOAA ETOPO Global Relief Model](https://www.ncei.noaa.gov/products/etopo-global-relief-model), distributed by [NOAA OceanWatch ERDDAP](https://oceanwatch.pifsc.noaa.gov/erddap/info/ETOPO_2022_v1_60s/index.html), accessed 2026-10-04. This is the 60 arc-second ice-surface source, point-subsampled every fifth cell. Ice-sheet elevations describe modern ETOPO 2022, not historical ice cover.

Download the subset to a working file:

```text
https://oceanwatch.pifsc.noaa.gov/erddap/griddap/ETOPO_2022_v1_60s.nc?z%5B2:5:10797%5D%5B2:5:21597%5D
```

Then run `node tools/prepare-elevation.mjs <downloaded-file.nc>` from the repository. The dependency-free converter validates the complete latitude/longitude axes, rotates longitudes from 0–360 to -180–180, reverses rows, rounds to signed whole metres and checks every prior aligned sample. No filling, generated peaks, smoothing or vertical exaggeration is applied to the data. Maximum rounding error is **0.5 m**; sampled heights range from **-10,649 to 7,712 m**. Narrow peaks may fall between samples.

The binary SHA-256 is `0b1b1b22efa1e4bebb3cd7f730eb77ffa2206f914f806ba8d781ee6a9ec05a4f`. The original NetCDF hash and download details are in `elevation.json`.

Rendering relief is a separate display setting. Coastline polygons continue to define land and navigable water; this elevation grid must not move coastlines or determine ship grounding. All data remains local during gameplay.
