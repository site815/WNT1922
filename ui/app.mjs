import { navalRecordView } from "./naval-record.mjs";
import { NewsTicker } from "./news-ticker.mjs";
import { battleProgress } from "./battle-progress.mjs";
import { SCORE_NAVAL_TONS_PER_POINT } from '../mechanics/campaign-impact.mjs';
import { politicalPopup } from "./diplomacy-popup.mjs";
import { bulkPlan } from "../mechanics/bulk-fleet.mjs";
import { resourceHover } from "./resource-breakdown.mjs";
import { MapMotion } from "./map-motion.mjs";
import { chartPosition, centerChart, chartCoordinates } from "./map-focus.mjs";
import { landView, strategicAirView } from "./land-view.mjs";
import {
  levelDescription,
  levelHint,
  researchOrder,
} from "../mechanics/research-tree.mjs";
import {
  diplomacyView as governmentView,
  diplomaticHint,
} from "./diplomacy-view.mjs";
import { yardCapacityChart } from "./yard-view.mjs";
import {
  timedProgress,
  projectProgress,
  catalogCountdown,
} from "./progress-view.mjs";
import { updateDOM } from "./dom-update.mjs";
import { installView, uiModel } from "../mechanics/queries.mjs";
import { resultComposition } from "../mechanics/composition.mjs";
import {
  aircraftHover,
  classHover,
  shipDetails,
  mapHover,
  fleetReadinessHover,
  fleetCompositionHover,
} from "./inspection-view.mjs";
import { RULES } from "../mechanics/balance.mjs";
import { topBars } from "./top-bars.mjs";
import { compareShips, fullyStaffed } from "../mechanics/ship-staffing.mjs";
import {
  musicPlayback,
  musicContext,
  musicSettings,
  unlockMusic,
  nextTrack,
  musicStatus,
  musicCredits,
} from "./music.mjs";
import { GAME_VERSION } from "../mechanics/version.mjs";
import { SimulationClient } from "./simulation-client.mjs";
import { merchantEconomy } from "../mechanics/merchant-economy.mjs";
import { warBalances } from "../mechanics/war-balance.mjs";
import { economyView, warView } from "./economy-view.mjs";
import {
  NATION_ORDER,
  PROFILES,
  REGIONS,
  TYPES,
  SERVICES,
  fleetService,
} from "../mechanics/catalog.mjs";
import {
  commandView as worldCommandView,
  fleetComposition,
} from "./command-view.mjs";
import { POLITICAL, POLITICAL_1922 } from "../worker/map-assets.mjs";
import {
  SPEEDS,
  productionBlock,
  aircraftSummary,
} from "../mechanics/naval-resources.mjs";
import {
  resourcesView,
  aircraftCatalogView,
  alertsView,
  alertItems,
  battleDetails,
  reportTitle,
  engagedComposition,
  weaponDetails,
  casualtyView,
} from "./ministry-view.mjs";
import {
  soundSettings,
  unlockSound,
  playSound,
  createSoundTracker,
} from "./sound.mjs";
import { capitalClock, campaignMinutes } from "../mechanics/campaign-clock.mjs";
import {
  fleetPosition,
  fleetStats,
  visibleContacts,
} from "../mechanics/task-forces.mjs";
import { mapPoint, wrapLongitude } from "./projection.mjs";
import {
  contentFor,
  campaignList,
  DEFAULT_CAMPAIGN,
} from "../mechanics/campaign-content.mjs";
import { automaticDraft } from "../mechanics/designer.mjs";
import { automaticAircraftDraft } from "../mechanics/aircraft-designer.mjs";
import { designerView } from "./designer-view.mjs";
import { PROGRAMS } from "../mechanics/balance.mjs";
import * as sim from "../mechanics/engine.mjs";
import {
  validateSave,
  exportSave,
  saveFileName,
} from "../mechanics/state-io.mjs";
import { saveCampaign, loadCampaign, writeRecovery } from "./save-client.mjs";
import { CATALOG } from "../worker/catalog-loader.mjs";

const app = document.querySelector("#app");
const newsTicker = new NewsTicker((id, receipt) => { if(state) void mutate({type:"read-news",args:{id,receipt}}, "", true); });
let fleetSelection = new Set();
let fleetSearch = "",
  viewPages = {},
  rendering = false,
  renderPending = false;
let chart = { zoom: 1, cx: 600, cy: 300, rotation: 0 };
let selectedAlert = null,
  drag = null,
  suppressClickUntil = 0,
  mapFrame = 0,
  readingAlert = null,
  simMetrics = { actual: 0, ratio: 1 };

function reportDate(r) {
  if (r.minute === undefined) return smallDate(r.day);
  const c = capitalClock(state, state.player, r.minute);
  return `${c.date} · ${c.time}`;
}
let bundle,
  selectedCampaign = DEFAULT_CAMPAIGN,
  draft = null;
let content,
  state = null,
  saved = null,
  view = "command",
  selected = "JPN",
  dialog = null,
  toastTimer,
  saveTimer,
  lastRender = 0,
  lastSaveDay = null,
  saveStatus = "Ready to save",
  fleetFilter = "all",
  designFilter = "all";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const number = (v, d = 0) =>
  Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: d });
const signed = (v) => `${v >= 0 ? "+" : "−"}${number(Math.abs(v))}`;
const percent = (v) => `${number(v * 100)}%`;
const months = (days) => `${number(days / 30, 1)} mo`;
const player = () => state.nations[state.player];
const smallDate = (day) => sim.dateText(day);
const cost = (p) =>
  `<span class="cost gold">${number(p.gold)} gold</span><span class="cost influence">${number(p.influence)} influence</span><span class="cost steel">${number(p.industry)} industry</span>${p.strategic ? `<span class="cost">${number(p.strategic)} strategic</span>` : ""}`;
const meter = (value, color = "var(--green)") =>
  `<span class="meter"><i style="width:${sim.clamp(value, 0, 100)}%;background:${color}"></i></span>`;
const btn = (label, action, attrs = "", disabled = "") =>
  `<button data-action="${action}" ${attrs} ${disabled ? `disabled data-disabled-reason="${esc(disabled)}"` : ""} ${disabled && !attrs.includes("title=") ? `title="${esc(disabled)}"` : ""}>${label}</button>`;
const statusBadge = (status) =>
  `<span class="badge ${["active", "reserve", "war", "building"].includes(status) ? status : ""}">${esc(status)}</span>`;

