import fs from 'node:fs';
const nations={GBR:'uk',USA:'us',JPN:'jp',FRA:'fr',ITA:'it',DEU:'de',SOV:'su'};
const roles={fighter:'Naval fighter',strike:'Carrier strike aircraft',scout:'Observation floatplane'};
const doctrine={GBR:{radius:1.08,strike:1},USA:{radius:1.1,strike:1.1},JPN:{radius:1.16,strike:1},FRA:{radius:1,strike:1.04},ITA:{radius:.9,strike:1.08},DEU:{radius:1.15,strike:1},SOV:{radius:.96,strike:1}};
// A generation is a representative procurement fit, not a claim that a named
// historical aircraft was introduced on every third calendar year.
for(const [id,prefix]of Object.entries(nations)){
 const file='data/playable/'+prefix+'.json',data=JSON.parse(fs.readFileSync(file));
 for(const [campaign,part]of Object.entries(data.campaigns)){
  part.aircraftReference??=structuredClone(part.aircraft);
  if(id==='JPN'&&campaign==='in_good_faith_1936'){
   part.aircraft=structuredClone(part.aircraftReference).map(a=>({...a,basing:{carrier:true,floatplane:/multirole/.test(a.role)||!!a.variants?.floatplane||(a.kits||[]).some(k=>/flt/.test(k)),land:true},catalogKind:'naval'}));
  }else{
   part.aircraft=[];
   for(let year=1921;year<=1950;year+=3){
    if(id==='DEU'&&year<1936)continue;
    for(const [role,title]of Object.entries(roles)){
     const t=year-1921,fighter=role==='fighter',scout=role==='scout';
     const reference=part.aircraftReference.find(a=>a.type_year===year&&(a.role===role||role==='strike'&&/bomber|strike/.test(a.role)||scout&&/patrol|scout/.test(a.role)));
     part.aircraft.push({id:prefix+'_naval_'+role+'_'+year,nation:id,name:reference?.name||id+' '+title.toLowerCase()+' · '+year,type_year:year,role,catalogKind:'naval',generation:year,
      basing:{carrier:!scout,floatplane:scout,land:true},crew:{normal:fighter?1:scout?2:year<1933?2:3},
      cost_gold:Math.round((fighter?30:scout?36:44)+t*(fighter?1.2:1.6)),weights:{empty_kg:Math.round((fighter?1000:scout?1700:1900)+t*(fighter?85:110))},
      performance:{speed_kmh:{cruise:Math.round((fighter?165:145)+t*(fighter?8:6))}},fuel:{combat_radius_km:Math.round((fighter?220:scout?300:280)+t*(fighter?10:scout?15:13)*doctrine[id].radius)},
      notes:'Representative '+year+' '+(campaign==='campaign_1922'?'treaty-era':'national-program')+' procurement fit. Model names retained only when the source availability year matches this generation; otherwise the label is a period role, not a fictional historical aircraft. Performance and costs are provisional. '+(scout?'Catapult/recovered floatplane; cannot land on a carrier deck.':'Carrier-qualified wheeled aircraft; cannot use a battleship floatplane station.')});
    }
   }
  }
  part.armyAircraft=[];
  for(let year=1921;year<=1950;year+=3){if(id==='DEU'&&year<1936)continue;const t=year-1921;
   for(const role of ['patrol','torpedo'])part.armyAircraft.push({id:prefix+'_shore_'+role+'_'+year,nation:id,name:id+' '+(role==='patrol'?(year<1936?'coastal patrol flying boat':'long-range maritime patrol'):(year<1933?'shore torpedo biplane':year<1942?'twin-engine maritime bomber':'long-range maritime strike'))+' · '+year,type_year:year,role:role==='patrol'?'maritime_patrol':'maritime_strike',catalogKind:'government',generation:year,readOnly:true,
    basing:{carrier:false,floatplane:false,land:true,flyingBoat:role==='patrol'&&year<1942},crew:{normal:role==='patrol'?(year<1933?4:7):(year<1933?3:5)},
    cost_gold:0,weights:{empty_kg:Math.round((role==='patrol'?3500:2400)+t*210)},performance:{speed_kmh:{cruise:Math.round((role==='patrol'?145:170)+t*6)}},fuel:{combat_radius_km:Math.round(((role==='patrol'?450:320)+t*(role==='patrol'?35:23))*doctrine[id].radius)},
    notes:'Government-managed shore aviation, outside naval aircraft procurement and naval aviator totals. Representative three-year operational type; national army, air-force or shore-naval service as appropriate. No claim of a verified historical model or squadron establishment. Carrier decks and cruiser catapults cannot operate this type.'});
  }
 }
 fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
}
console.log('Authored three-year naval and passive shore fits; preserved Japan 1936 program.');
