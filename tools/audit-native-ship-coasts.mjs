import fs from 'node:fs/promises';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { POLITICAL, POLITICAL_1922 } from '../worker/map-assets.mjs';
import { newGame } from '../mechanics/engine.mjs';
import { ownFormationScene, formationAt, geographicOffset } from '../ui/fleet-formation.mjs';

// Read-only diagnostic: mirror the native terrain's unwrapped planar polygon
// test, including holes and boundary points. Do not relocate ships or coastlines.
const wrap = x => ((x + 180) % 360 + 360) % 360 - 180;
const centre = ring => ring.reduce((n, p) => n + p[0], 0) / ring.length;
function unwrap(source) {
  const poles = source.filter(p => Math.abs(p[1]) > 89.9);
  const artificial = poles.length > 1 && Math.max(...poles.map(p => p[0])) - Math.min(...poles.map(p => p[0])) > 359;
  const ring = [];
  for (const p of source) {
    if (artificial && Math.abs(p[1]) > 89.9) continue;
    const q = [wrap(p[0]), p[1]];
    if (ring.length) {
      while (q[0] - ring.at(-1)[0] > 180) q[0] -= 360;
      while (q[0] - ring.at(-1)[0] < -180) q[0] += 360;
      if (Math.hypot(q[0] - ring.at(-1)[0], q[1] - ring.at(-1)[1]) < 1e-10) continue;
    }
    ring.push(q);
  }
  if (ring.length > 1 && Math.hypot(ring[0][0] - ring.at(-1)[0], ring[0][1] - ring.at(-1)[1]) < 1e-10) ring.pop();
  if (ring.length > 2 && Math.abs(ring.at(-1)[0] - ring[0][0]) > 180) {
    const end = ring[0][0] + (ring.at(-1)[0] > ring[0][0] ? 360 : -360);
    if (Math.abs(ring.at(-1)[0] - end) > 1e-9) ring.push([end, ring[0][1]]);
    const pole = ring.reduce((n, p) => n + p[1], 0) >= 0 ? 90 : -90;
    ring.push([end, pole], [ring[0][0], pole]);
  }
  return ring;
}
function inRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[j], b = ring[i], cross = (x - a[0]) * (b[1] - a[1]) - (y - a[1]) * (b[0] - a[0]);
    if (Math.abs(cross) < 1e-10 && x >= Math.min(a[0], b[0]) - 1e-10 && x <= Math.max(a[0], b[0]) + 1e-10 && y >= Math.min(a[1], b[1]) - 1e-10 && y <= Math.max(a[1], b[1]) + 1e-10) return true;
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
function landQuery(political) {
  const polygons = political.features.flatMap(feature => {
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    return polygons.map(source => {
      const rings = source.map(unwrap).filter(r => r.length >= 3);
      for (const ring of rings.slice(1)) { const shift = Math.round((centre(rings[0]) - centre(ring)) / 360) * 360; for (const point of ring) point[0] += shift; }
      return { id: feature.id, name: feature.name, rings, minX: Math.min(...rings[0].map(p => p[0])), maxX: Math.max(...rings[0].map(p => p[0])),
        minY: Math.min(...rings[0].map(p => p[1])), maxY: Math.max(...rings[0].map(p => p[1])) };
    });
  });
  return point => polygons.find(poly => {
    const p = [wrap(point[0]), point[1]]; p[0] += Math.round(((poly.minX + poly.maxX) / 2 - p[0]) / 360) * 360;
    return p[0] >= poly.minX && p[0] <= poly.maxX && p[1] >= poly.minY && p[1] <= poly.maxY && inRing(p, poly.rings[0]) && !poly.rings.slice(1).some(r => inRing(p, r));
  });
}

const result = { seed: 3901, method: 'Native planar polygon containment at exact fleet anchors and representative geographic hull stations; no geometry or simulation changes.',
  limitation: 'Any land result means sea-level ship geometry can intersect the raised native terrain. This is a data-fidelity issue, not corrected by display relocation.', campaigns: [] };
