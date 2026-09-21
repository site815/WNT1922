import { ECONOMY } from "../mechanics/economy-rules.mjs";
import { facts, panel, table, esc, signed, pct } from "./ledger-view.mjs";
import { industryExpansion } from "../mechanics/levels.mjs";
import { monthlyIncome, yardLoad } from "../mechanics/engine.mjs";
import { merchantEconomy } from "../mechanics/merchant-economy.mjs";
import { growthOutlook } from "../mechanics/economic-growth.mjs";
import { economyFor } from "../mechanics/balance.mjs";
import { strategicFactor, strategicDemand } from "../mechanics/strategic-materials.mjs";
import { warBalances } from "../mechanics/war-balance.mjs";
import { PROFILES, NATION_ORDER } from "../mechanics/catalog.mjs";
import { shippingPlan } from "../mechanics/merchant-convoys.mjs";
import { CONVOY_RULES } from "../mechanics/convoy-traffic.mjs";
import { goldAccount, diplomacyAccount } from "../mechanics/gold-accounting.mjs";
const num=(v,d=0)=>Number(v||0).toLocaleString("en-US",{maximumFractionDigits:d});
const percent=(v,d=2)=>num(v*100,d)+"%";
export function warView(s, compact = false) {
  const wars = warBalances(s);
  if (!wars.length) return "";
  return `<div class="${compact ? "war-strip" : "war-overview"}" aria-label="Active wars">${wars.map((w) => `<div class="war-estimate ${w.result.toLowerCase()}" title="Estimated balance: sunk tonnage + 35% of damage-equivalent tonnage + 15% of merchant GRT, plus land campaign progress. Not a victory condition."><span>WAR · <b style="color:${PROFILES[w.opponent].color}">${w.name}</b></span><strong>${w.winner ? PROFILES[w.winner].name + " leading" : "Even so far"}</strong>${compact ? "" : `<small>Your side / opponent: ${num(w.own.sunk)} / ${num(w.enemy.sunk)} t sunk; ${num(w.own.damage)} / ${num(w.enemy.damage)} t damage-equivalent inflicted · Land balance ${num(w.land)}</small>`}</div>`).join("")}</div>`;
}

