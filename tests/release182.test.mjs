import { CATALOG } from "../worker/catalog-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  newGame,
  advanceMinutes,
  shipOrderBlock,
} from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import { economyFor } from "../mechanics/balance.mjs";
import {
  growthOutlook,
  closeEconomicMonth,
} from "../mechanics/economic-growth.mjs";
import { merchantEconomy } from "../mechanics/merchant-economy.mjs";
import { fleetPosition, sinkMerchants } from "../mechanics/task-forces.mjs";
import { commandView } from "../ui/command-view.mjs";
import { diplomacyView as governmentView } from "../ui/diplomacy-view.mjs";
import { distanceNm } from "../mechanics/world.mjs";
import { resourceHover } from "../ui/resource-breakdown.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
const bundle = structuredClone(CATALOG);
const start = (id = "JPN", campaign = "in_good_faith_1936") => {
  const s = newGame(bundle, id, 713, campaign);
  return [s, contentFor(bundle, s), s.nations[id]];
};

test("every naval command appears in one scrolling list with stable marker offsets", () => {
  const [s, c, n] = start();
  let html = commandView(s, c, { fleetPage: 999 });
  for (const f of n.fleets)
    assert.ok(
      html.includes('data-action="focus-fleet" data-id="' + f.id + '"'),
    );
  assert.ok(!html.includes('data-action="list-page"'));
  const marker = (html, id) => {
    const match = html.match(
      new RegExp(
        'data-id="' +
          id +
          '" data-fleet-hover[^>]+data-motion-x="([^"]+)" data-motion-y="([^"]+)"[^>]*>[\\s\\S]*?<path transform="translate\\(([^,]+),([^\\)]+)',
      ),
    );
    return (
      match && [
        Number(match[3]) - Number(match[1]),
        Number(match[4]) - Number(match[2]),
      ]
    );
  };
  const fleet = n.fleets.at(-1),
    before = marker(html, fleet.id);
  assert.ok(before);
  n.fleets.reverse();
  html = commandView(s, c);
  const after = marker(html, fleet.id);
  assert.ok(
    before.every((v, i) => Math.abs(v - after[i]) < 1e-8),
    "draw order cannot relocate the marker",
  );
});
test("peace fleet and convoy positions remain continuous across daily planning in both campaigns", () => {
  for (const campaign of Object.keys(bundle.campaigns)) {
    const [s, c] = start("JPN", campaign);
    let previous = new Map();
    for (let minute = 0; minute < 1440 * 3; minute++) {
      for (const n of Object.values(s.nations))
        for (const f of [...n.fleets, ...n.convoys]) {
          const pos = fleetPosition(s, f),
            old = previous.get(f.id);
          if (old)
            assert.ok(
              distanceNm(old.pos, pos) <=
                Math.max(old.speed, f.speed) / 60 + 0.1,
              campaign + " " + f.id + " minute " + minute,
            );
          previous.set(f.id, { pos, speed: f.speed });
        }
      advanceMinutes(s, c, 1);
    }
    validateSave(s, bundle);
  }
});
test("civilian hull growth conserves integer hulls and can recover a destroyed merchant register", () => {
  for (const campaign of Object.keys(bundle.campaigns))
    for (const id of Object.keys(bundle.nations)) {
      const [s, c, n] = start(id, campaign);
      const before = merchantEconomy(s, c, id).current;
      closeEconomicMonth(s, c, id);
      assert.ok(Number.isInteger(n.merchant.hulls));
      assert.ok(merchantEconomy(s, c, id).current >= before);
      sinkMerchants(s, id, 1e6);
      for (let month = 0; month < 60; month++) closeEconomicMonth(s, c, id);
      assert.ok(n.merchant.hulls > 0, id + " can recover using civilian yards");
      validateSave(s, bundle);
    }
});
test("all fourteen catalogs use naval support generations and exclude civilian construction", () => {
  for (const campaign of Object.keys(bundle.campaigns))
    for (const id of Object.keys(bundle.nations)) {
      const [s, c, n] = start(id, campaign),
        designs = c.nations[id].designs.map((cid) => c.classes[cid]);
      assert.ok(
        !designs.some((cl) => cl.service === "merchant" || cl.type === "AK"),
      );
      if (id === "JPN" && campaign === "in_good_faith_1936") {
        const hybrid = designs.find((cl) => cl.supportHybrid);
        assert.ok(hybrid);
        assert.equal(shipOrderBlock(s, c, hybrid.id), "");
        assert.ok(
          n.fleets.some(
            (f) => f.role === "support" && f.supportKind === "support",
          ),
        );
      } else
        for (const type of ["AO"])
          assert.deepEqual(
            designs
              .filter(
                (cl) =>
                  cl.type === type && /Fleet support ship ·/.test(cl.name),
              )
              .map((cl) => cl.year).sort((a,b)=>a-b),
            [1922, 1932, 1942],
          );
    }
});
