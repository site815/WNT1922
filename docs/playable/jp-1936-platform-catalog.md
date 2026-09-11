# Japan — In Good Faith — platform catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** platform catalog summary for 1936-01-01.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.1. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/jp.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1936-01-01. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## National program

As Long As It's Black — One drawing per role. A carrier fleet built around common machinery and a long investment in schools.

Ten retained, unmodernized capital ships and Hosho; approximately 40 WWI-era destroyers in reserve, with a Minekaze representative fit. The 20 experimental prototype submarines have been retired and are excluded. The battleships start in commission.

## Opening register

| Ship or group | Class ID | Hulls | Service | Status |
|---|---|---:|---|---|
| Nagato | nagato | 1 | warship | active |
| Mutsu | nagato | 1 | warship | active |
| Kongo | kongo | 1 | warship | active |
| Hiei | kongo | 1 | warship | active |
| Haruna | kongo | 1 | warship | active |
| Kirishima | kongo | 1 | warship | active |
| Fuso | fuso | 1 | warship | active |
| Yamashiro | fuso | 1 | warship | active |
| Ise | ise | 1 | warship | active |
| Hyuga | ise | 1 | warship | active |
| Hosho | hosho | 1 | warship | active |
| Unryū class | unryu_t32 | 5 | warship | active |
| Unryū class | unryu_t32 | 8 | warship | building |
| Maya class | maya_t29 | 26 | warship | active |
| Maya class | maya_t29 | 12 | warship | building |
| Kaze class | kaze_t32 | 17 | warship | active |
| Kaze class | kaze_t32 | 14 | warship | building |
| Shima class | shima_t32 | 18 | warship | active |
| Shima class | shima_t32 | 7 | warship | building |
| I-series | i_series_t33 | 28 | warship | active |
| I-series | i_series_t33 | 27 | warship | building |
| WWI-era destroyers (Minekaze fit) | minekaze | 40 | warship | reserve |
| Maru depot conversions | maru_depot_t23 | 10 | support | active |
| Standard Maru | standard_maru_t23 | 500 | merchant | active |

Other merchant register: 1,646 hulls. Total merchant register: 2,146 hulls / 4,085,650 GRT. Player-approved opening composition: 500 Standard Maru and 1,646 other merchants. Historical GRT is a reference, not an estimate of the alternate-history fleet's cargo capacity.

GRT is registered volume, not naval displacement. Naval oilers and depot ships are excluded from this merchant register.

## Class specifications

### Kawachi class — `kawachi`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1907 |
| Standard displacement (t) | 21440 |
| Speed (kn) | 20 |
| Range (km) | 5000.400000000001 |
| Main guns | 12 × 304.8 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 305 / 51 |
| Embarked aircraft | 0 |
| Complement | 999 |
| Hull price (gold) | 10291 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Kongo class — `kongo`

| Property | Value |
|---|---|
| Role / service | BC / warship |
| Design year | 1911 |
| Standard displacement (t) | 27500 |
| Speed (kn) | 27.5 |
| Range (km) | 14816 |
| Main guns | 8 × 355.6 mm |
| Torpedo tubes | 8 |
| AA barrels | 0 |
| Belt / deck (mm) | 203 / 57 |
| Embarked aircraft | 0 |
| Complement | 1221 |
| Hull price (gold) | 13200 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Fuso class — `fuso`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1912 |
| Standard displacement (t) | 30600 |
| Speed (kn) | 22.5 |
| Range (km) | 14816 |
| Main guns | 12 × 355.6 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 305 / 64 |
| Embarked aircraft | 0 |
| Complement | 1193 |
| Hull price (gold) | 14688 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Ise class — `ise`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1915 |
| Standard displacement (t) | 31260 |
| Speed (kn) | 23 |
| Range (km) | 17927.36 |
| Main guns | 12 × 355.6 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 305 / 64 |
| Embarked aircraft | 0 |
| Complement | 1360 |
| Hull price (gold) | 15005 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Nagato class — `nagato`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1916 |
| Standard displacement (t) | 33800 |
| Speed (kn) | 26.5 |
| Range (km) | 10186 |
| Main guns | 8 × 408.94 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 305 / 76 |
| Embarked aircraft | 0 |
| Complement | 1333 |
| Hull price (gold) | 16224 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Tosa class — `tosa`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1918 |
| Standard displacement (t) | 39900 |
| Speed (kn) | 26.5 |
| Range (km) | 12038 |
| Main guns | 10 × 408.94 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 280 / 102 |
| Embarked aircraft | 0 |
| Complement | 1333 |
| Hull price (gold) | 19152 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Amagi class — `amagi`

