import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,advanceMinutes,resolvePortAction,reserveGroup,scrapGroup} from '../src/engine.mjs';
import {contentFor} from '../src/campaign-content.mjs';
import {aircraftModels,operationalAircraftModels,aircraftSummary,staffAircraft,airPower,facilityBudget,setFacilityFunding} from '../src/naval-resources.mjs';
import {allocatedWings,baseAirPower,flyBaseSorties,freeAircraft,modelFerryKm,aviationStockCapacity} from '../src/base-aviation.mjs';
import {dailyAviation,minuteAviation,dispatchAviation,ferryPath,shippingRisk} from '../src/aviation-transfer.mjs';
import {validateAviation} from '../src/aviation-validation.mjs';
import {bulkPlan,orderBulkFleet} from '../src/bulk-fleet.mjs';
import {campaignMinutes,setCampaignMinutes} from '../src/campaign-clock.mjs';
import {portSpec,portSummary} from '../src/ports.mjs';
import {NODES,PORTS,HOME_PORT,distanceNm,seaRoute} from '../src/world.mjs';
import {resourcesView} from '../src/ministry-view.mjs';
import {resourceHover} from '../src/resource-breakdown.mjs';
import {validateSave} from '../src/state-io.mjs';
import {coastalRecon} from '../src/shore-recon.mjs';
const bundle=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/staging')+'/content.json'));
const start=(id='JPN',campaign='in_good_faith_1936')=>{const s=newGame(bundle,id,16031,campaign);return [s,contentFor(bundle,s),s.nations[id]];};
function emptyAir(s,c,id){const n=s.nations[id];for(const g of n.groups)g.airWing=[];for(const b of Object.values(n.airBases)){b.airWing=[];b.governmentWing=[];b.reserve=[];}n.airTransfers=[];n.aircraft=Object.fromEntries(aircraftModels(c,id).map(a=>[a.id,0]));n.aviators=1000;return n;}
const finish=(s,c,t)=>{setCampaignMinutes(s,t.arriveAt+1);minuteAviation(s,c);};

