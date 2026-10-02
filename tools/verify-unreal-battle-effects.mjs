// Native GPU evidence from a shipped scripted demonstration, not a combat or
// historical reconstruction. Requires an already-running isolated package.
// Never launches, saves, advances, reloads, or closes the game.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {setTimeout as delay} from 'node:timers/promises';
import {createHash} from 'node:crypto';

const args=process.argv.slice(2),option=name=>args.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
const movieMode=args.includes('--movie');
if(args.includes('--help')){
 console.log('Usage: node tools/verify-unreal-battle-effects.mjs --package-report=<passed Shipping package-test.json> --debug-port=9333 --confirm-isolated-session [--movie]\nRequires exclusive CDP access to that already-running disposable process, paused on its command map. Six native GPU captures use the packaged Denmark Strait script: --movie tests its complete recorded movie timeline; default stretches one title frame to a labeled 15-second diagnostic scale. Does not modify campaign/save data. Restores the native world viewport and camera. Appearance needs human review.');
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
const output=path.join(run,'battle-effects-review-'+stamp),captureDir=path.join(run,'userdata','Saved','Screenshots');
const inside=(base,file)=>{const relative=path.relative(base,path.resolve(file));return relative!==''&&!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative);};
assert(inside(run,packageReport.executablePath)&&inside(run,packageReport.saveDirectory),'Executable and saves must belong to the reported isolated run.');
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
async function saveInventory(){
 const files=[];
 async function walk(directory){
  for(const entry of await fs.readdir(directory,{withFileTypes:true})){
   const file=path.join(directory,entry.name);assert(!entry.isSymbolicLink(),'Isolated save directories must not contain symbolic links.');
   if(entry.isDirectory())await walk(file);
   else if(entry.isFile()){
    assert(files.length<64,'Unexpectedly large save profile');const stat=await fs.stat(file);assert(stat.size<=16000000,'Unexpectedly large save file');
    files.push({path:path.relative(packageReport.saveDirectory,file),bytes:stat.size,sha256:hash(await fs.readFile(file))});
   }
  }
 }
 await walk(packageReport.saveDirectory);return files.sort((a,b)=>a.path.localeCompare(b.path));
}
const result={format:1,kind:'native-battle-effects-capture-diagnostic',captureChecksPassed:false,visualVerified:false,
 startedAt:new Date().toISOString(),packageReport:reportPath,archiveSha256:packageReport.archiveSha256,
 sourceProcessId:live[0].ProcessId,endpoint:'http://127.0.0.1:'+port,captures:[],metrics:[],errors:[],limitations:[
 'Native Unreal GPU screenshots, not CEF screenshots. A human must review visual quality, attack visibility and sinking motion.',
 'The shipped title demonstration is explicitly scripted illustration. Its outcomes are not generated or added to the campaign by this verifier.',
 movieMode?'The packaged movie planner supplies a complete native trajectory/event timeline from a frozen scripted title record at its actual movie duration. No campaign outcomes are created.':'The 3.6-second title event packet is stretched uniformly to a labeled 15-second diagnostic playback so screenshots can sample its phases. Geometry, effects, order and outcomes are unchanged.',
 'One salvo capture uses the untouched default fit; subsequent damage/sinking captures use actual native ship focus at its threefold inspection zoom. Neither substitutes for reviewing effect visibility at default fit.',
 'Duplicate packet timing is checked through the original sinking deadline and observed visible-hull count; this is not an instrumented per-component transform trace.',
 'The campaign stays paused. Native world data and HTML are not replaced; only a temporary battle viewport/camera and presentation packet are used.',
 'Four persistent instanced effect components may remain allocated, hidden, after restoration. The verifier does not claim an FPS benchmark.',
 ]};
