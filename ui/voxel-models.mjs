// Prebuilt, directly editable ship geometry. This module never changes simulation data.
const TYPES = ['BB','BC','CV','CVL','CA','CL','DD','DL','SS','SM','AO','DE','TB','AK'];
const validId = value => typeof value === 'string' && /^[\w-]+$/.test(value);
const modelPath = value => typeof value === 'string' && /^[\w/-]+\.json$/.test(value) && !value.split('/').includes('..');
export function validateVoxelModel(model) {
  if (model?.format !== 1 || !validId(model.id) || !TYPES.includes(model.type) || !model.name?.trim() ||
      !['length','beam','height'].every(key => Number.isFinite(model.dimensions?.[key]) && model.dimensions[key] > 0 && model.dimensions[key] <= 1000) ||
      !Array.isArray(model.parts) || model.parts.length < 3 || model.parts.length > 512)
    throw Error('Invalid voxel ship model: ' + model?.id);
  for (const part of model.parts) {
    if (!['x','y','z','w','d','h'].every(key => Number.isFinite(part[key])) ||
        part.w <= 0 || part.d <= 0 || part.h <= 0 || part.z < 0 ||
        Math.abs(part.x) + part.w / 2 > model.dimensions.length / 2 + .02 ||
        Math.abs(part.y) + part.d / 2 > model.dimensions.beam / 2 + .02 ||
        part.z + part.h > model.dimensions.height + .02 || !/^#[\da-f]{6}$/i.test(part.color) ||
        typeof part.role !== 'string' || !part.role)
      throw Error('Invalid voxel part in ' + model.id + ': ' + part.role);
  }
  return model;
}
export function voxelModelIndex(index, models) {
  if (index?.format !== 1 || !Array.isArray(index.models) || !index.models.length || index.models.length > 1000 || !index.fallbacks)
    throw Error('Unsupported voxel model index.');
  const result = {models: new Map(), platforms: new Map(), fallbacks: new Map()};
  for (const entry of index.models) {
    const model = models.get(entry.id);
    if (!validId(entry.id) || !modelPath(entry.file) || result.models.has(entry.id) || !model || model.id !== entry.id || !Array.isArray(entry.platforms))
      throw Error('Invalid voxel model mapping: ' + entry.id);
    validateVoxelModel(model);
    result.models.set(model.id, model);
    for (const platform of entry.platforms) {
      if (!validId(platform.id) || platform.campaign !== undefined && !validId(platform.campaign)) throw Error('Invalid voxel platform.');
      const key = (platform.campaign ? platform.campaign + ':' : '') + platform.id;
      if (result.platforms.has(key)) throw Error('Duplicate voxel platform: ' + key);
      result.platforms.set(key, model);
    }
  }
  for (const type of TYPES) {
    const model = result.models.get(index.fallbacks[type]);
    if (!model || model.type !== type || !model.fallback) throw Error('Missing voxel fallback: ' + type);
    result.fallbacks.set(type, model);
  }
  return result;
}
let current = null, pending = null;
export async function loadVoxelModels({refresh = false, fetcher = globalThis.fetch} = {}) {
  if (pending) return pending;
  if (current && !refresh) return current;
  pending = (async () => {
    const read = async file => {
      if (!modelPath(file)) throw Error('Invalid voxel model path.');
      const response = await fetcher('/assets/voxels/ships/' + file, {cache: 'no-store'});
      if (!response.ok) throw Error('Voxel ship models are unavailable (' + response.status + ').');
      return response.json();
    };
    const index = await read('index.json');
    if (index?.format !== 1 || !Array.isArray(index.models) || !index.models.length || index.models.length > 1000)
      throw Error('Unsupported voxel model index.');
    const models = new Map();
    let next = 0;
    await Promise.all(Array.from({length: Math.min(8, index.models.length)}, async () => {
      while (next < index.models.length) {
        const entry = index.models[next++];
        if (!validId(entry?.id) || !modelPath(entry?.file)) throw Error('Invalid voxel model entry.');
        models.set(entry.id, await read(entry.file));
      }
    }));
    // Commit atomically: a bad edited file leaves the previous collection usable.
    current = voxelModelIndex(index, models);
    return current;
  })().finally(() => { pending = null; });
  return pending;
}
// Small emergency silhouettes keep hulls visible and selectable during loading.
// The full type fallbacks, like the authored classes, live in editable JSON files.
const emergency = new Map();
function emergencyModel(type) {
  type = TYPES.includes(type) ? type : 'DD';
  if (emergency.has(type)) return emergency.get(type);
  const carrier = ['CV','CVL'].includes(type), submarine = ['SS','SM'].includes(type);
  const length = carrier ? 190 : ['BB','BC'].includes(type) ? 200 : type === 'TB' ? 60 : submarine ? 75 : 110;
  const beam = length * (submarine ? .1 : .13);
  const part = (x,y,z,w,d,h,color,role) => ({x,y,z,w,d,h,color,role});
  const model = {format:1,id:'loading-' + type.toLowerCase(),name:'Generic ' + type + ' silhouette',type,fallback:true,
    dimensions:{length,beam,height:20},parts:[
      part(0,0,0,length*.84,beam,3,'#687c83','hull'),
      part(length*.46,0,0,length*.08,beam*.4,3,'#687c83','bow'),
      part(-length*.46,0,0,length*.08,beam*.65,3,'#687c83','stern'),
      part(0,0,3,length*(carrier?.92:submarine?.18:.28),beam*(carrier?1:.6),carrier?3:7,'#a7ada5',carrier?'flight-deck':'bridge')
    ]};
  emergency.set(type,model);
  return model;
}
export function voxelModelFor(classId, {campaign = '', type = 'DD'} = {}) {
  return current?.platforms.get(campaign + ':' + classId) || current?.platforms.get(classId) ||
    current?.fallbacks.get(type) || current?.fallbacks.get('DD') || emergencyModel(type);
}
