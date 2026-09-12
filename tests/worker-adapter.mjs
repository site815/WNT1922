import { parentPort } from "node:worker_threads";
import { simulationHost } from "../worker/simulation-host.mjs";
import { CATALOG } from "../worker/catalog-loader.mjs";
const host = simulationHost({
  content: CATALOG,
  send: (m) => parentPort.postMessage(m),
});
parentPort.on("message", (m) => host.receive(m));
