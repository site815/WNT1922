import { queueAirStrike } from "./air-operations.mjs";
import { campaignMinutes, periodicTick } from "./campaign-clock.mjs";
import { PORTS, NODES, distanceNm } from "./world.mjs";
import { portSpec } from "./port-catalog.mjs";
import { aviationAccess, aviationOwner } from "./base-aviation.mjs";
import { airConditions } from "./air-conditions.mjs";
import { economyFor } from "./balance.mjs";
const key = (a, b) => [a, b].sort().join("-");
export function initializeStrategicAir(s) {
  for (const n of Object.values(s.nations)) {
    n.industrialDamage ??= {
      industry: 0,
      yards: 0,
      lastAttack: -1e9,
      repairGold: 0,
      repairIndustry: 0,
    };
    n.strategicLog ??= [];
    n.nextStrategicAt ??= campaignMinutes(s);
  }
}
export function strategicAirPlanning(s, c) {
  const now = campaignMinutes(s);
  if (!periodicTick(now, 60, 23)) return;
  for (const [id, n] of Object.entries(s.nations)) {
    if (now < n.nextStrategicAt) continue;
    const models = new Map(
        (c.nations[id].armyAircraft || []).map((a) => [a.id, a]),
      ),
      candidates = [];
    for (const [base, b] of Object.entries(n.airBases)) {
      if (
        !aviationAccess(s, id, base) ||

        !airConditions(s, NODES[base]).launch
      )
        continue;
      const bombers = b.governmentWing.filter(
        (w) => w.role === "bomber" && w.crewed >= 2,
      );
      if (!bombers.length) continue;
      for (const port of Object.keys(PORTS)) {
        const enemy = aviationOwner(s, port);
        if (!s.relations[key(id, enemy)]?.war) continue;
        const distance = distanceNm(NODES[base], NODES[port]) * 1.852,
          ready = bombers
            .filter(
              (w) => models.get(w.model)?.fuel.combat_radius_km >= distance,
            )
            .reduce((v, w) => v + w.crewed, 0),
          spec = portSpec(s, port);
        if (ready >= 2)
          candidates.push({
            base,
            port,
            enemy,
            score:
              (ready * (spec.dock ? 3 : 1) * (1 + spec.trade / 100)) /
              (1 + distance / 800),
          });
      }
    }
    for (const target of candidates.sort((a, b) => b.score - a.score)) {
      const kind = portSpec(s, target.port).dock
        ? Math.floor(s.day / 7) % 2
          ? "industry"
          : "yards"
        : "port";
      if (
        queueAirStrike(s, c, id, {
          sourcePort: target.base,
          targetNation: target.enemy,
          targetId: target.port,
          targetKind: "port",
          operation: "strategic",
          industrialTarget: kind,
        })
      ) {
        n.nextStrategicAt = now + 7 * 1440;
        break;
      }
    }
  }
}
export function strategicDamage(s, c, id, op, attack) {
  if (op.operation !== "strategic") return null;
  const enemy = s.nations[op.targetNation],
    d = enemy.industrialDamage,
    models = new Map((c.nations[id].armyAircraft || []).map((a) => [a.id, a]));
  const payload = op.airWing
      .filter((w) => w.role === "bomber")
      .reduce(
        (v, w) => v + w.crewed * (models.get(w.model)?.bomb_load_kg || 500),
        0,
      ),
    delivery = Math.min(1, attack / Math.max(1, op.strikes * 12));
  const category = op.industrialTarget || "port";
  let amount = 0;
  if (category !== "port") {
    const economy = economyFor(s, op.targetNation),
      scale = Math.max(
        0.4,
        category === "yards"
          ? economy.yardYear / 100000
          : economy.industryYear / 60000,
      );
    amount =
      Math.min(0.025, (payload / (2500000 * scale)) * delivery) *
      (1 - d[category]);
    amount = Math.max(0, Math.min((category === "industry" ? 1 : 0.6) - d[category], amount));
    d[category] += amount;
    d.lastAttack = campaignMinutes(s);
  }
  const record = {
    minute: campaignMinutes(s),
    attacker: id,
    defender: op.targetNation,
    source: op.sourcePort,
    target: op.targetId,
    category,
    damage: amount,
    bombers: op.strikes,
    escorts: op.escorts,
  };
  for (const who of [id, op.targetNation]) {
    s.nations[who].strategicLog.unshift(record);
    s.nations[who].strategicLog = s.nations[who].strategicLog.slice(0, 30);
  }
  return record;
}
export function repairIndustry(s) {
  for (const [id, n] of Object.entries(s.nations)) {
    const d = n.industrialDamage;
    if (!d || campaignMinutes(s) - d.lastAttack < 1440) continue;
    const e = economyFor(s, id),
      gold = e.goldYear * 0.22,
      industry = e.industryYear * 0.14;
    for (const k of ["industry", "yards"]) {
      if (d[k] <= 0) continue;
      const restore = Math.max(
        0,
        Math.min(d[k], 0.0006, gold > 0 ? n.gold / gold : 0, industry > 0 ? n.industry / industry : 0),
      );
      d[k] -= restore;
      n.gold -= restore * gold;
      n.industry -= restore * industry;
      d.repairGold += restore * gold;
      d.repairIndustry += restore * industry;
    }
  }
}
