import { distanceNm } from './world.mjs';
// This radius is shared by convoy interception and the chart overlay.
export const ESCORT_RADIUS_NM=80;
export const escortEligible=r=>r.kind==='fleet'&&r.f.mission==='guard'&&!['port','refuel','repair','returning','reinforcing'].includes(r.f.phase)&&!['repair','reinforcement','support','submarine'].includes(r.f.role);
export const escortsForConvoy=(rows,target)=>rows.filter(r=>r.id===target.id&&escortEligible(r)&&distanceNm(r.position,target.position)<ESCORT_RADIUS_NM);
export function coverageAt(escorts,position){
 const nearby=escorts.map(e=>({...e,distance:distanceNm(e.position,position)})).sort((a,b)=>a.distance-b.distance);
 const covering=nearby.filter(e=>e.distance<ESCORT_RADIUS_NM&&e.defense>0);
 return {escorts:covering.map(e=>e.id),defense:covering.reduce((v,e)=>v+e.defense,0),nearestKm:nearby.length?nearby[0].distance*1.852:null};
}
// Geodesic coverage, subsequently clipped at the Equal Earth seam.
export function escortCircle([lon,lat],radius=ESCORT_RADIUS_NM){
 const angular=radius/3440.065,phi=lat*Math.PI/180,lambda=lon*Math.PI/180,points=[];
 for(let i=0;i<=32;i++){const bearing=i*Math.PI/16,p=Math.asin(Math.sin(phi)*Math.cos(angular)+Math.cos(phi)*Math.sin(angular)*Math.cos(bearing)),l=lambda+Math.atan2(Math.sin(bearing)*Math.sin(angular)*Math.cos(phi),Math.cos(angular)-Math.sin(phi)*Math.sin(p));points.push([l*180/Math.PI,p*180/Math.PI]);}
 return points;
}
