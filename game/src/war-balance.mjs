import { PROFILES, NATION_ORDER } from './catalog.mjs';
const key=(a,b)=>[a,b].sort().join('-');
function ledger(r){if(!r.record||r.record.since!==r.warSince)r.record={since:r.warSince,sides:{[r.a]:{sunk:0,damage:0,merchantGRT:0},[r.b]:{sunk:0,damage:0,merchantGRT:0}}};return r.record;}
export function recordWarBattle(s,report){const r=s.relations[key(report.a,report.b)];if(!r?.war)return;const l=ledger(r);for(const [id,loss]of [[report.a,report.resultB],[report.b,report.resultA]]){l.sides[id].sunk+=loss.tons;l.sides[id].damage+=loss.damagedTons+(id===report.a?(report.portEquivalent||0):0);}}
export function recordWarRaid(s,a,b,grt){const r=s.relations[key(a,b)];if(r?.war)ledger(r).sides[a].merchantGRT+=grt;}
export function warBalances(s,id=s.player){return Object.values(s.relations).filter(r=>r.war&&[r.a,r.b].includes(id)).map(r=>{
  const opponent=r.a===id?r.b:r.a,l=r.record?.since===r.warSince?r.record.sides:null,zero={sunk:0,damage:0,merchantGRT:0},own=l?.[id]||zero,enemy=l?.[opponent]||zero;
  const value=x=>x.sunk+x.damage*.35+x.merchantGRT*.15,naval=value(own)-value(enemy);
  const fronts=(s.world?.fronts||[]).filter(f=>[f.attacker,f.id==='france'?'FRA':f.defender].includes(id)&&[f.attacker,f.id==='france'?'FRA':f.defender].includes(opponent));
  const land=fronts.reduce((v,f)=>v+(f.attacker===id?1:-1)*(f.progress-(f.initial||0))*20000*(f.island?Math.min(1,f.days/60):1),0),score=naval+land,threshold=Math.max(2000,(value(own)+value(enemy))*.1);
  const result=score>threshold?'Leading':score< -threshold?'Trailing':'Even';
  return {opponent,name:PROFILES[opponent].name,result,winner:result==='Even'?null:score>0?id:opponent,naval,land,score,own,enemy,fronts:fronts.length};
}).sort((a,b)=>NATION_ORDER.indexOf(a.opponent)-NATION_ORDER.indexOf(b.opponent));}
