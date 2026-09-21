import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/diplomacy-rules.md");
import { provocationFleetBlock } from "./provocation.mjs";
import { fleetStats } from "./task-forces.mjs";
import { supplyDetails } from "./logistics.mjs";
import { treatyAssessment } from "./treaty-policy.mjs";
export const DIPLOMACY = data.DIPLOMACY;
export const PACT_MODIFIERS = data.PACT_MODIFIERS;
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
    return [resource, round(value * Math.max(.25,Math.min(3,factor)) + (field === 'price' ? -1e-9 : 1e-9))];
  }));
  return {...base, price:adjust(base.price,'price',Math.ceil), gain:adjust(base.gain,'gain',Math.floor), effects};
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
  return '';
}
