import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createGameServer} from '../../tools/play.mjs';
import {CAMPAIGNS} from '../src/land-war.mjs';
import {GAME_VERSION,SAVE_VERSION} from '../src/version.mjs';
import {newGame} from '../src/engine.mjs';
const publicDirectory=path.resolve(process.env.WNT_TEST_PUBLIC||'game/staging');
test('both replacement maps cover campaign territories with public-domain provenance',async()=>{
 for(const file of ['world-political.json','world-political-1922.json']){
  const map=JSON.parse(await fs.readFile('game/data/'+file)),ids=new Set(map.features.map(f=>f.id));assert.equal(ids.size,map.features.length);assert.equal(map.license,'Public domain');
  for(const f of CAMPAIGNS.filter(f=>!f.island))for(const id of f.territories)assert(ids.has(id),file+' missing campaign territory '+id);
  for(const n of ['USA','GBR','JPN','DEU','FRA','ITA','SOV'])assert(map.features.some(f=>f.owner===n));
  for(const f of map.features){assert(['Polygon','MultiPolygon'].includes(f.geometry.type));assert(f.point.every(Number.isFinite));}
 }
});
test('packaged-style server serves credits and saves in a separate user directory',async()=>{
 const saveDir=await fs.mkdtemp(path.join(os.tmpdir(),'wnt-release18-'));
 const server=await createGameServer({port:0,saveDir,publicDirectory});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;
 try{
  const health=await (await fetch(origin+'/health')).json();assert.equal(health.build,GAME_VERSION);assert.equal(health.version,SAVE_VERSION);
  const credits=await fetch(origin+'/third-party-notices.html');assert.equal(credits.status,200);assert.match(credits.headers.get('content-security-policy'),/worker-src 'self'/);assert.match(await credits.text(),/Creative Commons Attribution 4.0/);
  for(const url of ['/../.env','/game/saves/campaign.json','/desktop/main.mjs','/music/manifest.json'])assert.equal((await fetch(origin+url)).status,404);
  assert.equal((await fetch(origin+'/api/save',{headers:{Origin:'https://example.com'}})).status,403);
  const content=JSON.parse(await fs.readFile(path.join(publicDirectory,'content.json'))),s=newGame(content,'USA',18818);
  assert.equal((await fetch(origin+'/api/save',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(s)})).status,200);
  const saved=JSON.parse(await fs.readFile(path.join(saveDir,'campaign.json')));assert.equal(saved.player,'USA');assert.equal(saved.version,SAVE_VERSION);
 }finally{await new Promise(r=>server.close(r));await fs.rm(saveDir,{recursive:true,force:true});}
});
