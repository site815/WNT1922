import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {GAME_VERSION} from '../game/src/version.mjs';
const localRequire=createRequire(import.meta.url);
let playwright;try{playwright=localRequire('playwright');}catch{playwright=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'))('playwright');}
const executable=path.resolve(process.argv[2]||'dist/WNT1922-'+GAME_VERSION+'-win-x64/WNT1922.exe');
const output=path.resolve('game/browser-test-output');await fs.mkdir(output,{recursive:true});
const result={version:GAME_VERSION,checks:[],errors:[]};let desktop,page;
const launch=async(userData)=>{
 desktop=await playwright._electron.launch({executablePath:executable,args:['--test-mode'],env:{...process.env,WNT_TEST_USER_DATA:userData,PATH:process.env.SystemRoot+'\\System32'},timeout:30000});
 page=await desktop.firstWindow();page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/404|favicon/.test(m.text()))result.errors.push(m.text());});
 await page.locator('.nation-card').first().waitFor();
};
const click=action=>page.locator('[data-action="'+action+'"]').first().click();
const closeSaved=async()=>{const closed=desktop.waitForEvent('close');await desktop.evaluate(({BrowserWindow})=>{BrowserWindow.getAllWindows()[0].close();});await closed;desktop=null;};
try{
 for(const [campaign,nation]of [['in_good_faith_1936','USA'],['campaign_1922','GBR']]){
  const userData=await fs.mkdtemp(path.join(output,'desktop profile '+nation+' '));await launch(userData);
  const prefs=await desktop.evaluate(({BrowserWindow,app})=>({prefs:BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences(),path:app.getPath('userData'),electron:process.versions.electron}));
  assert.equal(prefs.prefs.nodeIntegration,false);assert.equal(prefs.prefs.contextIsolation,true);assert.equal(prefs.prefs.sandbox,true);assert.equal(prefs.path,userData);assert.equal(prefs.electron,'44.3.0');assert.equal(await page.evaluate(()=>typeof require),'undefined');
  await page.locator('[data-action="select-campaign"][data-id="'+campaign+'"]').click();await page.locator('[data-action="select-nation"][data-id="'+nation+'"]').click();await click('new');if(await page.locator('[data-action="begin"]').count())await click('begin');await page.locator('.world-map').waitFor();
  const creditData=await page.evaluate(async()=>{const m=await import('/world-political.mjs');return {date:m.POLITICAL.date,license:m.POLITICAL.license,earlier:m.POLITICAL_1922.date};});assert.equal(creditData.license,'Public domain');assert.equal(creditData.earlier,'1922-02-06');
  await page.locator('.fleet-command-row').first().click();await page.locator('.selected-manifest').waitFor();assert(await page.locator('.manifest-grid .ship-type').count()>0);
  assert.match(await page.locator('.fleet-overview').innerText(),/CAP \d+ fighters/);
  await page.locator('.sidebar [data-view="aircraft"]').click();await page.locator('.aircraft-models').first().waitFor();
  assert.equal(await page.locator('[data-government-model]').count(),20);assert.equal(await page.locator('[data-government-model] button').count(),0);assert.match(await page.locator('[data-government-model] .badge').first().innerText(),/Government managed/i);
  assert.equal(await page.locator('[data-model][data-future="true"] [data-action="air-design"]').count(),0);await page.screenshot({path:path.join(output,'desktop-aircraft-'+campaign+'.png')});
  await page.locator('.sidebar [data-view="command"]').click();await page.locator('#fleet-mission').waitFor();
  await page.locator('#fleet-mission').selectOption('guard');await click('fleet-order');await page.waitForTimeout(400);assert.equal(await page.locator('#fleet-mission').inputValue(),'guard');
  await page.locator('.sidebar [data-view="yards"]').click();await page.locator('.yard-capacity svg').waitFor();
  for(const type of ['DD','AO','AK','CL']){if(await page.locator('[data-action="order"]:not([disabled])').count())break;if(await page.locator('#design-filter option[value="'+type+'"]').count())await page.locator('#design-filter').selectOption(type);}
  await page.locator('[data-action="order"]:not([disabled])').first().click();await click('commit-order');await page.waitForTimeout(400);
  await page.locator('.sidebar [data-view="programs"]').click();await page.locator('#industryFunding').fill('40');await page.locator('#industryFunding').dispatchEvent('change');await page.waitForTimeout(400);assert.equal(await page.locator('#industryFunding').inputValue(),'40');
  await page.locator('.sidebar [data-view="command"]').click();await page.locator('#auto-pause').uncheck();await page.locator('#speed').selectOption('10');const before=await page.locator('.campaign-clock').innerText();
  await click('pause');await page.waitForTimeout(2200);await click('pause');assert.notEqual(await page.locator('.campaign-clock').innerText(),before);await page.waitForTimeout(1000);
  const music=await page.evaluate(async()=>{const m=await import('/music.mjs');m.unlockMusic();return m.musicStatus();});assert(music.started);await page.waitForTimeout(600);assert.equal(await page.evaluate(async()=>(await import('/music.mjs')).musicStatus().blocked),false);
  await page.screenshot({path:path.join(output,'desktop-'+campaign+'.png')});
  await click('menu');const newWindow=desktop.waitForEvent('window');await page.locator('a[href="/third-party-notices.html"]').click();const credits=await newWindow;await credits.waitForLoadState();assert.match(await credits.locator('body').innerText(),/Kevin MacLeod/);await credits.close();await page.locator('.modal [data-action="close"]').first().click();
  await closeSaved();const stored=JSON.parse(await fs.readFile(path.join(userData,'saves/campaign.json')));assert.equal(stored.player,nation);assert.equal(stored.paused,true);assert.equal(stored.nations[nation].industryFunding,.4);assert(stored.nations[nation].groups.some(g=>g.status==='building'));
  await launch(userData);await click('continue');await page.locator('.world-map').waitFor();await page.locator('.sidebar [data-view="programs"]').click();assert.equal(await page.locator('#industryFunding').inputValue(),'40');await closeSaved();
  result.checks.push(campaign+' '+nation+': packaged runtime without Node on PATH, sandbox, map, CAP overview, read-only shore catalog, future-aircraft gates, fleet order, ship order, funding, minute simulation, music, credits, close/save and reopen');
 }
 assert.deepEqual(result.errors,[]);console.log(JSON.stringify(result));
}catch(error){result.errors.push(error.stack);console.error(error);process.exitCode=1;await page?.screenshot({path:path.join(output,'desktop-failure.png')}).catch(()=>{});}
finally{await desktop?.close().catch(()=>{});await fs.writeFile(path.join(output,'desktop-result.json'),JSON.stringify(result,null,2));}
