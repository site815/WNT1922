// Stable hull identities for native fleet and merchant formations.
export function hullLabel(group, hullIndex) {
  return group.shipNames?.[hullIndex] || (group.count === 1 ? group.name : `${group.name} · hull ${hullIndex + 1}`);
}

// There is no tactical-position data in the strategic simulation. A fixed
// review formation displays every surviving hull, without pretending that these
// offsets are an authoritative battle track. No random numbers or ship caps.
export function fleetHullInstances(groups, fleetId) {
  const rows = groups.filter(g => g.fleetId === fleetId && g.count > 0 &&
    !['sunk', 'scrapped', 'building'].includes(g.status));
  const total = rows.reduce((n, g) => n + Math.max(0, Math.floor(g.count)), 0);
  const columns = Math.max(1, Math.ceil(Math.sqrt(total * .7)));
  const instances = [];
  let index = 0;
  for (const group of rows) {
    for (let hullIndex = 0; hullIndex < Math.floor(group.count); hullIndex++, index++) {
      const row = Math.floor(index / columns), column = index % columns;
      const inRow = Math.min(columns, total - row * columns);
      instances.push({ key: `${group.id}:${hullIndex}`, groupId: group.id,
        classId: group.classId, hullIndex, group, label: hullLabel(group, hullIndex),
        offset: [(column - (inRow - 1) / 2) * 2.75,
          (row - (Math.ceil(total / columns) - 1) / 2) * 1.7] });
    }
  }
  return instances;
}

// Contact markers use only the player's observation list. Enemy groups are
// deliberately absent from this model, even when close enough to draw a hull.
export function ownFleetScene(state) {
  const navy = state?.nations?.[state.player];
  if (!navy) return [];
  return (navy.fleets || []).map(fleet => ({ fleet,
    hulls: fleetHullInstances(navy.groups || [], fleet.id) })).filter(row => row.hulls.length);
}
