import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame } from '../mechanics/engine.mjs';
import { fleetPosition } from '../mechanics/task-forces.mjs';
import { NODES, routeLength, distanceNm } from '../mechanics/world.mjs';
import { convoyTraffic } from '../mechanics/convoy-traffic.mjs';
import { fleetCourse, formationAt, geographicOffset, ownFormationScene, prepareFormation } from '../ui/fleet-formation.mjs';

const classes = { bb: { type: 'BB', dimensions: { length_m: 240, beam_m: 32 } },
  dd: { type: 'DD', dimensions: { length_m: 110, beam_m: 12 } },
  ca: { type: 'CA', dimensions: { length_m: 180, beam_m: 20 } },
  ao: { type: 'AO', dimensions: { length_m: 150, beam_m: 22 } },
  ss: { type: 'SS', dimensions: { length_m: 85, beam_m: 8 } } };
const fleet = (id, route, extra = {}) => ({ id, route, speed: 20, departAt: 0,
  arriveAt: routeLength(route) / 20 * 60, ...extra });
const group = (id, classId, extra = {}) => ({ id, classId, name: id, count: 1, fleetId: 'f',
  status: 'active', service: classId === 'ao' ? 'support' : 'warship', ...extra });
const state = (groups, fleets = [fleet('f', [[0, 0], [4, 0]])]) => ({ player: 'USA', day: 0, fraction: 0,
  campaignId: 'fixture', nations: { USA: { groups, fleets, convoys: [] } } });
const near = (actual, expected, epsilon = 1e-8) => assert(Math.abs(actual - expected) < epsilon, `${actual} != ${expected}`);

test('geographic fleet headings follow the actual route tangent through dateline and turns without shifting anchors', () => {
  const cases = [
    { route: [[179, 10], [-179, 10]], heading: 90 },
    { route: [[-179, -30], [179, -30]], heading: 270 },
    { route: [[0, 55], [0, 57]], heading: 0 },
    { route: [[0, -50], [0, -54]], heading: 180 },
    { route: [[170, 65], [-170, 70]] },
  ];
  for (const { route, heading } of cases) {
    const force = fleet('f', route), s = state([group('a', 'bb'), group('b', 'dd')], [force]);
    const row = ownFormationScene(s, { classes })[0], minute = force.arriveAt * .4;
    const frame = formationAt(s, row, minute), position = fleetPosition(s, force, minute);
    assert.deepEqual(frame.anchor, position); assert(frame.moving && frame.headingKnown);
    if (heading !== undefined) near(frame.heading, heading);
    else {
      const p = fleetPosition(s, force, minute + .001);
      const east = ((p[0] - position[0] + 540) % 360 - 180) * Math.cos(position[1] * Math.PI / 180);
      near(frame.heading, (Math.atan2(east, p[1] - position[1]) * 180 / Math.PI + 360) % 360, 1e-5);
    }
    frame.centroidMeters.forEach(value => near(value, 0));
    for (const hull of frame.hulls) {
      near(distanceNm(frame.anchor, hull.position) * 1852, Math.hypot(...hull.offsetMeters), .0001);
      assert.equal(hull.heading, frame.heading);
    }
    assert.equal(fleetCourse(s, force, force.arriveAt + 10).moving, false);
  }
  const force = fleet('f', [[0, 0], [0, 0], [2, 0], [2, 2]]), s = state([group('a', 'bb')], [force]);
  near(fleetCourse(s, force, 0).heading, 90, 1e-9);
  const turn = distanceNm([0, 0], [2, 0]) / force.speed * 60;
  near(fleetCourse(s, force, turn - .001).heading, 90);
  near(fleetCourse(s, force, turn + .001).heading, 0);
  near(fleetCourse(s, force, force.arriveAt).heading, 0);
});

