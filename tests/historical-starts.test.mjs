import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { readDocument } from '../worker/documents.mjs';
import { newGame, advanceMinutes, initializeCampaign, historicalRepairAccess } from '../mechanics/engine.mjs';
import { contentFor, campaignList } from '../mechanics/campaign-content.mjs';
import { validateSave } from '../mechanics/state-io.mjs';
import { setCampaignMinutes, minutesAt, HISTORICAL_POLAND, HISTORICAL_BRITAIN } from '../mechanics/campaign-clock.mjs';
import { dailyWorld } from '../mechanics/land-war.mjs';
import { portOwner } from '../mechanics/ports.mjs';
import { usablePorts } from '../mechanics/task-forces.mjs';
import { aircraftFitsShip } from '../mechanics/aircraft-compatibility.mjs';
import { planeRole } from '../mechanics/naval-resources.mjs';
import { aiDoctrine } from '../mechanics/ai-planning.mjs';
import { graduationProgress } from '../mechanics/personnel-training.mjs';
import fs from 'node:fs/promises';

const EUROPE='eve_european_war_1939', PACIFIC='eve_pacific_war_1941';
const create=(campaign,player='USA',seed=480048)=>newGame(CATALOG,player,seed,campaign);
const hull=(s,nation,name)=>s.nations[nation].groups.find(g=>g.name===name);
const at=(s,iso)=>{setCampaignMinutes(s,minutesAt(iso));s.decisions=[];s.paused=false;s.autoPause=false;};

test('four campaign identities expose exact historical dates and preserve the alternate opening',()=>{
  const scenarios=Object.fromEntries(campaignList(CATALOG).map(s=>[s.id,s]));
  assert.equal(Object.keys(scenarios).length,4);
  for(const [id,start,category]of[
    ['campaign_1922','1922-02-06','historical'],['in_good_faith_1936','1936-01-01','alternate'],
    [EUROPE,'1939-08-01','historical'],[PACIFIC,'1941-11-01','historical'],
  ]){
    assert.equal(scenarios[id].start,start);assert.equal(scenarios[id].category,category);
    const s=create(id);assert.equal(new Date(s.day*86400000).toISOString().slice(0,10),start);
  }
  for(const id of[EUROPE,PACIFIC])for(const seed of[0,1,480048,4294967295]){
    const s=create(id,'USA',seed);
    assert.equal(s.timeline.offsetDays,0);assert.equal(s.timeline.polandAt,HISTORICAL_POLAND);
    assert.equal(s.timeline.britainAt,HISTORICAL_BRITAIN);
    assert.equal(CATALOG.campaigns[id].scenario.baseMap,'1936hindsight');
  }
});

test('all twenty-eight nation openings initialize, advance a real tick, and save/reload',()=>{
  let count=0;
  for(const [id,c]of Object.entries(CATALOG.campaigns))for(const nation of Object.keys(c.nations)){
    const s=create(id,nation),seed=s.seed;
    const loaded=validateSave(JSON.parse(JSON.stringify(s)),CATALOG);
    assert.equal(loaded.campaignId,id);assert.equal(loaded.seed,seed);
    assert.deepEqual(loaded.nations[nation].groups,s.nations[nation].groups);
    assert.deepEqual(loaded.world,s.world);
    advanceMinutes(loaded,CATALOG,15);
    assert.equal(loaded.minuteTicks,1);
    validateSave(JSON.parse(JSON.stringify(loaded)),CATALOG);count++;
  }
  assert.equal(count,28);
});

