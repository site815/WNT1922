import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { CATALOG } from "../worker/catalog-loader.mjs";
import { parseDataDocument, loadedDocuments } from "../worker/documents.mjs";
import '../ui/soundtrack.mjs';
import { newGame, monthlyIncome } from "../mechanics/engine.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
import { PROGRAMS } from "../mechanics/balance.mjs";
import { LEVELS } from "../mechanics/research-tree.mjs";
import { aircraftSummary } from "../mechanics/naval-resources.mjs";
import { POLITICAL, POLITICAL_1922 } from "../worker/map-assets.mjs";
import { listFiles, projectFiles } from "./project-files.mjs";

const documents = (await listFiles("catalog")).filter(
  (f) => f.endsWith(".md") && !f.endsWith("README.md"),
);
for (const name of documents)
  parseDataDocument(await fs.readFile("catalog/" + name, "utf8"), name);
assert.deepEqual(loadedDocuments(), [...documents].sort(),
  'Every data document must be loaded by the real runtime; remove abandoned catalogs.');
const openings = [];
for (const [campaign, c] of Object.entries(CATALOG.campaigns))
  for (const [id, n] of Object.entries(c.nations)) {
    assert.equal(n.nation, id);
    assert.equal(Object.keys(c.nations).length, 7);
    assert(n.economy.strategicModifier > 0 && n.economy.strategicModifier <= 1);
    assert(n.starting.strategic > 0);
    for (const key of [
      "gdp",
      "gtp",
      "yardYear",
      "crew",
      "crewYear",
      "aviatorsYear",
      "aircraftYear",
    ])
      assert(
        Number.isFinite(n.economy[key]) && n.economy[key] > 0,
        `${campaign}/${id}: ${key}`,
      );
    for (const cl of n.designs) {
      assert(c.classes[cl], `Missing design ${cl}`);
      assert.equal(c.classes[cl].nation, id);
      assert.notEqual(c.classes[cl].service, "merchant");
    }
    for (const group of [...n.hulls, ...n.aggregates, ...n.support])
      assert(
        c.classes[group.class_id],
        `Unknown opening class ${group.class_id}`,
      );
    const names = new Set();
    for (const a of [...n.aircraft, ...n.armyAircraft]) {
      assert(!names.has(a.id), `Duplicate aircraft ${a.id}`);
      names.add(a.id);
      assert(Number.isInteger(a.type_year), a.id + " development date");
    }
    const s = newGame(CATALOG, id, 23001, campaign);
    validateSave(s, CATALOG);
    const income = monthlyIncome(s, c, id);
    for (const v of Object.values(income))
      if (typeof v === "number") assert(Number.isFinite(v));
    assert(
      aircraftSummary(s, c, id).aviatorBalance >= 0,
      `${id} opening aircrew`,
    );
    openings.push({
      campaign,
      nation: id,
      ships: n.designs.length,
      aircraft: n.aircraft.length,
    });
  }
for (const [key, p] of Object.entries(PROGRAMS)) {
  assert(LEVELS[key]?.length === p.max, key + " level descriptions");
  assert(p.days > 0 && p.gold >= 0 && p.industry >= 0 && p.influence >= 0);
}
for (const map of [POLITICAL, POLITICAL_1922]) {
  assert.equal(map.license, "Public domain");
  assert.equal(
    new Set(map.features.map((f) => f.id)).size,
    map.features.length,
  );
  assert(
    map.features.every((f) => f.geometry && f.point.every(Number.isFinite)),
  );
}
// Enforce the module boundary and resolve imports without a bundled/generated tree.
for (const file of (await projectFiles()).filter((f) => f.endsWith(".mjs"))) {
  const source = await fs.readFile(file, "utf8");
  assert(
    !/content\.json|\.build\/game|game\/src/.test(source),
    `Retired build input in ${file}`,
  );
  if (file.startsWith("mechanics/"))
    assert(
      !/\b(?:document|window|localStorage)\s*\.|from\s+['"][^'"]*\/ui\//.test(
        source,
      ),
      "UI dependency in mechanics: " + file,
    );
  for (const m of source.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g))
    await fs.access(path.resolve(path.dirname(file), m[1]));
}
await fs.mkdir("test-output", { recursive: true });
const result = { passed: true, documents: documents.length, openings };
await fs.writeFile(
  "test-output/catalog-check.json",
  JSON.stringify(result, null, 2),
);
console.log(
  `Validated ${documents.length} live documentation catalogs, all 14 starts, research levels, maps and module boundaries.`,
);
