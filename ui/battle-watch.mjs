import { PROFILES, REGIONS, TYPES } from '../mechanics/catalog.mjs';
import { voxelModelFor } from './voxel-models.mjs';
import { drawVoxelShip } from './voxel-renderer.mjs';
export { BattleScene3D as BattleWatchScene } from './battle-scene3d.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = value => Math.round(Number(value) || 0).toLocaleString('en-US');
const iso = (x, y) => [(x - y) * .866, (x + y) * .5];
const groups = (report, side) => report['result' + side]?.conditions || [];

export function watchFrame(report, index = null) {
  const frames = report.replay?.frames || [];
  if (frames.length) {
    const position = index == null || !Number.isFinite(index) ? frames.length - 1 : Math.max(0, Math.min(frames.length - 1, Math.floor(index)));
    return { frame: frames[position], index: position, count: frames.length, recorded: true };
  }
  return { frame: { at: report.completedAt ?? report.minute, stage: report.stage ?? 4, round: report.round || 1,
    label: 'After-action summary', status: report.status, groupsA: groups(report, 'A'), groupsB: groups(report, 'B'),
    lossesA: report.resultA, lossesB: report.resultB }, index: 0, count: 0, recorded: false };
}

// Every rendered instance corresponds to one hull in the recorded group. Hull
// indices are display identities: the simulation stores shared group condition.
export function battleInstances(frame, startedAt = frame.at) {
  const result = [];
  const elapsed = Math.max(0, (frame.at || 0) - (startedAt || 0));
  const separation = frame.stage >= 4 ? 1250 : Math.max(780, 2600 - elapsed * 9);
  for (const side of ['A', 'B']) {
    const rows = frame['groups' + side] || [];
    const total = rows.reduce((sum, row) => sum + row.count, 0);
    const columns = Math.max(1, Math.ceil(Math.sqrt(total) * .55));
    const lines = Math.max(1, Math.ceil(total / columns));
    let slot = 0;
    for (const row of rows) for (let hullIndex = 0; hullIndex < row.count; hullIndex++, slot++) {
      const sign = side === 'A' ? -1 : 1;
      const x = sign * (separation / 2 + Math.floor(slot / lines) * 370);
      const y = (slot % lines - (lines - 1) / 2) * 140;
      const point = iso(x, y);
      result.push({ ...row, side, hullIndex, key: `${side}:${row.id}:${hullIndex}`,
        sunkHull: hullIndex >= Math.max(0, row.count - (row.sunk || 0)), point, heading: side === 'A' ? 0 : Math.PI });
    }
  }
  return result;
}

function lossText(row = {}) {
  return `${num(row.sunk)} ships · ${num(row.planesLost)} aircraft · ${num(row.sailorsLost)} sailors · ${num(row.aviatorsLost)} aviators lost`;
}
const signed = value => (Number(value) > 0 ? '+' : '') + num(value);
function lossChangeText(row = {}) {
  return `${signed(row.sunk)} ships · ${signed(row.planesLost)} aircraft · ${signed(row.sailorsLost)} sailors · ${signed(row.aviatorsLost)} aviators`;
}
const airGroups = frame => (frame.aircraftA || []).filter(wing => wing.count > 0);
function aircraftRoster(frame) {
  const wings = airGroups(frame), count = wings.reduce((total, wing) => total + wing.count, 0), crewed = wings.reduce((total, wing) => total + wing.crewed, 0);
  return `<p class="panel-note">Recorded air wing: ${num(count)} aircraft · ${num(crewed)} crewed. Aircraft positions are illustrative.</p>${wings.length ? `<ul class="battle-air-roster">${wings.map(wing => `<li><span>${esc(wing.model.replaceAll('_',' '))} · ${esc(wing.role)}</span><strong>${num(wing.count)} aircraft · ${num(wing.crewed)} crewed</strong></li>`).join('')}</ul>` : '<p class="panel-note">No air-wing groups recorded at this tick.</p>'}`;
}
function sideLedger(frame, side, recorded) {
  const total = frame['losses' + side] || {}, delta = frame['delta' + side] || {};
  return `<span>Total losses: ${lossText(total)}</span><small>${num(total.tons)} naval tons sunk · surviving damaged ships: ${num(total.damaged)} hulls · ${num(total.damagedTons)} equivalent tons</small>${recorded ? `<small>Net loss change this tick: ${lossChangeText(delta)}</small><small>Surviving damage change: ${signed(delta.damaged)} hulls · ${signed(delta.damagedTons)} equivalent tons. This can fall when damaged ships sink.</small>` : ''}<small>${num(total.sailorsRescued)} sailors / ${num(total.aviatorsRescued)} aviators rescued · ${num(total.planesRescued)} aircraft salvaged</small>`;
}