| Property | Value |
|---|---|
| Role / service | BC / warship |
| Design year | 1919 |
| Standard displacement (t) | 41200 |
| Speed (kn) | 30 |
| Range (km) | 14816 |
| Main guns | 10 × 408.94 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 254 / 95 |
| Embarked aircraft | 0 |
| Complement | 1600 |
| Hull price (gold) | 19776 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Kii class (canceled) — `kii`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1921 |
| Standard displacement (t) | 42600 |
| Speed (kn) | 29.75 |
| Range (km) | 14816 |
| Main guns | 10 × 408.94 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 292 / 120 |
| Embarked aircraft | 0 |
| Complement | 1600 |
| Hull price (gold) | 20448 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Number 13 class (design study) — `number_13`

| Property | Value |
|---|---|
| Role / service | BC / warship |
| Design year | 1921 |
| Standard displacement (t) | 47500 |
| Speed (kn) | 30 |
| Range (km) | 14816 |
| Main guns | 8 × 457.2 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 330 / 127 |
| Embarked aircraft | 0 |
| Complement | 1780 |
| Hull price (gold) | 22800 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Hosho — `hosho`

| Property | Value |
|---|---|
| Role / service | CVL / warship |
| Design year | 1919 |
| Standard displacement (t) | 7470 |
| Speed (kn) | 25 |
| Range (km) | 16075 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 15 |
| Complement | 512 |
| Hull price (gold) | 3586 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Akagi (carrier conversion) — `akagi_cv`

| Property | Value |
|---|---|
| Role / service | CV / warship |
| Design year | 1923 |
| Standard displacement (t) | 36500 |
| Speed (kn) | 31 |
| Range (km) | 14816 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 152 / 57 |
| Embarked aircraft | 60 |
| Complement | 1630 |
| Hull price (gold) | 17520 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Kaga (carrier conversion) — `kaga_cv`

| Property | Value |
|---|---|
| Role / service | CV / warship |
| Design year | 1923 |
| Standard displacement (t) | 38200 |
| Speed (kn) | 27.5 |
| Range (km) | 14816 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 152 / 57 |
| Embarked aircraft | 60 |
| Complement | 1708 |
| Hull price (gold) | 18336 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Kuma class — `kuma`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1917 |
| Standard displacement (t) | 5500 |
| Speed (kn) | 36 |
| Range (km) | 16668 |
| Main guns | 7 × 139.7 mm |
| Torpedo tubes | 8 |
| AA barrels | 0 |
| Belt / deck (mm) | 64 / 29 |
| Embarked aircraft | 0 |
| Complement | 450 |
| Hull price (gold) | 2640 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Nagara class — `nagara`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1920 |
| Standard displacement (t) | 5570 |
| Speed (kn) | 36 |
| Range (km) | 16668 |
| Main guns | 7 × 139.7 mm |
| Torpedo tubes | 8 |
| AA barrels | 0 |
| Belt / deck (mm) | 64 / 29 |
| Embarked aircraft | 0 |
| Complement | 450 |
| Hull price (gold) | 2674 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Furutaka class — `furutaka`

