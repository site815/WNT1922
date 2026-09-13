import { readDocument } from '../worker/documents.mjs';
import { isHomeEconomicRegion } from './domestic-economy.mjs';
const rules = await readDocument('common/rules/campaign-impact.md');
export const MORALE = rules.MORALE;
export const SIGNIFICANCE = rules.SIGNIFICANCE;
export const SCORE_NAVAL_TONS_PER_POINT = rules.SCORE_NAVAL_TONS_PER_POINT;
export const navalWarScore = n => Math.round(n.sunkTons/SCORE_NAVAL_TONS_PER_POINT);
export const dailyMoraleRecovery = n => (MORALE.recoveryTarget-n.morale)*MORALE.dailyRecovery;
export function changeMorale(n,delta) {
  const previous = n.morale;
  n.morale = Math.max(MORALE.floor,Math.min(MORALE.ceiling,previous+delta));
  return n.morale-previous;
}
export function battleSignificance(r) {
  const a=r.resultA,b=r.resultB;
  const thresholds = [
    ['naval tonnage sunk',(a.tons||0)+(b.tons||0),SIGNIFICANCE.navalSunkTons],
    ['damage to surviving warships',(a.damagedTons||0)+(b.damagedTons||0),SIGNIFICANCE.navalDamageTons],
    ['aircraft destroyed',(a.planesLost||0)+(b.planesLost||0),SIGNIFICANCE.aircraftLost],
    ['merchant tonnage sunk',r.merchantGRT||r.airOperation?.merchantGRT||0,SIGNIFICANCE.merchantGRT]
  ];
  const reasons = thresholds.filter(([,value,minimum])=>value>=minimum).map(([label])=>label);
  return {significant:reasons.length>0,reasons};
}
export function applyBattleMorale(s,r) {
  const assessment = battleSignificance(r);
  r.significantAction = assessment.significant;
  r.significanceReasons = assessment.reasons;
  r.moraleChanges = Object.fromEntries([r.a,r.b].map(id=>[id,
    r.winner && assessment.significant ? changeMorale(s.nations[id],id===r.winner?MORALE.victory:MORALE.defeat) : 0
  ]));
}
export function applyTerritoryMorale(s,changes) {
  const effects = new Map();
  for (const {territory,previous,owner} of changes) {
    if (previous===owner || s.relations[[previous,owner].sort().join('-')]?.allied) continue;
    const home = isHomeEconomicRegion(territory);
    for (const [id,delta] of [[owner,home?MORALE.homeGain:MORALE.territoryGain],
      [previous,home?MORALE.homeLoss:MORALE.territoryLoss]]) {
      if (!s.nations[id]) continue;
      const before = effects.get(id)||0;
      if (Math.abs(delta)>Math.abs(before)) effects.set(id,delta);
    }
  }
  return Object.fromEntries([...effects].map(([id,delta])=>[id,changeMorale(s.nations[id],delta)]));
}
