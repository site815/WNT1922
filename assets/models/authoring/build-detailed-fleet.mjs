// Optional exterior authoring. The game loads the completed GLBs directly.
// This reads dimensional class specifications, never old recognition meshes.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createAuthoredMesh} from './authored-mesh.mjs';
import {validateDetailedShip} from '../../../tools/check-models.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const option=name=>process.argv.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
const source=JSON.parse(await fs.readFile(path.join(root,'assets/models/authoring/fleet-specifications.json'),'utf8'));
const overrides={ships:{}};
for(const name of ['fleet-fit-overrides.json','capital-fit-overrides.json','surface-fit-overrides.json','additional-fleet-specifications.json'])Object.assign(overrides.ships,JSON.parse(await fs.readFile(path.join(root,'assets/models/authoring',name),'utf8').catch(()=>'{"ships":{}}')).ships);
const known=new Set(source.ships.map(s=>s.id));
for(const [id,s]of Object.entries(overrides.ships))if(!known.has(id)){assert(s.id===id&&s.output&&s.dimensions&&s.stations&&s.hullStations,'New class needs a complete specification: '+id);source.ships.push(s);}
const textures=await Promise.all(['albedo.png','normal.png','orm.png'].map(n=>fs.readFile(path.join(root,'assets/models/textures/naval-paint',n))));
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x)),lerp=(a,b,t)=>a+(b-a)*t;
const paint=(color,roughness=.9)=>({color:[...color,1],metallic:0,roughness,baseColorTexture:'naval-albedo',normalTexture:'naval-normal',normalScale:.45,metallicRoughnessTexture:'naval-orm',occlusionTexture:'naval-orm'});
const palette={GBR:[.33,.355,.37],USA:[.355,.38,.395],JPN:[.27,.285,.29],FRA:[.39,.405,.415],ITA:[.385,.4,.41],DEU:[.37,.39,.41],SOV:[.33,.35,.36]};
const woodNations=new Set(['BB','BC','CA','CL','CV','CVL']);
const summary=[];
for(const base of source.ships){
  if(option('--only')&&!option('--only').split(',').includes(base.id))continue;
  const spec={...base,...(overrides.ships?.[base.id]||{}),indexVertices:true};
  spec.materials={paint:paint(palette[spec.nation]||palette.GBR),deck:paint(woodNations.has(spec.type)?[.40,.34,.235]:[.17,.185,.19]),antifouling:{color:[.25,.055,.035,1],metallic:0,roughness:.92},boot:{color:[.022,.025,.029,1],metallic:0,roughness:.9},steel:{color:[.08,.09,.105,1],metallic:.78,roughness:.45},glass:{color:[.045,.09,.12,1],metallic:.12,roughness:.18},brass:{color:[.34,.245,.105,1],metallic:.8,roughness:.45},canvas:{color:[.54,.51,.43,1],metallic:0,roughness:.95},white:{color:[.68,.69,.66,1],metallic:0,roughness:.94},red:{color:[.34,.028,.018,1],metallic:0,roughness:.5}};
  spec.materialSources=[{name:'Original naval surface maps',author:'WNT1922',license:'Original project artwork',manifest:'assets/models/textures/naval-paint/source.json',usage:'Embedded albedo, tangent normal and occlusion/roughness/metallic maps. Metre-scaled texture coordinates.'}];
  const M=createAuthoredMesh(spec),{groups,parts,add,sub,mul,cross,unit,tri,quad,part,cylinder,ring,prism,house,rail,ladder}=M;
  ['naval-albedo','naval-normal','naval-orm'].forEach((n,i)=>M.addTexture(n,textures[i]));
  const {length:L,beam:B,draft:D}=spec.dimensions,submarine=['SS','SM'].includes(spec.type),carrier=['CV','CVL'].includes(spec.type),auxiliary=spec.type==='AO';
  const stations=spec.stations,deck0=spec.hullStations.find(p=>p[0]===0)[3],equipment={mainBarrels:[],secondaryBarrels:[],aaBarrels:[],torpedoTubes:[]};
  function curve(t,k){const s=spec.hullStations;let i=0;while(i<s.length-2&&s[i+1][0]<t)i++;const p=s[i],q=s[i+1],a=s[Math.max(0,i-1)],b=s[Math.min(s.length-1,i+2)],u=clamp((t-p[0])/(q[0]-p[0]),0,1),d=q[0]-p[0];return clamp((2*u**3-3*u*u+1)*p[k]+(u**3-2*u*u+u)*(q[k]-a[k])/(q[0]-a[0])*d+(-2*u**3+3*u*u)*q[k]+(u**3-u*u)*(b[k]-p[k])/(b[0]-p[0])*d,Math.min(p[k],q[k]),Math.max(p[k],q[k]));}
  const width=x=>Math.max(.0005,curve(clamp(x/(L/2),-1,1),1))*B/2,deck=x=>curve(clamp(x/(L/2),-1,1),3);
  const section=submarine?[[-1,1],[-1,.6],[-1,.15],[-.997,0],[-.96,-.3],[-.83,-.62],[-.6,-.86],[-.31,-.98],[0,-1],[.31,-.98],[.6,-.86],[.83,-.62],[.96,-.3],[.997,0],[1,.15],[1,.6],[1,1]]:[[-1,1],[-1,.7],[-.996,.3],[-.99,0],[-.982,-.22],[-.967,-.48],[-.924,-.7],[-.827,-.89],[-.59,-.982],[-.3,-.999],[0,-1],[.3,-.999],[.59,-.982],[.827,-.89],[.924,-.7],[.967,-.48],[.982,-.22],[.99,0],[.996,.3],[1,.7],[1,1]];
  function surface(t,j){const [w,h]=section[j],load=Math.max(0,-h),rake=(submarine?0:1.4)*D*Math.max(0,t-.70)**2,overhang=(submarine?0:3.1)*D*Math.max(0,-t-.76)**2;return [t*L/2-rake*(1-h)+overhang*load,h<0?-D*curve(t,2)*load:deck(t*L/2)*h,w*width(t*L/2)*(1-(submarine?.045:.07)*load)];}
  const hullRows=Math.max(96,Math.ceil(L/.9));
  part('Continuous class-specific full hull with curved bilges and underwater body',()=>{
    const normal=(t,j)=>unit(cross(sub(surface(Math.min(1,t+.00005),j),surface(Math.max(-1,t-.00005),j)),sub(surface(t,Math.min(section.length-1,j+1)),surface(t,Math.max(0,j-1)))));
    for(let i=0;i<hullRows;i++)for(let j=0;j<section.length-1;j++){const t=-1+2*i/hullRows,u=-1+2*(i+1)/hullRows,a=surface(t,j),b=surface(t,j+1),c=surface(u,j+1),d=surface(u,j),y=(a[1]+b[1]+c[1]+d[1])/4,material=y<-.22?'antifouling':y<.22?'boot':'paint';tri(material,a,c,b,normal(t,j),normal(u,j+1),normal(t,j+1));tri(material,a,d,c,normal(t,j),normal(u,j),normal(u,j+1));}
    for(const t of [-1,1])for(let j=0;j<section.length-1;j++){const p=surface(t,j),q=surface(t,j+1),center=[(p[0]+q[0])/2,(p[1]+q[1])/2,0];t<0?tri('paint',center,p,q):tri('paint',center,q,p);}
  });
  part('Cambered weather deck, perimeter gutters and hull plating seams',()=>{
    for(let i=0;i<hullRows;i++){const x=-L/2+i*L/hullRows,n=-L/2+(i+1)*L/hullRows;for(const side of [-1,1]){const a=[x,deck(x),side*width(x)],b=[n,deck(n),side*width(n)],c=[n,deck(n)+Math.min(.17,B*.013),0],d=[x,deck(x)+Math.min(.17,B*.013),0];side>0?quad('deck',a,b,c,d):quad('deck',d,c,b,a);}}
    // Thin continuous plate strakes avoid coplanar overlay polygons and flicker.
    if(!submarine)for(const side of [-1,1])for(const fraction of [.28,.63])for(let i=2;i<hullRows-2;i++){const x=-L/2+i*L/hullRows,n=-L/2+(i+1)*L/hullRows;cylinder('paint',[x,deck(x)*fraction,side*(width(x)+.007)],[n,deck(n)*fraction,side*(width(n)+.007)],.014,.014,6);}
  });
  function elliptic(mat,x,z,w,d,bottom,top,scale=1,cap=true){
    const N=40,p=(a,y,s)=>[x+Math.cos(a)*w/2*s,y,z+Math.sin(a)*d/2*s];
    for(let i=0;i<N;i++){const a=i/N*Math.PI*2,b=(i+1)/N*Math.PI*2,lo=p(a,bottom,1),ln=p(b,bottom,1),hi=p(a,top,scale),hn=p(b,top,scale),na=unit([Math.cos(a)/w,0,Math.sin(a)/d]),nb=unit([Math.cos(b)/w,0,Math.sin(b)/d]);tri(mat,ln,lo,hi,nb,na,na);tri(mat,ln,hi,hn,nb,na,nb);if(cap){tri(mat,[x,top,z],hn,hi);tri(mat,[x,bottom,z],lo,ln);}}
  }
  function port(x,y,z,r=.14){const side=Math.sign(z)||1;cylinder('brass',[x,y,z],[x,y,z+side*.025],r,r,16);cylinder('glass',[x,y,z+side*.026],[x,y,z+side*.033],r*.77,r*.77,16);}
  function hatch(x,z,y,l=1.0,w=.65){house('paint',x,z,l,w,y,y+.095,.12);for(const xx of [-l*.32,l*.32])cylinder('steel',[x+xx,y+.10,z-w*.37],[x+xx,y+.10,z+w*.37],.02,.02,8);ring('steel',[x,y+.115,z],.11,.018,'y',12);}
  function door(x,z,y){const side=Math.sign(z)||1;house('paint',x,z,.69,.075,y,y+1.72,.11);for(const yy of [.27,1.34])cylinder('steel',[x-.29,y+yy,z+side*.04],[x-.12,y+yy,z+side*.04],.024,.024,8);cylinder('brass',[x+.14,y+.92,z+side*.05],[x+.24,y+.92,z+side*.05],.025,.025,8);}
  function cowl(x,z,y,height=1.5,r=.23){cylinder('paint',[x,y,z],[x,y+height-.25,z],r,r,20);const p=t=>[x+Math.sin(t)*r*1.3,y+height-.25+(1-Math.cos(t))*r*1.3,z];for(let i=0;i<7;i++)cylinder('paint',p(i/7*Math.PI/2),p((i+1)/7*Math.PI/2),r,r,16);const end=p(Math.PI/2);cylinder('paint',end,add(end,[r*.22,0,0]),r,r*1.28,20);cylinder('boot',add(end,[r*.223,0,0]),add(end,[r*.228,0,0]),r*1.12,r*1.12,20);}
  function houseDetailed(s){const y=Math.max(s.z,deck(s.x)),h=Math.max(.5,s.h),w=s.w,d=s.d,bevel=Math.min(w,d)*.13;
    house('paint',s.x,s.y,w,d,y,y+h,bevel,.975);house('deck',s.x,s.y,w+.16,d+.16,y+h,y+h+.1,bevel);
    if(w>2&&d>1.6)for(const side of [-1,1]){const zz=s.y+side*(d/2+.022);if(h>1.8){for(let x=s.x-w/2+.65;x<s.x+w/2-.3;x+=1.45)port(x,y+Math.min(h-.5,1.6),zz,.12);door(s.x-w*.32,zz,y+.10);}if(s.role==='bridge'||s.role==='island'){const count=Math.max(2,Math.floor(w/1.2));for(let i=0;i<count;i++)house('glass',s.x-w*.38+i*w*.76/(count-1),zz,.65,.025,y+h-.88,y+h-.28,.045);}}
    if((s.role==='bridge'||s.role==='island')&&h>1.1){for(let z=s.y-d*.38;z<=s.y+d*.38;z+=1.0)house('glass',s.x+w/2+.008,z,.025,.68,y+h-.88,y+h-.28,.03);rail([[s.x-w*.43,y+h+.13,s.y-d*.46],[s.x+w*.43,y+h+.13,s.y-d*.46],[s.x+w*.43,y+h+.13,s.y+d*.46],[s.x-w*.43,y+h+.13,s.y+d*.46]],[.45,.9]);}
  }
  for(const s of stations.filter(p=>['bridge-base','bridge','island','deckhouse','hangar-house','pump-house'].includes(p.role)))part('Shaped '+s.role+' with glazing, doors, portholes and roof rails',()=>houseDetailed(s));
  function gun(x,z,y,barrels,caliber,bearing=0,enclosed=true,wOverride,group='secondaryBarrels',shielded=false,shape={}){
    const angle=bearing*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),p=(a,b,d)=>[x+a*c-d*s,y+b,z+a*s+d*c],radius=Math.max(.24,caliber/1000*3.6),w=wOverride||Math.max(1.3,caliber/1000*(barrels>1?24:14)),height=shape.h||Math.max(.95,caliber/1000*8.6),length=shape.w||Math.max(1.6,caliber/1000*25),columns=Math.ceil(barrels/(shape.barrelRows||1)),pitch=columns>1?w/(columns+1):0;
    cylinder('paint',p(0,0,0),p(0,.25,0),w*.40,w*.40,32);cylinder('paint',p(0,.25,0),p(0,Math.min(height*.45,.9),0),enclosed?w*.34:.21,enclosed?w*.34:.18,32);
    const corners=[[-length*.50,-w*.43],[-length*.36,-w*.50],[length*.32,-w*.5],[length*.5,-w*.34],[length*.5,w*.34],[length*.32,w*.5],[-length*.36,w*.5],[-length*.5,w*.43]].map(([a,d])=>p(a,0,d));
    if(enclosed){prism('paint',corners.map(a=>[a[0],a[2]]),y+.22,y+height,.88);for(const dz of [-w*.26,w*.26]){const q=p(-length*.18,height,dz);hatch(q[0],q[2],q[1],Math.min(.9,length*.28),Math.min(.55,w*.2));}const a=p(-length*.39,height*.65,0),b=p(-length*.39,height*.65,w*.62);cylinder('paint',a,b,.07,.07,16);}
    if(shielded&&!enclosed){const panel=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len*.045,nz=dx/len*.045;prism('paint',[[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz],[a[0]-nx,a[1]-nz]].map(([u,v])=>{const q=p(u,0,v);return[q[0],q[2]];}),y+.28,y+height+.20,.98);};panel([length*.3,-w*.53],[length*.3,w*.53]);for(const side of[-1,1])panel([-length*.30,side*w*.53],[length*.3,side*w*.53]);}
    for(let j=0;j<barrels;j++){const dz=(j%columns-(columns-1)/2)*pitch,gh=height*.65+Math.floor(j/columns)*.24,root=length*.26,reach=caliber/1000*(caliber>200?40:caliber>75?38:40),breech=caliber/1000*(caliber>75?1.4:2.3);cylinder('paint',p(root-.32,gh,dz),p(root+reach*.28,gh+.03,dz),Math.max(.07,breech),Math.max(.06,breech*.82),24);cylinder('steel',p(root+reach*.28,gh+.03,dz),p(root+reach,gh+.1,dz),Math.max(.05,breech*.83),Math.max(.025,caliber/2000*.80),24);cylinder('boot',p(root+reach+.001,gh+.1,dz),p(root+reach+.006,gh+.1,dz),Math.max(.015,caliber/2200),Math.max(.015,caliber/2200),16);equipment[group].push({caliber,bearing,mount:[x,y,z],muzzle:p(root+reach+.006,gh+.1,dz).map(Math.fround)});
      if(!enclosed){cylinder('steel',p(-.4,gh,dz),p(.45,gh,dz),Math.max(.07,breech),Math.max(.07,breech),20);for(const side of [-1,1]){const q=p(-.3,gh-.18,dz+side*.35);ring('steel',q,.18,.018,Math.abs(c)>.5?'z':'x',16);}cylinder('brass',p(-.4,gh+.23,dz-.2),p(.2,gh+.23,dz-.2),.021,.021,10);}
    }
  }
  let mainTotal=0;
  const main=stations.filter(p=>p.role==='main');
  function weaponSupport(s,bottom){
    if(s.sponson){const side=Math.sign(s.y)||1,bw=Math.max(2,s.d),bl=Math.max(2.8,s.w),inner=side*Math.min(Math.abs(s.y),width(s.x)*.86),outer=s.y+side*bw*.52;prism('paint',[[s.x-bl*.5,inner],[s.x+bl*.5,inner],[s.x+bl*.4,outer],[s.x-bl*.4,outer]],bottom-.16,bottom,.96);for(const dx of [-bl*.32,bl*.32])cylinder('paint',[s.x+dx,bottom-1.7,inner],[s.x+dx,bottom-.18,s.y],.09,.07,12);}
    if(s.casemate){const side=Math.sign(s.y)||1,edge=side*(width(s.x)+.018),yy=bottom+.78;cylinder('boot',[s.x,yy,edge],[s.x,yy,edge+side*.025],.70,.70,24);ring('paint',[s.x,yy,edge+side*.04],.72,.055,'z',24);}
    if(!s.casemate&&!s.sponson&&s.role!=='main'&&bottom>deck(s.x)+.3){cylinder('paint',[s.x,deck(s.x),s.y],[s.x,bottom,s.y],Math.max(.3,s.d*.40),Math.max(.3,s.d*.40),32);cylinder('paint',[s.x,bottom-.10,s.y],[s.x,bottom,s.y],Math.max(.6,s.d*.61),Math.max(.6,s.d*.61),32);}
  }
  for(const [i,s]of main.entries()){const n=s.barrels||Math.max(1,Math.round(spec.armament.barrels/main.length)),caliber=s.caliber||spec.armament.caliber||100;mainTotal+=n;const bearing=s.bearing??(s.x<0?180:0);part('Main battery mount '+(i+1)+' '+n+' x '+caliber+' mm',()=>{
    const bottom=s.casemate||s.sponson?s.z:Math.max(deck(s.x),s.z);weaponSupport(s,bottom);if(!s.casemate&&!s.sponson&&bottom>deck(s.x)+.3)cylinder('paint',[s.x,deck(s.x),s.y],[s.x,bottom,s.y],s.d*.43,s.d*.43,48);
    gun(s.x,s.y,bottom,n,caliber,bearing,s.casemate?false:s.enclosed??caliber>=140,s.d,'mainBarrels',s.shielded,s);
  });}
  for(const [i,s]of stations.filter(p=>p.role==='secondary').entries())part('Secondary mount '+(i+1),()=>{
    const fit=spec.armament.secondary[0],caliber=s.caliber||fit?.caliber_mm||(fit?.caliber_in?fit.caliber_in*25.4:100),count=s.barrels||(fit?.mounts?.includes('x2')?2:1);
    const bottom=s.casemate||s.sponson?s.z:Math.max(deck(s.x),s.z);weaponSupport(s,bottom);gun(s.x,s.y,bottom,count,caliber,s.bearing??(s.y<0?-90:90),s.casemate?false:s.enclosed??true,Math.max(s.d,1.4),'secondaryBarrels',s.shielded,s);
  });
  for(const [i,s]of stations.filter(p=>p.role==='light-aa').entries())part('Light AA pedestal '+(i+1),()=>{const bottom=s.sponson?s.z:Math.max(deck(s.x),s.z);weaponSupport(s,bottom);gun(s.x,s.y,bottom,s.barrels||1,s.caliber||(spec.type==='TB'?13.2:20),s.bearing??(s.y<0?-70:70),s.enclosed??false,Math.max(.75,s.d),'aaBarrels',s.shielded,s);});
  const tubeStations=stations.filter(s=>s.role==='torpedo-tube');
  const banks=new Map();for(const s of tubeStations){const key=s.bankId??[s.x.toFixed(3),s.z.toFixed(3),s.bearing??0,s.fixed?'fixed':'trained',s.submerged?'submerged':'surface'].join(':');if(!banks.has(key))banks.set(key,[]);banks.get(key).push(s);}
  for(const [key,tubes]of banks)part('Torpedo bank at '+key+' m: '+tubes.length+' individual tubes, gearing, rings and end caps',()=>{
    const cx=tubes.reduce((sum,t)=>sum+t.x,0)/tubes.length,cz=tubes.reduce((sum,t)=>sum+t.y,0)/tubes.length,y=Math.max(deck(cx)+.1,tubes[0].z),fixed=tubes.every(t=>t.fixed||t.submerged);
    if(!fixed){cylinder('paint',[cx,y,cz],[cx,y+.37,cz],.78,.75,32);cylinder('steel',[cx,y+.37,cz],[cx,y+.43,cz],.78,.78,32);}
    for(const t of tubes){const length=t.fixed||t.submerged?Math.min(t.w,1.2):t.w,r=Math.max(.24,t.d/2),yy=t.fixed||t.submerged?t.z:Math.max(deck(t.x)+.1,t.z)+.74,a=(t.bearing??0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a),p=(u,v,w)=>[t.x+u*c-w*s,yy+v,t.y+u*s+w*c];
      cylinder('paint',p(-length/2,0,0),p(length/2,0,0),r,r,24);for(const dx of[-length*.32,length*.28]){const pts=Array.from({length:25},(_,i)=>p(dx,Math.cos(i/24*Math.PI*2)*(r+.017),Math.sin(i/24*Math.PI*2)*(r+.017)));for(let i=0;i<24;i++)cylinder('steel',pts[i],pts[i+1],.023,.023,8);}
      cylinder('boot',p(length/2+.006,0,0),p(length/2+.015,0,0),r*.86,r*.86,20);cylinder('paint',p(-length/2-.09,0,0),p(-length/2,0,0),r*.85,r,20);if(!t.fixed&&!t.submerged){const q=p(-length*.27,r,0);house('steel',q[0],q[2],.32,.17,q[1],q[1]+.11,.025);}equipment.torpedoTubes.push({center:[t.x,yy,t.y],bankId:t.bankId,bearing:t.bearing??0,fixed:!!t.fixed,submerged:!!t.submerged,muzzle:p(length/2+.015,0,0).map(Math.fround)});
    }
    if(!fixed){const span=Math.max(.65,...tubes.map(t=>Math.abs(t.y-cz)+t.d/2));for(const dx of[-.8,.8])house('steel',cx+dx,cz,.2,span*2,y+.43,y+.58,.025);ring('steel',[cx-.55,y+1.22,cz+span+.14],.21,.02,'z',16);}
  });
  for(const [i,s]of stations.filter(p=>p.role==='funnel').entries())part('Funnel '+(i+1)+' with curved open uptake, cap, steam pipes and stays',()=>{
    const y=Math.max(s.z,deck(s.x)),top=y+s.h+Math.max(.3,s.h*.13),rake=spec.year<1925?Math.min(.7,s.h*.07):.1,N=40;
    const point=(a,h,inset=0)=>[s.x-(h-y)/(top-y)*rake+Math.cos(a)*(s.w/2-inset),h,s.y+Math.sin(a)*(s.d/2-inset)];
    for(let j=0;j<N;j++){const a=j/N*Math.PI*2,b=(j+1)/N*Math.PI*2;for(const [lo,hi,mat]of [[y,top-.4,'paint'],[top-.4,top,'boot']]){quad(mat,point(b,lo),point(a,lo),point(a,hi),point(b,hi));}quad('boot',point(a,top),point(a,top,.12),point(b,top,.12),point(b,top));quad('boot',point(a,top,.12),point(a,top-.5,.12),point(b,top-.5,.12),point(b,top,.12));tri('boot',[s.x-rake,top-.51,s.y],point(b,top-.5,.12),point(a,top-.5,.12));}
    for(const side of [-1,1]){cylinder('paint',[s.x,y,s.y+side*(s.d/2+.1)],[s.x-rake,top+.18,s.y+side*(s.d/2+.1)],.065,.065,16);for(const dx of [-s.w*.8,s.w*.8])cylinder('steel',[s.x-rake,top-.7,s.y+side*s.d*.45],[s.x+dx,deck(s.x+dx),s.y+side*(s.d*.65)],.013,.013,8);}ladder([s.x-s.w/2-.13,y,s.y],[s.x-s.w/2-rake-.13,top-.25,s.y],.35);
  });
  for(const [i,s]of stations.filter(p=>p.role==='mast').entries())part('Mast '+(i+1)+' with taper, yards, rigging and access ladder',()=>{
    const y=Math.max(s.z,deck(s.x)),top=y+s.h,r=Math.min(.28,Math.max(.10,B*.013)),rake=spec.year<1926?s.h*.025:0;
    if(y>deck(s.x)+.1)cylinder('paint',[s.x,deck(s.x),s.y],[s.x,y,s.y],r*1.2,r,24);
    if(s.style==='cage'){
      const radius=s.baseRadius||Math.min(B*.13,3.1),cageHeight=s.h*.74,point=(t,a)=>[s.x-rake*t+Math.cos(a)*radius*(.22+.78*(1-t)**1.8),y+cageHeight*t,s.y+Math.sin(a)*radius*(.22+.78*(1-t)**1.8)];
      for(let j=0;j<16;j++)for(let k=0;k<12;k++){const t=k/12,u=(k+1)/12,a=j*Math.PI*2/16;for(const sign of [-1,1])cylinder('paint',point(t,a+sign*t*.6),point(u,a+sign*u*.6),.037,.030,8);}
      for(let k=0;k<=9;k++)for(let j=0;j<24;j++)cylinder('paint',point(k/9,j*Math.PI*2/24),point(k/9,(j+1)*Math.PI*2/24),.036,.036,8);
      cylinder('paint',[s.x-rake*.74,y+cageHeight,s.y],[s.x-rake,top,s.y],r*.65,r*.23,20);cylinder('paint',[s.x-rake*.74,y+cageHeight,s.y],[s.x-rake*.74,y+cageHeight+.25,s.y],radius*.72,radius*.72,32);rail(Array.from({length:13},(_,j)=>[s.x-rake*.74+Math.cos(j/12*Math.PI*2)*radius*.69,y+cageHeight+.27,s.y+Math.sin(j/12*Math.PI*2)*radius*.69]),[.45,.9]);
    }else{cylinder('paint',[s.x,y,s.y],[s.x-rake,top,s.y],r,r*.23,24);if(s.style==='tripod')for(const side of [-1,1]){const span=s.baseRadius||Math.min(B*.17,3.5),foot=[s.x-span,y,s.y+side*span];cylinder('paint',foot,[s.x-rake*.74,y+s.h*.74,s.y],r*.78,r*.45,20);}}
    for(const h of [.67,.84]){const py=y+s.h*h,x=s.x-rake*h,w=Math.min(B*.30,s.h*.22);cylinder('paint',[x,py,s.y-w],[x,py,s.y+w],.045,.032,16);for(const z of [-w,w])cylinder('steel',[x,py,s.y+z],[s.x,y+1,s.y],.011,.011,8);}
    for(const side of [-1,1])cylinder('steel',[s.x-rake,top-.25,s.y],[s.x-Math.min(L*.07,9),deck(s.x-Math.min(L*.07,9)),side*Math.min(B*.27,3.1)],.015,.015,8);ladder([s.x-.19,y,s.y],[s.x-rake-.14,top-.8,s.y],.32);
    if(!submarine&&L>120&&s.h>16){const py=y+s.h*.50;cylinder('paint',[s.x-rake*.5,py,s.y],[s.x-rake*.5,py+.15,s.y],.7,.7,24);rail(Array.from({length:9},(_,j)=>[s.x-rake*.5+Math.cos(j/8*Math.PI*2)*.67,py+.17,s.y+Math.sin(j/8*Math.PI*2)*.67]),[.45,.9]);}
  });
  for(const s of stations.filter(p=>['director','searchlight','radar'].includes(p.role)))part('Source-fit '+s.role+' station',()=>{
    const y=s.z;cylinder('paint',[s.x,y,s.y],[s.x,y+.7,s.y],.32,.28,24);
    if(s.role==='radar'){const w=s.w||2.4,h=s.h||1.2;for(let i=0;i<=8;i++)cylinder('steel',[s.x,y+.7,s.y-w/2+i*w/8],[s.x,y+.7+h,s.y-w/2+i*w/8],.018,.018,6);for(let j=0;j<=5;j++)cylinder('steel',[s.x,y+.7+j*h/5,s.y-w/2],[s.x,y+.7+j*h/5,s.y+w/2],.018,.018,6);}
    else if(s.role==='searchlight'){cylinder('paint',[s.x-.35,y+1.05,s.y],[s.x+.35,y+1.05,s.y],.44,.44,28);cylinder('glass',[s.x+.355,y+1.05,s.y],[s.x+.37,y+1.05,s.y],.39,.39,28);ring('paint',[s.x+.385,y+1.05,s.y],.425,.035,'x',24);}
    else {elliptic('paint',s.x,s.y,Math.max(1.2,s.w),Math.max(1,s.d),y+.6,y+Math.max(1.4,s.h),.78);cylinder('paint',[s.x,y+1.3,s.y-(s.w||3)*.6],[s.x,y+1.3,s.y+(s.w||3)*.6],.14,.14,24);}
  });
  function boat(x,z,y,length,beam){
    const surface=(t,a,inside=false)=>[x+(t-.5)*length,y+(inside?.10:0)+.58*(1-Math.cos(a)),z+Math.sin(a)*beam*.5*Math.max(.01,Math.sin(Math.PI*t)**.64)*(inside?.83:1)];
    for(let i=0;i<24;i++)for(let j=0;j<12;j++){const t=i/24,u=(i+1)/24,a=-Math.PI/2+j*Math.PI/12,b=-Math.PI/2+(j+1)*Math.PI/12;quad('paint',surface(t,a),surface(u,a),surface(u,b),surface(t,b));quad('canvas',surface(t,b,true),surface(u,b,true),surface(u,a,true),surface(t,a,true));}
    for(const side of [-1,1])for(let i=0;i<24;i++)cylinder('canvas',surface(i/24,side*Math.PI/2),surface((i+1)/24,side*Math.PI/2),.035,.035,8);
    for(const t of [.2,.34,.48,.62,.76])house('deck',x+(t-.5)*length,z,.16,beam*Math.sin(Math.PI*t)*.78,y+.48,y+.55,.025);
    for(const dx of [-length*.28,length*.28]){house('paint',x+dx,z,.25,beam*.7,y-.25,y+.06,.06);const side=Math.sign(z)||1,bz=z-side*beam*.6,base=deck(x+dx);cylinder('paint',[x+dx,base,bz],[x+dx,y+1.7,bz],.058,.053,16);cylinder('paint',[x+dx,y+1.7,bz],[x+dx,y+2,z+side*.24],.053,.049,16);cylinder('steel',[x+dx,y+2,z+side*.24],[x+dx,y+.6,z],.012,.012,8);}
  }
  const boatStations=stations.filter(p=>p.role==='boat');
  if(!submarine&&!carrier&&spec.type!=='TB'&&!boatStations.length){
    const funnel=stations.filter(s=>s.role==='funnel').at(-1),cx=funnel?funnel.x-Math.max(funnel.w,4)-4:-L*.18;
    for(const side of [-1,1])boatStations.push({x:cx,y:side*Math.min(width(cx)*.67,B*.31),z:deck(cx)+.4,w:clamp(L*.055,4.1,8.2),d:clamp(B*.11,1.25,1.85)});
  }
  for(const [i,s]of boatStations.entries())part('Open boat '+(i+1)+' with thwarts and working davit geometry',()=>boat(s.x,s.y,Math.max(deck(s.x)+.3,s.z),s.w,s.d));
  part('Mooring and deck fittings: windlass, anchors, fairleads, bitts, ventilation and hatches',()=>{
    if(submarine){for(const x of [-L*.25,L*.22]){hatch(x,0,deck(x)+.07,1.1,.72);for(const side of [-1,1])for(let i=0;i<16;i++)house('boot',x-3+i*.38,side*width(x)*.85,.20,.02,deck(x)-.25,deck(x)-.08,.01);}}
    else{
      const x=L*.37,y=deck(x)+.10,w=Math.min(1.6,width(x)*.45);house('paint',x,0,1.75,w*2,y,y+.29,.14);cylinder('steel',[x,y+.53,-w],[x,y+.53,w],.14,.14,20);
      for(const side of [-1,1]){cylinder('steel',[x,y+.53,side*w*.65],[x,y+.53,side*w],.31,.31,24);for(let k=0;k<14;k++)ring('steel',[x+1+k*.25,deck(x+1+k*.25)+.10,side*w*.68],.12,.024,k%2?'y':'z',12);const ax=L*.445,az=side*width(ax),ay=deck(ax)*.50;cylinder('steel',[ax,ay+.6,az],[ax+.55,ay-.3,az],.075,.075,16);for(const d of [-.25,.25])cylinder('steel',[ax+.55,ay-.3,az+d],[ax+.1,ay+.01,az+d],.11,.02,12);}
      for(const bx of [-L*.44,L*.40])for(const side of [-1,1]){const bz=side*width(bx)*.66,by=deck(bx)+.1;house('paint',bx,bz,1.1,.48,by,by+.12,.1);for(const dx of [-.32,.32]){cylinder('steel',[bx+dx,by+.12,bz],[bx+dx,by+.60,bz],.10,.10,16);cylinder('steel',[bx+dx,by+.6,bz],[bx+dx,by+.64,bz],.135,.135,16);}}
      const clear=x=>!stations.some(s=>['main','bridge','bridge-base','funnel','flight-deck','cargo-tank','torpedo-tube','conning-tower'].includes(s.role)&&Math.abs(s.x-x)<s.w/2+1.2);
      for(let x=-L*.35;x<L*.35;x+=Math.max(8,L/14))if(clear(x)){hatch(x,0,deck(x)+.06);for(const side of [-1,1])cowl(x,side*width(x)*.60,deck(x),clamp(B*.11,.8,2.0),clamp(B*.013,.16,.31));}
    }
  });
  part('Deck edge stanchions, lifelines and hull portholes',()=>{
    if(!carrier)for(const side of [-1,1]){const points=[];for(let i=0;i<=Math.ceil(L/2.2);i++){const x=-L*.46+i*(L*.92)/Math.ceil(L/2.2);points.push([x,deck(x)+.03,side*Math.max(.08,width(x)-.13)]);}rail(points,submarine?[.42,.78]:[.46,.96]);}
    if(!submarine)for(const side of [-1,1])for(let x=-L*.35;x<L*.36;x+=2.6)port(x,deck(x)-.65,side*(width(x)+.01),.10);
  });
  if(submarine)part('Streamlined conning fairwater, periscopes, casing vents and diving planes',()=>{
    const s=stations.find(p=>p.role==='conning-tower'),x=s?.x||0,z=s?.y||0,y=Math.max(s?.z||deck0,deck(x)),w=s?.w||L*.12,d=s?.d||B*.48,h=s?.h||B*.5;
    elliptic('paint',x,z,w,d,y,y+h,.80);elliptic('deck',x,z,w*.83,d*.83,y+h,y+h+.10);rail(Array.from({length:21},(_,i)=>[x+Math.cos(i/20*Math.PI*2)*w*.38,y+h+.12,z+Math.sin(i/20*Math.PI*2)*d*.38]),[.45,.86]);
    for(const scope of stations.filter(p=>p.role==='periscope')){const py=Math.max(scope.z,y+h),height=scope.h;cylinder('steel',[scope.x,py,scope.y],[scope.x,py+height,scope.y],.064,.064,20);cylinder('paint',[scope.x,py+height,scope.y],[scope.x+.18,py+height,scope.y],.08,.08,16);}
    ladder([x-w*.40,y+.1,z],[x-w*.40,y+h,z],.4);hatch(x+w*.1,z,y+h+.13,.72,.65);
    for(const side of [-1,1])for(const x of [-L*.39,L*.31]){const y=-D*.42,span=B*.43;prism('paint',[[x-1.3,side*width(x)*.7],[x+1.0,side*width(x)*.7],[x+.7,side*(width(x)*.7+span)],[x-.8,side*(width(x)*.7+span)]],y,y+.12,.97);}
  });
  if(carrier){
    for(const s of stations.filter(p=>p.role==='hangar'))part('Enclosed hangar sides with doors, galleries and structural frames',()=>{
      if(!spec.openHangar)house('paint',s.x,s.y,s.w,s.d,s.z,s.z+s.h,Math.min(2,s.d*.13));for(const side of [-1,1]){if(!spec.openHangar)for(let x=s.x-s.w*.43;x<s.x+s.w*.44;x+=5.2){house('boot',x,s.y+side*(s.d/2+.005),3.9,.022,s.z+.4,s.z+s.h-.5,.1);for(let h=.7;h<s.h-.4;h+=.38)cylinder('paint',[x-1.9,s.z+h,s.y+side*(s.d/2+.03)],[x+1.9,s.z+h,s.y+side*(s.d/2+.03)],.035,.035,8);}for(let x=s.x-s.w*.47;x<s.x+s.w*.48;x+=4.4){cylinder('paint',[x,s.z,s.y+side*s.d*.51],[x,s.z+s.h,s.y+side*s.d*.51],.16,.16,16);if(spec.openHangar&&x+4.4<s.x+s.w*.48){cylinder('paint',[x,s.z,s.y+side*s.d*.51],[x+4.4,s.z+s.h,s.y+side*s.d*.51],.09,.09,12);cylinder('paint',[x,s.z+s.h,s.y+side*s.d*.51],[x+4.4,s.z,s.y+side*s.d*.51],.09,.09,12);}}}
    });
    for(const s of stations.filter(p=>['flight-deck','middle-flight-deck','lower-flight-deck'].includes(p.role)))part('Continuous '+s.role+' with beams, planking, safety net, landing markings and arresting wires',()=>{
      const y=s.z,outline=[[-.5,-.35],[-.48,-.5],[.45,-.5],[.5,-.38],[.5,.38],[.45,.5],[-.48,.5],[-.5,.35]].map(([x,z])=>[s.x+x*s.w,s.y+z*s.d]);prism('deck',outline,y,y+.28);for(const side of [-1,1]){
        for(let x=s.x-s.w*.47;x<s.x+s.w*.48;x+=2.8){cylinder('paint',[x,y-.1,s.y+side*(s.d*.47)],[x,y-1.1,s.y+side*s.d*.34],.09,.09,12);cylinder('paint',[x,y-.1,s.y+side*s.d*.47],[x,y-.15,s.y+side*(s.d*.50+.40)],.045,.045,8);}
        for(const out of [.0,.3,.6])cylinder('steel',[s.x-s.w*.46,y-.15,s.y+side*(s.d*.5+out)],[s.x+s.w*.46,y-.15,s.y+side*(s.d*.5+out)],.015,.015,8);
      }
      if(s.role==='flight-deck'){for(let x=s.x-s.w*.43;x<s.x+s.w*.4;x+=8)house('white',x,s.y,4,.22,y+.29,y+.31,.02);for(let i=0;i<8;i++){const x=s.x-s.w*.39+i*2.5;cylinder('steel',[x,y+.33,s.y-s.d*.38],[x,y+.33,s.y+s.d*.38],.022,.022,8);}}
      // Geometric plank seams are shallow grooves, with no coplanar sheets.
      for(let z=s.y-s.d*.46;z<s.y+s.d*.47;z+=.42)cylinder('deck',[s.x-s.w*.45,y+.287,z],[s.x+s.w*.45,y+.287,z],.011,.011,6);
    });
    for(const s of stations.filter(p=>p.role==='lift'))part('Recessed flight-deck elevator outline and hinges',()=>{
      const y=s.z+.035;house('paint',s.x,s.y,s.w,s.d,y,y+.04,.3);for(const side of [-1,1]){cylinder('steel',[s.x-s.w/2,y+.05,s.y+side*s.d/2],[s.x+s.w/2,y+.05,s.y+side*s.d/2],.027,.027,10);for(let i=-2;i<=2;i++)house('steel',s.x+i*s.w*.17,s.y+side*s.d*.49,.3,.12,y+.055,y+.095,.02);}
    });
    for(const s of stations.filter(p=>/exhaust/.test(p.role)))part('Carrier '+s.role+' uptake with curved outlet',()=>{
      const side=Math.sign(s.y)||1,y=Math.max(s.z,deck(s.x)),r=Math.min(s.w,s.h,s.d)*.34,direction=s.exhaustDirection||(s.role==='downturned-exhaust'?'down':s.role==='upturned-exhaust'?'up':'side');
      if(direction==='up'){elliptic('paint',s.x,s.y,s.w,s.d,y,y+s.h,.95);elliptic('boot',s.x,s.y,s.w*.82,s.d*.82,y+s.h-.015,y+s.h+.015);}
      else if(direction==='aft'){const a=[s.x+s.w*.35,y+s.h*.5,s.y],b=[s.x-s.w*.5,y+s.h*.5,s.y];cylinder('paint',a,b,r,r,32);cylinder('boot',b,add(b,[-.025,0,0]),r*.87,r*.87,32);}
      else if(direction==='down'){const center=[s.x,y+s.h*.7,s.y],p=t=>[center[0],center[1]-Math.sin(t)*s.h*.5,center[2]+side*(1-Math.cos(t))*s.d*.65];for(let i=0;i<12;i++)cylinder('paint',p(i/12*Math.PI/2),p((i+1)/12*Math.PI/2),r,r,24);const b=p(Math.PI/2);cylinder('boot',b,add(b,[0,-.025,0]),r*.87,r*.87,24);}
      else {const end=s.y+side*s.d*.65;elliptic('paint',s.x,s.y,s.w,s.d,y,y+s.h,.95);const cy=y+s.h*.65;cylinder('paint',[s.x,cy,s.y],[s.x,cy,end],r,r,32);cylinder('boot',[s.x,cy,end],[s.x,cy,end+side*.025],r*.87,r*.87,32);}
    });
  }
  if(auxiliary)part('Oiler cargo deck: tank trunks, valve wheels, fore-and-aft pipelines and derricks',()=>{
    // Liquid cargo is carried below deck. Access domes and pipe manifolds replace
    // the dry-cargo hold/hatch silhouette; no exposed fictional storage cylinders.
    for(const s of stations.filter(p=>p.role==='cargo-tank')){const y=deck(s.x);for(const dx of [-s.w*.28,0,s.w*.28]){cylinder('paint',[s.x+dx,y+.04,0],[s.x+dx,y+.64,0],.72,.66,32);cylinder('paint',[s.x+dx,y+.64,0],[s.x+dx,y+.79,0],.66,.42,32);ring('steel',[s.x+dx,y+.82,0],.31,.025,'y',16);for(const side of [-1,1]){cylinder('paint',[s.x+dx,y+.40,0],[s.x+dx,y+.40,side*s.d*.44],.12,.12,20);cylinder('paint',[s.x+dx,y+.4,side*s.d*.44],[s.x+dx,y+1.15,side*s.d*.44],.12,.12,20);ring('red',[s.x+dx,y+1.17,side*s.d*.44],.25,.035,'y',20);}}}
    for(const side of [-1,1]){cylinder('paint',[-L*.24,deck0+.68,side*.7],[L*.31,deck0+.68,side*.7],.13,.13,24);for(let x=-L*.23;x<L*.3;x+=4){house('paint',x,side*.7,.20,.50,deck(x),deck0+.67,.02);ring('red',[x,deck0+1.13,side*.7],.21,.026,'y',16);cylinder('steel',[x,deck0+.7,side*.7],[x,deck0+1.13,side*.7],.024,.024,12);}}
    for(const s of stations.filter(p=>p.role==='cargo-boom')){const mast=stations.filter(p=>p.role==='mast').reduce((a,b)=>Math.abs(a.x-s.x)<Math.abs(b.x-s.x)?a:b),start=[mast.x,Math.max(deck(mast.x),mast.z)+2,0],end=[s.x+s.w*.40,s.z,0];cylinder('paint',start,end,.14,.065,24);cylinder('steel',[mast.x,mast.z+mast.h,0],end,.019,.019,8);cylinder('steel',end,[end[0],deck(end[0])+1,0],.017,.017,8);ring('steel',[end[0],deck(end[0])+.8,0],.15,.025,'z',16);}
    const walkY=deck0+1.9;house('paint',L*.035,0,L*.54,1.3,walkY,walkY+.13,.1);for(const side of[-1,1])rail([[-L*.235,walkY+.14,side*.60],[L*.305,walkY+.14,side*.60]],[.5,1.0]);for(let x=-L*.23;x<L*.31;x+=4.3)for(const side of[-1,1])cylinder('paint',[x,deck(x),side*.49],[x,walkY,side*.49],.08,.08,12);
    for(const x of[-L*.10,L*.15])for(const side of[-1,1]){const z=side*B*.32,y=deck(x)+.18;house('paint',x,z,3.8,1.5,y,y+.18,.18);for(const dx of[-1.35,1.35]){house('paint',x+dx,z,.18,1.2,y+.18,y+1.55,.04);cylinder('steel',[x+dx-.12,y+1.2,z],[x+dx+.12,y+1.2,z],.58,.58,32);}for(let i=0;i<9;i++)ring('boot',[x-1.05+i*.26,y+1.2,z],.46,.115,'x',24);cylinder('brass',[x+1.4,y+1.2,z],[x+1.9,y+1.2,z],.13,.13,20);}
  });
  for(const s of stations.filter(p=>['catapult','crane-boom'].includes(p.role)))part(s.role+' lattice frame and drive machinery',()=>{
    const y=Math.max(s.z,deck(s.x)),w=s.w,d=Math.max(.6,s.d),a=(s.bearing??0)*Math.PI/180,c=Math.cos(a),sn=Math.sin(a),rise=s.role==='crane-boom'?Math.max(1,s.h):.2,p=(u,v,z)=>[s.x+u*c-z*sn,y+v+(u/w+.5)*rise,s.y+u*sn+z*c];for(const side of[-1,1]){cylinder('paint',p(-w/2,0,side*d/2),p(w/2,0,side*d/2),.055,.055,12);cylinder('paint',p(-w/2,.8,side*d/2),p(w/2,.8,side*d/2),.05,.05,12);for(let j=0;j<Math.ceil(w/1.3);j++){const x=-w/2+j*w/Math.ceil(w/1.3),n=x+w/Math.ceil(w/1.3);cylinder('paint',p(x,.1,side*d/2),p(n,.8,side*d/2),.025,.025,8);cylinder('paint',p(x,.8,side*d/2),p(n,.1,side*d/2),.025,.025,8);}}cylinder('paint',[s.x,deck(s.x),s.y],[s.x,y+rise*.5,s.y],.55,.5,24);if(s.role==='crane-boom'){const end=p(w/2,.6,0);cylinder('steel',end,[end[0],deck(end[0])+1.5,end[2]],.022,.022,10);ring('steel',[end[0],deck(end[0])+1.25,end[2]],.24,.035,'z',20);}
  });
  part('Propeller shafts, closed pitched blades, stern rudder and bilge keels',()=>{
    const shafts=spec.shafts,propRadius=clamp(D*.27,.50,1.8),py=-D*.66,px=-L*.435;
    for(let n=0;n<shafts;n++){const z=(n-(shafts-1)/2)*B/(shafts+1)*.62;cylinder('steel',[-L*.30,py,z],[px,py,z],Math.max(.07,D*.021),Math.max(.06,D*.02),20);cylinder('paint',[-L*.39,-D*.27,z*1.1],[px+.35,py,z],.09,.07,16);cylinder('brass',[px+.30,py,z],[px-.38,py,z],propRadius*.20,.035,24);
      for(let k=0;k<3;k++){const a=k*Math.PI*2/3,point=(r,t,w)=>[px+w,py+Math.cos(t)*r,z+Math.sin(t)*r],outline=[[.15,a,0],[.7,a+.12,.16],[1,a+.43,.06],[.88,a+.73,-.1],[.35,a+.65,-.11]].map(([r,t,w])=>[r*propRadius,t,w*propRadius]),front=outline.map(([r,t,w])=>point(r,t,w+.025)),back=outline.map(([r,t,w])=>point(r,t,w-.025));const cf=front.reduce((s,p)=>add(s,mul(p,1/front.length)),[0,0,0]),cb=back.reduce((s,p)=>add(s,mul(p,1/back.length)),[0,0,0]);for(let j=0;j<front.length;j++){const next=(j+1)%front.length;tri('brass',cf,front[j],front[next]);tri('brass',cb,back[next],back[j]);quad('brass',front[next],front[j],back[j],back[next]);}}
    }
    prism('paint',[[-L*.475,-.065],[-L*.448,-.16],[-L*.44,0],[-L*.448,.16],[-L*.475,.065]],-D*.92,-D*.25,.94);
    if(!submarine)for(const side of [-1,1])for(let x=-L*.28;x<L*.22;x+=1.1){const n=Math.min(L*.22,x+1.1),z=side*B*.39;quad('paint',[x,-D*.55,z],[n,-D*.55,z],[n,-D*.61,z+side*.22],[x,-D*.61,z+side*.22]);}
  });
  const bytes=M.makeGlb();let statistics;
  try{statistics=validateDetailedShip(bytes,{id:spec.id,metadata:spec});}catch(error){
    for(const [material,g]of groups)for(let i=0;i<g.indices.length;i+=3){const ix=g.indices.slice(i,i+3),p=ix.map(k=>g.positions.slice(k*3,k*3+3).map(Math.fround)),n=ix.map(k=>g.normals.slice(k*3,k*3+3).map(Math.fround)),face=cross(sub(p[1],p[0]),sub(p[2],p[0])),norm=add(add(n[0],n[1]),n[2]);if(face.reduce((s,v,k)=>s+v*norm[k],0)<-1e-6){const component=parts.find(p=>p.ranges.some(r=>r.material===material&&i>=r.indexStart&&i<r.indexStart+r.indexCount));throw Error(spec.id+' '+component?.name+' '+material+' triangle '+i+': '+JSON.stringify({p,n})+'; '+error.message);}}
    throw Error(spec.id+': '+error.message);
  }
  assert(statistics.embeddedTextures===3);assert(statistics.bounds.min[1]<-.25&&statistics.bounds.max[1]>2);assert(statistics.triangles>=10000,'Detailed exterior must contain actual fitted geometry');
  const metadata={...spec,authoringFile:'assets/models/authoring/fleet-specifications.json',exporter:'assets/models/authoring/build-detailed-fleet.mjs',sha256:crypto.createHash('sha256').update(bytes).digest('hex'),statistics,parts,equipment,modelledMainBarrels:mainTotal,modelledExternalTorpedoTubes:tubeStations.length};
  if(!process.argv.includes('--write'))throw Error('Use --write to export the separately stored GLBs.');
  const target=path.join(root,'assets/models/ships',spec.output);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bytes);await fs.writeFile(target.replace(/\.glb$/,'.source.json'),JSON.stringify(metadata,null,2)+'\n');
  summary.push({id:spec.id,...statistics});console.log(JSON.stringify({id:spec.id,triangles:statistics.triangles,vertices:statistics.vertices,bytes:statistics.bytes}));
}
await fs.mkdir(path.join(root,'test-output'),{recursive:true});await fs.writeFile(path.join(root,'test-output/detailed-fleet-authoring.json'),JSON.stringify({createdAt:new Date().toISOString(),models:summary},null,2)+'\n');
