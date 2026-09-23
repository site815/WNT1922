import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createGameServer} from '../worker/desktop/server.mjs';

test('repository voxel edits are served directly while standalone files and path confinement remain intact',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'wnt-voxel-host-'));
 t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const bundled=path.join(root,'bundled'), live=path.join(root,'live'), outside=path.join(root,'outside');
 for(const folder of [path.join(bundled,'ui'),path.join(bundled,'assets/voxels/ships'),path.join(live,'ships'),outside])await fs.mkdir(folder,{recursive:true});
 await fs.writeFile(path.join(bundled,'ui/index.html'),'Bundled UI');
 await fs.writeFile(path.join(bundled,'assets/voxels/ships/model.json'),'{"source":"bundled"}');
 await fs.writeFile(path.join(live,'ships/model.json'),'{"source":"live"}');
 await fs.writeFile(path.join(live,'ships/code.mjs'),'Never execute asset files');
 await fs.writeFile(path.join(outside,'secret.json'),'{"secret":true}');
 await fs.symlink(outside,path.join(live,'escape'),'junction');
 const servers=[];
 try {
  const start=async voxelDirectory=>{
   const server=await createGameServer({publicDirectory:bundled,voxelDirectory}); servers.push(server);
   await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));return 'http://127.0.0.1:'+server.address().port;
  };
  const source=await start(live), portable=await start(null), file='/assets/voxels/ships/model.json';
  assert.equal(await(await fetch(source)).text(),'Bundled UI');
  assert.deepEqual(await(await fetch(portable+file)).json(),{source:'bundled'});
  assert.deepEqual(await(await fetch(source+file)).json(),{source:'live'});
  await fs.writeFile(path.join(live,'ships/model.json'),'{"source":"edited"}');
  const changed=await fetch(source+file);assert.equal(changed.headers.get('cache-control'),'no-store');
  assert.deepEqual(await changed.json(),{source:'edited'});
  for(const name of ['escape/secret.json','ships/code.mjs','ships/missing.json','%5c..%5coutside%5csecret.json'])
   assert.equal((await fetch(source+'/assets/voxels/'+name)).status,404,name);
 } finally {for(const server of servers){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}}
});
