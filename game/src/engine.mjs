import { initializeDiplomacy, beginWarWarning, commenceWar, monthlyRelations, politicsTick, historicalWarnings, formAlliance, diplomaticPressure, validPoliticalDecision, applyPoliticalDecision, dispatchPopup } from './war-politics.mjs';
import { coastalRecon } from './shore-recon.mjs';
import { initializeBaseAviation, baseAirPower, flyBaseSorties, releaseShipAircraft } from './base-aviation.mjs';
import { dailyAviation, minuteAviation } from './aviation-transfer.mjs';
import { aiNeeds, aiFunding, aiCanSpend, aiHullScore, aiResearchScores, aiDoctrine } from './ai-planning.mjs';
import { recordFrontAlert, trimAlerts } from './alert-lifecycle.mjs';
import { updatePortBlockades, yardAvailability } from './port-trade.mjs';
import { completeScrapping } from './ship-retirement.mjs';
import { resultComposition } from './composition.mjs';
import { initializePorts, repairPorts, portSummary, damagePort, portOwner } from './ports.mjs';
import { minutePortOperations, anchoredShips } from './port-operations.mjs';
import { NODES, PORTS, AREAS } from './world.mjs';
import { staffSailors, sailorSummary, crewEffectiveness } from './ship-staffing.mjs';
import { upgradeLevel, openingLevels } from './levels.mjs';
import { PROFILES, PRIORITIES, REGIONS, fleetService, submarineAttack } from './catalog.mjs';
import { economyFor, PROGRAMS, RULES } from './balance.mjs';
import { campaignMinutes, canonicalMinute, setCampaignMinutes, openingTimeline, adjustEuropeanTimeline } from './campaign-clock.mjs';
import { initializeOperations, applyStandingOrders, commissionToFleet, dailyOperations, minuteOperations, availableGroup, invalidateOperations, orderFleet, detachRepairs, setRoute, usablePorts, fleetStats, fleetPosition, MISSIONS } from './task-forces.mjs';
import { initializeResources, dailyResources, facilityBudget, productionBlock, airPower, loseAircraft, allocateAircraft, staffAircraft, aircraftModels, aircraftPrice, orderAircraft, planeRole } from './naval-resources.mjs';
import { supplyDetails } from './logistics.mjs';
import { contentFor, DEFAULT_CAMPAIGN } from './campaign-content.mjs';
import { recordCasualties } from './recovery.mjs';
import { automaticDraft, commissionDraft, evaluateDesign } from './designer.mjs';
import { historical1922Decisions, apply1922Decision, retireReplacedTreatyHulls } from './vanilla.mjs';
import { HOME_PORT, distanceNm } from './world.mjs';
import { initializeWorld, dailyWorld } from './land-war.mjs';
import { SAVE_VERSION } from './version.mjs';
import { merchantEconomy } from './merchant-economy.mjs';
import { recordWarBattle, recordWarRaid } from './war-balance.mjs';
import { DIPLOMACY, PROVOCATION, diplomaticBlock, ceasefireOffer, readyProvocationFleet } from './diplomacy-rules.mjs';
import { organizeSupport } from './support-operations.mjs';
export const VERSION = SAVE_VERSION;
export const DAY = 86400000;
export const BASE_SPEED = 10000;
export const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
export const dateText = day => new Date(day*DAY).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
export function openingGroups(content,id){
  const data=content.nations[id];
  const rows=[...data.hulls.map(h=>({...h,id:`h-${h.id}`,count:1,progress:(h.pct_complete||0)/100})),...data.aggregates,...(data.support||[]),...(data.merchants?.groups||[])];
  return rows.map(row=>{
    const c=content.classes[row.class_id];let progress=row.progress??0.35;
    if(content.scenario.id!== 'campaign_1922'&&row.status==='building'&&progress===0)progress=0.35;
    return {id:row.id,name:row.name||c.name,classId:c.id,count:row.count,status:row.status||'active',health:row.health??1,progress,region:['vladivostok','yokosuka','san_diego','hawaii'].includes(row.port)?'pacific':['sevastopol','toulon','taranto','la_spezia'].includes(row.port)?'mediterranean':row.port==='brest'?'atlantic':PROFILES[id].home,days:buildDays(c),paid:{gold:0,influence:0,industry:0},service:fleetService(c),...(fleetService(c)==='merchant'?{merchantGRT:(data.merchants.grossRegisterTons||data.merchants.hulls*1000)/data.merchants.hulls}:{}),legacy:!!row.legacy,representative:!!row.representative,notes:row.notes||'',rosterAdded:row.rosterAdded||1,treatyFate:row.treaty_fate||null,...(row.port?{dockPort:row.port}:{})};
  });
}
export function newGame(content, player='JPN', seed=19360101,campaignId=content.scenario.id||DEFAULT_CAMPAIGN) {
  content=contentFor(content,campaignId);
  if (!content.nations[player]) throw new Error('Choose an available navy.');
  const state = { version:VERSION, player, campaignId,day:Date.parse(content.scenario.start+'T00:00:00Z')/DAY, fraction:0, seed:seed>>>0, speed:1, paused:true, nations:{}, log:[], reports:[], decisions:[], completedEvents:[], nextId:1, view:'command', savedAt:null, relations:{}, history:[], reviews:[], treatyUntil:Date.parse('1936-12-31T00:00:00Z')/DAY, autoPause:true,musicEnabled:true,musicVolume:.28 };
  state.rosterRevision=content.rosterRevision;
  state.specificationRevision=content.specificationRevision||1;
  for (const [id,data] of Object.entries(content.nations)) {
    const groups=openingGroups(content,id);
    const e=economyFor(state,id);
    state.nations[id]={id,groups,priority:'guard',focus:PROFILES[id].home,rival:PROFILES[id].rival,
      gold:e.goldYear/2,influence:70,industry:e.industryYear/2,training:65,morale:75,logistics:70,commerce:100,
      crew:e.crew,crewYear:e.crewYear,projects:[],tech:openingLevels(PROGRAMS),
      customDesigns:[],unlocked:data.designs.filter(cid=>content.classes[cid].year<=yearOf(state)),bases:id==='GBR'?['atlantic','mediterranean','indian']:id==='USA'?['atlantic','pacific']:[PROFILES[id].home],
      treatyPolicy:'disclose',exposure:0,cooldowns:{},sunkTons:0,lostTons:0,battlesWon:0,battlesLost:0,delivered:0,merchantDelivered:0,supportDelivered:0,
      merchant:{otherHulls:data.merchants.hulls-data.merchants.managedHulls,otherGRT:(data.merchants.hulls-data.merchants.managedHulls)*(data.merchants.grossRegisterTons||data.merchants.hulls*1000)/data.merchants.hulls},
    };
  }
  const ids=Object.keys(state.nations);
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
    const a=ids[i],b=ids[j],rival=PROFILES[a].rival===b||PROFILES[b].rival===a;
    state.relations[pairKey(a,b)]={a,b,score:rival?RULES.relationshipRival:RULES.relationshipOther,war:false,allied:false,warSince:null,truceUntil:state.day-1,lastBattle:-99999};
  }
  if(campaignId==='campaign_1922')for(const id of ids)if(id!==player&&!['DEU','SOV'].includes(id))apply1922Decision(state,content,'comply',id);
  initializeDiplomacy(state);
  initializeCampaign(state,content);
  state.initial=Object.fromEntries(ids.map(id=>[id,{power:fleetPower(state,content,id).total,tons:fleetSummary(state,content,id).tons}]));
  addLog(state,'The '+yearOf(state)+' naval estimates are open. Orders take time; prepare before relations deteriorate.','cabinet');
  queueDecision(state,'opening','The first naval estimate','Your ministry needs a direction for the new estimates. These commitments use the same resources and construction system as later orders.',[
    {id:'school',label:'Build the schools',detail:'Commission a naval-school expansion: 5,000 gold · 16 influence · 900 industry · 2 years.',program:'school'},
    {id:'standardization',label:'Invest in standardization',detail:'Commission a production program: 5,200 gold · 20 influence · 1,900 industry · 18 months.',program:'standardization'},
    {id:'defer',label:'Keep the funds available',detail:'Make individual ship and project decisions from the ministry.'},
  ]);
  return state;
}
export function initializeCampaign(s,content){
  s.campaignId??=DEFAULT_CAMPAIGN;
  initializeResources(s,content);
  for(const n of Object.values(s.nations)){
    n.customDesigns??=[];
    for(const p of [...n.projects])if(p.key==='base'){const unspent=p.remaining/p.days;for(const k of ['gold','influence','industry'])n[k]+=(p.paid[k]||0)*unspent;n.projects.splice(n.projects.indexOf(p),1);}
  }
  initializeWorld(s);initializePorts(s);
  initializeOperations(s,content);initializeBaseAviation(s,content);
  for(const id of Object.keys(s.nations)){staffSailors(s,content,id);allocateAircraft(s,content,id);}
  organizeSupport(s,content);
  if(!s.timeline){s.timeline=openingTimeline(s.seed,s.campaignId);if(s.relations[pairKey('GBR','DEU')].war){s.timeline.polandOccurred=true;s.timeline.europeOccurred=true;}}
  normalizeDecisions(s);
  if((s.specificationRevision||1)<(content.specificationRevision||1)){
    const opening=newGame(content,s.player,19360101);for(const id of Object.keys(s.nations))s.initial[id].power=opening.initial[id].power;s.specificationRevision=content.specificationRevision;
    addLog(s,'The equipment register now reads gun bore fields correctly. Current combat strength and opening score baselines have been corrected; previous battle reports are retained.','navy');
  }
  return s;
}
export function upgradeNations(s,content){
  s.campaignId??=DEFAULT_CAMPAIGN;
  const missing=Object.keys(content.nations).filter(id=>!s.nations[id]);if(!missing.length)return s;
  const opening=newGame(content,s.player,s.seed,s.campaignId);
  for(const id of missing){s.nations[id]=opening.nations[id];s.initial[id]=opening.initial[id];
    for(const f of s.nations[id].fleets){const delta=(s.day-opening.day)*1440;f.departAt+=delta;f.arriveAt+=delta;f.nextPlanAt+=delta;}
    for(const v of s.nations[id].convoys){const delta=(s.day-opening.day)*1440;v.departAt+=delta;v.arriveAt+=delta;}
  }
  s.nextId=Math.max(s.nextId,opening.nextId);
  for(const [key,r]of Object.entries(opening.relations))if(!s.relations[key])s.relations[key]={...r,truceUntil:s.day-1};
  if(s.timeline?.europeOccurred&&s.nations.FRA){const r=s.relations[pairKey('FRA','DEU')];r.war=true;r.warSince=s.relations[pairKey('GBR','DEU')].warSince||s.day;r.score=-30;}
  addLog(s,'France, Italy and the Soviet Union have joined the campaign with their opening naval programs. Existing fleet orders and resources have been preserved.','cabinet');return s;
}
export function issueFleetOrder(s,content,fleetId,mission,aggressiveBattle=false){
  const f=orderFleet(s,content,fleetId,mission,null,s.player,{aggressiveBattle:aggressiveBattle===true});invalidateOperations(s);
  addLog(s,`${f.name}: ${MISSIONS[mission].name}. Orders transmitted; the admiral is selecting a route within the force's endurance. Aggressive battle ${f.aggressiveBattle?'authorized: accept greater risk and press attacks longer':'off: preserve the force when outmatched'}.`);
}
export function upgradeRoster(s,content){
  if((s.rosterRevision||1)>=content.rosterRevision)return s;
  const opening=newGame(content,s.player,s.seed);
  for(const [id,n] of Object.entries(s.nations)){
    const template=opening.nations[id],byId=new Map(template.groups.map(g=>[g.id,g]));
    for(const g of n.groups){
      const row=byId.get(g.id);
      if(id==='JPN'&&g.id==='a-JPN-11'&&g.classId==='standard_maru_t23')g.classId='maru_depot_t23';
      g.service=fleetService(content.classes[g.classId]);
      g.legacy=row?.legacy||false;g.representative=row?.representative||false;g.rosterAdded=row?.rosterAdded||1;
      g.notes=row?.notes||'';
      if(row&&['h-hms_barham','h-hms_malaya','a-JPN-11'].includes(g.id))g.name=row.name;
      // Only correct untouched opening readiness. Later player choices are kept.
      const changedByPlayer=s.log.some(l=>l.text.includes(g.name)&&/placed in reserve|recommissioning/.test(l.text));
      if(s.day===opening.day&&row?.status==='active'&&g.status==='reserve'&&g.health===1&&!changedByPlayer)g.status='active';
      // The old loader accidentally used eight old cruisers, versus six in the pack.
      if(id==='DEU'&&g.id==='a-DEU-4'&&g.classId==='gazelle_cl')g.count=Math.max(0,g.count-2);
      if(g.service!=='warship'){delete g.destination;delete g.transitUntil;}
    }
    const present=new Set(n.groups.map(g=>g.id));
    for(const g of template.groups)if(g.rosterAdded===content.rosterRevision&&!present.has(g.id))n.groups.push(structuredClone(g));
    n.merchant=structuredClone(template.merchant);
    n.merchantDelivered=n.groups.filter(g=>g.id.startsWith('order-')&&g.service==='merchant'&&g.progress>=1).reduce((v,g)=>v+g.count,0);
    n.supportDelivered=0;n.delivered=Math.max(0,n.delivered-n.merchantDelivered);
    s.initial[id]=structuredClone(opening.initial[id]);
  }
  s.rosterRevision=content.rosterRevision;
  addLog(s,'The naval register has been updated: warships, naval support and merchants are counted separately; missing inherited formations have been added. Existing orders and campaign progress are retained.','navy');
  return s;
}
export function inventorySummary(state,content,id,service){
  const result={active:0,reserve:0,building:0,tons:0,crew:0,repair:0,total:0,legacy:0,unknownTonnage:0};
  for(const g of state.nations[id].groups){
    const c=content.classes[g.classId];if(fleetService(c)!==service||['sunk','scrapped'].includes(g.status))continue;
    if(['building','trials','converting'].includes(g.status)){result.building+=g.count;continue;}
    result.total+=g.count;result[g.status==='reserve'?'reserve':['repair','returning'].includes(g.status)?'repair':'active']+=g.count;
    result.tons+=c.tons*g.count;result.crew+=c.crew*g.count*(g.status==='reserve'?0.15:1);
    if(g.legacy)result.legacy+=g.count;if(c.unknownSpecs)result.unknownTonnage+=g.count;
  }
  return result;
}
export const fleetSummary=(s,c,id=s.player)=>inventorySummary(s,c,id,'warship');
export const supportSummary=(s,c,id=s.player)=>inventorySummary(s,c,id,'support');
export function merchantSummary(s,c,id=s.player){const result=inventorySummary(s,c,id,'merchant');const other=s.nations[id].merchant.otherHulls;return {...result,managed:result.total,other,total:result.total+other,reference:c.nations[id].merchants};}

