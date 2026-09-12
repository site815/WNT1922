// No UI state is committed while an older simulation snapshot can overwrite it.
export class SimulationClient {
  constructor({
    createWorker = () =>
      new Worker(new URL("../worker/simulation-worker.mjs", import.meta.url), {
        type: "module",
      }),
    onState = () => {},
    onError = () => {},
    createViewWorker = typeof Worker === 'function' ? () =>
      new Worker(new URL('../worker/view-worker.mjs',import.meta.url), {type:'module'}) : null,
  } = {}) {
    this.createWorker = createWorker;
    this.onState = onState;
    this.onError = onError;
    this.createViewWorker = createViewWorker;
    this.viewWorker = null;
    this.worker = null;
    this.pending = new Map();
    this.nextId = 1;
    this.generation = 0;
    this.chain = Promise.resolve();
    this.current = null;
    this.watchdog = null;
    this.lastReceive = 0;
  }
  fail(message) {
    clearInterval(this.watchdog);
    this.watchdog = null;
    this.worker?.terminate();
    this.viewWorker?.terminate();
    this.viewWorker = null;
    this.worker = null;
    for (const p of this.pending.values()) {
      clearTimeout(p.timeout);
      p.reject(new Error(message));
    }
    this.pending.clear();
    if (this.current) this.current.paused = true;
    try {
      this.onError(
        message +
          " The last received state is preserved. Resume restarts the simulation.",
      );
    } catch {
      /* A display failure must not restart the worker. */
    }
  }
  request(type, extra = {}) {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error("The simulation is paused. Resume to restart it."));
        return;
      }
      const requestId = this.nextId++;
      const timeout = setTimeout(
        () => this.fail("Simulation worker stopped responding."),
        8000,
      );
      this.pending.set(requestId, { resolve, reject, timeout });
      try {
        this.worker.postMessage({
          type,
          requestId,
          generation: this.generation,
          ...extra,
        });
      } catch (error) {
        this.fail(error.message);
      }
    });
  }
  async start(content, state) {
    clearInterval(this.watchdog);
    if (this.worker) this.worker.terminate();
    this.viewWorker?.terminate();
    this.viewWorker = null;
    for (const p of this.pending.values()) {
      clearTimeout(p.timeout);
      p.reject(new Error("Campaign replaced."));
    }
    this.pending.clear();
    this.generation++;
    this.current = state;
    this.worker = this.createWorker();
    const worker = this.worker;
    this.lastReceive = Date.now();
    const receive = (event) => {
      if (this.worker !== worker) return;
      this.lastReceive = Date.now();
      const m = event.data,
        p = this.pending.get(m.requestId);
      if (m.generation !== this.generation) return;
      try {
        if (m.type === 'failure' && !m.state) {
          this.fail(m.error || 'Worker failed.');
          return;
        }
        if (
          m.generation === this.generation &&
          m.state &&
          m.wasPaused === undefined
        ) {
          this.current = m.state;
          this.onState(m.state, m.metrics, m.view);
        }
        if (m.error) this.onError(m.error);
        if (p) {
          clearTimeout(p.timeout);
          this.pending.delete(m.requestId);
          if (m.type === "failure" || m.commandError)
            p.reject(new Error(m.commandError || m.error));
          else p.resolve(m);
        }
      } catch (error) {
        this.fail("The command interface stopped updating: " + error.message);
      } finally {
        if (m.requestId === null) this.worker?.postMessage({ type: "ack" });
      }
    };
    this.worker.onmessage = receive;
    if (this.createViewWorker) {
      this.viewWorker = this.createViewWorker();
      this.viewWorker.onmessage = receive;
      this.viewWorker.onerror = error => this.fail('Display worker stopped: '+(error.message || 'unknown error'));
      const channel = new MessageChannel();
      this.viewWorker.postMessage({port:channel.port2},[channel.port2]);
      this.worker.postMessage({type:'connect-view',port:channel.port1},[channel.port1]);
    }
    this.worker.onerror = (error) =>
      this.fail(
        "Simulation worker stopped: " +
          (error.message || "unknown worker error"),
      );
    this.watchdog = setInterval(() => {
      if (Date.now() - this.lastReceive > 8000)
        this.fail("Simulation worker stopped responding.");
    }, 1000);
    this.watchdog.unref?.();
    return this.request("initialize", { state });
  }
  dispatch(command) {
    const result = this.chain.then(() => this.request("command", { command }));
    this.chain = result.catch(() => {});
    return result;
  }
  async snapshot() {
    await this.chain;
    const result = await this.request("snapshot");
    return result.state;
  }
  async stop() {
    await this.chain;
    clearInterval(this.watchdog);
    this.watchdog = null;
    if (!this.worker) return;
    await this.request("stop");
    this.worker.terminate();
    this.worker = null;
    this.viewWorker?.terminate();
    this.viewWorker = null;
  }
}
