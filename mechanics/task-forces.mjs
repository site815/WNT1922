import { syncConvoys, moveConvoys, merchantLaneNodes } from "./merchant-convoys.mjs";
export { syncConvoys } from "./merchant-convoys.mjs";
import { nationAtWar, recordConvoy } from "./economy-rules.mjs";
import { strategicFactor } from "./strategic-materials.mjs";
import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/task-forces.md");
const ENGAGEMENTS = await readDocument("common/rules/engagements.md");
import { averageMerchantGRT } from "./merchant-economy.mjs";
import {
  activeProvocation,
  opposingProvocations,
  provocationDestination,
  finishProvocation,
  finishIncident,
  expireProvocations,
} from "./provocation.mjs";
import { queueAirStrike } from "./air-operations.mjs";
import {
  airConditions,
  searchSector,
  sectorFactor,
} from "./air-conditions.mjs";
import { assignOpeningBases } from "./opening-bases.mjs";
import { completeScrapping } from "./ship-retirement.mjs";
import {
  escortEligible,
  escortsForConvoy,
  coverageAt,
} from "./convoy-coverage.mjs";
import { aiMission } from "./ai-planning.mjs";
import { organizeSupport, minuteSupport } from "./support-operations.mjs";
import { invalidateSupport } from "./support-effects.mjs";
import { invalidatePorts, portOwner } from "./ports.mjs";
import { portCandidates, PORT_MISSIONS } from "./port-operations.mjs";
import {
  fullyStaffed,
  staffSailors,
  prepareDeparture,
  dockSailors,
  crewEffectiveness,
} from "./ship-staffing.mjs";
import { supplyDetails } from "./logistics.mjs";
import { upgradeLevel, radarLevel } from "./levels.mjs";
import { MISSIONS } from "./missions.mjs";
import { fleetService, PROFILES, submarineAttack } from "./catalog.mjs";
import { campaignMinutes, TICK_MINUTES, periodicTick, travelledThisTick } from "./campaign-clock.mjs";
import {
  NODES,
  AREAS,
  PORTS,
  ISLANDS,
  HOME_PORT,
  DEFAULT_AREA,
  REGION_AREA,
  seaRoute,
  routeLength,
  distanceNm,
  interpolate,
} from "./world.mjs";
import { airPower, loseAircraft } from "./naval-resources.mjs";
export const STRATEGY_REVISION = data.STRATEGY_REVISION;
export const INTELLIGENCE = data.INTELLIGENCE;
export { MISSIONS } from "./missions.mjs";
const roles = data.roles;
const type = (c) =>
  ["SS", "SM"].includes(c.type)
    ? "submarine"
    : ["CV", "CVL"].includes(c.type)
      ? "carrier"
      : ["BB", "BC"].includes(c.type)
        ? "battle"
        : ["CA", "CL"].includes(c.type)
          ? "cruiser"
          : "escort";
const key = (a, b) => [a, b].sort().join("-");
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function operationRandom(s) {
  s.operationsSeed = (Math.imul(s.operationsSeed, 1664525) + 1013904223) >>> 0;
  return s.operationsSeed / 4294967296;
}
const hazards = Float64Array.from(
  { length: 1001 },
  (_, i) => 1 - Math.pow(1 - i / 1000, TICK_MINUTES / 60),
);
const hazard = (perHour) =>
  hazards[Math.max(0, Math.min(1000, Math.round(perHour * 1000)))];
export const availableGroup = (s, g) =>
  ["active", "returning"].includes(g.status) &&
  g.count > 0 &&
  (g.atSea || g.sailors > 0) &&
  !(g.joinAt > campaignMinutes(s));
export const fleetGroups = (s, id, fleetId) =>
  s.nations[id].groups.filter((g) => g.fleetId === fleetId);
const routeCache = new WeakMap();
export function fleetPosition(s, f, minute = campaignMinutes(s)) {
  if (!f.route?.length) return f.position || NODES[f.port] || [0, 0];
  if (minute >= f.arriveAt || f.route.length === 1) return [...f.route.at(-1)];
  let cached = routeCache.get(f);
  if (!cached || cached.route !== f.route) {
    const lengths = [],
      ends = [];
    let sum = 0;
    for (let i = 1; i < f.route.length; i++) {
      const d = distanceNm(f.route[i - 1], f.route[i]);
      lengths.push(d);
      sum += d;
      ends.push(sum);
    }
    cached = { route: f.route, lengths, ends };
    routeCache.set(f, cached);
  }
  const travelled = (Math.max(0, minute - f.departAt) * f.speed) / 60;
  let i = 0;
  while (i < cached.ends.length - 1 && travelled > cached.ends[i]) i++;
  return interpolate(
    f.route[i],
    f.route[i + 1],
    clamp(
      (travelled - (cached.ends[i - 1] || 0)) /
        Math.max(0.001, cached.lengths[i]),
      0,
      1,
    ),
  );
}
export const fleetStatus = (s, f) =>
  (f.battleId ? "Engaged in battle" : "") ||
  f.holdReason ||
  (Object.values(s.nations).some((n) =>
    n.groups.some((g) => g.fleetId === f.id && g.scrapOnArrival),
  )
    ? "Returning for scrapping"
    : f.reserveTransfer
      ? "Returning for reserve"
      : f.role === "repair"
        ? "Returning for repair"
        : f.role === "reinforcement"
          ? "Reinforcing"
          : campaignMinutes(s) < f.arriveAt
            ? "Underway"
            : f.phase === "port"
              ? "In port"
              : f.phase === "refuel"
                ? "Refueling"
                : "Patrolling");