export const pairKey=(a,b)=>[a,b].sort().join('-');
export const yearOf=s=>new Date(s.day*DAY).getUTCFullYear();
export const isAuxiliary=c=>fleetService(c)!=='warship';
export function rng(s){s.seed=(s.seed+0x6D2B79F5)>>>0;let t=s.seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}
export function warChance(score){return clamp(-score/100,0,1);}
export function buildDays(c){if(c.id==='hecht_typ2')return 365;if(c.id==='wolf_typ7')return 730;return RULES.buildDays[c.type]||600;}
export function addLog(s,text,kind='navy'){s.log.unshift({id:s.nextId++,day:s.day,minute:campaignMinutes(s),text,kind});s.log=s.log.slice(0,140);}
export function addAlert(s,title,body,kind='info',extra={}){s.alerts??=[];s.alerts.unshift({id:s.nextId++,minute:campaignMinutes(s),title,body,kind,...extra});trimAlerts(s);}
export function queueDecision(s,key,title,body,options,meta={}){
  if(s.completedEvents.includes(key)||s.decisions.some(d=>d.key===key))return;
  const d={key,title,body,options,day:s.day,critical:false,...meta};
  if(d.critical){d.deadline??=campaignMinutes(s)+14*1440;d.defaultOption??=options.at(-1).id;d.defaultText??=options.find(o=>o.id===d.defaultOption).detail;}
  s.decisions.push(d);if(d.critical&&(s.autoPause||d.forcePause)){if(!s.paused)s.resumeAfterDecision=true;s.paused=true;s.pauseReason??=d.key;}
}
function validDecision(s,d){if(!validPoliticalDecision(s,d))return false;if(d.kind!=='inspection')return true;return !(s.campaignId==='campaign_1922'&&[s.player,d.target].includes('SOV'))&&s.day<=s.treatyUntil&&s.nations[s.player].treatyPolicy!=='withdraw'&&d.target&&s.nations[d.target].treatyPolicy!=='withdraw'&&!s.relations[pairKey(s.player,d.target)].war;}
function normalizeDecisions(s){
  s.alerts??=[];
  for(const d of [...s.decisions]){
    if(d.key.startsWith('war-')&&d.options.some(o=>o.priority)){addAlert(s,d.title,'Your fleets continue their individual missions. Select a force on the command chart to change its orders.','war');s.decisions=s.decisions.filter(x=>x!==d);s.completedEvents.push(d.key);continue;}
    if(d.critical===undefined){d.critical=false;if(d.title==='Disputed naval intelligence'){d.kind='inspection';d.target??=s.nations[s.player].rival;d.critical=true;d.deadline=campaignMinutes(s)+14*1440;d.defaultOption='deny';d.defaultText='Access denied; relations fall by 5.';}}
    if(!validDecision(s,d)){s.decisions=s.decisions.filter(x=>x!==d);s.completedEvents.push(d.key);}
  }
  if(s.pauseReason&&!s.decisions.some(d=>d.key===s.pauseReason)){
    const pending=s.decisions.find(d=>d.critical);
    if(pending)s.pauseReason=pending.key;
    else{if(s.resumeAfterDecision)s.paused=false;delete s.pauseReason;delete s.resumeAfterDecision;}
  }
}
function decisionDeadlines(s,c){
  normalizeDecisions(s);
  for(const d of [...s.decisions])if(d.deadline!==undefined&&campaignMinutes(s)>=d.deadline){chooseDecision(s,c,d.key,d.defaultOption,{automatic:true});}
}
export function readiness(s,c,id){const people=sailorSummary(s,c,id);return Math.min(1,people.total/Math.max(1,people.required));}
export function supply(s,c,id,region){const fleets=s.nations[id].fleets.filter(f=>!region||s.nations[id].groups.some(g=>g.fleetId===f.id&&g.region===region&&availableGroup(s,g)));if(!fleets.length)return supplyDetails(s,c,id).factor;return fleets.reduce((v,f)=>v+supplyDetails(s,c,id,f).factor,0)/fleets.length;}

