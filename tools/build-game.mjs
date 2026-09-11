import { GAME_SOURCE_FILES } from './game-files.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeClass, equipmentIndex, PROFILES, fleetService } from '../game/src/catalog.mjs';
import { addCampaignCatalogs } from './campaign-catalogs.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = async p => JSON.parse(await fs.readFile(path.join(root, p), 'utf8'));
const scenario = await read('data/scenarios/in_good_faith_1936.json');
const packs = await Promise.all(scenario.sources.packs.map(read));
const bases = await Promise.all(packs.map(p => read(p.base.file)));
const equipment = equipmentIndex(await Promise.all(scenario.sources.equipment.map(read)));
const register = await read('game/data/roster-1936.json');
const content = { version: 1, specificationRevision:2, rosterRevision:register.revision, merchantSource:register.merchantSource, legacySources:register.legacySources, scenario: { title: scenario.meta.title, start: scenario.clock.start_date, events: scenario.events }, equipment, nations: {}, classes: {} };
for (let i = 0; i < packs.length; i++) {
  const pack = packs[i], base = bases[i];
  for (const c of [...base.classes, ...pack.classes]) content.classes[c.id] = normalizeClass(c, equipment, pack.aircraft);
  const retained = (pack.base.retained_hulls || []).map(id => {
    const h = base.hulls.find(h => h.id === id);
    if (!h) throw new Error(`Missing retained hull ${id}`);
    // The base is a 1922 record. The pack explicitly retains these hulls in 1936.
    let status = 'active';
    if (pack.nation === 'DEU' && content.classes[h.class_id].category === 'capital_ship') status = h.status;
    if (pack.nation === 'USA' && ['pennsylvania','nevada','new_york','florida','wyoming'].includes(h.class_id)) status = 'reserve';
    return { id:h.id, name:h.name, class_id:h.class_id, status, legacy:true, ...(register.retainedOverrides[h.id]||{}) };
  });
  const aggregates = [...(pack.aggregates || [])];
  // These inherited flotillas are described in each pack's owning opening fleet.
  const inherited = {
    USA: [{class_id:'clemson',count:170,status:'active'}, {class_id:'s_class_ss_usn',count:41,status:'active'}],
    GBR: [{class_id:'v_w',count:30,status:'active'}, {class_id:'l_class_ss_rn',count:15,status:'active'}],
    DEU: [{class_id:'gazelle_cl',count:4,status:'reserve'}, {class_id:'bremen_cl',count:2,status:'reserve'}, {class_id:'v1_dd',count:12,status:'active'}, {class_id:'a_boat_tb',count:12,status:'active'}],
  };
  aggregates.push(...(inherited[pack.nation] || []));
  // Stable IDs survive classification changes and allow old campaigns to migrate.
  aggregates.forEach((row,i)=>{row.id=`a-${pack.nation}-${i}`;Object.assign(row,register.groupDetails[row.id]||{});});
  content.nations[pack.nation] = { ...PROFILES[pack.nation], nation:pack.nation, title:pack.toggle,
    hulls:[...retained,...pack.hulls], aggregates, designs:pack.classes.map(c=>c.id),
    state:pack.national_state, aircraft:pack.aircraft,
    sources:pack.source, pack:scenario.sources.packs[i], legacyNote:register.legacyNotes[pack.nation],
  };
}
// Classify the owned support records before separating the three registers.
for(const prefix of ['jp','uk'])for(const {spec,...annotations}of (await read('data/playable/'+prefix+'.json')).campaigns.in_good_faith_1936.classes){
  if(annotations.buildable===false)content.classes[spec.id]={...normalizeClass(spec,equipment),...annotations};
}
for(const [id,n] of Object.entries(content.nations)){
  if(id==='JPN')Object.assign(n.aggregates.find(g=>g.id==='a-JPN-11'),{class_id:'maru_depot_t23',name:'Maru depot conversions'});
  n.aggregates.push(...register.additions[id].map(g=>({...g,rosterAdded:register.revision})));
  n.merchants={...register.merchants[id],groups:[]};n.support=[];
  n.aggregates=n.aggregates.filter(g=>{
    const c=content.classes[g.class_id];if(!c)throw new Error(`Unresolved class ${g.class_id}`);
    const service=fleetService(c);
    if(service==='merchant'){n.merchants.groups.push(g);return false;}
    if(service==='support'){n.support.push(g);return false;}
    return true;
  });
  const managed=n.merchants.groups.reduce((sum,g)=>sum+g.count,0);
  if(managed!==n.merchants.managedHulls||managed>n.merchants.hulls)throw new Error(`Merchant count mismatch: ${id}`);
  const ids=new Set();
  for(const row of [...n.hulls,...n.aggregates,...n.support,...n.merchants.groups]){
    if(!content.classes[row.class_id])throw new Error(`Unresolved class ${row.class_id}`);
    if(ids.has(row.id))throw new Error(`Duplicate opening hull/group: ${row.id}`);ids.add(row.id);
  }
}
const out = path.resolve(root,process.argv[2]||'game/public');
// 1936 inherited fits are owned by docs/hindsight/inherited-hulls-catalog.md.
const inheritedFits = {
  south_dakota_1920:{name:'South Dakota class (1920, completed)'},
  admiral:{speed:33,range:13890,shp:144000}, renown:{speed:33,range:8700,shp:112000},
  courageous_llc:{type:'CV',category:'aircraft_carrier',barrels:0,caliber:0,belt:0,speed:32,range:11110,air:36,estimated:['air']},
  furious:{speed:30,range:7965,air:36,barrels:0,caliber:0},
  colorado:{deck:89,range:14815},tennessee:{deck:89,range:14815},new_mexico:{deck:89,range:14815},
  hosho:{air:15,range:16075},langley:{air:34,range:6480},
};
for(const [id,fit] of Object.entries(inheritedFits)) if(content.classes[id]) Object.assign(content.classes[id],fit);
await fs.mkdir(out, {recursive:true});
const campaigns=await addCampaignCatalogs(content,read);
await fs.writeFile(path.join(out, 'content.json'), JSON.stringify({...content,campaigns}));
for (const name of GAME_SOURCE_FILES) {
  await fs.copyFile(path.join(root,'game','src',name), path.join(out,name));
}
const land=await read('game/data/world-land.geojson');
const polygonPath=ring=>ring.map(([lon,lat],i)=>`${i?'L':'M'}${((lon+180)*10/3).toFixed(2)},${((90-lat)*10/3).toFixed(2)}`).join('')+'Z';
const landPath=land.features.map(f=>(f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates).map(p=>p.map(polygonPath).join('')).join('')).join('');
await fs.writeFile(path.join(out,'world-land.mjs'),`// Natural Earth 1:110m land, public domain.\nexport const LAND_PATH=${JSON.stringify(landPath)};\n`);
console.log(`Built two campaigns: ${Object.keys(content.nations).length} navies each, ${Object.keys(content.classes).length} In Good Faith ship designs. No story files read.`);

const political=await read('game/data/world-political.json');
await fs.writeFile(path.join(out,'world-political.mjs'),'// Natural Earth public-domain geometry and authored game overlays; see game/data/MAP-SOURCES.md.\nexport const POLITICAL='+JSON.stringify(political)+';\n');
const earlier=await read('game/data/world-political-1922.json');
await fs.appendFile(path.join(out,'world-political.mjs'),'export const POLITICAL_1922='+JSON.stringify(earlier)+';\n');

await fs.cp(path.join(root,'game','assets','music'),path.join(out,'music'),{recursive:true});

await fs.copyFile(path.join(root,'licenses','third-party-notices.html'),path.join(out,'third-party-notices.html'));
