import fs from 'node:fs';
import assert from 'node:assert/strict';
import {newGame,advanceDays} from '../game/src/engine.mjs';
import {portOwner} from '../game/src/ports.mjs';
import {ISLANDS} from '../game/src/world.mjs';
import {validateSave} from '../game/src/state-io.mjs';
const c=JSON.parse(fs.readFileSync('game/staging/content.json')),results=[];
for(const campaign of ['in_good_faith_1936','campaign_1922']){
 const s=newGame(c,'JPN',9147,campaign);s.paused=false;s.autoPause=false;s.decisions=[];
 Object.assign(s.relations['JPN-USA'],{war:true,allied:false,score:-60,warSince:s.day});s.nations.JPN.priority=s.nations.USA.priority='presence';
 const started=performance.now(),checkpoints=[];
 for(let day=30;day<=180;day+=30){advanceDays(s,c,30);validateSave(s,c);const changed=ISLANDS.filter(i=>portOwner(s,i.node)!==i.owner).map(i=>({island:i.name,owner:portOwner(s,i.node)}));checkpoints.push({day,changed,fronts:s.world.fronts.filter(f=>f.island).map(f=>({id:f.id,progress:f.progress,status:f.status}))});console.log(campaign,day,JSON.stringify(changed));fs.writeFileSync('game/test-output/pacific-checkpoint.json',JSON.stringify({campaign,day,checkpoints},null,2));}
 assert.ok(checkpoints.some(p=>p.changed.length),'Admirals must bring an actual island campaign to completion from their real opening ports');
 results.push({campaign,days:180,minuteTicks:s.minuteTicks,elapsedSeconds:(performance.now()-started)/1000,checkpoints});
}
fs.writeFileSync('game/test-output/pacific-result.json',JSON.stringify(results,null,2));
