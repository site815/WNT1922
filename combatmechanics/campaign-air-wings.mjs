// Physical aircraft remain in the campaign's established sortie inventory while
// reserved by a tactical action. This prevents replenishment and double launches.
export function reserveTacticalAirWings(s, report) {
  const combat = report.tactical;
  if (!combat || combat.metadata.externalAirRaid || combat.airPools) return;
  combat.airPools = {};
  for (const [side, nation, enemy, fleetId, targetId] of [['A', report.a, report.b, report.fleetA, report.fleetB], ['B', report.b, report.a, report.fleetB, report.fleetA]]) {
    const n = s.nations[nation], groupIds = new Set(combat.ships.filter(ship => ship.side === side).map(ship => ship.groupId));
    const wings = [];
    for (const group of n.groups.filter(g => groupIds.has(g.id))) for (const wing of group.airWing || []) {
      if (!['fighter', 'strike', 'bomber'].includes(wing.role)) continue;
      const count = Math.min(wing.count, wing.crewed || 0);
      if (!count) continue;
      wings.push({ ...wing, count, crewed: count, homeGroup: group.id });
      wing.count -= count; wing.crewed -= count;
    }
    for (const group of n.groups.filter(g => groupIds.has(g.id))) group.airWing = (group.airWing || []).filter(w => w.count > 0);
    if (!wings.length) continue;
    const op = { id: `tactical-air-${report.id}-${side}`, tacticalCombat: report.id, fleetId: fleetId || null, sourcePort: null,
      targetNation: enemy, targetKind: 'fleet', targetId: targetId || `tactical-${report.id}`, phase: 'engaging',
      startedAt: report.startedAt, readyAt: report.startedAt, assembly: 0, rangeKm: 420, outboundKm: 0, cruise: 300,
      position: [...report.position], targetPosition: [...report.position], reportId: report.id, airWing: wings,
      strikes: wings.filter(w => w.role !== 'fighter').reduce((n,w)=>n+w.count,0),
      escorts: wings.filter(w => w.role === 'fighter').reduce((n,w)=>n+w.count,0) };
    n.airSorties.push(op); combat.airPools[side] = { nation, id: op.id, lossesApplied: 0 };
  }
}
export function tacticalAirPool(s, combat, side) {
  const pool = combat.airPools?.[side];
  return pool ? s.nations[pool.nation].airSorties.find(op => op.id === pool.id) : null;
}
export function finishTacticalAirWings(s, c, report) {
  const combat = report.tactical;
  if (!combat?.airPools) return;
  for (const side of ['A', 'B']) {
    const op = tacticalAirPool(s, combat, side);
    if (!op) continue;
    const nation = side === 'A' ? report.a : report.b, groups = s.nations[nation].groups;
    const desired = new Map();
    for (const ship of combat.ships.filter(ship => ship.side === side && ship.status !== 'sunk')) {
      const row = desired.get(ship.groupId) || { fighter: 0, strike: 0 };
      row.fighter += ship.aircraft.fighter; row.strike += ship.aircraft.strike; desired.set(ship.groupId, row);
    }
    for (const [groupId, counts] of desired) {
      const group = groups.find(g => g.id === groupId && g.count > 0); if (!group) continue;
      for (const role of ['fighter', 'strike']) {
        let remaining = counts[role];
        const candidates = op.airWing.filter(w => role === 'strike' ? ['strike','bomber'].includes(w.role) : w.role === role)
          .sort((a,b)=>Number(b.homeGroup===groupId)-Number(a.homeGroup===groupId));
        for (const wing of candidates) {
          const room = (c.classes[group.classId].air + c.classes[group.classId].scoutAircraft) * group.count - group.airWing.reduce((n,w)=>n+w.count,0);
          const count = Math.min(remaining, wing.count, Math.max(0,room)); if (!count) continue;
          let target = group.airWing.find(w => w.model === wing.model && w.role === wing.role);
          if (!target) { target={model:wing.model,role:wing.role,count:0,crewed:0};group.airWing.push(target); }
          target.count += count; target.crewed += count; wing.count -= count; wing.crewed -= count; remaining -= count;
        }
      }
    }
    op.airWing = op.airWing.filter(w => w.count > 0);
    if (op.airWing.length) {
      // A time-limited encounter can end with flights still airborne. Existing
      // campaign recovery handles their actual diversion/ditching, never a free refill.
      delete op.tacticalCombat; op.phase='returning'; op.readyAt=report.completedAt+15;
    } else s.nations[nation].airSorties=s.nations[nation].airSorties.filter(x=>x.id!==op.id);
  }
}
