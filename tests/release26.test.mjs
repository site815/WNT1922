import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame, monthlyIncome, yardLoad } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { growthOutlook, closeEconomicMonth } from '../mechanics/economic-growth.mjs';
import { recordConvoy, gdpGrowthRate, requiredShipping } from '../mechanics/economy-rules.mjs';
import { merchantEconomy } from '../mechanics/merchant-economy.mjs';
import { industryExpansion } from '../mechanics/levels.mjs';
import { navalAircraftInventory } from '../mechanics/aircraft-inventory.mjs';
import { applyCommand } from '../mechanics/game-actions.mjs';
import { aircraftSummary } from '../mechanics/naval-resources.mjs';
import { validateSave } from '../mechanics/state-io.mjs';
import { setCampaignMinutes } from '../mechanics/campaign-clock.mjs';
import { resourcesView, aircraftCatalogView } from '../ui/ministry-view.mjs';
import { resourceHover } from '../ui/resource-breakdown.mjs';
import { topBars } from '../ui/top-bars.mjs';
import { economyView } from '../ui/economy-view.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const start=(id='JPN',campaign='in_good_faith_1936')=>{const s=newGame(CATALOG,id,260026,campaign);return [s,contentFor(CATALOG,s),s.nations[id]];};
const close=(s,c,id,full=true)=>{
 const d=new Date(s.day*86400000);setCampaignMinutes(s,Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1)/60000);
 if(full) recordConvoy(s,id,{delivered:requiredShipping(s,id)*2});
 closeEconomicMonth(s,c,id);
};
test('bombing growth has exact neutral and contraction points, including 100% disruption',()=>{
 for(const normal of [.01,.005,-.003]) {
  near(gdpGrowthRate(normal,0),normal);near(gdpGrowthRate(normal,.25),normal/2);
  near(gdpGrowthRate(normal,.5),0);near(gdpGrowthRate(normal,.75),-.01);near(gdpGrowthRate(normal,1),-.02);
 }
 for(const [damage,rate] of [[.5,0],[.75,-.01],[1,-.02]]) {
  const [s,c,n]=start();Object.assign(s.relations['JPN-USA'],{war:true,allied:false,warSince:s.day});
  n.industrialDamage.industry=damage;const before=n.gdp;close(s,c,'JPN');near(n.gdp,before*(1+rate));validateSave(s,CATALOG);
 }
});
test('all 14 starts store authored GTP; monthly trade and hull-size growth are independent and prorated',()=>{
 for(const campaign of Object.keys(CATALOG.campaigns))for(const id of Object.keys(CATALOG.campaigns[campaign].nations)) {
  const [s,c,n]=start(id,campaign),gtp=n.gtp,size=n.merchant.averageGRT;
  const fraction=campaign==='campaign_1922'?23/28:1;
  near(n.gtp,c.nations[id].economy.gtp);near(merchantEconomy(s,c).logistics,50);
  close(s,c,id);near(n.gtp,gtp*1.0005**fraction);near(n.merchant.averageGRT,size*1.001**fraction);
  const grown=n.gtp;n.merchant.hulls=Math.max(1,n.merchant.hulls-1);near(merchantEconomy(s,c).gtp,grown);
  for(const p of Object.values(s.ports))p.health=0;
  n.convoyRecord=[];close(s,c,id,false);near(n.gtp,grown*.98);
 }
});
test('industry expansions add opening capacity and positive hull growth, never compound or amplify decline',()=>{
 for(const campaign of Object.keys(CATALOG.campaigns)) {
  const [s,c,n]=start('USA',campaign);recordConvoy(s,'USA',{delivered:1e7});
  const base={industry:monthlyIncome(s,c).industry,yards:yardLoad(s,c).capacity,hulls:growthOutlook(s,c).merchantHullsMonth,trade:growthOutlook(s,c).tradeMonthly};
  n.tech.industry+=2;near(industryExpansion(s).multiplier,1.3);
  near(monthlyIncome(s,c).industry,base.industry*1.3);near(yardLoad(s,c).capacity,base.yards*1.3);
  near(growthOutlook(s,c).merchantHullsMonth,base.hulls*1.3);near(growthOutlook(s,c).tradeMonthly,base.trade);
  for(const p of Object.values(s.ports))p.health=0;n.convoyRecord=[];
  near(growthOutlook(s,c).merchantMonthly,-.02);near(growthOutlook(s,c).tradeMonthly,-.02);
 }
});
test('ALB Japan grows 1.073 hulls per full peaceful month at full logistics; average size adds no GTP multiplier',()=>{
 const [s,c,n]=start();recordConvoy(s,'JPN',{delivered:1e7});
 near(growthOutlook(s,c).merchantHullsMonth,1.073);const before=n.merchant.hulls,gtp=n.gtp;
 close(s,c,'JPN');near(n.merchant.hulls+n.civilianShipping.carry,before*1.0005);near(n.gtp,gtp*1.0005);
});
test('superseded naval reserve retirement conserves deployed airframes and personnel and is actor-scoped',()=>{
 for(const id of ['USA','GBR']) {
  const [s,c]=start('USA'),n=s.nations[id];
  const old=navalAircraftInventory(s,c,id).find(r=>r.replacement);assert.ok(old,id+' has a superseded model');
  const model=old.model.id;n.aircraft[model]+=20;
  const port=Object.values(n.airBases)[0];port.reserve.push({model,role:'fighter',count:4,crewed:0});
  const previous=n.productionModels.fighter;n.productionModels.fighter=model;
  const unchanged=JSON.stringify(n);assert.throws(()=>applyCommand(s,CATALOG,{type:'retire-aircraft',args:{id:model}},id),/production line/);assert.equal(JSON.stringify(n),unchanged);
  n.productionModels.fighter=previous===model?old.replacement.id:previous;
  for(const [k,v] of Object.entries(n.productionModels))if(v===model)n.productionModels[k]=old.replacement.id;
  const row=navalAircraftInventory(s,c,id).find(r=>r.model.id===model),air=aircraftSummary(s,c,id),aviators=n.aviators;
  const wings=JSON.stringify(n.groups.map(g=>g.airWing)),onBase=JSON.stringify(Object.values(n.airBases).map(b=>b.airWing));
  const result=applyCommand(s,CATALOG,{type:'retire-aircraft',args:{id:model}},id);
  assert.equal(result.count,row.retireable);near(aircraftSummary(s,c,id).total,air.total-row.retireable);assert.equal(n.aviators,aviators);
  assert.equal(JSON.stringify(n.groups.map(g=>g.airWing)),wings);assert.equal(JSON.stringify(Object.values(n.airBases).map(b=>b.airWing)),onBase);
  assert.equal(navalAircraftInventory(s,c,id).find(r=>r.model.id===model).retireable,0);validateSave(s,CATALOG);
  assert.throws(()=>applyCommand(s,CATALOG,{type:'retire-aircraft',args:{id:c.nations[id].armyAircraft[0].id}},id),/Only your naval/);
 }
});
test('economic and aircraft views render current formulas, reserve counts and rates for all starts',()=>{
 for(const campaign of Object.keys(CATALOG.campaigns))for(const id of Object.keys(CATALOG.campaigns[campaign].nations)) {
  const [s,c]=start(id,campaign);
  for(const html of [topBars(s,c),resourcesView(s,c),aircraftCatalogView(s,c),economyView(s,c)])assert.doesNotMatch(html,/NaN|undefined|Infinity/);
  for(const key of ['GDP','GTP','LOGISTICS','SHIPPING','GOLD','INDUSTRY','YARDS','AIRCRAFT']) {
   const html=resourceHover(s,c,key);assert.doesNotMatch(html,/NaN|undefined|Infinity/);
   assert.match(html,/Formula:|formula| = /);
  }
  assert.match(topBars(s,c),/resource-change/);assert.match(resourceHover(s,c,'AIRCRAFT'),/Naval model/);
 }
});
