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
import {SCENARIOS} from '../combatmechanics/scenarios.mjs';

let playwright;
try {playwright=createRequire(import.meta.url)('playwright');}
catch {playwright=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'))('playwright');}
const output=path.resolve('test-output/chrome-ui');
await fs.mkdir(output,{recursive:true});
const run=await fs.mkdtemp(path.join(output,'fixtures-'));
const widths=[1920,1366,1100,900,768];
const checks=[],metrics=[],errors=[],sessions=[];
const result={passed:false,checks,metrics,errors,limitations:["Headless HTML and native-bridge protocol verification only; no native rendered appearance is certified."]};
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
 await context.addInitScript(()=>{
  window.__chromeNativeCalls=[];
  const record=method=>async json=>{const packet=JSON.parse(json);window.__chromeNativeCalls.push({method,packet});if(method==='viewport'&&packet.mode==='world')queueMicrotask(()=>window.WNTUnreal?.receive({instanceId:packet.instanceId,type:'camera',zoom:1,longitude:0,latitude:0,tilt:0}));};
  window.ue={wnt:{world:record('world'),battle:record('battle'),sceneinput:record('sceneinput'),viewport:record('viewport'),closeapproved:async x=>x}};
 });
 await page.goto('http://127.0.0.1:'+server.address().port+'/?unreal=1');
 await page.locator('.start-screen').waitFor();
 return record;
}
async function viewport(page,width) {await page.setViewportSize({width,height:width>=1600?1000:768});await page.waitForTimeout(160);}
async function noOverflow(page,label) {
 const geometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
 assert(geometry.scrollWidth<=geometry.width+1&&geometry.body<=geometry.width+1,label+' has horizontal overflow');
 assert(!/\b(?:NaN|undefined|Infinity)\b/.test(await page.locator('#app').innerText()),label+' has invalid display values');
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
 const sizes=[[1800,1000],[1920,1080],[2560,1440],[3840,2160],[2560,1080],[3440,1440],[5120,2160]];
 for(const [i,[width,height]] of sizes.entries()) {
  await page.setViewportSize({width,height});
  const campaign=Object.keys(CATALOG.campaigns)[i%Object.keys(CATALOG.campaigns).length],nation=['USA','GBR','DEU','FRA','JPN','ITA','SOV'][i];
  await page.locator('[data-action="select-campaign"][data-id="'+campaign+'"]').click();
  await page.locator('[data-action="select-nation"][data-id="'+nation+'"]').click();
  assert.equal(await page.locator('[data-action="select-nation"][aria-pressed="true"]').getAttribute('data-id'),nation);
  assert.equal(await page.locator('[data-action="select-campaign"][aria-pressed="true"]').getAttribute('data-id'),campaign);
  const previewState=newGame(CATALOG,nation,19221936,campaign),previewFleet=fleetSummary(previewState,contentFor(CATALOG,previewState),nation);
  const shownFleet=await page.locator('.start-nation-stats strong').allTextContents();
  assert.equal(Number(shownFleet[0].replaceAll(',','')),previewFleet.active,'Selected '+campaign+'/'+nation+' active opening fleet');
  assert.equal(Number(shownFleet[1].replaceAll(',','')),previewFleet.building,'Selected '+campaign+'/'+nation+' construction');
  assert.equal((await page.locator('.start-nation-details h2').innerText()),CATALOG.campaigns[campaign].nations[nation].name);
  const scope=CATALOG.campaigns[campaign].scenario.scope;
  if(scope){await page.locator('.start-campaign-description summary').click();assert((await page.locator('.start-campaign-description').innerText()).includes(scope));await page.locator('.start-campaign-description summary').click();}
  assert.equal(await page.locator('[data-action="select-nation"]').count(),7);
  assert.equal(await page.locator('.start-screen canvas').count(),0);
  assert.equal(await page.locator('.start-battle-choice').count(),SCENARIOS.length+1);
  await noOverflow(page,'Title '+width);
  const geometry=await page.locator('.start-screen').evaluate(root=>({height:innerHeight,scrollHeight:document.documentElement.scrollHeight,campaign:root.querySelector('[data-campaign-category="historical"]').getBoundingClientRect().toJSON(),alternate:root.querySelector('[data-campaign-category="alternate"]').getBoundingClientRect().toJSON(),tactical:root.querySelector('.start-tactical').getBoundingClientRect().toJSON(),footer:root.querySelector('.start-screen-footer').getBoundingClientRect().toJSON()}));
  assert(geometry.scrollHeight<=height+1&&geometry.footer.bottom<=height+1,'Main menu has no root scrollbar');
  assert(geometry.campaign.right<geometry.alternate.left&&geometry.alternate.right<geometry.tactical.left,'Main menu has three separate primary areas');
  const choices=await page.locator('.start-battle-options').evaluate(node=>({top:node.getBoundingClientRect().top,bottom:node.getBoundingClientRect().bottom,
    buttons:[...node.children].map(button=>button.getBoundingClientRect().toJSON())}));
  assert(choices.buttons.every(button=>button.top>=choices.top-1&&button.bottom<=choices.bottom+1),'All compact tactical buttons fit without an inner scroll at '+width+'×'+height);
  for(const scenario of Object.values(CATALOG.campaigns).map(c=>c.scenario)) assert((await page.locator('[data-action="select-campaign"][data-id="'+scenario.id+'"]').innerText()).includes(scenario.start),'Full campaign date is visible');
  await page.locator('[data-action="new"]').click();await page.locator('[data-dialog-type="new"]').waitFor();
  await page.locator('.modal [data-action="close"]').first().click();
  metrics.push({kind:'title',width,height,campaign,nation,...geometry});
  await page.screenshot({path:path.join(output,'title-'+width+'x'+height+'.png')});
 }
 await page.locator('[data-action="select-campaign"][data-id="campaign_1922"]').click();
 for(const nation of ['USA','JPN','ITA']) {
  await page.locator('[data-action="select-nation"][data-id="'+nation+'"]').click();
  const expectedState=newGame(CATALOG,nation,19221936,'campaign_1922');
  const expected=fleetSummary(expectedState,contentFor(CATALOG,expectedState),nation).building;
  const shown=Number((await page.locator('.start-nation-stats > span').filter({hasText:'warships building'}).locator('strong').innerText()).replaceAll(',',''));
  assert.equal(shown,expected,nation+' opening treaty choices');
 }
 for(const presetId of [...SCENARIOS.map(s=>s.id),'custom']) {
  await page.locator('[data-action="tactical"][data-preset="'+presetId+'"]').click();
  await page.locator('.tactical-engagements').waitFor();
  assert.equal(await page.locator('[data-setup="presetId"]').inputValue(),presetId);
  await page.locator('[data-tactical="close"]').click();await page.locator('.start-screen').waitFor();
 }
 assert.equal(await page.locator('.start-screen canvas').count(),0);
 assert.equal(await page.evaluate(()=>__chromeNativeCalls.filter(c=>c.method==='battle').length),0,'Static title and setup send no old demo battle packets');
 assert.equal(record.posts,0);assert.equal(await fs.readFile(record.savePath,'utf8'),originalFile);assert.deepEqual(await storage(page),originalStorage);
 checks.push('Main menu separates Historical Campaigns, Alternate History and compact Tactical Battles at seven supported sizes, has no outer scrollbar or demo viewport, opens every matching tactical setup, shows full campaign dates, preserves campaign/navy previews, and changes neither saved campaign nor recovery journal.');
 await page.locator('[data-action="continue"]').click();await page.locator('.workspace.view-command').waitFor();
 assert.deepEqual(clockState(await saveSnapshot(record)),clockState(original));
 checks.push('Continue preserves saved country, campaign, clock, RNG and pause state.');
 const fresh=await session('new-campaign',null),freshPage=fresh.page;
 await freshPage.locator('[data-action="select-campaign"][data-id="campaign_1922"]').click();
 await freshPage.locator('[data-action="select-nation"][data-id="FRA"]').click();
 await freshPage.locator('[data-action="new"]').click();await freshPage.locator('.workspace').waitFor();await acknowledge(freshPage);
 const created=await saveSnapshot(fresh);assert.equal(created.player,'FRA');assert.equal(created.campaignId,'campaign_1922');
 checks.push('New campaign starts the selected French1922 campaign and persists a valid isolated save.');
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
 await page.locator('.battle-report-tabs [data-action="report-summary"]').click();await page.locator('.modal[data-dialog-type="report"]').waitFor();
 await page.locator('.battle-report-tabs [data-action="watch-battle"]').click();await page.locator('.modal .battle-canvas').waitFor();
 await page.locator('.modal [data-action="close"]').first().click();
}
async function campaignChecks(war) {
 const name=war?'war':'peace',original=fixture(war),record=await session(name,original),page=record.page;
 await page.locator('[data-action="continue"]').click();await page.locator('.workspace.view-command').waitFor();
 const selection=page.locator('.fleet-command-row').first();await selection.click();
 const fleetId=await page.locator('.fleet-command-row.selected').getAttribute('data-id');assert(fleetId);
 const views=await page.locator('.sidebar .nav-item').evaluateAll(nodes=>nodes.map(n=>n.dataset.view).filter(v=>v!=='command'&&v!=='tactical'));
 assert.equal(views.length,9);
 assert.equal(await page.locator('.sidebar .nav-item').count(),10,'Campaign has only menus 01–10; battles are in reports');
 const before=clockState(await saveSnapshot(record));
 await viewport(page,1800);
 const legend=await page.locator('.map-legend').evaluate(node=>{
  const bounds=node.getBoundingClientRect(),items=[...node.children].map(child=>({text:child.textContent,rect:child.getBoundingClientRect().toJSON()}));
  return {bounds:bounds.toJSON(),items,fleetSymbols:node.querySelectorAll('[data-chart-symbol="fleet"]').length,viewport:{width:innerWidth,height:innerHeight}};
 });
 assert.equal(legend.fleetSymbols,6,'All six fleet-role glyphs remain visible in the lower legend');
 assert(legend.bounds.left>=0&&legend.bounds.right<=1801&&legend.bounds.bottom<=1001,'Legend fits the minimum window');
 for(const item of legend.items)assert(item.rect.left>=legend.bounds.left-1&&item.rect.right<=legend.bounds.right+1&&item.rect.top>=legend.bounds.top-1&&item.rect.bottom<=legend.bounds.bottom+1,'Legend item fits without clipping: '+item.text);
 metrics.push({kind:'minimum-window-legend',case:name,width:1800,...legend});
 await page.screenshot({path:path.join(output,name+'-legend-1800.png')});
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
    await page.locator('.workspace.view-'+view+' .workspace-inner').evaluate(node=>{node.scrollTop=node.scrollHeight;});
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
 checks.push(name+': compact two-row chrome, all16 resource breakdowns and all9 ministry close controls at five widths; date, pause, RNG and fleet selection unchanged.');
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