export function economyView(s,c) {
  const n=s.nations[s.player], b=economyFor(s,s.player), i=monthlyIncome(s,c), g=growthOutlook(s,c), e=g.shipping,
    shipping=shippingPlan(s,c,s.player), demand=strategicDemand(s,c,s.player), f=strategicFactor(n), expansion=industryExpansion(s), yards=yardLoad(s,c);
  const flow=(name,gold,industry,strategic,hint='')=>['<span title="'+esc(hint)+'">'+esc(name)+'</span>',signed(gold),signed(industry),signed(strategic)];
  const monthly=[
    flow('GDP naval budget · accessible, after bombing',b.productiveGDP*ECONOMY.GDP_GOLD_SHARE/12,b.productiveGDP*(1-ECONOMY.GDP_GOLD_SHARE)/12,b.productiveGDP*b.strategicModifier*ECONOMY.STRATEGIC_OUTPUT_SHARE/12),
    flow('GTP naval budget',b.gtp*ECONOMY.GTP_GOLD_SHARE/12,b.gtp*(1-ECONOMY.GTP_GOLD_SHARE)/12,b.gtp*b.tradeStrategicModifier*ECONOMY.STRATEGIC_OUTPUT_SHARE/12),
    flow('Industry capacity, funding and shortages',0,i.industry-b.industryYear/12,0,'Applies facilities × funding × paid operation × strategic effectiveness to base industry output.'),
    flow('Fleet upkeep',-i.upkeep,0,0),flow('Treaty policy',-i.treaty.gold,0,0),
    flow('Ship operations',0,0,-demand.ships*f),flow('Aircraft operations',0,0,-demand.aviation*f),
    ...i.facilities.rows.map(r=>flow(r.label,-r.gold/12,-r.industry/12,-(r.strategic||0)/12)),
    flow('Planned net / month',i.netGold,i.netIndustry,i.netStrategic),
    flow('Actual change this month',n.gold-n.monthAccount.opening.gold,n.industry-n.monthAccount.opening.industry,n.strategic-n.monthAccount.opening.strategic,'All receipts and spending since this month began, including orders, repairs and diplomacy.'),
    ...(n.monthAccount.last?[flow('Last completed month',n.monthAccount.last.gold,n.monthAccount.last.industry,n.monthAccount.last.strategic)]:[])
  ];
  const budget=panel('Resource accounts · monthly',table(['Income / expense','Gold','Industry','Strategic'],monthly)+
    '<small>Output and operating expenses accrue daily; upkeep and treaty charges monthly. Facility expense forecasts use chosen funding and nominal aircraft output; shortages can reduce actual payments. The forecast excludes new orders, research, diplomacy, repairs and government replacements; actual changes include them.</small>');
  const cash=goldAccount(n), exchanges=diplomacyAccount(n);
  const cashPanel=panel('Gold actually paid / received · this month',table(['Cash-flow category','Gold'],[
    ...cash.rows.map(row=>[esc(row.label),signed(row.amount)]),
    ['Total · matches change in reserve',signed(cash.change)]
  ])+'<small>Paid amounts include wartime repairs and bilateral trade. These are components of the actual monthly change above, not additional charges.</small>');
  const exchangePanel=panel('Diplomatic exchanges · national stocks',table(['Period','Gold','Industry','Strategic'],[
    flow('This month',exchanges.current.gold,exchanges.current.industry,exchanges.current.strategic),
    n.monthAccount.last?flow('Last completed month',exchanges.last.gold,exchanges.last.industry,exchanges.last.strategic)
      : ['Last completed month','First month in progress','—','—']
  ])+'<small>Signed net receipts and payments, already included in actual monthly changes. Exchanges move existing stocks between nations. They do not directly change GDP, GTP or completed merchant deliveries.</small>');
  const strategic=panel('Strategic materials',facts([
    ['Reserve',num(n.strategic),'National abstract stock of fuel, rubber, tin and critical materials; not tons or kg of physical fuel.'],
    ['Opening reserve',num(c.nations[s.player].starting.strategic)],
    ['Productive GDP naval budget',num(b.productiveGDP)+' kg gold equivalent / year'],
    ['Domestic resource modifier','× '+num(b.strategicModifier,3),'Authored national endowment; 1.0 represents a resource-rich domestic economy.'],
    ['GTP naval budget',num(b.gtp)+' kg gold equivalent / year'],
    ['Trade modifier = min(1, GTP ÷ GDP)','× '+num(b.tradeStrategicModifier,4)],
    ['Annual strategic output',num(b.strategicYear,2)],['Gross / month',num(i.strategic,2)],
    ['Operations + factory use / month',num(demand.monthly*f+i.facilities.strategic/12,2)],
    ['Net / month',signed(i.netStrategic)],['Strategic operating need / day',num(demand.daily,2)],
    ['Operating reserve at full demand',demand.daily?num(n.strategic/demand.daily,1)+' days':'No current demand'],
    ['Movement / aviation / production',pct(f)],['Naval supply multiplier',n.strategic>0?'× 1':'× 0.5'],
    ['Campaign operations / production spent',num(n.strategicSpent.operations)+' / '+num(n.strategicSpent.production)]
  ])+'<p class="formula">Annual output = '+num(ECONOMY.STRATEGIC_OUTPUT_SHARE,4)+' × ('+num(b.productiveGDP,2)+' × '+num(b.strategicModifier,3)+' + '+num(b.gtp,2)+' × '+num(b.tradeStrategicModifier,4)+') = '+num(b.strategicYear,2)+'. Monthly gross = annual ÷ 12. No second naval allocation is applied.</p>','STRATEGIC');
  const domestic=panel('GDP naval budget · domestic funding',facts([
    ['Opening / current annual budget',num(c.nations[s.player].economy.gdp)+' / '+num(n.gdp)+' kg'],
    ['Home output access',pct(b.home.access)],...b.home.regions.map(r=>[r.name+' · '+pct(r.share),r.accessible?'Accessible':'Occupied by '+r.owner]),
    ['Bombing disruption',pct(n.industrialDamage.industry)],['Productive budget',num(b.productiveGDP)+' kg / year','GDP naval budget × home access × (1 − bombing disruption).'],
    ['Normal / net monthly growth',pct(g.normal)+' / '+pct(g.monthly)],['Projected budget change',signed(n.gdp*g.monthly)+' kg / month'],
    ['Growth basis',g.war?'Wartime +1% / month':'Historical domestic growth series'],['Gold / industry split','20% / 80%']
  ])+'<p class="formula">Productive budget = GDP × home access × (1 − disruption). Below 50% bombing: normal growth × (1 − 2D); above 50%: −2% × (2D − 1). Occupation denies output; overseas islands do not deduct GDP.</p>','GDP');
  const trade=panel('GTP naval budget · trade funding',facts([
    ['Opening / current annual budget',num(e.startingGTP)+' / '+num(n.gtp)+' kg'],['Monthly growth',pct(g.tradeMonthly,3)],
    ['Projected budget change',signed(g.tradeMonth)+' kg / month'],['Next annual budget',num(n.gtp*(1+g.tradeMonthly))+' kg'],
    ['Port access',pct(e.ports.coverage,0)],['Convoy success',pct(e.convoys.success,0)],['Delivery coverage',pct(e.deliveryCoverage,0),'Actual completed round trips / required GRT. Surplus above 100% is shown.'],
    ['Effective delivery coverage',pct(e.effectiveDeliveryCoverage,0),'Capped at 100% for logistics.'],['Logistics',pct(e.logistics/100,0)],['Gold / industry split','80% / 20%']
  ])+'<p class="formula">Logistics = (port access + success × capped coverage) ÷ 2. Growth is −2% at zero logistics, zero at 50%, and '+(g.war?'2%':'0.05%')+' at 100%, interpolated. Budget changes only at month-end; no GRT conversion or immediate sinking deduction.</p>','GTP');
  const shippingPanel=panel('Merchant capacity & deliveries',facts([
    ['Civilian hulls / average size',num(e.hulls)+' / '+num(e.average,2)+' GRT'],['Fleet GRT = hulls × average',num(e.current)],
    ['Required fleet GRT',num(g.production.requiredGRT),'Opening merchant GRT × current GTP naval budget / opening GTP naval budget.'],
    ['Capacity shortfall / base hulls',pct(g.production.shortfall)+' / '+num(g.production.baseHulls,3)+' per month'],
    ['Logistics / industry multipliers','× '+num(g.production.logisticsMultiplier,3)+' / × '+num(g.production.industryMultiplier,2)],
    ['Hull growth / fractional carry',num(g.merchantHullsMonth,3)+' / '+num(n.civilianShipping.carry,3)],['Average hull size growth','+0.1% / month'],
    ['Required delivery = (GDP + GTP) ÷ 2',num(e.required)+' GRT / month'],['Delivered / sunk · rolling 30 days',num(e.convoys.delivered)+' / '+num(e.convoys.sunk)+' GRT'],
    ['Hulls at sea / '+pct(CONVOY_RULES.AT_SEA_SHARE)+' target',num(e.traffic.hullsAtSea)+' / '+num(e.traffic.targetAtSea)],['Moving convoys / average hulls',num(e.traffic.convoyCount)+' / '+num(e.traffic.averageHulls,2)],
    ['Civilian hulls delivered in campaign',num(n.civilianShipping.delivered)]
  ]),'SHIPPING');
  const facilities=panel('Industry, ports & influence',facts([
    ['Naval industry level',n.tech.industry],['Opening-calibrated multiplier','× '+num(expansion.baseline,3)],['Completed expansion bonus','+'+num((expansion.multiplier-1)*100)+'%','Each upgrade adds 15% of opening capacity; additive, not compound.'],
    ['Funding / paid operation',pct(n.industryFunding)+' / '+pct(n.industryOperating??1)],['Strategic production effectiveness',pct(f)],
    ['Total yards / spare',num(yards.capacity*365)+' / '+num(yards.spare*365)+' t / year'],['Yard bombing disruption',pct(n.industrialDamage.yards)],
    ['Usable / opening port trade',num(e.ports.available)+' / '+num(e.ports.baseline)],['Port access',pct(e.ports.coverage,0)],
    ['Influence reserve',num(n.influence)+' / 500'],['Net influence / month',signed(i.influence)],['Treaty gold / influence per month',num(i.treaty.gold)+' / '+num(i.treaty.influence)]
  ])+'<button data-action="view" data-view="programs">Funding & expansions</button>','INDUSTRY');
  const routes=panel('Automatic merchant circuits',table(['Route','Round trip','Demand / month','Moving hull target'],shipping.routes.map(r=>[esc(r.name),num(r.days,1)+' days',num(r.demand)+' GRT',num(r.hulls)]))+'<small>Surviving hulls credit their departure manifest once on returning to origin. Outbound legs and scheduled capacity are not counted as deliveries.</small>');
  const comparison=panel('Naval budgets & maritime capacity',table(['Nation','GDP budget','GTP budget','Merchant GRT','Port access','Convoy success','Coverage','Logistics'],NATION_ORDER.map(id=>{
    const x=merchantEconomy(s,c,id),a=s.nations[id];return ['<span style="color:'+PROFILES[id].color+'">'+esc(PROFILES[id].name)+'</span>',num(a.gdp),num(a.gtp),num(x.current),pct(x.ports.coverage,0),pct(x.convoys.success,0),pct(x.deliveryCoverage,0),pct(x.logistics/100,0)];
  })));
  return '<div class="ledger-layout economy-ledger">'+budget+cashPanel+exchangePanel+strategic+domestic+trade+shippingPanel+facilities+'<div class="ledger-wide">'+routes+comparison+'</div></div>';
}
