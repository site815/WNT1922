import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {validatePolygonShip,validateShipModels,validateDetailedShip} from '../tools/check-models.mjs';
const read=async file=>JSON.parse(await fs.readFile('assets/models/ships/'+file,'utf8'));
const volume=(model,part)=>{const p=model.mesh.positions,ix=model.mesh.indices;let sum=0;for(let i=part.indexStart;i<part.indexStart+part.indexCount;i+=3){const a=ix[i]*3,b=ix[i+1]*3,c=ix[i+2]*3;sum+=(p[a]*(p[b+1]*p[c+2]-p[b+2]*p[c+1])+p[a+1]*(p[b+2]*p[c]-p[b]*p[c+2])+p[a+2]*(p[b]*p[c+1]-p[b+1]*p[c]))/6;}return sum;};

  test('licensed detailed ships retain attributed artist maps as budgeted derivatives after scene normalization',async()=>{
  for(const name of ['bismarck','samidare']){
    const file='historical/'+name+'-everlasting17th',metadata=await read(file+'.source.json'),buffer=await fs.readFile('assets/models/ships/'+file+'.glb');
    const stats=validateDetailedShip(buffer,{id:metadata.id,metadata});
    assert.equal(metadata.license,'CC-BY-4.0');assert.equal(metadata.author,'everlasting17th');assert.equal(metadata.sourceSha256.length,64);
    assert.equal(crypto.createHash('sha256').update(buffer).digest('hex'),metadata.sha256,'Reviewed GLB revision');
    assert(stats.triangles>100000&&stats.embeddedTextures>=20,'Detailed artist mesh with embedded surface maps');
    const length=buffer.readUInt32LE(12),json=JSON.parse(buffer.subarray(20,20+length)),binary=buffer.subarray(28+length);
    assert.equal(json.nodes.length,1);assert.equal(json.nodes[0].mesh,0);assert(!json.nodes[0].matrix&&!json.nodes[0].rotation&&!json.nodes[0].scale,'All artist transforms baked');
    assert(json.asset.extras.author.includes('everlasting17th'));assert(json.asset.extras.license.includes('CC-BY-4.0'));
      for(const image of metadata.embeddedImages){const view=json.bufferViews[json.images[image.index].bufferView],bytes=binary.subarray(view.byteOffset,view.byteOffset+view.byteLength);assert.equal(bytes.length,image.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),image.sha256,'Derivative revision matches recorded image');assert.equal(image.sourceSha256.length,64,'Original artist image revision is recorded');assert(image.width<=512&&image.height<=512);assert(image.sourceWidth>=image.width&&image.sourceHeight>=image.height,'No artificial upscaling');}
      assert.equal(metadata.textureBudget.pixelCount,metadata.textureBudget.sourcePixelCount/4,'Image pixel memory reduced by 75%');
    assert.equal(json.images.length,metadata.embeddedImages.length);
    const {sourceHullBounds,uniformScale}=metadata.normalization;assert(Math.abs((sourceHullBounds.max[0]-sourceHullBounds.min[0])*uniformScale-metadata.length)<1e-8);
    assert(stats.bounds.min[1]<-2&&stats.bounds.max[1]>15,'Above-water equipment and underwater hull retained');
  }
});

