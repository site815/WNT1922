import { warBalances } from './war-balance.mjs';
import { merchantEconomy } from './merchant-economy.mjs';
import { fleetStats, fleetPosition } from './task-forces.mjs';
import { fullyStaffed } from './ship-staffing.mjs';
import { supplyDetails } from './logistics.mjs';
import { PORTS, NODES, distanceNm } from './world.mjs';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const DIPLOMACY={
 visit:{name:'Diplomatic visit',price:{gold:2000,influence:14,industry:100},days:365,relations:6},
 cooperate:{name:'Industrial cooperation',price:{gold:12000,influence:24,industry:1600},days:0,relations:32},
 insult:{name:'Diplomatic insult',price:{gold:500,influence:4,industry:0},days:90,relations:-6},
 provoke:{name:'Naval provocation',price:{gold:6000,influence:16,industry:800},days:180,relations:-24},
 alliance:{name:'Propose alliance',price:{gold:1000,influence:20,industry:100},days:0},
 truce:{name:'Offer ceasefire',price:{gold:1000,influence:4,industry:100},settlement:{gold:10000,influence:40,industry:1000},days:30}
};
export const PROVOCATION={clashChance:30,reachNm:100};
export function ceasefireOffer(s,c,target,id=s.player){
 const r=s.relations[[id,target].sort().join('-')],balance=warBalances(s,id).find(w=>w.opponent===target);
 const losses=balance?.own||{sunk:0,damage:0},opening=Math.max(10000,s.initial?.[target]?.tons||10000);
 const enemyLosses=clamp((losses.sunk+losses.damage*.35)/opening*40,0,35);
 const trade=clamp(1-merchantEconomy(s,c,target).tradeFlow,0,1)*25;
 const duration=r?.war?clamp((s.day+(s.fraction||0)-r.warSince)/365*10,0,20):0;
 const warBalance=clamp((balance?.score||0)/Math.max(2000,opening*.2)*25,-25,25);
 const chance=Math.round(clamp(15+enemyLosses+trade+duration+warBalance,5,90));
 return {chance,base:15,enemyLosses,trade,duration,warBalance,days:DIPLOMACY.truce.days};
}
export function readyProvocationFleet(s,c,target,id=s.player){
 const ports=Object.entries(PORTS).filter(([,p])=>p.nation===target).map(([k])=>NODES[k]);
 return s.nations[id].fleets.filter(f=>!['repair','reinforcement','support'].includes(f.role)&&!['returning','repair','refuel'].includes(f.phase)&&!f.needsEscorts).map(f=>({f,stats:fleetStats(s,c,id,f)})).filter(({f,stats})=>stats.hulls>0&&stats.health>=.75&&stats.active.every(g=>g.status==='active'&&fullyStaffed(g,c.classes[g.classId]))&&supplyDetails(s,c,id,f).factor>=.4).sort((a,b)=>Math.min(...ports.map(p=>distanceNm(p,fleetPosition(s,a.f))))-Math.min(...ports.map(p=>distanceNm(p,fleetPosition(s,b.f))))||b.stats.tons-a.stats.tons)[0]?.f||null;
}
export function diplomaticBlock(s,c,target,action,id=s.player){
 const rule=DIPLOMACY[action],n=s.nations[id],r=s.relations[[id,target].sort().join('-')];
 if(!rule||!r||id===target)return 'Choose another government and a valid diplomatic action.';
 if(action==='cooperate'&&n.cooldowns['cooperate-'+target])return 'This bilateral agreement has already been signed.';
 if((n.cooldowns[action+'-'+target]??-Infinity)>s.day+(s.fraction||0))return 'Diplomats are preparing the next approach.';
 if(action==='truce'&&!r.war)return 'A ceasefire requires an active war.';
 if(action!=='truce'&&r.war)return 'This action requires peace.';
 if(action==='provoke'&&r.truceUntil>s.day+(s.fraction||0))return 'Naval provocations are prohibited by the current ceasefire.';
 if(action==='alliance'&&r.warning)return 'War preparations are already committed; an alliance cannot cancel the warning.';
 if(action==='alliance'&&(r.allied||r.score<100))return r.allied?'Already allied.':'An alliance requires +100 relations.';
 if(action==='provoke'&&!readyProvocationFleet(s,c,target,id))return 'Requires a fleet with complete crews, at least 75% hull condition and 40% supply, with its escort screen ready; no repair or return mission.';
 for(const k of ['gold','influence','industry'])if(n[k]<rule.price[k]+(rule.settlement?.[k]||0))return 'Not enough '+k+(rule.settlement?' to cover negotiation and an accepted settlement.':'.');
 return '';
}
