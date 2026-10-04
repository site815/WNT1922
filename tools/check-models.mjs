import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {assetReference,referencedAsset} from '../mechanics/asset-references.mjs';
const TYPES=['BB','BC','CV','CVL','CA','CL','DD','DL','SS','SM','AO','DE','TB','AK'];
const validId=value=>typeof value==='string'&&/^[\w-]+$/.test(value);
const modelPath=value=>typeof value==='string'&&/^[\w/.-]+\.(json|glb)$/.test(value)&&!value.split('/').includes('..');

// A stored GLB must contain all geometry and textures. This audit is independent
// of Unreal and catches corrupt attribute buffers before native asset loading.
export function validateDetailedShip(buffer,{id,metadata}={}) {
  assert(Buffer.isBuffer(buffer)&&buffer.length>=28&&buffer.length<=268435456,'Invalid GLB size');
  assert.equal(buffer.readUInt32LE(0),0x46546c67,'Invalid GLB magic');assert.equal(buffer.readUInt32LE(4),2,'Unsupported GLB version');assert.equal(buffer.readUInt32LE(8),buffer.length,'Truncated GLB');
  let json,binary,offset=12;
  while(offset<buffer.length){assert(offset+8<=buffer.length,'Truncated GLB chunk');const length=buffer.readUInt32LE(offset),kind=buffer.readUInt32LE(offset+4);assert(length%4===0&&offset+8+length<=buffer.length,'Invalid GLB chunk length');const chunk=buffer.subarray(offset+8,offset+8+length);if(kind===0x4e4f534a){assert(!json,'Duplicate GLB JSON');json=JSON.parse(chunk.toString('utf8'));}else if(kind===0x004e4942){assert(!binary,'Duplicate GLB binary');binary=chunk;}offset+=8+length;}
  assert(json?.asset?.version==='2.0'&&binary,'Missing GLB data');assert.equal(json.buffers?.length,1);assert(!json.buffers[0].uri&&json.buffers[0].byteLength<=binary.length,'GLB has external or oversized buffer');
  for(const image of json.images||[])assert(Number.isSafeInteger(image.bufferView)&&['image/png','image/jpeg'].includes(image.mimeType)&&!image.uri,'Textures must be embedded PNG or JPEG');
  assert(Array.isArray(json.meshes)&&json.meshes.length>0&&Array.isArray(json.materials)&&json.materials.length>0,'Missing mesh/materials');
  assert(!json.skins?.length&&!json.animations?.length,'Current ship scenes must contain baked static geometry');
  const components={SCALAR:1,VEC2:2,VEC3:3,VEC4:4},sizes={5121:1,5123:2,5125:4,5126:4};
  const get=index=>{const a=json.accessors?.[index],v=json.bufferViews?.[a?.bufferView];assert(a&&v&&!a.sparse&&v.buffer===0,'Invalid GLB accessor');const n=components[a.type],size=sizes[a.componentType],stride=v.byteStride||n*size;assert(n&&size&&Number.isSafeInteger(a.count)&&a.count>0&&a.count<=15000000&&stride>=n*size,'Invalid GLB attribute layout');const start=(v.byteOffset||0)+(a.byteOffset||0),end=start+(a.count-1)*stride+n*size;assert(start>=0&&end<=(v.byteOffset||0)+v.byteLength&&end<=binary.length,'GLB attribute escapes buffer');const read=a.componentType===5126?'readFloatLE':a.componentType===5125?'readUInt32LE':a.componentType===5123?'readUInt16LE':'readUInt8';const values=Array.from({length:a.count*n},(_,i)=>binary[read](start+Math.floor(i/n)*stride+(i%n)*size));assert(values.every(Number.isFinite),'Non-finite GLB attributes');return {values,count:a.count,n,componentType:a.componentType};};
  let triangles=0,vertices=0,min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(const m of json.meshes)for(const p of m.primitives){assert((p.mode??4)===4,'Ship geometry must be triangles');const pos=get(p.attributes.POSITION),normal=get(p.attributes.NORMAL),uv=get(p.attributes.TEXCOORD_0),ix=get(p.indices);assert(pos.n===3&&normal.n===3&&uv.n===2&&ix.n===1&&pos.componentType===5126&&normal.componentType===5126&&uv.componentType===5126,'Invalid geometry attribute types');assert(pos.count===normal.count&&pos.count===uv.count&&ix.count%3===0,'Mismatched GLB attributes');assert(ix.values.every(i=>Number.isSafeInteger(i)&&i>=0&&i<pos.count),'GLB index out of bounds');assert(json.materials[p.material]?.pbrMetallicRoughness,'Ship primitive missing PBR material');
    for(let i=0;i<pos.count;i++){assert(Math.abs(Math.hypot(...normal.values.slice(i*3,i*3+3))-1)<.003,'Invalid GLB normal');for(let k=0;k<3;k++){const v=pos.values[i*3+k];min[k]=Math.min(min[k],v);max[k]=Math.max(max[k],v);}}
    for(let i=0;i<ix.count;i+=3){const ai=ix.values[i]*3,bi=ix.values[i+1]*3,ci=ix.values[i+2]*3,a=pos.values.slice(ai,ai+3),b=pos.values.slice(bi,bi+3).map((v,k)=>v-a[k]),c=pos.values.slice(ci,ci+3).map((v,k)=>v-a[k]),cross=[b[1]*c[2]-b[2]*c[1],b[2]*c[0]-b[0]*c[2],b[0]*c[1]-b[1]*c[0]],n=normal.values.slice(ai,ai+3).map((v,k)=>v+normal.values[bi+k]+normal.values[ci+k]);assert(Math.hypot(...cross)>1e-12,'Degenerate GLB triangle');assert(cross.reduce((s,v,k)=>s+v*n[k],0)>=-1e-6,'GLB winding disagrees with normals');}
    triangles+=ix.count/3;vertices+=pos.count;
  }
  assert(max[0]-min[0]>5&&max[0]-min[0]<1000&&max[2]-min[2]>1&&max[1]-min[1]>1,'GLB is not metre-scaled ship geometry');
  if(id)assert.equal(json.extras?.id,id,'GLB identity differs from registry');
  if(metadata){assert(metadata.id===id&&metadata.units==='metres'&&TYPES.includes(metadata.type)&&metadata.sources?.length&&metadata.accuracy?.trim(),'Missing detailed model source/fit metadata');assert(json.extras?.accuracy?.trim(),'Missing embedded GLB accuracy statement');}
  return {id:json.extras?.id,triangles,vertices,materials:json.materials.length,embeddedTextures:json.images?.length||0,bytes:buffer.length,bounds:{min,max}};
}

