import {SCENARIOS, DOCTRINES, FORMATIONS, buildScenario, buildCustomScenario} from '../combatmechanics/index.mjs';
import {UnrealTacticalScene} from './unreal-scene.mjs';
import {updateDOM} from './dom-update.mjs';
import {nativeFPSLabel} from './native-performance.mjs';
import {TacticalSession, tacticalRunning} from './tactical-session.mjs';
import {tacticalCatalog, tacticalModelCampaigns, initialTacticalSetup, tacticalSetupConfig, TACTICAL_DOCTRINES, TACTICAL_FORMATIONS} from './tactical-setup.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number = (value,d=0) => Number(value || 0).toLocaleString('en-US',{maximumFractionDigits:d});
const pct = value => number(Math.max(0,Math.min(1,Number(value)||0))*100)+'%';
const label = value => String(value || '').replace(/[-_]/g,' ').replace(/^./,c=>c.toUpperCase());
const time = seconds => `${Math.floor(seconds/3600).toString().padStart(2,'0')}:${Math.floor(seconds/60%60).toString().padStart(2,'0')}:${Math.floor(seconds%60).toString().padStart(2,'0')}`;
const button = (text,action,extra='') => `<button type="button" data-tactical="${action}" ${extra}>${text}</button>`;
const select = (name,values,current,aria=name) => `<select data-setup="${name}" aria-label="${esc(aria)}">${values.map(v=>{const [id,text]=Array.isArray(v)?v:[v,label(v)];return `<option value="${esc(id)}" ${current===id?'selected':''}>${esc(text)}</option>`;}).join('')}</select>`;
const input = (name,value,attrs='') => `<input data-setup="${name}" type="number" value="${esc(value)}" ${attrs}>`;
const opens = new WeakMap();

export function tacticalEventText(event, ships = []) {
  const name = id => ships.find(ship=>ship.id===id)?.name || id || 'Unknown';
  const attacker = event.attackerId ? name(event.attackerId) : '';
  const target = event.targetId ? name(event.targetId) : '';
  const damage = Number.isFinite(event.damage) && event.damage>0 ? ` · ${pct(event.damage)} hull damage` : '';
  return `${label(event.kind)}${attacker?' · '+attacker:''}${target?' → '+target:''}${damage}${event.planes!=null?' · '+number(event.planes)+' aircraft':''}`;
}

function customFleet(setup, content, side) {
  const classes = Object.values(content.classes).sort((a,b)=>(a.nation||'').localeCompare(b.nation||'')||a.type.localeCompare(b.type)||a.name.localeCompare(b.name));
  const options = classes.map(ship=>[ship.id,`${ship.nation || '—'} · ${ship.type} · ${ship.name}`]);
  const rows = setup['ships'+side];
  return `<div class="tactical-custom-fleet">${rows.map((row,i)=>`<div class="tactical-fleet-row" data-key="${side}-${i}">${select(`class-${side}-${i}`,options,row.classId,`Fleet ${side}, ship class ${i+1}`)}<input type="number" min="1" max="120" step="1" data-setup="count-${side}-${i}" aria-label="Fleet ${side}, quantity ${i+1}" value="${esc(row.count)}">${button('×','remove-class',`data-side="${side}" data-row="${i}" aria-label="Remove Fleet ${side} ship class ${i+1}"`)}</div>`).join('')}<div class="tactical-add">${button('+ Add class','add-class',`data-side="${side}"`)}<span>${number(rows.reduce((sum,row)=>sum+Number(row.count||0),0))} / 120 hulls</span></div></div>`;
}

function doctrineHint(setup,side) {
  const doctrine=DOCTRINES[setup['doctrine'+side]],formation=FORMATIONS[setup['formation'+side]];
  if(!doctrine||!formation)return '';
  return `<p class="tactical-doctrine-hint">Surface ships seek ${pct(doctrine.preferredRange)} of gun range, sail at ${pct(doctrine.speedFraction)} of available speed and withdraw below ${pct(doctrine.withdrawHealth)} hull. Gunnery modifier ${number((doctrine.accuracy-1)*100)}%. Carriers keep their own standoff range. Initial stations ${number(formation.spacingKm,2)} km apart; ships then maneuver individually.</p>`;
}

