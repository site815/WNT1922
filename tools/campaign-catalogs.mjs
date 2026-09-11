// National supplements are data, shared by the build and Markdown catalog export.
import { PROFILES, normalizeClass } from '../game/src/catalog.mjs';
const files={GBR:'uk',USA:'us',JPN:'jp',DEU:'de',FRA:'fr',ITA:'it',SOV:'su'};
const clone=x=>structuredClone(x);
export async function addCampaignCatalogs(content,read){
 const additions=Object.fromEntries(await Promise.all(Object.entries(files).map(async([id,prefix])=>[id,await read('data/playable/'+prefix+'.json')])));
 const scenario=await read('data/scenarios/campaign_1922.json'),goodFaith=await read('data/scenarios/in_good_faith_1936.json');
 const bases=Object.fromEntries(await Promise.all(Object.entries(files).map(async([id,file])=>[id,id==='SOV'?additions[id].historicalBase:await read('data/ships/'+file+'.json')])));
 content.scenario={...content.scenario,id:'in_good_faith_1936',description:goodFaith.meta.description,europeVariationDays:goodFaith.clock.europe_variation_days};
 for(const supplement of Object.values(additions))Object.assign(content.equipment,supplement.equipment);
 const vanilla={version:2,specificationRevision:2,rosterRevision:content.rosterRevision,merchantSource:{title:'Lloyd’s Register 1921–22; Soviet opening estimate explicitly provisional',url:'https://upload.wikimedia.org/wikipedia/commons/c/c0/Casualty_Returns_1922.pdf'},legacySources:[],scenario:{id:'campaign_1922',title:scenario.meta.title,start:scenario.clock.start_date,description:scenario.meta.description,europeVariationDays:scenario.clock.europe_variation_days,events:scenario.events},equipment:content.equipment,nations:{},classes:{}};
 for(const [id,base]of Object.entries(bases)){
  const oob=scenario.order_of_battle[id];if(!oob)throw Error('Missing opening roster for '+id);
  for(const raw of base.classes){vanilla.classes[raw.id]=normalizeClass(raw,vanilla.equipment);if(['FRA','ITA','SOV'].includes(id))content.classes[raw.id]=normalizeClass(raw,content.equipment);}
  const hulls=oob.hulls.map(hid=>{const h=base.hulls.find(h=>h.id===hid);if(!h)throw Error('Missing historical hull '+hid);return {...h,status:h.status==='disarmed'?'reserve':h.status,legacy:true};});
  const aggregates=oob.aggregates.map((g,i)=>({...g,id:'v-'+id+'-'+i,status:g.status||'active',progress:.4,legacy:true}));
  vanilla.nations[id]={...PROFILES[id],nation:id,title:id==='SOV'?'Soviet Russia · rebuilding the Red Fleet':id==='DEU'?'The restricted Reichsmarine':'The Treaty System',description:scenario.country_briefings[id],hulls,aggregates,support:[],designs:base.classes.map(cl=>cl.id),legacyNote:'Opening roster from data/scenarios/campaign_1922.json and national base catalogs. Incomplete hulls remain under construction; see campaign source notes.',state:{}};
  for(const [campaign,c]of [['in_good_faith_1936',content],['campaign_1922',vanilla]]){
   const extra=additions[id].campaigns[campaign];
   if(extra.navy)c.nations[id]={...clone(extra.navy),...PROFILES[id],title:extra.navy.title,description:extra.navy.description};
   const n=c.nations[id];n.merchants=clone(extra.merchants);n.aircraft=clone(extra.aircraft);n.playableSource='data/playable/'+files[id]+'.json';
   for(const {spec,...annotations}of extra.classes){c.classes[spec.id]={...normalizeClass(spec,c.equipment,n.aircraft),...annotations};if(annotations.buildable!==false&&!n.designs.includes(spec.id))n.designs.push(spec.id);}
  }
 }
 return {in_good_faith_1936:content,campaign_1922:vanilla};
}
