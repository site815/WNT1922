import { uiModel, displayedFleet } from './ui-model.mjs';
import { compareShips, fullyStaffed } from './ship-staffing.mjs';
import { portSummary } from './ports.mjs';
import { PROFILES, NATION_ORDER } from './catalog.mjs';
import { PORTS, NODES, distanceNm, MAP_CAPITALS, PORT_LOCATIONS } from './world.mjs';
import { fleetPosition, fleetStats, convoyCoverage, fleetStatus, visibleContacts, MISSIONS } from './task-forces.mjs';
import { campaignMinutes, capitalClock } from './campaign-clock.mjs';
import { commandSelection } from './command-panel.mjs';
import { escortCircle } from './convoy-coverage.mjs';
import { mapPoint, geometryPath, polygonPath, linePath, seaOutline } from './projection.mjs';
import { POWERS, frontPosition, occupiedGeometry } from './land-war.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Math.round(v||0).toLocaleString('en-US');
const button=(text,action,attrs='')=>`<button data-action="${action}" ${attrs}>${text}</button>`;
const clockText=(s,minute)=>{const t=capitalClock(s,s.player,minute);return `${t.date} · ${t.time}`;};
const coords=p=>`${Math.abs(p[1]).toFixed(1)}°${p[1]<0?'S':'N'} ${Math.abs(p[0]).toFixed(1)}°${p[0]<0?'W':'E'}`;
const details=rows=>`<dl class="command-details">${rows.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
export const routePath=(points,rotation=0)=>linePath(points,rotation);
export function remainingRoute(s,f,now=campaignMinutes(s)){
  if(now>=f.arriveAt)return [];
  let distance=Math.max(0,now-f.departAt)*f.speed/60;
  for(let i=1;i<f.route.length;i++){const leg=distanceNm(f.route[i-1],f.route[i]);if(distance<=leg)return [fleetPosition(s,f,now),...f.route.slice(i)];distance-=leg;}return [];
}
let coastCache={},geographyCache={},geographyRevision=0;
let markerLayout={key:null,offsets:new Map()};
function politicalMap(s,data,rotation,zoom){
  if(!data?.features)return '';
  const signature=JSON.stringify([rotation,zoom,s.paused,s.world?.control,(s.world?.fronts||[]).map(f=>[f.id,Math.round(f.progress*1000),f.status,Math.sign(f.pressure||0)])]);
  if(geographyCache.data===data&&geographyCache.signature===signature){const exists=typeof document!=='undefined'&&document.querySelector('[data-key="geography"][data-revision="'+geographyCache.revision+'"]');return '<g data-key="geography" data-revision="'+geographyCache.revision+'"'+(exists?' data-preserve="true">':'>'+geographyCache.html)+'</g>';}
  if(coastCache.data!==data||coastCache.rotation!==rotation)coastCache={data,rotation,paths:new Map(data.features.map(f=>[f.id,geometryPath(f.geometry,rotation)]))};
  const control=s.world?.control||{},fronts=s.world?.fronts||[];
  let result=data.features.map(f=>{const owner=control[f.id]||f.owner;return `<path d="${coastCache.paths.get(f.id)}" fill="${POWERS[owner]?.color||'#343b43'}" fill-opacity=".85" class="political-territory" data-action="select-territory" data-id="${f.id}" fill-rule="evenodd"><title>${esc(f.name)} · ${esc(POWERS[owner]?.name||f.name)}${control[f.id]?' occupation':''}</title></path>`;}).join('');
  result+=fronts.filter(f=>f.progress>.01&&f.progress<.99).map(f=>{
    const territories=data.features.filter(t=>f.territories.includes(t.id)),path=territories.map(t=>geometryPath(occupiedGeometry(t.geometry,f),rotation)).join('');
    const p=frontPosition(f),dx=f.to[0]-f.from[0],dy=f.to[1]-f.from[1],norm=Math.hypot(dx,dy),length=f.seaWeight>.6?3:6;
    const line=[[p[0]-dy/norm*length,p[1]+dx/norm*length],[p[0]+dy/norm*length,p[1]-dx/norm*length]];
    return `<g data-action="select-front" data-id="${f.id}" role="button" tabindex="0" aria-label="${esc(f.name)}"><path d="${path}" fill="${POWERS[f.attacker]?.color||'#b38b66'}" fill-opacity=".75" stroke="none" fill-rule="evenodd"><title>${esc(f.name)} · ${esc(f.attacker)} occupation</title></path><clipPath id="front-${f.id}"><path d="${territories.map(t=>coastCache.paths.get(t.id)).join('')}"/></clipPath><path d="${linePath(line,rotation)}" class="land-front ${s.paused||f.status==='Ceasefire'?'':'advancing'} ${f.pressure<0?'retreating':''}" clip-path="url(#front-${f.id})"><title>${esc(f.name)}</title></path></g>`;
  }).join('');
  const html=result+data.features.filter(f=>['c2','c200','c255w','c740','c365w','c710','c220','c325','c900'].includes(f.id)).map(f=>{const p=mapPoint(f.point,rotation),owner=control[f.id]||f.owner;return `<text x="${p[0]}" y="${p[1]}" class="power-label" style="fill:${PROFILES[owner]?.color||'#a3aab0'}" font-size="${11/zoom}">${esc(f.id==='c900'?'AUSTRALIA':f.id==='c365w'?'SOVIET UNION':owner)}</text>`;}).join('');
  geographyCache={data,signature,html,revision:++geographyRevision};return '<g data-key="geography" data-revision="'+geographyRevision+'">'+html+'</g>';
}
const typeOrder=['CV','CVL','BB','BC','CA','CL','DL','DD','DE','TB','SS','SM','AO','AD','AV','AK'];
const liveShips=stats=>stats.groups.filter(g=>g.count&&!['sunk','scrapped'].includes(g.status));
export function fleetComposition(stats,c){const counts={};for(const g of liveShips(stats)){const t=c.classes[g.classId].type;counts[t]=(counts[t]||0)+g.count;}return Object.entries(counts).sort(([a],[b])=>(typeOrder.indexOf(a)<0?99:typeOrder.indexOf(a))-(typeOrder.indexOf(b)<0?99:typeOrder.indexOf(b))).map(([t,n])=>n+' '+t).join(' · ')||'No ships';}
export function fleetPopup(s,c,id){
 const f=s.nations[s.player].fleets.find(f=>f.id===id);if(!f)return '<p>This force has been reorganized. Select its current command on the chart.</p>';
 const {stats,supply,power}=displayedFleet(s,c,f),ships=liveShips(stats).sort(compareShips(c));
 return '<p class="fleet-composition">'+fleetComposition(stats,c)+' <small>· '+num(stats.tons)+' t</small></p><div class="fleet-popup-grid"><section class="formation-manifest"><h3>Assigned ships</h3><div class="manifest-grid">'+ships.map(g=>{const cl=c.classes[g.classId];return '<div class="ship-condition '+(g.health<.65?'serious':g.health<.9?'moderate':'light')+'"><button class="text-button" data-action="spec" data-id="'+g.classId+'" data-ship="'+g.id+'" data-class="'+g.classId+'"><b class="ship-type">'+cl.type+'</b> '+esc(g.name)+'</button><small>'+cl.year+' · '+num(cl.tons)+' t · '+(g.status==='active'&&!g.atSea&&!fullyStaffed(g,cl)?'Awaiting sailors':esc(g.status))+' · '+num((1-g.health)*100)+'% damage</small><small>'+num(g.sailors)+' / '+num(cl.crew*g.count)+' sailors'+(g.airWing?.length?' · '+g.airWing.reduce((v,w)=>v+w.count,0)+' aircraft':'')+'</small></div>';}).join('')+'</div></section><section><h3>Operational details</h3>'+details([['Position',coords(fleetPosition(s,f))],['Passage / maximum',f.speed.toFixed(1)+' / '+stats.maxSpeed.toFixed(1)+' kn'],['Remaining endurance',num(f.fuelNm*1.852)+' km'],['Closest friendly port',esc(supply.portName)+' · '+num(supply.distance*1.852)+' km'],['Port capacity / demand',num(supply.portCapacity?.capacity)+' / '+num(supply.portCapacity?.demand)+' t'],['Distance supply band',num(supply.distanceFactor*100)+'%'],['Delivered replenishment',num(supply.replenishment*100)+' percentage points of distance relief'],['Surface / submarine',num(power.surface)+' / '+num(power.sub)],['Air / ASW power',num(power.air)+' / '+num(power.asw)],...(campaignMinutes(s)<f.arriveAt?[['Arrival',clockText(s,f.arriveAt)]]:[])])+'</section></div>';
}
export function commandView(s,content,ui={},data={}){
  const n=s.nations[s.player],now=campaignMinutes(s),contacts=visibleContacts(s),fleets=n.fleets.map(f=>({f,...displayedFleet(s,content,f)})).filter(r=>r.stats.groups.some(g=>g.count&&!['sunk','scrapped'].includes(g.status)));
  const f=fleets.find(r=>r.f.id===ui.fleetId)?.f,stats=f?fleets.find(r=>r.f===f).stats:null,supply=f?fleets.find(r=>r.f===f).supply:null,power=f?fleets.find(r=>r.f===f).power:null;
  const contact=contacts.find(c=>c.id===ui.contactId),convoy=n.convoys.find(c=>c.id===ui.convoyId),mission=ui.mission||f?.mission||'guard',unequal=ui.aggressiveBattle??f?.aggressiveBattle??false;
  const zoom=ui.zoom||1,rotation=ui.rotation||0,width=1200/zoom,height=600/zoom,cx=ui.cx??600,cy=Math.max(height/2,Math.min(600-height/2,ui.cy??300)),scale=1.5/zoom,project=p=>mapPoint(p,rotation);
  const enemies=Object.values(s.relations).filter(r=>r.war&&[r.a,r.b].includes(s.player)).map(r=>PROFILES[r.a===s.player?r.b:r.a].name);
  const layoutKey=s.player+':'+s.campaignId+':'+s.initial?.[s.player]?.tons;
  if(markerLayout.key!==layoutKey)markerLayout={key:layoutKey,offsets:new Map()};
  const positions=[],place=(point,radius=12*scale,id)=>{
    const p=project(point);let candidate=p;
    const stored=markerLayout.offsets.get(id);
    if(stored){candidate=[p[0]+stored[0]*scale,p[1]+stored[1]*scale];positions.push({x:candidate[0],y:candidate[1],radius});return candidate;}
    for(let i=0;i<300;i++){const spread=Math.sqrt(i)*18*scale,angle=i*2.399963;candidate=[p[0]+Math.cos(angle)*spread,p[1]+Math.sin(angle)*spread];if(positions.every(q=>Math.hypot(q.x-candidate[0],q.y-candidate[1])>=q.radius+radius+2*scale))break;}
    if(id)markerLayout.offsets.set(id,[(candidate[0]-p[0])/scale,(candidate[1]-p[1])/scale]);
    positions.push({x:candidate[0],y:candidate[1],radius});return candidate;
  };
  let grid='';for(let lat=-60;lat<=60;lat+=30)grid+=`<path d="${linePath(Array.from({length:181},(_,i)=>[-180+i*2,lat]),rotation)}"/>`;for(let lon=-180;lon<180;lon+=30)grid+=`<path d="${linePath(Array.from({length:91},(_,i)=>[lon,-90+i*2]),rotation)}"/>`;
  const markerLocation=(id,x,y,px,py)=>Math.hypot(x-px,y-py)>1?'<g class="marker-location" style="color:'+PROFILES[s.player].color+'" data-motion-id="'+id+'" data-motion-x="'+px+'" data-motion-y="'+py+'"><line x1="'+px+'" y1="'+py+'" x2="'+x+'" y2="'+y+'"/><circle cx="'+px+'" cy="'+py+'" r="'+1.1*scale+'"/></g>':'';
  const ownMarkers=fleets.map(({f:ship,stats:st})=>{
    const position=fleetPosition(s,ship),[x,y]=place(position,12*scale,ship.id),[px,py]=project(position),active=ship.id===f?.id&&!contact&&!convoy;
    return `${markerLocation(ship.id,x,y,px,py)}<g class="fleet-marker own ${active?'selected':''}" role="button" tabindex="0" aria-label="${esc(ship.name)}: ${st.hulls} ships" data-action="select-fleet" data-id="${ship.id}" data-fleet-hover="${ship.id}" data-motion-id="${ship.id}" data-motion-x="${px}" data-motion-y="${py}" style="color:${PROFILES[s.player].color}"><circle cx="${x}" cy="${y}" r="${12*scale}" class="map-hit"/><path transform="translate(${x},${y}) scale(${scale})" d="M0,-7 L7,5 L0,2 L-7,5 Z"/>${active?`<circle cx="${x}" cy="${y}" r="${11*scale}" class="selection-ring"/>`:''}</g>`;
  }).join('');
  const contactPositions=new Map(),placeContact=point=>{const p=project(point),key=`${Math.round(p[0]/(18*scale))}:${Math.round(p[1]/(18*scale))}`,i=contactPositions.get(key)||0;contactPositions.set(key,i+1);const radius=Math.sqrt(i)*7*scale,angle=i*2.399963;return [p[0]+Math.cos(angle)*radius,p[1]+Math.sin(angle)*radius];};
  const enemyMarkers=contacts.map(c=>{
    const [x,y]=placeContact(c.position),selected=contact?.id===c.id,[px,py]=project(c.position),q=project([c.position[0],Math.min(85,c.position[1]+c.uncertainty/60)]),ry=Math.min(140,Math.abs(q[1]-py)),rx=Math.min(250,ry/Math.max(.3,Math.cos(c.position[1]*Math.PI/180)));
    return `<g class="fleet-marker contact ${c.source==='Scouting'?'scouted':'reported'}" role="button" tabindex="0" aria-label="${c.nation} ${esc(c.kind)}, ${c.stage}" data-action="select-contact" data-id="${c.id}" data-map-hover="contact:${c.id}" style="color:${PROFILES[c.nation].color}">${selected?`<ellipse class="uncertainty-area" cx="${px}" cy="${py}" rx="${rx}" ry="${ry}"/>`:''}<g opacity="${Math.max(.16,c.confidence).toFixed(2)}"><path class="leader" d="M${px},${py}L${x},${y}"/><circle class="map-hit" cx="${x}" cy="${y}" r="${12*scale}"/><path transform="translate(${x},${y}) scale(${scale})" d="M0,-7L7,0L0,7L-7,0Z"/></g></g>`;
  }).join('');
  const coverage=uiModel(s)?.escortCoverage||convoyCoverage(s,content);
  const escortAreas='<g class="escort-coverage-layer" aria-label="Convoy escort coverage">'+coverage.escorts.map(e=>'<path data-escort-area="'+e.id+'" d="'+polygonPath([escortCircle(e.position)],rotation)+'"/>').join('')+'</g>';
  const convoys=n.convoys.filter(v=>v.count).map(v=>{const position=fleetPosition(s,v),[x,y]=place(position,8*scale),[px,py]=project(position);return `${markerLocation(v.id,x,y,px,py)}<g class="convoy-marker" style="color:${PROFILES[s.player].color}" role="button" tabindex="0" data-action="select-convoy" data-id="${v.id}" data-map-hover="convoy:${v.id}" data-motion-id="${v.id}" data-motion-x="${px}" data-motion-y="${py}" aria-label="${esc(v.name)}: ${v.count} merchants">${`<circle class="convoy-cover-ring ${coverage.convoys.find(row=>row.id===v.id)?.defense>0?'covered':'exposed'}" cx="${x}" cy="${y}" r="${8*scale}"/>`}<rect x="${x-4*scale}" y="${y-3*scale}" width="${8*scale}" height="${6*scale}"/></g>`;}).join('');
  const ports=Object.entries(PORTS).map(([id,p])=>{const [x,y]=project(PORT_LOCATIONS[id]||NODES[id]),owner=s.world?.portControl[id]||p.nation;const capacity=uiModel(s)?.ports[id]||portSummary(s,content,id),front=s.world?.fronts.find(f=>f.island&&f.port===id);return `<g class="map-port" role="button" tabindex="0" data-action="select-port" data-id="${id}" data-map-hover="port:${id}" aria-label="${esc(p.name)} port" style="fill:${POWERS[owner]?.color||'#adc3c1'}"><circle class="map-hit" cx="${x}" cy="${y}" r="${9*scale}"/><circle cx="${x}" cy="${y}" r="${2.5*scale}"/>${front&&front.progress>0&&front.progress<1?`<circle class="island-front ${s.paused||front.status==='Ceasefire'?'':'advancing'}" cx="${x}" cy="${y}" r="${8*scale}" fill="none" stroke="${POWERS[front.attacker].color}" stroke-width="1.8" vector-effect="non-scaling-stroke"></circle>`:''}${`<text x="${x+5*scale}" y="${y+12*scale}" style="font-size:${10*scale}px">${esc(p.name)}</text>`}</g>`;}).join('');
  const capitals=Object.entries(MAP_CAPITALS).map(([id,p])=>{const [x,y]=project(p.point);return `<g class="map-capital" role="button" tabindex="0" data-action="select-country" data-id="${id}" data-map-hover="capital:${id}" aria-label="${esc(p.name)} capital" style="fill:${PROFILES[id].color}"><circle class="map-hit" cx="${x}" cy="${y}" r="${9*scale}"/><path d="M${x},${y-4*scale}L${x+4*scale},${y}L${x},${y+4*scale}L${x-4*scale},${y}Z"/><text x="${x+5*scale}" y="${y-5*scale}" font-size="${10*scale}">${p.name}</text></g>`;}).join('');

  const selectedKey=ui.portId||ui.contactId||ui.convoyId||ui.frontId||ui.countryId||ui.territoryId||(ui.credits?'credits':f?.id)||'commands';
  const columns=1;
  const fleetList='<div class="panel-title"><h2>Naval commands</h2><span>'+fleets.length+' forces</span></div><div class="fleet-command-list" data-scroll-key="naval-commands">'+fleets.map(({f:ship,stats:st})=>'<button class="fleet-command-row" data-action="focus-fleet" data-id="'+ship.id+'" data-fleet-hover="'+ship.id+'" data-hover-mode="readiness"><strong>'+esc(ship.name)+'</strong><span class="fleet-composition">'+fleetComposition(st,content)+'</span><small>'+(ship.role==='support'?'Automatic support':MISSIONS[ship.mission].name)+' · '+fleetStatus(s,ship)+'</small></button>').join('')+'</div>'+(!fleets.length?'<p>No operational warships. Commission or recommission ships to form commands.</p>':'');
  const selection=commandSelection(s,content,ui,data,{fleet:f,stats,supply,contact,convoy,composition:stats?fleetComposition(stats,content):'',manifest:f?fleetPopup(s,content,f.id,ui.manifestPage):''});
  const panel=selection?'<div class="command-panel-nav">'+button('‹ All commands','command-list')+'</div><div class="order-content fleet-order-panel">'+selection+'</div>':fleetList;
  const route=convoy?remainingRoute(s,convoy):f?remainingRoute(s,f):[];
  const legend='<div class="map-legend" aria-label="Map legend"><span style="color:'+PROFILES[s.player].color+'">▲ Fleet</span><span style="color:'+PROFILES[s.player].color+'">■ Convoy</span><span title="Scouting or intelligence; brightness fades with age">◇ Contact</span><span>● Port</span><span>◆ Capital</span><span title="Land front / island assault">━/◯ Front</span><span class="legend-powers">'+NATION_ORDER.map(id=>'<span style="color:'+PROFILES[id].color+'" title="'+PROFILES[id].name+'">'+id+'</span>').join('')+'</span>'+'<span title="Always shown: green rings are escorted; dashed red rings are exposed. Green areas mark operational escort reach (148 km).">Escort cover '+coverage.convoys.filter(v=>v.defense>0).length+'/'+coverage.convoys.length+'</span>'+button('Map credits','map-credits','title="Powers, map credits and chart controls"')+'</div>';
  return '<div class="world-command" style="--command-columns:'+columns+'"><section class="world-board panel" aria-label="World naval chart"><div class="map-stage"><svg class="world-map" data-paused="'+s.paused+'" viewBox="'+(cx-width/2)+' '+(cy-height/2)+' '+width+' '+height+'" role="group" tabindex="0" aria-label="Equal Earth political and naval map. Drag to pan; scroll or plus and minus to zoom; Home resets. Select an item for information in the command panel to the right."><path d="'+seaOutline()+'" class="sea"/><g class="graticule">'+grid+'</g>'+politicalMap(s,data,rotation,zoom)+escortAreas+ports+capitals+'<path d="'+routePath(route,rotation)+'" class="ordered-route" style="color:'+PROFILES[s.player].color+'"/>'+convoys+enemyMarkers+ownMarkers+'</svg></div>'+legend+'</section><section class="panel command-side-panel" data-key="command-selection-'+selectedKey+'" data-scroll-key="command-selection-'+selectedKey+'" aria-label="Command information and controls">'+panel+'</section></div>';
}
