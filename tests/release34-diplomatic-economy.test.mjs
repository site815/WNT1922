import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame, advanceMinutes, aiTurn } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { applyCommand } from '../mechanics/game-actions.mjs';
import { campaignMinutes, setCampaignMinutes } from '../mechanics/campaign-clock.mjs';
import { DIPLOMATIC_OFFER_DAYS, diplomaticTerms, diplomaticBlock, diplomaticOfferBlock, pendingDiplomaticOffers } from '../mechanics/diplomacy-rules.mjs';
import { expireDiplomaticOffers } from '../mechanics/diplomatic-exchange.mjs';
import { validateSave } from '../mechanics/state-io.mjs';
import { diplomacyAccount, goldAccount } from '../mechanics/gold-accounting.mjs';
import { closeEconomicMonth } from '../mechanics/economic-growth.mjs';
import { economyFor } from '../mechanics/balance.mjs';
import { commenceWar } from '../mechanics/war-politics.mjs';
const fields=['gold','industry','strategic','influence'];
const balances=n=>Object.fromEntries(fields.map(k=>[k,n[k]]));
const totals=s=>Object.fromEntries(fields.map(k=>[k,Object.values(s.nations).reduce((sum,n)=>sum+n[k],0)]));
const start=()=>{
  const s=newGame(CATALOG,'JPN',340034,'campaign_1922');
  s.decisions=[];s.pacts=[];s.treatyUntil=s.day-1;s.paused=false;s.autoPause=true;
  delete s.pauseReason;delete s.resumeAfterDecision;
  for(const n of Object.values(s.nations))Object.assign(n,{gold:100000,industry:15000,strategic:3000,influence:100});
  return [s,contentFor(CATALOG,s)];
};
const command=(s,kind,from='JPN',to='GBR')=>applyCommand(s,CATALOG,{type:'diplomatic',args:{id:to,kind}},from);
const reply=(s,id,accept,actor=s.player)=>applyCommand(s,CATALOG,{type:'diplomatic-offer',args:{id,accept}},actor);
const offer=(s,kind='sellStrategic',from='GBR')=>{
  const result=command(s,kind,from,'JPN');return s.diplomaticOffers.find(o=>o.id===result.offerId);
};

test('every commercial action conserves both economies and reports each monthly transfer',()=>{
  for(const kind of ['sell','cooperate','strategic','sellStrategic']) {
    const [s,c]=start(),before=totals(s),actor=balances(s.nations.JPN),partner=balances(s.nations.GBR);
    const terms=diplomaticTerms(s,c,'GBR',kind),spent=s.nations.JPN.strategicSpent.production;
    const result=command(s,kind);
    for(const k of ['gold','industry','strategic']) {
      assert.equal(totals(s)[k],before[k],kind+' '+k+' conserved');
      assert.equal(s.nations.JPN[k],actor[k]-(terms.price[k]||0)+(terms.gain[k]||0));
      assert.equal(s.nations.GBR[k],partner[k]-(terms.partnerPrice[k]||0)+(terms.partnerGain[k]||0));
      assert.equal(diplomacyAccount(s.nations.JPN).current[k],-diplomacyAccount(s.nations.GBR).current[k] || 0);
    }
    assert.equal(totals(s).influence,before.influence-(terms.price.influence||0));
    assert.equal(s.nations.JPN.strategicSpent.production,spent);
    assert.deepEqual(result.partnerPrice,terms.partnerPrice);
    assert.equal(goldAccount(s.nations.JPN).rows.find(r=>r.key==='diplomaticTrade').amount,(terms.gain.gold||0)-(terms.price.gold||0));
    validateSave(s,CATALOG);
  }
});

test('foreign affordability, reserve policies and lack of demand reject atomically',()=>{
  for(const [kind,edit,pattern] of [
    ['sell',n=>n.gold=0,/gold/],['strategic',n=>n.strategic=1999,/strategic/],
    ['cooperate',n=>n.industry=1200,/reserve/],['sell',n=>n.industry=1e6,/sufficient industrial/],
    ['sellStrategic',n=>n.strategic=1e6,/sufficient strategic/],
  ]) {
    const [s,c]=start();edit(s.nations.GBR);const before=JSON.stringify(s);
    assert.match(diplomaticBlock(s,c,'GBR',kind),pattern);
    assert.throws(()=>command(s,kind),pattern);assert.equal(JSON.stringify(s),before);
  }
  const [s]=start();s.nations.JPN.gold=1e15;
  const before=JSON.stringify(s);assert.throws(()=>command(s,'sell'),/reserve limit/);assert.equal(JSON.stringify(s),before);
});

