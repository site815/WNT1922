import { PORTS, NODES, distanceNm } from "./world.mjs";
import { campaignMinutes, periodicTick } from "./campaign-clock.mjs";
import { baseAirPower, aviationOwner } from "./base-aviation.mjs";
import {
  fleetPosition,
  fleetStats,
  operationRandom,
  recordContact,
} from "./task-forces.mjs";
import {
  airConditions,
  searchSector,
  sectorFactor,
} from "./air-conditions.mjs";
import { anchoredShips } from "./port-operations.mjs";
const pair = (a, b) => [a, b].sort().join("-");
// Patrols are an hourly strategic search, paid from the daily aviation-store
// allowance. Reports use actual observations, never a live enemy map marker.
export function coastalRecon(s, c) {
  const now = campaignMinutes(s);
  if (!periodicTick(now, 60, 17)) return;
  const forces = [];
  for (const [id, n] of Object.entries(s.nations))
    for (const f of n.fleets)
      forces.push({ id, f, position: fleetPosition(s, f) });
  for (const [id, n] of Object.entries(s.nations))
    for (const port of Object.keys(n.airBases || {})) {
      if (aviationOwner(s, port) !== id) continue;
      const air = baseAirPower(s, c, port),
        conditions = airConditions(s, NODES[port]);
      if (
        air.scout <= 0 ||
        air.readiness <= 0 ||
        conditions.light !== "Daylight" ||
        !conditions.launch
      )
        continue;
      const sector = searchSector(
        s,
        { salt: Object.keys(PORTS).indexOf(port) },
        NODES[port],
      );
      for (const target of forces) {
        if (
          target.id === id ||
          Math.abs(target.position[1] - NODES[port][1]) * 111.2 > air.radius
        )
          continue;
        const distance = distanceNm(NODES[port], target.position) * 1.852;
        if (distance > air.radius) continue;
        const search = baseAirPower(s, c, port, distance).scout;
        if (search <= 0) continue;
        const existing = n.contacts.find((x) => x.id === target.f.id);
        if (existing && now - existing.seenAt < 45) continue;
        const chance =
          Math.min(0.8, 0.08 + search * 0.018) *
          Math.max(0.1, 1 - (distance / Math.max(1, air.radius)) * 0.8) *
          conditions.search *
          sectorFactor(sector, NODES[port], target.position);
        if (operationRandom(s) < chance) {
          const stats = fleetStats(s, c, target.id, target.f);
          if (stats.hulls)
            recordContact(
              s,
              id,
              target.id,
              target.f,
              target.position,
              stats,
              "Scouting",
            );
        }
      }
      for (const enemyPort of Object.keys(PORTS)) {
        const enemy = aviationOwner(s, enemyPort);
        if (
          !s.relations[pair(id, enemy)]?.war ||
          distanceNm(NODES[port], NODES[enemyPort]) * 1.852 > air.radius
        )
          continue;
        if (
          operationRandom(s) <
          0.35 *
            conditions.search *
            sectorFactor(sector, NODES[port], NODES[enemyPort])
        )
          observeAnchorage(s, c, id, enemyPort, "Shore patrol");
      }
    }
  // Carrier / floatplane search sectors also photograph enemy anchorages. The
  // admiral chooses sectors from the objective or most recent enemy report.
  for (const { id, f, position } of forces) {
    if (["port", "refuel", "repair"].includes(f.phase)) continue;
    const st = fleetStats(s, c, id, f),
      conditions = airConditions(s, position);
    if (st.scouts <= 0 || !conditions.launch) continue;
    const sector = searchSector(s, f, position, NODES[f.objectiveNode]);
    for (const port of Object.keys(PORTS))
      if (
        s.relations[pair(id, aviationOwner(s, port))]?.war &&
        distanceNm(position, NODES[port]) <= st.airRadius &&
        operationRandom(s) <
          0.45 * conditions.search * sectorFactor(sector, position, NODES[port])
      )
        observeAnchorage(s, c, id, port, "Fleet aerial reconnaissance");
  }
}
export function observeAnchorage(s, c, id, port, source) {
  const owner = aviationOwner(s, port),
    ships = anchoredShips(s, c, owner, port),
    composition = {};
  let hulls = 0;
  for (const g of ships) {
    hulls += g.count;
    const type = c.classes[g.classId].type;
    composition[type] = (composition[type] || 0) + g.count;
  }
  s.nations[id].anchorageReports ??= {};
  s.nations[id].anchorageReports[port] = {
    seenAt: campaignMinutes(s),
    owner,
    hulls,
    composition,
    source,
  };
}
