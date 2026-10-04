// Real application HUD and controls against a recording native bridge. This
// verifies DOM/navigation/simulation isolation; it does not claim GPU coverage.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {createGameServer} from '../worker/desktop/server.mjs';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {newGame} from '../mechanics/engine.mjs';
import {SCENARIOS} from '../combatmechanics/index.mjs';
let playwright;
try {playwright=createRequire(import.meta.url)('playwright');}
catch {playwright=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'))('playwright');}
const output=path.resolve('test-output/tactical-ui');await fs.mkdir(output,{recursive:true});
const saveDir=await fs.mkdtemp(path.join(output,'saves-'));
const campaign=newGame(CATALOG,'USA',450045,'in_good_faith_1936');
campaign.decisions=[];campaign.autoPause=false;campaign.paused=true;campaign.musicEnabled=false;campaign.audioEnabled=false;
await fs.writeFile(path.join(saveDir,'campaign.json'),JSON.stringify(campaign));
const server=await createGameServer({saveDir});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await playwright.chromium.launch({channel:'msedge',headless:true});
const metrics=[],errors=[],result={passed:false,metrics,errors};
try {
  const context=await browser.newContext({viewport:{width:1800,height:1000}});
  await context.addInitScript(()=>{
    window.__nativeCalls=[];
    const record=method=>async json=>{window.__nativeCalls.push({method,packet:JSON.parse(json)});if(window.__nativeCalls.length>5000)window.__nativeCalls.splice(0,1000);};
    window.ue={wnt:{world:record('world'),battle:record('battle'),sceneinput:record('sceneinput'),viewport:record('viewport'),closeapproved:async()=>true}};
  });
  const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?unreal=1');
  await page.locator('.start-screen').waitFor();
  assert.equal(await page.locator('.start-demo,.start-demo-host,.start-screen canvas').count(),0,'The old opening demonstration is removed');
  assert.equal(await page.locator('[data-action="tactical"][data-preset]').count(),SCENARIOS.length+1,'Tactical battles is a primary menu section with all presets and custom');
  await page.locator('[data-action="tactical"][data-preset="denmark-strait"]').click();
  assert.equal(await page.locator('[data-setup="mode"]').inputValue(),'historical');
  assert(await page.locator('[data-setup="seed"]').isDisabled());
  await page.locator('[data-setup="mode"]').selectOption('simulation');
  assert(await page.locator('[data-setup="seed"]').isEnabled());
  await page.locator('[data-setup="mode"]').selectOption('historical');
  assert(await page.locator('#app').evaluate(n=>n.hidden&&n.inert),'Title controls are suspended while tactical owns input');
  for(const [width,height] of [[900,500],[1280,720],[1800,1000],[1920,1080],[2560,1080],[3440,1440]]) {
    await page.setViewportSize({width,height});
    const dimensions=await page.locator('.tactical-engagements').evaluate(host=>({width:host.clientWidth,height:host.clientHeight,
      scrollWidth:host.scrollWidth,scrollHeight:host.scrollHeight,bodyWidth:document.body.scrollWidth,
      setupScroll:host.querySelector('.tactical-setup-content').scrollHeight>host.querySelector('.tactical-setup-content').clientHeight}));
    assert.equal(dimensions.width,width);assert.equal(dimensions.height,height);assert(dimensions.scrollWidth<=width+1&&dimensions.bodyWidth<=width+1);
    assert(dimensions.scrollHeight<=height+1,'Setup scrolling stays inside the body');
    metrics.push({kind:'setup',width,height,...dimensions});
  }
  await page.setViewportSize({width:900,height:500});
  await page.locator('[data-tactical="prepare"]').click();
  const setupError=await page.locator('.tactical-error').allTextContents();
  assert.deepEqual(setupError,[],'Preparing a battle: '+setupError.join(' '));
  await page.locator('.tactical-engagements[data-tactical-page="watch"]').waitFor();
  for(const [width,height] of [[900,500],[1280,720],[1800,1000],[1920,1080],[2560,1080],[3440,1440]]) {
    await page.setViewportSize({width,height});
    await page.waitForFunction(()=>{
      const r=document.querySelector('.tactical-stage canvas').getBoundingClientRect(),p=window.__nativeCalls.filter(c=>c.method==='viewport'&&c.packet.mode==='battle').at(-1)?.packet;
      return p&&Math.abs(p.x-r.left/innerWidth)<1e-6&&Math.abs(p.height-r.height/innerHeight)<1e-6;
    });
    const geometry=await page.locator('.tactical-engagements').evaluate(host=>{
      const canvas=host.querySelector('canvas'),r=canvas.getBoundingClientRect(),foot=host.querySelector('footer').getBoundingClientRect();
      const ancestors=[];for(let n=canvas;n;n=n.parentElement)ancestors.push({class:n.className,color:getComputedStyle(n).backgroundColor});
      return {stage:r.toJSON(),footer:foot.toJSON(),scrollWidth:host.scrollWidth,scrollHeight:host.scrollHeight,
        clickable:document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)===canvas,ancestors};
    });
    assert(geometry.stage.height>=150&&geometry.stage.width>=250,'Useful battle aperture at '+width+'×'+height);
    assert(geometry.stage.bottom<=geometry.footer.top&&geometry.footer.bottom<=height+1);
    assert(geometry.scrollWidth<=width+1&&geometry.scrollHeight<=height+1);assert(geometry.clickable);
    for(const ancestor of geometry.ancestors)assert.equal(ancestor.color,'rgba(0, 0, 0, 0)','Transparent native aperture: '+ancestor.class);
    metrics.push({kind:'watch',width,height,...geometry});
    await page.screenshot({path:path.join(output,`watch-${width}x${height}.png`)});
  }
  await page.setViewportSize({width:1800,height:1000});
  const seconds=()=>page.locator('.tactical-engagements').getAttribute('data-tactical-seconds');
  assert.equal(await seconds(),'0');
  await page.locator('[data-tactical="step"]').click();assert.equal(await seconds(),'10');
  const lastPacket=await page.evaluate(()=>window.__nativeCalls.filter(c=>c.method==='battle').at(-1).packet);
  assert(lastPacket.tactical&&lastPacket.units.length===4);
  await page.locator('[data-tactical="select-ship"]').first().click();
  assert(await page.locator('.tactical-inspection').isVisible());assert.equal(await seconds(),'10');
  assert.equal(await page.locator('.tactical-roster-ship[aria-pressed="true"]').count(),1);
  await page.evaluate(()=>{
    const last=window.__nativeCalls.filter(c=>c.method==='battle').at(-1).packet,ship=last.units.at(-1);
    const instance=window.__nativeCalls.filter(c=>c.method==='viewport'&&c.packet.mode==='battle').at(-1).packet.instanceId;
    window.WNTUnreal.receive({type:'select',instanceId:instance,selection:{id:ship.id,side:ship.side,hullIndex:ship.hullIndex}});
  });
  assert.match(await page.locator('.tactical-inspection h3').innerText(),/Prinz Eugen/);
  await page.locator('[data-tactical-camera]').uncheck();
  assert((await page.evaluate(()=>window.__nativeCalls.filter(c=>c.method==='sceneinput').at(-1).packet)).action==='cinematic');
  await page.locator('[data-tactical="play"]').click();
  await page.waitForFunction(()=>+document.querySelector('.tactical-engagements').dataset.tacticalSeconds>=30);
  await page.locator('[data-tactical="play"]').click();const paused=await seconds();
  await page.waitForTimeout(250);assert.equal(await seconds(),paused,'Pause stops the standalone clock');
  await page.locator('[data-tactical-camera]').check();
  const beforeQuickCalls=await page.evaluate(()=>window.__nativeCalls.length);
  await page.locator('[data-tactical="resolve"]').click();
  await page.locator('.tactical-engagements[data-tactical-status="completed"]').waitFor();
  assert(await page.locator('.tactical-result').isVisible());
  assert.match(await page.locator('.tactical-result').innerText(),/HISTORICAL OUTCOME/);
  assert.equal(await page.locator('.tactical-roster-ship.tactical-sunk').count(),1,'Denmark Strait ends with Hood sunk');
  const quickPackets=await page.evaluate(start=>window.__nativeCalls.slice(start).filter(c=>c.method==='battle').map(c=>c.packet),beforeQuickCalls);
  assert(quickPackets.length&&quickPackets.every(p=>p.cameraDirector&&p.playbackPaused),'Quick resolution displays paused observations and preserves cinematic preference');
  assert(await page.locator('[data-tactical-camera]').isChecked());
  await page.locator('[data-tactical-camera]').uncheck();
  const cameraFits=()=>page.evaluate(()=>window.__nativeCalls.filter(c=>c.method==='sceneinput'&&c.packet.action==='home').length);
  const beforeReplayFits=await cameraFits();
  await page.locator('[data-tactical="replay"]').click();const terminal=await seconds();
  await page.waitForFunction(count=>window.__nativeCalls.filter(c=>c.method==='sceneinput'&&c.packet.action==='home').length>count,beforeReplayFits);
  assert.equal(await page.locator('[data-tactical-camera]').isChecked(),false,'Entering replay preserves manual camera preference');
  const replayCamera=await page.evaluate(()=>window.__nativeCalls.filter(c=>c.method==='sceneinput').at(-1).packet);
  assert.equal(replayCamera.action,'cinematic');assert.equal(replayCamera.enabled,false,'Clock jumps fit the new positions, then restore the checkbox preference');
  await page.locator('[data-tactical="step"]').click();assert.equal(await seconds(),terminal,'Replay does not mutate terminal combat');
  await page.locator('[data-tactical-camera]').check();const beforeResultFits=await cameraFits();
  await page.locator('[data-tactical="replay"]').click();
  await page.waitForFunction(count=>window.__nativeCalls.filter(c=>c.method==='sceneinput'&&c.packet.action==='home').length>count,beforeResultFits);
  assert.equal(await page.locator('[data-tactical-camera]').isChecked(),true,'Returning to result preserves cinematic camera preference');
  const resultCamera=await page.evaluate(()=>window.__nativeCalls.filter(c=>c.method==='sceneinput').at(-1).packet);
  assert.equal(resultCamera.action,'cinematic');assert.equal(resultCamera.enabled,true);
  for(const preset of ['midway','north-cape','bismarck-last-battle','lofoten']) {
    await page.locator('[data-tactical="setup"]').click();
    await page.locator('[data-setup="presetId"]').selectOption(preset);
    assert.equal(Number(await page.locator('[data-setup="seed"]').inputValue()),SCENARIOS.find(s=>s.id===preset).seed,'Each listed preset supplies a valid authored default seed');
    if(['bismarck-last-battle','lofoten'].includes(preset))assert.match(await page.locator('.tactical-scenario').innerText(),/stored|sister-class/,'Historical setup discloses the model fit');
    await page.locator('[data-tactical="prepare"]').click();
    assert.deepEqual(await page.locator('.tactical-error').allTextContents(),[],'Prepare '+preset);
    await page.locator('.tactical-engagements[data-tactical-page="watch"]').waitFor();
    await page.locator('[data-tactical="resolve"]').click();
    await page.locator('.tactical-engagements[data-tactical-status="completed"]').waitFor();
    metrics.push({kind:'preset-result',preset,seconds:await seconds(),result:await page.locator('.tactical-result').innerText()});
  }
  await page.locator('[data-tactical="setup"]').click();
  await page.locator('[data-setup="presetId"]').selectOption('custom');
  await page.locator('[data-setup="count-A-0"]').fill('121');await page.locator('[data-tactical="prepare"]').click();
  assert(await page.locator('.tactical-error').isVisible());
  await page.locator('[data-setup="count-A-0"]').fill('3');await page.locator('[data-setup="count-B-0"]').fill('2');
  await page.locator('[data-setup="class-A-0"]').selectOption('ecole_pt32');await page.locator('[data-setup="class-B-0"]').selectOption('courageous_1922_cv');
  await page.locator('[data-setup="doctrineA"]').selectOption('cautious');await page.locator('[data-tactical="prepare"]').click();
  assert.equal(await page.locator('.tactical-roster-ship').count(),5);
  const mixed=await page.evaluate(()=>window.__nativeCalls.filter(c=>c.method==='battle').at(-1).packet);
  assert(mixed.units.filter(u=>u.side==='A').every(u=>u.classId==='ecole_pt32'&&u.campaign==='in_good_faith_1936'));
  assert(mixed.units.filter(u=>u.side==='B').every(u=>u.classId==='courageous_1922_cv'&&u.campaign==='campaign_1922'));
  await page.locator('[data-tactical="resolve"]').click();await page.locator('[data-tactical="close"]').click();
  assert(await page.locator('.start-screen').isVisible());assert(await page.locator('#app').evaluate(n=>!n.hidden&&!n.inert));
  await page.locator('[data-action="continue"]').click();await page.locator('.native-world-input').waitFor();
  const save=async()=>{const response=page.waitForResponse(r=>r.url().endsWith('/api/save')&&r.request().method()==='POST');await page.locator('.sidebar [data-action="save"]').click();assert((await response).ok());return JSON.parse(await fs.readFile(path.join(saveDir,'campaign.json'),'utf8'));};
  const before=await save();
  assert.equal(await page.locator('.sidebar .nav-item').count(),10);
  await page.locator('.sidebar [data-action="menu"]').click();await page.locator('[data-action="title-screen"]').click();
  await page.locator('.start-screen [data-action="tactical"]').first().click();await page.locator('[data-tactical="prepare"]').click();
  await page.locator('[data-tactical="step"]').click();await page.keyboard.press('Escape');
  await page.locator('.start-screen [data-action="continue"]').click();
  await page.locator('.native-world-input').waitFor();const after=await save();delete before.savedAt;delete after.savedAt;
  assert.deepEqual(after,before,'Campaign snapshot including RNG is unchanged by tactical play and return');assert(after.paused);
  assert.deepEqual(errors,[]);result.passed=true;
} finally {
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2));
  await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
console.log('Tactical setup, watching, quick resolution, replay, six layouts and campaign isolation passed.');
