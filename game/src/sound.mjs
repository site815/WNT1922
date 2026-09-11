let context,gain,noise;let enabled=true,volume=.5,lastAlert=-Infinity,lastBattle=-Infinity;
export function soundSettings(on,level=.5){enabled=on;volume=Math.max(0,Math.min(1,level));if(gain)gain.gain.value=volume*.45;}
export function unlockSound(){if(!enabled)return;try{context??=new (globalThis.AudioContext||globalThis.webkitAudioContext)();if(!gain){gain=context.createGain();gain.gain.value=volume*.45;gain.connect(context.destination);}if(context.state==='suspended')context.resume().catch(()=>{});}catch{/* Audio is optional on computers without an audio device. */}}
// A newer industry alert must not hide a battle that happened in this snapshot.
export function createSoundTracker(){
 let reportId=null,alertId=null,wars=null;
 return {reset(){reportId=alertId=null;wars=null;},next(s){
  const report=Math.max(0,...s.reports.filter(r=>[r.a,r.b].includes(s.player)).map(r=>r.id)),latest=s.alerts[0];
  const battle=reportId!==null&&report>reportId,alert=alertId!==null&&latest&&latest.id>alertId;
  const active=new Set(Object.entries(s.relations||{}).filter(([,r])=>r.war).map(([id,r])=>id+'-'+r.warSince)),war=wars!==null&&[...active].some(id=>!wars.has(id));wars=active;
  reportId=Math.max(reportId||0,report);alertId=Math.max(alertId||0,latest?.id||0);
  return war?'war':battle?'battle':alert?latest.kind==='war'?'war':latest.kind==='battle'?'battle':latest.kind==='industry'?'complete':'alert':null;
 }};
}
function cannon(delay){
 const at=context.currentTime+delay,duration=.65;
 if(!noise){noise=context.createBuffer(1,Math.ceil(context.sampleRate*.7),context.sampleRate);const values=noise.getChannelData(0);for(let i=0;i<values.length;i++)values[i]=Math.random()*2-1;}
 const source=context.createBufferSource(),filter=context.createBiquadFilter(),envelope=context.createGain();source.buffer=noise;filter.type='lowpass';filter.frequency.setValueAtTime(750,at);filter.frequency.exponentialRampToValueAtTime(90,at+duration);envelope.gain.setValueAtTime(.001,at);envelope.gain.linearRampToValueAtTime(.85,at+.01);envelope.gain.exponentialRampToValueAtTime(.001,at+duration);source.connect(filter);filter.connect(envelope);envelope.connect(gain);source.start(at);source.stop(at+duration);source.onended=()=>{source.disconnect();filter.disconnect();envelope.disconnect();};
 const low=context.createOscillator(),body=context.createGain();low.frequency.setValueAtTime(95,at);low.frequency.exponentialRampToValueAtTime(32,at+.35);body.gain.setValueAtTime(.7,at);body.gain.exponentialRampToValueAtTime(.001,at+.45);low.connect(body);body.connect(gain);low.start(at);low.stop(at+.46);low.onended=()=>{low.disconnect();body.disconnect();};
}
export function playSound(kind='click'){
 if(!enabled)return;unlockSound();if(!context||!gain)return;
 const now=performance.now();
 if(kind==='battle'){if(now-lastBattle<1800)return;lastBattle=now;cannon(0);cannon(.22);return;}
 if(['alert','complete'].includes(kind)){if(now-lastAlert<1200||now-lastBattle<900)return;lastAlert=now;}
 const notes={war:[[196,.35,0],[247,.35,.2],[294,.55,.45],[196,.65,.7]],click:[[640,.025,0]],order:[[520,.08,0],[780,.12,.075]],alert:[[440,.12,0],[554,.12,.14],[440,.15,.28]],complete:[[660,.12,0],[880,.2,.13]]}[kind]||[[640,.025,0]];
 for(const [frequency,duration,delay]of notes){const o=context.createOscillator(),envelope=context.createGain(),at=context.currentTime+delay;o.type=kind==='click'?'sine':'triangle';o.frequency.value=frequency;envelope.gain.setValueAtTime(0,at);envelope.gain.linearRampToValueAtTime(kind==='click'?.3:.6,at+.004);envelope.gain.exponentialRampToValueAtTime(.001,at+duration);o.connect(envelope);envelope.connect(gain);o.start(at);o.stop(at+duration+.01);o.onended=()=>{o.disconnect();envelope.disconnect();};}
}