export function tacticalSetupView(setup, content, scenarios = SCENARIOS, error = '') {
  const preset = scenarios.find(s=>s.id===setup.presetId);
  const source = preset?.sourceUrl && /^https:\/\//.test(preset.sourceUrl) ? `<a href="${esc(preset.sourceUrl)}" target="_blank" rel="noreferrer">Historical source</a>` : '';
  return `<div class="tactical-setup-content" data-scroll-key="tactical-setup"><section class="tactical-scenario"><div><span class="eyebrow">STANDALONE COMBAT SIMULATOR</span><h2>Set the encounter. Let the admirals fight.</h2><p>Choose a historical starting situation or build both fleets. Positions, gunfire, airstrikes, damage and sinkings develop from the same combat rules used by the campaign.</p></div><label>Starting situation ${select('presetId',[...scenarios.map(s=>[s.id,s.title]),['custom','Custom fleets']],setup.presetId,'Starting situation')}</label><p class="tactical-scenario-note">${esc(preset?.description || 'Mix any ship classes in the catalog, including opposing ships from the same navy. Both sides begin at full readiness.')}</p>${preset?`<p class="tactical-approximation">${esc(preset.date || '')} · ${esc(preset.approximation || 'Historical starting forces; outcomes are simulated, not scripted.')} ${source}</p>`:''}</section>
  <div class="tactical-setup-fleets">${['A','B'].map(side=>`<section><h3><span class="tactical-side-dot side-${side}"></span> Fleet ${side}</h3><div class="tactical-doctrine"><label>Doctrine ${select('doctrine'+side,TACTICAL_DOCTRINES,setup['doctrine'+side],`Fleet ${side} doctrine`)}</label><label>Initial formation ${select('formation'+side,TACTICAL_FORMATIONS,setup['formation'+side],`Fleet ${side} formation`)}</label></div>${doctrineHint(setup,side)}${setup.presetId==='custom'?customFleet(setup,content,side):'<p class="tactical-preset-roster">Historical ships load when you prepare the battle. Every hull remains inspectable.</p>'}</section>`).join('')}</div>
  <section class="tactical-environment"><h3>Conditions & repeatability</h3><div><label>Visibility (km) ${input('visibilityKm',setup.environment.visibilityKm,'min="2" max="60" step="1"')}</label><label>Sea state ${input('seaState',setup.environment.seaState,'min="0" max="9" step="1"')}</label>${setup.presetId==='custom'?`<label>Separation (km) ${input('separationKm',setup.separationKm,'min="5" max="400" step="1"')}</label>`:''}<label>Random seed ${input('seed',setup.seed,'min="1" max="4294967295" step="1"')}</label><label class="tactical-checkbox"><input type="checkbox" data-setup="night" ${setup.environment.night?'checked':''}> Night action</label></div><p>10-second combat steps model movement, reloads and damage control. Carrier airstrikes travel as groups. Quick resolve runs the exact same steps; campaign time can still advance in 15-minute intervals.</p></section>
  ${error?`<p class="tactical-error" role="alert">${esc(error)}</p>`:''}<div class="tactical-setup-actions">${button('Prepare engagement →','prepare','class="primary"')}<span>Your campaign and its random state are untouched. Returning leaves it paused.</span></div></div>`;
}

