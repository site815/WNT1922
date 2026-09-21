import test from "node:test";
import assert from "node:assert/strict";
import { CATALOG } from "../worker/catalog-loader.mjs";
import { newGame, resolveAirAttack } from "../mechanics/engine.mjs";
import { contentFor } from "../mechanics/campaign-content.mjs";
import { automaticAircraftDraft, commissionAircraft } from "../mechanics/aircraft-designer.mjs";
import { navalAircraftInventory } from "../mechanics/aircraft-inventory.mjs";
import { applyCommand } from "../mechanics/game-actions.mjs";
import { allocatedWings, freeAircraft } from "../mechanics/base-aviation.mjs";
import { allocateAircraft, dailyResources, staffAircraft } from "../mechanics/naval-resources.mjs";
import { minuteAviation } from "../mechanics/aviation-transfer.mjs";
import { minuteAirOperations } from "../mechanics/air-operations.mjs";
import { beginEngagement, progressEngagements } from "../mechanics/engagements.mjs";
import { moveConvoys } from "../mechanics/merchant-convoys.mjs";
import { campaignMinutes, setCampaignMinutes } from "../mechanics/campaign-clock.mjs";
import { exportSave, validateSave } from "../mechanics/state-io.mjs";
import { NODES } from "../mechanics/world.mjs";
import { aircraftCatalogView } from "../ui/ministry-view.mjs";

function start(id="USA") {
  const s=newGame(CATALOG,"USA",330033,"in_good_faith_1936");
  let c=contentFor(CATALOG,s);
  setCampaignMinutes(s,Date.UTC(1937,0,1,12)/60000);
  commissionAircraft(s,c,automaticAircraftDraft(s,c,"fighter",id),id);
  c=contentFor(CATALOG,s);
  const n=s.nations[id], row=navalAircraftInventory(s,c,id).find(r=>r.replacement);
  assert.ok(row,"a current replacement exists");
  for(const [role,model] of Object.entries(n.productionModels)) if(model===row.model.id)
    n.productionModels[role]=row.replacement.id;
  for(const g of n.groups) g.airWing=[];
  for(const b of Object.values(n.airBases)) { b.airWing=[]; b.reserve=[]; }
  n.airTransfers=[]; n.airSorties=[];
  for(const model of Object.keys(n.aircraft)) n.aircraft[model]=0;
  n.aviators=1000;
  staffAircraft(s,c,id);
  return {s,c,n,id,model:row.model.id,other:row.replacement.id};
}
const retire=(f,scope="all")=>applyCommand(f.s,CATALOG,{type:"retire-aircraft",args:{id:f.model,scope}},f.id);
function add(f,wings,count,{model=f.model,...extra}={}) {
  const w={model,role:"fighter",count,crewed:count,...extra};
  wings.push(w); f.n.aircraft[model]+=count; return w;
}
function transfer(f,mode,{mixed=false}={}) {
  const {s,n}=f, now=campaignMinutes(s), source="mare_island",destination="hawaii";
  const t={id:"air-transfer-"+s.nextId++,source,destination,mode,airWing:[],replace:false,
    departAt:now,arriveAt:now+1440,route:[NODES[source],NODES[destination]],path:[source,destination],leg:0};
  add(f,t.airWing,3);
  if(mixed) add(f,t.airWing,2,{model:f.other});
  if(mode==="merchant") {
    t.convoyId="convoy-air-"+s.nextId++; t.lastCount=1;
    n.convoys.push({id:t.convoyId,nation:f.id,name:"Aircraft transport",count:1,port:source,node:destination,
      targetNode:destination,route:structuredClone(t.route),departAt:now,arriveAt:t.arriveAt,speed:10,
      lastBattle:-1e9,cargo:t.airWing.reduce((v,w)=>v+w.count,0)*10,aviationTransfer:t.id});
  }
  n.airTransfers.push(t); return t;
}
function sortie(f,phase,{mixed=false}={}) {
  const {s,n}=f, now=campaignMinutes(s);
  const op={id:"sortie-"+s.nextId++,fleetId:null,sourcePort:"mare_island",targetNation:"JPN",targetId:"yokosuka",
    targetKind:"port",operation:"strike",phase,startedAt:now,readyAt:now+30,assembly:30,
    airWing:[],position:[...NODES.mare_island],targetPosition:[...NODES.yokosuka],rangeKm:20000,
    outboundKm:8000,cruise:300,strikes:0,escorts:3};
  if(!["assembling","rearming"].includes(phase)) add(f,op.airWing,3,{homePort:"mare_island"});
  if(mixed) { add(f,op.airWing,2,{model:f.other,homePort:"mare_island"}); op.escorts+=2; }
  n.airSorties.push(op); return op;
}
function assertRetired(f) {
  assert.equal(f.n.aircraft[f.model],0);
  assert.equal(freeAircraft(f.n)[f.model],0);
  assert.equal(allocatedWings(f.n).some(w=>w.model===f.model),false);
  assert.equal(f.n.shoreWing.some(w=>w.model===f.model),false);
  validateSave(f.s,CATALOG);
}

