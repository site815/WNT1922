let context, gain, noise;
let enabled = true,
  volume = 0.5,
  lastAlert = -Infinity,
  lastBattle = -Infinity;
export function soundSettings(on, level = 0.5) {
  enabled = on;
  volume = Math.max(0, Math.min(1, level));
  if (gain) gain.gain.value = volume * 0.45;
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
