import { mapPoint, geometryPath, polygonPath, linePath } from './projection.mjs';
import { sceneCamera, scenePoint, sceneInverse, sceneZoomAt, intersectsViewport, containsPoint,
  ownFleetScene, formationBounds, translatedBounds, waterFormationAnchor, landIntegral, clearWaterRectangle,
  FLEET_DETAIL_ZOOM, MAX_SCENE_ZOOM, ISO_TILT } from './isometric-math.mjs';
import { drawVoxelShip, voxelFaces, voxelBounds } from './voxel-renderer.mjs';
import { voxelModelFor } from './voxel-models.mjs';
import { visualMinute, visualFleet } from './map-motion.mjs';
import { fleetPosition, visibleContacts } from '../mechanics/task-forces.mjs';
import { campaignMinutes } from '../mechanics/campaign-clock.mjs';
import { convoyUnderway } from '../mechanics/convoy-traffic.mjs';
import { PORTS, PORT_LOCATIONS, NODES, MAP_CAPITALS } from '../mechanics/world.mjs';
import { PROFILES } from '../mechanics/catalog.mjs';
import { POWERS, frontPosition, occupiedGeometry } from '../mechanics/land-war.mjs';
import { uiModel } from '../mechanics/queries.mjs';
import { escortCircle, coverageAt } from '../mechanics/convoy-coverage.mjs';
import { chartPosition } from './map-focus.mjs';
import { remainingRoute } from './command-view.mjs';
export { drawVoxelShip } from './voxel-renderer.mjs';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function mix(color, other, ratio) {
  if (!/^#[0-9a-f]{6}$/i.test(color || '')) color = '#899386';
  return '#' + [1, 3, 5].map(i => Math.round(parseInt(color.slice(i, i + 2), 16) * (1 - ratio) +
    parseInt(other.slice(i, i + 2), 16) * ratio).toString(16).padStart(2, '0')).join('');
}
const keyOf = selection => selection ? `${selection.kind}:${selection.id}:${selection.hullIndex ?? ''}` : '';
const modelBounds = new WeakMap();
export function sceneHullProjection(model, camera, position) {
  const length = model.dimensions?.length || 100, heading = -.28;
  const scale = camera.scale * clamp(length / 105, 1.2, 2.75) / length;
  let unit = modelBounds.get(model);
  if (!unit) { unit = voxelBounds(voxelFaces(model, { heading })); modelBounds.set(model, unit); }
  return { scale, heading, bounds: { x: position[0] + unit.x * scale, y: position[1] + unit.y * scale,
    width: unit.width * scale, height: unit.height * scale } };
}

export class IsometricScene {
  constructor({ root, chart, active = () => true, onSelect = () => {}, onHover = () => {}, onCameraChange = () => {} }) {
    Object.assign(this, { root, chart, active, onSelect, onHover, onCameraChange });
    this.current = null; this.previous = null; this.frame = null; this.canvas = null;
    this.hits = []; this.features = []; this.spriteCache = new Map(); this.pathCache = new Map();
    this.waterOffsets = new Map();
    this.selectedHull = null; this.rosterPage = 0; this.frames = 0; this.lastPaint = 0;
    this.backgroundKey = ''; this.hoverKey = ''; this.hoverSelection = null;
    this.resizeObserver = new ResizeObserver(() => { this.backgroundKey = ''; this.refresh(); });
    this.resizeObserver.observe(root);
    this.visibilityHandler = () => this.refresh();
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }
  get ready() { return !!(this.canvas?.isConnected && this.ctx); }
  accept(state, content, political, at = performance.now()) {
    this.content = content; this.political = political;
    if (this.current?.state !== state) {
      this.previous = this.current;
      this.current = { state, at, forces: new Map([...(state.nations[state.player].fleets || []),
        ...(state.nations[state.player].convoys || [])].map(f => [f.id, f])) };
      if (this.previous && (this.previous.state.player !== state.player ||
        this.previous.state.campaignId !== state.campaignId || campaignMinutes(this.previous.state) > campaignMinutes(state))) {
        this.previous = null; this.selectedHull = null; this.rosterPage = 0;
      }
      this.fleets = ownFleetScene(state);
      for (const row of this.fleets) row.formationBounds = formationBounds(row.hulls);
      this.rosterKey = '';
    }
    this.refresh();
  }
  mount() {
    const surface = this.root.querySelector('.isometric-surface');
    if (!surface) return false;
    if (this.canvas?.parentElement === surface) return true;
    this.canvas?.remove(); this.surface = surface;
    surface.innerHTML = '<canvas class="isometric-canvas" tabindex="0" role="application" aria-label="Isometric naval atlas. Scroll to zoom from the world to individual ships. Drag to pan. Home resets, arrow keys pan, Page Up and Page Down zoom. Double-click a fleet to inspect its ships."></canvas>' +
      '<div class="isometric-toolbar" aria-label="Map camera"><span class="isometric-level">Strategic atlas</span>' +
      '<button type="button" data-iso-camera="out" aria-label="Zoom map out" title="Zoom out (Page Down)">−</button>' +
      '<button type="button" data-iso-camera="in" aria-label="Zoom map in" title="Zoom in (Page Up)">+</button>' +
      '<button type="button" data-iso-camera="home" title="Show the whole strategic world (Home)">World</button>' +
      '<button type="button" data-iso-camera="fleet" title="Zoom to the selected or nearest friendly fleet">Fleet</button></div>' +
      '<details class="isometric-roster"><summary>Fleet ships</summary><div class="isometric-roster-body"></div></details>' +
      '<p class="isometric-caption"></p><div class="isometric-accessibility" aria-label="Visible ships and chart objects"></div>';
    this.canvas = surface.querySelector('canvas'); this.ctx = this.canvas.getContext('2d', { alpha: false });
    if (!this.ctx) { surface.replaceChildren(); return false; }
    this.background = document.createElement('canvas'); this.bg = this.background.getContext('2d', { alpha: false });
    this.canvas.addEventListener('pointerdown', event => this.pointerDown(event));
    this.canvas.addEventListener('pointermove', event => this.pointerMove(event));
    this.canvas.addEventListener('pointerup', event => this.pointerUp(event));
    this.canvas.addEventListener('pointercancel', event => this.pointerUp(event, true));
    this.canvas.addEventListener('lostpointercapture', () => { this.drag = null; });
    this.canvas.addEventListener('pointerleave', event => { if (!this.drag) this.hover(null, event); });
    this.canvas.addEventListener('dblclick', event => this.doubleClick(event));
    this.canvas.addEventListener('wheel', event => this.wheel(event), { passive: false });
    this.canvas.addEventListener('keydown', event => this.keydown(event));
    surface.addEventListener('click', event => {
      const camera = event.target.closest('[data-iso-camera]');
      if (camera) { this.control(camera.dataset.isoCamera); return; }
      const page = event.target.closest('[data-iso-page]');
      if (page) { this.rosterPage += Number(page.dataset.isoPage); this.rosterKey = ''; this.paint(performance.now()); return; }
      const button = event.target.closest('[data-iso-target]');
      if (!button) return;
      const selection = this.accessibleTargets?.get(button.dataset.isoTarget);
      if (selection) this.select(selection);
    });
    this.backgroundKey = ''; this.rosterKey = ''; this.accessibilityKey = '';
    return true;
  }
  resize() {
    const bounds = this.surface.getBoundingClientRect();
    const width = Math.max(1, bounds.width), height = Math.max(1, bounds.height), dpr = Math.min(2, window.devicePixelRatio || 1);
    // A new/continued campaign can replace the preserved surface at exactly the
    // same window size. Its new canvases still start at 300×150, regardless of
    // the previous surface's cached dimensions.
    if (width !== this.width || height !== this.height || dpr !== this.dpr ||
        this.canvas.width !== Math.ceil(width * dpr) || this.canvas.height !== Math.ceil(height * dpr) ||
        this.background.width !== Math.ceil(width * dpr) || this.background.height !== Math.ceil(height * dpr)) {
      Object.assign(this, { width, height, dpr });
      for (const canvas of [this.canvas, this.background]) { canvas.width = Math.ceil(width * dpr); canvas.height = Math.ceil(height * dpr); }
      this.backgroundKey = ''; this.spriteCache.clear();
    }
    // Centre the world in the unobscured chart between the ministry tiles.
    const side = this.root.querySelector('.sidebar')?.getBoundingClientRect();
    const panel = this.root.querySelector('.command-side-panel')?.getBoundingClientRect();
    const workspace = this.root.querySelector('.workspace')?.getBoundingClientRect();
    const left = Math.max(14, (side?.right || 0) - bounds.left + 12);
    const right = panel && panel.width < width * .5 ? panel.left - bounds.left - 12 : width - 14;
    const top = Math.max(90, (workspace?.top || 120) - bounds.top + 12);
    this.viewport = { x: left, y: top + 40, width: Math.max(120, right - left), height: Math.max(120, height - top - 94) };
    this.surface.style.setProperty('--iso-left', left + 'px');
    this.surface.style.setProperty('--iso-top', top + 'px');
    this.surface.style.setProperty('--iso-width', Math.max(120, right - left) + 'px');
    this.surface.style.setProperty('--iso-bottom', '44px');
  }
  refresh() {
    if (!this.current || !this.mount()) return;
    this.resize(); this.paint(performance.now());
    const animate = this.active() && !document.hidden && !this.current.state.paused;
    if (animate && this.frame === null) this.frame = requestAnimationFrame(now => this.animate(now));
    if (!animate && this.frame !== null) { cancelAnimationFrame(this.frame); this.frame = null; }
  }
  animate(now) {
    this.frame = null;
    if (!this.ready || !this.active() || document.hidden || this.current.state.paused) return;
    if (now - this.lastPaint >= 1000 / 30 - .5) this.paint(now);
    this.frame = requestAnimationFrame(time => this.animate(time));
  }
  destroy() {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    clearTimeout(this.cameraTimer); clearTimeout(this.selectTimer);
    this.resizeObserver.disconnect(); document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.surface?.replaceChildren(); this.canvas = null;
  }
  worldTransform(ctx, elevation = 0) {
    const m = this.camera, p = this.dpr;
    ctx.setTransform(m.a * p, m.b * p, m.c * p, m.d * p,
      (m.x - m.a * m.cx - m.c * m.cy) * p, (m.y - m.b * m.cx - m.d * m.cy - elevation) * p);
  }
  screenTransform(ctx) { ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); }
  geo(point, elevation = 0) { return scenePoint(this.camera, mapPoint(point, this.chart().rotation || 0), elevation); }
  path(id, geometry) {
    const rotation = this.chart().rotation || 0;
    if (this.pathRotation !== rotation || this.pathPolitical !== this.political) {
      this.pathCache.clear(); this.pathRotation = rotation; this.pathPolitical = this.political;
    }
    if (!this.pathCache.has(id)) this.pathCache.set(id, new Path2D(geometryPath(geometry, rotation)));
    return this.pathCache.get(id);
  }
  waterMask() {
    if (this.waterMaskRotation === this.pathRotation && this.waterMaskPolitical === this.political && this.landMask) return this.landMask;
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 600;
    const context = canvas.getContext('2d', {willReadFrequently:true}); context.fillStyle = '#fff';
    for (const row of this.features) context.fill(row.path, 'evenodd');
    this.landMask = landIntegral(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
    this.waterMaskRotation = this.pathRotation; this.waterMaskPolitical = this.political; this.waterOffsets.clear();
    return this.landMask;
  }
  backdrop() {
    const s = this.current.state, m = this.camera, ctx = this.bg;
    const fronts = (s.world?.fronts || []).filter(f => f.progress > 0 && f.progress < 1);
    const signature = JSON.stringify([m, this.width, this.height, this.chart().rotation, s.world?.control, fronts.map(f => [f.id, f.progress])]);
    if (signature === this.backgroundKey) return;
    this.backgroundKey = signature;
    this.screenTransform(ctx); ctx.fillStyle = '#102c3b'; ctx.fillRect(0, 0, this.width, this.height);
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, '#1d4351'); gradient.addColorStop(.55, '#153340'); gradient.addColorStop(1, '#0b2533');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, this.width, this.height);
    this.worldTransform(ctx);
    const corners = [[0, 0], [this.width, 0], [0, this.height], [this.width, this.height]].map(p => sceneInverse(m, p));
    const cell = 36 / (2 ** Math.floor(Math.log2(m.zoom))), minX = Math.floor(Math.min(...corners.map(p => p[0])) / cell), maxX = Math.ceil(Math.max(...corners.map(p => p[0])) / cell),
      minY = Math.floor(Math.min(...corners.map(p => p[1])) / cell), maxY = Math.ceil(Math.max(...corners.map(p => p[1])) / cell);
    for (let x = minX; x < maxX; x++) for (let y = minY; y < maxY; y++) {
      const shade = Math.abs((x * 31 + y * 17) % 9);
      ctx.fillStyle = shade < 3 ? '#9cc0bd05' : '#03192307';
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
    ctx.strokeStyle = '#87bfc315'; ctx.lineWidth = .65 / m.scale;
    ctx.beginPath();
    for (let x = minX; x <= maxX; x++) { ctx.moveTo(x * cell, minY * cell); ctx.lineTo(x * cell, maxY * cell); }
    for (let y = minY; y <= maxY; y++) { ctx.moveTo(minX * cell, y * cell); ctx.lineTo(maxX * cell, y * cell); }
    ctx.stroke();
    this.elevation = Math.min(22, 5 + Math.sqrt(m.zoom) * 1.7);
    const features = this.political?.features || [];
    this.features = features.map(f => ({ feature: f, path: this.path(f.id, f.geometry) }));
    // A lower, dark copy of each coast and a raised upper surface produce real
    // depth without requiring a GPU or inventing a terrain elevation dataset.
    this.worldTransform(ctx, -3);
    for (const row of this.features) { ctx.fillStyle = '#081d24'; ctx.fill(row.path, 'evenodd'); }
    for (let height = 0; height <= this.elevation; height += Math.max(2, this.elevation / 5)) {
      this.worldTransform(ctx, height);
      for (const row of this.features) {
        const owner = s.world?.control?.[row.feature.id] || row.feature.owner;
        ctx.fillStyle = mix(POWERS[owner]?.color, '#182d2c', .68); ctx.fill(row.path, 'evenodd');
      }
    }
    this.worldTransform(ctx, this.elevation);
    ctx.lineWidth = .8 / m.scale; ctx.strokeStyle = '#d5dac54d';
    for (const row of this.features) {
      const owner = s.world?.control?.[row.feature.id] || row.feature.owner;
      ctx.fillStyle = mix(POWERS[owner]?.color, '#a2a78a', .48); ctx.fill(row.path, 'evenodd'); ctx.stroke(row.path);
    }
    for (const front of fronts) {
      const territories = features.filter(f => front.territories?.includes(f.id));
      const path = new Path2D(territories.map(f => geometryPath(occupiedGeometry(f.geometry, front), this.chart().rotation || 0)).join(''));
      ctx.fillStyle = mix(POWERS[front.attacker]?.color, '#aa8462', .3); ctx.globalAlpha = .8; ctx.fill(path, 'evenodd'); ctx.globalAlpha = 1;
    }
    this.screenTransform(ctx);
    // Geographic labels remain readable rather than rotating with the atlas.
    if (m.zoom < 5) {
      ctx.font = '600 11px system-ui'; ctx.textAlign = 'center'; ctx.letterSpacing = '1px';
      for (const f of features.filter(f => ['c2', 'c200', 'c255w', 'c740', 'c365w', 'c710', 'c220', 'c325', 'c900'].includes(f.id))) {
        const owner = s.world?.control?.[f.id] || f.owner, [x, y] = this.geo(f.point, this.elevation);
        ctx.fillStyle = '#172e2c'; ctx.fillText(f.id === 'c900' ? 'AUSTRALIA' : f.id === 'c365w' ? 'SOVIET UNION' : owner, x, y);
      }
      ctx.letterSpacing = '0px';
    }
  }
  addHit(selection, bounds) {
    if (!intersectsViewport(bounds, { width: this.width, height: this.height }, 10)) return;
    this.hits.push({ ...selection, bounds });
  }
  label(text, x, y, color = '#d6e0d9', { always = false, size = 11 } = {}) {
    const ctx = this.ctx; ctx.font = `${size}px system-ui`; ctx.textAlign = 'left';
    const bounds = { x: x - 3, y: y - size, width: ctx.measureText(text).width + 6, height: size + 5 };
    if (!always && this.labels.some(old => intersectsViewport(bounds, old, 2))) return;
    if (!intersectsViewport(bounds, { width: this.width, height: this.height })) return;
    this.labels.push(bounds); ctx.fillStyle = '#102934df'; ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.fillStyle = color; ctx.fillText(text, x, y);
  }
  paint(now) {
    if (!this.ready || !this.current || !this.viewport) return;
    const start = performance.now(), s = this.current.state, chart = this.chart(), ctx = this.ctx;
    this.camera = sceneCamera(chart, this.viewport); this.backdrop();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(this.background, 0, 0); this.screenTransform(ctx);
    this.hits = []; this.labels = [];
    const minute = visualMinute(this.previous, this.current, now), detail = chart.zoom >= FLEET_DETAIL_ZOOM;
    const coverage = uiModel(s)?.escortCoverage;
    if (coverage?.escorts?.length) {
      this.worldTransform(ctx); ctx.fillStyle = '#91c6a312'; ctx.strokeStyle = '#90c6a43b'; ctx.lineWidth = .7 / this.camera.scale;
      for (const escort of coverage.escorts) {
        const f = visualFleet(this.previous, this.current, escort.id, minute);
        const position = f ? fleetPosition(s, f, minute) : escort.position;
        const path = new Path2D(polygonPath([escortCircle(position)], chart.rotation || 0)); ctx.fill(path); ctx.stroke(path);
      }
      this.screenTransform(ctx);
    }
    const selected = this.current.forces.get(chart.convoyId || chart.fleetId);
    if (selected) {
      this.worldTransform(ctx); ctx.strokeStyle = '#e7c885a8'; ctx.lineWidth = 1.4 / this.camera.scale; ctx.setLineDash([5 / this.camera.scale, 5 / this.camera.scale]);
      ctx.stroke(new Path2D(linePath(remainingRoute(s, selected, Math.max(minute, selected.departAt || minute)), chart.rotation || 0))); ctx.setLineDash([]); this.screenTransform(ctx);
    }
    // Ports and capitals are separate picks from fleets, with their existing
    // strategic information available through the same hover callback.
    for (const [id, port] of Object.entries(PORTS)) {
      const point = PORT_LOCATIONS[id] || NODES[id]; if (!point) continue;
      const [x, y] = this.geo(point, this.elevation), color = POWERS[s.world?.portControl?.[id] || port.nation]?.color || '#bcc8b4';
      if (!intersectsViewport({ x: x - 8, y: y - 8, width: 16, height: 16 }, { width: this.width, height: this.height })) continue;
      ctx.fillStyle = '#10232c'; ctx.fillRect(x - 4, y - 2, 8, 7); ctx.fillStyle = mix(color, '#e8e1b8', .3); ctx.fillRect(x - 4, y - 5, 8, 5);
      this.addHit({ kind: 'port', id, label: port.name }, { x: x - 9, y: y - 10, width: 18, height: 18 });
      if (!detail) this.label(port.name, x + 8, y + 5, '#c4d2c9');
    }
    if (!detail) for (const [id, capital] of Object.entries(MAP_CAPITALS)) {
      const [x, y] = this.geo(capital.point, this.elevation + 2);
      ctx.fillStyle = '#e1d0a1'; ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 4); ctx.lineTo(x - 4, y); ctx.closePath(); ctx.fill();
      this.addHit({ kind: 'country', id, label: capital.name }, { x: x - 7, y: y - 7, width: 14, height: 14 });
      this.label(capital.name, x + 7, y - 5, '#e6d9b8');
    }
    for (const front of s.world?.fronts || []) {
      if (front.progress <= 0 || front.progress >= 1) continue;
      const [x, y] = this.geo(frontPosition(front), this.elevation + 3);
      ctx.strokeStyle = '#f0a98d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 10, y - 4); ctx.lineTo(x + 10, y + 4); ctx.stroke();
      this.addHit({ kind: 'front', id: front.id, label: front.name }, { x: x - 13, y: y - 9, width: 26, height: 18 });
    }
    for (const convoy of s.nations[s.player].convoys || []) {
      if (!convoyUnderway(convoy, minute)) continue;
      const force = visualFleet(this.previous, this.current, convoy.id, minute) || convoy;
      const position = fleetPosition(s, force, minute), [x, y] = this.geo(position);
      const covered = coverageAt(coverage?.escorts || [], position).defense > 0;
      ctx.strokeStyle = covered ? '#95c6a2' : '#d88974'; ctx.lineWidth = 1.2; ctx.setLineDash(covered ? [] : [3, 3]);
      ctx.beginPath(); ctx.ellipse(x, y, 10, 7, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#dfcdaa'; ctx.fillRect(x - 4, y - 3, 8, 6);
      this.addHit({ kind: 'convoy', id: convoy.id, label: `${convoy.name}: ${convoy.count} merchants` }, { x: x - 10, y: y - 8, width: 20, height: 16 });
    }
    for (const contact of visibleContacts(s)) {
      const [x, y] = this.geo(contact.position);
      if (contact.id === chart.contactId || detail) {
        const edge = this.geo([contact.position[0], clamp(contact.position[1] + contact.uncertainty / 60, -85, 85)]);
        const radius = clamp(Math.hypot(edge[0] - x, edge[1] - y), 14, this.width * .6);
        ctx.strokeStyle = '#ed997747'; ctx.fillStyle = '#e78e6810'; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.ellipse(x, y, radius * 1.4, radius * .75, -.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.globalAlpha = Math.max(.22, contact.confidence); ctx.fillStyle = '#e4a48b';
      ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 7, y); ctx.lineTo(x, y + 7); ctx.lineTo(x - 7, y); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
      this.addHit({ kind: 'contact', id: contact.id, label: `${contact.nation} ${contact.kind} · ${contact.stage} intelligence` }, { x: x - 10, y: y - 10, width: 20, height: 20 });
      if (detail || contact.id === chart.contactId) this.label(`${contact.nation} · ${contact.stage} report`, x + 12, y, '#e8b49a');
    }
    const drawnHulls = [], clusters = new Map(), occupiedFormations = [], landMask = detail ? this.waterMask() : null;
    for (const row of this.fleets || []) {
      const f = visualFleet(this.previous, this.current, row.fleet.id, minute) || row.fleet;
      const point = mapPoint(fleetPosition(s, f, minute), chart.rotation || 0);
      const locationKey = `${Math.round(point[0] * 2)}:${Math.round(point[1] * 2)}`;
      const sibling = clusters.get(locationKey) || 0; clusters.set(locationKey, sibling + 1);
      // Co-located forces fan out only for inspection; their true position is
      // joined by a leader. This prevents one force hiding another in harbour.
      const spread = sibling ? Math.sqrt(sibling) * (detail ? 8 : 26 / this.camera.scale) : 0;
      const angle = sibling * 2.399963;
      const preferred = [point[0] + Math.cos(angle) * spread, point[1] + Math.sin(angle) * spread];
      // Raised shores project north of their sea-level footprint. Include that
      // displacement at small fleet scales so a hull cannot visually overlap a
      // cliff even though its geographic centre is technically over water.
      const clearance = detail ? Math.max(3.2, 2.2 + this.elevation / (this.camera.scale * ISO_TILT)) : 3.2;
      if (row.clearance !== clearance) { row.formationBounds = formationBounds(row.hulls, clearance); row.clearance = clearance; }
      const anchor = detail ? waterFormationAnchor(preferred, row.formationBounds,
        rectangle => clearWaterRectangle(landMask, rectangle), occupiedFormations, this.waterOffsets.get(f.id)) : preferred;
      if (detail) {
        this.waterOffsets.set(f.id, [anchor[0] - preferred[0], anchor[1] - preferred[1]]);
        occupiedFormations.push(translatedBounds(row.formationBounds, anchor));
      }
      row.anchor = anchor;
      const [x, y] = scenePoint(this.camera, anchor), truePoint = scenePoint(this.camera, point);
      const selectedFleet = f.id === chart.fleetId;
      if (Math.hypot(anchor[0] - point[0], anchor[1] - point[1]) > .05) {
        ctx.strokeStyle = '#b9d0c350'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(...truePoint); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = '#b9d0c380'; ctx.beginPath(); ctx.arc(...truePoint, 2, 0, Math.PI * 2); ctx.fill();
      }
      if (detail) {
        for (const hull of row.hulls) {
          const world = [anchor[0] + hull.offset[0], anchor[1] + hull.offset[1]], pos = scenePoint(this.camera, world);
          const type = this.content.classes[hull.classId]?.type || 'DD';
          const model = voxelModelFor(hull.classId, { campaign: s.campaignId, type });
          if (!model) continue;
          const projection = sceneHullProjection(model, this.camera, pos);
          // At ship-inspection zoom the bow can remain visible long after its
          // centre leaves the screen. Cull against the actual projected hull.
          if (!intersectsViewport(projection.bounds, { width: this.width, height: this.height }, 4)) continue;
          drawnHulls.push({ ...hull, x: pos[0], y: pos[1], world, model, projection, fleetId: f.id, nation: s.player, selectedFleet });
        }
        if (intersectsViewport({ x: x - 4, y: y - 4, width: 8, height: 8 }, { width: this.width, height: this.height })) {
          const top = Math.min(...row.hulls.map(h => scenePoint(this.camera, [anchor[0] + h.offset[0], anchor[1] + h.offset[1]])[1]));
          this.label(`${f.name} · ${row.hulls.length} ships`, x, top - 30, selectedFleet ? '#f0d396' : '#b4caca', { always: selectedFleet, size: 12 });
        }
      } else {
        ctx.fillStyle = selectedFleet ? '#e9cc90' : mix(PROFILES[s.player]?.color, '#d8e4ca', .5);
        ctx.strokeStyle = '#132936'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 9, y + 6); ctx.lineTo(x, y + 2); ctx.lineTo(x - 9, y + 6); ctx.closePath(); ctx.fill(); ctx.stroke();
        if (selectedFleet) { ctx.strokeStyle = '#e9cc90'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.ellipse(x, y, 17, 12, 0, 0, Math.PI * 2); ctx.stroke(); }
        this.addHit({ kind: 'fleet', id: f.id, label: `${f.name} · ${row.hulls.length} ships` }, { x: x - 13, y: y - 13, width: 26, height: 26 });
        if (chart.zoom >= 2 || selectedFleet) this.label(`${f.name} · ${row.hulls.length}`, x + 13, y - 4, selectedFleet ? '#e9cc90' : '#d0dcce', { always: selectedFleet });
      }
    }
    drawnHulls.sort((a, b) => a.y - b.y || a.x - b.x);
    for (const hull of drawnHulls) {
      const { model, projection: { scale, heading } } = hull;
      const sprite = this.sprite(model, scale, heading);
      const selectedHull = this.selectedHull === hull.key;
      ctx.fillStyle = '#061c2a50'; ctx.beginPath(); ctx.ellipse(hull.x, hull.y + 3,
        Math.max(4, sprite.bounds.width * .54), Math.max(2, sprite.bounds.height * .22), -.12, 0, Math.PI * 2); ctx.fill();
      if (selectedHull) { ctx.strokeStyle = '#efce86'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(hull.x, hull.y + 3,
        Math.max(9, sprite.bounds.width * .65), Math.max(6, sprite.bounds.height * .45), -.12, 0, Math.PI * 2); ctx.stroke(); }
      ctx.drawImage(sprite.canvas, hull.x + sprite.bounds.x - 2, hull.y + sprite.bounds.y - 2,
        sprite.canvas.width / this.dpr, sprite.canvas.height / this.dpr);
      const bounds = { x: hull.x + sprite.bounds.x, y: hull.y + sprite.bounds.y,
        width: Math.max(8, sprite.bounds.width), height: Math.max(8, sprite.bounds.height) };
      this.addHit({ kind: 'ship', id: hull.groupId, hullIndex: hull.hullIndex, classId: hull.classId,
        nation: hull.nation, fleetId: hull.fleetId, label: hull.label, key: hull.key }, bounds);
      if (chart.zoom >= 32 || selectedHull || hull.key === this.hoverSelection?.key)
        this.label(hull.label, hull.x + sprite.bounds.x, hull.y + sprite.bounds.y - 5, selectedHull ? '#f0d598' : '#c6d4cb', { always: selectedHull, size: 10 });
    }
    const level = chart.zoom >= FLEET_DETAIL_ZOOM ? 'Fleet detail' : chart.zoom >= 3 ? 'Operational atlas' : 'Strategic atlas';
    const levelNode = this.surface.querySelector('.isometric-level');
    const levelText = `${level} · ${Number(chart.zoom || 1).toFixed(1)}×`;
    if (levelNode.textContent !== levelText) levelNode.textContent = levelText;
    const caption = detail ? 'Ships enlarged · review formations placed in clear water · leaders mark true positions. Click a hull to inspect; enemy diamonds remain reports.' : 'Isometric naval atlas · drag to pan · scroll or double-click a fleet to inspect its ships.';
    this.surface.querySelector('.isometric-caption').textContent = caption;
    this.surface.querySelector('[data-iso-camera="out"]').disabled = chart.zoom <= 1;
    this.surface.querySelector('[data-iso-camera="in"]').disabled = chart.zoom >= MAX_SCENE_ZOOM;
    this.renderRoster(detail); this.renderAccessible();
    this.canvas.dataset.lod = detail ? 'fleet' : 'strategic';
    this.canvas.dataset.visibleHulls = String(this.hits.filter(h => h.kind === 'ship').length);
    this.canvas.dataset.totalHulls = String((this.fleets || []).reduce((n, f) => n + f.hulls.length, 0));
    this.canvas.dataset.sceneFrames = String(++this.frames);
    this.canvas.dataset.sceneCpuMs = (performance.now() - start).toFixed(2);
    this.lastPaint = now;
  }
  sprite(model, scale, heading) {
    const key = `${model.id}:${scale.toFixed(4)}:${heading}:${this.dpr}`;
    if (this.spriteCache.has(key)) {
      const sprite = this.spriteCache.get(key); this.spriteCache.delete(key); this.spriteCache.set(key, sprite); return sprite;
    }
    const bounds = voxelBounds(voxelFaces(model, { heading, scale }));
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.ceil((bounds.width + 4) * this.dpr));
    canvas.height = Math.max(1, Math.ceil((bounds.height + 4) * this.dpr));
    const ctx = canvas.getContext('2d'); ctx.scale(this.dpr, this.dpr);
    drawVoxelShip(ctx, model, { x: -bounds.x + 2, y: -bounds.y + 2, scale, heading, outline: scale > .25, cache: false });
    const sprite = { canvas, bounds };
    // Close-up sprites have much larger backing buffers. Retain at most 32 MiB
    // of RGBA pixels, evicting least-recently-used scales/models first. The
    // shared rasterizer does not retain a second copy of these map sprites.
    const pixels = canvas.width * canvas.height, budget = 8 * 1024 * 1024;
    let retained = [...this.spriteCache.values()].reduce((sum, row) => sum + row.canvas.width * row.canvas.height, 0);
    while (this.spriteCache.size && (retained + pixels > budget || this.spriteCache.size >= 350)) {
      const oldest = this.spriteCache.keys().next().value, row = this.spriteCache.get(oldest);
      retained -= row.canvas.width * row.canvas.height; this.spriteCache.delete(oldest);
    }
    if (pixels <= budget) this.spriteCache.set(key, sprite);
    return sprite;
  }
  nearestFleet() {
    const selected = this.fleets?.find(row => row.fleet.id === this.chart().fleetId);
    if (selected) return selected;
    return [...(this.fleets || [])].sort((a, b) => {
      const dist = row => { const point = this.geo(fleetPosition(this.current.state, row.fleet)); return Math.hypot(point[0] - this.camera.x, point[1] - this.camera.y); };
      return dist(a) - dist(b);
    })[0];
  }
  renderRoster(detail) {
    const element = this.surface.querySelector('.isometric-roster'), fleet = this.nearestFleet();
    element.hidden = !detail || !fleet;
    if (!detail || !fleet) return;
    if (this.rosterFleet !== fleet.fleet.id) { this.rosterFleet = fleet.fleet.id; this.rosterPage = 0; }
    const pages = Math.max(1, Math.ceil(fleet.hulls.length / 40)); this.rosterPage = clamp(this.rosterPage, 0, pages - 1);
    const key = `${fleet.fleet.id}:${fleet.hulls.length}:${this.rosterPage}:${this.current.at}`;
    if (key === this.rosterKey) return; this.rosterKey = key;
    element.querySelector('summary').textContent = `${fleet.fleet.name} · ${fleet.hulls.length} ships`;
    const body = element.querySelector('.isometric-roster-body'), rows = fleet.hulls.slice(this.rosterPage * 40, (this.rosterPage + 1) * 40);
    this.rosterSelections = rows.map(h => ({ kind: 'ship', id: h.groupId, hullIndex: h.hullIndex, classId: h.classId,
      nation: this.current.state.player, fleetId: fleet.fleet.id, key: h.key, label: h.label }));
    body.innerHTML = '<p>Every surviving hull is represented. Groups share their recorded condition; formation spacing is illustrative.</p>' +
      rows.map((h, i) => `<button type="button" data-iso-target="roster:${i}">${esc(h.label)}<small>${esc(this.content.classes[h.classId]?.type || 'Ship')} · ${Math.round((h.group.health ?? 1) * 100)}% group condition</small></button>`).join('') +
      (pages > 1 ? `<div class="isometric-roster-pages"><button data-iso-page="-1" ${this.rosterPage === 0 ? 'disabled' : ''}>Previous</button><span>${this.rosterPage + 1} / ${pages}</span><button data-iso-page="1" ${this.rosterPage === pages - 1 ? 'disabled' : ''}>Next</button></div>` : '');
  }
  renderAccessible() {
    this.accessibleTargets = new Map(this.hits.map((hit, i) => [`hit:${i}`, hit]));
    (this.rosterSelections || []).forEach((selection, i) => this.accessibleTargets.set(`roster:${i}`, selection));
    const node = this.surface.querySelector('.isometric-accessibility');
    const visible = this.hits.map((h, i) => ({ h, i })).filter(({ h }) => intersectsViewport(h.bounds, this.viewport));
    const key = visible.map(({ h, i }) => `${i}:${keyOf(h)}`).join('|');
    if (key !== this.accessibilityKey) {
      this.accessibilityKey = key;
      node.innerHTML = visible.map(({ h, i }) => `<button type="button" data-iso-target="hit:${i}" data-iso-kind="${h.kind}" data-id="${esc(h.id)}" ${h.hullIndex === undefined ? '' : `data-hull-index="${h.hullIndex}"`} aria-label="${esc(h.label)}">${esc(h.label)}</button>`).join('');
    }
    for (const button of node.children) {
      const hit = this.accessibleTargets.get(button.dataset.isoTarget); if (!hit) continue;
      Object.assign(button.style, { left: hit.bounds.x + 'px', top: hit.bounds.y + 'px', width: Math.max(16, hit.bounds.width) + 'px', height: Math.max(16, hit.bounds.height) + 'px' });
    }
  }
  pick(point, terrain = true) {
    for (let i = this.hits.length - 1; i >= 0; i--) if (containsPoint(this.hits[i].bounds, point, 3)) return this.hits[i];
    if (terrain) {
      const world = sceneInverse(this.camera, [point[0], point[1] + this.elevation]);
      this.ctx.save(); this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      try { for (let i = this.features.length - 1; i >= 0; i--) if (this.ctx.isPointInPath(this.features[i].path, world[0], world[1], 'evenodd')) {
        const f = this.features[i].feature; return { kind: 'territory', id: f.id, label: f.name };
      } } finally { this.ctx.restore(); }
    }
    return null;
  }
  local(event) { const rect = this.canvas.getBoundingClientRect(); return [event.clientX - rect.left, event.clientY - rect.top]; }
  hover(selection, event) {
    const key = keyOf(selection); this.canvas.style.cursor = selection ? 'pointer' : 'grab';
    if (key === this.hoverKey) return;
    this.hoverKey = key; this.hoverSelection = selection;
    this.onHover(selection, { clientX: event.clientX, clientY: event.clientY });
    if (this.current.state.paused) this.paint(performance.now());
  }
  pointerDown(event) {
    if (event.button !== 0 || !this.active()) return;
    event.preventDefault(); this.canvas.focus({ preventScroll: true });
    const point = this.local(event); this.drag = { id: event.pointerId, point, cx: this.chart().cx ?? 600, cy: this.chart().cy ?? 300, moved: false };
    this.canvas.setPointerCapture(event.pointerId); this.hover(null, event);
  }
  pointerMove(event) {
    if (!this.active()) return;
    const point = this.local(event);
    if (!this.drag || event.pointerId !== this.drag.id) { this.hover(this.pick(point), event); return; }
    if (Math.hypot(point[0] - this.drag.point[0], point[1] - this.drag.point[1]) < 4 && !this.drag.moved) return;
    this.drag.moved = true; this.canvas.style.cursor = 'grabbing';
    const camera = { ...this.camera, cx: this.drag.cx, cy: this.drag.cy };
    const start = sceneInverse(camera, this.drag.point), end = sceneInverse(camera, point);
    this.chart().cx = this.drag.cx + start[0] - end[0]; this.chart().cy = this.drag.cy + start[1] - end[1];
    this.paint(performance.now());
  }
  pointerUp(event, cancelled = false) {
    if (!this.drag || event.pointerId !== this.drag.id) return;
    const moved = this.drag.moved; this.drag = null;
    try { this.canvas.releasePointerCapture(event.pointerId); } catch {}
    this.canvas.style.cursor = 'grab';
    if (moved) this.commitCamera();
    else if (!cancelled) {
      const hit = this.pick(this.local(event)); clearTimeout(this.selectTimer);
      if (hit) this.selectTimer = setTimeout(() => this.select(hit), 200);
    }
  }
  select(selection) {
    if (selection.kind === 'ship') { this.selectedHull = `${selection.id}:${selection.hullIndex}`; this.paint(performance.now()); }
    this.onSelect({ ...selection });
  }
  doubleClick(event) {
    if (!this.active()) return; event.preventDefault(); clearTimeout(this.selectTimer);
    const point = this.local(event), hit = this.pick(point, false);
    if (hit?.kind === 'fleet') { this.focus('fleet', hit.id, { zoom: true }); this.onSelect({ ...hit, zoom: true }); }
    else if (hit?.kind === 'ship') this.select(hit);
    else { sceneZoomAt(this.chart(), this.viewport, point, this.chart().zoom * 2); this.paint(performance.now()); this.commitCamera(); }
  }
  wheel(event) {
    if (!this.active()) return; event.preventDefault(); this.hover(null, event);
    sceneZoomAt(this.chart(), this.viewport, this.local(event), this.chart().zoom * Math.exp(-clamp(event.deltaY, -160, 160) * .002));
    this.paint(performance.now()); clearTimeout(this.cameraTimer); this.cameraTimer = setTimeout(() => this.commitCamera(), 180);
  }
  keydown(event) {
    const directions = { ArrowLeft: [70, 0], ArrowRight: [-70, 0], ArrowUp: [0, 70], ArrowDown: [0, -70] };
    if (directions[event.key]) {
      event.preventDefault(); event.stopPropagation(); const delta = directions[event.key], centre = [this.camera.x, this.camera.y];
      const a = sceneInverse(this.camera, centre), b = sceneInverse(this.camera, [centre[0] + delta[0], centre[1] + delta[1]]);
      this.chart().cx -= b[0] - a[0]; this.chart().cy -= b[1] - a[1]; this.paint(performance.now()); this.commitCamera();
    } else if (['Home', 'PageUp', 'PageDown'].includes(event.key)) {
      event.preventDefault(); event.stopPropagation(); this.control(event.key === 'Home' ? 'home' : event.key === 'PageUp' ? 'in' : 'out');
    }
  }
  control(action) {
    if (action === 'home') { Object.assign(this.chart(), { zoom: 1, cx: 600, cy: 300, rotation: 0 }); this.selectedHull = null; }
    else if (action === 'fleet') {
      const row = this.nearestFleet(); if (row) { this.focus('fleet', row.fleet.id, { zoom: true }); this.onSelect({ kind: 'fleet', id: row.fleet.id, zoom: true }); } return;
    } else sceneZoomAt(this.chart(), this.viewport, [this.camera.x, this.camera.y], this.chart().zoom * (action === 'in' ? 1.6 : 1 / 1.6));
    this.paint(performance.now()); this.commitCamera();
  }
  focus(kind, id, { zoom = false } = {}) {
    if (!this.current) return false;
    const position = chartPosition(this.current.state, this.political, kind, id); if (!position) return false;
    const chart = this.chart(); chart.rotation = position[0];
    const point = mapPoint(position, chart.rotation); chart.cx = point[0]; chart.cy = point[1]; chart.focusPoint = [...position];
    if (zoom) chart.zoom = Math.max(48, chart.zoom || 1);
    if (kind === 'fleet') chart.fleetId = id;
    this.backgroundKey = ''; this.refresh();
    const row = kind === 'fleet' && this.fleets.find(f => f.fleet.id === id);
    if (row?.anchor && chart.zoom >= FLEET_DETAIL_ZOOM) { chart.cx = row.anchor[0]; chart.cy = row.anchor[1]; this.paint(performance.now()); }
    this.commitCamera(); return true;
  }
  commitCamera() { this.onCameraChange({ ...this.chart() }); }
}
