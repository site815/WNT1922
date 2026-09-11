// Equal Earth, Šavrič / Patterson / Jenny (2018). Equations documented by PROJ.
// A longitude rotation moves the seam as the player drags around the globe.
const A1=1.340264,A2=-.081106,A3=.000893,A4=.003796,SCALE=210;
export const wrapLongitude=x=>(((x+180)%360)+360)%360-180;
export function equalEarth([longitude,latitude],rotation=0){
  const lambda=(longitude-rotation)*Math.PI/180,theta=Math.asin(Math.sqrt(3)/2*Math.sin(latitude*Math.PI/180));
  const t2=theta*theta,t6=t2*t2*t2;
  const x=lambda*Math.cos(theta)/(Math.sqrt(3)/2*(A1+3*A2*t2+t6*(7*A3+9*A4*t2)));
  const y=theta*(A1+A2*t2+t6*(A3+A4*t2));
  return [600+SCALE*x,300-SCALE*y];
}
export const mapPoint=(p,rotation=0)=>equalEarth([wrapLongitude(p[0]-rotation),p[1]]);
function clip(ring,bound,keepGreater){
  const out=[];for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],ai=keepGreater?a[0]>=bound:a[0]<=bound,bi=keepGreater?b[0]>=bound:b[0]<=bound;if(ai)out.push(a);if(ai!==bi)out.push([bound,a[1]+(b[1]-a[1])*(bound-a[0])/(b[0]-a[0])]);}return out;
}
export function polygonPath(coordinates,rotation=0){
  let path='';
  for(const ring of coordinates){if(ring.length<3)continue;const unwrapped=[];for(const p of ring){let x=wrapLongitude(p[0]-rotation);const last=unwrapped.at(-1);if(last){while(x-last[0]>180)x-=360;while(x-last[0]<-180)x+=360;}unwrapped.push([x,p[1]]);}
    for(let k=-2;k<=2;k++){let clipped=unwrapped.map(p=>[p[0]+k*360,p[1]]);clipped=clip(clip(clipped,-180,true),180,false);if(clipped.length<3)continue;path+=clipped.map((p,i)=>{const q=equalEarth(p);return `${i?'L':'M'}${q[0].toFixed(2)},${q[1].toFixed(2)}`;}).join('')+'Z';}
  }return path;
}
export function geometryPath(geometry,rotation=0){return (geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates).map(p=>polygonPath(p,rotation)).join('');}
export function linePath(points,rotation=0){let path='',last=null;for(let i=0;i<points.length;i++){const p=points[i],x=wrapLongitude(p[0]-rotation),q=equalEarth([x,p[1]]);path+=`${last===null||Math.abs(x-last)>180?'M':'L'}${q[0].toFixed(2)},${q[1].toFixed(2)} `;last=x;}return path;}
export function seaOutline(){const points=[];for(let lat=-90;lat<=90;lat+=3)points.push([-180,lat]);for(let lat=90;lat>=-90;lat-=3)points.push([180,lat]);return points.map((p,i)=>{const q=equalEarth(p);return `${i?'L':'M'}${q[0].toFixed(2)},${q[1].toFixed(2)}`;}).join('')+'Z';}
