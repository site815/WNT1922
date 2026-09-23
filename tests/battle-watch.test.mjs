import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {watchFrame, battleInstances, battleWatchView, attritionView, BattleWatchScene} from '../ui/battle-watch.mjs';
import {loadVoxelModels} from '../ui/voxel-models.mjs';
import {battleFitDistance} from '../ui/battle-scene3d.mjs';
import {Box3,Vector3,PerspectiveCamera} from '../ui/vendor/three/three.module.js';

const losses = {sunk:0, planesLost:0, sailorsLost:0, aviatorsLost:0};
const group = (id, count, sunk = 0) => ({id, classId:'queen_elizabeth', name:'Group ' + id, type:'BB', count, sunk, health:.7});
const frame = (at, groupsA = [group('a',3)], groupsB = [group('b',2)]) => ({at, stage:3, round:1, label:'Main action', status:'ongoing', groupsA, groupsB, lossesA:losses, lossesB:losses, deltaA:losses, deltaB:losses});
const report = () => ({id:1,a:'GBR',b:'JPN',startedAt:100,status:'ongoing',replay:{frames:[frame(100),frame(115,[group('a',3,2)])]}});

test('battle frames clamp playback indices and never invent a chronology for older reports', () => {
  const r = report();
  assert.equal(watchFrame(r).frame.at,115);
  assert.equal(watchFrame(r,0).frame.at,100);
  assert.equal(watchFrame(r,-4).index,0);
  assert.equal(watchFrame(r,99).index,1);
  assert.equal(watchFrame(r,.8).index,0);
  assert.equal(watchFrame(r,NaN).index,1);
  const old = {minute:100,completedAt:170,status:'completed',resultA:{conditions:[group('a',3,2)]},resultB:{conditions:[]}};
  const summary = watchFrame(old);
  assert.equal(summary.recorded,false);
  assert.equal(summary.count,0);
  assert.equal(summary.frame.at,170);
  assert.equal(summary.frame.groupsA[0].sunk,2);
});

test('battle formation retains every original hull and stable selection identities after sinking', () => {
  const r = report(), before = structuredClone(r);
  const initial = battleInstances(r.replay.frames[0],r.startedAt), after = battleInstances(r.replay.frames[1],r.startedAt);
  assert.equal(initial.length,5);
  assert.equal(after.length,5);
  assert.deepEqual(after.map(u => u.key),initial.map(u => u.key));
  assert.deepEqual(after.filter(u => u.side === 'A').map(u => u.sunkHull),[false,true,true]);
  assert.equal(new Set(after.map(u => u.key)).size,after.length);
  assert(after.every(u => u.point.every(Number.isFinite)));
  assert(after.filter(u => u.side === 'A').every(u => u.heading === 0));
  assert(after.filter(u => u.side === 'B').every(u => u.heading === Math.PI));
  assert.deepEqual(r,before,'Rendering must never mutate recorded combat state');
  const html = battleWatchView(r,'campaign_1922',{selected:{side:'A',id:'a',hullIndex:2}});
  assert.match(html,/SUNK/);
  assert.match(html,/1 hulls remain afloat/);
  assert.match(html,/hull 3 \/ 3/);
});

test('live and archived playback controls distinguish campaign advancement from recorded ticks', () => {
  const r = report();
  const atStart = battleWatchView(r,'campaign_1922',{frameIndex:0});
  assert.match(atStart,/Next recorded tick/);
  assert.doesNotMatch(atStart,/LIVE · CAMPAIGN PAUSED/);
  const live = battleWatchView(r,'campaign_1922');
  assert.match(live,/Next tick · 15 min/);
  assert.match(live,/LIVE · CAMPAIGN PAUSED/);
  r.status = 'completed';
  assert.match(battleWatchView(r,'campaign_1922'),/data-action="battle-next" disabled/);
  r.replay = {frames:[],archived:true};
  assert.match(battleWatchView(r,'campaign_1922'),/SUMMARY ONLY/);
  assert.match(battleWatchView(r,'campaign_1922'),/data-action="battle-next" disabled/);
  assert.doesNotMatch(battleWatchView(r,'campaign_1922'),/Net loss change this tick/);
});

