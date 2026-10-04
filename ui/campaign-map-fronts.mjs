import { frontPosition, POWERS } from '../mechanics/land-war.mjs';

const point = value => Array.isArray(value) && value.length === 2 && value.every(Number.isFinite);
const active = front => Number.isFinite(front.progress) && front.progress > 0 && front.progress < 1
  && point(front.from) && point(front.to);
const record = front => ({
  id: front.id, name: front.name, position: frontPosition(front),
  from: [...front.from], to: [...front.to], progress: front.progress,
  territories: [...new Set((front.territories || []).filter(id => typeof id === 'string'))],
  attacker: front.attacker, defender: front.defender, island: !!front.island,
  color: POWERS[front.attacker]?.color || '#b9aa83',
  restoredColor: front.restoredOwner ? POWERS[front.restoredOwner]?.color : undefined,
  status: front.status || 'Contested',
  representation: front.island ? 'campaign-assault-outline' : 'campaign-progress-line',
  accuracy: 'Strategic campaign progress within the recorded territories; not individual troop positions.',
});

export function campaignMapFronts(state) {
  return (state.world?.fronts || []).filter(front => active(front) && front.status !== 'Ceasefire').map(record);
}

// A ceasefire hides fighting, not ground already occupied. Completed campaigns
// use the existing full territory ownership; partial advances retain their exact
// saved corridor/progress rather than being animated on a separate visual clock.
export function campaignMapOccupations(state) {
  return (state.world?.fronts || []).filter(active).map(record);
}
