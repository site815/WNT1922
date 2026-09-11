import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Worker} from 'node:worker_threads';
import * as sim from '../src/engine.mjs';
import {SimulationClient} from '../src/simulation-client.mjs';
import {PROGRAMS} from '../src/balance.mjs';
import {contentFor} from '../src/campaign-content.mjs';
import {canonicalMinute,campaignMinutes,setCampaignMinutes} from '../src/campaign-clock.mjs';
import {staffSailors,sailorSummary,fullyStaffed,crewEffectiveness,compareShips} from '../src/ship-staffing.mjs';
import {fleetStats,fleetPosition,initializeOperations,orderFleet,invalidateOperations,minuteOperations} from '../src/task-forces.mjs';
import {NODES,PORTS} from '../src/world.mjs';
import {portSummary,damagePort,repairPorts,PORT_REPAIR} from '../src/ports.mjs';
import {minutePortOperations,anchoredShips} from '../src/port-operations.mjs';
import {orderAircraft,aircraftModels,setProductionModel,aircraftSummary} from '../src/naval-resources.mjs';
import {validateSave} from '../src/state-io.mjs';
import {alertItems,alertsView,resourcesView,battleDetails} from '../src/ministry-view.mjs';
import {commandView} from '../src/command-view.mjs';
const b=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/public')+'/content.json'));
const start=(id='JPN',campaign='in_good_faith_1936')=>{const s=sim.newGame(b,id,901,campaign);s.autoPause=false;s.decisions=[];return s;};
const bridge=()=>{const w=new Worker(new URL('./worker-adapter.mjs',import.meta.url)),out={postMessage:m=>w.postMessage(m),terminate:()=>w.terminate()};w.on('message',data=>out.onmessage?.({data}));w.on('error',error=>out.onerror?.(error));return out;};
test('all fourteen opening ministries have levels 1–9, with unchanged level-one prices and a hard cap',()=>{
 for(const campaign of Object.keys(b.campaigns))for(const id of Object.keys(b.nations)){const s=start(id,campaign),n=s.nations[id];for(const [key,p]of Object.entries(PROGRAMS)){assert.equal(p.max,9);assert.equal(n.tech[p.level],1);const price=sim.projectPrice(s,key);assert.equal(price.level,1);if(!price.ahead)assert.equal(price.gold,p.gold);n.tech[p.level]=9;assert.match(sim.projectBlock(s,key),/Level 9/);n.tech[p.level]=1;}validateSave(s,b);}
});
test('development dates block ship, aircraft and technology orders even if a future design is unlocked',()=>{
 const s=start(),c=contentFor(b,s),n=s.nations.JPN;n.gold=n.industry=n.influence=1e8;
 const a=aircraftModels(c,'JPN').find(a=>a.type_year>1936);assert.ok(a);assert.throws(()=>orderAircraft(s,c,a.id,1,'JPN',{development:true}),/Development opens/);n.aircraftUnlocked.push(a.id);assert.throws(()=>orderAircraft(s,c,a.id,1),/Development opens/);assert.throws(()=>setProductionModel(s,c,'fighter',a.id));
 const future=c.nations.JPN.designs.find(id=>c.classes[id].year>1936);if(future){n.unlocked.push(future);assert.throws(()=>sim.orderShip(s,c,future),/Development opens/);assert.throws(()=>sim.developDesign(s,c,future),/Development opens/);}
 assert.match(sim.projectBlock(s,'radar'),/1938/);const before=n.gold;assert.throws(()=>sim.startProject(s,'radar'));assert.equal(n.gold,before);
 setCampaignMinutes(s,Date.parse(a.type_year+'-01-01T00:00:00Z')/60000);n.aircraftUnlocked=n.aircraftUnlocked.filter(id=>id!==a.id);assert.doesNotThrow(()=>orderAircraft(s,c,a.id,1,'JPN',{development:true}));
});
test('tiny rounded time intervals return promptly and repeated resume/pause uses a real worker',async t=>{
 const client=new SimulationClient({createWorker:bridge,onError:message=>assert.fail(message)});t.after(()=>{clearInterval(client.watchdog);client.worker?.terminate();});
 const s=start('USA');await client.start(b,s);
 // Old advanceMinutes loops forever when its target rounds back to the start.
 const before=campaignMinutes(s);assert.equal(sim.advanceMinutes(s,b,.0000005),0);assert.equal(campaignMinutes(s),before);
 for(let i=0;i<12;i++){await client.transact(s=>{s.paused=false;s.speed=[.25,.5,1,5,10][i%5];});await new Promise(r=>setTimeout(r,25));await client.transact(s=>{s.paused=true;});}
 const after=await client.snapshot();assert.ok(campaignMinutes(after)>before);validateSave(after,b);await client.stop();
});
test('worker display failures pause safely, reject pending requests and permit a fresh resume',async t=>{
 let fail=true,message='';const client=new SimulationClient({createWorker:bridge,onState:()=>{if(fail)throw Error('Injected render failure');},onError:m=>message=m});t.after(()=>{clearInterval(client.watchdog);client.worker?.terminate();});
 await assert.rejects(client.start(b,start()),/render failure/);assert.equal(client.worker,null);assert.equal(client.current.paused,true);assert.match(message,/preserved/);fail=false;await client.start(b,client.current);await client.transact(s=>s.paused=false);await client.stop();
});
test('sailor shortages leave whole ships in port; casualties at sea reduce weapon effectiveness and survivors remain conserved',()=>{
 const s=start('GBR'),c=contentFor(b,s),n=s.nations.GBR,f=n.fleets.find(f=>f.role==='cruiser'),groups=n.groups.filter(g=>g.fleetId===f.id),g=groups[0];
 orderFleet(s,c,f.id,'presence');assert.equal(g.atSea,true);const positions=fleetPosition(s,f),power=sim.fleetPower(s,c,'GBR',null,f.id).surface,people=n.crew;
 const result=sim.damageFleet(s,c,'GBR',g.region,.45,{surface:500,air:0,asw:0,sub:0},'gunfire',f.id,.5);assert.equal(people-n.crew,result.sailorsLost+result.sailorsRescued);assert.ok(groups.some(g=>g.count&&crewEffectiveness(g,c.classes[g.classId])<1));assert.ok(sim.fleetPower(s,c,'GBR',null,f.id).surface<power);assert.deepEqual(fleetPosition(s,f),positions);
 const another=start('USA'),u=another.nations.USA;u.crew=1000;staffSailors(another,c,'USA');assert.ok(sailorSummary(another,c,'USA').waiting>0);for(const g of u.groups.filter(g=>g.status==='active'&&!g.atSea&&g.service==='warship'))assert.ok(g.sailors===0||fullyStaffed(g,c.classes[g.classId]));
 const force=u.fleets.find(f=>u.groups.some(g=>g.fleetId===f.id&&!g.sailors));orderFleet(another,c,force.id,'presence');assert.ok(!u.groups.some(g=>g.fleetId===force.id&&!fullyStaffed(g,c.classes[g.classId])));
});
test('submarine torpedo handling also falls with sailor casualties at sea',()=>{
 const s=start('DEU'),c=contentFor(b,s),n=s.nations.DEU,f=n.fleets.find(f=>f.role==='submarine');assert.ok(f);orderFleet(s,c,f.id,'raid');const before=sim.fleetPower(s,c,'DEU',null,f.id).sub;
 for(const g of n.groups.filter(g=>g.fleetId===f.id)){const lost=Math.floor(g.sailors/2);g.sailors-=lost;n.crew-=lost;}
 const after=sim.fleetPower(s,c,'DEU',null,f.id).sub;assert.ok(after<before*.6&&after>before*.4);validateSave(s,b);
});
test('port attacks damage facilities and anchored ships, report casualties, and repair only after safety and payment',()=>{
 const s=start('JPN'),c=contentFor(b,s),n=s.nations.JPN,f=n.fleets.find(f=>f.role==='carrier');s.relations['JPN-USA'].war=true;s.relations['JPN-USA'].warSince=s.day;
 const enemy=s.nations.USA.fleets.find(f=>f.role==='carrier');enemy.port='hawaii';enemy.phase='port';enemy.route=[NODES.hawaii];enemy.arriveAt=campaignMinutes(s);enemy.departAt=campaignMinutes(s);for(const g of s.nations.USA.groups.filter(g=>g.fleetId===enemy.id))g.atSea=false;
 f.route=[NODES.hawaii];f.port='yokosuka';f.arriveAt=campaignMinutes(s);f.departAt=campaignMinutes(s);f.phase='patrol';f.mission='anchorage';f.objectiveNode='hawaii';for(const g of n.groups.filter(g=>g.fleetId===f.id))g.atSea=true;
 assert.ok(anchoredShips(s,c,'USA','hawaii').length);const before=portSummary(s,c,'hawaii'),report=sim.resolvePortAction(s,c,'JPN',f,'hawaii','anchorage');assert.ok(report);assert.ok(report.resultB.damaged>0);assert.ok(report.portDamage>0);assert.match(battleDetails(report),/sailors lost/);assert.ok(portSummary(s,c,'hawaii').capacity<before.capacity);
 const health=s.ports.hawaii.health,gold=s.nations.USA.gold;repairPorts(s);assert.equal(s.ports.hawaii.health,health);assert.equal(s.nations.USA.gold,gold);
 setCampaignMinutes(s,campaignMinutes(s)+PORT_REPAIR.safeMinutes+1);repairPorts(s);assert.ok(s.ports.hawaii.health>health);assert.ok(s.nations.USA.gold<gold);s.nations.USA.gold=0;const stopped=s.ports.hawaii.health;repairPorts(s);assert.equal(s.ports.hawaii.health,stopped);
 assert.doesNotThrow(()=>validateSave(s,b));s.relations['JPN-USA'].war=false;assert.equal(sim.resolvePortAction(s,c,'JPN',f,'hawaii','siege'),null);
});
test('admirals choose enemy ports for raid and siege and produce minute-stamped actions',()=>{
 for(const mission of ['anchorage','siege']){const s=start('JPN'),c=contentFor(b,s),f=s.nations.JPN.fleets.find(f=>f.role==='carrier');s.relations['JPN-USA'].war=true;s.relations['JPN-USA'].warSince=s.day;orderFleet(s,c,f.id,mission,null,'JPN',{aggressiveBattle:true});assert.ok(PORTS[f.objectiveNode]);assert.equal(PORTS[f.objectiveNode].nation,'USA');f.route=[NODES[f.objectiveNode]];f.targetNode=f.objectiveNode;f.phase='patrol';f.arriveAt=campaignMinutes(s);f.departAt=campaignMinutes(s);f.nextPlanAt=campaignMinutes(s)+1440;setCampaignMinutes(s,Math.floor(campaignMinutes(s)/15)*15+7);let actions=0;minutePortOperations(s,c,()=>{actions++;});assert.ok(actions>0);}
});
test('dismissed dispatches stay dismissed and mandatory defaults apply exactly once',()=>{
 const s=start(),c=contentFor(b,s);const log=s.log[0];sim.dismissNotice(s,c,'dispatch-'+log.id);assert.ok(!alertItems(s).some(a=>a.id==='dispatch-'+log.id));const r=s.relations['JPN-USA'],before=r.score;sim.queueDecision(s,'required-test','Treaty demand','Respond.',[{id:'deny',label:'Deny',detail:'Lose 5 relations.',relation:-5}],{critical:true,target:'USA',defaultOption:'deny'});assert.match(alertsView(s,c,'required-test'),/Dismiss and apply default/);sim.dismissNotice(s,c,'required-test');sim.dismissNotice(s,c,'required-test');assert.equal(r.score,before-5);assert.equal(s.decisions.length,0);
});
test('all zoom levels preserve national convoy color, port icons and labels; manifests sort capitals first and newest within type',()=>{
 const s=start(),c=contentFor(b,s);for(const zoom of [1,2,5]){const html=commandView(s,c,{zoom});assert.equal((html.match(/class="map-port"/g)||[]).length,Object.keys(PORTS).length);assert.match(html,/convoy-marker" style="color:#f27b73/);assert.match(html,/Pearl Harbor/);}
 const ships=s.nations.JPN.groups.filter(g=>g.count).sort(compareShips(c));for(let i=1;i<ships.length;i++){const a=c.classes[ships[i-1].classId],b=c.classes[ships[i].classId];if(a.type===b.type)assert.ok(a.year>=b.year);}
 assert.ok(!s.nations.JPN.groups.some(g=>/prototype/i.test(g.id)||/prototype/i.test(g.name)));const html=resourcesView(s,c);assert.ok(html.indexOf('Naval industry')<html.indexOf('Aircraft factories'));assert.ok(html.indexOf('Aircraft factories')<html.indexOf('Naval schools'));assert.ok(html.indexOf('Naval schools')<html.indexOf('Naval aviation schools'));
});
