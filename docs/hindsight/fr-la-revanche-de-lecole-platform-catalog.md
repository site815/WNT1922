# France — In Good Faith — platform catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** platform catalog summary for 1936-01-01.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.0. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/fr.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1936-01-01. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## National program

La Revanche de l'École — A modern Jeune École: submarine flotillas, torpedo destroyers, fast cruisers and a practiced naval air arm.

Historical surviving capital ships and representative inherited light forces accompany the hypothetical program. See game/data/CAMPAIGN-SOURCES.md.

## Opening register

| Ship or group | Class ID | Hulls | Service | Status |
|---|---|---:|---|---|
| Courbet | courbet | 1 | warship | active |
| Jean Bart | courbet | 1 | warship | reserve |
| Paris | courbet | 1 | warship | active |
| Bretagne | bretagne | 1 | warship | active |
| Provence | bretagne | 1 | warship | active |
| Lorraine | bretagne | 1 | warship | active |
| Bearn | bearn_cv | 1 | warship | active |
| École ocean submarine | ecole_ss28 | 18 | warship | active |
| École ocean submarine | ecole_ss28 | 18 | warship | active |
| Vengeur torpedo destroyer | ecole_dd30 | 16 | warship | active |
| Vengeur torpedo destroyer | ecole_dd30 | 16 | warship | active |
| Éclaireur fast cruiser | ecole_cl29 | 3 | warship | active |
| Éclaireur fast cruiser | ecole_cl29 | 3 | warship | active |
| Liberté carrier | ecole_cv31 | 1 | warship | active |
| Liberté carrier | ecole_cv31 | 1 | warship | active |
| Duguay-Trouin class | duguay_trouin | 3 | warship | active |
| Chacal class (contre-torpilleur) | chacal | 6 | warship | active |
| Requin class | requin | 9 | warship | active |
| La Revanche de l'École fleet oiler | fra_program_oiler | 4 | support | active |

Other merchant register: 1,382 hulls. Total merchant register: 1,382 hulls / 2,989,386 GRT.

GRT is registered volume, not naval displacement. Naval oilers and depot ships are excluded from this merchant register.

## Class specifications

### Courbet class — `courbet`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1910 |
| Standard displacement (t) | 22200 |
| Speed (kn) | 21 |
| Range (km) | 7778.400000000001 |
| Main guns | 12 × 304.8 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 270 / 70 |
| Embarked aircraft | 0 |
| Complement | 1115 |
| Hull price (gold) | 10656 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Bretagne class — `bretagne`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1912 |
| Standard displacement (t) | 23200 |
| Speed (kn) | 20 |
| Range (km) | 8704.4 |
| Main guns | 10 × 340.36 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 270 / 70 |
| Embarked aircraft | 0 |
| Complement | 1124 |
| Hull price (gold) | 11136 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Normandie class (suspended) — `normandie`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1913 |
| Standard displacement (t) | 25200 |
| Speed (kn) | 21 |
| Range (km) | 12038 |
| Main guns | 12 × 340.36 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 300 / 70 |
| Embarked aircraft | 0 |
| Complement | 1200 |
| Hull price (gold) | 12096 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Bearn (carrier conversion) — `bearn_cv`

| Property | Value |
|---|---|
| Role / service | CV / warship |
| Design year | 1923 |
| Standard displacement (t) | 22146 |
| Speed (kn) | 21.5 |
| Range (km) | 12964 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 83 / 25 |
| Embarked aircraft | 35 |
| Complement | 875 |
| Hull price (gold) | 10630 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Edgar Quinet class — `edgar_quinet`

| Property | Value |
|---|---|
| Role / service | CA / warship |
| Design year | 1905 |
| Standard displacement (t) | 13850 |
| Speed (kn) | 23 |
| Range (km) | 9445.2 |
| Main guns | 14 × 193.04 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 150 / 65 |
| Embarked aircraft | 0 |
| Complement | 892 |
| Hull price (gold) | 6648 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Duguay-Trouin class — `duguay_trouin`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1920 |
| Standard displacement (t) | 7250 |
| Speed (kn) | 33 |
| Range (km) | 8334 |
| Main guns | 8 × 154.94 mm |
| Torpedo tubes | 12 |
| AA barrels | 0 |
| Belt / deck (mm) | 20 / 20 |
| Embarked aircraft | 0 |
| Complement | 578 |
| Hull price (gold) | 3480 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Arabe class — `arabe`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1916 |
| Standard displacement (t) | 690 |
| Speed (kn) | 33 |
| Range (km) | 3704 |
| Main guns | 3 × 119.38 mm |
| Torpedo tubes | 4 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 82 |
| Hull price (gold) | 331 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Chacal class (contre-torpilleur) — `chacal`

