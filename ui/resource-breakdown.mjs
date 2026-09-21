import { navalAircraftInventory } from "../mechanics/aircraft-inventory.mjs";
import { goldAccount, diplomacyAccount } from '../mechanics/gold-accounting.mjs';
import { shippingPlan } from "../mechanics/merchant-convoys.mjs";
import { CONVOY_RULES } from "../mechanics/convoy-traffic.mjs";
import { ECONOMY } from "../mechanics/economy-rules.mjs";
import { strategicFactor, strategicDemand } from "../mechanics/strategic-materials.mjs";
import { uiModel } from "../mechanics/queries.mjs";
import { supplyDetails } from "../mechanics/logistics.mjs";
import { SUPPORT_RULES } from "../mechanics/support-effects.mjs";
import { usablePorts } from "../mechanics/task-forces.mjs";
import { monthlyIncome, yardLoad, supply } from "../mechanics/engine.mjs";
import { aircraftSummary } from "../mechanics/naval-resources.mjs";
import { sailorSummary } from "../mechanics/ship-staffing.mjs";
import { merchantEconomy, MERCHANT_RULES } from "../mechanics/merchant-economy.mjs";
import { economyFor, RULES } from "../mechanics/balance.mjs";
import { upgradeLevel, MAX_LEVEL, industryFactor, industryExpansion } from "../mechanics/levels.mjs";
import { PORTS, HOME_PORT } from "../mechanics/world.mjs";
import { campaignMinutes } from "../mechanics/campaign-clock.mjs";
import { PORT_REPAIR } from "../mechanics/ports.mjs";
import { yardAvailability } from "../mechanics/port-trade.mjs";
import { trainingDescription } from "../mechanics/personnel-training.mjs";
import { awaitingRecovery } from "../mechanics/recovery.mjs";
import { growthOutlook } from "../mechanics/economic-growth.mjs";
import { MORALE, SIGNIFICANCE, dailyMoraleRecovery } from '../mechanics/campaign-impact.mjs';
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const num = (v, d = 1) =>
    Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: d }),
  pct = (v) => num(v * 100,3) + "%",
  signed = (v) =>
    Math.abs(v) < 1e-8 ? "0" : (v > 0 ? "+" : "−") + num(Math.abs(v),Math.abs(v)<1?4:1);
