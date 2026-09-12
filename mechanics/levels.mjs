import { readDocument } from "../worker/documents.mjs";
import { startingNation } from "../worker/catalog-loader.mjs";
const data = await readDocument("common/rules/levels.md");
// Saved levels are 1–9. 1922 starts at 1 and 1936 at 5; facilities normalize to the 1936 reference.
export const MIN_LEVEL = data.MIN_LEVEL,
  MAX_LEVEL = data.MAX_LEVEL;
export const upgradeLevel = (tech, key) =>
  Math.max(0, Math.min(8, (tech?.[key] ?? 1) - 1));
export const openingLevels = (programs, s) =>
  Object.fromEntries(
    Object.values(programs)
      .filter((p) => p.level)
      .map((p) => [p.level, s?.campaignId === "campaign_1922" ? 1 : 5]),
  );
export const LEVEL_YEARS = data.LEVEL_YEARS;
export const facilityFactor = (tech, key, rate) =>
  (1 + upgradeLevel(tech, key) * rate) / (1 + 4 * rate);
export function industryExpansion(s, id = s.player) {
  const opening = startingNation(s.campaignId, id).starting.level;
  const upgrades = Math.max(0, s.nations[id].tech.industry - opening);
  const rate = data.INDUSTRY_EXPANSION;
  return { opening, upgrades, rate, multiplier: 1 + upgrades * rate,
    baseline: (1 + (opening - 1) * rate) / (1 + 4 * rate) };
}
export function industryFactor(s, id = s.player) {
  const e = industryExpansion(s,id);
  return e.baseline * e.multiplier;
}
// Level 5 covers optical/radio coordination and radar trials. Operational fleet radar starts at 6.
export const radarLevel = (tech) => Math.max(0, (tech?.radar || 1) - 5);
