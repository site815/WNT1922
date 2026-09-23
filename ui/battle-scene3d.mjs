import * as THREE from './vendor/three/three.module.js';
import { createVoxelMesh } from './three-vessels.mjs';
import { voxelModelFor } from './voxel-models.mjs';
import { watchFrame, battleInstances } from './battle-watch.mjs';
import { PROFILES } from '../mechanics/catalog.mjs';

const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
const corners = box => [box.min.x,box.max.x].flatMap(x => [box.min.y,box.max.y].flatMap(y => [box.min.z,box.max.z].map(z => new THREE.Vector3(x,y,z))));
// Undo the old review-plane projection. The underlying formation is now placed
// in real X/Z water space and viewed by a freely orbitable perspective camera.
export function battlePosition3D(unit) {
  return [(unit.point[0] / .866 + unit.point[1] / .5) / 2, 0,
    (unit.point[1] / .5 - unit.point[0] / .866) / 2];
}

// Fit the actual projected box instead of a bounding sphere. A flat formation
// is much wider than it is tall; fitting its enclosing sphere to a wide canvas
// otherwise wastes most of the viewport. Margin also leaves room for the title
// demo's 1.25× introductory zoom without clipping its hulls.
export function battleFitDistance(bounds,aspect,{yaw=-.42,pitch=.72,fov=40,margin=.74}={}) {
  const center=bounds.getCenter(new THREE.Vector3()),target=new THREE.Vector3(center.x,12,center.z);
  const direction=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
  const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  const up=new THREE.Vector3(-Math.sin(yaw)*Math.sin(pitch),Math.cos(pitch),-Math.cos(yaw)*Math.sin(pitch));
  const vertical=Math.tan(THREE.MathUtils.degToRad(fov/2))*margin,horizontal=vertical*aspect;
  return Math.max(350,...corners(bounds).flatMap(point=>{
    const p=point.sub(target),depth=p.dot(direction);
    return [depth+Math.abs(p.dot(right))/horizontal,depth+Math.abs(p.dot(up))/vertical];
  }));
}

