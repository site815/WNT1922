import test from "node:test";
import assert from "node:assert/strict";
import { aircraftSpeed } from "../ui/catalog-presentation.mjs";
import { aircraftHover } from "../ui/inspection-view.mjs";

test("aircraft cards and inspections distinguish cruise-only data from a true maximum", () => {
  const model = { id: "speed-label-fixture", name: "Reconnaissance aircraft", type_year: 1933, performance: { speed_kmh: { cruise: 261 } }, basing: { land: true }, crew: { normal: 2 } };
  assert.deepEqual(aircraftSpeed(model), { label: "Cruising speed", value: 261 });
  let hover = aircraftHover(model, { equipment: {} }, { artwork: false });
  assert.match(hover, /Cruising speed<\/dt><dd>261 km\/h/);
  assert.doesNotMatch(hover, /Maximum speed/);
  model.performance.speed_kmh = { cruise: 220, maximum: 315, torpedo_attack: 360 };
  assert.deepEqual(aircraftSpeed(model), { label: "Maximum speed", value: 315 });
  hover = aircraftHover(model, { equipment: {} }, { artwork: false });
  assert.match(hover, /Maximum speed<\/dt><dd>315 km\/h/);
  assert.doesNotMatch(hover, /360 km\/h/);
});
