// Saved levels are 1–9. Level 1 is the opening capability; bonuses count upgrades.
export const MIN_LEVEL=1,MAX_LEVEL=9;
export const upgradeLevel=(tech,key)=>Math.max(0,Math.min(8,(tech?.[key]??1)-1));
export const openingLevels=programs=>Object.fromEntries(Object.values(programs).filter(p=>p.level).map(p=>[p.level,1]));
