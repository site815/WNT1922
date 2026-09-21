import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame, queueDecision, aiTurn, advanceMinutes } from '../mechanics/engine.mjs';
import { applyCommand } from '../mechanics/game-actions.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { campaignMinutes, setCampaignMinutes } from '../mechanics/campaign-clock.mjs';
import { validateSave } from '../mechanics/state-io.mjs';
import { SPEEDS } from '../mechanics/naval-resources.mjs';
import { SimulationRunner } from '../worker/simulation-runner.mjs';
import { movingMarkerLayout } from '../ui/marker-layout.mjs';
import { politicalPopup } from '../ui/diplomacy-popup.mjs';
const start=(id='USA',campaign='in_good_faith_1936')=>{
  const s=newGame(CATALOG,id,320032,campaign);s.decisions=[];s.paused=false;
  delete s.pauseReason;delete s.resumeAfterDecision;
  return s;
};
const issue=(s,type,args={})=>applyCommand(s,CATALOG,{type,args});
const options=[{id:'pay',label:'Pay',detail:'Pay 100 gold.',gold:100},
  {id:'decline',label:'Decline',detail:'No spending.'}];

test('simulation mode suppresses event pauses and popups, preserves defaults, and permits manually reopened choices',()=>{
  const s=start();assert.equal(s.autoPause,true);
  issue(s,'settings',{autoPause:false});
  queueDecision(s,'sim-choice','A choice','Choose.',options,{deadline:campaignMinutes(s)+15});
  queueDecision(s,'sim-war','War','War begins.',[{id:'acknowledge',label:'OK',detail:'Continue.'}],{kind:'war'});
  assert.equal(s.paused,false);assert.equal(politicalPopup(s),'');
  issue(s,'reopen-decision',{key:'sim-choice'});assert.equal(s.paused,false);
  assert.match(politicalPopup(s),/A choice/);
  issue(s,'pause',{value:true});issue(s,'step',{minutes:15});
  assert.ok(s.completedEvents.includes('sim-choice'));assert.equal(s.paused,true);
  issue(s,'pause',{value:false});assert.equal(s.paused,false);
  validateSave(s,CATALOG);
});

test('disabling autopause resumes only an event-interrupted game',()=>{
  for(const manual of [false,true]){
    const s=start();s.paused=manual;queueDecision(s,'choice','A choice','Choose.',options);
    assert.equal(s.paused,true);issue(s,'settings',{autoPause:false});
    assert.equal(s.paused,manual);assert.equal(politicalPopup(s),'');
  }
});

test('time-step receipts report elapsed time and high speeds stay within a bounded worker slice',()=>{
  const s=start();s.paused=true;
  assert.equal(issue(s,'step',{minutes:15}).receipt,'Time advanced 15 minutes.');
  assert.equal(issue(s,'step',{minutes:360}).receipt,'Time advanced 6 hours.');
  assert.deepEqual(SPEEDS.slice(-2).map(x=>x[0]),[10,100]);
  assert.throws(()=>issue(s,'speed',{value:50}),/Unknown simulation speed/);
  for(const [speed] of SPEEDS){
    issue(s,'speed',{value:speed});issue(s,'settings',{autoPause:false});issue(s,'pause',{value:false});
    let clock=0;const runner=new SimulationRunner(CATALOG,{now:()=>++clock,budgetMs:3});runner.replace(s);
    clock+=1000;const before=campaignMinutes(s),ticks=s.minuteTicks||0;
    let done=runner.advance();clock+=1000;done+=runner.advance();
    assert.ok(done>0&&done<=90);assert.equal(campaignMinutes(s)-before,done);
    assert.equal((s.minuteTicks||0)-ticks,done/15);
    assert.ok(runner.credit<=s.speed*10000/60*.3);
    validateSave(s,CATALOG);
  }
});

test('AO forces retain a distinct replenishment mission during automatic planning',()=>{
  const s=start('JPN'),c=contentFor(CATALOG,s),forces=s.nations.JPN.fleets.filter(f=>f.role==='support');
  assert.ok(forces.length);assert.ok(forces.every(f=>f.mission==='replenish'));
  issue(s,'settings',{autoPause:false});advanceMinutes(s,c,1440);
  assert.ok(s.nations.JPN.fleets.filter(f=>f.role==='support').every(f=>f.mission==='replenish'));
  validateSave(s,CATALOG);
});

test('all AI navies register aircraft and ship replacements and place funded hull orders through shared commands',()=>{
  const s=start('USA','campaign_1922');setCampaignMinutes(s,Date.parse('1936-01-01T00:00:00Z')/60000);
  for(const id of Object.keys(s.nations)){
    const n=s.nations[id];s.controllers[id]='ai';
    Object.assign(n,{gold:1e7,industry:1e7,strategic:1e7,influence:500,crew:1e6});
    n.groups=n.groups.filter(g=>g.status!=='building');
    const before=new Set(n.groups.map(g=>g.id));
    aiTurn(s,contentFor(CATALOG,s),id);
    assert.ok(n.customAircraft.length>0,id+' aircraft design');
    assert.ok(n.customDesigns.length>0,id+' ship design');
    assert.ok(n.groups.some(g=>g.status==='building'&&!before.has(g.id)),id+' construction order');
    assert.ok(n.gold<1e7&&n.industry<1e7,id+' pays resource costs');
  }
  validateSave(s,CATALOG);
});

test('leader offsets stay continuous per unit, separate crowded markers, and retract when space clears',()=>{
  const cache=new Map(),item=(id,x=0)=>({id,point:[x,0],radius:12});
  let layout;
  for(let i=0;i<60;i++)layout=movingMarkerLayout([item('a'),item('b')],cache,1,16);
  assert.ok(Math.hypot(...layout.get('b'))>25);
  const before=[...layout.get('b')];
  layout=movingMarkerLayout([item('a'),item('b',200)],cache,1,16);
  assert.ok(Math.hypot(...layout.get('b'))<Math.hypot(...before));
  assert.ok(Math.hypot(...layout.get('b'))>Math.hypot(...before)*.8);
  for(let i=0;i<90;i++)layout=movingMarkerLayout([item('a'),item('b',200)],cache,1,16);
  assert.ok(Math.hypot(...layout.get('b'))<.1);
});