export function fleetStats(s, c, id, f) {
  const groups = fleetGroups(s, id, f.id),
    active = groups.filter((g) => availableGroup(s, g)),
    tech = s.nations[id].tech;
  let hulls = 0,
    tons = 0,
    speed = 50,
    range = 100000,
    air = 0,
    scouts = 0,
    fighters = 0,
    submarines = 0,
    subAttack = 0,
    surface = 0,
    asw = 0,
    radar = false,
    airRadius = 0,
    health = 0;
  for (const g of active) {
    const cl = c.classes[g.classId],
      a = airPower(s, c, id, g),
      effective = g.count * g.health * crewEffectiveness(g, cl) * strategicFactor(s.nations[id]),
      sub = type(cl) === "submarine";
    hulls += g.count;
    tons += cl.tons * g.count;
    speed = Math.min(speed, cl.speed || 12);
    range = Math.min(range, (cl.range || 3000) / 1.852);
    air += a.strike * g.health * strategicFactor(s.nations[id]);
    fighters += a.fighters * g.health * strategicFactor(s.nations[id]);
    scouts += a.scout * g.health * strategicFactor(s.nations[id]);
    airRadius = Math.max(airRadius, a.radius);
    radar ||= cl.radar;
    submarines += sub ? g.count : 0;
    subAttack += submarineAttack(cl) * 0.2 * effective;
    surface += sub
      ? 0
      : (cl.raw?.features?.includes("director") ? 1.05 : 1) *
        (cl.barrels * (cl.caliber / 100) ** 1.75 + cl.tubes) *
        effective *
        (1 + upgradeLevel(tech, "gunnery") * 0.03);
    asw +=
      !sub && ["DD", "DE", "DL", "CL", "CA", "TB"].includes(cl.type)
        ? (cl.sonar ? 32 : 8) *
          effective *
          (1 + upgradeLevel(tech, "asw") * 0.1)
        : 0;
    health += g.health * g.count;
  }
  return {
    groups,
    active,
    hulls,
    tons,
    maxSpeed: hulls ? speed * strategicFactor(s.nations[id]) : 0,
    speed: hulls ? Math.max(1, speed * 0.7 * strategicFactor(s.nations[id])) : 10,
    range: hulls ? range : 2000,
    air,
    fighters,
    scouts,
    airRadius,
    radar,
    submarines,
    subAttack,
    surface,
    asw,
    health: health / Math.max(1, hulls),
    joining: 0,
  };
}
export function convoyCombatPower(s, c, row) {
  const n = s.nations[row.id],
    st = row.stats,
    preparation =
      (0.5 + n.training * 0.0065) *
      (0.65 + n.morale * 0.005) *
      supplyDetails(s, c, row.id, row.f).factor;
  return {
    attack:
      Math.max(0, st.subAttack + st.surface * 0.15 + st.air * 10) * preparation,
    defense: (st.asw + st.surface * 0.15) * preparation,
  };
}
export function convoyCoverage(s, c, id = s.player) {
  const n = s.nations[id],
    escorts = n.fleets
      .filter((f) => escortEligible({ kind: "fleet", f }))
      .map((f) => ({
        id: f.id,
        name: f.name,
        position: fleetPosition(s, f),
        defense: convoyCombatPower(s, c, {
          id,
          f,
          stats: fleetStats(s, c, id, f),
        }).defense,
      }))
      .filter((e) => e.defense > 0);
  return {
    escorts,
    convoys: n.convoys
      .filter((v) => v.count > 0)
      .map((v) => ({ id: v.id, ...coverageAt(escorts, fleetPosition(s, v)) })),
  };
}
function splitHulls(n) {
  const extra = [];
  for (const g of n.groups) {
    if (
      g.service !== "warship" ||
      g.count <= 1 ||
      ["building", "trials", "converting", "sunk", "scrapped"].includes(
        g.status,
      )
    )
      continue;
    const count = g.count,
      names = g.shipNames || [],
      source = g.sourceGroup || g.id,
      wings = structuredClone(g.airWing || []),
      paid = { ...g.paid },
      sailors = g.sailors || 0;
    // Continue the distribution cursor across models. Rounding every model
    // toward hull one can exceed that hull's hangar while other ships have room.
    const allocation = Array.from({ length: count }, () => []);
    let cursor = 0;
    for (const w of wings) {
      for (let i = 0; i < count; i++) {
        const offset = (i - (cursor % count) + count) % count,
          planes =
            Math.floor(w.count / count) + (offset < w.count % count ? 1 : 0),
          crewed =
            Math.floor((w.crewed || 0) / count) +
            (offset < (w.crewed || 0) % count ? 1 : 0);
        if (planes) allocation[i].push({ ...w, count: planes, crewed });
      }
      cursor += w.count;
    }
    for (let i = 0; i < count; i++) {
      const ship = i === 0 ? g : structuredClone(g);
      ship.id = i === 0 ? source : `${source}#${i + 1}`;
      ship.sourceGroup = source;
      ship.count = 1;
      ship.name =
        names[i] ||
        `${g.baseName || g.name.replace(/ · Hull \d+$/, "")} · Hull ${String(i + 1).padStart(2, "0")}`;
      ship.baseName = g.baseName || g.name.replace(/ · Hull \d+$/, "");
      ship.paid = {
        ...paid,
        gold: (paid.gold || 0) / count,
        influence: (paid.influence || 0) / count,
        industry: (paid.industry || 0) / count,
      };
      ship.airWing = allocation[i];
      ship.sailors =
        Math.floor(sailors / count) + (i < sailors % count ? 1 : 0);
      delete ship.shipNames;
      if (i) extra.push(ship);
    }
  }
  n.groups.push(...extra);
}
function makeFleet(s, id, role, index, port, position, mission) {
  const now = campaignMinutes(s);
  return {
    id: `tf-${id}-${s.nextId++}`,
    name: `${roles[role]} ${index}`,
    role,
    mission,
    manual: false,
    aggressiveBattle: false,
    port,
    node: port,
    targetNode: port,
    route: [[...position]],
    departAt: now,
    arriveAt: now,
    speed: 10,
    phase: "port",
    nextPlanAt: now + index * 3,
    lastBattle: -1e9,
    fuelNm: 20000,
    maxRangeNm: 20000,
    range: 20000,
    area: DEFAULT_AREA[id],
    salt: index,
  };
}
function closeNode(position) {
  return Object.keys(NODES).reduce((a, b) =>
    distanceNm(NODES[b], position) < distanceNm(NODES[a], position) ? b : a,
  );
}
export function initializeOperations(s, c) {
  if (s.strategyRevision === STRATEGY_REVISION) return s;
  s.operationsSeed ??= (s.seed ^ 0x51c017) >>> 0;
  for (const [id, n] of Object.entries(s.nations)) {
    const oldFleets = n.fleets || [],
      origins = new Map();
    splitHulls(n);
    staffSailors(s, c, id);
    if (id === "USA" && !oldFleets.length) {
      const counters = {};
      for (const g of [...n.groups].sort(
        (a, b) => c.classes[b.classId].year - c.classes[a.classId].year,
      )) {
        if (
          g.service !== "warship" ||
          g.dockPort ||
          !["active", "returning"].includes(g.status)
        )
          continue;
        const role = type(c.classes[g.classId]),
          i = counters[role] || 0;
        counters[role] = i + 1;
        g.region = i % 3 === 2 ? "atlantic" : "pacific";
      }
    }
    const usable = n.groups.filter(
      (g) =>
        g.service === "warship" &&
        ["active", "returning"].includes(g.status) &&
        g.count &&
        (g.atSea || fullyStaffed(g, c.classes[g.classId])),
    );
    for (const g of usable) {
      const old = oldFleets.find((f) => f.id === g.fleetId),
        eastern =
          id === "GBR" && ["h-hms_barham", "h-hms_malaya"].includes(g.id);
      const port =
        old?.port ||
        g.dockPort ||
        (eastern
          ? "singapore"
          : id === "USA" && g.region === "atlantic"
            ? "norfolk"
            : HOME_PORT[id]);
      const position = old ? fleetPosition(s, old) : NODES[port],
        inPort = distanceNm(position, NODES[port]) < 25;
      const key = inPort ? port : old?.id || port;
      if (!origins.has(key))
        origins.set(key, {
          port,
          position: inPort ? NODES[port] : position,
          members: [],
          old,
        });
      origins.get(key).members.push(g);
    }
    n.fleets = [];
    n.contacts = [];
    n.convoys = [];
    let sequence = 0;
    for (const origin of origins.values()) {
      const buckets = {
        carrier: [],
        battle: [],
        cruiser: [],
        escort: [],
        submarine: [],
      };
      for (const g of origin.members)
        buckets[type(c.classes[g.classId])].push(g);
      for (const [role, rows] of Object.entries(buckets))
        rows.sort((a, b) =>
          role === "submarine"
            ? c.classes[b.classId].range - c.classes[a.classId].range
            : c.classes[b.classId].speed - c.classes[a.classId].speed,
        );
      const localLimit = Math.max(
        2,
        Math.min(
          18 - n.fleets.length,
          origins.size > 1
            ? Math.round((18 * origin.members.length) / usable.length)
            : Math.ceil(Math.sqrt(origin.members.length)),
        ),
      );
      let local = 0;
      const add = (role, members) => {
        if (!members.length) return;
        const mission = origin.old?.mission || "presence";
        const f = makeFleet(
          s,
          id,
          role,
          ++sequence,
          origin.port,
          origin.position,
          mission,
        );
        n.fleets.push(f);
        local++;
        f.manual = origin.old?.manual || false;
        f.aggressiveBattle = false;
        for (const g of members) {
          g.fleetId = f.id;
          delete g.joinAt;
          delete g.joinArea;
          delete g.destination;
          delete g.transitUntil;
        }
        const st = fleetStats(s, c, id, f);
        f.speed = st.speed;
        f.maxRangeNm = st.range;
        f.fuelNm = Math.min(origin.old?.fuelNm ?? st.range, st.range);
        f.node = closeNode(origin.position);
        f.targetNode = f.node;
        f.phase =
          distanceNm(origin.position, NODES[origin.port]) < 25
            ? "port"
            : "patrol";
        return f;
      };
      const escorts = (cap, cruisers) => [
        ...buckets.cruiser.splice(0, cruisers),
        ...buckets.escort.splice(0, cap),
      ];
      while (buckets.carrier.length && local < Math.max(1, localLimit - 1))
        add("carrier", [...buckets.carrier.splice(0, 2), ...escorts(6, 2)]);
      while (buckets.battle.length && local < Math.max(1, localLimit - 1))
        add("battle", [...buckets.battle.splice(0, 4), ...escorts(4, 1)]);
      const remaining = Math.max(1, localLimit - local),
        needs = {
          submarine: buckets.submarine.length / 14,
          cruiser: buckets.cruiser.length / 6,
          escort: buckets.escort.length / 18,
        },
        total = Object.values(needs).reduce((v, x) => v + x, 0);
      let subSlots = buckets.submarine.length
        ? Math.max(
            1,
            Math.min(
              remaining - Number(!!needs.cruiser) - Number(!!needs.escort),
              Math.round((remaining * needs.submarine) / total),
            ),
          )
        : 0;
      while (buckets.submarine.length && subSlots > 0) {
        add(
          "submarine",
          buckets.submarine.splice(
            0,
            Math.ceil(buckets.submarine.length / subSlots),
          ),
        );
        subSlots--;
      }
      let cruiserSlots = buckets.cruiser.length
        ? Math.max(
            1,
            Math.min(
              localLimit - local - Number(!!buckets.escort.length),
              Math.round(
                ((localLimit - local) * needs.cruiser) /
                  Math.max(1, needs.cruiser + needs.escort),
              ),
            ),
          )
        : 0;
      while (buckets.cruiser.length && cruiserSlots > 0) {
        add("cruiser", [
          ...buckets.cruiser.splice(
            0,
            Math.ceil(buckets.cruiser.length / cruiserSlots),
          ),
          ...buckets.escort.splice(0, 4),
        ]);
        cruiserSlots--;
      }
      while (buckets.escort.length && local < localLimit)
        add(
          "escort",
          buckets.escort.splice(
            0,
            Math.max(
              4,
              Math.ceil(
                buckets.escort.length / Math.max(1, localLimit - local),
              ),
            ),
          ),
        );
      for (const [role, rows] of Object.entries(buckets))
        if (rows.length) {
          const samePlace = n.fleets.filter(
              (f) => distanceNm(fleetPosition(s, f), origin.position) < 1,
            ),
            f =
              samePlace.find((f) => f.role === role) ||
              (["escort", "cruiser"].includes(role)
                ? samePlace.find((f) => f.role !== "submarine")
                : null);
          if (!f) add(role, rows);
          else for (const g of rows) g.fleetId = f.id;
        }
      if (n.fleets.length === 1 && origins.size === 1 && usable.length > 1) {
        const f = n.fleets[0],
          members = fleetGroups(s, id, f.id),
          half = members.slice(Math.ceil(members.length / 2));
        if (
          members.every((g) => type(c.classes[g.classId]) === f.role) &&
          !["carrier", "battle"].includes(f.role)
        )
          add(f.role, half);
      }
    }
    for (const f of n.fleets) {
      const st = fleetStats(s, c, id, f);
      f.speed = st.speed;
      f.maxRangeNm = st.range;
      f.fuelNm = Math.min(f.fuelNm, st.range);
    }
    for (const g of n.groups) if (!usable.includes(g)) delete g.fleetId;
    if (!oldFleets.length) assignOpeningBases(s, c, id);
    initializeConvoys(s, c, id);
    balanceScreens(s, c, id);
  }
  s.strategyRevision = STRATEGY_REVISION;
  for (const [observer, n] of Object.entries(s.nations))
    for (const [id, foreign] of Object.entries(s.nations))
      if (id !== observer)
        for (const f of foreign.fleets) {
          const stats = fleetStats(s, c, id, f);
          if (stats.hulls)
            recordContact(
              s,
              observer,
              id,
              f,
              fleetPosition(s, f),
              stats,
              "Port report",
              48 * 60,
            );
        }
  invalidateOperations(s);
  return s;
}
export function screenRequirement(s, c, id, f) {
  const core = fleetGroups(s, id, f.id)
    .filter(
      (g) => g.status === "active" && type(c.classes[g.classId]) === f.role,
    )
    .reduce((v, g) => v + g.count, 0);
  return f.role === "carrier"
    ? Math.min(6, 2 + Math.ceil(core / 2))
    : f.role === "battle"
      ? Math.min(5, 1 + Math.ceil(core / 3))
      : 0;
}
export function screenStrength(s, c, id, f) {
  return fleetGroups(s, id, f.id)
    .filter(
      (g) => g.status === "active" && fullyStaffed(g, c.classes[g.classId]),
    )
    .reduce(
      (v, g) =>
        v +
        g.count *
          (type(c.classes[g.classId]) === "escort"
            ? 1
            : c.classes[g.classId].type === "CL"
              ? 0.5
              : 0),
      0,
    );
}
export function balanceScreens(s, c, id) {
  if (s.nations[id].fleets.some(f=>f.battleId)) return;
  const n = s.nations[id];
  for (const f of n.fleets.filter((f) =>
    ["carrier", "battle"].includes(f.role),
  )) {
    if (!n.fleets.includes(f)) continue;
    const groups = fleetGroups(s, id, f.id),
      escorts = screenStrength(s, c, id, f),
      need = Math.ceil(Math.max(0, screenRequirement(s, c, id, f) - escorts));
    f.needsEscorts = need;
    if (!need || !["port", "refuel"].includes(f.phase)) continue;
    const nearby = n.fleets.filter(
      (x) =>
        x.role === "escort" &&
        !activeProvocation(s, id, x.id) &&
        ["port", "refuel"].includes(x.phase) &&
        x.port === f.port,
    );
    let moved = 0;
    for (const donor of nearby)
      for (const g of fleetGroups(s, id, donor.id).sort(
        (a, b) => c.classes[b.classId].speed - c.classes[a.classId].speed,
      )) {
        if (moved >= need) break;
        if (
          g.status === "active" &&
          fullyStaffed(g, c.classes[g.classId]) &&
          type(c.classes[g.classId]) === "escort"
        ) {
          g.fleetId = f.id;
          moved++;
        }
      }
    f.needsEscorts = Math.max(0, need - moved);
    // Share an escort screen at the same anchorage instead of leaving several small groups idle.
    while (f.needsEscorts && !activeProvocation(s, id, f.id)) {
      const donor = n.fleets.find(
        (x) =>
          x !== f &&
          x.role === f.role &&
          !x.manual &&
          !x.pacificTarget &&
          !activeProvocation(s, id, x.id) &&
          ["port", "refuel"].includes(x.phase) &&
          x.port === f.port &&
          !(n.airSorties || []).some((o) => o.fleetId === x.id) &&
          fleetGroups(s, id, x.id).some((g) => g.status === "active") &&
          fleetGroups(s, id, x.id)
            .concat(fleetGroups(s, id, f.id))
            .filter((g) => type(c.classes[g.classId]) === f.role)
            .reduce((v, g) => v + g.count, 0) <= (f.role === "carrier" ? 4 : 8),
      );
      if (!donor) break;
      for (const g of fleetGroups(s, id, donor.id)) g.fleetId = f.id;
      for (const transfer of n.fleets)
        if (transfer.reinforceTo === donor.id) transfer.reinforceTo = f.id;
      n.fleets = n.fleets.filter((x) => x !== donor);
      invalidateOperations(s);
      f.needsEscorts = Math.ceil(
        Math.max(
          0,
          screenRequirement(s, c, id, f) - screenStrength(s, c, id, f),
        ),
      );
      f.holdReason = f.needsEscorts
        ? "Consolidating escorts"
        : "Consolidated with " + donor.name;
      f.nextPlanAt = campaignMinutes(s);
    }
    if (f.needsEscorts && !n.fleets.some((x) => x.reinforceTo === f.id)) {
      const donor = n.fleets.find(
        (x) =>
          x.role === "escort" &&
          !activeProvocation(s, id, x.id) &&
          ["port", "refuel"].includes(x.phase) &&
          fleetGroups(s, id, x.id).filter(
            (g) =>
              g.status === "active" &&
              fullyStaffed(g, c.classes[g.classId]) &&
              type(c.classes[g.classId]) === "escort",
          ).length >= f.needsEscorts,
      );
      if (donor) {
        const ships = fleetGroups(s, id, donor.id)
            .filter(
              (g) =>
                g.status === "active" &&
                fullyStaffed(g, c.classes[g.classId]) &&
                type(c.classes[g.classId]) === "escort",
            )
            .sort(
              (a, b) => c.classes[b.classId].range - c.classes[a.classId].range,
            )
            .slice(0, f.needsEscorts),
          transfer = makeFleet(
            s,
            id,
            "reinforcement",
            n.fleets.length + 1,
            donor.port,
            fleetPosition(s, donor),
            "guard",
          );
        transfer.reinforceTo = f.id;
        transfer.destinationPort = f.port;
        for (const g of ships) g.fleetId = transfer.id;
        n.fleets.push(transfer);
        const st = fleetStats(s, c, id, transfer);
        transfer.maxRangeNm = st.range;
        transfer.fuelNm = st.range;
        const next = nextSupplyLeg(s, id, transfer, f.port);
        if (next) setRoute(s, c, id, transfer, next, { phase: "reinforcing" });
        else {
          for (const g of ships) g.fleetId = donor.id;
          n.fleets = n.fleets.filter((x) => x !== transfer);
        }
      }
    }
  }
}
export function usablePorts(s, id) {
  return Object.keys(PORTS).filter((k) => {
    const owner = s.world?.portControl?.[k] || PORTS[k].nation,
      r = s.relations[key(id, owner)];
    return owner === id || (r?.allied && !r.war);
  });
}
export function plannedRoute(s, f, target, position = null) {
  if (!NODES[target]) return [];
  const now = campaignMinutes(s),
    pos = position || fleetPosition(s, f);
  let start = f.node || closeNode(pos);
  if (now < f.arriveAt) {
    let d = (Math.max(0, now - f.departAt) * f.speed) / 60;
    for (let i = 1; i < f.route.length; i++) {
      const leg = distanceNm(f.route[i - 1], f.route[i]);
      if (d <= leg) {
        start =
          Object.keys(NODES).find(
            (k) =>
              NODES[k][0] === f.route[i][0] && NODES[k][1] === f.route[i][1],
          ) || closeNode(f.route[i]);
        break;
      }
      d -= leg;
    }
  } else start = closeNode(pos);
  return [pos, ...seaRoute(start, target).map((k) => NODES[k])];
}
function holdPosition(s, id, f, reason) {
  const now = campaignMinutes(s),
    pos = fleetPosition(s, f),
    port = usablePorts(s, id).find((k) => distanceNm(pos, NODES[k]) < 1);
  f.route = [pos];
  f.departAt = f.arriveAt = now;
  f.phase = port ? "port" : "patrol";
  if (port) {
    f.port = port;
    f.node = f.targetNode = port;
  }
  f.holdReason = reason;
  f.nextPlanAt = now + 360;
  routeCache.delete(f);
  invalidateOperations(s);
}
export function setRoute(
  s,
  c,
  id,
  f,
  target,
  { phase = "passage", position = null } = {},
) {
  if (f.battleId) return false;
  if (!NODES[target]) throw new Error("Choose a valid naval destination.");
  const now = campaignMinutes(s),
    points = plannedRoute(s, f, target, position),
    atPort = ["port", "refuel"].includes(f.phase),
    distance = routeLength(points),
    initial = fleetStats(s, c, id, f);
  f.maxRangeNm = initial.range;
  f.fuelNm = Math.min(f.fuelNm, initial.range);
  if (distance > f.fuelNm + 0.05) {
    holdPosition(s, id, f, "Holding: insufficient fuel for a safe route");
    return false;
  }
  if (distance < 0.01) {
    const port = usablePorts(s, id).includes(target);
    f.route = [points[0]];
    f.departAt = f.arriveAt = now;
    f.node = f.targetNode = target;
    f.phase = ["returning", "reinforcing"].includes(phase)
      ? phase
      : port
        ? "refuel"
        : "patrol";
    f.nextPlanAt = now + (port ? 720 : 360);
    if (port) {
      f.port = target;
      dockSailors(s, c, id, f);
    }
    routeCache.delete(f);
    return true;
  }
  if (
    atPort &&
    distance > 1 &&
    ["carrier", "battle"].includes(f.role) &&
    f.needsEscorts
  ) {
    holdPosition(s, id, f, "Holding for an adequate escort screen");
    return false;
  }
  if (atPort && !prepareDeparture(s, c, id, f)) {
    holdPosition(s, id, f, "Holding for complete crews");
    return false;
  }
  if (atPort && distance > 1 && ["carrier", "battle"].includes(f.role)) {
    const screen = fleetGroups(s, id, f.id).filter(
      (g) =>
        g.status === "active" &&
        type(c.classes[g.classId]) === "escort" &&
        fullyStaffed(g, c.classes[g.classId]),
    ).length;
    if (screenStrength(s, c, id, f) < screenRequirement(s, c, id, f)) {
      for (const g of fleetGroups(s, id, f.id)) g.atSea = false;
      holdPosition(s, id, f, "Holding for an adequate escort screen");
      return false;
    }
  }
  delete f.holdReason;
  const stats = fleetStats(s, c, id, f);
  f.speed =
    f.role === "repair"
      ? Math.max(3, stats.speed * clamp(stats.health, 0.3, 1))
      : stats.speed;
  f.materialFactor = strategicFactor(s.nations[id]);
  f.route = points;
  f.departAt = now;
  f.arriveAt = now + (routeLength(points) / Math.max(3, f.speed)) * 60;
  f.targetNode = target;
  f.node = target;
  if (usablePorts(s, id).includes(target)) f.port = target;
  f.phase = phase;
  f.nextPlanAt = f.arriveAt + 180;
  const nearest = Object.values(AREAS).reduce((a, b) =>
    distanceNm(a.point, NODES[target]) < distanceNm(b.point, NODES[target])
      ? a
      : b,
  );
  f.area = nearest.id;
  for (const g of fleetGroups(s, id, f.id)) g.region = nearest.region;
  routeCache.delete(f);
  invalidateOperations(s);
  return true;
}
const distanceCache = new Map();
function sailingDistance(a, b) {
  const key = a + ":" + b;
  if (!distanceCache.has(key))
    distanceCache.set(key, routeLength(seaRoute(a, b).map((k) => NODES[k])));
  return distanceCache.get(key);
}
export function nextSupplyLeg(s, id, f, target) {
  if (!NODES[target]) return null;
  const start = closeNode(fleetPosition(s, f)),
    ports = usablePorts(s, id),
    nodes = [...new Set([start, ...ports, target])],
    cost = { [start]: 0 },
    previous = {},
    todo = new Set(nodes);
  if (start === target)
    return routeLength(plannedRoute(s, f, target)) <= f.fuelNm * 0.9
      ? target
      : null;
  while (todo.size) {
    const at = [...todo].reduce((a, b) =>
      (cost[a] ?? Infinity) < (cost[b] ?? Infinity) ? a : b,
    );
    todo.delete(at);
    if (!Number.isFinite(cost[at]) || at === target) break;
    for (const next of nodes) {
      if (next === at || !todo.has(next)) continue;
      const distance =
          at === start
            ? routeLength(plannedRoute(s, f, next))
            : sailingDistance(at, next),
        budget = (at === start ? f.fuelNm : f.maxRangeNm) * 0.9;
      const reserve =
        next === target && !ports.includes(next)
          ? Math.min(...ports.map((port) => sailingDistance(next, port)))
          : 0;
      if (distance + reserve > budget) continue;
      if (cost[at] + distance < (cost[next] ?? Infinity)) {
        cost[next] = cost[at] + distance;
        previous[next] = at;
      }
    }
  }
  if (!Number.isFinite(cost[target])) return null;
  if (target === start) return target;
  let next = target;
  while (previous[next] && previous[next] !== start) next = previous[next];
  return next;
}
function chooseDestination(s, c, id, f) {
  const n = s.nations[id],
    ports = usablePorts(s, id),
    position = fleetPosition(s, f),
    current = closeNode(position),
    base = ports.length
      ? ports.reduce((a, b) =>
          sailingDistance(current, a) < sailingDistance(current, b) ? a : b,
        )
      : HOME_PORT[id];
  const remainingHome = sailingDistance(current, base),
    waiting = n.fleets.find(
      (x) => x.reinforceTo === f.id && x.phase === "port",
    );
  if (
    PORT_MISSIONS.includes(f.mission) &&
    PORTS[f.objectiveNode] &&
    !s.relations[key(id, portOwner(s, f.objectiveNode))]?.war
  )
    delete f.objectiveNode;
  if (
    f.fuelNm < remainingHome * 1.2 + 180 ||
    f.role === "repair" ||
    f.needsEscorts ||
    waiting
  ) {
    f.port = waiting ? waiting.port : base;
    return nextSupplyLeg(s, id, f, f.port) || base;
  }
  if (f.pacificStage) {
    const next = nextSupplyLeg(s, id, f, f.pacificStage);
    if (next) return next;
  }
  const demonstration = provocationDestination(s, id, f);
  if (demonstration) return demonstration;
  const war = Object.values(s.relations).some(
    (r) => r.war && [r.a, r.b].includes(id),
  );
  if (!war) {
    delete f.objectiveNode;
    f.aggressiveBattle = false;
    // Most peacetime days are spent maintaining ships in port. Short local
    // exercises keep the force near its assigned station, never a global raid.
    const duty =
      (((Math.floor(campaignMinutes(s) / 1440) + f.salt) % 10) + 10) % 10;
    if ((duty < 7 && !f.manual) || f.phase === "patrol")
      return nextSupplyLeg(s, id, f, f.port) || base;
    const local = Object.keys(NODES)
      .filter(
        (k) =>
          !PORTS[k] &&
          sailingDistance(f.port, k) < Math.min(350, f.maxRangeNm * 0.15),
      )
      .sort((a, b) => sailingDistance(f.port, a) - sailingDistance(f.port, b));
    for (const node of local) {
      const leg = nextSupplyLeg(s, id, f, node);
      if (leg) return leg;
    }
    return base;
  }
  if (f.raidingReturn) {
    if (current !== f.port) return nextSupplyLeg(s, id, f, f.port) || f.port;
    delete f.raidingReturn;
  }
  if (
    ISLANDS.some((i) => i.node === current) &&
    f.objectiveNode === current &&
    ["presence", "decisive", "siege"].includes(f.mission) &&
    s.relations[key(id, portOwner(s, current))]?.war
  )
    return current;
  if (f.objectiveNode && f.objectiveNode !== current) {
    const next = nextSupplyLeg(s, id, f, f.objectiveNode);
    if (next) return next;
  }
  const wars = Object.values(s.relations)
    .filter((r) => r.war && [r.a, r.b].includes(id))
    .map((r) => (r.a === id ? r.b : r.a));
  let candidates = [];
  if (PORT_MISSIONS.includes(f.mission))
    candidates = portCandidates(s, c, id, f);
  else if (f.mission === "guard")
    candidates = n.convoys
      .filter((v) => v.count)
      .map((v) => closeNode(fleetPosition(s, v, campaignMinutes(s) + 360)));
  else if (f.mission === "decisive")
    candidates = visibleContacts(s, id)
      .filter(
        (x) =>
          wars.includes(x.nation) &&
          x.kind !== "Merchant convoy" &&
          x.hours < 48,
      )
      .map((x) => closeNode(x.position));
  else if (f.mission === "raid")
    candidates = visibleContacts(s, id)
      .filter(
        (x) =>
          wars.includes(x.nation) &&
          x.kind === "Merchant convoy" &&
          x.hours < 72,
      )
      .map((x) => closeNode(x.position));
  if (["presence", "decisive"].includes(f.mission) && f.role !== "submarine") {
    const fronts = (s.world?.fronts || []).filter(
      (x) =>
        x.island &&
        [x.attacker, x.defender].includes(id) &&
        s.relations[key(x.attacker, x.defender)]?.war,
    );
    const objectives = fronts
      .filter(
        (x) =>
          portOwner(s, x.port) !== id || (x.progress > 0 && x.progress < 1),
      )
      .map((x) => x.port)
      .sort(
        (a, b) =>
          distanceNm(position, NODES[a]) - distanceNm(position, NODES[b]),
      );
    if (objectives.length && (f.mission === "presence" || !candidates.length))
      candidates = objectives;
  }
  if (!candidates.length && !PORT_MISSIONS.includes(f.mission))
    candidates = (wars.length ? wars : [id]).flatMap(enemy => merchantLaneNodes(s,enemy));
  candidates = [...new Set(candidates)]
    .filter(
      (k) =>
        NODES[k] &&
        k !== current &&
        (PORT_MISSIONS.includes(f.mission) ||
          !PORTS[k] ||
          ports.includes(k) ||
          (["presence", "decisive"].includes(f.mission) &&
            s.world?.fronts.some(
              (front) =>
                front.island &&
                front.port === k &&
                [front.attacker, front.defender].includes(id),
            ))),
    )
    .sort((a, b) => sailingDistance(current, a) - sailingDistance(current, b));
  if (PORT_MISSIONS.includes(f.mission) && !candidates.length) {
    f.port = base;
    delete f.objectiveNode;
    return base;
  }
  const index = PORT_MISSIONS.includes(f.mission)
      ? 0
      : f.salt + Math.floor(campaignMinutes(s) / 1440),
    local = Math.min(3, candidates.length),
    offset = ((index % local) + local) % local;
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[(offset + i) % candidates.length],
      next = nextSupplyLeg(s, id, f, candidate);
    if (next) {
      f.objectiveNode = candidate;
      return next;
    }
  }
  f.port = base;
  delete f.objectiveNode;
  return base;
}
export function orderFleet(
  s,
  c,
  fleetId,
  mission,
  unusedArea = null,
  id = s.player,
  { manual = true, aggressiveBattle = false } = {},
) {
  const f = s.nations[id]?.fleets.find((f) => f.id === fleetId);
  if (
    !f ||
    !MISSIONS[mission] ||
    ["repair", "reinforcement", "support"].includes(f.role)
  )
    throw new Error("Choose an operational task force and a mission.");
  const blocked = fleetMissionBlock(s, c, id, f, mission);
  if (blocked) throw new Error(blocked);
  const demonstration = activeProvocation(s, id, f.id);
  if (demonstration) finishProvocation(s, demonstration);
  delete f.pacificTarget;
  delete f.pacificStage;
  f.mission = mission;
  f.manual = manual;
  f.aggressiveBattle = !!aggressiveBattle;
  delete f.raidingReturn;
  delete f.nextPortAction;
  delete f.objectiveNode;
  setRoute(s, c, id, f, chooseDestination(s, c, id, f));
  return f;
}
export function fleetMissionBlock(s, c, id, f, mission) {
  if (f.battleId) return "Orders can be changed after this battle disengages.";
  if (
    ["raid", "decisive", "anchorage", "siege"].includes(mission) &&
    !Object.values(s.relations).some((r) => r.war && [r.a, r.b].includes(id))
  )
    return "Available during war. Use Diplomacy to send a peacetime provocation.";
  return PORT_MISSIONS.includes(mission) &&
    fleetStats(s, c, id, f).active.every((g) =>
      ["SS", "SM"].includes(c.classes[g.classId].type),
    )
    ? "Submarines cannot bombard a port or strike an anchorage. Choose reconnaissance or commerce raiding."
    : "";
}
export function applyStandingOrders(s, c, id) {
  const n = s.nations[id];
  for (const f of n.fleets || []) {
    if (
      f.manual ||
      f.pacificTarget ||
      ["repair", "reinforcement", "support"].includes(f.role)
    )
      continue;
    const mission = aiMission(s, id, f);
    if (f.mission !== mission) {
      f.mission = mission;
      delete f.objectiveNode;
      delete f.raidingReturn;
      delete f.nextPortAction;
      f.nextPlanAt = campaignMinutes(s);
    }
  }
}
export function commissionToFleet(s, c, id, g) {
  const n = s.nations[id];
  if (g.service === "support") {
    const old = n.fleets.find((f) => f.id === g.fleetId);
    if (old?.role === "repair") {
      g.dockPort = old.port;
      delete g.fleetId;
    }
    return;
  }
  if (g.service !== "warship") return;
  if (
    g.fleetId &&
    n.fleets.some((f) => f.id === g.fleetId && f.role !== "repair")
  )
    return;
  if (g.fleetId) {
    g.dockPort = n.fleets.find((f) => f.id === g.fleetId)?.port || g.dockPort;
    delete g.fleetId;
  }
  splitHulls(n);
  staffSailors(s, c, id);
  const members = n.groups.filter(
    (x) =>
      x.status === "active" &&
      !x.fleetId &&
      x.service === "warship" &&
      fullyStaffed(x, c.classes[x.classId]),
  );
  for (const ship of members) {
    const role = type(c.classes[ship.classId]),
      port = ship.dockPort || HOME_PORT[id];
    const operational = n.fleets.filter(
      (f) => !f.battleId && !["repair", "reinforcement", "support"].includes(f.role),
    );
    const compatible = (f) =>
      role !== "submarine" ||
      Math.max(f.maxRangeNm, (c.classes[ship.classId].range || 3000) / 1.852) /
        Math.max(
          1,
          Math.min(
            f.maxRangeNm,
            (c.classes[ship.classId].range || 3000) / 1.852,
          ),
        ) <
        2;
    let f = operational.find(
      (f) =>
        f.role === role &&
        compatible(f) &&
        ["port", "refuel"].includes(f.phase) &&
        distanceNm(fleetPosition(s, f), NODES[port]) < 25,
    );
    if (!f) {
      const target = operational
        .filter((f) => f.role === role && compatible(f))
        .sort(
          (a, b) =>
            fleetGroups(s, id, a.id).length - fleetGroups(s, id, b.id).length,
        )[0];
      if (
        !target ||
        (operational.length <
          Math.min(
            18,
            Math.max(
              2,
              Math.ceil(
                Math.sqrt(n.groups.filter((g) => g.status === "active").length),
              ),
            ),
          ) &&
          !operational.some((f) => f.role === role && compatible(f)))
      ) {
        f = makeFleet(
          s,
          id,
          role,
          n.fleets.length + 1,
          port,
          NODES[port],
          Object.values(s.relations).some(
            (r) => r.war && [r.a, r.b].includes(id),
          )
            ? role === "submarine"
              ? "raid"
              : "guard"
            : "presence",
        );
        n.fleets.push(f);
      } else {
        f = n.fleets.find(
          (f) =>
            f.role === "reinforcement" &&
            f.reinforceTo === target.id &&
            f.phase === "port" &&
            f.port === port,
        );
        if (!f) {
          f = makeFleet(
            s,
            id,
            "reinforcement",
            n.fleets.length + 1,
            port,
            NODES[port],
            "guard",
          );
          f.reinforceTo = target.id;
          f.destinationPort = target.port;
          n.fleets.push(f);
        }
      }
    }
    ship.fleetId = f.id;
    const st = fleetStats(s, c, id, f);
    f.speed = st.speed;
    f.maxRangeNm = st.range;
    f.fuelNm = st.range;
    if (f.role === "reinforcement" && f.destinationPort !== port) {
      const next = nextSupplyLeg(s, id, f, f.destinationPort);
      if (next) setRoute(s, c, id, f, next, { phase: "reinforcing" });
      else f.nextPlanAt = campaignMinutes(s) + 1440;
    }
  }
  balanceScreens(s, c, id);
  invalidateOperations(s);
}
export function detachRepairs(s, c, id, fleetId, position) {
  const n = s.nations[id],
    members = fleetGroups(s, id, fleetId).filter(
      (g) => g.status === "returning" && g.count,
    );
  if (!members.length) return;
  const source = n.fleets.find((f) => f.id === fleetId);
  const ports = usablePorts(s, id),
    port = ports.length
      ? ports.reduce((a, b) =>
          routeLength(plannedRoute(s, source, b, position)) <
          routeLength(plannedRoute(s, source, a, position))
            ? b
            : a,
        )
      : HOME_PORT[id];
  const survivors = fleetGroups(s, id, fleetId).filter(
    (g) => g.count && ["active", "returning"].includes(g.status),
  );
  const whole =
    source &&
    (source.role === "repair" ||
      survivors.every((g) => g.status === "returning"));
  const f = whole
    ? source
    : makeFleet(
        s,
        id,
        "repair",
        n.fleets.filter((f) => f.role === "repair").length + 1,
        port,
        position,
        "guard",
      );
  if (whole) {
    f.originalRole ??= f.role;
    f.role = "repair";
    f.aggressiveBattle = false;
    f.mission = "guard";
    f.port = port;
  } else n.fleets.push(f);
  f.phase = "returning";
  f.node = closeNode(position);
  for (const g of members) g.fleetId = f.id;
  const escort =
    !whole &&
    fleetGroups(s, id, fleetId).find(
      (g) =>
        g.status === "active" &&
        g.service === "warship" &&
        type(c.classes[g.classId]) === "escort",
    );
  if (escort) escort.fleetId = f.id;
  const stats = fleetStats(s, c, id, f);
  f.maxRangeNm = stats.range;
  f.fuelNm = Math.min(source?.fuelNm ?? stats.range, stats.range);
  f.returnPort = port;
  const leg = nextSupplyLeg(s, id, f, port) || port;
  setRoute(s, c, id, f, leg, { phase: "returning", position });
  invalidateOperations(s);
}
export function merchantCount(s, id) { return s.nations[id].merchant.hulls; }
const initializeConvoys = syncConvoys;
export function sinkMerchants(s, id, count, { details = false, convoy = null } = {}) {
  const n = s.nations[id],
    lost = nationAtWar(s, id) ? Math.max(0, Math.min(Math.floor(count), n.merchant.hulls, convoy?.count ?? Infinity)) : 0,
    grt = lost * averageMerchantGRT(s, id);
  n.merchant.hulls -= lost;
  n.merchantLost += lost;
  n.merchantLostGRT = (n.merchantLostGRT || 0) + grt;
  if (convoy) convoy.count = Math.max(0, convoy.count - lost);
  recordConvoy(s, id, { sunk: grt });
  n.convoyPlanAt = -1e9;
  syncConvoys(s, null, id, { force: true });
  return details ? { hulls: lost, grt } : lost;
}
const contactCache = new WeakMap();
function contactIndex(n) {
  let cache = contactCache.get(n);
  if (
    !cache ||
    cache.array !== n.contacts ||
    cache.length !== n.contacts.length
  ) {
    cache = {
      array: n.contacts,
      length: n.contacts.length,
      map: new Map(n.contacts.map((c) => [c.id, c])),
    };
    contactCache.set(n, cache);
  }
  return cache;
}
export function recordContact(
  s,
  observer,
  id,
  f,
  position,
  stats,
  source = "Scouting",
  age = 0,
) {
  const n = s.nations[observer],
    seenAt = campaignMinutes(s) - age,
    cache = contactIndex(n),
    existing = cache.map.get(f.id);
  if (existing && seenAt - existing.seenAt < 10 && existing.source === source)
    return existing;
  const entry = {
    id: f.id,
    nation: id,
    position: [...position],
    seenAt,
    source,
    estimate: Math.max(
      1,
      Math.round(
        (stats.hulls || f.count || 1) *
          (source === "Scouting" ? 1 : 0.7 + operationRandom(s) * 0.5),
      ),
    ),
    kind: f.id.startsWith("convoy-")
      ? "Merchant convoy"
      : stats.submarines > stats.hulls * 0.5
        ? "Submarine formation"
        : stats.air
          ? "Carrier formation"
          : "Surface formation",
    baseConfidence: source === "Scouting" ? 0.98 : 0.55,
    baseUncertainty: source === "Scouting" ? 8 : 100,
  };
  if (
    existing &&
    seenAt - existing.seenAt < 120 &&
    existing.baseUncertainty < entry.baseUncertainty
  )
    return existing;
  if (existing) {
    if (seenAt - existing.seenAt > INTELLIGENCE.uncertainHours * 60)
      delete existing.dismissedAt;
    Object.assign(existing, entry);
  } else {
    n.contacts.push(entry);
    cache.map.set(f.id, entry);
    cache.length = n.contacts.length;
  }
  return existing || entry;
}
export function visibleContacts(s, id = s.player, minute = campaignMinutes(s)) {
  return (s.nations[id].contacts || [])
    .map((c) => {
      const hours = Math.max(0, (minute - c.seenAt) / 60);
      return {
        ...c,
        position: [...c.position],
        hours,
        stage:
          hours <= 2
            ? "Fresh"
            : hours <= 12
              ? "Recent"
              : hours <= 48
                ? "Uncertain"
                : "Stale",
        confidence: c.baseConfidence * Math.exp(-hours / 48),
        uncertainty: Math.min(1800, c.baseUncertainty + hours * 18),
      };
    })
    .filter((c) => c.hours < 168);
}
const metricCache = new WeakMap();
export function invalidateOperations(s) {
  metricCache.delete(s);
  invalidatePorts(s);
  invalidateSupport(s);
}
const airSearchCache = new WeakMap();
function fleetAirSearch(s, id, f, position, wars) {
  const bucket = Math.floor(campaignMinutes(s) / 15);
  let cache = airSearchCache.get(s);
  if (!cache || cache.bucket !== bucket) {
    cache = { bucket, nations: new Map(), fleets: new Map() };
    airSearchCache.set(s, cache);
  }
  let recent = cache.nations.get(id);
  if (recent === undefined) {
    recent =
      s.nations[id].contacts
        .filter(
          (x) => campaignMinutes(s) - x.seenAt < 360 && wars.has(x.nation),
        )
        .sort((a, b) => b.seenAt - a.seenAt)[0] || null;
    cache.nations.set(id, recent);
  }
  let row = cache.fleets.get(f.id);
  if (!row) {
    row = {
      conditions: airConditions(s, position),
      sector: searchSector(s, f, position, recent?.position),
    };
    cache.fleets.set(f.id, row);
  }
  return row;
}
function metrics(s, c) {
  let cache = metricCache.get(s);
  if (!cache || cache.day !== s.day) {
    cache = {
      day: s.day,
      rows: Object.entries(s.nations).flatMap(([id, n]) =>
        n.fleets.map((f) => ({ id, f, stats: fleetStats(s, c, id, f) })),
      ),
    };
    metricCache.set(s, cache);
  }
  return cache.rows;
}
export function dailyOperations(s, c) {
  for (const [id, n] of Object.entries(s.nations)) {
    if (n.fleets.some(f=>f.battleId)) { syncConvoys(s,c,id); continue; }
    staffSailors(s, c, id);
    n.contacts = n.contacts.filter(
      (c) => campaignMinutes(s) - c.seenAt < 10080,
    );
    const removed = new Set(
      n.fleets
        .filter(
          (f) =>
            !fleetGroups(s, id, f.id).some(
              (g) => ["active", "returning"].includes(g.status) && g.count,
            ),
        )
        .map((f) => f.id),
    );
    for (const g of n.groups)
      if (removed.has(g.fleetId)) {
        g.dockPort =
          n.fleets.find((f) => f.id === g.fleetId)?.port || HOME_PORT[id];
        delete g.fleetId;
      }
    n.fleets = n.fleets.filter((f) => !removed.has(f.id));
    for (const g of n.groups)
      if (g.status === "active" && g.service === "warship" && !g.fleetId)
        commissionToFleet(s, c, id, g);
    syncConvoys(s, c, id);
    // Regroup only ships physically in port. Sea forces keep their positions and orders.
    const protectedForce = (f) =>
      activeProvocation(s, id, f.id) ||
      f.pacificTarget ||
      n.airSorties?.some((o) => o.fleetId === f.id) ||
      f.reinforceTo ||
      n.fleets.some((x) => x.reinforceTo === f.id);
    const portFleets = n.fleets.filter(
      (f) =>
        f.phase === "port" &&
        !["repair", "reinforcement", "support"].includes(f.role) &&
        !protectedForce(f),
    );
    const limits = {
      carrier: 2,
      battle: 4,
      cruiser: 6,
      escort: 18,
      submarine: 14,
    };
    for (const f of portFleets) {
      if (!n.fleets.includes(f) || f.manual) continue;
      const own = fleetGroups(s, id, f.id).filter(
        (g) => g.count && g.status === "active",
      );
      const target = portFleets.find(
        (x) =>
          x !== f &&
          n.fleets.includes(x) &&
          !x.manual &&
          x.port === f.port &&
          x.role === f.role &&
          x.mission === f.mission &&
          Math.min(x.maxRangeNm, f.maxRangeNm) /
            Math.max(x.maxRangeNm, f.maxRangeNm) >
            0.65 &&
          own.filter((g) => type(c.classes[g.classId]) === f.role).length +
            fleetGroups(s, id, x.id).filter(
              (g) =>
                g.count &&
                g.status === "active" &&
                type(c.classes[g.classId]) === f.role,
            ).length <=
            limits[f.role],
      );
      if (target && n.fleets.length > 2) {
        for (const g of own) g.fleetId = target.id;
        target.fuelNm = Math.min(target.fuelNm, f.fuelNm);
        n.fleets = n.fleets.filter((x) => x !== f);
      }
    }

    if (
      n.fleets.filter(
        (f) => !["repair", "reinforcement", "support"].includes(f.role),
      ).length > 20
    ) {
      for (const f of portFleets) {
        const target = portFleets.find(
          (x) =>
            x !== f &&
            x.port === f.port &&
            x.role === f.role &&
            x.mission === f.mission &&
            x.manual === f.manual,
        );
        if (
          target &&
          n.fleets.filter(
            (f) => !["repair", "reinforcement", "support"].includes(f.role),
          ).length > 20
        ) {
          for (const g of fleetGroups(s, id, f.id)) g.fleetId = target.id;
          n.fleets.splice(n.fleets.indexOf(f), 1);
        }
      }
    }
    for (const f of [...n.fleets]) {
      if (
        !["port", "refuel"].includes(f.phase) ||
        ["repair", "reinforcement", "support"].includes(f.role) ||
        protectedForce(f)
      )
        continue;
      const members = fleetGroups(s, id, f.id).filter(
          (g) => g.status === "active" && g.count,
        ),
        limit = {
          submarine: 14,
          escort: 18,
          cruiser: 6,
          battle: 4,
          carrier: 2,
        }[f.role];
      const core = members.filter((g) => type(c.classes[g.classId]) === f.role);
      if (
        core.length > limit &&
        n.fleets.filter(
          (x) => !["repair", "reinforcement", "support"].includes(x.role),
        ).length < 20
      ) {
        const move = core.slice(Math.ceil(core.length / 2));
        if (["carrier", "battle", "cruiser"].includes(f.role))
          move.push(
            ...members
              .filter((g) => type(c.classes[g.classId]) === "escort")
              .slice(0, f.role === "carrier" ? 4 : 2),
          );
        const extra = makeFleet(
          s,
          id,
          f.role,
          n.fleets.length + 1,
          f.port,
          fleetPosition(s, f),
          f.mission,
        );
        extra.manual = f.manual;
        extra.aggressiveBattle = f.aggressiveBattle;
        n.fleets.push(extra);
        for (const g of move) g.fleetId = extra.id;
        for (const force of [f, extra]) {
          const st = fleetStats(s, c, id, force);
          force.speed = st.speed;
          force.maxRangeNm = st.range;
          force.fuelNm = Math.min(f.fuelNm, st.range);
        }
      }
    }
    for (const f of n.fleets.filter(
      (f) =>
        ["port", "refuel"].includes(f.phase) &&
        !["repair", "reinforcement", "support"].includes(f.role),
    )) {
      const members = fleetGroups(s, id, f.id).filter(
        (g) => g.status === "active" && g.count,
      );
      if (
        members.length &&
        !members.some((g) => type(c.classes[g.classId]) === f.role)
      )
        f.role = type(c.classes[members[0].classId]);
    }
    balanceScreens(s, c, id);
  }
  organizeSupport(s, c);
  invalidateOperations(s);
}
export function minuteOperations(s, c, resolve, convoyReport) {
  expireProvocations(s);
  const now = campaignMinutes(s),
    rows = metrics(s, c).filter((r) => r.stats.hulls),
    world = [];
  for (const r of rows) {
    const { id, f, stats } = r;
    if (f.battleId) { world.push({ ...r, position:fleetPosition(s,f), kind:"fleet" }); continue; }
    const material = strategicFactor(s.nations[id]);
    if (f.materialFactor !== undefined && Math.abs(material - f.materialFactor) > .00001 && now < f.arriveAt) {
      const position = fleetPosition(s, f);
      let travelled = Math.max(0, now - f.departAt) * f.speed / 60, next = 1;
      while (next < f.route.length && travelled >= distanceNm(f.route[next-1], f.route[next])) {
        travelled -= distanceNm(f.route[next-1], f.route[next]); next++;
      }
      f.route = [position, ...f.route.slice(next)];
      const oldArrival = f.arriveAt;
      f.speed *= material / Math.max(.001, f.materialFactor);
      f.departAt = now;
      f.arriveAt = now + routeLength(f.route) / Math.max(1, f.speed) * 60;
      f.nextPlanAt += f.arriveAt - oldArrival;
      routeCache.delete(f);
    }
    f.materialFactor = material;
    if (f.role === "support") {
      minuteSupport(s, c, id, f);
      world.push({ ...r, position: fleetPosition(s, f), kind: "fleet" });
      continue;
    }
    if (f.role === "reinforcement" && now >= f.arriveAt) {
      if (f.destinationPort && f.targetNode !== f.destinationPort) {
        if (f.phase !== "refuel") {
          f.phase = "refuel";
          f.nextPlanAt = now + 720;
        }
        if (now >= f.nextPlanAt) {
          f.fuelNm = f.maxRangeNm;
          const next = nextSupplyLeg(s, id, f, f.destinationPort);
          if (next) setRoute(s, c, id, f, next, { phase: "reinforcing" });
          else f.nextPlanAt = now + 1440;
        }
        world.push({ ...r, position: fleetPosition(s, f), kind: "fleet" });
        continue;
      }
      const n = s.nations[id],
        target = n.fleets.find((x) => x.id === f.reinforceTo);
      f.phase = "port";
      if (
        target &&
        distanceNm(fleetPosition(s, target), fleetPosition(s, f)) < 25
      ) {
        for (const g of fleetGroups(s, id, f.id)) g.fleetId = target.id;
        n.fleets = n.fleets.filter((x) => x !== f);
        balanceScreens(s, c, id);
        invalidateOperations(s);
        continue;
      }
      if (!target) {
        f.role = type(c.classes[stats.active[0].classId]);
        delete f.reinforceTo;
      } else {
        target.nextPlanAt = Math.min(target.nextPlanAt, now);
        world.push({ ...r, position: fleetPosition(s, f), kind: "fleet" });
        continue;
      }
    }
    if (f.role === "repair" && f.returnPort && f.phase === "refuel") {
      if (now >= f.nextPlanAt) {
        f.fuelNm = f.maxRangeNm;
        const leg = nextSupplyLeg(s, id, f, f.returnPort);
        if (leg) setRoute(s, c, id, f, leg, { phase: "returning" });
        else
          holdPosition(s, id, f, "Holding: no reachable friendly repair port");
      }
      world.push({ ...r, position: fleetPosition(s, f), kind: "fleet" });
      continue;
    }
    f.fuelNm = Math.max(0, f.fuelNm - travelledThisTick(f, now));
    if (now < f.arriveAt) { /* Passage remains active until arrival. */ }
    else if (f.phase === "returning") {
      if (!usablePorts(s, id).includes(f.port)) {
        const ports = usablePorts(s, id);
        if (ports.length)
          setRoute(
            s,
            c,
            id,
            f,
            ports.reduce((a, b) =>
              distanceNm(NODES[a], fleetPosition(s, f)) <
              distanceNm(NODES[b], fleetPosition(s, f))
                ? a
                : b,
            ),
            { phase: "returning" },
          );
        world.push({ ...r, position: fleetPosition(s, f), kind: "fleet" });
        continue;
      }
      if (
        f.returnPort &&
        f.targetNode !== f.returnPort &&
        usablePorts(s, id).includes(f.returnPort)
      ) {
        f.phase = "refuel";
        f.nextPlanAt = now + 720;
        dockSailors(s, c, id, f);
        world.push({ ...r, position: fleetPosition(s, f), kind: "fleet" });
        continue;
      }
      delete f.returnPort;
      dockSailors(s, c, id, f);
      for (const g of fleetGroups(s, id, f.id)) {
        g.dockPort = f.port;
        if (g.scrapOnArrival) {
          completeScrapping(s, c, s.nations[id], g);
        } else if (g.reserveOnArrival) {
          g.status = "reserve";
          g.airWing = [];
          g.sailors = 0;
          delete g.reserveOnArrival;
          delete g.fleetId;
        } else if (g.status === "returning") g.status = "repair";
        else if (g.status === "active") delete g.fleetId;
      }
      f.phase = "repair";
      f.nextPlanAt = now + 1e8;
      invalidateOperations(s);
      continue;
    } else if (f.phase === "passage") {
      f.phase = f.targetNode === f.port ? "refuel" : "patrol";
      if (f.phase === "refuel") dockSailors(s, c, id, f);
      f.nextPlanAt = now + (f.phase === "refuel" ? 720 : 360);
    } else if (f.phase === "refuel" && now >= f.nextPlanAt) {
      f.fuelNm = f.maxRangeNm;
      f.phase = "port";
      dockSailors(s, c, id, f);
    }
    if (
      PORT_MISSIONS.includes(f.mission) &&
      f.targetNode === f.objectiveNode &&
      s.relations[key(id, portOwner(s, f.objectiveNode))]?.war &&
      f.phase === "patrol"
    )
      f.nextPlanAt = Math.max(f.nextPlanAt, now + 15);
    if (now >= f.nextPlanAt && !["repair", "returning"].includes(f.phase))
      setRoute(s, c, id, f, chooseDestination(s, c, id, f));
    const position = fleetPosition(s, f);
    world.push({ ...r, position, kind: "fleet" });
  }
  for (const [id, n] of Object.entries(s.nations)) {
    moveConvoys(s, c, id);
    for (const v of n.convoys) {
      if (!v.count) continue;
      if (!nationAtWar(s, id)) continue;
      world.push({
        id,
        f: v,
        stats: { hulls: v.count, submarines: 0, air: 0 },
        position: fleetPosition(s, v),
        kind: "convoy",
      });
    }
  }
  // Spatial cells avoid scanning every fleet pair each minute at high game speeds.
  const cells = new Map();
  for (const row of world) {
    const x = Math.floor((row.position[0] + 180) / 8),
      y = Math.floor((row.position[1] + 90) / 8),
      k = `${x}:${y}`;
    if (!cells.has(k)) cells.set(k, []);
    cells.get(k).push(row);
  }
  const acted = new Set(),
    wars = Object.fromEntries(
      Object.keys(s.nations).map((id) => [
        id,
        new Set(
          Object.values(s.relations)
            .filter((r) => r.war && [r.a, r.b].includes(id))
            .map((r) => (r.a === id ? r.b : r.a)),
        ),
      ]),
    );
  for (const own of world) {
    if (own.kind !== "fleet" || own.f.battleId) continue;
    const n = s.nations[own.id],
      f = own.f,
      st = own.stats,
      contacts = contactIndex(n).map,
      canAct =
        !["support", "repair", "reinforcement"].includes(f.role) &&
        !["port", "refuel", "repair"].includes(f.phase) &&
        now - f.lastBattle >= 720;
    const { conditions, sector } = fleetAirSearch(
      s,
      own.id,
      f,
      own.position,
      wars[own.id],
    );
    const visual = 25 + (st.radar ? 20 : 0) + radarLevel(n.tech) * 12,
      range =
        (visual +
          (Math.min(500, st.airRadius) + Math.min(90, st.scouts * 4)) *
            conditions.search) *
        MISSIONS[f.mission].search *
        (1 + upgradeLevel(n.tech, "intelligence") * 0.08);
    const x = Math.floor((own.position[0] + 180) / 8),
      y = Math.floor((own.position[1] + 90) / 8),
      span = Math.ceil(
        range /
          (480 * Math.max(0.25, Math.cos((own.position[1] * Math.PI) / 180))),
      );
    for (let dx = -span; dx <= span; dx++)
      for (
        let dy = -Math.max(1, Math.ceil(range / 480));
        dy <= Math.max(1, Math.ceil(range / 480));
        dy++
      )
        for (const target of cells.get(`${(x + dx + 45) % 45}:${y + dy}`) ||
          []) {
          if (target.id === own.id) continue;
          let contact = contacts.get(target.f.id);
          const observed =
            contact?.source === "Scouting" && now - contact.seenAt < 10;
          const limited =
            target.kind === "fleet" &&
            opposingProvocations(s, own.id, f.id, target.id, target.f.id);
          const eligible =
            canAct &&
            !acted.has(f.id) &&
            (wars[own.id].has(target.id) || limited) &&
            (target.kind === "convoy"
              ? f.mission === "raid" && now - target.f.lastBattle >= 720
              : !["port", "refuel", "repair"].includes(target.f.phase) &&
                (st.air > 0 ||
                  (now - f.lastBattle >= (f.role === "repair" ? 720 : 10080) &&
                    now - target.f.lastBattle >=
                      (["repair", "support"].includes(target.f.role)
                        ? 720
                        : 10080))) &&
                !acted.has(target.f.id));
          if (observed && !eligible) continue;
          // Reject distant neighbors cheaply before the precise spherical distance.
          if (
            Math.abs(own.position[1] - target.position[1]) * 60 >
            range * 1.01
          )
            continue;
          const d = distanceNm(own.position, target.position);
          if (d > range) continue;
          if (limited && d <= 45)
            contact = recordContact(
              s,
              own.id,
              target.id,
              target.f,
              target.position,
              target.stats,
              "Scouting",
            );
          if (!observed && !limited) {
            const stealth =
              target.stats.submarines > target.stats.hulls * 0.5 ? 0.3 : 1;
            if (
              operationRandom(s) <
              hazard(
                clamp(
                  (1 - d / (range * 1.3)) *
                    stealth *
                    (d <= visual
                      ? 1
                      : sectorFactor(sector, own.position, target.position) *
                        conditions.search),
                  0.001,
                  0.95,
                ),
              )
            )
              contact = recordContact(
                s,
                own.id,
                target.id,
                target.f,
                target.position,
                target.stats,
              );
          }
          if (!eligible || !contact || now - contact.seenAt >= 120) continue;
          if (
            st.air > 0 &&
            operationRandom(s) < hazard(MISSIONS[f.mission].engagement) &&
            !(target.kind === "convoy" && f.mission !== "raid")
          )
            queueAirStrike(s, c, own.id, {
              fleetId: f.id,
              targetNation: target.id,
              targetId: target.f.id,
              targetKind: target.kind,
              position: contact.position,
            });
          if (target.kind === "convoy") {
            if (
              f.mission !== "raid" ||
              now - f.lastBattle < 720 ||
              now - target.f.lastBattle < 720 ||
              d > 35 ||
              operationRandom(s) > hazard(0.22)
            )
              continue;
            const defenders = escortsForConvoy(world, target).reduce(
              (v, r) => v + convoyCombatPower(s, c, r).defense,
              0,
            );
            const attack = convoyCombatPower(s, c, {
              ...own,
              stats: { ...own.stats, air: 0 },
            }).attack;
            if (
              attack <= 0 ||
              operationRandom(s) < defenders / (defenders + attack)
            )
              continue;
            convoyReport?.(own.id,target.id,target.f.id,target.position,f.id);
            target.f.lastBattle=now; f.lastBattle=now; acted.add(f.id);
            continue;
          }
          if (target.f.battleId) continue;
          if (!limited && !st.submarines && !target.stats.submarines
            && !["repair", "support"].includes(target.f.role)
            && (st.tons < ENGAGEMENTS.MIN_SURFACE_ATTACK_TONS || target.stats.tons < ENGAGEMENTS.MIN_SURFACE_TARGET_TONS)) continue;
          const cooldown = f.role === "repair" ? 720 : 7 * 1440;
          if (
            now - f.lastBattle < cooldown ||
            now - target.f.lastBattle <
              (["repair", "support"].includes(target.f.role)
                ? 720
                : 7 * 1440) ||
            acted.has(target.f.id)
          )
            continue;
          if (
            d > 45 ||
            (!limited &&
              operationRandom(s) > hazard(MISSIONS[f.mission].engagement))
          )
            continue;
          f.lastBattle = now;
          target.f.lastBattle = now;
          acted.add(f.id);
          acted.add(target.f.id);
          const region = Object.values(AREAS).reduce((a, b) =>
            distanceNm(a.point, own.position) <
            distanceNm(b.point, own.position)
              ? a
              : b,
          ).region;
          const report = resolve(
            own.id,
            target.id,
            region,
            f.id,
            target.f.id,
            own.position,
          );
          if (limited && report?.status !== "ongoing")
            finishIncident(s, own.id, f.id, target.id, target.f.id, report);
          invalidateOperations(s);
        }
  }
  if (periodicTick(now, 1440, 437))
    for (const [id, n] of Object.entries(s.nations)) {
      if (
        operationRandom(s) >
        0.2 +
          radarLevel(n.tech) * 0.03 +
          upgradeLevel(n.tech, "intelligence") * 0.05
      )
        continue;
      const targets = world.filter((r) => r.id !== id);
      if (targets.length) {
        const t = targets[Math.floor(operationRandom(s) * targets.length)],
          p = [
            t.position[0] + (operationRandom(s) - 0.5) * 2,
            t.position[1] + (operationRandom(s) - 0.5) * 2,
          ];
        p[0] = ((p[0] + 540) % 360) - 180;
        p[1] = clamp(p[1], -89, 89);
        recordContact(s, id, t.id, t.f, p, t.stats, "Signals intelligence");
      }
    }
}
