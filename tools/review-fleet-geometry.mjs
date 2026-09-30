// Offline authoring contact sheets. This inspects actual GLB surface geometry;
// it does not replace native Unreal material, camera, collision or GPU checks.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {pathToFileURL} from 'node:url';
const option=name=>process.argv.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
const root=process.cwd(),files=option('--files')?.split(',');if(!files?.length)throw Error('--files=<model/path,model/path> required');
const output=path.resolve(option('--output')||'test-output/fleet-geometry.png');
const playwrightPath=option('--playwright')||path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const {chromium}=await import(pathToFileURL(playwrightPath).href);
const models=await Promise.all(files.map(async file=>{const buffer=await fs.readFile(path.join(root,'assets/models/ships',file+'.glb')),meta=JSON.parse(await fs.readFile(path.join(root,'assets/models/ships',file+'.source.json'),'utf8')),json=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12))),bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};for(const mesh of json.meshes)for(const primitive of mesh.primitives){const a=json.accessors[primitive.attributes.POSITION];for(let k=0;k<3;k++){bounds.min[k]=Math.min(bounds.min[k],a.min[k]);bounds.max[k]=Math.max(bounds.max[k],a.max[k]);}}return {file,buffer,meta,bounds};}));
const server=http.createServer((request,response)=>{const m=/^\/model\/(\d+)$/.exec(request.url);if(m&&models[+m[1]]){response.setHeader('Content-Type','model/gltf-binary');response.end(models[+m[1]].buffer);}else if(request.url==='/'){response.setHeader('Content-Type','text/html');response.end('<!doctype html><html><body style="margin:0;background:#28343c;color:#eee;font:16px sans-serif"></body></html>');}else{response.statusCode=404;response.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
  const page=await browser.newPage({viewport:{width:1800,height:models.length*350+45},deviceScaleFactor:1});await page.goto('http://127.0.0.1:'+server.address().port);
  await page.evaluate(async models=>{
    const heading=document.createElement('div');heading.style='height:45px;line-height:45px;padding-left:20px';heading.textContent='Stored GLB geometry review — top / broadside / quarter. Authoring preview, not Unreal material certification.';document.body.append(heading);
    const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>a.map(v=>v/Math.hypot(...a));
    for(let n=0;n<models.length;n++){
      const buffer=await(await fetch('/model/'+n)).arrayBuffer(),view=new DataView(buffer),jsonLength=view.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(buffer.slice(20,20+jsonLength))),bin=28+jsonLength;
      const row=document.createElement('div');row.style='display:flex;height:350px;position:relative;border-top:1px solid #56616a';const label=document.createElement('div');label.textContent=models[n].name+' — '+models[n].file;label.style='position:absolute;z-index:1;padding:8px;background:#28343cb0';row.append(label);document.body.append(row);
      for(const [kind,eye]of [['top',[0,1,0]],['broadside',[0,.05,1]],['quarter',[.6,.48,1]]]){
        const canvas=document.createElement('canvas');canvas.width=600;canvas.height=350;row.append(canvas);const gl=canvas.getContext('webgl2',{antialias:true,preserveDrawingBuffer:true});if(!gl)throw Error('WebGL2 unavailable for authoring preview');
        const shader=(kind,code)=>{const s=gl.createShader(kind);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
        const vs=shader(gl.VERTEX_SHADER,'#version 300 es\nprecision highp float;in vec3 p;in vec3 n;uniform vec3 right;uniform vec3 up;uniform vec3 forward;uniform vec3 center;uniform vec2 scale;out vec3 normal;void main(){vec3 q=p-center;gl_Position=vec4(dot(q,right)*scale.x,dot(q,up)*scale.y,-dot(q,forward)*scale.x*.2,1.);normal=n;}');
        const fs=shader(gl.FRAGMENT_SHADER,'#version 300 es\nprecision highp float;in vec3 normal;uniform vec4 color;out vec4 pixel;void main(){vec3 n=normalize(normal);float light=.40+.60*max(0.,dot(n,normalize(vec3(.3,1.,.55))));pixel=vec4(pow(max(color.rgb*light,vec3(0.)),vec3(1./2.2)),1.);}');
        const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.clearColor(.15,.19,.22,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        const f=norm(eye),right=norm(cross(Math.abs(f[1])>.99?[0,0,-1]:[0,1,0],f)),up=cross(f,right),bounds=models[n].bounds,center=bounds.min.map((v,i)=>(v+bounds.max[i])/2),L=models[n].length,scale=.91*2/L;
        for(const [key,value]of Object.entries({right,up,forward:f,center}))gl.uniform3fv(gl.getUniformLocation(program,key),value);gl.uniform2f(gl.getUniformLocation(program,'scale'),scale,scale*600/350);
        function attribute(index,location){const a=json.accessors[index],v=json.bufferViews[a.bufferView],typed=new Float32Array(buffer,bin+(v.byteOffset||0)+(a.byteOffset||0),a.count*3),gpu=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,gpu);gl.bufferData(gl.ARRAY_BUFFER,typed,gl.STATIC_DRAW);const slot=gl.getAttribLocation(program,location);gl.enableVertexAttribArray(slot);gl.vertexAttribPointer(slot,3,gl.FLOAT,false,0,0);}
        for(const mesh of json.meshes)for(const primitive of mesh.primitives){attribute(primitive.attributes.POSITION,'p');attribute(primitive.attributes.NORMAL,'n');const a=json.accessors[primitive.indices],v=json.bufferViews[a.bufferView],type=a.componentType,Typed=type===5125?Uint32Array:Uint16Array,gpu=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gpu);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Typed(buffer,bin+(v.byteOffset||0)+(a.byteOffset||0),a.count),gl.STATIC_DRAW);gl.uniform4fv(gl.getUniformLocation(program,'color'),json.materials[primitive.material].pbrMetallicRoughness.baseColorFactor||[.5,.5,.5,1]);gl.drawElements(gl.TRIANGLES,a.count,type,0);}
      }
    }
  },models.map(({file,meta,bounds})=>({file,name:meta.name,bounds,length:meta.dimensions?.length||meta.historicalDimensions.lengthOverall})));
  await fs.mkdir(path.dirname(output),{recursive:true});await page.screenshot({path:output});console.log(output);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
