import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {galleryDimensions,galleryArtInfo,openModelGallery} from '../ui/model-gallery.mjs';
import {UnrealBattleScene} from '../ui/unreal-scene.mjs';

test('gallery reads authored and licensed ship metadata with dimensions and complete attribution',async()=>{
 const index=JSON.parse(await fs.readFile(new URL('../assets/models/ships/index.json',import.meta.url)));
 for(const entry of index.models.filter(m=>m.file.endsWith('.glb'))){
  const source=JSON.parse(await fs.readFile(new URL('../assets/models/ships/'+entry.file.replace(/\.glb$/,'.source.json'),import.meta.url)));
  const size=galleryDimensions(source);assert(size.length>0&&size.beam>0,entry.id);
  const info=galleryArtInfo(source);
  if(source.author){assert(info.includes(source.author));assert(info.includes(`href="${source.authorUrl}"`));}
  if(source.licenseUrl)assert(info.includes(`href="${source.licenseUrl}"`));
  if(source.modifications)assert(info.includes('Changes:'));
 }
});

test('gallery attribution escapes external metadata and excludes unsafe link schemes',()=>{
 const info=galleryArtInfo({author:'<artist>',authorUrl:'javascript:alert(1)',license:'CC-BY-4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',modifications:'a < b',sources:[{title:'<source>',url:'javascript:alert(2)'}]});
 assert(info.includes('&lt;artist&gt;'));assert(info.includes('a &lt; b'));assert(info.includes('href="https://creativecommons.org/licenses/by/4.0/"'));assert(!info.includes('javascript:'));assert(!info.includes('<artist>'));
});

const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};};
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function nativeGalleryHarness(t,{gateInputs=false}={}){
 const globals=new Map();
 const replace=(key,value)=>{globals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});};
 t.after(()=>{for(const [key,descriptor]of globals)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];});
 const node=()=>({dataset:{},listeners:new Map(),isConnected:true,focus(){},setAttribute(){},remove(){this.isConnected=false;},
  addEventListener(type,handler,{signal}={}){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push(handler);signal?.addEventListener('abort',()=>{this.listeners.set(type,this.listeners.get(type).filter(fn=>fn!==handler));},{once:true});},
  emit(type,event={}){for(const handler of this.listeners.get(type)||[])handler({target:this,...event});}});
 const select=node(),canvas=node(),status=node(),info=node(),host=node();
 host.querySelector=selector=>({'select':select,'.battle-canvas':canvas,'.model-gallery-status':status,'.model-gallery-info':info}[selector]);
 const app={inert:false,hidden:false},calls=[],battles=[],inputs=[],camera={zoom:1,targetZoom:1};
 replace('document',{activeElement:null,createElement:()=>host,body:{append(){}},querySelector:()=>null});
 replace('matchMedia',()=>({matches:false}));
 replace('fetch',async url=>({ok:true,json:async()=>url.endsWith('index.json')?{models:[
  {id:'model-a',file:'test/a.glb',platforms:[{id:'a'}]},
  {id:'model-b',file:'test/b.glb',platforms:[{id:'b'}]},
 ]}:{name:url.includes('/a.')?'Ship A':'Ship B',type:'DD',dimensions:{length:url.includes('/a.')?100:150,beam:10}}}));
 replace('ue',{wnt:{
  battle(json){const packet=JSON.parse(json),gate=deferred();calls.push('battle:'+packet.id);battles.push({packet,...gate});return gate.promise;},
  sceneinput(json){const packet=JSON.parse(json),gate=deferred();calls.push(packet.action);inputs.push({packet,...gate});
   // Native wheel acceptance changes its target, not the current eased zoom.
   // Focus cancels an earlier target and establishes the minimum zoom of 3.
   if(packet.action==='home')camera.zoom=camera.targetZoom=1;
   if(packet.action==='focus')camera.zoom=camera.targetZoom=Math.max(camera.zoom,3);
   if(packet.action==='zoom')camera.targetZoom=Math.max(.1,Math.min(1000,camera.targetZoom*Math.exp(-packet.delta*.0015)));
   if(!gateInputs)gate.resolve();return gate.promise;},
 }});
 // Only DOM attachment is stubbed. The production refresh/send bridge and
 // gallery sequencing run against manually acknowledged native promises.
 t.mock.method(UnrealBattleScene.prototype,'attach',()=>{});
 t.mock.method(UnrealBattleScene.prototype,'activate',()=>{});
 return {app,host,select,calls,battles,inputs,camera,opening:openModelGallery({app}),action:name=>host.emit('click',{target:{closest:()=>({dataset:{gallery:name}})}})};
}

