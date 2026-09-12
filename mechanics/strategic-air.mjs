import { queueAirStrike } from "./air-operations.mjs";
import { campaignMinutes, periodicTick } from "./campaign-clock.mjs";
import { PORTS, NODES, distanceNm } from "./world.mjs";
import { portSpec } from "./port-catalog.mjs";
import { aviationAccess, aviationOwner } from "./base-aviation.mjs";
import { airConditions } from "./air-conditions.mjs";
import { economyFor } from "./balance.mjs";
import { readDocument } from '../worker/documents.mjs';
const rules = (await readDocument('common/rules/air-warfare.md')).strategic;
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
  if (!periodicTick(now, rules.planningMinutes, rules.planningOffsetMinutes)) return;
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
        (w) => w.role === "bomber" && w.crewed >= rules.minimumBombersToConsider,
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
        if (ready >= rules.minimumBombersToConsider)
          candidates.push({
            base,
            port,
            enemy,
            score:
              (ready * (spec.dock ? rules.dockPriority : 1) * (1 + spec.trade / rules.tradePriorityScale)) /
              (1 + distance / rules.distancePriorityKm),
          });
      }
    }
    for (const target of candidates.sort((a, b) => b.score - a.score)) {
      const kind = portSpec(s, target.port).dock
        ? Math.floor(s.day / rules.cycleDays) % 2
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
        n.nextStrategicAt = now + rules.cycleDays * 1440;
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
        (v, w) => v + w.crewed * (models.get(w.model)?.bomb_load_kg || rules.fallbackPayloadKg),
        0,
      ),
    delivery = Math.min(1, attack / Math.max(1, op.strikes * rules.attackPowerPerBomber));
  const category = op.industrialTarget || "port";
  let amount = 0;
  if (category !== "port") {
    const economy = economyFor(s, op.targetNation),
      scale = Math.max(
        rules.minimumEconomyScale,
        category === "yards"
          ? economy.yardYear / rules.yardScale
          : economy.industryYear / rules.industryScale,
      );
    amount =
      Math.min(rules.maximumDamagePerStrike, (payload / (rules.payloadScaleKg * scale)) * delivery) *
      (1 - d[category]);
    amount = Math.max(0, Math.min((category === "industry" ? 1 : rules.yardDamageLimit) - d[category], amount));
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
    if (!d || campaignMinutes(s) - d.lastAttack < rules.repairQuietMinutes) continue;
    const e = economyFor(s, id),
      gold = e.goldYear * rules.repairGoldAnnualShare,
      industry = e.industryYear * rules.repairIndustryAnnualShare;
    for (const k of ["industry", "yards"]) {
      if (d[k] <= 0) continue;
      const restore = Math.max(
        0,
        Math.min(d[k], rules.repairDailyFraction, gold > 0 ? n.gold / gold : 0, industry > 0 ? n.industry / industry : 0),
      );
      d[k] -= restore;
      n.gold -= restore * gold;
      n.industry -= restore * industry;
      d.repairGold += restore * gold;
      d.repairIndustry += restore * industry;
    }
  }
}
