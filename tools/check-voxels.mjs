import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {voxelModelIndex} from '../ui/voxel-models.mjs';
import {recognitionIndex} from '../ui/recognition.mjs';

export async function validateVoxels({root = process.cwd(), catalog} = {}) {
  const assetRoot = await fs.realpath(path.join(root, 'assets/voxels/ships'));
  const read = async relative => {
    assert(typeof relative === 'string' && /^[\w/-]+\.json$/.test(relative) && !relative.split('/').includes('..'), 'Invalid voxel path');
    const absolute = await fs.realpath(path.join(assetRoot, relative));
    const contained = path.relative(assetRoot, absolute);
    assert(contained && !contained.startsWith('..') && !path.isAbsolute(contained), 'Voxel file escapes asset folder');
    return JSON.parse(await fs.readFile(absolute, 'utf8'));
  };
  const index = await read('index.json');
  const files = new Set();
  const pairs = await Promise.all(index.models.map(async entry => {
    assert(!files.has(entry.file), 'Duplicate voxel model file: ' + entry.file);
    files.add(entry.file);
    return [entry.id, await read(entry.file)];
  }));
  const result = voxelModelIndex(index, new Map(pairs));
  const artIndex = JSON.parse(await fs.readFile(path.join(root, 'assets/recognition/index.json')));
  const art = recognitionIndex(await Promise.all(artIndex.registries.map(async file => JSON.parse(await fs.readFile(path.join(root, 'assets/recognition', file))))));
  const classes = new Set();
  let mappings = 0, legacyGroups = 0, parts = 0, maxParts = 0;
  for (const model of result.models.values()) {
    parts += model.parts.length;
    maxParts = Math.max(maxParts, model.parts.length);
    assert.equal(model.units, 'metres', model.id + ' units');
    assert(model.dimensionBasis?.trim() && model.reference?.note?.trim(), model.id + ' provenance');
    assert.equal(model.reference.license, 'Original project artwork');
    assert(model.parts.some(part => part.role === 'hull') && model.parts.some(part => part.role === 'deck'), model.id + ' hull and deck');
    if (model.fallback) continue;
    const reference = art.entries.get(model.reference.recognitionId);
    assert(reference && reference.file === model.reference.file, model.id + ' missing recognition reference');
    assert.equal(reference.configuration, model.reference.configuration, model.id + ' reference configuration changed');
  }
  for (const [campaignId, campaign] of Object.entries(catalog.campaigns)) {
    for (const ship of Object.values(campaign.classes)) {
      const model = result.platforms.get(campaignId + ':' + ship.id) || result.platforms.get(ship.id);
      assert(model && !model.fallback, 'Missing authored voxel model: ' + campaignId + ':' + ship.id);
      assert.equal(model.type, ship.type, 'Wrong voxel ship type: ' + ship.id);
      const reference = art.platforms.get(campaignId + ':ship:' + ship.id) || art.platforms.get('ship:' + ship.id);
      assert.equal(model.reference.recognitionId, reference.entry.id, ship.id + ' wrong campaign reference');
      if (!['CV','CVL','AO'].includes(ship.type)) {
        assert.equal(model.parts.filter(part => part.role === 'main-barrel').length, ship.barrels, ship.id + ' main gun count');
        assert.equal(model.parts.filter(part => part.role === 'main').reduce((n, part) => n + part.barrels, 0), ship.barrels, ship.id + ' mount barrel count');
      }
      if (['CV','CVL'].includes(ship.type)) assert(model.parts.some(part => part.role === 'flight-deck'), ship.id + ' missing carrier deck');
      if (['SS','SM'].includes(ship.type)) assert(model.parts.some(part => part.role === 'conning-tower'), ship.id + ' missing conning tower');
      if (ship.type === 'AO') assert(model.parts.some(part => part.role === 'cargo-tank'), ship.id + ' missing supply equipment');
      mappings++;
      classes.add(ship.id);
    }
    for (const nation of Object.values(campaign.nations)) {
      for (const group of [...(nation.hulls || []), ...(nation.aggregates || []), ...(nation.support || [])]) {
        assert(result.platforms.has(campaignId + ':' + group.class_id) || result.platforms.has(group.class_id), 'Opening hull missing voxel model: ' + group.class_id);
        if (group.legacy) legacyGroups++;
      }
    }
  }
  const pt = result.platforms.get('in_good_faith_1936:ecole_pt32');
  assert.equal(pt.parts.filter(part => part.role === 'torpedo-tube').length, 6, 'École PT needs exactly six torpedo tubes');
  assert(!pt.parts.some(part => part.role === 'main-barrel'), 'École PT has no heavy gun');
  const conversion = result.platforms.get('in_good_faith_1936:courageous_llc');
  const original = result.platforms.get('campaign_1922:courageous_llc');
  assert(conversion.id !== original.id && conversion.type === 'CV' && original.type === 'BC', 'Courageous campaign conversion must use distinct geometry');
  return {models: result.models.size, authoredModels: result.models.size - result.fallbacks.size,
    classTypes: classes.size, campaignMappings: mappings, fallbackTypes: result.fallbacks.size,
    openingLegacyGroups: legacyGroups, parts, maxParts};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const {CATALOG} = await import('../worker/catalog-loader.mjs');
  console.log(JSON.stringify(await validateVoxels({catalog: CATALOG})));
}
