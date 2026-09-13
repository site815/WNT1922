const views = new Set(['command','land','airwar','yards','aircraft','fleet','programs','diplomacy','economy','reports','review']);
const byKind = {battle:'reports',convoy:'economy',trade:'economy',industry:'yards',navy:'fleet',
  operations:'command',contact:'command',land:'land',air:'airwar',diplomacy:'diplomacy',war:'diplomacy',
  cabinet:'review',personnel:'programs'};

// News carries stable references. If its subject has gone, open its record area.
export function newsDestination(s, notice) {
  if (notice.reportId != null) return {view:'reports',
    ...(s.reports.some(r=>r.id===notice.reportId)?{reportId:notice.reportId}:{})};
  if (notice.frontId) return {view:'land',
    ...(s.world.fronts.some(f=>f.id===notice.frontId)?{kind:'front',id:notice.frontId}:{})};
  if (notice.contactId) return {view:'command',
    ...(s.nations[s.player].contacts.some(c=>c.id===notice.contactId)?{kind:'contact',id:notice.contactId}:{})};
  if (notice.shipId) return {view:'fleet',
    ...(s.nations[s.player].groups.some(g=>g.id===notice.shipId&&g.count)?{shipId:notice.shipId}:{})};
  if (notice.programKey) return {view:'programs',programKey:notice.programKey};
  return {view:views.has(notice.newsView)?notice.newsView:byKind[notice.kind]||'review'};
}
