import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame } from '../mechanics/engine.mjs';
import { campaignMinutes, setCampaignMinutes } from '../mechanics/campaign-clock.mjs';
import { simulationHost } from '../worker/simulation-host.mjs';
import { NODES, PORTS, distanceNm, nearestSeaNode, seaRoute, routeLength } from '../mechanics/world.mjs';
import { usablePorts } from '../mechanics/task-forces.mjs';
import { nearestSupplyPort } from '../mechanics/logistics.mjs';
import { SimulationRunner } from '../worker/simulation-runner.mjs';
import { SPEEDS } from '../mechanics/naval-resources.mjs';
import { applyCommand } from '../mechanics/game-actions.mjs';
import { validateSave } from '../mechanics/state-io.mjs';

function fixture(paused = true) {
  let clock = 0, callback, scheduledDelay;
  const state = newGame(CATALOG,'USA',410041,'in_good_faith_1936');
  state.paused = paused; state.autoPause = false; state.speed = .1;
  const messages = [], host = simulationHost({content:CATALOG,projectSnapshots:false,
    now:() => clock, schedule:(fn,delay) => {callback = fn; scheduledDelay = delay; return 1;},cancel:() => {},
    send:message => messages.push(structuredClone(message))});
  host.receive({type:'initialize',state,generation:9,requestId:1});
  return {state,host,messages,get scheduledDelay() {return scheduledDelay;},run(at) {clock = at; callback();}};
}

test('paused worker sends liveness without repeatedly copying unchanged campaign state', () => {
  const f = fixture(), original = JSON.stringify(f.state);
  for (let at = 100; at <= 10000; at += 100) f.run(at);
  assert.equal(f.messages.filter(m => m.type === 'state').length,1);
  assert.equal(f.messages.filter(m => m.type === 'heartbeat').length,10);
  for (const m of f.messages.filter(m => m.type === 'heartbeat')) {
    assert.equal(m.generation,9); assert(!('state' in m)); assert(!('view' in m));
  }
  assert.equal(JSON.stringify(f.state),original);
  f.host.receive({type:'snapshot',requestId:2});
  assert.equal(f.messages.at(-1).type,'state');
  assert.equal(f.messages.at(-1).requestId,2);
  assert.equal(f.scheduledDelay,1000);
  f.host.receive({type:'command',requestId:3,command:{type:'pause',args:{value:false}}});
  assert(f.scheduledDelay<=100,'Resume replaces the idle timer immediately');
  f.host.stop();
});

test('snapshot backpressure retains later simulation progress until acknowledged', () => {
  const f = fixture(false), start = campaignMinutes(f.state);
  for (let at = 100; at <= 1000; at += 100) f.run(at);
  assert.equal(campaignMinutes(f.state)-start,15);
  assert.equal(f.messages.filter(m => m.type === 'state').length,2);
  for (let at = 1100; at <= 3000; at += 100) f.run(at);
  assert.equal(campaignMinutes(f.state)-start,45);
  assert.equal(f.messages.filter(m => m.type === 'state').length,2);
  assert.equal(f.messages.filter(m => m.type === 'heartbeat').length,0,'An unacknowledged display snapshot must not be hidden from the watchdog');
  f.host.receive({type:'ack'}); f.run(3100);
  assert.equal(f.messages.at(-1).type,'state');
  assert.equal(campaignMinutes(f.messages.at(-1).state)-start,45);
  f.host.receive({type:'command',requestId:3,command:{type:'pause',args:{value:true}}});
  assert.equal(f.messages.at(-1).state.paused,true);
  for (let at = 3200; at <= 5000; at += 100) f.run(at);
  assert.equal(campaignMinutes(f.state)-start,45);
  assert.equal(f.messages.filter(m => m.type === 'state').length,4);
  f.host.stop();
});

test('a due historical dispatch publishes its pause and decision even when no campaign minute advances', () => {
  const f = fixture(false);
  f.state.speed=1;f.state.autoPause=true;f.state.decisions=[];
  setCampaignMinutes(f.state,f.state.timeline.polandAt);
  validateSave(f.state,CATALOG);
  f.host.receive({type:'snapshot',requestId:2});
  const before=campaignMinutes(f.state);
  assert.equal(f.messages.at(-1).state.paused,false);
  f.run(200);f.run(1200);
  assert.equal(campaignMinutes(f.state),before);
  assert.equal(f.messages.at(-1).type,'state','Do not replace an actual pause/dispatch mutation with a liveness heartbeat');
  assert.equal(f.messages.at(-1).state.paused,true);
  assert(f.messages.at(-1).state.decisions.some(row => row.popup));
  assert.deepEqual(f.messages.at(-1).state.decisions,f.state.decisions);
  f.host.stop();
});