test('licensed ship winding survives native Float32 centimetres and packed int16 normals',async()=>{
  for(const name of ['bismarck','samidare']){
    const buffer=await fs.readFile('assets/models/ships/historical/'+name+'-everlasting17th.glb'),length=buffer.readUInt32LE(12),json=JSON.parse(buffer.subarray(20,20+length)),binary=buffer.subarray(28+length);
    const get=index=>{const a=json.accessors[index],v=json.bufferViews[a.bufferView],count=a.count*(a.type==='VEC3'?3:1),method=a.componentType===5126?'readFloatLE':'readUInt32LE';return Array.from({length:count},(_,i)=>binary[method]((v.byteOffset||0)+(a.byteOffset||0)+i*4));};
    const pack=x=>Math.fround(Math.round(Math.fround(x*32767))*Math.fround(1/32767));
    let reversed=0,collapsed=0;
    for(const primitive of json.meshes[0].primitives){
      const p=get(primitive.attributes.POSITION),n=get(primitive.attributes.NORMAL),ix=get(primitive.indices);
      const positions=p.map(v=>Math.fround(v*100)),normals=n.map(pack);
      const vec=(data,i)=>[data[i*3],data[i*3+2],data[i*3+1]];
      for(let i=0;i<ix.length;i+=3){const a=vec(positions,ix[i]),b=vec(positions,ix[i+1]).map((v,k)=>v-a[k]),c=vec(positions,ix[i+2]).map((v,k)=>v-a[k]),face=[b[1]*c[2]-b[2]*c[1],b[2]*c[0]-b[0]*c[2],b[0]*c[1]-b[1]*c[0]],ns=vec(normals,ix[i]).map((v,k)=>v+vec(normals,ix[i+1])[k]+vec(normals,ix[i+2])[k]);
        if(Math.hypot(...face)<1e-6){collapsed++;continue;}
        if(face.reduce((sum,v,k)=>sum+v*ns[k],0)>.00001)reversed++;
      }
    }
    assert.equal(reversed,0,name+' native winding');assert.equal(collapsed,0,name+' native collapsed triangles');
  }
});

test('stored detailed hulls have their narrow bows at positive X',async()=>{
  for(const name of ['historical/bismarck-everlasting17th','historical/samidare-everlasting17th','usa/farragut_dd34','generic/liberty-ec2-sc1','generic/hog-island-1022']){
    const buffer=await fs.readFile('assets/models/ships/'+name+'.glb'),length=buffer.readUInt32LE(12),json=JSON.parse(buffer.subarray(20,20+length)),binary=buffer.subarray(28+length);
    const get=index=>{const a=json.accessors[index],v=json.bufferViews[a.bufferView],n=a.type==='VEC3'?3:1,method=a.componentType===5126?'readFloatLE':'readUInt32LE';return Array.from({length:a.count*n},(_,i)=>binary[method]((v.byteOffset||0)+(a.byteOffset||0)+i*4));};
    const hull=json.extras.parts[0],points=[];
    for(const range of hull.ranges||[hull]){const primitive=json.meshes[0].primitives.find(p=>typeof range.material==='number'?p.material===range.material:json.materials[p.material].name===range.material),p=get(primitive.attributes.POSITION),ix=get(primitive.indices);
      for(let i=range.indexStart;i<range.indexStart+range.indexCount;i++)points.push(p.slice(ix[i]*3,ix[i]*3+3));
    }
    let min=Infinity,max=-Infinity;for(const p of points){min=Math.min(min,p[0]);max=Math.max(max,p[0]);}
    const end=(bow)=>{const selected=points.filter(p=>bow?p[0]>max-(max-min)*.025:p[0]<min+(max-min)*.025);return {height:Math.max(...selected.map(p=>p[1])),width:Math.max(...selected.map(p=>p[2]))-Math.min(...selected.map(p=>p[2]))};};
    const bow=end(true),stern=end(false);
    assert(bow.width<stern.width*.9,name+' pointed bow must be +X, rather than the broad counter stern');
    // Type 1022 has separate forecastle and poop decks above a level hull edge;
    // its narrowing stem identifies direction without assuming unequal sheer.
    if(!name.includes('hog-island'))assert(bow.height>stern.height+.1,name+' raised forecastle/sheered bow must be +X');
  }
});

test('prebuilt polygon collection retains every existing ship and campaign fit',async()=>{
  const summary=await validateShipModels({catalog:CATALOG});
  const registry=await read('index.json');
  assert.equal(summary.models,registry.models.length);assert.equal(summary.campaignMappings,Object.values(CATALOG.campaigns).reduce((n,c)=>n+Object.keys(c.classes).length,0));assert.equal(summary.fallbackTypes,14);
  assert(summary.maxTriangles<5000000);assert(summary.bytes<5000000000);
});

