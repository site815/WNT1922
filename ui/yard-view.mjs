const num = (v) => Math.round(v || 0).toLocaleString("en-US");
export function yardCapacityChart(load) {
  const total = load.capacity * 365,
    used = load.used * 365,
    spare = load.spare * 365,
    overload = load.backlog * 365,
    work = load.work * 365;
  // One scale shows overload beyond the actual capacity, including idle yards.
  const scale = 1000 / Math.max(1, total, work),
    limit = total * scale;
  return `<figure class="yard-capacity"><figcaption><strong>National shipyard workload</strong><span>Combined annual throughput · tons/year</span></figcaption><svg viewBox="0 0 1000 42" preserveAspectRatio="none" role="img" aria-label="Capacity ${num(total)} tons per year; committed ${num(used)}, spare ${num(spare)}, overloaded ${num(overload)}."><rect class="yard-spare-segment" x="${used * scale}" y="7" width="${spare * scale}" height="28" fill="#407560"><title>Empty capacity: ${num(spare)} tons/year</title></rect><rect class="yard-committed-segment" x="0" y="7" width="${used * scale}" height="28" fill="#dfbc60"/>${overload ? `<rect class="yard-overload-segment" x="${limit}" y="7" width="${overload * scale}" height="28" fill="#d75b56"/>` : ""}<path class="yard-limit" d="M${Math.min(999, Math.max(1, limit))},1v40" stroke="#fff" stroke-width="2" vector-effect="non-scaling-stroke"><title>Available capacity: ${num(total)} tons/year</title></path></svg><div class="yard-capacity-key"><span><i class="yard-used"></i>Committed <b>${num(used)}</b></span><span><i class="yard-spare"></i>Empty / spare <b>${num(spare)}</b></span><span><i class="yard-overload"></i>Overloaded <b>${num(overload)}</b></span><span>│ Capacity <b>${num(total)}</b></span></div>${overload ? `<p class="block-reason">Requested ${num(work)} tons/year. ${load.blocked ? "Construction is suspended until capacity returns." : "Orders share available capacity; delivery takes " + load.factor.toFixed(2) + "× the uncongested time."}</p>` : ""}</figure>`;
}
