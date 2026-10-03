import test from 'node:test';
import assert from 'node:assert/strict';
import {battleAudioCues, BattleAudioController} from '../ui/battle-audio.mjs';
import {createCombat,advanceCombat,buildScenario} from '../combatmechanics/index.mjs';
import {unrealTacticalPacket} from '../ui/tactical-scene-packet.mjs';

function clock(){
  let time=0,id=0;const jobs=new Map(),played=[],stopped=[];
  let allowed=true,hidden=false;
  const audio=new BattleAudioController({now:()=>time,canPlay:()=>allowed,hidden:()=>hidden,
    schedule:(fn,delay)=>{jobs.set(++id,{fn,at:time+delay});return id;},cancel:key=>jobs.delete(key),
    play:(kind,options)=>{played.push({kind,time,...options});return true;},stop:owner=>stopped.push(owner)});
  return {audio,jobs,played,stopped,setAllowed:value=>allowed=value,setHidden:value=>hidden=value,
    advance(ms,throttled=false){
      const end=time+ms;
      if(throttled){time=end;for(const [key,job]of[...jobs]){jobs.delete(key);job.fn();}return;}
      for(;;){const next=[...jobs].filter(([,job])=>job.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];
        if(!next)break;time=next[1].at;jobs.delete(next[0]);next[1].fn();}
      time=end;
    }};
}
const packet=(events,extra={})=>({id:'battle',tacticalSessionId:'session',eventKey:'window-1',
  tactical:true,animate:true,durationSeconds:8,elapsedSeconds:0,playbackPaused:false,events,...extra});

test('recorded damage alone causes impacts; explicit misses splash at actual arrival',()=>{
  const events=[{id:'gun',kind:'salvo',seconds:10,arrivalAt:31,hits:0},
    {id:'prediction',kind:'salvo',seconds:20,arrivalAt:30,hits:2},
    {id:'torpedo',kind:'torpedo',seconds:21,arrivalAt:300,hits:0},
    {id:'hit',kind:'impact',seconds:30,weapon:'shell',damage:7},
    {id:'zero',kind:'impact',seconds:30,damage:0},
    {id:'unknown',kind:'end',seconds:40},
    {id:'depth',kind:'salvo',seconds:45,weapon:'depth charge',hits:0,arrivalAt:65}];
  const before=structuredClone(events),cues=battleAudioCues(events);
  assert.deepEqual(events,before);
  assert.deepEqual(cues.filter(c=>c.kind==='impact').map(c=>c.key),['hit:impact']);
  assert.equal(cues.find(c=>c.key==='gun:miss').time,31);
  assert.equal(cues.find(c=>c.key==='torpedo:miss').time,300);
  assert.equal(cues.find(c=>c.key==='depth:miss').kind,'depth-charge');
  assert.equal(cues.some(c=>c.key.startsWith('prediction:impact')),false);
  assert.equal(battleAudioCues([{key:'legacy',type:'hit',time:1}],{tactical:false})[0].kind,'impact');
  assert.equal(battleAudioCues([{key:'zero',type:'hit',time:1}]).length,0);
});

test('clock fires, hits and misses once at their own recorded moments',()=>{
  const c=clock();const p=packet([{key:'salvo',type:'salvo',time:.2,duration:.7,hits:0},
    {key:'hit',type:'hit',time:.5,damage:4}]);
  c.audio.update(p);c.advance(250);assert.deepEqual(c.played.map(v=>v.kind),['gun']);
  c.audio.update(p);c.advance(300);assert.deepEqual(c.played.map(v=>v.kind),['gun','impact']);
  c.advance(400);assert.deepEqual(c.played.map(v=>v.kind),['gun','impact','splash']);
  c.audio.update(p);c.advance(900);assert.equal(c.played.length,3);
  c.audio.destroy();assert.equal(c.jobs.size,0);
});

test('negative launch time preserves a future miss without replaying a launch',()=>{
  const c=clock();c.audio.update(packet([{key:'old',type:'salvo',time:-100,duration:101,hits:0}]));
  c.advance(1100);assert.deepEqual(c.played.map(v=>v.kind),['splash']);c.audio.destroy();
});

test('rolling live windows deduplicate stable event identities and keep future arrival',()=>{
  const c=clock();c.audio.update(packet([{key:'shot',type:'salvo',time:.1,duration:1,hits:0}]));
  c.advance(200);assert.equal(c.played.length,1);
  c.audio.update(packet([{key:'shot',type:'salvo',time:-.1,duration:1,hits:0}],{eventKey:'window-2'}));
  c.advance(950);assert.deepEqual(c.played.map(v=>v.kind),['gun','splash']);c.audio.destroy();
});

