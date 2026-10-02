import test from 'node:test';
import assert from 'node:assert/strict';
import {createCombat,advanceCombat,resolveCombat,buildScenario} from '../combatmechanics/index.mjs';
import {unrealTacticalPacket,tacticalSceneSnapshot,tacticalPoseAt,buildTacticalMovie} from '../ui/tactical-scene-packet.mjs';
import {commandView} from '../ui/command-view.mjs';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {newGame} from '../mechanics/engine.mjs';
import {HOME_PORT,PORTS} from '../mechanics/world.mjs';
import {UnrealTacticalScene,unrealBattlePacket} from '../ui/unreal-scene.mjs';
import {buildBattleMovie} from '../ui/battle-movie.mjs';

test('native tactical inspection packets preserve the moving clock origin through selection, pause and resume',async t=>{
  let now=1000;const packets=[],old=new Map();
  for(const [key,value] of Object.entries({performance:{now:()=>now},matchMedia:()=>({matches:false}),ue:{wnt:{battle:p=>packets.push(JSON.parse(p))}}})){
    old.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});
  }
  t.after(()=>{for(const [key,descriptor] of old){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}});
  const canvas={isConnected:true},scene=new UnrealTacticalScene({root:{querySelector:()=>canvas}});
  scene.attach=()=>{};scene.activate=()=>{};
  const state=createCombat(buildScenario(null,{seed:42}));await scene.refresh(state,{paused:true});
  advanceCombat(state,10);await scene.refresh(state,{fromSeconds:0,speed:20,paused:false});
  const key=packets.at(-1).eventKey,track=structuredClone(packets.at(-1).units[0].trajectory);
  now=1100;await scene.refresh(state,{selected:{id:state.ships[0].id},paused:false});
  now=1200;await scene.refresh(state,{selected:{id:state.ships[0].id},paused:true});
  assert.equal(packets.at(-1).elapsedSeconds,.2,'Selecting a moving hull must not rewind the native clock when paused');
  assert.equal(packets.at(-1).eventKey,key);assert.deepEqual(packets.at(-1).units[0].trajectory,track);
  now=1300;await scene.refresh(state,{paused:false});now=1500;await scene.refresh(state,{paused:true});
  assert.equal(packets.at(-1).elapsedSeconds,.4);scene.destroy();
});

test('tactical rendering preserves individual observed positions, damage and headings without simulation writes',()=>{
  const state=createCombat(buildScenario(null,{presetId:'denmark-strait',seed:42}));
  const previous=tacticalSceneSnapshot(state);advanceCombat(state,10);const before=structuredClone(state);
  const selected=state.ships[1];
  const packet=unrealTacticalPacket(state,{previous,fromSeconds:0,durationSeconds:.5,selected:{id:selected.id}});
  assert.equal(packet.units.length,state.ships.length);
  assert.equal(packet.units.filter(s=>s.selected).length,1);
  assert(packet.units.every(s=>!s.sunk&&!('lostAtSeconds'in s)),'Afloat ships must never inherit a zero-second loss');
  for(const ship of state.ships){const row=packet.units.find(r=>r.key===ship.id),pose=row.trajectory.at(-1);
    assert.deepEqual(pose.positionMetres,[ship.x*1000,-ship.y*1000,0]);
    assert.equal(pose.headingDegrees,ship.heading-90);assert.equal(row.health,ship.health);
    assert.equal(pose.time,.5);assert.equal(row.trajectory[0].time,0);
  }
  assert.deepEqual(state,before);
});

test('tactical effects keep actual shot endpoints, misses and long torpedo travel across presentation windows',()=>{
  const state=createCombat(buildScenario(null,{seed:42}));advanceCombat(state,100);
  const [a,b]=state.ships;state.history.events=[
    {id:'launch',seconds:90,kind:'torpedo',attackerId:a.id,targetId:b.id,position:[1,2],targetPosition:[4,6],arrivalAt:690,hits:0},
    {id:'hit',seconds:100,kind:'impact',attackerId:a.id,targetId:b.id,position:[1,2],targetPosition:[4,6],weapon:'torpedo',damage:.2},
  ];
  const packet=unrealTacticalPacket(state,{fromSeconds:90,speed:10});
  const salvo=packet.events.find(e=>e.key==='launch');
  assert.equal(salvo.duration,60);assert(salvo.duration>packet.durationSeconds,'An in-flight torpedo cannot be accelerated to arrive at the packet deadline');
  assert.equal(salvo.hits,0);assert.equal(salvo.weapon,'submarine');
  assert.deepEqual(salvo.sourcePositionMetres,[1000,-2000,1]);
  assert.deepEqual(salvo.targetPositionMetres,[4000,-6000,0]);
  assert.equal(packet.events.find(e=>e.key==='hit').damage,.2);
});

test('retained archive gaps cut rather than invent ship motion, and retained samples interpolate the shortest turn',()=>{
  const ship={id:'A:a:0',x:0,y:0,heading:350,status:'active',health:1};
  const frames=[{seconds:0,ships:[ship]},{seconds:30,ships:[{...ship,x:3,heading:10}]},{seconds:300,ships:[{...ship,x:30}]}];
  assert.equal(tacticalPoseAt(frames,15,ship.id).x,1.5);
  assert.equal(tacticalPoseAt(frames,15,ship.id).heading,360);
  assert.equal(tacticalPoseAt(frames,150,ship.id).x,3);
  assert.equal(tacticalPoseAt(frames,300,ship.id).x,30);
});

