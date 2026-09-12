import { CATALOG } from "../worker/catalog-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as sim from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import {
  DIPLOMACY,
  diplomaticBlock,
  readyProvocationFleet,
} from "../mechanics/diplomacy-rules.mjs";
import {
  fleetStats,
  fleetPosition,
  invalidateOperations,
} from "../mechanics/task-forces.mjs";
import {
  aircraftPrice,
  aircraftBlock,
  orderAircraft,
  productionBlock,
} from "../mechanics/naval-resources.mjs";
import { LEVELS, levelYear } from "../mechanics/research-tree.mjs";
import { createSoundTracker } from "../ui/sound.mjs";
import { playbackVolume } from "../ui/music.mjs";
import {
  reportTitle,
  engagedComposition,
  battleDetails,
} from "../ui/ministry-view.mjs";
import { applyCommand } from "../mechanics/game-actions.mjs";
import {
  organizeSupport,
  minuteSupport,
} from "../mechanics/support-operations.mjs";
import { portSummary } from "../mechanics/ports.mjs";
import { NODES, distanceNm } from "../mechanics/world.mjs";
import { anchoredShips } from "../mechanics/port-operations.mjs";
import {
  campaignMinutes,
  setCampaignMinutes,
} from "../mechanics/campaign-clock.mjs";
import { replenishmentRelief } from "../mechanics/support-effects.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
const bundle = structuredClone(CATALOG);
const start = (nation = "JPN", campaign = "in_good_faith_1936") => {
  const s = sim.newGame(bundle, nation, 1, campaign);
  s.nations[nation].gold = s.nations[nation].industry = 1e7;
  s.nations[nation].influence = 500;
  return s;
};
const funds = (n) =>
  Object.fromEntries(["gold", "influence", "industry"].map((k) => [k, n[k]]));
