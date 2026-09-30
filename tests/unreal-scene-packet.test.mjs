import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame } from '../mechanics/engine.mjs';
import { fleetPosition, visibleContacts } from '../mechanics/task-forces.mjs';
import { campaignMinutes, setCampaignMinutes } from '../mechanics/campaign-clock.mjs';
import { routeLength, distanceNm, interpolate, PORTS, NODES, PORT_LOCATIONS, MAP_CAPITALS } from '../mechanics/world.mjs';
import { fleetCourse, ownFormationScene, geographicOffset, formationAt } from '../ui/fleet-formation.mjs';
import { buildUnrealScenePacket, sampleObservedNavigation } from '../ui/unreal-scene-packet.mjs';

const classes = { bb: { type: 'BB', dimensions: { length_m: 200, beam_m: 30 } },
  dd: { type: 'DD', dimensions: { length_m: 100, beam_m: 12 } } };
const force = (route, extra = {}) => ({ id: 'fleet', name: 'First Fleet', speed: 30, departAt: 0,
  arriveAt: routeLength(route) / 30 * 60, route, ...extra });
const fixture = (fleet, minute = 0) => {
  const s = { player: 'USA', campaignId: 'fixture', paused: false, day: 0, fraction: 0, seed: 17, operationsSeed: 19,
    nations: { USA: { fleets: [fleet], groups: [
      { id: 'heavy', classId: 'bb', name: 'Heavy', count: 1, status: 'active', service: 'warship', fleetId: fleet.id },
      { id: 'screen', classId: 'dd', name: 'Screen', count: 4, status: 'active', service: 'warship', fleetId: fleet.id },
    ], convoys: [], contacts: [] } }, world: { control: { TEST: 'USA' }, portControl: { saigon: 'USA' } } };
  setCampaignMinutes(s, minute); return s;
};
const nearPoint = (a, b, epsilon = 1e-8) => {
  assert(Math.abs(((a[0] - b[0] + 540) % 360) - 180) < epsilon, `Longitude ${a[0]} != ${b[0]}`);
  assert(Math.abs(a[1] - b[1]) < epsilon, `Latitude ${a[1]} != ${b[1]}`);
};

test('native scene packet exposes compact own hulls, public ports and observed contacts without foreign truth or save mutation', () => {
  const s = fixture(force([[0, 0], [4, 0]]), 100);
  s.nations.USA.contacts = [{ id: 'seen-fleet', nation: 'JPN', position: [170, 15], seenAt: 80,
    estimate: 7, kind: 'Surface formation', source: 'Scouting', baseConfidence: .98, baseUncertainty: 8 },
    { id: 'expired', nation: 'JPN', position: [171, 15], seenAt: -11000, estimate: 2, baseConfidence: .5, baseUncertainty: 100 }];
  const before = JSON.stringify(s);
  Object.defineProperty(s.nations, 'JPN', { get() { throw Error('Must not inspect hidden ships'); } });
  const packet = buildUnrealScenePacket(s, { classes });
  assert.equal(packet.format, 1); assert.equal(packet.at, 100); assert.equal(packet.player, 'USA');
  assert.equal(packet.forces.length, 1); assert.equal(packet.forces[0].hulls.length, 5);
  assert.equal(packet.contacts.length, 1); assert.equal(packet.contacts[0].id, 'seen-fleet');
  assert.deepEqual(packet.contacts[0].position, visibleContacts(s)[0].position);
  assert(!('hulls' in packet.contacts[0]) && !('heading' in packet.contacts[0]), 'an observation does not reveal classes or present course');
  assert.equal(packet.ports.length, Object.keys(PORTS).length);
  assert.equal(packet.ports.find(p => p.id === 'saigon').owner, 'USA');
  assert.deepEqual(packet.ports.find(p => p.id === 'saigon').position, PORT_LOCATIONS.saigon || NODES.saigon);
  assert.deepEqual(packet.control, { TEST: 'USA' });
  const encoded = JSON.stringify(packet);
  assert(!encoded.includes('operationsSeed') && !encoded.includes('camera') && !encoded.includes('paid'));
  assert.equal(JSON.stringify(s), before);
  packet.control.TEST = 'JPN'; packet.ports[0].position[0] = 999;
  assert.deepEqual(s.world.control, { TEST: 'USA' });
});