test('date-specific named hulls exclude prior losses without preapplying future battles',()=>{
  const a=create(EUROPE),b=create(PACIFIC);
  for(const name of ['HMS Hood','HMS Royal Oak','HMS Courageous','HMS Glorious']){
    assert(hull(a,'GBR',name),name+' exists in August 1939');assert(!hull(b,'GBR',name),name+' lost before November 1941');
  }
  assert.equal(hull(a,'DEU','Bismarck').status,'building');assert(!hull(b,'DEU','Bismarck'));
  assert(hull(a,'DEU','Admiral Graf Spee'));assert(!hull(b,'DEU','Admiral Graf Spee'));
  assert(!hull(a,'USA','USS Hornet'));assert.equal(hull(b,'USA','USS Hornet').status,'reserve');
  assert.equal(hull(a,'USA','USS North Carolina').status,'building');
  assert.equal(hull(b,'USA','USS North Carolina').status,'active');
  assert.equal(hull(b,'GBR','HMS Duke of York').status,'building');
  assert.equal(hull(b,'JPN','Yamato').status,'building');
  for(const name of ['Shokaku','Zuikaku']){assert.equal(hull(a,'JPN',name).status,'building');assert.equal(hull(b,'JPN',name).status,'active');}
  for(const name of ['HMS Barham','HMS Ark Royal','HMS Prince of Wales','HMS Repulse'])assert(hull(b,'GBR',name),name+' not yet lost');
  for(const name of ['USS Arizona','USS Oklahoma','USS California'])assert.equal(hull(b,'USA',name).status,'active');
  assert.equal(hull(a,'GBR','HMS Renown').status,'repair');assert.equal(hull(a,'JPN','Hiei').status,'repair');
});

test('historical starts use authored real classes and available equipment, not the alternate naval program',async()=>{
  const legacy=await readDocument('1922/ships.md'),common=await readDocument('common/ships.md'),historical=await readDocument('common/historical/ships.md');
  const allowed=new Set([...Object.keys(legacy),...Object.keys(common),...Object.keys(historical)]);
  for(const id of [EUROPE,PACIFIC]){
    const c=contentFor(CATALOG,id),s=create(id);
    for(const n of Object.values(c.nations)){
      for(const classId of n.designs)assert(allowed.has(classId),classId);
      for(const g of [...n.hulls,...n.aggregates,...n.support])assert(allowed.has(g.class_id),g.class_id);
      for(const a of n.aircraft)assert(a.representativeModel&&a.modelId,'aircraft visual approximation disclosed');
    }
    assert(!s.decisions.some(d=>/good-faith|vanishing|hindsight/i.test(d.key)));
  }
});

test('1939 starts before the Nazi-Soviet pact and European declarations; 1941 starts with the existing wars',()=>{
  const a=create(EUROPE),b=create(PACIFIC);
  assert(Object.values(a.relations).every(r=>!r.war));
  assert(a.relations['FRA-GBR'].allied);assert(a.relations['DEU-ITA'].allied);
  assert(!a.pacts.some(p=>/molotov/i.test(p.id)));
  for(const key of ['DEU-GBR','GBR-ITA','DEU-SOV','ITA-SOV'])assert(b.relations[key].war,key);
  for(const key of ['JPN-USA','GBR-JPN','JPN-SOV','DEU-USA','DEU-FRA','FRA-ITA'])assert(!b.relations[key].war,key);
  assert(b.relations['GBR-SOV'].allied);assert(b.relations['DEU-JPN'].allied);
  assert(b.timeline.polandOccurred&&b.timeline.europeOccurred);
  assert.equal(b.relations['DEU-GBR'].warSince,minutesAt('1939-09-03T00:00:00Z')/1440);
  const loaded=validateSave(b,CATALOG);assert.equal(loaded.relations['DEU-GBR'].warSince,b.relations['DEU-GBR'].warSince);
});

test('occupied ports and fronts exist before initialization and persist through daily world recomputation',()=>{
  const a=create(EUROPE),b=create(PACIFIC);
  assert.equal(a.world.control.c305,'DEU');assert.equal(a.world.control.c315,'DEU');assert.equal(a.world.control.c339,'ITA');
  assert.notEqual(a.world.control.c290,'DEU');
  for(const s of [a,b]){
    assert.equal(s.world.openingDay,s.day);assert(s.world.fronts.some(f=>f.id==='china'&&f.progress>0&&f.progress<1));
    dailyWorld(s,contentFor(CATALOG,s));
    assert.equal(s.world.control.c305,'DEU');assert.equal(s.world.control.c315,'DEU');assert.equal(s.world.control.c339,'ITA');
    validateSave(JSON.parse(JSON.stringify(s)),CATALOG);
  }
  assert.equal(portOwner(b,'brest'),'DEU');assert.equal(portOwner(b,'saigon'),'JPN');
  assert.equal(b.world.stationControl.saigon,'JPN');
  assert(b.world.fronts.find(f=>f.id==='france').progress>0);
  assert(b.world.fronts.find(f=>f.id==='france').progress<1,'France is not represented as wholly occupied');
  assert.equal(b.world.fronts.find(f=>f.id==='poland').lastOutcome,'Occupied');
});

