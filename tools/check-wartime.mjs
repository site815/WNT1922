import fs from 'node:fs';
import { newGame,advanceDays,resolveBattle } from '../game/src/engine.mjs';
import { campaignMinutes,setCampaignMinutes } from '../game/src/campaign-clock.mjs';
import { invalidateOperations } from '../game/src/task-forces.mjs';
import { validateSave } from '../game/src/state-io.mjs';
import { NODES } from '../game/src/world.mjs';
const c=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/public')+'/content.json')),s=newGame(c,'FRA',82718);
s.autoPause=false;s.paused=false;s.decisions=[];setCampaignMinutes(s,Date.parse('1942-01-01T00:00:00Z')/60000);s.timeline.polandOccurred=s.timeline.europeOccurred=true;
for(const r of Object.values(s.relations))Object.assign(r,{war:true,allied:false,score:-60,warSince:s.day});
for(const n of Object.values(s.nations))for(const f of n.fleets){f.route=[NODES.north_sea];f.arriveAt=f.departAt=campaignMinutes(s);f.phase='patrol';f.nextPlanAt=campaignMinutes(s)+1440;f.aggressiveBattle=true;}
for(const id of ['JPN','USA'])for(const g of s.nations[id].groups)if(g.status==='active')g.region='atlantic';
invalidateOperations(s);resolveBattle(s,c,'JPN','USA','atlantic');
const start=performance.now();for(let i=0;i<3;i++){advanceDays(s,c,30);validateSave(s,c);console.log('Seven-navy wartime integration validated day '+(i+1)*30);}
const casualties=Object.fromEntries(Object.entries(s.nations).map(([id,n])=>[id,n.casualties]));
if(!Object.values(s.nations).some(n=>n.casualties.sailors.recovered>0))throw new Error('No sailor recovery exercised.');
const report={generatedAt:new Date().toISOString(),days:90,minuteTicks:s.minuteTicks,cpuSeconds:+((performance.now()-start)/1000).toFixed(2),reportsRetained:s.reports.length,casualties};
fs.writeFileSync('game/wartime-result.json',JSON.stringify(report,null,2));console.log(JSON.stringify({days:90,minuteTicks:s.minuteTicks,reports:s.reports.length,recovered:Object.values(s.nations).reduce((v,n)=>v+n.casualties.sailors.recovered+n.casualties.aviators.recovered+n.casualties.aircraft.recovered,0)}));
