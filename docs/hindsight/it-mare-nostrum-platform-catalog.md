# Italy — In Good Faith — platform catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** platform catalog summary for 1936-01-01.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.0. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/it.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1936-01-01. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## National program

Mare Nostrum — Fast surface forces, concentrated torpedo aviation and strong logistics for Mediterranean sea control.

Historical surviving capital ships and representative inherited light forces accompany the hypothetical program. See game/data/CAMPAIGN-SOURCES.md.

## Opening register

| Ship or group | Class ID | Hulls | Service | Status |
|---|---|---:|---|---|
| Conte di Cavour | conte_di_cavour | 1 | warship | active |
| Giulio Cesare | conte_di_cavour | 1 | warship | active |
| Andrea Doria | andrea_doria | 1 | warship | active |
| Caio Duilio | andrea_doria | 1 | warship | active |
| Italia fast battleship | mare_bb29 | 2 | warship | active |
| Mediterraneo cruiser | mare_ca30 | 4 | warship | active |
| Lampo torpedo destroyer | mare_dd31 | 28 | warship | active |
| Sparviero fleet carrier | mare_cv32 | 1 | warship | active |
| Tirreno submarine | mare_ss28 | 24 | warship | active |
| Leone class (esploratori) | leone | 3 | warship | active |
| Palestro class | palestro | 4 | warship | active |
| Curtatone class | curtatone | 4 | warship | active |
| Mare Nostrum fleet oiler | ita_program_oiler | 4 | support | active |

Other merchant register: 1,041 hulls. Total merchant register: 1,041 hulls / 2,838,354 GRT.

GRT is registered volume, not naval displacement. Naval oilers and depot ships are excluded from this merchant register.

## Class specifications

### Dante Alighieri — `dante_alighieri`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1909 |
| Standard displacement (t) | 19500 |
| Speed (kn) | 22 |
| Range (km) | 8889.6 |
| Main guns | 12 × 304.8 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 254 / 38 |
| Embarked aircraft | 0 |
| Complement | 981 |
| Hull price (gold) | 9360 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Conte di Cavour class — `conte_di_cavour`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1910 |
| Standard displacement (t) | 22990 |
| Speed (kn) | 21.5 |
| Range (km) | 8889.6 |
| Main guns | 13 × 304.8 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 250 / 40 |
| Embarked aircraft | 0 |
| Complement | 1000 |
| Hull price (gold) | 11035 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Andrea Doria class — `andrea_doria`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1912 |
| Standard displacement (t) | 22960 |
| Speed (kn) | 21 |
| Range (km) | 8889.6 |
| Main guns | 13 × 304.8 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 250 / 40 |
| Embarked aircraft | 0 |
| Complement | 1000 |
| Hull price (gold) | 11021 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Francesco Caracciolo class (suspended) — `caracciolo`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1914 |
| Standard displacement (t) | 31400 |
| Speed (kn) | 28 |
| Range (km) | 14816 |
| Main guns | 8 × 381 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 303 / 50 |
| Embarked aircraft | 0 |
| Complement | 1250 |
| Hull price (gold) | 15072 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### San Giorgio class — `san_giorgio`

| Property | Value |
|---|---|
| Role / service | CA / warship |
| Design year | 1905 |
| Standard displacement (t) | 9470 |
| Speed (kn) | 23 |
| Range (km) | 11612.04 |
| Main guns | 4 × 254 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 200 / 45 |
| Embarked aircraft | 0 |
| Complement | 698 |
| Hull price (gold) | 4546 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Quarto / Bixio scouts — `quarto`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1909 |
| Standard displacement (t) | 3271 |
| Speed (kn) | 28 |
| Range (km) | 4259.6 |
| Main guns | 6 × 119.38 mm |
| Torpedo tubes | 2 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 38 |
| Embarked aircraft | 0 |
| Complement | 247 |
| Hull price (gold) | 1570 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Leone class (esploratori) — `leone`

| Property | Value |
|---|---|
| Role / service | DL / warship |
| Design year | 1917 |
| Standard displacement (t) | 1743 |
| Speed (kn) | 33 |
| Range (km) | 3833.6400000000003 |
| Main guns | 8 × 119.38 mm |
| Torpedo tubes | 6 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 204 |
| Hull price (gold) | 837 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Curtatone class — `curtatone`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1917 |
| Standard displacement (t) | 953 |
| Speed (kn) | 32 |
| Range (km) | 3333.6000000000004 |
| Main guns | 4 × 101.6 mm |
| Torpedo tubes | 6 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 117 |
| Hull price (gold) | 457 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Palestro class — `palestro`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1917 |
| Standard displacement (t) | 875 |
| Speed (kn) | 32 |
| Range (km) | 3648.44 |
| Main guns | 4 × 101.6 mm |
| Torpedo tubes | 4 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 106 |
| Hull price (gold) | 420 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Provana class — `provana`

