import { campaignMinutes } from './campaign-clock.mjs';
import { DIPLOMACY, DIPLOMATIC_OFFER_DAYS, diplomaticOfferBlock, TRADED_RESOURCES } from './diplomacy-rules.mjs';
import { recordGold } from './gold-accounting.mjs';

export function initializeDiplomaticOffers(s) {
  s.diplomaticOffers ??= [];
  expireDiplomaticOffers(s);
}

export function expireDiplomaticOffers(s) {
  const now=campaignMinutes(s);
  for(const offer of s.diplomaticOffers || []) {
    if(offer.status!=='pending')continue;
    const war=s.relations[[offer.from,offer.to].sort().join('-')]?.war;
    if(war || now>=offer.expiresAt)Object.assign(offer,{
      status:war?'cancelled':'expired',resolvedAt:now,
      reason:war?'Cancelled when war began; no exchange took place.':'Expired without acceptance; no exchange took place.',
    });
  }
  // Retain recent results for the diplomacy panel without growing campaign saves.
  if(s.diplomaticOffers?.length>100) {
    const pending=s.diplomaticOffers.filter(o=>o.status==='pending');
    s.diplomaticOffers=[...pending,...s.diplomaticOffers.filter(o=>o.status!=='pending').slice(0,100-pending.length)]
      .sort((a,b)=>b.createdAt-a.createdAt || b.id.localeCompare(a.id));
  }
}

export function createDiplomaticOffer(s,from,to,action,terms) {
  initializeDiplomaticOffers(s);
  const now=campaignMinutes(s),offer={id:'trade-'+s.nextId++,from,to,action,
    createdAt:now,expiresAt:now+DIPLOMATIC_OFFER_DAYS*1440,status:'pending',terms:structuredClone(terms)};
  s.diplomaticOffers.unshift(offer);
  s.nations[from].cooldowns['diplomatic-offer-'+to]=now/1440+90;
  expireDiplomaticOffers(s);
  return offer;
}

export function applyDiplomaticExchange(s,from,to,action,terms) {
  for(const [id,price,gain] of [[from,terms.price,terms.gain],[to,terms.partnerPrice,terms.partnerGain]]) {
    const n=s.nations[id];
    for(const resource of ['gold','industry','strategic','influence']) {
      const change=(gain[resource]||0)-(price[resource]||0);
      if(change===0)continue;
      n[resource]+=change;
      if(TRADED_RESOURCES.includes(resource) && n.monthAccount) {
        const flows=n.monthAccount.diplomaticFlows??={};
        flows[resource]=(flows[resource]||0)+change;
      }
      if(resource==='gold')recordGold(n,'diplomaticTrade',change);
    }
  }
  s.nations[from].cooldowns[action+'-'+to]=campaignMinutes(s)/1440+terms.days;
}

export function answerDiplomaticOffer(s,c,id,accept,actor=s.player) {
  if(typeof accept!=='boolean')throw Error('Choose Yes or No for this offer.');
  const offer=(s.diplomaticOffers||[]).find(o=>o.id===id);
  if(!offer || offer.to!==actor)throw Error('Only the receiving government may answer this offer.');
  if(offer.status!=='pending')throw Error('This diplomatic offer has already been resolved.');
  if(campaignMinutes(s)>=offer.expiresAt)throw Error('This offer expired; no exchange took place.');
  if(accept) {
    const block=diplomaticOfferBlock(s,c,offer,actor);
    if(block)throw Error(block);
    applyDiplomaticExchange(s,offer.from,offer.to,offer.action,offer.terms);
  }
  Object.assign(offer,{status:accept?'accepted':'declined',resolvedAt:campaignMinutes(s),
    reason:accept?'Accepted; both governments exchanged the quoted resources.':'Declined; no exchange took place.'});
  return offer;
}

// Quoted terms survive changes in treaties. Saves may contain an older quote,
// but never arbitrary resource keys, non-finite values or a non-conserving trade.
export function validateDiplomaticOffers(s) {
  if(s.diplomaticOffers===undefined)return;
  const fail=()=>{throw Error('Invalid diplomatic offer.');};
  if(!Array.isArray(s.diplomaticOffers)||s.diplomaticOffers.length>100)fail();
  const now=campaignMinutes(s),ids=new Set(),pending=new Map();
  const plain=x=>x && typeof x==='object' && !Array.isArray(x);
  const amounts=(map,base)=>plain(map) && Object.keys(map).sort().join()===Object.keys(base).sort().join()
    && Object.entries(map).every(([k,v])=>Number.isInteger(v)&&v>=Math.floor(base[k]*.25)&&v<=Math.ceil(base[k]*3));
  const mirror=(actual,source)=>plain(actual) && Object.keys(actual).sort().join()===TRADED_RESOURCES.filter(k=>source[k]>0).sort().join()
    && Object.entries(actual).every(([k,v])=>source[k]===v);
  for(const o of s.diplomaticOffers) {
    if(!plain(o)||typeof o.id!=='string'||!/^trade-\d+$/.test(o.id)||ids.has(o.id))fail();
    ids.add(o.id);
    const base=Object.hasOwn(DIPLOMACY,o.action)?DIPLOMACY[o.action]:null,t=o.terms;
    if(!['sell','cooperate','strategic','sellStrategic'].includes(o.action)||!base||!s.nations[o.from]||!s.nations[o.to]
      ||o.from===o.to||!Number.isFinite(o.createdAt)||o.createdAt>now||!Number.isFinite(o.expiresAt)
      ||o.expiresAt!==o.createdAt+DIPLOMATIC_OFFER_DAYS*1440||!plain(t)||t.name!==base.name||t.days!==base.days
      ||!amounts(t.price,base.price)||!amounts(t.gain,base.gain)||!mirror(t.partnerPrice,t.gain)||!mirror(t.partnerGain,t.price)
      ||!Array.isArray(t.effects)||t.effects.length>2)fail();
    for(const effect of t.effects) {
      if(!plain(effect)||typeof effect.id!=='string'||effect.id.length>200||typeof effect.label!=='string'||effect.label.length>300)fail();
      for(const field of ['price','gain'])if(effect[field]!==undefined && (!plain(effect[field])
        ||Object.entries(effect[field]).some(([k,v])=>!['gold','industry','influence','strategic'].includes(k)||!Number.isFinite(v)||Math.abs(v)>3)))fail();
    }
    if(!['pending','accepted','declined','expired','cancelled'].includes(o.status))fail();
    if(o.status==='pending') {
      if(o.resolvedAt!==undefined||o.reason!==undefined)fail();
      if(o.expiresAt>now) {
        const pair=o.from+'-'+o.to;
        if(pending.has(pair))fail();
        pending.set(pair,o.to);
      }
    } else if(!Number.isFinite(o.resolvedAt)||o.resolvedAt<o.createdAt||o.resolvedAt>now
      ||typeof o.reason!=='string'||o.reason.length>500)fail();
  }
  for(const id of Object.keys(s.nations))if([...pending.values()].filter(to=>to===id).length>3)fail();
}
