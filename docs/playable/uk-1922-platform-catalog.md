# United Kingdom — The Treaty System — platform catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** platform catalog summary for 1922-02-06.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.19.0. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/uk.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1922-02-06. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## National program

The Treaty System — A historical global fleet at a turning point. Treaty parity with America means scrapping battleships while guarding distant sea lanes.

Opening roster from data/scenarios/campaign_1922.json and national base catalogs. Incomplete hulls remain under construction; see campaign source notes.

## Opening register

| Ship or group | Class ID | Hulls | Service | Status |
|---|---|---:|---|---|
| HMS Queen Elizabeth | queen_elizabeth | 1 | warship | active |
| HMS Warspite | queen_elizabeth | 1 | warship | active |
| HMS Valiant | queen_elizabeth | 1 | warship | active |
| HMS Barham | queen_elizabeth | 1 | warship | active |
| HMS Malaya | queen_elizabeth | 1 | warship | active |
| HMS Revenge | revenge | 1 | warship | active |
| HMS Resolution | revenge | 1 | warship | active |
| HMS Royal Oak | revenge | 1 | warship | active |
| HMS Royal Sovereign | revenge | 1 | warship | active |
| HMS Ramillies | revenge | 1 | warship | active |
| HMS Iron Duke | iron_duke | 1 | warship | active |
| HMS Marlborough | iron_duke | 1 | warship | active |
| HMS Benbow | iron_duke | 1 | warship | active |
| HMS Emperor of India | iron_duke | 1 | warship | active |
| HMS King George V | king_george_v_1911 | 1 | warship | active |
| HMS Ajax | king_george_v_1911 | 1 | warship | active |
| HMS Centurion | king_george_v_1911 | 1 | warship | active |
| HMS Thunderer | orion | 1 | warship | active |
| HMS Tiger | tiger | 1 | warship | active |
| HMS Renown | renown | 1 | warship | active |
| HMS Repulse | renown | 1 | warship | active |
| HMS Hood | admiral | 1 | warship | active |
| HMS Nelson | nelson | 1 | warship | building |
| HMS Rodney | nelson | 1 | warship | building |
| HMS Argus | argus | 1 | warship | active |
| HMS Eagle | eagle | 1 | warship | trials |
| HMS Hermes | hermes | 1 | warship | building |
| HMS Furious | furious | 1 | warship | converting |
| HMS Courageous | courageous_llc | 1 | warship | reserve |
| HMS Glorious | courageous_llc | 1 | warship | reserve |
| Hawkins class | hawkins | 5 | warship | active |
| C class (Caledon/Ceres/Carlisle groups) | c_class_cl | 23 | warship | active |
| Danae (D) class | danae | 8 | warship | active |
| Emerald (E) class | emerald | 2 | warship | building |
| V & W class | v_w | 58 | warship | active |
| S class | s_class_dd_rn | 60 | warship | active |
| Scott / Shakespeare flotilla leaders | scott_shakespeare | 13 | warship | active |
| L class | l_class_ss_rn | 27 | warship | active |
| M class (submarine monitor) | m_class_ss_rn | 3 | warship | active |
| K class (steam submarine) | k_class_ss_rn | 13 | warship | active |

Other merchant register: 8,579 hulls. Total merchant register: 8,579 hulls / 19,320,053 GRT.

GRT is registered volume, not naval displacement. Naval oilers and depot ships are excluded from this merchant register.

## Class specifications

### Queen Elizabeth class — `queen_elizabeth`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1912 |
| Standard displacement (t) | 27500 |
| Speed (kn) | 24 |
| Range (km) | 9260 |
| Main guns | 8 × 381 mm |
| Torpedo tubes | 4 |
| AA barrels | 0 |
| Belt / deck (mm) | 330 / 76 |
| Embarked aircraft | 0 |
| Complement | 950 |
| Hull price (gold) | 13200 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Revenge class — `revenge`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1913 |
| Standard displacement (t) | 28000 |
| Speed (kn) | 23 |
| Range (km) | 9260 |
| Main guns | 8 × 381 mm |
| Torpedo tubes | 4 |
| AA barrels | 0 |
| Belt / deck (mm) | 330 / 51 |
| Embarked aircraft | 0 |
| Complement | 940 |
| Hull price (gold) | 13440 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Iron Duke class — `iron_duke`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1911 |
| Standard displacement (t) | 25000 |
| Speed (kn) | 21.25 |
| Range (km) | 14445.6 |
| Main guns | 10 × 342.9 mm |
| Torpedo tubes | 4 |
| AA barrels | 0 |
| Belt / deck (mm) | 305 / 64 |
| Embarked aircraft | 0 |
| Complement | 995 |
| Hull price (gold) | 12000 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### King George V class (1911) — `king_george_v_1911`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1910 |
| Standard displacement (t) | 23000 |
| Speed (kn) | 21 |
| Range (km) | 12463.960000000001 |
| Main guns | 10 × 342.9 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 305 / 51 |
| Embarked aircraft | 0 |
| Complement | 860 |
| Hull price (gold) | 11040 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Orion class — `orion`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1908 |
| Standard displacement (t) | 22200 |
| Speed (kn) | 21 |
| Range (km) | 12463.960000000001 |
| Main guns | 10 × 342.9 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 305 / 45 |
| Embarked aircraft | 0 |
| Complement | 750 |
| Hull price (gold) | 10656 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Tiger — `tiger`

