import test from 'node:test';
import assert from 'node:assert/strict';
import { createCombat, advanceCombat, resolveCombat, combatSummary, combatSnapshot, buildScenario, buildCustomScenario } from '../combatmechanics/index.mjs';
import { validateCombatState } from '../combatmechanics/validation.mjs';
import { gunHitProbability } from '../combatmechanics/weapons.mjs';
import { createCampaignAirCombat, synchronizeCampaignCombat } from '../combatmechanics/campaign.mjs';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame, damageFleet } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { beginEngagement, progressEngagements } from '../mechanics/engagements.mjs';
import { campaignMinutes, setCampaignMinutes } from '../mechanics/campaign-clock.mjs';
import { validateSave } from '../mechanics/state-io.mjs';
import { combatAirPatrol, loseCAP } from '../mechanics/air-operations.mjs';

const baseShip={classId:'test',name:'Test battleship',type:'BB',tons:35000,speed:28,caliber:356,barrels:10,belt:300,deck:110,health:1};
const config=(overrides={})=>({seed:4782,maxDurationSeconds:1800,sides:{A:{ships:[{...baseShip,id:'A:a:0',groupId:'a'}]},B:{ships:[{...baseShip,id:'B:b:0',groupId:'b'}]}},...overrides});
const physical=s=>({seconds:s.seconds,rng:s.rng,status:s.status,winner:s.winner,ships:s.ships,airstrikes:s.airstrikes,projectiles:s.projectiles});
const campaign=role=>{const s=newGame(CATALOG,'USA',12345,'in_good_faith_1936');s.decisions=[];s.autoPause=false;Object.assign(s.relations['JPN-USA'],{war:true,allied:false,warSince:s.day});const c=contentFor(CATALOG,s),fleets=['USA','JPN'].map(id=>s.nations[id].fleets.find(f=>f.role===role));const r=beginEngagement(s,c,{a:'USA',b:'JPN',kind:'surface',fleetA:fleets[0].id,fleetB:fleets[1].id,position:[160,20],region:'pacific'});return{s,c,r};};