export function classPower(c,tech={},includeSupport=false){
  if(isAuxiliary(c)&&!(includeSupport&&fleetService(c)==='support'))return {surface:0,air:0,sub:0,asw:0,aa:0,scout:0,total:0};
  const underwater=['SS','SM'].includes(c.type);
  const armor=1+(c.belt/800)+(c.deck/1000);
  const mobility=0.7+c.speed/70;
  const surface=underwater?0:((c.barrels*Math.pow(c.caliber/100,1.75)*4)+(c.tubes*3))*armor*mobility*(1+(upgradeLevel(tech,'gunnery')||0)*0.12);
  const air=c.air*9*(1+(upgradeLevel(tech,'aviation')||0)*0.18);
  const sub=submarineAttack(c);
  const asw=!underwater&&['DD','DE','DL','CL','CA','TB'].includes(c.type)?(c.sonar?32:8)*(1+(upgradeLevel(tech,'asw')||0)*0.4):0;
  const scout=(c.radar?25:5)+(c.air?Math.min(c.air,8)*3:0)+(c.scoutAircraft||0)*4+(upgradeLevel(tech,'radar')||0)*8;
  const aa=c.aa*4*(1+(upgradeLevel(tech,'radar')||0)*0.2);
  return {surface,air,sub,asw,aa,scout,total:surface+air+sub+asw+aa*0.2};
}

export function fleetPower(s,content,id=s.player,region=null,fleetId=null,airDistanceKm=0){
  const n=s.nations[id],result={surface:0,air:0,sub:0,asw:0,aa:0,scout:0,total:0,ships:0,speed:0,supply:0};
  const training=0.5+n.training/100*0.65,morale=0.65+n.morale/100*0.5;
  let sumSupply=0;const supplies=new Map(n.fleets.filter(f=>!fleetId||f.id===fleetId).map(f=>[f.id,supplyDetails(s,content,id,f).factor]));
  for(const g of n.groups){if(!availableGroup(s,g)||(fleetId?g.fleetId!==fleetId:region&&g.region!==region)||(isAuxiliary(content.classes[g.classId])&&!(fleetId&&g.service==='support')))continue;
    const c=content.classes[g.classId],p=classPower(c,n.tech,!!fleetId),a=airPower(s,content,id,g,airDistanceKm),logistics=supplies.get(g.fleetId)??supplyDetails(s,content,id).factor;
    // Air wings already contain the group's total aircraft. Convert to per-hull
    // terms before the shared count multiplier to keep grouped and split fleets equal.
    p.air=(a.strike*12+a.fighters*3)/g.count*(1+upgradeLevel(n.tech,'aviation')*.18);p.scout=(c.radar?25:5)+a.scout/g.count+(upgradeLevel(n.tech,'radar')||0)*8;p.aa+=a.fighters*2/g.count;
    const crew=crewEffectiveness(g,c);p.surface*=crew;p.sub*=crew;p.asw*=crew;p.aa*=crew;p.air*=.5+.5*crew;
    const factor=g.count*g.health*training*morale*logistics*(1+upgradeLevel(n.tech,'radar')*0.08);
    for(const key of ['surface','air','sub','asw','aa','scout'])result[key]+=p[key]*factor;
    result.ships+=g.count;result.speed+=c.speed*g.count;sumSupply+=logistics*g.count;
  }
  result.total=result.surface+result.air+result.sub+result.asw+result.aa*0.2;result.speed/=Math.max(1,result.ships);result.supply=sumSupply/Math.max(1,result.ships);
  return result;
}

export function monthlyIncome(s,content,id=s.player){
  const n=s.nations[id],e=economyFor(s,id);
  const upkeep=n.groups.reduce((sum,g)=>sum+(fleetService(content.classes[g.classId])==='merchant'||['sunk','scrapped','building','converting','trials'].includes(g.status)?0:content.classes[g.classId].cost*g.count*RULES.upkeepPerMonth*(g.status==='reserve'?0.2:1)),0);
  const covert=n.treatyPolicy==='conceal'&&s.day<=s.treatyUntil,facilities=facilityBudget(s,content,id);
  const netGold=e.goldYear/12*merchantEconomy(s,content,id).economyFactor-upkeep-(covert?RULES.concealGoldPerMonth:0)-facilities.gold/12;
  const netIndustry=e.industryYear/12*(1+upgradeLevel(n.tech,'industry')*RULES.industryBonus)*n.industryFunding*merchantEconomy(s,content,id).economyFactor*(n.industryOperating??1)-facilities.industry/12;
  return {gold:e.goldYear/12*merchantEconomy(s,content,id).economyFactor-upkeep-(covert?RULES.concealGoldPerMonth:0),influence:(RULES.influencePerMonth+upgradeLevel(n.tech,'influence'))*merchantEconomy(s,content,id).economyFactor-(covert?RULES.concealInfluencePerMonth:0),industry:e.industryYear/12*(1+upgradeLevel(n.tech,'industry')*RULES.industryBonus)*(n.industryFunding??1)*merchantEconomy(s,content,id).economyFactor*(n.industryOperating??1),netGold,netIndustry,facilities,industryOperating:e.goldYear*.12*(1+upgradeLevel(n.tech,'industry')*.15)*(n.industryFunding??1)/12,upkeep};
}
export function affordability(n,price){return ['gold','influence','industry'].filter(k=>n[k]+0.0001<price[k]).map(k=>`Need ${Math.ceil(price[k]-n[k]).toLocaleString('en-US')} more ${k}`).join('; ');}
function spend(n,p){const error=affordability(n,p);if(error)throw new Error(error);for(const k of ['gold','influence','industry'])n[k]=Math.max(0,n[k]-p[k]);}
export function shipPrice(s,content,classId,count=1,id=s.player){
  const c=content.classes[classId],n=s.nations[id];if(!c||c.nation!==id)throw new Error('This design is not in your catalog.');
  const discount=1-upgradeLevel(n.tech,'standardization')*0.05;
  const industrialFactor=s.campaignId!== 'campaign_1922'&&id==='JPN'&&!c.custom&&content.nations[id].designs.includes(classId)?0.4:1;
  return {gold:Math.ceil(c.cost*discount*count),influence:Math.ceil(Math.max(1,c.cost/5000)*count),industry:Math.ceil(c.tons*industrialFactor*discount*count),days:buildDays(c)};
}
export function treatyLedger(s,content,id=s.player){const n=s.nations[id];let actual=0,hidden=0;for(const g of n.groups){if(['sunk','scrapped'].includes(g.status))continue;const c=content.classes[g.classId];if(c.category==='capital_ship'||c.category==='aircraft_carrier'){actual+=c.tons*g.count;if(g.covert)hidden+=c.tons*g.count;}}return {actual,declared:actual-hidden,hidden,active:!(s.campaignId==='campaign_1922'&&id==='SOV')&&s.day<=s.treatyUntil&&n.treatyPolicy!=='withdraw'};}
export function shipOrderBlock(s,content,classId,id=s.player){const n=s.nations[id],c=content.classes[classId];if(!content.nations[id].designs.includes(classId))return 'Only designs in your active national catalog can be ordered.';if(productionBlock(s,content,classId,id))return productionBlock(s,content,classId,id);if(!n.unlocked.includes(classId))return 'Develop this design first.';if(s.campaignId==='campaign_1922'&&n.treatyPolicy==='disclose'&&s.day<=s.treatyUntil){if(id==='DEU'&&yearOf(s)<1935&&fleetService(c)==='warship'&&(['SS','SM','CV','CVL'].includes(c.type)||c.tons>(['BB','BC'].includes(c.type)?10000:6000)))return 'Versailles restrictions remain until 1935; withdrawal is required for this order.';if(!['DEU','SOV'].includes(id)&&yearOf(s)<1931&&['BB','BC'].includes(c.type))return 'Washington capital-ship building holiday: new capital orders open in 1931. Existing authorized construction continues.';}if(treatyLedger(s,content,id).active&&n.treatyPolicy==='disclose'&&((['BB','BC'].includes(c.type)&&c.tons>35000)||(['CV','CVL'].includes(c.type)&&c.tons>27000)||(c.type==='CA'&&c.tons>10000)))return 'Exceeds the treaty’s new-construction limit. Conceal the order, withdraw, or wait for expiry.';return '';}
export function orderShip(s,content,classId,count=1,id=s.player){
  if(!Number.isInteger(count)||count<1||count>20)throw new Error('Order between 1 and 20 hulls at a time.');
  const error=shipOrderBlock(s,content,classId,id);if(error)throw new Error(error);
  const n=s.nations[id],c=content.classes[classId],price=shipPrice(s,content,classId,count,id);spend(n,price);
  const group={id:`order-${s.nextId++}`,name:c.name,classId,count,service:fleetService(c),...(fleetService(c)==='merchant'?{merchantGRT:c.raw?.merchant_grt||c.merchantGRT||Math.round(c.tons*.7)}:{}),status:'building',airWing:[],health:1,progress:0,region:PROFILES[id].home,days:price.days,paid:price,covert:n.treatyPolicy==='conceal'&&s.day<=s.treatyUntil};
  group.sailors=0;group.atSea=false;n.groups.push(group);if(id===s.player)addLog(s,`${count} × ${c.name} ordered. Yard capacity and the build schedule now determine delivery.`,'industry');return group.id;
}
export function projectPrice(s,key,id=s.player){const p=PROGRAMS[key],n=s.nations[id];if(!p)throw new Error('Unknown program.');const level=p.level?n.tech[p.level]:1,upgrades=level-1;const targetYear=(p.year||1922)+(p.year?upgrades*3:0);const ahead=Math.max(0,targetYear-yearOf(s));const multiplier=1+upgrades*0.35;return {gold:Math.ceil(p.gold*multiplier),influence:p.influence,industry:Math.ceil(p.industry*multiplier),days:p.days,ahead,targetYear,level};}
export function projectBlock(s,key,id=s.player){const n=s.nations[id],p=PROGRAMS[key];if(!p)return 'Unknown program.';if(n.projects.some(q=>q.key===key))return 'Already in progress.';if(p.level&&n.tech[p.level]>=p.max)return 'Level 9: fully developed.';const price=projectPrice(s,key,id);if(price.targetYear>yearOf(s))return 'Development opens in '+price.targetYear+'.';if(n.projects.length>=4)return 'Four programs are already underway.';return '';}
export function startProject(s,key,id=s.player){const error=projectBlock(s,key,id);if(error)throw new Error(error);const n=s.nations[id],p=PROGRAMS[key],price=projectPrice(s,key,id);spend(n,price);n.projects.push({id:`project-${s.nextId++}`,key,name:p.name,days:price.days,remaining:price.days,paid:price});if(id===s.player)addLog(s,`${p.name} funded; completion in about ${Math.ceil(price.days/30)} months.`,'industry');}
export function designPrice(s,content,classId,id=s.player){const c=content.classes[classId];if(!c||c.nation!==id)throw new Error('Unknown design.');const ahead=Math.max(0,c.year-yearOf(s));return {gold:Math.ceil(c.cost*0.3*(1+ahead*0.3)),influence:Math.ceil(12+ahead*4),industry:Math.ceil(c.tons*0.2*(1+ahead*0.25)),days:Math.ceil(365*(1+ahead*0.2)),ahead};}
export function developDesign(s,content,classId,id=s.player){const n=s.nations[id];const blocked=productionBlock(s,content,classId,id);if(blocked)throw new Error(blocked);if(!content.nations[id].designs.includes(classId)||n.unlocked.includes(classId))throw new Error('This design is already available or outside your catalog.');if(n.projects.length>=4||n.projects.some(p=>p.classId===classId))throw new Error('A design program is already running, or all four project slots are occupied.');const price=designPrice(s,content,classId,id);spend(n,price);n.projects.push({id:`project-${s.nextId++}`,key:'design',classId,name:`Develop ${content.classes[classId].name}`,days:price.days,remaining:price.days,paid:price});}
export function cancelOrder(s,id){const n=s.nations[s.player],g=n.groups.find(g=>g.id===id);if(!g||!['building','trials','converting'].includes(g.status))throw new Error('This construction order cannot be cancelled.');const refund=0.5*(1-g.progress);n.gold+=(g.paid?.gold||0)*refund;n.industry+=(g.paid?.industry||0)*refund;g.status='scrapped';addLog(s,`${g.name} construction cancelled. Half of the unspent gold and industry was recovered.`,'industry');}
export function reserveGroup(s,id,content=null){invalidateOperations(s);const n=s.nations[s.player],g=n.groups.find(g=>g.id===id);if(!g||!['active','reserve'].includes(g.status))throw new Error('Only operational or reserve hulls can change readiness.');if(g.status==='active'){const force=n.fleets.find(f=>f.id===g.fleetId);if(g.atSea&&force){if(!content)throw new Error('The ship must return to port before entering reserve.');g.reserveOnArrival=true;g.status='returning';detachRepairs(s,content,s.player,force.id,fleetPosition(s,force));const transfer=n.fleets.find(f=>f.id===g.fleetId);transfer.reserveTransfer=true;transfer.name='Reserve transfer '+s.nextId;addLog(s,g.name+' ordered home for reserve. Its transfer remains on the chart and can be intercepted.');return;}g.dockPort=force?.port||HOME_PORT[s.player];releaseShipAircraft(s,content,n,g);delete g.fleetId;g.airWing=[];g.status='reserve';g.atSea=false;g.sailors=0;addLog(s,`${g.name} placed in reserve. Crew demand and maintenance fall.`);}else{spend(n,{gold:Math.ceil(g.count*60),influence:2,industry:g.count*15});g.status='repair';g.health=Math.min(g.health,0.8);addLog(s,`${g.name} is recommissioning. Yard work must finish before deployment.`);}}
export function scrapGroup(s,content,id){
  const n=s.nations[s.player],g=n.groups.find(g=>g.id===id);if(!g||!['active','reserve','repair','returning'].includes(g.status))throw new Error('Choose an existing hull to scrap.');
  if(g.scrapOnArrival)throw new Error('This ship is already ordered home for scrapping.');
  const force=n.fleets.find(f=>f.id===g.fleetId);
  if(g.atSea&&force){g.scrapOnArrival=true;delete g.reserveOnArrival;g.status='returning';detachRepairs(s,content,s.player,force.id,fleetPosition(s,force));addLog(s,g.name+' ordered home for scrapping. Salvage is received only after arrival; the returning force can be intercepted.','industry');return 0;}
  const salvage=completeScrapping(s,content,n,g);allocateAircraft(s,content,s.player);invalidateOperations(s);return salvage;
}
export function setPriority(s,priority,focus,id=s.player){if(!PRIORITIES[priority]||!REGIONS[focus])throw new Error('Choose a valid priority and theater.');const n=s.nations[id];n.priority=priority;n.focus=focus;if(id===s.player)addLog(s,`Admiralty directive: ${PRIORITIES[priority].name.toLowerCase()}, admirals select destinations and refueling stops. Fleets with individual orders retain their missions.`);}