test('paused preparation, quick resolution and explicit seek never play a backlog',()=>{
  const c=clock(),events=[{key:'one',type:'salvo',time:.2,duration:.1,hits:0},
    {key:'sink',type:'sink',time:1}];
  c.audio.update(packet(events,{playbackPaused:true}));c.advance(2000);assert.equal(c.jobs.size,0);
  c.audio.update(packet(events,{elapsedSeconds:2}),{silent:true});c.advance(1000);
  c.audio.update(packet(events,{elapsedSeconds:8,playbackPaused:true}));assert.equal(c.played.length,0);
  c.audio.update(packet(events,{elapsedSeconds:.8}),{seek:true});c.advance(300);
  assert.deepEqual(c.played.map(v=>v.kind),['sinking']);
  c.audio.pause();assert.equal(c.jobs.size,0);assert.ok(c.stopped.length>0);c.audio.destroy();
});

test('new movie playback resets dedup while initial attach suppresses past sounds',()=>{
  const c=clock(),events=[{key:'hit',type:'hit',time:.5,damage:2}];
  c.audio.update(packet(events,{tacticalSessionId:undefined,eventKey:'movie-1',elapsedSeconds:1}));
  c.advance(400);assert.equal(c.played.length,0);
  c.audio.update(packet(events,{tacticalSessionId:undefined,eventKey:'movie-2'}));
  c.advance(600);assert.deepEqual(c.played.map(v=>v.kind),['impact']);c.audio.destroy();
});

test('dense accelerated combat has bounded voices and prioritizes real damage',()=>{
  const c=clock(),events=Array.from({length:100},(_,i)=>({key:`gun-${i}`,type:'salvo',time:.1,duration:.5}));
  events.push({key:'sink',type:'sink',time:.1},{key:'impact',type:'hit',time:.1,damage:9});
  c.audio.update(packet(events));c.advance(200);
  assert.deepEqual(c.played.map(v=>v.kind),['sinking','impact','gun']);
  c.advance(500);assert.equal(c.played.length,3);
  assert.equal(c.audio.diagnostics().dropped,99);c.audio.destroy();
});

test('muted/locked devices never schedule a timer or replay old sounds when unlocked',()=>{
  const c=clock(),p=packet([{key:'first',type:'salvo',time:.2},{key:'second',type:'hit',time:2,damage:3}]);
  c.setAllowed(false);c.audio.update(p);assert.equal(c.jobs.size,0);c.advance(1000);
  c.setAllowed(true);c.audio.update({...p,elapsedSeconds:1});
  c.advance(1100);assert.deepEqual(c.played.map(v=>v.kind),['impact']);c.audio.destroy();
});

test('background or throttled timers discard crossed events instead of delayed explosions',()=>{
  for(const hidden of [false,true]){
    const c=clock();c.audio.update(packet([{key:'old',type:'hit',time:.5,damage:3},{key:'new',type:'sink',time:2.5}]));
    c.setHidden(hidden);c.advance(2000,!hidden);c.setHidden(false);c.advance(600);
    assert.deepEqual(c.played.map(v=>v.kind),['sinking']);c.audio.destroy();
  }
});

test('static native inspections and destroyed controllers cannot start audio',()=>{
  const c=clock();c.audio.update(packet([{key:'hit',type:'hit',time:.1,damage:4}],{playbackPaused:undefined}));
  c.advance(1000);assert.equal(c.played.length,0);assert.equal(c.jobs.size,0);
  c.audio.destroy();c.audio.update(packet([{key:'hit',type:'hit',time:.1,damage:4}]));assert.equal(c.jobs.size,0);
});

test('default cancellation preserves native timer receiver semantics on pause and reset',t=>{
  const original=globalThis.clearTimeout,stops=[];
  globalThis.clearTimeout=function(id){assert.equal(this,undefined,'A browser host timer must not receive the controller as its receiver');stops.push(id);};
  t.after(()=>{globalThis.clearTimeout=original;});
  let timer=0;
  const audio=new BattleAudioController({now:()=>0,canPlay:()=>true,schedule:()=>++timer,stop:()=>{}});
  audio.update(packet([]));audio.pause();
  audio.update(packet([]));audio.reset();
  audio.update(packet([]));audio.destroy();
  assert.deepEqual(stops,[1,2,3]);
});

