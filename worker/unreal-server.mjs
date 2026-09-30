// Unreal owns the native world. This child only serves the existing campaign
// interface, catalogs and save API on loopback; it never creates an Electron UI.
import { createGameServer } from './desktop/server.mjs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const value=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
const saves=value('--save-dir')||path.join(process.env.APPDATA||path.join(os.homedir(),'AppData','Roaming'),'WNT1922','saves');
const server=await createGameServer({saveDir:path.resolve(saves),publicDirectory:root});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
process.stdout.write(JSON.stringify({format:1,origin:`http://127.0.0.1:${server.address().port}`,root})+'\n');
let closing=false;
const close=()=>{if(closing)return;closing=true;server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),3000).unref();};
process.on('SIGTERM',close);process.on('SIGINT',close);
// Closing the owner's stdin is a portable parent-liveness signal. It prevents
// orphan servers after an editor/game crash without touching unrelated Node jobs.
process.stdin.resume();process.stdin.on('end',close);
