import {createRequire} from 'node:module';
import {createGameServer} from '../worker/desktop/server.mjs';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {newGame} from '../mechanics/engine.mjs';
import {contentFor} from '../mechanics/campaign-content.mjs';
import {beginEngagement} from '../mechanics/engagements.mjs';
import {campaignMinutes} from '../mechanics/campaign-clock.mjs';
import {validateSave} from '../mechanics/state-io.mjs';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
let playwright;
try {playwright=createRequire(import.meta.url)('playwright');}
catch {playwright=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'))('playwright');}
const output=path.resolve('test-output/scene-ui'); await fs.mkdir(output,{recursive:true});
const state=newGame(CATALOG,'USA',360036,'in_good_faith_1936');
state.decisions=[]; state.paused=true; state.autoPause=false;
Object.assign(state.relations['JPN-USA'],{war:true,allied:false,warSince:state.day});
const content=contentFor(CATALOG,state);
const forces=['USA','JPN'].map(id=>state.nations[id].fleets.find(f=>f.role==='battle'));
const report=beginEngagement(state,content,{kind:'surface',a:'USA',b:'JPN',fleetA:forces[0].id,fleetB:forces[1].id,region:'pacific',position:[160,20]});
report.mainRounds=5; report.durations=[30,30,15,45,15]; report.nextStageAt=campaignMinutes(state)+30;
assert(report.decisive.qualifies); validateSave(state,CATALOG);
const savePath=path.join(output,'campaign.json'); await fs.writeFile(savePath,JSON.stringify(state));
const server=await createGameServer({saveDir:output}); await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await playwright.chromium.launch({channel:'msedge',headless:true});
const checks=[],errors=[],metrics=[];
let page;
try {
 page=await browser.newPage({viewport:{width:1600,height:1000}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port);
 await page.locator('[data-action="continue"]').click(); await page.locator('.isometric-canvas').waitFor();
 await page.evaluate(async()=>{const m=await import('/ui/voxel-models.mjs');await m.loadVoxelModels();});
 assert.equal(await page.locator('.modal').count(),0,'battle alerts do not open a viewer automatically');
 await page.locator('.decisive-alert [data-action="watch-battle"]').waitFor();
 assert.equal(await page.locator('.isometric-canvas').getAttribute('data-lod'),'strategic');
 const menus=await page.locator('.sidebar .nav-item').evaluateAll(nodes=>nodes.map(n=>n.dataset.view));
 for(const width of [1920,1366,1100,900,768]) {
  await page.setViewportSize({width,height:width>=1600?1000:768});
  for(const menu of menus) {
   await page.locator('.sidebar [data-view="'+menu+'"]').click();
   await page.locator('.workspace.view-'+menu).waitFor();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),menu+' fits '+width);
   assert(!/\b(?:NaN|undefined|Infinity)\b/.test(await page.locator('.workspace').innerText()),menu+' values finite');
  }
  await page.locator('.sidebar [data-view="command"]').click();
  await page.locator('[data-iso-camera="world"], [data-iso-camera="home"]').click();
  await page.locator('[data-iso-camera="fleet"]').click();
  await page.waitForFunction(()=>document.querySelector('.isometric-canvas')?.dataset.lod==='fleet');
  assert(Number(await page.locator('.isometric-canvas').getAttribute('data-visible-hulls'))>0);
  const point=await page.locator('[data-iso-kind="ship"]').evaluateAll(nodes=>nodes.map(n=>({box:n.getBoundingClientRect(),id:n.dataset.id,index:Number(n.dataset.hullIndex)})).sort((a,b)=>b.box.width-a.box.width).map(({box,id,index})=>({x:box.x+box.width/2,y:box.y+box.height/2,id,index})).find(p=>document.elementFromPoint(p.x,p.y)?.matches('.isometric-canvas')));
  assert(point,'uncovered clickable ship at '+width);
  await page.mouse.move(point.x,point.y);
  await page.locator('.class-hover:not([hidden]) .recognition-thumbnail img').waitFor();
  assert.match(await page.locator('.class-hover').innerText(),/Sailors aboard/);
  await page.mouse.click(point.x,point.y);
  await page.locator('[data-dialog-type="ship"]').waitFor();
  assert.match(await page.locator('.modal').innerText(),/Sailors aboard/);
  await page.locator('.modal [data-action="close"]').first().click();
  await page.mouse.move(1,1);
  await page.screenshot({path:path.join(output,'fleet-'+width+'.png')});
  metrics.push({width,...await page.locator('.isometric-canvas').evaluate(n=>({...n.dataset}))});
  await page.locator('[data-iso-camera="home"]').click();
  assert.equal(await page.locator('.isometric-canvas').getAttribute('data-lod'),'strategic');
 }
 checks.push('All ministry menus and world↔fleet zoom at five widths; actual canvas ship hover loads artwork and a pointer click opens ship details.');
 await page.setViewportSize({width:1600,height:1000});
 await page.screenshot({path:path.join(output,'strategic.png')});
 await page.locator('.decisive-alert [data-action="watch-battle"]').click();
 await page.locator('.battle-canvas').waitFor();
 assert.match(await page.locator('[data-action="pause"]').innerText(),/Resume/);
 for(const action of ['pause','step-minute','step-six-hours'])assert(await page.locator('[data-action="'+action+'"]').isDisabled(),'watcher owns time controls');
 assert(Number(await page.locator('.battle-canvas').getAttribute('data-visible-hulls'))>0);
 const original=Number(await page.locator('.battle-canvas').getAttribute('data-frame-at'));
 await page.locator('[data-action="battle-next"]').click();
 await page.waitForFunction(at=>Number(document.querySelector('.battle-canvas')?.dataset.frameAt)===at+15,original);
 assert.match(await page.locator('[data-action="pause"]').innerText(),/Resume/);
  await page.locator('[data-action="save"]').click();
 for(let i=0;i<100;i++) {
  if(campaignMinutes(JSON.parse(await fs.readFile(savePath,'utf8')))===original+15)break;
  await page.waitForTimeout(50);
 }
 const advanced=JSON.parse(await fs.readFile(savePath,'utf8')); assert.equal(campaignMinutes(advanced),original+15); validateSave(advanced,CATALOG);
 await page.locator('[data-action="battle-previous"]').click();
 assert.equal(Number(await page.locator('.battle-canvas').getAttribute('data-frame-at')),original);
 await page.locator('[data-action="battle-next"]').click();
 assert.equal(Number(await page.locator('.battle-canvas').getAttribute('data-frame-at')),original+15);
 await page.evaluate(()=>globalThis.saveForDesktopClose());
 const replayed=JSON.parse(await fs.readFile(savePath,'utf8')); assert.equal(campaignMinutes(replayed),original+15); assert.equal(replayed.rng,advanced.rng);
 for(let i=0;i<7;i++) {
  const at=Number(await page.locator('.battle-canvas').getAttribute('data-frame-at'));
  await page.locator('[data-action="battle-next"]').click();
  await page.waitForFunction(t=>Number(document.querySelector('.battle-canvas')?.dataset.frameAt)===t+15,at);
 }
 await page.locator('[data-action="battle-select"]').first().click();
 await page.locator('.battle-ship-inspection').waitFor();
 const canvas=await page.locator('.battle-canvas').boundingBox();
 await page.mouse.click(canvas.x+canvas.width/2,canvas.y+canvas.height/2);
 assert.match(await page.locator('.battle-ship-inspection').innerText(),/% damage|SUNK/);
 await page.locator('[data-action="battle-fit"]').click();
 await page.screenshot({path:path.join(output,'battle.png')});
 for(const width of [1366,900,768]) {
  await page.setViewportSize({width,height:768});
  await page.waitForTimeout(160);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const box=await page.locator('[data-dialog-type="battle-watch"]').boundingBox();
  assert(box.x>=0&&box.x+box.width<=width+1,'battle viewer fits viewport');
  await page.screenshot({path:path.join(output,'battle-'+width+'.png')});
 }
 await page.evaluate(()=>globalThis.saveForDesktopClose());
 const after=JSON.parse(await fs.readFile(savePath,'utf8')); validateSave(after,CATALOG);
 assert(after.reports.find(r=>r.id===report.id).replay.frames.length>=9);
 await page.locator('.modal [data-action="close"]').first().click();
 assert.match(await page.locator('[data-action="pause"]').innerText(),/Resume/);
 assert.equal(await page.locator('[data-action="pause"]').isDisabled(),false,'closing restores normal controls');
 await page.reload(); await page.locator('[data-action="continue"]').click();
 await page.locator('.decisive-alert [data-action="watch-battle"]').click();
 await page.locator('.battle-canvas').waitFor();
 assert.equal(Number(await page.locator('.battle-canvas').getAttribute('data-frame-at')),campaignMinutes(after));
 await page.locator('[data-action="battle-first"]').click();
 assert.equal(Number(await page.locator('.battle-canvas').getAttribute('data-frame-at')),original);
 checks.push('Watch explicitly pauses; live Next advances exactly 15 minutes; replay changes no time or RNG; ship inspection, responsive battle view, close-paused and save/reload replay verified.');
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({checks,metrics,errors},null,2));
} catch(error) {
 if(page)await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});
 console.error(JSON.stringify({checks,errors,metrics})); throw error;
} finally { await fs.writeFile(path.join(output,'result.json'),JSON.stringify({checks,metrics,errors},null,2));await browser.close();await new Promise(resolve=>server.close(resolve)); }
