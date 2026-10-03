// Original representative carrier aircraft, authored in metres, X forward/Y up/Z span.
// Run only when changing geometry; the game reads the stored GLBs directly.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const roles={fighter:{length:9.4,span:12,chord:2.8,canopy:1.8},'dive-bomber':{length:10.3,span:12.8,chord:3.3,canopy:3.5},'torpedo-bomber':{length:12.1,span:15.1,chord:3.5,canopy:4.4}};
function model(role,side){
  const spec=roles[role],L=spec.length, primitives=Array.from({length:7},()=>({p:[],n:[],i:[]}));
  function tri(mat,a,b,c){const p=primitives[mat],u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],m=Math.hypot(...n)||1,k=p.p.length/3;p.p.push(...a,...b,...c);p.n.push(...n.map(x=>x/m),...n.map(x=>x/m),...n.map(x=>x/m));p.i.push(k,k+1,k+2);}
  function quad(mat,a,b,c,d){tri(mat,a,b,c);tri(mat,a,c,d);}
  function loft(mat,sections,rings=32){for(let s=0;s<sections.length-1;s++)for(let j=0;j<rings;j++){
    const pt=(row,t)=>[row[0],row[1]+Math.cos(t)*row[2],Math.sin(t)*row[3]];
    const a=2*Math.PI*j/rings,b=2*Math.PI*(j+1)/rings;
    quad(mat,pt(sections[s],a),pt(sections[s+1],a),pt(sections[s+1],b),pt(sections[s],b));
  }}
  function ellipsoid(mat,center,size){const sections=[];for(let i=0;i<=10;i++){const t=-Math.PI/2+Math.PI*i/10;sections.push([center[0]+Math.sin(t)*size[0],center[1],Math.cos(t)*size[1],Math.cos(t)*size[2]]);}loft(mat,sections,16);}
  // Rounded tapered fuselage with radial engine cowling and tail cone.
  loft(0,[[-L*.5,.18,.02,.02],[-L*.42,.15,.22,.19],[-L*.3,.08,.36,.32],[-L*.12,0,.52,.46],[L*.08,0,.64,.56],[L*.28,-.02,.63,.59],[L*.39,-.02,.60,.57],[L*.44,-.02,.54,.51]]);
  loft(2,[[L*.43,-.02,.55,.52],[L*.45,-.02,.55,.52],[L*.46,-.02,.46,.43]]);
  ellipsoid(2,[L*.465,-.02,0],[.12,.43,.43]);
  for(let j=0;j<9;j++){const t=j*Math.PI*2/9;ellipsoid(2,[L*.455,Math.cos(t)*.29-.02,Math.sin(t)*.29],[.09,.12,.12]);}
  ellipsoid(2,[L*.49,-.02,0],[.25,.18,.18]);
  // Cambered closed airfoil wings; 24 chord samples, gently swept/tapered tips.
  function wing(span,chord,x,y,mat=0){for(const sign of [-1,1]){
    const sections=Array.from({length:11},(_,i)=>{const f=i/10;return {z:sign*(.2+f*(span/2-.2)),c:chord*(1-.6*f),x:x-.45*f,y:y+.15*f};});
    const pt=(s,j,upper)=>{const t=j/24,thick=5*.115*(.2969*Math.sqrt(t)-.126*t-.3516*t*t+.2843*t*t*t-.1036*t*t*t*t);return[s.x+s.c*(.25-t),s.y+s.c*(.018*Math.sin(Math.PI*t)+(upper?1:-1)*thick),s.z];};
    for(let k=0;k<sections.length-1;k++)for(let j=0;j<24;j++)for(const upper of [true,false]){let verts=[pt(sections[k],j,upper),pt(sections[k+1],j,upper),pt(sections[k+1],j+1,upper),pt(sections[k],j+1,upper)];if((sign>0)===upper)verts.reverse();quad(upper?mat:1,...verts);}
    for(let j=0;j<24;j++)quad(mat,pt(sections.at(-1),j,true),pt(sections.at(-1),j+1,true),pt(sections.at(-1),j+1,false),pt(sections.at(-1),j,false));
    // Control-surface seams, wing gun muzzle and national disk in the upper paint.
    const z=sign*span*.31, sx=x-chord*.08;for(let j=0;j<32;j++){const a=j*Math.PI*2/32,b=(j+1)*Math.PI*2/32,r=span*.036;tri(side==='B'?4:5,[sx,y+.23,z],[sx+Math.cos(a)*r,y+.23,z+Math.sin(a)*r],[sx+Math.cos(b)*r,y+.23,z+Math.sin(b)*r]);}
    if(role==='fighter')ellipsoid(2,[x+.4,y,.9*sign],[.36,.06,.06]);
  }}
  wing(spec.span,spec.chord,L*.045,-.25);wing(spec.span*.35,1.3,-L*.38,.2);
  // Vertical stabilizer, smoothly rounded outline with finite thickness.
  const fin=[[-L*.43,.18],[-L*.39,1.63],[-L*.30,1.50],[-L*.25,.18]];
  for(const sign of[-1,1]){const p=fin.map(([x,y])=>[x,y,.09*sign]);if(sign<0)p.reverse();quad(0,...p);}for(let i=0;i<4;i++){const a=fin[i],b=fin[(i+1)%4];quad(0,[...a,-.09],[...b,-.09],[...b,.09],[...a,.09]);}
  // Raised glazed canopy with framing bands (crew length varies by role).
  const cx=L*.03,cl=spec.canopy;
  ellipsoid(3,[cx,.59,0],[cl/2,.42,.37]);
  for(let i=0;i<=4;i++){const x=cx-cl*.42+i*cl*.21;loft(2,[[x-.025,.58,.39,.37],[x+.025,.58,.39,.37]],24);}
  for(const sign of[-1,1])ellipsoid(2,[cx,.67,sign*.32],[cl*.47,.035,.035]);
  // Three distinct propeller blades, yellow tips; no transparent rotor disk.
  for(let j=0;j<3;j++){const a=j*Math.PI*2/3;
    const rotate=(p)=>[p[0],p[1]*Math.cos(a)-p[2]*Math.sin(a)-.02,p[1]*Math.sin(a)+p[2]*Math.cos(a)];
    const blade=[[L*.50,.15,-.10],[L*.495,1.44,-.14],[L*.515,1.55,.03],[L*.52,.26,.13]].map(rotate);quad(6,...blade);quad(6,...[...blade].reverse());
    const tip=[[L*.498,1.29,-.13],[L*.495,1.44,-.14],[L*.515,1.55,.03],[L*.518,1.30,.06]].map(rotate);quad(4,...tip);quad(4,...[...tip].reverse());}
  // Retracted gear fairings, exhausts, antenna, and role-specific underside stores.
  for(const sign of[-1,1]){ellipsoid(0,[L*.05,-.37,sign*.85],[.7,.15,.19]);for(let j=0;j<4;j++)ellipsoid(2,[L*.30-j*.13,-.18,sign*.56],[.10,.08,.07]);}
  ellipsoid(2,[-L*.07,.98,0],[.04,.3,.04]);
  if(role==='torpedo-bomber')ellipsoid(2,[-.35,-.76,0],[2.4,.20,.20]);
  if(role==='dive-bomber'){ellipsoid(2,[-.15,-.66,0],[.88,.22,.22]);for(const sign of[-1,1])ellipsoid(2,[.0,-.49,sign*1.8],[.46,.12,.12]);}
  const upper=side==='A'?[.18,.30,.40,1]:[.15,.26,.20,1];
  const materials=[upper,[.58,.62,.59,1],[.19,.20,.20,1],[.07,.16,.23,1],side==='A'?[.93,.70,.07,1]:[.70,.07,.06,1],[.85,.88,.86,1],[.035,.035,.035,1]].map((baseColorFactor,i)=>({name:['upper paint','underside','engine metal','canopy','marking','light paint','propeller'][i],pbrMetallicRoughness:{baseColorFactor,metallicFactor:i===2?.65:i===3?.2:0,roughnessFactor:i===3?.18:.68},doubleSided:true}));
  const bin=[],views=[],accessors=[],meshes=[];let offset=0;
  function buffer(values,componentType,type){const bytes=componentType===5126?new Float32Array(values):new Uint32Array(values),b=Buffer.from(bytes.buffer);bin.push(b);views.push({buffer:0,byteOffset:offset,byteLength:b.length});offset+=b.length;const a={bufferView:views.length-1,componentType,count:values.length/(type==='VEC3'?3:1),type};if(type==='VEC3'){a.min=[0,1,2].map(i=>Math.min(...values.filter((_,j)=>j%3===i)));a.max=[0,1,2].map(i=>Math.max(...values.filter((_,j)=>j%3===i)));}accessors.push(a);return accessors.length-1;}
  for(let m=0;m<primitives.length;m++){const p=primitives[m];if(p.i.length)meshes.push({attributes:{POSITION:buffer(p.p,5126,'VEC3'),NORMAL:buffer(p.n,5126,'VEC3')},indices:buffer(p.i,5125,'SCALAR'),material:m});}
  const json={asset:{version:'2.0',generator:'WNT1922 original representative carrier aircraft'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0,name:`${side} ${role}`}],meshes:[{primitives:meshes}],materials,buffers:[{byteLength:offset}],bufferViews:views,accessors};
  const text=Buffer.from(JSON.stringify(json)),padding=(4-text.length%4)%4,j=Buffer.concat([text,Buffer.alloc(padding,32)]),b=Buffer.concat(bin),header=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+j.length+b.length,8);jh.writeUInt32LE(j.length);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(b.length);bh.writeUInt32LE(0x004e4942,4);return Buffer.concat([header,jh,j,bh,b]);
}
for(const role of Object.keys(roles))for(const side of['A','B']){const filename=`${side.toLowerCase()}-${role}.glb`;fs.writeFileSync(path.join(root,filename),model(role,side));console.log(filename);}
