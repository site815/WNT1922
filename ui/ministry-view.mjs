import { recognitionCard } from "./recognition.mjs";
import { aircraftDescription, aircraftSpeed } from "./catalog-presentation.mjs";
import { NewsTicker } from "./news-ticker.mjs";
import { diplomaticOfferAlert } from './diplomatic-offers-view.mjs';
import { battleProgress } from "./battle-progress.mjs";
import { navalAircraftInventory } from "../mechanics/aircraft-inventory.mjs";
import { currentGovernmentModels } from "../mechanics/government-aviation.mjs";
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
        PROGRAMS[key].effect + (key==='industry' ? '</p><p class="facility-bonus" title="Each completed expansion adds 15% of opening capacity. Two upgrades give +30%, not +32.25%. Civilian production applies this bonus after its shortage and logistics factors.">Since opening: +'+num((industryExpansion(s).multiplier-1)*100)+'% output, yards and civilian hull production · '+industryExpansion(s).upgrades+' upgrades'+(price.level<9?' · Next: +'+num((industryExpansion(s).multiplier-1+industryExpansion(s).rate)*100)+'%':'') : '') +
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
            [role, "multirole"].includes(planeRole(a)),
        );
        return (
          '<div class="production-line"><label><span>' +
          role +
          '</span><select id="production-' +
          role +
          '" data-production="' +
          role +
          '" ' +
          (choices.length
            ? ""
            : 'disabled title="No available ' +
              role +
              ' model yet. Catalog models become ready automatically on their listed date."') +
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
          '</select></label><label class="production-auto" title="Automatically select the newest available model for this role. Choosing a model manually turns this off for this line."><input type="checkbox" data-production-automatic="' + role + '" ' + (n.productionAutomatic[role] ? 'checked' : '') + '>Auto · newest model</label></div>'
        );
      })
      .join("") +
    "</div>";
  const catalog = [...models]
    .filter(a => !inventory.get(a.id).replacement)
    .sort((a, b) => a.type_year - b.type_year || a.name.localeCompare(b.name))
    .map((a) => {
      const stock=inventory.get(a.id);
      const future = !!aircraftBlock(s, c, a.id);
      const speed = aircraftSpeed(a);
      return (
        '<article data-model="' +
        a.id +
        '" class="catalog-card" data-future="' +
        future +
        '"><h3><button class="text-button" data-action="aircraft-spec" data-id="' + a.id + '" data-aircraft="' +
        a.id +
        '">' +
        esc(a.name) +
        '</button></h3><p class="catalog-description">' + esc(aircraftDescription(a)) + '</p>' +
        recognitionCard("aircraft", a.id, { compact: true, campaign: s.campaignId }) +
        '<dl class="catalog-stats"><div><dt>Owned / reserve</dt><dd>' + num(n.aircraft[a.id]) + ' / ' + num(stock.reserve) +
        '</dd></div><div><dt>Aircrew per aircraft</dt><dd>' + (a.crew?.normal || 1) +
        '</dd></div><div><dt>' + speed.label + '</dt><dd>' + num(speed.value) + ' km/h' +
        '</dd></div><div><dt>Combat radius</dt><dd>' + num(a.fuel?.combat_radius_km) + ' km' +
        '</dd></div><div><dt>Basing</dt><dd>' + esc(basingText(a)) + '</dd></div></dl>' +
        (future
          ? catalogCountdown(s, a.type_year)
          : '<p class="catalog-unit-cost">Production per aircraft: <strong>' +
            num(a.cost_gold) +
            " gold · " +
            num((a.weights?.empty_kg || 2500) / 80, 1) +
            " industry</strong></p>" +
            '<span class="badge active" title="Available automatically from 1 January ' + a.type_year + '. Select it in a production line above.">Production ready</span>') +
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
  const currentGovernment = new Set(currentGovernmentModels(s,c,s.player).map(a=>a.id));
  const government = (c.nations[s.player].armyAircraft || [])
    .filter(a => currentGovernment.has(a.id) || a.type_year > new Date(s.day*86400000).getUTCFullYear())
    .map((a) => {
      const future = a.type_year > new Date(s.day * 86400000).getUTCFullYear();
      const speed = aircraftSpeed(a);
      return (
        '<article data-government-model="' +
        a.id +
        '" class="catalog-card"><h3><button class="text-button" data-action="aircraft-spec" data-id="' + a.id + '" data-aircraft="' +
        a.id +
        '">' +
        esc(a.name) +
        '</button></h3><p class="catalog-description">' + esc(aircraftDescription(a, { government: true })) + '</p>' +
        recognitionCard("aircraft", a.id, { compact: true, campaign: s.campaignId }) +
        '<dl class="catalog-stats"><div><dt>Government inventory</dt><dd>' + num(n.governmentAircraft?.[a.id]) + ' aircraft' +
        '</dd></div><div><dt>Aircrew per aircraft</dt><dd>' + (a.crew?.normal || 1) +
        '</dd></div><div><dt>' + speed.label + '</dt><dd>' + num(speed.value) + ' km/h' +
        '</dd></div><div><dt>Combat radius</dt><dd>' + num(a.fuel?.combat_radius_km) + ' km' +
        '</dd></div><div><dt>Production control</dt><dd>Government managed</dd></div></dl>' +
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
    catalog + '</div>' +
    ([...inventory.values()].some(r=>r.replacement&&r.owned)?'<details class="superseded-aircraft"><summary>Superseded naval aircraft</summary><p class="panel-note">Retire reserves keeps deployed aircraft in service. Retire all removes this model from ships, bases, flights and transfers. Aviators are retained.</p>'+
      [...inventory.values()].filter(r=>r.replacement&&r.owned).map(r=>
        '<div class="retired-model-row"><span data-aircraft="'+r.model.id+'">'+esc(r.model.name)+' · '+num(r.owned)+' owned / '+num(r.reserve)+' reserve / '+num(r.embarked+r.ashore+r.transit)+' in service or transit</span>'+
        '<button data-action="retire-aircraft" data-id="'+r.model.id+'" '+(r.block?'disabled data-disabled-reason="'+esc(r.block)+'"':'')+' title="'+esc(r.block||'Retire '+num(r.retireable)+' available reserve airframes; keep deployed aircraft and aviators.')+'">Retire reserves</button>'+
        '<button data-action="retire-aircraft-all" data-id="'+r.model.id+'" '+(r.allBlock?'disabled data-disabled-reason="'+esc(r.allBlock)+'"':'')+' title="'+esc(r.allBlock||'Retire all '+num(r.owned)+' airframes, including aircraft in service or transit; retain aviators.')+'">Retire all</button></div>').join('')+'</details>':'') +
    '<details class="government-aircraft" data-detail-key="government-aircraft"><summary>Army, shore & strategic aircraft</summary><p class="panel-note">Only current and genuinely future government models are listed. An unchanged model continues in service; it is not redeveloped every three years. Superseded grounded aircraft retire immediately; flights and shipments retire on return. Patrols, maritime strikes, fighters and strategic bombers operate automatically. Government establishments occupy 25% of base slots, use separate crews, and replace losses monthly at home. Reinforcements must ferry or travel by safe merchant route; national strategic materials limit operations. No ministry production orders.</p><div class="aircraft-models">' +
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
            ((l.reportId != null && l.reportId === a.reportId) ||
              (a.body || '').includes(l.text) || l.text === a.title + '. ' + a.body),
        ),
    )
    .map((l) => ({
      id: "dispatch-" + l.id,
      minute: l.minute ?? l.day * 1440,
      title: l.text.length > 65 ? l.text.slice(0, 62) + "…" : l.text,
      body: l.text,
      kind: l.kind,
      dispatch: true,
      shipId: l.shipId,
      programKey: l.programKey,
      reportId: l.reportId,
      newsView: l.newsView,
    }));
  return [...alerts, ...dispatches, ...contactAlerts(s)].sort(
    (a, b) => b.minute - a.minute,
  );
}
export function alertsView(s, c, ticker = new NewsTicker(() => {})) {
  const pending = s.decisions.filter(d=>d.deferred);
  const buttons = pending.length ? '<div class="pending-decisions" aria-label="Pending choices">'+pending.map(d=>{
    const due=capitalClock(s,s.player,d.deadline);
    return '<button class="pending-decision" data-action="reopen-decision" data-key="'+esc(d.key)+'" title="'+esc(d.title+'. Due '+due.date+' '+due.time+'. If ignored: '+d.defaultText)+'"><strong>'+esc(d.title)+'</strong><small>Due '+esc(due.date)+'</small></button>';
  }).join('')+'</div>' : '';
  const watchable = s.reports.filter(r => r.status === 'ongoing' && r.decisive?.qualifies && [r.a,r.b].includes(s.player) && r.replay?.frames?.length);
  const battleAlert = watchable.length ? '<div class="decisive-alert"><button data-action="watch-battle" data-id="'+watchable[0].id+'" title="Open the viewer and pause the campaign. Next tick advances the whole campaign by 15 minutes.">Watch battle · '+esc(REGIONS[watchable[0].region]?.name || watchable[0].region)+'</button>'+(watchable.length > 1 ? '<button data-action="view" data-view="reports">'+watchable.length+' decisive actions</button>' : '')+'</div>' : '';
  return ticker.markup(alertItems(s),battleAlert+diplomaticOfferAlert(s)+buttons);
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
