// Bounded GPU evidence from an already-running disposable Shipping package.
// Never launches, reloads, ticks, changes worker state, or closes the game.
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
 console.log('Usage: node tools/verify-unreal-map-style.mjs --package-report=<passed Shipping package-test.json> --debug-port=9333 --confirm-isolated-session [--output=<directory inside package run>]\nRequires exclusive CDP access to that already-running disposable process, paused on the command map. At most four native GPU+UI captures cover global geography, European borders and land-front linework. If the saved campaign has no active front, a conspicuously labeled, presentation-only France corridor at 50% is sent using the packaged packet builder. It never enters worker state. Restores the exact retained native packet identity/revision, selection and camera, and compares full normal-save payloads excluding only savedAt. No launch, reload, tick, model change or campaign replacement. Appearance needs human review.');
 process.exit(0);
}
assert(args.includes('--confirm-isolated-session'),'Explicit --confirm-isolated-session is required; never use a normal player session.');
assert(option('--package-report'),'An explicit passed extracted-package report is required.');
const port=Number(option('--debug-port'));
assert(Number.isInteger(port)&&port>0&&port<=65535,'Pass an explicit local CEF debug port.');
const reportPath=path.resolve(option('--package-report'));
const packageReport=JSON.parse((await fs.readFile(reportPath,'utf8')).replace(/^\uFEFF/,''));
assert(packageReport.passed===true&&packageReport.kind==='extracted-native-package'&&packageReport.configuration==='Shipping','A passed extracted Shipping package report is required.');
const run=path.dirname(reportPath),stamp=new Date().toISOString().replace(/[-:.TZ]/g,'');
const output=path.resolve(option('--output')||path.join(run,'map-style-review-'+stamp)),captureDir=path.join(run,'userdata','Saved','Screenshots');
const inside=(base,file)=>{const relative=path.relative(base,path.resolve(file));return relative!==''&&relative!=='..'&&!relative.startsWith('..'+path.sep)&&!path.isAbsolute(relative);};
assert(inside(path.join(root,'.build'),run)&&inside(run,packageReport.executablePath)&&inside(run,packageReport.saveDirectory),'The reported executable, user and save directories must belong to an isolated workspace .build run.');
assert(inside(run,output),'Capture output must stay inside the isolated package run.');
const samePath=(a,b)=>path.resolve(a).toLowerCase()===path.resolve(b).toLowerCase();
const commandOption=(command,name)=>command.match(new RegExp('(?:^|\\s)"?-'+name+'=(?:"([^"\\r\\n]+)"|([^"\\s]+))','i'))?.slice(1).find(Boolean);
function validCommand(command){
 return /(?:^|\s)-WNTAutomation(?:\s|$)/i.test(command||'')&&Number(commandOption(command,'cefdebug'))===port
  &&samePath(commandOption(command,'WNTSaveDir')||'.',packageReport.saveDirectory)
  &&samePath(commandOption(command,'UserDir')||'.',path.join(run,'userdata'));
}
assert(validCommand(packageReport.processCommandLine),'Report must specify opted-in automation/CDP and isolated user/save folders.');
const {stdout}=await promisify(execFile)('powershell.exe',['-NoProfile','-NonInteractive','-Command',
 "Get-CimInstance Win32_Process -Filter \"Name='WNT1922-Win64-Shipping.exe'\" | Select-Object ProcessId,ExecutablePath,CommandLine | ConvertTo-Json -Compress"],{windowsHide:true,timeout:5000});
