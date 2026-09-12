import { CATALOG } from "../worker/catalog-loader.mjs";
import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/campaign-clock.md");
export const MINUTES_PER_DAY = data.MINUTES_PER_DAY;
export const TICK_MINUTES = data.TICK_MINUTES;
export const periodicTick = (now, period, offset = 0) =>
  Math.floor((now - offset) / period) > Math.floor((now - TICK_MINUTES - offset) / period);
export const travelledThisTick = (f, now) => Math.max(0,
  Math.min(now, f.arriveAt) - Math.max(now - TICK_MINUTES, f.departAt)) * f.speed / 60;
export const CAPITALS = data.CAPITALS;
export const minutesAt = (iso) => Date.parse(iso) / 60000;
export const campaignMinutes = (s) => s.day * 1440 + s.fraction * 1440;
export const canonicalMinute = (minute) =>
  Math.abs(minute - Math.round(minute)) < 1e-6 ? Math.round(minute) : minute;
export function setCampaignMinutes(s, minute) {
  // Canonicalize floating point frame accumulation at minute boundaries. This
  // prevents processing the same operational minute twice in adjacent frames.
  minute = canonicalMinute(minute);
  s.day = Math.floor(minute / 1440);
  s.fraction = Math.max(0, (minute - s.day * 1440) / 1440);
}
const formatters = new Map();
export function capitalClock(s, id = s.player, minute = campaignMinutes(s)) {
  const capital = CAPITALS[id];
  if (!formatters.has(id))
    formatters.set(
      id,
      new Intl.DateTimeFormat("en-GB", {
        timeZone: capital.zone,
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZoneName: "shortOffset",
      }),
    );
  const parts = Object.fromEntries(
    formatters
      .get(id)
      .formatToParts(new Date(Math.floor(minute + 1e-7) * 60000))
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.day} ${parts.month} ${parts.year}`,
    time: `${parts.hour}:${parts.minute}`,
    zone: parts.timeZoneName,
    capital: capital.name,
  };
}
export const HISTORICAL_POLAND = minutesAt(data.HISTORICAL_POLAND);
export const HISTORICAL_BRITAIN = minutesAt(data.HISTORICAL_BRITAIN);
export function openingTimeline(seed, campaignId = "in_good_faith_1936") {
  // Separate from the evolving economic/combat RNG: orders cannot move history.
  const variation = CATALOG.campaigns[campaignId].scenario.europeVariationDays;
  const offsetDays =
    ((Math.imul(seed ^ 0x39b1939, 2654435761) >>> 0) % (variation * 2 + 1)) -
    variation;
  return {
    offsetDays,
    polandAt: HISTORICAL_POLAND + offsetDays * 1440,
    britainAt: HISTORICAL_BRITAIN + offsetDays * 1440,
    polandOccurred: false,
    europeOccurred: false,
  };
}
