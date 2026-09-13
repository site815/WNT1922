import { aircraftMaterialCost, strategicFactor } from "./strategic-materials.mjs";
import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/government-aviation.md");
import {
  aircraftSeats,
  operationalAircraftModels,
  governmentModel,
} from "./naval-resources.mjs";
import {
  addWing,
  aviationOwner,
  airWarehouse,
  freeAircraft,
} from "./base-aviation.mjs";
import { portSpec } from "./port-catalog.mjs";
// Other-service maritime units have a separate establishment and aircrew pool.
// Their replacement airframes start at home and use the same physical ferry /
// merchant transport system as naval reinforcements.
export const governmentCapacity = (s, port) =>
  Math.floor(
    portSpec(s, port).aircraft * (s.ports?.[port]?.health ?? 1) * 0.25,
  );
export const navalBaseCapacity = (s, port) =>
  Math.floor(
    portSpec(s, port).aircraft * (s.ports?.[port]?.health ?? 1) * 0.75,
  );
export const GOVERNMENT_SHARES = data.GOVERNMENT_SHARES;
export function currentGovernmentModels(s, c, id) {
  const year = new Date(s.day * 86400000).getUTCFullYear();
  return Object.keys(GOVERNMENT_SHARES)
    .map(
      (role) =>
        (c.nations[id].armyAircraft || [])
          .filter((a) => a.role === role && a.type_year <= year)
          .sort((a, b) => b.type_year - a.type_year)[0],
    )
    .filter(Boolean);
}
export function initializeGovernmentAviation(s, c) {
  for (const [id, n] of Object.entries(s.nations)) {
    n.airSorties ??= [];
    n.anchorageReports ??= {};
    if (n.governmentAircraft) continue;
    n.governmentAircraft = Object.fromEntries(
      (c.nations[id].armyAircraft || []).map((a) => [a.id, 0]),
    );
    n.governmentAviators = 0;
    n.governmentLosses = { planes: 0, crews: 0, rescued: 0 };
    n.governmentRetired = 0;
    n.governmentMonth = s.day;
    const models = currentGovernmentModels(s, c, id);
    for (const [port, b] of Object.entries(n.airBases || {})) {
      b.governmentWing = [];
      for (const [i, a] of models.entries()) {
        const count = Math.floor(
          governmentCapacity(s, port) * GOVERNMENT_SHARES[a.role],
        );
        if (!count) continue;
        n.governmentAircraft[a.id] += count;
        n.governmentAviators += count * aircraftSeats(a);
        addWing(b.governmentWing, {
          model: a.id,
          role:
            a.role === "maritime_patrol"
              ? "scout"
              : a.role === "strategic_bomber"
                ? "bomber"
                : a.role === "fighter"
                  ? "fighter"
                  : "strike",
          count,
          crewed: count,
        });
      }
    }
  }
}
export function governmentProduction(s, c, id) {
  const n = s.nations[id],
    date = new Date(s.day * 86400000);
  retireGovernmentAircraft(s, c, id);
  if (
    date.getUTCDate() !== 1 ||
    n.governmentMonth === s.day ||
    !airWarehouse(s, id)
  )
    return;
  n.governmentMonth = s.day;
  const capacity = Object.keys(n.airBases)
      .filter((p) => aviationOwner(s, p) === id)
      .reduce((v, p) => v + governmentCapacity(s, p), 0),
    current = currentGovernmentModels(s, c, id),
    models = new Map(operationalAircraftModels(c, id).map((a) => [a.id, a]));
  /* Monthly procurement replaces retired aircraft through the normal warehouse
     and physical reinforcement routes. It does not create a free replacement. */
  for (const a of currentGovernmentModels(s, c, id)) {
    const desired = Math.ceil(capacity * GOVERNMENT_SHARES[a.role] * 1.25),
      owned = operationalAircraftModels(c, id)
        .filter((m) => governmentModel(m) && m.role === a.role)
        .reduce((v, m) => v + (n.governmentAircraft[m.id] || 0), 0);
    const requested = Math.max(0, Math.min(Math.ceil(capacity / 12),
      desired - (n.governmentAircraft[a.id] || 0), Math.ceil(capacity * 2) - owned));
    const materials = aircraftMaterialCost(a), gold = a.cost_gold || 0, industry = (a.weights?.empty_kg || 2500) / 80;
    const count = Math.max(0, Math.floor(Math.min(requested * strategicFactor(n), n.strategic / materials,
      gold ? n.gold / gold : Infinity, n.industry / industry)));
    n.strategic -= count * materials;
    n.strategicSpent.production += count * materials;
    n.gold -= count * gold;
    n.industry -= count * industry;
    n.governmentAircraft[a.id] += count;
    n.governmentAviators += count * aircraftSeats(a);
  }
}
export function retireGovernmentAircraft(s, c, id) {
  const n = s.nations[id], current = currentGovernmentModels(s, c, id),
    models = new Map(operationalAircraftModels(c, id).map(a => [a.id, a]));
  const obsolete = model => governmentModel(models.get(model)) &&
    current.some(a => a.role === models.get(model).role && a.type_year > models.get(model).type_year);
  const retire = (model, count, crewed) => {
    n.governmentAircraft[model] -= count;
    n.governmentAviators = Math.max(0, n.governmentAviators - crewed * aircraftSeats(models.get(model)));
    n.governmentRetired = (n.governmentRetired || 0) + count;
  };
  // Grounded wings retire immediately. Flights and transports retain their real
  // aircraft until they return; the next daily pass retires those arrivals.
  for (const [port, b] of Object.entries(n.airBases))
    for (const w of [...b.reserve, ...(b.governmentWing || [])])
      if (
        obsolete(w.model)
      ) {
        retire(w.model, w.count, w.crewed);
        w.count = 0;
        w.crewed = 0;
      }
  for (const [model, count] of Object.entries(freeAircraft(n))) {
    if (count && obsolete(model)) retire(model, count, count);
  }
}
