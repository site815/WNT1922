import * as THREE from './vendor/three/three.module.js';

export const GLOBE_RADIUS = 100;
export const GLOBE_LAND_RADIUS = GLOBE_RADIUS + .002;
const RAD = Math.PI / 180, DEG = 180 / Math.PI;
const CELL = .006; // At most 0.487 degrees across a cell's spherical diagonal.
const cache = new WeakMap();
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const wrap = x => ((x + 180) % 360 + 360) % 360 - 180;

// Longitude zero faces +Z, north is +Y, and east at Greenwich is +X.
export function geoVector([longitude, latitude], radius = GLOBE_RADIUS) {
  const lon = longitude * RAD, lat = latitude * RAD, c = Math.cos(lat);
  return new THREE.Vector3(radius * c * Math.sin(lon), radius * Math.sin(lat), radius * c * Math.cos(lon));
}
export function vectorGeo(vector) {
  const length = Math.hypot(vector.x, vector.y, vector.z);
  if (!length || !Number.isFinite(length)) return [0, 0];
  return [wrap(Math.atan2(vector.x, vector.z) * DEG), Math.asin(clamp(vector.y / length, -1, 1)) * DEG];
}
export function tangentFrame(point) {
  const lon = point[0] * RAD, up = geoVector(point, 1);
  const east = new THREE.Vector3(Math.cos(lon), 0, -Math.sin(lon));
  return {east, north:new THREE.Vector3().crossVectors(up, east).normalize(), up};
}

function cleanRing(coordinates) {
  const finite = coordinates.filter(p => Number.isFinite(p?.[0]) && Number.isFinite(p?.[1]));
  const poles = finite.filter(p => Math.abs(p[1]) > 89.9);
  // Natural Earth's Antarctica closes a flat map with an artificial meridian
  // and two pole vertices. On a globe its coastline closes directly instead.
  const artificialPole = poles.length > 1 && Math.max(...poles.map(p => p[0])) - Math.min(...poles.map(p => p[0])) > 359;
  const points = artificialPole ? finite.filter(p => Math.abs(p[1]) <= 89.9) : finite;
  const vectors = [];
  for (const p of points) {
    const v = geoVector(p, 1);
    if (!vectors.length || v.distanceToSquared(vectors.at(-1)) > 1e-20) vectors.push(v);
  }
  if (vectors.length > 1 && vectors[0].distanceToSquared(vectors.at(-1)) < 1e-20) vectors.pop();
  return vectors;
}
const toPlane = (unit, frame) => {
  const d = unit.dot(frame.up);
  return d > 1e-9 ? new THREE.Vector2(unit.dot(frame.east) / d, unit.dot(frame.north) / d) : null;
};
const fromPlane = (x, y, frame) => frame.up.clone().addScaledVector(frame.east, x).addScaledVector(frame.north, y).normalize();

function polygonFrame(rings, feature) {
  const vectors = rings.map(cleanRing).filter(r => r.length >= 3);
  if (!vectors.length) return null;
  const centre = vectors[0].reduce((sum, p) => sum.add(p), new THREE.Vector3()).normalize();
  if (!centre.lengthSq()) return null;
  const frame = tangentFrame(vectorGeo(centre));
  const projected = vectors.map(ring => ring.map(p => toPlane(p, frame)));
  // The source map's largest polygon is well within a hemisphere. Explicitly
  // reject unsupported antipodal rings instead of producing folded/NaN land.
  if (projected.some(ring => ring.some(p => !p))) throw new Error('Globe polygon exceeds one hemisphere: ' + (feature.id || feature.name));
  const minDot = Math.min(...vectors[0].map(p => p.dot(frame.up)));
  const angularRadius = Math.acos(clamp(minDot, -1, 1)) * DEG;
  const [lon, lat] = vectorGeo(frame.up), reachesPole = Math.abs(lat) + angularRadius >= 89.999;
  const longitudeRadius = reachesPole ? 180 : Math.asin(clamp(Math.sin(angularRadius * RAD) / Math.cos(lat * RAD), -1, 1)) * DEG;
  return {feature, frame, vectors, rings:projected, minDot,
    bounds:{lon, latitudeMin:Math.max(-90, lat-angularRadius), latitudeMax:Math.min(90, lat+angularRadius), longitudeRadius}};
}

