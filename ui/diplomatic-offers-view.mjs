import { diplomaticOfferBlock, pendingDiplomaticOffers } from '../mechanics/diplomacy-rules.mjs';
import { capitalClock, campaignMinutes } from '../mechanics/campaign-clock.mjs';
import { PROFILES } from '../mechanics/catalog.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const name = id => PROFILES[id]?.name || id;
const amounts = values => Object.entries(values || {}).filter(([,amount]) => amount > 0)
  .map(([resource,amount]) => Number(amount).toLocaleString('en-US') + ' ' + resource).join(' · ') || 'Nothing';
const deadline = (s, offer) => {
  const clock = capitalClock(s, s.player, offer.expiresAt);
  return clock.date + ' ' + clock.time + ' ' + clock.zone;
};
export function diplomaticOfferAlert(s) {
  const pending = pendingDiplomaticOffers(s).slice().sort((a,b) => a.expiresAt-b.expiresAt);
  if (!pending.length) return '';
  const first = pending[0], minutes = Math.max(0, first.expiresAt-campaignMinutes(s));
  const remaining = minutes >= 1440 ? Math.ceil(minutes/1440) + 'd left' : Math.ceil(minutes/60) + 'h left';
  const hint = pending.length + ' diplomatic offer' + (pending.length === 1 ? '' : 's') + '. Earliest deadline: ' + deadline(s,first) + '. Open Diplomacy to accept or decline. Ignored offers are declined; no resources move.';
  return '<button class="pending-offers" data-action="open-offers" data-id="' + esc(first.id) + '" title="' + esc(hint) + '" aria-label="' + esc(hint) + '"><strong>Offers · ' + pending.length + '</strong><small>' + remaining + ' · default No</small></button>';
}
function party(label, price, gain) {
  return '<div class="offer-party"><strong>' + esc(label) + '</strong><span>Pay: ' + esc(amounts(price)) + '</span><span>Receive: ' + esc(amounts(gain)) + '</span></div>';
}
export function diplomaticOffersView(s,c) {
  const pending = pendingDiplomaticOffers(s).slice().sort((a,b) => a.expiresAt-b.expiresAt);
  const history = (s.diplomaticOffers || []).filter(o => o.to === s.player && o.status !== 'pending')
    .slice().sort((a,b) => (b.resolvedAt || b.expiresAt)-(a.resolvedAt || a.expiresAt)).slice(0,8);
  const cards = pending.map(offer => {
    const terms = offer.terms, block = diplomaticOfferBlock(s,c,offer);
    const hint = 'You pay ' + amounts(terms.partnerPrice) + ' and receive ' + amounts(terms.partnerGain) + '. ' + name(offer.from) + ' pays ' + amounts(terms.price) + ' and receives ' + amounts(terms.gain) + '. Settlement changes both ministries immediately.';
    return '<article class="diplomatic-offer" data-offer="' + esc(offer.id) + '" data-key="diplomatic-offer-' + esc(offer.id) + '"><h3>' + esc(name(offer.from)) + ' · ' + esc(terms.name) + '</h3><div class="offer-terms">' +
      party('You · ' + name(offer.to),terms.partnerPrice,terms.partnerGain) + party(name(offer.from),terms.price,terms.gain) +
      '</div><p class="offer-deadline">Expires ' + esc(deadline(s,offer)) + ' · No is the default</p>' +
      (terms.effects?.length ? '<small>Quoted treaty terms: ' + terms.effects.map(e => esc(e.label)).join(' · ') + '</small>' : '') +
      (block ? '<p class="offer-block" role="status">' + esc(block) + '</p>' : '') +
      '<div class="offer-actions"><button data-action="diplomatic-offer" data-id="' + esc(offer.id) + '" data-kind="accept" ' + (block ? 'disabled data-disabled-reason="' + esc(block) + '" ' : '') + 'title="' + esc(hint + (block ? ' ' + block : '')) + '">Yes · Accept</button><button class="subtle" data-action="diplomatic-offer" data-id="' + esc(offer.id) + '" data-kind="decline" title="Decline this offer. Neither country pays or receives resources.">No · Decline</button></div></article>';
  }).join('');
  const settled = history.length ? '<details class="offer-history"><summary>Recent offers · ' + history.length + '</summary>' + history.map(offer => {
    const settledAt = capitalClock(s,s.player,offer.resolvedAt || offer.expiresAt);
    const detail = offer.status === 'accepted' ? 'Paid ' + amounts(offer.terms.partnerPrice) + ' · received ' + amounts(offer.terms.partnerGain) : 'No exchange';
    return '<p><strong>' + esc(name(offer.from)) + ' · ' + esc(offer.status) + '</strong><small>' + esc(settledAt.date + ' ' + settledAt.time + ' · ' + detail + (offer.reason ? '. ' + offer.reason : '')) + '</small></p>';
  }).join('') + '</details>' : '';
  return '<section class="panel diplomatic-offers" aria-label="Diplomatic offers"><div class="panel-title"><h2>Offers to your ministry <span class="count">' + pending.length + '</span></h2></div><p class="panel-note">Offers stay open for 14 simulated days without pausing play. Choose Yes or No; unanswered offers expire as No. Nothing is reserved before acceptance. Both countries must still have the quoted resources and remain at peace.</p>' +
    (cards || '<p>No offers awaiting your decision.</p>') + settled + '</section>';
}
