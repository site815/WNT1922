import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/world.md");
const trade = await readDocument("common/rules/merchant-routes.md");
// Approximate sea lanes, in longitude/latitude. Coasts: Natural Earth, public domain.
// The Cape routes are used by all sizes of ship; canal access is not modeled.
export const NODES = { ...data.NODES, ...trade.NODES };
export const EDGES = [...data.EDGES, ...trade.EDGES];
export const PORTS = data.PORTS;
export const HOME_PORT = data.HOME_PORT;
// Abstract landing resistance and minimum campaign duration, deliberately
// tunable. Tiny islands are explicit chart nodes smaller than the base-map polygon resolution.
export const ISLANDS = data.ISLANDS;
export const AREAS = data.AREAS;
export const DEFAULT_AREA = data.DEFAULT_AREA;
export const REGION_AREA = data.REGION_AREA;
export { MISSIONS } from "./missions.mjs";
export const wrapLon = (lon) => ((lon + 540) % 360) - 180;
export function distanceNm(a, b) {
  if (a[0] === b[0] && a[1] === b[1]) return 0;
  const rad = Math.PI / 180,
    dlat = (b[1] - a[1]) * rad,
    dlon = wrapLon(b[0] - a[0]) * rad;
  const h =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dlon / 2) ** 2;
  return 3440.065 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}
// On a sphere, minimum chord distance and minimum great-circle distance choose
// the same node. Precompute fixed node vectors instead of doing hundreds of
// trigonometric distance calculations for every fleet and supply query.
const nodeIds = Object.keys(NODES);
const nodeVectors = Object.fromEntries(nodeIds.map(id => {
  const [lon,lat] = NODES[id].map(v => v * Math.PI / 180);
  return [id, [Math.cos(lat)*Math.cos(lon), Math.cos(lat)*Math.sin(lon), Math.sin(lat)]];
}));
export function nearestSeaNode(position, choices = nodeIds, preferLast = false) {
  const lon=position[0]*Math.PI/180, lat=position[1]*Math.PI/180,
    x=Math.cos(lat)*Math.cos(lon), y=Math.cos(lat)*Math.sin(lon), z=Math.sin(lat);
  let best = choices[0], score = -Infinity;
  for (const id of choices) {
    const v=nodeVectors[id], next=x*v[0]+y*v[1]+z*v[2];
    if (Math.abs(next-score) < 1e-12) {
      const a=distanceNm(NODES[id],position), b=distanceNm(NODES[best],position);
      if (a < b || (preferLast && a === b)) { best=id; score=next; }
    } else if (next > score) { best=id; score=next; }
  }
  return best;
}
export const interpolate = (a, b, t) => [
  wrapLon(a[0] + wrapLon(b[0] - a[0]) * t),
  a[1] + (b[1] - a[1]) * t,
];
export const project = ([lon, lat]) => [
  ((lon + 180) * 10) / 3,
  ((90 - lat) * 10) / 3,
];
const neighbors = Object.fromEntries(Object.keys(NODES).map((id) => [id, []]));
for (const [a, b] of EDGES) {
  neighbors[a].push(b);
  neighbors[b].push(a);
}
const routeCache = new Map();
const routeTrees = new Map();
const edgeCosts = Object.fromEntries(nodeIds.map(a => [a,
  Object.fromEntries(neighbors[a].map(b => [b, distanceNm(NODES[a], NODES[b])]))]));
// One shortest-path tree serves every destination from this static sea node.
// Keep node and edge order unchanged so equal-length routes remain deterministic.
function routeTree(from) {
  if (routeTrees.has(from)) return routeTrees.get(from);
  const costs = { [from]: 0 },
    prev = {},
    todo = new Set(nodeIds);
  while (todo.size) {
    let a = null;
    for (const n of todo)
      if (a === null || (costs[n] ?? Infinity) < (costs[a] ?? Infinity)) a = n;
    todo.delete(a);
    if (!Number.isFinite(costs[a])) break;
    for (const b of neighbors[a]) {
      const d = costs[a] + edgeCosts[a][b];
      if (d < (costs[b] ?? Infinity)) {
        costs[b] = d;
        prev[b] = a;
      }
    }
  }
  routeTrees.set(from, prev);
  return prev;
}
export function seaRoute(from, to) {
  if (!NODES[from] || !NODES[to]) throw new Error("Unknown sea lane.");
  const key = `${from}:${to}`;
  if (routeCache.has(key)) return [...routeCache.get(key)];
  const prev = routeTree(from);
  const path = [to];
  while (path[0] !== from) {
    if (!prev[path[0]]) throw new Error("Disconnected sea lane.");
    path.unshift(prev[path[0]]);
  }
  routeCache.set(key, path);
  return [...path];
}
export function routeLength(points) {
  let d = 0;
  for (let i = 1; i < points.length; i++)
    d += distanceNm(points[i - 1], points[i]);
  return d;
}
export function pointAlong(points, distance) {
  for (let i = 1; i < points.length; i++) {
    const leg = distanceNm(points[i - 1], points[i]);
    if (distance <= leg)
      return interpolate(points[i - 1], points[i], leg ? distance / leg : 1);
    distance -= leg;
  }
  return points.at(-1);
}
export function patrolPoint(area, minute, salt = 0) {
  const a = NODES[area],
    b = NODES[neighbors[area][0]],
    leg = distanceNm(a, b);
  const phase = (((minute / 60 + salt * 7) % 24) + 24) % 24;
  return interpolate(
    a,
    b,
    Math.min(0.18, 55 / Math.max(1, leg)) * (1 - Math.abs(phase - 12) / 12),
  );
}

export const MAP_CAPITALS = data.MAP_CAPITALS;
export const PORT_LOCATIONS = data.PORT_LOCATIONS;
