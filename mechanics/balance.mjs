import { readDocument } from "../worker/documents.mjs";
import { startingNation } from "../worker/catalog-loader.mjs";
import { ECONOMY } from "./economy-rules.mjs";
import { homeEconomy } from './domestic-economy.mjs';
const data = await readDocument("common/rules/balance.md");
export function economyFor(s, id) {
  const e = startingNation(s?.campaignId || "in_good_faith_1936", id).economy;
  const n = s?.nations?.[id], gdp = n?.gdp ?? e.gdp;
  const home = homeEconomy(s,id);
  const productiveGDP = gdp * home.access * (1 - (n?.industrialDamage?.industry || 0));
  const gtp = n?.gtp ?? e.gtp;
  const tradeStrategicModifier = Math.min(1, gtp / Math.max(1, gdp));
  return { ...e, gdp, productiveGDP, home, gtp, tradeStrategicModifier,
    goldYear: productiveGDP * ECONOMY.GDP_GOLD_SHARE + gtp * ECONOMY.GTP_GOLD_SHARE,
    industryYear: productiveGDP * (1 - ECONOMY.GDP_GOLD_SHARE) + gtp * (1 - ECONOMY.GTP_GOLD_SHARE),
    strategicYear: (productiveGDP * e.strategicModifier + gtp * tradeStrategicModifier) * ECONOMY.STRATEGIC_OUTPUT_SHARE,
    yardYear: e.yardYear * gdp / e.gdp };
}
export const PROGRAMS = data.PROGRAMS;
export const RULES = data.RULES;
