import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame, orderShip, resolveBattle, fleetPower, classPower } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { productionBlock } from '../mechanics/naval-resources.mjs';
import { campaignMinutes, setCampaignMinutes } from '../mechanics/campaign-clock.mjs';
import { dockSailors, sailorSummary } from '../mechanics/ship-staffing.mjs';
import { armedClass, fireTorpedoes, torpedoesPerHull, rearmTorpedoes } from '../mechanics/torpedo-ammunition.mjs';
import { fleetStats } from '../mechanics/task-forces.mjs';
import { validateSave } from '../mechanics/state-io.mjs';
import { NODES } from '../mechanics/world.mjs';
const start=(player='FRA')=>{
  const s=newGame(CATALOG,player,330033,'in_good_faith_1936');
  s.decisions=[];s.paused=false;delete s.pauseReason;delete s.resumeAfterDecision;
  return [s,contentFor(CATALOG,s),s.nations.FRA];
};

test('École 600-ton boats open in Mediterranean mass flotillas with full 12-person crews for human and AI France',()=>{
  for(const player of ['FRA','USA']){
    const [s,c,n]=start(player),cl=c.classes.ecole_pt32,boats=n.groups.filter(g=>g.classId===cl.id);
    assert.deepEqual([cl.tons,cl.tubes,cl.torpedoCapacity,cl.torpedoReloads,cl.crew],[600,6,6,0,12]);
    assert.equal(cl.raw.armament.torpedo_tubes.stowage,6);
    assert.equal(cl.raw.armament.torpedo_tubes.reloads,0);
    assert.ok(cl.cost<c.classes.ecole_dd30.cost/4);
    assert.equal(boats.reduce((sum,g)=>sum+g.count,0),96);
    assert.equal(new Set(boats.map(g=>g.name)).size,96);
    assert.ok(boats.every(g=>g.dockPort==='toulon'&&g.region==='mediterranean'&&g.sailors===12));
    assert.ok(sailorSummary(s,c,'FRA').balance>=0);
    assert.ok(c.nations.FRA.designs.includes(cl.id));
    assert.equal(productionBlock(s,c,cl.id,'FRA'),'');
    validateSave(s,CATALOG);
  }
  assert.equal(CATALOG.campaigns.campaign_1922.classes.ecole_pt32,undefined);
});

test('PT construction consumes normal resources and produces named hull orders',()=>{
  const [s,c,n]=start();Object.assign(n,{gold:1e7,industry:1e7,strategic:1e7});
  const id=orderShip(s,c,'ecole_pt32',20,'FRA'),g=n.groups.find(g=>g.id===id);
  assert.equal(g.count,20);assert.equal(g.status,'building');
  assert.equal(g.shipNames.length,20);assert.equal(new Set(g.shipNames).size,20);
  assert.ok(n.gold<1e7&&n.industry<1e7);assert.ok(g.days>0&&g.paid.gold>0);
  validateSave(s,CATALOG);
});

test('Maya remains in production through 1940, every review year and the continuing sandbox',()=>{
  const [s,c]=start('JPN');
  for(const year of [1939,1940,1945,1950,1960]){
    setCampaignMinutes(s,Date.parse(`${year}-01-01T00:00:00Z`)/60000);
    assert.equal(productionBlock(s,c,'maya_t29','JPN'),'');
  }
  assert.match(productionBlock(s,c,'ecole_cl29','FRA'),/Obsolete/);
  const explicitlyClosed={...c,classes:{...c.classes,maya_t29:{...c.classes.maya_t29,buildUntil:1950}}};
  assert.match(productionBlock(s,explicitlyClosed,'maya_t29','JPN'),/obsolete/);
  assert.match(productionBlock(s,c,'missouri_bb23','USA'),/superseded/);
});

test('historical gun layouts and campaign-specific Courageous conversions agree with their catalog identity',()=>{
  const old=CATALOG.campaigns.campaign_1922.classes,current=CATALOG.campaigns.in_good_faith_1936.classes;
  assert.equal(old.arabe.barrels,1);assert.equal(old.arabe.raw.armament.main_battery.count,1);
  assert.equal(old.arabe.raw.armament.secondary_battery[0].count,4);
  assert.equal(old.palestro.raw.armament.main_battery.mounts,'4x1');
  assert.equal(old.palestro.barrels,4);
  assert.deepEqual([old.courageous_llc.type,old.courageous_llc.barrels,old.courageous_llc.air],['BC',4,0]);
  const converted=current.courageous_llc;
  assert.match(converted.name,/carrier conversion/);
  assert.deepEqual([converted.type,converted.raw.type,converted.category,converted.raw.treaty_category],['CV','CV','aircraft_carrier','aircraft_carrier']);
  assert.equal(converted.tubes,0);assert.equal(converted.raw.armament.torpedo_tubes.count,0);
  assert.equal(converted.raw.armament.main_battery.count,0);
  assert.equal(converted.air,36);assert.equal(converted.raw.aviation.aircraft_capacity,36);
});

test('one finite salvo is proportional across grouped hulls and survives casualties, serialization and splitting',()=>{
  const [,c]=start(),cl=c.classes.ecole_pt32,g={count:3};
  assert.equal(fireTorpedoes(g,cl),18);assert.equal(g.torpedoesPerHull,0);
  const survivors=JSON.parse(JSON.stringify({...g,count:2}));
  assert.equal(fireTorpedoes(survivors,cl),0);
  const split=[{...survivors,count:1},{...survivors,count:1}];
  assert.ok(split.every(x=>torpedoesPerHull(x,cl)===0));
  rearmTorpedoes(survivors,cl);assert.equal(fireTorpedoes(survivors,cl),12);
  const ordinary={count:2},legacy=c.classes.ecole_dd30;
  assert.equal(fireTorpedoes(ordinary,legacy),0);assert.equal(armedClass(ordinary,legacy),legacy);
  assert.equal(ordinary.torpedoesPerHull,undefined);
});

