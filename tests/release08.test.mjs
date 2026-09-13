import { resolveBattleToEnd } from "./battle-helper.mjs";
import { CATALOG } from "../worker/catalog-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Worker } from "node:worker_threads";
import * as sim from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import { applyCommand } from "../mechanics/game-actions.mjs";
import { SimulationClient } from "../ui/simulation-client.mjs";
import {
  campaignMinutes,
  setCampaignMinutes,
} from "../mechanics/campaign-clock.mjs";
import {
  portSpec,
  portSummary,
  damagePort,
  repairPorts,
} from "../mechanics/ports.mjs";
import {
  portTradeSummary,
  updatePortBlockades,
} from "../mechanics/port-trade.mjs";
import { merchantEconomy } from "../mechanics/merchant-economy.mjs";
import { NATION_ORDER } from "../mechanics/catalog.mjs";
import { NODES, PORTS, HOME_PORT } from "../mechanics/world.mjs";
import {
  orderFleet,
  fleetPosition,
  detachRepairs,
  minuteOperations,
  invalidateOperations,
  sinkMerchants,
} from "../mechanics/task-forces.mjs";
import {
  battleDetails,
  alertItems,
  resourcesView,
} from "../ui/ministry-view.mjs";
import { shipDetails, classHover, portPopup } from "../ui/inspection-view.mjs";
import {
  buildView,
  installView,
  displayedFleet,
} from "../mechanics/queries.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
import { automaticDraft, commissionDraft } from "../mechanics/designer.mjs";
const b = structuredClone(CATALOG);
const start = (id = "JPN", campaign = "in_good_faith_1936") => {
  const s = sim.newGame(b, id, 1907, campaign);
  s.autoPause = false;
  s.decisions = [];
  return { s, c: contentFor(b, s), n: s.nations[id] };
};
test("port tiers distinguish Cavite, Guam, Scapa and the incomplete Singapore base in both periods", () => {
  for (const campaign of Object.keys(b.campaigns)) {
    const { s, c } = start("USA", campaign);
    assert.equal(portSpec(s, "guam").tier, "station");
    assert.equal(portSpec(s, "manila").tier, "base");
    assert.equal(portSpec(s, "scapa").dock, 0);
    assert.ok(
      portSpec(s, "manila").capacity > portSpec(s, "guam").capacity * 5,
    );
    assert.ok(
      portSpec(s, "manila").artillery > portSpec(s, "guam").artillery * 5,
    );
    for (const id of Object.keys(PORTS))
      assert.match(portPopup(s, c, id), /Trade capacity/);
    validateSave(s, b);
  }
  assert.equal(
    portSpec(start("GBR", "campaign_1922").s, "singapore").tier,
    "station",
  );
  assert.equal(portSpec(start("GBR").s, "singapore").tier, "base");
});