test('fleet formation uses supplied visual snapshot routes and distinguishes unknown stationary bearings', () => {
  const s = state([group('a', 'bb')]), row = ownFormationScene(s, { classes })[0];
  const previousForce = fleet('f', [[179, 10], [-179, 10]], { departAt: -30 });
  const frame = formationAt(s, row, 50, { fleet: previousForce });
  assert.deepEqual(frame.anchor, fleetPosition(s, previousForce, 50));
  near(frame.heading, 90);
  const stationary = fleet('stationary', [NODES.norfolk]);
  const course = fleetCourse(s, stationary, 20);
  assert.equal(course.headingKnown, false); assert.equal(course.headingSource, 'unknown'); assert.equal(course.moving, false);
});

test('formation stations surround heavy ships, preserve hull identity on losses/reorder, and never mutate a save', () => {
  const groups = [group('b1', 'bb'), group('b2', 'bb'), group('a1', 'ao'),
    ...Array.from({ length: 4 }, (_, i) => group('c' + i, 'ca')),
    ...Array.from({ length: 12 }, (_, i) => group('d' + i, 'dd'))];
  const s = state(groups), before = structuredClone(s), rows = ownFormationScene(s, { classes });
  const row = rows[0], frame = formationAt(s, row, 120);
  const core = Object.values(row.formation.slots).filter(slot => ['capital', 'support'].includes(slot.role));
  const screen = Object.values(row.formation.slots).filter(slot => slot.role === 'escort');
  assert(Math.min(...screen.map(slot => Math.hypot(...slot.cell))) > Math.max(...core.map(slot => Math.hypot(...slot.cell))));
  const byKey = new Map(frame.hulls.map(hull => [hull.key, hull]));
  const changed = structuredClone(s); changed.nations.USA.groups.reverse();
  changed.nations.USA.groups.find(g => g.id === 'b1').status = 'sunk';
  changed.nations.USA.groups.find(g => g.id === 'd3').count = 0;
  const next = ownFormationScene(changed, { classes }, rows)[0];
  for (const hull of formationAt(changed, next, 120).hulls) {
    assert.deepEqual(hull.slot, byKey.get(hull.key).slot);
    assert.deepEqual(hull.offsetMeters, byKey.get(hull.key).offsetMeters);
    assert.deepEqual(hull.position, byKey.get(hull.key).position);
  }
  assert(!next.formation.slots['d3:0'], 'removed stations do not accumulate tombstones');
  changed.nations.USA.groups.push(group('new-dd', 'dd'));
  const joined = ownFormationScene(changed, { classes }, [next])[0];
  assert.equal(new Set(Object.values(joined.formation.slots).map(slot => slot.cell.join(':'))).size, joined.hulls.length);
  const reordered = structuredClone(s); reordered.nations.USA.groups.reverse();
  assert.deepEqual(ownFormationScene(reordered, { classes })[0].formation, row.formation, 'initial layout is independent of input order');
  assert.deepEqual(s, before);
});

test('all completed own naval ships include reserve, repairs, conversions and depot support without merging operational fleets', () => {
  const other = fleet('other', [[80, 10], [84, 10]], { port: 'norfolk' });
  const s = state([group('active', 'bb'), group('other', 'dd', { fleetId: 'other' }),
    group('reserve', 'bb', { status: 'reserve', fleetId: null, dockPort: 'norfolk' }),
    group('repair', 'bb', { status: 'repair', fleetId: null, dockPort: 'pearl' }),
    group('conversion', 'ca', { status: 'converting', fleetId: null, dockPort: 'norfolk' }),
    group('trials', 'dd', { status: 'trials', fleetId: null, dockPort: 'norfolk' }),
    group('depot', 'ao', { fleetId: null, dockPort: 'norfolk', count: 3 }),
    group('missing-position', 'dd', { fleetId: null, atSea: true }),
    group('building', 'bb', { status: 'building' }), group('sunk', 'dd', { status: 'sunk' }),
    group('scrapped', 'dd', { status: 'scrapped' }), group('merchant-capacity', 'dd', { service: 'merchant', count: 100 })],
    [fleet('f', [[0, 0], [4, 0]], { port: 'norfolk' }), other]);
  Object.defineProperty(s.nations, 'JPN', { get() { throw Error('Foreign truth must never be read'); } });
  const rows = ownFormationScene(s, { classes });
  assert.equal(rows.reduce((sum, row) => sum + row.hulls.length, 0), 10);
  const underway = rows.filter(row => !row.docked && !row.unlocated);
  assert.equal(underway.length, 2);
  assert.deepEqual(formationAt(s, underway[1], 100).anchor, fleetPosition(s, other, 100));
  const dock = rows.find(row => row.fleet.id === 'dock:USA:norfolk');
  assert.deepEqual(formationAt(s, dock, 100).anchor, NODES.norfolk);
  assert(dock.hulls.some(h => h.groupId === 'reserve') && dock.hulls.some(h => h.groupId === 'depot'));
  const missing = formationAt(s, rows.find(row => row.unlocated), 100);
  assert.equal(missing.anchor, null); assert.equal(missing.hulls[0].position, null);
});