export function diplomaticAction(s,target,action,id=s.player,content=null){
  if(!content)throw new Error('Diplomatic orders require the campaign catalog.');
  const block=diplomaticBlock(s,content,target,action,id);if(block)throw new Error(block);
  const n=s.nations[id],r=s.relations[pairKey(id,target)],rule=DIPLOMACY[action],cool=action+'-'+target,now=s.day+(s.fraction||0);
  const offer=action==='truce'?ceasefireOffer(s,content,target,id):null;
  const force=action==='provoke'?readyProvocationFleet(s,content,target,id):null;
  spend(n,rule.price);if(rule.days)n.cooldowns[cool]=now+rule.days;
  if(rule.relations)r.score=clamp(r.score+rule.relations,-100,100);
  let receipt=PROFILES[target].name+': '+rule.name.toLowerCase()+' completed'+(rule.relations?' ('+(rule.relations>0?'+':'')+rule.relations+' relations)':'')+'.',accepted=null,clash=false;
  if(action==='cooperate')n.cooldowns[cool]=2000000;
  if(action==='alliance')formAlliance(s,id,target);
  diplomaticPressure(s,r,action);
  if(action==='truce'){
    accepted=rng(s)<offer.chance/100;
    if(accepted){spend(n,rule.settlement);r.war=false;r.warning=null;r.pressure=15;r.score=8;r.truceUntil=now+365;r.warSince=null;receipt=PROFILES[target].name+' accepted the one-year ceasefire ('+offer.chance+'% chance). Negotiation and settlement paid.';}
    else receipt=PROFILES[target].name+' rejected the ceasefire ('+offer.chance+'% chance). Only the negotiation fee was paid. Another offer is available '+dateText(n.cooldowns[cool])+'.';
  }
  if(action==='provoke'){
    const pos=fleetPosition(s,force);
    // No teleporting opponents or disclosing hidden contact locations to the UI.
    const enemy=s.nations[target].fleets.filter(f=>!['port','refuel'].includes(f.phase)&&fleetStats(s,content,target,f).hulls&&distanceNm(pos,fleetPosition(s,f))<=PROVOCATION.reachNm).sort((a,b)=>distanceNm(pos,fleetPosition(s,a))-distanceNm(pos,fleetPosition(s,b)))[0];
    receipt=force.name+' conducted a naval provocation against '+PROFILES[target].name+' (−24 relations).';
    if(enemy&&rng(s)<PROVOCATION.clashChance/100){
      clash=true;r.score=Math.min(-30,r.score);beginWarWarning(s,content,id,target,{aggressor:id,reason:'A naval provocation has led to a limited exchange of fire. The cabinets have committed to war after mobilization.'});
      const region=Object.values(AREAS).sort((a,b)=>distanceNm(a.point,pos)-distanceNm(b.point,pos))[0].region;
      addAlert(s,'Naval provocation: limited clash',force.name+' exchanged fire with '+PROFILES[target].name+'. A war warning is in force; general hostilities have not begun.','diplomacy',{a:id,b:target});
      const report=resolveBattle(s,content,id,target,region,force.id,enemy.id,pos);
      receipt+=' A war warning has begun. '+(report?'An after-action report is available.':'Admirals broke contact before a decisive engagement.');
    }else receipt+=' No exchange of fire followed.';
  }
  if(r.allied&&r.score<20)r.allied=false;
  invalidateOperations(s);normalizeDecisions(s);
  if(id===s.player)addLog(s,receipt,'diplomacy');
  return {receipt,accepted,chance:offer?.chance,clash,fleetId:force?.id};
}
export function setTreatyPolicy(s,policy,id=s.player){if(!['disclose','conceal','withdraw'].includes(policy))throw new Error('Unknown treaty policy.');const n=s.nations[id];if(n.treatyPolicy===policy)return;if(s.campaignId==='campaign_1922'&&id==='SOV')throw new Error('The Soviet Union is not a Washington treaty signatory.');if(n.treatyPolicy==='withdraw'&&s.day<=s.treatyUntil)throw new Error('Treaty withdrawal lasts until this agreement expires.');if(policy==='withdraw'&&s.day<=s.treatyUntil){spend(n,{gold:1000,influence:20,industry:100});for(const r of Object.values(s.relations))if(r.a===id||r.b===id)r.score=clamp(r.score-8,-100,100);}n.treatyPolicy=policy;if(policy==='disclose')for(const g of n.groups)g.covert=false;normalizeDecisions(s);}

export function dismissNotice(s,c,id){
  const d=s.decisions.find(d=>d.key===id);
  if(d){if(d.critical)chooseDecision(s,c,id,d.defaultOption);else{s.decisions=s.decisions.filter(x=>x!==d);s.completedEvents.push(d.key);}return;}
  const a=s.alerts.find(a=>String(a.id)===String(id));if(a)a.dismissed=true;
  if(String(id).startsWith('contact-')){const contact=s.nations[s.player].contacts.find(c=>'contact-'+c.id===id);if(contact)contact.dismissedAt=campaignMinutes(s);}
  if(String(id).startsWith('dispatch-')){const l=s.log.find(l=>'dispatch-'+l.id===id);if(l)l.dismissed=true;}
}

