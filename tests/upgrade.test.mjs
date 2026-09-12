import { syncConvoys } from "../mechanics/task-forces.mjs";
import { CATALOG } from "../worker/catalog-loader.mjs";
import { POLITICAL as political } from "../worker/map-assets.mjs";
import { fleetCompositionHover } from "../ui/inspection-view.mjs";
import { fullyStaffed } from "../mechanics/ship-staffing.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as sim from "../mechanics/engine.mjs";
import {
  SPEEDS,
  dailyResources,
  aircraftSummary,
  setFacilityFunding,
  setProductionModel,
  orderAircraft,
  productionBlock,
} from "../mechanics/naval-resources.mjs";
import {
  fleetPosition,
  fleetStats,
  detachRepairs,
  minuteOperations,
  invalidateOperations,
  sinkMerchants,
  MISSIONS,
} from "../mechanics/task-forces.mjs";
import {
  setCampaignMinutes,
  campaignMinutes,
} from "../mechanics/campaign-clock.mjs";
import { NODES, distanceNm } from "../mechanics/world.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
import {
  equalEarth,
  mapPoint,
  geometryPath,
  seaOutline,
} from "../ui/projection.mjs";
import { commandView, remainingRoute } from "../ui/command-view.mjs";
import {
  alertsView,
  resourcesView,
  weaponDetails,
} from "../ui/ministry-view.mjs";
import { dailyWorld, supplyEffect, CAMPAIGNS } from "../mechanics/land-war.mjs";
const c = structuredClone(CATALOG);
function start(id = "JPN") {
  const s = sim.newGame(c, id, 42);
  s.autoPause = false;
  s.paused = false;
  s.decisions = [];
  return s;
}
function funded(s) {
  for (const n of Object.values(s.nations))
    Object.assign(n, { gold: 1e8, industry: 1e8, influence: 500 });
}

test("all supported speed settings process every crossed fifteen-minute tick, including 50,000x", () => {
  for (const [speed] of SPEEDS) {
    const s = start();
    s.speed = speed;
    const before = campaignMinutes(s);
    sim.tick(s, c, 0.72);
    assert.ok(Math.abs(campaignMinutes(s) - before - 120 * speed) < 1e-6);
    assert.equal(s.minuteTicks, Math.floor(120 * speed / 15));
  }
});

