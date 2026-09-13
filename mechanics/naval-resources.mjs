import { strategicFactor, consumeStrategic, aircraftMaterialCost } from "./strategic-materials.mjs";
import { daysInMonth } from "./economy-rules.mjs";
import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/naval-resources.md");
import { aircraftFitsShip } from "./aircraft-compatibility.mjs";
import {
  allocatedWings,
  freeAircraft,
  airWarehouse,
  releaseShipAircraft,
} from "./base-aviation.mjs";
import { portSpec } from "./port-catalog.mjs";
import { HOME_PORT } from "./world.mjs";
import { upgradeLevel, facilityFactor, industryFactor } from "./levels.mjs";
import { aircraftQuality } from "./aircraft-quality.mjs";
import { initializeTraining, trainPersonnel } from "./personnel-training.mjs";
import { economyFor } from "./balance.mjs";
import {
  initializeRecovery,
  recordCasualties,
  recoverDue,
} from "./recovery.mjs";
import { fleetService } from "./catalog.mjs";
export const SYSTEMS_REVISION = data.SYSTEMS_REVISION;
import { merchantEconomy } from "./merchant-economy.mjs";
export const SPEEDS = data.SPEEDS;
export const CLOSED_LINES = data.CLOSED_LINES;
export function productionBlock(
  s,
  c,
  classId,
  id = s.player,
  { includeFuture = false } = {},
) {
  const cl = c.classes[classId];
  if (!cl) return "Unknown design.";
  if (fleetService(cl) === "merchant")
    return "Civilian merchants are financed and delivered outside the naval construction catalog.";
  if (cl.year > year(s) && !includeFuture)
    return "Development opens in " + cl.year + ".";
  const next = CLOSED_LINES[classId];
  if (next && c.nations[id].designs.includes(next) && c.classes[next]?.year <= year(s))
    return "Production superseded by " + c.classes[next].name + ".";
  if (cl.buildUntil && year(s) > cl.buildUntil)
    return "This production line is obsolete.";
  const life = ["BB", "BC"].includes(cl.type)
    ? 18
    : ["CV", "CVL"].includes(cl.type)
      ? 13
      : cl.type === "SS"
        ? 10
        : 14;
  if (!cl.supportHybrid && year(s) - cl.year > life)
    return "Obsolete construction: commission a current design draft.";
  return "";
}
export function aircraftModels(c, id) {
  return c.nations[id].aircraft || [];
}
export function operationalAircraftModels(c, id) {
  return [...aircraftModels(c, id), ...(c.nations[id].armyAircraft || [])];
}
export const governmentModel = (a) => a?.catalogKind === "government";
export const modelAvailable = (s, n, a) =>
  a.type_year <= year(s);
