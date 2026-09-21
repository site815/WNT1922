import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { recognitionIndex } from "../ui/recognition.mjs";

function jpegDimensions(bytes) {
  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset++] !== 255) return null;
    while (bytes[offset] === 255) offset++;
    const marker = bytes[offset++];
    if (marker === 217 || marker === 218) return null;
    if (marker === 1 || marker >= 208 && marker <= 215) continue;
    const length = bytes.readUInt16BE(offset);
    if (length < 2 || offset + length > bytes.length) return null;
    if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))
      return length >= 8 ? { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) } : null;
    offset += length;
  }
  return null;
}

export function authoredPlatforms(catalog) {
  const platforms = new Map();
  for (const [id, campaign] of Object.entries(catalog.campaigns)) {
    for (const ship of Object.values(campaign.classes)) platforms.set(id + ":ship:" + ship.id, ship);
    for (const nation of Object.values(campaign.nations))
      for (const aircraft of [...(nation.aircraft || []), ...(nation.armyAircraft || [])])
        platforms.set(id + ":aircraft:" + aircraft.id, aircraft);
  }
  return platforms;
}
export async function validateRecognition({ root = process.cwd(), catalog } = {}) {
  const recognitionRoot = await fs.realpath(path.join(root, "assets/recognition"));
  const read = async file => {
    assert(typeof file === "string" && /^[\w/-]+\.(?:json|png|jpe?g|svg)$/.test(file), "Invalid recognition path: " + file);
    const absolute = await fs.realpath(path.join(recognitionRoot, file));
    const relative = path.relative(recognitionRoot, absolute);
    assert(relative && !relative.startsWith("..") && !path.isAbsolute(relative), "Recognition file escapes asset folder: " + file);
    return fs.readFile(absolute);
  };
  const index = JSON.parse(await read("index.json"));
  assert.equal(index.format, 1);
  assert(Array.isArray(index.registries) && index.registries.length > 0, "Missing recognition registries");
  assert.equal(new Set(index.registries).size, index.registries.length, "Duplicate recognition registry");
  const registries = await Promise.all(index.registries.map(async file => {
    assert(file.endsWith(".json"), "Registry must be JSON");
    return JSON.parse(await read(file));
  }));
  const resolved = recognitionIndex(registries);
  const files = new Set(), panels = new Set();
  for (const entry of resolved.entries.values()) {
    const panel = entry.file + ":" + JSON.stringify(entry.display?.crop || null);
    assert(!panels.has(panel), "Use explicit platform mappings to share one artwork panel: " + entry.file);
    panels.add(panel);
    files.add(entry.file);
    assert(["historical", "original"].includes(entry.origin), entry.id + " origin");
    assert(entry.title?.trim() && entry.configuration?.trim(), entry.id + " title / configuration");
    assert(Array.isArray(entry.views) && entry.views.length && entry.views.every(view => ["profile", "plan", "front"].includes(view)), entry.id + " views");
    assert.equal(new Set(entry.views).size, entry.views.length, entry.id + " duplicate views");
    assert(entry.platforms.length > 0, entry.id + " has no platform mapping");
    if (entry.platforms.length > 1)
      assert(entry.platforms.every(platform => platform.note?.trim()), entry.id + " shared reference needs a configuration note for every platform");
    assert(entry.review.notes?.length && Number.isFinite(Date.parse(entry.review.reviewedAt)), entry.id + " review evidence / date");
    for (const field of ["author", "title", "license"])
      assert(typeof entry.source?.[field] === "string" && entry.source[field].trim(), entry.id + " source " + field);
    for (const field of ["url", "licenseUrl"])
      assert(/^https:\/\//.test(entry.source?.[field] || ""), entry.id + " source " + field);
    assert(typeof entry.source.modifications === "string", entry.id + " modifications");
    const bytes = await read(entry.file.slice("assets/recognition/".length));
    const dimensions = entry.file.endsWith(".png") && bytes.length >= 24
      ? { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
      : /\.jpe?g$/.test(entry.file) ? jpegDimensions(bytes) : null;
    const crop = entry.display?.crop;
    if (crop) {
      for (const field of ["x", "y", "width", "height", "imageWidth", "imageHeight"])
        assert(Number.isFinite(crop[field]) && crop[field] >= 0, entry.id + " invalid crop " + field);
      assert(crop.width > 0 && crop.height > 0 && crop.x + crop.width <= crop.imageWidth && crop.y + crop.height <= crop.imageHeight, entry.id + " crop outside original image");
      if (dimensions) {
        assert.equal(crop.imageWidth, dimensions.width, entry.id + " crop source width");
        assert.equal(crop.imageHeight, dimensions.height, entry.id + " crop source height");
      }
    }
    assert.equal(bytes.length, entry.bytes, entry.id + " byte count changed");
    assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.sha256, entry.id + " drawing changed without review");
    if (entry.file.endsWith(".svg")) {
      const svg = bytes.toString("utf8");
      assert(/<svg\b[^>]*\bviewBox=["'][\d.\s-]+["']/.test(svg), entry.id + " SVG needs a viewBox");
      assert(!/<(?:script|foreignObject|iframe|image)\b|\bon\w+\s*=|\bsrc\s*=|<!ENTITY/i.test(svg), entry.id + " SVG must contain only local drawing geometry");
      for (const href of svg.matchAll(/(?:xlink:)?href\s*=\s*["']([^"']*)["']/gi))
        assert(/^#[\w.-]+$/.test(href[1]), entry.id + " SVG reference must stay within the drawing");
      for (const reference of svg.matchAll(/url\s*\(\s*([^)]*)\)/gi))
        assert(/^["']?#[\w.-]+["']?$/.test(reference[1]), entry.id + " SVG resource must stay within the drawing");
    } else if (entry.file.endsWith(".png")) {
      assert(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), entry.id + " invalid PNG");
      assert(bytes.readUInt32BE(16) >= 256 && bytes.readUInt32BE(20) >= 64, entry.id + " PNG resolution");
    } else {
      assert(bytes[0] === 255 && bytes[1] === 216 && bytes.at(-2) === 255 && bytes.at(-1) === 217, entry.id + " invalid JPEG");
      assert(dimensions?.width > 0 && dimensions?.height > 0, entry.id + " unreadable JPEG dimensions");
    }
  }
  const expected = authoredPlatforms(catalog);
  const match = key => resolved.platforms.get(key) || resolved.platforms.get(key.slice(key.indexOf(":") + 1));
  const missing = [...expected.keys()].filter(key => !match(key));
  const generic = new Set([...expected.keys()].map(key => key.slice(key.indexOf(":") + 1)));
  const unknown = [...resolved.platforms.keys()].filter(key => !expected.has(key) && !generic.has(key));
  assert.equal(missing.length, 0, "Missing recognition drawings: " + missing.join(", "));
  assert.equal(unknown.length, 0, "Unknown recognition platforms: " + unknown.join(", "));
  const configurations = new Map();
  for (const [key, platform] of expected) {
    if (!key.includes(":ship:")) continue;
    const genericKey = key.slice(key.indexOf(":") + 1);
    const signature = JSON.stringify([platform.type, platform.barrels, platform.caliber, platform.air]);
    const prior = configurations.get(genericKey) || [];
    assert(!prior.some(other => other.signature !== signature && other.entry === match(key).entry.id),
      "Different ship configurations need campaign-qualified drawings: " + genericKey);
    prior.push({ signature, entry: match(key).entry.id });
    configurations.set(genericKey, prior);
  }
  return { passed: true, entries: resolved.entries.size, files: files.size,
    ships: [...generic].filter(key => key.startsWith("ship:")).length,
    aircraft: [...generic].filter(key => key.startsWith("aircraft:")).length };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { CATALOG } = await import("../worker/catalog-loader.mjs");
  const result = await validateRecognition({ catalog: CATALOG });
  await fs.mkdir("test-output", { recursive: true });
  await fs.writeFile("test-output/recognition-check.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
}
