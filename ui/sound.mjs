import {BATTLE_SOUND_PROFILES,renderBattlePCM,variantSeed} from './battle-synthesis.mjs';
export {BATTLE_SOUND_PROFILES} from './battle-synthesis.mjs';
let context, gain, battleMix;
let enabled = true,
  volume = 0.5,
  lastAlert = -Infinity,
  lastBattle = -Infinity;
const battleVoices = new Set();
const battleBuffers = new WeakMap();
let battleCuesPlayed = 0, battleCuesDropped = 0, battleCuesStolen = 0;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const finite=(value,fallback)=>Number.isFinite(value)?value:fallback;
export function soundSettings(on, level = 0.5) {
  enabled = !!on;
  volume = clamp(finite(level,0.5),0,1);
  if (gain) gain.gain.value = enabled ? volume * 0.45 : 0;
  if (battleMix) battleMix.output.gain.value = enabled ? volume * .95 : 0;
  if (!enabled || !volume) stopBattleSounds();
}
export function soundPreferences() { return {enabled, volume}; }
export function soundStatus() {
  return {enabled, volume, available:!!(globalThis.AudioContext || globalThis.webkitAudioContext),
    unlocked:context?.state === "running", contextState:context?.state || "uninitialized",
    battleVoiceCount:battleVoices.size, battleCuesPlayed, battleCuesDropped, battleCuesStolen,
    battleCachedVariants:context?battleBuffers.get(context)?.size||0:0};
}
export function unlockSound() {
  if (!enabled) return;
  try {
    context ??= new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    if (!gain) {
      gain = context.createGain();
      gain.gain.value = volume * 0.45;
      gain.connect(context.destination);
      battleMix=createBattleMix(context,context.destination,{level:volume*.95});
      void prewarmBattleSounds(context);
    }
    if (context.state === "suspended") context.resume().catch(() => {});
  } catch {
    /* Audio is optional on computers without an audio device. */
  }
}

// Original local synthesis: no recording downloads, network or simulation RNG.
// Long decays belong to the voice buffer, so pause/mute/scene exit can stop the
// complete sound, including its reverberation, without leaving orphaned tails.
// The mix has more headroom than the UI beeps: a fast compressor controls
// simultaneous broadsides, then a soft ceiling prevents digital clipping.
// This factory also runs unchanged in OfflineAudioContext verification.
export function createBattleMix(audioContext,destination,{level=.95}={}) {
  const input=audioContext.createGain(),highpass=audioContext.createBiquadFilter();
  const compressor=audioContext.createDynamicsCompressor(),ceiling=audioContext.createWaveShaper(),output=audioContext.createGain();
  highpass.type='highpass';highpass.frequency.value=28;highpass.Q.value=.65;
  compressor.threshold.value=-12;compressor.knee.value=16;compressor.ratio.value=5;
  compressor.attack.value=.003;compressor.release.value=.28;
  const curve=new Float32Array(4097);
  for(let i=0;i<curve.length;i++)curve[i]=.96*Math.tanh((i/(curve.length-1)*2-1)*1.5);
  ceiling.curve=curve;ceiling.oversample='2x';output.gain.value=clamp(finite(level,.95),0,1);
  input.connect(highpass);highpass.connect(compressor);compressor.connect(ceiling);ceiling.connect(output);output.connect(destination);
  return {input,output,disconnect(){for(const node of [input,highpass,compressor,ceiling,output])node.disconnect();}};
}

