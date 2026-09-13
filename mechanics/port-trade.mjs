import { PORTS, NODES, distanceNm } from "./world.mjs";
import { portSpec } from "./port-catalog.mjs";
import { fleetPosition } from "./task-forces.mjs";
import { crewEffectiveness } from './ship-staffing.mjs';
import { supplyDetails } from './logistics.mjs';
import { readDocument } from '../worker/documents.mjs';
const rules = (await readDocument('common/rules/port-operations.md')).BLOCKADE;
const owner = (s, id) => s.world?.portControl?.[id] || PORTS[id].nation;
export function portTradeSummary(s, id) {
  let baseline = 0,
    available = 0,
    nominal = 0,
    blocked = 0;
  for (const [port, p] of Object.entries(PORTS)) {
    const spec = portSpec(s, port),
      condition = s.ports?.[port];
    if (p.nation === id) baseline += spec.trade;
    if (owner(s, port) !== id) continue;
    nominal += spec.trade;
    const intact = spec.trade * (condition?.health ?? 1);
    blocked += intact * (condition?.blockade || 0);
    available += intact * (1 - (condition?.blockade || 0));
  }
  return {
    baseline,
    nominal,
    available,
    blocked,
    coverage: Math.min(1, available / Math.max(1, baseline)),
  };
}
export function yardAvailability(s, id) {
  let baseline = 0,
    available = 0,
    owned = 0;
  for (const [port, p] of Object.entries(PORTS)) {
    const spec = portSpec(s, port);
    if (!spec.dock) continue;
    if (p.nation === id) baseline += spec.capacity;
    if (owner(s, port) !== id) continue;
    owned++;
    available += spec.capacity * (s.ports?.[port]?.health ?? 1);
  }
  return { owned, coverage: Math.min(1, available / Math.max(1, baseline)) };
}
// Assessed hourly; movements and combat use the shared fifteen-minute ticks.
// A close hostile patrol contests access. Siege forces sustain more pressure.
export function updatePortBlockades(s, c) {
  const forces = [];
  for (const [id, n] of Object.entries(s.nations))
    for (const f of n.fleets) {
      if (["port", "refuel", "repair", "returning"].includes(f.phase)) continue;
      let power = 0;
      for (const g of n.groups)
        if (
          g.fleetId === f.id &&
          g.count &&
          g.service === 'warship' &&
          g.atSea &&
          ["active", "returning"].includes(g.status)
        ) {
          const cl = c.classes[g.classId];
          power += cl.tons * g.count * g.health * crewEffectiveness(g,cl)
            * (["SS","SM"].includes(cl.type) ? rules.submarineTonnageWeight : 1);
        }
      if (power) forces.push({ id, f, power:power*supplyDetails(s,c,id,f).factor, position: fleetPosition(s, f) });
    }
  for (const port of Object.keys(PORTS)) {
    const condition = s.ports?.[port];
    if (!condition) continue;
    const id = owner(s, port),
      spec = portSpec(s, port);
    let attack = 0,
      defense = spec.artillery * rules.artilleryWeight * condition.health;
    for (const row of forces) {
      const distance = distanceNm(row.position, NODES[port]);
      if (distance > rules.radiusNm) continue;
      const r = s.relations[[id, row.id].sort().join("-")],
        weight = Math.max(rules.minimumDistanceWeight, 1 - distance / rules.distanceFalloffNm);
      if (r?.war)
        attack += row.power * weight * (row.f.mission === "siege" ? rules.siegeWeight : rules.patrolWeight);
      else if (row.id === id || r?.allied) defense += row.power * weight;
    }
    condition.blockade = attack
      ? Math.min(rules.maximumDisruption, attack / (attack + defense + rules.backgroundResistance))
      : 0;
  }
}
