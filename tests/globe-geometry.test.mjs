import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../ui/vendor/three/three.module.js';
import {GLOBE_RADIUS,GLOBE_LAND_RADIUS,geoVector,vectorGeo,tangentFrame,globeTerrain,globeGraticule,pointOnGlobeLand} from '../ui/globe-geometry.mjs';
import {POLITICAL,POLITICAL_1922} from '../worker/map-assets.mjs';

const wrap = x => ((x+180)%360+360)%360-180;
const close = (a,b,epsilon=1e-9) => assert(Math.abs(a-b)<epsilon,`${a} ≈ ${b}`);
const feature = (id,coordinates,type='Polygon') => ({id,name:id,owner:'USA',geometry:{type,coordinates}});
const ring = points => [...points,points[0]];
const island = feature('island',[
  ring([[-12,-12],[12,-12],[12,12],[-12,12]]),
  ring([[-4,-4],[-4,4],[4,4],[4,-4]]),
]);
const dateline = feature('dateline',[
  ring([[170,-10],[-170,-10],[-170,10],[170,10]]),
  ring([[176,-3],[176,3],[-176,3],[-176,-3]]),
]);
const polar = feature('polar',[ring([[-180,-75],[-90,-75],[0,-75],[90,-75],[180,-75],[180,-89.999],[-180,-89.999]])]);
const synthetic = {features:[island,dateline,polar]};
const dispose = group => group.traverse(o=>{o.geometry?.dispose();for(const material of [].concat(o.material||[]))material.dispose();});

test('globe coordinates and tangent axes remain finite, invertible and orthonormal across the seam and poles',()=>{
  for(const lon of [-720,-180,-179.999,0,73.22,179.999,540])for(const lat of [-90,-85,-35,0,50,89,90]) {
    const p=geoVector([lon,lat]), result=vectorGeo(p),frame=tangentFrame([lon,lat]);
    close(p.length(),GLOBE_RADIUS);close(wrap(result[0]-lon),0);close(result[1],lat,1e-6);
    for(const axis of Object.values(frame))close(axis.length(),1);
    close(frame.east.dot(frame.north),0);close(frame.east.dot(frame.up),0);close(frame.north.dot(frame.up),0);
    assert(frame.east.clone().cross(frame.north).distanceTo(frame.up)<1e-10,'east × north points away from Earth');
  }
  assert.deepEqual(vectorGeo(new THREE.Vector3()),[0,0]);
  assert(geoVector([0,0]).distanceTo(new THREE.Vector3(0,0,100))<1e-10);
  assert(geoVector([90,0]).distanceTo(new THREE.Vector3(100,0,0))<1e-10);
});

test('offshore land checks preserve holes, antimeridian islands and artificial polar closure',()=>{
  for(const point of [[8,0],[-8,0],[172,0],[-172,0],[180,7],[-180,7],[0,-90],[170,-85],[-170,-85]])
    assert.equal(pointOnGlobeLand(point,synthetic),true,'land at '+point);
  for(const point of [[0,0],[180,0],[-180,0],[360,0],[160,0],[0,-65],[30,20]])
    assert.equal(pointOnGlobeLand(point,synthetic),false,'water/hole at '+point);
  assert.equal(pointOnGlobeLand([NaN,0],synthetic),false);
  const north={features:[feature('north',[ring([[-180,75],[-90,75],[0,75],[90,75],[180,75],[180,89.999],[-180,89.999]])])]};
  assert(pointOnGlobeLand([40,90],north));assert(!pointOnGlobeLand([0,65],north));
  const polarHole={features:[feature('polar-hole',[polar.geometry.coordinates[0],ring([[-180,-85],[-90,-85],[0,-85],[90,-85]])])]};
  assert(!pointOnGlobeLand([120,-90],polarHole));assert(pointOnGlobeLand([0,-80],polarHole));
});