test('gallery waits for the native model packet and each camera acknowledgement before declaring ready',async t=>{
 const h=nativeGalleryHarness(t,{gateInputs:true});await flush();
 assert.deepEqual(h.calls,['battle:gallery-model-a']);
 assert.equal(h.host.dataset.galleryReady,'false');
 h.battles[0].resolve();await flush();
 assert.deepEqual(h.calls,['battle:gallery-model-a','home']);
 h.inputs[0].resolve();await flush();
 assert.equal(h.calls.at(-1),'focus');
 assert.equal(h.host.dataset.galleryReady,'false');
 h.inputs[1].resolve();await flush();
 assert.equal(h.calls.at(-1),'zoom');
 assert.equal(h.host.dataset.galleryReady,'false');
 h.inputs[2].resolve();const close=await h.opening;
 assert.equal(h.host.dataset.galleryReady,'true');
 assert.equal(h.host.dataset.galleryModel,'model-a');
 assert.deepEqual(h.calls,['battle:gallery-model-a','home','focus','zoom']);
 assert.equal(h.camera.zoom,3,'Fit preserves smooth native wheel interpolation');
 assert(Math.abs(h.camera.targetZoom-15.5)<1e-10,'Focus must not cancel the length-based camera target');
 assert.equal(Number(h.host.dataset.galleryTargetZoom),h.camera.targetZoom);
 close();assert.equal(h.app.inert,false);assert.equal(h.app.hidden,false);
});

test('rapid gallery selection and Fit keep the latest ship, and closing cancels its remaining camera work',async t=>{
 const h=nativeGalleryHarness(t);await flush();
 h.select.value='1';h.select.emit('change');h.action('fit');await flush();
 assert.deepEqual(h.calls,['battle:gallery-model-a'],'New model packets are serialized behind the pending native acknowledgement');
 h.battles[0].resolve();await flush();
 assert.deepEqual(h.calls,['battle:gallery-model-a','battle:gallery-model-b'],'Superseded Ship A must never receive a camera fit');
 assert.equal(h.host.dataset.galleryReady,'false');
 h.battles[1].resolve();await flush();
 assert.deepEqual(h.calls,['battle:gallery-model-a','battle:gallery-model-b','home','focus','zoom']);
 assert.equal(h.host.dataset.galleryModel,'model-b');assert.equal(h.host.dataset.galleryReady,'true');
 assert.equal(h.inputs.find(input=>input.packet.action==='zoom').packet.delta,-Math.log((1550/150)/3)/.0015,'Fit uses the selected ship dimensions relative to native focus zoom');
 assert(Math.abs(h.camera.targetZoom-1550/150)<1e-10,'Newest model retains its intended fit while the camera is easing');
 const close=await h.opening;
 h.select.value='0';h.select.emit('change');await flush();
 assert.equal(h.calls.at(-1),'battle:gallery-model-a');
 const before=h.calls.length;close();h.battles[2].resolve();await flush();
 assert.equal(h.calls.length,before,'A late native acknowledgement must not issue camera commands after close');
 assert.equal(h.host.dataset.galleryReady,'false');assert.equal(h.host.isConnected,false);
 assert.equal(h.app.inert,false);assert.equal(h.app.hidden,false);
});
