import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/ship-staffing.md");
import { HOME_PORT } from "./world.mjs";
const tiers = data.tiers;
export const compareShips = (c) => (a, b) => {
  const x = c.classes[a.classId],
    y = c.classes[b.classId];
  return (
    (tiers[x.type] ?? 4) - (tiers[y.type] ?? 4) ||
    y.year - x.year ||
    y.tons - x.tons ||
    a.name.localeCompare(b.name)
  );
};
const commissioned = (g) =>
  g.count > 0 &&
  !["sunk", "scrapped", "building", "trials", "converting"].includes(
    g.status,
  ) &&
  g.service !== "merchant";
export const sailorDemand = (g, cl) =>
  commissioned(g)
    ? Math.ceil(cl.crew * g.count * (g.status === "reserve" ? 0.15 : 1))
    : 0;
export const crewEffectiveness = (g, cl) =>
  Math.min(1, (g.sailors || 0) / Math.max(1, cl.crew * g.count));
export const fullyStaffed = (g, cl) => (g.sailors || 0) >= cl.crew * g.count;
export function sailorSummary(s, c, id = s.player) {
  const n = s.nations[id];
  let required = 0,
    assigned = 0,
    ready = 0,
    waiting = 0;
  for (const g of n.groups) {
    required += sailorDemand(g, c.classes[g.classId]);
    assigned += g.sailors || 0;
    if (g.status === "active" && g.service === "warship") {
      if (fullyStaffed(g, c.classes[g.classId])) ready += g.count;
      else if (!g.atSea) waiting += g.count;
    }
  }
  return {
    total: Math.floor(n.crew),
    required,
    balance: Math.floor(n.crew) - required,
    assigned,
    free: Math.max(0, Math.floor(n.crew) - assigned),
    ready,
    waiting,
  };
}
export function staffSailors(s, c, id) {
  const n = s.nations[id];
  let free = Math.floor(n.crew);
  // Sailors aboard deployed ships stay aboard. They cannot teleport between forces.
  for (const g of n.groups) {
    g.atSea ??= false;
    if (!commissioned(g)) {
      g.sailors = 0;
      g.atSea = false;
    } else if (g.atSea || g.battleId) {
      g.sailors = Math.min(
        g.sailors || 0,
        sailorDemand(g, c.classes[g.classId]),
        free,
      );
      free -= g.sailors;
    } else g.sailors = 0;
  }
  // Preserve working screens and submarine patrols before filling expensive
  // battle lines. Within a role, modern hulls receive crews before legacy hulls.
  const priority = (g) => {
    const cl = c.classes[g.classId];
    return g.status === "reserve"
      ? 10
      : g.service === "support"
        ? 5
        : ["DD", "DE", "DL", "TB", "SS", "SM"].includes(cl.type)
          ? 0
          : ["CV", "CVL"].includes(cl.type)
            ? 1
            : g.legacy
              ? 3
              : 2;
  };
  const docked = n.groups
    .filter((g) => commissioned(g) && !g.atSea && !g.battleId)
    .sort((a, b) => priority(a) - priority(b) || compareShips(c)(a, b));
  for (const g of docked) {
    const cl = c.classes[g.classId],
      perHull = Math.ceil(cl.crew * (g.status === "reserve" ? 0.15 : 1)),
      hulls = perHull ? Math.min(g.count, Math.floor(free / perHull)) : g.count;
    g.sailors = hulls * perHull;
    free -= g.sailors;
  }
}
export function prepareDeparture(s, c, id, f) {
  if (f.battleId || s.nations[id].groups.some(g=>g.fleetId===f.id && g.battleId)) return 0;
  staffSailors(s, c, id);
  const n = s.nations[id];
  let ready = 0;
  for (const g of n.groups.filter(
    (g) => g.fleetId === f.id && ["active", "returning"].includes(g.status),
  )) {
    if (g.atSea || fullyStaffed(g, c.classes[g.classId])) {
      g.atSea = true;
      ready += g.count;
    } else {
      g.dockPort = f.port || HOME_PORT[id];
      delete g.fleetId;
    }
  }
  return ready;
}
export function dockSailors(s, c, id, f) {
  for (const g of s.nations[id].groups)
    if (g.fleetId === f.id) {
      g.atSea = false;
      g.dockPort = f.port;
    }
  staffSailors(s, c, id);
}
