import {createRequire} from 'node:module';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createGameServer} from '../worker/desktop/server.mjs';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {newGame, addLog, fleetSummary} from '../mechanics/engine.mjs';
import {contentFor} from '../mechanics/campaign-content.mjs';
import {beginEngagement} from '../mechanics/engagements.mjs';
import {campaignMinutes} from '../mechanics/campaign-clock.mjs';
import {createDiplomaticOffer} from '../mechanics/diplomatic-exchange.mjs';
import {diplomaticTerms} from '../mechanics/diplomacy-rules.mjs';
import {validateSave} from '../mechanics/state-io.mjs';

let playwright;
try {playwright=createRequire(import.meta.url)('playwright');}
catch {playwright=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'))('playwright');}
const output=path.resolve('test-output/chrome-ui');
await fs.mkdir(output,{recursive:true});
const run=await fs.mkdtemp(path.join(output,'fixtures-'));
const widths=[1920,1366,1100,900,768];
const checks=[],metrics=[],errors=[],sessions=[];
const result={passed:false,checks,metrics,errors};
const browser=await playwright.chromium.launch({channel:'msedge',headless:true});
let current;

function fixture(war=false) {
 const s=newGame(CATALOG,'USA',380038,'in_good_faith_1936');
 s.decisions=[];s.log=[];s.alerts=[];s.paused=true;s.autoPause=false;s.audioEnabled=false;s.musicEnabled=false;
 const c=contentFor(CATALOG,s);
 if(war) {
  Object.assign(s.relations['JPN-USA'],{war:true,allied:false,warSince:s.day});
  const fleets=['USA','JPN'].map(id=>s.nations[id].fleets.find(f=>f.role==='battle'));
  beginEngagement(s,c,{kind:'surface',a:'USA',b:'JPN',fleetA:fleets[0].id,fleetB:fleets[1].id,region:'pacific',position:[160,20]});
  createDiplomaticOffer(s,'GBR','USA','sell',diplomaticTerms(s,c,'USA','sell','GBR'));
 }
 addLog(s,'Chrome integration: review the actual economic accounts.','trade',{newsView:'economy'});
 validateSave(s,CATALOG);return s;
}
async function session(name,state,{reducedMotion='no-preference'}={}) {
 const directory=path.join(run,name);await fs.mkdir(directory,{recursive:true});
 const savePath=path.join(directory,'campaign.json');
 if(state)await fs.writeFile(savePath,JSON.stringify(state));
 const server=await createGameServer({saveDir:directory});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion});
 const page=await context.newPage();page.setDefaultTimeout(12000);
 const record={name,page,context,server,savePath,posts:0};sessions.push(record);current=record;
 page.on('pageerror',error=>errors.push({name,message:error.message,stack:error.stack}));
 page.on('request',request=>{if(new URL(request.url()).pathname==='/api/save'&&request.method()==='POST')record.posts++;});
 await page.goto('http://127.0.0.1:'+server.address().port);
 await page.locator('.start-screen').waitFor();
 return record;
}
async function viewport(page,width) {await page.setViewportSize({width,height:width>=1600?1000:768});await page.waitForTimeout(160);}
async function noOverflow(page,label) {
 const geometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
 assert(geometry.scrollWidth<=geometry.width+1&&geometry.body<=geometry.width+1,label+' has horizontal overflow');
 assert(!/\b(?:NaN|undefined|Infinity)\b/.test(await page.locator('#app').innerText()),label+' has invalid display values');
}
const demo = page => page.locator('.start-demo');
const demoControl = (page,action) => page.locator('.start-demo [data-demo-action="'+action+'"]');
const demoState = async page => demo(page).evaluate(node=>({...node.dataset}));
async function readyDemo(page) {await page.waitForFunction(()=>document.querySelector('.start-demo')?.dataset.demoReady==='true');}
async function pauseDemo(page) {
 if((await demoState(page)).demoPlaying==='true')await demoControl(page,'toggle').click();
 await page.waitForFunction(()=>document.querySelector('.start-demo')?.dataset.demoPlaying==='false');
}
async function storage(page) {return page.evaluate(()=>Object.fromEntries(Object.entries(localStorage)));}
async function saveSnapshot(record) {
 // The normal Save action preserves pause state. The desktop-close helper
 // deliberately pauses first, which would conceal an accidental close/resume.
 const response=record.page.waitForResponse(value=>new URL(value.url()).pathname==='/api/save'&&value.request().method()==='POST');
 await record.page.locator('.sidebar [data-action="save"]').click();assert.equal((await response).status(),200);
 const state=JSON.parse(await fs.readFile(record.savePath,'utf8'));validateSave(state,CATALOG);return state;
}
function clockState(state) {return {at:campaignMinutes(state),paused:state.paused,player:state.player,campaign:state.campaignId,seed:state.seed};}
async function acknowledge(page) {
 for(let i=0;i<12&&await page.locator('.diplomatic-dispatch').count();i++) {
  await page.locator('.diplomatic-dispatch [data-action="defer-decision"],.diplomatic-dispatch [data-action="choose"]:not(:disabled)').first().click();
  await page.waitForTimeout(100);
 }
 assert.equal(await page.locator('.diplomatic-dispatch').count(),0);
}

