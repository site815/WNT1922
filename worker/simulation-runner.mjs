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
  }
  replace(state) {
    this.state = state;
    this.credit = 0;
    this.last = this.now();
    this.samples = [];
    this.actual = 0;
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
      return 0;
    }
    const desired = BASE_SPEED * s.speed,
      rate = desired / 60;
    this.credit = Math.min(
      this.credit + Math.min(dt, 0.25) * rate,
      Math.max(30, rate * 0.3),
    );
    const before = campaignMinutes(s),
      deadline = this.now() + this.budgetMs;
    while (this.credit >= TICK_MINUTES && this.now() < deadline && !s.paused) {
      const amount = TICK_MINUTES,
        done = advanceMinutes(s, this.content, amount, { respectPause: true });
      this.credit = Math.max(0, this.credit - done);
      if (!done) break;
    }
    if (s.paused) this.credit = 0;
    const minutes = campaignMinutes(s) - before;
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
      actual = this.state?.paused ? 0 : this.actual;
    return {
      target,
      actual,
      ratio: target ? Math.min(1, actual / target) : 1,
      warming: this.samples.reduce((v, x) => v + x.dt, 0) < 0.5,
      queuedMinutes: this.credit,
      stepMinutes: TICK_MINUTES,
    };
  }
}
