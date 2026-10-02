import { CAMPAIGN_BATTLE_RULES as rules } from '../combatmechanics/campaign-rules.mjs';
import { campaignMinutes, TICK_MINUTES } from "./campaign-clock.mjs";
import { fleetGroups, fleetPosition, operationRandom, invalidateOperations, setRoute, detachRepairs, availableGroup } from "./task-forces.mjs";
import { fleetPower, resolveBattle, resolvePortAction, resolveAirAttack, resolveConvoyAttack, addAlert, addLog } from "./engine.mjs";
import { anchoredShips } from "./port-operations.mjs";
import { portOwner, portSummary } from "./ports.mjs";
import { AREAS, PORTS, distanceNm } from "./world.mjs";
import { PROFILES, REGIONS, fleetService } from "./catalog.mjs";
import { resultComposition } from "./composition.mjs";
import { finishIncident, opposingProvocations } from "./provocation.mjs";
import { recordWarBattle } from "./war-balance.mjs";
import { applyBattleMorale } from './campaign-impact.mjs';
import { decisiveAssessment, recordBattleFrame, recordBackgroundAttrition, pruneAttritionLedger } from './battle-records.mjs';
import { pauseForNewBattle } from './battle-pacing.mjs';
import { createCampaignCombat, merchantCombatGroup, coastalBatteryGroup, createCampaignAirCombat } from '../combatmechanics/campaign.mjs';
import { combatAirPatrol } from './air-operations.mjs';
import { reserveTacticalAirWings, finishTacticalAirWings } from '../combatmechanics/campaign-air-wings.mjs';
import { combatSnapshot } from '../combatmechanics/engine.mjs';
export const BATTLE_STAGES = rules.STAGES;
const zeroPower = () => ({surface:0,air:0,sub:0,asw:0,aa:0,scout:0,total:0,ships:0,speed:0,supply:1});
function emptyResult(c,groups) {
  const r={sunk:0,damaged:0,tons:0,damagedTons:0,engagedTons:0,engaged:0,damagePercent:0,
    planesLost:0,planesRescued:0,aviatorsLost:0,aviatorsRescued:0,sailorsLost:0,sailorsRescued:0,
    losses:[],conditions:[],engagedComposition:{},sunkComposition:{},damagedComposition:{}};
  for(const g of groups.filter(g=>g.count>0)) {
    const cl=c.classes[g.classId];
    r.engaged+=g.count; r.engagedTons+=cl.tons*g.count;
    r.engagedComposition[cl.type]=(r.engagedComposition[cl.type]||0)+g.count;
    r.conditions.push({id:g.id,classId:g.classId,name:g.name,type:cl.type,count:g.count,sunk:0,
      health:g.health,initialHealth:g.health,damage:Math.round((1-g.health)*100),newDamage:0,
      severity:g.health<.65?"serious":g.health<.9?"moderate":"light",tons:cl.tons,returning:false});
  }
  return r;
}
export function battleStageLabel(r) {
  if(r.status!=="ongoing") return r.status==="aborted"?"Disengaged": "Completed";
  if(r.tactical)return 'Tactical engagement · '+Math.floor(r.tactical.seconds/60)+' min';
  return BATTLE_STAGES[r.stage] + (r.stage===3 ? " · round "+r.round+" / "+r.mainRounds : "");
}
export function beginEngagement(s,c,order) {
  const {a,b,kind,fleetA,fleetB}=order, n=s.nations[a], other=s.nations[b];
  const limited=opposingProvocations(s,a,fleetA,b,fleetB);
  if(limited && s.provocations.some(p=>p.battleId && (p.fleetId===fleetA || p.fleetId===fleetB))) return null;
  const fa=n.fleets.find(f=>f.id===fleetA), fb=other.fleets.find(f=>f.id===fleetB);
  if(kind!=="air" && (fa?.battleId || fb?.battleId)) return null;
  const pos=order.position || (fa ? fleetPosition(s,fa) : [0,0]);
  const region=order.region || Object.values(AREAS).sort((x,y)=>distanceNm(x.point,pos)-distanceNm(y.point,pos))[0].region;
  const participating=(id,f)=> (f?fleetGroups(s,id,f.id):s.nations[id].groups.filter(g=>g.region===region))
    .filter(g=>availableGroup(s,g) && (fleetService(c.classes[g.classId])==="warship" || (f && g.service==="support")));
  const pa=(fa && kind!=="air") || kind==="surface" ? fleetPower(s,c,a,region,fleetA) : zeroPower();
  const pb=fb || kind==="surface" ? fleetPower(s,c,b,region,fleetB) : zeroPower();
  const ga=kind!=="air" && (fa || kind==="surface") ? participating(a,fa) : [];
  let gb=fb || kind==="surface" ? participating(b,fb)
    : order.port && order.operation!=="strategic" ? anchoredShips(s,c,b,order.port) : [];
  const convoy = (kind === 'convoy' || (kind === 'air' && order.convoyId)) ? other.convoys.find(v => v.id === order.convoyId && v.count > 0) : null;
  const escortFleets = kind === 'convoy' ? other.fleets.filter(f => f.role === 'escort' && !f.battleId && distanceNm(fleetPosition(s,f),pos)<120) : [];
  if (escortFleets.length) gb = escortFleets.flatMap(f => participating(b,f));
  const prep=(id,p)=>({training:s.nations[id].training,morale:s.nations[id].morale,supply:p.supply,crew:1});
  let mainRounds=1;
  if(kind==="surface") {
    let pick=operationRandom(s)*rules.SURFACE_ROUND_WEIGHTS.reduce((a,b)=>a+b,0);
    mainRounds=rules.SURFACE_ROUND_WEIGHTS.findIndex(w=>(pick-=w)<0)+1;
  }
  const durations=rules.DURATIONS_MINUTES[kind].map(([lo,hi])=>
    Math.max(TICK_MINUTES,Math.round((lo+operationRandom(s)*(hi-lo))/TICK_MINUTES)*TICK_MINUTES));
  const now=campaignMinutes(s), r={id:s.nextId++,day:s.day,minute:now,startedAt:now,status:"ongoing",stage:0,round:1,mainRounds,
    nextStageAt:now+durations[0],durations,order:{...order,region,position:pos},a,b,region,position:pos,
    fleetA:fleetA||null,fleetB:fleetB||null,kind:order.port?"port":kind==="surface"?"fleet":kind,
    aggressiveA:!!fa?.aggressiveBattle,aggressiveB:!!fb?.aggressiveBattle,
    operation:order.operation||kind,portId:order.port||null,portDamage:0,portEquivalent:0,
    portHealth:order.port?s.ports[order.port].health:1,winner:null,magnitude:null,upset:false,
    powerA:pa,powerB:pb,effectiveA:pa.total,effectiveB:pb.total,variationA:1,variationB:1,
    preparationA:prep(a,pa),preparationB:prep(b,pb),resultA:emptyResult(c,ga),resultB:emptyResult(c,gb),
    timeline:[{at:now,stage:0,round:1,label:BATTLE_STAGES[0]}]};
  const sortie=kind==="air"?n.airSorties.find(op=>op.id===order.opId):null;
  if (kind === 'surface') {
    r.tactical = createCampaignCombat({ seed: Math.floor(operationRandom(s) * 4294967295) || 1,
      classes: c.classes, groupsA: ga, groupsB: gb, nationA: n, nationB: other,
      nameA: PROFILES[a].name, nameB: PROFILES[b].name, aggressiveA: r.aggressiveA, aggressiveB: r.aggressiveB,supplyA:pa.supply,supplyB:pb.supply });
    if (r.tactical) { r.nextStageAt = now + TICK_MINUTES; r.tacticalAt = now; }
  }
  if (kind === 'convoy' && convoy && ga.length) {
    const merchant = merchantCombatGroup(convoy, b);
    r.tactical = createCampaignCombat({ seed: Math.floor(operationRandom(s) * 4294967295) || 1,
      classes: { ...c.classes, [merchant.shipClass.id]: merchant.shipClass }, groupsA: ga, groupsB: [...gb, merchant.group],
      nationA: n, nationB: other, nameA: PROFILES[a].name, nameB: PROFILES[b].name,
      aggressiveA: r.aggressiveA, aggressiveB: false });
    r.tacticalAt = now; r.nextStageAt = now + TICK_MINUTES; r.escortFleetIds = escortFleets.map(f => f.id);
  }
  if (kind === 'port' && order.port && ga.length) {
    const shore = coastalBatteryGroup(order.port,b,portSummary(s,c,order.port));
    r.tactical = createCampaignCombat({seed:Math.floor(operationRandom(s)*4294967295)||1,
      classes:{...c.classes,[shore.shipClass.id]:shore.shipClass},groupsA:ga,groupsB:[...gb,shore.group],
      nationA:n,nationB:other,nameA:PROFILES[a].name,nameB:PROFILES[b].name,aggressiveA:r.aggressiveA,aggressiveB:false});
    if(r.tactical) {
      for(const ship of r.tactical.ships) {
        ship.x=ship.side==='A'?-Math.max(2,(order.distance||10)*1.852):0;
        if(ship.side==='B')ship.stats.speed=0;
      }
      r.tactical.maxDurationSeconds=3600;r.tacticalAt=now;r.nextStageAt=now+TICK_MINUTES;
      r.tactical.history.frames=[combatSnapshot(r.tactical)];
    }
  }
  if(kind==="air") {
    const op=sortie;
    if(!op) return null;
    r.airOperation={source:op.sourcePort?PORTS[op.sourcePort].name:fa?.name||"Air strike",
      light:op.conditions?.light||"",weather:op.conditions?.weather||"",strikes:op.strikes,
      escorts:op.escorts,cap:0,assembly:op.assembly,distanceKm:Math.round(op.outboundKm),merchantHulls:0,merchantGRT:0};
    let targets = gb, classes = c.classes;
    if (op.targetKind === 'convoy') {
      const targetConvoy = other.convoys.find(v => v.id === op.targetId && v.count);
      if (targetConvoy) { const merchant = merchantCombatGroup(targetConvoy,b); targets=[merchant.group]; classes={...classes,[merchant.shipClass.id]:merchant.shipClass}; }
    }
    if (targets.length && op.operation !== 'strategic') {
      const cap = combatAirPatrol(s,c,b,{fleetId:fb?.id,port:order.port}), count = role => (op.airWing||[]).filter(w=>role==='strike'?['strike','bomber'].includes(w.role):w.role===role).reduce((n,w)=>n+Math.min(w.count,w.crewed||0),0);
      r.tactical = createCampaignAirCombat({ seed:Math.floor(operationRandom(s)*4294967295)||1, classes, groupsB:targets,
        nationA:n,nationB:other,nameA:PROFILES[a].name,nameB:PROFILES[b].name,
        cap:cap.count,flak:order.port?20:0,strikes:count('strike'),fighters:count('fighter'),operationId:op.id,
        proficiency:(.5+n.training/100*.5)*Math.max(.25,pa.supply||1),anchored:!!order.port });
      r.tacticalAt=now;r.nextStageAt=now+TICK_MINUTES;
    }
  }
  if(kind!=="air") {
    reserveTacticalAirWings(s,r);
    for(const f of [fa,fb,...escortFleets].filter(Boolean)) {
      const position=fleetPosition(s,f); f.battleId=r.id;
      f.route=[position]; f.departAt=now; f.arriveAt=now; f.nextPlanAt=now+1440;
    }
    for(const g of [...ga,...gb]) g.battleId=r.id;
    if(order.convoyId) { const v=other.convoys.find(v=>v.id===order.convoyId); if(v) {
      v.battleId=r.id; v.battleStarted=now;
      // Convoys continue their route, but cannot dock or be reassigned during interception.
    } }
  }
  if(r.tactical)r.tactical.metadata.campaign=s.campaignId;
  r.limitedIncident=limited;
  if(limited) for(const p of s.provocations) if(p.fleetId===fleetA || p.fleetId===fleetB) p.battleId=r.id;
  r.decisive=decisiveAssessment(c,order,ga,gb,sortie,rules.DECISIVE);
  if(r.decisive.qualifies) {
    r.replay={version:1,frames:[],truncated:false};
    recordBattleFrame(s,r,battleStageLabel(r));
    s.reports.unshift(r);
    s.reports=s.reports.filter((x,i)=>x.status==="ongoing"||i<80);
    pauseForNewBattle(s,r);
    if([a,b].includes(s.player)) addAlert(s,"Decisive battle underway · "+REGIONS[region].name,
      PROFILES[a].name+" and "+PROFILES[b].name+" have made contact. "+r.decisive.reason,"battle",{reportId:r.id,a,b,ongoing:true});
  } else {
    r.background=true;
    (s.backgroundEngagements??=[]).push(r);
  }
  invalidateOperations(s);
  return r;
}
function mergeResult(total,part) {
  if(!total.engaged && part.engaged) {
    total.engaged=part.engaged; total.engagedTons=part.engagedTons;
    total.engagedComposition={...part.engagedComposition};
  }
  for(const k of ["tons","planesLost","planesRescued","aviatorsLost","aviatorsRescued","sailorsLost","sailorsRescued","governmentPlanesLost","governmentCrewsLost"])
    total[k]=(total[k]||0)+(part[k]||0);
  for(const row of part.conditions) {
    let prior=total.conditions.find(x=>x.id===row.id);
    if(!prior) { prior={...row,initialHealth:Math.min(1,row.health+row.newDamage/100),sunk:0}; total.conditions.push(prior); }
    const sunk=prior.sunk+row.sunk, count=prior.count, initialHealth=prior.initialHealth;
    Object.assign(prior,row,{sunk,count,initialHealth,newDamage:Math.round((initialHealth-row.health)*100)});
  }
  total.losses.push(...part.losses);
  total.sunk=0; total.damaged=0; total.damagedTons=0; total.sunkComposition={}; total.damagedComposition={};
  for(const row of total.conditions) {
    total.sunk+=row.sunk; total.sunkComposition[row.type]=(total.sunkComposition[row.type]||0)+row.sunk;
    const survivors=row.count-row.sunk;
    if(row.health<row.initialHealth && survivors>0) {
      total.damaged+=survivors; total.damagedComposition[row.type]=(total.damagedComposition[row.type]||0)+survivors;
      total.damagedTons+=row.tons*survivors*(row.initialHealth-row.health);
    }
  }
  total.damagePercent=100*total.damagedTons/Math.max(1,total.engagedTons);
}
function applyExchange(s,c,r,weight) {
  const o=r.order, f=s.nations[r.a].fleets.find(f=>f.id===r.fleetA);
  const context={weight,reportId:r.id,combat:r.tactical,seconds:r.tactical?Math.min(21600,Math.max(TICK_MINUTES,campaignMinutes(s)-(r.tacticalAt??campaignMinutes(s)-TICK_MINUTES))*60):TICK_MINUTES*60};
  let part;
  if(o.kind==="surface") part=resolveBattle(s,c,r.a,r.b,r.region,r.fleetA,r.fleetB,r.position,context);
  else if(o.kind==="port" && f && portOwner(s,o.port)===r.b) part=resolvePortAction(s,c,r.a,f,o.port,o.operation,o.distance,context);
  else if(o.kind==="air") {
    const op=s.nations[r.a].airSorties.find(x=>x.id===o.opId);
    if(op) part=resolveAirAttack(s,c,r.a,op,r.position,context);
  } else if(o.kind==="convoy" && f) part=resolveConvoyAttack(s,c,r.a,r.b,r.fleetA,o.convoyId,r.position,context);
  if(!part) return false;
  mergeResult(r.resultA,part.resultA); mergeResult(r.resultB,part.resultB);
  s.nations[r.a].sunkTons+=part.resultB.tons; s.nations[r.b].sunkTons+=part.resultA.tons;
  // Each exchange already reports newly inflicted damage. The report's total
  // damaged tonnage describes surviving hulls and can decrease when one sinks;
  // subtracting that total would create a negative war ledger and invalid save.
  recordWarBattle(s,{...part,resultA:{tons:part.resultA.tons,damagedTons:part.resultA.damagedTons},
    resultB:{tons:part.resultB.tons,damagedTons:part.resultB.damagedTons}});
  for(const k of ["powerA","powerB","effectiveA","effectiveB","variationA","variationB"]) r[k]=part[k];
  r.portDamage+=(part.portDamage||0); r.portEquivalent+=(part.portEquivalent||0);
  if(part.portHealth!==undefined) r.portHealth=part.portHealth;
  if(part.airOperation) {
    const hulls=r.airOperation?.merchantHulls||0, grt=r.airOperation?.merchantGRT||0;
    r.airOperation={...part.airOperation,merchantHulls:hulls+(part.airOperation.merchantHulls||0),merchantGRT:grt+(part.airOperation.merchantGRT||0)};
  }
  if(part.merchantGRT) { r.merchantGRT=(r.merchantGRT||0)+part.merchantGRT; r.merchantHulls=(r.merchantHulls||0)+part.merchantHulls; }
  if(part.industryRaid) r.industryRaid={...part.industryRaid,damage:(r.industryRaid?.damage||0)+part.industryRaid.damage};
  if(part.upset) { r.upset=true; r.upsetSide=part.upsetSide; }
  return {kind:o.kind,sides:o.kind==='air' ? ['A'] : ['A','B'].filter(side => part['power'+side]?.total > 0)};
}
function finish(s,c,r) {
  if(r.status!=="ongoing") return;
  const now=campaignMinutes(s), a=r.resultA, b=r.resultB;
  const costA=a.tons+a.damagedTons*.65+a.planesLost*40,
    costB=b.tons+b.damagedTons*.65+b.planesLost*40+r.portEquivalent+(r.merchantGRT||r.airOperation?.merchantGRT||0)*.2;
  r.winner=r.tactical?(r.tactical.winner==='A'?r.a:r.tactical.winner==='B'?r.b:null):costA===costB?null:costA<costB?r.a:r.b;
  applyBattleMorale(s,r);
  r.magnitude=!r.winner?"inconclusive":r.significantAction && Math.max(costA,costB)>=Math.min(costA,costB)*2?"major":"minor";
  r.status="completed"; r.completedAt=now;
  finishTacticalAirWings(s,c,r);
  for(const [id,fid] of [[r.a,r.fleetA],[r.b,r.fleetB],...(r.escortFleetIds||[]).map(id=>[r.b,id])]) {
    const n=s.nations[id], f=n.fleets.find(f=>f.id===fid);
    for(const g of n.groups) if(g.battleId===r.id) delete g.battleId;
    if(f?.battleId===r.id) { delete f.battleId; f.lastBattle=now; f.nextPlanAt=now;
      if(f.role!=="repair") detachRepairs(s,c,id,f.id,fleetPosition(s,f));
      else setRoute(s,c,id,f,f.port,{phase:"returning",position:fleetPosition(s,f)});
    }
    if(r.order.kind==="air" && id===r.b && f && !f.battleId && f.role!=="repair")
      detachRepairs(s,c,id,f.id,fleetPosition(s,f));
    if(r.winner && (fid===r.fleetA || fid===r.fleetB)) n[id===r.winner?"battlesWon":"battlesLost"]++;
    for(const v of n.convoys) if(v.battleId===r.id) {delete v.battleId; delete v.battleStarted;}
  }
  if(r.limitedIncident) finishIncident(s,r.a,r.fleetA,r.b,r.fleetB,r);
  const text=id=>{const x=id===r.a?a:b;return PROFILES[id].name+": "+resultComposition(x,"sunk")+" sunk, "+resultComposition(x,"damaged")+" damaged; "+x.sailorsLost+" sailors lost / "+x.sailorsRescued+" rescued; "+x.planesLost+" aircraft lost / "+x.aviatorsLost+" aviators lost.";};
  const body=text(r.a)+" "+text(r.b)+(r.merchantHulls?" "+r.merchantHulls+" merchant hulls / "+Math.round(r.merchantGRT)+" GRT sunk.":"");
  const alert=s.alerts.find(a=>a.reportId===r.id);
  const title=(r.limitedIncident?"Limited naval incident · ":"")+(r.winner?r.magnitude+" "+(r.winner===s.player?"victory":"defeat"):"Inconclusive action")+" · "+REGIONS[r.region].name;
  if(alert) Object.assign(alert,{title,body,minute:now,winner:r.winner,ongoing:false,dismissed:false});
  if(r.background) recordBackgroundAttrition(s,r);
  else if([r.a,r.b].includes(s.player)) addLog(s,title+". "+body,"battle",{reportId:r.id});
  invalidateOperations(s);
}
export function progressEngagements(s,c) {
  const now=campaignMinutes(s);
  pruneAttritionLedger(s);
  for(const r of [...s.reports,...(s.backgroundEngagements||[])].filter(r=>r.status==="ongoing")) {
    if (r.tactical) {
      if (now <= r.tacticalAt) continue;
      const exchange = applyExchange(s, c, r, 1);
      r.tacticalAt = now; r.stage = r.tactical.status === 'completed' ? 5 : 3; r.round = 1;
      r.nextStageAt = now + TICK_MINUTES; r.significantAction = true;
      if (r.tactical.status === 'completed' || !exchange) finish(s, c, r);
      recordBattleFrame(s, r, r.status === 'completed' ? 'Completed' : 'Tactical engagement', exchange);
      continue;
    }
    if(now<r.nextStageAt) {recordBattleFrame(s,r,battleStageLabel(r));continue;}
    const fighting=r.stage===2 || r.stage===3;
    let exchange;
    if(fighting) {
      const weight=r.stage===2?rules.OPENING_WEIGHT:r.round===1?rules.MAIN_WEIGHT:rules.EXTRA_ROUND_WEIGHT;
      exchange=applyExchange(s,c,r,weight);
      if(!exchange) r.round=r.mainRounds;
    }
    if(r.stage===3 && r.round<r.mainRounds) r.round++;
    else r.stage++;
    if(r.stage===5) {finish(s,c,r);recordBattleFrame(s,r,battleStageLabel(r),exchange);continue;}
    r.nextStageAt=now+r.durations[r.stage];
    r.timeline.push({at:now,stage:r.stage,round:r.round,label:battleStageLabel(r)});
    const alert=s.alerts.find(a=>a.reportId===r.id);
    if(alert) {alert.title="Battle underway · "+battleStageLabel(r);alert.body="Fighting in the "+REGIONS[r.region].name+". Open the report for current losses.";}
    recordBattleFrame(s,r,battleStageLabel(r),exchange);
  }
  s.backgroundEngagements=(s.backgroundEngagements||[]).filter(r=>r.status==="ongoing");
}
