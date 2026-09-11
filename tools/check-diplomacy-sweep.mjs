// Isolated daily diplomatic calendar sweep; this does not run fleet or resource operations.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {newGame,advanceMinutes,chooseDecision} from '../game/src/engine.mjs';
import {contentFor} from '../game/src/campaign-content.mjs';
import {campaignMinutes,setCampaignMinutes,adjustEuropeanTimeline} from '../game/src/campaign-clock.mjs';
import {monthlyRelations} from '../game/src/war-politics.mjs';
import {validateSave} from '../game/src/state-io.mjs';
import {NATION_ORDER} from '../game/src/catalog.mjs';
const bundle=JSON.parse(fs.readFileSync('game/staging/content.json')),results=[];
const iso=m=>new Date(m*60000).toISOString().slice(0,10),end=Date.parse('1942-01-01T00:00:00Z')/60000;
for(const campaign of Object.keys(bundle.campaigns))for(const id of NATION_ORDER){
 const s=newGame(bundle,id,81773,campaign),c=contentFor(bundle,s);s.decisions=[];s.paused=false;s.autoPause=false;
 const begin=campaignMinutes(s),seen=new Set(),warnings=[],wars=[];let monthlyChecks=0;
 for(let at=begin;at<=end;at+=1440){
  setCampaignMinutes(s,at);
  if(new Date(at*60000).getUTCDate()===1&&at>begin){monthlyRelations(s,c);adjustEuropeanTimeline(s);monthlyChecks++;}
  advanceMinutes(s,c,0);
  for(const r of Object.values(s.relations)){
   if(r.warning&&!seen.has(r.warning.id)){seen.add(r.warning.id);warnings.push({pair:[r.a,r.b].sort().join('-'),start:iso(at),expected:iso(r.warning.endsAt),months:r.warning.months,scripted:r.warning.scripted});assert.ok(r.warning.months>=1&&r.warning.months<=12);assert.ok(r.warning.endsAt>r.warning.startedAt);assert.ok(at>=Date.parse('1931-01-01T00:00:00Z')/60000,'Unprovoked pre-1931 warning');}
   const key=[r.a,r.b].sort().join('-');if(r.war&&!seen.has('war-'+key)){seen.add('war-'+key);wars.push({pair:key,start:iso(at)});}
  }
  // A neutral player acknowledges news and declines membership or defensive calls.
  while(s.decisions.length){const d=s.decisions[0];chooseDecision(s,c,d.key,d.defaultOption||d.options.at(-1).id);}
  if(new Date(at*60000).getUTCDate()===1)validateSave(s,bundle);
 }
 assert.equal(s.timeline.europeOccurred,true);assert.equal(s.timeline.polandOccurred,true);
 const limit=campaign==='campaign_1922'?365:60;assert.ok(Math.abs(s.timeline.offsetDays)<=limit);
 for(const pair of ['DEU-GBR','DEU-FRA']){const war=wars.find(w=>w.pair===pair);assert.ok(war);assert.ok(Date.parse(war.start+'T00:00:00Z')>=Date.parse('1939-09-03T00:00:00Z')-limit*86400000,'Background tension bypassed the historical outbreak window: '+pair);}
 validateSave(s,bundle);results.push({campaign,id,monthlyChecks,warnings,wars,passed:true});console.log(campaign+' '+id+' diplomatic calendar passed to 1942');
}
fs.writeFileSync('game/test-output/release17-diplomacy-sweep.json',JSON.stringify({generatedAt:new Date().toISOString(),scope:'Daily diplomacy only; no fleet, combat or resource operations',results},null,2));