| Property | Value |
|---|---|
| Role / service | SS / warship |
| Design year | 1915 |
| Standard displacement (t) | 762 |
| Speed (kn) | 16 |
| Range (km) | 3889.2000000000003 |
| Main guns | 2 × 76.2 mm |
| Torpedo tubes | 6 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 40 |
| Hull price (gold) | 366 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Italia fast battleship — `mare_bb29`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1929 |
| Standard displacement (t) | 35000 |
| Speed (kn) | 29 |
| Range (km) | 10186 |
| Main guns | 9 × 381 mm |
| Torpedo tubes | 0 |
| AA barrels | 2 |
| Belt / deck (mm) | 320 / 80 |
| Embarked aircraft | 0 |
| Complement | 1226 |
| Hull price (gold) | 16800 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates. |

### Mediterraneo cruiser — `mare_ca30`

| Property | Value |
|---|---|
| Role / service | CA / warship |
| Design year | 1930 |
| Standard displacement (t) | 10500 |
| Speed (kn) | 34 |
| Range (km) | 9260 |
| Main guns | 8 × 203 mm |
| Torpedo tubes | 8 |
| AA barrels | 8 |
| Belt / deck (mm) | 140 / 35 |
| Embarked aircraft | 0 |
| Complement | 368 |
| Hull price (gold) | 5040 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates. |

### Lampo torpedo destroyer — `mare_dd31`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1931 |
| Standard displacement (t) | 1850 |
| Speed (kn) | 37 |
| Range (km) | 6482 |
| Main guns | 6 × 120 mm |
| Torpedo tubes | 8 |
| AA barrels | 8 |
| Belt / deck (mm) | 15 / 4 |
| Embarked aircraft | 0 |
| Complement | 139 |
| Hull price (gold) | 888 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates. |

### Sparviero fleet carrier — `mare_cv32`

| Property | Value |
|---|---|
| Role / service | CV / warship |
| Design year | 1932 |
| Standard displacement (t) | 18000 |
| Speed (kn) | 30 |
| Range (km) | 9260 |
| Main guns | 8 × 120 mm |
| Torpedo tubes | 0 |
| AA barrels | 8 |
| Belt / deck (mm) | 60 / 15 |
| Embarked aircraft | 45 |
| Complement | 721 |
| Hull price (gold) | 8640 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates. |

### Tirreno submarine — `mare_ss28`

| Property | Value |
|---|---|
| Role / service | SS / warship |
| Design year | 1928 |
| Standard displacement (t) | 950 |
| Speed (kn) | 18 |
| Range (km) | 12038 |
| Main guns | 1 × 100 mm |
| Torpedo tubes | 6 |
| AA barrels | 2 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 48 |
| Hull price (gold) | 456 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates. |

### Impero improved battleship — `mare_bb38`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1938 |
| Standard displacement (t) | 41000 |
| Speed (kn) | 30 |
| Range (km) | 11112 |
| Main guns | 9 × 381 mm |
| Torpedo tubes | 0 |
| AA barrels | 8 |
| Belt / deck (mm) | 350 / 88 |
| Embarked aircraft | 0 |
| Complement | 1436 |
| Hull price (gold) | 19680 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates. |

### Mare Nostrum fleet oiler — `ita_program_oiler`

| Property | Value |
|---|---|
| Role / service | AO / support |
| Design year | 1930 |
| Standard displacement (t) | 6500 |
| Speed (kn) | 16 |
| Range (km) | 18520 |
| Main guns | 2 × 100 mm |
| Torpedo tubes | 0 |
| AA barrels | 8 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 228 |
| Hull price (gold) | 3120 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Hypothetical program fleet oiler. Excluded from warship and merchant totals. |

### Italy standard freighter 1922 — `it_merchant_1922`

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

### Italy standard freighter 1936 — `it_merchant_1936`

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

### Italy standard freighter 1948 — `it_merchant_1948`

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

### Fleet depot · 1922 — `it_depot_1922`

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

### Fleet oiler · 1922 — `it_oiler_1922`

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

### Fleet depot · 1936 — `it_depot_1936`

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

### Fleet oiler · 1936 — `it_oiler_1936`

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

### Fleet depot · 1950 — `it_depot_1950`

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

### Fleet oiler · 1950 — `it_oiler_1950`

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