test('real combat spends PT torpedoes once; later exchanges and new contacts stay empty until physical docking',()=>{
  const [s,c,n]=start(),boats=n.groups.filter(g=>g.classId==='ecole_pt32').slice(0,3);
  const original=n.fleets.find(f=>f.id===boats[1].fleetId),now=campaignMinutes(s);
  const f={...structuredClone(original),id:'test-pt-force',role:'escort',port:'toulon',route:[[5,40]],phase:'patrol',departAt:now,arriveAt:now,aggressiveBattle:true};
  n.fleets.push(f);for(const g of boats){g.fleetId=f.id;g.atSea=true;}
  const enemy=s.nations.ITA.fleets.find(f=>f.role==='escort')||s.nations.ITA.fleets[0];
  const first=resolveBattle(s,c,'FRA','ITA','mediterranean',f.id,enemy.id,[5,40],{weight:.01,reportId:100001});
  assert.ok(first.powerA.surface>0);assert.ok(boats.every(g=>g.torpedoesPerHull===0));
  assert.equal(fleetPower(s,c,'FRA',null,f.id).surface,0);
  assert.equal(fleetStats(s,c,'FRA',f).surface,0);
  for(const reportId of [100001,100002]){
    const next=resolveBattle(s,c,'FRA','ITA','mediterranean',f.id,enemy.id,[5,40],{weight:.01,reportId});
    assert.equal(next.powerA.surface,0);
  }
  assert.ok(boats.some(g=>g.count>0));
  const saved=validateSave(JSON.parse(JSON.stringify(s)),CATALOG);
  assert.ok(saved.nations.FRA.groups.filter(g=>boats.some(b=>b.id===g.id)).every(g=>g.torpedoesPerHull===0));
  dockSailors(s,c,'FRA',f);assert.ok(boats.every(g=>g.torpedoesPerHull===0),'No refill at an offshore waypoint');
  f.route=[NODES.toulon];f.phase='refuel';f.arriveAt=campaignMinutes(s)+60;
  dockSailors(s,c,'FRA',f);assert.ok(boats.every(g=>g.torpedoesPerHull===0),'No refill before arrival');
  f.arriveAt=campaignMinutes(s);dockSailors(s,c,'FRA',f);
  assert.ok(boats.filter(g=>g.count).every(g=>g.torpedoesPerHull===6));
  assert.ok(fleetPower(s,c,'FRA',null,f.id).surface>0);
});

test('finite torpedoes do not become shore-bombardment guns and invalid saved outfits are rejected',()=>{
  const [s,c,n]=start(),cl=c.classes.ecole_pt32,g=n.groups.find(g=>g.classId===cl.id);
  assert.equal(classPower(armedClass(g,cl,false)).surface,0);
  for(const bad of [-1,7,.5]){
    g.torpedoesPerHull=bad;assert.throws(()=>validateSave(JSON.parse(JSON.stringify(s)),CATALOG));
  }
  g.torpedoesPerHull=0;validateSave(s,CATALOG);
});

test('torpedo rearming follows current port ownership and peaceful allied access',()=>{
  const [s,c,n]=start(),g=n.groups.find(g=>g.classId==='ecole_pt32');
  const f=n.fleets.find(f=>f.id===g.fleetId),now=campaignMinutes(s);
  Object.assign(f,{port:'toulon',route:[NODES.toulon],departAt:now,arriveAt:now,phase:'refuel'});
  const relation=s.relations['FRA-ITA'];
  // The fleet's original orders still name Toulon after it changes hands.
  s.world.portControl.toulon='ITA';
  Object.assign(relation,{allied:false,war:true});
  g.torpedoesPerHull=0;dockSailors(s,c,'FRA',f);
  assert.equal(g.torpedoesPerHull,0,'A captured destination cannot replenish its former owner');
  Object.assign(relation,{allied:true,war:false});
  dockSailors(s,c,'FRA',f);assert.equal(g.torpedoesPerHull,6,'A peaceful allied port can rearm');
  relation.allied=false;g.torpedoesPerHull=0;
  dockSailors(s,c,'FRA',f);assert.equal(g.torpedoesPerHull,0,'Neutrality alone grants no naval access');
  relation.allied=true;relation.war=true;
  dockSailors(s,c,'FRA',f);assert.equal(g.torpedoesPerHull,0,'War overrides an obsolete alliance flag');
  s.world.portControl.toulon='FRA';
  dockSailors(s,c,'FRA',f);assert.equal(g.torpedoesPerHull,6);
});


test('A-boat aggregate uses the coherent A-II/A26 gun and torpedo outfit in both campaigns',()=>{
  for(const campaign of ['campaign_1922','in_good_faith_1936']){
    const cl=CATALOG.campaigns[campaign].classes.a_boat_tb;
    assert.deepEqual([cl.tons,cl.speed,cl.crew,cl.barrels,cl.caliber,cl.tubes],[227,25,29,2,88,1]);
    assert.equal(cl.raw.armament.main_battery.count,2);
    assert.equal(cl.raw.armament.main_battery.mounts,'2x1');
    assert.equal(cl.raw.armament.torpedo_tubes.count,1);
    assert.match(cl.raw.notes,/A-II \/ A26/);
  }
});
