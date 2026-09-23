import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../ui/vendor/three/three.module.js';
import { applyGlobeCamera, globeCameraState, globeRayPoint, anchorGlobePoint, moveGlobe, resetGlobe, MAX_GLOBE_ZOOM, SHIP_DETAIL_ZOOM, METRES_TO_GLOBE } from '../ui/globe-camera.mjs';
import { GLOBE_RADIUS, GLOBE_LAND_RADIUS, geoVector, tangentFrame } from '../ui/globe-geometry.mjs';

test('perspective globe camera stays outside the ocean at ship and strategic scales in every hemisphere',()=>{
  for(const longitude of [-180,-90,0,90,179.99])for(const latitude of [-80,0,80])for(const zoom of [1,32,SHIP_DETAIL_ZOOM,4096,MAX_GLOBE_ZOOM])for(const tilt of [0,42,72]) {
    const camera=new THREE.PerspectiveCamera(44),chart={zoom,globeLongitude:longitude,globeLatitude:latitude,globeTilt:tilt};
    const state=applyGlobeCamera(camera,chart,16/9);
    assert(camera.position.length()>GLOBE_LAND_RADIUS+camera.near,'camera and near plane stay above raised terrain even at maximum zoom and grazing angles');
    assert(camera.near>0&&camera.near<state.distance&&camera.far>state.distance);
    assert(camera.projectionMatrix.elements.every(Number.isFinite));
    const target=geoVector([longitude,latitude]).project(camera);
    assert(Math.hypot(target.x,target.y)<1e-7,'geographic focus remains at the optical centre');
    assert(target.z>-1&&target.z<1);
  }
});

test('globe longitude navigation crosses the date line repeatedly without leaving the map',()=>{
  const chart={zoom:1,globeLongitude:179,globeLatitude:0};
  const delta=GLOBE_RADIUS*Math.tan(2*Math.PI/180);
  moveGlobe(chart,delta,0);assert(Math.abs(chart.globeLongitude+179)<1e-8);
  for(let i=0;i<180;i++)moveGlobe(chart,delta,0);
  assert(Math.abs(chart.globeLongitude+179)<1e-8,'a full revolution returns to the same geography');
  for(let i=0;i<181;i++)moveGlobe(chart,-delta,0);
  assert(Math.abs(chart.globeLongitude-179)<1e-8,'reverse navigation crosses the same seam');
  assert.equal(chart.globeLatitude,0);
});

test('real 3D hull dimensions grow continuously under the perspective camera and orbit changes visible geometry',()=>{
  const camera=new THREE.PerspectiveCamera(44),chart={globeLongitude:0,globeLatitude:0,globeTilt:0};
  const length=200*METRES_TO_GLOBE,centre=geoVector([0,0]);
  const east=tangentFrame([0,0]).east;
  const left=centre.clone().addScaledVector(east,-length/2),right=centre.clone().addScaledVector(east,length/2);
  const widths=[];
  for(const zoom of [2048,4096,8192,16384]){chart.zoom=zoom;applyGlobeCamera(camera,chart,16/9);widths.push(left.clone().project(camera).distanceTo(right.clone().project(camera)));}
  for(let i=1;i<widths.length;i++)assert(Math.abs(widths[i]/widths[i-1]-2)<1e-6,'doubling zoom doubles the same physical hull');
  chart.globeHeading=90;applyGlobeCamera(camera,chart,16/9);
  const p=left.clone().project(camera),q=right.clone().project(camera);
  assert(Math.abs(p.y-q.y)>Math.abs(p.x-q.x),'orbit rotates the hull projection, not a fixed sprite');
});

test('camera controls clamp zoom and tilt while leaving campaign state untouched',()=>{
  const chart={zoom:1e20,globeLatitude:99,globeLongitude:721,globeTilt:120,globeHeading:730,fleetId:'keep-me'};
  assert.deepEqual(globeCameraState(chart),{longitude:1,latitude:89.8,zoom:MAX_GLOBE_ZOOM,heading:10,tilt:72});
  resetGlobe(chart);assert.equal(chart.zoom,1);assert.equal(chart.fleetId,'keep-me');assert.equal(chart.globeLongitude,0);
});

test('surface dragging follows the pointer under perspective tilt, orbit and offset viewports',()=>{
  for(const zoom of [4,4096,65536])for(const heading of [0,84,-140])for(const tilt of [0,42,72])for(const latitude of [-60,0,60]) {
    const camera=new THREE.PerspectiveCamera(44),raycaster=new THREE.Raycaster();
    const chart={zoom,globeLongitude:179.9,globeLatitude:latitude,globeHeading:heading,globeTilt:tilt};
    camera.setViewOffset(1300,900,-300,-60,1920,1080);
    applyGlobeCamera(camera,chart,1300/900);
    const before=new THREE.Vector2(950/1920*2-1,1-510/1080*2),after=new THREE.Vector2((950+35)/1920*2-1,1-(510+24)/1080*2);
    const anchor=globeRayPoint(raycaster,camera,before);assert(anchor);
    anchorGlobePoint(raycaster,camera,chart,after,anchor,1300/900);
    const projected=anchor.clone().project(camera);
    assert(Math.hypot((projected.x-after.x)*960,(projected.y-after.y)*540)<.1,`drag stays anchored at zoom ${zoom}, heading ${heading}, tilt ${tilt}, latitude ${latitude}`);
  }
});
