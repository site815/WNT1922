import { returnTransport } from "./merchant-convoys.mjs";

import { averageMerchantGRT } from "./merchant-economy.mjs";
import { strategicFactor } from "./strategic-materials.mjs";
import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/aviation-transfer.md");
import { aircraftFitsShip, aircraftBasing } from "./aircraft-compatibility.mjs";
import {
  governmentProduction,
  governmentCapacity,
  navalBaseCapacity,
} from "./government-aviation.mjs";
import {
  PORTS,
  NODES,
  HOME_PORT,
  seaRoute,
  routeLength,
  distanceNm,
} from "./world.mjs";
import { campaignMinutes } from "./campaign-clock.mjs";
import { portSpec } from "./port-catalog.mjs";
import {
  fleetPosition,
  merchantCount,
  syncConvoys,
  convoyCoverage,
} from "./task-forces.mjs";
import {
  aircraftModels,
  operationalAircraftModels,
  governmentModel,
  modelAvailable,
  aircraftSeats,
  loseAircraft,
  staffAircraft,
} from "./naval-resources.mjs";
import {
  aviationAccess,
  aviationOwner,
  addWing,
  allocatedWings,
  freeAircraft,
  airWarehouse,
  chooseAirWarehouse,
  modelFerryKm,
  shipAirLocation,
  aircraftRoleFits,
  wingTargets,
  aviationLog,
} from "./base-aviation.mjs";
const pair = (a, b) => [a, b].sort().join("-");
const total = (wings) => wings.reduce((v, w) => v + w.count, 0);
const MAINLAND = data.MAINLAND;
export const landSupplied = (id, port) =>
  port === HOME_PORT[id] || MAINLAND[id]?.includes(port);
