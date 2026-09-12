import { resolveBattleToEnd } from "./battle-helper.mjs";
import { POLITICAL, POLITICAL_1922 } from "../worker/map-assets.mjs";
import { CATALOG } from "../worker/catalog-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as sim from "../mechanics/engine.mjs";
import {
  campaignMinutes,
  setCampaignMinutes,
  capitalClock,
  HISTORICAL_POLAND,
  HISTORICAL_BRITAIN,
  openingTimeline,
} from "../mechanics/campaign-clock.mjs";
import {
  NODES,
  EDGES,
  AREAS,
  seaRoute,
  distanceNm,
  interpolate,
} from "../mechanics/world.mjs";
import {
  fleetPosition,
  fleetStats,
  visibleContacts,
  recordContact,
  minuteOperations,
  invalidateOperations,
  commissionToFleet,
} from "../mechanics/operations.mjs";
import { commandView, routePath } from "../ui/command-view.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
const content = structuredClone(CATALOG);
const start = (id = "JPN", seed = 71) => {
  const s = sim.newGame(content, id, seed);
  s.autoPause = false;
  s.paused = false;
  s.decisions = [];
  return s;
};

test("one minute advances precisely, with capital timezone date rollover and seasonal offsets", () => {
  const s = start(),
    before = campaignMinutes(s);
  sim.advanceMinutes(s, content, 1);
  assert.equal(campaignMinutes(s) - before, 1);
  assert.equal(capitalClock(s).time, "09:01");
  const us = capitalClock(s, "USA");
  assert.equal(us.date, "31 Dec 1935");
  assert.equal(us.time, "19:01");
  setCampaignMinutes(s, Date.parse("1936-07-01T00:00:00Z") / 60000);
  assert.equal(capitalClock(s, "GBR").time, "01:00");
  assert.equal(capitalClock(s, "DEU").time, "01:00");
  setCampaignMinutes(s, Date.parse("1936-01-01T23:59:00Z") / 60000);
  sim.advanceMinutes(s, content, 1);
  assert.equal(s.fraction, 0);
  assert.equal(capitalClock(s, "GBR").date, "2 Jan 1936");
});
test("large and small clock steps produce the same world", () => {
  const a = start(),
    b = structuredClone(a);
  sim.advanceMinutes(a, content, 24 * 60 + 37);
  for (let i = 0; i < 24 * 60 + 37; i++) sim.advanceMinutes(b, content, 1);
  assert.deepEqual(a, b);
});
test("European onset has a shared maximum sixty-day offset independent of naval relations", () => {
  const offsets = new Set();
  for (let seed = 0; seed < 1000; seed++) {
    const t = openingTimeline(seed);
    offsets.add(t.offsetDays);
    assert.ok(Math.abs(t.polandAt - HISTORICAL_POLAND) <= 60 * 1440);
    assert.equal(
      t.britainAt - HISTORICAL_BRITAIN,
      t.polandAt - HISTORICAL_POLAND,
    );
  }
  assert.ok(offsets.size > 100);
  assert.ok(offsets.has(-60) && offsets.has(60));
  for (const allied of [false, true]) {
    const s = start("GBR"),
      r = s.relations["DEU-GBR"];
    r.allied = allied;
    setCampaignMinutes(s, Date.parse("1939-06-01T00:00:00Z") / 60000);
    sim.advanceDays(s, content, 2);
    assert.equal(r.war, false);
    setCampaignMinutes(s, s.timeline.polandAt - 1);
    sim.advanceMinutes(s, content, 1);
    assert.equal(s.timeline.polandOccurred, true);
    assert.equal(r.war, false);
    setCampaignMinutes(s, s.timeline.britainAt - 1);
    sim.advanceMinutes(s, content, 1);
    assert.equal(r.war, true);
    assert.equal(r.allied, false);
    assert.equal(s.timeline.europeOccurred, true);
    const logCount = s.log.filter((l) =>
      l.text.startsWith("United Kingdom and France"),
    ).length;
    const loaded = validateSave(s, content);
    sim.advanceMinutes(loaded, content, 1);
    assert.equal(
      loaded.log.filter((l) => l.text.startsWith("United Kingdom and France"))
        .length,
      logCount,
    );
  }
});
test("automatic mission orders preserve position and counts, move gradually and exclude foreign commands", () => {
  const s = start(),
    n = s.nations.JPN,
    f = n.fleets.find((f) => f.role === "carrier"),
    before = sim.fleetSummary(s, content),
    position = fleetPosition(s, f);
  sim.issueFleetOrder(s, content, f.id, "presence", false);
  assert.equal(f.manual, true);
  assert.equal(f.aggressiveBattle, false);
  assert.deepEqual(fleetPosition(s, f), position);
  sim.advanceMinutes(s, content, 60);
  const moved = distanceNm(position, fleetPosition(s, f));
  assert.ok(moved > 1 && moved < 40, "Movement follows ship speed");
  assert.equal(sim.fleetSummary(s, content).total, before.total);
  Object.assign(s.relations["JPN-USA"], { war: true, warSince: s.day });
  const current = fleetPosition(s, f),
    old = f.route;
  sim.issueFleetOrder(s, content, f.id, "decisive", true);
  assert.deepEqual(fleetPosition(s, f), current);
  assert.notEqual(f.route, old);
  assert.equal(f.aggressiveBattle, true);
  sim.setPriority(s, "guard", "pacific");
  sim.advanceDays(s, content, 2);
  assert.equal(f.mission, "decisive");
  assert.throws(() =>
    sim.issueFleetOrder(s, content, s.nations.USA.fleets[0].id, "raid"),
  );
  for (const g of n.groups.filter((g) => g.service === "merchant"))
    assert.equal(g.fleetId, undefined);
  for (const g of n.groups.filter((g) => g.service === "support" && g.fleetId))
    assert.ok(
      ["support", "repair"].includes(
        n.fleets.find((f) => f.id === g.fleetId).role,
      ),
    );
});
test("foreign reports fade and expand uncertainty without following unseen fleets", () => {
  const s = start(),
    f = s.nations.USA.fleets[0],
    stats = fleetStats(s, content, "USA", f);
  recordContact(s, "JPN", "USA", f, [170, 20], stats);
  const fresh = visibleContacts(s).find((c) => c.id === f.id);
  assert.equal(fresh.stage, "Fresh");
  const before = commandView(s, content, {}, "M0,0Z");
  f.area = "atlantic";
  f.route = [
    [10, 30],
    [20, 40],
  ];
  s.nations.USA.groups[0].count = 98765;
  assert.equal(
    commandView(s, content, {}, "M0,0Z"),
    before,
    "rendering must not read undisclosed enemy state",
  );
  setCampaignMinutes(s, campaignMinutes(s) + 13 * 60);
  const old = visibleContacts(s).find((c) => c.id === f.id);
  assert.equal(old.stage, "Uncertain");
  assert.deepEqual(old.position, [170, 20]);
  assert.ok(old.confidence < fresh.confidence);
  assert.ok(old.uncertainty > fresh.uncertainty);
  setCampaignMinutes(s, campaignMinutes(s) + 168 * 60);
  assert.equal(
    visibleContacts(s).some((c) => c.id === f.id),
    false,
  );
});
test("minute scouting finds nearby forces and cannot engage distant forces", () => {
  const s = start("GBR"),
    a = s.nations.GBR.fleets.find((f) => f.role === "cruiser"),
    b = s.nations.DEU.fleets.find((f) => f.role === "escort");
  for (const f of [a, b]) {
    f.arriveAt = campaignMinutes(s) - 100;
    f.route = [NODES.north_sea];
    f.phase = "patrol";
    f.nextPlanAt = campaignMinutes(s) + 100000;
  }
  s.nations.GBR.contacts = [];
  s.nations.DEU.contacts = [];
  s.relations["DEU-GBR"].war = true;
  let encounters = 0;
  for (let i = 0; i < 1200; i++) {
    setCampaignMinutes(s, campaignMinutes(s) + 1);
    minuteOperations(s, content, () => encounters++);
  }
  assert.ok(
    s.nations.GBR.contacts.some(
      (c) => c.nation === "DEU" && c.source === "Scouting",
    ),
  );
  for (const n of Object.values(s.nations))
    for (const f of n.fleets) {
      f.route = [n.id === "GBR" ? NODES.california : NODES.north_sea];
      f.arriveAt = campaignMinutes(s) - 100;
      f.phase = "patrol";
      f.nextPlanAt = campaignMinutes(s) + 100000;
      f.lastBattle = -1e9;
    }
  invalidateOperations(s);
  encounters = 0;
  for (let i = 0; i < 120; i++) {
    setCampaignMinutes(s, campaignMinutes(s) + 1);
    minuteOperations(s, content, () => encounters++);
  }
  assert.equal(encounters, 0);
});
test("damage is confined to ships present and reinforcements travel as a separate force", () => {
  const s = start("GBR"),
    a = s.nations.GBR.fleets.find((f) => f.role === "cruiser"),
    b = s.nations.DEU.fleets.find((f) => f.role === "escort");
  a.aggressiveBattle = true;
  b.aggressiveBattle = true;
  const absent = s.nations.GBR.groups
    .filter((g) => g.fleetId !== a.id)
    .map((g) => [g.id, g.health, g.count]);
  const report = resolveBattleToEnd(
    s,
    content,
    "GBR",
    "DEU",
    "atlantic",
    a.id,
    b.id,
    [2, 56],
  );
  assert.ok(report);
  assert.equal(report.fleetA, a.id);
  for (const [id, health, count] of absent) {
    const g = s.nations.GBR.groups.find((g) => g.id === id);
    assert.equal(g.health, health);
    assert.equal(g.count, count);
  }
  a.route = [NODES.north_sea];
  a.phase = "patrol";
  a.arriveAt = campaignMinutes(s) - 1;
  a.nextPlanAt = campaignMinutes(s) + 10000;
  for (const f of s.nations.GBR.fleets)
    if (f !== a && f.role === "cruiser")
      Object.assign(f, {
        route: [NODES.biscay],
        phase: "patrol",
        departAt: campaignMinutes(s),
        arriveAt: campaignMinutes(s),
      });
  const template = s.nations.GBR.groups.find(
      (g) => g.fleetId === a.id && g.count,
    ),
    g = {
      ...structuredClone(template),
      id: "test-reinforcement",
      fleetId: undefined,
      dockPort: "scapa",
      status: "active",
      health: 1,
      airWing: [],
    };
  s.nations.GBR.groups.push(g);
  commissionToFleet(s, content, "GBR", g);
  assert.notEqual(g.fleetId, a.id);
  assert.equal(
    s.nations.GBR.fleets.find((f) => f.id === g.fleetId).role,
    "reinforcement",
  );
  assert.ok(
    !fleetStats(s, content, "GBR", a).active.some((x) => x.id === g.id),
  );
});
test("older saves acquire commands and clocks once without changing inventory or budget", () => {
  const s = start();
  delete s.strategyRevision;
  delete s.timeline;
  delete s.operationsSeed;
  for (const n of Object.values(s.nations)) {
    delete n.fleets;
    delete n.contacts;
    for (const g of n.groups) delete g.fleetId;
  }
  s.day += 70;
  s.fraction = 0.734;
  const before = sim.fleetSummary(s, content),
    gold = s.nations.JPN.gold,
    m = validateSave(s, content);
  assert.deepEqual(sim.fleetSummary(m, content), before);
  assert.equal(m.nations.JPN.gold, gold);
  assert.equal(m.day, s.day);
  assert.equal(m.fraction, s.fraction);
  assert.ok(m.nations.JPN.fleets.length);
  assert.deepEqual(validateSave(m, content), m);
  for (const corrupt of [
    (s) => (s.nations.JPN.fleets[0].route = [[400, 0]]),
    (s) => (s.nations.JPN.fleets[0].area = "Atlantis"),
    (s) => (s.nations.JPN.groups[0].fleetId = "missing"),
    (s) => (s.timeline.offsetDays = 40),
    (s) => (s.nations.JPN.contacts[0].baseConfidence = 2),
  ]) {
    const bad = structuredClone(m);
    corrupt(bad);
    assert.throws(() => validateSave(bad, content));
  }
});
test("global routes remain connected and date-line rendering never draws a false cross-world leg", () => {
  for (const a of Object.keys(AREAS)) assert.ok(seaRoute("scapa", a).length);
  assert.ok(seaRoute("scapa", "yokosuka").includes("cape"));
  assert.ok(seaRoute("san_diego", "norfolk").includes("horn_west"));
  assert.equal(
    (
      routePath([
        [175, 20],
        [-175, 20],
        [-150, 20],
      ]).match(/M/g) || []
    ).length,
    2,
  );
});
test("charted sea lanes avoid continental land in the bundled coastline dataset", () => {
  const geo = JSON.parse(
    fs.readFileSync(
      new URL("../assets/maps/navigation-mask.geojson", import.meta.url),
    ),
  );
  const polygons = geo.features
    .flatMap((f) =>
      f.geometry.type === "Polygon"
        ? [f.geometry.coordinates]
        : f.geometry.coordinates,
    )
    .map((rings) => ({
      rings,
      bounds: [
        Math.min(...rings[0].map((p) => p[0])),
        Math.min(...rings[0].map((p) => p[1])),
        Math.max(...rings[0].map((p) => p[0])),
        Math.max(...rings[0].map((p) => p[1])),
      ],
    }));
  function inside(p, ring) {
    let hit = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i],
        b = ring[j];
      if (
        a[1] > p[1] !== b[1] > p[1] &&
        p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]
      )
        hit = !hit;
    }
    return hit;
  }
  const failures = [];
  for (const [a, b] of EDGES) {
    const steps = Math.ceil(distanceNm(NODES[a], NODES[b]) / 15);
    for (let i = 0; i <= steps; i++) {
      const p = interpolate(NODES[a], NODES[b], i / steps);
      if (
        polygons.some(
          ({ rings, bounds: v }) =>
            p[0] >= v[0] &&
            p[0] <= v[2] &&
            p[1] >= v[1] &&
            p[1] <= v[3] &&
            inside(p, rings[0]) &&
            !rings.slice(1).some((r) => inside(p, r)),
        )
      ) {
        failures.push(`${a} → ${b}: ${p.map((v) => v.toFixed(2))}`);
        break;
      }
    }
  }
  assert.deepEqual(failures, []);
});
