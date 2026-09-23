import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { TRACKS, SOUNDTRACK, musicCredits, playlistFor } from "../ui/music.mjs";
import { CATALOG } from "../worker/catalog-loader.mjs";
import { validateRecognition } from "./check-recognition.mjs";
import { validateVoxels } from "./check-voxels.mjs";
const recognition = await validateRecognition({ catalog: CATALOG });
const voxels = await validateVoxels({ catalog: CATALOG });
const manifest = JSON.parse(await fs.readFile("assets/manifest.json"));
manifest.assets.push(...TRACKS.map(t => ({...t, path:"assets/music/" + t.file})));
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
for (const a of manifest.originalAssets.recognitionStudies || []) {
  assert(!paths.has(a.path), 'Duplicate original study ' + a.path);
  assert(a.path.startsWith('assets/recognition/studies/') && a.path.endsWith('.png'));
  const bytes = await fs.readFile(a.path);
  assert.equal(hash(bytes), a.sha256, 'Changed original study: ' + a.path);
  assert.equal(bytes.length, a.bytes);
  assert.equal(a.status, 'Draft study; not integrated into the game UI');
  assert((await fs.readFile(a.notes,'utf8')).includes(path.basename(a.path)));
  paths.add(a.path);
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
const graphics = JSON.parse(await fs.readFile('worker/desktop/graphics-lock.json'));
assert.equal(graphics.name, 'three.js');
assert.equal(graphics.revision, '180');
assert.equal(graphics.version, '0.180.0');
assert.equal(graphics.license, 'MIT');
assert.equal(graphics.modified, false);
assert.equal(graphics.release, 'https://github.com/mrdoob/three.js/releases/tag/r180');
assert.deepEqual(graphics.files.map(file => file.path).sort(), ['ui/vendor/three/LICENSE','ui/vendor/three/three.core.js','ui/vendor/three/three.module.js']);
const verifiedGraphics = new Set();
for (const file of graphics.files) {
  const bytes = await fs.readFile(file.path);
  assert.equal(hash(bytes), file.sha256, 'Changed vendored graphics source: ' + file.path);
  assert.equal(bytes.length, file.bytes, 'Changed vendored graphics size: ' + file.path);
  const sourcePath = file.path.endsWith('/LICENSE') ? 'LICENSE' : 'build/' + path.basename(file.path);
  assert.equal(file.url, 'https://raw.githubusercontent.com/mrdoob/three.js/r180/' + sourcePath);
  verifiedGraphics.add(file.path);
}
assert.deepEqual((await fs.readdir('ui/vendor/three')).sort(), ['LICENSE','three.core.js','three.module.js']);
assert(notice.includes(graphics.release) && notice.includes(graphics.licenseUrl), 'Missing exact graphics source and license attribution');
const graphicsLicense = await fs.readFile('ui/vendor/three/LICENSE', 'utf8');
assert(notice.replaceAll('\r\n','\n').includes(graphicsLicense.replaceAll('\r\n','\n').trim()), 'The bundled graphics MIT notice must be included verbatim');
assert(notice.includes('/ui/license-credits.mjs'), 'Credits must read the live music catalog');
const credits = musicCredits();
for (const a of music) {
  assert(credits.includes(a.isrc), "Missing music attribution " + a.title);
  assert(credits.includes(a.source));
}
for (const id of ['GBR','USA','JPN','FRA','ITA','DEU','SOV'])
  for (const war of [false,true]) {
    const list=playlistFor(id,war);
    assert(list.length>=5 && list.every(Boolean), 'Incomplete soundtrack: '+id);
  }
assert.match(SOUNDTRACK.licenseSource, /^https:\/\/incompetech\.com\//);
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
  // Upstream JSDoc includes bare-import examples. Only byte-verified upstream
  // files may skip this simple source regex; the actual module imports are local.
  if (verifiedGraphics.has(f)) continue;
  assert(
    !/(?:import|export)\s+[^;\n]*?\sfrom\s*["'](?:https?:|[^.\/])/.test(source),
    "External module needs review: " + f,
  );
}
const result = {
  checkedAt: new Date().toISOString(),
  passed: true,
  recognition,
  voxels,
  graphics: {name:graphics.name,version:graphics.version,files:graphics.files.length,license:graphics.license},
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
