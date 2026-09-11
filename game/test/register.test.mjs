import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as sim from '../src/engine.mjs';
import {fleetService} from '../src/catalog.mjs';
import {validateSave} from '../src/state-io.mjs';
const content=JSON.parse(fs.readFileSync(process.env.WNT_TEST_PUBLIC ? process.env.WNT_TEST_PUBLIC+'/content.json' : new URL('../public/content.json',import.meta.url)));

function oldRoster(){
  const s=sim.newGame(content);
  delete s.rosterRevision;
  for(const [id,n] of Object.entries(s.nations)){
    n.groups=n.groups.filter(g=>g.rosterAdded!==2);
    delete n.merchant;delete n.merchantDelivered;delete n.supportDelivered;
    for(const g of n.groups){
      if(id==='JPN'&&g.id==='a-JPN-11'){g.classId='standard_maru_t23';g.name='Standard Maru';}
      if(['JPN','DEU'].includes(id)&&['BB','BC'].includes(content.classes[g.classId].type))g.status='reserve';
      if(g.id==='a-DEU-4')g.count=6;
      for(const key of ['service','legacy','rosterAdded','representative','notes'])delete g[key];
    }
  }
  return s;
}

test('merchant, support and warship opening registers are disjoint for every nation',()=>{
  const s=sim.newGame(content);
  for(const [id,total] of Object.entries({JPN:2146,USA:2553,GBR:6998,DEU:2070})){
    assert.equal(sim.merchantSummary(s,content,id).total,total);
    const n=content.nations[id];
    assert.ok(n.aggregates.every(g=>fleetService(content.classes[g.class_id])==='warship'));
    const all=s.nations[id].groups;
    assert.equal(new Set(all.map(g=>g.id)).size,all.length);
    assert.ok(all.every(g=>g.service===fleetService(content.classes[g.classId])));
  }
  assert.equal(sim.fleetSummary(s,content,'JPN').active,105);
  assert.equal(sim.fleetSummary(s,content,'JPN').reserve,40);
  assert.equal(sim.supportSummary(s,content,'JPN').total,10);
  assert.equal(sim.supportSummary(s,content,'JPN').tons,47000);
  assert.equal(sim.merchantSummary(s,content,'JPN').managed,500);
  assert.equal(sim.merchantSummary(s,content,'JPN').other,1646);
  assert.equal(sim.supportSummary(s,content,'GBR').total,16);
  assert.equal(sim.supportSummary(s,content,'GBR').unknownTonnage,16);
});

test('merchant counts cannot inflate naval power, displacement, crew demand, supply or upkeep',()=>{
  const s=sim.newGame(content);
  const before={fleet:sim.fleetSummary(s,content),power:sim.fleetPower(s,content),income:sim.monthlyIncome(s,content),supply:sim.supply(s,content,'JPN','pacific'),treaty:sim.treatyLedger(s,content)};
  s.nations.JPN.groups.find(g=>g.id==='a-JPN-10').count=900000;
  s.nations.JPN.merchant.otherHulls=100000;
  assert.deepEqual({fleet:sim.fleetSummary(s,content),power:sim.fleetPower(s,content),income:sim.monthlyIncome(s,content),supply:sim.supply(s,content,'JPN','pacific'),treaty:sim.treatyLedger(s,content)},before);
  sim.setPriority(s,'decisive','indian');
  assert.ok(s.nations.JPN.groups.filter(g=>g.service!=='warship').every(g=>!g.destination));
});

test('civilian merchant hulls remain outside naval construction and warship totals',()=>{
  const s=sim.newGame(content);s.autoPause=false;
  Object.assign(s.nations.JPN,{gold:1e7,influence:1000,industry:1e7});
  const n=s.nations.JPN,before=sim.fleetSummary(s,content),load=sim.yardLoad(s,content).work;
  assert.throws(()=>sim.orderShip(s,content,'standard_maru_t23',2),/active national catalog/);
  assert.equal(sim.yardLoad(s,content).work,load);
  assert.deepEqual(sim.fleetSummary(s,content),before);
  assert.equal(sim.merchantSummary(s,content).building,0);
  assert.equal(sim.merchantSummary(s,content).total,2146);
  assert.equal(n.delivered,0);assert.equal(n.merchantDelivered,0);
  assert.equal(sim.fleetSummary(s,content).active,105);
  assert.equal(sim.supportSummary(s,content).total,10);
  assert.doesNotThrow(()=>validateSave(s,content));
});

