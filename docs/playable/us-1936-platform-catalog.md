# United States — In Good Faith — platform catalog

**Project:** WNT1922
**Version:** v1
**Companion to:** [Playable catalog index](../playable/README.md) and the national scenario/road documents.
**Conventions:** [Equipment and data conventions](../equipment-conventions.md), including provisional playable supplements.
**Designations:** National class and model names; stable IDs retain their source spelling.
**Scope:** platform catalog summary for 1936-01-01.
**Status:** Canonical design reference.

---

Generated, reviewable catalog for release 0.18.2. Regenerate with `node tools/export-catalog-docs.mjs game/staging`. This is a summary of the playable data; `data/playable/us.json` owns the new literal estimates and aircraft, while the original national JSON/Markdown files own the historical and original four-program specifications. Do not independently edit generated numbers.

Campaign opens 1936-01-01. Future designs are listed for planning; listing is not permission to build an obsolete or superseded line. No merchant or support hull contributes to the warship total.

## National program

Five-Term Tillman — An immense battle line. Each generation demands larger yards, heavier guns and more trained crews.

Six completed South Dakotas, eight active Standards, ten older reserve battleships, Langley and all ten Omaha cruisers, plus the authored old destroyer and submarine flotillas. No historical Lexington carriers are added to the divergent construction plan.

## Opening register

| Ship or group | Class ID | Hulls | Service | Status |
|---|---|---:|---|---|
| USS South Dakota | south_dakota_1920 | 1 | warship | active |
| USS Indiana | south_dakota_1920 | 1 | warship | active |
| USS Montana | south_dakota_1920 | 1 | warship | active |
| USS North Carolina | south_dakota_1920 | 1 | warship | active |
| USS Iowa | south_dakota_1920 | 1 | warship | active |
| USS Massachusetts | south_dakota_1920 | 1 | warship | active |
| USS Colorado | colorado | 1 | warship | active |
| USS Maryland | colorado | 1 | warship | active |
| USS West Virginia | colorado | 1 | warship | active |
| USS Tennessee | tennessee | 1 | warship | active |
| USS California | tennessee | 1 | warship | active |
| USS New Mexico | new_mexico | 1 | warship | active |
| USS Mississippi | new_mexico | 1 | warship | active |
| USS Idaho | new_mexico | 1 | warship | active |
| USS Pennsylvania | pennsylvania | 1 | warship | reserve |
| USS Arizona | pennsylvania | 1 | warship | reserve |
| USS Nevada | nevada | 1 | warship | reserve |
| USS Oklahoma | nevada | 1 | warship | reserve |
| USS New York | new_york | 1 | warship | reserve |
| USS Texas | new_york | 1 | warship | reserve |
| USS Florida | florida | 1 | warship | reserve |
| USS Utah | florida | 1 | warship | reserve |
| USS Wyoming | wyoming | 1 | warship | reserve |
| USS Arkansas | wyoming | 1 | warship | reserve |
| USS Langley | langley | 1 | warship | active |
| Missouri | missouri_bb23 | 1 | warship | active |
| Ohio | missouri_bb23 | 1 | warship | active |
| Maine | missouri_bb23 | 1 | warship | active |
| Constitution | constitution_bb25 | 1 | warship | active |
| Constellation | constitution_bb25 | 1 | warship | active |
| Congress | constitution_bb25 | 1 | warship | active |
| United States | united_states_bb27 | 1 | warship | active |
| President | united_states_bb27 | 1 | warship | active |
| Chesapeake | united_states_bb27 | 1 | warship | active |
| Tillman | tillman_bb29 | 1 | warship | active |
| America | tillman_bb29 | 1 | warship | trials |
| Republic | tillman_bb29 | 1 | warship | building |
| Columbia | columbia_bb32 | 1 | warship | building |
| Liberty | columbia_bb32 | 1 | warship | building |
| Independence | columbia_bb32 | 1 | warship | building |
| Ranger | ranger_cv29 | 1 | warship | active |
| Astoria class | astoria_ca26 | 16 | warship | active |
| Farragut class | farragut_dd34 | 8 | warship | active |
| Dolphin class | dolphin_ss31 | 14 | warship | active |
| Clemson class | clemson | 170 | warship | active |
| S-boat class | s_class_ss_usn | 41 | warship | active |
| USS Omaha | omaha | 1 | warship | active |
| USS Milwaukee | omaha | 1 | warship | active |
| USS Cincinnati | omaha | 1 | warship | active |
| USS Raleigh | omaha | 1 | warship | active |
| USS Detroit | omaha | 1 | warship | active |
| USS Richmond | omaha | 1 | warship | active |
| USS Concord | omaha | 1 | warship | active |
| USS Trenton | omaha | 1 | warship | active |
| USS Marblehead | omaha | 1 | warship | active |
| USS Memphis | omaha | 1 | warship | active |

