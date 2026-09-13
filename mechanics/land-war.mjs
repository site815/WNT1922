import { PROFILES } from "./catalog.mjs";
import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/land-war.md");
import { merchantEconomy } from "./merchant-economy.mjs";
import { campaignMinutes } from "./campaign-clock.mjs";
import { fleetPosition, fleetStats } from "./task-forces.mjs";
import { distanceNm, interpolate, PORTS, NODES, ISLANDS } from "./world.mjs";
import { portOwner, invalidatePorts } from "./ports.mjs";
import { applyTerritoryMorale } from './campaign-impact.mjs';
// These are strategic campaign corridors, not individual land units. Balance is deliberately tunable.
export const POWERS = Object.fromEntries(
  Object.entries(data.POWERS).map(([id, p]) => [
    id,
    { ...p, color: PROFILES[id]?.color || data.NEUTRAL_COLOR },
  ]),
);
const date = (x) => Date.parse(x + "T00:00:00Z") / 86400000;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const CAMPAIGNS = data.CAMPAIGNS;
const campaignById = new Map(CAMPAIGNS.map(f => [f.id, f]));
const territoryEvents = data.TERRITORY_EVENTS.map(e => ({...e, day:date(e.date)}));
export function initializeWorld(s) {
  s.world ??= {
    revision: 1,
    fronts: [],
    control: {},
    portControl: {},
    changes: [],
  };
}
export const navalInfluence = (f) =>
  f.seaWeight > 0.6 ? "High" : f.seaWeight > 0.2 ? "Medium" : "Low";
