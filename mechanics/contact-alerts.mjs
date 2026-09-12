import { visibleContacts, INTELLIGENCE } from "./task-forces.mjs";
import { PROFILES } from "./catalog.mjs";
import { capitalClock } from "./campaign-clock.mjs";

const num = (n) => Math.round(n).toLocaleString("en-US");
export function contactDescription(s, c) {
  const t = capitalClock(s, s.player, c.seenAt),
    [lon, lat] = c.position;
  return `${PROFILES[c.nation].name} · ${c.kind}, approximately ${num(c.estimate)} hulls. ${c.source}: ${t.date} ${t.time} ${t.zone}. Last reported at ${Math.abs(lat).toFixed(1)}°${lat < 0 ? "S" : "N"}, ${Math.abs(lon).toFixed(1)}°${lon < 0 ? "W" : "E"}. ${c.stage} · ${num(c.confidence * 100)}% confidence · search radius ±${num(c.uncertainty * 1.852)} km.`;
}

// Reports stay linked to the observed contact, never to the enemy's live fleet.
// Dismissal lasts through continuous tracking; reacquisition after staleness alerts again.
export function contactAlerts(s) {
  return visibleContacts(s)
    .filter(
      (c) =>
        s.relations[[s.player, c.nation].sort().join("-")]?.war &&
        c.hours <= INTELLIGENCE.uncertainHours &&
        !Number.isFinite(c.dismissedAt),
    )
    .map((c) => ({
      id: "contact-" + c.id,
      contactId: c.id,
      minute: c.seenAt,
      kind: "contact",
      title: `◇ ${c.nation} · ${c.kind} · ${c.stage.toLowerCase()}`,
      body: contactDescription(s, c),
    }));
}
