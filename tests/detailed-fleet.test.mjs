import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {DEMO_BATTLES} from '../ui/start-battle-data.mjs';
const root='assets/models/ships/';
const index=JSON.parse(await fs.readFile(root+'index.json','utf8'));
const mappings=new Map(index.models.flatMap(m=>m.platforms.map(p=>[(p.campaign?p.campaign+':':'')+p.id,m])));
function glb(buffer){
  const size=buffer.readUInt32LE(12),json=JSON.parse(buffer.subarray(20,20+size)),binary=buffer.subarray(28+size);
  const attribute=index=>{const a=json.accessors[index],v=json.bufferViews[a.bufferView],n=a.type==='VEC3'?3:a.type==='VEC2'?2:1,size=a.componentType===5123?2:4,read=a.componentType===5126?'readFloatLE':a.componentType===5123?'readUInt16LE':'readUInt32LE',start=(v.byteOffset||0)+(a.byteOffset||0),stride=v.byteStride||n*size;return {count:a.count,n,at:(i,k=0)=>binary[read](start+i*stride+k*size)};};
  return {json,attribute};
}
test('every campaign class, title ship and custom-design type resolves to a detailed stored GLB',()=>{
  for(const [campaign,c]of Object.entries(CATALOG.campaigns))for(const s of Object.values(c.classes)){const model=mappings.get(campaign+':'+s.id)||mappings.get(s.id);assert(model?.file.endsWith('.glb'),campaign+'/'+s.id+' needs its detailed class fit');assert(!model.id.startsWith('fallback-'),'Historical/campaign fit must not silently use a generic model');}
  for(const battle of DEMO_BATTLES)for(const s of [...battle.shipsA,...battle.shipsB])assert(mappings.get(s.classId)?.file.endsWith('.glb'),'Opening demo needs explicit dated asset: '+s.classId);
  for(const id of Object.values(index.fallbacks))assert(index.models.find(m=>m.id===id)?.file.endsWith('.glb'),'Custom design category needs detailed stored artwork: '+id);
});
test('new authored fleet has physically scaled full hulls and real geometric weapon muzzles',async()=>{
  let verified=0;
  for(const entry of index.models){
    const meta=JSON.parse(await fs.readFile(root+entry.file.replace(/\.glb$/,'.source.json'),'utf8'));
    if(!meta.exporter?.endsWith('build-detailed-fleet.mjs'))continue;
    const buffer=await fs.readFile(root+entry.file),{json,attribute}=glb(buffer);
    assert.equal(crypto.createHash('sha256').update(buffer).digest('hex'),meta.sha256,entry.id+' file and companion provenance revision');
    const hull=json.extras.parts[0],min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];let outward=0;
    for(const range of hull.ranges){const p=json.meshes[0].primitives.find(p=>json.materials[p.material].name===range.material),positions=attribute(p.attributes.POSITION),normals=attribute(p.attributes.NORMAL),indices=attribute(p.indices);
      for(let i=range.indexStart;i<range.indexStart+range.indexCount;i++){const v=indices.at(i);for(let k=0;k<3;k++){const value=positions.at(v,k);min[k]=Math.min(min[k],value);max[k]=Math.max(max[k],value);}if(Math.abs(positions.at(v))<meta.dimensions.length*.15&&Math.abs(positions.at(v,2))>meta.dimensions.beam*.35){assert(normals.at(v,2)*positions.at(v,2)>0,entry.id+' outward hull-side normals');outward++;}}
    }
    assert(outward>100,entry.id+' exercised both hull sides');
    assert(Math.abs(max[0]-min[0]-meta.dimensions.length)<.10,entry.id+' physical hull length independent of overhanging guns');
    assert(Math.abs(max[2]-min[2]-meta.dimensions.beam)<.10,entry.id+' physical hull beam independent of outriggers and sponsons');
    assert(Math.abs(min[1]+meta.dimensions.draft)<.10,entry.id+' complete submerged hull draft');
    const caps=new Set();for(const primitive of json.meshes[0].primitives.filter(p=>json.materials[p.material].name==='boot')){const positions=attribute(primitive.attributes.POSITION);for(let i=0;i<positions.count;i++)caps.add([positions.at(i),positions.at(i,1),positions.at(i,2)].join(','));}
    assert(meta.equipment,entry.id+' requires geometric equipment evidence');
    for(const weapon of Object.values(meta.equipment).flat())assert(caps.has(weapon.muzzle.join(',')),entry.id+' recorded muzzle is part of actual GLB geometry');
    const expected=meta.fitReview?.expectedMainBarrels??meta.armament.barrels;
    assert.equal(meta.equipment.mainBarrels.length,expected,entry.id+' source-fit main barrel count');
    if(Number.isInteger(meta.fitReview?.expectedSecondaryBarrels))assert.equal(meta.equipment.secondaryBarrels.length,meta.fitReview.expectedSecondaryBarrels,entry.id+' source-fit secondary count');
    if(Number.isInteger(meta.fitReview?.expectedExternalTorpedoTubes))assert.equal(meta.equipment.torpedoTubes.length,meta.fitReview.expectedExternalTorpedoTubes,entry.id+' source-fit external torpedo tubes');
    assert(meta.statistics.embeddedTextures>=6&&json.images.length<=12,'Self-contained distinct paint/deck/upper-deck/canvas PBR surfaces');
    assert.equal(meta.surfaceProfile?.version,1,entry.id+' uses the shared physically scaled finish policy');
    const paintMaterial=json.materials.find(m=>m.name==='paint'),deckMaterial=json.materials.find(m=>m.name==='deck');
    assert.notEqual(paintMaterial.pbrMetallicRoughness.baseColorTexture.index,deckMaterial.pbrMetallicRoughness.baseColorTexture.index,'Deck finish must have its own surface pattern');
    assert(meta.statistics.triangles>=10000&&buffer.length<25000000,entry.id+' detailed geometry with lossless indexing and bounded stored size');
    assert(meta.sources?.length&&meta.accuracy?.includes('inferred'),entry.id+' explicit sources and reconstruction limits');verified++;
  }
  assert(verified>=165,'Audit must cover the full replacement fleet');
});
test('all finished ship assets have bounded texture memory and textured visible paint',async()=>{
  for(const entry of index.models){
    const buffer=await fs.readFile(root+entry.file),{json}=glb(buffer),binary=buffer.subarray(28+buffer.readUInt32LE(12));let pixels=0;
    for(const image of json.images){const view=json.bufferViews[image.bufferView],png=binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength);assert.equal(image.mimeType,'image/png',entry.id+' budgeted PNG maps');const width=png.readUInt32BE(16),height=png.readUInt32BE(20);assert(width<=512&&height<=512,entry.id+' map exceeds its ship-view texel budget');pixels+=width*height;}
    assert(pixels*4*4/3<=70*1024*1024,entry.id+' expanded RGBA+mip estimate exceeds 70 MiB');
    if(json.extras.surfaceProfile||json.materials.some(m=>m.name==='paint')){const paint=json.materials.find(m=>m.name==='paint');assert(paint?.pbrMetallicRoughness.baseColorTexture&&paint.normalTexture,'Authored hull paint needs color variation and surface normals');}
  }
});
test('École torpedo boat retains six visible tubes, no heavy gun and no reload capacity',async()=>{
  const m=JSON.parse(await fs.readFile(root+'fra/ecole_pt32.source.json','utf8'));
  assert.equal(m.equipment.torpedoTubes.length,6);assert.equal(m.equipment.mainBarrels.length,0);assert.equal(m.armament.torpedoReloads,0);assert.equal(m.complement,12);assert.equal(m.displacement,600);
  const banks=new Set(m.equipment.torpedoTubes.map(t=>t.center[0]));assert.equal(banks.size,2);
});

