import {
  NODES,
  PORTS,
  HOME_PORT,
  DEFAULT_AREA,
  AREAS,
  distanceNm,
} from "./world.mjs";
import { campaignMinutes, travelledThisTick } from "./campaign-clock.mjs";
import {
  fleetPosition,
  fleetStats,
  fleetGroups,
  setRoute,
  nextSupplyLeg,
  usablePorts,
  invalidateOperations,
} from "./task-forces.mjs";
import { staffSailors, fullyStaffed, dockSailors } from "./ship-staffing.mjs";
import { portSummary } from "./ports.mjs";
import { nearestSupplyPort } from "./logistics.mjs";
const operational = (g) => g.count > 0 && g.status === "active";
const closeNode = (position, allowed = Object.keys(NODES)) =>
  allowed.reduce((a, b) =>
    distanceNm(NODES[a], position) < distanceNm(NODES[b], position) ? a : b,
  );
const auxiliaries = (s, c, id, f) =>
  fleetGroups(s, id, f.id).filter(
    (g) => operational(g) && g.service === "support",
  );
export function organizeSupport(s, c) {
  for (const [id, n] of Object.entries(s.nations)) {
    const extra = [];
    for (const g of n.groups) {
      if (
        g.service !== "support" ||
        g.fleetId ||
        !operational(g) ||
        g.count <= 1 ||
        !c.classes[g.classId].crew
      )
        continue;
      const count = g.count,
        sailors = g.sailors || 0,
        paid = { ...g.paid };
      for (let i = 0; i < count; i++) {
        const ship = i ? structuredClone(g) : g;
        ship.id = i ? g.id + "#support-" + i : g.id;
        ship.baseName = g.baseName || g.name;
        ship.name = ship.baseName + " · Support " + (i + 1);
        ship.count = 1;
        ship.sailors =
          Math.floor(sailors / count) + (i < sailors % count ? 1 : 0);
        ship.paid = {
          ...paid,
          gold: (paid.gold || 0) / count,
          influence: (paid.influence || 0) / count,
          industry: (paid.industry || 0) / count,
        };
        if (i) extra.push(ship);
      }
    }
    n.groups.push(...extra);
    staffSailors(s, c, id);
    for (const g of n.groups.filter(
      (g) =>
        g.service === "support" &&
        operational(g) &&
        !g.fleetId &&
        c.classes[g.classId].crew > 0 &&
        fullyStaffed(g, c.classes[g.classId]),
    )) {
      const kind = c.classes[g.classId].supportHybrid
          ? "oiler"
          : c.classes[g.classId].type === "AD"
            ? "depot"
            : "oiler",
        port = g.dockPort || HOME_PORT[id];
      let f = n.fleets.find(
        (f) =>
          f.role === "support" &&
          f.supportKind === kind &&
          f.phase === "port" &&
          f.port === port &&
          auxiliaries(s, c, id, f).length < 4,
      );
      if (!f) {
        const now = campaignMinutes(s);
        f = {
          id: "support-" + id + "-" + s.nextId++,
          name:
            (kind === "depot" ? "Depot group " : "Replenishment group ") +
            (1 +
              n.fleets.filter(
                (f) => f.role === "support" && f.supportKind === kind,
              ).length),
          role: "support",
          supportKind: kind,
          mission: "guard",
          manual: false,
          aggressiveBattle: false,
          port,
          node: port,
          targetNode: port,
          route: [NODES[port]],
          departAt: now,
          arriveAt: now,
          speed: 10,
          phase: "port",
          nextPlanAt: now + 30,
          lastBattle: -1e9,
          fuelNm: 10000,
          maxRangeNm: 10000,
          area: DEFAULT_AREA[id],
          salt: 1,
          supportCargo: 0,
        };
        n.fleets.push(f);
      }
      g.fleetId = f.id;
      g.dockPort = port;
      g.atSea = false;
      const st = fleetStats(s, c, id, f);
      f.speed = st.speed;
      f.maxRangeNm = st.range;
      f.fuelNm = st.range;
    }
    // Spare escorts travel with auxiliaries; combat task-force screens retain priority.
    for (const f of n.fleets.filter(
      (f) => f.role === "support" && f.phase === "port",
    )) {
      if (fleetGroups(s, id, f.id).some((g) => g.service === "warship"))
        continue;
      const donor = n.fleets.find(
        (x) =>
          x.role === "escort" &&
          x.phase === "port" &&
          x.port === f.port &&
          fleetGroups(s, id, x.id).filter(operational).length > 4,
      );
      if (donor) {
        const escort = fleetGroups(s, id, donor.id).find(
          (g) => operational(g) && fullyStaffed(g, c.classes[g.classId]),
        );
        if (escort) {
          escort.fleetId = f.id;
          invalidateOperations(s);
        }
      }
    }
  }
  invalidateOperations(s);
}
function supportDestination(s, c, id, f) {
  const n = s.nations[id],
    ports = usablePorts(s, id);
  if (!ports.length) return null;
  const position = fleetPosition(s, f),
    base = closeNode(position, ports);
  if (
    f.fuelNm < f.maxRangeNm * 0.3 ||
    auxiliaries(s, c, id, f).some((g) => g.health < 0.75)
  ) {
    delete f.supportTarget;
    return base;
  }
  if (f.supportKind === "depot") {
    const demand = {};
    for (const other of n.fleets) {
      if (["support", "repair", "reinforcement"].includes(other.role)) continue;
      const port = nearestSupplyPort(s, id, fleetPosition(s, other)).port;
      if (port)
        demand[port] = (demand[port] || 0) + fleetStats(s, c, id, other).tons;
    }
    const bonus = auxiliaries(s, c, id, f).reduce(
      (v, g) => v + c.classes[g.classId].tons * g.count * g.health * 3,
      0,
    );
    const ranked = ports
      .map((port) => {
        const p = portSummary(s, c, port),
          need = Math.max(
            0,
            (demand[port] || 0) -
              p.capacity +
              (f.phase === "port" && f.port === port
                ? Math.min(p.depotSupport, bonus)
                : 0),
          );
        return {
          port,
          score:
            Math.min(bonus, need) /
            (1 + distanceNm(position, NODES[port]) / 2500),
        };
      })
      .sort((a, b) => b.score - a.score);
    return ranked[0]?.score > 0
      ? ranked[0].port
      : ports.includes(f.targetNode)
        ? f.targetNode
        : base;
  }
  if ((f.supportCargo || 0) < 1) return base;
  const targets = n.fleets
    .filter(
      (x) =>
        !["support", "repair", "reinforcement", "submarine"].includes(x.role) &&
        !["port", "refuel", "returning", "repair"].includes(x.phase) &&
        fleetStats(s, c, id, x).hulls &&
        x.fuelNm < x.maxRangeNm * 0.9,
    )
    .map((x) => ({
      f: x,
      need:
        ((1 - x.fuelNm / Math.max(1, x.maxRangeNm)) *
          fleetStats(s, c, id, x).tons) /
        (1 + distanceNm(position, fleetPosition(s, x)) / 1000),
    }))
    .sort((a, b) => b.need - a.need);
  if (!targets.length) {
    delete f.supportTarget;
    return base;
  }
  const target = targets[0].f;
  f.supportTarget = target.id;
  const rendezvous = closeNode(
    fleetPosition(s, target, campaignMinutes(s) + 360),
    Object.keys(NODES).filter((k) => !PORTS[k] || ports.includes(k)),
  );
  return rendezvous;
}
export function minuteSupport(s, c, id, f) {
  const now = campaignMinutes(s),
    n = s.nations[id],
    ships = auxiliaries(s, c, id, f),
    position = fleetPosition(s, f),
    ports = usablePorts(s, id);
  if (!ships.length) {
    const base = ports.length ? closeNode(position, ports) : null;
    if (base && f.phase !== "returning") {
      f.role = "repair";
      f.originalRole = "support";
      setRoute(s, c, id, f, base, { phase: "returning" });
    }
    return;
  }
  f.fuelNm = Math.max(0, f.fuelNm - travelledThisTick(f, now));
  if (now < f.arriveAt) { /* Still underway. */ }
  else if (f.phase === "passage") {
    f.phase = ports.includes(f.targetNode) ? "refuel" : "patrol";
    if (f.phase === "refuel") dockSailors(s, c, id, f);
    f.nextPlanAt = now + (f.phase === "refuel" ? 720 : 360);
  } else if (f.phase === "refuel" && now >= f.nextPlanAt) {
    f.phase = "port";
    f.fuelNm = f.maxRangeNm;
    dockSailors(s, c, id, f);
  }
  if (f.phase === "port" && ports.includes(f.port)) {
    for (const g of ships)
      if (g.health < 0.75) {
        g.status = "repair";
        g.dockPort = f.port;
        delete g.fleetId;
      }
    if (ships.some((g) => g.status === "repair")) {
      invalidateOperations(s);
      return;
    }
    f.supportCargo =
      f.supportKind === "oiler"
        ? ships.reduce(
            (v, g) => v + c.classes[g.classId].tons * g.count * g.health * 2,
            0,
          )
        : 0;
    f.fuelNm = f.maxRangeNm;
  }
  const target = n.fleets.find((x) => x.id === f.supportTarget);
  if (
    f.supportKind === "oiler" &&
    target &&
    f.phase !== "port" &&
    (f.nextReplenishment || -1e9) <= now &&
    distanceNm(position, fleetPosition(s, target)) <= 40
  ) {
    const st = fleetStats(s, c, id, target),
      missing = Math.max(0, 1 - target.fuelNm / Math.max(1, target.maxRangeNm)),
      fraction = Math.min(
        0.35,
        missing,
        (f.supportCargo || 0) / Math.max(1, st.tons),
      );
    if (fraction > 0) {
      target.fuelNm = Math.min(
        target.maxRangeNm,
        target.fuelNm + target.maxRangeNm * fraction,
      );
      f.supportCargo = Math.max(0, f.supportCargo - st.tons * fraction);
      f.deliveredCargo = (f.deliveredCargo || 0) + st.tons * fraction;
      target.replenishedUntil = now + 3 * 1440;
      target.replenishmentRelief = Math.min(0.15, fraction * 0.6);
      f.nextReplenishment = now + 1440;
      invalidateOperations(s);
    }
  }
  if (now >= f.nextPlanAt) {
    const destination = supportDestination(s, c, id, f);
    if (!destination) {
      f.nextPlanAt = now + 1440;
      return;
    }
    f.supportDestination = destination;
    if (distanceNm(position, NODES[destination]) < 1) {
      if (ports.includes(destination)) {
        f.port = destination;
        f.phase = "port";
        dockSailors(s, c, id, f);
      }
      f.nextPlanAt = now + 360;
      return;
    }
    const next = nextSupplyLeg(s, id, f, destination);
    if (next) setRoute(s, c, id, f, next);
    else {
      const base = closeNode(position, ports);
      if (distanceNm(position, NODES[base]) > 1) setRoute(s, c, id, f, base);
      else f.nextPlanAt = now + 1440;
    }
  }
}
