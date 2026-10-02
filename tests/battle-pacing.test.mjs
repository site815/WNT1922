import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { beginEngagement, progressEngagements } from '../mechanics/engagements.mjs';
import { applyCommand } from '../mechanics/game-actions.mjs';
import { campaignMinutes, setCampaignMinutes } from '../mechanics/campaign-clock.mjs';
import { BATTLE_SPEED } from '../mechanics/battle-pacing.mjs';
import { SimulationRunner } from '../worker/simulation-runner.mjs';
import { validateSave, exportSave } from '../mechanics/state-io.mjs';

function fixture(player = 'USA', role = 'battle') {
  const state = newGame(CATALOG,player,420042,'in_good_faith_1936');
  state.decisions = []; state.autoPause = false; state.paused = false; state.speed = 100;
  Object.assign(state.relations['JPN-USA'],{war:true,allied:false,warSince:state.day});
  const content = contentFor(CATALOG,state);
  const [a,b] = ['USA','JPN'].map(id => state.nations[id].fleets.find(f => f.role === role));
  return {state,content,begin:() => beginEngagement(state,content,{kind:'surface',a:'USA',b:'JPN',fleetA:a.id,fleetB:b.id,region:'pacific',position:[160,20]})};
}

test('a new own decisive battle pauses at Tactical regardless of Autopause and cancels dispatch autoresume', () => {
  for (const alreadyPaused of [false,true]) {
    const f = fixture(); f.state.paused = alreadyPaused; f.state.resumeAfterDecision = true;
    const report = f.begin();
    assert.equal(report.decisive.qualifies,true);
    assert.equal(f.state.paused,true); assert.equal(f.state.speed,BATTLE_SPEED);
    assert.equal(f.state.resumeAfterDecision,undefined);
    assert(f.state.alerts.some(alert => alert.reportId === report.id && alert.ongoing));
    assert.equal(f.begin(),null,'The existing fleet contact cannot create another pause/alert');
    assert.equal(f.state.alerts.filter(alert => alert.reportId === report.id).length,1);
  }
});

test('foreign decisive actions and own minor actions neither pause nor change selected speed', () => {
  for (const [player,role] of [['GBR','battle'],['USA','submarine']]) {
    const f = fixture(player,role), report = f.begin();
    assert(report);
    assert.equal(f.state.paused,false); assert.equal(f.state.speed,100);
    assert.equal(report.decisive.qualifies,role === 'battle');
  }
});

test('explicit resume uses real 15-second tactical ticks and command/load replacement does not re-pause', () => {
  const f = fixture(), report = f.begin(), before = campaignMinutes(f.state), ticks = f.state.minuteTicks || 0;
  let now = 0;
  const runner = new SimulationRunner(CATALOG,{now:() => now}); runner.replace(f.state);
  applyCommand(f.state,CATALOG,{type:'pause',args:{value:false}});
  runner.replace(f.state);
  assert.equal(f.state.paused,false); assert.equal(f.state.speed,BATTLE_SPEED);
  for (now = 100; now < 15000; now += 100) runner.advance();
  assert.equal(campaignMinutes(f.state),before);
  runner.advance();
  assert.equal(campaignMinutes(f.state),before + 15); assert.equal(f.state.minuteTicks,ticks + 1);
  assert.equal(f.state.paused,false,'Observed progression does not repeatedly pause an acknowledged contact');
  const reply = applyCommand(f.state,CATALOG,{type:'speed',args:{value:100}});
  assert.match(reply.receipt,/Tactical/); assert.equal(f.state.speed,BATTLE_SPEED);
  const existing = structuredClone(f.state); existing.speed = 100;
  runner.replace(existing);
  assert.equal(existing.paused,false); assert.equal(existing.speed,BATTLE_SPEED);
  const loaded = validateSave(JSON.parse(exportSave(f.state)),CATALOG);
  assert.equal(loaded.paused,true); assert.equal(loaded.reports[0].id,report.id);
  runner.replace(loaded); assert.equal(loaded.paused,true);
  applyCommand(loaded,CATALOG,{type:'pause',args:{value:false}});
  runner.replace(loaded); assert.equal(loaded.paused,false);
});

test('completion never resumes a manual pause or silently accelerates, and later speed choices are allowed', () => {
  const f = fixture(), report = f.begin();
  applyCommand(f.state,CATALOG,{type:'pause',args:{value:true}});
  let recordedDamage=0;
  for (let i = 0; i < 128 && report.status === 'ongoing'; i++) {
    setCampaignMinutes(f.state,campaignMinutes(f.state) + 15); progressEngagements(f.state,f.content);
    const current=Object.values(f.state.relations['JPN-USA'].record?.sides||{}).reduce((n,side)=>n+side.damage,0);
    assert(current>=recordedDamage,'Sinking a damaged hull must not subtract previously inflicted damage from the war ledger');recordedDamage=current;
  }
  assert.equal(report.status,'completed'); assert.equal(f.state.paused,true); assert.equal(f.state.speed,BATTLE_SPEED);
  applyCommand(f.state,CATALOG,{type:'speed',args:{value:1}});
  assert.equal(f.state.speed,1); assert.equal(f.state.paused,true);
  const frames = report.replay.frames;
  const resolved = frames.filter(frame => frame.exchange);
  assert(resolved.length > 0);
  assert(resolved.every(frame => frame.exchange.kind === 'surface' && frame.exchange.sides.join() === 'A,B'));
  assert(frames.every(frame => Number.isFinite(frame.tacticalSeconds)),'Each observed campaign frame identifies its actual tactical time');
  assert(report.tactical.history.events.some(event => event.kind === 'salvo'),'Attacks come from individual timed weapon events');
  const loaded = validateSave(JSON.parse(exportSave(f.state)),CATALOG);
  assert.deepEqual(loaded.reports[0].replay,report.replay);
  const bad = structuredClone(f.state); bad.reports[0].replay.frames.find(frame => frame.exchange).exchange.sides = ['A','A'];
  assert.throws(() => validateSave(bad,CATALOG),/compatible/);
});
