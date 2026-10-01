import test from 'node:test';
import assert from 'node:assert/strict';
import {watchFrame, battleInstances, battleWatchView, attritionView} from '../ui/battle-watch.mjs';

const losses = {sunk:0, planesLost:0, sailorsLost:0, aviatorsLost:0};
const group = (id, count, sunk = 0) => ({id, classId:'queen_elizabeth', name:'Group ' + id, type:'BB', count, sunk, health:.7});
const frame = (at, groupsA = [group('a',3)], groupsB = [group('b',2)]) => ({at, stage:3, round:1, label:'Main action', status:'ongoing', groupsA, groupsB, lossesA:losses, lossesB:losses, deltaA:losses, deltaB:losses});
const report = () => ({id:1,a:'GBR',b:'JPN',startedAt:100,status:'ongoing',replay:{frames:[frame(100),frame(115,[group('a',3,2)])]}});

test('battle heading preserves recorded round totals without appending a duplicate round', () => {
  const r = report();
  for (const round of [1,2]) {
    const label = 'Main engagement · round ' + round + ' / 2';
    Object.assign(r.replay.frames.at(-1),{label,round});
    assert.equal(battleWatchView(r,'campaign_1922').match(/<h3>(.*?)<\/h3>/)[1],label);
  }
  r.replay.frames.at(-1).label = 'Main action';
  assert.match(battleWatchView(r,'campaign_1922'),/<h3>Main action · round 2<\/h3>/,'Older stage-only labels retain their round number');
  Object.assign(r.replay.frames.at(-1),{stage:2,label:'Opening exchange'});
  assert.match(battleWatchView(r,'campaign_1922'),/<h3>Opening exchange<\/h3>/);
});

test('battle frames clamp playback indices and never invent a chronology for older reports', () => {
  const r = report();
  assert.equal(watchFrame(r).frame.at,115);
  assert.equal(watchFrame(r,0).frame.at,100);
  assert.equal(watchFrame(r,-4).index,0);
  assert.equal(watchFrame(r,99).index,1);
  assert.equal(watchFrame(r,.8).index,0);
  assert.equal(watchFrame(r,NaN).index,1);
  const old = {minute:100,completedAt:170,status:'completed',resultA:{conditions:[group('a',3,2)]},resultB:{conditions:[]}};
  const summary = watchFrame(old);
  assert.equal(summary.recorded,false);
  assert.equal(summary.count,0);
  assert.equal(summary.frame.at,170);
  assert.equal(summary.frame.groupsA[0].sunk,2);
});

test('battle formation retains every original hull and stable selection identities after sinking', () => {
  const r = report(), before = structuredClone(r);
  const initial = battleInstances(r.replay.frames[0],r.startedAt), after = battleInstances(r.replay.frames[1],r.startedAt);
  assert.equal(initial.length,5);
  assert.equal(after.length,5);
  assert.deepEqual(after.map(u => u.key),initial.map(u => u.key));
  assert.deepEqual(after.filter(u => u.side === 'A').map(u => u.sunkHull),[false,true,true]);
  assert.equal(new Set(after.map(u => u.key)).size,after.length);
  assert(after.every(u => u.positionMetres.every(Number.isFinite)));
  assert(after.filter(u => u.side === 'A').every(u => u.heading === 0));
  assert(after.filter(u => u.side === 'B').every(u => u.heading === Math.PI));
  assert.deepEqual(r,before,'Rendering must never mutate recorded combat state');
  const html = battleWatchView(r,'campaign_1922',{selected:{side:'A',id:'a',hullIndex:2}});
  assert.match(html,/SUNK/);
  assert.match(html,/1 hulls remain afloat/);
  assert.match(html,/hull 3 \/ 3/);
});

test('live and archived playback controls distinguish campaign advancement from recorded ticks', () => {
  const r = report();
  const atStart = battleWatchView(r,'campaign_1922',{frameIndex:0});
  assert.match(atStart,/Next recorded tick/);
  assert.doesNotMatch(atStart,/LIVE · CAMPAIGN PAUSED/);
  const live = battleWatchView(r,'campaign_1922');
  assert.match(live,/Next tick · 15 min/);
  assert.match(live,/LIVE · CAMPAIGN PAUSED/);
  r.status = 'completed';
  assert.match(battleWatchView(r,'campaign_1922'),/data-action="battle-next" disabled/);
  r.replay = {frames:[],archived:true};
  assert.match(battleWatchView(r,'campaign_1922'),/SUMMARY ONLY/);
  assert.match(battleWatchView(r,'campaign_1922'),/data-action="battle-next" disabled/);
  assert.doesNotMatch(battleWatchView(r,'campaign_1922'),/Net loss change this tick/);
});

