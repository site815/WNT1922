import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/pacific-opening.md");
import { campaignMinutes, periodicTick } from "./campaign-clock.mjs";
import { NODES, PORTS, distanceNm } from "./world.mjs";
import {
  fleetStats,
  fleetPosition,
  nextSupplyLeg,
  setRoute,
  invalidateOperations,
} from "./task-forces.mjs";
import { queueAirStrike } from "./air-operations.mjs";
import { observeAnchorage } from "./shore-recon.mjs";
import { aviationOwner } from "./base-aviation.mjs";
const opening = Date.parse(data.opening) / 60000;
export function pacificOpening(s, c) {
  const now = campaignMinutes(s);
  if (now < opening - data.preparationDays * 1440 || now > opening + data.windowDays * 1440) return;
  s.pacificOpening ??= {
    targets: Object.fromEntries(data.targets.map((id) => [id, "preparing"])),
    fleets: [],
    prepared: false,
  };
  const plan = s.pacificOpening,
    n = s.nations[data.nation];
  if (now < opening - data.deploymentDays * 1440) return;
  if (!plan.prepared) {
    const choices = n.fleets
      .filter(
        (f) =>
          f.role === "carrier" &&
          !f.manual &&
          !f.needsEscorts &&
          !["repair", "returning", "reinforcement"].includes(f.phase),
      )
      .map((f) => ({ f, st: fleetStats(s, c, data.nation, f) }))
      .filter((x) => x.st.air >= data.minAircraft && x.st.health > data.minHealth)
      .sort((a, b) => b.st.air - a.st.air);
    for (const { f } of choices) {
      if (plan.fleets.length >= data.maxCarrierForces) break;
      const node = nextSupplyLeg(s, data.nation, f, data.carrierStage);
      if (!node) continue;
      f.pacificTarget = data.carrierTarget;
      f.pacificStage = data.carrierStage;
      f.objectiveNode = data.carrierStage;
      if (setRoute(s, c, data.nation, f, node)) plan.fleets.push(f.id);
    }
    plan.prepared = true;
  }
  if (!periodicTick(now, 15, 7) || now < opening) return;
  if (now > opening + data.strikeWindowHours * 60) {
    for (const [port, status] of Object.entries(plan.targets))
      if (status === "preparing")
        plan.targets[port] = "Unavailable: range, readiness or weather";
    for (const f of n.fleets)
      if (f.pacificTarget && !n.airSorties.some((o) => o.fleetId === f.id)) {
        delete f.pacificTarget;
        delete f.pacificStage;
        delete f.objectiveNode;
      }
    return;
  }
  for (const port of Object.keys(plan.targets)) {
    if (
      plan.targets[port] === "Strike assembling" &&
      !n.airSorties.some(
        (op) => op.operation === "opening" && op.targetId === port,
      )
    )
      plan.targets[port] = "preparing";
    if (
      plan.targets[port] !== "preparing" ||
      !s.relations[[data.nation, aviationOwner(s, port)].sort().join("-")]?.war
    )
      continue;
    // Opening intelligence is a dated anchorage observation. Damage still uses
    // the ships actually present, never a scripted list of historical losses.
    observeAnchorage(s, c, data.nation, port, "Opening-operation reconnaissance");
    let sent = 0;
    if (port === data.carrierTarget)
      for (const id of plan.fleets) {
        const f = n.fleets.find((f) => f.id === id);
        if (!f) continue;
        if (
          queueAirStrike(s, c, data.nation, {
            fleetId: id,
            targetNation: aviationOwner(s, port),
            targetKind: "port",
            targetId: port,
            operation: "opening",
          })
        )
          sent++;
      }
    else {
      const sources = Object.keys(n.airBases)
        .filter((base) => aviationOwner(s, base) === data.nation)
        .sort(
          (a, b) =>
            distanceNm(NODES[a], NODES[port]) -
            distanceNm(NODES[b], NODES[port]),
        );
      for (const base of sources)
        if (
          queueAirStrike(s, c, data.nation, {
            sourcePort: base,
            targetNation: aviationOwner(s, port),
            targetKind: "port",
            targetId: port,
            operation: "opening",
          })
        ) {
          sent++;
          break;
        }
    }
    if (sent) plan.targets[port] = "Strike assembling";
  }
}
