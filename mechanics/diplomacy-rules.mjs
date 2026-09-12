import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/diplomacy-rules.md");
import { provocationFleetBlock } from "./provocation.mjs";
import { fleetStats } from "./task-forces.mjs";
import { supplyDetails } from "./logistics.mjs";
export const DIPLOMACY = data.DIPLOMACY;
export function readyProvocationFleet(s, c, target, id = s.player) {
  return (
    s.nations[id].fleets
      .filter((f) => !provocationFleetBlock(s, c, id, target, f))
      .map(f => {
        const p = fleetStats(s, c, id, f);
        return { f, strength: (p.surface + p.air * 12 + p.subAttack + p.asw * .2)
          * supplyDetails(s, c, id, f).factor };
      })
      .sort((a, b) => b.strength - a.strength || a.f.id.localeCompare(b.f.id))[0]?.f || null
  );
}
export function diplomaticBlock(
  s,
  c,
  target,
  action,
  id = s.player,
  fleetId = null,
) {
  const rule = DIPLOMACY[action],
    n = s.nations[id],
    r = s.relations[[id, target].sort().join("-")];
  if (!rule || !r || id === target)
    return "Choose another government and a valid diplomatic action.";
  if (
    (n.cooldowns[action + "-" + target] ?? -Infinity) >
    s.day + (s.fraction || 0)
  )
    return "Available after this action’s 90-day cooldown.";
  if (r.war) return "This bilateral action requires peace.";
  if (action === "visit" && n.influence >= 500)
    return "Influence is already at its maximum of 500.";
  if (action === "provoke") {
    const f = readyProvocationFleet(s, c, target, id);
    const block = provocationFleetBlock(s, c, id, target, f);
    if (block) return block;
  }
  for (const k of ["gold", "influence", "industry"])
    if (n[k] < rule.price[k]) return "Not enough " + k + ".";
  return "";
}