test('air and shore actions tolerate no ships on one or both sides without phantom hulls or selection', () => {
  const r = report(); r.airOperation = {strikes:36,escorts:12}; r.portId = 'example_port';
  r.replay.frames = [frame(100,[],[])];
  r.replay.frames[0].aircraftA = [{model:'recorded_striker',role:'strike',count:28,crewed:27},{model:'recorded_fighter',role:'fighter',count:12,crewed:12}];
  assert.deepEqual(battleInstances(r.replay.frames[0]),[]);
  assert.match(battleWatchView(r,'campaign_1922'),/Recorded air wing: 40 aircraft · 39 crewed/);
  assert.match(battleWatchView(r,'campaign_1922'),/recorded striker · strike/);
  assert.doesNotMatch(battleWatchView(r,'campaign_1922'),/36 strike aircraft/);
  assert.match(battleWatchView(r,'campaign_1922'),/Shore defenses \/ no ships recorded/);
  r.replay.frames[0].groupsA = [group('empty',0)];
  const html = battleWatchView(r,'campaign_1922',{selected:{side:'A',id:'empty',hullIndex:0}});
  assert.doesNotMatch(html,/battle-ship-inspection/);
  assert.doesNotMatch(html,/hull 0/);
});

test('recorded loss ledger shows cumulative surviving damage and signed changes without calling sinks repairs', () => {
  const r = report();
  r.replay.frames[1].lossesA = {...losses,sunk:1,damaged:2,damagedTons:4300};
  r.replay.frames[1].deltaA = {...losses,sunk:1,damaged:-1,damagedTons:-700};
  const html = battleWatchView(r,'campaign_1922');
  assert.match(html,/surviving damaged ships: 2 hulls · 4,300 equivalent tons/);
  assert.match(html,/Net loss change this tick: \+1 ships/);
  assert.match(html,/Surviving damage change: -1 hulls · -700 equivalent tons/);
  assert.match(html,/This can fall when damaged ships sink/);
});

test('attrition ledger filters other wars, keeps correct player-side losses and escapes row labels', () => {
  const row = {month:'1936-01',a:'GBR',b:'JPN',region:'pacific',updatedAt:115,encounters:3,kinds:{surface:2,air:1},sides:{GBR:{sunk:2,merchantHulls:4,merchantGRT:12000},JPN:{sunk:7,merchantHulls:1,merchantGRT:3000}}};
  const state = {player:'JPN',attritionLedger:[row,{...row,a:'USA',b:'ITA',month:'DO NOT DISPLAY'}],backgroundEngagements:[{a:'JPN',b:'GBR'},{a:'USA',b:'ITA'}]};
  const before = structuredClone(state),html = attritionView(state);
  assert.doesNotMatch(html,/DO NOT DISPLAY/);
  assert.match(html,/1 actions resolving/);
  assert.match(html,/7 ships/);
  assert.match(html,/2 ships/);
  assert.match(html,/1 hulls<small>3,000 GRT/);
  assert.deepEqual(state,before);
  state.attritionLedger[0].month = '<script>bad</script>';
  assert.doesNotMatch(attritionView(state),/<script>/);
});

test('battle scene resets stale dragging and recognizes distinct stages recorded at the same minute', () => {
  const oldCancel = globalThis.cancelAnimationFrame;
  globalThis.cancelAnimationFrame = () => {};
  try {
    const canvas = {}, scene = new BattleWatchScene({root:{querySelector:() => canvas},onSelect:() => {}}), r = report();
    scene.bind = () => {}; scene.draw = () => {};
    r.replay.frames[1].at = 100; r.replay.frames[1].stage = 4;
    scene.refresh(r,'campaign_1922',0);
    const first = scene.frame;
    scene.refresh(r,'campaign_1922',1);
    assert.equal(scene.previous,first);
    assert.equal(scene.frame.stage,4);
    scene.drag = {moved:true}; scene.hits = [{unit:{}}]; scene.clear();
    assert.equal(scene.drag,null);
    assert.equal(scene.frame,null);
    assert.deepEqual(scene.hits,[]);
  } finally { globalThis.cancelAnimationFrame = oldCancel; }
});

