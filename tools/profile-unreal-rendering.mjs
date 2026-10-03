// Reproducible input workload on an explicitly owned, paused native test profile.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {setTimeout as delay} from 'node:timers/promises';
const arg=n=>process.argv.find(v=>v.startsWith(n+'='))?.slice(n.length+1);
const uninterrupted=process.argv.includes('--uninterrupted');
assert(process.argv.includes('--confirm-isolated-session'));
const port=Number(arg('--debug-port'));assert(port>0&&port<65536);
const output=path.resolve(arg('--output'));await fs.mkdir(output,{recursive:true});
const require=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'));
const {chromium}=require('playwright');
const result={passed:false,endpoint:'http://127.0.0.1:'+port,startedAt:new Date().toISOString(),metrics:[],checks:[],samples:[],limitations:['Controlled native rolling-frame diagnostics, not a GPU profiler. Each sample summarizes overlapping recent native frames. No captures are made during measured workloads.']};
result.uninterrupted=uninterrupted;
if(uninterrupted)result.limitations.push('No diagnostic calls during each12-second workload. One final native frame window samples the last240frames before the diagnostic response; it does not summarize every frame in the workload. Inputs use150ms pacing after each acknowledged browser event.');
let page;
async function until(fn,predicate,label){for(let i=0;i<200;i++){const v=await fn();if(predicate(v))return v;await delay(100);}throw Error('Timed out '+label);}
async function input(action,values={}){return page.evaluate(({action,values})=>ue.wnt.sceneinput(JSON.stringify({instanceId:__renderProfile.last?.instanceId||'',action,...values})),{action,values});}
async function diag(){const seq=await page.evaluate(()=>__renderProfile.seq);await input('diagnostics');return until(()=>page.evaluate(()=>__renderProfile),v=>v.seq>seq,'diagnostics').then(v=>v.last);}
async function save(){await page.evaluate(async()=>{if(!await saveForDesktopClose())throw Error('Save failed');});return page.evaluate(async()=>{const r=await fetch('/api/save');return r.json();});}
try{
const browser=await chromium.connectOverCDP(result.endpoint);page=await until(()=>Promise.resolve(browser.contexts().flatMap(c=>c.pages()).find(p=>p.url().includes('?unreal=1'))),Boolean,'game');
await page.locator('.start-screen, .native-world-input').first().waitFor();
if(await page.locator('.start-screen').count())await page.locator('[data-action="continue"]').click();
await page.locator('.native-world-input').waitFor();
await page.evaluate(()=>{const p=globalThis.__renderProfile={seq:0,last:null,longTasks:[],old:WNTUnreal.receive};WNTUnreal.receive=function(e){if(e.type==='diagnostics'){p.last=e;p.seq++;}return p.old.apply(this,arguments);};p.observer=new PerformanceObserver(list=>{for(const e of list.getEntries())p.longTasks.push({start:e.startTime,duration:e.duration});});p.observer.observe({entryTypes:['longtask']});});
const before=await save();assert(before.paused);
result.metrics.push({kind:'CEF',url:page.url(),viewport:await page.evaluate(()=>({width:innerWidth,height:innerHeight}))});
const fields=['frameMeanMs','frameP95Ms','frameMaxMs','frameHitchCount','diagnosticBuildMilliseconds','diagnosticTargetMilliseconds','lastSurfacePickMilliseconds','maximumSurfacePickMilliseconds','lastSurfaceHeightQueries','primitiveComponentCount','visiblePrimitiveCount','terrainTileCount','shipActorCount','detailedModelCount','modelLoadErrors','zoom','longitude','latitude','chart'];
for(const workload of ['idle-world','zoom-world','pan-world','zoom-coast']){
await input('home');await delay(4500);
if(workload==='zoom-coast'){await input('focus',{longitude:135,latitude:35,zoom:128});await delay(4500);}
const point=await page.locator('.native-world-input').boundingBox();const cx=point.x+point.width*.6,cy=point.y+point.height*.5;
await page.mouse.move(cx,cy);let pressed=false;
if(workload==='pan-world'){await page.mouse.down({button:'right'});pressed=true;}
const started=performance.now();let n=0;const startCEF=await page.evaluate(()=>performance.now());
while(performance.now()-started<12000){
if(workload.startsWith('zoom'))await page.mouse.wheel(0,(n%24<12?-1:1)*45);
if(pressed)await page.mouse.move(cx+Math.sin(n*.14)*point.width*.24,cy+Math.sin(n*.11)*point.height*.09);
if(!uninterrupted){const d=await diag();result.samples.push({workload,elapsed:performance.now()-started,...Object.fromEntries(fields.filter(k=>d[k]!==undefined).map(k=>[k,d[k]]))});}
n++;await delay(uninterrupted?150:75);
}
if(pressed)await page.mouse.up({button:'right'});
if(uninterrupted){const d=await diag();result.samples.push({workload,elapsed:performance.now()-started,...Object.fromEntries(fields.filter(k=>d[k]!==undefined).map(k=>[k,d[k]]))});}
const longTasks=await page.evaluate(start=>__renderProfile.longTasks.filter(v=>v.start>=start),startCEF);result.metrics.push({kind:'workload',workload,iterations:n,durationMs:performance.now()-started,longTasks});
}
await input('home');await delay(500);const after=await save();
const stable=({savedAt,recoveredSave,log,alerts,...v})=>({...v,log:log.map(({dismissed,...x})=>x),alerts:alerts.map(({dismissed,...x})=>x)});assert.deepEqual(stable(after),stable(before));
await fs.writeFile(path.join(output,'verified-campaign.json'),JSON.stringify(after));
result.checks.push('Four identical paused map input workloads preserve all simulation data; only normal news read flags are excluded.');result.passed=true;
}catch(e){result.failure={message:e.message,stack:e.stack};}
finally{if(page)await page.evaluate(()=>{if(__renderProfile){WNTUnreal.receive=__renderProfile.old;__renderProfile.observer.disconnect();}}).catch(()=>{});result.finishedAt=new Date().toISOString();result.gameLeftRunning=true;await fs.writeFile(path.join(output,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({passed:result.passed,result:path.join(output,'result.json'),failure:result.failure}));process.exit(result.passed?0:1);}
