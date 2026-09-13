import { airOperationsText } from "../mechanics/air-operations.mjs";
import { navalInfluence, POWERS } from "../mechanics/land-war.mjs";
import { campaignMinutes } from "../mechanics/campaign-clock.mjs";
import { modelFerryKm } from "../mechanics/base-aviation.mjs";
import { portSpec } from "../mechanics/port-catalog.mjs";
import { uiModel, displayedFleet } from "../mechanics/queries.mjs";
import { PROFILES, TYPES } from "../mechanics/catalog.mjs";
import { PORTS, HOME_PORT, MAP_CAPITALS } from "../mechanics/world.mjs";
import { portSummary, PORT_REPAIR } from "../mechanics/ports.mjs";
import {
  fullyStaffed,
  crewEffectiveness,
  compareShips,
} from "../mechanics/ship-staffing.mjs";
import { compositionText } from "../mechanics/composition.mjs";
import {
  MISSIONS,
  fleetPosition,
  convoyCoverage,
  visibleContacts,
  fleetStatus,
} from "../mechanics/task-forces.mjs";
import { capitalClock } from "../mechanics/campaign-clock.mjs";
import { aircraftModels } from "../mechanics/naval-resources.mjs";
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
const list = (rows) =>
  '<dl class="inspection-list">' +
  rows
    .map(([k, v]) => "<div><dt>" + k + "</dt><dd>" + v + "</dd></div>")
    .join("") +
  "</dl>";
