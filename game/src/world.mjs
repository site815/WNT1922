// Approximate sea lanes, in longitude/latitude. Coasts: Natural Earth, public domain.
// The Cape routes are used by all sizes of ship; canal access is not modeled.
export const NODES={
  midway:[-177.37,28.21],wake:[166.62,19.28],saipan:[145.68,15.16],truk:[151.83,7.40],palau:[134.42,7.27],kwajalein:[167.69,8.73],majuro:[171.36,7.10],tarawa:[172.93,1.35],
  channel_west:[-3,49.8],channel_east:[0,50.4],dover:[1.5,51],southern_north_sea:[3,53],kiel_east:[11.2,54.6],pacific_north:[-128,45],kyushu_south:[130,30],portsmouth:[-1.5,50.5],rosyth:[-2,56],kiel:[10.5,54.65],manila:[120.1,14.2],mare_island:[-123,37.5],puget:[-125,48.5],kure:[132.5,32.5],sasebo:[129,32],
  brest:[-5.5,48.2],toulon:[6,42],la_spezia:[9.5,43.5],taranto:[18.2,39.5],tobruk:[23.7,33],dakar:[-18,14.5],
  skagerrak:[10,58.5],kattegat:[12,56.7],oresund:[12.75,55.7],baltic:[16,55],baltic_north:[20,58],gulf_finland:[26.5,59.7],leningrad:[29,60],
  aegean:[25,38],dardanelles:[26.2,40],marmara:[28,40.8],bosporus:[29.2,41.2],black_sea:[32,43],sevastopol:[33,44],
  east_china:[125,30],tsushima_west:[128.8,33],tsushima_east:[129.8,35],japan_sea:[133.5,38],vladivostok:[132.5,42.5],
  scapa:[-2,59.2],heligoland:[7.3,54.2],north_sea:[2,56],norway:[2,63],iceland:[-15,61],
  canaries:[-20,27],cape_verde:[-24,16],freetown:[-14,7.5],ascension:[-14.5,-8],agulhas:[27,-37],durban:[33,-30],mauritius:[58,-21],diego_garcia:[72.5,-7.5],
  atlantic:[-30,45],biscay:[-12,45],portugal:[-11,38],iberia_south:[-9,35.8],azores:[-30,32],gibraltar:[-6.1,35.8],alboran:[-3,36],
  balearic:[3,38],sardinia_south:[9,38],sicily_south:[12.5,36.5],malta:[15,35],crete:[25,34],alexandria:[29,32],
  norfolk:[-75.3,36.7],west_atlantic:[-60,36],bermuda:[-60,28],caribbean:[-62,17],
  equatorial_atlantic:[-30,0],brazil:[-30,-25],south_atlantic:[-10,-35],cape:[18,-37],
  horn_east:[-60,-58],horn_west:[-77,-58],chile:[-82,-30],peru:[-90,-5],mexico:[-110,15],
  san_diego:[-118,32],california:[-125,30],hawaii:[-158,21],central_pacific:[-175,20],
  yokosuka:[140.5,34.5],japan:[145,30],philippine:[135,20],guam:[145,13],
  south_china:[115,12],taiwan_east:[124,22],luzon_north:[120,20],vietnam:[109,6],
  singapore:[104.5,1.5],singapore_strait:[104,1.1],strait_west:[103.4,1.1],malacca_south:[101.5,2.4],malacca:[100,5],andaman:[95,7],ceylon:[80,4],arabian:[65,12],
  indian:[75,-15],madagascar:[52,-28],australia_west:[110,-25],australia_south:[130,-42],
  tasman:[155,-40],tasmania_south:[147,-45],australia_southwest:[112,-37],coral:[158,-20],bismarck_east:[157,3],solomon_east:[164,-8],new_caledonia_south:[163,-25],south_pacific:[-150,-30],equatorial_pacific:[-155,0],
};
const chains=[
  'hawaii midway wake saipan guam palau philippine','wake kwajalein majuro tarawa equatorial_pacific','saipan truk kwajalein','truk bismarck_east','palau truk',
  'brest channel_west portsmouth channel_east dover southern_north_sea north_sea rosyth','baltic kiel_east kiel','south_china manila','california mare_island','california pacific_north puget','tsushima_west sasebo kyushu_south kure yokosuka',
  'biscay brest','balearic toulon la_spezia','malta taranto','crete tobruk','cape_verde dakar',
  'north_sea skagerrak kattegat oresund baltic baltic_north gulf_finland leningrad',
  'crete aegean dardanelles marmara bosporus black_sea sevastopol',
  'taiwan_east east_china tsushima_west tsushima_east japan_sea vladivostok',
  'heligoland north_sea scapa iceland atlantic azores equatorial_atlantic brazil south_atlantic cape madagascar indian ceylon andaman malacca malacca_south strait_west singapore_strait singapore vietnam south_china luzon_north taiwan_east japan yokosuka',
  'north_sea norway iceland','atlantic biscay portugal iberia_south gibraltar alboran balearic sardinia_south sicily_south malta crete alexandria',
  'azores gibraltar','norfolk west_atlantic atlantic','west_atlantic bermuda caribbean equatorial_atlantic',
  'bermuda azores','brazil horn_east horn_west chile peru mexico california san_diego',
  'california hawaii central_pacific japan','central_pacific guam philippine taiwan_east',
  'japan philippine','guam bismarck_east solomon_east coral tasman tasmania_south australia_south australia_southwest australia_west indian',
  'madagascar australia_west','indian arabian ceylon','south_pacific new_caledonia_south coral','south_pacific chile',
  'south_pacific equatorial_pacific hawaii','equatorial_pacific peru','central_pacific equatorial_pacific',
  'portugal canaries cape_verde freetown ascension cape agulhas durban madagascar mauritius diego_garcia ceylon',
];
NODES.sound_south=[12.7,55.0];NODES.baltic_gate=[13.5,54.65];NODES.gulf_gate=[22,59.8];NODES.crete_east=[27,35.3];
const detours={'oresund baltic':['oresund','sound_south','baltic_gate','baltic'],'baltic_north gulf_finland':['baltic_north','gulf_gate','gulf_finland'],'crete aegean':['crete','crete_east','aegean']};
export const EDGES=chains.flatMap(c=>{const n=c.split(' ');return n.slice(1).flatMap((v,i)=>{const route=detours[n[i]+' '+v]||[n[i],v];return route.slice(1).map((b,j)=>[route[j],b]);});});
export const PORTS={
  midway:{name:'Midway',nation:'USA'},wake:{name:'Wake Island',nation:'USA'},saipan:{name:'Saipan / Tanapag',nation:'JPN'},truk:{name:'Truk Lagoon',nation:'JPN'},palau:{name:'Palau / Koror',nation:'JPN'},kwajalein:{name:'Kwajalein',nation:'JPN'},majuro:{name:'Majuro',nation:'JPN'},tarawa:{name:'Tarawa',nation:'GBR'},
  portsmouth:{name:'Portsmouth',nation:'GBR'},rosyth:{name:'Rosyth',nation:'GBR'},kiel:{name:'Kiel',nation:'DEU'},manila:{name:'Manila / Cavite',nation:'USA'},mare_island:{name:'Mare Island / San Francisco',nation:'USA'},puget:{name:'Puget Sound',nation:'USA'},kure:{name:'Kure',nation:'JPN'},sasebo:{name:'Sasebo',nation:'JPN'},
  brest:{name:'Brest',nation:'FRA'},toulon:{name:'Toulon',nation:'FRA'},dakar:{name:'Dakar',nation:'FRA'},
  la_spezia:{name:'La Spezia',nation:'ITA'},taranto:{name:'Taranto',nation:'ITA'},tobruk:{name:'Tobruk',nation:'ITA'},
  leningrad:{name:'Kronstadt / Leningrad',nation:'SOV'},sevastopol:{name:'Sevastopol',nation:'SOV'},vladivostok:{name:'Vladivostok',nation:'SOV'},
  scapa:{name:'Scapa Flow',nation:'GBR'},heligoland:{name:'Wilhelmshaven',nation:'DEU'},
  yokosuka:{name:'Yokosuka',nation:'JPN'},san_diego:{name:'San Diego',nation:'USA'},
  norfolk:{name:'Norfolk',nation:'USA'},hawaii:{name:'Pearl Harbor',nation:'USA'},
  gibraltar:{name:'Gibraltar',nation:'GBR'},alexandria:{name:'Alexandria',nation:'GBR'},singapore:{name:'Singapore',nation:'GBR'},
  freetown:{name:'Freetown station',nation:'GBR'},ascension:{name:'Ascension anchorage',nation:'GBR'},cape:{name:'Simon’s Town',nation:'GBR'},durban:{name:'Durban station',nation:'GBR'},mauritius:{name:'Mauritius station',nation:'GBR'},diego_garcia:{name:'Chagos anchorage',nation:'GBR'},ceylon:{name:'Trincomalee',nation:'GBR'},australia_west:{name:'Fremantle',nation:'GBR'},malta:{name:'Malta / Valletta',nation:'GBR'},guam:{name:'Guam / Apra Harbor',nation:'USA'},
};
export const HOME_PORT={JPN:'yokosuka',USA:'san_diego',GBR:'scapa',DEU:'heligoland',FRA:'toulon',ITA:'taranto',SOV:'leningrad'};
// Abstract landing resistance and minimum campaign duration, deliberately
// tunable. Tiny islands are explicit chart nodes smaller than the base-map polygon resolution.
export const ISLANDS=[
 ['guam','Guam','USA','JPN',8,35],['wake','Wake Island','USA','JPN',14,45],['midway','Midway','USA','JPN',55,160],
 ['saipan','Saipan & Tinian','JPN','USA',60,150],['truk','Truk Lagoon','JPN','USA',90,230],['palau','Palau','JPN','USA',40,110],
 ['kwajalein','Kwajalein','JPN','USA',30,85],['majuro','Majuro','JPN','USA',10,25],['tarawa','Tarawa','GBR','JPN',14,45]
].map(([node,name,owner,challenger,days,resistance])=>({node,name,owner,challenger,days,resistance,point:NODES[node]}));
export const AREAS=Object.fromEntries([
  ['north_sea','North Sea','atlantic'],['norway','Norwegian Sea','atlantic'],['iceland','Western approaches','atlantic'],
  ['atlantic','North Atlantic','atlantic'],['biscay','Bay of Biscay','atlantic'],['west_atlantic','Western Atlantic','atlantic'],
  ['caribbean','Caribbean approaches','atlantic'],['south_atlantic','South Atlantic','atlantic'],
  ['balearic','Western Mediterranean','mediterranean'],['crete','Eastern Mediterranean','mediterranean'],
  ['arabian','Arabian Sea','indian'],['ceylon','Ceylon approaches','indian'],['indian','Indian Ocean','indian'],['malacca','Strait of Malacca','indian'],
  ['japan','Japanese approaches','pacific'],['south_china','South China Sea','pacific'],['philippine','Philippine Sea','pacific'],
  ['guam','Marianas','pacific'],['central_pacific','Central Pacific','pacific'],['hawaii','Hawaiian waters','pacific'],
  ['california','Eastern Pacific','pacific'],['coral','Coral Sea','pacific'],['tasman','Tasman Sea','pacific'],
].map(([id,name,region])=>[id,{id,name,region,point:NODES[id]}]));
export const DEFAULT_AREA={FRA:'balearic',ITA:'crete',SOV:'north_sea',JPN:'japan',USA:'california',GBR:'north_sea',DEU:'north_sea'};
export const REGION_AREA={atlantic:'atlantic',mediterranean:'crete',indian:'ceylon',pacific:'central_pacific'};
export { MISSIONS } from './missions.mjs';
export const wrapLon=lon=>((lon+540)%360)-180;
export function distanceNm(a,b){if(a[0]===b[0]&&a[1]===b[1])return 0;const rad=Math.PI/180,dlat=(b[1]-a[1])*rad,dlon=wrapLon(b[0]-a[0])*rad;const h=Math.sin(dlat/2)**2+Math.cos(a[1]*rad)*Math.cos(b[1]*rad)*Math.sin(dlon/2)**2;return 3440.065*2*Math.asin(Math.min(1,Math.sqrt(h)));}
export const interpolate=(a,b,t)=>[wrapLon(a[0]+wrapLon(b[0]-a[0])*t),a[1]+(b[1]-a[1])*t];
export const project=([lon,lat])=>[(lon+180)*10/3,(90-lat)*10/3];
const neighbors=Object.fromEntries(Object.keys(NODES).map(k=>[k,[]]));
for(const [a,b]of EDGES){neighbors[a].push(b);neighbors[b].push(a);}
const routeCache=new Map();
export function seaRoute(from,to){
  if(!NODES[from]||!NODES[to])throw new Error('Unknown sea lane.');
  const key=`${from}:${to}`;if(routeCache.has(key))return [...routeCache.get(key)];
  const costs={[from]:0},prev={},todo=new Set(Object.keys(NODES));
  while(todo.size){const a=[...todo].reduce((best,n)=>(costs[n]??Infinity)<(costs[best]??Infinity)?n:best);todo.delete(a);if(a===to)break;
    for(const b of neighbors[a]){const d=(costs[a]??Infinity)+distanceNm(NODES[a],NODES[b]);if(d<(costs[b]??Infinity)){costs[b]=d;prev[b]=a;}}
  }
  const path=[to];while(path[0]!==from){if(!prev[path[0]])throw new Error('Disconnected sea lane.');path.unshift(prev[path[0]]);}
  routeCache.set(key,path);return [...path];
}
export function routeLength(points){let d=0;for(let i=1;i<points.length;i++)d+=distanceNm(points[i-1],points[i]);return d;}
export function pointAlong(points,distance){for(let i=1;i<points.length;i++){const leg=distanceNm(points[i-1],points[i]);if(distance<=leg)return interpolate(points[i-1],points[i],leg?distance/leg:1);distance-=leg;}return points.at(-1);}
export function patrolPoint(area,minute,salt=0){
  const a=NODES[area],b=NODES[neighbors[area][0]],leg=distanceNm(a,b);
  const phase=((minute/60+salt*7)%24+24)%24;
  return interpolate(a,b,Math.min(.18,55/Math.max(1,leg))*(1-Math.abs(phase-12)/12));
}

