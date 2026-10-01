// Headless browser layout/bridge regression; no Unreal process is launched.
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

const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const modulePath=option('--playwright');
const {chromium}=await import(modulePath?pathToFileURL(modulePath).href:'playwright');
const output=path.resolve('test-output/battle-layout');await fs.mkdir(output,{recursive:true});
const saveDir=await fs.mkdtemp(path.join(output,'saves-'));
const server=await createGameServer({saveDir,publicDirectory:path.resolve('.')});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const state=newGame(CATALOG,'USA',360036,'in_good_faith_1936');
state.decisions=[];state.autoPause=false;state.paused=true;
Object.assign(state.relations['JPN-USA'],{war:true,allied:false,warSince:state.day});
const fleets=['USA','JPN'].map(id=>state.nations[id].fleets.find(f=>f.role==='battle'));
for(const fleet of fleets)fleet.aggressiveBattle=true;
const engagement=beginEngagement(state,contentFor(CATALOG,state),{kind:'surface',a:'USA',b:'JPN',fleetA:fleets[0].id,fleetB:fleets[1].id,region:'pacific',position:[160,20]});
assert(engagement.decisive.qualifies);
assert((await fetch(origin+'/api/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(saveEnvelope(state))})).ok);
const browser=await chromium.launch({channel:option('--channel')||'msedge',headless:true});
const errors=[],metrics=[];
try{
  const context=await browser.newContext({viewport:{width:1920,height:730},reducedMotion:'reduce'});
  await context.addInitScript(()=>{
    window.__nativeCalls=[];
    const record=method=>async json=>window.__nativeCalls.push({method,packet:JSON.parse(json)});
    window.ue={wnt:{world:record('world'),battle:record('battle'),sceneinput:record('sceneinput'),viewport:record('viewport'),closeapproved:async()=>true}};
  });
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/?unreal=1');await page.locator('[data-action="continue"]').click();
  await page.locator('.native-world-input').waitFor();
  await page.evaluate(id=>{
    const active=window.__nativeCalls.filter(c=>c.method==='viewport'&&c.packet.mode==='world').at(-1).packet;
    window.WNTUnreal.receive({type:'select',instanceId:active.instanceId,selection:{kind:'battle',id}});
  },engagement.id);
  const watch=page.locator('[data-dialog-type="battle-watch"]');await watch.waitFor();
  for(const [width,height] of [[1920,730],[900,500],[1800,1000],[2560,1080],[3440,1440]]){
    await page.setViewportSize({width,height});
    await page.waitForFunction(()=>{
      const r=document.querySelector('.battle-canvas').getBoundingClientRect();
      const p=window.__nativeCalls.filter(c=>c.method==='viewport'&&c.packet.mode==='battle').at(-1)?.packet;
      return p&&Math.abs(p.x-r.left/innerWidth)<1e-6&&Math.abs(p.y-r.top/innerHeight)<1e-6&&Math.abs(p.height-r.height/innerHeight)<1e-6;
    });
    const geometry=await watch.evaluate(modal=>{
      const canvas=modal.querySelector('.battle-canvas'),rect=canvas.getBoundingClientRect();
      const body=modal.querySelector('.modal-body'),footer=modal.querySelector('footer').getBoundingClientRect();
      const info=modal.querySelector('.battle-watch-information'),pane=document.querySelector('.command-side-panel');
      const ancestors=[];for(let n=canvas;n;n=n.parentElement)ancestors.push({class:n.className,color:getComputedStyle(n).backgroundColor});
      const picks=[.05,.5,.95].map(f=>document.elementFromPoint(rect.left+rect.width*.5,rect.top+rect.height*f)===canvas);
      return {stage:rect.toJSON(),body:body.getBoundingClientRect().toJSON(),footer:footer.toJSON(),
        bodyScroll:body.scrollHeight-body.clientHeight,infoScroll:info.scrollHeight-info.clientHeight,
        panelVisibility:getComputedStyle(pane).visibility,picks,ancestors};
    });
    assert(geometry.stage.height>=180,'Useful battle height at '+width+'x'+height);
    assert(geometry.stage.top>=geometry.body.top&&geometry.stage.bottom<=geometry.footer.top,'Entire native stage is visible above footer');
    assert(geometry.bodyScroll<=1,'Battle stage does not scroll out of its native aperture');
    assert(geometry.infoScroll>0,'Roster uses its own scroll region');
    assert.equal(geometry.panelVisibility,'hidden','Underlying naval command panel must not paint through native scene');
    assert(geometry.picks.every(Boolean),'Scene remains clickable from top to bottom');
    for(const ancestor of geometry.ancestors)assert.equal(ancestor.color,'rgba(0, 0, 0, 0)','Native scene ancestor is transparent: '+ancestor.class);
    await page.locator('.battle-watch-information').evaluate(n=>{n.scrollTop=n.scrollHeight;});
    const after=await page.locator('.battle-canvas').boundingBox();
    assert.equal(after.y,geometry.stage.y);assert.equal(after.height,geometry.stage.height);
    await page.locator('.battle-watch-information').evaluate(n=>{n.scrollTop=0;});
    metrics.push({width,height,...geometry});
    await page.screenshot({path:path.join(output,'battle-'+width+'x'+height+'.png')});
  }
  await page.setViewportSize({width:1920,height:730});
  const fixedStage=await page.locator('.battle-canvas').boundingBox();
  await page.locator('.battle-rosters [data-action="battle-select"]').first().click();
  await page.locator('.battle-ship-inspection').waitFor();
  const inspectionVisible=()=>page.locator('.battle-watch-information').evaluate(panel=>{
    const heading=panel.querySelector('.battle-ship-inspection h3').getBoundingClientRect(),bounds=panel.getBoundingClientRect();
    return heading.top>=bounds.top&&heading.bottom<=bounds.bottom;
  });
  assert(await inspectionVisible(),'Roster selection brings ship identity and condition into the details viewport');
  await page.locator('.battle-watch-information').evaluate(panel=>{panel.scrollTop=100;});
  await watch.locator('[data-action="battle-next"]').click();
  await page.waitForFunction(()=>document.querySelector('.battle-watch-heading').textContent.includes('+15 min'));
  assert.equal(await page.locator('.battle-watch-information').evaluate(panel=>panel.scrollTop),100,'A 15-minute update preserves the manually chosen report position');
  await page.evaluate(()=>{
    document.querySelector('.battle-watch-information').scrollTop=0;
    const instance=window.__nativeCalls.filter(c=>c.method==='viewport'&&c.packet.mode==='battle').at(-1).packet.instanceId;
    const hull=window.__nativeCalls.filter(c=>c.method==='battle').at(-1).packet.units[0];
    window.WNTUnreal.receive({instanceId:instance,type:'select',selection:{kind:'battle-ship',side:hull.side,id:hull.id,hullIndex:hull.hullIndex}});
  });
  assert(await inspectionVisible(),'Clicking a native ship also reveals its inspection');
  assert.deepEqual(await page.locator('.battle-canvas').boundingBox(),fixedStage,'Inspecting ships and advancing time leave the native viewport stationary');
  await watch.locator('[data-action="close"]').first().click();
  await page.waitForFunction(()=>document.documentElement.dataset.unrealScene==='world');
  assert.equal(await page.locator('.command-side-panel').evaluate(n=>getComputedStyle(n).visibility),'visible','Closing restores command workspace');
  await page.locator('.sidebar [data-action="menu"]').click();
  await page.locator('[data-dialog-type="menu"]').waitFor();
  assert.equal(await page.locator('[data-action="fullscreen"]').count(),0,'Native campaign remains windowed; the OS owns maximize');
  assert.deepEqual(errors,[]);
}finally{
  await fs.writeFile(path.join(output,'metrics.json'),JSON.stringify({metrics,errors},null,2));
  await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
console.log('Battle aperture, responsive canvas, independent roster scrolling, native transparency and command restoration passed.');
