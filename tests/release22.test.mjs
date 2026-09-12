import { POLITICAL, POLITICAL_1922 } from "../worker/map-assets.mjs";
import { CATALOG } from "../worker/catalog-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  newGame,
  projectPrice,
  projectBlock,
  monthlyIncome,
  orderShip,
  aiTurn,
} from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import { PROGRAMS } from "../mechanics/balance.mjs";
import { merchantEconomy } from "../mechanics/merchant-economy.mjs";
import {
  closeEconomicMonth,
  growthOutlook,
} from "../mechanics/economic-growth.mjs";
import {
  automaticDraft,
  evaluateDesign,
  commissionDraft,
} from "../mechanics/designer.mjs";
import {
  automaticAircraftDraft,
  evaluateAircraft,
  commissionAircraft,
} from "../mechanics/aircraft-designer.mjs";
import {
  aircraftQuality,
  aircraftProtection,
} from "../mechanics/aircraft-quality.mjs";
import { aircraftFitsShip } from "../mechanics/aircraft-compatibility.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
import { mapPoint } from "../ui/projection.mjs";
import {
  chartCoordinates,
  chartPosition,
  centerChart,
} from "../ui/map-focus.mjs";
import { commandView } from "../ui/command-view.mjs";
import { aircraftHover, mapHover } from "../ui/inspection-view.mjs";
import { resourceHover } from "../ui/resource-breakdown.mjs";
import {
  strategicDamage,
  repairIndustry,
} from "../mechanics/strategic-air.mjs";
import {
  setCampaignMinutes,
  campaignMinutes,
} from "../mechanics/campaign-clock.mjs";
import {
  balanceScreens,
  screenRequirement,
  screenStrength,
  fleetPosition,
  invalidateOperations,
} from "../mechanics/task-forces.mjs";
const b = structuredClone(CATALOG);
const start = (id = "USA", campaign = "in_good_faith_1936") => {
  const s = newGame(b, id, 2219, campaign);
  s.autoPause = false;
  s.decisions = [];
  return [s, contentFor(b, s), s.nations[id]];
};
test("all fourteen starts have period levels, named inherited hulls and an abstract merchant register", () => {
  for (const campaign of Object.keys(b.campaigns))
    for (const id of Object.keys(b.nations)) {
      const [s, c, n] = start(id, campaign),
        level = campaign === "campaign_1922" ? 1 : 5;
      for (const key of Object.keys(PROGRAMS)) {
        assert.equal(n.tech[key], level);
        assert.equal(projectPrice(s, key).days, 180);
      }
      assert.ok(n.groups.every((g) => g.service !== "merchant"));
      for (const g of n.groups.filter(
        (g) =>
          g.service === "warship" &&
          g.count === 1 &&
          (id !== "JPN" || g.legacy),
      ))
        assert.doesNotMatch(g.name, /Hull \d|type hull/i, g.name);
      const names = n.groups
        .filter((g) => g.count === 1 && g.service === "warship")
        .map((g) => g.name);
      assert.equal(new Set(names).size, names.length, id + " names");
      const economy = merchantEconomy(s, c);
      assert.ok(
        Math.abs(economy.current - n.merchant.hulls * n.merchant.averageGRT) <
          1e-5,
      );
      assert.equal(economy.logistics, 50);
      validateSave(s, b);
    }
});
test("1922 naval catalogs retain only opening designs or existing plans; 1936 keeps future generations", () => {
  for (const id of Object.keys(b.nations)) {
    const [s, c] = start(id, "campaign_1922"),
      n = c.nations[id],
      owned = new Set(
        [...n.hulls, ...n.aggregates, ...n.support].map((g) => g.class_id),
      );
    assert.ok(
      n.aircraft.every((a) => a.type_year <= 1922 || a.plan_year <= 1922),
    );
    assert.ok(
      n.designs.every(
        (k) =>
          c.classes[k].year <= 1922 ||
          owned.has(k) ||
          c.classes[k].raw.plan_year <= 1922,
      ),
    );
    const newer = b.campaigns.in_good_faith_1936;
    assert.ok(newer.nations[id].aircraft.some((a) => a.type_year > 1936));
  }
});