export function validatePolygonShip(model) {
  assert(model?.format===1&&model.kind==='polygon-ship'&&validId(model.id)&&TYPES.includes(model.type)&&model.name?.trim(),'Invalid polygon ship identity');
  assert.equal(model.units,'metres');
  assert(['length','beam','height'].every(key=>Number.isFinite(model.dimensions?.[key])&&model.dimensions[key]>0&&model.dimensions[key]<=1000),'Invalid model dimensions: '+model.id);
  assert(model.dimensionBasis?.trim()&&model.reference?.note?.trim()&&model.reference.license==='Original project artwork','Missing model provenance: '+model.id);
  const {positions,normals,colors,indices}=model.mesh||{};
  assert(Array.isArray(positions)&&positions.length>=9&&positions.length%3===0&&positions.length<=180000,'Invalid position buffer: '+model.id);
  assert(Array.isArray(normals)&&normals.length===positions.length&&Array.isArray(colors)&&colors.length===positions.length,'Invalid attribute lengths: '+model.id);
  assert(Array.isArray(indices)&&indices.length>=3&&indices.length%3===0&&indices.length<=300000,'Invalid index buffer: '+model.id);
  const count=positions.length/3;
  assert(indices.every(index=>Number.isSafeInteger(index)&&index>=0&&index<count),'Index out of bounds: '+model.id);
  assert(colors.every(value=>Number.isFinite(value)&&value>=0&&value<=1),'Nonlinear/out-of-range color: '+model.id);
  for(let i=0;i<positions.length;i+=3) {
    const [x,y,z]=positions.slice(i,i+3),normal=normals.slice(i,i+3);
    assert([x,y,z,...normal].every(Number.isFinite),'Non-finite geometry: '+model.id);
    assert(Math.abs(x)<=model.dimensions.length/2+.03&&y>=-.03&&y<=model.dimensions.height+.03&&Math.abs(z)<=model.dimensions.beam/2+.03,'Geometry escapes model dimensions: '+model.id);
    assert(Math.abs(Math.hypot(...normal)-1)<.003,'Invalid normal: '+model.id);
  }
  assert(Array.isArray(model.components)&&model.components.length>=3&&model.components.length<=512,'Invalid component list: '+model.id);
  let vertices=0,offset=0;
  for(const part of model.components) {
    assert(typeof part.role==='string'&&part.role&&typeof part.shape==='string'&&part.shape,'Unidentified component: '+model.id);
    assert(['x','y','z','w','d','h'].every(key=>Number.isFinite(part[key]))&&part.w>0&&part.d>0&&part.h>0,'Invalid component bounds: '+model.id);
    assert.equal(part.vertexStart,vertices);assert.equal(part.indexStart,offset);
    assert(Number.isSafeInteger(part.vertexCount)&&part.vertexCount>0&&Number.isSafeInteger(part.indexCount)&&part.indexCount>0&&part.indexCount%3===0,'Invalid component range: '+model.id);
    assert(part.bounds?.min?.length===3&&part.bounds?.max?.length===3,'Missing native-engine component bounds: '+model.id);
    for(let i=part.indexStart;i<part.indexStart+part.indexCount;i++)assert(indices[i]>=part.vertexStart&&indices[i]<part.vertexStart+part.vertexCount,'Component crosses another mesh range: '+model.id);
    for(let i=part.vertexStart;i<part.vertexStart+part.vertexCount;i++)for(let axis=0;axis<3;axis++)assert(positions[i*3+axis]>=part.bounds.min[axis]-.001&&positions[i*3+axis]<=part.bounds.max[axis]+.001,'Stale component bounds: '+model.id);
    vertices+=part.vertexCount;offset+=part.indexCount;
  }
  assert.equal(vertices,count);assert.equal(offset,indices.length);
  const hull=model.components.filter(part=>part.role==='hull');
  assert.equal(hull.length,1,model.id+' must have one continuous hull, not stacked blocks');
  assert.equal(hull[0].shape,'continuous-loft');assert(hull[0].stationCount>=32);
  assert.equal(model.components.filter(part=>part.role==='deck').length,1,model.id+' must have one continuous deck');
  assert(model.components.filter(part=>part.role==='main-barrel').every(part=>part.shape==='cylinder'),'Noncylindrical gun barrels: '+model.id);
  return model;
}

