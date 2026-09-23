import * as THREE from './vendor/three/three.module.js';
import { GLOBE_RADIUS, geoVector, tangentFrame, globeTerrain, globeGraticule, pointOnGlobeLand } from './globe-geometry.mjs';
import { applyGlobeCamera, globeRayPoint, anchorGlobePoint, moveGlobe, resetGlobe, clamp, wrap,
  MAX_GLOBE_ZOOM, SHIP_DETAIL_ZOOM, FLEET_FOCUS_ZOOM, METRES_TO_GLOBE } from './globe-camera.mjs';
import { createVoxelMesh } from './three-vessels.mjs';
import { voxelModelFor } from './voxel-models.mjs';
import { ownFleetScene } from './isometric-math.mjs';
import { ownMerchantScene } from './merchant-scene.mjs';
import { visualMinute, visualFleet } from './map-motion.mjs';
import { fleetPosition, visibleContacts } from '../mechanics/task-forces.mjs';
import { campaignMinutes } from '../mechanics/campaign-clock.mjs';
import { PORTS, PORT_LOCATIONS, NODES, MAP_CAPITALS } from '../mechanics/world.mjs';
import { PROFILES } from '../mechanics/catalog.mjs';
import { POWERS, frontPosition } from '../mechanics/land-war.mjs';
import { uiModel } from '../mechanics/queries.mjs';
import { escortCircle, coverageAt } from '../mechanics/convoy-coverage.mjs';
import { chartPosition } from './map-focus.mjs';
import { remainingRoute } from './command-view.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const selectionKey = h => h ? `${h.kind}:${h.id}:${h.hullIndex ?? ''}` : '';
const sphere = new THREE.Sphere(new THREE.Vector3(),GLOBE_RADIUS);

