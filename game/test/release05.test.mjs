import {SAVE_VERSION} from '../src/version.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Worker} from 'node:worker_threads';
import {SimulationClient} from '../src/simulation-client.mjs';
import {SimulationRunner} from '../src/simulation-runner.mjs';
import {newGame,monthlyIncome,orderShip,issueFleetOrder} from '../src/engine.mjs';
import {contentFor} from '../src/campaign-content.mjs';
import {merchantEconomy,DOMESTIC_SHARE} from '../src/merchant-economy.mjs';
import {closeEconomicMonth} from '../src/economic-growth.mjs';
import {sinkMerchants} from '../src/task-forces.mjs';
import {recordWarBattle,recordWarRaid,warBalances} from '../src/war-balance.mjs';
import {SPEEDS,dailyResources,productionBlock} from '../src/naval-resources.mjs';
import {campaignMinutes} from '../src/campaign-clock.mjs';
import {validateSave} from '../src/state-io.mjs';
import {TRACKS} from '../src/music.mjs';
import crypto from 'node:crypto';
const b=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/public')+'/content.json'));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
test('merchant capacity connects all national trade shares, income and logistics; replacements restore it',()=>{
 for(const campaign of Object.keys(b.campaigns))for(const [id,share]of Object.entries(DOMESTIC_SHARE)){
  const s=newGame(b,id,72,campaign),c=contentFor(b,s),n=s.nations[id],before=merchantEconomy(s,c,id),income=monthlyIncome(s,c,id);
  assert.equal(before.domestic,share);assert.equal(before.coverage,1);sinkMerchants(s,id,1e6);const loss=merchantEconomy(s,c,id);assert.equal(loss.current,0);assert.equal(loss.economyFactor,share);assert.equal(loss.logistics,n.logistics*share);assert.ok(monthlyIncome(s,c,id).gold<income.gold);assert.ok(monthlyIncome(s,c,id).influence<income.influence);assert.ok(monthlyIncome(s,c,id).industry<income.industry);
  n.commerce=100;n.merchant.otherHulls=c.nations[id].merchants.hulls;n.merchant.otherGRT=before.baseline;n.tech.industry=3;assert.equal(merchantEconomy(s,c,id).required,before.baseline*1.3);assert.ok(merchantEconomy(s,c,id).coverage<1);
  assert.ok(!n.unlocked.some(k=>c.classes[k].service==='merchant'),id+' civilian shipping is outside naval orders');const shippingBefore=merchantEconomy(s,c,id).current;closeEconomicMonth(s,c,id);assert.ok(merchantEconomy(s,c,id).current>=shippingBefore);assert.equal(validateSave(s,b).version,SAVE_VERSION);
 }
});
test('war balance persists beyond report truncation and resets for a later war',()=>{
 const s=newGame(b,'JPN'),r=s.relations['JPN-USA'];r.war=true;r.warSince=s.day;
 recordWarBattle(s,{a:'JPN',b:'USA',resultA:{tons:0,damagedTons:1000},resultB:{tons:10000,damagedTons:2000}});recordWarRaid(s,'JPN','USA',8000);
 assert.equal(warBalances(s)[0].winner,'JPN');s.reports=[];assert.equal(warBalances(validateSave(s,b))[0].own.sunk,10000);r.warSince=s.day+1;assert.equal(warBalances(s)[0].result,'Even');
});
test('simulation runner bounds load and preserves each operational minute while slowing safely',()=>{
 const s=newGame(b);s.autoPause=false;s.paused=false;s.decisions=[];s.speed=5;let time=0;const runner=new SimulationRunner(b,{now:()=>time,budgetMs:10});runner.replace(s);time=1000;const start=campaignMinutes(s);runner.advance();assert.ok(campaignMinutes(s)-start<=209);assert.ok(runner.metrics().actual<50000);assert.equal(s.minuteTicks,Math.floor(campaignMinutes(s)-start));assert.ok(runner.credit<=250);
 s.paused=true;time+=10000;runner.advance();assert.equal(runner.credit,0);assert.equal(runner.metrics().actual,0);assert.ok(SPEEDS.some(([v])=>v===10));
});
test('worker advances independently, serializes orders, freezes paused snapshots and rolls back rejected changes',async t=>{
 let latest,metrics,heartbeats=0;
 const client=new SimulationClient({createWorker:()=>{const w=new Worker(new URL('./worker-adapter.mjs',import.meta.url));const bridge={postMessage:m=>w.postMessage(m),terminate:()=>w.terminate()};w.on('message',data=>bridge.onmessage?.({data}));w.on('error',error=>bridge.onerror?.(error));return bridge;},onState:(s,m)=>{latest=s;metrics=m;},onError:m=>assert.fail(m)});
 t.after(()=>client.worker?.terminate());
 const s=newGame(b,'USA');s.autoPause=false;s.decisions=[];s.speed=10;const start=campaignMinutes(s);await client.start(b,s);const idle=await client.snapshot();assert.equal(campaignMinutes(idle),start);
 const timer=setInterval(()=>heartbeats++,10);await client.transact(s=>{s.paused=false;});await sleep(850);clearInterval(timer);assert.ok(heartbeats>20,'UI-thread timer remains responsive');
 await Promise.all([client.transact(s=>{s.nations.USA.gold+=123;}),client.transact(s=>{s.nations.USA.influence+=7;}),client.transact(s=>{s.paused=true;})]);
 const snapshot=await client.snapshot();assert.ok(campaignMinutes(snapshot)>start);assert.equal(snapshot.nations.USA.gold,idle.nations.USA.gold+123);assert.equal(snapshot.nations.USA.influence,idle.nations.USA.influence+7);assert.ok(metrics.target===100000);const minute=campaignMinutes(snapshot);await sleep(50);assert.equal(campaignMinutes(await client.snapshot()),minute);
 await assert.rejects(client.transact(s=>{s.nations.USA.gold=0;throw Error('Order rejected');}),/Order rejected/);assert.equal((await client.snapshot()).nations.USA.gold,snapshot.nations.USA.gold);validateSave(await client.snapshot(),b);await client.stop();
});
test('bundled soundtrack matches attributed files and new saves reject old versions',()=>{
 const manifest=JSON.parse(fs.readFileSync('game/assets/music/manifest.json'));assert.equal(manifest.length,TRACKS.length);
 for(const track of manifest){const bytes=fs.readFileSync('game/assets/music/'+track.file);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),track.sha256);assert.equal(track.license,'CC BY 4.0');assert.ok(bytes.length>100000);assert.ok(bytes.subarray(0,3).toString()==='ID3'||bytes[0]===255);}
 const old=newGame(b);old.version=1;assert.throws(()=>validateSave(old,b));
});
