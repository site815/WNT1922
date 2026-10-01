import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {coastlineIndex, geometryRings, readNaturalEarthRings, restoreCoastlines, ringCrossings, sourceCoastBetween} from '../tools/restore-map-coastlines.mjs';

const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const key = p => p.map(n => n.toFixed(6)).join(',');
const sourceBytes = fs.readFileSync(new URL('../assets/maps/natural-earth-map-units.zip', import.meta.url));
const sourceRings = readNaturalEarthRings(sourceBytes), index = coastlineIndex(sourceRings);
const geometryBytes = fs.readFileSync(new URL('../assets/maps/geometry.json', import.meta.url));
const geometry = JSON.parse(geometryBytes);

test('coast restoration reinserts source vertices without moving retained endpoints', () => {
  const raw = [{record:0, points:[[0,0],[.3,.015],[.7,-.013],[1,0],[1,1],[0,1]]}];
  const before = {geometry:{historic:{type:'Polygon',coordinates:[[[0,0],[1,0],[1,1],[0,1],[0,0]]]}}};
  const result = restoreCoastlines(before, coastlineIndex(raw));
  assert.deepEqual(result.document.geometry.historic.coordinates[0], [[0,0],[.3,.015],[.7,-.013],[1,0],[1,1],[0,1],[0,0]]);
  assert.deepEqual(before.geometry.historic.coordinates[0], [[0,0],[1,0],[1,1],[0,1],[0,0]]);
  assert.equal(result.stats.insertedPoints, 2);
  assert.equal(restoreCoastlines(result.document, coastlineIndex(raw)).stats.insertedPoints, 0);
});

test('shared source land borders and unmatched historical cuts remain unchanged', () => {
  const raw = [
    {record:0,points:[[0,0],[.3,.015],[.7,-.013],[1,0],[1,1],[0,1]]},
    {record:1,points:[[1,0],[.7,-.013],[.3,.015],[0,0],[0,-1],[1,-1]]},
  ];
  const shared = coastlineIndex(raw);
  assert.equal(sourceCoastBetween([0,0],[1,0],shared),null);
  assert.equal(sourceCoastBetween([0,0],[.95,.05],shared),null);
  const distorted = coastlineIndex([{record:0,points:[[0,0],[.5,.3],[1,0],[1,1],[0,1]]}]);
  assert.equal(sourceCoastBetween([0,0],[1,0],distorted),null,'a straight authored cut must not follow a distant natural coast');
});

test('shared-border repair gives unequally simplified neighbours identical source edge chains', () => {
  const raw = [
    {record:0,points:[[0,0],[.3,.015],[.7,-.013],[1,0],[1,1],[0,1]]},
    {record:1,points:[[1,0],[.7,-.013],[.3,.015],[0,0],[0,-1],[1,-1]]},
  ];
  const before={geometry:{a:{type:'Polygon',coordinates:[[[0,0],[1,0],[1,1],[0,1],[0,0]]]},b:{type:'Polygon',coordinates:[[[1,0],[.7,-.013],[0,0],[0,-1],[1,-1],[1,0]]]}}};
  const restored=restoreCoastlines(before,coastlineIndex(raw),{sharedBorders:true});
  assert.deepEqual(restored.document.geometry.a.coordinates[0].slice(0,4),restored.document.geometry.b.coordinates[0].slice(0,4).toReversed());
  assert.equal(restored.stats.insertedPoints,3);
  assert.equal(restoreCoastlines(restored.document,coastlineIndex(raw),{sharedBorders:true}).stats.insertedPoints,0);
  assert.equal(sourceCoastBetween([0,0],[.95,.05],coastlineIndex(raw),{sharedBorders:true}),null,'unmatched authored endpoint stays untouched');
});

test('adjacent or ambiguous source points never invent a loop around small islands', () => {
  const island = coastlineIndex([{record:0,points:[[0,0],[.02,0],[.01,.01]]}]);
  assert.equal(sourceCoastBetween([0,0],[.02,0],island),null);
  const ambiguous = coastlineIndex([{record:0,points:[[.0003,0],[.0004,.0001],[.02,.01],[.04,0],[.04,1],[0,1]]}]);
  assert.equal(sourceCoastBetween([0,0],[.04,0],ambiguous),null);
});

test('legacy rounded island endpoints cannot create new self-intersections', () => {
  const island = geometryRings(geometry.geometry.c350)[24];
  const before = {geometry:{island:{type:'Polygon',coordinates:[island]}}};
  const restored = restoreCoastlines(before,index);
  assert.equal(restored.stats.ringsPreservedForTopology,1,'this real Greek island would cross its retained endpoint after naive source reinsertion');
  assert.deepEqual(restored.document,before);
});

