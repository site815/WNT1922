import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,monthlyIncome,fleetPower,shipPrice,yardLoad,projectPrice} from '../src/engine.mjs';
import {contentFor} from '../src/campaign-content.mjs';
import {sailorSummary} from '../src/ship-staffing.mjs';
import {facilityBudget,aircraftProductionPlan,aircraftSummary,dailyResources,orderAircraft,allocateAircraft,aircraftModels,planeRole} from '../src/naval-resources.mjs';
import {graduationProgress} from '../src/personnel-training.mjs';
import {merchantEconomy} from '../src/merchant-economy.mjs';
import {invalidatePorts} from '../src/ports.mjs';
import {PROGRAMS} from '../src/balance.mjs';
const bundle=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/staging')+'/content.json'));
const start=(id='JPN',campaign='in_good_faith_1936')=>{const s=newGame(bundle,id,15031,campaign);return [s,contentFor(bundle,s)];};
const day=date=>Date.parse(date+'T00:00:00Z')/86400000;

test('all fourteen openings have affordable operating plans and staffed hulls at 50% funding',()=>{
 for(const campaign of Object.keys(bundle.campaigns))for(const id of Object.keys(bundle.campaigns[campaign].nations)){
  const [s,c]=start(id,campaign),n=s.nations[id],budget=facilityBudget(s,c),cash=monthlyIncome(s,c),crew=sailorSummary(s,c);
  assert.equal(n.aircraftFunding,.5);assert.ok(cash.netGold>0,campaign+' '+id+' operating deficit');assert.ok(cash.netIndustry>0);
  assert.equal(crew.waiting,0,campaign+' '+id+' opening ships without crews');assert.ok(crew.balance>=0);
  assert.ok(Number.isFinite(budget.aircrewDemand)&&n.aviatorsYear*n.aviatorFunding>0);assert.ok(aircraftSummary(s,c).aviatorBalance>=0);
  assert.ok(fleetPower(s,c).supply>.5,id+' opening supply collapse');
 }
});
test('automatic opening stations disperse large navies and preserve authored deployments',()=>{
 for(const id of ['USA','GBR']){const [s,c]=start(id),n=s.nations[id];assert.ok(new Set(n.fleets.map(f=>f.port)).size>=3);for(const f of n.fleets.filter(f=>f.phase==='port'))assert.equal(f.route.length,1);}
 const [s]=start('GBR');for(const g of s.nations.GBR.groups.filter(g=>['h-hms_barham','h-hms_malaya'].includes(g.id))){const f=s.nations.GBR.fleets.find(f=>f.id===g.fleetId);assert.equal(f.port,'singapore');}
});
test('graduation progress respects first partial intakes, leap months, quarters and year rollover',()=>{
 const n={personnelTraining:{sailors:45.8,aviators:6.4}},s={campaignId:'campaign_1922',day:day('1922-02-06')};
 let p=graduationProgress(s,n,'sailors');assert.equal(p.start,s.day);assert.equal(p.end,day('1922-03-01'));assert.equal(p.duration,23);assert.equal(p.trainees,45);
 s.day=day('1922-03-01');p=graduationProgress(s,n,'aviators');assert.equal(p.start,day('1922-02-06'));assert.equal(p.end,day('1922-04-01'));
 s.day=day('1936-02-15');assert.equal(graduationProgress(s,n,'sailors').duration,29);
 s.day=day('1936-12-31');p=graduationProgress(s,n,'aviators');assert.equal(p.end,day('1937-01-01'));assert.equal(p.duration,92);
});
test('operating estimate includes every facility and daily debits match funded output',()=>{
 const [s,c]=start(),n=s.nations.JPN;n.gold=n.industry=1e7;const budget=facilityBudget(s,c),before={gold:n.gold,industry:n.industry,crew:n.crew,aviators:n.aviators},income=monthlyIncome(s,c);
 s.day++;dailyResources(s,c,()=>{});
 const schools=budget.rows.filter(r=>['school','pilots'].includes(r.key)),schoolGold=schools.reduce((v,r)=>v+r.gold,0),schoolIndustry=schools.reduce((v,r)=>v+r.industry,0);
 assert.ok(Math.abs(before.gold-n.gold-((budget.gold-schoolGold)/365+schoolGold/366))<1e-7);
 assert.ok(Math.abs(n.industry-before.industry-(income.industry*12/365-(budget.industry-schoolIndustry)/365-schoolIndustry/366))<1e-7);
 assert.equal(n.crew,before.crew);assert.equal(n.aviators,before.aviators);
 assert.equal(income.netGold,income.gold-budget.gold/12);assert.equal(income.netIndustry,income.industry-budget.industry/12);
});
test('prepaid aircraft orders and automatic lines share a single factory capacity',()=>{
 const [s,c]=start(),n=s.nations.JPN;n.gold=n.industry=1e7;n.influence=500;n.aircraftFunding=.1;
 const model=n.productionModels.fighter;orderAircraft(s,c,model,100);const plan=aircraftProductionPlan(s,c);
 assert.ok(plan.demand>plan.capacity);assert.equal(plan.automatic,0);
 const order=n.airOrders[0],before=order.remaining;s.day++;dailyResources(s,c,()=>{});assert.ok(Math.abs(before-order.remaining-1/plan.factor)<1e-9);assert.equal(n.aircraftOutput,0);
 n.airOrders=[];assert.ok(aircraftProductionPlan(s,c).automatic>0);
});
test('air wings modernize in port without consuming aircraft, bypassing dates or changing wings at sea',()=>{
 const [s,c]=start(),n=s.nations.JPN,g=n.groups.find(g=>g.fleetId&&c.classes[g.classId].air>0),f=n.fleets.find(f=>f.id===g.fleetId),models=aircraftModels(c,'JPN');
 const fighters=models.filter(a=>['fighter','multirole'].includes(planeRole(a))).sort((a,b)=>a.type_year-b.type_year),old=fighters[0],modern=fighters.at(-1),capacity=(c.classes[g.classId].air+c.classes[g.classId].scoutAircraft)*g.count;
 n.groups=[g];n.fleets=[f];n.airBases={};n.airTransfers=[];g.dockPort='yokosuka';f.port='yokosuka';n.aircraft=Object.fromEntries(models.map(a=>[a.id,0]));n.aircraft[old.id]=capacity;n.aircraft[modern.id]=capacity;
 n.aviators=capacity*10;n.aircraftUnlocked=[old.id,modern.id];g.airWing=[{model:old.id,role:'fighter',count:capacity,crewed:capacity}];
 s.day=day((modern.type_year-1)+'-01-01');f.phase='port';g.atSea=false;allocateAircraft(s,c,'JPN');assert.equal(g.airWing[0].model,old.id,'future models cannot embark');
 s.day=day(modern.type_year+'-01-01');f.phase='passage';g.atSea=true;allocateAircraft(s,c,'JPN');assert.equal(g.airWing[0].model,old.id,'no aircraft transfers at sea');
 const owned={...n.aircraft},aviators=n.aviators;g.atSea=false;f.phase='port';allocateAircraft(s,c,'JPN');
 assert.deepEqual(g.airWing.map(w=>[w.model,w.count]),[[modern.id,capacity]]);assert.deepEqual(n.aircraft,owned);assert.equal(n.aviators,aviators);assert.equal(aircraftSummary(s,c).reserve,capacity);
 allocateAircraft(s,c,'JPN');assert.deepEqual(n.aircraft,owned);assert.equal(aircraftSummary(s,c).assigned,capacity);
});
test('levels, funding, shipping loss and construction discounts have consistent monotonic effects',()=>{
 const [s,c]=start(),n=s.nations.JPN,cl=c.nations.JPN.designs.find(id=>c.classes[id].type==='DD');let cost=Infinity,yards=0,shippingDemand=0;
 for(let level=1;level<=9;level++){
  n.tech.industry=n.tech.standardization=level;const price=shipPrice(s,c,cl),load=yardLoad(s,c),trade=merchantEconomy(s,c);
  assert.ok(price.gold<=cost&&price.gold>0);assert.ok(load.capacity>=yards);assert.ok(trade.required>=shippingDemand);
  cost=price.gold;yards=load.capacity;shippingDemand=trade.required;
  for(const key of Object.keys(PROGRAMS)){n.tech[key]=level;const p=projectPrice(s,key);assert.ok(p.gold>0&&p.industry>0&&p.influence>0&&p.days>0);}
 }
 const full=merchantEconomy(s,c);n.merchant.otherHulls=0;n.merchant.otherGRT=0;for(const g of n.groups.filter(g=>g.service==='merchant'))g.count=0;
 const lost=merchantEconomy(s,c);assert.equal(lost.economyFactor,lost.domestic);assert.ok(lost.logistics<full.logistics);
 n.industryFunding=.1;assert.ok(yardLoad(s,c).capacity<yards);for(const p of Object.values(s.ports))p.health=0;invalidatePorts(s);assert.equal(yardLoad(s,c).capacity,0);
});
