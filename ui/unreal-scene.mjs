import { ownFormationScene } from './fleet-formation.mjs';
import { buildUnrealScenePacket, buildUnrealSelectionPacket } from './unreal-scene-packet.mjs';
import { chartPosition } from './map-focus.mjs';
import { watchFrame, battleInstances } from './battle-watch.mjs';
import { battleVisualEvents } from './battle-events.mjs';
import { receiveNativePerformance } from './native-performance.mjs';
import { unrealTacticalPacket, tacticalSceneSnapshot } from './tactical-scene-packet.mjs';
import { BattleAudioController } from './battle-audio.mjs';
export { unrealTacticalPacket } from './tactical-scene-packet.mjs';

export const UNREAL_MODE = globalThis.location?.search != null && new URLSearchParams(globalThis.location.search).get('unreal') === '1';
const scenes = new Map();
let activeScene = null, nextId = 0, bridgePromise;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function reportError(message) {
  const element = globalThis.document?.querySelector('#toast');
  if (element) {element.textContent = message; element.style.display = 'block';}
  console.error('Unreal:', message);
}

function bridge() {
  if (globalThis.ue?.wnt) return Promise.resolve(globalThis.ue.wnt);
  return bridgePromise ||= new Promise((resolve, reject) => {
    const start = performance.now();
    const check = () => {
      if (globalThis.ue?.wnt) resolve(globalThis.ue.wnt);
      else if (performance.now() - start > 15000) reject(new Error('The Unreal scene bridge is unavailable. Open this mode from the native game.'));
      else setTimeout(check, 50);
    };
    check();
  });
}

function send(method, packet) {
  return bridge().then(native => {
    if (typeof native[method] !== 'function') throw new Error('The native game does not support ' + method);
    return native[method](JSON.stringify(packet));
  }).catch(error => reportError(error.message));
}

// The title is a static mode chooser. Hide the native viewport even before a
// scene has ever been activated, so no boot-time battle/world remains behind it.
export function hideNativePresentation() {
  activeScene?.suspend();
  document.documentElement.dataset.unrealScene='hidden';
  return send('viewport',{instanceId:'title-menu',mode:'hidden',x:0,y:0,width:1,height:1});
}

if (UNREAL_MODE) {
  document.documentElement.classList.add('unreal-mode');
  globalThis.WNTUnreal = {
    receive(event) {
      if (event.type === 'error') { reportError(event.message); return; }
      if (event.type === 'performance') { receiveNativePerformance(event); return; }
      const scene = scenes.get(event.instanceId);
      if (!scene || scene !== activeScene) return;
      if (event.type === 'select' && event.selection) scene.onSelect({...event.selection,zoom:!!event.zoom});
      if (event.type === 'hover') scene.receiveHover(event);
      if (event.type === 'camera') scene.cameraChanged?.(event);
    },
  };
}