const pair = (a, b) => [a, b].sort().join("-");
export function navyFor(f, side) {
  return campaignById.get(f.id)?.[side + "Navy"] || f[side];
}
export function frontPosition(f) {
  return interpolate(f.from, f.to, clamp(f.progress, 0, 1));
}
export function supplyEffect(front, attackerSupply, defenderSupply) {
  const difference = clamp(attackerSupply - defenderSupply, -1, 1);
  const momentum = clamp((front.momentum || 0) + difference / 180, -16, 16);
  return { momentum, effect: front.seaWeight * (difference * 0.7 + momentum) };
}
// Landing forces and transports are abstracted into the land campaign. Naval
// cover must actually be nearby and at sea; submarines cannot escort a landing.
export function landingPower(forces, navy, point) {
  let power = 0;
  for (const r of forces) {
    if (
      r.id !== navy ||
      ["port", "refuel", "returning", "repair", "reinforcing"].includes(
        r.f.phase,
      ) ||
      ["repair", "reinforcement", "submarine"].includes(r.f.role) ||
      r.stats.submarines === r.stats.hulls
    )
      continue;
    const distance = distanceNm(r.position, point);
    if (distance > 220) continue;
    const surfaceHulls = r.stats.hulls - r.stats.submarines;
    if (surfaceHulls < 2) continue;
    power +=
      (r.stats.surface + r.stats.air * 12) *
      Math.max(0.2, 1 - distance / 280) *
      (r.f.mission === "raid" ? 0.25 : 1);
  }
  return power;
}
export function islandPressure(f, a, b, health = 1) {
  const held = f.lastOutcome === "Occupied",
    resistance = f.resistance * (0.35 + 0.65 * health);
  const attacking = held ? b : a,
    defending = held ? a : b,
    supply = held ? f.defenderSupply : f.attackerSupply;
  const advantage =
    (attacking - defending - resistance) /
    Math.max(1, attacking + defending + resistance);
  if (attacking > resistance && advantage > 0.15 && supply >= 0.4)
    return (held ? -1 : 1) * clamp(advantage * supply * 1.8, 0, 1);
  // Unsupported footholds slowly contract, without changing the current owner.
  if (attacking < resistance * 0.5 || supply < 0.25) return held ? 0.12 : -0.12;
  return 0;
}
export function updateFrontNotice(
  s,
  f,
  priorProgress,
  alert,
  { ceasefire = false } = {},
) {
  const now = campaignMinutes(s),
    contested = (x) => x > 0 && x < 1;
  if (
    !f.offensiveActive &&
    (contested(priorProgress) || (!ceasefire && contested(f.progress)))
  ) {
    f.offensiveActive = true;
    f.offensiveStartedAt = now;
    delete f.resolvedAt;
    alert(
      f.name + (f.island ? ": landings underway" : ": fighting underway"),
      "Naval cover and sustained supply are influencing this campaign. This notice remains until the assault is resolved.",
      { frontId: f.id, startedAt: now },
    );
  }
  if (f.offensiveActive && (ceasefire || !contested(f.progress))) {
    f.offensiveActive = false;
    f.resolvedAt = now;
    const outcome = ceasefire
      ? "ceasefire"
      : f.progress >= 1
        ? "attacking forces secure the campaign"
        : "defenders drive the attack back";
    alert(
      f.name + ": " + outcome,
      "The current offensive has ended. Further offensives can change control. This notice expires after 48 game hours.",
      { frontId: f.id, startedAt: f.offensiveStartedAt, resolvedAt: now },
    );
  }
}
export function dailyWorld(s, c, alert = () => {}) {
  initializeWorld(s);
  const w = s.world;
  const resolved = [];
  const forces = Object.entries(s.nations).flatMap(([id, n]) =>
    n.fleets
      .filter((f) => !["repair", "reinforcement", "support"].includes(f.role))
      .map((f) => ({
        id,
        f,
        position: fleetPosition(s, f),
        stats: fleetStats(s, c, id, f),
        mission: f.mission,
      })),
  );
  const economies = Object.fromEntries(
    Object.keys(s.nations).map((id) => [id, merchantEconomy(s, c, id)]),
  );
  const supply = (navy, enemy, point) => {
    const n = s.nations[navy];
    if (!n) return 0.7;
    let own = 0,
      opposing = 0;
    for (const r of forces) {
      const d = distanceNm(r.position, point);
      if (d > 900 || ["port", "refuel"].includes(r.f.phase)) continue;
      const power =
        (r.stats.surface + r.stats.air * 20 + r.stats.subAttack) *
        (1 - d / 1000);
      if (r.id === navy) own += power;
      if (r.id === enemy) opposing += power;
    }
    const command = own + opposing > 0 ? own / (own + opposing) : 0.5;
    const surviving = economies[navy].ports.coverage;
    const localPorts = Object.keys(PORTS).filter(
      (id) => portOwner(s, id) === navy && distanceNm(NODES[id], point) < 1200,
    );
    const portAccess = localPorts.length
      ? localPorts.reduce(
          (v, id) =>
            v +
            (s.ports?.[id]?.health ?? 1) * (1 - (s.ports?.[id]?.blockade || 0)),
          0,
        ) / localPorts.length
      : 1;
    return clamp(
      (economies[navy].convoys.success * 0.4 +
        (economies[navy].logistics / 100) * 0.15 +
        surviving * 0.2 +
        command * 0.25) *
        (0.45 + 0.55 * portAccess),
      0,
      1,
    );
  };
  for (const definition of CAMPAIGNS) {
    const relation =
      s.relations[pair(definition.attacker, definition.defender)];
    const offset =
      s.campaignId === "campaign_1922" &&
      !definition.independent &&
      !definition.pacific
        ? s.timeline?.offsetDays || 0
        : 0;
    const start = definition.pacific
      ? (relation?.warSince ?? s.day)
      : definition.trigger === "poland"
        ? Math.floor(s.timeline?.polandAt / 1440)
        : definition.start + offset;
    if (s.day < start) continue;
    if (
      !definition.independent &&
      !definition.pacific &&
      !s.timeline?.polandOccurred
    )
      continue;
    if (definition.pacific && !relation?.war) {
      const frozen = w.fronts.find((f) => f.id === definition.id);
      if (frozen) {
        if (frozen.status !== "Ceasefire")
          updateFrontNotice(s, frozen, frozen.progress, alert, {
            ceasefire: true,
          });
        frozen.status = "Ceasefire";
        frozen.pressure = 0;
      }
      continue;
    }
    if (definition.coalition && !s.relations[pair(...data.COALITION_WAR)]?.war) continue;
    if (definition.requires) {
      const required = w.fronts.find((f) => f.id === definition.requires);
      if (!required || required.progress > 0.3) continue;
    }
    let f = w.fronts.find((f) => f.id === definition.id);
    if (!f) {
      const early = definition.pacific
          ? 0
          : Math.max(0, Math.min(s.day, definition.counter || s.day) - start),
        late = definition.pacific
          ? 0
          : Math.max(0, s.day - (definition.counter || s.day));
      f = {
        ...definition,
        progress: clamp(
          (definition.initial ?? 0.02) +
            (early * definition.baseline +
              late * (definition.counterBaseline || 0)) /
              definition.days,
          0,
          1,
        ),
        momentum: 0,
        attackerSupply: 0.7,
        defenderSupply: 0.7,
        started: s.day,
        lastOutcome: definition.island ? "Repulsed" : null,
      };
      w.fronts.push(f);
    }
    f.seaWeight = definition.seaWeight;
    const a = navyFor(f, "attacker"),
      b = navyFor(f, "defender"),
      point = f.port ? NODES[f.port] : frontPosition(f);
    f.attackerSupply = supply(a, b, point);
    f.defenderSupply = supply(b, a, point);
    if (f.pacific) {
      f.attackerSupply *= s.nations[a]?.merchant.hulls ? (economies[a]?.logistics ?? 100) / 100 : 0;
      f.defenderSupply *= s.nations[b]?.merchant.hulls ? (economies[b]?.logistics ?? 100) / 100 : 0;
    }
    const effect = supplyEffect(f, f.attackerSupply, f.defenderSupply);
    f.momentum = effect.momentum;
    const baseline =
      s.day >= (f.counter || Infinity) ? f.counterBaseline : f.baseline;
    const coverA = landingPower(forces, a, point),
      coverB = landingPower(forces, b, point);
    f.pressure = f.island
      ? islandPressure(f, coverA, coverB, s.ports?.[f.port]?.health ?? 1)
      : baseline + effect.effect;
    if (f.pacific && !f.island) {
      if (f.pressure > 0 && (coverA < 50 || f.attackerSupply < 0.4))
        f.pressure = 0;
      if (f.pressure < 0 && (coverB < 50 || f.defenderSupply < 0.4))
        f.pressure = 0;
    }
    const priorProgress = f.progress;
    f.progress = clamp(f.progress + f.pressure / f.days, 0, 1);
    updateFrontNotice(s, f, priorProgress, alert);
    f.status =
      f.progress >= 1 ? "Occupied" : f.progress <= 0 ? "Repulsed" : "Contested";
    const outcome = f.status === "Contested" ? null : f.status;
    if (outcome && f.lastOutcome !== outcome) {
      f.lastOutcome = outcome;
      const title =
        f.name +
        ": " +
        (outcome === "Occupied"
          ? "attacking forces secure the campaign"
          : "defenders drive the attack back");
      const change = { day: s.day, front: f.id, title };
      w.changes.unshift(change);
      resolved.push({change,territories:f.territories.map(territory=>({territory,
        previous:w.control[territory] || data.ORIGINAL_CONTROL[territory] ||
          ISLANDS.find(island=>'island-'+island.node===territory)?.owner || f.defender}))});
      w.changes = w.changes.slice(0, 40);
      if (f.island && s.ports?.[f.port]) {
        s.ports[f.port].health = Math.max(0, s.ports[f.port].health - 0.15);
        s.ports[f.port].lastAttack = campaignMinutes(s);
      }
    }
    if (f.island && (f.progress === 0 || f.progress === 1))
      f.status =
        f.lastOutcome === "Occupied" ? "Occupied" : "Awaiting naval support";
  }
  // Territory owners change at completed campaigns. A counteroffensive can restore them.
  w.control = {};
  for (const event of territoryEvents)
    if (s.day >= event.day) w.control[event.territory] = event.owner;
  for (const f of w.fronts) {
    if (f.lastOutcome === "Occupied" || f.progress >= 1)
      for (const t of f.territories) w.control[t] = f.attacker;
    if (f.lastOutcome === "Repulsed" || f.progress <= 0)
      for (const t of f.territories)
        w.control[t] =
          campaignById.get(f.id)?.restoredOwner || data.ORIGINAL_CONTROL[t] || f.defender;
  }
  w.portControl = { ...w.stationControl };
  for (const [port, territory] of Object.entries(data.PORT_TERRITORIES))
    if (w.control[territory]) w.portControl[port] = w.control[territory];
  for (const island of ISLANDS)
    if (w.control["island-" + island.node])
      w.portControl[island.node] = w.control["island-" + island.node];
  for (const {change,territories} of resolved)
    change.moraleChanges = applyTerritoryMorale(s,territories.map(t=>({...t,owner:w.control[t.territory] || t.previous})));
  invalidatePorts(s);
}
// Clip a territory against the advancing front in geographic coordinates before projection.
export function occupiedGeometry(geometry, f) {
  const dx = f.to[0] - f.from[0],
    dy = f.to[1] - f.from[1],
    normal = [dx, dy],
    p = frontPosition(f);
  const rings =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const polygons = rings
    .map((poly) =>
      poly
        .map((ring) => {
          const out = [];
          for (let i = 0; i < ring.length; i++) {
            const a = ring[i],
              b = ring[(i + 1) % ring.length],
              da = (a[0] - p[0]) * normal[0] + (a[1] - p[1]) * normal[1],
              db = (b[0] - p[0]) * normal[0] + (b[1] - p[1]) * normal[1];
            if (da <= 0) out.push(a);
            if (da <= 0 !== db <= 0) {
              const t = da / (da - db);
              out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
            }
          }
          return out;
        })
        .filter((r) => r.length >= 3),
    )
    .filter((p) => p.length);
  return { type: "MultiPolygon", coordinates: polygons };
}
