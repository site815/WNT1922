import { growthOutlook } from "../mechanics/economic-growth.mjs";
import { upgradeLevel } from "../mechanics/levels.mjs";
import { trainingDescription } from "../mechanics/personnel-training.mjs";
import { uiModel } from "../mechanics/queries.mjs";
import { capitalClock } from "../mechanics/campaign-clock.mjs";
import { SPEEDS, aircraftSummary } from "../mechanics/naval-resources.mjs";
import { monthlyIncome, supply, yardLoad } from "../mechanics/engine.mjs";
import { sailorSummary } from "../mechanics/ship-staffing.mjs";
import { merchantEconomy } from "../mechanics/merchant-economy.mjs";
import { warBalances } from "../mechanics/war-balance.mjs";
import { musicStatus } from "./music.mjs";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const num = (v, d = 0) =>
  Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: d });
const compact = (v) =>
  Math.abs(v) >= 1e9
    ? num(v / 1e9, 1) + "bn"
    : Math.abs(v) >= 1e6
      ? num(v / 1e6, 1) + "m"
      : Math.abs(v) >= 1e4
        ? num(v / 1e3, 1) + "k"
        : num(v);
const balance = (v) => (v >= 0 ? "+" : "−") + compact(Math.abs(v));
const signed = (v) => (v >= 0 ? "+" : "−") + num(Math.abs(v)),
  pct = (v) => num(v * 100) + "%";
const totalReserve = (total, reserve) =>
  '<span class="resource-total">' + num(total) + '</span><span class="resource-reserve ' +
  (reserve < 0 ? 'negative' : 'positive') + '">(' + signed(reserve) + ')</span>';
