// Optional authoring tool. Runtime reads the finished GLB directly.
// All surfaces originate here and in the companion survey-based specification.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createAuthoredMesh} from '../assets/models/authoring/authored-mesh.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const spec=JSON.parse(await fs.readFile(path.join(root,'assets/models/source/liberty-ec2-sc1.json'),'utf8'));
const {groups,parts,add,sub,mul,cross,unit,tri,quad,part,cylinder,ring,prism,roundedOutline,house,rail,ladder,addTexture,makeGlb}=createAuthoredMesh(spec);
addTexture('naval-paint',await fs.readFile(path.join(root,'assets/models/textures/naval-paint/albedo.png')));
addTexture('paint-normal',await fs.readFile(path.join(root,'assets/models/textures/blue_metal_plate/blue_metal_plate_nor_gl_1k.png')));
addTexture('paint-orm',await fs.readFile(path.join(root,'assets/models/textures/blue_metal_plate/blue_metal_plate_arm_1k.jpg')),'image/jpeg');
const {length:L,beam:B,draft:D}=spec.dimensions;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
function curve(t,column){
  const a=spec.hullStations;let i=0;while(i<a.length-2&&a[i+1][0]<t)i++;
  const p=a[i],q=a[i+1],pp=a[Math.max(0,i-1)],qq=a[Math.min(a.length-1,i+2)],d=q[0]-p[0],u=clamp((t-p[0])/d,0,1);
  const m0=(q[column]-pp[column])/(q[0]-pp[0]),m1=(qq[column]-p[column])/(qq[0]-p[0]);
  return clamp((2*u**3-3*u*u+1)*p[column]+(u**3-2*u*u+u)*m0*d+(-2*u**3+3*u*u)*q[column]+(u**3-u*u)*m1*d,Math.min(p[column],q[column]),Math.max(p[column],q[column]));
}
const beam=x=>curve(clamp(x/(L/2),-1,1),1)*B/2;
const deck=x=>curve(clamp(x/(L/2),-1,1),3);
const section=[[-1,1],[-1,.7],[-1,.3],[-1,.03],[-1,0],[-.998,-.2],[-.995,-.5],[-.98,-.76],[-.946,-.88],[-.86,-.95],[-.68,-.985],[-.36,-.998],[0,-1],[.36,-.998],[.68,-.985],[.86,-.95],[.946,-.88],[.98,-.76],[.995,-.5],[.998,-.2],[1,0],[1,.03],[1,.3],[1,.7],[1,1]];
function surface(t,j){
  const [width,h]=section[j],full=curve(t,1),under=curve(t,2),load=Math.max(0,-h);
  const half=B/2*(h<0?lerp(full,under,Math.pow(load,.55)):full);
  const stern=6.6*Math.pow(clamp((-t-.7)/.3,0,1),2)*Math.pow(load,.4);
  const bow=4.8*Math.pow(clamp((t-.7)/.3,0,1),2)*load;
  return [t*L/2+stern-bow,h>=0?curve(t,3)*h:D*h,width*half];
}
function normal(t,j){
  const dx=sub(surface(Math.min(1,t+.00005),j),surface(Math.max(-1,t-.00005),j));
  const ds=sub(surface(t,Math.min(section.length-1,j+1)),surface(t,Math.max(0,j-1)));
  return unit(cross(dx,ds));
}
part('Survey-based continuous full hull with raked stem, counter stern, flat keel and round bilges',()=>{
  const rows=260;
  for(let i=0;i<rows;i++)for(let j=0;j<section.length-1;j++){
    const t=-1+2*i/rows,s=-1+2*(i+1)/rows,p=surface(t,j),q=surface(t,j+1),r=surface(s,j+1),z=surface(s,j);
    const h=(p[1]+q[1]+r[1]+z[1])/4,mat=h<-.16?'antifouling':h<.32?'boot':'paint';
    tri(mat,p,r,q,normal(t,j),normal(s,j+1),normal(t,j+1));tri(mat,p,z,r,normal(t,j),normal(s,j),normal(s,j+1));
  }
  for(const t of [-1,1])for(let j=0;j<section.length-1;j++){
    const p=surface(t,j),q=surface(t,j+1),c=[(p[0]+q[0])/2,(p[1]+q[1])/2,0];
    const h=(p[1]+q[1])/2,mat=h<-.16?'antifouling':h<.32?'boot':'paint';
    t<0?tri(mat,c,p,q):tri(mat,c,q,p);
  }
});
// Normal/winding agreement alone also accepts an entirely inside-out hull.
// Check the modeled midbody against the physical outside before adding fittings.
let auditedHullVertices=0;
for(const group of groups.values())for(let i=0;i<group.positions.length;i+=3){
  const [x,y,z]=group.positions.slice(i,i+3),[nx,ny,nz]=group.normals.slice(i,i+3);
  if(Math.abs(x)<L*.25 && Math.abs(z)>B*.44){
    if(nz*Math.sign(z)<.25)throw Error('Inward Liberty hull side normal');
    auditedHullVertices++;
  }
  if(Math.abs(x)<L*.25 && y< -D*.996 && ny>-.75)throw Error('Inward Liberty keel normal');
}
if(auditedHullVertices<1000)throw Error('Liberty full-hull outward-normal audit was not exercised');
part('Cambered steel weather deck and sheer-following bulwarks with drainage scuppers',()=>{
  for(let i=0;i<260;i++){
    const x=-L/2+i*L/260,n=x+L/260;
    for(const sign of [-1,1]){
      const p=[x,deck(x),sign*beam(x)],q=[n,deck(n),sign*beam(n)],r=[n,deck(n)+.18,0],s=[x,deck(x)+.18,0];
      sign>0?quad('deck',p,q,r,s):quad('deck',s,r,q,p);
      if(Math.abs(x)<64){
        const height=x>57||x< -52?.95:.7;
        const topP=add(p,[0,height,0]),topQ=add(q,[0,height,0]);
        const insetP=add(p,[0,0,-sign*.055]),insetQ=add(q,[0,0,-sign*.055]);
        sign>0?quad('paint',p,topP,topQ,q):quad('paint',q,topQ,topP,p);
        sign>0?quad('house',insetP,insetQ,add(insetQ,[0,height,0]),add(insetP,[0,height,0])):quad('house',insetQ,insetP,add(insetP,[0,height,0]),add(insetQ,[0,height,0]));
        quad('paint',topP,add(insetP,[0,height,0]),add(insetQ,[0,height,0]),topQ);
      }
    }
  }
  for(const sign of [-1,1])for(let x=-58;x<61;x+=2.15){
    const y=deck(x),z=sign*(beam(x)-.13);
    cylinder('house',[x,y,z],[x,y+.62,z+sign*.06],.029,.022,8);
    if(Math.abs(x)<53)house('boot',x,sign*(beam(x)+.006),.39,.012,y+.07,y+.23,.065);
  }
  for(const sign of [-1,1])for(let x=-58;x<62;x+=7.3){
    const y=deck(x)+.15,z=sign*(beam(x)+.014);
    cylinder('rust',[x,y,z],[x+.015,y-1.4,z],.018,.003,6);
  }
});
part('Five cargo hatch coamings, rounded corners, battens, canvas-covered boards and securing cleats',()=>{
  for(const h of spec.cargoHatches){const y=deck(h.x)+.15;
    house('paint',h.x,0,h.length+.28,h.beam+.26,y,y+1.1,.14);
    house('boot',h.x,0,h.length-.05,h.beam-.05,y+1.09,y+1.13,.1);
    // Slight convex crown and seams: a physically modeled canvas sheet over hatch boards.
    const length=h.length-.15,width=h.beam-.1,n=40;
    for(let i=0;i<n;i++){const a=h.x-length/2+i*length/n,b=a+length/n;
      for(const sign of [-1,1]){const p=[a,y+1.15,sign*width/2],q=[b,y+1.15,sign*width/2],r=[b,y+1.23,0],s=[a,y+1.23,0];sign>0?quad('canvas',p,q,r,s):quad('canvas',s,r,q,p);}
    }
    for(let x=h.x-h.length/2+.4;x<h.x+h.length/2;x+=.82){
      for(const sign of [-1,1]){house('wood',x,sign*(h.beam/2+.15),.09,.15,y+.81,y+1.1,.025);cylinder('steel',[x,y+.55,sign*(h.beam/2+.17)],[x,y+.79,sign*(h.beam/2+.17)],.026,.026,8);}
    }
    for(const sign of [-1,1])cylinder('steel',[h.x-h.length/2,y+1.17,sign*h.beam/2],[h.x+h.length/2,y+1.17,sign*h.beam/2],.027,.027,10);
  }
});
function door(x,z,y,face='side'){
  if(face==='side'){
    house('boot',x,z,.82,.025,y,y+1.87,.12);house('house',x,z+Math.sign(z)*.022,.73,.04,y+.045,y+1.82,.1);
    for(const h of [.28,1.49])cylinder('steel',[x-.32,y+h,z+Math.sign(z)*.055],[x-.14,y+h,z+Math.sign(z)*.055],.021,.021,10);
    cylinder('brass',[x+.19,y+.88,z+Math.sign(z)*.061],[x+.32,y+.88,z+Math.sign(z)*.061],.023,.023,12);
  }else house('house',x,z,.06,.76,y,y+1.86,.12);
}
function porthole(x,y,z,r=.18){const sign=Math.sign(z);cylinder('brass',[x,y,z],[x,y,z+sign*.022],r,r,28);cylinder('glass',[x,y,z+sign*.025],[x,y,z+sign*.033],r*.78,r*.78,28);}
part('Stepped amidships accommodation, bridge wings, navigation glazing, doors, scuttles and roof equipment',()=>{
  house('house',-4.62,0,22.3,14.8,3.58,6.65,.22);
  house('deck',-4.62,0,22.62,15.08,6.65,6.8,.24);
  house('house',.04,0,12.76,10.7,6.8,9.48,.23);
  house('deck',.04,0,13.0,10.95,9.48,9.61,.23);
  house('house',3.27,0,6.3,9.38,9.61,11.86,.23);
  house('deck',3.23,0,6.58,9.7,11.86,12.03,.25);
  for(const sign of [-1,1]){
    house('deck',4.05,sign*6.12,4.7,2.9,9.48,9.61,.22);
    rail(Array.from({length:7},(_,i)=>[1.85+i*.7,9.61,sign*7.51]));
    for(const x of [-13.8,-9.7,-4.2,1.8,5.8])door(x,sign*7.412,3.83);
    for(const x of [-12,-7.5,-2.3,.8,3.5])porthole(x,5.22,sign*7.426,.205);
    for(const x of [-4.0,-.1,3.0])porthole(x,8.48,sign*5.37,.185);
    door(-5.4,sign*5.365,7.0);
    for(let i=0;i<5;i++)house('glass',1.0+i*1.04,sign*4.704,.71,.025,10.34,11.43,.025);
    for(const x of [-14.8,-8.4,-2.0,5.95])cylinder('paint',[x,6.8,sign*7.05],[x,9.35,sign*7.05],.065,.065,16);
    ladder([-15.7,3.73,sign*6.64],[-13.9,6.8,sign*6.64],.64);
    ladder([-.6,6.8,sign*6.4],[1.4,9.6,sign*6.4],.59);
    for(const x of [-4.8,5.35])ring('rope',[x,10.2,sign*5.5],.36,.115,'z',32);
    for(const x of [-12.2,-8.1,-4,0,4.1]){
      cylinder('paint',[x,6.82,sign*7.2],[x,7.84,sign*7.2],.026,.026,10);
      if(x<4)for(const h of [.46,.95])cylinder('paint',[x,6.82+h,sign*7.2],[x+4.1,6.82+h,sign*7.2],.018,.018,10);
    }
  }
  for(let i=0;i<7;i++)house('glass',6.44,(i-3)*1.16,.032,.79,10.34,11.43,.024);
  for(const sign of [-1,1])for(let i=0;i<4;i++)house('paint',6.456,sign*(i*.1),.018,.045,10.15,10.27,.008);
  cylinder('brass',[4.15,12.03,0],[4.15,12.9,0],.23,.17,24);cylinder('house',[4.15,12.9,0],[4.15,13.15,0],.36,.3,24);
  for(const sign of [-1,1]){cylinder('house',[4.9,9.62,sign*6.0],[4.9,10.61,sign*6.0],.08,.08,16);cylinder('brass',[4.9,10.61,sign*6.0],[4.9,10.83,sign*6.0],.17,.17,24);}
  house('house',-11.15,0,4.5,5.3,6.8,7.65,.14);
  for(const side of [-1,1])for(let i=0;i<7;i++){
    const x=-13.0+i*.62;house('glass',x,side*1.34,.48,2.2,7.66,7.705,.03);
  }
  house('house',-7.4,1.7,2.2,2.3,6.81,7.25,.16);
});
part('Oval funnel with open sooty uptake, reinforcing collars, steam pipes and climbing rungs',()=>{
  const x=-3.03,bottom=9.5,top=16.1;
  for(let i=0;i<72;i++){
    const a=i/72*Math.PI*2,b=(i+1)/72*Math.PI*2;
    const p=[x+Math.cos(a)*1.9,bottom,Math.sin(a)*1.65],q=[x+Math.cos(b)*1.9,bottom,Math.sin(b)*1.65],r=[x-.34+Math.cos(b)*1.81,top,Math.sin(b)*1.56],s=[x-.34+Math.cos(a)*1.81,top,Math.sin(a)*1.56];
    quad('paint',q,p,s,r);
    const inward=p=>[x-.34+(p[0]-(x-.34))*.9,top-.4,p[2]*.9];
    quad('boot',s,r,inward(r),inward(s));tri('boot',[x-.34,top-.75,0],inward(s),inward(r));
    for(const h of [bottom+.3,top-.64]){
      const t=(h-bottom)/(top-bottom),rx=lerp(1.93,1.84,t),rz=lerp(1.68,1.59,t),cx=x-.34*t;
      cylinder('steel',[cx+Math.cos(a)*rx,h,Math.sin(a)*rz],[cx+Math.cos(b)*rx,h,Math.sin(b)*rz],.034,.034,8);
    }
  }
  for(const sign of [-1,1])cylinder('paint',[-2.2,9.4,sign*1.47],[-2.57,16.45,sign*1.47],.095,.095,20);
  ladder([-4.98,9.55,0],[-5.3,16.0,0],.42);
  cylinder('house',[-9.3,7.66,0],[-9.3,11.66,0],.19,.19,24);
  cylinder('boot',[-9.3,11.64,0],[-9.3,11.69,0],.148,.148,24);
});
function fairlead(x,z,y){
  house('paint',x,z,.87,.56,y,y+.16,.14);
  for(const dx of [-.32,.32])cylinder('steel',[x+dx,y+.16,z],[x+dx,y+.5,z],.09,.12,16);
  cylinder('steel',[x-.32,y+.44,z],[x+.32,y+.44,z],.075,.075,16);
}
function winch(x,z,y,large=false){
  const size=large?1.35:1;
  house('paint',x,z,1.64*size,1.09*size,y,y+.21,.12);
  for(const sign of [-1,1]){
    house('paint',x,z+sign*.4*size,.38*size,.17*size,y+.19,y+.85*size,.09);
    cylinder('steel',[x,y+.68*size,z+sign*.4*size],[x,y+.68*size,z+sign*.66*size],.33*size,.31*size,28);
  }
  cylinder('steel',[x,y+.68*size,z-.42*size],[x,y+.68*size,z+.42*size],.22*size,.22*size,28);
  for(let i=0;i<10;i++)ring('rope',[x,y+.68*size,z+(i-4.5)*.074*size],.238*size,.032*size,'z',22);
  cylinder('paint',[x-.6*size,y+.3,z],[x-.6*size,y+.83*size,z],.28*size,.25*size,24);
  ring('steel',[x-.79*size,y+.76*size,z+.55*size],.23,.024,'z',24);
}
part('Three cargo mast houses, ten stowed working derricks, goosenecks, tackle blocks, rigging and steam winches',()=>{
  for(const mast of spec.cargoMasts){
    const x=mast.x,y=deck(x)+.15;
    house('house',x,0,2.7,8.6,y,y+1.34,.15);
    house('deck',x,0,2.85,8.75,y+1.34,y+1.48,.16);
    cylinder('paint',[x,y+1.48,0],[x,mast.top,0],.46,.16,48);
    cylinder('paint',[x,mast.top-4,-3.15],[x,mast.top-4,3.15],.13,.075,24);
    for(const sign of [-1,1]){
      cylinder('steel',[x,mast.top-3,0],[x-4,deck(x-4)+.8,sign*6.95],.018,.018,8);
      cylinder('steel',[x,mast.top-3,0],[x+4,deck(x+4)+.8,sign*6.95],.018,.018,8);
      ladder([x-.49,y+1.48,sign*.2],[x-.2,mast.top-.4,sign*.2],.33);
    }
    for(const b of mast.booms)for(const sign of [-1,1]){
      const a=[x+b.direction*.72,y+1.83,sign*2.8],rise=b.length*.12;
      // The middle mast's aft derricks rest beside the bridge, not through it.
      const endZ=sign*(mast.booms.length===1?8.0:3.55);
      const end=[a[0]+b.direction*Math.sqrt(b.length*b.length-rise*rise-(endZ-a[2])**2),a[1]+rise,endZ];
      cylinder('paint',a,end,.17,.107,32);
      cylinder('steel',[a[0]-.2,a[1],a[2]],[a[0]+.2,a[1],a[2]],.14,.14,24);
      ring('steel',a,.21,.04,'x',24);
      cylinder('steel',[x,mast.top-5.15,sign*.38],end,.018,.018,8);
      const pulley=add(end,[0,-.18,0]);ring('steel',pulley,.15,.026,'z',24);
      cylinder('steel',end,[end[0],deck(end[0])+1.52,end[2]],.017,.017,8);
      cylinder('steel',[end[0]+.045,end[1],end[2]],[end[0]+.045,deck(end[0])+1.52,end[2]],.012,.012,8);
      ring('steel',[end[0],deck(end[0])+1.53,end[2]],.12,.025,'z',20);
      house('paint',end[0],end[2],.5,.65,deck(end[0]),end[1]-.16,.04);
      winch(x+b.direction*2.25,sign*2.8,y);
    }
    door(x,4.325,y+.05);
  }
  // Two centerline heavy-lift booms lie in deck rests, as in the rigging plan.
  for(const [x,d] of [[39.32,-1],[-32.86,1]]){
    const y=deck(x)+2.0;cylinder('paint',[x+d*.6,y,0],[x+d*15.54,y+.34,0],.285,.17,40);
    for(const t of [2,14])house('paint',x+d*t,0,.25,1.3,deck(x+d*t),y-.1,.06);
  }
  cylinder('paint',[1.2,12.03,0],[1.2,28.65,0],.13,.065,28);
  cylinder('paint',[1.2,24.8,-2.4],[1.2,24.8,2.4],.057,.035,16);
  for(const x of [-32.86,17.5,39.32])cylinder('steel',[1.2,28.4,0],[x,spec.cargoMasts.find(m=>m.x===x).top-.1,0],.012,.012,8);
  for(const sign of [-1,1])cylinder('steel',[1.2,27.8,0],[-7,9.62,sign*4.5],.014,.014,8);
});
function lifeboat(x,z,y){
  const length=8.2,width=2.64;
  const shape=(t,u)=>{const fullness=Math.pow(Math.max(0,1-t*t),.62);return [x+t*length/2,y+.65+.48*Math.abs(t)**2-.81*Math.cos(u),z+Math.sin(u)*width/2*fullness];};
  for(let i=0;i<48;i++)for(let j=0;j<18;j++){
    const a=-1+i/24,b=-1+(i+1)/24,c=-Math.PI/2+j*Math.PI/18,d=c+Math.PI/18;
    quad('house',shape(a,c),shape(b,c),shape(b,d),shape(a,d));
    const inner=p=>[p[0],p[1]+.09,z+(p[2]-z)*.92];
    quad('wood',inner(shape(a,c)),inner(shape(a,d)),inner(shape(b,d)),inner(shape(b,c)));
  }
  for(const sign of [-1,1])for(let i=0;i<48;i++)cylinder('wood',shape(-1+i/24,sign*Math.PI/2),shape(-1+(i+1)/24,sign*Math.PI/2),.054,.054,10);
  for(const dx of [-2.8,-1.4,0,1.4,2.8])house('wood',x+dx,z,.24,width*Math.pow(1-(dx/(length/2))**2,.62)*.91,y+.52,y+.6,.024);
  for(const dx of [-2.1,2.1]){
    house('paint',x+dx,z,1.0,2.2,y-.52,y-.2,.08);
    const sign=Math.sign(z),a=[x+dx,y-1.0,z-sign*1.15],b=[x+dx,y+2.55,z-sign*1.15],c=[x+dx,y+2.95,z+sign*.12];
    cylinder('house',a,b,.11,.11,20);cylinder('house',b,c,.11,.072,20);
    ring('steel',c,.16,.026,'x',24);cylinder('rope',c,[x+dx,y+.65,z],.024,.024,10);
  }
  cylinder('wood',[x-2.8,y+.72,z-.36],[x+2.8,y+.72,z-.36],.033,.027,12);
  house('wood',x+2.67,z-.36,.75,.18,y+.68,y+.78,.04);
}
part('Four open lifeboats with continuous shaped hulls, thwarts, gunwales, oars and paired davits',()=>{
  for(const sign of [-1,1])for(const x of [-10.55,-.55])lifeboat(x,sign*6.32,7.38);
});
function vent(x,z,y,height=1.5,r=.27){
  cylinder('house',[x,y,z],[x,y+height-.3,z],r,r,28);
  const steps=12,curvePoint=t=>[x+Math.sin(t)*.38,y+height-.3+(1-Math.cos(t))*.38,z];
  for(let i=0;i<steps;i++)cylinder('house',curvePoint(i/steps*Math.PI/2),curvePoint((i+1)/steps*Math.PI/2),r,r,28);
  const mouth=curvePoint(Math.PI/2);cylinder('house',mouth,add(mouth,[.22,0,0]),r,r*1.3,28);cylinder('boot',add(mouth,[.225,0,0]),add(mouth,[.231,0,0]),r*1.14,r*1.14,28);
}
part('Cowl ventilators, engine-room air intakes, lockers, plumbing and cargo-deck lamps',()=>{
  for(const sign of [-1,1]){
    for(const x of [-52,-17.5,6.6,21,58])vent(x,sign*Math.min(beam(x)-1.05,5.1),deck(x),1.4,.23);
    for(const x of [-8.0,3.7])vent(x,sign*3.7,9.6,2.0,.41);
    for(const x of [-16.4,7.3]){
      house('house',x,sign*5.2,1.65,1.05,deck(x)+.05,deck(x)+1.38,.15);
      for(let i=0;i<8;i++)house('boot',x-.64+i*.18,sign*5.73,.07,.021,deck(x)+.37,deck(x)+1.15,.01);
    }
    for(const x of [-31.2,16.0,37.7]){cylinder('paint',[x,deck(x)+1.49,sign*3.8],[x,deck(x)+2.9,sign*3.8],.045,.045,12);cylinder('house',[x,deck(x)+2.8,sign*3.8],[x+.3,deck(x)+2.8,sign*3.8],.15,.11,20);cylinder('lamp',[x+.302,deck(x)+2.8,sign*3.8],[x+.312,deck(x)+2.8,sign*3.8],.093,.093,20);}
    for(const x of [-14,4]){house('house',x,sign*7.25,1.25,.55,6.82,7.55,.06);house('steel',x,sign*7.54,.42,.018,7.1,7.45,.02);}
  }
});
part('Forecastle and poop houses, anchor windlass, capstans, paired bitts, chain and stockless anchors',()=>{
  house('house',-57.8,0,10.4,7.2,4.7,6.4,.48);house('deck',-57.8,0,10.6,7.4,6.4,6.53,.48);
  house('house',59.5,0,4.8,5.4,5.31,7.15,.4);house('deck',59.5,0,5.0,5.6,7.15,7.28,.4);
  for(const sign of [-1,1]){
    for(const x of [-59.9,-56.8])porthole(x,5.65,sign*3.615,.17);
    door(-54.3,sign*3.61,4.78);
    ladder([-53.2,4.35,sign*3.0],[-54.1,6.53,sign*3.0],.54);
    for(const x of [-59,-50,51,59]){const z=sign*(beam(x)-1.0),y=deck(x);house('paint',x,z,1.45,.67,y,y+.1,.12);for(const dx of [-.42,.42]){cylinder('paint',[x+dx,y+.1,z],[x+dx,y+.69,z],.17,.18,24);cylinder('steel',[x+dx,y+.62,z],[x+dx,y+.75,z],.23,.23,24);}fairlead(x+1.65,sign*(beam(x+1.65)-.25),deck(x+1.65)+.55);}
    const ax=61.2,az=sign*(beam(ax)+.04),ay=deck(ax)-1.45;
    cylinder('steel',[ax,ay,az],[ax-.45,ay-1.1,az],.12,.11,24);
    cylinder('steel',[ax-.6,ay-1.13,az-.55],[ax-.3,ay-1.13,az+.55],.105,.105,20);
    for(const dz of [-.43,.43]){const c=[ax-.45,ay-1.13,az+dz];tri('steel',c,add(c,[.25,.54,.16]),add(c,[-.22,.38,-.13]));tri('steel',c,add(c,[-.22,.38,-.13]),add(c,[.25,.54,.16]));}
    ring('steel',[ax,ay+.16,az],.2,.057,'z',28);
    for(let x=57.0;x<61.0;x+=.16)ring('steel',[x,deck(x)+.22,sign*1.16],.09,.023,Math.round(x/.16)%2?'x':'y',14);
  }
  winch(56.8,0,deck(56.8),true);
  for(const x of [-63.0,63.0]){const y=deck(x);cylinder('paint',[x,y,0],[x,y+.65,0],.34,.38,32);cylinder('steel',[x,y+.65,0],[x,y+.79,0],.44,.36,32);}
  for(const sign of [-1,1])rail(Array.from({length:10},(_,i)=>[-62.5+i*1.02,6.54,sign*3.52]));
});
part('Single shaft, four bladed 18 ft 6 in bronze screw, faired sternpost, rudder and paired bilge keels',()=>{
  const center=[-62.42,-4.4,0],radius=2.8194;
  cylinder('steel',[-53.8,-4.4,0],[-63.1,-4.4,0],.27,.23,40);
  cylinder('brass',[-62.0,-4.4,0],[-63.25,-4.4,0],.43,.14,48);
  for(let blade=0;blade<4;blade++){
    const angle=blade*Math.PI/2;
    const p=(r,s,thickness)=>{const twist=.57*(1-r/radius),a=angle+s+r*.19;return add(center,[Math.sin(twist+s)*r*.2+thickness,Math.cos(a)*r,Math.sin(a)*r]);};
    for(let i=0;i<18;i++)for(let j=0;j<12;j++){
      const r=.36+(radius-.36)*i/18,n=.36+(radius-.36)*(i+1)/18;
      const span=v=>.42*Math.sin(Math.PI*(v-.24)/(radius+.06))+.06;
      const a=-span(r)+2*span(r)*j/12,b=-span(r)+2*span(r)*(j+1)/12,c=-span(n)+2*span(n)*(j+1)/12,d=-span(n)+2*span(n)*j/12;
      quad('brass',p(r,a,.024),p(n,d,.024),p(n,c,.024),p(r,b,.024));
      quad('brass',p(r,b,-.024),p(n,c,-.024),p(n,d,-.024),p(r,a,-.024));
    }
  }
  // Fair rudder blade has a rounded leading edge and thin trailing edge.
  const outline=[[-64.15,-.06],[-64.8,-.17],[-66.3,-.08],[-66.4,0],[-66.3,.08],[-64.8,.17],[-64.15,.06]].reverse();
  prism('antifouling',outline,-7.27,-1.25,.91);
  cylinder('steel',[-64.2,-6.9,0],[-64.2,.9,0],.14,.14,28);
  for(const sign of [-1,1])for(let x=-31;x<33;x+=.8){const z=sign*7.5;
    quad('antifouling',[x,-6.77,z],[x+.8,-6.77,z],[x+.8,-7.0,z+sign*.48],[x,-7.0,z+sign*.48]);
    quad('antifouling',[x,-7.0,z+sign*.48],[x+.8,-7.0,z+sign*.48],[x+.8,-6.77,z],[x,-6.77,z]);
  }
});

if(!process.argv.includes('--write'))throw Error('Pass --write to author the GLB. This tool is never part of game launch.');
const output=path.join(root,'assets/models/ships/generic/liberty-ec2-sc1.glb');
await fs.writeFile(output,makeGlb());
const summary={id:spec.id,file:path.relative(root,output).replaceAll('\\','/'),triangles:[...groups.values()].reduce((n,g)=>n+g.indices.length/3,0),vertices:[...groups.values()].reduce((n,g)=>n+g.positions.length/3,0),materials:groups.size,components:parts.length,auditedHullVertices,bytes:(await fs.stat(output)).size};
await fs.writeFile(output.replace(/\.glb$/,'.source.json'),JSON.stringify({...spec,authoringFile:'assets/models/source/liberty-ec2-sc1.json',exporter:'tools/author-liberty-model.mjs',summary,components:parts},null,2)+'\n');
console.log(JSON.stringify(summary));