test('restored global display geometry keeps every campaign identity and ring topology', () => {
  const shape = Object.entries(geometry.geometry).map(([id,g]) => [id,g.type,g.type === 'Polygon' ? [g.coordinates.length] : g.coordinates.map(p=>p.length)]);
  assert.equal(sha(JSON.stringify(shape)),'c77c3836aa7c04817453c277e4e096346fd2595d22ba34e9a01804d641a9e45c');
  let points = 0, crossings = 0;
  const sourcePoints = new Set(sourceRings.flatMap(r=>r.points.map(key)));
  for (const [id,g] of Object.entries(geometry.geometry)) for (const ring of geometryRings(g)) {
    assert.deepEqual(ring[0],ring.at(-1),`${id} closed boundary`);
    points += ring.length;
    crossings += ringCrossings(ring);
    for (let i=1;i<ring.length;i++) assert.notDeepEqual(ring[i],ring[i-1],`${id} duplicate consecutive point`);
    // Original authored coordinates use 3 decimals. All finer added detail
    // must be an actual source vertex, not a smoothed/invented coast shape.
    for (const point of ring) if (point.some(n=>Math.abs(n*1000-Math.round(n*1000))>1e-7)) assert(sourcePoints.has(key(point)),`${id}: ${point} is not a source vertex`);
  }
  assert.equal(points,geometry.sharedBorderRestoration.afterPoints);
  assert(points > 90000 && points < 100000,'restore pinned source detail without inventing extra geometry');
  assert.equal(crossings,1,'only the original authored historical crossing remains; no new coastal self-intersections');
  assert.equal(restoreCoastlines(geometry,index).stats.insertedPoints,0,'restoration must be idempotent');
  assert.equal(restoreCoastlines(geometry,index,{sharedBorders:true}).stats.insertedPoints,0,'shared-border restoration must be idempotent');
});

test('Alpine viewport has no holes between France, Italy and Switzerland, including their junction', () => {
  const polygons=['c220','c325','ne_CHE'].flatMap(id=>{const g=geometry.geometry[id];return g.type==='Polygon'?[g.coordinates]:g.coordinates;});
  const bounded=polygons.map(rings=>({rings,minX:Math.min(...rings[0].map(p=>p[0])),maxX:Math.max(...rings[0].map(p=>p[0])),minY:Math.min(...rings[0].map(p=>p[1])),maxY:Math.max(...rings[0].map(p=>p[1]))})).filter(p=>p.maxX>=6.6&&p.minX<=8.4&&p.maxY>=45.5&&p.minY<=46.5);
  const inside=(x,y,ring)=>{let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
  let uncovered=0;
  for(let row=0;row<400;row++)for(let column=0;column<720;column++){
    const x=6.6+(column+.5)*.0025,y=45.5+(row+.5)*.0025;
    if(!bounded.some(p=>x>=p.minX&&x<=p.maxX&&y>=p.minY&&y<=p.maxY&&inside(x,y,p.rings[0])&&!p.rings.slice(1).some(r=>inside(x,y,r))))uncovered++;
  }
  assert.equal(uncovered,0,'288,000 source-land samples must not expose water wedges at simplified national borders');
  // Compare exact edge coordinates too: sampled coverage alone cannot reveal
  // subpixel cracks from six-decimal inserts beside three-decimal endpoints.
  const edges=new Map();
  for(const [owner,rings] of polygons.entries())for(const ring of rings)for(let i=1;i<ring.length;i++){
    const a=ring[i-1],b=ring[i],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    if(mid[0]<=6.6||mid[0]>=8.4||mid[1]<=45.5||mid[1]>=46.5)continue;
    const k=[JSON.stringify(a),JSON.stringify(b)].sort().join('|');
    if(!edges.has(k))edges.set(k,new Set());edges.get(k).add(owner);
  }
  assert(edges.size>20);
  for(const [edge,owners] of edges)assert.equal(owners.size,2,'shared exact Alpine edge '+edge);
});

test('regional coast detail and source/manifest provenance remain verifiable', () => {
  const count = id => geometryRings(geometry.geometry[id]).reduce((n,r)=>n+r.length,0);
  assert(count('c325') >= 470,'Italy coastline detail (was 213 points)');
  assert(count('c350') >= 800,'Greek coastline detail (was 357 points)');
  assert(count('ne_ESP') >= 390,'Spanish coastline detail (was 186 points)');
  assert.equal(geometry.sourceSha256,sha(sourceBytes));
  assert.equal(geometry.coastlineRestoration.sourceSha256,sha(sourceBytes));
  assert.equal(geometry.sharedBorderRestoration.sourceSha256,sha(sourceBytes));
  assert.equal(geometry.sharedBorderRestoration.previousGeometrySha256,'336d5a661b2d1123db7350f74628632f8b2736ee7d0d6c4c8983b1f2e8f71b75');
  assert.equal(geometry.coastlineRestoration.previousGeometrySha256,'5d953b9893a13bd1d8eadc12c2c7e1991cff6758d4c72e434c1537b099e39f7a');
  const manifest = JSON.parse(fs.readFileSync(new URL('../assets/manifest.json',import.meta.url)));
  const entry = manifest.assets.find(a=>a.path==='assets/maps/geometry.json');
  assert.equal(entry.sha256,sha(geometryBytes));
  assert.equal(entry.bytes,geometryBytes.length);
  const navigation = fs.readFileSync(new URL('../assets/maps/navigation-mask.geojson',import.meta.url));
  assert.equal(sha(navigation),'9e0729ee253ca7d7a5c4ae9395fb1902264c5377c52e224d13dd85010e2835d9','campaign sea routing mask must not change');
});
