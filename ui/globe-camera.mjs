import * as THREE from './vendor/three/three.module.js';
import { GLOBE_RADIUS, GLOBE_LAND_RADIUS, geoVector, vectorGeo, tangentFrame } from './globe-geometry.mjs';

export const MAX_GLOBE_ZOOM = 65536;
export const SHIP_DETAIL_ZOOM = 2048;
export const FLEET_FOCUS_ZOOM = 4096;
export const METRES_TO_GLOBE = GLOBE_RADIUS / 6371000;
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const wrap = n => ((n + 180) % 360 + 360) % 360 - 180;

export function globeCameraState(chart) {
  return { longitude: wrap(Number(chart.globeLongitude ?? chart.rotation) || 0),
    latitude: clamp(Number(chart.globeLatitude) || 0, -89.8, 89.8),
    zoom: clamp(Number(chart.zoom) || 1, 1, MAX_GLOBE_ZOOM),
    heading: wrap(Number(chart.globeHeading) || 0),
    tilt: clamp(Number(chart.globeTilt ?? 42), 0, 72) };
}
export function applyGlobeCamera(camera, chart, aspect) {
  const state = globeCameraState(chart), point = [state.longitude, state.latitude];
  const {east, north, up} = tangentFrame(point);
  const heading = state.heading * Math.PI / 180;
  const forward = north.clone().multiplyScalar(Math.cos(heading)).addScaledVector(east, Math.sin(heading));
  const distance = 240 / state.zoom;
  const near = Math.max(.000001, distance / 10);
  // At ship scale the raised coastline is taller than a grazing camera's
  // clearance. Limit that final orbit angle so neither the camera nor its near
  // plane can pass through land when the user zooms over a harbour or continent.
  const safeRadius = GLOBE_LAND_RADIUS + near * 1.05;
  const safePitch = Math.acos(clamp((safeRadius ** 2 - GLOBE_RADIUS ** 2 - distance ** 2) / (2 * GLOBE_RADIUS * distance), -1, 1));
  const pitch = Math.min(safePitch, state.tilt * Math.PI / 180 * clamp(Math.log2(state.zoom) / 5, 0, 1));
  const target = geoVector(point);
  const offset = up.clone().multiplyScalar(Math.cos(pitch)).addScaledVector(forward, -Math.sin(pitch));
  camera.position.copy(target).addScaledVector(offset, distance);
  camera.up.copy(forward).multiplyScalar(Math.cos(pitch)).addScaledVector(up, Math.sin(pitch));
  camera.aspect = aspect; camera.near = near;
  camera.far = distance + GLOBE_RADIUS * 2.1;
  camera.lookAt(target); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  return {...state, effectiveTilt:pitch * 180 / Math.PI, point, target, distance, ...tangentFrame(point)};
}
export function globeRayPoint(raycaster, camera, pointer) {
  raycaster.setFromCamera(pointer, camera);
  return raycaster.ray.intersectSphere(new THREE.Sphere(new THREE.Vector3(), GLOBE_RADIUS), new THREE.Vector3());
}
export function anchorGlobePoint(raycaster, camera, chart, pointer, anchor, aspect) {
  let state;
  for(let i=0;i<8;i++) {
    state=applyGlobeCamera(camera,chart,aspect);
    if(!anchor)break;
    const current=globeRayPoint(raycaster,camera,pointer);if(!current)break;
    const delta=anchor.clone().sub(current);if(delta.lengthSq()<1e-20)break;
    moveGlobe(chart,delta.dot(state.east),delta.dot(state.north));
  }
  return applyGlobeCamera(camera,chart,aspect);
}
export function moveGlobe(chart, eastDistance, northDistance) {
  const state = globeCameraState(chart), {east,north,up} = tangentFrame([state.longitude,state.latitude]);
  const point = up.multiplyScalar(GLOBE_RADIUS).addScaledVector(east,eastDistance).addScaledVector(north,northDistance).normalize();
  const [longitude,latitude] = vectorGeo(point);
  chart.globeLongitude = chart.rotation = longitude;
  chart.globeLatitude = clamp(latitude,-89.8,89.8);
}
// Camera-only motion: never writes positions back to a ship, convoy or save.
export function resetGlobe(chart) {
  Object.assign(chart,{zoom:1,globeLongitude:0,globeLatitude:0,globeHeading:0,globeTilt:42,rotation:0,cx:600,cy:300});
}
