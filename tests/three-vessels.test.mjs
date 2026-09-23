import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { Color, MeshStandardMaterial } from '../ui/vendor/three/three.module.js';
import { voxelGeometry3D, createVoxelMesh, disposeVoxelGeometry3D } from '../ui/three-vessels.mjs';
const close = (a,b) => assert(Math.abs(a-b)<.00005,`${a} != ${b}`);
const source = {id:'asymmetric',name:'Asymmetric test ship',parts:[
  {x:9,y:-3,z:2,w:8,d:4,h:6,color:'#8c4731'},
  {x:-5,y:4,z:0,w:3,d:2,h:3,color:'#96bbd1'},
]};

test('voxel meshes preserve every cuboid in real Y-up geometry with valid face normals and winding', () => {
  const geometry=voxelGeometry3D(source), positions=geometry.attributes.position, normals=geometry.attributes.normal;
  assert.equal(geometry.index,null); assert.equal(positions.count,72);
  assert.deepEqual(geometry.boundingBox.min.toArray(),[-6.5,0,-5]);
  assert.deepEqual(geometry.boundingBox.max.toArray(),[13,8,5]);
  for(let i=0;i<positions.count;i+=3) {
    const p=j=>[positions.getX(j),positions.getY(j),positions.getZ(j)];
    const a=p(i),b=p(i+1).map((v,k)=>v-a[k]),c=p(i+2).map((v,k)=>v-a[k]);
    const cross=[b[1]*c[2]-b[2]*c[1],b[2]*c[0]-b[0]*c[2],b[0]*c[1]-b[1]*c[0]];
    const normal=[normals.getX(i),normals.getY(i),normals.getZ(i)];
    close(Math.hypot(...normal),1); assert(cross.reduce((s,v,k)=>s+v*normal[k],0)>0,'front faces point outward');
  }
  source.parts.forEach((part,index)=>{
    const expected=new Color(part.color), color=geometry.attributes.color;
    close(color.getX(index*36),expected.r);close(color.getY(index*36),expected.g);close(color.getZ(index*36),expected.b);
  });
});

test('shared geometry stays independent of part draw order and supports independent mesh transforms/material injection', () => {
  const a=createVoxelMesh(source),b=createVoxelMesh(source),custom=new MeshStandardMaterial({color:0xffffff});
  const c=createVoxelMesh(source,{material:custom});
  assert.equal(a.geometry,b.geometry); assert.equal(c.material,custom);
  assert(a.material.isMeshStandardMaterial && a.material.vertexColors);
  close(a.material.roughness,.85);close(a.material.metalness,.12);
  a.position.set(10,20,30); assert.deepEqual(b.position.toArray(),[0,0,0]);
  const reversed=voxelGeometry3D({...source,parts:[...source.parts].reverse()});
  assert.deepEqual(reversed.boundingBox,a.geometry.boundingBox);
  const vertices=g=>{const p=g.attributes.position;return Array.from({length:p.count},(_,i)=>[p.getX(i),p.getY(i),p.getZ(i)].join(',')).sort();};
  assert.deepEqual(vertices(reversed),vertices(a.geometry));
  const original=a.geometry;let disposed=false;original.addEventListener('dispose',()=>{disposed=true;});
  disposeVoxelGeometry3D(source); assert(disposed);assert.notEqual(voxelGeometry3D(source),original);
  custom.dispose();disposeVoxelGeometry3D();
});

test('historical and merchant assets become bounded 3D meshes without omitted fine fittings', async () => {
  for(const file of ['gbr/admiral.json','jpn/akagi_cv.json','generic/merchant-freighter.json']) {
    const model=JSON.parse(await fs.readFile('assets/voxels/ships/'+file,'utf8')),geometry=voxelGeometry3D(model);
    assert.equal(geometry.attributes.position.count,model.parts.length*36);
    const box=geometry.boundingBox;
    assert(box.min.x>=-model.dimensions.length/2-.01 && box.max.x<=model.dimensions.length/2+.01);
    assert(box.min.y>=-.01 && box.max.y<=model.dimensions.height+.01);
    assert(box.min.z>=-model.dimensions.beam/2-.01 && box.max.z<=model.dimensions.beam/2+.01);
  }
  disposeVoxelGeometry3D();
});