Other merchant register: 2,553 hulls. Total merchant register: 2,553 hulls / 9,664,665 GRT. Seagoing register; Great Lakes shipping excluded.

GRT is registered volume, not naval displacement. Naval oilers and depot ships are excluded from this merchant register.

## Class specifications

### Delaware class — `delaware`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1906 |
| Standard displacement (t) | 20380 |
| Speed (kn) | 21 |
| Range (km) | 11112 |
| Main guns | 10 × 304.8 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 280 / 51 |
| Embarked aircraft | 0 |
| Complement | 933 |
| Hull price (gold) | 9782 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Florida class — `florida`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1908 |
| Standard displacement (t) | 21825 |
| Speed (kn) | 20.75 |
| Range (km) | 10697.152 |
| Main guns | 10 × 304.8 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 280 / 51 |
| Embarked aircraft | 0 |
| Complement | 1001 |
| Hull price (gold) | 10476 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Wyoming class — `wyoming`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1909 |
| Standard displacement (t) | 26000 |
| Speed (kn) | 20.5 |
| Range (km) | 14816 |
| Main guns | 12 × 304.8 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 280 / 51 |
| Embarked aircraft | 0 |
| Complement | 1063 |
| Hull price (gold) | 12480 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### New York class — `new_york`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1910 |
| Standard displacement (t) | 27000 |
| Speed (kn) | 21 |
| Range (km) | 13075.12 |
| Main guns | 10 × 355.6 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 305 / 51 |
| Embarked aircraft | 0 |
| Complement | 1042 |
| Hull price (gold) | 12960 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Nevada class — `nevada`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1911 |
| Standard displacement (t) | 27500 |
| Speed (kn) | 20.5 |
| Range (km) | 14816 |
| Main guns | 10 × 355.6 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 343 / 76 |
| Embarked aircraft | 0 |
| Complement | 864 |
| Hull price (gold) | 13200 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Pennsylvania class — `pennsylvania`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1913 |
| Standard displacement (t) | 31400 |
| Speed (kn) | 21 |
| Range (km) | 14816 |
| Main guns | 12 × 355.6 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 343 / 76 |
| Embarked aircraft | 0 |
| Complement | 915 |
| Hull price (gold) | 15072 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### New Mexico class — `new_mexico`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1914 |
| Standard displacement (t) | 32000 |
| Speed (kn) | 21 |
| Range (km) | 14815 |
| Main guns | 12 × 355.6 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 343 / 89 |
| Embarked aircraft | 0 |
| Complement | 1084 |
| Hull price (gold) | 15360 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Tennessee class — `tennessee`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1915 |
| Standard displacement (t) | 32300 |
| Speed (kn) | 21 |
| Range (km) | 14815 |
| Main guns | 12 × 355.6 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 343 / 89 |
| Embarked aircraft | 0 |
| Complement | 1083 |
| Hull price (gold) | 15504 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Colorado class — `colorado`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1916 |
| Standard displacement (t) | 32600 |
| Speed (kn) | 21 |
| Range (km) | 14815 |
| Main guns | 8 × 406.4 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 343 / 89 |
| Embarked aircraft | 0 |
| Complement | 1080 |
| Hull price (gold) | 15648 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### South Dakota class (1920, completed) — `south_dakota_1920`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1918 |
| Standard displacement (t) | 43200 |
| Speed (kn) | 23 |
| Range (km) | 14816 |
| Main guns | 12 × 406.4 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 343 / 89 |
| Embarked aircraft | 0 |
| Complement | 1191 |
| Hull price (gold) | 20736 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Lexington class (battlecruiser) — `lexington_cc`

