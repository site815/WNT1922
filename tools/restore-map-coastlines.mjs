import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const same = (a, b) => a[0] === b[0] && a[1] === b[1];
const pointKey = p => p.map(n => n.toFixed(6)).join(',');
const bucketKey = (x, y) => `${x},${y}`;
const wrap = n => ((n + 180) % 360 + 360) % 360 - 180;
const rounded = p => p.map(n => Number(n.toFixed(6)));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export const geometryRings = g => g.type === 'Polygon' ? g.coordinates : g.coordinates.flat();

// Read the pinned, public-domain source locally; no GIS dependency or download.
export function readNaturalEarthRings(bytes) {
  let eocd = bytes.length - 22;
  while (eocd >= 0 && bytes.readUInt32LE(eocd) !== 0x06054b50) --eocd;
  if (eocd < 0) throw new Error('Missing ZIP directory');
  let cursor = bytes.readUInt32LE(eocd + 16), shp;
  for (let n = 0; n < bytes.readUInt16LE(eocd + 10); ++n) {
    const nameSize = bytes.readUInt16LE(cursor + 28), extraSize = bytes.readUInt16LE(cursor + 30), commentSize = bytes.readUInt16LE(cursor + 32);
    const name = bytes.toString('utf8', cursor + 46, cursor + 46 + nameSize);
    if (name.endsWith('.shp')) {
      const offset = bytes.readUInt32LE(cursor + 42);
      const start = offset + 30 + bytes.readUInt16LE(offset + 26) + bytes.readUInt16LE(offset + 28);
      const compressed = bytes.subarray(start, start + bytes.readUInt32LE(cursor + 20));
      shp = bytes.readUInt16LE(cursor + 10) === 8 ? zlib.inflateRawSync(compressed) : compressed;
    }
    cursor += 46 + nameSize + extraSize + commentSize;
  }
  if (!shp) throw new Error('Missing Natural Earth polygon source');
  const rings = [];
  for (let cursor = 100, record = 0; cursor < shp.length; ++record) {
    const size = shp.readUInt32BE(cursor + 4) * 2, body = shp.subarray(cursor + 8, cursor + 8 + size);
    cursor += 8 + size;
    if (body.readInt32LE(0) !== 5) continue;
    const parts = body.readInt32LE(36), count = body.readInt32LE(40), start = 44 + parts * 4;
    for (let part = 0; part < parts; ++part) {
      const first = body.readInt32LE(44 + part * 4), last = part + 1 < parts ? body.readInt32LE(48 + part * 4) : count;
      const points = [];
      for (let i = first; i < last; ++i) points.push([body.readDoubleLE(start + i * 16), body.readDoubleLE(start + i * 16 + 8)]);
      if (points.length > 1 && same(points[0], points.at(-1))) points.pop();
      rings.push({record, points});
    }
  }
  return rings;
}

export function coastlineIndex(rings) {
  const buckets = new Map(), owners = new Map();
  for (const [ring, source] of rings.entries()) for (const [index, point] of source.points.entries()) {
    const key = bucketKey(Math.round(point[0] * 1000), Math.round(point[1] * 1000));
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push({ring, index, point});
    const vertexKey = pointKey(point);
    if (!owners.has(vertexKey)) owners.set(vertexKey, new Set());
    owners.get(vertexKey).add(source.record);
  }
  function matches(point) {
    const result = [], x = Math.round(point[0] * 1000), y = Math.round(point[1] * 1000);
    for (let dx = -1; dx <= 1; ++dx) for (let dy = -1; dy <= 1; ++dy) {
      for (const candidate of buckets.get(bucketKey(x + dx, y + dy)) || []) {
        if (Math.abs(candidate.point[0] - point[0]) <= .0005001 && Math.abs(candidate.point[1] - point[1]) <= .0005001) result.push(candidate);
      }
    }
    // Existing six-decimal restored vertices must resolve to their own source
    // vertex, even where a neighbouring source vertex is under 100 m away.
    const exact = result.filter(c => Math.abs(c.point[0] - point[0]) < .00000051 && Math.abs(c.point[1] - point[1]) < .00000051);
    const preferred = exact.length ? exact : result;
    // Three-decimal legacy endpoints can coincide with two nearby source
    // vertices. Do not guess which one an authored edge intended to retain.
    return new Set(preferred.map(c => pointKey(c.point))).size === 1 ? preferred : [];
  }
  return {rings, owners, matches};
}

