import { campaignMinutes } from '../mechanics/campaign-clock.mjs';
import { fleetPosition } from '../mechanics/task-forces.mjs';
import { NODES, HOME_PORT, distanceNm, wrapLon } from '../mechanics/world.mjs';
import { hullLabel } from './fleet-instances.mjs';
import { ownMerchantScene } from './merchant-scene.mjs';

// Engine-independent presentation geometry, in geographic coordinates/metres.
// The campaign knows fleet routes, not individual helms or tactical tracks.
// Slots below are representative operational stations around the EXACT fleet
// position. Never move an anchor into convenient water or join unrelated fleets.
export const FORMATION_NOTE = 'Ship stations are a representative formation around the recorded fleet position, not individual tactical tracks. Forces sharing one recorded position use separate display stations. Surviving ships keep their stations when another ship is lost. Port nodes and sea lanes are approximate.';
export const EARTH_RADIUS_METRES = 3440.065 * 1852;
const RAD = Math.PI / 180;
const alive = g => Number.isSafeInteger(g.count) && g.count > 0 &&
  !['sunk', 'scrapped', 'building'].includes(g.status);
const compare = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
const routeCache = new WeakMap();

function routeLegs(fleet) {
  let cached = routeCache.get(fleet);
  if (cached && cached.route === fleet.route) return cached;
  let total = 0;
  const legs = [];
  for (let i = 1; i < (fleet.route?.length || 0); i++) {
    const length = distanceNm(fleet.route[i - 1], fleet.route[i]);
    legs.push({ index: i - 1, start: total, end: total + length, length });
    total += length;
  }
  cached = { route: fleet.route, legs, total };
  routeCache.set(fleet, cached);
  return cached;
}

// Match fleetPosition's distance-weighted, wrapped lon/lat interpolation.
// A great-circle initial bearing would point away from this actual route at
// high latitude. Its local tangent is dlon*cos(latitude), dlat instead.
export function fleetCourse(state, fleet, minute = campaignMinutes(state)) {
  const position = fleetPosition(state, fleet, minute), { legs, total } = routeLegs(fleet);
  const arrived = minute >= fleet.arriveAt;
  const travelled = Math.max(0, minute - fleet.departAt) * fleet.speed / 60;
  let leg = arrived ? legs.at(-1) : legs.find((item, i) =>
    travelled <= item.end || i === legs.length - 1);
  if (!leg?.length) {
    // Duplicate points arise when an order begins at a route node. Skip a
    // zero-length leg, retaining the next course or final approach direction.
    leg = legs.find(item => item.length > 1e-9 && item.end >= travelled) ||
      legs.findLast(item => item.length > 1e-9);
  }
  const moving = !!leg && fleet.speed > 0 && minute >= fleet.departAt && !arrived && travelled < total;
  if (!leg) return { heading: 0, headingKnown: false, headingSource: 'unknown', moving: false, segmentIndex: null };
  const a = fleet.route[leg.index], b = fleet.route[leg.index + 1];
  const east = wrapLon(b[0] - a[0]) * Math.cos(position[1] * RAD), north = b[1] - a[1];
  return { heading: (Math.atan2(east, north) / RAD + 360) % 360,
    headingKnown: true, headingSource: 'route', moving, segmentIndex: leg.index };
}

// Spherical exponential-map offset: units do not change with chart projection,
// zoom, longitude wrapping, latitude, or the native engine's world coordinates.
export function geographicOffset(anchor, eastMetres, northMetres) {
  const distance = Math.hypot(eastMetres, northMetres);
  if (!distance) return [...anchor];
  const angle = distance / EARTH_RADIUS_METRES, bearing = Math.atan2(eastMetres, northMetres);
  const latitude = anchor[1] * RAD, longitude = anchor[0] * RAD;
  const nextLatitude = Math.asin(Math.max(-1, Math.min(1,
    Math.sin(latitude) * Math.cos(angle) + Math.cos(latitude) * Math.sin(angle) * Math.cos(bearing))));
  const nextLongitude = longitude + Math.atan2(Math.sin(bearing) * Math.sin(angle) * Math.cos(latitude),
    Math.cos(angle) - Math.sin(latitude) * Math.sin(nextLatitude));
  return [wrapLon(nextLongitude / RAD), nextLatitude / RAD];
}

