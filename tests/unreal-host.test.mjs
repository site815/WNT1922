import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {once} from 'node:events';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {newGame} from '../mechanics/engine.mjs';
import {exportSave} from '../mechanics/state-io.mjs';

test('Unreal sidecar serves direct editable assets, round-trips the campaign and exits on parent EOF', {timeout:20000}, async t => {
  const parent = path.resolve('test-output'); await fs.mkdir(parent,{recursive:true});
  const saves = await fs.mkdtemp(path.join(parent,'unreal-host-'));
  const child = spawn(process.execPath,['worker/unreal-server.mjs','--save-dir',saves],{cwd:path.resolve('.'),stdio:['pipe','pipe','pipe'],windowsHide:true});
  const exited = once(child,'exit');
  let errors = ''; child.stderr.on('data',data => {errors += data;});
  t.after(async () => {
    if (child.exitCode === null) {child.stdin.end(); await Promise.race([exited,new Promise(resolve=>setTimeout(resolve,4000))]);}
    if (child.exitCode === null) child.kill();
    assert.equal(path.dirname(path.resolve(saves)),parent);
    await fs.rm(saves,{recursive:true,force:true});
  });
  let output = '';
  const ready = await new Promise((resolve,reject)=>{
    child.once('error',reject); child.once('exit',()=>reject(new Error('Service exited before readiness: '+errors)));
    child.stdout.on('data',data=>{output+=data; const line=output.split('\n')[0];if(output.includes('\n')) {try{resolve(JSON.parse(line));}catch(error){reject(error);}}});
  });
  assert.match(ready.origin,/^http:\/\/127\.0\.0\.1:\d+$/);
  const indexResponse = await fetch(ready.origin+'/assets/models/ships/index.json');
  assert.equal(indexResponse.status,200); const index = await indexResponse.json(); assert.equal(index.kind,'polygon-ship-index');
  const model = index.models.find(entry=>entry.id==='farragut_dd34');
  assert(model?.file.endsWith('.glb'),'Farragut uses its external detailed GLB');
  const modelResponse = await fetch(ready.origin+'/assets/models/ships/'+model.file);
  assert.equal(modelResponse.status,200); assert.equal(modelResponse.headers.get('content-type'),'model/gltf-binary');
  const glb = Buffer.from(await modelResponse.arrayBuffer());
  assert.equal(glb.readUInt32LE(0),0x46546c67); assert.equal(glb.readUInt32LE(4),2); assert.equal(glb.readUInt32LE(8),glb.length);
  const manifest = JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)));
  assert(manifest.meshes.some(mesh=>mesh.primitives.some(primitive=>manifest.accessors[primitive.attributes.POSITION].count>0)));
  assert.deepEqual(glb,await fs.readFile(path.join('assets/models/ships',model.file)),'Sidecar serves the current external GLB without rebuilding it');
  const provenance = await fetch(ready.origin+'/assets/models/ships/'+model.file.replace(/\.glb$/,'.source.json'));
  assert.equal(provenance.status,200); assert.equal((await provenance.json()).id,model.id);
  assert.equal((await fetch(ready.origin+'/ui/unreal-scene.mjs')).status,200);
  const state = newGame(CATALOG,'USA',1234,'in_good_faith_1936');
  delete state.pauseReason; // Transient opening notices are intentionally cleared when a save is loaded.
  const save = exportSave(state);
  const response = await fetch(ready.origin+'/api/save',{method:'POST',headers:{'Content-Type':'application/json','Origin':ready.origin},body:save});
  assert.equal(response.status,200,await response.text());
  const loaded = await (await fetch(ready.origin+'/api/save')).text();
  assert.deepEqual(JSON.parse(loaded),JSON.parse(save));
  const forbidden = await fetch(ready.origin+'/api/save',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://example.com'},body:save});
  assert.equal(forbidden.status,403);
  child.stdin.end(); const [code] = await exited; assert.equal(code,0,errors);
});