export function resourceHover(s, c, key) {
  const n = s.nations[s.player],
    v = uiModel(s),
    e = v?.economy || merchantEconomy(s, c),
    i = v?.income || monthlyIncome(s, c),
    b = economyFor(s, s.player),
    up = upgradeLevel(n.tech, "industry");
  const treaty = i.treaty || { gold: 0, influence: 0 };
  let rows = [],
    note = "",
    title = key;
  const flow = (label, value) => [
    label,
    signed(value),
    Math.abs(value) < 1e-8 ? "" : value < 0 ? "negative" : "positive",
  ];
  if (["GOLD","INDUSTRY","STRATEGIC"].includes(key)) {
    const gold=key==="GOLD", strategic=key==="STRATEGIC", field=key.toLowerCase();
    const domesticShare = gold ? ECONOMY.GDP_GOLD_SHARE : strategic ? ECONOMY.STRATEGIC_OUTPUT_SHARE * b.strategicModifier : 1 - ECONOMY.GDP_GOLD_SHARE;
    const tradeShare = gold ? ECONOMY.GTP_GOLD_SHARE : strategic ? ECONOMY.STRATEGIC_OUTPUT_SHARE * b.tradeStrategicModifier : 1 - ECONOMY.GTP_GOLD_SHARE;
    rows=[["Current reserve",num(n[field])],
      flow("GDP naval budget / month",b.gdp*domesticShare/12),
      flow("Occupied home output unavailable",-b.gdp*b.home.unavailable*domesticShare/12),
      flow("Bombing loss of accessible GDP output",-b.gdp*b.home.access*n.industrialDamage.industry*domesticShare/12),
      flow("GTP naval budget / month",b.gtp*tradeShare/12)];
    if (!gold && !strategic) {
      const gross=b.industryYear/12, facilities=industryFactor(s), expansion=industryExpansion(s);
      rows.push(flow("Opening facility calibration",gross*(expansion.baseline-1)),
        flow("Completed expansions · +15% of opening each",gross*expansion.baseline*(expansion.multiplier-1)),
        flow("Unfunded capacity",-gross*facilities*(1-n.industryFunding)),
        flow("Unpaid operating expenses",-gross*facilities*n.industryFunding*(1-(n.industryOperating??1))),
        flow("Strategic shortage",-gross*facilities*n.industryFunding*(n.industryOperating??1)*(1-strategicFactor(n))));
    }
    if(gold) rows.push(flow("Fleet upkeep",-i.upkeep),flow("Treaty policy",-treaty.gold));
    if(strategic) {
      const demand=strategicDemand(s,c,s.player);
      title="Strategic materials · national reserve";
      rows.push(["Productive GDP naval budget",num(b.productiveGDP,2)+" kg gold equivalent / year"],
        ["GTP naval budget",num(b.gtp,2)+" kg gold equivalent / year"],
        ["Output coefficient",pct(ECONOMY.STRATEGIC_OUTPUT_SHARE)],
        ["Annual gross = "+num(ECONOMY.STRATEGIC_OUTPUT_SHARE,4)+" × (productive GDP × domestic modifier + GTP × trade modifier)",num(b.strategicYear,2)],
        ["Monthly gross = annual ÷ 12",num(i.strategic,2)],
        ["Domestic resource modifier","× "+num(b.strategicModifier,2)],
        ["Trade resource modifier","× "+num(b.tradeStrategicModifier,3)],
        ["Trade modifier formula","min(1, "+num(b.gtp)+" ÷ "+num(b.gdp)+")"],
        flow("Fleet operations / month",-demand.ships*strategicFactor(n)),
        flow("Aviation operations / month",-demand.aviation*strategicFactor(n)),
        ["Movement / aviation / production effectiveness",pct(strategicFactor(n))],
        ["Naval supply multiplier · empty reserves halve supply",n.strategic>0?"× 1":"× 0.5"],
        ["Operations used in campaign",num(n.strategicSpent.operations)],
        ["Production used in campaign",num(n.strategicSpent.production)]);
    }
    for(const r of i.facilities.rows) rows.push(flow(r.label,-(r[field]||0)/12));
    rows.push(flow("Planned balance / month",gold?i.netGold:strategic?i.netStrategic:i.netIndustry),
      flow("Actual change this month",n[field]-n.monthAccount.opening[field]),
      ["Last completed month",n.monthAccount.last?signed(n.monthAccount.last[field]):"First month in progress"],
      ["GDP growth next month",pct(growthOutlook(s,c).monthly)]);
    if(!gold) {
      const exchange=diplomacyAccount(n);
      rows.push(flow("Diplomatic transfers this month · included above",exchange.current[field]),
        flow("Diplomatic transfers last month · included above",exchange.last[field]));
    }
    if(!strategic) {
      const d=n.industrialDamage, repair=d&&campaignMinutes(s)-d.lastAttack>=1440?Math.min(d.industry,.0006)+Math.min(d.yards,.0006):0;
      const ports=Object.entries(s.ports).filter(([p,x])=>(s.world?.portControl?.[p]||PORTS[p].nation)===s.player&&x.health<1&&campaignMinutes(s)-x.lastAttack>=PORT_REPAIR.safeMinutes)
        .reduce((v,[,x])=>v+Math.min(1-x.health,PORT_REPAIR.healthPerDay)*(gold?PORT_REPAIR.goldPerHealth:PORT_REPAIR.industryPerHealth),0);
      rows.push(flow("Industrial repairs requested / day",-repair*(gold?b.goldYear*.22:b.industryYear*.14)),
        flow("Port repairs requested / day",-ports));
      if(gold) {
        const ports=usablePorts(s,s.player);
        rows.push(flow("Eligible ship repairs requested / day",-n.groups.filter(g=>g.status==="repair"&&g.health<1&&!g.battleId&&ports.includes(g.dockPort||HOME_PORT[s.player])).reduce((v,g)=>v+c.classes[g.classId].cost*g.count*.0001,0)));
      }
    }
    if(gold) {
      const account=goldAccount(n);
      rows.push(['Actual cash flow this month','Paid / received'],
        ...account.rows.map(row=>flow(row.label,row.amount)),
        flow('Cash-flow total · matches reserve change',account.change));
      for(const [key,amount] of Object.entries(n.monthAccount.last?.goldFlows||{})) {
        if(['governmentAircraft','shipRepairs','portRepairs','industrialRepairs'].includes(key)&&amount)
          rows.push(flow('Last month · '+({governmentAircraft:'government aircraft',shipRepairs:'ship repairs',portRepairs:'port repairs',industrialRepairs:'industry / yard repairs'})[key],amount));
      }
    }
    note="Formula: annual gold = productive GDP × 20% + GTP × 80%; annual industry = (productive GDP × 80% + GTP × 20%) × facility factor × funding × paid operation × strategic effectiveness. Strategic is an abstract stock, not a physical fuel mass. GDP and GTP refer to naval budgets, not total national products. Annual strategic = 5% × (productive GDP × national modifier + GTP × min(1, GTP/GDP)). Divide by 12 for monthly gross, then subtract the listed costs. Industry expansion adds 15% of opening output per upgrade. Facility cost forecasts assume the selected funding and nominal aircraft output; shortages can lower the amounts actually paid. Output arrives daily. Orders, research, diplomacy, repairs and government aircraft replacements are additional; actual monthly change includes all spending. Diplomatic exchanges transfer existing national stocks; they do not directly change GDP, GTP or convoy deliveries. Strategic is shared nationally and shortages apply immediately to ships, aircraft and production. Below seven days of operating requirements, effectiveness falls toward 20%.";
    if(gold) note="Gold income = (productive GDP × 20% + GTP × 80%) ÷ 12 per month, credited daily. The forecast uses current funding and nominal aircraft output; shortages can reduce actual payments. Actual cash flow records amounts paid, including bilateral exchanges and wartime ship, port and industrial repairs. Orders, refunds and untracked activity appear in other activity; on older saves that row also includes activity before detailed tracking began. The cash-flow total matches the change in reserves. Zero-cost government aircraft do not incur a gold charge. Repair requests are daily estimates and are paid only when eligible and affordable.";
  } else if(key==="INFLUENCE") {
    rows=[["Current / maximum",num(n.influence)+" / 500"],flow("Monthly ministry allocation",RULES.influencePerMonth),
      flow("Government organization",upgradeLevel(n.tech,"influence")),flow("Treaty policy",-treaty.influence),
      flow("Net / month",i.influence),flow("Actual change this month",n.influence-n.monthAccount.opening.influence)];
    note="Diplomacy, inspections, orders and research spend influence separately. Influence is capped at 500.";
  } else if(key==="GDP" || key==="GTP") {
    title=key+" naval budget · annual gold equivalent";
    const g=growthOutlook(s,c);
    rows=key==="GDP"?[
      ["Opening GDP naval budget",num(c.nations[s.player].economy.gdp)+" kg"],
      ["Current GDP naval budget",num(n.gdp)+" kg fine-gold equivalent"],
      ["Accessible home economy",pct(b.home.access)],
      ...b.home.regions.map(r=>[r.name+' · '+pct(r.share),r.accessible?'Accessible':'Occupied · '+r.owner]),
      ["Bombing disruption",pct(n.industrialDamage.industry)],
      ["Productive GDP = GDP × home access × (1 − disruption)",num(b.productiveGDP)],
      ["Normal monthly growth",pct(g.normal)],
      ["Net monthly GDP growth",pct(g.monthly)],flow("Projected GDP change / month",n.gdp*g.monthly),
      ["Gold / industry split","20% / 80%"],
      ["Domestic strategic modifier","× "+num(b.strategicModifier,2)]
    ]:[
      ["Opening GTP naval budget",num(e.startingGTP)+" kg"],
      ["Current GTP naval budget",num(e.gtp)+" kg fine-gold equivalent"],
      ["Logistics",pct(e.logistics/100,0)],["Monthly GTP growth",pct(g.tradeMonthly)],
      flow("Projected GTP change / month",g.tradeMonth),
      ["Next GTP = current × (1 + growth)",num(n.gtp*(1+g.tradeMonthly))],
      ["Gold / industry split","80% / 20%"],
      ["Strategic modifier = min(1, GTP / GDP)","× "+num(b.tradeStrategicModifier,3)]
    ];
    note=key==="GDP"?"Formula: next GDP = current GDP × (1 + net monthly growth). Below 50% disruption, normal growth × (1 − 2 × disruption); at or above 50%, −2% × (2 × disruption − 1). Thus 50% gives zero, 75% gives −1%, 100% gives −2%. Normal growth follows national history in peace or +1% in war. Home occupation denies output rather than reducing stored GDP or transferring it to the occupier; liberation restores access. Britain and Japan count as home economies. Bombing also reduces output until repaired; repairs do not refund past GDP contraction. Merchant losses, blockade and overseas islands have no direct GDP deduction."
      :"Formula: next GTP = current GTP × (1 + logistics growth). At logistics L below 50%: growth = −2% × (1 − 2L); at or above 50%: growth = (2L − 1) × "+(g.war?"2%":"0.05%")+". GTP changes only at month-end. It is an authored economic base, not a GRT conversion. Sinkings and port damage affect logistics; they do not directly subtract GTP.";
  } else if(key==="SHIPPING") {
    const g=growthOutlook(s,c);
    rows=[["Civilian hulls",num(e.hulls)],
      [e.estimated?"Provisional opening register":"Opening merchant register",num(e.baseline)+" GRT / "+num(e.openingHulls)+" hulls"],
      ["Opening average = register GRT ÷ hulls",num(e.openingAverage,3)+" GRT"],
      ["Current average hull volume",num(e.average,3)+" GRT"],
      ["Total GRT = hulls × average size",num(e.current)+" GRT"],
      ["Fleet requirement = opening GRT × current / opening GTP",num(g.production.requiredGRT)+" GRT"],
      ["Shortfall = max(0, 1 − actual / requirement)",pct(g.production.shortfall)],
      ["Base = "+MERCHANT_RULES.HULLS_SUFFICIENT+" + "+(MERCHANT_RULES.HULLS_MAX_SHORTAGE-MERCHANT_RULES.HULLS_SUFFICIENT)+" × shortfall",num(g.production.baseHulls,3)+" hulls / month"],
      ["Logistics / industry multipliers","× "+num(g.production.logisticsMultiplier,3)+" / × "+num(g.expansion.multiplier,2)],
      flow("Expected hulls = base × both multipliers",g.merchantHullsMonth),
      ["Fractional new hulls",num(n.civilianShipping.carry,3)],
      ["Average size growth / month",pct(g.sizeMonthly)],
      ["At sea / target",num(e.traffic.hullsAtSea)+" / "+num(e.traffic.targetAtSea)+" hulls"],
      ["Last monthly hull change",signed(n.civilianShipping.last?.hulls||0)],
      ["Delivered / sunk · last 30 days",num(e.convoys.delivered)+" / "+num(e.convoys.sunk)+" GRT"],
      ["Merchant hulls lost",num(n.merchantLost)],
      ["Required GRT = (GDP + GTP) ÷ 2",num(e.required)+" / month"],
      ["Assigned round-trip capacity / month",num(shippingPlan(s,c,s.player).monthlyCapacity)]];
    note="Formula: new hulls = base production × logistics multiplier × industry multiplier. Logistics gives × "+MERCHANT_RULES.LOGISTICS_MIN_PRODUCTION+" at 0%, × "+MERCHANT_RULES.LOGISTICS_NEUTRAL_PRODUCTION+" at 50%, × "+MERCHANT_RULES.LOGISTICS_MAX_PRODUCTION+" at 100%, linear between points. Industry adds 15% per upgrade since opening. Fractions carry forward; no percentage retirements. Average size × "+(1+g.sizeMonthly)+" monthly. Fleet capacity requirement uses the nation's opening GTP/GRT benchmark; monthly voyage demand uses (GDP + GTP) ÷ 2. Neither is a physical gold-to-volume conversion. GTP growth remains separate.";
  } else if (key === "PORT TRADE") {
    rows = [
      ["Opening access requirement", num(e.ports.baseline)],
      ["Current controlled ports", num(e.ports.nominal)],
      flow(
        "Facility damage",
        e.ports.available + e.ports.blocked - e.ports.nominal,
      ),
      flow("Blockade loss", -e.ports.blocked),
      ["Usable trade points", num(e.ports.available)],
      ["Port access = min(1, usable / opening)", pct(e.ports.coverage,0)],
    ];
    note="Formula: usable port trade = Σ(charted trade × condition × (1 − blockade)). Access = min(100%, usable / opening trade requirement).";
  } else if (key === "LOGISTICS") {
    rows=[["Merchant hulls at sea / "+pct(CONVOY_RULES.AT_SEA_SHARE)+" target",num(e.traffic.hullsAtSea)+" / "+num(e.traffic.targetAtSea)],
      ["Convoys at sea",num(e.traffic.convoyCount)],
      ["Average hulls per moving convoy",num(e.traffic.averageHulls,1)],
      ["Port access = usable / opening trade",pct(e.ports.coverage,0)],
      ["Delivered GRT · rolling 30 days",num(e.convoys.delivered)],["Sunk GRT · rolling 30 days",num(e.convoys.sunk)],
      ["Required GRT = (GDP + GTP) ÷ 2",num(e.required)],
      ["Success = delivered / (delivered + sunk)",pct(e.convoys.success,0)],
      ["Coverage = delivered / required",pct(e.deliveryCoverage,0)],
      ["Effective coverage = min(100%, coverage)",pct(e.effectiveDeliveryCoverage,0)],
      ["Convoy performance = success × effective coverage",pct(e.convoyPerformance,0)],
      ["Logistics = (port access + convoy performance) ÷ 2",pct(e.logistics/100,0)]];
    note="Delivery coverage may exceed 100%; only its contribution to logistics is capped. No observed voyages gives 100% success, but delivery coverage starts at zero until actual round trips complete. Peace always assumes 100% success; deliveries still count. Sinkings enter the 30-day ledger immediately. Logistics also multiplies fleet supply by 0.8 + 0.2 × logistics fraction.";
  } else if (key === "SUPPLY") {
    const fleets=n.fleets.map(f=>({f,supply:v?.fleets?.[f.id]?.supply || supplyDetails(s,c,s.player,f)}));
    const depots=usablePorts(s,s.player);
    rows = [
      ["Fleet average", pct(v?.averageSupply ?? supply(s,c,s.player))],
      ["National logistics multiplier", "× " + num(0.8 + 0.2*e.logistics/100,3)],
      ["Strategic reserve multiplier", n.strategic>0?"× 1":"× 0.5"],
      ["Forces receiving delivered AO relief", num(fleets.filter(row=>row.supply.replenishment>0).length)],
      ["Accessible functioning supply ports", num(depots.filter(id=>(s.ports[id]?.health??1)>0).length)],
      ...fleets.map(({f,supply}) => [f.name,pct(supply.factor)]),
    ];
    note =
      "Arithmetic mean of every listed task force. Each uses distance to the closest functioning accessible supply port and its shortest-range hull’s endurance. Multiply distance × endurance × (0.8 + 0.2 × national logistics fraction) × strategic supply factor. Strategic supply is ×1 with stock remaining or ×0.5 at zero. A physical AO meeting within "+num(SUPPORT_RULES.MEETING_RANGE_NM*1.852,1)+" km restores at most "+pct(SUPPORT_RULES.TRANSFER_MAX_FRACTION)+" fuel, limited by missing fuel and cargo. Delivered relief adds up to "+num(SUPPORT_RULES.RELIEF_MAX*100)+" percentage points to distance and endurance factors and fades over "+num(SUPPORT_RULES.RELIEF_MINUTES/1440)+" days. Hover a fleet for its actual factors, fuel and replenishment. Local AO depot capacity guides support assignments; it does not multiply fleet supply. The naval combat formula applies supply once.";
  } else if (key === "TRAINING") {
    rows = [
      ["Current training", num(n.training) + "%"],
      flow(
        "Daily skill decay",
        -Math.min(Math.max(0,n.training-20),0.0025 / (1 + upgradeLevel(n.tech, "training") * 0.2)),
      ),
      flow("Next training upgrade", n.tech.training>=MAX_LEVEL?0:Math.min(9,100-n.training)),
      ["Combat = 0.5 + training fraction × 0.65", "× " + num(0.5 + (n.training / 100) * 0.65, 3)],
    ];
    note =
      "Doctrine upgrades raise national proficiency; trained recruits are counted separately. Daily decay stops at 20 and upgrades cannot exceed 100. Research also slows daily decay.";
  } else if (key === "MORALE") {
    rows = [
      ["Current morale", num(n.morale) + "%"],
      flow("Daily return toward "+MORALE.recoveryTarget, dailyMoraleRecovery(n)),
      flow("Significant victory", MORALE.victory),
      flow("Significant defeat", MORALE.defeat),
      ["Minor action / draw", "No battle morale change"],
      ["Territory gain / loss", signed(MORALE.territoryGain)+" / "+signed(MORALE.territoryLoss)],
      ["Home region gain / loss", signed(MORALE.homeGain)+" / "+signed(MORALE.homeLoss)],
      flow("Training upgrade",MORALE.training),flow("Unpaid fleet / month",MORALE.unpaidFleet),
      ["Combat = 0.65 + morale fraction × 0.5", "× " + num(0.65 + (n.morale / 100) * 0.5, 3)],
    ];
    note = "A completed action is significant at combined losses of "+num(SIGNIFICANCE.navalSunkTons)+" naval tons sunk, "+num(SIGNIFICANCE.navalDamageTons)+" damage-equivalent tons, "+num(SIGNIFICANCE.aircraftLost)+" aircraft destroyed, or "+num(SIGNIFICANCE.merchantGRT)+" merchant GRT sunk. Morale applies once after completion. Territory morale requires ownership to change; each resolved campaign counts once per government. Authored events can also change morale.";
  } else if (key === "YARDS") {
    const y = v?.yards || yardLoad(s, c);
    rows = [
      [
        "Opening yard capacity",
        num(c.nations[s.player].economy.yardYear) + " t/year",
      ],
      ["GDP growth multiplier", "× " + num(n.gdp / c.nations[s.player].economy.gdp, 3)],
      ["Strategic materials", "× " + pct(strategicFactor(n))],
      [
        "Opening facility calibration",
        "× " + num(industryExpansion(s).baseline, 3),
      ],
      ["Expansions = 1 + 15% × upgrades since opening", "× "+num(industryExpansion(s).multiplier,3)],
      ["Industry funding", "× " + pct(n.industryFunding)],
      ["Operating resources paid", "× " + pct(n.industryOperating ?? 1)],
      [
        "Intact dockyard factor",
        "× " + pct(yardAvailability(s, s.player).coverage),
      ],
      [
        "Strategic yard disruption",
        "× " + pct(1 - (n.industrialDamage?.yards || 0)),
      ],
      ["Usable annual capacity", num(y.capacity * 365) + " t/year"],
      ["Current work demand", num(y.work * 365) + " t/year"],
      ["Empty / spare = max(0, capacity − work)",num(y.spare*365)+" t/year"],
      ["Overload = max(0, work − capacity)",num(y.backlog*365)+" t/year"],
      ["Expansion since opening","+"+num((industryExpansion(s).multiplier-1)*100)+"%"],
    ];
    note =
      "Formula: catalog yards × GDP/current-opening-GDP ratio × opening facility factor × (1 + 15% × upgrades since opening) × funding × paid operation × strategic effectiveness × intact dockyards × (1 − yard disruption). Each upgrade adds opening capacity; bonuses do not compound. Daily throughput = annual capacity / 365. Overload multiplies build time by work / capacity.";
  } else if (key === "SAILORS" || key === "AVIATORS") {
    const sailor = key === "SAILORS",
      a = v?.air || aircraftSummary(s, c),
      crew = v?.crew || sailorSummary(s, c),
      type = sailor ? "sailors" : "aviators";
    rows = [
      ["Trained personnel", num(sailor ? crew.total : n.aviators)],
      flow(
        "Required complements",
        -(sailor ? crew.required : a.aviatorsRequired),
      ),
      flow("Reserve / staffing deficit = total − required", sailor ? crew.balance : a.aviatorBalance),
      [
        "Funded training / year",
        num(
          sailor
            ? n.crewYear * n.schoolFunding
            : n.aviatorsYear * n.aviatorFunding,
        ),
      ],
      ["In this graduation batch", num(n.personnelTraining[type])],
      ...(sailor?[["Assigned aboard / unassigned trained",num(crew.assigned)+" / "+num(crew.free)],
        ["Ships waiting for complete crews",num(crew.waiting)]]:[]),
      ["Rescued; awaiting recovery", num(awaitingRecovery(n, type))],
      ["Permanently lost", num(n.casualties[type].lost)],
    ];
    note =
      trainingDescription(s, n, type) +
      (sailor
        ? " Reserve hulls require 15% complements; complete crews are needed before departure."
        : " Every owned aircraft counts toward demand, including reserves and transfers. Only complete aircrews can fly.");
  } else if (key === "AIRCRAFT") {
    const a = v?.air || aircraftSummary(s, c);
    rows = [
      ["Total owned", num(a.total)],
      ["Embarked on ships", num(a.assigned)],
      ["Stationed at bases", num(a.stationed)],
      ["Ferry / merchant transfer", num(a.transit - (a.airborne || 0))],
      ["Airborne combat sorties", num(a.airborne)],
      ["Unassigned reserve", num(a.reserve)],
      ["Without full aircrews", num(a.uncrewed)],
      ["Factory output last day", num(n.aircraftOutput)],
      ["Salvage awaiting repair", num(awaitingRecovery(n, "aircraft"))],
      ["Permanently lost", num(n.casualties.aircraft.lost)],
    ];
    note =
      "Formula: reserve = total − embarked − stationed − in transit/airborne. Naval inventory conserves airframes across ships, bases, transfers, combat sorties and reserve. Other-service maritime aircraft and crews have a separate government establishment. New models replace older qualified models when a delivery route is available.";
  }
  const table = entries => '<dl>'+entries.map(([label,value,style])=>
    '<div><dt>'+esc(label)+'</dt><dd class="'+(style||'')+'">'+esc(value)+'</dd></div>').join('')+'</dl>';
  const cashStart=rows.findIndex(([label])=>label==='Actual cash flow this month');
  const detail=key==='GOLD'&&cashStart>=0
    ? '<div class="gold-account-columns"><section><h4>Budget and repair estimates</h4>'+table(rows.slice(0,cashStart))+'</section><section><h4>Actual cash flow this month</h4>'+table(rows.slice(cashStart+1))+'</section></div>'
    : table(rows);
  return (
    '<div class="resource-breakdown" data-breakdown="'+esc(key)+'"><span class="eyebrow">RESOURCE ACCOUNT</span><h3>'+esc(title)+'</h3>'+detail+
    (key==='AIRCRAFT' ? '<table class="resource-aircraft-types"><thead><tr><th>Naval model</th><th>Owned</th><th>Reserve</th><th>Embarked</th><th>Ashore</th><th>Transit</th></tr></thead><tbody>'+navalAircraftInventory(s,c).filter(r=>r.owned>0).map(r=>'<tr><td>'+esc(r.model.name)+'</td><td>'+num(r.owned)+'</td><td>'+num(r.reserve)+'</td><td>'+num(r.embarked)+'</td><td>'+num(r.ashore)+'</td><td>'+num(r.transit)+'</td></tr>').join('')+'</tbody></table>' : '') + '<p class="formula">' + esc(note) +
    "</p></div>"
  );
}
