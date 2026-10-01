// Native GPU evidence, not a flicker certification. Never launches the game.
// An already-running, paused, disposable extracted-package session is required.
// node tools/verify-unreal-grid.mjs --package-report=<package-test.json> --debug-port=9333 --confirm-isolated-session
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
if(args.includes('--help')){
 console.log('Usage: node tools/verify-unreal-grid.mjs --package-report=<passed Shipping package-test.json> --debug-port=9333 --confirm-isolated-session\nRequires the same isolated package process, paused on its command map. Captures 28 native images at 1800x1000 and 3440x1440 within a 60-second capture budget. Does not launch, save, advance or close the game. Appearance and flicker require visual review.');
 process.exit(0);
}
assert(args.includes('--confirm-isolated-session'),'Explicit --confirm-isolated-session is required; do not use a normal player session.');
assert(option('--package-report'),'An explicit passed extracted-package report is required.');
const port=Number(option('--debug-port'));
assert(Number.isInteger(port)&&port>0&&port<=65535,'An explicit local CEF debug port is required.');
const reportPath=path.resolve(option('--package-report'));
const packageReport=JSON.parse((await fs.readFile(reportPath,'utf8')).replace(/^\uFEFF/,''));
assert(packageReport.passed===true&&packageReport.kind==='extracted-native-package'&&packageReport.configuration==='Shipping','A passed extracted Shipping package report is required.');
const run=path.dirname(reportPath),stamp=new Date().toISOString().replace(/[-:.TZ]/g,'');
const output=path.join(run,'grid-review-'+stamp),captureDir=path.join(run,'userdata','Saved','Screenshots');
const inside=(base,file)=>{const relative=path.relative(base,path.resolve(file));return relative!==''&&!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative);};
assert(inside(run,packageReport.executablePath)&&inside(run,packageReport.saveDirectory),'Executable and save profile must belong to the reported isolated run.');
const normalized=value=>path.resolve(value).toLowerCase();
const samePath=(a,b)=>normalized(a)===normalized(b);
const commandOption=(command,name)=>command.match(new RegExp('(?:^|\\s)"?-'+name+'=(?:"([^"\\r\\n]+)"|([^"\\s]+))','i'))?.slice(1).find(Boolean);
function validCommand(command){
 return /(?:^|\s)-WNTAutomation(?:\s|$)/i.test(command||'')&&Number(commandOption(command,'cefdebug'))===port
  &&samePath(commandOption(command,'WNTSaveDir')||'.',packageReport.saveDirectory)
  &&samePath(commandOption(command,'UserDir')||'.',path.join(run,'userdata'));
}
assert(validCommand(packageReport.processCommandLine),'Report must specify opted-in automation/CDP and isolated user/save folders.');
// Read-only process validation prevents a stale report authorizing another game
// on the same debug port. No process is started or stopped by this check.
const {stdout}=await promisify(execFile)('powershell.exe',['-NoProfile','-NonInteractive','-Command',
 "Get-CimInstance Win32_Process -Filter \"Name='WNT1922-Win64-Shipping.exe'\" | Select-Object ProcessId,ExecutablePath,CommandLine | ConvertTo-Json -Compress"],{windowsHide:true,timeout:5000});
const processes=JSON.parse(stdout.trim()||'null');
const live=(Array.isArray(processes)?processes:processes?[processes]:[]).filter(p=>p.ExecutablePath&&samePath(p.ExecutablePath,packageReport.executablePath)&&validCommand(p.CommandLine));
assert.equal(live.length,1,'Exactly one live opted-in process must match the isolated package executable and directories.');
const bundled=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'));
let playwright;try{playwright=createRequire(import.meta.url)('playwright');}catch{playwright=bundled('playwright');}
let sharp;try{sharp=bundled('sharp');}catch{}
const sizes=[{width:1800,height:1000},{width:3440,height:1440}];
const result={format:1,kind:'native-grid-capture-diagnostic',captureChecksPassed:false,visualVerified:false,flickerCertified:false,
 startedAt:new Date().toISOString(),packageReport:reportPath,archiveSha256:packageReport.archiveSha256,
 sourceProcessId:live[0].ProcessId,endpoint:'http://127.0.0.1:'+port,sizes,captures:[],metrics:[],errors:[],limitations:[
 'Native Unreal GPU PNGs, not CEF screenshots or viewport emulation. Visual review is still required.',
 'Sequential screenshots are not a continuous frame recording; a clean sample cannot certify absence of flicker.',
 'Differences include ocean animation, lighting and antialiasing. Crops isolate a known grid crossing but are not a grid-only render pass.',
 'Hysteresis visibility is a labeled expectation for visual review, derived from the camera formula and water focus at longitude/latitude zero; it is not inferred from pixel differences.',
 'The 60-second capture budget excludes process validation, report/contact-sheet writing and bounded camera restoration.',
 ]};