export function clearOptionalAlerts(s,c){
  for(const d of [...s.decisions])if(!d.critical)dismissNotice(s,c,d.key);
  for(const a of s.alerts)a.dismissed=true;
  for(const l of s.log)l.dismissed=true;
  for(const contact of s.nations[s.player].contacts)if(s.relations[pairKey(s.player,contact.nation)]?.war&&campaignMinutes(s)-contact.seenAt<=48*60)contact.dismissedAt=campaignMinutes(s);
}
function completeProject(s,content,n,p){
  if(p.key==='design')n.unlocked.push(p.classId);
  else{const definition=PROGRAMS[p.key];if(definition.level)n.tech[definition.level]++;if(p.key==='school')n.crewYear+=500;if(p.key==='pilots')n.aviatorsYear+=100;if(p.key==='training'){n.training=clamp(n.training+9,0,100);n.morale=clamp(n.morale+3,0,100);}if(p.key==='logistics')n.logistics=clamp(n.logistics+8,0,100);}
  if(n.id===s.player){addLog(s,`${p.name} completed.`,'industry');addAlert(s,'Program complete',p.name+' completed.','industry');}
}
export function yardLoad(s,content,id=s.player){
 const n=s.nations[id],yards=yardAvailability(s,id),occupied=yards.owned===0,health=yards.coverage;
 const capacity=health*economyFor(s,id).yardYear*(1+upgradeLevel(n.tech,'industry')*.15)*(n.industryFunding??1)*(n.industryOperating??1)/365;
 const work=n.groups.filter(g=>['building','trials','converting'].includes(g.status)).reduce((sum,g)=>sum+content.classes[g.classId].tons*g.count/g.days,0);
 return {capacity,work,used:Math.min(work,capacity),spare:Math.max(0,capacity-work),backlog:Math.max(0,work-capacity),factor:Math.max(1,work/Math.max(.001,capacity)),blocked:capacity<=0,reason:occupied?'National yards occupied':health<=0?'National yards disabled by damage':capacity<=0?'Industry operating funds exhausted':''};
}
function daily(s,content){
  // Pay this day's operating costs before permitting this day's yard work.
  dailyResources(s,content,(text,kind)=>addLog(s,text,kind));
  for(const [id,n]of Object.entries(s.nations)){
    const load=yardLoad(s,content,id);
    for(const g of n.groups){
      if(['building','converting','trials'].includes(g.status)){g.progress=clamp(g.progress+(load.blocked?0:1/(g.days*load.factor)),0,1);if(g.progress>=1){const deliveredCount=g.count;g.status='active';g.region=PROFILES[id].home;delete g.fleetId;commissionToFleet(s,content,id,g);const service=fleetService(content.classes[g.classId]);n[service==='merchant'?'merchantDelivered':service==='support'?'supportDelivered':'delivered']+=deliveredCount;if(id===s.player)addLog(s,`${deliveredCount} × ${g.baseName||g.name} ${service==='merchant'?'entered merchant service':'commissioned'}.`,'industry');}}
      if(g.status==='repair'&&usablePorts(s,id).includes(g.dockPort||HOME_PORT[id])){const cost=content.classes[g.classId].cost*g.count*0.0001;if(n.gold>=cost){n.gold-=cost;g.health=clamp(g.health+0.003*(1+upgradeLevel(n.tech,'logistics')*0.1+upgradeLevel(n.tech,'damage_control')*.06),0,1);if(g.health>=1){g.status='active';commissionToFleet(s,content,id,g);if(id===s.player)addLog(s,`${g.name} returned to service after repairs.`);}}}
    }
    retireReplacedTreatyHulls(s,content,id);
    for(const p of [...n.projects]){p.remaining--;if(p.remaining<=0){completeProject(s,content,n,p);n.projects.splice(n.projects.indexOf(p),1);}}
    n.training=clamp(n.training-0.0025/(1+upgradeLevel(n.tech,'training')*.2),20,100);n.morale=clamp(n.morale+(75-n.morale)*0.0006,10,100);
  }
  repairPorts(s);dailyOperations(s,content);dailyWorld(s,content,(title,body,meta)=>recordFrontAlert(s,title,body,meta));dailyAviation(s,content);invalidateOperations(s);
  for(const id of Object.keys(s.nations))applyStandingOrders(s,content,id);

  const date=new Date(s.day*DAY);if(date.getUTCDate()===1)monthly(s,content);
  scriptedDecisions(s,content);
  if(date.getUTCMonth()===11&&date.getUTCDate()===31&&[1940,1945,1950].includes(date.getUTCFullYear())){
    const review={year:date.getUTCFullYear(),day:s.day,scores:campaignScores(s,content)};s.reviews.push(review);addLog(s,`${review.year} campaign review: ${review.scores.find(r=>r.id===s.player).score} points. The sandbox continues.`,'cabinet');
    if(review.year===1950){queueDecision(s,'review-1950','The 1950 campaign review','Your campaign has been scored. There is no forced ending: your fleets, projects, relationships and economy continue.',[{id:'continue',label:'Continue the sandbox',detail:'Return to the ministry with the current world intact.'}]);}
  }
}
function historicalEvents(s,content){
  const t=s.timeline,now=campaignMinutes(s);historicalWarnings(s,content);politicsTick(s,content);
  if(!t.polandOccurred&&now>=t.polandAt-1e-6){t.polandOccurred=true;addLog(s,'Germany has invaded Poland.','war');addAlert(s,'Germany invades Poland','German forces have crossed the Polish border. United Kingdom is preparing its response.','war');dispatchPopup(s,'poland-declaration','Germany invades Poland','German forces have crossed the Polish border. United Kingdom and France are preparing their response.','war');}
  if(!t.europeOccurred&&now>=t.britainAt-1e-6){
    t.europeOccurred=true;
    commenceWar(s,content,'DEU','GBR',{reason:'United Kingdom has declared war following the invasion of Poland.',aggressor:'DEU'});
    commenceWar(s,content,'DEU','FRA',{reason:'France has declared war following the invasion of Poland.',aggressor:'DEU'});
    for(const id of ['GBR','DEU'])if(id!==s.player){s.nations[id].focus='atlantic';applyStandingOrders(s,content,id);}
    normalizeDecisions(s);
  }
  if(t.europeOccurred&&s.nations.ITA&&s.nations.SOV){
    const offset=s.campaignId==='campaign_1922'?t.offsetDays*1440:0;
    for(const [key,at,pairs,title]of [
      ['italian-entry',Date.parse('1940-06-10T16:00:00Z')/60000,[['ITA','GBR'],['ITA','FRA']],'Italy enters the European war'],
      ['barbarossa',Date.parse('1941-06-22T01:00:00Z')/60000,[['DEU','SOV'],['ITA','SOV']],'Germany invades the Soviet Union'],
    ])if(now>=at+offset&&!s.completedEvents.includes(key)){
      s.completedEvents.push(key);
      for(const [a,b]of pairs)commenceWar(s,content,a,b,{reason:title+'.',aggressor:a});
      addLog(s,title+'.','war');addAlert(s,title,'The diplomatic situation has changed. Review naval missions and convoy protection.','war');normalizeDecisions(s);
    }
  }
}
export function advanceMinutes(s,content,minutes,{respectPause=false}={}){
  content=contentFor(content,s);
  if(!Number.isFinite(minutes)||minutes<0)throw new Error('Choose a finite, positive time interval.');
  if(respectPause&&s.paused)return 0;
  const start=campaignMinutes(s),target=canonicalMinute(start+minutes);
  historicalEvents(s,content);
  while(campaignMinutes(s)<target-1e-7){
    if(respectPause&&s.paused)break;
    const now=campaignMinutes(s),minute=Math.floor(now)+1;
    const event=Math.min(s.timeline.polandOccurred?Infinity:s.timeline.polandAt,s.timeline.europeOccurred?Infinity:s.timeline.britainAt);
    const next=Math.min(target,minute,event),oldDay=s.day;setCampaignMinutes(s,next);
    if(s.day!==oldDay){daily(s,content);content=contentFor(content,s);}
    historicalEvents(s,content);
    if(campaignMinutes(s)===minute){minuteOperations(s,content,(a,b,r,fa,fb,pos)=>resolveBattle(s,content,a,b,r,fa,fb,pos),(a,b,count,pos,fleet,grt)=>{recordWarRaid(s,a,b,grt);if(count>0)addAlert(s,'Merchant shipping attacked',PROFILES[a].name+' sank '+count+' merchant hulls belonging to '+PROFILES[b].name+'.','convoy',{a,b,count,grt,position:pos,fleet});});minuteAviation(s,content);coastalRecon(s,content);minutePortOperations(s,content,(id,f,port,kind,distance)=>resolvePortAction(s,content,id,f,port,kind,distance));if(minute%60===0)updatePortBlockades(s,content);s.minuteTicks=(s.minuteTicks||0)+1;decisionDeadlines(s,content);}
  }
  return campaignMinutes(s)-start;
}
export function advanceDays(s,content,days,options={}){const oldDay=s.day;advanceMinutes(s,content,Math.floor(days)*1440,options);return s.day-oldDay;}
export function tick(s,content,seconds){return s.paused?0:advanceMinutes(s,content,Math.max(0,seconds)*BASE_SPEED*s.speed/60,{respectPause:true});}

