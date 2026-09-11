// Provisional playtest balance. Ship specifications and authored gold prices live in content.json.
export const ECONOMY = {
  FRA:{goldYear:55000,industryYear:40000,yardYear:65000,crew:30000,crewYear:1500},
  ITA:{goldYear:48000,industryYear:44000,yardYear:65000,crew:28000,crewYear:1400},
  SOV:{goldYear:78000,industryYear:100000,yardYear:140000,crew:48000,crewYear:2400},
  JPN:{goldYear:60000,industryYear:59200,yardYear:148000,crew:42000,crewYear:1800},
  USA:{goldYear:120000,industryYear:110000,yardYear:180000,crew:104000,crewYear:2600},
  GBR:{goldYear:95000,industryYear:54000,yardYear:80000,crew:72000,crewYear:1700},
  DEU:{goldYear:48000,industryYear:78000,yardYear:100000,crew:10000,crewYear:700},
};
export function economyFor(s,id){const e=ECONOMY[id];if(s?.campaignId!=='campaign_1922')return e;const years=Math.max(0,new Date(s.day*86400000).getUTCFullYear()-1922),factor=Math.min(1,(id==='SOV'?.28:.62)+years*(id==='SOV'?.045:.0272));return {...e,goldYear:e.goldYear*factor,industryYear:e.industryYear*factor,yardYear:e.yardYear*factor,crew:e.crew*(id==='SOV'?.28:.8),crewYear:e.crewYear*.8};}
export const AIRCRAFT_YEAR={JPN:1000,USA:1500,GBR:900,DEU:300,FRA:650,ITA:600,SOV:550};
// Includes pilots and the other flying crew of multi-seat aircraft. The opening
// training capacities remain independently expandable; all facilities open at 50%.
export const AVIATORS_YEAR={JPN:400,USA:700,GBR:500,DEU:180,FRA:300,ITA:280,SOV:320};
export const OPENING_AIRCRAFT_FUNDING=.5;
export const PROGRAMS = {
  industry:{name:'Expand naval industry',kind:'Industry',gold:6500,influence:14,industry:2400,days:540,max:9,effect:'+15% industrial income and +15% yard throughput per upgrade.',level:'industry'},
  training:{name:'Fleet training doctrine',kind:'Training',gold:2800,influence:8,industry:500,days:180,max:9,effect:'+9 training, +3 morale (each capped at 100%). Training slowly decays; each doctrine level slows that decay.',level:'training'},
  school:{name:'Expand the naval schools',kind:'Training',gold:5000,influence:16,industry:900,days:730,max:9,effect:'+500 annual sailor training capacity per upgrade. Output follows school funding.',level:'school'},
  pilots:{name:'Expand naval aviation schools',kind:'Training',gold:5200,influence:16,industry:1200,days:540,max:9,effect:'+100 annual naval aviator training capacity per upgrade. Output follows school funding.',level:'pilots'},
  aircraft_factory:{name:'Expand aircraft factories',kind:'Industry',gold:6500,influence:18,industry:2800,days:540,max:9,effect:'+35% of base annual aircraft production capacity per upgrade. Output consumes gold and industry at the selected funding level.',level:'aircraft_factory'},
  logistics:{name:'Supply and maintenance network',kind:'Logistics',gold:4200,influence:12,industry:1600,days:360,max:9,effect:'+8 logistics (capped at 100%), +10% repair rate and +1 monthly convoy-flow recovery per upgrade.',level:'logistics'},
  standardization:{name:'Standardize production',kind:'Skills',gold:5200,influence:20,industry:1900,days:540,max:9,effect:'Each upgrade lowers new ship gold and industry prices by 5%.',level:'standardization'},
  radar:{name:'Fleet radar integration',kind:'Technology',gold:7000,influence:20,industry:2100,days:600,max:9,year:1938,effect:'+8 reconnaissance per hull, +22.2 km search reach, +20% AA and +8% combat effectiveness per upgrade.',level:'radar'},
  asw:{name:'Convoy and ASW development',kind:'Technology',gold:4500,influence:14,industry:1400,days:450,max:9,year:1937,effect:'+40% escort ASW power per upgrade in fleet battles and convoy defense.',level:'asw'},
  aviation:{name:'Carrier air operations doctrine',kind:'Technology',gold:6200,influence:18,industry:2200,days:600,max:9,year:1938,effect:'+18% carrier striking power per upgrade, including air-group conversion.',level:'aviation'},
  gunnery:{name:'Fire-control development',kind:'Technology',gold:5000,influence:16,industry:1700,days:480,max:9,year:1937,effect:'+12% naval gunnery and +6% shore artillery power per upgrade.',level:'gunnery'},
  damage_control:{name:'Damage-control organization',kind:'Training',gold:4600,influence:14,industry:1200,days:360,max:9,effect:'+6% damage resistance and repair rate, plus 1.5 percentage points of sailor rescue chance per upgrade.',level:'damage_control'},
  intelligence:{name:'Naval intelligence coordination',kind:'Government',gold:4400,influence:18,industry:800,days:360,max:9,effect:'Each upgrade improves search coverage by 8% and the chance of receiving signals reports.',level:'intelligence'},
  influence:{name:'Government confidence',kind:'Government',gold:3800,influence:6,industry:400,days:270,max:9,effect:'+1 influence income per month per upgrade, before trade disruption.',level:'influence'},
};
export const RULES={
  relationshipRival:30,relationshipOther:62,relationshipDrift:0.9,relationshipDriftPerYear:0.12,
  relationVisitGain:6,visitCooldownDays:365,battleVariation:0.08,upsetChance:0.002,
  upkeepPerMonth:0.002,influencePerMonth:5,concealGoldPerMonth:700,concealInfluencePerMonth:3,
  industryBonus:0.15,buildDays:{BB:1460,BC:1280,CV:1095,CVL:730,CA:900,CL:730,DD:450,DL:480,DE:365,SS:600,AK:540,TB:365},
};
