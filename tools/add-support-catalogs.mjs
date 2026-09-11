// Idempotent authoring helper for the basic support construction lines.
import fs from 'node:fs';
for(const [nation,prefix]of Object.entries({GBR:'uk',USA:'us',JPN:'jp',FRA:'fr',ITA:'it',DEU:'de',SOV:'su'})){
 const file='data/playable/'+prefix+'.json',data=JSON.parse(fs.readFileSync(file));
 for(const campaign of Object.values(data.campaigns))for(const year of [1922,1936,1950])for(const type of ['AD','AO']){
  const level=(year-1922)/14,depot=type==='AD',id=prefix+'_'+(depot?'depot':'oiler')+'_'+year;
  const standard=(depot?5500:6500)+level*1000;
  const entry={spec:{id,nation,name:(depot?'Fleet depot':'Fleet oiler')+' · '+year,type,design_year:year,displacement:{standard_tons:standard,full_load_tons:standard+(depot?2500:7000)},propulsion:{speed_kn:14+level*2,range_nm:9000+level*1000},armament:{main_battery:{caliber_mm:100,count:2},torpedo_tubes:{count:0},aa_battery:[{caliber_mm:year===1922?7.7:40,count:year===1922?2:4}]},protection:{belt_mm:0,deck_mm:0},aviation:{aircraft_capacity:0},complement:(depot?300:160)+level*30,cost_gold:(depot?3400:2800)+level*700,treaty_category:'other',sensors:[]},service:'support',buildUntil:year+13,notes:'Provisional '+year+' new-construction '+(depot?'depot with workshops, spare parts and accommodation':'naval fuel oiler')+'. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added.'};
  const index=campaign.classes.findIndex(c=>c.spec.id===id);if(index>=0)campaign.classes[index]=entry;else campaign.classes.push(entry);
 }
 fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
}
console.log('Added dated depot and oiler construction designs for all seven navies in both campaigns. Opening registers preserved.');
