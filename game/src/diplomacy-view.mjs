import { DIPLOMACY, PROVOCATION, ceasefireOffer, diplomaticBlock } from './diplomacy-rules.mjs';
import { relationColor } from './relation-color.mjs';
import { NATION_ORDER, PROFILES } from './catalog.mjs';
import { treatyLedger } from './engine.mjs';
import { timedProgress, dateLabel } from './progress-view.mjs';
import { warBalances } from './war-balance.mjs';
import { relationChanges, warningRisk, scheduledWarningOnly, WAR_PRESSURE_THRESHOLD } from './diplomacy-history.mjs';
import { activePacts } from './war-politics.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Math.round(v||0).toLocaleString('en-US');
export const diplomaticCost=p=>num(p.gold)+' gold · '+num(p.influence)+' influence · '+num(p.industry)+' industry';
export function diplomaticHint(s,c,target,action){
 const rule=DIPLOMACY[action];let text=rule.name+': '+diplomaticCost(rule.price)+'. ';
 if(rule.relations)text+=(rule.relations>0?'+':'')+rule.relations+' relations. ';
 if(action==='cooperate')text+='Once per government.';
 else if(action==='alliance')text+='Requires +100 relations and peace.';
 else text+='Available again after '+rule.days+' days. ';
 if(action==='provoke')text+='Requires a ready fleet; adds 25 war pressure. '+PROVOCATION.clashChance+'% risk of opening fire if opposing ships are within '+num(PROVOCATION.reachNm*1.852)+' km; a limited clash commits the governments to war after a 1–12 month warning. Ships keep their actual positions.';
 if(action==='truce'){const o=ceasefireOffer(s,c,target);text+='An accepted settlement costs an additional '+diplomaticCost(rule.settlement)+'. Acceptance '+o.chance+'%: base 15, enemy naval losses +'+num(o.enemyLosses)+', trade disruption +'+num(o.trade)+', war duration +'+num(o.duration)+', war balance '+(o.warBalance>=0?'+':'')+num(o.warBalance)+' percentage points. Capped at 5–90%. Both payments must be affordable; settlement is charged only on acceptance. Peace is guaranteed for one year.';}
 return text;
}
export function diplomacyView(s,c){
 const n=s.nations[s.player],ledger=treatyLedger(s,c),outside=s.campaignId==='campaign_1922'&&s.player==='SOV';
 const policies={disclose:'Disclose construction',conceal:'Conceal construction',withdraw:'Withdrawn'};
 const current=outside?'Not a treaty signatory':!ledger.active&&n.treatyPolicy!=='withdraw'?'Treaty expired — open construction':policies[n.treatyPolicy];
 const treaty='<section class="panel treaty-panel"><div><span class="eyebrow">TREATY POLICY</span><h2>'+esc(current)+'</h2><p class="treaty-current">Current state: <strong>'+esc(ledger.active?'Bound by treaty limits':outside?'Outside the agreement':n.treatyPolicy==='withdraw'?'Withdrawn from this agreement':'Limits have lapsed')+'</strong></p><div class="treaty-ledger"><div><b>'+num(ledger.declared)+' t</b><span>declared capital / carrier tonnage</span></div><div><b>'+num(ledger.actual)+' t</b><span>actual, including construction</span></div></div></div><div><p title="New capital ships above 35,000 t, carriers above 27,000 t and heavy cruisers above 10,000 t require concealment or withdrawal while treaty limits apply.">'+(ledger.active?'Limits expire '+dateLabel(s.treatyUntil)+'.':outside?'The Soviet Union did not sign the Washington agreement.':'Open construction is permitted.')+'</p>'+(ledger.active?'<label for="treaty-policy">Change policy</label><select id="treaty-policy">'+[['disclose','Disclose construction'],['conceal','Conceal construction'],['withdraw','Withdraw from agreement']].map(([id,label])=>'<option value="'+id+'" '+(n.treatyPolicy===id?'selected':'')+'>'+label+'</option>').join('')+'</select><button class="action-slot" data-action="treaty" title="Apply the selected policy. Concealment consumes 700 gold and 3 influence per month and risks inspections. Withdrawal costs 1,000 gold, 20 influence and 100 industry and lowers all relations by 8.">Apply treaty policy</button>':'')+'</div></section>';
 const wars=warBalances(s);
 const governments=NATION_ORDER.filter(id=>id!==s.player).map(id=>{const p=PROFILES[id],r=s.relations[[s.player,id].sort().join('-')],w=wars.find(w=>w.opponent===id);const actions=r.war?['truce']:['visit','cooperate','insult','provoke','alliance'];
  return '<article class="panel government" style="--nation:'+p.color+'"><span class="nation-code" style="color:'+p.color+'">'+id+'</span><h2 style="color:'+p.color+'">'+p.name+'</h2><p class="badge '+(r.war?'war':'')+'">'+(r.war?'At war':r.allied?'Allied':r.truceUntil>s.day?'Ceasefire until '+dateLabel(r.truceUntil):'At peace')+'</p><div class="relation-score" style="color:'+relationColor(r.score)+'">'+(r.score>=0?'+':'')+num(r.score)+' <span>relations</span></div><div class="relation-meter"><i style="left:'+Math.max(0,Math.min(100,(r.score+100)/2))+'%;background:'+relationColor(r.score)+'"></i></div>'+relationInformation(s,r,w)+'<div class="government-actions">'+actions.map(action=>{const rule=DIPLOMACY[action],until=n.cooldowns[action+'-'+id],hint=diplomaticHint(s,c,id,action),block=diplomaticBlock(s,c,id,action),label=action==='truce'?'Offer ceasefire · '+ceasefireOffer(s,c,id).chance+'%':rule.name;
   if(until>s.day+(s.fraction||0)&&rule.days)return timedProgress(s,{end:until,duration:rule.days,label:rule.name,hint});
   return '<button class="action-slot" data-action="'+(['provoke','insult','truce'].includes(action)?action:'diplomatic')+'" data-id="'+id+'" data-kind="'+action+'" '+(block?'disabled data-disabled-reason="'+esc(block)+'"':'')+' title="'+esc(hint+(block?'\n'+block:''))+'">'+(action==='cooperate'&&until?'Cooperation agreed':label)+'</button>';
  }).join('')+'</div></article>';
 }).join('');
 return '<div class="view-heading"><div><span class="eyebrow">GOVERNMENTS & TREATIES</span><h1>Diplomacy</h1></div></div>'+treaty+pactInformation(s)+'<div class="government-grid">'+governments+'</div>';
}

