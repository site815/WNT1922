import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/treaty-policy.md");
// Treaty costs are a naval-budget abstraction; rates are provisional.
export const INITIAL_TREATY_EXPIRY = data.INITIAL_EXPIRY;
export const TREATY_POLICIES = data.TREATY_POLICIES;
export const TREATY_SWITCH_GOLD = data.TREATY_SWITCH_GOLD;
export const concealing = (n) =>
  ["false_numbers", "false_tonnage"].includes(n.treatyPolicy);
export function treatyAssessment(
  s,
  c,
  id = s.player,
  policy = s.nations[id].treatyPolicy,
) {
  const n = s.nations[id],
    year = new Date(s.day * 86400000).getUTCFullYear(),
    active = id !== "SOV" && s.day <= s.treatyUntil;
  const restricted = id === "DEU" && year < data.GERMAN_RESTRICTIONS.before,
    limits = restricted ? data.GERMAN_RESTRICTIONS : data.LIMITS[id];
  const capitalLimit = limits?.capital ?? Infinity,
    carrierLimit = limits?.carrier ?? Infinity;
  const buckets = { capital: [], carrier: [], other: [] };
  let actual = 0,
    hulls = 0,
    individualExcess = 0,
    individualBillable = 0;
  const concealed = new Set();
  for (const g of n.groups) {
    if (!g.count || ["scrapped", "sunk"].includes(g.status)) continue;
    const cl = c.classes[g.classId];
    if (!cl || g.service !== "warship") continue;
    const washington = s.campaignId === "campaign_1922",
      authorized =
        (g.legacy && cl.year < 1922) ||
        (washington &&
          ["retained", "scrap_on_replacement", "convert_carrier"].includes(
            g.treatyFate,
          ));
    // The treaty explicitly retained named existing ships and replacement/conversion
    // projects. Do not assess these as fresh illegal construction or double-count
    // their predecessors while the authorized replacement is unfinished.
    if (
      authorized &&
      (["building", "trials", "converting"].includes(g.status) ||
        (g.id === "h-ijn_kaga" && g.status === "reserve"))
    )
      continue;
    if (
      washington &&
      g.treatyFate &&
      s.day < Date.parse(data.DISPOSAL_GRACE_END + "T00:00:00Z") / 86400000 &&
      !n.dispositionRejected &&
      ["scrap", "canceled", "target"].includes(g.treatyFate)
    )
      continue;
    const category = ["BB", "BC"].includes(cl.type)
      ? "capital"
      : ["CV", "CVL"].includes(cl.type)
        ? "carrier"
        : "other";
    const perHull = restricted
      ? category === "capital"
        ? data.GERMAN_RESTRICTIONS.perCapital
        : ["SS", "SM", "CV", "CVL"].includes(cl.type)
          ? 0
          : data.GERMAN_RESTRICTIONS.perOther
      : category === "capital"
        ? data.PER_HULL.capital
        : category === "carrier"
          ? data.PER_HULL.carrier
          : ["CA", "CL"].includes(cl.type)
            ? data.PER_HULL.cruiser
            : Infinity;
    const oversized = authorized ? 0 : Math.max(0, cl.tons - perHull);
    individualExcess += oversized * g.count;
    individualBillable += (authorized ? 0 : Math.max(0, cl.tons - perHull * (1 + data.DISCLOSURE_TOLERANCE))) * g.count;
    for (let i = 0; i < g.count; i++) {
      const row = { key: g.id + ":" + i, tons: cl.tons, authorized };
      buckets[category].push(row);
      if (oversized) concealed.add(row.key);
    }
    if (category !== "other") {
      actual += cl.tons * g.count;
      hulls += g.count;
    }
  }
  let aggregateExcess = 0, aggregateBillable = 0;
  const obligations = [];
  for (const [bucket, nominal] of [
    ["capital", capitalLimit],
    ["carrier", carrierLimit],
  ]) {
    const rows = buckets[bucket].sort(
        (a, b) =>
          Number(a.authorized) - Number(b.authorized) || b.tons - a.tons,
      ),
      limit = Math.max(
        nominal,
        rows.filter((r) => r.authorized).reduce((v, r) => v + r.tons, 0),
      );
    let remaining = rows.reduce((v, r) => v + r.tons, 0);
    aggregateExcess += Math.max(0, remaining - limit);
    aggregateBillable += Math.max(0, remaining - limit * (1 + data.DISCLOSURE_TOLERANCE));
    obligations.push({ category: bucket, limit: nominal, allowance: limit,
      actual: remaining, excess: Math.max(0, remaining - limit) });
    for (const row of rows) {
      if (remaining <= limit) break;
      remaining -= row.tons;
      concealed.add(row.key);
    }
  }
  const excessTons = active ? Math.max(aggregateExcess, individualExcess) : 0,
    excessHulls = active ? concealed.size : 0;
  const rate = data.MONTHLY_RATES[policy],
    amount = rate.basis === "hulls" ? excessHulls : excessTons;
  const disclosureBillableTons = active ? Math.max(aggregateBillable, individualBillable) : 0;
  const assessed = policy === "disclose" ? disclosureBillableTons : amount;
  const gold = active ? Math.ceil(assessed * rate.gold + (policy === "disclose" ? 0 : data.CONCEALMENT_BASE_GOLD)) : 0,
    influence = active ? assessed * rate.influence + (policy === "disclose" ? 0 : data.CONCEALMENT_BASE_INFLUENCE) : 0;
  const hidden = policy === "disclose" ? 0 : excessTons;
  return {
    active,
    actual,
    hulls,
    capitalLimit,
    carrierLimit,
    excessTons,
    excessHulls,
    obligations,
    perHullLimits: restricted ? { capital: data.GERMAN_RESTRICTIONS.perCapital, carrier: 0, cruiser: data.GERMAN_RESTRICTIONS.perOther } : data.PER_HULL,
    individualExcess: active ? individualExcess : 0,
    disclosureBillableTons,
    hidden,
    declared: Math.max(0, actual - hidden),
    gold,
    influence,
    policy,
  };
}