export const MAP_CAPITALS={JPN:{name:'Tokyo',point:[139.75,35.68]},USA:{name:'Washington',point:[-77.04,38.90]},GBR:{name:'London',point:[-.13,51.51]},DEU:{name:'Berlin',point:[13.40,52.52]},FRA:{name:'Paris',point:[2.35,48.86]},ITA:{name:'Rome',point:[12.50,41.90]},SOV:{name:'Moscow',point:[37.62,55.75]}};
export const PORT_LOCATIONS={portsmouth:[-1.1,50.8],rosyth:[-3.45,56.02],kiel:[10.14,54.33],manila:[120.90,14.48],mare_island:[-122.27,38.1],puget:[-122.63,47.56],kure:[132.56,34.23],sasebo:[129.72,33.16],ceylon:[81.23,8.57],australia_west:[115.75,-32.05],brest:[-4.49,48.39],toulon:[5.93,43.12],dakar:[-17.45,14.67],la_spezia:[9.82,44.1],taranto:[17.24,40.46],tobruk:[23.96,32.08],leningrad:[29.77,59.99],sevastopol:[33.52,44.62],vladivostok:[131.89,43.12],scapa:[-3.01,58.9],heligoland:[8.14,53.53],yokosuka:[139.66,35.28],san_diego:[-117.16,32.72],norfolk:[-76.28,36.85],hawaii:[-157.95,21.35],gibraltar:[-5.35,36.14],alexandria:[29.92,31.20],singapore:[103.85,1.29],malta:[14.51,35.9],guam:[144.66,13.44],cape:[18.44,-34.19]};