test('historical news is not replayed at opening; later exact war boundaries still execute',()=>{
  const s=create(PACIFIC);s.decisions=[];
  advanceMinutes(s,CATALOG,0);
  assert(!s.decisions.some(d=>/barbarossa|poland|vichy|italian-entry|southern-indochina/.test(d.key)));
  assert(!s.completedEvents.includes('pacific-war'));
  at(s,'1941-12-07T17:45:00Z');advanceMinutes(s,CATALOG,0);assert(!s.relations['JPN-USA'].war);
  at(s,'1941-12-07T18:00:00Z');advanceMinutes(s,CATALOG,0);assert(s.relations['JPN-USA'].war);
  assert(s.relations['GBR-JPN'].war);assert(!s.relations['DEU-USA'].war);
  const e=create(EUROPE);at(e,'1939-09-01T03:44:00Z');advanceMinutes(e,CATALOG,0);assert(!e.timeline.polandOccurred);
  setCampaignMinutes(e,HISTORICAL_POLAND);advanceMinutes(e,CATALOG,0);assert(e.timeline.polandOccurred);assert(!e.relations['DEU-GBR'].war);
  setCampaignMinutes(e,HISTORICAL_BRITAIN);advanceMinutes(e,CATALOG,0);assert(e.relations['DEU-GBR'].war);assert(e.relations['DEU-FRA'].war);
});

test('saved player changes are never reset to the authored historical opening',()=>{
  const s=create(PACIFIC),c=contentFor(CATALOG,s),g=hull(s,'USA','USS Arizona');
  g.health=.43;s.world.openingPortControl.brest='FRA';s.world.portControl.brest='FRA';
  s.world.fronts.find(f=>f.id==='east').progress=.36;
  s.relations['DEU-GBR'].war=false;
  initializeCampaign(s,c);
  const loaded=validateSave(JSON.parse(JSON.stringify(s)),CATALOG);
  assert.equal(hull(loaded,'USA','USS Arizona').health,.43);assert.equal(portOwner(loaded,'brest'),'FRA');
  assert.equal(loaded.world.fronts.find(f=>f.id==='east').progress,.36);assert(!loaded.relations['DEU-GBR'].war);
  for(const id of ['campaign_1922','in_good_faith_1936']){
    const legacy=create(id);assert.equal(legacy.world.openingDay,undefined);
    validateSave(JSON.parse(JSON.stringify(legacy)),CATALOG);
  }
});

test('historical neutral-yard repair contracts are hull-specific and do not grant fleet basing',()=>{
  const s=create(PACIFIC,'GBR'),g=hull(s,'GBR','HMS Warspite');
  assert.equal(g.openingRepairPort,'puget');assert(historicalRepairAccess(s,'GBR',g));
  assert(!s.relations['GBR-USA'].allied);assert(!usablePorts(s,'GBR').includes('puget'));
  const before=g.health;advanceMinutes(s,CATALOG,1440);assert(g.health>before,'existing yard work advances');
  validateSave(JSON.parse(JSON.stringify(s)),CATALOG);
  s.relations['GBR-USA'].war=true;assert(!historicalRepairAccess(s,'GBR',g));s.relations['GBR-USA'].war=false;
  s.world.portControl.puget='JPN';assert(!historicalRepairAccess(s,'GBR',g));delete s.world.portControl.puget;
  s.ports.puget.health=0;assert(!historicalRepairAccess(s,'GBR',g));s.ports.puget.health=1;
  const bad=structuredClone(s);hull(bad,'GBR','HMS Queen Elizabeth').openingRepairPort='puget';
  assert.throws(()=>validateSave(bad,CATALOG),/compatible/,'arbitrary repair contracts rejected');
  g.health=.9999;advanceMinutes(s,CATALOG,1440);assert.equal(g.status,'active');assert.equal(g.openingRepairPort,undefined);
  assert(!usablePorts(s,'GBR').includes('puget'));
});

