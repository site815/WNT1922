import test from 'node:test';
import assert from 'node:assert/strict';
import {buildBattleMovie,movieFrameIndex,RecordedBattleMovie,MAX_MOVIE_EVENTS} from '../ui/battle-movie.mjs';
import {battleVisualEvents} from '../ui/battle-events.mjs';
import {battleWatchView} from '../ui/battle-watch.mjs';
import {unrealBattlePacket} from '../ui/unreal-scene.mjs';
import {createDemoReport,DEMO_BATTLES} from '../ui/start-battle-data.mjs';

const hull=(id,count=1,sunk=0,health=1)=>({id,classId:'queen_elizabeth',name:id,type:'BB',count,sunk,health});
function fixture(){
 const base={at:100,stage:2,status:'ongoing',label:'Contact',groupsA:[hull('a')],groupsB:[hull('b',2)]};
 return{id:71,a:'GBR',b:'JPN',startedAt:100,status:'ongoing',replay:{frames:[base,
 {...structuredClone(base),at:115,stage:3,label:'Main action',exchange:{kind:'surface',sides:['A','B']},groupsA:[hull('a',1,0,.9)],groupsB:[hull('b',2,1,.6)]},
 {...structuredClone(base),at:130,stage:4,label:'Disengagement',groupsA:[hull('a',1,0,.9)],groupsB:[hull('b',2,1,.6)]}]}};
}
test('movie snapshots retained observations, truthful loss identities and complete bounded effects without campaign writes',()=>{
 const report=fixture(),before=structuredClone(report),plan=buildBattleMovie(report);
 assert.deepEqual(report,before);assert.deepEqual(plan,buildBattleMovie(report));
 assert(plan.durationSeconds>=20&&plan.durationSeconds<=90);assert.equal(plan.partial,true);
 const raw=report.replay.frames.flatMap((f,i)=>battleVisualEvents(report,f,i));
 assert.deepEqual(plan.events.map(e=>e.key).sort(),raw.map(e=>e.key).sort());
 assert(plan.events.every(e=>e.time>=0&&e.duration>0&&e.time+e.duration<=plan.durationSeconds));
 assert.equal(plan.units.length,3);assert.equal(plan.units.find(u=>u.key==='B:b:1').lostAtSeconds,plan.events.find(e=>e.type==='sink').time);
 assert.equal(plan.units.find(u=>u.key==='B:b:0').lostAtSeconds,null);
 for(const unit of plan.units){assert.equal(unit.trajectory.length,3);assert(unit.trajectory.every(p=>p.positionMetres.every(Number.isFinite)&&Number.isFinite(p.headingDegrees)));}
 const salvoEnd=Math.max(...plan.events.filter(e=>e.type==='salvo').map(e=>e.time+e.duration));
 const hitStart=Math.min(...plan.events.filter(e=>e.type==='hit').map(e=>e.time));
 assert(salvoEnd<hitStart,'Illustrated projectiles arrive before recorded damage effects');
 const hitStartLast=Math.max(...plan.events.filter(e=>e.type==='hit').map(e=>e.time));
 assert(plan.events.filter(e=>e.type==='sink').every(e=>e.time>hitStartLast),'Loss animations follow impacts');
 report.replay.frames[2].groupsB[0].sunk=2;report.replay.frames.push({...report.replay.frames[2],at:145});
 assert.equal(plan.frameCount,3);assert.equal(plan.units.filter(u=>u.lostAtSeconds!=null).length,1,'Later live events cannot leak into a playing movie');
});
test('missing observations remain explicit cuts with no invented attack or sinking moment',()=>{
 const report=fixture();report.replay.frames.splice(1,1);report.replay.truncated=true;
 const plan=buildBattleMovie(report);assert.equal(plan.gapCount,1);assert.deepEqual(plan.events,[]);
 const lost=plan.units.find(u=>u.key==='B:b:1');assert.equal(lost.lostAtSeconds,plan.frameTimes[1]);assert(lost.trajectory[1].cut);
 const html=battleWatchView(plan.report,'campaign_1922',{movie:{plan,elapsedSeconds:0,paused:false},frameIndex:0});
 assert.match(html,/Missing intervals are cut without inferred attacks/);assert.match(html,/not a tactical reconstruction/);assert.match(html,/battle is still ongoing/);
 assert.equal(buildBattleMovie({replay:{frames:[report.replay.frames[0]]}}),null);
});
test('all title records can use the same full movie packet without changing demonstration outcomes',()=>{
 for(const demo of DEMO_BATTLES){
  const report=createDemoReport(demo),original=structuredClone(report),plan=buildBattleMovie(report);
  assert(plan);assert(plan.events.length<=MAX_MOVIE_EVENTS);assert.equal(plan.frameCount,report.replay.frames.length);
  const state={plan,key:'replay:1',elapsedSeconds:1,paused:false};
  const packet=unrealBattlePacket(report,'campaign_1922',0,null,true,state);
  assert.equal(packet.movie,true);assert.equal(packet.eventKey,'replay:1');assert.deepEqual(packet.events,plan.events);
  assert.deepEqual(packet.units.map(u=>u.key),plan.units.map(u=>u.key));
  const selected=unrealBattlePacket(report,'campaign_1922',1,packet.units[0],true,{...state,elapsedSeconds:2});
  assert.equal(selected.eventKey,packet.eventKey);assert.deepEqual(selected.units.map(u=>u.trajectory),packet.units.map(u=>u.trajectory));
  assert.equal(selected.units.filter(u=>u.selected).length,1);assert.deepEqual(report,original);
 }
});
test('local movie clock pauses, resumes, finishes and restarts without a simulation client',()=>{
 let now=0,sequence=0;const timers=new Map(),observed=[];
 const movie=new RecordedBattleMovie({now:()=>now,onChange:s=>observed.push(s),schedule:fn=>{timers.set(++sequence,fn);return sequence;},cancel:id=>timers.delete(id)});
 assert(movie.start(fixture()));const firstKey=movie.state().key;
 now=3000;movie.pause();assert.equal(movie.state().elapsedSeconds,3);assert.equal(timers.size,0);
 now=90000;assert.equal(movie.state().elapsedSeconds,3);movie.toggle();now+=1000;assert.equal(movie.state().elapsedSeconds,4);
 now+=movie.plan.durationSeconds*1000;const callback=[...timers.values()][0];timers.clear();callback();
 assert.equal(movie.state().ended,true);assert.equal(movie.state().paused,true);assert.equal(timers.size,0);
 assert.equal(movieFrameIndex(movie.plan,movie.seconds()),movie.plan.frameCount-1);
 movie.start(fixture());assert.notEqual(movie.state().key,firstKey);assert.equal(movie.seconds(),0);
 movie.stop();assert.equal(movie.state(),null);assert.equal(timers.size,0);assert.equal(observed.at(-1),null);
});
test('native live controls stay distinct from the presentation-only movie controls',()=>{
 const report=fixture(),plan=buildBattleMovie(report);
 const html=battleWatchView(report,'campaign_1922',{frameIndex:0,movie:{plan,key:'m',elapsedSeconds:3,paused:false}});
 assert.match(html,/RECORDED MOVIE · CAMPAIGN PAUSED/);assert.match(html,/data-action="battle-movie-toggle"/);assert.doesNotMatch(html,/data-action="battle-play"/);
 assert.match(battleWatchView(report,'campaign_1922'),/Next tick · 15 min/);
 assert.match(battleWatchView(report,'campaign_1922',{reducedMotion:true}),/data-action="battle-movie" disabled/);
});
test('a completed real engine engagement becomes a movie with exact recorded hull/loss coverage and no state or RNG changes',async()=>{
 const [{CATALOG},{newGame},{contentFor},{beginEngagement,progressEngagements},{campaignMinutes,setCampaignMinutes}]=await Promise.all([
  import('../worker/catalog-loader.mjs'),import('../mechanics/engine.mjs'),import('../mechanics/campaign-content.mjs'),
  import('../mechanics/engagements.mjs'),import('../mechanics/campaign-clock.mjs')]);
 const state=newGame(CATALOG,'USA',360036,'in_good_faith_1936');state.decisions=[];state.autoPause=false;state.paused=true;
 Object.assign(state.relations['JPN-USA'],{war:true,allied:false,warSince:state.day});
 const content=contentFor(CATALOG,state),fleets=['USA','JPN'].map(id=>state.nations[id].fleets.find(f=>f.role==='battle'));
 fleets.forEach(f=>f.aggressiveBattle=true);
 const report=beginEngagement(state,content,{kind:'surface',a:'USA',b:'JPN',fleetA:fleets[0].id,fleetB:fleets[1].id,region:'pacific',position:[160,20]});
 for(let i=0;report.status==='ongoing'&&i<128;i++){setCampaignMinutes(state,campaignMinutes(state)+15);progressEngagements(state,content);}
 assert.equal(report.status,'completed');
 const before=structuredClone(state),plan=buildBattleMovie(report),last=report.replay.frames.at(-1);
 assert(plan.events.some(e=>e.type==='salvo'),'The fixture records real resolved combat exchanges');
 const rows=[...last.groupsA,...last.groupsB];
 assert.equal(plan.units.length,rows.reduce((n,g)=>n+g.count,0));
 assert.equal(plan.units.filter(u=>u.lostAtSeconds!=null).length,rows.reduce((n,g)=>n+g.sunk,0));
 const packet=unrealBattlePacket(report,state.campaignId,0,null,true,{plan,key:'real-movie',elapsedSeconds:0,paused:false});
 assert.equal(packet.units.filter(u=>u.sunk).length,rows.reduce((n,g)=>n+g.sunk,0));
 assert.equal(plan.partial,false);assert.equal(plan.recordedUntil,last.at);assert.deepEqual(state,before,'The complete campaign including RNG, fleets, stocks and clock is unchanged by planning/packet generation');
});