function bufferFromPCM(audioContext,pcm) {
  const buffer=audioContext.createBuffer(2,pcm.channels[0].length,pcm.sampleRate);
  for(let i=0;i<2;i++)buffer.getChannelData(i).set(pcm.channels[i]);
  return buffer;
}
const warming=new WeakMap();
// Precompute on a local worker after the existing user gesture unlock. Normal
// playback only references cached buffers in a one-source voice graph.
export function prewarmBattleSounds(audioContext) {
  if(!audioContext||typeof globalThis.Worker!=='function')return Promise.resolve(false);
  if(warming.has(audioContext))return warming.get(audioContext);
  let cache=battleBuffers.get(audioContext);if(!cache){cache=new Map();battleBuffers.set(audioContext,cache);}
  const promise=new Promise(resolve=>{
    let worker,remaining=0,finished=false;
    const done=success=>{if(finished)return;finished=true;clearTimeout(watchdog);worker?.terminate();resolve(success);};
    const watchdog=setTimeout(()=>done(false),15000);
    try {
      worker=new Worker(new URL('./battle-synthesis-worker.mjs',import.meta.url),{type:'module'});
      worker.onerror=event=>{event.preventDefault();done(false);};
      worker.onmessage=({data})=>{
        if(finished)return;
        if(data.error){done(false);return;}
        try{
          if(!cache.has(data.key))cache.set(data.key,bufferFromPCM(audioContext,data));
          if(--remaining===0)done(true);
        }catch{done(false);}
      };
      for(let variant=0;variant<3;variant++)for(const kind of Object.keys(BATTLE_SOUND_PROFILES)){
        const key=kind+':'+variant;if(cache.has(key))continue;remaining++;
        worker.postMessage({key,kind,variant,sampleRate:Math.min(24000,audioContext.sampleRate)});
      }
      if(!remaining)done(true);
    }catch{done(false);}
  });
  warming.set(audioContext,promise);return promise;
}

export function synthesizeBattleSound(audioContext, destination, kind, options={}) {
  const spec=BATTLE_SOUND_PROFILES[kind];
  if (!spec || !audioContext || !destination) return null;
  const at=Math.max(audioContext.currentTime,finite(options.at,audioContext.currentTime));
  const intensity=clamp(finite(options.intensity,.85),0,1),nodes=[];
  const variant=variantSeed(options.variant??options.key??0)%3;
  let finished=false,source;
  const clean=()=>{if(finished)return;finished=true;for(const node of nodes){try{node.disconnect();}catch{}}options.onended?.();};
  const speed=clamp(finite(options.pitch,1),.78,1.25);
  const duration=Math.min(spec.duration/speed,Math.max(.08,finite(options.duration,Infinity)));
  const voice={duration,stop(){if(finished)return;try{source?.stop();}catch{}clean();}};
  try {
    let cache=battleBuffers.get(audioContext);if(!cache){cache=new Map();battleBuffers.set(audioContext,cache);}
    const key=kind+':'+variant;
    if(!cache.has(key))cache.set(key,bufferFromPCM(audioContext,renderBattlePCM(kind,variant,Math.min(24000,audioContext.sampleRate))));
    source=audioContext.createBufferSource();source.buffer=cache.get(key);source.playbackRate.value=speed;
    const envelope=audioContext.createGain();envelope.gain.value=intensity;nodes.push(source,envelope);source.connect(envelope);
    if(duration<spec.duration/speed){
      envelope.gain.setValueAtTime(intensity,at+Math.max(0,duration-.035));
      envelope.gain.linearRampToValueAtTime(0,at+duration);
    }
    let output=envelope;
    if(audioContext.createStereoPanner){
      const panner=audioContext.createStereoPanner();nodes.push(panner);
      panner.pan.setValueAtTime(clamp(finite(options.pan,0),-1,1),at);
      if(Number.isFinite(options.endPan))panner.pan.linearRampToValueAtTime(clamp(options.endPan,-1,1),at+voice.duration*.8);
      output.connect(panner);output=panner;
    }
    output.connect(destination);source.onended=clean;source.start(at);source.stop(at+voice.duration);
    return voice;
  } catch {voice.stop();return null;}
}

