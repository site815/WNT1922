import { HISTORICAL_GDP } from "./historical-gdp-data.mjs";
export { HISTORICAL_GDP } from "./historical-gdp-data.mjs";
export function historicalGDP(id, day) {
  const table = HISTORICAL_GDP[id],
    years = Object.keys(table).map(Number),
    d = new Date(day * 86400000),
    year = d.getUTCFullYear();
  const start = Date.UTC(year, 0, 1) / 86400000,
    end = Date.UTC(year + 1, 0, 1) / 86400000,
    y = year + (day - start) / (end - start);
  const first = years[0],
    last = years.at(-1);
  if (y <= first) return table[first];
  // Sandbox beyond the source interval: a documented 2% annual continuation.
  if (y >= last) return table[last] * Math.pow(1.02, Math.min(200, y - last));
  const lower = years.filter((v) => v <= y).at(-1),
    upper = years.find((v) => v > y),
    weight = (y - lower) / (upper - lower);
  return table[lower] * Math.pow(table[upper] / table[lower], weight);
}
