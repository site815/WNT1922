import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { applyCommand } from '../mechanics/game-actions.mjs';
import { validateSave } from '../mechanics/state-io.mjs';
import { DIPLOMACY, diplomaticTerms, diplomaticBlock } from '../mechanics/diplomacy-rules.mjs';
import { diplomacyView, diplomaticHint } from '../ui/diplomacy-view.mjs';
const start=()=>{const s=newGame(CATALOG,'JPN',330033,'campaign_1922');s.decisions=[];s.pacts=[];s.treatyUntil=s.day-1;for(const n of Object.values(s.nations))Object.assign(n,{gold:1e6,industry:20000,strategic:2500,influence:100});Object.assign(s.nations.JPN,{industry:1e6,strategic:1e6});return [s,contentFor(CATALOG,s)];};
const pact=(s,kind,id=kind)=>s.pacts.push({id,name:'Test '+kind,members:['JPN','GBR'],kind,since:s.day,active:true});
const issue=(s,kind,actor='JPN',target='GBR')=>applyCommand(s,CATALOG,{type:'diplomatic',args:{id:target,kind}},actor);
const funds=n=>Object.fromEntries(['gold','industry','strategic','influence'].map(k=>[k,n[k]]));

test('shared active pacts change real exchanges and penalize threatening partners without stacking',()=>{
  const [s,c]=start();pact(s,'consultation');pact(s,'political');pact(s,'defensive');pact(s,'defensive','duplicate');
  const terms=diplomaticTerms(s,c,'GBR','cooperate');
  assert.equal(terms.effects.length,1);assert.equal(terms.price.gold,3400);assert.equal(terms.price.influence,9);assert.equal(terms.gain.industry,1320);
  const before=funds(s.nations.JPN), result=issue(s,'cooperate');
  assert.deepEqual(result.price,terms.price);assert.equal(s.nations.JPN.gold,before.gold-3400);assert.equal(s.nations.JPN.industry,before.industry+1320);
  assert.equal(diplomaticTerms(s,c,'GBR','provoke').price.influence,32);
  assert.equal(diplomaticTerms(s,c,'GBR','provoke').price.gold,7500);
  assert.equal(diplomaticTerms(s,c,'USA','visit').gain.influence,8);
  for(const p of s.pacts)p.active=false;
  assert.equal(diplomaticTerms(s,c,'GBR','visit').gain.influence,8);
  s.pacts[0].active=true;s.pacts[0].since=s.day+1;
  assert.equal(diplomaticTerms(s,c,'GBR','visit').gain.influence,8);
  s.pacts[0].since=s.day;s.relations['GBR-JPN'].war=true;
  assert.equal(diplomaticTerms(s,c,'GBR','visit').effects.length,0);
  const snapshot=JSON.stringify(s);assert.throws(()=>issue(s,'visit'),/peace/);assert.equal(JSON.stringify(s),snapshot);
});

test('naval treaty compliance, public sanctions, concealment and expiry produce distinct quoted terms',()=>{
  const [s,c]=start();s.treatyUntil=s.day+100;
  const hull=s.nations.JPN.groups.find(g=>c.classes[g.classId]?.type==='BB');
  for(const id of ['JPN','GBR']){s.nations[id].groups=[];s.nations[id].treatyPolicy='disclose';}
  assert.equal(diplomaticTerms(s,c,'GBR','visit').gain.influence,10);
  assert.equal(diplomaticTerms(s,c,'GBR','strategic').price.gold,3800);
  const fake={...c.classes[hull.classId],id:'diplomacy-test-bb',tons:35000};
  const expanded={...c,classes:{...c.classes,[fake.id]:fake}};
  s.nations.JPN.groups=[{...hull,classId:fake.id,count:20,legacy:false,treatyFate:undefined,status:'active'}];
  const sanctioned=diplomaticTerms(s,expanded,'GBR','sellStrategic');
  assert.equal(sanctioned.gain.gold,1190);assert.equal(sanctioned.effects[0].id,'naval-sanctions');
  assert.equal(diplomaticTerms(s,expanded,'GBR','strategic').price.gold,4600);
  s.nations.JPN.treatyPolicy='false_numbers';
  assert.equal(diplomaticTerms(s,expanded,'GBR','visit').effects.length,0);
  s.nations.JPN.treatyPolicy='disclose';s.treatyUntil=s.day-1;
  assert.equal(diplomaticTerms(s,expanded,'GBR','sellStrategic').gain.gold,1400);
  s.treatyUntil=s.day+100;
  assert.equal(diplomaticTerms(s,expanded,'SOV','visit').effects.length,0);
});

