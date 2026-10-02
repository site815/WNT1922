import { campaignMinutes } from '../mechanics/campaign-clock.mjs';
import { fleetPosition, visibleContacts } from '../mechanics/task-forces.mjs';
import { NODES, PORTS, PORT_LOCATIONS, MAP_CAPITALS, distanceNm, wrapLon } from '../mechanics/world.mjs';
import { frontPosition, POWERS } from '../mechanics/land-war.mjs';
import { fleetCourse, formationAt, ownFormationScene } from './fleet-formation.mjs';
import { ongoingMapBattles } from './battle-map.mjs';
import { MAP_SYMBOLS } from './map-symbols.mjs';

const finitePoint = point => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite);
const clamp = (n, low, high) => Math.max(low, Math.min(high, n));

function remainingOwnRoute(state, fleet) {
  const now = campaignMinutes(state);
  if (!fleet?.route?.length || now >= fleet.arriveAt) return [];
  let travelled = Math.max(0, now - fleet.departAt) * fleet.speed / 60;
  for (let i = 1; i < fleet.route.length; i++) {
    const leg = distanceNm(fleet.route[i - 1], fleet.route[i]);
    if (travelled <= leg) return [fleetPosition(state, fleet, now), ...fleet.route.slice(i)].map(point => [...point]);
    travelled -= leg;
  }
  return [];
}

function routeBreaks(fleet, fromAt, toAt) {
  const breaks = [fleet.departAt, fleet.arriveAt];
  if (fleet.speed > 0 && Number.isFinite(fleet.departAt)) {
    let distance = 0;
    for (let i = 1; i < (fleet.route?.length || 0); i++) {
      distance += distanceNm(fleet.route[i - 1], fleet.route[i]);
      breaks.push(fleet.departAt + distance / fleet.speed * 60);
    }
  }
  return breaks.filter(at => Number.isFinite(at) && at > fromAt && at < toAt);
}

// Only interpolate the already-received interval. A later order may replace
// the route mid-interval: use the old force until the
// new departure time. Every real waypoint becomes a segment boundary; a native
// renderer must not draw a direct chord between two distant snapshot positions.
export function observedNavigation(state, row, previous) {
  const now = campaignMinutes(state);
  const validPrevious = previous && previous.sceneScope === row.sceneScope &&
    previous.fleet.id === row.fleet.id && !state.paused && !previous.scenePaused &&
    Number.isFinite(previous.sceneMinute) && previous.sceneMinute < now &&
    !previous.unlocated && !row.unlocated;
  const fromAt = validPrevious ? previous.sceneMinute : now;
  const navigation = { fromAt, toAt: now, interpolation: 'wrapped-lonlat', segments: [] };
  if (fromAt === now) return navigation;
  const latest = row.fleet, prior = previous.fleet;
  const boundaries = [...new Set([fromAt, now, ...routeBreaks(prior, fromAt, now), ...routeBreaks(latest, fromAt, now)])].sort((a, b) => a - b);
  for (let i = 1; i < boundaries.length; i++) {
    const start = boundaries[i - 1], end = boundaries[i], midpoint = (start + end) / 2;
    const force = midpoint < latest.departAt ? prior : latest;
    const course = fleetCourse(state, force, midpoint);
    const a = force.route?.[course.segmentIndex], b = force.route?.[course.segmentIndex + 1];
    const courseDelta = a && b ? [wrapLon(b[0] - a[0]), b[1] - a[1]] : [0, 0];
    const from = fleetPosition(state, force, start), to = fleetPosition(state, force, end);
    navigation.segments.push({ fromAt: start, toAt: end, from: [...from], to: [...to],
      courseDelta, heading: course.heading, headingKnown: course.headingKnown, moving: course.moving });
  }
  return navigation;
}

