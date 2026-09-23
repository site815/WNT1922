import { CATALOG } from "../worker/catalog-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { createGameServer } from "../worker/desktop/server.mjs";
import { newGame } from "../mechanics/engine.mjs";
import { exportSave } from "../mechanics/state-io.mjs";
import { GAME_VERSION } from "../mechanics/version.mjs";
const gameRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const publicDirectory = process.env.WNT_TEST_PUBLIC || path.resolve(".");
const content = structuredClone(CATALOG);

async function testServer(t) {
  const fixtures = path.join(gameRoot, "test-output");
  await fs.mkdir(fixtures, { recursive: true });
  const dir = await fs.mkdtemp(path.join(fixtures, "save-test-"));
  const server = await createGameServer({
    port: 0,
    saveDir: dir,
    publicDirectory,
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const origin = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    if (
      path.dirname(path.resolve(dir)) !== path.resolve(fixtures) ||
      !path.basename(dir).startsWith("save-test-")
    )
      throw new Error("Unexpected cleanup target");
    await fs.rm(dir, { recursive: true, force: true });
  });
  return { dir, server, origin };
}

test("local server serves the game, saves atomically, retains a backup and rejects bad writes", async (t) => {
  const { dir, origin } = await testServer(t);
  for (const file of [
    "",
    "ui/app.mjs",
    "ui/vendor/three/three.module.js",
    "ui/vendor/three/three.core.js",
    "ui/styles.css",
    "mechanics/engine.mjs",
    "worker/simulation-worker.mjs",
    "worker/catalog-loader.mjs",
    "catalog/manifest.md",
    "catalog/common/rules/balance.md",
    "catalog/1922/nations/USA.md",
    "assets/maps/geometry.json",
  ])
    assert.equal((await fetch(origin + "/" + file)).status, 200, file);
  assert.equal(
    (await (await fetch(origin + "/health")).json()).build,
    GAME_VERSION,
  );
  for (const file of ['three.module.js','three.core.js']) {
    const script = await fetch(origin + '/ui/vendor/three/' + file, {method:'HEAD'});
    assert.equal(script.headers.get('content-type'), 'text/javascript; charset=utf-8');
    const policy = script.headers.get('content-security-policy');
    assert(policy.includes("script-src 'self'") && !policy.includes('unsafe-eval') && !policy.includes('https:'), 'Bundled graphics preserve the local-only script policy');
  }
  for (const file of [
    "long-road-ahead.mp3",
    "opportunity-walks.mp3",
    "the-entertainer.mp3",
  ]) {
    const audio = await fetch(origin + "/assets/music/" + file, {
      method: "HEAD",
    });
    assert.equal(audio.status, 200);
    assert.equal(audio.headers.get("content-type"), "audio/mpeg");
  }
  for (const file of [
    "content.json",
    "app.mjs",
    "worker/desktop/main.mjs",
    "ui/app.js",
    "ui/vendor/three/other.js",
    "ui/vendor/other/three.module.js",
    "catalog/%2e%2e/%2e%2e/.git/config",
    ".git/config",
  ])
    assert.equal((await fetch(origin + "/" + file)).status, 404);
  assert.equal((await fetch(origin + "/README.md")).status, 404);
  assert.equal((await fetch(origin + "/api/save")).status, 404);
  const post = (body) =>
    fetch(origin + "/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  assert.equal(
    (await post(exportSave(newGame(content, "JPN", 1)))).status,
    200,
  );
  assert.equal(
    (await post(exportSave(newGame(content, "USA", 2)))).status,
    200,
  );
  assert.equal(
    (await (await fetch(origin + "/api/save")).json()).player,
    "USA",
  );
  assert.equal(
    (await (await fetch(origin + "/api/save?backup=1")).json()).player,
    "JPN",
  );
  assert.equal((await post("{bad json")).status, 400);
  assert.equal(
    (
      await post(
        JSON.stringify({ version: 1, player: "JPN", day: -12419, nations: {} }),
      )
    ).status,
    400,
  );
  assert.equal(
    (await (await fetch(origin + "/api/save")).json()).player,
    "USA",
  );
  assert.equal(
    (
      await fetch(origin + "/api/save", {
        method: "POST",
        headers: {
          Origin: "https://example.invalid",
          "Content-Type": "application/json",
        },
        body: exportSave(newGame(content)),
      })
    ).status,
    403,
  );
  await fs.writeFile(path.join(dir, "campaign.json"), "{interrupted");
  assert.equal((await fetch(origin + "/api/save")).status, 409);
  assert.equal(
    (await (await fetch(origin + "/api/save?backup=1")).json()).player,
    "JPN",
  );
  assert.equal(
    (await post(exportSave(newGame(content, "GBR", 3)))).status,
    200,
  );
  assert.equal(
    (await (await fetch(origin + "/api/save?backup=1")).json()).player,
    "JPN",
  );
});

test("fragmented UTF-8 ship names survive save and backup, and oversized bodies are limited by bytes", async t => {
  const { dir, server, origin } = await testServer(t);
  const state = newGame(content, "JPN", 35);
  let previousName;
  for (const character of ["é", "摩", "🚢"]) {
    const name = "Recognition test " + character + " — 摩耶";
    state.nations.JPN.groups[0].name = name;
    const bytes = Buffer.from(exportSave(state));
    const split = bytes.indexOf(Buffer.from(character)) + 1;
    assert(split > 1);
    // Wait until the server receives the leading UTF-8 byte before sending
    // its continuation bytes, so this exercises an actual stream boundary.
    const firstChunk = new Promise(resolve => server.once("request", request => request.once("data", resolve)));
    let request;
    const response = new Promise((resolve, reject) => {
      request = http.request(origin + "/api/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
      }, result => {
        result.resume();
        result.on("end", () => resolve(result.statusCode));
      });
      request.on("error", reject);
      request.setNoDelay(true);
      request.write(bytes.subarray(0, split));
    });
    await firstChunk;
    request.end(bytes.subarray(split));
    assert.equal(await response, 200);
    const saved = await (await fetch(origin + "/api/save")).json();
    assert.equal(saved.nations.JPN.groups[0].name, name);
    if (previousName) {
      const backup = await (await fetch(origin + "/api/save?backup=1")).json();
      assert.equal(backup.nations.JPN.groups[0].name, previousName);
    }
    previousName = name;
  }
  const before = await fs.readFile(path.join(dir, "campaign.json"));
  const oversized = JSON.stringify({ padding: "é".repeat(4_000_000) });
  assert(oversized.length < 8_000_000 && Buffer.byteLength(oversized) > 8_000_000);
  assert.equal((await fetch(origin + "/api/save", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: oversized,
  })).status, 413);
  assert.deepEqual(await fs.readFile(path.join(dir, "campaign.json")), before);
});
