import { beginEngagement, progressEngagements } from "./engagements.mjs";
import { armedClass, fireTorpedoes } from "./torpedo-ammunition.mjs";
import { MORALE, changeMorale, dailyMoraleRecovery, navalWarScore } from './campaign-impact.mjs';
import { strategicFactor, strategicDemand, shipMaterialCost } from "./strategic-materials.mjs";
import { HISTORICAL_WARS, EUROPE_OPENING } from "./war-politics.mjs";
import { scriptedDecisions } from "./events.mjs";
import { applyCommand } from "./game-actions.mjs";
import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/engine.md");
const OPENING_PORT_REGIONS = data.OPENING_PORT_REGIONS;
export const REVIEW_YEARS = data.REVIEW_YEARS;
import { allocateShipNames } from "./ship-naming.mjs";
import {
  automaticAircraftDraft,
  commissionAircraft,
} from "./aircraft-designer.mjs";
import { pacificOpening } from "./pacific-opening.mjs";
import {
  initializeStrategicAir,
  strategicAirPlanning,
  strategicDamage,
  repairIndustry,
} from "./strategic-air.mjs";
import {
  treatyAssessment,
  TREATY_POLICIES,
  TREATY_SWITCH_GOLD,
  INITIAL_TREATY_EXPIRY,
  concealing,
} from "./treaty-policy.mjs";
import {
  minuteAirOperations,
  combatAirPatrol,
  loseCAP,
  addAirLoss,
} from "./air-operations.mjs";
import { airConditions } from "./air-conditions.mjs";
import { initializeGovernmentAviation } from "./government-aviation.mjs";
import { initializeEconomy, closeEconomicMonth } from "./economic-growth.mjs";
import { recordGold } from './gold-accounting.mjs';
import {
  initializeDiplomacy,
  commenceWar,
  politicsTick,
  dispatchPopup,
} from "./war-politics.mjs";
import { startProvocation, opposingProvocations } from "./provocation.mjs";
import { coastalRecon } from "./shore-recon.mjs";
import {
  initializeBaseAviation,
  baseAirPower,
  flyBaseSorties,
  releaseShipAircraft,
} from "./base-aviation.mjs";
import { dailyAviation, minuteAviation } from "./aviation-transfer.mjs";
import {
  aiNeeds,
  aiFunding,
  aiCanSpend,
  aiHullScore,
  aiResearchScores,
  aiDoctrine,
} from "./ai-planning.mjs";
import { recordFrontAlert, trimAlerts, DECISION_DEFAULT_DAYS, decisionIsChoice, activeDispatch } from "./alert-lifecycle.mjs";
import { updatePortBlockades, yardAvailability } from "./port-trade.mjs";
import { completeScrapping } from "./ship-retirement.mjs";
import { resultComposition } from "./composition.mjs";
import {
  initializePorts,
  repairPorts,
  portSummary,
  damagePort,
  portOwner,
} from "./ports.mjs";
import { minutePortOperations, anchoredShips } from "./port-operations.mjs";
import { NODES, PORTS, AREAS } from "./world.mjs";
import {
  staffSailors,
  sailorSummary,
  crewEffectiveness,
} from "./ship-staffing.mjs";
import {
  upgradeLevel,
  facilityFactor, industryFactor,
  radarLevel,
  LEVEL_YEARS,
} from "./levels.mjs";
import { aircraftQuality, aircraftProtection } from "./aircraft-quality.mjs";
import {
  PROFILES,
  PRIORITIES,
  REGIONS,
  fleetService,
  submarineAttack,
} from "./catalog.mjs";
import { economyFor, PROGRAMS, RULES } from "./balance.mjs";
import {
  TICK_MINUTES,
  campaignMinutes,
  canonicalMinute,
  setCampaignMinutes,
  openingTimeline,
} from "./campaign-clock.mjs";
import {
  initializeOperations,
  applyStandingOrders,
  commissionToFleet,
  dailyOperations,
  minuteOperations,
  availableGroup,
  sinkMerchants,
  invalidateOperations,
  orderFleet,
  detachRepairs,
  setRoute,
  usablePorts,
  fleetStats,
  fleetPosition,
  MISSIONS,
} from "./task-forces.mjs";
import {
  initializeResources,
  dailyResources,
  facilityBudget,
  productionBlock,
  airPower,
  loseAircraft,
  allocateAircraft,
  staffAircraft,
  operationalAircraftModels,
  aircraftModels,
  planeRole,
} from "./naval-resources.mjs";
import { supplyDetails } from "./logistics.mjs";
import { contentFor, DEFAULT_CAMPAIGN } from "./campaign-content.mjs";
import { recordCasualties } from "./recovery.mjs";
import {
  automaticDraft,
  commissionDraft,
  evaluateDesign,
} from "./designer.mjs";
import {
  historical1922Decisions,
  apply1922Decision,
  retireReplacedTreatyHulls,
} from "./vanilla.mjs";
import { HOME_PORT, distanceNm } from "./world.mjs";
import { initializeWorld, dailyWorld } from "./land-war.mjs";
import { SAVE_VERSION } from "./version.mjs";
import { merchantEconomy } from "./merchant-economy.mjs";
import { recordWarBattle, recordWarRaid } from "./war-balance.mjs";
import {
  DIPLOMACY,
  diplomaticBlock,
  diplomaticTerms,
  readyProvocationFleet,
} from "./diplomacy-rules.mjs";
import { organizeSupport } from "./support-operations.mjs";
export const VERSION = SAVE_VERSION;
export const DAY = data.DAY;
export const BASE_SPEED = data.BASE_SPEED;
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const dateText = (day) =>
  new Date(day * DAY).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
export function openingGroups(content, id) {
  const data = content.nations[id];
  const rows = [
    ...data.hulls.map((h) => ({
      ...h,
      id: `h-${h.id}`,
      count: 1,
      progress: (h.pct_complete || 0) / 100,
    })),
    ...data.aggregates,
    ...(data.support || []),
  ];
  return rows.map((row) => {
    const c = content.classes[row.class_id];
    let progress = row.progress ?? 0.35;
    if (
      content.scenario.id !== "campaign_1922" &&
      row.status === "building" &&
      progress === 0
    )
      progress = 0.35;
    return {
      id: row.id,
      name: row.name || c.name,
      shipNames: row.shipNames || null,
      classId: c.id,
      count: row.count,
      status: row.status || "active",
      health: row.health ?? 1,
      progress,
      region: OPENING_PORT_REGIONS[row.port] || PROFILES[id].home,
      days: buildDays(c),
      paid: { gold: 0, influence: 0, industry: 0 },
      service: fleetService(c),
      ...(fleetService(c) === "merchant"
        ? {
            merchantGRT:
              (data.merchants.grossRegisterTons ||
                data.merchants.hulls * 1000) / data.merchants.hulls,
          }
        : {}),
      legacy: !!row.legacy,
      representative: !!row.representative,
      notes: row.notes || "",
      rosterAdded: row.rosterAdded || 1,
      treatyFate: row.treaty_fate || null,
      ...(row.port ? { dockPort: row.port } : {}),
    };
  });
}
export function newGame(
  content,
  player = "JPN",
  seed = 19360101,
  campaignId = content.scenario.id || DEFAULT_CAMPAIGN,
) {
  content = contentFor(content, campaignId);
  if (!content.nations[player]) throw new Error("Choose an available navy.");
  const state = {
    version: VERSION,
    player,
    controllers: Object.fromEntries(
      Object.keys(content.nations).map((id) => [
        id,
        id === player ? "human" : "ai",
      ]),
    ),
    campaignId,
    day: Date.parse(content.scenario.start + "T00:00:00Z") / DAY,
    fraction: 0,
    seed: seed >>> 0,
    speed: 1,
    paused: true,
    nations: {},
    log: [],
    reports: [],
    decisions: [],
    completedEvents: [],
    nextId: 1,
    view: "command",
    savedAt: null,
    relations: {},
    history: [],
    reviews: [],
    treatyUntil: Date.parse(INITIAL_TREATY_EXPIRY + "T00:00:00Z") / DAY,
    autoPause: true,
    musicEnabled: true,
    musicVolume: 0.28,
  };
  state.rosterRevision = content.rosterRevision;
  state.specificationRevision = content.specificationRevision || 1;
  for (const [id, data] of Object.entries(content.nations)) {
    const groups = openingGroups(content, id);
    const e = economyFor(state, id);
    state.nations[id] = {
      id,
      groups,
      priority: "guard",
      focus: PROFILES[id].home,
      rival: PROFILES[id].rival,
      gold: data.starting.gold,
      influence: data.starting.influence,
      industry: data.starting.industry,
      training: data.starting.training,
      morale: data.starting.morale,
      gdp: data.economy.gdp,
      gtp: data.economy.gtp,
      strategic: data.starting.strategic,
      crew: e.crew,
      crewYear: e.crewYear,
      projects: [],
      tech: Object.fromEntries(
        Object.keys(PROGRAMS).map((key) => [key, data.starting.level]),
      ),
      customDesigns: [],
      bases: [...data.starting.bases],
      treatyPolicy: "disclose",
      exposure: 0,
      cooldowns: {},
      sunkTons: 0,
      lostTons: 0,
      battlesWon: 0,
      battlesLost: 0,
      delivered: 0,
      merchantDelivered: 0,
      supportDelivered: 0,
      merchant: {
        hulls: data.merchants.hulls,
        averageGRT:
          (data.merchants.grossRegisterTons || data.merchants.hulls * 1000) /
          data.merchants.hulls,
        baseDay: state.day,
      },
    };
  }
  const ids = Object.keys(state.nations);
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i],
        b = ids[j],
        rival = PROFILES[a].rival === b || PROFILES[b].rival === a;
      state.relations[pairKey(a, b)] = {
        a,
        b,
        war: false,
        allied: false,
        warSince: null,
        truceUntil: state.day - 1,
        lastBattle: -99999,
      };
    }

  initializeDiplomacy(state);
  initializeCampaign(state, content);
  // The alternate programs open with their existing concealment arrangements.
  // This is an opening policy, not a charged policy change.
  if (campaignId === "in_good_faith_1936")
    for (const id of ids) {
      const options = Object.keys(TREATY_POLICIES)
        .map((policy) => treatyAssessment(state, content, id, policy))
        .sort(
          (a, b) => a.gold + a.influence * 400 - b.gold - b.influence * 400,
        );
      state.nations[id].treatyPolicy = options[0].policy;
      for (const g of state.nations[id].groups)
        g.covert = concealing(state.nations[id]);
    }
  initializeEconomy(state, content);
  for (const id of ids) state.nations[id].strategicDailyDemand = strategicDemand(state, content, id).daily;
  state.initial = Object.fromEntries(
    ids.map((id) => [
      id,
      {
        power: fleetPower(state, content, id).total,
        tons: fleetSummary(state, content, id).tons,
      },
    ]),
  );
  addLog(
    state,
    "The " +
      yearOf(state) +
      " naval estimates are open. Orders take time; prepare your fleet and economy.",
    "cabinet",
  );
  scriptedDecisions(state, content, { opening: true });
  return state;
}
export function initializeCampaign(s, content) {
  s.campaignId ??= DEFAULT_CAMPAIGN;
  initializeResources(s, content);
  for (const n of Object.values(s.nations)) {
    n.customDesigns ??= [];
    for (const p of [...n.projects])
      if (p.key === "base") {
        const unspent = p.remaining / p.days;
        for (const k of ["gold", "influence", "industry", "strategic"])
          n[k] += (p.paid[k] || 0) * unspent;
        n.projects.splice(n.projects.indexOf(p), 1);
      }
  }
  initializeWorld(s);
  initializePorts(s);
  initializeOperations(s, content);
  initializeBaseAviation(s, content);
  initializeGovernmentAviation(s, content);
  initializeStrategicAir(s);
  for (const id of Object.keys(s.nations)) {
    staffSailors(s, content, id);
    allocateAircraft(s, content, id);
  }
  organizeSupport(s, content);
  if (!s.timeline) {
    s.timeline = openingTimeline(s.seed, s.campaignId);
    if (s.relations[pairKey("GBR", "DEU")].war) {
      s.timeline.polandOccurred = true;
      s.timeline.europeOccurred = true;
    }
  }
  normalizeDecisions(s);
  return s;
}
export function issueFleetOrder(
  s,
  content,
  fleetId,
  mission,
  aggressiveBattle = false,
  actor = s.player,
) {
  const f = orderFleet(s, content, fleetId, mission, null, actor, {
    aggressiveBattle: aggressiveBattle === true,
  });
  invalidateOperations(s);
  if (actor === s.player)
    addLog(
      s,
      `${f.name}: ${MISSIONS[mission].name}. Orders transmitted; the admiral is selecting a route within the force's endurance. Aggressive battle ${f.aggressiveBattle ? "authorized: accept greater risk and press attacks longer" : "off: preserve the force when outmatched"}.`,
    );
}
export function inventorySummary(state, content, id, service) {
  const result = {
    active: 0,
    reserve: 0,
    building: 0,
    tons: 0,
    crew: 0,
    repair: 0,
    total: 0,
    legacy: 0,
    unknownTonnage: 0,
  };
  for (const g of state.nations[id].groups) {
    const c = content.classes[g.classId];
    if (fleetService(c) !== service || ["sunk", "scrapped"].includes(g.status))
      continue;
    if (["building", "trials", "converting"].includes(g.status)) {
      result.building += g.count;
      continue;
    }
    result.total += g.count;
    result[
      g.status === "reserve"
        ? "reserve"
        : ["repair", "returning"].includes(g.status)
          ? "repair"
          : "active"
    ] += g.count;
    result.tons += c.tons * g.count;
    result.crew += c.crew * g.count * (g.status === "reserve" ? 0.15 : 1);
    if (g.legacy) result.legacy += g.count;
    if (c.unknownSpecs) result.unknownTonnage += g.count;
  }
  return result;
}
export const fleetSummary = (s, c, id = s.player) =>
  inventorySummary(s, c, id, "warship");
