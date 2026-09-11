import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createGameServer} from './play.mjs';
import * as sim from '../game/src/engine.mjs';
import {setCampaignMinutes} from '../game/src/campaign-clock.mjs';
import {dailyWorld} from '../game/src/land-war.mjs';
import {PORTS} from '../game/src/world.mjs';
import {validateSave} from '../game/src/state-io.mjs';
const require=createRequire('C:/Users/ser10hx470/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'),{chromium}=require('playwright');
const out=path.resolve('game/browser-test-output');fs.mkdirSync(out,{recursive:true});const saves=fs.mkdtempSync(path.join(out,'saves-09-')),publicDirectory=path.join(saves,'public');fs.cpSync('game/staging',publicDirectory,{recursive:true});
const b=JSON.parse(fs.readFileSync(path.join(publicDirectory,'content.json'))),s=sim.newGame(b,'FRA',70014);setCampaignMinutes(s,Date.parse('1942-01-01T00:00:00Z')/60000);s.timeline.polandOccurred=s.timeline.europeOccurred=true;s.autoPause=false;s.decisions=[];s.speed=10;s.musicEnabled=false;
for(const r of Object.values(s.relations))Object.assign(r,{war:true,allied:false,score:-60,warSince:s.day});
sim.resolveBattle(s,b,'FRA','ITA','mediterranean');const reportId=s.reports[0].id;dailyWorld(s,b);s.paused=true;s.savedAt=new Date().toISOString();s.nations.FRA.gold=s.nations.FRA.industry=1e7;s.nations.FRA.influence=500;
sim.orderShip(s,b,b.nations.FRA.designs.find(id=>b.classes[id].type==='DD'&&!sim.shipOrderBlock(s,b,id)),12);s.nations.FRA.industryFunding=.1;validateSave(s,b);fs.writeFileSync(path.join(saves,'campaign.json'),JSON.stringify(s));
const server=await createGameServer({port:0,saveDir:saves,publicDirectory});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const result={errors:[],checks:[],layouts:[]};
try{
 browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1366,height:768}});page.on('pageerror',e=>result.errors.push(e.message));
 await page.addInitScript(()=>{globalThis.battleAudioCount=0;const original=AudioContext.prototype.createBufferSource;AudioContext.prototype.createBufferSource=function(){battleAudioCount++;return original.call(this);};});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-action="continue"]').click();await page.locator('.world-map').waitFor();
 const click=async action=>page.locator('[data-action="'+action+'"]').first().click();const view=async id=>page.locator('[data-action="view"][data-view="'+id+'"]').click();
 for(const size of [{width:1366,height:768},{width:1920,height:1080},{width:2560,height:1080}]){
  await page.setViewportSize(size);await page.waitForTimeout(180);await view('command');
  const measures=await page.evaluate(()=>{const q=s=>document.querySelector(s),box=e=>e.getBoundingClientRect(),cells=[...document.querySelectorAll('.resource-bar>div:not(.resource-war)')].map(e=>box(e).width),check=box(q('#auto-pause')),label=box(q('.auto-pause-control'));return {cells,checkboxDelta:Math.abs(check.y+check.height/2-label.y-label.height/2),topHeight:box(q('.time-bar')).height,resourcesHeight:box(q('.resource-bar')).height,commands:document.querySelectorAll('.fleet-command-row').length,commandScroll:q('.command-side-panel').scrollHeight-q('.command-side-panel').clientHeight,bodyScroll:document.documentElement.scrollWidth-innerWidth};});
  assert.ok(Math.max(...measures.cells)-Math.min(...measures.cells)<1,'Equal resource column widths');assert.ok(measures.checkboxDelta<1,'Autopause aligned');assert.ok(measures.topHeight<=38,'Compact top bar');assert.equal(measures.bodyScroll,0);assert.ok(measures.commands>=4);assert.ok(measures.commandScroll<=2,'Command orders fit without a scrollbar');
  await view('programs');const selectors=await page.locator('.production-lines select').evaluateAll(nodes=>nodes.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert.equal(selectors.length,3);assert.ok(selectors.every(x=>Math.abs(x.w-selectors[0].w)<1&&x.h===selectors[0].h));
  const facilities=await page.locator('.facility-card').evaluateAll(nodes=>nodes.map(e=>e.getBoundingClientRect().height));assert.equal(Math.max(...facilities),Math.min(...facilities));await page.screenshot({path:path.join(out,'release09-facilities-'+size.width+'.png')});
  for(const section of ['yards','diplomacy','fleet']){await view(section);const scroll=await page.locator('.workspace-inner').evaluate(e=>e.scrollHeight-e.clientHeight);result.layouts.push({size: size.width+'x'+size.height,view:section,scroll});assert.ok(scroll<=5,'Main '+section+' screen fits '+size.width);}
  result.layouts.push({size:size.width+'x'+size.height,...measures,selectors,facilities});
 }
 result.checks.push('Compact equal bars and aircraft selectors; denser lists at three widescreen sizes');
 await page.setViewportSize({width:1366,height:768});await page.waitForTimeout(180);await view('command');
 const fleet=page.locator('.fleet-command-row').nth(1),id=await fleet.getAttribute('data-id');await fleet.hover();await page.locator('.class-hover:not([hidden])').waitFor();assert.match(await page.locator('.class-hover').innerText(),/FLEET COMPOSITION/);await fleet.click();assert.ok((await page.locator('.fleet-marker.selected').getAttribute('data-id'))===id);const frame=(await page.locator('.world-map').getAttribute('viewBox')).split(' ').map(Number);assert.ok(frame[2]<=400);
 for(let i=0;i<13;i++)await page.locator('[data-action="map-zoom"][data-value="1"]').click();assert.equal(Number((await page.locator('.world-map').getAttribute('viewBox')).split(' ')[2]),18.75);assert.equal(await page.locator('.map-port').count(),Object.keys(PORTS).length);assert.equal(await page.locator('.map-port text').first().evaluate(e=>getComputedStyle(e).vectorEffect),'non-scaling-stroke');await page.screenshot({path:path.join(out,'release09-zoom64.png')});await click('map-reset');result.checks.push('Fleet hover composition, click selection and centering, 64× zoom with every port marker');
 await view('yards');await page.locator('[data-action="yard-tab"][data-id="queue"]').click();assert.ok(await page.locator('.yard-overload-segment').count()>0);await page.screenshot({path:path.join(out,'release09-yards.png')});
 await page.locator('[data-action="yard-tab"][data-id="designer"]').click();const beforeGold=await page.locator('.resource-bar>div').first().innerText();await page.locator('[data-draft="tons"]').fill('2200');await click('generate-draft');assert.match(await page.locator('#toast').innerText(),/No gold spent/);assert.equal(await page.locator('.resource-bar>div').first().innerText(),beforeGold);assert.equal(await page.locator('[data-action="generate-draft"]').innerText(),'Apply suggested fit');result.checks.push('Visible yard overload segment and free, explained automatic design preview');
 await view('reports');await click('pause');await page.locator('[data-action="report"][data-id="'+reportId+'"]').click();await page.locator('.combat-calculations summary').click();await page.evaluate(()=>{globalThis.readingReport=document.querySelector('.modal-body');globalThis.readingDetails=document.querySelector('.combat-calculations');readingReport.scrollTop=450;});
 // Resume through the visible top control to keep this exact report open.
 await page.waitForTimeout(8500);
 const reportState=await page.evaluate(()=>({same:readingReport===document.querySelector('.modal-body'),open:readingDetails.open,scroll:readingReport.scrollTop,audio:battleAudioCount}));assert.ok(reportState.same&&reportState.open);assert.equal(reportState.scroll,450);assert.ok(reportState.audio>0,'Battles trigger synthesized cannon audio');
 await page.screenshot({path:path.join(out,'release09-report.png')});await click('close');await click('pause');await click('save');await page.waitForTimeout(350);const saved=JSON.parse(fs.readFileSync(path.join(saves,'campaign.json')));validateSave(saved,b);assert.ok(!saved.reports.some(r=>r.id===reportId),'Test report really left the bounded history');
 result.checks.push('Open report stays readable and scroll position survives history eviction at 100,000×; new battles play cannon SFX');result.reportState=reportState;result.minuteTicks=saved.minuteTicks;
 await view('command');await click('pause');await page.waitForTimeout(1200);const animated=await page.locator('.land-front.advancing').first().evaluate(e=>getComputedStyle(e).animationName);assert.equal(animated,'front-march');await click('pause');result.checks.push('Moving land-front dashes while running, halted when paused');
 await page.screenshot({path:path.join(out,'release09-command.png')});assert.equal(result.errors.length,0);console.log(JSON.stringify(result));
}catch(error){result.errors.push(error.stack);console.error(error);process.exitCode=1;if(browser)await browser.contexts()[0]?.pages()[0]?.screenshot({path:path.join(out,'release09-failure.png')}).catch(()=>{});}
finally{await browser?.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'release09-result.json'),JSON.stringify(result,null,2));}
