import { battleProgress } from "./battle-progress.mjs";
import { navalAircraftInventory } from "../mechanics/aircraft-inventory.mjs";
import { strategicFactor } from "../mechanics/strategic-materials.mjs";
import { basingText } from "../mechanics/aircraft-compatibility.mjs";
import { alertVisible } from "../mechanics/alert-lifecycle.mjs";
import { graduationProgress } from "../mechanics/personnel-training.mjs";
import {
  timedProgress,
  projectProgress,
  catalogCountdown,
} from "./progress-view.mjs";
import { contactAlerts } from "../mechanics/contact-alerts.mjs";
import { resultComposition } from "../mechanics/composition.mjs";
import { uiModel } from "../mechanics/queries.mjs";
import { upgradeLevel, facilityFactor, industryFactor, industryExpansion } from "../mechanics/levels.mjs";
import { merchantEconomy } from "../mechanics/merchant-economy.mjs";
import { PROGRAMS, economyFor } from "../mechanics/balance.mjs";
import { awaitingRecovery } from "../mechanics/recovery.mjs";
import {
  facilityBudget,
  aircraftSummary,
  aircraftModels,
  planeRole,
  aircraftPrice,
  aircraftBlock,
} from "../mechanics/naval-resources.mjs";
import {
  fleetSummary,
  supportSummary,
  affordability,
  projectBlock,
  projectPrice,
  yardLoad,
} from "../mechanics/engine.mjs";
import { capitalClock, campaignMinutes } from "../mechanics/campaign-clock.mjs";
import { PROFILES, REGIONS } from "../mechanics/catalog.mjs";
import { PORTS } from "../mechanics/world.mjs";
import { levelDescription, levelHint } from "../mechanics/research-tree.mjs";
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
const cost = (p) =>
  `${num(p.gold)} gold · ${num(p.influence)} influence · ${num(p.industry)} industry${p.strategic ? " · " + num(p.strategic) + " strategic" : ""}`;
export const reportTitle = (r) =>
  r.limitedIncident
    ? "Limited naval incident · " + (REGIONS[r.region]?.name || "Open sea")
    : r.kind === "port"
      ? (r.operation === "shore"
          ? "Coastal defense action"
          : r.operation === "siege"
            ? "Port siege"
            : "Anchorage raid") +
        " · " +
        (PORTS[r.portId]?.name || "Naval base")
      : (r.airOperation ? "Air attack · " : "Fleet engagement · ") +
        (REGIONS[r.region]?.name || "Open sea");
export const engagedComposition = (r, side) =>
  r.airOperation && side === "A"
    ? r.airOperation.strikes +
      " strike aircraft, " +
      r.airOperation.escorts +
      " escorts"
    : resultComposition(
        r["result" + side],
        "engaged",
        r.kind === "port" && side === "B"
          ? "Shore batteries & land-based aircraft"
          : r.airOperation?.merchantHulls
            ? "Merchant convoy"
            : "No warships recorded",
      );
