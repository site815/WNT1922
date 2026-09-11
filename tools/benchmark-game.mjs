import fs from 'node:fs';
import os from 'node:os';
import { newGame, tick, pairKey } from '../game/src/engine.mjs';
import { SPEEDS } from '../game/src/naval-resources.mjs';
import { fleetGroups, fleetStats, invalidateOperations } from '../game/src/task-forces.mjs';
import { campaignMinutes, setCampaignMinutes } from '../game/src/campaign-clock.mjs';
import { validateSave } from '../game/src/state-io.mjs';
import { NODES } from '../game/src/world.mjs';
const content=JSON.parse(fs.readFileSync(process.env.WNT_TEST_PUBLIC ? process.env.WNT_TEST_PUBLIC+'/content.json' : new URL('../game/public/content.json',import.meta.url)));
function crowded(){
  const s=newGame(content,'JPN',41273);s.autoPause=false;s.paused=false;s.decisions=[];setCampaignMinutes(s,Date.parse('1942-01-01T00:00:00Z')/60000);s.timeline.polandOccurred=true;s.timeline.europeOccurred=true;
  for(const r of Object.values(s.relations))Object.assign(r,{war:true,allied:false,warSince:s.day,score:-60});
  for(const [id,n]of Object.entries(s.nations)){
    while(n.fleets.length<20){const f=n.fleets.reduce((a,b)=>fleetGroups(s,id,a.id).length>fleetGroups(s,id,b.id).length?a:b),ships=fleetGroups(s,id,f.id).filter(g=>g.status==='active');if(ships.length<2)break;const extra={...structuredClone(f),id:`benchmark-${id}-${n.fleets.length}`};for(const g of ships.slice(Math.ceil(ships.length/2)))g.fleetId=extra.id;n.fleets.push(extra);}
    for(const f of n.fleets){f.route=[[...NODES.north_sea]];f.node='north_sea';f.area='north_sea';f.departAt=campaignMinutes(s);f.arriveAt=f.departAt;f.phase='patrol';f.nextPlanAt=f.departAt+10000;f.aggressiveBattle=false;const stats=fleetStats(s,content,id,f);f.speed=stats.speed;f.maxRangeNm=stats.range;f.fuelNm=stats.range;}
  }invalidateOperations(s);return s;
}
const baseline=crowded(),results=[];
for(const [speed,label]of [...SPEEDS,...(SPEEDS.some(([v])=>v===10)?[]:[[10,'Very fast · 100,000× (candidate)']])]){
  const s=structuredClone(baseline);s.speed=speed;const before=campaignMinutes(s),start=performance.now(),samples=[];
  for(let frame=0;frame<200;frame++){const t=performance.now();tick(s,content,.05);samples.push(performance.now()-t);}
  const elapsed=performance.now()-start,minutes=campaignMinutes(s)-before;validateSave(s,content);samples.sort((a,b)=>a-b);
  const accountingPassed=Math.abs(minutes-speed*10000/6)<.001&&s.minuteTicks===Math.floor(speed*10000/6);
  const result={label,multiplier:speed*10000,realSecondsOfDemand:10,gameMinutes:minutes,cpuMilliseconds:+elapsed.toFixed(1),cpuFraction:+(elapsed/10000).toFixed(3),p95FrameMs:+samples[190].toFixed(2),minuteTicks:s.minuteTicks,canSustainWithHeadroom:elapsed<8000,estimatedCpuCeiling:Math.round(minutes*60000/elapsed),passes:accountingPassed};results.push(result);console.log(JSON.stringify(result));
}
const report={generatedAt:new Date().toISOString(),runtime:process.version,cpu:os.cpus()[0]?.model,scenario:'140 co-located wartime commands from the opening inventories, seven countries at war, 56 moving convoy packets. Each run processes 10 real seconds of demand in 200 frame-sized steps, including combat, daily systems and save validation.',note:'Engine throughput on this computer. Browser drawing is separate from the simulation worker; the simulation worker bounds requested wall-time debt and slows game-time advancement under load while preserving every crossed operational minute.',results};
fs.writeFileSync(new URL('../game/benchmark-result.json',import.meta.url),JSON.stringify(report,null,2));
if(results.some(r=>!r.passes&&SPEEDS.some(([v])=>v*10000===r.multiplier)))process.exitCode=1;
