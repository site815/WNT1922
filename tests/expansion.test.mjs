import { resolveBattleToEnd } from "./battle-helper.mjs";
import { CATALOG } from "../worker/catalog-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as sim from "../mechanics/engine.mjs";
import { contentFor, campaignList } from "../mechanics/campaign-content.mjs";
import {
  automaticDraft,
  commissionDraft,
  evaluateDesign,
  DESIGN_ROLES,
} from "../mechanics/designer.mjs";
import { validateSave, exportSave } from "../mechanics/state-io.mjs";
import {
  aircraftModels,
  aircraftSeats,
  staffAircraft,
  airPower,
  aircraftSummary,
  loseAircraft,
  dailyResources,
  setFacilityFunding,
  productionBlock,
} from "../mechanics/naval-resources.mjs";
import {
  recoverDue,
  recordCasualties,
  awaitingRecovery,
} from "../mechanics/recovery.mjs";
import {
  campaignMinutes,
  setCampaignMinutes,
  HISTORICAL_POLAND,
} from "../mechanics/campaign-clock.mjs";
import {
  apply1922Decision,
  historical1922Decisions,
  retireReplacedTreatyHulls,
} from "../mechanics/vanilla.mjs";
import { supplyDetails } from "../mechanics/logistics.mjs";
import { NODES, MAP_CAPITALS, PORT_LOCATIONS } from "../mechanics/world.mjs";
import { resourcesView, alertItems, alertsView } from "../ui/ministry-view.mjs";
const b = structuredClone(CATALOG);
const start = (id = "JPN", campaign = "in_good_faith_1936") => {
  const s = sim.newGame(b, id, 4518, campaign);
  s.autoPause = false;
  s.paused = false;
  return s;
};