test('watched, quick and save-resumed tactical combat have identical outcomes and RNG',()=>{
  for(const presetId of ['denmark-strait','midway','north-cape']){
    const setup=buildScenario(null,{presetId,seed:9001}),a=createCombat(setup),b=createCombat(setup);
    resolveCombat(a);while(b.status==='ongoing')advanceCombat(b,10);
    assert.deepEqual(physical(a),physical(b));assert.deepEqual(a.history,b.history);
    const mid=createCombat(setup);advanceCombat(mid,900);const resumed=JSON.parse(JSON.stringify(mid));validateCombatState(resumed);resolveCombat(mid);resolveCombat(resumed);
    assert.deepEqual(physical(mid),physical(resumed));
  }
});
test('guns obey range, reload, travel and armour; damage occurs on arrival, never launch',()=>{
  const state=createCombat(config());const [a,b]=state.ships;
  b.x=100;assert.equal(gunHitProbability(state,a,b),0);b.x=12;
  const low=gunHitProbability(state,a,b);state.sides.A.doctrine='cautious';assert(gunHitProbability(state,a,b)>low);
  advanceCombat(state,10);assert(state.history.events.some(e=>e.kind==='salvo'));assert.equal(a.health,1);assert.equal(b.health,1);
  const first=state.history.events.find(e=>e.kind==='salvo'&&e.attackerId===a.id);assert(first.arrivalAt>first.seconds);
  advanceCombat(state,100);const firing=state.history.events.filter(e=>e.kind==='salvo'&&e.attackerId===a.id);
  assert(firing.every((e,i)=>!i||e.seconds-firing[i-1].seconds>=a.stats.reloadSeconds));
});
test('large line-ahead formations stay on their own side and fixed steps never skip requested time',()=>{
  const ships=Array.from({length:120},(_,i)=>({...baseShip,id:`a-${i}`}));
  const state=createCombat(config({sides:{A:{ships},B:{ships:ships.map((s,i)=>({...s,id:`b-${i}`}))}}}));
  assert(Math.max(...state.ships.filter(s=>s.side==='A').map(s=>s.x))<Math.min(...state.ships.filter(s=>s.side==='B').map(s=>s.x)));
  advanceCombat(state,9);assert.equal(state.seconds,0);advanceCombat(state,1);assert.equal(state.seconds,10);advanceCombat(state,890);assert.equal(state.seconds,900);
  assert(JSON.stringify(state.history).length<340100);validateCombatState(state);
});
test('carrier flights conserve every aircraft through CAP, sinking, recovery and time limits',()=>{
  for(const seed of [1,7,29]){
    const state=createCombat(buildScenario(null,{presetId:'midway',seed})),initial=state.ships.reduce((n,s)=>n+s.aircraft.fighter+s.aircraft.strike,0);
    while(state.status==='ongoing'){
      advanceCombat(state,900);
      const total=state.ships.reduce((n,s)=>n+s.aircraft.fighter+s.aircraft.strike+s.aircraftLost,0)+state.airstrikes.reduce((n,a)=>n+a.planes+a.fighters,0);
      assert.equal(total,initial);assert(state.airstrikes.every(a=>Number.isFinite(a.x)&&Number.isFinite(a.y)));
    }
    assert(state.history.events.some(e=>e.kind==='air-attack'));assert(combatSummary(state).sides.A.planesLost+combatSummary(state).sides.B.planesLost>0);
  }
});
test('destroyers actually close and drop depth charges while submerged boats do not fire deck guns',()=>{
  const state=createCombat(config({separationKm:2,maxDurationSeconds:900,sides:{
    A:{doctrine:'aggressive',ships:[{...baseShip,id:'dd',type:'DD',tons:1600,caliber:127,barrels:5,sonar:true,speed:35}]},
    B:{doctrine:'aggressive',ships:[{...baseShip,id:'ss',type:'SS',tons:900,speed:18,submergedSpeed:8,caliber:100,barrels:1,tubes:4,torpedoRange:8}]}}}));
  resolveCombat(state);assert(state.history.events.some(e=>e.weapon==='depth charge'));
  assert(!state.history.events.some(e=>e.kind==='salvo'&&e.attackerId==='ss'));
  assert.equal(state.ships.find(s=>s.id==='ss').stats.speed,8);
});
test('campaign tick and identical standalone engine advance agree; physical losses and save identity remain exact',()=>{
  const{s,c,r}=campaign('battle'),reference=structuredClone(r.tactical),before=campaignMinutes(s);
  advanceCombat(reference,900);setCampaignMinutes(s,before+15);progressEngagements(s,c);
  assert.deepEqual(physical(r.tactical),physical(reference));assert.equal(r.replay.frames.at(-1).tacticalSeconds,r.tactical.seconds);
  validateSave(s,CATALOG);
  const loaded=validateSave(JSON.parse(JSON.stringify(s)),CATALOG),lr=loaded.reports.find(x=>x.id===r.id);
  for(let i=0;i<16&&r.status==='ongoing';i++){setCampaignMinutes(s,campaignMinutes(s)+15);progressEngagements(s,c);setCampaignMinutes(loaded,campaignMinutes(loaded)+15);progressEngagements(loaded,c);}
  assert.equal(r.status,'completed');assert.deepEqual(r.resultA,lr.resultA);assert.deepEqual(r.resultB,lr.resultB);
  assert.equal(r.winner,r.tactical.winner==='A'?r.a:r.tactical.winner==='B'?r.b:null);validateSave(s,CATALOG);
});
test('campaign carrier wings are reserved once, CAP uses the physical reserve, and saves stay valid through recovery',()=>{
  const{s,c,r}=campaign('carrier'),pool=s.nations.USA.airSorties.find(o=>o.tacticalCombat===r.id);
  assert(pool?.airWing.length);assert(r.tactical.airPools.A);
  for(const group of s.nations.USA.groups.filter(g=>r.tactical.ships.some(h=>h.side==='A'&&h.groupId===g.id)))
    assert(!group.airWing.some(w=>['fighter','strike'].includes(w.role)&&w.crewed>0));
  const cap=combatAirPatrol(s,c,'USA',{fleetId:r.fleetA});
  const beforeCore=r.tactical.ships.filter(s=>s.side==='A').reduce((n,s)=>n+s.aircraft.fighter,0);
  if(cap.count){const loss=loseCAP(s,c,'USA',cap,1);const after=r.tactical.ships.filter(s=>s.side==='A').reduce((n,s)=>n+s.aircraft.fighter,0);assert.equal(beforeCore-after,loss.planes+loss.planesRescued);}
  validateSave(s,CATALOG);
  for(let i=0;i<16&&r.status==='ongoing';i++){
    setCampaignMinutes(s,campaignMinutes(s)+15);progressEngagements(s,c);validateSave(s,CATALOG);
    for(const [side,nation] of [['A','USA'],['B','JPN']])for(const role of ['fighter','strike']){
      const afloat=r.tactical.ships.filter(h=>h.side===side).reduce((n,h)=>n+h.aircraft[role],0);
      const airborne=r.tactical.airstrikes.filter(f=>f.side===side).reduce((n,f)=>n+(role==='fighter'?f.fighters:f.planes),0);
      const reserved=s.nations[nation].airSorties.filter(o=>o.reportId===r.id).flatMap(o=>o.airWing)
        .filter(w=>role==='strike'?['strike','bomber'].includes(w.role):w.role===role).reduce((n,w)=>n+w.count,0);
      assert.equal(reserved,r.status==='completed'?airborne:afloat+airborne,`${side} ${role} reserve must match actual aircraft positions`);
    }
  }
  assert.equal(r.status,'completed');assert(!s.nations.USA.airSorties.some(o=>o.tacticalCombat===r.id));
  assert(s.nations.USA.airSorties.every(o=>o.phase!=='engaging'||o.reportId!==r.id));
});
test('external carrier sinking destroys only deck aircraft, records the event, and preserves airborne diversion',()=>{
  const{s,r}=campaign('carrier'),combat=r.tactical;
  const carrier=combat.ships.find(h=>h.side==='A'&&h.aircraft.fighter>=6);
  const alternate=combat.ships.find(h=>h.side==='A'&&h.id!==carrier.id&&h.stats.aircraft.fighter+h.stats.aircraft.strike>0);
  assert(alternate);const group=s.nations.USA.groups.find(g=>g.id===carrier.groupId);
  carrier.aircraft.fighter-=5;
  combat.airstrikes.push({id:'external-sink-survivors',side:'A',sourceId:carrier.id,targetId:alternate.id,
    x:alternate.x,y:alternate.y,heading:0,planes:0,fighters:5,launchedPlanes:5,phase:'returning',attacks:1,lost:0,crewQuality:1});
  const deck=carrier.aircraft.fighter+carrier.aircraft.strike;
  // Make a real landing slot on the alternate deck, preserving the five planes
  // displaced here as recorded losses rather than silently exceeding capacity.
  alternate.aircraft.fighter-=5;alternate.aircraftLost+=5;
  group.count--;group.health=0;
  synchronizeCampaignCombat(combat,s.nations.USA.groups,s.nations.JPN.groups);
  assert.equal(carrier.aircraft.fighter+carrier.aircraft.strike,0);assert.equal(carrier.aircraftLost,deck);
  assert.equal(combat.airstrikes[0].fighters,5);assert.equal(combat.campaignApplied[carrier.id].sunk,true);
  assert.equal(combat.history.events.filter(e=>e.kind==='sink'&&e.targetId===carrier.id).length,1);
  const receiving=alternate.aircraft.fighter;advanceCombat(combat,10);
  assert.equal(alternate.aircraft.fighter,receiving+5,'Airborne fighters divert to the surviving carrier');
  assert(!combat.airstrikes.some(f=>f.id==='external-sink-survivors'));
  synchronizeCampaignCombat(combat,s.nations.USA.groups,s.nations.JPN.groups);
  assert.equal(carrier.aircraftLost,deck);assert.equal(combat.history.events.filter(e=>e.kind==='sink'&&e.targetId===carrier.id).length,1);
  validateCombatState(combat);
});
test('externally eliminated carrier fleet finalizes aircraft losses without charging sunk hulls twice',()=>{
  const{s,c,r}=campaign('carrier'),hulls=r.tactical.ships.filter(h=>h.side==='A');
  const groups=s.nations.USA.groups.filter(g=>hulls.some(h=>h.groupId===g.id));
  const planes=hulls.reduce((n,h)=>n+h.aircraft.fighter+h.aircraft.strike,0);
  const outcomes=new Map(groups.map(g=>[g.id,{sunk:g.count,health:0,aircraftLost:0,trackedAirPool:true,torpedoes:0}]));
  const external=damageFleet(s,c,'USA','pacific',0,{asw:0,sub:0,surface:0},'external air raid',r.fleetA,.3,1,groups,outcomes);
  const priorTons=s.nations.USA.lostTons;assert(external.sunk>0);
  setCampaignMinutes(s,campaignMinutes(s)+15);progressEngagements(s,c);
  assert.equal(r.status,'completed');assert.equal(r.tactical.status,'completed');
  assert.equal(r.resultA.planesLost,planes);assert.equal(r.resultA.sunk,0);assert.equal(s.nations.USA.lostTons,priorTons);
  assert(!s.nations.USA.airSorties.some(o=>o.reportId===r.id),'Deck aircraft cannot reappear as a returning sortie');
  validateSave(s,CATALOG);
});
test('tactical state rejects malformed combat saves and invalid custom fleets',()=>{
  const state=createCombat(config());const bad=structuredClone(state);bad.ships[0].health=NaN;assert.throws(()=>validateCombatState(bad),/Invalid tactical/);
  assert.throws(()=>buildCustomScenario({classes:{}},{shipsA:[{classId:'missing',count:1}],shipsB:[]}),/Unknown ship/);
  const badProjectile=structuredClone(state);badProjectile.projectiles=[{attackerId:'evil',targetId:'B:b:0',arrivalAt:10,damage:1,hits:1,kind:'shell'}];assert.throws(()=>validateCombatState(badProjectile),/Invalid tactical/);
});
test('remote air-strike victory compares actual losses rather than treating the absent carrier as destroyed',()=>{
  const state=createCampaignAirCombat({seed:12,classes:{target:{...baseShip,crew:1000}},groupsB:[{id:'target',classId:'target',name:'Target',count:1,health:1}],
    nationA:{training:80,morale:80},nationB:{training:80,morale:80},nameA:'Strike',nameB:'Target fleet',operationId:'raid',strikes:24,fighters:0,cap:0,flak:0,anchored:true});
  resolveCombat(state);const target=state.ships[0];assert(target.health>0&&target.health<1,'A nonfatal attack can still succeed');
  assert.equal(state.winner,'A');assert.equal(state.ships.some(s=>s.side==='A'),false);
});