export function battleWatchView(report, campaign, { frameIndex = null, selected = null, busy = false } = {}) {
  const { frame, index, count, recorded } = watchFrame(report, frameIndex);
  const atEdge = index >= count - 1;
  const canAdvance = recorded && (index < count - 1 || report.status === 'ongoing');
  const sideGroups = side => frame['groups' + side] || [];
  const selectedGroup = selected && sideGroups(selected.side).find(row => row.id === selected.id && row.count > 0);
  const hull = selectedGroup ? Math.max(0, Math.min(Math.floor(selected.hullIndex || 0), selectedGroup.count - 1)) : 0;
  const sunk = selectedGroup && hull >= selectedGroup.count - (selectedGroup.sunk || 0);
  return `<section class="battle-watch" data-report="${report.id}">
    <div class="battle-watch-heading"><div><span class="eyebrow">${atEdge && report.status === 'ongoing' ? 'LIVE · CAMPAIGN PAUSED' : recorded ? 'RECORDED BATTLE' : 'SUMMARY ONLY'}</span><h3>${esc(frame.label)}${frame.stage === 3 ? ' · round ' + num(frame.round) : ''}</h3></div><strong>+${num(Math.max(0, frame.at - report.startedAt))} min${count ? ` · ${index + 1} / ${count}` : ''}</strong></div>
    <p class="battle-qualification">${esc(report.decisive?.reason || 'Recorded naval action.')}</p>
    <div class="battle-watch-controls">
      <button data-action="battle-first" ${!recorded || index === 0 || busy ? 'disabled' : ''}>↤ Start</button>
      <button data-action="battle-previous" ${!recorded || index === 0 || busy ? 'disabled' : ''}>Previous</button>
      <button class="primary" data-action="battle-next" ${!canAdvance || busy ? 'disabled' : ''}>${busy ? 'Advancing…' : atEdge && report.status === 'ongoing' ? 'Next tick · 15 min' : 'Next recorded tick →'}</button>
      <button data-action="battle-latest" ${!recorded || atEdge || busy ? 'disabled' : ''}>Latest</button>
      <button data-action="battle-fit">Fit fleets</button>
      <button data-action="battle-report" data-id="${report.id}">Full report</button>
    </div>
    <p class="battle-watch-note">${recorded ? 'Next tick at the live edge advances the whole campaign by 15 minutes. Closing leaves the campaign paused.' : 'This older action has no retained tick recording; only its confirmed outcome is shown.'} ${report.replay?.truncated ? 'Some intermediate frames are no longer retained.' : ''}</p>
    <div class="battle-stage" data-key="battle-stage-${report.id}" data-preserve="true"><canvas class="battle-canvas" tabindex="0" role="img" aria-label="3D battle view. Click a ship to inspect its recorded condition; scroll to zoom, drag to pan, right-drag or Shift-drag to orbit."></canvas></div>
    <div class="battle-watch-legend"><span>Wheel: zoom · Drag: pan · Right / Shift-drag: orbit · Click: inspect</span><span>Illustrated formations · recorded losses</span></div>
    <div class="battle-side-ledger">${['A','B'].map(side => `<div><strong style="color:${PROFILES[report[side === 'A' ? 'a' : 'b']]?.color}">${esc(PROFILES[report[side === 'A' ? 'a' : 'b']]?.name)}</strong>${sideLedger(frame,side,recorded)}</div>`).join('')}</div>
    ${selectedGroup ? `<section class="battle-ship-inspection"><div><span class="eyebrow">${esc(TYPES[selectedGroup.type] || selectedGroup.type)} · ${selected.side === 'A' ? esc(PROFILES[report.a]?.name) : esc(PROFILES[report.b]?.name)}</span><h3>${esc(selectedGroup.name)}${selectedGroup.count > 1 ? ' · hull ' + (hull + 1) + ' / ' + selectedGroup.count : ''}</h3></div><strong class="${sunk ? 'sunk' : ''}">${sunk ? 'SUNK' : num((1 - selectedGroup.health) * 100) + '% damage'}</strong>${selectedGroup.count > 1 ? `<p>Condition is shared by this ship group. ${num(selectedGroup.count - selectedGroup.sunk)} hulls remain afloat.</p><div><button data-action="battle-hull-previous" ${hull === 0 ? 'disabled' : ''}>Previous hull</button><button data-action="battle-hull-next" ${hull >= selectedGroup.count - 1 ? 'disabled' : ''}>Next hull</button></div>` : ''}</section>` : '<p class="panel-note">Select a ship in the scene or the roster below to inspect its condition at this recorded tick.</p>'}
    <div class="battle-rosters">${['A','B'].map(side => `<section><h4>${esc(PROFILES[report[side === 'A' ? 'a' : 'b']]?.name)} · ${side === 'A' && report.airOperation ? 'air wing' : 'ships'}</h4>${sideGroups(side).map(row => `<button data-action="battle-select" data-side="${side}" data-group="${esc(row.id)}" class="${selected?.side === side && selected?.id === row.id ? 'selected' : ''}"><span>${esc(row.name)}</span><span>${num(row.count - row.sunk)} / ${num(row.count)} afloat · ${num((1 - row.health) * 100)}% damage</span></button>`).join('') || (side === 'A' && report.airOperation ? recorded ? aircraftRoster(frame) : '<p class="panel-note">No per-tick aircraft roster was retained for this older action. See the full report for its aggregate outcome.</p>' : '<p class="panel-note">Shore defenses / no ships recorded</p>')}</section>`).join('')}</div>
  </section>`;
}

