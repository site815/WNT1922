import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createGameServer} from './play.mjs';
import {newGame,resolveBattle} from '../game/src/engine.mjs';
import {setCampaignMinutes} from '../game/src/campaign-clock.mjs';
import {validateSave} from '../game/src/state-io.mjs';
const require=createRequire('C:/Users/ser10hx470/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/');
const {chromium}=require('playwright'),out=path.resolve('game/browser-test-output');
const saves=fs.mkdtempSync(path.join(out,'saves-war-')),publicDirectory=path.join(saves,'public');fs.cpSync('game/staging',publicDirectory,{recursive:true});
const c=JSON.parse(fs.readFileSync(path.join(publicDirectory,'content.json'))),s=newGame(c,'FRA',70014);
setCampaignMinutes(s,Date.parse('1942-01-01T00:00:00Z')/60000);s.timeline.polandOccurred=s.timeline.europeOccurred=true;
for(const r of Object.values(s.relations))Object.assign(r,{war:true,allied:false,score:-60,warSince:s.day});
resolveBattle(s,c,'FRA','ITA','mediterranean');s.paused=true;s.savedAt=new Date().toISOString();validateSave(s,c);
fs.writeFileSync(path.join(saves,'campaign.json'),JSON.stringify(s));
const server=await createGameServer({port:0,saveDir:saves,publicDirectory});await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;const errors=[],results=[];
try{
 browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1920,height:1080}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-action="continue"]').click();
 console.log('War bar: '+await page.locator('.resource-war').innerText());assert.match(await page.locator('.resource-war').innerText(),/ITA ↓/);
 for(const width of [1920,1366]){
  await page.setViewportSize({width,height:width===1920?1080:768});
  for(const view of ['command','reports','diplomacy']){
   await page.locator('[data-action="view"][data-view="'+view+'"]').click();
   const measure=await page.evaluate(()=>[...document.querySelectorAll('.time-bar,.resource-bar,.workspace-inner,.fleet-order-panel')].filter(e=>e.getBoundingClientRect().width>0).map(e=>({class:e.className,x:e.scrollWidth-e.clientWidth,y:e.scrollHeight-e.clientHeight})));
   results.push({width,view,measure});await page.screenshot({path:path.join(out,'war-'+view+'-'+width+'.png')});
  }
 }
 await page.locator('[data-action="view"][data-view="reports"]').click();await page.locator('[data-action="report"]').first().click();assert.match(await page.locator('.modal-body').innerText(),/sailors lost/);assert.match(await page.locator('.modal-body').innerText(),/salvaged/);await page.screenshot({path:path.join(out,'war-report-details.png')});
 assert.equal(errors.length,0,errors.join('\n'));console.log(JSON.stringify({errors,results}));
}finally{await browser?.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'war-result.json'),JSON.stringify({errors,results,isolatedSaveDirectory:saves},null,2));}
