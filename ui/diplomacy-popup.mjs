import { capitalClock } from "../mechanics/campaign-clock.mjs";
import { activeDispatch, decisionIsChoice } from "../mechanics/alert-lifecycle.mjs";
import { affordability, projectBlock, projectPrice } from "../mechanics/engine.mjs";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function politicalPopup(s) {
  const d = s?.decisions.find(activeDispatch);
  if (!d) return "";
  const choice = decisionIsChoice(d), deadline=capitalClock(s,s.player,d.deadline);
  const dismissHint=choice?'Return without deciding. The displayed default applies at the deadline.':'Acknowledge this announcement and return to the ministry.';
  return (
    '<div class="modal-backdrop dispatch-backdrop"><section class="modal diplomatic-dispatch" data-dialog-type="diplomacy" data-key="dispatch-' +
    esc(d.key) +
    '" role="dialog" aria-modal="true" aria-labelledby="dispatch-title"><header><div><span class="eyebrow">' +
    (d.kind === "war" ? "WAR DECLARATION" : "DIPLOMATIC DISPATCH") +
    '</span><h2 id="dispatch-title">' +
    esc(d.title) +
    '</h2></div><button class="close" data-action="defer-decision" data-key="'+esc(d.key)+'" aria-label="Return to ministry" title="'+dismissHint+'">×</button></header><div class="modal-body" data-scroll-key="dispatch-' +
    esc(d.key) +
    '"><p>' +
    esc(d.body) +
    "</p>" +
    (choice
      ? "<small>Deadline: " +
        esc(deadline.date+' '+deadline.time+' '+deadline.zone) +
        ". If ignored: " +
        esc(d.defaultText) +
        "</small>"
      : "") +
    '</div><footer class="dispatch-options">' +
    (choice?'<button class="subtle" data-action="defer-decision" data-key="'+esc(d.key)+'" title="'+dismissHint+'">Return to ministry</button>':'')+
    d.options
      .map(
        (o) => {
          const n=s.nations[s.player], payableDefault=d.kind==="inspection" && o.id===d.defaultOption;
          const price=o.program ? projectPrice(s,o.program) : {
            gold:payableDefault?Math.min(n.gold,o.gold||0):o.gold||0,
            influence:payableDefault?Math.min(n.influence,o.influence||0):o.influence||0,
            industry:o.industry||0 };
          const blocked=(o.program?projectBlock(s,o.program):"") || affordability(n,price);
          return '<button data-action="choose" data-key="' +
          esc(d.key) +
          '" data-id="' +
          esc(o.id) +
          '" title="' +
          esc(blocked || o.detail) +
          (blocked ? '" disabled data-disabled-reason="'+esc(blocked) : '') +
          '" class="' +
          (o.id === d.options[0].id ? "primary" : "") +
          '">' +
          esc(choice ? o.label : 'Return to ministry') +
          "</button>";
        },
      )
      .join("") +
    "</footer></section></div>"
  );
}
