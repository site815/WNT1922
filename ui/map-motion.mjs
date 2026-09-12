import { campaignMinutes } from "../mechanics/campaign-clock.mjs";
import { fleetPosition } from "../mechanics/task-forces.mjs";
import { mapPoint, linePath, polygonPath } from "./projection.mjs";
import { coverageAt, escortCircle } from "../mechanics/convoy-coverage.mjs";
import { uiModel } from "../mechanics/queries.mjs";
import { remainingRoute } from "./command-view.mjs";

// Interpolate only between received simulation states. There is no prediction
// of unprocessed combat or enemy movement, and this clock never mutates a save.
export function visualMinute(previous, current, now) {
  if (!previous || current.state.paused || previous.state.paused)
    return campaignMinutes(current.state);
  const start = campaignMinutes(previous.state),
    end = campaignMinutes(current.state),
    span = Math.max(1, current.at - previous.at),
    fraction = Math.max(0, Math.min(1, (now - current.at) / span));
  return end < start ? end : start + (end - start) * fraction;
}
export function visualFleet(previous, current, id, minute) {
  const latest = current.forces.get(id);
  if (!latest) return null;
  const prior = previous?.forces.get(id);
  return prior && minute < latest.departAt ? prior : latest;
}
export class MapMotion {
  constructor({ root, chart, active }) {
    this.root = root;
    this.chart = chart;
    this.active = active;
    this.current = null;
    this.previous = null;
    this.frame = null;
    this.lastFrameAt = 0;
    this.frames = 0;
    this.windowFrames = 0;
    this.windowAt = 0;
    this.fps = 0;
    this.cpuMs = 0;
  }
  accept(state, at = performance.now()) {
    if (this.current?.state !== state) {
      this.previous = this.current;
      const n = state.nations[state.player];
      this.current = {
        state,
        at,
        forces: new Map([...n.fleets, ...n.convoys].map((f) => [f.id, f])),
      };
      if (
        this.previous &&
        (this.previous.state.player !== state.player ||
          this.previous.state.campaignId !== state.campaignId ||
          campaignMinutes(this.previous.state) > campaignMinutes(state))
      )
        this.previous = null;
    }
    this.refresh();
  }
  paint(now, trackFrame = false) {
    const svg = this.root.querySelector(".world-map");
    if (!svg || !this.current) return;
    const started = performance.now(),
      s = this.current.state,
      ui = this.chart(),
      minute = visualMinute(this.previous, this.current, now),
      rotation = ui.rotation || 0;
    for (const element of svg.querySelectorAll("[data-motion-id]")) {
      const f = visualFleet(
        this.previous,
        this.current,
        element.dataset.motionId,
        minute,
      );
      if (!f) {
        element.setAttribute("visibility", "hidden");
        continue;
      }
      element.removeAttribute("visibility");
      const point = mapPoint(fleetPosition(s, f, minute), rotation),
        dx = point[0] - Number(element.dataset.motionX),
        dy = point[1] - Number(element.dataset.motionY);
      element.setAttribute(
        "transform",
        "translate(" + dx.toFixed(4) + " " + dy.toFixed(4) + ")",
      );
    }
    // New orders must replace the plotted route immediately, even while markers
    // are interpolating the preceding snapshot interval.
    const selected = ui.convoyId || ui.fleetId,
      f = selected && this.current.forces.get(selected),
      route = svg.querySelector(".ordered-route");
    if (route)
      route.setAttribute(
        "d",
        f
          ? linePath(
              remainingRoute(s, f, Math.max(minute, f.departAt)),
              rotation,
            )
          : "",
      );
    {
      const position = (id) => {
        const force = visualFleet(this.previous, this.current, id, minute);
        return force && fleetPosition(s, force, minute);
      };
      const escorts = (uiModel(s)?.escortCoverage?.escorts || []).map((e) => ({
        ...e,
        position: position(e.id) || e.position,
      }));
      for (const area of svg.querySelectorAll("[data-escort-area]")) {
        const e = escorts.find((e) => e.id === area.dataset.escortArea);
        if (e)
          area.setAttribute(
            "d",
            polygonPath([escortCircle(e.position)], rotation),
          );
      }
      for (const marker of svg.querySelectorAll(".convoy-marker")) {
        const ring = marker.querySelector(".convoy-cover-ring"),
          point = position(marker.dataset.motionId);
        if (ring && point) {
          const covered = coverageAt(escorts, point).defense > 0;
          ring.classList.toggle("covered", covered);
          ring.classList.toggle("exposed", !covered);
        }
      }
    }
    if (trackFrame) {
      this.frames++;
      this.windowFrames++;
    }
    if (!this.windowAt) this.windowAt = now;
    if (now - this.windowAt >= 1000) {
      this.fps = (this.windowFrames * 1000) / (now - this.windowAt);
      this.windowFrames = 0;
      this.windowAt = now;
    }
    this.cpuMs = performance.now() - started;
    svg.dataset.motionFrames = this.frames;
    svg.dataset.motionFps = this.fps.toFixed(1);
    svg.dataset.motionCpuMs = this.cpuMs.toFixed(2);
  }
  refresh() {
    const active = this.current && this.active() && !document.hidden;
    if (!active) {
      if (this.frame !== null) cancelAnimationFrame(this.frame);
      this.frame = null;
      return;
    }
    this.paint(performance.now());
    if (!this.current.state.paused && this.frame === null)
      this.frame = requestAnimationFrame((now) => this.animate(now));
    else if (this.current.state.paused && this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }
  animate(now) {
    this.frame = null;
    if (
      !this.current ||
      this.current.state.paused ||
      !this.active() ||
      document.hidden
    )
      return;
    if (now - this.lastFrameAt >= 1000 / 60 - 0.5) {
      this.paint(now, true);
      this.lastFrameAt = now;
    }
    this.frame = requestAnimationFrame((time) => this.animate(time));
  }
}
