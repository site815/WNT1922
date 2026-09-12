// Install the listener before awaiting catalog imports. A browser can deliver
// initialize while a module worker is still awaiting its documentation fetches.
let host;
const pending = [];
onmessage = (event) => {
  if (host) host.receive(event.data);
  else pending.push(event.data);
};
try {
  const [{ CATALOG }, { simulationHost }] = await Promise.all([
    import("./catalog-loader.mjs"),
    import("./simulation-host.mjs"),
  ]);
  host = simulationHost({
    content: CATALOG,
    send: (message) => postMessage(message),
  });
  for (const message of pending) host.receive(message);
  pending.length = 0;
} catch (error) {
  const failed = (message) =>
    postMessage({
      type: "failure",
      generation: message.generation,
      requestId: message.requestId,
      error: "Cannot load the simulation catalogs: " + error.message,
    });
  onmessage = (event) => failed(event.data);
  for (const message of pending) failed(message);
  pending.length = 0;
}