| Property | Value |
|---|---|
| Role / service | BC / warship |
| Design year | 1911 |
| Standard displacement (t) | 28500 |
| Speed (kn) | 29 |
| Range (km) | 8611.800000000001 |
| Main guns | 8 × 342.9 mm |
| Torpedo tubes | 4 |
| AA barrels | 0 |
| Belt / deck (mm) | 229 / 76 |
| Embarked aircraft | 0 |
| Complement | 1121 |
| Hull price (gold) | 13680 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Renown class — `renown`

| Property | Value |
|---|---|
| Role / service | BC / warship |
| Design year | 1914 |
| Standard displacement (t) | 27650 |
| Speed (kn) | 31.5 |
| Range (km) | 8704.4 |
| Main guns | 6 × 381 mm |
| Torpedo tubes | 2 |
| AA barrels | 0 |
| Belt / deck (mm) | 152 / 51 |
| Embarked aircraft | 0 |
| Complement | 967 |
| Hull price (gold) | 13272 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Admiral class — `admiral`

| Property | Value |
|---|---|
| Role / service | BC / warship |
| Design year | 1916 |
| Standard displacement (t) | 41200 |
| Speed (kn) | 31 |
| Range (km) | 13890 |
| Main guns | 8 × 381 mm |
| Torpedo tubes | 6 |
| AA barrels | 0 |
| Belt / deck (mm) | 305 / 51 |
| Embarked aircraft | 0 |
| Complement | 1433 |
| Hull price (gold) | 19776 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Nelson class — `nelson`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1922 |
| Standard displacement (t) | 33950 |
| Speed (kn) | 23 |
| Range (km) | 12964 |
| Main guns | 9 × 406.4 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 356 / 159 |
| Embarked aircraft | 0 |
| Complement | 1361 |
| Hull price (gold) | 16296 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### G3 battlecruiser (canceled) — `g3`

| Property | Value |
|---|---|
| Role / service | BC / warship |
| Design year | 1921 |
| Standard displacement (t) | 48400 |
| Speed (kn) | 32 |
| Range (km) | 12964 |
| Main guns | 9 × 406.4 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 356 / 203 |
| Embarked aircraft | 0 |
| Complement | 1716 |
| Hull price (gold) | 23232 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Argus — `argus`

| Property | Value |
|---|---|
| Role / service | CV / warship |
| Design year | 1917 |
| Standard displacement (t) | 14450 |
| Speed (kn) | 20 |
| Range (km) | 6667.200000000001 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 18 |
| Complement | 495 |
| Hull price (gold) | 6936 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Eagle — `eagle`

| Property | Value |
|---|---|
| Role / service | CV / warship |
| Design year | 1918 |
| Standard displacement (t) | 22600 |
| Speed (kn) | 24 |
| Range (km) | 8889.6 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 114 / 0 |
| Embarked aircraft | 21 |
| Complement | 950 |
| Hull price (gold) | 10848 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Hermes — `hermes`

| Property | Value |
|---|---|
| Role / service | CVL / warship |
| Design year | 1918 |
| Standard displacement (t) | 10850 |
| Speed (kn) | 25 |
| Range (km) | 8296.960000000001 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 20 |
| Complement | 660 |
| Hull price (gold) | 5208 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Furious (as reconstructed) — `furious`

| Property | Value |
|---|---|
| Role / service | CV / warship |
| Design year | 1921 |
| Standard displacement (t) | 22450 |
| Speed (kn) | 30 |
| Range (km) | 7963.6 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 36 |
| Complement | 795 |
| Hull price (gold) | 10776 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Courageous class (large light cruiser) — `courageous_llc`

| Property | Value |
|---|---|
| Role / service | BC / warship |
| Design year | 1915 |
| Standard displacement (t) | 18600 |
| Speed (kn) | 32 |
| Range (km) | 11112 |
| Main guns | 4 × 381 mm |
| Torpedo tubes | 14 |
| AA barrels | 0 |
| Belt / deck (mm) | 76 / 45 |
| Embarked aircraft | 0 |
| Complement | 828 |
| Hull price (gold) | 8928 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Hawkins class — `hawkins`

