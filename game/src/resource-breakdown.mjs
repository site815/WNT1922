import { uiModel } from './ui-model.mjs';
import { monthlyIncome, yardLoad, fleetPower } from './engine.mjs';
import { aircraftSummary } from './naval-resources.mjs';
import { sailorSummary } from './ship-staffing.mjs';
import { merchantEconomy } from './merchant-economy.mjs';
import { economyFor, RULES } from './balance.mjs';
import { upgradeLevel } from './levels.mjs';
import { PORTS } from './world.mjs';
import { campaignMinutes } from './campaign-clock.mjs';
import { PORT_REPAIR } from './ports.mjs';
import { yardAvailability } from './port-trade.mjs';
import { trainingDescription } from './personnel-training.mjs';
import { awaitingRecovery } from './recovery.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(v,d=1)=>Number(v||0).toLocaleString('en-US',{maximumFractionDigits:d}),pct=v=>num(v*100)+'%',signed=v=>Math.abs(v)<1e-8?'0':(v>0?'+':'−')+num(Math.abs(v));
export function resourceHover(s,c,key){
 const n=s.nations[s.player],v=uiModel(s),e=v?.economy||merchantEconomy(s,c),i=v?.income||monthlyIncome(s,c),b=economyFor(s,s.player),up=upgradeLevel(n.tech,'industry');
 const covert=n.treatyPolicy==='conceal'&&s.day<=s.treatyUntil;
 let rows=[],note='',title=key;
 const flow=(label,value)=>[label,signed(value),Math.abs(value)<1e-8?'':value<0?'negative':'positive'];
 if(key==='GOLD'||key==='INDUSTRY'){
  const gold=key==='GOLD',base=gold?b.goldYear/12:b.industryYear/12*(1+up*.15)*n.industryFunding*(n.industryOperating??1);
  rows=[['Current reserve',num(n[gold?'gold':'industry'])],flow('Domestic output / month',base*e.domestic),flow('Trade output at full access',base*e.trade),flow('Shipping, disruption & port loss',-base*e.trade*(1-e.tradeFlow))];
  if(gold)rows.push(flow('Fleet upkeep',-i.upkeep),flow('Treaty concealment',covert?-RULES.concealGoldPerMonth:0));
  for(const r of i.facilities.rows)rows.push(flow(r.label,-r[gold?'gold':'industry']/12));
  rows.push(flow('Planned balance / month',gold?i.netGold:i.netIndustry));
  const portRepairs=Object.entries(s.ports).filter(([port,p])=>(s.world?.portControl?.[port]||PORTS[port].nation)===s.player&&p.health<1&&campaignMinutes(s)-p.lastAttack>=PORT_REPAIR.safeMinutes).reduce((v,[,p])=>v+Math.min(1-p.health,PORT_REPAIR.healthPerDay)*(gold?PORT_REPAIR.goldPerHealth:PORT_REPAIR.industryPerHealth),0);const shipRepairs=gold?n.groups.filter(g=>g.status==='repair'&&g.health<1).reduce((v,g)=>v+c.classes[g.classId].cost*g.count*.0001,0):0;rows.push(flow('Current port repair demand / day',-portRepairs),flow('Current ship repair demand / day',-shipRepairs),['Aviation supplies bought in campaign',num(n.aviationSuppliesSpent?.[gold?'gold':'industry'])]);
  note='Monthly equivalents at current funding. Gold arrives on the 1st; industry and facility costs accrue daily. Orders, projects, negotiations, ship/base repairs and aviation supplies are additional variable spending. Port-repair totals are in port details. Income assumptions: '+pct(e.domestic)+' domestic + '+pct(e.trade)+' trade. Funding shortages reduce actual output.';
 }else if(key==='INFLUENCE'){
  const base=RULES.influencePerMonth+upgradeLevel(n.tech,'influence');rows=[['Current / maximum',num(n.influence)+' / 500'],flow('Ministry allocation / month',RULES.influencePerMonth),flow('Government organization',upgradeLevel(n.tech,'influence')),flow('Disrupted trade income',-base*(1-e.economyFactor)),flow('Treaty concealment',covert?-RULES.concealInfluencePerMonth:0),flow('Net / month',i.influence)];note='Diplomacy, inspections, orders and projects spend influence separately. Events may add or remove it. The pool is capped at 500.';
 }else if(key==='TRADE'||key==='HOME / TRADE'){
  rows=[['Domestic share',pct(e.domestic)],['Trade share',pct(e.trade)],['Merchant capacity factor','× '+pct(e.coverage)],['Convoy flow factor','× '+pct(n.commerce/100)],['Usable port factor','× '+pct(e.ports.coverage)],['Realized trade',pct(e.tradeFlow)],['Total economy factor',pct(e.economyFactor)]];note='Domestic share + trade share × merchant coverage × convoy flow × port access. Trade flow cannot exceed 100%; excess shipping provides loss tolerance.';
 }else if(key==='SHIPPING'){
  rows=[['Available merchant volume',num(e.current)+' GRT'],['Opening shipping requirement',num(e.baseline)+' GRT'],flow('Industry expansion demand',e.required-e.baseline),['Total requirement',num(e.required)+' GRT'],['Capacity coverage',pct(e.coverage)],['Merchant hulls delivered',num(n.merchantDelivered)],['Merchant hulls lost',num(n.merchantLost)]];note='Each naval-industry upgrade adds 15% of opening merchant demand. Completed merchants restore capacity. GRT is registered volume, separate from naval displacement.';
 }else if(key==='PORT TRADE'){
  rows=[['Opening access requirement',num(e.ports.baseline)],['Current controlled ports',num(e.ports.nominal)],flow('Facility damage',e.ports.available+e.ports.blocked-e.ports.nominal),flow('Blockade loss',-e.ports.blocked),['Usable trade points',num(e.ports.available)],['Port access factor',pct(e.ports.coverage)]];
 }else if(key==='LOGISTICS'){
  rows=[['National logistics',num(n.logistics)+'%'],['Domestic share',pct(e.domestic)],['Trade share',pct(e.trade)],['Shipping × port access',pct(e.coverage*e.ports.coverage)],['Combined capacity factor','× '+pct(e.shippingFactor)],['Effective logistics',num(e.logistics)+'%']];note='Logistics research adds 8 points per upgrade, capped at 100. Unpaid fleets can lose 2 points per month. Supply adds distance, local port capacity, convoy flow, mission and oilers.';
 }else if(key==='SUPPLY'){
  rows=[['Fleet average',pct((v?.power||fleetPower(s,c)).supply)],...Object.entries(v?.fleets||{}).slice(0,20).map(([id,row])=>[n.fleets.find(f=>f.id===id)?.name||id,pct(row.supply.factor)])];note='Hull-weighted mean. Each force: effective logistics × distance band × available port capacity × (0.55 + convoy flow/220) × mission supply factor; bounded 5–100%. Nearby oilers ease the distance penalty. Hover/select a force for its individual inputs.';
 }else if(key==='TRAINING'){
  rows=[['Current training',num(n.training)+'%'],flow('Daily skill decay',-.0025/(1+upgradeLevel(n.tech,'training')*.2)),flow('Next training upgrade',9),['Combat multiplier','× '+num(.5+n.training/100*.65,3)]];note='Exercises and doctrine upgrades raise national proficiency; trained recruits are counted separately. Training is capped at 100. Research also slows daily decay.';
 }else if(key==='MORALE'){
  rows=[['Current morale',num(n.morale)+'%'],flow('Daily return toward 75', (75-n.morale)*.0006),flow('Fleet victory',3),flow('Fleet defeat',-5),['Shore result changes','+1 / −2'],['Combat multiplier','× '+num(.65+n.morale/100*.5,3)]];note='Training upgrades add 3 morale; unpaid fleets lose 3 monthly. Events can change it. Current morale includes the accumulated effects of past events and combat.';
 }else if(key==='YARDS'){
  const y=v?.yards||yardLoad(s,c);rows=[['Opening yard capacity',num(b.yardYear)+' t/year'],['Industry upgrades','× '+num(1+up*.15)],['Industry funding','× '+pct(n.industryFunding)],['Operating resources paid','× '+pct(n.industryOperating??1)],['Intact dockyard factor','× '+pct(yardAvailability(s,s.player).coverage)],['Usable annual capacity',num(y.capacity*365)+' t/year'],['Current work demand',num(y.work*365)+' t/year']];note='All yards share one construction pool. Overload extends completion times; damaged dockyards and low operating funding reduce throughput.';
 }else if(key==='SAILORS ±'||key==='AVIATORS ±'){
  const sailor=key==='SAILORS ±',a=v?.air||aircraftSummary(s,c),crew=v?.crew||sailorSummary(s,c),type=sailor?'sailors':'aviators';
  rows=[['Trained personnel',num(sailor?crew.total:n.aviators)],flow('Required complements',-(sailor?crew.required:a.aviatorsRequired)),flow('Surplus / deficit',sailor?crew.balance:a.aviatorBalance),['Funded training / year',num(sailor?n.crewYear*n.schoolFunding:n.aviatorsYear*n.aviatorFunding)],['In this graduation batch',num(n.personnelTraining[type])],['Rescued; awaiting recovery',num(awaitingRecovery(n,type))],['Permanently lost',num(n.casualties[type].lost)]];note=trainingDescription(s,n,type)+(sailor?' Reserve hulls require 15% complements; complete crews are needed before departure.':' Every owned aircraft counts toward demand, including reserves and transfers. Only complete aircrews can fly.');
 }else if(key==='AIRCRAFT'){
  const a=v?.air||aircraftSummary(s,c);rows=[['Total owned',num(a.total)],['Embarked on ships',num(a.assigned)],['Stationed at bases',num(a.stationed)],['In transit',num(a.transit)],['Unassigned reserve',num(a.reserve)],['Without full aircrews',num(a.uncrewed)],['Factory output last day',num(n.aircraftOutput)],['Salvage awaiting repair',num(awaitingRecovery(n,'aircraft'))],['Permanently lost',num(n.casualties.aircraft.lost)]];note='National inventory conserves airframes across ships, bases, transports and reserve. New models replace older qualified models when a delivery route is available.';
 }
 return '<div class="resource-breakdown"><span class="eyebrow">RESOURCE ACCOUNT</span><h3>'+esc(title)+'</h3><dl>'+rows.map(([label,value,style])=>'<div><dt>'+esc(label)+'</dt><dd class="'+(style||'')+'">'+esc(value)+'</dd></div>').join('')+'</dl><p>'+esc(note)+'</p></div>';
}
