import { COMBAT_RULES as R, distance } from './rules.mjs';
import { applyImpact, sink } from './weapons.mjs';
import { launchStrikeGroup } from './air-operations.mjs';

// Historical milestones, not reconstructed tracks or damage percentages. Times
// below are presentation seconds; source-clock labels deliberately retain the
// uncertainty of the selected accounts. No campaign adapter imports this data.
const RN_HOOD = 'https://www.royalnavy.mod.uk/news/2021/may/24/20210524-loss-hood';
const NHHC_HOOD_TARGET = 'https://www.history.navy.mil/our-collections/photography/numerical-list-of-images/nhhc-series/nh-series/NH-69000/NH-69723.html';
const RN_CAPE = 'https://www.royalnavy.mod.uk/news/2020/december/26/20201226-scharnhorst-sunk';
const RN_DIARY = 'https://cd.royalnavy.mod.uk/-/media/rnweb/locations-and-operations/navy-historical-branch/pdfs/1943/war_diary_naval_1943_12---day-16-to-day-31.pdf?rev=a4112afdf50c4c2f8953a60e7dd2eece';
const NHHC_MIDWAY = 'https://www.history.navy.mil/browse-by-topic/wars-conflicts-and-operations/world-war-ii/1942/midway.html';
const NHHC_VT8 = 'https://www.history.navy.mil/about-us/leadership/director/directors-corner/h-grams/h-gram-072/h-072-1.html';
const NHHC_VICTORY = 'https://www.history.navy.mil/about-us/leadership/director/directors-corner/h-grams/h-gram-006/h-006-4.html';
const TOVEY_REPORT = 'https://hmshood.org.uk/reference/official/adm234/adm234-509tovey.htm';
const ONI_BISMARCK = 'https://www.history.navy.mil/content/history/nhhc/research/library/online-reading-room/title-list-alphabetically/s/sinking-of-the-bismarck/the-cruise-of-the-bismarck.html';
const RENOWN_REPORT = 'https://www.naval-history.net/xDKWD-HF1940BCS1.htm';
const id = value => `demo-${value}`;
const order = (at, target, course, speed, fireTarget = null) => ({ at, op: 'order', target: id(target), course, speed, fireTarget: fireTarget && id(fireTarget) });
const shot = (at, source, target, healthAfter, label, time, effects = {}) => ({ at: at - 20, op: 'attack', impactAt: at,
  source: id(source), target: id(target), healthAfter, label, time, effects, weapon: 'shell' });
const hit = (at, target, healthAfter, label, time, weapon, effects = {}, sourceLabel = null) =>
  ({ at, op: 'damage', target: id(target), healthAfter, label, time, weapon, effects, sourceLabel });
const loss = (at, target, label, time, cause) => ({ at, op: 'sink', target: id(target), label, time, cause });
const notice = (at, label, time) => ({ at, op: 'notice', label, time });
const flight = (at, attackAt, source, target, planes, healthAfter, label, time, extra = {}) =>
  ({ at, op: 'flight', source: id(source), target: id(target), attackAt, planes, fighters: 0, healthAfter,
    returnSeconds: 180, losses: { planes: 0, fighters: 0 }, effects: {}, label, time, ...extra });
const clock = (seconds, label, phase) => ({ seconds, label, phase });

