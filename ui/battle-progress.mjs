import { readDocument } from "../worker/documents.mjs";
import { PROFILES } from '../mechanics/catalog.mjs';
const rules=await readDocument("common/rules/battle-stages.md");
export function battleProgress(r, now=r.minute) {
  if(r.status!=="ongoing") return r.startedAt!==undefined && r.completedAt!==undefined
    ? '<p class="panel-note">Battle duration: '+Math.round(r.completedAt-r.startedAt)+' minutes · '+r.round+' main engagement round'+(r.round===1?'':'s')+'.</p>'+battleMorale(r) : '';
  const start=r.timeline.at(-1).at, percent=Math.max(0,Math.min(100,(now-start)/Math.max(1,r.nextStageAt-start)*100));
  return '<div class="battle-progress" aria-label="Ongoing battle"><strong>ONGOING · '+rules.STAGES[r.stage]+(r.stage===3?' · round '+r.round+' / '+r.mainRounds:'')+'</strong><div class="battle-stages">'+rules.STAGES.map((name,i)=>'<span class="'+(i<r.stage?'done':i===r.stage?'active':'')+'">'+(i+1)+' '+name+'</span>').join('')+'</div><progress max="100" value="'+percent+'"></progress><small>'+Math.max(0,Math.ceil(r.nextStageAt-now))+' game minutes until the next stage · losses below are confirmed so far</small></div>';
}
function battleMorale(r) {
  if (!r.moraleChanges) return '';
  const changes=Object.entries(r.moraleChanges).filter(([,delta])=>delta!==0);
  const message=changes.length ? changes.map(([id,delta])=>PROFILES[id].name+' '+(delta>0?'+':'')+delta).join(' · ')
    : !r.significantAction?'No morale change · below significant-action thresholds'
    : !r.winner?'No morale change · inconclusive action':'No morale change · morale already at its limit';
  return '<p class="battle-morale"><strong>Morale:</strong> '+message+'.</p>';
}