export async function validateShipModels({root=process.cwd(),catalog}={}) {
  const modelRoot=await fs.realpath(path.join(root,'assets/models/ships'));
  const read=async file=>{assert(modelPath(file),'Invalid model path');const absolute=await fs.realpath(path.join(modelRoot,file)),relative=path.relative(modelRoot,absolute);assert(relative&&!relative.startsWith('..')&&!path.isAbsolute(relative),'Model path escapes asset root');return file.endsWith('.glb')?fs.readFile(absolute):JSON.parse(await fs.readFile(absolute,'utf8'));};
  const index=await read('index.json');assert(index.format===1&&index.kind==='polygon-ship-index'&&Array.isArray(index.models),'Invalid polygon registry');
  const models=new Map(),platforms=new Map(),files=new Set();let vertices=0,triangles=0,maxTriangles=0,bytes=0,detailedModels=0;
  for(const entry of index.models) {
    assert(!models.has(entry.id)&&!files.has(entry.file),'Duplicate polygon model');files.add(entry.file);
    let model,stats;
    if(entry.file.endsWith('.glb')){model=await read(entry.file.replace(/\.glb$/,'.source.json'));stats=validateDetailedShip(await read(entry.file),{id:entry.id,metadata:model});detailedModels++;}
    else {model=validatePolygonShip(await read(entry.file));stats={vertices:model.mesh.positions.length/3,triangles:model.mesh.indices.length/3};}
    assert.equal(model.id,entry.id);models.set(model.id,model);
    vertices+=stats.vertices;triangles+=stats.triangles;maxTriangles=Math.max(maxTriangles,stats.triangles);bytes+=(await fs.stat(path.join(modelRoot,entry.file))).size;
    for(const platform of entry.platforms){assert(validId(platform.id)&&(!platform.campaign||validId(platform.campaign)));const key=(platform.campaign?platform.campaign+':':'')+platform.id;assert(!platforms.has(key),'Duplicate class mapping');platforms.set(key,model);}
  }
  for(const type of TYPES){const model=models.get(index.fallbacks[type]);assert(model?.fallback&&model.type===type,'Missing generic '+type+' mesh');}
  // The stored assets and campaign catalog are authoritative. Validation must
  // never require the retired renderer's source geometry or asset directory.
  let mappings=0,detailedCampaignMappings=0,representativeCampaignMappings=0;
  const detailedIds=new Set(index.models.filter(entry=>entry.file.endsWith('.glb')).map(entry=>entry.id));
  if(catalog)for(const [campaignId,campaign]of Object.entries(catalog.campaigns))for(const ship of Object.values(campaign.classes)){
    const reference=assetReference(ship,campaign.scenario,campaignId),model=referencedAsset(platforms,reference);
    assert(model&&!model.fallback,'Missing explicit class reference or detailed model: '+campaignId+'/'+ship.id);
    assert(model.type===ship.type||['BB','BC'].includes(model.type)&&['BB','BC'].includes(ship.type),
      'Referenced model must preserve ship role (BB/BC are both capital gunships): '+ship.id);mappings++;
    if(reference.representativeModel)representativeCampaignMappings++;
    if(detailedIds.has(model.id))detailedCampaignMappings++;
  }
  return {models:models.size,detailedModels,referenceModels:models.size-detailedModels,campaignMappings:mappings,detailedCampaignMappings,representativeCampaignMappings,pendingCampaignMappings:mappings-detailedCampaignMappings,fallbackTypes:TYPES.length,vertices,triangles,maxTriangles,bytes};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const {CATALOG}=await import('../worker/catalog-loader.mjs');console.log(JSON.stringify(await validateShipModels({catalog:CATALOG})));}