test('native navigation includes each real waypoint and reproduces high-latitude/dateline routes between received states', () => {
  const f = force([[178, 65], [-177, 65], [-177, 69], [-171, 71]]);
  const previous = fixture(f, 10), previousRows = ownFormationScene(previous, { classes });
  const now = fixture(structuredClone(f), f.arriveAt + 20), before = JSON.stringify(now);
  const rows = ownFormationScene(now, { classes }, previousRows);
  const packet = buildUnrealScenePacket(now, { classes }, previousRows, { rows });
  const rendered = packet.forces[0], navigation = rendered.navigation;
  assert.equal(navigation.fromAt, 10); assert.equal(navigation.toAt, campaignMinutes(now));
  assert(navigation.segments.length >= 4, 'turns and arrival split the interval');
  const firstTurn = distanceNm(f.route[0], f.route[1]) / f.speed * 60;
  assert(navigation.segments.some(segment => Math.abs(segment.toAt - firstTurn) < 1e-8));
  for (let i = 0; i <= 200; i++) {
    const at = 10 + (campaignMinutes(now) - 10) * i / 200;
    const sample = sampleObservedNavigation(rendered, at), actual = fleetPosition(now, f, at);
    nearPoint(sample.position, actual);
    const course = fleetCourse(now, f, at);
    assert(Math.abs(sample.heading - course.heading) < 1e-8);
    assert.equal(sample.moving, course.moving);
    const sin = Math.sin(sample.heading * Math.PI / 180), cos = Math.cos(sample.heading * Math.PI / 180);
    const exact = formationAt(now, rows[0], at);
    for (const [index, hull] of rendered.hulls.entries()) {
      const [starboard, forward] = hull.stationMeters;
      nearPoint(geographicOffset(sample.position, starboard * cos + forward * sin, forward * cos - starboard * sin), exact.hulls[index].position);
    }
  }
  const cornerTime = navigation.segments[1].fromAt + (navigation.segments[1].toAt - navigation.segments[1].fromAt) * .6;
  const chord = interpolate(fleetPosition(now, f, 10), fleetPosition(now, f, campaignMinutes(now)), (cornerTime - 10) / (campaignMinutes(now) - 10));
  assert(distanceNm(chord, sampleObservedNavigation(rendered, cornerTime).position) > 10, 'test would catch a shortcut chord through the turn');
  nearPoint(sampleObservedNavigation(rendered, campaignMinutes(now) + 10000).position, rendered.position);
  assert.equal(JSON.stringify(now), before);
});

test('new orders interpolate the previous route only until the actual new departure instant', () => {
  const old = force([[0, 0], [4, 0]]), previous = fixture(old, 30);
  const rows = ownFormationScene(previous, { classes });
  const switchAt = 100, switchPosition = fleetPosition(previous, old, switchAt);
  const latest = force([switchPosition, [switchPosition[0], 3]], { departAt: switchAt });
  latest.arriveAt += switchAt;
  const now = fixture(latest, 160), packet = buildUnrealScenePacket(now, { classes }, rows);
  assert(packet.forces[0].navigation.segments.some(segment => segment.toAt === switchAt));
  for (const at of [30, 60, 99, 100, 101, 140, 160]) {
    nearPoint(sampleObservedNavigation(packet.forces[0], at).position, fleetPosition(now, at < switchAt ? old : latest, at));
  }
});

