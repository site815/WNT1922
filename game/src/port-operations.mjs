import { PORTS,NODES,HOME_PORT,distanceNm } from './world.mjs';
import { campaignMinutes } from './campaign-clock.mjs';
import { portOwner,portSummary } from './ports.mjs';
import { fleetPosition,fleetStats,operationRandom,setRoute,usablePorts } from './task-forces.mjs';
const key=(a,b)=>[a,b].sort().join('-');
export const PORT_MISSIONS=['anchorage','siege'];
export function anchoredShips(s,c,owner,port){const n=s.nations[owner];return n.groups.filter(g=>{
 if(!g.count||!['warship','support'].includes(g.service)||!['active','repair','reserve'].includes(g.status))return false;
 const f=n.fleets.find(f=>f.id===g.fleetId);return f?['port','refuel','repair'].includes(f.phase)&&distanceNm(fleetPosition(s,f),NODES[port])<25:(g.dockPort||HOME_PORT[owner])===port;
});}
export function portCandidates(s,c,id,f){
 const pos=fleetPosition(s,f),st=fleetStats(s,c,id,f);if(st.submarines===st.hulls||!st.hulls)return [];
 return Object.keys(PORTS).filter(port=>s.relations[key(id,portOwner(s,port))]?.war).map(port=>{
 const p=portSummary(s,c,port),distance=distanceNm(pos,NODES[port]),strength=st.surface*2+st.air*12;
 // Intelligence and harbor traffic guide a raid; a siege values the supply base itself.
 const seen=s.nations[id].contacts.some(x=>x.nation===p.owner&&distanceNm(x.position,NODES[port])<80);
 const value=f.mission==='anchorage'?(seen?3:1):p.capacity/100000;
 return {port,score:value/(1+distance/400),risk:p.combat/Math.max(1,strength)};
 }).filter(x=>f.aggressiveBattle||x.risk<1.7).sort((a,b)=>b.score-a.score).map(x=>x.port);
}
export function minutePortOperations(s,c,resolve){
 const now=campaignMinutes(s);if(((Math.floor(now)%15)+15)%15!==7)return;
 const defenses=new Map(Object.keys(PORTS).map(port=>[port,portSummary(s,c,port)]));
 const enemies=Object.fromEntries(Object.keys(s.nations).map(id=>[id,[...defenses].filter(([,p])=>s.relations[key(id,p.owner)]?.war)]));
 for(const [id,n]of Object.entries(s.nations))for(const f of [...n.fleets]){
  if((f.nextPortAction??-1e9)>now||['repair','reinforcement'].includes(f.role))continue;
  const st=fleetStats(s,c,id,f);if(!st.hulls)continue;
  const pos=fleetPosition(s,f),objective=PORT_MISSIONS.includes(f.mission)&&PORTS[f.objectiveNode]&&s.relations[key(id,portOwner(s,f.objectiveNode))]?.war?f.objectiveNode:null;
  let port=objective,distance=objective?distanceNm(pos,NODES[objective]):Infinity;
  if(!port)for(const [candidate,p]of enemies[id]){const range=Math.max(p.aviation>0?p.airRange:0,p.artillery>0?p.gunRange:0);if(Math.abs(pos[1]-NODES[candidate][1])*60>range)continue;const d=distanceNm(pos,NODES[candidate]);if(d<range&&d<distance){port=candidate;distance=d;}}
  if(!port)continue;const p=defenses.get(port);
  const attacking=objective&&distance<Math.max(18,st.air?Math.min(160,st.airRadius):18),inRange=distance<Math.max(p.aviation>0?p.airRange:0,p.artillery>0?p.gunRange:0);
  if(!attacking&&(!inRange||operationRandom(s)>.12||st.submarines===st.hulls))continue;
  f.nextPortAction=now+300+Math.floor(operationRandom(s)*180);
  resolve(id,f,port,attacking?f.mission:'shore',distance);
  if(attacking){s.ports[port].lastAttack=now;f.fuelNm=Math.max(0,f.fuelNm-st.speed*3);}
  if(attacking&&f.mission==='siege'&&st.health>.65&&f.fuelNm>st.range*.25){f.nextPlanAt=Math.max(f.nextPlanAt,now+720);}
  else if(attacking||f.role==='repair'){
   delete f.objectiveNode;const ports=usablePorts(s,id);if(ports.length){const home=ports.sort((a,b)=>distanceNm(pos,NODES[a])-distanceNm(pos,NODES[b]))[0];f.port=home;f.raidingReturn=true;setRoute(s,c,id,f,home,{phase:'passage',position:pos});}
  }
 }
}
