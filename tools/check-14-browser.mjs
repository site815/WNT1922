import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createGameServer} from './play.mjs';
import {newGame,addAlert,resolveBattle} from '../game/src/engine.mjs';
import {contentFor} from '../game/src/campaign-content.mjs';
import {campaignMinutes,setCampaignMinutes} from '../game/src/campaign-clock.mjs';
import {CAMPAIGNS} from '../game/src/land-war.mjs';
import {validateSave} from '../game/src/state-io.mjs';
const require=createRequire('C:/Users/ser10hx470/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'),{chromium}=require('playwright');
const out=path.resolve('game/browser-test-output');fs.mkdirSync(out,{recursive:true});const saves=fs.mkdtempSync(path.join(out,'saves-14-')),publicDirectory=path.join(saves,'public');fs.cpSync('game/staging',publicDirectory,{recursive:true});
const bundle=JSON.parse(fs.readFileSync(path.join(publicDirectory,'content.json')));
const s=newGame(bundle,'JPN',140714),c=contentFor(bundle,s),n=s.nations.JPN;s.decisions=[];s.log=[];s.musicEnabled=false;s.autoPause=false;s.speed=.25;
resolveBattle(s,c,'JPN','USA','pacific');const report=s.reports[0];for(let i=0;i<20;i++)addAlert(s,'Dispatch '+i,'Routine ministry dispatch.');
const now=campaignMinutes(s),v=n.convoys[0],f=n.fleets.find(f=>f.role==='escort');assert.ok(f);
for(const force of [f,v])Object.assign(force,{route:[[145,25],[170,20]],departAt:now-100,arriveAt:now+10000,speed:10,nextPlanAt:now+10000,phase:'passage'});f.mission='guard';
s.world.fronts=['poland','island-guam'].map(id=>({...CAMPAIGNS.find(f=>f.id===id),progress:.5,pressure:.4,momentum:0,attackerSupply:.7,defenderSupply:.7,started:s.day,lastOutcome:null,status:'Contested'}));
validateSave(s,bundle);fs.writeFileSync(path.join(saves,'campaign.json'),JSON.stringify(s));
const server=await createGameServer({port:0,saveDir:saves,publicDirectory});await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port,result={version:'0.14.0',errors:[],checks:[],layouts:[]};let browser,page;
try{
 browser=await chromium.launch({channel:'msedge',headless:true});page=await browser.newPage({viewport:{width:1366,height:768}});page.on('pageerror',e=>result.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)result.errors.push(r.status()+' '+r.url());});
 await page.goto(url);await page.locator('[data-action="continue"]').click();await page.locator('.world-map').waitFor();
 const click=async(action,id)=>page.locator('[data-action="'+action+'"]'+(id?'[data-id="'+id+'"]':'')).first().click();
 const geometry=()=>page.evaluate(()=>{const box=s=>document.querySelector(s).getBoundingClientRect();return {rail:box('.alert-rail').height,railBottom:box('.alert-rail').bottom,map:box('.world-map').height,legend:box('.map-legend').height,overflow:document.documentElement.scrollWidth-innerWidth,sidebar:[...document.querySelectorAll('.nav-item')].map(e=>e.dataset.view)};});
 const crowded=await geometry();assert.equal(crowded.rail,48);assert.equal(crowded.sidebar[3],'fleet');assert.equal(crowded.sidebar[4],'programs');await click('clear-alerts');const empty=await geometry();assert.equal(empty.rail,crowded.rail);assert.equal(empty.railBottom,crowded.railBottom);assert.equal(empty.map,crowded.map);
 await click('escort-overlay');assert.equal(await page.locator('[data-action="escort-overlay"]').getAttribute('aria-pressed'),'true');assert.ok(await page.locator('.convoy-cover-ring.covered').count());assert.ok(await page.locator('[data-escort-area]').count());
 await page.locator('.convoy-marker[data-id="'+v.id+'"]').click();assert.match(await page.locator('.command-side-panel').innerText(),/Protecting forces/);assert.match(await page.locator('.command-side-panel').innerText(),/Escorted/);assert.equal(await page.locator('.modal').count(),0);
 for(const [width,height]of [[1366,768],[1920,1080],[2560,1080]]){await page.setViewportSize({width,height});await page.waitForTimeout(250);const row={width,height,...await geometry()};assert.equal(row.overflow,0);assert.equal(row.rail,48);assert.ok(row.legend<=32);result.layouts.push(row);await page.screenshot({path:path.join(out,'release14-map-'+width+'.png')});}
 await page.setViewportSize({width:1366,height:768});await page.waitForTimeout(250);await click('pause');await page.waitForTimeout(1300);
 const frames=()=>page.locator('.world-map').evaluate(e=>Number(e.dataset.motionFrames));
 const map=await page.locator('.world-map').boundingBox();await page.mouse.move(map.x+map.width*.48,map.y+map.height*.35);let before=await frames();await page.mouse.down();
 for(let i=0;i<25;i++){await page.mouse.move(map.x+map.width*.48+i*3,map.y+map.height*.35+Math.sin(i*.3)*10);await page.waitForTimeout(25);}const held=await frames();await page.waitForTimeout(500);const resting=await frames();await page.mouse.up();assert.ok(held-before>10,'animation advances while dragging');assert.ok(resting-held>10,'animation advances with pointer held still');result.drag={framesDuringMovement:held-before,framesWhileHeld:resting-held};
 before=await frames();for(let i=0;i<16;i++){await page.mouse.wheel(0,i%2?-100:100);await page.waitForTimeout(25);}const after=await frames();assert.ok(after-before>10,'animation advances through repeated map wheel zoom');result.wheelFrames=after-before;
 await click('command-list');const side=await page.locator('.command-side-panel').boundingBox();await page.mouse.move(side.x+side.width*.5,side.y+side.height*.7);before=await frames();for(let i=0;i<12;i++){await page.mouse.wheel(0,i%2?-100:100);await page.waitForTimeout(35);}assert.ok((await frames())-before>10);result.panelScrollFrames=(await frames())-before;
 const animations=await page.evaluate(async()=>{const sample=selector=>{const el=document.querySelector(selector),a=el.getAnimations().find(a=>a.animationName==='front-sweep');if(!a)throw Error('Front sweep missing '+selector);a.pause();const values=[];for(const t of [0,2400,4800]){a.currentTime=t;values.push(getComputedStyle(el).strokeDashoffset);}a.play();return values;};return {line:sample('.land-front.advancing'),island:sample('.island-front.advancing')};});
 for(const values of Object.values(animations)){assert.notEqual(values[0],values[1]);assert.equal(values[0],values[2]);}result.frontAnimation=animations;await click('pause');
 await click('section-tab','facilities');assert.match(await page.locator('[data-program="school"] .school-graduation').innerText(),/Monthly · every 1st/);assert.match(await page.locator('[data-program="pilots"] .school-graduation').innerText(),/Quarterly · 1 Jan \/ Apr \/ Jul \/ Oct/);
 await click('record-tab','reports');assert.ok((await page.locator('.workspace').innerText()).includes('Fleet engagement'));result.checks.push('Fixed alert rail with empty and overflowing notices','Fleet register before investment','Shared escort coverage; selected convoy details','Animation continues while dragging, pointer held, zooming and panel scrolling','Land and island animations reverse direction','Monthly/quarterly graduation labels','Battle reports survive dismissal');
 // A real daily treaty-expiry decision: the UI must resume the actual worker
 // after choosing, while personnel graduate at the same midnight boundary.
 await page.close();const decision=newGame(bundle,'JPN',1414);setCampaignMinutes(decision,Date.parse('1936-12-31T23:59:00Z')/60000);decision.decisions=[];decision.log=[];decision.alerts=[];decision.speed=.25;decision.musicEnabled=false;decision.nations.JPN.gold=decision.nations.JPN.industry=1e7;
 decision.nations.JPN.personnelTraining={sailors:99,aviators:29,lastDay:decision.day};fs.writeFileSync(path.join(saves,'campaign.json'),JSON.stringify(decision));
 const context=await browser.newContext({viewport:{width:1366,height:768}});page=await context.newPage();page.on('pageerror',e=>result.errors.push(e.message));await page.goto(url);await page.locator('[data-action="continue"]').click();await page.locator('.world-map').waitFor();await page.locator('[data-action="pause"]').click();await page.locator('[data-action="choose"][data-key="expiry"][data-id="lapse"]').waitFor();assert.match(await page.locator('.actual-speed').innerText(),/PAUSED/);
 await page.locator('[data-action="choose"][data-key="expiry"][data-id="lapse"]').click();await page.waitForFunction(()=>!document.querySelector('.actual-speed')?.classList.contains('is-paused'));assert.match(await page.locator('[data-action="pause"]').innerText(),/Pause/);await page.locator('[data-action="pause"]').click();
 result.checks.push('Real treaty deadline auto-pauses; responding resumes the worker');assert.equal(result.errors.length,0);console.log(JSON.stringify(result));
}catch(error){result.errors.push(error.stack);console.error(error);process.exitCode=1;await page?.screenshot({path:path.join(out,'release14-failure.png')}).catch(()=>{});}
finally{await browser?.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'release14-result.json'),JSON.stringify(result,null,2));}
