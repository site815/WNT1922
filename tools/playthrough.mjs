// Deterministic all-nation campaign exercise. Writes resumable local checkpoints.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame, advanceDays, monthlyIncome } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { validateSave } from '../mechanics/state-io.mjs';
import { merchantEconomy } from '../mechanics/merchant-economy.mjs';
const campaign=process.argv[2] || 'in_good_faith_1936', resume=process.argv.includes('--resume');
if(!CATALOG.campaigns[campaign]) throw Error('Unknown campaign');
await fs.mkdir('test-output/playthrough',{recursive:true});
const file='test-output/playthrough/'+campaign, last=file+'-checkpoint.json';
let s=resume ? JSON.parse(await fs.readFile(last,'utf8')) : newGame(CATALOG,'USA',270027,campaign);
for(const id of Object.keys(s.controllers))s.controllers[id]='ai';
s.autoPause=false; s.paused=false;
const target=Date.UTC(1951,0,1)/86400000, start=performance.now(), opening=s.day;
const results=resume ? JSON.parse(await fs.readFile(file+'-results.json','utf8')) : [];
async function writeCheckpoint(file,value) {
  await fs.writeFile(file+'.tmp',JSON.stringify(value));
  await fs.rename(file+'.tmp',file);
}
function inspect() {
  const c=contentFor(CATALOG,s);
  validateSave(s,CATALOG);
  for(const [id,n] of Object.entries(s.nations)) {
    for(const k of ['gold','industry','influence','strategic','crew','aviators','gdp','gtp'])
      assert(Number.isFinite(n[k]) && n[k]>=0, `${id}: invalid ${k}: ${n[k]}`);
    const fleets=new Set(n.fleets.map(f=>f.id));
    assert.equal(fleets.size,n.fleets.length,id+': duplicate fleet');
    for(const g of n.groups) {
      assert(c.classes[g.classId],id+': missing class '+g.classId);
      if(g.count && g.fleetId) assert(fleets.has(g.fleetId),id+': dangling fleet '+g.fleetId+' on '+g.id);
    }
    assert(n.convoys.reduce((a,b)=>a+b.count,0)<=n.merchant.hulls,id+': more merchants afloat than owned');
  }
  return Object.fromEntries(Object.entries(s.nations).map(([id,n])=>[id,{
    gold:Math.round(n.gold),industry:Math.round(n.industry),strategic:Math.round(n.strategic),
    training:n.training,morale:n.morale,gdp:Math.round(n.gdp),gtp:Math.round(n.gtp),
    hulls:n.groups.reduce((v,g)=>v+g.count,0),fleets:n.fleets.length,merchants:n.merchant.hulls,
    logistics:merchantEconomy(s,c,id).logistics,netGold:monthlyIncome(s,c,id).netGold,
    designs:n.customDesigns?.length || 0,aircraftDesigns:n.customAircraft?.length || 0
  }]));
}
try {
 while(s.day<target) {
  const d=new Date(s.day*86400000), boundary=Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1)/86400000;
  advanceDays(s,CATALOG,Math.min(target,boundary)-s.day);
  const stats=inspect(), date=new Date(s.day*86400000).toISOString().slice(0,10);
  const row={date,ticks:s.minuteTicks,stats}; results.push(row);
  await writeCheckpoint(last,s);
  await writeCheckpoint(file+'-results.json',results);
  console.log(JSON.stringify({campaign,date,seconds:Math.round((performance.now()-start)/1000),battles:s.battles?.length,score:s.reviews?.length}));
 }
 const result={passed:true,campaign,from:CATALOG.campaigns[campaign].scenario.start,through:'1951-01-01',validatedMonths:results.length,latestSegmentFrom:new Date(opening*86400000).toISOString().slice(0,10),latestSegmentSeconds:(performance.now()-start)/1000,minuteTicks:s.minuteTicks};
 await fs.writeFile(file+'-complete.json',JSON.stringify(result,null,2)); console.log(JSON.stringify(result));
} catch(error) {
 await fs.writeFile(file+'-failed-state.json',JSON.stringify(s));
 console.error(error.stack);process.exitCode=1;
}
