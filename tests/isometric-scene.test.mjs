import test from 'node:test';
import assert from 'node:assert/strict';
import { sceneCamera, scenePoint, sceneInverse, sceneZoomAt, fleetHullInstances, ownFleetScene,
  intersectsViewport, containsPoint, formationBounds, translatedBounds, waterFormationAnchor,
  landIntegral, clearWaterRectangle, MAX_SCENE_ZOOM } from '../ui/isometric-math.mjs';
import { voxelFaces, voxelBounds, voxelRaster, drawVoxelShip } from '../ui/voxel-renderer.mjs';

test('same-size scene remount restores foreground and background canvas backing resolution', async () => {
  const { IsometricScene } = await import('../ui/isometric-scene.mjs');
  const priorWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const makeCanvas = () => {
    let width = 300, height = 150;
    return { writes: 0, get width() { return width; }, set width(value) { width = value; this.writes++; },
      get height() { return height; }, set height(value) { height = value; this.writes++; } };
  };
  try {
    for (const dpr of [1, 1.25, 2]) {
      Object.defineProperty(globalThis, 'window', { value: {devicePixelRatio:dpr}, configurable:true });
      const width = 1920, height = 1080;
      const scene = { surface: { getBoundingClientRect: () => ({width,height,left:0,top:0}), style: {setProperty() {}} },
        root: {querySelector: () => null}, canvas: makeCanvas(), background: makeCanvas(),
        spriteCache: new Map([['obsolete',{}]]), backgroundKey:'old' };
      IsometricScene.prototype.resize.call(scene);
      assert.equal(scene.canvas.width, Math.ceil(width*dpr));
      assert.equal(scene.canvas.height, Math.ceil(height*dpr));
      assert.equal(scene.background.width, Math.ceil(width*dpr));
      assert.equal(scene.background.height, Math.ceil(height*dpr));
      const retained = scene.canvas, oldBackground = scene.background, writes = retained.writes;
      IsometricScene.prototype.resize.call(scene);
      assert.equal(retained.writes, writes, 'unchanged canvases retain their pixel buffers');
      // Returning to the title screen removes the surface. New/Continue mounts
      // fresh HTML canvases but preserves the scene's cached CSS dimensions.
      scene.canvas = makeCanvas(); scene.background = makeCanvas();
      scene.spriteCache.set('obsolete',{}); scene.backgroundKey = 'old';
      assert.equal(scene.width,width); assert.equal(scene.height,height); assert.equal(scene.dpr,dpr);
      IsometricScene.prototype.resize.call(scene);
      for (const canvas of [scene.canvas,scene.background]) {
        assert.equal(canvas.width,Math.ceil(width*dpr),'replacement canvas backing width matches the display');
        assert.equal(canvas.height,Math.ceil(height*dpr),'replacement canvas backing height matches the display');
      }
      assert.equal(scene.spriteCache.size,0); assert.equal(scene.backgroundKey,'');
      assert.equal(retained.writes,writes,'detached foreground buffer is not reused');
      assert.equal(oldBackground.width,Math.ceil(width*dpr));
    }
  } finally {
    if (priorWindow) Object.defineProperty(globalThis,'window',priorWindow);
    else delete globalThis.window;
  }
});

test('isometric atlas picking and cursor zoom invert the same camera at every level and viewport', () => {
  for (const width of [768, 1100, 1366, 1920]) for (const zoom of [1, 3, 10, 24, 64, 128, 256]) {
    const viewport = { x: 170, y: 180, width: width - 350, height: 520 };
    const chart = { cx: 621, cy: 187, zoom };
    const camera = sceneCamera(chart, viewport);
    const centre = scenePoint(camera, [chart.cx, chart.cy]);
    const east = scenePoint(camera, [chart.cx + 10, chart.cy]);
    const north = scenePoint(camera, [chart.cx, chart.cy - 10]);
    assert.equal(east[1], centre[1], 'east-west map lines remain horizontal');
    assert.equal(north[0], centre[0], 'north remains directly above the camera centre');
    assert(east[0] > centre[0] && north[1] < centre[1]);
    for (const point of [[600, 300], [0, 0], [1200, 600], [637.58, 52.193]]) {
      const actual = sceneInverse(camera, scenePoint(camera, point));
      assert(Math.hypot(actual[0] - point[0], actual[1] - point[1]) < 1e-9);
    }
    const cursor = [width * .57, 434], before = sceneInverse(camera, cursor);
    sceneZoomAt(chart, viewport, cursor, zoom * 1.5);
    const after = sceneInverse(sceneCamera(chart, viewport), cursor);
    assert(Math.hypot(after[0] - before[0], after[1] - before[1]) < 1e-9, 'zoom preserves the point beneath the cursor');
    assert(chart.zoom >= 1 && chart.zoom <= MAX_SCENE_ZOOM);
  }
});