test('geographic metre offsets retain separation at high latitudes and wrap safely across the dateline', () => {
  for (const anchor of [[179.999, 0], [-179.999, 78], [0, 89.9], [35, -89.9]]) {
    for (const offset of [[600, 0], [0, 750], [-1300, -4000]]) {
      const point = geographicOffset(anchor, ...offset);
      assert(point.every(Number.isFinite) && point[0] >= -180 && point[0] < 180 && Math.abs(point[1]) <= 90);
      near(distanceNm(anchor, point) * 1852, Math.hypot(...offset), .001);
    }
  }
  assert.deepEqual(geographicOffset([179, 1], 0, 0), [179, 1]);
});

test('large convoy columns contain every survivor with metre spacing, stable casualty gaps and model envelope clearance', () => {
  const s = state([]); s.nations.USA.convoys = [{ ...fleet('convoy', [[179, 30], [-175, 30]]), count: 1201, leg: 'outbound' }];
  const before = JSON.stringify(s), row = ownFormationScene(s, { classes })[0], frame = formationAt(s, row, 100);
  assert.equal(frame.hulls.length, 1201); assert.equal(row.formation.kind, 'convoy'); assert.equal(row.formation.columns, 6);
  assert.equal(new Set(frame.hulls.map(h => h.key)).size, 1201);
  assert.equal(JSON.stringify(s), before);
  const changed = structuredClone(s); changed.nations.USA.convoys[0].count = 1190;
  const next = ownFormationScene(changed, { classes }, [row])[0];
  for (const hull of formationAt(changed, next, 100).hulls) assert.deepEqual(hull.offsetMeters, frame.hulls[hull.hullIndex].offsetMeters);
  const widened = prepareFormation(row, { classes }, row, { dimensionsFor: () => ({ length: 900, beam: 100 }) });
  assert(widened.formation.spacing.every(n => n >= 1350));
  assert.deepEqual(widened.formation.slots, row.formation.slots, 'envelope change retains station identity');
});

test('both campaigns and all navies account for every completed naval hull and underway merchant without mutating state', () => {
  for (const campaign of Object.keys(CATALOG.campaigns)) for (const nation of Object.keys(CATALOG.campaigns[campaign].nations)) {
    const s = newGame(CATALOG, nation, 3901, campaign), before = JSON.stringify(s);
    const rows = ownFormationScene(s, CATALOG), navy = s.nations[nation];
    const naval = navy.groups.filter(g => g.service !== 'merchant' && g.count > 0 && !['building', 'sunk', 'scrapped'].includes(g.status));
    assert.equal(rows.filter(row => !row.merchant).reduce((sum, row) => sum + row.hulls.length, 0), naval.reduce((sum, g) => sum + g.count, 0), `${campaign}/${nation}`);
    assert.equal(rows.filter(row => row.merchant).reduce((sum, row) => sum + row.hulls.length, 0), convoyTraffic(s, nation).hullsAtSea);
    assert(!rows.some(row => row.unlocated), `${campaign}/${nation} opening ships have known routes/docks`);
    for (const row of rows) {
      const frame = formationAt(s, row);
      assert(frame.anchor.every(Number.isFinite));
      assert(frame.hulls.every(h => h.position.every(Number.isFinite)));
    }
    assert.equal(JSON.stringify(s), before);
  }
});
