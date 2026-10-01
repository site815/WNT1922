import { PROFILES, REGIONS } from '../mechanics/catalog.mjs';
import { battleStageLabel } from '../mechanics/engagements.mjs';
import { campaignMinutes } from '../mechanics/campaign-clock.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validPosition = point => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite) && Math.abs(point[1]) <= 90;
const progress = (state,report) => {
  const now=campaignMinutes(state),duration=report.durations?.[report.stage];
  return {elapsedMinutes:Math.max(0,Math.round(now-report.startedAt)),
    stageProgress:Number.isFinite(duration)&&duration>0&&Number.isFinite(report.nextStageAt)
      ? Math.max(0,Math.min(1,1-(report.nextStageAt-now)/duration)) : 0};
};
// Do not expose the locations of foreign battles or background encounters. The
// map is a way into a player's existing report, never a second combat simulator.
export function ongoingMapBattles(state) {
  return (state.reports || []).filter(report => report.status === 'ongoing' && !report.background &&
    [report.a,report.b].includes(state.player) && validPosition(report.position)).map(report => ({
      id:String(report.id),position:[...report.position],stage:report.stage,
      ...progress(state,report),
      label:`${PROFILES[report.a]?.name || report.a} / ${PROFILES[report.b]?.name || report.b} · ${battleStageLabel(report)} · ${progress(state,report).elapsedMinutes} min`,
    }));
}
export function battleMapHover(state, id) {
  const report = state.reports?.find(row => String(row.id) === String(id) && row.status === 'ongoing' &&
    !row.background && [row.a,row.b].includes(state.player));
  if (!report) return '';
  const side = key => {
    const losses = report[`result${key}`] || {}, nation = report[key === 'A' ? 'a' : 'b'];
    const afloat = (losses.conditions || []).reduce((sum,row) => sum+Math.max(0,row.count-(row.sunk || 0)),0);
    return `<p><strong>${esc(PROFILES[nation]?.name || nation)}</strong> · ${afloat} ships afloat · ${Math.round(losses.sunk || 0)} sunk · ${Math.round(losses.planesLost || 0)} aircraft lost</p>`;
  };
  const timing=progress(state,report);
  return `<span class="eyebrow">DECISIVE BATTLE UNDERWAY</span><h3>${esc(REGIONS[report.region]?.name || report.region)}</h3>`+
    `<p>${esc(battleStageLabel(report))} · ${timing.elapsedMinutes} minutes elapsed · ${Math.round(timing.stageProgress*100)}% of current stage</p>`+
    side('A')+side('B')+`<small>Contact pauses the campaign. Resume runs at Tactical 60× while your decisive battle is ongoing. Click to pause and watch; Play battle runs continuously, or Next tick advances exactly 15 minutes.</small>`;
}
