import { campaignMinutes } from './campaign-clock.mjs';
export const RESULT_ALERT_MINUTES=48*60;
export function trimAlerts(s){
 const active=s.alerts.filter(a=>a.frontId&&a.resolvedAt==null);
 const keep=new Set(active);s.alerts=[...active,...s.alerts.filter(a=>!keep.has(a)).slice(0,100-active.length)].sort((a,b)=>b.minute-a.minute);
}
export function alertVisible(s,a){
 if(a.dismissed)return false;
 if(a.frontId)return a.resolvedAt==null||campaignMinutes(s)-a.resolvedAt<RESULT_ALERT_MINUTES;
 return !['battle','convoy'].includes(a.kind)||campaignMinutes(s)-(a.minute??a.day*1440)<RESULT_ALERT_MINUTES;
}
// One notice follows an offensive from opening through resolution. A later
// offensive receives a fresh notice; the older result keeps its own deadline.
export function recordFrontAlert(s,title,body,{frontId,resolvedAt=null,startedAt}={}){
 s.alerts??=[];
 let a=s.alerts.find(a=>a.frontId===frontId&&a.resolvedAt==null);
 if(!a){a={id:s.nextId++,minute:campaignMinutes(s),kind:'land',frontId,startedAt:startedAt??campaignMinutes(s)};s.alerts.unshift(a);}
 Object.assign(a,{title,body,resolvedAt,minute:campaignMinutes(s)});
 // Resolution deserves to be seen even if the initial notice was dismissed.
 if(resolvedAt!==null)a.dismissed=false;
 trimAlerts(s);
}
