import { PROFILES } from './catalog.mjs';
import { campaignMinutes } from './campaign-clock.mjs';
import { relationKey, openingRelation, historicalPressure, relationChanges, warningRisk, scheduledWarningOnly } from './diplomacy-history.mjs';
import { addLog, addAlert, queueDecision, rng, fleetPower } from './engine.mjs';
import { invalidateOperations } from './task-forces.mjs';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),names=ids=>ids.map(id=>PROFILES[id].name).join(' / ');
const at=iso=>Date.parse(iso)/60000;
const date=minute=>new Date(minute*60000).toISOString().slice(0,10);
export function addCalendarMonths(minute,months){const d=new Date(minute*60000),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+months);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.getTime()/60000;}
export const WAR_WARNING_TEXTS=[
 ['Intelligence uncovers war preparations','Intercepted orders and reports from our attachés point to mobilization. The cabinet considers armed conflict unavoidable.'],
 ['A warning delivered through diplomatic channels','The opposing government has warned that its preparations will lead to hostilities. Its envoys are arranging the remaining formalities.'],
 ['Our government issues a final warning','The cabinet has committed to armed action. The navy has been given time to assemble crews, complete urgent work and secure its shipping.'],
 ['Public pressure for war','Demonstrations, press campaigns and parliamentary demands have hardened both governments. Mobilization is replacing negotiation.'],
 ['Embassies prepare to evacuate','Diplomats are arranging the departure of dependents and essential records. The ministries expect the remaining peace to be temporary.'],
 ['Merchant traffic receives confidential instructions','Insurers and shipping ministries have circulated emergency routing orders. Discreet preparations reveal a coming break in relations.'],
 ['Reservists receive their summons','Recruiting offices are recalling trained men and transport authorities are reserving military lift. The warning signs now form a clear pattern.'],
 ['A border crisis reaches the cabinets','A confrontation ashore has become a question of national prestige. Government planning now assumes war, even though fleets have not yet received combat orders.']
];
export function dispatchPopup(s,key,title,body,kind='diplomacy',options=null,meta={}){
 queueDecision(s,key,title,body,options||[{id:'acknowledge',label:kind==='war-warning'?'Prepare the navy':'Acknowledge',detail:kind==='war-warning'?'Review construction, funding, fleet missions and shipping before hostilities.':'Return to the ministry.'}],{critical:true,popup:true,forcePause:true,kind,...meta});
}
export function initializeDiplomacy(s){
 if(s.diplomacyRevision===1)return;
 s.diplomacyRevision=1;s.pacts=[];s.nextDiplomaticAt=campaignMinutes(s);
 const salt=s.seed>>>0;s.warningMonths={europe:1+(salt%12),italy:1+((salt>>>5)%12),east:1+((salt>>>11)%12)};
 for(const r of Object.values(s.relations)){const h=openingRelation(s,r.a,r.b);r.score=h.score;r.pressure=historicalPressure(s,r);r.warning=null;r.lastRelationChange=null;}
 s.pacts.push({id:'comintern',name:'Communist International',members:['SOV'],kind:'political',since:s.day,active:true});
 if(s.campaignId==='campaign_1922'){
  s.relations[relationKey('GBR','JPN')].allied=true;
  s.pacts.push({id:'anglo-japanese-original',name:'Anglo-Japanese alliance',members:['GBR','JPN'],kind:'defensive',since:s.day,active:true});
 }else s.pacts.push({id:'franco-soviet-1935',name:'Franco-Soviet mutual-assistance treaty',members:['FRA','SOV'],kind:'consultation',since:s.day,active:true});
}
export function alliancePartners(s,id){return Object.values(s.relations).filter(r=>r.allied&&!r.war&&[r.a,r.b].includes(id)).map(r=>r.a===id?r.b:r.a);}
export function endAlliance(s,a,b){const r=s.relations[relationKey(a,b)];if(r)r.allied=false;invalidateOperations(s);for(const pact of s.pacts||[])if(pact.kind==='defensive'&&pact.members.includes(a)&&pact.members.includes(b))pact.active=false;}
export function formAlliance(s,a,b,{name,announce=true,record=true}={}){
 const r=s.relations[relationKey(a,b)];if(!r||r.war||r.warning)return false;
 r.allied=true;invalidateOperations(s);r.pressure=Math.max(0,r.pressure-25);
 name??=relationKey(a,b)==='GBR-JPN'?'The Anglo-Japanese alliance returns':names([a,b])+' naval alliance';
 if(record)s.pacts.push({id:'naval-pact-'+s.nextId++,name,members:[a,b].sort(),kind:'defensive',since:s.day,active:true});
 if(announce)dispatchPopup(s,'alliance-'+s.nextId++,name,names([a,b])+' have signed a naval defense agreement. Friendly ports and local support are shared. If a partner is attacked, the other government receives a defensive call to arms; joining is a decision, not automatic.');
 // A mutual three-power pact requires all three bilateral commitments.
 for(const third of record?Object.keys(s.nations).filter(id=>id!==a&&id!==b):[])if(alliancePartners(s,a).includes(third)&&alliancePartners(s,b).includes(third)){
  const members=[a,b,third].sort(),id='three-power-'+members.join('-');
  if(!s.pacts.some(p=>p.id===id&&p.active)){s.pacts.push({id,name:'Three-power naval alliance',members,kind:'defensive',since:s.day,active:true});if(announce)dispatchPopup(s,'three-pact-'+s.nextId++,'Three-power naval alliance',names(members)+' now maintain mutual naval defense agreements. Each member may answer a defensive call to arms.');}
 }
 return true;
}
export function activePacts(s){
 const unique=new Map();for(const p of s.pacts||[])if(p.active)unique.set(p.name+'|'+p.members.slice().sort().join(),p);
 const all=[...unique.values()],visible=all.filter(p=>p.kind!=='defensive'||!all.some(q=>q.kind==='defensive'&&q.members.length>p.members.length&&p.members.every(id=>q.members.includes(id))));
 // A partial withdrawal ends the named pact, but unrelated bilateral commitments survive.
 for(const r of Object.values(s.relations))if(r.allied&&!r.war&&!visible.some(p=>p.kind==='defensive'&&p.members.includes(r.a)&&p.members.includes(r.b)))visible.push({id:'remaining-'+relationKey(r.a,r.b),name:names([r.a,r.b])+' naval alliance',members:[r.a,r.b],kind:'defensive',active:true,since:s.day});
 return visible;
}
export function beginWarWarning(s,c,a,b,{months,endsAt,reason='Relations and strategic pressure have passed the point of compromise.',scripted=false,aggressor=a,popup=true}={}){
 const r=s.relations[relationKey(a,b)];if(!r||r.war||r.warning)return r?.warning||null;
 const now=campaignMinutes(s);months??=1+Math.floor(rng(s)*12);endsAt??=addCalendarMonths(now,months);
 const variant=WAR_WARNING_TEXTS[Math.floor(rng(s)*WAR_WARNING_TEXTS.length)];
 r.warning={id:'warning-'+s.nextId++,startedAt:now,endsAt,months,reason,scripted,aggressor};r.pressure=Math.max(50,r.pressure);endAlliance(s,a,b);
 const title=names([a,b])+': war warning';
 const body=variant[0]+'. '+variant[1]+' '+reason+' The outbreak date is unknown. Prepare now: this warning cannot be canceled by improving relations.';
 addLog(s,title+'. '+body,'diplomacy');s.log[0].dismissed=true;addAlert(s,title,body,'war-warning',{a,b,warningId:r.warning.id,popupKey:r.warning.id,global:true});
 if(popup)dispatchPopup(s,r.warning.id,title,body,'war-warning');
 s.nextDiplomaticAt=Math.min(s.nextDiplomaticAt??endsAt,endsAt);return r.warning;
}
function requestDefensiveCalls(s,c,attacker,defender){
 for(const ally of alliancePartners(s,defender)){
  if(ally===attacker||s.relations[relationKey(ally,attacker)]?.war)continue;
  const r=s.relations[relationKey(ally,defender)],hostileAlly=s.relations[relationKey(ally,attacker)]?.allied;
  if(ally===s.player){dispatchPopup(s,'call-'+s.nextId++,'Defensive call to arms',PROFILES[defender].name+' asks you to join its defensive war against '+PROFILES[attacker].name+'. Acceptance joins this existing war immediately; there is no second mobilization delay.', 'call-to-arms',[
   {id:'join',label:'Honor the defensive agreement',detail:'Enter the war immediately in support of your ally.'},
   {id:'refuse',label:'Refuse the call',detail:'End this alliance, lose 35 relations with this ally and up to 10 influence.'}
  ],{target:defender,enemy:attacker,defaultOption:'refuse',defaultText:'Refuse the call: the alliance ends, relations fall by 35 and influence falls by up to 10.'});continue;}
  const n=s.nations[ally],ownWars=Object.values(s.relations).filter(x=>x.war&&[x.a,x.b].includes(ally)).length;
  const chance=clamp(.35+r.score*.005-ownWars*.15-(n.gold<1000?.25:0),.1,.95);
  if(!hostileAlly&&rng(s)<chance)commenceWar(s,c,ally,attacker,{reason:'Honoring the defensive agreement with '+PROFILES[defender].name,aggressor:attacker,called:true});
  else{endAlliance(s,ally,defender);r.score=clamp(r.score-35,-100,100);n.influence=Math.max(0,n.influence-10);addAlert(s,'An ally refuses the call',PROFILES[ally].name+' declined to defend '+PROFILES[defender].name+'. Their naval alliance has ended.','diplomacy');}
 }
}
export function commenceWar(s,c,a,b,{reason='The preparation period has ended.',aggressor=a,called=false}={}){
 const r=s.relations[relationKey(a,b)];if(!r||r.war)return false;
 if(r.warning){s.alerts=s.alerts.filter(x=>x.warningId!==r.warning.id);s.decisions=s.decisions.filter(d=>d.key!==r.warning.id);}
 r.war=true;endAlliance(s,a,b);r.warning=null;r.warSince=s.day;r.truceUntil=s.day;r.score=Math.min(-30,r.score);r.pressure=100;
 for(const id of [a,b]){const n=s.nations[id];n.rival=id===a?b:a;if(id!==s.player){const p=fleetPower(s,c,id);n.priority=p.sub>p.surface?'raid':'presence';n.focus=PROFILES[n.rival].home;}}
 const title=names([a,b])+': war begins',body=reason+' Hostilities have commenced. Your fleets retain their missions; review convoy protection, repairs and industrial funding.';
 const popupKey='declaration-'+s.nextId++;addLog(s,title+'. '+reason,'war');s.log[0].dismissed=true;addAlert(s,title,body,'war',{a,b,popupKey,global:true});dispatchPopup(s,popupKey,title,body,'war');invalidateOperations(s);
 if(!called)requestDefensiveCalls(s,c,aggressor,aggressor===a?b:a);return true;
}
export function diplomaticPressure(s,r,action){const amount={visit:-4,cooperate:-12,insult:5,provoke:25}[action]||0;r.pressure=clamp(r.pressure+amount,0,100);}
export function monthlyRelations(s,c){
 for(const r of Object.values(s.relations)){
  const change=relationChanges(s,r),before=r.score;r.score=clamp(r.score+change.total,-100,100);r.lastRelationChange={...change,applied:r.score-before,day:s.day};
  if(!r.war&&!r.warning)r.pressure=clamp(r.pressure+(historicalPressure(s,r)-r.pressure)*.2,0,100);
  if(r.allied&&r.score<20){endAlliance(s,r.a,r.b);addLog(s,names([r.a,r.b])+' dissolved their naval alliance.','diplomacy');}
  if(!scheduledWarningOnly(s,r)&&rng(s)<warningRisk(s,r))beginWarWarning(s,c,r.a,r.b);
 }
}