function war(s) {
  const r = s.relations["JPN-USA"];
  Object.assign(r, { war: true, warSince: s.day, allied: false });
  return r;
}
function rollSeed(chance, accept) {
  for (let seed = 1; seed < 1e6; seed++) {
    const v = { seed };
    if (sim.rng(v) < chance / 100 === accept) return seed;
  }
  throw Error("No seed");
}
test("all 126 doctrine levels agree with engine availability and future work has honest costs", () => {
  const s = start("GBR", "campaign_1922");
  for (const [key, descriptions] of Object.entries(LEVELS)) {
    assert.equal(descriptions.length, 9);
    for (let level = 1; level < 9; level++) {
      s.nations.GBR.tech[key] = level;
      assert.equal(
        sim.projectPrice(s, key).targetYear,
        levelYear(key, level + 1),
      );
    }
    s.nations.GBR.tech[key] = 1;
  }
  s.campaignId = "in_good_faith_1936";
  s.day = Date.parse("1936-01-01") / 86400000;
  const c = contentFor(bundle, s),
    model = c.nations.GBR.aircraft.find((a) => a.type_year > 1936);
  const p = aircraftPrice(s, c, model.id, 1, s.player);
  assert.equal(p.days, 90);
  assert.match(aircraftBlock(s, c, model.id), /Development opens/);
  assert.throws(
    () => orderAircraft(s, c, model.id, 1, s.player),
    /Development opens/,
  );
  s.day = Date.parse(model.type_year + "-01-01") / 86400000;
  assert.deepEqual(
    aircraftPrice(s, c, model.id, 1, s.player),
    p,
  );
});
test("every campaign and navy can order both support types without adding opening warships", () => {
  for (const campaign of ["campaign_1922", "in_good_faith_1936"])
    for (const id of ["GBR", "USA", "JPN", "FRA", "ITA", "DEU", "SOV"]) {
      const s = start(id, campaign),
        c = contentFor(bundle, s),
        before = sim.fleetSummary(s, c).total;
      for (const type of ["AD", "AO"]) {
        const cl = c.nations[id].designs
          .map((id) => c.classes[id])
          .find(
            (cl) =>
              (cl.type === type || cl.supportHybrid) &&
              !productionBlock(s, c, cl.id),
          );
        assert.ok(cl, id + " " + campaign + " " + type);
        const group = sim.orderShip(s, c, cl.id);
        assert.equal(
          s.nations[id].groups.find((g) => g.id === group).service,
          "support",
        );
      }
      assert.equal(sim.fleetSummary(s, c).total, before);
    }
});
test("war has a distinct sound cue and paused music has one-third gain", () => {
  const tracker = createSoundTracker(),
    s = start();
  tracker.next(s);
  war(s);
  assert.equal(tracker.next(s), "war");
  assert.equal(tracker.next(s), null);
  assert.ok(Math.abs(playbackVolume(0.6, false) - 0.2) < 1e-12);
  assert.equal(playbackVolume(0.6, true), 0.6);
  assert.equal(playbackVolume(0, false), 0);
});
test("coastal defense reports name the action and shore forces instead of None", () => {
  const result = {
    conditions: [],
    sunk: 0,
    damaged: 0,
    tons: 0,
    damagedTons: 0,
  };
  const r = {
    kind: "port",
    portId: "hawaii",
    operation: "shore",
    a: "JPN",
    b: "USA",
    resultA: result,
    resultB: result,
  };
  assert.match(reportTitle(r), /Coastal defense action.*Pearl/);
  assert.match(engagedComposition(r, "B"), /Shore batteries/);
  assert.doesNotMatch(battleDetails(r), /None/);
});
function deliverSupport(s, c, type) {
  const n = s.nations[s.player];
  n.crew = 1e7;
  const id = sim.orderShip(s, c, "us_" + type + "_1932"),
    g = n.groups.find((g) => g.id === id);
  g.status = "active";
  g.dockPort = "hawaii";
  organizeSupport(s, c);
  const f = n.fleets.find((f) => f.id === g.fleetId);
  assert.equal(f.role, "support");
  return { g, f };
}
test("depots provide only local, crewed capacity and can be destroyed at anchor", () => {
  const s = start("USA"),
    c = contentFor(bundle, s),
    before = portSummary(s, c, "hawaii").capacity,
    { g, f } = deliverSupport(s, c, "depot");
  assert.ok(portSummary(s, c, "hawaii").capacity > before);
  assert.equal(portSummary(s, c, "norfolk").depotSupport, 0);
  g.atSea = true;
  f.route = [NODES.wake];
  invalidateOperations(s);
  assert.equal(portSummary(s, c, "hawaii").capacity, before);
  g.atSea = false;
  f.route = [NODES.hawaii];
  invalidateOperations(s);
  assert.ok(anchoredShips(s, c, "USA", "hawaii").includes(g));
  const result = sim.damageFleet(
    s,
    c,
    "USA",
    "pacific",
    100,
    { surface: 1e6, aa: 0, asw: 0, sub: 0 },
    "anchorage strike",
    null,
    0.3,
    1,
    [g],
  );
  assert.equal(g.status, "sunk");
  assert.equal(result.sunkComposition.AD, 1);
  assert.ok(result.sailorsLost + result.sailorsRescued > 0);
  assert.equal(portSummary(s, c, "hawaii").capacity, before);
  validateSave(s, bundle);
});
test("oilers must physically meet a fleet, consume cargo, and provide temporary delivered stores", () => {
  const s = start("USA"),
    c = contentFor(bundle, s),
    n = s.nations.USA,
    { g, f } = deliverSupport(s, c, "oiler"),
    target = n.fleets.find((x) => x.role === "cruiser"),
    now = campaignMinutes(s);
  Object.assign(target, {
    route: [NODES.hawaii],
    phase: "patrol",
    fuelNm: 2000,
    maxRangeNm: 10000,
  });
  Object.assign(f, {
    supportTarget: target.id,
    route: [NODES.wake],
    phase: "patrol",
    nextPlanAt: now + 20000,
    supportCargo: 14000,
    arriveAt: now,
    departAt: now,
  });
  g.atSea = true;
  const before = target.fuelNm;
  minuteSupport(s, c, "USA", f);
  assert.equal(target.fuelNm, before);
  assert.equal(f.supportCargo, 14000);
  f.route = [NODES.hawaii];
  invalidateOperations(s);
  minuteSupport(s, c, "USA", f);
  assert.ok(target.fuelNm > before);
  assert.ok(f.supportCargo < 14000);
  assert.ok(replenishmentRelief(s, target) > 0);
  s.day += 3;
  assert.equal(replenishmentRelief(s, target), 0);
  validateSave(s, bundle);
});
test("automatic oilers sail to a fleet, replenish it, and return damaged hulls for paid repair", () => {
  const s = start("USA"),
    c = contentFor(bundle, s),
    n = s.nations.USA,
    { g, f } = deliverSupport(s, c, "oiler"),
    now = campaignMinutes(s),
    target = n.fleets.find((x) => x.role === "cruiser");
  for (const other of n.fleets)
    if (other !== f)
      Object.assign(other, {
        phase: "port",
        route: [NODES.norfolk],
        arriveAt: now,
        departAt: now,
      });
  Object.assign(target, {
    phase: "patrol",
    route: [NODES.central_pacific],
    arriveAt: now,
    departAt: now,
    fuelNm: 2000,
    maxRangeNm: 10000,
  });
  invalidateOperations(s);
  let prior = fleetPosition(s, f),
    delivered = false;
  for (let minute = 5; minute <= 12 * 1440; minute += 5) {
    setCampaignMinutes(s, now + minute);
    minuteSupport(s, c, "USA", f);
    const position = fleetPosition(s, f);
    assert.ok(
      distanceNm(prior, position) <= f.speed * 5 / 60 + 0.005,
      `five-minute movement respects sailing speed: ${distanceNm(prior, position)} nm vs ${f.speed*5/60} at ${minute} (${f.phase})`,
    );
    prior = position;
    if (f.deliveredCargo > 0) {
      delivered = true;
      break;
    }
  }
  assert.ok(delivered, "admiral finds and meets the remote fleet");
  assert.ok(target.fuelNm > 2000);
  assert.ok(g.atSea);
  g.health = 0.5;
  f.nextPlanAt = campaignMinutes(s);
  const damagedAt = campaignMinutes(s);
  for (let minute = 5; minute <= 12 * 1440 && g.status !== "repair"; minute += 5) {
    setCampaignMinutes(s, damagedAt + minute);
    minuteSupport(s, c, "USA", f);
  }
  assert.equal(g.status, "repair");
  assert.equal(g.atSea, false);
  assert.ok(g.dockPort);
  assert.equal(g.fleetId, undefined);
  validateSave(s, bundle);
});
test("admirals relocate depots toward overloaded ports without granting capacity in transit", () => {
  const s = start("USA"),
    c = contentFor(bundle, s),
    n = s.nations.USA,
    { g, f } = deliverSupport(s, c, "depot"),
    now = campaignMinutes(s);
  for (const other of n.fleets)
    if (other !== f)
      Object.assign(other, {
        route: [NODES.wake],
        arriveAt: now,
        departAt: now,
        phase: "patrol",
      });
  invalidateOperations(s);
  let sailed = false,
    arrived = false;
  for (let minute = 5; minute <= 24 * 1440; minute += 5) {
    setCampaignMinutes(s, now + minute);
    minuteSupport(s, c, "USA", f);
    if (g.atSea) {
      sailed = true;
      assert.equal(portSummary(s, c, "wake").depotSupport, 0);
    }
    if (f.phase === "port" && f.port === "wake") {
      arrived = true;
      break;
    }
  }
  assert.ok(sailed);
  assert.ok(arrived, "depot reaches the overloaded base");
  assert.ok(portSummary(s, c, "wake").depotSupport > 0);
  assert.equal(portSummary(s, c, "hawaii").depotSupport, 0);
  validateSave(s, bundle);
});
