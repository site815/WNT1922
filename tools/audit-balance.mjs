import fs from 'node:fs';
import * as sim from '../game/src/engine.mjs';
import {contentFor} from '../game/src/campaign-content.mjs';
import {aircraftModels,aircraftSummary} from '../game/src/naval-resources.mjs';
import {sailorSummary} from '../game/src/ship-staffing.mjs';
import {AIRCRAFT_YEAR} from '../game/src/balance.mjs';
const bundle=JSON.parse(fs.readFileSync('game/staging/content.json'));
const results=[];
for(const campaign of Object.keys(bundle.campaigns))for(const id of Object.keys(bundle.campaigns[campaign].nations)){
 const s=sim.newGame(bundle,id,15001,campaign),c=contentFor(bundle,s),n=s.nations[id],income=sim.monthlyIncome(s,c,id),models=aircraftModels(c,id),choices=Object.values(n.productionModels).filter(Boolean).map(k=>models.find(a=>a.id===k));
 const average=key=>choices.reduce((v,a)=>v+key(a),0)/Math.max(1,choices.length),airRate=AIRCRAFT_YEAR[id]*n.aircraftFunding;
 const costs={industryGold:income.industryOperating*12,schoolGold:n.crewYear*n.schoolFunding*3,pilotGold:n.aviatorsYear*n.aviatorFunding*25,airGold:airRate*average(a=>a.cost_gold),schoolIndustry:n.crewYear*n.schoolFunding*.15,pilotIndustry:n.aviatorsYear*n.aviatorFunding*2,airIndustry:airRate*average(a=>(a.weights?.empty_kg||2500)/80)};
 const cash=income.gold*12-costs.industryGold-costs.schoolGold-costs.pilotGold-costs.airGold,industry=income.industry*12-costs.schoolIndustry-costs.pilotIndustry-costs.airIndustry;
 const result={campaign,id,gold:n.gold,industry:n.industry,annualAppropriationAfterUpkeep:Math.round(income.gold*12),annualGoldBalance:Math.round(cash),annualIndustryBalance:Math.round(industry),costs,sailors:sailorSummary(s,c,id),aviation:aircraftSummary(s,c,id),annualNewAircrewDemand:Math.round(airRate*average(a=>a.crew?.normal||1)),aviatorsYear:n.aviatorsYear,sailorsYear:n.crewYear,supply:sim.fleetPower(s,c,id).supply,yards:sim.yardLoad(s,c,id)};
 results.push(result);console.log(JSON.stringify({campaign,id,goldYear:result.annualGoldBalance,industryYear:result.annualIndustryBalance,sailors:result.sailors.balance,pilots:result.aviation.aviatorBalance,newAircrew:result.annualNewAircrewDemand,graduates:n.aviatorsYear,supply:+result.supply.toFixed(2),yards:+result.yards.factor.toFixed(2)}));
}
fs.writeFileSync('game/test-output/balance-15-opening.json',JSON.stringify({generatedAt:new Date().toISOString(),results},null,2));
