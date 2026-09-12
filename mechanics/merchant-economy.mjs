import { readDocument } from "../worker/documents.mjs";
import { startingNation } from "../worker/catalog-loader.mjs";
import { portTradeSummary } from "./port-trade.mjs";
import { convoyRecord, requiredShipping } from "./economy-rules.mjs";
const data = await readDocument("common/rules/merchant-economy.md");
export const MERCHANT_SIZE_MONTHLY = data.MERCHANT_SIZE_MONTHLY;
export const campaignOpeningLevel = (s, id = s.player) => startingNation(s.campaignId, id).starting.level;
// Registered volume is represented by one average civilian hull, independent of naval catalogs.
export function averageMerchantGRT(s, id) {
  const m = s.nations[id].merchant;
  return m.averageGRT;
}
export function merchantEconomy(s, c, id = s.player) {
  const n = s.nations[id], reference = c?.nations[id] || startingNation(s.campaignId, id);
  const average = averageMerchantGRT(s, id), hulls = n.merchant.hulls, current = hulls * average;
  const baseline = reference.merchants.grossRegisterTons || reference.merchants.hulls * 1000;
  const ports = portTradeSummary(s, id), convoys = convoyRecord(s, id);
  const required = requiredShipping(s,id), deliveryCoverage = Math.min(1,convoys.delivered / Math.max(1,required));
  const convoyPerformance = convoys.success * deliveryCoverage;
  return { ports, convoys, hulls, average, current, baseline, gtp: n.gtp,
    startingGTP: reference.economy.gtp, required, deliveryCoverage, convoyPerformance,
    logistics: 100 * (ports.coverage + convoyPerformance) / 2,
    estimated: !reference.merchants.grossRegisterTons };
}
