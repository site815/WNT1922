import {createCombat, advanceCombat, combatSnapshot, combatSummary} from '../combatmechanics/index.mjs';

export const tacticalRunning = combat => !!combat && ['active','running','ongoing'].includes(combat.status);

// One isolated combat and one cancellable timer. Neither live watching nor
// quick resolution owns a campaign client, save store or campaign RNG.
export class TacticalSession {
  constructor({onChange = () => {}, onError = () => {}, advance = advanceCombat, create = createCombat,
    now = () => performance.now(), schedule = (fn, ms) => setTimeout(fn, ms), cancel = id => clearTimeout(id)} = {}) {
    Object.assign(this, {onChange,onError,advance,create,now,schedule,cancel});
    this.speed = 60; this.paused = true; this.quick = false; this.generation = 0;
  }
  start(config) {
    this.pause(false); this.config = structuredClone(config); this.combat = this.create(structuredClone(config));
    this.replaySeconds = null;
    this.emit(0); return this.combat;
  }
  emit(fromSeconds = this.currentSeconds(), details = {}) {
    this.onChange({combat:this.combat, fromSeconds, paused:this.paused, quick:this.quick, speed:this.speed, replaySeconds:this.replaySeconds,...details});
  }
  pause(notify = true) {
    this.generation++; this.cancel(this.timer); this.timer = null; this.paused = true; this.quick = false;
    if (notify && this.combat) this.emit();
  }
  step() {
    this.pause(false);
    if (!this.canAdvance()) {this.emit(); return;}
    const from = this.currentSeconds(); this.advanceClock(); this.emit(from);
  }
  currentSeconds() {return this.replaySeconds ?? this.combat?.seconds ?? 0;}
  canAdvance() {return this.replaySeconds != null ? this.replaySeconds < this.combat.seconds : tacticalRunning(this.combat);}
  advanceClock() {
    if (this.replaySeconds != null) this.replaySeconds = Math.min(this.combat.seconds,this.replaySeconds+10);
    else this.advance(this.combat,10);
  }
  play() {
    if (!this.canAdvance() || !this.paused) return;
    this.paused = false; this.quick = false; const token = ++this.generation;
    this.emit();
    const tick = () => {
      if (token !== this.generation || this.paused) return;
      try {
        const from = this.currentSeconds(); this.advanceClock();
        if (!this.canAdvance()) this.paused = true;
        this.emit(from);
        if (!this.paused) this.timer = this.schedule(tick,10000 / this.speed);
      } catch (error) {this.pause(); this.onError(error);}
    };
    this.timer = this.schedule(tick,10000 / this.speed);
  }
  setSpeed(speed) {
    if (this.quick || ![10,30,60,120].includes(Number(speed))) return;
    const resume = !this.paused && !this.quick;
    this.pause(false); this.speed = Number(speed); this.emit(); if (resume) this.play();
  }
  quickResolve() {
    if (this.replaySeconds != null || !tacticalRunning(this.combat)) return;
    this.pause(false); this.paused = false; this.quick = true; const token = ++this.generation;
    this.emit();
    const batch = () => {
      if (token !== this.generation || this.paused) return;
      try {
        const start = this.now(), from = this.combat.seconds;
        // Yield at most every eight physics steps and normally within 12 ms.
        // Pausing, leaving or restarting invalidates every outstanding batch.
        for (let i = 0; i < 8 && tacticalRunning(this.combat); i++) {
          this.advance(this.combat,10); if (this.now() - start >= 12) break;
        }
        if (!tacticalRunning(this.combat)) {this.paused = true; this.quick = false;}
        // The final batch is still a quick-resolution jump even after quick
        // turns off. It must not produce an accumulated blast of battle audio.
        this.emit(from,{silent:true});
        if (!this.paused) this.timer = this.schedule(batch,0);
      } catch (error) {this.pause(); this.onError(error);}
    };
    this.timer = this.schedule(batch,0);
  }
  restart() {if (this.config) return this.start(this.config);}
  replay() {
    if (!this.combat?.history?.frames?.length) return;
    this.pause(false); this.replaySeconds = this.combat.history.frames[0].seconds; this.emit(this.replaySeconds);
  }
  stopReplay() {this.pause(false);this.replaySeconds=null;this.emit();}
  snapshot() {
    if (!this.combat) return null;
    if (this.replaySeconds != null) {
      const frames=this.combat.history.frames;
      return frames.findLast(frame=>frame.seconds<=this.replaySeconds) || frames[0];
    }
    return combatSnapshot(this.combat);
  }
  summary() {return this.combat ? combatSummary(this.combat) : null;}
  destroy() {this.pause(false); this.combat = null; this.config = null; this.onChange = () => {};}
}