| Property | Value |
|---|---|
| Role / service | BC / warship |
| Design year | 1916 |
| Standard displacement (t) | 43500 |
| Speed (kn) | 33.25 |
| Range (km) | 18520 |
| Main guns | 8 × 406.4 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 178 / 57 |
| Embarked aircraft | 0 |
| Complement | 1297 |
| Hull price (gold) | 20880 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Lexington class (carrier conversion) — `lexington_cv`

| Property | Value |
|---|---|
| Role / service | CV / warship |
| Design year | 1922 |
| Standard displacement (t) | 36000 |
| Speed (kn) | 33.25 |
| Range (km) | 18520 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 178 / 51 |
| Embarked aircraft | 78 |
| Complement | 2122 |
| Hull price (gold) | 17280 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Langley — `langley`

| Property | Value |
|---|---|
| Role / service | CVL / warship |
| Design year | 1920 |
| Standard displacement (t) | 11500 |
| Speed (kn) | 15 |
| Range (km) | 6480 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 34 |
| Complement | 468 |
| Hull price (gold) | 5520 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Omaha class — `omaha`

| Property | Value |
|---|---|
| Role / service | CL / warship |
| Design year | 1917 |
| Standard displacement (t) | 7050 |
| Speed (kn) | 34 |
| Range (km) | 16668 |
| Main guns | 12 × 152.4 mm |
| Torpedo tubes | 10 |
| AA barrels | 0 |
| Belt / deck (mm) | 76 / 38 |
| Embarked aircraft | 0 |
| Complement | 458 |
| Hull price (gold) | 3384 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Clemson class — `clemson`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1917 |
| Standard displacement (t) | 1190 |
| Speed (kn) | 35 |
| Range (km) | 9074.800000000001 |
| Main guns | 4 × 101.6 mm |
| Torpedo tubes | 12 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 114 |
| Hull price (gold) | 571 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Wickes class — `wickes`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1916 |
| Standard displacement (t) | 1090 |
| Speed (kn) | 35 |
| Range (km) | 7037.6 |
| Main guns | 4 × 101.6 mm |
| Torpedo tubes | 12 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 100 |
| Hull price (gold) | 523 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### S-boat class — `s_class_ss_usn`

| Property | Value |
|---|---|
| Role / service | SS / warship |
| Design year | 1917 |
| Standard displacement (t) | 854 |
| Speed (kn) | 14.5 |
| Range (km) | 9260 |
| Main guns | 1 × 101.6 mm |
| Torpedo tubes | 4 |
| AA barrels | 0 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 38 |
| Hull price (gold) | 410 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Legacy only |
| Fit notes | See base or original program catalog |

### Missouri class — `missouri_bb23`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1923 |
| Standard displacement (t) | 58000 |
| Speed (kn) | 25 |
| Range (km) | 16000 |
| Main guns | 12 × 406 mm |
| Torpedo tubes | 0 |
| AA barrels | 12 |
| Belt / deck (mm) | 406 / 152 |
| Embarked aircraft | 3 |
| Complement | 2650 |
| Hull price (gold) | 29000 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Constitution class — `constitution_bb25`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1925 |
| Standard displacement (t) | 72000 |
| Speed (kn) | 25 |
| Range (km) | 15500 |
| Main guns | 12 × 457 mm |
| Torpedo tubes | 0 |
| AA barrels | 24 |
| Belt / deck (mm) | 432 / 178 |
| Embarked aircraft | 4 |
| Complement | 3250 |
| Hull price (gold) | 37000 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### United States class — `united_states_bb27`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1927 |
| Standard displacement (t) | 92000 |
| Speed (kn) | 25 |
| Range (km) | 15000 |
| Main guns | 15 × 457 mm |
| Torpedo tubes | 0 |
| AA barrels | 16 |
| Belt / deck (mm) | 457 / 203 |
| Embarked aircraft | 4 |
| Complement | 4150 |
| Hull price (gold) | 49000 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Tillman class — `tillman_bb29`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1929 |
| Standard displacement (t) | 112000 |
| Speed (kn) | 25 |
| Range (km) | 15000 |
| Main guns | 9 × 546 mm |
| Torpedo tubes | 0 |
| AA barrels | 32 |
| Belt / deck (mm) | 483 / 320 |
| Embarked aircraft | 4 |
| Complement | 5200 |
| Hull price (gold) | 63000 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Columbia class — `columbia_bb32`

