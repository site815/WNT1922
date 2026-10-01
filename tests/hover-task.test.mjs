import test from 'node:test';
import assert from 'node:assert/strict';
import {HoverTask} from '../ui/hover-task.mjs';

const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return{promise,resolve};};

test('a delayed artwork completion cannot resurrect a dismissed tooltip',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const task=new HoverTask(),artwork=deferred(),shown=[];
  task.schedule(()=>artwork.promise,()=>shown.push('old ship'));
  t.mock.timers.tick(220);
  task.cancel(); // Camera movement dismisses immediately, before the fetch resolves.
  artwork.resolve();await artwork.promise;await Promise.resolve();
  assert.deepEqual(shown,[]);
});

test('returning to the same hull does not revive its older artwork task',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const task=new HoverTask(),old=deferred(),current=deferred(),shown=[];
  task.schedule(()=>old.promise,()=>shown.push('old hull request'));t.mock.timers.tick(220);
  task.cancel();
  task.schedule(()=>current.promise,()=>shown.push('fresh hull request'));t.mock.timers.tick(220);
  old.resolve();await old.promise;await Promise.resolve();assert.deepEqual(shown,[]);
  current.resolve();await current.promise;await Promise.resolve();assert.deepEqual(shown,['fresh hull request']);
});

test('leaving during the dwell delay does not start the artwork load',t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const task=new HoverTask();let loaded=false;
  task.schedule(()=>{loaded=true;},()=>assert.fail('Cancelled tooltip displayed'));
  task.cancel();t.mock.timers.tick(220);assert.equal(loaded,false);
});
