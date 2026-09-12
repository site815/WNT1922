import { navalInfluence, POWERS } from "../mechanics/land-war.mjs";
import { commandView } from "./command-view.mjs";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const pct = (n) => Math.round((n || 0) * 100) + "%";
export function landView(s, c, ui = {}, data = {}) {
  const fronts = [...(s.world?.fronts || [])].sort(
    (a, b) =>
      Number([b.attacker, b.defender].includes(s.player)) -
      Number([a.attacker, a.defender].includes(s.player)),
  );
  const panel =
    '<div class="panel-title"><h2>Land campaigns</h2><span>' +
    fronts.length +
    ' fronts</span></div><p class="panel-note">Naval supply matters most for islands, moderately for overseas armies, and less in continental interiors.</p><div class="land-campaign-list">' +
    fronts
      .map(
        (f) =>
          '<button class="land-campaign-card" data-action="select-front" data-id="' +
          f.id +
          '" data-map-hover="front:' +
          f.id +
          '"><span class="eyebrow">' +
          esc(f.status) +
          "</span><strong>" +
          esc(f.name) +
          '</strong><small><span style="color:' +
          POWERS[f.attacker]?.color +
          '">' +
          esc(POWERS[f.attacker]?.name || f.attacker) +
          '</span> / <span style="color:' +
          POWERS[f.defender]?.color +
          '">' +
          esc(POWERS[f.defender]?.name || f.defender) +
          '</span></small><div class="front-progress"><i style="width:' +
          pct(f.progress) +
          ";background:" +
          POWERS[f.attacker]?.color +
          '"></i></div><small>Attacker ' +
          pct(f.progress) +
          " · naval influence " +
          navalInfluence(f) +
          "</small><small>Supply " +
          pct(f.attackerSupply) +
          " / " +
          pct(f.defenderSupply) +
          "</small></button>",
      )
      .join("") +
    "</div>" +
    (!fronts.length
      ? "<p>No active fronts. Historical campaigns and wartime island assaults will appear here.</p>"
      : "");
  return commandView(s, c, { ...ui, mode: "land", sidePanel: panel }, data);
}
export function strategicAirView(s, c, ui = {}, data = {}) {
  const n = s.nations[s.player],
    damage = n.industrialDamage || {},
    panel =
      '<div class="panel-title"><h2>Strategic air campaigns</h2></div><p>Industry disruption <b>' +
      pct(damage.industry) +
      "</b><br>Yard disruption <b>" +
      pct(damage.yards) +
      '</b></p><p class="panel-note">Government air commands select raids automatically. Range, bomb load, weather, escorts, defenses and supply determine results. Repairs use gold and industry after 24 safe hours.</p><div class="strategic-log">' +
      (n.strategicLog || [])
        .map(
          (r) =>
            '<button class="land-campaign-card" data-action="select-port" data-id="' +
            r.target +
            '"><span class="eyebrow">' +
            new Date(r.minute * 60000).toISOString().slice(0, 10) +
            "</span><strong>" +
            esc(POWERS[r.attacker]?.name) +
            " → " +
            esc(r.target) +
            "</strong><small>" +
            r.bombers +
            " bombers · " +
            r.escorts +
            " escorts</small><small>" +
            esc(r.category) +
            " disruption " +
            pct(r.damage) +
            "</small></button>",
        )
        .join("") +
      "</div>" +
      (!n.strategicLog?.length
        ? "<p>No completed raids involving your country.</p>"
        : "");
  return commandView(s, c, { ...ui, mode: "airwar", sidePanel: panel }, data);
}