test('strategic sales debit exact stocks, keep production accounting intact and reject failed commands atomically',()=>{
  const [s,c]=start(),n=s.nations.JPN,foreign=funds(s.nations.GBR),before=funds(n),spent=n.strategicSpent.production;
  const result=issue(s,'sellStrategic');assert.equal(n.strategic,before.strategic-1000);assert.equal(n.gold,before.gold+1400);
  assert.equal(n.strategicSpent.production,spent);assert.deepEqual(funds(s.nations.GBR),{...foreign,gold:foreign.gold-1400,strategic:foreign.strategic+1000});assert.equal(result.gains.gold,1400);
  assert.equal(n.cooldowns['sellStrategic-GBR'],s.day+90);
  let snapshot=JSON.stringify(s);assert.throws(()=>issue(s,'sellStrategic'),/cooldown/);assert.equal(JSON.stringify(s),snapshot);
  assert.equal(diplomaticBlock(s,c,'USA','sellStrategic'),'');
  n.strategic=999;snapshot=JSON.stringify(s);assert.throws(()=>issue(s,'sellStrategic','JPN','USA'),/strategic/);assert.equal(JSON.stringify(s),snapshot);
  assert.throws(()=>issue(s,'constructor'),/valid diplomatic/);assert.equal(JSON.stringify(s),snapshot);
  validateSave(s,CATALOG);
});

test('the same ministry pays identical quoted treaty economics under AI and player commands',()=>{
  const [player,c]=start();pact(player,'political');const ai=structuredClone(player);ai.player='USA';ai.controllers.JPN='ai';
  for(const action of ['visit','sell','cooperate','strategic','sellStrategic']){
    const expected=diplomaticTerms(player,c,'GBR',action,'JPN');
    const a=issue(player,action),b=issue(ai,action);
    assert.deepEqual(a.price,expected.price);assert.deepEqual(a.price,b.price);assert.deepEqual(a.gains,b.gains);
    assert.deepEqual(funds(player.nations.JPN),funds(ai.nations.JPN));
    assert.deepEqual(player.nations.JPN.cooldowns,ai.nations.JPN.cooldowns);
  }
  validateSave(player,CATALOG);validateSave(ai,CATALOG);
});

test('even the strongest treaty terms retain a buy/sell spread and the influence cap',()=>{
  const [s,c]=start();pact(s,'defensive');s.treatyUntil=s.day+100;
  for(const id of ['JPN','GBR']){s.nations[id].groups=[];s.nations[id].treatyPolicy='disclose';}
  const buy=diplomaticTerms(s,c,'GBR','strategic'),sell=diplomaticTerms(s,c,'GBR','sellStrategic');
  assert.ok(sell.gain.gold/sell.price.strategic < buy.price.gold/buy.gain.strategic);
  s.nations.JPN.influence=499;assert.equal(issue(s,'visit').gains.influence,1);assert.equal(s.nations.JPN.influence,500);
});

test('diplomacy exposes live adjusted terms and preserves all country state rows in peace and war',()=>{
  const [s,c]=start();pact(s,'defensive');
  const keys=Object.keys(DIPLOMACY);assert.equal(keys.at(-2),'sellStrategic');assert.equal(keys.at(-1),'provoke');
  const peace=diplomacyView(s,c);assert.match(peace,/Sell strategic materials/);assert.match(peace,/3,400 gold/);
  assert.match(diplomaticHint(s,c,'GBR','provoke'),/\+100% influence cost/);
  assert.match(peace,/Test defensive/);assert.match(peace,/diplomatic-action-terms/);
  s.relations['GBR-JPN'].war=true;s.relations['GBR-JPN'].allied=false;s.relations['GBR-JPN'].warSince=s.day;
  const war=diplomacyView(s,c);
  for(const cls of ['government-war-balance','government-treaty-effects','government-actions','deployment-state']){
    const re=new RegExp('class="'+cls+'"','g');assert.equal([...peace.matchAll(re)].length,6);assert.equal([...war.matchAll(re)].length,6);
  }
  assert.match(war,/Bilateral exchanges suspended during war/);
});
