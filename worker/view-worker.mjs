// Read-only projections use a second CPU worker. The simulation's MessagePort
// sends snapshots directly here: the UI never builds or forwards these models.
// FIFO delivery and the UI acknowledgement provide bounded backpressure.
let project = null;
const pending = [];
function receive(message) {
  if (!project) { pending.push(message); return; }
  try { postMessage({...message, view:message.state ? project(message.state) : null}); }
  catch(error) { postMessage({type:'failure', generation:message.generation,
    requestId:message.requestId, error:'Cannot prepare the command display: '+error.message}); }
}
onmessage = event => {
  const port = event.data.port;
  port.onmessage = event => receive(event.data);
  port.start();
};
try {
  const [{CATALOG},{buildView}] = await Promise.all([
    import('./catalog-loader.mjs'), import('../mechanics/queries.mjs')]);
  project = state => buildView(state,CATALOG);
} catch(error) {
  project = () => { throw error; };
}
for (const message of pending) receive(message);
pending.length = 0;
