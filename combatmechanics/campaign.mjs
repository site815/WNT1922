import { createCombat, combatSnapshot, sinkCombatShip } from './engine.mjs';

// Campaign adapter: one immutable identity per hull, including aggregate groups.
// Aircraft already assigned to a strategic sortie are absent from g.airWing and
// therefore cannot be launched a second time by this encounter.
export function createCampaignCombat({ seed, classes, groupsA, groupsB, nationA, nationB, nameA, nameB, aggressiveA, aggressiveB, supplyA=1,supplyB=1 }) {
  if (!groupsA.some(g => g.count > 0) || !groupsB.some(g => g.count > 0)) return null;
  const side = (key, groups, nation, name, aggressive,supply) => ({ name,
    doctrine: aggressive ? 'aggressive' : 'balanced', formation: 'line-ahead',
    ships: groups.flatMap(g => {
      const cl = classes[g.classId], wings = g.airWing || [];
      const planes = role => wings.filter(w => role === 'strike' ? ['strike', 'bomber'].includes(w.role) : w.role === role)
        .reduce((n, w) => n + Math.min(w.count, w.crewed || 0), 0);
      const fighter = planes('fighter'), strike = planes('strike');
      return Array.from({ length: g.count }, (_, hullIndex) => ({ ...cl, id: `${key}:${g.id}:${hullIndex}`,
        groupId: g.id, hullIndex, initialCount: g.count, classId: g.classId, name: g.count === 1 ? g.name : `${g.name} ${hullIndex + 1}`,
        health: g.health, crewQuality: Math.max(.25, Math.min(1.4, (.45 + (nation.training ?? 50) / 100 * .35 + (nation.morale ?? 50) / 100 * .2)
          * Math.sqrt(Math.min(1,Math.max(.25,(g.sailors??(cl.crew||50)*g.count)/Math.max(1,(cl.crew||50)*g.count)))) * (1+Math.max(0,(nation.tech?.gunnery||1)-1)*.03)*Math.max(.35,Math.min(1,supply)))),
        radar:cl.radar||(nation.tech?.radar||1)>=6,aa:(cl.aa||0)*(1+Math.max(0,(nation.tech?.radar||1)-5)*.2),
        damageControl:1+Math.max(0,(nation.tech?.damage_control||1)-1)*.06,
        torpedoes: g.torpedoesPerHull ?? cl.torpedoCapacity ?? cl.tubes ?? 0,
        aircraft: { fighter: Math.floor(fighter / g.count) + (hullIndex < fighter % g.count ? 1 : 0),
          strike: Math.floor(strike / g.count) + (hullIndex < strike % g.count ? 1 : 0) } }));
    }) });
  const isSubmarineAction = [...groupsA, ...groupsB].every(g => ['SS', 'SM'].includes(classes[g.classId].type));
  const combat = createCombat({ seed, separationKm: isSubmarineAction ? 5 : 23,
    environment: { visibilityKm: 28, seaState: 2, night: false },
    metadata: { id: 'campaign', title: 'Campaign fleet engagement', accuracy: 'Tactical game model; local encounter conditions are assumed.' },
    sides: { A: side('A', groupsA, nationA, nameA, aggressiveA,supplyA), B: side('B', groupsB, nationB, nameB, aggressiveB,supplyB) } });
  combat.campaignApplied = Object.fromEntries(combat.ships.map(ship => [ship.id, { health: ship.health, sunk: false, aircraftLost: 0 }]));
  return combat;
}
export function campaignCombatOutcomes(combat, side) {
  const rows = new Map();
  for (const ship of combat.ships.filter(s => s.side === side)) {
    let row = rows.get(ship.groupId);
    if (!row) { row = { id: ship.groupId, survivors: 0, survivorHealth: 0, sunk: 0, aircraftLost: 0, torpedoes: Infinity }; rows.set(ship.groupId, row); }
    const applied = combat.campaignApplied[ship.id];
    if (ship.status === 'sunk') { if (!applied.sunk) row.sunk++; }
    else { row.survivors++; row.survivorHealth += ship.health; row.torpedoes = Math.min(row.torpedoes, ship.torpedoes); }
    row.aircraftLost += Math.max(0, ship.aircraftLost - applied.aircraftLost);
  }
  return new Map([...rows].map(([id, row]) => [id, { ...row, health: row.survivors ? row.survivorHealth / row.survivors : 0,
    trackedAirPool: !!combat.airPools?.[side],
    torpedoes: Number.isFinite(row.torpedoes) ? row.torpedoes : 0 }]));
}
export function markCampaignCombatApplied(combat) {
  for (const ship of combat.ships) combat.campaignApplied[ship.id] = { health: ship.health, sunk: ship.status === 'sunk', aircraftLost: ship.aircraftLost };
}

