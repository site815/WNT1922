import { PORTS, NODES, distanceNm } from './world.mjs';
import { campaignMinutes } from './campaign-clock.mjs';
import { baseAirPower, aviationOwner } from './base-aviation.mjs';
import { fleetPosition, fleetStats, operationRandom, recordContact } from './task-forces.mjs';
// Patrols are an hourly strategic search, paid from the daily aviation-store
// allowance. Reports use actual observations, never a live enemy map marker.
export function coastalRecon(s,c){
 const now=campaignMinutes(s);if(((Math.floor(now)%60)+60)%60!==17)return;
 const forces=[];for(const [id,n]of Object.entries(s.nations))for(const f of n.fleets)forces.push({id,f,position:fleetPosition(s,f)});
 for(const [id,n]of Object.entries(s.nations))for(const port of Object.keys(n.airBases||{})){
  if(aviationOwner(s,port)!==id)continue;const air=baseAirPower(s,c,port);if(air.scout<=0||air.readiness<=0)continue;
  for(const target of forces){if(target.id===id||Math.abs(target.position[1]-NODES[port][1])*111.2>air.radius)continue;
   const distance=distanceNm(NODES[port],target.position)*1.852;if(distance>air.radius)continue;
   const search=baseAirPower(s,c,port,distance).scout;if(search<=0)continue;
   const existing=n.contacts.find(x=>x.id===target.f.id);if(existing&&now-existing.seenAt<45)continue;
   const chance=Math.min(.8,.08+search*.018)*Math.max(.1,1-distance/Math.max(1,air.radius)*.8);
   if(operationRandom(s)<chance){const stats=fleetStats(s,c,target.id,target.f);if(stats.hulls)recordContact(s,id,target.id,target.f,target.position,stats,'Scouting');}
  }
 }
}
