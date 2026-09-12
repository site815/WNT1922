import { resolveBattleToEnd } from "./battle-helper.mjs";
import { CATALOG } from "../worker/catalog-loader.mjs";
import { staffSailors } from "../mechanics/ship-staffing.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as sim from "../mechanics/engine.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
const content = structuredClone(CATALOG);
function start(id = "JPN", seed = 71) {
  const s = sim.newGame(content, id, seed);
  s.autoPause = false;
  s.paused = false;
  s.decisions = [];
  s.completedEvents = ["opening"];
  return s;
}
function fund(s, id = s.player) {
  Object.assign(s.nations[id], { gold: 1e7, influence: 500, industry: 1e7, strategic: 1e7 });
}

test("normal real-time clock is exactly 10,000× and pause stops all progress", () => {
  const s = start();
  sim.tick(s, content, 8.64);
  assert.equal(sim.dateText(s.day), "2 Jan 1936");
  const before = JSON.stringify(s);
  s.paused = true;
  const paused = JSON.stringify(s);
  sim.tick(s, content, 100);
  assert.equal(JSON.stringify(s), paused);
  assert.notEqual(before, paused);
});
test("a funded order consumes all four resources, takes time, and yard congestion delays it", () => {
  const s = start();
  fund(s);
  const n = s.nations.JPN,
    price = sim.shipPrice(s, content, "kaze_t32", 2),
    before = { gold: n.gold, influence: n.influence, industry: n.industry, strategic: n.strategic };
  const id = sim.orderShip(s, content, "kaze_t32", 2),
    g = n.groups.find((g) => g.id === id);
  for (const key of Object.keys(before))
    assert.equal(n[key], before[key] - price[key]);
  assert.equal(g.status, "building");
  assert.equal(g.progress, 0);
  sim.advanceDays(s, content, 1);
  assert.ok(g.progress > 0 && g.progress < 1);
  const normal = sim.yardLoad(s, content).factor;
  sim.orderShip(s, content, "unryu_t32", 20);
  assert.ok(sim.yardLoad(s, content).factor > normal);
});
test("failed purchases and invalid order quantities leave resources intact", () => {
  const s = start();
  s.nations.JPN.gold = 0;
  const before = JSON.stringify(s);
  assert.throws(() => sim.orderShip(s, content, "kaze_t32", 1), /more gold/);
  assert.equal(JSON.stringify(s), before);
  for (const q of [0, -1, 21, NaN, 1.5])
    assert.throws(() => sim.orderShip(s, content, "kaze_t32", q), /between/);
});
test("standardization changes later prices only after its funded program completes", () => {
  const s = start();
  fund(s);
  const before = sim.shipPrice(s, content, "kaze_t32");
  sim.startProject(s, "standardization");
  assert.equal(sim.shipPrice(s, content, "kaze_t32").gold, before.gold);
  s.nations.JPN.projects[0].remaining = 1;
  sim.advanceDays(s, content, 1);
  assert.equal(s.nations.JPN.tech.standardization, 6);
  assert.ok(sim.shipPrice(s, content, "kaze_t32").gold < before.gold);
});
test("future designs become orderable on their catalog year without a paid unlock", () => {
  const s = start("DEU"); fund(s);
  assert.match(sim.shipOrderBlock(s, content, "schwertwal_typ21"), /Development opens/);
  const before = s.nations.DEU.gold;
  s.day = Date.parse("1941-01-01T00:00:00Z") / 86400000;
  assert.equal(sim.shipOrderBlock(s, content, "schwertwal_typ21"), "");
  assert.equal(s.nations.DEU.gold, before);
  assert.equal(s.nations.DEU.projects.length, 0);
  sim.orderShip(s, content, "schwertwal_typ21");
  assert(s.nations.DEU.gold < before);
});
test("oversized orders remain available and proportional concealment reduces disclosure penalties", () => {
  const s = start("USA");
  fund(s);
  sim.setTreatyPolicy(s, "disclose");
  assert.equal(sim.shipOrderBlock(s, content, "columbia_bb32"), "");
  const before = sim.monthlyIncome(s, content);
  sim.setTreatyPolicy(s, "false_numbers");
  const after = sim.monthlyIncome(s, content);
  assert.ok(after.gold > before.gold);
  assert.ok(after.influence > before.influence);
  sim.orderShip(s, content, "columbia_bb32");
  assert.ok(sim.treatyLedger(s, content).hidden > 0);
});
test("all selectable countries can continue through 1950 with valid saves", () => {
  for (const id of ["JPN", "USA", "GBR", "DEU"]) {
    const s = start(id, 2026);
    sim.advanceDays(s, content, 5480);
    assert.equal(sim.yearOf(s), 1951);
    assert.equal(s.reviews.length, 3);
    assert.doesNotThrow(() => validateSave(s, content));
  }
});
test("supply, training, morale and crew all have operational consequences", () => {
  const s = start(),
    n = s.nations.JPN,
    baseline = sim.fleetPower(s, content).total;
  n.training = 10;
  assert.ok(sim.fleetPower(s, content).total < baseline);
  n.training = 65;
  n.morale = 10;
  assert.ok(sim.fleetPower(s, content).total < baseline);
  n.morale = 75;
  n.crew = 500;
  staffSailors(s, content, "JPN");
  assert.ok(sim.fleetPower(s, content).total < baseline);
  n.crew = 42000;
  staffSailors(s, content, "JPN");
  n.strategic = 0;
  assert.ok(sim.fleetPower(s, content).total < baseline);
});
test("battle results are reproducible, report preparation, and name loss mechanisms", () => {
  const s = start();
  s.nations.JPN.priority = "decisive";
  s.nations.USA.priority = "decisive";
  const copy = structuredClone(s);
  const r = resolveBattleToEnd(s, content, "JPN", "USA", "pacific"),
    r2 = resolveBattleToEnd(copy, content, "JPN", "USA", "pacific");
  assert.ok(r);
  assert.deepEqual(r, r2);
  assert.equal(r.preparationA.morale, 75);
  assert.ok(r.variationA >= 0.92 && r.variationA <= 1.08);
  for (const l of [...r.resultA.losses, ...r.resultB.losses])
    assert.ok(l.count > 0 && l.cause);
});
test("reinforcements in transit cannot take part in battles", () => {
  const s = start();
  for (const g of s.nations.JPN.groups) g.joinAt = (s.day + 10) * 1440;
  assert.equal(sim.fleetPower(s, content, "JPN").ships, 0);
});
test("scout aircraft improve search and AA guns provide air defense", () => {
  const raider = content.classes.seeadler_raider,
    original = sim.classPower(raider),
    withoutAircraft = sim.classPower({ ...raider, scoutAircraft: 0 });
  assert.ok(original.scout > withoutAircraft.scout);
  assert.ok(sim.classPower(content.classes.maya_t29).aa > 0);
});
test("a named capital ship is not immune to a fatal hit", () => {
  let lost = false;
  for (let seed = 1; seed <= 512 && !lost; seed++) {
    const s = start("USA", seed);
    s.nations.USA.groups = s.nations.USA.groups.filter(
      (g) => g.id === "h-usa_missouri",
    );
    s.nations.USA.priority = "decisive";
    s.nations.JPN.priority = "decisive";
    const report = resolveBattleToEnd(s, content, "USA", "JPN", "pacific");
    lost = !!report && report.resultA.sunk > 0;
  }
  assert.equal(lost, true);
});
test("the 1950 score is recorded and the campaign continues past it", () => {
  const s = start("GBR");
  s.day = Date.parse("1950-12-30T00:00:00Z") / sim.DAY;
  sim.advanceDays(s, content, 3);
  assert.equal(sim.yearOf(s), 1951);
  assert.equal(s.reviews.length, 1);
  assert.equal(s.reviews[0].year, 1950);
  assert.equal(s.reviews[0].scores.length, Object.keys(content.nations).length);
});
test("multi-year campaign stays finite, generates war, and saves safely", () => {
  const s = start("JPN", 1969);
  sim.advanceDays(s, content, 365 * 6);
  assert.ok(Object.values(s.relations).some((r) => r.war));
  for (const n of Object.values(s.nations))
    for (const key of [
      "gold",
      "industry",
      "influence",
      "crew",
      "training",
      "morale",
      "logistics",
    ])
      assert.ok(Number.isFinite(n[key]) && n[key] >= 0, `${n.id}.${key}`);
  assert.doesNotThrow(() => validateSave(s, content));
  assert.ok(s.history.length >= 70);
  assert.ok(s.nations.USA.delivered > 0);
});
