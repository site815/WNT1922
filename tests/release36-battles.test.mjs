import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { readDocument } from '../worker/documents.mjs';
import { newGame, scrapGroup, reserveGroup } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { campaignMinutes, setCampaignMinutes } from '../mechanics/campaign-clock.mjs';
import { beginEngagement, progressEngagements } from '../mechanics/engagements.mjs';
import { decisiveAssessment, recordBackgroundAttrition, recordAttritionRecovery, recordBattleFrame,
  REPLAY_FRAME_LIMIT, REPLAY_REPORT_LIMIT, REPLAY_CHARACTER_BUDGET, pruneAttritionLedger } from '../mechanics/battle-records.mjs';
import { applyCommand } from '../mechanics/game-actions.mjs';
import { minuteAirOperations } from '../mechanics/air-operations.mjs';
import { simulationHost } from '../worker/simulation-host.mjs';
import { bulkPlan } from '../mechanics/bulk-fleet.mjs';
import { initializeOperations } from '../mechanics/task-forces.mjs';
import { validateSave, exportSave } from '../mechanics/state-io.mjs';
const rules = (await readDocument('common/rules/battle-stages.md')).DECISIVE;
const start = () => {
  const s = newGame(CATALOG, 'USA', 360036, 'in_good_faith_1936');
  s.decisions = []; s.autoPause = false; s.paused = false;
  Object.assign(s.relations['JPN-USA'], { war: true, allied: false, warSince: s.day });
  return [s, contentFor(CATALOG, s)];
};
const engage = (s, c, role = 'battle') => {
  const forces = ['USA', 'JPN'].map(id => s.nations[id].fleets.find(f => f.role === role));
  for (const f of forces) f.aggressiveBattle = true;
  return beginEngagement(s, c, { kind: 'surface', a: 'USA', b: 'JPN', fleetA: forces[0].id, fleetB: forces[1].id, region: 'pacific', position: [160, 20] });
};
const finish = (s, c, r) => {
  for (let i = 0; i < 128 && r.status === 'ongoing'; i++) {
    setCampaignMinutes(s, campaignMinutes(s) + 15); progressEngagements(s, c);
  }
  assert.equal(r.status, 'completed');
};

test('decisive rules use real opposing warship strength, attacked capitals and crewed strikes', () => {
  const c = { classes: {
    capital: { type: 'BB', tons: 35000 }, destroyer: { type: 'DD', tons: 1000 }, cruiser: { type: 'CA', tons: 10000 },
    auxiliary: { type: 'AO', tons: 20000 }, carrier: { type: 'CV', tons: 25000 }, submarine: { type: 'SS', tons: 1000 },
  } };
  const group = (classId, count = 1) => ({ classId, count });
  const assess = (a, b, order = { kind: 'surface' }, sortie) => decisiveAssessment(c, order, a, b, sortie, rules);
  assert.equal(assess([group('capital')], [group('destroyer', 4)]).qualifies, false);
  assert.equal(assess([group('capital')], [group('destroyer', 5)]).code, 'capital-action');
  assert.equal(assess([group('capital')], [group('auxiliary')]).qualifies, false);
  assert.equal(assess([group('cruiser', 2)], [group('cruiser', 3)]).qualifies, false);
  assert.equal(assess([group('cruiser', 2)], [group('cruiser', 4)]).code, 'large-surface-action');
  assert.equal(assess([group('submarine', 40)], [group('submarine', 40)]).qualifies, false);
  const strike = count => ({ targetKind: 'fleet', airWing: [{ role: 'strike', count: 40, crewed: count }] });
  assert.equal(assess([], [group('carrier')], { kind: 'air' }, strike(23)).qualifies, false);
  assert.equal(assess([], [group('carrier')], { kind: 'air' }, strike(24)).code, 'capital-air-attack');
  assert.equal(assess([], [group('cruiser', 5)], { kind: 'air' }, strike(40)).qualifies, false);
  for (const order of [{ kind: 'convoy' }, { kind: 'port', operation: 'shore' }, { kind: 'air', operation: 'strategic' }])
    assert.equal(assess([group('capital')], [group('carrier')], order, strike(40)).qualifies, false);
  assert.equal(assess([group('capital')], [], { kind: 'port', operation: 'anchorage' }).qualifies, false);
});

