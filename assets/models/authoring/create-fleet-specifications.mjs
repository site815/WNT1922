// One-time migration of dimensional station records, never vertex buffers.
// The generated specifications are editable inputs to independent new geometry.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CATALOG} from '../../../worker/catalog-loader.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=async file=>JSON.parse(await fs.readFile(path.join(root,file),'utf8'));
const registry=await read('assets/models/ships/index.json');
const recognitionIndex=await read('assets/recognition/index.json'),references=new Map();
for(const file of recognitionIndex.registries)for(const entry of (await read('assets/recognition/'+file)).entries)references.set(entry.id,entry);
const specs=[];
const keys=['role','x','y','z','w','d','h','barrels'];
const retained=new Set(['bridge-base','bridge','bridge-windows','funnel','mast','main','main-barrel','turret-pedestal','secondary','main-pedestal','secondary-barrel','boat','flight-deck','hangar','lift','side-exhaust','island','torpedo-tube','conning-tower','periscope','lower-flight-deck','middle-flight-deck','downturned-exhaust','upturned-exhaust','cargo-tank','cargo-boom','hinged-exhaust','catapult','crane-boom','light-aa','radar']);
for(const entry of registry.models){
  const mapping=entry.platforms.find(p=>p.campaign);if(!mapping||!entry.file.endsWith('.json')||entry.id==='clemson')continue;
  const old=await read('assets/models/ships/'+entry.file),ship=CATALOG.campaigns[mapping.campaign].classes[mapping.id],reference=references.get(old.reference.recognitionId);
  const L=old.dimensions.length,B=old.dimensions.beam,sub=['SS','SM'].includes(ship.type),carrier=['CV','CVL'].includes(ship.type),aux=ship.type==='AO';
  const draft=ship.raw?.dimensions?.draft_m||Math.min(B*(sub?.72:aux?.38:.31),L*.057);
  const era=ship.year,fullness=sub?.78:aux?.89:carrier?.75:['DD','DL','DE','TB'].includes(ship.type)?.64:ship.speed>27?.73:.83;
  // Each record stores all hull stations explicitly; there is no runtime generic hull.
  // These are inferred body sections, not a claim to recovered shipyard offsets.
  const stern=sub?.025:ship.nation==='GBR'&&era>=1925?.28:aux?.10:.06;
  const deckHeight=old.components.find(p=>p.role==='deck').z+.12;
  const stations=[[-1,stern],[-.97,sub?.14:.30],[-.9,sub?.37:.60],[-.78,.81],[-.6,.94],[-.35,1],[0,1],[.25,.97],[.45,fullness],[.64,.58],[.8,.31],[.91,.12],[.975,.025],[1,.0008]].map(([t,w])=>[t,w,sub?Math.max(.025,Math.sin((t+1)*Math.PI/2)**.43):Math.max(.02,Math.min(1,w*1.15)),deckHeight+(sub?0:Math.max(0,t-.35)**2*B*.11)]);
  specs.push({
    id:entry.id,name:ship.name,year:ship.year,type:ship.type,nation:ship.nation,units:'metres',axes:'right-handed: X bow-positive; Y up; Z transverse',
    output:entry.file.replace(/\.json$/,'.glb'),dimensions:{length:L,beam:B,draft},
    origin:reference?.origin||'original',configuration:reference?.configuration||old.reference.configuration,
    accuracy:'Recognition-informed exterior reconstruction. Catalog dimensions and recorded equipment stations define the class fit. Hull body sections, underwater appendages, plating, accommodation openings and small deck fittings are inferred original artwork, not a surveyed shipyard model. Historical drawing interpretation and individual refits require continuing review. No interior is modeled.',
    geometrySource:'New curved hull, deck and detailed fittings authored independently. The earlier recognition station ledger supplies locations and equipment counts only; no earlier vertices, faces, surface shapes or colors are imported.',
    sources:[{title:reference?.source?.title||ship.name+' recognition design',file:old.reference.file,url:reference?.source?.page||reference?.source?.url,license:reference?.source?.license||'Original project artwork',usedFor:'Identity, configuration, recorded longitudinal equipment layout and recognition outline; new curved surfaces and small fittings are original inferred exterior reconstruction.'},{title:'WNT1922 campaign catalog',file:'catalog',usedFor:'Class dimensions, armament, propulsion and complement.'}],
    dimensionBasis:old.dimensionBasis,layoutProvenance:'Dimensional equipment-station ledger retained from '+entry.file+'; mesh buffers are not used.',
    hullStations:stations,stations:old.components.filter(p=>retained.has(p.role)).map(p=>Object.fromEntries(keys.filter(k=>p[k]!==undefined).map(k=>[k,p[k]]))),
    armament:{caliber:ship.caliber,barrels:ship.barrels,torpedoTubes:ship.tubes,torpedoReloads:ship.torpedoReloads??null,aa:ship.aa,secondary:ship.raw?.armament?.secondary_battery||[],torpedoFit:ship.raw?.armament?.torpedo_tubes||null},
    shafts:ship.raw?.propulsion?.shafts||(sub?2:ship.type==='TB'?2:ship.tons>20000?4:2),complement:ship.crew,displacement:ship.tons,
    textureMetres:2.5,
  });
  if(aux&&ship.barrels>0&&!specs.at(-1).stations.some(s=>s.role==='main')){
    // The recognition ledger omitted the catalog's defensive deck guns.
    // Put the two singles clear of cargo gear, on the forecastle and poop.
    const s=specs.at(-1);for(const sign of [-1,1])s.stations.push({role:'main',x:sign*L*.425,y:0,z:deckHeight+.2,w:3.3,d:2.2,h:1.4,barrels:ship.barrels/2,caliber:ship.caliber,bearing:sign<0?180:0,enclosed:false});
    s.accuracy+=' Defensive singles on the forecastle and poop are original layout choices completing the catalog armament; no extra ammunition or reload capacity is implied.';
  }
}
await fs.writeFile(path.join(root,'assets/models/authoring/fleet-specifications.json'),JSON.stringify({format:1,policy:'Per-class original inferred exterior artwork, stored GLBs loaded directly. Never a claim of exact shipyard reconstruction.',ships:specs},null,2)+'\n');
console.log(JSON.stringify({classSpecifications:specs.length}));
