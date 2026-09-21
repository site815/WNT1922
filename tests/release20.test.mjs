import { progressEngagements } from "../mechanics/engagements.mjs";
import { CATALOG } from "../worker/catalog-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  newGame,
  diplomaticAction,
  advanceMinutes,
  resolveBattle,
  resolveAirAttack,
  yardLoad,
  monthlyIncome,
  chooseDecision,
  aiTurn,
} from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import {
  DIPLOMACY,
  diplomaticBlock,
  diplomaticTerms,
  readyProvocationFleet,
} from "../mechanics/diplomacy-rules.mjs";
import {
  provocationNode,
  opposingProvocations,
  expireProvocations,
} from "../mechanics/provocation.mjs";
import {
  fleetPosition,
  fleetStats,
  minuteOperations,
  recordContact,
  orderFleet,
} from "../mechanics/task-forces.mjs";
import { minuteAirOperations } from "../mechanics/air-operations.mjs";
import {
  campaignMinutes,
  setCampaignMinutes,
  openingTimeline,
  HISTORICAL_POLAND,
} from "../mechanics/campaign-clock.mjs";
import {
  closeEconomicMonth,
  growthOutlook,
} from "../mechanics/economic-growth.mjs";
import { historicalGDP, HISTORICAL_GDP } from "../mechanics/historical-gdp.mjs";
import { merchantEconomy } from "../mechanics/merchant-economy.mjs";
import { economyFor } from "../mechanics/balance.mjs";
import { politicsTick, PACT_EVENTS } from "../mechanics/war-politics.mjs";
import { diplomacyView } from "../ui/diplomacy-view.mjs";
import { resourceHover } from "../ui/resource-breakdown.mjs";
import { NODES, distanceNm } from "../mechanics/world.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
import {
  setProductionModel,
  dailyResources,
} from "../mechanics/naval-resources.mjs";
const bundle = structuredClone(CATALOG);
const start = (id = "JPN", campaign = "in_good_faith_1936") => {
  const s = newGame(bundle, id, 20260020, campaign);
  s.decisions = [];
  s.paused = false;
  s.autoPause = false;
  return [s, contentFor(bundle, s), s.nations[id]];
};
const money = (n) => ({
  gold: n.gold,
  influence: n.influence,
  industry: n.industry,
});
const approx = (a, b) =>
  assert.ok(
    Math.abs(a - b) < Math.max(1e-8, Math.abs(b) * 1e-10),
    a + " != " + b,
  );

