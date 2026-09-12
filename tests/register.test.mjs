import { CATALOG } from "../worker/catalog-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as sim from "../mechanics/engine.mjs";
import { fleetService } from "../mechanics/catalog.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
const content = structuredClone(CATALOG);

test("merchant, support and warship opening registers are disjoint for every nation", () => {
  const s = sim.newGame(content);
  for (const [id, total] of Object.entries({
    JPN: 2146,
    USA: 2553,
    GBR: 6998,
    DEU: 2070,
  })) {
    assert.equal(sim.merchantSummary(s, content, id).total, total);
    const n = content.nations[id];
    assert.ok(
      n.aggregates.every(
        (g) => fleetService(content.classes[g.class_id]) === "warship",
      ),
    );
    const all = s.nations[id].groups;
    assert.equal(new Set(all.map((g) => g.id)).size, all.length);
    assert.ok(
      all.every((g) => g.service === fleetService(content.classes[g.classId])),
    );
  }
  assert.equal(sim.fleetSummary(s, content, "JPN").active, 105);
  assert.equal(sim.fleetSummary(s, content, "JPN").reserve, 40);
  assert.equal(sim.supportSummary(s, content, "JPN").total, 10);
  assert.equal(sim.supportSummary(s, content, "JPN").tons, 47000);
  assert.ok(!s.nations.JPN.groups.some((g) => g.service === "merchant"));

  assert.equal(sim.supportSummary(s, content, "GBR").total, 16);
  assert.equal(sim.supportSummary(s, content, "GBR").unknownTonnage, 16);
});

test("merchant counts cannot inflate naval power, displacement, crew demand, supply or upkeep", () => {
  const s = sim.newGame(content);
  const before = {
    fleet: sim.fleetSummary(s, content),
    power: sim.fleetPower(s, content),
    upkeep: sim.monthlyIncome(s, content).upkeep,
    supply: sim.supply(s, content, "JPN", "pacific"),
    treaty: sim.treatyLedger(s, content),
  };

  s.nations.JPN.merchant.hulls = 100000;
  assert.deepEqual(
    {
      fleet: sim.fleetSummary(s, content),
      power: sim.fleetPower(s, content),
      upkeep: sim.monthlyIncome(s, content).upkeep,
      supply: sim.supply(s, content, "JPN", "pacific"),
      treaty: sim.treatyLedger(s, content),
    },
    before,
  );
  sim.setPriority(s, "decisive", "indian");
  assert.ok(
    s.nations.JPN.groups
      .filter((g) => g.service !== "warship")
      .every((g) => !g.destination),
  );
});

test("civilian merchant hulls remain outside naval construction and warship totals", () => {
  const s = sim.newGame(content);
  s.autoPause = false;
  Object.assign(s.nations.JPN, { gold: 1e7, influence: 1000, industry: 1e7 });
  const n = s.nations.JPN,
    before = sim.fleetSummary(s, content),
    load = sim.yardLoad(s, content).work;
  assert.throws(
    () => sim.orderShip(s, content, "standard_maru_t23", 2),
    /active national catalog/,
  );
  assert.equal(sim.yardLoad(s, content).work, load);
  assert.deepEqual(sim.fleetSummary(s, content), before);
  assert.equal(
    s.nations.JPN.groups.filter((g) => g.service === "merchant").length,
    0,
  );
  assert.equal(sim.merchantSummary(s, content).total, 2146);
  assert.equal(n.delivered, 0);
  assert.equal(n.merchantDelivered, 0);
  assert.equal(sim.fleetSummary(s, content).active, 105);
  assert.equal(sim.supportSummary(s, content).total, 10);
  assert.doesNotThrow(() => validateSave(s, content));
});

test("useful legacy formations are present while explicit retirement and construction plans stay intact", () => {
  const s = sim.newGame(content),
    count = (id, c) =>
      s.nations[id].groups
        .filter((g) => g.classId === c)
        .reduce((v, g) => v + g.count, 0);
  assert.equal(count("USA", "omaha"), 10);
  assert.equal(
    new Set(
      s.nations.USA.groups
        .filter((g) => g.classId === "omaha")
        .map((g) => g.name),
    ).size,
    10,
  );
  for (const g of s.nations.JPN.groups.filter((g) =>
    ["BB", "BC"].includes(content.classes[g.classId].type),
  ))
    assert.equal(g.status, "active");
  const capital = s.nations.GBR.groups.filter(
    (g) => g.legacy && ["BB", "BC"].includes(content.classes[g.classId].type),
  );
  assert.deepEqual(
    capital.map((g) => g.id).sort(),
    [
      "h-hms_hood",
      "h-hms_renown",
      "h-hms_repulse",
      "h-hms_barham",
      "h-hms_malaya",
    ].sort(),
  );
  assert.match(
    capital.find((g) => g.id === "h-hms_barham").name,
    /HMAS Australia/,
  );
  assert.match(capital.find((g) => g.id === "h-hms_malaya").name, /HMAS Anzac/);
  assert.equal(count("GBR", "queen_elizabeth"), 2);
  assert.equal(count("GBR", "revenge"), 0);
  assert.equal(count("GBR", "iron_duke"), 0);
  assert.equal(
    count("GBR", "danae") +
      count("GBR", "emerald") +
      count("GBR", "c_class_cl"),
    14,
  );
  assert.equal(
    s.nations.DEU.groups.filter(
      (g) => g.status === "active" && content.classes[g.classId].type === "BB",
    ).length,
    6,
  );
  assert.equal(
    count("DEU", "gazelle_cl") +
      count("DEU", "bremen_cl") +
      count("DEU", "emden_cl"),
    7,
  );
});
