import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/recovery.md");
import { campaignMinutes } from "./campaign-clock.mjs";
export const LOSS_TYPES = data.LOSS_TYPES;
export function initializeRecovery(n) {
  n.casualties ??= {};
  n.recoveryQueue ??= [];
  for (const type of LOSS_TYPES)
    n.casualties[type] ??= { lost: 0, rescued: 0, recovered: 0 };
}
// Losses are permanent. Rescued personnel and repairable airframes leave the
// available pool now and return exactly once after their recovery deadline.
export function recordCasualties(
  s,
  n,
  type,
  exposed,
  { rescue = 0.2, model = null, days = 14 } = {},
) {
  initializeRecovery(n);
  exposed = Math.max(0, Math.floor(exposed));
  const rescued = Math.min(
      exposed,
      Math.floor(exposed * Math.max(0, Math.min(0.95, rescue))),
    ),
    lost = exposed - rescued;
  n.casualties[type].lost += lost;
  n.casualties[type].rescued += rescued;
  if (rescued) {
    const readyAt = campaignMinutes(s) + days * 1440;
    let entry = n.recoveryQueue.find(
      (x) => x.type === type && x.model === model && x.readyAt === readyAt,
    );
    if (entry) entry.count += rescued;
    else n.recoveryQueue.push({ type, model, count: rescued, readyAt });
  }
  if (type === "sailors") n.sailorsLost = n.casualties.sailors.lost;
  if (type === "aviators") n.aviatorsLost = n.casualties.aviators.lost;
  if (type === "aircraft") n.aircraftLost = n.casualties.aircraft.lost;
  return { lost, rescued, exposed };
}
export function recoverDue(s, n) {
  initializeRecovery(n);
  const recovered = { sailors: 0, aviators: 0, aircraft: 0 };
  for (const entry of [...n.recoveryQueue])
    if (entry.readyAt <= campaignMinutes(s)) {
      if (entry.type === "sailors") n.crew += entry.count;
      else if (entry.type === "aviators") n.aviators += entry.count;
      else
        n.aircraft[entry.model] = (n.aircraft[entry.model] || 0) + entry.count;
      n.casualties[entry.type].recovered += entry.count;
      recovered[entry.type] += entry.count;
      n.recoveryQueue.splice(n.recoveryQueue.indexOf(entry), 1);
    }
  return recovered;
}
export const awaitingRecovery = (n, type) =>
  n.recoveryQueue
    .filter((x) => x.type === type)
    .reduce((sum, x) => sum + x.count, 0);
