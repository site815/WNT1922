import { CAMPAIGN_BATTLE_RULES as rules } from '../combatmechanics/campaign-rules.mjs';
import { PROFILES } from '../mechanics/catalog.mjs';
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const duration = seconds => Math.floor(seconds/60)+' min '+Math.floor(seconds%60)+' s';
export function battleProgress(r, now=r.minute) {
  if(r.tactical) {
    const combat=r.tactical,seconds=Math.max(0,Number(combat.seconds)||0),limit=Math.max(1,Number(combat.maxDurationSeconds)||1),ongoing=r.status==='ongoing';
    const losses=['A','B'].map(side=>{
      const ships=combat.ships.filter(ship=>ship.side===side),sunk=ships.filter(ship=>ship.status==='sunk').length,escaped=ships.filter(ship=>ship.status==='escaped').length;
      return escape(PROFILES[r[side.toLowerCase()]]?.name||combat.sides?.[side]?.name||'Fleet '+side)+': '+(ships.length-sunk)+' afloat · '+sunk+' sunk'+(escaped?' · '+escaped+' disengaged':'');
    });
    return '<div class="battle-progress" aria-label="'+(ongoing?'Ongoing tactical battle':'Completed tactical battle')+'"><strong>'+(ongoing?'ONGOING':'COMPLETE')+' · '+duration(seconds)+' elapsed</strong><progress aria-label="Elapsed combat time compared with the scenario time limit" max="100" value="'+Math.min(100,seconds/limit*100)+'"></progress><small>Scenario time limit: '+duration(limit)+' · 10-second combat steps; battles may end earlier when fleets sink or disengage.</small><p>'+losses.join('<br>')+'</p>'+(combat.reason?'<small>'+escape(combat.reason)+'</small>':'')+'</div>'+(!ongoing?battleMorale(r):'');
  }
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
