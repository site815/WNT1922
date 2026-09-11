export const MINUTES_PER_DAY = 1440;
export const CAPITALS = {
  FRA:{name:'Paris',zone:'Europe/Paris'},ITA:{name:'Rome',zone:'Europe/Rome'},SOV:{name:'Moscow',zone:'Europe/Moscow'},
  JPN:{name:'Tokyo',zone:'Asia/Tokyo'}, USA:{name:'Washington',zone:'America/New_York'},
  GBR:{name:'London',zone:'Europe/London'}, DEU:{name:'Berlin',zone:'Europe/Berlin'},
};
export const minutesAt = iso => Date.parse(iso)/60000;
export const campaignMinutes = s => s.day*1440+s.fraction*1440;
export const canonicalMinute=minute=>Math.abs(minute-Math.round(minute))<1e-6?Math.round(minute):minute;
export function setCampaignMinutes(s,minute){
  // Canonicalize floating point frame accumulation at minute boundaries. This
  // prevents processing the same operational minute twice in adjacent frames.
  minute=canonicalMinute(minute);
  s.day=Math.floor(minute/1440);
  s.fraction=Math.max(0,(minute-s.day*1440)/1440);
}
const formatters=new Map();
export function capitalClock(s,id=s.player,minute=campaignMinutes(s)){
  const capital=CAPITALS[id];
  if(!formatters.has(id))formatters.set(id,new Intl.DateTimeFormat('en-GB',{timeZone:capital.zone,day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZoneName:'shortOffset'}));
  const parts=Object.fromEntries(formatters.get(id).formatToParts(new Date(Math.floor(minute+1e-7)*60000)).map(p=>[p.type,p.value]));
  return {date:`${parts.day} ${parts.month} ${parts.year}`,time:`${parts.hour}:${parts.minute}`,zone:parts.timeZoneName,capital:capital.name};
}
export const HISTORICAL_POLAND=minutesAt('1939-09-01T03:45:00Z');
export const HISTORICAL_BRITAIN=minutesAt('1939-09-03T10:00:00Z');
export function openingTimeline(seed,campaignId='in_good_faith_1936'){
  // Separate from the evolving economic/combat RNG: orders cannot move history.
  const offsetDays=campaignId==='campaign_1922'?0:((Math.imul(seed^0x39b1939,2654435761)>>>0)%121)-60;
  return {offsetDays,polandAt:HISTORICAL_POLAND+offsetDays*1440,britainAt:HISTORICAL_BRITAIN+offsetDays*1440,polandOccurred:false,europeOccurred:false};
}
export function adjustEuropeanTimeline(s){
  if(s.campaignId!=='campaign_1922'||(s.timeline.polandOccurred||s.timeline.europeWarningLocked))return;
  const relationships=Object.values(s.relations).filter(r=>[r.a,r.b].includes('DEU'));
  const tension=relationships.reduce((v,r)=>v+(r.war?100:50-r.score),0)/relationships.length;
  const offsetDays=Math.round(Math.max(-365,Math.min(365,180-tension*4)));
  // Re-evaluated monthly. Once the invasion happens its date is immutable.
  s.timeline.offsetDays=offsetDays;s.timeline.polandAt=HISTORICAL_POLAND+offsetDays*1440;s.timeline.britainAt=HISTORICAL_BRITAIN+offsetDays*1440;
}
