import fs from 'node:fs';
import assert from 'node:assert/strict';
import {exportCatalogs,PREFIX} from './export-catalog-docs.mjs';
import {newGame,openingGroups} from '../game/src/engine.mjs';
import {merchantEconomy} from '../game/src/merchant-economy.mjs';
import {normalizeClass,fleetService,PROFILES} from '../game/src/catalog.mjs';
const read=p=>JSON.parse(fs.readFileSync(p)),b=read((process.env.WNT_TEST_PUBLIC||'game/public')+'/content.json');
let classChecks=0,aircraftChecks=0,rosterChecks=0;
for(const c of Object.values(b.campaigns)){
 const manifest=read('data/scenarios/'+c.scenario.id+'.json');assert.equal(manifest.nations.filter(n=>n.playable).length,7);assert.equal(manifest.clock.end_date,null);assert.equal(c.scenario.europeVariationDays,manifest.clock.europe_variation_days);
 assert.deepEqual(manifest.victory.checkpoints,['1940-12-31','1945-12-31','1950-12-31']);
 for(const id of Object.keys(c.nations)){
  const p='data/playable/'+PREFIX[id]+'.json',extra=read(p),part=extra.campaigns[c.scenario.id],n=c.nations[id];assert.ok(manifest.sources.playable.includes(p));assert.equal(n.name,PROFILES[id].name);assert.equal(n.color,PROFILES[id].color);
  assert.deepEqual(n.aircraft,part.aircraft);assert.deepEqual(n.armyAircraft,part.armyAircraft);assert.deepEqual(n.merchants,part.merchants);assert.equal(new Set(n.designs).size,n.designs.length);
  const aggregate=rows=>{const totals={};for(const row of rows){const key=row.class_id+':'+(row.status||'active');totals[key]=(totals[key]||0)+row.count;}return totals;};
  assert.deepEqual(aggregate(manifest.order_of_battle[id].aggregates),aggregate(n.aggregates),'Scenario / playable opening formations: '+id);
  assert.deepEqual([...manifest.order_of_battle[id].hulls].sort(),n.hulls.map(h=>h.id).sort(),'Scenario / playable named hulls: '+id);
  for(const {spec,...annotations}of part.classes){const cl=c.classes[spec.id],expected={...normalizeClass(spec,c.equipment,n.aircraft),...annotations};assert.deepEqual(cl,expected,spec.id);assert.equal(cl.nation,id);if(!cl.unknownSpecs)assert.ok(cl.tons>0&&cl.speed>0&&cl.range>0&&cl.crew>0);
   for(const code of spec.sensors||[]){assert.ok(c.equipment[code],'Unresolved sensor '+code);assert.ok(c.equipment[code].year<=cl.year,'Future as-launched sensor '+code);assert.equal(c.equipment[code].nation,id);}
   if(fleetService(cl)==='merchant')assert.ok(spec.merchant_grt>0);classChecks++;
  }
  for(const a of [...n.aircraft,...n.armyAircraft]){assert.equal(a.nation,id);assert.ok(a.type_year>=1900&&a.type_year<2000);assert.ok(a.crew.normal>0);assert.ok(a.cost_gold>0||a.readOnly&&a.catalogKind==='government');assert.ok(a.basing);aircraftChecks++;}
  for(const g of openingGroups(c,id)){assert.ok(c.classes[g.classId],g.classId);assert.equal(c.classes[g.classId].nation,id);assert.ok(g.count>0);const cl=c.classes[g.classId];if(!['building','converting','trials'].includes(g.status))assert.ok(cl.year<=Number(c.scenario.start.slice(0,4)),id+' commissions future class '+cl.id);rosterChecks++;}
  const s=newGame(c,id),e=merchantEconomy(s,c,id);assert.ok(Math.abs(e.current-e.baseline)<1,'Opening merchant capacity mismatch '+id);assert.equal(e.coverage,1);assert.equal(e.economyFactor,1);
 }
}
console.log(JSON.stringify({nationalCatalogs:exportCatalogs(b,{check:true}),classChecks,aircraftChecks,rosterChecks,campaigns:2,nations:7}));