test("fractional animation frames never duplicate or omit operational ticks", () => {
  for (const [speed] of SPEEDS) {
    const s = start();
    s.speed = speed;
    const before = campaignMinutes(s);
    for (let frame = 0; frame < 200; frame++) sim.tick(s, c, 0.05);
    assert.ok(
      Math.abs(campaignMinutes(s) - before - (speed * 10000) / 6) < 0.001,
    );
    assert.equal(s.minuteTicks, Math.floor((speed * 10000) / 90));
  }
});
test("scrapping immediately removes the selected hull, returns salvage and preserves personnel and aircraft", () => {
  const s = start(),
    n = s.nations.JPN,
    g = n.groups.find(
      (g) => g.status === "active" && c.classes[g.classId].type === "CV",
    ),
    before = sim.fleetSummary(s, c),
    air = aircraftSummary(s, c).total,
    crew = n.crew,
    pilots = n.aviators,
    industry = n.industry;
  const value = sim.scrapGroup(s, c, g.id);
  assert.equal(sim.fleetSummary(s, c).total, before.total - g.count);
  assert.equal(g.status, "scrapped");
  assert.equal(n.industry, industry + value);
  assert.ok(value > 0);
  assert.equal(n.crew, crew);
  assert.equal(n.aviators, pilots);
  assert.equal(aircraftSummary(s, c).total, air);
  assert.equal(g.airWing.length, 0);
  assert.throws(() => sim.scrapGroup(s, c, g.id));
  assert.doesNotThrow(() => validateSave(s, c));
});
test("production closes superseded lines without removing ships or funded construction", () => {
  const s = start("USA"),
    n = s.nations.USA,
    original = sim.fleetSummary(s, c);
  assert.match(productionBlock(s, c, "missouri_bb23"), /superseded/);
  assert.throws(() => sim.orderShip(s, c, "missouri_bb23"));
  assert.equal(productionBlock(s, c, "columbia_bb32"), "");
  assert.deepEqual(sim.fleetSummary(s, c), original);
  const de = start("DEU");
  assert.equal(productionBlock(de, c, "seeadler_raider"), "");
  de.nations.DEU.unlocked.push("atlantis_raider");
  assert.match(productionBlock(de, c, "seeadler_raider"), /superseded/);
});
test("all three facilities honor 10-100% funding, charge resources, and stop when unfunded", () => {
  const high = start(),
    low = start();
  funded(high);
  funded(low);
  for (const field of ["schoolFunding", "aviatorFunding", "aircraftFunding"]) {
    setFacilityFunding(high, field, 1);
    setFacilityFunding(low, field, 0.1);
  }
  const initial = structuredClone(high.nations.JPN);
  for (let day = 0; day < 100; day++) {
    high.day++;
    low.day++;
    dailyResources(high, c, () => {});
    dailyResources(low, c, () => {});
  }
  const a = high.nations.JPN,
    b = low.nations.JPN;
  assert.ok(
    Math.abs(
      (a.crew + a.personnelTraining.sailors - initial.crew) /
        (b.crew + b.personnelTraining.sailors - initial.crew) -
        10,
    ) < 1e-7,
  );
  assert.ok(
    Math.abs(
      (a.aviators + a.personnelTraining.aviators - initial.aviators) /
        (b.aviators + b.personnelTraining.aviators - initial.aviators) -
        10,
    ) < 1e-7,
  );
  assert.ok(aircraftSummary(high, c).total > aircraftSummary(low, c).total);
  assert.ok(a.gold < b.gold && a.industry < b.industry);
  a.gold = a.gdp = a.gtp = a.merchant.hulls = 0;
  a.industry = 0;
  const crew = a.crew,
    pilots = a.aviators,
    planes = aircraftSummary(high, c).total;
  high.day++;
  dailyResources(high, c, () => {});
  assert.equal(a.crew, crew);
  assert.equal(a.aviators, pilots);
  assert.equal(aircraftSummary(high, c).total, planes);
  assert.throws(() => setFacilityFunding(high, "schoolFunding", 0));
  assert.throws(() => setFacilityFunding(high, "aircraftFunding", 1.1));
});
test("aircraft designs are funded before model selection and then continuously produced", () => {
  const s = start(),
    n = s.nations.JPN;
  funded(s);
  assert.throws(() => setProductionModel(s, c, "fighter", "raiden_t39"));
  assert.throws(
    () => orderAircraft(s, c, "raiden_t39", 1, "JPN", { development: true }),
    /1939/,
  );
  setCampaignMinutes(s, Date.parse("1939-01-01T00:00:00Z") / 60000);
  const p = orderAircraft(s, c, "raiden_t39", 1, "JPN", { development: true });
  p.remaining = 1;
  dailyResources(s, c, () => {});
  setProductionModel(s, c, "fighter", "raiden_t39");
  for (let i = 0; i < 7; i++) dailyResources(s, c, () => {});
  assert.ok(n.aircraft.raiden_t39 > 0);
  assert.doesNotThrow(() => setProductionModel(s, c, "strike", "raiden_t39"));
  assert.doesNotThrow(() => validateSave(s, c));
});
test("only critical demands auto-pause and ignored demands apply their stated default", () => {
  const s = start();
  s.autoPause = true;
  sim.queueDecision(s, "optional", "Optional report", "Information", [
    { id: "ok", label: "Noted", detail: "No cost." },
  ]);
  assert.equal(s.paused, false);
  const r = s.nations.JPN,
    before = r.influence;
  sim.queueDecision(
    s,
    "demand",
    "Ultimatum",
    "An unavoidable demand",
    [
      {
        id: "deny",
        label: "Reject",
        detail: "Lose 5 influence.",
        influence: 5,
      },
    ],
    {
      critical: true,
      target: "USA",
      deadline: campaignMinutes(s) + 3,
      defaultOption: "deny",
      defaultText: "Lose 5 influence.",
    },
  );
  assert.equal(s.paused, true);
  assert.match(alertsView(s, c, "demand"), /Deadline:/);
  assert.match(alertsView(s, c, "demand"), /If ignored:/);
  s.paused = false;
  s.autoPause = false;
  sim.advanceMinutes(s, c, 15);
  assert.equal(r.influence, before - 5);
  assert.ok(!s.decisions.some((d) => d.key === "demand"));
  assert.ok(s.alerts.some((a) => a.title.startsWith("Deadline reached:")));
});
test("inspection requests expire when the treaty ends or the requester enters war", () => {
  for (const invalidate of [
    (s) => (s.treatyUntil = s.day - 1),
    (s) => (s.relations["JPN-USA"].war = true),
  ]) {
    const s = start();
    sim.queueDecision(
      s,
      "inspection",
      "Inspection",
      "A request",
      [
        {
          id: "deny",
          label: "Deny",
          detail: "Lose 5 influence.",
          influence: 5,
        },
      ],
      {
        critical: true,
        kind: "inspection",
        target: "USA",
        defaultOption: "deny",
      },
    );
    invalidate(s);
    sim.advanceMinutes(s, c, 15);
    assert.equal(s.decisions.length, 0);
  }
  const s = start();
  setCampaignMinutes(s, Date.parse("1941-04-01T00:00:00Z") / 60000 - 1);
  sim.advanceMinutes(s, c, 1);
  assert.ok(!s.decisions.some((d) => d.kind === "inspection"));
  const withdrawn = start();
  sim.queueDecision(
    withdrawn,
    "inspection",
    "Inspection",
    "Request",
    [{ id: "deny", label: "Deny", detail: "No access." }],
    {
      critical: true,
      kind: "inspection",
      target: "USA",
      defaultOption: "deny",
    },
  );
  withdrawn.treatyUntil = withdrawn.day - 1;
  sim.advanceMinutes(withdrawn, c, 15);
  assert.equal(withdrawn.decisions.length, 0);
});
test("opening task forces stay within 2-20 commands and carrier groups have destroyer screens", () => {
  for (const id of Object.keys(c.nations)) {
    const s = start(id),
      n = s.nations[id],
      operational = n.fleets.filter(
        (f) => !["repair", "reinforcement"].includes(f.role),
      );
    assert.ok(operational.length >= 2 && operational.length <= 20);
    for (const f of operational.filter((f) => f.role === "carrier"))
      assert.ok(
        fleetStats(s, c, id, f).active.filter((g) =>
          ["DD", "DE", "DL", "TB"].includes(c.classes[g.classId].type),
        ).length >= 4,
      );
    const assigned = n.groups.filter(
      (g) =>
        g.status === "active" &&
        g.service === "warship" &&
        fullyStaffed(g, c.classes[g.classId]),
    );
    assert.equal(new Set(assigned.map((g) => g.id)).size, assigned.length);
    assert.ok(assigned.every((g) => g.fleetId));
  }
});
test("seriously damaged ships detach physically, can be attacked on return, and repair only in port", () => {
  const s = start("GBR"),
    n = s.nations.GBR,
    f = n.fleets.find((f) => f.role === "cruiser");
  f.route = [NODES.north_sea];
  f.arriveAt = campaignMinutes(s) - 1;
  f.phase = "patrol";
  const g = n.groups.find((g) => g.fleetId === f.id);
  g.health = 0.5;
  g.status = "returning";
  detachRepairs(s, c, "GBR", f.id, NODES.north_sea);
  const returnForce = n.fleets.find((x) => x.id === g.fleetId);
  assert.equal(returnForce.role, "repair");
  assert.deepEqual(fleetPosition(s, returnForce), NODES.north_sea);
  assert.ok(returnForce.arriveAt > campaignMinutes(s));
  assert.equal(fleetStats(s, c, "GBR", returnForce).active.includes(g), true);
  const before = g.health;
  sim.advanceMinutes(s, c, 1);
  assert.equal(g.status, "returning");
  assert.equal(g.health, before);
  assert.ok(distanceNm(fleetPosition(s, returnForce), NODES.north_sea) < 1);
  setCampaignMinutes(s, Math.ceil(returnForce.arriveAt));
  minuteOperations(s, c, () => {});
  assert.equal(g.status, "repair");
  assert.equal(g.health, before);
  assert.doesNotThrow(() => validateSave(s, c));
});
test("merchant losses reduce the civilian register without adding to naval warship losses", () => {
  const s = start(),
    warships = sim.fleetSummary(s, c).total,
    merchants = sim.merchantSummary(s, c).total;
  s.relations["JPN-USA"].war = true;
  const lost = sinkMerchants(s, "JPN", 25);
  assert.equal(lost, 25);
  assert.equal(sim.merchantSummary(s, c).total, merchants - 25);
  assert.equal(sim.fleetSummary(s, c).total, warships);
  assert.equal(s.nations.JPN.merchantLost, 25);
});