test('paused, resumed, new, time-reversed and different-campaign packets never invent an interpolation history', () => {
  const previous = fixture(force([[0, 0], [4, 0]]), 30), rows = ownFormationScene(previous, { classes });
  for (const change of [s => { s.paused = true; }, s => setCampaignMinutes(s, 20), s => { s.campaignId = 'other'; },
    s => { s.nations.USA.fleets[0].id = 'new'; s.nations.USA.groups.forEach(g => { g.fleetId = 'new'; }); }]) {
    const now = fixture(structuredClone(previous.nations.USA.fleets[0]), 60); change(now);
    const nav = buildUnrealScenePacket(now, { classes }, rows).forces[0].navigation;
    assert.equal(nav.fromAt, nav.toAt); assert.deepEqual(nav.segments, []);
  }
  previous.paused = true;
  const resumedRows = ownFormationScene(previous, { classes });
  const now = fixture(structuredClone(previous.nations.USA.fleets[0]), 60);
  assert.deepEqual(buildUnrealScenePacket(now, { classes }, resumedRows).forces[0].navigation.segments, []);
});

test('unlocated orphan hulls stay explicit and merchant packets contain real voyage hulls without invented crew or weapon data', () => {
  const s = fixture(force([[0, 0], [4, 0]]), 100);
  s.nations.USA.groups.push({ id: 'orphan', classId: 'dd', count: 1, status: 'active', service: 'warship', atSea: true });
  s.nations.USA.convoys.push({ ...force([[179, 10], [-177, 10]]), id: 'convoy', count: 9, leg: 'outbound' });
  const packet = buildUnrealScenePacket(s, { classes });
  const missing = packet.forces.find(f => f.unlocated);
  assert.equal(missing.position, null); assert.equal(missing.hulls.length, 1); assert.deepEqual(missing.navigation.segments, []);
  const convoy = packet.forces.find(f => f.merchant);
  assert.equal(convoy.hulls.length, 9); assert(convoy.hulls.every(h => h.type === 'AK'));
  assert(!JSON.stringify(convoy).includes('crew') && !JSON.stringify(convoy).includes('torpedo'));
});

test('public country/front picks and the selected own remaining route retain current chart semantics', () => {
  const s = fixture(force([[179, 20], [-175, 20], [-175, 25]]), 100);
  s.world.fronts = [{ id: 'active', name: 'Known front', from: [0, 0], to: [2, 2], progress: .25 },
    { id: 'finished', from: [0, 0], to: [2, 2], progress: 1 }];
  const packet = buildUnrealScenePacket(s, { classes }, [], { selectedForceId: 'fleet' });
  assert.equal(packet.countries.length, Object.keys(MAP_CAPITALS).length);
  assert.deepEqual(packet.fronts, [{ id: 'active', name: 'Known front', position: [.5, .5] }]);
  assert.equal(packet.route.forceId, 'fleet');
  assert.deepEqual(packet.route.points[0], fleetPosition(s, s.nations.USA.fleets[0]));
  assert.deepEqual(packet.route.points.at(-1), [-175, 25]);
  assert.equal(buildUnrealScenePacket(s, { classes }, [], { selectedForceId: 'hidden-enemy' }).route, null);
  setCampaignMinutes(s, s.nations.USA.fleets[0].arriveAt + 1);
  assert.equal(buildUnrealScenePacket(s, { classes }, [], { selectedForceId: 'fleet' }).route, null);
});

test('both campaigns produce finite, bounded, JSON-only native packets for every own navy', () => {
  for (const campaign of Object.keys(CATALOG.campaigns)) for (const nation of Object.keys(CATALOG.campaigns[campaign].nations)) {
    const s = newGame(CATALOG, nation, 3902, campaign), before = JSON.stringify(s);
    const packet = buildUnrealScenePacket(s, CATALOG), encoded = JSON.stringify(packet);
    const roundTrip = JSON.parse(encoded);
    assert(!encoded.includes('NaN') && !encoded.includes('Infinity'));
    assert(encoded.length < 1500000, `${campaign}/${nation} scene packet is bounded`);
    assert.equal(roundTrip.forces.reduce((sum, f) => sum + f.hulls.length, 0), ownFormationScene(s, CATALOG).reduce((sum, r) => sum + r.hulls.length, 0));
    assert(packet.forces.every(f => f.position.every(Number.isFinite)));
    assert.equal(JSON.stringify(s), before);
  }
});
