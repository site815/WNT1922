import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { CATALOG } from "../worker/catalog-loader.mjs";
import { newGame, openingGroups } from "../mechanics/engine.mjs";
import { apply1922Decision, historical1922Decisions } from "../mechanics/vanilla.mjs";
import { loadRecognition, recognitionCard, recognitionIndex } from "../ui/recognition.mjs";
import { validateOpeningShipRecognition } from "../tools/check-recognition.mjs";

const index = JSON.parse(await fs.readFile("assets/recognition/index.json", "utf8"));
const registries = await Promise.all(index.registries.map(async file =>
  JSON.parse(await fs.readFile("assets/recognition/" + file, "utf8"))));
const drawings = recognitionIndex(registries);
const drawingFor = (campaign, id) => drawings.platforms.get(`${campaign}:ship:${id}`) || drawings.platforms.get(`ship:${id}`);
const hullCounts = groups => {
  const counts = {};
  for (const g of groups) {
    const key = g.legacy ? "legacy" : "new";
    counts[key] = (counts[key] || 0) + g.count;
  }
  return counts;
};
const loadLocalRecognition = () => loadRecognition({ refresh: true, fetcher: async url => ({
  ok: true, json: async () => JSON.parse(await fs.readFile("." + url, "utf8")),
}) });

test("all actual opening fleets, including legacy classes outside procurement, display accepted drawings", async () => {
  await loadLocalRecognition();
  const coverage = validateOpeningShipRecognition(CATALOG, drawings);
  assert(coverage.legacyGroups > 0 && coverage.legacyHulls > 0 && coverage.legacyClassesOutsideDesigns > 0);
  for (const [campaignId, campaign] of Object.entries(CATALOG.campaigns))
    for (const player of Object.keys(campaign.nations)) {
      const state = newGame(CATALOG, player, 23001, campaignId);
      for (const [nationId, nation] of Object.entries(state.nations)) {
        // Test the initialized simulation, including AI navies and reserve/building groups.
        const opening = openingGroups(campaign, nationId);
        assert.deepEqual(hullCounts(nation.groups), hullCounts(opening),
          `${campaignId}/${player}/${nationId} retained opening and legacy hull counts`);
        for (const group of nation.groups) {
          const match = drawingFor(campaignId, group.classId);
          assert(match, `${campaignId}/${nationId}/${group.name} has a drawing`);
          assert.equal(match.entry.review.status, "accepted");
          assert.match(recognitionCard("ship", group.classId, { campaign: campaignId }),
            new RegExp(`data-recognition="${match.entry.id}"`));
        }
      }
    }
});

test("opening coverage rejects omitted legacy classes even when the procurement list is covered", () => {
  const catalog = { campaigns: { test: {
    classes: { modern: { id: "modern" }, legacy: { id: "legacy" } },
    nations: { nation: { designs: ["modern"], hulls: [{ id: "old-hull", class_id: "legacy", legacy: true }] } },
  } } };
  const resolved = { platforms: new Map([["ship:modern", {}]]) };
  assert.throws(() => validateOpeningShipRecognition(catalog, resolved), /Missing opening ship recognition: test\/nation\/old-hull/);
  resolved.platforms.set("ship:legacy", {});
  assert.equal(validateOpeningShipRecognition(catalog, resolved).legacyClassesOutsideDesigns, 1);
});

test("treaty retirement and carrier conversion retain drawings for the resulting legacy hull configurations", async () => {
  await loadLocalRecognition();
  const campaignId = "campaign_1922", campaign = CATALOG.campaigns[campaignId];
  const state = newGame(CATALOG, "JPN", 23001, campaignId);
  const before = new Map(Object.values(state.nations).flatMap(n => n.groups.map(g => [g.id, g.classId])));
  for (const nation of Object.keys(state.nations)) apply1922Decision(state, campaign, "comply", nation);
  state.day = Date.parse("1923-09-02T00:00:00Z") / 86400000;
  historical1922Decisions(state, campaign, () => {});
  const groups = Object.values(state.nations).flatMap(n => n.groups);
  assert(groups.some(g => g.status === "scrapped"), "Retired treaty hulls remain inspectable");
  assert(groups.some(g => g.classId !== before.get(g.id)), "Treaty carrier conversions changed class");
  assert.equal(state.nations.JPN.groups.find(g => g.id === "h-ijn_kaga").classId, "kaga_cv");
  for (const group of groups) {
    const match = drawingFor(campaignId, group.classId);
    assert(match, `${group.name}/${group.classId} retains recognition after disposition`);
    assert.match(recognitionCard("ship", group.classId, { campaign: campaignId }),
      new RegExp(`data-recognition="${match.entry.id}"`));
  }
});

test("Courageous legacy inspection chooses its campaign configuration and carrier conversion drawing", () => {
  const early = drawingFor("campaign_1922", "courageous_llc");
  const later = drawingFor("in_good_faith_1936", "courageous_llc");
  const conversion = drawingFor("campaign_1922", "courageous_1922_cv");
  assert.notEqual(early.entry.id, later.entry.id);
  assert.equal(later.entry.id, conversion.entry.id);
  assert.match(early.entry.configuration, /before carrier conversion/);
  assert.match(later.entry.configuration, /carrier conversion/);
  assert.equal(CATALOG.campaigns.campaign_1922.classes.courageous_llc.type, "BC");
  assert.equal(CATALOG.campaigns.in_good_faith_1936.classes.courageous_llc.type, "CV");
});