test('Queen Elizabeth keeps the source-plan bridge wings and aft deckhouse in real geometry',async()=>{
  const buffer=await fs.readFile(root+'gbr/queen_elizabeth.glb'),{json,attribute}=glb(buffer);
  const bounds=part=>{assert(part,'Source-plan structure must be present');const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const range of part.ranges){const primitive=json.meshes[0].primitives.find(p=>json.materials[p.material].name===range.material),positions=attribute(primitive.attributes.POSITION),indices=attribute(primitive.indices);for(let i=range.indexStart;i<range.indexStart+range.indexCount;i++){const vertex=indices.at(i);for(let k=0;k<3;k++){min[k]=Math.min(min[k],positions.at(vertex,k));max[k]=Math.max(max[k],positions.at(vertex,k));}}}return{min,max};};
  const wings=bounds(json.extras.parts.find(p=>p.name.startsWith('Source-plan bridge wings'))),aft=bounds(json.extras.parts.find(p=>p.name.startsWith('Shaped deckhouse')));
  assert(wings.max[2]-wings.min[2]>=19.3,'The forward wing platform must retain the wide Brassey-plan footprint');
  assert(wings.min[0]>15&&wings.max[0]<30,'Bridge wings remain between the forward funnel and B turret');
  assert(aft.min[0]<-35&&aft.max[0]>-23&&aft.max[0]<-21,'Aft deckhouse stays around the recorded after mast');
  assert(aft.max[2]-aft.min[2]>=12.9,'Aft structure must not disappear into a narrow mast pedestal');
});