async function titleChecks() {
 const original=fixture(),record=await session('title',original),page=record.page;
 const originalFile=await fs.readFile(record.savePath,'utf8'),originalStorage=await storage(page);
 await readyDemo(page);
 for(const [i,width] of widths.entries()) {
  await viewport(page,width);await readyDemo(page);await pauseDemo(page);
  const campaign=i%2?'campaign_1922':'in_good_faith_1936',nation=['USA','GBR','DEU','FRA','JPN'][i];
  await page.locator('[data-action="select-campaign"][data-id="'+campaign+'"]').click();
  await page.locator('[data-action="select-nation"][data-id="'+nation+'"]').click();
  assert(await page.locator('[data-action="select-campaign"][data-id="'+campaign+'"]').evaluate(node=>node.classList.contains('selected')));
  assert(await page.locator('[data-action="select-nation"][data-id="'+nation+'"]').evaluate(node=>node.classList.contains('selected')));
  assert.equal(await page.locator('[data-action="select-nation"]').count(),7);
  await noOverflow(page,'Title '+width);
  await page.locator('[data-action="new"]').click();await page.locator('[data-dialog-type="new"]').waitFor();
  assert.equal((await demoState(page)).demoPlaying,'false','New-campaign confirmation suspends the demo');
  await page.locator('.modal [data-action="close"]').first().click();
  const bounds=await page.locator('.start-screen').evaluate(node=>({height:node.getBoundingClientRect().height,scrollHeight:node.scrollHeight,clientHeight:node.clientHeight,overflowY:getComputedStyle(node).overflowY}));
  if(bounds.scrollHeight>bounds.clientHeight+1) {
   assert(['auto','scroll'].includes(bounds.overflowY),'Opening screen permits real vertical scrolling');
   await page.locator('.start-screen').evaluate(node=>{node.scrollTop=0;});
   await page.mouse.move(width/2,Math.min(650,bounds.height-30));await page.mouse.wheel(0,1600);
   await page.waitForFunction(()=>document.querySelector('.start-screen').scrollTop>0);
   const footer=await page.locator('.start-screen-footer').boundingBox();assert(footer.y>=0&&footer.y+footer.height<=page.viewportSize().height+1,'Opening footer can be reached with a real wheel scroll');
   if(width===768)await page.screenshot({path:path.join(output,'title-footer-768.png')});
   await page.locator('.start-screen').evaluate(node=>{node.scrollTop=0;});
  }
  metrics.push({kind:'title',width,campaign,nation,...bounds});
  await page.screenshot({path:path.join(output,'title-'+width+'.png'),fullPage:true});
 }
 await page.locator('[data-action="select-campaign"][data-id="campaign_1922"]').click();
 for(const nation of ['USA','JPN','ITA']) {
  await page.locator('[data-action="select-nation"][data-id="'+nation+'"]').click();
  const expectedState=newGame(CATALOG,nation,19221936,'campaign_1922');
  const expected=fleetSummary(expectedState,contentFor(CATALOG,expectedState),nation).building;
  const shown=Number((await page.locator('.start-nation-stats > span').filter({hasText:'warships building'}).locator('strong').innerText()).replaceAll(',',''));
  assert.equal(shown,expected,nation+' preview honors the selected human navy’s opening treaty choices');
  metrics.push({kind:'opening-preview',nation,campaign:'campaign_1922',building:shown});
 }
 await viewport(page,1366);await pauseDemo(page);
 await demoControl(page,'toggle').click();
 await page.waitForFunction(()=>document.querySelector('.start-demo')?.dataset.demoPlaying==='true');
 await page.locator('[data-action="new"]').click();await page.locator('[data-dialog-type="new"]').waitFor();
 await page.waitForFunction(()=>document.querySelector('.start-demo')?.dataset.demoPlaying==='false');
 const obscured=await demoState(page);await page.waitForTimeout(400);
 assert.equal((await demoState(page)).demoFrame,obscured.demoFrame,'An obscuring dialog stops the running demo');
 await page.locator('.modal [data-action="close"]').first().click();
 await page.waitForFunction(()=>document.querySelector('.start-demo')?.dataset.demoPlaying==='true');
 await pauseDemo(page);
 const before=await demoState(page);
 await demoControl(page,'next').click();
 await page.waitForFunction(old=>{const n=document.querySelector('.start-demo');return n.dataset.demoFrame!==old.demoFrame||n.dataset.demoBattle!==old.demoBattle;},before);
 const paused=await demoState(page);await page.waitForTimeout(400);
 assert.equal((await demoState(page)).demoFrame,paused.demoFrame,'Paused demo does not advance itself');
 await page.waitForFunction(()=>[...document.querySelectorAll('.start-demo [data-demo-action="select-ship"]')].some(n=>n.dataset.demoVisible==='true'));
 const hit=await page.locator('.start-demo [data-demo-action="select-ship"][data-demo-visible="true"]').first().evaluate(node=>({id:node.dataset.demoId,side:node.dataset.demoSide,x:Number(node.dataset.demoX),y:Number(node.dataset.demoY)}));
 const canvas=await page.locator('.start-demo .battle-canvas').boundingBox();
 assert.equal(await page.locator('.start-demo-inspection').count(),0,'No inspection is shown before selecting a hull');
 await page.mouse.click(canvas.x+hit.x,canvas.y+hit.y);
 await page.locator('.start-demo-inspection').waitFor();
 assert.equal(await page.locator('.start-demo-inspection').getAttribute('data-demo-side'),hit.side);
 assert.equal(await page.locator('.start-demo-inspection').getAttribute('data-demo-id'),hit.id);
 assert.match(await page.locator('.start-demo-inspection').innerText(),/illustrat|condition|damage/i);
 metrics.push({kind:'demo-pointer-inspection',...hit});
 await demoControl(page,'next-battle').click();
 assert.notEqual((await demoState(page)).demoBattle,paused.demoBattle,'Next battle switches the demonstration');
 await demoControl(page,'previous-battle').click();
 assert.equal((await demoState(page)).demoBattle,paused.demoBattle,'Previous battle returns to the prior demonstration');
 // Move to the final authored frame through real controls, then let the timer
 // cross the cycle boundary rather than waiting for an entire demonstration.
 let state=await demoState(page),count=Number(state.demoFrames);
 assert(Number.isInteger(count)&&count>1&&count<100,'Demo publishes a bounded authored frame count');
 while(Number((await demoState(page)).demoFrame)<count-1)await demoControl(page,'next').click();
 const last=await demoState(page);await demoControl(page,'toggle').click();
 await page.waitForFunction(id=>document.querySelector('.start-demo')?.dataset.demoBattle!==id,last.demoBattle,{timeout:7000});
 assert.equal((await demoState(page)).demoPlaying,'true');
 const resumeFrame=await demoState(page);
 await page.waitForFunction(old=>document.querySelector('.start-demo')?.dataset.demoFrame!==old,resumeFrame.demoFrame,{timeout:7000});
 // Drive the production visibility handler deterministically: headless browsers
 // do not reliably mark another tab as hidden. Restore the native property after.
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForFunction(()=>document.querySelector('.start-demo')?.dataset.demoPlaying==='false');
 const hidden=await demoState(page);await page.waitForTimeout(400);
 assert.equal((await demoState(page)).demoFrame,hidden.demoFrame,'Hidden-document lifecycle stops the demo timer');
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.waitForFunction(()=>document.querySelector('.start-demo')?.dataset.demoPlaying==='true');
 await pauseDemo(page);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 assert.equal((await demoState(page)).demoPlaying,'false','Visibility restoration respects a user pause');
 assert.equal(record.posts,0,'Opening demo and selection never post a campaign save');
 assert.equal(await fs.readFile(record.savePath,'utf8'),originalFile,'Opening demo never changes disk campaign data');
 assert.deepEqual(await storage(page),originalStorage,'Opening demo never changes the recovery journal');
 checks.push('Title layout and campaign/nation selection at five widths; New confirmation remains usable and suspends the demo.');
 checks.push('US, Japanese and Italian 1922 construction previews match their own selected-player campaign state.');
 checks.push('Actual canvas hull click, pause/manual tick, previous/next battle, timed advance/cycle and simulated document-visibility lifecycle; disk save and localStorage unchanged.');
 await page.locator('[data-action="continue"]').click();await page.locator('.workspace.view-command').waitFor();
 assert.equal(await page.locator('.start-demo-host').count(),0,'Campaign entry unmounts the demo');
 assert.deepEqual(clockState(await saveSnapshot(record)),clockState(original),'Continue loads the existing campaign instead of the selected new-game setup');
 checks.push('Continue preserves the saved country, campaign, clock, RNG and pause state; the demo is unmounted.');
 const reduced=await session('reduced-motion',fixture(),{reducedMotion:'reduce'});await readyDemo(reduced.page);
 const reducedBefore=await demoState(reduced.page);assert.equal(reducedBefore.demoPlaying,'false');
 await reduced.page.waitForTimeout(400);assert.equal((await demoState(reduced.page)).demoFrame,reducedBefore.demoFrame);
 await demoControl(reduced.page,'next').click();
 assert.notEqual((await demoState(reduced.page)).demoFrame,reducedBefore.demoFrame,'Reduced motion still permits explicit frame navigation');
 assert.equal(reduced.posts,0);checks.push('Reduced-motion mode starts paused and retains manual demonstration controls without saving campaign data.');
 const fresh=await session('new-campaign',null),freshPage=fresh.page;
 await freshPage.locator('[data-action="select-campaign"][data-id="campaign_1922"]').click();
 await freshPage.locator('[data-action="select-nation"][data-id="FRA"]').click();
 await freshPage.locator('[data-action="new"]').click();await freshPage.locator('.workspace').waitFor();await acknowledge(freshPage);
 const created=await saveSnapshot(fresh);assert.equal(created.player,'FRA');assert.equal(created.campaignId,'campaign_1922');
 assert.equal(await freshPage.locator('.start-demo-host').count(),0);
 checks.push('New campaign starts the selected French 1922 campaign and persists a valid isolated save.');
}

