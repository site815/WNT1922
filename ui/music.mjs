import { SOUNDTRACK, TRACKS, playlistFor, shuffleTracks, soundtrackContext } from './soundtrack.mjs';
export { SOUNDTRACK, TRACKS, playlistFor } from './soundtrack.mjs';
let context = {nation:null, atWar:false}, bag = [], transition = false;
let audio = null,
  index = 0,
  enabled = true,
  volume = 0.28,
  started = false,
  blocked = false,
  running = false,
  fade = null,
  target = 0;
export const playbackVolume = (level, playing) =>
  Math.max(0, Math.min(1, level)) * (playing ? 1 : 1 / 3);
function fadeVolume(targetVolume, done) {
  if (!audio) return;
  const next = targetVolume ?? playbackVolume(volume, running);
  target = next;
  clearInterval(fade);
  const from = audio.volume,
    start = performance.now();
  if (Math.abs(from - target) < 0.001) {
    audio.volume = target;
    fade = null;
    done?.();
    return;
  }
  fade = setInterval(() => {
    const fraction = Math.min(1, (performance.now() - start) / 900);
    audio.volume = from + (target - from) * fraction;
    if (fraction === 1) {
      clearInterval(fade);
      fade = null;
      done?.();
    }
  }, 50);
}
export function musicContext(state) {
  const next = soundtrackContext(state);
  if (next.nation === context.nation && next.atWar === context.atWar) return;
  context = next; bag = [];
  if (!audio) { selectTrack(); return; }
  transition = true;
  fadeVolume(0, () => {
    selectTrack(); transition = false;
    audio.src = '/assets/music/' + TRACKS[index].file;
    if (enabled && started) audio.play().then(() => {blocked = false;}).catch(() => {blocked = true;});
    fadeVolume();
  });
}
function selectTrack() {
  if (!bag.length) bag = shuffleTracks(playlistFor(context.nation, context.atWar), TRACKS[index]?.id);
  index = TRACKS.indexOf(bag.shift());
}
export function musicPlayback(playing) {
  if (running === !!playing) return;
  running = !!playing;
  if (!transition) fadeVolume();
}
export function musicSettings(on = true, level = 0.28) {
  const changed = volume !== Math.max(0, Math.min(1, level));
  enabled = on;
  volume = Math.max(0, Math.min(1, level));
  if (!audio) return;
  if (changed && !transition) fadeVolume();
  if (!enabled) audio.pause();
  else if (started && audio.paused && !document.hidden)
    audio
      .play()
      .then(() => (blocked = false))
      .catch(() => (blocked = true));
}
export function unlockMusic() {
  if (!enabled) return;
  if (!audio) {
    audio = new Audio("/assets/music/" + TRACKS[index].file);
    audio.preload = "auto";
    audio.volume = playbackVolume(volume, running);
    target = audio.volume;
    audio.addEventListener("ended", nextTrack);
    audio.addEventListener("error", () => {
      blocked = true;
    });
  }
  started = true;
  if (audio.paused)
    audio
      .play()
      .then(() => (blocked = false))
      .catch(() => (blocked = true));
}
export function nextTrack() {
  clearInterval(fade); fade = null; transition = false;
  selectTrack();
  if (audio) {
    audio.src = "/assets/music/" + TRACKS[index].file;
    fadeVolume();
    if (enabled)
      audio
        .play()
        .then(() => (blocked = false))
        .catch(() => (blocked = true));
  }
}
export function musicStatus() {
  return {
    track: TRACKS[index],
    enabled,
    volume,
    started,
    blocked,
    running,
    nation: context.nation,
    mood: context.atWar ? 'War' : 'Peace',
    outputVolume: audio?.volume ?? playbackVolume(volume, running),
  };
}
export function musicCredits() {
  return (
    '<h3>Music credits</h3><p>' + SOUNDTRACK.attribution + ' <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">License terms</a>.</p><ul>' +
    TRACKS.map(
      (t) =>
        '<li><a href="https://incompetech.com/music/royalty-free/index.html?isrc=' +
        t.isrc +
        '" target="_blank" rel="noreferrer">' +
        t.title +
        "</a> — " +
        t.composer +
        ' · recording: ' + t.recordingArtist + ' · ' + t.isrc +
        "</li>",
    ).join("") +
    "</ul>"
  );
}
