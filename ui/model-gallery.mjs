import {UnrealBattleScene} from './unreal-scene.mjs';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(text,url)=>/^https:\/\//.test(url||'')?`<a href="${esc(url)}" target="_blank" rel="noreferrer">${esc(text)}</a>`:esc(text);
export function galleryDimensions(source){
 return {length:source.dimensions?.length??source.historicalDimensions?.lengthOverall,beam:source.dimensions?.beam??source.historicalDimensions?.beam};
}
export function galleryArtInfo(source){
 const author=source.author?`<p>By ${link(source.author,source.authorUrl)}</p>`:'';
 const license=`<p>${link(source.license||'Original project artwork; see project asset credits.',source.licenseUrl)}</p>`;
 const modifications=source.modifications?`<p>Changes: ${esc(source.modifications)}</p>`:'';
 const sources=(source.sources||[]).filter(s=>/^https:\/\//.test(s.url||'')).map(s=>link(s.title||s.url,s.url)).join(' · ');
 const materials=(source.materialSources||[]).map(s=>`${link(s.title||s.name||'Material',s.url)}${s.author?' — '+esc(s.author):''}${s.license?' · '+esc(s.license):''}`).join('; ');
 return `<p>${esc(source.accuracy||source.geometrySource||'')}</p>${author}${license}${modifications}${source.representation?`<p>${esc(source.representation)}</p>`:''}<p>${sources}</p>${materials?`<p>Materials: ${materials}</p>`:''}`;
}
async function json(url){const response=await fetch(url);if(!response.ok)throw Error('Could not load the ship gallery.');return response.json();}
const galleries=new WeakMap();

// A separate presentation scene. It has no simulation client or save access.
export function openModelGallery(options) {
 const current=galleries.get(options.app);
 if(current)return current;
 const previousInert=options.app.inert,previousFocus=document.activeElement;
 // Freeze the opening-screen controls while the local metadata is loading, so
 // a new campaign cannot start behind the arriving modal.
 options.app.inert=true;
 const dispose=()=>{if(galleries.get(options.app)===pending){galleries.delete(options.app);options.app.inert=previousInert;}};
 const pending=createModelGallery({...options,previousFocus,onDispose:dispose});
 galleries.set(options.app,pending);
 pending.catch(()=>{dispose();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});});
 return pending;
}

async function createModelGallery({app,onClose=()=>{},onDispose,previousFocus}) {
 const index=await json('/assets/models/ships/index.json');
 const entries=await Promise.all((index.models||[]).filter(m=>/\.glb$/i.test(m.file||'')&&m.platforms?.length).map(async entry=>{
  const source=await json('/assets/models/ships/'+entry.file.replace(/\.glb$/i,'.source.json'));source.dimensions=galleryDimensions(source);
  if(!Number.isFinite(source.dimensions?.length)||source.dimensions.length<=0||!Number.isFinite(source.dimensions?.beam)||source.dimensions.beam<=0)throw Error(`Invalid ship dimensions in the gallery metadata for ${entry.id}.`);
  return {entry,source};
 }));
 if(!entries.length)throw Error('No detailed ship models are available yet.');
 const host=document.createElement('section');
 host.className='model-gallery';host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-labelledby','model-gallery-title');
 host.innerHTML=`<header><div><span class="eyebrow">SHIP STUDIES · ART IN PROGRESS</span><h1 id="model-gallery-title">3D ship gallery</h1></div><button data-gallery="close" aria-label="Close ship gallery">×</button></header><div class="model-gallery-toolbar"><label>Ship <select aria-label="Ship model">${entries.map(({entry,source},i)=>`<option value="${i}">${esc(source.name||entry.id)}</option>`).join('')}</select></label><button data-gallery="fit">Fit ship</button><span>Wheel: zoom · Drag: pan · Right-drag: orbit</span></div><div class="model-gallery-stage"><canvas class="battle-canvas" tabindex="0" role="application" aria-label="Detailed 3D ship. Scroll to zoom, drag to pan, right-drag to orbit."></canvas></div><footer><p class="model-gallery-status" role="status"></p><details><summary>Art info</summary><div class="model-gallery-info"></div></details></footer>`;
 app.hidden=true;document.body.append(host);
 let selected=0,closed=false,revision=0,cameraQueue=Promise.resolve();
 const scene=new UnrealBattleScene({root:host,onSelect:selection=>{
  if(!closed&&selection?.id==='gallery-ship')host.querySelector('.model-gallery-status').textContent=`${selection.label||entries[selected].source.name} · selected`;
 }});
 const controller=new AbortController();
 const close=()=>{
  if(closed)return;closed=true;revision++;controller.abort();scene.destroy();host.remove();app.hidden=false;onDispose();onClose();
  if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
 };
 const fit=()=>{
  if(closed)return Promise.resolve();
  const request=++revision,{entry,source}=entries[selected],mapping=entry.platforms[0],current=()=>!closed&&request===revision;
  const targetZoom=Math.max(.1,Math.min(1000,1550/source.dimensions.length));
  const report={id:'gallery-'+entry.id,startedAt:0,replay:{frames:[{at:0,stage:1,groupsA:[{id:'gallery-ship',classId:mapping.id,type:source.type,name:source.name,count:1,health:1,sunk:0}],groupsB:[]}]}};
  host.dataset.galleryReady='false';host.dataset.galleryModel=entry.id;host.dataset.galleryTargetZoom=String(targetZoom);
  // Serialize the native packet and its fit together. The new-report callback
  // resets the camera, so fitting before its acknowledgement loses that fit.
  // Fit also refreshes the selected record: a click during a queued selection
  // must not cancel that selection and fit the previous ship instead.
  cameraQueue=cameraQueue.catch(()=>{}).then(async()=>{
   if(!current())return;await scene.refresh(report,mapping.campaign||'in_good_faith_1936',0);
   if(!current())return;await scene.input('home');
   if(!current())return;await scene.input('focus',{id:'gallery-ship',side:'A',hullIndex:0});
   // Native focus establishes zoom 3 after Home and cancels earlier easing.
   // Apply the dimensional zoom last, relative to that known focus baseline.
   if(!current())return;await scene.input('zoom',{delta:-Math.log(targetZoom/3)/.0015});
   if(current())host.dataset.galleryReady='true';
  });
  return cameraQueue;
 };
 const show=async()=>{
  if(closed)return;
  const {source}=entries[selected];
  host.querySelector('.model-gallery-status').textContent=`${source.name} · ${Number(source.dimensions.length).toFixed(1)} m × ${Number(source.dimensions.beam).toFixed(1)} m`;
  host.querySelector('.model-gallery-info').innerHTML=galleryArtInfo(source);
  await fit();
 };
 const failed=error=>{if(!closed)host.querySelector('.model-gallery-status').textContent=error.message;};
 host.addEventListener('click',event=>{const action=event.target.closest('[data-gallery]')?.dataset.gallery;if(action==='close')close();else if(action==='fit')void fit().catch(failed);},{signal:controller.signal});
 host.querySelector('select').addEventListener('change',event=>{const value=Number(event.target.value);if(!Number.isInteger(value)||!entries[value])return;selected=value;void show().catch(failed);},{signal:controller.signal});
 host.addEventListener('keydown',event=>{
  event.stopPropagation();
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
  if(event.key==='Tab'){
   const controls=[...host.querySelectorAll('button,select,canvas,summary,a')].filter(e=>e.getClientRects().length);
   const first=controls[0],last=controls.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 },{signal:controller.signal});
 try{await show();if(!closed)host.querySelector('select').focus();}catch(error){close();throw error;}
 return close;
}
