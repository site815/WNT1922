// Optional offline preparation; the game loads the resulting GLBs directly.
import fs from 'node:fs/promises';
import {writeStoredAsset} from './write-stored-asset.mjs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {normalizeExternalGlb,readGlb} from './normalize-external-glb.mjs';
import {budgetLicensedTextures} from './budget-licensed-textures.mjs';
import {validateDetailedShip} from '../../../tools/check-models.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const specs=JSON.parse(await fs.readFile(new URL('licensed-ships.json',import.meta.url),'utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const spec of specs){
 const cache=path.join(root,'.build/asset-candidates',spec.cacheName+'.glb');
 let original;try{original=await fs.readFile(cache);}catch(e){if(e.code!=='ENOENT'||!process.argv.includes('--fetch'))throw e;const response=await fetch(spec.downloadUrl);assert(response.ok,'Asset download failed: '+response.status);original=Buffer.from(await response.arrayBuffer());assert.equal(hash(original),spec.sourceSha256,'Source revision differs from reviewed bytes');await fs.mkdir(path.dirname(cache),{recursive:true});await writeStoredAsset(cache,original);}
 assert.equal(hash(original),spec.sourceSha256,'Source revision differs from reviewed bytes');
 const source=readGlb(original).json.asset.extras;assert(source.license.startsWith('CC-BY-4.0'),'Unreviewed source license');assert(source.author.startsWith('everlasting17th'),'Unreviewed source creator');
 const normalized=normalizeExternalGlb(original,spec),{normalization}=normalized;
 const {buffer,images:embeddedImages,budget:textureBudget}=await budgetLicensedTextures(normalized.buffer);
 const metadata={...spec,kind:'detailed-ship',units:'metres',axes:'right-handed: X bow-positive; Y up; Z transverse',license:'CC-BY-4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',author:'everlasting17th',authorUrl:'https://sketchfab.com/everlastinggrey',sourceAttribution:source,sourceRevision:'Pinned public Objaverse snapshot; may differ from the current Sketchfab revision',sources:[{title:source.title,url:spec.sourceUrl,author:'everlasting17th',license:'CC-BY-4.0',usedFor:'Original complete geometry, UVs, normals and all embedded PBR textures'},...spec.sources],geometrySource:'Artist-authored licensed asset; no voxel or generated recognition geometry',modifications:'WNT1922 baked static node hierarchy and metre scale, centered the hull, oriented bow +X and up +Y, merged primitives by material without mesh simplification, retained all artist UVs and created 512 px budget derivatives of embedded images with source and derivative hashes recorded, assigned unused planar UVs to untextured rigging, normalized vertex normals, removed Float32-degenerate faces and orientation-unstable microscopic slivers, and repaired normals-disagreeing winding. Native centimetre/int16 precision is checked explicitly; only unstable slivers within eight coordinate ULPs can be discarded. Counts below identify these repairs.',normalization,sha256:hash(buffer),statistics:validateDetailedShip(buffer)};
 metadata.embeddedImages=embeddedImages;metadata.textureBudget=textureBudget;
 validateDetailedShip(buffer,{id:spec.id,metadata});
 if(process.argv.includes('--write')){const output=path.join(root,'assets/models/ships',spec.file);await fs.mkdir(path.dirname(output),{recursive:true});await writeStoredAsset(output.replace(/\.glb$/,'.source.json'),JSON.stringify(metadata,null,2)+'\n');await writeStoredAsset(output,buffer);}
 console.log(JSON.stringify({id:spec.id,...metadata.statistics,normalization}));
}