test('contact qualification excludes undelivered reinforcements and supports the regional combat API', () => {
  const [s, c] = start();
  for (const id of ['USA', 'JPN']) {
    const f = s.nations[id].fleets.find(f => f.role === 'battle');
    for (const g of s.nations[id].groups.filter(g => g.fleetId === f.id)) g.joinAt = campaignMinutes(s) + 1440;
  }
  const empty = engage(s, c);
  assert.equal(empty.decisive.qualifies, false); assert.equal(empty.resultA.engaged, 0); assert.equal(empty.resultB.engaged, 0);
  const [regional, rc] = start();
  const report = beginEngagement(regional, rc, { kind: 'surface', a: 'USA', b: 'JPN', region: 'pacific' });
  assert.equal(report.decisive.qualifies, true);
  assert.ok(report.decisive.capitalShipsA > 0 && report.decisive.capitalShipsB > 0);
  assert.ok(report.replay.frames[0].groupsA.length > 0 && report.replay.frames[0].groupsB.length > 0);
});

test('air-raid targets cannot be scrapped, reserved or split into apparent combat losses while the engagement is active', () => {
  for (const strikes of [1, 24]) {
    const [s, c] = start(), attacker = s.nations.JPN;
    attacker.airSorties.push({ id: 'air-target-lock', sourcePort: 'yokosuka', strikes, escorts: 0, assembly: 1,
      outboundKm: 100, targetKind: 'port', airWing: [{ model: 'fixture', role: 'strike', count: strikes, crewed: strikes }] });
    const r = beginEngagement(s, c, { kind: 'air', a: 'JPN', b: 'USA', port: 'norfolk', operation: 'anchorage', opId: 'air-target-lock' });
    assert.equal(r.decisive.qualifies, strikes === 24);
    const target = s.nations.USA.groups.find(g => r.resultB.conditions.some(row => row.id === g.id));
    const before = JSON.stringify(target);
    assert.throws(() => scrapGroup(s, c, target.id), /disengage/);
    assert.throws(() => reserveGroup(s, target.id, c), /disengage/);
    assert.equal(bulkPlan(s, [target.id], 'scrap').hulls, 0);
    assert.equal(bulkPlan(s, [target.id], 'reserve').hulls, 0);
    assert.equal(JSON.stringify(target), before);
    // An aggregate from an older save must keep its recorded identity through
    // initialization; repartitioning it into separate groups is not a sinking.
    target.count = 3;
    const row = r.resultB.conditions.find(row => row.id === target.id); row.count = 3;
    const sourceId = target.id;
    initializeOperations(s, c);
    assert.equal(target.id, sourceId); assert.equal(target.count, 3);
    setCampaignMinutes(s, campaignMinutes(s) + 15); recordBattleFrame(s, r, 'Approach');
    if (r.replay) assert.equal(r.replay.frames.at(-1).groupsB.find(row => row.id === sourceId).sunk, 0);
    r.status = 'completed';
    assert.doesNotThrow(() => reserveGroup(s, target.id, c), 'The administrative lock ends with the action');
  }
});

test('minor combat preserves real staged losses, repairs and war accounting without individual news or retained reports', () => {
  const [s, c] = start(), alerts = s.alerts.length, logs = s.log.length, r = engage(s, c, 'submarine');
  assert.equal(r.background, true); assert.equal(r.decisive.qualifies, false);
  assert.equal(s.reports.length, 0); assert.equal(s.backgroundEngagements.length, 1);
  assert.equal(s.alerts.length, alerts); assert.equal(s.paused, false);
  const clone = structuredClone(s), reference = clone.backgroundEngagements[0];
  reference.background = false; clone.backgroundEngagements = []; clone.reports.push(reference);
  const beforeSave = validateSave(JSON.parse(exportSave(s)), CATALOG);
  assert.equal(beforeSave.backgroundEngagements[0].id, r.id);
  finish(s, c, r); finish(clone, c, reference);
  assert.deepEqual(r.resultA, reference.resultA); assert.deepEqual(r.resultB, reference.resultB);
  for (const id of ['USA', 'JPN']) {
    assert.deepEqual(s.nations[id].groups, clone.nations[id].groups);
    assert.deepEqual(s.nations[id].casualties, clone.nations[id].casualties);
    assert.equal(s.nations[id].sunkTons, clone.nations[id].sunkTons);
    assert.equal(s.nations[id].morale, clone.nations[id].morale);
  }
  assert.deepEqual(s.relations['JPN-USA'].record, clone.relations['JPN-USA'].record);
  assert.ok(r.resultA.damagedTons + r.resultB.damagedTons + r.resultA.tons + r.resultB.tons > 0);
  assert.equal(s.reports.length, 0); assert.equal(s.backgroundEngagements.length, 0);
  assert.equal(s.alerts.length, alerts); assert.equal(s.log.length, logs);
  const row = s.attritionLedger[0];
  assert.equal(row.encounters, 1); assert.equal(row.kinds.surface, 1);
  assert.equal(row.sides.USA.sailorsLost, r.resultA.sailorsLost); assert.equal(row.sides.JPN.tons, r.resultB.tons);
  const recorded = structuredClone(row); progressEngagements(s, c); recordBackgroundAttrition(s, r);
  assert.deepEqual(s.attritionLedger[0], recorded, 'Finishing and progression cannot count a minor action twice');
  validateSave(s, CATALOG);
});

