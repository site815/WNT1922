// Actual packaged UI, combat and native renderer; exclusive owned test session.
// No game launch, campaign tick, fixture import, reload, or process shutdown.
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
if(args.includes('--help')) {
  console.log('Usage: node tools/verify-unreal-tactical.mjs --package-report=<passed Shipping package-test.json> --debug-port=9333 --confirm-isolated-session [--output=<within package run>]\nRequires exclusive access to an already-running owned, paused test campaign. Exercises the real Tactical Engagements UI, native models/picking/camera, live/quick/replay clocks and custom fleets; takes at most six native GPU scene captures plus separate CEF-only UI images. Compares the entire campaign save before/after. Never changes campaign time, replaces the save, launches, reloads or closes the process. Human review is required for appearance.');process.exit(0);
}
assert(args.includes('--confirm-isolated-session'),'Explicit isolated-session confirmation is required.');
assert(option('--package-report'),'Supply a passed extracted Shipping package report.');
const port=Number(option('--debug-port'));assert(Number.isInteger(port)&&port>0&&port<=65535,'Supply an explicit local CEF debug port.');
const reportPath=path.resolve(option('--package-report'));
const report=JSON.parse((await fs.readFile(reportPath,'utf8')).replace(/^\uFEFF/,''));
assert(report.passed===true&&report.kind==='extracted-native-package'&&report.configuration==='Shipping');
const run=path.dirname(reportPath),stamp=new Date().toISOString().replace(/[-:.TZ]/g,'');
const output=path.resolve(option('--output')||path.join(run,'tactical-review-'+stamp)),captureDir=path.join(run,'userdata','Saved','Screenshots');
const inside=(base,file)=>{const r=path.relative(base,path.resolve(file));return r!==''&&r!=='..'&&!r.startsWith('..'+path.sep)&&!path.isAbsolute(r);};
assert(inside(path.join(root,'.build'),run)&&inside(run,report.executablePath)&&inside(run,report.saveDirectory)&&inside(run,output),'All paths must stay in the reported isolated workspace build run.');
const same=(a,b)=>path.resolve(a).toLowerCase()===path.resolve(b).toLowerCase();
const commandOption=(text,name)=>text.match(new RegExp('(?:^|\\s)"?-'+name+'=(?:"([^"\\r\\n]+)"|([^"\\s]+))','i'))?.slice(1).find(Boolean);
const valid=command=>/(?:^|\s)-WNTAutomation(?:\s|$)/i.test(command||'')&&Number(commandOption(command,'cefdebug'))===port&&
  same(commandOption(command,'WNTSaveDir')||'.',report.saveDirectory)&&same(commandOption(command,'UserDir')||'.',path.join(run,'userdata'));
assert(valid(report.processCommandLine),'Report must show explicit automation, CDP and isolated directories.');
const {stdout}=await promisify(execFile)('powershell.exe',['-NoProfile','-NonInteractive','-Command',
  "Get-CimInstance Win32_Process -Filter \"Name='WNT1922-Win64-Shipping.exe'\" | Select-Object ProcessId,ExecutablePath,CommandLine | ConvertTo-Json -Compress"],{windowsHide:true,timeout:5000});
