import { readDocument } from "../worker/documents.mjs";
import { startingNation } from "../worker/catalog-loader.mjs";
import { portTradeSummary } from "./port-trade.mjs";
import { convoyRecord, requiredShipping, ECONOMY } from "./economy-rules.mjs";
import { convoyTraffic } from "./convoy-traffic.mjs";
const data = await readDocument("common/rules/merchant-economy.md");
export const MERCHANT_RULES = data;
export const MERCHANT_SIZE_MONTHLY = data.MERCHANT_SIZE_MONTHLY;
export function merchantProduction(shipping,expansion) {
  const requiredGRT = shipping.baseline * shipping.gtp / shipping.startingGTP;
  const shortfall = requiredGRT>0 ? Math.max(0,Math.min(1,1-shipping.current/requiredGRT)) : 0;
  const baseHulls = data.HULLS_SUFFICIENT+(data.HULLS_MAX_SHORTAGE-data.HULLS_SUFFICIENT)*shortfall;
  const l = Math.max(0,Math.min(1,shipping.logistics/100)), neutral=ECONOMY.GROWTH_NEUTRAL_LOGISTICS;
  const logisticsMultiplier = l<neutral
    ? data.LOGISTICS_MIN_PRODUCTION+(data.LOGISTICS_NEUTRAL_PRODUCTION-data.LOGISTICS_MIN_PRODUCTION)*l/neutral
    : data.LOGISTICS_NEUTRAL_PRODUCTION+(data.LOGISTICS_MAX_PRODUCTION-data.LOGISTICS_NEUTRAL_PRODUCTION)*(l-neutral)/(1-neutral);
  return {requiredGRT,shortfall,baseHulls,logisticsMultiplier,industryMultiplier:expansion.multiplier,
    hullsPerMonth:baseHulls*logisticsMultiplier*expansion.multiplier};
}
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
  const openingHulls = reference.merchants.hulls, openingAverage = baseline / openingHulls;
  const ports = portTradeSummary(s, id), convoys = convoyRecord(s, id);
  const required = requiredShipping(s,id), deliveryCoverage = convoys.delivered / Math.max(1,required);
  const effectiveDeliveryCoverage = Math.min(1, deliveryCoverage);
  const convoyPerformance = convoys.success * effectiveDeliveryCoverage;
  return { ports, convoys, hulls, average, current, baseline, openingHulls, openingAverage, gtp: n.gtp,
    startingGTP: reference.economy.gtp, required, deliveryCoverage, effectiveDeliveryCoverage, convoyPerformance,
    traffic: convoyTraffic(s, id),
    logistics: 100 * (ports.coverage + convoyPerformance) / 2,
    estimated: !reference.merchants.grossRegisterTons };
}
