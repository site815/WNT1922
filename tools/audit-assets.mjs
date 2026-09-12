import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { TRACKS } from "../ui/music.mjs";
const manifest = JSON.parse(await fs.readFile("assets/manifest.json"));
const hash = (b) => createHash("sha256").update(b).digest("hex");
const paths = new Set();
for (const a of manifest.assets) {
  assert(!paths.has(a.path), "Duplicate asset " + a.path);
  paths.add(a.path);
  const bytes = await fs.readFile(a.path);
  if (!a.editable) {
    assert.equal(hash(bytes), a.sha256, "Unreviewed change: " + a.path);
    assert.equal(bytes.length, a.bytes);
  }
  assert(
    ["Public domain", "CC-BY-4.0"].includes(a.license),
    "Unsupported asset license",
  );
  assert.match(a.source, /^https:\/\//);
  assert.match(a.licenseUrl, /^https:\/\//);
}
const music = manifest.assets.filter((a) => a.path.endsWith(".mp3"));
assert.deepEqual(
  music.map((a) => path.basename(a.path)).sort(),
  TRACKS.map((t) => t.file).sort(),
);
for (const t of TRACKS) {
  const a = music.find((a) => a.isrc === t.isrc);
  assert.equal(a?.title, t.title);
}
const notice = await fs.readFile(
  "assets/licenses/third-party-notices.html",
  "utf8",
);
for (const a of music) {
  assert(notice.includes(a.isrc), "Missing music attribution " + a.title);
  assert(notice.includes(a.source));
}
assert(
  notice.includes("10.1111/joes.12618") &&
    notice.includes("Feinstein") &&
    notice.includes("Moorsteen"),
  "Missing GDP country attribution",
);
const sourceHash = manifest.assets.find((a) =>
  a.path.endsWith("natural-earth-map-units.zip"),
).sha256;
const runtimeSources = JSON.parse(
  await fs.readFile("worker/desktop/source-lock.json"),
);
for (const archive of runtimeSources.archives)
  assert.equal(
    hash(await fs.readFile(archive.path)),
    archive.sha256,
    "Unreviewed runtime source " + archive.name,
  );
for (const f of ["geometry.json"]) {
  const map = JSON.parse(await fs.readFile("assets/maps/" + f));
  assert.equal(map.license, "Public domain");
  assert.equal(map.sourceSha256, sourceHash);
  assert.match(map.source, /Natural Earth/);
  assert(Object.keys(map.geometry).length > 200);
}
const walk = async (dir) =>
  (
    await Promise.all(
      (await fs.readdir(dir, { withFileTypes: true })).map(async (entry) =>
        entry.isDirectory()
          ? walk(dir + "/" + entry.name)
          : [dir + "/" + entry.name],
      ),
    )
  ).flat();
for (const f of [
  ...(await walk("assets/music")),
  ...(await walk("assets/maps")),
])
  if (!/\.(json|md)$/.test(f)) assert(paths.has(f), "Unreviewed asset " + f);
for (const f of await walk("ui")) {
  const source = await fs.readFile(f, "utf8");
  assert(
    !/@import\s+url|@font-face|(?:src|href)=["']https?:\/\/[^"']+\.(?:js|css|woff)/.test(
      source,
    ),
    "External runtime asset: " + f,
  );
  assert(
    !/(?:import|export)\s+[^;\n]*?\sfrom\s*["'](?:https?:|[^.\/])/.test(source),
    "External module needs review: " + f,
  );
}
const result = {
  checkedAt: new Date().toISOString(),
  passed: true,
  assetCount: manifest.assets.length,
  musicTracks: music.length,
  mapLicense: "Public domain",
  runtime: JSON.parse(await fs.readFile("worker/desktop/runtime-lock.json"))
    .version,
};
await fs.mkdir("test-output", { recursive: true });
await fs.writeFile(
  "test-output/asset-audit.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result));
