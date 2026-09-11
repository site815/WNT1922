export const TYPE_ORDER=['CV','BB','BC','CVL','CA','CL','DL','DD','DE','TB','SS','SM','AO','AD','AV','AK'];
export function compositionText(counts,empty='None'){
  return Object.entries(counts||{}).filter(([,n])=>n>0).sort(([a],[b])=>(TYPE_ORDER.indexOf(a)<0?99:TYPE_ORDER.indexOf(a))-(TYPE_ORDER.indexOf(b)<0?99:TYPE_ORDER.indexOf(b))).map(([type,count])=>count+' '+type).join(' · ')||empty;
}
export function resultComposition(result,kind='engaged',empty='None'){
  if(result?.[kind+'Composition'])return compositionText(result[kind+'Composition'],empty);
  const counts={};for(const g of result?.conditions||[]){const type=g.type||'hulls',n=kind==='sunk'?g.sunk:kind==='damaged'?(g.newDamage>0?g.count-g.sunk:0):g.count;counts[type]=(counts[type]||0)+n;}
  return compositionText(counts,empty);
}
