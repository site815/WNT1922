import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/provocation.md");
import { campaignMinutes } from "./campaign-clock.mjs";
import { NODES, PORTS, HOME_PORT, seaRoute, distanceNm } from "./world.mjs";
import {
  fleetStats,
  fleetPosition,
  nextSupplyLeg,
  setRoute,
  invalidateOperations,
} from "./task-forces.mjs";
import { fullyStaffed } from "./ship-staffing.mjs";
import { supplyDetails } from "./logistics.mjs";
export const PROVOCATION_DAYS = data.PROVOCATION_DAYS;
export function activeProvocation(s, id, fleetId) {
  return (s.provocations || []).find(
    (p) =>
      p.nation === id &&
      p.fleetId === fleetId &&
      (p.encounterId || p.endsAt > campaignMinutes(s)),
  );
}
export function opposingProvocations(s, a, fa, b, fb) {
  const p = activeProvocation(s, a, fa),
    q = activeProvocation(s, b, fb);
  return (
    !!p &&
    !!q &&
    p.target === b &&
    q.target === a &&
    p.encounterId === q.encounterId
  );
}
export function provocationNode(s, a, b) {
  const opposing = (s.provocations || []).find(
    (p) => p.nation === b && p.target === a && p.endsAt > campaignMinutes(s),
  );
  if (opposing) return opposing.node;
  // Shared sea station from a navigable route, never hidden fleet coordinates.
  const [first, last] = [a, b].sort(),
    path = seaRoute(HOME_PORT[first], HOME_PORT[last]).filter((k) => !PORTS[k]);
  return path[Math.floor(path.length / 2)] || null;
}
export function provocationFleetBlock(s, c, id, target, f) {
  if (f?.battleId) return "This task force is engaged in battle.";
  if (!f || ["repair", "reinforcement", "support"].includes(f.role))
    return "Choose a ready combat task force.";
  if (activeProvocation(s, id, f.id))
    return "This task force already has an active provocation deployment.";
  if (["returning", "repair", "refuel"].includes(f.phase) || f.needsEscorts)
    return "The task force must finish repairs, refueling and escort preparation.";
  const st = fleetStats(s, c, id, f);
  if (
    !st.hulls ||
    st.health < 0.75 ||
    !st.active.every(
      (g) => g.status === "active" && fullyStaffed(g, c.classes[g.classId]),
    )
  )
    return "Requires complete crews and at least 75% average hull condition.";
  if (supplyDetails(s, c, id, f).factor < 0.4)
    return "Requires at least 40% supply.";
  const node = provocationNode(s, id, target);
  if (!node || !nextSupplyLeg(s, id, f, node))
    return "No safe route to the demonstration station within fuel range and friendly refueling access.";
  return "";
}
export function startProvocation(s, c, id, target, fleetId) {
  const f = s.nations[id].fleets.find((f) => f.id === fleetId),
    block = provocationFleetBlock(s, c, id, target, f);
  if (block) throw Error(block);
  const now = campaignMinutes(s),
    node = provocationNode(s, id, target),
    leg = nextSupplyLeg(s, id, f, node);
  const p = {
    id: "provocation-" + s.nextId++,
    nation: id,
    target,
    fleetId,
    node,
    startedAt: now,
    endsAt: now + PROVOCATION_DAYS * 1440,
    previous: {
      mission: f.mission,
      manual: !!f.manual,
      aggressive: !!f.aggressiveBattle,
    },
  };
  if (!setRoute(s, c, id, f, leg))
    throw Error(f.holdReason || "The task force cannot depart.");
  const opposing = s.provocations.find(
    (q) =>
      q.nation === target &&
      q.target === id &&
      !q.encounterId &&
      q.endsAt > now,
  );
  if (opposing) {
    p.encounterId = opposing.encounterId = "incident-" + s.nextId++;
    p.node = opposing.node;
  }
  s.provocations.push(p);
  f.manual = true;
  f.mission = "decisive";
  f.objectiveNode = p.node;
  delete f.raidingReturn;
  invalidateOperations(s);
  return p;
}
export function finishProvocation(s, p) {
  const ended = s.provocations.filter(
    (x) => x === p || (p.encounterId && x.encounterId === p.encounterId),
  );
  s.provocations = s.provocations.filter((x) => !ended.includes(x));
  for (const row of ended) {
    const f = s.nations[row.nation].fleets.find((f) => f.id === row.fleetId);
    if (f) {
      f.manual = row.previous.manual;
      f.mission = row.previous.mission;
      f.aggressiveBattle = row.previous.aggressive;
      delete f.objectiveNode;
      f.nextPlanAt = Math.min(f.nextPlanAt, campaignMinutes(s));
    }
  }
  invalidateOperations(s);
}
export function finishIncident(s, a, fa, b, fb, report) {
  if (!report || !opposingProvocations(s, a, fa, b, fb)) return false;
  report.limitedIncident = true;
  for (const a of s.alerts || [])
    if (a.reportId === report.id) {
      a.title = "Limited naval incident · " + a.title;
      a.body += " The demonstrations have ended; general war has not begun.";
    }
  for (const p of [...s.provocations])
    if (
      (p.nation === a && p.fleetId === fa) ||
      (p.nation === b && p.fleetId === fb)
    )
      finishProvocation(s, p);
  return true;
}
export function expireProvocations(s) {
  for (const p of [...s.provocations]) {
    const n = s.nations[p.nation],
      f = n.fleets.find((f) => f.id === p.fleetId);
    if (
      (!p.encounterId && p.endsAt <= campaignMinutes(s)) ||
      !f ||
      ["repair", "reinforcement", "support"].includes(f.role) ||
      !n.groups.some(
        (g) => g.fleetId === p.fleetId && g.count && g.status === "active",
      )
    )
      finishProvocation(s, p);
  }
}
export function provocationDestination(s, id, f) {
  const p = activeProvocation(s, id, f.id);
  if (!p) return null;
  return distanceNm(fleetPosition(s, f), NODES[p.node]) < 1
    ? p.node
    : nextSupplyLeg(s, id, f, p.node);
}
