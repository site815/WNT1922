import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/aircraft-designer.md");
export const AIR_ROLES = data.AIR_ROLES;
export const AIR_FEATURES = data.AIR_FEATURES;
export const aircraftLimits = (year) => ({
  maxHP:
    year < 1926
      ? 600
      : year < 1932
        ? 900
        : year < 1938
          ? 1400
          : year < 1943
            ? 2100
            : 3000,
  maxBomb: year < 1930 ? 1000 : year < 1940 ? 2500 : 5000,
  maxEngines: 4,
});
export function evaluateAircraft(r, nation) {
  if (
    !AIR_ROLES[r.role] ||
    !Number.isInteger(r.year) ||
    r.year < 1922 ||
    r.year > 7500 ||
    typeof r.name !== "string" ||
    r.name.trim().length < 2 ||
    r.name.length > 70
  )
    throw Error("Choose a valid aircraft role, year and name.");
  const limits = aircraftLimits(r.year),
    bounds = {
      hp: [100, limits.maxHP],
      engines: [1, 4],
      guns: [0, 12],
      caliber: [7, 30],
      bombs: [0, limits.maxBomb],
      armor: [0, 600],
      fuel: [80, 6000],
    };
  for (const [k, [lo, hi]] of Object.entries(bounds))
    if (
      !Number.isFinite(r[k]) ||
      r[k] < lo ||
      r[k] > hi ||
      !Number.isInteger(r[k])
    )
      throw Error(
        k + " must be a whole number between " + lo + " and " + hi + ".",
      );
  if (r.caliber > 13 && r.year < 1930 && r.guns)
    throw Error(
      "Air cannon fits open in 1930; use rifle-caliber guns for this design.",
    );
  if (
    !Array.isArray(r.features) ||
    new Set(r.features).size !== r.features.length ||
    r.features.some((k) => !AIR_FEATURES[k] || AIR_FEATURES[k].year > r.year)
  )
    throw Error("A selected aircraft feature is unavailable in this year.");
  const has = (k) => r.features.includes(k),
    crew =
      r.role === "fighter"
        ? r.engines > 1
          ? 2
          : 1
        : r.engines > 2
          ? 6
          : r.engines > 1
            ? 4
            : 2;
  const engines =
      r.engines *
      (r.hp * (r.year < 1930 ? 0.7 : r.year < 1940 ? 0.55 : 0.46) + 100),
    weapons = r.guns * (r.caliber <= 8 ? 22 : r.caliber <= 13 ? 40 : 85),
    features = r.features.reduce(
      (v, k) =>
        v +
        {
          carrier: 120,
          folding: 70,
          floats: 260,
          self_sealing: r.fuel * 0.12,
          radar: 120,
          laminar: 50,
          jet: 150,
        }[k],
      0,
    );
  const structure = 350 + (engines + weapons + r.armor + features) * 0.65,
    empty = Math.round(structure + engines + weapons + r.armor + features),
    loaded = empty + r.fuel + r.bombs + crew * 90;
  const totalHP = r.hp * r.engines,
    eraSpeed = 230 + Math.min(28, r.year - 1922) * 15;
  const speed = Math.round(
      eraSpeed *
        Math.pow(totalHP / loaded / 0.5, 0.25) *
        (has("floats") ? 0.83 : 1) *
        (has("laminar") ? 1.1 : 1) *
        (has("jet") ? 1.45 : 1),
    ),
    cruise = Math.round(speed * 0.74);
  const burn =
      totalHP * 0.45 * (has("jet") ? 0.7 : r.year < 1930 ? 0.38 : 0.29),
    ferry = Math.round(((cruise * r.fuel) / burn) * 0.85),
    radius = Math.round(ferry * 0.42);
  const valid =
    (r.role !== "fighter" || r.guns > 0) &&
    (!["strike", "multirole"].includes(r.role) || r.bombs >= 100) &&
    radius >= 100 &&
    speed >= 130 &&
    loaded <= 25000 &&
    (!has("carrier") ||
      (r.engines <= 2 && loaded <= 10000 && !has("floats"))) &&
    (!has("jet") || !has("floats")) &&
    (!has("folding") || has("carrier"));
  const gold = Math.round(
      empty / 100 + totalHP / 90 + weapons / 40 + features / 80,
    ),
    fee = Math.max(150, Math.round(gold * 12));
  const aircraft = {
    id: r.id,
    name: r.name.trim(),
    nation,
    type_year: r.year,
    role: r.role,
    custom: true,
    features: [...r.features],
    armor_kg: r.armor,
    cost_gold: gold,
    crew: { normal: crew },
    weights: { empty_kg: empty, max_takeoff_kg: loaded },
    performance: {
      speed_kmh: { sea_level: speed, cruise },
      ceiling_m: Math.min(12000, 5000 + (r.year - 1922) * 150),
    },
    fuel: { combat_radius_km: radius, ferry_range_km: ferry },
    engine: { power_hp: r.hp, count: r.engines },
    bomb_load_kg: r.bombs,
    armament: { guns: r.guns, caliber_mm: r.caliber, bomb_load_kg: r.bombs },
    basing: { carrier: has("carrier"), floatplane: has("floats"), land: true },
    notes:
      r.guns +
      " × " +
      r.caliber +
      " mm guns; " +
      r.bombs +
      " kg bomb/torpedo payload; " +
      r.armor +
      " kg armor.",
  };
  return {
    aircraft,
    valid,
    fee,
    gold,
    industry: empty / 80,
    empty,
    loaded,
    speed,
    cruise,
    radius,
    ferry,
    limits,
    weights: {
      structure,
      engines,
      weapons,
      armor: r.armor,
      features,
      fuel: r.fuel,
      payload: r.bombs,
      crew: crew * 90,
    },
  };
}
export function automaticAircraftDraft(s, c, role = "fighter", id = s.player) {
  const year = new Date(s.day * 86400000).getUTCFullYear(),
    limits = aircraftLimits(year);
  return {
    kind: "aircraft",
    role,
    year,
    name: c.nations[id].name + " " + year + " " + AIR_ROLES[role],
    hp: Math.round(limits.maxHP * 0.8),
    engines: 1,
    guns: role === "fighter" ? 4 : 2,
    caliber: year < 1930 ? 8 : 13,
    bombs:
      role === "fighter" ? 0 : role === "scout" ? 100 : year < 1930 ? 300 : 600,
    armor: year < 1930 ? 10 : 50,
    fuel: role === "fighter" ? 350 : 600,
    features:
      role === "scout"
        ? ["floats"]
        : ["carrier", "folding", ...(year >= 1936 ? ["self_sealing"] : [])],
  };
}
export function commissionAircraft(s, c, recipe, id = s.player) {
  const n = s.nations[id];
  n.customAircraft ??= [];
  if (n.customAircraft.length >= 80)
    throw Error("The ministry already has 80 aircraft drafts.");
  if (recipe.year !== new Date(s.day * 86400000).getUTCFullYear())
    throw Error("Use the current campaign year.");
  if (recipe.features?.includes("radar") && n.tech.radar < 6)
    throw Error("Airborne radar requires detection level 6.");
  const clean = Object.fromEntries(
    [
      "kind",
      "role",
      "year",
      "name",
      "hp",
      "engines",
      "guns",
      "caliber",
      "bombs",
      "armor",
      "fuel",
      "features",
    ].map((k) => [k, recipe[k]]),
  );
  clean.id = "airdraft-" + id + "-" + s.nextId;
  const r = evaluateAircraft(clean, id);
  if (!r.valid)
    throw Error(
      "The aircraft needs at least 100 km combat radius and a feasible speed, weight and basing fit.",
    );
  if (n.gold < r.fee)
    throw Error("Not enough gold for the aircraft drafting fee.");
  n.gold -= r.fee;
  s.nextId++;
  n.customAircraft.push(clean);
  n.aircraft[clean.id] = 0;
  n.aircraftUnlocked.push(clean.id);
  return r;
}
