import { readDocument } from "../worker/documents.mjs";
import { campaignMinutes } from "./campaign-clock.mjs";
export const CONVOY_RULES = await readDocument("common/rules/merchant-routes.md");
export const convoyUnderway = (v, now) => v.count > 0 && !!(v.waitingForPort || v.battleId || (v.leg !== "unloading" && now < v.arriveAt));
export function convoyTraffic(s, id) {
  const n = s.nations[id], now = campaignMinutes(s);
  const voyages = n.convoys.filter(v => convoyUnderway(v, now));
  const hullsAtSea = voyages.reduce((total, v) => total + v.count, 0);
  return { hullsAtSea, convoyCount: voyages.length,
    averageHulls: voyages.length ? hullsAtSea / voyages.length : 0,
    targetAtSea: Math.round(n.merchant.hulls * CONVOY_RULES.AT_SEA_SHARE) };
}
