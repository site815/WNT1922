// Optional authoring; the game loads the finished GLB directly without rebuilding.
// Original three-island freighter reconstruction from the companion 1920 plans.
import fs from 'node:fs/promises';
import {validateDetailedShip} from './check-models.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createAuthoredMesh} from '../assets/models/authoring/authored-mesh.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const spec=JSON.parse(await fs.readFile(path.join(root,'assets/models/source/hog-island-1022.json'),'utf8'));
const {groups,parts,add,sub,mul,cross,unit,tri,quad,part,cylinder,ring,prism,house,rail,ladder,addTexture,makeGlb}=createAuthoredMesh(spec);
for(const [name,file,mime]of [['paint-albedo','naval-paint/albedo.png','image/png'],['paint-normal','blue_metal_plate/blue_metal_plate_nor_gl_1k.png','image/png'],['paint-orm','blue_metal_plate/blue_metal_plate_arm_1k.jpg','image/jpeg']])addTexture(name,await fs.readFile(path.join(root,'assets/models/textures',file)),mime);
const {length:L,beam:B,draft:D}=spec.dimensions;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
function curve(t,k){
  const a=spec.hullStations;let i=0;while(i<a.length-2&&a[i+1][0]<t)i++;
  const p=a[i],q=a[i+1],pp=a[Math.max(0,i-1)],qq=a[Math.min(a.length-1,i+2)],d=q[0]-p[0],u=clamp((t-p[0])/d,0,1);
  const m=(q[k]-pp[k])/(q[0]-pp[0]),n=(qq[k]-p[k])/(qq[0]-p[0]);
  return clamp((2*u**3-3*u*u+1)*p[k]+(u**3-2*u*u+u)*m*d+(-2*u**3+3*u*u)*q[k]+(u**3-u*u)*n*d,Math.min(p[k],q[k]),Math.max(p[k],q[k]));
}
const beam=x=>B/2*curve(clamp(x/(L/2),-1,1),1),deck=x=>curve(clamp(x/(L/2),-1,1),3);
// Station section follows the original flat midship bottom and short rounded bilges.
const section=[[-1,1],[-1,.6],[-1,.18],[-1,0],[-.999,-.25],[-.997,-.6],[-.982,-.82],[-.942,-.92],[-.851,-.975],[-.65,-.996],[-.33,-1],[0,-1],[.33,-1],[.65,-.996],[.851,-.975],[.942,-.92],[.982,-.82],[.997,-.6],[.999,-.25],[1,0],[1,.18],[1,.6],[1,1]];
function surface(t,j){
  const [w,h]=section[j],load=Math.max(0,-h),full=curve(t,1),under=curve(t,2);
  // Counter stern overhang recedes underwater; bow remains near-vertical.
  const stern=7.5*Math.pow(clamp((-t-.72)/.28,0,1),2)*Math.pow(load,.35),bow=.72*Math.pow(clamp((t-.84)/.16,0,1),2)*load;
  return [t*L/2+stern-bow,h<0?D*h:curve(t,3)*h,w*B/2*(h<0?lerp(full,under,load**.55):full)];
}
function normal(t,j){return unit(cross(sub(surface(Math.min(1,t+.00005),j),surface(Math.max(-1,t-.00005),j)),sub(surface(t,Math.min(section.length-1,j+1)),surface(t,Math.max(0,j-1)))));}
part('Continuous full steel hull: vertical stem, counter stern, flat bottom and short round bilges',()=>{
  for(let i=0;i<240;i++)for(let j=0;j<section.length-1;j++){
    const t=-1+2*i/240,s=-1+2*(i+1)/240,p=surface(t,j),q=surface(t,j+1),r=surface(s,j+1),z=surface(s,j),h=(p[1]+q[1]+r[1]+z[1])/4,mat=h<-.2?'antifouling':h<.31?'boot':'paint';
    tri(mat,p,r,q,normal(t,j),normal(s,j+1),normal(t,j+1));tri(mat,p,z,r,normal(t,j),normal(s,j),normal(s,j+1));
  }
  for(const t of [-1,1])for(let j=0;j<section.length-1;j++){
    const p=surface(t,j),q=surface(t,j+1),c=[(p[0]+q[0])/2,(p[1]+q[1])/2,0],mat=c[1]<-.2?'antifouling':c[1]<.31?'boot':'paint';
    t<0?tri(mat,c,p,q):tri(mat,c,q,p);
  }
});
let auditedHullVertices=0;
for(const group of groups.values())for(let i=0;i<group.positions.length;i+=3){
  const [x,y,z]=group.positions.slice(i,i+3),[nx,ny,nz]=group.normals.slice(i,i+3);
  if(Math.abs(x)<L*.24&&Math.abs(z)>B*.43){if(nz*Math.sign(z)<.25)throw Error('Hog Island hull has inward side normals');auditedHullVertices++;}
  if(Math.abs(x)<L*.24&&y< -D*.997&&ny>-.75)throw Error('Hog Island hull has inward keel normals');
}
if(auditedHullVertices<1000)throw Error('Hog Island outward normal audit was not exercised');
function camberedDeck(from,to,level,material='deck'){
  const rows=Math.ceil((to-from)/.55);
  for(let i=0;i<rows;i++){
    const x=lerp(from,to,i/rows),n=lerp(from,to,(i+1)/rows),a=typeof level==='function'?level(x):level,b=typeof level==='function'?level(n):level;
    for(const sign of [-1,1]){const p=[x,a,sign*beam(x)],q=[n,b,sign*beam(n)],r=[n,b+.16,0],s=[x,a+.16,0];sign>0?quad(material,p,q,r,s):quad(material,s,r,q,p);}
  }
}
function endWall(x,bottom,top,sign=1){const w=beam(x);sign>0?quad('paint',[x,bottom,-w],[x,top,-w],[x,top,w],[x,bottom,w]):quad('paint',[x,bottom,w],[x,top,w],[x,top,-w],[x,bottom,-w]);}
function island(from,to,height){
  camberedDeck(from,to,height);
  for(let x=from;x<to;x+=.5){const n=Math.min(to,x+.5);for(const sign of [-1,1]){
    const p=[x,deck(x),sign*beam(x)],q=[n,deck(n),sign*beam(n)],r=[n,height,sign*beam(n)],s=[x,height,sign*beam(x)];sign>0?quad('paint',p,q,r,s):quad('paint',q,p,s,r);
  }}
  endWall(from,deck(from),height,-1);endWall(to,deck(to),height,1);
}
part('Cambered weather deck and separate forecastle, central bridge island and poop',()=>{
  camberedDeck(-L/2,L/2,deck);
  island(-L/2,-45.73,5.36);island(-18.05,19.01,5.32);island(48.56,L/2,5.61);
  for(const sign of [-1,1]){
    for(const [a,b,y]of [[-60,-45.9,5.36],[-17.8,18.8,5.32],[48.8,60.2,5.61]]){
      const points=[];for(let x=a;x<=b;x+=(b-a)/20)points.push([x,y,sign*(beam(x)-.09)]);rail(points);
    }
    for(const [a,b]of [[-45.65,-18.13],[19.08,48.47]]){
      const pts=[];for(let x=a;x<=b;x+=1.45)pts.push([x,deck(x),sign*(beam(x)-.085)]);rail(pts,[.42,.82]);
      for(let x=a+.7;x<b;x+=3.4){house('paint',x,sign*(beam(x)-.055),.62,.085,deck(x),deck(x)+.38,.035);house('boot',x,sign*(beam(x)+.002),.4,.014,deck(x)+.055,deck(x)+.21,.055);}
    }
    for(const x of [-45.8,-18.3,19.25,48.35]){
      const upper=x< -40?5.36:x>40?5.61:5.32,d=x<0?-1:1;
      ladder([x-d*1.8,deck(x),sign*6.93],[x+d*.1,upper,sign*6.93],.67);
    }
  }
});
function door(x,z,y){
  const sign=Math.sign(z);house('boot',x,z,.77,.024,y,y+1.8,.11);house('house',x,z+sign*.024,.68,.04,y+.035,y+1.75,.105);
  for(const h of [.29,1.45])cylinder('steel',[x-.3,y+h,z+sign*.052],[x-.11,y+h,z+sign*.052],.018,.018,10);
  cylinder('brass',[x+.15,y+.86,z+sign*.065],[x+.28,y+.86,z+sign*.065],.021,.021,12);
}
function port(x,y,z,r=.16){const sign=Math.sign(z);cylinder('brass',[x,y,z],[x,y,z+sign*.022],r,r,24);cylinder('glass',[x,y,z+sign*.024],[x,y,z+sign*.031],r*.8,r*.8,24);}
function vent(x,z,y,height=1.4,r=.25,direction=1){
  cylinder('house',[x,y,z],[x,y+height-.38,z],r,r,24);
  const p=t=>[x+direction*Math.sin(t)*.37,y+height-.38+(1-Math.cos(t))*.37,z];
  for(let i=0;i<10;i++)cylinder('house',p(i/10*Math.PI/2),p((i+1)/10*Math.PI/2),r,r,24);
  const m=p(Math.PI/2);cylinder('house',m,add(m,[direction*.21,0,0]),r,r*1.32,24);cylinder('boot',add(m,[direction*.212,0,0]),add(m,[direction*.217,0,0]),r*1.14,r*1.14,24);
}
part('Forward navigating bridge and open canvas-roofed flying bridge, separate from engine house',()=>{
  house('house',15.32,0,7.1,12.56,5.32,7.58,.19);
  house('deck',15.35,0,7.32,15.68,7.58,7.71,.2);
  house('house',15.29,0,6.52,10.66,7.71,9.91,.18);
  house('deck',15.29,0,6.78,10.89,9.91,10.04,.18);
  // Dark separate panes and framing, with a real open conning space above.
  for(let i=0;i<9;i++)house('glass',18.558,(i-4)*1.11,.021,.82,8.43,9.5,.04);
  for(const sign of [-1,1]){
    for(let i=0;i<5;i++)house('glass',12.64+i*1.12,sign*5.34,.79,.023,8.43,9.5,.04);
    for(const x of [12.8,15.3,17.7])port(x,6.62,sign*6.298,.18);
    door(12.49,sign*6.29,5.43);
    rail(Array.from({length:8},(_,i)=>[12.0+i*.95,7.71,sign*7.67]));
    rail(Array.from({length:8},(_,i)=>[12.0+i*.95,10.04,sign*5.32]));
    for(const x of [12.28,15.25,18.28])cylinder('house',[x,10.04,sign*4.64],[x,12.03,sign*4.64],.041,.041,12);
    ladder([10.0,5.32,sign*6.58],[12.05,7.71,sign*6.58],.64);
    ladder([11.9,7.71,sign*4.74],[13.25,10.04,sign*4.74],.56);
    ring('rope',[15.1,8.12,sign*7.61],.31,.10,'z',28);
    cylinder('house',[16.65,7.71,sign*6.74],[16.65,8.55,sign*6.74],.065,.065,16);
    cylinder('brass',[16.65,8.55,sign*6.74],[16.65,8.86,sign*6.74],.16,.13,24);
  }
  // Cambered canvas cover rests on slender pipe framework, not an enclosed tower.
  for(const sign of [-1,1]){const p=[12.05,12.06,sign*4.81],q=[18.48,12.06,sign*4.81],r=[18.48,12.27,0],s=[12.05,12.27,0];sign>0?quad('canvas',p,q,r,s):quad('canvas',s,r,q,p);}
  cylinder('brass',[16.32,10.04,0],[16.32,10.93,0],.22,.17,28);cylinder('house',[16.32,10.93,0],[16.32,11.17,0],.3,.28,28);
  cylinder('wood',[14.1,10.04,0],[14.1,10.97,0],.08,.08,16);ring('wood',[14.1,10.83,0],.34,.035,'x',32);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;cylinder('brass',[14.1,10.83,0],[14.1,10.83+Math.cos(a)*.31,Math.sin(a)*.31],.012,.012,8);}
});
part('Aft engine accommodation and boat deck, engine skylights, ventilators, doors and scuttles',()=>{
  house('house',-8.35,0,18.94,14.68,5.32,7.48,.2);house('deck',-8.35,0,19.16,16.12,7.48,7.62,.22);
  for(const sign of [-1,1]){
    for(const x of [-16.3,-12.9,-9.2,-5.9,-2.5])port(x,6.46,sign*7.356,.16);
    door(-15.2,sign*7.35,5.37);door(-3.8,sign*7.35,5.37);
    rail(Array.from({length:15},(_,i)=>[-17.6+i*1.3,7.62,sign*7.97]));
    ladder([-18.1,5.32,sign*6.98],[-16.3,7.62,sign*6.98],.61);
    for(const x of [-14.8,-10.4])vent(x,sign*2.0,7.64,1.5,.34);
    for(const x of [-15.7,-14.0,-12.3,-10.6,-8.9,-7.2,-5.5,-3.8]){
      cylinder('house',[x,7.63,sign*4.22],[x,8.1,sign*4.22],.092,.092,18);cylinder('house',[x,8.1,sign*4.22],[x,8.18,sign*4.22],.17,.18,24);
    }
  }
  house('house',-11.15,0,5.3,3.55,7.62,8.14,.16);
  for(let i=0;i<7;i++)for(const sign of [-1,1]){
    const x=-13.45+i*.74,p=[x,8.15,sign*1.6],q=[x+.58,8.15,sign*1.6],r=[x+.58,8.5,0],s=[x,8.5,0];sign>0?quad('glass',p,q,r,s):quad('glass',s,r,q,p);
  }
  for(const x of [-16.0,-6.5])house('house',x,0,1.9,1.4,7.62,8.11,.13);
  house('house',-2.0,0,5.05,5.63,7.62,8.05,.16);
});
part('Narrow circular buff funnel, black open uptake, whistle and independent steam pipes',()=>{
  const x=-1.78,bottom=8.05,top=15.18,r=1.42;
  cylinder('funnel',[x,bottom,0],[x,top-1.25,0],r,r,64,false);
  cylinder('boot',[x,top-1.25,0],[x,top,0],r,r,64,false);
  for(let i=0;i<64;i++){
    const a=i/64*Math.PI*2,b=(i+1)/64*Math.PI*2,p=[x+Math.cos(a)*r,top,Math.sin(a)*r],q=[x+Math.cos(b)*r,top,Math.sin(b)*r],s=[x+Math.cos(a)*(r-.11),top-.6,Math.sin(a)*(r-.11)],t=[x+Math.cos(b)*(r-.11),top-.6,Math.sin(b)*(r-.11)];
    quad('boot',p,s,t,q);tri('boot',[x,top-.85,0],t,s);
  }
  for(const y of [bottom+.18,top-1.28,top-.13])ring(y>top-2?'boot':'steel',[x,y,0],r+.025,.028,'y',48);
  for(const sign of [-1,1]){cylinder('house',[x+.42,7.65,sign*1.36],[x+.42,15.75,sign*1.36],.09,.09,20);vent(-1.8,sign*2.3,7.63,2.0,.43);}
  ladder([x-1.45,8.07,0],[x-1.45,14.93,0],.42);
  cylinder('brass',[x+.42,14.92,1.53],[x+.42,15.23,1.53],.11,.11,20);
});
function winch(x,z,y){
  house('paint',x,z,1.6,1.13,y,y+.18,.12);
  for(const sign of [-1,1]){house('paint',x,z+sign*.39,.37,.17,y+.17,y+.74,.09);cylinder('steel',[x,y+.58,z+sign*.38],[x,y+.58,z+sign*.61],.29,.29,24);}
  cylinder('steel',[x,y+.58,z-.39],[x,y+.58,z+.39],.2,.2,24);
  for(let i=0;i<8;i++)ring('rope',[x,y+.58,z+(i-3.5)*.08],.213,.03,'z',20);
  cylinder('paint',[x-.53,y+.24,z],[x-.53,y+.77,z],.24,.21,20);ring('steel',[x-.73,y+.65,z+.56],.21,.024,'z',24);
}
part('Five differently sized canvas-covered cargo hatches, coamings, timber battens and securing cleats',()=>{
  for(const h of spec.hatches){
    const y=h.deck+.1;house('paint',h.x,0,h.length+.18,h.beam+.18,y,y+.92,.11);house('boot',h.x,0,h.length,h.beam,y+.9,y+.96,.075);
    for(const sign of [-1,1]){const p=[h.x-h.length/2+.06,y+.97,sign*(h.beam/2-.06)],q=[h.x+h.length/2-.06,y+.97,sign*(h.beam/2-.06)],r=[h.x+h.length/2-.06,y+1.06,0],s=[h.x-h.length/2+.06,y+1.06,0];sign>0?quad('canvas',p,q,r,s):quad('canvas',s,r,q,p);}
    for(let x=h.x-h.length/2+.35;x<h.x+h.length/2;x+=.8)for(const sign of [-1,1]){
      house('wood',x,sign*(h.beam/2+.11),.08,.1,y+.65,y+.94,.02);cylinder('steel',[x,y+.4,sign*(h.beam/2+.13)],[x,y+.69,sign*(h.beam/2+.13)],.023,.023,8);
    }
    for(const sign of [-1,1])cylinder('steel',[h.x-h.length/2,y+.98,sign*h.beam/2],[h.x+h.length/2,y+.98,sign*h.beam/2],.024,.024,10);
  }
});
function workingBoom(x,z,y,direction,length,top){
  const a=[x+direction*.6,y,z],rise=length*.25,end=[a[0]+direction*Math.sqrt(length*length-rise*rise-.7*.7),a[1]+rise,z+Math.sign(z)*.7];
  cylinder('house',a,end,.16,.088,28);cylinder('steel',[x,y,z-.17],[x,y,z+.17],.13,.13,20);
  cylinder('steel',[x,top,z*.08],end,.017,.017,8);ring('steel',add(end,[0,-.12,0]),.135,.026,'z',20);
  const rest=deck(end[0])+1.4;cylinder('rope',end,[end[0],rest,end[2]],.017,.017,8);ring('steel',[end[0],rest,end[2]],.105,.025,'z',18);
  house('paint',end[0],end[2],.22,.46,deck(end[0]),end[1]-.18,.055);
}
part('Two tall cargo masts with eight booms, central derrick posts, ten winches and suspended running rigging',()=>{
  for(const m of spec.masts){
    const x=m.x,y=deck(x);
    cylinder('house',[x,y,0],[x,m.top-8.2,0],.38,.26,40);cylinder('house',[x,m.top-8.2,0],[x,m.top,0],.19,.09,32);
    for(const h of [y+.25,y+1.15,m.top-8.25])ring('steel',[x,h,0],h>15?.275:.394,.025,'y',28);
    cylinder('house',[x,m.top-3.1,-2.6],[x,m.top-3.1,2.6],.075,.045,24);
    ladder([x-.39,y+.25,0],[x-.23,m.top-8.3,0],.34);
    for(const direction of [-1,1])for(const sign of [-1,1]){
      workingBoom(x,sign*1.55,y+1.35,direction,m.boomLength,m.top-8.2);
      cylinder('steel',[x,m.top-8.3,sign*.1],[x+direction*4.9,deck(x+direction*4.9)+.1,sign*5.95],.019,.019,8);
      cylinder('steel',[x,m.top-.85,0],[x+direction*15.5,deck(x+direction*15.5)+1,sign*4.58],.015,.015,8);
      winch(x+direction*2.2,sign*2.25,y);
    }
  }
  // A paired kingpost and two shorter derricks serve the small island hatch.
  for(const sign of [-1,1]){
    const z=sign*3.5,x=2.15; cylinder('house',[x,5.32,z],[x,16.1,z],.21,.17,32);
    const a=[x,6.13,z],b=[10.9,10.57,sign*3.05];cylinder('house',a,b,.15,.088,28);
    cylinder('steel',[x,16.0,z],b,.017,.017,8);cylinder('rope',b,[10.9,6.5,sign*3.05],.016,.016,8);ring('steel',[10.9,6.5,sign*3.05],.105,.024,'z',18);
    winch(4.02,sign*4.4,5.32);cylinder('steel',[x,15.9,z],[-3.5,7.63,sign*6.25],.016,.016,8);
  }
  cylinder('house',[2.15,15.77,-3.5],[2.15,15.77,3.5],.13,.13,28);
  for(const z of [-.28,0,.28]){
    const a=[-32.22,25.7,z],b=[34.9,25.95,z];let prev=a;
    for(let i=1;i<=32;i++){const t=i/32,p=[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-.95*Math.sin(Math.PI*t),z];cylinder('steel',prev,p,.011,.011,8);prev=p;}
  }
});
function lifeboat(x,z,y){
  const length=7.3152,width=2.25,p=(t,u)=>[x+t*length/2,y+.51+.39*Math.abs(t)**2-.68*Math.cos(u),z+Math.sin(u)*width/2*Math.max(0,1-t*t)**.64];
  for(let i=0;i<44;i++)for(let j=0;j<16;j++){
    const a=-1+i/22,b=-1+(i+1)/22,c=-Math.PI/2+j*Math.PI/16,d=c+Math.PI/16,inner=v=>[v[0],v[1]+.08,z+(v[2]-z)*.92];
    quad('house',p(a,c),p(b,c),p(b,d),p(a,d));quad('wood',inner(p(a,c)),inner(p(a,d)),inner(p(b,d)),inner(p(b,c)));
  }
  for(const sign of [-1,1])for(let i=0;i<44;i++)cylinder('wood',p(-1+i/22,sign*Math.PI/2),p(-1+(i+1)/22,sign*Math.PI/2),.045,.045,8);
  for(const dx of [-2.4,-1.2,0,1.2,2.4])house('wood',x+dx,z,.22,width*Math.max(0,1-(dx/(length/2))**2)**.64*.91,y+.41,y+.49,.02);
  for(const dx of [-2.1,2.1]){
    const sign=Math.sign(z),a=[x+dx,y-.72,z-sign*.96],b=[x+dx,y+2.27,z-sign*.96],c=[x+dx,y+2.53,z+sign*.12];
    house('paint',x+dx,z,.65,1.8,y-.56,y-.25,.12);cylinder('house',a,b,.085,.085,18);cylinder('house',b,c,.085,.056,18);
    ring('steel',c,.14,.025,'x',22);cylinder('rope',c,[x+dx,y+.51,z],.021,.021,8);
  }
  for(const dz of [-.29,.29]){cylinder('wood',[x-2.8,y+.6,z+dz],[x+2.7,y+.6,z+dz],.029,.024,10);house('wood',x+2.65,z+dz,.67,.14,y+.56,y+.64,.04);}
}
part('Four 24 ft open lifeboats: shaped shell, interior thwarts, timber gunwales, oars and paired davits',()=>{
  for(const sign of [-1,1])for(const x of [-13.3,-4.45])lifeboat(x,sign*6.54,8.1);
});
function bitts(x,z,y){house('paint',x,z,1.28,.62,y,y+.11,.09);for(const dx of [-.36,.36]){cylinder('paint',[x+dx,y+.1,z],[x+dx,y+.62,z],.15,.16,20);cylinder('steel',[x+dx,y+.59,z],[x+dx,y+.72,z],.21,.21,20);}}
function fairlead(x,z,y){house('paint',x,z,.9,.52,y,y+.12,.12);for(const dx of [-.29,.29])cylinder('steel',[x+dx,y+.13,z],[x+dx,y+.41,z],.078,.1,18);cylinder('steel',[x-.29,y+.39,z],[x+.29,y+.39,z],.063,.063,16);}
part('Forecastle windlass and chains, stockless anchors, poop steering cover, capstans, bitts and freeing ports',()=>{
  for(const sign of [-1,1]){
    for(const [x,y]of [[-56,5.36],[-48,5.36],[51.3,5.61],[56.3,5.61],[-14.8,5.32],[17,5.32]]){bitts(x,sign*(beam(x)-1.0),y);fairlead(x+.95,sign*(beam(x+.95)-.26),y+.12);}
    for(const x of [-56,-53,-50])port(x,4.42,sign*(beam(x)+.013),.16);
    for(const x of [51.3,54.2,56.2])port(x,4.5,sign*(beam(x)+.013),.16);
    for(const x of [-43.4,-20.0,21.2,46.6])vent(x,sign*5.22,deck(x),1.56,.22,x>0?1:-1);
    for(const x of [-49.0,50.0])vent(x,sign*3.6,x<0?5.36:5.61,1.27,.25);
    for(let x=53.4;x<58.1;x+=.16)ring('steel',[x,5.84,sign*1.03],.082,.022,Math.round(x/.16)%2?'x':'y',12);
    const x=58.8,z=sign*(beam(x)+.055),y=3.91;
    ring('steel',[x,y+.34,z],.2,.04,'z',28);cylinder('steel',[x,y+.24,z],[x-.33,y-.8,z],.093,.082,20);cylinder('steel',[x-.36,y-.81,z-.48],[x-.36,y-.81,z+.48],.09,.09,18);
    for(const dz of [-.37,.37]){const c=[x-.36,y-.81,z+dz],p=add(c,[.26,.47,.15]),q=add(c,[-.2,.31,-.13]);tri('steel',c,p,q);tri('steel',q,p,c);}
  }
  winch(53.65,0,5.77);
  house('paint',-57.0,0,3.2,2.5,5.36,5.77,.32);house('house',-54.15,0,2.14,1.82,5.36,6.02,.14);
  for(const x of [-53.0,57.0]){const y=x<0?5.36:5.61;cylinder('paint',[x,y,0],[x,y+.58,0],.31,.34,28);cylinder('steel',[x,y+.56,0],[x,y+.72,0],.4,.32,28);}
  for(const [x,y,d]of [[-60,5.36,-1],[60,5.61,1]]){cylinder('wood',[x,y,0],[x+d*.18,y+3.9,0],.048,.026,16);cylinder('steel',[x,y+.2,0],[x+d*.18,y+3.8,0],.01,.01,8);}
});
part('Single propeller, shaft, counter-stern support, faired rudder and bilge keels',()=>{
  const center=[-55.64,-4.51,0],radius=2.35;
  cylinder('steel',[-48.0,-4.51,0],[-56.33,-4.51,0],.25,.21,32);cylinder('brass',[-55.2,-4.51,0],[-56.39,-4.51,0],.4,.13,40);
  for(let k=0;k<4;k++){
    const point=(r,s,h)=>{const a=k*Math.PI/2+s+.17*r;return add(center,[h+Math.sin(.56*(1-r/radius)+s)*r*.18,Math.cos(a)*r,Math.sin(a)*r]);};
    for(let i=0;i<16;i++)for(let j=0;j<10;j++){
      const r=.32+(radius-.32)*i/16,n=.32+(radius-.32)*(i+1)/16,span=v=>.36*Math.sin(Math.PI*(v-.2)/(radius+.1))+.05,a=-span(r)+2*span(r)*j/10,b=-span(r)+2*span(r)*(j+1)/10,c=-span(n)+2*span(n)*(j+1)/10,d=-span(n)+2*span(n)*j/10;
      quad('brass',point(r,a,.024),point(n,d,.024),point(n,c,.024),point(r,b,.024));quad('brass',point(r,b,-.024),point(n,c,-.024),point(n,d,-.024),point(r,a,-.024));
    }
  }
  prism('antifouling',[[-57.15,-.055],[-57.7,-.15],[-59.1,-.075],[-59.2,0],[-59.1,.075],[-57.7,.15],[-57.15,.055]].reverse(),-7.0,-1.18,.9);
  cylinder('steel',[-57.22,-6.9,0],[-57.22,.41,0],.13,.13,24);
  for(const sign of [-1,1])for(let x=-29;x<31;x+=.8){const z=sign*7.4;quad('antifouling',[x,-6.99,z],[x+.8,-6.99,z],[x+.8,-7.22,z+sign*.4],[x,-7.22,z+sign*.4]);quad('antifouling',[x,-7.22,z+sign*.4],[x+.8,-7.22,z+sign*.4],[x+.8,-6.99,z],[x,-6.99,z]);}
});
if(!process.argv.includes('--write'))throw Error('Pass --write to author the finished GLB; this is not a runtime build step.');
const output=path.join(root,'assets/models/ships/generic/hog-island-1022.glb');
const completedGlb=makeGlb();
const statistics=validateDetailedShip(completedGlb,{id:spec.id,metadata:spec});
await fs.writeFile(output,completedGlb);
const summary={id:spec.id,file:path.relative(root,output).replaceAll('\\','/'),triangles:[...groups.values()].reduce((n,g)=>n+g.indices.length/3,0),vertices:[...groups.values()].reduce((n,g)=>n+g.positions.length/3,0),materials:groups.size,components:parts.length,auditedHullVertices,bytes:(await fs.stat(output)).size};
await fs.writeFile(output.replace(/\.glb$/,'.source.json'),JSON.stringify({...spec,authoringFile:'assets/models/source/hog-island-1022.json',exporter:'tools/author-hog-island-model.mjs',summary,statistics,components:parts},null,2)+'\n');
console.log(JSON.stringify(summary));