export const PACT_EVENTS=[
 {id:'axis-friendship',at:at('1936-10-25T12:00:00Z'),name:'The Rome-Berlin Axis',members:['DEU','ITA'],kind:'political',body:'Berlin and Rome propose a common foreign-policy alignment. This is political cooperation, not an automatic commitment to every war.'},
 {id:'anti-comintern',at:at('1936-11-25T12:00:00Z'),name:'The Anti-Comintern Pact',members:['DEU','JPN'],kind:'political',body:'Germany and Japan propose cooperation against the Communist International. The agreement increases political alignment without creating unrestricted naval defense obligations.'},
 {id:'anti-comintern-italy',at:at('1937-11-06T12:00:00Z'),name:'Italy joins the Anti-Comintern alignment',members:['DEU','JPN','ITA'],kind:'political',requires:'anti-comintern',body:'Italy is invited into the existing anti-Comintern alignment. Political cooperation does not itself make every member a belligerent.'},
 {id:'steel',at:at('1939-05-22T12:00:00Z'),name:'The Pact of Steel',members:['DEU','ITA'],kind:'defensive',body:'Germany and Italy propose a military alliance. In this game, defensive calls require a response; a partner’s offensive war does not compel automatic entry.'},
 {id:'tripartite',at:at('1940-09-27T12:00:00Z'),name:'The Tripartite Pact',members:['DEU','ITA','JPN'],kind:'defensive',body:'Germany, Italy and Japan propose a three-power alliance. Signing creates mutual naval access and defensive calls to arms. Existing wars do not automatically spread to every member.'}
];
function canSign(s,event){return !!event&&event.members.every(a=>event.members.every(b=>a===b||!s.relations[relationKey(a,b)].war&&!s.relations[relationKey(a,b)].warning))&&(!event.requires||s.pacts.some(p=>p.id===event.requires&&p.active));}
function signPact(s,event){
 if(!canSign(s,event))return false;
 for(let i=0;i<event.members.length;i++)for(let j=i+1;j<event.members.length;j++){const a=event.members[i],b=event.members[j],r=s.relations[relationKey(a,b)];r.score=clamp(r.score+20,-100,100);r.pressure=Math.max(0,r.pressure-10);if(event.kind==='defensive')formAlliance(s,a,b,{name:event.name,announce:false,record:false});}
 s.pacts.push({id:event.id,name:event.name,members:event.members,kind:event.kind,since:s.day,active:true});
 if(event.id.startsWith('anti-comintern'))for(const id of event.members){const r=s.relations[relationKey(id,'SOV')];r.score=clamp(r.score-8,-100,100);r.pressure=clamp(r.pressure+8,0,100);}
 addAlert(s,event.name+' signed',names(event.members)+'. '+event.body,'diplomacy');return true;
}
export function politicsTick(s,c){
 const now=campaignMinutes(s);if(now<(s.nextDiplomaticAt??-Infinity))return;
 let next=now+1440;
 for(const r of Object.values(s.relations))if(r.warning&&!r.warning.scripted){if(now>=r.warning.endsAt){const w=r.warning;commenceWar(s,c,r.a,r.b,{reason:w.reason,aggressor:w.aggressor});}else next=Math.min(next,r.warning.endsAt);}
 if(s.campaignId==='campaign_1922'&&!s.completedEvents.includes('anglo-japanese-expiry')){
  const expiry=at('1923-08-17T00:00:00Z');if(now>=expiry){s.completedEvents.push('anglo-japanese-expiry');endAlliance(s,'GBR','JPN');dispatchPopup(s,'washington-four-power','The Anglo-Japanese alliance ends','The Four-Power Treaty enters into force, replacing the bilateral Anglo-Japanese alliance with consultation. Naval port access and defensive obligations under the old alliance end. A new alliance may still be negotiated.');}else next=Math.min(next,expiry);
 }
 for(const event of PACT_EVENTS)if(!s.completedEvents.includes('pact-event-'+event.id)&&!s.decisions.some(d=>d.pactEvent===event.id)){
  if(now<event.at){next=Math.min(next,event.at);continue;}
  s.completedEvents.push('pact-event-'+event.id);
  if(!canSign(s,event)){addLog(s,event.name+' did not form: current wars or commitments prevent agreement.','diplomacy');continue;}
  if(event.members.includes(s.player))dispatchPopup(s,'pact-choice-'+event.id,event.name,event.body,'pact',[
   {id:'sign',label:'Sign the agreement',detail:'+20 relations among signatories. '+(event.kind==='defensive'?'Mutual naval access and defensive calls to arms.':'Political alignment only; no automatic war entry.')},
   {id:'decline',label:'Remain outside the agreement',detail:'The proposed agreement does not form. No resource cost.'}
  ],{pactEvent:event.id,defaultOption:'decline',defaultText:'Remain outside the proposed agreement.'});
  else if(signPact(s,event))dispatchPopup(s,'pact-news-'+event.id,event.name+' signed',names(event.members)+'. '+event.body);
 }
 s.nextDiplomaticAt=next;
}
export function historicalWarnings(s,c){
 const now=campaignMinutes(s);if(now<(s.nextHistoricalWarningAt??-Infinity))return;
 const t=s.timeline,offset=s.campaignId==='campaign_1922'?t.offsetDays*1440:0;
 const plans=[
  ['europe',t.britainAt,[['DEU','GBR'],['DEU','FRA']],t.europeOccurred,'European mobilization and the Polish crisis have reached the final preparation stage.'],
  ['italy',at('1940-06-10T16:00:00Z')+offset,[['ITA','GBR'],['ITA','FRA']],s.completedEvents.includes('italian-entry'),'Italy is preparing to enter the European war.'],
  ['east',at('1941-06-22T01:00:00Z')+offset,[['DEU','SOV'],['ITA','SOV']],s.completedEvents.includes('barbarossa'),'Intelligence reports preparations for an attack on the Soviet Union.']
 ];
 let next=now+1440;
 for(const [key,endsAt,pairs,occurred,reason]of plans){
  if(occurred)continue;const months=s.warningMonths[key],start=addCalendarMonths(endsAt,-months);
  if(now<start){next=Math.min(next,start);continue;}
  if(key==='europe')t.europeWarningLocked=true;
  for(const [a,b]of pairs)if(!s.relations[relationKey(a,b)].war&&!s.relations[relationKey(a,b)].warning)beginWarWarning(s,c,a,b,{months,endsAt,reason,scripted:true,aggressor:a});
 }
 s.nextHistoricalWarningAt=next;
}
export function validPoliticalDecision(s,d){
 if(d.kind==='call-to-arms')return !!s.relations[relationKey(d.target,d.enemy)]?.war&&!!s.relations[relationKey(s.player,d.target)]?.allied&&!s.relations[relationKey(s.player,d.enemy)]?.war;
 if(d.pactEvent)return canSign(s,PACT_EVENTS.find(e=>e.id===d.pactEvent));
 return true;
}
export function applyPoliticalDecision(s,c,d,o){
 if(d.kind==='call-to-arms'){
  if(o.id==='join')commenceWar(s,c,s.player,d.enemy,{reason:'Honoring the defensive agreement with '+PROFILES[d.target].name,aggressor:d.enemy,called:true});
  else{const r=s.relations[relationKey(s.player,d.target)];endAlliance(s,s.player,d.target);r.score=clamp(r.score-35,-100,100);s.nations[s.player].influence=Math.max(0,s.nations[s.player].influence-10);}
 }
 if(d.pactEvent&&o.id==='sign')signPact(s,PACT_EVENTS.find(e=>e.id===d.pactEvent));
}
