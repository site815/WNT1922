import test from 'node:test';
import assert from 'node:assert/strict';
import {NativeShipInspection,SHIP_INSPECTION_DELAY_MS} from '../ui/native-ship-inspection.mjs';
function fixture(prepare) {
  const pending=new Map(),events=[];let serial=0;
  const controller=new NativeShipInspection({select:s=>events.push(['select',s]),focus:s=>events.push(['focus',s]),inspect:s=>events.push(['inspect',s]),prepare,
    schedule:(fn,delay)=>{assert.equal(delay,SHIP_INSPECTION_DELAY_MS);pending.set(++serial,fn);return serial;},cancel:id=>pending.delete(id)});
  return {controller,events,pending,async flush(){for(const [id,fn]of [...pending]){pending.delete(id);await fn();}}};
}
test('single native hull click selects immediately and opens its exact inspection only after the grace period',async()=>{
  const {controller,events,pending,flush}=fixture();const selection={kind:'ship',id:'Idaho',hullIndex:2,zoom:false};
  controller.pick(selection);assert.deepEqual(events,[['select',selection]]);assert.equal(pending.size,1);
  await flush();assert.deepEqual(events,[['select',selection],['inspect',selection]]);
});
test('two pointer-up selections followed by a native double click focus the exact hull without inserting a modal',async()=>{
  const {controller,events,pending,flush}=fixture();const single={kind:'ship',id:'Idaho',hullIndex:2},double={...single,zoom:true};
  controller.pick(single);controller.cancel();controller.pick(single);controller.pick(double);await flush();
  assert.equal(pending.size,0);assert.deepEqual(events.map(e=>e[0]),['select','select','select','focus']);
  assert.equal(events.at(-1)[1].hullIndex,2);
});
test('navigation or session cancellation invalidates a pending timer and stale asynchronous recognition preparation',async()=>{
  let ready;const {controller,events,pending}=fixture(()=>new Promise(resolve=>{ready=resolve;}));
  controller.pick({id:'first'});const queued=[...pending.values()][0];controller.cancel();
  // Even a timer callback that was already dispatched must not open a dialog.
  await queued();assert.equal(ready,undefined,'Cancelled callbacks do not start artwork work');
  assert.deepEqual(events.map(e=>e[0]),['select']);
  controller.pick({id:'second'});assert.equal(pending.size,1);
  const loading=[...pending.values()][0]();pending.clear();controller.cancel();ready();await loading;
  assert.deepEqual(events.map(e=>e[0]),['select','select']);assert.equal(pending.size,0);
});
test('double click during recognition loading invalidates the eventual single-click modal',async()=>{
  let ready;const {controller,events,pending}=fixture(()=>new Promise(resolve=>{ready=resolve;}));
  controller.pick({id:'ship',hullIndex:0});const loading=[...pending.values()][0]();
  controller.pick({id:'ship',hullIndex:0,zoom:true});ready();await loading;
  assert.deepEqual(events.map(e=>e[0]),['select','select','focus']);
});
