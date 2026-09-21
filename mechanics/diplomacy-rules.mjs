import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/diplomacy-rules.md");
import { provocationFleetBlock } from "./provocation.mjs";
import { fleetStats } from "./task-forces.mjs";
import { supplyDetails } from "./logistics.mjs";
import { treatyAssessment } from "./treaty-policy.mjs";
import { economyFor } from './balance.mjs';
import { campaignMinutes } from './campaign-clock.mjs';
import { PROFILES } from './catalog.mjs';
export const DIPLOMACY = data.DIPLOMACY;
export const PACT_MODIFIERS = data.PACT_MODIFIERS;
export const DIPLOMATIC_OFFER_DAYS = 14;
export const DIPLOMATIC_OFFER_LIMIT = 3;
export const TRADED_RESOURCES = Object.freeze(['gold','industry','strategic']);
export const bilateralAction = action => ['sell','cooperate','strategic','sellStrategic'].includes(action);
const rank = { defensive: 3, political: 2, consultation: 1 };
const relation = (s, a, b) => s.relations[[a,b].sort().join("-")];
export function diplomaticTerms(s, c, target, action, id = s.player) {
  const base = Object.hasOwn(DIPLOMACY, action) ? DIPLOMACY[action] : null;
  if (!base || !s.nations[id] || !s.nations[target] || id === target || !relation(s,id,target)) return null;
  const effects = [], now = s.day + (s.fraction || 0);
  if (!relation(s,id,target).war) {
    const pact = (s.pacts || []).filter(p => p.active && p.since <= now && p.members.includes(id) && p.members.includes(target))
      .sort((a,b) => (rank[b.kind] || 0) - (rank[a.kind] || 0) || a.id.localeCompare(b.id))[0];
    const pactEffect = pact && PACT_MODIFIERS[pact.kind]?.[action];
    if (pactEffect) effects.push({id:pact.id, label:pact.name, ...pactEffect});
    if (id !== 'SOV' && target !== 'SOV' && s.day <= s.treatyUntil) {
      const assessments = [id,target].map(who => treatyAssessment(s,c,who));
      const open = assessments.filter(a => a.policy === 'disclose');
      const sanctions = open.some(a => a.disclosureBillableTons > 0);
      const compliant = open.length === 2 && !sanctions;
      const kind = sanctions ? 'sanctions' : compliant ? 'compliance' : null;
      if (kind && data.NAVAL_TREATY_MODIFIERS[kind][action]) effects.push({id:'naval-'+kind,
        label:sanctions ? 'Naval treaty sanctions' : 'Open naval treaty compliance', ...data.NAVAL_TREATY_MODIFIERS[kind][action]});
    }
  }
  const adjust = (values, field, round) => Object.fromEntries(Object.entries(values).map(([resource, value]) => {
    const factor = 1 + effects.reduce((sum,e) => sum + (e[field]?.[resource] || 0),0);
    return [resource, Math.max(0,round(value * Math.max(.25,Math.min(3,factor)) + (field === 'price' ? -1e-9 : 1e-9)))];
  }));
  const price=adjust(base.price,'price',Math.ceil),gain=adjust(base.gain,'gain',Math.floor);
  // Equipment/industrial cooperation moves stored industrial capacity. Influence
  // is a ministry's administrative cost, never another government's income.
  const transfer=values=>Object.fromEntries(TRADED_RESOURCES.filter(k=>values[k]>0).map(k=>[k,values[k]]));
  return {...base, price, gain, effects,
    partnerPrice:bilateralAction(action)?transfer(gain):{},
    partnerGain:bilateralAction(action)?transfer(price):{}};
}

export function pendingDiplomaticOffers(s, actor=s.player) {
  return (s.diplomaticOffers || []).filter(o=>o.to===actor && o.status==='pending' && o.expiresAt>campaignMinutes(s)
    && !relation(s,o.from,o.to)?.war);
}

export function exchangeBalanceBlock(s, from, to, terms) {
  for(const [id,price,gain] of [[from,terms.price,terms.gain],
    [to,terms.partnerPrice,terms.partnerGain]]) {
    const n=s.nations[id];
    if(!n)return 'The government is no longer available.';
    for(const [resource,cost] of Object.entries(price))
      if(!Number.isFinite(n[resource]) || n[resource]<cost)return PROFILES[id].name+' does not have enough '+resource+'.';
    for(const [resource,amount] of Object.entries(gain))
      if(!Number.isFinite(n[resource]) || !Number.isFinite(n[resource]-(price[resource]||0)+amount)
        || n[resource]-(price[resource]||0)+amount>1e15)return PROFILES[id].name+': this exchange exceeds the '+resource+' reserve limit.';
  }
  return '';
}

