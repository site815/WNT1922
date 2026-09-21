import { campaignMinutes } from './campaign-clock.mjs';
import { NODES, PORTS, distanceNm } from './world.mjs';

// Only classes with an explicit finite outfit opt in. Existing designs retain
// their campaign-level ammunition abstraction.
export const finiteTorpedoOutfit = cl => Number.isInteger(cl.torpedoCapacity) && cl.torpedoCapacity >= 0;
export function torpedoesPerHull(g, cl) {
  if (!finiteTorpedoOutfit(cl)) return cl.tubes || 0;
  return Math.max(0, Math.min(cl.torpedoCapacity, g.torpedoesPerHull ?? cl.torpedoCapacity));
}
export function armedClass(g, cl, torpedoTargets = true) {
  if (!finiteTorpedoOutfit(cl)) return cl;
  return { ...cl, tubes: torpedoTargets ? Math.min(cl.tubes, torpedoesPerHull(g, cl)) : 0 };
}
export function fireTorpedoes(g, cl) {
  if (!finiteTorpedoOutfit(cl) || g.count <= 0) return 0;
  const loaded = torpedoesPerHull(g, cl), fired = Math.min(cl.tubes, loaded);
  // Per-hull state survives splitting and casualties without reallocating the
  // ammunition of lost boats to survivors.
  g.torpedoesPerHull = loaded - fired;
  return fired * g.count;
}
export function rearmTorpedoes(g, cl) {
  if (finiteTorpedoOutfit(cl) && g.count > 0) g.torpedoesPerHull = cl.torpedoCapacity;
}
export function atRearmPort(s, f, id) {
  if (f.battleId || !PORTS[f.port] || campaignMinutes(s) < (f.arriveAt ?? -Infinity)) return false;
  const owner = s.world?.portControl?.[f.port] || PORTS[f.port].nation;
  const relation = s.relations[[id, owner].sort().join('-')];
  // Destination orders can outlive a port capture or the loss of allied access.
  if (owner !== id && (!relation?.allied || relation.war)) return false;
  const position = f.route?.at(-1) || f.position || NODES[f.port];
  return distanceNm(position, NODES[f.port]) < 1;
}