test('watch records observed 15-minute conditions and exact loss deltas through completion and survives save/load', () => {
  const [s, c] = start(), r = engage(s, c), before = campaignMinutes(s);
  assert.equal(r.decisive.qualifies, true); assert.equal(s.paused, false, 'Contact does not auto-pause');
  assert.equal(r.replay.frames.length, 1);
  const initial = structuredClone(r.replay.frames[0]);
  finish(s, c, r);
  assert.deepEqual(r.replay.frames[0], initial, 'Later damage cannot mutate recorded earlier conditions');
  const frames = r.replay.frames;
  assert.equal(frames.at(-1).status, 'completed');
  assert.equal(frames.length, (r.completedAt - before) / 15 + 1);
  for (let i = 1; i < frames.length; i++) assert.equal(frames[i].at - frames[i - 1].at, 15);
  for (const side of ['A', 'B']) {
    assert.equal(frames.reduce((n, f) => n + f['delta' + side].sailorsLost, 0), r['result' + side].sailorsLost);
    for (const group of frames.at(-1)['groups' + side]) {
      const live = s.nations[side === 'A' ? r.a : r.b].groups.find(g => g.id === group.id);
      assert.equal(group.health, live.health); assert.equal(group.count - group.sunk, live.count);
    }
  }
  const loaded = validateSave(JSON.parse(exportSave(s)), CATALOG);
  assert.deepEqual(loaded.reports[0].replay, r.replay);
  const bad = structuredClone(s); bad.reports[0].replay.frames[0].groupsA[0].sunk = 1e9;
  assert.throws(() => validateSave(bad, CATALOG), /compatible/);
});

test('battle-next atomically advances one global tick and remains paused; stale, foreign and pending-decision commands cannot advance', () => {
  const [s, c] = start(), r = engage(s, c), before = campaignMinutes(s), ticks = s.minuteTicks || 0;
  const receipt = applyCommand(s, CATALOG, { type: 'battle-next', args: { reportId: r.id, minutes: 360 } });
  assert.equal(campaignMinutes(s), before + 15); assert.equal(s.minuteTicks, ticks + 1); assert.equal(s.paused, true);
  assert.match(receipt.receipt, /15 minutes/);
  assert.equal(r.replay.frames.at(-1).at, before + 15);
  assert.throws(() => applyCommand(s, CATALOG, { type: 'battle-next', args: { reportId: r.id } }, 'JPN'), /local session/);
  assert.throws(() => applyCommand(s, CATALOG, { type: 'battle-next', args: { reportId: -1 } }), /no longer available/);
  const block = newGame(CATALOG, 'USA', 360036, 'in_good_faith_1936');
  block.autoPause = true; block.paused = true;
  const br = engage(block, contentFor(CATALOG, block)), blockedAt = campaignMinutes(block);
  assert.ok(block.decisions.length);
  assert.throws(() => applyCommand(block, CATALOG, { type: 'battle-next', args: { reportId: br.id } }), /dispatch/);
  assert.equal(campaignMinutes(block), blockedAt); assert.equal(block.paused, true);
});

test('worker battle stepping discards time credit and preserves a blocked cabinet decision transaction', () => {
  const [s, c] = start(), r = engage(s, c), before = campaignMinutes(s), messages = [];
  let time = 0, callback;
  const host = simulationHost({ content: CATALOG, send: m => messages.push(structuredClone(m)), projectSnapshots: false,
    now: () => time, schedule: fn => { callback = fn; return 1; }, cancel: () => {} });
  host.receive({ type: 'initialize', state: s, generation: 1, requestId: 1 });
  host.receive({ type: 'command', command: { type: 'battle-next', args: { reportId: r.id } }, requestId: 2 });
  assert.equal(campaignMinutes(messages.at(-1).state), before + 15);
  assert.equal(messages.at(-1).state.paused, true); assert.equal(messages.at(-1).metrics.queuedMinutes, 0);
  time += 60000; callback();
  assert.equal(campaignMinutes(messages.at(-1).state), before + 15, 'The next worker loop must not resume a watched battle');
  const blocked = newGame(CATALOG, 'USA', 360036, 'in_good_faith_1936'); blocked.autoPause = true; blocked.paused = true;
  const br = engage(blocked, contentFor(CATALOG, blocked)), original = JSON.stringify(blocked);
  host.receive({ type: 'initialize', state: blocked, generation: 2, requestId: 3 });
  host.receive({ type: 'command', command: { type: 'battle-next', args: { reportId: br.id } }, requestId: 4 });
  assert.match(messages.at(-1).commandError, /dispatch/); assert.equal(JSON.stringify(messages.at(-1).state), original);
  host.stop();
});