test('a real carrier battle movie retains airborne group lifetimes and all actual sinks without rerolling',()=>{
  const state=createCombat(buildScenario(null,{presetId:'midway',seed:19420604}));resolveCombat(state);
  const before=structuredClone(state),report={id:24,startedAt:0,minute:state.seconds/60,completedAt:state.seconds/60,status:'completed',tactical:state,
    replay:{frames:[{at:0,tacticalSeconds:0},{at:state.seconds/60,tacticalSeconds:state.seconds}]}};
  const plan=buildTacticalMovie(report);
  assert(plan.durationSeconds>=30&&plan.durationSeconds<=90);assert(plan.airstrikes.length>0);
  assert(plan.airstrikes.some(f=>f.disappearsAt!=null),'Completed flights remain in replay until their recorded disappearance');
  assert(plan.airstrikes.every(f=>f.trajectory.length&&f.appearsAt>=0));
  assert.equal(plan.units.filter(u=>u.sunkHull).length,state.ships.filter(s=>s.status==='sunk').length);
  assert.deepEqual(state,before);
});

test('port selection keeps command map and fleets present while opening an intelligence-safe inspection',()=>{
  const state=newGame(CATALOG,'USA',90210),own=HOME_PORT.USA,enemy=HOME_PORT.JPN;
  const ownHTML=commandView(state,CATALOG,{portId:own});
  assert(ownHTML.includes(`data-port-id="${own}"`));assert(ownHTML.includes(PORTS[own].name));
  assert(ownHTML.includes('Facility condition'));assert(ownHTML.includes('Fleet support contribution'));
  assert(ownHTML.includes('native-world-surface'));assert(ownHTML.includes('Naval commands'));
  const foreignHTML=commandView(state,CATALOG,{portId:enemy});
  assert(foreignHTML.includes('No aerial observation'));assert(foreignHTML.includes('Unknown'));
  assert(!foreignHTML.includes('Facility condition'),'Foreign port stores/ships are not disclosed live');
});

test('campaign movies inherit the campaign model catalog and honor explicit mixed-catalog hulls',()=>{
  const state=createCombat(buildScenario(null,{seed:42}));advanceCombat(state,60);
  const report={id:25,startedAt:0,minute:1,status:'ongoing',tactical:state,replay:{frames:[{at:0,tacticalSeconds:0},{at:1,tacticalSeconds:60}]}};
  delete state.metadata.campaign;delete state.metadata.modelCampaigns;
  let plan=buildBattleMovie(report);
  let packet=unrealBattlePacket(report,'campaign_1936',1,null,true,{plan,key:'test',elapsedSeconds:0,paused:false});
  assert(packet.units.every(u=>u.campaign==='campaign_1936'));
  const explicit=state.ships[0].classId;state.metadata.modelCampaigns={[explicit]:'campaign_1922'};
  plan=buildBattleMovie(report);
  packet=unrealBattlePacket(report,'campaign_1936',1,null,true,{plan,key:'mixed',elapsedSeconds:0,paused:false});
  assert.equal(packet.units.find(u=>u.classId===explicit).campaign,'campaign_1922');
});

test('an oversized combat without retained frames shows actual current positions and cannot invent a movie',()=>{
  const state=createCombat(buildScenario(null,{seed:42}));advanceCombat(state,60);
  state.history.frames=[];state.history.truncated=true;
  const report={id:26,startedAt:0,minute:1,status:'ongoing',tactical:state,replay:{frames:[{at:0,tacticalSeconds:0},{at:1,tacticalSeconds:60}]}};
  assert.equal(buildBattleMovie(report),null);
  const packet=unrealBattlePacket(report,'campaign_1936',0,null);
  for(const ship of state.ships)assert.deepEqual(packet.units.find(u=>u.key===ship.id).positionMetres,[ship.x*1000,-ship.y*1000,0]);
});

test('ASW drops do not become gunfire and completed static scenes settle terminal sinking effects',()=>{
  const state=createCombat(buildScenario(null,{seed:42}));advanceCombat(state,60);
  const [a,b]=state.ships;state.history.events=[{id:'asw',seconds:50,kind:'salvo',weapon:'depth charge',attackerId:a.id,targetId:b.id,position:[a.x,a.y],targetPosition:[b.x,b.y],arrivalAt:60}];
  assert(!unrealTacticalPacket(state,{fromSeconds:50,speed:10}).events.some(e=>e.key==='asw'));
  b.status='sunk';b.health=0;b.sunkAt=60;state.status='completed';
  const packet=unrealTacticalPacket(state,{fromSeconds:50,speed:10,paused:true});
  assert.equal(packet.elapsedSeconds,packet.durationSeconds);
  assert(packet.elapsedSeconds-packet.units.find(u=>u.key===b.id).lostAtSeconds>=5);
});