test('all fourteen openings count real shore establishments, only period models, and conserved airframes/crews',()=>{
 for(const campaign of Object.keys(bundle.campaigns))for(const id of Object.keys(bundle.campaigns[campaign].nations)){
  const [s,c,n]=start(id,campaign),a=aircraftSummary(s,c);assert.equal(validateAviation(s,c),true);assert.equal(a.total,a.assigned+a.stationed+a.transit+a.reserve);
  const year=new Date(s.day*86400000).getUTCFullYear();for(const w of allocatedWings(n))if(w.count)assert.ok(operationalAircraftModels(c,id).find(a=>a.id===w.model).type_year<=year);
  for(const port of Object.keys(n.airBases))assert.equal(portSummary(s,c,port).assignedAircraft,[...n.airBases[port].airWing,...n.airBases[port].governmentWing].reduce((v,w)=>v+w.count,0));
 }
});
test('shore reach and strike power use each stationed model, crews, condition and supplies',()=>{
 const [s,c]=start('USA'),n=emptyAir(s,c,'USA'),m=aircraftModels(c,'USA').find(a=>a.role==='strike'&&a.type_year===1936),b=n.airBases.hawaii;
 n.aircraft[m.id]=10;b.airWing=[{model:m.id,role:'strike',count:10,crewed:10}];b.supplies=100;
 const p=baseAirPower(s,c,'hawaii',m.fuel.combat_radius_km);assert.ok(p.strike>0);assert.equal(p.radius,m.fuel.combat_radius_km);assert.equal(baseAirPower(s,c,'hawaii',p.radius+1).strike,0);
 b.supplies=5;assert.equal(baseAirPower(s,c,'hawaii').strike,p.strike*.5);s.ports.hawaii.health=.5;assert.equal(baseAirPower(s,c,'hawaii').strike,p.strike*.25);b.airWing[0].crewed=0;assert.equal(baseAirPower(s,c,'hawaii').strike,0);
});
test('base sorties consume finite stores and require preparation time',()=>{
 const [s,c,n]=start();const port='yokosuka',before=n.airBases[port].supplies,p=flyBaseSorties(s,c,port,0);assert.ok(p.sorties>0);assert.equal(n.airBases[port].supplies,before-p.sorties);assert.equal(flyBaseSorties(s,c,port,0).sorties,0);
 setCampaignMinutes(s,campaignMinutes(s)+360);assert.ok(flyBaseSorties(s,c,port,0).sorties>0);
});
test('ferry flights remove available reserve until arrival and conserve inventory',()=>{
 const [s,c]=start(),n=emptyAir(s,c,'JPN'),a=aircraftModels(c,'JPN')[0];n.aircraft[a.id]=6;
 const path=ferryPath(s,c,'JPN','yokosuka','kure',a);assert.ok(path);const t=dispatchAviation(s,c,'JPN',{destination:'kure',model:a.id,count:6});assert.equal(t.mode,'ferry');assert.equal(aircraftSummary(s,c).transit,6);assert.equal(freeAircraft(n)[a.id],0);assert.equal(n.airBases.kure.airWing.length,0);validateAviation(s,c);
 while(n.airTransfers.length)finish(s,c,t);assert.equal(n.airBases.kure.airWing[0].count,6);assert.equal(n.aircraft[a.id],6);validateAviation(s,c);
});
test('carriers receive ferry aircraft at sea; an unreachable moving carrier diverts the flight',()=>{
 const [s,c]=start(),n=emptyAir(s,c,'JPN'),a=aircraftModels(c,'JPN')[0],g=n.groups.find(g=>g.fleetId&&c.classes[g.classId].air>6&&g.status==='active'),f=n.fleets.find(f=>f.id===g.fleetId),now=campaignMinutes(s);
 f.phase='patrol';f.route=[[NODES.yokosuka[0]+1,NODES.yokosuka[1]]];f.departAt=f.arriveAt=now;g.atSea=true;n.aircraft[a.id]=12;
 const t=dispatchAviation(s,c,'JPN',{destination:g.id,model:a.id,count:6});assert.equal(t.mode,'ferry');finish(s,c,t);assert.equal(g.airWing[0].count,6);
 const later=dispatchAviation(s,c,'JPN',{destination:g.id,model:a.id,count:6});f.route=[NODES.hawaii];while(n.airTransfers.includes(later))finish(s,c,later);assert.equal(g.airWing[0].count,6);assert.equal(n.airBases.yokosuka.reserve.reduce((v,w)=>v+w.count,0),6);assert.equal(n.aircraft[a.id],12);validateAviation(s,c);
});
test('distant reinforcements use real merchant hulls; transport loss removes aircraft and aircrews',()=>{
 const [s,c]=start('USA'),n=emptyAir(s,c,'USA'),a=aircraftModels(c,'USA').find(a=>a.type_year<=1936);n.aircraft[a.id]=6;
 const t=dispatchAviation(s,c,'USA',{destination:'manila',model:a.id,role:'fighter',count:6}),v=n.convoys.find(v=>v.id===t.convoyId);assert.equal(t.mode,'merchant');assert.equal(v.count,3);const people=n.aviators;v.count=2;minuteAviation(s,c);assert.equal(n.aircraft[a.id],4);assert.ok(n.aviators<people);assert.equal(n.casualties.aircraft.lost,2);finish(s,c,t);assert.equal(n.airBases.manila.airWing[0].count,4);assert.ok(!n.convoys.includes(v));validateAviation(s,c);
});
test('known unsafe sea routes hold reinforcement without spending or exposing live enemy positions',()=>{
 const [s,c]=start('USA'),n=emptyAir(s,c,'USA'),a=aircraftModels(c,'USA').find(a=>a.type_year<=1936);n.aircraft[a.id]=6;s.relations['JPN-USA'].war=true;s.ports.manila.blockade=.8;const before=[n.gold,n.industry,n.aircraft[a.id]];
 assert.equal(dispatchAviation(s,c,'USA',{destination:'manila',model:a.id,role:'fighter',count:6}),null);assert.deepEqual([n.gold,n.industry,n.aircraft[a.id]],before);
 s.ports.manila.blockade=0;const route=seaRoute('san_diego','manila').map(k=>NODES[k]);n.contacts=[{nation:'JPN',position:route[Math.floor(route.length/2)],estimate:40,seenAt:campaignMinutes(s)}];assert.ok(shippingRisk(s,c,'USA',route,'manila')>.6);n.contacts[0].seenAt-=3000;assert.equal(shippingRisk(s,c,'USA',route,'manila'),0);
});
test('captured ports lose their former air groups without duplicating them for the occupier',()=>{
 const [s,c,n]=start('USA'),base=n.airBases.manila,count=base.airWing.reduce((v,w)=>v+w.count,0),before=aircraftSummary(s,c).total;s.world.portControl.manila='JPN';dailyAviation(s,c);assert.ok(!n.airBases.manila);assert.equal(s.nations.JPN.airBases.manila.airWing.length,0);assert.equal(aircraftSummary(s,c).total,before-count);validateAviation(s,c);
});
test('ferry arrivals and merchant voyages survive strict save round trips',()=>{
 const [s,c]=start('USA'),n=emptyAir(s,c,'USA'),a=aircraftModels(c,'USA').find(a=>a.type_year<=1936);n.aircraft[a.id]=12;dispatchAviation(s,c,'USA',{destination:'manila',model:a.id,role:'fighter',count:6});const copy=validateSave(JSON.parse(JSON.stringify(s)),bundle);assert.equal(copy.nations.USA.airTransfers.length,1);validateAviation(copy,c);
 const invalid=structuredClone(s);invalid.nations.USA.airTransfers[0].airWing[0].count=100000;assert.throws(()=>validateSave(invalid,bundle));
});
test('warehouse capture loses stored aircraft rather than teleporting reserves to a new arsenal',()=>{
 const [s,c]=start(),n=emptyAir(s,c,'JPN'),a=aircraftModels(c,'JPN')[0];n.aircraft[a.id]=12;s.world.portControl.yokosuka='USA';dailyAviation(s,c);assert.equal(n.aircraft[a.id],0);assert.equal(n.casualties.aircraft.lost,12);assert.notEqual(n.airWarehousePort,'yokosuka');validateAviation(s,c);
});
test('ferry planning cannot bypass a future model date or depart without full aircrews',()=>{
 const [s,c]=start(),n=emptyAir(s,c,'JPN'),models=aircraftModels(c,'JPN'),future=models.find(a=>a.type_year>1936);n.aircraft[future.id]=6;n.aircraftUnlocked.push(future.id);assert.equal(dispatchAviation(s,c,'JPN',{destination:'kure',model:future.id,count:6}),null);
 const a=models[0];n.aircraft[a.id]=6;n.aviators=0;assert.equal(dispatchAviation(s,c,'JPN',{destination:'kure',model:a.id,count:6}),null);assert.equal(n.aircraft[a.id],6);assert.equal(n.airTransfers.length,0);
});
test('stationed scouts reveal reachable forces only while their base has crews and supplies',()=>{
 const [s,c]=start(),n=emptyAir(s,c,'JPN'),a=aircraftModels(c,'JPN')[0],base=n.airBases.yokosuka,foreign=s.nations.USA.fleets[0];n.aircraft[a.id]=40;base.airWing=[{model:a.id,role:'scout',count:40,crewed:40}];base.supplies=1000;n.contacts=[];
 foreign.route=[[NODES.yokosuka[0]+.01,NODES.yokosuka[1]]];foreign.arriveAt=foreign.departAt=campaignMinutes(s);foreign.phase='patrol';
 for(let i=0;i<16&&!n.contacts.some(x=>x.id===foreign.id);i++){setCampaignMinutes(s,s.day*1440+i*60+17);coastalRecon(s,c);}assert.ok(n.contacts.some(x=>x.id===foreign.id&&x.source==='Scouting'));
 base.supplies=0;n.contacts=[];for(let i=16;i<24;i++){setCampaignMinutes(s,s.day*1440+i*60+17);coastalRecon(s,c);}assert.equal(n.contacts.length,0);validateAviation(s,c);
});
test('port gun ranges follow battery profiles; zero guns cannot fire and research does not change range',()=>{
 const [s,c,n]=start();assert.equal(portSpec(s,'wake').gunRange,0);assert.equal(portSpec(s,'manila').gunRangeKm,27.4);assert.ok(portSpec(s,'yokosuka').gunRange>portSpec(s,'truk').gunRange);const before=portSummary(s,c,'yokosuka');n.tech.gunnery=9;const after=portSummary(s,c,'yokosuka');assert.equal(before.gunRange,after.gunRange);assert.ok(after.artillery>before.artillery);
});
test('bulk reserve/recommission/scrap uses eligibility and aggregate affordability',()=>{
 const [s,c,n]=start(),groups=n.groups.filter(g=>g.service==='warship'&&g.status==='active'&&!g.atSea).slice(0,3),ids=groups.map(g=>g.id);assert.equal(bulkPlan(s,ids,'reserve').groups.length,3);orderBulkFleet(s,c,ids,'reserve');assert.ok(groups.every(g=>g.status==='reserve'));const gold=n.gold;n.gold=0;assert.throws(()=>orderBulkFleet(s,c,ids,'recommission'));assert.ok(groups.every(g=>g.status==='reserve'));n.gold=gold;orderBulkFleet(s,c,ids,'recommission');assert.ok(groups.every(g=>g.status==='repair'));orderBulkFleet(s,c,ids,'scrap');assert.ok(groups.every(g=>g.status==='scrapped'));validateAviation(s,c);
});
test('facility hovers and cards expose funded operating costs without NaN or undefined',()=>{
 const [s,c]=start();const high=facilityBudget(s,c);setFacilityFunding(s,'aircraftFunding',.1);const low=facilityBudget(s,c);assert.ok(low.rows[1].gold<high.rows[1].gold);assert.match(resourcesView(s,c),/Gold \/ month/);
 for(const key of ['GOLD','INDUSTRY','INFLUENCE','TRADE','SHIPPING','PORT TRADE','LOGISTICS','SUPPLY','TRAINING','MORALE','YARDS','SAILORS ±','AVIATORS ±','AIRCRAFT'])assert.doesNotMatch(resourceHover(s,c,key),/undefined|NaN/);
});
test('two weeks of minute updates retain physical aircraft and valid operating states',()=>{
 const [s,c]=start('USA');s.autoPause=false;s.decisions=[];s.paused=false;advanceMinutes(s,bundle,14*1440,{respectPause:false});assert.equal(validateAviation(s,c),true);validateSave(s,bundle);
});
