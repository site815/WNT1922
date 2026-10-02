import test from 'node:test';
import assert from 'node:assert/strict';
import { UnrealWorldScene, UnrealBattleScene } from '../ui/unreal-scene.mjs';

// Exercise the actual input listeners without a browser or native renderer.
class Surface {
  constructor() { this.listeners = new Map(); this.captured = new Set(); this.classList = {add() {}}; this.isConnected = true; }
  addEventListener(type, listener, options = {}) {
    const entries = this.listeners.get(type) || [];
    entries.push({listener, signal:options.signal}); this.listeners.set(type, entries);
  }
  emit(type, properties = {}) {
    const event = {button:0, pointerId:1, clientX:100, clientY:100, shiftKey:false,
      preventDefault() {this.defaultPrevented = true;}, ...properties};
    for (const {listener, signal} of this.listeners.get(type) || []) if (!signal?.aborted) listener(event);
    return event;
  }
  focus(options) {this.focusOptions = options;}
  setPointerCapture(id) {this.captured.add(id);}
  hasPointerCapture(id) {return this.captured.has(id);}
  releasePointerCapture(id) {this.captured.delete(id);}
  getBoundingClientRect() {return {left:0,top:0,right:1000,bottom:500,width:1000,height:500};}
}

function fixture(t, mode = 'world') {
  const previous = new Map();
  const frames=new Map();let frameId=0;
  for (const [key, value] of Object.entries({innerWidth:1000, innerHeight:500,
    window:new Surface(), document:Object.assign(new Surface(),{
      documentElement:{dataset:{}}, querySelectorAll:()=>[], body:{prepend() {}},
      createElement:()=>({isConnected:true,style:{},remove() {}}),
    }),
    ue:{wnt:{viewport() {}}},
    ResizeObserver:class {observe() {} disconnect() {}},
    requestAnimationFrame:callback=>{frames.set(++frameId,callback);return frameId;},
    cancelAnimationFrame:id=>frames.delete(id),
  })) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis,key));
    Object.defineProperty(globalThis,key,{value, configurable:true, writable:true});
  }
  const Scene = mode === 'battle' ? UnrealBattleScene : UnrealWorldScene;
  const scene = new Scene({root:{querySelector:()=>null}, chart:() => ({}), active:() => true});
  const inputs = [], canvas = new Surface();
  scene.input = (action, values = {}) => {inputs.push({action,...values});};
  scene.attach(canvas);
  scene.activate();
  t.after(() => {
    scene.destroy();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis,key,descriptor); else delete globalThis[key];
    }
  });
  return {scene, canvas, inputs,flushFrame(){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn());}};
}

for (const [label, button, shiftKey, action] of [['middle',1,false,'tilt'],['right',2,false,'pan'],['Shift-right',2,true,'pan']]) {
  test('world '+label+' drag sends '+action+' without selecting (native zoom gate controls orbit)', t => {
    const {canvas, inputs} = fixture(t);
    assert(canvas.emit('pointerdown',{button,shiftKey}).defaultPrevented,'Drag cannot start browser middle-button autoscroll');
    assert.deepEqual(canvas.focusOptions,{preventScroll:true});
    assert(canvas.hasPointerCapture(1));
    canvas.emit('pointermove',{button,shiftKey,clientX:125,clientY:115});
    canvas.emit('pointerup',{button,shiftKey,clientX:125,clientY:115});
    assert.deepEqual(inputs,[{action,dx:25,dy:15,previousX:.1,previousY:.2,x:.125,y:.23}]);
    assert(!canvas.hasPointerCapture(1));
  });
}

for(const shiftKey of [false,true])test('left drag selects a rectangle without moving the map or issuing orders'+(shiftKey?' with Shift':''), t=>{
  const {scene,canvas,inputs}=fixture(t);
  canvas.emit('pointerdown',{shiftKey});
  canvas.emit('pointermove',{shiftKey,clientX:300,clientY:240});
  assert.equal(scene.selectionBox.style.width,'200px');
  assert.deepEqual(inputs,[],'Drawing the box sends no navigation or movement orders');
  canvas.emit('pointerup',{shiftKey,clientX:300,clientY:240});
  assert.deepEqual(inputs,[{action:'selectBox',x0:.1,y0:.2,x:.3,y:.48}]);
  assert.equal(scene.selectionBox,null);
});

