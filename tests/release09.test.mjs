import { CATALOG } from "../worker/catalog-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as sim from "../mechanics/engine.mjs";
import {
  dailyWorld,
  landingPower,
  islandPressure,
} from "../mechanics/land-war.mjs";
import { NODES, PORTS, ISLANDS, seaRoute } from "../mechanics/world.mjs";
import { portOwner } from "../mechanics/ports.mjs";
import { portTradeSummary } from "../mechanics/port-trade.mjs";
import {
  setCampaignMinutes,
  campaignMinutes,
} from "../mechanics/campaign-clock.mjs";
import { createSoundTracker } from "../ui/sound.mjs";
import { yardCapacityChart } from "../ui/yard-view.mjs";
import { fleetStats, orderFleet } from "../mechanics/task-forces.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
const c = structuredClone(CATALOG);
function start(campaign = "in_good_faith_1936") {
  const s = sim.newGame(c, "JPN", 421, campaign);
  s.decisions = [];
  s.autoPause = false;
  return s;
}
function war(s) {
  Object.assign(s.relations["JPN-USA"], {
    war: true,
    allied: false,
    warSince: s.day,
  });
}
function at(s, id, point) {
  for (const n of Object.values(s.nations))
    for (const f of n.fleets) {
      f.phase = "port";
      f.route = [NODES[f.port]];
      f.arriveAt = f.departAt = campaignMinutes(s);
    }
  const f = s.nations[id].fleets.find((f) => f.role === "battle");
  assert.ok(f);
  f.phase = "patrol";
  f.route = [point];
  f.arriveAt = f.departAt = campaignMinutes(s);
  f.mission = "presence";
  for (const g of s.nations[id].groups.filter((g) => g.fleetId === f.id))
    g.atSea = true;
  return f;
}
function days(s, n) {
  for (let i = 0; i < n; i++) {
    setCampaignMinutes(s, campaignMinutes(s) + 1440);
    dailyWorld(s, c);
  }
}
test("Pacific objectives begin at actual war in both campaigns, without historical catch-up", () => {
  for (const campaign of ["in_good_faith_1936", "campaign_1922"]) {
    const s = start(campaign);
    war(s);
    dailyWorld(s, c);
    assert.ok(s.world.fronts.some((f) => f.id === "philippines"));
    assert.ok(s.world.fronts.some((f) => f.id === "island-guam"));
    assert.ok(!s.world.fronts.some((f) => f.id === "malaya"));
    assert.equal(
      s.world.fronts.find((f) => f.id === "island-guam").progress,
      0,
    );
    assert.ok(
      s.world.fronts.find((f) => f.id === "philippines").progress < 0.03,
    );
  }
  const s = start();
  setCampaignMinutes(s, Date.parse("1945-01-01T00:00:00Z") / 60000);
  war(s);
  dailyWorld(s, c);
  assert.equal(s.world.fronts.find((f) => f.id === "island-guam").progress, 0);
  assert.ok(s.world.fronts.find((f) => f.id === "philippines").progress < 0.03);
});
test("Weak island capture, persistent occupation, counter-invasion, trade and safe save", () => {
  const s = start();
  war(s);
  at(s, "JPN", NODES.guam);
  const before = portTradeSummary(s, "USA").available;
  days(s, 16);
  assert.equal(portOwner(s, "guam"), "JPN");
  assert.ok(portTradeSummary(s, "USA").available < before);
  assert.ok(s.ports.guam.health < 1);
  at(s, "USA", NODES.guam);
  days(s, 2);
  const progress = s.world.fronts.find((f) => f.id === "island-guam").progress;
  assert.ok(progress > 0 && progress < 1);
  assert.equal(
    portOwner(s, "guam"),
    "JPN",
    "A counterattack does not instantly restore the port",
  );
  days(s, 18);
  assert.equal(portOwner(s, "guam"), "USA");
  validateSave(s, c);
});
test("Islands require local ships, shipping supply, and remain frozen in a ceasefire", () => {
  const s = start();
  war(s);
  days(s, 30);
  assert.equal(portOwner(s, "guam"), "USA");
  at(s, "JPN", NODES.guam);
  Object.assign(s.nations.JPN.merchant, { hulls: 0 });
  for (const g of s.nations.JPN.groups)
    if (g.service === "merchant") g.count = 0;
  days(s, 20);
  assert.equal(s.world.fronts.find((f) => f.id === "island-guam").progress, 0);
  const freeze = start();
  war(freeze);
  at(freeze, "JPN", NODES.guam);
  days(freeze, 3);
  const f = freeze.world.fronts.find((f) => f.id === "island-guam"),
    progress = f.progress;
  freeze.relations["JPN-USA"].war = false;
  days(freeze, 20);
  assert.equal(f.progress, progress);
  assert.equal(f.status, "Ceasefire");
});
test("Landing support excludes submarines, docked ships, repair forces and distant fleets", () => {
  const row = {
    id: "JPN",
    position: NODES.guam,
    f: { phase: "patrol", role: "battle", mission: "presence" },
    stats: { hulls: 4, submarines: 0, surface: 100, air: 0 },
  };
  assert.ok(landingPower([row], "JPN", NODES.guam) > 0);
  for (const patch of [
    { f: { ...row.f, phase: "port" } },
    { f: { ...row.f, role: "repair" } },
    { stats: { ...row.stats, submarines: 4 } },
    { position: NODES.yokosuka },
  ])
    assert.equal(landingPower([{ ...row, ...patch }], "JPN", NODES.guam), 0);
  const f = {
    resistance: 45,
    lastOutcome: "Repulsed",
    attackerSupply: 0.8,
    defenderSupply: 0.8,
  };
  assert.ok(islandPressure(f, 500, 0) > 0);
  assert.ok(islandPressure(f, 100, 1000) <= 0);
});
test("Major objectives remain slow; admirals can route to connected island bases", () => {
  const s = start();
  war(s);
  at(s, "JPN", NODES.manila);
  days(s, 20);
  assert.notEqual(portOwner(s, "manila"), "JPN");
  for (const i of ISLANDS) {
    assert.ok(PORTS[i.node]);
    assert.ok(seaRoute("hawaii", i.node).length > 1);
  }
  const f = s.nations.JPN.fleets.find((f) => f.role === "battle");
  f.fuelNm = f.maxRangeNm = 30000;
  orderFleet(s, c, f.id, "presence");
  assert.ok(
    ISLANDS.some((i) => i.node === f.objectiveNode),
    "Reconnaissance patrols cover active island objectives",
  );
});
test("Battle audio takes priority over newer alerts, ignores old history and foreign battles", () => {
  const t = createSoundTracker(),
    s = {
      player: "JPN",
      reports: [{ id: 10, a: "JPN", b: "USA" }],
      alerts: [{ id: 11, kind: "battle" }],
    };
  assert.equal(t.next(s), null);
  s.reports.unshift({ id: 12, a: "JPN", b: "USA" });
  s.alerts.unshift({ id: 14, kind: "industry" });
  assert.equal(t.next(s), "battle");
  assert.equal(t.next(s), null);
  s.reports.unshift({ id: 15, a: "GBR", b: "DEU" });
  assert.equal(t.next(s), null);
  s.alerts.unshift({ id: 16, kind: "industry" });
  assert.equal(t.next(s), "complete");
  t.reset();
  assert.equal(t.next(s), null);
});
test("Yard chart draws overload on the same scale, including zero capacity", () => {
  const load = {
    capacity: 100,
    work: 200,
    used: 100,
    spare: 0,
    backlog: 100,
    factor: 2,
  };
  const html = yardCapacityChart(load);
  assert.match(html, /class="yard-overload-segment" x="500" y="7" width="500"/);
  assert.match(html, /Overloaded/);
  const blocked = yardCapacityChart({
    ...load,
    capacity: 0,
    used: 0,
    backlog: 200,
    blocked: true,
  });
  assert.match(
    blocked,
    /class="yard-overload-segment" x="0" y="7" width="1000"/,
  );
  assert.doesNotMatch(blocked, /NaN|Infinity/);
  assert.doesNotMatch(
    yardCapacityChart({ ...load, work: 0, used: 0, spare: 100, backlog: 0 }),
    /yard-overload-segment/,
  );
});