function shipInspection(ship, snapshot) {
  if (!ship) return '<div class="tactical-inspect-empty"><h3>Inspect a ship</h3><p>Click a hull in the 3D view or select it in either fleet roster. Damage and losses here come from the simulation.</p></div>';
  const systems = [['Hull',ship.health],['Machinery',ship.machinery],['Fire control',ship.fireControl]].filter(([,value])=>Number.isFinite(value));
  const target = snapshot.ships.find(s=>s.id===ship.targetId);
  return `<section class="tactical-inspection"><span class="eyebrow">FLEET ${esc(ship.side)} · ${esc(ship.type)}</span><h3>${esc(ship.name)}</h3><strong class="${ship.status==='sunk'?'tactical-sunk':''}">${label(ship.status)} · ${pct(ship.health)} hull</strong><div class="tactical-systems">${systems.map(([name,value])=>`<div><span>${name}</span><strong>${pct(value)}</strong><meter min="0" max="1" value="${Math.max(0,Math.min(1,value))}">${pct(value)}</meter></div>`).join('')}</div><dl><dt>Position</dt><dd>${number(ship.x,1)}, ${number(ship.y,1)} km</dd><dt>Course</dt><dd>${number(ship.heading)}°</dd><dt>Speed</dt><dd>${number(ship.speed,1)} kn</dd><dt>Fire / flooding</dt><dd>${pct(ship.fire)} / ${pct(ship.flooding)}</dd>${target?`<dt>Target</dt><dd>${esc(target.name)}</dd>`:''}<dt>Shells / torpedoes</dt><dd>${number(ship.ammunition)} / ${number(ship.torpedoes)}</dd>${Number.isFinite(ship.depthCharges)&&['DD','DE','DL','CL'].includes(ship.type)?`<dt>Depth charges</dt><dd>${number(ship.depthCharges)}</dd>`:''}${ship.aircraft?`<dt>Aircraft aboard</dt><dd>${number(ship.aircraft.fighter)} fighters / ${number(ship.aircraft.strike)} strike</dd><dt>Aircraft lost</dt><dd>${number(ship.aircraftLost)}</dd>`:''}</dl>${button('Focus this ship','focus-ship')}</section>`;
}

