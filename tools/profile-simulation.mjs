// Bounded performance probe; operates on a new disposable in-memory campaign.
import fs from 'node:fs';
import {newGame,advanceDays} from '../game/src/engine.mjs';
import {validateSave} from '../game/src/state-io.mjs';
const c=JSON.parse(fs.readFileSync('game/staging/content.json')),s=newGame(c,'USA',77189,process.argv[2]||'in_good_faith_1936');s.autoPause=false;s.paused=false;
for(let i=1;i<=30;i++){const start=performance.now();advanceDays(s,c,1);if(i%5===0)console.log(JSON.stringify({days:i,lastDayMs:performance.now()-start,fleets:Object.values(s.nations).reduce((v,n)=>v+n.fleets.length,0),minuteTicks:s.minuteTicks}));}validateSave(s,c);
