import { PROFILES, REGIONS, TYPES } from '../mechanics/catalog.mjs';
import { NATIVE_ART_LEGEND, nativeArtNotice } from './native-art-status.mjs';
import { tacticalPoseAt, tacticalSceneSnapshot } from './tactical-scene-packet.mjs';
import {battleAudioControls} from './battle-chrome.mjs';
import {nativeFPSLabel} from './native-performance.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = value => Math.round(Number(value) || 0).toLocaleString('en-US');
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
      const positionMetres = [x, y, 0];
      result.push({ ...row, side, hullIndex, key: `${side}:${row.id}:${hullIndex}`,
        sunkHull: hullIndex >= Math.max(0, row.count - (row.sunk || 0)), positionMetres, heading: side === 'A' ? 0 : Math.PI });
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

export function battleWatchView(report, campaign, { frameIndex = null, selected = null, busy = false, paused = true, movie = null, reducedMotion = false } = {}) {
  const { frame, index, count, recorded } = watchFrame(report, frameIndex);
  const atEdge = index >= count - 1;
  const canAdvance = recorded && (index < count - 1 || report.status === 'ongoing');
  const sideGroups = side => frame['groups' + side] || [];
  const selectedGroup = selected && sideGroups(selected.side).find(row => row.id === selected.id && row.count > 0);
  const hull = selectedGroup ? Math.max(0, Math.min(Math.floor(selected.hullIndex || 0), selectedGroup.count - 1)) : 0;
  const tactical=!!report.tactical?.ships?.length;
  const currentOnly=tactical&&!report.tactical.history?.frames?.length;
  const selectedHull=tactical&&selectedGroup?tacticalPoseAt(currentOnly?[tacticalSceneSnapshot(report.tactical)]:report.tactical.history.frames,
    currentOnly?report.tactical.seconds:frame.tacticalSeconds??report.tactical.seconds,
    `${selected.side}:${selected.id}:${hull}`,'ships',report.tactical.history?.sampledIntervalSeconds):null;
  const selectedHealth=selectedHull?.health??selectedGroup?.health;
  const sunk = selectedHull?selectedHull.status==='sunk':selectedGroup && hull >= selectedGroup.count - (selectedGroup.sunk || 0);
  return `<section class="battle-watch" data-report="${report.id}" ${movie ? `data-movie-key="${esc(movie.key)}" data-movie-paused="${movie.paused}"` : ''}>
    <div class="battle-watch-scene">
    <div class="battle-watch-heading"><div><span class="eyebrow">${movie ? 'RECORDED MOVIE · CAMPAIGN PAUSED' : atEdge && report.status === 'ongoing' ? paused ? 'LIVE · CAMPAIGN PAUSED' : 'LIVE · TACTICAL 60×' : recorded ? 'RECORDED BATTLE' : 'SUMMARY ONLY'}</span><h3>${esc(frame.label)}${frame.stage === 3 && !/\bround\s+\d/i.test(frame.label || '') ? ' · round ' + num(frame.round) : ''}</h3></div><strong>+${num(Math.max(0, frame.at - report.startedAt))} min${count ? ` · ${index + 1} / ${count}` : ''}</strong></div>
    <div class="battle-watch-controls">
      ${count>1&&!currentOnly ? `<button class="primary" data-action="battle-movie" ${busy||reducedMotion ? 'disabled' : ''} title="Watch retained exchanges in a short movie without advancing the campaign">${movie ? 'Restart movie' : 'Play recorded movie'}</button>` : ''}
      ${movie ? `<button data-action="battle-movie-toggle" ${movie.ended?'disabled':''}>${movie.paused?'Resume movie':'Pause movie'}</button><button data-action="battle-movie-stop">Return to ticks</button><span data-movie-progress role="status">${Math.floor(movie.elapsedSeconds)} / ${Math.round(movie.plan.durationSeconds)} s${movie.ended?' · finished':''}</span>` : ''}
      ${!movie && recorded && atEdge && report.status === 'ongoing' ? `<button class="primary" data-action="battle-play" ${busy ? 'disabled' : ''}>${paused ? 'Play battle · 60×' : 'Pause battle'}</button>` : ''}
      <button data-action="battle-first" ${!recorded || index === 0 || busy ? 'disabled' : ''}>↤ Start</button>
      <button data-action="battle-previous" ${!recorded || index === 0 || busy ? 'disabled' : ''}>Previous</button>
      <button class="primary" data-action="battle-next" ${!canAdvance || busy ? 'disabled' : ''}>${busy ? 'Advancing…' : atEdge && report.status === 'ongoing' ? 'Next tick · 15 min' : 'Next recorded tick →'}</button>
      <button data-action="battle-latest" ${!recorded || atEdge || busy ? 'disabled' : ''}>Latest</button>
      <button data-action="battle-fit">Fit fleets</button>
      <span class="native-fps" data-native-fps aria-label="Rendered frames per second">${nativeFPSLabel()}</span>${battleAudioControls('report')}
    </div>
    <div class="battle-stage" data-key="battle-stage-${report.id}" data-preserve="true"><canvas class="battle-canvas" tabindex="0" role="img" aria-label="3D battle view. Left-click a ship to inspect its recorded condition; wheel to zoom, middle-drag to pan, right-drag to orbit."></canvas></div>
    <div class="battle-watch-legend"><span>Wheel: zoom · Middle-drag: pan · Right-drag: orbit · Left-click: inspect</span><span>${tactical?'Simulated courses, salvos and damage · 10-second combat steps':'Illustrated formations and salvos · recorded damage and losses'}</span></div>
    </div>
    <aside class="battle-watch-information" data-scroll-key="battle-information" aria-label="Battle details, losses and ship roster">
    ${currentOnly?'<p class="battle-qualification">Detailed history exceeded the recording limit. The 3D scene and individual hull inspection show the latest tactical positions only; tick ledgers retain their dated totals.</p>':''}
    <p class="battle-qualification">${esc(report.decisive?.reason || 'Recorded naval action.')}</p>
    <p class="battle-watch-note">${tactical?'Ships follow the shared tactical simulation: movement, individual hull damage, attacks and losses are recorded. The movie compresses retained observations into 30–90 seconds; the cinematic camera follows real attacks. Play battle runs the campaign at Tactical 60×. Next tick advances one complete 15-minute campaign tick containing 90 combat steps. Watching a recorded movie and closing this viewer leave the campaign paused.':recorded ? 'Play recorded movie compresses retained observations into 20–90 seconds and keeps the campaign paused. Courses and salvo paths illustrate aggregate exchanges; condition and losses follow the recorded groups. It is a visual account, not a tactical reconstruction. Play battle runs the whole campaign at Tactical 60×; Next tick advances one complete 15-minute tick and pauses. Closing leaves the campaign paused.' : 'This older action has no retained tick recording; only its confirmed outcome is shown.'} ${movie?.plan.partial ? 'This movie ends at the latest retained observation; the battle is still ongoing.' : ''} ${report.replay?.truncated||movie?.plan.gapCount||report.tactical?.history?.truncated ? 'Missing intervals are cut without inferred attacks; losses first seen after a gap appear without invented sinking timing.' : ''} ${report.tacticalArchived?'The detailed tactical recording has left the bounded archive; this view retains the aggregate report.':''} ${movie?.plan.omittedVisualEvents ? 'Some effects are omitted to keep this large recording bounded; every recorded hull and loss remains in the roster.' : ''} ${reducedMotion ? 'Reduced motion is enabled; use the recorded tick controls for static views.' : ''}</p>
    <p class="panel-note battle-art-legend">${NATIVE_ART_LEGEND}</p>
    <div class="battle-side-ledger">${['A','B'].map(side => `<div><strong style="color:${PROFILES[report[side === 'A' ? 'a' : 'b']]?.color}">${esc(PROFILES[report[side === 'A' ? 'a' : 'b']]?.name)}</strong>${sideLedger(frame,side,recorded)}</div>`).join('')}</div>
    ${selectedGroup ? `<section class="battle-ship-inspection"><div><span class="eyebrow">${esc(TYPES[selectedGroup.type] || selectedGroup.type)} · ${selected.side === 'A' ? esc(PROFILES[report.a]?.name) : esc(PROFILES[report.b]?.name)}</span><h3>${esc(selectedGroup.name)}${selectedGroup.count > 1 ? ' · hull ' + (hull + 1) + ' / ' + selectedGroup.count : ''}</h3></div><strong class="${sunk ? 'sunk' : ''}">${sunk ? 'SUNK' : num((1 - selectedHealth) * 100) + '% damage'}</strong>${nativeArtNotice(selected)}${selectedHull ? `<p>Machinery ${num(selectedHull.machinery * 100)}% · Fire control ${num(selectedHull.fireControl * 100)}% · Fire ${num(selectedHull.fire * 100)}% · Flooding ${num(selectedHull.flooding * 100)}%</p><p>${num(selectedHull.speed)} kn · Course ${num(selectedHull.heading)}° · ${num(selectedHull.ammunition)} shells / ${num(selectedHull.torpedoes)} torpedoes remaining</p>` : ""}${selectedGroup.count > 1 ? `<p>${selectedHull ? "Condition belongs to this individual hull." : "Condition is shared by this ship group."} ${num(selectedGroup.count - selectedGroup.sunk)} hulls remain afloat.</p><div><button data-action="battle-hull-previous" ${hull === 0 ? 'disabled' : ''}>Previous hull</button><button data-action="battle-hull-next" ${hull >= selectedGroup.count - 1 ? 'disabled' : ''}>Next hull</button></div>` : ''}</section>` : '<p class="panel-note">Select a ship or navigation symbol in the scene, or a name in the roster, to inspect its condition at this recorded tick.</p>'}
    <div class="battle-rosters">${['A','B'].map(side => `<section><h4>${esc(PROFILES[report[side === 'A' ? 'a' : 'b']]?.name)} · ${side === 'A' && report.airOperation ? 'air wing' : 'ships'}</h4>${sideGroups(side).map(row => `<button data-action="battle-select" data-side="${side}" data-group="${esc(row.id)}" class="${selected?.side === side && selected?.id === row.id ? 'selected' : ''}"><span>${esc(row.name)}</span><span>${num(row.count - row.sunk)} / ${num(row.count)} afloat · ${num((1 - row.health) * 100)}% damage</span></button>`).join('') || (side === 'A' && report.airOperation ? recorded ? aircraftRoster(frame) : '<p class="panel-note">No per-tick aircraft roster was retained for this older action. See the full report for its aggregate outcome.</p>' : '<p class="panel-note">Shore defenses / no ships recorded</p>')}</section>`).join('')}</div>
    </aside>
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