test("both campaigns support seven navies with separate merchants and durable saves", () => {
  assert.equal(campaignList(b).length, 2);
  for (const campaign of Object.keys(b.campaigns))
    for (const id of Object.keys(b.nations)) {
      const s = start(id, campaign),
        c = contentFor(b, s);
      assert.equal(Object.keys(s.nations).length, 7);
      assert.equal(sim.yearOf(s), campaign === "campaign_1922" ? 1922 : 1936);
      sim.advanceDays(s, b, 1);
      const loaded = validateSave(JSON.parse(exportSave(s)), b);
      assert.equal(loaded.campaignId, campaign);
      assert.equal(loaded.nations[id].gold, s.nations[id].gold);
      assert.equal(
        sim.merchantSummary(s, c).total,
        c.nations[id].merchants.hulls,
      );
    }
  const c = contentFor(b, "campaign_1922");
  assert.equal(c.nations.ITA.merchants.hulls, 893);
  assert.equal(c.nations.SOV.merchants.estimated, true);
  assert.match(c.nations.SOV.merchants.note, /PROVISIONAL/);
  assert.equal(b.nations.SOV.merchants.hulls, 575);
  assert.match(b.nations.FRA.title, /Revanche/);
});
test("1922 AI respects dispositions, player can reject, and replacement hulls retire", () => {
  const s = start("USA", "campaign_1922"),
    c = contentFor(b, s);
  assert.equal(
    s.nations.JPN.groups.find((g) => g.id === "h-ijn_akagi").classId,
    "akagi_cv",
  );
  assert.ok(
    s.nations.USA.groups.some(
      (g) => g.treatyFate === "scrap" && g.status === "building",
    ),
  );
  apply1922Decision(s, c, "comply");
  assert.ok(
    s.nations.USA.groups
      .filter((g) => g.treatyFate === "scrap")
      .every((g) => g.status === "scrapped"),
  );
  for (const id of ["h-uss_colorado", "h-uss_west_virginia"])
    s.nations.USA.groups.find((g) => g.id === id).status = "active";
  retireReplacedTreatyHulls(s, c, "USA");
  assert.ok(
    s.nations.USA.groups
      .filter((g) => g.treatyFate === "scrap_on_replacement")
      .every((g) => g.status === "scrapped"),
  );
  apply1922Decision(s, c, "reject");
  assert.equal(s.nations.USA.treatyPolicy, "false_numbers");
  assert.ok(!("score" in s.relations["JPN-USA"]));
  setCampaignMinutes(s, Date.parse("1923-09-01T00:00:00Z") / 60000);
  historical1922Decisions(s, c, sim.queueDecision);
  assert.equal(
    s.nations.JPN.groups.find((g) => g.id === "h-ijn_amagi").status,
    "scrapped",
  );
  assert.equal(
    s.nations.JPN.groups.find((g) => g.id === "h-ijn_kaga").classId,
    "kaga_cv",
  );
});
test("automatic and manual drafts obey period, displacement and fee constraints and survive reload", () => {
  for (const campaign of Object.keys(b.campaigns))
    for (const id of Object.keys(b.nations))
      for (const role of Object.keys(DESIGN_ROLES)) {
        const s = start(id, campaign),
          c = contentFor(b, s),
          r = automaticDraft(s, c, role),
          quote = evaluateDesign(r, id),
          before = s.nations[id].gold;
        assert.ok(quote.valid, `${campaign} ${id} ${role}`);
        const made = commissionDraft(s, c, r),
          updated = contentFor(b, s);
        assert.equal(s.nations[id].gold, before - made.fee);
        assert.equal(updated.classes[made.ship.id].tons, quote.tons);
        assert.equal(
          contentFor(b, validateSave(JSON.parse(exportSave(s)), b)).classes[
            made.ship.id
          ].caliber,
          r.caliber,
        );
      }
  const s = start(),
    c = contentFor(b, s),
    r = automaticDraft(s, c, "DD"),
    gold = s.nations.JPN.gold;
  for (const bad of [
    { ...r, hp: 1 },
    { ...r, year: 2026 },
    { ...r, armor: 10000 },
    { ...r, guns: 200 },
  ])
    assert.throws(() => commissionDraft(s, c, bad));
  assert.equal(s.nations.JPN.gold, gold);
  s.nations.JPN.gold = 0;
  assert.throws(() => commissionDraft(s, c, r), /gold/);
  assert.equal(s.nations.JPN.customDesigns.length, 0);
});
test("draft hull orders spend all resources, occupy yards, and retain recipes through save validation", () => {
  const s = start(),
    c = contentFor(b, s),
    made = commissionDraft(s, c, automaticDraft(s, c, "DD")),
    updated = contentFor(b, s),
    n = s.nations.JPN;
  n.gold = n.industry = 1e6;
  n.influence = 500;
  const price = sim.shipPrice(s, updated, made.ship.id),
    before = { gold: n.gold, industry: n.industry, influence: n.influence };
  sim.orderShip(s, updated, made.ship.id);
  for (const k of Object.keys(before)) assert.equal(n[k], before[k] - price[k]);
  assert.ok(
    n.groups.some((g) => g.classId === made.ship.id && g.status === "building"),
  );
  assert.doesNotThrow(() => validateSave(s, b));
});
test("period-qualified drafts can be ordered under the monthly treaty assessment system", () => {
  for (const [id, role, expected] of [
    ["DEU", "SS", /^$/],
    ["USA", "BB", /^$/],
    ["SOV", "BB", /^$/],
  ]) {
    const s = start(id, "campaign_1922"),
      c = contentFor(b, s),
      made = commissionDraft(s, c, automaticDraft(s, c, role));
    assert.match(
      sim.shipOrderBlock(s, contentFor(b, s), made.ship.id),
      expected,
    );
  }
});
test("full aircrews are indivisible and reserve aircraft count toward the signed aviator deficit", () => {
  const s = start("USA"),
    c = contentFor(b, s),
    n = s.nations.USA,
    model = aircraftModels(c, "USA").find((a) => aircraftSeats(a) >= 2),
    seats = aircraftSeats(model);
  for (const id of Object.keys(n.aircraft)) n.aircraft[id] = 0;
  for (const g of n.groups) g.airWing = [];
  n.airBases = {};
  n.airTransfers = [];
  const g = n.groups.find(
    (g) => g.status === "active" && c.classes[g.classId].air >= 10,
  );
  n.aircraft[model.id] = 10;
  g.airWing = [{ model: model.id, role: "strike", count: 4, crewed: 0 }];
  n.aviators = seats - 1;
  staffAircraft(s, c, "USA");
  assert.equal(airPower(s, c, "USA", g).strike, 0);
  assert.equal(aircraftSummary(s, c).aviatorBalance, seats - 1 - 10 * seats);
  n.aviators = seats * 2 + 1;
  staffAircraft(s, c, "USA");
  assert.equal(g.airWing[0].crewed, 2);
  assert.equal(aircraftSummary(s, c).uncrewed, 8);
  n.aviators = 10 * seats;
  staffAircraft(s, c, "USA");
  assert.equal(aircraftSummary(s, c).aviatorBalance, 0);
  assert.equal(aircraftSummary(s, c).uncrewed, 0);
});
test("losses plus rescues conserve aircraft and personnel; recovery returns each survivor exactly once", () => {
  const s = start(),
    c = contentFor(b, s),
    n = s.nations.JPN,
    g = n.groups.find((g) => g.airWing?.some((w) => w.count > 20)),
    before = {
      planes: aircraftSummary(s, c).total,
      aviators: n.aviators,
      crew: n.crew,
    },
    now = campaignMinutes(s);
  const loss = loseAircraft(s, c, "JPN", g, 1, {
    rescue: 0.6,
    airframeRescue: 0.2,
  });
  assert.equal(
    before.planes - aircraftSummary(s, c).total,
    loss.planes + loss.planesRescued,
  );
  assert.equal(
    before.aviators - n.aviators,
    loss.aviators + loss.aviatorsRescued,
  );
  n.crew -= 100;
  const sailors = recordCasualties(s, n, "sailors", 100, { rescue: 0.6 });
  assert.deepEqual(sailors, { lost: 40, rescued: 60, exposed: 100 });
  recoverDue(s, n);
  assert.equal(n.crew, before.crew - 100);
  setCampaignMinutes(s, now + 30 * 1440);
  recoverDue(s, n);
  const after = structuredClone(n.casualties);
  assert.equal(n.crew, before.crew - 40);
  assert.equal(n.aviators, before.aviators - loss.aviators);
  assert.equal(aircraftSummary(s, c).total, before.planes - loss.planes);
  recoverDue(s, n);
  assert.deepEqual(n.casualties, after);
  assert.equal(n.recoveryQueue.length, 0);
  staffAircraft(s, c, "JPN");
  assert.doesNotThrow(() => validateSave(s, b));
});
test("battle casualty reports reconcile both governments and never allocate dead aircrews mid-battle", () => {
  const s = start(),
    c = contentFor(b, s);
  for (const n of Object.values(s.nations))
    for (const f of n.fleets) f.aggressiveBattle = true;
  const before = Object.fromEntries(
    ["JPN", "USA"].map((id) => [id, structuredClone(s.nations[id].casualties)]),
  );
  const a = s.nations.JPN.fleets.find((f) => f.role === "carrier"),
    enemy = s.nations.USA.fleets.find((f) => f.role === "carrier");
  const report = resolveBattleToEnd(
    s,
    c,
    "JPN",
    "USA",
    "pacific",
    a.id,
    enemy.id,
  );
  assert.ok(report);
  for (const [id, result] of [
    ["JPN", report.resultA],
    ["USA", report.resultB],
  ])
    for (const [type, prefix] of [
      ["sailors", "sailors"],
      ["aviators", "aviators"],
      ["aircraft", "planes"],
    ]) {
      assert.equal(
        s.nations[id].casualties[type].lost - before[id][type].lost,
        result[prefix + "Lost"],
      );
      assert.equal(
        s.nations[id].casualties[type].rescued - before[id][type].rescued,
        result[prefix + "Rescued"],
      );
    }
  assert.doesNotThrow(() => validateSave(s, b));
});
test("naval industry funding scales paid output and yard capacity without consuming stock twice", () => {
  const high = start("SOV"),
    low = structuredClone(high),
    c = contentFor(b, high);
  setFacilityFunding(high, "industryFunding", 1);
  setFacilityFunding(low, "industryFunding", 0.1);
  for (const s of [high, low]) {
    const n = s.nations.SOV;
    n.gold = 1e6;
    n.industry = 10000;
    n.productionModels = { fighter: null, strike: null, scout: null };
    n.crewYear = n.aviatorsYear = 0;
    dailyResources(s, c, () => {});
  }
  assert.ok(
    Math.abs(
      (high.nations.SOV.industry - 10000) / (low.nations.SOV.industry - 10000) -
        10,
    ) < 1e-8,
  );
  assert.ok(
    Math.abs(
      sim.yardLoad(high, c).capacity / sim.yardLoad(low, c).capacity - 10,
    ) < 1e-8,
  );
  const n = low.nations.SOV;
  n.gold = n.gdp = n.gtp = n.merchant.hulls = 0;
  const before = n.industry;
  dailyResources(low, c, () => {});
  assert.equal(n.industry, before);
  assert.equal(sim.yardLoad(low, c).capacity, 0);
});
test("stepped supply uses the nearest accessible port and falls when a nearby port is lost", () => {
  const s = start("ITA"),
    c = contentFor(b, s),
    f = s.nations.ITA.fleets[0];
  f.route = [NODES.taranto];
  f.arriveAt = campaignMinutes(s);
  const near = supplyDetails(s, c, "ITA", f);
  assert.equal(near.port, "taranto");
  assert.equal(near.distanceFactor, 1);
  f.route = [NODES.hawaii];
  const distant = supplyDetails(s, c, "ITA", f);
  assert.ok(distant.distance > 8000);
  assert.ok(distant.distanceFactor >= 0.2 && distant.distanceFactor < 0.5);
  assert.ok(distant.factor < near.factor);
  for (const p of ["taranto", "la_spezia", "tobruk"])
    s.world.portControl[p] = "DEU";
  f.route = [NODES.taranto];
  const cut = supplyDetails(s, c, "ITA", f);
  assert.equal(cut.port, null);
  assert.ok(cut.factor < near.factor);
  assert.equal(Object.keys(MAP_CAPITALS).length, 7);
  assert.ok(Object.keys(PORT_LOCATIONS).length >= 20);
});
test("funding panels include expansions and ministry dispatches appear in the top alert feed", () => {
  const s = start("FRA"),
    c = contentFor(b, s),
    html = resourcesView(s, c);
  for (const field of [
    "industryFunding",
    "schoolFunding",
    "aviatorFunding",
    "aircraftFunding",
  ])
    assert.ok(html.includes(field));
  for (const key of ["industry", "school", "pilots", "aircraft_factory"])
    assert.ok(html.includes('data-id="' + key + '"'));
  sim.addLog(s, "Regression dispatch", "cabinet");
  const dispatch = alertItems(s).find((a) => a.body === "Regression dispatch");
  assert.ok(dispatch);
  assert.match(alertsView(s, c, dispatch.id), /Regression dispatch/);
  assert.ok(productionBlock(s, c, "courbet", "FRA"));
  assert.doesNotMatch(html, /overseas base/i);
});
