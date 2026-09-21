import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame } from '../mechanics/engine.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { validateSave } from '../mechanics/state-io.mjs';
import { recognitionIndex } from '../ui/recognition.mjs';

test('Dart and Ripon retain their real single-seat and two-seat crew requirements in both campaigns',()=>{
  for(const campaign of Object.keys(CATALOG.campaigns)){
    const s=newGame(CATALOG,'GBR',33033,campaign),c=contentFor(CATALOG,s),n=c.nations.GBR;
    const dart=n.aircraft.find(a=>a.id==='uk_naval_strike_1921');
    if(dart){assert.equal(dart.crew.normal,1);assert.deepEqual(dart.basing,{carrier:true,floatplane:false,land:true});}
    const ripon=n.armyAircraft.find(a=>a.id==='gbr_gov_maritime_strike_1930');
    assert.equal(ripon.crew.normal,2);assert.equal(ripon.crew.seats,2);
    assert.equal(ripon.basing.floatplane,false);
    validateSave(s,CATALOG);
  }
});

test('British recognition mappings distinguish real airframe configurations and preserve honest view limits',async()=>{
  const registry=JSON.parse(await fs.readFile('assets/recognition/aircraft/british-supplement.json'));
  const index=recognitionIndex([registry]);
  for(const id of ['uk_naval_strike_1921','gbr_gov_maritime_strike_1924','gbr_gov_maritime_strike_1930','gbr_gov_maritime_strike_1936','gbr_gov_strategic_bomber_1936','gbr_gov_fighter_1942','fra_gov_fighter_1945','gbr_gov_fighter_1945'])
    assert(index.platforms.has('aircraft:'+id),id);
  assert.equal(index.platforms.get('aircraft:gbr_gov_fighter_1942').entry,index.platforms.get('aircraft:fra_gov_fighter_1945').entry);
  assert.notEqual(index.platforms.get('aircraft:gbr_gov_fighter_1942').entry,index.platforms.get('aircraft:gbr_gov_fighter_1945').entry);
  const expected=[['blackburn-dart',1,1,2],['blackburn-ripon',1,2,2],['blackburn-shark',1,3,2],['handley-page-heyford',2,4,2],['spitfire-ix',1,1,1],['spitfire-xiv',1,1,1]];
  for(const [id,engines,seats,planes]of expected){
    const e=index.entries.get('aircraft-original-reference-'+id),svg=await fs.readFile(e.file,'utf8');
    assert.deepEqual(e.views,['profile']);
    assert.equal(e.geometry.engineCount,engines);assert.equal(e.geometry.crewSeats,seats);assert.equal(e.geometry.wingPlanes,planes);
    assert.equal((svg.match(/data-feature="engine"/g)||[]).length,engines,id+' drawn engine groups');
    assert.equal((svg.match(/data-feature="wing"/g)||[]).length,planes,id+' actual wing geometry');
    assert(!/data-feature="float"|<text\b|<image\b|<script\b/.test(svg));
    assert.match(svg,/<rect width="1200" height="570" fill="white"\/>/);
    assert(e.references.every(r=>/^https:\/\//.test(r.url)));
  }
  const ix=await fs.readFile(index.entries.get('aircraft-original-reference-spitfire-ix').file,'utf8');
  const xiv=await fs.readFile(index.entries.get('aircraft-original-reference-spitfire-xiv').file,'utf8');
  assert.match(ix,/data-blades="4"/);assert.match(xiv,/data-blades="5"/);
  assert.equal((ix.match(/data-feature="tail-wheel"/g)||[]).length,1);
  assert.equal((xiv.match(/data-feature="tail-wheel"/g)||[]).length,0);
});
