import { normalizeClass } from './catalog.mjs';
export const DESIGN_ROLES={BB:'Battleship',BC:'Battlecruiser',CV:'Carrier',CA:'Heavy cruiser',CL:'Light cruiser',DD:'Destroyer',SS:'Submarine'};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function designLimits(year,role){
  const capital=['BB','BC'].includes(role),carrier=role==='CV',sub=role==='SS';
  return {minTons:capital?16000:carrier?7000:role==='CA'?6500:role==='CL'?3000:sub?400:600,
    maxTons:capital?(year<1930?48000:year<1940?70000:90000):carrier?(year<1930?33000:55000):role==='CA'?18000:role==='CL'?12000:sub?3500:4500,
    maxCaliber:capital?(year<1930?457:508):role==='CA'?254:role==='CL'?155:150,
    maxSpeed:sub?23:capital?34:carrier?35:40,maxAir:carrier?(year<1930?70:120):0};
}
export function evaluateDesign(recipe,nation){
  const {role,year}=recipe;
  if(!DESIGN_ROLES[role]||!Number.isInteger(year)||year<1900||year>7500)throw new Error('Choose a valid role and design year.');
  const limits=designLimits(year,role);
  const bounds={tons:[limits.minTons,limits.maxTons],caliber:[0,limits.maxCaliber],guns:[0,16],torpedoes:[0,24],armor:[0,450],speed:[12,limits.maxSpeed],range:[1000,16000],aircraft:[0,limits.maxAir]};
  for(const [key,[lo,hi]] of Object.entries(bounds))if(!Number.isFinite(recipe[key])||recipe[key]<lo||recipe[key]>hi)throw new Error(key+' must be between '+lo+' and '+hi+'.');
  if(!['tons','guns','torpedoes','armor','aircraft'].every(k=>Number.isInteger(recipe[k])))throw new Error('Use whole numbers for tonnage, weapons, armor and aircraft.');
  if(recipe.guns&&recipe.caliber<75)throw new Error('Choose a gun caliber of at least 75 mm.');
  if(role==='SS'&&(recipe.armor>30||recipe.guns>2))throw new Error('Submarines support at most two deck guns and 30 mm protection.');
  if(typeof recipe.name!=='string'||recipe.name.trim().length<2||recipe.name.length>70)throw new Error('Give the class a name of 2–70 characters.');
  const weaponWeight=recipe.guns*Math.pow(recipe.caliber/100,2.5)*6+recipe.torpedoes*18;
  const machinery=recipe.tons*(.09+Math.pow(recipe.speed/30,3)*.12),armorWeight=recipe.tons*recipe.armor/1600;
  const hullWeight=recipe.tons*.33,airWeight=recipe.aircraft*75,fuelWeight=recipe.tons*recipe.range/85000;
  const used=hullWeight+weaponWeight+machinery+armorWeight+airWeight+fuelWeight;
  const cost=Math.round(recipe.tons*.42+weaponWeight*.8+machinery*.3+airWeight*.3),industry=Math.ceil(recipe.tons);
  const fee=Math.max(200,Math.round(cost*.08));
  const raw={id:recipe.id,nation,name:recipe.name.trim(),type:role,design_year:year,displacement:{standard_tons:recipe.tons},cost_gold:cost,
    treaty_category:['BB','BC'].includes(role)?'capital_ship':role==='CV'?'aircraft_carrier':'other',
    armament:{main_battery:{count:recipe.guns,caliber_mm:recipe.caliber},torpedo_tubes:{count:recipe.torpedoes},aa_battery:[{count:year<1930?2:8,caliber_mm:year<1930?40:25}]},
    protection:{belt_mm:recipe.armor,deck_mm:Math.round(recipe.armor*.3)},propulsion:{speed_kn:recipe.speed,range_nm:recipe.range},
    aviation:{aircraft_capacity:recipe.aircraft},complement:Math.ceil(recipe.tons*(role==='SS'?.045:role==='DD'?.075:.035)+recipe.aircraft*2),
    speed_submerged:role==='SS'?{surfaced_kn:recipe.speed,sprint_kn:year<1930?8:year<1940?9:12}:undefined,
    sensors:year>=1940?['rad-draft','snr-draft']:year>=1930?['snr-draft']:[],
  };
  const ship={...normalizeClass(raw,{}),custom:true,service:'warship',notes:'Ministry design draft. Displacement allocation and cost are provisional naval-architecture estimates.'};
  return {ship,used,free:recipe.tons-used,fee,gold:cost,industry,valid:used<=recipe.tons,limits,weights:{hull:hullWeight,weapons:weaponWeight,machinery,armor:armorWeight,aircraft:airWeight,fuel:fuelWeight}};
}
export function automaticDraft(s,c,role='DD'){
  const year=new Date(s.day*86400000).getUTCFullYear(),n=s.nations[s.player],limits=designLimits(year,role);
  const missions=new Map(n.fleets.map(f=>[f.id,f.mission])),weights={};
  for(const g of n.groups)if(c.classes[g.classId].type===role&&g.count&&missions.has(g.fleetId)&&['active','returning'].includes(g.status)){const mission=missions.get(g.fleetId);weights[mission]=(weights[mission]||0)+g.count;}
  const priority=Object.entries(weights).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0];
  const templates=c.nations[s.player].designs.map(id=>c.classes[id]).filter(cl=>cl.type===role&&cl.year<=year).sort((a,b)=>b.year-a.year),base=templates[0];
  const typical={BB:[35000,356,8,0,280,25,6000,0],BC:[36000,356,8,0,220,30,6500,0],CV:[18000,127,8,0,60,30,7000,year<1930?40:60],CA:[10000,203,8,8,100,32,6500,0],CL:[6500,152,8,8,65,32,5000,0],DD:[1800,127,4,8,10,35,4500,0],SS:[1000,100,1,6,0,18,6000,0]};
  const values=base?[base.tons,base.caliber,base.barrels,base.tubes,base.belt,base.speed,base.range/1.852,base.air]:typical[role];
  const r={role,year,name:c.nations[s.player].name+' '+year+' '+role,tons:Math.round(clamp(values[0],limits.minTons,limits.maxTons)),caliber:clamp(values[1],75,limits.maxCaliber),guns:Math.round(clamp(values[2],0,role==='SS'?2:16)),torpedoes:Math.round(clamp(values[3],0,24)),armor:Math.round(clamp(values[4],0,role==='SS'?30:450)),speed:clamp(values[5],12,limits.maxSpeed),range:Math.round(clamp(values[6]*(priority==='raid'?1.12:1),1000,16000)),aircraft:Math.round(clamp(values[7],0,limits.maxAir))};
  if(priority==='guard'&&role==='DD')r.torpedoes=Math.min(6,r.torpedoes);
  if(priority==='decisive')r.armor=Math.min(role==='SS'?30:450,r.armor+10);
  for(let i=0;i<60&&!evaluateDesign(r,s.player).valid;i++){if(r.tons<limits.maxTons)r.tons=Math.min(limits.maxTons,Math.ceil(r.tons*1.05));else if(r.armor>20)r.armor-=10;else if(r.aircraft>10)r.aircraft-=5;else if(r.guns>2)r.guns--;else r.range=Math.max(1000,r.range-250);}
  return r;
}
export function commissionDraft(s,c,recipe){
  const n=s.nations[s.player],year=new Date(s.day*86400000).getUTCFullYear();n.customDesigns??=[];
  if(n.customDesigns.length>=80)throw new Error('The ministry already has 80 draft classes.');
  if(recipe.year!==year)throw new Error('A new draft must use the current campaign year.');
  const clean=Object.fromEntries(['role','year','name','tons','caliber','guns','torpedoes','armor','speed','range','aircraft'].map(k=>[k,recipe[k]]));
  clean.id='draft-'+s.player+'-'+s.nextId;
  const result=evaluateDesign(clean,s.player);if(!result.valid)throw new Error('The machinery, weapons and protection exceed displacement. Reduce the fit or increase tonnage.');
  if(n.gold<result.fee)throw new Error('Not enough gold for the '+result.fee+' gold drafting fee.');
  n.gold-=result.fee;s.nextId++;n.customDesigns.push(clean);n.unlocked.push(clean.id);return result;
}