test('AI exchanges need player consent, create an alert only and default to no transaction',()=>{
  for(const kind of ['sell','sellStrategic','strategic','cooperate']) {
    const [s]=start(),before=totals(s),decisions=structuredClone(s.decisions),o=offer(s,kind);
    assert.ok(o);assert.equal(o.status,'pending');assert.equal(o.expiresAt-o.createdAt,DIPLOMATIC_OFFER_DAYS*1440);
    assert.deepEqual(totals(s),before);assert.deepEqual(s.decisions,decisions);assert.equal(s.paused,false);
    assert.equal(s.pauseReason,undefined);assert.ok(s.alerts.some(a=>a.offerId===o.id&&a.newsView==='diplomacy'));
    assert.equal(pendingDiplomaticOffers(s).length,1);
    reply(s,o.id,false);assert.equal(o.status,'declined');assert.deepEqual(totals(s),before);
    assert.equal(pendingDiplomaticOffers(s).length,0);assert.ok(s.alerts.find(a=>a.offerId===o.id).dismissed);
    validateSave(s,CATALOG);
  }
});

test('acceptance uses the fixed quoted treaty terms exactly once and is recipient-owned',()=>{
  const [s,c]=start();s.pacts.push({id:'test-pact',name:'Test pact',kind:'defensive',members:['JPN','GBR'],since:s.day,active:true});
  const beforeJ=balances(s.nations.JPN),beforeG=balances(s.nations.GBR),o=offer(s),terms=structuredClone(o.terms);
  s.pacts[0].active=false;
  assert.notEqual(diplomaticTerms(s,c,'JPN','sellStrategic','GBR').gain.gold,terms.gain.gold);
  let snapshot=JSON.stringify(s);
  assert.throws(()=>reply(s,o.id,true,'GBR'),/receiving government/);assert.equal(JSON.stringify(s),snapshot);
  assert.throws(()=>reply(s,o.id,'yes'),/Yes or No/);assert.equal(JSON.stringify(s),snapshot);
  reply(s,o.id,true);assert.equal(o.status,'accepted');
  assert.equal(s.nations.JPN.gold,beforeJ.gold-terms.gain.gold);assert.equal(s.nations.JPN.strategic,beforeJ.strategic+terms.price.strategic);
  assert.equal(s.nations.GBR.gold,beforeG.gold+terms.gain.gold);assert.equal(s.nations.GBR.strategic,beforeG.strategic-terms.price.strategic);
  assert.equal(s.nations.GBR.cooldowns['sellStrategic-JPN'],s.day+90);
  snapshot=JSON.stringify(s);assert.throws(()=>reply(s,o.id,true),/already been resolved/);assert.equal(JSON.stringify(s),snapshot);
  validateSave(s,CATALOG);
});

test('pending offers reserve nothing and recheck both current balances before acceptance',()=>{
  for(const [who,resource] of [['JPN','gold'],['GBR','strategic']]) {
    const [s,c]=start(),o=offer(s);s.nations[who][resource]=0;
    const before=JSON.stringify(s);assert.match(diplomaticOfferBlock(s,c,o),new RegExp(resource));
    assert.throws(()=>reply(s,o.id,true),new RegExp(resource));assert.equal(JSON.stringify(s),before);
    assert.equal(o.status,'pending');reply(s,o.id,false);assert.equal(o.status,'declined');
  }
});

test('expiry at exactly 14 days defaults to No without interrupting campaign time',()=>{
  const [s,c]=start();setCampaignMinutes(s,campaignMinutes(s)+30);
  const o=offer(s),before=totals(s);
  setCampaignMinutes(s,o.expiresAt-15);
  assert.equal(pendingDiplomaticOffers(s).length,1);
  // Make the boundary a normal tick, with no historical or cabinet dispatch due.
  s.timeline.polandAt=o.expiresAt+1e6;s.timeline.britainAt=o.expiresAt+2e6;
  s.nextDiplomaticAt=o.expiresAt+1e6;
  advanceMinutes(s,c,15,{respectPause:true});
  assert.equal(o.status,'expired');assert.equal(o.resolvedAt,o.expiresAt);
  assert.match(o.reason,/no exchange/);assert.equal(s.paused,false);assert.equal(s.decisions.length,0);
  // The normal tick can move fleets, but an ignored quote never moves reserves.
  assert.deepEqual(totals(s),before);assert.equal(pendingDiplomaticOffers(s).length,0);
  assert.throws(()=>reply(s,o.id,true),/resolved/);
});

