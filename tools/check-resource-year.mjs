// Isolate the recurring economy: no procurement, combat or AI intervention.
// Full minute-by-minute campaigns are tested separately.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {newGame,monthlyIncome} from '../game/src/engine.mjs';
import {GAME_VERSION} from '../game/src/version.mjs';
import {contentFor} from '../game/src/campaign-content.mjs';
import {dailyResources,aircraftSummary} from '../game/src/naval-resources.mjs';
const bundle=JSON.parse(fs.readFileSync('game/staging/content.json')),results=[];
for(const campaign of Object.keys(bundle.campaigns))for(const id of Object.keys(bundle.campaigns[campaign].nations)){
 const s=newGame(bundle,id,1509,campaign),c=contentFor(bundle,s),n=s.nations[id],begin={gold:n.gold,industry:n.industry,sailors:n.crew,aviators:n.aviators,aircraft:aircraftSummary(s,c).total};
 // Other ministries are irrelevant to this isolated spending check.
 const ministries=s.nations;s.nations={[id]:n};let minGold=n.gold,minIndustry=n.industry,minAircrew=aircraftSummary(s,c).aviatorBalance;
 for(let i=0;i<365;i++){
  s.day++;dailyResources(s,c,()=>{});
  if(new Date(s.day*86400000).getUTCDate()===1){const income=monthlyIncome(s,c);n.gold+=income.gold;n.influence+=income.influence;}
  minGold=Math.min(minGold,n.gold);minIndustry=Math.min(minIndustry,n.industry);minAircrew=Math.min(minAircrew,aircraftSummary(s,c).aviatorBalance);
  const aircraft=aircraftSummary(s,c);assert.ok(Number.isFinite(aircraft.aviatorBalance));assert.ok(aircraft.crewed<=aircraft.total);
  for(const k of ['gold','industry','influence','crew','aviators'])assert.ok(Number.isFinite(n[k])&&n[k]>=0,campaign+' '+id+' '+k);
 }
 assert.ok(n.gold>begin.gold,id+' recurring budget shrank treasury');assert.ok(minGold>0&&minIndustry>0,id+' operations exhausted reserves');
 results.push({campaign,id,days:365,begin,end:{gold:Math.round(n.gold),industry:Math.round(n.industry),sailors:n.crew,aviators:n.aviators,aircraft:aircraftSummary(s,c).total},minGold:Math.round(minGold),minIndustry:Math.round(minIndustry),minAircrew});s.nations=ministries;
 console.log(campaign+' '+id+' recurring economy passed');
}
fs.writeFileSync('game/test-output/release'+GAME_VERSION.split('.')[1]+'-resource-year.json',JSON.stringify({generatedAt:new Date().toISOString(),results},null,2));
