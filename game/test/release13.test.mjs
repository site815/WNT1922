import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,aiTurn,advanceMinutes,orderShip,shipOrderBlock,shipPrice,yardLoad} from '../src/engine.mjs';
import {contentFor} from '../src/campaign-content.mjs';
import {validateSave} from '../src/state-io.mjs';
import {relationColor} from '../src/relation-color.mjs';
import {aiDoctrine,aiNeeds,aiFunding,aiCanSpend,aiHullScore,aiMission} from '../src/ai-planning.mjs';
import {CAMPAIGNS,navalInfluence,supplyEffect} from '../src/land-war.mjs';
import {fleetPosition,fleetStats,setRoute,plannedRoute,nextSupplyLeg,orderFleet,balanceScreens,commissionToFleet,applyStandingOrders,fleetMissionBlock} from '../src/task-forces.mjs';
import {campaignMinutes,setCampaignMinutes} from '../src/campaign-clock.mjs';
import {NODES,routeLength,distanceNm} from '../src/world.mjs';
import {dailyResources} from '../src/naval-resources.mjs';
import {fleetCompositionHover,fleetReadinessHover} from '../src/inspection-view.mjs';
const bundle=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/staging')+'/content.json'));
const start=(id='JPN',campaign='in_good_faith_1936')=>{const s=newGame(bundle,id,713,campaign);return [s,contentFor(bundle,s)];};

test('relationship colors use one consistent neutral-to-green/red scale',()=>{
 assert.equal(relationColor(0),'#b8c2cc');assert.equal(relationColor(100),'#48ff76');assert.equal(relationColor(-100),'#ff3030');assert.equal(relationColor(-300),relationColor(-100));
 const green=x=>parseInt(relationColor(x).slice(3,5),16);assert.ok(green(100)>green(50)&&green(50)>green(0)&&green(0)>green(-50)&&green(-50)>green(-100));
});
test('major archipelagos have medium naval influence between minor islands and continental interiors',()=>{
 for(const id of ['philippines','east-indies','malaya'])assert.equal(navalInfluence(CAMPAIGNS.find(f=>f.id===id)),'Medium');
 const island=CAMPAIGNS.find(f=>f.island),medium=CAMPAIGNS.find(f=>f.id==='philippines'),interior=CAMPAIGNS.find(f=>f.id==='east');
 assert.equal(navalInfluence(island),'High');assert.equal(navalInfluence(interior),'Low');assert.ok(supplyEffect(island,.9,.3).effect>supplyEffect(medium,.9,.3).effect);assert.ok(supplyEffect(medium,.9,.3).effect>supplyEffect(interior,.9,.3).effect*5);
});

