import {
  operationalAircraftModels,
  governmentModel,
  aircraftSeats,
} from "./naval-resources.mjs";
import { aircraftFitsShip } from "./aircraft-compatibility.mjs";
import { PORTS } from "./world.mjs";
export function validateAviation(s, c) {
  const fail = () => {
    throw Error("Invalid aviation inventory or transfer in save.");
  };
  const amount = (v) => Number.isFinite(v) && v >= 0,
    point = (p) =>
      Array.isArray(p) &&
      p.length === 2 &&
      Number.isFinite(p[0]) &&
      Math.abs(p[0]) <= 180 &&
      Number.isFinite(p[1]) &&
      Math.abs(p[1]) <= 90;
  for (const [id, n] of Object.entries(s.nations)) {
    if (n.airWarehousePort !== null && !PORTS[n.airWarehousePort]) fail();
    if (
      !n.airBases ||
      typeof n.airBases !== "object" ||
      Array.isArray(n.airBases) ||
      !Array.isArray(n.airTransfers) ||
      n.airTransfers.length > 1000 ||
      !Array.isArray(n.airSorties) ||
      n.airSorties.length > 32 ||
      !Array.isArray(n.airLog) ||
      n.airLog.length > 20
    )
      fail();
    const models = new Map(
        operationalAircraftModels(c, id).map((a) => [a.id, a]),
      ),
      allocated = {};
    let people = 0,
      governmentPeople = 0;
    if (
      !n.governmentAircraft ||
      Object.keys(n.governmentAircraft).sort().join() !==
        [...models.values()]
          .filter(governmentModel)
          .map((a) => a.id)
          .sort()
          .join() ||
      !Object.values(n.governmentAircraft).every(
        (v) => Number.isInteger(v) && amount(v),
      ) ||
      !amount(n.governmentAviators) ||
      !amount(n.governmentRetired) ||
      !n.governmentLosses ||
      !["planes", "crews", "rescued"].every(
        (k) =>
          Number.isInteger(n.governmentLosses[k]) &&
          amount(n.governmentLosses[k]),
      )
    )
      fail();
    const wings = (rows) => {
      if (!Array.isArray(rows) || rows.length > 250) fail();
      for (const w of rows) {
        if (
          !w ||
          !models.has(w.model) ||
          !["fighter", "strike", "scout", "bomber"].includes(w.role) ||
          !Number.isInteger(w.count) ||
          !amount(w.count) ||
          !Number.isInteger(w.crewed) ||
          !amount(w.crewed) ||
          w.crewed > w.count
        )
          fail();
        allocated[w.model] = (allocated[w.model] || 0) + w.count;
        if (governmentModel(models.get(w.model)))
          governmentPeople += w.crewed * aircraftSeats(models.get(w.model));
        else people += w.crewed * aircraftSeats(models.get(w.model));
      }
    };
    for (const g of n.groups) {
      wings(g.airWing);
      if (
        g.airWing.some(
          (w) =>
            w.count &&
            !aircraftFitsShip(models.get(w.model), c.classes[g.classId]),
        )
      )
        fail();
    }
    for (const [port, b] of Object.entries(n.airBases)) {
      if (
        !PORTS[port] ||
        !b ||
        !Number.isFinite(b.lastSortie) ||
        !Number.isFinite(b.nextDispatch)
      )
        fail();
      wings(b.airWing);
      wings(b.governmentWing || []);
      wings(b.reserve);
      if (
        b.airWing.some((w) => governmentModel(models.get(w.model))) ||
        (b.governmentWing || []).some(
          (w) => !governmentModel(models.get(w.model)),
        )
      )
        fail();
    }
    const ids = new Set();
    for (const t of n.airTransfers) {
      if (
        !t ||
        typeof t.id !== "string" ||
        ids.has(t.id) ||
        !PORTS[t.source] ||
        !["ferry", "rail", "merchant"].includes(t.mode) ||
        !Number.isFinite(t.departAt) ||
        !Number.isFinite(t.arriveAt) ||
        t.arriveAt < t.departAt ||
        !Array.isArray(t.route) ||
        !t.route.every(point) ||
        !Array.isArray(t.path) ||
        !Number.isInteger(t.leg) ||
        t.leg < 0
      )
        fail();
      ids.add(t.id);
      wings(t.airWing);
      if (
        t.mode === "merchant" &&
        (!Number.isInteger(t.lastCount) ||
          t.lastCount < 0 ||
          !n.convoys.some(
            (v) => v.id === t.convoyId && v.aviationTransfer === t.id,
          ))
      )
        fail();
    }
    for (const op of n.airSorties) {
      if (
        !op ||
        typeof op.id !== "string" ||
        ids.has(op.id) ||
        !c.nations[op.targetNation] ||
        !["fleet", "port", "convoy"].includes(op.targetKind) ||
        typeof op.targetId !== "string" ||
        !["assembling", "outbound", "engaging", "returning", "rearming"].includes(
          op.phase,
        ) ||
        !Number.isFinite(op.startedAt) ||
        !Number.isFinite(op.readyAt) ||
        op.readyAt < op.startedAt ||
        !amount(op.assembly) ||
        !amount(op.rangeKm) ||
        !amount(op.cruise) ||
        !point(op.position) ||
        !point(op.targetPosition) ||
        (op.sourcePort && !PORTS[op.sourcePort]) ||
        (op.fleetId && typeof op.fleetId !== "string")
      )
        fail();
      ids.add(op.id);
      wings(op.airWing);
    }
    for (const [model, count] of Object.entries(allocated))
      if (
        count >
        (governmentModel(models.get(model))
          ? n.governmentAircraft
          : n.aircraft)[model]
      )
        fail();
    if (
      people > n.aviators + 1e-6 ||
      governmentPeople > n.governmentAviators + 1e-6
    )
      fail();
    if (
      !n.anchorageReports ||
      typeof n.anchorageReports !== "object" ||
      Array.isArray(n.anchorageReports)
    )
      fail();
    for (const [port, r] of Object.entries(n.anchorageReports))
      if (
        !PORTS[port] ||
        !r ||
        !c.nations[r.owner] ||
        !Number.isFinite(r.seenAt) ||
        !Number.isInteger(r.hulls) ||
        !amount(r.hulls) ||
        !r.composition ||
        !Object.values(r.composition).every(
          (v) => Number.isInteger(v) && amount(v),
        )
      )
        fail();
  }
  return true;
}
