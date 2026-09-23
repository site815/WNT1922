import {createRequire} from 'node:module';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createGameServer} from '../worker/desktop/server.mjs';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {newGame} from '../mechanics/engine.mjs';
import {contentFor} from '../mechanics/campaign-content.mjs';
import {beginEngagement} from '../mechanics/engagements.mjs';
import {campaignMinutes} from '../mechanics/campaign-clock.mjs';
import {validateSave} from '../mechanics/state-io.mjs';
let playwright;
try {playwright=createRequire(import.meta.url)('playwright');}
catch {playwright=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'))('playwright');}
const output=path.resolve('test-output/globe-ui');await fs.mkdir(output,{recursive:true});
const directory=await fs.mkdtemp(path.join(output,'save-')),savePath=path.join(directory,'campaign.json');
const initial=newGame(CATALOG,'USA',390039,'in_good_faith_1936');
initial.decisions=[];initial.paused=true;initial.autoPause=false;initial.audioEnabled=false;initial.musicEnabled=false;
Object.assign(initial.relations['JPN-USA'],{war:true,allied:false,warSince:initial.day});
const content=contentFor(CATALOG,initial),fleets=['USA','JPN'].map(id=>initial.nations[id].fleets.find(f=>f.role==='battle'));
const report=beginEngagement(initial,content,{kind:'surface',a:'USA',b:'JPN',fleetA:fleets[0].id,fleetB:fleets[1].id,region:'pacific',position:[160,20]});
report.mainRounds=5;report.durations=[30,30,15,45,15];report.nextStageAt=campaignMinutes(initial)+30;
validateSave(initial,CATALOG);await fs.writeFile(savePath,JSON.stringify(initial));
const server=await createGameServer({saveDir:directory});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await playwright.chromium.launch({channel:'msedge',headless:true});
const result={passed:false,checks:[],metrics:[],errors:[],externalRequests:[]};
let page;
const surface=target=>target.locator('.isometric-canvas');
const snapshot=target=>surface(target).evaluate(canvas=>({...canvas.dataset}));
const zoom=async target=>Number((await snapshot(target)).zoom);
async function key(target,name) {await surface(target).focus();await target.keyboard.press(name);}
async function home(target) {await key(target,'Home');assert.equal(await zoom(target),1);}
async function load(target) {
 await target.goto(origin);await target.locator('[data-action="continue"]').click();
 await target.waitForFunction(()=>document.querySelector('.isometric-canvas')?.dataset.renderer==='webgl2');
 await target.evaluate(async()=>{await (await import('/ui/voxel-models.mjs')).loadVoxelModels();});
}
async function save(target) {
 const response=target.waitForResponse(r=>r.url()===origin+'/api/save'&&r.request().method()==='POST');
 await target.locator('.sidebar [data-action="save"]').click();assert.equal((await response).status(),200);
 const state=JSON.parse(await fs.readFile(savePath,'utf8'));validateSave(state,CATALOG);return state;
}
async function watchContext(options={}) {
 const context=await browser.newContext({viewport:{width:1600,height:1000},...options});
 await context.route('**/*',route=>{
  const url=route.request().url();
  if(/^https?:/.test(url)&&new URL(url).origin!==origin){result.externalRequests.push(url);return route.abort();}
  return route.continue();
 });
 const target=await context.newPage();target.setDefaultTimeout(15000);
 target.on('pageerror',e=>result.errors.push({message:e.message,stack:e.stack}));
 return {context,target};
}
async function candidates(target,kind,id=null) {
 return target.locator('.isometric-accessibility [data-iso-kind]').evaluateAll((nodes,{kind,id})=>{
  const canvas=document.querySelector('.isometric-canvas').getBoundingClientRect();
  return nodes.filter(n=>n.dataset.isoKind===kind&&(!id||n.dataset.id===id)).map(n=>{
   const b=n.getBoundingClientRect();return{id:n.dataset.id,index:Number(n.dataset.hullIndex),label:n.getAttribute('aria-label'),
    x:canvas.x+Number(n.dataset.isoX),y:canvas.y+Number(n.dataset.isoY),width:b.width,height:b.height};
  }).filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&document.elementFromPoint(p.x,p.y)?.matches('.isometric-canvas')).sort((a,b)=>b.width-a.width);
 },{kind,id});
}
async function focusForce(target,kind='fleet') {
 await home(target);
 if(kind==='fleet')await target.locator('.fleet-command-row').first().click();
 for(let turn=0;turn<16;turn++) {
  for(const point of (await candidates(target,kind)).slice(0,10)) {
   await target.mouse.dblclick(point.x,point.y);await target.waitForTimeout(80);
   if(await zoom(target)===4096)return point;
   if(await zoom(target)!==1)break;
  }
  await home(target);for(let i=0;i<=turn;i++)await key(target,'ArrowRight');
 }
 throw Error('No directly clickable '+kind+' marker was found on the rotating globe');
}
async function hullPoint(target,kind='ship',id=null) {
 for(const point of (await candidates(target,kind,id)).slice(0,12)) {
  await target.mouse.move(1,1);await target.waitForTimeout(250);await target.mouse.move(point.x,point.y);await target.waitForTimeout(270);
  const tip=target.locator('.class-hover:not([hidden])'),text=await tip.count()?await tip.innerText():'';
  const expected=kind==='merchant'?'Merchant hull '+(point.index+1):'Hull '+(point.index+1)+' of';
  if(text.includes(expected)&&(kind==='merchant'||text.includes('Sailors aboard')))return point;
 }
 throw Error('No actual raycast '+kind+' surface produced the expected hull hover');
}
async function assertOwnHulls(target) {
 const ids=await target.locator('[data-iso-kind="ship"],[data-iso-kind="merchant"]').evaluateAll(nodes=>nodes.map(n=>({kind:n.dataset.isoKind,id:n.dataset.id})));
 const ownShips=new Set(initial.nations.USA.groups.map(g=>g.id)),ownConvoys=new Set(initial.nations.USA.convoys.map(c=>c.id));
 assert(ids.every(row=>(row.kind==='ship'?ownShips:ownConvoys).has(row.id)),'Enemy groups/convoys never become inspectable friendly hulls');
}
async function openArea(target) {
 return target.evaluate(()=>{const side=document.querySelector('.sidebar').getBoundingClientRect(),panel=document.querySelector('.command-side-panel').getBoundingClientRect(),work=document.querySelector('.workspace').getBoundingClientRect();return{x:(side.right+panel.left)/2,y:(work.top+innerHeight-55)/2,width:panel.left-side.right,height:innerHeight-work.top-55};});
}
async function drag(target,{dx,dy=0,shift=false}) {
 const p=await openArea(target);await target.mouse.move(p.x-dx/2,p.y-dy/2);
 if(shift)await target.keyboard.down('Shift');
 await target.mouse.down();await target.mouse.move(p.x+dx/2,p.y+dy/2,{steps:8});await target.mouse.up();
 if(shift)await target.keyboard.up('Shift');
}
async function graphics(target,suffix) {
 const info=await surface(target).evaluate(canvas=>{
  const gl=canvas.getContext('webgl2'),debug=gl.getExtension('WEBGL_debug_renderer_info'),rect=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);
  return{version:gl.getParameter(gl.VERSION),renderer:gl.getParameter(debug?debug.UNMASKED_RENDERER_WEBGL:gl.RENDERER),vendor:gl.getParameter(debug?debug.UNMASKED_VENDOR_WEBGL:gl.VENDOR),actual:[canvas.width,canvas.height],expected:[Math.ceil(rect.width*dpr),Math.ceil(rect.height*dpr)]};
 });
 assert.match(info.version,/WebGL 2/);assert.deepEqual(info.actual,info.expected);
 assert.equal(await target.locator('[data-iso-camera],.isometric-toolbar').count(),0);
 assert.equal(await target.locator('.map-legend .isometric-level').count(),1);
 assert.equal((await snapshot(target)).grid,'geographic');result.metrics.push({kind:'graphics',suffix,...info});
}
async function closeShips(target,width,suffix=String(width)) {
 await focusForce(target);const original=await surface(target).elementHandle();
 await key(target,'PageDown');assert.equal(await zoom(target),2560);assert.equal((await snapshot(target)).lod,'fleet');
 await key(target,'PageDown');assert.equal(await zoom(target),1600);assert.equal((await snapshot(target)).lod,'strategic');
 assert.equal(await target.locator('[data-iso-kind="ship"],[data-iso-kind="merchant"]').count(),0,'No individual meshes below2048×');
 await key(target,'PageUp');assert.equal((await snapshot(target)).lod,'fleet');await assertOwnHulls(target);
 let hit=await hullPoint(target),beforeZoom=await zoom(target),initialBounds={width:hit.width,height:hit.height};const times=[];
 for(let i=0;i<16&&(await zoom(target))<65536;i++) {
  const start=performance.now();await target.mouse.move(hit.x,hit.y);await target.mouse.wheel(0,-160);
  const previous=beforeZoom;await target.waitForFunction(z=>Number(document.querySelector('.isometric-canvas')?.dataset.zoom)>z,previous);
  await target.waitForTimeout(90);beforeZoom=await zoom(target);times.push({zoom:beforeZoom,milliseconds:Math.round(performance.now()-start)});
 }
 result.metrics.push({kind:'wheel-traversal',suffix,times});
 assert.equal(await zoom(target),65536);await key(target,'PageUp');assert.equal(await zoom(target),65536,'Maximum clamps under keyboard input');
 assert(await original.evaluate(node=>node===document.querySelector('.isometric-canvas')),'The same canvas traverses fleet and individual ship scales');
 hit=await hullPoint(target,'ship',hit.id);assert(hit.width>initialBounds.width*5,'Close zoom materially enlarges actual geometry');
 await target.mouse.click(hit.x,hit.y);await target.locator('[data-dialog-type="ship"]').waitFor();
 assert.equal(await target.locator('[data-dialog-type="ship"]').getAttribute('data-key'),'dialog-ship-'+hit.id,'The picked mesh opens its exact recorded ship group');
 assert.match(await target.locator('.modal').innerText(),/Sailors aboard/);await target.locator('.modal [data-action="close"]').first().click();
 const before=await snapshot(target);await drag(target,{dx:50,dy:35,shift:true});const after=await snapshot(target);
 assert.notEqual(after.cameraHeading,before.cameraHeading);assert.notEqual(after.cameraTilt,before.cameraTilt);assert.equal(after.zoom,before.zoom);
 assert.equal(await target.locator('.modal').count(),0,'Orbit drag never opens a ship');
 const anchor=(await candidates(target,'ship',hit.id)).find(p=>p.index===hit.index);assert(anchor,'The inspected hull remains visible after orbit');
 await target.mouse.move(anchor.x,anchor.y);await target.mouse.down();await target.mouse.move(anchor.x+28,anchor.y+18,{steps:6});await target.mouse.up();
 const panned=(await candidates(target,'ship',hit.id)).find(p=>p.index===hit.index);assert(panned,'The same hull remains visible after pitched dragging');
 assert(Math.hypot(panned.x-anchor.x-28,panned.y-anchor.y-18)<6,'Pitched drag follows the grabbed surface location without a screen-axis jump');
 assert.equal(await zoom(target),65536);assert.equal(await target.locator('.modal').count(),0);
 await assertOwnHulls(target);await target.mouse.move(1,1);await target.screenshot({path:path.join(output,'ship-'+suffix+'.png')});
 result.metrics.push({kind:'ship-zoom',width,suffix,initialBounds,closeBounds:{width:hit.width,height:hit.height},times,heading:after.cameraHeading,tilt:after.cameraTilt});
 assert(times.every(row=>row.milliseconds<7000),'Ship zoom remains responsive');await home(target);assert.equal((await snapshot(target)).lod,'strategic');await graphics(target,suffix);
}
async function merchantCheck(target) {
 const force=await focusForce(target,'convoy');assert(initial.nations.USA.convoys.some(c=>c.id===force.id));
 const point=await hullPoint(target,'merchant');await assertOwnHulls(target);
 await target.mouse.click(point.x,point.y);await target.locator('.merchant-inspection').waitFor();
 await target.waitForFunction(({id,index})=>{const n=document.querySelector('.merchant-inspection');return n?.dataset.convoyId===id&&n.dataset.hullIndex===String(index)&&n.textContent.includes('Merchant hull '+(index+1));},point);
 assert.equal(await target.locator('.merchant-inspection').getAttribute('data-convoy-id'),point.id);
 assert.equal(await target.locator('.merchant-inspection').getAttribute('data-hull-index'),String(point.index));
 assert.match(await target.locator('.merchant-inspection').innerText(),/GRT|cargo|voyage/i);
 await target.screenshot({path:path.join(output,'merchant-inspection.png')});result.metrics.push({kind:'merchant-pointer',id:point.id,index:point.index});
 await target.locator('.sidebar [data-view="command"]').click();await home(target);
}
async function battleChecks(target) {
 await target.locator('.decisive-alert [data-action="watch-battle"]').click();await target.locator('.battle-canvas').waitFor();
 assert.equal(await target.locator('.battle-canvas').getAttribute('data-renderer'),'webgl');
 assert.equal(await target.locator('.battle-canvas').getAttribute('data-projection'),'perspective');
 const overlay=await target.locator('.battle-scene3d-overlay').evaluate(node=>{const a=node.getBoundingClientRect(),b=document.querySelector('.battle-canvas').getBoundingClientRect();return {overlay:[a.x,a.y,a.width,a.height],canvas:[b.x,b.y,b.width,b.height]};});
 assert(overlay.overlay.every((value,i)=>Math.abs(value-overlay.canvas[i])<1.5),'Battle labels align to the real canvas rather than the modal origin');
 result.metrics.push({kind:'battle-overlay',...overlay});
 for(const action of ['pause','step-minute','step-six-hours'])assert(await target.locator('[data-action="'+action+'"]').isDisabled());
 const start=Number(await target.locator('.battle-canvas').getAttribute('data-frame-at'));
 await target.locator('[data-action="battle-next"]').click();await target.waitForFunction(at=>Number(document.querySelector('.battle-canvas')?.dataset.frameAt)===at+15,start);
 const advanced=await save(target);assert.equal(campaignMinutes(advanced),start+15);assert(advanced.paused);
 await target.locator('[data-action="battle-previous"]').click();assert.equal(Number(await target.locator('.battle-canvas').getAttribute('data-frame-at')),start);
 await target.locator('[data-action="battle-next"]').click();const replayed=await save(target);assert.equal(campaignMinutes(replayed),start+15);assert.equal(replayed.rng,advanced.rng);
 await target.screenshot({path:path.join(output,'battle.png')});await target.locator('.modal [data-action="close"]').first().click();assert.match(await target.locator('[data-action="pause"]').innerText(),/Resume/);
 await target.reload();await target.locator('[data-action="continue"]').click();await target.locator('.decisive-alert [data-action="watch-battle"]').click();
 await target.locator('.battle-canvas').waitFor();assert.equal(Number(await target.locator('.battle-canvas').getAttribute('data-frame-at')),start+15);
 await target.locator('[data-action="battle-first"]').click();assert.equal(Number(await target.locator('.battle-canvas').getAttribute('data-frame-at')),start);
 await target.locator('.modal [data-action="close"]').first().click();result.checks.push('Battle watch pauses; live Next advances exactly15minutes; replay does not advance time/RNG; reload preserves recorded frames.');
}
async function trianglePicking(target) {
 const picks=await target.evaluate(async()=>{
  const THREE=await import('/ui/vendor/three/three.module.js');
  const {WorldScene3D}=await import('/ui/world-scene3d.mjs');
  const {createVoxelMesh}=await import('/ui/three-vessels.mjs');
  const {globeTerrain,geoVector}=await import('/ui/globe-geometry.mjs');
  const camera=new THREE.PerspectiveCamera(44,1,.001,500);camera.position.set(0,0,140);camera.lookAt(0,0,100);camera.updateProjectionMatrix();camera.updateMatrixWorld();
  const pixel=point=>{const p=point.clone().project(camera);return[(p.x+1)*400,(1-p.y)*400];};
  const mesh=createVoxelMesh({id:'browser-ray-proof',name:'Ray proof',parts:[{x:0,y:0,z:0,w:12,d:2,h:1,color:'#889999'},{x:0,y:0,z:1,w:2,d:4,h:3,color:'#cccccc'}]});
  mesh.rotation.x=Math.PI/2;mesh.position.set(0,0,100.001);mesh.userData.selection={kind:'ship',id:'ray-proof'};mesh.updateMatrixWorld();
  const receiver={camera,width:800,height:800,raycaster:new THREE.Raycaster(),shipMeshes:new Map([['qa',mesh]]),markerMeshes:new Map(),terrain:new THREE.Group()};
  const pick=(point,land=false)=>WorldScene3D.prototype.pick.call(receiver,pixel(point),land);
  const hull=pick(new THREE.Vector3(0,0,102)),emptyCorner=pick(new THREE.Vector3(5,-1.8,100.5));
  // This is inside the projected full-model bounding rectangle but outside all
  // cuboids. A rectangle picker would incorrectly select the hull here.
  const corners=[];mesh.geometry.computeBoundingBox();const b=mesh.geometry.boundingBox;
  for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])corners.push(pixel(new THREE.Vector3(x,y,z).applyMatrix4(mesh.matrixWorld)));
  const air=pixel(new THREE.Vector3(5,-1.8,100.5));
  const insideBounds=air[0]>Math.min(...corners.map(p=>p[0]))&&air[0]<Math.max(...corners.map(p=>p[0]))&&air[1]>Math.min(...corners.map(p=>p[1]))&&air[1]<Math.max(...corners.map(p=>p[1]));
  receiver.shipMeshes.clear();receiver.terrain=globeTerrain({features:[{id:'qa-territory',name:'QA coast',owner:'USA',geometry:{type:'Polygon',coordinates:[[[-10,-10],[10,-10],[10,10],[-10,10],[-10,-10]]]}}]});
  receiver.terrain.updateMatrixWorld();camera.position.set(0,0,340);camera.lookAt(0,0,100);camera.updateMatrixWorld();
  // Stay inside a triangle instead of exactly on the equator tessellation edge.
  const nearBorder=pick(geoVector([9.9,.1]),true);
  receiver.terrain.traverse(o=>{o.geometry?.dispose();for(const m of [].concat(o.material||[]))m.dispose();});
  return{hull,emptyCorner,insideBounds,nearBorder};
 });
 assert.equal(picks.hull?.id,'ray-proof');assert(picks.insideBounds);assert.equal(picks.emptyCorner,null);
 assert.equal(picks.nearBorder?.id,'qa-territory','A border line never intercepts selection of the real land mesh beneath it');
 result.metrics.push({kind:'triangle-raycaster',...picks});
 result.checks.push('Production raycaster selects actual cuboid triangles, rejects empty air inside their projected rectangle, and finds coastal land beneath decorative border lines.');
}
try {
 const primary=await watchContext();page=primary.target;await load(page);const baseline=await save(page);await graphics(page,'desktop');
 await trianglePicking(page);
 const targetCount=await page.locator('.isometric-accessibility [data-iso-kind]').count();assert(targetCount>0);
 await page.locator('[data-action="menu"]').click();await page.locator('[data-action="title-screen"]').click();
 await page.locator('[data-action="continue"]').click();await page.waitForFunction(()=>document.querySelectorAll('.isometric-accessibility [data-iso-kind]').length>0);
 await graphics(page,'same-size-remount');result.checks.push('Title→Continue remount restores full-resolution WebGL and actual chart targets at the same viewport size.');
 const first=await surface(page).elementHandle();let wrapped=false,previous=Number((await snapshot(page)).worldRotation);
 for(let i=0;i<14;i++){await drag(page,{dx:-250});const now=Number((await snapshot(page)).worldRotation);if(Math.abs(now-previous)>180)wrapped=true;assert(now>=-180&&now<=180);previous=now;}
 assert(wrapped,'Dragging crosses the longitude seam rather than reaching a map edge');assert(await first.evaluate(node=>node===document.querySelector('.isometric-canvas')));
 await page.screenshot({path:path.join(output,'wrapped-globe.png')});await home(page);
 result.checks.push('One WebGL2 globe rotates continuously across180° longitude; geographic grid and zoom readout remain present without camera buttons.');
 for(const width of [1920,1366,1100,900,768]) {
  await page.setViewportSize({width,height:width>=1600?1000:768});await page.waitForTimeout(180);await home(page);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Globe chrome fits '+width);
  await page.screenshot({path:path.join(output,'globe-'+width+'.png')});if([1920,768].includes(width))await closeShips(page,width);
 }
 result.checks.push('Five viewport widths; real fleet double-click, keys and wheel traverse2048× LOD to65536×; mesh hover/click and Shift-drag orbit work at desktop and narrow widths.');
 await page.setViewportSize({width:1600,height:1000});await page.waitForTimeout(180);await merchantCheck(page);
 result.checks.push('Own merchant hulls have real pointer hover/selection and convoy cargo details; foreign navy/convoy records never appear as inspectable hulls.');
 const after=await save(page);for(const field of ['day','minute','rng','paused','nations','reports','diplomaticOffers'])assert.deepEqual(after[field],baseline[field],'Camera and hull inspection preserve campaign '+field);
 await battleChecks(page);
 const dense=await watchContext({viewport:{width:1920,height:1000},deviceScaleFactor:2});
 try{await load(dense.target);await closeShips(dense.target,1920,'1920-dpr2');}catch(error){await dense.target.screenshot({path:path.join(output,'failure-dpr2.png')});throw error;}finally{await dense.context.close();}
 result.checks.push('DPR2 preserves WebGL buffer resolution and maximum-zoom picking/orbit; camera-only interactions leave simulation, resources and RNG unchanged.');
 assert.deepEqual(result.errors,[]);assert.deepEqual(result.externalRequests,[]);result.passed=true;console.log(JSON.stringify(result,null,2));
}catch(error){result.failure=error.stack;if(page)await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});console.error(error.stack);process.exitCode=1;}
finally{await fs.writeFile(path.join(output,'result.json'),JSON.stringify(result,null,2));await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
