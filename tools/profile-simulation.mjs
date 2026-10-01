// Deterministic, headless CPU benchmark. This never opens or modifies a save.
// Optional V8 sampling: node --cpu-prof --cpu-prof-dir=.build tools/profile-simulation.mjs
import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame, advanceMinutes } from '../mechanics/engine.mjs';
import { commenceWar } from '../mechanics/war-politics.mjs';
import { buildView } from '../mechanics/queries.mjs';
import { buildUnrealScenePacket } from '../ui/unreal-scene-packet.mjs';

const argument = name => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const days = Number(argument('days') || 7);
if (!Number.isInteger(days) || days < 1 || days > 90) throw Error('Choose 1–90 benchmark days.');
const percentile = (values, quantile) => [...values].sort((a,b) => a-b)[Math.min(values.length-1, Math.floor(values.length*quantile))];
const timed = fn => { const start = performance.now(); const result = fn(); return { ms:performance.now()-start, result }; };
const rows = [];
for (const war of [false, true]) {
  const state = newGame(CATALOG, 'USA', 410041, 'in_good_faith_1936');
  state.autoPause = false; state.paused = false;
  if (war) for (const [a,b] of [['USA','JPN'],['GBR','DEU'],['FRA','ITA']]) commenceWar(state,CATALOG,a,b,{reason:'CPU benchmark'});
  const ticks = [], midnights = [];
  for (let i = 0; i < days*96; i++) {
    const day = state.day, sample = timed(() => advanceMinutes(state,CATALOG,15));
    ticks.push(sample.ms); if (state.day !== day) midnights.push(sample.ms);
  }
  const view = [], scene = [], clone = [];
  for (let i = 0; i < 10; i++) {
    const snapshot = timed(() => structuredClone(state)); clone.push(snapshot.ms);
    view.push(timed(() => buildView(snapshot.result,CATALOG)).ms);
    scene.push(timed(() => buildUnrealScenePacket(snapshot.result,CATALOG)).ms);
  }
  const sum = values => values.reduce((a,b) => a+b,0);
  rows.push({scenario:war?'three simultaneous wars':'peace',days,ticks:ticks.length,
    totalMs:sum(ticks),tickMedianMs:percentile(ticks,.5),tickP95Ms:percentile(ticks,.95),tickMaxMs:Math.max(...ticks),
    midnightMeanMs:sum(midnights)/midnights.length,
    viewMedianMs:percentile(view,.5),sceneMedianMs:percentile(scene,.5),cloneMedianMs:percentile(clone,.5),
    snapshotBytes:Buffer.byteLength(JSON.stringify(state)),
    fleets:Object.values(state.nations).reduce((n,row) => n+row.fleets.length,0),
    activeBattles:state.reports.filter(row => row.status==='ongoing').length,
    stateHash:createHash('sha256').update(JSON.stringify(state)).digest('hex')});
}
const result = {node:process.version,recordedAt:new Date().toISOString(),rows};
const output = argument('output');
if (output) { await mkdir(path.dirname(output),{recursive:true}); await writeFile(output,JSON.stringify(result,null,2)+'\n'); }
console.log(JSON.stringify(result,null,2));