const processes=JSON.parse(stdout.trim()||'null');
const live=(Array.isArray(processes)?processes:processes?[processes]:[]).filter(p=>p.ExecutablePath&&samePath(p.ExecutablePath,packageReport.executablePath)&&validCommand(p.CommandLine));
assert.equal(live.length,1,'Exactly one live opted-in process must match the isolated package executable and directories.');
const bundled=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'));
let playwright;try{playwright=createRequire(import.meta.url)('playwright');}catch{playwright=bundled('playwright');}
let sharp;try{sharp=bundled('sharp');}catch{}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const payload=state=>{const {savedAt,...rest}=state;return rest;};
const longitudeDelta=(a,b)=>((a-b+540)%360+360)%360-180;
const sorted=ids=>[...ids].sort();
const result={format:1,kind:'native-map-style-capture-diagnostic',captureChecksPassed:false,visualVerified:false,flickerCertified:false,
 startedAt:new Date().toISOString(),packageReport:reportPath,archiveSha256:packageReport.archiveSha256,
 sourceProcessId:live[0].ProcessId,endpoint:'http://127.0.0.1:'+port,captures:[],checks:[],errors:[],limitations:[
  'Native Unreal GPU screenshots include the real HTML interface; these are not browser-only screenshots or viewport emulation.',
  'Country-border clarity, polar continuity, symbol readability and front clipping require human image review. Still images cannot certify absence of flicker.',
  'The front fixture, when needed, is presentation-only and visibly labeled. Its catalog corridor is strategic campaign progress, not individual troop positions or an actual current war.',
  'The fixture tests the packaged scene-packet-to-native-terrain contract. It does not fabricate worker campaign fronts or claim a current-campaign front popup was tested.',
  'Packet restoration retains the observed scene instance/revision and its latest full packet plus current selection patch. Native diagnostics confirm restored selection/front counts; they do not expose a raw packet for independent byte-for-byte readback.',
  'Normal Save is used before and after. savedAt and rotating disk backups can change; the complete campaign payload must otherwise be identical.',
 ]};