test('battle drawing returns usable on-screen hit bounds for every live and sunk hull and can focus one', async () => {
  await loadVoxelModels({refresh:true,fetcher:async url => ({ok:true,json:async () => JSON.parse(await fs.readFile('.' + url,'utf8'))})});
  const previous = Object.fromEntries(['cancelAnimationFrame','requestAnimationFrame','devicePixelRatio'].map(key => [key,globalThis[key]]));
  Object.assign(globalThis,{cancelAnimationFrame:() => {},requestAnimationFrame:() => 1,devicePixelRatio:1});
  try {
    const noop = () => {};
    const canvas = {isConnected:true,width:0,height:0,dataset:{},style:{},addEventListener:noop,
      getBoundingClientRect:() => ({x:0,y:0,left:0,top:0,width:1000,height:500})};
    // Real Three geometry, perspective projection and triangle raycasting run
    // here; only the GPU submission is replaced for the Node test environment.
    const rendererFactory = () => ({setPixelRatio:noop,setSize:noop,render:noop,dispose:noop});
    const scene = new BattleWatchScene({root:{querySelector:() => canvas},onSelect:noop,rendererFactory});
    scene.refresh(report(),'campaign_1922');
    scene.draw(performance.now() + 2000);
    assert.equal(canvas.dataset.hullCount,'5');
    assert.equal(scene.hits.length,5);
    assert.equal(canvas.dataset.renderer,'webgl');
    for (const {unit,box,point} of scene.hits) {
      assert(Object.values(box).every(Number.isFinite));
      assert(box.x >= 0 && box.y >= 0 && box.x + box.width <= 1000 && box.y + box.height <= 500);
      assert(point,'publish an actual triangle hit point');
      assert.equal(scene.hit(point.x,point.y)?.key,unit.key);
    }
    const sunk = scene.hits.find(h => h.unit.sunkHull).unit;
    scene.focus(sunk.side,sunk.id,sunk.hullIndex);
    const focused = scene.hits.find(h => h.unit.key === sunk.key);
    assert(focused && focused.box.x < 500 && focused.box.x + focused.box.width > 500);
    assert.equal(scene.hit(focused.point.x,focused.point.y)?.key,sunk.key);
    scene.clear();
  } finally { Object.assign(globalThis,previous); }
});

