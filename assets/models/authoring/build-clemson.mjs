// Optional original Clemson authoring. The game reads the stored GLB directly.
// Independent source stations and shape; no legacy mesh or Farragut geometry.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createAuthoredMesh} from './authored-mesh.mjs';
import {validateDetailedShip} from '../../../tools/check-models.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const spec=JSON.parse(await fs.readFile(path.join(here,'clemson-1919.json'),'utf8'));
const {length:L,beam:B,draft:D}=spec.dimensions;
const {groups,parts,add,sub,mul,cross,unit,mix,tri,quad,part,cylinder,ring,prism,house,rail,ladder,addTexture,makeGlb}=createAuthoredMesh(spec);
addTexture('naval-paint-albedo',await fs.readFile(path.join(here,'../textures/naval-paint/albedo.png')));
addTexture('naval-paint-normal',await fs.readFile(path.join(here,'../textures/blue_metal_plate/blue_metal_plate_nor_gl_1k.png')));
addTexture('naval-paint-orm',await fs.readFile(path.join(here,'../textures/blue_metal_plate/blue_metal_plate_arm_1k.jpg')),'image/jpeg');
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
function station(t,k){const s=spec.hullStations;let i=0;while(i<s.length-2&&s[i+1][0]<t)i++;const p=s[i],q=s[i+1],a=s[Math.max(0,i-1)],b=s[Math.min(s.length-1,i+2)],u=(t-p[0])/(q[0]-p[0]),d=q[0]-p[0];return (2*u**3-3*u*u+1)*p[k]+(u**3-2*u*u+u)*(q[k]-a[k])/(q[0]-a[0])*d+(-2*u**3+3*u*u)*q[k]+(u**3-u*u)*(b[k]-p[k])/(b[0]-p[0])*d;}
const half=x=>Math.max(.006,station(clamp(x/(L/2),-1,1),1))*B/2;
const deck=x=>station(clamp(x/(L/2),-1,1),3);
const section=[[-1,1],[-.999,.85],[-.994,.60],[-.982,.35],[-.969,.10],[-.959,0],[-.951,-.08],[-.936,-.22],[-.901,-.39],[-.832,-.60],[-.704,-.77],[-.50,-.91],[-.25,-.982],[0,-1],[.25,-.982],[.50,-.91],[.704,-.77],[.832,-.60],[.901,-.39],[.936,-.22],[.951,-.08],[.959,0],[.969,.10],[.982,.35],[.994,.60],[.999,.85],[1,1]];
function hull(t,s){let x=t*L/2;const h=deck(x),depth=D*Math.max(.006,station(t,2));const bow=clamp((t-.63)/.37,0,1)**2,stern=clamp((-t-.68)/.32,0,1)**2;
  x-=bow*(1-s[1])*1.45;x+=stern*Math.max(0,-s[1])*4.0;
  return [x,s[1]>=0?h*s[1]:depth*s[1],half(t*L/2)*s[0]];
}
part('Continuous Clemson flush-deck hull with fine bow and rounded stern',()=>{
  const rows=192,n=(t,j)=>unit(cross(sub(hull(Math.min(1,t+.0001),section[j]),hull(Math.max(-1,t-.0001),section[j])),sub(hull(t,section[Math.min(section.length-1,j+1)]),hull(t,section[Math.max(0,j-1)]))));
  for(let i=0;i<rows;i++)for(let j=0;j<section.length-1;j++){
    const t=-1+2*i/rows,u=-1+2*(i+1)/rows,a=hull(t,section[j]),b=hull(t,section[j+1]),c=hull(u,section[j+1]),d=hull(u,section[j]);
    const y=(a[1]+b[1]+c[1]+d[1])/4,mat=y<-.25?'antifouling':y<.36?'boot':'paint';
    tri(mat,a,c,b,n(t,j),n(u,j+1),n(t,j+1));tri(mat,a,d,c,n(t,j),n(u,j),n(u,j+1));
  }
  for(const t of [-1,1]){const edge=section.map(s=>hull(t,s)),center=edge.reduce((a,b)=>add(a,mul(b,1/edge.length)),[0,0,0]);for(let j=0;j<edge.length-1;j++)t<0?tri('paint',center,edge[j],edge[j+1]):tri('paint',center,edge[j+1],edge[j]);}
});
part('Unbroken sheered main deck with subtle camber and waterway',()=>{
  for(let i=0;i<192;i++){const a=-L/2+i*L/192,b=-L/2+(i+1)*L/192;for(const side of [-1,1]){
    const p=[a,deck(a)+.045,side*half(a)*.997],q=[b,deck(b)+.045,side*half(b)*.997],r=[b,deck(b)+.16,0],s=[a,deck(a)+.16,0];side>0?quad('deck',p,q,r,s):quad('deck',s,r,q,p);
    if(i>2&&i<188)cylinder('paint',[a,deck(a)+.06,side*(half(a)-.095)],[b,deck(b)+.06,side*(half(b)-.095)],.025,.025,8);
  }}
});
function porthole(x,y,z,r=.145){const side=Math.sign(z)||1;cylinder('brass',[x,y,z],[x,y,z+side*.023],r,r,24);cylinder('glass',[x,y,z+side*.025],[x,y,z+side*.031],r*.72,r*.72,24);}
function door(x,y,z){const side=Math.sign(z)||1;house('paint',x,z,.70,.075,y,y+1.68,.10);house('steel',x,z+side*.042,.045,.022,y+.18,y+1.50,.006);for(const a of [.31,.91,1.42])cylinder('paint',[x-.28,y+a,z+side*.055],[x-.18,y+a,z+side*.055],.037,.037,10);cylinder('brass',[x+.18,y+.86,z+side*.05],[x+.18,y+.86,z+side*.13],.025,.025,12);}
part('Forward deckhouse and rounded wheelhouse with open bridge wings',()=>{
  house('paint',22.5,0,6.30,5.55,4.02,7.12,.7);house('deck',22.42,0,6.56,5.85,7.12,7.25,.75);
  house('paint',22.52,0,4.47,4.50,7.23,9.38,.72,.98);house('paint',22.52,0,4.62,4.67,9.38,9.51,.74);
  for(const side of [-1,1]){
    house('deck',21.5,side*3.08,5.33,2.18,8.57,8.73,.3);house('paint',23.80,side*3.10,.10,2.14,8.74,9.50,.03);
    rail(Array.from({length:7},(_,i)=>[19.10+i*.77,8.74,side*4.10]));
    for(let i=0;i<4;i++)house('glass',21.28+i*.76,side*2.255,.50,.025,8.20,8.96,.055);
    for(const x of [20.2,21.2,22.2,23.2,24.2])porthole(x,5.84,side*2.784,.135);
    door(20.55,4.41,side*2.78);ladder([18.45,deck(18.45)+.16,side*2.30],[20.05,7.29,side*2.30]);
    ladder([19.02,7.3,side*3.22],[20.0,8.78,side*3.22],.36);
    cylinder('paint',[22.9,8.75,side*3.5],[22.9,9.40,side*3.5],.10,.075,20);
    cylinder(side<0?'portLamp':'starboardLamp',[24.0,9.13,side*3.1],[24.0,9.36,side*3.1],.11,.11,24);
    ring('canvas',[20.0,7.86,side*2.98],.38,.09,'z',32);
  }
  for(let i=0;i<5;i++)house('glass',24.755,(i-2)*.63,.024,.47,8.20,8.96,.035);
  house('canvas',22.9,0,2.5,3.15,9.52,10.28,.55,.97);
  cylinder('paint',[22.0,9.55,0],[22.0,10.70,0],.13,.09,24);cylinder('brass',[22.0,10.70,0],[22.0,10.91,0],.22,.22,24);
  // Low bridge windbreak is hollow; its aft side remains open to the bridge.
  for(const side of [-1,1])house('paint',23.08,side*1.78,2.85,.065,9.52,10.42,.02);
  house('paint',24.44,0,.065,3.56,9.52,10.42,.02);
});
part('Galley deckhouse with wing gun sponsons and after AA deckhouse',()=>{
  house('paint',7.08,0,9.03,6.47,3.42,6.45,.45);house('deck',7.08,0,9.22,6.65,6.45,6.58,.46);
  for(const side of [-1,1]){
    // The wing gun platforms overhang the galley side on curved sponsons.
    const outline=Array.from({length:32},(_,i)=>[6.40+Math.cos(i/32*Math.PI*2)*1.57,side*3.04+Math.sin(i/32*Math.PI*2)*1.02]);
    prism('paint',outline,6.25,6.45,.94);prism('deck',outline,6.45,6.58);
    for(let i=0;i<7;i++)porthole(3.55+i*1.16,5.13,side*3.25,.148);
    door(10.12,3.73,side*3.25);ladder([2.01,3.66,side*2.58],[3.35,6.62,side*2.58]);
    rail(Array.from({length:8},(_,i)=>[3.1+i*1.12,6.6,side*3.19]).filter(p=>Math.abs(p[0]-6.4)>2.2));
  }
  house('paint',-33.88,0,7.05,4.85,2.99,5.03,.54);house('deck',-33.88,0,7.26,5.03,5.03,5.15,.57);
  for(const side of [-1,1]){for(const x of [-36.4,-35.3,-34.2,-33.1,-32.0])porthole(x,4.14,side*2.44,.126);door(-31.61,3.12,side*2.44);ladder([-29.13,3.03,side*1.90],[-31.06,5.2,side*1.90]);rail(Array.from({length:8},(_,i)=>[-37.15+i*.92,5.18,side*2.38]));}
});
function gun(g,small=false){const angle=g.bearing*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),p=(x,y,z)=>[g.x+x*c-z*s,g.height+y,g.z+x*s+z*c],scale=small?.65:1;
  cylinder('paint',p(0,0,0),p(0,.22,0),.83*scale,.78*scale,48);cylinder('paint',p(0,.22,0),p(0,.87,0),.34*scale,.28*scale,36);
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;cylinder('steel',p(Math.cos(a)*.66*scale,.22,Math.sin(a)*.66*scale),p(Math.cos(a)*.66*scale,.26,Math.sin(a)*.66*scale),.043,.043,8);}
  for(const sign of [-1,1]){cylinder('paint',p(-.20,.48,sign*.28*scale),p(.08,1.02*scale+.22,sign*.28*scale),.10*scale,.10*scale,20);cylinder('steel',p(0,1.11*scale,sign*.32),p(0,1.11*scale,sign*.41),.18*scale,.18*scale,24);}
  const gy=1.29*scale+.1,barrel=small?1.62:4.75;
  cylinder('steel',p(-.60,gy,0),p(.33,gy,0),.19*scale,.19*scale,32);cylinder('paint',p(.1,gy,0),p(1.17*scale,gy+.025,0),.15*scale,.13*scale,32);
  cylinder('paint',p(1.17*scale,gy+.025,0),p(barrel,gy+.10,0),.13*scale,small?.046:.065,40);
  cylinder('boot',p(barrel+.003,gy+.10,0),p(barrel+.011,gy+.10,0),small?.036:.049,small?.036:.049,32);
  cylinder('steel',p(-.46,gy+.22*scale,0),p(.77*scale,gy+.24*scale,0),.080*scale,.08*scale,24);
  // Open breech, shoulder support, elevation/training handwheels and sight.
  const box=(mat,x,z,l,w,y0,y1)=>{const corners=[[-l/2,-w/2],[l/2,-w/2],[l/2,w/2],[-l/2,w/2]].map(([a,b])=>p(x+a,0,z+b));prism(mat,corners.map(a=>[a[0],a[2]]),g.height+y0,g.height+y1);};
  box('steel',-.43,0,.57,.46*scale,gy-.20*scale,gy+.20*scale);box('paint',-.74,.54*scale,.40,.36,.65*scale,.73*scale);
  for(const z of [-.55,.55]){const center=p(-.36,1.0*scale,z*scale),axis=unit(sub(p(-.36,1.0*scale,z*scale+.15),center));
    cylinder('steel',center,add(center,mul(axis,.13)),.044,.044,16);
    const r=.22*scale;for(let i=0;i<24;i++){const a=i/24*Math.PI*2,b=(i+1)/24*Math.PI*2;cylinder('steel',p(-.36+Math.cos(a)*r,1.0*scale+Math.sin(a)*r,z*scale+.14),p(-.36+Math.cos(b)*r,1.0*scale+Math.sin(b)*r,z*scale+.14),.018,.018,8);}
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2;cylinder('steel',p(-.36,1.0*scale,z*scale+.14),p(-.36+Math.cos(a)*r,1.0*scale+Math.sin(a)*r,z*scale+.14),.012,.012,6);}
  }
  cylinder('brass',p(-.60,gy+.36,-.25),p(.03,gy+.36,-.25),.033,.033,16);
  if(g.shield){
    // Thin sloped shield with an actual barrel aperture and open rear.
    for(const sign of [-1,1]){
      quad('paint',p(.88,.52,sign*.17),p(.88,.52,sign*.97),p(.68,2.01,sign*.97),p(.68,2.01,sign*.17));
      quad('paint',p(.88,.52,sign*.97),p(-.48,.52,sign*1.03),p(-.55,1.90,sign*1.03),p(.68,2.01,sign*.97));
      cylinder('paint',p(-.55,1.90,sign*1.03),p(.68,2.01,sign*.97),.028,.028,10);
    }
    quad('paint',p(.79,1.65,-.18),p(.79,1.65,.18),p(.68,2.01,.18),p(.68,2.01,-.18));
    quad('paint',p(.88,.52,-.18),p(.88,.52,.18),p(.83,1.16,.18),p(.83,1.16,-.18));
  }
}
for(const g of spec.mainGuns)part('4-inch /50 single gun '+g.number+(g.shield?' with open-backed shield':' open pedestal mount'),()=>gun(g));
part('Original three-inch /23 AA gun on after deckhouse',()=>gun(spec.antiAircraft,true));
part('Four narrow raked funnels with hollow mouths, collars, steampipes and stays',()=>{
  for(const f of spec.funnels){const point=(a,y,extra=0)=>[f.x-(y-f.bottom)/(f.top-f.bottom)*f.rake+Math.cos(a)*(f.length/2+extra),y,Math.sin(a)*(f.beam/2+extra)];
    for(let i=0;i<64;i++){const a=i/64*Math.PI*2,b=(i+1)/64*Math.PI*2;
      for(const [lo,hi,mat]of [[f.bottom,f.top-.66,'paint'],[f.top-.66,f.top,'boot']]){
        const p=point(a,lo),q=point(b,lo),r=point(b,hi),s=point(a,hi),na=unit([Math.cos(a),f.rake/(f.top-f.bottom),Math.sin(a)]),nb=unit([Math.cos(b),f.rake/(f.top-f.bottom),Math.sin(b)]);
        tri(mat,q,p,s,nb,na,na);tri(mat,q,s,r,nb,na,nb);
      }
      const upper=point(a,f.top),next=point(b,f.top),inner=point(a,f.top,-.12),innerNext=point(b,f.top,-.12);
      quad('boot',upper,inner,innerNext,next);quad('boot',inner,point(a,f.top-.58,-.12),point(b,f.top-.58,-.12),innerNext);
      tri('boot',[f.x-f.rake,f.top-.60,0],point(b,f.top-.58,-.12),point(a,f.top-.58,-.12));
      for(const y of [f.bottom+.20,f.top-1.1])cylinder('paint',point(a,y,.025),point(b,y,.025),.032,.032,8);
    }
    for(const side of [-1,1]){cylinder('paint',[f.x+.20,f.bottom,side*(f.beam/2+.16)],[f.x+.20-f.rake,f.top+.2,side*(f.beam/2+.16)],.074,.074,20);
      for(const dx of [-2.2,2.2])cylinder('steel',point(side*Math.PI/2,f.top-1.3,.06),[f.x+dx,deck(f.x+dx)+.18,side*2.05],.012,.012,8);
    }
    ladder([f.x-f.length/2-.08,f.bottom,0],[f.x-f.length/2-f.rake-.08,f.top-.3,0],.31);
  }
});
for(const bank of spec.torpedoMounts)part('Triple 21-inch torpedo bank '+bank.number+' with geared pedestal and clamps',()=>{
  const x=bank.x,z=bank.z,y=deck(x)+.15;
  cylinder('paint',[x,y,z],[x,y+.34,z],.89,.84,48);cylinder('steel',[x,y+.34,z],[x,y+.42,z],.87,.87,48);
  for(const dz of [-.65,0,.65]){
    cylinder('paint',[x-3.20,y+.87,z+dz],[x+3.20,y+.87,z+dz],.295,.285,40);
    ring('steel',[x+3.205,y+.87,z+dz],.270,.026,'x',32);cylinder('boot',[x+3.21,y+.87,z+dz],[x+3.22,y+.87,z+dz],.252,.252,32);
    cylinder('paint',[x-3.29,y+.87,z+dz],[x-3.20,y+.87,z+dz],.205,.293,32);
    for(const dx of [-2.30,-.86,1.66])ring('paint',[x+dx,y+.87,z+dz],.303,.035,'x',28);
    house('steel',x-2.12,z+dz,.37,.14,y+1.13,y+1.21,.025);
    cylinder('brass',[x-1.99,y+1.20,z+dz],[x-1.72,y+1.20,z+dz],.031,.031,12);
  }
  for(const dx of [-1.10,1.12])house('steel',x+dx,z,.18,2.13,y+.43,y+.71,.025);
  house('paint',x-.48,z,1.09,.39,y+1.13,y+1.62,.10);
  ring('steel',[x-.72,y+1.41,z+Math.sign(z)*1.06],.25,.025,'z',28);
  cylinder('paint',[x-.82,y+.50,z+Math.sign(z)*1.05],[x-.82,y+1.38,z+Math.sign(z)*1.05],.07,.055,16);
});
part('Pole masts, observation platform, yards and fore-and-aft aerial rigging',()=>{
  for(const m of spec.masts){
    cylinder('paint',[m.x,m.base,0],[m.x-m.rake,m.top,0],.19,.052,32);
    for(const fraction of [.65,.82]){const y=m.base+(m.top-m.base)*fraction,x=m.x-m.rake*fraction,w=m.name==='Foremast'?3.65:2.08;
      cylinder('paint',[x,y,-w],[x,y,w],.050,.034,20);
      for(const z of [-w,-w*.55,w*.55,w])cylinder('steel',[x,y,z],[m.x-.15,m.base+1.3,z*.13],.009,.009,6);
    }
    for(const side of [-1,1])for(const dx of [-5.5,4.8])cylinder('steel',[m.x-m.rake*.82,m.base+(m.top-m.base)*.82,0],[m.x+dx,deck(m.x+dx)+.19,side*3.1],.013,.013,8);
    ladder([m.x-.2,m.base,0],[m.x-m.rake-.14,m.top-2.4,0],.30);
  }
  const m=spec.masts[0],x=m.x-.77,y=21.5;
  cylinder('paint',[x,y-.18,0],[x,y,0],.72,.72,48);rail(Array.from({length:17},(_,i)=>[x+Math.cos(i/16*Math.PI*2)*.67,y,Math.sin(i/16*Math.PI*2)*.67]),[.43,.84]);
  for(const z of [-.29,0,.29])cylinder('steel',[17.42,27.95,z],[-31.09,15.48,z],.010,.010,8);
  cylinder('steel',[17.42,27.95,0],[45.8,5.64,0],.014,.014,8);cylinder('steel',[-31.09,15.48,0],[-46.6,3.1,0],.013,.013,8);
});
part('Lattice searchlight tower, lens, platform and ladder',()=>{
  const x=-14.83,y=3.32,top=9.28;
  for(const dx of [-.65,.65])for(const z of [-.61,.61])cylinder('paint',[x+dx,y,z],[x+dx*.68,top,z*.68],.065,.047,16);
  for(let i=0;i<3;i++){const a=y+i*(top-y)/3,b=y+(i+1)*(top-y)/3;for(const z of [-.59,.59]){cylinder('paint',[x-.61,a,z],[x+.49,b,z*.79],.035,.035,10);cylinder('paint',[x+.61,a,z],[x-.49,b,z*.79],.035,.035,10);}}
  house('deck',x,0,2.45,2.33,top,top+.12,.25);rail([[-1.1,-1.02],[1.1,-1.02],[1.1,1.02],[-1.1,1.02],[-1.1,-1.02]].map(([a,b])=>[x+a,top+.14,b]));
  cylinder('paint',[x,top+.12,0],[x,top+.48,0],.3,.3,32);
  cylinder('paint',[x-.44,top+.97,0],[x+.38,top+.97,0],.45,.47,48);cylinder('glass',[x+.385,top+.97,0],[x+.402,top+.97,0],.41,.41,48);
  ring('paint',[x+.415,top+.97,0],.442,.037,'x',40);ladder([x-.78,y,-.7],[x-.78,top+.13,-.7],.37);
});
function boat(x,y,z,length,width){
  const f=t=>Math.max(.009,Math.sin(Math.PI*t)**.72),surface=(t,a,inner=false)=>[x+(t-.5)*length,y+(inner?.13:0)+.71*(1-Math.cos(a)),z+Math.sin(a)*width*.5*f(t)*(inner?.86:1)];
  for(let i=0;i<32;i++)for(let j=0;j<16;j++){
    const a=-Math.PI/2+j*Math.PI/16,b=-Math.PI/2+(j+1)*Math.PI/16,t=i/32,u=(i+1)/32;
    quad('paint',surface(t,a),surface(u,a),surface(u,b),surface(t,b));
    quad('canvas',surface(t,b,true),surface(u,b,true),surface(u,a,true),surface(t,a,true));
  }
  for(const side of [-1,1])for(let i=0;i<32;i++){const t=i/32,u=(i+1)/32;cylinder('wood',surface(t,side*Math.PI/2),surface(u,side*Math.PI/2),.043,.043,12);}
  for(const t of [.20,.33,.46,.59,.72,.82]){const xx=x+(t-.5)*length,w=width*f(t)*.78;house('wood',xx,z,.21,w,y+.57,y+.64,.02);}
  for(const t of [.23,.44,.67,.81])for(const side of [-1,1]){const a=surface(t,side*1.1,true),b=surface(t,side*.08,true);cylinder('wood',a,b,.031,.031,10);}
  for(const dz of [-.17,.17]){cylinder('wood',[x-length*.36,y+.65,z+dz],[x+length*.24,y+.65,z+dz],.027,.027,12);house('wood',x+length*.29,z+dz,length*.13,.13,y+.625,y+.67,.045);}
}
part('Open clinker-style boats, thwarts, oars, chocks and curved davits',()=>{
  for(const [x,y,z,l,w]of [[-.55,4.13,-3.36,6.85,1.57],[-.55,4.13,3.36,6.85,1.57],[-13.75,6.38,-1.50,7.25,1.72],[-13.75,6.38,1.50,7.25,1.72],[-19.18,3.65,-2.3,4.95,1.27]]){
    boat(x,y,z,l,w);
    for(const dx of [-l*.29,l*.29]){house('paint',x+dx,z,.28,w*.82,y-.22,y+.11,.065);
      const side=z<0?-1:1,base=[x+dx,deck(x+dx)+.17,z-side*.84],top=[x+dx,y+2.15,z-side*.84],bend=[x+dx,y+2.48,z+side*.14];
      cylinder('paint',base,top,.065,.060,20);cylinder('paint',top,bend,.06,.057,20);cylinder('paint',bend,[x+dx,y+2.28,z+side*.5],.057,.053,20);cylinder('steel',[x+dx,y+2.28,z+side*.5],[x+dx,y+.80,z],.013,.013,8);
      ring('steel',[x+dx,y+2.18,z+side*.5],.065,.016,'x',16);
    }
  }
});
part('Rail stanchions, lifelines, hull lights and boat booms',()=>{
  for(const side of [-1,1]){
    const path=Array.from({length:103},(_,i)=>{const x=-L/2+1.00+i*(L-2.08)/102;return [x,deck(x)+.13,side*(half(x)-.15)];});rail(path);
    for(let x=-43;x<43;x+=1.79)porthole(x,deck(x)-.78,side*(half(x)*.992+.015),.105);
    for(const x of [-18,-8,17])cylinder('paint',[x,deck(x)+.47,side*(half(x)-.15)],[x+4.8,deck(x+4.8)+.45,side*(half(x+4.8)-.15)],.06,.045,16);
  }
  for(const [x,y]of [[-46.6,2.9],[46.25,5.46]])cylinder('paint',[x,y,0],[x,y+2.25,0],.042,.025,16);
});
part('Anchors, hawse pipes, chains, windlass, fairleads and mooring bitts',()=>{
  for(const side of [-1,1]){
    const x=41.8,z=side*half(x)*.985,y=3.15;
    cylinder('steel',[x,y+.48,z],[x+.75,y-.36,z],.087,.085,20);cylinder('steel',[x+.49,y-.10,z-side*.37],[x+.90,y-.56,z+side*.37],.074,.065,16);
    for(const dz of [-.32,.32])cylinder('steel',[x+.75,y-.32,z+dz],[x+.38,y+.02,z+dz],.11,.01,16);
    for(let u=37.6;u<42.9;u+=.20)ring('steel',[u,deck(u)+.17,side*.72],.083,.021,(Math.round(u*5)%2)?'y':'z',12);
    for(const x of [-44.4,-39.0,35.2,42.4]){
      const z=side*(half(x)-.64),y=deck(x)+.15;house('paint',x,z,.91,.53,y,y+.12,.08);
      for(const dx of [-.27,.27]){cylinder('paint',[x+dx,y+.12,z],[x+dx,y+.52,z],.106,.112,20);cylinder('paint',[x+dx,y+.52,z],[x+dx,y+.58,z],.145,.145,20);}
    }
    cylinder('paint',[37.2,deck(37.2)+.2,side*.65],[37.2,deck(37.2)+.74,side*.65],.25,.29,32);
  }
  const y=deck(38.25)+.19;cylinder('steel',[38.25,y+.46,-.78],[38.25,y+.46,.78],.19,.19,32);house('paint',38.25,0,.91,1.63,y,y+.38,.15);
  for(const x of [-42.1,35.0]){const y=deck(x)+.16;cylinder('paint',[x,y,0],[x,y+.59,0],.27,.35,32);cylinder('brass',[x,y+.59,0],[x,y+.64,0],.35,.35,32);}
});
function ventilator(x,z,y,r=.23){cylinder('paint',[x,y,z],[x,y+.85,z],r,r,28);cylinder('paint',[x,y+.81,z],[x+.49,y+1.08,z],r*1.18,r*1.42,28);cylinder('boot',[x+.495,y+1.08,z],[x+.51,y+1.08,z],r*1.1,r*1.1,28);}
part('Cowl ventilators, machinery hatches, lockers and emergency steering gear',()=>{
  for(const [x,z]of [[-29.0,-1.65],[-24.3,1.62],[-18.5,1.65],[-10.1,-1.6],[-5.1,1.40],[2.15,-1.53],[2.15,1.53],[12.05,-1.35],[12.05,1.35],[18.0,-1.72],[18.0,1.72]])ventilator(x,z,deck(x)+.18,x>0?.23:.29);
  for(const x of [-28.0,-23,-8,15,28.8]){const y=deck(x)+.16;house('paint',x,0,1.40,1.10,y,y+.21,.15);
    for(const dz of [-.36,.36])cylinder('steel',[x-.37,y+.245,dz],[x+.37,y+.245,dz],.023,.023,10);
    for(const dx of [-.48,.48])for(const dz of [-.37,.37])cylinder('steel',[x+dx,y+.22,dz],[x+dx,y+.25,dz],.032,.032,8);
  }
  for(const x of [-20.0,-7.0]){const y=deck(x)+.17;house('paint',x,0,2.0,1.72,y,y+.80,.18);for(let i=0;i<5;i++)house('glass',x-.70+i*.35,0,.20,1.33,y+.80,y+.825,.015);}
  for(const side of [-1,1])for(const x of [27.0,17.0,-36.4]){const y=deck(x)+.17;house('paint',x,side*1.61,1.24,.58,y,y+.89,.08);door(x,y+.04,side*1.91);}
  cylinder('paint',[-41.7,3.05,0],[-41.7,3.77,0],.075,.055,20);ring('wood',[-41.7,3.79,0],.30,.027,'x',28);
});
part('Original stern depth-charge tracks and amidships Y-gun',()=>{
  for(const side of [-1,1]){
    const z=side*1.50;
    for(const dz of [-.34,.34]){cylinder('steel',[-47.15,2.89,z+dz],[-43.8,3.38,z+dz],.045,.045,16);cylinder('paint',[-47.15,3.53,z+dz],[-43.8,4.02,z+dz],.037,.037,12);}
    for(const x of [-46.8,-45.3,-44.0])for(const dz of [-.34,.34])cylinder('paint',[x,2.9,z+dz],[x,3.84,z+dz],.045,.045,12);
    for(let i=0;i<5;i++){const x=-44.10-i*.56,y=3.31+(x+44.1)*.13;cylinder('paint',[x,y,z-.29],[x,y,z+.29],.245,.245,32);for(const dz of [-.24,.24])ring('steel',[x,y,z+dz],.249,.020,'z',24);}
  }
  const x=-28.18,y=deck(x)+.17;cylinder('paint',[x,y,0],[x,y+.42,0],.35,.32,32);
  for(const side of [-1,1]){cylinder('paint',[x,y+.30,0],[x,y+1.04,side*.73],.15,.15,24);cylinder('steel',[x-.32,y+1.04,side*.73],[x+.32,y+1.04,side*.73],.235,.235,32);}
});
part('Twin propeller shafts, struts, three-blade screws, bilge keels and rudder',()=>{
  for(const side of [-1,1]){
    cylinder('steel',[-29.7,-2.17,side*1.64],[-43.58,-2.11,side*1.75],.135,.12,32);
    cylinder('paint',[-40.5,-.84,side*2.18],[-42.9,-2.11,side*1.75],.115,.085,24);
    cylinder('brass',[-42.83,-2.11,side*1.75],[-43.78,-2.11,side*1.75],.225,.05,40);
    for(let blade=0;blade<3;blade++){
      const origin=[-43.27,-2.11,side*1.75],a=blade*Math.PI*2/3,p=(r,t,w)=>add(origin,[w,Math.cos(t)*r,Math.sin(t)*r]);
      // A pitched blade has a closed, rounded perimeter instead of a flat fan.
      const outline=[[.19,a-.03,0],[.72,a+.08,.14],[1.14,a+.32,.10],[1.20,a+.53,0],[.97,a+.78,-.08],[.35,a+.67,-.11]];
      const front=outline.map(([r,t,w])=>p(r,t,w+.025)),back=outline.map(([r,t,w])=>p(r,t,w-.025));
      const c=front.reduce((v,q)=>add(v,mul(q,1/front.length)),[0,0,0]),d=back.reduce((v,q)=>add(v,mul(q,1/back.length)),[0,0,0]);
      for(let i=0;i<front.length;i++){const j=(i+1)%front.length;tri('brass',c,front[i],front[j]);tri('brass',d,back[j],back[i]);quad('brass',front[j],front[i],back[i],back[j]);}
    }
    for(let x=-23;x<18;x+=.65){const z=side*3.59;quad('paint',[x,-1.72,z],[x+.65,-1.72,z],[x+.65,-2.05,z+side*.24],[x,-2.05,z+side*.24]);}
  }
  prism('paint',[[-46.4,-.07],[-43.96,-.17],[-43.70,0],[-43.96,.17],[-46.4,.07]],-2.99,-.55,.95);
});
assert.equal(spec.mainGuns.length,4);assert.equal(spec.funnels.length,4);assert.equal(spec.torpedoMounts.reduce((n,b)=>n+b.tubes,0),12);
const buffer=makeGlb();const statistics=validateDetailedShip(buffer,{id:spec.id,metadata:spec});
assert(statistics.bounds.min[1]<-2.9&&statistics.bounds.max[1]>28,'Clemson full hull and mast scale');
assert(statistics.triangles>50000&&statistics.embeddedTextures===3,'Detailed stored geometry and photographic surface maps');
if(!process.argv.includes('--write'))throw Error('Use --write to export this optional authoring source. The game never invokes it.');
const target=path.join(here,'../ships/usa/clemson.glb');await fs.writeFile(target,buffer);
const metadata={...spec,authoringFile:'assets/models/authoring/clemson-1919.json',exporter:'assets/models/authoring/build-clemson.mjs',sha256:crypto.createHash('sha256').update(buffer).digest('hex'),statistics,parts};
await fs.writeFile(target.replace(/\.glb$/,'.source.json'),JSON.stringify(metadata,null,2)+'\n');
console.log(JSON.stringify(statistics));
