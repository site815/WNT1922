import { portTradeSummary } from './port-trade.mjs';
import { upgradeLevel } from './levels.mjs';
export const DOMESTIC_SHARE={USA:.8,SOV:.85,DEU:.7,FRA:.65,ITA:.6,JPN:.55,GBR:.4};
export const SHIPPING_PER_INDUSTRY_LEVEL=.15;
// GRT is registered volume, used here as a capacity proxy, never naval mass.
export function merchantEconomy(s,c,id=s.player){
  const n=s.nations[id],reference=c.nations[id].merchants;
  const baseline=reference.grossRegisterTons||reference.hulls*1000;
  const average=baseline/Math.max(1,reference.hulls);
  const current=(n.merchant.otherGRT??n.merchant.otherHulls*average)+n.groups.filter(g=>g.service==='merchant'&&!['building','trials','converting','sunk','scrapped'].includes(g.status)).reduce((v,g)=>v+g.count*(g.merchantGRT||average),0);
  const required=baseline*(1+upgradeLevel(n.tech,'industry')*SHIPPING_PER_INDUSTRY_LEVEL),coverage=Math.min(1,current/Math.max(1,required));
  const domestic=DOMESTIC_SHARE[id],trade=1-domestic,ports=portTradeSummary(s,id),tradeFlow=coverage*n.commerce/100*ports.coverage;
  const economyFactor=domestic+trade*tradeFlow,shippingFactor=domestic+trade*coverage*ports.coverage;
  return {ports,domestic,trade,current,required,coverage,tradeFlow,economyFactor,shippingFactor,logistics:n.logistics*shippingFactor,estimated:!reference.grossRegisterTons,baseline};
}
