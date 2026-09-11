import { PACT_EVENTS } from './war-politics.mjs';
export function validatePolitics(s){
 const fail=()=>{throw Error('Invalid diplomacy, warning or pact state in save.');},plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v),finite=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b,minute=v=>finite(v,-1e9,3e9),text=(v,max=200)=>typeof v==='string'&&v.length<=max,nation=id=>!!s.nations[id];
 if(s.diplomacyRevision!==1||!Array.isArray(s.pacts)||s.pacts.length>500||!plain(s.warningMonths)||!['europe','italy','east'].every(k=>Number.isInteger(s.warningMonths[k])&&finite(s.warningMonths[k],1,12))||!minute(s.nextDiplomaticAt))fail();
 if(s.nextHistoricalWarningAt!==undefined&&!minute(s.nextHistoricalWarningAt))fail();
 for(const r of Object.values(s.relations)){
  if(!finite(r.pressure,0,100)||r.warning===undefined)fail();
  if(r.warning!==null){const w=r.warning;if(!plain(w)||!text(w.id)||!minute(w.startedAt)||!minute(w.endsAt)||w.endsAt<=w.startedAt||!Number.isInteger(w.months)||!finite(w.months,1,12)||!text(w.reason,1000)||typeof w.scripted!=='boolean'||![r.a,r.b].includes(w.aggressor)||r.war||r.allied)fail();}
  if(r.lastRelationChange!==null){const v=r.lastRelationChange;if(!plain(v)||!['historical','treaty','total','applied'].every(k=>finite(v[k],-10,10))||!text(v.note,500)||!finite(v.day,-100000,2000000))fail();}
 }
 for(const p of s.pacts)if(!plain(p)||!text(p.id)||!text(p.name)||!['defensive','political','consultation'].includes(p.kind)||typeof p.active!=='boolean'||!Array.isArray(p.members)||!p.members.length||p.members.length>7||new Set(p.members).size!==p.members.length||!p.members.every(nation)||!finite(p.since,-100000,2000000))fail();
 for(const d of s.decisions){if(d.popup!==undefined&&typeof d.popup!=='boolean'||d.forcePause!==undefined&&typeof d.forcePause!=='boolean')fail();if(d.popup&&(!d.critical||!d.forcePause))fail();if(d.kind==='call-to-arms'&&(!nation(d.target)||!nation(d.enemy)||d.target===d.enemy||[d.target,d.enemy].includes(s.player)))fail();if(d.pactEvent&&!PACT_EVENTS.some(e=>e.id===d.pactEvent))fail();}
 return true;
}