function prepared(political) {
  if (cache.has(political)) return cache.get(political);
  const polygons = [], bins = Array.from({length:36 * 18}, () => []);
  for (const feature of political.features || []) {
    if (!feature.geometry || !['Polygon','MultiPolygon'].includes(feature.geometry.type)) continue;
    const coordinates = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    for (const rings of coordinates) {
      const polygon = polygonFrame(rings, feature); if (!polygon) continue;
      polygons.push(polygon);
      const b = polygon.bounds;
      for (let y = 0; y < 18; y++) {
        if (-90 + (y + 1) * 10 < b.latitudeMin || -90 + y * 10 > b.latitudeMax) continue;
        for (let x = 0; x < 36; x++) {
          const centre = -175 + x * 10;
          if (b.longitudeRadius < 180 && Math.abs(wrap(centre-b.lon)) > b.longitudeRadius + 5) continue;
          bins[y*36+x].push(polygon);
        }
      }
    }
  }
  const result = {polygons, bins}; cache.set(political, result); return result;
}

function inRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[j], b = ring[i], dx = b.x-a.x, dy = b.y-a.y;
    const cross = (point.x-a.x)*dy - (point.y-a.y)*dx;
    if (Math.abs(cross) < 1e-12 && point.x >= Math.min(a.x,b.x)-1e-12 && point.x <= Math.max(a.x,b.x)+1e-12 &&
      point.y >= Math.min(a.y,b.y)-1e-12 && point.y <= Math.max(a.y,b.y)+1e-12) return true;
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x) inside = !inside;
  }
  return inside;
}
export function pointOnGlobeLand(point, political) {
  if (!political || !Number.isFinite(point?.[0]) || !Number.isFinite(point?.[1])) return false;
  const longitude = wrap(point[0]), latitude = clamp(point[1], -90, 90), unit = geoVector([longitude,latitude],1);
  const x = Math.min(35,Math.floor((longitude+180)/10)), y = Math.min(17,Math.floor((latitude+90)/10));
  for (const p of prepared(political).bins[y*36+x]) {
    if (unit.dot(p.frame.up) < p.minDot - 1e-10) continue;
    const q = toPlane(unit,p.frame);
    if (q && inRing(q,p.rings[0]) && !p.rings.slice(1).some(ring => inRing(q,ring))) return true;
  }
  return false;
}

