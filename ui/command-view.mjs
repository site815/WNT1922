import { uiModel, displayedFleet } from '../mechanics/queries.mjs';
import { PROFILES, NATION_ORDER } from '../mechanics/catalog.mjs';
import { distanceNm } from '../mechanics/world.mjs';
import { fleetPosition, convoyCoverage, fleetStatus, MISSIONS } from '../mechanics/task-forces.mjs';
import { campaignMinutes } from '../mechanics/campaign-clock.mjs';
import { mapHover } from './inspection-view.mjs';
import { linePath } from './projection.mjs';
import { ongoingMapBattles } from './battle-map.mjs';
import { mapSymbolLegend } from './map-symbols.mjs';
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const routePath = (points, rotation = 0) => linePath(points, rotation);
export function remainingRoute(s, f, now = campaignMinutes(s)) {
  if (now >= f.arriveAt) return [];
  let distance = (Math.max(0, now - f.departAt) * f.speed) / 60;
  for (let i = 1; i < f.route.length; i++) {
    const leg = distanceNm(f.route[i - 1], f.route[i]);
    if (distance <= leg) return [fleetPosition(s, f, now), ...f.route.slice(i)];
    distance -= leg;
  }
  return [];
}
const typeOrder = [
  "CV",
  "CVL",
  "BB",
  "BC",
  "CA",
  "CL",
  "DL",
  "DD",
  "DE",
  "TB",
  "SS",
  "SM",
  "AO",
  "AK",
];
const liveShips = (stats) =>
  stats.groups.filter(
    (g) => g.count && !["sunk", "scrapped"].includes(g.status),
  );
export function fleetComposition(stats, c) {
  const counts = {};
  for (const g of liveShips(stats)) {
    const t = c.classes[g.classId].type;
    counts[t] = (counts[t] || 0) + g.count;
  }
  return (
    Object.entries(counts)
      .sort(
        ([a], [b]) =>
          (typeOrder.indexOf(a) < 0 ? 99 : typeOrder.indexOf(a)) -
          (typeOrder.indexOf(b) < 0 ? 99 : typeOrder.indexOf(b)),
      )
      .map(([t, n]) => n + " " + t)
      .join(" · ") || "No ships"
  );
}
export function commandView(s, content, ui = {}) {
  const n = s.nations[s.player];
  const fleets = n.fleets.map(f => ({f, ...displayedFleet(s, content, f)}))
    .filter(row => row.stats.groups.some(g => g.count && !['sunk','scrapped'].includes(g.status)));
  const convoy = n.convoys.find(c => c.id === ui.convoyId);
  const zoom = ui.zoom || 1;
  const coverage = uiModel(s)?.escortCoverage || convoyCoverage(s, content);
  const selectedKey = ui.mode || "commands",
    columns = 1;
  const selectedFleets = new Set(ui.fleetIds || (ui.fleetId ? [ui.fleetId] : []));
  const battles = ongoingMapBattles(s);
  const battleList = battles.length ? '<div class="command-battles" aria-label="Your ongoing battles">' + battles.map(battle =>
    `<button data-action="watch-battle" data-id="${esc(battle.id)}" data-map-hover="battle:${esc(battle.id)}"><strong>Watch battle</strong><span>${esc(battle.label)}</span><progress max="1" value="${battle.stageProgress || 0}" aria-label="Current battle stage progress"></progress><small>${Math.round((battle.stageProgress || 0) * 100)}% of current stage</small></button>`).join('') + '</div>' : '';
  const fleetList =
    '<div class="panel-title"><h2>Naval commands</h2><span>' +
    fleets.length +
    ' forces' + (selectedFleets.size > 1 ? ' · ' + selectedFleets.size + ' selected' : '') + '</span></div>' + battleList + '<div class="fleet-command-list" data-scroll-key="naval-commands">' +
    fleets
      .map(({ f: ship, stats: st }) => {
        return (
          '<article class="fleet-command-row ' +
          (selectedFleets.has(ship.id) ? "selected" : "") +
          '" data-action="focus-fleet" data-id="' +
          ship.id +
          '" aria-current="'+(selectedFleets.has(ship.id) ? "true" : "false")+'" tabindex="0" role="button" title="Select this fleet; double-click or press Enter to center and fit its ships"><div data-fleet-hover="' +
          ship.id +
          '" data-hover-mode="readiness"><strong>' +
          esc(ship.name) +
          '</strong><span class="fleet-composition">' +
          fleetComposition(st, content) +
          '</span><small class="fleet-mission-status" title="'+esc((MISSIONS[ship.mission]?.description || '')+' '+fleetStatus(s,ship))+'">' +
          '<span>'+esc(MISSIONS[ship.mission]?.name || 'Fleet support')+'</span> · <span>'+esc(fleetStatus(s,ship))+'</span>' +
          "</small></div>" +
          "</article>"
        );
      })
      .join("") +
    "</div>";
  const merchantPanel = convoy ? `<section class="merchant-inspection" data-convoy-id="${esc(convoy.id)}" data-hull-index="${ui.merchantHullIndex ?? ''}"><button data-action="map-overview">Naval commands</button>${Number.isInteger(ui.merchantHullIndex) ? `<p>Merchant hull ${Math.min(convoy.count,ui.merchantHullIndex + 1)} of ${convoy.count}</p>` : ''}${mapHover(s,content,'convoy:'+convoy.id)}<p class="panel-note">Representative freighter geometry. Hull identities and spacing are for inspection; the simulation records the convoy's shared voyage and surviving count.</p></section>` : '';
  const panel = ui.sidePanel || merchantPanel + fleetList;
  const legend =
    '<div class="map-legend" aria-label="Map legend"><span class="map-zoom-level" title="Scroll to zoom · right drag pans · left drag selects fleets · middle drag orbits at close ship zoom (32768× and above) · zooming out restores north-up (16384× and below) · double-click a force to fit its ships · Home for the overhead strategic view · ship formations follow their recorded fleet position">Zoom ' + Number(zoom).toFixed(1) + '×</span>' + mapSymbolLegend() + '<span class="legend-powers" title="Country ownership colors">' +
    NATION_ORDER.map(
      (id) =>
        '<span style="color:' +
        PROFILES[id].color +
        '" title="' +
        PROFILES[id].name +
        '">' +
        id +
        "</span>",
    ).join("") +
    "</span>" +
    '<span title="Convoys currently receiving operational escort defense; inspect a convoy for its detailed coverage.">Escort cover ' +
    coverage.convoys.filter((v) => v.defense > 0).length +
    "/" +
    coverage.convoys.length +
    "</span>" +
    '<a href="/third-party-notices.html" target="_blank" rel="noreferrer">Map credits</a>' +
    "</div>";
  const map = '<section class="world-board panel" data-key="command-world" ' +
    (ui.backgroundOnly ? 'aria-hidden="true" inert' : 'aria-label="Native 3D world naval chart"') +
    '><div class="map-stage"><div class="native-world-surface" data-key="native-world-surface" data-preserve="true"></div></div>' + legend + '</section>';
  const panelLayer = '<section class="panel command-side-panel" data-key="command-selection-' +
    selectedKey +
    '" data-scroll-key="command-selection-' +
    selectedKey +
    '" aria-label="Command information and controls">' +
    panel +
    "</section>";
  const wrapper = '<div class="world-command" style="--command-columns:' + columns + '">';
  // One world chart lives behind the shell; map pages supply only their own
  // information tile. The default remains useful to standalone view consumers.
  if (ui.detachedLayers) return { map, panels: wrapper + panelLayer + '</div>' };
  return wrapper + map + panelLayer + '</div>';
}