function classesFor(state, content) {
  return content?.campaigns?.[state.campaignId]?.classes || content?.classes || {};
}
function roleOf(hull, classes) {
  if (hull.merchant) return 'merchant';
  const type = hull.type || classes[hull.classId]?.type;
  if (['CV', 'CVL', 'BB', 'BC'].includes(type)) return 'capital';
  if (hull.group?.service === 'support' || ['AO', 'AK', 'AM'].includes(type)) return 'support';
  if (['CA', 'CL'].includes(type)) return 'cruiser';
  if (['SS', 'SM'].includes(type)) return 'submarine';
  return 'escort';
}
function dimensionsOf(hull, classes, dimensionsFor) {
  const definition = classes[hull.classId], raw = definition?.raw || definition;
  const supplied = dimensionsFor?.(hull, definition) || hull.dimensions || {};
  const dimensions = raw?.dimensions || {};
  // A conservative representative envelope is used only where no authored
  // model/catalog dimensions exist. It never becomes a ship specification.
  return { length: supplied.length || dimensions.length_m || 300,
    beam: supplied.beam || dimensions.beam_m || 40 };
}

// Opposite stations are allocated in pairs, so partial screens surround their
// protected centre instead of filling just one side of a perimeter first.
function ringCells(radius) {
  const half = [];
  for (let x = 0; x <= radius; x++) half.push([x, radius]);
  for (let y = radius - 1; y >= -radius; y--) half.push([radius, y]);
  for (let x = radius - 1; x > 0; x--) half.push([x, -radius]);
  return half.flatMap(([x, y]) => [[x, y], [-x, -y]]);
}
function* cellsFrom(radius = 0) {
  if (!radius) yield [0, 0];
  for (let r = Math.max(1, radius); ; r++) yield* ringCells(r);
}
const cellKey = cell => cell.join(':');
const extent = slots => Object.values(slots).reduce((n, slot) => Math.max(n, Math.abs(slot.cell[0]), Math.abs(slot.cell[1])), 0);

function createLayout(row, classes, previous, dimensionsFor) {
  const hulls = [...row.hulls].sort(compare), known = new Set(hulls.map(h => h.key));
  const kind = row.merchant ? 'convoy' : row.docked ? 'harbor' : 'naval';
  const reuse = previous?.formation?.kind === kind && previous.fleet.id === row.fleet.id && previous.sceneScope === row.sceneScope &&
    (previous.sceneMinute === undefined || row.sceneMinute >= previous.sceneMinute)
    ? previous.formation : null;
  const dimensions = hulls.map(h => dimensionsOf(h, classes, dimensionsFor));
  const length = dimensions.reduce((n, d) => Math.max(n, d.length), 0), beam = dimensions.reduce((n, d) => Math.max(n, d.beam), 0);
  const spacing = [Math.max(reuse?.spacing[0] || 0, 600, length * 1.5, beam * 8), Math.max(reuse?.spacing[1] || 0, 600, length * 2.5)];
  const slots = Object.fromEntries(Object.entries(reuse?.slots || {}).filter(([key]) => known.has(key)));
  const occupied = new Set(Object.values(slots).map(slot => cellKey(slot.cell)));
  const starts = { ...(reuse?.starts || {}) };
  const columns = reuse?.columns || Math.max(1, Math.min(kind === 'convoy' ? 6 : 12, Math.ceil(Math.sqrt(hulls.length / 2))));
  const allocate = (hull, cell, role) => {
    slots[hull.key] = { cell, role };
    occupied.add(cellKey(cell));
  };
  if (kind !== 'naval') {
    let index = 0;
    for (const hull of hulls) {
      if (slots[hull.key]) continue;
      // Convoys use parallel columns. Additional hulls fill vacant stations
      // without changing existing columns or shifting surviving ships.
      let cell;
      do { cell = [index % columns, -Math.floor(index / columns)]; index++; }
      while (occupied.has(cellKey(cell)));
      allocate(hull, cell, kind === 'convoy' ? 'merchant' : 'berthed');
    }
  } else {
    for (const role of ['capital', 'support', 'cruiser', 'escort', 'submarine']) {
      starts[role] ??= ['capital', 'support'].includes(role) ? 0 : (occupied.size ? extent(slots) + 1 : 0);
      const cells = cellsFrom(starts[role]);
      for (const hull of hulls.filter(h => !slots[h.key] && roleOf(h, classes) === role)) {
        let cell;
        do { cell = cells.next().value; } while (occupied.has(cellKey(cell)));
        allocate(hull, cell, role);
      }
    }
  }
  // Centre only a newly assembled formation. After casualties, leave gaps;
  // recentering survivors every snapshot would make the entire fleet jump.
  const center = reuse?.center || [0, 1].map(axis =>
    Object.values(slots).reduce((sum, slot) => sum + slot.cell[axis], 0) / Math.max(1, hulls.length));
  return { kind, spacing, columns, starts, center, slots,
    separationOffsetMeters: [...(reuse?.separationOffsetMeters || [0, 0])] };
}

