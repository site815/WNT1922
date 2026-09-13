import { readDocument } from "../worker/documents.mjs";
import { merchantEconomy, averageMerchantGRT } from "./merchant-economy.mjs";
import { ECONOMY, recordConvoy, requiredShipping } from "./economy-rules.mjs";
import { campaignMinutes } from "./campaign-clock.mjs";
import { NODES, PORTS, seaRoute, routeLength, distanceNm } from "./world.mjs";
import { fleetPosition, usablePorts } from "./task-forces.mjs";
import { convoyUnderway, convoyTraffic } from "./convoy-traffic.mjs";
const data = await readDocument("common/rules/merchant-routes.md");
const pair = (a,b) => [a,b].sort().join("-");
const name = p => PORTS[p]?.name || data.TERMINALS[p] || p;
const closeNode = (pos, choices=Object.keys(NODES)) => choices.reduce((a,b)=>
  distanceNm(pos,NODES[a]) < distanceNm(pos,NODES[b]) ? a : b);
export const merchantLaneNodes = (s,id) => [...new Set(data.ROUTES[id]
  .filter(([from,to])=>tradeable(s,id,from)&&tradeable(s,id,to))
  .flatMap(([from,to])=>seaRoute(from,to)))];
export function tradeable(s, id, node) {
  const owner = s.world?.portControl?.[node] || PORTS[node]?.nation;
  return (!owner || owner === id || !s.relations[pair(id, owner)]?.war)
    && (s.ports?.[node]?.health ?? 1) > 0;
}
export function shippingPlan(s, c, id) {
  const e = merchantEconomy(s,c,id), n = s.nations[id];
  const routes = data.ROUTES[id].filter(([from,to]) =>
    (s.world?.portControl?.[from] || PORTS[from].nation) === id
    && tradeable(s,id,from) && tradeable(s,id,to));
  const weight = routes.reduce((v,r)=>v+r[2],0), required = requiredShipping(s,id);
  const traffic = convoyTraffic(s,id), now = campaignMinutes(s);
  const transports = n.convoys.filter(v=>v.aviationTransfer && convoyUnderway(v,now)).reduce((v,x)=>v+x.count,0);
  const target = Math.max(0, traffic.targetAtSea - transports);
  const rows = routes.map(([from,to,w]) => {
    const points = seaRoute(from,to).map(k=>NODES[k]);
    const days = routeLength(points)*2 / data.SPEED_KNOTS / 24 + data.PORT_HOURS / 24;
    const demand = required*w/Math.max(1,weight);
    return { key: from+":"+to, from, to, name: name(from)+" ↔ "+name(to), points,
      days, demand, hulls: Math.floor(target*w/Math.max(1,weight)), weight:w };
  });
  // Largest remainders preserve the national target without inventing fractional ships.
  const remainder = target - rows.reduce((v,r)=>v+r.hulls,0);
  const ranked = [...rows].sort((a,b)=>(target*b.weight/weight-b.hulls)-(target*a.weight/weight-a.hulls));
  for(let i=0;i<Math.min(remainder,ranked.length);i++) ranked[i].hulls++;
  const assigned = n.convoys.reduce((v,x)=>v+x.count,0);
  return { required, routes: rows, neededHulls: target, assigned, ...traffic,
    afloatGRT: assigned*e.average,
    monthlyCapacity: rows.reduce((v,r)=>v+n.convoys.filter(x=>x.routeKey===r.key && !x.aborted)
      .reduce((a,x)=>a+x.count,0)*e.average*30/r.days,0) };
}
export function convoyRoute(s,v,target) {
  const now = campaignMinutes(s), position = fleetPosition(s,v);
  let start = closeNode(position);
  if (now < v.arriveAt) {
    let travelled = Math.max(0,now-v.departAt)*v.speed/60;
    for(let i=1;i<v.route.length;i++) {
      const leg=distanceNm(v.route[i-1],v.route[i]);
      if(travelled<=leg) { start=closeNode(v.route[i]); break; }
      travelled-=leg;
    }
  }
  v.route = [position,...seaRoute(start,target).map(k=>NODES[k])];
  v.departAt=now; v.arriveAt=now+routeLength(v.route)/v.speed*60;
  v.node=target; v.targetNode=target;
}
export function syncConvoys(s,c,id,{force=false}={}) {
  const n=s.nations[id], now=campaignMinutes(s);
  if(!force && now<(n.convoyPlanAt ?? -Infinity)) return;
  n.convoyPlanAt=now+60;
  n.convoys=n.convoys.filter(v=>v.count>0);
  const plan=shippingPlan(s,c,id), existing=new Map(plan.routes.map(r=>[r.key,r]));
  // Ships already at sea finish their voyage; they cannot change size or teleport home.
  for(const v of n.convoys) if(!v.aviationTransfer && !existing.has(v.routeKey)) v.retire=true;
  let free=Math.max(0,n.merchant.hulls-n.convoys.reduce((v,x)=>v+x.count,0));
  const initial=!n.convoysMobilized; n.convoysMobilized=true;
  const packet = Math.max(ECONOMY.CONVOY_PACKET, Math.ceil(plan.targetAtSea/data.TARGET_ACTIVE_CONVOYS));
  for(const r of plan.routes) {
    let needed=Math.min(Math.max(0,plan.targetAtSea-convoyTraffic(s,id).hullsAtSea),
      Math.max(0,r.hulls-n.convoys.filter(v=>v.routeKey===r.key && convoyUnderway(v,now)).reduce((v,x)=>v+x.count,0)));
    // Return legs get first use of sailing slots. Any split takes place in harbor.
    for(const v of [...n.convoys].filter(v=>v.routeKey===r.key && v.leg==="unloading" && !v.battleId && now>=v.readyAt)) {
      if(needed<=0) break;
      if(v.count>needed) {
        if(n.convoys.length>=ECONOMY.MAX_CONVOYS) break;
        const waiting={...structuredClone(v),id:"convoy-"+id+"-"+s.nextId++,count:v.count-needed};
        waiting.cargo=waiting.count*v.cargoGRTPerHull;
        n.convoys.push(waiting); v.count=needed; v.cargo=v.count*v.cargoGRTPerHull;
      }
      delete v.readyAt; v.leg="returning"; convoyRoute(s,v,v.port); needed-=v.count;
    }
    needed=Math.min(free,needed);
    while(needed>0 && n.convoys.length<ECONOMY.MAX_CONVOYS) {
      const count=Math.min(needed,packet), duration=routeLength(r.points)/data.SPEED_KNOTS*60;
      const v={id:"convoy-"+id+"-"+s.nextId++,nation:id,name:r.name,count,port:r.from,
        destination:r.to,routeKey:r.key,node:r.from,targetNode:r.to,route:r.points.map(p=>[...p]),
        speed:data.SPEED_KNOTS,lastBattle:-1e9,departAt:now,arriveAt:now+duration,
        voyageStarted:now,leg:"outbound",cargoGRTPerHull:averageMerchantGRT(s,id),cargo:count*averageMerchantGRT(s,id)};
      if(initial) {
        const elapsed=((n.convoys.length+1)*0.61803398875%1)*duration*2;
        v.voyageStarted=now-elapsed;
        if(elapsed>duration) {
          v.leg="returning"; v.route=[...v.route].reverse(); v.targetNode=v.port;
          v.departAt=now-(elapsed-duration); v.arriveAt=v.departAt+duration;
          v.voyageStarted-=data.PORT_HOURS*60;
        } else { v.departAt=now-elapsed; v.arriveAt=v.departAt+duration; }
      }
      n.convoys.push(v); needed-=count; free-=count;
    }
  }
}
export function returnTransport(s,id,v) {
  delete v.aviationTransfer;
  v.leg="returning"; v.retire=true; v.transportReturn=true;
  convoyRoute(s,v,v.port);
}
export function moveConvoys(s,c,id) {
  const n=s.nations[id], now=campaignMinutes(s);
  for(const v of n.convoys) {
    if(v.aviationTransfer || !v.count || v.battleId) continue;
    if(!tradeable(s,id,v.port) || !tradeable(s,id,v.targetNode)) {
      const ports=usablePorts(s,id);
      if(!ports.length) { v.aborted=true; continue; }
      const home=ports.includes(v.port)?v.port:closeNode(fleetPosition(s,v),ports);
      v.aborted=true; v.retire=true; v.leg="returning"; v.port=home;
      convoyRoute(s,v,home);
    }
    if(now<v.arriveAt || v.leg==="unloading") continue;
    if(v.leg==="outbound") {
      v.leg="unloading"; v.route=[NODES[v.targetNode]]; v.departAt=now; v.arriveAt=now;
      v.readyAt=now+data.PORT_HOURS*60;
      n.convoyPlanAt=-1e9;
    } else {
      if(!v.aborted && now>v.voyageStarted) {
        recordConvoy(s,id,{delivered:v.count*(v.cargoGRTPerHull ?? averageMerchantGRT(s,id))});
        n.convoyDeliveries=(n.convoyDeliveries||0)+v.count;
      }
      // Release the hulls at the origin. The next plan can allocate them again.
      v.count=0; n.convoyPlanAt=-1e9;
    }
  }
  syncConvoys(s,c,id);
}
