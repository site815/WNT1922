import { baseAirPower } from './base-aviation.mjs';
import { PORT_CATALOG, PORT_TIERS, portSpec } from './port-catalog.mjs';
export { PORT_TIERS, portSpec };
import { PORTS, NODES, HOME_PORT, distanceNm } from './world.mjs';
import { campaignMinutes } from './campaign-clock.mjs';
import { upgradeLevel } from './levels.mjs';
import { nearestSupplyPort } from './logistics.mjs';
import { fleetPosition } from './task-forces.mjs';
import { depotCapacity } from './support-effects.mjs';
export const PORT_SPECS=PORT_CATALOG;
export const PORT_REPAIR={healthPerDay:.008,goldPerHealth:16000,industryPerHealth:12000,safeMinutes:1440};
export function initializePorts(s){s.ports??=Object.fromEntries(Object.keys(PORTS).map(id=>[id,{health:1,blockade:0,lastAttack:-1e9,repairSpent:{gold:0,industry:0}}]));}
export const portOwner=(s,id)=>s.world?.portControl?.[id]||PORTS[id]?.nation;
const loads=new WeakMap();
export function invalidatePorts(s){loads.delete(s);}
function portLoads(s,c){
 const minute=campaignMinutes(s),cached=loads.get(s);if(cached?.minute===minute)return cached.result;
 const result={};for(const n of Object.values(s.nations)){
  // Charge the port that supplies the force's current position, not a future
  // destination written into its orders. Allies also consume local capacity.
  const bases=new Map(n.fleets.map(f=>[f.id,nearestSupplyPort(s,n.id,fleetPosition(s,f)).port]));
  for(const g of n.groups){if(!g.count||g.service!=='warship'||!['active','returning','repair'].includes(g.status))continue;const port=g.fleetId?bases.get(g.fleetId):g.dockPort||HOME_PORT[n.id];if(port)result[port]=(result[port]||0)+c.classes[g.classId].tons*g.count;}
 }loads.set(s,{minute,result});return result;
}
export function portSummary(s,c,id){
 const p=portSpec(s,id),condition=s.ports?.[id]||{health:1,lastAttack:-1e9},owner=portOwner(s,id),n=s.nations[owner],health=condition.health;
 const air=baseAirPower(s,c,id),assignedAircraft=air.aircraft,shoreAircraft=Object.values(n?.airBases||{}).reduce((v,b)=>v+b.airWing.reduce((v,w)=>v+w.count,0),0);
 const artillery=p.artillery*health*(1+upgradeLevel(n?.tech,'gunnery')*.06),aviation=air.strike;
 const demand=c?(portLoads(s,c)[id]||0):0;
 const depotSupport=Math.min(p.capacity,depotCapacity(s,c,id))*health,capacity=p.capacity*health+depotSupport,coverage=capacity>0?Math.min(1,capacity/Math.max(1,demand)):0;
 return {...p,air,baseAviation:n?.airBases?.[id],depotSupport,tierName:PORT_TIERS[p.tier],blockade:condition.blockade||0,effectiveTrade:p.trade*health*(1-(condition.blockade||0)),assignedAircraft,shoreAircraft,health,owner,capacity,demand,coverage,artillery,aviation,combat:artillery+aviation,airRange:air.radius/1.852,underAttack:campaignMinutes(s)-condition.lastAttack<PORT_REPAIR.safeMinutes,repairCost:{gold:PORT_REPAIR.goldPerHealth*PORT_REPAIR.healthPerDay,industry:PORT_REPAIR.industryPerHealth*PORT_REPAIR.healthPerDay}};
}
export function damagePort(s,id,fraction){initializePorts(s);const p=s.ports[id],damage=Math.min(p.health,Math.max(0,fraction));p.health-=damage;p.lastAttack=campaignMinutes(s);return damage;}
export function repairPorts(s){initializePorts(s);for(const [id,p]of Object.entries(s.ports)){
 if(p.health>=1||campaignMinutes(s)-p.lastAttack<PORT_REPAIR.safeMinutes)continue;
 const n=s.nations[portOwner(s,id)];if(!n)continue;
 const amount=Math.min(1-p.health,PORT_REPAIR.healthPerDay,n.gold/PORT_REPAIR.goldPerHealth,n.industry/PORT_REPAIR.industryPerHealth);
 const gold=amount*PORT_REPAIR.goldPerHealth,industry=amount*PORT_REPAIR.industryPerHealth;p.health+=amount;n.gold=Math.max(0,n.gold-gold);n.industry=Math.max(0,n.industry-industry);p.repairSpent.gold+=gold;p.repairSpent.industry+=industry;
}}
export function portNear(position,range=25){return Object.keys(PORTS).filter(id=>distanceNm(position,NODES[id])<=range).sort((a,b)=>distanceNm(position,NODES[a])-distanceNm(position,NODES[b]))[0];}