// Several independent opening fleets can share one harbor/route node. Their
// separately centered screens otherwise put a destroyer through a carrier, or
// put whole submarine and escort groups in identical stations. Allocate only
// these co-located forces separate presentation stations; never move a route
// anchor or space unrelated fleets across the world. The translation is stored
// in each force's own starboard/forward frame, so all of its hulls still turn and
// travel together. Reuse it after departure and casualties to avoid recentering.
function separateColocatedFormations(state, rows, classes, dimensionsFor) {
  const clusters = new Map();
  for (const row of rows) {
    if (row.unlocated) continue;
    const anchor = fleetPosition(state, row.fleet, row.sceneMinute);
    if (!Array.isArray(anchor) || !anchor.every(Number.isFinite)) continue;
    const key = [wrapLon(anchor[0]), anchor[1]].map(n => n.toFixed(7)).join(':');
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key).push(row);
  }
  for (const cluster of clusters.values()) {
    if (cluster.length < 2) continue;
    const entries = cluster.map(row => {
      const heading = fleetCourse(state, row.fleet, row.sceneMinute).heading * RAD;
      const layout = row.formation;
      return { row, sin: Math.sin(heading), cos: Math.cos(heading),
        hulls: row.hulls.map(hull => {
          const cell = layout.slots[hull.key].cell, size = dimensionsOf(hull, classes, dimensionsFor);
          return { starboard: (cell[0] - layout.center[0]) * layout.spacing[0],
            forward: (cell[1] - layout.center[1]) * layout.spacing[1],
            // A rotated hull stays inside this circle, including modest gun,
            // shaft and sponson overhang beyond the catalog hull dimensions.
            radius: Math.hypot(size.length, size.beam) / 2 + 40 };
        }) };
    }).sort((a, b) => Number(!!a.row.merchant) - Number(!!b.row.merchant) ||
      a.row.fleet.id.localeCompare(b.row.fleet.id, 'en'));
    const step = entries.reduce((max, entry) => entry.hulls.reduce((n, hull) => Math.max(n, hull.radius * 2), max), 600);
    const occupied = new Map();
    const key = (x, y) => `${x}:${y}`;
    const pointsAt = (entry, offset) => entry.hulls.map(hull => {
      const starboard = hull.starboard + offset[0], forward = hull.forward + offset[1];
      return { x: starboard * entry.cos + forward * entry.sin,
        y: forward * entry.cos - starboard * entry.sin, radius: hull.radius };
    });
    const clear = points => points.every(point => {
      const x = Math.floor(point.x / step), y = Math.floor(point.y / step);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        for (const other of occupied.get(key(x + dx, y + dy)) || []) {
          if (Math.hypot(point.x - other.x, point.y - other.y) < point.radius + other.radius) return false;
        }
      }
      return true;
    });
    for (const entry of entries) {
      let offset = entry.row.formation.separationOffsetMeters, points = pointsAt(entry, offset);
      if (!clear(points)) {
        // Translate the entire formation by a deterministic lattice, preserving
        // all internal stations, screen roles, headings and hull identities.
        for (const cell of cellsFrom()) {
          offset = cell.map(n => n * step);
          points = pointsAt(entry, offset);
          if (clear(points)) break;
        }
        entry.row.formation.separationOffsetMeters = offset;
      }
      for (const point of points) {
        const cell = key(Math.floor(point.x / step), Math.floor(point.y / step));
        if (!occupied.has(cell)) occupied.set(cell, []);
        occupied.get(cell).push(point);
      }
    }
  }
  return rows;
}

// Keep the returned row as the previous row for this force on the next state
// snapshot. All retained slots are immutable presentation data, not save data.
export function prepareFormation(row, content = {}, previous = null, { dimensionsFor } = {}) {
  const classes = content.classes || content;
  return { ...row, formation: createLayout(row, classes, previous, dimensionsFor) };
}