const soundTracker = createSoundTracker();
const mapMotion = new MapMotion({
  root: app,
  chart: () => chart,
  active: () => !!state && ["command", "land", "airwar"].includes(view),
});
const simulation = new SimulationClient({
  onState: receiveSimulation,
  onError: (message) => {
    if (state) state.paused = true;
    toast(message);
    if (state) liveRender();
  },
});
function receiveSimulation(next, metrics, model) {
  installView(next, model);
  const wasPaused = state?.paused,
    priorReason = state?.pauseReason;
  state = next;
  content = contentFor(bundle, state);
  simMetrics = metrics || simMetrics;
  const now = performance.now();
  mapMotion.accept(state, now);
  musicPlayback(!state.paused);
  musicContext(state);
  soundSettings(state.audioEnabled, state.audioVolume);
  const cue = soundTracker.next(state);
  if (cue) playSound(cue);
  if (state.paused && state.pauseReason && state.pauseReason !== priorReason)
    selectedAlert = state.pauseReason;
  if (lastSaveDay !== null && state.day - lastSaveDay >= 30) {
    lastSaveDay = state.day;
    scheduleSave();
  }
  if (now - lastRender > 1000 || wasPaused !== state.paused) {
    liveRender();
    lastRender = now;
  }
}
try {
  bundle = CATALOG;
  content = contentFor(bundle, selectedCampaign);
  try {
    saved = await loadCampaign(bundle);
    if (saved?.recoveredSave)
      toast(
        "Recovered your campaign from a newer local journal or the previous disk save.",
      );
  } catch (error) {
    toast(error.message);
  }
  renderStart();
} catch (error) {
  app.innerHTML = `<main class="start"><h1>The ministry could not open.</h1><p>${esc(error.message)}</p><p>Close this page and run Play-WNT1922.cmd again.</p></main>`;
}
function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.style.display = "none"), 6000);
}
function renderStart() {
  app.innerHTML = `<main class="start"><header class="masthead"><span class="wordmark">WNT<span>1922</span></span><span class="tag">v${GAME_VERSION} · SINGLE PLAYER · LOCAL SAVE</span></header><div class="start-heading"><div class="scenario-choices" aria-label="Starting campaign">${campaignList(
    bundle,
  )
    .map(
      (c) =>
        `<button data-action="select-campaign" data-id="${c.id}" class="${c.id === selectedCampaign ? "selected" : ""}"><strong>${esc(c.title)}</strong><span>${c.start} · ${c.id === "campaign_1922" ? "Historical opening navies" : "Seven alternate naval programs"}</span></button>`,
    )
    .join(
      "",
    )}</div><h1>${esc(content.scenario.title)}<span>.</span></h1><p>${esc(content.scenario.description)}</p></div>${saved ? `<div class="resume"><div><strong>${PROFILES[saved.player].name} · ${smallDate(saved.day)}</strong><span>Your saved campaign will resume paused.</span></div>${btn("Continue campaign", "continue")}</div>` : ""}<div class="nation-grid">${NATION_ORDER.map(
    (id) => [id, content.nations[id]],
  )
    .map(([id, p]) => {
      const s = sim.fleetSummary(sim.newGame(content, id), content, id);
      return `<button class="nation-card ${selected === id ? "selected" : ""}" data-action="select-nation" data-id="${id}" style="--nation:${p.color}"><span class="nation-code">${id}</span><span class="nation-name">${p.name}</span><strong>${p.title}</strong><p>${p.description}</p><div class="nation-stats"><span><b>${s.active}</b> active warships</span><span><b>${s.building}</b> warships building</span><span><b>${number(content.nations[id].merchants.hulls)}</b> merchant hulls</span><span><b>${number(content.nations[id].support.reduce((v, g) => v + g.count, 0))}</b> support hulls cataloged</span></div><span class="card-link">${selected === id ? "Selected" : "Select ministry"}<span>${selected === id ? "✓" : "↗"}</span></span></button>`;
    })
    .join(
      "",
    )}</div><div class="start-actions"><div><strong>${selectedCampaign === "campaign_1922" ? "Seven historical starting navies" : "All seven naval programs active"}</strong><p>Historical events shape the world. Invest now in the fleet you will need.</p></div>${btn(`Take command of ${PROFILES[selected].name} →`, "new", 'class="primary"')}</div><footer class="start-footer"><span>10,000× normal time · A year takes about 53 minutes · Pause and faster speeds available</span></footer><div class="start-bottom">${btn("Import a campaign", "import")}<a href="/assets/licenses/third-party-notices.html" target="_blank" rel="noreferrer">Licenses & credits</a><span>Ship data from your catalogs. Provisional playtest balance.</span></div></main>${modalHTML()}`;
}
function render() {
  // Removing a focused edited input can synchronously fire change/blur. Defer
  // the resulting render until the current DOM replacement has completed.
  if (rendering) {
    renderPending = true;
    return;
  }
  rendering = true;
  try {
    renderPass();
  } finally {
    rendering = false;
    if (renderPending) {
      renderPending = false;
      queueMicrotask(render);
    }
  }
}
const CONTROL_HINTS = {
  save: "Save this campaign to this computer.",
  menu: "Open campaign files, help and display options.",
  pause: "Pause or resume time. Space also pauses when no control is focused.",
  project:
    "Commit resources now; the program completes after its development time.",
  develop: "Fund the design before ordering this class.",
  order:
    "Choose hull quantity and review the shared yard load before committing resources. Fleet support ships (AO) are in this catalog.",
  reserve:
    "Order an active ship home to enter reserve, or recommission a reserve hull.",
  scrap:
    "Return to port and permanently scrap these hulls for a small industry salvage return.",
  cancel:
    "Cancel this construction order; recover half of its unspent gold and industry.",
  "generate-draft":
    "Suggest a fit for this year, scenario, ship role and your fleet missions. This changes the draft only; no gold is spent.",
  "commission-draft":
    "Pay the drafting fee and register this design for construction.",
  "fleet-order":
    "Transmit the selected mission. Admirals choose routes, targets and engagements.",
  "clear-alerts": "Clear optional notices only; mandatory decisions remain.",
  "step-minute": "Advance one fifteen-minute simulation tick.",
  "step-six-hours": "Advance six simulated hours. Available while paused.",
};
function renderPass() {
  if (!state) {
    mapMotion.refresh();
    newsTicker.reset();
    renderStart();
    return;
  }
  content = contentFor(bundle, state);
  if (
    selectedAlert &&
    !state.decisions.some((d) => d.key === selectedAlert) &&
    !alertItems(state).some((a) => String(a.id) === String(selectedAlert))
  ) {
    selectedAlert = null;
    readingAlert = null;
  }
  const p = content.nations[state.player];
  const tabs = [
    ["command", "01", "Command Map"],
    ["land", "02", "Land campaigns"],
    ["airwar", "03", "Strategic air"],
    ["yards", "04", "Ship catalog"],
    ["aircraft", "05", "Aircraft catalog"],
    ["fleet", "06", "Fleet register"],
    ["programs", "07", "Facilities & research"],
    ["diplomacy", "08", "Diplomacy"],
    ["economy", "09", "Economy & trade"],
    ["reports", "10", "Battle reports"],
    ["review", "11", "Naval record"],
  ];
  updateDOM(
    app,
    `<div class="game-shell"><aside class="sidebar"><div class="side-brand wordmark">WNT<span>1922</span><small class="build-version">v${GAME_VERSION}</small></div><div class="side-country"><span class="eyebrow" style="color:${p.color}">${state.player} · NAVAL MINISTRY</span><strong>${p.name}</strong><span>${p.title}</span></div><nav>${tabs.map(([key, index, label]) => `<button class="nav-item ${view === key ? "current" : ""}" data-action="view" data-view="${key}"><span>${index}</span>${label}${key === "reports" && state.reports.length ? `<b>${state.reports.filter((r) => [r.a, r.b].includes(state.player)).length}</b>` : ""}</button>`).join("")}</nav><div class="side-bottom"><span class="save-status">${esc(saveStatus)}</span><div>${btn("Save", "save")}${btn("Menu", "menu")}</div></div></aside><div class="game-body">${topBars(state, content, simMetrics)}${alertsView(state, content, newsTicker)}<main class="workspace view-${view}" data-record="overview"><div class="workspace-inner" data-scroll-key="workspace-${view}">${viewHTML()}</div></main></div></div>${modalHTML()}`,
  );
  mapMotion.refresh();
  newsTicker.refresh(app, !!app.querySelector(".modal-backdrop"));
  const dispatch = app.querySelector(".diplomatic-dispatch");
  if (dispatch && !dispatch.contains(document.activeElement))
    dispatch.querySelector("button")?.focus({ preventScroll: true });
  for (const el of app.querySelectorAll("button[data-action]"))
    if (!el.getAttribute("title") && CONTROL_HINTS[el.dataset.action])
      el.title = CONTROL_HINTS[el.dataset.action];
}
function liveRender() {
  const active = document.activeElement;
  if (drag) return;
  const focus = active?.dataset?.action ? { ...active.dataset } : null,
    scrolls = [...app.querySelectorAll("[data-scroll-key]")].map((el) => [
      el.dataset.scrollKey,
      el.scrollTop,
      el.scrollLeft,
    ]),
    details = [...app.querySelectorAll("details[data-detail-key]")]
      .filter((el) => el.open)
      .map((el) => el.dataset.detailKey),
    y = window.scrollY;
  render();
  for (const el of app.querySelectorAll("[data-scroll-key]")) {
    const before = scrolls.find(([k]) => k === el.dataset.scrollKey);
    if (before) {
      el.scrollTop = before[1];
      el.scrollLeft = before[2];
    }
  }
  for (const el of app.querySelectorAll("details[data-detail-key]"))
    el.open = details.includes(el.dataset.detailKey);
  if (focus && !state.decisions.some((d) => d.popup))
    [...app.querySelectorAll("[data-action]")]
      .find((el) =>
        Object.entries(focus).every(([k, v]) => el.dataset[k] === v),
      )
      ?.focus({ preventScroll: true });
  window.scrollTo({ top: y, behavior: "instant" });
}

