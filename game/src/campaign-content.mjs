import { evaluateDesign } from './designer.mjs';
export const DEFAULT_CAMPAIGN='in_good_faith_1936';
export const campaignList=bundle=>Object.values(bundle.campaigns||{[DEFAULT_CAMPAIGN]:bundle}).map(c=>c.scenario);
const cache=new WeakMap();
export function contentFor(bundle,stateOrId=DEFAULT_CAMPAIGN){
  bundle=bundle._baseContent||bundle;
  const id=typeof stateOrId==='string'?stateOrId:stateOrId.campaignId||DEFAULT_CAMPAIGN;
  const base=bundle.campaigns?.[id]||(bundle.scenario.id===id||id===DEFAULT_CAMPAIGN?bundle:null);
  if(!base)throw new Error('Unknown campaign.');
  if(typeof stateOrId==='string'||!stateOrId.nations)return base;
  const recipes=Object.entries(stateOrId.nations).flatMap(([nation,n])=>(n.customDesigns||[]).map(r=>[nation,r]));
  if(!recipes.length)return base;
  const key=JSON.stringify(recipes),entries=cache.get(base)||[],old=entries.find(e=>e.key===key);if(old)return old.value;
  const c={...base,classes:{...base.classes},nations:Object.fromEntries(Object.entries(base.nations).map(([k,n])=>[k,{...n,designs:[...n.designs]}]))};
  Object.defineProperty(c,'_baseContent',{value:base});
  for(const [nation,r]of recipes){if(!c.nations[nation]||!/^draft-(JPN|USA|GBR|DEU|FRA|ITA|SOV)-\d+$/.test(r.id)||!r.id.startsWith('draft-'+nation+'-')||c.classes[r.id])throw new Error('Invalid saved design draft.');const result=evaluateDesign(r,nation);if(!result.valid)throw new Error('Invalid saved draft displacement.');c.classes[r.id]=result.ship;c.nations[nation].designs.push(r.id);}
  cache.set(base,[{key,value:c},...entries].slice(0,8));return c;
}
