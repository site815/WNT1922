import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG} from '../worker/catalog-loader.mjs';
import {createCombat, resolveCombat, buildScenario, buildCustomScenario, SCENARIOS} from '../combatmechanics/index.mjs';
import {TacticalSession} from '../ui/tactical-session.mjs';
import {initialTacticalSetup, tacticalCatalog, tacticalModelCampaigns, tacticalSetupConfig, validateTacticalSetup} from '../ui/tactical-setup.mjs';
import fs from 'node:fs';
import {tacticalSetupView, tacticalEventText} from '../ui/tactical-engagements.mjs';
import {battleProgress} from '../ui/battle-progress.mjs';

const content = tacticalCatalog(CATALOG,CATALOG);
test('campaign tactical progress reports actual elapsed combat time and individual hull losses',()=>{
  const tactical=createCombat(buildScenario(content,{presetId:'denmark-strait',mode:'simulation'}));
  tactical.seconds=70;tactical.ships[0].status='sunk';tactical.ships[1].status='escaped';
  const report={tactical,status:'ongoing',a:'GBR',b:'DEU',minute:900,nextStageAt:1200,round:7};
  const html=battleProgress(report,1100);
  assert.match(html,/1 min 10 s elapsed/);assert.match(html,/1 afloat · 1 sunk · 1 disengaged/);
  assert.match(html,/Scenario time limit: 120 min 0 s/);assert.match(html,/10-second combat steps/);
  assert.doesNotMatch(html,/until the next stage|main engagement round|battle-stages/);
  tactical.reason='One fleet has sunk or disengaged.';report.status='completed';report.moraleChanges={GBR:3,DEU:-3};
  const final=battleProgress(report);assert.match(final,/COMPLETE/);assert.match(final,/One fleet has sunk or disengaged/);assert.match(final,/Morale:/);
});
function scheduler() {
  const queue = new Map(); let serial = 0;
  return {queue, schedule(fn) {queue.set(++serial,fn);return serial;}, cancel(id) {queue.delete(id);},
    tick() {const [id,fn]=queue.entries().next().value||[];if(fn){queue.delete(id);fn();}return !!fn;}};
}

test('standalone custom setup includes both catalogs and validates fleet limits, IDs and finite conditions',()=>{
  const setup = initialTacticalSetup(content); setup.presetId='custom';
  const original=JSON.stringify(CATALOG);
  const config=tacticalSetupConfig(setup,content);
  assert.notEqual(config,setup);assert.notEqual(config.shipsA,setup.shipsA);
  assert.equal(buildCustomScenario(content,config).sides.A.ships.length,1);
  for(const campaign of Object.values(CATALOG.campaigns))for(const id of Object.keys(campaign.classes))assert(content.classes[id]);
  for(const [field,value] of [['seed',0],['seed',3.5],['seed',Infinity],['separationKm',NaN],['doctrineA','ram-everything']]) {
    assert(validateTacticalSetup({...setup,[field]:value},content).length>0,field);
  }
  for(const rows of [[],[{classId:'missing',count:1}],[{classId:setup.shipsA[0].classId,count:1.5}],
    [{classId:setup.shipsA[0].classId,count:80},{classId:setup.shipsA[0].classId,count:80}]]) {
    assert.throws(()=>tacticalSetupConfig({...setup,shipsA:rows},content));
  }
  const maximum=tacticalSetupConfig({...setup,shipsA:[{classId:setup.shipsA[0].classId,count:120}]},content);
  assert.equal(buildCustomScenario(content,maximum).sides.A.ships.length,120);
  assert.equal(JSON.stringify(CATALOG),original,'Standalone setup cannot mutate campaign catalogs');
});

test('historical presets retain their real separation rather than the hidden custom-fleet value',()=>{
  for(const preset of SCENARIOS) {
    const setup={...initialTacticalSetup(content),presetId:preset.id,environment:{...preset.environment}};
    const config=tacticalSetupConfig(setup,content);
    assert.equal(config.separationKm,undefined);
    const battle=buildScenario(content,config);
    assert.equal(battle.separationKm,preset.separationKm);
    assert.deepEqual(battle.environment,preset.environment);
  }
});