export function mapHover(s, c, key, data = {}) {
  const [kind, id] = key.split(":");
  if (kind === "port" && PORTS[id])
    return (
      "<h3>" +
      esc(PORTS[id].name) +
      "</h3>" +
      portPopup(s, c, id) +
      "<small>Click to center · double-click to zoom.</small>"
    );
  if (kind === "front") {
    const f = s.world?.fronts.find((f) => f.id === id);
    if (!f) return "";
    return (
      "<h3>" +
      esc(f.name) +
      "</h3>" +
      list([
        ["Status", esc(f.status)],
        [
          "Forces",
          esc(POWERS[f.attacker]?.name || f.attacker) +
            " / " +
            esc(POWERS[f.defender]?.name || f.defender),
        ],
        ["Attacker progress", num(f.progress * 100) + "%"],
        [
          "Supply: attacker / defender",
          num(f.attackerSupply * 100) +
            "% / " +
            num(f.defenderSupply * 100) +
            "%",
        ],
        ["Naval influence", navalInfluence(f)],
      ]) +
      "<p>Shipping and local naval control influence the supply of overseas forces. Click to center; double-click to zoom.</p>"
    );
  }
  if (kind === "territory") {
    const p = data.features?.find((t) => t.id === id);
    if (!p) return "";
    const owner = s.world?.control?.[id] || p.owner;
    return (
      "<h3>" +
      esc(p.name || id) +
      "</h3>" +
      list([
        [
          "Government",
          esc(
            POWERS[owner]?.name || PROFILES[owner]?.name ||
              data.features?.find(t=>t.id===owner)?.name || "Neutral government",
          ),
        ],
        [
          "Status",
          s.world?.fronts?.some(
            (f) => f.territory === id && f.status === "active",
          )
            ? "Land campaign underway"
            : "No active campaign",
        ],
      ]) +
      "<small>Click to center · double-click to zoom.</small>"
    );
  }
  if (kind === "capital" && MAP_CAPITALS[id]) {
    const p = PROFILES[id],
      r = s.relations[[s.player, id].sort().join("-")];
    return (
      '<span class="eyebrow">CAPITAL · ' +
      id +
      "</span><h3>" +
      esc(MAP_CAPITALS[id].name) +
      '</h3><p style="color:' +
      p.color +
      '">' +
      p.name +
      "</p><p>" +
      (id === s.player
        ? "Your government"
        : r
          ? r.war
            ? "At war"
            : r.allied
              ? "Allied"
              : "At peace"
          : "") +
      "</p><small>Click to center · double-click to zoom.</small>"
    );
  }
  if (kind === "contact") {
    const contact = visibleContacts(s).find((c) => c.id === id);
    if (!contact) return "";
    const clock = capitalClock(s, s.player, contact.seenAt);
    return (
      '<span class="eyebrow">REPORTED CONTACT · ' +
      contact.nation +
      "</span><h3>" +
      esc(contact.kind) +
      "</h3>" +
      list([
        ["Estimated strength", num(contact.estimate) + " hulls"],
        [
          "Confidence",
          num(contact.confidence * 100) + "% · " + esc(contact.stage),
        ],
        ["Source", esc(contact.source)],
        ["Last report", clock.date + " " + clock.time],
        ["Search radius", "±" + num(contact.uncertainty * 1.852) + " km"],
      ]) +
      "<small>Click for the last observed position and intelligence details.</small>"
    );
  }
  if (kind === "convoy") {
    const convoy = s.nations[s.player].convoys.find((c) => c.id === id);
    if (!convoy) return "";
    const clock = capitalClock(s, s.player, convoy.arriveAt),
      cover = (uiModel(s)?.escortCoverage || convoyCoverage(s, c)).convoys.find(
        (v) => v.id === id,
      );
    return (
      '<span class="eyebrow">MERCHANT SHIPPING</span><h3>' +
      esc(convoy.name) +
      "</h3>" +
      list([
        ["Merchant hulls", num(convoy.count)],
        [
          "Escort coverage",
          cover?.defense > 0
            ? cover.escorts.length +
              " nearby forces · " +
              num(cover.defense) +
              " defense"
            : "Exposed · no operational escort within 148 km",
        ],
        ["Speed", num(convoy.speed) + " kn"],
        ["Next arrival", clock.date + " " + clock.time],
      ]) +
      "<small>Click to center · double-click to zoom.</small>"
    );
  }
  return "";
}
export function fleetReadinessHover(s, c, f) {
  const n = s.nations[s.player],
    { stats, supply } = displayedFleet(s, c, f);
  return (
    '<span class="eyebrow">FLEET READINESS</span><h3>' +
    esc(f.name) +
    "</h3>" +
    list([
      ["Training / morale", num(n.training) + "% / " + num(n.morale) + "%"],
      ["Supply", num(supply.factor * 100) + "%"],
      ["Supply = distance × endurance × logistics × strategic", [supply.distanceFactor,supply.enduranceFactor,supply.logisticsFactor,supply.strategicSupplyFactor].map(v=>num(v*100)+"%").join(" × ")],
      ["Closest supply port", esc(supply.portName)],
      ["Sea-route distance / shortest hull range", num(supply.distance*1.852)+" / "+num(supply.rangeKm)+" km"],
      ["Endurance used = 2 × distance / range", num(supply.enduranceUsed*100)+"%"],
      [
        "Distance / range factor",
        num(supply.distanceFactor * 100) +
          "% / " +
          num(supply.enduranceFactor * 100) +
          "%",
      ],
      ["Hull condition", num(stats.health * 100) + "%"],
      ["Remaining endurance", num(f.fuelNm * 1.852) + " km (fleet fuel limit)"],
      [
        "Speed / maximum",
        num(f.speed, 1) + " / " + num(stats.maxSpeed, 1) + " kn",
      ],
      ["Status", esc(fleetStatus(s, f))],
      ["Air operations", esc(airOperationsText(s, c, s.player, f))],
      [
        "Engagement policy",
        f.role === "support"
          ? "Automatic support"
          : f.aggressiveBattle
            ? "Seek aggressive battle"
            : "Preserve the force at poor odds",
      ],
    ]) +
    fleetHoverManifest(s, c, f) +
    "<small>Distance and endurance use stepped penalties. Logistics research reduces the distance penalty; nearby support adds relief to both factors, capped at 100%. National logistics applies up to a 20% penalty; empty strategic reserves halve supply. Click to center and highlight this force.</small>"
  );
}
function fleetHoverManifest(s, c, f) {
  const groups = s.nations[s.player].groups
    .filter(
      (g) =>
        g.fleetId === f.id &&
        g.count &&
        !["sunk", "scrapped"].includes(g.status),
    )
    .sort(compareShips(c));
  return (
    '<div class="hover-ship-list">' +
    groups
      .map((g) => {
        const cl = c.classes[g.classId],
          status = g.scrapOnArrival
            ? "Scrapping on arrival"
            : g.reserveOnArrival
              ? "Reserve on arrival"
              : g.status === "active"
                ? g.atSea
                  ? "At sea"
                  : fullyStaffed(g, cl)
                    ? "Ready in port"
                    : "Awaiting sailors"
                : g.status;
        return (
          '<div class="hover-ship ' +
          (g.health < 0.65
            ? "serious"
            : g.health < 0.9
              ? "moderate"
              : "light") +
          '"><strong>' +
          cl.type +
          " · " +
          esc(g.name) +
          "</strong><span>" +
          num((1 - g.health) * 100) +
          "% damage · " +
          esc(status) +
          "</span><small>" +
          num(g.sailors) +
          " / " +
          num(cl.crew * g.count) +
          " sailors" +
          (g.airWing?.length
            ? " · " +
              num(g.airWing.reduce((v, w) => v + w.count, 0)) +
              " aircraft"
            : "") +
          "</small></div>"
        );
      })
      .join("") +
    "</div>"
  );
}
export function fleetCompositionHover(s, c, f) {
  const { stats, supply } = displayedFleet(s, c, f),
    counts = {};
  for (const g of stats.active) {
    const type = c.classes[g.classId].type;
    counts[type] = (counts[type] || 0) + g.count;
  }
  return (
    '<span class="eyebrow">FLEET COMPOSITION</span><h3>' +
    esc(f.name) +
    '</h3><p class="fleet-composition">' +
    compositionText(counts, "No operational hulls") +
    "</p><p>Supply " +
    num(supply.factor * 100) +
    "% · Fuel endurance " +
    num(f.fuelNm * 1.852) +
    " km<br>" +
    esc(fleetStatus(s, f)) +
    "</p>" +
    fleetHoverManifest(s, c, f) +
    "<small>Fuel endurance is the shared fleet limit. Click to center and highlight this force; admirals control missions.</small>"
  );
}
export function classHover(c) {
  return (
    '<span class="eyebrow">' +
    c.nation +
    " · " +
    c.year +
    " · " +
    (TYPES[c.type] || c.type) +
    "</span><h3>" +
    esc(c.name) +
    "</h3>" +
    list([
      [
        "Displacement",
        num(c.tons) +
          " t standard" +
          (c.raw?.displacement?.full_load_tons
            ? " / " + num(c.raw.displacement.full_load_tons) + " t full load"
            : ""),
      ],
      ["Speed / endurance", num(c.speed, 1) + " kn / " + num(c.range) + " km"],
      ["Armor: belt / deck", num(c.belt) + " / " + num(c.deck) + " mm"],
      [
        "Guns",
        c.barrels
          ? num(c.barrels) + " × " + num(c.caliber) + " mm"
          : "No main battery",
      ],
      ["Torpedoes", num(c.tubes) + " tubes"],
      ["Aircraft", (c.air || 0) + (c.scoutAircraft || 0) + " slots"],
      ["Complement", num(c.crew) + " sailors"],
      [
        "Sensors",
        [c.radar ? "Radar" : "", c.sonar ? "Sonar" : ""]
          .filter(Boolean)
          .join(" · ") || "Visual observation",
      ],
    ]) +
    "<small>Hover a ship for its current state; click to locate it on the map.</small>"
  );
}
export function shipDetails(s, c, id) {
  const n = s.nations[s.player],
    g = n.groups.find((g) => g.id === id);
  if (!g) return "<p>This ship is no longer in the register.</p>";
  const cl = c.classes[g.classId],
    f = n.fleets.find((f) => f.id === g.fleetId),
    v = f ? displayedFleet(s, c, f) : null,
    models = new Map(aircraftModels(c, s.player).map((a) => [a.id, a]));
  return (
    '<p><b class="ship-type">' +
    cl.type +
    '</b> <button class="text-button" data-action="spec" data-id="' +
    cl.id +
    '" data-class="' +
    cl.id +
    '">' +
    esc(cl.name) +
    "</button> · " +
    g.count +
    " hull" +
    (g.count === 1 ? "" : "s") +
    '</p><div class="ship-health ' +
    (g.health < 0.65 ? "serious" : g.health < 0.9 ? "moderate" : "light") +
    '"><strong>' +
    num((1 - g.health) * 100) +
    "% damage</strong><span>" +
    esc(g.status) +
    (g.scrapOnArrival
      ? " · scrapping on arrival"
      : g.reserveOnArrival
        ? " · reserve on arrival"
        : "") +
    "</span></div>" +
    list([
      ["Assigned command", esc(f?.name || "Unassigned / dockyard")],
      [
        "Mission",
        f
          ? f.role === "support"
            ? "Automatic " +
              (f.supportTarget ? "fleet replenishment" : "port support")
            : f.role === "repair"
              ? "Return for repair"
              : f.role === "reinforcement"
                ? "Reinforce fleet"
                : MISSIONS[f.mission].name
          : "In port",
      ],
      [
        "Location",
        g.atSea && f
          ? fleetPosition(s, f)
              .map((v) => num(v, 2) + "°")
              .join(", ")
          : esc(
              PORTS[g.dockPort || f?.port || HOME_PORT[s.player]]?.name ||
                "Home port",
            ),
      ],
      ["Sailors aboard", num(g.sailors) + " / " + num(cl.crew * g.count)],
      [
        "Departure readiness",
        fullyStaffed(g, cl)
          ? "Fully staffed"
          : g.atSea
            ? "Battle casualties reduce damage control and fighting power"
            : "Cannot sail until fully staffed",
      ],
      ["Crew effectiveness", num(crewEffectiveness(g, cl) * 100) + "%"],
      ["Training / morale", num(n.training) + "% / " + num(n.morale) + "%"],
      ["Supply", v ? num(v.supply.factor * 100) + "%" : "Port support"],
      [
        "Air wing",
        (g.airWing || [])
          .map(
            (w) =>
              num(w.count) +
              " " +
              esc(models.get(w.model)?.name || w.model) +
              " (" +
              num(w.crewed) +
              " crewed)",
          )
          .join("<br>") || "No embarked aircraft",
      ],
      [
        "Repair order",
        g.status === "returning"
          ? "Sailing home; vulnerable to interception"
          : g.status === "repair"
            ? "Dockyard repairs consume gold daily"
            : "No active repair order",
      ],
    ]) +
    (g.notes ? '<p class="panel-note">' + esc(g.notes) + "</p>" : "")
  );
}
export function portPopup(s, c, id, { parts = false } = {}) {
  const p = uiModel(s)?.ports[id] || portSummary(s, c, id),
    front = s.world?.fronts.find((f) => f.port === id),
    summary =
      '<p class="port-tier">' +
      p.tierName +
      ' · <span style="color:' +
      PROFILES[p.owner]?.color +
      '">' +
      (PROFILES[p.owner]?.name || p.owner) +
      "</span></p>" +
      (front
        ? '<p class="port-campaign"><strong>' +
          esc(front.name) +
          " · " +
          esc(front.status) +
          "</strong><br>" +
          esc(front.attacker) +
          " assault progress: " +
          num(front.progress * 100) +
          "% · Supply: " +
          num(front.attackerSupply * 100) +
          "% / " +
          num(front.defenderSupply * 100) +
          "%</p>"
        : "");
  if (p.owner !== s.player) {
    const report = s.nations[s.player].anchorageReports?.[id],
      hours = report
        ? Math.max(0, Math.floor((campaignMinutes(s) - report.seenAt) / 60))
        : null,
      body = list([
        ["Charted supply capacity", num(portSpec(s, id).capacity) + " t"],
        ["Trade capacity (charted)", num(p.trade)],
        ["Coastal battery", esc(p.battery)],
        ["Charted gun radius", num(p.gunRange * 1.852) + " km"],
        [
          "Anchorage reconnaissance",
          report
            ? num(hours) + " hours old · " + esc(report.source)
            : "No aerial observation",
        ],
        [
          "Last observed ships",
          report
            ? compositionText(report.composition, "Harbor observed empty")
            : "Unknown",
        ],
      ]),
      notes =
        "<p>Foreign aircraft, stores and ships are not a live intelligence feed. Aerial reconnaissance produces dated anchorage reports; admirals use observations less than 48 hours old to plan raids.</p>";
    return parts ? { summary, body, notes } : summary + body + notes;
  }
  const body =
      list([
        ["Facility condition", num(p.health * 100) + "%"],
        [
          "Supply capacity / demand",
          num(p.capacity) + " / " + num(p.demand) + " t",
        ],
        ["Fleet support contribution", num(p.depotSupport) + " t"],
        [
          "Trade capacity",
          num(p.effectiveTrade, 1) + " / " + num(p.trade) + " trade points",
        ],
        ["Blockaded", num(p.blockade * 100) + "% of intact trade capacity"],
        ["Combat power", num(p.combat)],
        ["Artillery / aviation", num(p.artillery) + " / " + num(p.aviation)],
        [
          "Stationed / fully crewed aircraft",
          num(p.assignedAircraft) + " / " + num(p.air?.crewed),
        ],
        ["Aircraft readiness", num((p.air?.readiness || 0) * 100) + "%"],
        [
          "Incoming reinforcement",
          (s.nations[p.owner]?.airTransfers || [])
            .filter((t) => t.destination === id)
            .map(
              (t) =>
                num(t.airWing.reduce((v, w) => v + w.count, 0)) +
                " aircraft · " +
                t.mode,
            )
            .join("<br>") || "None underway",
        ],
        ["Coastal battery", esc(p.battery)],
        [
          "Gun / aviation radius",
          num(p.gunRange * 1.852) + " / " + num(p.airRange * 1.852) + " km",
        ],
        [
          "Repairs",
          p.underAttack
            ? "Under attack; repairs suspended"
            : p.health >= 1
              ? "Intact"
              : "Automatic, when resources are available",
        ],
        [
          "Daily repair budget",
          num(p.repairCost.gold) +
            " gold + " +
            num(p.repairCost.industry) +
            " industry",
        ],
      ]) +
      '<div class="aviation-base-wing">' +
      (p.air?.wings?.length
        ? "<strong>Stationed air groups</strong><ul>" +
          p.air.wings
            .map(
              (w) =>
                "<li>" +
                num(w.count) +
                " " +
                esc(w.name) +
                " · " +
                esc(w.role) +
                (w.government ? " · other service" : " · naval") +
                "<small>" +
                num(w.crewed) +
                " fully crewed · combat " +
                num(w.combatKm) +
                " km · ferry " +
                num(w.ferryKm) +
                " km</small></li>",
            )
            .join("") +
          "</ul>"
        : "<p>No stationed aircraft.</p>") +
      "</div>",
    notes =
      "<p>" +
      esc(p.note) +
      '</p><p class="panel-note">Damage reduces supply and trade; blockade reduces trade access. Safe repairs restore up to ' +
      num(PORT_REPAIR.healthPerDay * 100, 1) +
      " percentage points per day after 24 hours without attack. Land campaigns determine occupation. Capacities and battery profiles are provisional.</p><p>" +
      esc(p.gunBasis) +
      "</p><p>Supply = intact facility capacity + crewed support ships. Trade = charted trade × facility condition × (1 − blockade). Combat power = artillery + aviation. Aviation reach is the longest combat radius of qualified stationed aircraft. Full crews, weather and national strategic materials govern sorties; ferries and merchant transports deliver replacements.</p>" +
      (p.baseAviation?.heldReason
        ? "<p>" + esc(p.baseAviation.heldReason) + "</p>"
        : "");
  return parts ? { summary, body, notes } : summary + body + notes;
}