function battleView(session, selected, cinematic) {
  const snapshot = session.snapshot(), summary = session.summary(), combat = session.combat;
  const replaying = session.replaySeconds != null, active = session.canAdvance(), selectedShip = snapshot.ships.find(ship=>ship.id===selected?.id && (!selected.side || ship.side===selected.side));
  const heading = combat.metadata?.title || session.config?.metadata?.title || session.config?.title || 'Naval engagement';
  const events = (combat.history?.events || combat.recentEvents || []).filter(event=>(event.seconds||0)<=session.currentSeconds()).slice(-35).reverse();
  const names = side => combat.sides?.[side]?.name || session.config?.sides?.[side]?.name || `Fleet ${side}`;
  return `<div class="tactical-watch-toolbar"><div><strong>${esc(heading)}</strong><span class="tactical-clock" data-tactical-clock>${time(session.currentSeconds())}</span><span class="tactical-state">${replaying?(session.paused?'Replay paused':'Replay'):!active?'Complete':session.quick?'Resolving…':session.paused?'Paused':'Under way'}</span></div><div>${button(session.paused?'▶ Run':'Ⅱ Pause','play',active?'':'disabled')}${button('Next 10 s','step',active&&!session.quick?'':'disabled')}${button(session.quick?'Resolving…':'Quick resolve','resolve',active&&!session.quick&&!replaying?'':'disabled')}${button(replaying?'Return to result':'Replay','replay',replaying||!tacticalRunning(combat)&&combat.history?.frames?.length>1?'':'disabled')}<span class="native-fps" data-native-fps>${nativeFPSLabel()}</span><label>Speed <select data-tactical-speed aria-label="Tactical playback speed" ${session.quick?'disabled':''}>${[10,30,60,120].map(speed=>`<option value="${speed}" ${session.speed===speed?'selected':''}>${speed}×</option>`).join('')}</select></label>${button('Restart','restart')}${button('Edit setup','setup')}</div></div>
  <div class="tactical-watch-body"><aside class="tactical-rosters" data-scroll-key="tactical-rosters">${['A','B'].map(side=>{const recorded=snapshot.ships.filter(ship=>ship.side===side),result=replaying?{surviving:recorded.filter(ship=>ship.status!=='sunk').length,sunk:recorded.filter(ship=>ship.status==='sunk').length,escaped:recorded.filter(ship=>ship.status==='escaped').length}:summary.sides?.[side]||{};return `<section><h3><span class="tactical-side-dot side-${side}"></span>${esc(names(side))}</h3><p>${number(result.surviving)} afloat · ${number(result.sunk)} sunk${result.escaped?' · '+number(result.escaped)+' disengaged':''}</p>${snapshot.ships.filter(ship=>ship.side===side).map(ship=>`<button type="button" data-tactical="select-ship" data-id="${esc(ship.id)}" data-side="${side}" data-key="ship-${esc(ship.id)}" class="tactical-roster-ship ${selectedShip?.id===ship.id?'selected':''} ${ship.status==='sunk'?'tactical-sunk':''}" aria-pressed="${selectedShip?.id===ship.id}"><span>${esc(ship.name)}<small>${esc(ship.type)} · ${label(ship.status)}</small></span><strong>${pct(ship.health)}</strong></button>`).join('')}</section>`;}).join('')}</aside>
  <section class="tactical-battle-view"><div class="tactical-camera-bar"><label class="tactical-checkbox"><input type="checkbox" data-tactical-camera ${cinematic?'checked':''}> Cinematic camera</label>${button('Fit fleets','fit')}<span>Wheel: zoom · Right-drag: pan · Middle-drag: orbit</span></div><div class="tactical-stage" data-key="tactical-stage" data-preserve="true"><canvas class="battle-canvas" tabindex="0" role="application" aria-label="Tactical engagement. Click a ship to inspect. Scroll to zoom, right-drag to pan, middle-drag to orbit."></canvas></div><div class="tactical-battle-events" data-scroll-key="tactical-events"><h3>Combat events <span>Latest first</span></h3>${events.length?`<ol>${events.map(event=>`<li><time>${time(event.time ?? event.seconds ?? 0)}</time><span>${esc(tacticalEventText(event,snapshot.ships))}</span></li>`).join('')}</ol>`:'<p>The opposing fleets are maneuvering. Recorded attacks, impacts and losses will appear here.</p>'}</div></section>
  <aside class="tactical-information" data-scroll-key="tactical-information">${!tacticalRunning(combat)&&!replaying?`<section class="tactical-result"><span class="eyebrow">ENGAGEMENT RESULT</span><h3>${summary.winner&&summary.winner!=='draw'?esc(names(summary.winner))+' wins':'Inconclusive'}</h3><p>${esc(label(summary.reason || 'Battle ended'))} · ${time(summary.seconds)}</p>${['A','B'].map(side=>{const r=summary.sides?.[side]||{};return `<p><strong>${esc(names(side))}</strong><br>${number(r.sunk)} hulls lost · ${number(r.escaped)} disengaged<br>${number(r.damage,2)} hull-equivalent damage · ${number(r.planesLost)} aircraft lost</p>`;}).join('')}<small>Restart reuses this setup and seed, reproducing the same battle.</small></section>`:''}${shipInspection(selectedShip,snapshot)}<section class="tactical-airstrikes"><h3>Airstrikes</h3>${snapshot.airstrikes?.length?snapshot.airstrikes.map(strike=>`<p><strong>Fleet ${esc(strike.side)} · ${number(strike.planes)} aircraft</strong><br>${label(strike.phase)}${strike.fighters!=null?' · '+number(strike.fighters)+' fighters':''}</p>`).join(''):'<p>No strike groups airborne.</p>'}</section></aside></div>
  <footer class="tactical-watch-footer">${combat.history?.truncated?'Replay uses retained observations; missing intervals are cuts, not reconstructed attacks. '+number(combat.history.omittedEvents)+' events omitted. · ':''}${replaying?'Replay inspection shows the most recent recorded observation. · ':''}Shared campaign combat rules · 10-second simulation · Aircraft grouped by strike · Full physics, crew stations and individual shell ballistics are abstracted.</footer>`;
}

