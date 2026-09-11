import { releaseShipAircraft } from './base-aviation.mjs';
// Personnel totals already include people aboard ships: disbanding a crew frees
// its assignment, it does not create a second copy of the returning personnel.
export function completeScrapping(s,c,n,g){
  if(!g.count||['sunk','scrapped'].includes(g.status))return 0;
  const salvage=Math.floor(c.classes[g.classId].tons*g.count*.05*g.health);
  releaseShipAircraft(s,c,n,g);n.industry+=salvage;g.status='scrapped';g.sailors=0;g.atSea=false;g.airWing=[];
  for(const key of ['fleetId','joinAt','joinArea','scrapOnArrival','reserveOnArrival'])delete g[key];
  if(n.id===s.player){s.log.unshift({id:s.nextId++,day:s.day,minute:(s.day+s.fraction)*1440,kind:'industry',text:g.name+' scrapped in port. '+salvage.toLocaleString('en-US')+' industry recovered.'});s.log=s.log.slice(0,140);}
  return salvage;
}
