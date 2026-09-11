import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {GAME_SOURCE_FILES} from './game-files.mjs';
import {TRACKS} from '../game/src/music.mjs';
import {GAME_VERSION} from '../game/src/version.mjs';
export async function verifyPackage(directory,{writeManifest=false}={}){
 const root=path.resolve(directory),app=path.join(root,'resources/app');
 const required=['WNT1922.exe','LICENSE','LICENSES.chromium.html','ffmpeg.dll','resources/app/package.json','resources/app/desktop/main.mjs','resources/app/game/public/index.html','resources/app/game/public/third-party-notices.html','READ-ME.txt'];
 for(const name of required)assert((await fs.stat(path.join(root,name))).size>0,'Missing '+name);
 const packageInfo=JSON.parse(await fs.readFile(path.join(app,'package.json')));assert.equal(packageInfo.version,GAME_VERSION);
 const allowed=new Set(['package.json','desktop/main.mjs','desktop/runtime-lock.json','tools/play.mjs','tools/game-files.mjs','notices/THIRD_PARTY_NOTICES.md','notices/LICENSE.md','notices/CREDITS.md','notices/third-party-manifest.json',...GAME_SOURCE_FILES.flatMap(f=>['game/src/'+f,'game/public/'+f]),...['content.json','world-political.mjs','world-land.mjs','third-party-notices.html'].map(f=>'game/public/'+f),...TRACKS.map(t=>'game/public/music/'+t.file)]);
 const walk=async(dir,prefix='')=>(await Promise.all((await fs.readdir(dir,{withFileTypes:true})).map(async d=>d.isDirectory()?walk(path.join(dir,d.name),prefix+d.name+'/'):[prefix+d.name]))).flat();
 const appFiles=await walk(app);assert.deepEqual(appFiles.sort(),[...allowed].sort(),'Application package has missing or unexpected files');
 for(const f of appFiles)assert(!/cshapes|(?:^|\/)(?:saves|\.git|\.env|tmp)(?:\/|$)|\.pdf$|\.pfx$|\.key$|\.skill$/i.test(f),'Private/research file in build: '+f);
 const manifest=JSON.parse(await fs.readFile(path.join(app,'notices/third-party-manifest.json')));
 const hash=b=>createHash('sha256').update(b).digest('hex');
 const sourceLock=JSON.parse(await fs.readFile(path.join(root,'runtime-sources/source-lock.json')));
 for(const archive of sourceLock.archives)assert.equal(hash(await fs.readFile(path.join(root,'runtime-sources',archive.name))),archive.sha256,'Missing or changed runtime source '+archive.name);
 assert((await fs.stat(path.join(root,'runtime-sources/RUNTIME-SOURCES.md'))).size>0);
 for(const t of manifest.assets.filter(a=>a.isrc))assert.equal(hash(await fs.readFile(path.join(app,'game/public/music',path.basename(t.path)))),t.sha256,t.title);
 const source=await fs.readFile(path.join(app,'game/public/world-political.mjs'),'utf8');assert(!/CShapes|BY-NC|NonCommercial/i.test(source),'Restricted map in build');assert.match(source,/Natural Earth/);
 for(const name of ['world-political.mjs','content.json','world-land.mjs','third-party-notices.html',...GAME_SOURCE_FILES])assert.equal(hash(await fs.readFile(path.join(app,'game/public',name))),hash(await fs.readFile('game/public/'+name)),'Stale game file: '+name);
 for(const name of ['desktop/main.mjs','desktop/runtime-lock.json','tools/play.mjs','tools/game-files.mjs'])assert.equal(hash(await fs.readFile(path.join(app,name))),hash(await fs.readFile(name)),'Stale desktop file: '+name);
 const files=[];for(const name of (await walk(root)).filter(n=>n!=='package-manifest.json').sort()){const bytes=await fs.readFile(path.join(root,name));files.push({path:name,bytes:bytes.length,sha256:hash(bytes)});}
 const result={version:GAME_VERSION,platform:'win32-x64',files};
 if(writeManifest)await fs.writeFile(path.join(root,'package-manifest.json'),JSON.stringify(result,null,2)+'\n');
 else{const recorded=JSON.parse(await fs.readFile(path.join(root,'package-manifest.json')));assert.deepEqual(result,recorded,'Package has changed since assembly');}
 return {version:GAME_VERSION,files:files.length,music:TRACKS.length,passed:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(await verifyPackage(process.argv[2],{writeManifest:process.argv.includes('--write-manifest')})));