function relationInformation(s,r,w){
 const change=relationChanges(s,r),signed=v=>(v>=0?'+':'')+v.toFixed(2),historicalLock=scheduledWarningOnly(s,r);
 const history='<div class="relation-history"><p title="'+esc(change.note)+'">Historical trend <b class="'+(change.historical>=0?'positive':'negative')+'">'+signed(change.historical)+'/month</b></p><p title="Treaty-era mistrust, reduced after the limits lapse. Diplomatic actions, crises and discoveries add separate changes.">Mistrust '+signed(change.treaty)+' · Net '+signed(change.total)+'/month</p><p title="An ordinary warning requires negative relations and at least '+WAR_PRESSURE_THRESHOLD+' war pressure. Historical triggers are scheduled separately.">War pressure '+num(r.pressure)+' / 100 · threshold '+WAR_PRESSURE_THRESHOLD+'</p></div>';
 if(r.war)return history+'<p>War balance: '+esc(w?.result||'No decisive result')+'</p>';
 if(r.warning)return history+'<div class="relation-warning">'+timedProgress(s,{end:r.warning.endsAt/1440,duration:(r.warning.endsAt-r.warning.startedAt)/1440,label:'Preparing for war',datePrefix:'Hostilities ',hint:r.warning.reason+' This warning is irrevocable.'})+'</div>';
 return history+'<p title="War warnings last 1–12 calendar months. A warning commits the governments to war; improving relations afterward does not cancel it.">'+(historicalLock?'Historical outbreak window':num(warningRisk(s,r)*100)+'% monthly warning risk')+'</p>';
}
function pactInformation(s){
 return '<div class="pact-summary">'+activePacts(s).map(p=>'<article><strong>'+esc(p.name)+'</strong><small>'+p.members.map(id=>PROFILES[id].name).join(' / ')+'</small><small>'+({defensive:'Naval access · defensive calls to arms',political:'Political alignment · no automatic war entry',consultation:'Consultation · no automatic naval commitment'})[p.kind]+'</small></article>').join('')+'</div>';
}
