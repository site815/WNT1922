// Source-level HTML checks in Node. No browser, DOM parser, clicks or visual QA.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const directory=path.resolve(process.env.WNT_TEST_PUBLIC||'game/public');
const catalog=JSON.parse(fs.readFileSync(path.join(directory,'content.json')));
let source=fs.readFileSync(path.join(directory,'app.mjs'),'utf8');
// This harness checks generated strings; real DOM reconciliation is exercised
// by check-browser-play and check-08-browser in Chromium.
source=source.replace(/import \{ updateDOM \} from '.\/dom-update.mjs';/, 'const updateDOM=(root,html)=>{root.innerHTML=html;};');
source=source.replace(/^import (.+?) from '(.+?)';$/gm,(_,what,where)=>{
  const url=pathToFileURL(path.join(directory,where)).href;
  const binding=what.startsWith('* as ')?what.slice(5):what.replace(/\b(\w+) as (\w+)\b/g,'$1:$2');
  return `const ${binding}=await import(${JSON.stringify(url)});`;
});
const element={innerHTML:'',style:{},addEventListener(){},querySelectorAll(){return[];},querySelector(){return null;}};
const document={querySelector(){return element;},addEventListener(){},createElement(){return {setAttribute(){},addEventListener(){},style:{}};},body:{append(){}}};
const check=(html,label)=>{if(!html||/\b(?:NaN|undefined|Infinity)\b/.test(html))throw new Error('Invalid generated HTML: '+label);};
const code=source+`
let pages=0,classes=0;
for(const campaign of Object.keys(bundle.campaigns)){
  selectedCampaign=campaign;content=contentFor(bundle,campaign);state=null;renderStart();check(app.innerHTML,campaign+' start');pages++;
  for(const id of Object.keys(content.nations)){
    state=sim.newGame(bundle,id,901,campaign);content=contentFor(bundle,state);chart.fleetId=player().fleets[0]?.id;
    for(const v of ['command','land','yards','aircraft','fleet','programs','diplomacy','reports','review','economy']){view=v;dialog=null;render();check(app.innerHTML,campaign+' '+id+' '+v);pages++;}
    view='yards';draft=automaticDraft(state,content,'DD');render();check(app.innerHTML,campaign+' '+id+' designer');draft=null;pages++;
    for(const selection of [{},{countryId:'GBR'},{credits:true}]){view='command';chart={zoom:1,...selection};render();check(app.innerHTML,campaign+' '+id+' chart '+JSON.stringify(selection));pages++;}
    chart.portId='hawaii';view='command';render();check(app.innerHTML,campaign+' '+id+' port');pages++;chart.portId=null;dialog={type:'menu'};check(modalHTML(),campaign+' '+id+' music menu');pages++;
    for(const cl of Object.values(content.classes).filter(cl=>cl.nation===id)){
      dialog={type:'spec',id:cl.id};check(modalHTML(),cl.id+' specifications');classes++;
    }
    dialog=null;
  }
}
return {pages,classPanels:classes,browserTested:false};`;
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const run=new AsyncFunction('document','window','fetch','requestAnimationFrame','setTimeout','clearTimeout','check',code);
const result=await run(document,{innerWidth:1366,innerHeight:768,addEventListener(){}},async url=>url==='/content.json'?{ok:true,json:async()=>catalog}:{ok:false,status:404},()=>0,()=>0,()=>{},check);
console.log(JSON.stringify(result));
