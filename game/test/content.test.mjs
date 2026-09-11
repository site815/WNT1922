import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { newGame } from '../src/engine.mjs';
import { validateSave,exportSave } from '../src/state-io.mjs';
const content=JSON.parse(fs.readFileSync(process.env.WNT_TEST_PUBLIC ? process.env.WNT_TEST_PUBLIC+'/content.json' : new URL('../public/content.json',import.meta.url)));

test('authored bore fields produce nonzero gun calibers for every armed class',()=>{
  for(const cl of Object.values(content.classes))if(cl.barrels>0)assert.ok(cl.caliber>0,cl.id);
  assert.equal(content.classes.columbia_bb32.caliber,546);
  assert.equal(content.classes.incomparable_bc31.caliber,457);
});

test('opening fleet uses commissioned pack totals instead of stale scenario totals',()=>{
  const state=newGame(content);
  const active=(nation,classId)=>state.nations[nation].groups.filter(g=>g.classId===classId&&g.status==='active').reduce((sum,g)=>sum+g.count,0);
  assert.equal(active('JPN','unryu_t32'),5);
  assert.equal(active('JPN','maya_t29'),26);
  assert.equal(active('DEU','hecht_typ2'),27);
  assert.equal(active('DEU','wolf_typ7'),6);
  assert.equal(active('GBR','incomparable_bc31'),2);
});
test('inherited hulls retain their 1936 role',()=>{
  const state=newGame(content);
  assert.equal(state.nations.USA.groups.find(g=>g.id==='h-uss_south_dakota_bb49').status,'active');
  assert.equal(state.nations.JPN.groups.find(g=>g.id==='h-ijn_hosho').status,'active');
  assert.equal(state.nations.USA.groups.find(g=>g.id==='h-uss_pennsylvania').status,'reserve');
});
test('save round trip preserves a campaign and resumes paused',()=>{
  const state=newGame(content,'DEU',123);state.paused=false;
  const loaded=validateSave(JSON.parse(exportSave(state)),content);
  assert.equal(loaded.player,'DEU');assert.equal(loaded.seed,123);assert.equal(loaded.paused,true);
  assert.deepEqual(loaded.nations,state.nations);
});
test('bad imports cannot replace a campaign or fabricate ships',()=>{
  for(const mutate of [s=>s.version=100,s=>s.player='XXX',s=>s.nations.JPN.groups[0].classId='fake',s=>s.nations.JPN.groups[0].count=-1,s=>s.day=null,s=>s.nations.JPN.groups[0].health=NaN,s=>s.nations.JPN.groups[0].classId='missouri_bb23',s=>s.nations.JPN.gold='1000',s=>s.nations.JPN.projects=[{key:'invented'}],s=>s.relations['JPN-USA'].score=-101,s=>s.nations.JPN.tech.radar=999,s=>s.reports=[{}]]){
    const value=newGame(content);mutate(value);assert.throws(()=>validateSave(value,content),/compatible/);
  }
  assert.doesNotThrow(()=>validateSave(newGame(content,'GBR'),content));
});