// One WebGL scene at every scale. No ship images, zoom-screen swap, or second
// simulation: camera motion and review formations are presentation state only.
export class WorldScene3D {
  constructor({root,chart,active=()=>true,onSelect=()=>{},onHover=()=>{},onCameraChange=()=>{}}) {
    Object.assign(this,{root,chart,active,onSelect,onHover,onCameraChange});
    this.current=null; this.previous=null; this.frames=0; this.hits=[];
    this.shipMeshes=new Map(); this.markerMeshes=new Map(); this.anchorCache=new Map();
    this.raycaster=new THREE.Raycaster(); this.frustum=new THREE.Frustum();
    this.hoverKey=''; this.selectedHull=null;
    this.resizeObserver=new ResizeObserver(()=>this.refresh()); this.resizeObserver.observe(root);
    this.visibility=()=>this.refresh(); document.addEventListener('visibilitychange',this.visibility);
  }
  get ready() { return Boolean(this.canvas?.isConnected && this.renderer); }
  accept(state,content,political,at=performance.now()) {
    this.content=content;
    if(this.political!==political) {this.political=political;this.terrainRevision=null;this.anchorCache.clear();}
    if(this.current?.state!==state) {
      this.previous=this.current;
      if(this.previous&&(state.player!==this.previous.state.player||state.campaignId!==this.previous.state.campaignId||campaignMinutes(state)<campaignMinutes(this.previous.state))) {
        this.previous=null;this.anchorCache.clear();this.selectedHull=null;
      }
      this.current={state,at,forces:new Map([...(state.nations[state.player].fleets||[]),...(state.nations[state.player].convoys||[])].map(f=>[f.id,f]))};
      this.fleets=ownFleetScene(state); this.merchants=ownMerchantScene(state);
      const hulls=new Set([...this.fleets,...this.merchants].flatMap(row=>row.hulls.map(hull=>hull.key)));
      for(const [key,mesh]of this.shipMeshes)if(!hulls.has(key)){this.ships?.remove(mesh);this.shipMeshes.delete(key);}
      for(const id of this.anchorCache.keys())if(!this.current.forces.has(id))this.anchorCache.delete(id);
    }
    this.refresh();
  }
  mount() {
    const surface=this.root.querySelector('.isometric-surface');
    if(!surface) {this.suspend();return false;}
    if(this.canvas?.parentElement===surface&&this.renderer)return true;
    this.releaseRenderer(); this.surface=surface;
    surface.innerHTML='<canvas class="isometric-canvas globe-canvas" tabindex="0" role="application" aria-label="3D naval globe. Scroll to zoom. Drag to turn the world. Right-drag or Shift-drag to rotate and tilt the camera. Double-click a fleet or convoy for ships. Home restores the strategic globe; Page Up and Page Down zoom."></canvas><div class="globe-labels" aria-hidden="true"></div><div class="isometric-accessibility" aria-label="Visible ships and chart objects"></div><p class="globe-error" hidden></p>';
    this.canvas=surface.querySelector('canvas');
    try {this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,antialias:true,alpha:false,powerPreference:'high-performance'});}
    catch {surface.querySelector('.globe-error').hidden=false;surface.querySelector('.globe-error').textContent='The 3D globe needs WebGL 2. Enable graphics acceleration and reopen the game.';return false;}
    this.renderer.setClearColor('#081a25');this.renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(44,1,.001,500);
    this.scene.add(new THREE.HemisphereLight('#d0e8ed','#50626b',2.3));
    this.sun=new THREE.DirectionalLight('#fff0d1',2.2);this.scene.add(this.sun);
    this.waterMaterial=new THREE.MeshStandardMaterial({color:'#183f50',roughness:.76,metalness:.18});
    this.ocean=new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS,256,128),this.waterMaterial);this.scene.add(this.ocean);
    this.ships=new THREE.Group();this.markers=new THREE.Group();this.lines=new THREE.Group();
    this.scene.add(this.ships,this.markers,this.lines);
    this.markerGeometry={fleet:new THREE.CircleGeometry(1,3),convoy:new THREE.PlaneGeometry(1.4,1.2),contact:new THREE.CircleGeometry(1,4),port:new THREE.CircleGeometry(1,8),country:new THREE.CircleGeometry(1,4),front:new THREE.PlaneGeometry(2,.5)};
    this.canvas.addEventListener('contextmenu',e=>e.preventDefault());
    this.canvas.addEventListener('pointerdown',e=>this.pointerDown(e));
    this.canvas.addEventListener('pointermove',e=>this.pointerMove(e));
    this.canvas.addEventListener('pointerup',e=>this.pointerUp(e));
    this.canvas.addEventListener('pointercancel',e=>this.pointerUp(e,true));
    this.canvas.addEventListener('pointerleave',e=>{if(!this.drag)this.hover(null,e);});
    this.canvas.addEventListener('wheel',e=>this.wheel(e),{passive:false});
    this.canvas.addEventListener('dblclick',e=>this.doubleClick(e));
    this.canvas.addEventListener('keydown',e=>this.keydown(e));
    this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(e.target===this.canvas){this.suspend();this.contextLost=true;}});
    this.canvas.addEventListener('webglcontextrestored',e=>{if(e.target===this.canvas){this.contextLost=false;this.refresh();}});
    surface.addEventListener('click',e=>{const b=e.target.closest('[data-iso-target]');if(b)this.select(this.accessibleTargets?.get(b.dataset.isoTarget));});
    this.terrainRevision=null;this.lineKey='';this.resize();return true;
  }
  resize() {
    if(!this.ready)return;
    const b=this.surface.getBoundingClientRect(); this.width=Math.max(1,b.width);this.height=Math.max(1,b.height);
    this.renderer.setSize(this.width,this.height,false);
    const side=this.root.querySelector('.sidebar')?.getBoundingClientRect(), panel=this.root.querySelector('.command-side-panel')?.getBoundingClientRect(), work=this.root.querySelector('.workspace')?.getBoundingClientRect();
    const left=Math.max(12,(side?.right||0)-b.left+12),right=panel&&panel.width<this.width*.5?panel.left-b.left-12:this.width-12;
    const top=Math.max(30,(work?.top||40)-b.top+8);
    this.viewport={x:left,y:top,width:Math.max(120,right-left),height:Math.max(120,this.height-top-48)};
    // A camera view offset centers the globe between the floating ministry tiles
    // while still drawing ocean/world behind them over the full canvas.
    const v=this.viewport;this.camera.setViewOffset(v.width,v.height,-v.x,-v.y,this.width,this.height);
    this.surface.style.setProperty('--iso-left',left+'px');this.surface.style.setProperty('--iso-top',top+'px');
  }
  refresh() {
    if(!this.current||!this.mount()||this.contextLost)return;
    this.resize();this.paint(performance.now());
    this.suspend();
    if(this.active()&&!document.hidden&&!this.current.state.paused)this.frame=requestAnimationFrame(t=>this.animate(t));
  }
  animate(now) {
    this.frame=null;if(!this.ready||!this.active()||document.hidden||this.current.state.paused)return;
    if(now-(this.lastPaint||0)>=1000/30-.5)this.paint(now);
    this.frame=requestAnimationFrame(t=>this.animate(t));
  }
  suspend() {cancelAnimationFrame(this.frame);this.frame=null;}
  releaseRenderer() {
    this.suspend();clearTimeout(this.cameraTimer);clearTimeout(this.selectTimer);
    this.accessibleKey=null;this.accessibleTargets=null;this.hoverKey='';this.hoverSelection=null;this.drag=null;this.contextLost=false;
    if(this.scene)this.scene.traverse(o=>{if(o.geometry&&!o.userData.sharedVoxel)o.geometry.dispose();if(o.material&&!o.userData.sharedVoxel)for(const m of [].concat(o.material))m.dispose();});
    this.renderer?.dispose();this.renderer?.forceContextLoss();this.renderer=null;
    this.shipMeshes.clear();this.markerMeshes.clear();this.canvas=null;this.patch=null;this.terrain=null;this.grid=null;
  }
  destroy() {this.releaseRenderer();this.resizeObserver.disconnect();document.removeEventListener('visibilitychange',this.visibility);}
  reloadModels() {for(const mesh of this.shipMeshes.values())this.ships?.remove(mesh);this.shipMeshes.clear();this.refresh();}
  terrainForState() {
    if(this.terrainRevision!==this.political) {
      if(this.terrain){this.scene.remove(this.terrain);this.terrain.traverse(o=>{o.geometry?.dispose();for(const m of [].concat(o.material||[]))m.dispose();});}
      this.terrain=globeTerrain(this.political);this.scene.add(this.terrain);this.terrainRevision=this.political;
      if(this.grid){this.scene.remove(this.grid);this.grid.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
      this.grid=globeGraticule();this.scene.add(this.grid);
    }
    const s=this.current.state;
    this.terrain.traverse(o=>{const id=o.userData?.id,feature=id&&this.political.features.find(f=>f.id===id);if(feature&&o.isMesh&&o.material?.color)o.material.color.set(POWERS[s.world?.control?.[id]||feature.owner]?.color||'#82958a');});
    this.grid.visible=this.cameraState.zoom<512;
  }
  localWater() {
    if(this.cameraState.zoom<64){if(this.patch)this.patch.visible=false;return;}
    if(!this.patch){this.patch=new THREE.Mesh(new THREE.PlaneGeometry(1,1,48,48),this.waterMaterial);this.scene.add(this.patch);}
    this.patch.visible=true;
    const {target,east,north,distance}=this.cameraState,extent=distance*6,position=this.patch.geometry.attributes.position;
    for(let i=0;i<position.count;i++) {const x=(i%49)/48-.5,y=.5-Math.floor(i/49)/48;const p=target.clone().addScaledVector(east,x*extent).addScaledVector(north,y*extent).normalize().multiplyScalar(GLOBE_RADIUS);position.setXYZ(i,p.x,p.y,p.z);}
    position.needsUpdate=true;this.patch.geometry.computeVertexNormals();this.patch.geometry.computeBoundingSphere();
  }
  anchor(row,point) {
    const previous=this.anchorCache.get(row.fleet.id),key=point.map(n=>n.toFixed(5)).join(':')+':'+row.hulls.length;
    if(previous?.key===key)return previous.point;
    const radius=Math.max(800,Math.sqrt(row.hulls.length)*450),degrees=radius/111195;
    const clear=p=>[[0,0],[-1,-1],[-1,1],[1,-1],[1,1]].every(([x,y])=>!pointOnGlobeLand([wrap(p[0]+x*degrees/Math.max(.1,Math.cos(p[1]*Math.PI/180))),clamp(p[1]+y*degrees,-89.8,89.8)],this.political));
    let anchor=point;
    if(!clear(point)) outer:for(let ring=1;ring<=24;ring++)for(let i=0;i<16;i++) {const a=i*Math.PI/8,r=ring*ring*.025;const p=[wrap(point[0]+Math.cos(a)*r/Math.max(.2,Math.cos(point[1]*Math.PI/180))),clamp(point[1]+Math.sin(a)*r,-85,85)];if(clear(p)){anchor=p;break outer;}}
    // Co-located squadrons occupy separate review formations without replacing
    // their geographic positions. All route and supply calculations keep theirs.
    const siblings=[...(this.fleets||[]),...(this.merchants||[])].filter(r=>r.fleet.id!==row.fleet.id&&r.fleet.id<row.fleet.id&&r.fleet.port===row.fleet.port&&r.fleet.departAt===row.fleet.departAt).length;
    if(siblings){const a=siblings*2.399963,d=Math.sqrt(siblings)*radius/111195*2;const p=[wrap(anchor[0]+Math.cos(a)*d),clamp(anchor[1]+Math.sin(a)*d,-85,85)];if(clear(p))anchor=p;}
    this.anchorCache.set(row.fleet.id,{key,point:anchor});return anchor;
  }
  isFront(point) {return point.clone().normalize().dot(this.camera.position.clone().sub(point))>0;}
  project(point) {const p=point.clone().project(this.camera);return [(.5+p.x/2)*this.width,(.5-p.y/2)*this.height,p.z];}
  marker(selection,point,color,size=9,label=false) {
    const world=geoVector(point,GLOBE_RADIUS+.004);if(!this.isFront(world))return;
    const key=selectionKey(selection);let mesh=this.markerMeshes.get(key);
    if(!mesh){mesh=new THREE.Mesh(this.markerGeometry[selection.kind]||this.markerGeometry.contact,new THREE.MeshBasicMaterial({color,depthTest:true,depthWrite:false}));this.markerMeshes.set(key,mesh);this.markers.add(mesh);}
    mesh.visible=true;mesh.position.copy(world);mesh.quaternion.copy(this.camera.quaternion);mesh.material.color.set(color);
    const span=world.distanceTo(this.camera.position)*2*Math.tan(this.camera.fov*Math.PI/360)/this.viewport.height;
    mesh.scale.setScalar(size*span);mesh.userData.selection=selection;
    const [x,y,z]=this.project(world);if(z>1||x<0||y<0||x>this.width||y>this.height)return;
    this.hits.push({...selection,bounds:{x:x-size-3,y:y-size-3,width:size*2+6,height:size*2+6},mesh});
    if(label)this.labels.push({text:selection.label,x:x+size+5,y:y-5,color});
  }
  addLine(points,color,opacity=.65) {
    if(points.length<2)return;const vertices=[];
    for(let i=1;i<points.length;i++){const a=geoVector(points[i-1]).normalize(),b=geoVector(points[i]).normalize(),angle=a.angleTo(b),steps=Math.max(1,Math.ceil(angle/(Math.PI/180)));for(let j=0;j<steps;j++){const p=a.clone().lerp(b,j/steps).normalize().multiplyScalar(GLOBE_RADIUS+.004);vertices.push(p);}}
    vertices.push(geoVector(points.at(-1),GLOBE_RADIUS+.004));
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(vertices),new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));this.lines.add(line);
  }
  updateLines(minute) {
    const s=this.current.state,c=this.chart(),coverage=uiModel(s)?.escortCoverage;
    const detail=this.cameraState.zoom>=SHIP_DETAIL_ZOOM;
    const leaders=detail&&this.cameraState.zoom<8192;
    const key=[this.current.at,c.fleetId,c.convoyId,Math.floor(minute),leaders].join(':');if(key===this.lineKey)return;this.lineKey=key;
    this.lines.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});this.lines.clear();
    for(const escort of coverage?.escorts||[])this.addLine(escortCircle(escort.position),'#74ae95',.32);
    const force=this.current.forces.get(c.convoyId||c.fleetId);if(force)this.addLine(remainingRoute(s,force,Math.max(minute,force.departAt||minute)),'#e9c47d',.85);
    if(leaders)for(const row of [...(this.fleets||[]),...(this.merchants||[])]) {
      if(row.fleet.id!==force?.id)continue;
      const visual=visualFleet(this.previous,this.current,row.fleet.id,minute)||row.fleet;
      const point=fleetPosition(s,visual,minute),anchor=this.anchor(row,point);
      if(geoVector(point).distanceTo(geoVector(anchor))>.0001)this.addLine([point,anchor],'#bed1c4',.4);
    }
  }
  paint(now) {
    if(!this.ready||this.contextLost||!this.current||document.hidden)return;
    const started=performance.now(),s=this.current.state,c=this.chart();
    this.cameraState=applyGlobeCamera(this.camera,c,this.viewport.width/this.viewport.height);
    this.sun.position.copy(this.camera.position).addScaledVector(this.cameraState.north,80);
    this.terrainForState();this.localWater();
    this.frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse));
    this.hits=[];this.labels=[];for(const m of this.markerMeshes.values())m.visible=false;for(const m of this.shipMeshes.values())m.visible=false;
    const detail=this.cameraState.zoom>=SHIP_DETAIL_ZOOM,minute=visualMinute(this.previous,this.current,now),coverage=uiModel(s)?.escortCoverage;
    this.updateLines(minute);
    for(const [id,port] of Object.entries(PORTS)){const p=PORT_LOCATIONS[id]||NODES[id];if(p)this.marker({kind:'port',id,label:port.name},p,POWERS[s.world?.portControl?.[id]||port.nation]?.color||'#bfd6cc',5,!detail&&this.cameraState.zoom>2);}
    if(!detail)for(const [id,capital]of Object.entries(MAP_CAPITALS))this.marker({kind:'country',id,label:capital.name},capital.point,'#e5cf9d',6,this.cameraState.zoom<5);
    for(const front of s.world?.fronts||[])if(front.progress>0&&front.progress<1)this.marker({kind:'front',id:front.id,label:front.name},frontPosition(front),'#eb937b',8,!detail);
    for(const contact of visibleContacts(s))this.marker({kind:'contact',id:contact.id,label:`${contact.nation} · ${contact.stage} report`},contact.position,'#e4a48b',7,detail||contact.id===c.contactId);
    for(const row of [...(this.fleets||[]),...(this.merchants||[])]) {
      const force=visualFleet(this.previous,this.current,row.fleet.id,minute)||row.fleet,point=fleetPosition(s,force,minute),merchant=!!row.merchant;
      const selected=row.fleet.id===(merchant?c.convoyId:c.fleetId);
      if(!detail){const covered=merchant&&coverageAt(coverage?.escorts||[],point).defense>0;
        this.marker({kind:merchant?'convoy':'fleet',id:force.id,label:`${force.name} · ${row.hulls.length} ${merchant?'merchants':'ships'}`},point,selected?'#eaca84':merchant?(covered?'#96c6a3':'#dbab83'):(PROFILES[s.player]?.color||'#bbd0cb'),merchant?6:9,selected||this.cameraState.zoom>4);continue;}
      const anchor=this.anchor(row,point),origin=geoVector(anchor),frame=tangentFrame(anchor);row.anchor=anchor;
      if(!this.isFront(origin)||origin.distanceTo(this.cameraState.target)>this.cameraState.distance*8+.15)continue;
      const basis=new THREE.Matrix4().makeBasis(frame.east,frame.up,frame.north.clone().negate());
      for(const hull of row.hulls) {
        const model=voxelModelFor(hull.classId,{campaign:s.campaignId,type:merchant?'AK':this.content.classes[hull.classId]?.type||'DD'});
        const position=origin.clone().addScaledVector(frame.east,hull.offset[0]/2.75*600*METRES_TO_GLOBE).addScaledVector(frame.north,hull.offset[1]/1.7*420*METRES_TO_GLOBE).normalize().multiplyScalar(GLOBE_RADIUS+.00001);
        const radius=model.dimensions.length*METRES_TO_GLOBE;
        if(!this.frustum.intersectsSphere(new THREE.Sphere(position,radius)))continue;
        let mesh=this.shipMeshes.get(hull.key);
        if(mesh&&mesh.userData.voxelModelId!==model.id){this.ships.remove(mesh);this.shipMeshes.delete(hull.key);mesh=null;}
        if(!mesh){mesh=createVoxelMesh(model);mesh.userData.sharedVoxel=true;this.shipMeshes.set(hull.key,mesh);this.ships.add(mesh);}
        mesh.visible=true;mesh.position.copy(position);mesh.quaternion.setFromRotationMatrix(basis);mesh.scale.setScalar(METRES_TO_GLOBE);mesh.updateMatrixWorld();
        const selection={kind:merchant?'merchant':'ship',id:merchant?force.id:hull.groupId,hullIndex:hull.hullIndex,classId:hull.classId,nation:s.player,fleetId:merchant?undefined:force.id,convoyId:merchant?force.id:undefined,label:hull.label,key:hull.key};
        mesh.userData.selection=selection;
        const bounds=this.meshBounds(mesh);if(!bounds)continue;
        const part=model.parts.reduce((best,p)=>p.w*p.d*p.h>best.w*best.d*best.h?p:best);
        const point=this.project(new THREE.Vector3(part.x,part.z+part.h/2,part.y).applyMatrix4(mesh.matrixWorld));
        this.hits.push({...selection,bounds,mesh,point});
        if(this.cameraState.zoom>=8192||this.selectedHull===hull.key||this.hoverSelection?.key===hull.key)this.labels.push({text:hull.label,x:bounds.x,y:bounds.y-6,color:this.selectedHull===hull.key?'#edcf8c':'#d8e1d8'});
      }
    }
    this.renderer.render(this.scene,this.camera);this.renderAccessible();this.renderLabels();
    const level=this.root.querySelector('.map-legend .isometric-level');if(level)level.textContent=`Zoom ${this.cameraState.zoom.toFixed(1)}×`;
    Object.assign(this.canvas.dataset,{renderer:'webgl2',lod:detail?'fleet':'strategic',zoom:String(this.cameraState.zoom),worldRotation:String(this.cameraState.longitude),worldLatitude:String(this.cameraState.latitude),cameraHeading:String(this.cameraState.heading),cameraTilt:String(this.cameraState.tilt),grid:'geographic',visibleHulls:String(this.hits.filter(h=>h.kind==='ship').length),visibleMerchants:String(this.hits.filter(h=>h.kind==='merchant').length),totalHulls:String((this.fleets||[]).reduce((n,r)=>n+r.hulls.length,0)),totalMerchants:String((this.merchants||[]).reduce((n,r)=>n+r.hulls.length,0)),sceneFrames:String(++this.frames),sceneCpuMs:(performance.now()-started).toFixed(2),drawCalls:String(this.renderer.info.render.calls)});
    this.lastPaint=now;
  }
  meshBounds(mesh) {
    if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();const box=mesh.geometry.boundingBox,points=[];
    for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])points.push(this.project(new THREE.Vector3(x,y,z).applyMatrix4(mesh.matrixWorld)));
    if(points.every(p=>p[2]>1||p[2]<-1))return null;
    const x=Math.min(...points.map(p=>p[0])),y=Math.min(...points.map(p=>p[1])),right=Math.max(...points.map(p=>p[0])),bottom=Math.max(...points.map(p=>p[1]));
    if(right<0||bottom<0||x>this.width||y>this.height)return null;return{x,y,width:right-x,height:bottom-y};
  }
  renderLabels() {
    const boxes=[],visible=[];
    for(const label of this.labels){const b={x:label.x,y:label.y,width:label.text.length*5.7,height:15};if(b.x<0||b.y<0||b.x+b.width>this.width||b.y>this.height||boxes.some(a=>b.x<a.x+a.width&&b.x+b.width>a.x&&b.y<a.y+a.height&&b.y+b.height>a.y))continue;boxes.push(b);visible.push(`<span style="left:${b.x.toFixed(1)}px;top:${b.y.toFixed(1)}px;color:${label.color}">${esc(label.text)}</span>`);}
    this.surface.querySelector('.globe-labels').innerHTML=visible.join('');
  }
  renderAccessible() {
    this.accessibleTargets=new Map(this.hits.map((h,i)=>[String(i),h]));const node=this.surface.querySelector('.isometric-accessibility');
    const key=this.hits.map(h=>selectionKey(h)).join('|');
    if(key!==this.accessibleKey){this.accessibleKey=key;node.innerHTML=this.hits.map((h,i)=>`<button type="button" data-iso-target="${i}" data-iso-kind="${h.kind}" data-id="${esc(h.id)}" ${h.hullIndex===undefined?'':`data-hull-index="${h.hullIndex}"`} aria-label="${esc(h.label)}">${esc(h.label)}</button>`).join('');}
    for(const button of node.children){const h=this.accessibleTargets.get(button.dataset.isoTarget);Object.assign(button.style,{left:h.bounds.x+'px',top:h.bounds.y+'px',width:Math.max(8,h.bounds.width)+'px',height:Math.max(8,h.bounds.height)+'px'});const point=h.point||[h.bounds.x+h.bounds.width/2,h.bounds.y+h.bounds.height/2];button.dataset.isoX=point[0].toFixed(2);button.dataset.isoY=point[1].toFixed(2);}
  }
  local(event) {const r=this.canvas.getBoundingClientRect();return[event.clientX-r.left,event.clientY-r.top];}
  pick(point,terrain=true) {
    this.raycaster.setFromCamera(new THREE.Vector2(point[0]/this.width*2-1,1-point[1]/this.height*2),this.camera);
    const candidates=[...this.shipMeshes.values(),...this.markerMeshes.values()].filter(m=>m.visible);
    const seaHit=this.raycaster.ray.intersectSphere(sphere,new THREE.Vector3()),seaDistance=seaHit?this.camera.position.distanceTo(seaHit):Infinity;
    const hit=this.raycaster.intersectObjects(candidates,false).find(h=>h.distance<=seaDistance+.006);
    if(hit)return hit.object.userData.selection;
    if(terrain){const land=this.raycaster.intersectObject(this.terrain,true).find(h=>h.object.userData.kind==='territory'&&h.distance<=seaDistance+.02);if(land?.object.userData.id)return {...land.object.userData,kind:'territory'};}
    return null;
  }
  hover(selection,event) {
    const key=selectionKey(selection);this.canvas.style.cursor=selection?'pointer':'grab';if(this.hoverKey===key)return;
    this.hoverKey=key;this.hoverSelection=selection;this.onHover(selection,{clientX:event.clientX,clientY:event.clientY});
  }
  pointerDown(event) {
    if(![0,2].includes(event.button)||!this.active())return;event.preventDefault();this.canvas.focus({preventScroll:true});
    this.drag={id:event.pointerId,point:this.local(event),last:this.local(event),orbit:event.button===2||event.shiftKey,moved:false};
    this.drag.anchor=globeRayPoint(this.raycaster,this.camera,this.pointer(this.drag.point));
    this.canvas.setPointerCapture(event.pointerId);this.hover(null,event);
  }
  pointerMove(event) {
    if(!this.active())return;const point=this.local(event);
    if(!this.drag||this.drag.id!==event.pointerId){this.hover(this.pick(point),event);return;}
    if(!this.drag.moved&&Math.hypot(point[0]-this.drag.point[0],point[1]-this.drag.point[1])<4)return;
    this.drag.moved=true;const dx=point[0]-this.drag.last[0],dy=point[1]-this.drag.last[1],c=this.chart();this.drag.last=point;
    if(this.drag.orbit){c.globeHeading=wrap((c.globeHeading||0)+dx*.35);c.globeTilt=clamp((c.globeTilt??42)+dy*.3,0,72);}
    else if(this.drag.anchor)this.cameraState=anchorGlobePoint(this.raycaster,this.camera,c,this.pointer(point),this.drag.anchor,this.viewport.width/this.viewport.height);
    else {const angle=(c.globeHeading||0)*Math.PI/180,units=this.cameraState.distance*2*Math.tan(this.camera.fov*Math.PI/360)/this.viewport.height;moveGlobe(c,(-dx*Math.cos(angle)-dy*Math.sin(angle))*units,(dy*Math.cos(angle)-dx*Math.sin(angle))*units);}
    this.hoverKey='';this.canvas.style.cursor='grabbing';this.paint(performance.now());
  }
  pointerUp(event,cancelled=false) {
    if(!this.drag||this.drag.id!==event.pointerId)return;const moved=this.drag.moved,orbit=this.drag.orbit;this.drag=null;
    if(this.canvas.hasPointerCapture(event.pointerId))this.canvas.releasePointerCapture(event.pointerId);
    this.canvas.style.cursor='grab';if(moved)this.commitCamera();else if(!cancelled&&!orbit){const hit=this.pick(this.local(event));clearTimeout(this.selectTimer);if(hit)this.selectTimer=setTimeout(()=>this.select(hit),210);}
  }
  select(selection) {if(!selection)return;if(['ship','merchant'].includes(selection.kind))this.selectedHull=selection.key;this.onSelect({...selection});}
  pointer(point) {return new THREE.Vector2(point[0]/this.width*2-1,1-point[1]/this.height*2);}
  zoomAt(point,next) {
    // Keep the surface location under the cursor while traversing all scales.
    const ndc=this.pointer(point),before=globeRayPoint(this.raycaster,this.camera,ndc);
    this.chart().zoom=clamp(next,1,MAX_GLOBE_ZOOM);
    this.cameraState=anchorGlobePoint(this.raycaster,this.camera,this.chart(),ndc,before,this.viewport.width/this.viewport.height);
    this.paint(performance.now());
  }
  wheel(event) {if(!this.active())return;event.preventDefault();this.hover(null,event);this.zoomAt(this.local(event),this.chart().zoom*Math.exp(-clamp(event.deltaY,-160,160)*.003));clearTimeout(this.cameraTimer);this.cameraTimer=setTimeout(()=>this.commitCamera(),180);}
  doubleClick(event) {if(!this.active())return;event.preventDefault();clearTimeout(this.selectTimer);const hit=this.pick(this.local(event),false);if(['fleet','convoy'].includes(hit?.kind)){this.focus(hit.kind,hit.id,{zoom:true});this.onSelect({...hit,zoom:true});}else if(['ship','merchant'].includes(hit?.kind))this.select(hit);else{this.zoomAt(this.local(event),this.chart().zoom*2);this.commitCamera();}}
  keydown(event) {
    if(!this.active())return;const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]};
    if(directions[event.key]){event.preventDefault();event.stopPropagation();const [x,y]=directions[event.key];moveGlobe(this.chart(),x*this.cameraState.distance*.12,y*this.cameraState.distance*.12);this.paint(performance.now());this.commitCamera();}
    else if(['Home','PageUp','PageDown'].includes(event.key)){event.preventDefault();event.stopPropagation();if(event.key==='Home'){resetGlobe(this.chart());this.selectedHull=null;this.paint(performance.now());}else this.zoomAt([this.viewport.x+this.viewport.width/2,this.viewport.y+this.viewport.height/2],this.chart().zoom*(event.key==='PageUp'?1.6:1/1.6));this.commitCamera();}
  }
  focus(kind,id,{zoom=false}={}) {
    if(!this.current)return false;const point=chartPosition(this.current.state,this.political,kind,id);if(!point)return false;
    let target=point;const row=[...(this.fleets||[]),...(this.merchants||[])].find(r=>r.fleet.id===id);
    if(row&&(zoom||this.chart().zoom>=SHIP_DETAIL_ZOOM))target=this.anchor(row,point);
    Object.assign(this.chart(),{rotation:target[0],globeLongitude:target[0],globeLatitude:target[1],focusPoint:[...point]});
    if(zoom)this.chart().zoom=Math.max(FLEET_FOCUS_ZOOM,this.chart().zoom||1);
    this.refresh();this.commitCamera();return true;
  }
  commitCamera() {this.onCameraChange({...this.chart()});}
}
