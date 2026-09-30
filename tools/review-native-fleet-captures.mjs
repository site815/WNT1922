// Offline contact sheets of real FScreenshotRequest PNGs. No native launch,
// scene generation, asset changes, color grading or image substitution.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';

const option=name=>process.argv.find(value=>value.startsWith(name+'='))?.slice(name.length+1);
const runtimePath=option('--runtime');
assert(runtimePath,'Usage: node tools/review-native-fleet-captures.mjs --runtime=<directory-or-result.json> [--registry=<index.json>] [--output=<directory>] [--crop=x,y,width,height] [--per-sheet=24] [--partial]');
const crop=option('--crop')?.split(',').map(Number),perSheet=Number(option('--per-sheet')||24);
assert(!crop||(crop.length===4&&crop.every(Number.isFinite)&&crop[0]>=0&&crop[1]>=0&&crop[2]>0&&crop[3]>0),'Invalid explicit crop rectangle');
assert(Number.isInteger(perSheet)&&perSheet>=1&&perSheet<=24,'--per-sheet must be from1to24');
const cellWidth=480,cellHeight=crop?Math.round(cellWidth*crop[3]/crop[2]):270;
const root=process.cwd(),runtime=path.resolve(runtimePath),resultFile=runtime.endsWith('.json')?runtime:path.join(runtime,'result.json');
const result=JSON.parse(await fs.readFile(resultFile,'utf8'));
const registryFile=path.resolve(option('--registry')||'assets/models/ships/index.json');
const registryBytes=await fs.readFile(registryFile),registry=JSON.parse(registryBytes);
const models=registry.models.filter(model=>model.file.endsWith('.glb')&&model.platforms.length);
const output=path.resolve(option('--output')||path.join(path.dirname(resultFile),'fleet-contact-sheets'));
const captures=new Map();
for(const capture of result.captures||[]){
  const match=/^native-gallery-(\d+)$/.exec(capture.name||'');
  if(!match)continue;
  assert.match(capture.kind||'',/^native-Unreal-GPU/,'Use actual native GPU captures, never CEF HTML screenshots');
  const index=Number(match[1]);assert(index<models.length,'Capture index outside supplied registry: '+index);assert(!captures.has(index),'Duplicate capture index: '+index);captures.set(index,capture);
}
const missing=models.flatMap((model,index)=>captures.has(index)?[]:[{index,id:model.id}]);
assert(!missing.length||process.argv.includes('--partial'),'Missing '+missing.length+' native gallery captures. Use --partial only for an explicitly incomplete review.');
assert(captures.size,'No native-gallery-N captures found');
const rows=[];
for(const [index,capture]of [...captures].sort((a,b)=>a[0]-b[0])){
  const entry=models[index],candidates=[path.resolve(capture.file||''),path.resolve(path.dirname(resultFile),capture.file||''),path.join(path.dirname(resultFile),capture.name+'.png')];
  let file;for(const candidate of candidates)if(await fs.stat(candidate).then(s=>s.isFile()).catch(()=>false)){file=candidate;break;}
  assert(file,'Captured PNG not found: '+capture.name);const bytes=await fs.readFile(file);assert(bytes.subarray(1,4).toString()==='PNG','Native capture must be PNG');
  const meta=JSON.parse(await fs.readFile(path.join(path.dirname(registryFile),entry.file.replace(/\.glb$/,'.source.json')),'utf8'));
  rows.push({index,id:entry.id,name:meta.name||entry.id,model:entry.file,file,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
  if(crop)assert(crop[0]+crop[2]<=rows.at(-1).width&&crop[1]+crop[3]<=rows.at(-1).height,'Explicit crop falls outside native frame: '+capture.name);
}
await fs.mkdir(output,{recursive:true});
const playwrightFile=option('--playwright')||path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const {chromium}=await import(pathToFileURL(playwrightFile).href);
const byIndex=new Map(rows.map(row=>[row.index,row]));
const server=http.createServer(async(request,response)=>{
  try{const match=/^\/capture\/(\d+)$/.exec(request.url||'');if(match&&byIndex.has(Number(match[1]))){response.setHeader('Content-Type','image/png');response.end(await fs.readFile(byIndex.get(Number(match[1])).file));}else if(request.url==='/'){response.setHeader('Content-Type','text/html');response.end('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');}else{response.statusCode=404;response.end();}}
  catch(error){response.statusCode=500;response.end(String(error));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'msedge',headless:true});
const sheets=[];
try{
  const page=await browser.newPage({viewport:{width:1920,height:1930},deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:'+server.address().port);
  for(let start=0;start<rows.length;start+=perSheet){
    const batch=rows.slice(start,start+perSheet),height=70+Math.ceil(batch.length/4)*(cellHeight+40);
    await page.setViewportSize({width:1920,height});
    await page.evaluate(async({batch,number,missing,crop,cellWidth,cellHeight})=>{
      document.body.replaceChildren();document.body.style='margin:0;background:#20272d;color:#edf0f2;font:15px Arial,sans-serif';
      const title=document.createElement('div');title.style='height:70px;box-sizing:border-box;padding:12px 14px;font-size:19px';title.textContent='Native Unreal fleet captures — sheet '+number+(missing?' — PARTIAL REVIEW ('+missing+' missing)':'');
      const note=document.createElement('div');note.style='font-size:14px;color:#bdc8cf;margin-top:7px';note.textContent=crop?'CROPPED native pixels: x'+crop[0]+', y'+crop[1]+', '+crop[2]+' × '+crop[3]+'. Original full PNGs retained. Check originals if any ship reaches the crop edge.':'Actual captured pixels, full frame scaled into 480 × 270 cells. Labels added. Visual approval requires inspection of originals.';title.append(note);document.body.append(title);
      const grid=document.createElement('div');grid.style='display:grid;grid-template-columns:repeat(4,480px)';document.body.append(grid);
      await Promise.all(batch.map(async row=>{
        const cell=document.createElement('div');cell.style='width:480px;height:'+(cellHeight+40)+'px;background:#000';
        const label=document.createElement('div');label.style='height:40px;padding:3px 8px;box-sizing:border-box;overflow:hidden;background:#303c46;color:#fff;font-size:14px;line-height:17px';label.textContent=String(row.index).padStart(3,'0')+' · '+row.name;
        const id=document.createElement('div');id.style='color:#bac9d2;font-size:12px';id.textContent=row.id;label.append(id);
        const image=document.createElement('img');image.width=cellWidth;image.height=cellHeight;image.style='display:block;object-fit:contain';image.src='/capture/'+row.index;image.alt=row.id;cell.append(label);grid.append(cell);await image.decode();
        if(crop){const canvas=document.createElement('canvas');canvas.width=cellWidth;canvas.height=cellHeight;canvas.style='display:block';canvas.getContext('2d').drawImage(image,...crop,0,0,cellWidth,cellHeight);cell.append(canvas);}else cell.append(image);
      }));
    },{batch,number:sheets.length+1,missing:missing.length,crop,cellWidth,cellHeight});
    const file=path.join(output,'native-fleet-'+String(sheets.length+1).padStart(2,'0')+'.png');await page.screenshot({path:file,fullPage:true});
    sheets.push({file,firstIndex:batch[0].index,lastIndex:batch.at(-1).index,count:batch.length,modelIds:batch.map(row=>row.id)});
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
const manifest={createdAt:new Date().toISOString(),runtimeResult:resultFile,nativeRuntimePassed:result.passed===true,registry:registryFile,registrySha256:createHash('sha256').update(registryBytes).digest('hex'),captureCount:rows.length,expectedCount:models.length,missing,crop:crop?{x:crop[0],y:crop[1],width:crop[2],height:crop[3]}:null,cell:{width:cellWidth,height:cellHeight},perSheet,sheets,captures:rows,visualQualityApproved:false,limitations:[crop?'Contact sheets use the explicitly supplied uniform crop. Whole-ship inclusion has not been asserted; inspect uncropped originals if a ship reaches an edge.':'Contact sheets preserve full captured frames, scaled with aspect ratio retained; inspect original images for small details.','Labels use the exact registry ordering filtered by detailed GLBs with platform aliases, matching verify-unreal-runtime.mjs.','No engine is launched and no geometry, pixels within the source captures, game assets or runtime files are altered.']};
await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({captureCount:rows.length,expectedCount:models.length,missing:missing.length,sheets:sheets.map(sheet=>sheet.file),manifest:path.join(output,'manifest.json')},null,2));
