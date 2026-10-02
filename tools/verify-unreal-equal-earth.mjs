// Bounded native GPU evidence from an already-running, paused disposable game.
// Never launches, reloads, closes, advances, or replaces a campaign.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {setTimeout as delay} from 'node:timers/promises';
import {createHash} from 'node:crypto';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),option=name=>args.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
if(args.includes('--help')){
 console.log('Usage: node tools/verify-unreal-equal-earth.mjs --debug-port=9333 --confirm-isolated-session [--package-report=<passed package-test.json>] [--output=<directory>] [--capture-dir=<native Screenshots directory>]\nRequires exclusive access to an opted-in Unreal process with explicit save/user folders inside this repository .build directory. Start paused on the command map, with no dialog and no selection or one own fleet selected. Takes nine native GPU+UI images of symbols, Antarctica, multiple central meridians and small pans. Uses normal Save before and after; the complete campaign must match except savedAt. Restores the camera, selection and UI scroll. No launch, reload, tick, fixture or save replacement. Appearance still requires human review.');
 process.exit(0);
}
assert(args.includes('--confirm-isolated-session'),'Explicit --confirm-isolated-session is required; never use a normal player profile.');
const port=Number(option('--debug-port'));
assert(Number.isInteger(port)&&port>0&&port<=65535,'Pass an explicit local CEF debug port; no browser discovery is performed.');
const stamp=new Date().toISOString().replace(/[-:.TZ]/g,'');
const output=path.resolve(option('--output')||path.join(root,'test-output','unreal-equal-earth-'+stamp));
const samePath=(a,b)=>path.resolve(a).toLowerCase()===path.resolve(b).toLowerCase();
const inside=(base,file)=>{const relative=path.relative(base,path.resolve(file));return relative!==''&&relative!=='..'&&!relative.startsWith('..'+path.sep)&&!path.isAbsolute(relative);};
const commandOption=(command,name)=>command.match(new RegExp('(?:^|\\s)"?-'+name+'=(?:"([^"\\r\\n]+)"|([^"\\s]+))','i'))?.slice(1).find(Boolean);
function profile(command){
 const saveDirectory=commandOption(command||'','WNTSaveDir'),userDirectory=commandOption(command||'','UserDir');
 if(!/(?:^|\s)-WNTAutomation(?:\s|$)/i.test(command||'')||Number(commandOption(command||'','cefdebug'))!==port)return null;
 if(!saveDirectory||!userDirectory||![saveDirectory,userDirectory].every(p=>path.isAbsolute(p)&&inside(path.join(root,'.build'),p)))return null;
 return {saveDirectory:path.resolve(saveDirectory),userDirectory:path.resolve(userDirectory)};
}
// A stale report cannot authorize another process that later acquired its port.
const {stdout}=await promisify(execFile)('powershell.exe',['-NoProfile','-NonInteractive','-Command',
 "Get-CimInstance Win32_Process -Filter \"Name='WNT1922-Win64-Shipping.exe' OR Name='WNT1922.exe' OR Name='UnrealEditor.exe'\" | Select-Object ProcessId,ExecutablePath,CommandLine | ConvertTo-Json -Compress"],{windowsHide:true,timeout:5000});