for (const [label, button, expected] of [['left',0,['pick']],['middle',1,[]],['right',2,[]]]) {
  test('world '+label+' click has the correct selection policy', t => {
    const {canvas, inputs} = fixture(t);
    canvas.emit('pointerdown',{button});
    canvas.emit('pointermove',{button,clientX:102,clientY:101});
    canvas.emit('pointerup',{button,clientX:102,clientY:101});
    assert.deepEqual(inputs.map(input => input.action),expected);
    if (expected.length) assert.deepEqual(inputs[0],{action:'pick',x:.102,y:.202,radiusX:.01,radiusY:.02});
  });
}

for (const [label, button, shiftKey, action] of [['middle',1,false,'tilt'],['right',2,false,'pan'],['Shift-right',2,true,'tilt']]) {
  test('battle '+label+' drag retains '+action+' inspection control without selecting', t => {
    const {canvas, inputs} = fixture(t,'battle');
    canvas.emit('pointerdown',{button,shiftKey});
    canvas.emit('pointermove',{button,shiftKey,clientX:125,clientY:115});
    canvas.emit('pointerup',{button,shiftKey,clientX:125,clientY:115});
    assert.deepEqual(inputs,[{action,dx:25,dy:15,previousX:.1,previousY:.2,x:.125,y:.23}]);
  });
}

test('cancelled gestures and detached surfaces cannot select or move the camera', t => {
  const {scene, canvas, inputs} = fixture(t);
  canvas.emit('pointerdown'); canvas.emit('pointercancel'); canvas.emit('pointerup');
  assert.deepEqual(inputs,[]);
  const replacement = new Surface(); scene.attach(replacement);
  canvas.emit('pointerdown'); canvas.emit('pointermove',{clientX:150}); canvas.emit('pointerup');
  assert.deepEqual(inputs,[]);
  replacement.emit('pointerdown'); replacement.emit('pointerup');
  assert.deepEqual(inputs,[{action:'pick',x:.1,y:.2,radiusX:.01,radiusY:.02}]);
});

test('battle left drag does not pan or issue a fleet order; only left double-click focuses',t=>{
  const {canvas,inputs}=fixture(t,'battle');
  canvas.emit('pointerdown');canvas.emit('pointermove',{clientX:300});canvas.emit('pointerup',{clientX:300});
  canvas.emit('dblclick',{button:2});assert.deepEqual(inputs,[]);
  canvas.emit('dblclick');assert.deepEqual(inputs,[{action:'pick',x:.1,y:.2,radiusX:.01,radiusY:.02,zoom:true}]);
});

test('world wheel and keyboard controls keep zoom units and cardinal pan direction', t => {
  const {scene, canvas, inputs,flushFrame} = fixture(t);
  const hovers=[]; scene.onHover=value=>hovers.push(value);
  for (const deltaMode of [0,1,2]) assert(canvas.emit('wheel',{deltaY:2,deltaMode}).defaultPrevented);
  assert.equal(inputs.length,0,'High-rate wheel events wait for one render frame');flushFrame();
  assert.deepEqual(canvas.focusOptions,{preventScroll:true},'Wheel navigation takes focus from the outliner so Home/Page Up work and its focus hover closes');
  for (const key of ['Home','PageUp','PageDown','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'])
    assert(canvas.emit('keydown',{key}).defaultPrevented);
  assert.deepEqual(hovers,Array(10).fill(null),'Camera navigation dismisses stale ship information');
  assert.deepEqual(inputs,[
    {action:'zoom',delta:1034,x:.1,y:.2},
    {action:'home'},{action:'zoom',delta:-300},{action:'zoom',delta:300},
    {action:'pan',dx:40,dy:0},{action:'pan',dx:-40,dy:0},{action:'pan',dx:0,dy:40},{action:'pan',dx:0,dy:-40},
  ]);
});

test('late native hover replies cannot reopen after zoom, and a fresh request works after settling', t => {
  t.mock.timers.enable({apis:['setTimeout']});
  const {scene,canvas,inputs}=fixture(t),hovers=[];
  scene.onHover=(selection,point)=>hovers.push({selection,point});
  canvas.emit('pointermove');t.mock.timers.tick(70);
  const old=inputs.find(input=>input.action==='hover');assert(old.requestId>0);
  canvas.emit('wheel',{deltaY:-300,deltaMode:0});
  scene.receiveHover({...old,selection:{kind:'country',id:'CHN'}});
  assert.deepEqual(hovers.map(row=>row.selection),[null],'An in-flight country reply is cancelled by wheel navigation');
  assert.equal(hovers[0].point.immediate,true);
  scene.cameraChanged({zoom:10,longitude:0,latitude:0,tilt:0});
  canvas.emit('pointermove',{clientX:200});t.mock.timers.tick(70);
  const fresh=inputs.filter(input=>input.action==='hover').at(-1);assert(fresh.requestId>old.requestId);
  scene.receiveHover({...old,selection:{kind:'country',id:'CHN'}});
  scene.receiveHover({...fresh,selection:{kind:'ship',id:'current'}});
  assert.equal(hovers.at(-1).selection.id,'current');
  const count=hovers.length;
  scene.cameraChanged({zoom:10,longitude:0,latitude:0,tilt:0});
  assert.equal(hovers.length,count,'An unchanged camera report leaves a stationary hover visible');
  scene.cameraChanged({zoom:11,longitude:0,latitude:0,tilt:0});
  scene.receiveHover({...fresh,selection:{kind:'ship',id:'current'}});
  assert.equal(hovers.at(-1).selection,null,'A genuine camera change invalidates the previous pick');
});

