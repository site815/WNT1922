// Inspect an actual registered GLB in an opted-in local Unreal test instance.
// This sends presentation packets only: no campaign API writes, time advances,
// asset rewrites or model substitution. The campaign UI is restored afterward.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),option=name=>args.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
const port=Number(option('--debug-port')),id=option('--model');
assert(Number.isInteger(port)&&port>0&&port<65536,'Specify the opted-in local test --debug-port.');
assert(id,'Specify --model=<registered detailed model id>.');
const registry=JSON.parse(await fs.readFile(path.join(root,'assets/models/ships/index.json'),'utf8'));
const entry=registry.models.find(m=>m.id===id);
assert(entry?.file.endsWith('.glb'),'Art inspection requires an actual detailed GLB, never a temporary recognition mesh.');
const mapping=entry.platforms[0];assert(mapping,'This GLB must have an explicit presentation mapping.');
const metadata=JSON.parse(await fs.readFile(path.join(root,'assets/models/ships',entry.file.replace(/\.glb$/,'.source.json')),'utf8'));
const output=path.resolve(option('--output')||path.join(root,'test-output/model-review',id));
await fs.mkdir(output,{recursive:true});
let playwright;
try{playwright=createRequire(import.meta.url)('playwright');}
catch{playwright=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'))('playwright');}
const browser=await playwright.chromium.connectOverCDP('http://127.0.0.1:'+port);
const page=browser.contexts().flatMap(c=>c.pages()).find(p=>/^http:\/\/127\.0\.0\.1:\d+\//.test(p.url())&&new URL(p.url()).searchParams.get('unreal')==='1');
assert(page,'The requested port has no local Unreal game page.');
const instanceId='art-inspection-'+Date.now(),captures=[];
let success=false,failure;
async function send(method,packet){await page.evaluate(({method,packet})=>ue.wnt[method](JSON.stringify(packet)),{method,packet});}
const input=(action,values={})=>send('sceneinput',{instanceId,action,...values});
async function until(read,accept,label){const start=Date.now();let value;do{value=await read();if(accept(value))return value;await delay(100);}while(Date.now()-start<20000);throw Error('Timed out: '+label);}
async function event(action,values={}){
 await page.evaluate(()=>{__wntArtEvents.length=0;});await input(action,values);
 return until(()=>page.evaluate(()=>__wntArtEvents),events=>events.some(e=>e.type===action),'native '+action).then(events=>events.find(e=>e.type===action));
}
async function orient(tilt,yaw){
 const d=await event('diagnostics');
 await input('tilt',{dy:(tilt-d.tilt)*4,dx:(d.yaw-yaw)/.3,x:.5,y:.5,previousX:.5,previousY:.5});
 // Orbit is pointer anchored; recenter the exact selected vessel afterward.
 await input('focus',{id:'art-review',side:'A',hullIndex:0});
 await delay(800);
}
async function capture(view){
 const diagnostic=await event('diagnostics');
 const inspected=diagnostic.targets.find(t=>t.id==='art-review');
 assert.equal(inspected?.modelId,path.basename(entry.file,'.glb'),'Capture must show the requested detailed model.');
 const name='art-'+id+'-'+view,file=path.join(root,'unreal/Saved/Screenshots',name+'.png');
 const old=await fs.stat(file).catch(()=>null);await input('capture',{name});
 await until(()=>fs.stat(file).catch(()=>null),s=>s?.size>1000&&(!old||s.mtimeMs>old.mtimeMs),'native screenshot');
 const bytes=await until(()=>fs.readFile(file),b=>b.subarray(-8,-4).toString()==='IEND','finished native screenshot');
 const target=path.join(output,view+'.png');await fs.writeFile(target,bytes);
 captures.push({view,file:target,kind:'native-Unreal-GPU-no-UI',width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),camera:{yaw:diagnostic.yaw,tilt:diagnostic.tilt,zoom:diagnostic.zoom},modelId:inspected.modelId,headingDegrees:0});
}
try{
 await page.waitForFunction(()=>!!globalThis.WNTUnreal?.receive&&!!globalThis.ue?.wnt);
 if(await page.locator('.start-screen').count())await page.locator('.start-screen').waitFor();
 await page.evaluate(()=>{
  globalThis.__wntArtEvents=[];
  const receive=WNTUnreal.receive;
  WNTUnreal.receive=function(e){__wntArtEvents.push(e);return Reflect.apply(receive,this,[e]);};
 });
 // Verify the opt-in instrumentation before changing any presentation state.
 const initial=await event('diagnostics');assert.equal(initial.renderer,'Unreal Engine native UWorld');
 await send('viewport',{instanceId,mode:'battle',x:0,y:0,width:1,height:1});
 await send('battle',{format:1,campaign:mapping.campaign||'in_good_faith_1936',id:instanceId,at:0,index:0,animate:false,units:[{
  key:'A:art-review:0',id:'art-review',side:'A',hullIndex:0,classId:mapping.id,type:metadata.type,label:metadata.name,
  positionMetres:[0,0,0],headingDegrees:0,health:100,sunk:false,selected:false,
 }]});
 await delay(1000);await input('home');await delay(150);
 const length=Number(metadata.dimensions?.length||metadata.historicalDimensions?.lengthOverall);
 assert(length>0&&Number.isFinite(length),'Model metadata has no valid physical length.');
 const desiredZoom=1550/length;
 await input('zoom',{delta:-Math.log(desiredZoom)/.0015,x:.5,y:.5});
 await orient(10,-90);await capture('top');
 await orient(72,-90);await capture('broadside');
 await orient(65,-55);await capture('quarter');
 const diagnostic=await event('diagnostics');assert.equal(diagnostic.modelLoadErrors,0);
 const target=diagnostic.targets.find(t=>t.id==='art-review');assert(target,'Detailed hull has no ray-pickable surface.');
 await page.evaluate(()=>{__wntArtEvents.length=0;});
 await input('pick',{x:target.screenX,y:target.screenY});
 const picks=await until(()=>page.evaluate(()=>__wntArtEvents),e=>e.some(v=>v.type==='select'),'mesh ray pick');
 assert.equal(picks.find(e=>e.type==='select').selection.id,'art-review');
 success=true;
}catch(error){
 failure=error.stack||error.message;
 console.error(failure);
}finally{
 const bytes=await fs.readFile(path.join(root,'assets/models/ships',entry.file));
 await fs.writeFile(path.join(output,'result.json'),JSON.stringify({model:id,modelFile:entry.file,modelSha256:createHash('sha256').update(bytes).digest('hex'),capturedAt:new Date().toISOString(),nativeLoadAndPickingPassed:success,visualQualityApproved:false,failure,captures,limitations:['Art inspection presentation only; this is not a campaign battle.','A person must inspect these images; successful loading does not certify realism or historical accuracy.']},null,2));
 await page.reload({waitUntil:'domcontentloaded'}).catch(()=>{});
 console.log(JSON.stringify({model:id,nativeLoadAndPickingPassed:success,output,captures},null,2));
 // Disconnect the observer, leaving the user's game running.
 process.exit(success?0:1);
}