export function sourceCoastBetween(a, b, index, {sharedBorders = false} = {}) {
  const ends = index.matches(b), candidates = [];
  const dx = wrap(b[0] - a[0]), dy = b[1] - a[1], length2 = dx * dx + dy * dy;
  if (length2 < 1e-14 || length2 > 25) return null;
  for (const first of index.matches(a)) for (const last of ends) {
    if (first.ring !== last.ring) continue;
    const points = index.rings[first.ring].points, count = points.length;
    const separation = Math.abs(last.index - first.index);
    // An adjacent source pair is already complete. Never take the reverse
    // route around a small island and duplicate the rest of its perimeter.
    if (separation <= 1 || separation === count - 1) return null;
    for (const direction of [-1, 1]) {
      const steps = ((last.index - first.index) * direction + count) % count;
      if (steps < 2 || steps > 128) continue;
      const restored = []; let length = 0, previous = a, valid = true;
      if (sharedBorders && (index.owners.get(pointKey(first.point)).size < 2 || index.owners.get(pointKey(last.point)).size < 2)) continue;
      for (let step = 1; step <= steps; ++step) {
        const p = step === steps ? b : points[(first.index + step * direction + count) % count];
        const px = wrap(p[0] - a[0]), py = p[1] - a[1];
        const t = Math.max(0, Math.min(1, (px * dx + py * dy) / length2));
        // A source-backed chain follows its simplified chord within 0.06
        // degrees. Coastal and shared-border passes remain separate so a
        // candidate cannot jump between sea coast and an authored land cut.
        if (step < steps) {
          const owners = index.owners.get(pointKey(p));
          // A retained simplified edge can span a three-country junction.
          // Every intermediate point must remain on the shared boundary
          // network, but its neighbouring country may change at that junction.
          if ((sharedBorders ? owners.size < 2 : owners.size > 1) || Math.hypot(px - t * dx, py - t * dy) > .06) { valid = false; break; }
        }
        length += Math.hypot(wrap(p[0] - previous[0]), p[1] - previous[1]); previous = p;
        if (step < steps) {
          // Shared edges must reproduce the retained legacy endpoints on BOTH
          // units. Six-decimal inserts beside three-decimal endpoints create
          // tiny mismatches where one unit kept a point the other simplified.
          const point = sharedBorders ? p.map(n => Number(n.toFixed(3))) : rounded(p);
          if (!same(point, restored.at(-1) || a) && !same(point, b)) restored.push(point);
        }
      }
      if (valid && length <= Math.sqrt(length2) * 3) candidates.push({restored, length});
    }
  }
  candidates.sort((a, b) => a.length - b.length || a.restored.length - b.restored.length);
  return candidates[0]?.restored || null;
}

