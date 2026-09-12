import { CATALOG } from "../worker/catalog-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { newGame, chooseDecision } from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
import { applyCommand } from "../mechanics/game-actions.mjs";
import { commenceWar } from "../mechanics/war-politics.mjs";
const bundle = structuredClone(CATALOG);
test("all fourteen openings retain 50% funding and save correctly without relation scores", () => {
  for (const campaign of Object.keys(bundle.campaigns))
    for (const id of Object.keys(bundle.campaigns[campaign].nations)) {
      const s = newGame(bundle, id, 47000, campaign);
      assert.equal(Object.keys(s.relations).length, 21);
      for (const r of Object.values(s.relations))
        assert.ok(!("score" in r) && !("warning" in r));
      for (const n of Object.values(s.nations))
        for (const field of [
          "industryFunding",
          "schoolFunding",
          "aviatorFunding",
          "aircraftFunding",
        ])
          assert.equal(n[field], 0.5);
      validateSave(s, bundle);
    }
});
test("war announcements pause, survive reload and restore the previous running state", () => {
  for (const paused of [false, true]) {
    const s = newGame(bundle, "USA"),
      c = contentFor(bundle, s);
    s.decisions = [];
    s.paused = paused;
    s.autoPause = false;
    commenceWar(s, c, "JPN", "USA");
    assert.equal(s.paused, true);
    assert.throws(
      () => applyCommand(s, bundle, { type: "pause", args: { value: false } }),
      /Acknowledge/,
    );
    const loaded = validateSave(s, bundle),
      d = loaded.decisions.find((d) => d.popup);
    assert.equal(d.kind, "war");
    assert.equal(d.options.length, 1);
    chooseDecision(loaded, c, d.key, "acknowledge");
    assert.equal(loaded.paused, true);
    chooseDecision(s, c, d.key, "acknowledge");
    assert.equal(s.paused, paused);
    assert.equal(loaded.relations["JPN-USA"].war, true);
  }
});
