import { progressEngagements } from "../mechanics/engagements.mjs";
import { finishBattle } from "./battle-helper.mjs";
import { POLITICAL, POLITICAL_1922 } from "../worker/map-assets.mjs";
import { CATALOG } from "../worker/catalog-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  newGame,
  advanceMinutes,
  monthlyIncome,
  yardLoad,
  setTreatyPolicy,
  diplomaticAction,
  resolveBattle,
  resolveAirAttack,
} from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import {
  campaignMinutes,
  setCampaignMinutes,
} from "../mechanics/campaign-clock.mjs";
import { supplyDetails } from "../mechanics/logistics.mjs";
import { treatyAssessment } from "../mechanics/treaty-policy.mjs";
import { readyProvocationFleet } from "../mechanics/diplomacy-rules.mjs";
import {
  expireProvocations,
  opposingProvocations,
} from "../mechanics/provocation.mjs";
import {
  fleetStats,
  fleetPosition,
  minuteOperations,
  dailyOperations,
  orderFleet,
} from "../mechanics/task-forces.mjs";
import { NODES } from "../mechanics/world.mjs";
import { validateAviation } from "../mechanics/aviation-validation.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
import { geometryPath } from "../ui/projection.mjs";
import { aircraftCatalogView } from "../ui/ministry-view.mjs";
import { aircraftHover } from "../ui/inspection-view.mjs";
import { diplomacyView } from "../ui/diplomacy-view.mjs";
import {
  strategicDamage,
  repairIndustry,
  strategicAirPlanning,
} from "../mechanics/strategic-air.mjs";
import {
  queueAirStrike,
  minuteAirOperations,
} from "../mechanics/air-operations.mjs";
import { pacificOpening } from "../mechanics/pacific-opening.mjs";
import { dailyAviation } from "../mechanics/aviation-transfer.mjs";
import { airConditions } from "../mechanics/air-conditions.mjs";
import { searchSector } from "../mechanics/air-conditions.mjs";
const bundle = structuredClone(CATALOG);
const start = (id = "JPN", campaign = "in_good_faith_1936") => {
  const s = newGame(bundle, id, 20260021, campaign);
  s.decisions = [];
  s.paused = false;
  s.autoPause = false;
  return [s, contentFor(bundle, s), s.nations[id]];
};
test("all aircraft hovers use recorded or operational values and search bearings stay on the compass", () => {
  for (const campaign of Object.keys(bundle.campaigns)) {
    const [s, c] = start("USA", campaign);
    for (const n of Object.values(c.nations))
      for (const a of [...n.aircraft, ...n.armyAircraft])
        assert.doesNotMatch(
          aircraftHover(a, c),
          /<dd>0 (?:km|m|kg)\b|NaN|DERIVED, NOT ASSERTED/,
        );
    for (const f of s.nations.USA.fleets) {
      const sector = searchSector(s, f, [0, 0]);
      assert.ok(sector >= 0 && sector < 360);
    }
  }
});
test("all 14 starts retain valid aircraft ledgers and a US fleet on both coasts", () => {
  for (const campaign of Object.keys(bundle.campaigns))
    for (const id of Object.keys(bundle.nations)) {
      const [s, c] = start(id, campaign);
      validateAviation(s, c);
      validateSave(s, bundle);
      const fleets = s.nations.USA.fleets;
      assert.ok(fleets.some((f) => f.port === "norfolk"));
      assert.ok(
        fleets.some((f) =>
          ["san_diego", "hawaii", "puget", "mare_island"].includes(f.port),
        ),
      );
    }
});
test("Antarctica stays in the southern polar band at every seam rotation", () => {
  const feature = POLITICAL.features.find((f) => f.name === "Antarctica");
  for (let angle = -180; angle <= 180; angle += 30) {
    const path = geometryPath(feature.geometry, angle);
    assert.doesNotMatch(path, /NaN|Infinity/);
    const points = [...path.matchAll(/[ML]([\d.-]+),([\d.-]+)/g)].map((m) => [
      +m[1],
      +m[2],
    ]);
    assert.ok(points.every((p) => p[1] > 510));
    assert.ok(points.some((p) => p[1] > 570));
    assert.ok(
      Math.max(...points.map((p) => p[0])) -
        Math.min(...points.map((p) => p[0])) >
        500,
    );
  }
});
test("shortest hull endurance changes supply at the same location", () => {
  const [s, c, n] = start(),
    f = n.fleets.find((f) => f.role === "carrier");
  f.route = [[145, 30]];
  f.departAt = f.arriveAt = campaignMinutes(s);
  const before = supplyDetails(s, c, "JPN", f),
    cl = c.classes[n.groups.find((g) => g.fleetId === f.id).classId],
    old = cl.range;
  cl.range = 500;
  const after = supplyDetails(s, c, "JPN", f);
  assert.ok(after.enduranceFactor < before.enduranceFactor);
  assert.ok(after.factor < before.factor);
  cl.range = old;
});
test("treaty policies assess actual excess, charge switching fees, and cease charging on expiry", () => {
  const [s, c, n] = start();
  const disclose = treatyAssessment(s, c, "JPN", "disclose"),
    numbers = treatyAssessment(s, c, "JPN", "false_numbers"),
    tons = treatyAssessment(s, c, "JPN", "false_tonnage");
  assert.ok(disclose.gold > numbers.gold && disclose.gold > tons.gold);
  assert.ok(numbers.excessHulls > 0 && tons.excessTons > 0);
  n.gold = 100000;
  const policy =
    n.treatyPolicy === "false_numbers" ? "false_tonnage" : "false_numbers";
  setTreatyPolicy(s, policy);
  assert.equal(n.gold, 98800);
  assert.equal(monthlyIncome(s, c).treaty.policy, policy);
  s.day = s.treatyUntil + 1;
  assert.equal(treatyAssessment(s, c).gold, 0);
});
test("aircraft hover shows specs and government catalog is folded by default", () => {
  const [s, c] = start();
  const a = c.nations.JPN.aircraft.find((a) => a.name === "Raiden"),
    tip = aircraftHover(a, c);
  assert.match(tip, /860 km/);
  assert.doesNotMatch(tip, /DERIVED|ASSERTED|comparator|drag polar/);
  const html = aircraftCatalogView(s, c);
  assert.match(
    html,
    /<details class="government-aircraft" data-detail-key="government-aircraft">/,
  );
  assert.doesNotMatch(html, /title="[^"]*(?:DERIVED|ASSERTED)/);
  for (const [id, n] of Object.entries(c.nations))
    assert.ok(
      n.armyAircraft.some(
        (a) =>
          a.role === "strategic_bomber" &&
          a.name &&
          !/generation|coastal patrol|maritime strike \d/i.test(a.name),
      ),
      id,
    );
});
test("one-day provocation overlap persists beyond expiry and seeks exactly one battle", () => {
  const [s, c] = start(),
    fa = readyProvocationFleet(s, c, "USA", "JPN");
  diplomaticAction(s, "USA", "provoke", "JPN", c, fa.id);
  setCampaignMinutes(s, campaignMinutes(s) + 89 * 1440);
  const fb = readyProvocationFleet(s, c, "JPN", "USA");
  diplomaticAction(s, "JPN", "provoke", "USA", c, fb.id);
  setCampaignMinutes(s, campaignMinutes(s) + 2 * 1440);
  expireProvocations(s);
  assert.ok(opposingProvocations(s, "JPN", fa.id, "USA", fb.id));
  const at = campaignMinutes(s),
    node = s.provocations[0].node;
  for (const f of [fa, fb])
    Object.assign(f, {
      route: [[...NODES[node]]],
      phase: "patrol",
      departAt: at,
      arriveAt: at,
      nextPlanAt: at + 100,
      lastBattle: -1e9,
    });
  let battles = 0;
  minuteOperations(s, c, (a, b, r, x, y, pos) => {
    battles++;
    return resolveBattle(s, c, a, b, r, x, y, pos);
  });
  assert.equal(battles, 1);
  for(const report of s.reports) finishBattle(s,c,report);
  assert.equal(s.provocations.length, 0);
  assert.equal(s.relations["JPN-USA"].war, false);
});
test("peacetime offensive orders are blocked and regrouping preserves a demonstration", () => {
  const [s, c, n] = start(),
    f = readyProvocationFleet(s, c, "USA");
  assert.throws(() => orderFleet(s, c, f.id, "raid"), /during war/);
  diplomaticAction(s, "USA", "provoke", "JPN", c, f.id);
  const ids = n.groups.filter((g) => g.fleetId === f.id).map((g) => g.id),
    pos = fleetPosition(s, f);
  dailyOperations(s, c);
  assert.deepEqual(
    n.groups.filter((g) => g.fleetId === f.id).map((g) => g.id),
    ids,
  );
  assert.deepEqual(fleetPosition(s, f), pos);
});
test("industrial bombing affects production once and resource-funded repairs restore it", () => {
  const [s, c, n] = start("GBR");
  const target = s.nations.DEU,
    model = c.nations.GBR.armyAircraft.find(
      (a) => a.role === "strategic_bomber" && a.type_year === 1942,
    ),
    op = {
      operation: "strategic",
      targetNation: "DEU",
      sourcePort: "portsmouth",
      targetId: "kiel",
      industrialTarget: "industry",
      strikes: 12,
      escorts: 2,
      airWing: [{ model: model.id, role: "bomber", count: 12, crewed: 12 }],
    };
  const before = monthlyIncome(s, c, "DEU").industry;
  const r = strategicDamage(s, c, "GBR", op, 120);
  assert.ok(r.damage > 0);
  assert.ok(monthlyIncome(s, c, "DEU").industry < before);
  const damaged = target.industrialDamage.industry;
  setCampaignMinutes(s, campaignMinutes(s) + 1441);
  const gold = target.gold;
  repairIndustry(s);
  assert.ok(target.industrialDamage.industry < damaged && target.gold < gold);
  target.gold = target.industry = 0;
  const frozen = target.industrialDamage.industry;
  repairIndustry(s);
  assert.equal(target.industrialDamage.industry, frozen);
});
test("a complete strategic sortie launches real bombers, damages industry and returns survivors without duplicating aircraft", () => {
  const b = structuredClone(bundle);
  b.campaigns.in_good_faith_1936.scenario.start = "1942-06-01";
  const s = newGame(b, "GBR", 20260021),
    c = contentFor(b, s),
    n = s.nations.GBR;
  s.decisions = [];
  Object.assign(s.relations["DEU-GBR"], { war: true, warSince: s.day });
  const base = n.airBases.rosyth,
    wing = base.governmentWing.find((w) => w.role === "bomber"),
    model = c.nations.GBR.armyAircraft.find((a) => a.id === wing.model);
  const added = 36 - wing.count;
  wing.count = wing.crewed = 36;
  n.governmentAircraft[model.id] += added;
  n.governmentAviators += added * model.crew.normal;
  base.supplies = 5000;
  const owned = Object.values(n.governmentAircraft).reduce((v, x) => v + x, 0),
    lost = n.governmentLosses.planes;
  let queued = false;
  for (let i = 0; i < 48 && !queued; i++) {
    setCampaignMinutes(s, campaignMinutes(s) + 60);
    queued = queueAirStrike(s, c, "GBR", {
      sourcePort: "rosyth",
      targetNation: "DEU",
      targetKind: "port",
      targetId: "heligoland",
      operation: "strategic",
      industrialTarget: "industry",
    });
  }
  assert.ok(
    queued,
    "A stocked in-range bomber base can launch in suitable conditions",
  );
  let airborne = false;
  for (let minute = 0; minute < 1440 && n.airSorties.length; minute++) {
    setCampaignMinutes(s, campaignMinutes(s) + 1);
    progressEngagements(s,c);
    minuteAirOperations(s, c, (id, op, pos) =>
      resolveAirAttack(s, c, id, op, pos),
    );
    airborne ||= n.airSorties.some((o) => o.phase === "outbound");
    validateAviation(s, c);
  }
  assert.ok(airborne);
  assert.equal(n.airSorties.length, 0);
  assert.equal(s.reports.length, 0, 'Routine strategic bombing stays in background attrition');
  assert.equal(s.backgroundEngagements.length, 0, 'The resolved minor engagement is discarded');
  assert.equal(s.attritionLedger.length, 1);
  assert.ok(s.attritionLedger[0].sides.DEU.industryDamage > 0);
  assert.equal(s.attritionLedger[0].sides.GBR.governmentPlanesLost, n.governmentLosses.planes - lost);
  assert.ok(s.nations.DEU.industrialDamage.industry > 0);
  assert.equal(
    Object.values(n.governmentAircraft).reduce((v, x) => v + x, 0) +
      n.governmentLosses.planes -
      lost,
    owned,
  );
  validateSave(s, b);
});
test("Pacific preparation gives real fleet routes and coordinates available opening targets without fixed losses", () => {
  const b = structuredClone(bundle);
  b.campaigns.in_good_faith_1936.scenario.start = "1941-11-01";
  const s = newGame(b, "JPN", 20260021),
    c = contentFor(b, s),
    n = s.nations.JPN;
  s.decisions = [];
  const positions = new Map(n.fleets.map((f) => [f.id, fleetPosition(s, f)]));
  pacificOpening(s, c);
  assert.ok(s.pacificOpening.prepared);
  assert.ok(
    s.pacificOpening.fleets.length > 0,
    "At least one capable carrier force must be assigned",
  );
  for (const f of n.fleets)
    assert.deepEqual(fleetPosition(s, f), positions.get(f.id));
  const begin = Date.parse("1941-12-07T17:55:00Z") / 60000;
  s.relations["JPN-USA"].war = s.relations["GBR-JPN"].war = true;
  setCampaignMinutes(s, begin + 12);
  pacificOpening(s, c);
  assert.ok(Object.keys(s.pacificOpening.targets).includes("singapore"));
  assert.equal(s.reports.length, 0, "No scripted ship losses");
});