function viewHTML() {
  return {
    command: commandView,
    land: () =>
      landView(
        state,
        content,
        chart,
        sim.yearOf(state) < 1936 ? POLITICAL_1922 : POLITICAL,
      ),
    airwar: () =>
      strategicAirView(
        state,
        content,
        chart,
        sim.yearOf(state) < 1936 ? POLITICAL_1922 : POLITICAL,
      ),
    yards: yardsView,
    aircraft: () =>
      designerView(state, draft?.kind === "aircraft" ? draft : null) +
      heading("AVIATION & PRODUCTION", "Aircraft catalog") +
      aircraftCatalogView(state, content),
    programs: programsView,
    fleet: fleetView,
    diplomacy: diplomacyView,
    reports: reportsView,
    review: reviewView,
    economy: () => economyView(state, content),
  }[view]();
}
function heading(eyebrow, title, extra = "") {
  return `<div class="view-heading"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1></div>${extra}</div>`;
}
function selectChart(key, id) {
  hideClassHover();
  for (const field of [
    "fleetId",
    "portId",
    "contactId",
    "convoyId",
    "frontId",
    "countryId",
    "territoryId",
    "credits",
    "mission",
    "aggressiveBattle",
    "manifestPage",
    "shipId",
  ])
    delete chart[field];
  if (key) chart[key] = id;
  if (!["command", "land", "airwar"].includes(view)) view = "command";
  dialog = null;
  selectedAlert = null;
  readingAlert = null;
}
function focusMap(kind, id, zoom = false) {
  const data = sim.yearOf(state) < 1936 ? POLITICAL_1922 : POLITICAL,
    point = chartPosition(state, data, kind, id);
  if (!point) {
    toast("This unit has no current map position.");
    return;
  }
  selectChart(kind + "Id", id);
  if (kind === "ship") {
    const g = player().groups.find((g) => g.id === id);
    chart.fleetId = g?.fleetId;
  }
  centerChart(chart, point, { zoom });
  render();
  if (chart.fleetId) requestAnimationFrame(() => {
    const row=[...app.querySelectorAll('.fleet-command-row')].find(x=>x.dataset.id===chart.fleetId);
    row?.scrollIntoView({block:"nearest",inline:"nearest",behavior:"instant"});
  });
}
function commandView() {
  return worldCommandView(
    state,
    content,
    chart,
    sim.yearOf(state) < 1936 ? POLITICAL_1922 : POLITICAL,
  );
}
function affordableMessage(p) {
  return sim.affordability(player(), p);
}
function armament(c) {
  const parts = [];
  if (c.barrels) parts.push(`${c.barrels} × ${number(c.caliber)} mm guns`);
  if (c.tubes) parts.push(`${c.tubes} torpedo tubes`);
  if (c.air)
    parts.push(
      `${c.air} aircraft${c.estimated?.includes("air") ? " (estimated)" : ""}`,
    );
  if (c.sonar) parts.push("Sonar");
  if (c.radar) parts.push("Radar");
  return parts.join(" · ") || "Auxiliary service and supply support";
}
function pagedRows(rows, kind, size) {
  const pages = Math.max(1, Math.ceil(rows.length / size)),
    page = sim.clamp(viewPages[kind] || 0, 0, pages - 1);
  return {
    rows: rows.slice(page * size, (page + 1) * size),
    page,
    pages,
    total: rows.length,
  };
}
function pageControls(p, kind) {
  return p.pages <= 1
    ? ""
    : '<div class="catalog-pager pager-' +
        kind +
        '"><span>' +
        p.total +
        ' entries</span><div class="list-pager">' +
        btn(
          "‹ Previous",
          "catalog-page",
          'data-kind="' + kind + '" data-value="' + (p.page - 1) + '"',
          p.page === 0 ? "First page" : "",
        ) +
        "<span>" +
        (p.page + 1) +
        " / " +
        p.pages +
        "</span>" +
        btn(
          "Next ›",
          "catalog-page",
          'data-kind="' + kind + '" data-value="' + (p.page + 1) + '"',
          p.page === p.pages - 1 ? "Last page" : "",
        ) +
        "</div></div>";
}
function yardsView() {
  const n = player(),
    load = sim.yardLoad(state, content),
    queue = n.groups.filter((g) =>
      ["building", "converting", "trials"].includes(g.status),
    ),
    designs = content.nations[state.player].designs
      .filter(
        (id) =>
          !productionBlock(state, content, id, state.player, {
            includeFuture: true,
          }),
      )
      .map((id) => content.classes[id])
      .sort(
        (a, b) =>
          Number(a.year > sim.yearOf(state)) -
            Number(b.year > sim.yearOf(state)) ||
          (a.year > sim.yearOf(state) ? a.year - b.year : 0),
      );
  const designPage = pagedRows(
    designs.filter((c) => designFilter === "all" || c.type === designFilter),
    "design",
    window.innerHeight < 850 ? 6 : 9,
  );
  return `${designerView(state, draft?.kind === "aircraft" ? null : draft)}${heading("CONSTRUCTION & PROCUREMENT", "The fleet, in time", `<span class="tag">${number(load.capacity * 365)} TONS / YEAR YARD CAPACITY</span>`)}<section class="panel queue-panel"><div class="panel-title"><h2>Under construction <span class="count">${queue.reduce((v, g) => v + g.count, 0)} hulls</span></h2><span>${load.blocked ? load.reason + "; construction suspended" : load.factor > 1 ? `${number(load.factor, 2)}× longer from yard congestion` : "Yards within capacity"}</span></div>${yardCapacityChart(load)}${queue.length ? `<div class="queue-list">${queue.map((g) => `<div class="queue-row"><div><strong>${g.count} × ${esc(g.name)}</strong><small>${SERVICES[fleetService(content.classes[g.classId])]} · ${g.paid?.gold ? "Ordered by the ministry" : "Inherited campaign construction"}${g.covert ? " · concealed" : ""}</small></div><div>${meter(g.progress * 100, "var(--gold)")}<span>${percent(g.progress)} · ~${load.blocked ? "suspended" : months((1 - g.progress) * g.days * load.factor) + " remaining"}</span></div>${btn("Cancel", "cancel", `data-id="${g.id}" class="subtle"`)}</div>`).join("")}</div>` : "<p>No active orders. Choose a design below.</p>"}<p class="panel-note">All orders share yard throughput. Resources are committed on order; delivery dates respond to yard load.</p></section><div class="section-heading"><h2>Ship catalog</h2><div class="catalog-tools">${btn("New design draft", "open-designer", 'title="Create a suggested fit or design a class yourself. Gold is paid only when the design is registered."')}<select id="design-filter" aria-label="Filter ship designs"><option value="all">All ship types</option>${[...new Set(designs.map((c) => c.type))].map((t) => `<option value="${t}" ${designFilter === t ? "selected" : ""}>${TYPES[t] || t}</option>`).join("")}</select></div></div><div class="design-grid">${designPage.rows
    .map((c) => {
      const future = c.year > sim.yearOf(state),
        price = sim.shipPrice(state, content, c.id),
        block = sim.shipOrderBlock(state, content, c.id);
      return `<article class="design-card panel" data-future="${future}" data-design="${c.id}"><div class="design-top"><span class="type-mark">${c.type}</span><span>${SERVICES[fleetService(c)].toUpperCase()}</span></div><h3><button class="text-button class-name" data-action="spec" data-id="${c.id}" data-class="${c.id}">${esc(c.name)}</button></h3><div class="design-specs"><span><b>${number(c.tons)}</b> standard tons</span><span><b>${number(c.speed, 1)}</b> knots</span><span><b>${number(c.crew)}</b> crew</span></div><p class="armament">${armament(c)}</p>${future ? catalogCountdown(state, c.year) : `<div class="cost-line">${cost(price)}</div><small title="Base time before shared yard congestion. All yards contribute to one national pool.">Base build time ${months(price.days)}</small>${block ? `<p class="block-reason">${esc(block)}</p>` : ""}<div class="design-actions">${btn("Order hulls", "order", `data-id="${c.id}" class="primary"`, block || affordableMessage(price))}</div>`}</article>`;
    })
    .join("")}</div>${pageControls(designPage, "design")}`;
}
function programsView() {
  const n = player(),
    research = researchOrder(
      state,
      Object.entries(PROGRAMS).filter(
        ([key]) =>
          !["industry", "school", "pilots", "aircraft_factory"].includes(key),
      ),
    );
  return (
    heading(
      "BUDGET, INDUSTRY & INFLUENCE",
      "Facilities & research",
      '<span class="tag">' +
        n.projects.length +
        " / 4 PROGRAMS UNDERWAY</span>",
    ) +
    resourcesView(state, content) +
    '<div class="section-heading"><h2>Research & doctrine</h2></div><div class="program-grid">' +
    research
      .map(([key, p]) => {
        const price = sim.projectPrice(state, key),
          work = n.projects.find((q) => q.key === key),
          block = sim.projectBlock(state, key) || affordableMessage(price);
        return (
          '<article class="panel program-card" data-program="' +
          key +
          '" data-available-year="' +
          price.targetYear +
          '"><div class="program-top"><span class="eyebrow">' +
          p.kind +
          "</span><span>LEVEL " +
          price.level +
          " / 9</span></div><h3>" +
          p.name +
          '</h3><p class="level-current"><b>Current:</b> ' +
          esc(levelDescription(key, price.level)) +
          '</p><p class="level-next"><b>' +
          (price.level < 9 ? "Next:" : "Mastered:") +
          "</b> " +
          esc(levelDescription(key, Math.min(9, price.level + 1))) +
          '</p><p class="program-effect">' +
          p.effect +
          '</p><div class="cost-line">' +
          cost(price) +
          "</div><small>" +
          number(price.days) +
          " days from funding</small>" +
          (work
            ? projectProgress(state, work)
            : btn(
                price.level >= 9
                  ? "Fully developed"
                  : price.ahead
                    ? "Available 1 Jan " + price.targetYear
                    : "Fund level " + (price.level + 1),
                "project",
                'data-id="' +
                  key +
                  '" class="action-slot full" title="' +
                  esc(
                    levelHint(key, price.level) + (block ? " " + block : ""),
                  ) +
                  '"',
                block,
              )) +
          "</article>"
        );
      })
      .join("") +
    "</div>"
  );
}
function diplomacyView() {
  return governmentView(state, content);
}
function fleetView() {
  for (const id of fleetSelection)
    if (
      !player().groups.some(
        (g) =>
          g.id === id && g.count && !["scrapped", "sunk"].includes(g.status),
      )
    )
      fleetSelection.delete(id);
  const n = player(),
    navy = sim.fleetSummary(state, content),
    support = sim.supportSummary(state, content),
    merchant = sim.merchantSummary(state, content);
  const filters = [
    ["all", "All commissioned hulls"],
    ["warship", "Warships"],
    ["support", "Depot ships & oilers"],
    ["merchant", "Merchant fleet"],
    ["capital", "Capital ships & carriers"],
    ["legacy", "Legacy fleet"],
    ["active", "Active"],
    ["reserve", "Reserve"],
    ["repair", "In dock"],
  ];
  const sections = [
    "Main warships",
    "Legacy & reserve warships",
    "Depot ships & oilers",
    "Merchant fleet",
  ];
  const section = (g) =>
    g.service === "merchant"
      ? 3
      : g.service === "support"
        ? 2
        : g.legacy || g.status === "reserve"
          ? 1
          : 0;
  const matches = (text) =>
    !fleetSearch || text.toLowerCase().includes(fleetSearch.toLowerCase());
  const groups = n.groups
    .filter(
      (g) =>
        !["building", "trials", "converting", "sunk", "scrapped"].includes(
          g.status,
        ) &&
        g.count > 0 &&
        (fleetFilter === "all" ||
          g.service === fleetFilter ||
          (fleetFilter === "legacy"
            ? g.legacy
            : fleetFilter === "capital"
              ? ["BB", "BC", "CV", "CVL"].includes(
                  content.classes[g.classId].type,
                )
              : g.status === fleetFilter)) &&
        matches(
          g.name +
            " " +
            content.classes[g.classId].type +
            " " +
            content.classes[g.classId].name,
        ),
    )
    .sort((a, b) => section(a) - section(b) || compareShips(content)(a, b));
  const other =
    merchant.other &&
    ["all", "merchant", "active"].includes(fleetFilter) &&
    matches("Other registered merchants commercial shipping");
  const bulk =
    '<div class="bulk-fleet-tools"><span>' +
    fleetSelection.size +
    " selected entries</span>" +
    ["reserve", "recommission", "scrap"]
      .map((mode) => {
        const p = bulkPlan(state, [...fleetSelection], mode);
        return btn(
          { reserve: "Reserve", recommission: "Recommission", scrap: "Scrap" }[
            mode
          ] +
            " (" +
            p.hulls +
            ")",
          "bulk-fleet",
          'data-id="' +
            mode +
            '" title="' +
            esc(
              p.blocked ||
                "Apply to qualifying selected hulls. " +
                  (mode === "recommission"
                    ? number(p.price.gold) +
                      " gold · " +
                      p.price.influence +
                      " influence · " +
                      number(p.price.industry) +
                      " industry."
                    : "Ships at sea must return to port."),
            ) +
            '"',
          p.blocked,
        );
      })
      .join("") +
    btn(
      "Clear selection",
      "clear-fleet-selection",
      "",
      fleetSelection.size ? "" : "No ships selected.",
    ) +
    "</div>";
  let last = -1;
  const rows = groups
    .map((g) => {
      const c = content.classes[g.classId],
        key = section(g),
        title =
          key !== last
            ? '<tr class="fleet-register-section" data-register-section="' +
              key +
              '"><th colspan="8">' +
              sections[key] +
              "</th></tr>"
            : "";
      last = key;
      const station =
        g.service === "merchant"
          ? "Trade routes"
          : g.fleetId
            ? esc(
                n.fleets.find((f) => f.id === g.fleetId)?.name ||
                  "Fleet command",
              ) +
              "<small>" +
              esc(REGIONS[g.region]?.short || g.region) +
              "</small>"
            : esc(REGIONS[g.region]?.short || g.region);
      return (
        title +
        '<tr class="' +
        (fleetSelection.has(g.id) ? "is-selected" : "") +
        '"><td><button class="text-button" data-action="spec" data-id="' +
        c.id +
        '" data-ship="' +
        g.id +
        '" data-class="' +
        c.id +
        '">' +
        esc(g.name) +
        "</button><small>" +
        number(c.tons) +
        " t · " +
        number(c.speed, 1) +
        " kn" +
        (g.legacy ? " · legacy" : "") +
        '</small></td><td title="' +
        esc(TYPES[c.type] || c.type) +
        '"><b class="ship-type">' +
        c.type +
        "</b></td><td>" +
        number(g.count) +
        "</td><td>" +
        meter(
          g.health * 100,
          g.health < 0.65
            ? "var(--red)"
            : g.health < 0.9
              ? "var(--gold)"
              : "var(--green)",
        ) +
        "<small>" +
        percent(g.health) +
        "</small></td><td>" +
        (g.status === "active" &&
        !g.atSea &&
        g.service !== "merchant" &&
        !fullyStaffed(g, c)
          ? '<span class="status reserve">Awaiting sailors</span>'
          : statusBadge(g.status)) +
        "</td><td>" +
        station +
        "</td><td>" +
        (g.service === "warship" && ["active", "reserve"].includes(g.status)
          ? btn(
              g.status === "reserve" ? "Recommission" : "Reserve",
              "reserve",
              'data-id="' + g.id + '" class="subtle"',
            )
          : "") +
        btn(
          g.scrapOnArrival ? "Returning to scrap" : "Scrap",
          "scrap",
          'data-id="' + g.id + '" class="subtle danger"',
          g.scrapOnArrival ? "Already ordered home for scrapping" : "",
        ) +
        '</td><td class="select-hull"><input type="checkbox" data-fleet-select="' +
        g.id +
        '" aria-label="Select ' +
        esc(g.name) +
        '" ' +
        (fleetSelection.has(g.id) ? "checked" : "") +
        "></td></tr>"
      );
    })
    .join("");
  return (
    heading("WARSHIPS, AUXILIARIES & SHIPPING", "Fleet register") +
    '<div class="register-summary">' +
    [
      [navy.total + " warships", number(navy.tons) + " t naval displacement"],
      [
        support.total + " support hulls",
        number(support.tons) + " t support displacement",
      ],
      [
        number(merchant.total) + " merchants",
        number(merchantEconomy(state, content).current) +
          " GRT registered volume",
      ],
    ]
      .map(
        ([value, label], i) =>
          '<button data-action="register-jump" data-id="' +
          [0, 2, 3][i] +
          '" title="Scroll to ' +
          ["warships", "support hulls", "merchants"][i] +
          '"><strong>' +
          value +
          "</strong><small>" +
          label +
          "</small></button>",
      )
      .join("") +
    '</div><div class="section-heading"><span>' +
    groups.length +
    ' cataloged entries</span><div class="register-filters"><input id="fleet-search" type="search" placeholder="Find ship, class or type" aria-label="Find a ship" value="' +
    esc(fleetSearch) +
    '"><select id="fleet-filter" aria-label="Filter ship register">' +
    filters
      .map(
        ([value, label]) =>
          '<option value="' +
          value +
          '" ' +
          (fleetFilter === value ? "selected" : "") +
          ">" +
          label +
          "</option>",
      )
      .join("") +
    "</select></div></div>" +
    bulk +
    '<div class="panel table-panel"><div class="table-scroll"><table class="fleet-table"><thead><tr><th>Ship / formation</th><th>Type</th><th>Hulls</th><th>Condition</th><th>Status</th><th>Station</th><th>Orders</th><th class="select-hull"><input type="checkbox" id="fleet-select-visible" aria-label="Select visible hulls" ' +
    (groups.length && groups.every((g) => fleetSelection.has(g.id))
      ? "checked"
      : "") +
    "></th></tr></thead><tbody>" +
    rows +
    (other
      ? (last !== 3
          ? '<tr class="fleet-register-section" data-register-section="3"><th colspan="8">Merchant fleet</th></tr>'
          : "") +
        "<tr><td>Other registered merchants<small>Commercial shipping outside the individual design catalog</small></td><td>Merchant</td><td>" +
        number(merchant.other) +
        "</td><td>—</td><td>Registered</td><td>Trade routes</td><td></td><td></td></tr>"
      : "") +
    "</tbody></table></div>" +
    (!groups.length && !other
      ? '<p class="empty">No hulls match this selection.</p>'
      : "") +
    '</div><p class="panel-note">Construction appears in Ship catalog. Merchant GRT is registered volume and is kept separate from warship and support displacement. Reserve warships use 15% crew and 20% maintenance.</p>'
  );
}
function merchantComparison() {
  return `<section class="panel merchant-comparison"><div class="panel-title"><h2>Merchant registers of all seven countries</h2><span>Naval support excluded</span></div><div class="table-scroll"><table><thead><tr><th>Country</th><th>Current merchant hulls</th><th>Opening hulls</th><th>Historical GRT reference</th></tr></thead><tbody>${NATION_ORDER.map(
    (id) => [id, PROFILES[id]],
  )
    .map(([id, p]) => {
      const m = sim.merchantSummary(state, content, id);
      return `<tr class="${id === state.player ? "player-row" : ""}"><td>${p.name}</td><td>${number(m.total)}</td><td>${number(m.reference.hulls)}${m.reference.estimated ? " · provisional" : ""}</td><td>${m.reference.grossRegisterTons === null ? "Not verified" : number(m.reference.grossRegisterTons)}</td></tr>`;
    })
    .join(
      "",
    )}</tbody></table></div><p>${esc(content.merchantSource.basis || "Powered merchant vessels of at least 100 GRT. US Great Lakes and British Dominion registrations are excluded.")}</p>${content.nations.SOV.merchants.estimated ? `<p class="panel-note">${esc(content.nations.SOV.merchants.note)}</p>` : ""}<p class="panel-note">GRT measures registered volume; it is never added to naval displacement. GRT is a historical reference. Convoy interceptions now remove actual merchant hulls from the live register and damage trade flow. Civilian yards add whole hulls monthly. Capacity equals hull count × the current average registered volume.</p><a href="${esc(content.merchantSource.url)}" target="_blank" rel="noopener noreferrer">Read the Lloyd’s Register source · annual Table 1</a><small>${esc(content.merchantSource.credit)}</small></section>`;
}
function reportsView() {
  const reports = state.reports.filter((r) =>
    [r.a, r.b].includes(state.player),
  );
  return (
    heading("ENGAGEMENTS & CONSEQUENCES", "Battle reports") +
    (reports.length
      ? '<div class="report-grid">' +
        reports
          .map((r) => {
            const own = r.a === state.player ? r.resultA : r.resultB,
              enemy = r.a === state.player ? r.resultB : r.resultA;
            return (
              '<button class="panel report-card" data-action="report" data-id="' +
              r.id +
              '"><div><span class="eyebrow">' +
              reportDate(r) +
              '</span><span class="result ' +
              (r.status === "ongoing" ? "ongoing" : !r.winner ? "" : r.winner === state.player ? "won" : "lost") +
              '">' +
              (r.status === "ongoing" ? "ONGOING" : r.magnitude || "minor").toUpperCase() +
              " " +
              (r.status === "ongoing" || !r.winner ? "" : r.winner === state.player ? "VICTORY" : "DEFEAT") +
              "</span></div><h2>" +
              esc(reportTitle(r)) +
              "</h2>" + battleProgress(r,campaignMinutes(state)) + "<p>" +
              PROFILES[r.a].name +
              " vs " +
              PROFILES[r.b].name +
              '</p><div class="report-losses">' +
              [
                [own, "Your ships"],
                [enemy, "Enemy ships"],
              ]
                .map(
                  ([result, label]) =>
                    "<div><strong>" +
                    label +
                    "</strong><span>Sunk: " +
                    resultComposition(result, "sunk", "No ships lost") +
                    "</span><span>Damaged: " +
                    resultComposition(result, "damaged", "No new ship damage") +
                    "</span></div>",
                )
                .join("") +
              '</div><span class="card-link">Read after-action report →</span></button>'
            );
          })
          .join("") +
        "</div>"
      : '<section class="panel empty"><h2>No engagements yet</h2><p>Fleet encounters, anchorage raids and coastal defense actions will be recorded here.</p></section>')
  );
}
function reviewView() { return navalRecordView(state, content); }