export function topBars(s, c, m = {}) {
  const n = s.nations[s.player],
    clock = capitalClock(s),
    v = uiModel(s),
    air = v?.air || aircraftSummary(s, c),
    crew = v?.crew || sailorSummary(s, c),
    e = v?.economy || merchantEconomy(s, c),
    income = v?.income || monthlyIncome(s, c),
    wars = warBalances(s);
  const growth=growthOutlook(s,c),yards=v?.yards||yardLoad(s,c);
  const monthly=value=>[balance(value)+' /mo',value];
  const daily=value=>[(value>=0?'+':'−')+num(Math.abs(value),Math.abs(value)<1?3:0)+' /day',value];
  const changes={GOLD:monthly(income.netGold),INFLUENCE:monthly(income.influence),INDUSTRY:monthly(income.netIndustry),STRATEGIC:monthly(income.netStrategic),
    GDP:monthly(n.gdp*growth.monthly),GTP:monthly(growth.tradeMonth),SHIPPING:[(growth.merchantHullsMonth>=0?'+':'−')+num(Math.abs(growth.merchantHullsMonth),2)+' /mo',growth.merchantHullsMonth],
    'PORT TRADE':[pct(e.ports.coverage)+' access',0],LOGISTICS:[pct(e.deliveryCoverage)+' delivered',0],SUPPLY:['Fleet average',0],
    TRAINING:daily(-.0025/(1+upgradeLevel(n.tech,'training')*.2)),MORALE:daily((75-n.morale)*.0006),
    YARDS:['Tons / year',0],
    SAILORS:['+'+compact(n.crewYear*n.schoolFunding/12)+' /mo trained',0],
    AVIATORS:['+'+compact(n.aviatorsYear*n.aviatorFunding/4)+' /quarter',0],
    AIRCRAFT:['+'+num(n.aircraftOutput||0)+' /day built',0]};
  const stats = [
    [
      "GOLD",
      compact(n.gold),
      num(n.gold) +
        " gold · " +
        signed(income.netGold) +
        " / month planned balance after upkeep and all facility funding; excludes new orders and repairs. Product output and facility spending occur daily.",
    ],
    ["INFLUENCE", num(n.influence), signed(income.influence) + " / month"],
    [
      "INDUSTRY",
      compact(n.industry),
      num(n.industry) +
        " industry · " +
        signed(income.netIndustry) +
        " / month planned balance after aircraft and school use; excludes new orders and repairs. Gross production " +
        num(income.industry) +
        " / month.",
    ],
    ["STRATEGIC", compact(n.strategic), signed(income.netStrategic) + " / month; operations and production"],
    ["GDP", compact(income.products.gdp), "Annual ministry domestic base in kg fine-gold equivalent"],
    ["GTP", compact(e.gtp), "Annual ministry trade base; changes through monthly logistics growth only"],
    ["SHIPPING", compact(e.hulls), num(e.hulls) + " hulls · " + num(e.current) + " GRT"],
    [
      "PORT TRADE",
      num(e.ports.available) + " / " + num(e.ports.baseline),
      "Usable / opening port trade points · " +
        pct(e.ports.coverage) +
        " access; damage and blockades reduce it",
    ],
    [
      "LOGISTICS",
      num(e.logistics) + "%",
      "(Port access + convoy success × delivery coverage) / 2; rolling 30-day actual voyages",
    ],
    [
      "SUPPLY",
      pct(v?.averageSupply ?? supply(s, c, s.player)),
      "Average task-force supply from endurance and port distance",
    ],
    ["TRAINING", num(n.training) + "%", "National training"],
    ["MORALE", num(n.morale) + "%", "National morale"],
    [
      "YARDS",
      totalReserve(yards.capacity * 365, yards.spare * 365),
      num(yards.capacity * 365) + " total (+" + num(yards.spare * 365) +
        " spare) tons per year after funding and port damage",
    ],
    [
      "SAILORS",
      totalReserve(crew.total, crew.balance),
      num(crew.total) +
        " trained / " +
        num(crew.required) +
        " required · " +
        crew.waiting +
        " ships waiting for complete crews · " +
        trainingDescription(s, n, "sailors"),
      crew.balance < 0,
    ],
    [
      "AVIATORS",
      totalReserve(n.aviators, air.aviatorBalance),
      num(n.aviators) +
        " aviators / " +
        num(air.aviatorsRequired) +
        " required across every aircraft · " +
        trainingDescription(s, n, "aviators"),
      air.aviatorBalance < 0,
    ],
    [
      "AIRCRAFT",
      totalReserve(air.total, air.reserve),
      num(air.total) +
        " aircraft · " +
        num(air.assigned) +
        " embarked · " +
        num(air.stationed) +
        " ashore · " +
        num(air.transit) +
        " in transit · " +
        num(air.reserve) +
        " reserve · " +
        num(air.uncrewed) +
        " without complete aircrews",
    ],
  ];
  const speed = s.paused
    ? "PAUSED"
    : m.warming
      ? "Measuring…"
      : num(m.actual) + "× actual";
  return `<header class="command-bar time-bar"><strong class="campaign-clock">${clock.date} <b>${clock.time}</b> <small>${clock.capital} · ${clock.zone}</small></strong><div class="clock-controls"><span class="actual-speed ${s.paused ? "is-paused " : ""}${s.paused || m.warming ? "" : m.ratio < 0.65 ? "slow-red" : m.ratio < 0.9 ? "slow-yellow" : ""}" title="Measured simulation speed. Slows safely under load; every fifteen-minute tick is simulated.">${speed}</span>${s.paused ? '<button data-action="step-minute" title="Advance fifteen simulated minutes">+15m</button><button data-action="step-hour" title="Advance one hour">+1h</button>' : ""}<button data-action="pause" class="pause-control">${s.paused ? "▶ Resume" : "Ⅱ Pause"}</button><select id="speed" aria-label="Simulation speed">${SPEEDS.map(([v, t]) => `<option value="${v}" ${s.speed === v ? "selected" : ""}>${t}</option>`).join("")}</select><label class="check-label auto-pause-control" title="Pause for mandatory decisions; resume after they are resolved. Manual pause stays paused."><input id="auto-pause" type="checkbox" ${s.autoPause ? "checked" : ""}>Auto-pause</label></div><div class="header-audio"><label title="Sound effects"><input id="sound-enabled" type="checkbox" ${s.audioEnabled ? "checked" : ""}>SFX</label><input id="sound-volume" aria-label="Sound effects volume" type="range" min="0" max="100" value="${s.audioVolume * 100}"><label title="Music"><input id="music-enabled" type="checkbox" ${s.musicEnabled ? "checked" : ""}>Music</label><input id="music-volume" aria-label="Music volume" type="range" min="0" max="100" value="${s.musicVolume * 100}"><button data-action="music-next" title="Next track · now ${esc(musicStatus().track.title)}" aria-label="Next music track">▶|</button></div></header><div class="resources resource-bar" style="--resource-count:${stats.length + (wars.length ? 2 : 0)}" aria-label="National resources">${stats.map(([label, value, hint, negative]) => `<div class="${negative ? "negative" : ""}" data-resource="${esc(label)}" tabindex="0" aria-label="${esc(label + ": " + hint)}"><label>${label}</label><strong>${value}</strong><small class="resource-change ${changes[label]?.[1]<0?"negative":changes[label]?.[1]>0?"positive":""}">${changes[label]?.[0]||""}</small></div>`).join("")}${wars.length ? `<div class="resource-war" title="${esc(wars.map((w) => w.name + ": " + w.result + " · war balance " + num(w.score) + " = naval " + num(w.naval) + " + land " + num(w.land) + ". Naval balance values sunk tonnage + 35% damaged tonnage + 15% merchant GRT. Leading/trailing compares losses and land progress; it does not predict victory.").join(" · "))}"><label>AT WAR · BALANCE</label><strong>${wars.map((w) => w.opponent + " " + (w.result === "Leading" ? "↑" : w.result === "Trailing" ? "↓" : "↔")).join(" · ")}</strong></div>` : ""}</div>`;
}