export const supportSummary = (s, c, id = s.player) =>
  inventorySummary(s, c, id, "support");
export function merchantSummary(s, c, id = s.player) {
  const m = merchantEconomy(s, c, id);
  return {
    total: m.hulls,
    tons: m.current,
    average: m.average,
    reference: c.nations[id].merchants,
  };
}

export const pairKey = (a, b) => [a, b].sort().join("-");
export const yearOf = (s) => new Date(s.day * DAY).getUTCFullYear();
export const isAuxiliary = (c) => fleetService(c) !== "warship";
export function rng(s) {
  s.seed = (s.seed + 0x6d2b79f5) >>> 0;
  let t = s.seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export function buildDays(c) {
  return c.buildDays || RULES.buildDays[c.type] || RULES.buildDays.default;
}
export function addLog(s, text, kind = "navy", extra = {}) {
  s.log.unshift({
    id: s.nextId++,
    day: s.day,
    minute: campaignMinutes(s),
    text,
    kind,
    ...extra,
  });
  s.log = s.log.slice(0, 140);
}
export function addAlert(s, title, body, kind = "info", extra = {}) {
  s.alerts ??= [];
  s.alerts.unshift({
    id: s.nextId++,
    minute: campaignMinutes(s),
    title,
    body,
    kind,
    ...extra,
  });
  trimAlerts(s);
}
export const decisionQueue = (s, id = s.player) =>
  id === s.player ? s.decisions : (s.nations[id].decisions ??= []);
export const decisionHistory = (s, id = s.player) =>
  id === s.player
    ? s.completedEvents
    : (s.nations[id].completedDecisions ??= []);
export function queueDecision(s, key, title, body, options, meta = {}) {
  const actor = meta.actor || s.player,
    queue = decisionQueue(s, actor),
    completed = decisionHistory(s, actor);
  if (completed.includes(key) || queue.some((d) => d.key === key)) return;
  const d = { key, title, body, options, day: s.day, ...meta };
  if (!decisionIsChoice(d) && d.kind !== 'war') {
    completed.push(key);
    if (actor === s.player) addAlert(s, title, body, d.kind || 'info');
    return;
  }
  d.critical = true;
  d.deferred = actor === s.player && !s.autoPause;
  d.deadline ??= campaignMinutes(s) + DECISION_DEFAULT_DAYS * 1440;
  d.defaultOption ??= options.at(-1).id;
  d.defaultText ??= options.find((o) => o.id === d.defaultOption).detail;
  if (actor === s.player) { d.popup = true; d.forcePause = true; }
  queue.push(d);
  if (actor === s.player && s.autoPause && (d.critical || d.popup)) {
    if (!s.paused) s.resumeAfterDecision = true;
    s.paused = true;
    s.pauseReason ??= d.key;
  }
}
function validDecision(s, d) {
  const actor = d.actor || s.player;
  if (d.kind !== "inspection") return true;
  return (
    !(s.campaignId === "campaign_1922" && [actor, d.target].includes("SOV")) &&
    s.day <= s.treatyUntil &&
    d.target &&
    !s.relations[pairKey(actor, d.target)].war
  );
}
function normalizeDecisions(s) {
  s.alerts ??= [];
  for (const d of [...s.decisions]) {
    if (!validDecision(s, d)) {
      s.decisions = s.decisions.filter((x) => x !== d);
      s.completedEvents.push(d.key);
    }
  }
  if (s.pauseReason && !s.decisions.some((d) => d.key === s.pauseReason && activeDispatch(d))) {
    const pending = s.decisions.find(activeDispatch);
    if (pending) s.pauseReason = pending.key;
    else {
      if (s.resumeAfterDecision) s.paused = false;
      delete s.pauseReason;
      delete s.resumeAfterDecision;
    }
  }
}
export function deferDecision(s, c, key) {
  const d = s.decisions.find(d => d.key === key);
  if (!d) throw Error('That dispatch is no longer pending.');
  if (!decisionIsChoice(d)) return chooseDecision(s, c, key, d.defaultOption);
  d.deferred = true;
  normalizeDecisions(s);
}
export function reopenDecision(s, key) {
  const d = s.decisions.find(d => d.key === key);
  if (!d) throw Error('That decision is no longer pending.');
  d.deferred = false;
  if (s.autoPause) {
    if (!s.paused) s.resumeAfterDecision = true;
    s.paused = true;
    s.pauseReason = key;
  }
}
function decisionDeadlines(s, c) {
  normalizeDecisions(s);
  for (const d of [...s.decisions])
    if (d.deadline !== undefined && campaignMinutes(s) >= d.deadline) {
      chooseDecision(s, c, d.key, d.defaultOption, { automatic: true });
    }
}
export function readiness(s, c, id) {
  const people = sailorSummary(s, c, id);
  return Math.min(1, people.total / Math.max(1, people.required));
}
export function supply(s, c, id, region) {
  const fleets = s.nations[id].fleets.filter(
    (f) =>
      !region ||
      s.nations[id].groups.some(
        (g) =>
          g.fleetId === f.id && g.region === region && availableGroup(s, g),
      ),
  );
  if (!fleets.length) return 0;
  return (
    fleets.reduce((v, f) => v + supplyDetails(s, c, id, f).factor, 0) /
    fleets.length
  );
}

export function classPower(c, tech = {}, includeSupport = false) {
  if (isAuxiliary(c) && !(includeSupport && fleetService(c) === "support"))
    return { surface: 0, air: 0, sub: 0, asw: 0, aa: 0, scout: 0, total: 0 };
  const underwater = ["SS", "SM"].includes(c.type);
  const armor = 1 + c.belt / 800 + c.deck / 1000;
  const mobility = 0.7 + c.speed / 70;
  const surface = underwater
    ? 0
    : (c.raw?.features?.includes("director") ? 1.05 : 1) *
      (c.barrels * Math.pow(c.caliber / 100, 1.75) * 4 + c.tubes * 3) *
      armor *
      mobility *
      (1 + (upgradeLevel(tech, "gunnery") || 0) * 0.03);
  const air = c.air * 9 * (1 + (upgradeLevel(tech, "aviation") || 0) * 0.04);
  const sub = submarineAttack(c);
  const asw =
    !underwater && ["DD", "DE", "DL", "CL", "CA", "TB"].includes(c.type)
      ? (c.sonar ? 32 : 8) * (1 + (upgradeLevel(tech, "asw") || 0) * 0.1)
      : 0;
  const scout =
    (c.radar ? 25 : 5) +
    (c.air ? Math.min(c.air, 8) * 3 : 0) +
    (c.scoutAircraft || 0) * 4 +
    (radarLevel(tech) || 0) * 8;
  const aa = c.aa * 4 * (1 + (radarLevel(tech) || 0) * 0.2);
  return {
    surface,
    air,
    sub,
    asw,
    aa,
    scout,
    total: surface + air + sub + asw + aa * 0.2,
  };
}

export function fleetPower(
  s,
  content,
  id = s.player,
  region = null,
  fleetId = null,
  airDistanceKm = 0,
  torpedoTargets = true,
) {
  const n = s.nations[id],
    result = {
      surface: 0,
      air: 0,
      sub: 0,
      asw: 0,
      aa: 0,
      scout: 0,
      total: 0,
      ships: 0,
      speed: 0,
      supply: 0,
    };
  const training = 0.5 + (n.training / 100) * 0.65,
    morale = 0.65 + (n.morale / 100) * 0.5;
  let sumSupply = 0;
  const supplies = new Map(
    n.fleets
      .filter((f) => !fleetId || f.id === fleetId)
      .map((f) => [f.id, supplyDetails(s, content, id, f).factor]),
  );
  for (const g of n.groups) {
    if (
      !availableGroup(s, g) ||
      (fleetId ? g.fleetId !== fleetId : region && g.region !== region) ||
      (isAuxiliary(content.classes[g.classId]) &&
        !(fleetId && g.service === "support"))
    )
      continue;
    const c = content.classes[g.classId],
      p = classPower(armedClass(g, c, torpedoTargets), n.tech, !!fleetId),
      a = airPower(s, content, id, g, airDistanceKm),
      logistics =
        supplies.get(g.fleetId) ?? supplyDetails(s, content, id).factor;
    // Air wings already contain the group's total aircraft. Convert to per-hull
    // terms before the shared count multiplier to keep grouped and split fleets equal.
    p.air =
      ((a.strike * 12 + a.fighters * 3) / g.count) *
      (1 + upgradeLevel(n.tech, "aviation") * 0.04) * strategicFactor(n);
    p.scout =
      (c.radar ? 25 : 5) + a.scout / g.count * strategicFactor(n) + (radarLevel(n.tech) || 0) * 8;
    p.aa += (a.fighters * 2) / g.count * strategicFactor(n);
    const crew = crewEffectiveness(g, c);
    p.surface *= crew;
    p.sub *= crew;
    p.asw *= crew;
    p.aa *= crew;
    p.air *= 0.5 + 0.5 * crew;
    const factor =
      g.count *
      g.health *
      training *
      morale *
      logistics *
      (1 + radarLevel(n.tech) * 0.08);
    for (const key of ["surface", "air", "sub", "asw", "aa", "scout"])
      result[key] += p[key] * factor;
    result.ships += g.count;
    result.speed += c.speed * g.count * strategicFactor(n);
    sumSupply += logistics * g.count;
  }
  result.total =
    result.surface + result.air + result.sub + result.asw + result.aa * 0.2;
  result.speed /= Math.max(1, result.ships);
  result.supply = sumSupply / Math.max(1, result.ships);
  return result;
}

function expendFleetTorpedoes(s, c, id, region, fleetId) {
  for (const g of s.nations[id].groups)
    if (availableGroup(s, g) && g.sailors > 0 &&
        (fleetId ? g.fleetId === fleetId : !region || g.region === region))
      fireTorpedoes(g, c.classes[g.classId]);
}

export function monthlyIncome(s, content, id = s.player) {
  const n = s.nations[id],
    e = economyFor(s, id);
  const upkeep = n.groups.reduce(
    (sum, g) =>
      sum +
      (fleetService(content.classes[g.classId]) === "merchant" ||
      ["sunk", "scrapped", "building", "converting", "trials"].includes(
        g.status,
      )
        ? 0
        : content.classes[g.classId].cost *
          g.count *
          RULES.upkeepPerMonth *
          (g.status === "reserve" ? 0.2 : 1)),
    0,
  );
  const treaty = treatyAssessment(s, content, id),
    facilities = facilityBudget(s, content, id);
  const output = e.industryYear / 12 * industryFactor(s, n.id)
    * n.industryFunding * (n.industryOperating ?? 1) * strategicFactor(n);
  const gold = e.goldYear / 12 - upkeep - treaty.gold;
  const strategicOperations = strategicDemand(s, content, id).monthly;
  return { gold, influence: RULES.influencePerMonth + upgradeLevel(n.tech, "influence") - treaty.influence,
    industry: output, netGold: gold - facilities.gold / 12, netIndustry: output - facilities.industry / 12,
    strategic: e.strategicYear / 12, strategicOperations,
    netStrategic: e.strategicYear / 12 - strategicOperations * strategicFactor(n) - facilities.strategic / 12,
    treaty, facilities, products: e, industryOperating: facilities.rows[0].gold / 12, upkeep };
}
export function affordability(n, price) {
  return ["gold", "influence", "industry", "strategic"]
    .filter((k) => n[k] + 0.0001 < price[k])
    .map(
      (k) =>
        `Need ${Math.ceil(price[k] - n[k]).toLocaleString("en-US")} more ${k}`,
    )
    .join("; ");
}
function spend(n, p, { production = true } = {}) {
  const error = affordability(n, p);
  if (error) throw new Error(error);
  for (const k of ["gold", "influence", "industry", "strategic"])
    n[k] = Math.max(0, n[k] - (p[k] || 0));
  if (production) n.strategicSpent.production += p.strategic || 0;
}
export function shipPrice(s, content, classId, count = 1, id = s.player) {
  const c = content.classes[classId],
    n = s.nations[id];
  if (!c || c.nation !== id)
    throw new Error("This design is not in your catalog.");
  const discount = 1 - upgradeLevel(n.tech, "standardization") * 0.05;
  const industrialFactor =
    content.nations[id].procurement[
      c.custom ? "customIndustryFactor" : "industryFactor"
    ];
  return {
    gold: Math.ceil(c.cost * discount * count),
    influence: Math.ceil(Math.max(1, c.cost / 5000) * count),
    industry: Math.ceil(c.tons * industrialFactor * discount * count),
    strategic: Math.ceil(shipMaterialCost(c, count)),
    days: buildDays(c),
  };
}
export const treatyLedger = treatyAssessment;
export function shipOrderBlock(s, content, classId, id = s.player) {
  if (!content.nations[id].designs.includes(classId))
    return "Only designs in your active national catalog can be ordered.";
  const blocked = productionBlock(s, content, classId, id);
  if (blocked) return blocked;
  return "";
}
export function orderShip(s, content, classId, count = 1, id = s.player) {
  if (!Number.isInteger(count) || count < 1 || count > 20)
    throw new Error("Order between 1 and 20 hulls at a time.");
  const error = shipOrderBlock(s, content, classId, id);
  if (error) throw new Error(error);
  const n = s.nations[id],
    c = content.classes[classId],
    price = shipPrice(s, content, classId, count, id);
  spend(n, price);
  const group = {
    id: `order-${s.nextId++}`,
    name: c.name,
    shipNames: allocateShipNames(s, content, id, classId, count),
    classId,
    count,
    service: fleetService(c),
    ...(fleetService(c) === "merchant"
      ? {
          merchantGRT:
            c.raw?.merchant_grt || c.merchantGRT || Math.round(c.tons * 0.7),
        }
      : {}),
    status: "building",
    airWing: [],
    health: 1,
    progress: 0,
    region: PROFILES[id].home,
    days: price.days,
    paid: price,
    covert: concealing(n) && s.day <= s.treatyUntil,
  };
  group.sailors = 0;
  group.atSea = false;
  if (count === 1) group.name = group.shipNames[0];
  n.groups.push(group);
  if (id === s.player)
    addLog(
      s,
      `${count} × ${c.name} ordered. Yard capacity and the build schedule now determine delivery.`,
      "industry",
    );
  return group.id;
}
export function projectPrice(s, key, id = s.player) {
  const p = PROGRAMS[key],
    n = s.nations[id];
  if (!p) throw new Error("Unknown program.");
  const level = p.level ? n.tech[p.level] : 1,
    upgrades = level - 1;
  const targetYear =
    p.kind === "Technology" ? LEVEL_YEARS[Math.min(8, level)] : 1922;
  const ahead = Math.max(0, targetYear - yearOf(s));
  const multiplier = Math.pow(1.32, upgrades);
  return {
    gold: Math.ceil(p.gold * multiplier),
    influence: Math.ceil(p.influence * (1 + upgrades * 0.12)),
    industry: Math.ceil(p.industry * multiplier),
    days: p.days,
    ahead,
    targetYear,
    level,
  };
}
export function projectBlock(s, key, id = s.player) {
  const n = s.nations[id],
    p = PROGRAMS[key];
  if (!p) return "Unknown program.";
  if (n.projects.some((q) => q.key === key)) return "Already in progress.";
  if (p.level && n.tech[p.level] >= p.max) return "Level 9: fully developed.";
  const price = projectPrice(s, key, id);
  if (price.targetYear > yearOf(s))
    return "Development opens in " + price.targetYear + ".";
  if (n.projects.length >= 4) return "Four programs are already underway.";
  return "";
}
export function startProject(s, key, id = s.player) {
  const error = projectBlock(s, key, id);
  if (error) throw new Error(error);
  const n = s.nations[id],
    p = PROGRAMS[key],
    price = projectPrice(s, key, id);
  spend(n, price);
  n.projects.push({
    id: `project-${s.nextId++}`,
    key,
    name: p.name,
    days: price.days,
    remaining: price.days,
    paid: price,
  });
  if (id === s.player)
    addLog(
      s,
      `${p.name} funded; completion in about ${Math.ceil(price.days / 30)} months.`,
      "industry",
    );
}
export function cancelOrder(s, id, actor = s.player) {
  const n = s.nations[actor],
    g = n.groups.find((g) => g.id === id);
  if (!g || !["building", "trials", "converting"].includes(g.status))
    throw new Error("This construction order cannot be cancelled.");
  const refund = 0.5 * (1 - g.progress);
  n.gold += (g.paid?.gold || 0) * refund;
  n.industry += (g.paid?.industry || 0) * refund;
  g.status = "scrapped";
  if (actor === s.player)
    addLog(
      s,
      `${g.name} construction cancelled. Half of the unspent gold and industry was recovered.`,
      "industry",
    );
}
export function reserveGroup(s, id, content = null, actor = s.player) {
  invalidateOperations(s);
  const n = s.nations[actor],
    g = n.groups.find((g) => g.id === id);
  if (!g || !["active", "reserve"].includes(g.status))
    throw new Error("Only operational or reserve hulls can change readiness.");
  if (g.battleId) throw Error("This ship must disengage before changing readiness.");
  if (g.status === "active") {
    const force = n.fleets.find((f) => f.id === g.fleetId);
    if (g.atSea && force) {
      if (!content)
        throw new Error(
          "The ship must return to port before entering reserve.",
        );
      g.reserveOnArrival = true;
      g.status = "returning";
      detachRepairs(s, content, actor, force.id, fleetPosition(s, force));
      const transfer = n.fleets.find((f) => f.id === g.fleetId);
      transfer.reserveTransfer = true;
      transfer.name = "Reserve transfer " + s.nextId;
      if (actor === s.player)
        addLog(
          s,
          g.name +
            " ordered home for reserve. Its transfer remains on the chart and can be intercepted.",
        );
      return;
    }
    g.dockPort = force?.port || HOME_PORT[actor];
    releaseShipAircraft(s, content, n, g);
    delete g.fleetId;
    g.airWing = [];
    g.status = "reserve";
    g.atSea = false;
    g.sailors = 0;
    if (actor === s.player)
      addLog(
        s,
        `${g.name} placed in reserve. Crew demand and maintenance fall.`,
      );
  } else {
    spend(n, {
      gold: Math.ceil(g.count * 60),
      influence: 2,
      industry: g.count * 15,
    });
    g.status = "repair";
    g.health = Math.min(g.health, 0.8);
    if (actor === s.player)
      addLog(
        s,
        `${g.name} is recommissioning. Yard work must finish before deployment.`,
      );
  }
}
export function scrapGroup(s, content, id, actor = s.player) {
  const n = s.nations[actor],
    g = n.groups.find((g) => g.id === id);
  if (!g || !["active", "reserve", "repair", "returning"].includes(g.status))
    throw new Error("Choose an existing hull to scrap.");
  if (g.battleId) throw Error("This ship must disengage before returning for scrapping.");
  if (g.scrapOnArrival)
    throw new Error("This ship is already ordered home for scrapping.");
  const force = n.fleets.find((f) => f.id === g.fleetId);
  if (g.atSea && force) {
    g.scrapOnArrival = true;
    delete g.reserveOnArrival;
    g.status = "returning";
    detachRepairs(s, content, actor, force.id, fleetPosition(s, force));
    if (actor === s.player)
      addLog(
        s,
        g.name +
          " ordered home for scrapping. Salvage is received only after arrival; the returning force can be intercepted.",
        "industry",
      );
    return 0;
  }
  const salvage = completeScrapping(s, content, n, g);
  allocateAircraft(s, content, actor);
  invalidateOperations(s);
  return salvage;
}
export function setPriority(s, priority, focus, id = s.player) {
  if (!PRIORITIES[priority] || !REGIONS[focus])
    throw new Error("Choose a valid priority and theater.");
  const n = s.nations[id];
  n.priority = priority;
  n.focus = focus;
  if (id === s.player)
    addLog(
      s,
      `Admiralty directive: ${PRIORITIES[priority].name.toLowerCase()}, admirals select destinations and refueling stops. Fleets with individual orders retain their missions.`,
    );
}

export function diplomaticAction(
  s,
  target,
  action,
  id = s.player,
  content = null,
  fleetId = null,
) {
  if (!content)
    throw new Error("Diplomatic orders require the campaign catalog.");
  const block = diplomaticBlock(s, content, target, action, id, fleetId);
  if (block) throw new Error(block);
  const n = s.nations[id],
    rule = diplomaticTerms(s, content, target, action, id),
    now = s.day + (s.fraction || 0);
  const force =
    action === "provoke"
      ? readyProvocationFleet(s, content, target, id)
      : null;
  if (force) startProvocation(s, content, id, target, force.id);
  spend(n, rule.price, { production: false });
  n.cooldowns[action + "-" + target] = now + rule.days;
  const gains = {};
  for (const [k, v] of Object.entries(rule.gain)) {
    const before = n[k];
    n[k] = k === "influence" ? Math.min(500, before + v) : before + v;
    gains[k] = n[k] - before;
  }
  const receipt = force
    ? force.name +
      " ordered to a 90-day naval demonstration against " +
      PROFILES[target].name +
      ". Only an overlapping opposing deployment can cause a single naval incident."
    : PROFILES[target].name +
      ": " +
      rule.name +
      " completed. Received " +
      Object.entries(gains)
        .map(([k, v]) => v.toLocaleString("en-US") + " " + k)
        .join(", ") +
      ".";
  invalidateOperations(s);
  if (id === s.player) {
    addLog(s, receipt, "diplomacy");
    s.log[0].dismissed = true;
  }
  return { receipt, fleetId: force?.id, gains, price: rule.price, effects: rule.effects };
}
export function setTreatyPolicy(s, policy, id = s.player) {
  if (!TREATY_POLICIES[policy])
    throw Error("Choose one of the three treaty policies.");
  const n = s.nations[id];
  if (n.treatyPolicy === policy) return;
  if (id === "SOV") throw Error("The Soviet Union is not a treaty signatory.");
  if (s.day > s.treatyUntil) throw Error("Treaty limits have expired.");
  spend(n, { gold: TREATY_SWITCH_GOLD, influence: 0, industry: 0 });
  n.treatyPolicy = policy;
  for (const g of n.groups) g.covert = concealing(n);
  normalizeDecisions(s);
}

export function dismissNotice(s, c, id) {
  const d = s.decisions.find((d) => d.key === id);
  if (d) {
    deferDecision(s, c, id);
    return;
  }
  const a = s.alerts.find((a) => String(a.id) === String(id));
  if (a) a.dismissed = true;
  if (String(id).startsWith("contact-")) {
    const contact = s.nations[s.player].contacts.find(
      (c) => "contact-" + c.id === id,
    );
    if (contact) contact.dismissedAt = campaignMinutes(s);
  }
  if (String(id).startsWith("dispatch-")) {
    const l = s.log.find((l) => "dispatch-" + l.id === id);
    if (l) l.dismissed = true;
  }
}

export function clearOptionalAlerts(s, c) {
  for (const d of [...s.decisions]) if (!d.critical) dismissNotice(s, c, d.key);
  for (const a of s.alerts) a.dismissed = true;
  for (const l of s.log) l.dismissed = true;
  for (const contact of s.nations[s.player].contacts)
    if (
      s.relations[pairKey(s.player, contact.nation)]?.war &&
      campaignMinutes(s) - contact.seenAt <= 48 * 60
    )
      contact.dismissedAt = campaignMinutes(s);
}
function completeProject(s, content, n, p) {
  const definition = PROGRAMS[p.key];
  if (definition.level) n.tech[definition.level]++;
  if (p.key === "school")
    n.crewYear = economyFor(s, n.id).crewYear * facilityFactor(n.tech, "school", 0.25);
  if (p.key === "pilots")
    n.aviatorsYear = economyFor(s, n.id).aviatorsYear * facilityFactor(n.tech, "pilots", 0.3);
  if (p.key === "training") {
    n.training = clamp(n.training + 9, 0, 100);
    n.morale = clamp(n.morale + MORALE.training, 0, MORALE.ceiling);
  }
  if (n.id === s.player) {
    addLog(s, `${p.name} completed.`, "industry", { programKey: p.key, newsView: 'programs' });
  }
}
export function yardLoad(s, content, id = s.player) {
  const n = s.nations[id],
    yards = yardAvailability(s, id),
    occupied = yards.owned === 0,
    health = yards.coverage;
  const capacity =
    ((1 - (n.industrialDamage?.yards || 0)) *
      health *
      strategicFactor(n) *
      economyFor(s, id).yardYear *
      industryFactor(s, n.id) *
      (n.industryFunding ?? 1) *
      (n.industryOperating ?? 1)) /
    365;
  const work = n.groups
    .filter((g) => ["building", "trials", "converting"].includes(g.status))
    .reduce(
      (sum, g) => sum + (content.classes[g.classId].tons * g.count) / g.days,
      0,
    );
  return {
    capacity,
    work,
    used: Math.min(work, capacity),
    spare: Math.max(0, capacity - work),
    backlog: Math.max(0, work - capacity),
    factor: Math.max(1, work / Math.max(0.001, capacity)),
    blocked: capacity <= 0,
    reason: occupied
      ? "National yards occupied"
      : health <= 0
        ? "National yards disabled by damage"
        : capacity <= 0
          ? "Industry operating funds exhausted"
          : "",
  };
}
function daily(s, content) {
  if (new Date(s.day * DAY).getUTCDate() === 1) {
    monthly(s, content);
    content = contentFor(content, s);
  }
  // Pay this day's operating costs before permitting this day's yard work.
  dailyResources(s, content, (text, kind) => addLog(s, text, kind));
  for (const [id, n] of Object.entries(s.nations)) {
    const load = yardLoad(s, content, id);
    for (const g of n.groups) {
      if (["building", "converting", "trials"].includes(g.status)) {
        g.progress = clamp(
          g.progress + (load.blocked ? 0 : 1 / (g.days * load.factor)),
          0,
          1,
        );
        if (g.progress >= 1) {
          const deliveredCount = g.count;
          g.status = "active";
          g.region = PROFILES[id].home;
          delete g.fleetId;
          commissionToFleet(s, content, id, g);
          const service = fleetService(content.classes[g.classId]);
          n[
            service === "merchant"
              ? "merchantDelivered"
              : service === "support"
                ? "supportDelivered"
                : "delivered"
          ] += deliveredCount;
          if (id === s.player)
            addLog(
              s,
              `${deliveredCount} × ${g.baseName || g.name} ${service === "merchant" ? "entered merchant service" : "commissioned"}.`,
              "industry",
              { shipId: g.id, newsView: 'fleet' },
            );
        }
      }
      if (
        g.status === "repair" && !g.battleId &&
        usablePorts(s, id).includes(g.dockPort || HOME_PORT[id])
      ) {
        const cost = content.classes[g.classId].cost * g.count * 0.0001;
        if (n.gold >= cost) {
          n.gold -= cost;
          recordGold(n, 'shipRepairs', -cost);
          g.health = clamp(
            g.health +
              0.003 *
                (1 +
                  upgradeLevel(n.tech, "logistics") * 0.1 +
                  upgradeLevel(n.tech, "damage_control") * 0.06),
            0,
            1,
          );
          if (g.health >= 1) {
            g.status = "active";
            commissionToFleet(s, content, id, g);
            if (id === s.player)
              addLog(s, `${g.name} returned to service after repairs.`, 'navy', { shipId: g.id, newsView: 'fleet' });
          }
        }
      }
    }
    retireReplacedTreatyHulls(s, content, id);
    for (const p of [...n.projects]) {
      p.remaining--;
      if (p.remaining <= 0) {
        completeProject(s, content, n, p);
        n.projects.splice(n.projects.indexOf(p), 1);
      }
    }
    n.training = clamp(
      n.training - 0.0025 / (1 + upgradeLevel(n.tech, "training") * 0.2),
      20,
      100,
    );
    changeMorale(n,dailyMoraleRecovery(n));
  }
  repairPorts(s);
  repairIndustry(s);
  dailyOperations(s, content);
  dailyWorld(s, content, (title, body, meta) =>
    recordFrontAlert(s, title, body, meta),
  );
  dailyAviation(s, content);
  invalidateOperations(s);
  for (const id of Object.keys(s.nations)) applyStandingOrders(s, content, id);

  const date = new Date(s.day * DAY);

  scriptedDecisions(s, content);
  if (
    date.getUTCMonth() === 11 &&
    date.getUTCDate() === 31 &&
    REVIEW_YEARS.includes(date.getUTCFullYear())
  ) {
    const review = {
      year: date.getUTCFullYear(),
      day: s.day,
      scores: campaignScores(s, content),
    };
    s.reviews.push(review);
    addLog(
      s,
      `${review.year} campaign review: ${review.scores.find((r) => r.id === s.player).score} points. The sandbox continues.`,
      "cabinet",
    );
    if (review.year === REVIEW_YEARS.at(-1)) {
      queueDecision(
        s,
        `review-${review.year}`,
        `The ${review.year} campaign review`,
        data.FINAL_REVIEW.body,
        structuredClone(data.FINAL_REVIEW.options),
      );
    }
  }
}
function historicalEvents(s, content) {
  const t = s.timeline,
    now = campaignMinutes(s);
  pacificOpening(s, content);
  politicsTick(s);
  if (!t.polandOccurred && now >= t.polandAt - 1e-6) {
    t.polandOccurred = true;
    const event = EUROPE_OPENING.invasion;
    addLog(s, event.log, "war");
    s.log[0].dismissed = true;
    addAlert(
      s,
      event.title,
      event.body,
      "war",
      { popupKey: event.key },
    );
    dispatchPopup(
      s,
      event.key,
      event.title,
      event.body,
      "war",
    );
  }
  if (!t.europeOccurred && now >= t.britainAt - 1e-6) {
    t.europeOccurred = true;
    for (const declaration of EUROPE_OPENING.declarations) {
      commenceWar(s, content, declaration.attacker, declaration.defender, {
        reason: declaration.reason, aggressor: declaration.attacker,
      });
    }
    for (const [id, focus] of Object.entries(EUROPE_OPENING.navalFocus))
      if (id !== s.player) {
        s.nations[id].focus = focus;
        applyStandingOrders(s, content, id);
      }
    normalizeDecisions(s);
  }
  if (t.europeOccurred && s.nations.ITA && s.nations.SOV) {
    const offset = s.campaignId === "campaign_1922" ? t.offsetDays * 1440 : 0;
    for (const {
      key,
      date,
      pairs,
      title,
      followEuropeanOffset,
    } of HISTORICAL_WARS)
      if (
        now >= Date.parse(date) / 60000 + (followEuropeanOffset ? offset : 0) &&
        !s.completedEvents.includes(key)
      ) {
        s.completedEvents.push(key);
        for (const [a, b] of pairs)
          commenceWar(s, content, a, b, { reason: title + ".", aggressor: a });
        addLog(s, title + ".", "war");
        addAlert(
          s,
          title,
          "The diplomatic situation has changed. Review naval missions and convoy protection.",
          "war",
        );
        normalizeDecisions(s);
      }
  }
}
export function advanceMinutes(
  s,
  content,
  minutes,
  { respectPause = false } = {},
) {
  content = contentFor(content, s);
  if (!Number.isFinite(minutes) || minutes < 0)
    throw new Error("Choose a finite, positive time interval.");
  if (respectPause && s.paused) return 0;
  const start = campaignMinutes(s),
    target = canonicalMinute(start + minutes);
  historicalEvents(s, content);
  while (campaignMinutes(s) < target - 1e-7) {
    if (respectPause && s.paused) break;
    const now = campaignMinutes(s),
      minute = (Math.floor(now / TICK_MINUTES) + 1) * TICK_MINUTES;
    const event = Math.min(
      s.timeline.polandOccurred ? Infinity : s.timeline.polandAt,
      s.timeline.europeOccurred ? Infinity : s.timeline.britainAt,
    );
    const next = Math.min(target, minute, event),
      oldDay = s.day;
    setCampaignMinutes(s, next);
    if (s.day !== oldDay) {
      daily(s, content);
      content = contentFor(content, s);
    }
    historicalEvents(s, content);
    if (campaignMinutes(s) === minute) {
      minuteOperations(
        s,
        content,
        (a, b, r, fa, fb, pos) =>
          resolveBattle(s, content, a, b, r, fa, fb, pos),
        (a,b,convoyId,pos,fleet) => resolveConvoyAttack(s,content,a,b,fleet,convoyId,pos),
      );
      progressEngagements(s, content);
      minuteAviation(s, content);
      coastalRecon(s, content);
      strategicAirPlanning(s, content);
      minutePortOperations(s, content, (id, f, port, kind, distance) =>
        resolvePortAction(s, content, id, f, port, kind, distance),
      );
      minuteAirOperations(s, content, (id, op, pos) =>
        resolveAirAttack(s, content, id, op, pos),
      );
      if (minute % 60 === 0) updatePortBlockades(s, content);
      s.minuteTicks = (s.minuteTicks || 0) + 1;
      decisionDeadlines(s, content);
    }
  }
  return campaignMinutes(s) - start;
}
export function advanceDays(s, content, days, options = {}) {
  const oldDay = s.day;
  advanceMinutes(s, content, Math.floor(days) * 1440, options);
  return s.day - oldDay;
}
export function tick(s, content, seconds) {
  return s.paused
    ? 0
    : advanceMinutes(
        s,
        content,
        (Math.max(0, seconds) * BASE_SPEED * s.speed) / 60,
        { respectPause: true },
      );
}

function monthly(s, content) {
  for (const [id, n] of Object.entries(s.nations)) {
    closeEconomicMonth(s, content, id);
    const income = monthlyIncome(s, content, id);
    const paidUpkeep = Math.min(n.gold, income.upkeep);
    const paidTreaty = Math.min(Math.max(0, n.gold - paidUpkeep), income.treaty.gold);
    n.gold = Math.max(0, n.gold - income.upkeep - income.treaty.gold);
    recordGold(n, 'upkeep', -paidUpkeep);
    recordGold(n, 'treaty', -paidTreaty);
    n.influence = clamp(n.influence + income.influence, 0, 500); // Industry output and its running expense are credited daily.
    if (n.gold < 1) {
      changeMorale(n,MORALE.unpaidFleet);
    }
    n.exposure = 0; // Concealment is charged transparently by the proportional treaty ledger.
  }
  for (const id of Object.keys(s.nations))
    if (s.controllers[id] === "ai") {
      aiTurn(s, content, id);
      content = contentFor(content, s);
    }
  const scores = campaignScores(s, content);
  s.history.push({
    day: s.day,
    scores: scores.map((r) => ({
      id: r.id,
      score: r.score,
      power: r.power,
      commerce: r.commerce,
    })),
  });
  s.history = s.history.slice(-240);
}

export function aiTurn(s, content, id) {
  if (s.controllers[id] !== "ai") return;
  const command = (type, args) => applyCommand(s, content, { type, args }, id);
  if (new Date(s.day * DAY).getUTCMonth() === 0) {
    const nation = s.nations[id],
      year = yearOf(s);
    for (const role of ["fighter", "strike", "scout"]) {
      const models = content.nations[id].aircraft.filter(
          (a) => [role, "multirole"].includes(planeRole(a)) && a.type_year <= year,
        ),
        latest = Math.max(1922, ...models.map((a) => a.type_year));
      if (
        year - latest >= 3 &&
        nation.gold > 6000 &&
        (nation.customAircraft?.length || 0) < 80
      ) {
        const recipe = automaticAircraftDraft(s, content, role, id);
        try {
          command("commission-aircraft", { recipe });
          content = contentFor(content, s);
        } catch {}
      }
    }
    const role = ["DD", "CL", "SS", "CA", "BB", "CV"][Math.abs(year) % 6],
      latest = Math.max(
        1922,
        ...content.nations[id].designs
          .map((k) => content.classes[k])
          .filter((cl) => cl.type === role && cl.year <= year)
          .map((cl) => cl.year),
      );
    if (
      year - latest >= 4 &&
      nation.gold > 12000 &&
      nation.customDesigns.length < 80
    )
      try {
        command("commission-draft", {
          recipe: automaticDraft(s, content, role, id),
        });
        content = contentFor(content, s);
      } catch {}
  }
  const n = s.nations[id];
  let needs = aiNeeds(s, content, id);
  aiFunding(s, content, id, needs);
  for (const target of Object.keys(s.nations).filter((other) => other !== id)) {
    const response = s.provocations.some(
      (p) => p.nation === target && p.target === id,
    );
    const action =
      strategicFactor(n) < 1 && n.gold > 5000
        ? "strategic"
        : n.influence < 24
        ? "visit"
        : n.gold < economyFor(s, id).goldYear / 12 && n.strategic > Math.max(4000, (n.strategicDailyDemand || 0) * 60 + DIPLOMACY.sellStrategic.price.strategic)
          ? "sellStrategic"
        : n.gold < economyFor(s, id).goldYear / 12 && n.industry > 5000
          ? "sell"
          : n.industry < 2500 && n.gold > 10000 && n.influence > 35
            ? "cooperate"
            : null;
    if (
      action &&
      !diplomaticBlock(s, content, target, action, id) &&
      aiCanSpend(s, id, diplomaticTerms(s, content, target, action, id).price)
    )
      command("diplomatic", { id: target, kind: action });
    if (
      (response || (target === n.rival && rng(s) < 0.05)) &&
      !diplomaticBlock(s, content, target, "provoke", id) &&
      aiCanSpend(s, id, diplomaticTerms(s, content, target, "provoke", id).price)
    )
      command("diplomatic", { id: target, kind: "provoke" });
  }

  if (id !== "SOV" && s.day <= s.treatyUntil) {
    const options = Object.keys(TREATY_POLICIES)
      .map((policy) => treatyAssessment(s, content, id, policy))
      .sort((a, b) => a.gold + a.influence * 400 - b.gold - b.influence * 400);
    if (
      options[0].policy !== n.treatyPolicy &&
      aiCanSpend(s, id, { gold: TREATY_SWITCH_GOLD, influence: 0, industry: 0 })
    )
      command("treaty", { policy: options[0].policy });
  }
  const shipping = merchantEconomy(s, content, id);
  let yards = yardLoad(s, content, id);
  const models = aircraftModels(content, id)
    .filter((a) => a.type_year <= yearOf(s))
    .sort((a, b) => b.type_year - a.type_year);
  for (const role of ["fighter", "strike", "scout"]) {
    const ready = models.find(
      (a) =>
        [role, "multirole"].includes(planeRole(a)),
    );
    if (ready) command("production", { role, model: ready.id });
  }
  yards = yardLoad(s, content, id);
  const scores = aiResearchScores(s, content, id, needs, shipping, yards);
  if (n.projects.length < 3) {
    const program = Object.keys(PROGRAMS)
      .filter(
        (key) =>
          !projectBlock(s, key, id) &&
          aiCanSpend(s, id, projectPrice(s, key, id)),
      )
      .sort(
        (a, b) => (scores[b] || 0) - (scores[a] || 0) || a.localeCompare(b),
      )[0];
    if (program) command("project", { id: program });
  }
  // Replace a missing/obsolete line in a needed role; do not pay for duplicate drafts each cycle.
  const wanted = Object.keys(aiDoctrine(s, id).roles)
    .filter((role) => aiDoctrine(s, id).roles[role] > 0)
    .map((role) => ({
      role,
      score: aiHullScore(
        s,
        content,
        id,
        { type: role, service: "warship", year: yearOf(s), crew: 0 },
        needs,
      ),
    }))
    .sort((a, b) => b.score - a.score);
  const missing = wanted.find(
    ({ role }) =>
      !content.nations[id].designs.some(
        (cid) =>
          content.classes[cid].type === role &&
          !productionBlock(s, content, cid, id),
      ),
  );
  if (
    missing &&
    (n.cooldowns.draft ?? -Infinity) <= s.day &&
    n.customDesigns.length < 80
  ) {
    const recipe = automaticDraft(s, content, missing.role, id),
      fee = evaluateDesign(recipe, id).fee;
    if (aiCanSpend(s, id, { gold: fee })) {
      command("commission-draft", { recipe });
      n.cooldowns.draft = s.day + 730;
      content = contentFor(content, s);
    }
  }
  needs = aiNeeds(s, content, id);
  yards = yardLoad(s, content, id);
  if (!yards.blocked && yards.factor < 1.15) {
    const candidates = content.nations[id].designs
      .map((cid) => content.classes[cid])
      .filter(
        (cl) =>
          !shipOrderBlock(s, content, cl.id, id) &&
          fleetService(cl) !== "merchant",
      )
      .map((cl) => ({ cl, score: aiHullScore(s, content, id, cl, needs) }))
      .filter((x) => x.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score || b.cl.year - a.cl.year || b.cl.speed - a.cl.speed,
      );
    for (const { cl } of candidates) {
      let quantity = ["DD", "DL", "DE", "TB", "SS", "SM"].includes(cl.type)
        ? 3
        : 1;
      while (quantity > 0) {
        const p = shipPrice(s, content, cl.id, quantity, id),
          crewAvailable =
            needs.crew.balance +
            n.crewYear * n.schoolFunding * 2 -
            needs.pipelineCrew;
        if (
          aiCanSpend(s, id, p) &&
          crewAvailable >= cl.crew * quantity &&
          yards.work + (cl.tons * quantity) / p.days <= yards.capacity * 1.25
        ) {
          command("order", { id: cl.id, count: quantity });
          quantity = -1;
          break;
        }
        quantity--;
      }
      if (quantity === -1) break;
    }
  }

}

function matchup(own, enemy) {
  return (
    own.surface +
    own.air / (1 + (enemy.aa / Math.max(200, own.air)) * 0.35) +
    (own.sub / (1 + enemy.asw / Math.max(100, own.sub))) * 1.2 +
    own.asw * 0.2
  );
}
export function damageFleet(
  s,
  content,
  id,
  region,
  damage,
  enemyPower,
  mechanism,
  fleetId = null,
  rescue = 0.3,
  crewCoverage = 1,
  targets = null,
) {
  const n = s.nations[id],
    losses = [],
    conditions = [],
    engagedComposition = {},
    sunkComposition = {},
    damagedComposition = {};
  let sunk = 0,
    damaged = 0,
    tons = 0,
    damagedTons = 0,
    engagedTons = 0,
    planesLost = 0,
    aviatorsLost = 0,
    planesRescued = 0,
    aviatorsRescued = 0,
    sailorsLost = 0,
    sailorsRescued = 0;
  const groups =
    targets ||
    n.groups.filter(
      (g) =>
        availableGroup(s, g) &&
        (fleetId ? g.fleetId === fleetId : g.region === region) &&
        (!isAuxiliary(content.classes[g.classId]) ||
          (fleetId && g.service === "support")),
    );
  const total = groups.reduce((sum, g) => sum + g.count, 0),
    supportBefore = groups
      .filter((g) => g.service === "support")
      .reduce(
        (v, g) => v + content.classes[g.classId].tons * g.count * g.health,
        0,
      );
  for (const g of groups) {
    const c = content.classes[g.classId],
      underwater = ["SS", "SM"].includes(c.type),
      before = g.count;
    engagedTons += c.tons * before;
    engagedComposition[c.type] = (engagedComposition[c.type] || 0) + before;
    const protection =
      (underwater
        ? 1 + c.submergedSpeed / 20
        : 1 + c.belt / 350 + c.deck / 300) +
      Math.sqrt(c.durability / 300) * 0.2;
    const detection = underwater
      ? clamp(
          enemyPower.asw /
            Math.max(80, enemyPower.sub + enemyPower.surface * 0.04),
          0.08,
          1,
        )
      : 1;
    const oldHealth = g.health,
      hit =
        (((((damage / protection) * (0.75 + rng(s) * 0.5)) /
          (1 +
            (c.raw?.features?.includes("damage_control") ? 0.08 : 0) +
            (c.raw?.features?.includes("bulges") &&
            /torpedo|air strike/.test(mechanism)
              ? 0.15
              : 0))) *
          detection) /
          (1 + upgradeLevel(n.tech, "damage_control") * 0.06)) *
        (0.8 + 0.2 / Math.max(0.25, crewEffectiveness(g, c)));
    g.health = clamp(g.health - hit, 0, 1);
    const expected = before * clamp(hit * hit * 0.35, 0, 0.3);
    let lost = Math.floor(expected) + (rng(s) < expected % 1 ? 1 : 0);
    if (hit > 0 && g.health < 0.25) lost = Math.max(1, lost);
    lost = Math.min(before, lost);
    const aircraftLoss = loseAircraft(
      s,
      content,
      id,
      g,
      lost === before ? 1 : clamp(hit * 0.45 + lost / before, 0, 1),
      { rescue, airframeRescue: lost === before ? 0 : rescue * 0.2 },
    );
    planesLost += aircraftLoss.planes;
    aviatorsLost += aircraftLoss.aviators;
    planesRescued += aircraftLoss.planesRescued;
    aviatorsRescued += aircraftLoss.aviatorsRescued;
    if (lost) {
      g.count -= lost;
      sunk += lost;
      tons += lost * c.tons;
      sunkComposition[c.type] = (sunkComposition[c.type] || 0) + lost;
      losses.push({
        name: g.name,
        type: c.type,
        classId: c.id,
        count: lost,
        cause: underwater
          ? enemyPower.asw > 0
            ? "depth charges and escort pursuit"
            : "surface interception"
          : mechanism,
        tons: lost * c.tons,
      });
    }
    const injury = Math.max(0, oldHealth - g.health);
    damagedTons += c.tons * g.count * injury;
    if (g.count === 0) {
      g.status = "sunk";
      g.health = 0;
    } else {
      if (injury > 0) {
        damaged += g.count;
        damagedComposition[c.type] =
          (damagedComposition[c.type] || 0) + g.count;
      }
      if (g.health < 0.65) {
        g.status = fleetId ? "returning" : "repair";
        if (!fleetId) g.region = PROFILES[id].home;
      }
    }
    const aboard = g.sailors || 0,
      exposed = Math.min(
        aboard,
        Math.floor(
          aboard *
            (lost / Math.max(1, before) +
              (g.count / Math.max(1, before)) * injury * 0.15),
        ),
      );
    g.sailors = aboard - exposed;
    n.crew -= exposed;
    const personnel = recordCasualties(s, n, "sailors", exposed, {
      rescue: Math.min(
        0.95,
        rescue + upgradeLevel(n.tech, "damage_control") * 0.015,
      ),
      days: 14,
    });
    sailorsLost += personnel.lost;
    sailorsRescued += personnel.rescued;
    conditions.push({
      id: g.id,
      type: c.type,
      name: g.name,
      classId: g.classId,
      count: before,
      sunk: lost,
      health: g.health,
      damage: Math.round((1 - g.health) * 100),
      newDamage: Math.round(injury * 100),
      severity: !g.count
        ? "sunk"
        : g.health < 0.65
          ? "serious"
          : g.health < 0.9
            ? "moderate"
            : "light",
      tons: c.tons,
      returning: g.status === "returning",
    });
  }
  const support = n.fleets.find(
    (f) => f.id === fleetId && f.role === "support",
  );
  if (support && supportBefore > 0)
    support.supportCargo *=
      groups
        .filter((g) => g.service === "support")
        .reduce(
          (v, g) => v + content.classes[g.classId].tons * g.count * g.health,
          0,
        ) / supportBefore;
  n.lostTons += tons;
  invalidateOperations(s);
  return {
    sunk,
    damaged,
    tons,
    damagedTons,
    engagedTons,
    engagedComposition,
    sunkComposition,
    damagedComposition,
    damagePercent: (100 * damagedTons) / Math.max(1, engagedTons),
    planesLost,
    aviatorsLost,
    planesRescued,
    aviatorsRescued,
    sailorsLost,
    sailorsRescued,
    conditions,
    losses,
    engaged: total,
  };
}
export function engagementEscapeChance(weak, strong) {
  // Detecting the enemy first permits an early turn away; greater speed keeps the gap open.
  return clamp(
    0.42 +
      (weak.speed - strong.speed) * 0.035 +
      (weak.scout / Math.max(1, weak.ships) -
        strong.scout / Math.max(1, strong.ships)) *
        0.018,
    0.06,
    0.97,
  );
}
export function resolveBattle(
  s,
  content,
  a,
  b,
  region,
  fleetA = null,
  fleetB = null,
  position = null,
  phase = null,
) {
  const pa = fleetPower(s, content, a, region, fleetA),
    pb = fleetPower(s, content, b, region, fleetB);
  if (!pa.ships || !pb.ships) return null;
  const fa = s.nations[a].fleets.find((f) => f.id === fleetA),
    fb = s.nations[b].fleets.find((f) => f.id === fleetB);
  pa.total -= pa.air;
  pb.total -= pb.air;
  pa.air = 0;
  pb.air = 0;
  if (fa)
    pa.speed =
      fleetStats(s, content, a, fa).maxSpeed *
      Math.max(0.4, fleetStats(s, content, a, fa).health);
  if (fb)
    pb.speed =
      fleetStats(s, content, b, fb).maxSpeed *
      Math.max(0.4, fleetStats(s, content, b, fb).health);
  const wa = matchup(pa, pb),
    wb = matchup(pb, pa),
    weaker = wa < wb ? a : b,
    weak = weaker === a ? pa : pb,
    strong = weaker === a ? pb : pa;
  const ratio = Math.min(wa, wb) / Math.max(1, wa, wb),
    weakFleet = weaker === a ? fa : fb;
  if (
    !phase && (ratio < 0.72 || weakFleet?.role === "repair") &&
    !opposingProvocations(s, a, fleetA, b, fleetB) &&
    !weakFleet?.aggressiveBattle &&
    rng(s) < engagementEscapeChance(weak, strong)
  ) {
    if ([a, b].includes(s.player))
      addLog(
        s,
        PROFILES[weaker].name +
          " used scouting and escape speed to avoid an unequal engagement in the " +
          REGIONS[region].name +
          ".",
      );
    return null;
  }
  if (!phase) return beginEngagement(s,content,{kind:"surface",a,b,region,fleetA,fleetB,position});
  // Power above includes the loaded salvo; subsequent exchanges see the spent outfit.
  expendFleetTorpedoes(s, content, a, region, fleetA);
  expendFleetTorpedoes(s, content, b, region, fleetB);
  const va = 1 + (rng(s) * 2 - 1) * RULES.battleVariation,
    vb = 1 + (rng(s) * 2 - 1) * RULES.battleVariation;
  const preparationA = {
      training: s.nations[a].training,
      morale: s.nations[a].morale,
      supply: pa.supply,
      crew: readiness(s, content, a),
    },
    preparationB = {
      training: s.nations[b].training,
      morale: s.nations[b].morale,
      supply: pb.supply,
      crew: readiness(s, content, b),
    };
  const upset = rng(s) < RULES.upsetChance,
    upsetSide = upset ? (rng(s) < 0.5 ? a : b) : null,
    ea = wa * va * (upsetSide === a ? 1.8 : 1),
    eb = wb * vb * (upsetSide === b ? 1.8 : 1);
  const mechanism = (p) =>
    p.air > p.surface && p.air > p.sub
      ? "carrier air attack"
      : p.sub > p.surface
        ? "submarine torpedo attack"
        : "gunfire and surface torpedoes";
  const rescueFor = (id, f, control) => {
    const pos = f ? fleetPosition(s, f) : position;
    let escorts = 0;
    for (const [ally, n] of Object.entries(s.nations)) {
      if (ally !== id && !s.relations[pairKey(id, ally)]?.allied) continue;
      for (const other of n.fleets) {
        if (
          pos
            ? distanceNm(fleetPosition(s, other), pos) > 120
            : other.id !== f?.id
        )
          continue;
        escorts += fleetStats(s, content, ally, other)
          .active.filter((g) =>
            ["DD", "DE", "DL"].includes(content.classes[g.classId].type),
          )
          .reduce((v, g) => v + g.count, 0);
      }
    }
    return clamp(
      0.12 + control * 0.55 + Math.min(8, escorts) * 0.025,
      0.1,
      0.9,
    );
  };
  const pressureA = fa?.aggressiveBattle ? 1.4 : 1,
    pressureB = fb?.aggressiveBattle ? 1.4 : 1,
    riskA = fa?.aggressiveBattle ? 1.2 : 1,
    riskB = fb?.aggressiveBattle ? 1.2 : 1;
  const da = damageFleet(
    s,
    content,
    a,
    region,
    clamp((eb / Math.max(ea, 1)) * 0.2 * pressureB * riskA, 0.04, 0.85) * phase.weight,
    pb,
    mechanism(pb),
    fleetA,
    rescueFor(a, fa, ea / (ea + eb)),
    preparationA.crew,
  );
  const db = damageFleet(
    s,
    content,
    b,
    region,
    clamp((ea / Math.max(eb, 1)) * 0.2 * pressureA * riskB, 0.04, 0.85) * phase.weight,
    pa,
    mechanism(pa),
    fleetB,
    rescueFor(b, fb, eb / (ea + eb)),
    preparationB.crew,
  );
  staffAircraft(s, content, a);
  staffAircraft(s, content, b);
  const costA = da.tons + da.damagedTons * 0.65,
    costB = db.tons + db.damagedTons * 0.65,
    winner = costA === costB ? (ea >= eb ? a : b) : costB > costA ? a : b;
  const magnitude =
    Math.max(costA, costB) >= Math.max(1000, Math.min(costA, costB) * 2)
      ? "major"
      : "minor";
  const report = {
    id: s.nextId++,
    day: s.day,
    minute: campaignMinutes(s),
    fleetA,
    fleetB,
    position,
    a,
    b,
    region,
    winner,
    magnitude,
    aggressiveA: !!fa?.aggressiveBattle,
    aggressiveB: !!fb?.aggressiveBattle,
    upset,
    upsetSide,
    powerA: pa,
    powerB: pb,
    effectiveA: ea,
    effectiveB: eb,
    variationA: va,
    variationB: vb,
    resultA: da,
    resultB: db,
    preparationA,
    preparationB,
  };
  return report;
}

export function resolvePortAction(s, c, a, f, port, kind, distance = 0, phase = null) {
  const b = portOwner(s, port);
  if (!s.relations[pairKey(a, b)]?.war) return null;
  const before = portSummary(s, c, port),
    harbor = kind === "anchorage" ? anchoredShips(s, c, b, port) : [],
    pa = fleetPower(s, c, a, null, f.id, distance * 1.852, harbor.length > 0);
  if (!pa.ships) return null;
  if (!phase) return beginEngagement(s,c,{kind:"port",a,b,fleetA:f.id,port,operation:kind,distance,position:fleetPosition(s,f)});
  const position = fleetPosition(s, f),
    region = Object.values(AREAS).sort(
      (x, y) => distanceNm(x.point, position) - distanceNm(y.point, position),
    )[0].region;
  pa.total -= pa.air;
  pa.air = 0;
  const artillery = distance <= before.gunRange ? before.artillery : 0,
    air = {
      ...baseAirPower(s, c, port, distance * 1.852),
      strike: 0,
      fighters: 0,
    },
    aviation = 0;
  if (kind === "shore" && artillery + aviation <= 0) return null;
  const pb = {
    surface: artillery,
    air: aviation,
    sub: 0,
    asw: 100,
    aa: before.artillery * 0.2 + air.fighters,
    scout: air.scout,
    total: artillery + aviation,
    ships: 0,
    speed: 0,
    supply: 1,
  };
  const va = 0.94 + rng(s) * 0.12,
    vb = 0.94 + rng(s) * 0.12,
    attack =
      (pa.air / (1 + air.fighters / Math.max(300, pa.air)) +
        (distance <= 18 ? pa.surface * 0.55 : 0)) *
      va * phase.weight;
  if (distance <= 18 && harbor.length > 0) expendFleetTorpedoes(s, c, a, region, f.id);
  const da = damageFleet(
    s,
    c,
    a,
    region,
    clamp(((pb.total * vb) / Math.max(1200, pa.total)) * 0.12 * phase.weight, 0, 0.3),
    pb,
    "shore artillery and land-based aircraft",
    f.id,
    0.55,
  );
  const db = damageFleet(
    s,
    c,
    b,
    region,
    kind === "anchorage"
      ? clamp(
          (attack / Math.max(2500, pb.total + harbor.length * 200)) * 0.16,
          0.01,
          0.45,
        )
      : 0,
    pa,
    "anchorage strike",
    null,
    0.8,
    1,
    harbor,
  );
  if (before.assignedAircraft > 0 && (aviation > 0 || kind === "anchorage")) {
    const airLoss = loseAircraft(
      s,
      c,
      b,
      { airWing: s.nations[b].airBases[port].airWing },
      Math.min(0.18, (attack / Math.max(5000, pb.total)) * 0.06),
      { rescue: 0.8, airframeRescue: 0.15 },
    );
    db.planesLost += airLoss.planes;
    db.planesRescued += airLoss.planesRescued;
    db.aviatorsLost += airLoss.aviators;
    db.aviatorsRescued += airLoss.aviatorsRescued;
  }
  const portDamage =
    kind === "shore"
      ? 0
      : damagePort(
          s,
          port,
          clamp(
            (attack / Math.max(3000, before.combat)) *
              (kind === "siege" ? 0.065 : 0.02),
            0,
            0.12,
          ),
        );
  const portEquivalent = portDamage * 60000,
    costA = da.tons + da.damagedTons * 0.65,
    costB = db.tons + db.damagedTons * 0.65 + portEquivalent;
  const winner = costB > costA ? a : b,
    magnitude =
      Math.max(costA, costB) >= Math.max(1000, Math.min(costA, costB) * 2)
        ? "major"
        : "minor";
  const report = {
    id: s.nextId++,
    day: s.day,
    minute: campaignMinutes(s),
    kind: "port",
    operation: kind,
    portId: port,
    portDamage,
    portHealth: s.ports[port].health,
    portEquivalent,
    position,
    region,
    a,
    b,
    fleetA: f.id,
    fleetB: null,
    winner,
    magnitude,
    upset: false,
    upsetSide: null,
    shoreAircraft: air.wings,
    shoreReadiness: air.readiness,
    powerA: pa,
    powerB: pb,
    effectiveA: attack,
    effectiveB: pb.total * vb,
    variationA: va,
    variationB: vb,
    resultA: da,
    resultB: db,
    preparationA: {
      training: s.nations[a].training,
      morale: s.nations[a].morale,
      supply: pa.supply,
      crew: 1,
    },
    preparationB: {
      training: s.nations[b].training,
      morale: s.nations[b].morale,
      supply: before.coverage,
      crew: 1,
    },
  };
  return report;
}

export function resolveConvoyAttack(s,c,a,b,fleetId,convoyId,position,phase=null) {
  const f=s.nations[a].fleets.find(f=>f.id===fleetId), v=s.nations[b].convoys.find(v=>v.id===convoyId && v.count);
  if(!f || !v || !s.relations[pairKey(a,b)]?.war) return null;
  const region=Object.values(AREAS).sort((x,y)=>distanceNm(x.point,position)-distanceNm(y.point,position))[0].region;
  if(!phase) return beginEngagement(s,c,{kind:"convoy",a,b,fleetA:fleetId,convoyId,position,region});
  const pa=fleetPower(s,c,a,region,fleetId);
  pa.total-=pa.air; pa.air=0;
  const pb={surface:0,air:0,sub:0,asw:0,aa:0,scout:0,total:0,ships:0,speed:v.speed,supply:1};
  for(const escort of s.nations[b].fleets) if(distanceNm(fleetPosition(s,escort),position)<120) {
    const power=fleetPower(s,c,b,null,escort.id); pb.asw+=power.asw; pb.surface+=power.surface*.2;
    expendFleetTorpedoes(s,c,b,null,escort.id);
  }
  pb.total=pb.asw+pb.surface;
  const attack=pa.surface+pa.sub, chance=attack/Math.max(1,attack+pb.total);
  expendFleetTorpedoes(s,c,a,region,fleetId);
  const lost=rng(s)<chance ? Math.floor((1+Math.min(7,attack/100)*rng(s))*phase.weight+rng(s)) : 0;
  const loss=sinkMerchants(s,b,Math.min(v.count,lost),{details:true,convoy:v});
  s.nations[a].merchantSunk+=loss.hulls; s.nations[a].merchantSunkGRT+=loss.grt;
  recordWarRaid(s,a,b,loss.grt);
  const resultA=damageFleet(s,c,a,region,0,pb,"convoy interception",null,.4,1,[]),
    resultB=damageFleet(s,c,b,region,0,pa,"convoy interception",null,.4,1,[]);
  return {a,b,region,powerA:pa,powerB:pb,effectiveA:attack,effectiveB:pb.total,variationA:1,variationB:1,
    resultA,resultB,merchantGRT:loss.grt,merchantHulls:loss.hulls};
}

export function chooseDecision(
  s,
  content,
  key,
  optionId,
  { automatic = false, actor = s.player } = {},
) {
  const d = decisionQueue(s, actor).find((d) => d.key === key),
    o = d?.options.find((o) => o.id === optionId);
  if (!o) throw new Error("That decision is no longer available.");
  if (!validDecision(s, d)) {
    normalizeDecisions(s);
    throw new Error(
      "This demand has lapsed because the treaty or diplomatic situation changed.",
    );
  }
  const n = s.nations[actor];
  if (o.program) startProject(s, o.program, actor);
  else
    spend(n, {
      gold: (automatic || optionId === d.defaultOption) && d.kind === "inspection" ? Math.min(n.gold, o.gold || 0) : o.gold || 0,
      influence:
        (automatic || optionId === d.defaultOption) && d.kind === "inspection"
          ? Math.min(n.influence, o.influence || 0)
          : o.influence || 0,
      industry: o.industry || 0,
    });
  if (o.vanilla) apply1922Decision(s, content, o.vanilla, actor);
  if (o.priority) n.priority = o.priority;
  n.influence = clamp(n.influence + (o.influenceGain || 0), 0, 500);
  n.industry += o.industryGain || 0;
  n.morale = clamp(n.morale + (o.morale || 0), 0, 100);
  if (o.reveal) {
    n.treatyPolicy = "disclose";
    for (const g of n.groups) g.covert = false;
  }
  if (o.renewDays) {
    s.treatyUntil = s.day + o.renewDays;
    n.treatyPolicy = "disclose";
  }
  decisionHistory(s, actor).push(key);
  const remaining = decisionQueue(s, actor).filter((x) => x.key !== key);
  if (actor !== s.player) {
    n.decisions = remaining;
    return;
  }
  s.decisions = remaining;
  for (const a of s.alerts) if (a.popupKey === key) a.dismissed = true;
  addLog(s, `${d.title}: ${o.label}.`, "cabinet");
  s.log[0].dismissed = true;
  if (automatic)
    addAlert(
      s,
      "Deadline reached: " + d.title,
      o.label + ". " + o.detail,
      "cabinet",
    );
  normalizeDecisions(s);
}
export function campaignScores(s, content) {
  return Object.keys(s.nations)
    .map((id) => {
      const n = s.nations[id],
        power = fleetPower(s, content, id).total,
        base = s.initial?.[id]?.power || power;
      const strength = Math.round(clamp(power / Math.max(1, base), 0, 3) * 150),
        economy = Math.round(
          merchantEconomy(s, content, id).logistics * 2 + upgradeLevel(n.tech, "industry") * 30,
        ),
        readinessScore = Math.round(
          (n.training + n.morale + supply(s, content, id) * 100) * 0.8,
        ),
        war = navalWarScore(n);
      return {
        id,
        score: strength + economy + readinessScore + war,
        power,
        commerce: merchantEconomy(s, content, id).logistics,
        strength,
        economy,
        readiness: readinessScore,
        war,
      };
    })
    .sort((a, b) => b.score - a.score);
}

// Scheduled maritime air action. Remote aircraft cannot inflict gunfire on a
// carrier hundreds of kilometers away; CAP and flak fight the airborne wing.
export function resolveAirAttack(s, c, a, op, position, phase = null) {
  if (!op.airWing?.some(w => ["strike", "bomber"].includes(w.role) && w.count > 0 && w.crewed > 0)) return null;
  const b = op.targetNation,
    n = s.nations[a],
    enemy = s.nations[b],
    f = n.fleets.find((f) => f.id === op.fleetId),
    target = enemy.fleets.find((f) => f.id === op.targetId),
    port = op.targetKind === "port" ? op.targetId : null;
  if (op.targetKind === "fleet" && (!target || !fleetStats(s,c,b,target).hulls)) return null;
  if (op.targetKind === "convoy" && !enemy.convoys.some(v=>v.id===op.targetId && v.count)) return null;
  if (!phase) return beginEngagement(s,c,{kind:"air",a,b,fleetA:f?.id,fleetB:target?.id,port,operation:op.operation,opId:op.id,position});
  const region = Object.values(AREAS).sort(
      (x, y) => distanceNm(x.point, position) - distanceNm(y.point, position),
    )[0].region,
    models = new Map(operationalAircraftModels(c, a).map((m) => [m.id, m]));
  const cap = combatAirPatrol(s, c, b, { fleetId: target?.id, port }),
    sourcePower = f
      ? fleetPower(s, c, a, null, f.id)
      : { supply: Math.max(0.25, s.ports[op.sourcePort]?.health ?? 1) },
    distance = op.outboundKm,
    conditions = airConditions(s, position);
  const quality = (w) => aircraftQuality(models.get(w.model), w.role);
  const strike = op.airWing
      .filter((w) => ["strike", "bomber"].includes(w.role))
      .reduce((v, w) => v + w.crewed * quality(w), 0),
    escorts = op.airWing
      .filter((w) => w.role === "fighter")
      .reduce((v, w) => v + w.crewed * quality(w), 0);
  const shore = port ? portSummary(s, c, port) : null,
    pb = target
      ? fleetPower(s, c, b, null, target.id)
      : {
          surface: 0,
          air: 0,
          sub: 0,
          asw: 0,
          aa: shore ? shore.artillery * 0.2 : 30,
          scout: 0,
          total: 0,
          ships: 0,
          speed: 0,
          supply: shore?.coverage || 1,
        };
  const capInterception = cap.power / (1 + escorts / Math.max(1, cap.power)),
    flak = Math.max(0, pb.aa - cap.power * 2),
    variation = 0.94 + rng(s) * 0.12;
  const survival =
      1 /
      (1 +
        (capInterception / Math.max(5, strike)) * 0.9 +
        (flak / Math.max(500, strike * 50)) * 0.2),
    proficiency =
      (0.5 + (n.training / 100) * 0.65) *
      (0.65 + (n.morale / 100) * 0.5) *
      Math.max(0.25, sourcePower.supply) * Math.min(1, strategicFactor(n) / (op.materialFactor || 1));
  const recentWarning = enemy.contacts.some(
      (x) =>
        x.nation === a &&
        campaignMinutes(s) - x.seenAt < 360 &&
        distanceNm(x.position, op.position) < 120,
    ),
    surprise = port && !recentWarning ? 1.2 : 1;
  const attack =
    strike *
    12 *
    proficiency *
    survival *
    conditions.launch *
    variation *
    surprise *
    (f?.aggressiveBattle ? 1.4 : 1) * phase.weight;
  const pa = {
    surface: 0,
    air: attack,
    sub: 0,
    asw: 0,
    aa: escorts * 2,
    scout: 0,
    total: attack,
    ships: 0,
    speed: 0,
    supply: sourcePower.supply,
  };
  pb.air = cap.power * 10;
  pb.surface = 0;
  pb.sub = 0;
  pb.asw = 0;
  pb.total = flak + pb.air;
  const da = damageFleet(
    s,
    c,
    a,
    region,
    0,
    pb,
    "air combat",
    null,
    0.4,
    1,
    [],
  );
  const airProtection =
    op.airWing.reduce(
      (v, w) => v + w.count * aircraftProtection(models.get(w.model)),
      0,
    ) /
    Math.max(
      1,
      op.airWing.reduce((v, w) => v + w.count, 0),
    );
  const airLoss = loseAircraft(
    s,
    c,
    a,
    op,
    airProtection *
      clamp(
        0.025 +
          (capInterception / Math.max(8, strike + escorts)) * 0.14 +
          (flak / Math.max(1500, strike * 80)) * 0.1,
        0.025,
        0.65,
      ) *
      (f?.aggressiveBattle ? 1.15 : 1) * phase.weight,
    { rescue: 0.25, airframeRescue: 0 },
  );
  addAirLoss(da, airLoss);
  let db,
    merchantGRT = 0,
    merchantHulls = 0;
  if (op.targetKind === "convoy") {
    const convoy = enemy.convoys.find((x) => x.id === op.targetId);
    if (!convoy) return null;
    const loss = sinkMerchants(
      s,
      b,
      Math.min(convoy.count, Math.floor(attack / 160 + rng(s))),
      { details: true, convoy },
    );
    merchantHulls = loss.hulls;
    merchantGRT = loss.grt;
    convoy.lastBattle = campaignMinutes(s);
    n.merchantSunk += loss.hulls;
    n.merchantSunkGRT += loss.grt;
    recordWarRaid(s, a, b, loss.grt);
    db = damageFleet(
      s,
      c,
      b,
      region,
      0,
      pa,
      "maritime air attack",
      null,
      0.4,
      1,
      [],
    );
  } else {
    const ships =
        op.operation === "strategic"
          ? []
          : port
            ? anchoredShips(s, c, b, port)
            : null,
      tonnage = port
        ? ships.reduce((v, g) => v + c.classes[g.classId].tons * g.count, 0)
        : fleetStats(s, c, b, target).tons;
    const fraction = clamp(
      (attack / Math.max(2000, tonnage * 0.12)) * 0.32,
      0,
      0.4,
    );
    db = damageFleet(
      s,
      c,
      b,
      region,
      fraction,
      pa,
      port ? "anchorage air strike" : "maritime air strike",
      target?.id || null,
      port ? 0.8 : 0.4,
      1,
      ships,
    );
    addAirLoss(
      db,
      loseCAP(
        s,
        c,
        b,
        cap,
        clamp((escorts / Math.max(5, cap.power)) * 0.08, 0.01, 0.3) * phase.weight,
      ),
    );
  }
  let portDamage = 0;
  if (port) {
    portDamage = damagePort(
      s,
      port,
      clamp((attack / Math.max(4000, shore.combat)) * 0.02, 0, 0.1),
    );
    for (const wings of [
      enemy.airBases[port]?.airWing,
      enemy.airBases[port]?.governmentWing,
    ])
      if (wings)
        addAirLoss(
          db,
          loseAircraft(
            s,
            c,
            b,
            { airWing: wings },
            clamp(attack / 10000, 0, 0.16),
            { rescue: 0.8, airframeRescue: 0.15 },
          ),
        );
  }
  const costA = da.planesLost * 40,
    costB =
      db.tons +
      db.damagedTons * 0.65 +
      db.planesLost * 40 +
      portDamage * 60000 +
      merchantGRT * 0.2,
    winner = costB > costA ? a : b,
    magnitude =
      Math.max(costA, costB) >= Math.max(1000, Math.min(costA, costB) * 2)
        ? "major"
        : "minor";
  const industryRaid = strategicDamage(s, c, a, op, attack);
  const preparation = (id) => ({
    training: s.nations[id].training,
    morale: s.nations[id].morale,
    supply: id === a ? pa.supply : pb.supply,
    crew: 1,
  });
  const report = {
    id: s.nextId++,
    day: s.day,
    minute: campaignMinutes(s),
    kind: port ? "port" : "air",
    industryRaid,
    operation:
      op.operation === "strategic"
        ? "strategic"
        : op.operation === "opening"
          ? "opening"
          : port
            ? "anchorage"
            : "strike",
    portId: port,
    portDamage,
    portHealth: port ? s.ports[port].health : 1,
    portEquivalent: portDamage * 60000,
    position,
    region,
    a,
    b,
    fleetA: f?.id || null,
    fleetB: target?.id || null,
    winner,
    magnitude,
    upset: false,
    upsetSide: null,
    airOperation: {
      source: op.sourcePort
        ? PORTS[op.sourcePort].name
        : f?.name || "Naval strike",
      light: conditions.light,
      weather: conditions.weather,
      strikes: op.strikes,
      escorts: op.escorts,
      cap: cap.count,
      assembly: op.assembly,
      distanceKm: Math.round(distance),
      surprise: surprise > 1,
      merchantHulls,
      merchantGRT,
    },
    powerA: pa,
    powerB: pb,
    effectiveA: attack,
    effectiveB: pb.total,
    variationA: variation,
    variationB: 1,
    resultA: da,
    resultB: db,
    preparationA: preparation(a),
    preparationB: preparation(b),
  };
  return report;
}
