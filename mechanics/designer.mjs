import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/designer.md");
import { normalizeClass } from "./catalog.mjs";
export const DESIGN_ROLES = data.DESIGN_ROLES;
export const SHIP_FEATURES = data.SHIP_FEATURES;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function designLimits(year, role) {
  const capital = ["BB", "BC"].includes(role),
    carrier = role === "CV",
    sub = role === "SS";
  return {
    minTons: capital
      ? 16000
      : carrier
        ? 7000
        : role === "CA"
          ? 6500
          : role === "CL"
            ? 3000
            : sub
              ? 400
              : 600,
    maxTons: capital
      ? year < 1930
        ? 48000
        : year < 1940
          ? 70000
          : 90000
      : carrier
        ? 55000
        : role === "CA"
          ? 20000
          : role === "CL"
            ? 15000
            : sub
              ? 3500
              : ["AO", "AD"].includes(role)
                ? 30000
                : 5500,
    maxCaliber: capital
      ? year < 1930
        ? 457
        : 508
      : role === "CA"
        ? 254
        : role === "CL"
          ? 155
          : 150,
    maxSpeed: sub ? 24 : capital ? 36 : carrier ? 37 : 45,
    maxAir: carrier ? (year < 1930 ? 70 : 120) : 0,
    maxHP: sub
      ? year < 1930
        ? 6000
        : 12000
      : capital || carrier
        ? year < 1930
          ? 180000
          : 300000
        : ["CA", "CL"].includes(role)
          ? 150000
          : ["AO", "AD"].includes(role)
            ? 50000
            : 90000,
  };
}
function checkNumber(r, k, min, max) {
  if (!Number.isFinite(r[k]) || r[k] < min || r[k] > max)
    throw Error(k + " must be between " + min + " and " + max + ".");
}
export function evaluateDesign(recipe, nation) {
  const r = recipe,
    { role, year } = r;
  if (
    !DESIGN_ROLES[role] ||
    !Number.isInteger(year) ||
    year < 1900 ||
    year > 7500
  )
    throw Error("Choose a valid role and year.");
  if (
    typeof r.name !== "string" ||
    r.name.trim().length < 2 ||
    r.name.length > 70
  )
    throw Error("Give the class a name of 2–70 characters.");
  const limits = designLimits(year, role),
    sub = role === "SS",
    support = ["AO", "AD"].includes(role),
    capital = ["BB", "BC"].includes(role);
  const bounds = {
    hp: [sub ? 200 : 2000, limits.maxHP],
    caliber: [0, limits.maxCaliber],
    guns: [0, sub ? 2 : 16],
    torpedoes: [0, 24],
    armor: [0, sub ? 30 : 450],
    deckArmor: [0, sub ? 15 : 200],
    aa: [0, year < 1930 ? 16 : 100],
    fuel: [
      sub ? 40 : 150,
      capital || role === "CV" ? 12000 : support ? 18000 : sub ? 600 : 4000,
    ],
    aircraft: [0, limits.maxAir],
  };
  for (const [k, [min, max]] of Object.entries(bounds))
    checkNumber(r, k, min, max);
  for (const k of [
    "hp",
    "guns",
    "torpedoes",
    "armor",
    "deckArmor",
    "aa",
    "fuel",
    "aircraft",
  ])
    if (!Number.isInteger(r[k]))
      throw Error("Use whole numbers for components.");
  if (r.guns && r.caliber < 75)
    throw Error("A main battery needs a caliber of at least 75 mm.");
  if (
    !Array.isArray(r.features) ||
    new Set(r.features).size !== r.features.length ||
    r.features.some((k) => !SHIP_FEATURES[k] || SHIP_FEATURES[k].year > year)
  )
    throw Error("A selected feature is unavailable in this year.");
  if (sub && r.features.some((k) => ["bulges", "catapult"].includes(k)))
    throw Error("This feature is unsuitable for a submarine.");
  const scale = {
      BB: 1,
      BC: 0.95,
      CV: 0.6,
      CA: 0.32,
      CL: 0.2,
      DD: 0.04,
      SS: 0.04,
      AO: 0.25,
      AD: 0.25,
    }[role],
    base = {
      BB: 16000,
      BC: 14500,
      CV: 6500,
      CA: 4200,
      CL: 2700,
      DD: 650,
      SS: 300,
      AO: 4200,
      AD: 5000,
    }[role];
  const machinery =
      r.hp * (sub ? 0.035 : role === "DD" ? 0.014 : year < 1930 ? 0.026 : 0.02),
    weapons =
      r.guns * Math.pow(r.caliber / 100, 2.8) * 24 +
      r.torpedoes * (sub ? 6 : 12) +
      r.aa * 1.2;
  const armor = (r.armor * 14 + r.deckArmor * 18) * scale,
    aircraft = r.aircraft * 65,
    features = r.features.reduce(
      (sum, k) =>
        sum +
        {
          sonar: 12,
          radar: 25,
          director: 35,
          bulges: base * 0.08,
          catapult: 75,
          damage_control: base * 0.025,
        }[k],
      0,
    );
  const hull = base + (sub ? 180 : 0) + (support ? 2500 : 0),
    fuel = r.fuel,
    tons =
      Math.ceil(
        (hull + machinery + weapons + armor + aircraft + features + fuel) / 10,
      ) * 10;
  const speed = +(
    Math.cbrt(
      (r.hp * (sub ? 100 : capital ? 190 : 220)) / Math.pow(tons, 2 / 3),
    ) * (r.features.includes("bulges") ? 0.97 : 1)
  ).toFixed(1);
  const cruise = Math.min(18, speed * 0.55),
    consumption =
      r.hp *
      Math.pow(cruise / speed, 3) *
      (sub ? 0.00027 : year < 1930 ? 0.0005 : 0.00042),
    rangeKm = Math.round(
      cruise *
        1.852 *
        Math.min(90 * 24, r.fuel / Math.max(0.05, consumption)) *
        0.85,
    );
  const cost = Math.round(
      tons * 0.42 +
        weapons * 0.8 +
        machinery * 0.3 +
        aircraft * 0.3 +
        features * 0.8,
    ),
    fee = Math.max(200, Math.round(cost * 0.08));
  const raw = {
    id: r.id,
    nation,
    name: r.name.trim(),
    type: role,
    features: [...r.features],
    design_year: year,
    displacement: { standard_tons: tons },
    cost_gold: cost,
    treaty_category: capital
      ? "capital_ship"
      : role === "CV"
        ? "aircraft_carrier"
        : "other",
    armament: {
      main_battery: { count: r.guns, caliber_mm: r.caliber },
      torpedo_tubes: { count: r.torpedoes },
      aa_battery: [{ count: r.aa, caliber_mm: year < 1930 ? 40 : 25 }],
    },
    protection: { belt_mm: r.armor, deck_mm: r.deckArmor },
    propulsion: { shp: r.hp, speed_kn: speed, range_nm: rangeKm / 1.852 },
    aviation: { aircraft_capacity: r.aircraft },
    complement: Math.ceil(
      tons * (sub ? 0.045 : role === "DD" ? 0.075 : 0.035) + r.aircraft * 2,
    ),
    speed_submerged: sub
      ? {
          surfaced_kn: speed,
          sprint_kn: year < 1930 ? 8 : year < 1940 ? 9 : 12,
        }
      : undefined,
    sensors: r.features.flatMap((k) =>
      k === "radar" ? ["rad-draft"] : k === "sonar" ? ["snr-draft"] : [],
    ),
  };
  const ship = {
    ...normalizeClass(raw, {}),
    custom: true,
    service: support ? "support" : "warship",
    supportKind: role === "AO" ? "oiler" : role === "AD" ? "depot" : undefined,
    scoutAircraft: r.features.includes("catapult") ? 2 : 0,
    notes:
      "Ministry component design; calculated displacement, endurance and performance.",
  };
  const valid =
    tons <= limits.maxTons &&
    tons >= limits.minTons &&
    speed <= limits.maxSpeed &&
    rangeKm >= 800;
  return {
    ship,
    tons,
    speed,
    rangeKm,
    used: tons,
    free: limits.maxTons - tons,
    fee,
    gold: cost,
    industry: tons,
    valid,
    limits,
    weights: { hull, machinery, weapons, armor, aircraft, features, fuel },
  };
}
export function automaticDraft(s, c, role = "DD", id = s.player) {
  const year = new Date(s.day * 86400000).getUTCFullYear(),
    n = s.nations[id],
    old = c.nations[id].designs
      .map((k) => c.classes[k])
      .filter((x) => x.type === role && x.year <= year)
      .sort((a, b) => b.year - a.year)[0],
    lim = designLimits(year, role);
  const base = {
    BB: [80000, 356, 8, 0, 280, 90, 12, 4000, 0],
    BC: [100000, 356, 8, 0, 220, 65, 12, 4500, 0],
    CV: [90000, 127, 8, 0, 60, 40, 20, 4500, year < 1930 ? 40 : 60],
    CA: [80000, 203, 8, 8, 100, 40, 12, 1600, 0],
    CL: [65000, 152, 8, 8, 65, 25, 12, 1000, 0],
    DD: [36000, 127, 4, 8, 0, 0, 6, 450, 0],
    SS: [2200, 100, 1, 6, 0, 0, 2, 200, 0],
    AO: [10000, 100, 2, 0, 0, 0, 4, 800, 0],
    AD: [12000, 127, 4, 0, 20, 10, 8, 1200, 0],
  }[role];
  const r = {
    kind: "ship",
    role,
    year,
    name: c.nations[id].name + " " + year + " " + role,
    features: [
      "director",
      ...(year >= 1939 && n.tech.radar >= 6 ? ["radar"] : []),
      ...(["DD", "SS"].includes(role) ? ["sonar"] : []),
    ],
  };
  [
    "hp",
    "caliber",
    "guns",
    "torpedoes",
    "armor",
    "deckArmor",
    "aa",
    "fuel",
    "aircraft",
  ].forEach((k, i) => (r[k] = base[i]));
  if (old) {
    r.caliber = clamp(old.caliber || r.caliber, 75, lim.maxCaliber);
    r.guns = clamp(old.barrels || r.guns, 0, role === "SS" ? 2 : 16);
  }
  const escorts =
    n.fleets?.filter((f) => ["guard", "escort", "asw"].includes(f.mission))
      .length || 0;
  if (role === "DD" && escorts > (n.fleets?.length || 0) / 2) {
    r.torpedoes = Math.min(6, r.torpedoes);
    r.fuel = Math.round(r.fuel * 1.15);
  }
  r.hp = Math.min(r.hp, lim.maxHP);
  r.aa = Math.min(r.aa, year < 1930 ? 16 : 100);
  for (let i = 0; i < 50 && !evaluateDesign(r, id).valid; i++) {
    const e = evaluateDesign(r, id);
    if (e.speed > lim.maxSpeed) r.hp = Math.round(r.hp * 0.9);
    else if (e.tons > lim.maxTons) {
      r.fuel = Math.max(role === "SS" ? 40 : 150, Math.floor(r.fuel * 0.92));
      r.armor = Math.floor(r.armor * 0.9);
      if (i > 20 && r.guns > 2) r.guns--;
    } else r.fuel += 100;
  }
  return r;
}
export function commissionDraft(s, c, recipe, id = s.player) {
  const n = s.nations[id],
    year = new Date(s.day * 86400000).getUTCFullYear();
  n.customDesigns ??= [];
  if (n.customDesigns.length >= 80)
    throw Error("The ministry already has 80 draft classes.");
  if (recipe.year !== year)
    throw Error("A new draft must use the current year.");
  if (recipe.features?.includes("radar") && n.tech.radar < 6)
    throw Error("Operational radar requires detection level 6.");
  const clean = Object.fromEntries(
    [
      "kind",
      "role",
      "year",
      "name",
      "hp",
      "caliber",
      "guns",
      "torpedoes",
      "armor",
      "deckArmor",
      "aa",
      "fuel",
      "aircraft",
      "features",
    ].map((k) => [k, recipe[k]]),
  );
  clean.id = "draft-" + id + "-" + s.nextId;
  const result = evaluateDesign(clean, id);
  if (!result.valid)
    throw Error(
      "The derived displacement, speed or endurance exceeds this role’s feasible limits. Adjust the components.",
    );
  if (n.gold < result.fee)
    throw Error(
      "Not enough gold for the " + result.fee + " gold drafting fee.",
    );
  n.gold -= result.fee;
  s.nextId++;
  n.customDesigns.push(clean);
  return result;
}