test('close-up hull culling preserves visible bows and uses the same bounds as drawing and picking', async () => {
  const { sceneHullProjection } = await import('../ui/isometric-scene.mjs');
  const model = { dimensions: {length:270}, parts: [
    {x:0,y:0,z:0,w:270,d:32,h:9,color:'#809695'},
    {x:10,y:0,z:9,w:30,d:18,h:30,color:'#9ba9a3'},
  ] };
  const viewport = {width:1920,height:1080};
  const camera = sceneCamera({zoom:MAX_SCENE_ZOOM}, viewport);
  const position = [-150,400], projection = sceneHullProjection(model,camera,position);
  const actual = voxelBounds(voxelFaces(model,projection));
  for (const key of ['width','height']) assert(Math.abs(actual[key]-projection.bounds[key])<1e-9);
  assert(Math.abs(actual.x+position[0]-projection.bounds.x)<1e-9);
  assert(Math.abs(actual.y+position[1]-projection.bounds.y)<1e-9);
  assert(intersectsViewport(projection.bounds,viewport),'visible bow remains drawn even with centre beyond the old 100px margin');
  assert(containsPoint(projection.bounds,[1,projection.bounds.y+projection.bounds.height/2]),'visible portion remains selectable');
  const distant = sceneHullProjection(model,camera,[-2000,400]);
  assert(!intersectsViewport(distant.bounds,viewport),'fully offscreen hulls still skip raster work');
  const oldLimit = sceneHullProjection(model,sceneCamera({zoom:64},viewport),position);
  assert.equal(projection.bounds.width/oldLimit.bounds.width,4,'256× displays ships four times larger than the previous zoom limit');
});

test('fleet level includes every surviving own hull with stable instance identity and excludes foreign intelligence', () => {
  const groups = [
    { id: 'a', fleetId: 'fleet', classId: 'dd', name: 'Destroyers', count: 612, status: 'active' },
    { id: 'b', fleetId: 'fleet', classId: 'bb', name: 'Capital ships', count: 2, status: 'returning', shipNames: ['Ship One', 'Ship Two'] },
    { id: 'c', fleetId: 'fleet', classId: 'ss', name: 'Lost', count: 5, status: 'sunk' },
    { id: 'd', fleetId: 'elsewhere', classId: 'ss', name: 'Elsewhere', count: 20, status: 'active' },
    { id: 'e', fleetId: 'fleet', classId: 'bb', name: 'Unbuilt', count: 1, status: 'building' },
  ];
  const hulls = fleetHullInstances(groups, 'fleet');
  assert.equal(hulls.length, 614, 'large flotillas are never silently capped');
  assert.equal(new Set(hulls.map(h => h.key)).size, 614);
  assert.equal(hulls.at(-1).label, 'Ship Two'); assert.equal(hulls.at(-1).hullIndex, 1);
  assert.deepEqual(hulls.map(h => h.offset), fleetHullInstances(groups, 'fleet').map(h => h.offset));
  const state = { player: 'USA', nations: { USA: { groups, fleets: [{ id: 'fleet' }] },
    JPN: { groups: [{ id: 'secret', fleetId: 'enemy', count: 50, status: 'active' }], fleets: [{ id: 'enemy' }] } } };
  const model = ownFleetScene(state); assert.equal(model.length, 1); assert.equal(model[0].hulls.length, 614);
  assert(!JSON.stringify(model).includes('secret'), 'the world renderer cannot obtain enemy hulls from its scene model');
});