test("merchant traffic turns away from enemy ports without teleporting or crediting a delivery", () => {
  const s = start(),
    n = s.nations.JPN,
    v = (s.relations["DEU-JPN"].war = true, syncConvoys(s, c, "JPN"), n.convoys.find((v) => v.destination === "mare_island")),
    before = fleetPosition(s, v),
    delivered = n.convoyDeliveries || 0;
  s.relations["JPN-USA"].war = true;
  minuteOperations(s, c, () => {});
  assert.notEqual(v.targetNode, "mare_island");
  assert.deepEqual(fleetPosition(s, v), before);
  assert.equal(n.convoyDeliveries || 0, delivered);
});
test("scouting and escape speed change the ability to decline an unequal engagement", () => {
  const strong = { speed: 26, scout: 50, ships: 10 },
    slow = { speed: 19, scout: 20, ships: 10 },
    fast = { speed: 34, scout: 140, ships: 10 };
  assert.ok(
    sim.engagementEscapeChance(fast, strong) >
      sim.engagementEscapeChance(slow, strong),
  );
});
test("map projection preserves area, wraps smoothly and paths contain finite coordinates", () => {
  assert.deepEqual(mapPoint([150, 25], 720), mapPoint([150, 25], 0));
  const determinant = (lat) => {
    const p = equalEarth([20, lat]),
      x = equalEarth([20.001, lat]),
      y = equalEarth([20, lat + 0.001]);
    return (
      Math.abs((x[0] - p[0]) * (y[1] - p[1]) - (x[1] - p[1]) * (y[0] - p[0])) /
      Math.cos((lat * Math.PI) / 180)
    );
  };
  assert.ok(Math.abs(determinant(60) / determinant(0) - 1) < 0.001);
  assert.ok(seaOutline().length > 500);
  for (const rotation of [0, 170, -170])
    for (const f of political.features)
      assert.ok(!/NaN|Infinity/.test(geometryPath(f.geometry, rotation)));
  const s = start(),
    f = s.nations.JPN.fleets[0];
  sim.issueFleetOrder(s, c, f.id, "presence");
  const full = f.route.length;
  sim.advanceMinutes(s, c, 60);
  const path = remainingRoute(s, f);
  assert.deepEqual(path[0], fleetPosition(s, f));
  assert.ok(path.length <= full);
});
test("continuous naval supply can reverse campaigns, much faster for islands than interiors", () => {
  const island = {
      ...CAMPAIGNS.find((f) => f.id === "philippines"),
      momentum: 0,
    },
    interior = { ...CAMPAIGNS.find((f) => f.id === "east"), momentum: 0 };
  let islandDays = 0,
    interiorDays = 0;
  for (let day = 1; day <= 4000; day++) {
    for (const f of [island, interior]) {
      const effect = supplyEffect(f, 0, 1);
      f.momentum = effect.momentum;
      if (f.baseline + effect.effect < 0) {
        if (f === island && !islandDays) islandDays = day;
        if (f === interior && !interiorDays) interiorDays = day;
      }
    }
  }
  assert.ok(islandDays > 0 && interiorDays > islandDays * 5);
  const s = start("GBR");
  s.timeline.polandOccurred = true;
  s.timeline.europeOccurred = true;
  setCampaignMinutes(s, Date.parse("1940-07-01T00:00:00Z") / 60000);
  dailyWorld(s, c);
  const france = s.world.fronts.find((f) => f.id === "france");
  france.progress = 1;
  dailyWorld(s, c);
  assert.equal(s.world.control.c220, "DEU");
  setCampaignMinutes(s, Date.parse("1945-03-01T00:00:00Z") / 60000);
  france.progress = 0;
  france.momentum = -10;
  dailyWorld(s, c);
  assert.equal(s.world.control.c220, "FRA");
});
test("command and ministry views expose manifests, distinct missions, aircraft models and weapons without operating areas", () => {
  const s = start(),
    markup = commandView(
      s,
      c,
      { fleetId: s.nations.JPN.fleets[0].id },
      political,
    );
  assert.match(markup, /Naval commands/);
  assert.match(markup, /send-inline-order/);
  assert.match(
    fleetCompositionHover(s, c, s.nations.JPN.fleets[0]),
    /class="hover-ship /,
  );
  assert.match(markup, /Seek aggressive battle/);
  assert.ok(!markup.includes('id="fleet-area"'));
  assert.equal(
    new Set(Object.values(MISSIONS).map((m) => m.description)).size,
    6,
  );
  assert.match(resourcesView(s, c), /10%/);
  assert.match(weaponDetails(c.classes.kaze_t32, c), /14 cm triple/);
  assert.match(weaponDetails(c.classes.columbia_bb32, c), /12.7 mm/);
  assert.ok(!/NaN|undefined|Infinity/.test(markup));
});
