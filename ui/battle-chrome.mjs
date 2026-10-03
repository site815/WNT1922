import {soundPreferences} from './sound.mjs';

// Campaign reports and standalone battles share the same sound controls and
// visual vocabulary. Their clocks stay separate (campaign ticks vs playback).
export function battleAudioControls(context = 'tactical') {
  const audio = soundPreferences(), standalone = context === 'tactical';
  return `<div class="battle-audio-controls tactical-audio-controls"><label class="tactical-checkbox"><input type="checkbox" ${standalone?'data-tactical-sfx':'data-report-sfx'} ${audio.enabled?'checked':''}> SFX</label><label>Volume <input ${standalone?'data-tactical-volume':'data-report-volume'} type="range" min="0" max="100" step="5" value="${Math.round(audio.volume*100)}" aria-label="Battle sound volume"></label></div>`;
}

export function battleReportTabs(report, active) {
  const id=Number(report.id), recorded=!!report.replay?.frames?.length;
  return `<nav class="battle-report-tabs" aria-label="Battle report sections"><button data-action="report-summary" data-id="${id}" ${active==='summary'?'aria-current="page" class="current"':''}>After-action report</button><button data-action="watch-battle" data-id="${id}" ${active==='watch'?'aria-current="page" class="current"':''} ${recorded?'':'disabled title="No recording was retained for this battle"'}>3D battle viewer</button></nav>`;
}