// Modal lifetime is independent from app.mjs render passes. No campaign state
// is passed in: the only simulation inputs are immutable catalog definitions.
export function openTacticalEngagements({app, content, bundle, onClose = () => {}, SceneClass = UnrealTacticalScene}) {
  if (opens.has(app)) return opens.get(app);
  const previous = {hidden:app.hidden,inert:app.inert,focus:document.activeElement};
  const catalog = tacticalCatalog(content,bundle), modelCampaigns=tacticalModelCampaigns(content,bundle), host = document.createElement('section');
  host.className = 'tactical-engagements'; host.setAttribute('role','dialog'); host.setAttribute('aria-modal','true');
  host.setAttribute('aria-labelledby','tactical-title');
  let closed = false, page = 'setup', setup = initialTacticalSetup(catalog), error = '', selected = null, cinematic = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastDraw = 0, sceneGeneration = 0;
  const controller = new AbortController(), session = new TacticalSession({onChange:change=>draw(change),onError:problem=>{error=problem.message;draw();}});
  const scene = new SceneClass({root:host,onSelect:selection=>{const ship=session.combat?.ships.find(ship=>ship.side===selection?.side&&((ship.groupId===selection.id&&ship.hullIndex===(selection.hullIndex||0))||ship.id===selection.id));selected=ship?{...selection,id:ship.id,groupId:ship.groupId,hullIndex:ship.hullIndex}:null;draw(undefined,true);},onCameraChange:event=>{
    if(event.cinematicAvailable&&typeof event.cinematicEnabled==='boolean'&&cinematic!==event.cinematicEnabled){cinematic=event.cinematicEnabled;const checkbox=host.querySelector('[data-tactical-camera]');if(checkbox)checkbox.checked=cinematic;}
  }});
  app.inert = true; app.hidden = true; document.body.append(host);

  function draw(change, force = false) {
    if (closed) return;
    const now = performance.now();
    if (change?.quick && !force && now-lastDraw<100) return;
    lastDraw = now;
    host.dataset.tacticalPage = page; host.dataset.tacticalReady = String(!!session.combat);
    host.dataset.tacticalStatus = session.combat?.status || 'setup';
    host.dataset.tacticalSeconds = String(session.combat?.seconds || 0);
    updateDOM(host,`<header class="tactical-header"><div><span class="eyebrow">WNT1922 · STANDALONE</span><h1 id="tactical-title">Tactical Engagements</h1></div><div><span>Campaign remains paused</span>${button('×','close','aria-label="Close Tactical Engagements and return" title="Return; campaign remains paused"')}</div></header>${page==='setup'?tacticalSetupView(setup,catalog,SCENARIOS,error):battleView(session,selected,cinematic)}${error&&page!=='setup'?`<p class="tactical-error tactical-floating-error" role="alert">${esc(error)}</p>`:''}`);
    if (page==='watch') {
      const picked=session.combat.ships.find(ship=>ship.id===selected?.id);
      const options = {selected:picked?{side:picked.side,id:picked.groupId,hullIndex:picked.hullIndex}:null,replaySeconds:session.replaySeconds,fromSeconds:change?.fromSeconds,durationSeconds:session.quick?0:10/session.speed,speed:session.speed,paused:session.paused||session.quick,cinematic};
      Promise.resolve(scene.refresh(session.combat,options)).catch(problem=>{if(!closed)host.dataset.tacticalSceneError=problem.message;});
    }
  }
  function close() {
    if (closed) return;
    closed=true;sceneGeneration++;controller.abort();session.destroy();scene.destroy();host.remove();
    app.hidden=previous.hidden;app.inert=previous.inert;opens.delete(app);onClose();
    if(previous.focus?.isConnected)previous.focus.focus({preventScroll:true});
  }
  async function refitAfterClockJump() {
    const generation=++sceneGeneration;
    try {
      await scene.battleReady;
      if(!closed&&page==='watch'&&generation===sceneGeneration){scene.fit();scene.setCinematic(cinematic);}
    } catch(problem) {if(!closed)host.dataset.tacticalSceneError=problem.message;}
  }
  async function prepare() {
    error='';
    try {
      const config=tacticalSetupConfig(setup,catalog,SCENARIOS.map(s=>s.id));
      const battle=config.presetId==='custom'?buildCustomScenario(catalog,config):buildScenario(catalog,config);
      battle.metadata={...battle.metadata,campaign:content.scenario.id,modelCampaigns};
      selected=null;page='watch';session.start(battle);const generation=++sceneGeneration;
      await scene.battleReady;
      if(!closed&&page==='watch'&&generation===sceneGeneration){scene.fit();scene.setCinematic(cinematic);host.querySelector('[data-tactical="play"]')?.focus({preventScroll:true});}
    } catch(problem) {error=problem.message;page='setup';scene.clear();draw();}
  }
  host.addEventListener('click',event=>{
    const target=event.target.closest('[data-tactical]');if(!target||target.disabled)return;
    const action=target.dataset.tactical;
    if(action==='close')close();
    else if(action==='prepare')void prepare();
    else if(action==='play'){if(session.paused)session.play();else session.pause();}
    else if(action==='step')session.step();
    else if(action==='resolve')session.quickResolve();
    else if(action==='restart'){selected=null;session.restart();void refitAfterClockJump();}
    else if(action==='replay'){if(session.replaySeconds!=null)session.stopReplay();else session.replay();void refitAfterClockJump();}
    else if(action==='setup'){session.pause(false);sceneGeneration++;scene.clear();page='setup';error='';draw();host.querySelector('[data-setup="presetId"]')?.focus();}
    else if(action==='fit'){cinematic=false;draw(undefined,true);scene.fit();scene.setCinematic(false);}
    else if(action==='select-ship'){selected={id:target.dataset.id,side:target.dataset.side,hullIndex:0};draw(undefined,true);}
    else if(action==='focus-ship'&&selected){cinematic=false;draw(undefined,true);const ship=session.combat.ships.find(ship=>ship.id===selected.id);if(ship)scene.focus(ship.side,ship.groupId,ship.hullIndex);}
    else if(action==='add-class'){setup['ships'+target.dataset.side].push({classId:Object.keys(catalog.classes)[0],count:1});draw();}
    else if(action==='remove-class'){setup['ships'+target.dataset.side].splice(Number(target.dataset.row),1);draw();}
  },{signal:controller.signal});
  host.addEventListener('change',event=>{
    const target=event.target;
    if(target.matches('[data-tactical-speed]')){session.setSpeed(target.value);return;}
    if(target.matches('[data-tactical-camera]')){cinematic=target.checked;scene.setCinematic(cinematic);draw(undefined,true);return;}
    const key=target.dataset.setup;if(!key)return;
    if(['visibilityKm','seaState','night'].includes(key))setup.environment[key]=key==='night'?target.checked:target.value;
    else if(/^(class|count)-[AB]-\d+$/.test(key)){const [field,side,index]=key.split('-');setup['ships'+side][Number(index)][field==='class'?'classId':'count']=target.value;}
    else setup[key]=target.value;
    if(key==='presetId') {
      // Conditions are explicit editable inputs. Presets start with their
      // characteristic environment and seed rather than inheriting stale values.
      const preset=SCENARIOS.find(s=>s.id===setup.presetId);
      if(preset){setup.seed={'denmark-strait':19410524,midway:19420604,'north-cape':19431226}[preset.id];setup.environment={...preset.environment};}
    }
    error='';draw();
  },{signal:controller.signal});
  host.addEventListener('keydown',event=>{
    event.stopPropagation();
    if(event.key==='Escape'){event.preventDefault();close();return;}
    if(event.code==='Space'&&page==='watch'&&!['INPUT','SELECT','TEXTAREA','BUTTON'].includes(event.target.tagName)){
      event.preventDefault();if(session.paused)session.play();else session.pause();
    }
    if(event.key==='Tab') {
      const controls=[...host.querySelectorAll('button:not([disabled]),input,select,canvas,a')].filter(node=>node.getClientRects().length);
      const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
  },{signal:controller.signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)session.pause();},{signal:controller.signal});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  reduced.addEventListener('change',()=>{if(reduced.matches){cinematic=false;session.pause();draw(undefined,true);}},{signal:controller.signal});
  const result={close,host,session};opens.set(app,result);draw();host.querySelector('[data-setup="presetId"]')?.focus();return result;
}
