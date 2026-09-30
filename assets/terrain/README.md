# Geographic elevation for the 3D terrain

`elevation.bin` is an offline, engine-neutral subset of **NOAA NCEI ETOPO 2022 v1, Ice Surface** elevation. It supplies real regional hills, mountains, ice-sheet surfaces and ocean depths. It contains no rendered shading, generated mountains, projection, vertical exaggeration or engine-specific mesh data.

The grid has **1440 columns × 720 rows**, spaced **0.25°** apart, and occupies **2,073,600 bytes**. Samples are approximately 28 km apart at the equator. This is regional relief, not harbour detail or a source for vessel grounding. Continue using the game's coastline polygons as the land/water mask. Small islands and narrow peaks can fall between these samples; do not move or erase coastlines to match this coarse grid.

## Files and binary layout

- `elevation.bin`: signed **Int16**, little-endian, two bytes per sample, no header; heights in whole metres above the EGM2008 geoid. Negative values are ocean depths.
- `elevation.json`: complete grid coordinates, source URL, conversion steps, validation statistics and SHA-256 hashes.
- `elevation.hdr`: the equivalent single-band signed BIL header for geospatial tools.
- `source-metadata.json`: the original NOAA ERDDAP metadata response.
- `LICENSE.txt`: the source's redistribution terms and citation.

Rows run **north to south**; columns run **west to east**. The first sample is centered at **longitude −179.875°, latitude 89.875°**. The final sample is centered at **179.875°, −89.875°**. The cell-edge extent is −180° to 180°, −90° to 90°. Coordinates use WGS 84 longitude/latitude (EPSG:4326); heights use EGM2008 (EPSG:3855).

For zero-based column `x` and row `y`:

```text
longitude = -179.875 + x * 0.25
latitude  =   89.875 - y * 0.25
byteOffset = 2 * (y * 1440 + x)
metres = signedInt16LittleEndian(bytes, byteOffset)
```

Longitude sampling wraps between the last and first columns. Clamp latitude to the nearest stored row at the poles; there is no duplicate seam column or separate pole row. The reserved no-data value is `-32768`; **there are no missing samples** in this file. Bilinear interpolation may be used between sample centers, including across the longitude seam.

An Unreal mesh importer can read these signed values directly and apply the Equal Earth projection to each geographic sample. This file is **not** an Unreal Landscape unsigned R16 import: that path requires a separate signed-to-unsigned conversion and an explicit height scale/offset. Do not reinterpret signed samples as unsigned values. Apply any display exaggeration in the renderer, keep raw metre values intact, and drape country borders and geographic grid lines over the same terrain surface.

## Source and processing

Source: [NOAA ETOPO Global Relief Model](https://www.ncei.noaa.gov/products/etopo-global-relief-model), supplied by [NOAA OceanWatch ERDDAP](https://oceanwatch.pifsc.noaa.gov/erddap/griddap/ETOPO_2022_v1_60s.html). The selected product is the 60 arc-second **Ice Surface** grid, which includes Greenland and Antarctic ice-sheet elevations. Modern ETOPO 2022 data is not a reconstruction of the 1922 or 1936 terrain or ice cover.

The reproducible subset request is:

```text
https://oceanwatch.pifsc.noaa.gov/erddap/griddap/ETOPO_2022_v1_60s.nc?z%5B7:15:10792%5D%5B7:15:21592%5D
```

The first dimension is latitude, the second longitude. Both source axes run upward, from −89.991666…° latitude and 0.008333…° longitude. Selecting source indices `7, 22, 37, …` gives exact quarter-degree cell centers. This is **point subsampling**, not spatial averaging, so the sampled maximum is below the highest mountain peak.

The NetCDF Float32 elevation array was converted by rotating longitude columns by 720 positions into −180°…180° order, reversing latitude rows, rounding each height to the nearest whole metre, and writing little-endian signed Int16 values. The maximum rounding error is **0.5 m**. No smoothing, filling, rescaling or artistic relief was applied. No network access or data preparation is needed during gameplay.

Validation checked all 1,036,800 samples, all latitude/longitude coordinates, dimensions, row/column order, finite values and geographic reference points. The stored height range is **−10,435 to 7,108 m**. There are 352,771 positive, 683,480 negative and 549 zero-metre samples. A Pacific sample at (−139.875°, −0.125°) is −4,318 m; the Tibetan Plateau at (87.125°, 31.875°) is 4,640 m; the Andes at (−67.875°, −20.125°) are 3,654 m.

The binary SHA-256 is:

```text
eb2f4686714ac54b780ac20ce545fd2c04aaf3faac985833860b1a5ac03a4a62
```

The source permits free use and redistribution; its full terms are preserved in `LICENSE.txt`. Cite: NOAA National Centers for Environmental Information (2022), *ETOPO 2022 15 Arc-Second Global Relief Model*, [DOI: 10.25921/fd45-gt74](https://doi.org/10.25921/fd45-gt74). The bundled source metadata records the access date and original download checksum.
