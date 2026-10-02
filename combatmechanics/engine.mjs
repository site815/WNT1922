import { COMBAT_RULES as R, clamp, distance } from './rules.mjs';
import { DOCTRINES, FORMATIONS, chooseTarget, manoeuvre } from './ship-ai.mjs';
import { weaponStats, fireWeapons, applyImpact, sink } from './weapons.mjs';
import { launchStrikes, advanceStrikes } from './air-operations.mjs';

const activeShip = ship => !['sunk', 'escaped'].includes(ship.status);
const historySizes = new WeakMap();
const entrySize = value => JSON.stringify(value).length + 1;
function adjustHistorySize(history, delta) {
  const current=historySizes.has(history)?historySizes.get(history):JSON.stringify(history).length;
  historySizes.set(history,current+delta);return current+delta;
}
function trimHistory(history) {
  let size=adjustHistorySize(history,0);
  while(size>R.historyCharacters&&history.frames.length>2){const removed=history.frames.splice(1,1)[0];size=adjustHistorySize(history,-entrySize(removed));history.truncated=true;}
  while(size>R.historyCharacters&&history.events.length){const removed=history.events.shift();size=adjustHistorySize(history,-entrySize(removed));history.truncated=true;history.omittedEvents++;}
  while(size>R.historyCharacters&&history.frames.length){const removed=history.frames.shift();size=adjustHistorySize(history,-entrySize(removed));history.truncated=true;}
}
const finite = (value, fallback, lo, hi) => Number.isFinite(Number(value)) ? clamp(Number(value), lo, hi) : fallback;
export function createCombat(config) {
  if (!config?.sides?.A || !config?.sides?.B) throw Error('Combat requires two fleets.');
  const seed = Number(config.seed) >>> 0 || 1;
  const state = { version: R.version, seed, rng: seed, seconds: 0, remainderSeconds: 0, nextId: 1,
    status: 'ongoing', winner: null, reason: '', maxDurationSeconds: finite(config.maxDurationSeconds, R.maximumSeconds, 60, 21600),
    environment: { visibilityKm: finite(config.environment?.visibilityKm, 28, 2, 80), seaState: finite(config.environment?.seaState, 2, 0, 9), night: !!config.environment?.night },
    sides: {}, ships: [], airstrikes: [], projectiles: [], lastContactAt: 0,
    history: { version: 1, frames: [], events: [], truncated: false, sampledIntervalSeconds: R.historyIntervalSeconds, omittedEvents: 0 },
    metadata: structuredClone(config.metadata || {}), recentEvents: [] };
  const ids = new Set();
  for (const side of ['A', 'B']) {
    const input = config.sides[side];
    if (!Array.isArray(input.ships) || !input.ships.length || input.ships.length > R.maximumShips) throw Error('Each side requires 1–4096 ships.');
    const doctrine = input.doctrine || 'balanced', formation = input.formation || 'line-ahead';
    if (!DOCTRINES[doctrine] || !FORMATIONS[formation]) throw Error('Choose a valid doctrine and formation.');
    state.sides[side] = { name: String(input.name || side).slice(0, 180), doctrine, formation, orders: {} };
    input.ships.forEach((spec, index) => {
      const stats = weaponStats(spec), groupId = String(spec.groupId || spec.id || `ship-${index}`).slice(0, 120);
      const hullIndex = Math.max(0, Math.floor(spec.hullIndex || 0)), id = String(spec.id || `${side}:${groupId}:${hullIndex}`);
      if (ids.has(id)) throw Error('Ship identities must be unique.'); ids.add(id);
      const spacing = FORMATIONS[formation].spacingKm, lineOffset = (index - (input.ships.length - 1) / 2) * spacing;
      const columns = Math.max(1,Math.ceil(input.ships.length/24));
      const separation = finite(config.separationKm, 24, 2, 500);
      const health = finite(spec.health, 1, 0, 1);
      state.ships.push({ id, side, groupId, hullIndex, initialCount: spec.initialCount || 1, index,
        classId: String(spec.classId || ''), name: String(spec.name || spec.classId || id).slice(0, 180), type: String(spec.type || 'DD'), stats,
        hiddenFromScene: !!spec.hiddenFromScene,
        x: finite(spec.x, (side === 'A' ? -1 : 1) * (separation / 2 + (formation === 'line-ahead' ? Math.floor(index / columns) * spacing : 0)), -10000, 10000),
        y: finite(spec.y, formation === 'line-abreast' ? lineOffset : (index % columns - (columns-1)/2) * spacing, -10000, 10000),
        heading: finite(spec.heading, side === 'A' ? 90 : 270, 0, 360), speed: stats.speed * .8,
        health, initialHealth: health, machinery: health, fireControl: Math.max(.1, health), flooding: 0, fire: 0,
        status: health > 0 ? 'active' : 'sunk', targetId: null, nextGunAt: (index % 4) * R.stepSeconds,
        nextTorpedoAt: 0, nextAswAt: 0, depthCharges: ['DD','DE','DL','CL'].includes(String(spec.type))?24:0,
        nextAirAt: R.air.launchDelaySeconds + (index % 4) * 20,
        torpedoes: Math.max(0, Math.floor(spec.torpedoes ?? stats.torpedoCapacity)),
        ammunition: Math.max(0, Math.floor(spec.ammunition ?? stats.barrels * 100)),
        aircraft: { ...stats.aircraft }, aircraftLost: 0, sunkAt: health > 0 ? null : 0, escapedAt: null });
    });
  }
  state.history.sampledIntervalSeconds = Math.max(R.historyIntervalSeconds,Math.ceil(state.ships.length/60)*R.historyIntervalSeconds);
  recordFrame(state, true); return state;
}
export function combatSnapshot(state) {
  return { seconds: state.seconds, status: state.status, winner: state.winner,
    ships: state.ships.map(ship => ({ id: ship.id, side: ship.side, groupId: ship.groupId, hullIndex: ship.hullIndex,
      initialCount: ship.initialCount, classId: ship.classId, name: ship.name, type: ship.type,
      hiddenFromScene: ship.hiddenFromScene,
      targetId: ship.targetId,
      x: ship.x, y: ship.y, heading: ship.heading, speed: ship.speed, health: ship.health,
      fire: ship.fire, flooding: ship.flooding, machinery: ship.machinery, fireControl: ship.fireControl,
      torpedoes: ship.torpedoes, ammunition: ship.ammunition, depthCharges: ship.depthCharges, status: ship.status, sunkAt: ship.sunkAt, escapedAt: ship.escapedAt,
      aircraft: { ...ship.aircraft }, aircraftLost: ship.aircraftLost })),
    airstrikes: state.airstrikes.map(({ id, side, sourceId, targetId, x, y, heading, planes, fighters, phase }) =>
      ({ id, side, sourceId, targetId, x, y, heading, planes, fighters, phase })) };
}
function emitEvent(state, event) {
  const row = { id: `event-${state.nextId++}`, seconds: state.seconds, ...event };
  adjustHistorySize(state.history,0);state.recentEvents.push(row); state.history.events.push(row);adjustHistorySize(state.history,entrySize(row));
  if (state.history.events.length > R.historyEvents) {
    // Prefer retaining impacts/sinkings. Every omitted interval is explicitly marked.
    const disposable = state.history.events.findIndex(e => e.kind === 'salvo');
    const removed=state.history.events.splice(disposable >= 0 ? disposable : 0, 1)[0];adjustHistorySize(state.history,-entrySize(removed));
    state.history.truncated = true; state.history.omittedEvents++;
  }
  trimHistory(state.history);
}
// Campaign actions can destroy a hull already present in another encounter.
// Use the same sinking path so deck aircraft and the replay event remain exact.
export function sinkCombatShip(state, ship, cause) {
  sink(state, ship, cause, event => emitEvent(state, event));
}
function recordFrame(state, force = false) {
  const history = state.history, last = history.frames.at(-1);
  if (last?.seconds === state.seconds) return;
  if (!force && last && state.seconds - last.seconds < history.sampledIntervalSeconds) return;
  adjustHistorySize(history,0);const snapshot=combatSnapshot(state);history.frames.push(snapshot);adjustHistorySize(history,entrySize(snapshot));
  if (history.frames.length > R.historyFrames) {
    history.frames = history.frames.filter((frame, i) => {const keep=i === 0 || i % 2 === 0 || i === history.frames.length - 1;if(!keep)adjustHistorySize(history,-entrySize(frame));return keep;});
    history.sampledIntervalSeconds *= 2; history.truncated = true;
  }
  trimHistory(history);
}
function complete(state, reason) {
  if (state.status !== 'ongoing') return;
  state.status = 'completed'; state.reason = reason;
  const scores = Object.fromEntries(['A', 'B'].map(side => [side, state.ships.filter(s => s.side === side)
    .reduce((n, s) => n + (s.status === 'sunk' ? s.stats.tons : (s.initialHealth - s.health) * s.stats.tons * .65), 0)]));
  const a = state.ships.some(s => s.side === 'A' && activeShip(s)), b = state.ships.some(s => s.side === 'B' && activeShip(s));
  if(state.metadata.externalAirRaid){
    const costA=(state.externalAirLosses||0)*40,costB=scores.B+(state.externalCapLosses||0)*40;
    state.winner=costA===costB?null:costA<costB?'A':'B';
  }else state.winner = !a && b ? 'B' : a && !b ? 'A' : scores.A === scores.B ? null : scores.A < scores.B ? 'A' : 'B';
  emitEvent(state, { kind: 'end', winner: state.winner, reason }); recordFrame(state, true);
}
function step(state) {
  const emit = event => emitEvent(state, event);
  state.seconds += R.stepSeconds; state.recentEvents = [];
  const active = state.ships.filter(activeShip), sides = { A: active.filter(s => s.side === 'A'), B: active.filter(s => s.side === 'B') };
  const activeById=new Map(active.map(ship=>[ship.id,ship]));
  const targets = new Map();
  for (const ship of active) {
    const enemy = sides[ship.side === 'A' ? 'B' : 'A'];
    const orderedId=state.sides[ship.side].orders.targetId,ordered=orderedId?activeById.get(orderedId):null;
    const target = ordered || chooseTarget(state, ship, enemy,activeById); ship.targetId = target?.id || null; targets.set(ship.id, target);
  }
  // Both sides move before either side fires: no first-side positional advantage.
  for (const ship of active) {
    const prior = ship.status; manoeuvre(state, ship, targets.get(ship.id));
    if (ship.status !== prior && ['withdrawing', 'escaped'].includes(ship.status)) emit({ kind: 'withdraw', targetId: ship.id, position: [ship.x, ship.y], status: ship.status });
  }
  for (const ship of active) fireWeapons(state, ship, targets.get(ship.id), emit);
  const arriving = state.projectiles.filter(p => p.arrivalAt <= state.seconds);
  state.projectiles = state.projectiles.filter(p => p.arrivalAt > state.seconds);
  const byId = new Map(state.ships.map(s => [s.id, s]));
  for (const projectile of arriving) if (projectile.hits > 0)
    applyImpact(state, byId.get(projectile.targetId), projectile.damage, projectile.kind, byId.get(projectile.attackerId), emit);
  const afloat = state.ships.filter(activeShip);
  launchStrikes(state, afloat, emit); advanceStrikes(state, afloat, emit);
  for (const ship of state.ships.filter(activeShip)) {
    const ongoingDamage = (ship.flooding * R.damage.floodingPerSecond + ship.fire * R.damage.firePerSecond) * R.stepSeconds;
    ship.health = clamp(ship.health - ongoingDamage, 0, 1);
    const repair = R.damage.repairPerSecond * R.stepSeconds * ship.stats.crewQuality * ship.stats.damageControl;
    ship.fire = Math.max(0, ship.fire - repair); ship.flooding = Math.max(0, ship.flooding - repair * .45);
    if (ship.health <= R.damage.sinkingHealth) sink(state, ship, 'progressive flooding and fire', emit);
  }
  const remainingA = state.ships.some(s => s.side === 'A' && activeShip(s)), remainingB = state.ships.some(s => s.side === 'B' && activeShip(s));
  if ((!remainingA || !remainingB) && !state.projectiles.length && !state.airstrikes.length) complete(state, 'One fleet has sunk or disengaged.');
  else if (state.seconds >= state.maxDurationSeconds) complete(state, 'The scenario time limit has been reached.');
  else if (state.seconds >= R.minimumSeconds && state.seconds - state.lastContactAt >= R.sea.noContactSeconds && !state.airstrikes.length) {
    const canContact = state.ships.filter(activeShip).some(s => {
      const target = targets.get(s.id); return target && distance(s, target) < Math.max(s.stats.gunRangeKm * 1.5, s.stats.torpedoRangeKm * 1.5, 8);
    });
    if (!canContact) complete(state, 'Both fleets have lost contact.');
  }
  recordFrame(state);
}
export function advanceCombat(state, seconds = R.stepSeconds) {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 21600) throw Error('Advance by 0–21600 seconds.');
  if (state.version !== R.version) throw Error('Unsupported tactical combat state.');
  state.remainderSeconds += seconds;
  while (state.status === 'ongoing' && state.remainderSeconds >= R.stepSeconds) {
    state.remainderSeconds -= R.stepSeconds; step(state);
  }
  if (state.status !== 'ongoing') state.remainderSeconds = 0;
  return state;
}
export function resolveCombat(state) {
  while (state.status === 'ongoing') advanceCombat(state, 900);
  return state;
}
export function setCombatOrders(state, side, orders) {
  if (!state.sides[side]) throw Error('Unknown combat side.');
  if (orders.doctrine !== undefined) {
    if (!DOCTRINES[orders.doctrine]) throw Error('Unknown doctrine.'); state.sides[side].doctrine = orders.doctrine;
  }
  const clean = {};
  if (orders.withdraw !== undefined) clean.withdraw = !!orders.withdraw;
  if (Number.isFinite(orders.course)) clean.course = (orders.course % 360 + 360) % 360;
  if (typeof orders.targetId === 'string' && state.ships.some(s => s.id === orders.targetId && s.side !== side)) clean.targetId = orders.targetId;
  state.sides[side].orders = clean; return state;
}
export function combatSummary(state) {
  const sides = Object.fromEntries(['A', 'B'].map(side => {
    const ships = state.ships.filter(s => s.side === side), sunk = ships.filter(s => s.status === 'sunk');
    return [side, { initial: ships.length, surviving: ships.length - sunk.length, sunk: sunk.length,
      escaped: ships.filter(s => s.status === 'escaped').length, damaged: ships.filter(s => s.health > 0 && s.health < s.initialHealth).length,
      damage: ships.reduce((n, s) => n + Math.max(0, s.initialHealth - s.health), 0),
      sunkTons: sunk.reduce((n, s) => n + s.stats.tons, 0), planesLost: ships.reduce((n, s) => n + s.aircraftLost, 0) }];
  }));
  return { status: state.status, winner: state.winner, reason: state.reason, seconds: state.seconds, sides };
}
