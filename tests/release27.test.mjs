import test from 'node:test';
import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';
import { playlistFor, TRACKS, shuffleTracks, soundtrackContext } from '../ui/soundtrack.mjs';
import { playbackVolume, musicCredits } from '../ui/music.mjs';
import { nearestSeaNode, distanceNm, NODES, EDGES, seaRoute } from '../mechanics/world.mjs';
import { SimulationClient } from '../ui/simulation-client.mjs';
import { CATALOG } from '../worker/catalog-loader.mjs';
import { newGame } from '../mechanics/engine.mjs';
import { validateSave } from '../mechanics/state-io.mjs';
import { updatePortBlockades } from '../mechanics/port-trade.mjs';
import { contentFor } from '../mechanics/campaign-content.mjs';
import { buildView } from '../mechanics/queries.mjs';
import { minuteAviation } from '../mechanics/aviation-transfer.mjs';
import { campaignMinutes } from '../mechanics/campaign-clock.mjs';
import { aircraftSeats } from '../mechanics/naval-resources.mjs';
import { CAMPAIGNS, navyFor } from '../mechanics/land-war.mjs';
import { readDocument } from '../worker/documents.mjs';

test('national peace and war playlists are distinct, attributed, and avoid immediate repeats',()=>{
 assert.equal(TRACKS.length,33);
 const lists=new Set();
 for(const id of ['GBR','USA','JPN','FRA','ITA','DEU','SOV']) {
   const peace=playlistFor(id,false), war=playlistFor(id,true);
   assert(peace.length>=5 && war.length>=5);
   assert(!peace.some(t=>war.some(w=>w.id===t.id)),id+': wartime music must change');
   lists.add(peace.map(t=>t.id).join(','));
   for(const list of [peace,war]) {
     const bag=shuffleTracks(list,list[0].id,()=>0);
     assert.notEqual(bag[0].id,list[0].id);
     assert.deepEqual(bag.map(t=>t.id).sort(),list.map(t=>t.id).sort());
   }
 }
 assert.equal(lists.size,7);
 const state={player:'USA',relations:{one:{a:'DEU',b:'GBR',war:true},two:{a:'JPN',b:'USA',war:false}}};
 assert.equal(soundtrackContext(state).atWar,false);
 state.relations.two.war=true;assert.equal(soundtrackContext(state).atWar,true);
 assert.equal(soundtrackContext(null).atWar,false);
 assert(Math.abs(playbackVolume(.6,false)-.2)<1e-12);
 for(const t of TRACKS) {assert(musicCredits().includes(t.isrc));assert(t.sha256.length===64);}
});

test('optimized nearest-node lookup agrees with great-circle navigation worldwide',()=>{
 const ids=Object.keys(NODES);
 for(let lon=-180;lon<=180;lon+=9)for(let lat=-81;lat<=81;lat+=9) {
   const p=[lon,lat], original=ids.reduce((a,b)=>distanceNm(NODES[b],p)<distanceNm(NODES[a],p)?b:a);
   assert.equal(nearestSeaNode(p),original,`${lon},${lat}`);
 }
 for(const p of Object.values(NODES))
   assert.equal(distanceNm(p,NODES[nearestSeaNode(p)]),0);
});

test('cached route trees preserve shortest paths and deterministic ties',()=>{
 const ids=Object.keys(NODES), neighbors=Object.fromEntries(ids.map(id=>[id,[]]));
 for(const [a,b] of EDGES){neighbors[a].push(b);neighbors[b].push(a);}
 function reference(from,to) {
   const costs={[from]:0},prev={},todo=new Set(ids);
   while(todo.size) {
     const a=[...todo].reduce((best,n)=>(costs[n]??Infinity)<(costs[best]??Infinity)?n:best);
     todo.delete(a);if(a===to)break;
     for(const b of neighbors[a]) {
       const cost=(costs[a]??Infinity)+distanceNm(NODES[a],NODES[b]);
       if(cost<(costs[b]??Infinity)){costs[b]=cost;prev[b]=a;}
     }
   }
   const path=[to];while(path[0]!==from){assert(prev[path[0]]);path.unshift(prev[path[0]]);}
   return path;
 }
 for(let i=0;i<ids.length;i++)for(const j of [i,(i+1)%ids.length,(i*37+31)%ids.length])
   assert.deepEqual(seaRoute(ids[i],ids[j]),reference(ids[i],ids[j]));
 const path=seaRoute(ids[0],ids.at(-1));path.length=0;
 assert(seaRoute(ids[0],ids.at(-1)).length>0,'Returned routes must not expose the cache');
});

test('land campaign naval participants and territorial events use catalog records',async()=>{
 const rules=await readDocument('common/rules/land-war.md');
 for(const event of rules.TERRITORY_EVENTS)assert(Number.isFinite(Date.parse(event.date)));
 for(const port of Object.keys(rules.PORT_TERRITORIES))assert(NODES[port]);
 for(const f of CAMPAIGNS)for(const side of ['attacker','defender'])
   assert.equal(navyFor(f,side),f[side+'Navy']||f[side]);
 assert.equal(navyFor(CAMPAIGNS.find(f=>f.id==='france'),'defender'),'FRA');
});