test('battle inspections distinguish pending artwork, detailed models and load errors without inferring from roster identity', () => {
  const r = report(), selected = {side:'A',id:'a',hullIndex:0};
  const before = structuredClone(r);
  const pending = battleWatchView(r,'campaign_1922',{selected:{...selected,visualStatus:'pending-art'}});
  assert.match(pending,/3D artwork pending\. An amber \? navigation symbol marks this hull; no ship model is displayed/);
  assert.doesNotMatch(pending,/Detailed 3D model displayed/);
  const loaded = battleWatchView(r,'campaign_1922',{selected:{...selected,visualStatus:'detailed-model'}});
  assert.match(loaded,/Detailed 3D model displayed/);
  const failed = battleWatchView(r,'campaign_1922',{selected:{...selected,visualStatus:'model-error'}});
  assert.match(failed,/3D model could not load\. A red ! navigation symbol/);
  const retained = battleWatchView(r,'campaign_1922',{selected:{...selected,visualStatus:'model-error',detailedModel:true}});
  assert.match(retained,/last valid version remains displayed/);
  assert.doesNotMatch(retained,/A red ! navigation symbol marks this hull/);
  const roster = battleWatchView(r,'campaign_1922',{selected});
  assert.match(roster,/Amber \? diamonds mark ships with 3D artwork pending/);
  assert.doesNotMatch(roster,/native-art-status|Detailed 3D model displayed/);
  assert.deepEqual(r,before,'artwork notices do not alter recorded ship state');
});

test('air and shore actions tolerate no ships on one or both sides without phantom hulls or selection', () => {
  const r = report(); r.airOperation = {strikes:36,escorts:12}; r.portId = 'example_port';
  r.replay.frames = [frame(100,[],[])];
  r.replay.frames[0].aircraftA = [{model:'recorded_striker',role:'strike',count:28,crewed:27},{model:'recorded_fighter',role:'fighter',count:12,crewed:12}];
  assert.deepEqual(battleInstances(r.replay.frames[0]),[]);
  assert.match(battleWatchView(r,'campaign_1922'),/Recorded air wing: 40 aircraft · 39 crewed/);
  assert.match(battleWatchView(r,'campaign_1922'),/recorded striker · strike/);
  assert.doesNotMatch(battleWatchView(r,'campaign_1922'),/36 strike aircraft/);
  assert.match(battleWatchView(r,'campaign_1922'),/Shore defenses \/ no ships recorded/);
  r.replay.frames[0].groupsA = [group('empty',0)];
  const html = battleWatchView(r,'campaign_1922',{selected:{side:'A',id:'empty',hullIndex:0}});
  assert.doesNotMatch(html,/battle-ship-inspection/);
  assert.doesNotMatch(html,/hull 0/);
});

test('recorded loss ledger shows cumulative surviving damage and signed changes without calling sinks repairs', () => {
  const r = report();
  r.replay.frames[1].lossesA = {...losses,sunk:1,damaged:2,damagedTons:4300};
  r.replay.frames[1].deltaA = {...losses,sunk:1,damaged:-1,damagedTons:-700};
  const html = battleWatchView(r,'campaign_1922');
  assert.match(html,/surviving damaged ships: 2 hulls · 4,300 equivalent tons/);
  assert.match(html,/Net loss change this tick: \+1 ships/);
  assert.match(html,/Surviving damage change: -1 hulls · -700 equivalent tons/);
  assert.match(html,/This can fall when damaged ships sink/);
});

test('attrition ledger filters other wars, keeps correct player-side losses and escapes row labels', () => {
  const row = {month:'1936-01',a:'GBR',b:'JPN',region:'pacific',updatedAt:115,encounters:3,kinds:{surface:2,air:1},sides:{GBR:{sunk:2,merchantHulls:4,merchantGRT:12000},JPN:{sunk:7,merchantHulls:1,merchantGRT:3000}}};
  const state = {player:'JPN',attritionLedger:[row,{...row,a:'USA',b:'ITA',month:'DO NOT DISPLAY'}],backgroundEngagements:[{a:'JPN',b:'GBR'},{a:'USA',b:'ITA'}]};
  const before = structuredClone(state),html = attritionView(state);
  assert.doesNotMatch(html,/DO NOT DISPLAY/);
  assert.match(html,/1 actions resolving/);
  assert.match(html,/7 ships/);
  assert.match(html,/2 ships/);
  assert.match(html,/1 hulls<small>3,000 GRT/);
  assert.deepEqual(state,before);
  state.attritionLedger[0].month = '<script>bad</script>';
  assert.doesNotMatch(attritionView(state),/<script>/);
});
