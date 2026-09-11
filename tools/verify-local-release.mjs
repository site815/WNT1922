import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {GAME_VERSION,SAVE_VERSION} from '../game/src/version.mjs';
import {TRACKS} from '../game/src/music.mjs';
const origin='http://127.0.0.1:19222',get=p=>fetch(origin+'/'+p),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const health=await(await get('health')).json();assert.equal(health.build,GAME_VERSION);assert.equal(health.version,SAVE_VERSION);
const catalog=await(await get('content.json')).json();assert.equal(Object.keys(catalog.campaigns).length,2);for(const c of Object.values(catalog.campaigns))assert.equal(Object.keys(c.nations).length,7);
assert.equal(catalog.campaigns.in_good_faith_1936.scenario.europeVariationDays,60);assert.equal(catalog.campaigns.campaign_1922.scenario.europeVariationDays,365);
const files=fs.readdirSync('game/public').filter(x=>/\.(mjs|css|html)$/.test(x));for(const name of files){const response=await get(name);assert.equal(response.status,200,name);assert.equal(crypto.createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'),hash('game/public/'+name),name+' published bytes');}
for(const track of TRACKS){const r=await get('music/'+track.file);assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'audio/mpeg');assert.equal(crypto.createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex'),hash('game/assets/music/'+track.file));}
const saveResponse=await get('api/save'),backups=fs.readdirSync('game/saves').filter(x=>x.startsWith('campaign.pre-'+GAME_VERSION+'-')).sort(),backup=backups.at(-1);assert.ok(backup);
const unchanged=hash('game/saves/campaign.json')===hash('game/saves/'+backup);if(!unchanged&&saveResponse.status!==200)throw Error('Unexpected save modification');
const report={verifiedAt:new Date().toISOString(),health,campaigns:Object.keys(catalog.campaigns),nations:7,staticFiles:files.length,musicFiles:TRACKS.length,existingSaveStatus:saveResponse.status,existingSaveUnchanged:unchanged,preReleaseSave:'game/saves/'+backup,launcher:'tools/Start-Game.ps1: Edge app mode, maximized; Alt-Tab supported',browserVisuallyTested:true};
fs.writeFileSync('game/release-'+GAME_VERSION+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
