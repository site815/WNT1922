import { merchantEconomy, merchantProduction, MERCHANT_SIZE_MONTHLY } from "./merchant-economy.mjs";
import { historicalGDP } from "./historical-gdp.mjs";
import { ECONOMY, nationAtWar, tradeHullGrowth, gdpGrowthRate } from "./economy-rules.mjs";
import { industryExpansion } from "./levels.mjs";
const balances = n => ({ gold:n.gold, industry:n.industry, influence:n.influence, strategic:n.strategic,
  crew:n.crew, aviators:n.aviators, aircraft:Object.values(n.aircraft).reduce((a,b)=>a+b,0) });
const monthStart = day => { const d = new Date(day * 86400000); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) / 86400000; };
const nextMonth = day => { const d = new Date(day * 86400000); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1) / 86400000; };
export function growthOutlook(s,c,id=s.player,at=s.day) {
  const n=s.nations[id], shipping=merchantEconomy(s,c,id), war=nationAtWar(s,id);
  const historical=historicalGDP(id,nextMonth(at))/historicalGDP(id,monthStart(at))-1;
  const normal=war ? ECONOMY.WARTIME_GDP_MONTHLY : historical;
  const monthly=gdpGrowthRate(normal,n.industrialDamage.industry);
  const tradeMonthly=tradeHullGrowth(shipping.logistics/100,war), expansion=industryExpansion(s,id);
  const production=merchantProduction(shipping,expansion);
  return {war,historical,normal,monthly,annual:Math.pow(1+monthly,12)-1,
    tradeMonthly,tradeMonth:n.gtp*tradeMonthly,production,merchantHullsMonth:production.hullsPerMonth,
    sizeMonthly:MERCHANT_SIZE_MONTHLY,expansion,shipping,gdp:n.gdp};
}
export function initializeEconomy(s) {
  for(const n of Object.values(s.nations)) {
    n.convoyRecord ??= [];
    n.strategicSpent ??= {operations:0,production:0};
    n.strategicDailyDemand ??= 0;
    n.civilianShipping ??= {carry:0,delivered:0,grt:0};
    n.monthAccount ??= {start:s.day,opening:balances(n),last:null};
  }
}
export function closeEconomicMonth(s,c,id) {
  const n=s.nations[id], account=n.monthAccount, previous=account.start;
  const fraction=(s.day-previous)/(nextMonth(previous)-monthStart(previous));
  // Evaluate all growth against the closing month's shipping and economic bases.
  const g=growthOutlook(s,c,id,previous), rate=Math.pow(1+g.monthly,fraction)-1;
  const tradeRate=Math.pow(1+g.tradeMonthly,fraction)-1;
  n.gdp*=1+rate;
  n.gtp*=1+tradeRate;
  n.civilianShipping.carry+=g.merchantHullsMonth*fraction;
  const done=Math.floor(n.civilianShipping.carry);
  n.civilianShipping.carry-=done;
  n.merchant.hulls+=done;
  n.civilianShipping.delivered+=Math.max(0,done);
  n.civilianShipping.grt+=Math.max(0,done)*g.shipping.average;
  n.civilianShipping.last={day:s.day,hulls:done,grt:done*g.shipping.average};
  n.merchant.averageGRT*=Math.pow(1+MERCHANT_SIZE_MONTHLY,fraction);
  n.lastEconomicGrowth={day:s.day,rate,tradeRate,merchantHulls:done,logistics:g.shipping.logistics};
  account.last={start:previous,end:s.day,
    goldFlows:{...account.goldFlows},
    ...Object.fromEntries(Object.entries(balances(n)).map(([k,v])=>[k,v-account.opening[k]]))};
  account.start=s.day;
  account.opening=balances(n);
  account.goldFlows={};
}
