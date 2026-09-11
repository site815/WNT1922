import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,advanceMinutes,shipOrderBlock} from '../src/engine.mjs';
import {contentFor} from '../src/campaign-content.mjs';
import {economyFor} from '../src/balance.mjs';
import {growthOutlook,closeEconomicMonth} from '../src/economic-growth.mjs';
import {merchantEconomy} from '../src/merchant-economy.mjs';
import {fleetPosition,sinkMerchants} from '../src/task-forces.mjs';
import {commandView} from '../src/command-view.mjs';
import {diplomacyView as governmentView} from '../src/diplomacy-view.mjs';
import {beginWarWarning} from '../src/war-politics.mjs';
import {distanceNm} from '../src/world.mjs';
import {resourceHover} from '../src/resource-breakdown.mjs';
import {validateSave} from '../src/state-io.mjs';
const bundle=JSON.parse(fs.readFileSync((process.env.WNT_TEST_PUBLIC||'game/staging')+'/content.json'));
const start=(id='JPN',campaign='in_good_faith_1936')=>{const s=newGame(bundle,id,713,campaign);return [s,contentFor(bundle,s),s.nations[id]];};

test('warning displays conceal outbreak date but preserve scheduled declaration',()=>{
 const [s,c]=start('USA'),w=beginWarWarning(s,c,'USA','JPN',{months:4});
 const date=new Date(w.endsAt*60000).toISOString().slice(0,10),ui=governmentView(s,c);
 assert.ok(s.alerts.find(a=>a.kind==='war-warning').body.includes('date is unknown'));
 assert.ok(!ui.includes('Hostilities ')&&!ui.includes(date));assert.ok(w.endsAt>w.startedAt);
 assert.ok(s.decisions.find(d=>d.kind==='war-warning').popup);validateSave(s,bundle);
});
test('every naval command appears in one scrolling list with stable marker offsets',()=>{
 const [s,c,n]=start();let html=commandView(s,c,{fleetPage:999});
 for(const f of n.fleets)assert.ok(html.includes('data-action="focus-fleet" data-id="'+f.id+'"'));
 assert.ok(!html.includes('data-action="list-page"'));
 const marker=(html,id)=>{const match=html.match(new RegExp('data-id="'+id+'" data-fleet-hover[^>]+data-motion-x="([^"]+)" data-motion-y="([^"]+)"[^>]*>[\\s\\S]*?<path transform="translate\\(([^,]+),([^\\)]+)'));return match&&[Number(match[3])-Number(match[1]),Number(match[4])-Number(match[2])];};
 const fleet=n.fleets.at(-1),before=marker(html,fleet.id);assert.ok(before);
 n.fleets.reverse();html=commandView(s,c);const after=marker(html,fleet.id);assert.ok(before.every((v,i)=>Math.abs(v-after[i])<1e-8),'draw order cannot relocate the marker');
});
test('peace fleet and convoy positions remain continuous across daily planning in both campaigns',()=>{
 for(const campaign of Object.keys(bundle.campaigns)){
  const [s,c]=start('JPN',campaign);let previous=new Map();
  for(let minute=0;minute<1440*3;minute++){
   for(const n of Object.values(s.nations))for(const f of [...n.fleets,...n.convoys]){
    const pos=fleetPosition(s,f),old=previous.get(f.id);
    if(old)assert.ok(distanceNm(old.pos,pos)<=Math.max(old.speed,f.speed)/60+.1,campaign+' '+f.id+' minute '+minute);
    previous.set(f.id,{pos,speed:f.speed});
   }advanceMinutes(s,c,1);
  }validateSave(s,bundle);
 }
});
test('monthly growth scales output, records actual balance and degrades with trade disruption',()=>{
 const [s,c,n]=start('USA'),good=growthOutlook(s,c),base=economyFor(s,'USA');n.gold-=500;n.industry-=200;
 closeEconomicMonth(s,c,'USA');assert.equal(n.monthAccount.last.gold,-500);assert.equal(n.monthAccount.last.industry,-200);
 assert.ok(economyFor(s,'USA').goldYear>base.goldYear);assert.equal(economyFor(s,'USA').yardYear,base.yardYear);
 sinkMerchants(s,'USA',1e6);n.commerce=15;assert.ok(growthOutlook(s,c).monthly<good.monthly);
 assert.match(resourceHover(s,c,'GOLD'),/Actual change this month/);assert.match(resourceHover(s,c,'SHIPPING'),/Civilian deliveries/);validateSave(s,bundle);
});
test('civilian hull growth conserves integer hulls and can recover a destroyed merchant register',()=>{
 for(const campaign of Object.keys(bundle.campaigns))for(const id of Object.keys(bundle.nations)){
  const [s,c,n]=start(id,campaign);const before=merchantEconomy(s,c,id).current;closeEconomicMonth(s,c,id);
  assert.ok(Number.isInteger(n.merchant.otherHulls));assert.ok(merchantEconomy(s,c,id).current>=before);
  sinkMerchants(s,id,1e6);for(let month=0;month<60;month++)closeEconomicMonth(s,c,id);
  assert.ok(n.merchant.otherHulls>0,id+' can recover using civilian yards');validateSave(s,bundle);
 }
});
test('all fourteen catalogs use naval support generations and exclude civilian construction',()=>{
 for(const campaign of Object.keys(bundle.campaigns))for(const id of Object.keys(bundle.nations)){
  const [s,c,n]=start(id,campaign),designs=c.nations[id].designs.map(cid=>c.classes[cid]);
  assert.ok(!designs.some(cl=>cl.service==='merchant'||cl.type==='AK'));
  if(id==='JPN'&&campaign==='in_good_faith_1936'){
   const hybrid=designs.find(cl=>cl.supportHybrid);assert.ok(hybrid);assert.equal(shipOrderBlock(s,c,hybrid.id),'');
   assert.ok(n.fleets.some(f=>f.role==='support'&&f.supportKind==='oiler'));
  }else for(const type of ['AD','AO'])assert.deepEqual(designs.filter(cl=>cl.type===type&&/Fleet (depot|oiler) ·/.test(cl.name)).map(cl=>cl.year),[1922,1932,1942]);
 }
});
