// Real Unreal render-target/CEF alignment checks. No browser viewport emulation.
// Launch an isolated -WNTAutomation -RenderOffscreen -ForceRes game first.
// node tools/verify-unreal-resolutions.mjs --debug-port=9333 --capture-dir=<Saved/Screenshots>
// Use --allow-existing-test-save only for an explicitly disposable test profile.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {contentFor} from '../mechanics/campaign-content.mjs';
import {validateSave} from '../mechanics/state-io.mjs';
import {buildUnrealScenePacket} from '../ui/unreal-scene-packet.mjs';
import {nativeCameraFields,verifyStrategicMiddleNoop,verifyCloseWorldOrbit} from './native-camera-gesture-checks.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),option=name=>args.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
const port=Number(option('--debug-port'));assert(Number.isInteger(port)&&port>0&&port<=65535,'An explicit local debug port is required.');
const endpoint='http://127.0.0.1:'+port;
const output=path.resolve(option('--output')||path.join(root,'test-output/unreal-resolutions'));
const captureDir=path.resolve(option('--capture-dir')||path.join(root,'unreal/Saved/Screenshots'));
const resolutions=(option('--sizes')||'1800x1000,1920x1080,2560x1440,3840x2160,2560x1080,3440x1440,5120x2160').split(',').map(value=>{
 assert(/^\d+x\d+$/.test(value));const [width,height]=value.split('x').map(Number);
 assert(width>=1800&&width<=5120&&height>=1000&&height<=2160,'Supported test range is 1800x1000 through 5120x2160.');return{width,height};
});
const require=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'));
let playwright;try{playwright=createRequire(import.meta.url)('playwright');}catch{playwright=require('playwright');}
let sharp;try{sharp=require('sharp');}catch{}
const result={format:1,passed:false,endpoint,startedAt:new Date().toISOString(),resolutions,checks:[],metrics:[],captures:[],errors:[],externalRequests:[],limitations:[
 'Native resize requests and PNG dimensions verify the actual Unreal target. No CDP device-metrics override is used.',
 'Unreal offscreen FNullWindow hardcodes fullscreen; window policy is checked through configured mode here. Physical Windows frame/maximize behavior is tested separately.',
 'Temporal image differences are review evidence, not an automatic flicker verdict; ocean animation and temporal lighting can change pixels.',
 'Draw counters, when supplied by native diagnostics, are samples rather than GPU profiling or performance certification.',
]};
let browser,page,phase='connect',logOffset=0;
await fs.mkdir(output,{recursive:true});
const logPath=option('--runtime-log');if(logPath)logOffset=(await fs.stat(logPath)).size;
async function until(read,accept,label,timeout=25000){const deadline=Date.now()+timeout;let last;do{last=await read();if(accept(last))return last;await delay(100);}while(Date.now()<deadline);throw Error('Timed out: '+label+'; last='+JSON.stringify(last).slice(0,1000));}
function instrument(){
 const evidence=globalThis.__wntResolutionEvidence={events:[],sequence:0,errors:[]};
 const hook=()=>{const receiver=globalThis.WNTUnreal;if(!receiver||receiver.receive.__resObserved)return;
  const old=receiver.receive;receiver.receive=function(event){evidence.events.push({sequence:++evidence.sequence,event:structuredClone(event)});if(evidence.events.length>500)evidence.events.shift();if(event.type==='error')evidence.errors.push(event);return Reflect.apply(old,this,[event]);};receiver.receive.__resObserved=true;};
 hook();setInterval(hook,25);
}
const cursor=()=>page.evaluate(()=>__wntResolutionEvidence.sequence);
const events=after=>page.evaluate(after=>__wntResolutionEvidence.events.filter(e=>e.sequence>after),after);
async function input(action,values={}){await page.evaluate(({action,values})=>{
 const last=[...__wntResolutionEvidence.events].reverse().find(e=>e.event.instanceId);
 return ue.wnt.sceneinput(JSON.stringify({instanceId:last?.event.instanceId||'',action,...values}));
},{action,values});}
async function diagnostics(mode){const before=await cursor();await input('diagnostics');const rows=await until(()=>events(before),r=>r.some(e=>e.event.type==='diagnostics'),'native diagnostics');const d=rows.find(e=>e.event.type==='diagnostics').event;
 assert.equal(d.renderer,'Unreal Engine native UWorld');assert.equal(d.nativeWorldInitialized,true);assert.equal(d.modelLoadErrors,0);if(mode)assert.equal(d.mode,mode);return d;}
