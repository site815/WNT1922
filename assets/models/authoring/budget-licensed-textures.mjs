// Offline licensed-art derivative. No mesh, UV, material or artist paint edits.
import {createRequire} from 'node:module';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {readGlb} from './normalize-external-glb.mjs';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const require=createRequire(import.meta.url);
function imageLibrary(){try{return require('sharp');}catch{try{return require(path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));}catch{throw Error('Optional licensed texture authoring requires the sharp image library. Finished GLBs do not require it.');}}}
export async function budgetLicensedTextures(buffer,maxDimension=512){
  const sharp=imageLibrary(),{json,binary}=readGlb(buffer),replacements=new Map(),images=[],normalImages=new Set(),colorImages=new Set();
  for(const material of json.materials){for(const [texture,collection]of [[material.normalTexture,normalImages],[material.pbrMetallicRoughness?.baseColorTexture,colorImages],[material.emissiveTexture,colorImages]])if(texture)collection.add(json.textures[texture.index].source);}
  for(const [index,image]of json.images.entries()){
    const v=json.bufferViews[image.bufferView],source=binary.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength),meta=await sharp(source).metadata();
    let pipeline=sharp(source);if(colorImages.has(index))pipeline=pipeline.gamma();
    pipeline=pipeline.resize({width:maxDimension,height:maxDimension,fit:'inside',withoutEnlargement:true,kernel:'lanczos3'});
    let pixels=await pipeline.ensureAlpha().raw().toBuffer({resolveWithObject:true});
    if(normalImages.has(index))for(let i=0;i<pixels.data.length;i+=4){const x=pixels.data[i]/127.5-1,y=pixels.data[i+1]/127.5-1,z=pixels.data[i+2]/127.5-1,length=Math.hypot(x,y,z)||1;pixels.data[i]=Math.round((x/length*.5+.5)*255);pixels.data[i+1]=Math.round((y/length*.5+.5)*255);pixels.data[i+2]=Math.round((z/length*.5+.5)*255);}
    const bytes=await sharp(pixels.data,{raw:pixels.info}).png({compressionLevel:9,adaptiveFiltering:true}).toBuffer();replacements.set(image.bufferView,bytes);image.mimeType='image/png';
    images.push({index,mimeType:image.mimeType,bytes:bytes.length,sha256:hash(bytes),sourceBytes:source.length,sourceSha256:hash(source),sourceWidth:meta.width,sourceHeight:meta.height,width:pixels.info.width,height:pixels.info.height,origin:'512 px budget derivative of pinned artist image '+index+'; Lanczos resampling, color-aware albedo filtering and renormalized tangent normals. Artist UVs and paint retained.'});
  }
  const chunks=[];let offset=0;
  for(const [index,view]of json.bufferViews.entries()){const bytes=replacements.get(index)||binary.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength);view.byteOffset=offset;view.byteLength=bytes.length;chunks.push(bytes);offset+=bytes.length;const padding=(4-offset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}}
  json.buffers=[{byteLength:offset}];json.extras.textureBudget={maxDimension,sourcePixelCount:images.reduce((n,i)=>n+i.sourceWidth*i.sourceHeight,0),pixelCount:images.reduce((n,i)=>n+i.width*i.height,0),geometryUnchanged:true};
  const text=Buffer.from(JSON.stringify(json)),jp=Buffer.concat([text,Buffer.alloc((4-text.length%4)%4,32)]),data=Buffer.concat(chunks),header=Buffer.alloc(20),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+jp.length+data.length,8);header.writeUInt32LE(jp.length,12);header.writeUInt32LE(0x4e4f534a,16);bh.writeUInt32LE(data.length);bh.writeUInt32LE(0x004e4942,4);
  return{buffer:Buffer.concat([header,jp,bh,data]),images,budget:json.extras.textureBudget};
}