export class BattleScene3D {
  constructor({root,onSelect = () => {},rendererFactory = options => new THREE.WebGLRenderer(options)}) {
    Object.assign(this,{root,onSelect,rendererFactory});
    this.zoom=1;this.pan=[0,0];this.yaw=-.42;this.pitch=.72;
    this.hits=[];this.frame=null;this.nodes=new Map();this.raycaster=new THREE.Raycaster();
    this.waterPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
  }
  clear() {
    if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(this.raf);
    this.raf=null;this.events?.abort();this.events=null;
    this.disposeScene();
    this.overlay?.remove();this.overlay=null;
    this.canvas=null;this.report=null;this.frame=null;this.previous=null;this.drag=null;this.hits=[];this.view=null;
  }
  disposeScene() {
    for(const node of this.nodes.values()) node.mesh.material.dispose();
    this.nodes.clear();
    for(const object of [this.sea,this.selectionRing,this.impactRing]) {object?.geometry.dispose();object?.material.dispose();}
    this.smokeGeometry?.dispose();this.smokeMaterial?.dispose();
    this.renderer?.dispose();this.renderer?.forceContextLoss?.();this.renderer=null;this.scene=null;this.camera=null;this.sea=null;
    this.selectionRing=null;this.impactRing=null;this.smokeGeometry=null;this.smokeMaterial=null;
  }
  refresh(report,campaign,frameIndex=null,selected=null) {
    const canvas=this.root.querySelector('.battle-canvas');
    if(!canvas || !report) {this.clear();return;}
    const current=watchFrame(report,frameIndex),newReport=this.report?.id!==report.id;
    const changed=newReport || this.frameIndex!==current.index || ['at','stage','round','status'].some(key=>this.frame?.[key]!==current.frame[key]);
    if(newReport) {this.zoom=1;this.pan=[0,0];this.yaw=-.42;this.pitch=.72;this.previous=null;this.initialBounds=null;}
    else if(changed) this.previous=this.frame;
    this.report=report;this.campaign=campaign;this.frame=current.frame;this.frameIndex=current.index;this.selected=selected;
    if(this.canvas!==canvas) {this.events?.abort();this.disposeScene();this.overlay?.remove();this.canvas=canvas;this.bind(canvas);}
    if(changed) this.started=performance.now();
    this.draw(performance.now());
  }
  bind(canvas) {
    this.renderer=this.rendererFactory({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(2,globalThis.devicePixelRatio || 1));
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#64818d');
    this.scene.fog=new THREE.Fog('#64818d',9000,38000);
    this.camera=new THREE.PerspectiveCamera(40,1,1,60000);
    this.scene.add(new THREE.HemisphereLight('#e6f1f8','#35464c',2));
    const sun=new THREE.DirectionalLight('#fff0d2',2.5);sun.position.set(-700,1700,500);this.scene.add(sun);
    this.sea=new THREE.Mesh(new THREE.PlaneGeometry(150000,150000),new THREE.MeshStandardMaterial({color:'#254f60',roughness:.6,metalness:.18}));
    this.sea.rotation.x=-Math.PI/2;this.sea.position.y=-.5;this.scene.add(this.sea);
    const ring=()=>{const mesh=new THREE.Mesh(new THREE.RingGeometry(1,1.035,64),new THREE.MeshBasicMaterial({color:'#f0cc77',transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide}));mesh.rotation.x=-Math.PI/2;mesh.visible=false;this.scene.add(mesh);return mesh;};
    this.selectionRing=ring();this.impactRing=ring();this.impactRing.material.color.set('#ffc274');
    this.smokeGeometry=new THREE.SphereGeometry(1,8,6);
    this.smokeMaterial=new THREE.MeshBasicMaterial({color:'#334047',transparent:true,opacity:.55,depthWrite:false});
    if(canvas.parentElement && typeof document!=='undefined') {
      canvas.parentElement.style.position='relative';
      this.overlay=document.createElement('div');this.overlay.className='battle-scene3d-overlay';
      Object.assign(this.overlay.style,{position:'absolute',overflow:'hidden',pointerEvents:'none'});canvas.parentElement.append(this.overlay);
    }
    this.events=new AbortController();const options={signal:this.events.signal};
    canvas.addEventListener('contextmenu',event=>event.preventDefault(),options);
    canvas.addEventListener('wheel',event=>{
      event.preventDefault();const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top,before=this.waterPoint(x,y);
      this.zoom=clamp(this.zoom*(event.deltaY<0?1.2:1/1.2),.6,16);this.updateCamera();
      const after=this.waterPoint(x,y);if(before&&after) {this.pan[0]+=before.x-after.x;this.pan[1]+=before.z-after.z;}
      this.draw(performance.now());
    },{...options,passive:false});
    canvas.addEventListener('pointerdown',event=>{
      if(event.button!==0 && event.button!==2) return;
      canvas.setPointerCapture(event.pointerId);this.drag={x:event.clientX,y:event.clientY,pan:[...this.pan],yaw:this.yaw,pitch:this.pitch,orbit:event.button===2||event.shiftKey,moved:false};
    },options);
    canvas.addEventListener('pointermove',event=>{
      if(this.drag) {
        const dx=event.clientX-this.drag.x,dy=event.clientY-this.drag.y;
        if(Math.hypot(dx,dy)>4)this.drag.moved=true;
        if(this.drag.moved) {
          if(this.drag.orbit) {this.yaw=this.drag.yaw-dx*.008;this.pitch=clamp(this.drag.pitch+dy*.006,.15,1.45);}
          else {const scale=1/(this.view?.scale || 1),c=Math.cos(this.yaw),s=Math.sin(this.yaw);this.pan=[this.drag.pan[0]-dx*scale*c-dy*scale*s,this.drag.pan[1]+dx*scale*s-dy*scale*c];}
          this.draw(performance.now());
        }
      }
      const rect=canvas.getBoundingClientRect();canvas.style.cursor=this.drag?.moved?'grabbing':this.hit(event.clientX-rect.left,event.clientY-rect.top)?'pointer':'grab';
    },options);
    canvas.addEventListener('pointerup',event=>{
      if(!this.drag)return;
      if(!this.drag.moved&&!this.drag.orbit) {const rect=canvas.getBoundingClientRect(),unit=this.hit(event.clientX-rect.left,event.clientY-rect.top);if(unit)this.onSelect({side:unit.side,id:unit.id,hullIndex:unit.hullIndex});}
      this.drag=null;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
    },options);
    canvas.addEventListener('pointercancel',()=>{this.drag=null;},options);
    canvas.addEventListener('keydown',event=>{if(event.key==='Home'){event.preventDefault();this.fit();}},options);
  }
  fit() {this.zoom=1;this.pan=[0,0];this.yaw=-.42;this.pitch=.72;this.draw(performance.now());}
  focus(side,id,hullIndex=0) {
    const unit=battleInstances(this.frame,this.report.startedAt).find(u=>u.side===side&&u.id===id&&u.hullIndex===hullIndex);
    if(!unit||!this.view)return;
    const p=battlePosition3D(unit);this.pan=[p[0]-this.view.cx,p[2]-this.view.cy];this.zoom=Math.max(2.5,this.zoom);this.draw(performance.now());
  }
  updateCamera() {
    if(!this.camera||!this.view)return;
    const target=new THREE.Vector3(this.view.cx+this.pan[0],12,this.view.cy+this.pan[1]),distance=this.view.distance/this.zoom;
    this.camera.position.set(target.x+Math.sin(this.yaw)*Math.cos(this.pitch)*distance,target.y+Math.sin(this.pitch)*distance,target.z+Math.cos(this.yaw)*Math.cos(this.pitch)*distance);
    this.camera.lookAt(target);this.camera.updateMatrixWorld(true);
    this.view.scale=this.height/(2*distance*Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2)));
  }
  waterPoint(x,y) {
    if(!this.camera||!this.width||!this.height)return null;
    this.raycaster.setFromCamera(new THREE.Vector2(x/this.width*2-1,1-y/this.height*2),this.camera);
    return this.raycaster.ray.intersectPlane(this.waterPlane,new THREE.Vector3());
  }
  hit(x,y) {
    if(!this.camera||!this.width||!this.height)return null;
    this.raycaster.setFromCamera(new THREE.Vector2(x/this.width*2-1,1-y/this.height*2),this.camera);
    const hit=this.raycaster.intersectObjects([...this.nodes.values()].map(node=>node.mesh),false)[0];
    return hit?.object.userData.unit || null;
  }
  project(position) {
    const p=position.clone().project(this.camera);
    return {x:(p.x+1)*this.width/2,y:(1-p.y)*this.height/2,z:p.z};
  }
  positionOverlay(rect) {
    const parent=this.canvas?.parentElement;
    if(!this.overlay||!parent)return;
    // updateDOM preserves the canvas children but replaces the stage's style
    // attribute. Re-establish the containing block on every refreshed draw.
    parent.style.position='relative';
    const outer=parent.getBoundingClientRect();
    Object.assign(this.overlay.style,{left:(rect.left-outer.left-(parent.clientLeft||0)+(parent.scrollLeft||0))+'px',
      top:(rect.top-outer.top-(parent.clientTop||0)+(parent.scrollTop||0))+'px',width:rect.width+'px',height:rect.height+'px'});
  }
  draw(now) {
    cancelAnimationFrame(this.raf);this.raf=null;
    const canvas=this.canvas;if(!canvas?.isConnected||!this.frame||!this.renderer)return;
    const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
    this.positionOverlay(rect);
    if(this.width!==rect.width||this.height!==rect.height) {this.width=rect.width;this.height=rect.height;this.renderer.setSize(rect.width,rect.height,false);}
    this.camera.aspect=this.width/this.height;this.camera.updateProjectionMatrix();
    const units=battleInstances(this.frame,this.report.startedAt),prior=this.previous&&new Map(battleInstances(this.previous,this.report.startedAt).map(u=>[u.key,u]));
    const progress=clamp((now-(this.started||0))/950,0,1),t=1-(1-progress)**3,alive=new Set(units.map(u=>u.key));
    let modelChanged=false;
    for(const [key,node] of this.nodes)if(!alive.has(key)){this.scene.remove(node.group);node.mesh.material.dispose();this.nodes.delete(key);}
    for(const unit of units) {
      const model=voxelModelFor(unit.classId,{campaign:this.campaign,type:unit.type});let node=this.nodes.get(unit.key);
      if(!node||node.model!==model) {
        modelChanged=true;
        if(node){this.scene.remove(node.group);node.mesh.material.dispose();}
        const mesh=createVoxelMesh(model);mesh.material=mesh.material.clone();const group=new THREE.Group();group.add(mesh);this.scene.add(group);
        const smoke=[];for(let i=0;i<3;i++){const puff=new THREE.Mesh(this.smokeGeometry,this.smokeMaterial);puff.scale.setScalar(4+i*2);puff.position.set(i*3,model.dimensions.height*.6+12+i*9,0);group.add(puff);smoke.push(puff);}
        node={model,mesh,group,smoke};this.nodes.set(unit.key,node);
      }
      node.unit=unit;node.mesh.userData.unit=unit;
      const position=battlePosition3D(unit),before=prior?.get(unit.key),previous=before&&battlePosition3D(before);
      node.group.position.set(...position.map((v,i)=>previous?previous[i]+(v-previous[i])*t:v));node.group.rotation.y=-unit.heading;
      node.mesh.material.transparent=Boolean(unit.sunkHull);node.mesh.material.opacity=unit.sunkHull?.24:1;node.mesh.material.depthWrite=!unit.sunkHull;
      node.mesh.material.emissive.set(unit.health<.6&&!unit.sunkHull?'#30150c':'#000000');
      node.smoke.forEach(puff=>{puff.visible=!unit.sunkHull&&unit.health<.9;});
    }
    if(!this.initialBounds||modelChanged) {
      this.initialBounds=new THREE.Box3();
      for(const unit of battleInstances(watchFrame(this.report,0).frame,this.report.startedAt)) {
        const p=battlePosition3D(unit),model=voxelModelFor(unit.classId,{campaign:this.campaign,type:unit.type});
        this.initialBounds.expandByPoint(new THREE.Vector3(p[0]-model.dimensions.length/2,0,p[2]-model.dimensions.beam/2));
        this.initialBounds.expandByPoint(new THREE.Vector3(p[0]+model.dimensions.length/2,model.dimensions.height,p[2]+model.dimensions.beam/2));
      }
      if(this.initialBounds.isEmpty())this.initialBounds.set(new THREE.Vector3(-450,0,-250),new THREE.Vector3(450,50,250));
    }
    const center=this.initialBounds.getCenter(new THREE.Vector3());
    this.view={cx:center.x,cy:center.z,distance:battleFitDistance(this.initialBounds,this.camera.aspect),scale:1};this.updateCamera();
    this.selectionRing.visible=false;this.impactRing.visible=false;this.scene.updateMatrixWorld(true);
    for(const node of this.nodes.values()) {
      const unit=node.unit,selected=this.selected?.side===unit.side&&this.selected.id===unit.id&&(this.selected.hullIndex||0)===unit.hullIndex;
      if(selected){this.selectionRing.visible=true;this.selectionRing.position.set(node.group.position.x,.3,node.group.position.z);this.selectionRing.scale.set(node.model.dimensions.length*.6,node.model.dimensions.beam*.9,1);}
      const before=prior?.get(unit.key);
      if(progress>.5&&progress<1&&before&&(unit.health<before.health||unit.sunkHull&&!before.sunkHull)){
        this.impactRing.visible=true;this.impactRing.position.set(node.group.position.x,.5,node.group.position.z);this.impactRing.scale.setScalar(18+progress*35);this.impactRing.material.opacity=1-progress;
      }
    }
    this.renderer.render(this.scene,this.camera);this.hits=[];
    for(const node of this.nodes.values()) {
      const bounds=new THREE.Box3().setFromObject(node.mesh),projected=corners(bounds).map(p=>this.project(p));
      if(projected.every(p=>p.z>1||p.z< -1))continue;
      const x=Math.min(...projected.map(p=>p.x)),y=Math.min(...projected.map(p=>p.y)),right=Math.max(...projected.map(p=>p.x)),bottom=Math.max(...projected.map(p=>p.y));
      if(right<0||bottom<0||x>this.width||y>this.height)continue;
      const box={x,y,width:right-x,height:bottom-y};
      // Publish a point on the actual mesh for keyboard-roster/browser use;
      // a tall mast's bounding-box centre can otherwise lie in empty air.
      let point=null;
      const candidates=node.model.parts.filter(p=>['bridge','deck','flight-deck','wheelhouse'].includes(p.role)).sort((a,b)=>b.w*b.d-a.w*a.d);
      for(const part of candidates){const p=this.project(new THREE.Vector3(part.x,part.z+part.h,part.y).applyMatrix4(node.mesh.matrixWorld));if(p.x>=0&&p.y>=0&&p.x<this.width&&p.y<this.height&&this.hit(p.x,p.y)?.key===node.unit.key){point={x:p.x,y:p.y};break;}}
      this.hits.push({unit:node.unit,box,point});
    }
    this.drawOverlay();
    Object.assign(canvas.dataset,{renderer:'webgl',projection:'perspective',hullCount:String(units.length),frameAt:String(this.frame.at),frameIndex:String(this.frameIndex),visibleHulls:String(this.hits.length),zoom:this.zoom.toFixed(3),yaw:this.yaw.toFixed(3),pitch:this.pitch.toFixed(3)});
    if(progress<1)this.raf=requestAnimationFrame(time=>this.draw(time));
  }
  drawOverlay() {
    if(!this.overlay)return;
    const labels=[];
    const label=(text,x,y,color='#e6eee9',size=11)=>{const span=document.createElement('span');span.textContent=text;Object.assign(span.style,{position:'absolute',left:x+'px',top:y+'px',font:`${size}px "Segoe UI",sans-serif`,color,textShadow:'0 1px 3px #00131b',whiteSpace:'nowrap'});labels.push(span);};
    label(PROFILES[this.report.a]?.name||this.report.a,14,12,'#e9eee6',12);
    const right=document.createElement('span');right.textContent=PROFILES[this.report.b]?.name||this.report.b;Object.assign(right.style,{position:'absolute',right:'14px',top:'12px',color:'#e9eee6',font:'12px "Segoe UI",sans-serif',textShadow:'0 1px 3px #00131b'});labels.push(right);
    for(const hit of this.hits){const selected=this.selected?.side===hit.unit.side&&this.selected.id===hit.unit.id&&(this.selected.hullIndex||0)===hit.unit.hullIndex;if(selected||hit.box.width>75)label(hit.unit.name,Math.max(4,hit.box.x),Math.max(30,hit.box.y-16),selected?'#f2d488':'#d9e7e3',selected?12:10);}
    if(this.report.airOperation){const count=(this.frame.aircraftA||[]).reduce((sum,wing)=>sum+(wing.count||0),0);label(`${count} recorded aircraft · ship positions illustrative`,14,this.height-25,'#e7cd88');}
    else if(this.report.portId)label('Shore action · '+this.report.portId.replaceAll('_',' '),14,this.height-25,'#e7cd88');
    this.overlay.replaceChildren(...labels);
  }
}