| Property | Value |
|---|---|
| Role / service | BB / warship |
| Design year | 1932 |
| Standard displacement (t) | 142000 |
| Speed (kn) | 25 |
| Range (km) | 15000 |
| Main guns | 12 × 546 mm |
| Torpedo tubes | 0 |
| AA barrels | 48 |
| Belt / deck (mm) | 483 / 320 |
| Embarked aircraft | 4 |
| Complement | 6600 |
| Hull price (gold) | 81000 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Ranger — `ranger_cv29`

| Property | Value |
|---|---|
| Role / service | CV / warship |
| Design year | 1929 |
| Standard displacement (t) | 14500 |
| Speed (kn) | 29 |
| Range (km) | 20000 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 0 |
| AA barrels | 12 |
| Belt / deck (mm) | 0 / 25 |
| Embarked aircraft | 38 |
| Complement | 1750 |
| Hull price (gold) | 7000 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Astoria class — `astoria_ca26`

| Property | Value |
|---|---|
| Role / service | CA / warship |
| Design year | 1926 |
| Standard displacement (t) | 9950 |
| Speed (kn) | 32.5 |
| Range (km) | 18500 |
| Main guns | 9 × 203 mm |
| Torpedo tubes | 0 |
| AA barrels | 8 |
| Belt / deck (mm) | 127 / 57 |
| Embarked aircraft | 4 |
| Complement | 750 |
| Hull price (gold) | 4400 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Farragut class — `farragut_dd34`

| Property | Value |
|---|---|
| Role / service | DD / warship |
| Design year | 1934 |
| Standard displacement (t) | 1500 |
| Speed (kn) | 36.5 |
| Range (km) | 11000 |
| Main guns | 5 × 127 mm |
| Torpedo tubes | 8 |
| AA barrels | 4 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 200 |
| Hull price (gold) | 700 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### Dolphin class — `dolphin_ss31`

| Property | Value |
|---|---|
| Role / service | SS / warship |
| Design year | 1931 |
| Standard displacement (t) | 1550 |
| Speed (kn) | 17.5 |
| Range (km) | 18500 |
| Main guns | 0 × 0 mm |
| Torpedo tubes | 6 |
| AA barrels | 1 |
| Belt / deck (mm) | 0 / 0 |
| Embarked aircraft | 0 |
| Complement | 52 |
| Hull price (gold) | 1000 |
| Registered merchant capacity (GRT) | Not applicable / opening register allocation |
| Opening construction catalog | Listed; year, treaty and obsolescence rules apply |
| Fit notes | See base or original program catalog |

### United States standard freighter 1922 — `us_merchant_1922`

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

### United States standard freighter 1936 — `us_merchant_1936`

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

### United States standard freighter 1948 — `us_merchant_1948`

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

### Fleet depot · 1922 — `us_depot_1922`

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

### Fleet oiler · 1922 — `us_oiler_1922`

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

### Fleet depot · 1932 — `us_depot_1932`

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

### Fleet oiler · 1932 — `us_oiler_1932`

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

### Fleet depot · 1942 — `us_depot_1942`

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

### Fleet oiler · 1942 — `us_oiler_1942`

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
