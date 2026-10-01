// Shared original mesh authoring helpers. Metres; X bow, Y up, Z beam; CCW fronts.
export function createAuthoredMesh(spec){
const groups=new Map(),parts=[],textures=new Map();
const textureMetres=spec.textureMetres||2.5;
function addTexture(name,bytes,mimeType='image/png'){if(!Buffer.isBuffer(bytes)||!['image/png','image/jpeg'].includes(mimeType))throw Error('Embedded texture must be PNG/JPEG bytes');textures.set(name,{bytes,mimeType});}
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>mul(a,1/(Math.hypot(...a)||1)),mix=(a,b,t)=>a+(b-a)*t;
function mesh(material){if(!groups.has(material))groups.set(material,{positions:[],normals:[],uvs:[],indices:[]});return groups.get(material);}
function tri(material,a,b,c,na,nb,nc,ua,ub,uc){
  const m=mesh(material),n=unit(cross(sub(b,a),sub(c,a)));if(Math.hypot(...cross(sub(b,a),sub(c,a)))<1e-10)return;
  const base=m.positions.length/3;m.positions.push(...a,...b,...c);m.normals.push(...(na||n),...(nb||n),...(nc||n));
  const axis=n.map(Math.abs).indexOf(Math.max(...n.map(Math.abs))),uv=p=>axis===1?[p[0]/textureMetres,p[2]/textureMetres]:axis===0?[p[2]/textureMetres,p[1]/textureMetres]:[p[0]/textureMetres,p[1]/textureMetres];
  m.uvs.push(...(ua||uv(a)),...(ub||uv(b)),...(uc||uv(c)));m.indices.push(base,base+1,base+2);
}
function quad(mat,a,b,c,d,normal){tri(mat,a,b,c,normal,normal,normal);tri(mat,a,c,d,normal,normal,normal);}
function part(name,fn){const before=new Map([...groups].map(([material,g])=>[material,g.indices.length]));fn();const ranges=[...groups].map(([material,g])=>({material,indexStart:before.get(material)||0,indexCount:g.indices.length-(before.get(material)||0)})).filter(r=>r.indexCount);parts.push({name,triangles:ranges.reduce((s,r)=>s+r.indexCount/3,0),ranges});}
function cylinder(mat,a,b,r1,r2=r1,n=20,caps=true){
  // Bound curved-fitting error in metres instead of spending dozens of sides on
  // subpixel rails and barrels. Hull stations and equipment placements are kept.
  if(spec.curveToleranceMetres){const radius=Math.max(r1,r2);n=Math.min(n,Math.max(6,Math.ceil(Math.PI/Math.acos(Math.max(-1,1-spec.curveToleranceMetres/radius)))));}
  const axis=unit(sub(b,a)),u=unit(cross(axis,Math.abs(axis[1])>.85?[1,0,0]:[0,1,0])),v=cross(axis,u),length=Math.hypot(...sub(b,a));
  for(let i=0;i<n;i++){
    const t=i/n*Math.PI*2,s=(i+1)/n*Math.PI*2,ra=add(mul(u,Math.cos(t)),mul(v,Math.sin(t))),rb=add(mul(u,Math.cos(s)),mul(v,Math.sin(s)));
    const p=add(a,mul(ra,r1)),q=add(a,mul(rb,r1)),r=add(b,mul(rb,r2)),z=add(b,mul(ra,r2));
    const na=unit(add(ra,mul(axis,(r1-r2)/length))),nb=unit(add(rb,mul(axis,(r1-r2)/length)));
    const u0=i/n*2*Math.PI*r1/textureMetres,u1=(i+1)/n*2*Math.PI*r1/textureMetres,v1=length/textureMetres;
    tri(mat,p,q,r,na,nb,nb,[u0,0],[u1,0],[u1,v1]);tri(mat,p,r,z,na,nb,na,[u0,0],[u1,v1],[u0,v1]);
    if(caps){tri(mat,a,q,p,mul(axis,-1),mul(axis,-1),mul(axis,-1));tri(mat,b,z,r,axis,axis,axis);}
  }
}
function ring(mat,center,major,minor,axis='y',segments=32){
  if(spec.curveToleranceMetres)segments=Math.min(segments,Math.max(8,Math.ceil(Math.PI/Math.acos(Math.max(-1,1-spec.curveToleranceMetres/(major+minor))))));
  const point=(t,p)=>{const r=major+minor*Math.cos(p),v=[Math.cos(t)*r,minor*Math.sin(p),Math.sin(t)*r];return add(center,axis==='z'?[v[0],v[2],v[1]]:axis==='x'?[v[1],v[0],v[2]]:v);};
  for(let i=0;i<segments;i++)for(let j=0;j<8;j++){const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2,c=j/8*Math.PI*2,d=(j+1)/8*Math.PI*2;axis==='y'?quad(mat,point(a,c),point(a,d),point(b,d),point(b,c)):quad(mat,point(a,c),point(b,c),point(b,d),point(a,d));}
}
function prism(mat,outline,bottom,top,topScale=1){
  const cx=outline.reduce((s,p)=>s+p[0],0)/outline.length,cz=outline.reduce((s,p)=>s+p[1],0)/outline.length;
  const lo=outline.map(([x,z])=>[x,bottom,z]),hi=outline.map(([x,z])=>[cx+(x-cx)*topScale,top,cz+(z-cz)*topScale]);
  for(let i=0;i<lo.length;i++){const j=(i+1)%lo.length;quad(mat,lo[i],hi[i],hi[j],lo[j]);tri(mat,[cx,top,cz],hi[j],hi[i]);tri(mat,[cx,bottom,cz],lo[i],lo[j]);}
}
function roundedOutline(x,z,length,width,bevel=.15){const a=length/2,b=width/2,r=Math.min(a,b,bevel);return [[-a,-b+r],[-a+r,-b],[a-r,-b],[a,-b+r],[a,b-r],[a-r,b],[-a+r,b],[-a,b-r]].map(([u,v])=>[u+x,v+z]);}
const house=(mat,x,z,length,width,bottom,top,bevel=.15,scale=1)=>prism(mat,roundedOutline(x,z,length,width,bevel),bottom,top,scale);
function rail(points,levels=[.48,.95],posts=true){
  if(posts)for(const p of points)cylinder('paint',p,add(p,[0,1.02,0]),.026,.023,8);
  for(let i=1;i<points.length;i++)for(const h of levels)cylinder('paint',add(points[i-1],[0,h,0]),add(points[i],[0,h,0]),.018,.018,8);
}
function ladder(a,b,width=.45){const side=[0,0,width/2],n=Math.ceil(Math.hypot(...sub(b,a))/.29);for(const sign of [-1,1])cylinder('paint',add(a,mul(side,sign)),add(b,mul(side,sign)),.023,.023,8);for(let i=0;i<=n;i++){const p=add(a,mul(sub(b,a),i/n));cylinder('steel',sub(p,side),add(p,side),.018,.018,8);}}
function makeGlb(){
  const json={asset:{version:'2.0',generator:'WNT1922 original detailed ship authoring',copyright:'Original WNT1922 geometry; independently licensed textures retain their terms; see LICENSE.md and companion source manifest'},scene:0,scenes:[{nodes:[0]}],nodes:[{name:spec.name,mesh:0}],meshes:[{name:spec.id,primitives:[]}],materials:[],accessors:[],bufferViews:[],buffers:[],extras:{id:spec.id,units:spec.units,axes:spec.axes,fit:spec.year,accuracy:spec.accuracy,geometrySource:spec.geometrySource,parts,sources:spec.sources,materialSources:spec.materialSources,surfaceProfile:spec.surfaceProfile,textureMetres}};
  const chunks=[];let offset=0;const textureIndexes=new Map();
  if(textures.size){json.images=[];json.textures=[];json.samplers=[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497}];}
  for(const [name,{bytes,mimeType}]of textures){const view=json.bufferViews.length;json.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length});chunks.push(bytes);offset+=bytes.length;const padding=(4-offset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}const index=json.images.length;json.images.push({name,bufferView:view,mimeType});json.textures.push({source:index,sampler:0});textureIndexes.set(name,index);}
  const append=(values,type,components)=>{const bytes=type===5126?Buffer.from(new Float32Array(values).buffer):Buffer.from(new Uint32Array(values).buffer),view=json.bufferViews.length;json.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length,target:components===1?34963:34962});chunks.push(bytes);offset+=bytes.length;const acc={bufferView:view,byteOffset:0,componentType:type,count:values.length/components,type:components===1?'SCALAR':'VEC'+components};if(components===3&&type===5126){acc.min=[Infinity,Infinity,Infinity];acc.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<values.length;i++){acc.min[i%3]=Math.min(acc.min[i%3],values[i]);acc.max[i%3]=Math.max(acc.max[i%3],values[i]);}}json.accessors.push(acc);return json.accessors.length-1;};
  for(const [name,source]of groups){
    // Lossless indexing of the exact Float32 values written to GLB. Normals and
    // UV seams remain distinct, and no triangle, surface or fitting is removed.
    let g=source;
    if(spec.indexVertices){
      g={positions:[],normals:[],uvs:[],indices:[]};const seen=new Map();
      for(const index of source.indices){
        const values=[...source.positions.slice(index*3,index*3+3),...source.normals.slice(index*3,index*3+3),...source.uvs.slice(index*2,index*2+2)].map(Math.fround),key=values.join(',');
        let next=seen.get(key);if(next===undefined){next=g.positions.length/3;seen.set(key,next);g.positions.push(...values.slice(0,3));g.normals.push(...values.slice(3,6));g.uvs.push(...values.slice(6));}g.indices.push(next);
      }
    }
    const m=spec.materials[name],material=json.materials.length,definition={name,pbrMetallicRoughness:{baseColorFactor:m.color,metallicFactor:m.metallic,roughnessFactor:m.roughness}};
    for(const role of ['baseColorTexture','metallicRoughnessTexture','normalTexture','occlusionTexture'])if(m[role]){if(!textureIndexes.has(m[role]))throw Error('Missing texture '+m[role]);const value={index:textureIndexes.get(m[role])};if(role==='normalTexture')value.scale=m.normalScale??1;(role==='baseColorTexture'||role==='metallicRoughnessTexture'?definition.pbrMetallicRoughness:definition)[role]=value;}
    json.materials.push(definition);json.meshes[0].primitives.push({attributes:{POSITION:append(g.positions,5126,3),NORMAL:append(g.normals,5126,3),TEXCOORD_0:append(g.uvs,5126,2)},indices:append(g.indices,5125,1),material,mode:4});}
  json.buffers=[{byteLength:offset}];const text=Buffer.from(JSON.stringify(json)),jp=Buffer.concat([text,Buffer.alloc((4-text.length%4)%4,32)]),binary=Buffer.concat(chunks),head=Buffer.alloc(20),bhead=Buffer.alloc(8);head.writeUInt32LE(0x46546c67,0);head.writeUInt32LE(2,4);head.writeUInt32LE(28+jp.length+binary.length,8);head.writeUInt32LE(jp.length,12);head.writeUInt32LE(0x4e4f534a,16);bhead.writeUInt32LE(binary.length);bhead.writeUInt32LE(0x004e4942,4);return Buffer.concat([head,jp,bhead,binary]);
}
return {groups,parts,add,sub,mul,cross,unit,mix,mesh,tri,quad,part,cylinder,ring,prism,roundedOutline,house,rail,ladder,addTexture,makeGlb};
}
