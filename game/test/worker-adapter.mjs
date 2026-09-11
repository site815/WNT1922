import {parentPort} from 'node:worker_threads';
import {simulationHost} from '../src/simulation-host.mjs';
const host=simulationHost({send:m=>parentPort.postMessage(m)});
parentPort.on('message',m=>host.receive(m));
