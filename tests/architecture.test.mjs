import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { CATALOG, loadCatalog } from "../worker/catalog-loader.mjs";
import { readDocument, parseDataDocument } from "../worker/documents.mjs";
import { newGame, decisionQueue, queueDecision } from "../mechanics/engine.mjs";
import { applyCommand } from "../mechanics/game-actions.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
import { scriptedDecisions } from "../mechanics/events.mjs";
import { simulationHost } from "../worker/simulation-host.mjs";
import { automaticAircraftDraft } from "../mechanics/aircraft-designer.mjs";
import { automaticDraft } from "../mechanics/designer.mjs";

test("a documentation edit changes the live catalog without a generated data file", async () => {
  const changed = await loadCatalog(async (file) => {
    const d = structuredClone(await readDocument(file));
    if (file === "1936hindsight/nations/USA.md") {
      d.starting.gold = 12345;
      d.description = "Editable test briefing";
      d.economy.gdp = 72000;
    }
    return d;
  });
  const s = newGame(changed, "USA", 23);
  assert.equal(s.nations.USA.gold, 12345);
  assert.equal(changed.nations.USA.description, "Editable test briefing");
  assert.equal(s.nations.USA.gdp, 72000);
  assert.equal(CATALOG.nations.USA.starting.gold, 60000);
  assert.throws(
    () => parseDataDocument('```json game-data\n{"$ref":"elsewhere"}\n```'),
    /Unsupported/,
  );
  assert.throws(() => readDocument("../outside.md"), /Invalid/);
});

test("human and AI actors pay identical prices, satisfy the same limits, and cannot order foreign assets", () => {
  for (const campaign of Object.keys(CATALOG.campaigns))
    for (const id of Object.keys(CATALOG.campaigns[campaign].nations)) {
      const a = newGame(CATALOG, id, 23, campaign),
        b = structuredClone(a);
      b.controllers[id] = "ai";
      b.player = id === "JPN" ? "USA" : "JPN";
      const cmd = { type: "project", args: { id: "training" } };
      for (const s of [a, b]) applyCommand(s, CATALOG, cmd, id);
      assert.deepEqual(a.nations[id].projects, b.nations[id].projects);
      for (const key of ["gold", "industry", "influence"])
        assert.equal(a.nations[id][key], b.nations[id][key]);
      const before = structuredClone(b.nations[id]);
      assert.throws(() => applyCommand(b, CATALOG, cmd, id), /progress/);
      assert.deepEqual(b.nations[id], before);
      assert.throws(() =>
        applyCommand(
          b,
          CATALOG,
          { type: "funding", args: { field: "schoolFunding", value: 1.1 } },
          id,
        ),
      );
      const foreign = Object.values(CATALOG.campaigns[campaign].classes).find(
        (c) => c.nation !== id,
      );
      assert.throws(() =>
        applyCommand(
          b,
          CATALOG,
          { type: "order", args: { id: foreign.id, count: 1 } },
          id,
        ),
      );
      validateSave(a, CATALOG);
    }
});

test("nation-owned decisions use the same effects without exposing AI prompts or pausing the player", () => {
  const s = newGame(CATALOG, "JPN", 23),
    before = s.nations.USA.industry;
  queueDecision(
    s,
    "ai-test",
    "Budget",
    "Choose",
    [
      {
        id: "accept",
        label: "Accept",
        detail: "Spend 10 influence for 4000 industry.",
        influence: 10,
        industryGain: 4000,
      },
    ],
    { actor: "USA", critical: true },
  );
  assert(!s.decisions.some((d) => d.key === "ai-test"));
  assert(decisionQueue(s, "USA").some((d) => d.key === "ai-test"));
  applyCommand(
    s,
    CATALOG,
    { type: "choose", args: { key: "ai-test", id: "accept" } },
    "USA",
  );
  assert.equal(s.nations.USA.industry, before + 4000);
  assert.equal(decisionQueue(s, "USA").length, 0);
  s.day = Math.floor(Date.parse("1936-11-04T00:00:00Z") / 86400000);
  s.paused = false;
  s.autoPause = false;
  scriptedDecisions(s, CATALOG);
  assert(s.nations.USA.completedDecisions.includes("us-election"));
  assert(!s.decisions.some((d) => d.key === "us-election"));
  assert.equal(s.paused, false);
});

test("worker ignores supplied catalog substitutions and refuses arbitrary state replacement", () => {
  const messages = [],
    s = newGame(CATALOG, "USA", 23),
    host = simulationHost({
      content: CATALOG,
      send: (m) => messages.push(m),
      schedule: () => 1,
      cancel: () => {},
      now: () => 0,
    });
  host.receive({
    type: "initialize",
    state: s,
    content: { invalid: true },
    generation: 1,
    requestId: 1,
  });
  assert.equal(messages.at(-1).state.player, "USA");
  host.receive({
    type: "replace",
    state: { ...s, gold: Infinity },
    generation: 1,
    requestId: 2,
  });
  assert.equal(messages.at(-1).type, "failure");
  host.stop();
});

test("source directories have no legacy build copies or browser persistence in mechanics", async () => {
  for (const file of await fs.readdir("mechanics"))
    if (file.endsWith(".mjs"))
      assert.doesNotMatch(
        await fs.readFile("mechanics/" + file, "utf8"),
        /localStorage\.|document\.querySelector|from ['"].*\/ui\//,
      );
  const html = await fs.readFile("ui/index.html", "utf8");
  assert.equal((html.match(/rel="stylesheet"/g) || []).length, 1);
});

test("worker design orders update the authoritative state and build a serializable snapshot", () => {
  const messages = [],
    s = newGame(CATALOG, "USA", 23),
    host = simulationHost({
      content: CATALOG,
      send: (m) => messages.push(structuredClone(m)),
      schedule: () => 1,
      cancel: () => {},
      now: () => 0,
    });
  host.receive({ type: "initialize", state: s, generation: 1, requestId: 1 });
  for (const [type, recipe] of [
    ["commission-aircraft", automaticAircraftDraft(s, CATALOG)],
    ["commission-draft", automaticDraft(s, CATALOG)],
  ]) {
    const gold = s.nations.USA.gold;
    host.receive({
      type: "command",
      requestId: messages.length + 1,
      command: { type, args: { recipe } },
    });
    const response = messages.at(-1);
    assert.equal(response.type, "state");
    assert.equal(response.commandError, undefined);
    assert.equal(response.state.nations.USA.gold, gold - response.result.fee);
    assert(response.view.air && response.view.fleets);
    validateSave(response.state, CATALOG);
  }
  assert.equal(s.nations.USA.customAircraft.length, 1);
  assert.equal(s.nations.USA.customDesigns.length, 1);
  host.stop();
});
