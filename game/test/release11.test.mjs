import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as sim from '../src/engine.mjs';
import { contentFor } from '../src/campaign-content.mjs';
import { DIPLOMACY, ceasefireOffer, diplomaticBlock, readyProvocationFleet } from '../src/diplomacy-rules.mjs';
import { fleetStats, fleetPosition, invalidateOperations } from '../src/task-forces.mjs';
import { aircraftPrice, aircraftBlock, orderAircraft, productionBlock } from '../src/naval-resources.mjs';
import { LEVELS, levelYear } from '../src/research-tree.mjs';
import { createSoundTracker } from '../src/sound.mjs';
import { playbackVolume } from '../src/music.mjs';
import { reportTitle, engagedComposition, battleDetails } from '../src/ministry-view.mjs';
import { applyCommand } from '../src/game-actions.mjs';
import { organizeSupport, minuteSupport } from '../src/support-operations.mjs';
import { portSummary } from '../src/ports.mjs';
import { NODES, distanceNm } from '../src/world.mjs';
import { anchoredShips } from '../src/port-operations.mjs';
import { campaignMinutes, setCampaignMinutes } from '../src/campaign-clock.mjs';
import { replenishmentRelief } from '../src/support-effects.mjs';
import { validateSave } from '../src/state-io.mjs';
const bundle=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/public')+'/content.json'));
const start=(nation='JPN',campaign='in_good_faith_1936')=>{const s=sim.newGame(bundle,nation,1,campaign);s.nations[nation].gold=s.nations[nation].industry=1e7;s.nations[nation].influence=500;return s;};
const funds=n=>Object.fromEntries(['gold','influence','industry'].map(k=>[k,n[k]]));
function war(s){const r=s.relations['JPN-USA'];Object.assign(r,{war:true,warSince:s.day,allied:false,score:-50});return r;}
function rollSeed(chance,accept){for(let seed=1;seed<1e6;seed++){const v={seed};if((sim.rng(v)<chance/100)===accept)return seed;}throw Error('No seed');}
test('ceasefire can be offered on the first war day; only accepted offers pay settlement',()=>{
 for(const accepted of [true,false]){const s=start(),c=contentFor(bundle,s),n=s.nations.JPN,r=war(s),quote=ceasefireOffer(s,c,'USA');assert.equal(diplomaticBlock(s,c,'USA','truce'),'');s.seed=rollSeed(quote.chance,accepted);const before=funds(n),result=applyCommand(s,bundle,{type:'diplomatic',args:{id:'USA',kind:'truce'}});assert.equal(result.accepted,accepted);assert.equal(result.chance,quote.chance);assert.equal(r.war,!accepted);for(const k of Object.keys(before))assert.equal(before[k]-n[k],DIPLOMACY.truce.price[k]+(accepted?DIPLOMACY.truce.settlement[k]:0));assert.equal(n.cooldowns['truce-USA'],s.day+30);if(accepted)assert.equal(r.truceUntil,s.day+365);else{assert.throws(()=>sim.diplomaticAction(s,'USA','truce','JPN',c),/preparing/);s.day+=30;assert.equal(diplomaticBlock(s,c,'USA','truce'),'');}}
});
test('ceasefire pressure rises with enemy naval losses, trade disruption and time, and falls when enemy leads',()=>{
 const s=start(),c=contentFor(bundle,s),r=war(s),initial=ceasefireOffer(s,c,'USA').chance;r.record={since:r.warSince,sides:{JPN:{sunk:120000,damage:10000,merchantGRT:30000},USA:{sunk:0,damage:0,merchantGRT:0}}};assert.ok(ceasefireOffer(s,c,'USA').chance>initial);const before=ceasefireOffer(s,c,'USA').chance;s.nations.USA.commerce=20;s.day+=365;assert.ok(ceasefireOffer(s,c,'USA').chance>before);r.record.sides.JPN={sunk:0,damage:0,merchantGRT:0};r.record.sides.USA={sunk:1e7,damage:0,merchantGRT:0};const losing=ceasefireOffer(s,c,'USA');assert.equal(losing.warBalance,-25);assert.ok(losing.chance>=5&&losing.chance<=90);
});
test('invalid diplomacy orders are atomic; no ultimatum action remains',()=>{
 const s=start(),c=contentFor(bundle,s);war(s);s.nations.JPN.gold=1001;const before=JSON.stringify(s);assert.throws(()=>sim.diplomaticAction(s,'USA','truce','JPN',c),/settlement/);assert.equal(JSON.stringify(s),before);assert.throws(()=>sim.diplomaticAction(s,'USA','ultimatum','JPN',c),/valid diplomatic/);assert.equal(JSON.stringify(s),before);
});
test('provocations require ready crews and only clash with forces actually nearby',()=>{
 for(const nearby of [false,true]){const s=start(),c=contentFor(bundle,s);for(const id of ['JPN','USA']){const n=s.nations[id],f=n.fleets.find(f=>f.role==='cruiser')||n.fleets[0];n.fleets=[f];n.groups=n.groups.filter(g=>g.fleetId===f.id);n.crew=1e6;n.logistics=100;for(const g of n.groups){g.sailors=c.classes[g.classId].crew*g.count;g.health=1;g.status='active';g.atSea=true;}Object.assign(f,{position:[140,30],route:[[id==='USA'&&!nearby?-150:140,30]],phase:'patrol',aggressiveBattle:true,needsEscorts:false,arriveAt:0});}invalidateOperations(s);const f=readyProvocationFleet(s,c,'USA');assert.ok(f);s.seed=rollSeed(30,true);const result=sim.diplomaticAction(s,'USA','provoke','JPN',c);assert.equal(result.clash,nearby);assert.equal(s.relations['JPN-USA'].war,false);assert.equal(!!s.relations['JPN-USA'].warning,nearby);assert.deepEqual(s.reports[0]?.position,nearby?[140,30]:undefined);}
 const s=start(),c=contentFor(bundle,s);for(const g of s.nations.JPN.groups)g.sailors=0;const before=JSON.stringify(s);assert.throws(()=>sim.diplomaticAction(s,'USA','provoke','JPN',c),/Requires a fleet/);assert.equal(JSON.stringify(s),before);
});
test('insults are weaker than provocations and respect their own cooldown',()=>{const s=start(),c=contentFor(bundle,s),r=s.relations['JPN-USA'],before=r.score;sim.diplomaticAction(s,'USA','insult','JPN',c);assert.equal(r.score,before-6);assert.equal(s.nations.JPN.cooldowns['insult-USA'],s.day+90);assert.throws(()=>sim.diplomaticAction(s,'USA','insult','JPN',c),/preparing/);});
test('all 126 doctrine levels agree with engine availability and future work has honest costs',()=>{
 const s=start('GBR','campaign_1922');for(const [key,descriptions]of Object.entries(LEVELS)){assert.equal(descriptions.length,9);for(let level=1;level<9;level++){s.nations.GBR.tech[key]=level;assert.equal(sim.projectPrice(s,key).targetYear,levelYear(key,level+1));}s.nations.GBR.tech[key]=1;}
 const c=contentFor(bundle,s),model=c.nations.GBR.aircraft.find(a=>a.type_year>1922);const p=aircraftPrice(s,c,model.id,1,s.player,{development:true});assert.equal(p.days,180);assert.match(aircraftBlock(s,c,model.id),/Development opens/);assert.throws(()=>orderAircraft(s,c,model.id,1,s.player,{development:true}),/Development opens/);s.day=Date.parse(model.type_year+'-01-01')/86400000;assert.deepEqual(aircraftPrice(s,c,model.id,1,s.player,{development:true}),p);
});
test('every campaign and navy can order both support types without adding opening warships',()=>{
 for(const campaign of ['campaign_1922','in_good_faith_1936'])for(const id of ['GBR','USA','JPN','FRA','ITA','DEU','SOV']){const s=start(id,campaign),c=contentFor(bundle,s),before=sim.fleetSummary(s,c).total;for(const type of ['AD','AO']){const cl=c.nations[id].designs.map(id=>c.classes[id]).find(cl=>(cl.type===type||cl.supportHybrid)&&!productionBlock(s,c,cl.id));assert.ok(cl,id+' '+campaign+' '+type);const group=sim.orderShip(s,c,cl.id);assert.equal(s.nations[id].groups.find(g=>g.id===group).service,'support');}assert.equal(sim.fleetSummary(s,c).total,before);}
});
test('war has a distinct sound cue and paused music has one-third gain',()=>{const tracker=createSoundTracker(),s=start();tracker.next(s);war(s);assert.equal(tracker.next(s),'war');assert.equal(tracker.next(s),null);assert.ok(Math.abs(playbackVolume(.6,false)-.2)<1e-12);assert.equal(playbackVolume(.6,true),.6);assert.equal(playbackVolume(0,false),0);});
test('coastal defense reports name the action and shore forces instead of None',()=>{const result={conditions:[],sunk:0,damaged:0,tons:0,damagedTons:0};const r={kind:'port',portId:'hawaii',operation:'shore',a:'JPN',b:'USA',resultA:result,resultB:result};assert.match(reportTitle(r),/Coastal defense action.*Pearl/);assert.match(engagedComposition(r,'B'),/Shore batteries/);assert.doesNotMatch(battleDetails(r),/None/);});
function deliverSupport(s,c,type){const n=s.nations[s.player];n.crew=1e7;const id=sim.orderShip(s,c,'us_'+type+'_1932'),g=n.groups.find(g=>g.id===id);g.status='active';g.dockPort='hawaii';organizeSupport(s,c);const f=n.fleets.find(f=>f.id===g.fleetId);assert.equal(f.role,'support');return {g,f};}
test('depots provide only local, crewed capacity and can be destroyed at anchor',()=>{
 const s=start('USA'),c=contentFor(bundle,s),before=portSummary(s,c,'hawaii').capacity,{g,f}=deliverSupport(s,c,'depot');assert.ok(portSummary(s,c,'hawaii').capacity>before);assert.equal(portSummary(s,c,'norfolk').depotSupport,0);g.atSea=true;f.route=[NODES.wake];invalidateOperations(s);assert.equal(portSummary(s,c,'hawaii').capacity,before);g.atSea=false;f.route=[NODES.hawaii];invalidateOperations(s);assert.ok(anchoredShips(s,c,'USA','hawaii').includes(g));const result=sim.damageFleet(s,c,'USA','pacific',100,{surface:1e6,aa:0,asw:0,sub:0},'anchorage strike',null,.3,1,[g]);assert.equal(g.status,'sunk');assert.equal(result.sunkComposition.AD,1);assert.ok(result.sailorsLost+result.sailorsRescued>0);assert.equal(portSummary(s,c,'hawaii').capacity,before);validateSave(s,bundle);
});
test('oilers must physically meet a fleet, consume cargo, and provide temporary delivered stores',()=>{
 const s=start('USA'),c=contentFor(bundle,s),n=s.nations.USA,{g,f}=deliverSupport(s,c,'oiler'),target=n.fleets.find(x=>x.role==='cruiser'),now=campaignMinutes(s);Object.assign(target,{route:[NODES.hawaii],phase:'patrol',fuelNm:2000,maxRangeNm:10000});Object.assign(f,{supportTarget:target.id,route:[NODES.wake],phase:'patrol',nextPlanAt:now+20000,supportCargo:14000,arriveAt:now,departAt:now});g.atSea=true;const before=target.fuelNm;minuteSupport(s,c,'USA',f);assert.equal(target.fuelNm,before);assert.equal(f.supportCargo,14000);f.route=[NODES.hawaii];invalidateOperations(s);minuteSupport(s,c,'USA',f);assert.ok(target.fuelNm>before);assert.ok(f.supportCargo<14000);assert.ok(replenishmentRelief(s,target)>0);s.day+=3;assert.equal(replenishmentRelief(s,target),0);validateSave(s,bundle);
});
test('automatic oilers sail to a fleet, replenish it, and return damaged hulls for paid repair',()=>{
 const s=start('USA'),c=contentFor(bundle,s),n=s.nations.USA,{g,f}=deliverSupport(s,c,'oiler'),now=campaignMinutes(s),target=n.fleets.find(x=>x.role==='cruiser');
 for(const other of n.fleets)if(other!==f)Object.assign(other,{phase:'port',route:[NODES.norfolk],arriveAt:now,departAt:now});
 Object.assign(target,{phase:'patrol',route:[NODES.central_pacific],arriveAt:now,departAt:now,fuelNm:2000,maxRangeNm:10000});invalidateOperations(s);
 let prior=fleetPosition(s,f),delivered=false;
 for(let minute=1;minute<=12*1440;minute++){setCampaignMinutes(s,now+minute);minuteSupport(s,c,'USA',f);const position=fleetPosition(s,f);assert.ok(distanceNm(prior,position)<=f.speed/60+.001,'one-minute movement respects sailing speed');prior=position;if(f.deliveredCargo>0){delivered=true;break;}}
 assert.ok(delivered,'admiral finds and meets the remote fleet');assert.ok(target.fuelNm>2000);assert.ok(g.atSea);
 g.health=.5;f.nextPlanAt=campaignMinutes(s);const damagedAt=campaignMinutes(s);
 for(let minute=1;minute<=12*1440&&g.status!=='repair';minute++){setCampaignMinutes(s,damagedAt+minute);minuteSupport(s,c,'USA',f);}
 assert.equal(g.status,'repair');assert.equal(g.atSea,false);assert.ok(g.dockPort);assert.equal(g.fleetId,undefined);validateSave(s,bundle);
});
test('admirals relocate depots toward overloaded ports without granting capacity in transit',()=>{
 const s=start('USA'),c=contentFor(bundle,s),n=s.nations.USA,{g,f}=deliverSupport(s,c,'depot'),now=campaignMinutes(s);
 for(const other of n.fleets)if(other!==f)Object.assign(other,{route:[NODES.wake],arriveAt:now,departAt:now,phase:'patrol'});invalidateOperations(s);
 let sailed=false,arrived=false;
 for(let minute=1;minute<=24*1440;minute++){setCampaignMinutes(s,now+minute);minuteSupport(s,c,'USA',f);if(g.atSea){sailed=true;assert.equal(portSummary(s,c,'wake').depotSupport,0);}if(f.phase==='port'&&f.port==='wake'){arrived=true;break;}}
 assert.ok(sailed);assert.ok(arrived,'depot reaches the overloaded base');assert.ok(portSummary(s,c,'wake').depotSupport>0);assert.equal(portSummary(s,c,'hawaii').depotSupport,0);validateSave(s,bundle);
});
