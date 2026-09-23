import { reserveGroup, scrapGroup, affordability } from "./engine.mjs";
import { shipInEngagement } from './battle-records.mjs';
export const bulkEligible = (g, mode) =>
  g.count > 0 &&
  !g.battleId &&
  (mode === "reserve"
    ? g.service === "warship" && g.status === "active" && !g.scrapOnArrival
    : mode === "recommission"
      ? g.service === "warship" && g.status === "reserve"
      : mode === "scrap" &&
        ["active", "reserve", "repair", "returning"].includes(g.status) &&
        !g.scrapOnArrival);
export function bulkPlan(s, ids, mode, actor = s.player) {
  if (
    !["reserve", "recommission", "scrap"].includes(mode) ||
    !Array.isArray(ids) ||
    new Set(ids).size !== ids.length
  )
    throw Error("Invalid bulk fleet order.");
  const n = s.nations[actor],
    groups = ids.map((id) => n.groups.find((g) => g.id === id));
  if (groups.some((g) => !g))
    throw Error("A selected hull is no longer in the register.");
  const eligible = groups.filter((g) => bulkEligible(g, mode) && !shipInEngagement(s,actor,g)),
    price = { gold: 0, influence: 0, industry: 0 };
  if (mode === "recommission")
    for (const g of eligible) {
      price.gold += Math.ceil(g.count * 60);
      price.influence += 2;
      price.industry += g.count * 15;
    }
  return {
    groups: eligible,
    hulls: eligible.reduce((v, g) => v + g.count, 0),
    price,
    blocked: !eligible.length
      ? "No selected hulls qualify for this order."
      : affordability(n, price),
  };
}
export function orderBulkFleet(s, c, ids, mode, actor = s.player) {
  const p = bulkPlan(s, ids, mode);
  if (p.blocked) throw Error(p.blocked);
  for (const g of p.groups)
    if (mode === "scrap") scrapGroup(s, c, g.id, actor);
    else reserveGroup(s, g.id, c, actor);
  return { hulls: p.hulls, mode };
}
