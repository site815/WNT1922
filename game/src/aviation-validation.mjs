import { aircraftModels, aircraftSeats } from './naval-resources.mjs';
import { PORTS } from './world.mjs';
export function validateAviation(s,c){
 const fail=()=>{throw Error('Invalid aviation inventory or transfer in save.');};
 const amount=v=>Number.isFinite(v)&&v>=0,point=p=>Array.isArray(p)&&p.length===2&&Number.isFinite(p[0])&&Math.abs(p[0])<=180&&Number.isFinite(p[1])&&Math.abs(p[1])<=90;
 for(const [id,n]of Object.entries(s.nations)){
  if(n.airWarehousePort!==null&&!PORTS[n.airWarehousePort])fail();
  if(!n.airBases||typeof n.airBases!=='object'||Array.isArray(n.airBases)||!Array.isArray(n.airTransfers)||n.airTransfers.length>1000||!Array.isArray(n.airLog)||n.airLog.length>20||!n.aviationSuppliesSpent||!amount(n.aviationSuppliesSpent.gold)||!amount(n.aviationSuppliesSpent.industry))fail();
  const models=new Map(aircraftModels(c,id).map(a=>[a.id,a])),allocated={};let people=0;
  const wings=rows=>{if(!Array.isArray(rows)||rows.length>100)fail();for(const w of rows){if(!w||!models.has(w.model)||!['fighter','strike','scout'].includes(w.role)||!Number.isInteger(w.count)||!amount(w.count)||!Number.isInteger(w.crewed)||!amount(w.crewed)||w.crewed>w.count)fail();allocated[w.model]=(allocated[w.model]||0)+w.count;people+=w.crewed*aircraftSeats(models.get(w.model));}};
  for(const g of n.groups)wings(g.airWing);
  for(const [port,b]of Object.entries(n.airBases)){if(!PORTS[port]||!b||!amount(b.supplies)||!Number.isFinite(b.lastSortie)||!Number.isFinite(b.nextDispatch))fail();wings(b.airWing);wings(b.reserve);}
  const ids=new Set();for(const t of n.airTransfers){if(!t||typeof t.id!=='string'||ids.has(t.id)||!PORTS[t.source]||!['ferry','rail','merchant'].includes(t.mode)||!amount(t.supplies)||!Number.isFinite(t.departAt)||!Number.isFinite(t.arriveAt)||t.arriveAt<t.departAt||!Array.isArray(t.route)||!t.route.every(point)||!Array.isArray(t.path)||!Number.isInteger(t.leg)||t.leg<0)fail();ids.add(t.id);wings(t.airWing);if(t.mode==='merchant'&&(!Number.isInteger(t.lastCount)||t.lastCount<0||!n.convoys.some(v=>v.id===t.convoyId&&v.aviationTransfer===t.id)))fail();}
  for(const [model,count]of Object.entries(allocated))if(count>n.aircraft[model])fail();if(people>n.aviators+1e-6)fail();
 }
 return true;
}
