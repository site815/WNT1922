// Deterministic endurance playtests; each scenario runs every operational minute.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as sim from '../game/src/engine.mjs';
import {contentFor} from '../game/src/campaign-content.mjs';
import {campaignMinutes} from '../game/src/campaign-clock.mjs';
import {validateSave} from '../game/src/state-io.mjs';
import {aircraftModels,aircraftSeats} from '../game/src/naval-resources.mjs';
import {merchantEconomy} from '../game/src/merchant-economy.mjs';
const bundle=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/staging')+'/content.json'));
const cases=process.argv[2]?[process.argv[2]]:Object.keys(bundle.campaigns),results=[];
const years=Number(process.env.WNT_LONG_YEARS||6);
for(const campaign of cases){
 const s=sim.newGame(bundle,campaign==='campaign_1922'?'SOV':'USA',77189,campaign);s.autoPause=false;s.paused=false;
 const start=campaignMinutes(s),began=performance.now();let peakFleets=0,peakContacts=0,maxSaveBytes=0,days=0;
 try{for(;days<365*years;){const amount=Math.min(30,365*years-days);sim.advanceDays(s,bundle,amount);days+=amount;const c=contentFor(bundle,s);
   validateSave(s,bundle);assert.equal(campaignMinutes(s)-start,days*1440);assert.equal(s.minuteTicks,days*1440);
   for(const [id,n]of Object.entries(s.nations)){
    peakFleets=Math.max(peakFleets,n.fleets.length);peakContacts=Math.max(peakContacts,n.contacts.length);
    const models=aircraftModels(c,id),seats=Object.fromEntries(models.map(a=>[a.id,aircraftSeats(a)]));let crewed=0;
    for(const g of n.groups){const cl=c.classes[g.classId];assert.ok(g.airWing.reduce((v,w)=>v+w.count,0)<=(cl.air+cl.scoutAircraft)*g.count,id+' '+g.name+' aircraft exceed hangar');for(const w of g.airWing)crewed+=w.crewed*seats[w.model];}
    for(const w of n.shoreWing||[])crewed+=w.crewed*seats[w.model];assert.ok(crewed<=Math.floor(n.aviators),id+' allocated too many aviators');
    assert.ok(n.convoys.reduce((v,f)=>v+f.count,0)<=sim.merchantSummary(s,c,id).total,id+' convoy hulls exceed merchant register');
    const e=merchantEconomy(s,c,id);assert.ok(e.coverage>=0&&e.coverage<=1&&e.economyFactor>=e.domestic&&e.economyFactor<=1);assert.ok(Number.isFinite(sim.fleetPower(s,c,id).total));
   }
   // Play a conservative ministry: expand training, logistics and capacity when affordable.
   const n=s.nations[s.player];if(days%90===0){for(const key of ['school','pilots','training','logistics','industry','damage_control','intelligence']){if(!sim.projectBlock(s,key)&&!sim.affordability(n,sim.projectPrice(s,key))){sim.startProject(s,key);break;}}}
   fs.writeFileSync('game/test-output/endurance-checkpoint-'+campaign+'.json',JSON.stringify(s));
   if(days%30===0||days===365*years){const bytes=Buffer.byteLength(JSON.stringify(s));maxSaveBytes=Math.max(maxSaveBytes,bytes);console.log(JSON.stringify({campaign,days,date:new Date(s.day*86400000).toISOString().slice(0,10),seconds:Math.round((performance.now()-began)/1000),reports:s.reports.length,peakFleets,peakContacts,bytes}));}
  }
  const result={campaign,days,minuteTicks:s.minuteTicks,seconds:+((performance.now()-began)/1000).toFixed(2),peakFleets,peakContacts,maxSaveBytes,reviews:s.reviews.length,passed:true};results.push(result);
 }catch(error){fs.writeFileSync('game/long-failure-'+campaign+'.json',JSON.stringify(s));results.push({campaign,days,passed:false,error:error.stack});process.exitCode=1;console.error(error);}
 fs.writeFileSync('game/long-result-'+campaign+'.json',JSON.stringify({generatedAt:new Date().toISOString(),results},null,2));
}