export function diplomaticPartnerBlock(s,from,to,terms) {
  if(s.controllers[to]!=='ai')return '';
  const n=s.nations[to],e=economyFor(s,to),reserves={gold:e.goldYear*.12,industry:e.industryYear*.05,strategic:(n.strategicDailyDemand||0)*30};
  for(const [resource,cost] of Object.entries(terms.partnerPrice))
    if(cost>0 && n[resource]-cost<(reserves[resource]||0))return 'The other government is retaining its '+resource+' reserve.';
  if(terms.partnerGain.industry>0 && n.industry>=Math.max(5000,e.industryYear*.5))
    return 'The other government has sufficient industrial reserves and declines this purchase.';
  if(terms.partnerGain.strategic>0 && n.strategic>=Math.max(4000,(n.strategicDailyDemand||0)*180,e.strategicYear*.5))
    return 'The other government has sufficient strategic reserves and declines this purchase.';
  return '';
}

export function diplomaticInitiatorBlock(s,id,terms) {
  if(s.controllers[id]!=='ai')return '';
  const n=s.nations[id],e=economyFor(s,id),reserves={gold:e.goldYear*.12,industry:e.industryYear*.05,
    strategic:(n.strategicDailyDemand||0)*30,influence:12};
  for(const [resource,cost] of Object.entries(terms.price))
    if(cost>0 && n[resource]-cost+(terms.gain[resource]||0)<(reserves[resource]||0))
      return 'The proposing government is retaining its '+resource+' reserve.';
  return '';
}

export function diplomaticOfferBlock(s,c,offer,actor=s.player) {
  if(!offer || !(s.diplomaticOffers||[]).includes(offer))return 'This diplomatic offer is no longer available.';
  if(offer.to!==actor)return 'Only the receiving government may answer this offer.';
  if(offer.status!=='pending')return offer.reason || 'This diplomatic offer has already been resolved.';
  if(campaignMinutes(s)>=offer.expiresAt)return 'This offer expired; no exchange took place.';
  if(!relation(s,offer.from,offer.to) || relation(s,offer.from,offer.to).war)return 'This bilateral action requires peace.';
  if((s.nations[offer.from].cooldowns[offer.action+'-'+offer.to]??-Infinity)>campaignMinutes(s)/1440)
    return 'The proposing government has already completed this exchange during its cooldown.';
  return exchangeBalanceBlock(s,offer.from,offer.to,offer.terms) || diplomaticInitiatorBlock(s,offer.from,offer.terms);
}
export function readyProvocationFleet(s, c, target, id = s.player) {
  return (s.nations[id]?.fleets || [])
    .filter(f => !provocationFleetBlock(s,c,id,target,f))
    .map(f => {const p=fleetStats(s,c,id,f);return {f,strength:(p.surface+p.air*12+p.subAttack+p.asw*.2)*supplyDetails(s,c,id,f).factor};})
    .sort((a,b)=>b.strength-a.strength || a.f.id.localeCompare(b.f.id))[0]?.f || null;
}
export function diplomaticBlock(s,c,target,action,id=s.player,fleetId=null) {
  const rule=diplomaticTerms(s,c,target,action,id), n=s.nations[id], r=relation(s,id,target);
  if (!rule) return "Choose another government and a valid diplomatic action.";
  if ((n.cooldowns[action+'-'+target] ?? -Infinity) > s.day+(s.fraction || 0))
    return 'Available after this action’s '+rule.days+'-day cooldown.';
  if (r.war) return 'This bilateral action requires peace.';
  if (action === 'visit' && n.influence >= 500) return 'Influence is already at its maximum of 500.';
  if (action === 'provoke') {const block=provocationFleetBlock(s,c,id,target,readyProvocationFleet(s,c,target,id));if(block)return block;}
  for (const [resource,cost] of Object.entries(rule.price))
    if (!Number.isFinite(n[resource]) || n[resource] < cost) return 'Not enough '+resource+'.';
  if(bilateralAction(action)) {
    const block=exchangeBalanceBlock(s,id,target,rule) || diplomaticPartnerBlock(s,id,target,rule)
      || diplomaticInitiatorBlock(s,id,rule);
    if(block)return block;
    if(s.controllers[target]==='human' && id!==target) {
      if((s.diplomaticOffers||[]).some(o=>o.status==='pending' && o.from===id && o.to===target && o.expiresAt>campaignMinutes(s)))
        return 'A diplomatic offer to this government is already awaiting a reply.';
      if(pendingDiplomaticOffers(s,target).length>=DIPLOMATIC_OFFER_LIMIT)return 'This government already has three offers awaiting replies.';
      if((n.cooldowns['diplomatic-offer-'+target]??-Infinity)>campaignMinutes(s)/1440)
        return 'Wait 90 days before offering another exchange to this government.';
    }
  }
  return '';
}
