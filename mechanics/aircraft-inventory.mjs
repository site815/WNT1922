import { aircraftModels, modelAvailable, planeRole, staffAircraft } from "./naval-resources.mjs";
import { aircraftBasing } from "./aircraft-compatibility.mjs";
import { freeAircraft, aviationAccess, aviationLog } from "./base-aviation.mjs";
import { returnTransport } from "./merchant-convoys.mjs";
import { invalidateOperations } from "./task-forces.mjs";

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
    const productionBlock=!replacement?"No newer available model covers this role and basing."
      :producing?"Select a replacement on every production line using this model first.":"";
    const block=productionBlock || (retireable<1?"No reserve airframes are available. Aircraft in service or transit remain assigned.":"");
    const allBlock=productionBlock || (n.airOrders.some(o=>o.model===a.id)
      ?"Complete outstanding aircraft orders for this model before retiring all airframes."
      :!n.aircraft[a.id]?"No airframes of this model remain.":"");
    return {model:a,owned:n.aircraft[a.id]||0,embarked,ashore,transit,reserve,retireable,replacement,block,allBlock};
  });
}
export function retireAircraft(s,c,model,id=s.player,scope="reserves") {
  if(!["reserves","all"].includes(scope)) throw Error("Choose reserve airframes or all airframes.");
  const n=s.nations[id], row=navalAircraftInventory(s,c,id).find(r=>r.model.id===model);
  if(!row) throw Error("Only your naval aircraft can be retired here.");
  const block=scope==="all"?row.allBlock:row.block;
  if(block) throw Error(block);
  const remove=wings=>wings.filter(w=>w.model!==model);
  if(scope==="all") {
    for(const g of n.groups) g.airWing=remove(g.airWing);
    for(const b of Object.values(n.airBases)) {
      b.airWing=remove(b.airWing);
      b.reserve=remove(b.reserve);
    }
    for(const t of n.airTransfers) {
      if(!t.airWing.some(w=>w.model===model)) continue;
      t.airWing=remove(t.airWing);
      const convoy=n.convoys.find(v=>v.id===t.convoyId && v.aviationTransfer===t.id);
      if(convoy) {
        convoy.cargo=t.airWing.reduce((v,w)=>v+w.count,0)*10;
        if(!convoy.cargo) {
          convoy.voyageStarted ??= convoy.departAt;
          convoy.aborted=true;
          // The airframes retire immediately; their transport hulls still sail home.
          returnTransport(s,id,convoy);
        }
      }
      if(!t.airWing.some(w=>w.count)) t.done=true;
    }
    n.airTransfers=n.airTransfers.filter(t=>!t.done);
    for(const op of n.airSorties) {
      if(!op.airWing.some(w=>w.model===model)) continue;
      op.airWing=remove(op.airWing);
      op.strikes=op.airWing.filter(w=>["strike","bomber"].includes(w.role)).reduce((v,w)=>v+w.crewed,0);
      op.escorts=op.airWing.filter(w=>w.role==="fighter").reduce((v,w)=>v+w.crewed,0);
      // Keep the flight record until normal recovery closes reports and mission state.
    }
  } else for(const [port,b] of Object.entries(n.airBases)) if(aviationAccess(s,id,port))
    b.reserve=remove(b.reserve);
  const count=scope==="all"?row.owned:row.retireable;
  n.aircraft[model]-=count;
  staffAircraft(s,c,id);
  invalidateOperations(s);
  aviationLog(s,n,count+" "+row.model.name+" airframes retired"+(scope==="all"?" from all assignments":" from reserve")+"; aviators retained.");
  return {count,name:row.model.name,scope};
}