function clipAxis(points, axis, edge, greater) {
  if (!points.length) return points;
  const out = [];
  let a = points.at(-1), ai = greater ? a[axis] >= edge : a[axis] <= edge;
  for (const b of points) {
    const bi = greater ? b[axis] >= edge : b[axis] <= edge;
    if (ai !== bi) {
      const t = (edge-a[axis]) / (b[axis]-a[axis]);
      out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);
    }
    if (bi) out.push(b);
    a = b; ai = bi;
  }
  return out;
}
function pushTriangle(target, normals, a, b, c, radius = GLOBE_LAND_RADIUS) {
  // Test winding after GPU precision conversion: tiny coastal slivers can
  // otherwise collapse or invert when their vertices become Float32 values.
  const units = [a,b,c], points = units.map(v=>new THREE.Vector3(Math.fround(v.x*radius),Math.fround(v.y*radius),Math.fround(v.z*radius)));
  const normal = new THREE.Vector3().crossVectors(points[1].clone().sub(points[0]),points[2].clone().sub(points[0]));
  const sign = normal.dot(points[0]);
  if (normal.lengthSq() < 1e-20 || Math.abs(sign) < 1e-15) return;
  for (const index of sign > 0 ? [0,1,2] : [0,2,1]) {
    const p = points[index], v = units[index];
    target.push(p.x,p.y,p.z); normals.push(v.x,v.y,v.z);
  }
}
function tessellate(polygon, positions, normals) {
  const contour = polygon.rings[0].map(p=>p.clone()), holes = polygon.rings.slice(1).map(r=>r.map(p=>p.clone()));
  const faces = THREE.ShapeUtils.triangulateShape(contour,holes), vertices = contour.concat(...holes);
  // Clip each triangle to the same fine grid. Unlike recursive four-way
  // subdivision this does not explode long, thin coastal triangles, and both
  // sides of every internal edge share their grid intersections.
  for (const face of faces) {
    const triangle = face.map(i=>[vertices[i].x,vertices[i].y]);
    const firstY = Math.floor(Math.min(...triangle.map(p=>p[1])) / CELL), lastY = Math.floor(Math.max(...triangle.map(p=>p[1])) / CELL);
    for (let y = firstY; y <= lastY; y++) {
      const strip = clipAxis(clipAxis(triangle,1,y*CELL,true),1,(y+1)*CELL,false); if (strip.length < 3) continue;
      const firstX = Math.floor(Math.min(...strip.map(p=>p[0])) / CELL), lastX = Math.floor(Math.max(...strip.map(p=>p[0])) / CELL);
      for (let x = firstX; x <= lastX; x++) {
        const cell = clipAxis(clipAxis(strip,0,x*CELL,true),0,(x+1)*CELL,false); if (cell.length < 3) continue;
        const units = cell.map(p=>fromPlane(p[0],p[1],polygon.frame));
        for (let i = 1; i < units.length-1; i++) pushTriangle(positions,normals,units[0],units[i],units[i+1]);
      }
    }
  }
}
function boundaryGeometry(polygons) {
  const sides = [], borders = [], r = GLOBE_LAND_RADIUS;
  for (const p of polygons) for (const ring of p.vectors) for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i+1)%ring.length], steps = Math.max(1,Math.ceil(a.angleTo(b)/(.25*RAD)));
    for (let j = 0; j < steps; j++) {
      const u = a.clone().lerp(b,j/steps).normalize(), v = a.clone().lerp(b,(j+1)/steps).normalize();
      for (const [q,h] of [[u,r],[u,GLOBE_RADIUS-.00001],[v,r],[v,r],[u,GLOBE_RADIUS-.00001],[v,GLOBE_RADIUS-.00001]]) sides.push(q.x*h,q.y*h,q.z*h);
      for (const q of [u,v]) borders.push(q.x*(r+.0003),q.y*(r+.0003),q.z*(r+.0003));
    }
  }
  return {sides,borders};
}
export function globeTerrain(political) {
  const group = new THREE.Group(); group.name = 'Globe terrain'; group.userData.radius = GLOBE_LAND_RADIUS;
  const polygons = prepared(political).polygons, features = new Map();
  for (const p of polygons) {
    if (!features.has(p.feature.id)) features.set(p.feature.id,{feature:p.feature,positions:[],normals:[]});
    const row = features.get(p.feature.id); tessellate(p,row.positions,row.normals);
  }
  for (const {feature,positions,normals} of features.values()) {
    if (!positions.length) continue;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3)); geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:feature.color || '#83998c',roughness:.95,metalness:0}));
    mesh.name = feature.name || feature.id;
    mesh.userData = {kind:'territory',id:feature.id,label:feature.name || feature.id,owner:feature.owner};
    group.add(mesh);
  }
  const {sides,borders} = boundaryGeometry(polygons);
  const sideGeometry = new THREE.BufferGeometry(); sideGeometry.setAttribute('position',new THREE.Float32BufferAttribute(sides,3));sideGeometry.computeVertexNormals();
  const coast = new THREE.Mesh(sideGeometry,new THREE.MeshStandardMaterial({color:'#526657',roughness:1,side:THREE.DoubleSide}));
  coast.name = 'Raised coastline walls'; coast.userData.kind = 'coast'; group.add(coast);
  const borderGeometry = new THREE.BufferGeometry(); borderGeometry.setAttribute('position',new THREE.Float32BufferAttribute(borders,3));
  const lines = new THREE.LineSegments(borderGeometry,new THREE.LineBasicMaterial({color:'#cad5b8',transparent:true,opacity:.32,depthWrite:false}));
  lines.name = 'Political borders'; lines.userData.kind = 'borders'; group.add(lines);
  return group;
}

export function globeGraticule() {
  const positions = [], radius = GLOBE_RADIUS + .0005;
  const line = points => {for (let i=1;i<points.length;i++)for(const p of [points[i-1],points[i]]) {const v=geoVector(p,radius);positions.push(v.x,v.y,v.z);}};
  // The grid shares the actual spherical surface. No flat backdrop or seam.
  for(let lon=-180;lon<180;lon+=30) line(Array.from({length:721},(_,i)=>[lon,-90+i*.25]));
  for(let lat=-60;lat<=60;lat+=30) line(Array.from({length:1441},(_,i)=>[-180+i*.25,lat]));
  const geometry = new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  const result = new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:'#86b8bf',transparent:true,opacity:.18,depthWrite:false}));
  result.name = 'Geographic globe grid';result.userData.kind='graticule';return result;
}
