import { ECONOMY, nationAtWar, daysInMonth } from "./economy-rules.mjs";
export const strategicFactor = (n) => Math.max(
  ECONOMY.STRATEGIC_EMERGENCY_FACTOR,
  Math.min(1, n.strategic / Math.max(1, (n.strategicDailyDemand || 0) * ECONOMY.STRATEGIC_RESERVE_DAYS)),
);
export const shipMaterialCost = (cl, count = 1) => cl.tons * count * ECONOMY.SHIP_CONSTRUCTION_PER_TON;
export const aircraftMaterialCost = (a) => (a.weights?.empty_kg || 2500) * ECONOMY.AIRCRAFT_CONSTRUCTION_PER_KG;
export function strategicDemand(s, c, id) {
  const n = s.nations[id];
  const tons = n.groups.filter((g) => g.count && g.atSea && ["active", "returning"].includes(g.status))
    .reduce((v, g) => v + c.classes[g.classId].tons * g.count, 0);
  const aircraft = Object.values(n.aircraft || {}).reduce((a, b) => a + b, 0)
    + Object.values(n.governmentAircraft || {}).reduce((a, b) => a + b, 0);
  const factor = nationAtWar(s, id) ? 1 : ECONOMY.PEACE_OPERATIONS_FACTOR;
  const ships = tons * ECONOMY.SHIP_OPERATIONS_PER_TON_MONTH * factor;
  const aviation = aircraft * ECONOMY.AIR_OPERATIONS_PER_AIRCRAFT_MONTH * factor;
  return { ships, aviation, monthly: ships + aviation, daily: (ships + aviation) / daysInMonth(s.day) };
}
export function consumeStrategic(s, c, id) {
  const n = s.nations[id], demand = strategicDemand(s, c, id);
  n.strategicDailyDemand = demand.daily;
  const used = Math.min(n.strategic, demand.daily * strategicFactor(n));
  n.strategic = Math.max(0, n.strategic - used);
  n.strategicSpent.operations += used;
}
