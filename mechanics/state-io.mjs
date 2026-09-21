import { validatePolitics } from "./politics-validation.mjs";
import { GOLD_FLOW_LABELS } from './gold-accounting.mjs';
import { validateDiplomaticOffers } from './diplomatic-exchange.mjs';
import { contentFor } from "./campaign-content.mjs";
import { VERSION, DAY, initializeCampaign } from "./engine.mjs";
import { PRIORITIES, REGIONS, fleetService } from "./catalog.mjs";
import { PROGRAMS } from "./balance.mjs";
import { AREAS, NODES, MISSIONS, PORTS } from "./world.mjs";
import { STRATEGY_REVISION } from "./task-forces.mjs";
import { validateAviation } from "./aviation-validation.mjs";
import {
  SYSTEMS_REVISION,
  aircraftModels,
  planeRole,
  SPEEDS,
} from "./naval-resources.mjs";
import { GAME_VERSION } from "./version.mjs";
import { CAMPAIGNS } from "./land-war.mjs";
import { HISTORICAL_POLAND, HISTORICAL_BRITAIN } from "./campaign-clock.mjs";

export function validateSave(value, content) {
  const fail = () => {
    throw new Error(
      "This file is not a compatible WNT1922 campaign. Your current campaign has been kept.",
    );
  };
  const plain = (v) => v && typeof v === "object" && !Array.isArray(v);
  const finite = (v, low, high) =>
    typeof v === "number" && Number.isFinite(v) && v >= low && v <= high;
  if (!plain(value) || value.version !== VERSION) fail();
  for (const n of Object.values(value.nations || {}))
    if (
      n?.customAircraft !== undefined &&
      (!Array.isArray(n.customAircraft) || n.customAircraft.length > 80)
    )
      fail();
  for (const n of Object.values(value.nations || {}))
    if (
      n?.customDesigns !== undefined &&
      (!Array.isArray(n.customDesigns) || n.customDesigns.length > 80)
    )
      fail();
  try {
    content = contentFor(content, value);
  } catch {
    fail();
  }
  const minimumDay = Date.parse(content.scenario.start + "T00:00:00Z") / DAY;
  if (
    !plain(value) ||
    value.version !== VERSION ||
    !content.nations[value.player] ||
    !finite(value.day, minimumDay, 2000000) ||
    !Number.isInteger(value.day)
  )
    fail();
  const revision = value.rosterRevision;
  if (!Number.isInteger(revision) || revision !== content.rosterRevision)
    fail();
  const currentRoster = revision === content.rosterRevision;
  if (
    value.specificationRevision !== undefined &&
    ![1, 2].includes(value.specificationRevision)
  )
    fail();
  if (
    value.minuteTicks !== undefined &&
    (!Number.isInteger(value.minuteTicks) || value.minuteTicks < 0)
  )
    fail();
  if (
    !finite(value.fraction, 0, 1) ||
    !finite(value.seed, 0, 4294967295) ||
    !Number.isInteger(value.seed) ||
    !Number.isInteger(value.nextId) ||
    value.nextId < 1
  )
    fail();
  if (
    !plain(value.nations) ||
    Object.keys(value.nations).sort().join() !==
      Object.keys(content.nations).sort().join()
  )
    fail();
  const text = (v, max = 180) => typeof v === "string" && v.length <= max;
  const identifier = (v) =>
    typeof v === "string" && /^[A-Za-z0-9_#:. -]{1,200}$/.test(v);
  if (
    value.resumeAfterDecision !== undefined &&
    typeof value.resumeAfterDecision !== "boolean"
  )
    fail();
  const amount = (v) => finite(v, 0, 1e15);
  if (
    !plain(value.ports) ||
    Object.keys(value.ports).sort().join() !== Object.keys(PORTS).sort().join()
  )
    fail();
  for (const p of Object.values(value.ports))
    if (
      !plain(p) ||
      !finite(p.health, 0, 1) ||
      !finite(p.blockade, 0, 1) ||
      !finite(p.lastAttack, -1e9, 3e9) ||
      !plain(p.repairSpent) ||
      !amount(p.repairSpent.gold) ||
      !amount(p.repairSpent.industry)
    )
      fail();
  if (
    value.musicEnabled !== undefined &&
    typeof value.musicEnabled !== "boolean"
  )
    fail();
  if (value.musicVolume !== undefined && !finite(value.musicVolume, 0, 1))
    fail();
  const day = (v) => finite(v, minimumDay, 2000000) && Number.isInteger(v);
  const price = (v) =>
    plain(v) && ["gold", "influence", "industry"].every((k) => amount(v[k]));
  if (
    typeof value.autoPause !== "boolean" ||
    !plain(value.relations) ||
    !plain(value.initial) ||
    !Array.isArray(value.history) ||
    value.history.length > 240 ||
    !Array.isArray(value.reviews) ||
    value.reviews.length > 10 ||
    !finite(value.treatyUntil, -17500, 2000000) ||
    !Number.isInteger(value.treatyUntil)
  )
    fail();
  const nationIds = Object.keys(content.nations);
  if (
    !plain(value.controllers) ||
    Object.keys(value.controllers).sort().join() !== nationIds.sort().join() ||
    Object.values(value.controllers).some((v) => !["human", "ai"].includes(v))
  )
    fail();
  const expectedPairs = [];
  for (let i = 0; i < nationIds.length; i++)
    for (let j = i + 1; j < nationIds.length; j++)
      expectedPairs.push([nationIds[i], nationIds[j]].sort().join("-"));
  if (
    Object.keys(value.relations).sort().join() !== expectedPairs.sort().join()
  )
    fail();
  for (const [key, r] of Object.entries(value.relations)) {
    if (r.record !== undefined) {
      if (
        !plain(r.record) ||
        !day(r.record.since) ||
        !plain(r.record.sides) ||
        Object.keys(r.record.sides).sort().join() !== [r.a, r.b].sort().join()
      )
        fail();
      for (const result of Object.values(r.record.sides))
        if (
          !plain(result) ||
          !["sunk", "damage", "merchantGRT"].every((k) => amount(result[k]))
        )
          fail();
    }
    if (
      !plain(r) ||
      !content.nations[r.a] ||
      !content.nations[r.b] ||
      r.a === r.b ||
      [r.a, r.b].sort().join("-") !== key ||
      typeof r.war !== "boolean" ||
      typeof r.allied !== "boolean" ||
      !finite(r.truceUntil, minimumDay - 1, 2000000) ||
      !finite(r.lastBattle, -99999, 2000000) ||
      (r.war && !day(r.warSince))
    )
      fail();
  }
  for (const [id, n] of Object.entries(value.nations)) {
    if (
      !plain(n) ||
      n.id !== id ||
      !Array.isArray(n.groups) ||
      n.groups.length > 10000 ||
      !PRIORITIES[n.priority] ||
      !REGIONS[n.focus] ||
      !content.nations[n.rival] ||
      n.rival === id
    )
      fail();
    if (
      !plain(n.merchant) ||
      !Number.isInteger(n.merchant.hulls) ||
      !amount(n.merchant.hulls) ||
      !finite(n.merchant.averageGRT, 1, 100000) ||
      n.merchant.baseDay !== minimumDay
    )
      fail();
    if (!amount(n.gdp) || !amount(n.gtp) || !amount(n.strategic) || !amount(n.strategicDailyDemand)
      || !plain(n.strategicSpent) || !amount(n.strategicSpent.operations) || !amount(n.strategicSpent.production)
      || !Array.isArray(n.convoyRecord) || n.convoyRecord.length > 10000
      || n.convoyRecord.some(r => !plain(r) || !finite(r.at, minimumDay, value.day + 1) || !amount(r.delivered) || !amount(r.sunk))) fail();
    const damage = n.industrialDamage;
    if (
      !plain(damage) ||
      !finite(damage.industry, 0, 1) ||
      !finite(damage.yards, 0, 0.6) ||
      !finite(damage.lastAttack, -1e9, 3e9) ||
      !amount(damage.repairGold) ||
      !amount(damage.repairIndustry) ||
      !finite(n.nextStrategicAt, -1e9, 3e9) ||
      !Array.isArray(n.strategicLog) ||
      n.strategicLog.length > 30
    )
      fail();
    for (const raid of n.strategicLog)
      if (
        !plain(raid) ||
        !finite(raid.minute, -1e9, 3e9) ||
        !content.nations[raid.attacker] ||
        !content.nations[raid.defender] ||
        !PORTS[raid.source] ||
        !PORTS[raid.target] ||
        !["industry", "yards", "port"].includes(raid.category) ||
        !finite(raid.damage, 0, 0.6) ||
        !amount(raid.bombers) ||
        !amount(raid.escorts)
      )
        fail();
    if (
      n.civilianShipping !== undefined &&
      (!plain(n.civilianShipping) ||
        !finite(n.civilianShipping.carry, 0, 1) ||
        !Number.isInteger(n.civilianShipping.delivered) ||
        !amount(n.civilianShipping.delivered) ||
        !amount(n.civilianShipping.grt))
    )
      fail();
    if (
      n.monthAccount !== undefined &&
      (!plain(n.monthAccount) ||
        !day(n.monthAccount.start) ||
        !price(n.monthAccount.opening))
    )
      fail();
    if (
      n.personnelTraining !== undefined &&
      (!plain(n.personnelTraining) ||
        !amount(n.personnelTraining.sailors) ||
        !amount(n.personnelTraining.aviators) ||
        !day(n.personnelTraining.lastDay) ||
        n.personnelTraining.lastDay > value.day)
    )
      fail();
    for (const flows of [n.monthAccount?.goldFlows, n.monthAccount?.last?.goldFlows]) {
      if (flows !== undefined && (!plain(flows) || Object.entries(flows).some(([key, amount]) =>
        !Object.hasOwn(GOLD_FLOW_LABELS, key) || !finite(amount, -1e15, 1e15)))) fail();
    }
    for (const flows of [n.monthAccount?.diplomaticFlows, n.monthAccount?.last?.diplomaticFlows]) {
      if (flows !== undefined && (!plain(flows) || Object.entries(flows).some(([key, amount]) =>
        !['gold','industry','strategic'].includes(key) || !finite(amount, -1e15, 1e15)))) fail();
    }
    if (
      ![
        "gold",
        "influence",
        "industry",
        "crew",
        "crewYear",
        "sunkTons",
        "lostTons",
        "battlesWon",
        "battlesLost",
        "delivered",
      ].every((k) => amount(n[k]))
    )
      fail();
    if (
      currentRoster &&
      (!plain(n.merchant) ||
        !Number.isInteger(n.merchant.hulls) ||
        !finite(n.merchant.hulls, 0, 1000000) ||
        !amount(n.merchantDelivered) ||
        !amount(n.supportDelivered))
    )
      fail();
    if (
      !["training", "morale", "exposure"].every((k) =>
        finite(n[k], 0, 100),
      ) ||
      !["disclose", "false_numbers", "false_tonnage"].includes(n.treatyPolicy)
    )
      fail();
    if (
      !plain(n.tech) ||
      !plain(n.cooldowns) ||
      !Array.isArray(n.projects) ||
      n.projects.length > 4 ||
      !Array.isArray(n.bases) ||
      !n.bases.length ||
      n.bases.length > 4 ||
      !n.bases.every((k) => REGIONS[k])
    )
      fail();
    for (const p of Object.values(PROGRAMS))
      if (
        p.level &&
        !(
          value.systemsRevision === undefined &&
          ["pilots", "aircraft_factory"].includes(p.level)
        ) &&
        (!Number.isInteger(n.tech[p.level]) ||
          !finite(n.tech[p.level], 1, p.max))
      )
        fail();
    for (const v of Object.values(n.cooldowns))
      if (!finite(v, minimumDay, 2000000)) fail();
    for (const p of n.projects) {
      if (
        !plain(p) ||
        !text(p.id) ||
        !text(p.name) ||
        !finite(p.days, 1, 1000000) ||
        !finite(p.remaining, 0, p.days) ||
        !price(p.paid)
      )
        fail();
      if (!PROGRAMS[p.key]) fail();
    }
    if (
      !plain(value.initial[id]) ||
      !amount(value.initial[id].power) ||
      !amount(value.initial[id].tons)
    )
      fail();
    const ids = new Set();
    for (const g of n.groups) {
      if (
        !plain(g) ||
        !identifier(g.id) ||
        g.id.length > 120 ||
        ids.has(g.id) ||
        !content.classes[g.classId] ||
        content.classes[g.classId].nation !== id
      )
        fail();
      if (
        typeof g.name !== "string" ||
        g.name.length > 180 ||
        !Number.isInteger(g.count) ||
        !finite(g.count, 0, 1000000) ||
        !finite(g.health, 0, 1) ||
        !finite(g.progress, 0, 1) ||
        !REGIONS[g.region]
      )
        fail();
      if (
        ![
          "active",
          "reserve",
          "building",
          "trials",
          "converting",
          "repair",
          "returning",
          "sunk",
          "scrapped",
        ].includes(g.status)
      )
        fail();
      if (
        !finite(g.days, 1, 1000000) ||
        !price(g.paid) ||
        (g.destination && (!REGIONS[g.destination] || !day(g.transitUntil)))
      )
        fail();
      if (
        currentRoster &&
        g.service !== fleetService(content.classes[g.classId])
      )
        fail();
      if (g.service === "merchant" && !amount(g.merchantGRT)) fail();
      if (g.legacy !== undefined && typeof g.legacy !== "boolean") fail();
      if (g.torpedoesPerHull !== undefined &&
          (!Number.isInteger(g.torpedoesPerHull) ||
           !finite(g.torpedoesPerHull, 0, content.classes[g.classId].torpedoCapacity ?? -1))) fail();
      if (g.notes !== undefined && !text(g.notes, 3000)) fail();
      if (
        !Number.isInteger(g.sailors) ||
        !amount(g.sailors) ||
        g.sailors > Math.ceil(content.classes[g.classId].crew * g.count) ||
        typeof g.atSea !== "boolean"
      )
        fail();
      ids.add(g.id);
    }
    if (n.groups.reduce((v, g) => v + g.sailors, 0) > Math.floor(n.crew))
      fail();
  }
  for (const key of ["log", "reports", "decisions", "completedEvents"])
    if (!Array.isArray(value[key]) || value[key].length > 2000) fail();
  if (!value.completedEvents.every((v) => text(v, 200))) fail();
  for (const l of value.log)
    if (!plain(l) || !day(l.day) || !text(l.text, 2000) || !text(l.kind, 40))
      fail();
  for (const d of value.decisions) {
    if (
      !plain(d) ||
      !identifier(d.key) ||
      !text(d.title, 200) ||
      !text(d.body, 3000) ||
      !day(d.day) ||
      !Array.isArray(d.options) ||
      d.options.length > 10
    )
      fail();
    for (const o of d.options) {
      if (
        !plain(o) ||
        !identifier(o.id) ||
        !text(o.label, 300) ||
        !text(o.detail, 2000) ||
        (o.program && !PROGRAMS[o.program]) ||
        (o.priority && !PRIORITIES[o.priority])
      )
        fail();
      for (const k of [
        "gold",
        "industry",
        "influence",
        "influenceGain",
        "industryGain",
        "morale",
      ])
        if (o[k] !== undefined && !finite(o[k], 0, 1e8)) fail();
      if (o.relation !== undefined && !finite(o.relation, -100, 100)) fail();
    }
  }
  for (const r of value.reports) {
    if (
      !plain(r) ||
      !day(r.day) ||
      !content.nations[r.a] ||
      !content.nations[r.b] ||
      !(r.winner === null && ["ongoing", "completed"].includes(r.status)) && !content.nations[r.winner] ||
      !REGIONS[r.region] ||
      !amount(r.id) ||
      !amount(r.effectiveA) ||
      !amount(r.effectiveB) ||
      !finite(r.variationA, 0.5, 2) ||
      !finite(r.variationB, 0.5, 2)
    )
      fail();
    if (r.upset && !content.nations[r.upsetSide]) fail();
    if (r.status === "ongoing" && (
      !plain(r.order) || !["surface","port","air","convoy"].includes(r.order.kind) ||
      !Number.isInteger(r.stage) || !finite(r.stage,0,4) ||
      !Number.isInteger(r.mainRounds) || !finite(r.mainRounds,1,5) ||
      !Number.isInteger(r.round) || !finite(r.round,1,r.mainRounds) ||
      !finite(r.nextStageAt,r.startedAt,3e9) || !finite(r.startedAt,-1e9,3e9) ||
      !Array.isArray(r.durations) || r.durations.length !== 5 || !r.durations.every(v=>finite(v,5,120)) ||
      !Array.isArray(r.timeline) || !r.timeline.length || r.timeline.length>10 ||
      !r.timeline.every(v=>plain(v) && finite(v.at,r.startedAt,r.nextStageAt) && finite(v.stage,0,4))
    )) fail();
    for (const side of ["A", "B"]) {
      const power = r["power" + side],
        result = r["result" + side],
        prep = r["preparation" + side];
      if (
        !plain(power) ||
        ![
          "surface",
          "air",
          "sub",
          "asw",
          "scout",
          "total",
          "ships",
          "speed",
          "supply",
        ].every((k) => amount(power[k]))
      )
        fail();
      if (
        !plain(prep) ||
        !finite(prep.training, 0, 100) ||
        !finite(prep.morale, 0, 100) ||
        !finite(prep.crew, 0, 1) ||
        !finite(prep.supply, 0, 1)
      )
        fail();
      if (result?.conditions !== undefined) {
        if (
          !Array.isArray(result.conditions) ||
          result.conditions.length > 10000
        )
          fail();
        for (const g of result.conditions)
          if (
            !plain(g) ||
            !text(g.name) ||
            !amount(g.sunk) ||
            !finite(g.health, 0, 1) ||
            !finite(g.damage, 0, 100) ||
            !["light", "moderate", "serious", "sunk"].includes(g.severity)
          )
            fail();
      }
      if (
        !plain(result) ||
        !["sunk", "damaged", "tons", "engaged"].every((k) =>
          amount(result[k]),
        ) ||
        !Array.isArray(result.losses) ||
        result.losses.length > 10000
      )
        fail();
      for (const l of result.losses)
        if (
          !plain(l) ||
          !text(l.name) ||
          !text(l.cause) ||
          !amount(l.count) ||
          !amount(l.tons)
        )
          fail();
    }
  }
  for (const r of [...value.reviews, ...value.history]) {
    if (
      !plain(r) ||
      !day(r.day) ||
      !Array.isArray(r.scores) ||
      ![4, nationIds.length].includes(r.scores.length) ||
      new Set(r.scores.map((x) => x.id)).size !== r.scores.length
    )
      fail();
    for (const row of r.scores)
      if (
        !plain(row) ||
        !content.nations[row.id] ||
        !finite(row.score, -1e15, 1e15) ||
        !amount(row.power) ||
        !finite(row.commerce, 0, 100)
      )
        fail();
  }
  // A second traversal rejects unsafe numeric payloads at any depth, including future fields.
  function walk(v, depth = 0) {
    if (depth > 24) fail();
    if (typeof v === "number" && !Number.isFinite(v)) fail();
    if (typeof v === "string" && v.length > 12000) fail();
    if (v && typeof v === "object")
      for (const [k, entry] of Object.entries(v)) {
        if (["__proto__", "constructor", "prototype"].includes(k)) fail();
        walk(entry, depth + 1);
      }
  }
  walk(value);
  if (value.strategyRevision !== undefined) {
    if (
      ![1, STRATEGY_REVISION].includes(value.strategyRevision) ||
      !Number.isInteger(value.operationsSeed) ||
      !finite(value.operationsSeed, 0, 4294967295)
    )
      fail();
    const minute = (v) => finite(v, -1e9, 3e9),
      point = (p) =>
        Array.isArray(p) &&
        p.length === 2 &&
        finite(p[0], -180, 180) &&
        finite(p[1], -90, 90);
    const t = value.timeline;
    if (
      !plain(t) ||
      !Number.isInteger(t.offsetDays) ||
      !finite(
        t.offsetDays,
        -(content.scenario.europeVariationDays || 2),
        content.scenario.europeVariationDays || 2,
      ) ||
      t.polandAt !== HISTORICAL_POLAND + t.offsetDays * 1440 ||
      t.britainAt !== HISTORICAL_BRITAIN + t.offsetDays * 1440 ||
      typeof t.polandOccurred !== "boolean" ||
      typeof t.europeOccurred !== "boolean" ||
      (t.europeOccurred && !t.polandOccurred)
    )
      fail();
    for (const [id, n] of Object.entries(value.nations)) {
      if (
        !Array.isArray(n.fleets) ||
        n.fleets.length > 160 ||
        !Array.isArray(n.contacts) ||
        n.contacts.length > 512
      )
        fail();
      const fleetIds = new Set();
      for (const f of n.fleets) {
        if (
          !plain(f) ||
          !identifier(f.id) ||
          fleetIds.has(f.id) ||
          !text(f.name) ||
          !text(f.role, 40) ||
          !AREAS[f.area] ||
          !NODES[f.node] ||
          !PORTS[f.port] ||
          !MISSIONS[f.mission] ||
          typeof f.manual !== "boolean" ||
          !finite(f.speed, 1, 80) ||
          !minute(f.departAt) ||
          !minute(f.arriveAt) ||
          f.arriveAt < f.departAt ||
          !minute(f.lastBattle) ||
          !finite(f.salt, 0, 10000) ||
          !Array.isArray(f.route) ||
          f.route.length < 1 ||
          f.route.length > 100 ||
          !f.route.every(point)
        )
          fail();
        fleetIds.add(f.id);
      }
      for (const g of n.groups) {
        if (
          g.fleetId !== undefined &&
          (!fleetIds.has(g.fleetId) ||
            !["warship", "support"].includes(
              fleetService(content.classes[g.classId]),
            ))
        )
          fail();
        if (
          g.joinAt !== undefined &&
          (!minute(g.joinAt) || !AREAS[g.joinArea] || !g.fleetId)
        )
          fail();
      }
      for (const f of n.fleets) {
        if (f.role === "support" && f.supportKind !== "support")
          fail();
        if (
          (f.supportKind !== undefined &&
            f.supportKind !== "support") ||
          (f.supportDestination !== undefined &&
            !NODES[f.supportDestination]) ||
          (f.supportTarget !== undefined && !identifier(f.supportTarget)) ||
          (f.supportCargo !== undefined && !finite(f.supportCargo, 0, 1e9)) ||
          (f.replenishedUntil !== undefined && !minute(f.replenishedUntil)) ||
          (f.replenishmentRelief !== undefined &&
            !finite(f.replenishmentRelief, 0, 0.15))
        )
          fail();
      }
      const contacts = new Set();
      for (const c of n.contacts) {
        if (
          !plain(c) ||
          !identifier(c.id) ||
          contacts.has(c.id) ||
          !content.nations[c.nation] ||
          c.nation === id ||
          !point(c.position) ||
          !minute(c.seenAt) ||
          !["Scouting", "Signals intelligence", "Port report"].includes(
            c.source,
          ) ||
          !text(c.kind) ||
          !finite(c.estimate, 1, 1e6) ||
          !finite(c.baseConfidence, 0, 1) ||
          !finite(c.baseUncertainty, 0, 1800) ||
          (c.dismissedAt !== undefined && !minute(c.dismissedAt))
        )
          fail();
        contacts.add(c.id);
      }
    }
  } else {
    // Ignore partial fields from saves that predate the operations schema.
    value = structuredClone(value);
    delete value.timeline;
  }
  if (value.systemsRevision !== undefined) {
    if (
      ![1, SYSTEMS_REVISION].includes(value.systemsRevision) ||
      !Array.isArray(value.alerts) ||
      value.alerts.length > 100 ||
      typeof value.audioEnabled !== "boolean" ||
      !finite(value.audioVolume, 0, 1)
    )
      fail();
    for (const [id, n] of Object.entries(value.nations)) {
      const models = aircraftModels(content, id),
        modelIds = models.map((a) => a.id);
      if (
        ![
          "aviators",
          "aviatorsYear",
          "aircraftLost",
          "aviatorsLost",
          "merchantLost",
          "merchantSunk",
          "merchantLostGRT",
          "merchantSunkGRT",
        ].every((k) => amount(n[k])) ||
        !["schoolFunding", "aviatorFunding", "aircraftFunding"].every((k) =>
          finite(n[k], 0.1, 1),
        )
      )
        fail();
      if (
        !plain(n.aircraft) ||
        Object.keys(n.aircraft).sort().join() !== modelIds.sort().join() ||
        !Object.values(n.aircraft).every(
          (v) => Number.isInteger(v) && amount(v),
        ) ||
        !plain(n.productionModels) ||
        !plain(n.productionAutomatic) ||
        Object.keys(n.productionAutomatic).sort().join() !== "fighter,scout,strike" ||
        !Object.values(n.productionAutomatic).every(v => typeof v === "boolean") ||
        !plain(n.airProductionCarry)
      )
        fail();
      for (const [role, model] of Object.entries(n.productionModels))
        if (
          !["fighter", "strike", "scout"].includes(role) ||
          (model !== null && !models.some(a => a.id === model &&
            a.type_year <= new Date(value.day * 86400000).getUTCFullYear() &&
            [role, "multirole"].includes(planeRole(a))))
        )
          fail();
      for (const [model, carry] of Object.entries(n.airProductionCarry))
        if (!modelIds.includes(model) || !finite(carry, 0, 1)) fail();
      if (!Array.isArray(n.airOrders) || n.airOrders.length > 12) fail();
      for (const o of n.airOrders)
        if (
          !plain(o) ||
          !text(o.id) ||
          !modelIds.includes(o.model) ||
          !Number.isInteger(o.count) ||
          !finite(o.count, 1, 500) ||
          !finite(o.days, 1, 100000) ||
          !finite(o.remaining, 0, o.days) ||
          !price(o.paid)
        )
          fail();
      const assigned = {};
      for (const g of n.groups) {
        if (!Array.isArray(g.airWing) || g.airWing.length > 20) fail();
        const cl = content.classes[g.classId];
        if (
          g.airWing.reduce((v, w) => v + w.count, 0) >
          (cl.air + cl.scoutAircraft) * g.count
        )
          fail();
        for (const w of g.airWing) {
          if (
            !plain(w) ||
            !modelIds.includes(w.model) ||
            !["fighter", "strike", "scout"].includes(w.role) ||
            !Number.isInteger(w.count) ||
            !amount(w.count)
          )
            fail();
          assigned[w.model] = (assigned[w.model] || 0) + w.count;
        }
      }
      for (const model of modelIds)
        if ((assigned[model] || 0) > n.aircraft[model]) fail();
      if (value.systemsRevision === 2) {
        if (
          !finite(n.industryFunding, 0.1, 1) ||
          !plain(n.casualties) ||
          !Array.isArray(n.recoveryQueue) ||
          n.recoveryQueue.length > 10000 ||
          !Array.isArray(n.customDesigns) ||
          n.customDesigns.length > 80
        )
          fail();
        for (const type of ["sailors", "aviators", "aircraft"]) {
          const ledger = n.casualties[type];
          if (
            !plain(ledger) ||
            !["lost", "rescued", "recovered"].every(
              (k) => Number.isInteger(ledger[k]) && amount(ledger[k]),
            ) ||
            ledger.recovered > ledger.rescued
          )
            fail();
          const waiting = n.recoveryQueue
            .filter((x) => x.type === type)
            .reduce((sum, x) => sum + x.count, 0);
          if (waiting !== ledger.rescued - ledger.recovered) fail();
        }
        for (const r of n.recoveryQueue)
          if (
            !plain(r) ||
            !["sailors", "aviators", "aircraft"].includes(r.type) ||
            !Number.isInteger(r.count) ||
            !finite(r.count, 1, 1e12) ||
            !finite(r.readyAt, -1e9, 3e9) ||
            (r.type === "aircraft" && !modelIds.includes(r.model))
          )
            fail();
        for (const g of n.groups)
          for (const w of g.airWing)
            if (!Number.isInteger(w.crewed) || !finite(w.crewed, 0, w.count))
              fail();
      }
      if (!Array.isArray(n.convoys) || n.convoys.length > 100) fail();
      for (const v of n.convoys)
        if (
          !plain(v) ||
          !identifier(v.id) ||
          !Number.isInteger(v.count) ||
          !finite(v.count, 0, 100000) ||
          !PORTS[v.port] ||
          !NODES[v.node] ||
          !NODES[v.targetNode] ||
          !finite(v.speed, 1, 50) ||
          !finite(v.departAt, -1e9, 3e9) ||
          !finite(v.arriveAt, v.departAt, 3e9) ||
          !Array.isArray(v.route) ||
          v.route.length < 1 ||
          v.route.length > 100 ||
          !v.route.every(
            (p) =>
              Array.isArray(p) &&
              p.length === 2 &&
              finite(p[0], -180, 180) &&
              finite(p[1], -90, 90),
          )
        )
          fail();
      if (n.aviatorCoverage !== undefined && !finite(n.aviatorCoverage, 0, 1))
        fail();
      if (value.strategyRevision === STRATEGY_REVISION)
        for (const f of n.fleets)
          if (
            (f.objectiveNode && !NODES[f.objectiveNode]) ||
            (f.destinationPort && !PORTS[f.destinationPort]) ||
            (f.reinforceTo && !identifier(f.reinforceTo)) ||
            typeof f.aggressiveBattle !== "boolean" ||
            !finite(f.fuelNm, 0, 1e7) ||
            !finite(f.maxRangeNm, 0, 1e7) ||
            !finite(f.nextPlanAt, -1e9, 3e9) ||
            ![
              "port",
              "passage",
              "patrol",
              "returning",
              "repair",
              "refuel",
              "reinforcing",
            ].includes(f.phase)
          )
            fail();
    }
    for (const a of value.alerts)
      if (
        !plain(a) ||
        !amount(a.id) ||
        !Number.isInteger(a.id) ||
        !text(a.title, 500) ||
        !text(a.body, 3000) ||
        !text(a.kind, 40) ||
        !finite(a.minute, -1e9, 3e9) ||
        (a.a && !content.nations[a.a]) ||
        (a.b && !content.nations[a.b])
      )
        fail();
    for (const d of value.decisions) {
      if (
        typeof d.critical !== "boolean" ||
        (d.target && !content.nations[d.target])
      )
        fail();
      if (
        d.critical &&
        (!finite(d.deadline, -1e9, 3e9) ||
          !d.options.some((o) => o.id === d.defaultOption) ||
          !text(d.defaultText, 2000))
      )
        fail();
    }
    if (
      !plain(value.world) ||
      value.world.revision !== 1 ||
      !Array.isArray(value.world.fronts) ||
      value.world.fronts.length > 40 ||
      !plain(value.world.control) ||
      !plain(value.world.portControl) ||
      !Array.isArray(value.world.changes)
    )
      fail();
    for (const [territory, owner] of Object.entries(value.world.control))
      if (!identifier(territory) || !identifier(owner)) fail();
    for (const [port, owner] of Object.entries(value.world.portControl))
      if (!PORTS[port] || !identifier(owner)) fail();
    for (const [port, owner] of Object.entries(
      value.world.stationControl || {},
    ))
      if (!PORTS[port] || !content.nations[owner]) fail();
    for (const f of value.world.fronts)
      if (
        !plain(f) ||
        !CAMPAIGNS.some(
          (d) =>
            d.id === f.id &&
            d.attacker === f.attacker &&
            d.defender === f.defender &&
            JSON.stringify(d.from) === JSON.stringify(f.from) &&
            JSON.stringify(d.to) === JSON.stringify(f.to) &&
            JSON.stringify(d.territories) === JSON.stringify(f.territories),
        ) ||
        !text(f.id) ||
        !text(f.name) ||
        !finite(f.progress, 0, 1) ||
        !finite(f.momentum, -16, 16) ||
        !finite(f.days, 1, 10000) ||
        !Array.isArray(f.territories) ||
        !finite(f.attackerSupply, 0, 1) ||
        !finite(f.defenderSupply, 0, 1)
      )
        fail();
  }
  try {
    validatePolitics(value);
    validateDiplomaticOffers(value);
  } catch {
    fail();
  }
  validateAviation(value, content);
  const safe = initializeCampaign(structuredClone(value), content);
  safe.paused = true;
  delete safe.resumeAfterDecision;
  delete safe.pauseReason;
  safe.speed = SPEEDS.some(([v]) => v === safe.speed)
    ? safe.speed
    : [...SPEEDS].reverse().find(([v]) => v <= safe.speed)?.[0] ?? 1;
  return safe;
}

export function saveEnvelope(state) {
  const copy = structuredClone(state);
  copy.savedAt = new Date().toISOString();
  copy.paused = true;
  return copy;
}
export function exportSave(state) {
  return JSON.stringify(saveEnvelope(state), null, 2);
}
export function saveFileName(state) {
  return `WNT1922-${state.player}-${new Date(state.day * DAY).toISOString().slice(0, 10)}.json`;
}