export function aircraftHover(a, c) {
  const speed = a.performance?.speed_kmh || {},
    top = Math.max(
      0,
      ...Object.entries(speed)
        .filter(([k]) => !k.includes("torpedo") && k !== "cruise")
        .map(([, v]) => v),
    ),
    weapons = (Array.isArray(a.armament) ? a.armament : [])
      .map(
        (w) =>
          (w.count || 1) +
          " × " +
          (c.equipment[w.component]?.name || w.name || w.component || "gun"),
      )
      .join(" · ");
  const rows = [
    ["Role", esc((a.role || "").replaceAll("_", " "))],
    ["Crew", a.crew?.normal || 1],
    [
      top ? "Maximum speed" : "Cruising speed",
      num(top || speed.cruise || 240) + " km/h",
    ],
    ["Combat radius", num(a.fuel?.combat_radius_km) + " km"],
    [
      "Ferry planning reach",
      num(modelFerryKm(a)) + " km (including fuel reserve)",
    ],
  ];
  if (a.performance?.ceiling_m)
    rows.push(["Ceiling", num(a.performance.ceiling_m) + " m"]);
  if (a.bomb_load_kg) rows.push(["Bomb load", num(a.bomb_load_kg) + " kg"]);
  if (a.weights?.empty_kg)
    rows.push(["Empty weight", num(a.weights.empty_kg) + " kg"]);
  if (a.weights?.max_kg || a.weights?.max_takeoff_kg)
    rows.push([
      "Maximum weight",
      num(a.weights.max_kg || a.weights.max_takeoff_kg) + " kg",
    ]);
  rows.push(
    [
      "Armament",
      esc(
        weapons ||
          (a.custom
            ? a.armament.guns +
              " × " +
              a.armament.caliber_mm +
              " mm guns; " +
              a.bomb_load_kg +
              " kg payload"
            : a.weapon_summary) ||
          "Role-specific ordnance (abstract fit)",
      ),
    ],
    [
      "Basing",
      [
        a.basing?.carrier && "Carrier deck",
        a.basing?.floatplane && "Floatplane station",
        a.basing?.land && "Shore base",
      ]
        .filter(Boolean)
        .join(" · "),
    ],
  );
  return (
    '<span class="eyebrow">AIRCRAFT CLASS · ' +
    a.type_year +
    "</span><h3>" +
    esc(a.name) +
    "</h3>" +
    list(rows)
  );
}