// Playback never unlocks audio. New high-priority damage may replace the oldest
// lower-priority tail; low-priority chatter cannot evict a sinking/explosion.
export function playBattleSound(kind, options={}) {
  if(!enabled || !volume || !battleMix || context?.state!=='running' || !BATTLE_SOUND_PROFILES[kind]){
    battleCuesDropped++;return false;
  }
  const priority=finite(options.priority,BATTLE_SOUND_PROFILES[kind].priority);
  if(battleVoices.size>=12){
    const victim=[...battleVoices].filter(entry=>entry.priority<=priority).sort((a,b)=>a.priority-b.priority||a.started-b.started)[0];
    if(!victim){battleCuesDropped++;return false;}
    victim.voice.stop();battleVoices.delete(victim);battleCuesStolen++;
  }
  const entry={owner:options.owner,priority,started:context.currentTime,voice:null};
  entry.voice=synthesizeBattleSound(context,battleMix.input,kind,{...options,onended:()=>battleVoices.delete(entry)});
  if(!entry.voice){battleCuesDropped++;return false;}
  battleVoices.add(entry);battleCuesPlayed++;return true;
}
export function stopBattleSounds(owner) {
  for(const entry of [...battleVoices]){
    if(owner!==undefined && entry.owner!==owner)continue;
    entry.voice.stop();battleVoices.delete(entry);
  }
}
// A newer industry alert must not hide a battle that happened in this snapshot.
export function createSoundTracker() {
  let reportId = null,
    alertId = null,
    wars = null;
  return {
    reset() {
      reportId = alertId = null;
      wars = null;
    },
    next(s) {
      const report = Math.max(
          0,
          ...s.reports
            .filter((r) => [r.a, r.b].includes(s.player))
            .map((r) => r.id),
        ),
        latest = s.alerts[0];
      const battle = reportId !== null && report > reportId,
        alert = alertId !== null && latest && latest.id > alertId;
      const active = new Set(
          Object.entries(s.relations || {})
            .filter(([, r]) => r.war)
            .map(([id, r]) => id + "-" + r.warSince),
        ),
        war = wars !== null && [...active].some((id) => !wars.has(id));
      wars = active;
      reportId = Math.max(reportId || 0, report);
      alertId = Math.max(alertId || 0, latest?.id || 0);
      return war
        ? "war"
        : battle
          ? "battle"
          : alert
            ? latest.kind === "war"
              ? "war"
              : latest.kind === "battle"
                ? "battle"
                : latest.kind === "industry"
                  ? "complete"
                  : "alert"
            : null;
    },
  };
}
function cannon(delay) {
  playBattleSound('gun',{at:context.currentTime+delay,intensity:.72,pan:delay?.15:-.15,key:'campaign-notice-'+delay});
}
export function playSound(kind = "click") {
  if (!enabled) return;
  unlockSound();
  if (!context || !gain) return;
  const now = performance.now();
  if (kind === "battle") {
    if (now - lastBattle < 1800) return;
    lastBattle = now;
    cannon(0);
    cannon(0.22);
    return;
  }
  if (["alert", "complete"].includes(kind)) {
    if (now - lastAlert < 1200 || now - lastBattle < 900) return;
    lastAlert = now;
  }
  const notes = {
    war: [
      [196, 0.35, 0],
      [247, 0.35, 0.2],
      [294, 0.55, 0.45],
      [196, 0.65, 0.7],
    ],
    click: [[640, 0.025, 0]],
    order: [
      [520, 0.08, 0],
      [780, 0.12, 0.075],
    ],
    alert: [
      [440, 0.12, 0],
      [554, 0.12, 0.14],
      [440, 0.15, 0.28],
    ],
    complete: [
      [660, 0.12, 0],
      [880, 0.2, 0.13],
    ],
  }[kind] || [[640, 0.025, 0]];
  for (const [frequency, duration, delay] of notes) {
    const o = context.createOscillator(),
      envelope = context.createGain(),
      at = context.currentTime + delay;
    o.type = kind === "click" ? "sine" : "triangle";
    o.frequency.value = frequency;
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(
      kind === "click" ? 0.3 : 0.6,
      at + 0.004,
    );
    envelope.gain.exponentialRampToValueAtTime(0.001, at + duration);
    o.connect(envelope);
    envelope.connect(gain);
    o.start(at);
    o.stop(at + duration + 0.01);
    o.onended = () => {
      o.disconnect();
      envelope.disconnect();
    };
  }
}
