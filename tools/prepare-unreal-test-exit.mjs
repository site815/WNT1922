// Save and verify only an explicitly selected, successfully tested local game.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {validateSave} from '../mechanics/state-io.mjs';
const arg=name=>process.argv.slice(2).find(v=>v.startsWith(name+'='))?.slice(name.length+1);
setTimeout(()=>{console.error('Timed out verifying the isolated test save; no shutdown approval was written.');process.exit(1);},45000).unref();
const readJSON=async file=>JSON.parse((await fs.readFile(file,'utf8')).replace(/^\uFEFF/,''));
const report=await readJSON(arg('--runtime-report'));
assert.equal(report.passed,true,'Cleanup requires a successful runtime report');
assert.match(report.endpoint,/^http:\/\/127\.0\.0\.1:\d+$/);
let pw;try{pw=createRequire(import.meta.url)('playwright');}catch{pw=createRequire(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'))('playwright');}
const browser=await pw.chromium.connectOverCDP(report.endpoint,{timeout:15000});
const expected=report.metrics.find(row=>row.kind==='CEF').url;
const page=browser.contexts().flatMap(c=>c.pages()).find(p=>p.url()===expected);
assert(page,'The tested CEF page must still exist');
await page.evaluate(async()=>{
 if(typeof globalThis.saveForDesktopClose!=='function')throw Error('Save-before-close is unavailable');
 if(await globalThis.saveForDesktopClose()!==true)throw Error('Save-before-close failed');
});
const served=await page.evaluate(async()=>{const r=await fetch('/api/save');if(!r.ok)throw Error('Saved campaign unavailable');return r.json();});
const bytes=await fs.readFile(path.join(arg('--save-dir'),'campaign.json'));
const disk=JSON.parse(bytes);validateSave(disk,CATALOG);assert.equal(disk.paused,true);assert.deepEqual(disk,served);
const prior=await readJSON(path.join(path.dirname(arg('--runtime-report')),'verified-campaign.json'));
const stable=({savedAt,recoveredSave,...state})=>state;
assert.deepEqual(stable(disk),stable(prior),'Shutdown must preserve the verified paused campaign');
await fs.writeFile(arg('--output'),JSON.stringify({saved:true,paused:true,saveSha256:createHash('sha256').update(bytes).digest('hex'),verifiedAt:new Date().toISOString()},null,2));
// Disconnect only. The scoped PowerShell owner performs the native shutdown.
process.exit(0);
