import { merchantEconomy } from './merchant-economy.mjs';
import { upgradeLevel } from './levels.mjs';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const balances=n=>({gold:n.gold,industry:n.industry,influence:n.influence});
// Real output index, not nominal currency inflation or an extra pool to spend.
export function growthOutlook(s,c,id=s.player){
 const n=s.nations[id],shipping=merchantEconomy(s,c,id),year=new Date(s.day*86400000).getUTCFullYear();
 const war=Object.values(s.relations).some(r=>r.war&&[r.a,r.b].includes(id));
 const rows=[
  {label:'Underlying productivity',annual:id==='SOV'&&year<1939?.04:.022},
  {label:'Trade access',annual:.012*shipping.trade*(shipping.tradeFlow-.75)},
  {label:'Industrial investment',annual:Math.min(.008,upgradeLevel(n.tech,'industry')*.001)*n.industryFunding},
  {label:'Trade disruption',annual:-.09*shipping.trade*(1-shipping.tradeFlow)},
  {label:'Lost or damaged ports',annual:-.025*(1-shipping.ports.coverage)},
  {label:'Wartime disruption',annual:war?-.018:0},
  {label:'Interwar depression',annual:id!=='SOV'&&year>=1929&&year<=1933?-.055:0}
 ];
 const annual=clamp(rows.reduce((v,r)=>v+r.annual,0),-.16,.09),monthly=Math.pow(1+annual,1/12)-1;
 const merchantAnnual=clamp(.015+.015*shipping.tradeFlow+.025*Math.max(0,1-shipping.coverage)-(war?.015:0),.002,.055);
 return {rows,annual,monthly,war,merchantAnnual,shipping};
}
export function initializeEconomy(s){for(const n of Object.values(s.nations)){n.economicIndex??=1;n.civilianShipping??={carry:0,delivered:0,grt:0};n.monthAccount??={start:s.day,opening:balances(n),last:null};}}
export function closeEconomicMonth(s,c,id){
 const n=s.nations[id];initializeEconomy(s);const account=n.monthAccount;
 account.last={start:account.start,end:s.day,...Object.fromEntries(Object.entries(balances(n)).map(([k,v])=>[k,v-account.opening[k]]))};
 account.start=s.day;account.opening=balances(n);
 const outlook=growthOutlook(s,c,id),before=n.economicIndex;n.economicIndex=clamp(before*(1+outlook.monthly),.1,20);
 n.lastEconomicGrowth={day:s.day,rate:n.economicIndex/before-1,rows:outlook.rows};
 // Civilian yards finance their own small replacement/growth program. Capacity
 // enters the merchant pool only when complete hulls, not fractions, deliver.
 const reference=c.nations[id].merchants,average=(reference.grossRegisterTons||reference.hulls*1000)/Math.max(1,reference.hulls);
 const ships=Math.max(reference.hulls*.15,outlook.shipping.current/Math.max(1,average));
 n.civilianShipping.carry+=ships*(Math.pow(1+outlook.merchantAnnual,1/12)-1);
 const done=Math.floor(n.civilianShipping.carry);n.civilianShipping.carry-=done;
 n.merchant.otherHulls+=done;n.merchant.otherGRT+=done*average;
 n.civilianShipping.delivered+=done;n.civilianShipping.grt+=done*average;
 n.civilianShipping.last={day:s.day,hulls:done,grt:done*average};
}
