import { aircraftSeats, operationalAircraftModels, governmentModel } from './naval-resources.mjs';
import { addWing, aviationOwner, airWarehouse, freeAircraft } from './base-aviation.mjs';
import { portSpec } from './port-catalog.mjs';
// Other-service maritime units have a separate establishment and aircrew pool.
// Their replacement airframes start at home and use the same physical ferry /
// merchant transport system as naval reinforcements.
export const governmentCapacity=(s,port)=>Math.floor(portSpec(s,port).aircraft*(s.ports?.[port]?.health??1)*.25);
export const navalBaseCapacity=(s,port)=>Math.floor(portSpec(s,port).aircraft*(s.ports?.[port]?.health??1)*.75);
export function currentGovernmentModels(s,c,id){const year=new Date(s.day*86400000).getUTCFullYear();return ['maritime_patrol','maritime_strike'].map(role=>(c.nations[id].armyAircraft||[]).filter(a=>a.role===role&&a.type_year<=year).sort((a,b)=>b.type_year-a.type_year)[0]).filter(Boolean);}
export function initializeGovernmentAviation(s,c){
 for(const [id,n]of Object.entries(s.nations)){
  n.airSorties??=[];n.anchorageReports??={};if(n.governmentAircraft)continue;
  n.governmentAircraft=Object.fromEntries((c.nations[id].armyAircraft||[]).map(a=>[a.id,0]));n.governmentAviators=0;n.governmentLosses={planes:0,crews:0,rescued:0};n.governmentMonth=s.day;
  const models=currentGovernmentModels(s,c,id);
  for(const [port,b]of Object.entries(n.airBases||{})){b.governmentWing=[];
   for(const [i,a]of models.entries()){const count=Math.floor(governmentCapacity(s,port)*(i===0?.4:.6));if(!count)continue;n.governmentAircraft[a.id]+=count;n.governmentAviators+=count*aircraftSeats(a);addWing(b.governmentWing,{model:a.id,role:i===0?'scout':'strike',count,crewed:count});}
  }
 }
}
export function governmentProduction(s,c,id){
 const n=s.nations[id],date=new Date(s.day*86400000);if(date.getUTCDate()!==1||n.governmentMonth===s.day||!airWarehouse(s,id))return;n.governmentMonth=s.day;
 const capacity=Object.keys(n.airBases).filter(p=>aviationOwner(s,p)===id).reduce((v,p)=>v+governmentCapacity(s,p),0),current=currentGovernmentModels(s,c,id),models=new Map(operationalAircraftModels(c,id).map(a=>[a.id,a]));
 // Retire old government reserves, never deployed aircraft or a shipment.
 for(const [port,b]of Object.entries(n.airBases))for(const w of b.reserve)if(governmentModel(models.get(w.model))&&current.some(a=>a.role===models.get(w.model).role&&a.type_year>models.get(w.model).type_year)){
  n.governmentAircraft[w.model]-=w.count;n.governmentAviators-=w.crewed*aircraftSeats(models.get(w.model));w.count=0;w.crewed=0;
 }
 for(const [model,count]of Object.entries(freeAircraft(n))){const old=models.get(model);if(!count||!governmentModel(old)||!current.some(a=>a.role===old.role&&a.type_year>old.type_year))continue;n.governmentAircraft[model]-=count;n.governmentAviators=Math.max(0,n.governmentAviators-count*aircraftSeats(old));}
 for(const a of currentGovernmentModels(s,c,id)){const desired=Math.ceil(capacity*(a.role==='maritime_patrol'?.4:.6)*1.25),owned=operationalAircraftModels(c,id).filter(m=>governmentModel(m)&&m.role===a.role).reduce((v,m)=>v+(n.governmentAircraft[m.id]||0),0);
  // Keep a bounded reserve of the current generation, including during a
  // modernization; older stored aircraft are retired by their own service.
  const count=Math.max(0,Math.min(Math.ceil(capacity/12),desired-(n.governmentAircraft[a.id]||0),Math.ceil(capacity*2)-owned));n.governmentAircraft[a.id]+=count;n.governmentAviators+=count*aircraftSeats(a);
 }
}
