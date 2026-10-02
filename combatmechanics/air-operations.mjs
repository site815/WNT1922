import { COMBAT_RULES as R, clamp, distance, bearing, binomial } from './rules.mjs';
import { applyImpact } from './weapons.mjs';

// Each strike is one moving tactical unit. Plane counts govern CAP, AA and payload.
export function launchStrikes(state, active, emit) {
  for (const carrier of active) {
    if (carrier.aircraft.strike <= 0 || carrier.nextAirAt > state.seconds || carrier.health < .15) continue;
    const enemies = active.filter(s => s.side !== carrier.side);
    const target = enemies.sort((a, b) => {
      const score = s => distance(carrier, s) - (['CV', 'CVL'].includes(s.type) ? 40 : ['BB', 'BC'].includes(s.type) ? 10 : 0);
      return score(a) - score(b);
    })[0];
    if (!target || distance(carrier, target) > R.air.rangeKm) continue;
    const planes = carrier.aircraft.strike, fighters = Math.floor(carrier.aircraft.fighter * (1 - R.air.capFraction));
    carrier.aircraft.strike -= planes; carrier.aircraft.fighter -= fighters;
    carrier.nextAirAt = state.seconds + R.air.rearmSeconds;
    const strike = { id: `air-${state.nextId++}`, side: carrier.side, sourceId: carrier.id, targetId: target.id,
      x: carrier.x, y: carrier.y, heading: bearing(carrier, target), planes, fighters, launchedPlanes: planes + fighters,
      phase: 'outbound', attacks: 0, lost: 0, crewQuality: carrier.stats.crewQuality };
    state.airstrikes.push(strike);
    emit({ kind: 'air-launch', attackerId: carrier.id, targetId: target.id, strikeId: strike.id,
      position: [carrier.x, carrier.y], targetPosition: [target.x, target.y], planes, fighters });
    state.lastContactAt = state.seconds;
  }
}
export function advanceStrikes(state, active, emit) {
  for (const strike of state.airstrikes) {
    active = state.ships.filter(ship => !['sunk','escaped'].includes(ship.status));
    if (['landed', 'lost'].includes(strike.phase)) continue;
    const source = state.ships.find(s => s.id === strike.sourceId);
    let target = state.ships.find(s => s.id === strike.targetId && !['sunk', 'escaped'].includes(s.status));
    if (strike.phase === 'outbound' && !target) {
      target = active.filter(s => s.side !== strike.side).sort((a, b) => distance(strike, a) - distance(strike, b))[0];
      if (target) strike.targetId = target.id; else strike.phase = 'returning';
    }
    if (strike.phase === 'returning') {
      const room = s => s.stats.aircraft.strike + s.stats.aircraft.fighter - s.aircraft.strike - s.aircraft.fighter;
      const landing = source && source.status !== 'sunk' && room(source)>0 ? source
        : state.ships.filter(s => s.status !== 'sunk' && s.side === strike.side && room(s)>0)
          .sort((a, b) => distance(strike, a) - distance(strike, b))[0];
      if (!landing) {
        if (source) source.aircraftLost += strike.planes + strike.fighters;
        emit({ kind: 'air-loss', strikeId: strike.id, attackerId: strike.sourceId, position: [strike.x, strike.y], planesLost: strike.planes + strike.fighters, cause: 'No surviving carrier for recovery' });
        strike.planes = 0; strike.fighters = 0; strike.phase = 'lost'; continue;
      }
      target = landing;
    }
    if (!target) continue;
    const range = distance(strike, target), move = R.air.cruiseKmh / 3600 * R.stepSeconds;
    strike.heading = bearing(strike, target);
    if (range > move + 1) {
      const h = strike.heading * Math.PI / 180;
      strike.x += Math.sin(h) * move; strike.y += Math.cos(h) * move; continue;
    }
    strike.x = target.x; strike.y = target.y;
    if (strike.phase === 'returning') {
      let room = Math.max(0,target.stats.aircraft.strike + target.stats.aircraft.fighter - target.aircraft.strike - target.aircraft.fighter);
      const planes=Math.min(room,strike.planes);target.aircraft.strike+=planes;strike.planes-=planes;room-=planes;
      const fighters=Math.min(room,strike.fighters);target.aircraft.fighter+=fighters;strike.fighters-=fighters;
      if(!strike.planes&&!strike.fighters)strike.phase='landed';continue;
    }
    const defenders = active.filter(s => s.side !== strike.side && distance(s, target) <= 8);
    const external = state.externalDefense?.side !== strike.side ? state.externalDefense : null;
    const cap = defenders.reduce((n, s) => n + s.aircraft.fighter, 0) + (external?.cap || 0);
    const aa = defenders.reduce((n, s) => n + s.stats.aa * s.fireControl, 0) + (external?.aa || 0);
    const capLossProbability = clamp(cap / Math.max(1, strike.planes + strike.fighters * 2) * .12, 0, .65);
    const shotDown = binomial(state, strike.planes, clamp(capLossProbability + aa / (aa + 350) * .25, 0, .8));
    const fighterLost = binomial(state, strike.fighters, clamp(capLossProbability * .65 + .015, 0, .5));
    strike.planes -= shotDown; strike.fighters -= fighterLost; strike.lost += shotDown + fighterLost;
    if (source) source.aircraftLost += shotDown + fighterLost;
    else state.externalAirLosses = (state.externalAirLosses || 0) + shotDown + fighterLost;
    const capLosses = binomial(state, Math.min(cap, strike.launchedPlanes), clamp(.025 + strike.fighters / Math.max(1, cap) * .05, .025, .25));
    let remaining = capLosses;
    for (const defender of defenders) {
      const lost = Math.min(remaining, defender.aircraft.fighter); defender.aircraft.fighter -= lost;
      defender.aircraftLost += lost; remaining -= lost;
    }
    if (external && remaining > 0) {
      const lost = Math.min(remaining, external.cap); external.cap -= lost;
      state.externalCapLosses = (state.externalCapLosses || 0) + lost;
    }
    const probability = R.air.hitChance * strike.crewQuality * (1 - state.environment.seaState * .045) * (state.environment.night ? .4 : 1);
    const hits = binomial(state, strike.planes, probability);
    emit({ kind: 'air-attack', attackerId: source?.id || strike.sourceId, targetId: target.id, strikeId: strike.id,
      position: [strike.x, strike.y], targetPosition: [target.x, target.y], planes: strike.planes, hits,
      planesLost: shotDown + fighterLost, capLosses });
    applyImpact(state, target, hits * R.air.damageScale / Math.sqrt(target.stats.tons / 10000), 'air strike', source, emit);
    strike.attacks++; strike.phase = state.metadata.externalAirRaid?'landed':'returning'; state.lastContactAt = state.seconds;
  }
  // Finished flights have no live tactical presence. Their identities remain in events.
  state.airstrikes = state.airstrikes.filter(s => !['landed', 'lost'].includes(s.phase));
}