const processRows=JSON.parse(stdout.trim()||'null');
const live=(Array.isArray(processRows)?processRows:processRows?[processRows]:[]).map(row=>({...row,profile:profile(row.CommandLine)})).filter(row=>row.profile);
assert.equal(live.length,1,'Exactly one opted-in Unreal process must match the explicit port and disposable .build profile.');
const owner=live[0],reportPath=option('--package-report')?path.resolve(option('--package-report')):null;
let packageReport;
if(reportPath){
 packageReport=JSON.parse((await fs.readFile(reportPath,'utf8')).replace(/^\uFEFF/,''));
 assert(packageReport.passed===true&&packageReport.kind==='extracted-native-package'&&packageReport.configuration==='Shipping','The supplied package report must be a passed extracted Shipping run.');
 assert(owner.ExecutablePath&&samePath(owner.ExecutablePath,packageReport.executablePath)&&samePath(owner.profile.saveDirectory,packageReport.saveDirectory),'Live process identity and isolated save directory must match the supplied report.');
 assert(samePath(owner.profile.userDirectory,path.join(path.dirname(reportPath),'userdata')),'Live user profile must belong to the supplied package run.');
}
const captureDir=path.resolve(option('--capture-dir')||path.join(owner.profile.userDirectory,'Saved','Screenshots'));
assert(inside(path.join(root,'.build'),captureDir)||inside(path.join(root,'unreal','Saved'),captureDir),'Native capture directory must be a local test-output directory for this workspace.');
const bundled=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'));
let playwright;try{playwright=createRequire(import.meta.url)('playwright');}catch{playwright=bundled('playwright');}
let sharp;try{sharp=bundled('sharp');}catch{}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const camera=d=>Object.fromEntries(['instanceId','zoom','longitude','latitude','tilt','yaw','centralMeridian'].map(key=>[key,d[key]]));
const counts=d=>Object.fromEntries(['primitiveComponentCount','shipActorCount','terrainTileCount'].map(key=>[key,d[key]]));
const longitudeDelta=(a,b)=>((a-b+540)%360+360)%360-180;
const campaignPayload=state=>{const {savedAt,...payload}=state;return payload;};
const result={format:1,kind:'native-equal-earth-capture-diagnostic',captureChecksPassed:false,visualVerified:false,flickerCertified:false,
 startedAt:new Date().toISOString(),endpoint:'http://127.0.0.1:'+port,sourceProcessId:owner.ProcessId,
 processExecutable:owner.ExecutablePath,saveDirectory:owner.profile.saveDirectory,packageReport:reportPath,
 archiveSha256:packageReport?.archiveSha256,captures:[],checks:[],metrics:[],errors:[],limitations:[
  'Nine native Unreal GPU captures include the actual HTML interface. These are not browser-only screenshots or viewport emulation.',
  'Coastline alignment, Antarctica coverage, icon readability and temporal appearance require human review; diagnostics alone cannot approve them.',
  'Three sequential small-pan captures are not a continuous frame recording and cannot certify absence of flicker.',
  'Selected-marker diagnostics report actor/mesh-section visibility, not frustum visibility. The force is centered at its saved geographic anchor and the central marker XY is checked against Equal Earth before the image. Ray-tested targets can omit a fleet beneath another co-located force or port, or the bounded 24-target list.',
  'Normal Save is used before and after. savedAt and rotating disk backups can change; the full serialized campaign payload, including RNG, fleets, orders, resources and time, must remain identical.',
  'No runtime fixture, campaign packet, model, material, save envelope or projection is injected or replaced.',
 ]};
