// Isolated headless DOM/bridge regression. This does not launch Unreal or
// substitute for native rendering, camera fit or physical mouse verification.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createGameServer} from '../worker/desktop/server.mjs';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {newGame} from '../mechanics/engine.mjs';
import {contentFor} from '../mechanics/campaign-content.mjs';
import {beginEngagement} from '../mechanics/engagements.mjs';
import {saveEnvelope} from '../mechanics/state-io.mjs';

const option = name => process.argv.find(arg => arg.startsWith(name + '='))?.slice(name.length + 1);
const modulePath = option('--playwright');
const {chromium} = await import(modulePath ? pathToFileURL(modulePath).href : 'playwright');
const output = path.resolve('test-output/command-popups');
await fs.mkdir(output, {recursive:true});
const saveDir = await fs.mkdtemp(path.join(output, 'saves-'));
const server = await createGameServer({saveDir, publicDirectory:path.resolve('.')});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
const state = newGame(CATALOG, 'USA', 420042, 'in_good_faith_1936');
state.decisions = []; state.autoPause = false; state.paused = true;
Object.assign(state.relations['JPN-USA'], {war:true, allied:false, warSince:state.day});
const fleets = ['USA','JPN'].map(id => state.nations[id].fleets.find(f => f.role === 'battle'));
for (const fleet of fleets) fleet.aggressiveBattle = true;
const engagement = beginEngagement(state, contentFor(CATALOG,state), {kind:'surface',a:'USA',b:'JPN',fleetA:fleets[0].id,fleetB:fleets[1].id,region:'pacific',position:[160,20]});
assert((await fetch(origin + '/api/save', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(saveEnvelope(state))})).ok);
const browser = await chromium.launch({channel:option('--channel') || 'msedge',headless:true});
const errors = [], metrics = [];
try {
  const context = await browser.newContext({viewport:{width:1920,height:1080}, reducedMotion:'reduce'});
  context.setDefaultTimeout(12000);
  await context.addInitScript(() => {
    window.__nativeCalls = [];
    const record = method => async json => window.__nativeCalls.push({method,packet:JSON.parse(json)});
    window.ue = {wnt:{world:record('world'),battle:record('battle'),sceneinput:record('sceneinput'),viewport:record('viewport'),closeapproved:async()=>true}};
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/?unreal=1');
  await page.locator('[data-action="continue"]').click();
  await page.locator('.native-world-input').waitFor();
  await page.evaluate(() => {
    window.__worldCanvas = document.querySelector('.native-world-input');
    window.__outliner = document.querySelector('.command-side-panel');
    window.__worldInstance = window.__nativeCalls.filter(c=>c.method==='viewport'&&c.packet.mode==='world').at(-1).packet.instanceId;
  });
  const tabs = ['land','airwar','yards','aircraft','fleet','programs','diplomacy','economy','reports','review'];
  const sizes = [[900,500],[1800,1000],[1920,730],[1920,1080],[2560,1080],[3440,1440],[5120,2160]];
  for (const [width,height] of sizes) {
    await page.setViewportSize({width,height});
    await page.locator('.nav-item[data-view="command"]').click();
    await page.waitForTimeout(60);
    const baseline = await page.evaluate(() => ({
      viewport:window.__nativeCalls.filter(c=>c.method==='viewport').at(-1).packet,
      panel:document.querySelector('.command-side-panel').getBoundingClientRect().toJSON(),
      calls:window.__nativeCalls.length,
    }));
    for (const tab of tabs) {
      await page.locator('.nav-item[data-view="'+tab+'"]').click();
      await page.locator('.menu-popup.view-'+tab).waitFor();
      const layout = await page.evaluate(() => {
        const popup=document.querySelector('.menu-popup'),body=popup.querySelector('.workspace-inner'),panel=document.querySelector('.command-side-panel');
        const bounds=popup.getBoundingClientRect(),p=panel.getBoundingClientRect(),close=popup.querySelector('.workspace-close').getBoundingClientRect();
        return {popup:bounds.toJSON(),mapLeft:document.querySelector('.menu-layer').getBoundingClientRect().left,panel:p.toJSON(),close:close.toJSON(),bodyWidth:body.clientWidth,bodyScrollWidth:body.scrollWidth,
          sameCanvas:window.__worldCanvas===document.querySelector('.native-world-input'),samePanel:window.__outliner===panel,
          worldCanvases:document.querySelectorAll('.native-world-input').length,
          panelHit:!!document.elementFromPoint(p.left+10,p.top+10)?.closest('.command-side-panel'),
          viewport:window.__nativeCalls.filter(c=>c.method==='viewport').at(-1).packet,
          documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight};
      });
      assert(layout.sameCanvas && layout.samePanel, tab+' preserves world canvas and outliner DOM nodes');
      assert.equal(layout.worldCanvases,1);
      assert.deepEqual(layout.viewport,baseline.viewport,tab+' does not hide or move native world viewport');
      assert.deepEqual(layout.panel,baseline.panel,tab+' leaves naval outliner fixed');
      assert(layout.panelHit,tab+' leaves the outliner reachable');
      assert(layout.popup.right < layout.panel.left,tab+' does not cover naval commands');
      assert(Math.abs(layout.popup.left-layout.mapLeft)<1,tab+' aligns with the left edge of the map workspace');
      assert(layout.close.top>=layout.popup.top && layout.close.bottom<=layout.popup.bottom,tab+' close button remains visible');
      assert(layout.documentWidth<=width && layout.documentHeight<=height,'No outer scrollbar');
      if (layout.bodyScrollWidth>layout.bodyWidth+1) {
        const overflow=await page.locator('.menu-popup .workspace-inner').evaluate(body=>[...body.querySelectorAll('*')].filter(n=>n.getBoundingClientRect().right>body.getBoundingClientRect().right+1&&!n.closest('.table-wrap')).map(n=>({tag:n.tagName,class:n.className,width:n.getBoundingClientRect().width,text:n.textContent.slice(0,100)})).slice(0,30));
        console.error(JSON.stringify({tab,width,height,layout,overflow}));
        await page.screenshot({path:path.join(output,'overflow-'+tab+'-'+width+'x'+height+'.png')});
      }
      assert(layout.bodyScrollWidth<=layout.bodyWidth+1,tab+' content fits popup width at '+width+'x'+height);
      metrics.push({width,height,tab,...layout});
      if (['yards','diplomacy','land'].includes(tab) && [900,1920,2560].includes(width)) {
        await page.locator('.menu-popup img').evaluateAll(images=>Promise.all(images.filter(img=>img.getBoundingClientRect().top<innerHeight&&img.getBoundingClientRect().bottom>0).map(img=>img.complete?null:Promise.race([img.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,1500))]))));
        await page.screenshot({path:path.join(output,tab+'-'+width+'x'+height+'.png')});
      }
    }
    const calls=await page.evaluate(start=>window.__nativeCalls.slice(start).filter(c=>c.method==='viewport'),baseline.calls);
    assert.deepEqual(calls,[],'Menu navigation never reactivates or hides native world');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.menu-popup').count(),0,'Escape closes ministry popup');
    await page.locator('.nav-item[data-view="economy"]').click();
    await page.locator('.workspace-close').click();
    assert.equal(await page.locator('.menu-popup').count(),0,'Close control returns to map');
    console.log('Layout checks passed at '+width+'x'+height);
  }
  for (const tab of tabs) assert.equal(metrics.find(m=>m.width===1920&&m.height===1080&&m.tab===tab).popup.width,
    metrics.find(m=>m.width===2560&&m.height===1080&&m.tab===tab).popup.width,'16:9-derived width remains fixed on ultrawide');
  await page.setViewportSize({width:1920,height:1080});
  await page.locator('.nav-item[data-view="economy"]').click();
  await page.evaluate(()=>window.__nativeCalls.length=0);
  const row=page.locator('.fleet-command-row').first();
  await row.click();
  assert(await row.evaluate(n=>n.classList.contains('selected')));
  assert.equal(await page.locator('.menu-popup').count(),1,'Single selection leaves current menu open');
  assert.deepEqual(await page.evaluate(()=>window.__nativeCalls.filter(c=>c.method==='sceneinput')),[],'Single selection does not move camera');
  await row.dblclick();
  assert.equal(await page.locator('.menu-popup').count(),0,'Explicit fleet fit returns to unobstructed map');
  const fits=await page.evaluate(()=>window.__nativeCalls.filter(c=>c.method==='sceneinput'&&['focus','fit-force'].includes(c.packet.action)));
  assert.equal(fits.length,1,'Double click fits once');
  assert.equal(fits[0].packet.action,'fit-force','Native camera fits the actual fleet rather than using a fixed zoom');
  assert(await page.evaluate(()=>window.__worldCanvas===document.querySelector('.native-world-input')),'Selecting and fitting preserve the world canvas');
  const ownIds=state.nations.USA.fleets.slice(0,2).map(f=>f.id);
  const select=selection=>page.evaluate(selection=>{
    const instanceId=window.__worldInstance;
    window.WNTUnreal.receive({type:'select',instanceId,selection});
  },selection);
  await select({kind:'fleet-group',ids:[...ownIds,'enemy-or-unknown'],id:ownIds[0]});
  assert.equal(await page.locator('.fleet-command-row.selected').count(),2,'Box selection highlights only owned fleets');
  await select({kind:'fleet-group',ids:[]});
  assert.equal(await page.locator('.fleet-command-row.selected').count(),0,'Empty selection clears highlighted fleets');
  await page.locator('.nav-item[data-view="reports"]').click();
  await select({kind:'battle',id:engagement.id});
  await page.locator('[data-dialog-type="battle-watch"]').waitFor();
  assert.equal(await page.locator('.command-side-panel').evaluate(n=>getComputedStyle(n).visibility),'hidden','World outliner does not bleed into native battle');
  const watch=page.locator('[data-dialog-type="battle-watch"]');
  await watch.locator('[data-action="battle-play"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-action="battle-play"]')?.textContent==='Pause battle');
  assert.equal(await page.locator('#speed').inputValue(),'0.006','Battle playback runs at Tactical 60×');
  await page.waitForFunction(()=>document.querySelector('.battle-watch-heading')?.textContent.includes('+15 min'),null,{timeout:22000});
  await watch.locator('[data-action="battle-previous"]').click();
  await page.waitForFunction(()=>document.querySelector('.actual-speed')?.classList.contains('is-paused')&&document.querySelector('.battle-watch-heading')?.textContent.includes('+0 min'));
  assert(await page.locator('.actual-speed').evaluate(n=>n.classList.contains('is-paused')),'Navigating to a recorded tick pauses live playback');
  assert((await watch.locator('.battle-watch-heading').innerText()).includes('+0 min'),'Previous returns to recorded time');
  await watch.locator('[data-action="battle-latest"]').click();
  await watch.locator('[data-action="battle-play"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-action="battle-play"]')?.textContent==='Pause battle');
  await page.locator('[data-dialog-type="battle-watch"] [data-action="close"]').first().click();
  await page.waitForFunction(()=>document.documentElement.dataset.unrealScene==='world');
  assert(await page.locator('.actual-speed').evaluate(n=>n.classList.contains('is-paused')),'Closing a playing battle leaves the campaign paused');
  assert(await page.evaluate(()=>window.__worldCanvas===document.querySelector('.native-world-input')),'Battle close restores the same world canvas');
  assert.equal(await page.locator('.menu-popup.view-reports').count(),1,'Battle close restores underlying ministry panel');
  assert.deepEqual(errors,[]);
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify({passed:true,scope:'Headless DOM and fake bridge; native rendering and fit are separate checks.',menuLayouts:metrics.length,metrics,errors},null,2));
  console.log('PASS: '+metrics.length+' menu layouts; persistent native canvas/viewport/outliner; close controls; fleet single/double/box selection; 15-second battle playback, replay pause and close/restore.');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
