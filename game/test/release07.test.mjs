import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as sim from '../src/engine.mjs';
import {contentFor} from '../src/campaign-content.mjs';
import {aircraftModels,aircraftSeats,allocateAircraft,staffAircraft} from '../src/naval-resources.mjs';
import {fleetStats,fleetPosition,invalidateOperations,setRoute,convoyCombatPower,minuteOperations} from '../src/task-forces.mjs';
import {portSummary,damagePort} from '../src/ports.mjs';
import {NODES,HOME_PORT} from '../src/world.mjs';
import {supplyDetails} from '../src/logistics.mjs';
import {campaignMinutes,setCampaignMinutes} from '../src/campaign-clock.mjs';
import {fleetPopup,fleetComposition,commandView} from '../src/command-view.mjs';
import {validateSave} from '../src/state-io.mjs';
const b=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/staging')+'/content.json'));
const start=(id='USA',campaign='in_good_faith_1936')=>{const s=sim.newGame(b,id,916,campaign);s.autoPause=false;s.paused=false;s.decisions=[];return {s,c:contentFor(b,s),n:s.nations[id]};};
function aviationInvariant(s,c){for(const [id,n]of Object.entries(s.nations)){const seats=Object.fromEntries(aircraftModels(c,id).map(a=>[a.id,aircraftSeats(a)])),assigned={};let people=0;for(const g of n.groups){const cl=c.classes[g.classId];assert.ok(g.airWing.reduce((v,w)=>v+w.count,0)<=(cl.air+cl.scoutAircraft)*g.count,id+' '+g.name);for(const w of g.airWing){assigned[w.model]=(assigned[w.model]||0)+w.count;people+=w.crewed*seats[w.model];}}for(const w of n.shoreWing||[])people+=w.crewed*seats[w.model];assert.ok(people<=Math.floor(n.aviators));for(const [id,num]of Object.entries(assigned))assert.ok(num<=n.aircraft[id]);}}
test('all fourteen opening navies conserve aircraft capacity and crews across mixed-model hull splitting',()=>{
 for(const campaign of Object.keys(b.campaigns))for(const id of Object.keys(b.nations)){const {s,c}=start(id,campaign);aviationInvariant(s,c);validateSave(s,b);}
});
test('grouping identical carriers does not multiply the air wing or fighter AA twice',()=>{
 const {s,c,n}=start('JPN'),sample=n.groups.find(g=>c.classes[g.classId].type==='CV'&&g.airWing.length),f=n.fleets.find(f=>f.id===sample.fleetId);
 const first=structuredClone(sample),second=structuredClone(sample);first.id='test-one';second.id='test-two';first.atSea=second.atSea=true;n.groups=[first,second];n.fleets=[f];invalidateOperations(s);const split=sim.fleetPower(s,c,'JPN');
 first.count=2;first.sailors*=2;first.airWing=first.airWing.map(w=>({...w,count:w.count*2,crewed:w.crewed*2}));n.groups=[first];invalidateOperations(s);const combined=sim.fleetPower(s,c,'JPN');for(const k of ['surface','sub','air','asw','aa','scout'])assert.ok(Math.abs(split[k]-combined[k])<1e-6,k);
});
test('carrier allocation leaves scouting slots before filling the remaining strike complement',()=>{
 const {s,c,n}=start('JPN'),g=n.groups.find(g=>c.classes[g.classId].air>=50);n.groups=[g];n.fleets=[];g.airWing=[];n.aviators=10000;for(const a of aircraftModels(c,'JPN'))if(a.type_year<=1936)n.aircraft[a.id]=200;
 allocateAircraft(s,c,'JPN',{initial:true});const roles=g.airWing.map(w=>w.role);assert.ok(roles.includes('scout')&&roles.includes('fighter')&&roles.includes('strike'));aviationInvariant(s,c);
});
test('yard chart figures conserve national throughput and paid operations gate the same day of construction',()=>{
 const {s,c,n}=start('JPN');n.gold=n.industry=1e7;n.influence=500;n.treatyPolicy='withdraw';const cid=c.nations.JPN.designs.find(id=>c.classes[id].type==='DD'&&!sim.shipOrderBlock(s,c,id)),gid=sim.orderShip(s,c,cid,20),g=n.groups.find(g=>g.id===gid);
 n.industryFunding=1;const full=sim.yardLoad(s,c);assert.equal(full.used+full.spare,full.capacity);assert.ok(full.work>full.capacity&&full.backlog>0);n.industryFunding=.1;assert.ok(Math.abs(sim.yardLoad(s,c).capacity-full.capacity*.1)<1e-8);
 n.gold=0;n.industryOperating=1;const progress=g.progress;sim.advanceDays(s,c,1);assert.equal(g.progress,progress);assert.equal(sim.yardLoad(s,c).capacity,0);
 n.gold=1e7;sim.advanceDays(s,c,1);assert.ok(g.progress>progress);const beforeDamage=sim.yardLoad(s,c).capacity;damagePort(s,HOME_PORT.JPN,1);assert.ok(sim.yardLoad(s,c).capacity<beforeDamage&&sim.yardLoad(s,c).capacity>0);for(const port of ['kure','sasebo'])damagePort(s,port,1);assert.match(sim.yardLoad(s,c).reason,/damage/);
});
test('port supply load follows physical fleet position instead of its future destination',()=>{
 const {s,c,n}=start('USA'),f=n.fleets[0];n.fleets=[f];n.groups=n.groups.filter(g=>g.fleetId===f.id);f.route=[NODES.hawaii];f.node='hawaii';f.targetNode='hawaii';f.port='norfolk';f.departAt=f.arriveAt=campaignMinutes(s);f.phase='patrol';invalidateOperations(s);
 const tons=n.groups.reduce((v,g)=>v+c.classes[g.classId].tons*g.count,0);assert.equal(supplyDetails(s,c,'USA',f).port,'hawaii');assert.equal(portSummary(s,c,'hawaii').demand,tons);assert.equal(portSummary(s,c,'norfolk').demand,0);
});
test('fleet list compositions count actual ship types and manifests are available only in the fleet popup',()=>{
 const {s,c,n}=start('JPN'),f=n.fleets[0],stats=fleetStats(s,c,'JPN',f);assert.match(fleetComposition(stats,c),/\d+ CV/);assert.ok(!commandView(s,c).includes('class="formation-manifest"'));assert.match(fleetPopup(s,c,f.id),/class="ship-type"/);assert.equal(b.campaigns.campaign_1922.scenario.title,'The Treaty System');
});
test('ASW upgrades, crew and preparation affect convoy defense and raiding power',()=>{
 const {s,c,n}=start('GBR'),f=n.fleets.find(f=>f.role==='escort');const power=()=>convoyCombatPower(s,c,{id:'GBR',f,stats:fleetStats(s,c,'GBR',f)});
 const before=power();n.tech.asw=9;const improved=power();assert.ok(improved.defense>before.defense);n.training=20;n.morale=10;n.logistics=15;assert.ok(power().defense<before.defense);
 for(const g of n.groups.filter(g=>g.fleetId===f.id)){g.atSea=true;g.sailors=Math.floor(g.sailors/2);}assert.ok(power().attack<before.attack*.5);
});
test('reserve orders preserve a deployed ship and its crew until it physically returns to port',()=>{
 const {s,c,n}=start('GBR'),f=n.fleets.find(f=>f.role==='cruiser');sim.issueFleetOrder(s,c,f.id,'presence');sim.advanceMinutes(s,c,60);const position=fleetPosition(s,f),g=n.groups.find(g=>g.fleetId===f.id),crew=g.sailors;
 sim.reserveGroup(s,g.id,c);const transfer=n.fleets.find(x=>x.id===g.fleetId);assert.equal(g.status,'returning');assert.equal(g.sailors,crew);assert.equal(g.atSea,true);assert.deepEqual(fleetPosition(s,transfer),position);assert.ok(transfer.arriveAt>campaignMinutes(s));
 setCampaignMinutes(s,Math.ceil(transfer.arriveAt));minuteOperations(s,c,()=>{},()=>{});assert.equal(g.status,'reserve');assert.equal(g.atSea,false);assert.equal(g.sailors,0);assert.equal(g.fleetId,undefined);
});
test('affordability tolerance never leaves negative resources in a valid purchased state',()=>{
 const {s,c,n}=start('JPN'),price=sim.projectPrice(s,'training');for(const key of ['gold','influence','industry'])n[key]=price[key]-.00001;assert.equal(sim.affordability(n,price),'');sim.startProject(s,'training');for(const key of ['gold','influence','industry'])assert.equal(n[key],0);assert.doesNotThrow(()=>validateSave(s,b));
});
test('submarine convoy attack uses the same torpedo and submerged-speed specifications as fleet battles',()=>{
 const {s,c,n}=start('JPN'),f=n.fleets.find(f=>f.role==='submarine'),group=n.groups.find(g=>g.fleetId===f.id),cl=c.classes[group.classId];
 const before=fleetStats(s,c,'JPN',f).subAttack,original=cl.tubes,speed=cl.submergedSpeed;
 try{cl.tubes*=2;assert.ok(fleetStats(s,c,'JPN',f).subAttack>before);assert.equal(sim.classPower(cl).sub,original*2*16*(1+cl.submergedSpeed/25));cl.tubes=0;cl.submergedSpeed=0;assert.equal(sim.classPower(cl).sub,0);}finally{cl.tubes=original;cl.submergedSpeed=speed;}
});
