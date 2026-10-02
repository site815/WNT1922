// Standalone setup values never refer to campaign fleets or its random stream.
export const TACTICAL_DOCTRINES = ['balanced', 'aggressive', 'cautious'];
export const TACTICAL_FORMATIONS = ['line-ahead', 'line-abreast'];
export const TACTICAL_MAX_SHIPS = 120;
export const tacticalCatalog = (content, bundle = content) => ({...content,
  classes: Object.assign({}, ...Object.values(bundle.campaigns || {}).map(c => c.classes), content.classes)});
export function tacticalModelCampaigns(content, bundle = content) {
  const campaigns=Object.values(bundle.campaigns || {});
  return Object.assign({},...campaigns.map(c=>Object.fromEntries(Object.keys(c.classes).map(id=>[id,c.scenario.id]))),
    Object.fromEntries(Object.keys(content.classes).map(id=>[id,content.scenario.id])));
}

export function initialTacticalSetup(content) {
  const classes = Object.values(content.classes).filter(ship => ship.type === 'BB');
  const first = classes.find(ship => ship.nation === 'GBR') || classes[0] || Object.values(content.classes)[0];
  const second = classes.find(ship => ship.nation === 'DEU') || classes[1] || first;
  return {presetId:'denmark-strait', seed:19410524, doctrineA:'balanced', doctrineB:'balanced',
    formationA:'line-ahead', formationB:'line-ahead', environment:{visibilityKm:28, seaState:3, night:false},
    separationKm:24, shipsA:[{classId:first?.id || '', count:1}], shipsB:[{classId:second?.id || '', count:1}]};
}

export function validateTacticalSetup(setup, content, scenarioIds = ['denmark-strait','midway','north-cape']) {
  const errors = [];
  if (!['custom', ...scenarioIds].includes(setup.presetId)) errors.push('Choose a listed battle or Custom fleets.');
  if (!Number.isInteger(Number(setup.seed)) || Number(setup.seed) < 1 || Number(setup.seed) > 4294967295)
    errors.push('Seed must be a whole number from 1 to 4,294,967,295.');
  for (const side of ['A','B']) {
    if (!TACTICAL_DOCTRINES.includes(setup['doctrine'+side])) errors.push(`Choose a doctrine for Fleet ${side}.`);
    if (!TACTICAL_FORMATIONS.includes(setup['formation'+side])) errors.push(`Choose a formation for Fleet ${side}.`);
    if (setup.presetId !== 'custom') continue;
    const ships = setup['ships'+side];
    if (!Array.isArray(ships) || !ships.length) {errors.push(`Fleet ${side} needs at least one ship.`); continue;}
    let total = 0;
    for (const row of ships) {
      if (!Object.hasOwn(content.classes, row.classId)) errors.push(`Fleet ${side} contains an unavailable class.`);
      if (!Number.isInteger(Number(row.count)) || Number(row.count) < 1 || Number(row.count) > TACTICAL_MAX_SHIPS)
        errors.push(`Fleet ${side} quantities must be whole numbers from 1 to ${TACTICAL_MAX_SHIPS}.`);
      total += Number(row.count);
    }
    if (total > TACTICAL_MAX_SHIPS) errors.push(`Fleet ${side} is limited to ${TACTICAL_MAX_SHIPS} ships.`);
  }
  const environment = setup.environment || {};
  if (!Number.isFinite(Number(environment.visibilityKm)) || Number(environment.visibilityKm) < 2 || Number(environment.visibilityKm) > 60)
    errors.push('Visibility must be from 2 to 60 km.');
  if (!Number.isInteger(Number(environment.seaState)) || Number(environment.seaState) < 0 || Number(environment.seaState) > 9)
    errors.push('Sea state must be a whole number from 0 to 9.');
  if (!Number.isFinite(Number(setup.separationKm)) || Number(setup.separationKm) < 5 || Number(setup.separationKm) > 400)
    errors.push('Initial separation must be from 5 to 400 km.');
  return [...new Set(errors)];
}

export function tacticalSetupConfig(setup, content, scenarioIds) {
  const errors = validateTacticalSetup(setup, content, scenarioIds);
  if (errors.length) throw Error(errors.join(' '));
  return {...structuredClone(setup), seed:Number(setup.seed), separationKm:setup.presetId==='custom'?Number(setup.separationKm):undefined,
    environment:{visibilityKm:Number(setup.environment.visibilityKm), seaState:Number(setup.environment.seaState), night:!!setup.environment.night},
    shipsA:setup.shipsA.map(row => ({classId:row.classId, count:Number(row.count)})),
    shipsB:setup.shipsB.map(row => ({classId:row.classId, count:Number(row.count)}))};
}