test("Retire all removes deployed naval airframes, retains personnel and other nations, and remains actor-scoped",()=>{
  for(const id of ["USA","GBR"]) {
    const f=start(id),{s,c,n,model}=f;
    const group=n.groups.find(g=>c.classes[g.classId].air>0),base=Object.values(n.airBases)[0];
    assert.ok(group);
    add(f,group.airWing,4); add(f,base.airWing,3); add(f,base.reserve,2);
    n.aircraft[model]+=5;
    add(f,base.airWing,2,{model:f.other});
    staffAircraft(s,c,id); validateSave(s,CATALOG);
    const inventory=navalAircraftInventory(s,c,id).find(r=>r.model.id===model);
    const crews=n.aviators,government=JSON.stringify([n.governmentAircraft,n.governmentAviators,Object.values(n.airBases).map(b=>b.governmentWing)]);
    const losses=JSON.stringify(n.casualties),resources=[n.gold,n.industry,n.strategic],foreign=JSON.stringify(s.nations[id==="USA"?"GBR":"USA"]);
    assert.equal(retire(f).count,inventory.owned);
    assertRetired(f); assert.equal(n.aviators,crews); assert.equal(n.aircraft[f.other],2);
    assert.equal(JSON.stringify(n.casualties),losses); assert.deepEqual([n.gold,n.industry,n.strategic],resources);
    assert.equal(JSON.stringify([n.governmentAircraft,n.governmentAviators,Object.values(n.airBases).map(b=>b.governmentWing)]),government);
    assert.equal(JSON.stringify(s.nations[id==="USA"?"GBR":"USA"]),foreign);
    const saved=validateSave(JSON.parse(exportSave(s)),CATALOG);
    assert.equal(saved.nations[id].aircraft[model],0);
  }
});

test("Reserve retirement and all retirement have separate availability and reject invalid requests without mutation",()=>{
  const f=start(),{s,c,n,model}=f;
  add(f,Object.values(n.airBases)[0].airWing,6);
  staffAircraft(s,c,"USA"); validateSave(s,CATALOG);
  const row=navalAircraftInventory(s,c).find(r=>r.model.id===model);
  assert.equal(row.retireable,0); assert.match(row.block,/No reserve/); assert.equal(row.allBlock,"");
  const html=aircraftCatalogView(s,c);
  assert.match(html,new RegExp('data-action="retire-aircraft" data-id="'+model+'" disabled'));
  assert.match(html,new RegExp('data-action="retire-aircraft-all" data-id="'+model+'"  title='));
  for(const scope of ["reserves","invalid",null]) {
    const before=JSON.stringify(n); assert.throws(()=>retire(f,scope)); assert.equal(JSON.stringify(n),before);
  }
  n.productionModels.fighter=model;
  let before=JSON.stringify(n); assert.throws(()=>retire(f),/production line/); assert.equal(JSON.stringify(n),before);
  n.productionModels.fighter=f.other;
  n.airOrders.push({id:"air-"+s.nextId++,model,count:2,remaining:1,days:10,paid:{gold:0,industry:0,strategic:0,days:10}});
  before=JSON.stringify(n); assert.throws(()=>retire(f),/outstanding aircraft orders/); assert.equal(JSON.stringify(n),before);
  n.airOrders=[];
  before=JSON.stringify(n);
  assert.throws(()=>applyCommand(s,CATALOG,{type:"retire-aircraft",args:{id:c.nations.USA.armyAircraft[0].id,scope:"all"}}),/Only your naval/);
  assert.equal(JSON.stringify(n),before);
  assert.equal(retire(f).count,6); assertRetired(f);
  assert.throws(()=>retire(f),/No airframes/);
});