export function casualtyView(n) {
  return (
    '<div class="casualty-ledger"><h3>Losses & recovery · campaign total</h3><table><thead><tr><th>Resource</th><th>Lost</th><th>Rescued / salvaged</th><th>Recovered</th><th>Awaiting return</th></tr></thead><tbody>' +
    ["sailors", "aviators", "aircraft"]
      .map((type) => {
        const r = n.casualties[type];
        return (
          "<tr><td>" +
          type +
          "</td><td>" +
          num(r.lost) +
          "</td><td>" +
          num(r.rescued) +
          "</td><td>" +
          num(r.recovered) +
          "</td><td>" +
          num(awaitingRecovery(n, type)) +
          "</td></tr>"
        );
      })
      .join("") +
    "</tbody></table><small>Lost means permanently lost. Rescued personnel return after recovery; salvaged aircraft return after repair. Historical losses before this campaign are excluded. </small></div>"
  );
}
export function resourcesView(s, c) {
  const n = s.nations[s.player],
    air = uiModel(s)?.air || aircraftSummary(s, c),
    models = aircraftModels(c, s.player),
    e = economyFor(s, s.player);
  const facilities = [
    [
      "industryFunding",
      "Naval industry",
      "industry",
      e.industryYear *
        industryFactor(s) *
        strategicFactor(n) *
        (n.industryOperating ?? 1),
      num(n.industry) +
        " industry stock · " +
        num(yardLoad(s, c).capacity * 365) +
        " t/year usable yards",
      null,
      null,
    ],
    [
      "aircraftFunding",
      "Aircraft factories",
      "aircraft_factory",
      economyFor(s, s.player).aircraftYear *
        facilityFactor(n.tech, "aircraft_factory", 0.35) * strategicFactor(n),
      num(air.total) +
        " aircraft · " +
        num(air.assigned) +
        " embarked · " +
        num(air.uncrewed) +
        " without complete crews",
      null,
      null,
    ],
    [
      "schoolFunding",
      "Naval schools",
      "school",
      n.crewYear,
      num(n.crew) + " trained sailors · complete crews required to sail",
      3,
      0.15,
    ],
    [
      "aviatorFunding",
      "Naval aviation schools",
      "pilots",
      n.aviatorsYear,
      num(n.aviators) +
        " aviators · " +
        num(air.aviatorsRequired) +
        " required for all owned aircraft",
      25,
      2,
    ],
  ];
  const spending = facilityBudget(s, c).rows;
  const cards = facilities
    .map(([field, title, key, output, summary, gold, industry]) => {
      const price = projectPrice(s, key),
        block = projectBlock(s, key) || affordability(n, price),
        work = n.projects.find((p) => p.key === key);
      return (
        '<article class="facility-card" data-program="' +
        key +
        '"><h3 title="' +
        esc(summary) +
        '">' +
        title +
        '</h3><label for="' +
        field +
        '">Funding · <b>' +
        num(n[field] * 100) +
        '%</b></label><input id="' +
        field +
        '" data-funding="' +
        field +
        '" type="range" min="10" max="100" step="10" value="' +
        n[field] * 100 +
        '" aria-label="' +
        title +
        ' funding" title="Controls operating output and cost. An already funded expansion continues at its own schedule."><div class="funding-labels"><span>10%</span><span>100%</span></div><p><strong>' +
        num(output * n[field]) +
        "</strong> / year funded capacity</p>" +
        (["school", "pilots"].includes(key)
          ? graduationView(s, n, key === "school" ? "sailors" : "aviators")
          : "") +
        '<div class="facility-spending" title="Planned operating use at current funding. Paid daily; shortages reduce output. Orders and expansions cost extra."><span>Gold / month <b>' +
        (spending.find((r) => r.key === key).gold ? "−" : "") +
        num(spending.find((r) => r.key === key).gold / 12) +
        "</b></span><span>Industry / month <b>" +
        (spending.find((r) => r.key === key).industry ? "−" : "") +
        num(spending.find((r) => r.key === key).industry / 12) +
        (spending.find((r) => r.key === key).strategic ? "</b></span><span>Strategic / month <b>−" + num(spending.find((r) => r.key === key).strategic / 12) : "") +
        "</b></span></div>" +
        '<div class="facility-expansion"><p class="facility-effect">' +
        PROGRAMS[key].effect + (key==='industry' ? '</p><p class="facility-bonus" title="Each completed expansion adds 15% of opening capacity. Two upgrades give +30%, not +32.25%. Merchant bonuses apply to positive hull growth only.">Since opening: +'+num((industryExpansion(s).multiplier-1)*100)+'% output, yards and positive hull growth · '+industryExpansion(s).upgrades+' upgrades'+(price.level<9?' · Next: +'+num((industryExpansion(s).multiplier-1+industryExpansion(s).rate)*100)+'%':'') : '') +
        '</p><strong title="' +
        esc(levelHint(key, price.level)) +
        '">Level ' +
        price.level +
        ' / 9</strong><p class="facility-next" title="' +
        esc(levelHint(key, price.level)) +
        '">' +
        esc(levelDescription(key, Math.min(9, price.level + 1))) +
        '</p><p class="expansion-cost">' +
        cost(price) +
        " · " +
        num(price.days) +
        " days</p>" +
        (work
          ? projectProgress(s, work)
          : '<button class="action-slot" data-action="project" data-id="' +
            key +
            '" ' +
            (block
              ? 'disabled data-disabled-reason="' + esc(block) + '"'
              : "") +
            ' title="' +
            esc(levelHint(key, price.level) + (block ? " " + block : "")) +
            '">' +
            (price.level >= 9
              ? "Maximum level"
              : "Expand to level " + (price.level + 1)) +
            "</button>") +
        "</div></article>"
      );
    })
    .join("");
  return (
    '<section class="panel production-panel"><div class="panel-title"><h2>Facilities</h2><span>Funding and expansion · levels 1–9</span></div><div class="facility-grid">' +
    cards +
    "</div></section>"
  );
}
function graduationView(s, n, type) {
  const p = graduationProgress(s, n, type);
  return (
    '<div class="school-graduation">' +
    timedProgress(s, p) +
    "<small>" +
    num(p.trainees) +
    " in training · funded daily</small></div>"
  );
}
export function aircraftCatalogView(s, c) {
  const n = s.nations[s.player],
    models = aircraftModels(c, s.player),
    inventory = new Map(navalAircraftInventory(s,c).map(r=>[r.model.id,r]));
  const lines =
    '<div class="production-lines">' +
    ["fighter", "strike", "scout"]
      .map((role) => {
        const choices = models.filter(
          (a) =>
            !aircraftBlock(s, c, a.id) &&
            n.aircraftUnlocked.includes(a.id) &&
            [role, "multirole"].includes(planeRole(a)),
        );
        return (
          "<label><span>" +
          role +
          '</span><select id="production-' +
          role +
          '" data-production="' +
          role +
          '" ' +
          (choices.length
            ? ""
            : 'disabled title="No developed ' +
              role +
              ' model is available. Develop an eligible model below."') +
          ">" +
          choices
            .map(
              (a) =>
                '<option value="' +
                a.id +
                '" ' +
                (n.productionModels[role] === a.id ? "selected" : "") +
                ">" +
                esc(a.name) +
                (a.name.includes(String(a.type_year))
                  ? ""
                  : " · " + a.type_year) +
                "</option>",
            )
            .join("") +
          "</select></label>"
        );
      })
      .join("") +
    "</div>";
  const catalog = [...models]
    .sort((a, b) => a.type_year - b.type_year || a.name.localeCompare(b.name))
    .map((a) => {
      const stock=inventory.get(a.id);
      const future = !!aircraftBlock(s, c, a.id),
        available = n.aircraftUnlocked.includes(a.id),
        order = n.airOrders.find((o) => o.model === a.id && o.development),
        price = aircraftPrice(s, c, a.id, 1, s.player, { development: true }),
        block = aircraftBlock(s, c, a.id) || affordability(n, price);
      return (
        '<article data-model="' +
        a.id +
        '" data-future="' +
        future +
        '"><span class="eyebrow">' +
        a.type_year +
        " · " +
        esc(planeRole(a)) +
        '</span><h3 tabindex="0" data-aircraft="' +
        a.id +
        '">' +
        esc(a.name) +
        "</h3><p>" +
        num(n.aircraft[a.id]) +
        " owned · <b>" + num(stock.reserve) + " reserve</b> · " +
        (a.crew?.normal || 1) +
        " aircrew each<br>" +
        num(a.fuel?.combat_radius_km) +
        " km combat radius<br><small>" +
        esc(basingText(a)) +
        "</small></p>" +
        (future
          ? catalogCountdown(s, a.type_year)
          : "<small>Production per aircraft: " +
            num(a.cost_gold) +
            " gold · " +
            num((a.weights?.empty_kg || 2500) / 80, 1) +
            " industry</small>" +
            (available
              ? '<span class="badge active">Production ready</span>'
              : order
                ? projectProgress(s, order)
                : "<p>" +
                  cost(price) +
                  "</p><small>Development: " +
                  price.days +
                  ' days after funding</small><button class="action-slot" data-action="air-design" data-id="' +
                  a.id +
                  '" ' +
                  (block
                    ? 'disabled data-disabled-reason="' + esc(block) + '"'
                    : "") +
                  ' title="' +
                  esc(block) +
                  '">' +
                  (aircraftBlock(s, c, a.id)
                    ? "Available 1 Jan " + a.type_year
                    : "Develop aircraft model") +
                  "</button>")) +
        (stock.replacement ? '<button class="action-slot" data-action="retire-aircraft" data-id="'+a.id+'" '+
          (stock.block?'disabled data-disabled-reason="'+esc(stock.block)+'"':'')+' title="'+
          esc(stock.block || 'Retire '+num(stock.retireable)+' reserve airframes. Embarked, stationed and in-transit aircraft remain in service. Aviators are retained.')+'">Retire reserve airframes</button>':'') +
        "</article>"
      );
    })
    .join("");
  const production =
    '<section class="aircraft-production"><div class="panel-title"><h2>Aircraft production</h2><button data-action="open-aircraft-designer" title="Choose power, weapons, armor and features; calculated weight, speed and cost.">New aircraft draft</button><span title="Factory capacity is shared equally among selected role lines. Actual output also requires gold and industry.">' +
    num(
      economyFor(s, s.player).aircraftYear *
        facilityFactor(n.tech, "aircraft_factory", 0.35) *
        n.aircraftFunding,
    ) +
    " / year · " +
    num(n.aircraftFunding * 100) +
    '% funding</span><button data-action="view" data-view="programs" title="Set factory funding or expand aircraft factories in Facilities & research.">Factory funding & expansion</button></div>' +
    lines +
    "</section>";
  const government = (c.nations[s.player].armyAircraft || [])
    .map((a) => {
      const future = a.type_year > new Date(s.day * 86400000).getUTCFullYear();
      return (
        '<article data-government-model="' +
        a.id +
        '"><span class="eyebrow">' +
        a.type_year +
        " · Government " +
        esc(a.role.replaceAll("_", " ")) +
        '</span><h3 tabindex="0" data-aircraft="' +
        a.id +
        '">' +
        esc(a.name) +
        "</h3><p>" +
        num(n.governmentAircraft?.[a.id]) +
        " aircraft · " +
        a.crew.normal +
        " crew each<br>" +
        num(a.fuel.combat_radius_km) +
        " km combat radius<br><small>Shore operation only</small></p>" +
        (future
          ? catalogCountdown(s, a.type_year)
          : '<span class="badge">Government managed</span>') +
        "</article>"
      );
    })
    .join("");
  return (
    '<section class="panel aircraft-catalog">' +
    production +
    '<p class="panel-note">Newer qualified aircraft replace older wings of the same role in port. Aircraft ferry between reachable bases and carriers; distant reinforcements travel by merchant transport. Replaced aircraft enter local reserve.</p><div class="aircraft-models">' +
    catalog +
    '</div><details class="government-aircraft" data-detail-key="government-aircraft"><summary>Army, shore & strategic aircraft</summary><p class="panel-note">National service types selected at three-year equipment reviews. Patrols, maritime strikes, fighters and strategic bombers operate automatically. Government establishments occupy 25% of base slots, use separate crews, and replace losses monthly at home. Reinforcements must ferry or travel by safe merchant route; national strategic materials limit operations. No ministry production orders.</p><div class="aircraft-models">' +
    government +
    "</div></details></section>"
  );
}
export function conditionList(result) {
  return (result?.conditions || [])
    .map(
      (g) =>
        `<div class="condition-line ${esc(g.severity)}"><span>${esc(g.type)} · ${esc(g.name)}</span><b>${g.sunk ? `${g.sunk} ${esc(g.type)} sunk${g.count > g.sunk ? " · survivors " + g.damage + "% damage" : ""}` : `${g.damage}% damage`}</b><small>${g.returning ? "Must return for repair" : g.severity === "moderate" ? "Can remain in the field" : g.severity === "sunk" ? "Lost" : "Operational"}</small></div>`,
    )
    .join("");
}
export function battleDetails(r, s=null) {
  return `${battleProgress(r,s?campaignMinutes(s):r.minute)}${r.merchantHulls ? "<p>Merchant losses: "+r.merchantHulls+" hulls / "+num(r.merchantGRT)+" GRT.</p>" : ""}${r.industryRaid ? "<p><strong>Strategic bombing</strong> · " + esc(r.industryRaid.category) + " disruption " + num(r.industryRaid.damage * 100, 2) + " percentage points. Damaged production recovers through funded repairs.</p>" : ""}${r.airOperation ? '<p class="air-operation-result"><strong>' + esc(r.airOperation.source) + " · " + esc(r.airOperation.light) + " / " + esc(r.airOperation.weather) + "</strong><br>" + r.airOperation.strikes + " strike aircraft + " + r.airOperation.escorts + " escorts; " + r.airOperation.cap + " defending CAP fighters. " + r.airOperation.assembly + " min assembly · " + num(r.airOperation.distanceKm) + " km outbound · 90 min rearm after recovery." + (r.airOperation.surprise ? " Anchorage surprised." : "") + (r.airOperation.merchantHulls ? "<br>" + r.airOperation.merchantHulls + " merchant hulls / " + num(r.airOperation.merchantGRT) + " GRT sunk." : "") + "</p>" : ""}${r.kind === "port" ? '<p class="port-result">' + esc(r.operation === "strategic" ? "Strategic air raid" : r.operation === "opening" ? "Pacific opening strike" : r.operation === "shore" ? "Shore defense action" : r.operation === "siege" ? "Port siege" : "Anchorage raid") + " · Port condition " + num(r.portHealth * 100) + "% · " + num(r.portDamage * 100) + " percentage points reduced</p>" : ""}<div class="battle-sides">${[
    ["A", r.a],
    ["B", r.b],
  ]
    .map(([side, id]) => {
      const result = r["result" + side];
      return `<section><h3 style="color:${PROFILES[id].color}">${PROFILES[id].name}</h3><p class="engaged-composition"><strong>Engaged: ${r.airOperation && side === "A" ? r.airOperation.strikes + " strike aircraft, " + r.airOperation.escorts + " escorts" : engagedComposition(r, side)}</strong></p><p>Sunk: ${resultComposition(result, "sunk", "No ships lost")} · Damaged: ${resultComposition(result, "damaged", "No new ship damage")} · ${num(result.tons)} t sunk · ${num(result.damagedTons)} t damage equivalent</p><small>${result.sailorsLost === undefined ? "Earlier report: personnel and rescue breakdown unavailable.<br>" : ""}${num(result.sailorsLost)} sailors lost · ${num(result.sailorsRescued)} rescued<br>${num(result.aviatorsLost)} aviators lost · ${num(result.aviatorsRescued)} rescued<br>${num(result.planesLost)} aircraft lost${result.governmentPlanesLost ? " (including " + num(result.governmentPlanesLost) + " other-service)" : ""} · ${num(result.planesRescued)} salvaged for repair</small><div class="condition-scroll" data-scroll-key="conditions-${r.id}-${side}">${conditionList(result) || (r.kind === "port" && side === "B" ? "<p>Coastal facilities and shore aviation defended the anchorage. Port damage is recorded above.</p>" : "<p>No individual ship damage entries.</p>")}</div></section>`;
    })
    .join(
      "",
    )}</div><p class="panel-note">Red: serious damage, return for repair. Yellow: moderate damage, can stay in the field. Victory grade compares sunk tonnage and damage inflicted on surviving hulls.</p>`;
}
export function alertItems(s) {
  const alerts = (s.alerts || []).filter(
    (a) =>
      alertVisible(s, a) &&
      (a.global || !a.a || [a.a, a.b].includes(s.player)) &&
      !s.decisions.some((d) => d.key === a.popupKey),
  );
  const dispatches = s.log
    .filter(
      (l) =>
        alertVisible(s, l) &&
        !(s.alerts || []).some(
          (a) =>
            Math.abs(a.minute - (l.minute || l.day * 1440)) < 1 &&
            ((a.body || "").includes(l.text) || l.kind === a.kind),
        ),
    )
    .map((l) => ({
      id: "dispatch-" + l.id,
      minute: l.minute ?? l.day * 1440,
      title: l.text.length > 65 ? l.text.slice(0, 62) + "…" : l.text,
      body: l.text,
      kind: l.kind,
      dispatch: true,
    }));
  return [...alerts, ...dispatches, ...contactAlerts(s)].sort(
    (a, b) => b.minute - a.minute,
  );
}
export function alertsView(s, c, selected, reading = null) {
  const list = alertItems(s),
    decisions = s.decisions;
  const d = decisions.find((d) => !d.popup && d.key === selected),
    a =
      (reading &&
      !["contact", "land", "battle"].includes(reading.kind) &&
      String(reading.id) === String(selected) &&
      list.some((a) => String(a.id) === String(selected))
        ? reading
        : null) || list.find((a) => String(a.id) === String(selected));
  let detail = "";
  if (d) {
    const clock = d.deadline ? capitalClock(s, s.player, d.deadline) : null;
    detail = `<span class="eyebrow">${d.critical ? "ACTION REQUIRED" : "CABINET ADVICE"}</span><h2>${esc(d.title)}</h2><p>${esc(d.body)}</p>${clock ? `<p class="deadline"><strong>Deadline: ${clock.date} ${clock.time} · ${clock.zone}</strong><br>If ignored: ${esc(d.defaultText)}</p>` : ""}<div class="decision-options inline-options">${d.options
      .map((o) => {
        const price = o.program
            ? projectPrice(s, o.program)
            : {
                gold: o.gold || 0,
                influence:
                  (o.influence || 0) +
                  (d.key === "expiry" && o.id === "renew" ? 30 : 0),
                industry: o.industry || 0,
              },
          block =
            (o.program ? projectBlock(s, o.program) : "") ||
            affordability(s.nations[s.player], price);
        return `<button data-action="choose" data-key="${d.key}" data-id="${o.id}" ${block ? "disabled" : ""} title="${esc(block)}"><strong>${esc(o.label)}</strong><span>${esc(o.detail)}</span>${block ? `<small>${esc(block)}</small>` : ""}</button>`;
      })
      .join(
        "",
      )}</div><button data-action="dismiss-alert" data-id="${d.key}" class="subtle">${d.critical ? "Dismiss and apply default…" : "Dismiss advice"}</button>`;
  } else if (a) {
    const report =
      a.report || (a.reportId && s.reports.find((r) => r.id === a.reportId));
    detail = `<span class="eyebrow">${esc(a.kind)} · ${capitalClock(s, s.player, a.minute).date} ${capitalClock(s, s.player, a.minute).time}</span><h2>${esc(a.title)}</h2><p>${esc(a.body)}</p>${report ? battleDetails(report,s) : ""}${a.contactId ? '<p class="panel-note">This alert expires after 48 hours without an update.</p><button data-action="locate-contact" data-id="' + a.contactId + '">Locate on chart</button> ' : ""}<button data-action="dismiss-alert" data-id="${a.id}" class="subtle">Dismiss alert</button>`;
  }
  const critical = decisions.filter((d) => d.critical).length,
    recent = new Set(list.filter((a) => !a.contactId).slice(0, 12)),
    rail = list.filter(
      (a) =>
        a.contactId || (a.frontId && a.resolvedAt == null) || recent.has(a),
    );
  return `<div class="alert-rail" aria-label="Admiralty alerts"><span class="alert-heading ${critical ? "urgent" : ""}">${critical ? critical + " ACTION REQUIRED" : "ALERTS"}</span><div class="alert-chips" data-scroll-key="alert-chips">${decisions.map((d) => `<span class="alert-chip"><button class="${d.critical ? "critical" : ""} ${selected === d.key ? "selected" : ""}" data-action="open-alert" data-id="${d.key}">${d.critical ? "! " : ""}${esc(d.title)}${d.deadline ? " · " + num(Math.max(0, (d.deadline - campaignMinutes(s)) / 60)) + "h left" : ""}</button><button class="dismiss-chip" data-action="dismiss-alert" data-id="${d.key}" aria-label="Dismiss ${esc(d.title)}">×</button></span>`).join("")}${rail.map((a) => `<span class="alert-chip"><button class="${a.ongoing ? "ongoing" : a.kind === "battle" && a.winner ? (a.winner === s.player ? "won" : "lost") : ""} ${String(selected) === String(a.id) ? "selected" : ""}" data-action="open-alert" data-id="${a.id}">${esc(a.title)}</button><button class="dismiss-chip" data-action="dismiss-alert" data-id="${a.id}" aria-label="Dismiss ${esc(a.title)}">×</button></span>`).join("")}${!decisions.length && !list.length ? "<span>No outstanding alerts</span>" : ""}</div><button data-action="clear-alerts" title="Clear optional alerts; mandatory decisions remain">Clear all optional</button><button data-action="alert-history" title="View the alert history">${list.length} alerts</button></div>${detail ? `<section class="alert-detail" data-key="alert-${selected}" data-scroll-key="alert-detail" ${a && !["contact", "land", "battle"].includes(a.kind) ? 'data-preserve="true"' : ""} aria-live="polite"><button data-action="close-alert" class="close" aria-label="Collapse alert">×</button>${detail}</section>` : ""}`;
}
export function weaponDetails(c, content) {
  const raw = c.raw || {},
    rows = (raw.batteries || []).map((b) => {
      const eq = { ...(content.equipment[b.component] || {}), ...b.spec },
        caliber =
          eq.caliber_mm ||
          eq.bore_mm ||
          eq.caliber_cm * 10 ||
          eq.bore_cm * 10 ||
          eq.caliber_in * 25.4 ||
          eq.bore_in * 25.4 ||
          (b.role === "main" ? c.caliber : 0),
        quantity = b.tubes || (b.mounts || 1) * (b.barrels_per_mount || 1);
      return `<tr><td>${esc(b.role.replaceAll("_", " "))}</td><td>${esc(eq.name || b.component || "Cataloged mount")}${caliber ? " · " + num(caliber, 1) + " mm" : ""}</td><td>${quantity}${b.tubes ? " tubes" : " barrels / fittings"}</td><td>${b.stowage ? num(b.stowage) + " carried" : b.rounds_per_gun ? num(b.rounds_per_gun) + " rounds / gun" : "—"}${b.optional ? " · optional" : ""}</td></tr>`;
    });
  for (const b of raw.armament?.aa_battery || [])
    rows.push(
      `<tr><td>Anti-aircraft</td><td>${num(b.caliber_mm, 1)} mm ${esc(b.mounts || "")}</td><td>${num(b.count)} barrels</td><td>${b.rounds_per_gun ? num(b.rounds_per_gun) + " rounds / gun" : "—"}</td></tr>`,
    );
  return `${rows.length ? `<h3 class="spaced">Class weapons</h3><div class="table-scroll"><table><thead><tr><th>Role</th><th>Weapon</th><th>Quantity</th><th>Ammunition</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>` : ""}${raw.protection?.features?.length ? '<h3 class="spaced">Protection</h3><p>' + raw.protection.features.map(esc).join(" · ") + "</p>" : ""}${raw.sensors?.length ? '<h3 class="spaced">Fitted sensors</h3><p>' + raw.sensors.map((id) => esc(content.equipment[id]?.name || id)).join(" · ") + "</p>" : ""}`;
}
