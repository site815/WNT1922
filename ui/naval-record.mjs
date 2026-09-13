import { facts, panel, table, esc, num, pct } from './ledger-view.mjs';
import { campaignScores, fleetSummary, supportSummary, REVIEW_YEARS, supply } from '../mechanics/engine.mjs';
import { PROFILES } from '../mechanics/catalog.mjs';
import { SCORE_NAVAL_TONS_PER_POINT } from '../mechanics/campaign-impact.mjs';
import { warBalances } from '../mechanics/war-balance.mjs';
import { casualtyView } from './ministry-view.mjs';
import { aircraftSummary } from '../mechanics/naval-resources.mjs';
import { sailorSummary } from '../mechanics/ship-staffing.mjs';
import { capitalClock } from '../mechanics/campaign-clock.mjs';
export function navalRecordView(s,c) {
  const n=s.nations[s.player], scores=campaignScores(s,c), air=aircraftSummary(s,c), crew=sailorSummary(s,c),
    current=n.groups.filter(g=>g.count && ['active','reserve','repair','returning'].includes(g.status));
  const count=status=>current.filter(g=>g.status===status).reduce((v,g)=>v+g.count,0);
  const damaged=current.filter(g=>g.health<1), damageTons=damaged.reduce((v,g)=>v+c.classes[g.classId].tons*g.count*(1-g.health),0);
  const readiness=panel('Fleet & air establishment',facts([
    ['Active / reserve hulls',num(count('active'))+' / '+num(count('reserve'))],
    ['Returning / repairing hulls',num(count('returning'))+' / '+num(count('repair'))],
    ['Damaged hulls / damage equivalent',num(damaged.reduce((v,g)=>v+g.count,0))+' / '+num(damageTons)+' t','Current displacement × missing condition; not cumulative damage inflicted. Includes AO support hulls.'],
    ['Task forces',num(n.fleets.length)],['Training / morale',pct(n.training/100)+' / '+pct(n.morale/100)],['Average fleet supply',pct(supply(s,c,s.player))],
    ['Sailors total / unassigned',num(crew.total)+' / '+num(crew.balance)],['Ships waiting for full crews',num(crew.waiting)],
    ['Naval aircraft / reserves',num(air.total)+' / '+num(air.reserve)],['Embarked / ashore / in transit',num(air.assigned)+' / '+num(air.stationed)+' / '+num(air.transit)],
    ['Aviators total / surplus',num(n.aviators)+' / '+num(air.aviatorBalance)],['Aircraft without full crews',num(air.uncrewed)]
  ]));
  const campaign=panel('Campaign deliveries & results',facts([
    ['Warships / AO commissioned',num(n.delivered)+' / '+num(n.supportDelivered)],['Civilian hulls built',num(n.civilianShipping.delivered)],
    ['Engagements won / lost',num(n.battlesWon)+' / '+num(n.battlesLost),'Descriptive counts only. Minor actions do not change morale and victory counts add no score.'],
    ['Enemy naval tonnage sunk',num(n.sunkTons)+' t'],['Own naval tonnage lost',num(n.lostTons)+' t'],
    ['Enemy merchant hulls / GRT sunk',num(n.merchantSunk)+' / '+num(n.merchantSunkGRT)],['Own merchant hulls / GRT lost',num(n.merchantLost)+' / '+num(n.merchantLostGRT)],
    ['Strategic spent · operations / production',num(n.strategicSpent.operations)+' / '+num(n.strategicSpent.production)],
    ['Government aircraft retired',num(n.governmentRetired),'Automatic retirement is separate from combat losses.'],
    ['Custom ship / aircraft designs',num(n.customDesigns.length)+' / '+num(n.customAircraft?.length)]
  ]));
  const losses=panel('Naval losses & recovery',casualtyView(n)+
    '<h3>Other-service air losses</h3>'+facts([
      ['Government aircraft lost',num(n.governmentLosses.planes)],['Government aircrew lost / rescued',num(n.governmentLosses.crews)+' / '+num(n.governmentLosses.rescued),'Government service casualties are kept separate from naval aviators.']
    ])+(n.recoveryQueue.length?'<h3>Scheduled returns</h3>'+table(['Due','Resource','Returning'],[...n.recoveryQueue].sort((a,b)=>a.readyAt-b.readyAt).map(r=>[esc(capitalClock(s,s.player,r.readyAt).date),esc(r.type),num(r.count)])):'<small>No personnel or airframes awaiting recovery.</small>'));
  const ranks=panel('Live naval standings',table(['Rank / nation','Score','Fleet','Economy','Readiness','Tonnage score','Warships / AO','Fleet tons'],scores.map((r,index)=>{
    const a=fleetSummary(s,c,r.id),support=supportSummary(s,c,r.id);
    return ['<span style="color:'+PROFILES[r.id].color+'">'+(index+1)+'. '+esc(PROFILES[r.id].name)+(r.id===s.player?' · yours':'')+'</span>',num(r.score),
      '<span title="150 × clamp(current effective naval power ÷ opening power, 0, 3)">'+num(r.strength)+'</span>',
      '<span title="2 × logistics percent + 30 × naval industry upgrades (level − 1)">'+num(r.economy)+'</span>',
      '<span title="0.8 × (training percent + morale percent + average supply percent)">'+num(r.readiness)+'</span>',
      '<span title="Enemy naval tons sunk ÷ '+num(SCORE_NAVAL_TONS_PER_POINT)+'; rounded, with no victory-count bonus.">'+num(r.war)+'</span>',
      num(a.total)+' / '+num(support.total),num(a.tons)];
  })));
  const wars=warBalances(s);
  const war=panel('Current wars · loss balance',wars.length?table(['Opponent','Assessment','Enemy / own sunk tons','Damage inflicted / received','Merchant GRT sunk / lost','Land balance'],wars.map(w=>[
    esc(w.name),esc(w.result),num(w.own.sunk)+' / '+num(w.enemy.sunk),num(w.own.damage)+' / '+num(w.enemy.damage),num(w.own.merchantGRT)+' / '+num(w.enemy.merchantGRT),num(w.land)
  ]))+'<small title="Each side values enemy tonnage sunk + 35% damage-equivalent + 15% merchant GRT, then adds land progress. This comparison is distinct from campaign score.">Hover for war-balance calculation. Records persist when old battle reports leave the recent list.</small>':'<p>No current wars.</p>');
  const next=REVIEW_YEARS.find(year=>!s.reviews.some(r=>r.year===year));
  const reviews=panel('Archived campaign reviews',s.reviews.length?table(['Year',...scores.map(r=>PROFILES[r.id].name)],s.reviews.map(r=>[r.year,...scores.map(p=>num(r.scores.find(q=>q.id===p.id)?.score))])):'<small>No archived reviews yet.</small>');
  return '<p class="record-intro">Campaign totals since opening · '+(next?'Next review: 31 December '+next:'All scheduled reviews archived')+'</p><div class="ledger-layout record-ledger">'+readiness+campaign+losses+'<div class="ledger-wide">'+ranks+war+reviews+'</div></div>';
}
