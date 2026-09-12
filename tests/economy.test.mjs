import { shippingPlan } from "../mechanics/merchant-convoys.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { CATALOG } from "../worker/catalog-loader.mjs";
import { newGame, monthlyIncome, fleetPower, shipPrice, orderShip, yardLoad, supply, diplomaticAction, advanceMinutes } from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import { economyFor } from "../mechanics/balance.mjs";
import { merchantEconomy } from "../mechanics/merchant-economy.mjs";
import { closeEconomicMonth, growthOutlook } from "../mechanics/economic-growth.mjs";
import { ECONOMY, tradeHullGrowth, convoyRecord, recordConvoy } from "../mechanics/economy-rules.mjs";
import { syncConvoys, sinkMerchants, fleetPosition, fleetStats, minuteOperations, invalidateOperations } from "../mechanics/task-forces.mjs";
import { strategicFactor, strategicDemand } from "../mechanics/strategic-materials.mjs";
import { baseAirPower } from "../mechanics/base-aviation.mjs";
import { dailyResources, facilityBudget, aircraftModels, orderAircraft, aircraftPrice } from "../mechanics/naval-resources.mjs";
import { minutePortOperations } from "../mechanics/port-operations.mjs";
import { queueAirStrike } from "../mechanics/air-operations.mjs";
import { setCampaignMinutes, campaignMinutes } from "../mechanics/campaign-clock.mjs";
import { validateSave } from "../mechanics/state-io.mjs";
import { supplyDetails } from "../mechanics/logistics.mjs";
import { NODES } from "../mechanics/world.mjs";
import { resourceHover } from "../ui/resource-breakdown.mjs";
import { economyView } from "../ui/economy-view.mjs";
import { commandView } from "../ui/command-view.mjs";
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6*Math.max(1,Math.abs(b)),a+" != "+b);
const start=(id="JPN",camp="in_good_faith_1936")=>{
  const s=newGame(CATALOG,id,24001,camp);s.autoPause=false;s.paused=false;s.decisions=[];
  return [s,contentFor(CATALOG,s),s.nations[id]];
};
const war=(s,a="JPN",b="USA")=>{ const r=s.relations[[a,b].sort().join("-")];r.war=true;r.allied=false;r.warSince=s.day; };
test("all fourteen product bases, allocations, modifiers and opening budgets agree with their live documents",()=>{
  for(const camp of Object.keys(CATALOG.campaigns)) for(const id of Object.keys(CATALOG.campaigns[camp].nations)){
    const [s,c,n]=start(id,camp), e=economyFor(s,id), m=merchantEconomy(s,c), i=monthlyIncome(s,c);
    near(n.gdp,c.nations[id].economy.gdp);near(m.gtp,c.nations[id].economy.gtp);
    near(e.goldYear,.2*n.gdp+.8*m.gtp);near(e.industryYear,.8*n.gdp+.2*m.gtp);
    near(e.strategicYear,.05*(n.gdp*e.strategicModifier+m.gtp*Math.min(1,m.gtp/n.gdp)));
    assert.ok(i.netGold>0 && i.netIndustry>0 && i.netStrategic>0,id+" opening operating budget");
    assert.equal(m.logistics,50);assert.ok(n.convoys.length>0);
    assert.equal("logistics" in n,false);assert.equal("commerce" in n,false);
    assert.equal("trade" in c.nations[id],false);
    for(const b of Object.values(n.airBases))assert.equal("supplies" in b,false);
    validateSave(s,CATALOG);
  }
});
test("convoys mobilize enough merchants for monthly product demand and losses reduce convoy performance without immediately changing GTP without changing GDP or fleet supply",()=>{
  const [s,c,n]=start();war(s);syncConvoys(s,c,"JPN");
  const total=()=>n.convoys.reduce((v,x)=>v+x.count,0);
  assert.ok(total()>0 && total()<=n.merchant.hulls);
  const before=merchantEconomy(s,c), gdp=n.gdp, tactical=supply(s,c,"JPN"), hulls=n.merchant.hulls;
  recordConvoy(s,"JPN",{delivered:before.average*30});
  const v=n.convoys.reduce((a,b)=>a.count>b.count?a:b), losses=Math.min(10,v.count), lost=sinkMerchants(s,"JPN",losses,{details:true,convoy:v});
  assert.equal(n.merchant.hulls,hulls-losses);assert.equal(lost.hulls,losses);
  near(merchantEconomy(s,c).gtp,before.gtp);
  near(convoyRecord(s,"JPN").success,30/(30+losses));near(merchantEconomy(s,c).logistics,50*(1+30/(30+losses)*Math.min(1,before.average*30/before.required)));
  assert.equal(n.gdp,gdp);near(supply(s,c,"JPN"),tactical);
  assert.ok(total()>0 && total()<=n.merchant.hulls);
  for(const r of Object.values(s.relations))r.war=false;
  syncConvoys(s,c,"JPN");assert.ok(n.convoys.length>0);assert.equal(convoyRecord(s,"JPN").success,1);
  assert.doesNotMatch(commandView(s,c),/class="convoy-marker"/);
});
test("convoy successes and losses expire at their exact thirty-day timestamps",()=>{
  const [s]=start();war(s);recordConvoy(s,"JPN",{delivered:300});
  setCampaignMinutes(s,campaignMinutes(s)+60);recordConvoy(s,"JPN",{sunk:100});
  near(convoyRecord(s,"JPN").success,.75);
  setCampaignMinutes(s,campaignMinutes(s)+30*1440-60);
  assert.equal(convoyRecord(s,"JPN").delivered,0);assert.equal(convoyRecord(s,"JPN").success,0);
  setCampaignMinutes(s,campaignMinutes(s)+60);assert.equal(convoyRecord(s,"JPN").success,1);
});
test("port loss affects trade once, while bombing affects domestic production and GDP growth compounds",()=>{
  const [s,c,n]=start("USA"), e=economyFor(s,"USA"), full=merchantEconomy(s,c);
  for(const p of Object.values(s.ports))p.health=.5;
  near(merchantEconomy(s,c).gtp,full.gtp);
  near(economyFor(s,"USA").goldYear,.2*n.gdp+.8*full.gtp);
  n.industrialDamage.industry=.4;
  near(economyFor(s,"USA").goldYear,.2*n.gdp*.6+.8*full.gtp);
  const gdp=n.gdp;war(s);
  setCampaignMinutes(s,Date.parse("1936-02-01")/60000);closeEconomicMonth(s,c,"USA");near(n.gdp,gdp*1.002);
  setCampaignMinutes(s,Date.parse("1936-03-01")/60000);closeEconomicMonth(s,c,"USA");near(n.gdp,gdp*1.002**2);
  assert.ok(e.goldYear>economyFor(s,"USA").goldYear);
});
test("merchant growth uses the requested logistics curve and hull fractions, with size growth separate",()=>{
  for(const active of [false,true]){
    near(tradeHullGrowth(0,active),-.02);near(tradeHullGrowth(.25,active),-.01);
    near(tradeHullGrowth(.5,active),0);near(tradeHullGrowth(.75,active),active?.01:.00025);
    near(tradeHullGrowth(1,active),active?.02:.0005);
  }
  const [s,c,n]=start();war(s);
  const count=n.merchant.hulls,average=merchantEconomy(s,c).average;
  setCampaignMinutes(s,Date.parse("1936-02-01")/60000);recordConvoy(s,"JPN",{delivered:1e7});closeEconomicMonth(s,c,"JPN");
  near(n.merchant.hulls+n.civilianShipping.carry,count*1.02);
  assert.ok(merchantEconomy(s,c).average>average);
  recordConvoy(s,"JPN",{sunk:10000});
  const before=n.merchant.hulls+n.civilianShipping.carry;
  setCampaignMinutes(s,Date.parse("1936-03-01")/60000);for(const p of Object.values(s.ports))p.health=0;closeEconomicMonth(s,c,"JPN");
  assert.ok(n.merchant.hulls+n.civilianShipping.carry<before);
});
test("strategic exhaustion immediately reduces ships, aircraft and production without changing tactical supply",()=>{
  const [s,c,n]=start(), f=n.fleets.find(x=>x.role==="carrier");
  const original={power:fleetPower(s,c).total, speed:fleetStats(s,c,"JPN",f).speed, air:baseAirPower(s,c,"yokosuka").strike,
    yards:yardLoad(s,c).capacity,industry:monthlyIncome(s,c).industry,supply:supply(s,c,"JPN")};
  n.strategic=0;
  const factor=ECONOMY.STRATEGIC_EMERGENCY_FACTOR;near(strategicFactor(n),factor);
  near(fleetPower(s,c).total,original.power*factor);near(fleetStats(s,c,"JPN",f).speed,original.speed*factor);
  near(baseAirPower(s,c,"yokosuka").strike,original.air*factor);
  near(yardLoad(s,c).capacity,original.yards*factor);near(monthlyIncome(s,c).industry,original.industry*factor);
  near(supply(s,c,"JPN"),original.supply);
  assert.equal("aviationSuppliesSpent" in n,false);
});
test("material changes rebase a moving route without jumping to a different position",()=>{
  const [s,c,n]=start();const f=n.fleets.find(x=>x.role!=="support");
  const now=campaignMinutes(s);f.route=[NODES.yokosuka,NODES.hawaii];f.departAt=now-100;f.arriveAt=now+10000;f.nextPlanAt=now+11000;
  f.speed=15;f.materialFactor=1;f.phase="passage";f.fuelNm=f.maxRangeNm;
  const before=fleetPosition(s,f), arrival=f.arriveAt;n.strategic=0;invalidateOperations(s);
  minuteOperations(s,c,()=>null);
  near(fleetPosition(s,f)[0],before[0]);near(fleetPosition(s,f)[1],before[1]);assert.ok(f.arriveAt>arrival);
});
test("ship and aircraft orders consume strategic materials atomically for every actor",()=>{
  for(const id of ["JPN","USA"]){
    const [s,c,n]=start(id);n.gold=n.industry=n.strategic=1e7;n.influence=500;
    const cl=c.nations[id].designs.find(k=>c.classes[k].type==="DD"&&n.unlocked.includes(k)&&c.classes[k].year===1932)
      ||c.nations[id].designs.find(k=>c.classes[k].type==="DD"&&c.classes[k].year>=1930&&c.classes[k].year<=1936);
    const p=shipPrice(s,c,cl,1,id),old=n.strategic;orderShip(s,c,cl,1,id);near(n.strategic,old-p.strategic);
    const a=aircraftModels(c,id).find(a=>n.aircraftUnlocked.includes(a.id)), cost=aircraftPrice(s,c,a.id,12,id);
    const stock=n.strategic;orderAircraft(s,c,a.id,12,id);near(n.strategic,stock-cost.strategic);
    n.strategic=0;const before=JSON.stringify(s);
    assert.throws(()=>orderShip(s,c,cl,1,id),/strategic/);assert.equal(JSON.stringify(s),before);
  }
});
test("daily product credits and naval-industry running expenses conserve the resource accounts",()=>{
  const [s,c,n]=start();n.gold=n.industry=n.strategic=1e6;n.crewYear=n.aviatorsYear=0;
  n.productionModels={fighter:null,strike:null,scout:null};const e=economyFor(s,"JPN"),before={gold:n.gold,industry:n.industry,strategic:n.strategic};
  const budget=facilityBudget(s,c),demand=strategicDemand(s,c,"JPN");dailyResources(s,c,()=>{});
  near(n.gold-before.gold,(e.goldYear-budget.gold)/12/31);
  near(n.industry-before.industry,e.industryYear*n.industryFunding/12/31);
  near(n.strategic-before.strategic,e.strategicYear/12/31-demand.daily);
});
test("strategic purchasing uses ordinary bilateral affordability and independent ninety-day cooldowns",()=>{
  const [s,c,n]=start();n.gold=20000;const before=n.strategic;
  diplomaticAction(s,"USA","strategic","JPN",c);near(n.strategic,before+2000);assert.equal(n.gold,16000);
  assert.throws(()=>diplomaticAction(s,"USA","strategic","JPN",c),/cooldown/);
  diplomaticAction(s,"GBR","strategic","JPN",c);near(n.strategic,before+4000);
  n.gold=0;const state=JSON.stringify(s);assert.throws(()=>diplomaticAction(s,"FRA","strategic","JPN",c),/gold/);assert.equal(JSON.stringify(s),state);
});
test("fleet supply is an arithmetic fleet average and economic hovers never show obsolete fields or invalid numbers",()=>{
  const [s,c,n]=start();const f=n.fleets[0];f.route=[NODES.hawaii];f.arriveAt=f.departAt=campaignMinutes(s);
  near(supply(s,c,"JPN"),n.fleets.reduce((v,x)=>v+supplyDetails(s,c,"JPN",x).factor,0)/n.fleets.length);
  for(const key of ["GOLD","INDUSTRY","INFLUENCE","STRATEGIC","GDP","GTP","LOGISTICS","SHIPPING","SUPPLY","YARDS"])
    assert.doesNotMatch(resourceHover(s,c,key),/NaN|undefined|Infinity|Domestic share|aviation supplies/i);
  assert.doesNotMatch(economyView(s,c),/NaN|undefined|Infinity|Required capacity/);
});
test("routine patrols cannot initiate port battles or carrier raids",()=>{
  const [s,c,n]=start();war(s);const f=n.fleets.find(x=>x.role==="carrier");
  f.mission="guard";f.phase="patrol";f.route=[NODES.hawaii];f.arriveAt=f.departAt=campaignMinutes(s);f.nextPortAction=-1e9;
  setCampaignMinutes(s,s.day*1440+7);let actions=0;minutePortOperations(s,c,()=>actions++);
  assert.equal(actions,0);
  assert.equal(queueAirStrike(s,c,"JPN",{fleetId:f.id,targetNation:"USA",targetId:"hawaii",targetKind:"port",position:NODES.hawaii}),false);
});