function monthly(s,content){
  for(const [id,n]of Object.entries(s.nations)){
    const income=monthlyIncome(s,content,id);n.gold=Math.max(0,n.gold+income.gold);n.influence=clamp(n.influence+income.influence,0,500);// Industry output and its running expense are credited daily.
    n.commerce=clamp(n.commerce+3+upgradeLevel(n.tech,'logistics'),15,100);
    if(n.gold<1){n.morale=clamp(n.morale-3,10,100);n.logistics=clamp(n.logistics-2,20,100);}
    if(n.treatyPolicy==='conceal'&&s.day<=s.treatyUntil){n.exposure=clamp(n.exposure+2,0,100);if(n.influence<3||rng(s)<n.exposure/650){for(const r of Object.values(s.relations))if(r.a===id||r.b===id){r.score=clamp(r.score-8,-100,100);r.pressure=clamp(r.pressure+5,0,100);}n.exposure=8;if(id===s.player)addLog(s,'Inspectors uncovered concealed construction. Relations with every government fell by 8.','diplomacy');}}else n.exposure=Math.max(0,n.exposure-2);
  }
  monthlyRelations(s,content);
  adjustEuropeanTimeline(s);s.nextHistoricalWarningAt=campaignMinutes(s);
  for(const id of Object.keys(s.nations))if(id!==s.player){aiTurn(s,content,id);content=contentFor(content,s);}
  const scores=campaignScores(s,content);s.history.push({day:s.day,scores:scores.map(r=>({id:r.id,score:r.score,power:r.power,commerce:r.commerce}))});s.history=s.history.slice(-240);
}

