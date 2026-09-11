import { portSummary } from './ports.mjs';
import { NODES, PORTS, seaRoute, routeLength, distanceNm } from './world.mjs';
import { fleetPosition, usablePorts } from './task-forces.mjs';
import { PRIORITIES } from './catalog.mjs';
import { merchantEconomy } from './merchant-economy.mjs';

// Provisional distance steps, measured along the navigable sea graph.
export const SUPPLY_BANDS=[{nm:500,factor:1},{nm:1500,factor:.9},{nm:3000,factor:.75},{nm:5000,factor:.55},{nm:8000,factor:.35},{nm:1000000,factor:.2}];
const paths=new Map();
const laneDistance=(a,b)=>{const k=a+':'+b;if(!paths.has(k))paths.set(k,routeLength(seaRoute(a,b).map(n=>NODES[n])));return paths.get(k);};
export function nearestSupplyPort(s,id,position){
  const ports=usablePorts(s,id);
  let nearest=null,distance=100000;
  if(position){const node=Object.keys(NODES).reduce((a,b)=>distanceNm(NODES[a],position)<distanceNm(NODES[b],position)?a:b);for(const port of ports){const d=distanceNm(position,NODES[port])<25?distanceNm(position,NODES[port]):distanceNm(position,NODES[node])+laneDistance(node,port);if(d<distance){distance=d;nearest=port;}}}
  return {port:nearest,distance};
}
export function supplyDetails(s,c,id,f=null){
  const n=s.nations[id],position=f?fleetPosition(s,f):NODES[n.fleets?.[0]?.port||Object.keys(PORTS).find(p=>PORTS[p].nation===id)];
  const {port:nearest,distance}=nearestSupplyPort(s,id,position);
  const band=SUPPLY_BANDS.find(b=>distance<=b.nm)||SUPPLY_BANDS.at(-1),distanceFactor=nearest?Math.min(1,band.factor+replenishmentRelief(s,f)):.1,mission=PRIORITIES[f?.mission||n.priority]?.supply||1;
  const portCapacity=nearest?portSummary(s,c,nearest):null,capacityFactor=portCapacity?.coverage??0;
  const economy=merchantEconomy(s,c,id),factor=Math.max(.05,Math.min(1,economy.logistics/100*distanceFactor*capacityFactor*(.55+n.commerce/220)*mission));
  return {factor,replenishment:replenishmentRelief(s,f),capacityFactor,portCapacity,distance,port:nearest,portName:nearest?PORTS[nearest].name:'No accessible friendly port',distanceFactor,logistics:economy.logistics,baseLogistics:n.logistics,trade:n.commerce,training:n.training,morale:n.morale};
}
import { replenishmentRelief } from './support-effects.mjs';