test('surface ships have continuous curved hulls, outward closed surfaces and round gun fittings',async()=>{
  for(const file of ['gbr/admiral.json','gbr/nelson.json','generic/merchant-freighter.json','jpn/i_series_t33.json']) {
    const model=validatePolygonShip(await read(file)),hull=model.components.find(p=>p.role==='hull');
    assert.equal(model.components.filter(p=>p.role==='hull').length,1);
    const curved=[];
    for(let i=hull.vertexStart;i<hull.vertexStart+hull.vertexCount;i++){const n=model.mesh.normals.slice(i*3,i*3+3);if(n.filter(v=>Math.abs(v)>.025).length>1)curved.push(n);}
    assert(curved.length>100,'curved normals rather than axis-aligned cuboid faces');
    for(const part of model.components)assert(volume(model,part)>0,'outward closed component: '+model.id+'/'+part.role);
    for(const barrel of model.components.filter(p=>p.role==='main-barrel')) {
      assert.equal(barrel.shape,'cylinder');
      const radial=new Set();for(let i=barrel.vertexStart;i<barrel.vertexStart+barrel.vertexCount;i++)radial.add(model.mesh.positions[i*3+1].toFixed(3));
      assert(radial.size>=8,'round cross section, not a rectangular barrel');
    }
  }
});

test('historical silhouette distinctions survive the polygon conversion',async()=>{
  const nelson=await read('gbr/nelson.json'),hood=await read('gbr/admiral.json');
  assert.equal(nelson.components.filter(p=>p.role==='main-barrel').length,9);
  assert(nelson.components.filter(p=>p.role==='main').every(p=>p.x>0));
  const turrets=nelson.components.filter(p=>p.role==='main').sort((a,b)=>b.x-a.x);
  assert(turrets[1].z>turrets[0].z+3&&turrets[1].z>turrets[2].z+3,'Nelson B turret superfires from its raised barbette');
  assert.equal(nelson.components.filter(p=>p.role==='main-pedestal').length,1);
  assert.equal(hood.components.filter(p=>p.role==='main-barrel').length,8);
  assert(hood.components.some(p=>p.role==='main'&&p.x<0));
  for(const file of ['jpn/akagi_cv.json','jpn/kaga_cv.json']) {
    const model=await read(file);
    for(const role of ['flight-deck','middle-flight-deck','lower-flight-deck'])assert.equal(model.components.filter(p=>p.role===role).length,1);
    assert(!model.components.some(p=>p.role==='island'));
    assert.match(model.reference.configuration,/original/);
  }
  const merchant=await read('generic/merchant-freighter.json');
  assert(!merchant.components.some(p=>/barrel|torpedo/.test(p.role)));
  assert.match(merchant.dimensionBasis,/independent of convoy GRT/);
});

test('Unreal coordinate conversion preserves scale and normal/winding agreement',async()=>{
  const model=await read('gbr/admiral.json'),p=model.mesh.positions,n=model.mesh.normals,indices=model.mesh.indices;
  const vector=(values,index,scale=1)=>[values[index*3]*scale,values[index*3+2]*scale,values[index*3+1]*scale];
  let usable=0;
  for(let i=0;i<indices.length;i+=3){
    const [ia,ib,ic]=[indices[i],indices[i+1],indices[i+2]],a=vector(p,ia,100),b=vector(p,ib,100).map((v,k)=>v-a[k]),c=vector(p,ic,100).map((v,k)=>v-a[k]);
    const cross=[b[1]*c[2]-b[2]*c[1],b[2]*c[0]-b[0]*c[2],b[0]*c[1]-b[1]*c[0]],norm=vector(n,ia).map((v,k)=>v+vector(n,ib)[k]+vector(n,ic)[k]);
    if(Math.hypot(...cross)<.001)continue;
    assert(cross.reduce((s,v,k)=>s+v*norm[k],0)<.001,'original indices become Unreal clockwise fronts after the axis swap');usable++;
  }
  assert(usable>1000);
  const xs=p.filter((_,i)=>i%3===0).map(v=>v*100);
  assert(Math.abs(Math.max(...xs)-Math.min(...xs)-model.dimensions.length*100)<.1);
});

