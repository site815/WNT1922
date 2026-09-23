import { REGIONS } from './catalog.mjs';
import { ATTRITION_FIELDS, LOSS_FIELDS, REPLAY_FRAME_LIMIT, REPLAY_CHARACTER_BUDGET } from './battle-records.mjs';

export function validateBattleRecords(s, c) {
  const fail = () => { throw Error('Invalid battle replay or background attrition in save.'); };
  const plain = v => v && typeof v === 'object' && !Array.isArray(v);
  const number = (v, lo = 0, hi = 1e15) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
  const text = (v, max = 200) => typeof v === 'string' && v.length <= max;
  const minute = v => number(v, -1e9, 3e9);
  if (s.backgroundEngagements !== undefined && (!Array.isArray(s.backgroundEngagements) || s.backgroundEngagements.length > 2000)) fail();
  if (s.attritionLedger !== undefined && (!Array.isArray(s.attritionLedger) || s.attritionLedger.length > 10000)) fail();
  let replayCharacters = 0;
  const reportIds = new Set();
  for (const r of [...s.reports, ...(s.backgroundEngagements || [])]) {
    if (!plain(r)) fail();
    if (reportIds.has(r.id)) fail();
    reportIds.add(r.id);
    if (r.background !== undefined && typeof r.background !== 'boolean') fail();
    if (s.reports.includes(r) && r.background === true) fail();
    if ((s.backgroundEngagements || []).includes(r) && (r.background !== true || r.status !== 'ongoing' || r.decisive?.qualifies !== false || r.replay !== undefined)) fail();
    if (r.decisive !== undefined) {
      const d = r.decisive;
      if (!plain(d) || typeof d.qualifies !== 'boolean' || !text(d.code, 50) || !text(d.reason, 600)
        || !['warshipTonsA', 'warshipTonsB', 'capitalShipsA', 'capitalShipsB', 'strikeAircraftA'].every(k => number(d[k]))) fail();
    }
    if (r.replay === undefined) continue;
    const replay = r.replay;
    if (!plain(replay) || replay.version !== 1 || typeof replay.truncated !== 'boolean'
      || !Array.isArray(replay.frames) || replay.frames.length > REPLAY_FRAME_LIMIT
      || (replay.archived !== undefined && typeof replay.archived !== 'boolean')
      || (replay.archiveReason !== undefined && !text(replay.archiveReason, 500))) fail();
    replayCharacters += JSON.stringify(replay.frames).length;
    let previousAt = -1e9;
    for (const f of replay.frames) {
      if (!plain(f) || !minute(f.at) || f.at < previousAt || !Number.isInteger(f.stage) || !number(f.stage, 0, 5)
        || !Number.isInteger(f.round) || !number(f.round, 1, 5) || !text(f.label, 200)
        || !['ongoing', 'completed'].includes(f.status) || !['merchantHulls', 'merchantGRT', 'portDamage'].every(k => number(f[k]))) fail();
      previousAt = f.at;
      for (const [side, nation] of [['A', r.a], ['B', r.b]]) {
        const groups = f['groups' + side];
        if (!Array.isArray(groups) || groups.length > 10000) fail();
        for (const g of groups)
          if (!plain(g) || !text(g.id, 120) || !text(g.name, 180) || !text(g.type, 40) || !c.classes[g.classId]
            || c.classes[g.classId].nation !== nation || !Number.isInteger(g.count) || !number(g.count, 0, 1000000)
            || !Number.isInteger(g.sunk) || !number(g.sunk, 0, g.count) || !number(g.health, 0, 1)) fail();
        if (!plain(f['losses' + side]) || !LOSS_FIELDS.every(k => number(f['losses' + side][k]))) fail();
        if (!plain(f['delta' + side]) || !LOSS_FIELDS.every(k => number(f['delta' + side][k], -1e15))) fail();
      }
      if (!Array.isArray(f.aircraftA) || f.aircraftA.length > 250) fail();
      for (const w of f.aircraftA)
        if (!plain(w) || !text(w.model, 200) || !['fighter', 'strike', 'scout', 'bomber'].includes(w.role)
          || !Number.isInteger(w.count) || !number(w.count) || !Number.isInteger(w.crewed) || !number(w.crewed, 0, w.count)) fail();
    }
  }
  // A small allowance accounts for empty archived frame arrays in older reports.
  if (replayCharacters > REPLAY_CHARACTER_BUDGET + 4000) fail();
  const keys = new Set();
  for (const row of s.attritionLedger || []) {
    if (!plain(row) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(row.month) || !c.nations[row.a] || !c.nations[row.b]
      || row.a >= row.b || !REGIONS[row.region] || row.key !== `${row.month}:${row.a}-${row.b}:${row.region}` || keys.has(row.key)
      || !minute(row.startedAt) || !minute(row.updatedAt) || row.updatedAt < row.startedAt
      || !Number.isInteger(row.encounters) || !number(row.encounters, 1) || !plain(row.kinds)
      || !['surface', 'port', 'air', 'convoy'].every(k => Number.isInteger(row.kinds[k]) && number(row.kinds[k]))
      || Object.values(row.kinds).reduce((v, n) => v + n, 0) !== row.encounters
      || !plain(row.sides) || Object.keys(row.sides).sort().join() !== [row.a, row.b].join()
      || !['merchantHulls', 'merchantGRT', 'portDamage', 'industryDamage'].every(k => number(row[k]))) fail();
    for (const id of [row.a, row.b])
      if (!plain(row.sides[id]) || !ATTRITION_FIELDS.every(k => number(row.sides[id][k]))) fail();
    keys.add(row.key);
  }
}
