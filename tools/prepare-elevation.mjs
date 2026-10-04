// Convert the published NOAA ERDDAP NetCDF classic subset to the offline grid.
// No dependencies and no network activity: pass an already downloaded file.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const input=process.argv[2];if(!input)throw Error('Usage: node tools/prepare-elevation.mjs <etopo-5min.nc>');
const data=await fs.readFile(input),hash=b=>createHash('sha256').update(b).digest('hex');
if(data.subarray(0,4).toString('hex')!=='43444601')throw Error('Expected NetCDF classic CDF1');
let at=4;const u32=()=>{const n=data.readUInt32BE(at);at+=4;return n;};
const name=()=>{const n=u32(),s=data.toString('utf8',at,at+n);at+=Math.ceil(n/4)*4;return s;};
const sizes={1:1,2:1,3:2,4:4,5:4,6:8};
function attributes(){const kind=u32(),n=u32();if(kind!==12&&!(kind===0&&n===0))throw Error('Invalid attributes');for(let i=0;i<n;i++){name();const type=u32(),count=u32();if(!sizes[type])throw Error('Unknown type');at+=Math.ceil(sizes[type]*count/4)*4;}}
if(u32()!==0)throw Error('Record dimensions are unsupported');
if(u32()!==10)throw Error('Missing dimensions');const dimensions=[];
for(let i=0,n=u32();i<n;i++)dimensions.push({name:name(),size:u32()});
attributes();if(u32()!==11)throw Error('Missing variables');const variables={};
for(let i=0,n=u32();i<n;i++){const id=name(),dims=[];for(let j=0,m=u32();j<m;j++)dims.push(u32());attributes();const type=u32(),bytes=u32(),offset=u32();variables[id]={dims,type,bytes,offset};}
const width=4320,height=2160,step=1/12;
const latitude=variables.latitude,longitude=variables.longitude,z=variables.z;
if(!latitude||!longitude||!z||z.type!==5||latitude.type!==6||longitude.type!==6
 ||dimensions[z.dims[0]]?.size!==height||dimensions[z.dims[1]]?.size!==width)throw Error('Unexpected subset shape');
for(let y=0;y<height;y++)if(Math.abs(data.readDoubleBE(latitude.offset+y*8)-(-90+step/2+y*step))>1e-8)throw Error('Latitude ordering');
for(let x=0;x<width;x++)if(Math.abs(data.readDoubleBE(longitude.offset+x*8)-(step/2+x*step))>1e-8)throw Error('Longitude ordering');
const output=Buffer.alloc(width*height*2);let min=Infinity,max=-Infinity,land=0,ocean=0,sea=0,error=0;
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
 const value=data.readFloatBE(z.offset+((height-1-y)*width+(x+width/2)%width)*4);
 if(!Number.isFinite(value)||value<=-32768||value>32767)throw Error('Missing/out-of-range elevation');
 const metres=Math.round(value);output.writeInt16LE(metres,(y*width+x)*2);
 min=Math.min(min,metres);max=Math.max(max,metres);error=Math.max(error,Math.abs(value-metres));
 if(metres>0)land++;else if(metres<0)ocean++;else sea++;
}
const file='assets/terrain/elevation.json',old=JSON.parse(await fs.readFile(file,'utf8'));
const previous=await fs.readFile('assets/terrain/elevation.bin');
if(old.width===1440&&old.height===720){
 for(let y=0;y<720;y++)for(let x=0;x<1440;x++)
  if(previous.readInt16LE((y*1440+x)*2)!==output.readInt16LE(((3*y+1)*width+3*x+1)*2))throw Error('Original coarse reference sample changed');
}else if(old.width!==width)throw Error('Unexpected previous grid');
const metadata={...old,width,height,byteLength:output.length,longitudeWestCenter:-180+step/2,latitudeNorthCenter:90-step/2,longitudeStepDegrees:step,latitudeStepDegrees:-step,sha256:hash(output),statistics:{minMetres:min,maxMetres:max,landSamples:land,oceanSamples:ocean,seaLevelSamples:sea,noDataSamples:0,maxQuantizationErrorMetres:error},source:{...old.source,downloadUrl:'https://oceanwatch.pifsc.noaa.gov/erddap/griddap/ETOPO_2022_v1_60s.nc?z%5B2:5:10797%5D%5B2:5:21597%5D',accessed:'2026-10-04',downloadByteLength:data.length,downloadSha256:hash(data),latitudeIndices:'2:5:10797',longitudeIndices:'2:5:21597',processing:['Select every fifth source sample starting at index2 on both axes; no invented or averaged heights.','Rotate source longitude columns by2160 to store -180..180 and reverse latitude rows.','Round Float32 metres to signed little-endian Int16; preserve every original quarter-degree sample exactly.']},limitations:['Five arc-minute samples are approximately9.3km apart at the equator; regional terrain, not harbor-scale geography.','Point subsampling can miss narrow peaks, islands and trenches.','Modern ETOPO2022 ice-surface elevations do not reconstruct historical ice cover.','No vertical exaggeration baked into data. Rendering relief is separate.','Game coastline polygons determine land and navigable water; this grid does not define grounding.']};
await fs.writeFile('assets/terrain/elevation.bin',output);
await fs.writeFile(file,JSON.stringify(metadata,null,2)+'\n');
await fs.writeFile('assets/terrain/elevation.hdr',`BYTEORDER I\nLAYOUT BIL\nNROWS ${height}\nNCOLS ${width}\nNBANDS 1\nNBITS 16\nPIXELTYPE SIGNEDINT\nBANDROWBYTES ${width*2}\nTOTALROWBYTES ${width*2}\nULXMAP ${metadata.longitudeWestCenter}\nULYMAP ${metadata.latitudeNorthCenter}\nXDIM ${step}\nYDIM ${step}\nNODATA -32768\n`);
console.log(JSON.stringify({width,height,bytes:output.length,sha256:metadata.sha256,statistics:metadata.statistics,originalSamplesPreserved:1036800},null,2));
