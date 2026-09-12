import { aircraftModels, modelAvailable, planeRole, staffAircraft } from "./naval-resources.mjs";
import { aircraftBasing } from "./aircraft-compatibility.mjs";
import { freeAircraft, aviationAccess } from "./base-aviation.mjs";

export function navalAircraftInventory(s,c,id=s.player) {
  const n=s.nations[id], free=freeAircraft(n), models=aircraftModels(c,id);
  const count=(wings,model)=>wings.reduce((v,w)=>v+(w.model===model?w.count:0),0);
  return models.map(a=>{
    const embarked=count(n.groups.flatMap(g=>g.airWing||[]),a.id);
    const ashore=count(Object.values(n.airBases).flatMap(b=>b.airWing),a.id);
    const transit=count([...n.airTransfers,...n.airSorties].flatMap(t=>t.airWing),a.id);
    const reserve=Math.max(0,(n.aircraft[a.id]||0)-embarked-ashore-transit);
    const retireable=(free[a.id]||0)+Object.entries(n.airBases)
      .filter(([port])=>aviationAccess(s,id,port)).reduce((v,[,b])=>v+count(b.reserve,a.id),0);
    const basing=aircraftBasing(a), role=planeRole(a);
    const replacement=models.filter(b=>b.type_year>a.type_year && modelAvailable(s,n,b)
      && (planeRole(b)===role || planeRole(b)==="multirole")
      && Object.entries(basing).every(([key,value])=>!value||aircraftBasing(b)[key]))
      .sort((a,b)=>b.type_year-a.type_year)[0];
    const producing=Object.values(n.productionModels).includes(a.id);
    const block=!replacement?"No newer developed model covers this role and basing."
      :producing?"Select a replacement on every production line using this model first."
      :retireable<1?"No reserve airframes are available. Aircraft in service or transit remain assigned.":"";
    return {model:a,owned:n.aircraft[a.id]||0,embarked,ashore,transit,reserve,retireable,replacement,block};
  });
}
export function retireAircraft(s,c,model,id=s.player) {
  const n=s.nations[id], row=navalAircraftInventory(s,c,id).find(r=>r.model.id===model);
  if(!row) throw Error("Only your naval aircraft can be retired here.");
  if(row.block) throw Error(row.block);
  for(const [port,b] of Object.entries(n.airBases)) if(aviationAccess(s,id,port))
    b.reserve=b.reserve.filter(w=>w.model!==model);
  n.aircraft[model]-=row.retireable;
  staffAircraft(s,c,id);
  return {count:row.retireable,name:row.model.name};
}