test('native hover accepts only the latest pointer request and rejects replies after leaving or switching scenes', t => {
  t.mock.timers.enable({apis:['setTimeout']});
  const {scene,canvas,inputs}=fixture(t),hovers=[];scene.onHover=selection=>hovers.push(selection);
  canvas.emit('pointermove');t.mock.timers.tick(70);
  const first=inputs.at(-1);
  canvas.emit('pointermove',{clientX:200});t.mock.timers.tick(70);
  const second=inputs.at(-1);
  scene.receiveHover({...first,selection:{id:'stale'}});
  scene.receiveHover({selection:{id:'untagged'}});
  assert.deepEqual(hovers,[]);
  scene.receiveHover({...second,selection:{id:'current'}});assert.equal(hovers.at(-1).id,'current');
  canvas.emit('pointerleave');scene.receiveHover({...second,selection:{id:'late'}});
  assert.equal(hovers.at(-1),null);
  canvas.emit('pointermove');t.mock.timers.tick(70);
  const third=inputs.at(-1);scene.suspend();
  scene.receiveHover({...third,selection:{id:'late-scene'}});
  assert.equal(hovers.at(-1),null);
});

test('world yaw-only orbit invalidates stale hovered ships without changing selection', t => {
  const {scene,inputs}=fixture(t),hovers=[];scene.onHover=value=>hovers.push(value);
  scene.cameraChanged({zoom:32768,longitude:0,latitude:0,tilt:52,yaw:0});
  const before=hovers.length;
  scene.cameraChanged({zoom:32768,longitude:0,latitude:0,tilt:52,yaw:35});
  assert.equal(hovers.length,before+1);
  assert.equal(hovers.at(-1),null);
  assert.deepEqual(inputs,[],'A camera update never becomes a selection or navigation command');
});

test('fleet selection signatures detect secondary selection changes without depending on order',t=>{
  const {scene}=fixture(t);let chart={fleetId:'one',fleetIds:['one']};scene.chart=()=>chart;
  const single=scene.selection();
  chart.fleetIds=['one','two','two'];const multiple=scene.selection();
  assert.equal(multiple.selectedForceId,'one');assert.deepEqual(multiple.selectedForceIds,['one','two']);
  assert.notEqual(multiple.signature,single.signature);
  chart.fleetIds=['two','one'];assert.equal(scene.selection().signature,multiple.signature);
  chart.convoyId='merchant';assert.deepEqual(scene.selection().selectedForceIds,['merchant']);
});

test('a native selection change sends one revision-bound patch and preserves the full world packet',async t=>{
  const {scene}=fixture(t);const messages=[];globalThis.ue.wnt.world=json=>messages.push(JSON.parse(json));
  let chart={fleetId:'one',fleetIds:['one']};scene.chart=()=>chart;
  scene.state={campaignId:'fixture',player:'USA',day:0,fraction:0};
  scene.rows=[{fleet:{id:'one'},docked:true}];scene.worldRevision=7;
  const full={forces:[{navigation:{fromAt:0,toAt:15}}]};scene.packet=full;
  scene.refresh();await Promise.resolve();
  assert.equal(messages.length,1);assert.equal(messages[0].selectionOnly,true);
  assert.equal(messages[0].revision,7);assert.equal(messages[0].instanceId,scene.instanceId);
  assert.equal(scene.packet,full);assert.equal('forces' in messages[0],false);
  scene.refresh();await Promise.resolve();assert.equal(messages.length,1,'A repeated render sends no duplicate selection');
  chart={};scene.refresh();await Promise.resolve();
  assert.deepEqual(messages[1].selectedForceIds,[]);assert.equal(messages[1].revision,7);
  assert.equal(scene.packet,full);
});