test('3D battle orbit, pan, anchored zoom and actual triangle clicks leave recorded state unchanged', () => {
  const previous=Object.fromEntries(['cancelAnimationFrame','requestAnimationFrame','devicePixelRatio'].map(key=>[key,globalThis[key]]));
  Object.assign(globalThis,{cancelAnimationFrame:()=>{},requestAnimationFrame:()=>1,devicePixelRatio:1});
  try {
    const handlers={},noop=()=>{},selections=[],r=report(),before=JSON.stringify(r);
    const canvas={isConnected:true,dataset:{},style:{},addEventListener:(name,fn)=>{handlers[name]=fn;},
      getBoundingClientRect:()=>({left:0,top:0,width:1000,height:600}),setPointerCapture:noop,hasPointerCapture:()=>false};
    const scene=new BattleWatchScene({root:{querySelector:()=>canvas},onSelect:value=>selections.push(value),
      rendererFactory:()=>({setPixelRatio:noop,setSize:noop,render:noop,dispose:noop})});
    scene.refresh(r,'campaign_1922',0);scene.started=performance.now()-2000;scene.draw(performance.now());
    assert(scene.camera.isPerspectiveCamera);
    const point=scene.hits[0].point,unit=scene.hits[0].unit;
    handlers.pointerdown({button:0,pointerId:1,clientX:point.x,clientY:point.y});
    handlers.pointerup({pointerId:1,clientX:point.x,clientY:point.y});
    assert.deepEqual(selections,[{side:unit.side,id:unit.id,hullIndex:unit.hullIndex}]);
    const yaw=scene.yaw,pitch=scene.pitch;
    handlers.pointerdown({button:2,pointerId:2,clientX:500,clientY:300});
    handlers.pointermove({clientX:580,clientY:330});
    handlers.pointerup({pointerId:2,clientX:580,clientY:330});
    assert.notEqual(scene.yaw,yaw);assert.notEqual(scene.pitch,pitch);assert.equal(selections.length,1,'orbit does not click a ship');
    handlers.pointerdown({button:0,pointerId:3,clientX:500,clientY:300});
    handlers.pointermove({clientX:540,clientY:320});handlers.pointerup({pointerId:3,clientX:540,clientY:320});
    assert(Math.hypot(...scene.pan)>1);
    const water=scene.waterPoint(460,330),zoom=scene.zoom;
    handlers.wheel({preventDefault:noop,clientX:460,clientY:330,deltaY:-100});
    assert(scene.zoom>zoom);assert(scene.waterPoint(460,330).distanceTo(water)<.001,'wheel stays anchored to the water under the pointer');
    scene.fit();assert.deepEqual(scene.pan,[0,0]);assert.equal(scene.zoom,1);
    assert.equal(JSON.stringify(r),before);
    r.replay.frames=[frame(100,[],[])];r.airOperation={};
    scene.refresh(r,'campaign_1922',0);assert.equal(canvas.dataset.hullCount,'0');assert.deepEqual(scene.hits,[]);
    scene.clear();
  } finally {Object.assign(globalThis,previous);}
});

test('battle overlay remains confined to the canvas after a preserved stage loses its inline style', () => {
  const parent={style:{},clientLeft:1,clientTop:1,scrollLeft:0,scrollTop:70,getBoundingClientRect:()=>({left:200,top:150})};
  const scene=new BattleWatchScene({root:{}});scene.canvas={parentElement:parent};scene.overlay={style:{}};
  const canvasRect={left:221,top:430,width:1100,height:440};
  scene.positionOverlay(canvasRect);
  assert.equal(parent.style.position,'relative');
  assert.deepEqual(scene.overlay.style,{left:'20px',top:'349px',width:'1100px',height:'440px'});
  parent.style.position='';scene.positionOverlay(canvasRect);
  assert.equal(parent.style.position,'relative','restore positioning after DOM reconciliation');
});

test('battle camera fills the wide viewport while retaining every bound at demo introductory zoom', () => {
  const bounds=new Box3(new Vector3(-1700,0,-240),new Vector3(1700,50,240));
  for(const aspect of [3,1.2,.9]) {
    const distance=battleFitDistance(bounds,aspect),camera=new PerspectiveCamera(40,aspect,1,60000);
    const radius=bounds.getBoundingSphere({center:new Vector3(),radius:0}).radius;
    const oldDistance=radius/Math.sin(Math.min(20*Math.PI/180,Math.atan(Math.tan(20*Math.PI/180)*aspect)))*1.14;
    if(aspect===3)assert(distance<oldDistance*.7,'wide formations should not be framed as a tall sphere');
    const fit=zoom=>{
      const d=distance/zoom;camera.position.set(Math.sin(-.42)*Math.cos(.72)*d,12+Math.sin(.72)*d,Math.cos(-.42)*Math.cos(.72)*d);camera.lookAt(0,12,0);camera.updateMatrixWorld();
      const points=[];for(const x of [-1700,1700])for(const y of [0,50])for(const z of [-240,240])points.push(new Vector3(x,y,z).project(camera));
      return points;
    };
    assert(Math.max(...fit(1).map(p=>Math.max(Math.abs(p.x),Math.abs(p.y))))>.70,'use the available canvas');
    assert(fit(1.25).every(p=>Math.abs(p.x)<1&&Math.abs(p.y)<1&&p.z<1&&p.z> -1),'introductory zoom retains all hull bounds');
  }
});
