import fs from 'node:fs';
import {newGame,advanceDays} from '../game/src/engine.mjs';
import {campaignMinutes,setCampaignMinutes} from '../game/src/campaign-clock.mjs';
import {orderFleet,invalidateOperations} from '../game/src/task-forces.mjs';
import {validateSave} from '../game/src/state-io.mjs';
import {NODES} from '../game/src/world.mjs';
const b=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/public')+'/content.json')),s=newGame(b,'GBR',7214);
s.autoPause=false;s.paused=false;s.decisions=[];setCampaignMinutes(s,Date.parse('1942-01-01T00:00:00Z')/60000);s.timeline.polandOccurred=s.timeline.europeOccurred=true;
for(const r of Object.values(s.relations))Object.assign(r,{war:true,allied:false,score:-60,warSince:s.day});
let index=0;for(const [id,n]of Object.entries(s.nations)){const f=n.fleets.find(f=>f.role==='carrier')||n.fleets.find(f=>f.role==='battle')||n.fleets.find(f=>f.role==='cruiser');if(!f)continue;n.gold=n.industry=1e6;n.influence=500;orderFleet(s,b,f.id,index++%2?'anchorage':'siege',null,id,{manual:true,aggressiveBattle:true});if(!f.objectiveNode)continue;f.route=[NODES[f.objectiveNode]];f.node=f.targetNode=f.objectiveNode;f.departAt=f.arriveAt=campaignMinutes(s);f.phase='patrol';f.nextPlanAt=campaignMinutes(s)+1440;for(const g of n.groups.filter(g=>g.fleetId===f.id))g.atSea=true;}
invalidateOperations(s);let portActions=0,seen=new Set(),minimum=1;
const start=performance.now();for(let i=0;i<30;i++){advanceDays(s,b,1);validateSave(s,b);for(const r of s.reports)if(r.kind==='port'&&!seen.has(r.id)){portActions++;seen.add(r.id);}minimum=Math.min(minimum,...Object.values(s.ports).map(p=>p.health));}
if(!portActions||minimum>=1)throw Error('Port combat was not exercised.');
const repaired=Object.values(s.ports).reduce((v,p)=>v+p.repairSpent.gold,0);if(!repaired)throw Error('Automatic port repair was not exercised.');
const result={generatedAt:new Date().toISOString(),days:30,minuteTicks:s.minuteTicks,portActions,lowestPortCondition:minimum,goldSpentRepairing:repaired,cpuSeconds:(performance.now()-start)/1000};fs.writeFileSync('game/port-integration-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
