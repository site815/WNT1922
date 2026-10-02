// Attach to an already running, explicitly opted-in Unreal test instance:
//   node tools/verify-unreal-runtime.mjs --debug-port=9333
// Launch UE with -WNTAutomation -cefdebug=9333 and an ISOLATED save directory.
// This driver never launches/closes Unreal, changes engine files, or publishes.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {validateSave} from '../mechanics/state-io.mjs';
import {contentFor} from '../mechanics/campaign-content.mjs';
import {campaignMinutes} from '../mechanics/campaign-clock.mjs';
import {newGame} from '../mechanics/engine.mjs';
import {beginEngagement} from '../mechanics/engagements.mjs';
import {buildUnrealScenePacket} from '../ui/unreal-scene-packet.mjs';
import {nativeCameraFields,verifyStrategicMiddleNoop,verifyCloseWorldOrbit,verifyNativeFPS,verifyWorldWheelResponse} from './native-camera-gesture-checks.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const option=name=>args.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
const port=Number(option('--debug-port'));
assert(Number.isInteger(port)&&port>0&&port<=65535,'Pass an explicit local CEF --debug-port=9333; the driver never discovers arbitrary browsers.');
const output=path.resolve(option('--output')||path.join(root,'test-output/unreal-runtime'));
const captures=path.resolve(option('--capture-dir')||path.join(root,'unreal/Saved/Screenshots'));
const allowExisting=args.includes('--replace-existing-test-save');
const endpoint='http://127.0.0.1:'+port;
let playwright;
try {playwright=createRequire(import.meta.url)('playwright');}
catch {playwright=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'))('playwright');}
await fs.mkdir(output,{recursive:true});
const result={passed:false,endpoint,startedAt:new Date().toISOString(),checks:[],metrics:[],captures:[],errors:[],consoleErrors:[],externalRequests:[],limitations:[
 'CEF screenshots contain HTML only. Native GPU captures are requested separately from FScreenshotRequest with UI disabled.',
 'This is a local editor-game smoke test, not a Shipping package or performance certification.',
]};
const contexts=[];
let browser,page,origin,phase='connect',eventCursor=0;
const surface=()=>page.locator('.native-world-input');
const control=action=>page.locator('.start-demo [data-demo-action="'+action+'"]');
const demoState=()=>page.locator('.start-demo').evaluate(node=>({...node.dataset}));

// These wrappers only observe calls; the original receiver and Canvas API retain
// their arguments, receiver, return value and production behavior.
function instrument() {
 const evidence=globalThis.__wntRuntimeEvidence={events:[],errors:[],contexts:[],nextEvent:0};
 const context=HTMLCanvasElement.prototype.getContext;
 HTMLCanvasElement.prototype.getContext=function(...args) {
  evidence.contexts.push(String(args[0])); return Reflect.apply(context,this,args);
 };
 const hook=()=>{
  const receiver=globalThis.WNTUnreal;
  if(!receiver||receiver.receive.__wntObserved)return;
  const receive=receiver.receive;
  const observed=function(event) {
   evidence.events.push({sequence:++evidence.nextEvent,event:structuredClone(event)});
   if(event.type==='error')evidence.errors.push(structuredClone(event));
   if(evidence.events.length>400)evidence.events.shift();
   return Reflect.apply(receive,this,[event]);
  };
  observed.__wntObserved=true;receiver.receive=observed;
 };
 hook();setInterval(hook,25);
}
async function until(read,accept,{timeout=20000,label='condition'}={}) {
 const start=Date.now();let last;
 do {last=await read();if(accept(last))return last;await delay(100);}while(Date.now()-start<timeout);
 throw Error('Timed out waiting for '+label+': '+JSON.stringify(last).slice(0,1200));
}
async function input(action,values={}) {
 await page.evaluate(({action,values})=>{
  const evidence=globalThis.__wntRuntimeEvidence;
  const last=[...evidence.events].reverse().find(row=>row.event.instanceId);
  return ue.wnt.sceneinput(JSON.stringify({instanceId:last?.event.instanceId||'',action,...values}));
 },{action,values});
}
async function eventsSince(sequence=eventCursor) {
 return page.evaluate(sequence=>globalThis.__wntRuntimeEvidence.events.filter(row=>row.sequence>sequence),sequence);
}
async function collectEvidence() {
 const evidence=await page.evaluate(()=>globalThis.__wntRuntimeEvidence);
 contexts.push(...evidence.contexts);
 for(const event of evidence.errors)result.errors.push({phase:'native bridge',message:event.message});
}
async function cursor() {return page.evaluate(()=>globalThis.__wntRuntimeEvidence.nextEvent);}
async function diagnostics(mode) {
 const before=await cursor();await input('diagnostics');
 const rows=await until(()=>eventsSince(before),rows=>rows.some(row=>row.event.type==='diagnostics'),{label:'gated native diagnostics (-WNTAutomation required)'});
 const d=rows.find(row=>row.event.type==='diagnostics').event;
 assert.equal(d.renderer,'Unreal Engine native UWorld');assert.equal(d.nativeWorldInitialized,true);
 assert.equal(d.modelLoadErrors,0,'Registered detailed models must load successfully');
 assert.equal(d.detailedModelCount+d.deferredModelCount+d.pendingModelCount,d.shipActorCount,'Every ship has resident detailed geometry, an available deferred asset, or explicit pending artwork');
 if(mode)assert.equal(d.mode,mode);
 eventCursor=Math.max(eventCursor,...rows.map(row=>row.sequence));return d;
}
async function nativeCapture(name,includeUI=false) {
 assert(/^[a-z0-9-]+$/.test(name));
 const file=path.join(captures,name+'.png'),old=await fs.stat(file).catch(()=>null);
 await input('capture',{name,includeUI});
 const stat=await until(()=>fs.stat(file).catch(()=>null),stat=>stat?.size>1000&&(!old||stat.mtimeMs>old.mtimeMs),{timeout:45000,label:'native GPU capture '+name});
 // A completed PNG ends in IEND; do not copy a file still being written.
 const bytes=await until(()=>fs.readFile(file),b=>b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&b.subarray(-8,-4).toString()==='IEND',{label:'completed PNG '+name});
 const target=path.join(output,name+'.png');await fs.writeFile(target,bytes);
 result.captures.push({kind:includeUI?'native-Unreal-GPU-with-UI':'native-Unreal-GPU-no-UI',name,file:target,source:file,bytes:bytes.length,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),modifiedAt:stat.mtime.toISOString()});
 await page.screenshot({path:path.join(output,name+'-cef-html-only.png')});
 result.captures.push({kind:'CEF-HTML-only-not-native-render',name:name+'-cef-html-only',file:path.join(output,name+'-cef-html-only.png')});
}
async function targets(kind) {
 const d=await diagnostics();
 return page.evaluate(({targets,kind})=>targets.filter(t=>t.visible&&t.kind===kind).map(t=>({...t,x:t.screenX*innerWidth,y:t.screenY*innerHeight})).filter(t=>document.elementFromPoint(t.x,t.y)?.matches('canvas.unreal-input')),{targets:d.targets,kind});
}
async function pick(kind,{hover=false}={}) {
 const candidates=await until(()=>targets(kind),rows=>rows.length>0,{label:'visible native '+kind+' surface'});
 const target=candidates[0],before=await cursor();
 await page.mouse.move(1,1);await page.mouse.move(target.x,target.y);
 if(!hover)await page.mouse.click(target.x,target.y);
 const type=hover?'hover':'select';
 const rows=await until(()=>eventsSince(before),rows=>rows.some(row=>row.event.type===type&&row.event.selection?.kind===kind),{label:'real pointer → native '+kind+' '+type});
 const event=rows.find(row=>row.event.type===type&&row.event.selection?.kind===kind).event;
 assert.equal(event.selection.id,target.id,'Native raycast returns the projected actor identity');
 if(target.hullIndex!=null)assert.equal(event.selection.hullIndex,target.hullIndex);
 if(target.side!=null)assert.equal(event.selection.side,target.side);
 result.metrics.push({kind:'native-pointer-'+type,target:event.selection,pointer:[target.x,target.y]});return event.selection;
}
async function save() {
 const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/save'&&r.request().method()==='POST');
 await page.locator('.sidebar [data-action="save"]').click();assert.equal((await response).status(),200);
 const state=await page.evaluate(async()=>{const r=await fetch('/api/save');if(!r.ok)throw Error('Save read failed: '+r.status);return r.json();});
 validateSave(state,CATALOG);return state;
}
async function dismissDispatches() {
 for(let i=0;i<12&&await page.locator('.diplomatic-dispatch').count();i++) {
  await page.locator('.diplomatic-dispatch [data-action="defer-decision"],.diplomatic-dispatch [data-action="choose"]:not(:disabled)').first().click();
  await delay(120);
 }
 assert.equal(await page.locator('.diplomatic-dispatch').count(),0);
}
async function worldReady() {
 await surface().waitFor();await until(()=>diagnostics(),d=>d.mode==='world'&&d.shipActorCount>0&&d.terrainTileCount>0,{timeout:60000,label:'native world/terrain/ships'});
 assert(await surface().evaluate(n=>n.classList.contains('unreal-input')));
}
async function clearPoint() {
 return page.evaluate(()=>{
  const side=document.querySelector('.sidebar').getBoundingClientRect(),panel=document.querySelector('.command-side-panel').getBoundingClientRect(),work=document.querySelector('.command-workspace').getBoundingClientRect();
  const x=(side.right+panel.left)/2,y=(work.top+innerHeight-70)/2;
  if(!document.elementFromPoint(x,y)?.matches('.native-world-input'))throw Error('Clear native input surface unavailable');
  return{x,y};
 });
}
async function focusOwnForce(force,zoom=12000) {
 assert(force.position?.every(Number.isFinite));
 await input('focus',{kind:force.merchant?'convoy':'fleet',id:force.id,longitude:force.position[0],latitude:force.position[1],zoom});
 await until(()=>diagnostics(),d=>Math.abs(d.zoom-zoom)<.01,{label:'native focus '+force.id});
 result.metrics.push({kind:'public-sceneinput-focus',id:force.id,position:force.position,zoom});
 await delay(250);
}