export function planeRole(a) {
  return /multirole/.test(a.role)
    ? "multirole"
    : a.role === "strategic_bomber"
      ? "bomber"
      : a.role === "fighter"
        ? "fighter"
        : /scout|patrol/.test(a.role)
          ? "scout"
          : "strike";
}
export const aircraftSeats = (a) => a?.crew?.normal || 1;
const seats = aircraftSeats;
const year = (s) => new Date(s.day * 86400000).getUTCFullYear();
const expend = (n, p) => {
  for (const k of ["gold", "influence", "industry", "strategic"])
    if (n[k] < p[k]) throw new Error(`Not enough ${k}.`);
  for (const k of ["gold", "influence", "industry", "strategic"]) n[k] -= (p[k] || 0);
  n.strategicSpent.production += p.strategic || 0;
};
export function initializeResources(s, c) {
  const previous = s.systemsRevision;
  for (const [id, n] of Object.entries(s.nations)) {
    const models = aircraftModels(c, id),
      current = models
        .filter((a) => a.type_year <= year(s))
        .sort((a, b) => b.type_year - a.type_year);
    initializeRecovery(n);
    initializeTraining(s, n);
    n.industryFunding ??= c.nations[id].starting.funding;
    n.productionAutomatic ??= Object.fromEntries(["fighter","strike","scout"].map(role=>[role,data.AUTOMATIC_PRODUCTION_DEFAULT]));
    if (n.aircraft) {
      for (const a of models) n.aircraft[a.id] ??= 0;
      n.aviatorsYear ??= economyFor(s, id).aviatorsYear;
      if (previous === 1) {
        n.casualties.aircraft.lost = n.aircraftLost || 0;
        n.casualties.aviators.lost = n.aviatorsLost || 0;
      }
      allocateAircraft(s, c, id);
      continue;
    }
    n.aircraft = {};
    n.airOrders = [];
    n.schoolFunding = c.nations[id].starting.funding;
    n.aviatorFunding = c.nations[id].starting.funding;
    n.aircraftFunding = c.nations[id].starting.funding;
    n.productionModels = {
      fighter:
        current.find((a) => ["fighter", "multirole"].includes(planeRole(a)))
          ?.id || null,
      strike:
        current.find((a) => ["strike", "multirole"].includes(planeRole(a)))
          ?.id || null,
      scout:
        current.find((a) => ["scout", "multirole"].includes(planeRole(a)))
          ?.id || null,
    };
    n.airProductionCarry = {};
    const capacity = n.groups
      .filter(
        (g) =>
          !["sunk", "scrapped", "building", "converting", "trials"].includes(
            g.status,
          ),
      )
      .reduce(
        (v, g) =>
          v +
          (c.classes[g.classId].air + c.classes[g.classId].scoutAircraft) *
            g.count,
        0,
      );
    for (const a of models) n.aircraft[a.id] = 0;
    const carrierTypes = ["fighter", "strike"]
        .map((role) =>
          current.find((a) => [role, "multirole"].includes(planeRole(a))),
        )
        .filter((a, i, all) => a && all.indexOf(a) === i),
      scoutTypes = current.filter((a) =>
        ["scout", "multirole"].includes(planeRole(a)),
      );
    const choices = carrierTypes.length ? carrierTypes : scoutTypes;
    for (const a of choices)
      n.aircraft[a.id] = Math.ceil(
        (capacity * 1.15) / Math.max(1, choices.length),
      );
    const scout = scoutTypes[0];
    if (scout)
      n.aircraft[scout.id] = Math.max(
        n.aircraft[scout.id],
        Math.ceil(capacity * 0.25),
      );
    n.aviators = Math.ceil(
      Object.entries(n.aircraft).reduce(
        (v, [k, count]) => v + count * seats(models.find((a) => a.id === k)),
        0,
      ) *
        1.1 +
        Math.max(25, economyFor(s, id).aviatorsYear / 4),
    );
    n.crewYear =
      economyFor(s, id).crewYear * facilityFactor(n.tech, "school", 0.25);
    n.aviatorsYear =
      economyFor(s, id).aviatorsYear * facilityFactor(n.tech, "pilots", 0.3);
    n.aircraftLost = 0;
    n.aviatorsLost = 0;
    n.merchantLost ??= 0;
    n.merchantSunk ??= 0;
    n.merchantLostGRT ??= 0;
    n.merchantSunkGRT ??= 0;
    for (const g of n.groups) g.airWing = [];
    allocateAircraft(s, c, id, { initial: true });
  }
  s.systemsRevision = SYSTEMS_REVISION;
  s.alerts ??= [];
  s.audioEnabled ??= true;
  s.audioVolume ??= 0.5;
}
export function aircraftSummary(s, c, id = s.player) {
  const n = s.nations[id],
    models = aircraftModels(c, id),
    total = Object.values(n.aircraft || {}).reduce((a, b) => a + b, 0);
  const aviatorsRequired = models.reduce(
    (v, a) => v + (n.aircraft[a.id] || 0) * seats(a),
    0,
  );
  let assigned = 0,
    required = 0,
    crewed = 0;
  for (const g of n.groups) {
    if (
      ["sunk", "scrapped", "building", "converting", "trials"].includes(
        g.status,
      )
    )
      continue;
    const cl = c.classes[g.classId];
    if (g.status === "active")
      required += (cl.air + cl.scoutAircraft) * g.count;
    for (const w of g.airWing || []) {
      assigned += w.count;
      crewed += w.crewed || 0;
    }
  }
  const stationed = Object.values(n.airBases || {}).reduce(
      (v, b) => v + b.airWing.reduce((v, w) => v + w.count, 0),
      0,
    ),
    transit = [...(n.airTransfers || []), ...(n.airSorties || [])].reduce(
      (v, t) =>
        v +
        t.airWing
          .filter((w) => Object.hasOwn(n.aircraft, w.model))
          .reduce((v, w) => v + w.count, 0),
      0,
    );
  const shoreRequired = Object.keys(n.airBases || {}).reduce(
    (v, port) =>
      v +
      Math.floor(portSpec(s, port).aircraft * (s.ports?.[port]?.health ?? 1)),
    0,
  );
  const airborne = (n.airSorties || []).reduce(
    (v, o) =>
      v +
      o.airWing
        .filter((w) => Object.hasOwn(n.aircraft, w.model))
        .reduce((v, w) => v + w.count, 0),
    0,
  );
  return {
    total,
    assigned,
    stationed,
    transit,
    airborne,
    shoreRequired,
    reserve: Math.max(0, total - assigned - stationed - transit),
    required,
    aviatorsRequired,
    aviators: n.aviators,
    aviatorBalance: Math.floor(n.aviators) - aviatorsRequired,
    crewed,
    uncrewed: total - (n.crewedAircraft || 0),
    coverage: Math.min(1, n.aviators / Math.max(1, aviatorsRequired)),
  };
}
export function staffAircraft(s, c, id) {
  const n = s.nations[id],
    models = new Map(aircraftModels(c, id).map((a) => [a.id, a]));
  let people = Math.floor(n.aviators),
    crewed = 0;
  const locked = [],
    refill = [];
  for (const g of n.groups)
    for (const w of g.airWing || []) (g.atSea ? locked : refill).push(w);
  for (const [port, b] of Object.entries(n.airBases || {}))
    for (const w of [...b.airWing, ...b.reserve])
      (port === airWarehouse(s, id) ? refill : locked).push(w);
  for (const t of [...(n.airTransfers || []), ...(n.airSorties || [])])
    locked.push(...t.airWing);
  for (const w of locked) {
    if (!models.has(w.model)) continue;
    const cost = seats(models.get(w.model));
    w.crewed = Math.min(w.count, w.crewed || 0, Math.floor(people / cost));
    people -= w.crewed * cost;
    crewed += w.crewed;
  }
  for (const w of refill) {
    if (!models.has(w.model)) continue;
    const cost = seats(models.get(w.model));
    w.crewed = Math.min(w.count, Math.floor(people / cost));
    people -= w.crewed * cost;
    crewed += w.crewed;
  }
  const free = freeAircraft(n);
  for (const [id, count] of Object.entries(free)) {
    if (!models.has(id)) continue;
    const trained = Math.min(count, Math.floor(people / seats(models.get(id))));
    crewed += trained;
    people -= trained * seats(models.get(id));
  }
  n.shoreWing = Object.values(n.airBases || {}).flatMap((b) =>
    b.airWing.map((w) => ({ ...w })),
  );
  n.crewedAircraft = crewed;
  n.aviatorCoverage = aircraftSummary(s, c, id).coverage;
}
export function allocateAircraft(s, c, id, { initial = false } = {}) {
  const n = s.nations[id],
    models = aircraftModels(c, id),
    free = n.airBases ? freeAircraft(n) : { ...n.aircraft };
  const suitable = (a, role) =>
    planeRole(a) === role ||
    planeRole(a) === "multirole" ||
    (role === "scout" && planeRole(a) === "strike");
  for (const g of n.groups)
    if (
      [
        "sunk",
        "scrapped",
        "reserve",
        "building",
        "converting",
        "trials",
      ].includes(g.status)
    ) {
      if (g.status === "reserve") releaseShipAircraft(s, c, n, g);
      g.airWing = [];
    }
  if (!n.airBases)
    for (const g of n.groups)
      for (const w of g.airWing || []) free[w.model] -= w.count;
  for (const g of n.groups) {
    if (fleetService(c.classes[g.classId]) !== "warship") continue;
    g.airWing ??= [];
    if (
      [
        "sunk",
        "scrapped",
        "reserve",
        "building",
        "converting",
        "trials",
      ].includes(g.status)
    ) {
      g.airWing = [];
      continue;
    }
    const f = n.fleets?.find((f) => f.id === g.fleetId);
    if (
      !initial &&
      (g.atSea || (f && !["port", "refuel", "repair"].includes(f.phase)))
    )
      continue;
    if (
      n.airBases &&
      !initial &&
      (g.dockPort || f?.port || HOME_PORT[id]) !== airWarehouse(s, id)
    )
      continue;
    const candidates = models
      .filter(
        (a) =>
          aircraftFitsShip(a, c.classes[g.classId]) &&
          a.type_year <= year(s) &&
          free[a.id] > 0,
      )
      .sort((a, b) => b.type_year - a.type_year);
    // Replace like-for-like roles only at port. These are transfers between
    // ship and reserve, not production or losses; owned aircraft never change.
    for (const wing of [...g.airWing]) {
      const old = models.find((a) => a.id === wing.model);
      if (!old) continue;
      for (const a of candidates) {
        if (a.type_year <= old.type_year || !suitable(a, wing.role)) continue;
        const take = Math.min(wing.count, free[a.id] || 0);
        if (take <= 0) continue;
        wing.count -= take;
        wing.crewed = Math.min(wing.crewed || 0, wing.count);
        free[wing.model] = (free[wing.model] || 0) + take;
        free[a.id] -= take;
        let replacement = g.airWing.find(
          (w) => w.model === a.id && w.role === wing.role,
        );
        if (replacement) replacement.count += take;
        else
          g.airWing.push({
            model: a.id,
            role: wing.role,
            count: take,
            crewed: 0,
          });
      }
    }
    g.airWing = g.airWing.filter((w) => w.count > 0);
    const cl = c.classes[g.classId],
      capacity = (cl.air + cl.scoutAircraft) * g.count;
    let loaded = g.airWing.reduce((v, w) => v + w.count, 0);
    if (loaded >= capacity) continue;
    // Reserve the scouting complement before strike aircraft fill spare slots.
    const roles = cl.air ? ["fighter", "scout", "strike"] : ["scout"];
    for (const role of roles) {
      const desired = cl.air
        ? role === "fighter"
          ? Math.ceil(capacity * 0.4)
          : role === "strike"
            ? capacity
            : Math.ceil(capacity * 0.1)
        : capacity;
      let existing = g.airWing
        .filter((w) => w.role === role)
        .reduce((v, w) => v + w.count, 0);
      for (const a of candidates) {
        if (!suitable(a, role)) continue;
        const take = Math.min(
          free[a.id],
          capacity - loaded,
          Math.max(0, desired - existing),
        );
        if (take <= 0) continue;
        let w = g.airWing.find((w) => w.model === a.id && w.role === role);
        if (w) w.count += take;
        else g.airWing.push({ model: a.id, role, count: take });
        free[a.id] -= take;
        loaded += take;
        existing += take;
      }
    }
  }
  staffAircraft(s, c, id);
}
export function airPower(s, c, id, g, distanceKm = 0) {
  const models = aircraftModels(c, id);
  let strike = 0,
    fighters = 0,
    scout = 0,
    radius = 0;
  for (const w of g.airWing || []) {
    const a = models.find((a) => a.id === w.model);
    if (!a || !aircraftFitsShip(a, c.classes[g.classId])) continue;
    const factor = aircraftQuality(a, w.role);
    const effective =
      (a.fuel?.combat_radius_km || 0) >= distanceKm ? w.crewed || 0 : 0;
    if (w.role === "fighter") fighters += effective * factor;
    else if (w.role === "strike") strike += effective * factor;
    scout += effective * (w.role === "scout" ? 3 : 0.5);
    if (effective > 0)
      radius = Math.max(radius, (a.fuel?.combat_radius_km || 200) / 1.852);
  }
  return {
    strike,
    fighters,
    scout,
    radius,
    planes: (g.airWing || []).reduce((v, w) => v + w.count, 0),
  };
}
export function aircraftPrice(
  s,
  c,
  model,
  count = 1,
  id = s.player,
) {
  const a = aircraftModels(c, id).find((a) => a.id === model);
  if (!a) throw new Error("Unknown aircraft model.");
  return {
        gold: Math.ceil(a.cost_gold * count),
        influence: Math.max(1, Math.ceil(count / 25)),
        industry: Math.ceil(((a.weights?.empty_kg || 2500) / 80) * count),
        strategic: Math.ceil(aircraftMaterialCost(a) * count),
        days: 90,
      };
}
export function aircraftBlock(s, c, model, id = s.player) {
  const a = aircraftModels(c, id).find((a) => a.id === model);
  return !a
    ? "Unknown aircraft model."
    : a.type_year > year(s)
      ? "Development opens in " + a.type_year + "."
      : "";
}
export function orderAircraft(
  s,
  c,
  model,
  count,
  id = s.player,
) {
  const blocked = aircraftBlock(s, c, model, id);
  if (blocked) throw new Error(blocked);
  const n = s.nations[id];
  if (!Number.isInteger(count) || count < 1 || count > 500)
    throw new Error("Order 1 to 500 aircraft.");
  if (n.airOrders.length >= 12)
    throw new Error("Twelve aircraft programs are already underway.");
  const p = aircraftPrice(s, c, model, count, id);
  expend(n, p);
  const order = {
    id: `air-${s.nextId++}`,
    model,
    count,
    remaining: p.days,
    days: p.days,
    paid: p,
  };
  n.airOrders.push(order);
  return order;
}
export function aircraftProductionPlan(s, c, id = s.player) {
  const n = s.nations[id],
    models = aircraftModels(c, id),
    choices = Object.entries(n.productionModels)
      .filter(
        ([, model]) =>
          model &&
          !aircraftBlock(s, c, model, id),
      )
      .map(([role, model]) => ({
        role,
        model,
        aircraft: models.find((a) => a.id === model),
      }));
  const capacity =
    (economyFor(s, id).aircraftYear *
      facilityFactor(n.tech, "aircraft_factory", 0.35) *
      n.aircraftFunding) /
    365;
  const demand = n.airOrders
      .reduce((v, o) => v + o.count / o.days, 0),
    factor = Math.max(1, demand / Math.max(0.001, capacity));
  return {
    choices,
    capacity,
    demand,
    factor,
    automatic: Math.max(0, capacity - demand / factor),
  };
}
// Planned operating costs at the chosen funding. Actual output and spending
// are lower when reserves cannot pay; procurement and repairs are additional.
export function facilityBudget(s, c, id = s.player) {
  const n = s.nations[id],
    e = economyFor(s, id),
    plan = aircraftProductionPlan(s, c, id),
    annual = plan.automatic * 365,
    average = (fn) =>
      plan.choices.reduce((v, row) => v + fn(row.aircraft), 0) /
      Math.max(1, plan.choices.length);
  const rows = [
    {
      key: "industry",
      label: "Naval industry",
      gold:
        e.goldYear *
        0.12 *
        industryFactor(s, id) *
        n.industryFunding,
      industry: 0,
    },
    {
      key: "aircraft_factory",
      label: "Aircraft factories",
      gold: annual * average((a) => a.cost_gold),
      industry: annual * average((a) => (a.weights?.empty_kg || 2500) / 80),
      strategic: annual * average(aircraftMaterialCost),
    },
    {
      key: "school",
      label: "Naval schools",
      gold: n.crewYear * n.schoolFunding * 3,
      industry: n.crewYear * n.schoolFunding * 0.15,
    },
    {
      key: "pilots",
      label: "Naval aviation schools",
      gold: n.aviatorsYear * n.aviatorFunding * 25,
      industry: n.aviatorsYear * n.aviatorFunding * 2,
    },
  ];
  return {
    rows,
    gold: rows.reduce((v, r) => v + r.gold, 0),
    industry: rows.reduce((v, r) => v + r.industry, 0),
    strategic: rows.reduce((v, r) => v + (r.strategic || 0), 0),
    aircrewDemand: annual * average((a) => seats(a)),
  };
}
export function dailyResources(s, c, log) {
  for (const [id, n] of Object.entries(s.nations)) {
    const recovered = recoverDue(s, n);
    if (id === s.player && Object.values(recovered).some((v) => v))
      log(
        "Recovery complete: " +
          recovered.sailors +
          " sailors, " +
          recovered.aviators +
          " aviators and " +
          recovered.aircraft +
          " aircraft returned.",
        "navy",
      );
    const e = economyFor(s, id),
      scale = industryFactor(s, id) * n.industryFunding;
    const days = daysInMonth(s.day);
    n.gold += e.goldYear / 12 / days;
    n.strategic += e.strategicYear / 12 / days;
    consumeStrategic(s, c, id);
    const operating = (e.goldYear * 0.12 * scale) / 12 / days,
      paid = Math.min(n.gold, operating);
    n.gold -= paid;
    n.industryOperating = operating > 0 ? paid / operating : 1;
    n.industry += e.industryYear * scale / 12 / days * n.industryOperating * strategicFactor(n);
    const fund = (quantity, gold, industry, strategic = 0) => {
      const amount = Math.max(0, Math.min(quantity, n.gold / gold, n.industry / industry,
        strategic ? n.strategic / strategic : Infinity));
      n.gold = Math.max(0, n.gold - amount * gold);
      n.industry = Math.max(0, n.industry - amount * industry);
      n.strategic = Math.max(0, n.strategic - amount * strategic);
      n.strategicSpent.production += amount * strategic;
      return amount;
    };
    trainPersonnel(s, n, fund);
    updateProductionModels(s, c, id);
    const plan = aircraftProductionPlan(s, c, id);
    n.aircraftOutput = 0;
    for (const { model, aircraft: a } of plan.choices) {
      const amount = fund(
        plan.automatic * strategicFactor(n) / Math.max(1, plan.choices.length),
        a.cost_gold,
        (a.weights?.empty_kg || 2500) / 80,
        aircraftMaterialCost(a),
      );
      n.airProductionCarry[model] = (n.airProductionCarry[model] || 0) + amount;
      const done = Math.floor(n.airProductionCarry[model]);
      n.airProductionCarry[model] -= done;
      n.aircraft[model] += done;
      n.aircraftOutput += done;
    }
    for (const o of [...n.airOrders]) {
      o.remaining = Math.max(
        0,
        o.remaining - strategicFactor(n) / plan.factor,
      );
      if (o.remaining > 1e-6) continue;
      n.aircraft[o.model] = (n.aircraft[o.model] || 0) + o.count;
      n.airOrders.splice(n.airOrders.indexOf(o), 1);
      if (id === s.player)
        log(
          `${o.count} aircraft delivered: ${aircraftModels(c, id).find((a) => a.id === o.model).name}.`,
          "industry",
        );
    }
    allocateAircraft(s, c, id);
  }
}
export function setFacilityFunding(s, facility, value, id = s.player) {
  if (
    ![
      "schoolFunding",
      "aviatorFunding",
      "aircraftFunding",
      "industryFunding",
    ].includes(facility) ||
    !Number.isFinite(value) ||
    value < 0.1 ||
    value > 1
  )
    throw new Error("Funding must be between 10% and 100%.");
  s.nations[id][facility] = value;
}
export function setProductionModel(s, c, role, model, id = s.player) {
  const n = s.nations[id],
    a = aircraftModels(c, id).find((a) => a.id === model);
  if (
    !["fighter", "strike", "scout"].includes(role) ||
    !a ||
    aircraftBlock(s, c, model, id) ||
    (planeRole(a) !== role && planeRole(a) !== "multirole")
  )
    throw new Error(
      "Choose an available model suitable for this production role.",
    );
  n.productionModels[role] = model;
  n.productionAutomatic[role] = false;
}
export function updateProductionModels(s, c, id = s.player) {
  const n = s.nations[id];
  for (const role of ["fighter", "strike", "scout"]) {
    if (!n.productionAutomatic[role]) continue;
    const choices = aircraftModels(c, id)
      .filter(a => modelAvailable(s, n, a) && [role, "multirole"].includes(planeRole(a)))
      .sort((a, b) => b.type_year - a.type_year || aircraftQuality(b, role) - aircraftQuality(a, role) || a.id.localeCompare(b.id));
    n.productionModels[role] = choices[0]?.id || null;
  }
}
export function setProductionAutomatic(s, c, role, enabled, id = s.player) {
  if (!["fighter", "strike", "scout"].includes(role) || typeof enabled !== "boolean")
    throw Error("Choose a production line and automatic setting.");
  s.nations[id].productionAutomatic[role] = enabled;
  updateProductionModels(s, c, id);
}
export function loseAircraft(
  s,
  c,
  id,
  g,
  fraction,
  { rescue = 0.25, airframeRescue = 0.08 } = {},
) {
  const n = s.nations[id],
    models = new Map(operationalAircraftModels(c, id).map((a) => [a.id, a]));
  let planes = 0,
    aviators = 0,
    planesRescued = 0,
    aviatorsRescued = 0,
    governmentPlanes = 0,
    governmentCrews = 0;
  for (const w of g.airWing || []) {
    const a = models.get(w.model),
      gov = governmentModel(a),
      ledger = gov ? n.governmentAircraft : n.aircraft,
      removed = Math.min(w.count, Math.floor(w.count * fraction)),
      aircrew = Math.min(w.crewed || 0, removed) * seats(a);
    w.count -= removed;
    w.crewed = Math.max(0, (w.crewed || 0) - Math.min(w.crewed || 0, removed));
    ledger[w.model] = Math.max(0, (ledger[w.model] || 0) - removed);
    if (gov) {
      const saved = Math.floor(aircrew * rescue);
      n.governmentAviators = Math.max(0, n.governmentAviators - aircrew);
      n.governmentLosses.planes += removed;
      n.governmentLosses.crews += aircrew - saved;
      n.governmentLosses.rescued += saved;
      planes += removed;
      aviators += aircrew - saved;
      aviatorsRescued += saved;
      governmentPlanes += removed;
      governmentCrews += aircrew - saved;
      continue;
    }
    const air = recordCasualties(s, n, "aircraft", removed, {
        rescue: airframeRescue,
        model: w.model,
        days: 30,
      }),
      people = Math.min(Math.floor(n.aviators), aircrew);
    n.aviators -= people;
    const crew = recordCasualties(s, n, "aviators", people, {
      rescue,
      days: 21,
    });
    planes += air.lost;
    planesRescued += air.rescued;
    aviators += crew.lost;
    aviatorsRescued += crew.rescued;
  }
  g.airWing = (g.airWing || []).filter((w) => w.count > 0);
  return {
    planes,
    aviators,
    planesRescued,
    aviatorsRescued,
    governmentPlanes,
    governmentCrews,
  };
}