test('historical aircraft assignments respect date, role and deck versus floatplane installations',()=>{
  for(const id of [EUROPE,PACIFIC]){
    const s=create(id),c=contentFor(CATALOG,s),year=Number(c.scenario.start.slice(0,4));
    for(const [nation,n]of Object.entries(s.nations)){
      const models=new Map(c.nations[nation].aircraft.map(a=>[a.id,a]));
      for(const g of n.groups)for(const w of g.airWing||[]){
        const a=models.get(w.model);assert(a,nation+'/'+w.model);assert(a.type_year<=year);
        assert(aircraftFitsShip(a,c.classes[g.classId]),nation+'/'+g.name+'/'+a.name);
        assert(planeRole(a)===w.role || planeRole(a)==='multirole' || (w.role==='scout'&&planeRole(a)==='strike'));
      }
    }
    for(const cl of Object.values(c.classes).filter(x=>x.id.startsWith('hist-'))){
      assert(cl.shp>0&&cl.speed>0&&cl.crew>0&&cl.range>0,cl.id);
      if(cl.type==='SS')assert(cl.submergedSpeed>0&&cl.submergedSpeed<cl.speed&&cl.aa<=4,cl.id);
    }
  }
  assert.equal(contentFor(CATALOG,EUROPE).classes['hist-yorktown'].radar,false);
  assert.equal(contentFor(CATALOG,PACIFIC).classes['hist-yorktown'].radar,true);
});

test('optional historical opening metadata is validated without narrowing existing saves',()=>{
  const s=create(PACIFIC);
  for(const mutate of[
    w=>w.openingDay=s.day+1,w=>w.openingControl=[],w=>w.openingPortControl={missing:'USA'},
    w=>w.openingPortControl={brest:'missing'},
  ]){const bad=structuredClone(s);mutate(bad.world);assert.throws(()=>validateSave(bad,CATALOG),/compatible/);}
  const bad=structuredClone(s);bad.relations['DEU-GBR'].warSince=minutesAt('1939-09-02T00:00:00Z')/1440;
  assert.throws(()=>validateSave(bad,CATALOG),/compatible/);
});

test('historical AI procurement and initial training periods do not inherit alternate-start assumptions',()=>{
  for(const id of [EUROPE,PACIFIC]){
    const s=create(id);
    for(const nation of Object.keys(s.nations)){
      assert.deepEqual(aiDoctrine(s,nation).roles,CATALOG.campaigns[id].nations[nation].ai.roles);
      assert.equal(Object.values(aiDoctrine(s,nation).roles).reduce((a,b)=>a+b,0),100);
    }
    assert(aiDoctrine(s,'FRA').roles.BB>aiDoctrine(create('in_good_faith_1936'),'FRA').roles.BB);
    assert.equal(aiDoctrine(s,'ITA').roles.CV,0);assert.equal(aiDoctrine(s,'SOV').roles.CV,0);
    for(const kind of ['sailors','aviators'])assert.equal(graduationProgress(s,s.nations.USA,kind).start,s.day);
  }
});

test('every authored model alias resolves to an existing ship or recognition asset',async()=>{
  const ships=JSON.parse(await fs.readFile('assets/models/ships/index.json','utf8'));
  const platforms=ships.models.flatMap(m=>m.platforms);
  const index=JSON.parse(await fs.readFile('assets/recognition/index.json','utf8'));
  const entries=(await Promise.all(index.registries.map(async file=>JSON.parse(await fs.readFile('assets/recognition/'+file,'utf8'))))).flatMap(r=>r.entries);
  const c=contentFor(CATALOG,PACIFIC);
  for(const cl of Object.values(c.classes).filter(cl=>cl.modelId)){
    assert(platforms.some(p=>p.id===cl.modelId&&(!p.campaign||p.campaign===cl.modelCampaign)),cl.id);
    const drawing=cl.recognitionModelId||cl.modelId,campaign=cl.recognitionCampaign||cl.modelCampaign;
    const matches=entries.filter(e=>e.kind==='ship'&&e.platforms?.some(p=>p.id===drawing&&(!p.campaign||p.campaign===campaign)));
    assert(matches.length,cl.id+' recognition alias');
    for(const e of matches)await fs.access(e.file);
    if(cl.recognitionModelId){assert.equal(cl.representativeDrawing,true);assert(cl.recognitionNote.length>40);}
  }
  for(const n of Object.values(c.nations))for(const a of n.aircraft){
    const matches=entries.filter(e=>e.platforms?.some(p=>p.id===a.modelId));
    assert(matches.length,n.nation+'/'+a.name+'/'+a.modelId);
    for(const e of matches)await fs.access(e.file);
  }
});