function bridge(file) {
 const worker=new Worker(new URL('./thread-adapter.mjs',import.meta.url),{workerData:file});
 const api={postMessage:(m,ports)=>worker.postMessage(m,ports),terminate:()=>worker.terminate()};
 worker.on('message',data=>api.onmessage?.({data}));worker.on('error',e=>api.onerror?.(e));return api;
}
test('support tonnage cannot impose a blockade, and crew or material shortages reduce warship pressure',()=>{
 const s=newGame(CATALOG,'USA',27), c=contentFor(CATALOG,s), n=s.nations.USA;
 Object.assign(s.relations['JPN-USA'],{war:true,allied:false,warSince:s.day});
 const g=n.groups.find(g=>c.classes[g.classId].type==='BB'),f=n.fleets.find(f=>f.id===g.fleetId);
 assert(f);
 for(const nation of Object.values(s.nations))for(const ship of nation.groups)ship.atSea=false;
 f.route=[[...NODES.yokosuka]];f.arriveAt=0;f.phase='patrol';f.mission='siege';
 g.atSea=true;g.sailors=c.classes[g.classId].crew*g.count;
 updatePortBlockades(s,c);const full=s.ports.yokosuka.blockade;assert(full>0);
 g.sailors=Math.floor(g.sailors/2);updatePortBlockades(s,c);assert(s.ports.yokosuka.blockade<full);
 n.strategic=0;updatePortBlockades(s,c);assert(s.ports.yokosuka.blockade<full/2);
 g.service='support';updatePortBlockades(s,c);assert.equal(s.ports.yokosuka.blockade,0);
});
test('display summaries do not mutate the simulation snapshot',()=>{
 const s=newGame(CATALOG,'USA',27), before=structuredClone(s);
 buildView(s,CATALOG);assert.deepEqual(s,before);
});
test('aircraft arriving at a ship in an anchorage without shore storage cannot crash or discard its old wing',()=>{
 const s=newGame(CATALOG,'JPN',27),c=contentFor(CATALOG,s),n=s.nations.JPN;
 const g=n.groups.find(g=>g.airWing.length && c.classes[g.classId].air>0),f=n.fleets.find(f=>f.id===g.fleetId);
 const old={...g.airWing[0]}, replacement=c.nations.JPN.aircraft.find(a=>a.id!==old.model && a.role.includes('multirole'));
 assert(replacement);const port='majuro';delete n.airBases[port];
 f.port=port;f.route=[[...NODES[port]]];f.arriveAt=campaignMinutes(s);g.dockPort=port;g.atSea=false;
 const capacity=c.classes[g.classId].air+c.classes[g.classId].scoutAircraft;
 g.airWing=[{...old,count:capacity,crewed:capacity}];n.aircraft[old.model]+=capacity;
 n.aircraft[replacement.id]+=2;n.aviators+=10000;
 const now=campaignMinutes(s);
 n.airTransfers=[{id:'anchorage-test',source:'truk',destination:g.id,mode:'ferry',replace:true,
   airWing:[{model:replacement.id,role:old.role,count:2,crewed:2}],departAt:now-30,arriveAt:now,
   route:[NODES[port],NODES[port]],path:['truk',g.id],leg:0}];
 assert.doesNotThrow(()=>minuteAviation(s,c));
 assert.equal(g.airWing.find(w=>w.model===old.model).count,capacity);
});
test('separate simulation and display workers preserve command order, views, rejection and saves', async()=>{
 const frames=[], errors=[];
 const client=new SimulationClient({createWorker:()=>bridge('simulation-worker.mjs'),
   createViewWorker:()=>bridge('view-worker.mjs'),onState:(s,m,v)=>frames.push({s,m,v}),onError:e=>errors.push(e)});
 try {
   await client.start(CATALOG,newGame(CATALOG,'USA',27));
   await Promise.all([
     client.dispatch({type:'funding',args:{field:'schoolFunding',value:.2}}),
     client.dispatch({type:'funding',args:{field:'schoolFunding',value:.8}})
   ]);
   assert.equal(frames.at(-1).s.nations.USA.schoolFunding,.8);
   await assert.rejects(client.dispatch({type:'funding',args:{field:'schoolFunding',value:99}}));
   const before=frames.at(-1).s.minuteTicks || 0;
   await client.dispatch({type:'step',args:{minutes:60}});
   const saved=await client.snapshot();validateSave(saved,CATALOG);
   assert.equal(saved.minuteTicks,before+4);
   assert(frames.every(f=>f.v?.fleets && f.v?.economy));
   assert.equal(errors.length,0);
 } finally {await client.stop();}
});
