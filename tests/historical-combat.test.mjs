import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createCombat, buildScenario, buildCustomScenario, advanceCombat, resolveCombat, historicalClock, setCombatOrders } from '../combatmechanics/index.mjs';
import { createCampaignCombat } from '../combatmechanics/campaign.mjs';
import { validateCombatState } from '../combatmechanics/validation.mjs';
const presets=['denmark-strait','midway','north-cape','bismarck-last-battle','lofoten'];
const setup=(presetId,options={})=>buildScenario(null,{presetId,...options});
const hull=(state,id)=>state.ships.find(s=>s.classId===`demo-${id}`);
const physical=state=>({seconds:state.seconds,status:state.status,winner:state.winner,ships:state.ships,airstrikes:state.airstrikes,
  projectiles:state.projectiles,historical:state.historical,history:state.history});
const advanceTo=(state,seconds)=>advanceCombat(state,seconds-state.seconds);
const aircraft=state=>state.ships.reduce((n,s)=>n+s.aircraft.fighter+s.aircraft.strike+s.aircraftLost,0)
  +state.airstrikes.reduce((n,s)=>n+s.fighters+s.planes,0);

test('additional historical hulls use the disclosed stored sister-class or earlier-fit models',()=>{
 const index=JSON.parse(fs.readFileSync(new URL('../assets/models/ships/index.json',import.meta.url),'utf8'));
 for(const [id,modelId] of Object.entries({'demo-rodney':'nelson','demo-king-george-v':'demo-prince-of-wales',
   'demo-dorsetshire':'demo-norfolk','demo-renown1940':'renown','demo-gneisenau1940':'demo-scharnhorst'})){
  const matches=index.models.filter(model=>model.platforms.some(platform=>platform.id===id));
  assert.equal(matches.length,1,id+' has one explicit stored model');assert.equal(matches[0].id,modelId);
  assert(fs.existsSync(new URL('../assets/models/ships/'+matches[0].file,import.meta.url)),'Referenced geometry is stored locally');
 }
});