test('war cancels outstanding exchanges immediately, with no funds transferred',()=>{
  const [s,c]=start(),o=offer(s),before=totals(s);
  commenceWar(s,c,'GBR','JPN');
  assert.equal(o.status,'cancelled');assert.match(o.reason,/war/);assert.deepEqual(totals(s),before);
  assert.equal(pendingDiplomaticOffers(s).length,0);assert.throws(()=>reply(s,o.id,true),/resolved/);
});

test('offers and ledgers round-trip, old saves initialize, malformed quotes are refused',()=>{
  const [s]=start(),o=offer(s);const saved=validateSave(JSON.parse(JSON.stringify(s)),CATALOG);
  assert.deepEqual(saved.diplomaticOffers,s.diplomaticOffers);reply(saved,o.id,true);validateSave(saved,CATALOG);
  const old=structuredClone(s);delete old.diplomaticOffers;assert.deepEqual(validateSave(old,CATALOG).diplomaticOffers,[]);
  for(const change of [
    v=>v.diplomaticOffers[0].terms.partnerPrice.gold++,
    v=>v.diplomaticOffers[0].terms.price.strategic=-1,
    v=>v.diplomaticOffers[0].expiresAt++,
    v=>v.diplomaticOffers[0].terms.gain.badResource=1,
    v=>v.diplomaticOffers.push(structuredClone(v.diplomaticOffers[0])),
    v=>v.nations.JPN.monthAccount.diplomaticFlows={gold:Infinity},
  ]) {const bad=structuredClone(s);change(bad);assert.throws(()=>validateSave(bad,CATALOG),/compatible/);}
  const expired=structuredClone(s);setCampaignMinutes(expired,o.expiresAt);assert.equal(validateSave(expired,CATALOG).diplomaticOffers[0].status,'expired');
});

test('offer limits bound interruptions and refusal does not allow immediate reoffers',()=>{
  const [s]=start(),first=offer(s);
  assert.throws(()=>offer(s,'sell'),/already awaiting/);
  reply(s,first.id,false);assert.throws(()=>offer(s),/90 days/);
  for(const id of ['FRA','ITA','SOV'])offer(s,'sell',id);
  assert.equal(pendingDiplomaticOffers(s).length,3);
  assert.throws(()=>offer(s,'sell','USA'),/three offers/);
  setCampaignMinutes(s,campaignMinutes(s)+90*1440);expireDiplomaticOffers(s);
  assert.equal(pendingDiplomaticOffers(s).length,0);assert.ok(offer(s));validateSave(s,CATALOG);
});

test('AI monthly planning can offer sales even while its treasury needs cash',()=>{
  const [s,c]=start(),n=s.nations.GBR;
  n.gold=economyFor(s,'GBR').goldYear/20;n.strategic=6000;
  for(const id of Object.keys(s.nations).filter(id=>!['JPN','GBR'].includes(id))) {
    s.nations[id].strategic=1e6;s.nations[id].industry=1e6;
  }
  const before=balances(s.nations.JPN);aiTurn(s,c,'GBR');
  assert.ok(s.diplomaticOffers.some(o=>o.from==='GBR'&&o.to==='JPN'&&o.action==='sellStrategic'&&o.status==='pending'));
  assert.deepEqual(balances(s.nations.JPN),before);assert.equal(s.paused,false);
});

test('AI-to-AI exchanges use the same quote, conserve stocks and retain counterpart reserves',()=>{
  const [s,c]=start(),before=totals(s),terms=diplomaticTerms(s,c,'FRA','sellStrategic','GBR');
  const result=command(s,'sellStrategic','GBR','FRA');
  assert.deepEqual(totals(s),before);assert.deepEqual(result.price,terms.price);assert.equal(s.diplomaticOffers.length,0);
  assert.equal(s.nations.FRA.strategic,4000);
  assert.match(diplomaticBlock(s,c,'FRA','sellStrategic','ITA'),/sufficient strategic/);
});

test('monthly transfer accounting closes cleanly and domestic visits do not credit another treasury',()=>{
  const [s,c]=start(),foreign=balances(s.nations.GBR);command(s,'visit');
  assert.deepEqual(balances(s.nations.GBR),foreign);
  assert.ok(goldAccount(s.nations.JPN).rows.some(r=>r.key==='diplomaticAdministration'&&r.amount===-2000));
  command(s,'sellStrategic');const flows=diplomacyAccount(s.nations.JPN).current;
  setCampaignMinutes(s,Date.UTC(1922,2,1)/60000);closeEconomicMonth(s,c,'JPN');
  assert.deepEqual(diplomacyAccount(s.nations.JPN).last,flows);assert.deepEqual(diplomacyAccount(s.nations.JPN).current,{gold:0,industry:0,strategic:0});
  validateSave(s,CATALOG);
});
