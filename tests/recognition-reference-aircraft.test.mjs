import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {CATALOG} from '../worker/catalog-loader.mjs';
const decode=s=>s.replaceAll('&quot;','"').replaceAll('&gt;','>').replaceAll('&lt;','<').replaceAll('&amp;','&');
const extent=(g,axis)=>{const pts=[...g.matchAll(/\bd="([^"]+)"/g)].flatMap(m=>(m[1].match(/-?\d+(?:\.\d+)?/g)||[]).map(Number)).filter((_,i)=>i%2===axis);return[Math.min(...pts),Math.max(...pts)];};
test('Italian reference airframes project the same actual engine stations and wing spans into each view',async()=>{
 const registry=JSON.parse(await fs.readFile('assets/recognition/originals/italian-reference-registry.json','utf8'));
 assert.equal(registry.entries.length,8);
 for(const e of registry.entries){
  const svg=await fs.readFile(e.file,'utf8'),m=JSON.parse(decode(svg.match(/<metadata id="reference-airframe">(.*?)<\/metadata>/s)[1]));
  const views=Object.fromEntries(['plan','profile','front'].map(v=>[v,svg.split('<g data-view="'+v+'"')[1].split('<g data-view=')[0]]));
  const feature=(v,id)=>{const g=views[v].match(new RegExp('<g data-feature="'+id+'" data-kind="[^\"]+">(.*?)<\\/g>','s'));assert(g,e.id+' '+v+' '+id);return g[1];};
  for(let i=0;i<m.engineCount;i++){
   const plan=extent(feature('plan','engine-'+i),1).map(x=>(x-m.projections.plan.origin[1])/m.scale);
   const side=extent(feature('profile','engine-'+i),0).map(x=>(x-m.projections.profile.origin[0])/m.scale);
   assert(Math.abs(plan[0]-side[0])<.001&&Math.abs(plan[1]-side[1])<.001,e.id+' engine '+i+' longitudinal mismatch');
   assert(Math.abs(plan[0]-m.engines[i].x)<.001,e.id+' engine shifted from source model');
  }
  for(let deck=0;deck<m.wingPlanes;deck++)for(const sign of[-1,1]){
   const plan=extent(feature('plan','wing-'+deck+'-'+sign),0).map(x=>(x-m.projections.plan.origin[0])/m.scale);
   const front=extent(feature('front','wing-'+deck+'-'+sign),0).map(x=>(x-m.projections.front.origin[0])/m.scale);
   assert(plan.every((x,i)=>Math.abs(x-front[i])<.001),e.id+' wing span differs between views');
  }
  for(const p of m.parts.filter(p=>p.id.startsWith('float-strut'))){assert(Math.abs(p.points[0][1])<=m.span/2,e.id+' floating outrigger support');}
  if(m.id==='ca3'){assert.equal(m.engineCount,3);assert.equal(m.parts.filter(p=>p.id.startsWith('fin-')).length,3);}
  if(m.id==='cr1'){const top=m.parts.find(p=>p.id==='wing-1-1'),bottom=m.parts.find(p=>p.id==='wing-0-1');assert(Math.max(...top.points.map(p=>p[1]))<Math.max(...bottom.points.map(p=>p[1])));}
 }
});
test('Italian early naval aircraft use waterborne basing and correct M5 crew',()=>{
 const planes=CATALOG.campaigns.campaign_1922.nations.ITA.aircraft;
 for(const id of['it_naval_fighter_1921','it_naval_strike_1921','it_naval_scout_1921']){const a=planes.find(a=>a.id===id);assert.equal(a.basing.carrier,false);assert.equal(a.basing.floatplane,true);assert.equal(a.basing.land,true);}
 assert.equal(planes.find(a=>a.id==='it_naval_scout_1921').crew.normal,1);
});