test('attrition is bilateral and monthly, captures recovery losses, expires after 24 months and older saves get empty optional fields', () => {
  const [s, c] = start(), r = engage(s, c, 'submarine'); finish(s, c, r);
  const row = s.attritionLedger[0], before = row.sides.USA.planesLost;
  recordAttritionRecovery(s, { attritionKey: row.key }, 'USA', { planes: 3, aviators: 2, planesRescued: 0, aviatorsRescued: 1 });
  assert.equal(row.sides.USA.planesLost, before + 3); assert.equal(row.sides.USA.aviatorsLost, r.resultA.aviatorsLost + 2);
  const repeat = structuredClone(r); delete repeat.attritionRecorded; [repeat.a, repeat.b] = [repeat.b, repeat.a];
  [repeat.resultA, repeat.resultB] = [repeat.resultB, repeat.resultA];
  recordBackgroundAttrition(s, repeat); assert.equal(s.attritionLedger.length, 1); assert.equal(row.encounters, 2);
  const old = structuredClone(s); delete old.backgroundEngagements; delete old.attritionLedger;
  assert.deepEqual(validateSave(old, CATALOG).backgroundEngagements, []); assert.deepEqual(validateSave(old, CATALOG).attritionLedger, []);
  setCampaignMinutes(s, Date.parse('1938-01-01T00:00:00Z') / 60000); pruneAttritionLedger(s);
  assert.equal(s.attritionLedger.length, 0);
});

test('a real returning flight adds ditching casualties to its archived minor-action ledger exactly once', () => {
  const [s, c] = start(), r = engage(s, c, 'submarine'); finish(s, c, r);
  const n = s.nations.USA, row = s.attritionLedger[0];
  const source = n.groups.find(g => g.airWing.some(w => w.count >= 4 && w.crewed >= 4));
  const wing = source.airWing.find(w => w.count >= 4 && w.crewed >= 4), now = campaignMinutes(s);
  wing.count -= 4; wing.crewed -= 4;
  const op = { id: 'recovery-ledger-test', fleetId: source.fleetId, targetNation: 'JPN', targetKind: 'fleet',
    targetId: s.nations.JPN.fleets[0].id, phase: 'returning', startedAt: now, readyAt: now, assembly: 1, rangeKm: 0,
    outboundKm: 100, cruise: 300, position: [160, 20], targetPosition: [0, -80], reportId: r.id, attritionKey: row.key,
    airWing: [{ ...wing, count: 4, crewed: 4, homeGroup: source.id }] };
  n.airSorties.push(op); validateSave(s, CATALOG);
  const aircraftBefore = n.aircraft[wing.model], lossesBefore = row.sides.USA.planesLost;
  minuteAirOperations(s, c, () => assert.fail('A returning flight must not attack'));
  assert.equal(op.phase, 'rearming'); assert.equal(n.aircraft[wing.model], aircraftBefore - 4);
  assert.equal(row.sides.USA.planesLost, lossesBefore + 4);
  assert.equal(s.reports.length, 0); assert.equal(s.backgroundEngagements.length, 0);
  setCampaignMinutes(s, op.readyAt); minuteAirOperations(s, c, () => assert.fail('Recovery must not attack'));
  assert.equal(row.sides.USA.planesLost, lossesBefore + 4); assert.equal(n.airSorties.length, 0);
  validateSave(s, CATALOG);
});

test('replays have per-battle and shared save budgets with truthful truncation and archive markers', () => {
  const [s, c] = start(), r = engage(s, c);
  for (let i = 0; i < REPLAY_FRAME_LIMIT + 5; i++) { setCampaignMinutes(s, campaignMinutes(s) + 15); recordBattleFrame(s, r, 'Contact'); }
  assert.ok(r.replay.frames.length <= REPLAY_FRAME_LIMIT); assert.equal(r.replay.truncated, true);
  const final = structuredClone(r); final.status = 'completed';
  for (let i = 0; i < REPLAY_REPORT_LIMIT + 3; i++) { const report = structuredClone(final); report.id += i + 1; s.reports.push(report); }
  setCampaignMinutes(s, campaignMinutes(s) + 15); recordBattleFrame(s, r, 'Contact');
  assert.ok(s.reports.some(report => report.replay.archived && !report.replay.frames.length));
  assert.ok(s.reports.filter(report => report.status === 'completed' && report.replay.frames.length).length <= REPLAY_REPORT_LIMIT);
  assert.ok(s.reports.reduce((sum, report) => sum + JSON.stringify(report.replay.frames).length, 0) <= REPLAY_CHARACTER_BUDGET + 4000);
  const legacy = structuredClone(final); delete legacy.replay; recordBattleFrame(s, legacy, 'Completed');
  assert.equal(legacy.replay, undefined, 'No invented replay for legacy results');
});
