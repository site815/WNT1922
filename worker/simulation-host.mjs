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
    checkpoint = null;
  const reply = (requestId, extra = {}) => {
    if (runner?.state) checkpoint = structuredClone(runner.state);
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
      runner.advance();
      const time = now();
      if (!awaitingSnapshot && time - lastSnapshot >= 350) {
        lastSnapshot = time;
        awaitingSnapshot = true;
        reply(null);
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
    timer = schedule(loop, runner.state?.paused ? 100 : 2);
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
          runner.credit = 0;
          runner.last = now();
          reply(m.requestId, { result });
        } catch (error) {
          runner.replace(rollback);
          reply(m.requestId, { commandError: error.message });
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
