import { campaignMinutes, TICK_MINUTES } from './campaign-clock.mjs';
import { fleetService } from './catalog.mjs';

export const REPLAY_FRAME_LIMIT = 128;
export const REPLAY_REPORT_LIMIT = 12;
export const REPLAY_CHARACTER_BUDGET = 750000;
export const ATTRITION_MONTHS = 24;
export const LOSS_FIELDS = ['sunk', 'damaged', 'tons', 'damagedTons', 'planesLost', 'planesRescued',
  'aviatorsLost', 'aviatorsRescued', 'sailorsLost', 'sailorsRescued', 'governmentPlanesLost', 'governmentCrewsLost'];
export const ATTRITION_FIELDS = [...LOSS_FIELDS, 'merchantHulls', 'merchantGRT', 'portDamage', 'industryDamage'];
const totals = (result, fields = LOSS_FIELDS) => Object.fromEntries(fields.map(k => [k, result?.[k] || 0]));

// Qualification uses forces that can actually take part, never a remote carrier
// merely launching a flight, nor the shore guns or merchant hulls of its target.
export function decisiveAssessment(c, order, groupsA, groupsB, sortie, rules) {
  const force = groups => groups.reduce((v, g) => {
    const cl = c.classes[g.classId];
    if (!cl || g.count <= 0 || fleetService(cl) !== 'warship') return v;
    v.tons += cl.tons * g.count;
    if (!['SS', 'SM'].includes(cl.type)) v.surfaceTons += cl.tons * g.count;
    if (rules.CAPITAL_TYPES.includes(cl.type)) v.capitals += g.count;
    return v;
  }, { tons: 0, surfaceTons: 0, capitals: 0 });
  const a = force(groupsA), b = force(groupsB);
  const strikes = (sortie?.airWing || []).filter(w => ['strike', 'bomber'].includes(w.role))
    .reduce((v, w) => v + Math.min(w.count, w.crewed), 0);
  const result = { qualifies: false, code: 'routine', reason: 'Below the decisive-action force thresholds; resolved as background attrition.',
    warshipTonsA: a.tons, warshipTonsB: b.tons, capitalShipsA: a.capitals, capitalShipsB: b.capitals, strikeAircraftA: strikes };
  if (order.kind === 'convoy' || sortie?.targetKind === 'convoy' || order.operation === 'strategic' || order.operation === 'shore') return result;
  if (order.kind === 'air') {
    if (b.capitals && strikes >= rules.MIN_STRIKE_AIRCRAFT)
      Object.assign(result, { qualifies: true, code: 'capital-air-attack',
        reason: `${strikes} crewed strike aircraft attack ${b.capitals} capital ship(s); minimum ${rules.MIN_STRIKE_AIRCRAFT} strike aircraft.` });
  } else if ((a.capitals && b.tons >= rules.MIN_OPPOSING_WARSHIP_TONS) || (b.capitals && a.tons >= rules.MIN_OPPOSING_WARSHIP_TONS)) {
    Object.assign(result, { qualifies: true, code: 'capital-action',
      reason: `BB, BC, CV or CVL involved, with at least ${rules.MIN_OPPOSING_WARSHIP_TONS.toLocaleString('en-US')} tons of opposing warships.` });
  } else if (order.kind === 'surface' && a.surfaceTons >= rules.LARGE_ACTION_SIDE_TONS && b.surfaceTons >= rules.LARGE_ACTION_SIDE_TONS && a.surfaceTons + b.surfaceTons >= rules.LARGE_ACTION_TOTAL_TONS) {
    Object.assign(result, { qualifies: true, code: 'large-surface-action',
      reason: `Large surface action: both sides at least ${rules.LARGE_ACTION_SIDE_TONS.toLocaleString('en-US')} tons and combined at least ${rules.LARGE_ACTION_TOTAL_TONS.toLocaleString('en-US')} tons of surface warships.` });
  }
  return result;
}

export const engagementReport = (s, id) => s.reports.find(r => r.id === id)
  || (s.backgroundEngagements || []).find(r => r.id === id);
export const shipInEngagement = (s, nation, group) => !!group.battleId ||
  [...(s.reports || []), ...(s.backgroundEngagements || [])].some(r => r.status === 'ongoing' &&
    [[r.a, r.resultA], [r.b, r.resultB]].some(([id, result]) => id === nation && result.conditions.some(row => row.id === group.id)));

export function recordBattleFrame(s, r, label) {
  if (!r.replay || r.replay.archived) return; // Missing chronology is never reconstructed.
  const at = campaignMinutes(s), frames = r.replay.frames, previous = frames.at(-1);
  if (previous?.at === at && previous.status === r.status && previous.stage === r.stage && previous.round === r.round) return;
  if (previous && at < previous.at + TICK_MINUTES && previous.status === r.status && previous.stage === r.stage && previous.round === r.round) return;
  const frame = { at, stage: r.stage, round: r.round, label, status: r.status,
    merchantHulls: r.merchantHulls || r.airOperation?.merchantHulls || 0,
    merchantGRT: r.merchantGRT || r.airOperation?.merchantGRT || 0, portDamage: r.portDamage || 0 };
  for (const [side, nation] of [['A', r.a], ['B', r.b]]) {
    const current = new Map(s.nations[nation].groups.map(g => [g.id, g]));
    frame['groups' + side] = r['result' + side].conditions.map(row => {
      const live = current.get(row.id);
      return { id: row.id, classId: row.classId, name: row.name, type: row.type, count: row.count,
        sunk: Math.min(row.count, Math.max(row.sunk, live ? row.count - live.count : row.sunk)),
        health: live?.health ?? row.health };
    });
    const loss = frame['losses' + side] = totals(r['result' + side]);
    frame['delta' + side] = Object.fromEntries(LOSS_FIELDS.map(k => [k, loss[k] - (previous?.['losses' + side]?.[k] || 0)]));
  }
  const sortie = s.nations[r.a].airSorties.find(op => op.id === r.order.opId);
  frame.aircraftA = (sortie?.airWing || []).map(w => ({ model: w.model, role: w.role, count: w.count, crewed: w.crewed }));
  if (frames.length >= REPLAY_FRAME_LIMIT) { frames.splice(1, 1); r.replay.truncated = true; }
  frames.push(frame);
  boundReplayArchive(s, r);
}

