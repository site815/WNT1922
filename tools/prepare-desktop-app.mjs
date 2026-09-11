import fs from 'node:fs/promises';
import path from 'node:path';
import {GAME_SOURCE_FILES} from './game-files.mjs';
import {GAME_VERSION} from '../game/src/version.mjs';
import {TRACKS} from '../game/src/music.mjs';
const target=path.resolve(process.argv[2]||'dist/app');
const dist=path.resolve('dist')+path.sep;
if(!target.startsWith(dist))throw Error('Desktop assembly must remain inside dist.');
const copy=async(source,relative)=>{const out=path.join(target,relative);await fs.mkdir(path.dirname(out),{recursive:true});await fs.copyFile(source,out);};
const pkg=JSON.parse(await fs.readFile('desktop/package.json'));pkg.version=GAME_VERSION;
await fs.mkdir(target,{recursive:true});await fs.writeFile(path.join(target,'package.json'),JSON.stringify(pkg,null,2));
for(const p of ['desktop/main.mjs','desktop/runtime-lock.json','tools/play.mjs','tools/game-files.mjs'])await copy(p,p);
for(const name of GAME_SOURCE_FILES){await copy('game/src/'+name,'game/src/'+name);await copy('game/public/'+name,'game/public/'+name);}
for(const name of ['content.json','world-political.mjs','world-land.mjs','third-party-notices.html'])await copy('game/public/'+name,'game/public/'+name);
for(const track of TRACKS)await copy('game/assets/music/'+track.file,'game/public/music/'+track.file);
for(const p of ['THIRD_PARTY_NOTICES.md','LICENSE.md','game/assets/music/CREDITS.md'])await copy(p,'notices/'+path.basename(p));
await copy('game/assets/third-party-manifest.json','notices/third-party-manifest.json');
console.log('Assembled allowlisted desktop application '+GAME_VERSION);
