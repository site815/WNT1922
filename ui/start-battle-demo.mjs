import { BattleWatchScene } from './battle-watch.mjs';
import { loadVoxelModels, voxelModelFor } from './voxel-models.mjs';
import { updateDOM } from './dom-update.mjs';
import { DEMO_BATTLES, createDemoReport, demoCanPlay } from './start-battle-data.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const DEMO_INTERVAL = 3600;
const CAMPAIGN = 'campaign_1922';

// The title screen owns only this local presentation state. In particular there
// is no simulation client, save store, random generator or game-action import.
export class StartBattleDemo {
  constructor({root}) {
    this.root = root; this.battleIndex = 0; this.frameIndex = 0; this.selected = null;
    this.paused = false; this.ready = false; this.active = false; this.generation = 0;
    this.report = createDemoReport(DEMO_BATTLES[0]);
  }
  get battle() { return DEMO_BATTLES[this.battleIndex]; }
  canPlay() {
    return demoCanPlay({active:this.active,connected:this.host?.isConnected,hidden:document.hidden,
      reducedMotion:this.media?.matches,paused:this.paused,modal:Boolean(this.root.querySelector('.modal-backdrop'))});
  }
  mount() {
    const host = this.root.querySelector('.start-demo-host');
    if (!host) {this.stop(); return;}
    if (this.active && this.host === host) {this.syncPlayback(); return;}
    this.stop(); this.host = host; this.active = true;
    const generation = ++this.generation;
    this.media = matchMedia('(prefers-reduced-motion: reduce)');
    this.controller = new AbortController();
    host.addEventListener('click', event => this.click(event), {signal:this.controller.signal});
    this.visibility = () => this.syncPlayback();
    document.addEventListener('visibilitychange', this.visibility);
    this.media.addEventListener('change', this.visibility);
    this.scene = new BattleWatchScene({root:host,onSelect:selection => {this.selected = selection; this.render();}});
    const draw = this.scene.draw.bind(this.scene);
    this.scene.draw = now => {
      if (!this.active || !this.scene) return;
      if (document.hidden) {cancelAnimationFrame(this.scene.raf); this.scene.raf = null; return;}
      // A paused/reduced-motion demonstration is a static, inspectable frame.
      if (!this.canPlay()) this.scene.started = now - 1000;
      draw(now); this.publishHits();
    };
    this.render();
    this.resize = new ResizeObserver(() => this.scene?.draw(performance.now()));
    this.resize.observe(host);
    this.modalObserver = new MutationObserver(() => this.syncPlayback());
    this.modalObserver.observe(this.root, {childList:true,subtree:true});
    loadVoxelModels().then(() => {
      if (!this.active || generation !== this.generation) return;
      this.ready = true; this.error = ''; this.render();
    }).catch(() => {
      if (!this.active || generation !== this.generation) return;
      this.error = 'Detailed ship models are unavailable; basic silhouettes remain selectable.';
      this.render();
    });
  }
  stop() {
    this.active = false; this.generation++;
    clearTimeout(this.timer); this.timer = null;
    this.scene?.clear(); this.scene = null;
    this.resize?.disconnect(); this.resize = null;
    this.modalObserver?.disconnect(); this.modalObserver = null;
    this.controller?.abort(); this.controller = null;
    if (this.visibility) document.removeEventListener('visibilitychange', this.visibility);
    if (this.media && this.visibility) this.media.removeEventListener('change', this.visibility);
    this.visibility = null; this.media = null; this.host = null; this.playing = false;
  }
  syncPlayback() {
    if (!this.active) return;
    const playing = this.canPlay(), changed = playing !== this.playing;
    this.playing = playing;
    const el = this.host.querySelector('.start-demo');
    if (el) el.dataset.demoPlaying = String(playing);
    const toggle = this.host.querySelector('[data-demo-action="toggle"]');
    if (toggle) {
      const label = this.media.matches ? 'Reduced motion · paused' : this.paused ? 'Play demo' : 'Pause demo';
      // This method also runs from the modal child-list observer. Replacing an
      // unchanged text node would continually retrigger that observer.
      if (toggle.textContent !== label) toggle.textContent = label;
      toggle.disabled = this.media.matches;
      toggle.setAttribute('aria-pressed', String(this.paused || this.media.matches));
    }
    if (!playing) {
      clearTimeout(this.timer); this.timer = null;
      if (this.scene) {cancelAnimationFrame(this.scene.raf); this.scene.raf = null;}
    } else if (!this.timer) {
      this.timer = setTimeout(() => {this.timer = null; if (this.canPlay()) this.advance(); else this.syncPlayback();}, DEMO_INTERVAL);
    }
    if (changed && !document.hidden && this.scene?.frame) this.scene.draw(performance.now());
  }
  advance() {
    if (this.frameIndex >= this.battle.stages.length - 1) this.changeBattle(1);
    else {this.frameIndex++; this.render();}
  }
  changeBattle(step) {
    clearTimeout(this.timer); this.timer = null;
    this.battleIndex = (this.battleIndex + step + DEMO_BATTLES.length) % DEMO_BATTLES.length;
    this.frameIndex = 0; this.selected = null; this.report = createDemoReport(this.battle);
    this.render();
  }
  click(event) {
    const button = event.target.closest('[data-demo-action]');
    if (!button || !this.host.contains(button) || button.disabled) return;
    event.preventDefault();
    switch (button.dataset.demoAction) {
      case 'toggle': this.paused = !this.paused; this.syncPlayback(); break;
      case 'next': this.paused = true; this.advance(); break;
      case 'next-battle': this.changeBattle(1); break;
      case 'previous-battle': this.changeBattle(-1); break;
      case 'fit': this.scene.fit(); this.scene.zoom = 1.25; this.scene.draw(performance.now()); break;
      case 'select-ship': this.selected = {side:button.dataset.demoSide,id:button.dataset.demoId,hullIndex:0}; this.render(); break;
    }
  }
  publishHits() {
    if (!this.host || !this.scene?.canvas) return;
    const rect = this.scene.canvas.getBoundingClientRect();
    for (const button of this.host.querySelectorAll('[data-demo-action="select-ship"]')) {
      const hit = this.scene.hits.find(h => h.unit.side === button.dataset.demoSide && h.unit.id === button.dataset.demoId);
      const x = hit && hit.box.x + hit.box.width / 2, y = hit && hit.box.y + hit.box.height / 2;
      button.dataset.demoVisible = String(Boolean(hit && x >= 0 && y >= 0 && x < rect.width && y < rect.height));
      if (hit) {button.dataset.demoX = x.toFixed(2); button.dataset.demoY = y.toFixed(2);}
      else {delete button.dataset.demoX; delete button.dataset.demoY;}
    }
  }
  render() {
    if (!this.active) return;
    const battle = this.battle, stage = battle.stages[this.frameIndex], frame = this.report.replay.frames[this.frameIndex];
    const chosen = this.selected && frame['groups' + this.selected.side].find(s => s.id === this.selected.id);
    const model = chosen && voxelModelFor(chosen.classId, {campaign:CAMPAIGN,type:chosen.type});
    updateDOM(this.host, `<div class="start-demo" data-demo-battle="${battle.id}" data-demo-frame="${this.frameIndex}" data-demo-frames="${battle.stages.length}" data-demo-playing="${this.canPlay()}" data-demo-ready="${this.ready}">
      <header class="start-demo-heading"><div><span class="start-demo-eyebrow">Famous naval battles · ${this.battleIndex + 1} / ${DEMO_BATTLES.length}</span><h2>${esc(battle.title)}</h2><p>${esc(battle.date)} <span>· ${esc(battle.subtitle)}</span></p></div><div class="start-demo-navigation"><button data-demo-action="previous-battle" aria-label="Previous battle">←</button><button data-demo-action="next-battle" aria-label="Next battle">→</button></div></header>
      <div class="start-demo-stage" data-key="demo-stage" data-preserve="true"><canvas class="battle-canvas" tabindex="0" role="img" aria-label="Interactive illustrative naval battle. Click a ship to inspect it; scroll to zoom and drag to pan."></canvas><span class="start-demo-canvas-label">Isometric battle viewer</span></div>
      <div class="start-demo-toolbar"><div><button data-demo-action="toggle">${this.paused ? 'Play demo' : 'Pause demo'}</button><button data-demo-action="next">Next stage →</button><button data-demo-action="fit">Fit ships</button></div><span>Stage ${this.frameIndex + 1} / ${battle.stages.length}</span></div>
      <div class="start-demo-phase"><strong>${esc(stage.label)}</strong><p>${esc(stage.note)}</p></div>
      <div class="start-demo-roster" aria-label="Ships in the demonstration">${['A','B'].map(side => `<div class="start-demo-roster-side">${frame['groups' + side].map(s => `<button data-key="demo-ship-${side}-${s.id}" class="demo-ship-chip ${this.selected?.id === s.id ? 'selected' : ''} ${s.sunk ? 'is-sunk' : ''}" data-demo-action="select-ship" data-demo-side="${side}" data-demo-id="${s.id}" aria-pressed="${chosen?.id === s.id}"><span>${esc(s.name)}</span><small>${s.sunk ? 'Lost' : s.type}</small></button>`).join('')}</div>`).join('')}</div>
      ${chosen ? `<section class="start-demo-inspection" data-demo-side="${this.selected.side}" data-demo-id="${chosen.id}"><div><strong>${esc(chosen.name)}</strong><span>${chosen.sunk ? 'Illustrative condition: sunk' : 'Illustrative damage: ' + Math.round((1 - chosen.health) * 100) + '%'}</span></div><p>Model: ${esc(model.name)} · ${esc(chosen.type)}. ${esc(chosen.modelNote)}</p></section>` : '<p class="start-demo-select-hint">Click a ship in the scene or its name to inspect its model and illustrative condition.</p>'}
      <div class="start-demo-disclaimer"><span>Illustrative demonstration · representative models</span><details><summary>History & models</summary><p>${esc(battle.history)}</p><p>${esc(battle.scope)}</p><p>Scripted stages and damage demonstrate the game renderer. They do not run your campaign, change a save or reproduce historical shot outcomes. Models use available catalog fits or generic type silhouettes; select a ship for its model details.</p><a href="${esc(battle.source.url)}" target="_blank" rel="noreferrer">${esc(battle.source.title)} ↗</a></details></div>
      ${this.error ? `<p class="start-demo-error" role="status">${esc(this.error)}</p>` : ''}
    </div>`);
    const changedBattle = this.scene.report?.id !== this.report.id;
    this.scene.refresh(this.report, CAMPAIGN, this.frameIndex, this.selected);
    if (changedBattle) {this.scene.zoom = 1.25; this.scene.draw(performance.now());}
    this.syncPlayback();
  }
}
