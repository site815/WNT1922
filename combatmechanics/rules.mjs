// Editable gameplay coefficients. Units are seconds, kilometres, knots and mm.
// These are a transparent naval-game model, not calibrated historical probabilities.
export const COMBAT_RULES = Object.freeze({
  version: 1, stepSeconds: 10, maximumSeconds: 10800, minimumSeconds: 120,
  knotsToKmSecond: 1.852 / 3600, shellKmSecond: .55, torpedoKnots: 42,
  maximumShips: 4096, targetCandidates: 12, historyFrames: 120,
  historyEvents: 1800, historyCharacters: 340000, historyIntervalSeconds: 30,
  gun: { baseHit: .075, minimumHit: .002, maximumHit: .38, damageScale: .032,
    armourFloor: .07, penetrationScale: 1.32, magazineChance: .004 },
  torpedo: { hitChance: .14, damageScale: .22, reloadSeconds: 900 },
  air: { cruiseKmh: 300, rangeKm: 420, rearmSeconds: 2700, launchDelaySeconds: 120,
    strikeFraction: .65, capFraction: .5, hitChance: .14, damageScale: .055 },
  damage: { floodingPerSecond: .00006, firePerSecond: .00003, repairPerSecond: .000025,
    sinkingHealth: .015, deadInWaterMachinery: .08 },
  sea: { escapeKm: 65, noContactSeconds: 1500 },
});
export const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
export const degrees = radians => radians * 180 / Math.PI;
export const radians = value => value * Math.PI / 180;
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const bearing = (a, b) => (degrees(Math.atan2(b.x - a.x, b.y - a.y)) + 360) % 360;
export const angleDifference = (a, b) => ((a - b + 540) % 360) - 180;
export function random(state) {
  // Explicit unsigned state survives JSON saves exactly; no Math.random/global RNG.
  let x = state.rng >>> 0; x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  state.rng = x >>> 0; return state.rng / 4294967296;
}
export function binomial(state, count, probability) {
  let hits = 0;
  for (let i = 0; i < Math.floor(count); i++) if (random(state) < probability) hits++;
  return hits;
}
