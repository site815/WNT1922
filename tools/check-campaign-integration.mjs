import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { newGame, advanceDays, fleetSummary } from '../game/src/engine.mjs';
import { contentFor } from '../game/src/campaign-content.mjs';
import { validateSave } from '../game/src/state-io.mjs';
import { campaignMinutes } from '../game/src/campaign-clock.mjs';
const c=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/public')+'/content.json'));
const original=fs.readFileSync('game/saves/campaign.json'),hash=createHash('sha256').update(original).digest('hex');
const cases=[['Fresh 1936 Japan campaign',newGame(c,'JPN',193627),90],['Fresh 1922 Soviet campaign',newGame(c,'SOV',891,'campaign_1922'),90]];
const results=[];
for(const [name,s,days]of cases){
  s.autoPause=false;s.paused=false;const before=campaignMinutes(s),ticks=s.minuteTicks||0,start=performance.now();
  for(let elapsed=0;elapsed<days;elapsed+=30){advanceDays(s,c,30);validateSave(s,c);console.log(name+' validated day '+(elapsed+30));}
  if(campaignMinutes(s)-before!==days*1440||(s.minuteTicks||0)-ticks!==days*1440)throw new Error('Minute accounting failed.');
  results.push({name,days,minuteTicks:days*1440,cpuSeconds:+((performance.now()-start)/1000).toFixed(2),date:new Date(s.day*86400000).toISOString().slice(0,10),ships:fleetSummary(s,contentFor(c,s)).total,reports:s.reports.length,drafts:Object.values(s.nations).reduce((v,n)=>v+n.customDesigns.length,0),recoveryReturns:Object.values(s.nations).reduce((v,n)=>v+n.casualties.sailors.recovered+n.casualties.aviators.recovered+n.casualties.aircraft.recovered,0)});
}
const after=createHash('sha256').update(fs.readFileSync('game/saves/campaign.json')).digest('hex');
fs.writeFileSync('game/integration-result.json',JSON.stringify({generatedAt:new Date().toISOString(),originalSaveUnchanged:after===hash,saveWrittenByTest:false,results},null,2));
console.log(JSON.stringify(results));
