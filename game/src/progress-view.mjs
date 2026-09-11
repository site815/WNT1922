export function dateLabel(day){return new Date(Math.ceil(day)*86400000).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});}
export function timedProgress(s,{end,duration,label='Available again',hint='',datePrefix='',valueText=null}){
 const value=Math.max(0,Math.min(1,1-(end-s.day-(s.fraction||0))/Math.max(1,duration))),escape=v=>String(v).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
 return '<div class="timed-progress action-slot" role="progressbar" tabindex="0" title="'+escape(hint||label+' · '+dateLabel(end))+'" aria-label="'+escape(label+' · '+dateLabel(end))+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.floor(value*100)+'"><div><span>'+label+'</span><b>'+escape(valueText??Math.floor(value*100)+'%')+'</b></div><small>'+escape(datePrefix)+dateLabel(end)+'</small><div class="progress-track"><i style="width:'+value*100+'%"></i></div></div>';
}
export const projectProgress=(s,p)=>timedProgress(s,{end:s.day+p.remaining,duration:p.days,label:'Projected completion'});
export function catalogCountdown(s,year){
 const end=Date.parse(year+'-01-01')/86400000,start=Date.parse(s.campaignId==='campaign_1922'?'1922-02-06':'1936-01-01')/86400000,remaining=Math.max(0,Math.ceil(end-s.day-(s.fraction||0)));
 return timedProgress(s,{end,duration:Math.max(1,end-start),label:'Under development',datePrefix:'Available ',valueText:remaining.toLocaleString('en-US')+' days',hint:'Catalog availability countdown. No ministry funds have been committed. Qualification can be funded from '+dateLabel(end)+'.'});
}