try {
 await until(async()=>{try{const r=await fetch(endpoint+'/json/version',{signal:AbortSignal.timeout(1500)});return r.ok?await r.json():null;}catch{return null;}},Boolean,{timeout:120000,label:'explicit local CEF debug endpoint'});
 browser=await playwright.chromium.connectOverCDP(endpoint,{timeout:30000});
 page=await until(()=>Promise.resolve(browser.contexts().flatMap(c=>c.pages()).find(p=>{
  try {const u=new URL(p.url());return ['127.0.0.1','localhost'].includes(u.hostname)&&u.searchParams.get('unreal')==='1';}catch{return false;}
 })),Boolean,{timeout:120000,label:'local CEF game page (?unreal=1)'});
 page.setDefaultTimeout(20000);origin=new URL(page.url()).origin;
 page.on('pageerror',error=>result.errors.push({phase,message:error.message,stack:error.stack}));
 page.on('console',message=>{if(message.type()==='error')result.consoleErrors.push({phase,text:message.text(),location:message.location()});});
 page.on('request',request=>{if(/^https?:/.test(request.url())&&new URL(request.url()).origin!==origin)result.externalRequests.push(request.url());});
 const existing=await page.evaluate(async()=>{const r=await fetch('/api/save');return{status:r.status};});
 assert(existing.status===404||allowExisting,'Refusing to replace an existing campaign. Use an isolated test save folder, or explicitly pass --replace-existing-test-save for a disposable test profile.');
 // The CEF target appears before its first module graph finishes fetching.
 // Reload only after initial startup completes; otherwise the driver itself
 // aborts in-flight catalog reads and produces a false startup failure.
 await page.locator('.start-screen, .native-world-input').first().waitFor();
 if(await page.locator('.start-screen').count()) await page.locator('.start-demo[data-demo-ready="true"]').waitFor();
 await page.addInitScript(instrument);await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>typeof globalThis.ue?.wnt?.sceneinput==='function'&&globalThis.__wntRuntimeEvidence&&globalThis.WNTUnreal?.receive.__wntObserved);
 await page.locator('.start-screen').waitFor();
 result.metrics.push({kind:'CEF',url:page.url(),version:browser.version(),viewport:await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio}))});

 phase='opening demonstrations';
 await page.waitForFunction(()=>document.querySelector('.start-demo')?.dataset.demoReady==='true');
 if((await demoState()).demoPlaying==='true')await control('toggle').click();
 const demonstrationIds=[];
 for(let i=0;i<3;i++) {
  await page.locator('.start-screen').evaluate(n=>{n.scrollTop=0;});
  const state=await demoState();demonstrationIds.push(state.demoBattle);
  const d=await diagnostics('battle');assert(d.shipActorCount>0&&d.visibleShipCount>0);
  await delay(1100);await nativeCapture('native-title-'+state.demoBattle);
  const selected=await pick('battle-ship');
  await page.waitForFunction(s=>{const n=document.querySelector('.start-demo-inspection');return n?.dataset.demoId===s.id&&n.dataset.demoSide===s.side;},selected);
  await control('next').click();assert.notEqual((await demoState()).demoFrame,state.demoFrame);
  await control('next-battle').click();
 }
 assert.equal(new Set(demonstrationIds).size,3);
 assert.equal((await page.evaluate(async()=>(await fetch('/api/save')).status)),existing.status,'Demo playback does not create a campaign save');
 result.checks.push('Opening battles retain exact hull identities with detailed models where available and explicit pending-art symbols elsewhere; native clicks, Next stage and Next battle work.');

 phase='detailed model gallery';
 const registry=JSON.parse(await fs.readFile(path.join(root,'assets/models/ships/index.json'),'utf8'));
 const detailed=registry.models.filter(m=>m.file.endsWith('.glb')&&m.platforms.length);
 await page.locator('[data-action="ship-gallery"]').click();
 const gallery=page.locator('.model-gallery');await gallery.waitFor();
 assert.equal(await gallery.locator('select option').count(),detailed.length);
 for(let i=0;i<detailed.length;i++){
  await gallery.locator('select').selectOption(String(i));
  const model=path.basename(detailed[i].file,'.glb');
  await until(()=>diagnostics('battle'),d=>d.targets.some(t=>t.id==='gallery-ship'&&t.modelId===model&&t.visualStatus==='detailed-model'&&t.detailedModel&&!t.modelPending),{label:'actual detailed geometry '+model});
  await page.waitForFunction(id=>{const gallery=document.querySelector('.model-gallery');return gallery?.dataset.galleryReady==='true'&&gallery.dataset.galleryModel===id;},detailed[i].id);
  const targetZoom=Number(await gallery.getAttribute('data-gallery-target-zoom'));
  assert(Number.isFinite(targetZoom)&&targetZoom>0,'Gallery supplies its intended dimensional fit');
  await until(()=>diagnostics('battle'),d=>Math.abs(d.zoom-targetZoom)<=Math.max(.0001,targetZoom*.001),{label:'gallery camera reaches fitted zoom '+model});
  await pick('battle-ship');
  assert.match(await gallery.locator('[role="status"]').textContent(),/selected/);
  await nativeCapture('native-gallery-'+i);
 }
 await gallery.locator('select').selectOption('0');
 await page.waitForFunction(id=>{const gallery=document.querySelector('.model-gallery');return gallery?.dataset.galleryReady==='true'&&gallery.dataset.galleryModel===id;},detailed[0].id);
 const firstGalleryZoom=Number(await gallery.getAttribute('data-gallery-target-zoom'));
 assert(Number.isFinite(firstGalleryZoom)&&firstGalleryZoom>0);
 await until(()=>diagnostics('battle'),d=>Math.abs(d.zoom-firstGalleryZoom)<=Math.max(.0001,firstGalleryZoom*.001),{label:'gallery interface camera reaches fitted zoom'});
 await nativeCapture('native-gallery-interface',true);
 await gallery.locator('[data-gallery="close"]').click();await page.locator('.start-demo[data-demo-ready="true"]').waitFor();
 assert.equal(await page.locator('#app').evaluate(el=>!el.hidden&&!el.inert),true);
 assert.equal((await page.evaluate(async()=>(await fetch('/api/save')).status)),existing.status);
 result.checks.push('Every gallery entry loads its exact detailed model and responds to a real native surface click; closing restores the title demo without creating or modifying a campaign.');

 phase='new campaign';
 await page.locator('[data-action="select-campaign"][data-id="in_good_faith_1936"]').click();
 await page.locator('[data-action="select-nation"][data-id="USA"]').click();
 await page.locator('[data-action="new"]').click();
 if(await page.locator('[data-action="begin"]').count())await page.locator('[data-action="begin"]').click();
 await surface().waitFor();await delay(150);
 await dismissDispatches();await worldReady();
 const initial=await save();assert.equal(initial.player,'USA');assert.equal(initial.campaignId,'in_good_faith_1936');assert.equal(initial.paused,true);
 const packet=buildUnrealScenePacket(initial,contentFor(CATALOG,initial));
 const d=await diagnostics('world');assert(d.shipActorCount>=packet.forces.reduce((sum,f)=>sum+f.hulls.length,0));
 result.metrics.push({kind:'native-world',...d,targets:undefined,ownForceCount:packet.forces.length,ownHullCount:packet.forces.reduce((sum,f)=>sum+f.hulls.length,0)});
 await nativeCapture('native-world');
 assert.equal(d.pendingModelCount,0,'Every starting campaign ship and opening-demo combatant must have a registered detailed model');
 result.checks.push('USA1936 starts paused; every own hull retains its identity and position, with pending artwork counted separately from detailed models and loading errors.');

 phase='persistent command map and ministry menus';
 await page.evaluate(()=>{globalThis.__runtimeWorldCanvas=document.querySelector('.native-world-input');globalThis.__runtimeOutliner=document.querySelector('.command-side-panel');});
 const cameraFields=nativeCameraFields;
 const menuBaseline=await diagnostics('world'),menuGeometry=await page.locator('.command-side-panel').boundingBox();
 for(const menu of ['land','airwar','yards','aircraft','fleet','programs','diplomacy','economy','reports','review']) {
  await page.locator('.nav-item[data-view="'+menu+'"]').click();await page.locator('.menu-popup.view-'+menu).waitFor();
  const menuNative=await diagnostics('world');
  assert.deepEqual(cameraFields(menuNative),cameraFields(menuBaseline),'Opening '+menu+' preserves native scene and camera');
  assert.equal(menuNative.shipActorCount,menuBaseline.shipActorCount,'Opening menus preserves loaded ship actors');
  assert.equal(menuNative.terrainTileCount,menuBaseline.terrainTileCount,'Opening menus preserves loaded terrain');
  assert.deepEqual(await page.locator('.command-side-panel').boundingBox(),menuGeometry,'Naval outliner stays fixed');
  const menuLayout=await page.locator('.menu-popup').evaluate(popup=>({left:popup.getBoundingClientRect().left,layerLeft:popup.parentElement.getBoundingClientRect().left,sidebarRight:document.querySelector('.sidebar').getBoundingClientRect().right}));
  assert(Math.abs(menuLayout.left-menuLayout.layerLeft)<2&&menuLayout.left>=menuLayout.sidebarRight,'Ministry menu remains left-aligned beside the sidebar');
  assert(await page.evaluate(()=>__runtimeWorldCanvas===document.querySelector('.native-world-input')&&__runtimeOutliner===document.querySelector('.command-side-panel')),'Map and outliner DOM nodes persist');
 }
 await nativeCapture('native-ministry-popup',true);
 await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-popup').count(),0);
 result.checks.push('Menus 02–11 preserve the native world instance, camera, loaded terrain/ship actors and naval outliner; Escape restores the unobstructed command map.');

 phase='world camera and hull picking';
 const selectState=await save();
 const selectedBefore=await diagnostics('world');
 const fittedRow=page.locator('.fleet-command-row').first(),fittedId=await fittedRow.getAttribute('data-id');
 assert(packet.forces.some(force=>force.id===fittedId&&!force.merchant));
 await fittedRow.click();
 const selectedNative=await until(()=>diagnostics('world'),d=>d.chart?.selectedForceIds?.includes(fittedId)&&d.chart.selectedMarkers?.some(marker=>marker.forceId===fittedId&&marker.visible&&marker.highlightVisible),{label:'single-click native fleet highlight'});
 assert.deepEqual(selectedNative.chart.selectedForceIds,[fittedId],'A single click leaves only the chosen native fleet highlighted');
 assert(selectedNative.chart.visibleSelectedMarkerCount>0,'An actual native marker highlight is visible');
 assert.deepEqual(cameraFields(selectedNative),cameraFields(selectedBefore),'Single outliner click selects without moving the camera');
 const selectAfter=await save();assert.equal(campaignMinutes(selectAfter),campaignMinutes(selectState));assert.equal(selectAfter.minuteTicks,selectState.minuteTicks);
 assert.deepEqual(selectAfter.nations.USA.fleets,selectState.nations.USA.fleets,'Single fleet selection issues no movement or mission order');
 result.metrics.push({kind:'single-fleet-native-highlight',chart:selectedNative.chart,camera:cameraFields(selectedNative)});
 await fittedRow.dblclick();
 const fitted=await until(()=>diagnostics('world'),d=>d.zoom>1&&Math.abs(d.zoom-d.targetZoom)<.001&&d.visibleShipCount>0,{label:'real double-click fleet fit'});
 assert.equal(fitted.tilt,0,'Fleet fit remains overhead');
 assert(fitted.detailedModelCount>0,'Fleet fit has resident detailed ship geometry');
 assert.equal(await fittedRow.getAttribute('aria-current'),'true');
 assert((await targets('ship')).length>0,'A fitted own ship is visible and pickable');
 const boxTarget=await until(async()=>{
  const rows=await targets('ship');
  return page.evaluate(rows=>rows.find(t=>[-9,9].every(dx=>[-9,9].every(dy=>document.elementFromPoint(t.x+dx,t.y+dy)?.matches('.native-world-input')))),rows);
 },Boolean,{label:'visible own hull with room for a selection box'});
 const boxForce=packet.forces.find(force=>!force.merchant&&force.hulls.some(h=>h.id===boxTarget.id));assert(boxForce);
 const boxState=await save(),boxCamera=await diagnostics('world'),boxCursor=await cursor();
 await page.mouse.move(boxTarget.x-9,boxTarget.y-9);await page.mouse.down({button:'left'});await page.mouse.move(boxTarget.x+9,boxTarget.y+9,{steps:5});await page.mouse.up({button:'left'});
 const boxEvents=await until(()=>eventsSince(boxCursor),rows=>rows.some(row=>row.event.type==='select'&&row.event.selection?.kind==='fleet-group'),{label:'real left-drag group selection'});
 const boxSelection=boxEvents.find(row=>row.event.type==='select'&&row.event.selection?.kind==='fleet-group').event.selection;
 assert(boxSelection.ids.includes(boxForce.id),'Box selects the fleet containing the enclosed own hull');
 assert(boxSelection.ids.every(id=>packet.forces.some(force=>!force.merchant&&force.id===id)),'Box selection exposes only own fleets');
 const boxNative=await until(()=>diagnostics('world'),d=>d.chart?.selectedForceIds?.length===boxSelection.ids.length&&boxSelection.ids.every(id=>d.chart.selectedForceIds.includes(id)),{label:'native selected fleet set after real box gesture'});
 assert.deepEqual(cameraFields(boxNative),cameraFields(boxCamera),'Left box selection does not move the camera');
 const boxAfter=await save();assert.equal(campaignMinutes(boxAfter),campaignMinutes(boxState));assert.equal(boxAfter.minuteTicks,boxState.minuteTicks);
 assert.deepEqual(boxAfter.nations.USA.fleets,boxState.nations.USA.fleets,'Selecting a box issues no movement or mission orders');
 result.checks.push('Real outliner single click visibly highlights only its native fleet without centering or issuing orders. Double click fits a detailed overhead fleet. Left-drag selects only enclosed own fleets and updates native selection without camera movement, orders or campaign time.');
 await surface().focus();await page.keyboard.press('Home');await until(()=>diagnostics(),after=>after.zoom===1,{label:'Home after selection checks'});
 await verifyWorldWheelResponse({page,diagnostics,clearPoint,waitFor:(label,predicate)=>until(()=>diagnostics('world'),predicate,{label}),metrics:result.metrics});
 // Global diagnostics intentionally return only 24 ray-tested targets. Focus a
 // public, lightly crowded port so fleets/contacts cannot fill that bounded list.
 const inspectPort=packet.ports.find(p=>p.id==='cape')||packet.ports[0];assert(inspectPort);
 await input('focus',{kind:'port',id:inspectPort.id,longitude:inspectPort.position[0],latitude:inspectPort.position[1],zoom:4});
 await until(()=>diagnostics('world'),d=>Math.abs(d.zoom-4)<.001,{label:'regional port inspection framing'});
 const zoomLegend=page.locator('.map-zoom-level');
 await until(()=>zoomLegend.textContent(),text=>text==='Zoom 4.0×',{label:'regional native camera reflected in zoom legend'});
 const portCamera=await diagnostics('world'),selectedPort=await pick('port');
 await page.waitForFunction(id=>document.querySelector('.port-inspection')?.dataset.portId===id,selectedPort.id);
 assert((await page.locator('.port-inspection').innerText()).includes(selectedPort.label),'A real port click opens the matching information panel');
 assert.deepEqual(cameraFields(await diagnostics('world')),cameraFields(portCamera),'Single-click port inspection does not drag or recenter the map');
 const portDoubleTarget=await until(async()=>(await targets('port')).find(target=>target.id===selectedPort.id),Boolean,{label:'same inspected port remains directly pickable'});
 const portDoubleCursor=await cursor();
 await page.mouse.dblclick(portDoubleTarget.x,portDoubleTarget.y);
 // A real pointer move may queue hover while programmatic port focus updates
 // the camera. That hit-test update must not swallow its camera notification.
 await page.mouse.move(portDoubleTarget.x+2,portDoubleTarget.y+1);
 const portDoubleEvents=await until(()=>eventsSince(portDoubleCursor),rows=>rows.some(row=>row.event.type==='select'&&row.event.selection?.kind==='port'&&row.event.selection.id===selectedPort.id&&row.event.zoom===true),{label:'real port double-click focus request'});
 const portFocused=await until(()=>diagnostics('world'),d=>Math.abs(d.zoom-16)<.001&&Math.abs(d.targetZoom-16)<.001,{label:'real port double-click reaches 16×'});
 // Check before captures, menu clicks, or unrelated UI actions could conceal a
 // stale legend by incidentally causing a later full render.
 const focusedLegend=await until(()=>zoomLegend.textContent(),text=>text===`Zoom ${portFocused.zoom.toFixed(1)}×`,{label:'port double-click updates visible zoom legend without another UI action'});
 const portCameraEvents=await until(()=>eventsSince(portDoubleCursor),rows=>rows.some(row=>row.event.type==='camera'&&Math.abs(row.event.zoom-16)<.001),{label:'port focus emits its native camera notification'});
 assert.equal(await page.locator('.port-inspection').getAttribute('data-port-id'),selectedPort.id,'Double-click retains the same port inspector');
 result.metrics.push({kind:'native-port-double-click-camera-legend',portId:selectedPort.id,before:cameraFields(portCamera),after:cameraFields(portFocused),legend:focusedLegend,selectionEvent:portDoubleEvents.find(row=>row.event.type==='select'&&row.event.zoom===true)?.event,cameraNotifications:portCameraEvents.filter(row=>row.event.type==='camera').map(row=>row.event)});
 await nativeCapture('native-port-inspection',true);
 await page.locator('.port-inspection [data-action="map-overview"]').click();
 await surface().focus();await page.keyboard.press('Home');await until(()=>diagnostics('world'),d=>d.zoom===1,{label:'Home after port inspection'});
 result.checks.push('Sixteen actual wheel notches reach ship zoom with at most one map rebase per anchor solve. A native port single-click opens its matching information without moving the map; a real double-click from 4× focuses that same port at 16× and updates the visible zoom legend through its native camera notification without an unrelated UI redraw.');
 let before=await diagnostics('world');
 const point=await clearPoint();await page.mouse.move(point.x,point.y);await page.mouse.wheel(0,-300);
 await until(()=>diagnostics(),after=>after.zoom>before.zoom,{label:'real wheel zoom'});
 await surface().focus();before=await diagnostics();await page.keyboard.press('PageUp');
 await until(()=>diagnostics(),after=>after.zoom>before.zoom,{label:'real keyboard zoom'});
 await page.keyboard.press('Home');await until(()=>diagnostics(),after=>after.zoom===1,{label:'strategic Home'});
 await verifyStrategicMiddleNoop({page,diagnostics,clearPoint,metrics:result.metrics});
 const warshipForce=packet.forces.find(f=>!f.merchant&&f.position&&f.hulls.some(h=>['BB','BC','CV'].includes(h.type)))||packet.forces.find(f=>!f.merchant&&f.position&&f.hulls.length);
 assert(warshipForce);await focusOwnForce(warshipForce);assert.equal((await diagnostics()).tilt,0,'Fleet view remains overhead');await nativeCapture('native-fleet');
 const hovered=await pick('ship',{hover:true});
 await page.locator('.class-hover:not([hidden])').waitFor();
 // The tooltip has an intentional dwell delay and may still contain the
 // previous territory's information after the native hit is already correct.
 await until(()=>page.locator('.class-hover:not([hidden])').innerText(),
  text=>/Sailors aboard|Hull|Complement/.test(text)&&text.includes(hovered.label),
  {label:'hover information for the exact selected hull'});
 if(hovered.modelPending)assert.match(await page.locator('.class-hover:not([hidden])').innerText(),/3D.*pending|pending.*3D/i,'Pending artwork is explicit in the inspection');
 const selection=await pick('ship');
 assert(initial.nations.USA.groups.some(g=>g.id===selection.id),'Only a recorded own ship was selected');
 await page.locator('[data-dialog-type="ship"]').waitFor();
 assert.equal(await page.locator('[data-dialog-type="ship"]').getAttribute('data-key'),'dialog-ship-'+selection.id);
 await page.locator('.modal [data-action="close"]').first().click();await worldReady();
 await focusOwnForce(warshipForce,60000);await nativeCapture('native-ship');
 const beforeTilt=await diagnostics();
 assert.equal(beforeTilt.tilt,0,'Individual ship zoom remains overhead until a middle drag');
 await verifyCloseWorldOrbit({page,diagnostics,clearPoint,waitFor:(label,predicate)=>until(()=>diagnostics('world'),predicate,{label}),metrics:result.metrics});
 await nativeCapture('native-ship-tilted');
 result.checks.push('Real wheel/PageUp/Home input changes the native camera. Strategic middle drag is inert; close middle drag orbits without moving focus, right drag pans while retaining requested orientation, and wheel zoom out/in clears manual yaw and tilt. Native hull hover/click reach exact game inspections.');
 result.metrics.push({kind:'hovered-ship',selection:hovered});

 await verifyNativeFPS({page,metrics:result.metrics});
 phase='merchant hulls';
 const merchant=packet.forces.find(f=>f.merchant&&f.position&&f.hulls.length);
 if(merchant) {
  await focusOwnForce(merchant);const selected=await pick('merchant');
  await page.waitForFunction(s=>{const n=document.querySelector('.merchant-inspection');return n?.dataset.convoyId===s.id&&n.dataset.hullIndex===String(s.hullIndex);},selected);
  assert.match(await page.locator('.merchant-inspection').innerText(),new RegExp('Merchant hull '+(selected.hullIndex+1)));
  await nativeCapture('native-merchant');
  result.checks.push('A real native merchant surface opens its exact own convoy and hull index.');
 } else result.limitations.push('No active merchant convoy exists in this opening seed; merchant picking was not exercised.');

 phase='save and CEF reload';
 await page.locator('.sidebar [data-view="command"]').click();
 const saved=await save();assert.equal(campaignMinutes(saved),campaignMinutes(initial),'Camera/demo/inspection actions do not advance simulation');assert.equal(saved.paused,true);
 await fs.writeFile(path.join(output,'verified-campaign.json'),JSON.stringify(saved));
 await collectEvidence();
 await page.reload({waitUntil:'domcontentloaded'});eventCursor=0;
 await page.locator('[data-action="continue"]').click();await dismissDispatches();await worldReady();
 const restored=await save();
 // The unload journal may be newer than the last disk envelope. Recovery and
 // timestamp fields describe the load path, not a change to campaign state.
 if(restored.recoveredSave!=null)assert.equal(restored.recoveredSave,true);
 const {savedAt:_a,recoveredSave:_recoveryA,...a}=saved,{savedAt:_b,recoveredSave:_recoveryB,...b}=restored;
 assert.deepEqual(b,a,'Continue restores the entire campaign state, not merely the visible date');
 await surface().focus();await page.keyboard.press('Home');await nativeCapture('native-restored');
 result.checks.push('Normal Save, a full CEF document reload and Continue preserve the complete paused campaign, RNG, resources and hull state; native terrain and fleets remount.');
 phase='campaign decisive battle watch';
 // This fixture is a real engine engagement in the disposable test profile,
 // distinct from the historical opening illustrations. No player save is used.
 const battleState=newGame(CATALOG,'USA',360036,'in_good_faith_1936');
 battleState.decisions=[];battleState.autoPause=false;battleState.paused=true;
 Object.assign(battleState.relations['JPN-USA'],{war:true,allied:false,warSince:battleState.day});
 const fleets=['USA','JPN'].map(id=>battleState.nations[id].fleets.find(f=>f.role==='battle'));
 for(const f of fleets)f.aggressiveBattle=true;
 const engagement=beginEngagement(battleState,contentFor(CATALOG,battleState),{kind:'surface',a:'USA',b:'JPN',fleetA:fleets[0].id,fleetB:fleets[1].id,region:'pacific',position:[160,20]});
 assert(engagement.decisive.qualifies);validateSave(battleState,CATALOG);
 await page.locator('.sidebar [data-action="menu"]').click();
 await page.locator('[data-action="title-screen"]').click();await page.locator('.start-screen').waitFor();
 await page.evaluate(async state=>{const {saveCampaign}=await import('/ui/save-client.mjs');await saveCampaign(state);},battleState);
 await page.reload({waitUntil:'domcontentloaded'});eventCursor=0;
 await page.locator('[data-action="continue"]').click();await dismissDispatches();await worldReady();
 assert.equal(await page.locator('[data-dialog-type="battle-watch"]').count(),0,'A decisive action alerts without opening the viewer automatically');
 // Read the real shared-engine clock independently of UI formatting. A
 // tactical battle's scenario budget is not a staged completion estimate.
 assert(engagement.tactical,'The campaign fixture uses the shared tactical engine');
 const elapsedSeconds=engagement.tactical.seconds,scenarioLimitSeconds=engagement.tactical.maxDurationSeconds;
 assert(Number.isFinite(elapsedSeconds)&&elapsedSeconds>=0);
 assert(Number.isFinite(scenarioLimitSeconds)&&scenarioLimitSeconds>0);
 const combatDuration=seconds=>`${Math.floor(seconds/60)} min ${Math.floor(seconds%60)} s`;
 const elapsedLabel=`Tactical engagement · ${combatDuration(elapsedSeconds)} elapsed`;
 const scenarioProgress=Math.min(1,elapsedSeconds/scenarioLimitSeconds);
 const limitLabel=`${Math.round(scenarioProgress*100)}% of scenario time limit (${combatDuration(scenarioLimitSeconds)})`;
 const checkTacticalTiming=async(locator,label)=>{
  const text=await locator.innerText();
  assert(text.includes(elapsedLabel),`${label} shows the actual elapsed combat seconds`);
  assert(text.includes(limitLabel),`${label} names the actual scenario time limit`);
  assert(text.includes('not a completion estimate; battles may end earlier.'),`${label} explains the time-limit ratio`);
  assert.doesNotMatch(text,/current stage|until the next stage/i,`${label} does not present legacy stage progress`);
  const progress=locator.locator('progress');assert.equal(await progress.count(),1);
  assert.equal(await progress.getAttribute('aria-label'),'Elapsed combat time compared with the scenario time limit');
  assert.equal(Number(await progress.getAttribute('max')),1);
  assert(Math.abs(Number(await progress.getAttribute('value'))-scenarioProgress)<1e-12,`${label} uses elapsed combat divided by its scenario limit`);
  return text;
 };
 const battleCard=page.locator('.command-battles [data-action="watch-battle"]');
 assert.equal(await battleCard.count(),1);
 assert.equal(await battleCard.getAttribute('data-id'),String(engagement.id));
 const battleCardText=await checkTacticalTiming(battleCard,'Compact command battle card');
 // Diagnostics exposes a bounded set of ray-tested targets. Bring the actual
 // engagement into view before picking; Home can put it beyond a narrow
 // viewport or behind the first 24 strategic port/convoy targets.
 await input('focus',{longitude:engagement.position[0],latitude:engagement.position[1],zoom:12});
 await until(()=>diagnostics('world'),d=>Math.abs(d.zoom-12)<.001,{label:'regional battle location'});
 await until(()=>diagnostics('world'),d=>d.targets.some(t=>t.kind==='battle'&&String(t.id)===String(engagement.id)),{label:'ongoing decisive map marker'});
 const battleHover=await pick('battle',{hover:true});
 assert.equal(String(battleHover.id),String(engagement.id),'The actual native map hover identifies its own live engagement');
 const battleTooltip=page.locator('.class-hover:not([hidden])');await battleTooltip.waitFor();
 await until(()=>battleTooltip.innerText(),text=>text.includes(elapsedLabel),{label:'live tactical battle hover timing'});
 const battleHoverText=await checkTacticalTiming(battleTooltip,'Native map battle hover');
 result.metrics.push({kind:'campaign-tactical-progress-labels',reportId:engagement.id,elapsedSeconds,scenarioLimitSeconds,scenarioProgress,cardText:battleCardText,hoverText:battleHoverText});
 result.checks.push('Before opening a real shared-engine decisive battle, its compact command card and actual native map hover show the exact elapsed combat seconds and scenario time-limit ratio, explicitly deny a completion estimate, and contain no legacy current-stage wording.');
 await page.mouse.move(1,1);
 await nativeCapture('native-campaign-battle-marker');
 const battlePick=await pick('battle');
 assert.equal(String(battlePick.id),String(engagement.id),'Map marker selects its own live engagement');
 const watch=page.locator('[data-dialog-type="battle-watch"]');await watch.waitFor();
 await watch.locator('.battle-stage').scrollIntoViewIfNeeded();
 await until(()=>diagnostics('battle'),d=>d.targets.some(t=>t.kind==='battle-ship'),{label:'campaign battle native hulls'});
 await pick('battle-ship');await watch.locator('.battle-ship-inspection').waitFor();
 await nativeCapture('native-campaign-battle');
 await watch.locator('[data-action="battle-next"]').click();
 await until(()=>watch.locator('.battle-watch-heading').textContent(),text=>text.includes('+15 min'),{label:'campaign Next tick'});
 await watch.locator('[data-action="battle-first"]').click();
 await until(()=>watch.locator('.battle-watch-heading').textContent(),text=>text.includes('+0 min'),{label:'recorded battle frame'});
 await watch.locator('[data-action="battle-next"]').click();
 await until(()=>watch.locator('.battle-watch-heading').textContent(),text=>text.includes('+15 min'),{label:'recorded tick playback'});
 // The movie must be a separate presentation clock: real UI controls pause
 // and resume it while the campaign snapshot/one-tick budget stays untouched.
 await watch.locator('[data-action="battle-movie"]').click();
 await until(()=>watch.locator('.battle-watch').getAttribute('data-movie-paused'),value=>value==='false',{label:'recorded movie playing'});
 const movieKey=await watch.locator('.battle-watch').getAttribute('data-movie-key');assert(movieKey);
 await until(()=>watch.locator('[data-movie-progress]').textContent(),text=>parseInt(text,10)>=2,{label:'independent movie presentation clock'});
 await watch.locator('[data-action="battle-movie-toggle"]').click();
 await until(()=>watch.locator('.battle-watch').getAttribute('data-movie-paused'),value=>value==='true',{label:'movie paused'});
 const moviePausedProgress=await watch.locator('[data-movie-progress]').textContent();
 await new Promise(resolve=>setTimeout(resolve,1100));
 assert.equal(await watch.locator('[data-movie-progress]').textContent(),moviePausedProgress,'Movie pause freezes its own clock');
 assert.equal(await watch.locator('.battle-watch').getAttribute('data-movie-key'),movieKey,'Pause keeps the native event identity');
 assert.match(await watch.locator('.battle-watch-heading').textContent(),/CAMPAIGN PAUSED/);
 await nativeCapture('native-recorded-movie-paused');
 await watch.locator('[data-action="battle-movie-toggle"]').click();
 await until(()=>watch.locator('[data-movie-progress]').textContent(),text=>parseInt(text,10)>parseInt(moviePausedProgress,10),{label:'movie resumes without restart'});
 assert.equal(await watch.locator('.battle-watch').getAttribute('data-movie-key'),movieKey);
 await watch.locator('[data-action="close"]').first().click();await worldReady();
 const watched=await save();
 assert.equal(campaignMinutes(watched),campaignMinutes(battleState)+15,'Only the live Next tick advances the whole simulation');
 assert.equal(watched.minuteTicks,(battleState.minuteTicks||0)+1);assert.equal(watched.paused,true);
 const recording=watched.reports.find(r=>r.id===engagement.id);
 assert.equal(recording.replay.frames.at(-1).at,campaignMinutes(watched));
 await fs.writeFile(path.join(output,'verified-campaign.json'),JSON.stringify(watched));
 result.metrics.push({kind:'campaign-battle-watch',reportId:engagement.id,minutesAdvanced:15,ticksAdvanced:1,paused:watched.paused,frames:recording.replay.frames.length});
 result.checks.push('A real decisive engagement raises an optional alert and a clickable native map badge; selecting it opens its battle. Live Next tick advances exactly 15 campaign minutes once. Recorded tick navigation and the real movie Play/Pause/Resume controls advance no campaign time; the movie clock freezes and resumes with one stable event identity, and closing leaves the campaign paused.');
 await collectEvidence();
 assert(!contexts.some(type=>/webgl|experimental-webgl/i.test(type)),'Unreal mode must not create a browser WebGL scene');
 result.metrics.push({kind:'browser-context-requests',contexts});
 assert.deepEqual(result.errors,[],'No JavaScript or native bridge errors');
 assert.deepEqual(result.externalRequests,[],'Runtime content stays on the local game origin');
 assert(!result.consoleErrors.some(row=>/Unreal:|Uncaught|TypeError|ReferenceError|SyntaxError/.test(row.text)),'No high-signal browser console errors');
 result.checks.push('CEF creates no WebGL contexts in native mode; no JavaScript/native bridge errors or external runtime requests were observed.');
 result.passed=true;
} catch(error) {
 result.failure={phase,message:error.message,stack:error.stack};
 if(page) {
  await page.screenshot({path:path.join(output,'failure-cef-html-only.png')}).catch(()=>{});
  result.lastEvents=await eventsSince(0).catch(()=>[]);
 }
} finally {
 result.finishedAt=new Date().toISOString();result.gameLeftRunning=true;
 await fs.writeFile(path.join(output,'result.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({passed:result.passed,checks:result.checks,metrics:result.metrics,captures:result.captures,failure:result.failure,result:path.join(output,'result.json'),gameLeftRunning:true},null,2));
 // Do not Browser.close(), Page.close(), or send a native close request. Ending
 // this observer process disconnects CDP while the user's Unreal game stays up.
 process.exit(result.passed?0:1);
}