| Property | Value |
|---|---|
| Role / service | CA / warship |
| Design year | 1915 |
| Standard displacement (t) | 9750 |
| Speed (kn) | 30 |
| Range (km) | 10000.800000000001 |
| Main guns | 7 × 190.5 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 76 / 38 |
| Embarked aircraft | 0 |
| Complement | 712 |
| Hull price (gold) | 4680 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### C class (Caledon/Ceres/Carlisle groups) — `c_class_cl`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1916 |
| Standard displacement (t) | 4290 |
| Speed (kn) | 29 |
| Range (km) | 10926.800000000001 |
| Main guns | 5 × 152.4 mm |
| Torpedo tubes | 8 |
| AA barrels | 0 |
| Belt / deck (mm) | 76 / 25 |
| Embarked aircraft | 0 |
| Complement | 430 |
| Hull price (gold) | 2059 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Danae (D) class — `danae`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1916 |
| Standard displacement (t) | 4850 |
| Speed (kn) | 29 |
| Range (km) | 12408.400000000001 |
| Main guns | 6 × 152.4 mm |
| Torpedo tubes | 12 |
| AA barrels | 0 |
| Belt / deck (mm) | 76 / 25 |
| Embarked aircraft | 0 |
| Complement | 469 |
| Hull price (gold) | 2328 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Emerald (E) class — `emerald`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1918 |
| Standard displacement (t) | 7550 |
| Speed (kn) | 33 |
| Range (km) | 14816 |
| Main guns | 7 × 152.4 mm |
| Torpedo tubes | 12 |
| AA barrels | 0 |
| Belt / deck (mm) | 76 / 25 |
| Embarked aircraft | 0 |
| Complement | 572 |
| Hull price (gold) | 3624 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### V & W class — `v_w`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1916 |
| Standard displacement (t) | 1100 |
| Speed (kn) | 34 |
| Range (km) | 6482 |
| Main guns | 4 × 101.6 mm |
| Torpedo tubes | 6 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 110 |
| Hull price (gold) | 528 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### S class — `s_class_dd_rn`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1917 |
| Standard displacement (t) | 1075 |
| Speed (kn) | 36 |
| Range (km) | 5093 |
| Main guns | 3 × 101.6 mm |
| Torpedo tubes | 4 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 90 |
| Hull price (gold) | 516 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Scott / Shakespeare flotilla leaders — `scott_shakespeare`

| Property | Value |
|---|---|
| Role / service | DL / warship |
| Design year | 1916 |
| Standard displacement (t) | 1580 |
| Speed (kn) | 36 |
| Range (km) | 9260 |
| Main guns | 5 × 119.38 mm |
| Torpedo tubes | 6 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 164 |
| Hull price (gold) | 758 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### L class — `l_class_ss_rn`

| Property | Value |
|---|---|
| Role / service | SS / warship |
| Design year | 1916 |
| Standard displacement (t) | 890 |
| Speed (kn) | 17 |
| Range (km) | 7037.6 |
| Main guns | 1 × 101.6 mm |
| Torpedo tubes | 6 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 35 |
| Hull price (gold) | 427 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### M class (submarine monitor) — `m_class_ss_rn`

| Property | Value |
|---|---|
| Role / service | SM / warship |
| Design year | 1916 |
| Standard displacement (t) | 1600 |
| Speed (kn) | 15 |
| Range (km) | 7111.68 |
| Main guns | 1 × 304.8 mm |
| Torpedo tubes | 4 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 65 |
| Hull price (gold) | 768 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### K class (steam submarine) — `k_class_ss_rn`

| Property | Value |
|---|---|
| Role / service | SS / warship |
| Design year | 1915 |
| Standard displacement (t) | 1980 |
| Speed (kn) | 24 |
| Range (km) | 5556 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 8 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 59 |
| Hull price (gold) | 950 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Courageous carrier conversion — `courageous_1922_cv`

| Property | Value |
|---|---|
| Role / service | CV / warship |
| Design year | 1922 |
| Standard displacement (t) | 22500 |
| Speed (kn) | 30 |
| Range (km) | 11112 |
| Main guns | 16 × 120 mm |
| Torpedo tubes | 0 |
| AA barrels | 2 |
| Belt / deck (mm) | 76 / 19 |
| Embarked aircraft | 48 |
| Complement | 884 |
| Hull price (gold) | 10800 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | Historical conversion option; provisional fit and timing. |

### United Kingdom standard freighter 1922 — `uk_merchant_1922`

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

### United Kingdom standard freighter 1936 — `uk_merchant_1936`

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

### United Kingdom standard freighter 1948 — `uk_merchant_1948`

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

### Fleet depot · 1922 — `uk_depot_1922`

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

### Fleet oiler · 1922 — `uk_oiler_1922`

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

### Fleet depot · 1932 — `uk_depot_1932`

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

### Fleet oiler · 1932 — `uk_oiler_1932`

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

### Fleet depot · 1942 — `uk_depot_1942`

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

### Fleet oiler · 1942 — `uk_oiler_1942`

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
