// Register only completed, validated on-disk assets; retain campaign mappings.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateDetailedShip,validateShipModels} from '../../../tools/check-models.mjs';
import {CATALOG} from '../../../worker/catalog-loader.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),modelRoot=path.join(root,'assets/models/ships');
const file=path.join(modelRoot,'index.json'),index=JSON.parse(await fs.readFile(file,'utf8'));
const files=await fs.readdir(modelRoot,{recursive:true}),added=[];
for(const relative of files.filter(f=>f.endsWith('.glb'))){
  const normalized=relative.replaceAll('\\','/'),bytes=await fs.readFile(path.join(modelRoot,relative)),metadata=JSON.parse(await fs.readFile(path.join(modelRoot,relative.replace(/\.glb$/,'.source.json')),'utf8'));
  validateDetailedShip(bytes,{id:metadata.id,metadata});
  const entry=index.models.find(m=>m.id===metadata.id);
  if(entry){entry.file=normalized;if(metadata.fallback&&!entry.platforms.some(p=>p.id===entry.id))entry.platforms.push({id:entry.id});}
  else{if(!metadata.id.startsWith('demo-'))throw Error('Unregistered non-demo asset requires an explicit class mapping: '+metadata.id);index.models.push({id:metadata.id,file:normalized,role:'opening-demo',platforms:[{id:metadata.id}]});added.push(metadata.id);}
}
await fs.writeFile(file,JSON.stringify(index,null,2)+'\n');
console.log(JSON.stringify({added,...await validateShipModels({root,catalog:CATALOG})}));
