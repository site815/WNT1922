import { dateLabel } from "./progress-view.mjs";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function politicalPopup(s) {
  const d = s?.decisions.find((d) => d.popup);
  if (!d) return "";
  return (
    '<div class="modal-backdrop dispatch-backdrop"><section class="modal diplomatic-dispatch" data-key="dispatch-' +
    esc(d.key) +
    '" role="dialog" aria-modal="true" aria-labelledby="dispatch-title"><header><div><span class="eyebrow">' +
    (d.kind === "war" ? "WAR DECLARATION" : "DIPLOMATIC DISPATCH") +
    '</span><h2 id="dispatch-title">' +
    esc(d.title) +
    '</h2></div></header><div class="modal-body" data-scroll-key="dispatch-' +
    esc(d.key) +
    '"><p>' +
    esc(d.body) +
    "</p>" +
    (d.options.length > 1
      ? "<small>Response due " +
        dateLabel(d.deadline / 1440) +
        ". Default if left unresolved: " +
        esc(d.defaultText) +
        "</small>"
      : "") +
    '</div><footer class="dispatch-options">' +
    d.options
      .map(
        (o) =>
          '<button data-action="choose" data-key="' +
          esc(d.key) +
          '" data-id="' +
          esc(o.id) +
          '" title="' +
          esc(o.detail) +
          '" class="' +
          (o.id === d.options[0].id ? "primary" : "") +
          '">' +
          esc(o.label) +
          "</button>",
      )
      .join("") +
    "</footer></section></div>"
  );
}
