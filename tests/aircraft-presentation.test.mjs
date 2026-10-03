import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCombat,advanceCombat,buildScenario} from '../combatmechanics/index.mjs';
import {unrealTacticalPacket} from '../ui/tactical-scene-packet.mjs';
import {UnrealTacticalScene} from '../ui/unreal-scene.mjs';

test('stored aircraft GLBs contain finite closed-volume geometry, role stores and distinct recognition materials',()=>{
  const shapes=[];
  for(const role of ['fighter','dive-bomber','torpedo-bomber'])for(const side of ['a','b']){
    const b=fs.readFileSync(new URL(`../assets/models/aircraft/${side}-${role}.glb`,import.meta.url));
    assert.equal(b.readUInt32LE(),0x46546c67);assert.equal(b.readUInt32LE(8),b.length);
    const jsonLength=b.readUInt32LE(12),doc=JSON.parse(b.subarray(20,20+jsonLength)),start=28+jsonLength;
    assert(doc.materials.length>=7);assert.equal(doc.nodes.length,1);
    let triangles=0;const all=[];
    for(const p of doc.meshes[0].primitives){
      const a=doc.accessors[p.attributes.POSITION],v=doc.bufferViews[a.bufferView],arr=new Float32Array(b.buffer,b.byteOffset+start+v.byteOffset,a.count*3);
      for(const n of arr)assert(Number.isFinite(n));all.push(a);triangles+=doc.accessors[p.indices].count/3;
      const idx=doc.accessors[p.indices],view=doc.bufferViews[idx.bufferView],indices=new Uint32Array(b.buffer,b.byteOffset+start+view.byteOffset,idx.count);for(const n of indices)assert(n<a.count);
    }
    const min=[0,1,2].map(i=>Math.min(...all.map(a=>a.min[i]))),max=[0,1,2].map(i=>Math.max(...all.map(a=>a.max[i])));
    assert(triangles>3000&&triangles<20000);assert(max[0]-min[0]>9&&max[2]-min[2]>11);assert(max[1]-min[1]>1.5);
    assert(b.length<1500000,'Aircraft instances share modest stored geometry');shapes.push({role,side,triangles,paint:doc.materials[0].pbrMetallicRoughness.baseColorFactor});
  }
  assert.notDeepEqual(shapes[0].paint,shapes[1].paint);assert.notEqual(shapes[0].triangles,shapes[4].triangles);
});

test('Midway flight geometry preserves actual route/counts and carries factual attack/loss metadata',()=>{
  const state=createCombat(buildScenario(null,{presetId:'midway'}));advanceCombat(state,240);
  const before=structuredClone(state),packet=unrealTacticalPacket(state,{fromSeconds:230,speed:60});
  const event=packet.events.find(e=>e.weapon==='air'&&e.strikeId);
  assert(event);assert.equal(event.planes,0);assert.equal(event.planesLost,15);
  const wing=packet.airstrikes.find(w=>w.key===event.strikeId);assert(wing);assert.equal(wing.aircraftType,'torpedo-bomber');
  assert(wing.representativeAircraft);assert(wing.sourceKey&&wing.targetKey);
  const last=wing.trajectory.at(-1);assert.deepEqual(last.positionMetres.slice(0,2),event.targetPositionMetres.slice(0,2));
  assert.equal(last.planes,0);assert.equal(last.positionMetres[2],80);assert.equal(packet.secondsPerRealSecond,60);
  assert.deepEqual(state,before,'Visual aircraft must never change combat positions, RNG, inventory or outcomes');
});

test('inspection-only refreshes reuse tracks without reading or scanning combat history',async t=>{
  let now=0;const old=new Map(),packets=[];
  for(const[key,value]of Object.entries({performance:{now:()=>now},matchMedia:()=>({matches:false}),ue:{wnt:{battle:p=>packets.push(JSON.parse(p))}}})){old.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});}
  t.after(()=>{for(const[key,d]of old)if(d)Object.defineProperty(globalThis,key,d);else delete globalThis[key];});
  const state=createCombat(buildScenario(null,{presetId:'denmark-strait'})),scene=new UnrealTacticalScene({root:{querySelector:()=>({isConnected:true})}});
  scene.attach=()=>{};scene.activate=()=>{};await scene.refresh(state,{paused:true});
  const history=state.history;Object.defineProperty(state,'history',{get(){throw Error('Unnecessary history scan');},configurable:true});
  await scene.refresh(state,{paused:true,selected:{id:state.ships[0].id}});
  assert.equal(packets.at(-1).units.filter(u=>u.selected).length,1);
  Object.defineProperty(state,'history',{value:history,configurable:true});scene.destroy();
});
