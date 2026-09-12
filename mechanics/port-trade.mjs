import { PORTS, NODES, distanceNm } from "./world.mjs";
import { portSpec } from "./port-catalog.mjs";
import { fleetPosition } from "./task-forces.mjs";
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
// Assessed hourly; individual movements and combat still resolve every minute.
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
          g.atSea &&
          ["active", "returning"].includes(g.status)
        ) {
          const cl = c.classes[g.classId];
          power += cl.tons * g.count * g.health * (cl.type === "SS" ? 0.35 : 1);
        }
      if (power) forces.push({ id, f, power, position: fleetPosition(s, f) });
    }
  for (const port of Object.keys(PORTS)) {
    const condition = s.ports?.[port];
    if (!condition) continue;
    const id = owner(s, port),
      spec = portSpec(s, port);
    let attack = 0,
      defense = spec.artillery * 8 * condition.health;
    for (const row of forces) {
      const distance = distanceNm(row.position, NODES[port]);
      if (distance > 65) continue;
      const r = s.relations[[id, row.id].sort().join("-")],
        weight = Math.max(0.15, 1 - distance / 85);
      if (r?.war)
        attack += row.power * weight * (row.f.mission === "siege" ? 1.5 : 0.65);
      else if (row.id === id || r?.allied) defense += row.power * weight;
    }
    condition.blockade = attack
      ? Math.min(0.95, attack / (attack + defense + 15000))
      : 0;
  }
}
