import { PORTS, NODES, HOME_PORT, distanceNm } from "./world.mjs";
import { campaignMinutes } from "./campaign-clock.mjs";
import { fleetPosition } from "./task-forces.mjs";
import { fullyStaffed } from "./ship-staffing.mjs";
const snapshots = new WeakMap();
export function invalidateSupport(s) {
  snapshots.delete(s);
}
export function depotCapacity(s, c, port) {
  if (!c) return 0;
  const minute = campaignMinutes(s),
    cached = snapshots.get(s);
  if (cached?.minute === minute) return cached.capacity[port] || 0;
  const capacity = {};
  for (const [id, n] of Object.entries(s.nations)) {
    const fleets = new Map(n.fleets.map((f) => [f.id, f]));
    for (const g of n.groups) {
      const cl = c.classes[g.classId];
      if (
        cl.type !== "AD" ||
        g.service !== "support" ||
        g.status !== "active" ||
        g.atSea ||
        !fullyStaffed(g, cl)
      )
        continue;
      const f = fleets.get(g.fleetId),
        base = g.dockPort || f?.port || HOME_PORT[id],
        owner = s.world?.portControl?.[base] || PORTS[base]?.nation,
        relation = s.relations[[id, owner].sort().join("-")];
      if (
        !PORTS[base] ||
        (owner !== id && !(relation?.allied && !relation.war)) ||
        (f && distanceNm(fleetPosition(s, f), NODES[base]) > 25)
      )
        continue;
      capacity[base] = (capacity[base] || 0) + cl.tons * g.count * g.health * 3;
    }
  }
  snapshots.set(s, { minute, capacity });
  return capacity[port] || 0;
}
export function replenishmentRelief(s, f) {
  return f
    ? Math.max(
        0,
        Math.min(
          1,
          ((f.replenishedUntil || -1e9) - campaignMinutes(s)) / (3 * 1440),
        ),
      ) * (f.replenishmentRelief || 0)
    : 0;
}
