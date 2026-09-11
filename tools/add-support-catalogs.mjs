// Idempotent authoring helper for the basic support construction lines.
import fs from 'node:fs';
for(const [nation,prefix]of Object.entries({GBR:'uk',USA:'us',JPN:'jp',FRA:'fr',ITA:'it',DEU:'de',SOV:'su'})){
 const file='data/playable/'+prefix+'.json',data=JSON.parse(fs.readFileSync(file));
 for(const [campaignId,campaign] of Object.entries(data.campaigns)){
 campaign.classes=campaign.classes.filter(c=>!new RegExp('^'+prefix+'_(depot|oiler)_\\d{4}$').test(c.spec.id));
 for(const c of campaign.classes)if(c.service==='merchant')c.buildable=false;
 if(nation==='JPN'&&campaignId==='in_good_faith_1936'){
  const hybrid=campaign.classes.find(c=>c.spec.id==='maru_depot_t23');
  if(!hybrid)throw Error('Missing Standard Maru tender');
  hybrid.buildable=true;hybrid.supportHybrid=true;hybrid.buildUntil=1951;hybrid.spec.name='Standard Maru fleet tender';
  hybrid.notes='Standard Maru oiler/depot hybrid. Admirals route fuel deliveries to fleets and use its workshops for local supply while stationed in a friendly port. Naval support, separate from merchant GRT.';
  continue;
 }
 for(const year of [1922,1932,1942])for(const type of ['AD','AO']){
  const level=(year-1922)/10,depot=type==='AD',id=prefix+'_'+(depot?'depot':'oiler')+'_'+year;
  const standard=(depot?5500:6500)+level*1000;
  const entry={spec:{id,nation,name:(depot?'Fleet depot':'Fleet oiler')+' · '+year,type,design_year:year,displacement:{standard_tons:standard,full_load_tons:standard+(depot?2500:7000)},propulsion:{speed_kn:14+level*2,range_nm:9000+level*1000},armament:{main_battery:{caliber_mm:100,count:2},torpedo_tubes:{count:0},aa_battery:[{caliber_mm:year===1922?7.7:40,count:year===1922?2:4}]},protection:{belt_mm:0,deck_mm:0},aviation:{aircraft_capacity:0},complement:(depot?300:160)+level*30,cost_gold:(depot?3400:2800)+level*700,treaty_category:'other',sensors:[]},service:'support',buildUntil:year+9,notes:'Provisional '+year+' new-construction '+(depot?'depot with workshops, spare parts and accommodation':'naval fuel oiler')+'. Generic period fit, not a claim of a historical class. Naval support is separate from warship displacement and merchant GRT. No opening hulls are added.'};
  const index=campaign.classes.findIndex(c=>c.spec.id===id);if(index>=0)campaign.classes[index]=entry;else campaign.classes.push(entry);
 }}
 fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
}
console.log('Added dated depot and oiler construction designs for all seven navies in both campaigns. Opening registers preserved.');