test('nearest-node memoization preserves exact route choice, tie order and mutated input coordinates', () => {
  const ids = Object.keys(NODES);
  const reference = (position, choices, last) => choices.reduce((best,id) => {
    const a = distanceNm(NODES[id],position), b = distanceNm(NODES[best],position);
    return a < b || (last && a === b) ? id : best;
  });
  const point = [0,0];
  for (let i = 0; i < 2200; i++) {
    point[0] = (i*137.50776405)%360-180; point[1] = (i*43.17)%178-89;
    for (const last of [false,true]) {
      const expected = reference(point,ids,last);
      assert.equal(nearestSeaNode(point,undefined,last),expected);
      assert.equal(nearestSeaNode([...point],undefined,last),expected);
    }
  }
  const tied = ids.find(a => ids.some(b => a !== b && distanceNm(NODES[a],NODES[b]) === 0));
  if (tied) {
    const choices = ids.filter(id => distanceNm(NODES[tied],NODES[id]) === 0).reverse();
    assert.equal(nearestSeaNode(NODES[tied],choices,false),choices[0]);
    assert.equal(nearestSeaNode(NODES[tied],choices,true),choices.at(-1));
  }
});

test('supply port optimization preserves exact graph distances and the 25 nm local-port boundary', () => {
  const state = newGame(CATALOG,'USA',410041,'in_good_faith_1936');
  const reference = (nation,position) => {
    const node=nearestSeaNode(position,undefined,true), offset=distanceNm(position,NODES[node]);
    let port=null,distance=100000;
    for(const id of usablePorts(state,nation).filter(id => state.ports[id].health > 0)) {
      const direct=distanceNm(position,NODES[id]);
      const d=direct < 25 ? direct : offset+routeLength(seaRoute(node,id).map(n => NODES[n]));
      if(d < distance){port=id;distance=d;}
    }
    return {port,distance};
  };
  const latitudeDegrees=25/(3440.065*Math.PI/180), points=[];
  for(const port of Object.keys(PORTS)) {
    const [lon,lat]=NODES[port];
    for(const delta of [0,latitudeDegrees-1e-10,latitudeDegrees,latitudeDegrees+1e-10,-latitudeDegrees]) points.push([lon,lat+delta]);
  }
  points.push([179.999,65],[-179.999,-65],[0,89],[0,-89]);
  for(const nation of ['USA','JPN','GBR']) for(const position of points)
    assert.deepEqual(nearestSupplyPort(state,nation,position),reference(nation,position));
  state.ports.hawaii.health=0;state.world.portControl.san_diego='JPN';
  for(const nation of ['USA','JPN']) for(const position of [NODES.hawaii,NODES.san_diego])
    assert.deepEqual(nearestSupplyPort(state,nation,position),reference(nation,position));
});

test('optional Tactical 60x is saved, processes one full tick per 15 seconds, and reports a stable measured rate', () => {
  const state = newGame(CATALOG,'USA',410041,'in_good_faith_1936');
  assert.equal(state.speed,1,'Normal remains the default');
  assert(SPEEDS.some(([speed]) => speed === .006));
  applyCommand(state,CATALOG,{type:'speed',args:{value:.006}});
  assert.equal(validateSave(state,CATALOG).speed,.006);
  state.decisions=[];state.autoPause=false;state.paused=false;
  let time=0; const runner=new SimulationRunner(CATALOG,{now:()=>time});runner.replace(state);
  const before=campaignMinutes(state);
  assert.equal(runner.delayMs(),100);
  for(time=100;time<=45000;time+=100) {
    runner.advance();
    assert.equal(campaignMinutes(state)-before,Math.floor(time/15000)*15);
    if(time < 15000) assert.equal(runner.metrics().warming,true);
    else assert(Math.abs(runner.metrics().actual-60)<1e-8);
    assert(runner.delayMs()>=2 && runner.delayMs()<=100);
  }
  assert.equal(state.minuteTicks,3);
  state.paused=true;runner.advance();assert.equal(runner.delayMs(),1000);
  assert.equal(runner.metrics().actual,0);
});
