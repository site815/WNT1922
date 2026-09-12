import { readDocument } from "../worker/documents.mjs";
export const ECONOMY = await readDocument("common/rules/economy.md");
export const requiredShipping = (s, id = s.player) =>
  (s.nations[id].gdp + s.nations[id].gtp) / ECONOMY.SHIPPING_DIVISOR;
export const gdpGrowthRate = (normal, disruption) => disruption < ECONOMY.GDP_BOMBING_THRESHOLD
  ? normal * Math.max(0, 1 - disruption / ECONOMY.GDP_BOMBING_THRESHOLD)
  : ECONOMY.GDP_BOMBING_MIN_GROWTH *
      Math.min(1, (disruption - ECONOMY.GDP_BOMBING_THRESHOLD) / (1 - ECONOMY.GDP_BOMBING_THRESHOLD));
export const nationAtWar = (s, id) => Object.values(s.relations).some(
  (r) => r.war && (r.a === id || r.b === id),
);
export const daysInMonth = (day) => {
  const d = new Date(day * 86400000);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
};
export const tradeHullGrowth = (logistics, war) => {
  const neutral = ECONOMY.GROWTH_NEUTRAL_LOGISTICS;
  const value = Math.max(0, Math.min(1, logistics));
  return value < neutral
    ? ECONOMY.GTP_MIN_GROWTH * (1 - value / neutral)
    : (war ? ECONOMY.GTP_WAR_GROWTH : ECONOMY.GTP_PEACE_GROWTH) * (value - neutral) / (1 - neutral);
};
export function convoyRecord(s, id) {
  const rows = (s.nations[id].convoyRecord || []).filter(
    (r) => s.day + (s.fraction || 0) - r.at < ECONOMY.CONVOY_RECORD_DAYS,
  );
  const delivered = rows.reduce((v, r) => v + r.delivered, 0);
  const sunk = rows.reduce((v, r) => v + r.sunk, 0);
  return { delivered, sunk, success: !nationAtWar(s, id) || delivered + sunk === 0 ? 1 : delivered / (delivered + sunk) };
}
export function recordConvoy(s, id, { delivered = 0, sunk = 0 }) {
  const n = s.nations[id], at = s.day + (s.fraction || 0);
  n.convoyRecord = (n.convoyRecord || []).filter((r) => at - r.at < ECONOMY.CONVOY_RECORD_DAYS);
  // Combine only events in the same simulated minute; the rolling window is exact.
  let row = n.convoyRecord.find((r) => Math.round(r.at * 1440) === Math.round(at * 1440));
  if (!row) n.convoyRecord.push(row = { at, delivered: 0, sunk: 0 });
  row.delivered += Math.max(0, delivered);
  row.sunk += Math.max(0, sunk);
}
