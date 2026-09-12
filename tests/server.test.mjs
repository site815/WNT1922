import { CATALOG } from "../worker/catalog-loader.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
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

test("local server serves the game, saves atomically, retains a backup and rejects bad writes", async (t) => {
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
  for (const file of [
    "",
    "ui/app.mjs",
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