| Property | Value |
|---|---|
| Role / service | CA / warship |
| Design year | 1921 |
| Standard displacement (t) | 8100 |
| Speed (kn) | 34.5 |
| Range (km) | 11112 |
| Main guns | 6 × 200.66 mm |
| Torpedo tubes | 12 |
| AA barrels | 0 |
| Belt / deck (mm) | 76 / 35 |
| Embarked aircraft | 0 |
| Complement | 625 |
| Hull price (gold) | 3888 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Yubari (experimental) — `yubari`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1921 |
| Standard displacement (t) | 2890 |
| Speed (kn) | 35.5 |
| Range (km) | 9260 |
| Main guns | 6 × 139.7 mm |
| Torpedo tubes | 4 |
| AA barrels | 0 |
| Belt / deck (mm) | 38 / 25 |
| Embarked aircraft | 0 |
| Complement | 328 |
| Hull price (gold) | 1387 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Minekaze class — `minekaze`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1917 |
| Standard displacement (t) | 1215 |
| Speed (kn) | 39 |
| Range (km) | 6667.200000000001 |
| Main guns | 4 × 119.38 mm |
| Torpedo tubes | 6 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 148 |
| Hull price (gold) | 583 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Momi class (2nd class) — `momi`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1918 |
| Standard displacement (t) | 770 |
| Speed (kn) | 36 |
| Range (km) | 5556 |
| Main guns | 3 × 119.38 mm |
| Torpedo tubes | 4 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 110 |
| Hull price (gold) | 370 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Kaichu type — `kaichu`

| Property | Value |
|---|---|
| Role / service | SS / warship |
| Design year | 1917 |
| Standard displacement (t) | 740 |
| Speed (kn) | 16 |
| Range (km) | 7408 |
| Main guns | 1 × 76.2 mm |
| Torpedo tubes | 6 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 44 |
| Hull price (gold) | 355 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Unryū class — `unryu_t32`

| Property | Value |
|---|---|
| Role / service | CV / warship |
| Design year | 1932 |
| Standard displacement (t) | 23990 |
| Speed (kn) | 30.5 |
| Range (km) | 25000 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 24 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 90 |
| Complement | 960 |
| Hull price (gold) | 9900 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Maya class — `maya_t29`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1925 |
| Standard displacement (t) | 7540 |
| Speed (kn) | 21.5 |
| Range (km) | 12000 |
| Main guns | 18 × 140 mm |
| Torpedo tubes | 12 |
| AA barrels | 42 |
| Belt / deck (mm) | 0 / 25 |
| Embarked aircraft | 5 |
| Complement | 440 |
| Hull price (gold) | 3300 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Kaze class — `kaze_t32`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1932 |
| Standard displacement (t) | 2970 |
| Speed (kn) | 35 |
| Range (km) | 25000 |
| Main guns | 6 × 140 mm |
| Torpedo tubes | 8 |
| AA barrels | 14 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 160 |
| Hull price (gold) | 1350 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### I-series — `i_series_t33`

| Property | Value |
|---|---|
| Role / service | SS / warship |
| Design year | 1933 |
| Standard displacement (t) | 1600 |
| Speed (kn) | 16 |
| Range (km) | 30000 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 8 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 50 |
| Hull price (gold) | 1400 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Shima class — `shima_t32`

| Property | Value |
|---|---|
| Role / service | DE / warship |
| Design year | 1932 |
| Standard displacement (t) | 1220 |
| Speed (kn) | 25.5 |
| Range (km) | 25000 |
| Main guns | 3 × 140 mm |
| Torpedo tubes | 0 |
| AA barrels | 11 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 65 |
| Hull price (gold) | 480 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Standard Maru — `standard_maru_t23`

| Property | Value |
|---|---|
| Role / service | AK / merchant |
| Design year | 1923 |
| Standard displacement (t) | 4700 |
| Speed (kn) | 13 |
| Range (km) | 12000 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 34 |
| Hull price (gold) | 530 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Maru depot conversion — `maru_depot_t23`

| Property | Value |
|---|---|
| Role / service | AD / support |
| Design year | 1923 |
| Standard displacement (t) | 4700 |
| Speed (kn) | 13 |
| Range (km) | 12000 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 34 |
| Hull price (gold) | 530 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | Existing tender/depot conversions with heavy derricks. Kept outside merchant shipping and warship totals. |

### Japan standard freighter 1922 — `jp_merchant_1922`