function modalHTML() {
  const urgent = politicalPopup(state);
  if (urgent) return urgent;
  if (!dialog) return "";
  let title = "",
    body = "",
    actions = "";
  if (dialog.type === "new") {
    title = "Begin a new campaign?";
    body = `<p>Take command of ${PROFILES[selected].name} in ${esc(content.scenario.title)} on ${content.scenario.start}. Your current disk save will be replaced on the next save.</p>`;
    actions =
      btn("Export current campaign", "export") +
      btn("Begin new campaign", "begin", 'class="primary"');
  }
  if (dialog.type === "ship") {
    title =
      player().groups.find((g) => g.id === dialog.ship)?.name || "Ship state";
    body = shipDetails(state, content, dialog.ship);
  }
  if (dialog.type === "order") {
    const c = content.classes[dialog.id],
      p = sim.shipPrice(state, content, c.id, dialog.count || 1);
    title = `Order ${c.name}`;
    body = `<p>${armament(c)} · ${number(c.tons)} t per hull</p><label for="order-count">Number of hulls · <output for="order-count">${dialog.count || 1}</output></label><input id="order-count" type="range" min="1" max="20" step="1" value="${dialog.count || 1}"><div class="funding-labels"><span>1 hull</span><span>20 hulls</span></div><div class="cost-line">${cost(p)}</div><p>Base construction time: ${months(p.days)}. Other orders may extend delivery.</p><p class="panel-note">Resources are committed immediately. Cancelling returns half of the unspent gold and industry.</p>`;
    actions = btn(
      "Commit order",
      "commit-order",
      'class="primary"',
      affordableMessage(p),
    );
  }
  if (dialog.type === "confirm") {
    title = dialog.title;
    body = `<p>${esc(dialog.body)}</p>`;
    actions = btn(dialog.label || "Confirm", "confirm", 'class="primary"');
  }
  if (dialog.type === "spec") {
    const c = content.classes[dialog.id],
      ship = player().groups.find((g) => g.id === dialog.ship);
    title = ship ? ship.name + " · " + c.name : c.name;
    body = c.unknownSpecs
      ? `<p>${esc(c.notes)}</p>`
      : `<div class="spec-lead"><span class="type-mark">${c.type}</span><div><strong>${TYPES[c.type] || c.type}</strong><span>${PROFILES[c.nation]?.name || c.nation} · ${c.year} design</span></div></div><p>${armament(c)}</p><dl class="spec-list">${[
          ["Standard displacement", `${number(c.tons)} t`],
          [
            "Full-load displacement",
            c.raw?.displacement?.full_load_tons
              ? `${number(c.raw.displacement.full_load_tons)} t`
              : "Not cataloged",
          ],
          [
            "Dimensions (L / B / draft)",
            c.raw?.dimensions
              ? `${c.raw.dimensions.length_m} / ${c.raw.dimensions.beam_m} / ${c.raw.dimensions.draft_m} m`
              : "Not cataloged",
          ],
          ["Speed", `${number(c.speed, 1)} kn`],
          ["Range", `${number(c.range)} km`],
          ["Belt / deck armor", `${c.belt} / ${c.deck} mm`],
          ["Full complement", `${number(c.crew)} crew`],
          [
            c.raw?.cost_gold ? "Authored hull price" : "Playtest hull price",
            `${number(c.cost)} gold`,
          ],
          [
            "Aircraft capacity",
            c.air || c.scoutAircraft
              ? `${(c.air || 0) + (c.scoutAircraft || 0)}${c.scoutAircraft ? " (including " + c.scoutAircraft + " floatplane slots)" : ""}${c.estimated?.includes("air") ? " (prototype estimate)" : ""}`
              : "—",
          ],
          ["Provisioned interfaces", `${c.provisioned}`],
          [
            "Submerged sprint",
            c.submergedSpeed ? `${c.submergedSpeed} kn` : "—",
          ],
        ]
          .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
          .join(
            "",
          )}</dl><p class="panel-note">Operational strength also depends on crew coverage, training, morale, condition and the supply line. Ship specifications remain distinct from playtest combat coefficients.</p>${weaponDetails(c, content)}${ship?.notes ? '<p class="panel-note">' + esc(ship.notes) + "</p>" : ""}${ship ? `<p class="ship-condition ${ship.health < 0.65 ? "serious" : ship.health < 0.9 ? "moderate" : "light"}">Current hull: ${percent(1 - ship.health)} damage · ${esc(ship.status)}</p>` : ""}`;
  }
  if (dialog.type === "report") {
    const r = state.reports.find(r=>r.id===dialog.report?.id) || dialog.report;
    if (!r) return "";
    title = `${reportTitle(r)} · ${reportDate(r)}`;
    const rows = [
      [
        "Forces engaged",
        engagedComposition(r, "A"),
        engagedComposition(r, "B"),
      ],
      ["Surface firepower", r.powerA.surface, r.powerB.surface],
      ["Air power in this action", r.powerA.air, r.powerB.air],
      ["Submarine power", r.powerA.sub, r.powerB.sub],
      ["Escort / ASW power", r.powerA.asw, r.powerB.asw],
      ["AA defenses", r.powerA.aa, r.powerB.aa],
      ["Reconnaissance", r.powerA.scout, r.powerB.scout],
      ["Training", r.preparationA.training, r.preparationB.training],
      ["Morale", r.preparationA.morale, r.preparationB.morale],
      ["Supply %", r.preparationA.supply * 100, r.preparationB.supply * 100],
      [
        "Battle variation %",
        (r.variationA - 1) * 100,
        (r.variationB - 1) * 100,
      ],
      ["Effective engagement power", r.effectiveA, r.effectiveB],
      ["Hulls lost", r.resultA.sunk, r.resultB.sunk],
      ["Hulls damaged", r.resultA.damaged, r.resultB.damaged],
    ];
    body = `${r.status === "ongoing" ? "" : `<p><strong>${r.winner ? r.magnitude.toUpperCase()+" · "+PROFILES[r.winner].name+" inflicted the greater assessed loss." : "No decisive result."}</strong></p>`}${battleDetails(r,state)}<details class="combat-calculations" data-detail-key="combat-calculations"><summary>Combat calculations & loss mechanisms</summary><table><thead><tr><th>Factor</th><th>${PROFILES[r.a].name}</th><th>${PROFILES[r.b].name}</th></tr></thead><tbody>${rows.map(([k, a, b]) => `<tr><td>${k}</td><td>${typeof a === "string" ? esc(a) : number(a, 1)}</td><td>${typeof b === "string" ? esc(b) : number(b, 1)}</td></tr>`).join("")}</tbody></table><h3 class="spaced">Loss mechanisms</h3>${[...r.resultA.losses, ...r.resultB.losses].map((l) => `<p>${l.count} × ${esc(l.name)} · ${esc(l.cause)}</p>`).join("") || "<p>No hulls were sunk. Damaged ships may withdraw for repairs.</p>"}</details>`;
  }
  if (dialog.type === "help") {
    title = "Commanding the ministry";
    body =
      '<ol class="help-list"><li><strong>Invest ahead.</strong> Ships and facility expansions need gold, influence, industry and time. Superseded ship production lines close.</li><li><strong>Fund aircraft and personnel.</strong> Choose production models at the top of Aircraft catalog. Sailors graduate every month on the 1st; aviators graduate on 1 January, April, July and October. Training accrues with daily funding and joins the available pool only on graduation. Naval industry, aircraft factories, naval schools and aviation schools each run at 10–100% funding; expand them in the same panel. Aircraft need full crews to fly; ships need complete sailor complements to leave port.</li><li><strong>Admirals command the fleets.</strong> They choose missions, routes, escorts and engagements automatically. Click a force to circle it on the chart and highlight its list entry. Hover for readiness and individual ships.</li><li><strong>Air warfare is automatic.</strong> Admirals sweep broad search sectors, assemble strikes in daylight, retain CAP and send escorts. Weather, model range, contact age and strategic materials limit operations. Aircraft fly out and back before a 90-minute rearm. Airborne wings can divert when their carrier is lost. Read-only government maritime types reinforce bases through the same physical ferry and merchant system.</li><li><strong>Read the chart.</strong> Drag around the Equal Earth globe; scroll to zoom. Squares are your merchant convoys. Escort coverage is always shown: green rings have nearby operational escorts, red dashed rings are exposed. Diamonds are fading intelligence reports, not live enemy positions. Hover shows information; click centers the map and double-click zooms; contact alerts disappear after 48 hours without an update. Home resets the map. Land fronts respond to sustained naval supply.</li><li><strong>Watch naval news.</strong> Decisions and major world events pause play and open a dispatch. Acknowledge or choose a response to resume automatically unless you had already paused. Routine news passes once through the ticker; hover to hold it for reading. Permanent battle reports remain in Battle reports.</li><li><strong>Manage hulls.</strong> Click a ship to locate it; hover for individual state and class specifications. Reserve or scrap ships from the register. Seriously damaged ships detach and sail home under escort where possible.</li><li><strong>Control time.</strong> Space pauses; 1–5 choose speeds from 2,500× to 100,000×. The simulation advances in fifteen-minute ticks. Hiding this tab pauses the game. Autosaves and a previous save are kept on this computer.</li></ol><p class="panel-note">Two campaigns and seven playable navies; land warfare uses strategic campaign corridors. This is a provisional balance for playtesting. Formal campaign reviews preserve your score; the sandbox continues afterward.</p>';
  }
  if (dialog.type === "menu") {
    title = "Campaign menu";
    body = `<p>${PROFILES[state.player].name} · ${smallDate(state.day)}</p><div class="menu-actions">${btn("Export save file", "export")}${btn("Import save file", "import")}${btn("Return to navy selection", "title-screen")}${btn("How to play", "help")}${btn("Toggle full window / fullscreen", "fullscreen")}</div>${musicCredits()}<p><a href="/assets/licenses/third-party-notices.html" target="_blank" rel="noreferrer">Third-party licenses and credits</a></p><p class="panel-note">Saves: %APPDATA%/WNT1922/saves. The previous disk save is kept as campaign.backup.json.</p>`;
  }
  return `<div class="modal-backdrop ${dialog.type === "report" ? "report-backdrop" : ""}"><section data-key="dialog-${dialog.type}-${dialog.id || dialog.ship || ""}" class="modal ${dialog.type === "report" ? "wide" : ""}" data-dialog-type="${dialog.type}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header><h2 id="dialog-title">${esc(title)}</h2><button data-action="close" class="close" aria-label="Close dialog">×</button></header><div class="modal-body" data-scroll-key="modal-body" >${body}</div><footer>${actions ? btn("Cancel", "close", 'class="subtle"') + actions : btn("Close", "close")}</footer></section></div>`;
}
function openDialog(value) {
  hideClassHover();
  if (value.type === "report") {
    const report = state.reports.find((r) => r.id === value.id);
    if (!report) {
      toast("This report has left the recent history.");
      return;
    }
    value.report = structuredClone(report);
  }
  dialog = value;
  render();
  const body = app.querySelector(".modal-body");
  if (body) body.scrollTop = 0;
  requestAnimationFrame(() =>
    app.querySelector(".modal button:not([disabled]),.modal input")?.focus(),
  );
}
async function persist(quiet = false) {
  if (!state) return;
  saveStatus = "Saving…";
  try {
    const snapshot = simulation.worker
      ? await simulation.snapshot()
      : structuredClone(state);
    await saveCampaign(snapshot);
    lastSaveDay = snapshot.day;
    saved = snapshot;
    saveStatus = `Saved · ${smallDate(snapshot.day)}`;
    if (!quiet) toast("Campaign saved to this computer.");
  } catch (error) {
    saveStatus = "Save failed — export a copy";
    toast(error.message);
  }
  if (state) liveRender();
}
function resetSessionViews() {
  fleetSelection.clear();
  fleetFilter = "all";
  fleetSearch = "";
  designFilter = "all";
  viewPages = {};
  chart = { zoom: 1, cx: 600, cy: 300, rotation: 0 };
  draft = null;
  selectedAlert = readingAlert = null;
  newsTicker.reset();
}
async function begin() {
  resetSessionViews();
  content = contentFor(bundle, selectedCampaign);
  state = sim.newGame(
    content,
    selected,
    crypto.getRandomValues(new Uint32Array(1))[0],
  );
  draft = null;
  chart = { zoom: 1, cx: 600, cy: 300, rotation: 0 };
  newsTicker.reset();
  view = "command";
  dialog = null;
  selectedAlert = null;
  fleetSearch = "";
  saveStatus = "New campaign";
  lastSaveDay = state.day;
  soundTracker.reset();
  await simulation.start(bundle, state);
  writeRecovery(state);
  render();
}
async function mutate(command, message, silent = false) {
  try {
    if (!simulation.worker) {
      state.paused = true;
      soundTracker.reset();
      await simulation.start(bundle, state);
    }
    const response = await simulation.dispatch(command);
    if (!silent) {
      toast(response.result?.receipt || message || "Order transmitted.");
      playSound("order");
    }
    soundSettings(state.audioEnabled, state.audioVolume);
    musicSettings(state.musicEnabled, state.musicVolume);
    render();
    scheduleSave();
    return true;
  } catch (error) {
    toast(error.message);
    render();
    return false;
  }
}
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => persist(true), 1500);
}
let mapClickTimer;
app.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (
    event.target.closest("select,input,label") &&
    target?.classList.contains("fleet-command-row")
  )
    return;
  if (!target || target.disabled) return;
  if (performance.now() < suppressClickUntil) return;
  const { action, id, kind } = target.dataset;
  soundSettings(state?.audioEnabled ?? true, state?.audioVolume ?? 0.5);
  unlockSound();
  musicSettings(state?.musicEnabled ?? true, state?.musicVolume ?? 0.28);
  unlockMusic();
  playSound("click");
  try {
    if (action === "select-campaign") {
      selectedCampaign = id;
      content = contentFor(bundle, id);
      renderStart();
      return;
    }
    if (action === "register-jump") {
      fleetFilter = "all";
      fleetSearch = "";
      render();
      const section =
        document.querySelector('[data-register-section="' + id + '"]') ||
        (id === "0"
          ? document.querySelector('[data-register-section="1"]')
          : null);
      section?.scrollIntoView({ behavior: "instant", block: "start" });
      if (!section) toast("No hulls in this category.");
      return;
    }
    if (action === "catalog-page") {
      viewPages[kind] = Math.max(0, Number(target.dataset.value));
      render();
      return;
    }
    if (action === "music-next") {
      nextTrack();
      render();
      return;
    }
    if (action === "fullscreen") {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      return;
    }
    if (action === "select-nation") {
      selected = id;
      renderStart();
      return;
    }
    if (action === "new") {
      fleetSelection.clear();
      if (saved) openDialog({ type: "new" });
      else await begin();
      return;
    }
    if (action === "begin") {
      await begin();
      return;
    }
    if (action === "continue") {
      resetSessionViews();
      state = validateSave(saved, bundle);
      content = contentFor(bundle, state);
      view = "command";
      dialog = null;
      saveStatus = `Saved · ${smallDate(state.day)}`;
      lastSaveDay = state.day;
      soundTracker.reset();
      await simulation.start(bundle, state);
      render();
      return;
    }
    if (action === "close") {
      dialog = null;
      render();
      return;
    }
    if (action === "import") {
      importCampaign();
      return;
    }
    if ((action === "spec" || action === "ship") && target.dataset.ship) {
      focusMap("ship", target.dataset.ship);
      return;
    }
    if (action === "spec" || action === "ship") return;
    if (action === "help") {
      openDialog({ type: "help" });
      return;
    }
    if (action === "export") {
      const source = state || saved;
      if (!source) return;
      const blob = new Blob([exportSave(source)], { type: "application/json" }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = saveFileName(source);
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    if (!state) return;
    if (action === "open-aircraft-designer") {
      draft = automaticAircraftDraft(state, content);
      render();
      app.querySelector(".ship-designer")?.scrollIntoView({ block: "start" });
      return;
    }
    if (action === "open-designer") {
      if (!draft || draft.kind === "aircraft")
        draft = automaticDraft(state, content, "DD");
      render();
      app.querySelector(".ship-designer")?.scrollIntoView({ block: "start" });
      return;
    }
    if (action === "close-designer") {
      draft = null;
      render();
      return;
    }
    if (action === "generate-draft") {
      draft =
        draft?.kind === "aircraft"
          ? automaticAircraftDraft(state, content, draft.role)
          : automaticDraft(state, content, draft?.role || "DD");
      render();
      toast(
        "Suggested " +
          draft.year +
          " " +
          draft.role +
          " fit applied. No gold spent; adjust it before paying the drafting fee.",
      );
      return;
    }
    if (["commission-draft", "commission-aircraft"].includes(action)) {
      if (
        await mutate(
          { type: action, args: { recipe: draft } },
          "Design draft commissioned.",
        )
      ) {
        draft = null;
        render();
      }
      return;
    }
    if (event.target.closest(".world-map") && action.startsWith("select-")) {
      clearTimeout(mapClickTimer);
      const kind = action.slice(7);
      if (event.detail > 1) focusMap(kind, id, true);
      else mapClickTimer = setTimeout(() => focusMap(kind, id), 300);
      return;
    }
    if (action === "focus-fleet") {
      focusMap("fleet", id);
      return;
    }
    if (action === "select-fleet") {
      focusMap("fleet", id);
      return;
    }
    if (action === "command-list") {
      selectChart();
      render();
      return;
    }
    if (action === "clear-fleet-selection") {
      fleetSelection.clear();
      render();
      return;
    }
    if (action === "bulk-fleet") {
      const plan = bulkPlan(state, [...fleetSelection], id),
        command = {
          type: "bulk-fleet",
          args: { ids: [...fleetSelection], mode: id },
        };
      if (plan.blocked) throw Error(plan.blocked);
      if (id === "scrap")
        openDialog({
          type: "confirm",
          title: "Scrap " + plan.hulls + " selected hulls?",
          body:
            plan.groups.map((g) => g.name + " × " + g.count).join(", ") +
            ". Ships at sea return to port and remain vulnerable. Scrapping is permanent; surviving personnel and aircraft remain available.",
          label: "Order scrapping",
          command,
        });
      else if (
        await mutate(command, plan.hulls + " hulls: " + id + " orders sent.")
      ) {
        fleetSelection.clear();
        render();
      }
      return;
    }
    if (action === "map-credits") {
      selectChart("credits", true);
      render();
      return;
    }
    if (
      ["select-country", "select-territory", "select-front"].includes(action)
    ) {
      focusMap(action.slice(7), id);
      return;
    }
    if (action === "list-page") {
      chart[kind + "Page"] = Math.max(0, Number(target.dataset.value));
      render();
      return;
    }
    if (action === "select-contact") {
      focusMap("contact", id);
      return;
    }
    if (action === "locate-contact") {
      focusMap("contact", id);
      return;
    }
    if (action === "select-port") {
      focusMap("port", id);
      return;
    }
    if (action === "select-convoy") {
      focusMap("convoy", id);
      return;
    }
    if (action === "sound-toggle") {
      await mutate(
        { type: "settings", args: { audioEnabled: !state.audioEnabled } },
        "",
        true,
      );
      return;
    }
    if (action === "retire-aircraft") {
      const a=content.nations[state.player].aircraft.find(a=>a.id===id);
      openDialog({type:"confirm",title:"Retire reserve "+a.name+" airframes?",
        body:"Permanently retire the available reserve airframes of this superseded model. Aircraft embarked, stationed or in transit stay in service. All aviators are retained; no salvage resources are awarded.",
        label:"Retire reserve airframes",command:{type:"retire-aircraft",args:{id}}});
      return;
    }
    if (action === "map-reset") {
      Object.assign(chart, { zoom: 1, cx: 600, cy: 300, rotation: 0 });
      render();
      return;
    }
    if (action === "step-minute" || action === "step-six-hours") {
      mutate({
        type: "step",
        args: { minutes: action === "step-minute" ? 15 : 360 },
      });
      return;
    }
    if (action === "pause") {
      await mutate({ type: "pause" }, "", true);
      return;
    }
    if (action === "view") {
      view = target.dataset.view;
      dialog = null;
      selectedAlert = null;
      render();
      return;
    }
    if (action === "fleet-legacy") {
      fleetFilter = "legacy";
      render();
      return;
    }
    if (action === "menu") {
      openDialog({ type: "menu" });
      return;
    }
    if (action === "title-screen") {
      await persist(true);
      await simulation.stop();
      state = null;
      musicPlayback(false);
      musicContext(null);
      dialog = null;
      draft = null;
      content = contentFor(bundle, selectedCampaign);
      renderStart();
      return;
    }
    if (action === "save") {
      await persist();
      return;
    }
    if (action === "order") {
      openDialog({ type: "order", id, count: 1 });
      return;
    }
    if (action === "commit-order") {
      const count = Number(document.querySelector("#order-count").value),
        cid = dialog.id;
      if (
        await mutate(
          { type: "order", args: { id: cid, count } },
          "Construction order committed.",
        )
      ) {
        dialog = null;
        render();
      }
      return;
    }
    if (action === "project") {
      mutate({ type: "project", args: { id } }, "Program funded.");
      return;
    }

    if (action === "cancel") {
      openDialog({
        type: "confirm",
        title: "Cancel this construction order?",
        body: "The unfinished hulls will be abandoned. Recover half of the unspent gold and industry you paid. Inherited orders have no refundable appropriation.",
        label: "Cancel construction",
        command: { type: "cancel", args: { id } },
      });
      return;
    }
    if (action === "reserve") {
      mutate({ type: "reserve", args: { id } });
      return;
    }
    if (action === "scrap") {
      const g = player().groups.find((g) => g.id === id),
        salvage = Math.floor(
          content.classes[g.classId].tons * g.count * 0.05 * g.health,
        );
      openDialog({
        type: "confirm",
        title: "Scrap " + g.name + "?",
        body:
          "Order " +
          g.count +
          " hull(s) to return to a friendly port, then scrap them for up to " +
          number(salvage) +
          " industry. Ships at sea can be intercepted, and further damage reduces salvage. Hulls already in port are scrapped immediately. Surviving personnel and aircraft remain available.",
        label: "Scrap hulls",
        command: { type: "scrap", args: { id } },
      });
      return;
    }
    if (action === "diplomatic") {
      if (kind === "provoke")
        openDialog({
          type: "confirm",
          title:
            "Send a naval demonstration against " + PROFILES[id].name + "?",
          body: diplomaticHint(state, content, id, kind),
          label: "Send task force",
          command: { type: "diplomatic", args: { id, kind } },
        });
      else
        mutate(
          { type: "diplomatic", args: { id, kind } },
          "Diplomatic action completed.",
        );
      return;
    }
    if (action === "treaty") {
      const value = document.querySelector("#treaty-policy").value;
      mutate(
        { type: "treaty", args: { policy: value } },
        value === player().treatyPolicy
          ? "This policy is already in force; no switching fee charged."
          : "Treaty policy applied; switching fee paid.",
      );
      return;
    }
    if (action === "confirm") {
      const current = dialog;
      if (current.imported) {
        await persist(true);
        await current.run();
      } else if (await mutate(current.command)) {
        if (current.command.type === "bulk-fleet") fleetSelection.clear();
        dialog = null;
        selectedAlert = null;
        render();
      }
      return;
    }
    if (action === "decision") {
      selectedAlert = state.decisions[0]?.key;
      render();
      return;
    }
    if (action === "choose") {
      if (
        await mutate({ type: "choose", args: { key: target.dataset.key, id } })
      ) {
        selectedAlert = null;
        dialog = null;
        render();
      }
      return;
    }
    if (action === "report") {
      openDialog({ type: "report", id: Number(id) });
      return;
    }
  } catch (error) {
    toast(error.message);
  }
});
app.addEventListener("input", (event) => {
  const t = event.target;
  if (t.dataset.draft && draft && t.dataset.draft !== "role")
    draft[t.dataset.draft] =
      t.dataset.draft === "name" ? t.value : Number(t.value);
  if (t.id === "order-count" && dialog?.type === "order") {
    dialog.count = sim.clamp(Math.trunc(Number(t.value) || 1), 1, 20);
    render();
  }
  if (t.id === "fleet-search") {
    const caret = t.selectionStart;
    fleetSearch = t.value;
    render();
    const input = document.querySelector("#fleet-search");
    input?.focus();
    input?.setSelectionRange(caret, caret);
  }
});
app.addEventListener("change", async (event) => {
  const t = event.target;
  if (t.dataset.draftFeature && draft) {
    draft.features = t.checked
      ? [...draft.features, t.dataset.draftFeature]
      : draft.features.filter((k) => k !== t.dataset.draftFeature);
    render();
    return;
  }
  if (t.dataset.fleetSelect) {
    if (t.checked) fleetSelection.add(t.dataset.fleetSelect);
    else fleetSelection.delete(t.dataset.fleetSelect);
    render();
    return;
  }
  if (t.id === "fleet-select-visible") {
    for (const row of document.querySelectorAll("[data-fleet-select]"))
      if (t.checked) fleetSelection.add(row.dataset.fleetSelect);
      else fleetSelection.delete(row.dataset.fleetSelect);
    render();
    return;
  }
  if (t.dataset.draft) {
    if (!draft) return;
    if (t.dataset.draft === "role")
      draft =
        draft.kind === "aircraft"
          ? automaticAircraftDraft(state, content, t.value)
          : automaticDraft(state, content, t.value);
    else
      draft[t.dataset.draft] =
        t.dataset.draft === "name" ? t.value : Number(t.value);
    render();
    return;
  }
  if (t.dataset.funding)
    await mutate(
      {
        type: "funding",
        args: { field: t.dataset.funding, value: Number(t.value) / 100 },
      },
      "Facility funding order transmitted.",
    );
  if (t.dataset.production)
    await mutate(
      {
        type: "production",
        args: { role: t.dataset.production, model: t.value },
      },
      "Aircraft production order transmitted.",
    );
  if (t.dataset.productionAutomatic)
    await mutate({ type: "production-automatic", args: { role: t.dataset.productionAutomatic, enabled: t.checked } },
      t.checked ? "Automatic aircraft modernization enabled." : "Production line holds its chosen model.");
  if (t.id === "sound-enabled" || t.id === "sound-volume")
    await mutate(
      {
        type: "settings",
        args:
          t.id === "sound-enabled"
            ? { audioEnabled: t.checked }
            : { audioVolume: Number(t.value) / 100 },
      },
      "",
      true,
    );
  if (t.id === "music-enabled" || t.id === "music-volume")
    await mutate(
      {
        type: "settings",
        args:
          t.id === "music-enabled"
            ? { musicEnabled: t.checked }
            : { musicVolume: Number(t.value) / 100 },
      },
      "",
      true,
    );
  if (t.id === "speed")
    await mutate({ type: "speed", args: { value: Number(t.value) } }, "", true);
  if (t.id === "fleet-filter") {
    fleetFilter = t.value;
    render();
  }
  if (t.id === "design-filter") {
    designFilter = t.value;
    viewPages.design = 0;
    render();
  }
  if (t.id === "order-count") {
    dialog.count = sim.clamp(Math.trunc(Number(t.value) || 1), 1, 20);
    render();
    document.querySelector("#order-count")?.focus();
  }
});
document.addEventListener("keydown", (event) => {
  if (
    state &&
    ["command", "land", "airwar"].includes(view) &&
    !dialog &&
    event.target.closest(".world-map") &&
    ["Home", "+", "=", "-", "_"].includes(event.key)
  ) {
    event.preventDefault();
    if (event.key === "Home")
      Object.assign(chart, { zoom: 1, cx: 600, cy: 300, rotation: 0 });
    else
      chart.zoom = sim.clamp(
        chart.zoom * (["+", "="].includes(event.key) ? 1.4 : 1 / 1.4),
        1,
        64,
      );
    render();
    return;
  }
  if (event.key === "Enter" && event.target.closest("svg [data-action]")) {
    event.preventDefault();
    event.target
      .closest("[data-action]")
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return;
  }
  if (event.key === "Escape" && dialog) {
    dialog = null;
    render();
    return;
  }
  if (
    event.key === "Tab" &&
    (dialog || state?.decisions.some((d) => d.popup))
  ) {
    const nodes = [
        ...app.querySelectorAll(
          ".modal button:not([disabled]),.modal input,.modal select",
        ),
      ],
      first = nodes[0],
      last = nodes.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
    return;
  }
  if (
    !state ||
    dialog ||
    state.decisions.some((d) => d.popup) ||
    ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(event.target.tagName)
  )
    return;
  if (event.code === "Space") {
    event.preventDefault();
    mutate({ type: "pause" }, "", true);
  }
  if (["1", "2", "3", "4", "5"].includes(event.key))
    mutate(
      { type: "speed", args: { value: SPEEDS[Number(event.key) - 1][0] } },
      "",
      true,
    );
});
document.addEventListener("visibilitychange", async () => {
  if (document.hidden && state) {
    await mutate({ type: "pause", args: { value: true } }, "", true);
    await persist(true);
  } else if (state) render();
});
window.addEventListener("pagehide", () => {
  if (state) {
    writeRecovery(state);
    fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...state,
        paused: true,
        savedAt: new Date().toISOString(),
      }),
      keepalive: true,
    }).catch(() => {});
  }
});
// The stable app element captures the pointer, so replacing the SVG during a drag is safe.
app.addEventListener("pointerdown", (event) => {
  if (!state || event.button !== 0 || !event.target.closest(".world-map"))
    return;
  const box = event.target.closest(".world-map").getBoundingClientRect();
  drag = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    rotation: chart.rotation || 0,
    cy: chart.cy,
    width: box.width,
    height: box.height,
    moved: false,
  };
});
app.addEventListener("pointermove", (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  const dx = event.clientX - drag.x,
    dy = event.clientY - drag.y;
  if (Math.hypot(dx, dy) < 4 && !drag.moved) return;
  if (!drag.moved) app.setPointerCapture(event.pointerId);
  drag.moved = true;
  chart.rotation = wrapLongitude(
    drag.rotation - (dx * 360) / (drag.width * chart.zoom),
  );
  chart.cy = sim.clamp(
    drag.cy - (dy * 600) / (drag.height * chart.zoom),
    300 / chart.zoom,
    600 - 300 / chart.zoom,
  );
  if (!mapFrame)
    mapFrame = requestAnimationFrame(() => {
      mapFrame = 0;
      render();
    });
});
function endDrag(event) {
  if (!drag || event.pointerId !== drag.id) return;
  if (drag.moved) suppressClickUntil = performance.now() + 300;
  try {
    app.releasePointerCapture(event.pointerId);
  } catch {}
  drag = null;
}
window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", endDrag);
app.addEventListener("dblclick", (event) => {
  clearTimeout(mapClickTimer);
  if (!state || !event.target.closest(".world-map")) return;
  event.preventDefault();
  const target = event.target.closest("[data-action]");
  if (target && target.dataset.action.startsWith("select-")) return;
  const svg = event.target.closest("svg"),
    p = svg.createSVGPoint();
  p.x = event.clientX;
  p.y = event.clientY;
  const local = p.matrixTransform(svg.getScreenCTM().inverse());
  centerChart(chart, chartCoordinates([local.x, local.y], chart.rotation), {
    zoom: true,
  });
  render();
});
app.addEventListener(
  "wheel",
  (event) => {
    if (!state || !event.target.closest(".world-map")) return;
    event.preventDefault();
    chart.zoom = sim.clamp(
      chart.zoom * (event.deltaY < 0 ? 1.18 : 1 / 1.18),
      1,
      64,
    );
    render();
  },
  { passive: false },
);
function importCampaign() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.onchange = async () => {
    try {
      const file = input.files[0];
      if (!file) return;
      if (file.size > 8_000_000)
        throw new Error("This save file is too large.");
      const imported = validateSave(JSON.parse(await file.text()), bundle);
      if (state)
        openDialog({
          type: "confirm",
          title: "Load the imported campaign?",
          body: `${PROFILES[imported.player].name} · ${smallDate(imported.day)}. Your current campaign will be replaced after saving. Export it first if you want to keep it.`,
          label: "Load campaign",
          imported: true,
          run: async () => {
            resetSessionViews();
            state = imported;
            view = "command";
            dialog = null;
            lastSaveDay = state.day;
            soundTracker.reset();
            await simulation.start(bundle, state);
            render();
            scheduleSave();
          },
        });
      else {
        fleetSelection.clear();
        state = imported;
        view = "command";
        dialog = null;
        lastSaveDay = state.day;
        soundTracker.reset();
        await simulation.start(bundle, state);
        render();
        scheduleSave();
      }
      toast("Save file validated.");
    } catch (error) {
      toast(error.message);
    }
  };
  input.click();
}
let hoverTimer,
  hoverTarget = null;
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    hideClassHover();
    render();
  }, 100);
});
const classTip = document.createElement("aside");
classTip.className = "class-hover";
classTip.setAttribute("role", "tooltip");
classTip.hidden = true;
document.body.append(classTip);
function hideClassHover() {
  clearTimeout(hoverTimer);
  if (classTip) classTip.hidden = true;
  hoverTarget = null;
}
let hoverPoint = null,
  hoverScrollTimer;
