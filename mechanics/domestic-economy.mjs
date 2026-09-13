import { ECONOMY } from './economy-rules.mjs';

export function homeEconomy(s,id) {
  const regions = ECONOMY.GDP_HOME_REGIONS[id].map(region => {
    const owner = s?.world?.control?.[region.territory] || id;
    // Friendly liberation gives the home government access; hostile or neutral
    // occupation denies it. Captured output is not transferred to the occupier.
    const accessible = owner === id || !!s?.relations?.[[id,owner].sort().join('-')]?.allied;
    return {...region,owner,accessible};
  });
  const access = Math.max(0,Math.min(1,regions.reduce((sum,r)=>sum+(r.accessible?r.share:0),0)));
  return {access,unavailable:1-access,regions};
}

export const isHomeEconomicRegion = territory =>
  Object.values(ECONOMY.GDP_HOME_REGIONS).some(regions=>regions.some(r=>r.territory===territory));