test('voxel cuboids retain coherent faces, bounds, and pick rectangles in four headings', () => {
  const model = { id: 'test', parts: [
    { x: 0, y: 0, z: 0, w: 130, d: 17, h: 7, color: '#809695', role: 'hull' },
    { x: 8, y: 0, z: 7, w: 12, d: 8, h: 18, color: '#9ba9a3', role: 'bridge' },
  ] };
  for (const heading of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    const faces = voxelFaces(model, { heading, scale: .5 });
    const bounds = voxelBounds(faces);
    assert.equal(faces.length, 6); assert(bounds.width > 40 && bounds.height > 20);
    assert(faces.every(f => f.points.every(p => p.every(Number.isFinite))));
    assert(faces.every((f, i) => !i || f.depth >= faces[i - 1].depth));
    for (const f of faces) for (const p of f.points) assert(containsPoint(bounds, p, 1e-9));
    const methods = ['save', 'restore', 'translate', 'beginPath', 'ellipse', 'stroke', 'moveTo', 'lineTo', 'closePath', 'fill'];
    const ctx = Object.fromEntries(methods.map(name => [name, () => {}])); ctx.globalAlpha = 1;
    const drawn = drawVoxelShip(ctx, model, { x: 200, y: 150, scale: .5, heading, selected: true });
    assert.equal(drawn.x, bounds.x + 200); assert.equal(drawn.y, bounds.y + 150);
    assert(intersectsViewport(drawn, { width: 400, height: 300 }));
    assert(!intersectsViewport(drawn, { x: 600, y: 600, width: 100, height: 100 }));
  }
});

test('per-pixel voxel depth keeps long decks above hulls regardless of model part order', () => {
  const parts = [
    { x: 0, y: 0, z: 0, w: 180, d: 24, h: 12, color: '#805040', role: 'hull' },
    { x: 0, y: 0, z: 20, w: 200, d: 32, h: 3, color: '#709090', role: 'flight-deck' },
    { x: -14, y: 10, z: 23, w: 25, d: 7, h: 18, color: '#a0a0a0', role: 'island' },
  ];
  for (const heading of [0, .47, 1.4, 3.8]) {
    const a = voxelRaster({ parts }, { heading, scale: .45, pixelRatio: 2 });
    const b = voxelRaster({ parts: [...parts].reverse() }, { heading, scale: .45, pixelRatio: 2 });
    assert.deepEqual(a.data, b.data);
    assert(a.data.some((value, i) => i % 4 === 3 && value === 255), 'raster contains an opaque ship');
  }
});

test('harbour review formations remain entirely in clear water without losing hulls or overlapping another force', () => {
  const width = 160, height = 100, pixels = new Uint8ClampedArray(width * height * 4);
  // A mainland coast at x=70 and an offshore island at x=100..107.
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++)
    if (x < 70 || x >= 100 && x < 108 && y >= 35 && y < 65) pixels[(y * width + x) * 4 + 3] = 255;
  const mask = landIntegral(pixels, width, height), clear = bounds => clearWaterRectangle(mask, bounds);
  assert(!clear({x:67,y:30,width:5,height:5})); assert(clear({x:74,y:30,width:5,height:5}));
  const groups = [{id:'harbour',fleetId:'f',classId:'bb',name:'Squadron',status:'active',count:25}],
    hulls = fleetHullInstances(groups, 'f'), before = structuredClone(hulls), bounds = formationBounds(hulls), preferred = [68, 50];
  const first = waterFormationAnchor(preferred, bounds, clear);
  const rectangle = translatedBounds(bounds, first);
  assert(clear(rectangle)); assert(first[0] > preferred[0], 'the formation moves seaward');
  assert.deepEqual(hulls, before, 'review placement does not mutate hulls, counts or simulation positions');
  assert.deepEqual(waterFormationAnchor(preferred, bounds, clear), first, 'placement is deterministic');
  const second = waterFormationAnchor(preferred, bounds, clear, [rectangle]);
  assert(clear(translatedBounds(bounds, second)));
  assert(!intersectsViewport(translatedBounds(bounds, second), rectangle, 1));
  let queries = 0;
  const cached = waterFormationAnchor(preferred, bounds, b => { queries++; return clear(b); }, [], [first[0] - preferred[0], first[1] - preferred[1]]);
  assert.deepEqual(cached, first); assert(queries <= 2, 'animation reuses a valid water layout with at most two mask lookups');
  const large = fleetHullInstances([{...groups[0],count:614}], 'f');
  const largeBounds = formationBounds(large), largeAnchor = waterFormationAnchor(preferred, largeBounds, clear);
  assert.equal(large.length,614); assert(clear(translatedBounds(largeBounds,largeAnchor)));
});
