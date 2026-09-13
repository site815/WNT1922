import test from "node:test";
import assert from "node:assert/strict";
import { CATALOG } from "../worker/catalog-loader.mjs";
import { readDocument } from "../worker/documents.mjs";
import { newGame, advanceMinutes, diplomaticAction, resolveBattle, queueDecision, chooseDecision, orderShip } from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import { readyProvocationFleet, DIPLOMACY } from "../mechanics/diplomacy-rules.mjs";
import { treatyAssessment } from "../mechanics/treaty-policy.mjs";
import { shippingPlan, syncConvoys, moveConvoys } from "../mechanics/merchant-convoys.mjs";
import { merchantEconomy, averageMerchantGRT } from "../mechanics/merchant-economy.mjs";
import { convoyRecord } from "../mechanics/economy-rules.mjs";
import { campaignMinutes, setCampaignMinutes, TICK_MINUTES, periodicTick } from "../mechanics/campaign-clock.mjs";
import { beginEngagement, progressEngagements } from "../mechanics/engagements.mjs";
import { fleetPosition, fleetStats, sinkMerchants, orderFleet } from "../mechanics/task-forces.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
import { diplomacyView } from "../ui/diplomacy-view.mjs";
import { battleDetails } from "../ui/ministry-view.mjs";
import { resourceHover } from "../ui/resource-breakdown.mjs";
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const start=(id="USA",campaign="in_good_faith_1936")=>{const s=newGame(CATALOG,id,250025,campaign);s.decisions=[];s.autoPause=false;s.paused=false;return [s,contentFor(CATALOG,s),s.nations[id]];};
const war=(s,a,b)=>{const r=s.relations[[a,b].sort().join("-")];r.war=true;r.allied=false;r.warSince=s.day;};
test("diplomatic actions put automatic strongest-force provocation last",()=>{
  const [s,c]=start("JPN");
  assert.deepEqual(Object.keys(DIPLOMACY),["visit","sell","cooperate","strategic","provoke"]);
  const f=readyProvocationFleet(s,c,"USA");assert.ok(f);
  const html=diplomacyView(s,c);assert.doesNotMatch(html,/provocation-fleet|data-provocation-country/);
  assert.match(html,/strongest ready task force/);
  diplomaticAction(s,"USA","provoke","JPN",c,"ignored-manual-picker");
  assert.equal(s.provocations[0].fleetId,f.id);
});
test("disclosure costs nothing below limits or within ten percent, then sanctions exceed concealment",()=>{
  const [s,c,n]=start(); const original=n.groups.find(g=>c.classes[g.classId].type==="BB");
  const cl={...c.classes[original.classId],id:"treaty_test",tons:35000};
  const content={...c,classes:{...c.classes,treaty_test:cl}};
  n.groups=[{...original,classId:cl.id,count:15,legacy:false,treatyFate:undefined,status:"active"}];
  n.treatyPolicy="disclose";
  assert.equal(treatyAssessment(s,content).gold,0);
  n.groups[0].count=16;const small=treatyAssessment(s,content);
  assert.equal(small.excessTons,35000);assert.equal(small.gold,0);
  assert.ok(treatyAssessment(s,content,"USA","false_tonnage").gold>0);
  n.groups[0].count=17; const large=treatyAssessment(s,content);
  near(large.disclosureBillableTons,17500);
  assert.ok(large.gold>treatyAssessment(s,content,"USA","false_numbers").gold);
  assert.match(diplomacyView(s,content),/Treaty obligations/);
});
test("disputed intelligence prices and a poor ministry's automatic default stay affordable",async()=>{
  const event=(await readDocument("common/events.md")).find(e=>e.key==="inspection");
  assert.equal(event.options.find(o=>o.id==="deny").gold,2000);
  assert.equal(event.options.find(o=>o.id==="counter").gold,3000);
  const [s,c,n]=start("JPN");n.gold=500;n.influence=2;
  queueDecision(s,"test-inspection",event.title,event.body,event.options,{critical:true,kind:"inspection",target:"USA",defaultOption:"deny"});
  chooseDecision(s,c,"test-inspection","deny",{automatic:true});
  assert.equal(n.gold,0);assert.equal(n.influence,0);validateSave(s,CATALOG);
});
test("fifteen-minute ticks preserve scheduled events and do not run intervening one-minute operations",()=>{
  const [s,c]=start();assert.equal(TICK_MINUTES,15);
  advanceMinutes(s,c,14);assert.equal(s.minuteTicks||0,0);
  advanceMinutes(s,c,1);assert.equal(s.minuteTicks,1);
  advanceMinutes(s,c,45);assert.equal(s.minuteTicks,4);
  assert.ok(periodicTick(campaignMinutes(s)-30,60,17));
  validateSave(s,CATALOG);
});
test("all fourteen starts derive shipping demand from product and assign only real available hulls",()=>{
  for(const campaign of Object.keys(CATALOG.campaigns))for(const id of Object.keys(CATALOG.campaigns[campaign].nations)){
    const [s,c,n]=start(id,campaign),p=shippingPlan(s,c,id),e=merchantEconomy(s,c,id);
    near(p.required,(n.gdp+e.gtp)/2);assert.ok(p.routes.length>0);
    assert.ok(n.convoys.length>0);assert.ok(p.assigned<=n.merchant.hulls);
    near(p.hullsAtSea,Math.round(n.merchant.hulls*.02));
    assert.match(resourceHover(s,c,"SHIPPING"),/round trip|round-trip/);
    validateSave(s,CATALOG);
  }
});
test("peacetime GRT is credited exactly once after the outward and return voyage",()=>{
  const [s,c,n]=start();n.convoys=[];n.convoysMobilized=true;syncConvoys(s,c,"USA",{force:true});
  const v=n.convoys[0],hulls=v.count;n.convoys=[v];n.convoyPlanAt=campaignMinutes(s)+1e8;
  setCampaignMinutes(s,v.arriveAt);moveConvoys(s,c,"USA");
  assert.equal(v.leg,"unloading");assert.equal(convoyRecord(s,"USA").delivered,0);
  n.convoys=[v]; n.convoyPlanAt=-1e9;
  setCampaignMinutes(s,v.readyAt);moveConvoys(s,c,"USA");
  assert.equal(v.leg,"returning");assert.equal(convoyRecord(s,"USA").delivered,0);
  setCampaignMinutes(s,v.arriveAt);const expected=hulls*averageMerchantGRT(s,"USA");moveConvoys(s,c,"USA");
  near(convoyRecord(s,"USA").delivered,expected);
  moveConvoys(s,c,"USA");near(convoyRecord(s,"USA").delivered,expected);
});
test("merchant sinkings lower shipping capacity immediately, leaving GTP unchanged without adding replacement ships to the damaged convoy",()=>{
  const [s,c,n]=start();war(s,"USA","JPN");
  const v=n.convoys.find(v=>v.count>2),before=v.count,gtp=merchantEconomy(s,c).gtp;
  sinkMerchants(s,"USA",2,{convoy:v});assert.equal(v.count,before-2);
  assert.equal(merchantEconomy(s,c).gtp,gtp);assert.ok(convoyRecord(s,"USA").sunk>0);
  assert.ok(n.convoys.reduce((v,x)=>v+x.count,0)<=n.merchant.hulls);
});
test("five-stage surface combat changes damage over time, supports five main rounds and survives saves",()=>{
  const [s,c]=start();war(s,"USA","JPN");
  const forces=["USA","JPN"].map(id=>s.nations[id].fleets.filter(f=>f.role==="battle").sort((a,b)=>fleetStats(s,c,id,b).tons-fleetStats(s,c,id,a).tons)[0]);
  const r=beginEngagement(s,c,{kind:"surface",a:"USA",b:"JPN",fleetA:forces[0].id,fleetB:forces[1].id,region:"pacific",position:[160,20]});
  r.mainRounds=5;
  assert.equal(r.status,"ongoing");assert.equal(r.resultA.damagedTons+r.resultB.damagedTons,0);
  assert.throws(()=>orderFleet(s,c,forces[0].id,"guard"),/disengages/);
  assert.match(battleDetails(r,s),/ONGOING/);
  const stages=new Set([0]);let exchanges=0;
  for(let i=0;i<12 && r.status==="ongoing";i++){
    const stage=r.stage;setCampaignMinutes(s,r.nextStageAt);progressEngagements(s,c);
    if(stage===2||stage===3)exchanges++;
    if(r.status==="ongoing")stages.add(r.stage);
    validateSave(s,CATALOG);
  }
  assert.deepEqual([...stages],[0,1,2,3,4]);assert.equal(r.status,"completed");assert.equal(exchanges,6);
  assert.ok(r.resultA.tons+r.resultB.tons+r.resultA.damagedTons+r.resultB.damagedTons>0);
  assert.ok(r.completedAt-r.startedAt>=200);
  assert.ok(forces.every(f=>!f.battleId));assert.equal(s.reports.filter(x=>x.id===r.id).length,1);
});