const counts=d=>Object.fromEntries(['primitiveComponentCount','visiblePrimitiveCount','shadowCastingPrimitiveCount','terrainTileCount','shipActorCount','visibleShipCount','detailedModelCount','pendingModelCount','drawCalls','meshDrawCalls','trianglesDrawn','frameMeanMs','frameP95Ms','frameSampleCount'].filter(k=>Number.isFinite(d[k])).map(k=>[k,d[k]]));
async function resize(size,mode){
 await input('resize',size);
 const d=await until(()=>diagnostics(),d=>d.viewportWidth===size.width&&d.viewportHeight===size.height,'actual Unreal resize '+size.width+'x'+size.height,45000);
 assert.equal(d.mode,mode);assert.equal(d.configuredWindowMode,2,'Configured mode remains windowed');if(!d.renderingOffscreen)assert.equal(d.windowMode,2,'Physical window remains decorated windowed mode');await delay(350);
 const css=await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}));
 assert(css.width>0&&css.height>0);assert(css.scrollWidth<=css.width+2,'The root page must not overflow horizontally after a native resize');
 result.metrics.push({kind:'real-native-resize',mode,...size,css,native:counts(d)});return d;
}
async function capture(name,size,includeUI=false){
 const source=path.join(captureDir,name+'.png'),old=await fs.stat(source).catch(()=>null);
 await input('capture',{name,includeUI});
 await until(()=>fs.stat(source).catch(()=>null),s=>s&&s.size>1000&&(!old||s.mtimeMs>old.mtimeMs),'native PNG '+name,45000);
 const png=await until(()=>fs.readFile(source),b=>b.subarray(-8,-4).toString()==='IEND','complete PNG '+name);
 const width=png.readUInt32BE(16),height=png.readUInt32BE(20);assert.equal(width,size.width,'Native capture width');assert.equal(height,size.height,'Native capture height');
 const file=path.join(output,name+'.png');await fs.writeFile(file,png);result.captures.push({name,file,width,height,includeUI,kind:'native-Unreal-GPU'});return png;
}
async function temporalSample(name,size){
 const first=await capture(name+'-a',size);await delay(600);const second=await capture(name+'-b',size);
 if(sharp){const a=await sharp(first).resize(320,180,{fit:'fill'}).removeAlpha().raw().toBuffer(),b=await sharp(second).resize(320,180,{fit:'fill'}).removeAlpha().raw().toBuffer();
  const diffs=Array.from(a,(v,i)=>Math.abs(v-b[i])).sort((a,b)=>a-b);result.metrics.push({kind:'temporal-image-difference',name,meanChannelDifference:diffs.reduce((a,b)=>a+b,0)/diffs.length,p95ChannelDifference:diffs[Math.floor(diffs.length*.95)],fractionChannelsChangingByMoreThan16:diffs.filter(d=>d>16).length/diffs.length});}
}
async function pick(kind,hover=false){
 const candidates=await until(async()=>{const d=await diagnostics();return page.evaluate(({targets,kind})=>targets.filter(t=>t.visible&&t.kind===kind).map(t=>({...t,x:t.screenX*innerWidth,y:t.screenY*innerHeight})).filter(t=>document.elementFromPoint(t.x,t.y)?.matches('canvas.unreal-input')),{targets:d.targets,kind});},r=>r.length,'visible native target '+kind);
 const target=candidates[0],before=await cursor(),type=hover?'hover':'select';await page.mouse.move(1,1);await page.mouse.move(target.x,target.y);if(!hover)await page.mouse.click(target.x,target.y);
 const rows=await until(()=>events(before),r=>r.some(e=>e.event.type===type&&e.event.selection?.kind===kind),'native pointer '+kind+' '+type);
 const selected=rows.find(e=>e.event.type===type&&e.event.selection?.kind===kind).event.selection;
 for(const key of ['id','hullIndex','side'])if(target[key]!=null)assert.equal(selected[key],target[key],'Projected actor identity '+key);
 result.metrics.push({kind:'native-'+type,target:selected,screen:[target.x,target.y]});return selected;
}
async function save(){
 await page.evaluate(async()=>{if(await saveForDesktopClose()!==true)throw Error('Save failed');});
 const state=await page.evaluate(async()=>{const r=await fetch('/api/save');if(!r.ok)throw Error('Save read failed');return r.json();});validateSave(state,CATALOG);assert.equal(state.paused,true);return state;
}
async function worldReady(){await page.locator('.native-world-input').waitFor();return until(()=>diagnostics(),d=>d.mode==='world'&&d.shipActorCount>0,'world ready',60000);}
async function clearPoint(){return page.evaluate(()=>{const sidebar=document.querySelector('.sidebar').getBoundingClientRect(),panel=document.querySelector('.command-side-panel').getBoundingClientRect(),work=document.querySelector('.command-workspace').getBoundingClientRect();const p={x:(sidebar.right+panel.left)/2,y:(work.top+innerHeight-70)/2};if(!document.elementFromPoint(p.x,p.y)?.matches('.native-world-input'))throw Error('Map input point is covered');return p;});}
async function ministryMenus(size){
 const before=await diagnostics('world'),camera=nativeCameraFields;
 await page.evaluate(()=>{globalThis.__resolutionMap=document.querySelector('.native-world-input');globalThis.__resolutionOutliner=document.querySelector('.command-side-panel');});
 const outliner=await page.locator('.command-side-panel').boundingBox();
 for(const menu of ['land','airwar','yards','aircraft','fleet','programs','diplomacy','economy','reports','review']){
  await page.locator('.nav-item[data-view="'+menu+'"]').click();await page.locator('.menu-popup.view-'+menu).waitFor();
  const layout=await page.evaluate(()=>{
   const popup=document.querySelector('.menu-popup'),body=popup.querySelector('.workspace-inner'),panel=document.querySelector('.command-side-panel');
   const r=popup.getBoundingClientRect(),p=panel.getBoundingClientRect(),close=popup.querySelector('.workspace-close').getBoundingClientRect();
   return{popup:r.toJSON(),panel:p.toJSON(),close:close.toJSON(),layerLeft:popup.parentElement.getBoundingClientRect().left,sidebarRight:document.querySelector('.sidebar').getBoundingClientRect().right,width:innerWidth,height:innerHeight,sameMap:__resolutionMap===document.querySelector('.native-world-input'),sameOutliner:__resolutionOutliner===panel,panelReachable:!!document.elementFromPoint(p.left+10,p.top+10)?.closest('.command-side-panel'),contentFits:body.scrollWidth<=body.clientWidth+1};
  });
  assert(layout.sameMap&&layout.sameOutliner,'Menus retain their native map canvas and naval outliner');
  assert(layout.panelReachable&&layout.popup.right<layout.panel.left,'Ministry panel leaves naval commands available');
  assert(Math.abs(layout.popup.left-layout.layerLeft)<2&&layout.popup.left>=layout.sidebarRight,'Ministry popup is left-aligned beside the sidebar at every aspect ratio');
  assert(layout.close.top>=layout.popup.top&&layout.close.bottom<=layout.popup.bottom,'Menu close remains visible');
  assert(layout.contentFits,'Popup content fits; wide tables use their local scroll area');
  assert.deepEqual(await page.locator('.command-side-panel').boundingBox(),outliner);
  assert.deepEqual(camera(await diagnostics('world')),camera(before),'Ministry menu preserves native camera');
  result.metrics.push({kind:'persistent-ministry-popup',menu,...size,layout});
  if(menu==='yards')await capture('menu-catalog-'+size.width+'x'+size.height,size,true);
 }
 await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-popup').count(),0);
}
async function gestureCycle(){
 const surface=page.locator('.native-world-input');await surface.focus();await page.keyboard.press('Home');await until(()=>diagnostics(),d=>d.zoom===1,'Home');
 const p=await clearPoint(),before=await cursor();await page.mouse.move(p.x,p.y);await page.mouse.wheel(0,-450);await until(()=>diagnostics(),d=>d.zoom>1&&Math.abs(d.zoom-d.targetZoom)<.00001,'smooth wheel zoom reaches its target');
 const zoomFrames=(await events(before)).filter(e=>e.event.type==='camera').map(e=>e.event.zoom);
 assert(zoomFrames.some(z=>z>1&&z<Math.exp(.675)-.001),'Wheel zoom renders intermediate camera positions');
 await verifyStrategicMiddleNoop({page,diagnostics,clearPoint,metrics:result.metrics});
 await page.mouse.move(p.x,p.y);
 await page.mouse.down({button:'right'});await page.mouse.move(p.x+205,p.y+85,{steps:6});await page.mouse.up({button:'right'});
 assert(Math.abs((await diagnostics()).tilt)<.001,'Strategic right-drag remains overhead');
 await surface.focus();await page.keyboard.press('Home');await until(()=>diagnostics(),d=>d.zoom===1,'Home after pan');await delay(150);return diagnostics('world');
}
try{
 browser=await playwright.chromium.connectOverCDP(endpoint,{timeout:30000});
 page=await until(()=>Promise.resolve(browser.contexts().flatMap(c=>c.pages()).find(p=>{try{const u=new URL(p.url());return u.hostname==='127.0.0.1'&&u.searchParams.get('unreal')==='1';}catch{return false;}})),Boolean,'native game page');
 page.setDefaultTimeout(25000);await page.locator('.start-screen, .native-world-input').first().waitFor();
 const origin=new URL(page.url()).origin;page.on('pageerror',e=>result.errors.push({phase,message:e.message}));page.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==origin)result.externalRequests.push(r.url());});
 const existing=await page.evaluate(async()=>(await fetch('/api/save')).status);
 assert(existing===404||args.includes('--allow-existing-test-save'),'Use a fresh isolated profile or explicitly allow an existing disposable test save.');
 if(await page.locator('.native-world-input').count())await save();
 await page.addInitScript(instrument);await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>globalThis.ue?.wnt?.sceneinput&&globalThis.__wntResolutionEvidence);
 await page.locator('.start-demo[data-demo-ready="true"]').waitFor();
 if(await page.locator('.start-demo').getAttribute('data-demo-playing')==='true')await page.locator('.start-demo [data-demo-action="toggle"]').click();
 result.metrics.push({kind:'CEF',url:page.url(),version:browser.version()});
 phase='minimum native window size';
 await input('resize',{width:1280,height:720});
 const minimum=await until(()=>diagnostics(),d=>d.viewportWidth===1800&&d.viewportHeight===1000,'undersized request clamped to actual native minimum');
 assert.equal(minimum.configuredWindowMode,2);if(!minimum.renderingOffscreen)assert.equal(minimum.windowMode,2);result.metrics.push({kind:'minimum-window-clamp',width:minimum.viewportWidth,height:minimum.viewportHeight,windowMode:minimum.windowMode,configuredWindowMode:minimum.configuredWindowMode,renderingOffscreen:minimum.renderingOffscreen});
 result.checks.push('A native 1280x720 resize request is clamped to a true 1800x1000 windowed render target.');
 phase='title battle resolutions';
 for(const size of resolutions){await resize(size,'battle');await page.locator('.start-screen').evaluate(n=>n.scrollTop=0);await pick('battle-ship');await capture('title-'+size.width+'x'+size.height,size,true);}
 result.checks.push('Title battle geometry is clickable with exact identities at every actual native resolution; full GPU/UI captures match requested dimensions.');
 phase='campaign resolutions';
 if(existing===200){await page.locator('[data-action="continue"]').click();}
 else{await page.locator('[data-action="select-campaign"][data-id="in_good_faith_1936"]').click();await page.locator('[data-action="select-nation"][data-id="USA"]').click();await page.locator('[data-action="new"]').click();if(await page.locator('[data-action="begin"]').count())await page.locator('[data-action="begin"]').click();}
 await worldReady();await delay(400);
 for(let i=0;i<12&&await page.locator('.diplomatic-dispatch').count();i++){await page.locator('.diplomatic-dispatch [data-action="defer-decision"],.diplomatic-dispatch [data-action="choose"]:not(:disabled)').first().click();await delay(150);}
 const initial=await save(),packet=buildUnrealScenePacket(initial,contentFor(CATALOG,initial));
 const force=packet.forces.find(f=>!f.merchant&&f.position&&f.hulls.length);assert(force,'An own fleet is needed for pointer alignment checks');
 for(const size of resolutions){
  await resize(size,'world');await ministryMenus(size);const samples=[];for(let cycle=0;cycle<3;cycle++)samples.push(counts(await gestureCycle()));
  for(const key of ['primitiveComponentCount','terrainTileCount','shipActorCount']){assert(Number.isFinite(samples[2][key]),'Native diagnostics must expose '+key);assert.equal(samples[2][key],samples[1][key],key+' remains stable after repeated pan/zoom/return');}
  result.metrics.push({kind:'component-count-stability',...size,samples});
  await temporalSample('world-'+size.width+'x'+size.height,size);
  await input('focus',{kind:'fleet',id:force.id,longitude:force.position[0],latitude:force.position[1],zoom:12000});await until(()=>diagnostics(),d=>Math.abs(d.zoom-12000)<.01,'fleet focus');await delay(250);
  await pick('ship',true);const selected=await pick('ship');await page.locator('[data-dialog-type="ship"]').waitFor();assert.equal(await page.locator('[data-dialog-type="ship"]').getAttribute('data-key'),'dialog-ship-'+selected.id);
  await page.locator('.modal [data-action="close"]').first().click();await worldReady();await capture('fleet-'+size.width+'x'+size.height,size,true);
  assert.equal((await diagnostics()).tilt,0,'Fleet-scale view remains overhead');
  await input('focus',{kind:'fleet',id:force.id,longitude:force.position[0],latitude:force.position[1],zoom:40000});
  const inspection=await until(()=>diagnostics(),d=>d.tilt>5&&d.tilt<=d.maxWorldTilt+.001,'automatic close ship inspection tilt');
  await verifyCloseWorldOrbit({page,diagnostics,clearPoint,waitFor:(label,predicate)=>until(()=>diagnostics('world'),predicate,label),metrics:result.metrics});
  await input('zoom',{delta:-100000});await until(()=>diagnostics(),d=>d.zoom===d.maxWorldZoom,'zoom clamps at useful ship scale');
  assert.equal((await diagnostics()).zoom,65536);
  await capture('fleet-tilted-'+size.width+'x'+size.height,size,true);
 }
 result.checks.push('World camera input, exact hull hover/click, component-count stability and true GPU output dimensions pass at all seven requested display sizes.');
 for(const a of result.metrics.filter(row=>row.kind==='persistent-ministry-popup'&&row.menu==='yards'))for(const b of result.metrics.filter(row=>row.kind==='persistent-ministry-popup'&&row.menu==='yards'&&row.width>a.width&&row.height===a.height))assert(Math.abs(a.layout.popup.width-b.layout.popup.width)<2,'At the same height, ultrawide retains the 16:9 menu width');
 result.checks.push('All ten ministry menus stay left-aligned beside the sidebar and retain the native map and naval outliner at every size; wider screens preserve their 16:9-derived popup width and expose the world beside it.');
 result.checks.push('Every tested size rejects strategic middle dragging, permits close middle orbit without moving geographic focus, preserves requested orientation during right pan, and resets yaw/tilt after wheel zooming out and back.');
 phase='continuous map wrapping';
 const widest=resolutions.reduce((a,b)=>b.width/b.height>a.width/a.height?b:a);await resize(widest,'world');
 for(const direction of [-1,1]){
  await input('home');let previous=(await diagnostics()).longitude,total=0;
  const samples=[];
  for(let i=0;i<16;i++){
   const p=await clearPoint();await page.mouse.move(p.x,p.y);await page.mouse.down({button:'right'});await page.mouse.move(p.x+direction*widest.width*.2,p.y,{steps:8});await page.mouse.up({button:'right'});
   const d=await diagnostics('world'),delta=((d.longitude-previous+540)%360)-180;total+=delta;previous=d.longitude;samples.push({longitude:d.longitude,latitude:d.latitude,...counts(d)});
   assert(Math.abs(d.tilt)<.001,'World wrapping never tilts the strategic camera');
  }
  assert(Math.abs(total)>720,'Repeated drag crosses at least two complete world revolutions');
  assert.equal(samples.at(-1).primitiveComponentCount,samples[0].primitiveComponentCount,'Repeated wrapping creates no additional mesh components');
  const name=direction<0?'wrap-east':'wrap-west';await capture(name,widest,true);
  await delay(350);await capture(name+'-settled',widest,true);
  result.metrics.push({kind:'continuous-wrapping',direction,degrees:total,samples});
 }
 result.checks.push('Both pan directions cross more than two full world revolutions at the widest tested aspect ratio, with stable component counts and overhead orientation.');
 // The news ticker automatically acknowledges displayed log/alert entries. This is
 // presentation metadata; keep every log's actual content and all simulation
 // fields in the comparison, excluding only that acknowledgement flag.
 const final=await save();const stable=({savedAt,recoveredSave,log,alerts,...state})=>({...state,log:log.map(({dismissed,...entry})=>entry),alerts:alerts.map(({dismissed,...entry})=>entry)});assert.deepEqual(stable(final),stable(initial),'Resolution and camera checks preserve simulation state (news read flags excluded)');
 await fs.writeFile(path.join(output,'verified-campaign.json'),JSON.stringify(final));
 const bridgeErrors=await page.evaluate(()=>__wntResolutionEvidence.errors);assert.deepEqual(bridgeErrors,[]);assert.deepEqual(result.errors,[]);assert.deepEqual(result.externalRequests,[]);
 if(logPath){const bytes=await fs.readFile(logPath);const text=bytes.subarray(logOffset).toString();result.nativeWarnings=text.split(/\r?\n/).filter(line=>/Warning:|Error:/.test(line));const fatal=result.nativeWarnings.filter(line=>/Non-Nanite Marking Job Queue overflow|\[VSM\].*overflow|LogRenderer: Error|LogRHI: Error|LogD3D12RHI: Error|LogGLTFRuntime: Error|Failed to compile Material|LogTemp: Error: WNT Unreal:/i.test(line));assert.deepEqual(fatal,[],'No rendering, VSM-capacity, mesh-load or material errors during resolution exercise');}
 result.checks.push('Paused campaign state is preserved and no native bridge/external request errors occur.');
 if(logPath)result.checks.push('Supplied native log is checked for VSM/renderer failures.');
 else result.limitations.push('No development renderer log supplied. Shipping native diagnostics/captures are checked, but they do not capture every engine warning.');
 result.passed=true;
}catch(error){result.failure={phase,message:error.message,stack:error.stack};if(page){await page.screenshot({path:path.join(output,'failure-cef-html-only.png')}).catch(()=>{});result.lastEvents=await page.evaluate(()=>globalThis.__wntResolutionEvidence?.events).catch(()=>[]);}}
finally{result.finishedAt=new Date().toISOString();result.gameLeftRunning=true;await fs.writeFile(path.join(output,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({passed:result.passed,result:path.join(output,'result.json'),checks:result.checks,failure:result.failure,gameLeftRunning:true},null,2));process.exit(result.passed?0:1);}
