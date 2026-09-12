import { readDocument } from "../worker/documents.mjs";
export const SOUNDTRACK = await readDocument("common/music.md");
export const TRACKS = SOUNDTRACK.tracks;
const byId = new Map(TRACKS.map(t => [t.id, t]));
export function playlistFor(nation, atWar = false) {
  const mood = atWar ? "war" : "peace";
  return [...new Set([...(SOUNDTRACK.nations[nation]?.[mood] || []), ...SOUNDTRACK.shared[mood]])]
    .map(id => byId.get(id));
}
// Music has its own random stream; changing tracks never changes battles.
export function shuffleTracks(tracks, previous, random = Math.random) {
  const bag = [...tracks];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  if (bag.length > 1 && bag[0].id === previous)
    [bag[0], bag[1]] = [bag[1], bag[0]];
  return bag;
}
export function soundtrackContext(state) {
  return { nation: state?.player || null, atWar: Object.values(state?.relations || {})
    .some(r => r.war && (r.a === state.player || r.b === state.player)) };
}