test('useful legacy formations are present while explicit retirement and construction plans stay intact',()=>{
  const s=sim.newGame(content),count=(id,c)=>s.nations[id].groups.filter(g=>g.classId===c).reduce((v,g)=>v+g.count,0);
  assert.equal(count('USA','omaha'),10);
  assert.equal(new Set(s.nations.USA.groups.filter(g=>g.classId==='omaha').map(g=>g.name)).size,10);
  for(const g of s.nations.JPN.groups.filter(g=>['BB','BC'].includes(content.classes[g.classId].type)))assert.equal(g.status,'active');
  const capital=s.nations.GBR.groups.filter(g=>g.legacy&&['BB','BC'].includes(content.classes[g.classId].type));
  assert.deepEqual(capital.map(g=>g.id).sort(),['h-hms_hood','h-hms_renown','h-hms_repulse','h-hms_barham','h-hms_malaya'].sort());
  assert.match(capital.find(g=>g.id==='h-hms_barham').name,/HMAS Australia/);
  assert.match(capital.find(g=>g.id==='h-hms_malaya').name,/HMAS Anzac/);
  assert.equal(count('GBR','queen_elizabeth'),2);assert.equal(count('GBR','revenge'),0);assert.equal(count('GBR','iron_duke'),0);
  assert.equal(count('GBR','danae')+count('GBR','emerald')+count('GBR','c_class_cl'),14);
  assert.equal(s.nations.DEU.groups.filter(g=>g.status==='active'&&content.classes[g.classId].type==='BB').length,6);
  assert.equal(count('DEU','gazelle_cl')+count('DEU','bremen_cl')+count('DEU','emden_cl'),7);
});

test('old campaign migration preserves progress, losses and player readiness and runs exactly once',()=>{
  const s=oldRoster();s.day+=1000;s.fraction=.6;
  const jp=s.nations.JPN;jp.gold=12345;jp.influence=42;jp.industry=7890;
  const lost=s.nations.USA.groups.find(g=>g.id==='h-uss_colorado');lost.count=0;lost.status='sunk';lost.health=0;
  const order=jp.groups.find(g=>g.id==='a-JPN-1');order.progress=.81;order.paid.gold=2000;
  const old=structuredClone(s),m=validateSave(s,content);
  assert.deepEqual(s,old,'loading must not mutate the old save object');
  assert.equal(m.day,s.day);assert.equal(m.fraction,s.fraction);assert.equal(m.seed,s.seed);
  for(const k of ['gold','influence','industry'])assert.equal(m.nations.JPN[k],jp[k]);
  assert.deepEqual(m.nations.JPN.groups.find(g=>g.id===order.id).paid,order.paid);
  assert.equal(m.nations.JPN.groups.find(g=>g.id===order.id).progress,.81);
  assert.equal(m.nations.JPN.groups.find(g=>g.id==='h-ijn_nagato').status,'reserve');
  assert.equal(m.nations.USA.groups.find(g=>g.id===lost.id).count,0);
  assert.equal(m.nations.USA.groups.find(g=>g.id===lost.id).status,'sunk');
  assert.equal(sim.merchantSummary(m,content).total,2146);assert.equal(sim.supportSummary(m,content).total,10);
  assert.equal(m.nations.USA.groups.filter(g=>g.classId==='omaha').length,10);
  assert.equal(m.rosterRevision,2);
  assert.deepEqual(validateSave(m,content),m,'reload must not add ships or change the register again');
});

test('an untouched old opening gets corrected readiness; malformed new registers are rejected',()=>{
  const migrated=validateSave(oldRoster(),content);
  assert.equal(migrated.nations.JPN.groups.find(g=>g.id==='h-ijn_nagato').status,'active');
  assert.equal(migrated.nations.DEU.groups.find(g=>g.id==='h-km_hannover').status,'active');
  for(const mutate of [s=>delete s.nations.JPN.merchant,s=>s.nations.USA.merchant.otherHulls=-1,s=>s.nations.JPN.groups[0].service='merchant',s=>s.rosterRevision=99]){
    const s=sim.newGame(content);mutate(s);assert.throws(()=>validateSave(s,content),/compatible/);
  }
});
