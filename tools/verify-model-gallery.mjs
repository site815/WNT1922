// Headless HUD/protocol verification only; this does not certify native rendering.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createGameServer} from '../worker/desktop/server.mjs';
const option=name=>process.argv.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
const modulePath=option('--playwright');
const {chromium}=await import(modulePath?pathToFileURL(modulePath).href:'playwright');
const output=path.resolve('test-output/model-gallery');await fs.mkdir(output,{recursive:true});
const saveDir=await fs.mkdtemp(path.join(output,'saves-'));
const server=await createGameServer({saveDir,publicDirectory:path.resolve('.')});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:option('--channel')||'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 const errors=[],writes=[];let indexRequests=0;
 await context.addInitScript(()=>{
  window.__nativeCalls=[];window.__heldHomes=[];window.__workers=0;window.__webgl=0;window.__galleryKeyLeaks=[];
  const WorkerClass=window.Worker;window.Worker=class extends WorkerClass{constructor(...args){window.__workers++;super(...args);}};
  const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){if(String(kind).includes('webgl')){window.__webgl++;throw Error('Gallery must use native rendering');}return get.call(this,kind,...args);};
  document.addEventListener('keydown',event=>{if(event.target.closest('.model-gallery'))window.__galleryKeyLeaks.push(event.key);});
  const record=method=>async json=>{
   const packet=JSON.parse(json);window.__nativeCalls.push({method,packet});
   if(method==='sceneinput'&&packet.action==='home'&&window.__holdNextHome){window.__holdNextHome=false;await new Promise(resolve=>window.__heldHomes.push(resolve));}
  };
  window.ue={wnt:{battle:record('battle'),world:record('world'),viewport:record('viewport'),sceneinput:record('sceneinput'),closeapproved:async x=>x}};
 });
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(new URL(request.url()).pathname==='/api/save'&&request.method()!=='GET')writes.push(request.method());});
 await page.route('**/assets/models/ships/index.json',async route=>{indexRequests++;await new Promise(resolve=>setTimeout(resolve,150));await route.continue();});
 await page.goto(origin+'/?unreal=1');await page.locator('.start-screen').waitFor();
 assert.equal(await page.locator('.start-screen canvas').count(),0);
 const open=()=>page.locator('[data-action="ship-gallery"]').click();
 const gallery=page.locator('.model-gallery'),select=gallery.locator('select'),close=gallery.locator('[data-gallery="close"]');
 const activeId=()=>page.evaluate(()=>window.__nativeCalls.filter(c=>c.method==='viewport'&&c.packet.mode==='battle').at(-1).packet.instanceId);
 const waitFit=async id=>page.waitForFunction(id=>document.querySelector('.model-gallery')?.dataset.galleryReady==='true'&&window.__nativeCalls.some(c=>c.method==='sceneinput'&&c.packet.instanceId===id&&c.packet.action==='zoom'),id);
 // Two queued clicks while metadata loads must share one gallery/session.
 await page.locator('[data-action="ship-gallery"]').focus();
 await page.evaluate(()=>{const button=document.querySelector('[data-action="ship-gallery"]');button.click();button.click();});
 await gallery.waitFor();const firstId=await activeId();await waitFit(firstId);
 assert.equal(await gallery.count(),1);assert.equal(indexRequests,1);
 assert.equal(await page.locator('#app').evaluate(el=>el.hidden&&el.inert&&getComputedStyle(el).display==='none'),true);
 const choices=await select.locator('option').allTextContents();assert(choices.length>=2,'Gallery needs independently selectable detailed models');
 const titleCalls=await page.evaluate(()=>window.__nativeCalls.filter(c=>c.method==='battle'&&!c.packet.id.startsWith('gallery-')).length);
 await page.waitForTimeout(3800);
 assert.equal(await page.evaluate(()=>window.__nativeCalls.filter(c=>c.method==='battle'&&!c.packet.id.startsWith('gallery-')).length),titleCalls,'Unexpected title battle overwrote gallery');
 assert.equal(await page.locator('.unreal-scene-mask').count(),1);
 const canvas=gallery.locator('canvas');
 const aperture=await canvas.evaluate(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height,bg:getComputedStyle(el).backgroundColor};});
 assert(aperture.width>200&&aperture.height>180);assert.equal(aperture.bg,'rgba(0, 0, 0, 0)');
 await canvas.click();
 await page.waitForFunction(id=>window.__nativeCalls.some(c=>c.method==='sceneinput'&&c.packet.instanceId===id&&c.packet.action==='pick'),firstId);
 await page.evaluate(id=>window.WNTUnreal.receive({type:'select',instanceId:id,selection:{id:'gallery-ship',side:'A',hullIndex:0,label:'Ray-picked gallery ship'}}),firstId);
 assert.match(await gallery.locator('[role="status"]').textContent(),/Ray-picked gallery ship.*selected/);
 await canvas.press('1');await canvas.press('+');assert.deepEqual(await page.evaluate(()=>window.__galleryKeyLeaks),[]);
 await gallery.locator('summary').click();assert(await gallery.locator('.model-gallery-info').isVisible());assert(await gallery.locator('.model-gallery-info a').count());
 await page.screenshot({path:path.join(output,'gallery-wide-protocol.png')});
 // An old fit must not apply its zoom after a newer model was selected.
 await page.evaluate(()=>{window.__holdNextHome=true;window.__fitStart=window.__nativeCalls.length;});
 await select.selectOption('1');await page.waitForFunction(()=>window.__heldHomes.length===1);
 await select.evaluate(el=>{el.value='0';el.dispatchEvent(new Event('change',{bubbles:true}));el.value=String(el.options.length-1);el.dispatchEvent(new Event('change',{bubbles:true}));});
 await page.evaluate(()=>window.__heldHomes.shift()());
 await page.waitForFunction(()=>window.__nativeCalls.slice(window.__fitStart).some(c=>c.method==='sceneinput'&&c.packet.action==='zoom'));
 const fits=await page.evaluate(()=>window.__nativeCalls.slice(window.__fitStart).filter(c=>c.method==='sceneinput'&&['zoom','focus'].includes(c.packet.action)));
 assert.deepEqual(fits.map(c=>c.packet.action),['focus','zoom']);assert(Number.isFinite(fits[1].packet.delta));
 await page.setViewportSize({width:760,height:640});
 const narrow=await canvas.boundingBox();assert(narrow.height>=180&&narrow.width<=760);
 assert(await close.isVisible());await page.screenshot({path:path.join(output,'gallery-narrow-protocol.png')});
 // Closing during an in-flight native call must leave the restored static main menu alone.
 await page.evaluate(()=>window.__holdNextHome=true);await gallery.locator('[data-gallery="fit"]').click();await page.waitForFunction(()=>window.__heldHomes.length===1);
 await close.click();await page.waitForSelector('.start-screen');const closedAt=await page.evaluate(()=>window.__nativeCalls.length);
 await page.evaluate(()=>window.__heldHomes.shift()());await page.waitForTimeout(150);
 assert.deepEqual(await page.evaluate(({closedAt,firstId})=>window.__nativeCalls.slice(closedAt).filter(c=>c.method==='sceneinput'&&c.packet.instanceId===firstId),{closedAt,firstId}),[]);
 assert.equal(await gallery.count(),0);assert.equal(await page.locator('.unreal-scene-mask').count(),0);
 assert.equal(await page.locator('#app').evaluate(el=>!el.hidden&&!el.inert),true);
 assert.equal(await page.evaluate(()=>document.activeElement?.dataset.action),'ship-gallery');
 // Also close during initial show/fit, before openModelGallery has resolved.
 await page.evaluate(()=>window.__holdNextHome=true);await open();await gallery.waitFor();await page.waitForFunction(()=>window.__heldHomes.length===1);
 const secondId=await activeId();assert.notEqual(secondId,firstId);await close.click();await page.evaluate(()=>window.__heldHomes.shift()());await page.waitForTimeout(150);
 await open();await gallery.waitFor();const thirdId=await activeId();await waitFit(thirdId);assert.notEqual(thirdId,secondId);
 await gallery.locator('select').press('Escape');assert.equal(await gallery.count(),0);assert.equal(await page.locator('.unreal-scene-mask').count(),0);
 // Bad/missing external metadata must restore the title controls and allow retry.
 let failMetadata=true;
 await page.route('**/*.source.json',async route=>{if(failMetadata){failMetadata=false;await route.fulfill({status:503,body:'Metadata unavailable'});}else await route.continue();});
 await open();await page.waitForFunction(()=>document.querySelector('#toast')?.textContent==='Could not load the ship gallery.');
 assert.equal(await gallery.count(),0);assert.equal(await page.locator('#app').evaluate(el=>!el.hidden&&!el.inert),true);
 await open();await gallery.waitFor();await waitFit(await activeId());await close.click();
 assert.equal(await page.evaluate(()=>window.__workers),0);assert.equal(await page.evaluate(()=>window.__webgl),0);assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
 await context.close();
 console.log('Gallery metadata, aperture, pick callback, keyboard isolation, duplicate opening, rapid selection, pending-close, repeated reopen and no campaign writes passed. Native rendering was not exercised.');
}finally{await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
