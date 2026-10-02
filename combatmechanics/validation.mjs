import { COMBAT_RULES as R } from './rules.mjs';
import { DOCTRINES, FORMATIONS } from './ship-ai.mjs';

export function validateCombatState(state, classes = null) {
  const fail = () => { throw Error('Invalid tactical combat state in save.'); };
  const number = (v, low = 0, high = 1e9) => typeof v === 'number' && Number.isFinite(v) && v >= low && v <= high;
  const text = (v, max = 200) => typeof v === 'string' && v.length <= max;
  const unit = v => number(v, 0, 1);
  if (!state || state.version !== R.version || !number(state.seconds, 0, 21610) || !Number.isInteger(state.seconds / R.stepSeconds)
    || !Number.isInteger(state.rng) || !number(state.rng, 1, 4294967295) || !number(state.remainderSeconds, 0, 21600)
    || !Number.isInteger(state.nextId) || !number(state.nextId, 1) || !number(state.maxDurationSeconds, 60, 21600)
    || !['ongoing', 'completed'].includes(state.status) || ![null, 'A', 'B'].includes(state.winner)
    || !number(state.lastContactAt, 0, state.seconds) || !text(state.reason, 500)) fail();
  if (!state.environment || !number(state.environment.visibilityKm, 2, 80) || !number(state.environment.seaState, 0, 9)
    || typeof state.environment.night !== 'boolean') fail();
  for (const side of ['A', 'B']) {
    if (!state.sides?.[side] || !DOCTRINES[state.sides[side].doctrine] || !FORMATIONS[state.sides[side].formation]
      || !text(state.sides[side].name) || !state.sides[side].orders || typeof state.sides[side].orders !== 'object') fail();
    const orders = state.sides[side].orders;
    if (orders.withdraw !== undefined && typeof orders.withdraw !== 'boolean') fail();
    if (orders.course !== undefined && !number(orders.course, 0, 360)) fail();
    if (orders.targetId !== undefined && !text(orders.targetId, 250)) fail();
  }
  if (!Array.isArray(state.ships) || state.ships.length > R.maximumShips * 2 || !Array.isArray(state.projectiles)
    || state.projectiles.length > 100000 || !Array.isArray(state.airstrikes) || state.airstrikes.length > R.maximumShips * 2) fail();
  const ids = new Set();
  const pose = ship => {
    if (!ship || !text(ship.id, 250) || !['A', 'B'].includes(ship.side) || !text(ship.groupId, 120)
      || !text(ship.classId, 200) || (classes && !classes[ship.classId] && !/^combat-(merchant|shore)-/.test(ship.classId))
      || !text(ship.name, 180) || !text(ship.type, 40) || !Number.isInteger(ship.hullIndex) || !number(ship.hullIndex, 0, 1000000)
      || !number(ship.x, -20000, 20000) || !number(ship.y, -20000, 20000) || !number(ship.heading, 0, 360)
      || !number(ship.speed, 0, 100) || !unit(ship.health) || !unit(ship.fire) || !unit(ship.flooding)
      || !unit(ship.machinery) || !unit(ship.fireControl) || !['active', 'withdrawing', 'escaped', 'sunk'].includes(ship.status)
      || (ship.sunkAt !== null && !number(ship.sunkAt, 0, state.seconds))) fail();
  };
  for (const ship of state.ships) {
    pose(ship); if (ids.has(ship.id)) fail(); ids.add(ship.id);
    if (!unit(ship.initialHealth) || !number(ship.aircraftLost) || !number(ship.torpedoes) || !number(ship.ammunition)
      || !ship.stats || !number(ship.stats.tons, 100, 1e7) || !number(ship.stats.speed, 0, 60)
      || !['caliber','barrels','belt','deck','aa','gunRangeKm','reloadSeconds','shellDamage','tubes','torpedoRangeKm','torpedoCapacity','crewQuality','damageControl'].every(k => number(ship.stats[k]))
      || typeof ship.stats.radar !== 'boolean' || typeof ship.stats.sonar !== 'boolean'
      || !ship.aircraft || !number(ship.aircraft.fighter) || !number(ship.aircraft.strike)
      || !ship.stats.aircraft || !number(ship.stats.aircraft.fighter) || !number(ship.stats.aircraft.strike)
      || !['nextGunAt','nextTorpedoAt','nextAirAt'].every(k => number(ship[k]))) fail();
  }
  for (const projectile of state.projectiles)
    if (!ids.has(projectile.attackerId) || !ids.has(projectile.targetId) || !['shell', 'torpedo','depth charge'].includes(projectile.kind)
      || !number(projectile.arrivalAt, state.seconds, 1000000) || !number(projectile.damage) || !number(projectile.hits)) fail();
  const air = strike => {
    if (!text(strike.id, 100) || !['A', 'B'].includes(strike.side) || !text(strike.sourceId, 250) || !ids.has(strike.targetId)
      || !number(strike.x, -20000, 20000) || !number(strike.y, -20000, 20000) || !number(strike.heading, 0, 360)
      || !number(strike.planes) || !number(strike.fighters) || !['outbound', 'returning', 'landed', 'lost'].includes(strike.phase)) fail();
  };
  for (const strike of state.airstrikes) { air(strike); if (!number(strike.crewQuality, .1, 3)) fail(); }
  const h = state.history;
  if (!h || h.version !== 1 || !Array.isArray(h.frames) || h.frames.length > R.historyFrames || !Array.isArray(h.events)
    || h.events.length > R.historyEvents || typeof h.truncated !== 'boolean' || !number(h.sampledIntervalSeconds, 10, 86400)
    || !number(h.omittedEvents) || JSON.stringify(h).length > R.historyCharacters + 60000) fail();
  let previous = -1;
  for (const frame of h.frames) {
    if (!number(frame.seconds, 0, state.seconds) || frame.seconds < previous || !Array.isArray(frame.ships) || frame.ships.length !== state.ships.length
      || !Array.isArray(frame.airstrikes) || frame.airstrikes.length > R.maximumShips * 2) fail();
    previous = frame.seconds;
    for (const ship of frame.ships) { pose(ship); if (!ids.has(ship.id)) fail(); }
    for (const strike of frame.airstrikes) air(strike);
  }
  for (const event of h.events) {
    if (!text(event.id, 100) || !number(event.seconds, 0, state.seconds)
      || !['salvo','impact','torpedo','air-launch','air-attack','air-loss','sink','withdraw','end'].includes(event.kind)) fail();
    for (const key of ['position', 'targetPosition']) if (event[key] !== undefined && (!Array.isArray(event[key]) || event[key].length !== 2 || !event[key].every(v => number(v, -20000, 20000)))) fail();
    for (const key of ['damage','health','hits','rounds','planes','planesLost','capLosses','fighters','arrivalAt']) if (event[key] !== undefined && !number(event[key])) fail();
  }
  if (state.campaignApplied) for (const ship of state.ships) {
    const applied = state.campaignApplied[ship.id];
    if (!applied || !unit(applied.health) || typeof applied.sunk !== 'boolean' || !number(applied.aircraftLost)) fail();
  }
  return true;
}