test('spherical territory raycasts agree with land queries on both sides of the dateline and across holes',()=>{
  const terrain=globeTerrain(synthetic),meshes=terrain.children.filter(o=>o.userData.kind==='territory'),ray=new THREE.Raycaster();
  terrain.updateMatrixWorld(true);
  try {
    assert.equal(meshes.length,3);
    for(const point of [[8,0],[-8,0],[0,0],[172,0],[-172,0],[179,0],[-179,0],[180,7],[-180,7],[0,-89],[120,-85],[0,-65],[35,10]]) {
      const unit=geoVector(point,1);ray.set(unit.clone().multiplyScalar(101),unit.clone().negate());
      const hit=ray.intersectObjects(meshes,false).find(h=>h.distance<2);
      assert.equal(Boolean(hit),pointOnGlobeLand(point,synthetic),'mesh/query agreement at '+point);
      if(hit){assert(hit.point.length()>GLOBE_RADIUS,'front territory is above the ocean');assert.equal(hit.object.userData.label,hit.object.userData.id);}
    }
  } finally {dispose(terrain);}
});

test('complete 1922 and 1936 meshes have outward normals and no submerged triangle interiors',()=>{
  const triangle=new THREE.Triangle(),origin=new THREE.Vector3(),nearest=new THREE.Vector3();
  for(const political of [POLITICAL,POLITICAL_1922]) {
    const terrain=globeTerrain(political),meshes=terrain.children.filter(o=>o.userData.kind==='territory');
    try {
      assert.equal(meshes.length,political.features.length,'all source territories retain a pickable mesh');
      let triangles=0,minRadius=Infinity;
      for(const mesh of meshes) {
        const positions=mesh.geometry.attributes.position,normals=mesh.geometry.attributes.normal;
        assert(positions.array.every(Number.isFinite));assert(normals.array.every(Number.isFinite));
        assert.equal(positions.count,normals.count);assert(positions.count>0);
        for(let i=0;i<positions.count;i+=3) {
          triangle.a.fromBufferAttribute(positions,i);triangle.b.fromBufferAttribute(positions,i+1);triangle.c.fromBufferAttribute(positions,i+2);
          triangle.closestPointToPoint(origin,nearest);
          const distance=nearest.length();minRadius=Math.min(minRadius,distance);triangles++;
          assert(distance>GLOBE_RADIUS,`${mesh.userData.id}: land triangle ${i/3} is submerged (${distance})`);
          assert(distance<=GLOBE_LAND_RADIUS+.00002);
          if(triangle.getArea()>1e-10)assert(triangle.getNormal(nearest).dot(triangle.a)>0,'front-facing terrain winding');
        }
      }
      assert(triangles>100000,'curvature is represented by geometry, not flat country fans');
      assert(minRadius>100.0005,'geometric sea clearance survives Float32 rounding');
      assert(terrain.children.some(o=>o.name==='Raised coastline walls'&&o.isMesh));
      for(const point of [[-.12,51.5],[20,20],[37.6,55.8],[133,-25],[120,-89]])assert(pointOnGlobeLand(point,political),'source land '+point);
      for(const point of [[-30,30],[160,0],[-140,-45],[0,0]])assert(!pointOnGlobeLand(point,political),'source sea '+point);
    } finally {dispose(terrain);}
  }
});

test('geographic grid follows a spherical surface with finite, short above-water segments',()=>{
  const grid=globeGraticule(),points=grid.geometry.attributes.position,a=new THREE.Vector3(),b=new THREE.Vector3(),middle=new THREE.Vector3();
  try {
    assert(grid.isLineSegments);assert.equal(grid.userData.kind,'graticule');assert(points.count>20000);
    for(let i=0;i<points.count;i+=2) {
      a.fromBufferAttribute(points,i);b.fromBufferAttribute(points,i+1);
      assert(a.toArray().every(Number.isFinite));assert(b.toArray().every(Number.isFinite));
      assert(a.angleTo(b)<.251*Math.PI/180);
      middle.copy(a).add(b).multiplyScalar(.5);
      assert(middle.length()>GLOBE_RADIUS,'the chord of a grid line stays above water');
    }
  } finally {dispose(grid);}
});