const found=JSON.parse(stdout.trim()||'null'),processes=(Array.isArray(found)?found:found?[found]:[]).filter(p=>p.ExecutablePath&&same(p.ExecutablePath,report.executablePath)&&valid(p.CommandLine));
assert.equal(processes.length,1,'Exactly one matching opted-in live package process is required.');
let playwright;try{playwright=createRequire(import.meta.url)('playwright');}catch{playwright=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'))('playwright');}
let sharp;try{sharp=createRequire(import.meta.url)('sharp');}catch{sharp=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'))('sharp');}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex'),payload=state=>{const {savedAt,...rest}=state;return rest;};
const result={format:1,kind:'native-tactical-engagements-verification',passed:false,visualVerified:false,startedAt:new Date().toISOString(),
  packageReport:reportPath,archiveSha256:report.archiveSha256,processId:processes[0].ProcessId,endpoint:'http://127.0.0.1:'+port,
  checks:[],metrics:[],captures:[],errors:[],limitations:[
    'Native GPU captures contain the rendered scene without UI. CEF-only UI images are separate and clearly labelled; they do not capture native graphics. Human image review is required; diagnostics alone do not certify artistic quality or continuous motion.',
    'Historical starting situations are selected approximations. This verifier runs the same actual simulator and never forces historical losses.',
    'Quick resolution and replay operate only on the standalone combat. Normal campaign Save is used before and after; only savedAt may differ.',
    'Native model counts, projected ray-tested targets and cinematic camera diagnostics verify the renderer contract. This is not an FPS benchmark.',
  ]};
await fs.mkdir(output,{recursive:true});
let page,browser,initial,before,hooked=false,phase='connect',deadline=Date.now()+240000;
const host=()=>page.locator('.tactical-engagements'),control=action=>host().locator('[data-tactical="'+action+'"]');
async function until(read,accept,label,timeout=12000){let last;const end=Math.min(deadline,Date.now()+timeout);do{last=await read();if(accept(last))return last;await delay(80);}while(Date.now()<end);throw Error('Timed out '+label+' in '+phase+': '+JSON.stringify(last).slice(0,700));}
async function input(action,values={}){await page.evaluate(({action,values})=>ue.wnt.sceneinput(JSON.stringify({instanceId:__wntTacticalEvidence.latest?.instanceId||'',action,...values})),{action,values});}
async function diagnostics(mode){
  const d=await until(async()=>{
    const sequence=await page.evaluate(()=>__wntTacticalEvidence.sequence);await input('diagnostics');
    return until(()=>page.evaluate(sequence=>__wntTacticalEvidence.sequence>sequence?__wntTacticalEvidence.latest:null,sequence),Boolean,'native diagnostics response');
  },d=>!mode||d.mode===mode,'native renderer mode '+(mode||'current'));
  assert.equal(d.renderer,'Unreal Engine native UWorld');assert.equal(d.modelLoadErrors,0);return d;
}
async function nativeCapture(name){
  assert(result.captures.filter(c=>c.kind==='native-Unreal-GPU-no-UI').length<6);const nativeName='tactical-'+stamp+'-'+name,source=path.join(captureDir,nativeName+'.png');
  await input('capture',{name:nativeName,includeUI:false});
  const bytes=await until(()=>fs.readFile(source).catch(()=>null),b=>b&&b.length>1000&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&b.subarray(-8,-4).toString()==='IEND','complete native GPU capture '+name,12000);
  const file=path.join(output,name+'.png');await fs.writeFile(file,bytes);
  const stats=await sharp(bytes).removeAlpha().stats();assert(stats.channels.some(channel=>channel.max>10),'A black native capture cannot be accepted as visual evidence');
  result.captures.push({kind:'native-Unreal-GPU-no-UI',name,file,sha256:hash(bytes),width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),channels:stats.channels,diagnostics:await diagnostics()});
  const cefFile=path.join(output,name+'-cef-ui-only.png');await page.screenshot({path:cefFile});
  result.captures.push({kind:'CEF-HTML-only-not-native-render',name:name+'-cef-ui-only',file:cefFile});
}
async function save(){
  assert(await page.locator('.actual-speed.is-paused').count(),'Campaign must already be paused');
  const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/save'&&r.request().method()==='POST');
  await page.locator('.sidebar [data-action="save"]').click();assert.equal((await response).status(),200);
  const state=await page.evaluate(async()=>{const r=await fetch('/api/save');if(!r.ok)throw Error('Save read failed');return r.json();});assert.equal(state.paused,true);return state;
}
async function observed(){return page.evaluate(()=>{const d=__wntTacticalEvidence,s=d.scene;return{packet:s?.packet,combat:s?.combat?{seconds:s.combat.seconds,rng:s.combat.rng,status:s.combat.status,winner:s.combat.winner,ships:s.combat.ships,history:s.combat.history}:null};});}
async function ready(expected){
  const d=await until(()=>diagnostics('battle'),d=>d.visibleShipCount===expected&&d.visibleDetailedShipCount===expected,'detailed native hulls '+expected,45000);
  const state=await observed();assert.equal(state.packet.units.length,expected);assert.equal(state.combat.ships.length,expected);
  assert(state.packet.units.every(u=>u.classId),'Every combat hull keeps its catalog model identity');
  result.metrics.push({kind:'native-models',ships:expected,classIds:state.packet.units.map(u=>u.classId),diagnostics:d});return d;
}
async function overviewTargets(sides,label) {
  let diagnostic;
  const targets=await until(async()=>{
    const d=await diagnostics('battle');diagnostic=d;
    return page.evaluate(targets=>targets.filter(t=>t.kind==='battle-ship'&&t.visible).map(t=>({...t,x:t.screenX*innerWidth,y:t.screenY*innerHeight}))
      .filter(t=>document.elementFromPoint(t.x,t.y)?.matches('.battle-canvas')),d.targets);
  },targets=>sides.every(side=>targets.some(t=>t.side===side)),'pickable overview hulls after '+label);
  if(label==='Midway 220 km separation')assert(diagnostic.chart.visibleBattleShipMarkers>=2,'Widely separated carrier fleets need visible overview markers');
  result.metrics.push({kind:'native-overview-picking',phase:label,expectedSides:sides,targets,
    visibleMarkers:diagnostic.chart.visibleBattleShipMarkers,distanceMetres:diagnostic.battleDistanceMetres,
    spanXMetres:diagnostic.battleSpanXMetres,spanYMetres:diagnostic.battleSpanYMetres});
}
async function verifyEveryNativeModel() {
  const state=await observed(),models=await page.evaluate(async()=>{const r=await fetch('/assets/models/ships/index.json');if(!r.ok)throw Error('Cannot read shipped model manifest');return(await r.json()).models;});
  const checks=[];
  for(const unit of state.packet.units) {
    const ship=state.combat.ships.find(s=>s.side===unit.side&&s.groupId===unit.id&&s.hullIndex===unit.hullIndex);assert(ship);
    const expected=models.find(m=>m.platforms?.some(p=>p.id===unit.classId&&p.campaign===unit.campaign)) || models.find(m=>m.platforms?.some(p=>p.id===unit.classId&&!p.campaign));
    assert(expected,'Every tactical class needs an explicit matching model: '+unit.campaign+':'+unit.classId);
    await host().locator('[data-tactical="select-ship"]').evaluateAll((buttons,id)=>buttons.find(button=>button.dataset.id===id).click(),ship.id);
    await control('focus-ship').click();
    const picked=await until(async()=>{const d=await diagnostics('battle');return d.targets.find(t=>t.kind==='battle-ship'&&t.id===unit.id&&t.side===unit.side&&t.hullIndex===unit.hullIndex&&t.visible);},Boolean,'visible focused hull '+ship.name);
    assert.equal(picked.modelId,expected.id,'Native model identity for '+unit.campaign+':'+unit.classId);
    assert(picked.detailedModel&&!picked.modelLoadError&&!picked.modelPending,'The matching GLB must be loaded');
    checks.push({ship:ship.name,campaign:unit.campaign,classId:unit.classId,modelId:picked.modelId});
  }
  assert.equal((await observed()).combat.seconds,state.combat.seconds,'Inspecting every hull cannot advance time');
  assert.equal((await observed()).combat.rng,state.combat.rng,'Inspecting every hull cannot consume combat RNG');
  result.metrics.push({kind:'every-native-model-identity',checks});
  await control('fit').click();
}
try {
  browser=await playwright.chromium.connectOverCDP(result.endpoint,{timeout:5000});
  const pages=browser.contexts().flatMap(c=>c.pages()).filter(p=>{try{const u=new URL(p.url());return u.hostname==='127.0.0.1'&&u.searchParams.get('unreal')==='1';}catch{return false;}});
  assert.equal(pages.length,1);page=pages[0];page.setDefaultTimeout(15000);page.on('pageerror',error=>result.errors.push({kind:'browser',message:error.message}));result.metrics.push({kind:'CEF',url:page.url()});
  assert.equal(await page.locator('.native-world-input').count(),1);assert.equal(await page.locator('.modal-backdrop').count(),0);assert.equal(await host().count(),0);
  await page.evaluate(async()=>{
    if(globalThis.__wntTacticalEvidence)throw Error('A tactical observer is already installed');
    const {UnrealTacticalScene}=await import('/ui/unreal-scene.mjs'),proto=UnrealTacticalScene.prototype;
    const d=globalThis.__wntTacticalEvidence={latest:null,sequence:0,events:[],errors:[],old:WNTUnreal.receive,proto,refresh:proto.refresh,scene:null};
    d.hook=function(event){if(event.type==='diagnostics'){d.latest=structuredClone(event);d.sequence++;}if(event.type==='select')d.events.push(structuredClone(event));if(event.type==='error')d.errors.push(structuredClone(event));return Reflect.apply(d.old,this,[event]);};WNTUnreal.receive=d.hook;
    d.refreshHook=function(...args){d.scene=this;return Reflect.apply(d.refresh,this,args);};proto.refresh=d.refreshHook;
  });hooked=true;
  initial=await diagnostics('world');assert(Math.abs(initial.tilt)<.01&&Math.abs(initial.yaw)<.01,'Begin in an overhead world view for exact return verification');
  before=await save();await fs.writeFile(path.join(output,'campaign-before.json'),JSON.stringify(before,null,2));
  phase='real tactical setup';await page.locator('.nav-item[data-view="tactical"]').click();await control('prepare').click();
  await until(()=>host().getAttribute('data-tactical-page'),v=>v==='watch','prepared watch view');
  let d=await ready(4);assert(d.cinematicAvailable);assert(await page.locator('[data-tactical-camera]').isChecked());
  await overviewTargets(['A','B'],'initial Denmark Strait fit');
  const setup=await observed();
  const authoredClasses=await page.evaluate(async()=>{const [{buildScenario},{CATALOG}]=await Promise.all([import('/combatmechanics/index.mjs'),import('/worker/catalog-loader.mjs')]);const preset=buildScenario(CATALOG,{presetId:'denmark-strait'});return ['A','B'].flatMap(side=>preset.sides[side].ships.map(ship=>ship.classId));});
  assert.deepEqual(setup.packet.units.map(u=>u.classId),authoredClasses,'Native units use the packaged scenario model IDs');
  await nativeCapture('denmark-strait-prepared');
  phase='native selection';await control('select-ship').first().click();await control('focus-ship').click();
  await until(()=>diagnostics('battle'),d=>d.battleDistanceMetres>=1000&&d.battleDistanceMetres<=2500,'native selected ship focus within 2.5 km');
  const candidates=await until(async()=>{const d=await diagnostics('battle');return page.evaluate(targets=>targets.filter(t=>t.kind==='battle-ship'&&t.visible).map(t=>({...t,x:t.screenX*innerWidth,y:t.screenY*innerHeight})).filter(t=>document.elementFromPoint(t.x,t.y)?.matches('.battle-canvas')) ,d.targets);},v=>v.length>0,'ray-tested ship under real canvas');
  const target=candidates[0],stable=await observed();await page.mouse.click(target.x,target.y);
  await page.locator('.tactical-inspection').waitFor();
  const afterPick=await observed();assert.equal(afterPick.combat.seconds,stable.combat.seconds);assert.equal(afterPick.combat.rng,stable.combat.rng);assert.equal(afterPick.packet.eventKey,stable.packet.eventKey);
  const selection=await page.evaluate(()=>__wntTacticalEvidence.events.at(-1)?.selection);assert(selection&&selection.id===target.id&&selection.side===target.side);assert.equal(selection.hullIndex,target.hullIndex);
  const modelMatches=await page.evaluate(async target=>{const index=await(await fetch('/assets/models/ships/index.json')).json(),unit=__wntTacticalEvidence.scene.packet.units.find(u=>u.side===target.side&&u.id===target.id&&u.hullIndex===target.hullIndex);return index.models.some(model=>model.id===target.modelId&&model.platforms?.some(platform=>platform.id===unit?.classId));},target);
  assert(modelMatches,'Ray-picked native model must match the selected tactical hull in the shipped asset manifest');
  result.metrics.push({kind:'actual-native-pick',selection,modelId:target.modelId});
  phase='cinematic and manual camera';await page.locator('[data-tactical-camera]').check();
  await until(()=>diagnostics('battle'),d=>d.cinematicEnabled,'cinematic enabled');
  const rect=await page.locator('.tactical-stage canvas').boundingBox();await page.mouse.move(rect.x+rect.width*.5,rect.y+rect.height*.5);await page.mouse.down({button:'middle'});await page.mouse.move(rect.x+rect.width*.6,rect.y+rect.height*.56,{steps:6});await page.mouse.up({button:'middle'});
  await until(()=>diagnostics('battle'),d=>!d.cinematicEnabled,'manual middle-button cancels cinematic');
  assert.equal(await page.locator('[data-tactical-camera]').isChecked(),false,'Checkbox follows actual manual camera takeover');
  await page.locator('[data-tactical-camera]').check();await control('play').click();
  await until(()=>host().getAttribute('data-tactical-seconds'),v=>Number(v)>=120,'live tactical combat progression');
  d=await diagnostics('battle');assert(d.cinematicEnabled&&d.cameraShotCount>0);result.metrics.push({kind:'active-cinematic',diagnostics:d});
  await nativeCapture('denmark-strait-live-cinematic');
  await control('play').click();const paused=await observed();await delay(450);const pausedAgain=await observed();assert.equal(pausedAgain.combat.seconds,paused.combat.seconds);assert.equal(pausedAgain.combat.rng,paused.combat.rng);
  await control('step').click();const stepped=await observed();assert.equal(stepped.combat.seconds,paused.combat.seconds+10);
  phase='quick resolve and replay';await control('resolve').click();await until(()=>host().getAttribute('data-tactical-status'),v=>v==='completed','exact quick resolution',30000);
  const terminal=await observed();await page.locator('[data-tactical-camera]').uncheck();await control('replay').click();await overviewTargets(['A','B'],'Replay reset');await control('step').click();assert.deepEqual((await observed()).combat,terminal.combat,'Replaying retained observations cannot change outcome/RNG');
  await control('replay').click();
  await overviewTargets(['A','B'].filter(side=>terminal.combat.ships.some(ship=>ship.side===side&&!['sunk','escaped'].includes(ship.status))),'Return to result');
  await control('restart').click();assert.deepEqual((await observed()).combat,setup.combat,'Restart reproduces the initial seeded setup');await overviewTargets(['A','B'],'Restart');
  result.checks.push('Real UI run/pause/10-second step/quick resolution/replay/restart work; native pointer selection and manual camera takeover keep combat RNG and clock unchanged. Clock jumps refit pickable hulls at their actual current positions.');
  phase='Midway airstrike models';await control('setup').click();await page.locator('[data-setup="presetId"]').selectOption('midway');await control('prepare').click();await ready(7);
  await overviewTargets(['A','B'],'Midway 220 km separation');
  await page.locator('[data-tactical-camera]').check();await page.locator('[data-tactical-speed]').selectOption('120');await control('play').click();
  await until(async()=>{const o=await observed();return o.packet.airstrikes?.length||0;},n=>n>0,'actual carrier-launched grouped airstrikes',15000);
  await until(()=>host().getAttribute('data-tactical-seconds'),v=>Number(v)>=600,'Midway establishing shot',15000);
  await nativeCapture('midway-establishing-airstrikes');
  const establishing=await diagnostics('battle');
  await until(async()=>{const o=await observed();return o.combat.history.events.some(e=>e.kind==='air-attack');},Boolean,'first actual Midway air attack',90000);
  const attackShot=await until(()=>diagnostics('battle'),d=>d.cinematicEnabled&&d.cameraShot!=='establish'&&d.cameraShot!=='manual'&&d.cinematicCutCount>establishing.cinematicCutCount,'cinematic cut to the remote attack',8000);
  assert(attackShot.targets.some(t=>t.kind==='battle-ship'&&t.visible),'A remote cinematic cut must immediately land on a visible, ray-tested hull');
  result.metrics.push({kind:'midway-first-air-attack-camera',diagnostics:attackShot});
  await nativeCapture('midway-first-air-attack');await control('play').click();await control('resolve').click();await until(()=>host().getAttribute('data-tactical-status'),v=>v==='completed','Midway quick resolution',30000);
  const midway=await observed();assert(midway.combat.history.events.some(e=>e.kind==='air-attack'));result.metrics.push({kind:'midway-simulation',winner:midway.combat.winner,seconds:midway.combat.seconds,events:midway.combat.history.events.length,sunk:midway.combat.ships.filter(s=>s.status==='sunk').map(s=>s.name)});
  phase='North Cape';await control('setup').click();await page.locator('[data-setup="presetId"]').selectOption('north-cape');await control('prepare').click();await ready(4);await control('step').click();await nativeCapture('north-cape-prepared');
  phase='custom fleet match';await control('setup').click();await page.locator('[data-setup="presetId"]').selectOption('custom');
  const legacyClass=await page.evaluate(async()=>{const {CATALOG}=await import('/worker/catalog-loader.mjs');return Object.keys(CATALOG.campaigns.campaign_1922.classes).find(id=>!CATALOG.campaigns.in_good_faith_1936.classes[id]);});assert(legacyClass,'A campaign_1922-only catalog class must exist');
  await page.locator('[data-setup="class-A-0"]').selectOption('ecole_pt32');await page.locator('[data-setup="class-B-0"]').selectOption(legacyClass);
  await page.locator('[data-setup="count-A-0"]').fill('3');await page.locator('[data-setup="count-B-0"]').fill('2');await page.locator('[data-setup="doctrineA"]').selectOption('cautious');await page.locator('[data-setup="formationB"]').selectOption('line-abreast');await control('prepare').click();await ready(5);
  const mixed=await observed();assert(mixed.packet.units.filter(u=>u.side==='A').every(u=>u.classId==='ecole_pt32'&&u.campaign==='in_good_faith_1936'));assert(mixed.packet.units.filter(u=>u.side==='B').every(u=>u.classId===legacyClass&&u.campaign==='campaign_1922'));
  await verifyEveryNativeModel();
  await control('step').click();await nativeCapture('custom-five-ships');
  await control('resolve').click();const closingStatus=(await observed()).combat.status;await control('close').click();await until(()=>diagnostics('world'),d=>d.mode==='world','campaign restoration');
  result.metrics.push({kind:'close-after-quick-resolve',statusBeforeClose:closingStatus});
  result.checks.push('Packaged Denmark Strait, Midway, North Cape and custom fleets use real detailed hull models, actual simulator state and grouped airstrikes. Closing returns to the unchanged campaign.');
  const after=await save();assert.deepEqual(payload(after),payload(before),'The complete campaign including random state must be unchanged');await fs.writeFile(path.join(output,'verified-campaign.json'),JSON.stringify(after,null,2));
  result.errors.push(...await page.evaluate(()=>__wntTacticalEvidence.errors));assert.deepEqual(result.errors,[]);result.passed=true;
} catch(error){result.failure={phase,message:error.message,stack:error.stack};if(page)await page.screenshot({path:path.join(output,'failure-cef-html-only.png')}).catch(()=>{});}
finally {
  deadline=Date.now()+15000;
  if(page&&initial)try {
    if(await host().count())await control('close').click();
    await page.locator('.native-world-input').waitFor();await diagnostics('world');await input('focus',{longitude:initial.longitude,latitude:initial.latitude,zoom:initial.zoom});
    const restored=await until(()=>diagnostics('world'),d=>Math.abs(d.zoom-initial.zoom)<.001&&Math.abs(((d.longitude-initial.longitude+540)%360)-180)<.001&&Math.abs(d.latitude-initial.latitude)<.001,'original world camera');
    if(before){const after=await save();assert.deepEqual(payload(after),payload(before));await fs.writeFile(path.join(output,'verified-campaign.json'),JSON.stringify(after,null,2));}
    result.restoration={passed:true,campaignUnchanged:true,diagnostics:restored};
  }catch(error){result.passed=false;result.restoration={passed:false,error:error.stack};}
  if(page&&hooked)await page.evaluate(()=>{const d=__wntTacticalEvidence;if(WNTUnreal.receive===d.hook)WNTUnreal.receive=d.old;if(d.proto.refresh===d.refreshHook)d.proto.refresh=d.refresh;delete globalThis.__wntTacticalEvidence;}).catch(()=>{});
  result.finishedAt=new Date().toISOString();result.gameLeftRunning=true;await fs.writeFile(path.join(output,'result.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({passed:result.passed,failure:result.failure,restoration:result.restoration?.passed,result:path.join(output,'result.json'),captures:result.captures.map(c=>c.file)},null,2));
  // Disconnect this observer only; never close the user's browser/game process.
  process.exit(result.passed?0:1);
}
