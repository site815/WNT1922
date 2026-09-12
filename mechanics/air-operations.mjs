import { strategicFactor } from "./strategic-materials.mjs";
import { readDocument } from "../worker/documents.mjs";
const ENGAGEMENTS = await readDocument("common/rules/engagements.md");
import { opposingProvocations, finishIncident } from "./provocation.mjs";
import { aircraftQuality } from "./aircraft-quality.mjs";
import { campaignMinutes } from "./campaign-clock.mjs";
import { PORTS, NODES, distanceNm } from "./world.mjs";
import { aircraftFitsShip } from "./aircraft-compatibility.mjs";
import { airConditions, searchSector } from "./air-conditions.mjs";
import {
  operationalAircraftModels,
  loseAircraft,
  staffAircraft,
} from "./naval-resources.mjs";
import {
  aviationAccess,
  aviationOwner,
  addWing,
  aviationLog,
  modelCombatKm,
} from "./base-aviation.mjs";
import {
  navalBaseCapacity,
  governmentCapacity,
} from "./government-aviation.mjs";
import { fleetPosition, invalidateOperations } from "./task-forces.mjs";
const permitted = (s, id, op) =>
  s.relations[[id, op.targetNation].sort().join("-")]?.war ||
  (op.targetKind === "fleet" &&
    opposingProvocations(s, id, op.fleetId, op.targetNation, op.targetId));
const pair = (a, b) => [a, b].sort().join("-"),
  total = (rows) => rows.reduce((v, w) => v + w.count, 0);
const cruise = (a) =>
  Math.max(
    110,
    a.performance?.speed_kmh?.cruise ||
      (a.performance?.speed_kmh?.sea_level || 240) * 0.7,
  );
