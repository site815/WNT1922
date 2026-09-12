import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,resolveAirAttack,damageFleet,advanceMinutes} from '../src/engine.mjs';
import {contentFor} from '../src/campaign-content.mjs';
import {campaignMinutes,setCampaignMinutes} from '../src/campaign-clock.mjs';
import {airConditions,sectorFactor} from '../src/air-conditions.mjs';
import {aircraftFitsShip} from '../src/aircraft-compatibility.mjs';
import {queueAirStrike,minuteAirOperations,combatAirPatrol} from '../src/air-operations.mjs';
import {aircraftModels,operationalAircraftModels,aircraftSummary,orderAircraft,staffAircraft} from '../src/naval-resources.mjs';
import {fleetStats,fleetPosition,recordContact} from '../src/task-forces.mjs';
import {allocatedWings,baseAirPower,freeAircraft} from '../src/base-aviation.mjs';
import {dailyAviation,dispatchAviation,ferryPath,minuteAviation} from '../src/aviation-transfer.mjs';
import {governmentProduction} from '../src/government-aviation.mjs';
import {validateAviation} from '../src/aviation-validation.mjs';
import {validateSave} from '../src/state-io.mjs';
import {observeAnchorage} from '../src/shore-recon.mjs';
import {minutePortOperations} from '../src/port-operations.mjs';
import {aircraftCatalogView,battleDetails} from '../src/ministry-view.mjs';
import {portPopup} from '../src/inspection-view.mjs';
import {NODES} from '../src/world.mjs';
const bundle=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/staging')+'/content.json'));
const start=(id='JPN',campaign='in_good_faith_1936')=>{const s=newGame(bundle,id,190031,campaign);return [s,contentFor(bundle,s),s.nations[id]];};
function setup(){
 const [s,c,n]=start(),f=n.fleets.find(f=>fleetStats(s,c,'JPN',f).air>10),b=s.nations.USA.fleets.find(f=>fleetStats(s,c,'USA',f).hulls>4),day=s.day;
 for(let i=0;i<7*1440;i+=30){setCampaignMinutes(s,day*1440+i);if([0,90,240,420].every(dt=>airConditions(s,[140,30],campaignMinutes(s)+dt).launch>.5))break;}
 const now=campaignMinutes(s);for(const [id,force,pos]of [['JPN',f,[140,30]],['USA',b,[142,30]]]){force.route=[pos];force.phase='patrol';force.departAt=force.arriveAt=now;force.lastBattle=-1e9;force.nextPlanAt=now+10000;for(const g of s.nations[id].groups.filter(g=>g.fleetId===force.id))g.atSea=true;}
 Object.assign(s.relations['JPN-USA'],{war:true,warSince:s.day,allied:false});recordContact(s,'JPN','USA',b,fleetPosition(s,b),fleetStats(s,c,'USA',b));
 return {s,c,n,f,b,request:{fleetId:f.id,targetNation:'USA',targetId:b.id,targetKind:'fleet',position:fleetPosition(s,b)}};
}
const due=(s,c,n)=>{const op=n.airSorties[0];setCampaignMinutes(s,Math.ceil(op.readyAt));minuteAirOperations(s,c,(id,o,pos)=>resolveAirAttack(s,c,id,o,pos));return op;};
test('all 14 catalogs have strict three-year fits, preserved Japan program and compatible opening inventories',()=>{
 for(const campaign of Object.keys(bundle.campaigns))for(const id of Object.keys(bundle.campaigns[campaign].nations)){
  const [s,c,n]=start(id,campaign),models=aircraftModels(c,id),years=[...new Set(models.map(a=>a.type_year))];
  if(id==='JPN'&&campaign==='in_good_faith_1936')assert.deepEqual(models.map(a=>a.id),['hibari_t33','raiden_t39','tenzan_t39','shinden_t44']);else for(let i=1;i<years.length;i++)assert.equal(years[i]-years[i-1],3);
  const government=c.nations[id].armyAircraft;assert.ok(government.length>=10);assert.ok(government.every(a=>a.readOnly&&a.catalogKind==='government'&&!a.basing.carrier));
  for(const g of n.groups)for(const w of g.airWing)assert.ok(aircraftFitsShip(models.find(a=>a.id===w.model),c.classes[g.classId]));
  const all=new Map(operationalAircraftModels(c,id).map(a=>[a.id,a]));for(const w of allocatedWings(n))if(w.count)assert.ok(all.get(w.model).type_year<=Number(c.scenario.start.slice(0,4)));
  validateAviation(s,c);validateSave(s,bundle);
 }
});
test('regional conditions and sectors are deterministic without consuming combat randomness',()=>{
 const [s]=start(),seed=s.seed,a=airConditions(s,[0,0],Date.parse('1936-03-21T12:00Z')/60000),night=airConditions(s,[0,0],Date.parse('1936-03-21T00:00Z')/60000);
 assert.equal(a.light,'Daylight');assert.equal(night.launch,0);assert.deepEqual(a,airConditions(s,[0,0],Date.parse('1936-03-21T12:00Z')/60000));assert.equal(s.seed,seed);assert.ok(sectorFactor(90,[0,0],[2,0])>sectorFactor(90,[0,0],[-2,0]));
});
test('strikes assemble, carry escorts, leave CAP, fly, fight and recover without remote gun damage',()=>{
 const {s,c,n,f,request}=setup(),before=aircraftSummary(s,c).total,health=n.groups.map(g=>g.health);assert.equal(queueAirStrike(s,c,'JPN',request),true);assert.equal(queueAirStrike(s,c,'JPN',request),false);
 assert.equal(n.airSorties[0].phase,'assembling');const op=due(s,c,n);assert.equal(op.phase,'outbound');assert.ok(op.strikes>0&&op.escorts>0&&combatAirPatrol(s,c,'JPN',{fleetId:f.id}).count>0);assert.ok(aircraftSummary(s,c).airborne>0);validateAviation(s,c);validateSave(s,bundle);
 due(s,c,n);assert.equal(op.phase,'returning');assert.ok(s.reports[0].airOperation);assert.equal(s.reports[0].powerA.surface,0);assert.deepEqual(n.groups.map(g=>g.health),health);assert.ok(s.reports[0].resultB.damagePercent>0);assert.doesNotMatch(battleDetails(s.reports[0]),/undefined|NaN/);validateAviation(s,c);
 due(s,c,n);assert.equal(op.phase,'rearming');assert.equal(aircraftSummary(s,c).airborne,0);due(s,c,n);assert.equal(n.airSorties.length,0);assert.equal(aircraftSummary(s,c).total,before-n.casualties.aircraft.lost-n.casualties.aircraft.rescued);validateAviation(s,c);validateSave(s,bundle);
});
test('night launches, incompatible aircraft, future orders and stale moving targets are rejected',()=>{
 const {s,c,n,f,b,request}=setup();setCampaignMinutes(s,Date.parse('1936-01-02T15:00Z')/60000);assert.equal(airConditions(s,[140,30]).light,'Night');assert.equal(queueAirStrike(s,c,'JPN',request),false);
 const a=c.nations.JPN.armyAircraft.find(a=>a.type_year<=1936),g=n.groups.find(g=>g.fleetId===f.id&&c.classes[g.classId].air>0);assert.equal(ferryPath(s,c,'JPN','yokosuka',g.id,a),null);assert.throws(()=>orderAircraft(s,c,a.id,1));
 const t=setup();assert.ok(queueAirStrike(t.s,t.c,'JPN',t.request));due(t.s,t.c,t.n);t.b.route=[[170,30]];due(t.s,t.c,t.n);assert.equal(t.s.reports.length,0);assert.equal(t.n.airSorties[0].phase,'returning');
});
test('airborne aircraft survive home-carrier loss and divert to a reachable shore base',()=>{
 const {s,c,n,f,request}=setup();f.route=[[140,35]];request.position=[141,35];const enemy=s.nations.USA.fleets.find(x=>x.id===request.targetId);enemy.route=[request.position];const initial=campaignMinutes(s);for(let i=0;i<7*1440;i+=30){setCampaignMinutes(s,initial+i);if([0,60,90,120,240,420].every(dt=>airConditions(s,[140,35],campaignMinutes(s)+dt).launch>.5))break;}n.contacts=[];recordContact(s,'JPN','USA',enemy,request.position,fleetStats(s,c,'USA',enemy));assert.ok(queueAirStrike(s,c,'JPN',request));const op=due(s,c,n),flying=op.airWing.reduce((v,w)=>v+w.count,0);assert.ok(flying>0);
 for(const g of n.groups.filter(g=>g.fleetId===f.id))g.health=.01;damageFleet(s,c,'JPN','pacific',1,{asw:10000,sub:0,surface:10000},'test torpedo attack',f.id,.3);const count=op.airWing.reduce((v,w)=>v+w.count,0);assert.equal(count,flying);due(s,c,n);due(s,c,n);assert.equal(op.airWing.length,0);assert.ok(n.airLog.some(l=>l.text.includes('diverted')));validateAviation(s,c);
});
test('government aircraft use a separate crew ledger, physical reinforcement and actual shore power',()=>{
 const [s,c,n]=start('USA'),a=c.nations.USA.armyAircraft.filter(a=>a.role==='maritime_strike'&&a.type_year<=1936).at(-1),before=n.aviators,owned=n.aircraft[a.id];n.governmentAircraft[a.id]+=6;n.governmentAviators+=6*a.crew.normal;
 const t=dispatchAviation(s,c,'USA',{destination:'manila',model:a.id,role:'strike',count:6});assert.ok(t);assert.equal(t.mode,'merchant');const v=n.convoys.find(v=>v.id===t.convoyId);v.count=0;minuteAviation(s,c);assert.equal(n.aviators,before);assert.equal(n.aircraft[a.id],owned);assert.ok(n.governmentLosses.planes>=6);validateAviation(s,c);
 const p=baseAirPower(s,c,'san_diego'),b=n.airBases.san_diego;b.governmentWing=[];assert.ok(baseAirPower(s,c,'san_diego').strike<p.strike);
 const html=aircraftCatalogView(s,c);assert.match(html,/Government managed/);assert.ok(!html.includes('data-action="air-design" data-id="'+a.id));
});
test('enemy anchorage observations retain dated composition without exposing current base inventory',()=>{
 const [s,c,n]=start();observeAnchorage(s,c,'JPN','san_diego','Fleet aerial reconnaissance');const report=structuredClone(n.anchorageReports.san_diego);s.nations.USA.groups.forEach(g=>g.count=0);assert.deepEqual(n.anchorageReports.san_diego,report);const html=portPopup(s,c,'san_diego');assert.match(html,/Last observed ships/);assert.doesNotMatch(html,/Stationed air groups/);
});
test('carrier anchorage missions hold offshore without changing position or entering battery range',()=>{
 const {s,c,n,f}=setup();const pos=[124,15];f.route=[pos];f.role='carrier';f.mission='anchorage';f.objectiveNode='manila';f.nextPortAction=-1e9;f.fuelNm=f.maxRangeNm;
 setCampaignMinutes(s,Math.floor(campaignMinutes(s)/15)*15+7);observeAnchorage(s,c,'JPN','manila','Fleet aerial reconnaissance');const before=fleetPosition(s,f);minutePortOperations(s,c,()=>{});assert.deepEqual(fleetPosition(s,f),before);assert.deepEqual(f.route,[before]);assert.equal(f.phase,'patrol');assert.ok(f.nextPlanAt>=campaignMinutes(s)+30);
});