// Reference evaluator for the native contract and tests. CourseDelta follows
// the actual lon/lat route, not a great-circle shortcut. UE can apply the same
// small calculation and rotate each hull's fixed [starboard,forward] station.
export function sampleObservedNavigation(force, minute) {
  const navigation = force.navigation;
  if (!navigation?.segments.length) return { position: force.position && [...force.position],
    heading: force.heading, headingKnown: force.headingKnown, moving: force.moving };
  const at = clamp(minute, navigation.fromAt, navigation.toAt);
  // At a turn, take the outgoing leg; the point itself is identical either way.
  const segment = navigation.segments.find(segment => at < segment.toAt) || navigation.segments.at(-1);
  const fraction = clamp((at - segment.fromAt) / Math.max(1e-12, segment.toAt - segment.fromAt), 0, 1);
  const position = [wrapLon(segment.from[0] + wrapLon(segment.to[0] - segment.from[0]) * fraction),
    segment.from[1] + (segment.to[1] - segment.from[1]) * fraction];
  const [lon, lat] = segment.courseDelta;
  const heading = segment.headingKnown && (lon || lat)
    ? (Math.atan2(lon * Math.cos(position[1] * Math.PI / 180), lat) * 180 / Math.PI + 360) % 360
    : segment.heading;
  return { position, heading, headingKnown: segment.headingKnown,
    moving: at < navigation.toAt ? segment.moving : force.moving };
}

// This JSON contract is intentionally renderer-independent. CEF forwards it to
// Unreal; native code owns terrain, water, meshes, lights and camera. It contains
// no camera settings and never examines another nation's ships or convoy truth.
// Keep ownFormationScene() rows between calls (options.rows avoids duplicate
// assembly when the caller also needs those rows for the next received state).
export function buildUnrealScenePacket(state, content, previousRows = [], options = {}) {
  const rows = options.rows || ownFormationScene(state, content, previousRows, options);
  const previous = new Map(previousRows.map(row => [row.fleet.id, row]));
  const classes = content?.campaigns?.[state.campaignId]?.classes || content?.classes || {};
  const forces = rows.map(row => {
    const frame = formationAt(state, row);
    return { id: row.fleet.id, name: row.fleet.name || row.fleet.id, merchant: !!row.merchant,
      docked: !!row.docked, unlocated: !!row.unlocated, positionSource: row.positionSource || 'convoy-route',
      position: frame.anchor && [...frame.anchor], heading: frame.heading, headingKnown: frame.headingKnown,
      moving: frame.moving, navigation: observedNavigation(state, row, previous.get(row.fleet.id)),
      hulls: frame.hulls.map(hull => ({ key: hull.key, id: hull.groupId, groupId: hull.groupId,
        classId: hull.classId, type: hull.type || classes[hull.classId]?.type || (row.merchant ? 'AK' : 'DD'),
        hullIndex: hull.hullIndex, label: hull.label, offsetMeters: [...hull.offsetMeters],
        stationMeters: [...hull.stationMeters], heading: hull.heading, headingKnown: hull.headingKnown,
        status: hull.group?.status || 'underway' })) };
  });
  const contacts = visibleContacts(state).filter(contact => finitePoint(contact.position)).map(contact => ({
    id: contact.id, nation: contact.nation, position: [...contact.position], seenAt: contact.seenAt,
    source: contact.source, estimate: contact.estimate, kind: contact.kind, stage: contact.stage,
    confidence: contact.confidence, uncertainty: contact.uncertainty, hours: contact.hours,
  }));
  const ports = Object.entries(PORTS).flatMap(([id, port]) => {
    const position = PORT_LOCATIONS[id] || NODES[id];
    return finitePoint(position) ? [{ id, name: port.name, position: [...position], owner: state.world?.portControl?.[id] || port.nation }] : [];
  });
  const countries = Object.entries(MAP_CAPITALS).map(([id, capital]) => ({ id, name: capital.name,
    position: [...capital.point], color: POWERS[id]?.color || '#e5cf9d' }));
  const fronts = (state.world?.fronts || []).filter(front => front.progress > 0 && front.progress < 1)
    .map(front => ({ id: front.id, name: front.name, position: frontPosition(front) }));
  const selected = rows.find(row => row.fleet.id === options.selectedForceId && !row.docked && !row.unlocated);
  const ownLocated = new Set(rows.filter(row => !row.unlocated).map(row => row.fleet.id));
  const selectedForceIds = [...new Set(options.selectedForceIds || (options.selectedForceId ? [options.selectedForceId] : []))]
    .filter(id => ownLocated.has(id));
  const points = selected ? remainingOwnRoute(state, selected.fleet) : [];
  return { format: 1, campaign: state.campaignId, player: state.player, at: campaignMinutes(state), paused: !!state.paused, animate:options.animate !== false,
    forces, contacts, ports, countries, fronts, selectedForceIds, chartSymbols: MAP_SYMBOLS,
    battles:ongoingMapBattles(state), route: points.length > 1 ? { forceId: selected.fleet.id, points } : null,
    control: { ...(state.world?.control || {}) } };
}
