let context, gain, noise;
let enabled = true,
  volume = 0.5,
  lastAlert = -Infinity,
  lastBattle = -Infinity;
const battleVoices = new Set();
const battleNoise = new WeakMap();
let battleCuesPlayed = 0, battleCuesDropped = 0;
export function soundSettings(on, level = 0.5) {
  enabled = !!on;
  volume = Math.max(0, Math.min(1, Number.isFinite(level) ? level : 0.5));
  if (gain) gain.gain.value = enabled ? volume * 0.45 : 0;
  if (!enabled || !volume) stopBattleSounds();
}
export function soundPreferences() { return {enabled, volume}; }
export function soundStatus() {
  return {enabled, volume, available:!!(globalThis.AudioContext || globalThis.webkitAudioContext),
    unlocked:context?.state === "running", contextState:context?.state || "uninitialized",
    battleVoiceCount:battleVoices.size, battleCuesPlayed, battleCuesDropped};
}
export function unlockSound() {
  if (!enabled) return;
  try {
    context ??= new (globalThis.AudioContext ||
      globalThis.webkitAudioContext)();
    if (!gain) {
      gain = context.createGain();
      gain.gain.value = volume * 0.45;
      gain.connect(context.destination);
    }
    if (context.state === "suspended") context.resume().catch(() => {});
  } catch {
    /* Audio is optional on computers without an audio device. */
  }
}

// Every voice is local synthesis. The renderer is also usable with an
// OfflineAudioContext to verify its actual PCM output without an audio device.
// Cosmetic noise never uses or advances the combat simulation's RNG.
const battleTimbres = Object.freeze({
  gun: {duration:.78, filter:"lowpass", from:1050, to:85, noise:.62, tone:95, endTone:32, body:.38, attack:.006},
  impact: {duration:.66, filter:"bandpass", from:1900, to:180, noise:.58, tone:125, endTone:43, body:.26, attack:.003},
  splash: {duration:.88, filter:"bandpass", from:2100, to:380, noise:.43, attack:.035},
  torpedo: {duration:.46, filter:"lowpass", from:390, to:75, noise:.32, tone:70, endTone:38, body:.1, attack:.025},
  air: {duration:.95, filter:"bandpass", from:950, to:280, noise:.22, tone:210, endTone:95, body:.07, attack:.10},
  sinking: {duration:1.8, filter:"lowpass", from:240, to:38, noise:.43, tone:65, endTone:28, body:.21, attack:.08},
  "depth-charge": {duration:.85, filter:"lowpass", from:260, to:40, noise:.48, tone:72, endTone:25, body:.32, attack:.01},
});

export function synthesizeBattleSound(audioContext, destination, kind, options={}) {
  const spec=battleTimbres[kind];
  if (!spec || !audioContext || !destination) return null;
  const at=Math.max(audioContext.currentTime, Number.isFinite(options.at) ? options.at : audioContext.currentTime);
  const intensity=Math.max(0,Math.min(1,Number.isFinite(options.intensity)?options.intensity:.75));
  const nodes=[], sources=[];
  let finished=false, ended=0;
  const clean=()=>{
    if(finished)return; finished=true;
    for(const node of nodes){try{node.disconnect();}catch{}}
    options.onended?.();
  };
  const voice={duration:spec.duration, stop(){
    if(finished)return;
    for(const source of sources){try{source.stop();}catch{}}
    clean();
  }};
  try {
    let buffer=battleNoise.get(audioContext);
    if(!buffer){
      buffer=audioContext.createBuffer(1,Math.ceil(audioContext.sampleRate*2),audioContext.sampleRate);
      const samples=buffer.getChannelData(0);
      for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
      battleNoise.set(audioContext,buffer);
    }
    const bus=audioContext.createGain(); nodes.push(bus);
    bus.gain.value=intensity;
    let output=bus;
    if(audioContext.createStereoPanner){
      const panner=audioContext.createStereoPanner(); nodes.push(panner);
      panner.pan.value=Math.max(-1,Math.min(1,Number.isFinite(options.pan)?options.pan:0));
      bus.connect(panner);output=panner;
    }
    output.connect(destination);
    const source=audioContext.createBufferSource(),filter=audioContext.createBiquadFilter(),envelope=audioContext.createGain();
    nodes.push(source,filter,envelope);sources.push(source);
    source.buffer=buffer;filter.type=spec.filter;
    filter.Q.value=spec.filter==='bandpass'?.7: .5;
    filter.frequency.setValueAtTime(spec.from,at);
    filter.frequency.exponentialRampToValueAtTime(spec.to,at+spec.duration);
    envelope.gain.setValueAtTime(.0001,at);
    envelope.gain.linearRampToValueAtTime(spec.noise,at+spec.attack);
    envelope.gain.exponentialRampToValueAtTime(.0001,at+spec.duration);
    source.connect(filter);filter.connect(envelope);envelope.connect(bus);
    if(spec.tone){
      const oscillator=audioContext.createOscillator(),body=audioContext.createGain();
      nodes.push(oscillator,body);sources.push(oscillator);
      oscillator.type='sine';oscillator.frequency.setValueAtTime(spec.tone,at);
      oscillator.frequency.exponentialRampToValueAtTime(spec.endTone,at+spec.duration*.7);
      body.gain.setValueAtTime(.0001,at);
      body.gain.linearRampToValueAtTime(spec.body,at+spec.attack);
      body.gain.exponentialRampToValueAtTime(.0001,at+spec.duration*.8);
      oscillator.connect(body);body.connect(bus);
    }
    for(const node of sources){
      node.onended=()=>{if(++ended===sources.length)clean();};
      node.start(at);node.stop(at+spec.duration);
    }
    return voice;
  } catch {
    voice.stop(); return null;
  }
}

// Battle playback does not unlock audio: only the UI's existing user-gesture
// path may do that. Muted/unsupported cues are consumed rather than queued.
export function playBattleSound(kind, options={}) {
  if(!enabled || !volume || !gain || context?.state!=='running' || battleVoices.size>=8){
    battleCuesDropped++;return false;
  }
  const entry={owner:options.owner,voice:null};
  entry.voice=synthesizeBattleSound(context,gain,kind,{...options,onended:()=>battleVoices.delete(entry)});
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
  const at = context.currentTime + delay,
    duration = 0.65;
  if (!noise) {
    noise = context.createBuffer(
      1,
      Math.ceil(context.sampleRate * 0.7),
      context.sampleRate,
    );
    const values = noise.getChannelData(0);
    for (let i = 0; i < values.length; i++) values[i] = Math.random() * 2 - 1;
  }
  const source = context.createBufferSource(),
    filter = context.createBiquadFilter(),
    envelope = context.createGain();
  source.buffer = noise;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(750, at);
  filter.frequency.exponentialRampToValueAtTime(90, at + duration);
  envelope.gain.setValueAtTime(0.001, at);
  envelope.gain.linearRampToValueAtTime(0.85, at + 0.01);
  envelope.gain.exponentialRampToValueAtTime(0.001, at + duration);
  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(gain);
  source.start(at);
  source.stop(at + duration);
  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    envelope.disconnect();
  };
  const low = context.createOscillator(),
    body = context.createGain();
  low.frequency.setValueAtTime(95, at);
  low.frequency.exponentialRampToValueAtTime(32, at + 0.35);
  body.gain.setValueAtTime(0.7, at);
  body.gain.exponentialRampToValueAtTime(0.001, at + 0.45);
  low.connect(body);
  body.connect(gain);
  low.start(at);
  low.stop(at + 0.46);
  low.onended = () => {
    low.disconnect();
    body.disconnect();
  };
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
