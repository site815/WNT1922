// Hash the native game's source inputs, excluding generated Unreal output.
// Documentation outside the packaged asset/license tree does not alter code.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {projectFiles} from './project-files.mjs';

const ignored=new Set(['Binaries','DerivedDataCache','Intermediate','Saved','.vs','.git','__pycache__']);
async function walk(folder) {
 const files=[];
 for(const entry of await fs.readdir(folder,{withFileTypes:true})) {
  if(ignored.has(entry.name))continue;
  const file=path.posix.join(folder,entry.name);
  if(entry.isSymbolicLink())throw Error('Linked native source is not supported: '+file);
  if(entry.isDirectory())files.push(...await walk(file));
  else files.push(file);
 }
 return files;
}
const files=[...await projectFiles(),'LICENSE.md','unreal/WNT1922.uproject',
 ...await walk('unreal/Source'),...await walk('unreal/Config'),
 ...await walk('unreal/Tools'),...await walk('unreal/Plugins')];
const hash=createHash('sha256');
for(const file of [...new Set(files)].sort()) {
 const digest=createHash('sha256').update(await fs.readFile(file)).digest('hex');
 hash.update(file+'\0'+digest+'\n');
}
console.log(hash.digest('hex'));
