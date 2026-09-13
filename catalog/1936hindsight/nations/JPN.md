# Japan — opening navy and economy

Edit the JSON block directly. This document is read by the game; no export is required.

```json game-data
{
  "title": "As Long As It's Black",
  "description": "One drawing per role. A carrier fleet built around common machinery and a long investment in schools.",
  "nation": "JPN",
  "hulls": [
    {
      "id": "ijn_nagato",
      "name": "Nagato",
      "class_id": "nagato",
      "status": "active",
      "legacy": true
    },
    {
      "id": "ijn_mutsu",
      "name": "Mutsu",
      "class_id": "nagato",
      "status": "active",
      "legacy": true
    },
    {
      "id": "ijn_kongo",
      "name": "Kongo",
      "class_id": "kongo",
      "status": "active",
      "legacy": true
    },
    {
      "id": "ijn_hiei",
      "name": "Hiei",
      "class_id": "kongo",
      "status": "active",
      "legacy": true
    },
    {
      "id": "ijn_haruna",
      "name": "Haruna",
      "class_id": "kongo",
      "status": "active",
      "legacy": true
    },
    {
      "id": "ijn_kirishima",
      "name": "Kirishima",
      "class_id": "kongo",
      "status": "active",
      "legacy": true
    },
    {
      "id": "ijn_fuso",
      "name": "Fuso",
      "class_id": "fuso",
      "status": "active",
      "legacy": true
    },
    {
      "id": "ijn_yamashiro",
      "name": "Yamashiro",
      "class_id": "fuso",
      "status": "active",
      "legacy": true
    },
    {
      "id": "ijn_ise",
      "name": "Ise",
      "class_id": "ise",
      "status": "active",
      "legacy": true
    },
    {
      "id": "ijn_hyuga",
      "name": "Hyuga",
      "class_id": "ise",
      "status": "active",
      "legacy": true
    },
    {
      "id": "ijn_hosho",
      "name": "Hosho",
      "class_id": "hosho",
      "status": "active",
      "legacy": true
    }
  ],
  "aggregates": [
    {
      "class_id": "unryu_t32",
      "count": 5,
      "status": "active",
      "notes": "Plus Hoshou from the base file: 6 decks. The line is four years old and every hull is identical -- jp32eng from new, no stragglers and no refit wave -- and every hull carries twelve twin Type 29 mounts from new, the galleries filled from the drawing that wired them. All flying only the Hibari. More flight decks than any navy on earth.",
      "id": "a-JPN-0"
    },
    {
      "class_id": "unryu_t32",
      "count": 8,
      "status": "building",
      "notes": "On the ways at 1 January 1936 — laid and not yet commissioned.",
      "id": "a-JPN-1"
    },
    {
      "class_id": "maya_t29",
      "count": 26,
      "status": "active",
      "notes": "Three standing flotillas of 8, and two spare hulls. Uniform fit -- jp22eng and jp29gun on every hull, the refit wave delivering jp32eng and jp42gun -- and every one of them carries a full twelve twin mounts from new.",
      "id": "a-JPN-2"
    },
    {
      "class_id": "maya_t29",
      "count": 12,
      "status": "building",
      "notes": "On the ways at 1 January 1936 — laid and not yet commissioned.",
      "id": "a-JPN-3"
    },
    {
      "class_id": "kaze_t32",
      "count": 17,
      "status": "active",
      "notes": "THE FLEET HAS A SCREEN AT LAST, AND ONLY JUST. Seventeen modern boats for 6 decks and 26 cruisers; the line is four years old and delivering six a year.",
      "id": "a-JPN-4"
    },
    {
      "class_id": "kaze_t32",
      "count": 14,
      "status": "building",
      "notes": "On the ways at 1 January 1936 — laid and not yet commissioned.",
      "id": "a-JPN-5"
    },
    {
      "class_id": "shima_t32",
      "count": 18,
      "status": "active",
      "notes": "The fisheries-protection cover story, and the sonar school's own hulls. Four years old.",
      "id": "a-JPN-6"
    },
    {
      "class_id": "shima_t32",
      "count": 7,
      "status": "building",
      "notes": "On the ways at 1 January 1936 — laid and not yet commissioned.",
      "id": "a-JPN-7"
    },
    {
      "class_id": "i_series_t33",
      "count": 28,
      "status": "active",
      "notes": "16 worked up, 12 working up. Opened 1933 and the fastest-growing line in the fleet.",
      "id": "a-JPN-8"
    },
    {
      "class_id": "i_series_t33",
      "count": 27,
      "status": "building",
      "notes": "On the ways at 1 January 1936 — laid and not yet commissioned.",
      "id": "a-JPN-9"
    },
    {
      "id": "legacy-jpn-destroyers",
      "name": "WWI-era destroyers (Minekaze fit)",
      "class_id": "minekaze",
      "count": 40,
      "status": "reserve",
      "legacy": true,
      "representative": true,
      "notes": "Forty mixed older destroyers retained in reserve. Minekaze is the representative class, with a catalog maximum of 39 knots; this is not the normal cruising speed and does not mean all 40 were Minekaze-class ships. Individual names come from the shared historical name register. Prototype submarine boats were retired before this opening and are excluded.",
      "rosterAdded": 2,
      "shipNames": [
        "Minekaze",
        "Sawakaze",
        "Okikaze",
        "Shimakaze",
        "Nadakaze",
        "Yakaze",
        "Hakaze",
        "Shiokaze",
        "Akikaze",
        "Yukaze",
        "Tachikaze",
        "Hokaze",
        "Nokaze",
        "Namikaze",
        "Numakaze",
        "Kamikaze",
        "Asakaze",
        "Harukaze",
        "Matsukaze",
        "Hatakaze",
        "Oite",
        "Hayate",
        "Asanagi",
        "Yunagi",
        "Mutsuki",
        "Kisaragi",
        "Yayoi",
        "Uzuki",
        "Satsuki",
        "Minazuki",
        "Fumizuki",
        "Nagatsuki",
        "Kikuzuki",
        "Mikazuki",
        "Mochizuki",
        "Yuzuki",
        "Momi",
        "Kaya",
        "Nashi",
        "Take"
      ]
    }
  ],
  "designs": [
    "unryu_t32",
    "maya_t29",
    "kaze_t32",
    "i_series_t33",
    "shima_t32",
    "maru_depot_t23"
  ],
  "support": [
    {
      "class_id": "maru_depot_t23",
      "count": 10,
      "status": "active",
      "notes": "Standard Maru AO conversions combine replenishment, repair workshops and fleet stores.",
      "id": "a-JPN-11",
      "name": "Maru AO support ships"
    }
  ],
  "merchants": {
    "hulls": 2146,
    "grossRegisterTons": 4085650,
    "note": "Civilian merchant register; abstract hull count and average registered volume."
  },
  "shipNamePools": {
    "minekaze": [
      "Minekaze",
      "Sawakaze",
      "Okikaze",
      "Shimakaze",
      "Nadakaze",
      "Yakaze",
      "Hakaze",
      "Shiokaze",
      "Akikaze",
      "Yukaze",
      "Tachikaze",
      "Hokaze",
      "Nokaze",
      "Namikaze",
      "Numakaze",
      "Kamikaze",
      "Asakaze",
      "Harukaze",
      "Matsukaze",
      "Hatakaze",
      "Oite",
      "Hayate",
      "Asanagi",
      "Yunagi",
      "Mutsuki",
      "Kisaragi",
      "Yayoi",
      "Uzuki",
      "Satsuki",
      "Minazuki",
      "Fumizuki",
      "Nagatsuki",
      "Kikuzuki",
      "Mikazuki",
      "Mochizuki",
      "Yuzuki",
      "Momi",
      "Kaya",
      "Nashi",
      "Take"
    ]
  },
  "economy": {
    "yardYear": 148000,
    "crew": 42000,
    "crewYear": 1800,
    "aircraftYear": 1000,
    "aviatorsYear": 400,
    "gdp": 65560,
    "gtp": 53640,
    "strategicModifier": 0.12,
    "productUnit": "kg fine-gold equivalent per year"
  },
  "starting": {
    "gold": 30000,
    "influence": 70,
    "industry": 29600,
    "training": 65,
    "morale": 75,
    "level": 5,
    "funding": 0.5,
    "bases": [
      "pacific"
    ],
    "strategic": 1294
  },
  "procurement": {
    "industryFactor": 0.4,
    "customIndustryFactor": 1
  }
}
```