function carrier(s, c, id, g) {
  return (
    g.count &&
    g.status === "active" &&
    ["CV", "CVL"].includes(c.classes[g.classId].type) &&
    g.health > 0.5
  );
}
function endpoints(s, c, id, aircraft) {
  const n = s.nations[id];
  return [
    ...Object.keys(n.airBases)
      .filter(
        (p) =>
          aviationAccess(s, id, p) &&
          (portSpec(s, p).aircraft > 0 || p === airWarehouse(s, id)) &&
          (s.ports[p]?.health ?? 1) > 0.15,
      )
      .map((p) => ({ key: p, position: NODES[p] })),
    ...n.groups
      .filter((g) => carrier(s, c, id, g) && aircraftBasing(aircraft).carrier)
      .map((g) => ({ key: g.id, position: shipAirLocation(s, n, g) })),
  ];
}
function endpoint(s, n, key) {
  if (PORTS[key]) return aviationAccess(s, n.id, key) ? NODES[key] : null;
  const g = n.groups.find((g) => g.id === key);
  return g?.count && g.status === "active" && g.health > 0.5
    ? shipAirLocation(s, n, g)
    : null;
}
export function ferryPath(s, c, id, from, to, aircraft) {
  const n = s.nations[id],
    start = endpoint(s, n, from),
    end = endpoint(s, n, to),
    range = modelFerryKm(aircraft) / 1.852;
  if (!start || !end || !range) return null;
  if (
    !PORTS[to] &&
    !aircraftFitsShip(
      aircraft,
      c.classes[n.groups.find((g) => g.id === to)?.classId],
    )
  )
    return null;
  const points = endpoints(s, c, id, aircraft);
  if (!points.some((p) => p.key === to))
    points.push({ key: to, position: end });
  const queue = [[from]],
    seen = new Set([from]);
  for (let i = 0; i < queue.length; i++) {
    const route = queue[i],
      last = endpoint(s, n, route.at(-1));
    for (const p of points) {
      if (seen.has(p.key) || distanceNm(last, p.position) > range) continue;
      const next = [...route, p.key];
      if (p.key === to) return next;
      seen.add(p.key);
      queue.push(next);
    }
  }
  return from === to ? [from] : null;
}
export function shippingRisk(s, c, id, route, destination) {
  const n = s.nations[id],
    now = campaignMinutes(s),
    danger = n.contacts.filter(
      (x) => s.relations[pair(id, x.nation)]?.war && now - x.seenAt < 2880,
    );
  let risk = s.ports[destination]?.blockade || 0;
  for (const x of danger) {
    const close = route.some(
      (p, i) =>
        distanceNm(p, x.position) < 120 ||
        (i &&
          distanceNm(p, x.position) + distanceNm(route[i - 1], x.position) <
            distanceNm(p, route[i - 1]) + 80),
    );
    if (!close) continue;
    const escort = n.fleets
      .filter(
        (f) =>
          f.mission === "guard" &&
          !["port", "refuel", "repair"].includes(f.phase) &&
          distanceNm(fleetPosition(s, f), x.position) < 120,
      )
      .reduce(
        (v, f) =>
          v +
          n.groups
            .filter(
              (g) => g.fleetId === f.id && g.atSea && g.status === "active",
            )
            .reduce((v, g) => v + g.count, 0),
        0,
      );
    risk = Math.max(risk, Math.min(0.95, (x.estimate || 1) / (5 + escort * 2)));
  }
  return risk;
}
function sourceWing(s, c, id, model, role, count, source) {
  const n = s.nations[id],
    a = operationalAircraftModels(c, id).find((a) => a.id === model),
    base = n.airBases[source],
    stored = base?.reserve.find((w) => w.model === model && w.count > 0);
  let taken, crewed;
  if (stored) {
    taken = Math.min(count, stored.count);
    crewed = Math.min(taken, stored.crewed || 0);
    stored.count -= taken;
    stored.crewed -= crewed;
  } else {
    taken =
      source === airWarehouse(s, id)
        ? Math.min(count, freeAircraft(n)[model] || 0)
        : 0;
    const gov = governmentModel(a),
      models = new Map(operationalAircraftModels(c, id).map((a) => [a.id, a])),
      people = allocatedWings(n)
        .filter((w) => governmentModel(models.get(w.model)) === gov)
        .reduce(
          (v, w) => v + (w.crewed || 0) * aircraftSeats(models.get(w.model)),
          0,
        );
    crewed = Math.min(
      taken,
      Math.floor(
        Math.max(0, (gov ? n.governmentAviators : n.aviators) - people) /
          aircraftSeats(a),
      ),
    );
  }
  return { model, role, count: taken, crewed };
}
function putDestination(s, c, id, t) {
  const n = s.nations[id],
    government = governmentModel(
      operationalAircraftModels(c, id).find(
        (a) => a.id === t.airWing[0]?.model,
      ),
    ),
    base = n.airBases[t.destination],
    g = n.groups.find((g) => g.id === t.destination),
    capacity = base
      ? government
        ? governmentCapacity(s, t.destination)
        : navalBaseCapacity(s, t.destination)
      : g
        ? (c.classes[g.classId].air + c.classes[g.classId].scoutAircraft) *
          g.count
        : 0;
  if (
    g &&
    t.airWing.some(
      (w) =>
        !aircraftFitsShip(
          operationalAircraftModels(c, id).find((a) => a.id === w.model),
          c.classes[g.classId],
        ),
    )
  )
    return false;
  const wings = base
    ? government
      ? (base.governmentWing ??= [])
      : base.airWing
    : g?.airWing;
  if (!wings || !endpoint(s, n, t.destination)) return false;
  if (t.diverting && base) {
    for (const w of t.airWing) addWing(base.reserve, w);
    t.airWing = [];
    return true;
  }
  for (const w of t.airWing) {
    // Modernization returns replaced airframes to local storage. At-sea carriers
    // only fill empty spots; replacement is performed while in port.
    if (t.replace && (base || (g && !g.atSea))) {
      const storage =
        base ||
        n.airBases[
          g.dockPort || n.fleets.find((f) => f.id === g.fleetId)?.port
        ];
      const old = wings.find((x) => x.role === w.role && x.model !== w.model);
      if (old) {
        const count = Math.min(w.count, old.count),
          crewed = Math.min(count, old.crewed);
        addWing(storage.reserve, { ...old, count, crewed });
        old.count -= count;
        old.crewed -= crewed;
      }
    }
    const take = Math.min(w.count, Math.max(0, capacity - total(wings))),
      crewed = Math.min(take, w.crewed);
    addWing(wings, { ...w, count: take, crewed });
    w.count -= take;
    w.crewed -= crewed;
    if (w.count) {
      const port = base
          ? t.destination
          : g?.dockPort || n.fleets.find((f) => f.id === g?.fleetId)?.port,
        store = n.airBases[port];
      if (
        store &&
        aviationOwner(s, port) === id &&
        (base ||
          (!g.atSea && distanceNm(shipAirLocation(s, n, g), NODES[port]) < 25))
      )
        addWing(store.reserve, w);
      else return false;
      w.count = 0;
      w.crewed = 0;
    }
  }
  t.airWing = [];
  return true;
}
function beginLeg(s, c, id, t) {
  const n = s.nations[id],
    from = endpoint(s, n, t.path[t.leg]),
    to = endpoint(s, n, t.path[t.leg + 1]);
  if (!from || !to) return false;
  const a = operationalAircraftModels(c, id).find(
    (a) => a.id === t.airWing[0]?.model,
  );
  if (distanceNm(from, to) * 1.852 > modelFerryKm(a)) return false;
  t.route = [from, to];
  t.departAt = campaignMinutes(s);
  t.arriveAt =
    t.departAt +
    Math.max(
      20,
      ((distanceNm(from, to) * 1.852) /
        Math.max(
          110,
          (a.performance?.speed_kmh?.cruise ||
            a.performance?.speed_kmh?.sea_level ||
            240) * 0.7,
        )) *
        60,
    );
  return true;
}
export function dispatchAviation(
  s,
  c,
  id,
  {
    source = airWarehouse(s, id),
    destination,
    model = null,
    role = "strike",
    count = 0,
    replace = false,
  } = {},
) {
  const n = s.nations[id],
    now = campaignMinutes(s),
    a = operationalAircraftModels(c, id).find((a) => a.id === model);
  if (
    !source ||
    !n.airBases[source] ||
    aviationOwner(s, source) !== id ||
    !destination ||
    !endpoint(s, n, destination)
  )
    return null;
  if (
    count &&
    (!a ||
      a.type_year > new Date(s.day * 86400000).getUTCFullYear() ||
      !modelAvailable(s, n, a) ||
      !aircraftRoleFits(a, role))
  )
    return null;
  if (
    count &&
    !PORTS[destination] &&
    !aircraftFitsShip(
      a,
      c.classes[n.groups.find((g) => g.id === destination)?.classId],
    )
  )
    return null;
  const flight =
      count && a ? ferryPath(s, c, id, source, destination, a) : null,
    domestic =
      PORTS[source] &&
      PORTS[destination] &&
      landSupplied(id, source) &&
      landSupplied(id, destination),
    mode =
      flight
        ? "ferry"
        : domestic
          ? "rail"
          : "merchant";
  let destinationPort = PORTS[destination] ? destination : null,
    route,
    shipCount = 0;
  if (mode === "merchant") {
    if (!destinationPort) {
      destinationPort = Object.keys(n.airBases)
        .filter(
          (p) =>
            aviationAccess(s, id, p) && ferryPath(s, c, id, p, destination, a),
        )
        .sort(
          (x, y) =>
            distanceNm(NODES[source], NODES[x]) -
            distanceNm(NODES[source], NODES[y]),
        )[0];
      if (!destinationPort) return null;
    }
    route = seaRoute(source, destinationPort).map((k) => NODES[k]);
    if (shippingRisk(s, c, id, route, destinationPort) > 0.6) {
      n.airBases[destinationPort].heldReason =
        "Known enemy forces or blockade make merchant reinforcement unsafe.";
      return null;
    }
    const free = Math.max(0, merchantCount(s, id) - n.convoys.reduce((v, x) => v + x.count, 0));
    shipCount = Math.min(3, free);
    if (shipCount < 1 || n.convoys.length >= 90) return null;
  }
  const wing = count ? sourceWing(s, c, id, model, role, count, source) : null;
  if (wing && (!wing.count || wing.crewed < wing.count)) {
    if (wing.count) addWing(n.airBases[source].reserve, wing);
    return null;
  }
  const t = {
    id: "air-transfer-" + s.nextId++,
    source,
    destination,
    mode,
    airWing: wing ? [wing] : [],
    replace,
    departAt: now,
    arriveAt: now,
    route: route || [NODES[source], endpoint(s, n, destination)],
    path: flight || [],
    leg: 0,
  };
  if (!total(t.airWing)) return null;
  if (mode === "ferry" && flight.length > 1) {
    if (!beginLeg(s, c, id, t)) {
      for (const w of t.airWing) addWing(n.airBases[source].reserve, w);
      return null;
    }
  }
  if (mode === "rail")
    t.arriveAt =
      now +
      1440 / strategicFactor(n) *
        (1 + (distanceNm(NODES[source], NODES[destination]) * 1.852) / 500);
  if (mode === "merchant") {
    t.finalDestination = destination;
    t.destination = destinationPort;
    t.arriveAt = now + (routeLength(route) / (10 * strategicFactor(n))) * 60 + 720;
    t.convoyId = "convoy-air-" + s.nextId++;
    t.lastCount = shipCount;
    n.convoys.push({
      id: t.convoyId,
      nation: id,
      name: "Aviation transport → " + PORTS[destinationPort].name,
      count: shipCount,
      port: source,
      node: destinationPort,
      targetNode: destinationPort,
      route,
      departAt: now,
      arriveAt: t.arriveAt,
      speed: 10,
      lastBattle: -1e9,
      cargo: total(t.airWing) * 10,
      aviationTransfer: t.id,
    });
  }
  n.airTransfers.push(t);
  syncConvoys(s, c, id);
  if (n.airBases[destinationPort])
    delete n.airBases[destinationPort].heldReason;
  return t;
}
function failTransfer(s, c, id, t) {
  const n = s.nations[id];
  if (t.mode === "ferry" && !t.diverting) {
    const position = t.route.at(-1),
      a = operationalAircraftModels(c, id).find(
        (a) => a.id === t.airWing[0]?.model,
      ),
      remaining = modelFerryKm(a) - distanceNm(t.route[0], position) * 1.852;
    const ports = Object.keys(n.airBases)
      .filter(
        (port) =>
          aviationOwner(s, port) === id &&
          portSpec(s, port).aircraft > 0 &&
          (s.ports[port]?.health ?? 1) > 0.15 &&
          distanceNm(position, NODES[port]) * 1.852 <= remaining,
      )
      .sort(
        (a, b) =>
          distanceNm(position, NODES[a]) - distanceNm(position, NODES[b]),
      );
    if (ports.length) {
      const port = ports[0];
      t.diverting = true;
      t.destination = port;
      t.path = [port, port];
      t.leg = 0;
      t.route = [position, NODES[port]];
      t.departAt = campaignMinutes(s);
      t.arriveAt =
        t.departAt +
        Math.max(20, ((distanceNm(position, NODES[port]) * 1.852) / 180) * 60);
      aviationLog(
        s,
        n,
        "Flight diverted to " +
          PORTS[port].name +
          "; destination no longer reachable.",
      );
      return;
    }
  }
  const last =
      t.mode === "ferry"
        ? t.path[Math.min(t.leg, t.path.length - 1)]
        : t.source,
    base = n.airBases[last];
  if (base && aviationOwner(s, last) === id && t.mode === "rail") {
    for (const w of t.airWing) addWing(base.reserve, w);
    t.airWing = [];
    aviationLog(
      s,
      n,
      "Ferry flight held or diverted at " +
        PORTS[last].name +
        ". Destination moved beyond range or became unavailable.",
    );
  } else loseAircraft(s, c, id, t, 1, { rescue: 0.2, airframeRescue: 0 });
  t.done = true;
}
export function minuteAviation(s, c) {
  const now = campaignMinutes(s);
  for (const [id, n] of Object.entries(s.nations)) {
    for (const t of n.airTransfers || []) {
      if (t.mode === "merchant") {
        const convoy = n.convoys.find((v) => v.id === t.convoyId),
          remaining = convoy?.count || 0;
        if (remaining < t.lastCount) {
          const fraction = 1 - remaining / t.lastCount;
          const cover = convoyCoverage(s, c, id).convoys.find(
              (v) => v.id === t.convoyId,
            ),
            rescue = Math.min(0.75, 0.15 + (cover?.escorts.length || 0) * 0.12);
          const loss = loseAircraft(s, c, id, t, fraction, {
            rescue,
            airframeRescue: 0,
          });
          const notice = s.alerts.find(
            (x) => x.kind === "convoy" && x.b === id && x.minute === now,
          );
          if (notice)
            notice.body +=
              " Aviation cargo: " +
              loss.planes +
              " aircraft lost; " +
              loss.aviators +
              " aviators lost and " +
              loss.aviatorsRescued +
              " rescued.";
          t.lastCount = remaining;
          aviationLog(
            s,
            n,
            "Aviation transport intercepted: aircraft and aircrews lost in proportion to shipping sunk.",
          );
        }
        if (!remaining) {
          t.done = true;
          continue;
        }
        if (!aviationAccess(s, id, t.destination)) {
          const home = airWarehouse(s, id);
          if (home && t.destination !== home) {
            const position = fleetPosition(s, convoy),
              nearest = Object.keys(NODES).sort(
                (a, b) =>
                  distanceNm(position, NODES[a]) -
                  distanceNm(position, NODES[b]),
              )[0];
            t.destination = home;
            delete t.finalDestination;
            convoy.targetNode = home;
            convoy.node = home;
            convoy.route = [
              position,
              ...seaRoute(nearest, home).map((k) => NODES[k]),
            ];
            convoy.departAt = now;
            convoy.arriveAt = now + (routeLength(convoy.route) / 10) * 60;
            t.arriveAt = convoy.arriveAt;
          } else {
            failTransfer(s, c, id, t);
            continue;
          }
        }
      }
      if (now < t.arriveAt) continue;
      if (t.mode === "ferry") {
        const to = endpoint(s, n, t.path[t.leg + 1] || t.destination),
          a = operationalAircraftModels(c, id).find(
            (a) => a.id === t.airWing[0]?.model,
          );
        if (!to || distanceNm(t.route[0], to) * 1.852 > modelFerryKm(a)) {
          failTransfer(s, c, id, t);
          continue;
        }
        if (t.leg < t.path.length - 2) {
          t.leg++;
          if (!beginLeg(s, c, id, t)) {
            failTransfer(s, c, id, t);
            continue;
          }
          t.departAt += 120;
          t.arriveAt += 120;
          continue;
        }
      }
      if (t.finalDestination && t.finalDestination !== t.destination) {
        const base = n.airBases[t.destination];
        for (const w of t.airWing) addWing(base.reserve, w);
        t.airWing = [];
        t.done = true;
        t.delivered = true;
      } else if (putDestination(s, c, id, t)) {
        t.done = true;
        t.delivered = true;
        aviationLog(
          s,
          n,
          (t.mode === "merchant"
            ? "Merchant reinforcement"
            : t.mode === "rail"
              ? "Domestic reinforcement"
              : "Ferry flight") +
            " arrived at " +
            (PORTS[t.destination]?.name ||
              n.groups.find((g) => g.id === t.destination)?.name) +
            ".",
        );
      } else failTransfer(s, c, id, t);
    }
    const done = new Set(
      (n.airTransfers || []).filter((t) => t.done).map((t) => t.id),
    );
    if (done.size) {
      for (const v of n.convoys) if (done.has(v.aviationTransfer)) {
        v.voyageStarted ??= v.departAt;
        v.aborted = !n.airTransfers.find(t=>t.id===v.aviationTransfer)?.delivered;
        returnTransport(s,id,v);
      }
      n.airTransfers = n.airTransfers.filter((t) => !t.done);
      staffAircraft(s, c, id);
    }
  }
}
export function dailyAviation(s, c) {
  const now = campaignMinutes(s);
  for (const [id, n] of Object.entries(s.nations)) {
    if (!n.airBases) continue;
    if (n.airWarehousePort && aviationOwner(s, n.airWarehousePort) !== id) {
      const models = operationalAircraftModels(c, id);
      let people = Math.max(
        0,
        Math.floor(n.aviators) -
          allocatedWings(n).reduce(
            (v, w) =>
              v +
              w.crewed * aircraftSeats(models.find((a) => a.id === w.model)),
            0,
          ),
      );
      const stores = Object.entries(freeAircraft(n))
        .filter(([, count]) => count > 0)
        .map(([model, count]) => {
          const a = models.find((a) => a.id === model),
            cost = aircraftSeats(a),
            crewed = governmentModel(a)
              ? count
              : Math.min(count, Math.floor(people / cost));
          if (!governmentModel(a)) people -= crewed * cost;
          return { model, role: "strike", count, crewed };
        });
      loseAircraft(s, c, id, { airWing: stores }, 1, {
        rescue: 0.15,
        airframeRescue: 0,
      });
      aviationLog(
        s,
        n,
        "The aircraft warehouse was overrun; its remaining airframes were lost.",
      );
      n.airWarehousePort = null;
    }
    if (!n.airWarehousePort) n.airWarehousePort = chooseAirWarehouse(s, id);
    const hub = airWarehouse(s, id),
      war = Object.values(s.relations).some(
        (r) => r.war && [r.a, r.b].includes(id),
      );
    for (const [port, base] of Object.entries(n.airBases)) {
      if (!aviationAccess(s, id, port)) {
        for (const wings of [
          base.airWing,
          base.governmentWing || [],
          base.reserve,
        ])
          loseAircraft(s, c, id, { airWing: wings }, 1, {
            rescue: 0.15,
            airframeRescue: 0,
          });
        delete n.airBases[port];
        continue;
      }
    }
    for (const port of Object.keys(PORTS))
      if (aviationAccess(s, id, port) && !n.airBases[port])
        n.airBases[port] = {
          airWing: [],
          governmentWing: [],
          reserve: [],
          lastSortie: -1e9,
          nextDispatch: -1e9,
        };
    if (!hub) continue;
    governmentProduction(s, c, id);
    let budget = 8;
    const recipients = [
      ...n.groups
        .filter(
          (g) =>
            g.status === "active" &&
            g.count &&
            c.classes[g.classId].air + c.classes[g.classId].scoutAircraft > 0,
        )
        .map((g) => ({
          key: g.id,
          wings: g.airWing,
          capacity:
            (c.classes[g.classId].air + c.classes[g.classId].scoutAircraft) *
            g.count,
          carrier: !!c.classes[g.classId].air,
        })),
      ...Object.entries(n.airBases)
        .filter(([port]) => aviationOwner(s, port) === id)
        .map(([port, b]) => ({
          key: port,
          wings: b.airWing,
          capacity: navalBaseCapacity(s, port),
          carrier: true,
          government: false,
        })),
      ...Object.entries(n.airBases).map(([port, b]) => ({
        key: port,
        wings: (b.governmentWing ??= []),
        capacity: governmentCapacity(s, port),
        government: true,
        carrier: true,
      })),
    ];
    if (
      id === "JPN" &&
      s.pacificOpening &&
      new Date(s.day * 86400000).getUTCFullYear() === 1941
    ) {
      const staging = ["saigon", "takao", "saipan", "kwajalein"];
      const rank = (r) =>
        staging.includes(r.key) ? 10 + Number(r.government) : 0;
      recipients.sort((a, b) => rank(b) - rank(a));
    }
    for (const r of recipients) {
      if (
        !budget ||
        !r.capacity ||
        n.airTransfers.some(
          (t) => t.destination === r.key || t.finalDestination === r.key,
        )
      )
        continue;
      const recipientShip = n.groups.find((g) => g.id === r.key),
        fits = (a) =>
          governmentModel(a) === !!r.government &&
          (!recipientShip ||
            aircraftFitsShip(a, c.classes[recipientShip.classId]));
      const targets = r.government
          ? {
              scout: Math.floor(r.capacity * 0.25),
              strike: Math.floor(r.capacity * 0.25),
              bomber: Math.floor(r.capacity * 0.35),
              fighter:
                r.capacity -
                Math.floor(r.capacity * 0.25) * 2 -
                Math.floor(r.capacity * 0.35),
            }
          : wingTargets(r.capacity, r.carrier),
        available = operationalAircraftModels(c, id).filter(
          (a) => fits(a) && modelAvailable(s, n, a),
        );
      for (const role of Object.keys(targets))
        if (!available.some((a) => aircraftRoleFits(a, role))) {
          const recipient = ["strike", "fighter", "scout", "bomber"].find(
            (role) => available.some((a) => aircraftRoleFits(a, role)),
          );
          if (recipient) {
            targets[recipient] = (targets[recipient] || 0) + targets[role];
            delete targets[role];
          }
        }
      for (const [role, desired] of Object.entries(targets)) {
        const existing = r.wings
            .filter((w) => w.role === role)
            .reduce((v, w) => v + w.count, 0),
          spare = r.capacity - total(r.wings);
        const group = n.groups.find((g) => g.id === r.key),
          modernize =
            (!group || !group.atSea) &&
            r.wings.some((w) => w.role === role && w.count > 0);
        if ((existing >= desired || spare <= 0) && !modernize) continue;
        const models = available
          .filter((a) => aircraftRoleFits(a, role))
          .sort((a, b) => b.type_year - a.type_year);
        let sent = false;
        for (const a of models) {
          const old = r.wings.find(
              (w) =>
                w.role === role &&
                w.count > 0 &&
                operationalAircraftModels(c, id).find((m) => m.id === w.model)
                  ?.type_year < a.type_year,
            ),
            replace = existing >= desired || spare <= 0;
          if (replace && !old) continue;
          const sources = [
            ...Object.entries(n.airBases)
              .filter(([, b]) =>
                b.reserve.some((w) => w.model === a.id && w.count > 0),
              )
              .map(([p]) => p),
            ...(freeAircraft(n)[a.id] > 0 ? [hub] : []),
          ];
          for (const source of sources) {
            const t = dispatchAviation(s, c, id, {
              source,
              destination: r.key,
              model: a.id,
              role,
              count: replace
                ? Math.min(6, old.count)
                : Math.min(6, desired - existing, spare),
              replace,
            });
            if (t) {
              budget--;
              sent = true;
              break;
            }
          }
          if (sent) break;
        }
        if (sent) break;
      }
    }
    staffAircraft(s, c, id);
  }
}
