import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { campaignMinutes } from '../mechanics/campaign-clock.mjs';
import { diplomaticTerms } from '../mechanics/diplomacy-rules.mjs';
import { diplomaticOfferAlert, diplomaticOffersView } from '../ui/diplomatic-offers-view.mjs';
import { diplomaticHint } from '../ui/diplomacy-view.mjs';
import { alertsView } from '../ui/ministry-view.mjs';
import { newsDestination } from '../ui/news-navigation.mjs';

function fixture() {
  const s = newGame(CATALOG,'USA',340034,'in_good_faith_1936'), c = contentFor(CATALOG,s);
  s.decisions=[];s.alerts=[];s.log=[];s.pacts=[];s.treatyUntil=s.day-1;
  s.nations.GBR.strategic=10000;s.nations.USA.gold=10000;
  const offer = {id:123456,from:'GBR',to:'USA',action:'sellStrategic',createdAt:campaignMinutes(s),
    expiresAt:campaignMinutes(s)+14*1440,status:'pending',terms:diplomaticTerms(s,c,'USA','sellStrategic','GBR')};
  s.diplomaticOffers=[offer];
  return {s,c,offer};
}
test('offers stay discoverable after news dismissal without becoming a pausing decision',()=>{
  const {s,c,offer}=fixture(),before=JSON.stringify(s);
  const rail=alertsView(s,c);
  assert.match(rail,/data-action="open-offers"/);
  assert.match(rail,/14d left · default No/);
  assert.match(rail,/Ignored offers are declined/);
  assert.equal(s.decisions.length,0);
  assert.equal(JSON.stringify(s),before,'rendering cannot mutate offers or pause state');
  assert.deepEqual(newsDestination(s,{offerId:offer.id,kind:'diplomacy'}),{view:'diplomacy',offerId:offer.id});
});
test('offer cards show both sides of the fixed quote and an explicit default refusal',()=>{
  const {s,c,offer}=fixture();
  const html=diplomaticOffersView(s,c);
  assert.match(html,/You · United States/);
  assert.match(html,/Pay: 1,400 gold/);
  assert.match(html,/Receive: 1,000 strategic/);
  assert.match(html,/Pay: 1,000 strategic/);
  assert.match(html,/Receive: 1,400 gold/);
  assert.match(html,/Yes · Accept/);assert.match(html,/No · Decline/);
  assert.match(html,/No is the default/);assert.match(html,/Nothing is reserved/);
  s.nations.USA.gold=0;
  const blocked=diplomaticOffersView(s,c);
  assert.match(blocked,/data-kind="accept" disabled data-disabled-reason=/);
  assert.doesNotMatch(blocked,/data-kind="decline" disabled/);
  assert.equal(offer.terms.partnerPrice.gold,1400,'affordability changes must not reprice the displayed quote');
});
test('settled offers retain outcomes while disappearing from the pending alert',()=>{
  const {s,c,offer}=fixture();
  offer.status='expired';offer.resolvedAt=offer.expiresAt;offer.reason='Deadline reached; default No.';
  assert.equal(diplomaticOfferAlert(s),'');
  let html=diplomaticOffersView(s,c);
  assert.match(html,/expired/);assert.match(html,/No exchange/);
  assert.doesNotMatch(html,/data-kind="accept"/);
  offer.status='accepted';offer.reason='';
  html=diplomaticOffersView(s,c);
  assert.match(html,/Paid 1,400 gold · received 1,000 strategic/);
});
test('bilateral action hovers describe the real counterparty cost and economic scope',()=>{
  const {s,c}=fixture();
  const hint=diplomaticHint(s,c,'GBR','sellStrategic');
  assert.match(hint,/pays 1,400 gold and receives 1,000 strategic/);
  assert.match(hint,/partner can refuse/);
  assert.match(hint,/does not count as merchant delivery or GDP\/GTP income/);
});
