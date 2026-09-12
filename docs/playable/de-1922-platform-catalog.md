# Germany — The Treaty System — platform catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** platform catalog summary for 1922-02-06.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.19.0. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/de.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1922-02-06. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## National program

The restricted Reichsmarine — The historical Reichsmarine begins under Versailles, outside Washington. Old battleships, a small personnel ceiling and a submarine ban constrain every ambition.

Opening roster from data/scenarios/campaign_1922.json and national base catalogs. Incomplete hulls remain under construction; see campaign source notes.

## Opening register

| Ship or group | Class ID | Hulls | Service | Status |
|---|---|---:|---|---|
| Hannover | deutschland_bb | 1 | warship | active |
| Schlesien | deutschland_bb | 1 | warship | active |
| Schleswig-Holstein | deutschland_bb | 1 | warship | active |
| Braunschweig | braunschweig_bb | 1 | warship | active |
| Elsass | braunschweig_bb | 1 | warship | active |
| Hessen | braunschweig_bb | 1 | warship | active |
| Preussen | braunschweig_bb | 1 | warship | reserve |
| Lothringen | braunschweig_bb | 1 | warship | reserve |
| Emden | emden_cl | 1 | warship | building |
| Gazelle class | gazelle_cl | 4 | warship | reserve |
| Bremen class | bremen_cl | 2 | warship | active |
| V1 class | v1_dd | 12 | warship | active |
| A-boat class | a_boat_tb | 12 | warship | active |

Other merchant register: 1,090 hulls. Total merchant register: 1,090 hulls / 654,407 GRT.

GRT is registered volume, not naval displacement. Naval oilers and depot ships are excluded from this merchant register.

## Class specifications

### Deutschland class — `deutschland_bb`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1903 |
| Standard displacement (t) | 13200 |
| Speed (kn) | 18 |
| Range (km) | 8889.6 |
| Main guns | 4 × 283 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 240 / 40 |
| Embarked aircraft | 0 |
| Complement | 743 |
| Hull price (gold) | 6336 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Braunschweig class — `braunschweig_bb`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1901 |
| Standard displacement (t) | 13200 |
| Speed (kn) | 18 |
| Range (km) | 8889.6 |
| Main guns | 4 × 283 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 225 / 40 |
| Embarked aircraft | 0 |
| Complement | 743 |
| Hull price (gold) | 6336 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Mackensen class (broken up incomplete) — `mackensen_bc`

| Property | Value |
|---|---|
| Role / service | BC / warship |
| Design year | 1914 |
| Standard displacement (t) | 31000 |
| Speed (kn) | 28 |
| Range (km) | 14816 |
| Main guns | 8 × 350 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 300 / 80 |
| Embarked aircraft | 0 |
| Complement | 1186 |
| Hull price (gold) | 14880 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Emden — `emden_cl`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1921 |
| Standard displacement (t) | 5600 |
| Speed (kn) | 29 |
| Range (km) | 12408.400000000001 |
| Main guns | 8 × 150 mm |
| Torpedo tubes | 4 |
| AA barrels | 0 |
| Belt / deck (mm) | 50 / 20 |
| Embarked aircraft | 0 |
| Complement | 630 |
| Hull price (gold) | 2688 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Bremen class — `bremen_cl`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1901 |
| Standard displacement (t) | 3250 |
| Speed (kn) | 22 |
| Range (km) | 7963.6 |
| Main guns | 10 × 105 mm |
| Torpedo tubes | 2 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 80 |
| Embarked aircraft | 0 |
| Complement | 288 |
| Hull price (gold) | 1560 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Gazelle class — `gazelle_cl`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1897 |
| Standard displacement (t) | 2650 |
| Speed (kn) | 21.5 |
| Range (km) | 6667.200000000001 |
| Main guns | 10 × 105 mm |
| Torpedo tubes | 2 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 25 |
| Embarked aircraft | 0 |
| Complement | 257 |
| Hull price (gold) | 1272 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### V1 class — `v1_dd`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1910 |
| Standard displacement (t) | 570 |
| Speed (kn) | 32 |
| Range (km) | 3333.6000000000004 |
| Main guns | 2 × 88 mm |
| Torpedo tubes | 4 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 74 |
| Hull price (gold) | 274 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### A-boat class — `a_boat_tb`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1915 |
| Standard displacement (t) | 227 |
| Speed (kn) | 25 |
| Range (km) | 1481.6000000000001 |
| Main guns | 1 × 88 mm |
| Torpedo tubes | 2 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 29 |
| Hull price (gold) | 109 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Germany standard freighter 1922 — `de_merchant_1922`

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
| Opening construction catalog | Legacy only |
| Fit notes | Provisional standardized replacement freighter. Registered capacity is separate from displacement; no opening hulls are added. |

### Germany standard freighter 1936 — `de_merchant_1936`

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
| Opening construction catalog | Legacy only |
| Fit notes | Provisional standardized replacement freighter. Registered capacity is separate from displacement; no opening hulls are added. |

### Germany standard freighter 1948 — `de_merchant_1948`

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
| Opening construction catalog | Legacy only |
| Fit notes | Provisional standardized replacement freighter. Registered capacity is separate from displacement; no opening hulls are added. |

### Fleet depot · 1922 — `de_depot_1922`

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

### Fleet oiler · 1922 — `de_oiler_1922`

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

### Fleet depot · 1932 — `de_depot_1932`

| Property | Value |
|---|---|
| Role / service | AD / support |
| Design year | 1932 |
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
| Fit notes | Provisional 1932 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added. |

### Fleet oiler · 1932 — `de_oiler_1932`

| Property | Value |
|---|---|
| Role / service | AO / support |
| Design year | 1932 |
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
| Fit notes | Provisional 1932 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added. |

### Fleet depot · 1942 — `de_depot_1942`

| Property | Value |
|---|---|
| Role / service | AD / support |
| Design year | 1942 |
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
| Fit notes | Provisional 1942 new-construction depot with workshops, spare parts and accommodation. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added. |

### Fleet oiler · 1942 — `de_oiler_1942`

| Property | Value |
|---|---|
| Role / service | AO / support |
| Design year | 1942 |
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
| Fit notes | Provisional 1942 new-construction naval fuel oiler. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added. |