export function aiTurn(s,content,id){
  if(id===s.player)return;
  const n=s.nations[id];let needs=aiNeeds(s,content,id);aiFunding(s,content,id,needs);
  // Historical starts keep their declared restrictions; alternate programs may conceal.
  if(s.campaignId!=='campaign_1922'&&n.treatyPolicy==='disclose'&&s.day<=s.treatyUntil&&aiCanSpend(s,id,{gold:4200,influence:18,industry:0})){
    const required=content.nations[id].designs.some(cid=>aiHullScore(s,content,id,content.classes[cid],needs)>1&&/Exceeds the treaty/.test(shipOrderBlock(s,content,cid,id)));
    if(required)setTreatyPolicy(s,'conceal',id);
  }
  const shipping=merchantEconomy(s,content,id),incoming=n.groups.filter(g=>g.service==='merchant'&&['building','trials','converting'].includes(g.status)).reduce((v,g)=>v+g.count*g.merchantGRT,0),gap=shipping.required-shipping.current-incoming;
  let yards=yardLoad(s,content,id);
  if(gap>shipping.required*.02&&!yards.blocked&&yards.factor<1.25){
    const freighter=content.nations[id].designs.map(cid=>content.classes[cid]).filter(cl=>fleetService(cl)==='merchant'&&!shipOrderBlock(s,content,cl.id,id)).sort((a,b)=>b.year-a.year)[0];
    if(freighter){let quantity=Math.min(20,Math.ceil(gap/(freighter.raw?.merchant_grt||freighter.merchantGRT||freighter.tons*.7)));while(quantity>0){const p=shipPrice(s,content,freighter.id,quantity,id);if(aiCanSpend(s,id,p,{emergency:shipping.coverage<.6})&&yards.work+freighter.tons*quantity/p.days<=yards.capacity*1.4){orderShip(s,content,freighter.id,quantity,id);break;}quantity--;}}
  }
  const models=aircraftModels(content,id).filter(a=>a.type_year<=yearOf(s)).sort((a,b)=>b.type_year-a.type_year);
  for(const role of ['fighter','strike','scout']){const ready=models.find(a=>n.aircraftUnlocked.includes(a.id)&&[role,'multirole'].includes(planeRole(a)));if(ready)n.productionModels[role]=ready.id;}
  const newModel=models.find(a=>!n.aircraftUnlocked.includes(a.id)&&!n.airOrders.some(o=>o.model===a.id)&&!models.some(other=>other.type_year>a.type_year&&planeRole(other)===planeRole(a)&&n.aircraftUnlocked.includes(other.id)));
  if(newModel&&n.airOrders.length<3&&aiCanSpend(s,id,aircraftPrice(s,content,newModel.id,1,id,{development:true})))orderAircraft(s,content,newModel.id,1,id,{development:true});
  yards=yardLoad(s,content,id);const scores=aiResearchScores(s,content,id,needs,shipping,yards);
  if(n.projects.length<3){const program=Object.keys(PROGRAMS).filter(key=>!projectBlock(s,key,id)&&aiCanSpend(s,id,projectPrice(s,key,id))).sort((a,b)=>(scores[b]||0)-(scores[a]||0)||a.localeCompare(b))[0];if(program)startProject(s,program,id);}
  // Replace a missing/obsolete line in a needed role; do not pay for duplicate drafts each cycle.
  const wanted=Object.keys(aiDoctrine(s,id).roles).filter(role=>aiDoctrine(s,id).roles[role]>0).map(role=>({role,score:aiHullScore(s,content,id,{type:role,service:'warship',year:yearOf(s),crew:0},needs)})).sort((a,b)=>b.score-a.score);
  const missing=wanted.find(({role})=>!content.nations[id].designs.some(cid=>content.classes[cid].type===role&&!productionBlock(s,content,cid,id)));
  if(missing&&(n.cooldowns.draft??-Infinity)<=s.day&&n.customDesigns.length<80){const ministry={...s,player:id},recipe=automaticDraft(ministry,content,missing.role),fee=evaluateDesign(recipe,id).fee;if(aiCanSpend(s,id,{gold:fee})){commissionDraft(ministry,content,recipe);s.nextId=ministry.nextId;n.cooldowns.draft=s.day+730;content=contentFor(content,s);}}
  needs=aiNeeds(s,content,id);yards=yardLoad(s,content,id);
  if(!yards.blocked&&yards.factor<1.15){
    const candidates=content.nations[id].designs.map(cid=>content.classes[cid]).filter(cl=>!shipOrderBlock(s,content,cl.id,id)&&fleetService(cl)!=='merchant').map(cl=>({cl,score:aiHullScore(s,content,id,cl,needs)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||b.cl.year-a.cl.year||b.cl.speed-a.cl.speed);
    for(const {cl}of candidates){let quantity=['DD','DL','DE','TB','SS','SM'].includes(cl.type)?3:1;while(quantity>0){const p=shipPrice(s,content,cl.id,quantity,id),crewAvailable=needs.crew.balance+n.crewYear*n.schoolFunding*2-needs.pipelineCrew;
      if(aiCanSpend(s,id,p)&&crewAvailable>=cl.crew*quantity&&yards.work+cl.tons*quantity/p.days<=yards.capacity*1.25){orderShip(s,content,cl.id,quantity,id);quantity=-1;break;}quantity--;}
      if(quantity===-1)break;
    }
  }
  const qualification=content.nations[id].designs.map(cid=>content.classes[cid]).filter(cl=>!n.unlocked.includes(cl.id)&&!productionBlock(s,content,cl.id,id)&&!n.projects.some(p=>p.classId===cl.id)&&aiHullScore(s,content,id,cl,needs)>0).sort((a,b)=>aiHullScore(s,content,id,b,needs)-aiHullScore(s,content,id,a,needs)||b.year-a.year)[0];
  if(qualification&&n.projects.length<3&&aiCanSpend(s,id,designPrice(s,content,qualification.id,id)))developDesign(s,content,qualification.id,id);
}

function matchup(own,enemy){return own.surface+own.air/(1+enemy.aa/Math.max(200,own.air)*0.35)+own.sub/(1+enemy.asw/Math.max(100,own.sub))*1.2+own.asw*0.2;}
export function damageFleet(s,content,id,region,damage,enemyPower,mechanism,fleetId=null,rescue=.3,crewCoverage=1,targets=null){
  const n=s.nations[id],losses=[],conditions=[],engagedComposition={},sunkComposition={},damagedComposition={};let sunk=0,damaged=0,tons=0,damagedTons=0,engagedTons=0,planesLost=0,aviatorsLost=0,planesRescued=0,aviatorsRescued=0,sailorsLost=0,sailorsRescued=0;
  const groups=targets||n.groups.filter(g=>availableGroup(s,g)&&(fleetId?g.fleetId===fleetId:g.region===region)&&(!isAuxiliary(content.classes[g.classId])||fleetId&&g.service==='support'));
  const total=groups.reduce((sum,g)=>sum+g.count,0),supportBefore=groups.filter(g=>g.service==='support').reduce((v,g)=>v+content.classes[g.classId].tons*g.count*g.health,0);
  for(const g of groups){
    const c=content.classes[g.classId],underwater=['SS','SM'].includes(c.type),before=g.count;engagedTons+=c.tons*before;engagedComposition[c.type]=(engagedComposition[c.type]||0)+before;
    const protection=(underwater?1+c.submergedSpeed/20:1+c.belt/350+c.deck/300)+Math.sqrt(c.durability/300)*.2;
    const detection=underwater?clamp(enemyPower.asw/Math.max(80,enemyPower.sub+enemyPower.surface*.04),.08,1):1;
    const oldHealth=g.health,hit=damage/protection*(.75+rng(s)*.5)*detection/(1+upgradeLevel(n.tech,'damage_control')*.06)*(.8+.2/Math.max(.25,crewEffectiveness(g,c)));g.health=clamp(g.health-hit,0,1);
    const expected=before*clamp(hit*hit*.35,0,.3);let lost=Math.floor(expected)+(rng(s)<expected%1?1:0);
    if(g.health<.25)lost=Math.max(1,lost);lost=Math.min(before,lost);
    const aircraftLoss=loseAircraft(s,content,id,g,lost===before?1:clamp(hit*.45+lost/before,0,1),{rescue,airframeRescue:lost===before?0:rescue*.2});planesLost+=aircraftLoss.planes;aviatorsLost+=aircraftLoss.aviators;planesRescued+=aircraftLoss.planesRescued;aviatorsRescued+=aircraftLoss.aviatorsRescued;
    if(lost){g.count-=lost;sunk+=lost;tons+=lost*c.tons;sunkComposition[c.type]=(sunkComposition[c.type]||0)+lost;losses.push({name:g.name,type:c.type,classId:c.id,count:lost,cause:underwater?(enemyPower.asw>0?'depth charges and escort pursuit':'surface interception'):mechanism,tons:lost*c.tons});}
    const injury=Math.max(0,oldHealth-g.health);damagedTons+=c.tons*g.count*injury;
    if(g.count===0){g.status='sunk';g.health=0;}
    else {if(injury>0){damaged+=g.count;damagedComposition[c.type]=(damagedComposition[c.type]||0)+g.count;}if(g.health<.65){g.status=fleetId?'returning':'repair';if(!fleetId)g.region=PROFILES[id].home;}}
    const aboard=g.sailors||0,exposed=Math.min(aboard,Math.floor(aboard*(lost/Math.max(1,before)+(g.count/Math.max(1,before))*injury*.15)));g.sailors=aboard-exposed;n.crew-=exposed;const personnel=recordCasualties(s,n,'sailors',exposed,{rescue:Math.min(.95,rescue+upgradeLevel(n.tech,'damage_control')*.015),days:14});sailorsLost+=personnel.lost;sailorsRescued+=personnel.rescued;
    conditions.push({id:g.id,type:c.type,name:g.name,classId:g.classId,count:before,sunk:lost,health:g.health,damage:Math.round((1-g.health)*100),newDamage:Math.round(injury*100),severity:!g.count?'sunk':g.health<.65?'serious':g.health<.9?'moderate':'light',tons:c.tons,returning:g.status==='returning'});
  }
  const support=n.fleets.find(f=>f.id===fleetId&&f.supportKind==='oiler');if(support&&supportBefore>0)support.supportCargo*=groups.filter(g=>g.service==='support').reduce((v,g)=>v+content.classes[g.classId].tons*g.count*g.health,0)/supportBefore;
  n.lostTons+=tons;invalidateOperations(s);
  return {sunk,damaged,tons,damagedTons,engagedTons,engagedComposition,sunkComposition,damagedComposition,damagePercent:100*damagedTons/Math.max(1,engagedTons),planesLost,aviatorsLost,planesRescued,aviatorsRescued,sailorsLost,sailorsRescued,conditions,losses,engaged:total};
}
export function engagementEscapeChance(weak,strong){
  // Detecting the enemy first permits an early turn away; greater speed keeps the gap open.
  return clamp(.42+(weak.speed-strong.speed)*.035+(weak.scout/Math.max(1,weak.ships)-strong.scout/Math.max(1,strong.ships))*.018,.06,.97);
}
export function resolveBattle(s,content,a,b,region,fleetA=null,fleetB=null,position=null){
  const pa=fleetPower(s,content,a,region,fleetA),pb=fleetPower(s,content,b,region,fleetB);if(!pa.ships||!pb.ships)return null;
  const fa=s.nations[a].fleets.find(f=>f.id===fleetA),fb=s.nations[b].fleets.find(f=>f.id===fleetB);
  if(fa)pa.speed=fleetStats(s,content,a,fa).maxSpeed*Math.max(.4,fleetStats(s,content,a,fa).health);
  if(fb)pb.speed=fleetStats(s,content,b,fb).maxSpeed*Math.max(.4,fleetStats(s,content,b,fb).health);
  const wa=matchup(pa,pb),wb=matchup(pb,pa),weaker=wa<wb?a:b,weak=weaker===a?pa:pb,strong=weaker===a?pb:pa;
  const ratio=Math.min(wa,wb)/Math.max(1,wa,wb),weakFleet=weaker===a?fa:fb;
  if((ratio<.72||weakFleet?.role==='repair')&&!weakFleet?.aggressiveBattle&&rng(s)<engagementEscapeChance(weak,strong)){
    if([a,b].includes(s.player))addLog(s,PROFILES[weaker].name+' used scouting and escape speed to avoid an unequal engagement in the '+REGIONS[region].name+'.');return null;
  }
  const va=1+(rng(s)*2-1)*RULES.battleVariation,vb=1+(rng(s)*2-1)*RULES.battleVariation;
  const preparationA={training:s.nations[a].training,morale:s.nations[a].morale,supply:pa.supply,crew:readiness(s,content,a)},preparationB={training:s.nations[b].training,morale:s.nations[b].morale,supply:pb.supply,crew:readiness(s,content,b)};
  const upset=rng(s)<RULES.upsetChance,upsetSide=upset?(rng(s)<.5?a:b):null,ea=wa*va*(upsetSide===a?1.8:1),eb=wb*vb*(upsetSide===b?1.8:1);
  const mechanism=p=>p.air>p.surface&&p.air>p.sub?'carrier air attack':p.sub>p.surface?'submarine torpedo attack':'gunfire and surface torpedoes';
  const rescueFor=(id,f,control)=>{const pos=f?fleetPosition(s,f):position;let escorts=0;for(const [ally,n]of Object.entries(s.nations)){if(ally!==id&&!s.relations[pairKey(id,ally)]?.allied)continue;for(const other of n.fleets){if(pos?distanceNm(fleetPosition(s,other),pos)>120:other.id!==f?.id)continue;escorts+=fleetStats(s,content,ally,other).active.filter(g=>['DD','DE','DL'].includes(content.classes[g.classId].type)).reduce((v,g)=>v+g.count,0);}}return clamp(.12+control*.55+Math.min(8,escorts)*.025,.1,.9);};
  const pressureA=fa?.aggressiveBattle?1.4:1,pressureB=fb?.aggressiveBattle?1.4:1,riskA=fa?.aggressiveBattle?1.2:1,riskB=fb?.aggressiveBattle?1.2:1;
  const da=damageFleet(s,content,a,region,clamp(eb/Math.max(ea,1)*.2*pressureB*riskA,.04,.85),pb,mechanism(pb),fleetA,rescueFor(a,fa,ea/(ea+eb)),preparationA.crew);
  const db=damageFleet(s,content,b,region,clamp(ea/Math.max(eb,1)*.2*pressureA*riskB,.04,.85),pa,mechanism(pa),fleetB,rescueFor(b,fb,eb/(ea+eb)),preparationB.crew);
  staffAircraft(s,content,a);staffAircraft(s,content,b);
  const costA=da.tons+da.damagedTons*.65,costB=db.tons+db.damagedTons*.65,winner=costA===costB?(ea>=eb?a:b):costB>costA?a:b;
  const magnitude=Math.max(costA,costB)>=Math.max(1000,Math.min(costA,costB)*2)?'major':'minor';
  s.nations[a].sunkTons+=db.tons;s.nations[b].sunkTons+=da.tons;
  for(const id of [a,b]){s.nations[id].morale=clamp(s.nations[id].morale+(id===winner?3:-5),10,100);s.nations[id][id===winner?'battlesWon':'battlesLost']++;}
  const report={id:s.nextId++,day:s.day,minute:campaignMinutes(s),fleetA,fleetB,position,a,b,region,winner,magnitude,aggressiveA:!!fa?.aggressiveBattle,aggressiveB:!!fb?.aggressiveBattle,upset,upsetSide,powerA:pa,powerB:pb,effectiveA:ea,effectiveB:eb,variationA:va,variationB:vb,resultA:da,resultB:db,preparationA,preparationB};
  recordWarBattle(s,report);s.reports.unshift(report);s.reports=s.reports.slice(0,80);
  if(fa&&fa.role!=='repair')detachRepairs(s,content,a,fa.id,fleetPosition(s,fa));
  if(fb&&fb.role!=='repair')detachRepairs(s,content,b,fb.id,fleetPosition(s,fb));
  for(const [id,f] of [[a,fa],[b,fb]])if(f?.role==='repair')setRoute(s,content,id,f,f.port,{phase:'returning',position:fleetPosition(s,f)});
  invalidateOperations(s);
  const description=PROFILES[a].name+': '+resultComposition(da,'sunk')+' sunk, '+resultComposition(da,'damaged')+' damaged ('+Math.round(da.damagePercent)+'% of engaged tonnage). '+PROFILES[b].name+': '+resultComposition(db,'sunk')+' sunk, '+resultComposition(db,'damaged')+' damaged ('+Math.round(db.damagePercent)+'%).';
  addLog(s,REGIONS[region].name+': '+magnitude+' victory for '+PROFILES[winner].name+'. '+description,'battle');
  if([a,b].includes(s.player))addAlert(s,(magnitude==='major'?'Major ':'Minor ')+(winner===s.player?'victory':'defeat')+' in the '+REGIONS[region].name,description,'battle',{reportId:report.id,winner,resultA:da,resultB:db,a,b});
  return report;
}

export function resolvePortAction(s,c,a,f,port,kind,distance=0){
  const b=portOwner(s,port);if(!s.relations[pairKey(a,b)]?.war)return null;
  const before=portSummary(s,c,port),pa=fleetPower(s,c,a,null,f.id,distance*1.852);if(!pa.ships)return null;
  const position=fleetPosition(s,f),region=Object.values(AREAS).sort((x,y)=>distanceNm(x.point,position)-distanceNm(y.point,position))[0].region;
  const artillery=distance<=before.gunRange?before.artillery:0,air=flyBaseSorties(s,c,port,distance*1.852),aviation=air.strike;
  if(kind==='shore'&&artillery+aviation<=0)return null;
  const pb={surface:artillery,air:aviation,sub:0,asw:100,aa:before.artillery*.2+air.fighters,scout:air.scout,total:artillery+aviation,ships:0,speed:0,supply:1};
  const va=.94+rng(s)*.12,vb=.94+rng(s)*.12,attack=(pa.air/(1+air.fighters/Math.max(300,pa.air))+(distance<=18?pa.surface*.55:0))*va;
  const harbor=kind==='anchorage'?anchoredShips(s,c,b,port):[];
  const da=damageFleet(s,c,a,region,clamp(pb.total*vb/Math.max(1200,pa.total)*.12,0,.3),pb,'shore artillery and land-based aircraft',f.id,.55);
  const db=damageFleet(s,c,b,region,kind==='anchorage'?clamp(attack/Math.max(2500,pb.total+harbor.length*200)*.16,.01,.45):0,pa,'anchorage strike',null,.8,1,harbor);
  if(before.assignedAircraft>0&&(aviation>0||kind==='anchorage')){const airLoss=loseAircraft(s,c,b,{airWing:s.nations[b].airBases[port].airWing},Math.min(.18,attack/Math.max(5000,pb.total)*.06),{rescue:.8,airframeRescue:.15});db.planesLost+=airLoss.planes;db.planesRescued+=airLoss.planesRescued;db.aviatorsLost+=airLoss.aviators;db.aviatorsRescued+=airLoss.aviatorsRescued;}
  const portDamage=kind==='shore'?0:damagePort(s,port,clamp(attack/Math.max(3000,before.combat)* (kind==='siege'?.065:.02),0,.12));
  const portEquivalent=portDamage*60000,costA=da.tons+da.damagedTons*.65,costB=db.tons+db.damagedTons*.65+portEquivalent;
  const winner=costB>costA?a:b,magnitude=Math.max(costA,costB)>=Math.max(1000,Math.min(costA,costB)*2)?'major':'minor';
  const report={id:s.nextId++,day:s.day,minute:campaignMinutes(s),kind:'port',operation:kind,portId:port,portDamage,portHealth:s.ports[port].health,portEquivalent,position,region,a,b,fleetA:f.id,fleetB:null,winner,magnitude,upset:false,upsetSide:null,shoreAircraft:air.wings,shoreReadiness:air.readiness,powerA:pa,powerB:pb,effectiveA:attack,effectiveB:pb.total*vb,variationA:va,variationB:vb,resultA:da,resultB:db,preparationA:{training:s.nations[a].training,morale:s.nations[a].morale,supply:pa.supply,crew:1},preparationB:{training:s.nations[b].training,morale:s.nations[b].morale,supply:before.coverage,crew:1}};
  s.nations[a].sunkTons+=db.tons;s.nations[b].sunkTons+=da.tons;
  for(const id of [a,b]){s.nations[id][id===winner?'battlesWon':'battlesLost']++;s.nations[id].morale=clamp(s.nations[id].morale+(id===winner?1:-2),10,100);}
  recordWarBattle(s,report);s.reports.unshift(report);s.reports=s.reports.slice(0,80);
  detachRepairs(s,c,a,f.id,position);staffAircraft(s,c,a);staffAircraft(s,c,b);invalidateOperations(s);
  const title=(magnitude==='major'?'Major ':'Minor ')+(winner===s.player?'victory':'defeat')+' · '+PORTS[port].name;
  if([a,b].includes(s.player))addAlert(s,title,(kind==='shore'?'Shore defenses attacked a passing force':kind==='siege'?'Port bombardment':'Anchorage raid')+'. Port damage: '+Math.round(portDamage*100)+' percentage points; '+Math.round(s.ports[port].health*100)+'% capacity remains. '+PROFILES[a].name+': '+resultComposition(da,'sunk')+' sunk, '+resultComposition(da,'damaged')+' damaged. '+PROFILES[b].name+': '+resultComposition(db,'sunk')+' sunk, '+resultComposition(db,'damaged')+' damaged.','battle',{a,b,winner,reportId:report.id});
  return report;
}

function scriptedDecisions(s,content){
  const year=yearOf(s);
  if(s.campaignId==='campaign_1922')historical1922Decisions(s,content,queueDecision);
  if(s.day>s.treatyUntil&&!s.completedEvents.includes('expiry'))queueDecision(s,'expiry','The treaty system expires','The remaining construction limits have reached their expiry. Governments are considering verified limits, but mistrust continues.',[
    {id:'lapse',label:'Let the limits expire',detail:'Build openly without treaty restrictions. Relations continue to deteriorate.'},
    {id:'renew',label:'Offer a verification agreement',detail:'Spend 30 influence for +8 relations with every government and renew your construction limits for 3 years.'},
  ],{critical:true,kind:'treaty',defaultOption:'lapse',defaultText:'The treaty limits lapse. Open construction is permitted.'});
  const date=new Date(s.day*DAY);
  if(date.getUTCDate()===1&&[3,9].includes(date.getUTCMonth())){
    const key=`incident-${year}-${date.getUTCMonth()}`;const rival=s.nations[s.player].rival;const positive=(year+date.getUTCMonth())%3===0;
    if(positive&&!s.relations[pairKey(s.player,rival)].war)queueDecision(s,key,'A chance to cooperate',`${PROFILES[rival].name} has requested help with a civilian maritime emergency. The response will be read as a signal of your government’s intentions.`,[
      {id:'aid',label:'Send relief and repair teams',detail:'2,500 gold · 300 industry. +8 relations and +3 morale.',relation:8,gold:2500,industry:300,morale:3},
      {id:'decline',label:'Keep the fleet committed at home',detail:'No cost; no change to relations.'},
    ],{target:rival});
    else if(!(s.campaignId==='campaign_1922'&&[s.player,rival].includes('SOV'))&&s.day<=s.treatyUntil&&s.nations[s.player].treatyPolicy!=='withdraw'&&s.nations[rival].treatyPolicy!=='withdraw'&&!s.relations[pairKey(s.player,rival)].war)queueDecision(s,key,'Disputed naval intelligence',`Reports of undeclared work have reached ${PROFILES[rival].name}. The cabinet wants an answer before the next round of estimates.`,[
      {id:'access',label:'Offer a limited inspection',detail:'12 influence. +5 relations; reveal any concealed hulls.',relation:5,influence:12,reveal:true},
      {id:'deny',label:'Deny access',detail:'Relations fall by 5.',relation:-5},
      {id:'counter',label:'Publish counter-accusations',detail:'Gain 8 influence; relations fall by 10.',relation:-10,influenceGain:8},
    ],{critical:true,kind:'inspection',target:rival,defaultOption:'deny',defaultText:'Deny inspection access; relations with the requesting government fall by 5.'});
  }
  if(s.campaignId!=='campaign_1922'&&s.player==='USA'&&s.day>=Date.parse('1936-11-03T00:00:00Z')/DAY)queueDecision(s,'us-election','The fifth term ends, or it does not','The next estimate has become an argument about yard employment and the price of the battle line.',[
    {id:'jobs',label:'Defend the yard appropriations',detail:'Spend 10 influence. Gain 4,000 industry.',influence:10,industryGain:4000},
    {id:'support',label:'Broaden the political coalition',detail:'Spend 3,000 gold. Gain 16 influence.',gold:3000,influenceGain:16},
    {id:'defer',label:'Keep the existing estimate',detail:'No immediate change.'},
  ]);
  if(s.player==='JPN'&&year>=1938)queueDecision(s,'jp-aircraft','The 1938 aircraft bet','A navy that knows deck operations must decide how much to spend converting that experience into combat aviation.',[
    {id:'aviation',label:'Fund the aviation program',detail:'Queue the next naval aviation development at its current price.',program:'aviation'},
    {id:'training',label:'Concentrate on fleet training',detail:'Queue a training cycle at its current price.',program:'training'},
    {id:'defer',label:'Retain the current air groups',detail:'Keep the resources available.'},
  ]);
}
export function chooseDecision(s,content,key,optionId,{automatic=false}={}){const d=s.decisions.find(d=>d.key===key),o=d?.options.find(o=>o.id===optionId);if(!o)throw new Error('That decision is no longer available.');if(!validDecision(s,d)){normalizeDecisions(s);throw new Error('This demand has lapsed because the treaty or diplomatic situation changed.');}const n=s.nations[s.player];
  if(o.program)startProject(s,o.program);else spend(n,{gold:o.gold||0,influence:o.influence||0,industry:o.industry||0});
  applyPoliticalDecision(s,content,d,o);
  if(o.vanilla)apply1922Decision(s,content,o.vanilla);
  if(o.priority)n.priority=o.priority;
  if(o.relation){const r=s.relations[pairKey(s.player,d.target||n.rival)];r.score=clamp(r.score+o.relation,-100,100);r.pressure=clamp(r.pressure-o.relation,0,100);}
  n.influence=clamp(n.influence+(o.influenceGain||0),0,500);n.industry+=o.industryGain||0;n.morale=clamp(n.morale+(o.morale||0),0,100);
  if(o.reveal){n.treatyPolicy='disclose';for(const g of n.groups)g.covert=false;}
  if(key==='expiry'&&optionId==='renew'){spend(n,{gold:0,influence:30,industry:0});s.treatyUntil=s.day+1095;n.treatyPolicy='disclose';for(const r of Object.values(s.relations))if([r.a,r.b].includes(s.player))r.score=clamp(r.score+8,-100,100);}
  s.completedEvents.push(key);s.decisions=s.decisions.filter(x=>x.key!==key);addLog(s,`${d.title}: ${o.label}.`,'cabinet');s.log[0].dismissed=true;if(automatic)addAlert(s,'Deadline reached: '+d.title,o.label+'. '+o.detail,'cabinet');normalizeDecisions(s);
}
export function campaignScores(s,content){return Object.keys(s.nations).map(id=>{const n=s.nations[id],power=fleetPower(s,content,id).total,base=s.initial?.[id]?.power||power;const strength=Math.round(clamp(power/Math.max(1,base),0,3)*150),economy=Math.round(n.commerce*2+upgradeLevel(n.tech,'industry')*30),readinessScore=Math.round((n.training+n.morale+n.logistics)*0.8),war=Math.round(n.battlesWon*20-n.battlesLost*12+Math.min(150,n.sunkTons/1000));return {id,score:strength+economy+readinessScore+war,power,commerce:n.commerce,strength,economy,readiness:readinessScore,war};}).sort((a,b)=>b.score-a.score);}