function inspectHover(event) {
  if (Number.isFinite(event.clientX))
    hoverPoint = [event.clientX, event.clientY];
  const target = event.target.closest(
    "[data-resource], [data-aircraft], [data-ship], [data-class], [data-fleet-hover], [data-map-hover], button:disabled, select:disabled",
  );
  if (!target || target === hoverTarget) return;
  hideClassHover();
  hoverTarget = target;
  hoverTimer = setTimeout(() => {
    if (!target.isConnected) return;
    const shipTip = target.dataset.ship
      ? "<h3>" +
        esc(player().groups.find((g) => g.id === target.dataset.ship)?.name) +
        "</h3>" +
        shipDetails(state, content, target.dataset.ship) +
        (content.classes[target.dataset.class]
          ? classHover(content.classes[target.dataset.class])
          : "")
      : "";
    const cl = content.classes[target.dataset.class],
      f = player().fleets.find((f) => f.id === target.dataset.fleetHover);
    const aircraft = [
        ...(content.nations[state.player].aircraft || []),
        ...(content.nations[state.player].armyAircraft || []),
      ].find((a) => a.id === target.dataset.aircraft),
      aircraftTip = aircraft ? aircraftHover(aircraft, content) : "";
    const resourceTip = target.dataset.resource
      ? resourceHover(state, content, target.dataset.resource)
      : "";
    const mapTip = target.dataset.mapHover
        ? mapHover(
            state,
            content,
            target.dataset.mapHover,
            sim.yearOf(state) < 1936 ? POLITICAL_1922 : POLITICAL,
          )
        : "",
      blocked = target.disabled
        ? target.dataset.disabledReason || target.title
        : "";
    if (
      !shipTip &&
      !cl &&
      !f &&
      !mapTip &&
      !blocked &&
      !resourceTip &&
      !aircraftTip
    )
      return;
    classTip.classList.toggle("fleet-hover", !!f);
    classTip.classList.toggle("base-hover", target.dataset.mapHover?.startsWith("port:") || false);
    classTip.classList.toggle("resource-hover", !!resourceTip);
    const resourceBar=target.closest('.resource-bar'),
      hoverTop=resourceBar ? resourceBar.getBoundingClientRect().bottom+8 : 8;
    classTip.style.maxHeight=resourceBar ? Math.max(160,innerHeight-hoverTop-8)+'px' : '';
    classTip.innerHTML = blocked
      ? '<span class="eyebrow">UNAVAILABLE</span><p>' + esc(blocked) + "</p>"
      : resourceTip ||
        aircraftTip ||
        shipTip ||
        mapTip ||
        (cl
          ? classHover(cl)
          : target.dataset.hoverMode === "readiness"
            ? fleetReadinessHover(state, content, f)
            : fleetCompositionHover(state, content, f));
    classTip.hidden = false;
    const box = target.getBoundingClientRect(),
      width = classTip.offsetWidth,
      height = classTip.offsetHeight;
    const left =
      box.right + 12 + width <= innerWidth - 8
        ? box.right + 12
        : box.left - width - 12 >= 8
          ? box.left - width - 12
          : Math.max(8, Math.min(innerWidth - width - 8, box.right + 12));
    classTip.style.left = left + "px";
    classTip.style.top =
      (resourceBar ? hoverTop : Math.max(8, Math.min(innerHeight - height - 8, box.top))) + "px";
  }, 220);
}
app.addEventListener("focusin", inspectHover, true);
app.addEventListener("focusout", hideClassHover, true);
app.addEventListener("pointerover", inspectHover, true);
app.addEventListener("pointermove", inspectHover, true);
app.addEventListener("pointerout", (event) => {
  if (
    hoverTarget &&
    !hoverTarget.contains(event.relatedTarget) &&
    !classTip.contains(event.relatedTarget)
  )
    hideClassHover();
});
classTip.addEventListener("pointerleave", (event) => {
  if (!hoverTarget?.contains(event.relatedTarget)) hideClassHover();
});
app.addEventListener("pointerdown", hideClassHover);
app.addEventListener(
  "scroll",
  () => {
    hideClassHover();
    clearTimeout(hoverScrollTimer);
    hoverScrollTimer = setTimeout(() => {
      if (hoverPoint) {
        const target = document.elementFromPoint(...hoverPoint);
        if (target && app.contains(target)) inspectHover({ target });
      }
    }, 120);
  },
  true,
);

// The desktop shell waits for this narrow, renderer-owned save operation on close.
globalThis.saveForDesktopClose = async () => {
  if (!state) return true;
  clearTimeout(saveTimer);
  if (simulation.worker)
    await simulation.dispatch({ type: "pause", args: { value: true } });
  clearTimeout(saveTimer);
  const snapshot = simulation.worker
    ? await simulation.snapshot()
    : structuredClone(state);
  snapshot.paused = true;
  await saveCampaign(snapshot);
  writeRecovery(snapshot);
  return true;
};
