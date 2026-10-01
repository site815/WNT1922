import test from 'node:test';
import assert from 'node:assert/strict';
import { battleVisualEvents } from '../ui/battle-events.mjs';
import { unrealBattlePacket } from '../ui/unreal-scene.mjs';
import { battleWatchView } from '../ui/battle-watch.mjs';

const group = (id, count = 1, sunk = 0, health = 1) => ({id,classId:'queen_elizabeth',name:id,type:'BB',count,sunk,health});
const fixture = () => ({id:42,a:'GBR',b:'JPN',startedAt:100,status:'ongoing',replay:{frames:[
  {at:100,stage:3,round:1,status:'ongoing',label:'Main action',groupsA:[group('a')],groupsB:[group('b',3)]},
  {at:115,stage:3,round:1,status:'ongoing',label:'Main action',groupsA:[group('a',1,0,.8)],groupsB:[group('b',3,2,.4)],exchange:{kind:'surface',sides:['A','B']}},
]}});

test('deterministic native effects illustrate recorded exchanges and exactly the newly lost hull identities', () => {
  const report = fixture(), original = structuredClone(report), frame = report.replay.frames[1];
  const events = battleVisualEvents(report,frame,1);
  assert.deepEqual(events,battleVisualEvents(report,frame,1));
  assert.deepEqual(report,original);
  assert.equal(events.filter(e => e.type === 'salvo').length,2);
  assert.equal(events.filter(e => e.type === 'hit').length,2);
  assert.deepEqual(events.filter(e => e.type === 'sink').map(e => e.targetKey).sort(),['B:b:1','B:b:2']);
  assert.equal(new Set(events.map(e => e.key)).size,events.length);
  const packet = unrealBattlePacket(report,'campaign_1922',1,null);
  assert.deepEqual(packet.events,events); assert.equal(packet.durationSeconds,15);
  assert.equal(packet.eventKey,unrealBattlePacket(report,'campaign_1922',1,packet.units[0]).eventKey,'Selection does not restart effects');
  const keys = new Set(packet.units.map(unit => unit.key));
  assert(events.every(event => keys.has(event.targetKey) && (!event.sourceKey || keys.has(event.sourceKey))));
  assert(events.every(event => event.time >= 0 && event.time + event.duration <= 15));
});

test('quiet ticks, first frames, missing recordings and truncated gaps do not manufacture combat effects', () => {
  const report = fixture();
  assert.deepEqual(battleVisualEvents(report,report.replay.frames[0],0),[]);
  delete report.replay.frames[1].exchange;
  assert.equal(battleVisualEvents(report,report.replay.frames[1],1).filter(e => e.type === 'salvo').length,0,'Old records retain losses without inventing shots');
  const quiet = structuredClone(report.replay.frames[1]); quiet.at = 130; report.replay.frames.push(quiet);
  assert.deepEqual(battleVisualEvents(report,quiet,2),[]);
  quiet.at = 145; quiet.groupsB[0].sunk = 3;
  assert.deepEqual(battleVisualEvents(report,quiet,2),[],'A missing intermediate tick cannot supply the timing of an observed loss');
  const old = {id:99,status:'completed',minute:10,resultA:{conditions:[group('old',1,1,0)]},resultB:{conditions:[]}};
  assert.deepEqual(unrealBattlePacket(old,'campaign_1922',null,null).events,[]);
});

test('air attacks use no phantom launching ship and old sinks never animate again on the next attack', () => {
  const report = fixture(); report.replay.frames[0].groupsA = [];
  const frame = report.replay.frames[1]; frame.groupsA = []; frame.exchange = {kind:'air',sides:['A']};
  const events = battleVisualEvents(report,frame,1), salvo = events.find(e => e.type === 'salvo');
  assert.equal(salvo.sourceKey,''); assert.equal(salvo.weapon,'air');
  const next = structuredClone(frame); next.at = 130; next.groupsB[0].health = .3; report.replay.frames.push(next);
  assert.equal(battleVisualEvents(report,next,2).filter(e => e.type === 'sink').length,0);
  assert.equal(battleVisualEvents(report,next,2).filter(e => e.type === 'hit').length,1);
});

test('the battle viewer labels continuous Tactical play and exact manual stepping separately', () => {
  const report = fixture();
  assert.match(battleWatchView(report,'campaign_1922'),/Play battle · 60×/);
  const running = battleWatchView(report,'campaign_1922',{paused:false});
  assert.match(running,/LIVE · TACTICAL 60×/); assert.match(running,/Pause battle/);
  assert.match(running,/Next tick · 15 min/);
  assert.doesNotMatch(battleWatchView(report,'campaign_1922',{frameIndex:0}),/data-action="battle-play"/);
});
