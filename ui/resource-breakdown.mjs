import { navalAircraftInventory } from "../mechanics/aircraft-inventory.mjs";
import { shippingPlan } from "../mechanics/merchant-convoys.mjs";
import { ECONOMY } from "../mechanics/economy-rules.mjs";
import { strategicFactor, strategicDemand } from "../mechanics/strategic-materials.mjs";
import { uiModel } from "../mechanics/queries.mjs";
import { monthlyIncome, yardLoad, supply } from "../mechanics/engine.mjs";
import { aircraftSummary } from "../mechanics/naval-resources.mjs";
import { sailorSummary } from "../mechanics/ship-staffing.mjs";
import { merchantEconomy } from "../mechanics/merchant-economy.mjs";
import { economyFor, RULES } from "../mechanics/balance.mjs";
import { upgradeLevel, facilityFactor, industryFactor, industryExpansion } from "../mechanics/levels.mjs";
import { PORTS } from "../mechanics/world.mjs";
import { campaignMinutes } from "../mechanics/campaign-clock.mjs";
import { PORT_REPAIR } from "../mechanics/ports.mjs";
import { yardAvailability } from "../mechanics/port-trade.mjs";
import { trainingDescription } from "../mechanics/personnel-training.mjs";
import { awaitingRecovery } from "../mechanics/recovery.mjs";
import { growthOutlook } from "../mechanics/economic-growth.mjs";
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
      flow("GDP contribution / month",b.gdp*domesticShare/12),
      flow("Bombing loss of GDP output",-(b.gdp-b.productiveGDP)*domesticShare/12),
      flow("GTP contribution / month",b.gtp*tradeShare/12)];
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
      rows.push(["Domestic resource modifier","× "+num(b.strategicModifier,2)],
        ["Trade resource modifier","× "+num(b.tradeStrategicModifier,3)],
        flow("Fleet operations / month",-demand.ships*strategicFactor(n)),
        flow("Aviation operations / month",-demand.aviation*strategicFactor(n)),
        ["Immediate operating effectiveness",pct(strategicFactor(n))],
        ["Operations used in campaign",num(n.strategicSpent.operations)],
        ["Production used in campaign",num(n.strategicSpent.production)]);
    }
    for(const r of i.facilities.rows) rows.push(flow(r.label,-(r[field]||0)/12));
    rows.push(flow("Planned balance / month",gold?i.netGold:strategic?i.netStrategic:i.netIndustry),
      flow("Actual change this month",n[field]-n.monthAccount.opening[field]),
      ["Last completed month",n.monthAccount.last?signed(n.monthAccount.last[field]):"First month in progress"],
      ["GDP growth next month",pct(growthOutlook(s,c).monthly)]);
    if(!strategic) {
      const d=n.industrialDamage, repair=d&&campaignMinutes(s)-d.lastAttack>=1440?Math.min(d.industry,.0006)+Math.min(d.yards,.0006):0;
      const ports=Object.entries(s.ports).filter(([p,x])=>(s.world?.portControl?.[p]||PORTS[p].nation)===s.player&&x.health<1&&campaignMinutes(s)-x.lastAttack>=PORT_REPAIR.safeMinutes)
        .reduce((v,[,x])=>v+Math.min(1-x.health,PORT_REPAIR.healthPerDay)*(gold?PORT_REPAIR.goldPerHealth:PORT_REPAIR.industryPerHealth),0);
      rows.push(flow("Industrial repairs requested / day",-repair*(gold?b.goldYear*.22:b.industryYear*.14)),
        flow("Port repairs requested / day",-ports));
      if(gold)rows.push(flow("Ship repairs requested / day",-n.groups.filter(g=>g.status==="repair"&&g.health<1).reduce((v,g)=>v+c.classes[g.classId].cost*g.count*.0001,0)));
    }
    note="Formula: annual gold = productive GDP × 20% + GTP × 80%; annual industry = (productive GDP × 80% + GTP × 20%) × facility factor × funding × paid operation × strategic effectiveness. Annual strategic = 5% × (productive GDP × national modifier + GTP × min(1, GTP/GDP)). Divide by 12 for monthly gross, then subtract the listed costs. Industry expansion adds 15% of opening output per upgrade. Monthly projections use current funding and selected models. Output arrives daily. Orders, research, diplomacy, repairs and government aircraft replacements are additional; actual monthly change includes all spending. Strategic is shared nationally and shortages apply immediately to ships, aircraft and production. Below seven days of operating requirements, effectiveness falls toward 20%.";
  } else if(key==="INFLUENCE") {
    rows=[["Current / maximum",num(n.influence)+" / 500"],flow("Monthly ministry allocation",RULES.influencePerMonth),
      flow("Government organization",upgradeLevel(n.tech,"influence")),flow("Treaty policy",-treaty.influence),
      flow("Net / month",i.influence),flow("Actual change this month",n.influence-n.monthAccount.opening.influence)];
    note="Diplomacy, inspections, orders and research spend influence separately. Influence is capped at 500.";
  } else if(key==="GDP" || key==="GTP") {
    const g=growthOutlook(s,c);
    rows=key==="GDP"?[
      ["Authored opening GDP",num(c.nations[s.player].economy.gdp)+" kg"],
      ["Current annual ministry GDP",num(n.gdp)+" kg fine-gold equivalent"],
      ["Bombing disruption",pct(n.industrialDamage.industry)],
      ["Productive GDP = GDP × (1 − disruption)",num(b.productiveGDP)],
      ["Normal monthly growth",pct(g.normal)],
      ["Net monthly GDP growth",pct(g.monthly)],flow("Projected GDP change / month",n.gdp*g.monthly),
      ["Gold / industry split","20% / 80%"],
      ["Domestic strategic modifier","× "+num(b.strategicModifier,2)]
    ]:[
      ["Authored opening GTP",num(e.startingGTP)+" kg"],
      ["Current annual ministry GTP",num(e.gtp)+" kg fine-gold equivalent"],
      ["Logistics",pct(e.logistics/100)],["Monthly GTP growth",pct(g.tradeMonthly)],
      flow("Projected GTP change / month",g.tradeMonth),
      ["Next GTP = current × (1 + growth)",num(n.gtp*(1+g.tradeMonthly))],
      ["Gold / industry split","80% / 20%"],
      ["Strategic modifier = min(1, GTP / GDP)","× "+num(b.tradeStrategicModifier,3)]
    ];
    note=key==="GDP"?"Formula: next GDP = current GDP × (1 + net monthly growth). Below 50% disruption, normal growth × (1 − 2 × disruption); at or above 50%, −2% × (2 × disruption − 1). Thus 50% gives zero, 75% gives −1%, 100% gives −2%. Normal growth follows national history in peace or +1% in war. Partial opening months are prorated. Bombing also reduces current production until repaired."
      :"Formula: next GTP = current GTP × (1 + logistics growth). At logistics L below 50%: growth = −2% × (1 − 2L); at or above 50%: growth = (2L − 1) × "+(g.war?"2%":"0.05%")+". GTP changes only at month-end. It is an authored economic base, not a GRT conversion. Sinkings and port damage affect logistics; they do not directly subtract GTP.";
  } else if(key==="SHIPPING") {
    const g=growthOutlook(s,c);
    rows=[["Civilian hulls",num(e.hulls)],["Average hull volume",num(e.average)+" GRT"],
      ["Total GRT = hulls × average size",num(e.current)+" GRT"],
      ["Logistics growth rate / month",pct(g.tradeMonthly)],
      ["Industry bonus to positive growth","× "+num(g.expansion.multiplier,2)],
      ["Effective hull growth / month",pct(g.merchantMonthly)],flow("Expected hulls / full month",g.merchantHullsMonth),
      ["Fractional / deferred hull change",num(n.civilianShipping.carry,3)],
      ["Average size growth / month",pct(g.sizeMonthly)],
      ["At sea",num(n.convoys.reduce((v,x)=>v+x.count,0))+" hulls"],
      ["Last monthly hull change",signed(n.civilianShipping.last?.hulls||0)],
      ["Delivered / sunk · last 30 days",num(e.convoys.delivered)+" / "+num(e.convoys.sunk)+" GRT"],
      ["Merchant hulls lost",num(n.merchantLost)],
      ["Required GRT = (GDP + GTP) ÷ 2",num(e.required)+" / month"],
      ["Assigned round-trip capacity / month",num(shippingPlan(s,c,s.player).monthlyCapacity)]];
    note="Formula: monthly hull change = hulls × logistics growth × (1 + 15% × industry upgrades since opening), with the industry bonus applied only to positive growth. Fractions carry forward; retirements wait for hulls to return. Average size × 1.001 each full month. Convoys move real round trips in peace and war; deliveries count on return. GTP is a separate economic base.";
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
      ["Port access = min(1, usable / opening)", pct(e.ports.coverage)],
    ];
    note="Formula: usable port trade = Σ(charted trade × condition × (1 − blockade)). Access = min(100%, usable / opening trade requirement).";
  } else if (key === "LOGISTICS") {
    rows=[["Port access = usable / opening trade",pct(e.ports.coverage)],
      ["Delivered GRT · rolling 30 days",num(e.convoys.delivered)],["Sunk GRT · rolling 30 days",num(e.convoys.sunk)],
      ["Required GRT = (GDP + GTP) ÷ 2",num(e.required)],
      ["Success = delivered / (delivered + sunk)",pct(e.convoys.success)],
      ["Coverage = min(1, delivered / required)",pct(e.deliveryCoverage)],
      ["Convoy performance = success × coverage",pct(e.convoyPerformance)],
      ["Logistics = (port access + convoy performance) ÷ 2",pct(e.logistics/100)]];
    note="Both halves are capped at 100%. No observed voyages gives 100% success, but delivery coverage starts at zero until actual round trips complete. Peace always assumes 100% success; deliveries still count. Sinkings enter the 30-day ledger immediately. Fleet supply is separate.";
  } else if (key === "SUPPLY") {
    rows = [
      ["Fleet average", pct(v?.averageSupply ?? supply(s,c,s.player))],
      ...Object.entries(v?.fleets || {})
        .slice(0, 20)
        .map(([id, row]) => [
          n.fleets.find((f) => f.id === id)?.name || id,
          pct(row.supply.factor),
        ]),
    ];
    note =
      "Arithmetic mean of task-force supply. Each force uses distance to the closest accessible supply port and its shortest-range hull’s endurance. Nearby operational support eases distance penalties. National trade and strategic reserves do not change this tactical supply statistic.";
  } else if (key === "TRAINING") {
    rows = [
      ["Current training", num(n.training) + "%"],
      flow(
        "Daily skill decay",
        -0.0025 / (1 + upgradeLevel(n.tech, "training") * 0.2),
      ),
      flow("Next training upgrade", 9),
      ["Combat = 0.5 + training fraction × 0.65", "× " + num(0.5 + (n.training / 100) * 0.65, 3)],
    ];
    note =
      "Exercises and doctrine upgrades raise national proficiency; trained recruits are counted separately. Training is capped at 100. Research also slows daily decay.";
  } else if (key === "MORALE") {
    rows = [
      ["Current morale", num(n.morale) + "%"],
      flow("Daily return toward 75", (75 - n.morale) * 0.0006),
      flow("Fleet victory", 3),
      flow("Fleet defeat", -5),
      ["Shore result changes", "+1 / −2"],
      ["Combat = 0.65 + morale fraction × 0.5", "× " + num(0.65 + (n.morale / 100) * 0.5, 3)],
    ];
    note =
      "Training upgrades add 3 morale; unpaid fleets lose 3 monthly. Events can change it. Current morale includes the accumulated effects of past events and combat.";
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
  return (
    '<div class="resource-breakdown"><span class="eyebrow">RESOURCE ACCOUNT</span><h3>' +
    esc(title) +
    "</h3><dl>" +
    rows
      .map(
        ([label, value, style]) =>
          "<div><dt>" +
          esc(label) +
          '</dt><dd class="' +
          (style || "") +
          '">' +
          esc(value) +
          "</dd></div>",
      )
      .join("") +
    "</dl>" +
    (key==='AIRCRAFT' ? '<table class="resource-aircraft-types"><thead><tr><th>Naval model</th><th>Owned</th><th>Reserve</th><th>Embarked</th><th>Ashore</th><th>Transit</th></tr></thead><tbody>'+navalAircraftInventory(s,c).filter(r=>r.owned>0).map(r=>'<tr><td>'+esc(r.model.name)+'</td><td>'+num(r.owned)+'</td><td>'+num(r.reserve)+'</td><td>'+num(r.embarked)+'</td><td>'+num(r.ashore)+'</td><td>'+num(r.transit)+'</td></tr>').join('')+'</tbody></table>' : '') + '<p class="formula">' + esc(note) +
    "</p></div>"
  );
}
