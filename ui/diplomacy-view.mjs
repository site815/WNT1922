import {
  TREATY_POLICIES,
  TREATY_SWITCH_GOLD,
  treatyAssessment,
} from "../mechanics/treaty-policy.mjs";
import {
  DIPLOMACY,
  diplomaticBlock,
  diplomaticTerms,
  PACT_MODIFIERS,
  readyProvocationFleet,
} from "../mechanics/diplomacy-rules.mjs";
import { NATION_ORDER, PROFILES } from "../mechanics/catalog.mjs";
import { timedProgress, dateLabel } from "./progress-view.mjs";
import { warBalances } from "../mechanics/war-balance.mjs";
import { activePacts } from "../mechanics/war-politics.mjs";
import { diplomaticOffersView } from './diplomatic-offers-view.mjs';
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const num = (v) => Math.round(v || 0).toLocaleString("en-US");
export const diplomaticCost = (p) =>
  Object.entries(p)
    .filter(([, v]) => v)
    .map(([k, v]) => num(v) + " " + k)
    .join(" · ") || "No resource cost";
const percent = v => (v > 0 ? '+' : '−') + Math.round(Math.abs(v)*100) + '%';
export function diplomaticEffectLabel(effect) {
  return ['price','gain'].flatMap(field => Object.entries(effect[field] || {}).map(([resource,amount]) =>
    percent(amount) + ' ' + resource + (field === 'price' ? ' cost' : ' received'))).join(' · ');
}
export function diplomaticHint(s, c, target, action) {
  const r = diplomaticTerms(s,c,target,action);
  if (!r) return 'Choose another government and a valid diplomatic action.';
  return (
    r.name +
    ": " +
    diplomaticCost(r.price) +
    (Object.keys(r.gain).length ? " → " + diplomaticCost(r.gain) : "") +
    '. Available every ' + r.days + ' days, separately for this action and country. ' +
    (r.effects.length ? 'Treaty effects: ' + r.effects.map(e => e.label + ': ' + diplomaticEffectLabel(e)).join('; ') + '. ' : 'Standard terms; no active treaty modifier. ') +
    (Object.keys(r.partnerPrice || {}).length ? PROFILES[target].name + ' pays ' + diplomaticCost(r.partnerPrice) + ' and receives ' + diplomaticCost(r.partnerGain) + '. Both ministries exchange existing stock and gold; the partner can refuse to protect its reserves. Settlement is immediate and does not count as merchant delivery or GDP/GTP income. ' : '') +
    (action === 'sellStrategic' ? 'Exports use your stored strategic materials. ' : '') +
    (action === "provoke"
      ? "Automatically send the strongest ready task force for 90 days. An overlap locks both forces into pursuit of one limited battle, even after deployment expires. Admirals use normal routes, supply, scouting and aircraft cycles. A new order cancels deployment without refund. Selected force: " + (readyProvocationFleet(s, c, target)?.name || "none ready") + "."
      : "") +
    (action === "visit" ? " Influence is capped at 500." : "")
  );
}
export function diplomacyView(s, c) {
  const n = s.nations[s.player],
    ledger = treatyAssessment(s, c),
    outside = s.player === "SOV";
  const current = outside
    ? "Not a treaty signatory"
    : ledger.active
      ? TREATY_POLICIES[n.treatyPolicy]
      : "Treaty expired";
  const hint = (p) => {
    const t = treatyAssessment(s, c, s.player, p);
    return (
      TREATY_POLICIES[p] +
      ": " +
      num(t.gold) +
      " gold and " +
      t.influence.toFixed(2) +
      " influence per month. " +
      (p === "disclose"
        ? "No monthly penalty within treaty allowances or up to 10% above them. Excess beyond that tolerance attracts sanctions."
        : p === "false_numbers"
          ? "Costs scale with the number of concealed hulls."
          : "Costs scale with concealed displacement.")
    );
  };
  const treaty =
    '<section class="panel treaty-panel"><div><span class="eyebrow">TREATY POLICY</span><h2>' +
    esc(current) +
    '</h2><p class="treaty-current">Current state: <strong>' +
    esc(
      ledger.active
        ? ledger.excessTons
          ? "Above treaty limits"
          : "Within treaty limits"
        : outside
          ? "Outside the agreement"
          : "Limits have lapsed",
    ) +
    '</strong></p>' + (ledger.active ? '<div class="treaty-obligations"><strong>Treaty obligations</strong>' + ledger.obligations.map(o => '<p>' + (o.category === 'capital' ? 'Capital ships' : 'Aircraft carriers') + ': <b>' + num(o.limit) + ' t</b> limit · ' + num(o.actual) + ' t held' + (o.allowance > o.limit ? ' · ' + num(o.allowance) + ' t authorized retention' : '') + '</p>').join('') + '<small>New hull limits: capital ' + num(ledger.perHullLimits.capital) + ' t · carrier ' + num(ledger.perHullLimits.carrier) + ' t · cruiser ' + num(ledger.perHullLimits.cruiser) + ' t. Historical retained-ship exceptions apply; Germany before 1935 has separate restrictions.</small></div>' : '') +
    '<div class="treaty-ledger"><div><b>' +
    num(ledger.actual) +
    " t</b><span>actual capital / carrier tonnage</span></div><div><b>" +
    num(ledger.excessTons) +
    " t · " +
    ledger.excessHulls +
    " hulls</b><span>actual excess (before pricing tolerance)</span></div></div><small>Disclosure subject to sanctions: " + num(ledger.disclosureBillableTons) + " t beyond the 10% tolerance. Current policy: " +
    num(ledger.gold) +
    " gold · " +
    ledger.influence.toFixed(2) +
    " influence / month</small></div><div><p>" +
    (ledger.active
      ? "Limits expire " +
        dateLabel(s.treatyUntil) +
        ". Switching policy costs " +
        num(TREATY_SWITCH_GOLD) +
        " gold."
      : outside
        ? "The Soviet Union is outside the naval treaty system."
        : "Open construction is permitted.") +
    "</p>" +
    (ledger.active
      ? '<label for="treaty-policy">Change policy</label><select id="treaty-policy">' +
        Object.entries(TREATY_POLICIES)
          .map(
            ([id, label]) =>
              '<option value="' +
              id +
              '" ' +
              (n.treatyPolicy === id ? "selected" : "") +
              ' title="' +
              esc(hint(id)) +
              '">' +
              label +
              " · " +
              num(treatyAssessment(s, c, s.player, id).gold) +
              " gold / month</option>",
          )
          .join("") +
        '</select><button class="action-slot" data-action="treaty" ' +
        (n.gold < TREATY_SWITCH_GOLD
          ? 'disabled data-disabled-reason="Need ' +
            num(TREATY_SWITCH_GOLD - n.gold) +
            ' more gold for the switching fee."'
          : "") +
        ' title="' +
        esc(Object.keys(TREATY_POLICIES).map(hint).join(" ")) +
        '">Apply treaty policy · ' +
        num(TREATY_SWITCH_GOLD) +
        " gold</button>"
      : "") +
    "</div></section>";

  const wars = warBalances(s),
    governments = NATION_ORDER.filter((id) => id !== s.player)
      .map((id) => {
        const p = PROFILES[id],
          r = s.relations[[s.player, id].sort().join("-")],
          w = wars.find((w) => w.opponent === id),
          deployment = s.provocations.find(
            (p) => p.nation === s.player && p.target === id,
          );
        const actions = Object.entries(DIPLOMACY)
          .map(([action, rule]) => {
            const until = n.cooldowns[action + "-" + id],
              hint = diplomaticHint(s, c, id, action),
              block = diplomaticBlock(s, c, id, action),
              terms = diplomaticTerms(s, c, id, action);
            if (until > s.day + (s.fraction || 0))
              return timedProgress(s, {
                end: until,
                duration: rule.days,
                label: rule.name,
                datePrefix: "Next ",
                hint,
              });
            return (
              '<button class="action-slot" data-action="diplomatic" data-id="' +
              id +
              '" data-kind="' +
              action +
              '" ' +
              (block
                ? 'disabled data-disabled-reason="' + esc(block) + '"'
                : "") +
              ' title="' +
              esc(hint + (block ? " " + block : "")) +
              '">' +
              '<span>' + esc(rule.name) + '</span><small class="diplomatic-action-terms">' +
              esc(diplomaticCost(terms.price) + (Object.keys(terms.gain).length ? ' → ' + diplomaticCost(terms.gain) : '')) +
              '</small></button>'
            );
          })
          .join("");
        return (
          '<article class="panel government" style="--nation:' +
          p.color +
          '"><span class="nation-code" style="color:' +
          p.color +
          '">' +
          id +
          '</span><h2 style="color:' +
          p.color +
          '">' +
          p.name +
          '</h2><p class="badge ' +
          (r.war ? "war" : "") +
          '">' +
          (r.war ? "At war" : r.allied ? "Allied · naval access" : "At peace") +
          "</p>" +
          '<p class="government-war-balance">' + (w ? 'War balance: ' + esc(w.result) : 'No active war balance') + '</p>' +
          '<div class="government-treaty-effects" aria-label="Treaty effects">' + (() => {
            const effects = Object.keys(DIPLOMACY).flatMap(action => diplomaticTerms(s,c,id,action).effects);
            const unique = [...new Map(effects.map(e => [e.id,e])).values()];
            return unique.length ? unique.map(e => '<small><strong>' + esc(e.label) + '</strong> · adjusted action terms below</small>').join('') : '<small>' + (r.war ? 'Bilateral exchanges suspended during war' : 'Standard diplomatic terms') + '</small>';
          })() + '</div>' +
          '<div class="government-actions">' +
          actions +
          '</div>' +
          '<small class="deployment-state">' +
          (deployment
            ? esc(
                n.fleets.find((f) => f.id === deployment.fleetId)?.name ||
                  "Task force",
              ) +
              (deployment.encounterId
                ? " · Seeking the opposing demonstration"
                : " deployed until " + dateLabel(deployment.endsAt / 1440))
            : "No demonstration deployed") +
          "</small>" +
          "</article>"
        );
      })
      .join("");
  return (
    '<div class="view-heading"><div><span class="eyebrow">GOVERNMENTS & TREATIES</span><h1>Diplomacy</h1></div></div>' +
    diplomaticOffersView(s,c) +
    treaty +
    '<div class="pact-summary">' +
    activePacts(s)
      .map(
        (p) =>
          "<article><strong>" +
          esc(p.name) +
          "</strong><small>" +
          p.members.map((id) => PROFILES[id].name).join(" / ") +
          "</small><small>" +
          (p.kind === "defensive"
            ? "Shared naval access · historical war entries"
            : p.kind === 'consultation' ? 'Consultation agreement' : 'Political agreement') +
          '</small><small class="pact-bonuses">' +
          esc(p.members.length < 2 ? 'No other playable signatory; no bilateral action modifier.' : Object.entries(PACT_MODIFIERS[p.kind] || {}).map(([action,effect]) => DIPLOMACY[action].name + ': ' + diplomaticEffectLabel(effect)).join('; ')) +
          '</small></article>',
      )
      .join("") +
    '</div><div class="government-grid">' +
    governments +
    "</div>"
  );
}
