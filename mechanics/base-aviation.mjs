import { strategicFactor } from "./strategic-materials.mjs";
import { airConditions } from "./air-conditions.mjs";
import { PORTS, NODES, HOME_PORT, distanceNm } from "./world.mjs";
import { portSpec } from "./port-catalog.mjs";
import { campaignMinutes } from "./campaign-clock.mjs";
import {
  aircraftModels,
  operationalAircraftModels,
  aircraftSeats,
  planeRole,
} from "./naval-resources.mjs";
import { fleetPosition } from "./task-forces.mjs";
export const aviationAccess = (s, id, port) => {
  const owner = aviationOwner(s, port),
    r = s.relations[[id, owner].sort().join("-")];
  return owner === id || (r?.allied && !r.war);
};
export const aviationOwner = (s, id) =>
  s.world?.portControl?.[id] || PORTS[id]?.nation;
export const modelFerryKm = (a) =>
  Math.max(
    0,
    a?.fuel?.ferry_km ||
      a?.fuel?.ferry_range_km ||
      a?.fuel?.range_km ||
      (a?.fuel?.combat_radius_km || 0) * 2,
  ) * 0.85;
export const modelCombatKm = (a) => Math.max(0, a?.fuel?.combat_radius_km || 0);
export function addWing(wings, wing) {
  if (!wing.count) return;
  const row = wings.find((w) => w.model === wing.model && w.role === wing.role);
  if (row) {
    row.count += wing.count;
    row.crewed = (row.crewed || 0) + (wing.crewed || 0);
  } else wings.push({ ...wing, crewed: wing.crewed || 0 });
}
export function allocatedWings(n) {
  return [
    ...n.groups.flatMap((g) => g.airWing || []),
    ...Object.values(n.airBases || {}).flatMap((b) => [
      ...b.airWing,
      ...(b.governmentWing || []),
      ...b.reserve,
    ]),
    ...[...(n.airTransfers || []), ...(n.airSorties || [])].flatMap(
      (t) => t.airWing,
    ),
  ];
}
export function freeAircraft(n) {
  const free = { ...n.aircraft, ...n.governmentAircraft };
  for (const w of allocatedWings(n))
    free[w.model] = Math.max(0, (free[w.model] || 0) - w.count);
  return free;
}
export function airWarehouse(s, id) {
  const n = s.nations[id];
  if (n && "airWarehousePort" in n)
    return n.airWarehousePort && aviationOwner(s, n.airWarehousePort) === id
      ? n.airWarehousePort
      : null;
  return chooseAirWarehouse(s, id);
}
export function chooseAirWarehouse(s, id) {
  return aviationOwner(s, HOME_PORT[id]) === id
    ? HOME_PORT[id]
    : Object.keys(PORTS)
        .filter((p) => aviationOwner(s, p) === id)
        .sort((a, b) => portSpec(s, b).capacity - portSpec(s, a).capacity)[0] ||
        null;
}
export function initializeBaseAviation(s, c) {
  for (const [id, n] of Object.entries(s.nations)) {
    if (n.airBases) continue;
    n.airBases = {};
    n.airTransfers = [];
    n.airWarehousePort = chooseAirWarehouse(s, id);
    n.airLog = [];
    const current = aircraftModels(c, id).filter(
      (a) => a.type_year <= new Date(s.day * 86400000).getUTCFullYear(),
    );
    for (const port of Object.keys(PORTS).filter(
      (p) => aviationOwner(s, p) === id,
    )) {
      const base = (n.airBases[port] = {
        airWing: [],
        reserve: [],
        lastSortie: -1e9,
        nextDispatch: -1e9,
      });
      // Explicit provisional opening shore establishments, independent of carrier
      // hangar size. No aircraft from a future development year can be created.
      const count = current.length
        ? Math.floor(portSpec(s, port).aircraft * 0.6)
        : 0;
      for (let i = 0; i < count; i++) {
        const role = i % 5 < 2 ? "fighter" : i % 5 === 2 ? "scout" : "strike",
          choices = current.filter((a) =>
            [role, "multirole"].includes(planeRole(a)),
          );
        const a = (choices.length ? choices : current).sort(
          (a, b) => b.type_year - a.type_year,
        )[0];
        n.aircraft[a.id]++;
        n.aviators += aircraftSeats(a);
        addWing(base.airWing, {
          model: a.id,
          role: choices.length
            ? role
            : planeRole(a) === "multirole"
              ? "strike"
              : planeRole(a),
          count: 1,
          crewed: 1,
        });
      }
    }
  }
}
export function baseAirPower(s, c, port, distanceKm = 0) {
  const id = aviationOwner(s, port),
    n = s.nations[id],
    base = n?.airBases?.[port],
    health = s.ports?.[port]?.health ?? 1;
  if (!base || !c)
    return {
      strike: 0,
      fighters: 0,
      scout: 0,
      radius: 0,
      aircraft: 0,
      crewed: 0,
      sorties: 0,
      readiness: 0,
      wings: [],
    };
  const rows = [...base.airWing, ...(base.governmentWing || [])],
    models = new Map(operationalAircraftModels(c, id).map((a) => [a.id, a])),
    aircraft = rows.reduce((v, w) => v + w.count, 0),
    crewed = rows.reduce((v, w) => v + (w.crewed || 0), 0);
  const readiness = health * strategicFactor(n);
  let strike = 0,
    fighters = 0,
    scout = 0,
    radius = 0,
    sorties = 0;
  const wings = rows.map((w) => {
    const a = models.get(w.model),
      range = modelCombatKm(a),
      quality = 1 + Math.max(0, (a?.type_year || 1922) - 1930) * 0.035,
      effective = (w.crewed || 0) * readiness;
    if (w.role !== "bomber") {
      if (w.crewed > 0) radius = Math.max(radius, range);
      if (range >= distanceKm) {
        sorties += effective;
        if (w.role === "strike") strike += effective * quality * 12;
        else if (w.role === "fighter") fighters += effective * quality * 10;
        else if (w.role === "scout") scout += effective * quality * 3;
      }
    }
    return {
      ...w,
      government: a?.catalogKind === "government",
      name: a?.name || w.model,
      combatKm: range,
      ferryKm: modelFerryKm(a),
    };
  });
  const proficiency =
    (0.5 + (n.training / 100) * 0.65) * (0.65 + (n.morale / 100) * 0.5);
  strike *= proficiency;
  fighters *= proficiency;
  scout *= proficiency;
  return {
    strike,
    fighters,
    scout,
    radius,
    aircraft,
    crewed,
    sorties,
    readiness,
    wings,
    readyAt: base.lastSortie + 360,
  };
}
export function flyBaseSorties(s, c, port, distanceKm) {
  const power = baseAirPower(s, c, port, distanceKm),
    base = s.nations[aviationOwner(s, port)]?.airBases?.[port];
  if (
    !base ||
    campaignMinutes(s) < power.readyAt ||
    !airConditions(s, NODES[port]).launch
  )
    return { ...power, strike: 0, fighters: 0, scout: 0, sorties: 0 };
  base.lastSortie = campaignMinutes(s);
  const factor = airConditions(s, NODES[port]).launch;
  return {
    ...power,
    strike: power.strike * factor,
    fighters: power.fighters * factor,
  };
}
export function releaseShipAircraft(s, c, n, g) {
  if (!g.airWing?.length || !n.airBases) return;
  const f = n.fleets?.find((f) => f.id === g.fleetId),
    port = g.dockPort || f?.port || airWarehouse(s, n.id),
    base = n.airBases[port];
  if (base && aviationOwner(s, port) === n.id)
    for (const w of g.airWing) addWing(base.reserve, w);
  g.airWing = [];
}
export function shipAirLocation(s, n, g) {
  const f = n.fleets?.find((f) => f.id === g.fleetId);
  return f ? fleetPosition(s, f) : NODES[g.dockPort || airWarehouse(s, n.id)];
}
export const aircraftRoleFits = (a, role) =>
  planeRole(a) === role ||
  planeRole(a) === "multirole" ||
  (role === "scout" && planeRole(a) === "strike");
export function wingTargets(capacity, carrier = true) {
  return carrier
    ? {
        fighter: Math.ceil(capacity * 0.4),
        scout: Math.ceil(capacity * 0.1),
        strike: Math.max(
          0,
          capacity - Math.ceil(capacity * 0.4) - Math.ceil(capacity * 0.1),
        ),
      }
    : { scout: capacity };
}
export function aviationLog(s, n, text) {
  n.airLog.unshift({ minute: campaignMinutes(s), text });
  n.airLog = n.airLog.slice(0, 20);
}
