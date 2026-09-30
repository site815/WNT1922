// Original deterministic PBR surface authoring. These files are committed assets;
// neither Unreal launch nor an asset change invokes this authoring script.
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),out=path.join(here,'../textures/naval-paint');
const N=512,clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const hash=(x,y)=>{let a=(x*374761393+y*668265263)>>>0;a=Math.imul(a^(a>>>13),1274126177);return ((a^(a>>>16))>>>0)/4294967295;};
const noise=(x,y,scale)=>{const a=Math.floor(x/scale),b=Math.floor(y/scale),u=x/scale-a,v=y/scale-b,s=u*u*(3-2*u),t=v*v*(3-2*v);const mix=(a,b,t)=>a+(b-a)*t;return mix(mix(hash(a,b),hash(a+1,b),s),mix(hash(a,b+1),hash(a+1,b+1),s),t);};
const height=new Float32Array(N*N),albedo=Buffer.alloc(N*N*4),orm=Buffer.alloc(N*N*4),normal=Buffer.alloc(N*N*4);
for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const i=y*N+x,grain=hash(x,y),patch=noise(x,y,36),broad=noise(x,y,110),horizontal=Math.min(y%256,256-y%256),vertical=Math.min((x+(y<256?0:256))%512,512-(x+(y<256?0:256))%512),seam=Math.min(horizontal,vertical),edge=Math.exp(-seam/2.1);
  const row=y%256<128?8:248,col=(x+(y<256?0:256))%512,nearestRivet=Math.hypot((col+16)%32-16,y%256-row),rivet=Math.max(0,1-nearestRivet/2.3);
  height[i]=.0035*(grain-.5)+.011*(patch-.5)-.024*edge+.017*rivet;
  const dirt=edge*.075+(1-broad)*.04,base=clamp(.9+(grain-.5)*.036+(patch-.5)*.045-dirt);
  for(let k=0;k<3;k++)albedo[i*4+k]=Math.round(255*base);albedo[i*4+3]=255;
  orm[i*4]=Math.round(255*(1-edge*.1));orm[i*4+1]=Math.round(255*clamp(.73+(patch-.5)*.16));orm[i*4+2]=0;orm[i*4+3]=255;
}
for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const i=y*N+x,dx=(height[y*N+(x+1)%N]-height[y*N+(x+N-1)%N])*14,dy=(height[((y+1)%N)*N+x]-height[((y+N-1)%N)*N+x])*14,len=Math.hypot(dx,dy,1);
  normal[i*4]=Math.round(255*(.5-dx/len*.5));normal[i*4+1]=Math.round(255*(.5-dy/len*.5));normal[i*4+2]=Math.round(255*(.5+1/len*.5));normal[i*4+3]=255;
}
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
const crc=b=>{let n=0xffffffff;for(const x of b)n=crcTable[(n^x)&255]^(n>>>8);return (n^0xffffffff)>>>0;};
const chunk=(name,data)=>{const type=Buffer.from(name),head=Buffer.alloc(4),tail=Buffer.alloc(4);head.writeUInt32BE(data.length);tail.writeUInt32BE(crc(Buffer.concat([type,data])));return Buffer.concat([head,type,data,tail]);};
function png(pixels){const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(N);ihdr.writeUInt32BE(N,4);ihdr[8]=8;ihdr[9]=6;const rows=Buffer.alloc(N*(N*4+1));for(let y=0;y<N;y++)pixels.copy(rows,y*(N*4+1)+1,y*N*4,(y+1)*N*4);return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(rows,{level:9})),chunk('IEND',Buffer.alloc(0))]);}
if(!process.argv.includes('--write'))throw Error('Use --write for optional surface export.');
await fs.mkdir(out,{recursive:true});for(const [name,data]of Object.entries({albedo,normal,orm}))await fs.writeFile(path.join(out,name+'.png'),png(data));
await fs.writeFile(path.join(out,'source.json'),JSON.stringify({name:'Original naval painted steel',author:'WNT1922',license:'Original project artwork; LICENSE.md',source:'assets/models/authoring/build-naval-surfaces.mjs',normalConvention:'OpenGL +Y',dimensionsMetres:[2,2],notes:'Original inferred plate/rivet surface; subtle paint variation and dirt. Not a measured plate map of a particular ship. ORM: occlusion red, roughness green, metalness blue.'},null,2)+'\n');
console.log('Exported original naval paint albedo, OpenGL normal and packed ORM.');
