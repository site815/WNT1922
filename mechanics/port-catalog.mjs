import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/port-catalog.md");
// Infrastructure reflects the campaign's opening period. Capacity, defensive
// power and trade weights are provisional game units, not historical tonnages.
export const PORT_TIERS = data.PORT_TIERS;
// Representative coastal batteries where a complete historical battery list
// has not been authored. Range is physical reach, never increased by doctrine.
export const PORT_CATALOG = data.PORT_CATALOG;
const opening1922 = data.opening1922;
export function portSpec(s, id) {
  const year = new Date(s.day * 86400000).getUTCFullYear(),
    original =
      (year < 1936 && s.campaignId === "campaign_1922" && opening1922[id]) ||
      PORT_CATALOG[id];
  if (!original) throw Error("Port specifications missing: " + id);
  // Government infrastructure milestones; these open airfield capacity, not
  // free aircraft. Actual airframes still arrive physically.
  const expansion = data.expansions[id];
  const p =
    expansion && year >= expansion.year
      ? {
          ...original,
          ...expansion,
          note:
            original.note +
            " Later government base construction is now available; capacities are provisional.",
        }
      : original;
  const profile =
    data.batteries[
      p.artillery <= 0
        ? "none"
        : id === "manila"
          ? "manila"
          : p.artillery >= data.batteryThreshold
            ? "heavy"
            : p.tier
    ];
  return {
    ...p,
    battery: profile[0],
    gunRange: profile[1] / 1.852,
    gunRangeKm: profile[1],
    gunBasis:
      data.batterySources[id === "manila" ? "manila" : "representative"],
  };
}
