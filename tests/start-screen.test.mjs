import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { NATION_ORDER } from '../mechanics/catalog.mjs';
import { newGame, fleetSummary } from '../mechanics/engine.mjs';
import { startScreen, openingFleet } from '../ui/start-screen.mjs';
import { StartBattleDemo } from '../ui/start-battle-demo.mjs';
import { DEMO_BATTLES, createDemoReport, demoCanPlay } from '../ui/start-battle-data.mjs';
import { battleInstances, watchFrame } from '../ui/battle-watch.mjs';

test('each opening navy matches its human-player fleet, including 1922 treaty choices', () => {
  for (const content of Object.values(CATALOG.campaigns)) for (const nation of NATION_ORDER) {
    const expected = fleetSummary(newGame(content, nation, 19221936, content.scenario.id),content,nation);
    assert.deepEqual(openingFleet(content,nation),expected,content.scenario.id + '/' + nation);
    assert.equal(openingFleet(content,nation),openingFleet(content,nation),'cached summary');
  }
});

test('compact start screen retains campaign, navy, save, import and artwork actions', () => {
  const content = CATALOG.campaigns.campaign_1922, saved = newGame(CATALOG,'USA',87,'in_good_faith_1936');
  const before = JSON.stringify(saved);
  const html = startScreen({bundle:CATALOG,content,selectedCampaign:content.scenario.id,selected:'JPN',saved,version:'0.37.0'});
  assert.equal((html.match(/data-action="select-nation"/g) || []).length,7);
  assert.equal((html.match(/data-action="select-campaign"/g) || []).length,2);
  for (const action of ['new','continue','import','recognition-credits']) assert(html.includes('data-action="' + action + '"'));
  assert.match(html,/data-action="select-nation" data-id="JPN" aria-pressed="true"/);
  assert.match(html,/data-key="start-battle-demo" data-preserve="true"/);
  assert.match(html,/>13<\/strong>warships building/);
  assert(!html.includes('modal-backdrop'));
  assert.equal(JSON.stringify(saved),before,'rendering must not mutate a saved campaign');
});

test('historical demo identities, official sources and selected model limitations stay explicit', () => {
  assert.deepEqual(DEMO_BATTLES.map(b => [b.id,b.date]),[
    ['denmark-strait','24 May 1941'],['midway','4–7 June 1942'],['north-cape','26 December 1943'],
  ]);
  const midpoint = DEMO_BATTLES.find(b => b.id === 'midway');
  assert.deepEqual(midpoint.shipsA.map(s => s.name),['USS Enterprise','USS Hornet','USS Yorktown']);
  assert.deepEqual(midpoint.shipsB.map(s => s.name),['Akagi','Kaga','Soryu','Hiryu']);
  for (const battle of DEMO_BATTLES) {
    assert(['www.royalnavy.mod.uk','www.history.navy.mil'].includes(new URL(battle.source.url).hostname));
    assert(battle.scope.length > 70 && battle.history.length > 70);
    for (const ship of [...battle.shipsA,...battle.shipsB]) {
      assert(ship.modelNote.length > 50);
      if (ship.classId.startsWith('demo-')) assert.match(ship.modelNote,/Representative.*not yet modeled/);
      if (['akagi','kaga'].includes(ship.id)) assert.match(ship.modelNote,/earlier.*not her 1942 configuration/);
    }
  }
});

test('scripted reports are independent and every displayed hull remains inspectable through sinking', () => {
  for (const battle of DEMO_BATTLES) {
    const report = createDemoReport(battle), expectedHulls = battle.shipsA.length + battle.shipsB.length;
    for (let i=0;i<battle.stages.length;i++) {
      const {frame,index,count,recorded} = watchFrame(report,i);
      assert.equal(index,i); assert.equal(count,battle.stages.length); assert.equal(recorded,true);
      const units = battleInstances(frame,report.startedAt);
      assert.equal(units.length,expectedHulls);
      assert.equal(new Set(units.map(u => u.key)).size,expectedHulls);
      assert(units.every(u => u.count === 1 && u.point.every(Number.isFinite) && u.health >= 0 && u.health <= 1));
      assert(units.every(u => Boolean(u.sunkHull) === (u.health === 0)));
    }
    assert(battleInstances(report.replay.frames.at(-1),report.startedAt).some(u => u.sunkHull));
    const fresh = createDemoReport(battle);
    report.replay.frames[0].groupsA[0].health = .01;
    assert.equal(fresh.replay.frames[0].groupsA[0].health,1);
    assert.equal(createDemoReport(battle).replay.frames[0].groupsA[0].health,1);
    assert(Object.isFrozen(battle.stages[0].health));
  }
});

test('demo sequence cycles every stage and uses no game state to change battles', () => {
  const demo = new StartBattleDemo({root:{}});
  demo.render = () => {};
  for (const battle of DEMO_BATTLES) {
    assert.equal(demo.battle.id,battle.id);
    for (let stage=0;stage<battle.stages.length;stage++) {assert.equal(demo.frameIndex,stage); demo.advance();}
  }
  assert.equal(demo.battle.id,DEMO_BATTLES[0].id);
  assert.equal(demo.frameIndex,0);
  demo.changeBattle(-1); assert.equal(demo.battle.id,DEMO_BATTLES.at(-1).id);
});

test('demo autoplay suspends on hidden, reduced-motion, modal, paused or unmounted state', () => {
  const permitted = {active:true,connected:true,hidden:false,reducedMotion:false,paused:false,modal:false};
  assert.equal(demoCanPlay(permitted),true);
  for (const blocker of ['hidden','reducedMotion','paused','modal']) assert.equal(demoCanPlay({...permitted,[blocker]:true}),false,blocker);
  for (const required of ['active','connected']) assert.equal(demoCanPlay({...permitted,[required]:false}),false,required);
});
