import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { createHash } from "node:crypto";
import { CATALOG } from "../worker/catalog-loader.mjs";
import { createGameServer } from "../worker/desktop/server.mjs";
import { validateRecognition } from "../tools/check-recognition.mjs";
import { recognitionIndex, loadRecognition, recognitionCard, recognitionExpanded, recognitionThumbnail, recognitionCredits } from "../ui/recognition.mjs";

const drawing = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="180" viewBox="0 0 600 180"><rect width="600" height="180" fill="white"/><path d="M20 120H580L550 140H60Z" fill="black"/></svg>';
function entry(kind = "ship", id = "test-ship") {
  return { id, kind, file: `assets/recognition/ships/${id}.svg`, title: "Test & reference", origin: "original",
    views: ["profile"], configuration: "Test configuration", platforms: [{ id }],
    source: { author: "WNT1922", title: "Original drawing", page: "", url: "https://github.com/site815/WNT1922",
      license: "CC0-1.0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", modifications: "None" },
    sha256: createHash("sha256").update(drawing).digest("hex"), bytes: Buffer.byteLength(drawing),
    review: { status: "accepted", notes: "Checked for the fixture", reviewedAt: "2026-09-13" } };
}
async function fixture(t) {
  const parent = path.resolve("test-output");
  await fs.mkdir(parent, { recursive: true });
  const root = await fs.mkdtemp(path.join(parent, "recognition-test-"));
  t.after(async () => {
    assert.equal(path.dirname(path.resolve(root)), parent);
    assert(path.basename(root).startsWith("recognition-test-"));
    await fs.rm(root, { recursive: true, force: true });
  });
  return root;
}
test("recognition registries load only on request, refresh live files, and keep captions outside images", async () => {
  const calls = [], original = entry(), entries = [original];
  const fetcher = async (url, options) => {
    calls.push(url);
    assert.equal(options.cache, "no-store");
    return { ok: true, json: async () => url.endsWith("index.json")
      ? { format: 1, registries: ["ships/registry.json"] }
      : { format: 1, entries } };
  };
  assert.equal(calls.length, 0);
  await loadRecognition({ refresh: true, fetcher });
  assert.deepEqual(calls, ["/assets/recognition/index.json", "/assets/recognition/ships/registry.json"]);
  const card = recognitionCard("ship", original.id);
  assert.match(card, /src="\/assets\/recognition\/ships\/test-ship.svg"/);
  assert.match(card, /<\/button><figcaption><details class="recognition-info" data-detail-key="recognition-card-test-ship"><summary>Art info<\/summary><div class="recognition-info-body"><strong>Test &amp; reference/);
  assert.doesNotMatch(card, /<details[^>]*\bopen\b/);
  assert.match(card, /https:\/\/creativecommons.org\/publicdomain\/zero\/1.0\//);
  assert.match(card, /source file unchanged/);
  assert.match(recognitionCredits(), /<figcaption><strong>Test &amp; reference/);
  assert.doesNotMatch(recognitionCredits(), /<details/);
  assert.match(recognitionThumbnail("ship", original.id), /recognition-thumbnail/);
  assert.match(recognitionThumbnail("ship", original.id), /src="\/assets\/recognition\/ships\/test-ship.svg"/);
  assert.doesNotMatch(recognitionThumbnail("ship", original.id), /<button|<figcaption|<details/);
  assert.equal(recognitionThumbnail("ship", "custom-ministry-design"), "");
  assert.match(recognitionExpanded(original.id), /recognition-sheet/);
  original.title = "Edited drawing";
  await loadRecognition({ refresh: true, fetcher });
  assert.equal(calls.length, 4);
  assert.match(recognitionCard("ship", original.id), /Edited drawing/);
  const converted = { ...entry("ship", "converted-ship"), title: "Carrier conversion", platforms: [{ id: original.id, campaign: "later" }], display: { monochrome: true } };
  entries.push(converted);
  await loadRecognition({ refresh: true, fetcher });
  assert.match(recognitionCard("ship", original.id, { campaign: "later" }), /Carrier conversion/);
  assert.match(recognitionCard("ship", original.id, { campaign: "early" }), /Edited drawing/);
  assert.match(recognitionExpanded(converted.id), /expanded monochrome/);
  converted.display.crop = { x: 10, y: 20, width: 300, height: 100, imageWidth: 600, imageHeight: 180 };
  await loadRecognition({ refresh: true, fetcher });
  assert.match(recognitionExpanded(converted.id), /recognition-crop/);
  assert.match(recognitionExpanded(converted.id), /width:200%;height:180%/);
  assert.match(recognitionThumbnail("ship", original.id, { campaign: "later" }), /recognition-crop/);
  assert.match(recognitionThumbnail("ship", original.id, { campaign: "later" }), /Carrier conversion/);
  assert.match(recognitionThumbnail("ship", original.id, { campaign: "later" }), /width:200%;height:180%/);
  assert.match(recognitionExpanded(converted.id), /data-detail-key="recognition-expanded-converted-ship"/);
  assert.throws(() => recognitionIndex([{format:1,entries:[{...entry(),display:{crop:{x:100,y:0,width:600,height:180,imageWidth:600,imageHeight:180}}}]}]), /Invalid recognition source panel/);
  assert.match(recognitionCard("ship", "custom-ministry-design"), /custom design/);
  assert.throws(() => recognitionIndex([{ format: 1, entries: [entry(), entry()] }]), /Invalid/);
  assert.throws(() => recognitionIndex([{ format: 1, entries: [{ ...entry(), file: "assets/recognition/../outside.svg" }] }]), /Invalid/);
  assert.throws(() => recognitionIndex([{ format: 1, entries: [{ ...entry(), review: { status: "draft" } }] }]), /unreviewed/);
});

test("recognition validation rejects missing coverage, unreviewed changes, unsafe SVG and undocumented sharing", async t => {
  const root = await fixture(t), art = entry();
  const directory = path.join(root, "assets/recognition");
  await fs.mkdir(path.join(directory, "ships"), { recursive: true });
  await fs.writeFile(path.join(directory, "index.json"), JSON.stringify({ format: 1, registries: ["ships/registry.json"] }));
  const writeRegistry = async () => fs.writeFile(path.join(directory, "ships/registry.json"), JSON.stringify({ format: 1, entries: [art] }));
  await writeRegistry();
  const file = path.join(root, art.file);
  await fs.writeFile(file, drawing);
  const catalog = { campaigns: { test: { classes: { "test-ship": { id: "test-ship" } }, nations: {} } } };
  assert.deepEqual(await validateRecognition({ root, catalog }), { passed: true, entries: 1, files: 1, ships: 1, aircraft: 0 });
  catalog.campaigns.test.classes.missing = { id: "missing" };
  await assert.rejects(validateRecognition({ root, catalog }), /Missing recognition drawings: test:ship:missing/);
  delete catalog.campaigns.test.classes.missing;
  await fs.writeFile(file, drawing.replace("black", "green"));
  await assert.rejects(validateRecognition({ root, catalog }), /drawing changed without review/);
  await fs.writeFile(file, drawing);
  art.platforms.push({ id: "missing" });
  await writeRegistry();
  await assert.rejects(validateRecognition({ root, catalog }), /configuration note/);
  art.platforms.pop();
  const unsafe = drawing.replace("</svg>", '<script>alert(1)</script></svg>');
  art.sha256 = createHash("sha256").update(unsafe).digest("hex");
  art.bytes = Buffer.byteLength(unsafe);
  await fs.writeFile(file, unsafe);
  await writeRegistry();
  await assert.rejects(validateRecognition({ root, catalog }), /local drawing geometry/);
});

test("every authored ship and aircraft in both campaigns resolves to accepted local recognition art", async () => {
  const result = await validateRecognition({ catalog: CATALOG });
  assert(result.ships > 100 && result.aircraft > 100);
});

test("portable recognition override serves edits immediately while confining paths and leaving game source bundled", async t => {
  const root = await fixture(t), bundled = path.join(root, "bundled"), live = path.join(root, "live"), outside = path.join(root, "outside");
  await Promise.all([fs.mkdir(path.join(bundled, "ui"), { recursive: true }), fs.mkdir(path.join(bundled, "assets/recognition"), { recursive: true }), fs.mkdir(live), fs.mkdir(outside)]);
  await fs.writeFile(path.join(bundled, "ui/index.html"), "Bundled game");
  await fs.writeFile(path.join(bundled, "assets/recognition/index.json"), '{"bundled":true}');
  await fs.writeFile(path.join(live, "index.json"), '{"live":1}');
  await fs.writeFile(path.join(live, "drawing.svg"), drawing);
  await fs.writeFile(path.join(live, "drawing.png"), Buffer.from([137,80,78,71]));
  await fs.writeFile(path.join(live, "drawing.jpg"), Buffer.from([255,216,255,217]));
  await fs.writeFile(path.join(live, "secret.mjs"), "Never serve override code");
  await fs.writeFile(path.join(outside, "secret.json"), '{"secret":true}');
  await fs.symlink(outside, path.join(live, "escape"), "junction");
  const start = async recognitionDirectory => {
    const server = await createGameServer({ publicDirectory: bundled, recognitionDirectory });
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
    return `http://127.0.0.1:${server.address().port}`;
  };
  const origin = await start(live), standalone = await start(null);
  assert.equal(await (await fetch(origin)).text(), "Bundled game");
  assert.deepEqual(await (await fetch(standalone + "/assets/recognition/index.json")).json(), { bundled: true });
  assert.deepEqual(await (await fetch(origin + "/assets/recognition/index.json")).json(), { live: 1 });
  await fs.writeFile(path.join(live, "index.json"), '{"live":2}');
  const edited = await fetch(origin + "/assets/recognition/index.json");
  assert.equal(edited.headers.get("cache-control"), "no-store");
  assert.deepEqual(await edited.json(), { live: 2 });
  for (const [extension, mime] of [["svg", "image/svg+xml"], ["png", "image/png"], ["jpg", "image/jpeg"]]) {
    const response = await fetch(origin + "/assets/recognition/drawing." + extension);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), mime);
    if (extension === "svg") assert.match(response.headers.get("content-security-policy"), /sandbox; default-src 'none'/);
  }
  for (const file of ["escape/secret.json", "secret.mjs", "missing.svg", "%5c..%5coutside%5csecret.json", "%252e%252e/outside/secret.json"])
    assert.equal((await fetch(origin + "/assets/recognition/" + file)).status, 404, file);
  const rawStatus = url => new Promise((resolve, reject) => {
    http.get(origin + url, response => { response.resume(); resolve(response.statusCode); }).on("error", reject);
  });
  assert.equal(await rawStatus("/assets/recognition/%2e%2e/ui/index.html"), 404);
  assert.equal(await rawStatus("/assets/recognition/%E0%A4%A"), 400);
});