| Property | Value |
|---|---|
| Role / service | DL / warship |
| Design year | 1922 |
| Standard displacement (t) | 2126 |
| Speed (kn) | 35.5 |
| Range (km) | 5556 |
| Main guns | 5 × 129.54 mm |
| Torpedo tubes | 6 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 195 |
| Hull price (gold) | 1020 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Lagrange class — `lagrange`

| Property | Value |
|---|---|
| Role / service | SS / warship |
| Design year | 1913 |
| Standard displacement (t) | 920 |
| Speed (kn) | 16.5 |
| Range (km) | 7963.6 |
| Main guns | 2 × 76.2 mm |
| Torpedo tubes | 8 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 47 |
| Hull price (gold) | 442 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Requin class — `requin`

| Property | Value |
|---|---|
| Role / service | SS / warship |
| Design year | 1922 |
| Standard displacement (t) | 1150 |
| Speed (kn) | 15 |
| Range (km) | 14260.400000000001 |
| Main guns | 1 × 99.06 mm |
| Torpedo tubes | 10 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 54 |
| Hull price (gold) | 552 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### École ocean submarine — `ecole_ss28`

| Property | Value |
|---|---|
| Role / service | SS / warship |
| Design year | 1928 |
| Standard displacement (t) | 1450 |
| Speed (kn) | 19 |
| Range (km) | 16668 |
| Main guns | 1 × 100 mm |
| Torpedo tubes | 8 |
| AA barrels | 2 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 73 |
| Hull price (gold) | 696 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates. |

### Vengeur torpedo destroyer — `ecole_dd30`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1930 |
| Standard displacement (t) | 2100 |
| Speed (kn) | 37 |
| Range (km) | 9260 |
| Main guns | 5 × 138 mm |
| Torpedo tubes | 12 |
| AA barrels | 8 |
| Belt / deck (mm) | 12 / 3 |
| Embarked aircraft | 0 |
| Complement | 158 |
| Hull price (gold) | 1008 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates. |

### Éclaireur fast cruiser — `ecole_cl29`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1929 |
| Standard displacement (t) | 7200 |
| Speed (kn) | 35 |
| Range (km) | 13890 |
| Main guns | 9 × 152 mm |
| Torpedo tubes | 9 |
| AA barrels | 2 |
| Belt / deck (mm) | 80 / 20 |
| Embarked aircraft | 0 |
| Complement | 253 |
| Hull price (gold) | 3456 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates. |

### Liberté carrier — `ecole_cv31`

| Property | Value |
|---|---|
| Role / service | CV / warship |
| Design year | 1931 |
| Standard displacement (t) | 16500 |
| Speed (kn) | 31 |
| Range (km) | 12964 |
| Main guns | 8 × 130 mm |
| Torpedo tubes | 0 |
| AA barrels | 8 |
| Belt / deck (mm) | 65 / 16 |
| Embarked aircraft | 48 |
| Complement | 674 |
| Hull price (gold) | 7920 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates. |

### École submarine, 1937 — `ecole_ss37`

| Property | Value |
|---|---|
| Role / service | SS / warship |
| Design year | 1937 |
| Standard displacement (t) | 1700 |
| Speed (kn) | 20 |
| Range (km) | 20372 |
| Main guns | 1 × 100 mm |
| Torpedo tubes | 10 |
| AA barrels | 8 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 85 |
| Hull price (gold) | 816 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Alternate-history program, authored for In Good Faith. Provisional engineering and procurement estimates. |

### La Revanche de l'École fleet oiler — `fra_program_oiler`

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

### France standard freighter 1922 — `fr_merchant_1922`

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

### France standard freighter 1936 — `fr_merchant_1936`

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

### France standard freighter 1948 — `fr_merchant_1948`

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

### Fleet depot · 1922 — `fr_depot_1922`

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

### Fleet oiler · 1922 — `fr_oiler_1922`

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

### Fleet depot · 1936 — `fr_depot_1936`

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

### Fleet oiler · 1936 — `fr_oiler_1936`

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

### Fleet depot · 1950 — `fr_depot_1950`

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

### Fleet oiler · 1950 — `fr_oiler_1950`

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
