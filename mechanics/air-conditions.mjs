import { readDocument } from "../worker/documents.mjs";
const data = await readDocument("common/rules/air-conditions.md");
import { campaignMinutes } from "./campaign-clock.mjs";
const rad = data.rad,
  clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const weatherCache = new Map();
// One deterministic regional weather state per six hours; evaluating the UI
// cannot consume simulation randomness or change a later battle's weather.
export function airConditions(s, position, minute = campaignMinutes(s)) {
  const [lon, lat] = position,
    date = new Date(minute * 60000),
    day = Math.floor(
      (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
        Date.UTC(date.getUTCFullYear(), 0, 1)) /
        86400000,
    );
  const declination = 23.44 * Math.sin(((day - 80) * 2 * Math.PI) / 365) * rad,
    hour = (((minute / 60 + lon / 15) % 24) + 24) % 24;
  const elevation =
    Math.asin(
      clamp(
        Math.sin(lat * rad) * Math.sin(declination) +
          Math.cos(lat * rad) *
            Math.cos(declination) *
            Math.cos((hour - 12) * 15 * rad),
        -1,
        1,
      ),
    ) / rad;
  const light =
      elevation > 0 ? "Daylight" : elevation > -6 ? "Twilight" : "Night",
    bucket = Math.floor(minute / 360),
    cell = Math.floor((lon + 180) / 30) + 12 * Math.floor((lat + 90) / 20),
    key = cell + ":" + bucket;
  let weather = weatherCache.get(key);
  if (!weather) {
    let hash = Math.imul(cell + 713, 374761393) ^ Math.imul(bucket, 668265263);
    hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
    const chance = (hash >>> 0) / 4294967296;
    weather =
      chance < 0.55
        ? { name: "Fair", launch: 1, search: 1 }
        : chance < 0.83
          ? { name: "Cloud", launch: 0.85, search: 0.65 }
          : chance < 0.97
            ? { name: "Rain / rough sea", launch: 0.45, search: 0.35 }
            : { name: "Severe weather", launch: 0, search: 0.1 };
    if (weatherCache.size > 2048) weatherCache.clear();
    weatherCache.set(key, weather);
  }
  return {
    light,
    weather: weather.name,
    launch: weather.launch * (light === "Daylight" ? 1 : 0),
    search:
      weather.search *
      (light === "Daylight" ? 1 : light === "Twilight" ? 0.35 : 0.08),
    elevation,
    hour,
  };
}
export function bearing(a, b) {
  const p1 = a[1] * rad,
    p2 = b[1] * rad,
    d = (b[0] - a[0]) * rad;
  return (
    (Math.atan2(
      Math.sin(d) * Math.cos(p2),
      Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(d),
    ) /
      rad +
      360) %
    360
  );
}
export function searchSector(s, f, position, targetPosition) {
  return targetPosition
    ? bearing(position, targetPosition)
    : ((((f.salt || 0) * 47 + Math.floor(campaignMinutes(s) / 180) * 90) %
        360) +
        360) %
        360;
}
export function sectorFactor(heading, a, b) {
  const delta = Math.abs(((bearing(a, b) - heading + 540) % 360) - 180);
  return delta <= 70 ? 1 : delta <= 110 ? 0.3 : 0.08;
}
