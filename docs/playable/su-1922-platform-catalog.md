# Soviet Union — The Treaty System — platform catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** platform catalog summary for 1922-02-06.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.2. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/su.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1922-02-06. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## National program

Soviet Russia · rebuilding the Red Fleet — Civil war has left the historical fleet scattered and worn. Outside Washington, Soviet Russia must restore crews and industry before building anew.

Opening roster from data/scenarios/campaign_1922.json and national base catalogs. Incomplete hulls remain under construction; see campaign source notes.

## Opening register

| Ship or group | Class ID | Hulls | Service | Status |
|---|---|---:|---|---|
| Marat | sevastopol_1914 | 1 | warship | active |
| Parizhskaya Kommuna | sevastopol_1914 | 1 | warship | reserve |
| Gangut | sevastopol_1914 | 1 | warship | reserve |
| Svetlana | svetlana_1913 | 1 | warship | building |
| Aurora | aurora_1903 | 1 | warship | reserve |
| Novik type destroyer | novik_series | 7 | warship | active |
| Novik type destroyer | novik_series | 10 | warship | reserve |
| Bars class submarine | bars_1915 | 7 | warship | reserve |

Other merchant register: 100 hulls. Total merchant register: 100 hulls / provisional 100,000 GRT capacity proxy. PROVISIONAL: 100 game hulls. The 1921–22 Lloyd’s casualty summary does not enumerate Soviet-controlled vessels; no verified 1922 national total is claimed.

GRT is registered volume, not naval displacement. Naval oilers and depot ships are excluded from this merchant register.

## Class specifications

### Sevastopol class — `sevastopol_1914`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1909 |
| Standard displacement (t) | 23000 |
| Speed (kn) | 23 |
| Range (km) | 11112 |
| Main guns | 12 × 305 mm |
| Torpedo tubes | 4 |
| AA barrels | 2 |
| Belt / deck (mm) | 225 / 56 |
| Embarked aircraft | 0 |
| Complement | 806 |
| Hull price (gold) | 11040 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Svetlana class — `svetlana_1913`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1913 |
| Standard displacement (t) | 6800 |
| Speed (kn) | 29 |
| Range (km) | 11112 |
| Main guns | 15 × 130 mm |
| Torpedo tubes | 4 |
| AA barrels | 2 |
| Belt / deck (mm) | 75 / 19 |
| Embarked aircraft | 0 |
| Complement | 239 |
| Hull price (gold) | 3264 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Novik type destroyer — `novik_series`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1913 |
| Standard displacement (t) | 1300 |
| Speed (kn) | 32 |
| Range (km) | 4074.4 |
| Main guns | 4 × 102 mm |
| Torpedo tubes | 9 |
| AA barrels | 2 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 98 |
| Hull price (gold) | 624 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Bars class submarine — `bars_1915`

| Property | Value |
|---|---|
| Role / service | SS / warship |
| Design year | 1912 |
| Standard displacement (t) | 650 |
| Speed (kn) | 18 |
| Range (km) | 6482 |
| Main guns | 1 × 75 mm |
| Torpedo tubes | 4 |
| AA barrels | 2 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 33 |
| Hull price (gold) | 312 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Pallada class (Aurora) — `aurora_1903`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1897 |
| Standard displacement (t) | 6731 |
| Speed (kn) | 19 |
| Range (km) | 11112 |
| Main guns | 8 × 152 mm |
| Torpedo tubes | 3 |
| AA barrels | 2 |
| Belt / deck (mm) | 38 / 10 |
| Embarked aircraft | 0 |
| Complement | 236 |
| Hull price (gold) | 3231 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Soviet Union standard freighter 1922 — `su_merchant_1922`

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

### Soviet Union standard freighter 1936 — `su_merchant_1936`

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

### Soviet Union standard freighter 1948 — `su_merchant_1948`

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

### Fleet depot · 1922 — `su_depot_1922`

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

### Fleet oiler · 1922 — `su_oiler_1922`

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

### Fleet depot · 1932 — `su_depot_1932`

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

### Fleet oiler · 1932 — `su_oiler_1932`

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

### Fleet depot · 1942 — `su_depot_1942`

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

### Fleet oiler · 1942 — `su_oiler_1942`

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