async function chromeGeometry(page,name,width) {
 const geometry=await page.evaluate(()=>{
  const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
  const bar=document.querySelector('.time-bar'),rail=document.querySelector('.news-rail'),clock=document.querySelector('.campaign-clock');
  const children=[...document.querySelector('.game-body').children],workspace=children.findIndex(n=>n.classList.contains('workspace'));
  return {time:rect('.time-bar'),resources:rect('.resource-bar'),workspace:rect('.workspace'),news:rect('.news-rail'),newsViewport:rect('.news-viewport'),
   newsInside:bar.contains(rail),newsAfterClock:!!(clock.compareDocumentPosition(rail)&Node.DOCUMENT_POSITION_FOLLOWING),
   preceding:children.slice(0,workspace).map(n=>n.className)};
 });
 assert(geometry.newsInside&&geometry.newsAfterClock,'News occupies the time bar after the clock');
 assert.equal(geometry.preceding.length,2,'Only the time and resource bars precede the workspace');
 assert(geometry.preceding[0].includes('time-bar')&&geometry.preceding[1].includes('resource-bar'));
 assert(geometry.newsViewport.width>=60,'The moving-news viewport retains usable space');
 assert(geometry.news.x>=geometry.time.x-1&&geometry.news.right<=geometry.time.right+1
  &&geometry.news.y>=geometry.time.y-1&&geometry.news.bottom<=geometry.time.bottom+1,'The embedded news rail stays inside the time bar');
 assert(geometry.time.bottom<=geometry.resources.y+2&&geometry.resources.bottom<=geometry.workspace.y+16,'Chrome rows do not overlap');
 assert(geometry.time.height+geometry.resources.height<=(width>=1366?180:width>=1100?235:width>=900?260:290),'Chrome remains compact at '+width);
 await noOverflow(page,name+' chrome '+width);metrics.push({kind:'chrome',case:name,width,...geometry});
}
async function resourceChecks(page,name,width) {
 const resources=await page.locator('.resource-bar [data-resource]').evaluateAll(nodes=>nodes.map(n=>n.dataset.resource));
 assert.equal(resources.length,16);assert.equal(new Set(resources).size,16);
 for(const resource of resources) {
  const target=page.locator('.resource-bar [data-resource='+JSON.stringify(resource)+']');
  await page.mouse.move(1,1);await target.focus();
  await page.locator('.class-hover:not([hidden]) [data-breakdown='+JSON.stringify(resource)+']').waitFor();
  const tip=page.locator('.class-hover:not([hidden])');
  assert((await tip.innerText()).length>80,resource+' has its full breakdown');
  assert(!/\b(?:NaN|undefined|Infinity)\b/.test(await tip.innerText()));
  const bounds=await tip.boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width+1&&bounds.y>=0,'Resource hover fits horizontally');
  await tip.evaluate(node=>{node.scrollTop=node.scrollHeight;});
  const readable=await tip.locator('.formula').evaluate(node=>{const a=node.getBoundingClientRect(),b=node.closest('.class-hover').getBoundingClientRect();return a.bottom<=b.bottom+1&&a.bottom>b.top;});
  assert(readable,resource+' formula is reachable at the bottom of its scrollable hover');
  if(width===768&&['GOLD','SUPPLY','AIRCRAFT'].includes(resource))await page.screenshot({path:path.join(output,name+'-'+resource.toLowerCase()+'-768.png')});
 }
 await page.locator('[data-action="pause"]').focus();await page.mouse.move(1,1);
 await page.waitForTimeout(260);
}
async function pendingChecks(page,offer) {
 await page.locator('.time-bar .pending-offers').click();await page.locator('.workspace.view-diplomacy').waitFor();
 await page.locator('[data-offer="'+offer.id+'"]').waitFor();
 await page.locator('.workspace-close').click();
 await page.locator('.time-bar .decisive-alert [data-action="watch-battle"]').click();await page.locator('.modal .battle-canvas').waitFor();
 await page.locator('.modal [data-action="close"]').first().click();
}
async function campaignChecks(war) {
 const name=war?'war':'peace',original=fixture(war),record=await session(name,original),page=record.page;
 await page.locator('[data-action="continue"]').click();await page.locator('.workspace.view-command').waitFor();
 const selection=page.locator('.fleet-command-row').first();await selection.click();
 const fleetId=await page.locator('.fleet-command-row.selected').getAttribute('data-id');assert(fleetId);
 const views=await page.locator('.sidebar .nav-item').evaluateAll(nodes=>nodes.map(n=>n.dataset.view).filter(v=>v!=='command'));
 assert.equal(views.length,10);
 const before=clockState(await saveSnapshot(record));
 if(!war) {
  // Exercise this before the layout sweep: unattended news deliberately records
  // itself as read once its scrolling animation completes.
  const message=page.locator('.time-bar .news-message');await message.waitFor();
  await page.waitForFunction(()=>{const n=document.querySelector('.news-message'),r=n?.getBoundingClientRect(),v=n?.parentElement.getBoundingClientRect();return r&&v&&Math.min(r.right,v.right)-Math.max(r.left,v.left)>40;});
  const point=await message.evaluate(n=>{const r=n.getBoundingClientRect(),v=n.parentElement.getBoundingClientRect();return{x:(Math.max(r.left,v.left)+Math.min(r.right,v.right))/2,y:(r.top+r.bottom)/2};});
  await page.mouse.move(point.x,point.y);await page.mouse.click(point.x,point.y);
  await page.locator('.workspace.view-economy').waitFor();
  const saved=await saveSnapshot(record);assert(saved.log.find(row=>row.text.startsWith('Chrome integration:')).dismissed,'Clicking news acknowledges its actual saved notice');
  await page.locator('.workspace-close').click();await page.locator('.workspace.view-command').waitFor();
  checks.push('A real moving ticker notice remains clickable and opens its economic panel while recording the read receipt.');
 }
 for(const width of widths) {
  await viewport(page,width);await chromeGeometry(page,name,width);await resourceChecks(page,name,width);
  for(const view of views) {
   await page.locator('.sidebar [data-view="'+view+'"]').click();await page.locator('.workspace.view-'+view).waitFor();
   const close=page.locator('.workspace .workspace-close');assert.equal(await close.count(),1,view+' has one panel close control');
   assert.equal(await close.getAttribute('data-action'),'view');assert.equal(await close.getAttribute('data-view'),'command');
   assert(await close.getAttribute('aria-label'),'Panel close has an accessible label');
   await noOverflow(page,name+' '+view+' '+width);
   if((width===1920||width===768)&&['fleet','diplomacy'].includes(view)) {
    await page.locator('.workspace-inner').evaluate(node=>{node.scrollTop=node.scrollHeight;});
    const position=await close.boundingBox();assert(position.y>=0&&position.y+position.height<=(width>=1600?1000:768),'Close remains visible after scrolling the panel');
    await page.screenshot({path:path.join(output,name+'-'+view+'-close-'+width+'.png')});
   }
   await close.click();await page.locator('.workspace.view-command').waitFor();
   assert.equal(await page.locator('.fleet-command-row.selected').getAttribute('data-id'),fleetId,'Closing '+view+' preserves fleet selection');
   assert.equal(await page.locator('.workspace .workspace-close').count(),0,'Command map has no redundant close button');
  }
  if(war)await pendingChecks(page,original.diplomaticOffers[0]);
  const saved=await saveSnapshot(record);
  assert.deepEqual(clockState(saved),before,'Panel close and pending-alert inspection never change simulation state');
  if(war)assert.equal(saved.diplomaticOffers[0].status,'pending','Opening an offer does not accept it');
  await page.screenshot({path:path.join(output,name+'-chrome-'+width+'.png')});
 }
 checks.push(name+': compact two-row chrome, all16 resource breakdowns and all10 menu close controls at five widths; date, pause, RNG and fleet selection unchanged.');
 if(war) {
  checks.push('Pending trade and decisive-battle controls stay clickable inside the condensed news rail at every width; opening them neither accepts a trade nor advances time.');
 }
}

try {
 await titleChecks();await campaignChecks(false);await campaignChecks(true);
 assert.deepEqual(errors,[]);result.passed=true;
 console.log(JSON.stringify(result,null,2));
} catch(error) {
 result.failure=error.stack;
 if(current)await current.page.screenshot({path:path.join(output,'failure-'+current.name+'.png'),fullPage:true}).catch(()=>{});
 console.error(error.stack);process.exitCode=1;
} finally {
 await fs.writeFile(path.join(output,'result.json'),JSON.stringify(result,null,2));
 for(const {context,server} of sessions) {await context.close();await new Promise(resolve=>server.close(resolve));}
 await browser.close();
}
