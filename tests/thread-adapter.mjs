import { parentPort, workerData } from 'node:worker_threads';
const pending=[];
globalThis.postMessage=message=>parentPort.postMessage(message);
globalThis.onmessage=event=>pending.push(event);
parentPort.on('message',data=>globalThis.onmessage({data}));
await import(new URL('../worker/'+workerData,import.meta.url));
for(const event of pending)globalThis.onmessage(event);
