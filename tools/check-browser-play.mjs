// Real Chromium UI playtests on an isolated server and disposable campaign saves.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {createGameServer} from './play.mjs';
const require=createRequire('C:/Users/ser10hx470/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/');
const {chromium}=require('playwright');
const out=path.resolve('game/browser-test-output');fs.mkdirSync(out,{recursive:true});
const saves=fs.mkdtempSync(path.join(out,'saves-'));
const publicDirectory=path.join(saves,'public');fs.cpSync(path.resolve('game/staging'),publicDirectory,{recursive:true});
const server=await createGameServer({port:0,saveDir:saves,publicDirectory});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
let browser;const errors=[],results=[];
try{
 browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1920,height:1080}}),page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));page.on('console',msg=>{if(msg.type()==='error'&&!/404|favicon/i.test(msg.text()))errors.push(msg.text());});
 const click=async action=>{await page.locator('[data-action="'+action+'"]').first().click();};
 const layout=async label=>{
  const sizes=await page.evaluate(()=>({window:[innerWidth,innerHeight],body:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],scrolls:[...document.querySelectorAll('.workspace-inner,.fleet-order-panel,.fleet-command-list,.contact-list,.resource-bar,.time-bar,.modal-body')].filter(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0).map(e=>({class:e.className,x:Math.max(0,e.scrollWidth-e.clientWidth),y:Math.max(0,e.scrollHeight-e.clientHeight)}))}));
  assert.ok(sizes.body[0]<=sizes.window[0]+1,label+' overflows horizontally');assert.ok(sizes.body[1]<=sizes.window[1]+1,label+' overflows vertically');results.push({label,...sizes});
 };
 await page.goto(url);await page.locator('.nation-card').first().waitFor();
 assert.match(await page.locator('.scenario-choices').innerText(),/The Treaty System/);
 const navies=['GBR','USA','JPN','FRA','ITA','DEU','SOV'];const cases=process.env.WNT_BROWSER_ALL==='1'?['in_good_faith_1936','campaign_1922'].flatMap(c=>navies.map(id=>[c,id])):[['in_good_faith_1936','JPN'],['campaign_1922','GBR']];
 for(const [campaign,id]of cases){
  await page.locator('[data-action="select-campaign"][data-id="'+campaign+'"]').click();await page.locator('[data-action="select-nation"][data-id="'+id+'"]').click();await click('new');if(await page.locator('[data-action="begin"]').count())await click('begin');await page.locator('.world-map').waitFor();
  await layout(campaign+' command');assert.equal(await page.locator('.fleet-order-panel .formation-manifest').count(),0);
  assert.match(await page.locator('.fleet-command-row').first().innerText(),/\d+ (?:CV|BB|BC|CA|CL|DD|SS)/);
  await page.locator('.fleet-command-row').first().click();assert.ok(await page.locator('.manifest-grid .ship-type').count());
  await layout(campaign+' manifest');await page.screenshot({path:path.join(out,campaign+'-manifest.png')});
  await page.locator('.manifest-grid [data-action="spec"]').first().click();assert.match(await page.locator('.modal-body').innerText(),/Departure readiness/);await page.locator('.modal footer [data-action="close"]').click();assert.ok(await page.locator('.selected-manifest .formation-manifest').isVisible());
  await page.locator('#fleet-mission').selectOption('guard');await click('fleet-order');await page.waitForTimeout(500);assert.equal(await page.locator('#fleet-mission').inputValue(),'guard');
  await page.locator('.sidebar [data-action="view"][data-view="yards"]').click();await page.locator('.yard-capacity svg').waitFor();await layout(campaign+' yards');
  const order=page.locator('[data-action="order"]:not([disabled])');if(await order.count()){await order.first().click();await click('commit-order');await page.waitForTimeout(500);assert.equal(await page.locator('.modal').count(),0);}
  const designNext=page.locator('[data-action="catalog-page"][data-kind="design"]').last();if(await designNext.count()){const name=await page.locator('.design-card h3').first().innerText();await designNext.click();assert.notEqual(await page.locator('.design-card h3').first().innerText(),name);}
  await page.locator('[data-action="open-designer"]').click();await page.locator('[data-draft="name"]').fill('Playtest destroyer');await page.locator('[data-draft="name"]').dispatchEvent('change');await click('commission-draft');await page.waitForTimeout(400);assert.equal(await page.locator('.ship-designer').count(),0);
  await page.locator('.sidebar [data-action="view"][data-view="programs"]').click();await page.locator('#industryFunding').fill('10');await page.locator('#industryFunding').dispatchEvent('change');await page.waitForTimeout(400);assert.equal(await page.locator('#industryFunding').inputValue(),'10');await layout(campaign+' facilities');
  for(const view of ['fleet','diplomacy','land','review','command']){await page.locator('.sidebar [data-action="view"][data-view="'+view+'"]').click();await layout(campaign+' '+id+' '+view);if(view==='fleet'){await page.locator('#fleet-search').fill('CV');assert.ok(await page.locator('.register-summary').isVisible());assert.ok((await page.locator('.fleet-table tbody').innerText()).includes('DD')||(await page.locator('.fleet-table tbody').innerText()).includes('CV')||await page.locator('.fleet-table tbody tr').count()===0);await page.locator('#fleet-search').fill('');}}
  await page.locator('#auto-pause').uncheck();await page.locator('#speed').selectOption('10');await page.waitForTimeout(300);
  const before=await page.locator('.campaign-clock').innerText();for(let i=0;i<8;i++){await click('pause');await page.waitForTimeout(350);await click('pause');await page.waitForTimeout(100);}
  const after=await page.locator('.campaign-clock').innerText();assert.notEqual(after,before,'clock advances through repeated resume/pause');assert.equal(errors.length,0,errors.join('\n'));
  await page.locator('.sidebar [data-action="view"][data-view="fleet"]').click();await page.locator('#fleet-search').fill('DD');
  const reserve=page.locator('[data-action="reserve"]');if(await reserve.count()){const id=await reserve.first().getAttribute('data-id');await reserve.first().click();await page.waitForTimeout(500);const scrap=page.locator('[data-action="scrap"][data-id="'+id+'"]');await scrap.click();await click('confirm');await page.waitForTimeout(400);if(await scrap.count())assert.equal(await scrap.isDisabled(),true,'scrap transfer is already ordered');}
  await page.locator('#fleet-search').fill('');await page.locator('.sidebar [data-action="view"][data-view="command"]').click();
  const chart=page.locator('.world-map'),box=await chart.boundingBox(),pathBefore=await chart.locator('.graticule path').first().getAttribute('d');await page.mouse.move(box.x+box.width*.4,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.6,box.y+box.height*.5,{steps:10});await page.mouse.up();await page.waitForTimeout(350);assert.notEqual(await chart.locator('.graticule path').first().getAttribute('d'),pathBefore);await chart.focus();await page.keyboard.press('Home');
  await click('save');await page.waitForTimeout(500);await page.reload();await page.locator('[data-action="continue"]').waitFor();await click('continue');await page.locator('.world-map').waitFor();assert.equal(await page.locator('.actual-speed').innerText(),'PAUSED');
  for(const viewport of [{width:1920,height:1080},{width:2560,height:1080},{width:1366,height:768}]){
   await page.setViewportSize(viewport);await layout(campaign+' '+viewport.width+'x'+viewport.height);await page.screenshot({path:path.join(out,campaign+'-'+viewport.width+'.png')});
   if(viewport.width!==2560){for(const view of ['fleet','yards','aircraft','programs','diplomacy','reports','review','economy']){await page.locator('.sidebar [data-action="view"][data-view="'+view+'"]').click();await layout(campaign+' '+view+' '+viewport.width);await page.screenshot({path:path.join(out,campaign+'-'+view+'-'+viewport.width+'.png')});}}
   await page.locator('.sidebar [data-action="view"][data-view="command"]').click();
   if(viewport.width===1366){if(await page.locator('[data-action="command-list"]').count())await click('command-list');await page.locator('.fleet-command-row').first().click();await layout(campaign+' manifest 1366');await page.screenshot({path:path.join(out,campaign+'-manifest-1366.png')});await click('command-list');}
  }
  await page.setViewportSize({width:1920,height:1080});await click('menu');await click('title-screen');await page.locator('.nation-card').first().waitFor();console.log('Browser playthrough passed: '+campaign+' '+id);
 }
 assert.equal(errors.length,0,errors.join('\n'));
}catch(error){errors.push(error.stack);process.exitCode=1;console.error(error);if(browser){const page=browser.contexts()[0]?.pages()[0];if(page)await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});}}
finally{await browser?.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({generatedAt:new Date().toISOString(),results,errors,isolatedSaveDirectory:saves},null,2));}
