import test from 'node:test';
import assert from 'node:assert/strict';
import {DEMO_BATTLES, createDemoReport} from '../ui/start-battle-data.mjs';
import {battleInstances, watchFrame} from '../ui/battle-watch.mjs';

test('legacy illustration identities, official sources and selected model limitations stay explicit', () => {
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
      if (ship.classId === 'demo-bismarck') assert.match(ship.modelNote,/everlasting17th.*CC BY 4.0.*approximate/);
      else {
        assert.match(ship.modelNote,/reconstructed from historical references/);
        assert.match(ship.modelNote,/hull sections and small fittings are inferred/);
        assert.match(ship.modelNote,/Art info for sources and fit limits/);
        assert.doesNotMatch(ship.modelNote,/artwork pending|navigation symbol|not displayed/i);
        assert.doesNotMatch(ship.modelNote,/representative|silhouette|earlier.*fit.*used/i);
      }
      if (['akagi','kaga'].includes(ship.id)) {
        assert.equal(ship.classId,'demo-'+ship.id+'1942','Midway must use the completed rebuilt carrier fit');
        assert.match(ship.modelNote,/1942/);
      }
      if(ship.id==='hood')assert.equal(ship.classId,'demo-hood1941','Denmark Strait must use the completed 1941 fit');
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
      assert(units.every(u => u.count === 1 && u.positionMetres.length === 3 && u.positionMetres.every(Number.isFinite) && u.health >= 0 && u.health <= 1));
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