test('mixed-campaign custom hulls retain the matching native model campaign for every catalog class',()=>{
  const index=JSON.parse(fs.readFileSync(new URL('../assets/models/ships/index.json',import.meta.url),'utf8'));
  const models=new Map(index.models.flatMap(model=>model.platforms.map(p=>[(p.campaign?p.campaign+':':'')+p.id,model.id])));
  for(const preferred of Object.values(CATALOG.campaigns)) {
    const combined=tacticalCatalog(preferred,CATALOG),mapping=tacticalModelCampaigns(preferred,CATALOG);
    for(const id of Object.keys(combined.classes))assert(models.has(mapping[id]+':'+id)||models.has(id),mapping[id]+':'+id);
    for(const id of Object.keys(preferred.classes))assert.equal(mapping[id],preferred.scenario.id,'The current catalog fit wins shared IDs');
    assert.equal(mapping.ecole_pt32,'in_good_faith_1936');assert.equal(mapping.ocean_bb28,'in_good_faith_1936');
    const config=buildCustomScenario(combined,{shipsA:[{classId:'ecole_pt32',count:1}],shipsB:[{classId:'ocean_bb28',count:1}]});
    config.metadata.modelCampaigns=mapping;
    assert.deepEqual(createCombat(config).metadata.modelCampaigns,mapping,'Rendering metadata survives the isolated engine constructor');
  }
});

test('setup exposes historical scope and independently labeled custom hull quantities',()=>{
  const setup=initialTacticalSetup(content);
  const historical=tacticalSetupView(setup,content);
  assert.match(historical,/Historical source/);assert.match(historical,/Historical milestones and outcomes are fixed/);
  assert.match(historical,/data-setup="doctrineA"[^>]*disabled/);
  assert.match(historical,/data-setup="seed"[^>]*disabled/);
  const free=tacticalSetupView({...setup,mode:'simulation'},content);
  assert.doesNotMatch(free,/data-setup="doctrineA"[^>]*disabled/);
  assert.match(free,/develop freely/);
  const custom=tacticalSetupView({...setup,presetId:'custom'},content,SCENARIOS,'Invalid <ship>');
  for(const side of ['A','B'])assert(custom.includes(`aria-label="Fleet ${side}, quantity 1"`));
  assert.match(custom,/Invalid &lt;ship&gt;/);assert.match(custom,/10-second combat steps/);
  assert.equal(tacticalEventText({kind:'hit',attackerId:'a',targetId:'b',damage:.032},[{id:'a',name:'Hood'},{id:'b',name:'Bismarck'}]),'Hit · Hood → Bismarck · 3% hull damage');
});

test('watching and bounded quick resolution reach exactly the same combat and RNG state',()=>{
  const config=buildScenario(content,{presetId:'denmark-strait',mode:'simulation',seed:914,maxDurationSeconds:600});
  const expected=resolveCombat(createCombat(config));
  for(const mode of ['play','quickResolve']) {
    const clock=scheduler(),session=new TacticalSession({...clock,now:()=>0});session.start(config);session[mode]();
    let ticks=0;while(clock.tick())assert(++ticks<1000,'The battle must terminate');
    assert.deepEqual(session.combat,expected,mode);assert(session.paused);assert(!session.quick);
    session.destroy();assert.equal(clock.queue.size,0);
  }
});

test('quick resolution yields after bounded work; leaving cancels every pending simulation callback',()=>{
  const clock=scheduler(),session=new TacticalSession({...clock,now:()=>0});
  session.start(buildScenario(content,{mode:'simulation',seed:12,maxDurationSeconds:3600}));session.quickResolve();
  session.setSpeed(120);assert(session.quick);assert.equal(session.speed,60,'Playback speed cannot interrupt an active quick resolution');
  clock.tick();assert.equal(session.combat.seconds,80,'One async batch contains at most eight 10-second steps');
  const canceled=[...clock.queue.values()][0],state=session.combat,before=structuredClone(state);
  session.destroy();canceled();assert.deepEqual(state,before,'Even an already queued stale callback cannot change combat');
  assert.equal(clock.queue.size,0);
});

test('pause, inspection and history replay do not advance combat; restart reuses the seed',()=>{
  const clock=scheduler(),session=new TacticalSession({...clock,now:()=>0});
  const config=buildScenario(content,{mode:'simulation',seed:24,maxDurationSeconds:120});session.start(config);
  const initial=structuredClone(session.combat);session.play();session.pause();
  assert.equal(clock.queue.size,0);assert.deepEqual(session.combat,initial);
  session.step();assert.equal(session.combat.seconds,10);assert(session.paused);
  session.quickResolve();while(clock.tick()){}
  const final=structuredClone(session.combat);session.replay();assert.equal(session.replaySeconds,0);
  session.play();while(clock.tick()){}
  assert.equal(session.replaySeconds,final.seconds);assert.deepEqual(session.combat,final);
  session.stopReplay();assert.equal(session.replaySeconds,null);assert.deepEqual(session.combat,final);
  session.restart();assert.deepEqual(session.combat,initial);assert(session.paused);session.destroy();
});
