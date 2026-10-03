import { COMBAT_RULES as R, clamp, distance, bearing, angleDifference } from './rules.mjs';

export const DOCTRINES = Object.freeze({
  balanced: { label: 'Balanced', preferredRange: .65, withdrawHealth: .22, speedFraction: .82, accuracy: 1 },
  aggressive: { label: 'Close and engage', preferredRange: .40, withdrawHealth: .10, speedFraction: 1, accuracy: .94 },
  cautious: { label: 'Keep range', preferredRange: .86, withdrawHealth: .42, speedFraction: .9, accuracy: 1.04 },
});
export const FORMATIONS = Object.freeze({
  'line-ahead': { label: 'Line ahead', spacingKm: .65 },
  'line-abreast': { label: 'Line abreast', spacingKm: .85 },
});
export function chooseTarget(state, ship, enemies, activeById) {
  if (!enemies.length) return null;
  const prior = activeById?.get(ship.targetId);
  let target = prior || enemies[(ship.index + Math.floor(state.seconds / 30)) % enemies.length], score = Infinity;
  // Bounded deterministic candidate search makes very large fleet actions affordable.
  // Small actions evaluate every opposing hull; large actions rotate candidates.
  const count = Math.min(enemies.length, R.targetCandidates);
  const offset = (ship.index * 17 + Math.floor(state.seconds / 30) * 7) % enemies.length;
  const candidates = [target, ...Array.from({ length: count }, (_, n) => enemies[(offset + n) % enemies.length])];
  for (const candidate of candidates) {
    const range = distance(ship, candidate);
    const threat = candidate.stats.caliber >= 280 && ship.stats.caliber >= 280 ? .8 : 1;
    const next = range * threat * (candidate.status === 'withdrawing' ? 1.12 : 1);
    if (next < score) { score = next; target = candidate; }
  }
  return target;
}
export function manoeuvre(state, ship, target) {
  if (ship.status === 'sunk' || ship.status === 'escaped') return;
  const doctrine = DOCTRINES[state.sides[ship.side].doctrine];
  const orders = state.historical ? state.historical.orders[ship.id] || {} : state.sides[ship.side].orders || {};
  if (!state.historical && (orders.withdraw || ['AK', 'AM', 'AO'].includes(ship.type) || ship.health < doctrine.withdrawHealth)) ship.status = 'withdrawing';
  let desired = ship.heading;
  if (target && !state.historical) {
    const toEnemy = bearing(ship, target), range = distance(ship, target);
    const carrier = ship.stats.aircraft.strike + ship.stats.aircraft.fighter > 0;
    const submarine = ['SS','SM'].includes(ship.type), targetSubmarine = ['SS','SM'].includes(target.type);
    const preferred = carrier ? 90 : targetSubmarine && ship.depthCharges > 0 ? 1.2
      : submarine ? Math.max(1,ship.stats.torpedoRangeKm*.6) : ship.stats.gunRangeKm * doctrine.preferredRange;
    if (ship.status === 'withdrawing' || (carrier && range < 80)) desired = toEnemy + 180;
    else if (range > Math.max(.3, preferred) * 1.15) desired = toEnemy;
    else if (range < preferred * .8) desired = toEnemy + 155;
    else desired = toEnemy + (ship.side === 'A' ? 75 : -75); // present broadside
  }
  if (Number.isFinite(orders.course) && (state.historical || ship.status !== 'withdrawing')) desired = orders.course;
  const maxTurn = (ship.stats.tons > 15000 ? 1 : 2.8) * R.stepSeconds;
  ship.heading = (ship.heading + clamp(angleDifference(desired, ship.heading), -maxTurn, maxTurn) + 360) % 360;
  const machinery = ship.machinery < R.damage.deadInWaterMachinery ? 0 : Math.sqrt(ship.machinery);
  ship.speed = state.historical ? Math.min(ship.stats.speed, orders.speed ?? ship.stats.speed * .8) * (ship.machinery > 0 ? 1 : 0)
    : ship.stats.speed * doctrine.speedFraction * machinery * clamp(1 - ship.flooding * .65, .05, 1);
  const travelled = ship.speed * R.knotsToKmSecond * R.stepSeconds;
  const h = ship.heading * Math.PI / 180;
  ship.x += Math.sin(h) * travelled; ship.y += Math.cos(h) * travelled;
  if (!state.historical && ship.status === 'withdrawing' && target && distance(ship, target) > R.sea.escapeKm) { ship.status = 'escaped'; ship.escapedAt = state.seconds; }
}
