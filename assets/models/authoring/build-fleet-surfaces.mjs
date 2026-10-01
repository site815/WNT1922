// Offline authoring only. Deterministic, original tiled PBR surfaces; no network.
import fs from 'node:fs/promises';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
const out=new URL('../textures/fleet-surfaces/',import.meta.url),N=256;
const clamp=n=>Math.min(1,Math.max(0,n));
const hash=(x,y)=>{let a=(x*374761393+y*668265263)>>>0;a=Math.imul(a^(a>>>13),1274126177);return ((a^(a>>>16))>>>0)/4294967295;};
const mix=(a,b,t)=>a+(b-a)*t;
function noise(x,y,period){const a=Math.floor(x/period),b=Math.floor(y/period),u=x/period-a,v=y/period-b;const h=(i,j)=>hash((i+N/period)%(N/period),(j+N/period)%(N/period));return mix(mix(h(a,b),h(a+1,b),u*u*(3-2*u)),mix(h(a,b+1),h(a+1,b+1),u*u*(3-2*u)),v*v*(3-2*v));}
const edge=(p,period)=>Math.min((p%period+period)%period,period-(p%period+period)%period);
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
const crc=b=>{let n=0xffffffff;for(const x of b)n=crcTable[(n^x)&255]^(n>>>8);return(n^0xffffffff)>>>0;};
function chunk(name,data){const type=Buffer.from(name),head=Buffer.alloc(4),tail=Buffer.alloc(4);head.writeUInt32BE(data.length);tail.writeUInt32BE(crc(Buffer.concat([type,data])));return Buffer.concat([head,type,data,tail]);}
function png(pixels){const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(N);ihdr.writeUInt32BE(N,4);ihdr[8]=8;ihdr[9]=2;const rows=Buffer.alloc(N*(N*3+1));for(let y=0;y<N;y++){const offset=y*(N*3+1);rows[offset]=1;for(let x=0;x<N*3;x++)rows[offset+x+1]=(pixels[y*N*3+x]-(x>=3?pixels[y*N*3+x-3]:0)+256)&255;}return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(rows,{level:9})),chunk('IEND',Buffer.alloc(0))]);}
if(!process.argv.includes('--write'))throw Error('Use --write to replace stored original surface assets.');
await fs.mkdir(out,{recursive:true});const files=[];
for(const finish of ['paint','steel-deck','timber','canvas']){
  const height=new Float32Array(N*N),albedo=Buffer.alloc(N*N*3),orm=Buffer.alloc(N*N*3),normal=Buffer.alloc(N*N*3);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    const i=y*N+x,fine=hash(x,y),broad=noise(x,y,64),patch=noise(x,y,16);let color,h,rough,ao;
    if(finish==='timber'){
      const plank=Math.floor(y/16),stagger=(plank%4)*64,seam=Math.max(Math.exp(-(edge(y,16)**2)/.48),.75*Math.exp(-(edge(x+stagger,256)**2)/.5));
      const grain=Math.sin(y*4.4+noise(x,y,32)*6+Math.sin(x/16)*.5)*.018+(fine-.5)*.018;
      const board=hash(plank,29)*.06-.03,v=.71+board+grain+(broad-.5)*.04-seam*.20;
      color=[v*1.045,v*.985,v*.83];h=grain*.07-seam*.04;rough=.86+(patch-.5)*.12;ao=1-seam*.24;
    }else if(finish==='steel-deck'){
      const panel=Math.exp(-(Math.min(edge(x,128),edge(y,64))**2)/1.0),grain=(fine-.5)*.11;
      const v=.81+grain+(broad-.5)*.12-panel*.12;color=[v*.96,v*.99,v];h=grain*.18-panel*.026;rough=.91+(patch-.5)*.08;ao=1-panel*.13;
    }else if(finish==='canvas'){
      const weave=(Math.cos(x*Math.PI)*.5+Math.cos(y*Math.PI)*.5)*.024,v=.84+weave+(broad-.5)*.13+(fine-.5)*.03;
      color=[v,v*.99,v*.94];h=weave*.35;rough=.94;ao=.99;
    }else{
      const seam=Math.min(edge(y,128),edge(x+(Math.floor(y/128)%2)*128,256)),line=Math.exp(-seam*seam/1.0);
      const runoff=Math.pow(noise(x,y,16),3)*(.5+.5*Math.cos(y/256*Math.PI*2));
      // Paint is a continuous finish, not alternating masonry-like plates. Fine
      // joints live mainly in roughness/normal and disappear naturally in mips.
      const v=.87+(broad-.5)*.035+(patch-.5)*.025+(fine-.5)*.012-runoff*.025;
      color=[v,v*.997,v*.99];h=(fine-.5)*.001+(patch-.5)*.002-line*.0015;rough=.79+(broad-.5)*.09+line*.025;ao=1-line*.025;
    }
    height[i]=h;for(let k=0;k<3;k++)albedo[i*3+k]=Math.round(clamp(color[k])*255);orm[i*3]=Math.round(clamp(ao)*255);orm[i*3+1]=Math.round(clamp(rough)*255);orm[i*3+2]=0;
  }
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,dx=(height[y*N+(x+1)%N]-height[y*N+(x+N-1)%N])*6,dy=(height[((y+1)%N)*N+x]-height[((y+N-1)%N)*N+x])*6,n=Math.hypot(dx,dy,1);normal[i*3]=Math.round(255*(.5-dx/n*.5));normal[i*3+1]=Math.round(255*(.5-dy/n*.5));normal[i*3+2]=Math.round(255*(.5+1/n*.5));}
  for(const [role,pixels]of Object.entries({albedo,normal,orm})){const bytes=png(pixels),name=finish+'-'+role+'.png';await fs.writeFile(new URL(name,out),bytes);files.push({name,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
}
await fs.writeFile(new URL('source.json',out),JSON.stringify({name:'WNT1922 fleet surface library',author:'WNT1922',license:'Original project artwork; LICENSE.md',source:'assets/models/authoring/build-fleet-surfaces.mjs',resolution:[N,N],tileMetres:[2.5,2.5],normalConvention:'OpenGL +Y',notes:'Original inferred painted plating, weathered timber planks, nonslip steel decking and canvas. No invented precise camouflage date or measured class-specific plating claim. All files are RGB and mipmapped by Unreal. The 256 px tile is repeated at physical scale rather than stretched over a ship.',files},null,2)+'\n');
console.log(JSON.stringify({surfaces:4,textures:files.length,bytes:files.reduce((n,f)=>n+f.bytes,0)}));