test('detailed Farragut GLB contains metre-scale full hull, UVs and PBR material sections',async()=>{
  const metadata=await read('usa/farragut_dd34.source.json'),buffer=await fs.readFile('assets/models/ships/usa/farragut_dd34.glb');
  const result=validateDetailedShip(buffer,{id:'farragut_dd34',metadata});
  assert(result.bounds.min[1]<-3&&result.bounds.max[1]>20,'full underwater form and correctly scaled mast');
  assert(Math.abs(result.bounds.max[0]-result.bounds.min[0]-104.013)<.1);
  assert(result.materials>=8&&result.triangles>50000&&result.embeddedTextures>=3);
  assert.equal(metadata.mainGuns.length,5);assert.equal(metadata.torpedoMounts.length,2);assert.equal(metadata.funnels.length,2);
  assert(metadata.mainGuns[2].station<metadata.funnels[1].station-.08,'third gun is aft of the second funnel');
  const jsonBytes=buffer.readUInt32LE(12),glb=JSON.parse(buffer.subarray(20,20+jsonBytes).toString()),binary=buffer.subarray(28+jsonBytes),hull=glb.extras.parts[0];
  const attr=index=>{const a=glb.accessors[index],v=glb.bufferViews[a.bufferView],n=a.type==='VEC3'?3:1,read=a.componentType===5126?'readFloatLE':'readUInt32LE';return Array.from({length:a.count*n},(_,i)=>binary[read]((v.byteOffset||0)+(a.byteOffset||0)+i*4));};
  let signedHullVolume=0,outwardSides=0;
  for(const range of hull.ranges){const primitive=glb.meshes[0].primitives.find(p=>glb.materials[p.material].name===range.material),p=attr(primitive.attributes.POSITION),n=attr(primitive.attributes.NORMAL),ix=attr(primitive.indices);
    for(let i=range.indexStart;i<range.indexStart+range.indexCount;i+=3){const a=ix[i]*3,b=ix[i+1]*3,c=ix[i+2]*3;signedHullVolume+=(p[a]*(p[b+1]*p[c+2]-p[b+2]*p[c+1])+p[a+1]*(p[b+2]*p[c]-p[b]*p[c+2])+p[a+2]*(p[b]*p[c+1]-p[b+1]*p[c]))/6;}
    for(let i=range.indexStart;i<range.indexStart+range.indexCount;i++){const v=ix[i]*3;if(Math.abs(p[v])<15&&Math.abs(p[v+2])>4){assert(n[v+2]*p[v+2]>0,'hull normals face away from its centerline, not merely agree with inward winding');outwardSides++;}}
  }
  assert(signedHullVolume>1000&&outwardSides>100,'full hull has positive outward orientation');
  for(const mutate of [b=>b.writeUInt32LE(1,0),b=>b.writeUInt32LE(1,8)]){const copy=Buffer.from(buffer);mutate(copy);assert.throws(()=>validateDetailedShip(copy));}
});

test('model validation rejects corrupt buffers and stale component bounds',async()=>{
  const source=await read('generic/merchant-freighter.json');
  for(const mutate of [m=>m.mesh.positions[0]=Infinity,m=>m.mesh.indices[0]=999999,m=>m.mesh.normals[0]=99,m=>m.mesh.colors[0]=2,m=>m.components[0].bounds.min[0]=1000]) {
    const model=structuredClone(source);mutate(model);assert.throws(()=>validatePolygonShip(model));
  }
});