export function attritionView(state) {
  const rows = (state.attritionLedger || []).filter(row => [row.a, row.b].includes(state.player)).slice().sort((a, b) => b.updatedAt - a.updatedAt);
  const active = (state.backgroundEngagements || []).filter(row => [row.a, row.b].includes(state.player)).length;
  const details = row => `${lossText(row)}<small>${num(row.tons)} naval tons sunk · ${num(row.damagedTons)} damage-equivalent tons across actions</small><small>${num(row.sailorsRescued)} sailors / ${num(row.aviatorsRescued)} aviators rescued · ${num(row.planesRescued)} aircraft salvaged</small>${row.portDamage || row.industryDamage ? `<small>Cumulative damage points: ${num((row.portDamage || 0) * 100)} port · ${num((row.industryDamage || 0) * 100)} industry</small>` : ''}`;
  const entries = rows.map(row => {
    const enemy = row.a === state.player ? row.b : row.a, own = row.sides[state.player] || {}, other = row.sides[enemy] || {};
    return `<tr><td><strong>${esc(row.month)} · ${esc(PROFILES[enemy]?.name)}</strong><small>${esc(REGIONS[row.region]?.name || row.region)}</small></td><td>${num(row.encounters)}<small>${Object.entries(row.kinds || {}).filter(([, n]) => n).map(([kind, n]) => num(n) + ' ' + esc(kind)).join(' · ')}</small></td><td>${details(own)}</td><td>${details(other)}<small>${num(other.merchantHulls)} merchants / ${num(other.merchantGRT)} GRT lost</small></td><td>${num(own.merchantHulls)} hulls<small>${num(own.merchantGRT)} GRT</small></td></tr>`;
  }).join('');
  return `<section class="panel attrition-panel"><div class="view-heading"><div><span class="eyebrow">ROUTINE ACTIONS</span><h2>Background attrition</h2></div><span>${num(active)} actions resolving</span></div><p>Minor encounters still consume ammunition and cause real ship, merchant, aircraft and personnel losses. Completed actions are grouped by month, opposing navy and region; the last 24 months are retained. Damage totals sum the outcomes of actions and can include repeated damage; infrastructure points are cumulative, not current facility condition.</p>${rows.length ? `<div class="attrition-table-wrap"><table><thead><tr><th>Month / opponent / region</th><th>Actions</th><th>Your naval losses</th><th>Opposing naval losses</th><th>Your merchant losses</th></tr></thead><tbody>${entries}</tbody></table></div>` : '<p class="panel-note">No completed minor actions have been recorded yet.</p>'}</section>`;
}

