// Optional original-geometry authoring. The game opens the GLB directly.
// No voxel data, catalog geometry, external modelling library or network.
import fs from 'node:fs/promises';
import {validateDetailedShip} from '../../../tools/check-models.mjs';
import {createAuthoredMesh} from './authored-mesh.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const spec=JSON.parse(await fs.readFile(path.join(here,'farragut-1934.json'),'utf8'));
const L=spec.dimensions.length,B=spec.dimensions.beam,D=spec.dimensions.draft;
const {groups,parts,add,sub,mul,cross,unit,mix,mesh,tri,quad,part,cylinder,ring,prism,roundedOutline,house,rail,ladder,addTexture,makeGlb}=createAuthoredMesh(spec);
addTexture('naval-paint-albedo',await fs.readFile(path.join(here,'../textures/naval-paint/albedo.png')));
addTexture('naval-paint-normal',await fs.readFile(path.join(here,'../textures/blue_metal_plate/blue_metal_plate_nor_gl_1k.png')));
addTexture('naval-paint-orm',await fs.readFile(path.join(here,'../textures/blue_metal_plate/blue_metal_plate_arm_1k.jpg')),'image/jpeg');
function curveValue(t,column){const ss=spec.hullStations;let i=0;while(i<ss.length-2&&ss[i+1][0]<t)i++;const p=ss[i],q=ss[i+1],u=(t-p[0])/(q[0]-p[0]);const pp=ss[Math.max(0,i-1)],qq=ss[Math.min(ss.length-1,i+2)];const m0=(q[column]-pp[column])/(q[0]-pp[0]),m1=(qq[column]-p[column])/(qq[0]-p[0]);return (2*u*u*u-3*u*u+1)*p[column]+(u*u*u-2*u*u+u)*m0*(q[0]-p[0])+(-2*u*u*u+3*u*u)*q[column]+(u*u*u-u*u)*m1*(q[0]-p[0]);}
const beam=x=>Math.max(.005,curveValue(x/(L/2),1))*B/2;
const sheer=x=>curveValue(x/(L/2),3);
const profile=[[-1,1],[-.995,.72],[-.975,.4],[-.95,.05],[-.89,-.25],[-.74,-.62],[-.46,-.89],[0,-1],[.46,-.89],[.74,-.62],[.89,-.25],[.95,.05],[.975,.4],[.995,.72],[1,1]];
const surface=(t,s)=>{const x=t*L/2,half=beam(x),h=sheer(x),depth=D*Math.max(.01,curveValue(t,2));return [x,s[1]>=0?h*s[1]:depth*s[1],half*s[0]];};
part('Continuous full hull, rounded bilges and stern, raked bow',()=>{
  const rows=161;
  for(let i=0;i<rows-1;i++)for(let j=0;j<profile.length-1;j++){
    const t=-1+2*i/(rows-1),s=-1+2*(i+1)/(rows-1),p=surface(t,profile[j]),q=surface(t,profile[j+1]),r=surface(s,profile[j+1]),z=surface(s,profile[j]);
    const normal=(tx,jj)=>{const dx=sub(surface(Math.min(1,tx+.0001),profile[jj]),surface(Math.max(-1,tx-.0001),profile[jj]));const dy=sub(surface(tx,profile[Math.min(profile.length-1,jj+1)]),surface(tx,profile[Math.max(0,jj-1)]));return unit(cross(dx,dy));};
    const mat=(p[1]+q[1]+r[1]+z[1])/4<-.22?'antifouling':(p[1]+q[1]+r[1]+z[1])/4<.5?'boot':'paint';
    tri(mat,p,r,q,normal(t,j),normal(s,j+1),normal(t,j+1));tri(mat,p,z,r,normal(t,j),normal(s,j),normal(s,j+1));
  }
  for(const t of [-1,1]){const p=profile.map(s=>surface(t,s)),center=[t*L/2,0,0];for(let j=0;j<p.length-1;j++)t<0?tri('paint',center,p[j],p[j+1]):tri('paint',center,p[j+1],p[j]);}
});
part('Main deck camber, forecastle and raised gun decks',()=>{
  for(let i=0;i<160;i++){const a=-L/2+i*L/160,b=-L/2+(i+1)*L/160;for(const sign of [-1,1]){
    const p=[a,sheer(a)+.04,sign*beam(a)*.995],q=[b,sheer(b)+.04,sign*beam(b)*.995],r=[b,sheer(b)+.13,0],s=[a,sheer(a)+.13,0];
    sign>0?quad('deck',p,q,r,s):quad('deck',s,r,q,p);
  }}
  house('paint',25.7,0,14.4,6.55,3.8,5.92,.8);house('deck',25.7,0,14.55,6.7,5.92,6.03,.8);
  house('paint',-26.5,0,13.2,6.25,2.85,3.91,.7);house('deck',-26.5,0,13.35,6.4,3.91,4.02,.7);
  house('paint',5,0,26,4.6,2.8,4.0,.5);house('deck',5,0,26.15,4.75,4.0,4.12,.5);
});
part('Bridge deckhouse, bridge wings, navigation windows and director',()=>{
  house('paint',18.65,0,8.1,6.35,4.2,7.5,.7,.92);house('deck',18.7,0,8.35,6.62,7.5,7.64,.8);
  house('paint',19.8,0,5.55,4.8,7.6,9.95,.7,.92);house('paint',20.65,0,3.9,4.1,9.95,11.48,.8,.94);
  house('paint',20.5,0,4.55,5.25,11.48,11.6,.7);
  for(const sign of [-1,1]){
    house('deck',18.5,sign*3.35,5.9,1.75,9.76,9.9,.2);
    rail(Array.from({length:7},(_,i)=>[15.75+i*.9,9.9,sign*4.05]));
    for(let i=0;i<5;i++){const x=19.15+i*.52;house('glass',x,sign*1.937,.37,.035,10.39,11.03,.01);}
    for(let i=0;i<4;i++){const x=18.3+i*.94;cylinder('brass',[x,8.67,sign*2.405],[x,8.67,sign*2.46],.175,.175,20);cylinder('glass',[x,8.67,sign*2.465],[x,8.67,sign*2.477],.132,.132,20);}
    for(const x of [16,22]){house('paint',x,sign*2.97,.72,.09,5.0,6.8,.09);house('steel',x,sign*3.027,.055,.015,5.25,6.55,.01);}
    ladder([14.3,4.13,sign*2.8],[15.1,7.66,sign*2.8]);ladder([16.0,7.7,sign*2.9],[17.6,9.92,sign*2.9]);
  }
  for(let i=0;i<5;i++)house('glass',22.486,(i-2)*.53,.035,.38,10.39,11.03,.01);
  cylinder('paint',[18.2,11.6,0],[18.2,12.2,0],1.02,.96,40);house('paint',18.4,0,2.2,2.0,12.2,13.35,.32,.83);
  cylinder('paint',[18.4,12.97,-2.15],[18.4,12.97,2.15],.16,.16,24);for(const sign of [-1,1])cylinder('glass',[18.4,12.97,sign*2.15],[18.4,12.97,sign*2.18],.12,.12,20);
});
function gun(g){const x=g.station*L/2,y=g.height,dir=Math.cos(g.bearing*Math.PI/180);
  cylinder('paint',[x,y,0],[x,y+.35,0],1.13,1.05,40);cylinder('paint',[x,y+.35,0],[x,y+1.1,0],.61,.51,32);
  if(g.shield){const outline=[[-1.45,-1.22],[.65,-1.22],[1.52,-.77],[1.52,.77],[.65,1.22],[-1.45,1.22]].map(([a,b])=>[x+a*dir,b]);if(dir<0)outline.reverse();prism('paint',outline,y+.73,y+2.18,.92);house('deck',x-.2*dir,0,2.25,2.05,y+2.18,y+2.24,.1);
    for(const sign of [-1,1])house('steel',x+1.5*dir,sign*.25,.025,.12,y+1.4,y+1.86,.01);
  }else{house('paint',x-.45*dir,0,1.3,1.5,y+1.04,y+1.57,.15);for(const z of [-.58,.58])cylinder('paint',[x,y+.7,z],[x+.25*dir,y+1.53,z],.11,.11,18);cylinder('steel',[x-.63*dir,y+1.55,0],[x+.54*dir,y+1.55,0],.31,.31,24);cylinder('paint',[x-.7*dir,y+.55,.85],[x-.7*dir,y+1.05,.85],.15,.15,16);ring('steel',[x-.38*dir,y+1.17,.9],.25,.025,'z',20);}
  const breech=[x+.3*dir,y+1.57,0],muzzle=[x+5.13*dir,y+1.69,0];cylinder('steel',breech,add(breech,[1.35*dir,.028,0]),.19,.16,32);cylinder('paint',add(breech,[1.35*dir,.028,0]),muzzle,.16,.093,32);cylinder('boot',muzzle,add(muzzle,[.018*dir,.0004,0]),.071,.071,24);
}
for(const g of spec.mainGuns)part('5-inch /38 gun '+g.number+(g.shield?' with shield':' open mount'),()=>gun(g));
part('Unequal funnels, collars, exhaust apertures, steam pipes and ladders',()=>{
  for(const f of spec.funnels){const x=f.station*L/2;
    for(let i=0;i<48;i++){const a=i/48*Math.PI*2,b=(i+1)/48*Math.PI*2,p=[x+Math.cos(a)*f.length/2,f.bottom,Math.sin(a)*f.beam/2],q=[x+Math.cos(b)*f.length/2,f.bottom,Math.sin(b)*f.beam/2],r=[q[0]-.5,f.top,q[2]*.93],s=[p[0]-.5,f.top,p[2]*.93];quad('paint',q,p,s,r);
      const inner=[x-.5+Math.cos(a)*f.length*.42,f.top-.38,Math.sin(a)*f.beam*.4],inner2=[x-.5+Math.cos(b)*f.length*.42,f.top-.38,Math.sin(b)*f.beam*.4];quad('boot',s,r,inner2,inner);tri('boot',[x-.5,f.top-.42,0],inner,inner2);
      for(const h of [f.bottom+.3,f.top-1.0]){const pa=[x+(h-f.bottom)/(f.top-f.bottom)*-.5+Math.cos(a)*(f.length/2+.04),h,Math.sin(a)*(f.beam/2+.04)],pb=[x+(h-f.bottom)/(f.top-f.bottom)*-.5+Math.cos(b)*(f.length/2+.04),h,Math.sin(b)*(f.beam/2+.04)];cylinder('steel',pa,pb,.035,.035,8);}
    }
    for(const sign of [-1,1])cylinder('paint',[x+.8,f.bottom,sign*f.beam*.44],[x+.25,f.top+.18,sign*f.beam*.44],.09,.09,16);
    ladder([x-f.length*.52,f.bottom,0],[x-f.length*.52-.5,f.top-.15,0],.38);
  }
});
part('Two centerline quadruple 21-inch torpedo mountings',()=>{
  for(const m of spec.torpedoMounts){const x=m.station*L/2,y=m.height;cylinder('paint',[x,y,0],[x,y+.48,0],1.12,1.0,40);
    for(const z of [-1.02,-.34,.34,1.02]){cylinder('paint',[x-3.67,y+.88,z],[x+3.67,y+.88,z],.31,.3,32);ring('steel',[x+3.68,y+.88,z],.26,.035,'x',24);cylinder('boot',[x+3.683,y+.88,z],[x+3.691,y+.88,z],.24,.24,24);for(const dx of [-2.4,1.8])ring('paint',[x+dx,y+.88,z],.325,.045,'x',20);}
    for(const dx of [-1.3,1.3])house('steel',x+dx,0,.19,2.95,y+.26,y+.9,.025);house('paint',x-.3,0,1.1,.55,y+1.16,y+1.67,.15);ring('steel',[x-.6,y+1.56,1.48],.23,.024,'z',20);
  }
});
part('Masts, tripod supports, yards, aerial stays and signal halyards',()=>{
  for(const [x,base,top]of [[14,7.65,25.4],[-26.0,4.03,17.1]]){
    cylinder('paint',[x,base,0],[x-.9,top,0],.19,.055,24);
    for(const sign of [-1,1])cylinder('paint',[x-2.4,base,sign*1.52],[x-.53,base+(top-base)*.7,0],.105,.06,16);
    for(const [dy,w]of [[.72,3.1],[.88,2.2]]){const y=base+(top-base)*dy;cylinder('paint',[x-.65,y,-w],[x-.65,y,w],.055,.035,16);for(const z of [-w,-w*.6,w*.6,w])cylinder('steel',[x-.65,y,z],[x+.2,base+1,z*.4],.009,.009,6);}
    ladder([x-.18,base,0],[x-1.05,top-3,0],.34);
  }
  for(const z of [-.23,.23])cylinder('steel',[13.1,24.6,z],[-26.85,16.7,z],.011,.011,6);
});
part('Deck rails, forecastle ladders and hull portholes',()=>{
  for(const sign of [-1,1]){
    rail(Array.from({length:91},(_,i)=>{const x=-L/2+.8+i*(L-2.1)/90;return[x,sheer(x)+.12,sign*(beam(x)-.16)];}));
    for(const [start,end,y,z]of [[18.7,32.2,6.06,3.15],[-32.8,-20.1,4.06,2.99]]){const count=Math.ceil((end-start)/1.15)+1;rail(Array.from({length:count},(_,i)=>[mix(start,end,i/(count-1)),y,sign*z]));}
    for(let x=-43;x<42;x+=2.1){const y=sheer(x)-.63,z=sign*(beam(x)*.998+.013);cylinder('brass',[x,y,z],[x,y,z+sign*.035],.145,.145,20);cylinder('glass',[x,y,z+sign*.037],[x,y,z+sign*.041],.105,.105,16);}
    ladder([31.6,3.7,sign*3.3],[29.8,6.07,sign*3.3]);ladder([-18.7,2.9,sign*2.95],[-20.4,4.08,sign*2.95]);
  }
});
part('Boats, thwarts, davits and lifesaving gear',()=>{
  for(const sign of [-1,1])for(const [x,length]of [[7.0,5.4],[-2.7,4.55]]){
    const z=sign*3.5,y=4.4,w=1.52,outline=[];for(let i=0;i<32;i++){const t=i/32*Math.PI*2;outline.push([x+Math.cos(t)*length/2,z+Math.sin(t)*w/2]);}
    prism('paint',outline,y,y+.66,.86);prism('boot',outline.map(([a,b])=>[x+(a-x)*.83,z+(b-z)*.76]),y+.66,y+.69);
    for(let dx=-length*.3;dx<=length*.31;dx+=length*.15)house('canvas',x+dx,z,.19,w*.71,y+.7,y+.77,.02);
    for(const dx of [-length*.27,length*.27]){cylinder('paint',[x+dx,3.1,z-sign*.15],[x+dx,6.0,z-sign*.15],.07,.07,16);cylinder('paint',[x+dx,6.0,z-sign*.15],[x+dx,6.18,z+sign*.8],.06,.06,16);cylinder('steel',[x+dx,6.18,z+sign*.8],[x+dx,y+.72,z],.014,.014,8);}
  }
  for(const sign of [-1,1])for(const x of [15.7,21.1])ring('canvas',[x,8.28,sign*3.22],.39,.1,'z',28);
});
part('Anchors, capstans, bollards, deck hatches and ventilation fittings',()=>{
  for(const sign of [-1,1]){
    const x=43.5,z=sign*(beam(x)-.07),y=2.82;cylinder('steel',[x,y,z],[x+1.0,y-.9,z],.09,.09,16);cylinder('steel',[x+.8,y-.7,z-.45],[x+1.08,y-.98,z+.45],.075,.06,16);
    for(const dz of [-.33,.33])cylinder('steel',[x+.82,y-.82,z+dz],[x+.6,y-.55,z+dz],.11,.015,16);
    for(let u=39.2;u<43.0;u+=.24)ring('steel',[u,sheer(u)+.15,sign*.58],.09,.023,'y',12);
    for(const xx of [-46,-37,37,46])for(const zz of [-.22,.22]){const zz2=sign*(beam(xx)-.63)+zz,y2=sheer(xx)+.12;cylinder('paint',[xx,y2,zz2],[xx,y2+.46,zz2],.105,.14,16);}
  }
  for(const x of [39,-43]){const y=sheer(x)+.12;cylinder('paint',[x,y,0],[x,y+.65,0],.34,.38,32);cylinder('steel',[x,y+.66,0],[x,y+.79,0],.39,.33,32);}
  for(const x of [-40,-18,34])for(const sign of [-1,1]){const z=sign*1.65,y=sheer(x)+.12;house('paint',x,z,1.18,.88,y,y+.21,.1);for(const dx of [-.36,.36])cylinder('steel',[x+dx,y+.23,z-.3],[x+dx,y+.23,z+.3],.024,.024,8);}
  for(const x of [-20,-4,4,11])for(const sign of [-1,1]){const y=x>0?4.13:3.0,z=sign*2.12;cylinder('paint',[x,y,z],[x,y+.94,z],.25,.25,24);cylinder('paint',[x,y+.92,z],[x+.5,y+1.08,z],.29,.36,24);cylinder('boot',[x+.502,y+1.08,z],[x+.512,y+1.08,z],.28,.28,24);}
  for(const x of [-16,10])for(const sign of [-1,1]){const y=sheer(x);house('paint',x,sign*3.23,2.1,.73,y+.12,y+1.0,.12);for(let j=0;j<7;j++)house('steel',x-.83+j*.27,sign*3.604,.1,.022,y+.31,y+.8,.01);}
});
part('Twin shafts, propeller screws, bilge keels and rudder',()=>{
  for(const sign of [-1,1]){
    cylinder('steel',[-25,-2.8,sign*2.1],[-46,-2.65,sign*2.0],.15,.13,24);cylinder('brass',[-44.2,-2.66,sign*2.0],[-45.3,-2.65,sign*2.0],.24,.10,32);
    for(let i=0;i<3;i++){const angle=i/3*Math.PI*2,center=[-44.65,-2.65,sign*2],p=(r,t,x)=>add(center,[x,Math.cos(t)*r,Math.sin(t)*r]);quad('brass',p(.15,angle,0),p(1.18,angle+.34,.12),p(1.12,angle+.76,-.07),p(.18,angle+.6,-.12));}
    for(let x=-22;x<24;x+=1){const z=sign*3.65;quad('paint',[x,-2.06,z],[x+1,-2.06,z],[x+1,-2.48,z+sign*.32],[x,-2.48,z+sign*.32]);}
  }
  prism('paint',[[-49,-.08],[-46,-.12],[-45.7,.12],[-49,.08]],-3.55,-.95,.95);
});
if(!process.argv.includes('--write'))throw Error('Use --write to export; normal game launch never invokes authoring.');
const output=path.join(here,'../ships/usa/farragut_dd34.glb');
const completedGlb=makeGlb();
const statistics=validateDetailedShip(completedGlb,{id:spec.id,metadata:spec});
await fs.writeFile(output,completedGlb);
const summary={id:spec.id,file:'assets/models/ships/usa/farragut_dd34.glb',triangles:[...groups.values()].reduce((s,g)=>s+g.indices.length/3,0),vertices:[...groups.values()].reduce((s,g)=>s+g.positions.length/3,0),materials:groups.size,bytes:(await fs.stat(output)).size};
await fs.writeFile(path.join(here,'../ships/usa/farragut_dd34.source.json'),JSON.stringify({...spec,authoringFile:'assets/models/authoring/farragut-1934.json',exporter:'assets/models/authoring/build-farragut.mjs',summary,statistics},null,2)+'\n');
console.log(JSON.stringify(summary));
