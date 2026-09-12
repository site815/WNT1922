import { NODES } from "./world.mjs";
import { MISSIONS } from "./missions.mjs";
export function validatePolitics(s) {
  const fail = () => {
      throw Error("Invalid diplomacy or deployment state in save.");
    },
    plain = (v) => !!v && typeof v === "object" && !Array.isArray(v),
    finite = (v, a, b) => Number.isFinite(v) && v >= a && v <= b,
    minute = (v) => finite(v, -1e9, 3e9),
    text = (v, max = 200) => typeof v === "string" && v.length <= max,
    nation = (id) => !!s.nations[id];
  if (
    s.diplomacyRevision !== 2 ||
    !Array.isArray(s.pacts) ||
    s.pacts.length > 50 ||
    !minute(s.nextDiplomaticAt) ||
    !Array.isArray(s.provocations) ||
    s.provocations.length > 42
  )
    fail();
  for (const r of Object.values(s.relations))
    if (
      ["score", "pressure", "warning", "lastRelationChange"].some((k) => k in r)
    )
      fail();
  for (const p of s.pacts)
    if (
      !plain(p) ||
      !text(p.id) ||
      !text(p.name) ||
      !["defensive", "political", "consultation"].includes(p.kind) ||
      typeof p.active !== "boolean" ||
      !Array.isArray(p.members) ||
      !p.members.length ||
      p.members.length > 7 ||
      new Set(p.members).size !== p.members.length ||
      !p.members.every(nation) ||
      !finite(p.since, -100000, 2000000)
    )
      fail();
  const assigned = new Set();
  for (const p of s.provocations) {
    if (
      !plain(p) ||
      !text(p.id) ||
      !nation(p.nation) ||
      !nation(p.target) ||
      p.nation === p.target ||
      !NODES[p.node] ||
      !s.nations[p.nation].fleets.some((f) => f.id === p.fleetId) ||
      !minute(p.startedAt) ||
      !minute(p.endsAt) ||
      p.endsAt - p.startedAt !== 90 * 1440 ||
      !plain(p.previous) ||
      !MISSIONS[p.previous.mission] ||
      typeof p.previous.manual !== "boolean" ||
      typeof p.previous.aggressive !== "boolean" ||
      assigned.has(p.fleetId)
    )
      fail();
    assigned.add(p.fleetId);
    if (
      p.encounterId !== undefined &&
      (!text(p.encounterId) ||
        !s.provocations.some(
          (other) =>
            other !== p &&
            other.encounterId === p.encounterId &&
            other.nation === p.target &&
            other.target === p.nation,
        ))
    )
      fail();
  }
  for (const d of s.decisions) {
    if (
      (d.popup !== undefined && typeof d.popup !== "boolean") ||
      (d.forcePause !== undefined && typeof d.forcePause !== "boolean")
    )
      fail();
    if (d.popup && (!d.critical || !d.forcePause || d.options.length !== 1))
      fail();
  }
  return true;
}
