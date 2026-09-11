import { merchantEconomy } from './merchant-economy.mjs';
import { campaignMinutes } from './campaign-clock.mjs';
import { fleetPosition, fleetStats } from './task-forces.mjs';
import { distanceNm, interpolate, PORTS, NODES, ISLANDS } from './world.mjs';
import { portOwner, invalidatePorts } from './ports.mjs';
// These are strategic campaign corridors, not individual land units. Balance is deliberately tunable.
export const POWERS={USA:{name:'United States',color:"#70b9ee"},GBR:{name:'United Kingdom & Commonwealth',color:"#dfbc60"},JPN:{name:'Japan',color:"#f27b73"},DEU:{name:'Germany',color:"#bdc5d0"},FRA:{name:'France',color:"#b398ee"},SOV:{name:'Soviet Union',color:"#8b1739"},ITA:{name:'Italy',color:"#73bb86"},CHN:{name:'China',color:'#b4a178'},NLD:{name:'Netherlands',color:'#b88861'},BEL:{name:'Belgium',color:'#968570'},PRT:{name:'Portugal',color:'#779285'},ESP:{name:'Spain',color:'#ae9f65'},DNK:{name:'Denmark',color:'#a98689'}};
for(const [id,p]of Object.entries(POWERS))if(!['JPN','USA','GBR','DEU','FRA','ITA','SOV'].includes(id))p.color='#343b43';
const date=x=>Date.parse(x+'T00:00:00Z')/86400000;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const front=(id,name,start,attacker,defender,territories,from,to,days,seaWeight,baseline,extra={})=>({id,name,start:date(start),attacker,defender,territories,from,to,days,seaWeight,baseline,...extra});
export const CAMPAIGNS=[
  front('poland','Poland','1939-09-01','DEU','GBR',['c290','c291'],[15,52],[25,52],40,.09,1,{trigger:'poland'}),
  front('norway','Norway','1940-04-09','DEU','GBR',['c385','c390'],[7,57],[20,70],75,.75,.75),
  front('france','France & the Low Countries','1940-05-10','DEU','GBR',['c220','c210','c211','c212'],[8,50],[-4,47],65,.15,.9,{counter:date('1944-06-06'),counterBaseline:-.72}),
  front('balkans','Balkan campaign','1941-04-06','DEU','GBR',['c345','c350'],[17,47],[25,36],80,.26,.8,{counter:date('1944-10-01'),counterBaseline:-.65}),
  front('africa','North African supply war','1940-09-13','ITA','GBR',['c620','c651','c616'],[10,31],[33,31],250,.85,.12,{initial:.48,counter:date('1942-11-08'),counterBaseline:-.65,attackerNavy:'DEU'}),
  front('east','Eastern Front','1941-06-22','DEU','SOV',['c365w','c290','c255e'],[12.5,53],[42,53],540,.065,.7,{initial:.3,counter:date('1943-02-02'),counterBaseline:-.6,defenderNavy:'GBR'}),
  front('italy','Italian campaign','1943-07-09','GBR','ITA',['c325'],[15,37],[11,47],700,.5,.7,{defenderNavy:'DEU'}),
  front('germany','Western advance into Germany','1945-02-01','GBR','DEU',['c255w'],[5,51],[12.5,51],170,.13,.7,{requires:'france'}),
  front('china','War in China','1937-07-07','JPN','CHN',['c710'],[123,35],[105,35],1500,.16,.3,{independent:true,counter:date('1943-01-01'),counterBaseline:-.1,defenderNavy:'USA'}),
  front('malaya','Malaya & Singapore','1941-12-08','JPN','GBR',['c821','c827'],[101,7],[104,1],110,.55,.65,{pacific:true,port:'singapore',counter:date('1944-08-01'),counterBaseline:-.25}),
  front('philippines','Philippine islands','1941-12-08','JPN','USA',['c840'],[122,20],[125,6],180,.5,.55,{pacific:true,port:'manila',counter:date('1944-10-20'),counterBaseline:-.7}),
  front('east-indies','East Indies','1942-01-11','JPN','GBR',['c850','c823','c824','c835'],[120,7],[115,-10],160,.5,.6,{pacific:true,coalition:true,counter:date('1944-09-01'),counterBaseline:-.3}),
  front('solomons','Solomons & New Guinea','1942-03-08','JPN','GBR',['c911','c912','c940'],[153,-3],[160,-12],240,1.1,.3,{pacific:true,counter:date('1942-08-07'),counterBaseline:-.45}),
  ...ISLANDS.map(i=>front('island-'+i.node,i.name,'1922-01-01',i.challenger,i.owner,['island-'+i.node],[i.point[0]-.1,i.point[1]],i.point,i.days,1.2,0,{island:true,pacific:true,port:i.node,resistance:i.resistance,initial:0}))
];
export function initializeWorld(s){s.world??={revision:1,fronts:[],control:{},portControl:{},changes:[]};}
export const navalInfluence=f=>f.seaWeight>.6?'High':f.seaWeight>.2?'Medium':'Low';
const pair=(a,b)=>[a,b].sort().join('-');
function navyFor(f,side){return f.id==='france'&&side==='defender'?'FRA':f[side];}
export function frontPosition(f){return interpolate(f.from,f.to,clamp(f.progress,0,1));}
export function supplyEffect(front,attackerSupply,defenderSupply){
  const difference=clamp(attackerSupply-defenderSupply,-1,1);
  const momentum=clamp((front.momentum||0)+difference/180,-16,16);
  return {momentum,effect:front.seaWeight*(difference*.7+momentum)};
}
// Landing forces and transports are abstracted into the land campaign. Naval
// cover must actually be nearby and at sea; submarines cannot escort a landing.
export function landingPower(forces,navy,point){
 let power=0;
 for(const r of forces){if(r.id!==navy||['port','refuel','returning','repair','reinforcing'].includes(r.f.phase)||['repair','reinforcement','submarine'].includes(r.f.role)||r.stats.submarines===r.stats.hulls)continue;
  const distance=distanceNm(r.position,point);if(distance>220)continue;
  const surfaceHulls=r.stats.hulls-r.stats.submarines;if(surfaceHulls<2)continue;
  power+=(r.stats.surface+r.stats.air*12)*Math.max(.2,1-distance/280)*(r.f.mission==='raid'?.25:1);
 }return power;
}
export function islandPressure(f,a,b,health=1){
 const held=f.lastOutcome==='Occupied',resistance=f.resistance*(.35+.65*health);
 const attacking=held?b:a,defending=held?a:b,supply=held?f.defenderSupply:f.attackerSupply;
 const advantage=(attacking-defending-resistance)/Math.max(1,attacking+defending+resistance);
 if(attacking>resistance&&advantage>.15&&supply>=.4)return (held?-1:1)*clamp(advantage*supply*1.8,0,1);
 // Unsupported footholds slowly contract, without changing the current owner.
 if(attacking<resistance*.5||supply<.25)return held?.12:-.12;
 return 0;
}
export function updateFrontNotice(s,f,priorProgress,alert,{ceasefire=false}={}){
 const now=campaignMinutes(s),contested=x=>x>0&&x<1;
 if(!f.offensiveActive&&(contested(priorProgress)||!ceasefire&&contested(f.progress))){
  f.offensiveActive=true;f.offensiveStartedAt=now;delete f.resolvedAt;
  alert(f.name+(f.island?': landings underway':': fighting underway'),'Naval cover and sustained supply are influencing this campaign. This notice remains until the assault is resolved.',{frontId:f.id,startedAt:now});
 }
 if(f.offensiveActive&&(ceasefire||!contested(f.progress))){
  f.offensiveActive=false;f.resolvedAt=now;
  const outcome=ceasefire?'ceasefire':f.progress>=1?'attacking forces secure the campaign':'defenders drive the attack back';
  alert(f.name+': '+outcome,'The current offensive has ended. Further offensives can change control. This notice expires after 48 game hours.',{frontId:f.id,startedAt:f.offensiveStartedAt,resolvedAt:now});
 }
}
export function dailyWorld(s,c,alert=()=>{}){
  initializeWorld(s);const w=s.world;
  const forces=Object.entries(s.nations).flatMap(([id,n])=>n.fleets.filter(f=>!['repair','reinforcement','support'].includes(f.role)).map(f=>({id,f,position:fleetPosition(s,f),stats:fleetStats(s,c,id,f),mission:f.mission})));
  const economies=Object.fromEntries(Object.keys(s.nations).map(id=>[id,merchantEconomy(s,c,id)]));
  const supply=(navy,enemy,point)=>{
    const n=s.nations[navy];if(!n)return .7;
    let own=0,opposing=0;for(const r of forces){const d=distanceNm(r.position,point);if(d>900||['port','refuel'].includes(r.f.phase))continue;const power=(r.stats.surface+r.stats.air*20+r.stats.subAttack)*(1-d/1000);if(r.id===navy)own+=power;if(r.id===enemy)opposing+=power;}
    const command=(own+opposing)>0?own/(own+opposing):.5;
    const surviving=economies[navy].coverage;
    const localPorts=Object.keys(PORTS).filter(id=>portOwner(s,id)===navy&&distanceNm(NODES[id],point)<1200);
    const portAccess=localPorts.length?localPorts.reduce((v,id)=>v+(s.ports?.[id]?.health??1)*(1-(s.ports?.[id]?.blockade||0)),0)/localPorts.length:1;
    return clamp((n.commerce/100*.4+economies[navy].logistics/100*.15+surviving*.2+command*.25)*(.45+.55*portAccess),0,1);
  };
  for(const definition of CAMPAIGNS){
    const relation=s.relations[pair(definition.attacker,definition.defender)];
    const offset=s.campaignId==='campaign_1922'&&!definition.independent&&!definition.pacific?(s.timeline?.offsetDays||0):0;const start=definition.pacific?(relation?.warSince??s.day):definition.trigger==='poland'?Math.floor(s.timeline?.polandAt/1440):definition.start+offset;
    if(s.day<start)continue;
    if(!definition.independent&&!definition.pacific&&!s.timeline?.polandOccurred)continue;
    if(definition.pacific&&!relation?.war){const frozen=w.fronts.find(f=>f.id===definition.id);if(frozen){if(frozen.status!=='Ceasefire')updateFrontNotice(s,frozen,frozen.progress,alert,{ceasefire:true});frozen.status='Ceasefire';frozen.pressure=0;}continue;}
    if(definition.coalition&&!s.relations[pair('JPN','USA')]?.war)continue;
    if(definition.requires){const required=w.fronts.find(f=>f.id===definition.requires);if(!required||required.progress>.3)continue;}
    let f=w.fronts.find(f=>f.id===definition.id);
    if(!f){const early=definition.pacific?0:Math.max(0,Math.min(s.day,definition.counter||s.day)-start),late=definition.pacific?0:Math.max(0,s.day-(definition.counter||s.day));f={...definition,progress:clamp((definition.initial??.02)+(early*definition.baseline+late*(definition.counterBaseline||0))/definition.days,0,1),momentum:0,attackerSupply:.7,defenderSupply:.7,started:s.day,lastOutcome:definition.island?'Repulsed':null};w.fronts.push(f);}
    f.seaWeight=definition.seaWeight;
    const a=navyFor(f,'attacker'),b=navyFor(f,'defender'),point=f.port?NODES[f.port]:frontPosition(f);
    f.attackerSupply=supply(a,b,point);f.defenderSupply=supply(b,a,point);
    if(f.pacific){f.attackerSupply*=economies[a]?.coverage??1;f.defenderSupply*=economies[b]?.coverage??1;}
    const effect=supplyEffect(f,f.attackerSupply,f.defenderSupply);f.momentum=effect.momentum;
    const baseline=s.day>=(f.counter||Infinity)?f.counterBaseline:f.baseline;
    const coverA=landingPower(forces,a,point),coverB=landingPower(forces,b,point);
    f.pressure=f.island?islandPressure(f,coverA,coverB,s.ports?.[f.port]?.health??1):baseline+effect.effect;
    if(f.pacific&&!f.island){if(f.pressure>0&&(coverA<50||f.attackerSupply<.4))f.pressure=0;if(f.pressure<0&&(coverB<50||f.defenderSupply<.4))f.pressure=0;}
    const priorProgress=f.progress;f.progress=clamp(f.progress+f.pressure/f.days,0,1);
    updateFrontNotice(s,f,priorProgress,alert);
    f.status=f.progress>=1?'Occupied':f.progress<=0?'Repulsed':'Contested';
    const outcome=f.status==='Contested'?null:f.status;
    if(outcome&&f.lastOutcome!==outcome){f.lastOutcome=outcome;const title=f.name+': '+(outcome==='Occupied'?'attacking forces secure the campaign':'defenders drive the attack back');w.changes.unshift({day:s.day,front:f.id,title});w.changes=w.changes.slice(0,40);if(f.island&&s.ports?.[f.port]){s.ports[f.port].health=Math.max(0,s.ports[f.port].health-.15);s.ports[f.port].lastAttack=campaignMinutes(s);}}
    if(f.island&&(f.progress===0||f.progress===1))f.status=f.lastOutcome==='Occupied'?'Occupied':'Awaiting naval support';
  }
  // Territory owners change at completed campaigns. A counteroffensive can restore them.
  w.control={};
  if(s.day>=date('1938-03-12'))w.control.c305='DEU';if(s.day>=date('1939-03-15'))w.control.c315='DEU';
  const original={c290:'c290',c291:'c290',c385:'c385',c390:'DNK',c220:'FRA',c210:'NLD',c211:'BEL',c212:'c212',c345:'c345',c350:'c350',c325:'ITA',c365w:'SOV',c255w:'DEU',c255e:'DEU',c710:'CHN',c840:'USA',c821:'GBR',c827:'GBR',c850:'NLD',c823:'GBR',c824:'GBR',c835:'GBR',c911:'GBR',c912:'GBR',c940:'GBR'};
  for(const f of w.fronts){
    if(f.lastOutcome==='Occupied'||f.progress>=1)for(const t of f.territories)w.control[t]=f.attacker;
    if(f.lastOutcome==='Repulsed'||f.progress<=0)for(const t of f.territories)w.control[t]=f.id==='africa'?'GBR':f.id==='east'?'SOV':original[t]||f.defender;
  }
  w.portControl={};for(const [port,territory]of Object.entries({manila:'c840',singapore:'c827',alexandria:'c651',heligoland:'c255w',kiel:'c255w',brest:'c220',toulon:'c220',taranto:'c325',la_spezia:'c325',tobruk:'c620',leningrad:'c365w',sevastopol:'c365w'}))if(w.control[territory])w.portControl[port]=w.control[territory];
  for(const island of ISLANDS)if(w.control['island-'+island.node])w.portControl[island.node]=w.control['island-'+island.node];
  invalidatePorts(s);
}
// Clip a territory against the advancing front in geographic coordinates before projection.
export function occupiedGeometry(geometry,f){
  const dx=f.to[0]-f.from[0],dy=f.to[1]-f.from[1],normal=[dx,dy],p=frontPosition(f);
  const rings=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;
  const polygons=rings.map(poly=>poly.map(ring=>{
    const out=[];for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],da=(a[0]-p[0])*normal[0]+(a[1]-p[1])*normal[1],db=(b[0]-p[0])*normal[0]+(b[1]-p[1])*normal[1];if(da<=0)out.push(a);if((da<=0)!==(db<=0)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return out;
  }).filter(r=>r.length>=3)).filter(p=>p.length);
  return {type:'MultiPolygon',coordinates:polygons};
}