test('all opening forces separate submarines from surface ships and keep practical command counts',()=>{
 for(const campaign of ['in_good_faith_1936','campaign_1922']){const [s,c]=start('JPN',campaign);for(const [id,n]of Object.entries(s.nations)){
  assert.ok(n.fleets.filter(f=>f.role!=='support').length<=20,id+' command limit');
  for(const f of n.fleets){const st=fleetStats(s,c,id,f);assert.ok(st.submarines===0||st.submarines===st.hulls,id+' '+f.name+' mixed submarines/surface');}
 }}
});
test('capital ships cannot leave port without a fully staffed escort screen',()=>{
 const [s,c]=start(),n=s.nations.JPN,f=n.fleets.find(f=>f.role==='carrier');for(const g of n.groups.filter(g=>g.fleetId===f.id&&['DD','DE','DL','TB'].includes(c.classes[g.classId].type)))g.status='reserve';
 balanceScreens(s,c,'JPN'); // Remove replacement screens too, then force a fresh departure check.
 for(const g of n.groups.filter(g=>g.fleetId===f.id&&['DD','DE','DL','TB'].includes(c.classes[g.classId].type)))g.status='reserve';f.needsEscorts=0;const pos=fleetPosition(s,f);assert.equal(setRoute(s,c,'JPN',f,'japan'),false);assert.deepEqual(fleetPosition(s,f),pos);assert.match(f.holdReason,/escort/);
});
test('orders use actual remaining sailing distance, preserve position and reject impossible missions atomically',()=>{
 const [s,c]=start(),f=s.nations.JPN.fleets.find(f=>f.role==='submarine'),position=fleetPosition(s,f);f.fuelNm=1;
 assert.equal(nextSupplyLeg(s,'JPN',f,'hawaii'),null);assert.equal(setRoute(s,c,'JPN',f,'hawaii'),false);assert.deepEqual(fleetPosition(s,f),position);assert.equal(f.arriveAt,campaignMinutes(s));
 const before=JSON.stringify(f);assert.throws(()=>orderFleet(s,c,f.id,'siege'),/Submarines/);assert.equal(JSON.stringify(f),before);assert.match(fleetMissionBlock(s,c,'JPN',f,'anchorage'),/Submarines/);
 f.fuelNm=f.maxRangeNm;f.route=[NODES.yokosuka,NODES.japan];f.departAt=campaignMinutes(s)-60;f.arriveAt=campaignMinutes(s)+1000;f.speed=15;f.phase='passage';const p=fleetPosition(s,f),route=plannedRoute(s,f,'hawaii');assert.deepEqual(route[0],p);assert.ok(routeLength(route)>distanceNm(p,NODES.hawaii));
});
test('new submarines never join a surface force, and fleet-specific orders survive AI planning',()=>{
 const [s,c]=start('USA'),n=s.nations.JPN,sub=n.groups.find(g=>c.classes[g.classId].type==='SS'&&g.status==='active');
 for(const g of n.groups)if(c.classes[g.classId].type==='SS')delete g.fleetId;n.fleets=n.fleets.filter(f=>f.role!=='submarine');commissionToFleet(s,c,'JPN',sub);const assigned=n.fleets.find(f=>f.id===sub.fleetId);assert.equal(assigned.role,'submarine');
 const f=n.fleets.find(f=>f.role==='carrier');f.manual=true;f.mission='guard';f.objectiveNode='japan';applyStandingOrders(s,c,'JPN');assert.equal(f.mission,'guard');assert.equal(f.objectiveNode,'japan');
});
test('AI national programs differ by scenario and maintain personnel/operating reserves',()=>{
 const [s,c]=start('GBR'),n=s.nations.DEU,needs=aiNeeds(s,c,'DEU');assert.equal(aiDoctrine(s,'DEU').roles.CV,0);assert.equal(aiHullScore(s,c,'DEU',{type:'BB',year:1936,crew:500},needs),0);assert.ok(aiDoctrine(s,'JPN').roles.CV>aiDoctrine(s,'USA').roles.CV);
 const [vanilla]=start('GBR','campaign_1922');assert.ok(aiDoctrine(vanilla,'FRA').roles.BB>aiDoctrine(s,'FRA').roles.BB);
 n.aviators=0;aiFunding(s,c,'DEU');assert.equal(n.aviatorFunding,1);assert.equal(n.aircraftFunding,.1);assert.equal(aiCanSpend(s,'DEU',{gold:n.gold,industry:0,influence:0}),false);
 assert.equal(aiMission(s,'DEU',{role:'submarine',salt:1}),'presence');s.relations['DEU-GBR'].war=true;assert.equal(aiMission(s,'DEU',{role:'submarine',salt:1}),'raid');
});
test('AI appropriations use ordinary date, resource, crew and yard gates across every nation/scenario',()=>{
 for(const campaign of ['in_good_faith_1936','campaign_1922'])for(const id of ['GBR','USA','JPN','FRA','ITA','DEU','SOV']){
  const [s,c]=start(id==='USA'?'JPN':'USA',campaign),n=s.nations[id];n.gold=n.industry=100000;n.influence=400;const old=new Set(n.groups.map(g=>g.id)),balance={gold:n.gold,industry:n.industry,influence:n.influence};
  aiTurn(s,c,id);const content=contentFor(bundle,s);for(const g of n.groups.filter(g=>!old.has(g.id)&&g.status==='building')){assert.equal(shipOrderBlock(s,content,g.classId,id),'');assert.ok(content.classes[g.classId].year<=new Date(s.day*86400000).getUTCFullYear());for(const k of ['gold','industry','influence'])assert.ok(g.paid[k]>0);}
  for(const k of ['gold','industry','influence'])assert.ok(n[k]>=0&&n[k]<=balance[k]);for(const k of ['industryFunding','aircraftFunding','schoolFunding','aviatorFunding'])assert.ok(n[k]>=.1&&n[k]<=1);
  validateSave(s,bundle);
 }
});
test('fleet hover includes class composition, individual damage, status, sailors and the shared fuel limit',()=>{
 const [s,c]=start(),f=s.nations.JPN.fleets[0],g=s.nations.JPN.groups.find(g=>g.fleetId===f.id);g.health=.55;
 const html=fleetCompositionHover(s,c,f);assert.match(html,/FLEET COMPOSITION/);assert.match(html,/45% damage/);assert.match(html,/Fuel endurance/);assert.ok(html.includes(g.name));assert.match(html,/sailors/);assert.match(fleetReadinessHover(s,c,f),/Training \/ morale/);
});
