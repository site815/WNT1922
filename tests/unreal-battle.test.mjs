import test from 'node:test';
import assert from 'node:assert/strict';
import {unrealBattlePacket, UnrealBattleScene} from '../ui/unreal-scene.mjs';
import {createDemoReport, DEMO_BATTLES} from '../ui/start-battle-data.mjs';
import {DEMO_INTERVAL, StartBattleDemo} from '../ui/start-battle-demo.mjs';
import {battleVisualEvents} from '../ui/battle-events.mjs';

test('title demonstration effects fit the real stage interval while campaign events retain fifteen seconds',()=>{
  let sinks=0,hits=0;
  for(const battle of DEMO_BATTLES) {
    const report=createDemoReport(battle);
    for(let index=0;index<report.replay.frames.length;index++) {
      const frame=report.replay.frames[index], raw=battleVisualEvents(report,frame,index);
      const packet=unrealBattlePacket(report,'campaign_1922',index,null);
      assert.equal(packet.durationSeconds,DEMO_INTERVAL/1000);
      assert.deepEqual(packet.events.map(e=>e.key),raw.map(e=>e.key));
      packet.events.forEach((event,i)=>{
        assert(Math.abs(event.time-raw[i].time*packet.durationSeconds/15)<1e-12);
        assert(Math.abs(event.duration-raw[i].duration*packet.durationSeconds/15)<1e-12);
        assert(event.time+event.duration<=packet.durationSeconds,'Every title effect finishes before the next stage');
        if(event.type==='sink')sinks++;if(event.type==='hit')hits++;
      });
      const reduced=unrealBattlePacket(report,'campaign_1922',index,null,false);
      assert.equal(reduced.animate,false);assert.equal(reduced.eventKey,packet.eventKey);
      const campaign=unrealBattlePacket({...report,id:71},'campaign_1922',index,null);
      assert.equal(campaign.durationSeconds,15);
    }
  }
  assert(sinks>0&&hits>0,'Calibration checks real demo loss and damage effects');
});

test('demo playback changes explicitly send native animation policy without changing the frame',()=>{
  const previousDocument=globalThis.document;
  const previousCancel=globalThis.cancelAnimationFrame;
  try {
    globalThis.document={hidden:false};globalThis.cancelAnimationFrame=()=>{};
    const calls=[],demo=new StartBattleDemo({root:{querySelector:()=>null}});
    demo.active=true;demo.playing=true;demo.paused=true;demo.media={matches:false};
    demo.host={isConnected:true,querySelector:()=>null};
    demo.scene={frame:demo.report.replay.frames[0],refresh:(...args)=>calls.push(args),draw:()=>{}};
    demo.syncPlayback();assert.equal(calls.at(-1)[4],false);assert.equal(calls.at(-1)[2],0);
    demo.paused=false;demo.syncPlayback();assert.equal(calls.at(-1)[4],true);assert.equal(calls.at(-1)[2],0);
    demo.media.matches=true;demo.syncPlayback();assert.equal(calls.at(-1)[4],false);assert.equal(demo.timer,null);
    assert(calls.every(args=>args[0]===demo.report),'Policy changes neither advance nor replace the recorded frame');
  } finally {globalThis.document=previousDocument;globalThis.cancelAnimationFrame=previousCancel;}
});

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