await fs.mkdir(output,{recursive:true});
let browser,page,initial,initialClock,deadline=0,phase='connect';
const remaining=()=>Math.max(0,deadline-Date.now());
async function until(read,accept,label,timeout=4500){
 const end=Math.min(deadline||Infinity,Date.now()+timeout);let last;
 do{last=await read();if(accept(last))return last;await delay(55);}while(Date.now()<end);
 throw Error('Timed out '+label+' in '+phase+'; last='+JSON.stringify(last).slice(0,700));
}
async function input(action,values={}){
 await page.evaluate(({action,values})=>ue.wnt.sceneinput(JSON.stringify({action,...values,instanceId:__wntGridEvidence.latest?.instanceId||''})),{action,values});
}
async function diagnostics(){
 const previous=await page.evaluate(()=>__wntGridEvidence.sequence);await input('diagnostics');
 const d=await until(()=>page.evaluate(after=>__wntGridEvidence.sequence>after?__wntGridEvidence.latest:null,previous),Boolean,'native diagnostics');
 assert.equal(d.mode,'world','Keep the game on its command map');assert.equal(d.renderer,'Unreal Engine native UWorld');
 assert.equal(d.nativeWorldInitialized,true);assert.equal(d.modelLoadErrors,0);return d;
}
async function layout(){
 return page.evaluate(()=>{const n=document.querySelector('.native-world-input'),bounds=n?.getBoundingClientRect();
  if(!bounds||!bounds.width||!bounds.height)throw Error('Command map input is unavailable');
  // Match NativeWorldScene.viewportRect() in ui/unreal-scene.mjs. The full
  // canvas extends behind UI; its height is not the camera's ViewRect.W.
  const sidebar=document.querySelector('.sidebar')?.getBoundingClientRect(),panel=document.querySelector('.command-side-panel')?.getBoundingClientRect(),workspace=document.querySelector('.command-workspace')?.getBoundingClientRect();
  const left=Math.max(bounds.left+12,(sidebar?.right||0)+12),top=Math.max(bounds.top+12,(workspace?.top||0)+8);
  const right=panel&&panel.width<bounds.width*.5?panel.left-12:bounds.right-12;
  const width=Math.max(120,right-left),height=Math.max(120,bounds.bottom-top-48);
  return{x:left/innerWidth,y:top/innerHeight,width:width/innerWidth,height:height/innerHeight,cx:(left+width/2)/innerWidth,cy:(top+height/2)/innerHeight};});
}
async function focus(longitude,latitude,zoom){
 await input('focus',{longitude,latitude,zoom});
 await until(diagnostics,d=>Math.abs(d.zoom-zoom)<.0001,'focus');await delay(100);
}
async function resize(size){
 await input('resize',size);await until(diagnostics,d=>d.viewportWidth===size.width&&d.viewportHeight===size.height,'native resize',6000);
 await until(()=>page.evaluate(()=>({width:innerWidth,height:innerHeight})),d=>d.width===size.width&&d.height===size.height,'CEF alignment');await delay(130);
}
async function capture(name,size,details={}){
 assert(result.captures.length<28,'Capture count is bounded at28');assert(remaining()>0,'Capture budget exceeded');
 const nativeName='grid-'+stamp+'-'+name,source=path.join(captureDir,nativeName+'.png');
 assert(nativeName.length<100);const before=await fs.stat(source).catch(()=>null);
 const requestedAt=new Date().toISOString();await input('capture',{name:nativeName,includeUI:false});
 await until(()=>fs.stat(source).catch(()=>null),s=>s&&s.size>1000&&(!before||s.mtimeMs>before.mtimeMs),'fresh native PNG');
 const png=await until(()=>fs.readFile(source).catch(()=>null),b=>b&&b.subarray(-8,-4).toString()==='IEND','complete native PNG');
 assert.equal(png.readUInt32BE(16),size.width);assert.equal(png.readUInt32BE(20),size.height);
 const file=path.join(output,name+'.png');await fs.writeFile(file,png);
 const view=await layout(),d=await diagnostics();
 const crop={left:Math.max(0,Math.min(size.width-320,Math.round(size.width*view.cx)-160)),top:Math.max(0,Math.min(size.height-240,Math.round(size.height*view.cy)-120)),width:320,height:240};
 const row={name,file,kind:'native-Unreal-GPU',requestedAt,capturedAt:new Date().toISOString(),...size,...details,crop,cameraViewport:view,
  sha256:createHash('sha256').update(png).digest('hex'),diagnostics:d};
 result.captures.push(row);return row;
}
async function pan(dx,dy,size){
 const v=await layout();await input('pan',{x:v.cx,y:v.cy,previousX:v.cx-dx/size.width,previousY:v.cy-dy/size.height});await delay(95);
}
async function assertPaused(){
 const state=await page.evaluate(()=>({paused:!!document.querySelector('.actual-speed.is-paused'),clock:document.querySelector('.campaign-clock')?.textContent||null}));
 assert(state.paused,'A paused command-map campaign is required; this tool never changes simulation speed');return state.clock;
}
try{
 browser=await playwright.chromium.connectOverCDP(result.endpoint,{timeout:5000});
 const pages=browser.contexts().flatMap(c=>c.pages()).filter(p=>{try{const u=new URL(p.url());return u.hostname==='127.0.0.1'&&u.searchParams.get('unreal')==='1';}catch{return false;}});
 assert.equal(pages.length,1,'Exactly one local Unreal CEF page is required');page=pages[0];page.setDefaultTimeout(4500);
 assert.equal(await page.locator('.native-world-input').count(),1,'The isolated session must already be on its command map');
 initialClock=await assertPaused();
 await page.evaluate(()=>{if(globalThis.__wntGridEvidence)throw Error('A grid observer is already installed');
  const old=WNTUnreal.receive,d=globalThis.__wntGridEvidence={latest:null,sequence:0,errors:[],old,hook:null};
  d.hook=function(event){if(event.type==='diagnostics'){d.latest=structuredClone(event);d.sequence++;}if(event.type==='error')d.errors.push(structuredClone(event));return Reflect.apply(old,this,[event]);};WNTUnreal.receive=d.hook;});
 initial=await diagnostics();deadline=Date.now()+60000;result.captureStartedAt=new Date().toISOString();
 for(const size of sizes){
  const prefix=size.width+'x'+size.height;phase=prefix;await resize(size);await focus(0,0,8);
  await capture(prefix+'-fixed-a',size,{group:prefix+'-fixed',step:0,longitudeCrossing:0,latitudeCrossing:0});await delay(180);
  await capture(prefix+'-fixed-b',size,{group:prefix+'-fixed',step:1});
  for(let step=1;step<=3;step++){
   await pan(.5,.25,size);await capture(prefix+'-small-pan-'+step,size,{group:prefix+'-small-pan',step,requestedPanPixels:[.5,.25]});
  }
  for(const [step,zoom] of [7.8,8.2].entries()){
   await focus(0,0,zoom);await capture(prefix+'-zoom-'+step,size,{group:prefix+'-zoom',step,requestedZoom:zoom});
  }
  // At this ocean crossing target height is zero and pitch is zero. This is
  // the native controller's camera-distance formula, not a measured grid flag.
  const view=await layout(),base=(2*Math.PI*6371000*100)*.5*view.height/(2*Math.tan(Math.PI/8))*.99;
  const cases=[['above-on',17000000,true],['band-from-far',15000000,true],['below-off',13000000,false],['band-from-near',15000000,false],['above-on-again',17000000,true]];
  for(const [step,[label,heightCm,expectedGridVisible]] of cases.entries()){
   const zoom=base/heightCm;await focus(0,0,zoom);
   await capture(prefix+'-hysteresis-'+label,size,{group:prefix+'-hysteresis',step,derivedCameraHeightCm:heightCm,expectedGridVisible,visibilityRequiresVisualReview:true});
  }
  await focus(179.9,0,8);const pre=await capture(prefix+'-wrap-before',size,{group:prefix+'-wrap',step:0,longitudeCrossing:180,latitudeCrossing:0});
  await pan(-Math.max(12,size.width*.008),0,size);const post=await capture(prefix+'-wrap-after',size,{group:prefix+'-wrap',step:1});
  const delta=((post.diagnostics.longitude-pre.diagnostics.longitude+540)%360)-180;
  assert(pre.diagnostics.longitude>0&&post.diagnostics.longitude<0&&delta>0&&delta<10,'Pan must cross the actual dateline continuously');
  assert.equal(pre.diagnostics.primitiveComponentCount,post.diagnostics.primitiveComponentCount,'Wrap must not add primitive components');
  result.metrics.push({kind:'dateline-pan',...size,longitudeBefore:pre.diagnostics.longitude,longitudeAfter:post.diagnostics.longitude,continuousDeltaDegrees:delta});
  assert.equal(await assertPaused(),initialClock,'Grid capture must not advance the campaign clock');
 }
 result.captureFinishedAt=new Date().toISOString();result.captureElapsedMs=Date.now()-(deadline-60000);
 result.errors=await page.evaluate(()=>__wntGridEvidence.errors);assert.deepEqual(result.errors,[]);
 result.captureChecksPassed=true;
}catch(error){result.failure=error.stack;process.exitCode=1;}
finally{
 // Only camera and viewport were changed. Restore them without save/reload or
 // simulation commands, even if the capture budget was exhausted.
 deadline=Date.now()+8000;phase='restore';
 if(page&&initial){try{
  await resize({width:initial.viewportWidth,height:initial.viewportHeight});await focus(initial.longitude,initial.latitude,initial.zoom);
  const d=await diagnostics();result.restoration={passed:Math.abs(d.zoom-initial.zoom)<.0001,diagnostics:d};
  assert.equal(await assertPaused(),initialClock,'Simulation must remain paused at its original date');
 }catch(error){result.restoration={passed:false,error:error.stack};result.captureChecksPassed=false;process.exitCode=1;}}
 if(page)try{await page.evaluate(()=>{const d=globalThis.__wntGridEvidence;if(!d)return;if(WNTUnreal.receive===d.hook)WNTUnreal.receive=d.old;delete globalThis.__wntGridEvidence;});}catch{}
 if(browser)await browser.close();
}
if(sharp&&result.captures.length){
 try{
  const crops=[];let previous;
  for(const row of result.captures){
   const image=sharp(row.file).extract(row.crop),raw=await image.clone().removeAlpha().raw().toBuffer();
   const cropFile=path.join(output,row.name+'-crop.png');await image.clone().png().toFile(cropFile);row.cropFile=cropFile;
   if(previous?.group===row.group){
    const histogram=new Uint32Array(256);let total=0,changed=0;
    for(let i=0;i<raw.length;i++){const d=Math.abs(raw[i]-previous.raw[i]);histogram[d]++;total+=d;if(d>16)changed++;}
    let count=0,p95=0;for(;p95<255;p95++){count+=histogram[p95];if(count>=raw.length*.95)break;}
    result.metrics.push({kind:'crossing-crop-channel-difference',from:previous.name,to:row.name,meanAbsoluteChannelDifference:total/raw.length,p95ChannelDifference:p95,fractionChannelsChangingByMoreThan16:changed/raw.length,automaticVisualVerdict:null});
   }
   previous={group:row.group,name:row.name,raw};
   const label=Buffer.from('<svg width="320" height="28"><rect width="320" height="28" fill="#18242b"/><text x="7" y="18" font-family="sans-serif" font-size="11" fill="white">'+row.name+'</text></svg>');
   crops.push(await sharp({create:{width:320,height:268,channels:3,background:'#18242b'}}).composite([{input:await image.clone().png().toBuffer(),left:0,top:28},{input:label,left:0,top:0}]).png().toBuffer());
  }
  const file=path.join(output,'grid-contact-sheet.png');await sharp({create:{width:1280,height:Math.ceil(crops.length/4)*268,channels:3,background:'#101a20'}}).composite(crops.map((input,i)=>({input,left:(i%4)*320,top:Math.floor(i/4)*268}))).png().toFile(file);result.contactSheet=file;
 }catch(error){result.imageAnalysisError=error.stack;}
}else result.imageAnalysisUnavailable='Sharp is unavailable; use the original native PNGs for visual review.';
result.finishedAt=new Date().toISOString();const resultPath=path.join(output,'result.json');await fs.writeFile(resultPath,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({captureChecksPassed:result.captureChecksPassed,visualVerified:false,flickerCertified:false,captures:result.captures.length,report:resultPath,contactSheet:result.contactSheet,failure:result.failure,restoration:result.restoration?.passed}));