export function merchantCombatGroup(convoy, nation) {
  const classId = `combat-merchant-${nation}`;
  return { group: { id: convoy.id, classId, name: 'Merchant convoy', count: convoy.count, health: 1, airWing: [] },
    shipClass: { id: classId, classId, name: 'Merchant cargo ship', type: 'AK', tons: 5000, speed: convoy.speed || 12,
      caliber: 0, barrels: 0, belt: 0, deck: 0, tubes: 0, aa: 1, nation } };
}
export function coastalBatteryGroup(port, nation, defense) {
  const classId = `combat-shore-${port}`;
  return { group: { id: classId, classId, name: 'Coastal battery', count: 1, health: Math.max(.05, defense.health || 1), airWing: [] },
    shipClass: { id: classId, classId, name: 'Coastal battery', type: 'FORT', hiddenFromScene: true,
      tons: 50000, speed: 0, caliber: defense.artillery > 800 ? 280 : 152, barrels: Math.max(0, Math.min(24, Math.ceil(defense.artillery / 100))),
      belt: 250, deck: 150, tubes: 0, aa: Math.max(0, defense.artillery * .02), gunRangeKm: defense.gunRange * 1.852, nation } };
}
export function createCampaignAirCombat(options) {
  if (!options.groupsB.length) return null;
  const dummyId = 'combat-air-origin', groupsA = [{ id: dummyId, classId: dummyId, name: 'Air strike origin', count: 1, health: 1 }];
  const combat = createCampaignCombat({ ...options, groupsA,
    classes: { ...options.classes, [dummyId]: { id: dummyId, type: 'CV', tons: 1000, speed: 0, caliber: 0, barrels: 0, tubes: 0 } } });
  combat.ships = combat.ships.filter(ship => ship.side === 'B');
  for (const ship of combat.ships) {
    ship.x = 0; ship.y = ship.index * .8; ship.stats.speed = options.anchored ? 0 : ship.stats.speed;
    // Strategic CAP is already selected from real carrier/base wings. Only that
    // reserve fights this arriving strike; do not count it again per target ship.
    ship.aircraft = { fighter: 0, strike: 0 };
  }
  const target = combat.ships.find(s => ['CV','CVL','BB','BC'].includes(s.type)) || combat.ships[0];
  combat.externalDefense = { side: 'B', cap: options.cap || 0, aa: options.flak || 0 };
  combat.externalAirLosses = 0; combat.externalCapLosses = 0; combat.externalLossesApplied = 0;
  combat.airstrikes = [{ id: `air-${options.operationId}`, side: 'A', sourceId: options.operationId, targetId: target.id,
    x: -10, y: target.y, heading: 90, planes: options.strikes, fighters: options.fighters,
    launchedPlanes: options.strikes + options.fighters, phase: 'outbound', attacks: 0, lost: 0,
    crewQuality: Math.max(.35, Math.min(1.4, options.proficiency || 1)) }];
  combat.metadata.externalAirRaid = true;
  combat.maxDurationSeconds = 900;
  combat.history.frames = [combatSnapshot(combat)];
  return combat;
}

// Another maritime strike can damage ships already fighting. Synchronize those
// external campaign changes before the next local step without charging losses
// twice or resurrecting a hull when the surface report writes its state back.
export function synchronizeCampaignCombat(combat, groupsA, groupsB) {
  for (const [side, groups] of [['A', groupsA], ['B', groupsB]]) {
    for (const group of groups) {
      const hulls = combat.ships.filter(s => s.side === side && s.groupId === group.id && s.status !== 'sunk');
      if (!hulls.length) continue;
      const absent = Math.max(0, hulls.length - group.count);
      for (const ship of hulls.slice(-absent || hulls.length)) {
        sinkCombatShip(combat, ship, 'External campaign action');
        combat.campaignApplied[ship.id].sunk = true; combat.campaignApplied[ship.id].health = 0;
      }
      const surviving = hulls.filter(s => s.status !== 'sunk');
      const average = surviving.reduce((n, s) => n + s.health, 0) / Math.max(1, surviving.length);
      if (group.health < average - 1e-8) for (const ship of surviving) {
        ship.health *= group.health / average; ship.machinery = Math.min(ship.machinery, ship.health);
        combat.campaignApplied[ship.id].health = ship.health;
      }
    }
  }
}
