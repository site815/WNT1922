import test from 'node:test';
import assert from 'node:assert/strict';
import {unrealBattlePacket, UnrealBattleScene} from '../ui/unreal-scene.mjs';
import {createDemoReport, DEMO_BATTLES} from '../ui/start-battle-data.mjs';

test('native battle packet preserves each recorded hull, condition and opposing heading without mutating reports',()=>{
  for(const battle of DEMO_BATTLES) {
    const report=createDemoReport(battle), original=structuredClone(report);
    for(let index=0;index<report.replay.frames.length;index++) {
      const packet=unrealBattlePacket(report,'campaign_1922',index,null,false), frame=report.replay.frames[index];
      assert.equal(packet.at,frame.at); assert.equal(packet.index,index); assert.equal(packet.animate,false);
      const groups=['A','B'].flatMap(side=>frame['groups'+side].map(group=>({...group,side})));
      assert.equal(packet.units.length,groups.reduce((sum,g)=>sum+g.count,0));
      assert.equal(new Set(packet.units.map(u=>u.key)).size,packet.units.length);
      for(const g of groups) {
        const units=packet.units.filter(u=>u.side===g.side && u.id===g.id);
        assert.equal(units.length,g.count); assert.equal(units.filter(u=>u.sunk).length,g.sunk||0);
        for(const unit of units) {
          assert.equal(unit.health,g.health); assert.equal(unit.classId,g.classId);
          assert.equal(unit.headingDegrees,g.side==='A'?0:180);
          assert(unit.positionMetres.every(Number.isFinite));
        }
      }
    }
    assert.deepEqual(report,original);
    const unit=unrealBattlePacket(report,'campaign_1922',0,null).units[0];
    const selected=unrealBattlePacket(report,'campaign_1922',0,unit);
    assert.equal(selected.units.filter(u=>u.selected).length,1);
  }
});

test('closing the native battle scene drops stale pointer capture state before reopening',()=>{
  const scene = new UnrealBattleScene({root:{}});
  scene.drag = {moved:true,tilt:true};
  scene.hits = [{unit:{}}];
  scene.frame = {at:100};
  scene.clear();
  assert.equal(scene.drag,null);
  assert.equal(scene.frame,null);
  assert.deepEqual(scene.hits,[]);
});