// The transparent canvas is an input surface only. Unreal renders the world,
// water, lighting and every mesh underneath CEF; no WebGL context is created.
class NativeScene {
  constructor({root, onSelect = () => {}, onHover = () => {}}) {
    Object.assign(this, {root, onSelect, onHover});
    this.instanceId = 'native-' + ++nextId; scenes.set(this.instanceId, this);
    this.hits = []; this.zoom = 1; this.pan = [0, 0]; this.raf = null;
    this.hoverSequence = 0; this.hoverRequestId = null;
  }
  input(action, values = {}) {
    if (['zoom','pan','tilt','home','focus','fit-force'].includes(action) && this.hoverRequestId != null) this.dismissHover();
    return send('sceneinput', {instanceId:this.instanceId, action, ...values});
  }
  cancelHover() { clearTimeout(this.hoverTimer); this.hoverTimer = null; this.pendingHover = null; this.hoverRequestId = null; }
  cancelWheel() { if(this.wheelFrame!=null)cancelAnimationFrame(this.wheelFrame);this.wheelFrame=null;this.pendingWheel=null; }
  queueWheel(values) {
    this.pendingWheel={...values,delta:values.delta+(this.pendingWheel?.delta||0)};
    if(this.wheelFrame==null)this.wheelFrame=requestAnimationFrame(()=>{
      this.wheelFrame=null;const packet=this.pendingWheel;this.pendingWheel=null;
      if(packet&&activeScene===this&&this.canvas?.isConnected)this.input('zoom',packet);
    });
  }
  dismissHover() { this.cancelHover(); this.onHover(null, {immediate:true}); }
  clearSelectionBox() { this.selectionBox?.remove(); this.selectionBox = null; }
  drawSelectionBox(d) {
    if (!this.selectionBox) {
      this.selectionBox = document.createElement('div');
      this.selectionBox.className = 'native-selection-box';
      Object.assign(this.selectionBox.style, {position:'fixed',pointerEvents:'none',zIndex:45,
        border:'1px solid #c1dfdc',background:'rgba(113,182,174,.16)',boxSizing:'border-box'});
      document.body.prepend(this.selectionBox);
    }
    Object.assign(this.selectionBox.style, {left:Math.min(d.startX,d.x)+'px',top:Math.min(d.startY,d.y)+'px',
      width:Math.abs(d.x-d.startX)+'px',height:Math.abs(d.y-d.startY)+'px'});
  }
  receiveHover(event) {
    // Native picking crosses the CEF bridge asynchronously. Camera movement or
    // a newer pointer location invalidates the old request before its reply.
    if (this.hoverRequestId == null || event.requestId !== this.hoverRequestId) return;
    this.onHover(event.selection, {clientX:event.x * innerWidth, clientY:event.y * innerHeight});
  }
  attach(canvas) {
    if (this.canvas === canvas) return;
    this.cancelWheel();
    this.cancelHover();
    this.drag = null; this.clearSelectionBox();
    this.events?.abort(); this.resize?.disconnect();
    this.canvas = canvas; this.events = new AbortController();
    const options = {signal:this.events.signal};
    canvas.classList.add('unreal-input');
    const point = event => ({x:clamp(event.clientX / innerWidth, 0, 1), y:clamp(event.clientY / innerHeight, 0, 1)});
    const pickPoint = event => ({...point(event),radiusX:10 / innerWidth,radiusY:10 / innerHeight});
    canvas.addEventListener('contextmenu', event => event.preventDefault(), options);
    canvas.addEventListener('wheel', event => {
      event.preventDefault(); this.activate(); canvas.focus({preventScroll:true});
      this.dismissHover();
      this.queueWheel({delta:event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1), ...point(event)});
    }, {...options, passive:false});
    canvas.addEventListener('pointerdown', event => {
      if (![0,1,2].includes(event.button)) return;
      event.preventDefault(); // Middle dragging must not start browser autoscroll.
      this.cancelWheel();
      this.dismissHover();
      this.activate(); canvas.focus({preventScroll:true}); canvas.setPointerCapture(event.pointerId);
      this.drag = {x:event.clientX, y:event.clientY, startX:event.clientX, startY:event.clientY, moved:false,
        pick:event.button === 0, tilt:event.button === 1 || (this.mode === 'battle' && event.button === 2 && event.shiftKey)};
    }, options);
    canvas.addEventListener('pointermove', event => {
      if (this.drag) {
        const d = this.drag, dx = event.clientX - d.x, dy = event.clientY - d.y;
        const previousX = d.x / innerWidth, previousY = d.y / innerHeight;
        d.moved ||= Math.hypot(event.clientX - d.startX, event.clientY - d.startY) > 4;
        d.x = event.clientX; d.y = event.clientY;
        if (d.moved && d.pick) { if (this.mode === 'world') this.drawSelectionBox(d); }
        else if (d.moved) this.input(d.tilt ? 'tilt' : 'pan', {dx, dy, previousX, previousY, ...point(event)});
      } else {
        // Keep the last pointer position even when movement stops within the
        // rate limit; dropping that event leaves the hovered ship stale.
        this.hoverRequestId = ++this.hoverSequence;
        this.pendingHover = {...pickPoint(event),requestId:this.hoverRequestId};
        if (this.hoverTimer == null) this.hoverTimer = setTimeout(() => {
          this.hoverTimer = null; this.lastHover = performance.now();
          const position = this.pendingHover; this.pendingHover = null;
          if (position && !this.drag && activeScene === this && this.canvas?.isConnected) this.input('hover', position);
        }, Math.max(0, 70 - (performance.now() - (this.lastHover || 0))));
      }
    }, options);
    canvas.addEventListener('pointerup', event => {
      const d = this.drag;
      if (d?.pick && !d.moved) this.input('pick', pickPoint(event));
      else if (d?.pick && this.mode === 'world') this.input('selectBox', {
        x0:clamp(d.startX/innerWidth,0,1),y0:clamp(d.startY/innerHeight,0,1),...point(event)});
      this.drag = null; this.clearSelectionBox();
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    }, options);
    canvas.addEventListener('pointercancel', () => { this.drag = null; this.clearSelectionBox(); this.dismissHover(); }, options);
    canvas.addEventListener('dblclick', event => {if (event.button === 0) this.input('pick', {...pickPoint(event),zoom:true});}, options);
    canvas.addEventListener('pointerleave', () => {this.cancelHover(); if (!this.drag) this.onHover(null);}, options);
    canvas.addEventListener('keydown', event => {
      if(['Home','PageUp','PageDown','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))this.cancelWheel();
      if (['Home','PageUp','PageDown','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
        this.dismissHover();
      }
      if (event.key === 'Home') { event.preventDefault(); this.input('home'); }
      if (['PageUp','PageDown'].includes(event.key)) { event.preventDefault(); this.input('zoom', {delta:event.key === 'PageUp' ? -300 : 300}); }
      const delta = {ArrowLeft:[40,0],ArrowRight:[-40,0],ArrowUp:[0,40],ArrowDown:[0,-40]}[event.key];
      if (delta) {event.preventDefault(); this.input('pan', {dx:delta[0],dy:delta[1]});}
    }, options);
    this.resize = new ResizeObserver(() => {if (activeScene === this) this.activate();}); this.resize.observe(canvas);
    // A centered, max-width panel can move while its canvas size stays fixed.
    // ResizeObserver alone then leaves the native camera at its old offset,
    // until pointerdown jumps it and the click misses the displayed ship.
    window.addEventListener('resize', () => {if (activeScene === this) this.activate();}, options);
    // Scrolling a clipped battle/gallery panel moves its native viewport without
    // resizing the canvas. Keep projection and input aligned before the next pick.
    document.addEventListener('scroll', () => {if (activeScene === this) this.activate();},
      {signal:this.events.signal, capture:true, passive:true});
  }
  viewportRect() { return this.canvas.getBoundingClientRect(); }
  activate() {
    if (!this.canvas?.isConnected || document.hidden) return;
    const wasActive = activeScene === this;
    if (!wasActive) {activeScene?.dismissHover(); this.cancelHover();}
    activeScene = this;
    const rect = this.viewportRect();
    const packet = {instanceId:this.instanceId, mode:this.mode, x:rect.left / innerWidth, y:rect.top / innerHeight,
      width:rect.width / innerWidth, height:rect.height / innerHeight};
    const key = JSON.stringify(packet);
    if (!wasActive || key !== this.viewportKey) {send('viewport', packet); this.viewportKey = key;}
    if (this.mode === 'battle') {
      // Mask the world outside a battle viewport without covering its 3D scene.
      if (!this.mask?.isConnected) {
        this.mask = document.createElement('div'); this.mask.className = 'unreal-scene-mask';
        document.body.prepend(this.mask);
      }
      for (const mask of document.querySelectorAll('.unreal-scene-mask')) mask.hidden = mask !== this.mask;
      Object.assign(this.mask.style, {left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
    } else for (const mask of document.querySelectorAll('.unreal-scene-mask')) mask.hidden = true;
    document.documentElement.dataset.unrealScene = this.mode;
  }
  suspend() {
    this.cancelWheel();
    if (activeScene !== this) return;
    this.dismissHover(); this.drag = null; this.clearSelectionBox();
    activeScene = null;
    if (this.mask) this.mask.hidden = true;
    send('viewport', {instanceId:this.instanceId,mode:'hidden',x:0,y:0,width:1,height:1});
    document.documentElement.dataset.unrealScene = 'hidden';
  }
  clear() {
    this.cancelWheel();
    this.cancelHover();
    this.drag = null; this.clearSelectionBox();
    this.suspend(); this.events?.abort(); this.resize?.disconnect();
    this.mask?.remove(); this.mask = null;
    this.canvas = null; this.report = null; this.frame = null; this.hits = [];
  }
  destroy() { this.clear(); scenes.delete(this.instanceId); }
  cameraChanged(event) {
    if (this.zoom !== event.zoom) this.dismissHover();
    this.zoom = event.zoom;
  }
}

export class UnrealWorldScene extends NativeScene {
  constructor(options) {
    super(options); Object.assign(this, {chart:options.chart, active:options.active, onCameraChange:options.onCameraChange});
    this.mode = 'world'; this.rows = []; this.worldRevision = 0;
  }
  get ready() {return Boolean(this.canvas?.isConnected);}
  selection() {
    const chart = this.chart(), selectedForceId = chart.convoyId || chart.fleetId || null;
    const selectedForceIds = chart.convoyId ? [chart.convoyId] : [...new Set(chart.fleetIds?.length ? chart.fleetIds : chart.fleetId ? [chart.fleetId] : [])];
    return {selectedForceId, selectedForceIds, signature:JSON.stringify([selectedForceId,[...selectedForceIds].sort()])};
  }
  accept(state, content, political) {
    if (this.state !== state) {
      if (state.campaignId !== this.state?.campaignId || state.player !== this.state?.player) this.rows = [];
      const rows = ownFormationScene(state, content, this.rows);
      const selection = this.selection();
      this.routeSelection = selection.selectedForceId; this.selectionSignature = selection.signature;
      this.packet = buildUnrealScenePacket(state, content, this.rows, {rows, selectedForceId:selection.selectedForceId, selectedForceIds:selection.selectedForceIds,
        animate:!matchMedia('(prefers-reduced-motion: reduce)').matches});
      Object.assign(this.packet, {instanceId:this.instanceId, revision:++this.worldRevision});
      send('world', this.packet); this.rows = rows;
    }
    Object.assign(this, {state, content, political}); this.refresh();
  }
  refresh() {
    const selection = this.selection();
    if (this.state && selection.signature !== this.selectionSignature) {
      this.routeSelection = selection.selectedForceId; this.selectionSignature = selection.signature;
      const packet = buildUnrealSelectionPacket(this.state, this.rows, selection);
      send('world', {...packet, instanceId:this.instanceId, revision:this.worldRevision});
    }
    const surface = this.root.querySelector('.native-world-surface');
    if (!surface || !this.active()) {this.suspend(); return;}
    if (this.canvas?.parentElement !== surface) {
      surface.replaceChildren();
      const canvas = document.createElement('canvas'); canvas.className = 'native-world-input'; canvas.tabIndex = 0;
      canvas.setAttribute('role', 'application');
      canvas.setAttribute('aria-label', 'Native 3D terrain map with continuous horizontal wrapping. Left click selects a unit; left drag selects fleets in a box. Right drag pans. Wheel zooms. The map stays overhead until middle-button drag at close ship zoom adjusts the camera. Any zoom out immediately restores overhead north-up. Home fits the full world.');
      surface.append(canvas); this.attach(canvas);
    }
    this.activate();
  }
  viewportRect() {
    const bounds = this.canvas.getBoundingClientRect(), sidebar = this.root.querySelector('.sidebar')?.getBoundingClientRect();
    const panel = this.root.querySelector('.command-side-panel')?.getBoundingClientRect(), workspace = this.root.querySelector('.command-workspace')?.getBoundingClientRect();
    const left = Math.max(bounds.left + 12, (sidebar?.right || 0) + 12), top = Math.max(bounds.top + 12, (workspace?.top || 0) + 8);
    const right = panel && panel.width < bounds.width * .5 ? panel.left - 12 : bounds.right - 12;
    return {left, top, width:Math.max(120, right - left), height:Math.max(120, bounds.bottom - top - 48)};
  }
  cameraChanged(event) {
    const key = JSON.stringify([event.zoom,event.longitude,event.latitude,event.tilt,event.yaw]);
    if (key === this.cameraKey) return; this.cameraKey = key;
    this.dismissHover();
    this.zoom = event.zoom; const chart = this.chart(); chart.zoom = event.zoom;
    chart.rotation = event.longitude; chart.nativeLatitude = event.latitude;
    // Camera movement is independent from DOM/simulation redraw rate.
    clearTimeout(this.cameraTimer); this.cameraTimer = setTimeout(() => this.onCameraChange?.(), 100);
  }
  focus(kind, id, {zoom = false} = {}) {
    const point = chartPosition(this.state, this.political, kind, id); if (!point) return;
    this.activate(); this.input(zoom && kind === 'fleet' ? 'fit-force' : 'focus', {kind,id,longitude:point[0],latitude:point[1],zoom:Math.max(zoom&&kind==='port'?16:4, this.zoom)});
  }
  reloadModels() { /* Native meshes reload from external files on subsequent scene packets. */ }
}

export function unrealBattlePacket(report, campaign, frameIndex, selected, animate = true, playback = null) {
  if(playback?.plan){
    const {plan,key,elapsedSeconds,paused}=playback;
    return {format:1,campaign,id:plan.reportId,at:plan.recordedUntil,index:0,animate,movie:true,
      cameraDirector:!!plan.tactical,tactical:!!plan.tactical,airstrikes:plan.airstrikes||[],shoreBatteries:plan.shoreBatteries||[],
      eventKey:key,durationSeconds:plan.durationSeconds,elapsedSeconds,playbackPaused:paused,
      events:plan.events,units:plan.units.map(unit=>({key:unit.key,id:unit.id,side:unit.side,hullIndex:unit.hullIndex,
        classId:unit.classId,campaign:unit.campaign||campaign,type:unit.type,label:unit.name,positionMetres:unit.positionMetres,headingDegrees:unit.headingDegrees,
        health:unit.health,sunk:unit.sunkHull,trajectory:unit.trajectory,appearsAt:unit.appearsAt,lostAtSeconds:unit.lostAtSeconds,disappearsAt:unit.disappearsAt,
        selected:selected?.side===unit.side&&selected.id===unit.id&&(selected.hullIndex||0)===unit.hullIndex}))};
  }
  const {frame, index} = watchFrame(report, frameIndex);
  if(report.tactical?.ships?.length){
    const seconds=report.tactical.history?.frames?.length
      ? frame.tacticalSeconds??Math.min(report.tactical.seconds,Math.max(0,(frame.at-report.startedAt)*60))
      : report.tactical.seconds;
    return {...unrealTacticalPacket(report.tactical,{sessionId:String(report.id),campaign,replaySeconds:seconds,fromSeconds:seconds,
      selected,paused:true,animate,cinematic:false}),at:frame.at,index};
  }
  const durationSeconds = String(report.id).startsWith('title-demo-') ? 3.6 : 15;
  const timeScale = durationSeconds / 15;
  return {format:1,campaign,id:String(report.id),at:frame.at,index,animate,
    eventKey:`${report.id}:${frame.at}:${index}`,durationSeconds,
    events:battleVisualEvents(report,frame,index).map(event => ({...event,time:event.time*timeScale,duration:event.duration*timeScale})),
    units:battleInstances(frame, report.startedAt).map(unit => ({key:unit.key,id:unit.id,side:unit.side,hullIndex:unit.hullIndex,
      classId:unit.classId,type:unit.type,label:unit.name,
      positionMetres:unit.positionMetres,
      headingDegrees:unit.heading * 180 / Math.PI,health:unit.health,sunk:unit.sunkHull,
      selected:selected?.side === unit.side && selected.id === unit.id && (selected.hullIndex || 0) === unit.hullIndex}))};
}

export class UnrealBattleScene extends NativeScene {
  constructor(options) {super(options); this.mode = 'battle';this.audio=new BattleAudioController();}
  refresh(report, campaign, frameIndex = null, selected = null, animationEnabled = true, playback = null) {
    const canvas = this.root.querySelector('.battle-canvas');
    if (!canvas || !report) {this.clear(); return;}
    const current = watchFrame(report, frameIndex);
    const animate = animationEnabled && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const changed = this.report?.id !== report.id || this.movieKey !== playback?.key || this.moviePaused !== playback?.paused ||
      (!playback && (this.frameIndex !== current.index || this.frame?.at !== current.frame.at)) || this.selected !== selected || this.animate !== animate;
    Object.assign(this, {report,campaign,frame:current.frame,frameIndex:current.index,selected,animate,movieKey:playback?.key,moviePaused:playback?.paused});
    this.attach(canvas); this.activate();
    if (changed) {
      this.started = performance.now();
      const packet=unrealBattlePacket(report,campaign,frameIndex,selected,animate,playback);
      this.audioPacket=packet;
      this.battleReady = send('battle',packet);
    }
    if(this.audioPacket)this.audio.update({...this.audioPacket,tacticalSessionId:playback?.key||`static:${report.id}`,
      ...(playback?{elapsedSeconds:playback.elapsedSeconds,playbackPaused:playback.paused}:{})},{silent:!playback});
    this.view = {native:true};
    // Callers that fit a newly selected model must wait for the native packet:
    // receiving a new report also resets the native battle camera.
    return this.battleReady || Promise.resolve();
  }
  draw() {if (this.canvas?.isConnected && this.frame) this.activate();}
  fit() {this.zoom = 1; this.input('home');}
  focus(side, id, hullIndex = 0) {this.input('focus', {side,id,hullIndex});}
  suspend(){this.audio?.pause();super.suspend();}
  clear(){this.audio?.reset();this.audioPacket=null;super.clear();}
  destroy(){this.audio?.destroy();super.destroy();}
}

export class UnrealTacticalScene extends NativeScene {
  constructor(options){super(options);this.mode='battle';this.onCameraChange=options.onCameraChange;this.sessionSerial=0;this.audio=new BattleAudioController();}
  refresh(state,options={}){
    const canvas=this.root.querySelector('.battle-canvas');if(!canvas||!state){this.clear();return Promise.resolve();}
    if(this.combat!==state){this.combat=state;this.sessionId=`${this.instanceId}:tactical:${++this.sessionSerial}`;this.previous=null;this.current=null;this.packet=null;}
    if(this.current?.seconds!==state.seconds){this.previous=this.current;this.current=tacticalSceneSnapshot(state);}
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const end=options.replaySeconds??state.seconds;
    const samePosition=this.packet&&this.packet.at===end&&this.replay===options.replaySeconds;
    let candidate;
    // Selection/pause/camera toggles must not reset the active interpolation.
    // Keep its key and clock origin until the simulation/replay position moves.
    if(samePosition){
      const selected=options.selected;
      candidate={...this.packet,playbackPaused:!!options.paused,cameraDirector:options.cinematic!==false,
        units:this.packet.units.map(unit=>({...unit,selected:!!(selected?.key===unit.key||selected?.id===unit.key||selected?.side===unit.side&&String(selected.id)===unit.id&&(selected.hullIndex||0)===unit.hullIndex)}))};
      candidate.elapsedSeconds=Math.min(this.packet.durationSeconds,this.clockElapsed+(this.packet.playbackPaused?0:(performance.now()-this.clockStartedAt)/1000));
    }else candidate=unrealTacticalPacket(state,{...options,previous:this.previous,sessionId:this.sessionId,animate:!reduced});
    const changed=!this.packet||candidate.eventKey!==this.packet.eventKey||candidate.playbackPaused!==this.packet.playbackPaused||
      JSON.stringify(options.selected)!==this.selectionKey||candidate.cameraDirector!==this.packet.cameraDirector;
    this.attach(canvas);this.activate();
    if(changed){
      if(!this.packet||candidate.eventKey!==this.packet.eventKey||candidate.playbackPaused!==this.packet.playbackPaused){this.clockStartedAt=performance.now();this.clockElapsed=candidate.elapsedSeconds;}
      this.packet=candidate;this.replay=options.replaySeconds;this.selectionKey=JSON.stringify(options.selected);this.battleReady=send('battle',candidate);
    }
    this.audio.update(candidate,{silent:!!options.silent});
    return this.battleReady||Promise.resolve();
  }
  cameraChanged(event){super.cameraChanged(event);this.onCameraChange?.(event);}
  fit(){this.input('home');}
  focus(side,id,hullIndex=0){this.input('focus',{side,id,hullIndex});}
  setCinematic(enabled){this.input('cinematic',{enabled});}
  resetAudio(){this.audio?.reset();}
  suspend(){this.audio?.pause();super.suspend();}
  draw(){if(this.canvas?.isConnected)this.activate();}
  clear(){this.audio?.reset();super.clear();this.combat=null;this.previous=null;this.current=null;this.packet=null;}
  destroy(){this.audio?.destroy();super.destroy();}
}