export const HISTORICAL_SCRIPTS = Object.freeze({
  'bismarck-last-battle': {
    durationSeconds: 1500, start: '27 May 1941 · about 08:47', end: '27 May 1941 · about 10:37', compressed: true,
    compression: 'The final morning action is compressed into twenty-five simulator minutes. Clock labels mark selected reported phases; courses, salvo spacing and damage values are illustrative.',
    omissions: 'Five principal surface ships. Earlier carrier and destroyer attacks are context, not replayed. The cause of final loss combines gunfire, torpedoes and scuttling; no exclusive cause is asserted. Ship models include disclosed sister-ship and fit substitutions.',
    sourceUrls: [TOVEY_REPORT, ONI_BISMARCK],
    clock: [clock(0,'27 May · about 08:47','Battleships open fire'),clock(240,'27 May · around 09:00','Cruisers join'),
      clock(480,'27 May · after 09:15','Bismarck’s resistance weakens'),clock(960,'27 May · about 10:15','Gunfire ends'),
      clock(1200,'27 May · closing minutes','Dorsetshire torpedo attacks'),clock(1440,'27 May · about 10:37','Bismarck sinks')],
    events: [
      notice(0,'Bismarck begins with prior damage and impaired steering. The night action is outside this episode.','27 May · opening conditions'),
      {at:0,op:'repair',target:id('bismarck'),effects:{machinery:.4},label:'Prior steering damage limits Bismarck’s maneuvering; the numerical machinery value is illustrative.',time:'27 May · opening conditions'},
      order(0,'rodney',0,10,'bismarck'),order(10,'king-george-v',0,10,'bismarck'),order(20,'bismarck',0,10,'rodney'),
      order(0,'norfolk',0,10),order(0,'dorsetshire',0,10),
      shot(160,'rodney','bismarck',.8,'Heavy gunfire strikes Bismarck.','27 May · opening exchanges',{fire:.25}),
      order(240,'norfolk',0,10,'bismarck'),order(240,'dorsetshire',0,10,'bismarck'),
      shot(380,'king-george-v','bismarck',.6,'Repeated hits impair Bismarck’s fire control.','27 May · main gun action',{fireControl:.35,fire:.55}),
      shot(600,'rodney','bismarck',.35,'Bismarck burns as her remaining guns fight on.','27 May · main gun action',{fireControl:.12,fire:.8}),
      order(620,'bismarck',0,10),
      shot(820,'norfolk','bismarck',.2,'The cruisers contribute to the bombardment.','27 May · closing gun action',{fire:.9}),
      shot(940,'rodney','bismarck',.12,'Bismarck’s main armament is silenced.','27 May · about 10:15',{fireControl:0,machinery:.05}),
      ...['rodney','king-george-v','norfolk','dorsetshire'].map(name=>order(1000,name,0,10)),
      {at:1140,op:'attack',source:id('dorsetshire'),target:id('bismarck'),weapon:'torpedo',rounds:2,impactAt:1200,healthAfter:.06,effects:{flooding:.8},label:'Dorsetshire torpedoes the crippled Bismarck.',time:'27 May · closing minutes'},
      {at:1260,op:'attack',source:id('dorsetshire'),target:id('bismarck'),weapon:'torpedo',rounds:1,impactAt:1320,healthAfter:.02,effects:{flooding:.98},label:'Dorsetshire makes a further torpedo attack.',time:'27 May · closing minutes'},
      loss(1440,'bismarck','Bismarck sinks; the British capital ships survive.','27 May · about 10:37','combined gunfire, torpedo damage and scuttling'),
    ],
  },
  lofoten: {
    durationSeconds: 1200, start: '9 April 1940 · about 04:05', end: '9 April 1940 · after 06:15', compressed: true,
    compression: 'The running action is compressed into twenty simulator minutes. British report clock labels are approximate; weather gaps are represented by pauses in supporting gunfire.',
    omissions: 'Three principal ships; British destroyer contributions are off-map. The contemporary report misidentified German ships. This reconstruction uses corrected names and represents reported damage without claiming exact hit attribution, totals or subsystem values. All three survive.',
    sourceUrls: [RENOWN_REPORT],
    clock: [clock(0,'9 April · about 04:05','Renown opens fire'),clock(180,'9 April · early exchanges','Damage and German turn-away'),
      clock(480,'9 April · running engagement','Snow squalls interrupt contact'),clock(900,'9 April · after 05:57','Gunfire ceases'),clock(1140,'9 April · after 06:15','German ships escape')],
    events: [
      notice(0,'The ships exchange gunfire in heavy seas. German identities are corrected from the contemporary British report.','9 April · about 04:05'),
      order(0,'renown1940',310,25,'gneisenau1940'),order(0,'gneisenau1940',310,25,'renown1940'),order(0,'scharnhorst',310,25,'renown1940'),
      shot(100,'gneisenau1940','renown1940',.94,'Renown sustains limited damage in the opening exchange.','9 April · opening exchange',{flooding:.08}),
      shot(180,'renown1940','gneisenau1940',.88,'The leading German ship takes hits; damage is represented on Gneisenau.','9 April · early exchange',{fireControl:.55}),
      order(260,'gneisenau1940',310,27),order(260,'scharnhorst',310,27,'renown1940'),
      notice(480,'Snow squalls interrupt the running fight.','9 April · running engagement'),
      order(480,'renown1940',310,25),order(480,'scharnhorst',310,27),
      order(660,'renown1940',310,25,'scharnhorst'),order(660,'scharnhorst',310,27,'renown1940'),
      order(900,'renown1940',310,25),order(900,'scharnhorst',310,27),
      {at:1000,op:'withdraw',target:id('gneisenau1940'),course:310,speed:27,label:'German forces continue disengaging.',time:'9 April · closing phase'},
      {at:1000,op:'withdraw',target:id('scharnhorst'),course:310,speed:27,label:'Scharnhorst follows the withdrawal.',time:'9 April · closing phase'},
      {at:1140,op:'escape',target:id('gneisenau1940'),label:'Gneisenau escapes beyond effective contact.',time:'9 April · after 06:15'},
      {at:1140,op:'escape',target:id('scharnhorst'),label:'Scharnhorst escapes; no capital ship is sunk.',time:'9 April · after 06:15'},
    ],
  },
  'denmark-strait': {
    durationSeconds: 960, start: '24 May 1941 · about 05:55', end: '24 May 1941 · about 06:11', compressed: false,
    compression: 'About sixteen minutes of action in sixteen simulator minutes. Individual salvo timing and movement are illustrative.',
    omissions: 'Four principal ships only. Escort rescue and the later pursuit of Bismarck are outside this episode. Damage percentages, courses and subsequent retarget timing are not exact reconstructions.',
    sourceUrls: [RN_HOOD, NHHC_HOOD_TARGET],
    clock: [clock(0, '24 May · about 05:55', 'Opening gunfire'), clock(120, '24 May · about 05:57', 'Hood catches fire'),
      clock(360, '24 May · about 06:01', 'Hood is lost'), clock(600, '24 May · after 06:01', 'Prince of Wales under concentrated fire'),
      clock(840, '24 May · closing minutes', 'British withdrawal'), clock(960, '24 May · about 06:11', 'Action ends')],
    events: [
      notice(0, 'Historical reconstruction: Hood initially engages Prinz Eugen; tracks and subsequent salvo sequence are illustrative.', '24 May · about 05:55'),
      order(0, 'hood1941', 25, 28, 'prinz-eugen'), order(0, 'prince-of-wales', 25, 27, 'bismarck'),
      order(0, 'bismarck', 25, 28, 'hood1941'), order(0, 'prinz-eugen', 25, 28, 'hood1941'),
      shot(120, 'prinz-eugen', 'hood1941', .9, 'Prinz Eugen hits Hood; fire spreads aft.', '24 May · about 05:57', { fire: .65 }),
      shot(240, 'prince-of-wales', 'bismarck', .84, 'Prince of Wales damages Bismarck; the German Atlantic mission is compromised.', '24 May · during the opening exchange', { flooding: .18, machinery: .88 }),
      shot(360, 'bismarck', 'hood1941', 0, 'Hood suffers a catastrophic magazine explosion and sinks.', '24 May · about 06:01', { cause: 'magazine explosion' }),
      order(370, 'bismarck', 25, 27, 'prince-of-wales'), order(370, 'prinz-eugen', 25, 28, 'prince-of-wales'),
      shot(480, 'bismarck', 'prince-of-wales', .7, 'German fire damages Prince of Wales and her bridge.', '24 May · after Hood is lost', { fireControl: .45, fire: .25 }),
      shot(600, 'prinz-eugen', 'prince-of-wales', .58, 'Prince of Wales takes further damage and ships water.', '24 May · closing exchange', { flooding: .22 }),
      { at: 700, op: 'withdraw', target: id('prince-of-wales'), course: 235, speed: 24, label: 'Prince of Wales turns away under smoke.', time: '24 May · closing minutes' },
      order(720, 'bismarck', 25, 25), order(720, 'prinz-eugen', 25, 28),
      { at: 900, op: 'escape', target: id('prince-of-wales'), label: 'Prince of Wales disengages; the German ships continue their operation.', time: '24 May · action ending' },
    ],
  },
  midway: {
    durationSeconds: 3600, start: '4 June 1942 · morning', end: '7 June 1942 · dawn', compressed: true,
    compression: 'Selected events of 4–7 June are compressed into sixty simulator minutes. Flights use compressed transit; the clock labels mark historical phases, not continuous real-time tracking.',
    omissions: 'Seven carriers only. Land-based aircraft, escorts, most sorties and cruiser actions are omitted. I-168 and scuttling destroyers are named off-map causes. Air-group sizes, most losses, damage and routes are representative; VT-8 loss is the selected documented fifteen-aircraft exception.',
    sourceUrls: [NHHC_MIDWAY, NHHC_VT8, NHHC_VICTORY],
    clock: [clock(0, '4 June · morning', 'Carrier strikes assemble'), clock(240, '4 June · morning torpedo attacks', 'VT-8 attacks'),
      clock(600, '4 June · about 10:20–10:30', 'Three Japanese carriers disabled'), clock(900, '4 June · about noon', 'First strike on Yorktown'),
      clock(1320, '4 June · afternoon', 'Second strike on Yorktown'), clock(1740, '4 June · about 17:00', 'Hiryu disabled'),
      clock(2280, '4 June · evening', 'Japanese carrier losses'), clock(2700, '5 June · early morning', 'Scuttling and abandonment'),
      clock(3180, '6 June · salvage operations', 'I-168 torpedoes Yorktown'), clock(3540, '7 June · dawn', 'Yorktown sinks')],
    events: [
      notice(0, 'Historical reconstruction: carrier action and a compressed aftermath through 7 June.', '4 June · morning'),
      ...['enterprise','hornet','yorktown','akagi1942','kaga1942','soryu','hiryu'].map(name => order(0, name, 15, 22)),
      flight(20, 240, 'hornet', 'kaga1942', 15, 1, 'Hornet’s fifteen VT-8 torpedo bombers are lost without a hit.', '4 June · morning torpedo attacks', { losses: { planes: 15, fighters: 0 } }),
      flight(300, 600, 'enterprise', 'kaga1942', 24, .22, 'Enterprise dive bombers cripple Kaga.', '4 June · about 10:20–10:30', { effects: { fire: .9, machinery: .1, fireControl: .1 } }),
      flight(330, 620, 'enterprise', 'akagi1942', 12, .25, 'Enterprise dive bombers cripple Akagi.', '4 June · about 10:20–10:30', { effects: { fire: .9, machinery: .1, fireControl: .1 } }),
      flight(300, 630, 'yorktown', 'soryu', 24, .2, 'Yorktown dive bombers cripple Soryu.', '4 June · about 10:20–10:30', { effects: { fire: .9, machinery: .1, fireControl: .1 } }),
      flight(720, 900, 'hiryu', 'yorktown', 18, .6, 'Hiryu’s first strike damages Yorktown; damage control keeps her afloat.', '4 June · about noon', { losses: { planes: 8, fighters: 0 }, effects: { fire: .5, machinery: .4 } }),
      { at: 1080, op: 'repair', target: id('yorktown'), effects: { fire: .08, machinery: .7 }, label: 'Yorktown restores movement between the two attacks.', time: '4 June · early afternoon' },
      flight(1120, 1320, 'hiryu', 'yorktown', 10, .28, 'Hiryu’s torpedo aircraft disable Yorktown; she is abandoned, not sunk here.', '4 June · afternoon', { losses: { planes: 5, fighters: 0 }, effects: { flooding: .7, machinery: 0, fireControl: .1 } }),
      flight(1440, 1740, 'enterprise', 'hiryu', 24, .18, 'Enterprise’s afternoon strike fatally damages Hiryu.', '4 June · about 17:00', { effects: { fire: .95, machinery: .1, fireControl: .1 } }),
      loss(2280, 'soryu', 'The burning Soryu is lost in the evening aftermath.', '4 June · evening', 'fatal air-attack damage and scuttling aftermath'),
      loss(2340, 'kaga1942', 'Kaga is lost after the morning bombing and prolonged fires.', '4 June · evening', 'fatal air-attack damage and scuttling aftermath'),
      loss(2700, 'akagi1942', 'Japanese destroyers scuttle the disabled Akagi (off-map action).', '5 June · early morning', 'scuttled by Japanese destroyers'),
      loss(2880, 'hiryu', 'Hiryu finally sinks after abandonment and scuttling (off-map action).', '5 June · morning', 'scuttling and fatal air-attack damage'),
      hit(3180, 'yorktown', .08, 'Off-map submarine I-168 torpedoes Yorktown during salvage; this is a later attack.', '6 June · salvage operations', 'torpedo', { flooding: .95, machinery: 0 }, 'I-168 (off-map)'),
      loss(3540, 'yorktown', 'Yorktown capsizes and sinks at dawn, days after the carrier battle.', '7 June · dawn', 'progressive flooding after air and submarine attacks'),
    ],
  },
  'north-cape': {
    durationSeconds: 1800, start: '26 December 1943 · about 09:25', end: '26 December 1943 · about 19:45', compressed: true,
    compression: 'A ten-hour action is compressed into thirty simulator minutes. Approximate phases preserve the cruiser interception, battleship engagement and final torpedo attacks.',
    omissions: 'Selected four-ship roster. Duke of York is displayed from the start for roster context but opens fire only at the afternoon interception. Sheffield, Jamaica, destroyers and the convoy are omitted as models; their contributions are named off-map. Tracks, damage and intermediate times are illustrative; official sinking times differ by several minutes.',
    sourceUrls: [RN_CAPE, RN_DIARY],
    clock: [clock(0, '26 December · about 09:25', 'Cruiser interception'), clock(360, '26 December · around midday', 'Second cruiser encounter'),
      clock(720, '26 December · about 16:51', 'Duke of York opens fire'), clock(1200, '26 December · evening', 'Torpedo attacks slow Scharnhorst'),
      clock(1560, '26 December · final hour', 'Final bombardment'), clock(1740, '26 December · about 19:45', 'Scharnhorst sinks')],
    events: [
      notice(0, 'Duke of York is shown for roster context; her gunfire begins only at the afternoon interception. Supporting forces are named off-map.', '26 December · about 09:25'),
      order(0, 'duke-of-york', 20, 24), order(0, 'belfast', 20, 28, 'scharnhorst'),
      order(0, 'norfolk', 20, 28, 'scharnhorst'), order(0, 'scharnhorst', 20, 29, 'norfolk'),
      shot(120, 'norfolk', 'scharnhorst', .92, 'The cruiser interception damages Scharnhorst.', '26 December · morning engagement', { fireControl: .7 }),
      order(220, 'belfast', 20, 28), order(220, 'norfolk', 20, 28), order(220, 'scharnhorst', 35, 29),
      order(360, 'norfolk', 20, 27, 'scharnhorst'), order(360, 'belfast', 20, 27, 'scharnhorst'), order(360, 'scharnhorst', 35, 29, 'norfolk'),
      shot(420, 'scharnhorst', 'norfolk', .78, 'Scharnhorst damages Norfolk in the cruiser fighting.', '26 December · around midday', { fireControl: .65, fire: .2 }),
      order(500, 'norfolk', 20, 26), order(500, 'belfast', 20, 27), order(500, 'scharnhorst', 165, 28),
      notice(600, 'Scharnhorst turns for Norway; the cruisers shadow while Duke of York intercepts.', '26 December · afternoon'),
      order(720, 'duke-of-york', 35, 26, 'scharnhorst'), order(720, 'scharnhorst', 170, 28, 'duke-of-york'),
      shot(760, 'duke-of-york', 'scharnhorst', .73, 'Duke of York opens the main battleship engagement.', '26 December · after 16:51', { fire: .35, fireControl: .6 }),
      shot(920, 'scharnhorst', 'duke-of-york', .94, 'Duke of York sustains limited damage while maintaining the pursuit.', '26 December · battleship engagement', { fireControl: .9 }),
      shot(1080, 'duke-of-york', 'scharnhorst', .5, 'Repeated heavy-shell hits weaken Scharnhorst.', '26 December · evening', { machinery: .4, fire: .5 }),
      hit(1260, 'scharnhorst', .25, 'British destroyer torpedoes reduce Scharnhorst to about ten knots (off-map force).', '26 December · evening', 'torpedo', { machinery: .12, flooding: .65, fireControl: .2 }, 'British destroyers (off-map)'),
      order(1270, 'scharnhorst', 170, 10, 'duke-of-york'), order(1300, 'belfast', 30, 22, 'scharnhorst'),
      shot(1480, 'duke-of-york', 'scharnhorst', .1, 'Heavy gunfire continues against the crippled Scharnhorst.', '26 December · final hour', { fire: .9, machinery: .02 }),
      hit(1660, 'scharnhorst', .03, 'Further British cruiser and destroyer torpedoes strike; supporting forces include Jamaica (off-map).', '26 December · final torpedo attacks', 'torpedo', { flooding: .98, machinery: 0 }, 'British supporting forces (off-map)'),
      loss(1740, 'scharnhorst', 'Scharnhorst sinks; the Arctic convoy is not attacked.', '26 December · about 19:45', 'combined gunfire and torpedo damage'),
      order(1750, 'duke-of-york', 35, 12), order(1750, 'belfast', 30, 12), order(1750, 'norfolk', 20, 12),
    ],
  },
});
for (const script of Object.values(HISTORICAL_SCRIPTS)) script.events.sort((a, b) => a.at - b.at);

