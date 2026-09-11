import { uiModel, displayedFleet } from './ui-model.mjs';
import { PROFILES, TYPES } from './catalog.mjs';
import { PORTS, HOME_PORT, MAP_CAPITALS } from './world.mjs';
import { portSummary, PORT_REPAIR } from './ports.mjs';
import { fullyStaffed, crewEffectiveness, compareShips } from './ship-staffing.mjs';
import { compositionText } from './composition.mjs';
import { relationColor } from './relation-color.mjs';
import { MISSIONS, fleetPosition, convoyCoverage, visibleContacts, fleetStatus } from './task-forces.mjs';
import { capitalClock } from './campaign-clock.mjs';
import { aircraftModels } from './naval-resources.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(v,d=0)=>Number(v||0).toLocaleString('en-US',{maximumFractionDigits:d});
const list=rows=>'<dl class="inspection-list">'+rows.map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+v+'</dd></div>').join('')+'</dl>';
export function mapHover(s,c,key){
 const [kind,id]=key.split(':');
 if(kind==='port'&&PORTS[id]){const p=uiModel(s)?.ports[id]||portSummary(s,c,id);return '<span class="eyebrow">'+esc(p.owner)+' · '+esc(p.tierName)+'</span><h3>'+esc(PORTS[id].name)+'</h3>'+list([['Supply / demand',num(p.capacity)+' / '+num(p.demand)+' t'],['Condition',num(p.health*100)+'%'],['Trade',num(p.effectiveTrade,1)+' / '+num(p.trade)+' points'],['Combat power',num(p.combat)],['Gun / aviation reach',num(p.gunRange*1.852)+' / '+num(p.airRange*1.852)+' km']])+'<small>Click for port information in the command panel.</small>';}
 if(kind==='capital'&&MAP_CAPITALS[id]){const p=PROFILES[id],r=s.relations[[s.player,id].sort().join('-')];return '<span class="eyebrow">CAPITAL · '+id+'</span><h3>'+esc(MAP_CAPITALS[id].name)+'</h3><p style="color:'+p.color+'">'+p.name+'</p><p>'+(id===s.player?'Your government':r?(r.war?'At war':r.allied?'Allied':'At peace')+' · <span style="color:'+relationColor(r.score)+'">'+num(r.score)+' relations</span>':'')+'</p><small>Click for government information in the command panel.</small>';}
 if(kind==='contact'){const contact=visibleContacts(s).find(c=>c.id===id);if(!contact)return '';const clock=capitalClock(s,s.player,contact.seenAt);return '<span class="eyebrow">REPORTED CONTACT · '+contact.nation+'</span><h3>'+esc(contact.kind)+'</h3>'+list([['Estimated strength',num(contact.estimate)+' hulls'],['Confidence',num(contact.confidence*100)+'% · '+esc(contact.stage)],['Source',esc(contact.source)],['Last report',clock.date+' '+clock.time],['Search radius','±'+num(contact.uncertainty*1.852)+' km']])+'<small>Click for the last observed position and intelligence details.</small>';}
 if(kind==='convoy'){const convoy=s.nations[s.player].convoys.find(c=>c.id===id);if(!convoy)return '';const clock=capitalClock(s,s.player,convoy.arriveAt),cover=(uiModel(s)?.escortCoverage||convoyCoverage(s,c)).convoys.find(v=>v.id===id);return '<span class="eyebrow">MERCHANT SHIPPING</span><h3>'+esc(convoy.name)+'</h3>'+list([['Merchant hulls',num(convoy.count)],['Escort coverage',cover?.defense>0?cover.escorts.length+' nearby forces · '+num(cover.defense)+' defense':'Exposed · no operational escort within 148 km'],['Speed',num(convoy.speed)+' kn'],['Next arrival',clock.date+' '+clock.time]])+'<small>Click for convoy information in the command panel.</small>';}
 return '';
}
export function fleetReadinessHover(s,c,f){
 const n=s.nations[s.player],{stats,supply}=displayedFleet(s,c,f);
 return '<span class="eyebrow">FLEET READINESS</span><h3>'+esc(f.name)+'</h3>'+list([['Training / morale',num(n.training)+'% / '+num(n.morale)+'%'],['Supply',num(supply.factor*100)+'%'],['Hull condition',num(stats.health*100)+'%'],['Remaining endurance',num(f.fuelNm*1.852)+' km (fleet fuel limit)'],['Speed / maximum',num(f.speed,1)+' / '+num(stats.maxSpeed,1)+' kn'],['Status',esc(fleetStatus(s,f))],['Engagement policy',f.role==='support'?'Automatic support':f.aggressiveBattle?'Seek aggressive battle':'Preserve the force at poor odds']])+fleetHoverManifest(s,c,f)+'<small>Click the fleet to center it and open its orders in the command panel.</small>';
}
function fleetHoverManifest(s,c,f){
 const groups=s.nations[s.player].groups.filter(g=>g.fleetId===f.id&&g.count&&!['sunk','scrapped'].includes(g.status)).sort(compareShips(c));
 return '<div class="hover-ship-list">'+groups.map(g=>{const cl=c.classes[g.classId],status=g.scrapOnArrival?'Scrapping on arrival':g.reserveOnArrival?'Reserve on arrival':g.status==='active'?(g.atSea?'At sea':fullyStaffed(g,cl)?'Ready in port':'Awaiting sailors'):g.status;return '<div class="hover-ship '+(g.health<.65?'serious':g.health<.9?'moderate':'light')+'"><strong>'+cl.type+' · '+esc(g.name)+'</strong><span>'+num((1-g.health)*100)+'% damage · '+esc(status)+'</span><small>'+num(g.sailors)+' / '+num(cl.crew*g.count)+' sailors'+(g.airWing?.length?' · '+num(g.airWing.reduce((v,w)=>v+w.count,0))+' aircraft':'')+'</small></div>';}).join('')+'</div>';
}
export function fleetCompositionHover(s,c,f){
 const {stats,supply}=displayedFleet(s,c,f),counts={};for(const g of stats.active){const type=c.classes[g.classId].type;counts[type]=(counts[type]||0)+g.count;}
 return '<span class="eyebrow">FLEET COMPOSITION</span><h3>'+esc(f.name)+'</h3><p class="fleet-composition">'+compositionText(counts,'No operational hulls')+'</p><p>Supply '+num(supply.factor*100)+'% · Fuel endurance '+num(f.fuelNm*1.852)+' km<br>'+esc(fleetStatus(s,f))+'</p>'+fleetHoverManifest(s,c,f)+'<small>Fuel endurance is the shared fleet limit. Click the fleet for orders; individual ship inspections are in its manifest.</small>';
}
export function classHover(c){
 return '<span class="eyebrow">'+c.nation+' · '+c.year+' · '+(TYPES[c.type]||c.type)+'</span><h3>'+esc(c.name)+'</h3>'+list([
 ['Displacement',num(c.tons)+' t standard'+(c.raw?.displacement?.full_load_tons?' / '+num(c.raw.displacement.full_load_tons)+' t full load':'')],
 ['Speed / endurance',num(c.speed,1)+' kn / '+num(c.range)+' km'],['Armor: belt / deck',num(c.belt)+' / '+num(c.deck)+' mm'],
 ['Guns',c.barrels?num(c.barrels)+' × '+num(c.caliber)+' mm':'No main battery'],['Torpedoes',num(c.tubes)+' tubes'],['Aircraft',(c.air||0)+(c.scoutAircraft||0)+' slots'],
 ['Complement',num(c.crew)+' sailors'],['Sensors',[c.radar?'Radar':'',c.sonar?'Sonar':''].filter(Boolean).join(' · ')||'Visual observation'],
 ])+'<small>Click a ship for its current state. Click a class name for the full class register.</small>';
}
export function shipDetails(s,c,id){
 const n=s.nations[s.player],g=n.groups.find(g=>g.id===id);if(!g)return '<p>This ship is no longer in the register.</p>';
 const cl=c.classes[g.classId],f=n.fleets.find(f=>f.id===g.fleetId),v=f?displayedFleet(s,c,f):null,models=new Map(aircraftModels(c,s.player).map(a=>[a.id,a]));
 return '<p><b class="ship-type">'+cl.type+'</b> <button class="text-button" data-action="spec" data-id="'+cl.id+'" data-class="'+cl.id+'">'+esc(cl.name)+'</button> · '+g.count+' hull'+(g.count===1?'':'s')+'</p><div class="ship-health '+(g.health<.65?'serious':g.health<.9?'moderate':'light')+'"><strong>'+num((1-g.health)*100)+'% damage</strong><span>'+esc(g.status)+(g.scrapOnArrival?' · scrapping on arrival':g.reserveOnArrival?' · reserve on arrival':'')+'</span></div>'+list([
 ['Assigned command',esc(f?.name||'Unassigned / dockyard')],['Mission',f?f.role==='support'?'Automatic '+(f.supportKind==='depot'?'depot deployment':'replenishment'):f.role==='repair'?'Return for repair':f.role==='reinforcement'?'Reinforce fleet':MISSIONS[f.mission].name:'In port'],
 ['Location',g.atSea&&f?fleetPosition(s,f).map(v=>num(v,2)+'°').join(', '):esc(PORTS[g.dockPort||f?.port||HOME_PORT[s.player]]?.name||'Home port')],
 ['Sailors aboard',num(g.sailors)+' / '+num(cl.crew*g.count)],['Departure readiness',fullyStaffed(g,cl)?'Fully staffed':g.atSea?'Battle casualties reduce damage control and fighting power':'Cannot sail until fully staffed'],
 ['Crew effectiveness',num(crewEffectiveness(g,cl)*100)+'%'],['Training / morale',num(n.training)+'% / '+num(n.morale)+'%'],['Supply',v?num(v.supply.factor*100)+'%':'Port support'],
 ['Air wing',(g.airWing||[]).map(w=>num(w.count)+' '+esc(models.get(w.model)?.name||w.model)+' ('+num(w.crewed)+' crewed)').join('<br>')||'No embarked aircraft'],
 ['Repair order',g.status==='returning'?'Sailing home; vulnerable to interception':g.status==='repair'?'Dockyard repairs consume gold daily':'No active repair order'],
 ])+(g.notes?'<p class="panel-note">'+esc(g.notes)+'</p>':'');
}
export function portPopup(s,c,id,{parts=false}={}){
 const p=uiModel(s)?.ports[id]||portSummary(s,c,id),front=s.world?.fronts.find(f=>f.port===id),summary='<p class="port-tier">'+p.tierName+' · <span style="color:'+PROFILES[p.owner]?.color+'">'+(PROFILES[p.owner]?.name||p.owner)+'</span></p>'+(front?'<p class="port-campaign"><strong>'+esc(front.name)+' · '+esc(front.status)+'</strong><br>'+esc(front.attacker)+' assault progress: '+num(front.progress*100)+'% · Supply: '+num(front.attackerSupply*100)+'% / '+num(front.defenderSupply*100)+'%</p>':'');
 const body=list([
 ['Facility condition',num(p.health*100)+'%'],['Supply capacity / demand',num(p.capacity)+' / '+num(p.demand)+' t'],['Depot supply contribution',num(p.depotSupport)+' t'],['Trade capacity',num(p.effectiveTrade,1)+' / '+num(p.trade)+' trade points'],['Blockaded',num(p.blockade*100)+'% of intact trade capacity'],
 ['Combat power',num(p.combat)],['Artillery / aviation',num(p.artillery)+' / '+num(p.aviation)],['Stationed / fully crewed aircraft',num(p.assignedAircraft)+' / '+num(p.air?.crewed)],['Aviation supplies',num(p.air?.supplies)+' / '+num(p.air?.supplyCapacity)+' sortie units'],['Aircraft readiness',num((p.air?.readiness||0)*100)+'%'],['Incoming reinforcement',(s.nations[p.owner]?.airTransfers||[]).filter(t=>t.destination===id).map(t=>num(t.airWing.reduce((v,w)=>v+w.count,0))+' aircraft · '+num(t.supplies)+' supply units · '+t.mode).join('<br>')||'None underway'],['Coastal battery',esc(p.battery)],['Gun / aviation radius',num(p.gunRange*1.852)+' / '+num(p.airRange*1.852)+' km'],
 ['Repairs',p.underAttack?'Under attack; repairs suspended':p.health>=1?'Intact':'Automatic, when resources are available'],['Daily repair budget',num(p.repairCost.gold)+' gold + '+num(p.repairCost.industry)+' industry'],
 ])+'<div class="aviation-base-wing">'+(p.air?.wings?.length?'<strong>Stationed air groups</strong><ul>'+p.air.wings.map(w=>'<li>'+num(w.count)+' '+esc(w.name)+' · '+esc(w.role)+'<small>'+num(w.crewed)+' fully crewed · combat '+num(w.combatKm)+' km · ferry '+num(w.ferryKm)+' km</small></li>').join('')+'</ul>':'<p>No stationed aircraft.</p>')+'</div>',notes='<p>'+esc(p.note)+'</p><p class="panel-note">Damage reduces supply and trade; blockade reduces trade access. Safe repairs restore up to '+num(PORT_REPAIR.healthPerDay*100,1)+' percentage points per day after 24 hours without attack. Land campaigns determine occupation. Capacities and battery profiles are provisional.</p><p>'+esc(p.gunBasis)+'</p><p>Aviation reach comes from the stationed models. Only fully crewed aircraft in range contribute. Fuel/ammunition stocks limit sorties; ferries and merchant transports deliver reinforcements.</p>'+ (p.baseAviation?.heldReason?'<p>'+esc(p.baseAviation.heldReason)+'</p>':'');
 return parts?{summary,body,notes}:summary+body+notes;
}
