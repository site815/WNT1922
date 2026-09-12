import { readDocument } from "../worker/documents.mjs";
const rules=await readDocument("common/rules/battle-stages.md");
export function battleProgress(r, now=r.minute) {
  if(r.status!=="ongoing") return r.startedAt!==undefined && r.completedAt!==undefined
    ? '<p class="panel-note">Battle duration: '+Math.round(r.completedAt-r.startedAt)+' minutes · '+r.round+' main engagement round'+(r.round===1?'':'s')+'.</p>' : '';
  const start=r.timeline.at(-1).at, percent=Math.max(0,Math.min(100,(now-start)/Math.max(1,r.nextStageAt-start)*100));
  return '<div class="battle-progress" aria-label="Ongoing battle"><strong>ONGOING · '+rules.STAGES[r.stage]+(r.stage===3?' · round '+r.round+' / '+r.mainRounds:'')+'</strong><div class="battle-stages">'+rules.STAGES.map((name,i)=>'<span class="'+(i<r.stage?'done':i===r.stage?'active':'')+'">'+(i+1)+' '+name+'</span>').join('')+'</div><progress max="100" value="'+percent+'"></progress><small>'+Math.max(0,Math.ceil(r.nextStageAt-now))+' game minutes until the next stage · losses below are confirmed so far</small></div>';
}
