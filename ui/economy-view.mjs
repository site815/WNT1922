import { monthlyIncome } from "../mechanics/engine.mjs";
import { merchantEconomy } from "../mechanics/merchant-economy.mjs";
import { growthOutlook } from "../mechanics/economic-growth.mjs";
import { economyFor } from "../mechanics/balance.mjs";
import { strategicFactor } from "../mechanics/strategic-materials.mjs";
import { warBalances } from "../mechanics/war-balance.mjs";
import { PROFILES, NATION_ORDER } from "../mechanics/catalog.mjs";
import { shippingPlan } from "../mechanics/merchant-convoys.mjs";
const num=(v,d=0)=>Number(v||0).toLocaleString("en-US",{maximumFractionDigits:d});
const percent=(v,d=2)=>num(v*100,d)+"%";
export function warView(s, compact = false) {
  const wars = warBalances(s);
  if (!wars.length) return "";
  return `<div class="${compact ? "war-strip" : "war-overview"}" aria-label="Active wars">${wars.map((w) => `<div class="war-estimate ${w.result.toLowerCase()}" title="Estimated balance: sunk tonnage + 35% of damage-equivalent tonnage + 15% of merchant GRT, plus land campaign progress. Not a victory condition."><span>WAR · <b style="color:${PROFILES[w.opponent].color}">${w.name}</b></span><strong>${w.winner ? PROFILES[w.winner].name + " leading" : "Even so far"}</strong>${compact ? "" : `<small>Your side / opponent: ${num(w.own.sunk)} / ${num(w.enemy.sunk)} t sunk; ${num(w.own.damage)} / ${num(w.enemy.damage)} t damage-equivalent inflicted · Land balance ${num(w.land)}</small>`}</div>`).join("")}</div>`;
}
function growthView(s,c) {
  const n=s.nations[s.player],g=growthOutlook(s,c),e=g.shipping,b=economyFor(s,s.player),shipping=shippingPlan(s,c,s.player);
  const list=rows=>'<dl class="inspection-list">'+rows.map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+v+'</dd></div>').join('')+'</dl>';
  return '<section class="panel economy-growth"><h2>GDP, GTP and shipping growth</h2><div class="growth-grid"><div><h3 data-resource="GDP">Domestic product</h3>'+list([
    ['Authored starting GDP',num(c.nations[s.player].economy.gdp)+' kg'],
    ['Current GDP · annual ministry base',num(n.gdp)+' kg fine-gold equivalent'],
    ['Bombing disruption',percent(n.industrialDamage.industry)],
    ['Productive GDP = GDP × (1 − disruption)',num(b.productiveGDP)],
    ['Normal growth / month',percent(g.normal)],['Net GDP growth / month',percent(g.monthly)],
    ['Growth basis',g.war?'Wartime +1% monthly':'Historical national GDP series'],
    ['Gold / industry allocation','20% / 80%'],['Domestic strategic modifier','× '+num(b.strategicModifier,2)],
    ['Last monthly GDP change',n.lastEconomicGrowth?percent(n.lastEconomicGrowth.rate):'First month in progress']
  ])+'<p class="formula">Next GDP = current GDP × (1 + monthly growth). Bombing tapers normal growth to zero at 50% disruption, then to −2% at 100%. Current output also falls with industrial disruption.</p></div><div><h3 data-resource="GTP">Trade product</h3>'+list([
    ['Authored starting GTP',num(e.startingGTP)+' kg'],['Current GTP · annual ministry base',num(n.gtp)+' kg fine-gold equivalent'],
    ['Logistics = (port access + success × coverage) ÷ 2',percent(e.logistics/100)],
    ['GTP growth / month',percent(g.tradeMonthly,3)],['Projected monthly GTP change',num(g.tradeMonth,2)+' kg'],
    ['Last monthly GTP change',n.lastEconomicGrowth?percent(n.lastEconomicGrowth.tradeRate,3):'First month in progress'],
    ['Gold / industry allocation','80% / 20%'],['Strategic modifier = min(1, GTP / GDP)','× '+num(b.tradeStrategicModifier,3)]
  ])+'<p class="formula">Next GTP = current GTP × (1 + logistics growth). At 0% logistics: −2%; at 50%: zero; at 100%: +0.05% in peace or +2% in war. Linear between these points. GTP has no GRT conversion or immediate sinking deduction.</p></div><div><h3 data-resource="SHIPPING">Merchant growth and deliveries</h3>'+list([
    ['Total GRT = hulls × average size',num(e.hulls)+' × '+num(e.average,2)+' = '+num(e.current)],
    ['Hull growth / month',percent(g.merchantMonthly,3)+' ≈ '+num(g.merchantHullsMonth,3)+' hulls'],
    ['Industry bonus to positive hull growth','+'+num((g.expansion.multiplier-1)*100)+'%'],
    ['Average hull size growth','+0.1% / month'],['Fractional / deferred hulls',num(n.civilianShipping.carry,3)],
    ['Required GRT = (GDP + GTP) ÷ 2',num(e.required)+' / month'],
    ['Completed round trips · rolling 30 days',num(e.convoys.delivered)+' GRT'],
    ['Delivery coverage = min(1, moved / required)',percent(e.deliveryCoverage)],
    ['Convoy success',percent(e.convoys.success)],['Port access',percent(e.ports.coverage)],
    ['Assigned round-trip capacity',num(shipping.monthlyCapacity)+' GRT / month'],
    ['Hulls needed / assigned',num(shipping.neededHulls)+' / '+num(shipping.assigned)]
  ])+'<p class="formula">Hull growth follows the GTP logistics curve. Each industry expansion adds 15% of the positive growth rate; negative growth is unchanged. Fractions carry forward. Average GRT × 1.001 monthly, independently of GTP.</p></div></div><h3>Automatic merchant circuits</h3><table><thead><tr><th>Route</th><th>Round trip</th><th>Demand / month</th><th>Hulls needed</th></tr></thead><tbody>'+shipping.routes.map(r=>'<tr><td>'+r.name+'</td><td>'+num(r.days,1)+' days</td><td>'+num(r.demand)+' GRT</td><td>'+num(r.hulls)+'</td></tr>').join('')+'</tbody></table><p>Deliveries are counted after actual round trips, including peacetime voyages. Only wartime convoys are shown on the map. Partial opening months prorate growth.</p></section>';
}
export function economyView(s, c) {
  return budgetView(s,c) + growthView(s,c) + '<section class="panel economy-panel"><h2>National product and maritime logistics</h2><table><thead><tr><th>Nation</th><th>GDP</th><th>GTP</th><th>Domestic / trade strategic modifiers</th><th>Merchant GRT</th><th>Port access</th><th>Convoy success</th><th>Logistics</th></tr></thead><tbody>' +
    NATION_ORDER.map(id => {
      const e=merchantEconomy(s,c,id), b=economyFor(s,id);
      return '<tr><td style="color:'+PROFILES[id].color+'">'+PROFILES[id].name+'</td><td>'+num(b.gdp)+'</td><td>'+num(e.gtp)+'</td><td>'+num(b.strategicModifier,2)+' / '+num(b.tradeStrategicModifier,3)+'</td><td>'+num(e.current)+'</td><td>'+percent(e.ports.coverage)+'</td><td>'+percent(e.convoys.success)+'</td><td>'+percent(e.logistics/100)+'</td></tr>';
    }).join('') + '</tbody></table><p class="panel-note">GDP and GTP are annual ministry production bases in kilograms of fine-gold equivalent. Strategic output = 5% × (productive GDP × national resource modifier + GTP × min(1, GTP/GDP)). GRT is registered volume, not warship displacement. Soviet 1922 merchant tonnage remains provisional.</p></section>';
}
function budgetView(s,c) {
  const i=monthlyIncome(s,c), n=s.nations[s.player], sign=v=>(v>=0?"+":"−")+num(Math.abs(v));
  const row=(name,gold,industry,strategic)=>'<tr><td>'+name+'</td><td>'+sign(gold)+'</td><td>'+sign(industry)+'</td><td>'+sign(strategic)+'</td></tr>';
  return '<section class="panel budget-panel"><div class="panel-title"><h2>Your operating budget</h2><button data-action="view" data-view="programs" title="Change funding and expand facilities.">Adjust funding</button></div><div class="budget-balances">' +
    [[i.netGold,"gold"],[i.netIndustry,"industry"],[i.netStrategic,"strategic"]].map(([v,k])=>'<span class="'+(v<0?"negative":"positive")+'"><b>'+sign(v)+'</b> '+k+' / month</span>').join('') +
    '</div><table><thead><tr><th>Monthly equivalent</th><th>Gold</th><th>Industry</th><th>Strategic</th></tr></thead><tbody>' +
    row("GDP + GTP output",i.products.goldYear/12,i.industry,i.strategic) +
    row("Fleet upkeep and treaty", -i.upkeep-i.treaty.gold,0,0) +
    row("Fleet and aviation operations",0,0,-i.strategicOperations*strategicFactor(n)) +
    i.facilities.rows.map(r=>row(r.label,-r.gold/12,-r.industry/12,-(r.strategic||0)/12)).join('') +
    '</tbody></table><p class="panel-note">Output and routine expenses accrue daily; fleet upkeep and treaty fees are charged monthly. Orders, research, government aircraft replacement and repairs are additional. Hover resources for actual monthly changes. Strategic shortages immediately reduce fleet and aircraft effectiveness and production everywhere; there are no separate aviation supply stocks.</p></section>';
}