test('historical presets default to reconstruction; free/custom/campaign modes remain unforced',()=>{
  for(const presetId of presets){
    const historical=createCombat(setup(presetId,{maxDurationSeconds:60,doctrineA:'cautious',environment:{seaState:9}}));
    assert.equal(historical.metadata.mode,'historical');assert(historical.historical);assert(historical.maxDurationSeconds>60);
    assert.throws(()=>setCombatOrders(historical,'A',{withdraw:true}),/Historical reconstruction/);
    const free=createCombat(setup(presetId,{mode:'simulation',maxDurationSeconds:60,doctrineA:'cautious',environment:{seaState:9}}));
    assert.equal(free.historical,undefined);assert.equal(free.maxDurationSeconds,60);assert.equal(free.sides.A.doctrine,'cautious');
    assert.equal(free.environment.seaState,9);assert.equal(historicalClock(free),null);
  }
  const ship={id:'ship',classId:'ship',type:'BB',name:'Ship',tons:30000,speed:25,caliber:350,barrels:8,air:0};
  const custom=createCombat(buildCustomScenario({classes:{ship}},{mode:'historical',shipsA:[{classId:'ship',count:1}],shipsB:[{classId:'ship',count:1}]}));
  assert.equal(custom.metadata.mode,'simulation');assert.equal(custom.historical,undefined);
  const campaign=createCampaignCombat({seed:1,classes:{ship},groupsA:[{id:'a',classId:'ship',count:1,health:1}],groupsB:[{id:'b',classId:'ship',count:1,health:1}],nationA:{},nationB:{}});
  assert.equal(campaign.historical,undefined);assert.equal(campaign.metadata.origin,'campaign');
  const forbidden=setup('denmark-strait');forbidden.metadata.origin='campaign';assert.throws(()=>createCombat(forbidden),/restricted/);
  const missing=setup('denmark-strait');delete missing.historicalScript;assert.throws(()=>createCombat(missing),/matching scenario script/);
  const unknown=setup('denmark-strait');unknown.historicalScript='unknown';assert.throws(()=>createCombat(unknown),/restricted/);
  const modelLookup=setup('denmark-strait');modelLookup.metadata.campaign='in_good_faith_1936';assert(createCombat(modelLookup).historical);
});
test('Denmark Strait damages Bismarck, sinks Hood, then withdraws Prince of Wales without sinking her',()=>{
  const state=createCombat(setup('denmark-strait'));
  advanceTo(state,350);assert(hull(state,'hood1941').health>0);assert(hull(state,'hood1941').fire>0);assert(hull(state,'bismarck').health<1);
  assert.equal(state.history.events.find(e=>e.kind==='salvo'&&e.attackerId===hull(state,'hood1941').id).targetId,hull(state,'prinz-eugen').id);
  advanceTo(state,360);assert.equal(hull(state,'hood1941').status,'sunk');assert.equal(hull(state,'hood1941').sunkAt,360);
  assert.equal(state.status,'ongoing');advanceTo(state,700);assert.equal(hull(state,'prince-of-wales').status,'withdrawing');
  advanceTo(state,900);assert.equal(hull(state,'prince-of-wales').status,'escaped');assert(hull(state,'prince-of-wales').health>0);
  resolveCombat(state);assert.equal(state.seconds,960);assert.equal(state.winner,'B');
  const sinking=state.history.events.filter(e=>e.kind==='sink');assert.equal(sinking.length,1);assert.match(sinking[0].historicalLabel,/Hood/);
  assert(state.history.events.some(e=>e.kind==='salvo'&&e.hits===0&&e.illustrative));
  assert(state.history.events.some(e=>e.kind==='salvo'&&e.hits===1&&e.arrivalAt>e.seconds));
});
test('Midway preserves the attack chronology, distinguishes disabled carriers from later sinkings, and conserves aircraft',()=>{
  const state=createCombat(setup('midway')),initial=aircraft(state);
  const checkpoints=new Map([[240,()=>{assert.equal(hull(state,'hornet').aircraftLost,15);assert.equal(hull(state,'kaga1942').health,1);}],
    [630,()=>{for(const id of ['akagi1942','kaga1942','soryu']){assert(hull(state,id).health>0&&hull(state,id).health<.3);assert.notEqual(hull(state,id).status,'sunk');}}],
    [1320,()=>{assert.equal(hull(state,'yorktown').health,.28);assert.equal(hull(state,'yorktown').machinery,0);assert.notEqual(hull(state,'yorktown').status,'sunk');}],
    [1740,()=>{assert.equal(hull(state,'hiryu').health,.18);assert.notEqual(hull(state,'hiryu').status,'sunk');}],
    [2880,()=>{assert(state.ships.filter(s=>s.side==='B').every(s=>s.status==='sunk'));assert.equal(state.status,'ongoing');assert(hull(state,'yorktown').health>0);}],
    [3180,()=>{assert.equal(hull(state,'yorktown').health,.08);assert.equal(state.status,'ongoing');}],
    [3540,()=>assert.equal(hull(state,'yorktown').status,'sunk')]]);
  while(state.status==='ongoing'){
    advanceCombat(state,10);assert.equal(aircraft(state),initial);checkpoints.get(state.seconds)?.();
    assert(state.airstrikes.every(f=>f.planes>=0&&f.fighters>=0));
  }
  assert.equal(state.seconds,3600);assert.equal(state.winner,'A');assert.equal(state.airstrikes.length,0);
  assert.deepEqual(state.history.events.filter(e=>e.kind==='sink').map(e=>state.ships.find(s=>s.id===e.targetId).name),['Soryu','Kaga','Akagi','Hiryu','USS Yorktown']);
  const submarine=state.history.events.find(e=>e.sourceLabel==='I-168 (off-map)');assert.equal(submarine.seconds,3180);assert.equal(submarine.attackerId,null);
  assert.match(historicalClock(state).label,/7 June/);validateCombatState(state);
});
test('North Cape preserves the cruiser/battleship/torpedo sequence and acknowledges omitted forces',()=>{
  const state=createCombat(setup('north-cape'));
  advanceTo(state,420);assert(hull(state,'norfolk').health<1);assert.equal(hull(state,'duke-of-york').health,1);
  assert(!state.history.events.some(e=>e.kind==='salvo'&&e.attackerId===hull(state,'duke-of-york').id));
  advanceTo(state,760);assert.equal(hull(state,'scharnhorst').health,.73);assert.equal(state.status,'ongoing');
  advanceTo(state,1260);assert.equal(hull(state,'scharnhorst').health,.25);
  assert(state.history.events.some(e=>e.sourceLabel==='British destroyers (off-map)'&&e.weapon==='torpedo'));
  advanceTo(state,1730);assert(hull(state,'scharnhorst').health>0);advanceCombat(state,10);assert.equal(hull(state,'scharnhorst').status,'sunk');
  resolveCombat(state);assert.equal(state.winner,'A');assert(state.ships.filter(s=>s.side==='A').every(s=>s.health>0));
  assert(state.history.events.some(e=>e.sourceLabel==='British supporting forces (off-map)'));assert.equal(state.seconds,1800);
});
test('historical quick/watch/save-resume paths match, and seeds cannot change scripted milestones',()=>{
  for(const presetId of presets){
    const quick=createCombat(setup(presetId,{seed:1})),watch=createCombat(setup(presetId,{seed:1}));resolveCombat(quick);
    while(watch.status==='ongoing'){
      advanceCombat(watch,7);advanceCombat(watch,3);validateCombatState(watch);
      for(const projectile of watch.projectiles.filter(p=>p.scripted)){
        const source=watch.ships.find(h=>h.id===projectile.attackerId);
        const range=Math.hypot(projectile.position[0]-projectile.targetPosition[0],projectile.position[1]-projectile.targetPosition[1]);
        assert(range<=source.stats.gunRangeKm,'Illustrative geometry must keep selected gun attacks within weapon range');
      }
    }
    assert.deepEqual(physical(quick),physical(watch));
    const original=createCombat(setup(presetId,{seed:72}));advanceCombat(original,340);
    const resumed=JSON.parse(JSON.stringify(original));validateCombatState(resumed);resolveCombat(original);resolveCombat(resumed);
    assert.deepEqual(physical(original),physical(resumed));assert.deepEqual(physical(original),physical(quick));
    assert(quick.history.events.some(e=>e.scripted));assert.equal(quick.historical.nextEvent,original.historical.nextEvent);
  }
});
test('historical saves reject timeline skipping and corrupted deterministic weapon/flight payloads',()=>{
  const state=createCombat(setup('denmark-strait'));advanceCombat(state,100);
  assert(state.projectiles.some(p=>p.scripted));const skipped=structuredClone(state);skipped.historical.nextEvent++;assert.throws(()=>validateCombatState(skipped),/Invalid tactical/);
  const damage=structuredClone(state);damage.projectiles.find(p=>p.scripted).scripted.healthAfter=NaN;assert.throws(()=>validateCombatState(damage),/Invalid tactical/);
  const missing=structuredClone(state);delete missing.historical;assert.throws(()=>validateCombatState(missing),/Invalid tactical/);
  const midway=createCombat(setup('midway'));advanceCombat(midway,20);midway.airstrikes[0].scripted.losses.planes=-1;assert.throws(()=>validateCombatState(midway),/Invalid tactical/);
});