function boundReplayArchive(s, current) {
  const reports = s.reports.includes(current) ? s.reports : [current, ...s.reports];
  const archive = (r, reason) => { r.replay.frames = []; r.replay.archived = true; r.replay.archiveReason = reason; };
  const completed = reports.filter(r => r.replay?.frames.length && r.status !== 'ongoing');
  for (const r of completed.slice(REPLAY_REPORT_LIMIT)) archive(r, 'Older replay archived; the complete aggregate battle report is retained.');
  const size = r => JSON.stringify(r.replay?.frames || []).length;
  let total = reports.reduce((sum, r) => sum + size(r), 0);
  // Keep replay data comfortably inside the existing 8 MB save/import limit.
  // Even three-byte UTF-8 names leave the replay portion below 2.25 MB.
  for (const r of [...completed].reverse()) {
    if (total <= REPLAY_CHARACTER_BUDGET) break;
    total -= size(r); archive(r, 'Replay archived to keep the campaign save bounded; aggregate results are retained.');
  }
  for (const r of [...reports].reverse()) {
    while (total > REPLAY_CHARACTER_BUDGET && r.replay?.frames.length > 2) {
      total -= JSON.stringify(r.replay.frames[1]).length + 1;
      r.replay.frames.splice(1, 1); r.replay.truncated = true;
    }
    if (total > REPLAY_CHARACTER_BUDGET && r.replay?.frames.length) {
      total -= size(r); archive(r, 'This engagement exceeds the replay save budget; aggregate results remain available.');
    }
  }
}

const monthIndex = month => Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1;
export function pruneAttritionLedger(s) {
  const month = new Date(s.day * 86400000).toISOString().slice(0, 7);
  s.attritionLedger = (s.attritionLedger || []).filter(x => monthIndex(x.month) > monthIndex(month) - ATTRITION_MONTHS);
}
export function recordBackgroundAttrition(s, r) {
  if (r.attritionRecorded) return;
  const month = new Date(s.day * 86400000).toISOString().slice(0, 7), pair = [r.a, r.b].sort();
  const key = `${month}:${pair.join('-')}:${r.region}`;
  s.attritionLedger ??= [];
  let row = s.attritionLedger.find(x => x.key === key);
  if (!row) {
    row = { key, month, a: pair[0], b: pair[1], region: r.region, startedAt: r.startedAt, updatedAt: campaignMinutes(s), encounters: 0,
      kinds: { surface: 0, port: 0, air: 0, convoy: 0 }, sides: Object.fromEntries(pair.map(id => [id, totals(null, ATTRITION_FIELDS)])),
      merchantHulls: 0, merchantGRT: 0, portDamage: 0, industryDamage: 0 };
    s.attritionLedger.unshift(row);
  }
  row.encounters++; row.kinds[r.order.kind]++; row.updatedAt = campaignMinutes(s);
  row.startedAt = Math.min(row.startedAt, r.startedAt);
  for (const [side, id] of [['A', r.a], ['B', r.b]])
    for (const field of LOSS_FIELDS) row.sides[id][field] += r['result' + side][field] || 0;
  const extras = { merchantHulls: r.merchantHulls || r.airOperation?.merchantHulls || 0,
    merchantGRT: r.merchantGRT || r.airOperation?.merchantGRT || 0, portDamage: r.portDamage || 0, industryDamage: r.industryRaid?.damage || 0 };
  for (const [field, amount] of Object.entries(extras)) { row[field] += amount; row.sides[r.b][field] += amount; }
  const sortie = s.nations[r.a].airSorties.find(op => op.id === r.order.opId);
  if (sortie) sortie.attritionKey = key;
  r.attritionRecorded = true;
  pruneAttritionLedger(s);
}

// Recovery occurs after the minor report has been discarded. Preserve these real
// late losses in the same monthly bilateral ledger without retaining that report.
export function recordAttritionRecovery(s, op, nation, loss) {
  const row = (s.attritionLedger || []).find(x => x.key === op.attritionKey);
  if (!row) return;
  for (const [field, source] of [['planesLost', 'planes'], ['aviatorsLost', 'aviators'], ['planesRescued', 'planesRescued'],
    ['aviatorsRescued', 'aviatorsRescued'], ['governmentPlanesLost', 'governmentPlanes'], ['governmentCrewsLost', 'governmentCrews']])
    row.sides[nation][field] += loss[source] || 0;
  row.updatedAt = campaignMinutes(s);
}