test("Retired ferry and rail cargo cannot arrive; empty merchant transports return with their real hulls",()=>{
  const f=start(),{s,c,n}=f;
  const ferry=transfer(f,"ferry"),rail=transfer(f,"rail"),empty=transfer(f,"merchant"),mixed=transfer(f,"merchant",{mixed:true});
  const emptyConvoy=n.convoys.find(v=>v.id===empty.convoyId),mixedConvoy=n.convoys.find(v=>v.id===mixed.convoyId);
  setCampaignMinutes(s,campaignMinutes(s)+60); staffAircraft(s,c,"USA"); validateSave(s,CATALOG);
  const hulls=n.merchant.hulls,crews=n.aviators,losses=JSON.stringify(n.casualties),stock=n.aircraft[f.other];
  assert.equal(retire(f).count,12);
  assertRetired(f);
  assert.deepEqual(n.airTransfers.map(t=>t.id),[mixed.id]);
  assert.equal(emptyConvoy.aviationTransfer,undefined); assert.equal(emptyConvoy.cargo,0);
  assert.equal(emptyConvoy.count,1); assert.equal(emptyConvoy.leg,"returning"); assert.equal(emptyConvoy.targetNode,emptyConvoy.port);
  assert.equal(emptyConvoy.aborted,true); assert.equal(emptyConvoy.transportReturn,true);
  assert.equal(mixedConvoy.aviationTransfer,mixed.id); assert.equal(mixedConvoy.cargo,20);
  setCampaignMinutes(s,Math.max(ferry.arriveAt,rail.arriveAt,emptyConvoy.arriveAt,mixed.arriveAt)+1);
  minuteAviation(s,c); moveConvoys(s,c,"USA"); allocateAircraft(s,c,"USA");
  assertRetired(f); assert.equal(n.airTransfers.length,0); assert.equal(n.aircraft[f.other],stock);
  assert.equal(n.merchant.hulls,hulls); assert.equal(n.aviators,crews); assert.equal(JSON.stringify(n.casualties),losses);
  const loaded=validateSave(JSON.parse(exportSave(s)),CATALOG);
  minuteAviation(loaded,contentFor(CATALOG,loaded)); assert.equal(loaded.nations.USA.aircraft[f.model],0);
});

test("Airborne retirement preserves mixed flights and empty sorties complete every phase without resurrection or phantom combat",()=>{
  for(const phase of ["assembling","outbound","engaging","returning","rearming"]) {
    const f=start(),{s,c,n}=f;
    const op=sortie(f,phase);
    add(f,n.airBases.mare_island.airWing,2);
    Object.assign(s.relations["JPN-USA"],{war:true,allied:false,warSince:s.day});
    let report;
    if(phase==="engaging") {
      report=beginEngagement(s,c,{kind:"air",a:"USA",b:"JPN",port:"yokosuka",operation:"strike",opId:op.id,position:NODES.yokosuka});
      op.reportId=report.id;
    }
    staffAircraft(s,c,"USA"); validateSave(s,CATALOG);
    const crews=n.aviators,losses=JSON.stringify(n.casualties),portHealth=s.ports.yokosuka.health;
    retire(f); assertRetired(f);
    assert.equal(resolveAirAttack(s,c,"USA",op,NODES.yokosuka),null,"an empty flight cannot create a battle");
    for(let i=0;i<9;i++) {
      setCampaignMinutes(s,Math.max(campaignMinutes(s)+1,op.readyAt,report?.nextStageAt||0)+1);
      progressEngagements(s,c);
      minuteAirOperations(s,c,(id,flight,position)=>resolveAirAttack(s,c,id,flight,position));
      assertRetired(f);
    }
    assert.equal(n.airSorties.length,0,phase+" flight finishes");
    assert.equal(n.aviators,crews); assert.equal(JSON.stringify(n.casualties),losses); assert.equal(s.ports.yokosuka.health,portHealth);
    if(report) assert.equal(report.status,"completed");
  }
  const f=start(),op=sortie(f,"returning",{mixed:true}),beforeOther=f.n.aircraft[f.other];
  staffAircraft(f.s,f.c,"USA"); retire(f);
  assert.equal(op.escorts,2); assert.equal(op.strikes,0); assert.deepEqual(op.airWing.map(w=>w.model),[f.other]);
  setCampaignMinutes(f.s,op.readyAt+1); minuteAirOperations(f.s,f.c,()=>assert.fail("returning flight must not attack"));
  assertRetired(f); assert.equal(f.n.aircraft[f.other],beforeOther);
  assert.equal(f.n.airBases.mare_island.airWing.find(w=>w.model===f.other)?.count,2);
});

test("Daily staffing and production never recreate a fully retired model after its lines change",()=>{
  const f=start(); add(f,f.n.airBases.mare_island.reserve,8);
  f.n.airProductionCarry[f.model]=0.75;
  staffAircraft(f.s,f.c,"USA"); retire(f);
  for(let day=0;day<3;day++) {
    setCampaignMinutes(f.s,campaignMinutes(f.s)+1440);
    dailyResources(f.s,f.c,()=>{}); assertRetired(f);
  }
});