test("blockade requires nearby hostile deployed forces; peace and withdrawal reopen access", () => {
  const { s, c } = start("USA"),
    f = s.nations.JPN.fleets.find((f) => f.role === "carrier");
  Object.assign(s.relations["JPN-USA"], { war: true, warSince: s.day });
  orderFleet(s, c, f.id, "siege", null, "JPN", { aggressiveBattle: true });
  s.relations["JPN-USA"].war = false;
  Object.assign(f, {
    route: [NODES.manila],
    phase: "patrol",
    departAt: campaignMinutes(s),
    arriveAt: campaignMinutes(s),
    targetNode: "manila",
  });
  for (const g of s.nations.JPN.groups.filter((g) => g.fleetId === f.id))
    g.atSea = true;
  updatePortBlockades(s, c);
  assert.equal(s.ports.manila.blockade, 0);
  s.relations["JPN-USA"].war = true;
  s.relations["JPN-USA"].warSince = s.day;
  updatePortBlockades(s, c);
  assert.ok(s.ports.manila.blockade > 0);
  const blocked = portTradeSummary(s, "USA").available;
  f.route = [NODES.yokosuka];
  updatePortBlockades(s, c);
  assert.equal(s.ports.manila.blockade, 0);
  assert.ok(portTradeSummary(s, "USA").available > blocked);
});
test("trade-only port damage leaves yards independent; dockyard occupation removes facilities", () => {
  const { s, c, n } = start("USA"),
    before = sim.yardLoad(s, c).capacity,
    trade = portTradeSummary(s, "USA").available;
  damagePort(s, "manila", 1);
  assert.ok(portTradeSummary(s, "USA").available < trade);
  const afterTrade = sim.yardLoad(s, c).capacity;
  assert.equal(afterTrade, before);
  assert.ok(afterTrade >= before * 0.8);
  s.world.portControl.norfolk = "DEU";
  assert.ok(sim.yardLoad(s, c).capacity < afterTrade);
  const gold = n.gold,
    industry = n.industry;
  setCampaignMinutes(s, campaignMinutes(s) + 1441);
  repairPorts(s);
  assert.ok(s.ports.manila.health > 0);
  assert.ok(n.gold < gold && n.industry < industry);
  assert.equal(PORTS.manila.nation, "USA");
  validateSave(s, b);
});
test("scrapping a deployed ship conserves hulls and personnel until port arrival, then pays salvage once", () => {
  const { s, c, n } = start("GBR"),
    f = n.fleets.find((f) => f.role === "cruiser");
  orderFleet(s, c, f.id, "presence");
  setCampaignMinutes(s, campaignMinutes(s) + 60);
  const g = n.groups.find((g) => g.fleetId === f.id && g.atSea),
    industry = n.industry,
    people = n.crew;
  sim.scrapGroup(s, c, g.id);
  assert.equal(g.status, "returning");
  assert.ok(g.scrapOnArrival);
  assert.equal(n.industry, industry);
  assert.equal(n.crew, people);
  assert.throws(() => sim.scrapGroup(s, c, g.id), /already/);
  const transfer = n.fleets.find((f) => f.id === g.fleetId);
  assert.equal(transfer.role, "repair");
  assert.ok(transfer.arriveAt > campaignMinutes(s));
  const expected = Math.floor(
    c.classes[g.classId].tons * g.count * 0.05 * g.health,
  );
  setCampaignMinutes(s, Math.ceil(transfer.arriveAt));
  minuteOperations(s, c);
  assert.equal(g.status, "scrapped");
  assert.equal(n.industry, industry + expected);
  minuteOperations(s, c);
  assert.equal(n.industry, industry + expected);
  assert.equal(n.crew, people);
  validateSave(s, b);
});
test("a whole damaged flotilla keeps its identity on the return voyage and remains eligible for interception", () => {
  const { s, c, n } = start(),
    f = n.fleets.find((f) => f.role === "cruiser");
  orderFleet(s, c, f.id, "presence");
  setCampaignMinutes(s, campaignMinutes(s) + 300);
  const members = n.groups.filter((g) => g.fleetId === f.id),
    before = n.fleets.length;
  for (const g of members) {
    g.status = "returning";
    g.health = 0.5;
  }
  const pos = fleetPosition(s, f);
  detachRepairs(s, c, n.id, f.id, pos);
  assert.equal(n.fleets.length, before);
  assert.ok(members.every((g) => g.fleetId === f.id));
  assert.equal(f.phase, "returning");
  assert.equal(f.role, "repair");
  assert.equal(f.aggressiveBattle, false);
  assert.deepEqual(fleetPosition(s, f), pos);
  assert.ok(sim.fleetPower(s, c, n.id, null, f.id).ships > 0);
  validateSave(s, b);
});
test("aggressive engagements raise inflicted damage and exposure, with typed reports conserving hull counts", () => {
  let ordinary = 0,
    aggressive = 0,
    count = 0;
  for (let seed = 1; seed <= 32; seed++) {
    const { s, c } = start("FRA");
    s.seed = seed;
    const fa = s.nations.FRA.fleets.find((f) => f.role === "carrier"),
      fb = s.nations.ITA.fleets.find((f) => f.role === "carrier"),
      other = structuredClone(s);
    fa.aggressiveBattle = false;
    fb.aggressiveBattle = false;
    const r = resolveBattleToEnd(
      s,
      c,
      "FRA",
      "ITA",
      "mediterranean",
      fa.id,
      fb.id,
    );
    other.nations.FRA.fleets.find((f) => f.id === fa.id).aggressiveBattle =
      true;
    other.nations.ITA.fleets.find((f) => f.id === fb.id).aggressiveBattle =
      true;
    const hard = resolveBattleToEnd(
      other,
      c,
      "FRA",
      "ITA",
      "mediterranean",
      fa.id,
      fb.id,
    );
    if (!r || !hard) continue;
    ordinary += r.resultA.damagedTons + r.resultB.damagedTons;
    aggressive += hard.resultA.damagedTons + hard.resultB.damagedTons;
    count++;
    for (const result of [hard.resultA, hard.resultB]) {
      assert.equal(
        Object.values(result.engagedComposition).reduce((a, b) => a + b, 0),
        result.engaged,
      );
      assert.equal(
        Object.values(result.sunkComposition).reduce((a, b) => a + b, 0),
        result.sunk,
      );
      assert.equal(
        Object.values(result.damagedComposition).reduce((a, b) => a + b, 0),
        result.damaged,
      );
    }
    assert.match(battleDetails(hard), /Engaged:/);
    assert.ok(hard.aggressiveA && hard.aggressiveB);
    validateSave(other, b);
  }
  assert.ok(count > 10);
  assert.ok(aggressive > ordinary * 1.25);
});
test("clear all retains mandatory decisions and chosen decisions produce one receipt without a new alert", () => {
  const { s, c } = start();
  sim.queueDecision(
    s,
    "mandatory",
    "Demand",
    "Choose.",
    [{ id: "default", label: "Default", detail: "No expenditure." },{ id: "approve", label: "Approve", detail: "Approve the request." }],
    { critical: true },
  );
  sim.queueDecision(s, "optional", "Advice", "Optional.", [
    { id: "ok", label: "OK", detail: "No expenditure." },
  ]);
  sim.addAlert(s, "News", "A dispatch.", "navy");
  applyCommand(s, b, { type: "clear-alerts" });
  assert.deepEqual(
    s.decisions.map((d) => d.key),
    ["mandatory"],
  );
  assert.equal(alertItems(s).length, 0);
  const result = applyCommand(s, b, {
    type: "choose",
    args: { key: "mandatory", id: "default" },
  });
  assert.match(result.receipt, /Default/);
  assert.equal(alertItems(s).length, 0);
  assert.equal(s.decisions.length, 0);
});
test("worker display summaries equal engine values, and cached designs survive snapshot object replacement", () => {
  const { s, c } = start();
  const view = buildView(s, b);
  installView(s, view);
  const f = s.nations.JPN.fleets[0],
    summary = displayedFleet(s, c, f);
  assert.equal(
    summary.power.total,
    sim.fleetPower(s, c, "JPN", null, f.id).total,
  );
  assert.deepEqual(
    summary.stats.groups.map((g) => g.id),
    s.nations.JPN.groups.filter((g) => g.fleetId === f.id).map((g) => g.id),
  );
  assert.match(shipDetails(s, c, summary.stats.groups[0].id), /Sailors aboard/);
  assert.match(classHover(c.classes[summary.stats.groups[0].classId]), /km/);
  commissionDraft(s, c, automaticDraft(s, c, "DD"));
  assert.deepEqual(contentFor(b, s), contentFor(b, structuredClone(s)));
  sim.startProject(s, "industry");
  assert.match(resourcesView(s, contentFor(b, s)), /Projected completion/);
});
test("real worker serializes commands and rolls back invalid purchases while UI timers keep running", async (t) => {
  let updates = 0,
    timers = 0;
  const client = new SimulationClient({
    createWorker: () => {
      const w = new Worker(new URL("./worker-adapter.mjs", import.meta.url)),
        bridge = {
          postMessage: (m) => w.postMessage(m),
          terminate: () => w.terminate(),
        };
      w.on("message", (data) => bridge.onmessage?.({ data }));
      w.on("error", (error) => bridge.onerror?.(error));
      return bridge;
    },
    onState: () => updates++,
    onError: (m) => assert.fail(m),
  });
  t.after(() => {
    clearInterval(client.watchdog);
    client.worker?.terminate();
  });
  const { s } = start("USA");
  await client.start(b, s);
  const initial = await client.snapshot();
  await client.dispatch({ type: "speed", args: { value: 10 } });
  await client.dispatch({ type: "pause", args: { value: false } });
  const timer = setInterval(() => timers++, 5);
  await new Promise((r) => setTimeout(r, 1000));
  clearInterval(timer);
  await client.dispatch({ type: "pause", args: { value: true } });
  assert.ok(timers > 25);
  assert.ok(updates > 3);
  const before = await client.snapshot();
  assert.ok(campaignMinutes(before) > campaignMinutes(initial));
  await assert.rejects(
    client.dispatch({ type: "order", args: { id: "nonexistent", count: 1 } }),
  );
  const after = await client.snapshot();
  assert.equal(after.nations.USA.gold, before.nations.USA.gold);
  assert.equal(campaignMinutes(after), campaignMinutes(before));
  assert.equal(after.paused, true);
  validateSave(after, b);
  await client.stop();
});
