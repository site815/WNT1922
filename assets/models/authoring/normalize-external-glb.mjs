// Offline import utility. Bakes an artist's scene graph without simplifying it.
import assert from 'node:assert/strict';
const dims={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
const identity=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const mul=(a,b)=>Array.from({length:16},(_,i)=>{const r=i%4,c=Math.floor(i/4);let n=0;for(let k=0;k<4;k++)n+=a[k*4+r]*b[c*4+k];return n;});
const point=(m,p)=>[0,1,2].map(r=>m[r]*p[0]+m[4+r]*p[1]+m[8+r]*p[2]+m[12+r]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const unit=a=>{const d=Math.hypot(...a);assert(d>1e-12,'Zero normal');return a.map(v=>v/d);};
function localMatrix(n){if(n.matrix)return n.matrix;const [x,y,z,w]=n.rotation||[0,0,0,1],[sx,sy,sz]=n.scale||[1,1,1],[tx,ty,tz]=n.translation||[0,0,0];return [(1-2*(y*y+z*z))*sx,2*(x*y+z*w)*sx,2*(x*z-y*w)*sx,0,2*(x*y-z*w)*sy,(1-2*(x*x+z*z))*sy,2*(y*z+x*w)*sy,0,2*(x*z+y*w)*sz,2*(y*z-x*w)*sz,(1-2*(x*x+y*y))*sz,0,tx,ty,tz,1];}
function normalMatrix(m){const a=m.slice(0,3),b=m.slice(4,7),c=m.slice(8,11),bc=cross(b,c),ca=cross(c,a),ab=cross(a,b),d=dot(a,bc);assert(Math.abs(d)>1e-12,'Singular node transform');return p=>unit([0,1,2].map(k=>(bc[k]*p[0]+ca[k]*p[1]+ab[k]*p[2])/d));}
export function readGlb(buffer){assert(buffer.readUInt32LE(0)===0x46546c67&&buffer.readUInt32LE(4)===2&&buffer.readUInt32LE(8)===buffer.length);const len=buffer.readUInt32LE(12),json=JSON.parse(buffer.subarray(20,20+len));const binary=buffer.subarray(28+len);return {json,binary};}
export function bakeScene(buffer){
 const {json,binary}=readGlb(buffer);assert(!json.skins?.length&&!json.animations?.length,'Static unrigged source required');
 const size={5121:1,5123:2,5125:4,5126:4};
 const read=i=>{const a=json.accessors[i],v=json.bufferViews[a.bufferView],n=dims[a.type],s=size[a.componentType],stride=v.byteStride||n*s;assert(!a.sparse&&n&&s&&v.buffer===0);const off=(v.byteOffset||0)+(a.byteOffset||0),method={5121:'readUInt8',5123:'readUInt16LE',5125:'readUInt32LE',5126:'readFloatLE'}[a.componentType];return Array.from({length:a.count},(_,r)=>Array.from({length:n},(_,c)=>binary[method](off+r*stride+c*s)));};
 const primitives=[];function visit(i,parent){const node=json.nodes[i],m=mul(parent,localMatrix(node)),norm=normalMatrix(m);if(node.mesh!==undefined)for(const p of json.meshes[node.mesh].primitives){assert((p.mode??4)===4&&p.indices!==undefined);const a=p.attributes,positions=read(a.POSITION).map(v=>point(m,v)),normals=read(a.NORMAL).map(norm),uv=a.TEXCOORD_0!==undefined?read(a.TEXCOORD_0):positions.map(v=>[v[0],v[1]]),tangent=a.TANGENT!==undefined?read(a.TANGENT).map(v=>[...unit([0,1,2].map(r=>m[r]*v[0]+m[4+r]*v[1]+m[8+r]*v[2])),v[3]]):null;if(a.TEXCOORD_0===undefined)assert(!JSON.stringify(json.materials[p.material]).includes('Texture'),'Textured source has no UVs');primitives.push({name:node.name,material:p.material,positions,normals,uv,tangent,indices:read(p.indices).flat()});}for(const child of node.children||[])visit(child,m);}
 for(const n of json.scenes[json.scene||0].nodes)visit(n,identity());return {json,binary,primitives};
}
export function normalizeExternalGlb(buffer,spec){
 const {json,binary,primitives}=bakeScene(buffer),all=primitives.flatMap(p=>p.positions),mins=[0,1,2].map(k=>Math.min(...all.map(p=>p[k]).slice(0,50000))),maxs=[...mins];for(const p of all)for(let k=0;k<3;k++){mins[k]=Math.min(mins[k],p[k]);maxs[k]=Math.max(maxs[k],p[k]);}
 // The source axis/scale is checked for each class in its import specification.
 const hull=primitives.filter(p=>spec.hullNames.includes(p.name));assert(hull.length,'No designated source hull');const hullMin=[Infinity,Infinity,Infinity],hullMax=[-Infinity,-Infinity,-Infinity];for(const p of hull.flatMap(h=>h.positions))for(let k=0;k<3;k++){hullMin[k]=Math.min(hullMin[k],p[k]);hullMax[k]=Math.max(hullMax[k],p[k]);}
 const scale=spec.length/(hullMax[0]-hullMin[0]),centerX=(hullMin[0]+hullMax[0])/2,centerZ=(hullMin[2]+hullMax[2])/2,waterline=spec.sourceWaterline??0;
 const rotation=spec.bowPositive?1:-1,groups=new Map(),parts=[];let degenerate=0,windingRepairs=0,nativeDegenerate=0,nativeUnstable=0;
 let maxUnstableAreaCm2=0,maxUnstableAltitudeMicrometres=0,maxUnstableAltitudeUlps=0;
 // Match the runtime's Float32 centimetre positions and FPackedRGBA16N normals.
 // Very thin source slivers can invert after this conversion even when their
 // original metre-space winding is correct. Never hide robust reversed faces.
 const packNormal=x=>Math.fround(Math.round(Math.fround(x*32767))*Math.fround(1/32767));
 for(const p of primitives){let g=groups.get(p.material);if(!g){g={positions:[],normals:[],uv:[],tangent:[],indices:[]};groups.set(p.material,g);}const base=g.positions.length/3,indexStart=g.indices.length;
  for(let i=0;i<p.positions.length;i++){const [x,y,z]=p.positions[i];g.positions.push(...[rotation*(x-centerX)*scale,(y-waterline)*scale,rotation*(z-centerZ)*scale].map(Math.fround));const n=p.normals[i];g.normals.push(...[rotation*n[0],n[1],rotation*n[2]].map(Math.fround));g.uv.push(...p.uv[i]);if(p.tangent){const t=p.tangent[i];g.tangent.push(rotation*t[0],t[1],rotation*t[2],t[3]);}}
  const pos=i=>g.positions.slice((base+i)*3,(base+i)*3+3),normal=i=>g.normals.slice((base+i)*3,(base+i)*3+3);
  for(let i=0;i<p.indices.length;i+=3){
   let [a,b,c]=p.indices.slice(i,i+3);const ab=sub(pos(b),pos(a)),ac=sub(pos(c),pos(a)),face=cross(ab,ac);
   if(Math.hypot(...face)<=1e-12){degenerate++;continue;}
   const n=normal(a).map((v,k)=>v+normal(b)[k]+normal(c)[k]);
   if(dot(face,n)<0){[b,c]=[c,b];windingRepairs++;}
   const vertices=[a,b,c].map(v=>pos(v).map(x=>Math.fround(x*100))),normals=[a,b,c].map(v=>normal(v).map(packNormal));
   const nativeFace=cross(sub(vertices[1],vertices[0]),sub(vertices[2],vertices[0])),twiceArea=Math.hypot(...nativeFace);
   if(twiceArea<1e-6){nativeDegenerate++;continue;}
   const nativeNormal=normals[0].map((v,k)=>v+normals[1][k]+normals[2][k]);
   if(dot(nativeFace,nativeNormal)<-1e-5){
    const maxEdge=Math.max(...[[0,1],[0,2],[1,2]].map(([u,v])=>Math.hypot(...sub(vertices[u],vertices[v])))),altitude=twiceArea/maxEdge;
    const maxCoordinate=Math.max(...vertices.flat().map(Math.abs)),ulp=2**(Math.floor(Math.log2(maxCoordinate))-23);
    assert(altitude<=8*ulp,'Robust face reversed after native conversion; requires geometry review');
    nativeUnstable++;maxUnstableAreaCm2=Math.max(maxUnstableAreaCm2,twiceArea/2);maxUnstableAltitudeMicrometres=Math.max(maxUnstableAltitudeMicrometres,altitude*10000);maxUnstableAltitudeUlps=Math.max(maxUnstableAltitudeUlps,altitude/ulp);continue;
   }
   g.indices.push(base+a,base+b,base+c);
  }
  parts.push({name:p.name,material:p.material,indexStart,indexCount:g.indices.length-indexStart});
 }
 const out={asset:{...json.asset,generator:'WNT1922 licensed scene normalization; source '+json.asset.generator},scene:0,scenes:[{nodes:[0]}],nodes:[{name:spec.name,mesh:0}],meshes:[{name:spec.name,primitives:[]}],materials:structuredClone(json.materials),textures:json.textures,samplers:json.samplers,images:[],buffers:[],bufferViews:[],accessors:[],extras:{...spec,units:'metres',axes:'right-handed: X bow-positive; Y up; Z transverse',parts,normalization:{sourceBounds:{min:mins,max:maxs},sourceHullBounds:{min:hullMin,max:hullMax},uniformScale:scale,sourceCenterX:centerX,sourceCenterZ:centerZ,sourceWaterline:waterline,yRotationDegrees:rotation===1?0:180,removedDegenerateTriangles:degenerate,windingRepairs,nativePrecision:{removedCollapsedTriangles:nativeDegenerate,removedOrientationUnstableSlivers:nativeUnstable,maxUnstableAreaCm2,maxUnstableAltitudeMicrometres,maxUnstableAltitudeUlps,normalFormat:'FPackedRGBA16N',positions:'Float32 centimetres',rule:'Drop only collapsed faces or winding-unstable slivers whose altitude is at most eight Float32 position ULPs; robust source winding is corrected, not discarded.'}}}};
 const chunks=[];let offset=0;function view(bytes,target){const padding=(4-offset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}const index=out.bufferViews.length;out.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length,...(target?{target}:{})});chunks.push(bytes);offset+=bytes.length;return index;}
 function attr(values,type,int=false){const n=dims[type],array=int?new Uint32Array(values):new Float32Array(values),index=out.accessors.length,a={bufferView:view(Buffer.from(array.buffer),int?34963:34962),componentType:int?5125:5126,count:values.length/n,type};if(type==='VEC3'&&!int){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<values.length;i++){const k=i%3;min[k]=Math.min(min[k],values[i]);max[k]=Math.max(max[k],values[i]);}a.min=min;a.max=max;}out.accessors.push(a);return index;}
 for(const [material,g]of groups){const attributes={POSITION:attr(g.positions,'VEC3'),NORMAL:attr(g.normals,'VEC3'),TEXCOORD_0:attr(g.uv,'VEC2')};if(g.tangent.length===g.positions.length/3*4)attributes.TANGENT=attr(g.tangent,'VEC4');out.meshes[0].primitives.push({attributes,indices:attr(g.indices,'SCALAR',true),material,mode:4});}
 for(const image of json.images||[]){assert(image.bufferView!==undefined&&!image.uri);const v=json.bufferViews[image.bufferView];out.images.push({...image,bufferView:view(binary.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength))});}
 out.buffers=[{byteLength:offset}];const text=Buffer.from(JSON.stringify(out)),textPad=Buffer.alloc(Math.ceil(text.length/4)*4,32);text.copy(textPad);const raw=Buffer.concat(chunks),rawPad=Buffer.alloc(Math.ceil(raw.length/4)*4);raw.copy(rawPad);const header=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+textPad.length+rawPad.length,8);jh.writeUInt32LE(textPad.length);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(rawPad.length);bh.writeUInt32LE(0x004e4942,4);return {buffer:Buffer.concat([header,jh,textPad,bh,rawPad]),normalization:out.extras.normalization};
}
