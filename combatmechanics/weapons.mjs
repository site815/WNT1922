import { COMBAT_RULES as R, clamp, random, binomial, distance, bearing, angleDifference } from './rules.mjs';
import { DOCTRINES } from './ship-ai.mjs';

export function weaponStats(spec) {
  const tons = Math.max(100, Number(spec.tons) || 1000), caliber = Math.max(0, Number(spec.caliber) || 0);
  const gunRangeKm = Number(spec.gunRangeKm) || (caliber >= 280 ? 32 : caliber >= 180 ? 25 : caliber >= 100 ? 17 : caliber > 0 ? 8 : 0);
  return { tons, caliber, barrels: Math.max(0, Math.round(Number(spec.barrels) || 0)),
    speed: clamp(Number(['SS','SM'].includes(spec.type)?(spec.submergedSpeed||spec.speed):spec.speed) || 0, 0, 60), belt: Math.max(0, Number(spec.belt) || 0), deck: Math.max(0, Number(spec.deck) || 0),
    aa: Math.max(0, Number(spec.aa) || 0), radar: !!spec.radar, sonar: !!spec.sonar,
    gunRangeKm, reloadSeconds: Number(spec.reloadSeconds) || (caliber >= 280 ? 35 : caliber >= 180 ? 20 : caliber >= 100 ? 10 : 10),
    shellDamage: Number(spec.shellDamage) || Math.pow(caliber / 200, 2.5) * R.gun.damageScale,
    tubes: Math.max(0, Math.floor(Number(spec.tubes) || 0)), torpedoRangeKm: Math.max(0, Number(spec.torpedoRange) || 8),
    torpedoCapacity: Math.max(0, Math.floor(spec.torpedoCapacity ?? spec.tubes ?? 0)),
    crewQuality: clamp(Number(spec.crewQuality) || 1, .25, 1.6),
    damageControl:clamp(Number(spec.damageControl)||1,.5,2),
    aircraft: { fighter: Math.max(0, Math.floor(spec.aircraft?.fighter || 0)), strike: Math.max(0, Math.floor(spec.aircraft?.strike || 0)) },
  };
}
export function gunHitProbability(state, attacker, target) {
  if (['SS','SM'].includes(attacker.type) || ['SS','SM'].includes(target.type)) return 0;
  const range = distance(attacker, target), visibility = state.environment.visibilityKm;
  if (!attacker.stats.barrels || range > attacker.stats.gunRangeKm || range > visibility * (attacker.stats.radar ? 1.8 : 1)) return 0;
  const training = attacker.stats.crewQuality;
  const rangeFactor = clamp(1.8 - range / Math.max(1, attacker.stats.gunRangeKm) * 1.5, .15, 1.8);
  const size = clamp(Math.sqrt(target.stats.tons / 12000), .3, 1.5);
  const evasive = clamp(1 - target.speed / 110, .55, 1);
  const night = state.environment.night && !attacker.stats.radar ? .3 : 1;
  const sea = 1 - state.environment.seaState * .055;
  return clamp(R.gun.baseHit * rangeFactor * size * evasive * training * night * sea * attacker.fireControl * DOCTRINES[state.sides[attacker.side].doctrine].accuracy,
    R.gun.minimumHit, R.gun.maximumHit);
}
export function armourMultiplier(attacker, target, range) {
  const plunging = clamp(range / Math.max(1, attacker.stats.gunRangeKm), 0, 1);
  const broadside = Math.abs(Math.sin(angleDifference(target.heading, bearing(target, attacker)) * Math.PI / 180));
  const effectiveArmour = (target.stats.belt * (1 - plunging * .55) + target.stats.deck * plunging * .85) / Math.max(.5, broadside);
  const penetration = attacker.stats.caliber * R.gun.penetrationScale * (1 - plunging * .42);
  return clamp(penetration / Math.max(20, effectiveArmour), R.gun.armourFloor, 1.6);
}
export function applyImpact(state, target, damage, kind, source, emit, scripted = null) {
  if (!target || ['sunk', 'escaped'].includes(target.status) || damage <= 0) return;
  const before = target.health;
  const hit = clamp(damage, 0, 1);
  target.health = clamp(scripted ? Math.min(target.health, scripted.healthAfter) : target.health - hit, 0, 1);
  target.machinery = clamp(target.machinery - hit * (scripted ? .75 : .45 + random(state) * .65), 0, 1);
  target.fireControl = clamp(target.fireControl - hit * (scripted ? .3 : random(state) * .6), .1, 1);
  target.fire = clamp(target.fire + hit * (kind === 'torpedo' ? .2 : 1.4), 0, 1);
  target.flooding = clamp(target.flooding + hit * (kind === 'torpedo' ? 2 : .32), 0, 1);
  if (scripted) {
    for (const key of ['machinery','fireControl','fire','flooding']) if (Number.isFinite(scripted[key])) target[key] = clamp(scripted[key], 0, 1);
    if (scripted.cause) target.lossCause = scripted.cause;
  } else if (hit > .015 && random(state) < R.gun.magazineChance * hit * 5) { target.health = 0; target.lossCause = 'magazine explosion'; }
  emit({ kind: 'impact', weapon: kind, attackerId: source?.id || source || null, targetId: target.id,
    position: source && typeof source === 'object' ? [source.x, source.y] : [target.x, target.y],
    targetPosition: [target.x, target.y], damage: before - target.health, health: target.health });
  if (target.health <= R.damage.sinkingHealth) sink(state, target, kind, emit);
}
export function sink(state, ship, cause, emit) {
  if (ship.status === 'sunk') return;
  ship.status = 'sunk'; ship.health = 0; ship.speed = 0; ship.sunkAt = state.seconds; ship.lossCause ||= cause;
  const aboard = ship.aircraft.fighter + ship.aircraft.strike;
  ship.aircraftLost += aboard; ship.aircraft = { fighter: 0, strike: 0 };
  emit({ kind: 'sink', targetId: ship.id, position: [ship.x, ship.y], targetPosition: [ship.x, ship.y], cause: ship.lossCause, planesLost: aboard });
}
export function fireWeapons(state, ship, target, emit) {
  if (!target || ['sunk', 'escaped'].includes(ship.status)) return;
  const range = distance(ship, target), probability = gunHitProbability(state, ship, target);
  if (['SS','SM'].includes(target.type) && ship.depthCharges>0 && range<=(ship.stats.sonar?3:1.4) && ship.nextAswAt<=state.seconds) {
    ship.depthCharges--;ship.nextAswAt=state.seconds+60;
    const hits=binomial(state,1,(ship.stats.sonar?.3:.1)*ship.stats.crewQuality*(1-state.environment.seaState*.05));
    const arrivalAt=state.seconds+20;
    state.projectiles.push({attackerId:ship.id,targetId:target.id,kind:'depth charge',arrivalAt,damage:hits*.15,hits,position:[ship.x,ship.y],targetPosition:[target.x,target.y]});
    emit({kind:'salvo',weapon:'depth charge',attackerId:ship.id,targetId:target.id,position:[ship.x,ship.y],targetPosition:[target.x,target.y],rounds:1,hits,arrivalAt});state.lastContactAt=state.seconds;
  }
  if (probability && ship.nextGunAt <= state.seconds && ship.ammunition > 0) {
    const aspect = Math.abs(Math.sin(angleDifference(ship.heading, bearing(ship, target)) * Math.PI / 180));
    const barrels = Math.max(1, Math.round(ship.stats.barrels * (.4 + .6 * aspect) * ship.fireControl));
    const fired = Math.min(barrels, ship.ammunition); ship.ammunition -= fired;
    ship.nextGunAt = state.seconds + Math.ceil(ship.stats.reloadSeconds / R.stepSeconds) * R.stepSeconds;
    const hits = binomial(state, fired, probability), damage = hits * ship.stats.shellDamage * armourMultiplier(ship, target, range) / Math.sqrt(target.stats.tons / 1000);
    const arrivalAt = state.seconds + Math.max(R.stepSeconds, Math.ceil(range / R.shellKmSecond / R.stepSeconds) * R.stepSeconds);
    state.projectiles.push({ attackerId: ship.id, targetId: target.id, kind: 'shell', arrivalAt, damage, hits,
      position: [ship.x, ship.y], targetPosition: [target.x, target.y] });
    state.lastContactAt = state.seconds;
    emit({ kind: 'salvo', attackerId: ship.id, targetId: target.id, position: [ship.x, ship.y], targetPosition: [target.x, target.y], rounds: fired, hits, arrivalAt });
  }
  if (target.type !== 'FORT' && ship.torpedoes > 0 && range <= ship.stats.torpedoRangeKm && ship.nextTorpedoAt <= state.seconds) {
    const fired = Math.min(ship.stats.tubes, ship.torpedoes); ship.torpedoes -= fired;
    ship.nextTorpedoAt = state.seconds + R.torpedo.reloadSeconds;
    const probability = R.torpedo.hitChance * clamp(1.5 - range / ship.stats.torpedoRangeKm, .3, 1.4) * ship.stats.crewQuality * (['SS','SM'].includes(target.type)?.15:1);
    const hits = binomial(state, fired, probability);
    const arrivalAt = state.seconds + Math.max(R.stepSeconds, Math.ceil(range / (R.torpedoKnots * R.knotsToKmSecond) / R.stepSeconds) * R.stepSeconds);
    state.projectiles.push({ attackerId: ship.id, targetId: target.id, kind: 'torpedo', arrivalAt,
      damage: hits * R.torpedo.damageScale / Math.sqrt(target.stats.tons / 10000), hits,
      position: [ship.x, ship.y], targetPosition: [target.x, target.y] });
    state.lastContactAt = state.seconds;
    emit({ kind: 'torpedo', attackerId: ship.id, targetId: target.id, position: [ship.x, ship.y], targetPosition: [target.x, target.y], rounds: fired, hits, arrivalAt });
  }
}