export function ringCrossings(ring) {
  const unwrapped = [];
  for (const p of ring) unwrapped.push([unwrapped.length ? unwrapped.at(-1)[0] + wrap(p[0] - unwrapped.at(-1)[0]) : p[0], p[1]]);
  const grid = new Map(), cross = (a,b,p) => (b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
  let crossings = 0;
  for (let i = 0; i + 1 < unwrapped.length; ++i) {
    const a = unwrapped[i], b = unwrapped[i+1], keys = [], seen = new Set();
    for (let x = Math.floor(Math.min(a[0],b[0])); x <= Math.floor(Math.max(a[0],b[0])); ++x) {
      for (let y = Math.floor(Math.min(a[1],b[1])); y <= Math.floor(Math.max(a[1],b[1])); ++y) keys.push(bucketKey(x,y));
    }
    for (const key of keys) for (const j of grid.get(key) || []) {
      if (seen.has(j) || i-j <= 1 || (j === 0 && i === unwrapped.length-2)) continue;
      seen.add(j); const c = unwrapped[j], d = unwrapped[j+1];
      if (cross(a,b,c)*cross(a,b,d) < -1e-20 && cross(c,d,a)*cross(c,d,b) < -1e-20) ++crossings;
    }
    for (const key of keys) { if (!grid.has(key)) grid.set(key, []); grid.get(key).push(i); }
  }
  return crossings;
}

export function restoreCoastlines(document, index, options = {}) {
  const result = structuredClone(document), stats = {features:0, rings:0, beforePoints:0, afterPoints:0, restoredSegments:0, insertedPoints:0, ringsPreservedForTopology:0};
  for (const geometry of Object.values(result.geometry)) {
    ++stats.features;
    for (const ring of geometryRings(geometry)) {
      ++stats.rings; stats.beforePoints += ring.length;
      const restored = []; let segments = 0;
      for (let i = 0; i < ring.length; ++i) {
        restored.push(ring[i]);
        if (i + 1 === ring.length) continue;
        const between = sourceCoastBetween(ring[i], ring[i + 1], index, options);
        if (between?.length) { restored.push(...between); ++segments; }
      }
      // Rounded legacy endpoints occasionally cross an adjacent detailed
      // shore on very small islands. Keep that ring intact instead of asking
      // triangulation to repair or change its topology.
      if (segments && ringCrossings(restored) > ringCrossings(ring)) ++stats.ringsPreservedForTopology;
      else { stats.restoredSegments += segments; stats.insertedPoints += restored.length-ring.length; ring.splice(0, ring.length, ...restored); }
      stats.afterPoints += ring.length;
    }
  }
  return {document:result, stats};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const geometryPath = path.join(root, 'assets/maps/geometry.json'), sourcePath = path.join(root, 'assets/maps/natural-earth-map-units.zip');
  const source = fs.readFileSync(sourcePath), before = fs.readFileSync(geometryPath), document = JSON.parse(before);
  if (document.sourceSha256 !== hash(source)) throw new Error('Natural Earth source checksum does not match geometry provenance');
  const sharedBorders = process.argv.includes('--shared-borders');
  const {document:restored, stats} = restoreCoastlines(document, coastlineIndex(readNaturalEarthRings(source)), {sharedBorders});
  if (process.argv.includes('--write') && stats.insertedPoints) {
    const method = sharedBorders ? 'Natural Earth shared boundary-network vertices at retained three-decimal endpoint precision, including three-country junctions; authored cuts and identities preserved' : 'Exact Natural Earth coastal vertices between retained display endpoints; shared borders and authored cuts preserved';
    restored[sharedBorders ? 'sharedBorderRestoration' : 'coastlineRestoration'] = {method, tool:'tools/restore-map-coastlines.mjs' + (sharedBorders ? ' --shared-borders' : ''), sourceSha256:hash(source), previousGeometrySha256:hash(before), ...stats};
    const after = JSON.stringify(restored) + '\n';
    fs.writeFileSync(geometryPath, after);
    const manifestPath = path.join(root, 'assets/manifest.json'), manifest = JSON.parse(fs.readFileSync(manifestPath));
    const entry = manifest.assets.find(a => a.path === 'assets/maps/geometry.json');
    entry.bytes = Buffer.byteLength(after); entry.sha256 = hash(after);
    entry.changes = 'Extracted and deduplicated geometry with source coastal and shared administrative border vertices restored between retained endpoints; authored historical cuts and campaign identities preserved. Reproduce with tools/restore-map-coastlines.mjs, then --shared-borders.';
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(JSON.stringify({...stats, beforeBytes:before.length, afterBytes:entry.bytes, sha256:entry.sha256}, null, 2));
  } else {
    console.log(JSON.stringify({...stats, mode:'check'}, null, 2));
    if (process.argv.includes('--check') && stats.insertedPoints) process.exitCode = 1;
  }
}