function instances(groups, classes) {
  return groups.flatMap(group => Array.from({ length: group.count }, (_, hullIndex) => ({
    key: `${group.id}:${hullIndex}`, groupId: group.id, classId: group.classId,
    type: classes[group.classId]?.type, hullIndex, group, label: hullLabel(group, hullIndex),
  }))).sort(compare);
}

// Only own ships are expanded. Contacts store estimates/category/last sighting,
// not identified classes, exact hull counts, current course, or current position.
// Reading another nation's groups here would silently defeat intelligence.
export function ownFormationScene(state, content = {}, previousRows = [], options = {}) {
  const navy = state?.nations?.[state.player];
  if (!navy) return [];
  const classes = classesFor(state, content), previous = new Map(previousRows.map(row => [row.fleet.id, row]));
  const groups = (navy.groups || []).filter(g => alive(g) && g.service !== 'merchant');
  const fleets = new Map((navy.fleets || []).map(fleet => [fleet.id, fleet]));
  const rows = [...fleets.values()].map(fleet => ({ fleet, nation: state.player,
    hulls: instances(groups.filter(g => g.fleetId === fleet.id), classes), positionSource: 'fleet-route' }));
  const docks = new Map();
  for (const group of groups) {
    if (fleets.has(group.fleetId)) continue;
    const port = group.dockPort || HOME_PORT[state.player];
    // Orphaned at-sea groups lack an authoritative position. Return them as
    // unlocated instead of teleporting them to their home port.
    const unlocated = !!group.atSea || !NODES[port], key = unlocated ? `unlocated:${group.id}` : port;
    if (!docks.has(key)) docks.set(key, { port, unlocated, groups: [] });
    docks.get(key).groups.push(group);
  }
  for (const [key, dock] of docks) {
    rows.push({ fleet: { id: `dock:${state.player}:${key}`, name: dock.unlocated ? 'Unlocated ship' : `Ships in ${dock.port}`,
      port: dock.port, position: dock.unlocated ? undefined : [...NODES[dock.port]], speed: 0, phase: 'port' },
      nation: state.player, docked: !dock.unlocated, unlocated: dock.unlocated,
      positionSource: dock.unlocated ? 'unknown' : 'dock-node', hulls: instances(dock.groups, classes) });
  }
  if (options.includeMerchants !== false) rows.push(...ownMerchantScene(state, options.minute ?? campaignMinutes(state)));
  const prepared = rows.filter(row => row.hulls.length).map(row => prepareFormation({ ...row,
    sceneScope: `${state.campaignId || ''}:${state.player}`, sceneMinute: campaignMinutes(state), scenePaused: !!state.paused },
    { classes }, previous.get(row.fleet.id), options));
  return separateColocatedFormations(state, prepared, classes, options.dimensionsFor);
}

export function formationAt(state, row, minute = campaignMinutes(state), { fleet = row.fleet } = {}) {
  const layout = row.formation || createLayout(row, {}, null);
  const course = row.unlocated ? { heading: 0, headingKnown: false, headingSource: 'unknown', moving: false, segmentIndex: null }
    : fleetCourse(state, fleet, minute);
  const anchor = row.unlocated ? null : fleetPosition(state, fleet, minute);
  const sin = Math.sin(course.heading * RAD), cos = Math.cos(course.heading * RAD);
  const hulls = row.hulls.map(hull => {
    const slot = layout.slots[hull.key];
    const starboard = (slot.cell[0] - layout.center[0]) * layout.spacing[0] + (layout.separationOffsetMeters?.[0] || 0);
    const forward = (slot.cell[1] - layout.center[1]) * layout.spacing[1] + (layout.separationOffsetMeters?.[1] || 0);
    const east = starboard * cos + forward * sin, north = forward * cos - starboard * sin;
    return { ...hull, slot: { ...slot, cell: [...slot.cell] }, stationMeters: [starboard, forward], offsetMeters: [east, north],
      position: anchor && geographicOffset(anchor, east, north), heading: course.heading,
      headingKnown: course.headingKnown };
  });
  const centroidMeters = [0, 1].map(axis => hulls.reduce((sum, hull) => sum + hull.offsetMeters[axis], 0) / Math.max(1, hulls.length));
  return { anchor, ...course, centroidMeters, hulls };
}
