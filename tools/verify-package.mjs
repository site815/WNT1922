import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { projectFiles, listFiles } from "./project-files.mjs";
import { GAME_VERSION } from "../mechanics/version.mjs";
const hash = (b) => createHash("sha256").update(b).digest("hex");
export async function verifyPackage(directory, { writeManifest = false } = {}) {
  const root = path.resolve(directory),
    app = path.join(root, "resources/app"),
    expected = await projectFiles();
  for (const name of [
    "WNT1922.exe",
    "LICENSE",
    "LICENSES.chromium.html",
    "ffmpeg.dll",
    "READ-ME.txt",
  ])
    assert((await fs.stat(path.join(root, name))).size > 0, "Missing " + name);
  assert.deepEqual(
    await listFiles(app),
    expected,
    "Unexpected or missing application files.",
  );
  for (const name of expected)
    assert.equal(
      hash(await fs.readFile(path.join(app, name))),
      hash(await fs.readFile(name)),
      "Stale packaged source: " + name,
    );
  const files = [];
  for (const name of (await listFiles(root)).filter(
    (n) => n !== "package-manifest.json",
  )) {
    const bytes = await fs.readFile(path.join(root, name));
    files.push({ path: name, bytes: bytes.length, sha256: hash(bytes) });
  }
  const result = { version: GAME_VERSION, platform: "win32-x64", files };
  if (writeManifest)
    await fs.writeFile(
      path.join(root, "package-manifest.json"),
      JSON.stringify(result, null, 2) + "\n",
    );
  else
    assert.deepEqual(
      result,
      JSON.parse(await fs.readFile(path.join(root, "package-manifest.json"))),
      "Package changed after verification.",
    );
  return {
    version: GAME_VERSION,
    files: files.length,
    sourceFiles: expected.length,
    passed: true,
  };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  console.log(
    JSON.stringify(
      await verifyPackage(process.argv[2], {
        writeManifest: process.argv.includes("--write-manifest"),
      }),
    ),
  );