export function historicalMetadata(id) {
  const script = HISTORICAL_SCRIPTS[id]; if (!script) throw Error('Unknown historical script.');
  const { durationSeconds, start, end, compressed, compression, omissions, sourceUrls } = script;
  return { durationSeconds, start, end, compressed, compression, omissions, sourceUrls: [...sourceUrls],
    geometry: 'Illustrative local formations and tracks; no claim of exact historical positions.' };
}
export function historicalClock(state) {
  const script = HISTORICAL_SCRIPTS[state.historical?.id]; if (!script) return null;
  const marker = script.clock.findLast(row => row.seconds <= state.seconds) || script.clock[0];
  return { label: marker.label, phase: marker.phase, elapsedSeconds: state.seconds,
    durationSeconds: script.durationSeconds, compressed: script.compressed };
}
export function initializeHistoricalCombat(state, scriptId) {
  if (!HISTORICAL_SCRIPTS[scriptId] || state.metadata.id !== scriptId || state.metadata.mode !== 'historical' || state.metadata.origin === 'campaign')
    throw Error('Historical scripts are restricted to standalone historical presets.');
  state.historical = { id: scriptId, nextEvent: 0, orders: {} };
  state.maxDurationSeconds = HISTORICAL_SCRIPTS[scriptId].durationSeconds;
}
export function advanceHistoricalTimeline(state, emit) {
  const script = HISTORICAL_SCRIPTS[state.historical.id];
  const find = classId => state.ships.find(ship => ship.classId === classId);
  while (state.historical.nextEvent < script.events.length && script.events[state.historical.nextEvent].at <= state.seconds) {
    const event = script.events[state.historical.nextEvent++], target = find(event.target), source = find(event.source);
    const annotate = row => emit({ scripted: true, historicalTime: event.time || historicalClock(state).label,
      historicalLabel: event.label || 'Illustrative supporting fire', ...row });
    if (event.op === 'order') {
      if (target) state.historical.orders[target.id] = { course: event.course, speed: event.speed, targetId: find(event.fireTarget)?.id || null };
      continue;
    }
    if (event.op === 'notice') { annotate({ kind: 'milestone' }); continue; }
    if (!target) throw Error(`Historical script missing model: ${event.target}`);
    if (event.op === 'attack') {
      if (!source) throw Error(`Historical script missing source: ${event.source}`);
      const torpedo=event.weapon==='torpedo';
      const rounds = torpedo?Math.min(source.torpedoes,event.rounds||1):Math.min(source.ammunition, Math.max(1, source.stats.barrels));
      if(torpedo)source.torpedoes-=rounds;else source.ammunition-=rounds;
      if(!rounds)throw Error(`Historical attack has no ammunition: ${event.source}`);
      state.projectiles.push({ attackerId: source.id, targetId: target.id, kind: event.weapon, arrivalAt: event.impactAt,
        damage: Math.max(0, target.health - event.healthAfter), hits: 1, position: [source.x, source.y], targetPosition: [target.x, target.y],
        scripted: { healthAfter: event.healthAfter, ...event.effects, label: event.label, time: event.time } });
      annotate({ kind: torpedo?'torpedo':'salvo', weapon:event.weapon, attackerId: source.id, targetId: target.id, position: [source.x, source.y], targetPosition: [target.x, target.y], rounds, hits: 1, arrivalAt: event.impactAt,
        historicalLabel: `${source.name} ${torpedo?'launches selected torpedoes':'fires a selected salvo'} toward ${target.name}; impact follows.`, historicalTime: historicalClock(state).label });
    } else if (event.op === 'flight') {
      launchStrikeGroup(state, source, target, event, row => annotate({ ...row, historicalLabel: `${source.name} launches a selected strike toward ${target.name}.`,
        historicalTime: historicalClock(state).label }), { scripted: { attackAt: event.attackAt, returnSeconds: event.returnSeconds,
        healthAfter: event.healthAfter, effects: event.effects, losses: event.losses, label: event.label, time: event.time } });
    } else if (event.op === 'damage') {
      applyImpact(state, target, Math.max(0, target.health - event.healthAfter), event.weapon, null,
        row => annotate({ ...row, sourceLabel: event.sourceLabel }), { healthAfter: event.healthAfter, ...event.effects });
    } else if (event.op === 'sink') sink(state, target, event.cause, annotate);
    else if (event.op === 'repair') { Object.assign(target, event.effects); annotate({ kind: 'milestone', targetId: target.id, position: [target.x, target.y] }); }
    else if (event.op === 'withdraw' || event.op === 'escape') {
      target.status = event.op === 'escape' ? 'escaped' : 'withdrawing';
      if (event.op === 'escape') target.escapedAt = state.seconds;
      state.historical.orders[target.id] = { course: event.course ?? target.heading, speed: event.speed ?? target.speed, targetId: null };
      annotate({ kind: 'withdraw', targetId: target.id, position: [target.x, target.y], status: target.status });
    }
    state.lastContactAt = state.seconds;
  }
}
// Finite ammunition and travelling rounds support the visual exchange between
// sourced milestones. These deliberately miss; no unrecorded hit can rewrite it.
export function fireHistoricalSupportingSalvo(state, ship, target, emit) {
  if (!target || ['sunk', 'escaped'].includes(target.status) || ship.nextGunAt > state.seconds || ship.ammunition <= 0 || !ship.stats.barrels) return;
  if (distance(ship, target) > ship.stats.gunRangeKm) return;
  const rounds = Math.min(ship.ammunition, ship.stats.barrels); ship.ammunition -= rounds;
  ship.nextGunAt = state.seconds + Math.max(40, Math.ceil(ship.stats.reloadSeconds / R.stepSeconds) * R.stepSeconds);
  const arrivalAt = state.seconds + Math.max(10, Math.ceil(distance(ship, target) / R.shellKmSecond / R.stepSeconds) * R.stepSeconds);
  state.projectiles.push({ attackerId: ship.id, targetId: target.id, kind: 'shell', arrivalAt, damage: 0, hits: 0,
    position: [ship.x, ship.y], targetPosition: [target.x, target.y] });
  emit({ kind: 'salvo', attackerId: ship.id, targetId: target.id, position: [ship.x, ship.y], targetPosition: [target.x, target.y],
    rounds, hits: 0, arrivalAt, scripted: true, illustrative: true, historicalTime: historicalClock(state).label,
    historicalLabel: 'Illustrative supporting salvo; exact salvo sequence is not reconstructed.' });
}
