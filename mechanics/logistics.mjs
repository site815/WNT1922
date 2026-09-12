import { upgradeLevel } from "./levels.mjs";
import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/logistics.md");
import { portSummary } from "./ports.mjs";
import { NODES, PORTS, seaRoute, routeLength, distanceNm, nearestSeaNode } from "./world.mjs";
import { fleetPosition, usablePorts } from "./task-forces.mjs";

// Provisional distance steps, measured along the navigable sea graph.
export const SUPPLY_BANDS = data.SUPPLY_BANDS;
export const ENDURANCE_BANDS = data.ENDURANCE_BANDS;
const paths = new Map();
const laneDistance = (a, b) => {
  const k = a + ":" + b;
  if (!paths.has(k))
    paths.set(k, routeLength(seaRoute(a, b).map((n) => NODES[n])));
  return paths.get(k);
};
export function nearestSupplyPort(s, id, position) {
  const ports = usablePorts(s, id).filter(port => (s.ports?.[port]?.health ?? 1) > 0);
  let nearest = null,
    distance = 100000;
  if (position) {
    const node = nearestSeaNode(position, undefined, true);
    const offset = distanceNm(position, NODES[node]);
    for (const port of ports) {
      const direct = distanceNm(position, NODES[port]);
      const d =
        direct < 25 ? direct : offset + laneDistance(node, port);
      if (d < distance) {
        distance = d;
        nearest = port;
      }
    }
  }
  return { port: nearest, distance };
}
export function supplyDetails(s, c, id, f = null) {
  const n = s.nations[id],
    position = f
      ? fleetPosition(s, f)
      : NODES[
          n.fleets?.[0]?.port ||
            Object.keys(PORTS).find((p) => PORTS[p].nation === id)
        ];
  const { port: nearest, distance } = nearestSupplyPort(s, id, position);
  const band =
      SUPPLY_BANDS.find((b) => distance <= b.nm) || SUPPLY_BANDS.at(-1),
    support = replenishmentRelief(s, f),
    research = upgradeLevel(n.tech, "logistics") * data.REPLENISHMENT_BONUS_PER_LEVEL,
    distanceFactor = nearest
      ? Math.min(1, band.factor + (1 - band.factor) * research + support)
      : 0;
  const portCapacity = nearest ? portSummary(s, c, nearest) : null,
    capacityFactor = portCapacity?.coverage ?? 0;
  const hulls = f
      ? n.groups.filter(
          (g) =>
            g.fleetId === f.id &&
            g.count &&
            ["active", "returning"].includes(g.status),
        )
      : [],
    ranges = hulls.map((g) => (c.classes[g.classId].range || 3000) / 1.852),
    rangeNm = ranges.length ? Math.min(...ranges) : f?.maxRangeNm || Infinity;
  const enduranceUsed = Number.isFinite(rangeNm)
      ? (distance * 2) / Math.max(1, rangeNm)
      : 0,
    enduranceFactor = Math.min(
      1,
      (ENDURANCE_BANDS.find((b) => enduranceUsed <= b.fraction)?.factor ||
        0.2) + replenishmentRelief(s, f),
    );
  // Tactical supply never multiplies national trade, GDP or strategic logistics.
  const factor = Math.max(0, Math.min(1, distanceFactor * enduranceFactor));
  return {
    factor,
    rangeKm: Number.isFinite(rangeNm) ? rangeNm * 1.852 : 0,
    enduranceUsed,
    enduranceFactor,
    replenishment: support,
    researchRelief: research,
    capacityFactor,
    portCapacity,
    distance,
    port: nearest,
    portName: nearest ? PORTS[nearest].name : "No accessible friendly port",
    distanceFactor,
    training: n.training,
    morale: n.morale,
  };
}
import { replenishmentRelief } from "./support-effects.mjs";