await fs.mkdir(output,{recursive:true});
let browser,page,initial,initialState,initialClock,initialScroll,packetSnapshot,fixtureSent=false;
let deadline=Date.now()+100000,phase='connect';
async function until(read,accept,label,timeout=7000){
 const end=Math.min(deadline,Date.now()+timeout);let last;
 do{last=await read();if(accept(last))return last;await delay(55);}while(Date.now()<end);
 throw Error('Timed out '+label+' in '+phase+'; last='+JSON.stringify(last).slice(0,700));
}
async function input(action,values={}){
 await page.evaluate(({action,values})=>ue.wnt.sceneinput(JSON.stringify({action,...values,instanceId:__wntMapStyleEvidence.latest?.instanceId||''})),{action,values});
}
async function diagnostics(){
 const before=await page.evaluate(()=>__wntMapStyleEvidence.sequence);await input('diagnostics');
 const d=await until(()=>page.evaluate(after=>__wntMapStyleEvidence.sequence>after?__wntMapStyleEvidence.latest:null,before),Boolean,'native diagnostics');
 assert.equal(d.mode,'world');assert.equal(d.renderer,'Unreal Engine native UWorld');assert.equal(d.nativeWorldInitialized,true);
 assert.equal(d.chart?.renderer,'screen-vector');assert.equal(d.modelLoadErrors,0);
 const style=d.chart.mapStyle;assert(style&&style.countryBorderSegments>0&&style.coastlineSegments>0,'Native country borders and coastlines must exist');
 assert(style.terrainComponents>0&&style.terrainComponents<=style.terrainComponentBudget&&style.terrainComponentBudget<=216,'Terrain must retain the coalesced component budget');
 return d;
}
async function clock(){
 const state=await page.evaluate(()=>({paused:!!document.querySelector('.actual-speed.is-paused'),clock:document.querySelector('.campaign-clock')?.textContent||null}));
 assert(state.paused&&state.clock,'An already-paused campaign is required; this verifier never changes speed');return state.clock;
}
async function save(){
 const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/save'&&r.request().method()==='POST');
 await page.locator('.sidebar [data-action="save"]').click();assert.equal((await response).status(),200);
 const state=await page.evaluate(async()=>{const r=await fetch('/api/save');if(!r.ok)throw Error('Save read failed: '+r.status);return r.json();});
 assert.equal(state.paused,true);return state;
}
async function focus(longitude,latitude,zoom){
 await input('focus',{longitude,latitude,zoom});
 const d=await until(diagnostics,d=>Math.abs(d.zoom-zoom)<.0001&&Math.abs(longitudeDelta(d.centralMeridian,longitude))<.0001,'geographic focus');
 assert.equal(d.yaw,0);assert.equal(d.tilt,0);await delay(200);return d;
}
async function capture(name,details={}){
 assert(result.captures.length<4&&Date.now()<deadline,'Bounded capture budget exceeded');
 const nativeName='style-'+stamp+'-'+name,source=path.join(captureDir,nativeName+'.png');
 assert(nativeName.length<=80&&/^[a-z0-9-]+$/.test(nativeName));
 const old=await fs.stat(source).catch(()=>null),requestedAt=new Date().toISOString();
 await page.mouse.move(1,1);await input('capture',{name:nativeName,includeUI:true});
 await until(()=>fs.stat(source).catch(()=>null),s=>s?.size>1000&&(!old||s.mtimeMs>old.mtimeMs),'fresh native capture '+name,9000);
 const png=await until(()=>fs.readFile(source).catch(()=>null),b=>b&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&b.subarray(-8,-4).toString()==='IEND','complete PNG '+name);
 const d=await diagnostics();assert.equal(png.readUInt32BE(16),d.viewportWidth);assert.equal(png.readUInt32BE(20),d.viewportHeight);
 assert.equal(await clock(),initialClock,'Capture must not advance the campaign');
 assert.deepEqual(sorted(d.chart.selectedForceIds),sorted(initial.chart.selectedForceIds),'Captures must preserve native selection');
 const file=path.join(output,name+'.png');await fs.writeFile(file,png);
 const row={name,file,source,kind:'native-Unreal-GPU-with-UI',requestedAt,sha256:hash(png),width:d.viewportWidth,height:d.viewportHeight,diagnostics:d,...details};
 result.captures.push(row);return row;
}
try{
 browser=await playwright.chromium.connectOverCDP(result.endpoint,{timeout:5000});
 const pages=browser.contexts().flatMap(c=>c.pages()).filter(p=>{try{const u=new URL(p.url());return ['127.0.0.1','localhost'].includes(u.hostname)&&u.searchParams.get('unreal')==='1';}catch{return false;}});
 assert.equal(pages.length,1,'Exactly one local Unreal CEF page is required');page=pages[0];page.setDefaultTimeout(6000);
 assert.equal(await page.locator('.native-world-input').count(),1,'Start on the command map');
 assert.equal(await page.locator('.modal-backdrop,.menu-popup').count(),0,'Start with no open dialog or menu');
 initialClock=await clock();
 const origin=new URL(page.url()).origin;
 page.on('pageerror',error=>result.errors.push({phase,kind:'javascript',message:error.message}));
 page.on('request',request=>{if(/^https?:/.test(request.url())&&new URL(request.url()).origin!==origin)result.errors.push({phase,kind:'external-request',url:request.url()});});
 initialScroll=await page.evaluate(()=>[...document.querySelectorAll('.sidebar,.command-side-panel,[data-scroll-key]')].map(n=>({selector:n.dataset.scrollKey?'[data-scroll-key="'+CSS.escape(n.dataset.scrollKey)+'"]':n.matches('.sidebar')?'.sidebar':'.command-side-panel',top:n.scrollTop,left:n.scrollLeft})));
 await page.evaluate(async()=>{
  if(globalThis.__wntMapStyleEvidence)throw Error('A map-style observer is already installed');
  const {UnrealWorldScene}=await import('/ui/unreal-scene.mjs');
  const proto=UnrealWorldScene.prototype,own=Object.getOwnPropertyDescriptor(proto,'activate'),activate=proto.activate;
  const old=WNTUnreal.receive,d=globalThis.__wntMapStyleEvidence={latest:null,sequence:0,errors:[],old,proto,own,activate,scene:null};
  d.hook=function(event){if(event.type==='diagnostics'){d.latest=structuredClone(event);d.sequence++;}if(event.type==='error')d.errors.push(structuredClone(event));return Reflect.apply(old,this,[event]);};WNTUnreal.receive=d.hook;
  d.activateHook=function(...args){if(this.canvas?.isConnected)d.scene=this;return Reflect.apply(activate,this,args);};proto.activate=d.activateHook;
  // Observe the existing active instance without changing size or selection.
  window.dispatchEvent(new Event('resize'));
  if(!d.scene)throw Error('The existing native scene could not be observed safely');
 });
 initial=await diagnostics();result.initialDiagnostics=initial;
 assert(Math.abs(initial.zoom-initial.targetZoom)<.0001,'Wait for the initial camera animation to finish');
 initialState=await save();await fs.writeFile(path.join(output,'campaign-before.json'),JSON.stringify(initialState,null,2)+'\n');
 packetSnapshot=await page.evaluate(async saved=>{
  const d=__wntMapStyleEvidence,scene=d.scene;
  const {buildUnrealScenePacket,buildUnrealSelectionPacket}=await import('/ui/unreal-scene-packet.mjs');
  if(!scene.packet||scene.packet.revision!==scene.worldRevision||scene.packet.instanceId!==d.latest.instanceId||!scene.state.paused)throw Error('Cannot preserve exact native packet identity and revision');
  const selection=scene.selection(),patch=buildUnrealSelectionPacket(scene.state,scene.rows,selection);
  const original=structuredClone(scene.packet);original.selectedForceIds=patch.selectedForceIds;
  if(patch.route)original.route=patch.route;else if(original.route)delete original.route;
  const rebuilt=buildUnrealScenePacket(saved,scene.content,scene.rows,{rows:scene.rows,...selection,animate:scene.packet.animate});
  Object.assign(rebuilt,{instanceId:scene.instanceId,revision:scene.worldRevision});
  if(original.at!==rebuilt.at||original.campaign!==rebuilt.campaign||original.player!==rebuilt.player||!original.paused)throw Error('Saved state and displayed packet are not the same paused campaign');
  d.originalPacket=original;d.originalPacketJSON=JSON.stringify(original);d.savedPacket=rebuilt;
  return {original,rebuilt,instanceId:scene.instanceId,revision:scene.worldRevision};
 },initialState);
 assert.deepEqual(sorted(packetSnapshot.original.selectedForceIds),sorted(initial.chart.selectedForceIds),'Observed scene selection must match native selection');
 result.packetBefore={instanceId:packetSnapshot.instanceId,revision:packetSnapshot.revision,sha256:hash(JSON.stringify(packetSnapshot.original))};
 result.campaignBefore={sha256:hash(JSON.stringify(payload(initialState))),savedAt:initialState.savedAt};
 await fs.writeFile(path.join(output,'native-packet-before.json'),JSON.stringify(packetSnapshot.original,null,2)+'\n');

 phase='global geography and symbols';await focus(0,0,1);await capture('global-poles-symbols',{review:'Inspect poles, wrapped coastline continuity, political palette and screen-vector icons.'});
 phase='European borders';await focus(10,49,8);await capture('europe-country-borders',{review:'Inspect country boundaries against Alps, coastlines and political colors; no synthetic front has been sent yet.'});
 phase='campaign front linework';
 const frontSetup=await page.evaluate(async()=>{
  const d=__wntMapStyleEvidence;
  if(d.savedPacket.fronts.length)return {fixture:false,front:d.savedPacket.fronts[0]};
  const [{CAMPAIGNS},{campaignMapFronts}]=await Promise.all([import('/mechanics/land-war.mjs'),import('/ui/unreal-scene-packet.mjs')]);
  const source=CAMPAIGNS.find(front=>front.id==='france');if(!source)throw Error('Packaged France campaign corridor is missing');
  const front=campaignMapFronts({world:{fronts:[{...structuredClone(source),progress:.5,status:'Diagnostic progress',name:'DIAGNOSTIC ONLY: France corridor at 50%'}]}})[0];
  if(!front||!front.territories.includes('c220'))throw Error('Packaged front helper did not retain the France territory geometry');
  d.fixturePacket=structuredClone(d.savedPacket);d.fixturePacket.fronts=[front];
  const label=document.createElement('div');label.id='wnt-map-style-diagnostic-label';label.textContent='DIAGNOSTIC PRESENTATION ONLY — France corridor 50% — no current campaign war or troop positions';
  Object.assign(label.style,{position:'fixed',left:'50%',top:'165px',transform:'translateX(-50%)',zIndex:99999,padding:'8px 14px',background:'#351c13',color:'#ffe1a6',border:'2px solid #e68e70',font:'bold 15px sans-serif',pointerEvents:'none'});document.body.append(label);
  return {fixture:true,front,packet:d.fixturePacket};
 });
 if(frontSetup.fixture){
  fixtureSent=true;await page.evaluate(packet=>ue.wnt.world(JSON.stringify(packet)),frontSetup.packet);
  await focus(2,48,8);
 }else await focus(frontSetup.front.position[0],frontSetup.front.position[1],8);
 const withFront=await until(diagnostics,d=>d.chart.mapStyle.campaignFrontSegments>0,'native clipped front geometry');
 result.frontEvidence={fixture:frontSetup.fixture,front:frontSetup.front,mapStyle:withFront.chart.mapStyle};
 await capture(frontSetup.fixture?'diagnostic-france-progress-50':'active-campaign-front',{fixture:frontSetup.fixture,front:frontSetup.front,review:'Inspect the progress cross-section clipped to recorded territory; diagnostic presentation is not current campaign state.'});
 result.checks.push('Prepared country/coastline geometry exists within 216 terrain components; all captures use screen-vector chart rendering.','Packaged front serialization produces native clipped line geometry with campaignFrontSegments > 0.');
 result.errors.push(...await page.evaluate(()=>__wntMapStyleEvidence.errors));assert.deepEqual(result.errors,[]);
 result.captureChecksPassed=true;
}catch(error){result.failure=error.stack;process.exitCode=1;}
finally{
 phase='restore';deadline=Date.now()+20000;
 if(page&&packetSnapshot)try{
  // Always restore after any attempted fixture send, including partial failure.
  if(fixtureSent)await page.evaluate(()=>ue.wnt.world(__wntMapStyleEvidence.originalPacketJSON));
  await page.evaluate(()=>document.getElementById('wnt-map-style-diagnostic-label')?.remove());
  await input('focus',{longitude:initial.longitude,latitude:initial.latitude,zoom:initial.zoom});
  let restored=await until(diagnostics,d=>Math.abs(d.zoom-initial.zoom)<.0001,'original camera zoom');
  if(initial.orbitEnabled&&(Math.abs(initial.requestedYaw-restored.requestedYaw)>.0001||Math.abs(initial.requestedTilt-restored.requestedTilt)>.0001))
   await input('tilt',{dx:-(initial.requestedYaw-restored.requestedYaw)/.3,dy:(initial.requestedTilt-restored.requestedTilt)/.25});
  restored=await until(diagnostics,d=>Math.abs(longitudeDelta(d.longitude,initial.longitude))<.0001&&Math.abs(d.latitude-initial.latitude)<.0001&&Math.abs(d.zoom-initial.zoom)<.0001&&Math.abs(d.yaw-initial.yaw)<.001&&Math.abs(d.tilt-initial.tilt)<.001,'exact original camera');
  assert.deepEqual(restored.viewRect,initial.viewRect);assert.deepEqual(sorted(restored.chart.selectedForceIds),sorted(initial.chart.selectedForceIds));
  assert.equal(restored.chart.mapStyle.campaignFrontSegments,initial.chart.mapStyle.campaignFrontSegments,'Restoration must remove any diagnostic front geometry');
  const identity=await page.evaluate(()=>{const d=__wntMapStyleEvidence;return {instanceId:d.scene.instanceId,revision:d.scene.worldRevision,packetJSON:d.originalPacketJSON,selection:d.scene.selection()};});
  assert.equal(identity.instanceId,packetSnapshot.instanceId);assert.equal(identity.revision,packetSnapshot.revision);
  assert.equal(hash(identity.packetJSON),result.packetBefore.sha256,'The exact retained native presentation packet must be restored without a new revision');
  result.restoration={passed:true,fixtureRemoved:true,packetSha256:hash(identity.packetJSON),instanceId:identity.instanceId,revision:identity.revision,diagnostics:restored};
 }catch(error){result.restoration={passed:false,error:error.stack};result.captureChecksPassed=false;process.exitCode=1;}
 if(page&&initialState)try{
  assert.equal(await clock(),initialClock);const after=await save();await fs.writeFile(path.join(output,'campaign-after.json'),JSON.stringify(after,null,2)+'\n');
  assert.deepEqual(payload(after),payload(initialState),'The full campaign payload, including RNG, orders, fronts, economy and time, must remain identical');
  result.campaignAfter={sha256:hash(JSON.stringify(payload(after))),savedAt:after.savedAt};
  result.restoration={...result.restoration,campaignPreserved:true};
 }catch(error){result.restoration={...result.restoration,passed:false,campaignPreserved:false,preservationError:error.stack};result.captureChecksPassed=false;process.exitCode=1;}
 if(page)try{await page.evaluate(rows=>{
  for(const row of rows){const n=document.querySelector(row.selector);if(n){n.scrollTop=row.top;n.scrollLeft=row.left;}}
  document.getElementById('wnt-map-style-diagnostic-label')?.remove();const d=globalThis.__wntMapStyleEvidence;
  if(d){if(WNTUnreal.receive===d.hook)WNTUnreal.receive=d.old;if(d.proto.activate===d.activateHook){if(d.own)Object.defineProperty(d.proto,'activate',d.own);else delete d.proto.activate;}delete globalThis.__wntMapStyleEvidence;}
 },initialScroll||[]);}catch(error){result.cleanupError=error.stack;result.captureChecksPassed=false;process.exitCode=1;}
}
if(sharp&&result.captures.length)try{
 const width=720,height=430,tiles=[];
 for(const row of result.captures){
  const label=Buffer.from('<svg width="720" height="28"><rect width="720" height="28" fill="#192932"/><text x="8" y="19" font-family="sans-serif" font-size="14" fill="white">'+row.name+'</text></svg>');
  tiles.push(await sharp({create:{width,height,channels:3,background:'#192932'}}).composite([{input:await sharp(row.file).resize(width,height-28,{fit:'contain',background:'#192932'}).png().toBuffer(),left:0,top:28},{input:label,left:0,top:0}]).png().toBuffer());
 }
 const file=path.join(output,'map-style-contact-sheet.png');await sharp({create:{width:width*tiles.length,height,channels:3,background:'#142029'}}).composite(tiles.map((input,index)=>({input,left:index*width,top:0}))).png().toFile(file);result.contactSheet=file;
}catch(error){result.contactSheetError=error.stack;}
result.finishedAt=new Date().toISOString();result.gameLeftRunning=true;
const resultPath=path.join(output,'result.json');await fs.writeFile(resultPath,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({captureChecksPassed:result.captureChecksPassed,visualVerified:false,flickerCertified:false,captures:result.captures.length,report:resultPath,contactSheet:result.contactSheet,restoration:result.restoration,failure:result.failure},null,2));
// Ending this observer disconnects CDP; never send Browser.close or game close.
process.exit(result.captureChecksPassed?0:1);