test('Bismarck final action retains all principal hulls and finite travelling Dorsetshire torpedoes',()=>{
 const state=createCombat(setup('bismarck-last-battle')),dorsetshire=hull(state,'dorsetshire');
 assert.equal(state.ships.length,5);assert(state.metadata.approximation.includes('Sister-ship'));
 const torpedoes=dorsetshire.torpedoes;advanceTo(state,1130);const ammunition=dorsetshire.ammunition;
 advanceTo(state,1140);assert.equal(dorsetshire.torpedoes,torpedoes-2);assert.equal(dorsetshire.ammunition,ammunition);
 const p=state.projectiles.find(p=>p.kind==='torpedo'&&p.scripted);assert(p&&p.arrivalAt===1200);
 assert(Math.hypot(p.position[0]-p.targetPosition[0],p.position[1]-p.targetPosition[1])<=dorsetshire.stats.torpedoRangeKm);
 advanceTo(state,1260);assert.equal(dorsetshire.torpedoes,torpedoes-3);
 advanceTo(state,1430);assert.notEqual(hull(state,'bismarck').status,'sunk');advanceCombat(state,10);assert.equal(hull(state,'bismarck').sunkAt,1440);
 resolveCombat(state);assert.equal(state.winner,'A');assert(state.ships.filter(x=>x.side==='A').every(x=>x.health===1));validateCombatState(state);
});

test('Lofoten preserves limited damage, interrupted fire and withdrawal without invented sinkings',()=>{
 const state=createCombat(setup('lofoten'));advanceTo(state,200);
 assert.equal(hull(state,'renown1940').health,.94);assert.equal(hull(state,'gneisenau1940').health,.88);assert.equal(hull(state,'scharnhorst').health,1);
 advanceTo(state,500);assert.equal(state.historical.orders[hull(state,'renown1940').id].targetId,null);
 resolveCombat(state);assert(state.ships.every(s=>s.health>0));assert(!state.history.events.some(e=>e.kind==='sink'));
 assert(state.ships.filter(s=>s.side==='B').every(s=>s.status==='escaped'));assert.equal(state.seconds,1200);validateCombatState(state);
});
