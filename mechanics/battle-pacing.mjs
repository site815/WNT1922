// Battle pacing is session presentation, not a coarser combat timestep. Never
// discover contact by scanning snapshots: load/command replacement must not
// repeatedly pause an action the player has explicitly chosen to resume.
export const BATTLE_SPEED = 0.006; // 60x: one campaign minute per real second.
export function ownDecisiveBattles(state) {
  return (state?.reports || []).filter(report => report.status === 'ongoing' && !report.background &&
    report.decisive?.qualifies === true && [report.a, report.b].includes(state.player));
}
export function constrainBattleSpeed(state) {
  if (ownDecisiveBattles(state).length) state.speed = BATTLE_SPEED;
}
export function pauseForNewBattle(state, report) {
  if (report.status !== 'ongoing' || report.background || report.decisive?.qualifies !== true ||
    ![report.a, report.b].includes(state.player)) return;
  state.paused = true;
  state.speed = BATTLE_SPEED;
  // A previous dispatch cannot later resume a battle or a manual pause on the
  // player's behalf. Watch remains an optional alert, not an automatic modal.
  delete state.resumeAfterDecision;
}
