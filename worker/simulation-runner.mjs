import { advanceMinutes, BASE_SPEED } from "../mechanics/engine.mjs";
import { campaignMinutes, TICK_MINUTES } from "../mechanics/campaign-clock.mjs";
// Simulation work runs off the rendering thread. Requested wall time is a speed
// ceiling, not an unbounded catch-up queue. Every fifteen-minute simulation step runs.
export class SimulationRunner {
  constructor(content, { now = () => performance.now(), budgetMs = 10 } = {}) {
    this.content = content;
    this.now = now;
    this.budgetMs = budgetMs;
    this.state = null;
    this.credit = 0;
    this.last = now();
    this.samples = [];
    this.actual = 0;
    this.lastTickAt = this.last;
    this.lastTickActual = 0;
    this.observedSpeed = null;
  }
  replace(state) {
    this.state = state;
    this.credit = 0;
    this.last = this.now();
    this.samples = [];
    this.actual = 0;
    this.lastTickAt = this.last;
    this.lastTickActual = 0;
    this.observedSpeed = state?.speed;
  }
  delayMs() {
    if (!this.state || this.state.paused) return 1000;
    const rate = BASE_SPEED * this.state.speed / 60;
    // Avoid a 500 Hz spin while accumulating a slow/tactical tick. Keep the
    // interval below the 250 ms time-credit clamp; commands are still handled
    // immediately by the worker's message event, independent of this timer.
    return Math.max(2,Math.min(100,(TICK_MINUTES-this.credit)/Math.max(1e-9,rate)*1000));
  }
  advance() {
    const s = this.state,
      time = this.now(),
      dt = Math.max(0, (time - this.last) / 1000);
    this.last = time;
    if (!s || s.paused) {
      this.credit = 0;
      this.actual = 0;
      this.samples = [];
      this.lastTickAt = time;
      this.lastTickActual = 0;
      return 0;
    }
    if (this.observedSpeed !== s.speed) {
      this.observedSpeed = s.speed; this.lastTickAt = time; this.lastTickActual = 0;
    }
    const desired = BASE_SPEED * s.speed,
      rate = desired / 60;
    this.credit = Math.min(
      this.credit + Math.min(dt, 0.25) * rate,
      Math.max(30, rate * 0.3),
    );
    const before = campaignMinutes(s),
      deadline = this.now() + this.budgetMs;
    while (this.credit >= TICK_MINUTES - 1e-9 && this.now() < deadline && !s.paused) {
      const amount = TICK_MINUTES,
        done = advanceMinutes(s, this.content, amount, { respectPause: true });
      this.credit = Math.max(0, this.credit - done);
      if (!done) break;
    }
    if (s.paused) this.credit = 0;
    const minutes = campaignMinutes(s) - before;
    if (minutes > 0) {
      this.lastTickActual = minutes * 60000 / Math.max(1,time-this.lastTickAt);
      this.lastTickAt = time;
    }
    this.samples.push({ at: time, minutes, dt });
    while (this.samples.length > 1 && time - this.samples[0].at > 2500)
      this.samples.shift();
    const seconds = this.samples.reduce((v, x) => v + x.dt, 0);
    this.actual =
      seconds > 0
        ? (this.samples.reduce((v, x) => v + x.minutes, 0) * 60) / seconds
        : 0;
    return minutes;
  }
  metrics() {
    const target = this.state ? BASE_SPEED * this.state.speed : 0,
      slowCadence = target > 0 && TICK_MINUTES * 60 / target > 2.5,
      actual = this.state?.paused ? 0 : slowCadence ? this.lastTickActual : this.actual;
    return {
      target,
      actual,
      ratio: target ? Math.min(1, actual / target) : 1,
      // A tactical tick takes longer than the normal 2.5-second rolling window.
      // Measure between complete ticks instead of alternating 0x and 360x.
      warming: slowCadence ? this.lastTickActual === 0 : this.samples.reduce((v, x) => v + x.dt, 0) < 0.5,
      queuedMinutes: this.credit,
      stepMinutes: TICK_MINUTES,
    };
  }
}
