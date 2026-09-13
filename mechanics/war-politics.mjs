import { CATALOG } from "../worker/catalog-loader.mjs";
import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/war-politics.md");
const treatyRules = await readDocument("1922/rules.md");
export const EUROPE_OPENING = data.EUROPE_OPENING;
import { PROFILES } from "./catalog.mjs";
import { campaignMinutes } from "./campaign-clock.mjs";
import { addLog, addAlert, queueDecision, fleetPower } from "./engine.mjs";
import { invalidateOperations } from "./task-forces.mjs";
import { moveConvoys } from "./merchant-convoys.mjs";
import { finishProvocation } from "./provocation.mjs";
const key = (a, b) => [a, b].sort().join("-"),
  names = (ids) => ids.map((id) => PROFILES[id].name).join(" / "),
  at = (iso) => Date.parse(iso) / 60000;
export function dispatchPopup(s, key, title, body, kind = "diplomacy") {
  queueDecision(
    s,
    key,
    title,
    body,
    [
      {
        id: "acknowledge",
        label: "Acknowledge",
        detail: "Return to the ministry.",
      },
    ],
    { critical: true, popup: true, forcePause: true, kind },
  );
}
export function initializeDiplomacy(s) {
  if (s.diplomacyRevision === 2) return;
  s.diplomacyRevision = 2;
  s.pacts = [];
  s.provocations = [];
  s.nextDiplomaticAt = campaignMinutes(s);
  s.pacts = CATALOG.campaigns[s.campaignId].scenario.openingPacts.map((p) => ({
    ...structuredClone(p),
    since: s.day,
    active: true,
  }));
  for (const p of s.pacts)
    if (p.kind === "defensive")
      for (const a of p.members)
        for (const b of p.members)
          if (a !== b) s.relations[key(a, b)].allied = true;
}
export function alliancePartners(s, id) {
  return Object.values(s.relations)
    .filter((r) => r.allied && !r.war && [r.a, r.b].includes(id))
    .map((r) => (r.a === id ? r.b : r.a));
}
export function endAlliance(s, a, b) {
  const r = s.relations[key(a, b)];
  if (r) r.allied = false;
  invalidateOperations(s);
  for (const p of s.pacts || [])
    if (
      p.kind === "defensive" &&
      p.members.includes(a) &&
      p.members.includes(b)
    )
      p.active = false;
}
export function activePacts(s) {
  return (s.pacts || []).filter(
    (p) =>
      p.active &&
      !s.pacts.some(
        (q) =>
          q !== p &&
          q.active &&
          q.kind === p.kind &&
          q.members.length > p.members.length &&
          p.members.every((id) => q.members.includes(id)),
      ),
  );
}
export function commenceWar(
  s,
  c,
  a,
  b,
  { reason = "Hostilities have commenced." } = {},
) {
  const r = s.relations[key(a, b)];
  if (!r || r.war) return false;
  for (const p of [...s.provocations])
    if ([a, b].includes(p.nation) && [a, b].includes(p.target))
      finishProvocation(s, p);
  r.war = true;
  endAlliance(s, a, b);
  r.warSince = s.day;
  r.truceUntil = s.day;
  for (const id of [a, b]) {
    const n = s.nations[id];
    n.rival = id === a ? b : a;
    n.convoyPlanAt = -Infinity;
    moveConvoys(s, c, id);
    if (id !== s.player) {
      const p = fleetPower(s, c, id);
      n.priority = p.sub > p.surface ? "raid" : "presence";
      n.focus = PROFILES[n.rival].home;
    }
  }
  const title = names([a, b]) + ": war begins",
    body =
      reason +
      " Admirals are directing fleet operations. Review convoy protection, repairs and industrial funding.";
  const popupKey = "declaration-" + s.nextId++;
  addLog(s, title + ". " + reason, "war");
  s.log[0].dismissed = true;
  addAlert(s, title, body, "war", { a, b, popupKey, global: true });
  dispatchPopup(s, popupKey, title, body, "war");
  invalidateOperations(s);
  return true;
}
export const PACT_EVENTS = data.PACT_EVENTS.map((e) => ({ ...e, at: at(e.date) }));
export const WORLD_NEWS = data.WORLD_NEWS.map((e) => ({ ...e, at: at(e.date) }));
export function politicsTick(s) {
  const now = campaignMinutes(s);
  if (now < (s.nextDiplomaticAt ?? -Infinity)) return;
  let next = now + 1440;
  const expiryEvent = treatyRules.allianceExpiry;
  if (
    s.campaignId === "campaign_1922" &&
    !s.completedEvents.includes(expiryEvent.completedKey)
  ) {
    const expiry = at(expiryEvent.date);
    if (now >= expiry) {
      s.completedEvents.push(expiryEvent.completedKey);
      endAlliance(s, ...expiryEvent.pair);
      dispatchPopup(
        s,
        expiryEvent.popupKey,
        expiryEvent.title,
        expiryEvent.body,
      );
    } else next = Math.min(next, expiry);
  }
  for (const event of [...PACT_EVENTS, ...WORLD_NEWS]) {
    const id = "historical-news-" + event.id;
    if (s.completedEvents.includes(id)) continue;
    const eventAt = event.at + (event.followEuropeanOffset ? (s.timeline?.offsetDays || 0) * 1440 : 0);
    if (now < eventAt) {
      next = Math.min(next, eventAt);
      continue;
    }
    if (event.requiresNews && !s.completedEvents.includes('historical-news-' + event.requiresNews)) continue;
    if (event.requiresTerritory && s.world?.control?.[event.requiresTerritory.id] !== event.requiresTerritory.owner) continue;
    s.completedEvents.push(id);
    if (event.stationAccess) {
      const access=event.stationAccess;
      if ((s.world.portControl[access.port] || access.previous) === access.previous) {
        s.world.stationControl ??= {};
        s.world.stationControl[access.port]=access.owner;
        s.world.portControl[access.port]=access.owner;
        invalidateOperations(s);
      }
    }
    if (event.members) {
      if (
        event.members.some((a) =>
          event.members.some((b) => a !== b && s.relations[key(a, b)]?.war),
        )
      )
        continue;
      if (event.kind === "defensive")
        for (let i = 0; i < event.members.length; i++)
          for (let j = i + 1; j < event.members.length; j++)
            s.relations[key(event.members[i], event.members[j])].allied = true;
      s.pacts.push({
        id: event.id,
        name: event.name,
        members: event.members,
        kind: event.kind,
        since: s.day,
        active: true,
      });
      invalidateOperations(s);
    }
    const title = event.name || event.title;
    addLog(s, title + ". " + event.body, "diplomacy");
    if (event.importance === "major" || event.members?.includes(s.player) || event.affectedNations?.includes(s.player)) {
      s.log[0].dismissed = true;
      dispatchPopup(s, "dispatch-" + id, title, event.body, event.alertKind || "diplomacy");
    }
  }
  s.nextDiplomaticAt = next;
}

export const HISTORICAL_WARS = data.HISTORICAL_WARS;
