import { MISSIONS } from './missions.mjs';
export const PROFILES = {
  FRA: {name:'France',navy:'Marine Nationale',title:'A fleet between two seas',color:"#b398ee",home:'mediterranean',rival:'ITA',description:'Balance Atlantic commitments with a Mediterranean rival and a growing carrier arm.'},
  ITA: {name:'Italy',navy:'Regia Marina',title:'The central Mediterranean',color:"#73bb86",home:'mediterranean',rival:'FRA',description:'Fast surface forces and nearby bases, constrained by fuel, industry and trained crews.'},
  SOV: {name:'Soviet Union',navy:'Workers and Peasants Red Fleet',title:'Rebuild the fleet',color:"#8b1739",home:'atlantic',rival:'DEU',description:'Rebuild across separated seas, with a small inherited battle line and expanding submarine forces.'},
  JPN: { name: 'Japan', navy: 'Imperial Japanese Navy', title: "As Long As It’s Black", color:"#f27b73", home: 'pacific', rival: 'USA', description: 'One drawing per role. A carrier fleet built around common machinery and a long investment in schools.' },
  USA: { name: 'United States', navy: 'United States Navy', title: 'Five-Term Tillman', color:"#70b9ee", home: 'pacific', rival: 'JPN', description: 'An immense battle line. Each generation demands larger yards, heavier guns and more trained crews.' },
  GBR: { name: 'United Kingdom', navy: 'Royal Navy', title: 'Fisher’s Ghost', color:"#dfbc60", home: 'atlantic', rival: 'DEU', description: 'Fast capital ships and a worldwide commitment. Escort coverage and specialist engineers are scarce.' },
  DEU: { name: 'Germany', navy: 'Kriegsmarine', title: 'Nothing Above Water', color:"#bdc5d0", home: 'atlantic', rival: 'GBR', description: 'An expanding submarine force. Ocean search, qualified crews and distant supply determine its reach.' },
};

export const REGIONS = {
  atlantic: { name: 'North Atlantic', short: 'Atlantic', x: 34, y: 29, distance: 6500 },
  mediterranean: { name: 'Mediterranean', short: 'Mediterranean', x: 50, y: 46, distance: 3500 },
  indian: { name: 'Indian Ocean', short: 'Indian Ocean', x: 66, y: 70, distance: 9500 },
  pacific: { name: 'Western Pacific', short: 'Pacific', x: 85, y: 42, distance: 9000 },
};

export const NATION_ORDER=['GBR','USA','JPN','FRA','ITA','DEU','SOV'];
export const submarineAttack=c=>['SS','SM'].includes(c.type)?(c.tubes||0)*16*(1+(c.submergedSpeed||0)/25):0;
export const PRIORITIES = {
  anchorage:{...MISSIONS.anchorage,supply:.85},
  siege:{...MISSIONS.siege,supply:.8},
  guard: { name: 'Protect trade', description: 'Admirals escort supply routes and avoid unequal battles.', engagement: 0.22, supply: 1.12 },
  presence: { name: 'Forward presence', description: 'Admirals contest sea lanes and intercept comparable forces.', engagement: 0.5, supply: 0.98 },
  raid: { name: 'Disrupt enemy trade', description: 'Submarines and cruisers hunt shipping; heavy ships cover their withdrawal.', engagement: 0.38, supply: 0.88 },
  decisive: { name: 'Seek fleet superiority', description: 'Admirals concentrate fighting ships and accept greater operational risk.', engagement: 0.78, supply: 0.82 },
};

export const TYPES = { BB: 'Battleship', BC: 'Battlecruiser', CV: 'Carrier', CVL: 'Light carrier', CA: 'Heavy cruiser', CL: 'Light cruiser', DD: 'Destroyer', DL: 'Flotilla leader', DE: 'Escort', SS: 'Submarine', SM: 'Submarine', TB: 'Torpedo boat', AM: 'Merchant ship', AK: 'Merchant ship', AO: 'Fleet oiler', AD: 'Depot ship', AV: 'Aviation tender' };
export const SERVICES = {warship:'Warships',support:'Naval support',merchant:'Merchant shipping'};
export const fleetService = c => c.service || (['AK','AM'].includes(c.type)?'merchant':['AO','AD','AV'].includes(c.type)?'support':'warship');

export function normalizeClass(c, equipment, aircraft = []) {
  const component = (code) => equipment[code] || {};
  const battery = (c.batteries || []).find(b => b.role === 'main');
  const gun = battery ? { ...component(battery.component), ...battery.spec } : c.armament?.main_battery || {};
  const caliber = gun.caliber_mm || gun.bore_mm || (gun.caliber_cm || gun.bore_cm || 0) * 10 || (gun.caliber_in || gun.bore_in || 0) * 25.4;
  const barrels = battery ? (battery.mounts || 1) * (battery.barrels_per_mount || gun.barrels || 1) : gun.count || 0;
  const torpedo = (c.batteries || []).find(b => b.role === 'torpedo');
  const torp = component(torpedo?.component);
  const machinery = c.machinery?.fits?.[0] || c.propulsion || {};
  const carrier = ['CV', 'CVL'].includes(c.type);
  const footprint = aircraft.filter(a => a.type_year <= 1936).map(a => a.dimensions?.hangar_footprint_m2).filter(Boolean);
  const air = carrier ? c.aviation?.aircraft_capacity || Math.floor((c.aviation?.hangar_m2 || 0) / (footprint[0] || 60)) : 0;
  const sensors = c.sensors || [];
  const tons = c.displacement?.standard_tons || 0;
  const tubes = torpedo?.tubes || (torpedo?.mounts || 0) * (torpedo?.tubes_per_mount || 1) || c.armament?.torpedo_tubes?.count || 0;
  const aa = (c.batteries || []).filter(b => /aa/.test(b.role)||({...component(b.component),...b.spec}.elevation_deg||0)>=60).reduce((s,b) => s + (b.mounts || 1)*(b.barrels_per_mount || 1), 0) + (c.armament?.aa_battery || []).reduce((s,b) => s+(b.count||0),0);
  return { id: c.id, nation: c.nation, name: c.name, type: c.type, category: c.treaty_category, tons,
    cost: c.cost_gold || Math.round(tons * 0.48), year: c.design_year || c.type_year || 1922,
    durability: c.durability || Math.round(tons / 12), speed: machinery.speed_kn || c.speed_submerged?.surfaced_kn || 12,
    range: machinery.range_km || (machinery.range_nm || 3000) * 1.852,
    shp: machinery.shp || 0, caliber, barrels, tubes, torpedoRange: torp.range_km || 8,
    belt: c.protection?.belt_mm || 0, deck: c.protection?.deck_mm || 0, air, aa, scoutAircraft:carrier?0:c.aviation?.aircraft_capacity||0,
    sonar: sensors.some(s => /snr/.test(s)), radar: sensors.some(s => /rad/.test(s)),
    crew: c.complement || 50, submergedSpeed: c.speed_submerged?.sprint_kn || 0,
    provisioned: (c.provisions || []).filter(p => p.count > p.fitted).length,
    raw: c,
  };
}

export function equipmentIndex(files) {
  const result = {};
  for (const file of files) for (const line of file.lines || []) {
    let spec = { ...line.common };
    for (const gen of line.generations) {
      spec = { ...spec, ...gen.spec };
      result[gen.code] = { ...spec, year: gen.year, name: line.name, family: line.family, interface: line.interface };
    }
  }
  return result;
}