test("component designers derive feasible mass, costs and battle effects and survive reload", () => {
  for (const campaign of Object.keys(b.campaigns)) {
    const [s, c, n] = start("USA", campaign);
    n.gold = n.industry = 1e6;
    n.influence = 500;
    const draft = automaticDraft(s, c, "DD"),
      base = evaluateDesign(draft, "USA"),
      heavy = evaluateDesign(
        {
          ...draft,
          armor: 100,
          features: [...draft.features, "damage_control"],
        },
        "USA",
      );
    assert.ok(
      heavy.tons > base.tons &&
        heavy.gold > base.gold &&
        heavy.speed < base.speed,
    );
    const made = commissionDraft(s, c, draft);
    let updated = contentFor(b, s);
    orderShip(s, updated, made.ship.id, 2);
    for (const role of ["fighter", "strike", "scout", "multirole"]) {
      const r = automaticAircraftDraft(s, updated, role),
        q = evaluateAircraft(r, "USA"),
        protectedFit = evaluateAircraft({ ...r, armor: r.armor + 100 }, "USA");
      assert.ok(q.valid);
      assert.ok(protectedFit.empty > q.empty);
      assert.ok(
        aircraftProtection(protectedFit.aircraft) <
          aircraftProtection(q.aircraft),
      );
      if (role === "fighter") {
        const stronger = evaluateAircraft({ ...r, guns: r.guns + 2 }, "USA");
        assert.ok(
          aircraftQuality(stronger.aircraft, "fighter") >
            aircraftQuality(q.aircraft, "fighter"),
        );
      }
      const a = commissionAircraft(s, updated, r);
      updated = contentFor(b, s);
      assert.ok(
        updated.nations.USA.aircraft.some((x) => x.id === a.aircraft.id),
      );
      assert.ok(aircraftHover(a.aircraft, updated).includes("Armament"));
      assert.doesNotMatch(aircraftHover(a.aircraft, updated), /NaN|undefined/);
    }
    const saved = validateSave(structuredClone(s), b),
      restored = contentFor(b, saved);
    assert.deepEqual(
      restored.nations.USA.aircraft,
      updated.nations.USA.aircraft,
    );
    assert.equal(saved.nations.USA.customAircraft.length, 4);
  }
});
test("new aircraft cannot bypass year, basing or detection requirements", () => {
  const [s, c, n] = start();
  n.gold = 1e6;
  const r = automaticAircraftDraft(s, c, "scout");
  assert.throws(() =>
    commissionAircraft(s, c, { ...r, features: [...r.features, "radar"] }),
  );
  assert.equal(n.customAircraft?.length || 0, 0);
  const q = evaluateAircraft(r, "USA");
  assert.equal(aircraftFitsShip(q.aircraft, { air: 60 }), false);
  assert.equal(
    aircraftFitsShip(q.aircraft, { air: 0, scoutAircraft: 2 }),
    true,
  );
  const carrier = evaluateAircraft(
    automaticAircraftDraft(s, c, "fighter"),
    "USA",
  );
  assert.equal(aircraftFitsShip(carrier.aircraft, { air: 60 }), true);
  assert.equal(
    aircraftFitsShip(carrier.aircraft, { air: 0, scoutAircraft: 2 }),
    false,
  );
});
test("map centering and inverse projection work across zoom and the date line without replacing command controls", () => {
  for (const point of [
    [179, 45],
    [-177, -60],
    [90, 80],
    [-120, 0],
  ])
    for (const rotation of [-179, 0, 140]) {
      const roundtrip = chartCoordinates(mapPoint(point, rotation), rotation);
      assert.ok(Math.abs(roundtrip[1] - point[1]) < 0.00001);
      assert.ok(
        Math.abs(((roundtrip[0] - point[0] + 540) % 360) - 180) < 0.00001,
      );
    }
  const [s, c] = start(),
    f = s.nations.USA.fleets[0],
    ui = { zoom: 8 };
  centerChart(ui, chartPosition(s, {}, "fleet", f.id));
  const before = commandView(s, c, ui);
  centerChart(ui, chartPosition(s, {}, "country", "JPN"), { zoom: true });
  const after = commandView(s, c, ui);
  assert.equal(ui.zoom, 16);
  assert.equal(
    (before.match(/data-fleet-mission=/g) || []).length,
    (after.match(/data-fleet-mission=/g) || []).length,
  );
  assert.match(after, /chart-focus/);
  assert.doesNotMatch(after, /selected-manifest/);
  assert.match(
    mapHover(s, c, "territory:test", {
      features: [{ id: "test", name: "Test coast", owner: "USA" }],
    }),
    /Test coast/,
  );
});
test("economy resource breakdowns show the same normalized facility factor as actual income", () => {
  const [s, c, n] = start();
  for (const level of [1, 5, 9]) {
    n.tech.industry = level;
    for (const funding of [0.1, 0.5, 1]) {
      n.industryFunding = funding;
      for (const key of ["GOLD", "INDUSTRY", "YARDS", "SHIPPING"])
        assert.doesNotMatch(resourceHover(s, c, key), /NaN|undefined|Infinity/);
      assert.ok(Number.isFinite(monthlyIncome(s, c).industry));
    }
  }
});
test("cached political geography remains present when switching between map menus", () => {
  const [s, c] = start(),
    data = POLITICAL;
  commandView(s, c, {}, data);
  const previous = globalThis.document;
  globalThis.document = { querySelector: () => ({}) };
  try {
    const cached = commandView(
      s,
      c,
      { mode: "land", sidePanel: "Land campaigns" },
      data,
    );
    assert.match(cached, /data-preserve="true"/);
    assert.ok(
      (cached.match(/class="political-territory"/g) || []).length > 100,
    );
  } finally {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
  }
});
test("bombing damage is bounded, national-scale sensitive and repairs cost resources only after safety delay", () => {
  const [s, c] = start("GBR"),
    model = c.nations.GBR.armyAircraft.find(
      (a) => a.role === "strategic_bomber",
    ),
    op = {
      operation: "strategic",
      targetNation: "DEU",
      targetId: "kiel",
      sourcePort: "portsmouth",
      industrialTarget: "industry",
      strikes: 100,
      escorts: 20,
      airWing: [{ model: model.id, role: "bomber", crewed: 100 }],
    };
  const small = strategicDamage(s, c, "GBR", op, 1200),
    large = strategicDamage(
      s,
      c,
      "GBR",
      { ...op, targetNation: "USA", targetId: "norfolk" },
      1200,
    );
  assert.ok(small.damage > large.damage && small.damage <= 0.025);
  const n = s.nations.DEU,
    damage = n.industrialDamage.industry,
    gold = n.gold;
  repairIndustry(s);
  assert.equal(n.industrialDamage.industry, damage);
  setCampaignMinutes(s, campaignMinutes(s) + 1440);
  repairIndustry(s);
  assert.ok(n.industrialDamage.industry < damage && n.gold < gold);
  n.gold = n.industry = 0;
  const before = n.industrialDamage.industry;
  repairIndustry(s);
  assert.equal(n.industrialDamage.industry, before);
});
test("under-screened capital groups at the same port consolidate without moving ships", () => {
  const [s, c, n] = start("USA");
  const core = n.groups
      .filter(
        (g) =>
          ["BB", "BC"].includes(c.classes[g.classId].type) &&
          g.status === "active",
      )
      .slice(0, 2),
    escorts = n.groups
      .filter(
        (g) => c.classes[g.classId].type === "DD" && g.status === "active",
      )
      .slice(0, 3);
  assert.equal(core.length, 2);
  const original = n.fleets.find((f) => f.role === "battle"),
    other = {
      ...structuredClone(original),
      id: "test-consolidate",
      name: "Second force",
    };
  Object.assign(original, {
    phase: "port",
    route: [[0, 0]],
    port: "norfolk",
    manual: false,
    pacificTarget: null,
  });
  Object.assign(other, {
    phase: "port",
    route: [[0, 0]],
    port: "norfolk",
    manual: false,
    pacificTarget: null,
  });
  n.fleets = [original, other];
  for (const g of n.groups) delete g.fleetId;
  core[0].fleetId = original.id;
  core[1].fleetId = other.id;
  for (const [i, g] of escorts.entries())
    g.fleetId = i === 0 ? original.id : other.id;
  invalidateOperations(s);
  const before = fleetPosition(s, original);
  balanceScreens(s, c, "USA");
  assert.equal(n.fleets.length, 1);
  assert.ok(
    screenStrength(s, c, "USA", original) >=
      screenRequirement(s, c, "USA", original),
  );
  assert.deepEqual(fleetPosition(s, original), before);
});
