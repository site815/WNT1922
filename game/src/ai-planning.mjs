import { economyFor, AIRCRAFT_YEAR } from './balance.mjs';
import { upgradeLevel } from './levels.mjs';
import { sailorSummary } from './ship-staffing.mjs';
import { aircraftSummary } from './naval-resources.mjs';
import { fleetService } from './catalog.mjs';

// Provisional doctrine preferences, constrained by the same catalogs and rules as the player.
const DOCTRINES={
 GBR:{roles:{DD:40,CL:14,CA:10,BB:12,CV:14,SS:10},programs:['logistics','asw','training','standardization','intelligence']},
 USA:{roles:{DD:36,CL:12,CA:12,BB:18,CV:14,SS:8},programs:['industry','standardization','gunnery','aviation','damage_control']},
 JPN:{roles:{DD:35,CL:10,CA:12,BB:8,CV:23,SS:12},programs:['training','pilots','aviation','standardization','logistics']},
 FRA:{roles:{DD:32,CL:18,CA:10,BB:3,CV:12,SS:25},programs:['intelligence','aviation','asw','training','logistics']},
 ITA:{roles:{DD:34,CL:18,CA:16,BB:16,CV:6,SS:10},programs:['logistics','gunnery','training','aviation','damage_control']},
 DEU:{roles:{DD:12,CL:6,CA:8,BB:0,CV:0,SS:74},programs:['intelligence','logistics','standardization','training','damage_control']},
 SOV:{roles:{DD:33,CL:13,CA:7,BB:20,CV:17,SS:10},programs:['industry','school','gunnery','aviation','standardization']},
};
export const aiRole=type=>({BC:'BB',CVL:'CV',DE:'DD',DL:'DD',TB:'DD',SM:'SS'}[type]||type);
export function aiDoctrine(s,id){
 const base=DOCTRINES[id];if(s.campaignId!=='campaign_1922')return base;
 const year=new Date(s.day*86400000).getUTCFullYear();
 // The historical opening does not silently inherit the 1936 alternate programs.
 const historical={FRA:{DD:35,CL:15,CA:12,BB:14,CV:6,SS:18},DEU:{DD:38,CL:18,CA:15,BB:10,CV:0,SS:19},SOV:{DD:40,CL:18,CA:5,BB:10,CV:2,SS:25}};
 return {...base,roles:historical[id]||{...base.roles,CV:year<1930?Math.min(6,base.roles.CV):base.roles.CV}};
}
export function aiNeeds(s,c,id){
 const n=s.nations[id],crew=sailorSummary(s,c,id),air=aircraftSummary(s,c,id),counts={},pipelineCrew=n.groups.filter(g=>['building','trials','converting'].includes(g.status)).reduce((v,g)=>v+c.classes[g.classId].crew*g.count,0);
 for(const g of n.groups){if(!g.count||['sunk','scrapped'].includes(g.status))continue;const cl=c.classes[g.classId],role=aiRole(cl.type);counts[role]=(counts[role]||0)+g.count*(g.status==='reserve'?.5:1);}
 const total=Object.entries(counts).filter(([role])=>['DD','CL','CA','BB','CV','SS'].includes(role)).reduce((v,[,count])=>v+count,0),war=Object.values(s.relations).some(r=>r.war&&[r.a,r.b].includes(id));
 const airTarget=Math.max(24,Math.ceil((air.required+air.shoreRequired)*(war?1.5:1.2))),crewTarget=pipelineCrew*.6+n.crewYear*.5;
 return {counts,total,crew,air,airTarget,crewTarget,pipelineCrew,war};
}
export function aiReserve(s,id){const n=s.nations[id],e=economyFor(s,id);return {gold:e.goldYear*.12,industry:e.industryYear*.05,influence:12};}
export function aiCanSpend(s,id,price,{emergency=false}={}){const n=s.nations[id],reserve=aiReserve(s,id);return ['gold','industry','influence'].every(k=>n[k]-(price[k]||0)>=reserve[k]*(emergency?.35:1));}
export function aiFunding(s,c,id,needs=aiNeeds(s,c,id)){
 const n=s.nations[id],e=economyFor(s,id),tight=n.gold<e.goldYear*.08||n.industry<e.industryYear*.02;
 n.industryFunding=n.gold<e.goldYear*.025?.3:1;
 n.schoolFunding=needs.crew.balance<needs.crewTarget?1:needs.crew.balance<needs.crewTarget*2?.3:.1;
 n.aviatorFunding=needs.air.aviatorBalance<Math.max(n.aviatorsYear,needs.air.aviatorsRequired*.25)?1:.1;
 const annual=AIRCRAFT_YEAR[id]*(1+upgradeLevel(n.tech,'aircraft_factory')*.35),gap=Math.max(0,needs.airTarget-needs.air.total);
 n.aircraftFunding=Math.max(.1,Math.min(1,Math.ceil(gap/Math.max(1,annual)*20)/10));
 if(needs.air.aviatorBalance<0&&needs.air.total>=needs.air.required)n.aircraftFunding=.1;
 if(tight){n.aircraftFunding=.1;n.schoolFunding=Math.min(n.schoolFunding,.5);n.aviatorFunding=Math.min(n.aviatorFunding,.5);}
}
export function aiHullScore(s,c,id,cl,needs=aiNeeds(s,c,id)){
 const role=aiRole(cl.type),d=aiDoctrine(s,id),count=needs.counts[role]||0;
 if(fleetService(cl)==='merchant')return 0;
 if(['AO','AD'].includes(role)){const surface=s.nations[id].fleets.filter(f=>['carrier','battle','cruiser'].includes(f.role)).length,target=Math.max(1,Math.ceil(surface/(role==='AO'?4:6)));return count<target?2+(target-count)*2:0;}
 let weight=d.roles[role]||0;if(!weight)return 0;
 const screens=(needs.counts.DD||0),required=(needs.counts.CV||0)*3+(needs.counts.BB||0)*1.5;
 if(role==='DD'&&screens<required)weight*=3;
 if(['CV','BB'].includes(role)&&(needs.crew.balance+needs.pipelineCrew*.4<cl.crew||screens<required))weight*=.15;
 const age=Math.max(0,new Date(s.day*86400000).getUTCFullYear()-cl.year);
 return weight/100*(needs.total+12)/(count+1)*(1-age*.015);
}
export function aiResearchScores(s,c,id,needs,shipping,yards){
 const n=s.nations[id],scores={training:n.training<75?10:1,logistics:shipping.logistics<75?8:1,damage_control:needs.war?6:2,intelligence:3,influence:n.influence<30?6:1,school:needs.crew.balance<needs.crewTarget?12:0,pilots:needs.air.aviatorBalance<n.aviatorsYear?11:0,aircraft_factory:needs.air.total<needs.airTarget&&needs.air.aviatorBalance>0?5:0,industry:yards.factor>1.15||n.industry<economyFor(s,id).industryYear*.2?7:2,radar:4,asw:needs.war?5:2,aviation:needs.counts.CV?4:0,gunnery:needs.counts.BB?4:1,standardization:4};
 aiDoctrine(s,id).programs.forEach((key,i)=>scores[key]=(scores[key]||0)+(5-i)*.5);
 return scores;
}
export function aiMission(s,id,f){
 const wars=Object.values(s.relations).filter(r=>r.war&&[r.a,r.b].includes(id));
 if(f.role==='submarine')return wars.length?'raid':'presence';
 if(f.role==='escort')return 'guard';
 if(!wars.length)return 'presence';
 if(id==='DEU'&&s.campaignId!=='campaign_1922')return 'raid';
 if(f.role==='cruiser')return (f.salt%3===0&&['JPN','ITA','FRA'].includes(id))?'siege':f.salt%2?'guard':'decisive';
 if(f.role==='carrier')return f.salt%3===0?'anchorage':'decisive';
 return f.salt%3===0?'siege':'decisive';
}