test("diplomacy has six actions; payments and 90-day country/action clocks are independent", () => {
  const [s, c, n] = start();
  Object.assign(n, { gold: 100000, influence: 100, industry: 100000 });
  assert.deepEqual(Object.keys(DIPLOMACY), [
    "visit",
    "sell",
    "cooperate",
    "strategic",
    "sellStrategic",
    "provoke",
  ]);
  for (const action of ["visit", "sell", "cooperate"]) {
    const before = money(n),
      rule = diplomaticTerms(s,c,"USA",action);
    diplomaticAction(s, "USA", action, s.player, c);
    for (const k of Object.keys(before))
      approx(n[k], before[k] - rule.price[k] + (rule.gain[k] || 0));
    approx(n.cooldowns[action + "-USA"], s.day + 90);
    const saved = JSON.stringify(s);
    assert.throws(
      () => diplomaticAction(s, "USA", action, s.player, c),
      /cooldown/,
    );
    assert.equal(JSON.stringify(s), saved);
    assert.equal(diplomaticBlock(s, c, "GBR", action), "");
  }
  const before = money(n);
  const visit = diplomaticTerms(s,c,"GBR","visit");
  diplomaticAction(s, "GBR", "visit", s.player, c);
  assert.equal(n.influence, before.influence + visit.gain.influence);
  const rendered = diplomacyView(s, c);
  assert.doesNotMatch(
    rendered,
    /relations|war pressure|warning risk|ceasefire/i,
  );
  assert.match(rendered, /Sell naval equipment/);
  assert.match(rendered, /progressbar/);
  assert.doesNotMatch(rendered, /data-provocation-country/);
  assert.throws(
    () => diplomaticAction(s, "USA", "insult", s.player, c),
    /valid diplomatic/,
  );
  setCampaignMinutes(s, campaignMinutes(s) + 90 * 1440);
  assert.equal(diplomaticBlock(s, c, "USA", "visit"), "");
  validateSave(s, bundle);
});
test("invalid or unaffordable bilateral orders spend nothing and influence respects its cap", () => {
  const [s, c, n] = start();
  n.influence = 499;
  diplomaticAction(s, "USA", "visit", s.player, c);
  assert.equal(n.influence, 500);
  for (const [action, target] of [
    ["visit", "GBR"],
  ]) {
    const before = JSON.stringify(s);
    assert.throws(() =>
      diplomaticAction(s, target, action, s.player, c, "foreign-or-missing"),
    );
    assert.equal(JSON.stringify(s), before);
  }
  n.industry = 0;
  const before = JSON.stringify(s);
  assert.throws(
    () => diplomaticAction(s, "GBR", "sell", s.player, c),
    /industry/,
  );
  assert.equal(JSON.stringify(s), before);
  s.relations["GBR-JPN"].war = true;
  assert.match(diplomaticBlock(s, c, "GBR", "cooperate"), /peace/);
});
test("selected provocation fleets sail without teleporting, survive saves, and new orders cancel only their deployment", () => {
  const [s, c, n] = start(),
    f = readyProvocationFleet(s, c, "USA"),
    position = fleetPosition(s, f);
  assert.ok(f);
  diplomaticAction(s, "USA", "provoke", "JPN", c, f.id);
  assert.deepEqual(fleetPosition(s, f), position);
  assert.equal(s.provocations[0].fleetId, f.id);
  assert.equal(
    s.provocations[0].endsAt - s.provocations[0].startedAt,
    90 * 1440,
  );
  assert.equal(s.relations["JPN-USA"].war, false);
  assert.equal(validateSave(s, bundle).provocations[0].fleetId, f.id);
  let prior = position;
  for (let i = 0; i < 1440; i++) {
    setCampaignMinutes(s, campaignMinutes(s) + 1);
    minuteOperations(s, c, () => {
      throw Error("A unilateral demonstration cannot fight");
    });
    const pos = fleetPosition(s, f);
    assert.ok(distanceNm(prior, pos) <= f.speed / 60 + 0.1);
    prior = pos;
  }
  assert.ok(distanceNm(position, prior) > 1);
  const cool = n.cooldowns["provoke-USA"],
    before = fleetPosition(s, f);
  orderFleet(s, c, f.id, "guard");
  assert.equal(s.provocations.length, 0);
  assert.equal(n.cooldowns["provoke-USA"], cool);
  assert.deepEqual(fleetPosition(s, f), before);
});
test("opposing demonstrations produce at most one real battle and never start a war", () => {
  const [s, c] = start(),
    fa = readyProvocationFleet(s, c, "USA", "JPN"),
    fb = readyProvocationFleet(s, c, "JPN", "USA");
  assert.ok(fa && fb);
  diplomaticAction(s, "USA", "provoke", "JPN", c, fa.id);
  diplomaticAction(s, "JPN", "provoke", "USA", c, fb.id);
  assert.ok(opposingProvocations(s, "JPN", fa.id, "USA", fb.id));
  const node = provocationNode(s, "JPN", "USA"),
    pos = NODES[node];
  // Controlled encounter fixture; the separate voyage test checks continuous travel.
  for (const [id, f] of [
    ["JPN", fa],
    ["USA", fb],
  ]) {
    Object.assign(f, {
      route: [[...pos]],
      node,
      targetNode: node,
      departAt: campaignMinutes(s),
      arriveAt: campaignMinutes(s),
      phase: "patrol",
      nextPlanAt: campaignMinutes(s) + 3000,
      lastBattle: -1e9,
      aggressiveBattle: true,
    });
    for (const g of s.nations[id].groups.filter((g) => g.fleetId === f.id))
      g.atSea = true;
  }
  recordContact(s, "JPN", "USA", fb, pos, fleetStats(s, c, "USA", fb));
  recordContact(s, "USA", "JPN", fa, pos, fleetStats(s, c, "JPN", fa));
  const resolve = (...args) => resolveBattle(s, c, ...args);
  for (let i = 0; i < 3 * 1440; i++) {
    setCampaignMinutes(s, campaignMinutes(s) + 1);
    minuteOperations(s, c, resolve);
    progressEngagements(s,c);
    minuteAirOperations(s, c, (id, op, p) => resolveAirAttack(s, c, id, op, p));
  }
  assert.equal(s.reports.length, 1);
  assert.equal(s.reports[0].limitedIncident, true);
  assert.equal(s.provocations.length, 0);
  assert.equal(s.relations["JPN-USA"].war, false);
  assert.ok(s.alerts.some((a) => a.title.includes("Limited naval incident")));
  validateSave(s, bundle);
});
test("90-day expiration preserves position and makes a new deployment eligible for its own next cooldown", () => {
  const [s, c, n] = start(),
    f = readyProvocationFleet(s, c, "USA");
  diplomaticAction(s, "USA", "provoke", "JPN", c, f.id);
  const p = s.provocations[0];
  setCampaignMinutes(s, p.endsAt);
  const before = fleetPosition(s, f);
  expireProvocations(s);
  assert.equal(s.provocations.length, 0);
  assert.deepEqual(fleetPosition(s, f), before);
  approx(n.cooldowns["provoke-USA"], s.day + s.fraction);
});
test("AI replies with a funded ready deployment and obeys the same bilateral cooldown", () => {
  const [s, c] = start(),
    f = readyProvocationFleet(s, c, "USA");
  diplomaticAction(s, "USA", "provoke", "JPN", c, f.id);
  const n = s.nations.USA;
  Object.assign(n, { gold: 1e6, industry: 1e6, influence: 300 });
  aiTurn(s, c, "USA");
  const p = s.provocations.find(
    (p) => p.nation === "USA" && p.target === "JPN",
  );
  assert.ok(p);
  assert.equal(n.cooldowns["provoke-JPN"], s.day + 90);
  assert.ok(n.fleets.find((f) => f.id === p.fleetId).manual);
  aiTurn(s, contentFor(bundle, s), "USA");
  assert.equal(
    s.provocations.filter((p) => p.nation === "USA" && p.target === "JPN")
      .length,
    1,
  );
  assert.equal(n.cooldowns["provoke-JPN"], s.day + 90);
  validateSave(s, bundle);
});
test("historical pacts sign automatically for participants and observers, without invitation decisions", () => {
  for (const id of ["DEU", "USA"]) {
    const [s, c] = start(id);
    setCampaignMinutes(s, PACT_EVENTS.at(-1).at);
    politicsTick(s);
    assert.ok(
      s.pacts.some((p) => p.id === "tripartite" && p.members.length === 3),
    );
    assert.ok(s.relations["DEU-JPN"].allied);
    assert.ok(!s.relations["JPN-USA"].war);
    assert.ok(s.decisions.length > 0);
    assert.ok(
      s.decisions.every(
        (d) => d.options.length === 1 && d.options[0].id === "acknowledge",
      ),
    );
    validateSave(s, bundle);
  }
});
test("European windows stay bounded and historical Pacific wars occur without relation triggers", () => {
  for (const campaign of Object.keys(bundle.campaigns))
    for (let seed = 0; seed < 100; seed++) {
      const t = openingTimeline(seed, campaign);
      assert.ok(
        Math.abs(t.polandAt - HISTORICAL_POLAND) <=
          (campaign === "campaign_1922" ? 365 : 60) * 1440,
      );
    }
  const [s, c] = start("USA");
  setCampaignMinutes(s, Date.parse("1941-12-07T17:55:00Z") / 60000);
  advanceMinutes(s, c, 0);
  for (const pair of ["DEU-GBR", "DEU-FRA", "DEU-SOV", "JPN-USA", "GBR-JPN"])
    assert.ok(s.relations[pair].war, pair);
  assert.ok(s.decisions.some((d) => d.popup && d.kind === "war"));
  assert.ok(
    !s.decisions.some(
      (d) => d.kind === "war-warning" || d.kind === "call-to-arms",
    ),
  );
  validateSave(s, bundle);
});
test("historical GDP drives gold, industry and yards; missing Soviet wartime observations interpolate", () => {
  const [s, c, n] = start("USA"),
    base = economyFor(s, "USA"),
    yard = yardLoad(s, c).capacity;
  n.gold -= 500;
  setCampaignMinutes(s, Date.parse("1936-02-01T00:00:00Z") / 60000);
  closeEconomicMonth(s, c, "USA");
  const ratio = historicalGDP("USA", s.day) / HISTORICAL_GDP.USA[1936];
  approx(n.gdp / base.gdp, ratio);
  assert.equal(n.monthAccount.last.gold, -500);
  approx(economyFor(s, "USA").yardYear / base.yardYear, ratio);
  assert.ok(economyFor(s, "USA").goldYear > base.goldYear);
  assert.ok(economyFor(s, "USA").industryYear > base.industryYear);
  approx(
    yardLoad(s, c).capacity / yard,
    ratio,
  );
  assert.equal(
    historicalGDP("USA", Date.parse("1929-01-01") / 86400000),
    HISTORICAL_GDP.USA[1929],
  );
  assert.equal(HISTORICAL_GDP.SOV[1943], undefined);
  approx(
    historicalGDP("SOV", Date.parse("1943-01-01") / 86400000),
    Math.sqrt(HISTORICAL_GDP.SOV[1940] * HISTORICAL_GDP.SOV[1946]),
  );
  assert.match(resourceHover(s, c, "YARDS"), /GDP growth multiplier/);
  assert.match(resourceHover(s, c, "GOLD"), /GDP growth next month/);
  validateSave(s, bundle);
});

test("ALB Raiden replaces both combat roles without duplicating airframes or bypassing its 1939 availability", () => {
  const [s, c, n] = start();
  assert.deepEqual(
    c.nations.JPN.aircraft.map((a) => a.id),
    ["hibari_t33", "raiden_t39", "shinden_t44"],
  );
  assert.throws(() => setProductionModel(s, c, "fighter", "raiden_t39"));
  setCampaignMinutes(s, Date.parse("1939-01-01") / 60000);
  Object.assign(n, { gold: 1e7, industry: 1e7, influence: 300 });
  for (const role of ["fighter", "strike", "scout"])
    setProductionModel(s, c, role, "raiden_t39");
  const before = n.aircraft.raiden_t39 || 0;
  let produced = 0;
  for (let i = 0; i < 30; i++) {
    dailyResources(s, c, () => {});
    produced += n.aircraftOutput;
  }
  assert.equal(n.aircraft.raiden_t39 - before, produced);
  assert.ok(produced > 0);
  assert.equal(n.aircraft.tenzan_t39, undefined);
  assert.equal(c.nations.JPN.aircraft[1].powerplant.count, 2);
});
