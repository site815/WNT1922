import {
  DESIGN_ROLES,
  SHIP_FEATURES,
  evaluateDesign,
} from "../mechanics/designer.mjs";
import {
  AIR_ROLES,
  AIR_FEATURES,
  evaluateAircraft,
} from "../mechanics/aircraft-designer.mjs";
const esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    ),
  num = (v) => Math.round(v || 0).toLocaleString("en-US");
export function designerView(s, recipe) {
  if (!recipe) return "";
  const aircraft = recipe.kind === "aircraft",
    n = s.nations[s.player];
  let r,
    error = "";
  try {
    r = (aircraft ? evaluateAircraft : evaluateDesign)(recipe, s.player);
  } catch (e) {
    error = e.message;
  }
  const fields = aircraft
    ? [
        ["hp", "Power per engine · hp", 100, r?.limits.maxHP || 3000, 50],
        ["engines", "Engines", 1, 4, 1],
        ["caliber", "Gun caliber · mm", 7, 30, 1],
        ["guns", "Gun barrels", 0, 12, 1],
        [
          "bombs",
          "Bomb / torpedo payload · kg",
          0,
          r?.limits.maxBomb || 5000,
          50,
        ],
        ["armor", "Armor protection · kg", 0, 600, 10],
        ["fuel", "Usable fuel · kg", 80, 6000, 20],
      ]
    : [
        ["hp", "Shaft power · hp", 200, r?.limits.maxHP || 300000, 1000],
        ["caliber", "Main gun caliber · mm", 0, r?.limits.maxCaliber || 508, 1],
        ["guns", "Main gun barrels", 0, 16, 1],
        ["torpedoes", "Torpedo tubes", 0, 24, 1],
        ["armor", "Belt armor · mm", 0, 450, 5],
        ["deckArmor", "Deck armor · mm", 0, 200, 5],
        ["aa", "AA gun barrels", 0, 100, 1],
        ["fuel", "Fuel stowage · t", 40, 18000, 50],
        ["aircraft", "Embarked aircraft", 0, r?.limits.maxAir || 0, 1],
      ];
  const block =
    error ||
    (!r?.valid ? "The derived fit exceeds this role’s feasible limits." : "") ||
    (n.gold < (r?.fee || 0) ? "Insufficient gold for the drafting fee." : "");
  const features = aircraft ? AIR_FEATURES : SHIP_FEATURES,
    roles = aircraft ? AIR_ROLES : DESIGN_ROLES;
  const stats = r
    ? aircraft
      ? [
          ["Empty / loaded", num(r.empty) + " / " + num(r.loaded) + " kg"],
          ["Maximum speed", num(r.speed) + " km/h"],
          [
            "Combat / ferry range",
            num(r.radius) + " / " + num(r.ferry) + " km",
          ],
        ]
      : [
          ["Displacement", num(r.tons) + " t"],
          ["Maximum speed", r.speed + " kn"],
          ["Endurance", num(r.rangeKm) + " km"],
        ]
    : [];
  return (
    '<section class="panel ship-designer component-designer"><div class="panel-title"><div><span class="eyebrow">' +
    recipe.year +
    " DESIGN BUREAU</span><h2>New " +
    (aircraft ? "aircraft" : "ship") +
    ' draft</h2></div><button data-action="close-designer">Close designer</button></div><p>Choose components; weight, performance and production cost are calculated. The drafting fee registers the plan. ' +
    (aircraft
      ? "Select it in the factory model controls to start production."
      : "Order hulls separately from the catalog.") +
    '</p><div class="draft-top"><label>Design name<input data-draft="name" maxlength="70" value="' +
    esc(recipe.name) +
    '"></label><label>Role<select data-draft="role">' +
    Object.entries(roles)
      .map(
        ([id, label]) =>
          '<option value="' +
          id +
          '" ' +
          (id === recipe.role ? "selected" : "") +
          ">" +
          label +
          "</option>",
      )
      .join("") +
    '</select></label><button data-action="generate-draft" title="Suggest components for this role, current year and your national program. No resources are spent.">Suggest components</button></div><div class="draft-fields">' +
    fields
      .map(
        ([key, label, min, max, step]) =>
          "<label>" +
          label +
          '<input type="number" data-draft="' +
          key +
          '" min="' +
          min +
          '" max="' +
          max +
          '" step="' +
          step +
          '" value="' +
          recipe[key] +
          '"></label>',
      )
      .join("") +
    '</div><div class="draft-features">' +
    Object.entries(features)
      .map(([key, f]) => {
        const reason =
          f.year > recipe.year
            ? "Available in " + f.year
            : key === "radar" && n.tech.radar < 6
              ? "Detection level 6 required."
              : "";
        return (
          '<label class="check-label" title="' +
          esc(reason || f.label) +
          '"><input type="checkbox" data-draft-feature="' +
          key +
          '" ' +
          (recipe.features?.includes(key) ? "checked" : "") +
          " " +
          (reason
            ? 'disabled data-disabled-reason="' + esc(reason) + '"'
            : "") +
          ">" +
          f.label +
          "</label>"
        );
      })
      .join("") +
    "</div>" +
    (r
      ? '<div class="draft-weights">' +
        Object.entries(r.weights)
          .filter(([, v]) => v > 0)
          .map(
            ([key, v]) =>
              '<span title="' +
              key +
              ": " +
              num(v) +
              (aircraft ? " kg" : " t") +
              '" style="flex-grow:' +
              v +
              '">' +
              key +
              "</span>",
          )
          .join("") +
        '</div><div class="draft-quote">' +
        stats
          .map(([k, v]) => "<span>" + k + "<br><b>" + v + "</b></span>")
          .join("") +
        "<span>Per " +
        (aircraft ? "aircraft" : "hull") +
        "<br><b>" +
        num(r.gold) +
        "</b> gold · <b>" +
        num(r.industry) +
        "</b> industry</span><span>Drafting fee<br><b>" +
        num(r.fee) +
        "</b> gold</span></div>"
      : "") +
    '<p class="panel-note">Rounded engineering estimates. Heavy armor, weapons, fuel and equipment add weight and cost; engine power affects speed and fuel use. Era and role limits apply.</p>' +
    (block ? '<p class="block-reason">' + esc(block) + "</p>" : "") +
    '<button class="primary" data-action="' +
    (aircraft ? "commission-aircraft" : "commission-draft") +
    '" ' +
    (block ? 'disabled data-disabled-reason="' + esc(block) + '"' : "") +
    ">Pay drafting fee & register design</button></section>"
  );
}
