import { ownFormationScene } from './fleet-formation.mjs';
import { buildUnrealScenePacket } from './unreal-scene-packet.mjs';
import { chartPosition } from './map-focus.mjs';
import { watchFrame, battleInstances } from './battle-watch.mjs';

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

if (UNREAL_MODE) {
  document.documentElement.classList.add('unreal-mode');
  globalThis.WNTUnreal = {
    receive(event) {
      if (event.type === 'error') { reportError(event.message); return; }
      const scene = scenes.get(event.instanceId);
      if (!scene || scene !== activeScene) return;
      if (event.type === 'select' && event.selection) scene.onSelect({...event.selection,zoom:!!event.zoom});
      if (event.type === 'hover') scene.onHover?.(event.selection, {clientX:event.x * innerWidth, clientY:event.y * innerHeight});
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
  }
  input(action, values = {}) { return send('sceneinput', {instanceId:this.instanceId, action, ...values}); }
  cancelHover() { clearTimeout(this.hoverTimer); this.hoverTimer = null; this.pendingHover = null; }
  attach(canvas) {
    if (this.canvas === canvas) return;
    this.cancelHover();
    this.drag = null;
    this.events?.abort(); this.resize?.disconnect();
    this.canvas = canvas; this.events = new AbortController();
    const options = {signal:this.events.signal};
    canvas.classList.add('unreal-input');
    const point = event => ({x:clamp(event.clientX / innerWidth, 0, 1), y:clamp(event.clientY / innerHeight, 0, 1)});
    canvas.addEventListener('contextmenu', event => event.preventDefault(), options);
    canvas.addEventListener('wheel', event => {
      event.preventDefault(); this.activate();
      this.input('zoom', {delta:event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1), ...point(event)});
    }, {...options, passive:false});
    canvas.addEventListener('pointerdown', event => {
      if (![0,2].includes(event.button)) return;
      this.cancelHover();
      this.activate(); canvas.focus({preventScroll:true}); canvas.setPointerCapture(event.pointerId);
      this.drag = {x:event.clientX, y:event.clientY, startX:event.clientX, startY:event.clientY, moved:false, tilt:event.button === 2 || event.shiftKey};
    }, options);
    canvas.addEventListener('pointermove', event => {
      if (this.drag) {
        const d = this.drag, dx = event.clientX - d.x, dy = event.clientY - d.y;
        const previousX = d.x / innerWidth, previousY = d.y / innerHeight;
        d.moved ||= Math.hypot(event.clientX - d.startX, event.clientY - d.startY) > 4;
        d.x = event.clientX; d.y = event.clientY;
        if (d.moved) this.input(d.tilt ? 'tilt' : 'pan', {dx, dy, previousX, previousY, ...point(event)});
      } else {
        // Keep the last pointer position even when movement stops within the
        // rate limit; dropping that event leaves the hovered ship stale.
        this.pendingHover = point(event);
        if (this.hoverTimer == null) this.hoverTimer = setTimeout(() => {
          this.hoverTimer = null; this.lastHover = performance.now();
          const position = this.pendingHover; this.pendingHover = null;
          if (position && !this.drag && activeScene === this && this.canvas?.isConnected) this.input('hover', position);
        }, Math.max(0, 70 - (performance.now() - (this.lastHover || 0))));
      }
    }, options);
    canvas.addEventListener('pointerup', event => {
      if (this.drag && !this.drag.moved && !this.drag.tilt) this.input('pick', point(event));
      this.drag = null;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    }, options);
    canvas.addEventListener('pointercancel', () => { this.drag = null; }, options);
    canvas.addEventListener('dblclick', event => this.input('pick', {...point(event),zoom:true}), options);
    canvas.addEventListener('pointerleave', () => {this.cancelHover(); if (!this.drag) this.onHover(null);}, options);
    canvas.addEventListener('keydown', event => {
      if (event.key === 'Home') { event.preventDefault(); this.input('home'); }
      if (['PageUp','PageDown'].includes(event.key)) { event.preventDefault(); this.input('zoom', {delta:event.key === 'PageUp' ? -300 : 300}); }
      const delta = {ArrowLeft:[40,0],ArrowRight:[-40,0],ArrowUp:[0,40],ArrowDown:[0,-40]}[event.key];
      if (delta) {event.preventDefault(); this.input('pan', {dx:delta[0],dy:delta[1]});}
    }, options);
    this.resize = new ResizeObserver(() => {if (activeScene === this) this.activate();}); this.resize.observe(canvas);
    // Scrolling a clipped battle/gallery panel moves its native viewport without
    // resizing the canvas. Keep projection and input aligned before the next pick.
    document.addEventListener('scroll', () => {if (activeScene === this) this.activate();},
      {signal:this.events.signal, capture:true, passive:true});
  }
  viewportRect() { return this.canvas.getBoundingClientRect(); }
  activate() {
    if (!this.canvas?.isConnected || document.hidden) return;
    const wasActive = activeScene === this;
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
    if (activeScene !== this) return;
    activeScene = null;
    if (this.mask) this.mask.hidden = true;
    send('viewport', {instanceId:this.instanceId,mode:'hidden',x:0,y:0,width:1,height:1});
    document.documentElement.dataset.unrealScene = 'hidden';
  }
  clear() {
    this.cancelHover();
    this.drag = null;
    this.suspend(); this.events?.abort(); this.resize?.disconnect();
    this.mask?.remove(); this.mask = null;
    this.canvas = null; this.report = null; this.frame = null; this.hits = [];
  }
  destroy() { this.clear(); scenes.delete(this.instanceId); }
  cameraChanged(event) { this.zoom = event.zoom; }
}

