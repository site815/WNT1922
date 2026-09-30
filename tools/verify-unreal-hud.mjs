// Protocol/layout smoke only. This does not replace Unreal compilation, rendering or GPU tests.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createGameServer} from '../worker/desktop/server.mjs';

const option = name => process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const modulePath = option('--playwright');
const {chromium} = await import(modulePath ? pathToFileURL(modulePath).href : 'playwright');
const output = path.resolve('test-output/unreal-hud'); await fs.mkdir(output,{recursive:true});
const saveDir = await fs.mkdtemp(path.join(output,'saves-'));
const server = await createGameServer({saveDir,publicDirectory:path.resolve('.')});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({channel:option('--channel')||'msedge',headless:true});
try {
  const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  context.setDefaultTimeout(20000);
  const errors = [], external = [];
  context.on('page', page=>page.on('pageerror',error=>{errors.push(error.message);console.error(error.message);}));
  await context.addInitScript(()=>{
    window.__nativeCalls=[]; window.__webglCalls=0;
    const get=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(kind,...args){
      if(String(kind).includes('webgl')) {window.__webglCalls++;throw new Error('WebGL is forbidden in native mode');}
      return get.call(this,kind,...args);
    };
    const record=method=>async json=>{
      const packet=JSON.parse(json); window.__nativeCalls.push({method,packet});
      if(method==='viewport'&&packet.mode==='world') queueMicrotask(()=>window.WNTUnreal?.receive({instanceId:packet.instanceId,type:'camera',zoom:1,longitude:0,latitude:0,tilt:0}));
    };
    window.ue={wnt:{world:record('world'),battle:record('battle'),sceneinput:record('sceneinput'),viewport:record('viewport'),closeapproved:async saved=>saved}};
  });
  const page = await context.newPage();
  page.on('request',request=>{if(!request.url().startsWith(origin)&&!request.url().startsWith('data:')&&!request.url().startsWith('blob:'))external.push(request.url());});
  await page.goto(origin+'/?unreal=1');
  await page.waitForFunction(()=>window.__nativeCalls.some(c=>c.method==='battle'));
  assert.equal(await page.evaluate(()=>window.__webglCalls),0);
  assert.equal(await page.locator('.unreal-scene-mask').count(),1);
  // Short windows scroll the opening battle without changing canvas size.
  // Its native viewport must follow that movement before a pointer-down occurs.
  await page.setViewportSize({width:888,height:500});
  await page.locator('.start-demo [data-demo-action="fit"]').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{
    const rect=document.querySelector('.battle-canvas').getBoundingClientRect();
    const p=window.__nativeCalls.filter(c=>c.method==='viewport'&&c.packet.mode==='battle').at(-1)?.packet;
    return p&&Math.abs(p.y-rect.top/innerHeight)<1e-6;
  });
  await page.locator('.start-screen').evaluate(n=>{n.scrollTop=0;});
  await page.waitForFunction(()=>{
    const rect=document.querySelector('.battle-canvas').getBoundingClientRect();
    const p=window.__nativeCalls.filter(c=>c.method==='viewport'&&c.packet.mode==='battle').at(-1)?.packet;
    return p&&Math.abs(p.y-rect.top/innerHeight)<1e-6;
  });
  await page.setViewportSize({width:1440,height:1000});
  const battle = await page.evaluate(()=>window.__nativeCalls.find(c=>c.method==='battle').packet);
  assert(battle.units.length>1); assert.equal(battle.animate,false);
  const parentsTransparent = await page.locator('.battle-canvas').evaluate(canvas=>{
    const result=[]; for(let node=canvas;node;node=node.parentElement) result.push({tag:node.tagName,class:node.className,color:getComputedStyle(node).backgroundColor,image:getComputedStyle(node).backgroundImage});return result;
  });
  for(const node of parentsTransparent) {assert.equal(node.color,'rgba(0, 0, 0, 0)',JSON.stringify(node));assert.equal(node.image,'none',JSON.stringify(node));}
  await page.screenshot({path:path.join(output,'native-title-hud.png')});
  await page.locator('[data-action="new"]').click();
  await page.waitForFunction(()=>window.__nativeCalls.some(c=>c.method==='world'));
  await page.waitForSelector('.native-world-surface .unreal-input');
  const dispatch=page.locator('.diplomatic-dispatch [data-action="defer-decision"]').first();
  if(await dispatch.count()) await dispatch.click();
  const before = await page.evaluate(()=>window.__nativeCalls.filter(c=>c.method==='viewport').length);
  await page.waitForTimeout(650);
  const after = await page.evaluate(()=>window.__nativeCalls.filter(c=>c.method==='viewport').length);
  assert(after-before<5,'Camera/DOM redraw feedback loop');
  const packet=await page.evaluate(()=>window.__nativeCalls.filter(c=>c.method==='world').at(-1).packet);
  assert(packet.forces.some(f=>f.hulls.length)); assert(packet.ports.length>0);
  const surface=page.locator('.native-world-surface canvas');
  const transparent=await surface.evaluate(canvas=>{
    const result=[];for(let node=canvas;node;node=node.parentElement)result.push({class:node.className,color:getComputedStyle(node).backgroundColor,image:getComputedStyle(node).backgroundImage});return result;
  });
  for(const node of transparent) {assert.equal(node.color,'rgba(0, 0, 0, 0)',JSON.stringify(node));assert.equal(node.image,'none',JSON.stringify(node));}
  const clearPoint=await page.evaluate(()=>{
    const p=window.__nativeCalls.filter(c=>c.method==='viewport'&&c.packet.mode==='world').at(-1).packet;
    return {x:(p.x+p.width/2)*innerWidth,y:(p.y+p.height/2)*innerHeight};
  });
  await page.screenshot({path:path.join(output,'native-world-before-input.png')});
  await page.mouse.move(clearPoint.x,clearPoint.y); await page.mouse.wheel(0,-200);
  await page.waitForFunction(()=>window.__nativeCalls.some(c=>c.method==='sceneinput'&&c.packet.action==='zoom'));
  // A quick move followed by a stop must report the final position even when
  // both pointer events arrive inside the native hover rate limit.
  const finalHover=await surface.evaluate((canvas,point)=>{
    for(const offset of [2,12])canvas.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:point.x+offset,clientY:point.y}));
    return {x:(point.x+12)/innerWidth,y:point.y/innerHeight};
  },clearPoint);
  await page.waitForFunction(expected=>{
    const last=window.__nativeCalls.filter(c=>c.method==='sceneinput'&&c.packet.action==='hover').at(-1)?.packet;
    return last&&Math.abs(last.x-expected.x)<1e-6&&Math.abs(last.y-expected.y)<1e-6;
  },finalHover);
  const own=packet.forces.flatMap(f=>f.hulls).find(h=>h.status!=='underway');
  assert(own);
  await page.evaluate(hull=>{
    const active=window.__nativeCalls.filter(c=>c.method==='viewport'&&c.packet.mode==='world').at(-1).packet;
    window.WNTUnreal.receive({type:'select',instanceId:active.instanceId,selection:{kind:'ship',id:hull.id,hullIndex:hull.hullIndex}});
  },own);
  await page.waitForSelector('[data-dialog-type="ship"]');
  await page.locator('[data-dialog-type="ship"] [data-action="close"]').first().click();
  await page.evaluate(()=>window.saveForDesktopClose());
  assert.equal((await fetch(origin+'/api/save')).status,200);
  await page.setViewportSize({width:1000,height:800});
  await page.screenshot({path:path.join(output,'native-campaign-hud.png')});
  assert.equal(await page.evaluate(()=>window.__webglCalls),0);
  assert.deepEqual(errors,[]); assert.deepEqual(external,[]);
  await context.close();
  // Browser startup must direct users to Unreal without loading a legacy renderer.
  const legacy = await browser.newContext({viewport:{width:1200,height:800},reducedMotion:'reduce'});
  const legacyPage = await legacy.newPage(); legacyPage.on('pageerror',error=>errors.push(error.message));
  await legacyPage.goto(origin); await legacyPage.getByText('Open WNT1922 in Unreal Engine', {exact:true}).waitFor();
  assert.equal(await legacyPage.locator('html.unreal-mode').count(),0);
  assert.deepEqual(errors,[]);
  await legacy.close();
  console.log('Native HUD protocol, transparent scene apertures, input, picking callback, save close, narrow layout and Unreal launch guidance passed. Unreal rendering was not exercised.');
} finally {
  await browser.close(); server.closeAllConnections(); await new Promise(resolve=>server.close(resolve));
}