export class LegacyBattleWatchScene {
  constructor({ root, onSelect }) {
    this.root = root; this.onSelect = onSelect; this.zoom = 1; this.pan = [0, 0]; this.hits = []; this.frame = null;
  }
  clear() { cancelAnimationFrame(this.raf); this.raf = null; this.canvas = null; this.report = null; this.frame = null; this.previous = null; this.drag = null; this.hits = []; this.view = null; }
  refresh(report, campaign, frameIndex = null, selected = null) {
    const canvas = this.root.querySelector('.battle-canvas');
    if (!canvas || !report) { this.clear(); return; }
    const current = watchFrame(report, frameIndex);
    const changed = this.report?.id !== report.id || this.frameIndex !== current.index ||
      ['at','stage','round','status'].some(key => this.frame?.[key] !== current.frame[key]);
    if (this.report?.id !== report.id) { this.zoom = 1; this.pan = [0, 0]; this.previous = null; }
    else if (changed) this.previous = this.frame;
    this.report = report; this.campaign = campaign; this.frame = current.frame; this.frameIndex = current.index; this.selected = selected;
    if (this.canvas !== canvas) { this.canvas = canvas; this.bind(canvas); }
    if (changed) this.started = performance.now();
    this.draw(performance.now());
  }
  fit() { this.zoom = 1; this.pan = [0, 0]; this.draw(performance.now()); }
  focus(side, id, hullIndex = 0) {
    const unit = battleInstances(this.frame, this.report.startedAt).find(u => u.side === side && u.id === id && u.hullIndex === hullIndex);
    if (!unit || !this.view) return;
    this.zoom = Math.max(2.5, this.zoom);
    this.pan = [-(unit.point[0] - this.view.cx) * this.view.scale * this.zoom, -(unit.point[1] - this.view.cy) * this.view.scale * this.zoom];
    this.draw(performance.now());
  }
  bind(canvas) {
    canvas.addEventListener('wheel', event => {
      event.preventDefault(); const old = this.zoom, next = Math.max(.6, Math.min(12, old * (event.deltaY < 0 ? 1.2 : 1 / 1.2)));
      const r = canvas.getBoundingClientRect(), point = [event.clientX - r.left - r.width / 2, event.clientY - r.top - r.height / 2];
      this.pan = point.map((p, i) => p - (p - this.pan[i]) * next / old); this.zoom = next; this.draw(performance.now());
    }, { passive: false });
    canvas.addEventListener('pointerdown', event => {
      if (event.button) return; canvas.setPointerCapture(event.pointerId); this.drag = {x: event.clientX, y: event.clientY, pan: [...this.pan], moved: false};
    });
    canvas.addEventListener('pointermove', event => {
      if (this.drag) {
        const dx = event.clientX - this.drag.x, dy = event.clientY - this.drag.y;
        if (Math.hypot(dx, dy) > 4) this.drag.moved = true;
        if (this.drag.moved) { this.pan = [this.drag.pan[0] + dx, this.drag.pan[1] + dy]; this.draw(performance.now()); }
      }
      const r = canvas.getBoundingClientRect(); canvas.style.cursor = this.hit(event.clientX - r.left, event.clientY - r.top) ? 'pointer' : 'grab';
    });
    canvas.addEventListener('pointerup', event => {
      if (!this.drag) return;
      if (!this.drag.moved) { const r = canvas.getBoundingClientRect(), unit = this.hit(event.clientX - r.left, event.clientY - r.top); if (unit) this.onSelect({side: unit.side, id: unit.id, hullIndex: unit.hullIndex}); }
      this.drag = null; if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointercancel', () => { this.drag = null; });
    canvas.addEventListener('keydown', event => { if (event.key === 'Home') {event.preventDefault(); this.fit();} });
  }
  hit(x, y) { return this.hits.findLast(h => x >= h.box.x - 5 && y >= h.box.y - 5 && x <= h.box.x + h.box.width + 5 && y <= h.box.y + h.box.height + 5)?.unit; }
  draw(now) {
    cancelAnimationFrame(this.raf); this.raf = null;
    const canvas = this.canvas; if (!canvas?.isConnected || !this.frame) return;
    const rect = canvas.getBoundingClientRect(), width = rect.width, height = rect.height, dpr = Math.min(2, devicePixelRatio || 1);
    if (!width || !height) return;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gradient = ctx.createLinearGradient(0, 0, width, height); gradient.addColorStop(0, '#16333c'); gradient.addColorStop(1, '#254956'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#8cc4c20d'; ctx.lineWidth = 1;
    for (let x = -height * 2; x < width + height * 2; x += 52) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + height * 1.73, height); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - height * 1.73, height); ctx.stroke(); }
    const units = battleInstances(this.frame, this.report.startedAt);
    const original = battleInstances(watchFrame(this.report, 0).frame, this.report.startedAt);
    const points = original.length ? original.map(u => u.point) : [[-1000, -400], [1000, 400]];
    const left = Math.min(...points.map(p => p[0])) - 260, right = Math.max(...points.map(p => p[0])) + 260;
    const top = Math.min(...points.map(p => p[1])) - 200, bottom = Math.max(...points.map(p => p[1])) + 200;
    this.view = {cx: (left + right) / 2, cy: (top + bottom) / 2, scale: Math.min((width - 80) / (right - left), (height - 65) / (bottom - top))};
    const scale = this.view.scale * this.zoom;
    const progress = Math.min(1, Math.max(0, (now - (this.started || 0)) / 950));
    const prior = this.previous && new Map(battleInstances(this.previous, this.report.startedAt).map(u => [u.key, u]));
    const positions = new Map(); this.hits = [];
    for (const unit of units.sort((a, b) => a.point[1] - b.point[1])) {
      const before = prior?.get(unit.key), t = 1 - (1 - progress) ** 3;
      const point = before ? unit.point.map((p, i) => before.point[i] + (p - before.point[i]) * t) : unit.point;
      const x = width / 2 + this.pan[0] + (point[0] - this.view.cx) * scale;
      const y = height / 2 + this.pan[1] + (point[1] - this.view.cy) * scale;
      positions.set(unit.key, [x, y]);
      const model = voxelModelFor(unit.classId, {campaign: this.campaign, type: unit.type});
      const span = Math.max(model.dimensions.length, model.dimensions.beam, 150) * scale;
      if (x < -span || x > width + span || y < -span || y > height + span) continue;
      const selected = this.selected?.side === unit.side && this.selected.id === unit.id && (this.selected.hullIndex || 0) === unit.hullIndex;
      const justSunk = unit.sunkHull && before && !before.sunkHull;
      if (span < 5) {
        ctx.fillStyle = unit.sunkHull ? '#718088' : PROFILES[this.report[unit.side === 'A' ? 'a' : 'b']]?.color || '#ddd'; ctx.fillRect(x - 2, y - 1, 4, 2);
        this.hits.push({unit, box: {x: x - 3, y: y - 3, width: 6, height: 6}}); continue;
      }
      const box = drawVoxelShip(ctx, model, {x, y: y + (justSunk ? 14 * progress : 0), scale, heading: unit.heading, selected, alpha: unit.sunkHull ? justSunk ? 1 - progress * .76 : .24 : 1});
      this.hits.push({unit, box});
      if (!unit.sunkHull && unit.health < .9) {
        ctx.fillStyle = '#25303899'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + i * 3, y - 7 - i * 6, 3 + i * 2, 0, Math.PI * 2); ctx.fill(); }
      }
      if (selected || scale > .45) { ctx.fillStyle = '#ecf1de'; ctx.font = selected ? 'bold 12px sans-serif' : '10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(unit.name + (unit.count > 1 ? ' #' + (unit.hullIndex + 1) : ''), x, y + Math.max(14, model.dimensions.beam * scale)); }
    }
    if (progress < 1 && prior) for (const unit of units) {
      const before = prior.get(unit.key), target = positions.get(unit.key);
      if (!before || !target || !(unit.health < before.health || unit.sunkHull && !before.sunkHull)) continue;
      // Group damage is recorded; the resolver does not identify an individual
      // shooter or projectile. Mark the impact without inventing a firing ship.
      if (progress > .5) {ctx.strokeStyle = '#f6b26a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(target[0], target[1], 4 + progress * 12, 0, Math.PI * 2); ctx.stroke();}
    }
    ctx.textAlign = 'left'; ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = '#d7e6df'; ctx.fillText(PROFILES[this.report.a]?.name || this.report.a, 16, 24); ctx.textAlign = 'right'; ctx.fillText(PROFILES[this.report.b]?.name || this.report.b, width - 16, 24);
    if (this.report.airOperation) {
      const wings = airGroups(this.frame), count = wings.reduce((total, wing) => total + wing.count, 0);
      ctx.textAlign = 'left'; ctx.font = '12px sans-serif'; ctx.fillStyle = '#e9cc85';
      ctx.fillText(wings.length ? `${num(count)} recorded aircraft · wing markers, illustrative positions` : 'No air-wing groups recorded at this tick', 16, height - 15);
      for (let i = 0; i < Math.min(8,wings.length); i++) {
        const x = 30 + i * 30, y = height - 43, strike = ['strike','bomber'].includes(wings[i].role);
        ctx.fillStyle = strike ? '#e9cc85' : '#bddcd6'; ctx.beginPath();
        [[0,-11],[2,-3],[11,1],[11,4],[2,2],[2,8],[5,10],[5,12],[0,10],[-5,12],[-5,10],[-2,8],[-2,2],[-11,4],[-11,1],[-2,-3]].forEach(([dx,dy],j) => j ? ctx.lineTo(x+dx,y+dy) : ctx.moveTo(x+dx,y+dy));
        ctx.closePath(); ctx.fill();
      }
    }
    if (this.report.portId) {ctx.textAlign = 'right'; ctx.font = '12px sans-serif'; ctx.fillStyle = '#cfb99d'; ctx.fillText('Shore action · ' + this.report.portId.replaceAll('_', ' '), width - 16, height - 15);}
    canvas.dataset.hullCount = String(units.length); canvas.dataset.frameAt = String(this.frame.at); canvas.dataset.frameIndex = String(this.frameIndex); canvas.dataset.visibleHulls = String(this.hits.length);
    if (progress < 1) this.raf = requestAnimationFrame(t => this.draw(t));
  }
}