export class UnrealWorldScene extends NativeScene {
  constructor(options) {
    super(options); Object.assign(this, {chart:options.chart, active:options.active, onCameraChange:options.onCameraChange});
    this.mode = 'world'; this.rows = [];
  }
  get ready() {return Boolean(this.canvas?.isConnected);}
  accept(state, content, political) {
    if (this.state !== state) {
      if (state.campaignId !== this.state?.campaignId || state.player !== this.state?.player) this.rows = [];
      const rows = ownFormationScene(state, content, this.rows);
      this.routeSelection = this.chart().convoyId || this.chart().fleetId || null;
      this.packet = buildUnrealScenePacket(state, content, this.rows, {rows, selectedForceId:this.routeSelection});
      send('world', this.packet); this.rows = rows;
    }
    Object.assign(this, {state, content, political}); this.refresh();
  }
  refresh() {
    const selectedForceId = this.chart().convoyId || this.chart().fleetId || null;
    if (this.state && selectedForceId !== this.routeSelection) {
      this.routeSelection = selectedForceId;
      this.packet = buildUnrealScenePacket(this.state, this.content, this.rows, {rows:this.rows, selectedForceId});
      send('world', this.packet);
    }
    const surface = this.root.querySelector('.native-world-surface');
    if (!surface || !this.active()) {this.suspend(); return;}
    if (this.canvas?.parentElement !== surface) {
      surface.replaceChildren();
      const canvas = document.createElement('canvas'); canvas.className = 'native-world-input'; canvas.tabIndex = 0;
      canvas.setAttribute('role', 'application');
      canvas.setAttribute('aria-label', 'Native 3D Equal Earth world. North is up. Scroll to zoom, drag to pan, right drag to tilt. Home restores the strategic view.');
      surface.append(canvas); this.attach(canvas);
    }
    this.activate();
  }
  viewportRect() {
    const bounds = this.canvas.getBoundingClientRect(), sidebar = this.root.querySelector('.sidebar')?.getBoundingClientRect();
    const panel = this.root.querySelector('.command-side-panel')?.getBoundingClientRect(), workspace = this.root.querySelector('.workspace')?.getBoundingClientRect();
    const left = Math.max(bounds.left + 12, (sidebar?.right || 0) + 12), top = Math.max(bounds.top + 12, (workspace?.top || 0) + 8);
    const right = panel && panel.width < bounds.width * .5 ? panel.left - 12 : bounds.right - 12;
    return {left, top, width:Math.max(120, right - left), height:Math.max(120, bounds.bottom - top - 48)};
  }
  cameraChanged(event) {
    const key = JSON.stringify([event.zoom,event.longitude,event.latitude,event.tilt]);
    if (key === this.cameraKey) return; this.cameraKey = key;
    this.zoom = event.zoom; const chart = this.chart(); chart.zoom = event.zoom;
    chart.rotation = event.longitude; chart.nativeLatitude = event.latitude;
    // Camera movement is independent from DOM/simulation redraw rate.
    clearTimeout(this.cameraTimer); this.cameraTimer = setTimeout(() => this.onCameraChange?.(), 100);
  }
  focus(kind, id, {zoom = false} = {}) {
    const point = chartPosition(this.state, this.political, kind, id); if (!point) return;
    this.activate(); this.input('focus', {kind,id,longitude:point[0],latitude:point[1],zoom:zoom ? 12000 : Math.max(4, this.zoom)});
  }
  reloadModels() { /* Native meshes reload from external files on subsequent scene packets. */ }
}

export function unrealBattlePacket(report, campaign, frameIndex, selected, animate = true) {
  const {frame, index} = watchFrame(report, frameIndex);
  return {format:1,campaign,id:String(report.id),at:frame.at,index,animate,
    units:battleInstances(frame, report.startedAt).map(unit => ({key:unit.key,id:unit.id,side:unit.side,hullIndex:unit.hullIndex,
      classId:unit.classId,type:unit.type,label:unit.name,
      positionMetres:unit.positionMetres,
      headingDegrees:unit.heading * 180 / Math.PI,health:unit.health,sunk:unit.sunkHull,
      selected:selected?.side === unit.side && selected.id === unit.id && (selected.hullIndex || 0) === unit.hullIndex}))};
}

export class UnrealBattleScene extends NativeScene {
  constructor(options) {super(options); this.mode = 'battle';}
  refresh(report, campaign, frameIndex = null, selected = null) {
    const canvas = this.root.querySelector('.battle-canvas');
    if (!canvas || !report) {this.clear(); return;}
    const current = watchFrame(report, frameIndex);
    const changed = this.report?.id !== report.id || this.frameIndex !== current.index || this.frame?.at !== current.frame.at || this.selected !== selected;
    Object.assign(this, {report,campaign,frame:current.frame,frameIndex:current.index,selected});
    this.attach(canvas); this.activate();
    if (changed) {
      this.started = performance.now();
      send('battle', unrealBattlePacket(report,campaign,frameIndex,selected,!matchMedia('(prefers-reduced-motion: reduce)').matches));
    }
    this.view = {native:true};
  }
  draw() {if (this.canvas?.isConnected && this.frame) this.activate();}
  fit() {this.zoom = 1; this.input('home');}
  focus(side, id, hullIndex = 0) {this.input('focus', {side,id,hullIndex});}
}
