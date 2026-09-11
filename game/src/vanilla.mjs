const day=iso=>Date.parse(iso+'T00:00:00Z')/86400000;
export function historical1922Decisions(s,c,queue){
  const n=s.nations[s.player];
  if(s.day>=day('1923-09-01')&&!s.completedEvents.includes('kanto-fleet-1923')){
    const japan=s.nations.JPN,amagi=japan.groups.find(g=>g.id==='h-ijn_amagi'&&['building','converting','trials'].includes(g.status));
    if(amagi){amagi.status='scrapped';amagi.sailors=0;amagi.atSea=false;amagi.airWing=[];delete amagi.fleetId;const kaga=japan.groups.find(g=>g.id==='h-ijn_kaga'&&g.status==='reserve');if(kaga){kaga.classId='kaga_cv';kaga.status='converting';kaga.sailors=0;kaga.atSea=false;kaga.progress=.2;kaga.days=1095;kaga.name='Kaga';}}
    s.completedEvents.push('kanto-fleet-1923');
  }
  if(!['DEU','SOV'].includes(s.player))queue(s,'washington-disposal','Washington treaty dispositions','The signed treaty requires disposal of canceled capital ships and permits designated carrier conversions. These opening hulls are listed in your fleet register.',[
    {id:'comply',label:'Carry out the treaty dispositions',detail:'Scrap prohibited construction, convert designated hulls to carriers and keep the treaty in force.',vanilla:'comply'},
    {id:'reject',label:'Reject the dispositions',detail:'Withdraw from the limits: 1,000 gold, 20 influence and 100 industry; relations fall by 8.',gold:1000,influence:20,industry:100,vanilla:'reject'},
  ],{critical:true,kind:'treaty',deadline:day('1922-08-06')*1440,defaultOption:'comply',defaultText:'Carry out the treaty dispositions; designated construction is scrapped or converted.'});
  for(const [key,date,title,body,options]of [
    ['geneva-1927','1927-06-20','The Geneva naval conference','Cruiser limits and parity return to the negotiating table.',[{id:'support',label:'Support verified limits',detail:'12 influence for +5 relations with every government.',influence:12,vanilla:'cooperation'},{id:'wait',label:'Retain the existing estimate',detail:'No immediate resource or diplomatic change.'}]],
    ['london-1930','1930-04-22','The London naval conference','The next decade will depend on escorts, submarines and carrier experience.',[{id:'training',label:'Invest in fleet training',detail:'Fund a training cycle at its current price.',program:'training'},{id:'wait',label:'Keep funds available',detail:'Continue existing construction and policy.'}]],
  ])if(s.day>=day(date))queue(s,key,title,body,options);
  if(s.player==='JPN'&&s.day>=day('1923-09-01')&&!s.completedEvents.includes('kanto-1923')){
    const amagi=n.groups.find(g=>g.id==='h-ijn_amagi'&&g.status==='scrapped');
    queue(s,'kanto-1923','The Great Kantō earthquake',amagi?'Amagi has been wrecked on the slipway. Kaga is substituted as a carrier conversion. Emergency repairs strain naval industry.':'The earthquake has damaged port infrastructure and disrupted naval industry.',[{id:'repair',label:'Fund emergency repair teams',detail:'1,500 gold and 500 industry; gain 2 morale.',gold:1500,industry:500,morale:2},{id:'routine',label:'Use routine repair appropriations',detail:'No extra allocation.'}]);
  }
}
export function apply1922Decision(s,c,choice,id=s.player){
  const n=s.nations[id];
  if(choice==='reject'){n.treatyPolicy='withdraw';for(const r of Object.values(s.relations))if([r.a,r.b].includes(id))r.score=Math.max(-100,r.score-8);return;}
  if(choice==='cooperation'){for(const r of Object.values(s.relations))if([r.a,r.b].includes(id))r.score=Math.min(100,r.score+5);return;}
  if(choice!=='comply')throw new Error('Unknown treaty disposition.');
  const conversion={lexington_cc:'lexington_cv',normandie:'bearn_cv',amagi:'akagi_cv',tosa:'kaga_cv',courageous_llc:'courageous_1922_cv'};
  for(const g of n.groups){
    if(['scrap','canceled','target'].includes(g.treatyFate)&&!['sunk','scrapped'].includes(g.status)){n.industry+=Math.floor(c.classes[g.classId].tons*g.count*.025*g.progress);g.status='scrapped';g.sailors=0;g.atSea=false;g.airWing=[];delete g.fleetId;}
    if(g.treatyFate==='convert_carrier'&&conversion[g.classId]&&g.id!=='h-ijn_kaga'){
      g.classId=conversion[g.classId];g.status='converting';g.sailors=0;g.atSea=false;g.days=1095;g.airWing=[];delete g.fleetId;
    }
    // Kaga is held as a reserve hull until the historical Amagi substitution.
    if(g.id==='h-ijn_kaga'){g.status='reserve';g.health=.5;g.notes='Unfinished treaty hull held for the Amagi carrier substitution.';}
  }
}
export function retireReplacedTreatyHulls(s,c,id){
  if(s.campaignId!=='campaign_1922'||s.nations[id].treatyPolicy!=='disclose')return;
  const n=s.nations[id],replacements=id==='USA'?['h-uss_colorado','h-uss_west_virginia']:id==='GBR'?['h-hms_nelson','h-hms_rodney']:[];
  if(!replacements.length||!replacements.every(key=>n.groups.some(g=>g.id===key&&['active','returning','repair','sunk'].includes(g.status))))return;
  for(const g of n.groups)if(g.treatyFate==='scrap_on_replacement'&&!['scrapped','sunk'].includes(g.status)){n.industry+=Math.floor(c.classes[g.classId].tons*g.count*.025);g.status='scrapped';g.airWing=[];delete g.fleetId;}
}