export function airSource(s, id, op) {
  const n = s.nations[id];
  if (op.sourcePort) {
    const b = n.airBases[op.sourcePort];
    return b && aviationAccess(s, id, op.sourcePort)
      ? {
          position: NODES[op.sourcePort],
          base: b,
          rows: [
            { port: op.sourcePort, airWing: b.airWing },
            { port: op.sourcePort, airWing: b.governmentWing || [] },
          ],
        }
      : null;
  }
  const f = n.fleets.find((f) => f.id === op.fleetId);
  if (!f) return null;
  return {
    position: fleetPosition(s, f),
    fleet: f,
    rows: n.groups.filter(
      (g) =>
        g.fleetId === f.id &&
        g.count &&
        g.status === "active" &&
        g.health >= 0.65,
    ),
  };
}
export function targetAirPosition(s, op) {
  if (op.targetKind === "port")
    return aviationOwner(s, op.targetId) === op.targetNation
      ? NODES[op.targetId]
      : null;
  const n = s.nations[op.targetNation],
    f = (op.targetKind === "convoy" ? n.convoys : n.fleets).find(
      (f) => f.id === op.targetId,
    );
  return f && (op.targetKind !== "convoy" || f.count)
    ? fleetPosition(s, f)
    : null;
}
function draftStrike(s, c, id, source, position, operation) {
  const n = s.nations[id],
    conditions = airConditions(s, source.position),
    distanceKm = distanceNm(source.position, position) * 1.852,
    models = new Map(operationalAircraftModels(c, id).map((a) => [a.id, a]));
  const selected = [];
  let strikes = 0,
    escorts = 0,
    rangeKm = 10000,
    speed = 1000;
  for (const g of source.rows)
    for (const w of g.airWing || []) {
      const a = models.get(w.model);
      if (
        !a ||
        !(
          operation === "strategic"
            ? ["bomber", "fighter"]
            : ["strike", "fighter"]
        ).includes(w.role) ||
        modelCombatKm(a) < distanceKm ||
        (g.classId && !aircraftFitsShip(a, c.classes[g.classId]))
      )
        continue;
      const fraction =
        w.role === "fighter"
          ? 0.35
          : source.fleet?.aggressiveBattle
            ? 0.9
            : 0.75;
      const count = Math.floor(
        (w.crewed || 0) * fraction * conditions.launch * (g.health ?? 1) * strategicFactor(n),
      );
      if (!count) continue;
      selected.push({
        model: w.model,
        role: w.role,
        count,
        crewed: count,
        ...(g.id ? { homeGroup: g.id } : { homePort: g.port }),
      });
      if (w.role !== "fighter") strikes += count;
      else escorts += count;
      rangeKm = Math.min(rangeKm, modelCombatKm(a));
      speed = Math.min(speed, cruise(a));
    }
  return {
    selected,
    strikes,
    escorts,
    rangeKm,
    cruise: speed,
    distanceKm,
    conditions,
  };
}
export function queueAirStrike(s, c, id, request) {
  const n = s.nations[id],
    now = campaignMinutes(s);
  n.airSorties ??= [];
  if (
    !permitted(s, id, request) ||
    n.airSorties.length >= 32 ||
    n.airSorties.some((o) =>
      request.sourcePort
        ? o.sourcePort === request.sourcePort
        : o.fleetId === request.fleetId,
    )
  )
    return false;
  const source = airSource(s, id, request),
    position = request.position || targetAirPosition(s, request);
  if (!source || !position) return false;
  if (source.fleet && request.targetKind === "port" && request.operation !== "opening"
    && !["anchorage", "siege"].includes(source.fleet.mission)) return false;
  if (
    source.fleet &&
    (["port", "refuel", "repair", "returning"].includes(source.fleet.phase) ||
      ["support", "repair", "reinforcement"].includes(source.fleet.role) ||
      now < (source.fleet.airReadyAt ?? -1e9))
  )
    return false;
  if (
    source.fleet &&
    (source.fleet.needsEscorts ||
      source.fleet.fuelNm < source.fleet.maxRangeNm * 0.15)
  )
    return false;
  if (
    source.base &&
    now < source.base.lastSortie + 360
  )
    return false;
  const draft = draftStrike(s, c, id, source, position, request.operation);
  if (draft.strikes < ENGAGEMENTS.MIN_STRIKE_AIRCRAFT || !draft.conditions.launch) return false;
  // Allow time to assemble and return before darkness; no precision night
  // carrier operations in this deliberately abstract first implementation.
  const assembly = Math.round(
      35 + draft.strikes * 0.3 + (100 - n.training) * 0.4,
    ),
    duration = assembly + (draft.distanceKm / draft.cruise) * 120 + 30;
  if (!airConditions(s, source.position, now + duration).launch) return false;
  n.airSorties.push({
    id: "sortie-" + s.nextId++,
    fleetId: request.fleetId || null,
    sourcePort: request.sourcePort || null,
    targetNation: request.targetNation,
    targetId: request.targetId,
    targetKind: request.targetKind,
    operation: request.operation || "strike",
    industrialTarget: request.industrialTarget || null,
    phase: "assembling",
    startedAt: now,
    readyAt: now + assembly,
    assembly,
    airWing: [],
    targetPosition: [...position],
    position: [...source.position],
    rangeKm: draft.rangeKm,
    cruise: draft.cruise,
    conditions: draft.conditions,
  });
  return true;
}
export function combatAirPatrol(
  s,
  c,
  id,
  { fleetId = null, port = null } = {},
) {
  const source = airSource(s, id, { fleetId, sourcePort: port });
  if (!source) return { count: 0, power: 0, wings: [] };
  const cond = airConditions(s, source.position),
    models = new Map(operationalAircraftModels(c, id).map((a) => [a.id, a]));
  let count = 0,
    power = 0;
  const wings = [];
  for (const g of source.rows)
    for (const w of g.airWing || [])
      if (w.role === "fighter") {
        const take = Math.floor(
          (w.crewed || 0) * 0.6 * cond.launch * (g.health ?? 1) * strategicFactor(s.nations[id]),
        );
        if (!take) continue;
        const a = models.get(w.model);
        count += take;
        power += take * aircraftQuality(a, "fighter");
        wings.push({ g, w, count: take });
      }
  return { count, power, wings };
}
export function loseCAP(s, c, id, cap, fraction) {
  const lost = { planes: 0, aviators: 0, planesRescued: 0, aviatorsRescued: 0 };
  for (const { w, count } of cap.wings) {
    const take = Math.min(w.crewed || 0, count),
      wing = { ...w, count: take, crewed: take };
    w.count -= take;
    w.crewed -= take;
    const part = loseAircraft(s, c, id, { airWing: [wing] }, fraction, {
      rescue: 0.5,
      airframeRescue: 0.08,
    });
    w.count += wing.count;
    w.crewed += wing.crewed;
    for (const k of Object.keys(lost)) lost[k] += part[k] || 0;
  }
  return lost;
}
function launch(s, c, id, op) {
  const n = s.nations[id],
    source = airSource(s, id, op),
    now = campaignMinutes(s);
  if (!source) return false;
  if (op.targetKind !== "port") {
    const contact = n.contacts.find((x) => x.id === op.targetId);
    if (!contact || now - contact.seenAt > 360) return false;
    op.targetPosition = [...contact.position];
  }
  const draft = draftStrike(s, c, id, source, op.targetPosition, op.operation);
  if (
    draft.strikes < ENGAGEMENTS.MIN_STRIKE_AIRCRAFT ||
    !airConditions(
      s,
      source.position,
      now + (draft.distanceKm / draft.cruise) * 120 + 30,
    ).launch
  )
    return false;
  // Aircraft leave their original hangars. A carrier sinking while its strike
  // is airborne cannot destroy those same airframes a second time.
  for (const pick of draft.selected) {
    const g = source.rows.find((g) =>
        pick.homeGroup
          ? g.id === pick.homeGroup
          : g.port === pick.homePort &&
            g.airWing.some(
              (w) => w.model === pick.model && w.role === pick.role,
            ),
      ),
      w = g?.airWing.find(
        (w) => w.model === pick.model && w.role === pick.role,
      );
    if (!w || w.crewed < pick.count) continue;
    w.count -= pick.count;
    w.crewed -= pick.count;
    op.airWing.push({ ...pick });
  }
  if (source.base) {
    source.base.lastSortie = now;
  } else source.fleet.fuelNm = Math.max(0, source.fleet.fuelNm - 5);
  op.phase = "outbound";
  op.position = [...source.position];
  op.launchedAt = now;
  op.outboundKm = draft.distanceKm;
  op.rangeKm = draft.rangeKm;
  op.cruise = draft.cruise;
  op.conditions = draft.conditions;
  op.materialFactor = strategicFactor(n);
  op.strikes = draft.strikes;
  op.escorts = draft.escorts;
  op.readyAt =
    now + Math.max(10, Math.ceil((draft.distanceKm / draft.cruise) * 60));
  invalidateOperations(s);
  return true;
}
function returnFlight(s, c, id, op) {
  const source = airSource(s, id, op),
    now = campaignMinutes(s),
    home = source?.position || op.position;
  op.phase = "returning";
  op.readyAt =
    now +
    Math.max(
      10,
      Math.ceil(
        ((distanceNm(op.targetPosition, home) * 1.852) / op.cruise) * 60,
      ),
    );
  if (op.targetKind === "port" && source?.fleet?.mission === "anchorage") {
    source.fleet.raidingReturn = true;
    delete source.fleet.objectiveNode;
    source.fleet.nextPlanAt = now;
  }
}
function recoverFlight(s, c, id, op) {
  const n = s.nations[id],
    now = campaignMinutes(s),
    models = new Map(operationalAircraftModels(c, id).map((a) => [a.id, a]));
  let diverted = 0,
    ditched = 0;
  for (const w of op.airWing) {
    const a = models.get(w.model),
      budget = Math.max(0, op.rangeKm * 2 - op.outboundKm),
      canReach = (pos) => distanceNm(op.targetPosition, pos) * 1.852 <= budget;
    const original = n.groups.find((g) => g.id === w.homeGroup),
      f = original && n.fleets.find((f) => f.id === original.fleetId);
    const fits = (g) =>
        g.count &&
        g.status === "active" &&
        g.health >= 0.65 &&
        aircraftFitsShip(a, c.classes[g.classId]),
      room = (g) =>
        (c.classes[g.classId].air + c.classes[g.classId].scoutAircraft) *
          g.count -
        total(g.airWing);
    let landed = false;
    if (
      original &&
      f &&
      fits(original) &&
      canReach(fleetPosition(s, f)) &&
      room(original) >= w.count
    ) {
      addWing(original.airWing, w);
      landed = true;
    }
    if (!landed) {
      const ports = Object.keys(n.airBases)
        .filter(
          (p) =>
            aviationAccess(s, id, p) &&
            (s.ports[p]?.health ?? 1) > 0.15 &&
            canReach(NODES[p]) &&
            navalBaseCapacity(s, p) + governmentCapacity(s, p) > 0,
        )
        .sort(
          (x, y) =>
            distanceNm(op.targetPosition, NODES[x]) -
            distanceNm(op.targetPosition, NODES[y]),
        );
      if (ports.length) {
        const p = ports.includes(w.homePort) ? w.homePort : ports[0],
          b = n.airBases[p],
          gov = a.catalogKind === "government",
          wings = gov ? (b.governmentWing ??= []) : b.airWing,
          capacity = gov ? governmentCapacity(s, p) : navalBaseCapacity(s, p),
          count = Math.min(w.count, Math.max(0, capacity - total(wings)));
        addWing(wings, { ...w, count, crewed: count });
        addWing(b.reserve, {
          ...w,
          count: w.count - count,
          crewed: w.count - count,
        });
        landed = true;
        if (p !== w.homePort) diverted += w.count;
      }
    }
    if (!landed)
      for (const g of n.groups) {
        const other = n.fleets.find((f) => f.id === g.fleetId);
        if (
          other &&
          fits(g) &&
          room(g) >= w.count &&
          canReach(fleetPosition(s, other))
        ) {
          addWing(g.airWing, w);
          landed = true;
          diverted += w.count;
          break;
        }
      }
    if (!landed) {
      const loss = loseAircraft(s, c, id, { airWing: [w] }, 1, {
        rescue: 0.25,
        airframeRescue: 0,
      });
      ditched += loss.planes;
      const report = s.reports.find((r) => r.id === op.reportId);
      if (report) addAirLoss(report.resultA, loss);
    }
  }
  op.airWing = [];
  op.phase = "rearming";
  op.readyAt = now + 90;
  if (diverted || ditched)
    aviationLog(
      s,
      n,
      "Strike recovery: " +
        diverted +
        " aircraft diverted; " +
        ditched +
        " ditched beyond a usable landing site.",
    );
  const f = n.fleets.find((f) => f.id === op.fleetId);
  if (f) f.airReadyAt = op.readyAt;
  staffAircraft(s, c, id);
  invalidateOperations(s);
}
export function addAirLoss(result, loss) {
  for (const [to, from] of [
    ["planesLost", "planes"],
    ["aviatorsLost", "aviators"],
    ["planesRescued", "planesRescued"],
    ["aviatorsRescued", "aviatorsRescued"],
    ["governmentPlanesLost", "governmentPlanes"],
    ["governmentCrewsLost", "governmentCrews"],
  ])
    result[to] = (result[to] || 0) + (loss[from] || 0);
}
export function minuteAirOperations(s, c, resolve) {
  const now = campaignMinutes(s);
  for (const [id, n] of Object.entries(s.nations))
    for (const op of [...(n.airSorties || [])]) {
      if (now < op.readyAt) continue;
      if (op.phase === "assembling") {
        if (!permitted(s, id, op) || !launch(s, c, id, op)) {
          op.done = true;
          const f = n.fleets.find((f) => f.id === op.fleetId);
          if (f) f.airReadyAt = now + 90;
          aviationLog(
            s,
            n,
            "Strike held: light, weather, contact, range or aircraft readiness changed.",
          );
        }
      } else if (op.phase === "outbound") {
        const target = targetAirPosition(s, op),
          conditions = airConditions(s, op.targetPosition),
          searchKm = 35 + Math.min(65, (s.nations[id].training || 0) * 0.5);
        if (
          target &&
          permitted(s, id, op) &&
          conditions.launch > 0 &&
          distanceNm(op.targetPosition, target) * 1.852 <= searchKm &&
          distanceNm(op.position, target) * 1.852 <= op.rangeKm
        ) {
          op.targetPosition = [...target];
          op.outboundKm = distanceNm(op.position, target) * 1.852;
          const report = resolve(id, op, target);
          op.reportId = report?.id || null;
          if (report?.status === "ongoing") op.phase="engaging";
          if (op.operation === "opening" && s.pacificOpening) {
            s.pacificOpening.targets[op.targetId] = report
              ? "Strike in progress"
              : "Strike unsuccessful";
            const carrier = n.fleets.find((f) => f.id === op.fleetId);
            if (carrier) {
              delete carrier.pacificTarget;
              delete carrier.pacificStage;
              carrier.raidingReturn = true;
              delete carrier.objectiveNode;
              carrier.nextPlanAt = now;
            }
          }
          if (report?.status !== "ongoing") finishIncident(
            s,
            id,
            op.fleetId,
            op.targetNation,
            op.targetId,
            report,
          );
        } else
          aviationLog(
            s,
            n,
            "Strike returned without contact: target moved, visibility closed or war ended.",
          );
        if(op.phase!=="engaging") returnFlight(s, c, id, op);
      } else if (op.phase === "engaging") {
        const report=s.reports.find(r=>r.id===op.reportId);
        if(report?.status==="ongoing") continue;
        if(op.operation==="opening" && s.pacificOpening) s.pacificOpening.targets[op.targetId]="Strike resolved";
        returnFlight(s,c,id,op);
      } else if (op.phase === "returning") recoverFlight(s, c, id, op);
      else op.done = true;
    }
  for (const n of Object.values(s.nations))
    n.airSorties = (n.airSorties || []).filter((o) => !o.done);
}
export function airOperationsText(s, c, id, f) {
  const n = s.nations[id],
    op = n.airSorties?.find((o) => o.fleetId === f.id),
    conditions = airConditions(s, fleetPosition(s, f)),
    cap = combatAirPatrol(s, c, id, { fleetId: f.id });
  const target = n.contacts
    .filter(
      (x) =>
        campaignMinutes(s) - x.seenAt < 360 &&
        s.relations[pair(id, x.nation)]?.war,
    )
    .sort((a, b) => b.seenAt - a.seenAt)[0];
  return (
    conditions.light +
    " · " +
    conditions.weather +
    " · CAP " +
    cap.count +
    " fighters · search " +
    Math.round(searchSector(s, f, fleetPosition(s, f), target?.position)) +
    "°" +
    (op
      ? " · " +
        op.phase +
        " (" +
        Math.max(0, Math.ceil(op.readyAt - campaignMinutes(s))) +
        " min) · " +
        (op.strikes || 0) +
        " strike / " +
        (op.escorts || 0) +
        " escorts"
      : conditions.launch
        ? " · deck ready"
        : " · launches held")
  );
}
