import { simulationHost } from './simulation-host.mjs';
const host=simulationHost({send:message=>postMessage(message)});
onmessage=event=>host.receive(event.data);
