import { contentFor } from "../mechanics/campaign-content.mjs";
import {
  fleetPower,
  monthlyIncome,
  yardLoad,
  fleetSummary,
  supportSummary,
  merchantSummary,
} from "../mechanics/engine.mjs";
import { aircraftSummary } from "../mechanics/naval-resources.mjs";
import { sailorSummary } from "../mechanics/ship-staffing.mjs";
import { merchantEconomy } from "../mechanics/merchant-economy.mjs";
import { fleetStats, convoyCoverage } from "../mechanics/task-forces.mjs";
import { supplyDetails } from "../mechanics/logistics.mjs";
import { portSummary } from "../mechanics/ports.mjs";
import { PORTS } from "../mechanics/world.mjs";
const views = new WeakMap();
export const installView = (s, view) => {
  if (view) views.set(s, view);
};
export const uiModel = (s) => views.get(s);
export function buildView(s, bundle) {
  const c = contentFor(bundle, s),
    n = s.nations[s.player],
    fleets = {};
  for (const f of n.fleets) {
    const stats = fleetStats(s, c, s.player, f),
      { groups, active, ...scalars } = stats;
    fleets[f.id] = {
      stats: scalars,
      groups: groups.map((g) => g.id),
      active: active.map((g) => g.id),
      supply: supplyDetails(s, c, s.player, f),
      power: fleetPower(s, c, s.player, null, f.id),
    };
  }
  return {
    escortCoverage: convoyCoverage(s, c),
    air: aircraftSummary(s, c),
    crew: sailorSummary(s, c),
    economy: merchantEconomy(s, c),
    income: monthlyIncome(s, c),
    power: fleetPower(s, c),
    yards: yardLoad(s, c),
    fleet: fleetSummary(s, c),
    support: supportSummary(s, c),
    merchants: merchantSummary(s, c),
    fleets,
    averageSupply: Object.values(fleets).reduce((v, f) => v + f.supply.factor, 0) / Math.max(1, n.fleets.length),
    ports: Object.fromEntries(
      Object.keys(PORTS).map((id) => [id, portSummary(s, c, id)]),
    ),
  };
}
export function displayedFleet(s, c, f) {
  const cached = uiModel(s)?.fleets[f.id];
  if (!cached)
    return {
      stats: fleetStats(s, c, s.player, f),
      supply: supplyDetails(s, c, s.player, f),
      power: fleetPower(s, c, s.player, null, f.id),
    };
  const groups = new Map(s.nations[s.player].groups.map((g) => [g.id, g]));
  return {
    ...cached,
    stats: {
      ...cached.stats,
      groups: cached.groups.map((id) => groups.get(id)).filter(Boolean),
      active: cached.active.map((id) => groups.get(id)).filter(Boolean),
    },
  };
}