await fs.mkdir(output,{recursive:true});
let browser,page,initial,initialState,initialClock,initialScroll,deadline=Date.now()+150000,phase='connect',selectionChanged=false;
async function until(read,accept,label,timeout=8000){
 const end=Math.min(deadline,Date.now()+timeout);let last;
 do{last=await read();if(accept(last))return last;await delay(65);}while(Date.now()<end);
 throw Error('Timed out '+label+' during '+phase+'; last='+JSON.stringify(last).slice(0,900));
}
async function input(action,values={}){
 await page.evaluate(({action,values})=>ue.wnt.sceneinput(JSON.stringify({action,...values,instanceId:__wntEqualEarthEvidence.latest?.instanceId||''})),{action,values});
}
async function diagnostics(){
 const before=await page.evaluate(()=>__wntEqualEarthEvidence.sequence);await input('diagnostics');
 const d=await until(()=>page.evaluate(after=>__wntEqualEarthEvidence.sequence>after?__wntEqualEarthEvidence.latest:null,before),Boolean,'native diagnostics');
 assert.equal(d.mode,'world');assert.equal(d.renderer,'Unreal Engine native UWorld');assert.equal(d.nativeWorldInitialized,true);
 assert.equal(d.modelLoadErrors,0,'All existing ship models must remain free of load errors');
 assert.equal(d.detailedModelCount+d.deferredModelCount+d.pendingModelCount,d.shipActorCount,'Every ship has an explicit model residency state');
 assert(['primitiveComponentCount','shipActorCount','terrainTileCount','centralMeridian','yaw','tilt'].every(key=>Number.isFinite(d[key])),'Expected native camera and component diagnostics are required');
 return d;
}
async function pausedClock(){
 const state=await page.evaluate(()=>({paused:!!document.querySelector('.actual-speed.is-paused'),clock:document.querySelector('.campaign-clock')?.textContent||null}));
 assert(state.paused&&state.clock,'An already-paused campaign is required; this verifier never changes speed');return state.clock;
}
async function readSave(){
 return page.evaluate(async()=>{const r=await fetch('/api/save');if(!r.ok)throw Error('A pre-existing disposable campaign save is required: '+r.status);return r.json();});
}
async function save(){
 const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/save'&&r.request().method()==='POST');
 await page.locator('.sidebar [data-action="save"]').click();assert.equal((await response).status(),200);
 const state=await readSave();assert.equal(state.paused,true);return state;
}
async function focus(longitude,latitude,zoom){
 await input('focus',{longitude,latitude,zoom});
 const d=await until(diagnostics,d=>Math.abs(d.zoom-zoom)<.0001&&Math.abs(longitudeDelta(d.centralMeridian,longitude))<.0001,'geographic focus');
 assert.equal(d.yaw,0);assert.equal(d.tilt,0);await delay(180);return d;
}
async function capture(name,details={}){
 assert(result.captures.length<9,'Capture budget is nine native images');assert(Date.now()<deadline,'Capture time budget exceeded');
 const nativeName='ee-'+stamp+'-'+name;assert(nativeName.length<=80&&/^[a-z0-9-]+$/.test(nativeName));
 const source=path.join(captureDir,nativeName+'.png'),old=await fs.stat(source).catch(()=>null),requestedAt=new Date().toISOString();
 await input('capture',{name:nativeName,includeUI:true});
 await until(()=>fs.stat(source).catch(()=>null),s=>s?.size>1000&&(!old||s.mtimeMs>old.mtimeMs),'fresh native GPU capture '+name,12000);
 const png=await until(()=>fs.readFile(source).catch(()=>null),b=>b&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&b.subarray(-8,-4).toString()==='IEND','complete PNG '+name);
 const d=await diagnostics();assert.equal(png.readUInt32BE(16),d.viewportWidth);assert.equal(png.readUInt32BE(20),d.viewportHeight);
 assert.equal(await pausedClock(),initialClock,'No capture may advance the campaign');
 const file=path.join(output,name+'.png');await fs.writeFile(file,png);
 const row={name,file,source,kind:'native-Unreal-GPU-with-UI',requestedAt,completedAt:new Date().toISOString(),sha256:hash(png),width:d.viewportWidth,height:d.viewportHeight,diagnostics:d,...details};
 result.captures.push(row);return row;
}
async function fleetRow(id){
 const rows=page.locator('.fleet-command-row');
 for(let i=0;i<await rows.count();i++)if(await rows.nth(i).getAttribute('data-id')===id)return rows.nth(i);
 throw Error('Own fleet has no outliner row: '+id);
}
async function clearPoint(){
 return page.evaluate(()=>{
  const d=__wntEqualEarthEvidence.latest,r=d.viewRect,x=(r.x+r.width*.5)*innerWidth,y=(r.y+r.height*.5)*innerHeight;
  if(![-30,0,30].every(dx=>document.elementFromPoint(x+dx,y)?.matches('.native-world-input')))throw Error('A clear native map area is required for the right-drag check');
  return{x,y};
 });
}
try{
 browser=await playwright.chromium.connectOverCDP(result.endpoint,{timeout:6000});
 const pages=browser.contexts().flatMap(c=>c.pages()).filter(p=>{try{const u=new URL(p.url());return ['127.0.0.1','localhost'].includes(u.hostname)&&u.searchParams.get('unreal')==='1';}catch{return false;}});
 assert.equal(pages.length,1,'Exactly one local native-game CEF page is required');page=pages[0];page.setDefaultTimeout(7000);
 assert.equal(await page.locator('.native-world-input').count(),1,'Start on the command map');
 assert.equal(await page.locator('.modal-backdrop,.menu-popup').count(),0,'Start with no open dialog or menu');
 const origin=new URL(page.url()).origin;
 page.on('pageerror',e=>result.errors.push({phase,kind:'javascript',message:e.message}));
 page.on('request',request=>{if(/^https?:/.test(request.url())&&new URL(request.url()).origin!==origin)result.errors.push({phase,kind:'external-request',url:request.url()});});
 initialClock=await pausedClock();await readSave();
 initialScroll=await page.evaluate(()=>[...document.querySelectorAll('.sidebar,.command-side-panel,[data-scroll-key]')].map(n=>({selector:n.dataset.scrollKey?'[data-scroll-key="'+CSS.escape(n.dataset.scrollKey)+'"]':n.matches('.sidebar')?'.sidebar':'.command-side-panel',top:n.scrollTop,left:n.scrollLeft})));
 await page.evaluate(()=>{
  if(globalThis.__wntEqualEarthEvidence)throw Error('An Equal Earth observer is already installed');
  const old=WNTUnreal.receive,d=globalThis.__wntEqualEarthEvidence={latest:null,sequence:0,errors:[],old,hook:null};
  d.hook=function(event){if(event.type==='diagnostics'){d.latest=structuredClone(event);d.sequence++;}if(event.type==='error')d.errors.push(structuredClone(event));return Reflect.apply(old,this,[event]);};WNTUnreal.receive=d.hook;
 });
 initial=await diagnostics();result.initialDiagnostics=initial;
 assert(Math.abs(initial.zoom-initial.targetZoom)<.0001,'Wait for the initial camera animation to finish');
 initialState=await save();
 const forces=await page.evaluate(async state=>{
  const [{buildUnrealScenePacket},{CATALOG},{contentFor}]=await Promise.all([import('/ui/unreal-scene-packet.mjs'),import('/worker/catalog-loader.mjs'),import('/mechanics/campaign-content.mjs')]);
  return buildUnrealScenePacket(state,contentFor(CATALOG,state)).forces.filter(f=>!f.merchant&&f.position?.every(Number.isFinite)).map(f=>({id:f.id,position:f.position,docked:f.docked}));
 },initialState);
 assert(forces.length>0,'The disposable campaign needs at least one own fleet');
 const selectedIds=initial.chart?.selectedForceIds;assert(Array.isArray(selectedIds),'Native selection diagnostics are required');
 assert(selectedIds.length<=1&&selectedIds.every(id=>forces.some(f=>f.id===id)),'Start with no selection or one own fleet; this permits exact selection restoration through existing controls');
 result.campaignBefore={sha256:hash(JSON.stringify(campaignPayload(initialState))),day:initialState.day,minuteTicks:initialState.minuteTicks,player:initialState.player,savedAt:initialState.savedAt};

 phase='strategic shared icons and selection';
 const force=forces.find(f=>f.id===selectedIds[0])||forces.find(f=>!f.docked)||forces[0];assert(force.position?.length===2&&force.position.every(Number.isFinite));
 await focus(force.position[0],force.position[1],8);
 const before=await diagnostics();await (await fleetRow(force.id)).click();selectionChanged=true;
 const chosen=await until(diagnostics,d=>d.chart.selectedForceIds.length===1&&d.chart.selectedForceIds[0]===force.id&&d.chart.selectedMarkers.some(m=>m.forceId===force.id&&m.visible&&m.highlightVisible),'actual selected fleet mesh section');
 assert.deepEqual(camera(chosen),camera(before),'Single fleet selection must not move or fit the camera');
 const target=chosen.targets.find(t=>t.kind==='fleet'&&t.id===force.id&&t.visible);
 const centralMarker=chosen.chart.selectedMarkers.find(m=>m.forceId===force.id&&m.worldCopy===0);
 assert(centralMarker?.visible&&centralMarker.highlightVisible,'The central selected marker mesh section must be visible');
 assert(Math.abs(longitudeDelta(chosen.longitude,force.position[0]))<.0001&&Math.abs(chosen.latitude-force.position[1])<.0001,'The selected force must be at the overhead camera focus before capturing its bracket');
 const expectedXY=await page.evaluate(async({position,meridian})=>{const {equalEarth}=await import('/ui/projection.mjs');const [x,y]=equalEarth(position,meridian);return[(300-y)/210*637100000,(x-600)/210*637100000];},{position:force.position,meridian:chosen.centralMeridian});
 assert(centralMarker.position.slice(0,2).every((value,index)=>Math.abs(value-expectedXY[index])<5),'The actual native marker XY must match its saved geographic point under Equal Earth within 5 cm');
 assert(centralMarker.pixels>0&&centralMarker.pixels<=64,'The centered native marker must retain a bounded readable screen size');
 if(force.docked)assert(chosen.chart.selectedMarkers.filter(m=>m.highlightVisible).every(m=>!m.glyphVisible&&!m.collisionEnabled),'A docked selection bracket must not cover its port with a filled glyph or intercept clicks');
 const legend=await page.locator('[data-chart-symbol]').evaluateAll(nodes=>[...new Set(nodes.map(n=>n.dataset.chartSymbol))]);
 const symbols=await page.evaluate(async()=>{const {MAP_SYMBOLS}=await import('/ui/map-symbols.mjs');return MAP_SYMBOLS;});
 for(const kind of [...Object.keys(symbols.symbols),'selection'])assert(legend.includes(kind),'Shared legend must include '+kind);
 assert(chosen.chart.selectedMarkers.filter(m=>m.highlightVisible).every(m=>m.color===symbols.selection.color&&/M_ChartSymbol/.test(m.material)),'Native brackets must use the shared selection palette and depth-safe chart material');
 await page.mouse.move(1,1);await delay(250);
 await capture('strategic-selected-fleet',{group:'symbols',force,selectedTarget:target||null,centralMarker,expectedMarkerXY:expectedXY,legendKinds:legend,fitActionUsed:false});
 result.checks.push('A single outliner click selects one strategic fleet without moving the camera. Its actual native marker matches the saved Equal Earth position at camera focus, and the UI legend/native bracket use the shared symbol specification.');

 phase='Antarctica beneath South America';
 for(const longitude of [-70,-110]){
  await focus(longitude,-50,2);
  await capture('antarctica-south-america-'+Math.abs(longitude),{group:'antarctica-south-america',requestedFocus:{longitude,latitude:-50,zoom:2},review:'Antarctica must remain below South America without holes, cutoff bands or mismatched coastline copies as the central meridian changes.'});
 }
 phase='southern dateline meridians';
 for(const [name,longitude] of [['east',150],['west',-150],['seam',-179.7]]){
  await focus(longitude,-58,2.5);
  await capture('antarctica-dateline-'+name,{group:'antarctica-dateline',requestedFocus:{longitude,latitude:-58,zoom:2.5},review:'Inspect the southern ocean and Antarctic coast across the ±180° seam; compare neighboring tile/shoreline continuity and repeated-map copies.'});
 }

 phase='continuous small right-drag pans';
 const baseline=await diagnostics();let previous=baseline;
 for(let step=1;step<=3;step++){
  const point=await clearPoint();await page.mouse.move(point.x,point.y);await page.mouse.down({button:'right'});
  await page.mouse.move(point.x+18,point.y,{steps:8});await page.mouse.up({button:'right'});
  const d=await until(diagnostics,d=>Math.abs(longitudeDelta(d.longitude,previous.longitude))>.0001,'right-drag geographic movement');
  assert(Math.abs(longitudeDelta(d.longitude,previous.longitude))<20,'A short pan must not jump to another map copy');
  assert(Math.abs(longitudeDelta(d.centralMeridian,d.longitude))<.0001,'Equal Earth central meridian must follow the camera continuously');
  assert.equal(d.zoom,baseline.zoom);assert.equal(d.yaw,0);assert.equal(d.tilt,0);
  assert.deepEqual(counts(d),counts(baseline),'Panning must not create or remove primitive components, terrain tiles or ship actors');
  const row=await capture('dateline-small-pan-'+step,{group:'temporal-pan',step,requestedPanPixels:[18,0],beforeCamera:camera(previous),afterCamera:camera(d)});
  assert.deepEqual(counts(row.diagnostics),counts(baseline),'Native GPU capture must not conceal component growth during panning');
  previous=d;
 }
 assert(baseline.longitude<0&&previous.longitude>0,'The three small pans must actually cross the longitude seam');
 result.metrics.push({kind:'stable-native-pan-components',baseline:counts(baseline),final:counts(previous),startCamera:camera(baseline),endCamera:camera(previous),steps:3});
 result.checks.push('Three real right-drag pans cross the dateline with the central meridian following focus, no strategic tilt/yaw, no actor/component growth and zero native model load errors.');
 assert.equal(await pausedClock(),initialClock);
 result.errors.push(...await page.evaluate(()=>__wntEqualEarthEvidence.errors));assert.deepEqual(result.errors,[]);
 result.captureChecksPassed=true;
}catch(error){result.failure={phase,message:error.message,stack:error.stack};process.exitCode=1;}
finally{
 deadline=Date.now()+18000;phase='restore';
 if(page&&initial)try{
  await page.mouse.up({button:'right'});
  if(selectionChanged){
   if(initial.chart.selectedForceIds.length)await (await fleetRow(initial.chart.selectedForceIds[0])).click();
   else await input('selectBox',{x0:0,y0:0,x:0,y:0}); // Degenerate box outside the command-map viewport emits the supported empty selection.
   await until(diagnostics,d=>JSON.stringify(d.chart.selectedForceIds)===JSON.stringify(initial.chart.selectedForceIds),'original fleet selection');
  }
  await input('focus',{longitude:initial.longitude,latitude:initial.latitude,zoom:initial.zoom});
  let restored=await until(diagnostics,d=>Math.abs(d.zoom-initial.zoom)<.0001,'original camera zoom');
  if(initial.orbitEnabled&&(Math.abs(initial.requestedYaw-restored.requestedYaw)>.0001||Math.abs(initial.requestedTilt-restored.requestedTilt)>.0001)){
   await input('tilt',{dx:-(initial.requestedYaw-restored.requestedYaw)/.3,dy:(initial.requestedTilt-restored.requestedTilt)/.25});
  }
  restored=await until(diagnostics,d=>Math.abs(longitudeDelta(d.longitude,initial.longitude))<.0001&&Math.abs(d.latitude-initial.latitude)<.0001&&Math.abs(d.zoom-initial.zoom)<.0001&&Math.abs(d.yaw-initial.yaw)<.001&&Math.abs(d.tilt-initial.tilt)<.001,'exact original camera');
  assert.deepEqual(restored.viewRect,initial.viewRect,'Native viewport rectangle remains unchanged');
  result.restoration={passed:true,camera:camera(restored),selectedForceIds:restored.chart.selectedForceIds,viewRect:restored.viewRect};
 }catch(error){result.restoration={passed:false,error:error.stack};result.captureChecksPassed=false;process.exitCode=1;}
 if(page&&initialState)try{
  assert.equal(await pausedClock(),initialClock);const after=await save();
  assert.deepEqual(campaignPayload(after),campaignPayload(initialState),'The entire campaign, not only the visible clock, must remain unchanged');
  result.campaignAfter={sha256:hash(JSON.stringify(campaignPayload(after))),day:after.day,minuteTicks:after.minuteTicks,player:after.player,savedAt:after.savedAt};
  result.restoration={...result.restoration,campaignPreserved:true,campaignClock:initialClock};
  result.checks.push('Normal Save/read round-trip verifies unchanged full campaign payload, RNG, orders, fleets, resources and time; only savedAt is excluded.');
 }catch(error){result.restoration={...result.restoration,passed:false,campaignPreserved:false,preservationError:error.stack};result.captureChecksPassed=false;process.exitCode=1;}
 if(page)try{await page.evaluate(rows=>{for(const row of rows){const n=document.querySelector(row.selector);if(n){n.scrollTop=row.top;n.scrollLeft=row.left;}}const d=globalThis.__wntEqualEarthEvidence;if(d&&WNTUnreal.receive===d.hook)WNTUnreal.receive=d.old;delete globalThis.__wntEqualEarthEvidence;},initialScroll||[]);}catch{}
}
if(sharp&&result.captures.length)try{
 const width=600,height=350,tiles=[];
 for(const row of result.captures){
  const label=Buffer.from('<svg width="600" height="26"><rect width="600" height="26" fill="#192932"/><text x="8" y="18" font-family="sans-serif" font-size="13" fill="white">'+row.name+'</text></svg>');
  tiles.push(await sharp({create:{width,height,channels:3,background:'#192932'}}).composite([{input:await sharp(row.file).resize(width,height-26,{fit:'contain',background:'#192932'}).png().toBuffer(),left:0,top:26},{input:label,left:0,top:0}]).png().toBuffer());
 }
 const file=path.join(output,'equal-earth-contact-sheet.png');await sharp({create:{width:width*3,height:height*Math.ceil(tiles.length/3),channels:3,background:'#142029'}}).composite(tiles.map((input,index)=>({input,left:(index%3)*width,top:Math.floor(index/3)*height}))).png().toFile(file);result.contactSheet=file;
}catch(error){result.contactSheetError=error.stack;}
result.finishedAt=new Date().toISOString();result.gameLeftRunning=true;
const resultPath=path.join(output,'result.json');await fs.writeFile(resultPath,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({captureChecksPassed:result.captureChecksPassed,visualVerified:false,captures:result.captures.length,report:resultPath,contactSheet:result.contactSheet,restoration:result.restoration,failure:result.failure},null,2));
// Disconnect by ending this observer. Do not send Browser.close or native close.
process.exit(result.captureChecksPassed?0:1);
