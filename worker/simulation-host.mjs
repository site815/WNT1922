import { SimulationRunner } from "./simulation-runner.mjs";
import { applyCommand } from "../mechanics/game-actions.mjs";
import { buildView } from "../mechanics/queries.mjs";
export function simulationHost({
  content,
  send,
  now = () => performance.now(),
  schedule = setTimeout,
  cancel = clearTimeout,
  projectSnapshots = true,
}) {
  let runner = null,
    generation = 0,
    timer = null,
    lastSnapshot = 0,
    stopped = false,
    awaitingSnapshot = false,
    checkpoint = null,
    dirty = false,
    lastHeartbeat = 0;
  const reply = (requestId, extra = {}) => {
    if (runner?.state) checkpoint = structuredClone(runner.state);
    dirty = false;
    lastSnapshot = lastHeartbeat = now();
    send({
      type: "state",
      requestId,
      generation,
      state: runner?.state || null,
      view: (typeof projectSnapshots === 'function' ? projectSnapshots() : projectSnapshots) && runner?.state ? buildView(runner.state, runner.content) : null,
      metrics: runner?.metrics(),
      ...extra,
    });
  };
  function loop() {
    timer = null;
    if (stopped || !runner) return;
    try {
      const wasPaused = runner.state?.paused;
      dirty = runner.advance() > 0 || runner.state?.paused !== wasPaused || dirty;
      const time = now();
      if (dirty && !awaitingSnapshot && time - lastSnapshot >= 350) {
        awaitingSnapshot = true;
        reply(null);
      } else if (!awaitingSnapshot && time - lastHeartbeat >= 1000) {
        // Paused/low-speed campaigns often have no new simulation tick. A tiny
        // liveness message keeps the watchdog satisfied without cloning the
        // full save, rebuilding read models, repainting menus or resending 3D.
        // An unacknowledged snapshot may mean the display worker is hung;
        // do not let a bypass heartbeat mask that from the UI watchdog.
        lastHeartbeat = time;
        send({type:'heartbeat', generation, metrics:runner.metrics()});
      }
    } catch (error) {
      if (checkpoint) runner.replace(structuredClone(checkpoint));
      runner.state.paused = true;
      runner.credit = 0;
      awaitingSnapshot = true;
      reply(null, {
        error:
          "Simulation paused safely at the last checkpoint: " + error.message,
      });
    }
    timer = schedule(loop, runner.delayMs());
  }
  function receive(m) {
    try {
      if (m.type === "ack") {
        awaitingSnapshot = false;
        return;
      }
      if (m.type === "initialize") {
        if (timer) cancel(timer);
        runner = new SimulationRunner(content, { now });
        generation = m.generation;
        runner.replace(m.state);
        stopped = false;
        awaitingSnapshot = false;
        lastSnapshot = now();
        reply(m.requestId);
        timer = schedule(loop, 2);
      } else if (m.type === "command") {
        const rollback = structuredClone(runner.state);
        try {
          const result = applyCommand(runner.state, runner.content, m.command);
          runner.replace(runner.state);
          reply(m.requestId, { result });
        } catch (error) {
          runner.replace(rollback);
          reply(m.requestId, { commandError: error.message });
        }
        // Resuming must not wait for the previous paused one-second heartbeat.
        // There is always one owned timer, even during rapid speed/pause orders.
        if (!stopped) {
          if (timer) cancel(timer);
          timer = schedule(loop,runner.delayMs());
        }
      } else if (m.type === "snapshot") reply(m.requestId);
      else if (m.type === "stop") {
        stopped = true;
        if (timer) cancel(timer);
        timer = null;
        reply(m.requestId);
      } else throw Error("Unknown worker message.");
    } catch (error) {
      if (runner?.state) runner.state.paused = true;
      send({
        type: "failure",
        generation,
        requestId: m.requestId,
        error: error.message,
      });
    }
  }
  return {
    receive,
    stop() {
      stopped = true;
      if (timer) cancel(timer);
    },
  };
}