| Property | Value |
|---|---|
| Role / service | AK / merchant |
| Design year | 1922 |
| Standard displacement (t) | 4800 |
| Speed (kn) | 11 |
| Range (km) | 12038 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 48 |
| Hull price (gold) | 1344 |
| Registered merchant capacity (GRT) | 3500 |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Provisional standardized replacement freighter. Registered capacity is separate from displacement; no opening hulls are added. |

### Japan standard freighter 1936 — `jp_merchant_1936`

| Property | Value |
|---|---|
| Role / service | AK / merchant |
| Design year | 1936 |
| Standard displacement (t) | 7000 |
| Speed (kn) | 13 |
| Range (km) | 16668 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 60 |
| Hull price (gold) | 1960 |
| Registered merchant capacity (GRT) | 5000 |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Provisional standardized replacement freighter. Registered capacity is separate from displacement; no opening hulls are added. |

### Japan standard freighter 1948 — `jp_merchant_1948`

| Property | Value |
|---|---|
| Role / service | AK / merchant |
| Design year | 1948 |
| Standard displacement (t) | 9500 |
| Speed (kn) | 15 |
| Range (km) | 20372 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 60 |
| Hull price (gold) | 2660 |
| Registered merchant capacity (GRT) | 7000 |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Provisional standardized replacement freighter. Registered capacity is separate from displacement; no opening hulls are added. |

### Fleet depot · 1922 — `jp_depot_1922`

| Property | Value |
|---|---|
| Role / service | AD / support |
| Design year | 1922 |
| Standard displacement (t) | 5500 |
| Speed (kn) | 14 |
| Range (km) | 16668 |
| Main guns | 2 × 100 mm |
| Torpedo tubes | 0 |
| AA barrels | 2 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 300 |
| Hull price (gold) | 3400 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Provisional 1922 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added. |

### Fleet oiler · 1922 — `jp_oiler_1922`

| Property | Value |
|---|---|
| Role / service | AO / support |
| Design year | 1922 |
| Standard displacement (t) | 6500 |
| Speed (kn) | 14 |
| Range (km) | 16668 |
| Main guns | 2 × 100 mm |
| Torpedo tubes | 0 |
| AA barrels | 2 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 160 |
| Hull price (gold) | 2800 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Provisional 1922 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added. |

### Fleet depot · 1936 — `jp_depot_1936`

| Property | Value |
|---|---|
| Role / service | AD / support |
| Design year | 1936 |
| Standard displacement (t) | 6500 |
| Speed (kn) | 16 |
| Range (km) | 18520 |
| Main guns | 2 × 100 mm |
| Torpedo tubes | 0 |
| AA barrels | 4 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 330 |
| Hull price (gold) | 4100 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Provisional 1936 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added. |

### Fleet oiler · 1936 — `jp_oiler_1936`

| Property | Value |
|---|---|
| Role / service | AO / support |
| Design year | 1936 |
| Standard displacement (t) | 7500 |
| Speed (kn) | 16 |
| Range (km) | 18520 |
| Main guns | 2 × 100 mm |
| Torpedo tubes | 0 |
| AA barrels | 4 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 190 |
| Hull price (gold) | 3500 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Provisional 1936 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added. |

### Fleet depot · 1950 — `jp_depot_1950`

| Property | Value |
|---|---|
| Role / service | AD / support |
| Design year | 1950 |
| Standard displacement (t) | 7500 |
| Speed (kn) | 18 |
| Range (km) | 20372 |
| Main guns | 2 × 100 mm |
| Torpedo tubes | 0 |
| AA barrels | 4 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 360 |
| Hull price (gold) | 4800 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Provisional 1950 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added. |

### Fleet oiler · 1950 — `jp_oiler_1950`

| Property | Value |
|---|---|
| Role / service | AO / support |
| Design year | 1950 |
| Standard displacement (t) | 8500 |
| Speed (kn) | 18 |
| Range (km) | 20372 |
| Main guns | 2 × 100 mm |
| Torpedo tubes | 0 |
| AA barrels | 4 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 220 |
| Hull price (gold) | 4200 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Provisional 1950 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added. |
