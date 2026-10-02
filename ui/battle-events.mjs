import { TICK_MINUTES } from '../mechanics/campaign-clock.mjs';

const key = (side, row, hull = 0) => `${side}:${row.id}:${hull}`;
const rows = (frame, side) => frame?.['groups' + side] || [];
const alive = row => row.count - (row.sunk || 0) > 0;
const jitter = value => {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  return hash / 4294967296;
};

// These are presentation events for observed aggregate combat. A salvo stands
// for a resolved side's exchange, not an invented number of rounds fired or a
// claimed attacker/victim pairing. Health is stored per group; one hit effect
// illustrates that group's actual new damage. Sinking identities follow the
// same stable hull-index convention as battleInstances(). No simulation RNG.
export function battleVisualEvents(report, frame, index) {
  const previous = report.replay?.frames[index - 1];
  if (!previous || frame.at - previous.at !== TICK_MINUTES) return [];
  const prefix = `${report.id}:${frame.at}`;
  const events = [];
  const append = (type, targetKey, sourceKey = '', weapon = 'surface') => {
    const identity = `${prefix}:${type}:${sourceKey}:${targetKey}`;
    events.push({key:identity,type,sourceKey,targetKey,weapon,
      time:(type === 'salvo' ? .2 : type === 'hit' ? 2.2 : 4.4) + jitter(identity) * .6,
      duration:type === 'salvo' ? 1.5 : type === 'hit' ? 4 : 8});
  };
  const changed = side => rows(frame,side).filter(row => {
    const before = rows(previous,side).find(prior => prior.id === row.id);
    return before && (row.health < before.health || row.sunk > before.sunk);
  });
  // Title demonstrations explicitly contain illustrative scripted outcomes.
  // Older campaign recordings do not have exchange metadata; never fabricate
  // their firing history from a stage label alone.
  const demo = String(report.id).startsWith('title-demo-');
  const exchange = frame.exchange || (demo && ['A','B'].some(side => changed(side).length) ? {kind:'surface',sides:['A','B']} : null);
  for (const side of exchange?.sides || []) {
    const enemy = side === 'A' ? 'B' : 'A';
    const target = changed(enemy)[0] || rows(previous,enemy).find(alive);
    if (!target || !rows(frame,enemy).some(row => row.id === target.id)) continue;
    const source = exchange.kind === 'air' ? null : rows(previous,side).find(alive);
    if (!source && exchange.kind !== 'air' && exchange.kind !== 'port') continue;
    const weapon = exchange.kind === 'air' ? 'air' : !source ? 'shore' : ['SS','SM'].includes(source.type) ? 'submarine' : 'surface';
    append('salvo',key(enemy,target),source ? key(side,source) : '',weapon);
  }
  for (const side of ['A','B']) for (const row of rows(frame,side)) {
    const before = rows(previous,side).find(prior => prior.id === row.id);
    if (!before || before.count !== row.count) continue;
    if (row.health < before.health - 1e-9 && alive(before))
      append('hit',key(side,row),'',exchange?.kind === 'air' ? 'air' : 'surface');
    const first = Math.max(0,row.count - (row.sunk || 0));
    const last = Math.max(first,row.count - (before.sunk || 0));
    for (let hull = first; hull < last; hull++) append('sink',key(side,row,hull));
  }
  return events.sort((a,b) => a.time - b.time || a.key.localeCompare(b.key));
}