await fs.mkdir(output,{recursive:true});
let browser,page,initial,view,initialClock,initialSaves,startedFrameAt,deadline=Date.now()+120000,phase='connect',viewportChanged=false;
const instanceId='effects-review-'+stamp;
async function until(read,accept,label,timeout=8000){
 const end=Math.min(deadline,Date.now()+timeout);let last;
 do{last=await read();if(accept(last))return last;await delay(40);}while(Date.now()<end);
 throw Error('Timed out '+label+' in '+phase+'; last='+JSON.stringify(last).slice(0,700));
}
async function input(action,values={},instance=instanceId){
 await page.evaluate(({action,values,instance})=>ue.wnt.sceneinput(JSON.stringify({action,...values,instanceId:instance})),{action,values,instance});
}
async function diagnostics(mode){
 const before=await page.evaluate(()=>__wntEffectsEvidence.sequence);await input('diagnostics');
 const d=await until(()=>page.evaluate(after=>__wntEffectsEvidence.sequence>after?__wntEffectsEvidence.latest:null,before),Boolean,'native diagnostics');
 assert.equal(d.renderer,'Unreal Engine native UWorld');assert.equal(d.nativeWorldInitialized,true);assert.equal(d.modelLoadErrors,0);
 if(mode)assert.equal(d.mode,mode);return d;
}
async function pausedClock(){
 const state=await page.evaluate(()=>({paused:!!document.querySelector('.actual-speed.is-paused'),clock:document.querySelector('.campaign-clock')?.textContent||null}));
 assert(state.paused&&state.clock,'An already-paused campaign with a visible clock is required');return state.clock;
}
async function sendPacket(packet){
 const before=Date.now();await page.evaluate(packet=>ue.wnt.battle(JSON.stringify(packet)),packet);return {before,after:Date.now()};
}
async function capture(name,expectedSeconds,details={}){
 assert(result.captures.length<6,'Capture count is bounded at six');
 const wait=startedFrameAt+expectedSeconds*1000-Date.now();if(wait>0)await delay(wait);
 assert(Date.now()<deadline,'Capture budget exceeded');
 const nativeName='fx-'+stamp+'-'+name,source=path.join(captureDir,nativeName+'.png'),old=await fs.stat(source).catch(()=>null);
 const requestedAt=Date.now();await input('capture',{name:nativeName,includeUI:false});
 await until(()=>fs.stat(source).catch(()=>null),s=>s&&s.size>1000&&(!old||s.mtimeMs>old.mtimeMs),'fresh native capture '+name,5000);
 const png=await until(()=>fs.readFile(source).catch(()=>null),b=>b&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&b.subarray(-8,-4).toString()==='IEND','complete PNG '+name);
 assert.equal(png.readUInt32BE(16),initial.viewportWidth);assert.equal(png.readUInt32BE(20),initial.viewportHeight);
 const file=path.join(output,name+'.png');await fs.writeFile(file,png);
 const d=await diagnostics('battle');
 const row={name,file,kind:'native-Unreal-GPU',expectedSeconds,requestedElapsedSeconds:(requestedAt-startedFrameAt)/1000,
  completedElapsedSeconds:(Date.now()-startedFrameAt)/1000,sha256:hash(png),diagnostics:d,...details};
 result.captures.push(row);return row;
}
try{
 browser=await playwright.chromium.connectOverCDP(result.endpoint,{timeout:5000});
 const pages=browser.contexts().flatMap(c=>c.pages()).filter(p=>{try{const u=new URL(p.url());return u.hostname==='127.0.0.1'&&u.searchParams.get('unreal')==='1';}catch{return false;}});
 assert.equal(pages.length,1,'Exactly one local Unreal CEF page is required');page=pages[0];page.setDefaultTimeout(5000);
 assert.equal(await page.locator('.native-world-input').count(),1,'The isolated session must be on its command map');
 assert.equal(await page.locator('.modal-backdrop').count(),0,'Close existing dialogs before this verifier');
 initialClock=await pausedClock();initialSaves=await saveInventory();result.saveInventoryBefore=initialSaves;
 await page.evaluate(()=>{
  if(globalThis.__wntEffectsEvidence)throw Error('An effects observer is already installed');
  const old=WNTUnreal.receive,d=globalThis.__wntEffectsEvidence={latest:null,sequence:0,errors:[],old,hook:null};
  d.hook=function(event){if(event.type==='diagnostics'){d.latest=structuredClone(event);d.sequence++;}if(event.type==='error')d.errors.push(structuredClone(event));return Reflect.apply(old,this,[event]);};WNTUnreal.receive=d.hook;
 });
 initial=await diagnostics('world');result.initialDiagnostics=initial;
 // A prior diagnostic may have used a different native aperture from the DOM
 // canvas. Reconstructing it from CSS changes pole clamping at strategic zoom.
 // Require and preserve the renderer's actual rectangle exactly.
 view=initial.viewRect;
 assert(view&&['x','y','width','height'].every(key=>Number.isFinite(view[key]))&&view.width>0&&view.height>0,'Packaged diagnostics must expose the exact native viewRect before captures can run');
 const authored=await page.evaluate(async movieMode=>{
  const [{DEMO_BATTLES,createDemoReport},{unrealBattlePacket}]=await Promise.all([import('/ui/start-battle-data.mjs'),import('/ui/unreal-scene.mjs')]);
  const battle=DEMO_BATTLES.find(row=>row.id==='denmark-strait');if(!battle)throw Error('Packaged Denmark Strait script is missing');
  const report=createDemoReport(battle),index=2;
  if(movieMode){
   const {buildBattleMovie}=await import('/ui/battle-movie.mjs'),plan=buildBattleMovie(report);
   return {title:battle.title,source:battle.source,scope:battle.scope,frameTimes:plan.frameTimes,
    warm:unrealBattlePacket(report,'campaign_1922',0,null,false),
    packet:unrealBattlePacket(report,'campaign_1922',0,null,true,{plan,key:'movie-evidence:'+report.id,elapsedSeconds:0,paused:false})};
  }
  return {title:battle.title,source:battle.source,scope:battle.scope,stage:battle.stages[index],
   warm:unrealBattlePacket(report,'campaign_1922',index-1,null,false),packet:unrealBattlePacket(report,'campaign_1922',index,null,true)};
 },movieMode);
 if(movieMode)assert(authored.packet.movie&&authored.packet.durationSeconds>=20&&authored.packet.durationSeconds<=90,'The actual complete movie timeline is required');
 else assert.equal(authored.packet.durationSeconds,3.6,'The packaged title timing fix must be present');
 assert(authored.packet.events.some(e=>e.type==='salvo')&&authored.packet.events.some(e=>e.type==='hit')&&authored.packet.events.some(e=>e.type==='sink'),'The authored frame must contain attack, damage and sinking');
 result.authored={...authored,unmodifiedPacketSha256:hash(JSON.stringify(authored.packet))};
 const packet=structuredClone(authored.packet),scale=movieMode?1:15/packet.durationSeconds;
 packet.eventKey+=':diagnostic-'+stamp;if(!movieMode)packet.durationSeconds=15;
 packet.events=packet.events.map(e=>({...e,time:e.time*scale,duration:e.duration*scale}));
 const warm=structuredClone(authored.warm);warm.eventKey+=':diagnostic-warm-'+stamp;
 await page.evaluate(viewport=>ue.wnt.viewport(JSON.stringify(viewport)),{instanceId,mode:'battle',...view});viewportChanged=true;
 phase='warm-models';await sendPacket(warm);await input('home');
 const totalHulls=warm.units.filter(u=>!u.sunk).length;
 const baseline=await until(()=>diagnostics('battle'),d=>d.visibleShipCount===totalHulls&&d.visibleDetailedShipCount===totalHulls,'all authored detailed ship models',45000);
 result.warmDiagnostics=baseline;await delay(100);
 phase='timed-captures';result.playbackPacket=packet;
 const delivery=await sendPacket(packet);startedFrameAt=delivery.before;result.delivery={...delivery,uncertaintyMs:delivery.after-delivery.before};
 assert(delivery.after-delivery.before<=500,'Native packet delivery is too slow for reliable timed effect captures');
 const salvo=packet.events.find(e=>e.type==='salvo'),sink=packet.events.find(e=>e.type==='sink');
 const hit=packet.events.filter(e=>e.type==='hit'&&e.targetKey===sink.targetKey&&e.time<sink.time).at(-1)||packet.events.find(e=>e.type==='hit');
 const sinkUnit=packet.units.find(unit=>unit.key===sink.targetKey);assert(sinkUnit,'Recorded sinking needs an authored hull');
 const end=movieMode?packet.durationSeconds:Math.max(...packet.events.map(e=>e.time+e.duration));
 const plan=[{name:'default-fit-salvo',at:salvo.time+.12,event:salvo},{name:'hit-smoke',at:hit.time+.3,event:hit},
  {name:'sink-start',at:sink.time+sink.duration*.14,event:sink},{name:'sink-mid-before-repeat',at:sink.time+sink.duration*.475,event:sink},
  {name:'sink-late-after-repeat',at:sink.time+sink.duration*.7625,event:sink},{name:'settled',at:end+.5,event:sink}].sort((a,b)=>a.at-b.at);
 for(const step of plan){
  const row=await capture(step.name,step.at,{event:step.event,framing:step.name==='default-fit-salvo'?'unmodified-default-fit':'native-ship-focus'});
  assert(row.requestedElapsedSeconds-step.at<=.7,'GPU capture scheduling drift exceeded the phase sampling budget');
  if(step.name!=='settled')assert(row.completedElapsedSeconds<=step.event.time+step.event.duration,'The image completed after its intended event expired; do not treat it as valid effect evidence');
  assert(row.diagnostics.primitiveComponentCount<=baseline.primitiveComponentCount+4,'Effects must add at most four persistent primitive components');
  if(step.name==='default-fit-salvo'){
   assert.equal(row.diagnostics.zoom,1,'The first screenshot must retain the actual default fleet fit');
   await input('focus',{id:sinkUnit.id,side:sinkUnit.side,hullIndex:sinkUnit.hullIndex});
   const close=await until(()=>diagnostics('battle'),d=>d.zoom>=3,'native ship inspection focus');
   result.metrics.push({kind:'native-ship-focus',targetKey:sinkUnit.key,zoom:close.zoom,atSeconds:(Date.now()-startedFrameAt)/1000});
  }
  if(step.name==='sink-mid-before-repeat'){
   const repeated=structuredClone(packet);repeated.units[0].selected=true;
   for(let i=0;i<5;i++)await sendPacket(repeated);
   result.duplicatePacket={sentElapsedSeconds:(Date.now()-startedFrameAt)/1000,count:5,eventKey:repeated.eventKey,originalEventKey:packet.eventKey,
    eventsUnchanged:JSON.stringify(repeated.events)===JSON.stringify(packet.events)};
  }
 }
 assert(result.duplicatePacket?.eventsUnchanged&&result.duplicatePacket.eventKey===packet.eventKey);
 const final=result.captures.find(row=>row.name==='settled');
 const expectedVisible=packet.units.filter(u=>!u.sunk).length;
 assert.equal(final.diagnostics.visibleShipCount,expectedVisible,'The repeated frame must not restart a recorded sinking or keep the wreck visible past its original deadline');
 assert(result.duplicatePacket.sentElapsedSeconds+sink.time+sink.duration>final.requestedElapsedSeconds,'Settled capture must fall before the deadline a wrongly restarted event would produce');
 result.metrics.push({kind:'bounded-presentation',baselinePrimitives:baseline.primitiveComponentCount,maxObservedPrimitives:Math.max(...result.captures.map(r=>r.diagnostics.primitiveComponentCount)),componentBudget:4,totalHulls,finalVisibleHulls:final.diagnostics.visibleShipCount,expectedVisibleHulls:expectedVisible});
 assert.equal(await pausedClock(),initialClock,'Native capture must not advance campaign time');
 result.errors=await page.evaluate(()=>__wntEffectsEvidence.errors);assert.deepEqual(result.errors,[]);
 result.captureChecksPassed=true;
}catch(error){result.failure=error.stack;process.exitCode=1;}
finally{
 deadline=Date.now()+12000;phase='restore';
 if(page&&initial&&viewportChanged)try{
  // The actual world packet remains cached and unchanged in AWNTWorldActor.
  // Restore its real UI instance, viewport and focus without a synthetic save,
  // simulation command, reload, or replacing any campaign data.
  await page.evaluate(viewport=>ue.wnt.viewport(JSON.stringify(viewport)),{instanceId:initial.instanceId,mode:'world',...view});
  await input('focus',{longitude:initial.longitude,latitude:initial.latitude,zoom:initial.zoom},initial.instanceId);
  const d=await until(()=>diagnostics('world'),d=>Math.abs(d.zoom-initial.zoom)<.0001&&Math.abs(d.longitude-initial.longitude)<.0001&&Math.abs(d.latitude-initial.latitude)<.0001,'original world camera');
  for(const key of ['x','y','width','height'])assert(Math.abs(d.viewRect[key]-view[key])<1e-9,'The actual native viewport rectangle must be restored');
  assert.equal(await page.locator('.modal-backdrop').count(),0);
  result.restoration={passed:true,worldPacketReplaced:false,htmlReplaced:false,diagnostics:d};
 }catch(error){result.restoration={passed:false,error:error.stack};result.captureChecksPassed=false;process.exitCode=1;}
 if(page&&initialSaves)try{
  const after=await saveInventory();assert.deepEqual(after,initialSaves,'Every isolated save file must be byte-for-byte unchanged');
  assert.equal(await pausedClock(),initialClock,'The campaign must remain paused at its initial date');
  result.restoration={...result.restoration,campaignAndSavesPreserved:true,campaignClock:initialClock,saveInventoryAfter:after};
 }catch(error){result.restoration={...result.restoration,passed:false,campaignAndSavesPreserved:false,preservationError:error.stack};result.captureChecksPassed=false;process.exitCode=1;}
 if(page)try{await page.evaluate(()=>{const d=globalThis.__wntEffectsEvidence;if(!d)return;if(WNTUnreal.receive===d.hook)WNTUnreal.receive=d.old;delete globalThis.__wntEffectsEvidence;});}catch{}
 if(browser)await browser.close();
}
if(sharp&&result.captures.length)try{
 const width=640,height=360,items=[];
 for(const row of result.captures){
  const label=Buffer.from('<svg width="640" height="28"><rect width="640" height="28" fill="#18242b"/><text x="8" y="19" font-family="sans-serif" font-size="13" fill="white">'+row.name+' · '+row.requestedElapsedSeconds.toFixed(2)+'s</text></svg>');
  items.push(await sharp({create:{width,height:height+28,channels:3,background:'#18242b'}}).composite([{input:await sharp(row.file).resize(width,height,{fit:'contain',background:'#18242b'}).png().toBuffer(),left:0,top:28},{input:label,left:0,top:0}]).png().toBuffer());
 }
 const file=path.join(output,'battle-effects-contact-sheet.png');await sharp({create:{width:width*2,height:Math.ceil(items.length/2)*(height+28),channels:3,background:'#101a20'}}).composite(items.map((input,i)=>({input,left:(i%2)*width,top:Math.floor(i/2)*(height+28)}))).png().toFile(file);result.contactSheet=file;
}catch(error){result.contactSheetError=error.stack;}
result.finishedAt=new Date().toISOString();const resultPath=path.join(output,'result.json');await fs.writeFile(resultPath,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({captureChecksPassed:result.captureChecksPassed,visualVerified:false,captures:result.captures.length,report:resultPath,contactSheet:result.contactSheet,failure:result.failure,restoration:result.restoration?.passed}));