test('real tactical rolling packets produce bounded combat sound without changing combat or RNG',()=>{
  const setup=buildScenario(null,{presetId:'denmark-strait',mode:'simulation',seed:42});
  const state=createCombat(setup),reference=createCombat(setup),c=clock();
  c.audio.update(unrealTacticalPacket(state,{sessionId:'real',fromSeconds:0,speed:60,paused:true}));
  for(let i=0;i<120;i++){
    const from=state.seconds;advanceCombat(state,10);advanceCombat(reference,10);
    c.audio.update(unrealTacticalPacket(state,{sessionId:'real',fromSeconds:from,speed:60,paused:false}));
    c.advance(1000/6);
  }
  assert.deepEqual(state,reference,'Audio and presentation must not change outcomes, RNG or saved state');
  assert.ok(c.played.some(cue=>cue.kind==='gun'));
  assert.ok(c.played.some(cue=>cue.kind==='impact'));
  assert.ok(c.played.some(cue=>cue.kind==='splash'));
  assert.ok(c.played.length<=83,'Twenty seconds allows three initial cues plus four per second');
  c.audio.destroy();assert.equal(c.jobs.size,0);
});

class Param {
  constructor(){this.value=0;this.events=[];}
  setValueAtTime(...args){this.events.push(['set',...args]);}
  linearRampToValueAtTime(...args){this.events.push(['linear',...args]);}
  exponentialRampToValueAtTime(...args){this.events.push(['exponential',...args]);}
}
class Node {
  constructor(kind){this.kind=kind;this.gain=new Param();this.frequency=new Param();this.Q=new Param();this.pan=new Param();this.disconnected=false;}
  connect(){}disconnect(){this.disconnected=true;}start(at){this.startAt=at;}stop(at){this.stopAt=at;if(at===undefined)this.onended?.();}
}
class Audio {
  constructor(){this.state='running';this.currentTime=0;this.sampleRate=8000;this.destination={};this.nodes=[];}
  node(kind){const node=new Node(kind);this.nodes.push(node);return node;}
  createGain(){return this.node('gain');}createBufferSource(){return this.node('noise');}
  createOscillator(){return this.node('tone');}createBiquadFilter(){return this.node('filter');}
  createStereoPanner(){return this.node('pan');}
  createBuffer(channels,length){return{getChannelData:()=>new Float32Array(length)};}
}

test('shared SFX volume, explicit unlock, polyphony and owner cleanup apply to actual voice graphs',async t=>{
  const original=globalThis.AudioContext;let made=0,last;
  globalThis.AudioContext=class extends Audio{constructor(){super();made++;last=this;}};
  t.after(()=>{globalThis.AudioContext=original;});
  const sound=await import(`../ui/sound.mjs?audio-test=${Date.now()}`);
  assert.equal(sound.playBattleSound('gun'),false);assert.equal(made,0);
  sound.unlockSound();assert.equal(made,1);
  sound.soundSettings(true,.4);assert.deepEqual(sound.soundPreferences(),{enabled:true,volume:.4});
  assert.equal(last.nodes[0].gain.value,.4*.45);
  for(let i=0;i<8;i++)assert.equal(sound.playBattleSound('gun',{owner:i%2}),true);
  assert.equal(sound.playBattleSound('impact'),false);assert.equal(sound.soundStatus().battleVoiceCount,8);
  sound.stopBattleSounds(0);assert.equal(sound.soundStatus().battleVoiceCount,4);
  sound.soundSettings(false,.4);assert.equal(last.nodes[0].gain.value,0);assert.equal(sound.soundStatus().battleVoiceCount,0);
  assert.equal(sound.playBattleSound('gun'),false);
  sound.soundSettings(true,0);assert.equal(sound.playBattleSound('gun'),false);
  const effects=last.nodes.slice(1);assert.ok(effects.every(node=>node.disconnected));
});

test('procedural sounds have distinct spectra/envelopes and bounded source lifetimes',async()=>{
  const {synthesizeBattleSound}=await import('../ui/sound.mjs');
  const profiles=[];
  for(const kind of ['gun','impact','splash','torpedo','air','sinking','depth-charge']){
    const audio=new Audio();let ended=0;
    const voice=synthesizeBattleSound(audio,audio.destination,kind,{onended:()=>ended++});
    assert.ok(voice.duration>0&&voice.duration<=1.8);
    const sources=audio.nodes.filter(node=>['noise','tone'].includes(node.kind));
    assert.ok(sources.length<=2);assert.ok(sources.every(source=>source.stopAt<=1.8));
    const filter=audio.nodes.find(node=>node.kind==='filter');profiles.push(JSON.stringify([filter.type,filter.frequency.events]));
    voice.stop();voice.stop();assert.equal(ended,1);assert.ok(audio.nodes.every(node=>node.disconnected));
  }
  assert.equal(new Set(profiles).size,7);
});