const registry = JSON.parse(await fs.readFile('assets/models/ships/index.json', 'utf8')), dimensions = new Map(), mappings = new Map();
for (const entry of registry.models) {
  dimensions.set(entry.id, JSON.parse(await fs.readFile('assets/models/ships/' + entry.file, 'utf8')).dimensions);
  for (const platform of entry.platforms) mappings.set((platform.campaign ? platform.campaign + ':' : '') + platform.id, entry.id);
}
for (const campaign of Object.keys(CATALOG.campaigns)) {
  const onLand = landQuery(campaign === 'campaign_1922' ? POLITICAL_1922 : POLITICAL), rows = [];
  if (!onLand([-.12, 51.5]) || onLand([-30, 30])) throw Error('Native land audit positive/negative controls failed.');
  for (const nation of Object.keys(CATALOG.campaigns[campaign].nations)) {
    const state = newGame(CATALOG, nation, result.seed, campaign), scenes = ownFormationScene(state, CATALOG);
    const affected = []; let hulls = 0, anchorsOnLand = 0, hullsOnLand = 0, hullFootprintsTouchLand = 0;
    for (const row of scenes) {
      const frame = formationAt(state, row); hulls += frame.hulls.length;
      const anchorLand = frame.anchor && onLand(frame.anchor), landHulls = frame.hulls.filter(h => h.position && onLand(h.position));
      const footprintConflicts = frame.hulls.filter(hull => {
        if (!hull.position) return false;
        const model = mappings.get(campaign + ':' + hull.classId) || mappings.get(hull.classId) || registry.fallbacks[hull.type || (row.merchant ? 'AK' : 'DD')];
        const size = dimensions.get(model), sin = Math.sin(hull.heading * Math.PI / 180), cos = Math.cos(hull.heading * Math.PI / 180);
        return [-1, 0, 1].some(x => [-1, 0, 1].some(y => {
          const starboard = x * size.beam / 2, forward = y * size.length / 2;
          return onLand(geographicOffset(hull.position, starboard * cos + forward * sin, forward * cos - starboard * sin));
        }));
      });
      anchorsOnLand += anchorLand ? 1 : 0; hullsOnLand += landHulls.length;
      hullFootprintsTouchLand += footprintConflicts.length;
      if (anchorLand || landHulls.length || footprintConflicts.length) affected.push({ id: row.fleet.id, name: row.fleet.name, port: row.fleet.port, merchant: !!row.merchant,
        phase: row.fleet.phase || row.fleet.leg, anchor: frame.anchor, anchorOnLand: !!anchorLand, landFeature: anchorLand?.name,
        hulls: frame.hulls.length, hullsOnLand: landHulls.length, hullFootprintsTouchLand: footprintConflicts.length,
        examples: footprintConflicts.slice(0, 3).map(h => ({ id: h.groupId, label: h.label, position: h.position })) });
    }
    rows.push({ nation, hulls, forces: scenes.length, anchorsOnLand, hullsOnLand, hullFootprintsTouchLand, affected });
  }
  result.campaigns.push({ campaign, hulls: rows.reduce((n, r) => n + r.hulls, 0), hullsOnLand: rows.reduce((n, r) => n + r.hullsOnLand, 0),
    hullFootprintsTouchLand: rows.reduce((n, r) => n + r.hullFootprintsTouchLand, 0), nations: rows });
}
await fs.mkdir('test-output', { recursive: true });
await fs.writeFile('test-output/native-ship-coast-audit.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result.campaigns.map(c => ({ campaign: c.campaign, hulls: c.hulls, hullsOnLand: c.hullsOnLand, hullFootprintsTouchLand: c.hullFootprintsTouchLand,
  nations: c.nations.map(n => ({ nation: n.nation, hulls: n.hulls, hullsOnLand: n.hullsOnLand, hullFootprintsTouchLand: n.hullFootprintsTouchLand, ports: [...new Set(n.affected.map(a => a.port || a.id))] })) })), null, 2));
